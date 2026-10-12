/**
 * data.js v2 — 7 classes D2, 15 monstres par acte, 5 boss, progression 5 actes.
 * Sorts basés sur Diablo II LoD (JudgeHype / Arreat Summit).
 */
'use strict';

const MAX_LEVEL = 8;
const REROLL_STARTS = 2;
const WIN_TIME = 15 * 60;
const XP_TO_LEVEL = 12;

/* Progression des actes : acte = minute/3 (0..4) */
const ACT_MINUTES = [0, 3, 6, 9, 12];

/* =========================================================
 * CLASSES (7) — sorts en mana
 * ========================================================= */
const SKILLS = {
  /* Paladin */
  feuSacré:     { name: 'Feu sacré', mana: 18, cd: 6, icon: 'aura', desc: 'Aura brûlante 8s autour de toi.' },
  marteauBeni:  { name: 'Marteau béni', mana: 14, cd: 3.5, icon: 'hammer', desc: '4 marteaux spirales perforants.' },
  givreSacré:   { name: 'Givre sacré', mana: 16, cd: 7, icon: 'freeze', desc: 'Aura glaciale : ralentit 6s.' },
  /* Sorcière */
  firewall:     { name: 'Mur de feu', mana: 22, cd: 5, icon: 'fire', desc: 'Mur de flammes 4s devant toi.' },
  nova:         { name: 'Nova', mana: 26, cd: 6, icon: 'nova', desc: 'Anneau de 16 éclairs.' },
  blizzard:     { name: 'Blizzard', mana: 30, cd: 9, icon: 'ice', desc: 'Pluie de glace en 8 vagues.' },
  /* Amazone */
  multipleShot: { name: 'Tir multiple', mana: 12, cd: 4, icon: 'arrow', desc: 'Éventail de 7 flèches.' },
  guidedArrow:  { name: 'Trait guidé', mana: 15, cd: 5, icon: 'arrow', desc: 'Flèche à tête chercheuse.' },
  lightningFury:{ name: 'Fureur de la foudre', mana: 20, cd: 6, icon: 'bolt', desc: 'Javelot à traînée d\'éclairs.' },
  /* Nécromancien */
  poisonDagger: { name: 'Dague empoisonnée', mana: 12, cd: 4, icon: 'skull', desc: 'DoT poison 3s sur la cible.' },
  boneArmor:    { name: 'Armure d\'os', mana: 20, cd: 10, icon: 'shield', desc: 'Absorbe 60 dégâts pendant 8s.' },
  corpseExplosion: { name: 'Explosion de cadavre', mana: 18, cd: 8, icon: 'skull', desc: 'Explose la zone du dernier mort.' },
  /* Druide */
  firestorm:    { name: 'Vortex de feu', mana: 24, cd: 7, icon: 'fire', desc: 'Anneau de feu tournant 5s.' },
  twister:      { name: 'Cyclone', mana: 16, cd: 5, icon: 'nova', desc: 'Tornade qui repousse et blesse.' },
  oakSage:      { name: 'Sage de chêne', mana: 22, cd: 12, icon: 'aura', desc: '+30% dégâts 10s.' },
  /* Barbare */
  warCry:       { name: 'Cri de guerre', mana: 14, cd: 8, icon: 'star', desc: 'Dégâts dans un rayon + quake.' },
  whirlwind:    { name: 'Tourbillon', mana: 26, cd: 7, icon: 'axe', desc: 'Spirale de haches 3s.' },
  battleOrder:  { name: 'Ordre de bataille', mana: 18, cd: 14, icon: 'shield', desc: 'PV et mana +30% 12s.' },
  /* Assassin */
  fireTrap:     { name: 'Piège de feu', mana: 16, cd: 5, icon: 'flame', desc: 'Tourelle de flammes 4s.' },
  shockWeb:     { name: 'Toile d\'éclairs', mana: 20, cd: 6, icon: 'bolt', desc: 'Toile d\'éclairs 5 zones.' },
  dragonFlight: { name: 'Vol du dragon', mana: 22, cd: 8, icon: 'star', desc: 'Téléport + dégât de zone.' },
};

