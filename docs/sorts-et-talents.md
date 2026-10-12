> Document de conception historique. Les règles actuelles et recettes corrigées se trouvent dans [revision-d2-bosses.md](revision-d2-bosses.md).

# Proposition de compétences — Diablo Survivors

Cette proposition couvre les sept classes de Diablo II / Lord of Destruction : 10 armes communes, leurs 10 passifs et évolutions, 5 compétences par classe, et 3 branches de talents par classe. Les compétences de classe reprennent des noms et thèmes de Diablo II ; leur fonctionnement automatique, leurs évolutions, les talents et les chiffres ci-dessous sont des créations pour ce projet. Les valeurs constituent un point de départ pour le prototype.

## 1. Structure d'une partie

- Déplacement contrôlé par le joueur ; attaques, sorts, pièges et invocations automatiques. Une animation d'attaque n'immobilise pas le personnage.
- Les compétences ne consomment pas de mana ; leur cadence et leurs durées règlent leur disponibilité.
- Six emplacements offensifs : trois compétences de sa classe et trois armes communes. Six emplacements de passifs.
- Départ avec la compétence indiquée par ★. Les quatre autres compétences de la classe et les dix armes communes entrent ensuite dans les choix de montée de niveau.
- À chaque niveau : choisir parmi trois offres pour acquérir une compétence, améliorer une compétence possédée ou acquérir/améliorer un passif. Respecter les emplacements disponibles.
- Compétences et armes : huit rangs. Passifs : cinq rangs. Une évolution remplace son arme dans le même emplacement.
- En plus de ce choix normal, gagner un point de talent aux niveaux 5, 10, 15, 20, 25, 30, 35 et 40. Cible initiale : niveau 40, soit huit points de talent.
- Compétences, passifs et talents choisis pendant la partie repartent de zéro à la partie suivante. Les déblocages de classes et de contenu peuvent rester permanents.
- Les tirs ciblent l'ennemi le plus proche ; les zones ciblent le groupe le plus dense ; les invocations privilégient les menaces proches du joueur. Sans cible, conserver le tir plutôt que l'envoyer dans le vide.

## 2. Dix armes ou sorts communs

Ces armes sont accessibles aux sept classes. Elles reprennent les formes de combat fréquentes dans les jeux de survie : salve dirigée, projectile en cloche, orbite, aura, zone persistante, chaîne, projectile chercheur et bombardement.

La cadence correspond au rang 1, avant les bonus. Les améliorations spécifiques indiquées sont appliquées aux rangs 3 et 6.

| Arme | Fonctionnement initial | Cadence | Rang 3 → rang 6 |
|---|---|---|---|
| Lames de lancer | Deux lames rapides dirigées vers la menace la plus proche ; dégâts physiques. | 1 s | +1 lame → traverse deux ennemis supplémentaires. |
| Haches de guerre | Une hache en cloche tombe sur un ennemi puis frappe une petite zone ; dégâts physiques. | 2,4 s | +1 hache → +1 hache. |
| Orbes de braise | Une boule de feu explose à l'impact ; dégâts de feu. | 2 s | +1 orbe → brûlure durant 2 s. |
| Anneau de lames | Deux lames tournent autour du joueur, touchant les ennemis proches. | Orbite permanente | +1 lame → +1 lame. |
| Fioles pestilentielles | Une fiole laisse une flaque de poison durant 3 s au milieu d'un groupe. | 4 s | +1 fiole → flaque prolongée de 1 s. |
| Éclats de givre | Trois éclats en éventail ralentissent les ennemis touchés ; dégâts de froid. | 2,5 s | +2 éclats → traverse un ennemi supplémentaire. |
| Orbe d'orage | Un éclair saute entre trois ennemis proches ; dégâts de foudre. | 3 s | +1 cible de chaîne → +1 cible. |
| Sceau sacré | Une aura autour du joueur inflige de faibles dégâts magiques réguliers. | Un dégât toutes les 1 s | +15 % de rayon → ennemis touchés ralentis de 15 %. |
| Crânes vengeurs | Deux crânes cherchent chacun une cible puis disparaissent à l'impact ; dégâts magiques. | 3 s | +1 crâne → +1 crâne. |
| Pluie de comètes | Une comète marque le sol puis frappe le groupe le plus dense ; dégâts de feu. | 5 s | +1 impact → laisse une braise au sol durant 2 s. |

