# Plan de refonte de l’équilibrage — Sanctuary Survivors

> **Statut :** plan de travail, pas une nouvelle table de valeurs ni un accord pour modifier le gameplay. Les nombres cités décrivent l’état actuel ou des repères à tester. Ils ne sont pas des réglages finaux.
>
> **But :** obtenir une progression saine, lisible et testable où les sept classes et plusieurs styles de build peuvent survivre aux vagues et tuer les boss sans rendre les améliorations permanentes, l’équipement, l’or ou la chaleur obligatoires.

## Décisions utilisateur retenues — 12 octobre 2026

Ces décisions remplacent les anciennes hypothèses de campagne et de délai de boss dans les sections historiques ci-dessous. Le contrat de jeu est maintenant implémenté : actes autonomes, trois rencontres, escalade continue et slot réservé. Les deux intermédiaires sont désormais des champions de monstres ordinaires : dix sprites dédiés, deux par acte, avec silhouettes plus massives et comportement de leur famille. Les valeurs numériques restent une première calibration à mesurer en parties humaines. Les sections historiques décrivent le moteur antérieur.

- **Un acte = une partie autonome.** Le mode campagne est supprimé. Chaque départ/recommencement remet le héros au niveau 1 et réinitialise XP, compétences/armes/passifs de run, talents, mana et or de run. Les découvertes, équipements et améliorations permanentes restent persistants.
- **Six minutes de montée**, avec un boss intermédiaire à **2:00**, un deuxième à **4:00**, puis le boss final propre à l’acte à **6:00**.
- Les apparitions suivent le temps de jeu actif, sans attendre la mort du boss précédent. Les vagues continuent pendant les duels. Si un intermédiaire n’est pas éliminé, il reste une menace supplémentaire.
- **La mort du boss final termine immédiatement l’acte**, même si un intermédiaire reste vivant. Aucun autre acte ne démarre automatiquement.
- **Aucun délai maximal pour tuer un boss**, aucune défaite automatique à une échéance. La défaite survient par mort du héros.
- La difficulté des monstres continue de monter sans plafond avec le temps, notamment après 6:00, pour empêcher une situation de farm durable. Cette escalade est distincte de la chaleur, qui conserve son maximum de 30.
- Les cinq actes ont des compositions et comportements de monstres plus distincts, adaptés à un héros qui démarre niveau 1.
- Les choix ordinaires restent **aléatoires, sans remplacement**. Lorsqu’un ultime est éligible, **un des trois emplacements lui est réservé** ; les deux autres restent aléatoires. Sans ultime éligible, les trois restent aléatoires.

### Spécification du slot d’ultime

Prérequis conservés : sort/arme au rang maximal 5, avec au moins un point dans le passif ou la branche associée. L’ultime remplace sa capacité dans le même emplacement.

Proposition de résolution déterministe : conserver une file d’éligibilité et proposer le plus ancien ultime prêt. Si plusieurs deviennent éligibles simultanément, utiliser l’ordre d’acquisition des capacités. Une relance renouvelle seulement les deux autres cartes ; elle ne remplace pas cet ultime. Le refuser le laisse disponible au niveau suivant. Une fois acquis, il sort de la file et n’est plus proposé. La file est vidée au recommencement.

Tester les montées de plusieurs niveaux d’un seul coup, l’éligibilité créée par le choix précédent, les acquisitions par la boutique et l’absence de doublons entre carte réservée et pool aléatoire. Prévoir une voie explicite si les prérequis sont complétés au plafond de niveau 40 : ne pas laisser un ultime inaccessible faute de prochain niveau. Voie implémentée au niveau 40 : un coffre ouvre les trois choix avec le slot d’ultime réservé lorsqu’un ultime est prêt.

### Escalade continue : proposition de fonctionnement

La santé et les dégâts des nouveaux ennemis augmentent avec le temps actif local de l’acte. Après 6:00, la pente de pression devient plus forte. La courbe exacte doit être mesurée, sans recopier les anciens paliers globaux de campagne. Les nombres actifs d’ennemis, projectiles et effets restent plafonnés pour les performances ; les PV/dégâts prennent le relais pour poursuivre l’escalade. Les vitesses et les délais de télégraphe gardent des bornes assurant la lisibilité.

**Recommandation pour éviter une guérison artificielle des boss :** leurs PV sont fixés lors de l’apparition ; les dégâts et la pression des vagues peuvent continuer d’augmenter. Ne pas remonter périodiquement les PV courants d’un boss en cours de combat. Les dégâts des attaques déjà annoncées devraient être fixés à leur déclenchement pour conserver une réponse prévisible.

Définir les unités, la croissance avant/après 6:00 et les garde-fous numériques. « Sans plafond de difficulté » ne doit pas produire `Infinity`/`NaN`, contourner les collisions ou rendre la scène injouable par surcharge graphique. Mesurer que la puissance maximale accessible au héros dans une run ne permet pas un équilibre de farm permanent.

### Identités d’actes à prototyper avec les ressources disponibles

| Acte | Thème | Familles de départ envisagées | Signature des rencontres |
|---|---|---|---|
| I — Plaines sombres | Ruines et morts-vivants | Déchus, zombies, squelettes | Apprentissage du nettoyage et des premières charges |
| II — Désert | Essaims et embuscades | Scarabées, serpents, démons des sables, boucs | Approches rapides, mouvements latéraux, tirs espacés |
| III — Jungle | Corruption et toiles | Fongus, araignées, spectres | Poison, zones temporaires et priorité aux contrôleurs |
| IV — Enfer | Bêtes et feu | Chiens de feu, démons volants, ogres infernaux | Charges et télégraphes de feu, alternance d’engagement/retrait |
| V — Montagne | Gardiens maudits | Chevaliers, archers squelettes, spectres froids | Défenses partielles, tireurs et contrôle de terrain |

Les variantes et nouveaux comportements ci-dessus sont des propositions, pas des attaques déjà présentes dans les sprites. Réduire les recouvrements de roster sans inventer un besoin de nouvelles images pour chaque rôle. Chaque boss intermédiaire doit avoir une mécanique identifiable et une récompense de progression ; il ne doit pas seulement être une version avec davantage de PV.

### Ordre d’implémentation et recette ciblée

1. Retirer campagne, minuterie de défaite et transitions inter-actes ; conserver les sauvegardes de records par héros/acte.
2. Implémenter l’horloge locale 0 → 2 → 4 → 6 minutes, les trois identités de boss et la victoire sur la mort du final. Chaque boss apparaît une seule fois, même avec un grand dt.
3. Mettre en place la file d’ultimes et le tirage de deux cartes aléatoires autour du slot réservé.
4. Installer une courbe d’escalade et les cinq compositions thématiques, puis recalibrer XP, soins, or et mana pour six minutes.
5. Vérifier pauses/menus, morts, relances, boss précédents encore vivants, final tué avant les intermédiaires, records/chaleur, niveaux multiples, plafond de niveau et performance après 6 minutes.

**Portes de validation :** départ niveau 1 viable dans chaque acte ; deux intermédiaires réellement utiles au build ; boss final tuable à l’arrivée avec un build raisonnable ; aucune attente arbitraire de deux minutes ; montée continue empêchant un farm stable sans casser la lecture des dangers.

---

## 1. État du moteur avant application du nouveau contrat

