# Statistiques et progression par classe

Les profils se trouvent dans `js/survivors/stats.js`. Les records d’actes sont sauvegardés dans `survivors_contracts` version 2, sous `byClass[classId][actIndex]` : −1 signifie non terminé, 0 à 30 indique la meilleure chaleur. L’ancien tableau partagé est conservé sous `legacyShared`.

| Classe | PV de base | Mana | Mana/s | Mêlée | Distance | Armure | Esquive | Critique | Dégâts critiques | Vitesse d’attaque | Réduction cooldown |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Paladin | 78 | 80 | 2 | +15 % | −10 % | 3 | 0 % | 5 % | 200 % | −5 % | 0 % |
| Sorcière | 51 | 140 | 3,5 | −20 % | +5 % | 0 | 0 % | 5 % | 200 % | 0 % | +5 % |
| Amazone | 60 | 90 | 2 | −10 % | +15 % | 0 | 5 % | 8 % | 200 % | 0 % | 0 % |
| Nécromancien | 51 | 130 | 3 | −15 % | 0 % | 0 | 0 % | 5 % | 215 % | −5 % | 0 % |
| Druide | 66 | 110 | 4,5 | +5 % | +5 % | 1 | 0 % | 5 % | 190 % | 0 % | 0 % |
| Barbare | 90 | 60 | 1,5 | +20 % | −15 % | 2 | 0 % | 5 % | 210 % | +5 % | −5 % |
| Assassin | 54 | 80 | 2 | +10 % | 0 % | 0 | 10 % | 10 % | 220 % | +10 % | 0 % |

Les bonus historiques de dégâts (+15 % Sorcière, +10 % Nécromancien) et de déplacement sont conservés et s’ajoutent à ces spécialités. Le Sanctuaire et les passifs modifient la fiche en partie. Les rangs/talents propres aux sorts peuvent encore modifier leurs valeurs finales.

Validation : isolation des records et déverrouillages, stockage par classe, effets mêlée/distance, cadence, multiplicateur critique, armure/esquive, dépenses/régénération de mana, bonus de réserve et remise à zéro entre parties. Sept simulations de campagne complètent ces tests.
