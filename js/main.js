/**
 * main.js — boucle principale, caméra, rendu, HUD D2, menus, boutique, réglages.
 */
'use strict';

/* =========================================================
 * ÉTAT GLOBAL
 * ========================================================= */
const Game = {
  state: 'title', // title | classes | playing | levelup | paused | shop | sanctuary | settings | dead | win
  prevState: 'title',
  time: 0, minute: 0, shake: 0,
  toasts: [],
  rerollsLeft: REROLL_STARTS,
  achvQueue: [],   // hauts faits à vérifier
  redone: false,

  reset(cls) {
    this.time = 0; this.minute = 0; this.shake = 0;
    this.toasts = []; this.rerollsLeft = REROLL_STARTS;
    enemies.length = 0; projectiles.length = 0; zones.length = 0;
    lightning.length = 0; pickups.length = 0; particles.length = 0;
    swingFx.length = 0; traps.length = 0;
    Wave.reset(); Shopkeeper.reset(); Run.reset();
    Player.reset(cls);
  },

  showToast(msg) { this.toasts.push({ msg, t: 0 }); },
  closeLevelUp() {
    this.state = 'playing';
    document.getElementById('levelup-overlay').classList.add('hidden');
  },
  showLevelUp() {
    this.state = 'levelup';
    Sound.play('levelup');
    drawUpgradeCards(document.getElementById('levelup-cards'));
    document.getElementById('reroll-count').textContent = this.rerollsLeft;
    document.getElementById('levelup-overlay').classList.remove('hidden');
  },
  openOverlay(name) {
    this.prevState = this.state;
    this.state = name;
    document.getElementById(name + '-overlay').classList.remove('hidden');
  },
  closeOverlay(name) {
    this.state = this.prevState === name ? 'playing' : this.prevState;
    document.getElementById(name + '-overlay').classList.add('hidden');
  },
};
window.toast = (m) => Game.showToast(m);

/* =========================================================
 * ENTRÉES
 * ========================================================= */
const Keys = { up: false, down: false, left: false, right: false };
const KEY_MAPS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
  KeyZ: 'up', KeyQ: 'left',
};

addEventListener('keydown', (e) => {
  Sound.init();
  if (e.code in KEY_MAPS) { Keys[KEY_MAPS[e.code]] = true; e.preventDefault(); }

  const st = Game.state;

  if (e.code === 'Enter' || e.code === 'Space') {
    if (st === 'title') showClassSelect();
    else if (st === 'dead' || st === 'win') startRun(Player.classId);
  }
  if (e.code === 'Escape') {
    if (st === 'playing') pauseGame();
    else if (st === 'paused') resumeGame();
    else if (st === 'shop') closeShop();
    else if (st === 'sanctuary' || st === 'settings') Game.closeOverlay(st);
    else if (st === 'classes') backToTitle();
  }
  if (st === 'shop' && e.code === 'KeyE') { closeShop(); e.preventDefault(); }
  if (st === 'playing') {
    if (e.code === 'Digit1') Player.cast(0), renderSkillBar();
    if (e.code === 'Digit2') Player.cast(1), renderSkillBar();
    if (e.code === 'Digit3') Player.cast(2), renderSkillBar();
    if (e.code === 'KeyE') tryShopInteract();
  }
});
addEventListener('keyup', (e) => {
  if (e.code in KEY_MAPS) { Keys[KEY_MAPS[e.code]] = false; e.preventDefault(); }
});

function tryShopInteract() {
  if (!Shopkeeper.near()) return;
  openShop();
}

/* =========================================================
 * CANVAS & CAMÉRA
 * ========================================================= */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let VW = 960, VH = 540;
const CAM = { x: 0, y: 0, zoom: 2.2 };

function resizeCanvas() {
  VW = clamp(innerWidth, window.SurvivorMobile?.enabled ? 1 : 480, 1920);
  VH = clamp(innerHeight, window.SurvivorMobile?.enabled ? 1 : 360, 1080);
  canvas.width = VW; canvas.height = VH;
}
addEventListener('resize', resizeCanvas);
resizeCanvas();

/* =========================================================
 * ÉCRANS
 * ========================================================= */