Le jeu est un roguelite de survie 2D inspiré de Diablo II, en navigateur sans build, organisé autour de sept classes, cinq actes/cartes, un combat en vagues puis un boss. La campagne dure 15 minutes de vagues plus les duels de boss ; chaque boss doit mourir dans les 120 secondes. La progression de run va jusqu’au niveau 40, avec trois compétences de classe, trois armes communes, six passifs, des talents, ultimes, mana, équipement persistant et améliorations permanentes au Sanctuaire. Une chaleur optionnelle comporte six pactes de difficulté.

### Fichiers du jeu à maintenir comme sources de vérité

- [`js/data.js`](../js/data.js) : valeurs historiques/classes, ennemis de base, minutage et composition des vagues, boss historiques et pool marchand.
- [`js/survivors/catalog.js`](../js/survivors/catalog.js) : catalogue actuel de 45 capacités, 16 passifs, recettes et arbres de talents ; **premier endroit à vérifier pour les capacités**.
- [`js/survivors/runtime.js`](../js/survivors/runtime.js) : combat actuel, formule de stats finales, génération des attaques, critiques, contrôle, dégâts périodiques et compagnons.
- [`js/survivors/stats.js`](../js/survivors/stats.js) : profils de classes et statistiques dérivées.
- [`js/survivors/integration.js`](../js/survivors/integration.js) : règles qui remplacent le moteur historique, PV de départ, XP/niveaux, soin, vagues/actes, boss, chaleur, coffres, boutique et choix d’amélioration.
- [`js/survivors/bosses.js`](../js/survivors/bosses.js) : séquences, dégâts télégraphiés et mécanique des cinq boss.
- [`js/survivors/equipment.js`](../js/survivors/equipment.js) et [`js/survivors/equipment-ui.js`](../js/survivors/equipment-ui.js) : génération, rareté, affixes, puissance, vente et prix de l’équipement.
- [`js/systems.js`](../js/systems.js) : améliorations permanentes, gains d’essence et effets.
- [`tests/survivors.test.cjs`](../tests/survivors.test.cjs) : tests unitaires/intégrés, simulations, benchmark de capacité et modes stress/balance.
- [`docs/revision-d2-bosses.md`](revision-d2-bosses.md), [`docs/stats-et-progression.md`](stats-et-progression.md), [`docs/armes-et-mana.md`](armes-et-mana.md), [`docs/inventaire.md`](inventaire.md), [`docs/verification-actes-boss.txt`](verification-actes-boss.txt) : décisions et repères historiques ; certains chiffres ne reflètent plus exactement les règles actives.

**Règle de travail :** quand la documentation et l’implémentation se contredisent, reproduire le jeu et vérifier la chaîne de scripts avant de proposer un changement. Le moteur `js/survivors/*` surcharge certaines fonctions globales de `js/data.js`, `js/entities.js`, `js/levels.js` et `js/main.js` ; ne pas supposer qu’un nombre historique est effectif.

## 2. Ce qu’on peut raisonnablement apprendre du dépôt de référence

Référence demandée : [VampireSurvivorsFiles — Data/Vampire Survivors](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/tree/main/Data/Vampire%20Survivors). Il s’agit d’un **dump de données extraites**, non d’un guide officiel d’équilibrage : son [README](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles) et [Game Version.txt](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Game%20Version.txt) identifient la version 1.16.107. Les valeurs ne sont pas transposables : unités, formules runtime, contenus et durée des parties diffèrent. Relecture du 12 octobre 2026 : commit du dump `afea0f265e8720ea28e0dbe66af30fc164f33a52`, version principale annoncée 1.16.107. Les comptes bruts observés sont 153 clés dans Weapon.json (dont des passifs), 579 dans Enemy.json (dont des variantes), 70 dans Character.json et 24 dans Stage.json ; ce ne sont pas des comptes de contenus directement adaptables.

Les bonnes références sont la **structure et les relations entre systèmes** :

- [Weapon.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Weapon.json) décrit des armes en rangs, leurs changements d’amount, puissance, intervalle, zone/perforation, ainsi que prérequis et évolutions. Inspiration : concevoir une montée de puissance par comportement, pas uniquement un multiplicateur de dégâts. Comparer les armes à partir du rendement réellement touché et de leur couverture.
- [Enemy.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Enemy.json) regroupe santé, vitesse, puissance, XP, résistances, variantes et comportement. Inspiration : évaluer pour chaque famille le coût de menace et le gain, sans oublier IA, résistance et récompense.
- [Stage.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Stage.json) exprime calendrier des ennemis, bosses/événements, cadence et modificateurs par mode. Inspiration : équilibrer une rencontre comme une courbe de densité et de composition, pas comme une liste d’HP isolés.
- [Character.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Character.json) associe kit de départ, stats et croissance. Inspiration : comparer chaque héros à plusieurs étapes et exiger de vrais avantages/inconvénients.
- [PowerUp.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/PowerUp.json), [Item.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Item.json) et [Adventure.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Adventure.json) distinguent coûts, rangs, pièces, récompenses et objectifs. Inspiration : suivre ensemble sources et dépenses plutôt que juger le prix d’un achat seul.
- [AdventureMerchants.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/AdventureMerchants.json) donne des inventaires, pas forcément les prix runtime. Ne pas confondre présence d’un objet et équilibre économique.

**Adaptations possibles au Sanctuaire :** progression par rang avec un effet clair à certains seuils ; évolutions avec condition/passif lisibles ; compositions et cadence d’actes explicites ; profils de classe évalués à plusieurs niveaux ; économies séparées par source/sink ; variations d’ennemis répondant à des fonctions distinctes (rapide, robuste, distance, élite, boss). Le jeu possède déjà talents, recettes, chaleur et builds, donc privilégier l’approfondissement de ces systèmes plutôt qu’une copie des structures de Vampire Survivors.

## 3. Diagnostic : risques et questions à résoudre avant de retoucher les nombres

Les éléments ci-dessous sont des **hypothèses de risque** tirées de la lecture des formules, pas des bugs ou constats définitifs sans mesures.

### 3.1 Cohérence des règles / provenance

1. Créer un tableau de vérité (stat, source active, formules, affichage, test, document) : dégâts généraux/catégorie, armure, esquive, attaque, critique, réduction de cooldown, PV/mana, XP, or, chaleur et équipement.
2. Vérifier les doubles contributions historiques : `CLASSES.dmgMul`, bonus des profils dans `SurvivorStats`, équipement, passifs, talents, synergies, méta-bonus et chaleur. La formule `R.stats` et les wrappers de `integration.js` doivent être confrontés aux valeurs d’écran.
3. Fixer l’unité d’armure. L’interface annonce 2 %/point plafonnés à 60 % ; tester le calcul contre une table de dégâts réels et expliquer si armure d’objet/passif sont des points ou fractions.
4. Vérifier interactions XP/fortune : la fortune permanente est annoncée en or mais `Heat` réduit l’XP ; ne pas laisser un nom, getter ou tooltip suggérer un effet XP inexistant.
5. Vérifier si le plafond de niveau 40 est atteignable dans la durée réelle ; niveau cible au premier boss/fin d’acte/fin de campagne et reliquat XP doivent être observés.
6. Vérifier la prévisibilité des rangs : nombre de choix disponibles, poids actuel par option éligible (donc représentation variable des familles), choix de départ, relances et secours quand une famille est maxée.
7. Confirmer les limites et les cas frontières : ennemis actifs, élites, invocations, champs persistants, génération de boss, effets secondaires et sauvegardes d’équipement.

### 3.2 Puissance des builds

