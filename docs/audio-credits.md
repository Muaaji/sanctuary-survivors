# Sons : Kenney CC0

Les sons du jeu proviennent de trois packs officiels de **Kenney** :

- [Impact Sounds 1.0](https://kenney.nl/assets/impact-sounds), publié en 2019 ; [archive téléchargée](https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip).
- [Interface Sounds 1.0](https://kenney.nl/assets/interface-sounds), publié en 2020 ; [archive téléchargée](https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip).
- [RPG Audio 1.0](https://kenney.nl/assets/rpg-audio), publié en 2014 ; [archive téléchargée](https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip).

Chaque page et chaque licence fournie dans son archive indiquent **Creative Commons Zero / CC0** : [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). Les fichiers de licence originaux, copiés sans modification, sont conservés dans `assets/audio/licenses/kenney-impact.txt`, `kenney-interface.txt` et `kenney-rpg.txt`. Attribution non obligatoire ; Kenney reste crédité ici. Les archives complètes ne sont pas chargées par le jeu : seuls neuf échantillons sont distribués.

| Fichier local WAV | Pack / fichier source exact | Événements |
| --- | --- | --- |
| impact-light.wav | Impact / Audio/impactGeneric_light_000.ogg | hit |
| impact-medium.wav | Impact / Audio/impactSoft_medium_000.ogg | enemyDeath |
| impact-heavy.wav | Impact / Audio/impactSoft_heavy_000.ogg | playerHurt |
| wood.wav | Impact / Audio/impactWood_medium_000.ogg | chest, deny, victory |
| click.wav | Interface / Audio/click_001.ogg | gem, select |
| coins.wav | RPG / Audio/handleCoins.ogg | coin, essence, buy, achv |
| book.wav | RPG / Audio/bookOpen.ogg | heal, levelup, openShop, closeShop |
| creak.wav | RPG / Audio/creak1.ogg | bossRoar, gameover |
| cloth.wav | RPG / Audio/cloth1.ogg | cast, freeze, magnet |

## Transformations et contrôle technique

Décodage des OGG avec libsndfile via Python SoundFile, passage en mono (moyenne des canaux), rééchantillonnage linéaire à 32 000 Hz, lissage par convolution `[0.2, 0.6, 0.2]`, atténuation uniquement si le pic dépasse 0,65, puis rampes linéaires d’entrée/sortie de 5 ms. Export WAV PCM signé 16 bits. Aucun son n’est amplifié lors de la conversion. Le manifeste `assets/audio/manifest.json` contient fichier d’origine, SHA-256 source, durée, pic, RMS et taille pour vérifier la provenance et les bornes.

Palette : 225 400 octets de WAV, neuf fichiers mono, durées de 0,10 à 0,85 s, aucun écrêtage numérique. WAV PCM évite de dépendre du support OGG et convient au décodage Web Audio de Chrome et Safari. Les tests vérifient le format et les bornes numériques ; ils ne remplacent pas une écoute dans chaque navigateur ou sur chaque appareil.

## Mixeur

`Sound.init()` crée le contexte et charge la petite palette au premier geste utilisateur (pointeur capturé, clavier ou lancement existants). Rien n’est téléchargé à l’ouverture de la page seule. Les événements survenus avant disponibilité du buffer restent silencieux : ils ne sont jamais rejoués en rafale après le décodage. Un chargement/décodage échoué est mémorisé pour la session ; aucune synthèse de secours ne produit un son agressif.

Les réglages existants master/SFX/UI et les sliders restent actifs. Les gains locaux vont de 0,18 à 0,50 ; un compresseur de bus atténue les crêtes cumulées. Les variations ne consomment aucun hasard de combat. Le plafond est de dix voix, dont trois réservées aux retours importants ; une blessure du joueur, un boss ou une interface importante peut remplacer une voix secondaire. Les coups et morts répétées sont espacés, davantage avec l’option de réduction de foule. Les nœuds sont déconnectés à la fin et leur libération est idempotente.

`node tests/audio.test.cjs` vérifie lazy loading, décodeurs en échec, silence sans contexte/buffer, volumes/mute, reprise du contexte, throttling dès le temps zéro, limite/priorité de voix, absence d’oscillateur et format/licences des ressources.
