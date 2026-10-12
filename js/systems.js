/**
 * systems.js — réglages persistants (localStorage), mixeur audio anti-overlap,
 * et méta-progression (essence + améliorations permanentes).
 */
'use strict';

/* =========================================================
 * RÉGLAGES (volume, throttle des sons)
 * ========================================================= */
const Settings = {
  master: 0.8,   // 0..1
  sfx: 0.9,      // 0..1  (coups, gemmes, monstres)
  ui: 0.85,      // 0..1  (menus, boutons)
  crowdDamp: true, // réduit les sons de foule (hits/morts répétés)

  key: 'sanct_settings_v1',
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) Object.assign(this, JSON.parse(raw));
    } catch (e) { /* stockage indisponible : valeur par défaut */ }
  },
  save() {
    try { localStorage.setItem(this.key, JSON.stringify({
      master: this.master, sfx: this.sfx, ui: this.ui, crowdDamp: this.crowdDamp,
    })); } catch (e) {}
  },
};
Settings.load();

/* =========================================================
 * MÉTA-PROGRESSION : essence + améliorations permanentes
 * ========================================================= */
const Meta = {
  essence: 0,
  upgrades: {},   // id -> niveau acheté
  spells: [],     // ids des sorts universels débloqués via hauts faits
  achievements: [], // ids débloqués (hauts faits)

  key: 'sanct_meta_v1',
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const d = JSON.parse(raw);
        this.essence = d.essence || 0;
        this.upgrades = d.upgrades || {};
        this.spells = d.spells || [];
        this.achievements = d.achievements || [];
      }
    } catch (e) {}
  },
  save() {
    try { localStorage.setItem(this.key, JSON.stringify({
      essence: this.essence, upgrades: this.upgrades,
      spells: this.spells, achievements: this.achievements,
    })); } catch (e) {}
  },
};
Meta.load();

/* Améliorations permanentes achetables à l'essence (écran Sanctuaire) */
const META_UPGRADES = {
  vital:   { name: 'Vitalité éternelle', desc: '+15% PV max par niveau.',    cost: 3, maxLvl: 5 },
  might:   { name: 'Puissance éternelle', desc: '+8% dégâts par niveau.',     cost: 3, maxLvl: 5 },
  swift:   { name: 'Célérité éternelle', desc: '+4% vitesse par niveau.',    cost: 3, maxLvl: 5 },
  fortune: { name: 'Fortune éternelle',  desc: '+10% or ramassé par niveau.', cost: 3, maxLvl: 5 },
};

function metaBonus(id) {
  const lvl = Meta.upgrades[id] || 0;
  switch (id) {
    case 'vital': return 1 + lvl * 0.15;
    case 'might': return 1 + lvl * 0.08;
    case 'swift': return 1 + lvl * 0.04;
    case 'fortune': return 1 + lvl * 0.10;
  }
  return 1;
}

/* =========================================================
 * MIXEUR AUDIO — synthèse WebAudio + anti-overlap
 * ========================================================= */
