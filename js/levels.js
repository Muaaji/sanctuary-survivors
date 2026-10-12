/**
 * levels.js — vagues d'ennemis, boss, logique d'attaque des armes,
 * options d'amélioration (level-up) et application.
 */
'use strict';

/* =========================================================
 * SPAWN DES VAGUES
 * ========================================================= */
const Wave = {
  timer: 0,
  bossSpawned: {},
  minuteConfigs: SPAWN_MINUTES,

  reset() {
    this.timer = 0;
    this.bossSpawned = {};
  },

  update(dt) {
    const cfg = this.minuteConfigs[clamp(Game.minute, 0, this.minuteConfigs.length - 1)];
    this.timer += dt;
    const interval = 1 / cfg.rate;
    while (this.timer > interval) {
      this.timer -= interval;
      this.spawnOne(cfg);
    }
  },

  spawnOne(cfg) {
    if (enemies.length > 180) return; // limite perf & gameplay
    const type = pick(cfg.types);
    const ang = rand(0, TAU);
    // hors écran mais pas trop loin : le zoom ×3 réduit le champ visible (~VH/2/zoom ≈ 250)
    const d = rand(300, 380);
    let x = Player.x + Math.cos(ang) * d;
    let y = Player.y + Math.sin(ang) * d;
    // rester dans le monde borné
    const world = currentMapWorld();
    if (world) {
      x = clamp(x, 30, world.w - 30);
      y = clamp(y, 30, world.h - 30);
    }
    spawnEnemy(type, x, y, { elite: cfg.elite && chance(cfg.elite) });
  },
};

/* =========================================================
 * GESTION DES ARMES : cooldowns, tir
 * ========================================================= */
function updateWeapons(dt) {
  for (const id in Player.weapons) {
    const w = Player.weapons[id];
    const stats = w.def.lvl[w.level - 1];
    const def = w.def;

    // ---- Haches en rotation (dégâts de contact) ----
    if (def.isOrbit) {
      w.orbitAngle += stats.rotspeed * dt;
      if (!w.hitCd) w.hitCd = {};
      for (let i = 0; i < stats.count; i++) {
        if ((w.hitCd[i] || 0) > 0) continue;
        const a = w.orbitAngle + (i * TAU / stats.count);
        const ox = Player.x + Math.cos(a) * stats.radius;
        const oy = Player.y + Math.sin(a) * stats.radius;
        for (const e of enemies) {
          if (e.dead) continue;
          if (dist2(ox, oy, e.x, e.y) < (e.r + 10) ** 2) {
            w.hitCd[i] = 0.25;
            damageEnemy(e, stats.dmg);
          }
        }
      }
      for (const k in w.hitCd) w.hitCd[k] -= dt;
      continue;
    }

    // ---- Aura sacrée : dégâts en continu ----
    if (id === 'holyAura') {
      w.cd -= dt * Player.cdrMul;
      if (w.cd <= 0) {
        w.cd = 0.5;
        spawnZone({
          x: Player.x, y: Player.y, r: stats.radius,
          dmg: stats.dmg, color: '#f4d476', life: 0.3, follow: Player,
        });
      }
      continue;
    }

    // ---- Armes à cooldown ----
    w.cd -= dt * Player.cdrMul;
    if (w.cd > 0) continue;
    w.cd = stats.cd;

    switch (id) {
      case 'shortSword': {
        const n = stats.count || 1;
        const targets = nearestEnemies(n, stats.arc, stats.reach);
        for (const target of targets) {
          const a = angleTo(Player.x, Player.y, target.x, target.y);
          spawnZone({
            x: Player.x + Math.cos(a) * stats.reach / 2,
            y: Player.y + Math.sin(a) * stats.reach / 2,
            r: stats.reach / 2 + 8, dmg: stats.dmg,
            color: '#e0c39a', life: 0.16, once: true,
          });
          swingFx.push({ x: Player.x, y: Player.y, a, reach: stats.reach, t: 0 });
        }
        break;
      }
      case 'fireBolt': {
        const targets = nearestEnemies(stats.count || 1, Infinity, 480);
        for (const target of targets) {
          const a = angleTo(Player.x, Player.y, target.x, target.y);
          spawnProjectile({
            x: Player.x, y: Player.y,
            vx: Math.cos(a) * stats.speed, vy: Math.sin(a) * stats.speed,
            dmg: stats.dmg, r: 3, sprite: 'flame', life: 2.2, trail: true,
          });
        }
        break;
      }
      case 'boneSpear': {
        const targets = nearestEnemies(stats.count || 1, Infinity, 500);
        for (const target of targets) {
          const a = angleTo(Player.x, Player.y, target.x, target.y);
          spawnProjectile({
            x: Player.x, y: Player.y,
            vx: Math.cos(a) * stats.speed, vy: Math.sin(a) * stats.speed,
            dmg: stats.dmg, r: 4, sprite: 'boneSpear', life: 2.5,
            pierce: stats.pierce, rot: a,
          });
        }
        break;
      }
      case 'chainLightning': {
        const targets = nearestEnemies(1, Infinity, stats.range);
        if (targets.length) {
          chainLightningJump(Player.x, Player.y, stats.jumps, stats.range, stats.dmg, new Set());
        }
        break;
      }
      case 'poisonDagger': {
        const targets = nearestEnemies(stats.count || 1, Infinity, 300);
        for (const target of targets) {
          const a = angleTo(Player.x, Player.y, target.x, target.y);
          spawnProjectile({
            x: Player.x, y: Player.y,
            vx: Math.cos(a) * 330, vy: Math.sin(a) * 330,
            dmg: stats.dmg, r: 3, sprite: 'bolt', life: 1.6,
            poison: { dps: stats.dot / stats.dotTime, time: stats.dotTime },
          });
        }
        break;
      }
      case 'fallingSkull': {
        const alive = enemies.filter(e => !e.dead);
        if (alive.length) {
          const target = pick(alive);
          spawnZone({
            x: target.x, y: target.y, r: stats.radius, dmg: stats.dmg,
            color: '#8a4ad0', life: 0.35, once: true,
          });
        }
        break;
      }
    }
  }
}

