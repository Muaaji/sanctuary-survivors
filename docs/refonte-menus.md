# Refonte des menus — 12 octobre 2026

Accueil, choix des héros, préparation, boutique, Sanctuaire, progression, pause, victoire, défaite, réglages, bibliothèque, talents et inventaire partagent désormais une couche de mise en page finale (`css/menus.css`, `js/survivors/menu-layout.js`). Les contrôles existants sont conservés avec leurs événements.

- Accueil : action principale, grille des actions secondaires, aide séparée.
- Héros : cartes de largeur égale, grille responsive, typographie et espaces réguliers.
- Préparation : en-tête et actions fixes dans le panneau ; contenu défilant entre les deux.
- Boutique : colonnes image / description / prix / achat ; achat sur une seconde ligne sur téléphone. Une seule liste défile ; fermeture toujours visible.
- Bibliothèque et talents : fermeture réservée sous la liste, sans recouvrir le contenu.
- Inventaire : colonnes ramenées à deux puis une selon la largeur ; suppression du double défilement.
- Modales : seule la première couche visible reçoit les interactions et le focus. Les menus sous-jacents et le HUD sont inertes.
- Tactile : activation automatique sur appareil détecté ou premier contact tactile. Aucun bouton ni question d’activation. Les menus restent accessibles en portrait ; la pause explique la rotation nécessaire au combat.

## Vérification

24 contrôles de mise en page sur les huit écrans principaux, en 1280 × 720, 390 × 844 et 844 × 390. Aucun chevauchement de contrôles visibles ni débordement horizontal. Les rectangles sont intersectés avec leurs zones de défilement pour éviter de confondre une ligne partiellement masquée avec une superposition.

Contrôles complémentaires : réglages, Sanctuaire, bibliothèque, coffre ; achats et retour depuis le coffre puis la boutique ; petit paysage 568 × 320. Vérification sur navigateur avec capacité tactile simulée, pas sur téléphone physique. Détails dans `verification-menus-layout.json` et captures dans `screenshots/menus/`.

La recette automatisée du combat reste indépendante de la vérification DOM/visuelle. Les contrôles non visibles au premier écran restent accessibles par défilement ; la préparation et la boutique conservent leurs actions de sortie dans une zone dédiée.
