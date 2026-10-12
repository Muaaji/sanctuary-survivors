# Évolutions communes : changer la façon de toucher

Source examinée : [Weapon.json, commit afea0f265e8720ea28e0dbe66af30fc164f33a52](https://github.com/SurvivatonsAndMore/VampireSurvivorsFiles/blob/afea0f265e8720ea28e0dbe66af30fc164f33a52/Data/Vampire%20Survivors/Weapon.json). Ce dépôt constitue un dump communautaire extrait, pas une recommandation officielle. Les entrées WHIP/VAMPIRICA montrent des prérequis et une identité critique ; MAGIC_MISSILE/HOLY_MISSILE distinguent cadence, quantité et perforation ; KNIFE/THOUSAND modifient répétition et traversée ; AXE/SCYTHE différencient couverture et perforation. Les `tips` déclarent aussi des statistiques ignorées. Ces constats servent de principes de conception. Aucun nom, coefficient, texture ou autre asset du dump n'est importé dans le jeu.

Les adaptations sont originales et utilisent seulement les mécanismes déjà exécutés par `castWeapon` : projectiles, perforation, rebonds, vitesse, portée, frappes répétées, orbite et critique. Aucun déclencheur récursif, projectile secondaire ou nouvelle source d'attaque gratuite. Les armes de classe et leurs limites restent indépendantes.

| Arme existante | Changement au passage ultime | Budget par rapport au rang 5 sans évolution |
|---|---|---|
| Dague | Traverse une ligne avec +2 perforations et +10 points critiques | dégâts ×1,15, recharge ×0,90 ; aucune dague bonus |
| Hache | Traverse +2 ennemis ; retour existant plus mobile | dégâts ×1,15, vitesse ×1,20 |
| Arc | Salve élargie et trajectoires plus rapides | +1 flèche, vitesse ×1,25, dégâts ×1,10 |
| Épée | Deux tailles plus longues | +1 frappe, portée ×1,12 ; dégâts inchangés |
| Lance | Couloir d'estocade plus long | portée ×1,45, dégâts ×1,20 ; pas d'estocade bonus |
| Arbalète | Ligne de carreaux traversants | +3 perforations, vitesse ×1,15, dégâts ×1,20 |
| Faux | Plus grande couverture circulaire | portée ×1,35, dégâts ×1,15 ; pas de balayage bonus |
| Masse | Seconde frappe avec étourdissement existant | +1 frappe, intervalle entre frappes 0,12 s au lieu de 0,18 s ; dégâts inchangés |
| Fronde | Dispersion à rebonds | +2 rebonds, dégâts ×0,90, recharge ×0,95 |
| Fléau | Orbite avec davantage de masses à rayon serré | +2 masses orbitales, dégâts ×0,85, rayon ×0,90 |

Les comparaisons sont celles d'un rang 5 sans évolution **avec les mêmes passifs et équipement**. Une frappe supplémentaire n'est pas une garantie de dégât : les frappes de mêlée cherchent encore une cible à chaque répétition. Perforations, ricochets et vitesse modifient la couverture réelle. Le rendement dépend des ennemis regroupés, du déplacement et du temps de présence dans la zone ; il n'est pas assimilé à un multiplicateur de DPS universel.

## Contrat d'intégration et bornes

`SurvivorEvolutionContent.describe(id)` expose une copie de la définition et sa description ; `applyStats(s)` retourne une copie ; `finalStats(w,s)` utilise le drapeau d'évolution de l'arme possédée. Appeler une seule fois après le bloc générique d'évolution de `R.stats` et avant les combos. La fonction retire exactement l'ancien ×1,35 dégâts, ×1,15 portée, ×0,85 recharge, +1 attaque (hors hache/fronde) et +2 ricochets fronde, puis applique le budget spécifique. Cela empêche l'empilement involontaire. La formule de quantité est `max(0, quantitéEntrante − bonusGénérique) + bonusProfil`, bornée à 1–12, donc jamais négative. La fonction n'est pas une transformation à réappliquer sur sa propre sortie.

Plafonds : 12 projectiles/frappes, 8 perforations, 8 ricochets, 75 % critique, recharge au moins 0,05 s, vitesse au plus 1 200, rayon au plus 1 000. Valeurs non finies remplacées par des replis explicites. Les plafonds de secours ne constituent pas les valeurs d'équilibrage usuelles.

Le hook minimal de mêlée utilise `s.strikeInterval || 0.18` pour programmer les tailles ; seule la masse fournit 0,12 s. Le fléau utilise l'orbite et sa quantité/rayon, pas des tailles directes.

L'éligibilité reste la recette existante : arme au maximum 5 + passif associé au rang 1. Le module n'accorde aucune évolution et ne change pas les offres garanties ni la limite de trois armes/trois classes. Les armes non évoluées, les autres modes et les identités incompatibles restent inchangées.

Vérification : `node --test tests/evolution-content.test.cjs tests/evolution-integration.test.cjs` (11 tests réussis). Les tests d’intégration chargent les vrais scripts via index, vérifient les offres et leurs seuils, les projectiles perforants/rebonds, l’impact au-delà de la portée de base de la lance, l’intervalle réel de la masse et l’orbite bornée du fléau. Les suites survivors et combat-consistency passent également. Dix signatures différentes, invariance des armes de base, absence de mutation, contrôle d'identité et des valeurs non finies/plafonds. Le test des recettes vérifie leurs prérequis actuels sans inventer une deuxième logique d'attribution.