function backToTitle() {
  Game.state = 'title';
  document.getElementById('class-screen').classList.add('hidden');
  document.getElementById('title-screen').classList.remove('hidden');
}

function showClassSelect() {
  Game.state = 'classes';
  document.getElementById('title-screen').classList.add('hidden');
  const box = document.getElementById('class-cards');
  box.innerHTML = '';
  for (const id in CLASSES) {
    const C = CLASSES[id];
    const el = document.createElement('div');
    el.className = 'class-card';
    const png = Sprites.playerSprite(id, 'SE', false);
    const pngSrc = png ? png.src : (ART.player[C.sprite] ? ART.player[C.sprite].S.toDataURL() : '');
    el.innerHTML = `
      <img src="${pngSrc}" alt="${C.name}" />
      <h3>${C.name}</h3><p>${C.desc}</p>
      <div style="font-size:11px; color:#6a5a44; margin-top:8px">
        Sorts : ${(C.skills || []).map(s => SKILLS[s] ? SKILLS[s].name : s).join(', ')}
      </div>`;
    el.onclick = () => startRun(id);
    box.appendChild(el);
  }
  document.getElementById('class-screen').classList.remove('hidden');
}

function startRun(cls) {
  Sound.init();
  Game.reset(cls);
  Game.state = 'playing';
  document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  document.getElementById('hud').classList.remove('hidden');
  renderSkillBar();
  renderWeaponSlots(true);
}

function pauseGame() {
  Game.state = 'paused';
  document.getElementById('pause-overlay').classList.remove('hidden');
}
function resumeGame() {
  Game.state = 'playing';
  document.getElementById('pause-overlay').classList.add('hidden');
}

function statsTable(el) {
  const m = Math.floor(Game.time / 60), s = Math.floor(Game.time % 60);
  el.innerHTML = `
    <tr><td>Temps</td><td>${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</td></tr>
    <tr><td>Héros</td><td>${CLASSES[Player.classId].name}</td></tr>
    <tr><td>Niveau</td><td>${Player.level}</td></tr>
    <tr><td>Monstres tués</td><td>${Player.kills}</td></tr>
    <tr><td>Or ramassé</td><td>${Run.goldEarned}</td></tr>
    <tr><td>Essence trouvée</td><td>${Player.essenceRun}</td></tr>
    <tr><td>Hauts faits totaux</td><td>${Meta.achievements.length}/${Object.keys(ACHIEVEMENTS).length}</td></tr>`;
}

function deathSequence() {
  Game.state = 'dead';
  Sound.play('gameover');
  statsTable(document.getElementById('death-stats'));
  document.getElementById('kill-screen').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
  Meta.save();
}

function winSequence() {
  Game.state = 'win';
  Sound.play('victory');
  statsTable(document.getElementById('win-stats'));
  document.getElementById('win-screen').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
  Meta.save();
}

function shareResult() {
  const m = Math.floor(Game.time / 60), s = Math.floor(Game.time % 60);
  shareToDiscord(
    `⚔ Sanctuary Survivors ⚔\n` +
    `Héros : ${CLASSES[Player.classId].name}\n` +
    `⏱ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} · 💀 ${Player.kills} tués\n` +
    `👑 Niveau ${Player.level} · ✦ ${Meta.essence} essence\n` +
    (Game.state === 'win' ? '🏆 Duriel vaincu !' : '☠ Tué dans la crypte…')
  );
}

/* =========================================================
 * HAUTS FAITS
 * ========================================================= */
const AchvCtx = {
  get kills() { return Player.kills; },
  get time() { return Game.time; },
  get level() { return Player.level; },
  get goldEarned() { return Run.goldEarned; },
  get hurtCount() { return Run.hurtCount; },
  get bossKills() { return Run.bossKills; },
};

function checkAchievements() {
  for (const id in ACHIEVEMENTS) {
    if (Meta.achievements.includes(id)) continue;
    const a = ACHIEVEMENTS[id];
    if (a.check(AchvCtx)) {
      Meta.achievements.push(id);
      Meta.essence += a.reward;
      if (a.spell && !Meta.spells.includes(a.spell)) Meta.spells.push(a.spell);
      Meta.save();
      showAchvPopup(a, a.reward, a.spell);
      Sound.play('achv');
    }
  }
}

