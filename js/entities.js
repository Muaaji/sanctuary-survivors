/**
 * entities.js — joueur (classe, mana, sorts), ennemis, projectiles,
 * zones, pickups (petits), particules, boutique errante.
 */
'use strict';

/* =========================================================
 * PIÈGES D'ASSASSIN
 * ========================================================= */
const traps = [];

function updateTraps(dt) {
  for (let i = traps.length - 1; i >= 0; i--) {
    const t = traps[i];
    t.t -= dt; t.tick -= dt;
    if (t.t <= 0) { traps.splice(i, 1); continue; }
    if (t.tick <= 0) {
      t.tick = 0.5;
      spawnZone({ x: t.x, y: t.y, r: 55, dmg: 12, color: '#e05a2b', life: 0.3, once: true });
    }
  }
}

/* =========================================================
 * ÉTAT DE RUN (stats temporaires de la descente)
 * ========================================================= */
const Run = {
  hurtCount: 0, goldEarned: 0, bossKills: {},
  reset() { this.hurtCount = 0; this.goldEarned = 0; this.bossKills = {}; },
};

/* =========================================================
 * JOUEUR
 * ========================================================= */
const Player = {
  x: 0, y: 0, r: 8, speed: 105,
  facing8: 'S', // direction fine E NE N NW W SW S SE
  attackAnimT: 0,
  classId: 'paladin',
  hp: 100, hpMax: 100,
  mana: 50, manaMax: 50, manaRegen: 3.2, // /s (modifié par classe + Sagesse)
  level: 1, xp: 0, xpNext: XP_TO_LEVEL,
  gold: 0, gems: 0, essenceRun: 0,
  facing: 'E',
  weapons: {}, passives: {},
  kills: 0, invuln: 0,
  skills: [],       // [{ def, cd }] couplé à CLASSES.skills
  slowAuraT: 0,     // pour Givre sacré (paladin)
  boneArmorHP: 0, boneArmorT: 0,
  buffDmgT: 0, buffDmgMul: 1,
  buffHPT: 0, buffManaT: 0,
  whirlwindT: 0, firestormT: 0, lastKillPos: null,

  get spriteKey() { return CLASSES[this.classId].sprite; },

  reset(cls) {
    if (cls) this.classId = cls;
    const C = CLASSES[this.classId];
    this.x = 0; this.y = 0;
    this.facing8 = 'S'; this.attackAnimT = 0;
    this.hpMax = Math.round(100 * C.hpMul * metaBonus('vital'));
    this.hp = this.hpMax;
    this.manaMax = Math.round(50 * C.manaMul * (1 + (this.passives.wisdom || 0)));
    this.mana = this.manaMax;
    this.manaRegen = 3.2 * C.manaMul;
    this.speed = 105 * C.speedMul * metaBonus('swift');
    this.level = 1; this.xp = 0; this.xpNext = XP_TO_LEVEL;
    this.gold = 0; this.gems = 0; this.essenceRun = 0;
    this.weapons = {}; this.passives = {};
    this.kills = 0; this.invuln = 0;
    this.facing = 'E';
    this.skills = (C.skills || []).filter(id => SKILLS[id] || Meta.spells.includes(id.replace('2','')));
    // sorts universels débloqués par hauts faits = jouables pour toutes les classes
    for (const sid of Meta.spells) {
      if (SKILLS[sid] && !this.skills.includes(sid)) this.skills.push(sid);
    }
    this.skills = this.skills.map(id => ({ id, def: SKILLS[id], cd: 0 }));
    this.gainWeapon(C.auto);
  },

  get magicFind() { return 1 + (this.passives.luck || 0) * 0.08; },
  get speedMul() { return 1 + (this.passives.speed || 0) * 0.08; },
  get armorVal() { return (CLASSES[this.classId].armor || 0) + (this.passives.armor || 0); },
  get dmgMul() {
    let mul = (CLASSES[this.classId].dmgMul || 1) * (1 + (this.passives.strength || 0) * 0.10) * metaBonus('might');
    if (this.buffDmgT > 0) mul *= this.buffDmgMul;
    return mul;
  },
  get cdrMul() { return Math.max(0.3, 1 - (this.passives.cooldown || 0) * 0.08); },
  get magnetR() { return 38 * (1 + (this.passives.magnet || 0) * 0.25); },
  get xpBonus() { return 1 + metaBonus('fortune') - 1; }, // × sur l'or uniquement

  gainWeapon(id) {
    const def = WEAPONS[id];
    if (!def) return;
    if (this.weapons[id]) {
      if (this.weapons[id].level < def.maxLevel) this.weapons[id].level++;
      return;
    }
    if (Object.keys(this.weapons).length >= 6) return;
    this.weapons[id] = { def, level: 1, cd: 0, orbitAngle: Math.random() * TAU };
  },

  gainPassive(id) {
    const def = PASSIVES[id];
    if (!def) return;
    const cur = this.passives[id] || 0;
    this.passives[id] = Math.min(def.maxLevel, cur + 1);
    if (id === 'healing') {
      const before = this.hpMax;
      this.hpMax = Math.round(this.hpMax * 1.2);
      this.hp += this.hpMax - before;
    }
    if (id === 'wisdom') {
      this.manaMax = Math.round(50 * CLASSES[this.classId].manaMul * (1 + this.passives.wisdom));
      this.manaRegen = 3.2 * CLASSES[this.classId].manaMul * (1 + this.passives.wisdom * 0.2);
    }
  },

  takeDamage(amount) {
    if (this.invuln > 0) return;
    // Armure d'os : absorbe d'abord
    if (this.boneArmorHP > 0) {
      const absorbed = Math.min(this.boneArmorHP, amount);
      this.boneArmorHP -= absorbed;
      amount -= absorbed;
      if (amount <= 0) { spawnHitParticles(this.x, this.y, '#c9bfa4', 5); return; }
    }
    const dmg = Math.max(1, Math.round(amount - this.armorVal));
    this.hp -= dmg;
    this.invuln = 0.6;
    Run.hurtCount++;
    spawnHitParticles(this.x, this.y, '#7c2823', 10);
    Sound.play('playerHurt');
    if (this.hp <= 0) { this.hp = 0; deathSequence(); }
  },

  heal(a) { this.hp = Math.min(this.hpMax, this.hp + a); },
  gainMana(a) { this.mana = Math.min(this.manaMax, this.mana + a); },

  canCast(slotIdx) {
    const s = this.skills[slotIdx];
    return s && s.cd <= 0 && this.mana >= s.def.mana;
  },

  cast(slotIdx) {
    const s = this.skills[slotIdx];
    if (!s || s.cd > 0 || this.mana < s.def.mana) {
      Sound.play('deny');
      return false;
    }
    this.mana -= s.def.mana;
    s.cd = s.def.cd * this.cdrMul;
    Sound.play('cast');
    castSkill(s.id);
    return true;
  },

  update(dt) {
    this.invuln = Math.max(0, this.invuln - dt);
    this.attackAnimT = Math.max(0, this.attackAnimT - dt);
    this.mana = Math.min(this.manaMax, this.mana + this.manaRegen * dt);
    for (const s of this.skills) s.cd = Math.max(0, s.cd - dt);
    if (this.slowAuraT > 0) this.slowAuraT -= dt;
    if (this.boneArmorT > 0) this.boneArmorT -= dt; else this.boneArmorHP = 0;
    if (this.buffDmgT > 0) this.buffDmgT -= dt;
    if (this.buffHPT > 0) { this.buffHPT -= dt; if (this.buffHPT <= 0 && this.hpMaxBase) { this.hpMax = this.hpMaxBase; this.hp = Math.min(this.hp, this.hpMax); } }
    if (this.buffManaT > 0) this.buffManaT -= dt;
    if (this.whirlwindT > 0) {
      this.whirlwindT -= dt;
      this.orbitFireT = (this.orbitFireT || 0) - dt;
      if (this.orbitFireT <= 0) {
        this.orbitFireT = 0.12;
        const a = (this.whirlAngle = (this.whirlAngle || 0) + 0.9);
        spawnProjectile({
          x: this.x, y: this.y, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240,
          dmg: 14, r: 5, sprite: 'axe', pierce: 9, life: 0.6, spin: 10,
        });
      }
    }
    if (this.firestormT > 0) {
      this.firestormT -= dt;
      this.fireAngle = (this.fireAngle || 0) + dt * 2.4;
      if ((this.fireTick = (this.fireTick || 0) - dt) <= 0) {
        this.fireTick = 0.18;
        spawnZone({ x: this.x + Math.cos(this.fireAngle) * 85, y: this.y + Math.sin(this.fireAngle) * 85, r: 34, dmg: 8, color: '#e05a2b', life: 0.4, once: true });
      }
    }
  },
};

