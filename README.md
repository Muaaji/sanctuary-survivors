# Sanctuary Survivors

Un jeu de survie 2D dans le navigateur, inspiré de Diablo II : sept héros, cinq actes et des combinaisons de compétences, d'armes évoluées et de talents.

## Jouer

```sh
python3 -m http.server 8090 --bind 127.0.0.1
```

Ouvrir **http://127.0.0.1:8090/index.html**. Aucun paquet ni build à installer.

- **ZQSD / WASD / flèches** : déplacement.
- **Échap** : pause.
- **T** ou bouton **Talents** : consulter et choisir les talents.
- **E** : entrer dans la boutique quand le commerçant est proche.
- Les attaques sont automatiques, et laissent le personnage se déplacer.

Les ennemis lâchent de l'expérience, de l'or et des soins. Chaque niveau propose une compétence de classe, une arme commune et un passif (les catégories complètes redistribuent leur choix) ; des relances sont disponibles. Un point de talent est gagné tous les cinq niveaux. Les coffres d'élites et de boss peuvent faire évoluer une arme. Chaque acte dure trois minutes de vagues, puis son boss apparaît. Tu disposes de deux minutes pour le vaincre : le dépassement du délai provoque la défaite. La carte et les vagues de l’acte suivant ne commencent qu’après sa mort. La campagne se termine après les cinq boss ; elle peut durer de quinze à vingt-cinq minutes de jeu.

## Chaleur et destinations

Choisir d’abord un héros, puis sélectionner la campagne complète ou un acte sur son écran de préparation. Terminer une destination à chaleur 0 débloque ses pactes. Six pactes proposent cinq rangs chacun, pour une chaleur totale de **0 à 30** : vie ennemie (+20 % par rang), dégâts (+15 %), vitesse (+8 %), chance d’élite (+4 points), expérience réduite (−10 %) et cadence des vagues (+15 %). Les effets sont fixes pendant la partie. La victoire accorde un bonus d’essence et permet de recommencer avec un point de chaleur supplémentaire.

Cette version propose trente points de chaleur ; elle ne possède pas encore une progression de chaleur sans limite.

## Progression par héros et statistiques

Les cinq actes et leur meilleure chaleur sont sauvegardés **pour chaque classe séparément**. Les cartes de sélection indiquent les actes terminés ; après le choix du héros, son écran de préparation affiche sa progression détaillée et permet de choisir l’acte et la chaleur. Une victoire du Paladin ne débloque pas les pactes de la Sorcière. Les anciennes victoires communes sont archivées sans attribution automatique à une classe.

**C** ou le bouton **Stats** ouvre la fiche et suspend le combat. Elle affiche mêlée, distance, dégâts généraux, vitesse, armure, esquive, vie, mana/régénération, critique, dégâts critiques, vitesse d’attaque et réduction des cooldowns. Chaque classe possède ses bonus et malus détaillés sur sa carte. Six nouveaux passifs améliorent la mêlée, la distance, l’esquive, le mana, les dégâts critiques et la vitesse d’attaque ; les six emplacements de passifs restent une contrainte de build.

Les dégâts de mêlée s’appliquent aux frappes, lames orbitales et compagnons ; les dégâts à distance aux autres sorts. Le bonus de dégâts généraux s’ajoute au bonus de catégorie. Un point d’armure réduit les dégâts de 2 %, avec un plafond de 60 %. L’esquive est plafonnée à 45 %. Les critiques font normalement 200 % des dégâts, modifiés par la classe et les passifs ; les dégâts périodiques ne critiquent pas. La vitesse d’attaque accélère les frappes, projectiles et compagnons ; la réduction des cooldowns agit sur toutes les compétences, jusqu’à 50 % avec leurs rangs et talents.

Les sorts de classe dépensent un mana limité au déclenchement et attendent sa régénération si nécessaire. La régénération est de 1,5 à 4,5 mana/s selon le héros ; une compétence prête sans mana porte la mention « Mana ». Chaque héros conserve une petite attaque gratuite. Les attaques physiques, lames orbitales et compagnons n’en consomment pas. La réserve de mana est affichée dans l’orbe droite, les points de talent sur leur bouton. Les coûts et recharges apparaissent dans les infobulles des compétences.

## Construire un personnage

- **3 compétences de classe** parmi cinq, jusqu'au rang 5.
- **3 armes communes** parmi dix, jusqu'au rang 5 puis évolution.
- **6 passifs** parmi seize, jusqu'au rang 5.
- **8 points de talent** au niveau 40, trois branches par classe et un seul ultime par partie.

Au **rang 5**, un sort standard devient éligible à son ultime avec son **passif associé rang 1**. Un sort de classe demande au moins un talent acquis dans sa branche associée. Le niveau suivant garantit une proposition d’ultime parmi les trois cartes ; elle remplace le sort dans son emplacement. Les coffres conservent leurs améliorations ordinaires.

La **Bibliothèque de savoir**, accessible depuis l’accueil et la pause, conserve 184 entrées (sorts, passifs, talents et ultimes). Une entrée inconnue affiche **?**, une proposition aperçue reste **grisée**, une acquisition est révélée. Les découvertes sont sauvegardées dans ce navigateur, entre les parties. Les cartes de niveau distinguent **STANDARD** (doré) et **CLASSE** (violet), avec une mention **ULTIME**.

Les arbres permettent, par exemple, de spécialiser une Sorcière en feu, froid ou foudre ; un Nécromancien en armée, os ou corruption ; un Assassin en arts martiaux, pièges ou ombre.

