# Équipement et coffre partagé

Ouvrir avec **I**, depuis le titre, la préparation, la partie, la pause ou le marchand. Les douze cases sont disposées comme une fiche Diablo : tête, torse, jambières et bottes au centre ; épaules/gants/anneau gauche à gauche ; cou/poignets/anneau droit à droite ; deux armes en bas.

Chaque classe possède son équipement sauvegardé. Les cases commencent vides. Le coffre est commun aux sept classes et les acquisitions ne sont jamais équipées automatiquement. Les objets sont conservés après la mort et entre les descentes. Pendant une partie, seul le héros actif peut changer son équipement.

## Coffre et commerce

Deux onglets de 30 cases au départ, jusqu’à six (180 objets). Une case stocke un objet. La liste déroulante « Ranger dans » déplace un objet vers un autre onglet. Le marchand propose six objets fixes pour la descente : trois communs, deux peu communs, un rare. Chaque objet peut être acheté une fois et coûte trois fois son prix de revente. Les ventes se font depuis le coffre ouvert chez le marchand. L’or utilisé est celui de la descente, comme dans le système existant ; il repart à zéro à la prochaine partie.

Le changement d’équipement échange les objets sans les détruire. Équiper une arme à deux mains range les deux armes précédentes ; s’il manque une case, la transaction entière est refusée. Équiper une arme en seconde main range l’éventuelle arme à deux mains. Deux anneaux et deux armes à une main cumulent leurs bonus.

### Onglets déblocables

- **Collectionneur** : Ramasser 25 équipements → +1 onglet.
- **Chasseur de reliques** : Ramasser un légendaire ou un ancien → +1 onglet.
- **Fléau des gardiens** : Vaincre 10 boss → +1 onglet.
- **Mémoire des anciens** : Ramasser un objet ancien → +1 onglet.

## Butin et raretés

Chance de drop d’équipement : monstre normal **0,3 %**, élite **15 %**, boss **100 %**. Un coffre de progression donne aussi **20 %** de chance d’un équipement. Le butin apparaît avec un sprite, une bordure colorée et son nom. Il rejoint automatiquement le coffre en passant à proximité ; si le coffre est plein, il reste au sol. Le butin encore au sol est perdu lorsque la descente est abandonnée ou recommencée. À la victoire, les équipements au sol rejoignent le coffre s’il reste de la place.

| Rareté | Couleur | Affixes | Tirage normal, après drop | Tirage boss/coffre, après drop |
|---|---|---:|---:|---:|
| Commun | Gris | 0 | 47 % | 12 % |
| Peu commun | Vert | 1 | 28 % | 25 % |
| Rare | Bleu | 2 | 16 % | 30 % |
| Très rare | Jaune | 3 | 7 % | 25 % |
| Légendaire | Orange | 4 | 1.8 % | 7 % |
| Ancien | Rouge | 4 | 0.2 % | 1 % |