/* =========================================================
 * SORTS — implémentation
 * ========================================================= */
function castSkill(id) {
  switch (id) {
    case 'feuSacré':
      spawnZone({ x: Player.x, y: Player.y, r: 105, dmg: 14, color: '#f0a03c', life: 8, follow: Player });
      spawnZone({ x: Player.x, y: Player.y, r: 108, dmg: 0, color: '#f4d476', life: 8, follow: Player });
      toast('🔥 Feu sacré !');
      break;
    case 'marteauBeni':
      for (let i = 0; i < 4; i++) {
        const a = rand(0, TAU);
        spawnProjectile({
          x: Player.x, y: Player.y,
          vx: Math.cos(a) * 210, vy: Math.sin(a) * 210,
          dmg: 30, r: 6, sprite: 'hammer', pierce: 999, life: 2.2, spin: 8, scale: 1.3,
        });
      }
      break;
    case 'givreSacré': {
      Player.slowAuraT = 6;
      spawnZone({ x: Player.x, y: Player.y, r: 100, dmg: 3, color: '#5eb3dd', life: 6, follow: Player });
      toast('❄ Givre sacré !');
      break;
    }
    case 'firewall': {
      // mur de feu devant le joueur (perpendiculaire à la direction)
      const a = angleTo(0, 0, Player.facing === 'E' ? 1 : -1, 0);
      const fx = Math.cos(Player.facing === 'E' ? 0 : Player.facing === 'W' ? Math.PI : 0);
      const dirA = Player.facing === 'E' ? 0 : Player.facing === 'W' ? Math.PI : Player.facing === 'S' ? Math.PI/2 : -Math.PI/2;
      const cx = Player.x + Math.cos(dirA) * 50, cy = Player.y + Math.sin(dirA) * 50;
      const spread = 1.15;
      for (let i = -2; i <= 2; i++) {
        spawnZone({
          x: cx + Math.cos(dirA + Math.PI/2) * i * 34,
          y: cy + Math.sin(dirA + Math.PI/2) * i * 34,
          r: 30, dmg: 12, color: '#e05a2b', life: 4,
        });
      }
      toast('🔥 Mur de feu !');
      break;
    }
    case 'nova': {
      for (let i = 0; i < 16; i++) {
        const a = i * TAU / 16;
        spawnProjectile({
          x: Player.x, y: Player.y,
          vx: Math.cos(a) * 260, vy: Math.sin(a) * 260,
          dmg: 22, r: 4, sprite: 'bolt', pierce: 99, life: 0.9,
        });
      }
      spawnZone({ x: Player.x, y: Player.y, r: 60, dmg: 10, color: '#7f96e3', life: 0.3 });
      break;
    }
    case 'blizzard': {
      toast('❄ Blizzard !');
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          if (Game.state !== 'playing') return;
          const a = rand(0, TAU), d = rand(30, 230);
          spawnZone({
            x: Player.x + Math.cos(a) * d, y: Player.y + Math.sin(a) * d,
            r: 55, dmg: 26, color: '#5eb3dd', life: 0.5, once: true,
          });
        }, i * 220);
      }
      break;
    }
    case 'multipleShot': {
      const a0 = angleTo(0, 0, 1, 0); // vers l'orientation du joueur
      const dirA = Player.facing === 'E' ? 0 : Player.facing === 'W' ? Math.PI : Player.facing === 'S' ? Math.PI/2 : -Math.PI/2;
      for (let i = -3; i <= 3; i++) {
        const a = dirA + i * 0.16;
        spawnProjectile({
          x: Player.x, y: Player.y,
          vx: Math.cos(a) * 380, vy: Math.sin(a) * 380,
          dmg: 18, r: 3, sprite: 'arrow', life: 1.4, rot: a,
        });
      }
      break;
    }
    case 'guidedArrow': {
      const t = nearestEnemyAny();
      const a = t ? angleTo(Player.x, Player.y, t.x, t.y) : 0;
      spawnProjectile({
        x: Player.x, y: Player.y,
        vx: Math.cos(a) * 260, vy: Math.sin(a) * 260,
        dmg: 40, r: 4, sprite: 'arrow', pierce: 99, life: 3.2, homing: true, rot: a,
        speed: 260, color: '#5eb3dd',
      });
      break;
    }
    case 'lightningFury': {
      const dirA = Player.facing === 'E' ? 0 : Player.facing === 'W' ? Math.PI : Player.facing === 'S' ? Math.PI/2 : -Math.PI/2;
      spawnProjectile({
        x: Player.x, y: Player.y,
        vx: Math.cos(dirA) * 300, vy: Math.sin(dirA) * 300,
        dmg: 20, r: 4, sprite: 'javelin', pierce: 99, life: 2, rot: dirA,
        lightningTrail: true, color: '#5eb3dd',
      });
      break;
    }

    /* ===== NÉCROMANCIEN ===== */
    case 'poisonDagger': {
      const t = nearestEnemyAny(250);
      const a = t ? angleTo(Player.x, Player.y, t.x, t.y) : rand(0, TAU);
      spawnProjectile({
        x: Player.x, y: Player.y,
        vx: Math.cos(a) * 300, vy: Math.sin(a) * 300,
        dmg: 10, r: 3, sprite: 'boneSpear', life: 1.4, poison: { dps: 5, time: 3 },
      });
      break;
    }
    case 'boneArmor':
      Player.boneArmorHP = 60;
      Player.boneArmorT = 8;
      toast('🦴 Armure d\'os ! (absorbe 60 dégâts)');
      break;
    case 'corpseExplosion': {
      if (!Player.lastKillPos) { toast('Aucun cadavre proche…'); break; }
      spawnZone({
        x: Player.lastKillPos.x, y: Player.lastKillPos.y,
        r: 90, dmg: 50, color: '#a34335', life: 0.4, once: true,
      });
      Game.shake = 0.35;
      break;
    }

    /* ===== DRUIDE ===== */
    case 'firestorm': {
      let a0 = 0;
      Player.firestormT = 5;
      toast('🔥 Vortex de feu !');
      break;
    }
    case 'twister': {
      const t = nearestEnemyAny(320);
      const a = t ? angleTo(Player.x, Player.y, t.x, t.y) : rand(0, TAU);
      spawnProjectile({
        x: Player.x, y: Player.y,
        vx: Math.cos(a) * 160, vy: Math.sin(a) * 160,
        dmg: 18, r: 10, sprite: 'flame', life: 2, pierce: 99, spin: 12,
        knockback: 220,
      });
      break;
    }
    case 'oakSage':
      Player.buffDmgT = 10; Player.buffDmgMul = 1.3;
      toast('🌳 Sage de chêne ! +30% dégâts 10s');
      break;

    /* ===== BARBARE ===== */
    case 'warCry':
      spawnZone({ x: Player.x, y: Player.y, r: 140, dmg: 30, color: '#c9a55a', life: 0.35, once: true });
      Game.shake = 0.4;
      Sound.play('bossRoar');
      break;
    case 'whirlwind':
      Player.whirlwindT = 3;
      toast('🌀 Tourbillon !');
      break;
    case 'battleOrder':
      Player.hpMax = Math.round(Player.hpMax * 1.3 / 1.0); // remis à la fin
      Player.hpMaxBase = Player.hpMax;
      Player.buffHPT = 12;
      Player.manaMax = Math.round(Player.manaMax * 1.3);
      Player.buffManaT = 12;
      Player.hp += Player.hpMax * 0.3;
      Player.mana += Player.manaMax * 0.3;
      toast('⚔ Ordre de bataille ! PV/Mana +30% 12s');
      break;

    /* ===== ASSASSIN ===== */
    case 'fireTrap': {
      traps.push({ x: Player.x, y: Player.y, t: 4, tick: 0 });
      toast('🔥 Piège de feu posé (4s)');
      break;
    }
    case 'shockWeb': {
      const dirA = Math.atan2((Keys.down ? 1 : 0) - (Keys.up ? 1 : 0), (Keys.right ? 1 : 0) - (Keys.left ? 1 : 0)) || 0;
      for (let i = -2; i <= 2; i++) {
        const a = dirA + i * 0.3;
        spawnZone({
          x: Player.x + Math.cos(a) * 90, y: Player.y + Math.sin(a) * 90,
          r: 45, dmg: 16, color: '#5eb3dd', life: 3, once: false,
        });
      }
      break;
    }
    case 'dragonFlight': {
      const t = nearestEnemyAny(400);
      if (t) {
        spawnZone({ x: t.x, y: t.y, r: 70, dmg: 40, color: '#c9a55a', life: 0.35, once: true });
        Player.x = t.x; Player.y = t.y;
      } else {
        Player.x += Math.cos(Player.dirA || 0) * 200; Player.y += Math.sin(Player.dirA || 0) * 200;
      }
      Game.shake = 0.3;
      break;
    }
  }
  renderSkillBar();
}