- Les armes/sorts diffèrent en cadence, nombre de cibles, projectiles, portée, précision, temps actif, durée, DoT, zone, contrôle et disponibilité mana. Les dégâts bruts `dmg` ne sont pas un comparateur suffisant.
- `R.stats` combine bonus de rang, catégorie, puissance, synergie, talents, passifs, area, cooldown, attaque rapide, quantité, évolutions et critiques. Étudier en particulier les effets multiplicatifs ou redondants de l’ultime et de l’équipement.
- Le nécromancien dépend de cadavres pour ses squelettes et son explosion ; mesurer ses ouvertures et son duel boss sans adds. Les invocations ont du DPS, de la vie, du déplacement et une valeur défensive, pas seulement du dégât.
- Les sorts manuels utilisent du mana, les compagnons consomment à l’invocation, les auras drainent par seconde, alors que de nombreuses attaques passives sont gratuites. Mesurer la valeur réelle en dégâts par mana et le taux d’attente de mana par build.
- Les passifs sont en concurrence dans six emplacements. Leur valeur doit être comparée à l’option de monter une arme, une classe, de la survie ou du mana.

### 3.3 Courbe de menace, ennemis et boss

- La table historique `MINUTE_SCALING` monte jusqu’à ×6 à la minute 14. Dans le moteur actuel, le moteur antérieur comporte trois minutes de vagues par acte et s’appuie sur `Game.minute`; vérifier que santé, cadence, variation de types et heat composent bien l’intensité attendue dans chacun des actes.
- Chaleur jusqu’à 30 additionne des pactes indépendants : jusqu’à +100 % de santé, +75 % de dégâts, +40 % de vitesse, +75 % de cadence et −50 % d’XP si tous sont poussés au maximum. Mesurer les combinaisons et identifier si certaines marches deviennent des pics punitifs ou rendent la victoire dépendante d’une classe/équipement.
- Cinq boss imposent un contrôle de DPS : tuer chacun dans une fenêtre de 120 s après 180 s de vagues. L’historique des simulations de stress rapporte parfois des morts avant l’Archidémon pour Paladin/Nécromancien, mais ces scripts invulnérables et prédéfinis ne mesurent pas le jeu humain. Reproduire avec le moteur/version actuelle, quelques builds et conditions documentés avant conclusion.
- Une attaque annoncée n’est équilibrée que si l’impact est lisible, esquivable, cohérent avec la vitesse du héros et proportionné à la vie. Mesurer dégâts attendus par minute et pics sur erreurs ; examiner DoT poison séparément des impacts.
- La densité dépend de la cadence de spawn, du plafond global de 180, des invocations de boss et du taux d’élimination. Une limite de performance peut invisiblement réduire la pression si atteinte.

### 3.4 Survie, économie et progression permanente

- Vie de base variable par classe, soin de niveau (2 %), rareté des cœurs/flacons, armure/esquive, barrières, équipement et bonus de PV : mesurer le nombre de coups encaissables et le rythme de récupération.
- Les gains d’or des pièces/ennemis, coffres (+50), boutique, prix des consommables et objets, ventes, bonus de fortune et récompenses d’essence constituent des boucles séparées run/persistant. Faire les comptes en scénarios de run, pas en cumulant des descriptions.
- L’équipement persistant par classe peut transformer une difficulté conçue pour un héros nu. Comparer « aucun équipement », progression moyenne acquise, puis inventaire fortement optimisé ; examiner la variance par rareté et niveau de drop.
- Les upgrades permanents coûtent actuellement 3 essences/rang pour cinq rangs ; vitalité (+15 %/rang) et puissance (+8 %/rang) modifient la difficulté de départ. Vérifier l’écart entre nouveaux joueurs et vétérans, les premières victoires et si l’économie d’essence pousse à acheter un bonus avant tout autre choix.
- Chaleur et récompense d’essence augmentent en même temps que la difficulté. Vérifier que rendement/risque progresse sans rendre les pactes « gratuits » après optimisation.

## 4. Mesures à établir avant toute refonte

Ajouter au protocole de benchmark, sans affaiblir les tests existants :

| Indicateur | Collecte recommandée | Lecture attendue |
|---|---|---|
| Dégâts utiles par seconde | dégâts appliqués par capacité à ennemis vivants, par cible et total ; séparer primaire, DoT, critique, secondaire, allié | comparer boss et foule, DPS nominal et rendement effectif |
| Temps pour tuer | TTK médian/p90 sur ennemi normal, élite, boss par acte, classe, build, équipement et chaleur | repérer les cibles qui deviennent sacs à PV ou checks impossibles |
| Menace entrante | dégâts joueurs reçus/minute, coups, esquives, armure, barrière, poison, séquences de 10 s | distinguer attrition attendue d’un burst sans réponse |
| Survie | victoire, acte atteint, mort/timeout, PV restants, temps de boss, par classe/build | taux par scénario et intervalle d’incertitude, pas un résultat unique |
| Progression | niveaux et rangs à 2/4/6 min, puis après 6 min, et à chaque boss ; XP gagnée/XP perdue | vérifier lisibilité et investissement avant les pics |
| Économie de run | or et essence gagnés par source, dépense/boutique, prix abordables, solde final | vérifier prix utiles, aucun achat obligatoire et effort/récompense |
| Loot/build | nombre d’armes/passifs proposés et acquis, relances, coffres, équipement obtenu/porté | repérer les builds « imposés par le tirage » et dépendance à l’équipement |
| Équité de représentation | écart classe / niveau d’équipement / build, plus variance entre seeds | détecter classe dominante et stratégies de niche non viables |

Protocole reproductible : fixer version, commit, navigateur/runtime, classe, seed RNG, chaleur, acte, bonus permanents, équipement, décisions/build, durée, fréquence de tick et nombre de répétitions. Démarrer par au moins 30 seeds par scénario de bot déterministe pour filtrage, puis playtests humains (nouveau joueur, joueur familier, build spécialisé) ; augmenter le nombre si l’incertitude recouvre la cible. Comparer médiane et p10/p90, pas uniquement la moyenne. Toute simulation immortelle sert au DPS/logiciel, jamais à prétendre à un taux de victoire humain.

### Scénarios minimum

1. **Tuerie contrôlée :** une cible normale, une élite, chaque boss ; dégâts de chaque capacité rang 1/3/5, une arme commune identique aux rangs comparables, sans bonus d’équipement/méta.
2. **Foule :** densité basse, nominale, plafond proche ; cibles mélangées avec rapides, lentes, distance, élite ; mesure de couverture et ennemis qui atteignent le héros.
3. **Combat réel :** sept classes, cinq actes autonomes démarrant niveau 1, build préétabli novice/standard/spécialisé, équipement nu/médian/haut, chaleur 0/intermédiaire/max ; pilotage et évitement reproductibles.
4. **Boss isolé :** boss à apparition exacte; timers et HP initiaux identiques ; mesurer temps jusqu’à mort, dégâts subis, fenêtres sans dégâts et boss qui excède les 120 s.
5. **Économie/progression :** gains aux paliers, achats possibles, coûts d’upgrade d’équipement, or perdu en fin de run, essences par victoire/échec et nombre de descentes pour plafonner une méta-amélioration.
6. **Tirages :** Monte-Carlo de propositions, relances et catégories (en respectant le tirage actuel uniforme par option, sans supposer une garantie par famille ou par ultime) pour estimer probabilité d’obtenir les pièces minimales d’une recette et choix impactants.

## 5. Cibles de conception à valider par playtest

Ces cibles sont des **hypothèses initiales**, à ratifier avant de régler les valeurs. Le challenge doit rester réel ; elles n’impliquent pas que chaque run soit gagnée.