Progression commune des rangs : rang 2, +15 % des dégâts initiaux ; rang 3, amélioration spécifique ; rang 4, délai réduit de 10 % ; rang 5, +20 % des dégâts initiaux ; rang 6, seconde amélioration spécifique ; rang 7, +20 % de rayon pour les zones ou +20 % de portée pour les autres attaques ; rang 8, +25 % des dégâts initiaux. Au rang 8, les bonus de dégâts de rang totalisent donc +60 % de la valeur initiale. Pour une orbite permanente, la réduction du délai améliore l'intervalle entre deux touches sur le même ennemi.

## 3. Dix passifs et leurs recettes d'évolution

Les passifs profitent à toutes les compétences compatibles, communes et de classe. Leur recette donne une raison supplémentaire de les choisir.

| Passif | Effet à chaque rang / maximum au rang 5 | Arme associée | Évolution et changement de comportement |
|---|---|---|---|
| Œil du chasseur | +2 points de chance critique par rang ; +10 points au maximum. | Lames de lancer | **Éventreur** : salve de lames chercheuses ; les critiques appliquent un saignement de 2 s. |
| Anneau d'expansion | +4 % de rayon par rang ; +20 % au maximum. | Haches de guerre | **Faucheuses** : haches qui reviennent vers le joueur après leur trajectoire et frappent à l'aller et au retour. |
| Rune de puissance | +8 % de dégâts par rang ; +40 % au maximum. | Orbes de braise | **Fournaise** : les explosions déposent une zone de feu de 2 s. |
| Plaque protectrice | +2 points de réduction des dégâts reçus par rang ; +10 points au maximum. | Anneau de lames | **Rempart d'acier** : les lames gagnent un rayon plus large et détruisent un projectile hostile au maximum toutes les 0,5 s. |
| Sceau de persistance | +10 % de durée des zones, états et invocations temporaires par rang ; +50 % au maximum. | Fioles pestilentielles | **Peste rampante** : les flaques s'élargissent doucement ; un ennemi empoisonné qui meurt contamine un voisin. |
| Sablier occulte | −4 % de délai par rang ; −20 % au maximum. | Éclats de givre | **Couronne de gel** : salve circulaire ; un ennemi déjà ralenti est gelé brièvement. |
| Carquois runique | +10 % de vitesse des projectiles par rang ; +1 projectile aux rangs 2 et 5, soit +2 projectiles et +50 % de vitesse au maximum. | Orbe d'orage | **Tempête en chaîne** : lance deux chaînes sur deux cibles initiales différentes, puis ajoute les bonus de projectiles applicables. |
| Cœur de rubis | +10 % de vie maximale par rang ; +50 % au maximum. | Sceau sacré | **Sanctuaire** : un ennemi tué dans l'aura rend 0,5 % de vie maximale, avec une limite de 2 % par seconde. |
| Aimant des âmes | +20 % de rayon de ramassage par rang ; +100 % au maximum. | Crânes vengeurs | **Moissonneurs** : chaque crâne peut toucher une seconde cible et ramasse l'expérience le long de sa trajectoire. |
| Bottes du pèlerin | +4 % de vitesse de déplacement par rang ; +20 % au maximum. | Pluie de comètes | **Marche apocalyptique** : impacts alternant entre le groupe le plus dense et une position devant le joueur dans sa direction de déplacement. |

Une arme évolue si elle est au rang 8, si son passif associé est au rang 3 ou plus, et si le joueur ouvre un coffre d'élite ou de boss obtenu à partir du niveau 10. Si plusieurs recettes sont prêtes, proposer le choix de l'évolution. Le passif reste équipé. Les dégâts, projectiles et bonus déjà acquis sont conservés ; le comportement évolué remplace les effets équivalents afin d'éviter de compter deux fois la même explosion ou le même ralentissement. L'évolution constitue le dernier rang de cette arme.

## 4. Compétences des sept classes

Chaque classe dispose de cinq compétences, dont trois peuvent être équipées dans une partie. Elles utilisent également huit rangs : aux rangs 2, 4, 6 et 8, +15 % des dégâts initiaux ou de la capacité du bouclier ; aux rangs 3, 5 et 7, améliorer alternativement quantité, cadence et portée/durée selon le comportement. Les invocations augmentent leurs dégâts avec les rangs ; leurs quantités restent soumises à la limite globale indiquée plus bas. Les talents apportent les changements les plus distinctifs.