function nearestEnemyAny(maxRange = 700) {
  let best = null, bd = maxRange * maxRange;
  for (const e of enemies) {
    if (e.dead) continue;
    const d2 = dist2(e.x, e.y, Player.x, Player.y);
    if (d2 < bd) { bd = d2; best = e; }
  }
  return best;
}

/* =========================================================
 * ENNEMIS
 * ========================================================= */
const enemies = [];

function spawnEnemy(type, x, y, opts = {}) {
  const base = ENEMY_BASE[type];
  if (!base) return null;
  const mul = MINUTE_SCALING[clamp(Game.minute, 0, MINUTE_SCALING.length - 1)];
  const e = {
    kind: 'enemy', type, x, y, r: base.r,
    hpMax: base.hp * mul * (opts.elite ? 5 : 1), hp: 0,
    speed: base.speed * (opts.elite ? 1.15 : 1),
    dmg: base.dmg * (opts.elite ? 1.6 : 1),
    xp: base.xp * (opts.elite ? 12 : 1),
    sprite: base.sprite,
    name: opts.elite ? base.name + ' élite' : base.name,
    elite: !!opts.elite, flash: 0,
    knock: { x: 0, y: 0 },
    poisonT: 0, poisonDps: 0, freezeT: 0,
    t: rand(0, 10), dead: false,
  };
  e.hp = e.hpMax;
  enemies.push(e);
  return e;
}

