# Matrice réelle des statistiques — fondations de l’équilibrage

État du moteur au 12 octobre 2026. Aucune valeur de combat n’est modifiée par ce livrable. Les nombres sont calculés avec les scripts actifs ; les observations ci-dessous distinguent valeurs de formule et rendement réel en combat.

Reproduction : `node scripts/report-stats.cjs > docs/matrice-capacites.md`, puis `node tests/stats-foundations.test.cjs`. `--json` exporte également les sept profils complets. La [table des 270 états](matrice-capacites.md) couvre les 45 capacités aux rangs 1–5 et à l’ultime. Baseline : classe native, armes communes sur Sorcière, sans équipement, méta, passifs, synergies ni talents. L’ultime est isolé du bonus de son prérequis afin de montrer son effet marginal ; cette ligne n’est pas un build acquérable sans prérequis.

## Sources et ordre de calcul

| Stat | Source active et effet | Unité / limite |
|---|---|---|
| Puissance | `SurvivorStats.get` : profil historique `CLASSES.dmgMul − 1` + 0,08 par rang puissance + `metaBonus('might') − 1` + équipement | Bonus additif ; le runtime ne réapplique pas `dmgMul` |
| Mêlée / distance | Profil + 0,08 par rang du passif + équipement | Bonus additif, catégorie indépendante de l’élément |
| Dégâts de capacité | `R.stats` : `dmg catalogue × (1 + puissance + catégorie + rang + synergie + talent)` | Ultime appliqué ensuite ; aucun DPS réel déduit de cette valeur |
| Critique | 0,05 + profil + 0,02/rang + équipement + talent | Probabilité plafonnée à 0,75 |
| Dégâts critiques | 2 + profil + 0,12/rang + équipement | Multiplicateur × ; +12 points signifie ×2 → ×2,12 |
| Recharge | Profil + 0,04/rang + équipement, puis talent et palier de rang | Attribut borné −0,25…0,50 ; total capacité plafonné 0,50 |
| Vitesse d’attaque | Profil + 0,06/rang + équipement + 0,20 pendant Frénésie | Divise le délai par `max(0,5 ; 1 + bonus)` pour capacités compatibles |
| Zone | Rayon catalogue × (1 + 0,04/rang Allonge + talent + palier de portée) | Bonus de rayon, pas bonus de surface ; +20 % rayon = +44 % surface d’un disque |
| Durée | Durée catalogue × (1 + 0,10/rang persistance + palier de rang), puis secondes des talents | Les durées nulles ne deviennent positives qu’avec un talent en secondes |
| Armure | Profil + 1/rang plaque + 3 pendant barrière active + équipement | 1 point = 2 points de réduction ; réduction plafonnée 60 % dans `Player.takeDamage` |
| Esquive | Profil + 0,03/rang + équipement | Plafond 45 % |
| Mana | Réserve du profil + 15/rang + équipement ; régénération profil + 0,5/rang + équipement | Réserve absolue, régénération en mana/s |
| Vie | `integration.js` : base arrondie de `60 × hpMul × metaBonus('vital')`, puis +10 %/rang vitalité et PV plats | Soin de niveau = 2 % PV max ; équipement géré aussi par son module |

## Catégorie et élément : deux axes différents

`SurvivorStats.category` respecte `attackType` explicite ; sinon les modes `melee`, `frenzy`, `whirl`, `orbit`, `companion` sont de mêlée et tous les autres à distance. Ainsi les sorts magiques à distance profitent de Précision ; les compagnons profitent de Brutalité quel que soit leur élément. La puissance touche les deux familles. L’élément sert notamment au poison/brûlure et à la malédiction : les dégâts physiques gagnent le bonus de malédiction ; Explosion morbide en reçoit la moitié.

La vitesse d’attaque agit sur toutes les armes communes (`weapon`), les compagnons, les modes de tir de l’Amazone, les tourelles de l’Assassin et certains modes physiques. Elle ne touche pas automatiquement tous les sorts de distance. La table marque chaque capacité compatible. Les dégâts périodiques ne critiquent pas (`R.damage`, `ctx.periodic`) ; les impacts directs peuvent critiquer, y compris ceux d’alliés. Une moyenne théorique de critique direct vaut `dmg × (1 + chance × (multiplicateur − 1))`, sans prédire contacts, contrôle, surkill ou temps actif.

