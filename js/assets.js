/**
 * assets.js v2 — charge les assets du dossier assets/ (sprites animés, cartes d'actes).
 * Format fourni par le joueur :
 *   assets/sprites/<class>/idle_E.png ... idle_SE.png + attack_E.png ... (8 directions, 48×48)
 *   assets/sprites/<monster>/idle.png, attack.png (bandes horizontales de frames, 32×32/frame)
 *   assets/sprites/boss_<act>/idle.png, attack.png (64×64/frame)
 *   assets/tiles/acte-N-*.png (1254×1254) + cartes.json (monde 2048×2048)
 * Tout est optionnel : fallback procédural si absent.
 */
'use strict';

const DIRS8 = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'];
const PLAYER_CLASSES = ['paladin', 'sorceress', 'amazon', 'necromancer', 'druid', 'barbarian', 'assassin'];
const MONSTER_IDS = {
  zombie: 'zombie', skeleton_warrior: 'skeleton', skeleton_archer: 'skeletonArcher',
  goat_demon: 'goatD', fallen_imp: 'fallen', bat_demon: 'batDemon', fire_hound: 'fireHound',
  ogre: 'ogre', scarab: 'scarab', serpent: 'serpent', wraith: 'wraith',
  bone_mage: 'boneMage', fungus_creature: 'fungus', giant_spider: 'spider', undead_knight: 'undeadKnight',
};
const BOSS_IDS = {
  boss_act1_butcher_demon: 'butcher',
  boss_act2_insect_queen: 'andariel2',
  boss_act3_desert_summoner: 'summoner',
  boss_act4_spider_demon: 'spiderDemon',
  boss_act5_archdemon: 'archdemon',
};

const Sprites = {
  players: {},   // classId -> { idle: {E..SE: img}, attack: {..}, frames: 1 }
  monsters: {},  // enemySpriteKey -> { idle: img, attack: img, frameW, frameCount }
  bosses: {},    // bossKey -> { idle, attack, frameW, frameCount }
  maps: [],      // loaded from cartes.json
  mapImages: {},

  async load() {
    // classes
    await Promise.all(PLAYER_CLASSES.map(c => this.loadPlayer(c)));
    // monstres
    await Promise.all(Object.entries(MONSTER_IDS).map(([dir, id]) => this.loadMonster(dir, id)));
    // bosses
    await Promise.all(Object.entries(BOSS_IDS).map(([dir, id]) => this.loadBoss(dir, id)));
    // cartes
    await this.loadMaps();
    // Cadre HUD image : s'il existe, on l'affiche, sinon fallback bandeau sombre
    const frame = document.getElementById('hud-frame-img');
    if (frame && frame.complete && frame.naturalWidth > 0) {
      frame.classList.add('visible');
    } else {
      document.getElementById('hud-bottom').classList.add('noframe');
    }
  },

  loadPlayer(cls) {
    const out = { idle: {}, attack: {} };
    const jobs = [];
    for (const d of DIRS8) {
      jobs.push(this.img(`sprites/${cls}/idle_${d}.png`).then(i => { if (i) out.idle[d] = i; }));
    }
    for (const d of ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE']) {
      jobs.push(this.img(`sprites/${cls}/attack_${d}.png`).then(i => { if (i) out.attack[d] = i; }));
    }
    return Promise.all(jobs).then(() => {
      if (Object.keys(out.idle).length) this.players[cls] = out;
    });
  },

  loadMonster(dir, id) {
    return Promise.all([
      this.img(`sprites/${dir}/idle.png`),
      this.img(`sprites/${dir}/attack.png`),
    ]).then(([idle, attack]) => {
      if (!idle) return;
      const frameCount = Math.max(1, Math.round(idle.width / idle.height));
      this.monsters[id] = { idle, attack, frameW: idle.height, frameCount };
    });
  },

  loadBoss(dir, id) {
    return Promise.all([
      this.img(`sprites/${dir}/idle.png`),
      this.img(`sprites/${dir}/attack.png`),
    ]).then(([idle, attack]) => {
      if (!idle) return;
      const frameCount = Math.max(1, Math.round(idle.width / idle.height));
      this.bosses[id] = { idle, attack, frameW: idle.height, frameCount };
    });
  },

  loadMaps() {
    return fetch('assets/tiles/cartes.json')
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (!json || !json.maps) return;
        this.maps = json.maps;
        return Promise.all(this.maps.map(m =>
          this.img(`tiles/${m.file}`).then(img => { if (img) this.mapImages[m.file] = img; })
        ));
      })
      .catch(() => {});
  },

  img(path) {
    return new Promise(resolve => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => resolve(null);
      i.src = 'assets/' + path;
    });
  },

  /* ---- helpers d'accès ---- */
  playerSprite(cls, dir, attacking) {
    const p = this.players[cls] || this.players.paladin;
    if (!p) return null;
    const set = attacking && Object.keys(p.attack).length ? p.attack : p.idle;
    return set[dir] || set.E || null;
  },

  monsterSprite(key, anim, t) {
    const m = this.monsters[key];
    if (!m) return null;
    const img = (anim === 'attack' && m.attack) ? m.attack : m.idle;
    if (m.frameCount <= 1) return { img, sx: 0, sw: img.width };
    const fw = m.frameW;
    const fi = Math.floor((t * 6) % m.frameCount); // 6 fps d'animation
    return { img, sx: fi * fw, sw: fw };
  },

  bossSprite(key, anim, t) {
    const b = this.bosses[key];
    if (!b) return null;
    const img = (anim === 'attack' && b.attack) ? b.attack : b.idle;
    if (b.frameCount <= 1) return { img, sx: 0, sw: img.width };
    const fw = b.frameW;
    const fi = Math.floor((t * 5) % b.frameCount);
    return { img, sx: fi * fw, sw: fw };
  },
};

/* Fond d'écran du monde selon l'acte courant */
function currentMapImage() {
  const idx = currentActIndex();
  const m = Sprites.maps[idx];
  return m ? Sprites.mapImages[m.file] : null;
}
function currentMapWorld() {
  const m = Sprites.maps[currentActIndex()];
  return m ? { w: m.suggested_world_size[0], h: m.suggested_world_size[1] } : null;
}
function currentActIndex() {
  if(window.SurvivorActs?.active>=0)return window.SurvivorActs.active;
  return clamp(Math.floor((Game.minute || 0) / 3), 0, Math.max(0, Sprites.maps.length - 1));
}
/* helper pour draw du fond : INLINE (doit pas dépendre du w2s local à draw) */
function w2sStatic(wx, wy) {
  return [(wx - CAM.x) * CAM.zoom + VW / 2, (wy - CAM.y) * CAM.zoom + VH / 2];
}