function showAchvPopup(a, ess, spell) {
  const pop = document.getElementById('achv-popup');
  pop.querySelector('.achv-name').textContent = a.name;
  pop.querySelector('.achv-desc').textContent =
    a.desc + ` — ✦ +${ess} essence` + (spell ? ` + sort permanent « ${SKILLS[spell].name} »` : '');
  pop.classList.add('show');
  setTimeout(() => pop.classList.remove('show'), 3600);
}

/* =========================================================
 * BOUTIQUE
 * ========================================================= */
function openShop() {
  for (const key of Object.keys(Keys)) Keys[key] = false;
  Game.state = 'shop';
  Sound.play('openShop');
  renderShop();
  document.getElementById('shop-overlay').classList.remove('hidden');
}
function closeShop() {
  for (const key of Object.keys(Keys)) Keys[key] = false;
  Game.state = 'playing';
  Sound.play('closeShop');
  document.getElementById('shop-overlay').classList.add('hidden');
}

function renderShop() {
  document.getElementById('shop-gold').textContent = Player.gold;
  const box = document.getElementById('shop-items');
  box.innerHTML = '';
  for (const it of SHOP_POOL) {
    const row = document.createElement('div');
    row.className = 'shop-item';
    const iconArt = ART.icons[it.icon] || ART.gems.small;
    row.innerHTML = `
      <img src="${iconArt.toDataURL()}" alt="" />
      <div><div class="si-name">${it.name}</div><div class="si-desc">${it.desc}</div></div>
      <div class="si-cost">🪙 ${it.cost}</div>
      <button class="btn small">Acheter</button>`;
    const btn = row.querySelector('button');
    if(it.limit){const remaining=Math.max(0,it.limit-(Player.shopPurchases?.[it.id]||0));btn.textContent=remaining?'Acheter · '+remaining+' restant'+(remaining>1?'s':''):'Épuisé';if(!remaining)btn.disabled=true;row.querySelector('.si-desc').textContent=it.desc+' Limite : '+it.limit+' par descente.';}
    if (Player.gold < it.cost) btn.disabled = true;
    btn.onclick = () => buyShopItem(it);
    box.appendChild(row);
  }
}

function buyShopItem(it) {
  if (Player.gold < it.cost) { Sound.play('deny'); return; }
  Player.gold -= it.cost;
  Sound.play('buy');
  switch (it.id) {
    case 'potionHP': Player.heal(9999); toast('❤ Soin complet !'); break;
    case 'potionMP': Player.mana = Player.manaMax; toast('🧪 Mana plein !'); break;
    case 'weaponUp': {
      const ids = Object.keys(Player.weapons);
      if (!ids.length) break;
      const wid = pick(ids);
      Player.weapons[wid].level = Math.min(WEAPONS[wid].maxLevel, Player.weapons[wid].level + 1);
      toast(`⚒ ${WEAPONS[wid].name} → Nv.${Player.weapons[wid].level}`);
      renderWeaponSlots(true);
      break;
    }
    case 'armorUp': Player.passives.armor = (Player.passives.armor || 0) + 1; toast('🛡 Armure aux enchères !'); break;
    case 'reroll': Game.rerollsLeft++; toast('🎟 +1 relance !'); break;
    case 'magnetNow': magnetAllGems(); toast('🧲 Gemmes attirées !'); break;
    case 'lucky': Player.passives.luck = (Player.passives.luck || 0) + 1; toast('🍀 Chance !'); break;
    case 'maxHP': Player.hpMax += 20; Player.hp += 20; toast('❤ PV max +20'); break;
    case 'essenceDust':
      Meta.essence++; Meta.save(); toast('✦ +1 essence !');
      break;
  }
  renderShop();
}

/* =========================================================
 * SANCTUAIRE (améliorations permanentes)
 * ========================================================= */
