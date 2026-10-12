# Armes communes et mana

**Mise à jour :** les compétences sont désormais séparées en passives gratuites et actives manuelles (touches 1–3, visée souris). Les auras basculées consomment du mana par seconde. Le budget de lancement automatique décrit plus bas est une mesure historique ; il a été remplacé par le contrôle manuel. Les compagnons sont désormais passifs et gratuits. Voir le README pour les règles actuelles.

Les dix identifiants historiques sont conservés pour les sauvegardes ; leurs noms, comportements, icônes, sprites et ultimes sont remplacés. Toutes les armes sont physiques et gratuites en mana.

| Arme | Dégâts rang 1 | Recharge | Portée | Comportement |
|---|---:|---:|---:|---|
| Dagues de lancer | 12 | 1.15 s | 300 | Deux dagues rapides sur des cibles différentes. |
| Hache de lancer | 28 | 2 s | 300 | Une hache lourde qui traverse puis revient. |
| Arc long | 24 | 1.35 s | 420 | Une flèche précise et rapide sur une cible. |
| Épée | 24 | 1.3 s | 64 | Une taille frontale touche jusqu’à trois ennemis. |
| Lance | 30 | 1.65 s | 112 | Une estocade transperce une ligne devant vous. |
| Arbalète | 38 | 2.25 s | 430 | Un carreau lent à recharger, très puissant et perforant. |
| Faux | 22 | 2.1 s | 90 | Un large balayage frappe les ennemis autour de vous. |
| Masse | 34 | 2 s | 58 | Un coup lourd étourdit brièvement jusqu’à deux ennemis. |
| Fronde | 18 | 1.6 s | 360 | Une pierre rebondit sur deux cibles proches. |
| Fléau | 18 | 0.85 s | 78 | Une boule d’acier décrit une orbite et frappe au contact. |

Ces valeurs sont modifiées par la classe, les passifs, les rangs et les ultimes. Les dégâts de zone ont des limites de cibles : épée 3, masse 2, lance/faux 6. La vitesse d’attaque réduit leur cadence.

Les profils régénèrent maintenant de 1,5 à 4,5 mana/s. Les sorts coûtent généralement 7 + 1,5 × leur recharge effective (arrondi, maximum 22), les auras 5, les invocations 12 à leur apparition et les éventails 4. Les frappes simples et tirs physiques de classe sont gratuits. Chaque héros possède une attaque faible gratuite, toutes les 1,35 s avant bonus, pour continuer à combattre pendant la récupération du mana.

La file de lancement réserve le mana à tour de rôle pour éviter qu’un sort bon marché ne bloque indéfiniment les plus coûteux. Les armes physiques restent actives pendant cette attente. Le passif de mana ajoute 15 de réserve et 0,5 mana/s par rang. Une compétence prête mais sans mana affiche « Mana » sur son emplacement.

Validation : trente suites, dix mécaniques d’armes physiques, zéro consommation des armes, épuisement du mana avec trois sorts et augmentation mesurable des lancements avec le passif. Sur 90 s de cible de test, la Sorcière lance environ 40 sorts sans investissement contre 67 avec cinq rangs de mana ; les chiffres exacts et les campagnes sont dans `verification-armes-mana.txt`. Ces simulations isolent le combat, pas le ressenti complet d’une partie humaine.