const CLASSES = {
  paladin: {
    name: 'Paladin', desc: 'Robuste (+30% PV, +1 armure). Auras de soutien.',
    hpMul: 1.30, armor: 1, speedMul: 1.0, manaMul: 0.8,
    auto: 'shortSword', skills: ['feuSacré', 'marteauBeni', 'givreSacré'],
  },
  sorceress: {
    name: 'Sorcière', desc: 'Fragile mais élémentaire pure (+15% dégâts, +40% mana).',
    hpMul: 0.85, armor: 0, speedMul: 1.0, manaMul: 1.4, dmgMul: 1.15,
    auto: 'fireBolt', skills: ['firewall', 'nova', 'blizzard'],
  },
  amazon: {
    name: 'Amazone', desc: 'Vitesse +15%. Arc et javelot à distance.',
    hpMul: 1.0, armor: 0, speedMul: 1.15, manaMul: 1.0,
    auto: 'magicArrow', skills: ['multipleShot', 'guidedArrow', 'lightningFury'],
  },
  necromancer: {
    name: 'Nécromancien', desc: 'Poisons et os. Fragile mais la mort est son amie.',
    hpMul: 0.85, armor: 0, speedMul: 1.0, manaMul: 1.2, dmgMul: 1.10,
    auto: 'poisonDaggerW', skills: ['poisonDagger', 'boneArmor', 'corpseExplosion'],
  },
  druid: {
    name: 'Druide', desc: 'Maîtrise du feu et du vent. PV moyens.',
    hpMul: 1.10, armor: 0, speedMul: 1.05, manaMul: 1.1,
    auto: 'fireBolt', skills: ['firestorm', 'twister', 'oakSage'],
  },
  barbarian: {
    name: 'Barbare', desc: 'Tank brutal (+50% PV, +2 armure), -20% vitesse.',
    hpMul: 1.50, armor: 2, speedMul: 0.8, manaMul: 0.7,
    auto: 'shortSword', skills: ['warCry', 'whirlwind', 'battleOrder'],
  },
  assassin: {
    name: 'Assassin', desc: 'Pièges et mobilité : vitesse +25%, PV -10%.',
    hpMul: 0.90, armor: 0, speedMul: 1.25, manaMul: 1.0,
    auto: 'magicArrow', skills: ['fireTrap', 'shockWeb', 'dragonFlight'],
  },
};

/* =========================================================
 * ARMES AUTO
 * ========================================================= */