const Sound = {
  ctx: null, master: null, sfxBus: null, uiBus: null,
  voices: 0,
  last: {},      // kind -> timestamp de dernière émission
  enabled: true,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.enabled = false; return; }
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.sfxBus = this.ctx.createGain();
    this.uiBus = this.ctx.createGain();
    this.sfxBus.connect(this.master);
    this.uiBus.connect(this.master);
    this.applyVolumes();
  },

  applyVolumes() {
    if (!this.ctx) return;
    this.master.gain.value = Settings.master;
    this.sfxBus.gain.value = Settings.sfx;
    this.uiBus.gain.value = Settings.ui;
  },

  /* fréquences minimales entre deux sons du même type : évite les overlaps déchirants */
  minGap(k) {
    if (k === 'bossRoar') return 1.0;
    if (k === 'levelup' || k === 'victory' || k === 'gameover') return 0.5;
    if (k === 'hit') return Settings.crowdDamp ? 0.16 : 0.06;
    if (k === 'enemyDeath') return Settings.crowdDamp ? 0.22 : 0.09;
    if (k === 'gem') return 0.09;
    if (k === 'coin') return 0.12;
    if (k === 'cast') return 0.10;
    return 0.05;
  },

  play(kind) {
    if (!this.enabled) return;
    if (!this.ctx) { this.init(); if (!this.enabled) return; }
    if (this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (e) {} }

    const now = this.ctx.currentTime;
    const gap = this.minGap(kind);
    if (this.last[kind] && now - this.last[kind] < gap) return;

    // budget global de voix : au-delà, on coupe les sons mineurs
    if (this.voices > 22) {
      if (['hit', 'enemyDeath', 'gem', 'coin', 'trail'].includes(kind)) return;
    }

    this.last[kind] = now;
    const t0 = now;
    const bus = (kind === 'select' || kind === 'heal' || kind === 'chest' ||
                 kind === 'levelup' || kind === 'victory' || kind === 'gameover' ||
                 kind === 'buy' || kind === 'deny' || kind === 'achv')
      ? this.uiBus : this.sfxBus;

    const note = (freq, dur, type = 'square', vol = 0.12, slide = 0, delay = 0) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0 + delay);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + delay + dur);
      g.gain.setValueAtTime(vol, t0 + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + delay + dur);
      o.connect(g); g.connect(bus);
      o.start(t0 + delay); o.stop(t0 + delay + dur + 0.02);
      this.voices++;
      o.onended = () => { this.voices--; };
    };

    switch (kind) {
      case 'hit': note(rand(260, 330), 0.05, 'square', 0.05, -120); break;
      case 'enemyDeath': note(rand(110, 160), 0.14, 'sawtooth', 0.07, -70); break;
      case 'gem': note(720, 0.06, 'triangle', 0.06); break;
      case 'coin': note(1150, 0.05, 'square', 0.045); break;
      case 'heal': note(520, 0.12, 'sine', 0.09); note(780, 0.14, 'sine', 0.07); break;
      case 'magnet': note(400, 0.10, 'sine', 0.07, 300); break;
      case 'essence': note(300, 0.1, 'triangle', 0.08, 260); note(800, 0.18, 'triangle', 0.07, 130); break;
      case 'chest': [523, 659, 784].forEach((f, i) => note(f, 0.12, 'triangle', 0.07, 0, i * 0.08)); break;
      case 'playerHurt': note(150, 0.16, 'sawtooth', 0.10, -80); break;
      case 'bossRoar': note(66, 0.6, 'sawtooth', 0.16, 30); note(100, 0.6, 'square', 0.08, -40); break;
      case 'levelup': [392, 523, 659, 784].forEach((f, i) => note(f, 0.15, 'triangle', 0.08, 0, i * 0.075)); break;
      case 'select': note(700, 0.05, 'triangle', 0.07, 200); break;
      case 'buy': note(880, 0.08, 'triangle', 0.08); note(1175, 0.10, 'triangle', 0.06); break;
      case 'deny': note(160, 0.12, 'square', 0.08, -60); break;
      case 'achv': [660, 880, 1320].forEach((f, i) => note(f, 0.2, 'triangle', 0.08, 0, i * 0.11)); break;
      case 'cast': note(340, 0.10, 'triangle', 0.08, 260); break;
      case 'freeze': note(980, 0.18, 'sine', 0.07, -320); break;
      case 'gameover': [220, 175, 147, 110].forEach((f, i) => note(f, 0.35, 'sawtooth', 0.08, 0, i * 0.24)); break;
      case 'victory': [523, 659, 784, 1047, 1319].forEach((f, i) => note(f, 0.28, 'triangle', 0.08, 0, i * 0.14)); break;
      case 'openShop': note(420, 0.09, 'triangle', 0.07); note(630, 0.12, 'triangle', 0.06); break;
      case 'closeShop': note(630, 0.08, 'triangle', 0.06); note(420, 0.10, 'triangle', 0.05, -100); break;
    }
  },
};

/* Alias conservé pour tous les appels existants Audio2.play(...) */
const Audio2 = Sound;
