/**
 * helpers.js — utilitaires globaux du jeu (aucune dépendance).
 * Toutes les fonctions ici sont pures ou globales, réutilisables partout.
 */
'use strict';

/* ---------- Math ---------- */
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const chance = (p) => Math.random() < p;
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
const dist = (ax, ay, bx, by) => Math.sqrt(dist2(ax, ay, bx, by));
const angleTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
const TAU = Math.PI * 2;

/* ---------- Easing ---------- */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t) => t * t * t;
const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const easeOutElastic = (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;

/* ---------- Couleurs ---------- */
function shade(hex, mul) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp(Math.round(((n >> 16) & 255) * mul), 0, 255);
  const g = clamp(Math.round(((n >> 8) & 255) * mul), 0, 255);
  const b = clamp(Math.round((n & 255) * mul), 0, 255);
  return `rgb(${r},${g},${b})`;
}
function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function flashColor(hex, f) { // f: 0..1 blend vers blanc
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * f);
  const g = Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * f);
  const b = Math.round((n & 255) + (255 - (n & 255)) * f);
  return `rgb(${r},${g},${b})`;
}

/* ---------- Pool générique ---------- */
class Pool {
  constructor(size, factory) {
    this.items = Array.from({ length: size }, () => factory());
    this.cursor = 0;
  }
  next() {
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[this.cursor];
      this.cursor = (this.cursor + 1) % this.items.length;
      if (!it.active) return it;
    }
    return this.items[this.cursor]; // tout est actif -> recycle le plus ancien
  }
  forEachActive(fn) { for (const it of this.items) if (it.active) fn(it); }
  clear() { for (const it of this.items) it.active = false; }
}

/* ---------- Sprites pixel-art : décompression RLE ---------- */
/** paletteData: { "char": "hex" }, rows: ["..WW..", ...] */
function makeSprite(w, h, paletteData, rows) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const data = ctx.createImageData(w, h);
  let px = 0;
  for (let y = 0; y < h; y++) {
    const row = rows[y] || '';
    let x = 0, i = 0;
    while (i < row.length) {
      let col = row[i];
      if (col === '.') { x++; i++; continue; }
      let run = 1;
      // run-length : "5" suivi du caractère = répétition n fois
      if (x + 1 < w && i + 1 < row.length && row[i + 1] >= '2' && row[i + 1] <= '9') {
        run = row.charCodeAt(i + 1) - 48;
        i++;
      }
      const hex = paletteData[col];
      if (hex) {
        const n = parseInt(hex.slice(1), 16);
        for (let r = 0; r < run; r++) {
          const o = (y * w + x + r) * 4;
          data.data[o] = (n >> 16) & 255;
          data.data[o + 1] = (n >> 8) & 255;
          data.data[o + 2] = n & 255;
          data.data[o + 3] = 255;
        }
      }
      x += run; i++;
    }
    px += x;
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

/* ---------- Chiffres romains ---------- */
function toRoman(n) {
  const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let s = '';
  for (const [v, sym] of map) { while (n >= v) { s += sym; n -= v; } }
  return s || 'I';
}

/* ---------- Orientation (pour IA des démons) ---------- */
function compassDir(dx, dy) {
  const a = angleTo(0, 0, dx, dy); // -PI..PI
  const dirs = 8;
  const sector = Math.round(((a / TAU) + 0.5) * dirs) % dirs; // 0=N,1=NE...
  const names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return names[sector];
}

/* ---------- Partage Discord (bonus) ---------- */
function shareToDiscord(text) {
  navigator.clipboard.writeText(text).then(() => {
    window.open('https://discord.com/channels/@me', '_blank');
  }).catch(() => {});
}

/* ---------- FPS ---------- */
function initFpsMeter() {
  const el = document.getElementById('fps');
  let last = performance.now(), acc = 0, frames = 0;
  return function tick(now) {
    acc += now - last; last = now; frames++;
    if (frames >= 20) { el.textContent = Math.round(1000 / (acc / frames)) + ' FPS'; acc = 0; frames = 0; }
  };
}