function spawnBoss(def) {
  const side = pick(['N', 'S', 'E', 'W']);
  const dist = 340;
  const dir = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[side];
  const b = {
    kind: 'boss', id: def.id,
    x: Player.x + dir[0] * dist, y: Player.y + dir[1] * dist,
    r: def.r,
    hpMax: def.hp * (1 + Game.minute * 0.06), hp: 0,
    speed: def.speed, dmg: def.dmg, xp: def.xp,
    sprite: def.sprite, name: def.name,
    flash: 0, t: 0, dead: false, boss: true,
    knock: { x: 0, y: 0 }, poisonT: 0, poisonDps: 0, freezeT: 0,
  };
  b.hp = b.hpMax;
  enemies.push(b);
  toast(`⚔ ${def.name} t'a trouvé !`);
  Sound.play('bossRoar');
  Game.shake = 0.5;
  return b;
}

function updateEnemies(dt) {
  const frozen = Player.slowAuraT > 0;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.dead) { enemies.splice(i, 1); continue; }

    e.t += dt;
    if (e.flash > 0) e.flash -= dt;
    if (e.freezeT > 0) e.freezeT -= dt;

    if (e.poisonT > 0) {
      e.poisonT -= dt;
      e.hp -= e.poisonDps * dt;
      if (chance(dt * 8)) spawnHitParticles(e.x, e.y - 4, '#2f9157', 1);
    }

    const dx = Player.x - e.x, dy = Player.y - e.y;
    const d = Math.max(0.001, Math.hypot(dx, dy));
    let sp = e.speed;
    if (frozen && d < 110) sp *= 0.45;                 // Givre sacré
    if (e.freezeT > 0) sp *= 0.5;                       // Trait de glace / Blizzard
    e.x += (dx / d) * sp * dt + e.knock.x * dt;
    e.y += (dy / d) * sp * dt + e.knock.y * dt;
    e.knock.x *= 0.86; e.knock.y *= 0.86;

    if (d < e.r + Player.r) {
      Player.takeDamage(e.dmg);
      if (!e.boss) { e.knock.x -= dx / d * 60; e.knock.y -= dy / d * 60; }
    }

    if (e.hp <= 0) { e.dead = true; killEnemy(e); }
  }
}

