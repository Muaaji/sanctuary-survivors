/* Accepted Diablo Survivors design. Data only; no legacy source edits. */
'use strict';
window.SurvivorCatalogue = {
  "version": 1,
  "spells": {
    "common_knives": {
      "id": "common_knives",
      "name": "Dagues de lancer",
      "mode": "weapon",
      "cd": 1.15,
      "dmg": 12,
      "count": 2,
      "radius": 300,
      "duration": 0,
      "element": "physical",
      "group": "common",
      "maxLevel": 5,
      "starter": false,
      "desc": "Deux dagues rapides sur des cibles différentes.",
      "weaponKind": "dagger",
      "attackType": "ranged"
    },
    "common_axes": {
      "id": "common_axes",
      "name": "Hache de lancer",
      "mode": "weapon",
      "cd": 2,
      "dmg": 28,
      "count": 1,
      "radius": 300,
      "duration": 0,
      "element": "physical",
      "group": "common",
      "maxLevel": 5,
      "starter": false,
      "desc": "Une hache lourde qui traverse puis revient.",
      "weaponKind": "axe",
      "attackType": "ranged"
    },
    "common_embers": {
      "id": "common_embers",
      "name": "Arc long",
      "mode": "weapon",
      "cd": 1.35,
      "dmg": 24,
      "count": 1,
      "radius": 420,
      "duration": 0,
      "element": "physical",
      "group": "common",
      "maxLevel": 5,
      "starter": false,
      "desc": "Une flèche précise et rapide sur une cible.",
      "weaponKind": "bow",
      "attackType": "ranged"
    },
    "common_blades": {
      "id": "common_blades",
      "name": "Épée",
      "mode": "weapon",
      "cd": 1.3,
      "dmg": 24,
      "count": 1,
      "radius": 64,
      "duration": 0,
      "element": "physical",
      "group": "common",
      "maxLevel": 5,
      "starter": false,
      "desc": "Une taille frontale touche jusqu’à trois ennemis.",
      "weaponKind": "sword",
      "attackType": "melee"
    },
    "common_flasks": {
      "id": "common_flasks",
      "name": "Lance",
      "mode": "weapon",
      "cd": 1.65,
      "dmg": 30,
      "count": 1,
      "radius": 112,
      "duration": 0,
      "element": "physical",
      "group": "common",
      "maxLevel": 5,
      "starter": false,
      "desc": "Une estocade transperce une ligne devant vous.",
      "weaponKind": "spear",
      "attackType": "melee"
    },
    "common_frost": {
      "id": "common_frost",
      "name": "Arbalète",
      "mode": "weapon",
      "cd": 2.25,
      "dmg": 38,
      "count": 1,
      "radius": 430,
      "duration": 0,
      "element": "physical",
      "group": "common",
      "maxLevel": 5,
      "starter": false,
      "desc": "Un carreau lent à recharger, très puissant et perforant.",
      "weaponKind": "crossbow",
      "attackType": "ranged"
    },
    "common_storm": {
      "id": "common_storm",
      "name": "Faux",
      "mode": "weapon",
      "cd": 2.1,
      "dmg": 22,
      "count": 1,
      "radius": 90,
      "duration": 0,
      "element": "physical",
      "group": "common",
      "maxLevel": 5,
      "starter": false,
      "desc": "Un large balayage frappe les ennemis autour de vous.",
      "weaponKind": "scythe",
      "attackType": "melee"
    },
    "common_seal": {
      "id": "common_seal",
      "name": "Masse",
      "mode": "weapon",
      "cd": 2,
      "dmg": 34,
      "count": 1,
      "radius": 58,
      "duration": 0,
      "element": "physical",
      "group": "common",
      "maxLevel": 5,
      "starter": false,
      "desc": "Un coup lourd étourdit brièvement jusqu’à deux ennemis.",
      "weaponKind": "mace",
      "attackType": "melee"
    },
    "common_skulls": {
      "id": "common_skulls",
      "name": "Fronde",
      "mode": "weapon",
      "cd": 1.6,
      "dmg": 18,
      "count": 1,
      "radius": 360,
      "duration": 0,
      "element": "physical",
      "group": "common",
      "maxLevel": 5,
      "starter": false,
      "desc": "Une pierre rebondit sur deux cibles proches.",
      "weaponKind": "sling",
      "attackType": "ranged"
    },
    "common_comets": {
      "id": "common_comets",
      "name": "Fléau",
      "mode": "weapon",
      "cd": 0.85,
      "dmg": 18,
      "count": 1,
      "radius": 78,
      "duration": 0,
      "element": "physical",
      "group": "common",
      "maxLevel": 5,
      "starter": false,
      "desc": "Une boule d’acier décrit une orbite et frappe au contact.",
      "weaponKind": "flail",
      "attackType": "melee"
    },
    "amazon_multishot": {
      "id": "amazon_multishot",
      "name": "Tir multiple",
      "mode": "fan",
      "cd": 1.5,
      "dmg": 16,
      "count": 3,
      "radius": 350,
      "duration": 0,
      "element": "physical",
      "group": "amazon",
      "maxLevel": 5,
      "starter": true,
      "source": "https://d2runewizard.com/skills"
    },
    "amazon_guided": {
      "id": "amazon_guided",
      "name": "Flèche guidée",
      "mode": "homing",
      "cd": 2.3,
      "dmg": 29,
      "count": 1,
      "radius": 420,
      "duration": 0,
      "element": "physical",
      "group": "amazon",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "amazon_fury": {
      "id": "amazon_fury",
      "name": "Fureur de foudre",
      "mode": "javelin",
      "cd": 3.5,
      "dmg": 28,
      "count": 1,
      "radius": 200,
      "duration": 0,
      "element": "lightning",
      "group": "amazon",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "amazon_plague": {
      "id": "amazon_plague",
      "name": "Javelot de peste",
      "mode": "plague",
      "cd": 5,
      "dmg": 18,
      "count": 1,
      "radius": 65,
      "duration": 3,
      "element": "poison",
      "group": "amazon",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "amazon_valkyrie": {
      "id": "amazon_valkyrie",
      "name": "Valkyrie",
      "mode": "companion",
      "cd": 1.1,
      "dmg": 19,
      "count": 1,
      "radius": 42,
      "duration": 0,
      "element": "physical",
      "group": "amazon",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "sorceress_fireball": {
      "id": "sorceress_fireball",
      "name": "Boule de feu",
      "mode": "fireball",
      "cd": 1.8,
      "dmg": 34,
      "count": 1,
      "radius": 42,
      "duration": 0,
      "element": "fire",
      "group": "sorceress",
      "maxLevel": 5,
      "starter": true,
      "source": "https://d2runewizard.com/skills"
    },
    "sorceress_orb": {
      "id": "sorceress_orb",
      "name": "Orbe gelé",
      "mode": "orb",
      "cd": 4,
      "dmg": 11,
      "count": 1,
      "radius": 260,
      "duration": 0,
      "element": "cold",
      "group": "sorceress",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "sorceress_chain": {
      "id": "sorceress_chain",
      "name": "Éclairs en chaîne",
      "mode": "chain",
      "cd": 3,
      "dmg": 27,
      "count": 1,
      "radius": 220,
      "duration": 0,
      "element": "lightning",
      "group": "sorceress",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "sorceress_blizzard": {
      "id": "sorceress_blizzard",
      "name": "Blizzard",
      "mode": "blizzard",
      "cd": 7,
      "dmg": 12,
      "count": 1,
      "radius": 88,
      "duration": 3,
      "element": "cold",
      "group": "sorceress",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "sorceress_hydra": {
      "id": "sorceress_hydra",
      "name": "Hydre",
      "mode": "turret",
      "cd": 7,
      "dmg": 14,
      "count": 1,
      "radius": 320,
      "duration": 5,
      "element": "fire",
      "group": "sorceress",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "necromancer_skeletons": {
      "id": "necromancer_skeletons",
      "name": "Ressusciter un squelette",
      "mode": "companion",
      "cd": 1.2,
      "dmg": 10,
      "count": 3,
      "radius": 30,
      "duration": 0,
      "element": "physical",
      "group": "necromancer",
      "maxLevel": 5,
      "starter": true,
      "source": "https://d2runewizard.com/skills"
    },
    "necromancer_spear": {
      "id": "necromancer_spear",
      "name": "Lance d’os",
      "mode": "spear",
      "cd": 2,
      "dmg": 26,
      "count": 1,
      "radius": 320,
      "duration": 0,
      "element": "magic",
      "group": "necromancer",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "necromancer_nova": {
      "id": "necromancer_nova",
      "name": "Nova de poison",
      "mode": "nova",
      "cd": 5,
      "dmg": 14,
      "count": 1,
      "radius": 110,
      "duration": 3,
      "element": "poison",
      "group": "necromancer",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "necromancer_corpse": {
      "id": "necromancer_corpse",
      "name": "Explosion morbide",
      "mode": "corpse",
      "cd": 3,
      "dmg": 42,
      "count": 1,
      "radius": 95,
      "duration": 0,
      "element": "fire",
      "group": "necromancer",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "necromancer_curse": {
      "id": "necromancer_curse",
      "name": "Amplification des dégâts",
      "mode": "curse",
      "cd": 7,
      "dmg": 0,
      "count": 1,
      "radius": 120,
      "duration": 4,
      "element": "magic",
      "group": "necromancer",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills",
      "desc": "Malédiction : les dégâts physiques reçus augmentent de 25 %."
    },
    "paladin_zeal": {
      "id": "paladin_zeal",
      "name": "Zèle",
      "mode": "melee",
      "cd": 1.4,
      "dmg": 15,
      "count": 3,
      "radius": 58,
      "duration": 0,
      "element": "physical",
      "group": "paladin",
      "maxLevel": 5,
      "starter": true,
      "source": "https://d2runewizard.com/skills"
    },
    "paladin_hammer": {
      "id": "paladin_hammer",
      "name": "Marteau béni",
      "mode": "hammer",
      "cd": 2.5,
      "dmg": 25,
      "count": 1,
      "radius": 160,
      "duration": 0,
      "element": "magic",
      "group": "paladin",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "paladin_holyfire": {
      "id": "paladin_holyfire",
      "name": "Feu sacré",
      "mode": "aura",
      "cd": 1.2,
      "dmg": 10,
      "count": 1,
      "radius": 90,
      "duration": 0,
      "element": "fire",
      "group": "paladin",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "paladin_heavens": {
      "id": "paladin_heavens",
      "name": "Poing des cieux",
      "mode": "heavens",
      "cd": 5,
      "dmg": 45,
      "count": 1,
      "radius": 150,
      "duration": 0,
      "element": "lightning",
      "group": "paladin",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "paladin_shield": {
      "id": "paladin_shield",
      "name": "Bouclier sacré",
      "mode": "shield",
      "cd": 8,
      "dmg": 0,
      "count": 1,
      "radius": 0,
      "duration": 8,
      "element": "magic",
      "group": "paladin",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "barbarian_swing": {
      "id": "barbarian_swing",
      "name": "Double attaque",
      "mode": "melee",
      "cd": 1,
      "dmg": 16,
      "count": 2,
      "radius": 62,
      "duration": 0,
      "element": "physical",
      "group": "barbarian",
      "maxLevel": 5,
      "starter": true,
      "source": "https://d2runewizard.com/skills"
    },
    "barbarian_throw": {
      "id": "barbarian_throw",
      "name": "Double lancer",
      "mode": "projectile",
      "cd": 2,
      "dmg": 25,
      "count": 2,
      "radius": 360,
      "duration": 0,
      "element": "physical",
      "group": "barbarian",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "barbarian_whirl": {
      "id": "barbarian_whirl",
      "name": "Tourbillon",
      "mode": "whirl",
      "cd": 5,
      "dmg": 14,
      "count": 1,
      "radius": 77,
      "duration": 1.5,
      "element": "physical",
      "group": "barbarian",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "barbarian_cry": {
      "id": "barbarian_cry",
      "name": "Cri de guerre",
      "mode": "cry",
      "cd": 6,
      "dmg": 33,
      "count": 1,
      "radius": 100,
      "duration": 0,
      "element": "physical",
      "group": "barbarian",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "barbarian_frenzy": {
      "id": "barbarian_frenzy",
      "name": "Frénésie",
      "mode": "frenzy",
      "cd": 1.8,
      "dmg": 18,
      "count": 2,
      "radius": 60,
      "duration": 2,
      "element": "physical",
      "group": "barbarian",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "druid_tornado": {
      "id": "druid_tornado",
      "name": "Tornade",
      "mode": "tornado",
      "cd": 1.4,
      "dmg": 45,
      "count": 1,
      "radius": 300,
      "duration": 0,
      "element": "physical",
      "group": "druid",
      "maxLevel": 5,
      "starter": true,
      "source": "https://d2runewizard.com/skills"
    },
    "druid_hurricane": {
      "id": "druid_hurricane",
      "name": "Ouragan",
      "mode": "hurricane",
      "cd": 7,
      "dmg": 12,
      "count": 1,
      "radius": 94,
      "duration": 4,
      "element": "cold",
      "group": "druid",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "druid_fissure": {
      "id": "druid_fissure",
      "name": "Fissure",
      "mode": "fissure",
      "cd": 7,
      "dmg": 13,
      "count": 1,
      "radius": 80,
      "duration": 4,
      "element": "fire",
      "group": "druid",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "druid_wolves": {
      "id": "druid_wolves",
      "name": "Loups spirituels",
      "mode": "companion",
      "cd": 1.1,
      "dmg": 12,
      "count": 2,
      "radius": 30,
      "duration": 0,
      "element": "physical",
      "group": "druid",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "druid_grizzly": {
      "id": "druid_grizzly",
      "name": "Grizzly",
      "mode": "companion",
      "cd": 1.8,
      "dmg": 31,
      "count": 1,
      "radius": 52,
      "duration": 0,
      "element": "physical",
      "group": "druid",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "assassin_claw": {
      "id": "assassin_claw",
      "name": "Griffes du dragon",
      "mode": "melee",
      "cd": 1,
      "dmg": 15,
      "count": 2,
      "radius": 55,
      "duration": 0,
      "element": "physical",
      "group": "assassin",
      "maxLevel": 5,
      "starter": true,
      "source": "https://d2runewizard.com/skills"
    },
    "assassin_sentry": {
      "id": "assassin_sentry",
      "name": "Sentinelle de foudre",
      "mode": "turret",
      "cd": 6,
      "dmg": 19,
      "count": 1,
      "radius": 280,
      "duration": 5,
      "element": "lightning",
      "group": "assassin",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "assassin_wake": {
      "id": "assassin_wake",
      "name": "Éveil du feu",
      "mode": "turret",
      "cd": 6,
      "dmg": 16,
      "count": 1,
      "radius": 170,
      "duration": 5,
      "element": "fire",
      "group": "assassin",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "assassin_venom": {
      "id": "assassin_venom",
      "name": "Venin",
      "mode": "venom",
      "cd": 7,
      "dmg": 6,
      "count": 1,
      "radius": 0,
      "duration": 4,
      "element": "poison",
      "group": "assassin",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    },
    "assassin_shadow": {
      "id": "assassin_shadow",
      "name": "Maître de l’ombre",
      "mode": "companion",
      "cd": 1.1,
      "dmg": 21,
      "count": 1,
      "radius": 42,
      "duration": 0,
      "element": "physical",
      "group": "assassin",
      "maxLevel": 5,
      "starter": false,
      "source": "https://d2runewizard.com/skills"
    }
  },
  "passives": {
    "crit": {
      "id": "crit",
      "name": "Œil du chasseur",
      "desc": "+2 points de chance critique par rang.",
      "maxLevel": 5
    },
    "area": {
      "id": "area",
      "name": "Allonge",
      "desc": "+4 % de portée et de rayon par rang.",
      "maxLevel": 5
    },
    "power": {
      "id": "power",
      "name": "Rune de puissance",
      "desc": "+8 % de dégâts par rang.",
      "maxLevel": 5
    },
    "armor": {
      "id": "armor",
      "name": "Plaque protectrice",
      "desc": "+2 points de réduction des dégâts par rang.",
      "maxLevel": 5
    },
    "duration": {
      "id": "duration",
      "name": "Sceau de persistance",
      "desc": "+10 % de durée par rang.",
      "maxLevel": 5
    },
    "cooldown": {
      "id": "cooldown",
      "name": "Sablier occulte",
      "desc": "−4 % de délai par rang.",
      "maxLevel": 5
    },
    "amount": {
      "id": "amount",
      "name": "Carquois",
      "desc": "Arcs et arbalètes : +10 % de vitesse des projectiles par rang, +1 projectile aux rangs 2 et 5.",
      "maxLevel": 5
    },
    "vitality": {
      "id": "vitality",
      "name": "Cœur de rubis",
      "desc": "+10 % de vie maximale par rang.",
      "maxLevel": 5
    },
    "magnet": {
      "id": "magnet",
      "name": "Aimant des âmes",
      "desc": "+20 % de rayon de ramassage par rang.",
      "maxLevel": 5
    },
    "speed": {
      "id": "speed",
      "name": "Bottes du pèlerin",
      "desc": "+4 % de vitesse de déplacement par rang.",
      "maxLevel": 5
    },
    "melee": {
      "id": "melee",
      "name": "Brutalité",
      "desc": "+8 % de dégâts de mêlée par rang.",
      "maxLevel": 5
    },
    "ranged": {
      "id": "ranged",
      "name": "Précision",
      "desc": "+8 % de dégâts à distance par rang.",
      "maxLevel": 5
    },
    "dodge": {
      "id": "dodge",
      "name": "Agilité",
      "desc": "+3 points d’esquive par rang ; plafond 45 %.",
      "maxLevel": 5
    },
    "mana": {
      "id": "mana",
      "name": "Réserve arcanique",
      "desc": "+15 mana maximum et +0,5 mana/s par rang.",
      "maxLevel": 5
    },
    "critDamage": {
      "id": "critDamage",
      "name": "Exécution",
      "desc": "+12 points de dégâts critiques par rang.",
      "maxLevel": 5
    },
    "attackSpeed": {
      "id": "attackSpeed",
      "name": "Ferveur",
      "desc": "+6 % de vitesse d’attaque par rang.",
      "maxLevel": 5
    }
  },
  "recipes": {
    "common_knives": {
      "weapon": "common_knives",
      "passive": "attackSpeed",
      "weaponRank": 5,
      "passiveRank": 1,
      "name": "Dagues jumelles",
      "desc": "Arme renforcée : +35 % dégâts, +15 % portée, −15 % recharge ; une dague supplémentaire."
    },
    "common_axes": {
      "weapon": "common_axes",
      "passive": "power",
      "weaponRank": 5,
      "passiveRank": 1,
      "name": "Hache du retour",
      "desc": "Arme renforcée : +35 % dégâts, +15 % portée, −15 % recharge ; retour plus rapide et impacts renforcés."
    },
    "common_embers": {
      "weapon": "common_embers",
      "passive": "amount",
      "weaponRank": 5,
      "passiveRank": 1,
      "name": "Arc de guerre",
      "desc": "Arme renforcée : +35 % dégâts, +15 % portée, −15 % recharge ; une flèche supplémentaire."
    },
    "common_blades": {
      "weapon": "common_blades",
      "passive": "melee",
      "weaponRank": 5,
      "passiveRank": 1,
      "name": "Lame royale",
      "desc": "Arme renforcée : +35 % dégâts, +15 % portée, −15 % recharge ; une seconde taille."
    },
    "common_flasks": {
      "weapon": "common_flasks",
      "passive": "area",
      "weaponRank": 5,
      "passiveRank": 1,
      "name": "Lance de phalange",
      "desc": "Arme renforcée : +35 % dégâts, +15 % portée, −15 % recharge ; une seconde estocade."
    },
    "common_frost": {
      "weapon": "common_frost",
      "passive": "critDamage",
      "weaponRank": 5,
      "passiveRank": 1,
      "name": "Arbalète à répétition",
      "desc": "Arme renforcée : +35 % dégâts, +15 % portée, −15 % recharge ; un carreau supplémentaire."
    },
    "common_storm": {
      "weapon": "common_storm",
      "passive": "area",
      "weaponRank": 5,
      "passiveRank": 1,
      "name": "Grande faucheuse",
      "desc": "Arme renforcée : +35 % dégâts, +15 % portée, −15 % recharge ; un second balayage."
    },
    "common_seal": {
      "weapon": "common_seal",
      "passive": "armor",
      "weaponRank": 5,
      "passiveRank": 1,
      "name": "Masse du siège",
      "desc": "Arme renforcée : +35 % dégâts, +15 % portée, −15 % recharge ; une seconde frappe."
    },
    "common_skulls": {
      "weapon": "common_skulls",
      "passive": "crit",
      "weaponRank": 5,
      "passiveRank": 1,
      "name": "Fronde à ricochets",
      "desc": "Arme renforcée : +35 % dégâts, +15 % portée, −15 % recharge ; deux rebonds supplémentaires."
    },
    "common_comets": {
      "weapon": "common_comets",
      "passive": "area",
      "weaponRank": 5,
      "passiveRank": 1,
      "name": "Fléau à chaînes",
      "desc": "Arme renforcée : +35 % dégâts, +15 % portée, −15 % recharge ; une boule d’acier supplémentaire."
    }
  },
  "trees": {
    "amazon": [
      {
        "id": "amazon_0",
        "name": "Archerie",
        "skills": [
          "amazon_multishot",
          "amazon_guided"
        ],
        "nodes": [
          {
            "id": "amazon_0_0",
            "name": "Visée",
            "desc": "+20 % de dégâts des flèches.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "amazon_0_1",
            "name": "Perforation",
            "desc": "traverse deux ennemis supplémentaires.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "pierce": 2
            }
          },
          {
            "id": "amazon_0_2",
            "name": "Œil d'aigle",
            "desc": "+10 points de chance critique des flèches.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "crit": 0.1
            }
          },
          {
            "id": "amazon_0_3",
            "name": "Pluie guidée",
            "desc": "chaque troisième salve de Tir multiple ajoute trois flèches chercheuses à 60 % des dégâts d'une flèche ; Flèche guidée gagne un ricochet.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "guidedRain"
            }
          }
        ]
      },
      {
        "id": "amazon_1",
        "name": "Javelots",
        "skills": [
          "amazon_fury",
          "amazon_plague"
        ],
        "nodes": [
          {
            "id": "amazon_1_0",
            "name": "Pointes runiques",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "amazon_1_1",
            "name": "Propagation",
            "desc": "Fureur libère deux traits supplémentaires ; Peste dure 1 s de plus.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "bolts": 2,
              "duration": 1
            }
          },
          {
            "id": "amazon_1_2",
            "name": "Contagion",
            "desc": "+20 % de rayon des effets d'impact.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "radius": 0.2
            }
          },
          {
            "id": "amazon_1_3",
            "name": "Orage pestilent",
            "desc": "l'impact de Fureur applique un poison total égal à 40 % de ses dégâts sur 2 s ; Peste ajoute un éclair de 50 % des dégâts initiaux du javelot.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "toxicStorm"
            }
          }
        ]
      },
      {
        "id": "amazon_2",
        "name": "Valkyrie",
        "skills": [
          "amazon_valkyrie"
        ],
        "nodes": [
          {
            "id": "amazon_2_0",
            "name": "Lance céleste",
            "desc": "+25 % de dégâts de la Valkyrie.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.25
            }
          },
          {
            "id": "amazon_2_1",
            "name": "Gardienne",
            "desc": "+40 % de vie de la Valkyrie.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "allyHP": 0.4
            }
          },
          {
            "id": "amazon_2_2",
            "name": "Provocation",
            "desc": "attire les ennemis ordinaires durant 3 s toutes les 8 s.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "taunt": true
            }
          },
          {
            "id": "amazon_2_3",
            "name": "Championne",
            "desc": "chaque troisième attaque de la Valkyrie devient une frappe en zone à 150 % de ses dégâts habituels.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "champion"
            }
          }
        ]
      }
    ],
    "sorceress": [
      {
        "id": "sorceress_0",
        "name": "Feu",
        "skills": [
          "sorceress_fireball",
          "sorceress_hydra"
        ],
        "nodes": [
          {
            "id": "sorceress_0_0",
            "name": "Braises",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "sorceress_0_1",
            "name": "Combustion",
            "desc": "les impacts brûlent pour 20 % des dégâts de l'impact par seconde, durant 2 s.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "burn": 0.2
            }
          },
          {
            "id": "sorceress_0_2",
            "name": "Incendie",
            "desc": "Boule de feu gagne +20 % de rayon ; Hydre dure 1 s de plus.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "radius": 0.2,
              "duration": 1
            }
          },
          {
            "id": "sorceress_0_3",
            "name": "Couvoir ardent",
            "desc": "chaque quatrième Boule de feu invoque une petite hydre de 2 s ; les hydres restent limitées à deux actives.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "brood"
            }
          }
        ]
      },
      {
        "id": "sorceress_1",
        "name": "Froid",
        "skills": [
          "sorceress_orb",
          "sorceress_blizzard"
        ],
        "nodes": [
          {
            "id": "sorceress_1_0",
            "name": "Gel mordant",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "sorceress_1_1",
            "name": "Prison froide",
            "desc": "les impacts directs de l'Orbe gèlent 1 s les ennemis déjà ralentis, selon les limites de contrôle.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "freeze": true
            }
          },
          {
            "id": "sorceress_1_2",
            "name": "Hiver prolongé",
            "desc": "Blizzard dure 1 s de plus ; +15 % de rayon des effets de froid de cette branche.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "radius": 0.15,
              "duration": 1
            }
          },
          {
            "id": "sorceress_1_3",
            "name": "Éclatement glacial",
            "desc": "l'Orbe termine sa course en libérant huit éclats à 60 % des dégâts d'un éclat normal.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "orbBurst"
            }
          }
        ]
      },
      {
        "id": "sorceress_2",
        "name": "Foudre",
        "skills": [
          "sorceress_chain"
        ],
        "nodes": [
          {
            "id": "sorceress_2_0",
            "name": "Surcharge",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "sorceress_2_1",
            "name": "Conduction",
            "desc": "deux cibles supplémentaires par chaîne.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "jumps": 2
            }
          },
          {
            "id": "sorceress_2_2",
            "name": "Décharge rapide",
            "desc": "délai réduit de 15 %.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "cdr": 0.15
            }
          },
          {
            "id": "sorceress_2_3",
            "name": "Double tempête",
            "desc": "chaque lancement se répète une fois après 0,3 s à 60 % des dégâts ; la répétition ne se répète pas.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "doubleStorm"
            }
          }
        ]
      }
    ],
    "necromancer": [
      {
        "id": "necromancer_0",
        "name": "Armée",
        "skills": [
          "necromancer_skeletons"
        ],
        "nodes": [
          {
            "id": "necromancer_0_0",
            "name": "Maîtrise des morts",
            "desc": "+25 % de dégâts des squelettes.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.25
            }
          },
          {
            "id": "necromancer_0_1",
            "name": "Légion",
            "desc": "deux squelettes supplémentaires.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "allies": 2
            }
          },
          {
            "id": "necromancer_0_2",
            "name": "Os renforcés",
            "desc": "+25 % de vie des squelettes.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "allyHP": 0.25
            }
          },
          {
            "id": "necromancer_0_3",
            "name": "Commandant spectral",
            "desc": "toutes les 8 s, un squelette devient champion durant 3 s et inflige deux fois ses dégâts habituels.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "commander"
            }
          }
        ]
      },
      {
        "id": "necromancer_1",
        "name": "Os",
        "skills": [
          "necromancer_spear"
        ],
        "nodes": [
          {
            "id": "necromancer_1_0",
            "name": "Moelle noire",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "necromancer_1_1",
            "name": "Perce-chair",
            "desc": "deux ennemis traversés supplémentaires.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "pierce": 2
            }
          },
          {
            "id": "necromancer_1_2",
            "name": "Fracture",
            "desc": "+10 points de chance critique.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "crit": 0.1
            }
          },
          {
            "id": "necromancer_1_3",
            "name": "Trident funèbre",
            "desc": "chaque lance ajoute deux lances latérales à 60 % de ses dégâts.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "trident"
            }
          }
        ]
      },
      {
        "id": "necromancer_2",
        "name": "Corruption",
        "skills": [
          "necromancer_nova",
          "necromancer_corpse",
          "necromancer_curse"
        ],
        "nodes": [
          {
            "id": "necromancer_2_0",
            "name": "Toxicité",
            "desc": "+20 % de dégâts de Nova et Explosion.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "necromancer_2_1",
            "name": "Malédiction longue",
            "desc": "Amplification dure 2 s de plus.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "curseDuration": 2
            }
          },
          {
            "id": "necromancer_2_2",
            "name": "Souillure",
            "desc": "+20 % de rayon des trois compétences.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "radius": 0.2
            }
          },
          {
            "id": "necromancer_2_3",
            "name": "Mort contagieuse",
            "desc": "un ennemi sous Amplification qui meurt laisse un nuage de 2 s, infligeant chaque seconde 20 % des dégâts totaux de la Nova ; maximum un déclenchement toutes les 0,5 s.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "deathCloud"
            }
          }
        ]
      }
    ],
    "paladin": [
      {
        "id": "paladin_0",
        "name": "Croisé",
        "skills": [
          "paladin_zeal",
          "paladin_shield"
        ],
        "nodes": [
          {
            "id": "paladin_0_0",
            "name": "Ferveur",
            "desc": "+20 % de dégâts de Zèle.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "paladin_0_1",
            "name": "Foi solide",
            "desc": "+30 % de capacité du Bouclier.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "shield": 0.3
            }
          },
          {
            "id": "paladin_0_2",
            "name": "Grâce",
            "desc": "chaque troisième touche de Zèle rend 1 % de vie maximale, maximum une fois toutes les 2 s.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "healHit": true
            }
          },
          {
            "id": "paladin_0_3",
            "name": "Représailles",
            "desc": "un Bouclier brisé par les dégâts produit une onde infligeant 150 % des dégâts d'un coup de Zèle ; délai interne de 6 s.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "reprisal"
            }
          }
        ]
      },
      {
        "id": "paladin_1",
        "name": "Jugement",
        "skills": [
          "paladin_hammer",
          "paladin_heavens"
        ],
        "nodes": [
          {
            "id": "paladin_1_0",
            "name": "Lumière",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "paladin_1_1",
            "name": "Échos sacrés",
            "desc": "un marteau supplémentaire par lancement et un trait secondaire supplémentaire pour Poing.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "count": 1
            }
          },
          {
            "id": "paladin_1_2",
            "name": "Rayonnement",
            "desc": "+20 % de rayon des impacts et +20 % de portée des marteaux.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "radius": 0.2
            }
          },
          {
            "id": "paladin_1_3",
            "name": "Double jugement",
            "desc": "chaque quatrième lancement de l'une des deux compétences se répète une fois à 50 % des dégâts.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "doubleJudgment"
            }
          }
        ]
      },
      {
        "id": "paladin_2",
        "name": "Aura",
        "skills": [
          "paladin_holyfire"
        ],
        "nodes": [
          {
            "id": "paladin_2_0",
            "name": "Purification",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "paladin_2_1",
            "name": "Présence",
            "desc": "+25 % de rayon.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "radius": 0.25
            }
          },
          {
            "id": "paladin_2_2",
            "name": "Entrave",
            "desc": "l'aura ralentit de 20 %.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "slow": 0.2
            }
          },
          {
            "id": "paladin_2_3",
            "name": "Bûcher sacré",
            "desc": "un ennemi tué dans l'aura brûle un voisin proche pour 50 % des dégâts d'une pulsation ; l'effet secondaire ne se propage pas.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "pyre"
            }
          }
        ]
      }
    ],
    "barbarian": [
      {
        "id": "barbarian_0",
        "name": "Armes",
        "skills": [
          "barbarian_swing",
          "barbarian_throw"
        ],
        "nodes": [
          {
            "id": "barbarian_0_0",
            "name": "Maîtrise",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "barbarian_0_1",
            "name": "Traversée",
            "desc": "Double lancer gagne un ricochet ; Double attaque peut toucher une cible de plus dans son cône.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "ricochet": 1,
              "targets": 1
            }
          },
          {
            "id": "barbarian_0_2",
            "name": "Coups sauvages",
            "desc": "+10 points de chance critique.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "crit": 0.1
            }
          },
          {
            "id": "barbarian_0_3",
            "name": "Massacre",
            "desc": "chaque troisième touche directe de ces deux compétences produit un cône secondaire à 60 % des dégâts de cette touche.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "massacre"
            }
          }
        ]
      },
      {
        "id": "barbarian_1",
        "name": "Tourbillon",
        "skills": [
          "barbarian_whirl"
        ],
        "nodes": [
          {
            "id": "barbarian_1_0",
            "name": "Acier tournant",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "barbarian_1_1",
            "name": "Rotation longue",
            "desc": "durée augmentée de 0,75 s.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "duration": 0.75
            }
          },
          {
            "id": "barbarian_1_2",
            "name": "Mobilité",
            "desc": "+10 % de vitesse de déplacement pendant Tourbillon.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "move": 0.1
            }
          },
          {
            "id": "barbarian_1_3",
            "name": "Tempête d'acier",
            "desc": "pendant Tourbillon, laisse une entaille au sol toutes les 0,5 s ; elle dure 1 s et inflige un total de 40 % des dégâts d'une frappe de Tourbillon.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "steelStorm"
            }
          }
        ]
      },
      {
        "id": "barbarian_2",
        "name": "Rage",
        "skills": [
          "barbarian_frenzy",
          "barbarian_cry"
        ],
        "nodes": [
          {
            "id": "barbarian_2_0",
            "name": "Fureur",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "barbarian_2_1",
            "name": "Intimidation",
            "desc": "Cri étourdit 0,3 s de plus ; le bonus de déplacement de Frénésie dure 1 s de plus.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "stun": 0.3,
              "duration": 1
            }
          },
          {
            "id": "barbarian_2_2",
            "name": "Souffle guerrier",
            "desc": "délai des deux compétences réduit de 15 %.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "cdr": 0.15
            }
          },
          {
            "id": "barbarian_2_3",
            "name": "Rage vengeresse",
            "desc": "recevoir une touche retire 2 s au délai restant des deux compétences ; maximum une activation toutes les 4 s.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "revenge"
            }
          }
        ]
      }
    ],
    "druid": [
      {
        "id": "druid_0",
        "name": "Vent",
        "skills": [
          "druid_tornado",
          "druid_hurricane"
        ],
        "nodes": [
          {
            "id": "druid_0_0",
            "name": "Bourrasque",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "druid_0_1",
            "name": "Pression",
            "desc": "Tornade traverse deux cibles supplémentaires ; Ouragan gagne +15 % de rayon.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "pierce": 2,
              "radius": 0.15
            }
          },
          {
            "id": "druid_0_2",
            "name": "Saison froide",
            "desc": "Ouragan dure 1 s de plus.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "duration": 1
            }
          },
          {
            "id": "druid_0_3",
            "name": "Cyclone vivant",
            "desc": "pendant Ouragan, une petite Tornade part vers une menace toutes les 2 s, à 50 % des dégâts de Tornade.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "livingCyclone"
            }
          }
        ]
      },
      {
        "id": "druid_1",
        "name": "Terre et feu",
        "skills": [
          "druid_fissure"
        ],
        "nodes": [
          {
            "id": "druid_1_0",
            "name": "Magma",
            "desc": "+20 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "druid_1_1",
            "name": "Faille longue",
            "desc": "durée augmentée de 1 s.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "duration": 1
            }
          },
          {
            "id": "druid_1_2",
            "name": "Double faille",
            "desc": "crée une seconde zone près de la première ; les zones d'un même lancement ne doublent pas les dégâts sur une cible.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "count": 1
            }
          },
          {
            "id": "druid_1_3",
            "name": "Éruption",
            "desc": "une mort dans Fissure produit une petite explosion à 40 % des dégâts totaux d'une Fissure ; maximum une par seconde.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "eruption"
            }
          }
        ]
      },
      {
        "id": "druid_2",
        "name": "Meute",
        "skills": [
          "druid_wolves",
          "druid_grizzly"
        ],
        "nodes": [
          {
            "id": "druid_2_0",
            "name": "Instinct",
            "desc": "+25 % de dégâts des animaux.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.25
            }
          },
          {
            "id": "druid_2_1",
            "name": "Meute élargie",
            "desc": "un loup supplémentaire.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "allies": 1
            }
          },
          {
            "id": "druid_2_2",
            "name": "Robustesse",
            "desc": "+20 % de vie des animaux ; le Grizzly ralentit ses cibles de 30 % pendant 2 s.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "allyHP": 0.2,
              "slow": 0.3
            }
          },
          {
            "id": "druid_2_3",
            "name": "Assaut sauvage",
            "desc": "chaque animal produit une attaque en zone à 120 % de ses dégâts habituels toutes les 8 s.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "wildAssault"
            }
          }
        ]
      }
    ],
    "assassin": [
      {
        "id": "assassin_0",
        "name": "Arts martiaux",
        "skills": [
          "assassin_claw",
          "assassin_venom"
        ],
        "nodes": [
          {
            "id": "assassin_0_0",
            "name": "Griffes affûtées",
            "desc": "+20 % de dégâts de Griffe et du poison de Venin.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.2
            }
          },
          {
            "id": "assassin_0_1",
            "name": "Enchaînement",
            "desc": "Griffe touche une cible de plus dans son cône ; Venin reste actif 1 s de plus.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "targets": 1,
              "duration": 1
            }
          },
          {
            "id": "assassin_0_2",
            "name": "Précision létale",
            "desc": "+10 points de chance critique de Griffe.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "crit": 0.1
            }
          },
          {
            "id": "assassin_0_3",
            "name": "Exécution",
            "desc": "un critique de Griffe contre une cible empoisonnée gagne +30 % de dégâts directs.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "execution"
            }
          }
        ]
      },
      {
        "id": "assassin_1",
        "name": "Pièges",
        "skills": [
          "assassin_sentry",
          "assassin_wake"
        ],
        "nodes": [
          {
            "id": "assassin_1_0",
            "name": "Ingénierie",
            "desc": "+25 % de dégâts.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.25
            }
          },
          {
            "id": "assassin_1_1",
            "name": "Déploiement",
            "desc": "un trait supplémentaire par salve électrique et une vague supplémentaire par salve de feu.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "count": 1
            }
          },
          {
            "id": "assassin_1_2",
            "name": "Mécanismes",
            "desc": "durée des pièges augmentée de 1 s.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "duration": 1
            }
          },
          {
            "id": "assassin_1_3",
            "name": "Sabotage",
            "desc": "à expiration, chaque piège explose pour 50 % des dégâts d'une salve, dans son élément.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "sabotage"
            }
          }
        ]
      },
      {
        "id": "assassin_2",
        "name": "Ombre",
        "skills": [
          "assassin_shadow"
        ],
        "nodes": [
          {
            "id": "assassin_2_0",
            "name": "Double meurtrier",
            "desc": "+25 % de dégâts de la compagne.",
            "cost": 1,
            "tier": 1,
            "minLevel": 5,
            "mods": {
              "damage": 0.25
            }
          },
          {
            "id": "assassin_2_1",
            "name": "Ombre solide",
            "desc": "+30 % de vie de la compagne.",
            "cost": 1,
            "tier": 2,
            "minLevel": 10,
            "mods": {
              "allyHP": 0.3
            }
          },
          {
            "id": "assassin_2_2",
            "name": "Lames jumelles",
            "desc": "ses attaques peuvent toucher une seconde cible voisine.",
            "cost": 1,
            "tier": 3,
            "minLevel": 15,
            "mods": {
              "targets": 1
            }
          },
          {
            "id": "assassin_2_3",
            "name": "Leurre d'ombre",
            "desc": "la compagne crée un leurre de 2 s toutes les 8 s, attirant les ennemis ordinaires proches.",
            "cost": 1,
            "tier": 4,
            "minLevel": 20,
            "mods": {
              "special": "decoy"
            }
          }
        ]
      }
    ]
  },
  "limits": {
    "classSlots": 3,
    "commonSlots": 3,
    "passiveSlots": 6,
    "level": 40,
    "projectiles": 12,
    "chain": 8,
    "allies": 8,
    "cdr": 0.5,
    "mitigation": 0.6
  },
  "synergies": [
    {
      "from": "amazon_multishot",
      "to": "amazon_guided",
      "perRank": 0.04,
      "label": "Maîtrise de l’arc"
    },
    {
      "from": "amazon_guided",
      "to": "amazon_multishot",
      "perRank": 0.04,
      "label": "Maîtrise de l’arc"
    },
    {
      "from": "amazon_fury",
      "to": "amazon_plague",
      "perRank": 0.04,
      "label": "Maîtrise du javelot"
    },
    {
      "from": "amazon_plague",
      "to": "amazon_fury",
      "perRank": 0.04,
      "label": "Maîtrise du javelot"
    },
    {
      "from": "sorceress_fireball",
      "to": "sorceress_hydra",
      "perRank": 0.04,
      "label": "Maîtrise du feu"
    },
    {
      "from": "sorceress_hydra",
      "to": "sorceress_fireball",
      "perRank": 0.04,
      "label": "Maîtrise du feu"
    },
    {
      "from": "sorceress_orb",
      "to": "sorceress_blizzard",
      "perRank": 0.04,
      "label": "Maîtrise du froid"
    },
    {
      "from": "sorceress_blizzard",
      "to": "sorceress_orb",
      "perRank": 0.04,
      "label": "Maîtrise du froid"
    },
    {
      "from": "necromancer_curse",
      "to": "necromancer_skeletons",
      "perRank": 0.04,
      "label": "Armée maudite"
    },
    {
      "from": "necromancer_skeletons",
      "to": "necromancer_corpse",
      "perRank": 0.04,
      "label": "Moisson des cadavres"
    },
    {
      "from": "paladin_shield",
      "to": "paladin_zeal",
      "perRank": 0.04,
      "label": "Combat sacré"
    },
    {
      "from": "paladin_holyfire",
      "to": "paladin_heavens",
      "perRank": 0.04,
      "label": "Jugement sacré"
    },
    {
      "from": "barbarian_swing",
      "to": "barbarian_throw",
      "perRank": 0.04,
      "label": "Maîtrise des deux armes"
    },
    {
      "from": "barbarian_swing",
      "to": "barbarian_frenzy",
      "perRank": 0.04,
      "label": "Maîtrise des deux armes"
    },
    {
      "from": "druid_tornado",
      "to": "druid_hurricane",
      "perRank": 0.04,
      "label": "Maîtrise du vent"
    },
    {
      "from": "druid_hurricane",
      "to": "druid_tornado",
      "perRank": 0.04,
      "label": "Maîtrise du vent"
    },
    {
      "from": "druid_wolves",
      "to": "druid_grizzly",
      "perRank": 0.04,
      "label": "Maîtrise des invocations"
    },
    {
      "from": "druid_grizzly",
      "to": "druid_wolves",
      "perRank": 0.04,
      "label": "Maîtrise des invocations"
    },
    {
      "from": "assassin_venom",
      "to": "assassin_claw",
      "perRank": 0.04,
      "label": "Griffes empoisonnées"
    },
    {
      "from": "assassin_venom",
      "to": "assassin_shadow",
      "perRank": 0.04,
      "label": "Ombre empoisonnée"
    }
  ]
};
