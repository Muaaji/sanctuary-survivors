# Présages de run

Les champions de 2:00 et 4:00 donnent chacun un choix facultatif parmi trois Présages. Maximum deux acquisitions par partie. Le boss final, les ennemis ordinaires et les doublons de notification ne donnent aucun crédit. Reporter conserve exactement les mêmes cartes et le crédit : il ne relance pas le tirage. Les cartes utilisent exclusivement le flux RNG `offers` et excluent les Présages déjà acquis.

| Présage | Gain | Contrepartie |
|---|---|---|
| Fil de fer | Armes communes : dégâts +18 % | Portée −12 % |
| Braise intérieure | Attaques non physiques : dégâts +18 % | Intervalle +12 % |
| Œil fendu | Chance critique +5 points | Dégâts −10 % |
| Cercle dévorant | Capacités à rayon effectif : rayon +18 % | Dégâts −12 % |
| Pacte du guide | Compagnons : dégâts +18 % | Intervalle entre attaques +12 % |
| Sablier scellé | Capacités à durée positive : durée +18 % | Dégâts −10 % |
| Battement bref | Capacités à rayon effectif : intervalle −15 % | Rayon −12 % |
| Marche ardente | Déplacement du héros +15 % | Dégâts −10 % |

Pacte du guide apparaît pour Amazone, Nécromancien, Druide et Assassin. Les autres cartes restent disponibles à toutes les classes ; leur bénéfice dépend des capacités du build. Battement bref applique son gain et son coût ensemble uniquement aux capacités dont le rayon est utilisé. Marteaux, lances et tornades n'en bénéficient pas par un rayon décoratif. Le coût du Pacte concerne la cadence réelle des attaques des alliés, pas leur délai fixe de remplacement.

Les transformations clonent les statistiques. Les deux effets se multiplient, puis leur facteur de dégâts est plafonné à 1,35 ; l'intervalle reste au moins égal à 0,5 fois celui reçu en entrée et le critique ne dépasse pas 75 %. La vitesse du héros reçoit au plus +15 %. Aucun Présage ne crée d'attaque, de projectile, de compagnon, d'or ou de soin ; aucun déclenchement récursif. Les nombres de projectiles, limites d'effets et chaleur sont conservés. Les valeurs demandent encore des essais humains et ne prouvent pas l'équilibrage.

## Contrat d'intégration

- Charger `run-omens.js` après `run-rng.js`, puis appeler `reset()` au départ/recommencement.
- Appeler `earn(encounterId)` après que la rencontre a marqué la mort effective (`defeated`, entité morte et identifiant de run courant).
- `pending` reste vrai pour une récompense reportée. `deferred` empêche de rouvrir automatiquement le menu ; une nouvelle récompense réactive la proposition. Le bouton HUD appelle `resume()`, puis reprend la file de récompenses ; `choices()` et `choose(id)` pilotent le menu.
- `choices()` retourne trois cartes stables et des copies défensives. `choose(id)` accepte uniquement une carte actuellement proposée. Le deuxième crédit attend dans la file ; il conserve sa priorité quand la première offre est reportée.
- Appliquer `applyStats(s)` une seule fois au résultat final de la construction des stats, après les combos. Appliquer `applyPlayerSpeed(speed)` une seule fois lors du recalcul de vitesse du héros.
- Les attributs `owned`, `list(classId)`, `pending` et `deferred` servent à l'affichage. Résoudre les autres récompenses déjà en attente avant d'ouvrir le menu des Présages.

Validation automatisée : `node tests/run-omens.test.cjs` couvre morts éligibles, idempotence, absence de relance, offres stables, file reportée, plafond de deux, remise à zéro, sept classes, absence de mutation et toutes les paires de modificateurs. `node tests/omens-integration.test.cjs` vérifie aussi les morts réelles, la pause des choix, la reprise depuis le HUD, la priorité des autres récompenses et l'application unique des effets.