function openSanctuary() {
  Game.openOverlay('sanctuary');
  renderSanctuary();
}
function renderSanctuary() {
  document.getElementById('sanct-essence').textContent = Meta.essence;
  const box = document.getElementById('sanct-items');
  box.innerHTML = '';
  for (const id in META_UPGRADES) {
    const u = META_UPGRADES[id];
    const cur = Meta.upgrades[id] || 0;
    const row = document.createElement('div');
    row.className = 'shop-item';
    const costText = cur >= u.maxLvl ? 'MAX' : `✦ ${u.cost}`;
    row.innerHTML = `
      <div style="flex:1">
        <div class="si-name">${u.name} <span style="color:#8d7f6a; font-size:11px">Nv.${cur}/${u.maxLvl}</span></div>
        <div class="si-desc">${u.desc}</div>
      </div>
      <div class="si-cost">${costText}</div>
      <button class="btn small">Acheter</button>`;
    const btn = row.querySelector('button');
    if (cur >= u.maxLvl || Meta.essence < u.cost) btn.disabled = true;
    btn.onclick = () => {
      if (Meta.essence < u.cost || cur >= u.maxLvl) { Sound.play('deny'); return; }
      Meta.essence -= u.cost;
      Meta.upgrades[id] = cur + 1;
      Meta.save();
      Sound.play('buy');
      renderSanctuary();
    };
    box.appendChild(row);
  }
  const spellsEl = document.getElementById('sanct-spells');
  const unlocked = Meta.spells.map(s => SKILLS[s] ? SKILLS[s].name : s);
  spellsEl.textContent = unlocked.length
    ? `Sorts permanents débloqués : ${unlocked.join(', ')} (toutes classes)`
    : 'Sorts permanents : débloque-les via des hauts faits cachés !';
}

/* =========================================================
 * RÉGLAGES
 * ========================================================= */
function openSettings() {
  Game.openOverlay('settings');
  document.getElementById('set-master').value = Settings.master * 100;
  document.getElementById('set-sfx').value = Settings.sfx * 100;
  document.getElementById('set-ui').value = Settings.ui * 100;
  document.getElementById('set-crowd').checked = Settings.crowdDamp;
}
function bindSettings() {
  const sync = () => {
    Settings.master = (+document.getElementById('set-master').value) / 100;
    Settings.sfx = (+document.getElementById('set-sfx').value) / 100;
    Settings.ui = (+document.getElementById('set-ui').value) / 100;
    Settings.crowdDamp = document.getElementById('set-crowd').checked;
    Settings.save();
    Sound.applyVolumes();
  };
  ['set-master', 'set-sfx', 'set-ui', 'set-crowd'].forEach(id => {
    document.getElementById(id).addEventListener('input', sync);
    document.getElementById(id).addEventListener('change', sync);
  });
}

/* =========================================================
 * HUD : barre de sorts, orbes, XP, armes
 * ========================================================= */
function renderSkillBar() {
  const bar = document.getElementById('skill-bar');
  bar.innerHTML = '';
  Player.skills.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'skill-slot';
    const iconArt = ART.skills[s.def.icon] || ART.icons[s.def.icon] || ART.icons.star;
    el.innerHTML = `
      <img src="${iconArt.toDataURL()}" alt="${s.def.name}" />
      <span class="skill-key">${i + 1}</span>
      <div class="skill-cooldown"></div>
      <div class="skill-mana"></div>
      <div class="skill-name"><b>${s.def.name}</b> — ${s.def.mana} mana, ${Math.round(s.def.cd)}s cd<br><small>${s.def.desc}</small></div>`;
    el.dataset.idx = i;
    el.onclick = () => { if (Game.state === 'playing') { Player.cast(i); renderSkillBar(); } };
    bar.appendChild(el);
  });
}

function refreshSkillCooldowns() {
  const slots = document.querySelectorAll('#skill-bar .skill-slot');
  slots.forEach((el, i) => {
    const s = Player.skills[i];
    if (!s) return;
    const cdEl = el.querySelector('.skill-cooldown');
    const manaEl = el.querySelector('.skill-mana');
    const ratio = s.cd > 0 ? s.cd / (s.def.cd * Player.cdrMul) : 0;
    cdEl.style.transform = `scaleY(${clamp(ratio, 0, 1)})`;
    const mRatio = clamp(Player.mana / s.def.mana, 0, 1);
    manaEl.style.width = (mRatio * 100) + '%';
    el.classList.toggle('empty', Player.mana < s.def.mana);
    el.classList.toggle('active', ratio <= 0 && mRatio >= 1);
  });
}