- Les sept héros ont un plan de jeu identifiable ; aucun n’a un déficit majeur de dégâts mono-cible, de nettoyage de foule et de survie à la fois.
- À chaleur 0, une partie raisonnablement construite peut atteindre chaque boss avec ressources et améliorations de progression suffisantes ; une victoire contre un boss doit être plausible sans équipement rare/légendaire ni méta maxée.
- Sur un joueur adapté à la difficulté normale, viser une victoire d’acte approximative de 40–70 % après apprentissage (à fixer par public), avec pires résultats de classe à moins de 15 points de pourcentage de l’ensemble, ou justifiés/testés par une difficulté distincte. Un démarrage sans équipement doit rester viable.
- Un build spécialisé est meilleur dans son rôle sans être systématiquement meilleur en boss **et** en foule ; préserver des compromis portée/risque/contrôle/mana/DPS.
- Un boss bien lu ne tue pas par une seule attaque ordinaire ; une faute lourde peut faire mal mais une séquence évitable ne doit pas enchaîner un héros robuste de plein à zéro sans feedback.
- Temps médian de boss lisible et soutenable (repère indicatif à tester : moins de 90 s à chaleur 0 pour un build standard), sans limite de défaite. La durée excessive est pénalisée par la pression continue, pas par un compte à rebours.
- Les dégâts d’armes, sorts et effets persistants doivent être lisibles : chaque amélioration augmente une dimension compréhensible et chaque stat qui n’affecte pas une capacité doit être présentée comme telle.
- Chaque achat de boutique est un choix d’opportunité ; pas de soin complet à prix si bas qu’il annule la survie, ni coût si haut que l’or ne sert jamais.
- Les améliorations permanentes accélèrent l’apprentissage et donnent une sensation de progression, mais la puissance de personnage à méta maxée ne doit pas invalider la chaleur basse ni imposer de grind pour la campagne de base.

## 6. Chantiers d’équilibrage proposés (ordre de dépendance)

### Phase A — normaliser les formules et les définitions

**Préalable actualisé :** appliquer le contrat utilisateur ci-dessus (actes autonomes de six minutes, sans délai de boss, slot d’ultime réservé), puis figer la version et la sémantique des tirages. Sans cela, un même benchmark compare des expériences différentes.

1. Produire une feuille/table d’équilibrage calculée depuis les données actives (capacité, catégorie, dégâts directs/DoT, fréquence, quantité, portée, nombre de cibles, uptime, coût en mana, rangs, talent, ultime, passif partenaire, synergie et classe).
2. Décrire une formule canonique : bonus additifs par famille, multiplicateurs séparés, ordre critique, DoT, résistance/armure, contrôle et équipement. Retirer ou corriger les propriétés calculées deux fois ; faire correspondre le HUD et les descriptions à l’effet réel.
3. Définir métriques de dégâts prévisibles : `DPS cible unique` et `DPS foule` séparés. Pour projectiles, utiliser taux de contact mesuré plutôt que supposer 100 % ; pour zone/durée/orbite, mesurer uptime, fréquence de touche et limite de cibles.
4. Vérifier invariants des rangs : rangs 1–5, ulti remplace/améliore sans dupliquer ses dégâts, progression maximale, cap de 12 projectiles/8 touches de chaîne, limites invocations/pièges et effets secondaires non récursifs.
5. Distinguer armure (réduction %), PV absolus/% et esquive ; vérifier que points d’équipement ont un poids comparable au reste du build et respectent les plafonds affichés.

**Livrable/porte de sortie :** une table de formules et un benchmark déterministe lisible ; pas encore de buff/nerf global.

### Phase B — budget de puissance offensive

1. Définir un budget de dégâts initial commun par type (attaque gratuite de départ, arme, compétence de classe) ; le starter doit tuer les ennemis d’ouverture à une cadence raisonnable sans voler toutes les éliminations au futur build.
2. Pour chaque capacité : évaluer rangs 1/3/5 et ultime sur boss et foule. Ajuster **une seule famille de paramètres à la fois** : cadence, dégâts, quantité, couverture, contrôle ou mana.
3. Séparer dommage direct / dégâts par seconde / DoT. Empêcher une zone qui retouche plusieurs fois par tick plus vite que prévu ; documenter tick, renouvellement et non-cumul des mêmes sources.
4. Budgéter les sources indirectes : malédiction, synergie, bonus de talent, passif de recette, contrôle qui augmente l’uptime, invocations, critiques, ricochets et kills en chaîne.
5. Réduire les écarts par choix de comportement plutôt que ramener tous les sorts au même profil : rapide mono-cible, lent perçant, zone d’attente, contrôle/sécurité, compagnon, etc.
6. Tester les propositions de niveau : la version actuelle tire uniformément trois options éligibles sans remplacement, sans carte garantie par famille. Les ultimes éligibles rejoignent ce pool sans garantie au prochain niveau. Comparer cette règle à une pondération des familles ou à une priorité d’ultime, après décision de design, en conservant le secours en slots maxés.
7. Tester synergies et ultimes en marginal : gain vs build non investi, coût des prérequis et opportunité d’abandonner un autre passif. Un ultime doit être spectaculaire, borné en chaînes et qui ne casse pas les objectifs de temps boss.

**Livrable :** ratios par capacité (sorties boss/foule), distribution de choix et liste de capacité à retoucher avec explication causale.

### Phase C — survie, ennemis, actes et boss

1. Poser un budget de survie par acte en coups entrants avant soins, tenant compte classe, armure, esquive et équipement. Fixer séparément dommage d’un contact, projectile, télégraphe, attaque de zone, poison et rafale.
2. Décomposer difficulté par **santé ennemie**, **pression de spawn**, **mix de types**, **vitesse** et **dégâts**. Éviter d’augmenter les cinq à la fois dans une même marche.
3. Pour chaque ennemi, préciser son rôle (fourrage XP, rapide, tank, distance, anti-position, élite) et la réponse accessible. Vérifier XP/difficulté rapport XP/temps de tuer et danger/contre-mesure.
4. Mesurer la vague au fil des six minutes de chaque acte et après 6:00 et le point de rupture du plafond ennemis. L’arrivée d’un acte ajoute changement de carte et boss, pas une marche cachée de tous les multiplicateurs.
5. Boss : budget PV = dégâts réalistes utiles du build standard × fenêtre cible ; tester par classe et build. Si échec, déterminer d’abord si cause = DPS cible, mana, uptime/IA, déplacements télégraphiés ou vie boss, avant de baisser HP globalement.
6. Fenêtre de boss : vérifier une première phase de lecture, attaques télégraphiées esquivables, transition de phase sous 50 %, fréquence et dégâts de phase deux ; ajouter une fenêtre de répit si la sortie de phase/attaque rend le coup inévitable.
7. Additions et contrôle : plafonds du nombre d’ennemis/compagnons, minions du boss, ralentissement/poison hors de la flaque, immunités boss ; suivre menace supplémentaire durant invocation et temps perdu sur boss.
8. Chaleur : tests en paliers 0, 5, 10, 15, 20, 25, 30 et pacte par pacte. Les modificateurs de fréquence et de santé peuvent se multiplier en pression ; évaluer les combinaisons de heat réellement affichées, pas seulement les valeurs isolées.

**Livrable :** matrice de menace par acte/boss et chaleur, comprenant temps de kill, dégâts évitables/obligatoires, densité, morts et raisons.

### Phase D — PV, mana, soins et économie