## Rangs et ultimes

Le rang visible `r` est converti en rang interne `L = 1 + (r − 1) × 7/4`, plafonné à 8 : **1 ; 2,75 ; 4,5 ; 6,25 ; 8**. Les seuils du catalogue/runtime portent sur L, pas sur r.

| Rang visible | Bonus dégâts classe | Bonus dégâts commun | Recharge propre classe | Recharge propre commun |
|---|---:|---:|---:|---:|
| 1 | 0 % | 0 % | 0 | 0 |
| 2 | 15 % | 15 % | 0 | 0 |
| 3 | 30 % | 15 % | 0 | 10 points |
| 4 | 45 % | 35 % | 10 points | 10 points |
| 5 | 60 % | 60 % | 10 points | 10 points |

Au rang 5, le bonus de portée propre vaut 20 % si arme commune ou capacité sans durée ; les compétences de classe avec durée gagnent 20 % de durée. L’ultime classe multiplie les dégâts par 1,50, le rayon par 1,25, le délai par 0,80 et les PV alliés par 1,50. L’ultime arme commune de mode `weapon` applique ×1,35 dégâts, ×1,15 rayon, ×0,85 délai et un changement de quantité/ricochet selon l’arme. Les autres modes communs, s’ils étaient réintroduits, n’ont pas ce multiplicateur générique dans `R.stats`.

## Mana et compagnons : effets réellement exécutés

Les attaques passives et armes communes sont gratuites. Les compagnons sont classés passifs : **coût effectif 0**, malgré une branche `manaCost(companion) = 12` actuellement inaccessible après le retour anticipé. Aucun coût n’est ajouté ici. Les compagnons se réapprovisionnent à des intervalles fixes (Valkyrie 8 s, squelettes 4 s, loups 5 s, Grizzly/Ombre 10 s) ; le délai calculé sert à leurs attaques. Leur plafond global est 8. Les squelettes nécessitent des cadavres ; la création initiale ne dépense pas de mana.

Les actifs coûtent `round(min(22 ; 7 + délai calculé × 1,5))`, sauf fan à 4 et aura à 5. Le coût dépend donc aussi des rangs, recharge, vitesse d’attaque et ultime. L’aura Feu sacré coûte 5 à l’activation et 4 mana/s ; Ouragan coûte selon la formule des actifs à l’activation puis 6 mana/s. À mana insuffisant, l’aura s’arrête. Les tourelles ne sont pas des compagnons passifs : leur déploiement consomme du mana. Les salves restent à 0,85 s pour Hydra et 1 s pour les pièges ; le délai calculé et la vitesse d’attaque ne changent pas ces intervalles de salve.

Les PV compagnons valent `base × (1 + 0,12 × (L − 1) + talent PV)` ; base 180 Grizzly, 140 Valkyrie, 70 autres. Loups et squelettes gagnent une unité aux seuils L≥3 et L≥7, plus talent `allies`. Le renouvellement vérifie le plafond global ; les PV de formule ne garantissent donc pas qu’un nombre nominal d’alliés soit présent.

## Points à mesurer ensuite

La table est une photographie de formules, pas un classement de puissance. Il reste à instrumenter les dépenses de mana par source, attentes, touches directes/périodiques, salves, contacts, temps actif, invocations présentes, dégâts utiles et surkill. Les cadence fixes des tourelles, budgets de touches d’orbites/zones et cibles secondaires doivent entrer dans un benchmark exécutant le combat. `damageBySkill` et `manaWaits` existent déjà mais ne couvrent pas toutes ces distinctions.

Descriptions conservées : les passifs correspondent aux formules actuelles ; les notes de profils sont des résumés non exhaustifs. La branche morte du coût compagnon est signalée au lieu de changer l’équilibrage. Le HUD affiche la recharge d’attribut, sans le palier propre à chaque capacité ni le multiplicateur de l’ultime ; la table donne le délai final.