function killEnemy(e) {
  Player.kills++;
  Player.lastKillPos = { x: e.x, y: e.y };
  spawnHitParticles(e.x, e.y, e.boss ? '#a34335' : pick(['#7c2823', '#4a120e']), e.boss ? 26 : 5);
  Sound.play('enemyDeath');
  dropLoot(e);
  if (e.boss) {
    Game.shake = 0.6;
    Run.bossKills[e.id] = true;
    toast(`☠ ${e.name} est vaincu !`);
    if (e.id === 'duriel') winSequence();
  }
  for (const other of enemies) {
    if (other !== e && !other.dead) {
      const dx = other.x - e.x, dy = other.y - e.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < (e.r + other.r) ** 2 && d2 > 0) {
        const d = Math.sqrt(d2);
        other.knock.x += dx / d * 40; other.knock.y += dy / d * 40;
      }
    }
  }
}

/* =========================================================
 * PROJECTILES
 * ========================================================= */
const projectiles = [];

function spawnProjectile(opts) {
  projectiles.push({
    x: opts.x, y: opts.y,
    vx: opts.vx, vy: opts.vy,
    r: opts.r || 4,
    dmg: opts.dmg,
    pierce: opts.pierce || 0,
    hitSet: new Set(),
    life: opts.life || 3,
    sprite: opts.sprite || 'flame',
    rot: opts.rot || 0,
    spin: opts.spin || 0,
    poison: opts.poison || null,
    trail: opts.trail || null,
    scale: opts.scale || 1,
    homing: opts.homing || false,
    speed: opts.speed || 0,
    lightningTrail: opts.lightningTrail || false,
  });
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life -= dt;
    if (p.homing) {
      const t = nearestEnemyAny();
      if (t) {
        const a = angleTo(p.x, p.y, t.x, t.y);
        p.vx = Math.cos(a) * p.speed; p.vy = Math.sin(a) * p.speed;
      }
      p.rot = Math.atan2(p.vy, p.vx);
    }
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.rot += p.spin * dt;

    if (p.trail) spawnTrailParticle(p, '#e0602b');
    if (p.lightningTrail && chance(0.4)) {
      lightning.push({ x1: p.x, y1: p.y, x2: p.x + rand(-14, 14), y2: p.y + rand(-14, 14), life: 0.12 });
    }

    if (p.life <= 0) { projectiles.splice(i, 1); continue; }

    for (const e of enemies) {
      if (e.dead || p.hitSet.has(e)) continue;
      if (dist2(p.x, p.y, e.x, e.y) < (p.r * p.scale + e.r) ** 2) {
        damageEnemy(e, p.dmg, p.poison);
        p.hitSet.add(e);
        if (p.pierce > 0) p.pierce--;
        else { projectiles.splice(i, 1); break; }
      }
    }
  }
}