const WEAPONS = {
  shortSword: { name: 'Épée courte', desc: 'Arc de lame.', icon: 'swordS', maxLevel: 8, lvl: [
    { cd: 1.00, dmg: 8,  arc: 60,  reach: 62 },
    { cd: 0.90, dmg: 10, arc: 65,  reach: 64 },
    { cd: 0.80, dmg: 12, arc: 70,  reach: 68, count: 2 },
    { cd: 0.70, dmg: 14, arc: 75,  reach: 72, count: 2 },
    { cd: 0.65, dmg: 16, arc: 80,  reach: 74, count: 2 },
    { cd: 0.55, dmg: 18, arc: 85,  reach: 78, count: 3 },
    { cd: 0.50, dmg: 21, arc: 90,  reach: 82, count: 3 },
    { cd: 0.42, dmg: 25, arc: 100, reach: 88, count: 3 },
  ]},
  fireBolt: { name: 'Trait de feu', desc: 'Projectile enflammé.', icon: 'flame', maxLevel: 8, lvl: [
    { cd: 1.10, dmg: 12, speed: 250, count: 1 },
    { cd: 1.00, dmg: 14, speed: 250, count: 1 },
    { cd: 0.95, dmg: 15, speed: 255, count: 2 },
    { cd: 0.85, dmg: 17, speed: 258, count: 2 },
    { cd: 0.75, dmg: 19, speed: 262, count: 3 },
    { cd: 0.68, dmg: 21, speed: 266, count: 3 },
    { cd: 0.58, dmg: 24, speed: 270, count: 4 },
    { cd: 0.50, dmg: 28, speed: 275, count: 4 },
  ]},
  magicArrow: { name: 'Tir magique', desc: 'Flèche magique.', icon: 'arrow', maxLevel: 8, lvl: [
    { cd: 0.80, dmg: 9,  speed: 340, count: 1 },
    { cd: 0.72, dmg: 11, speed: 340, count: 1 },
    { cd: 0.68, dmg: 13, speed: 345, count: 2 },
    { cd: 0.60, dmg: 15, speed: 345, count: 2 },
    { cd: 0.55, dmg: 17, speed: 350, count: 2 },
    { cd: 0.50, dmg: 19, speed: 350, count: 3 },
    { cd: 0.45, dmg: 22, speed: 355, count: 3 },
    { cd: 0.38, dmg: 26, speed: 360, count: 3 },
  ]},
  poisonDaggerW: { name: 'Dague', desc: 'Coup empoisonné.', icon: 'skull', maxLevel: 8, lvl: [
    { cd: 0.85, dmg: 6,  dot: 4,  dotTime: 2.4 },
    { cd: 0.80, dmg: 7,  dot: 5,  dotTime: 2.5 },
    { cd: 0.75, dmg: 8,  dot: 6,  dotTime: 2.6 },
    { cd: 0.70, dmg: 10, dot: 7,  dotTime: 2.7, count: 2 },
    { cd: 0.65, dmg: 11, dot: 8,  dotTime: 2.8, count: 2 },
    { cd: 0.60, dmg: 13, dot: 9,  dotTime: 2.9, count: 2 },
    { cd: 0.55, dmg: 15, dot: 11, dotTime: 3.0, count: 3 },
    { cd: 0.48, dmg: 18, dot: 13, dotTime: 3.2, count: 3 },
  ]},
  throwingAxe: { name: 'Hache de lancer', desc: 'Hache orbitale.', icon: 'axe', maxLevel: 8, isOrbit: true, lvl: [
    { dmg: 10, count: 1, radius: 62, rotspeed: 2.2 },
    { dmg: 12, count: 1, radius: 64, rotspeed: 2.3 },
    { dmg: 14, count: 2, radius: 66, rotspeed: 2.4 },
    { dmg: 17, count: 2, radius: 70, rotspeed: 2.5 },
    { dmg: 20, count: 3, radius: 74, rotspeed: 2.6 },
    { dmg: 23, count: 3, radius: 76, rotspeed: 2.7 },
    { dmg: 27, count: 4, radius: 80, rotspeed: 2.9 },
    { dmg: 32, count: 4, radius: 84, rotspeed: 3.1 },
  ]},
  chainLightning: { name: 'Éclairs en série', desc: 'Éclair en chaîne.', icon: 'bolt', maxLevel: 8, lvl: [
    { cd: 2.20, dmg: 14, jumps: 2, range: 210 },
    { cd: 2.00, dmg: 16, jumps: 3, range: 215 },
    { cd: 1.85, dmg: 18, jumps: 3, range: 220 },
    { cd: 1.70, dmg: 21, jumps: 4, range: 228 },
    { cd: 1.55, dmg: 24, jumps: 4, range: 236 },
    { cd: 1.40, dmg: 27, jumps: 5, range: 244 },
    { cd: 1.25, dmg: 31, jumps: 6, range: 252 },
    { cd: 1.10, dmg: 36, jumps: 7, range: 264 },
  ]},
  holyAura: { name: 'Aura sacrée', desc: 'Aura continue.', icon: 'ring', maxLevel: 8, lvl: [
    { dmg: 3,  radius: 70 }, { dmg: 4,  radius: 74 }, { dmg: 5,  radius: 78 },
    { dmg: 6,  radius: 84 }, { dmg: 7,  radius: 90 }, { dmg: 8,  radius: 96 },
    { dmg: 10, radius: 104 }, { dmg: 12, radius: 112 },
  ]},
};

const WEAPON_ORDER = ['shortSword', 'fireBolt', 'magicArrow', 'throwingAxe', 'chainLightning', 'holyAura'];

const PASSIVES = {
  strength: { name: 'Force',    desc: '+10% dégâts par niveau.',           icon: 'swordS', maxLevel: 5 },
  armor:    { name: 'Armure',   desc: 'Réduit les dégâts reçus.',          icon: 'shield', maxLevel: 5 },
  healing:  { name: 'Vitalité', desc: 'PV max +20%.',                      icon: 'flask',  maxLevel: 5 },
  speed:    { name: 'Célérité', desc: '+8% vitesse.',                      icon: 'star',   maxLevel: 5 },
  magnet:   { name: 'Aimant',   desc: 'Rayon de collecte +25%.',           icon: 'magnet', maxLevel: 5 },
  luck:     { name: 'Chance',   desc: 'Chutes plus généreuses +8%.',       icon: 'trophy', maxLevel: 5 },
  cooldown: { name: 'Rythme',   desc: '-8% délai entre attaques.',         icon: 'ring',   maxLevel: 5 },
  wisdom:   { name: 'Sagesse',  desc: '+20% régéné mana.',                 icon: 'all', maxLevel: 5 },
};

/* =========================================================
 * MONSTRES — id externe (Sprites.monsters) + stats
 * ========================================================= */