let skillBarDirty = false;

function updateHUD() {
  document.getElementById('hp-fill').style.height = clamp(Player.hp / Player.hpMax, 0, 1) * 100 + '%';
  document.getElementById('hp-label').textContent = Math.ceil(Player.hp);
  document.getElementById('mp-fill').style.height = clamp(Player.mana / Player.manaMax, 0, 1) * 100 + '%';
  document.getElementById('mp-label').textContent = Math.floor(Player.mana);
  document.getElementById('xp-fill').style.width = clamp(Player.xp / Player.xpNext, 0, 1) * 100 + '%';
  document.getElementById('gold-display').textContent = Player.gold;
  document.getElementById('essence-display').textContent = Meta.essence;
  document.getElementById('kills').textContent = `${Player.kills} tués`;
  const m = Math.floor(Game.time / 60), s = Math.floor(Game.time % 60);
  document.getElementById('timer').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  refreshSkillCooldowns();

  const sn = document.getElementById('shop-nearby');
  sn.style.display = Shopkeeper.near() ? 'block' : 'none';
}

const toastsBox = () => document.getElementById('toasts');

function updateToasts(dt) {
  const box = toastsBox();
  for (let i = Game.toasts.length - 1; i >= 0; i--) {
    const t = Game.toasts[i];
    t.t += dt;
    if (t.t > 3.2) { Game.toasts.splice(i, 1); continue; }
    if (!t.el) {
      t.el = document.createElement('div');
      t.el.className = 'toast';
      t.el.textContent = t.msg;
      box.appendChild(t.el);
    }
    t.el.style.opacity = clamp(Math.min(t.t * 3, 3.2 - t.t), 0, 1);
  }
}

function renderWeaponSlots(force) {
  // conservé sous forme de tooltips dans le level-up; ici on met à jour les slots si force
  if (force) skillBarDirty = true;
}

/* =========================================================
 * PROGRESSION
 * ========================================================= */
function checkLevelUp() {
  let leveled = false;
  while (Player.xp >= Player.xpNext) {
    Player.xp -= Player.xpNext;
    Player.level++;
    Player.xpNext = Math.round(XP_TO_LEVEL * Math.pow(1.22, Player.level - 1));
    leveled = true;
    Player.heal(Math.round(Player.hpMax * 0.10));
  }
  if (leveled) Game.showLevelUp();
}

function updateProgress(dt) {
  Game.time += dt;
  Game.minute = Math.floor(Game.time / 60);
  for (const b of BOSSES) {
    if (!Wave.bossSpawned[b.id] && Game.time >= b.at) {
      Wave.bossSpawned[b.id] = true;
      spawnBoss(b);
    }
  }
  if (Game.time >= WIN_TIME) { winSequence(); return; }
  checkLevelUp();
  checkAchievements();
}