### Amazone — projectiles, javelots, compagne

| Compétence de Diablo II | Adaptation automatique proposée |
|---|---|
| ★ Tir multiple — Multiple Shot | Éventail de trois flèches vers le groupe le plus proche, toutes les 1,5 s. |
| Flèche guidée — Guided Arrow | Une flèche chercheuse privilégie les élites et boss, toutes les 2,3 s. |
| Fureur de foudre — Lightning Fury | Javelot dont l'impact libère quatre traits électriques vers les ennemis proches, toutes les 3,5 s. |
| Javelot de peste — Plague Javelin | Javelot traversant laissant un nuage de poison de 3 s à l'impact, toutes les 5 s. |
| Valkyrie — Valkyrie | Une guerrière permanente combat près du joueur ; réapparition après 8 s si elle meurt. |

### Sorcière — feu, froid, foudre

| Compétence de Diablo II | Adaptation automatique proposée |
|---|---|
| ★ Boule de feu — Fireball | Projectile explosif vers une cible proche, toutes les 1,8 s. |
| Orbe gelé — Frozen Orb | Orbe avançant et dispersant des éclats de froid, toutes les 4 s. |
| Éclairs en chaîne — Chain Lightning | Éclair sautant entre quatre cibles, toutes les 3 s. |
| Blizzard — Blizzard | Zone de glace de 3 s sur le groupe le plus dense, toutes les 7 s. |
| Hydre — Hydra | Une tourelle de feu temporaire de 5 s ; une nouvelle toutes les 7 s ; maximum deux hydres actives. |

### Nécromancien — armée, os, poison et cadavres

| Compétence de Diablo II | Adaptation automatique proposée |
|---|---|
| ★ Ressusciter un squelette — Raise Skeleton | Trois squelettes permanents au départ ; un squelette manquant revient toutes les 4 s. |
| Lance d'os — Bone Spear | Projectile magique traversant trois ennemis, toutes les 2 s. |
| Nova de poison — Poison Nova | Anneau empoisonnant les ennemis proches durant 3 s, toutes les 5 s. |
| Explosion morbide — Corpse Explosion | Fait exploser le cadavre voisin d'un groupe ; vérification toutes les 3 s ; dégâts fixes dépendant du rang. |
| Amplification des dégâts — Amplify Damage | Malédiction sur un groupe : +15 % de dégâts reçus durant 4 s, toutes les 7 s. |

Une mort laisse un cadavre exploitable pendant 8 s, dans une limite de 20 cadavres proches. Une explosion consomme un cadavre. En combat de boss, sans autre ennemi vivant ni cadavre exploitable, un fragment spectral apparaît près du boss toutes les 8 s pour maintenir l'utilité d'Explosion morbide.

### Paladin — mêlée, magie sacrée, protection

| Compétence de Diablo II | Adaptation automatique proposée |
|---|---|
| ★ Zèle — Zeal | Trois coups courts successifs vers une menace au contact, toutes les 1,4 s. |
| Marteau béni — Blessed Hammer | Un marteau décrit une spirale sortante autour du joueur, toutes les 2,5 s. |
| Feu sacré — Holy Fire | Aura permanente infligeant un dégât de feu toutes les 1,2 s. |
| Poing des cieux — Fist of the Heavens | Foudre sacrée sur une cible prioritaire puis deux traits magiques secondaires, toutes les 5 s. |
| Bouclier sacré — Holy Shield | Barrière absorbant l'équivalent de 15 % de la vie maximale, renouvelée toutes les 8 s ; les barrières ne s'additionnent pas. |

### Barbare — mêlée, lancer, tourbillon et rage

| Compétence de Diablo II | Adaptation automatique proposée |
|---|---|
| ★ Double attaque — Double Swing | Deux frappes courtes dans un cône frontal, toutes les 1 s. |
| Double lancer — Double Throw | Deux armes de jet vers une cible proche, toutes les 2 s. |
| Tourbillon — Whirlwind | Zone de frappes tournantes autour du joueur durant 1,5 s, toutes les 5 s ; le joueur conserve son déplacement. |
| Cri de guerre — War Cry | Onde proche infligeant des dégâts et étourdissant 0,5 s, toutes les 6 s. |
| Frénésie — Frenzy | Rafale de deux coups au contact, toutes les 1,8 s ; une touche donne +15 % de vitesse de déplacement durant 2 s, sans cumul. |