## Contenu

**35 compétences de classe**, **10 armes physiques communes**, **16 passifs**, **10 évolutions**, **84 talents**, **61 icônes**, invocations, pièges, effets élémentaires et cinq cartes distinctes. Le Sanctuaire conserve l'essence et les améliorations permanentes entre les parties. Les choix de la partie repartent de zéro.

Les cartes et les sprites externes se trouvent dans `assets/`. Les effets des sorts et les animaux invoqués sont dessinés en Canvas ; les icônes simples sont en SVG.

## Téléphone en paysage

Le mode tactile s’active automatiquement sur les appareils détectés comme tactiles, ou au premier contact tactile. Aucun bouton d’activation n’est affiché. Les menus restent accessibles en portrait ; le combat demande le paysage. Ce mode ne modifie pas la préférence de visée enregistrée sur ordinateur.

Le joystick à gauche gère les déplacements ; les boutons à droite lancent les sorts actifs ou activent les auras. Les sorts passifs restent automatiques. La visée est toujours automatique dans ce mode, et les nouveaux sorts reçoivent un raccourci sans demander de clavier. Un bouton permet de parler au commerçant lorsqu’il est à portée. Les menus en haut donnent accès aux talents, aux statistiques, à l’inventaire et à la pause.

Tourner le téléphone en portrait suspend une partie en cours et affiche une invitation à revenir en paysage ; toucher « Reprendre » relance la partie. Les commandes se relâchent aussi à la perte de focus et lors de l’ouverture des menus. L’affichage tient compte des encoches et des petits écrans, jusqu’à 568 × 320 en paysage. Vérifié en émulation mobile dans Chrome ; une vérification sur appareil réel reste utile pour le confort tactile et les performances.

## Maintenance et tests

- `js/survivors/catalog.js` : catalogue et arbres.
- `js/survivors/runtime.js` : combat et règles.
- `js/survivors/integration.js` : menus, inventaire, progression, HUD et rendu.
- `css/survivors.css` : interface additionnelle.
- `assets/survivors/icons/` : icônes.
- `docs/sorts-et-talents.md` : proposition complète de règles.
- `FREEBUFF-CODEX-INTEGRATION.md` : frontière d'intégration avec le code existant.

```sh
node tests/survivors.test.cjs
SURVIVORS_STRESS=1 SURVIVORS_BALANCE=1 node tests/survivors.test.cjs
```

53 suites couvrent les règles, les retours après la mort, les choix mixtes, les collisions continues, les bords de carte et la chaleur. Le benchmark compare les sept compétences de départ aux rangs 1, 3 et 5, sur une cible et un groupe, avec les mêmes passifs et une arme commune identique aux rangs avancés. Les tests de stress parcourent les cinq actes avec des builds maximaux et l’invulnérabilité : ils valident le fonctionnement, pas la difficulté d’une partie humaine. Résultats dans `docs/verification.txt`.

Le jeu est maintenant servi depuis ce dossier de projet ; l’ancienne copie Freebuff est conservée.

Les armes communes sont désormais des dagues, une hache, un arc, une épée, une lance, une arbalète, une faux, une masse, une fronde et un fléau. Leurs petits sprites PNG et leurs icônes ont été refaits. Voir `docs/armes-et-mana.md` pour les comportements et le budget de mana.

## Sorts actifs et passifs

Les armes, attaques physiques simples, compagnons et Venin sont passifs et gratuits. Les autres compétences de classe se déclenchent avec **1, 2 ou 3**, correspondant aux trois emplacements de classe, ou en cliquant leur icône. **AUTO** désigne une passive. Viser avec la souris : projectiles dans sa direction, zones à sa position, éclairs et Poing des cieux sur un ennemi à proximité. Le viseur est limité à 450 unités du héros.

Seules les actives coûtent du mana et elles respectent leur recharge. Feu sacré et Ouragan sont des auras à bascule : la même touche active ou désactive ; elles consomment respectivement 4 et 6 mana/s, plus le coût initial. Leur bordure devient verte lorsqu’elles sont allumées. Elles s’arrêtent automatiquement quand le mana manque. Le combat de base continue pendant la récupération.

Le cadre de vie et mana utilise l’image fournie, conservée dans `assets/ui/hud-frame-user.png`. Un viewport SVG affiche sa partie utile sans modifier l’original. Les orbes, chiffres, compétences et raccourcis restent des éléments interactifs superposés et s’adaptent à la largeur de la fenêtre.

À l’acquisition d’une nouvelle active, un panneau suspend le combat et demande son raccourci. Appuyer sur un chiffre ou une lettre libre, ou accepter la touche proposée. Les touches de déplacement et de menus ainsi que les doublons sont refusés. Les auras suivent la même règle. Les montées de rang ne redemandent pas de touche. Le raccourci choisi est affiché sur l’icône et remplace les raccourcis fixes 1–3 décrits précédemment.

La case **Visée automatique**, disponible à la préparation et dans le HUD, choisit les cibles proches à la place du curseur. Décochée, les sorts ciblables suivent la souris. Ce choix est conservé entre les parties ; le lancement reste manuel avec le raccourci choisi.

La révision Diablo II ajoute des synergies de classe, des recettes d’armes logiques, des effets animés et cinq rencontres de boss distinctes. La vie de base est réduite de 40 % et les soins sont raréfiés. Détails : `docs/revision-d2-bosses.md`.
