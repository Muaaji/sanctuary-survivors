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
 * MIXEUR AUDIO — Kenney CC0 sampled foley, bounded voices
 * ========================================================= */
const Sound = {
  ctx:null,master:null,sfxBus:null,uiBus:null,voices:0,last:{},enabled:true,
  buffers:new Map(),pending:new Map(),failed:new Set(),active:new Set(),maxVoices:10,
  // [sample, local gain, priority]; no combat RNG is consumed for sound.
  palette:{
    hit:['impact-light',.22,0],enemyDeath:['impact-medium',.20,0],gem:['click',.32,0],coin:['coins',.18,0],
    heal:['book',.42,2],magnet:['cloth',.28,0],essence:['coins',.22,1],chest:['wood',.35,2],
    playerHurt:['impact-heavy',.44,3],bossRoar:['creak',.48,3],levelup:['book',.5,2],
    select:['click',.5,2],buy:['coins',.3,2],deny:['wood',.28,2],achv:['coins',.3,2],
    cast:['cloth',.32,0],freeze:['cloth',.24,1],gameover:['creak',.35,3],victory:['wood',.42,3],
    openShop:['book',.42,2],closeShop:['book',.30,2]
  },
  init(){
    if(this.ctx){this.resume();return;}
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){this.enabled=false;return;}
    try{
      this.ctx=new AC();this.master=this.ctx.createGain();this.sfxBus=this.ctx.createGain();this.uiBus=this.ctx.createGain();
      this.sfxBus.connect(this.master);this.uiBus.connect(this.master);
      if(this.ctx.createDynamicsCompressor){const c=this.ctx.createDynamicsCompressor();c.threshold.value=-18;c.knee.value=18;c.ratio.value=4;c.attack.value=.005;c.release.value=.12;this.master.connect(c);c.connect(this.ctx.destination);}
      else this.master.connect(this.ctx.destination);
      this.applyVolumes();this.resume();
      // Called by existing pointer/keyboard start controls; no download at page load.
      for(const sample of new Set(Object.values(this.palette).map(p=>p[0])))this.load(sample);
    }catch(_){this.enabled=false;}
  },
  resume(){if(this.ctx?.state==='suspended')try{const p=this.ctx.resume();if(p?.catch)p.catch(()=>{});}catch(_){}},
  applyVolumes(){if(!this.ctx)return;const volume=v=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;this.master.gain.value=volume(Settings.master);this.sfxBus.gain.value=volume(Settings.sfx);this.uiBus.gain.value=volume(Settings.ui);},
  load(sample){
    if(!this.ctx||this.failed.has(sample))return Promise.resolve(null);
    if(this.buffers.has(sample))return Promise.resolve(this.buffers.get(sample));
    if(this.pending.has(sample))return this.pending.get(sample);
    const task=Promise.resolve().then(()=>fetch('assets/audio/'+sample+'.wav')).then(r=>{if(!r.ok)throw Error('audio unavailable');return r.arrayBuffer();}).then(bytes=>this.ctx.decodeAudioData(bytes)).then(buffer=>{this.buffers.set(sample,buffer);return buffer;}).catch(()=>{this.failed.add(sample);return null;}).finally(()=>this.pending.delete(sample));
    this.pending.set(sample,task);return task;
  },
  minGap(k){if(k==='bossRoar')return 1;if(['levelup','victory','gameover','playerHurt'].includes(k))return .5;if(k==='hit')return Settings.crowdDamp?.18:.08;if(k==='enemyDeath')return Settings.crowdDamp?.26:.12;if(['gem','coin','essence'].includes(k))return .18;if(k==='cast')return .16;return .08;},
  play(kind){
    // A missed/unloaded sound stays silent: no stale burst after decoding.
    if(!this.enabled||!this.ctx||!this.palette[kind])return;
    this.resume();if(this.ctx.state!=='running')return;
    const [sample,gain,priority]=this.palette[kind],ui=['select','heal','chest','levelup','victory','gameover','buy','deny','achv','openShop','closeShop'].includes(kind),bus=ui?this.uiBus:this.sfxBus;
    if(this.master.gain.value<=0||bus.gain.value<=0)return;
    const now=this.ctx.currentTime;if(this.last[kind]!==undefined&&now-this.last[kind]<this.minGap(kind))return;
    const buffer=this.buffers.get(sample);if(!buffer){this.load(sample);return;}
    // Reserve three voices for player feedback and important UI.
    if(priority<2&&this.active.size>=7)return;
    if(this.active.size>=this.maxVoices){const victim=[...this.active].find(v=>v.priority<priority);if(!victim)return;victim.release();try{victim.source.stop();}catch(_){} }
    let source,volume,voice;
    try{
      source=this.ctx.createBufferSource();volume=this.ctx.createGain();source.buffer=buffer;volume.gain.value=gain;
      source.connect(volume);volume.connect(bus);
      voice={source,priority,release:()=>{if(!this.active.delete(voice))return;this.voices=this.active.size;try{source.disconnect();volume.disconnect();}catch(_){}}};
      source.onended=voice.release;this.active.add(voice);this.voices=this.active.size;this.last[kind]=now;source.start(now+.005);
    }catch(_){if(voice)voice.release();else{try{source?.disconnect();volume?.disconnect();}catch(_){}}}
  }
};

/* Alias conservé pour tous les appels existants Audio2.play(...) */
const Audio2 = Sound;
// Capture the first pointer gesture so menu clicks can unlock and preload audio.
if(typeof document!=='undefined'&&typeof document.addEventListener==='function')document.addEventListener('pointerdown',()=>Sound.init(),{once:true,capture:true});
