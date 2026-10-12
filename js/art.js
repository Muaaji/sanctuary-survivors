/**
 * art.js — sprites pixel-art haute résolution (procéduraux, zéro asset externe).
 * Principes : silhouette forte, ombrage 3 tons, contour sombre, matériel lisible.
 */
'use strict';

/* ---------- Palettes 4-5 tons ---------- */
const PAL = {
  // humain / peau / métal / cuir
  skin:   { h: '#5a3a22', f: '#c99668', l: '#e8c39a', s: '#7a5533' },
  pal:    { A: '#4a4a55', B: '#66667a', C: '#8a8a9c', M: '#b8b8c8', W: '#e8e4da',
            G: '#d7b04a', g: '#9a7a28', s: '#262430', L: '#3a3542', N: '#2e2a26', o: '#1a1712' },
  sorc:   { B: '#2e2a4e', C: '#4e4878', D: '#6e64a0', L: '#1c1930',
            w: '#e8e4ea', W: '#b8b0c8', s: '#161428', o: '#0e0c18', G: '#c8a8d8' },
  amz:    { R: '#8a3c2c', r: '#b85a38', L: '#5a2820', s: '#33221a',
            h: '#d2bd74', H: '#9c8746', G: '#c0a050', o: '#1a140e', S: '#585038', F: '#e8d8b8' },
  // monstres
  fall:   { k: '#5d8540', K: '#3e5c28', f: '#7ca957', L: '#2a3d1e', o: '#100c08',
            y: '#e8b850', Y: '#f8dc90', W: '#a5825a', w: '#c9a570', r: '#c03828',
            d: '#542a24', H: '#d9c169', h: '#8a671f', F: '#e8d8b8', o2: '#c96b2b' },
  sham:   { k: '#6d9c45', K: '#47632b', f: '#87b95a', L: '#2c4018', o: '#100c08',
            W: '#b89868', w: '#d8b880', y: '#e8b850', r: '#c03828', o2: '#e0903c',
            H: '#d9c169', g: '#6b4a1f', s: '#33240f' },
  skel:   { b: '#c9bfa4', B: '#9a8f74', W: '#f0ead8', x: '#1c1812', o: '#100c08',
            G: '#d7b04a', g: '#74551f', S: '#6a5132', s: '#2b2216', d: '#6a2a24', r: '#a34335',
            M: '#6e7d62', m: '#93a486', T: '#6a5a40', t: '#4a3e2c', F: '#f4efe2' },
  zomb:   { f: '#6a6a56', F: '#88887a', K: '#3e3e34', o: '#0e0e0a', W: '#b5b3a0',
            G: '#54683e', g: '#3a4830', d: '#48241e', u: '#3e4a38', U: '#5a6a50',
            b: '#5c3a2c', s: '#241c14' },
  goat:   { f: '#8a6e50', F: '#a8906e', K: '#5a462f', o: '#100c08',
            h: '#d2bd74', H: '#9c8746', W: '#cfcbc0', b: '#6e3c34', B: '#43221c',
            G: '#c0a050', S: '#584428', L: '#382a1e', M: '#684838', y: '#e8dd88' },
  and:    { f: '#a85858', F: '#c87a7a', K: '#6e2c2c', L: '#4a1818', o: '#140a0a',
            W: '#e0c0b8', w: '#f0ded6', H: '#d85040', h: '#f08060', G: '#8a2c20',
            A: '#4a342c', a: '#6e4e40', P: '#9a6ab8', p: '#c090d8', r: '#e86048',
            S: '#5c1e16', g: '#d7b04a', N: '#2c1c18' },
  dur:    { f: '#b09468', F: '#d0b488', K: '#84684a', L: '#5a4830', o: '#100c08',
            w: '#f4efe2', W: '#e0d8c8', H: '#c9a53e', h: '#8a6a24', A: '#8a7245',
            a: '#a88c58', S: '#6a5a3a', s: '#443826', y: '#e8dd88', M: '#88683c',
            N: '#2c2418' },
};

const OUT = '#0c0a08'; // contour universel

/* Bibliothèque globale des sprites */
const ART = { player: {}, projectiles: {}, icons: {}, decorations: {}, gems: {}, skills: {} };

/* ---------- Réduction : row-character runs, palettes nommées ---------- */
// Overload de makeSprite (helpers.js) : même API, shapes listées ici dedans buildArt()