1. Construire le budget PV par classe (PV de base, armure, dodge, compétence défensive, mana/survie, vitesse d’évitement). La classe robuste ne doit pas trivialiser, la fragile doit avoir une réponse active.
2. Ajuster soin de niveau et pickups sur le déficit attendu par acte : définir un budget de soins moyen et p10/p90, plutôt que fixer leur taux au ressenti. Garantir une possibilité de récupération sans rendre les erreurs gratuites.
3. Mana : comparer coûts effectifs/cooldowns/régénération par classe; relever `manaWaits`, mana dépensé et dégâts perdus à 0/1/5 rangs mana. L’actif limité par joueur ne doit pas être soit gratuit, soit inutilisable ; garder une attaque gratuite viable.
4. Économie de run : mesurer or par minute et par source (ennemis, coffres, challenges, récompense), achats/ventes, nombres de visites et or non dépensé. Ajuster boutique en rapport au coût d’opportunité et à la fenêtre d’apparition/temps de marchand.
5. Séparer or de descente (perdu au reset), or/valeur du butin persistant, et essence de méta. Établir si vendre un objet, acheter une puissance immédiate ou conserver pour équipement est une décision réelle, et surveiller les boucles achat–vente.
6. Équipement : comparer un héros nu, équipement médian et haut tiers au même niveau ; établir l’écart complet de puissance par slot et affixe. Plafonds sont partagés entre pièces et passifs ; vérifier que la progression de niveau (1–40) et rareté (commun–ancien) restent dans une plage saine. Examiner surtout les pièces légendaires/anciennes et les armes à deux mains.
7. Méta : simuler les 0–5 rangs vitalité/puissance/vitesse/fortune et les gains d’essence de victoire/échec. Vérifier la valeur marginale du 1er vs 5e rang et le nombre de descentes pour déverrouiller sans grind coercitif.

**Livrable :** courbe de progression, table revenus/coûts, ratio du meilleur équipement au départ sans équipement, et propositions de caps/coûts justifiées.

### Phase E — playtest, retouches ciblées et maintenance

1. Préparer un protocole court : mêmes versions/seed/build/heat ; une session par classe avec observation des premiers choix, sentiment de contrôle, raison de mort, décision de boutique et combat boss.
2. Demander au joueur d’expliquer le danger et le gain de sa carte ; si impossible, améliorer la description/feedback avant de rééquilibrer au hasard.
3. Tester classes/builds sous-représentés et polarités (mêlée/portée, invocation/caster, équipement zéro/haut, novice/vétéran).
4. Créer un journal d’équilibrage « hypothèse → variable → résultat attendu → résultats → décision », avec écart par seed et risques de régression.
5. Retoucher par paquet isolé ; recalculer les mêmes indicateurs et rejouer les actes affectés. Ne pas déduire une amélioration de taux de victoire depuis une seule run.
6. Mettre à jour catalogue, descriptions, HUD, documentation et golden values de tests en une seule série cohérente. Ajouter test de formule et scénario pour chaque nouvelle courbe ou cap.
7. Conserver le caractère et le thème Diablo ; s’inspirer des **relations** de Vampire Survivors et documenter origine, version et conditions de réutilisation de chaque asset envisagé ; un crédit seul ne démontre pas une autorisation de redistribution. Aucun asset n’est requis pour cet équilibrage.

## 7. Idées à reprendre ou adapter (pas de copie brute)

| Idée constatée dans les données de Vampire Survivors | Adaptation Sanctuary Survivors | Garde-fou |
|---|---|---|
| Armes avec effets de rang distincts et évolution/prérequis explicite | Faire de chaque rang de sort/arme une amélioration visible (cible, portée, cadence, quantité, effet), en conservant les ultimes et le passif associé déjà présents. Afficher une phrase « condition / gain ». | Ne pas forcer un passif obligatoire pour chaque bon build ; mesurer le coût total du duo. |
| Statistiques d’armes hétérogènes (quantité, intervalle, perforation, zone, durée) | Comparer DPS mono et DPS foule plus taux de contact, via trajectoires réelles; garder des niches de classe et d’armes. | Un projet capturé/manqué, un boss et une foule n’ont pas le même résultat que la formule `dégâts / cooldown`. |
| Fiches d’ennemis avec stat, résistance, XP et tags comportementaux | Définir un budget par rôle, incluant résistance/contrôle, XP et risque; élites deviennent variantes avec une récompense proportionnée. | Pas de multiplier HP/dmg/vitesse/spawn en même temps sans isoler l’effet. |
| Calendrier de vague séparé par stage, minute et mode | Rendre les cinq actes lisibles par séquence d’ennemis, temps de montée, élite et boss ; viser le nouveau rythme à 2/4/6 minutes sans délai maximal de duel. | Les calendriers de trente minutes ne se transfèrent pas à nos actes autonomes de six minutes sans recalibrage. |
| Personnage défini par départ et croissance | Définir un budget de puissance propre au starter, bonus de profil et coût de survie, tester aux jalons 1/10/20/40. | Les paliers répétés et méta-équipement peuvent s’additionner de manière disproportionnée. |
| Économie distincte : valeurs de pickup, prix de rang, récompense de mission | Cartographier chaque source/sink d’or et d’essence, la richesse restante au décès/victoire et le prix relatif aux revenus. | Les dump files n’exposent pas toujours chances/runtime; aucune valeur d’or n’est référence. |
| Objectifs de déblocage variés / progression aventure | Vérifier que les succès donnent des déblocages amusants sans puissance indispensable ni farming répétitif ; varier survie, boss, classe, découverte. | Ne pas rendre contenu/puissance permanente préalable à la campagne principale. |

## 8. Décisions à ne pas préjuger

Ce plan ne décide pas encore de :

- changer le plafond de niveau 40, la durée des actes ou la limite de deux minutes ;
- baisser systématiquement HP ou dégâts de tous les boss ;
- modifier les taux d’équipement, la sauvegarde, les anciennes sauvegardes ou le modèle de coffre ;
- supprimer/ajouter des stats, classes, compétences, passifs, talents ou méta-améliorations ;
- importer des valeurs ou des assets Vampire Survivors ;
- rendre toutes les attaques automatiques ou modifier la visée/mana.

Ces sujets ne devraient être tranchés qu’après les mesures et les retours des playtests ; les modifications de sauvegarde ou d’équipement exigent en particulier un plan de migration explicite.

## 9. Checklist de validation après refonte

- [ ] Formule publiée et alignée sur valeurs runtime, fiche, description et affichage de dégâts.
- [ ] Tests de chaque capacité rang 1/3/5 et ultime (solo, foule, boss) avec mesure du dégât réellement appliqué.
- [ ] Classes séparées, starter et attaque gratuite testés avec bonus méta 0/max et équipement 0/haut.
- [ ] Armure/esquive/critique/CDR/vitesse/zone/cadence plafonnés et testés aux bornes.
- [ ] Mana, passifs de régénération, aura, sort actif, économie des lancements vérifiés par classe.
- [ ] Effets secondaires/DoT, invocation, cadavre, cible boss et morts en cascade finissent sans duplication non bornée.
- [ ] Chaque ennemi, élite et boss a TTK, dégâts reçus et contre-jeu testés ; tous les boss sont évalués face à leur heure d’apparition et à la pression continue.
- [ ] Les cinq actes autonomes, les apparitions à 2/4/6 minutes, les densités, le plafond de 180 et les six pactes/combinations de chaleur testés.
- [ ] Richesse en or et essence, boutique, achat, vente, trésor et drop d’équipement vérifiés sur une run représentative.
- [ ] Réussite/difficulté du jeu nu et progression d’équipement/méta documentées ; aucun grind non prévu.
- [ ] Tests existants exécutés : `node tests/survivors.test.cjs` ; suites élargies au besoin avec `SURVIVORS_STRESS=1 SURVIVORS_BALANCE=1 node tests/survivors.test.cjs`.
- [ ] Résultats humains et automatisés datés, reproductibles, classés par version, avec échecs/non exécutés rapportés honnêtement.

