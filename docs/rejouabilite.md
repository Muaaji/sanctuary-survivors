# Parcours du jour et historique local

Le parcours du jour fixe une seed par date **UTC**, classe et acte. La version `daily-v1` fait partie de la seed. Deux départs avec les mêmes paramètres utilisent les mêmes flux pseudo-aléatoires ; les décisions, déplacements, compétences, équipements, bonus permanents et mises à jour du jeu peuvent modifier la partie. Ce système ne promet pas une reproduction exacte des actions ni des résultats.

Les parties libres restent sans seed par défaut. Il n'y a ni serveur, ni classement, ni comparaison compétitive : la chaleur, l'équipement et la progression ne sont pas normalisés.

`SurvivorReplay` fournit :

- `setMode('normal' | 'daily')` et `mode` pour le choix avant départ.
- `seedFor(classId, act, date?)` : date courante à chaque appel, conversion UTC ; une date invalide lève une erreur.
- `start(classId, act, {seed?, date?}?)` : métadonnées du départ, dont `seed` (ou `null`) et un token. Appeler une fois au reset, puis passer sa seed à `SurvivorRunRng.reset`. Une seed explicite sert aux tests/debug.
- `finish(SurvivorTelemetry.snapshot())` : enregistre une victoire ou une mort une fois par départ. Un snapshot invalide ne termine pas l'enregistrement.
- `entries()` : copie indépendante des dix dernières parties, de la plus récente à la plus ancienne ; l'interface peut en afficher cinq.
- `format(entry)` : libellé compact français, utilisable via `textContent`.
- `replayLatest()` : réserve la seed de la dernière partie pour le prochain départ et retourne ses paramètres. L'interface doit sélectionner sa classe et son acte avant le reset. Une partie libre sans seed n'est pas rejouable par ce mécanisme. Un changement de mode annule cette réservation ; elle est consommée au prochain départ.

L'historique garde uniquement token technique, date UTC, mode, seed, classe, acte, vecteur de chaleur, résultat, durée et niveau. Aucun nom, compte, information privée, journal d'actions ou donnée de combat détaillée n'est conservé. Le stockage `survivor-run-history-v1` est limité à dix entrées. La lecture plafonne la taille JSON, valide les champs et élimine les entrées malformées. Si le navigateur bloque ou sature le stockage, l'historique reste utilisable en mémoire pour la session. Les doublons sont évités par le départ courant et son indicateur de fin ; aucun cache croissant de tokens n'est maintenu.

Validation : `node tests/replay.test.cjs` couvre frontière UTC, changements de jour/classe/acte, défaut sans seed, relecture de seed, limite de dix, copies indépendantes, fin idempotente, données invalides et stockage indisponible.

## Intégration dans les menus et observateur

La préparation propose un bouton Parcours du jour avec état accessible `aria-pressed`. Le titre et la pause affichent les cinq dernières parties et proposent de réserver la dernière seed, puis ouvrent la préparation avec sa classe et son acte. Le joueur peut revoir ses pactes avant de lancer. Une seed debug via URL reste prioritaire.

L’observateur initialise les métadonnées au reset du joueur puis réinitialise les flux RNG. Une frontière imbriquée autour des dégâts, dommages subis et progression attend la mise à jour du coup final avant le bilan et l’enregistrement. Le rendu historique se rafraîchit une fois à la fin. `node tests/replay-integration.test.cjs` vérifie aussi les boutons de mode, les resets quotidiens, la priorité debug et les compteurs de mort finalisés.
