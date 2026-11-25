// game.js — Midnight Skillet's main loop and input. One shift lasts 150
// seconds: serve as many plates as you can before the clock or the third
// walkout ends the night. Mouse does everything; the keyboard mirrors it.

import { Kitchen } from './kitchen.js';
import { OrderBoard } from './orders.js';
import { findRecipe, CRATE_ORDER, RECIPES } from './recipes.js';
import { render, LAYOUT, W, H } from './render.js';
import { sfx } from './audio.js';

const SHIFT_LENGTH = 150;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// A small seeded rng so screenshot scenes are identical on every load.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const st = {
  phase: 'title', // title | play | over
  kitchen: new Kitchen(),
  board: new OrderBoard(),
  coins: 0,
  served: 0,
  elapsed: 0,
  timeLeft: SHIFT_LENGTH,
  shiftLength: SHIFT_LENGTH,
  mouse: { x: -1, y: -1 },
  message: '',
  messageAt: -9,
  rng: Math.random,
};

function say(text) {
  st.message = text;
  st.messageAt = performance.now() / 1000;
}

function reset() {
  st.kitchen = new Kitchen();
  st.board = new OrderBoard();
  st.coins = 0;
  st.served = 0;
  st.elapsed = 0;
  st.timeLeft = SHIFT_LENGTH;
  st.rng = Math.random;
}

function serveSelectedPlate() {
  const k = st.kitchen;
  const items = k.plates[k.selectedPlate];
  if (items.length === 0) { say('That plate is empty.'); sfx.buzz(); return; }
  const recipe = findRecipe(items);
  if (!recipe) { say('No dish matches that plate.'); sfx.buzz(); return; }
  const hit = st.board.serve(recipe);
  if (!hit) { say(`Nobody ordered ${recipe.name}.`); sfx.buzz(); return; }
  st.coins += recipe.price + hit.tip;
  st.served += 1;
  k.plates[k.selectedPlate] = [];
  say(`${recipe.name} served! $${recipe.price} + $${hit.tip} tip`);
  sfx.ding(); sfx.coin();
}

function inRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

function clickAt(x, y) {
  if (st.phase !== 'play') { reset(); st.phase = 'play'; return; }
  const k = st.kitchen;
  for (const c of LAYOUT.crates) {
    if (inRect(x, y, c)) { if (k.takeFromCrate(c.id)) sfx.pickup(); else say('Your hand is full.'); return; }
  }
  if (inRect(x, y, LAYOUT.board)) {
    const r = k.boardAction();
    if (r === 'placed') sfx.place();
    else if (r === 'collected') sfx.pickup();
    else if (r === 'not-choppable') { say('That does not need chopping.'); sfx.buzz(); }
    else if (r === 'hand-full') say('Your hand is full.');
    return;
  }
  LAYOUT.grillSlots.forEach((s, i) => {
    if (inRect(x, y, s)) {
      const r = k.grillAction(i);
      if (r === 'placed') sfx.sizzle();
      else if (r === 'collected') sfx.pickup();
      else if (r === 'not-cookable') { say('That does not go on the grill.'); sfx.buzz(); }
      else if (r === 'hand-full') say('Your hand is full.');
    }
  });
  if (inRect(x, y, LAYOUT.grill)) return;
  LAYOUT.plates.forEach((p, i) => {
    if (inRect(x, y, p)) {
      const r = k.plateAction(i);
      if (r === 'added') sfx.place();
      else if (r === 'burnt') { say('Burnt food ruins the plate — bin it.'); sfx.buzz(); }
    }
  });
  if (inRect(x, y, LAYOUT.serve)) serveSelectedPlate();
  if (inRect(x, y, LAYOUT.trash)) {
    if (k.hand) { k.trashHand(); sfx.trash(); say('Binned.'); }
    else if (k.clearPlate(k.selectedPlate)) { sfx.trash(); say('Plate cleared.'); }
  }
}

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  st.mouse.x = ((e.clientX - rect.left) / rect.width) * W;
  st.mouse.y = ((e.clientY - rect.top) / rect.height) * H;
});
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  clickAt(((e.clientX - rect.left) / rect.width) * W, ((e.clientY - rect.top) / rect.height) * H);
});