/* =========================================================
 * RENDU
 * ========================================================= */
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true; // sprites 48×48 lisses comme D2

  /* ---- Fond : carte de l'acte si dispo, sinon tile procédural ---- */
  const mapImg = currentMapImage();
  const world = currentMapWorld();
  if (mapImg && world) {
    // la carte 1254×1254 est étirée sur le monde 2048×2048
    const scale = world.w / mapImg.width;
    const [mx, my] = w2sStatic(0, 0, world, mapImg, scale);
    ctx.drawImage(mapImg, mx, my, mapImg.width * scale * CAM.zoom, mapImg.height * scale * CAM.zoom);
  } else {
    const fx = -((CAM.x * CAM.zoom) % 512) - 512, fy = -((CAM.y * CAM.zoom) % 512) - 512;
    ctx.imageSmoothingEnabled = false;
    for (let y = fy; y < VH; y += 512) for (let x = fx; x < VW; x += 512) ctx.drawImage(ART.floorCanvas, x, y);
    ctx.imageSmoothingEnabled = true;
  }

  let shakeX = 0, shakeY = 0;
  if (Game.shake > 0) {
    shakeX = rand(-1, 1) * Game.shake * 12;
    shakeY = rand(-1, 1) * Game.shake * 12;
  }
  const w2s = (wx, wy) => [(wx - CAM.x) * CAM.zoom + VW / 2 + shakeX, (wy - CAM.y) * CAM.zoom + VH / 2 + shakeY];

  // bordure du monde visible en mur sombre
  if (world) {
    const [wX, wY] = w2s(0, 0);
    const [wX2, wY2] = w2s(world.w, world.h);
    ctx.strokeStyle = hexToRgba('#000', 0.7);
    ctx.lineWidth = 6;
    ctx.strokeRect(wX, wY, wX2 - wX, wY2 - wY);
  }


  // zones
  for (const z of zones) {
    const [sx, sy] = w2s(z.x, z.y);
    const alpha = clamp(z.life / z.maxLife, 0, 1) * 0.32;
    ctx.fillStyle = hexToRgba(z.color, alpha);
    ctx.beginPath(); ctx.arc(sx, sy, z.r * CAM.zoom, 0, TAU); ctx.fill();
    if (z.once) {
      ctx.strokeStyle = hexToRgba('#f4d476', alpha * 1.4);
      ctx.lineWidth = 2; ctx.stroke();
    }
  }

  // pickup : pickups
  for (const p of pickups) {
    const [sx, sy] = w2s(p.x, p.y);
    const bob = Math.sin(p.t * 4) * 2;
    let img = null, size = 8;
    if (p.type === 'small') { img = ART.gems.small; size = 7; }
    else if (p.type === 'mid') { img = ART.gems.mid; size = 9; }
    else if (p.type === 'big') { img = ART.gems.big; size = 11; }
    else if (p.type === 'giant') { img = ART.gems.giant; size = 14; }
    else if (p.type === 'coin') { img = ART.coin; size = 8; }
    else if (p.type === 'heart') { img = ART.heart; size = 10; }
    else if (p.type === 'magnet') { img = ART.magnet; size = 10; }
    else if (p.type === 'flaskHP') { img = ART.flaskHP; size = 11; }
    else if (p.type === 'flaskMP') { img = ART.flaskMP; size = 11; }
    else if (p.type === 'essenceP') { img = ART.essence; size = 12; }
    else if (p.type === 'chest') { img = ART.chest; size = 20; }
    if (img) {
      const pop = easeOutBack(p.born);
      const sw = size * CAM.zoom / 2 * pop;
      ctx.drawImage(img, sx - sw, sy - sw - bob, sw * 2, sw * 2);
    }
  }

  // boutique errante
  if (Shopkeeper.active) {
    const [sx, sy] = w2s(Shopkeeper.x, Shopkeeper.y);
    const w = ART.shopTent.width * CAM.zoom, h = ART.shopTent.height * CAM.zoom;
    ctx.drawImage(ART.shopTent, sx - w / 2, sy - h, w, h);
    // annece пульсante
    ctx.strokeStyle = hexToRgba('#d9b356', 0.5 + Math.sin(Game.time * 4) * 0.25);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx, sy, 46 * CAM.zoom, 0, TAU); ctx.stroke();
  }

  // aura de givre (visuelle)
  if (Player.slowAuraT > 0) {
    const [sx, sy] = w2s(Player.x, Player.y);
    ctx.strokeStyle = hexToRgba('#5eb3dd', 0.4);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx, sy, 110 * CAM.zoom, 0, TAU); ctx.stroke();
  }

  // ennemis — sprites animés externes si dispo, sinon procédural
  for (const e of enemies) {
    const [sx, sy] = w2s(e.x, e.y);
    const anim = e.bossBossAttackT > 0 ? 'attack' : 'idle';
    let frame = null, procSpr = null;
    if (e.boss) {
      frame = Sprites.bossSprite(e.sprite, anim, Game.time);
      if (!frame) procSpr = getSprite(e.sprite);
    } else {
      frame = Sprites.monsterSprite(e.sprite, anim, Game.time);
      if (!frame) procSpr = getSprite(e.sprite);
    }
    let spr = frame ? frame.img : procSpr;
    if (!spr) continue;
    let w, h;
    if (frame) {
      w = frame.sw * CAM.zoom; h = frame.img.height * CAM.zoom;
    } else {
      w = spr.width * CAM.zoom; h = spr.height * CAM.zoom;
    }
    const px = sx - w / 2, py = sy - h + e.r * CAM.zoom * 0.6;
    if (e.flash > 0) ctx.globalAlpha = 0.8;
    const flip = e.x < Player.x - 1;
    if (flip) {
      ctx.save(); ctx.scale(-1, 1);
      ctx.drawImage(frame ? spr : spr, frame ? -sx - w / 2 : -sx - w / 2, py, w, h);
      ctx.restore();
    } else {
      if (frame) {
        if (frame.sw === spr.width) ctx.drawImage(spr, px, py, w, h);
        else ctx.drawImage(spr, frame.sx, 0, frame.sw, spr.height, px, py, w, h);
      } else ctx.drawImage(spr, px, py, w, h);
    }
    ctx.globalAlpha = 1;

    if ((e.elite || e.boss || e.hp < e.hpMax) && e.hp > 0) {
      const bw = e.boss ? 60 : 20, bh = e.boss ? 6 : 3;
      const bx = sx - bw / 2, by = py - 7;
      ctx.fillStyle = '#1a1512'; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = e.elite ? '#f4d476' : '#a34335';
      ctx.fillRect(bx, by, bw * clamp(e.hp / e.hpMax, 0, 1), bh);
    }
    if (e.freezeT > 0 || (Player.slowAuraT > 0 && dist2(e.x, e.y, Player.x, Player.y) < 110 * 110)) {
      ctx.fillStyle = hexToRgba('#5eb3dd', 0.22);
      ctx.fillRect(px, py, w, h);
    }
  }

  // joueur — 8 directions + pose attack
  {
    const [sx, sy] = w2s(Player.x, Player.y);
    const attackT = Player.attackAnimT > 0;
    const dirKey = Player.facing; // E, NE, N, NW, W, SW, S, SE (8 dirs)
    const spr = Sprites.playerSprite(Player.classId, dirKey, attackT)
      || (ART.player[Player.spriteKey] || ART.player.paladin)[Player.facing === 'W' ? 'E' : Player.facing]
      || ART.player.paladin.E;
    const w = spr.width * CAM.zoom, h = spr.height * CAM.zoom;
    const px = sx - w / 2, py = sy - h + Player.r * CAM.zoom;
    if (Player.invuln > 0 && (Player.invuln * 20) % 2 > 1) ctx.globalAlpha = 0.55;
    ctx.drawImage(spr, px, py, w, h);
    ctx.globalAlpha = 1;
  }

  // projectiles
  for (const p of projectiles) {
    const [sx, sy] = w2s(p.x, p.y);
    const spr = ART.projectiles[p.sprite] || ART.projectiles.bolt;
    const w = spr.width * CAM.zoom * (p.scale || 1), h = spr.height * CAM.zoom * (p.scale || 1);
    ctx.save();
    ctx.translate(sx, sy);
    if (p.sprite === 'hammer' || p.spin) ctx.rotate(p.rot);
    else ctx.rotate(Math.atan2(p.vy, p.vx));
    ctx.drawImage(spr, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // particules
  for (const p of particles) {
    const t = clamp(p.life / p.maxLife, 0, 1);
    const [sx, sy] = w2s(p.x, p.y);
    if (p.kind === 'dmg') {
      ctx.font = `bold ${p.size}px 'Cinzel', serif`;
      ctx.fillStyle = p.color; ctx.globalAlpha = t;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, sx, sy);
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = t; ctx.fillStyle = p.color;
      ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
      ctx.globalAlpha = 1;
    }
  }

  // éclairs
  for (const L of lightning) {
    const [x1, y1] = w2s(L.x1, L.y1), [x2, y2] = w2s(L.x2, L.y2);
    ctx.strokeStyle = hexToRgba('#5eb3dd', clamp(L.life / 0.15, 0, 1));
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1);
    for (let i = 1; i <= 5; i++) {
      const t = i / 5;
      ctx.lineTo(lerp(x1, x2, t) + rand(-8, 8), lerp(y1, y2, t) + rand(-8, 8));
    }
    ctx.stroke();
  }

  // swing arcs
  for (const s of swingFx) {
    const [sx, sy] = w2s(s.x, s.y);
    const prog = s.t / 0.16;
    ctx.save(); ctx.translate(sx, sy);
    ctx.rotate(s.a - 0.9 + prog * 1.8);
    ctx.strokeStyle = hexToRgba('#e8e4da', 1 - prog);
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, s.reach * 0.75 * CAM.zoom, -0.5, 0.5); ctx.stroke();
    ctx.restore();
  }

  // vignette
  const grad = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.36, VW / 2, VH / 2, VH * 0.78);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VW, VH);
}