### Druide — vent, feu et meute

| Compétence de Diablo II | Adaptation automatique proposée |
|---|---|
| ★ Tornade — Tornado | Projectile de vent avançant sur une trajectoire légèrement courbe, toutes les 2,2 s. |
| Ouragan — Hurricane | Anneau de froid et de vent autour du joueur durant 4 s, toutes les 7 s ; ralentit les ennemis proches. |
| Fissure — Fissure | Zone de sol brûlant de 4 s sous un groupe, toutes les 7 s. |
| Loups spirituels — Summon Spirit Wolf | Deux loups permanents poursuivent les menaces proches ; remplacement d'un loup mort toutes les 5 s. |
| Grizzly — Summon Grizzly | Un ours permanent frappe en petit cône ; réapparition 10 s après sa mort. |

### Assassin — griffes, poison, pièges et ombre

| Compétence de Diablo II | Adaptation automatique proposée |
|---|---|
| ★ Griffe du dragon — Dragon Claw | Double frappe courte sur l'ennemi le plus proche, toutes les 1 s. |
| Sentinelle de foudre — Lightning Sentry | Piège de 5 s tirant des lignes électriques ; un piège posé toutes les 6 s ; maximum deux actifs. |
| Traînée de feu — Wake of Fire | Piège de 5 s projetant des vagues en éventail ; un piège posé toutes les 6 s ; maximum deux actifs. |
| Venin — Venom | Imprègne les attaques physiques directes du joueur d'un poison de 2 s pendant 4 s, toutes les 7 s. |
| Maître de l'ombre — Shadow Master | Une compagne permanente frappe au contact ; réapparition 10 s après sa mort. |

## 5. Arbres de talents

Chaque classe possède trois branches. Une ligne ci-dessous est une chaîne de quatre talents : premier nœud → deuxième nœud → troisième nœud → ultime. Chaque nœud coûte un point, possède un seul rang et exige le nœud précédent de sa branche.

- Premier nœud : accessible au niveau 5.
- Deuxième nœud : accessible au niveau 10.
- Troisième nœud : accessible au niveau 15.
- Ultime : accessible au niveau 20, après les trois nœuds de la même branche.
- Un seul ultime peut être choisi par partie. Les points suivants permettent de développer les autres branches sans prendre leur ultime.
- Un talent améliore uniquement les compétences de classe précisées. Il ne donne pas automatiquement une compétence à équiper.
- Exemple aux niveaux 5/10/15/20 : terminer une branche et son ultime. Aux niveaux 25/30/35 : les trois premiers nœuds d'une seconde branche. Au niveau 40 : premier nœud de la troisième branche. Les huit points ont donc un usage précis.

### Arbre de l'Amazone

| Branche / sorts concernés | Nœud 1 | Nœud 2 | Nœud 3 | Ultime |
|---|---|---|---|---|
| Archerie : Tir multiple, Flèche guidée | **Visée** : +20 % de dégâts des flèches. | **Perforation** : traverse deux ennemis supplémentaires. | **Œil d'aigle** : +10 points de chance critique des flèches. | **Pluie guidée** : chaque troisième salve de Tir multiple ajoute trois flèches chercheuses à 60 % des dégâts d'une flèche ; Flèche guidée gagne un ricochet. |
| Javelots : Fureur de foudre, Javelot de peste | **Pointes runiques** : +20 % de dégâts. | **Propagation** : Fureur libère deux traits supplémentaires ; Peste dure 1 s de plus. | **Contagion** : +20 % de rayon des effets d'impact. | **Orage pestilent** : l'impact de Fureur applique un poison total égal à 40 % de ses dégâts sur 2 s ; Peste ajoute un éclair de 50 % des dégâts initiaux du javelot. |
| Valkyrie | **Lance céleste** : +25 % de dégâts de la Valkyrie. | **Gardienne** : +40 % de vie de la Valkyrie. | **Provocation** : attire les ennemis ordinaires durant 3 s toutes les 8 s. | **Championne** : chaque troisième attaque de la Valkyrie devient une frappe en zone à 150 % de ses dégâts habituels. |

### Arbre de la Sorcière