Ces couleurs suivent la demande du jeu. Le vert représente ici les objets peu communs. La structure des emplacements et le principe des affixes s’inspirent du [guide officiel des objets Diablo III](https://eu.diablo3.blizzard.com/en-gb/item/) et les anciens à meilleurs jets du [guide Blizzard Ancient & Primal](https://news.blizzard.com/en-gb/article/22989464/legendary-an-ancient-primal-guide). Les noms, valeurs et sprites de cette implémentation sont originaux.

## Équilibrage

La puissance de l’objet suit le niveau de la descente à sa découverte (1–40), sans niveau requis pour pouvoir le réutiliser après un redémarrage. Facteur de niveau : `1 + 0,0125 × (niveau − 1)` ; facteur de qualité : **1 / 1,25 / 1,55 / 1,90 / 2,35 / 3** (commun → ancien). Les objets déjà sauvegardés bénéficient automatiquement de ces nouveaux facteurs au prochain chargement ; leurs jets sont conservés et leurs bonus sont recalculés une seule fois. Les affixes sont distincts sur un objet. Les armes à deux mains multiplient les bonus d’affixe par 1,7 pour compenser leur occupation des deux mains. Les objets anciens tirent le maximum des plages d’affixe et renforcent les propriétés de relique de 30 %.

Les bonus s’additionnent aux profils, passifs et talents existants. Plafonds totaux conservés : critique 75 %, esquive 45 %, recharge 50 %, réduction par armure 60 %. L’armure donne deux points de réduction par point. Les dégâts généraux des armes équipées renforcent les armes de progression et les compétences ; l’équipement ne remplace pas les six capacités de la barre. La vitesse d’attaque renforce les attaques concernées par le moteur ; la recharge concerne les compétences. Changer d’objet ne restaure ni vie ni mana, pour éviter les soins gratuits par échanges.

## Familles et statistiques de base

Valeurs avant multiplicateurs de niveau et rareté.

| Objet | Emplacement | Bonus de base |
|---|---|---|
| Calotte de cuir | Tête | +0.3 Armure |
| Heaume de fer | Tête | +0.5 Armure |
| Diadème runique | Tête | +5 Mana |
| Amulette d’ambre | Cou | +0.15 Régénération mana /s |
| Talisman d’os | Cou | +4 Mana |
| Épaulières de fer | Épaules | +0.4 Armure |
| Mantelet de cuir | Épaules | +0.4 % Esquive |
| Robe tissée | Torse | +6 Mana |
| Cotte de mailles | Torse | +0.6 Armure |
| Cuirasse de fer | Torse | +0.8 Armure |
| Brassards rivetés | Poignets | +0.3 Armure |
| Bandelettes runiques | Poignets | +0.1 Régénération mana /s |
| Gants de cuir | Gants | +0.8 % Vitesse d’attaque |
| Gantelets d’acier | Gants | +0.3 Armure |
| Anneau d’argent | Anneau | +0.3 % Chance de critique |
| Sceau de cuivre | Anneau | +3 Vie |
| Grèves de fer | Jambières | +0.5 Armure |
| Jambières de cuir | Jambières | +4 Vie |
| Bottes de voyage | Bottes | +1 % Vitesse de déplacement |
| Solerets de fer | Bottes | +0.4 Armure |
| Épée courte | Arme 1M | +2.5 % Dégâts généraux |
| Dague courbe | Arme 1M | +1.5 % Dégâts généraux, +1.2 % Vitesse d’attaque |
| Hache de guerre | Arme 1M | +3 % Dégâts généraux |
| Masse de fer | Arme 1M | +2.5 % Dégâts généraux, +0.2 Armure |
| Baguette d’if | Arme 1M | +2 % Dégâts généraux, +0.15 Régénération mana /s |
| Griffe d’acier | Arme 1M | +2 % Dégâts généraux, +0.3 % Chance de critique |
| Espadon | Arme 2M | +6 % Dégâts généraux |
| Hache d’exécution | Arme 2M | +7 % Dégâts généraux |
| Bâton runique | Arme 2M | +4.5 % Dégâts généraux, +8 Mana |
| Arc long | Arme 2M | +4 % Dégâts généraux, +2 % Dégâts à distance |
| Arbalète lourde | Arme 2M | +5.5 % Dégâts généraux, +0.5 % Chance de critique |
| Faux rituelle | Arme 2M | +5 % Dégâts généraux, +0.25 Régénération mana /s |

## Affixes

Plages avant multiplicateurs de niveau, rareté et deux mains. Le premier affixe donne le suffixe du nom ; la fiche détaille tous les affixes.

| Affixe | Bonus possibles (tous accordés) |
|---|---|
| du hibou | Mana : 4–9, Régénération mana /s : 0.1–0.25 |
| du loup | Dégâts de mêlée : 1.5–3.5 %, Vitesse d’attaque : 0.5–1.5 % |
| de l’ours | Vie : 3–7, Armure : 0.1–0.25 |
| du faucon | Dégâts à distance : 1.5–3.5 %, Chance de critique : 0.3–0.8 % |
| du renard | Esquive : 0.5–1.2 %, Vitesse de déplacement : 0.5–1.5 % |
| du tigre | Chance de critique : 0.4–0.9 %, Dégâts critiques : 2.5–6 % |
| de la tortue | Armure : 0.3–0.6, Vie : 2–4 |
| de l’aigle | Vitesse d’attaque : 1–2.5 %, Dégâts à distance : 1–2 % |
| du serpent | Réduction de recharge : 0.8–2 %, Régénération mana /s : 0.1–0.2 |
| du cerf | Vitesse de déplacement : 1–2.5 %, Vie : 2–5 |
| du dragon | Dégâts généraux : 1.2–3 %, Mana : 3–6 |
| du phénix | Vie : 3–6, Régénération mana /s : 0.15–0.3 |

## Reliques légendaires et anciennes

Ces propriétés s’ajoutent aux quatre affixes et au bonus de base. Les légendaires/anciens générés naturellement utilisent ces familles.

| Relique | Famille | Propriété |
|---|---|---|
| Veilleur des cryptes | Heaume de fer | +1.2 Armure |
| Œil de la nuit | Amulette d’ambre | +0.8 Régénération mana /s |
| Rempart des exilés | Épaulières de fer | +12 Vie |
| Cœur du bastion | Cuirasse de fer | +16 Vie |
| Liens du sablier | Brassards rivetés | +4 % Réduction de recharge |
| Serres de l’aube | Gants de cuir | +6 % Vitesse d’attaque |
| Promesse du chasseur | Anneau d’argent | +2.5 % Chance de critique |
| Sceau du dernier roi | Sceau de cuivre | +5 % Dégâts généraux |
| Piliers de cendre | Grèves de fer | +1.3 Armure |
| Pas du spectre | Bottes de voyage | +6 % Vitesse de déplacement |
| Murmure d’acier | Épée courte | +15 % Dégâts critiques |
| Dent de minuit | Dague courbe | +7 % Vitesse d’attaque |
| Écho des étoiles | Baguette d’if | +1 Régénération mana /s |
| Jugement du crépuscule | Espadon | +10 % Dégâts généraux |
| Racine des anciens | Bâton runique | +25 Mana |
| Serment du vent | Arc long | +10 % Dégâts à distance |

## Fichiers et vérification

`js/survivors/equipment.js` : catalogue, génération, transactions et sauvegarde `survivors_equipment_v1`. `equipment-ui.js` : fiche, comparaisons, boutique et butin. `css/equipment.css` : mise en page responsive. `tools/build-equipment-sprites.py` : génère les 32 PNG transparents originaux et la planche de sprites dans `assets/survivors/equipment/`. Les saves malformées et objets en double sont filtrés au chargement.

Validation : `node tests/survivors.test.cjs` (63 suites, dont dix scénarios d’équipement et une régression sur le rendu initial). Le stress test sur les sept classes est resté stable : six simulations ont terminé les cinq actes ; le Paladin n’a pas éliminé l’Invocateur dans la limite de simulation. Ce scénario immobile et invulnérable ne mesure pas la difficulté réelle. L’équilibrage est une première version à affiner en partie.