function buildArt() {
  const A = ART;

  /* ============================================================
   * CLASSES 32×32 — 2 directions (E/S face caméra, N dos)
   * ============================================================ */
  function human3(dirs, pal) {
    // dims 32×32 ; contour OUT autour de chaque silhouette
    return {
      S: makeSprite(32, 32, pal, dirs.S),
      E: makeSprite(32, 32, pal, dirs.E),
      N: makeSprite(32, 32, pal, dirs.N),
    };
  }

  const PALADIN_PAL = {
    OUT, h: PAL.skin.h, f: PAL.skin.f, l: PAL.skin.l, s: PAL.skin.s,
    A: PAL.pal.A, B: PAL.pal.B, C: PAL.pal.C, M: PAL.pal.M, W: PAL.pal.W,
    G: PAL.pal.G, g: PAL.pal.g, s: PAL.pal.s, L: PAL.pal.L, N: PAL.pal.N, o: PAL.pal.o,
  };
  const SORC_PAL = {
    OUT, h: PAL.skin.h, f: PAL.skin.f, l: PAL.skin.l, s2: PAL.skin.s,
    B: PAL.sorc.B, C: PAL.sorc.C, D: PAL.sorc.D, L: PAL.sorc.L,
    w: PAL.sorc.w, W: PAL.sorc.W, s: PAL.sorc.s, o: PAL.sorc.o, Gc: PAL.sorc.G,
  };
  const AMZ_PAL = {
    OUT, h: PAL.skin.h, f: PAL.skin.f, l: PAL.skin.l, s2: PAL.skin.s,
    R: PAL.amz.R, r: PAL.amz.r, L: PAL.amz.L, s: PAL.amz.s,
    h2: PAL.amz.h, H: PAL.amz.H, G: PAL.amz.G, o: PAL.amz.o, S: PAL.amz.S, F: PAL.amz.F,
  };

  // ---- PALADIN ----
  const palE = [
    '................................',
    '............oooo................',
    '...........oAAAo...............'.slice(0,32),
    '..........oABBBAo...............',
    '..........oABBCABO.............'.slice(0,32),
    '..........oABBBBBo..............',
    '.........oABBBBBBo..............',
    '.........oAffffAo...............',
    '........oAflfflffAo.............'.slice(0,32),
    '........oAfoooooofAo............',
    '........oAfWfffWAo.............'.slice(0,32),
    '........oAfflflffAo............',
    '.........oAffffAo...............',
    '.....oo...oAffo.................',
    '....oWWwo.oAAo..................',
    '...oWGGGWwoAAo..................',
    '...oWGgGGwoAAo.................'.slice(0,32),
    '...oWGgGGwoABBo................',
    '...oWGGGWwoABCCo................',
    '....oWWWo.oABCCCo...............',
    '.....ooo..oABBBBo...............',
    '..........oABBBBBo..............',
    '.........oABBBBBBo..............',
    '.........oAoooooAo..............',
    '.........oAGGGGAo...............',
    '........oAGGgGGGAo..............',
    '........oAGGGGGGAo..............',
    '.......oAAoGGGGooAAo..........',
    '.......oo ssGGGGs oo............',
    '........ss..GGGG..s.............',
    '........ss..oGGGO..s...........'.slice(0,32),
    '........oo..oGGGGo..oo..........',
    '..............oo................',
  ];
  const palS = [
    '................................',
    '............oooo................',
    '...........oAAAo................',
    '..........oABBBAo...............',
    '..........oABBBBBo..............',
    '..........oABBBBBo..............',
    '.........oABBBBBBo..............',
    '.........oAffffAo...............',
    '........oAflfflffAo.............',
    '........oAfoooooofAo............',
    '........oAfWfffWAo..............',
    '........oAfflflffAo.............',
    '.........oAffffAo...............',
    '.....oo...oAffo.................',
    '....oWWwo.oAAo..................',
    '...oWGGGWwoAAo..................',
    '...oWGgGGwoAAo..................',
    '...oWGgGGwoABBo.................',
    '...oWGgGGwoABCCo................',
    '....oWWWo.oABCCCo...............',
    '.....ooo..oABBBBo...............',
    '..........oABBBBBo..............',
    '.........oABBBBBBo..............',
    '.........oAoooooAo..............',
    '.........oAGGGGAo...............',
    '........oAGGgGGGAo..............',
    '........oAGGGGGGAo..............',
    '........oAAGGGGAo...............',
    '.......oo.sGGGGs.oo.............',
    '........ss..oGOo..ss............',
    '........ss......ss..............',
    '........oo.....oo...............',
    '................................',
  ];
  const palN = [
    '................................',
    '............oooo................',
    '...........oAAAo................',
    '..........oAAAo................',
    '..........oABBBBo...............',
    '..........oABBBBo...............',
    '.........oABBBBBo...............',
    '.........oAhhhhAo...............',
    '........oAhhhhhhAo..............',
    '........oAhhhhhhAo..............',
    '........oAhhhhhhAo..............',
    '........oAhhhhhhAo..............',
    '.........oAhhhhAo...............',
    '.....oo...oAAo..................',
    '....oWWwo.oAAo..................',
    '...oWGGGWwoAAo..................',
    '...oWGgGGwoAAo..................',
    '...oWGgGGwoABBo.................',
    '...oWGGGWwoABCCo................',
    '....oWWWo.oABCCCo...............',
    '.....ooo..oABBBBo...............',
    '..........oABBBBBo..............',
    '.........oABBBBBBo..............',
    '.........oAoooooAo..............',
    '.........oAGGGGAo...............',
    '........oAGGgGGGAo..............',
    '........oAGGGGGGAo..............',
    '........oAAGGGGAo...............',
    '.......oo.sGGGGs.oo.............',
    '........ss..oGGGos..............',
    '........ss......ss..............',
    '........oo.....oo...............',
    '................................',
  ];
  A.player.paladin = human3({ S: palS, E: palE, N: palN }, PALADIN_PAL);

  // ---- SORCIÈRE ----
  const sorcE = [
    '................................',
    '..............WW................',
    '.............wWWw...............',
    '............wWWWWw..............',
    '...........wWWWWWWw.............',
    '...........wWffffWw.............',
    '..........wWfeffefWw............'.slice(0,32),
    '..........wWffffffWw............',
    '..........wWffffffWw............',
    '..........wwffffww..............',
    '.........sBBBBBBs...............',
    '........sBBCCBBBBs..............'.slice(0,32),
    '.......sBCCCCCCCCBs.............',
    '......sBCCCCCCCCCCBs............',
    '.....sBBCCCCCCCCBBBs............',
    '....oBBBBCCCCCCCBBBBo...........',
    '....oBBBBBCCCCCBBBBBo...........',
    '....oBBBBBBBCBCBBBBBo...........',
    '....oBBBBBBBBBBBBBBBo...........',
    '.....oBBBBBBBBBBBBBo............',
    '.....oBBBBBBBBBBBBBo............',
    '......oBBBsBBBsBBBo.............'.slice(0,32),
    '......oBBBoBBBoBBBo.............',
    '.......ooo.oBo.ooo..............',
    '...........oWo..............',
    '..........oWWo...............',
    '.........sWWWWs................',
    '........sWWWWWWs................',
    '.......sWWW..WWWs...............',
    '.......sWW....WWs...............'.slice(0,32),
    '.......so......os...............',
    '................................',
    '................................',
  ];
  const sorcS = [
    '................................',
    '..............WW................',
    '.............wWWw...............',
    '............wWWWWw..............',
    '...........wWWWWWWw.............',
    '...........wWffffWw.............',
    '..........wWfeffefWw............',
    '..........wWffffffWw............',
    '..........wWffffffWw............',
    '..........wwffffww..............',
    '.........sBBBBBBs...............',
    '........sBBCCBBBBs..............',
    '.......sBCCCCCCCCBs.............',
    '......sBCCCCCCCCCCBs............',
    '.....sBBCCCCCCCCBBBs............',
    '....oBBBBCCCCCCCBBBBo...........',
    '....oBBBBBCCCCCBBBBBo...........',
    '....oBBBBBBBCBCBBBBBo...........',
    '....oBBBBBBBBBBBBBBBo...........',
    '.....oBBBBBBBBBBBBBo............',
    '.....oBBBBBBBBBBBBBo............',
    '......oBBBsssssBBBo.............',
    '......oBBo..o..oBBo.............'.slice(0,32),
    '.......ooo..o..ooo..............',
    '...........oWo..................',
    '..........oWWo..................',
    '.........sWWWWs.................',
    '........sWWWWWWs................',
    '.......sWWW..WWWs...............',
    '.......sWW....WWs...............',
    '.......so......os...............',
    '................................',
    '................................',
  ];
  const sorcN = [
    '................................',
    '..............WW................',
    '.............wWWw...............',
    '............wWWWWw..............',
    '...........wWWWWWWw.............',
    '...........wWWWWWWw.............',
    '..........wWWWWWWWWw............',
    '..........wWWWWWWWWw............',
    '..........wWWWWWWWWw............',
    '..........wwWWWWww..............',
    '.........sBBBBBBs...............',
    '........sBBCCBBBBs..............',
    '.......sBCCCCCCCCBs.............',
    '......sBCCCCCCCCCCBs............'.slice(0,32),
    '.....sBBCCCCCCCCBBBs............',
    '....oBBBBCCCCCCCBBBBo...........',
    '....oBBBBBCCCCCBBBBBo...........',
    '....oBBBBBBBCBCBBBBBo...........',
    '....oBBBBBBBBBBBBBBBo...........',
    '.....oBBBBBBBBBBBBBo............',
    '.....oBBBBBBBBBBBBBo............',
    '......oBBBsBBBsBBBo.............',
    '......oBBBoBBBoBBBo.............'.slice(0,32),
    '.......ooo.oBo.ooo..............',
    '...........oWo..................',
    '..........oWWo..................',
    '.........sWWWWs.................',
    '........sWWWWWWs................',
    '.......sWWW..WWWs...............',
    '.......sWW....WWs...............',
    '.......so......os...............',
    '................................',
    '................................',
  ];
  A.player.sorceress = human3({ S: sorcS, E: sorcE, N: sorcN }, SORC_PAL);

  // ---- AMAZONE ----
  const amzE = [
    '................................',
    '............oooo................',
    '...........oSSSSo...............',
    '..........oSffffSo..............',
    '..........oSfeffSo..............',
    '..........oSffffSo..............',
    '...........oSSSSo...............',
    '..........oRRRRRo...............',
    '.........oRrRRRrRo..............',
    '.........oRfRRRfRo..............'.slice(0,32),
    '.........oRfRyRfRo..............',
    '.........oRRRRRRRo..............',
    '........oRRRRRRRRo..............',
    '.......oRRoRRRRoRRo.............',
    '.......oRo.oRRo.oRo.............',
    '.....ooo..oRo...ooo.............'.slice(0,32),
    '....oSSSo.oRoo.hhh...........',
    '...oSFFFSo.oRoo.hHh...........',
    '...oSFHFSoooRo.hHh...........'.slice(0,32),
    '...oSFFFSs.oRooo...............',
    '....oSSSo..oRo................',
    '.......o.oRRoo................'.slice(0,32),
    '......ooRRRRo..................'.slice(0,32),
    '......oRo..oRo.................'.slice(0,32),
    '.....oRo..oRoo.................',
    '.....oRo..oRo..................'.slice(0,32),
    '.....oo....oo..................',
    '.......ss..ss..................',
    '.......ss..ss..................',
    '.......so..os..................',
    '................................',
    '................................',
    '................................',
  ];
  const amzS = [
    '................................',
    '............oooo................',
    '...........oSSSSo...............',
    '..........oSffffSo..............',
    '..........oSfeffSo..............',
    '..........oSffffSo..............',
    '...........oSSSSo...............',
    '..........oRRRRRo...............',
    '.........oRrRRRrRo..............',
    '.........oRfRRRfRo..............',
    '.........oRfRyRfRo..............',
    '.........oRRRRRRRo..............',
    '........oRRRRRRRRo..............',
    '.......oRRoRRRRoRRo.............',
    '.......oRo.oRRo.oRo.............',
    '.....ooo..oRRo..ooo.............',
    '....oSSSo.oRooo.hh..............',
    '...oSFFFSo.oRoo.hHh.............',
    '...oSFHFSoo.oRo.hHh.............',
    '...oSFFFSs..oRo..................',
    '....oSSSo..oRRo.................',
    '.......o.oRRRRo.................',
    '......ooRRRRRRo.................',
    '......oRo..oRRo.................',
    '.....oRo...oRoo.................',
    '.....oRo...oRo..................',
    '.....oo....oo..................',
    '.......ss..ss..................',
    '.......ss..ss..................',
    '.......so..os..................',
    '................................',
    '................................',
    '................................',
  ];
  const amzN = [
    '................................',
    '............oooo................',
    '...........oSSSSo...............',
    '..........oSSSSSo...............'.slice(0,32),
    '..........oSSSSSo...............',
    '..........oSSSSSo...............',
    '...........oSSSSo...............',
    '..........oRRRRRo...............',
    '.........oRrRRRrRo..............',
    '.........oRRRRRRRo..............',
    '.........oRRRyRRRo..............',
    '.........oRRRRRRRo..............',
    '........oRRRRRRRRo..............',
    '.......oRRoRRRRoRRo.............',
    '.......oRo.oRRo.oRo.............',
    '.....ooo..oRRo..ooo.............',
    '....oSSSo.oRooo.hh..............'.slice(0,32),
    '...oSFFFSo.oRoo.hHh.............',
    '...oSFHFSo.oRoo.hHh.............',
    '...oSFFFSs.oRooo................',
    '....oSSSo..oRo..................',
    '.......o.oRRoo..................',
    '......ooRRRRo...................',
    '......oRo..oRo..................',
    '.....oRo..oRoo..................',
    '.....oRo..oRo...................',
    '.....oo....oo..................',
    '.......ss..ss..................',
    '.......ss..ss..................',
    '.......so..os..................',
    '................................',
    '................................',
    '................................',
  ];
  A.player.amazon = human3({ S: amzS, E: amzE, N: amzN }, AMZ_PAL);

  /* ============================================================
   * MONSTRES 24×24
   * ============================================================ */
  // Déchu (Fallen)
  A.fallen = makeSprite(24, 24, { OUT, k: PAL.fall.k, K: PAL.fall.K, f: PAL.fall.f, L: PAL.fall.L,
    o: PAL.fall.o, y: PAL.fall.y, Y: PAL.fall.Y, W: PAL.fall.W, w: PAL.fall.w, r: PAL.fall.r,
    H: PAL.fall.H, h: PAL.fall.h, F: PAL.fall.F }, [
    '........................',
    '........................',
    '........................',
    '.........ooo............'.slice(0,24),
    '........oHHHo...........'.slice(0,24),
    '.......oHhhhHo...........',
    '......oHhFkeho..........'.slice(0,24),
    '......oHfYkYfho.........',
    '......oHfkYkfho.........',
    '.......ohfffho...........'.slice(0,24),
    '........offfo............',
    '.....oooWWWWooo.........'.slice(0,24),
    '....oWWWwWWwWWWo........',
    '....oWwWWWWWwWWo........',
    '....oWWWWwWWWWWo........',
    '.....oWWWWWWWo..........'.slice(0,24),
    '.....oWKWWWKWo..........',
    '......oWWWWWo...........'.slice(0,24),
    '.......ofWWfo...........'.slice(0,24),
    '......ofW..Wfo..........'.slice(0,24),
    '.....ofW....Wfo.........'.slice(0,24),
    '.....oW......Wo.........'.slice(0,24),
    '.....os......so.........'.slice(0,24),
    '........................',
  ]);

  // Chaman déchu
  A.fallenShaman = makeSprite(24, 24, { OUT, k: PAL.sham.k, K: PAL.sham.K, f: PAL.sham.f, L: PAL.sham.L,
    o: PAL.sham.o, W: PAL.sham.W, w: PAL.sham.w, y: PAL.sham.y, r: PAL.sham.r,
    H: PAL.sham.H, h: PAL.sham.h, s: PAL.sham.s, o2: PAL.sham.o2 }, [
    '........................',
    '........................',
    '.........ooo............'.slice(0,24),
    '........oHhHo.............',
    '.......oHhhhHo.............',
    '......oHhfkYkho............',
    '......oHfYkYfho............',
    '......oHhkkkhho............'.slice(0,24),
    '.......ohfffho..............',
    '........offfo..............',
    '.....ooowwWWwoo.............',
    '....oWWwWWWWWwWWo...........',
    '....oWWWWwWWWWWWo...........',
    '....oWwWWWWWWWwwWo..........',
    '.....oWWWWWWWWWo.............'.slice(0,24),
    '.....oWKWWWKWWo..............',
    '......oWWWWWWo...............',
    '.......orRRro................'.slice(0,24),
    '......orRrrrRo...............',
    '.....oRO..orRO...............'.slice(0,24),
    '.......o....o................',
    '........................'.slice(0,24),
    '........................',
    '........................',
  ]);

  // Squelette
  A.skeleton = makeSprite(24, 24, { OUT, b: PAL.skel.b, B: PAL.skel.B, W: PAL.skel.W, x: PAL.skel.x,
    o: OUT, G: PAL.skel.G, g: PAL.skel.g, S: PAL.skel.S, s: PAL.skel.s, d: PAL.skel.d,
    r: PAL.skel.r, M: PAL.skel.M, m: PAL.skel.m, T: PAL.skel.T, t: PAL.skel.t, F: PAL.skel.F }, [
    '........................',
    '........................',
    '.........oooo............',
    '........oWWWWo..........'.slice(0,24),
    '.......oWWWWWWo..........',
    '.......oWFFffWo..........',
    '.......oWxxxxWo..........',
    '........oWWWWo...........'.slice(0,24),
    '......ooobbbBooo..........',
    '.....oBBbbbBBoo...........',
    '........oB-B-B-Bo...........'.slice(0,24),
    '........oB-b-b-Bo...........'.slice(0,24),
    '........oBBBBBBo...........'.slice(0,24),
    '.........oBBBBo.............',
    '....oSSo.oTTTo.oSSo.........',
    '....oSSSo.oTo.oSSSo.........',
    '.....oSSSooTooSSSo..........'.slice(0,24),
    '......oSSSoToSSSo...........',
    '.......oSSoToSSSo...........'.slice(0,24),
    '........oooTooSSo...........'.slice(0,24),
    '..........oToSoSo...........'.slice(0,24),
    '..........oTsSoSo...........'.slice(0,24),
    '...........oSoSo............'.slice(0,24),
    '........................',
  ]);

  // Zombie
  A.zombie = makeSprite(24, 24, { OUT, f: PAL.zomb.f, F: PAL.zomb.F, K: PAL.zomb.K, o: OUT,
    W: PAL.zomb.W, G: PAL.zomb.G, g: PAL.zomb.g, d: PAL.zomb.d, u: PAL.zomb.u,
    U: PAL.zomb.U, b: PAL.zomb.b, s: PAL.zomb.s }, [
    '........................',
    '........................',
    '.......oooooooo.........'.slice(0,24),
    '......oFFFFFFFo.........',
    '.....oFFffffFo..........',
    '.....oFfffffFo..........'.slice(0,24),
    '.....oFxxxxffFo.........',
    '.....oFFFFfffFo.........',
    '......oFddddFo..........'.slice(0,24),
    '.......offffo...........'.slice(0,24),
    '....ooGGGGGGGoo.........',
    '...oGGGgGGGgGGGo........',
    '...oGgGWWWWGgGGo........',
    '...oGGGWXXWGgGGo........',
    '...oGGGWXXWGgGGo........',
    '...oGGGWXXXWGgGo........',
    '....oGGGGGGGGGo.........'.slice(0,24),
    '.....oGGGGGGGo...........',
    '......oSuGuGo...........'.slice(0,24),
    '.....oUuGuGuUo......BB..',
    '....oUu..uU..uUo....BB..',
    '....oU....U...Uo....bB..'.slice(0,24),
    '....os....s...so........'.slice(0,24),
    '........................',
  ]);

  // Démon bouc
  A.goatD = makeSprite(24, 24, { OUT, f: PAL.goat.f, F: PAL.goat.F, K: PAL.goat.K, o: OUT,
    h: PAL.goat.h, H: PAL.goat.H, W: PAL.goat.W, b: PAL.goat.b, B: PAL.goat.B,
    G: PAL.goat.G, S: PAL.goat.S, L: PAL.goat.L, M: PAL.goat.M, y: PAL.goat.y }, [
    '........................',
    '....HH.............HH...'.slice(0,24),
    '...HhhH...........HhhH..',
    '...Hhhhh.........hhhH...'.slice(0,24),
    '....hhhhh......hhhh.....',
    '.....oFFFFFFFFFFo.......',
    '....oFffffffFfFo.......'.slice(0,24),
    '....oFffxyxffFo........',
    '....oFffxyxffFo........',
    '.....oFfffffFo.........',
    '......oFFFyFFFo........',
    '....ooGGGGGGGGoo.......'.slice(0,24),
    '...oGGgGGWWGgGGGo......',
    '...oGgGGWXXWGgGo.......',
    '...oGGGWWXXWWGGo.......',
    '...oGGGWXXXWWGGo.......',
    '....oGGGGGGGGGo.......'.slice(0,24),
    '.....oGGGGGGGo.........',
    '......oFKKFKo...........',
    '.....oKK..KKo...........'.slice(0,24),
    '......oo..oo............',
    '.....oSS....SSo.........'.slice(0,24),
    '......o......o..........',
    '........................',
  ]);

  /* ============================================================
   * BOSS 48×48
   * ============================================================ */
  const buildAndariel48 = () => {
    const rows = [];
    // moitié haute : tête + cornes, ailes panachées
    rows.push(
      '..............................', // vide spacers
      '..............................',
      '..............oGGGGo..........',
      '.............oGhhhhGo.........',
      '......oo....oGhHHHHGo.........',
      '.....oPPPo.oGhFFFFFFGo........',
      '....oPpppPo.oGhFyyFGho........'.slice(0,48),
      '....oPfffFPooGFFFFFFGo........',
      '....oPfffFPoGFFFFFFFGho.......',
      '....oPfffFPGhFeFeFeFGho.......',
      '....oPfffFPoGFFFFFFGo........',
      '.....oPffPOoGFFFFFFGo........',
      '.....oPpPPo.oGFFFFGo..........',
      '......oooo..oGFFFGGo..........',
      '..........oGGFFFFGo...........',
      '.........oGGFFFFFGGo..........'.slice(0,48),
      '.....oo.oGGAAKKAAAGGo.o......',
      '....oPPPoGAAKKKKKAAGoPPPo....'.slice(0,48),
      '....oPpAAGAKSSSSSKAAGAAPpo....',
      '...oPpAAAAKSSSSSSSKAAAAEp.....'.slice(0,48),
      '...oPpHSSAKSSSSSSSKASSHpPo....',
      '..oPpHSSSAKSSSSSSSKACCESSPO.   '.slice(0,48),
      '..oPpHSSSAKSSSSSSSKASSSSHpO..'.slice(0,48),
      '..oPpHSSSKKSSSSSSSKKSSSSHpPo..'.slice(0,48),
      '..oPpHSSSSKSSSSSSSKSSSSSHPPo..'.slice(0,48),
      '..oPpHSSSSKSSSSSSSKSSSSSHPPo..'.slice(0,48),
      '..oPpHSSSKKSSSSSSSKKSSSSHPpo..'.slice(0,48),
      '...oPHSSSKSSSSSSSSKSSSSHPpo..'.slice(0,48),
      '....oPpAAAKSSSSSSSKAAAAppo....',
      '....oPPPoAAAKKKKKAAAApPPPo....',
      '.....o..oAAAAAAAAAuo..o.......'.slice(0,48),
      '.........oAAAAAAAAAo..........',
      '..........oAAAAAAo............',
      '......ooo.oAsssSso.ooo........'.slice(0,48),
      '.....oSSSsAAsrYrsAAsSSSo......',
      '....oSsSSssAsrYrsAsSSsSSo.....',
      '....oSsSSSsAAryrYAASeSSSo.....'.slice(0,48),
      '.....oSsSSSsAsrsrAsSSsSo......'.slice(0,48),
      '......oSsSSSsAsrsAsSSSo.......',
      '.......oSSSSs.AA.sSSSo........'.slice(0,48),
      '........ooo....AA....ooo.......'.slice(0,48),
      '..............oo..............',
      '..............oPp.oo..........'.slice(0,48),
      '............oPppp.o....o.o.....',
      '...........oPpPPPo....o.p.o....',
      '..........oPpPPPPPo...o.o.o....'.slice(0,48),
      '...........oooPoooooo.oooo.....',
      '..............ooo...ooo........',
      '..............................',
    );
    return makeSprite(48, 48, { OUT, f: PAL.and.f, F: PAL.and.F, K: PAL.and.K, L: PAL.and.L,
      o: OUT, W: PAL.and.W, w: PAL.and.w, H: PAL.and.H, h: PAL.and.h, G: PAL.and.G,
      A: PAL.and.A, a: PAL.and.a, P: PAL.and.P, p: PAL.and.p, r: PAL.and.r,
      S: PAL.and.S, g: PAL.and.g, N: PAL.and.N, y: '#e8d878' }, rows);
  };
  A.andariel = buildAndariel48();

  // Duriel — ver/démon rocailleux massif 48×48
  const buildDuriel48 = () => {
    const rows = [];
    rows.push(
      '................................',
      '......oooooooooooooooo..........'.slice(0,48),
      '.....oNNfFfFfFfFfFfFo..........',
      '....oNNffffffffffffffffo.......',
      '...oNFFffFfffffffffFffo........',
      '...oFFFFFFFffffffFFFFFFo.......',
      '..oNffffffffffffffffffffo......'.slice(0,48),
      '..oNFFffffffffffffffFFfo.......'.slice(0,48),
      '..oNFFFFHffffffHFHFFFFFo.......',
      '..oNHFFFFFFFFFFFHFHFFFFo.......',
      '..oNFFyyFFFFFFFFFFyyFFo........',
      '..oNFFyyFFFFFFFFFFyyFFo........',
      '..oNFfffffFFFfffffFffo.........',
      '..oNffffffffffffffffo..........',
      '..oNFFffffffffffFFFFo..........'.slice(0,48),
      '...oNffffffffffffFFo...........',
      '...oNNFFFFffffffo...............',
      '....ooNFFFFffo..................',
      '......oNFFFo.....................',
      '....oooooooooo.................',
      '...oAAAFFFFFFFFFAAo.............',
      '..oAaAAFFFFFFFFFaAAo............',
      '.oAaaAAfffffFFFAAaaAo...........',
      '.oAaaAAFFFffFFFAAaaAo...........'.slice(0,48),
      '.oAAaAAaaaaaaaAAaAAo............',
      '.oAAAAAAAAAAAAAAAAAo............',
      '..oSSAAAAAAAAAAAAASo............',
      '..oSSAAAAFFFAAAAAASo............',
      '..oSSAAAFFFAAAAAAASo............',
      '..oSSAAAFFFAAAAAASSo............',
      '...oSSAAAAAAAAASSo..............',
      '....oSSAAAAAAASSo...............',
      '.....oSSAAAAASSo................',
      '.....ooSSAAASSoo................',
      '.......oSSASSo..................',
      '......oSWASWWo..................',
      '.....oWWASWAWWo.................',
      '....oWWWSAWAAWWo................',
      '....oWWSoSWoSWWo................',
      '.....oWSoSWSoSWo................',
      '......ooSoSSoSSo................',
      '.......oSoSo..oSo...............',
      '......oWWo......oWWo............',
      '.....oWWWo......oWWWo...........',
      '....oWWWWo......oWWWWo..........'.slice(0,48),
      '...oWWWWo........oWWWWo.........',
      '...ooo..............ooo.........',
      '................................',
      '................................',
    );
    return makeSprite(48, 48, { OUT, f: PAL.dur.f, F: PAL.dur.F, K: PAL.dur.K, L: PAL.dur.L,
      o: OUT, w: PAL.dur.w, W: PAL.dur.W, H: PAL.dur.H, h: PAL.dur.h, A: PAL.dur.A,
      a: PAL.dur.a, S: PAL.dur.S, s: PAL.dur.s, y: PAL.dur.y, M: PAL.dur.M, N: PAL.dur.N }, rows);
  };
  A.duriel = buildDuriel48();

  /* ============================================================
   * PROJECTILES & PICKUPS (inchangés majeurs, juste retouches)
   * ============================================================ */
  A.projectiles = {
    swordS: makeSprite(16, 16, { W: '#f0efe4', L: '#9a9a9a', G: '#c0a050', h: '#8a6a34' }, [
      '.......WW.......',
      '.......WL.......',
      '......WWLL......',
      '......WWLL......',
      '......WWLL......',
      '......WWLL......',
      '......WWLL......',
      '......WWLL......',
      '.....GWWLLG.....',
      '.....GGGGGG.....',
      '.......hh.......',
      '.......hh.......',
      '......GhhG......',
      '.....GhhhhG.....',
      '.....GGGGGG.....',
      '................',
    ]),
    arrow: makeSprite(12, 3, { W: '#e8e0cc', h: '#8a6a34' }, [
      'W........hh.',
      'WWWWWWWWWWWW',
      'W........hh.',
    ]),
    flame: makeSprite(10, 10, { m: '#c7501e', M: '#f09038', H: '#fcc060', w: '#f8e8b0' }, [
      '....m.....',
      '...mm.....',
    '...mMMm...',
      '..mMHHMm..',
      '..mMHwHMm.',
      '..mMHwHHMm',
      '...mMHHMm.',
      '...mMMm...',
      '....mm....',
      '..........',
    ].map(r => r.padEnd(10, '.'))),
    icebolt: makeSprite(8, 8, { s: '#4a7fa8', S: '#8ad0e8', W: '#e8f6f8' }, [
      '..SS....',
      '.sSSs...',
      '.SSWSs..',
      'SSWSSS..'.slice(0,8),
      '.SSWSs..',
      '..SSs...',
      '...sS...',
      '.....s..',
    ]),
    bolt: makeSprite(6, 6, { s: '#4a7fa8', S: '#8ad0e8' }, [
      '...SS.',
      '..sSS.',
      '...SS.',
      '...Ss.',
      '..S...',
      's.....',
    ]),
    boneSpear: makeSprite(10, 3, { W: '#e8e0cc', x: '#2c2418' }, [
      'W.......x.',
      'WWWWWWWWW.',
      'W.......x.',
    ]),
    axe: makeSprite(9, 9, { H: '#c0a050', W: '#e8e0cc', T: '#6a5530' }, [
      '...H.....',
      '..hWW....'.slice(0,9),
      '.HWWWTT..',
      '.HWWWTT..',
      '.HWWWTT..',
      '..HWT....',
      '...TT....',
      '....T....',
      '.........',
    ]),
    javelin: makeSprite(12, 3, { W: '#e8e0cc', h: '#8a6a34', K: '#c0a050' }, [
      'x.......hh..',
      'WKKKKKKKhh..',
      'x.......hh..',
    ]),
    hammer: makeSprite(10, 10, { L: '#8a8a94', W: '#d8d8d8', T: '#6a5530' }, [
      '..LLLL....',
      '.LWWWWL...',
      'LWWWWWWL..',
      'LWWWWWWL..',
      '.LWWWWL...',
      '..LLLL....',
      '...TT.....',
      '...TT.....',
      '...TT.....',
      '....T.....',
    ]),
  };

  // pickups — petits
  A.gems = {
    small: makeSprite(5, 5, { s: '#4a7fa8', S: '#9ad0e8' }, ['.sSs.', 'ssSss', 'ssSss', '.sss.', '.ss..']),
    mid:   makeSprite(6, 6, { v: '#31398e', V: '#8a9ce5', W: '#dfe4fa' }, ['.vvv.', 'vVWVv', 'vVVVv', 'vVVVv', '.vvv.', '.vv..']),
    big:   makeSprite(7, 7, { E: '#2f7c48', e: '#6aa874', W: '#c8e8c8' }, ['..EEE..', '.EeWEE.', 'EeWEEEE', 'EEEEEEE', 'EEEEEEE', '.EEEEE.', '..EEE..']),
    giant: makeSprite(9, 9, { r: '#a02a24', R: '#e05a48', W: '#f8c0b0' }, ['...rrr...', '..rRrrr..', '.rRWrrrr.', 'rRWWrrrrr', 'rRWrrrrrr', 'rrrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..']),
  };
  A.coin = makeSprite(6, 6, { k: '#c8a038', K: '#f4d476' }, ['.kkk.', 'kKKKk', 'kKKKk', 'kKKKk', 'kKKKk', '.kkk.']);
  A.goldPile = makeSprite(10, 7, { k: '#c8a038', K: '#f4d476', x: '#5a4416' }, [
    '..kkkkk...', 'kkkkkkkk..', 'kKKKKKKKk.', 'kKKKKKKKkk', 'kKKKKKKKkk', '.kkkkkkkk.', '..xxxxx...',
  ]);
  A.heart = makeSprite(8, 7, { r: '#8a1e18', R: '#e05a48', l: '#f89888' }, [
    '.rr..rr.', 'rRlRrRRr', 'rRRRRRRr', '.rRRRRr.', '..rRRr..', '...rr...', '........',
  ]);
  A.magnet = makeSprite(8, 8, { r: '#c03828', W: '#e8e4da' }, [
    '.rrrrr..', 'rr...rr.', 'rr...rr.', 'rr...rr.', 'WW...WW.', 'WW...WW.', '.WWWWW..', '........',
  ]);
  A.flaskHP = makeSprite(9, 10, { X: '#c8a038', g: '#7a6a28', w: '#e05a48', W: '#f8a090', i: '#c8d0d8' }, [
    '...XXX...', '....X....', '...XXX...', '..g...g..', '..g...g..', '.g.iiii.g', '.gwwwwwwg', '.gWwwwwwg', '..gwwwwg.', '...gggg..',
  ]);
  A.flaskMP = makeSprite(9, 10, { X: '#c8a038', g: '#7a6a28', w: '#4a6ec8', W: '#90aef0', i: '#c8d0d8' }, [
    '...XXX...', '....X....', '...XXX...', '..g...g..', '..g...g..', '.g.iiii.g', '.gwwwwwwg', '.gWwwwwwg', '..gwwwwg.', '...gggg..',
  ]);
  A.essence = makeSprite(9, 11, { p: '#8a5ac0', P: '#c090e8', w: '#f0e0fa', x: '#4a2a70', q: '#5c3090' }, [
    '...ppp...', '..pPPPp..', '.pPwPPPp.', 'pPwPPPPqP', 'pPPPPPPqP', 'pPPPPPPPq', 'pPPPPPPqP', 'pPPPqPqPP', '.pPPqPPp.', '..pPPPp..', '...ppp...',
  ]);
  A.chest = makeSprite(14, 10, { h: '#6a4a28', T: '#c8a038', c: '#8a6a34', K: '#e8d060', x: '#2c2014' }, [
    '..hhhhhhhhhh..', '.hTTTTTTTTTTh.', '.hcccccccccch.', '.hhhhhhhhhhhh.', '.hcccccccccch.', '.hccccKcccch..', '.hccccccccch..', '.hhhhhhhhhhh..', '...x......x...', '..............',
  ]);
  A.shopTent = makeSprite(20, 14, { r: '#8a2c20', R: '#b84a34', W: '#e8d0b0', h: '#6a4a28', c: '#8a6a34', K: '#e8d060', x: '#2c2014' }, [
    '.......rrrr........', '.....rrRRRRrr......', '....rRWRRRRRRr.....', '...rRWRRRRRRRRr....', '..rRRRRRRRRRRRRr...', '.rRRRRRRRRRRRRRRr..', 'rrrhhhhhhhhhhrrrr..', '.rhhhhhhhhhhhhhrr..', '.rhcccccKKcccccgr..', '.rhcccccccccccgr...', '.rhcccccccccccgr...', '.rhhhhhhhhhhhhr....', '.x.hhhhhhhhhh.x....', '...................',
  ]);

  /* Décor */
  A.decorations = {
    tree: makeSprite(12, 16, { H: '#6a5a34', h: '#8a7a44', c: '#4a3828', T: '#6a5530' }, [
      '...hhhh.....', '..hHHHHh....', '.hHHHHHHh...', 'hHHHHHHHHh..', 'hHHHHHHHHh..', '.hHHHHHHh...', '..hHHHHh....', '...hccch....', '....ccc.....', '....cTc.....', '....ccc.....', '....cTc.....', '....ccc.....', '....cTc.....', '....cTc.....', '............',
    ]),
    rock: makeSprite(10, 7, { B: '#5a5150', x: '#3a3434' }, [
      '...BBBB...', '..BxxxxB..', '.BxxxxxxB.', 'BxxxxxxBxB', 'BxxBxxxxxB', '.BxxxxxxB.', '..BBBBBB..',
    ]),
    bones: makeSprite(10, 6, { b: '#c9bfa4', w: '#9a8f74' }, [
      '.b....bb..', 'w.bb.bb...', '..bbbb....', '.b....b...', 'wb....bb..', '..........',
    ]),
    pillar: makeSprite(8, 18, { H: '#8a8278', T: '#c8c0b4', t: '#6a6258' }, [
      '.HHHHHH.', 'HTTTTTTH', '.HtttH..', '..HTtH..', '..HTtH..', '..HTtH..', '..HTtH..', '..HTtH..', '..HTtH..', '..HTtH..', '..HTtH..', '..HTtH..', '..HTtH..', '..HTtH..', '..HTtH..', '.HTtTtTH', 'HHHHHHHH', '.TTTTTT.',
    ]),
  };

  /* Icônes UI + sorts */
  A.icons = {
    swordS: A.projectiles.swordS,
    flame: A.projectiles.flame,
    icebolt: A.projectiles.icebolt,
    bolt: A.projectiles.bolt,
    axe: A.projectiles.axe,
    hammer: A.projectiles.hammer,
    javelin: A.projectiles.javelin,
    arrow: A.projectiles.arrow,
    skull: makeSprite(12, 12, { W: '#f0ead8', x: '#241f16' }, [
      '...WWWWWW...', '..WWWWWWWW..', '.WWWWWWWWWW.', '.WxxWWWWxxW.', '.WxxWWWWxxW.', '.WWWWWWWWWW.', '..WWxWWxWW..', '...WWWWWW...', '...W.W.W....', '...W.W.W....', '...W.W.W....', '............',
    ]),
    flask: A.flaskHP,
    shield: makeSprite(12, 12, { A: '#4a4a55', B: '#6a6a7a', W: '#e8e4da', G: '#c8a038' }, [
      '.AAAAAAAAAA.', 'ABBWWBBBBBBA', 'ABBBBBBBBBBA', 'ABGGGGGGGGBA', 'ABGGGGGGGGBA', '.ABGGGGGBBA.', '.ABGGGGGBBA.', '..ABBBBBA...', '...ABBBA....', '....ABA.....', '.....A......', '............',
    ]),
    star: makeSprite(11, 11, { W: '#f4d476' }, [
      '.....W.....', '....WWW....', '....WWW....', '.W..WWW..W.', '.WW.WWW.WW.', '..WWWWWWW..', '...WWWWW...', '...WWWWW...', '..WW...WW..', '.W.......W.', '...........',
    ]),
    magnet: A.magnet,
    trophy: makeSprite(12, 12, { k: '#c8a038', K: '#f4d476' }, [
      '.kkkkkkkkkk.', '.kKKKKKKKKk.', 'kkK.K..K.kkk', 'kkKKKKKKKKkk', '.kkKKKKKKkk.', '..kkKKKKkk..', '...kkKKkk...', '....kkkk....', '.....kk.....', '.....kk.....', '...kkkkkk...', '...kkkkkk...',
    ]),
    ring: makeSprite(12, 12, { k: '#c8a038' }, [
      '...kkkkkk...', '..k......k..', '.k........k.', 'k..........k', 'k..........k', 'k..........k', 'k..........k', 'k..........k', '.k........k.', '..k......k..', '...kkkkkk...', '............',
    ]),
    all: makeSprite(12, 12, { k: '#c8a038', s: '#4a7fa8', r: '#c03828' }, [
      'kk........kk', 'kkk......kkk', '.kk......kk.', '..ss....ss..', '...ss..ss...', '....ssss....', '....ssss....', '...ss..ss...', '..ss....ss..', '.rr......rr.', 'rrk......krr', 'kk........kk'.slice(0,12),
    ]),
    projectile: A.projectiles.boneSpear,
    essence: A.essence,
    gems: A.gems.mid,
    coin: A.coin,
    shop: makeSprite(12, 10, { a: '#b84a34', A: '#8a2c20', W: '#e8d0b0', h: '#6a4a28', c: '#8a6a34', K: '#e8d060', x: '#2c2014' }, [
      '...aaaaaa...', '..aaAAAAaa..', '.aaWAAAAAAa.', 'aaaaaaaaaaaa', 'hhhhhhhhhhhh', 'hccccKcccccch', 'hccccccccccch', 'hhhhhhhhhhhh', 'x..........x', '............',
    ].map(r => r.padEnd(12, '.'))),
  };

  A.skills = {
    fire: makeSprite(14, 14, { m: '#c7501e', M: '#f09038', H: '#fcc060', w: '#f8e8b0' }, [
      '......m.......', '.....mm.......', '....mMMm......', '...mMMMMm.....', '...MMHMMMMm...', '..MMHHMMMMMm..', '..MHHWMMMMM...', '..MHHWMMMMM...', '...MMHHMMMM...', '...mMMMMMMm...', '....MMMm......', '.....m........', '..............', '..............',
    ]),
    ice: makeSprite(14, 14, { s: '#4a7fa8', S: '#8ad0e8', W: '#e8f6f8' }, [
      '......s.......', '.....sSs......', '....SSSSS.....', '...sSSSSSs....', '..SSsWsSSSS...', '.SSSSWWSsSSSS.', '.sSSSWWSSsSSs.', '..SSSSWSSSSs..', '...sSSSSSs....', '....SSSSS.....', '.....sSs......', '......s.......', '..............', '..............',
    ]),
    nova: makeSprite(14, 14, { V: '#8a9ce5', a: '#d7b04a', A: '#a8864a' }, [
      '....VVVVVV....', '..VV......VV..', '.V..........V.', '.V....aa.....V'.slice(0,14), 'V....aaaa....V', 'V...aaAAaa...V', 'V...aaAAaa...V', 'V....aaaa....V', 'V....aaaa....V', 'V....aaaa....V', 'V....aaaa....V', '.V..a..a...V'.slice(0,14), '.V..........V.', '..VV......VV..',
    ].map(r => r.padEnd(14, '.'))),
    aura: makeSprite(14, 14, { k: '#d7b04a', H: '#f4d476', W: '#fff8e0', G: '#a8864a' }, [
      '....kkkkk.....', '..kk.....kk...', '..k..HHH..k...', '.k..HWWW..k...', '.k..HWKG..k...'.slice(0,14), '.k.HWKGKG..k..'.slice(0,14), '.k.HWKGKGWk...'.slice(0,14), '.k..HWKGWKk...'.slice(0,14), '.k..HWWWKk...'.slice(0,14), '.k...HHHk.....'.slice(0,14), '..k......k....'.slice(0,14), '...kk...kk.....', '....kkkkk......', '..............',
    ].map(r => r.padEnd(14, '.'))),
    hammer: A.projectiles.hammer,
    arrow: A.projectiles.arrow,
    freeze: A.skills && null, // placeholder remplacé plus bas
    bolt: A.projectiles.bolt,
    strike: makeSprite(14, 14, { s: '#4a7fa8', S: '#8ad0e8' }, [
      '......s.......', '.....SS......', '.....SS......', '....SS..s....', '...SS..SS....', '..SS..SS.....', '.SS..SS......', '.SSSS........', '..SS.........', '...S.........', '.............s', '..............', '..............', '..............',
    ].map(r => r.padEnd(14, '.'))),
  };
  A.skills.freeze = A.skills.ice;

  /* Sol (inchangé) */
  A.floorCanvas = generateFloor();
}