| Branche / sorts concernés | Nœud 1 | Nœud 2 | Nœud 3 | Ultime |
|---|---|---|---|---|
| Feu : Boule de feu, Hydre | **Braises** : +20 % de dégâts. | **Combustion** : les impacts brûlent pour 20 % des dégâts de l'impact par seconde, durant 2 s. | **Incendie** : Boule de feu gagne +20 % de rayon ; Hydre dure 1 s de plus. | **Couvoir ardent** : chaque quatrième Boule de feu invoque une petite hydre de 2 s ; les hydres restent limitées à deux actives. |
| Froid : Orbe gelé, Blizzard | **Gel mordant** : +20 % de dégâts. | **Prison froide** : les impacts directs de l'Orbe gèlent 1 s les ennemis déjà ralentis, selon les limites de contrôle. | **Hiver prolongé** : Blizzard dure 1 s de plus ; +15 % de rayon des effets de froid de cette branche. | **Éclatement glacial** : l'Orbe termine sa course en libérant huit éclats à 60 % des dégâts d'un éclat normal. |
| Foudre : Éclairs en chaîne | **Surcharge** : +20 % de dégâts. | **Conduction** : deux cibles supplémentaires par chaîne. | **Décharge rapide** : délai réduit de 15 %. | **Double tempête** : chaque lancement se répète une fois après 0,3 s à 60 % des dégâts ; la répétition ne se répète pas. |

### Arbre du Nécromancien

| Branche / sorts concernés | Nœud 1 | Nœud 2 | Nœud 3 | Ultime |
|---|---|---|---|---|
| Armée : Squelettes | **Maîtrise des morts** : +25 % de dégâts des squelettes. | **Légion** : deux squelettes supplémentaires. | **Os renforcés** : +25 % de vie des squelettes. | **Commandant spectral** : toutes les 8 s, un squelette devient champion durant 3 s et inflige deux fois ses dégâts habituels. |
| Os : Lance d'os | **Moelle noire** : +20 % de dégâts. | **Perce-chair** : deux ennemis traversés supplémentaires. | **Fracture** : +10 points de chance critique. | **Trident funèbre** : chaque lance ajoute deux lances latérales à 60 % de ses dégâts. |
| Corruption : Nova, Explosion, Amplification | **Toxicité** : +20 % de dégâts de Nova et Explosion. | **Malédiction longue** : Amplification dure 2 s de plus. | **Souillure** : +20 % de rayon des trois compétences. | **Mort contagieuse** : un ennemi sous Amplification qui meurt laisse un nuage de 2 s, infligeant chaque seconde 20 % des dégâts totaux de la Nova ; maximum un déclenchement toutes les 0,5 s. |

### Arbre du Paladin

| Branche / sorts concernés | Nœud 1 | Nœud 2 | Nœud 3 | Ultime |
|---|---|---|---|---|
| Croisé : Zèle, Bouclier sacré | **Ferveur** : +20 % de dégâts de Zèle. | **Foi solide** : +30 % de capacité du Bouclier. | **Grâce** : chaque troisième touche de Zèle rend 1 % de vie maximale, maximum une fois toutes les 2 s. | **Représailles** : un Bouclier brisé par les dégâts produit une onde infligeant 150 % des dégâts d'un coup de Zèle ; délai interne de 6 s. |
| Jugement : Marteau, Poing des cieux | **Lumière** : +20 % de dégâts. | **Échos sacrés** : un marteau supplémentaire par lancement et un trait secondaire supplémentaire pour Poing. | **Rayonnement** : +20 % de rayon des impacts et +20 % de portée des marteaux. | **Double jugement** : chaque quatrième lancement de l'une des deux compétences se répète une fois à 50 % des dégâts. |
| Aura : Feu sacré | **Purification** : +20 % de dégâts. | **Présence** : +25 % de rayon. | **Entrave** : l'aura ralentit de 20 %. | **Bûcher sacré** : un ennemi tué dans l'aura brûle un voisin proche pour 50 % des dégâts d'une pulsation ; l'effet secondaire ne se propage pas. |

### Arbre du Barbare

