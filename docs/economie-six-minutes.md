# Économie des actes de six minutes

## Extraction des règles et calibration

`SurvivorRunEconomy` centralise les valeurs existantes ; il ne raccorde pas les consommateurs et ne modifie aucun gain. Les tests comparent formule XP, boutique, chaleur et bonus méta au moteur actuel. API : `xpToLevel(level)` donne le coût depuis ce niveau vers le suivant ; `chestGold=50`, `maxedChestGold=100`, `shopRules[id]={cost,limit}`, `heatVector`, `heatFactors`, `heatReward`, `victoryEssence`, `metaRules`, `metaBonus`. Le niveau reste plafonné à 40. Chaleur conserve le vecteur des six rangs bornés à 0–5.

Les budgets XP actuels sont 243 pour atteindre le niveau 8, 814 pour le niveau 15, 1875 pour le niveau 23 et 2210 pour le niveau 25. Il est prématuré de réduire ces coûts : la correction du bot change beaucoup les résultats des trois héros de mêlée.

## Corriger le biais de placement avant les valeurs

Le bot v1 repoussait tous les ennemis à moins de 95 unités alors que l’attaque de base de mêlée ne cible que dans 65 unités. Le bot `diagnostic-bot-v2-melee-approach` approche la cible dans la portée du starter moins son rayon, garde un seuil de sécurité `rayon joueur + rayon ennemi + 12`, recule pendant les recharges à proximité et oriente les actifs vers sa cible. Les trois classes concernées sont paladin, barbare et assassin. Les quatre autres conservent exactement leurs règles d’entrée v1 pour isoler cet effet. Ce comportement reste approximatif : il ne lit ni les annonces de boss ni toutes les trajectoires.

```sh
node tests/run-economy.test.cjs
node scripts/balance-runs.cjs --seeds=baseline-1,baseline-2,baseline-3 --seconds=360
node scripts/balance-runs.cjs --equipment-profiles
```

Acte I, aucun équipement équipé, méta vierge, chaleur 0, trois seeds identiques au premier rapport, `dt=.05`, entrées toutes les .2 s, première carte affichée, talents du starter en priorité. Pas de boutique ni mort retardée. Les niveaux des checkpoints ne concernent que les runs les atteignant.

| Classe | Niveaux à 120 s | Niveaux à 240 s | Niveaux à 360 s | Or final par seed |
|---|---|---|---|---|
| paladin | 8 / 7 / 7 | 16 / 15 / — | 23 / — / — | 4726 / 2383 / 500 |
| sorceress | 5 / — / — | — / — / — | — / — / — | 295 / 137 / 178 |
| amazon | 7 / 8 / 7 | 16 / 15 / — | — / 23 / — | 1777 / 3935 / 451 |
| necromancer | — / 7 / 4 | — / — / — | — / — / — | 135 / 592 / 234 |
| druid | — / 3 / — | — / — / — | — / — / — | 52 / 343 / 234 |
| barbarian | 8 / 8 / 8 | 17 / 15 / 17 | 23 / — / 25 | 5038 / 2413 / 5953 |
| assassin | 8 / 8 / 8 | — / — / — | — / — / — | 572 / 796 / 576 |

Les premières mesures du paladin donnaient deux survivants à 120 s au niveau 3 ; le nouveau placement donne trois survivants aux niveaux 8/7/7 sans changer un seul montant d’XP. Le barbare donne 8/8/8 et l’assassin 8/8/8 à 120 s. Cela identifie un biais du bot et interdit d’interpréter directement le premier écart paladin/amazone comme un manque de progression. Cela ne valide pas leur survie au boss : 17/21 runs meurent avant la limite, quatre restent en combat à 360 s, aucune victoire.

## Or et stock

Le coffre vaut actuellement 50 or. Les prix/limites par run sont soin 160/2, rune 180/1, amélioration d’arme 360/2, armure 270/2, relance 220/1, aimant 120/2, PV max 520/1 et poussière d’essence 600/1. Les stocks persistent quand la boutique revient. Les survivants à six minutes récupèrent 3935–5953 or, alors que les morts précoces récoltent 52–796. La somme théorique du stock coûte 3340 or : les quatre survivants de cet échantillon peuvent financer ce budget, sous réserve d’articles applicables et de rencontrer la boutique. Une modification uniforme des revenus masquerait ces différences de kills et de ramassage.

Proposition de première calibration : **garder XP, coffre et prix actuels**, puis tester séparément dépense réelle à 120/240/360 s avec achats à portée normale. Aucun bonus d’XP spécifique à une classe et aucune prime de chaleur n’est nécessaire pour le protocole sans équipement. Ne pas ajouter de récompense d’élite supplémentaire : chaque élite a déjà un coffre et huit pièces ; son pacte accroît déjà le revenu en augmentant sa fréquence. Le pacte XP réduit les gemmes de 10 % par rang ; sa compensation éventuelle doit être un choix de difficulté et de récompense annoncé, pas une correction invisible.

