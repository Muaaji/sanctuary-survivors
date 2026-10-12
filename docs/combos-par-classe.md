# Combos optionnels par classe

Ces combos utilisent deux capacités existantes et leurs emplacements ordinaires. Ils n’ajoutent ni compétence, ni sprite, ni attaque gratuite, ni multiplicateur global permanent. La contrainte de construction et la fenêtre de synchronisation limitent leur valeur : investir trois rangs dans les deux capacités, lancer la première, puis exploiter la seconde pendant deux secondes.

## Contrat commun

- Les deux capacités doivent être possédées au rang 3 ou plus dans la classe concernée.
- Seul un lancement primaire de la première capacité ouvre la fenêtre. Effets secondaires, touches périodiques et attaques d’alliés sont exclus.
- La fenêtre dure 2 secondes de temps actif et le délai global partagé est de 6 secondes. Une activation consomme ce délai même si la seconde capacité n’est pas utilisée.
- Une seule fenêtre peut être ouverte. Les bonus concernent uniquement la capacité indiquée ; aucune nouvelle attaque ni tâche différée n’est créée.
- Les calculs de prévisualisation et de bonus ne modifient ni inventaire, ni rang, ni découverte, ni état de combat.
- Le reset de run vide la fenêtre et le délai. Les bornes sont définies dans le module, sans modifier le catalogue.

Les nombres sont une première calibration modeste, à tester sur boss et foule. Le DPS utile reste dépendant des contacts, critiques, cadence, mana et placement. Un combo n’est pas requis pour terminer un acte.

## Paires et bonus

| Classe | Combo | Déclencheur | Capacité renforcée | Bonus temporaire |
|---|---|---|---|---|
| amazon | Traque vénéneuse | Javelot de peste | Flèche guidée | +5 points de chance critique des Traits guidés |
| sorceress | Conduction ardente | Boule de feu | Éclairs en chaîne | +12 % de portée des sauts de Chaîne d’éclairs |
| necromancer | Moelle toxique | Nova de poison | Lance d’os | +10 % de dégâts de référence de Lance d’os |
| paladin | Serment du rempart | Bouclier sacré | Marteau béni | +5 points de chance critique des Marteaux bénis |
| barbarian | Écho du défi | Cri de guerre | Double lancer | +5 points de chance critique de Double lancer |
| druid | Vent de cendres | Fissure | Tornade | +10 % de dégâts de référence de Tornade |
| assassin | Ouverture électrique | Sentinelle de foudre | Griffes du dragon | +10 % de dégâts de référence de Griffe |

Ces paires croisent des branches différentes et ne reprennent aucune paire de `C.synergies`. Le rayon de Chaîne d’éclairs sert à chercher la cible du saut suivant. Marteau béni reçoit du critique : son rayon de catalogue ne règle pas sa spirale, qui reste inchangée.

## Intégration

Charger `build-combos.js` après catalogue/runtime/stats. Après création du contexte dans `R.cast`, appeler `SurvivorBuildCombos.onCast(s, ctx)`. À la fin de `R.stats`, retourner `SurvivorBuildCombos.apply(s)` : cette opération clone les statistiques, plafonne le critique à 75 % et limite les bonus de rayon/dégâts aux bornes du module. Le reset du runtime appelle `reset()`.

`list(classe)` fournit des définitions copiées, `active()` les combos dont les prérequis sont remplis avec statut de fenêtre/délai, `preview(id)` une phrase lisible, et `statsBonus(s)` les seuls bonus temporaires applicables. Tous ces lecteurs restent sans mutation. L’horloge est `R.now`, donc une pause ne consomme pas la fenêtre. Les compétences déjà lancées gardent leurs statistiques capturées ; la fenêtre encourage le lancement de la seconde compétence après la première.

## Vérification

`node tests/build-combos.test.cjs` couvre les sept classes, prérequis incomplets, source incorrecte, sources secondaires/périodiques/alliées interdites, cooldown global, expiration exacte à 2 s, réactivation à 6 s, limites de bonus, plafonnement critique, reset et absence de mutations par les prévisualisations.
