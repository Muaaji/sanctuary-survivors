# Révision Diablo II, rencontres et difficulté

Référence : https://d2runewizard.com/skills. Les noms et familles suivent Diablo II ; les timings, synergies et contrôles sont adaptés à ce jeu, et ne reproduisent pas toutes ses règles.

## Armes et combinaisons naturelles

| Arme | Passif associé | Ultime |
|---|---|---|
| Dagues de lancer | Ferveur | Dagues jumelles |
| Hache de lancer | Rune de puissance | Hache du retour |
| Arc long | Carquois | Arc de guerre |
| Épée | Brutalité | Lame royale |
| Lance | Allonge | Lance de phalange |
| Arbalète | Exécution | Arbalète à répétition |
| Faux | Allonge | Grande faucheuse |
| Masse | Plaque protectrice | Masse du siège |
| Fronde | Œil du chasseur | Fronde à ricochets |
| Fléau | Allonge | Fléau à chaînes |

## Compétences et synergies

35 compétences réparties entre les sept classes ; chaque famille garde son rôle : arc/javelot, éléments, os/poison/cadavres, combat sacré, rage et armes, vent/feu/animaux, griffes/pièges/ombre. Les liens donnent +4 % de dégâts par rang du sort associé, jusqu’à +20 % par lien. Ce sont des adaptations au format roguelike, pas une copie des coefficients de Diablo II.

- amazon : Tir multiple, Flèche guidée, Fureur de foudre, Javelot de peste, Valkyrie
- sorceress : Boule de feu, Orbe gelé, Éclairs en chaîne, Blizzard, Hydre
- necromancer : Ressusciter un squelette, Lance d’os, Nova de poison, Explosion morbide, Amplification des dégâts
- paladin : Zèle, Marteau béni, Feu sacré, Poing des cieux, Bouclier sacré
- barbarian : Double attaque, Double lancer, Tourbillon, Cri de guerre, Frénésie
- druid : Tornade, Ouragan, Fissure, Loups spirituels, Grizzly
- assassin : Griffes du dragon, Sentinelle de foudre, Éveil du feu, Venin, Maître de l’ombre

Les squelettes consomment un cadavre ; Explosion morbide utilise également les cadavres. Amplification des dégâts augmente le physique de 25 % (40 % pour son ultime), et seulement la moitié physique des explosions de cadavres. Le Bouclier sacré donne trois points d’armure pendant sa protection. Frénésie ajoute 20 % de vitesse d’attaque pendant son buff. Les hydres tirent avec trois têtes ; les sentinelles de foudre perforent ; Éveil du feu projette des vagues lentes et traversantes. Les pièges se placent au point visé, limité à 240 unités.

## Boss

- Boucher : couperet en cône, crochet qui attire la cible touchée et charge.
- Reine Insecte : flaques de poison avec dégâts persistants après exposition et couvées de scarabées (six au maximum).
- Invocateur : rituels ciblés, téléportations, traits arcaniques et squelettes (six au maximum).
- Démon Araignée : toiles qui ralentissent, puis bond à une position annoncée.
- Archidémon : souffle de feu, rayon de foudre rouge, anneau de projectiles.

Les boss utilisent un tempo ×1,2 : attaques toutes les 3,75 s, puis 2,75 s à moins de 50 % de vie. Les annonces durent de 0,67 à 0,92 s. Les animations et les projectiles sont accélérés de 20 % ; une charge parcourt la même distance plus rapidement. Les zones persistantes conservent leur durée active et disparaissent après la mort du propriétaire. L’anneau final passe de douze à seize projectiles en phase deux.

Chaque acte a sa propre horloge : 180 s de vagues, puis son unique boss. Les vagues ordinaires s’arrêtent pendant le duel, mais les invocations du boss restent possibles. Sa mort valide l’acte, change la carte et lance les 180 s du suivant. Le duel a un délai strict de 120 s ; le compte à rebours devient rouge sous 30 s et son expiration provoque la défaite, même avec de la vie restante. Les menus suspendent le temps. En acte isolé, la mort de ce boss termine la partie. La campagne exige cinq victoires successives, et dure donc 15 à 25 minutes de jeu.

## Difficulté et soins

Vie de base avant bonus : Paladin 78, Sorcière 51, Amazone 60, Nécromancien 51, Druide 66, Barbare 90, Assassin 54 (−40 % pour tous). Les chances existantes de cœur et potion sont multipliées par 0,18 pour les ennemis ordinaires/élites. Le cœur rend 10 % des PV max (minimum 4), la potion 20 %. Les boss ne lâchent plus de potion garantie. Le soin de montée de niveau passe de 5 % à 2 %.

## Visuels et vérification

35 feuilles de sprites animés à quatre images, leurs effets au sol de 96 px et quatre variantes de projectile. Sources déterministes dans `tools/build-spell-sprites.py`, utilisées par `spell-art.js`. Les aperçus sont dans `sorts-preview.html` et `bosses-preview.html`. Les anciennes ressources restent sauvegardées dans l’ancienne copie Freebuff.

63 suites testent les dégâts réels de chaque compétence, les synergies, tous les ultimes, l’isolation des classes, les contrôles, les cinq mécaniques de boss, les limites d’invocations et la suppression des zones après leur mort. Avec les horloges d’acte et la limite de deux minutes, cinq campagnes simulées terminent leurs cinq boss ; le Paladin et le Nécromancien dépassent le délai sur le dernier boss. Ces builds maximaux prédéfinis restent immobiles. Elles sont invulnérables : elles vérifient les règles et la stabilité, pas le ressenti humain. Le benchmark du Nécromancien dispose de trois cadavres de départ pour mesurer son armée plutôt que son seul coup de base. Les derniers résultats sont dans `verification-actes-boss.txt`. L’aperçu interactif `boss-timer-preview.html` vérifie le passage d’acte et la défaite avec une sauvegarde temporaire, séparée des données du joueur.

Le Carquois augmente la vitesse des flèches et carreaux de 10 % par rang et ajoute un projectile aux rangs 2 et 5. Il ne modifie ni les fléaux, ni les sorts de lanceur.

La vitesse d’attaque accélère les armes, coups physiques, invocations et poses de pièges. Les sorts de lanceur (Boule de feu, Tornade, etc.) utilisent leurs rangs/talents et la réduction de recharge ; investir en vitesse d’attaque n’accélère pas tous les sorts magiques.