/* =========================================================
 * ZONES DE DÉGÂTS
 * ========================================================= */
const zones = [];

function spawnZone(opts) {
  zones.push({
    x: opts.x, y: opts.y, r: opts.r,
    dmg: opts.dmg, color: opts.color || '#a34335',
    life: opts.life || 0.3, maxLife: opts.life || 0.3,
    follow: opts.follow || null,
    hits: new Set(), once: opts.once ?? false,
    poison: opts.poison || null,
  });
}

function updateZones(dt) {
  for (let i = zones.length - 1; i >= 0; i--) {
    const z = zones[i];
    z.life -= dt;
    if (z.follow) { z.x = z.follow.x; z.y = z.follow.y; }
    if (z.life <= 0) { zones.splice(i, 1); continue; }
    for (const e of enemies) {
      if (e.dead || z.hits.has(e)) continue;
      if (dist2(e.x, e.y, z.x, z.y) <= (z.r + e.r) ** 2) {
        damageEnemy(e, z.dmg, z.poison);
        if (z.once) z.hits.add(e);
      }
    }
  }
}

/* =========================================================
 * ÉCLAIRS EN CHAÎNE
 * ========================================================= */
const lightning = [];

function chainLightningJump(x, y, jumps, range, dmg, exclude) {
  let best = null, bestD = range * range;
  for (const e of enemies) {
    if (e.dead || exclude.has(e)) continue;
    const d2 = dist2(e.x, e.y, x, y);
    if (d2 < bestD) { bestD = d2; best = e; }
  }
  if (!best) return;
  exclude.add(best);
  lightning.push({ x1: x, y1: y, x2: best.x, y2: best.y, life: 0.15 });
  damageEnemy(best, dmg);
  if (jumps > 1) chainLightningJump(best.x, best.y, jumps - 1, range, dmg, exclude);
}