/* generateFloor identique à la version précédente */
function generateFloor() {
  const SIZE = 512;
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const ctx = c.getContext('2d');
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const v = randInt(0, 14);
      let base;
      if (v < 5) base = '#14100c';
      else if (v < 8) base = '#171310';
      else if (v < 11) base = '#1a1510';
      else if (v < 13) base = '#0f0c0a';
      else base = '#211a12';
      ctx.fillStyle = base; ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1;
  for (let y = 0; y <= SIZE; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SIZE, y); ctx.stroke(); }
  for (let x = 0; x <= SIZE; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SIZE); ctx.stroke(); }
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = chance(.5) ? 'rgba(0,0,0,.35)' : 'rgba(74,58,40,.25)';
    ctx.beginPath();
    let x = randInt(0, SIZE), y = randInt(0, SIZE);
    ctx.moveTo(x, y);
    for (let s = 0; s < randInt(3, 8); s++) { x += randInt(-14, 14); y += randInt(-14, 14); ctx.lineTo(x, y); }
    ctx.stroke();
  }
  for (let i = 0; i < 200; i++) {
    const x = randInt(0, SIZE), y = randInt(0, SIZE);
    ctx.fillStyle = chance(.6) ? 'rgba(60,90,40,0.10)' : 'rgba(60,40,25,0.10)';
    ctx.beginPath(); ctx.arc(x, y, rand(2, 7), 0, TAU); ctx.fill();
  }
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = 'rgba(201,191,166,0.13)';
    ctx.fillRect(randInt(0, SIZE), randInt(0, SIZE), rand(1, 4), rand(1, 2));
  }
  return c;
}

buildArt();