const ENEMY_BASE = {
  // Acte I (0-3 min)
  fallen:      { hp: 14,  speed: 46, dmg: 6,  r: 6, xp: 1, sprite: 'fallen',  name: 'Imp déchu', act: 0 },
  zombie:      { hp: 44,  speed: 18, dmg: 10, r: 7, xp: 3, sprite: 'zombie',  name: 'Zombie', act: 0 },
  skeleton:    { hp: 22,  speed: 34, dmg: 8,  r: 6, xp: 2, sprite: 'skeleton', name: 'Squelette', act: 0 },
  fireHound:   { hp: 26,  speed: 55, dmg: 9,  r: 6, xp: 3, sprite: 'fireHound', name: 'Chien de feu', act: 0 },
  scarab:      { hp: 18,  speed: 40, dmg: 7,  r: 6, xp: 2, sprite: 'scarab',  name: 'Scarabée', act: 0 },
  // Acte II (3-6)
  goatD:       { hp: 30,  speed: 52, dmg: 9,  r: 7, xp: 3, sprite: 'goatD',   name: 'Démon bouc', act: 1 },
  serpent:     { hp: 24,  speed: 48, dmg: 9,  r: 6, xp: 2, sprite: 'serpent', name: 'Serpent', act: 1 },
  sandDemon:   { hp: 34,  speed: 44, dmg: 10, r: 7, xp: 3, sprite: 'wraith',  name: 'Démon du désert', act: 1 },
  batDemon:    { hp: 20,  speed: 62, dmg: 8,  r: 6, xp: 2, sprite: 'batDemon', name: 'Démon volant', act: 1 },
  // Acte III (6-9)
  fungus:      { hp: 30,  speed: 24, dmg: 9,  r: 7, xp: 3, sprite: 'fungus',  name: 'Fongus malade', act: 2 },
  spider:      { hp: 26,  speed: 50, dmg: 10, r: 7, xp: 3, sprite: 'spider', name: 'Araignée géante', act: 2 },
  wraith:      { hp: 28,  speed: 45, dmg: 11, r: 6, xp: 3, sprite: 'wraith',  name: 'Spectre', act: 2 },
  boneMage:    { hp: 22,  speed: 30, dmg: 12, r: 6, xp: 4, sprite: 'boneMage', name: 'Mage d\'os', act: 2 },
  // Acte IV-V (9-15)
  ogre:        { hp: 60,  speed: 28, dmg: 14, r: 8, xp: 5, sprite: 'ogre',    name: 'Ogre', act: 3 },
  undeadKnight:{ hp: 55,  speed: 38, dmg: 14, r: 7, xp: 5, sprite: 'undeadKnight', name: 'Chevalier maudit', act: 3 },
  skeletonArcher: { hp: 20, speed: 42, dmg: 10, r: 6, xp: 3, sprite: 'skeletonArcher', name: 'Archer squelette', act: 3 },
};

const SPAWN_MINUTES = [
  { min: 0,  types: ['fallen'],                                  rate: 1.2 },
  { min: 1,  types: ['fallen', 'scarab'],                        rate: 1.6 },
  { min: 2,  types: ['fallen', 'skeleton', 'fireHound'],         rate: 2.0 },
  { min: 3,  types: ['zombie', 'goatD'],                         rate: 2.3 },
  { min: 4,  types: ['zombie', 'goatD', 'serpent'],              rate: 2.6 },
  { min: 5,  types: ['goatD', 'serpent', 'batDemon'],            rate: 3.0, elite: 0.04 },
  { min: 6,  types: ['fungus', 'spider', 'wraith'],              rate: 3.4 },
  { min: 7,  types: ['spider', 'wraith', 'boneMage'],            rate: 3.8, elite: 0.05 },
  { min: 8,  types: ['wraith', 'boneMage', 'fungus'],            rate: 4.2 },
  { min: 9,  types: ['ogre', 'undeadKnight'],                    rate: 4.4 },
  { min: 10, types: ['ogre', 'undeadKnight', 'skeletonArcher'],  rate: 4.8 },
  { min: 11, types: ['ogre', 'undeadKnight', 'boneMage'],        rate: 5.2, elite: 0.07 },
  { min: 12, types: ['undeadKnight', 'ogre'],                    rate: 5.6, elite: 0.09 },
  { min: 13, types: ['undeadKnight', 'ogre'],                    rate: 6.0, elite: 0.11 },
  { min: 14, types: ['undeadKnight', 'ogre'],                    rate: 6.5, elite: 0.14 },
];