/* =========================================================
 * BOUCLE
 * ========================================================= */
let lastTime = performance.now();
let fpsTick = null;

function frame(now) {
  requestAnimationFrame(frame);
  const rawDt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!fpsTick) fpsTick = initFpsMeter();
  fpsTick(now);

  if (Game.state === 'playing') {
    const dt = rawDt;

    updateProgress(dt);
    if (Game.state !== 'playing') { draw(); return; }

    // déplacement
    let ix = (Keys.right ? 1 : 0) - (Keys.left ? 1 : 0);
    let iy = (Keys.down ? 1 : 0) - (Keys.up ? 1 : 0);
    if (ix && iy) { ix *= 0.707; iy *= 0.707; }
    Player.x += ix * Player.speed * dt;
    Player.y += iy * Player.speed * dt;
    if (ix !== 0 || iy !== 0) {
      Player.facing = facing8(ix, iy);
    }
    // limites du monde + bords
    const world = currentMapWorld();
    if (world) {
      Player.x = clamp(Player.x, 24, world.w - 24);
      Player.y = clamp(Player.y, 24, world.h - 24);
    }

    Player.update(dt);
    Game.shake = Math.max(0, Game.shake - dt);

    Wave.update(dt);
    Shopkeeper.update(dt);
    updateWeapons(dt);
    updateEnemies(dt);
    updateProjectiles(dt);
    updateZones(dt);
    updatePickups(dt);
    updateTraps(dt);
    updateParticles(dt);
    for (let i = swingFx.length - 1; i >= 0; i--) {
      swingFx[i].t += dt;
      if (swingFx[i].t > 0.16) swingFx.splice(i, 1);
    }
    for (const L of lightning) L.life -= dt;
    for (let i = lightning.length - 1; i >= 0; i--) if (lightning[i].life <= 0) lightning.splice(i, 1);
    updateToasts(dt);

    CAM.x = Player.x; CAM.y = Player.y;
    updateHUD();
  }

  draw();
}

