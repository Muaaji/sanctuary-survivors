# Bestiaire : rôles lisibles par acte

Le module `SurvivorEnemyRoles` distingue les populations déjà introduites par `SurvivorActWaves`. Il ne change aucun multiplicateur de vie, dégâts ou vitesse, aucun poids de vague, aucune résistance et aucun asset.

| Acte | Familles et comportement |
| --- | --- |
| 1 | Déchu : corridor annoncé 0,8 s, course de 110 unités en 0,5 s, récupération 0,4 s. Zombie : poursuite simple, vitesse lente du catalogue conservée. |
| 2 | Serpent : direction de poursuite inclinée vers un flanc ; vecteur normalisé, vitesse conservée. Gardien des sables : rempart simple. Autres familles : poursuite native. |
| 3 | Fongus : cercle poison fixé à la position annoncée du héros, avertissement 1 s puis zone 1,6 s ; 30 % des dégâts de contact par tick de 0,8 s. Araignée : cercle toile annoncé 1 s puis présent 2 s, ralentissement natif sans dommage ajouté. Spectre : comportement natif. |
| 4 | Limier : corridor annoncé 1 s, charge de 150 unités en 0,5 s puis récupération 0,4 s. Ogre : rempart simple. Chauve-souris : poursuite native. |
| 5 | Chevalier : rempart simple. Archer : tirs existants conservés. Spectre : avertissement givre existant conservé dans ActWaves. |

Les charges ne poursuivent pas le héros après l'annonce. La collision balayée utilise la même capsule que le dessin : rayon physique du monstre, y compris celui du champion ; le rayon du joueur est ajouté lors de la collision. La préparation immobilise l'attaquant. Un contrôle dur annule sa charge ; un ralentissement diminue la distance effectivement parcourue. La zone poison et la toile restent fixes et disparaissent à la mort de leur propriétaire.

Deux annonces ou charges au maximum peuvent être présentes simultanément, une seule lorsqu'un vrai boss est vivant. Le budget total est de huit zones. Une nouvelle annonce est différée si le point visé empiète sur une zone ou un corridor existant : les menaces ordinaires ne superposent pas librement leurs avertissements sur le héros. Ces plafonds réduisent l'empilement ; ils ne constituent pas une preuve mathématique qu'une carte entière possède toujours un chemin libre, notamment avec des hazards de boss indépendants.

## Contrat d'intégration

- `reset()` nettoie les zones et les attributs de rôle ; appelé lors du reset de partie.
- `configure(entity, act, time)` affecte le rôle sans modifier les statistiques. Les vrais boss sont exclus ; les champions conservent leur famille. Ne mute pas dans les menus. `update` configure les entités restantes au premier frame de jeu, pour couvrir la préparation initiale.
- `update(dt, time)` doit être appelé avant le déplacement/contact des ennemis, après le rafraîchissement des facteurs d'acte. Il ne fait rien hors de `Game.state === 'playing'`.
- Le runtime évite déplacement et contact natifs pendant `e.ssRoleAction` (warning, dash, recovery). Le module applique lui-même le mouvement et au maximum une tentative de dégât par charge.
- Le runtime utilise `e.ssRoleSteer` à la place de la direction de poursuite lorsque la cible est le joueur ; le vecteur reste de norme 1. Il ne faut pas additionner ce vecteur à un déplacement déjà calculé. Une cible de provocation garde sa poursuite native.
- `draw(ctx,w2s)` se dessine après les sprites et effets pour garder les annonces visibles, avec la même conversion caméra que les autres zones.

## Vérification

`node tests/enemy-roles.test.cjs` vérifie la charge à 30/60/120 Hz et avec pas irréguliers, direction fixe, déplacement final identique, esquive en quittant le corridor, capsule balayée sans traversée manquée, dégât unique, préparation/récupération, ralentissement et annulation par contrôle dur. Il vérifie également sortie des cercles, ralentissement toile, avertissement avant impact, normes de direction, statistiques conservées, plafonds, réduction devant boss, mort propriétaire et gel dans les menus.

La vérification est autonome. Les tests ne reproduisent pas toute la boucle navigateur, les hazards boss simultanés ou la géométrie d'obstacles ; ces éléments relèvent de la validation de l'intégration complète.

Les champions intermédiaires conservent un contre-jeu de monstre élite : les contrôles durs durent moitié moins longtemps et le ralentissement est limité à 35 %. Les boss finaux gardent leur résistance distincte (15 % de ralentissement et absence de contrôle dur). Une interruption peut annuler une charge annoncée d’un champion.
