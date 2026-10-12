# Cohérence temporelle du combat — lot 1

Corrections ciblées du runtime, sans nouvelle recette et sans modification des coefficients du catalogue.

- **Recul :** `0.86` par image est devenu `0.86^(60 × dt)`. Le déplacement utilise la somme intégrée correspondant à la référence 60 Hz. Un recul de 120 unités/s parcourt environ 14,28 unités en une seconde à 30, 60 et 120 Hz, ainsi qu'avec des pas irréguliers.
- **DoT :** la durée réellement active est intégrée, y compris la fraction du dernier pas. Un poison de 10 DPS pendant 1,017 s inflige 10,17 dégâts ; auparavant le dernier pas était perdu. Un DoT créé pendant le pas ne facture pas le temps précédant sa création. Une réapplication après expiration reprend sa nouvelle puissance et ne conserve pas la plus forte valeur expirée.
- **Champs :** les échéances progressent à partir du tick précédent, sans dériver avec les images. Les ticks antérieurs à l'expiration sont rattrapés avant suppression. Deux secondes de champ à 20 DPS infligent 40 dégâts sur cible immobile. La croissance dépend du temps depuis la création, plutôt que du seul dt de l'image de tick. Le verrou par source continue d'empêcher le cumul gratuit de champs superposés.
- **Contrôle :** un ennemi reprend son déplacement uniquement sur la fraction du pas suivant la fin du stun ; le ralentissement s'applique à la fraction active. Résistances boss et élite inchangées.
- **Cadence :** l'attaque de base et les compagnons conservent le reste du cooldown après un tir, supprimant la dérive cumulée. Un compagnon de cooldown 0,73 s frappe 14 fois en dix secondes aux quatre cadences testées.
- **Invocation :** les squelettes sans cadavre et les invocations bloquées par le plafond global ne consomment plus de mana ; une tentative impossible ne marque plus la première invocation comme déjà effectuée.
- **Propagation poison :** un poison expiré ne suffit plus à déclencher la propagation de la fiole ultime. Les gardes `secondary`, `periodic`, `ally` restent en place ; aucune nouvelle boucle de combo n'est introduite.

## Vérification

`node tests/combat-consistency.test.cjs` utilise le vrai runtime dans un environnement minimal déterministe. Il compare 30/60/120 Hz et la séquence irrégulière 11/47/23/19 ms, sur une durée simulée identique. Il vérifie DoT, déplacement et vitesse de recul, ticks et disparition de champ, expiration du contrôle, cadence des compagnons et paiement des invocations.

`node tests/survivors.test.cjs` : les 71 suites existantes passent, avec les 45 capacités et 84 talents exercés.

## Limites explicites

Ces scénarios comparent des cibles immobiles et des attaques sans RNG. Ils ne prouvent pas une invariance complète des projectiles homing, collisions courbes, jobs différés, AI boss, orbitaux ou attaques manuelles. Le rattrapage de champ utilise les positions disponibles lors de l'image courante, pas un historique de trajectoire. Les cadences d'attaques sont vérifiées pour des pas inférieurs au cooldown ; elles ne simulent pas plusieurs tirs au cours d'une image géante. La consommation aura et les dangers poison joueur relèvent des autres chemins moteur. Les compteurs existants `damageBySkill`, `hits`, `casts` et les contextes d'origine sont disponibles pour le module de télémétrie séparé ; aucun second collecteur n'a été ajouté ici.