## Sources du dépôt de référence

Les pages de fichiers ci-dessous décrivent le dump GitHub demandé et peuvent évoluer sur `main` :

- [Dossier des données Vampire Survivors](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/tree/main/Data/Vampire%20Survivors)
- [README et méthode/version générale du dump](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles)
- [Game Version.txt](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Game%20Version.txt)
- [Weapon.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Weapon.json)
- [Enemy.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Enemy.json)
- [Character.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Character.json)
- [Stage.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Stage.json)
- [Item.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Item.json)
- [PowerUp.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/PowerUp.json)
- [Adventure.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/Adventure.json)
- [AdventureMerchants.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/main/Data/Vampire%20Survivors/AdventureMerchants.json)

## 10. Revue complémentaire : décisions bloquantes et faits vérifiés

Revue du 12 octobre 2026, par lecture du moteur actif et d’un échantillon du dump. Cette section complète le plan ; elle n’autorise ni n’applique des modifications de combat. Elle distingue des faits de code, des risques à mesurer et des propositions.

| Point vérifié | Conséquence pour le plan |
|---|---|
| `drawUpgradeCards` tire trois options uniformes sans remplacement dans le pool total | « Uniforme » ne signifie pas équitable entre classes, armes et passifs : une famille plus nombreuse apparaît plus souvent. Les variantes de tirage doivent être des scénarios distincts. |
| Les ultimes éligibles rejoignent le pool normal | L’ancienne demande « proposé au prochain niveau » n’est plus garantie par le code actuel. Décider explicitement entre priorité d’ultime, proposition seulement probable ou compteur de protection avant tout test de recettes. |
| `R.stats` remappe les rangs réels 1–5 vers des niveaux internes 1, 2,75, 4,5, 6,25, 8 | Les seuils hérités de rang 8 restent actifs. Construire une table **par rang réel** des comportements, puis envisager une représentation explicite ; ne pas supposer des gains réguliers de 1 à 5. |
| Plusieurs liens de synergie sont des bonus additifs de +4 % par rang du partenaire possédé | Distinguer bonus de possession, recette d’ultime et interaction de combat. Une aura possédée mais désactivée peut encore compter comme partenaire de possession : comportement à documenter ou à décider, pas bug présumé. |
| Un ultime de classe multiplie nominalement les dégâts par 1,5 et la recharge par 0,8 | À cadence continue, le ratio théorique dégâts/recharge vaut 1,875 avant mana, précision et déplacement. Le budget d’ultime doit donc inclure cadence et couverture, pas seulement « +50 % dégâts ». Les versions d’armes ont également plusieurs multiplicateurs. |
| Les actes isolés remettent le personnage au niveau 1, mais prennent la minute/le palier d’ennemis de l’acte choisi | Un acte V isolé et l’acte V d’une campagne n’ont pas le même budget joueur. C’est une décision de mode de jeu, pas une raison suffisante pour nerfer tous les ennemis. |
| `ENEMY_BASE` contient 16 entrées normales ; deux types ordinaires tirent à distance ; la majorité poursuit et inflige des dégâts au contact | Le manque principal de diversité concerne les comportements, davantage que le nombre d’images. Les actes IV et V réutilisent surtout ogres et chevaliers. |
| `Player.takeDamage` accorde 0,5 s d’invulnérabilité après un coup et 0,25 s après une esquive | Mesurer l’ordre des contacts, projectiles et poisons : un contact faible peut momentanément empêcher un danger plus fort. Un budget de menace qui additionne tous les dégâts nominaux est incorrect. |
| Le pacte d’élites ajoute jusqu’à 20 points de pourcentage à la chance d’élite ; les élites rapportent davantage d’XP et des coffres | Plus de difficulté peut aussi accélérer le build. Mesurer XP réellement collectée, récompenses et densité pour chaque combinaison de pactes. |

### Anciennes options de mode — remplacées par la décision utilisateur

**Historique de la revue, désormais écarté :** conserver campagne et acte rapide comme deux profils explicites, avec les mêmes règles de combat mais un budget de départ défini pour chacun. Deux solutions à prototyper, puis en choisir une :

1. **Acte rapide autonome :** niveau 1 et montée en puissance conçue pour trois minutes ; le palier global de campagne ne s’applique pas automatiquement. Les actes se distinguent par rencontres et mécanique de boss. Avantage : relances simples ; risque : moins de continuité avec la campagne.
2. **Reprise d’acte avec préparation :** budget de niveaux/choix de départ correspondant à l’entrée de campagne, distribué via un écran court ou un build sauvegardé validé. Avantage : duel représentatif ; risque : davantage de préparation et nécessité d’éviter un équipement obligatoire.

Ne pas compenser implicitement cette différence par du grind permanent. Écrire le choix dans les règles et les scénarios. Fixer aussi si la progression permanente désigne une collection, un gain de puissance borné, ou les deux : les mesures « personnage nu » et « vétéran » doivent rester séparées.

## 11. Statistiques, combos et ultimes : un système explicite

### 11.1 Deux axes indépendants et une matrice d’application

Documenter pour chaque capacité :

- **Mode d’attaque :** mêlée, projectile, zone, invocation, piège, aura.
- **Type de dégâts :** physique, feu, froid, foudre, poison, magie.
- **Activation :** automatique, active à recharge, aura entretenue, invocation.
- **Statistiques appliquées :** dégâts généraux, mêlée/distance, vitesse d’attaque, CDR, quantité, vitesse de projectile, durée, zone, critique et mana ; préciser les exclusions.

Aujourd’hui, « distance » peut aussi améliorer une magie à projectile, et les invocations héritent d’une catégorie. Ce n’est pas forcément incohérent, mais cela doit être une règle délibérée et affichée. Ne pas ajouter arbitrairement une stat par élément : chaque nouvelle stat agrandit les pools d’affixes et dilue les choix utiles. D’abord vérifier qu’un héros peut bénéficier d’un équipement trouvé sans que la majorité des stats soit inopérante.

Les `tips` de Weapon.json déclarent explicitement certaines exclusions (par exemple durée ou vitesse). L’idée à reprendre est l’information « affecté par / n’utilise pas », pas les multiplicateurs du dump.

### 11.2 Trois niveaux d’interaction à ne pas mélanger

| Système | Fonction | Mesure attendue |
|---|---|---|
| Synergie de possession | Petit bonus d’investir dans deux compétences compatibles | Gain marginal à budget de niveaux et d’emplacements égal |
| Combo de combat | Séquence ou interaction de statuts : ralentir, marquer, tuer, protéger, déplacer | Dégâts utiles, contrôle, réduction du danger et coût d’exécution |
| Ultime / éventuelle fusion | Transformation après prérequis explicites | Gain complet contre coût total, limites de déclenchement et place occupée |

Avant d’ajouter des fusions, décider si elles remplacent un seul sort ou consomment les deux. Avec seulement trois compétences de classe, une fusion de deux sorts peut réduire énormément les options. Les liens `evoSynergy/evoInto` du dump montrent que les recettes peuvent avoir plusieurs ingrédients, sans définir notre règle d’emplacements.

### 11.3 Fiche obligatoire pour chaque combo

