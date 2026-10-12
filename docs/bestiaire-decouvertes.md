# Bestiaire et découvertes

Le bestiaire réutilise la sauvegarde `survivors_knowledge`. Chaque identité suit une progression monotone : inconnu (0), aperçu (1), vaincu (2). Une apparition appelle `SurvivorBestiary.seen(entity)` ; une mort appelle `defeated(entity)`. Ces méthodes n’acceptent que les identités présentes dans les catalogues actifs et restent inoffensives si le système de connaissances manque.

Les clés sont `enemy:<type>` pour les monstres ordinaires, `champion:<sprite>` pour les dix champions et `boss:<id>` pour les cinq boss finaux. Un champion ne révèle pas automatiquement son monstre ordinaire ; ces découvertes restent distinctes. Les changements de classe et les recommencements conservent la collection, comme les compétences découvertes.

## Contenu et affichage

`entries()` retourne les fiches regroupées en Monstres ordinaires, Champions et Boss finaux, avec leur statut. Le renderer doit remplacer entièrement nom, description et illustration des fiches au statut 0 par « ? / Non découvert ». Les statuts 1 et 2 se présentent comme « Aperçu » et « Vaincu », sans reprendre le terme « Acquis » des capacités.

Les fiches ordinaires viennent de `ENEMY_BASE`, les champions de `SurvivorEncounters.catalog()` et les finales de `finalCatalog()` si disponible (sinon seules les identités de `BOSSES` sont utilisées). Aucune fiche ne montre les anciens PV historiques de boss ni les PV courants soumis à la chaleur et à l’escalade. Les descriptions de rôles suivent `SurvivorEnemyRoles.families` : ruée, charge, contournement, robustesse, poison, toile, tir ou poursuite. Elles décrivent des actions, sans présenter un multiplicateur de santé volatile comme une constante.

Les champions utilisent une image PNG individuelle. Les monstres ordinaires et boss n’exposent pas directement une URL d’animation : afficher toute une bande de frames comme une icône serait faux. Leur champ `sprite` permet au renderer de recadrer la première frame depuis `Sprites.monsterSprite` ou `Sprites.bossSprite` si souhaité ; sinon la fiche reste sans image.

## Inventaire technique et provenance

Reproduire le manifeste : `node scripts/inventory-assets.cjs > docs/manifeste-assets.json`. L’outil parcourt uniquement les PNG locaux, lit dimensions et taille compressée, calcule la mémoire d’une surface RGBA décodée et identifie bandes horizontales/atlases. Pour les PNG non entrelacés 8 bits avec canal alpha, il décode les filtres PNG et compte les pixels non opaques ; pour les autres formats, la transparence non mesurable reste explicite.

L’ancrage des acteurs décrit le renderer réel : centre horizontal, bas de l’image à `entity.y + 8`. Il ne prétend pas déduire les pieds anatomiques de l’image. Les cartes, effets, icônes et interfaces ont un ancrage propre à leur consommateur. Les atlases sans mapping explicite ne reçoivent pas un faux nombre de frames.

La provenance est indépendante de la compatibilité technique : les dix images de champions sont identifiées comme générées avec ImageGen pour le projet ; les autres fichiers existants ont une origine non vérifiée. Une image techniquement réutilisable n’obtient pas automatiquement un auteur ou une licence. Aucun contenu visuel de Vampire Survivors n’est importé.

Le manifeste initial contient 267 PNG, 31 524 521 octets de fichiers et 115 597 520 octets de surfaces RGBA théoriques. Cette dernière valeur n’est pas la mémoire totale du navigateur : elle exclut doublons GPU, canvas, caches et structures du moteur.

## Vérifications

`node tests/bestiary.test.cjs` vérifie les trois statuts, l’absence de rétrogradation, les identités séparées, la persistance de stockage et de classe, les entités inconnues, l’absence de données PV historiques et le fonctionnement sans `SurvivorKnowledge`. Le manifeste est reproductible et son inventaire distingue dix champions des images existantes sans provenance attestée.

Les sprites PNG des champions sont conservés à leur résolution d’origine pour l’édition. À leur chargement, le moteur prépare des textures de 64 × 64 px sans lissage ; les entités utilisent ces textures, soit environ 160 Ko pour les dix textures plutôt que 60 Mo de pixels retenus par leurs objets d’image. Le navigateur reste responsable de son cache de décodage pendant le chargement. Le manifeste décrit les fichiers sources, pas la mémoire réellement utilisée par ce cache.
