# Recette de la boutique — 12 octobre 2026

Résultat : validée après correction de l’Enclume. 68 suites automatisées passent.

## Cas vérifiés

| Cas | Résultat |
| --- | --- |
| Soin | Vie restaurée et prix débité |
| Rune et talisman de refonte | Une relance supplémentaire par achat |
| Enclume | Arme améliorée ; sort de classe inchangé |
| Enclume sans arme ou au rang maximal | Aucun débit ni stock consommé |
| Armure, PV maximum, essence et attraction | Effets appliqués |
| Or insuffisant | Aucun débit ni acquisition |
| Limite d’achat | Stock épuisé ; achat supplémentaire refusé |
| Achat d’équipement | Objet dans le coffre, prix débité, article marqué vendu |
| Coffre plein | Achat refusé sans perte d’or ni d’objet |
| Revente | Objet retiré, or crédité |
| Réouverture | Articles vendus et quotas conservés |
| E, Échap et bouton Partir | Retour au combat sans touche de déplacement bloquée |

Vérification dans un navigateur réel sur une copie isolée de la version publiée, avec le correctif de l’Enclume : achat de soin, Enclume, PV maximum, équipement, revente, fermeture. Aucun message d’erreur JavaScript. Exemple : 10 000 or → 8 960 après soin (160), Enclume (360), PV max (520) ; 8 906 après équipement (54) ; 8 915 après revente (9).

Correction supplémentaire de lisibilité : titre de la section équipements en couleur dorée.

Les scénarios utilisent une partie préparée pour le test. Cette recette ne mesure pas l’équilibrage économique d’une partie complète.
