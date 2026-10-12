# Mesures de fondation — Acte I

Ce protocole sert à repérer des ruptures et à préparer les essais humains. Un bot diagnostic ne représente ni le taux de victoire des joueurs, ni leur maîtrise du mana, du ciblage et des annonces. Aucun seuil du plan n’est validé par ce script.

## Reproduire une mesure

```sh
node tests/run-rng.test.cjs
node scripts/balance-runs.cjs --seeds=baseline-1 --seconds=360 > /tmp/balance-runs.json
node scripts/balance-runs.cjs --classes=sorceress --seeds=baseline-1,baseline-2 --seconds=120
```

Par défaut : sept classes, acte I autonome, chaleur 0, niveau 1, aucun équipement équipé et stockage méta vierge dans chaque VM. Les objets de loot restent autorisés, avec les règles du jeu ; aucun achat à la boutique. Le script reprend les scripts réels dans l’ordre de `index.html`, dont les nouveaux modules de règles, avec un DOM sans rendu. Il avance le pipeline de combat du moteur, pas une formule indépendante.

Durée demandée 360 secondes actives, pas fixe `dt=0.05` (20 Hz), commandes toutes les 200 ms. `--dt` accepte des pas jusqu’à 0.05 ; cela ne prétend pas démontrer l’invariance à la fréquence. Une mort ou victoire arrête la simulation ; les checkpoints ultérieurs portent `unreached:true` avec l’état terminal. Le duel peut continuer à six minutes dans le jeu : ici la fenêtre d’observation s’arrête à la durée demandée, sans forcer une victoire. Durée bornée à 480 secondes et 28 runs par invocation.

Le bot cherche l’XP à moins de 220 unités, revient vers le centre autrement, et combine une répulsion des ennemis à moins de 95 unités. C’est une esquive de contact rudimentaire : il ne lit pas correctement les attaques de boss ni les projectiles. Il active les compétences utilisables à chaque intervalle d’entrée ; une aura déjà entretenue n’est pas désactivée. Les bindings prennent la première touche Digit libre. Il choisit la première carte **affichée**, sans relance. Les talents vont d’abord vers la branche du starter, puis l’ordre du catalogue ; les conditions d’achat du moteur restent appliquées. Ces décisions sont une politique reproductible, pas une recommandation de build.

Le JSON rapporte seed, dt, actions, temps actif, état, niveau, XP résiduelle et cumulée collectée, HP/mana, dégâts utiles cumulés et par capacité, DPS moyen depuis le départ, dégâts HP entrants et attentes de mana. Le DPS vient du compteur réel `damageBySkill` et inclut l’attaque de base si le moteur la comptabilise. Il exclut les sur-dégâts ; aucun intervalle de DPS n’est reconstruit après une mort. La télémétrie détaillée est jointe si le module observateur est chargé.

## Aléatoire

`SurvivorRunRng` est désactivé par défaut et ne remplace jamais `Math.random`. `reset(seed)` accepte une chaîne ou le nombre zéro ; `reset(null)` retrouve l’aléatoire natif. Cinq flux indépendants : `combat`, `waves`, `offers`, `loot`, `visual` (effets visuels), dérivés du seed par hash FNV-1a puis générateur Mulberry32. `withStream` restaure son contexte même si une fonction lève une erreur ; son scope est synchrone. Le snapshot fournit état et nombre de tirages par flux pour vérifier les raccords.

Pour des comparaisons fiables, les helpers doivent passer par ce RNG et les appels directs de loot/offres par leur flux explicite. Les scopes vagues/offres/loot prennent en charge les appels imbriqués ; le combat est le défaut. Une seed identique ne promet pas les mêmes résultats après changement de code, de dt ou de politique d’entrée. En revanche, consommer des tirages loot supplémentaires ne décale pas les vagues.

## Échantillon

L’écran initial comprend une seule seed par starter et ne permet aucune conclusion statistique. Après le raccord des hooks RNG, conserver les résultats bruts et vérifier deux exécutions identiques en excluant seulement le temps mural. Une suite de tests du RNG vérifie reproduction, isolation loot/combat, plages [0,1[, seed zéro, changement de seed, scopes après exception et absence de remplacement global.

Le smoke initial de sept scénarios a pris moins de quatre secondes sur la machine de développement. Le coût dépend de la survie et de la densité ; le script ne mesure pas le rendu, les assets, le tactile ou les performances du navigateur. Les paramètres de combat existants sont conservés. Les premières morts doivent conduire à analyser les dégâts entrants et le placement avant de proposer des changements de valeurs.

## Écran reproductible du 12 octobre 2026

Protocole v2 : le bot de mêlée approche à portée au lieu de fuir systématiquement les contacts. Trois seeds × sept classes, acte I, chaleur 0, 360 secondes. Deux exécutions sont identiques après retrait du temps mural. Sources et SHA256 sont enregistrés dans [mesures-acte1.json](mesures-acte1.json).

| Classe | Morts | En cours à 360 s | Victoires |
|---|---:|---:|---:|
| Paladin | 3 | 0 | 0 |
| Sorcière | 3 | 0 | 0 |
| Amazone | 1 | 2 | 0 |
| Nécromancien | 3 | 0 | 0 |
| Druide | 3 | 0 | 0 |
| Barbare | 0 | 3 | 0 |
| Assassin | 3 | 0 | 0 |

Seize morts, cinq parties encore actives. La fenêtre finit à l'apparition du boss final : aucune victoire n'est forcée. Ces résultats diagnostiquent le moteur et la politique du bot ; ils ne valident pas l'équilibrage humain.

[48 profils de progression](mesures-progression.json) croisent actes I/V, chaleur 0/6/30, équipement et méta pour le paladin et la sorcière. [Quatre essais prolongés](mesures-duels.json) vont jusqu'à 480 secondes et se terminent tous par une mort. Le bot ignore une partie des annonces et n'achète rien : des parties humaines restent nécessaires pour calibrer les valeurs.
