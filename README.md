# World Cup Predictor 2026

> « Une application qui permet à n'importe quel fan de football de bâtir son scénario complet pour la Coupe du Monde 2026, du premier coup d'envoi à la finale, et de le sauvegarder. »

Application web de pronostics pour la Coupe du Monde 2026 (48 équipes, 12 groupes, phase à élimination directe de 32 à 1). L'utilisateur saisit le score de chaque match, le classement des groupes se recalcule en direct, les 8 meilleurs troisièmes sont sélectionnés automatiquement, et le tableau final se remplit jusqu'à révéler le champion du monde.

## Installation et lancement

Prérequis : Node.js 20+ et npm.

```bash
npm install        # installe les dépendances
npm run dev        # lance le serveur de développement (http://localhost:5173)
npm run build      # build de production dans dist/
npm run preview    # sert le build de production
npm test           # lance les tests unitaires (Vitest)
```

## Stack technique et justification

| Choix                     | Justification                                                                                                                                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **React 19 + TypeScript** | Le typage protège le cœur métier (classement, départages, propagation) où une erreur de type coûte cher. Le sujet pénalise d'ailleurs les variables non typées si TypeScript est annoncé.                                                                                                                                                              |
| **Vite**                  | Build et HMR quasi instantanés, configuration minimale. Aucune surcouche serveur n'est nécessaire : l'application est entièrement côté client.                                                                                                                                                                                                         |
| **Zustand**               | Gestion d'état légère avec sélecteurs granulaires. Le store ne contient **que les saisies brutes** ; un changement de score ne re-render que les composants abonnés à cette portion de l'état. Réponse directe à l'anti-pattern « recalcul complet du bracket à chaque clic ». Le middleware `persist` assure la persistance sans code supplémentaire. |
| **Tailwind v4**           | Styles utilitaires + thème via variables CSS, mode clair/sombre verrouillé par page.                                                                                                                                                                                                                                                                   |
| **Motion**                | Une seule animation motivée : la propagation du vainqueur vers le tour suivant. Respecte `prefers-reduced-motion`.                                                                                                                                                                                                                                     |
| **Vitest**                | Même moteur que Vite, zéro config supplémentaire pour tester la logique métier pure.                                                                                                                                                                                                                                                                   |

### Architecture

```
src/
  data/teams-2026.json        données fournies
  types/                      types du domaine
  logic/                      logique métier PURE, sans React
    loadData · matches · standings · bestThirds · bracket · knockout · stats
    __tests__/                tests unitaires Vitest du cœur métier
  state/                      store Zustand (saisies brutes) + contexte tournoi (données statiques)
  hooks/                      sélecteurs dérivés mémoïsés (useStandings, useBracket, useTheme)
  components/                 UI (MatchCard réutilisable poule ET phase finale)
```

Principe central : **les saisies brutes sont la seule source de vérité persistée** ; tout le reste (classements, qualifiés, appariements, bracket) est **dérivé** par des fonctions pures mémoïsées. Le métier est isolé dans `logic/`, sans aucune dépendance à React, ce qui le rend testable unitairement et réutilisable.

## Fonctionnalités

### Must-have

- [x] Chargement et parsing du JSON fourni, avec validation structurelle (48 équipes, 12 groupes de 4) et écran d'erreur si les données sont invalides.
- [x] Affichage des 12 groupes de 4 équipes avec drapeaux (attribut `alt` sur chaque drapeau).
- [x] Saisie du **score** de chaque match de poule.
- [x] Calcul automatique du classement de chaque groupe (points, différence de buts, buts marqués, confrontation directe, classement FIFA).
- [x] Sélection automatique des 8 meilleurs troisièmes pour les 16èmes.
- [x] Génération du tableau à élimination directe (32 → 16 → 8 → 4 → 2 → 1).
- [x] Propagation ciblée du vainqueur au tour suivant à chaque choix.
- [x] Persistance des pronostics (la sélection survit au refresh).
- [x] Responsive mobile + desktop.
- [x] Code structuré, typé, sans code mort ni `console.log` (vérifié par ESLint).

### Bonus implémentés

- [x] **Animation** de propagation du vainqueur dans le bracket (Motion, ressort, reduced-motion safe).
- [x] **Mise en évidence du parcours complet d'une équipe** : un clic surligne tous ses matchs à travers groupes et bracket.
- [x] **Mode score** avec prolongations puis tirs au but pour départager les égalités en phase finale.
- [x] **Statistiques de fin** : meilleure attaque, meilleure défense, total et moyenne de buts, confédérations qualifiées, finalistes, champion.
- [x] **Tests unitaires** sur la logique métier (classement, confrontation directe, meilleurs 3èmes, propagation, prolongations/tirs au but, statistiques) — 27 cas.
- [x] **Mode sombre** (et clair), par défaut selon la préférence système, persisté.

