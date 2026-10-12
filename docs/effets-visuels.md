# Passe visuelle des effets

Rendu original canvas, inspiré du vocabulaire sombre des ARPG : palettes terre, cuivre, os, glace et poison ; aucune texture D2 importée.

`ground-art.js` partage les annonces de monstres et boss : silhouette réelle (cercle, rectangle, secteur, capsule), contours continus, grains et motifs discrets, progression du temps de préparation, intensité différente après activation. Les annonces sont dessinées après les effets alliés pour rester lisibles.

`zone-art.js` anime sept familles : os, braises, glace, lave, poison, runes et vent. Les champs n'utilisent plus leurs anciens disques et bandes de sprites. Les bursts visuels durent jusqu'à 0,7 seconde sans prolonger la fenêtre originale de dégâts de 0,15 seconde. L'horloge active fige les animations pendant les menus. Les effets hors écran sont écartés et le rendu des zones alliées est borné à 32 par image ; ce budget ne retire aucune collision.

Les tests vérifient les géométries, le déterminisme et la séparation des durées visuelles/combat. Une vérification navigateur complète la recette ; les appréciations artistiques restent subjectives.