| Branche / sorts concernés | Nœud 1 | Nœud 2 | Nœud 3 | Ultime |
|---|---|---|---|---|
| Armes : Double attaque, Double lancer | **Maîtrise** : +20 % de dégâts. | **Traversée** : Double lancer gagne un ricochet ; Double attaque peut toucher une cible de plus dans son cône. | **Coups sauvages** : +10 points de chance critique. | **Massacre** : chaque troisième touche directe de ces deux compétences produit un cône secondaire à 60 % des dégâts de cette touche. |
| Tourbillon | **Acier tournant** : +20 % de dégâts. | **Rotation longue** : durée augmentée de 0,75 s. | **Mobilité** : +10 % de vitesse de déplacement pendant Tourbillon. | **Tempête d'acier** : pendant Tourbillon, laisse une entaille au sol toutes les 0,5 s ; elle dure 1 s et inflige un total de 40 % des dégâts d'une frappe de Tourbillon. |
| Rage : Frénésie, Cri de guerre | **Fureur** : +20 % de dégâts. | **Intimidation** : Cri étourdit 0,3 s de plus ; le bonus de déplacement de Frénésie dure 1 s de plus. | **Souffle guerrier** : délai des deux compétences réduit de 15 %. | **Rage vengeresse** : recevoir une touche retire 2 s au délai restant des deux compétences ; maximum une activation toutes les 4 s. |

### Arbre du Druide

| Branche / sorts concernés | Nœud 1 | Nœud 2 | Nœud 3 | Ultime |
| Vent : Tornade, Ouragan | **Bourrasque** : +20 % de dégâts. | **Pression** : Tornade traverse deux cibles supplémentaires ; Ouragan gagne +15 % de rayon. | **Saison froide** : Ouragan dure 1 s de plus. | **Cyclone vivant** : pendant Ouragan, une petite Tornade part vers une menace toutes les 2 s, à 50 % des dégâts de Tornade. |
| Terre et feu : Fissure | **Magma** : +20 % de dégâts. | **Faille longue** : durée augmentée de 1 s. | **Double faille** : crée une seconde zone près de la première ; les zones d'un même lancement ne doublent pas les dégâts sur une cible. | **Éruption** : une mort dans Fissure produit une petite explosion à 40 % des dégâts totaux d'une Fissure ; maximum une par seconde. |
| Meute : Loups, Grizzly | **Instinct** : +25 % de dégâts des animaux. | **Meute élargie** : un loup supplémentaire. | **Robustesse** : +20 % de vie des animaux ; le Grizzly ralentit ses cibles de 30 % pendant 2 s. | **Assaut sauvage** : chaque animal produit une attaque en zone à 120 % de ses dégâts habituels toutes les 8 s. |

### Arbre de l'Assassin

| Branche / sorts concernés | Nœud 1 | Nœud 2 | Nœud 3 | Ultime |
| Arts martiaux : Griffe, Venin | **Griffes affûtées** : +20 % de dégâts de Griffe et du poison de Venin. | **Enchaînement** : Griffe touche une cible de plus dans son cône ; Venin reste actif 1 s de plus. | **Précision létale** : +10 points de chance critique de Griffe. | **Exécution** : un critique de Griffe contre une cible empoisonnée gagne +30 % de dégâts directs. |
| Pièges : Sentinelle, Traînée de feu | **Ingénierie** : +25 % de dégâts. | **Déploiement** : un trait supplémentaire par salve électrique et une vague supplémentaire par salve de feu. | **Mécanismes** : durée des pièges augmentée de 1 s. | **Sabotage** : à expiration, chaque piège explose pour 50 % des dégâts d'une salve, dans son élément. |
| Ombre : Maître de l'ombre | **Double meurtrier** : +25 % de dégâts de la compagne. | **Ombre solide** : +30 % de vie de la compagne. | **Lames jumelles** : ses attaques peuvent toucher une seconde cible voisine. | **Leurre d'ombre** : la compagne crée un leurre de 2 s toutes les 8 s, attirant les ennemis ordinaires proches. |

## 6. Règles d'équilibrage communes