`id`, ingrédients, rangs requis, état déclencheur, effet, cible, cooldown interne, limite par cible/lancement, coût de mana éventuel, traitement des boss, règles de cumul, origine des dégâts et feedback visuel. Le descriptif joueur tient en une phrase : **condition → effet**.

Pour chaque proposition, comparer A, B et A+B, puis comparer A+B à un autre investissement utilisant **le même nombre de niveaux, talents, passifs et emplacements**. Ne pas comparer un duo entièrement monté à un sort seul au rang 1. Un ratio de dégâts seul ne juge pas un combo de protection ou de placement : mesurer aussi dégâts évités, temps d’exposition, distance de sécurité et régénération effective.

Un déclenchement reçoit un identifiant de chaîne et une origine (`primary`, `secondary`, `periodic`, `ally`). Un effet secondaire ne réémet pas librement le même combo. Fixer des plafonds de dégâts secondaires et de créations de projectiles/champs par fenêtre de temps ; tracer les suppressions dues aux plafonds.

### 11.4 Sept pistes de prototypes, à mesurer avant extension

Ces pistes s’appuient sur les capacités existantes. Certaines interactions de départ existent déjà ; leur renforcement est une hypothèse, pas une nouvelle fonctionnalité annoncée.

| Classe | Point de départ | Interaction à explorer | Risque principal |
|---|---|---|---|
| Paladin | Zèle + Bouclier sacré | Une défense réussie ouvre une courte fenêtre de riposte ; comparer au talent de représailles déjà présent | Boucle soin/bouclier/riposte infinie ou attaques sans risque |
| Sorcière | Orbe gelé / Blizzard + Boule de feu | Placement facilité par le froid, puis explosion ciblée ; éventuel état « fragilisé » consommé une fois | Double multiplicateur gratuit et lecture impossible au milieu des effets |
| Amazone | Javelot de peste + Fureur de foudre | Propagation limitée entre ennemis marqués par le poison | Dégâts de foule et mono-cible simultanément dominants |
| Nécromancien | Squelettes + Amplification, puis explosion de cadavre | Conserver la malédiction physique existante et vérifier la production/consommation de cadavres | Boss sans cadavres rendant le kit inopérant, ou chaînes d’explosions illimitées |
| Druide | Ouragan + Tornade | Contrôle et regroupement léger pour augmenter les touches utiles | Verrouillage permanent ou déplacement qui empêche les télégraphes d’un boss |
| Barbare | Cri de guerre + Tourbillon | Fenêtre d’engagement mêlée après contrôle, avec limite propre aux boss | Une fenêtre de sécurité transformée en invulnérabilité continue |
| Assassin | Venin + Griffes, éventuellement Ombre | Appliquer puis exploiter le poison ; distinguer bonus statique de l’Ombre et poison réellement appliqué par elle | Critiques, poison et invocations multipliant les déclenchements |

Commencer avec **un prototype par classe**, pas une nouvelle couche de dizaines de recettes. Prévoir pour chaque classe au moins deux builds viables dont un n’exige pas ce combo. Une synergie très forte ne doit pas rendre ses ingrédients obligatoires à chaque descente.

## 12. Bestiaire, attaques et compositions de vagues

### 12.1 Une fonction de jeu par famille

| Rôle | Comportement et annonce | Réponse du joueur | Ressources à vérifier |
|---|---|---|---|
| Fourrage | Groupe lent, contact simple, silhouette lisible | Traverser/nettoyer, récupérer XP | Marche/mort, hitbox petite et cohérente |
| Coureur | Approche rapide ou courte charge avec anticipation | Esquive latérale, ralentissement | Préparation, charge, retour au déplacement |
| Tank | Lent, repoussable ou protection limitée | Contourner, attaque ciblée/perçante | État protégé/vulnérable visible |
| Tireur | S’arrête et arme un tir directionnel | Changer de trajectoire, approcher | Tir et projectile distincts du décor |
| Contrôleur | Fait apparaître une zone temporaire, puis se retire | Quitter une zone plutôt que fuir en ligne droite | Télégraphe au sol et durée clairement séparés |
| Invocateur / soutien | Appel annoncé, adds plafonnés ou buff local | Prioriser la source | Invocation, lien/buff, compteur d’adds |
| Élite | Variante d’un rôle avec un seul affixe au départ | Reconnaître le modificateur et sa récompense | Badge, couleur secondaire, télégraphe conservé |

Réutiliser d’abord les familles déjà disponibles (squelette, démon bouc, chien, serpent, araignée, mage d’os, ogre…), après inventaire de leurs animations. Une image différente ne suffit pas à créer un rôle différent.

### 12.2 Budget de rencontre et sécurité de lecture

Pour chaque attaque normale ou boss : portée, zone d’impact, délai d’annonce, vitesse, durée active, délai de récupération, dégâts, statut, temps de recharge et priorité de sélection. Vérifier les mêmes unités que le mouvement joueur. Une attaque évitable demande un chemin de sortie réellement libre, du temps de perception et du temps de déplacement ; « annoncée pendant X ms » ne démontre pas qu’elle est esquivable.

La fenêtre de lecture doit rester suffisante sur écran tactile, avec le personnage plus petit et le joueur moins précis. Les zones et projectiles dangereux restent visibles au-dessus des effets alliés ; différencier couleur **et forme**, et fournir une option de réduction des effets visuels. Définir le rayon visuel, le rayon d’impact et le rayon de télégraphe séparément.

Composer les vagues par **budget de pression** et plafonds par rôle, non par tirage equiprobable de tous les monstres. Exemples : tank + tireur pour prioriser une cible ; coureurs + zone pour changer de trajet ; invocateur + fourrage pour choisir entre source et XP. Éviter de superposer plusieurs charges/attaques de zone sans possibilité de fuite.

Chaque acte reçoit une courte partition : introduction du danger, mélange de deux rôles déjà appris, montée finale, transition vers le boss. Une variation d’acte doit faire apprendre une réponse nouvelle, pas simplement augmenter quatre multiplicateurs. Les premières élites servent d’apprentissage ; leurs affixes restent limités et compréhensibles.

### 12.3 Résistances et contrôle

Introduire éventuellement des résistances partielles après stabilisation des formules. Éviter les immunités élémentaires totales qui annulent un build de trois sorts. Séparer résistance aux dégâts, résistance au recul, résistance au ralentissement et immunité à un contrôle dur. Pour un boss, convertir un contrôle interdit en effet borné utile, ou annoncer explicitement son absence d’effet.

Ne pas supposer que Enemy.json contient une IA complète : dans l’échantillon examiné, des champs tels que `bulletType`, `knockback` et `res_Knockback` ne fournissent pas le programme des attaques. Le contre-jeu reste à concevoir et implémenter dans notre moteur.

## 13. Assets : inventaire exploitable et frontière technique

Créer un **manifeste**, avant toute importation, avec pour chaque ressource : origine, commit/version, fichier/atlas/frame, dimensions, transparence, animations disponibles, durée/FPS, palette, ancrage des pieds, hitbox prévue, taille mémoire et statut de réutilisation. États : présent et utilisable / à adapter / uniquement référence / manquant.

Les ressources de Vampire Survivors et les sprites actuels de Sanctuary ne partagent pas nécessairement angle, proportions ou palette. Préparer une planche de comparaison sur une carte réelle, aux tailles finales. L’adaptation ne doit ni casser la DA ni entraîner des ennemis dont la silhouette ne correspond pas à la hitbox. Une flaque décorative, un obstacle graphique et une collision de terrain sont trois données différentes : les cartes actuelles ne doivent pas être supposées solides parce qu’une roche y est peinte.