## Budget d’équipement appliqué

Le budget concerne la somme des bonus d’équipement appliqués au combat. `rawTotals(cls)` conserve la somme complète des objets pour l’inspection, `totals(cls)` fournit les bonus effectifs et `gearCaps` expose leurs bornes. Les objets, noms, affixes et sauvegardes ne sont ni réécrits ni relancés : un surplus peut redevenir utile avec d’autres pièces. Les passifs de run, profils de classe, talents et méta s’ajoutent séparément à ce budget.

| Stat d’équipement cumulée | Maximum appliqué |
|---|---:|
| Dégâts généraux | +35 % |
| Dégâts de mêlée / à distance | +25 % chacun |
| Vitesse d’attaque | +30 % |
| Chance de critique | +15 points de % |
| Dégâts critiques | +0,40 au multiplicateur |
| Réduction de recharge | +20 points de % |
| Esquive | +10 points de % |
| Déplacement | +15 % |
| PV | +80 |
| Armure | +8 |
| Mana max | +45 |
| Régénération mana | +3/s |

Le stress case utilise douze emplacements légaux générés par `SurvivorEquipment.generate` : helm, amulet, pauldrons, plate, bracers, gloves, deux signet, greaves, boots, sword et dagger. « Faible » : commun niveau 1. « Offensif » : ancien niveau 40 avec dragon/tiger/wolf/eagle. « Défensif » : ancien niveau 40 avec bear/turtle/phoenix/owl. « Méta max » ajoute les quatre améliorations permanentes au rang 5 au kit offensif. Ce sont des configurations diagnostiques, pas une estimation de probabilité de loot ni des valeurs maximales de toutes les combinaisons.

Le DPS ci-dessous est **l’espérance de dégâts d’une touche par recharge du starter**, calculée avec les véritables `stats()` et critiques du moteur. Elle ignore nombre de cibles, placement, mana et dégâts secondaires : elle sert à examiner une amplification de formule, pas à prédire le DPS de run.

| Profil | Paladin : DPS théorique avant → après | Sorcière : DPS théorique avant → après |
|---|---:|---:|
| Nu | 12,29 → 12,29 | 25,05 → 25,05 |
| Commun niveau 1 | 12,99 → 12,99 | 25,89 → 25,89 |
| Ancien offensif niveau 40 | 626,06 → 31,65 | 294,78 → 48,46 |
| Ancien offensif + méta max | 676,75 → 38,88 | 322,94 → 59,23 |
| Ancien défensif niveau 40 | 21,11 → 21,11 | 33,63 → 33,63 |

Le kit défensif donnait au paladin 1052 PV, 62,92 armure et 33,16 mana/s ; le budget donne 158 PV, 11 armure et 5 mana/s, profil de classe compris. Pour la sorcière, 1025 PV deviennent 131 PV. Le kit offensif améliore encore sensiblement le starter, mais l’inflation cumulée de douze affixes n’écrase plus le parcours nu. Ces bornes constituent une première calibration explicite ; leur validation demande des runs et essais humains.

Les tests vérifient des objets réellement générés, la somme bornée, les PV/armure/régénération appliqués, la conservation des objets après reset et save/load, ainsi que l’addition d’un passif de run hors budget équipement. Aucun test de formule ne démontre à lui seul un équilibrage réussi.

## Comparaison bornée de progression

```sh
node scripts/balance-runs.cjs --progression-screen --classes=paladin --seeds=baseline-1 --seconds=120
node scripts/balance-runs.cjs --progression-screen --classes=sorceress --seeds=baseline-2 --seconds=120
node scripts/balance-runs.cjs --classes=paladin --act=5 --heat=6 --gear=high-offense --meta=max --seconds=120
```

L’écran prend une classe et une seed par invocation : 24 runs, actes I/V × chaleur 0/6/30 × nu/kit offensif plafonné × méta vide/max. La chaleur 6 utilise un rang dans **chacun** des six pactes ; la chaleur 30 utilise cinq rangs partout. Chaque run relève son vecteur complet. Une victoire locale fictive sert uniquement à ouvrir le réglage de chaleur, sans équipement ni méta additionnels. `--seconds` reste limité à 480 ; chaque invocation reste limitée à 28 runs. Les bornes ne constituent pas une matrice exhaustive ; ajouter une seed exige une invocation séparée. Une mort reste un résultat terminal, sans checkpoint fictif à 120 s.