window.addEventListener('keydown', (e) => {
  if (st.phase !== 'play') {
    if (e.key === 'Enter' || e.key === ' ') { reset(); st.phase = 'play'; }
    return;
  }
  const k = st.kitchen;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 8) { if (k.takeFromCrate(CRATE_ORDER[n - 1])) sfx.pickup(); return; }
  switch (e.key.toLowerCase()) {
    case 'c': clickAt(LAYOUT.board.x + 10, LAYOUT.board.y + 10); break;
    case 'g': clickAt(LAYOUT.grillSlots[0].x + 10, LAYOUT.grillSlots[0].y + 10); break;
    case 'q': k.selectedPlate = 0; sfx.pop(); break;
    case 'w': k.selectedPlate = 1; sfx.pop(); break;
    case 'enter': serveSelectedPlate(); break;
    case 'backspace': clickAt(LAYOUT.trash.x + 10, LAYOUT.trash.y + 10); e.preventDefault(); break;
  }
});

// --- Screenshot scenes -----------------------------------------------------
// ?scene=<name> freezes a composed moment of a real shift so the entry's
// screenshots are honest renders of the game at its best.
function setupScene(name) {
  reset();
  st.phase = 'play';
  st.rng = mulberry32(20261125);
  const k = st.kitchen;
  const b = st.board;
  const ticket = (recipeId, frac) => {
    const recipe = findRecipeById(recipeId);
    b.tickets.push({ id: 900 + b.tickets.length, recipe, patience: recipe ? 40 * frac : 20, patienceMax: 40 });
  };
  if (name === 'assembly') {
    ticket('garden', 0.8); ticket('classic', 0.62); ticket('sunny', 0.9);
    k.plates[0] = ['bun', 'pattyCooked'];
    k.selectedPlate = 0;
    k.hand = 'cheese';
    k.board = { item: 'tomato', progress: 0.55 };
    k.grill[0] = { item: 'patty', progress: 0.6, state: 'cooking' };
    st.coins = 34; st.served = 2; st.elapsed = 38; st.timeLeft = SHIFT_LENGTH - 38;
    say('Garden Burger on the pass — cheese next!');
  } else if (name === 'serve') {
    ticket('garden', 0.24); ticket('rancher', 0.55); ticket('bowl', 0.7); ticket('melt', 0.85);
    k.plates[1] = ['bun', 'pattyCooked', 'cheese', 'tomatoSlices', 'lettuceShred'];
    k.selectedPlate = 1;
    k.plates[0] = ['eggFried'];
    k.grill[1] = { item: 'egg', progress: 0, state: 'cooked' };
    st.coins = 96; st.served = 6; st.elapsed = 96; st.timeLeft = SHIFT_LENGTH - 96;
    say('Garden Burger ready — SERVE it before she leaves!');
  } else if (name === 'over') {
    st.phase = 'over';
    st.coins = 187; st.served = 11; b.walkouts = 1;
  }
  st.messageAt = performance.now() / 1000;
}
function findRecipeById(id) { return RECIPES.find((r) => r.id === id); }

// --- Main loop ---------------------------------------------------------------
let last = performance.now();
function frame(nowMs) {
  const now = nowMs / 1000;
  let dt = Math.min(0.05, (nowMs - last) / 1000);
  last = nowMs;
  if (st.phase === 'play') {
    st.elapsed += dt;
    st.timeLeft -= dt;
    st.board.update(dt, st.elapsed, st.rng);
    for (const ev of st.kitchen.update(dt)) {
      if (ev === 'chop') sfx.chop();
      if (ev === 'grill-done') sfx.pop();
      if (ev === 'burnt') { sfx.buzz(); say('Something burnt on the grill!'); }
    }
    if (st.timeLeft <= 0 || st.board.walkouts >= 3) st.phase = 'over';
  }
  render(ctx, st, now);
  requestAnimationFrame(frame);
}

const scene = new URLSearchParams(location.search).get('scene');
if (scene) setupScene(scene);
requestAnimationFrame(frame);