### Bonus non retenus

Export PNG et comparaison à un bracket de référence FIFA ont été écartés volontairement, conformément au conseil du sujet (« privilégier la qualité d'implémentation à la quantité ») : leur rapport valeur/risque était moins favorable que les bonus ci-dessus.

## Règles métier

### Classement d'un groupe

Départages appliqués dans l'ordre exact du JSON (`groupTiebreakers`) :

1. Points (victoire = 3, nul = 1, défaite = 0)
2. Différence de buts globale
3. Buts marqués globalement
4. **Confrontation directe** : un mini-classement (points → diff → buts marqués) calculé sur les seuls matchs entre les équipes encore à égalité
5. Fair-play : ignoré (non simulé dans le cadre de l'examen)
6. Classement FIFA (départage final déterministe, jamais aléatoire)

### Sélection des 8 meilleurs troisièmes

Les 12 troisièmes sont classés entre eux (points → différence de buts → buts marqués → classement FIFA), à l'échelle inter-groupes. Les 8 premiers se qualifient. Le résultat est indépendant de l'ordre d'entrée des groupes.

### Schéma des 16èmes de finale (personnel, documenté)

Le sujet autorise le schéma officiel FIFA **ou** un schéma personnel documenté, valorisés à égalité. J'ai choisi un schéma personnel déterministe pour éviter la table officielle des 495 combinaisons d'attribution des meilleurs troisièmes, source d'erreurs difficiles à vérifier.

Construction de la liste de 32 têtes de série :

1. Les 12 **premiers** de groupe, triés par performance de poule (points → diff → buts → FIFA).
2. Les 12 **deuxièmes** de groupe, triés selon le même critère.
3. Les 8 **meilleurs troisièmes**, dans leur ordre de classement.

Appariement en « serpentin » : la tête de série `i` affronte la tête de série `33 − i`.

```
16ème 1  : seed 1  vs seed 32
16ème 2  : seed 2  vs seed 31
...
16ème 16 : seed 16 vs seed 17
```

Les tours suivants suivent un arbre d'élimination simple classique : les vainqueurs des matchs `2k` et `2k+1` se rencontrent au tour suivant. Pas de match pour la 3ème place.

### Égalités en phase finale

Si un match à élimination directe est nul au temps réglementaire, l'interface propose la saisie des **prolongations** ; si l'égalité persiste, elle propose les **tirs au but**. Le vainqueur n'est propagé que lorsqu'il est déterminé.

## Cas limites gérés

- Score invalide (négatif, non numérique, hors plage) : rejeté, l'état ne change pas.
- Scores partiels : le classement se calcule sur les seuls matchs renseignés ; le tableau final reste verrouillé tant que les 12 groupes ne sont pas complets.
- Égalité parfaite après tous les départages : ordre stable via le classement FIFA.
- Refresh en plein parcours : toutes les saisies sont restaurées.
- JSON corrompu : écran d'erreur explicite au lieu d'un crash.

## Choix et compromis assumés

- **Saisie au score plutôt qu'au simple vainqueur** : le sujet autorise les deux, mais le score est indispensable au classement des poules (diff de buts, buts marqués) et couvre d'un seul mécanisme le critère must-have et le bonus « mode score ».
- **Zustand plutôt que Context seul** : le sujet recommande de ne pas sur-dimensionner l'état. Zustand reste minimal (un store de saisies brutes) tout en offrant des sélecteurs ciblés qui évitent les re-renders globaux ; les données statiques du tournoi passent, elles, par un simple Context React.
- **Polices système** : aucune police externe chargée, pour des performances optimales et un fonctionnement hors-ligne.
- **Drapeaux via flagcdn.com** : `https://flagcdn.com/w160/{code}.png`, en gérant les codes spéciaux `gb-eng` (Angleterre) et `gb-sct` (Écosse).

## Difficultés rencontrées

### Flash de thème au rechargement (FOUC)

Le bug le plus pénible à diagnostiquer. Le thème (clair/sombre) est appliqué par React via un `useEffect` dans le hook `useTheme` : il pose l'attribut `data-theme` sur `<html>` **après** que React a monté. Conséquence au rechargement de la page : le navigateur peignait d'abord le thème par défaut des tokens CSS (`:root` = sombre), **puis** React s'exécutait et basculait sur le thème stocké. On voyait donc un **flash sombre → clair** systématique à chaque reload, même quand la préférence enregistrée était « clair ».

C'est un *Flash Of Unstyled Content* classique : le style correct n'est connu qu'après l'hydratation, trop tard pour le premier paint.

**Solution** : un petit script **bloquant et synchrone** placé dans le `<head>` de `index.html`, exécuté **avant** le premier rendu. Il lit la même clé `localStorage` (`theme`), retombe sur la préférence système puis sur « sombre », et pose `data-theme` immédiatement :

```html
<script>
  ;(() => {
    try {
      const stored = localStorage.getItem('theme')
      const theme =
        stored === 'dark' || stored === 'light'
          ? stored
          : window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'light'
            : 'dark'
      document.documentElement.setAttribute('data-theme', theme)
    } catch {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  })()
</script>
```

C'est l'un des rares cas où un script *render-blocking* est souhaitable : il pèse ~250 octets, s'exécute en moins d'une milliseconde, et le bon thème est appliqué dès le premier pixel. C'est aussi l'approche utilisée par `next-themes` et le thème officiel de Tailwind. Le hook React reste en place pour la bascule au clic et la persistance ; le script ne fait que pré-régler l'état avant le paint.

### Affichage du tableau à élimination directe en CSS

C'est la partie la plus délicate de l'interface. Un bracket de tournoi n'est pas une mise en page naturelle pour le web : chaque match d'un tour doit être centré **exactement au milieu vertical de ses deux matchs sources** du tour précédent, l'espacement vertical doit **doubler à chaque tour** (16 matchs en 16èmes, puis 8, 4, 2, 1), et il faut tracer des **connecteurs en « S »** qui relient chaque paire au match suivant. Le tout en restant aligné quelle que soit la profondeur, sur cinq colonnes, avec scroll horizontal sur mobile.

Plusieurs approches ont été essayées avant d'arriver à un résultat propre :

- **Flexbox `justify-around`** (espacement réparti automatiquement) : séduisant car « ça centre tout seul », mais la répartition se fait *autour* de chaque élément, ce qui introduit une petite erreur qui **s'accumule tour après tour**. Résultat : la finale finissait décalée tout en bas du tableau au lieu d'être centrée. Abandonné.
- **Hauteurs `min-height` qui grandissent** : dès qu'une carte affichait une prolongation (footer plus haut), sa colonne s'agrandissait mais pas les autres, et l'alignement entre colonnes se désynchronisait — la carte de prolongation **débordait sur sa voisine**.

**Solution retenue, déterministe** : chaque match occupe une **cellule de hauteur fixe** `ROW × 2^tour` et est centré dedans (`ROW = 150 px`, assez grand pour contenir une carte avec prolongation sans débordement). Comme la hauteur double à chaque tour, le centre d'un match du tour `n+1` tombe **mécaniquement** au milieu des centres de ses deux cellules parentes — aucun calcul de position, aucune accumulation d'erreur, peu importe la profondeur. Les connecteurs en S sont dessinés avec de simples bordures CSS (`border-right` + `border-top`/`border-bottom` arrondies) dont la hauteur vaut la demi-cellule, et qui pointent vers le haut ou le bas selon la parité du match dans sa paire.

Le bracket est codé à la main (≈140 lignes), sans librairie type `react-tournament-brackets`, pour rester maîtrisable et défendable.

### Saisies de prolongation/tirs au but résiduelles

Quand un score nul déclenchait la prolongation puis qu'on le changeait en score décisif, les blocs prolongation/tirs au but restaient affichés avec des valeurs périmées. La correction nettoie ces saisies dès qu'un tour devient décisif, et n'affiche les tirs au but qu'après une prolongation complète et toujours nulle.

### Zoom automatique sur mobile à la saisie d'un score

Sur iOS, Safari **zoome automatiquement** la page dès qu'on place le curseur dans un champ de saisie dont la police fait **moins de 16 px**. Les cases de score étant volontairement petites et compactes (`text-sm`, 14 px), chaque clic dans une case provoquait un zoom intempestif très désagréable sur téléphone.

Deux solutions existent. La première — ajouter `maximum-scale=1` au `<meta viewport>` — désactive aussi le zoom **volontaire** par pincement, ce qui casse l'accessibilité pour les malvoyants ; elle a été écartée. La solution retenue est celle recommandée par Apple et MDN : **fixer la police des champs de score à exactement 16 px** (`text-base`), le seuil précis en dessous duquel iOS déclenche le zoom. Le zoom auto disparaît, tout en laissant le pincement manuel intact. Comme tous les champs (poules, prolongations, tirs au but) partagent le même composant `ScoreInput`, le correctif s'applique partout d'un seul coup.

## Tests

```bash
npm test
```

27 tests couvrent le cœur métier : classement et chaque critère de départage, confrontation directe à deux et plus, sélection des 8 meilleurs troisièmes, appariement des 16èmes, propagation jusqu'à la finale, résolution prolongations/tirs au but, et statistiques.
