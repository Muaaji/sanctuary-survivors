# Intégration Codex / Freebuff — Sanctuary Survivors

## Périmètre

Les ajouts sont dans `js/survivors/`, `css/survivors.css`, `assets/survivors/icons/` et `tests/survivors.test.cjs`. Trois scripts sont chargés après `js/main.js` dans `index.html`.

Le code de Freebuff (`main.js`, `levels.js`, `data.js`, `entities.js`, `art.js`, `assets.js`, `helpers.js`) est conservé. Ses dernières modifications de cadence des vagues, des bornes de spawn et du menu de classes ont été reprises dans la copie de validation. La nouvelle intégration remplace ensuite les points d'entrée de combat, d'inventaire, de rendu et de progression au chargement. Le seul changement à `systems.js` corrige cinq délais audio, exprimés en secondes au lieu des millisecondes prévues.

## Contenu jouable

- Sept classes, cinq compétences chacune : 35 compétences de classe automatiques.
- Dix armes communes, dix passifs et dix évolutions.
- Trois emplacements de classe, trois armes communes, six passifs.
- Compétences sur huit rangs ; passifs sur cinq rangs.
- Point de talent tous les cinq niveaux, jusqu'au niveau 40. Trois branches de quatre talents par classe : 84 talents et un seul ultime par partie.
- Invocations, tourelles, poison, saignement, brûlure, malédiction, gel, ralentissement, étourdissement et barrières.
- Cadavres et fragments spectraux pour les combats de boss du Nécromancien.
- Évolutions proposées dans les coffres d'élites et de boss, à partir du niveau 10, avec une arme rang 8 et son passif rang 3.
- Les récompenses sont mises en file : aucun choix perdu quand plusieurs niveaux sont gagnés d'un coup.
- Cinq actes successifs : trois minutes de vagues puis un boss, avec deux minutes maximum pour le vaincre. L’acte suivant et sa carte attendent sa mort. La campagne se termine après le cinquième boss ; le dépassement d’un délai provoque la défaite.
- Caméra au zoom 1 : héros 48 px, monstres 32 px et boss 64 px. Les cartes restent en monde 2048 × 2048.

## API de maintenance

- `window.SurvivorCatalogue` : définitions des armes, classes, passifs, recettes et arbres.
- `window.SurvivorRuntime` : statistiques calculées, combat et état temporaire de la partie.
- `window.SurvivorIntegration` : version, références du catalogue, du moteur et de certains points d'entrée d'origine.
- `catalog.js` ne dépend pas du DOM. `runtime.js` dépend des entités et helpers de Freebuff. `integration.js` relie le moteur au jeu et aux écrans.
- Les fonctions remplacées comprennent : `updateWeapons`, `updateEnemies`, `updateProjectiles`, `updateZones`, `updateTraps`, `damageEnemy`, `killEnemy`, `collectPickup`, `checkLevelUp`, `updateProgress`, `draw`, les choix de progression, le HUD et le choix des classes. Les méthodes de Player liées aux acquisitions, à la vie et au mana sont adaptées.
- Pour étendre les nouvelles règles, modifier les modules Survivors plutôt qu'une fonction historique remplacée. Les sprites et cartes restent gérés par `Sprites` ; la méta-progression et les réglages restent gérés par `Meta` et `Settings`.
- `?legacy=1` désactive la couche d'intégration pour comparer le code historique pendant un diagnostic ; ce n'est pas le mode de jeu principal.

## Vérification

```sh
node tests/survivors.test.cjs
SURVIVORS_STRESS=1 node tests/survivors.test.cjs
```

Les 14 suites vérifient les acquisitions, les 45 comportements de combat, les dix recettes, les arbres, les cumuls, les contrôles sur les boss, les files de récompenses, la fin de partie et l'expiration des effets secondaires.

Le stress test simule les cinq actes pour chaque classe avec un build maximal prédéfini et invulnérabilité du joueur : il valide la stabilité et le déclenchement des boss/victoire, pas la difficulté d'une partie normale. L'équilibrage reste une première version à affiner par des parties humaines.

Les icônes SVG et les petits effets Canvas sont originaux et sans dépendances. Les corps des animaux invoqués sont dessinés en Canvas. Le cahier des règles accepté est conservé dans `docs/sorts-et-talents.md`.

## Corrections du 12 octobre

La source active est maintenant le dossier de ce projet, servie sur le port 8090. L’ancienne copie dans les données de Freebuff est conservée comme sauvegarde et n’est plus la source du serveur.

Ajouts : transitions de menus nettoyées après la mort/victoire, caméra bornée avec adaptation aux grandes fenêtres, apparition des vagues hors champ, choix de niveau par famille, collision des projectiles sur le segment parcouru, petits sprites de projectiles et arcs de mêlée, ajustement Tornade/Boule de feu et chaleur réglable. `SurvivorHeat` expose `selected`, `active`, `set()` et `factors()`. Les multiplicateurs s’appliquent aux ennemis et aux boss lors de leur création ; la densité et la vitesse restent plafonnées pour préserver la lisibilité et les performances.