/* =========================================================
 * BOUTONS
 * ========================================================= */
document.getElementById('resume-btn').onclick = resumeGame;
document.getElementById('quit-btn').onclick = () => location.reload();
document.getElementById('retry-btn').onclick = () => showClassSelect();
document.getElementById('retry-btn2').onclick = () => showClassSelect();
document.getElementById('discord-btn').onclick = shareResult;
document.getElementById('discord-btn2').onclick = shareResult;
document.getElementById('reroll-btn').onclick = () => {
  if (Game.rerollsLeft > 0) {
    Game.rerollsLeft--;
    document.getElementById('reroll-count').textContent = Game.rerollsLeft;
    drawUpgradeCards(document.getElementById('levelup-cards'));
    Sound.play('select');
  }
};
document.getElementById('btn-settings').onclick = openSettings;
document.getElementById('btn-settings-menu').onclick = openSettings;
document.getElementById('pause-settings').onclick = openSettings;
document.getElementById('settings-close').onclick = () => Game.closeOverlay('settings');
document.getElementById('shop-close').onclick = closeShop;
document.getElementById('btn-sanctuary-menu').onclick = openSanctuary;
document.getElementById('sanctuary-close').onclick = () => Game.closeOverlay('sanctuary');
document.getElementById('death-sanctuary').onclick = () => {
  Game.state = 'sanctuary';
  document.getElementById('kill-screen').classList.add('hidden');
  openSanctuary();
};
document.getElementById('win-sanctuary').onclick = () => {
  Game.state = 'sanctuary';
  document.getElementById('win-screen').classList.add('hidden');
  openSanctuary();
};
document.getElementById('class-back').onclick = backToTitle;
bindSettings();

/* =========================================================
 * LANCEMENT
 * ========================================================= */
Sprites.load();  // charge assets/ s'ils existent, fallback code sinon
requestAnimationFrame(frame);
