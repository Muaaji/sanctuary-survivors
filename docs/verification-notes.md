# Vérification du 12 octobre 2026

21 suites de tests passent. Sept simulations de 900 secondes valident le passage des cinq actes, les boss et les limites de performance avec des builds maximaux et l’invulnérabilité.

Le benchmark mesure les dégâts infligés en 60 secondes par la compétence de départ de chaque classe, contre une cible puis douze ennemis qui convergent vers le héros. Aux rangs 4 et 8, chaque classe reçoit les mêmes Lames de lancer et les mêmes rangs de Puissance/Recharge. Aucun autre sort ni talent n’est utilisé. Ce protocole isole les dégâts de départ ; il ne mesure pas tous les builds, la survie en mouvement ni le ressenti humain. Les classes de zone restent volontairement plus fortes contre les groupes. Les coups critiques font varier légèrement les résultats.

Dans le navigateur : chaleur 1000 appliquée au HUD, mort après dix secondes, clic Redescendre puis sélection du héros sans écran de mort restant. Chaleur remise à 0. Déplacement jusqu’au bord droit : la carte couvre tout le champ visible. Premier niveau obtenu en 28 secondes : trois cartes distinctes — Feu sacré (classe), Éclats de givre (arme commune), Plaque protectrice (passif). Capture dans `screenshots/choix-mixtes.jpg`. Aucune erreur JavaScript relevée.

Corrections supplémentaires : les frappes multiples choisissent une autre cible quand la précédente meurt ; le rayon de collecte initial passe de 48 à 80 unités pour permettre de récupérer les gemmes lâchées à portée de mêlée.

La version finale comprend également les destinations par acte et six pactes de difficulté, verrouillés jusqu’à une première victoire. La chaleur totale est désormais limitée à 30 ; un test supplémentaire valide le déverrouillage, les multiplicateurs sauvegardés et la relance après victoire. Le test navigateur à chaleur 1000 décrit ci-dessus concernait la première version numérique, remplacée par ces pactes.
