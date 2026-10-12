# Sanctuary Survivors — fan-game roguelite inspiré de Diablo

Un roguelite « survivors-like » jouable **directement dans le navigateur**, fait à 100 % en
JavaScript vanilla + Canvas, avec les sprites **pixel-art dessinés à la main dans le code**
(zéro asset externe, zéro dépendance, zéro build).

> ⚠︎ *Fan-game non officiel : les noms d'ennemis et de boss sont des hommages renommés
> (Le Boucher, Andarial, Seigneur du Chaos…). Aucun asset protégé par Blizzard n'est réutilisé.*

## Lancer le jeu

**Option 1 (la plus simple) :** double-clique sur `index.html` — ça marche tel quel.

**Option 2 (recommandée) :** servire le dossier avec un petit serveur statique :

```bash
python3 -m http.server 8090
# puis ouvrir http://localhost:8090
```

## Contrôles

| Action        | Touches                                    |
|---------------|--------------------------------------------|
| Se déplacer   | **ZQSD** (AZERTY) · **WASD** (QWERTY) · **flèches** |
| Pause         | **Échap**                                  |
| Démarrer / rejouer | **Entrée**                            |

Les armes attaquent **toutes seules** — ton seul rôle est de *survivre, kiter et ramasser les
gemmes d'expérience*.

## Boucle de jeu (standards du genre survivors)

- Des vagues de monstres apparaissent en continu autour de toi, de plus en plus denses.
- Les monstres lâchent des **gemmes d'XP** : passe dessus pour les ramasser.
- Chaque niveau : **3 cartes d'amélioration** (nouvelle arme, niveau d'arme ou passif).
  Possibilité de **relancer la pioche** (2 fois).
- **Boss scriptés** : Le Boucher (min 2), Andarial (min 7), Seigneur du Chaos (min 14).
- Survie **15 minutes** = victoire. Chaque minute, les monstres deviennent plus forts
  (jukebox de vagues plus agressives, apparition d'**élites dorées** qui lâchent des coffres).

## Contenu

- **8 armes** : Épée courte (arc de lame), Trait de feu, Lance d'os (perce),
  Hache de lancer (orbite), Éclair en chaîne, Dague empoisonnée (DoT),
  Aura sacrée (dégâts permanents), Crâne tombant (explosions de zone).
- **7 passifs** : Force, Armure, Vitalité, Célérité, Aimant, Chance, Rythme.
- **4 familles de monstres** : Chuteux (fallen), Squelette, Zombie, Bouc-démon —
  chacun avec vitesse / PV / dégâts / génération de sprite propres.
- **Art hook pixel-art procédural** : chaque sprite est *écrit en ASCII-art dans le code*
  ([js/art.js](js/art.js)), décompressé à la volée. Le sol de crypte est généré
  procéduralement (dalles, fissures, mousse, ossements).
- **Audio 100 % synthétisé** en WebAudio ([js/main.js](js/main.js)) — aucun fichier son,
  bips 8-bit pour les coups, gemmes, boss, level-up, victoire.
- **HUD gothique** : orbes de vie rouge / mana bleu (style Diablo), barre d'XP dorée,
  compteur de kills, timer, slots d'armes avec infobulles au survol.
- **Stats de fin de partie** + bouton « Partager sur Discord » (copie un résumé + ouvre Discord).
- Raretés cosmétiques sur les cartes (commun / rare / épique), vignette, screen-shake,
  particules de sang et d'os, chiffres de dégâts flottants.

## Structure du code

```
index.html          — structure, HUD DOM, overlays (titre / level-up / pause / mort / victoire)
css/style.css       — thème gothique (palette Diablo : umbers, rouge sang, or terni)
js/helpers.js       — maths, pools, easing, décompression des sprites RLE, partage Discord
js/art.js           — tous les sprites en pixel-art + génération du sol
js/data.js          — armes, ennemis, vagues, boss, scaling par minute (balance ici ↓)
js/entities.js      — joueur, ennemis, projectiles, zones de dégâts, pickups, particules
js/levels.js        — spawner de vagues, IA d'attaques des armes, cartes de level-up
js/main.js          — boucle requestAnimationFrame, caméra, rendu canvas, HUD, audio, menus
```

## Équilibrer la difficulté

Tout se règle dans [js/data.js](js/data.js) :

- `WIN_TIME` — durée d'une partie (15 min par défaut).
- `ENEMY_BASE` — PV / vitesse / dégâts / XP de chaque monstre.
- `SPAWN_MINUTES` — quels monstres apparaissent par minute et à quel rythme.
- `MINUTE_SCALING` — multiplicateur de PV/dégâts par minute.
- `BOSSES` — horaire d'apparition, HP, dégâts des trois boss.
- `WEAPONS` / `PASSIVES` — table de niveau de chaque arme / passif (8 niveaux max, 5 pour les passifs).

## Idées d'évolutions (si tu veux aller plus loin)

- **Évolutions d'armes** (épée max + armure max → lame sainte, à la Vampire Survivors).
- Coin des **personnages** : choisir sa classe au départ (guerrier robuste, archère rapide, sorcière fragile).
- Méta-progression : l'or ramassé débloque des bonus permanents entre les runs (localStorage).
- Un **map boss final** : le Seigneur du Chaos pourrait envoyer des projectiles à esquiver.
- V骏 un mode « 20 minutes » avec un vrai boss final à 20:00.