Vérifier également les dépendances de DLC, les variantes inutiles au premier lot, les chemins d’assets sur GitHub Pages et le chargement tardif. Les données peuvent référencer des atlas absents. `Arcana.json` contient des commentaires `//` dans l’extrait examiné, malgré son extension `.json` : un importeur JSON strict échoue. Un outil d’inventaire doit valider le format et les références, sans exécuter les contenus du dump.

Extensions à garder en réserve : bestiaire lié à la bibliothèque (inconnu → rencontré → vaincu), affixes d’élites, événements de vague, fusions, choix de modificateurs majeurs inspirés des Arcanas, progression après saturation inspirée de LimitBreak.json. Ces idées n’ont pas besoin d’être ajoutées ensemble ; talents, chaleur et ultimes couvrent déjà une partie de leurs fonctions.

## 14. Mesures complémentaires et protocole limité

### 14.1 Comptabiliser ce qui arrive réellement

En plus du DPS déjà prévu : sur-dégâts, mana dépensé par élimination utile, attaques perdues par cible morte, temps sans cible, pertes de contrôle, callbacks annulés par plafonds, corps disponibles/consommés et persistance d’une aura. Pour les ennemis : durée d’engagement, tirs effectivement possibles, joueur exposé, zones simultanées et densité autour du héros.

Pour les dégâts entrants, enregistrer **tentative → blocage par invulnérabilité → esquive → armure → bouclier → dégâts finaux**, sans mélanger « coups tentés » et « coups reçus ». Rejouer deux attaques simultanées dans les deux ordres. Tester si le poison utilise ou non la même fenêtre d’invulnérabilité que le contact : le choix doit être délibéré et expliqué.

Pour la chaleur, garder le vecteur complet des six rangs, pas seulement leur somme. Deux builds à chaleur 10 peuvent avoir des expériences opposées. Inclure le pacte d’élites, les revenus supplémentaires et l’effet de la cadence sur la progression. Tester aussi la vitesse des projectiles, les annonces et les récupérations : augmenter la vitesse de déplacement d’un boss ne démontre pas que tout son cycle accélère de manière cohérente.

Les horloges doivent rester distinctes : temps total de run, temps de vagues cumulé, temps local d’acte et temps de duel. Relever les niveaux au début/à la fin de chaque acte et à l’apparition du boss, plutôt qu’interpréter automatiquement la minute globale 12 comme l’acte V.

Tester aussi l’invariance à 30/60/120 Hz ou avec dt irrégulier. Par exemple, le recul actuel amortit sa vitesse par `0.86` à chaque mise à jour : son résultat peut dépendre de la fréquence d’appel. Mesurer collisions, DoT, contrôle, rythme des attaques et temps réel du duel avec la même durée simulée. Séparer une baisse de performance d’une baisse de puissance ; rapporter le coût des effets et les plafonds de projectiles/ennemis atteints.

### 14.2 Éviter une matrice exhaustive impraticable

Le produit de toutes les classes, actes, modes, builds, équipements, chaleurs et seeds devient rapidement énorme. Procéder par étapes :

1. **Sanité des formules :** capacités isolées et bornes ; aucun bot complet requis.
2. **Écran de base :** sept classes, sans méta ni équipement, chaleur 0 ; campagne et acte rapide suivant la règle retenue. Quelques seeds servent uniquement à détecter les ruptures manifestes.
3. **Interactions prioritaires :** combos, caps et pactes susceptibles de se multiplier ; tests par paires et scénarios extrêmes, plutôt que toutes les combinaisons.
4. **Validation ciblée :** au moins 30 seeds pour les scénarios retenus, puis davantage si l’incertitude empêche de choisir. Rapport séparé des bots et des joueurs.
5. **Playtests humains :** profils novice/familier, temps d’apprentissage explicite, relevé de la cause de mort et de la compréhension des effets.

Utiliser des flux RNG séparés pour combats, vagues, offres et loot. Sinon changer une recette peut consommer un tirage aléatoire supplémentaire et changer les vagues suivantes, rendant la comparaison trompeuse. Documenter dt, cadence des entrées et fréquence des lancements manuels. Mesurer sur ordinateur et en tactile ; un bot lançant chaque actif au cooldown ne représente pas un utilisateur de téléphone.

Les objectifs 40–70 % de victoire et <90 s de boss du plan restent des propositions. Avec peu de joueurs/seeds, les intervalles sont larges ; aucun de ces seuils ne devient un fait par adoption du document. Un test de code passant ne prouve pas un équilibrage réussi.

## 15. Ordre recommandé pour les prochaines évolutions

| Lot | Livrable concret | Condition pour passer au suivant |
|---|---|---|
| 0 — Contrat de jeu | Actes autonomes de six minutes, boss à 2/4/6, escalade continue, slot d’ultime réservé ; snapshot des règles | Campagne et délai de défaite retirés ; départ niveau 1 et tirage testés |
| 1 — Fondations | Matrice de statistiques, tables de rangs réels, télémétrie, RNG reproductible, relevé des erreurs de description | Valeurs affichées et dégâts appliqués concordent ; erreurs identifiées avant buffs/nerfs |
| 2 — Acte I représentatif | Sept starters, montée de six minutes avec trois boss, mana/soins/économie mesurés sans équipement obligatoire | Chaque classe possède une réponse viable et une raison d’échec compréhensible |
| 3 — Builds et combos | Un prototype de combo par classe, quelques ultimes et alternatives à coût égal | Pas de boucle de déclenchements, ni combo obligatoire ; comportement lisible et budget mesuré |
| 4 — Bestiaire et actes | Rôles, télégraphes, plafonds de composition, identités IV/V ; manifeste des assets retenus | Menaces réellement évitables ; budgets XP et densité respectés ; chargement/DA validés |
| 5 — Progression et chaleur | Équipement, méta, revenus et vecteurs de pactes évalués sur la base stabilisée | Jeu de base viable ; progression utile et difficulté maximale cohérente |
| 6 — Extensions | Bestiaire, affixes, événements, fusions ou modificateurs majeurs choisis un par un | Chaque ajout apporte une décision nouvelle plutôt qu’une seconde version d’un système existant |

**Première tâche à lancer après validation du plan :** implémenter le contrat utilisateur désormais fixé, puis produire la table d’application des stats et les mesures de six minutes depuis ce moteur. Ce document n’applique aucun des lots. Aucun asset Vampire Survivors n’a été importé lors de cette revue.

### Références supplémentaires examinées

- [Commit du dump examiné](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/tree/afea0f265e8720ea28e0dbe66af30fc164f33a52).
- [Weapon.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/afea0f265e8720ea28e0dbe66af30fc164f33a52/Data/Vampire%20Survivors/Weapon.json) : rangs, exclusions, prérequis multiples et évolution.
- [Enemy.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/afea0f265e8720ea28e0dbe66af30fc164f33a52/Data/Vampire%20Survivors/Enemy.json) : santé, vitesse, XP, recul et projectiles de certaines entrées.
- [Stage.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/afea0f265e8720ea28e0dbe66af30fc164f33a52/Data/Vampire%20Survivors/Stage.json) : calendrier, événements et modificateurs.
- [Arcana.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/afea0f265e8720ea28e0dbe66af30fc164f33a52/Data/Vampire%20Survivors/Arcana.json) : effets transversaux et contraintes de format à vérifier.
- [LimitBreak.json](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/afea0f265e8720ea28e0dbe66af30fc164f33a52/Data/Vampire%20Survivors/LimitBreak.json) : améliorations marginales et plafonds déclarés, sans transposition des valeurs.