const MINUTE_SCALING = [1, 1.15, 1.3, 1.5, 1.75, 2, 2.3, 2.6, 3, 3.4, 3.8, 4.3, 4.8, 5.4, 6];

/* =========================================================
 * BOSS — un par acte, avec sprites 64×64 fournis
 * ========================================================= */
const BOSSES = [
  { at: 2 * 60,  id: 'butcher',   name: 'Le Boucher',        hp: 600,  speed: 44, dmg: 18, r: 14, xp: 60,  sprite: 'butcher' },
  { at: 5 * 60,  id: 'insectQueen', name: 'Reine Insecte',   hp: 1200, speed: 40, dmg: 22, r: 14, xp: 120, sprite: 'andariel2' },
  { at: 8 * 60,  id: 'summoner',  name: 'Invocateur',        hp: 1800, speed: 36, dmg: 26, r: 13, xp: 160, sprite: 'summoner' },
  { at: 11 * 60, id: 'spiderDemon', name: 'Démon Araignée', hp: 2600, speed: 42, dmg: 28, r: 15, xp: 260, sprite: 'spiderDemon' },
  { at: 14 * 60, id: 'archdemon', name: 'Archidémon',        hp: 4000, speed: 48, dmg: 32, r: 15, xp: 500, sprite: 'archdemon' },
];

/* =========================================================
 * BOUTIQUE ERRANTE
 * ========================================================= */
const SHOP_POOL = [
  { id: 'potionHP',  name: 'Potion de vie',    desc: 'Soin complet.',                       cost: 40,  icon: 'flask' },
  { id: 'potionMP',  name: 'Potion de mana',   desc: 'Mana plein.',                         cost: 40,  icon: 'flask' },
  { id: 'weaponUp',  name: 'Enclume du forgeron', desc: '+1 niveau à une arme.',            cost: 120, icon: 'trophy' },
  { id: 'armorUp',   name: 'Plates de fer',    desc: 'Armure +1 (descente).',               cost: 90,  icon: 'shield' },
  { id: 'reroll',    name: 'Talisman de refonte', desc: '+1 relance de pioche.',            cost: 70,  icon: 'ring' },
  { id: 'magnetNow', name: 'Sceau d\'attraction', desc: 'Attire toutes les gemmes.',        cost: 35,  icon: 'magnet' },
  { id: 'maxHP',     name: 'Cœur de brewja',   desc: 'PV max +20 (descente).',              cost: 130, icon: 'heart' },
  { id: 'essenceDust', name: 'Poussière d\'essence', desc: '+1 essence (échange or).',       cost: 200, icon: 'essence' },
];

const SHOP_INTERVAL = 90;
const SHOP_DURATION = 25;
const SHOP_DISTANCE = 260;

/* =========================================================
 * HAUTS FAITS
 * ========================================================= */
const ACHIEVEMENTS = {
  firstBlood:   { name: 'Premier sang',       desc: 'Tuer 10 monstres en une descente.', check: g => g.kills >= 10, reward: 1 },
  exterminator: { name: 'Exterminateur',      desc: 'Tuer 300 monstres en une descente.', check: g => g.kills >= 300, reward: 3 },
  survivor5:    { name: 'Survivant',          desc: 'Atteindre la 5e minute.', check: g => g.time >= 300, reward: 2 },
  titan:        { name: 'Titan de la crypte', desc: 'Niveau 15 en une descente.', check: g => g.level >= 15, reward: 3 },
  slayerB:      { name: 'Tueur de Boucher',   desc: 'Vaincre Le Boucher.', check: g => g.bossKills.butcher, reward: 2 },
  slayerQ:      { name: 'Mère des Nids',      desc: 'Vaincre la Reine Insecte.', check: g => g.bossKills.insectQueen, reward: 3 },
  slayerS:      { name: 'Maître des Appels',  desc: 'Vaincre l\'Invocateur.', check: g => g.bossKills.summoner, reward: 3 },
  slayerW:      { name: 'Toile Brisée',       desc: 'Vaincre le Démon Araignée.', check: g => g.bossKills.spiderDemon, reward: 4 },
  slayerA:      { name: 'Archidémon vaincu',  desc: 'Vaincre l\'Archidémon.', check: g => g.bossKills.archdemon, reward: 5 },
  richman:      { name: 'Pactole',            desc: 'Ramasser 1000 or.', check: g => g.goldEarned >= 1000, reward: 2 },
  untouched:    { name: 'Intouchable',        desc: '3 min sans dégâts.', check: g => g.time >= 180 && g.hurtCount === 0, reward: 4 },
};