/* =========================================================
 * DÉGÂTS
 * ========================================================= */
function damageEnemy(e, dmg, poison = null, freeze = 0) {
  if (e.dead) return;
  const total = dmg * Player.dmgMul;
  e.hp -= total;
  e.flash = 0.09;
  if (poison) { e.poisonT = poison.time; e.poisonDps = poison.dps; }
  if (freeze) e.freezeT = Math.max(e.freezeT || 0, freeze);
  spawnHitParticles(e.x, e.y - 2, '#c9a55a', 3);
  Sound.play('hit');
  spawnDamageNumber(e.x, e.y - e.r - 4, Math.round(total), e.boss);
  if (e.hp <= 0 && !e.dead) { e.dead = true; killEnemy(e); }
}

/* =========================================================
 * PICKUPS
 * ========================================================= */
const pickups = [];

function dropLoot(e) {
  const luck = Player.magicFind;
  if (chance(e.boss ? 1 : 0.028 * luck)) spawnPickupType(e.x, e.y, 'heart');
  if (chance(e.boss ? 1 : 0.02 * luck)) spawnPickupType(e.x, e.y, 'magnet');
  if (chance(e.boss ? 1 : 0.008 * luck)) spawnPickupType(e.x, e.y, 'flaskHP');
  if (chance(e.boss ? 1 : 0.005 * luck)) spawnPickupType(e.x, e.y, 'flaskMP');
  if (chance(e.boss ? 1 : 0.006 * luck)) spawnPickupType(e.x, e.y, 'essenceP');
  if (e.boss) { spawnPickupType(e.x, e.y, 'chest'); spawnPickupType(e.x, e.y, 'essenceP'); }

  const coins = e.boss ? 14 : (e.elite ? 8 : chance(0.14) ? 3 : 0);
  for (let i = 0; i < coins; i++) spawnPickupType(e.x + rand(-10, 10), e.y + rand(-10, 10), 'coin');

  // gemme d'XP proportionnelle (plus petite désormais)
  const xp = e.xp;
  const kind = xp >= 100 ? 'giant' : xp >= 40 ? 'big' : xp >= 12 ? 'mid' : 'small';
  pickups.push(mkPickup(e.x, e.y, kind, { gemValue: xp }));
}

function spawnPickupType(x, y, type, extra = {}) {
  pickups.push(mkPickup(x, y, type, extra));
}

function mkPickup(x, y, type, extra = {}) {
  return {
    type, x, y, r: 4,
    vx: rand(-18, 18), vy: rand(-18, 18),
    born: 0, t: 0,
    gemValue: extra.gemValue || 0,
  };
}

function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.t += dt; p.born = Math.min(1, p.born + dt * 3);
    p.vx *= 0.9; p.vy *= 0.9;
    p.x += p.vx * dt; p.y += p.vy * dt;

    const d2P = dist2(p.x, p.y, Player.x, Player.y);
    const magR = Player.magnetR;
    if (d2P < magR * magR) {
      const d = Math.sqrt(d2P) || 1;
      p.x += (Player.x - p.x) / d * 175 * dt;
      p.y += (Player.y - p.y) / d * 175 * dt;
    }

    if (d2P < (Player.r + p.r) ** 2) {
      collectPickup(p);
      pickups.splice(i, 1);
    }
  }
}

