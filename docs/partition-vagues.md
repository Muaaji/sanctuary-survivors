# Partition des vagues : apprentissage, rotation, signature

`SurvivorWaveDirector` complète le calendrier autonome des actes. Il ne change ni cadence de spawn, ni HP/dégâts/vitesse, ni probabilité d'élite, ni XP, ni plafond global. Il choisit uniquement la composition de la prochaine apparition dans les assets existants.

## Deux premières familles pendant 60 secondes

| Acte | Apprentissage | Roster ensuite | Fourrage de réserve |
| --- | --- | --- | --- |
| I | Déchu, squelette | Déchu, zombie, squelette | Squelette |
| II | Scarabée, serpent | Scarabée, serpent, démon des sables, bouc | Scarabée, bouc |
| III | Hôte des spores, araignée | Fongus, araignée, spectre, Hôte des spores | Zombie renommé Hôte des spores |
| IV | Limier, chauve-souris | Limier, chauve-souris, ogre | Chauve-souris |
| V | Sentinelle gelée, chevalier | Chevalier, archer, spectre, Sentinelle gelée | Squelette renommé Sentinelle gelée |

Les deux renforts de fourrage utilisent les sprites et statistiques natifs du zombie et du squelette. Le champ `cfg.names` fournit les noms thématiques ; le wrapper de spawn les applique. Ils n'ont pas d'affixe inédit ou d'immunité. Les plafonds des spécialistes ne classent pas le zombie de réserve de l'acte III comme un gardien ; cela garantit un fallback lent lorsque les mécaniques actives sont déjà au budget.

Les poids normaux favorisent le fourrage (5), puis les coureurs (3), les remparts spécialistes (1,5), enfin tireurs et casters (1). Le choix reste aléatoire au sein de ces proportions ; il ne force pas une séquence rigide.

## Budgets de composition

Pour 180 ennemis au maximum : 12 remparts spécialistes, 8 tireurs, 6 casters, 20 coureurs au total par rôle. Si le plafond global configuré est inférieur, ces budgets diminuent proportionnellement, avec un minimum d'une unité. Les morts et les champions/boss sont exclus du comptage des rôles ; les unités vivantes, y compris les boss, comptent toujours pour le plafond global.

Lorsque tous les spécialistes sont au plafond, le directeur choisit parmi le fourrage autorisé. Il ne dépasse pas un plafond de spécialiste pour entretenir la cadence. `choose` retourne `null` lorsque la population globale a atteint son plafond ou lorsqu'une configuration externe ne propose aucun type admissible. Le roster de production possède toujours au moins un fourrage pour éviter cette dernière situation.

## Fenêtres sans hausse de densité

- 90–108 s : rotation d'apprentissage, priorité doublée au troisième type du roster principal.
- 180–200 s : une signature propre à l'acte, priorité doublée à une seule famille : Ruée des déchus, Traque des dunes, Essaim du marais, Meute infernale, Volée du givre.
- 300–322 s : renouvellement des rangs, priorité doublée au fourrage.

Les poids changent pendant 18, 20 et 22 secondes, puis reviennent à leur valeur normale. Le nombre d'ennemis n'est jamais augmenté pour matérialiser un événement : seules les apparitions ordinaires suivantes peuvent changer de famille. Le directeur n'invoque pas un boss, ne donne pas de récompense gratuite, n'impose pas de deadline et ne modifie pas la croissance de pression après six minutes.

## Contrat et validation

`config(act,time,baseCfg)` renvoie une copie augmentée de la configuration d'ActWaves. `choose(cfg,liveEnemies,rng)` accepte le RNG de vagues fourni par le moteur : même seed, mêmes conditions et même ordre d'appels produisent les mêmes types. Les événements ne consomment aucun tirage supplémentaire. `update(time)` affiche une annonce à l'entrée d'une fenêtre active et reste silencieux lorsque son état ne change pas ; il ne mute pas hors jeu actif. `reset()` permet de nettoyer explicitement le calendrier entre parties.

`node tests/wave-director.test.cjs` couvre les cinq rosters et les frontières de phase, caps, fallback, population globale, exclusion des champions, budgets réduits, conservation rate/elite/projectiles, reproductibilité du RNG injecté, fenêtres bornées, annonces uniques et pause.

Ces poids constituent une première partition contrôlable, pas une preuve d'équilibre de chaque build. Les mesures de duel, foule et survie de la télémétrie restent nécessaires pour réviser ensuite leur répartition à coût de progression égal.