/* trouver N ennemis les plus proches dans un angle et une portée */
function nearestEnemies(n, arcDeg = Infinity, maxRange = Infinity) {
  const arr = [];
  for (const e of enemies) {
    if (e.dead) continue;
    const d2 = dist2(e.x, e.y, Player.x, Player.y);
    if (d2 > maxRange * maxRange) continue;
    arr.push({ e, d: Math.sqrt(d2), a: angleTo(Player.x, Player.y, e.x, e.y) });
  }
  if (!arr.length) return arr;
  arr.sort((a, b) => a.d - b.d);
  if (isFinite(arcDeg)) {
    const firstA = arr[0].a;
    const half = arcDeg * Math.PI / 360;
    return arr.filter(it => Math.abs(angleDiff(it.a, firstA)) <= half).slice(0, n).map(it => it.e);
  }
  return arr.slice(0, n).map(it => it.e);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  return d;
}

/* =========================================================
 * AMÉLIORATIONS (level-up)
 * ========================================================= */
function buildUpgradeOptions() {
  const options = [];
  for (const id of WEAPON_ORDER) {
    const def = WEAPONS[id];
    const cur = Player.weapons[id];
    if (cur) {
      if (cur.level < def.maxLevel) options.push({
        kind: 'weapon', id, level: cur.level + 1, def,
        label: `${def.name} Nv.${cur.level + 1}`,
      });
    } else if (Object.keys(Player.weapons).length < 6) {
      options.push({
        kind: 'weapon', id, level: 1, def,
        label: def.name + ' (nouveau!)',
      });
    }
  }
  for (const id in PASSIVES) {
    const def = PASSIVES[id];
    const cur = Player.passives[id] || 0;
    if (cur < def.maxLevel) {
      const isNew = cur === 0 && id !== 'healing';
      options.push({
        kind: 'passive', id, level: cur + 1, def,
        label: def.name + (isNew ? ' (nouveau!)' : ` Nv.${cur + 1}`),
      });
    }
  }
  return options;
}

const RARITY_WEIGHTS = [
  { key: 'common', w: 60, cls: '' },
  { key: 'rare',   w: 28, cls: 'rarity-rare' },
  { key: 'epic',   w: 12, cls: 'rarity-epic' },
];

function drawUpgradeCards(containerEl) {
  const all = buildUpgradeOptions();
  if (!all.length) {
    containerEl.innerHTML = '<p style="color:#b9ac8d">Tout est au maximum !</p>';
    return [];
  }
  const picked = [];
  const pool = [...all];
  const want = Math.min(3, pool.length);
  for (let i = 0; i < want; i++) {
    const idx = (Math.random() * pool.length) | 0;
    picked.push(pool.splice(idx, 1)[0]);
  }
  containerEl.innerHTML = '';
  for (const opt of picked) {
    const rar = RARITY_WEIGHTS[weightedPick(RARITY_WEIGHTS.map(r => r.w))];
    const el = document.createElement('div');
    el.className = 'card ' + rar.cls;
    const iconKey = opt.def.icon || opt.def.baseIcon;
    const iconArt = ART.icons[iconKey] || ART.projectiles[iconKey] || ART.gems.small;
    el.innerHTML = `
      <img src="${iconArt.toDataURL()}" alt="" />
      <h3>${opt.label}</h3>
      <p>${opt.kind === 'weapon' ? weaponLvlDesc(opt) : opt.def.desc}</p>
      <span class="lvl-ind">${opt.kind === 'weapon' ? 'Arme' : 'Passif'}</span>
    `;
    el.onclick = () => {
      applyUpgrade(opt);
      Game.closeLevelUp();
    };
    containerEl.appendChild(el);
  }
  return picked;
}

function weightedPick(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function weaponLvlDesc(opt) {
  const def = opt.def;
  const cur = def.lvl[Math.max(0, opt.level - 2)] || def.lvl[0];
  const next = def.lvl[opt.level - 1];
  const parts = [];
  if ((next.dmg || 0) > (cur.dmg || 0) && next.dmg !== cur.dmg) parts.push(`Dégâts ${next.dmg}`);
  if (next.cd < cur.cd) parts.push('Plus rapide');
  if ((next.count || 0) > (cur.count || 0)) parts.push(`+1 ${def.isOrbit ? 'hache' : 'projectile'}`);
  if ((next.pierce || 0) > (cur.pierce || 0)) parts.push('+1 percussion');
  if ((next.radius || 0) > (cur.radius || 0)) parts.push('+rayon');
  if ((next.arc || 0) > (cur.arc || 0)) parts.push('+arc');
  if ((next.jumps || 0) > (cur.jumps || 0)) parts.push('+saut');
  if ((next.reach || 0) > (cur.reach || 0)) parts.push('+portée');
  return parts.join(' · ') || def.desc;
}

function applyUpgrade(opt) {
  if (opt.kind === 'weapon') {
    if (Player.weapons[opt.id]) Player.weapons[opt.id].level = opt.level;
    else Player.gainWeapon(opt.id);
  } else {
    Player.gainPassive(opt.id);
  }
  Audio2.play('select');
  renderWeaponSlots();
}