- Chance critique initiale : 5 %. Un critique inflige deux fois les dégâts directs. Le poison, le saignement, la brûlure et les autres dégâts périodiques ne critiquent pas ; ils utilisent les dégâts non critiques de référence.
- Ralentissement habituel : 30 % pendant 2 s. Gel habituel : 1 s. Étourdissement habituel : 0,5 s. Une même cible ne peut être gelée de nouveau qu'après 6 s. Les ralentissements ne s'additionnent pas : conserver le plus fort.
- Élites : durée de gel et d'étourdissement divisée par deux. Boss : ralentissement plafonné à 15 %, résistance au gel, à l'étourdissement, à la provocation et au recul. Ils continuent à subir les dégâts et les malédictions.
- Brûlure, poison et saignement sont trois familles distinctes. Dans une même famille, conserver au maximum trois applications de sources différentes ; une nouvelle application de la même source renouvelle sa durée plutôt que d'ajouter un cumul.
- Limites initiales par joueur : huit invocations permanentes, deux hydres, deux pièges de foudre et deux pièges de feu. Le bonus de projectiles augmente les projectiles des tirs et salves ; il ne crée pas d'invocations, de pièges ou d'auras supplémentaires.
- Nombre de projectiles directs : maximum douze par lancement ; une chaîne atteint au maximum huit ennemis ; les ricochets ne peuvent pas retoucher la même cible dans un même trajet.
- Les zones persistantes d'une même source qui se recouvrent ne multiplient pas leurs dégâts sur une cible. L'Anneau de lames ne frappe une même cible qu'une fois toutes les 0,4 s au rang 1.
- Tous les bonus de dégâts ordinaires sont additionnés dans un même groupe. Les multiplicateurs des ultimes et des critiques s'appliquent ensuite. Réduction des délais plafonnée à 50 % ; réduction des dégâts reçus plafonnée à 60 %. Les bonus de rayon restent des bonus de rayon : ne pas les confondre avec la surface.
- Une attaque secondaire créée par une évolution ou un talent ne peut pas redéclencher ce même effet, ni un autre effet de duplication/explosion à la mort. Une mort produit donc au maximum un effet secondaire de chaque famille ; les effets de contagion atteignent au plus une génération de voisins.
- L'augmentation de durée affecte les zones et les invocations temporaires ; elle ne prolonge pas les invocations permanentes. Les limites spécifiques du gel et des contrôles des boss restent prioritaires.
- Les soins sur élimination et sur touche possèdent leurs délais internes. Les soins n'excèdent jamais la vie maximale. Les bonus de vie augmentent la capacité maximale ; leur acquisition soigne seulement la quantité de capacité nouvellement gagnée.
- Une zone qui cherche un groupe et ne trouve qu'un boss le prend pour cible. Pour Marche apocalyptique, si le joueur reste immobile, tous les impacts ciblent un groupe plutôt qu'une position devant lui.

## 7. Exemples de combinaisons

| Style de partie | Trois compétences de classe | Trois armes communes | Passifs de recettes prioritaires | Branche principale |
|---|---|---|---|---|
| Amazone mobile | Tir multiple, Flèche guidée, Valkyrie | Lames, Haches, Comètes | Œil, Anneau d'expansion, Bottes | Archerie |
| Sorcière de gel | Orbe gelé, Blizzard, Éclairs en chaîne | Éclats de givre, Orbe d'orage, Anneau de lames | Sablier, Carquois, Plaque | Froid |
| Armée nécromantique | Squelettes, Explosion morbide, Amplification | Crânes, Fioles, Sceau sacré | Aimant, Persistance, Cœur | Armée puis Corruption |
| Paladin de proximité | Zèle, Feu sacré, Bouclier sacré | Anneau de lames, Sceau sacré, Haches | Plaque, Cœur, Expansion | Croisé puis Aura |
| Barbare de mêlée | Double attaque, Tourbillon, Cri de guerre | Anneau de lames, Haches, Lames | Plaque, Expansion, Œil | Tourbillon |
| Druide de meute | Loups, Grizzly, Ouragan | Crânes, Fioles, Éclats de givre | Aimant, Persistance, Sablier | Meute |
| Assassin de pièges | Sentinelle, Traînée de feu, Maître de l'ombre | Orbe d'orage, Orbes de braise, Fioles | Carquois, Puissance, Persistance | Pièges |

Les trois autres emplacements de passifs servent à renforcer le style ou à survivre : une recette ne bloque pas la liberté de choisir les autres passifs. Les tirs supplémentaires, les orbites, les chaînes, les zones, les invocations, la durée, la cadence, les critiques, l'armure, le ramassage et les évolutions fournissent les outils familiers des jeux de survie, avec les thèmes des classes de Diablo.

## Références pour les noms et thèmes de Diablo II

- [Liste officielle des compétences — Arreat Summit](https://classic.battle.net/diablo2exp/skills/alphaskills.shtml)
- [Présentation officielle des sept classes — Blizzard](https://news.blizzard.com/en-us/article/23719810/diablo-ii-resurrected-class-guide-showcase-ft-dbrunski125)

Les valeurs et recettes de ce document sont des propositions pour ce jeu, et non les statistiques de Diablo II ou les recettes officielles de Vampire Survivors.