## Statistiques et records par classe

`js/survivors/stats.js` est chargé avant l’intégration et expose les sept profils, leurs attributs calculés, les catégories de dégâts, les attaques affectées par la vitesse et les coûts de mana. Le moteur applique ces attributs lors du calcul d’un sort et de ses critiques. L’intégration gère l’armure/esquive, la réserve de mana et sa régénération, les six passifs supplémentaires et la fiche en pause (C).

Les records d’actes passent à `survivors_contracts` version 2 : `byClass`, indexé par identifiant de classe. `SurvivorActs.useClass(id)` sélectionne la fiche ; son getter `cleared` renvoie uniquement les cinq records de cette classe. Les données communes antérieures sont archivées, sans accorder de victoire à une classe arbitraire.

## Parcours de préparation

Une carte de classe appelle désormais `SurvivorIntegration.showRunSetup(classId)`. L’état `setup` suspend le jeu et montre `ss-run-setup`, avec la progression de ce héros, la destination et les pactes. Seul « Lancer la descente » appelle `startRun()` et applique les réglages à une nouvelle partie. Retour/Échap revient au choix des classes ; le bouton de victoire « Pactes / choisir un acte » ouvre la préparation du héros actuel. Les reprises immédiates conservent leur raccourci.

## Armes physiques et économie de mana

Les dix IDs communs restent stables mais portent désormais `mode: weapon`, `weaponKind` et `attackType`. `SurvivorRuntime.castWeapon()` gère les tirs, rebonds, coups en ligne, tailles et balayages ; le fléau utilise l’orbite. Leurs ultimes restent physiques. Les icônes et treize sprites PNG transparents sont générés par `tools/build-weapon-sprites.py`, chargés par `weapon-art.js`. L’arbalète a une silhouette spécifique ; elle tire un carreau, pas un sprite d’arbalète.

La régénération a été réduite, les coûts augmentés et les sorts servis à tour de rôle pour éviter la famine des sorts coûteux. Les armes sont gratuites, une attaque de base faible reste disponible pour chaque classe, et les emplacements indiquent le manque de mana. `manaWaits`, `casts` et `damageBySkill` servent aux vérifications de budget et de dégâts.

## Compétences passives et actives

`SurvivorStats.activation()` classe les armes, frappes simples, compagnons et Venin comme passifs ; les auras comme bascules ; les autres sorts comme actifs. `SurvivorRuntime.activate(index, point)` valide état, recharge, cible/cadavre et mana avant le déclenchement. `Player.cast` est relié aux touches historiques 1–3, les icônes actives sont cliquables, et le pointeur Canvas fournit la visée en coordonnées du monde (caméra bornée, zoom, rayon 450). Les passives ne paient plus de mana.

Le moteur ne lance plus les actives automatiquement. Les auras déduisent leur coût par seconde et enlèvent leurs zones lors de la désactivation ou du manque de mana. Les simulations activent explicitement les sorts pour reproduire un joueur ; elles ne valident pas le ressenti des nouveaux contrôles. Trente-deux suites couvrent notamment visée, coût, cooldown, pause, passives gratuites et bascules. Le navigateur confirme le raccourci 1, le viseur et le mana passé de 140 à 131.

## Révision D2 et rencontres

`catalog.js` ajoute vingt liens de synergie de classe et remplace les dix partenaires d’armes par des statistiques cohérentes. `bosses.js` gère les cinq cycles distincts, phases, charges, invocations et zones hostiles annoncées, séparées des zones alliées. Leur durée et leur nombre sont bornés, leurs effets cessent à la mort du propriétaire. `spell-art.js` charge les feuilles pixel transparentes générées par `tools/build-spell-sprites.py`. La source active conserve les ajouts d’équipement intégrés parallèlement.

Les HP de base sont calculés avec 60 au lieu de 100 ; les soins de butin sont filtrés et réduits, sans modifier l’XP ni l’or. La victoire de campagne requiert les cinq boss. Les tests couvrent les mécaniques et les ressources ; voir `docs/revision-d2-bosses.md`.

## Horloges d’acte et délais de boss

`SurvivorActs` expose désormais `index`, `elapsed`, `phase`, `bossStartedAt`, `deadline` et `remaining()`. `currentActIndex()` suit cet index explicite ; `Game.minute` sélectionne les vagues de l’acte courant et reste borné pendant le duel. `Game.time` continue à mesurer le temps joué, incluant les combats de boss. Le mode acte isolé utilise les mêmes horloges. Les menus suspendent les horloges. Les boss ont un `bossTempo` de 1,2, appliqué aux annonces, cadences, charges, projectiles et images d’animation. Les durées actives des zones restent inchangées.