function collectPickup(p) {
  switch (p.type) {
    case 'small': Player.xp += 1; Player.gems++; Sound.play('gem'); break;
    case 'mid':   Player.xp += 3; Player.gems++; Sound.play('gem'); break;
    case 'big':   Player.xp += 10; Player.gems++; Sound.play('gem'); break;
    case 'giant': Player.xp += p.gemValue || 60; Player.gems++; Sound.play('gem'); break;
    case 'coin': {
      const g = Math.round(randInt(4, 9) * metaBonus('fortune'));
      Player.gold += g; Run.goldEarned += g; Sound.play('coin'); break;
    }
    case 'heart': Player.heal(30); Sound.play('heal'); toast('❤ +30 PV'); break;
    case 'magnet': magnetAllGems(); Sound.play('magnet'); break;
    case 'flaskHP': Player.heal(9999); Sound.play('heal'); toast('🧪 Soin complet !'); break;
    case 'flaskMP': Player.mana = Player.manaMax; Sound.play('cast'); toast('🧪 Mana plein !'); break;
    case 'essenceP':
      Player.essenceRun++; Meta.essence++; Meta.save();
      Sound.play('essence'); toast('✦ +1 essence !');
      break;
    case 'chest':
      Player.gold += 50; Run.goldEarned += 50;
      gainRandomUpgrade();
      Sound.play('chest');
      toast('🎁 Coffre ! Amélioration gratuite !');
      break;
  }
}

function magnetAllGems() {
  for (const p of pickups) {
    if (['small', 'mid', 'big', 'giant'].includes(p.type)) {
      p.x = Player.x + rand(-24, 24);
      p.y = Player.y + rand(-24, 24);
    }
  }
}

function gainRandomUpgrade() {
  const options = buildUpgradeOptions();
  if (!options.length) { Player.gold += 100; toast('🎁 Tout est maxé → +100 or !'); return; }
  applyUpgrade(pick(options));
}

/* =========================================================
 * BOUTIQUE ERRANTE (entité monde)
 * ========================================================= */
const Shopkeeper = {
  active: false, x: 0, y: 0, tLeft: 0,
  timer: 30, // première boutique à 30 s
  reset() { this.active = false; this.timer = 30; this.tLeft = 0; },
  update(dt) {
    if (this.active) {
      this.tLeft -= dt;
      if (this.tLeft <= 0) { this.active = false; this.timer = SHOP_INTERVAL; toast('Le commerçant s\'en va…'); }
    } else {
      this.timer -= dt;
      if (this.timer <= 0) this.appear();
    }
  },
  appear() {
    const a = rand(0, TAU);
    this.x = Player.x + Math.cos(a) * SHOP_DISTANCE;
    this.y = Player.y + Math.sin(a) * SHOP_DISTANCE;
    this.tLeft = SHOP_DURATION;
    this.active = true;
    toast('🛒 Un commerçant errant est tout proche !');
  },
  near() {
    return this.active && dist2(Player.x, Player.y, this.x, this.y) < 48 * 48;
  },
};

/* =========================================================
 * PARTICULES
 * ========================================================= */
const particles = [];
const swingFx = [];

function spawnHitParticles(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x: x + rand(-4, 4), y: y + rand(-4, 4),
      vx: rand(-90, 90), vy: rand(-130, 20),
      life: rand(0.25, 0.5), maxLife: 0.5,
      color, size: rand(1.5, 3.5), gravity: 300,
    });
  }
}

function spawnTrailParticle(p, color) {
  if (chance(0.55)) return;
  particles.push({
    x: p.x, y: p.y, vx: rand(-15, 15), vy: rand(-15, 15),
    life: 0.3, maxLife: 0.3, color: color || '#e0602b', size: rand(2, 4), gravity: 0,
  });
}

function spawnDamageNumber(x, y, val, big = false) {
  particles.push({
    kind: 'dmg', x, y, vy: -38, vx: rand(-10, 10),
    life: 0.7, maxLife: 0.7, text: String(val),
    color: big ? '#f4d476' : '#e8ddca', size: big ? 14 : 11, gravity: 0,
  });
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    p.vy += (p.gravity || 0) * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
}
