// render.js — everything the player sees: the diner, the order board, the
// stations and the food itself, all drawn with canvas shapes (no images).
// LAYOUT is shared with game.js so clicks land on what is drawn.

import { INGREDIENTS, CRATE_ORDER, RECIPES } from './recipes.js';

export const W = 1280;
export const H = 720;

export const LAYOUT = {
  crates: CRATE_ORDER.map((id, i) => ({
    id, x: 16 + (i % 2) * 110, y: 216 + Math.floor(i / 2) * 106, w: 104, h: 100,
  })),
  board: { x: 252, y: 292, w: 214, h: 172 },
  grill: { x: 252, y: 492, w: 214, h: 156 },
  grillSlots: [
    { x: 262, y: 528, w: 92, h: 104 },
    { x: 364, y: 528, w: 92, h: 104 },
  ],
  plates: [
    { x: 492, y: 292, w: 168, h: 172 },
    { x: 676, y: 292, w: 168, h: 172 },
  ],
  serve: { x: 492, y: 492, w: 228, h: 156 },
  trash: { x: 736, y: 492, w: 108, h: 156 },
  panel: { x: 868, y: 216, w: 396, h: 432 },
};

const INK = '#2d2a26';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function label(ctx, text, x, y, size = 13, color = INK, align = 'center', bold = true) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? '700' : '400'} ${size}px Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

// One ingredient, drawn as a small picture in a size×size box at (x, y).
export function drawIngredient(ctx, id, x, y, size) {
  const c = INGREDIENTS[id].color;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const s = size / 40; // drawings are sketched on a 40-unit grid
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = 'rgba(45,42,38,0.55)';
  const fill = (col) => { ctx.fillStyle = col; };
  switch (id) {
    case 'bun':
      fill(c); ctx.beginPath(); ctx.arc(0, -2, 13, Math.PI, 0); ctx.fill(); ctx.stroke();
      fill('#f2c078'); rr(ctx, -13, 2, 26, 7, 3); ctx.fill(); ctx.stroke();
      fill('#fff3d6'); [[-6, -9], [3, -12], [8, -6]].forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px, py, 1.4, 0, 7); ctx.fill(); });
      break;
    case 'patty': case 'pattyCooked':
      fill(c); rr(ctx, -14, -7, 28, 14, 7); ctx.fill(); ctx.stroke();
      if (id === 'pattyCooked') { ctx.strokeStyle = 'rgba(0,0,0,0.5)'; [-7, 0, 7].forEach((px) => { ctx.beginPath(); ctx.moveTo(px, -6); ctx.lineTo(px - 3, 6); ctx.stroke(); }); }
      break;
    case 'cheese':
      fill(c); ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(12, -10); ctx.lineTo(12, 6); ctx.lineTo(4, 12); ctx.lineTo(-2, 6); ctx.lineTo(-12, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case 'tomato':
      fill(c); ctx.beginPath(); ctx.arc(0, 2, 13, 0, 7); ctx.fill(); ctx.stroke();
      fill('#4e7a3a'); ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(3, -6); ctx.lineTo(9, -9); ctx.lineTo(4, -3); ctx.lineTo(10, -1); ctx.lineTo(2, 0); ctx.lineTo(0, 6); ctx.lineTo(-2, 0); ctx.lineTo(-10, -1); ctx.lineTo(-4, -3); ctx.lineTo(-9, -9); ctx.lineTo(-3, -6); ctx.closePath(); ctx.fill();
      break;
    case 'lettuce':
      fill(c); ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ctx.arc(Math.cos(a) * 8, Math.sin(a) * 8, 7, 0, 7); }
      ctx.fill(); ctx.stroke();
      break;
    case 'egg':
      fill(c); rr(ctx, -11, -13, 22, 26, 9); ctx.fill(); ctx.stroke();
      fill('#e8dcc0'); ctx.beginPath(); ctx.arc(0, 6, 5, 0, 7); ctx.fill();
      break;
    case 'potato':
      fill(c); ctx.beginPath(); ctx.ellipse(0, 0, 10, 14, 0.5, 0, 7); ctx.fill(); ctx.stroke();
      fill('rgba(90,60,20,0.6)'); [[-3, -5], [4, 1], [-2, 7]].forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px, py, 1.5, 0, 7); ctx.fill(); });
      break;
    case 'onion':
      [12, 8, 4].forEach((r) => { ctx.strokeStyle = c; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); });
      break;
    case 'tomatoSlices':
      fill(c); [-8, 8].forEach((px) => { ctx.beginPath(); ctx.arc(px, 0, 8, 0, 7); ctx.fill(); ctx.stroke(); });
      fill('#ffb59e'); [-8, 8].forEach((px) => { ctx.beginPath(); ctx.arc(px, 0, 3.4, 0, 7); ctx.fill(); });
      break;
    case 'lettuceShred':
      ctx.strokeStyle = c; ctx.lineWidth = 3.4;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 6 - 4, -10); ctx.quadraticCurveTo(i * 6 + 3, 0, i * 6 - 3, 10); ctx.stroke(); }
      break;
    case 'potatoDiced':
      fill(c); [[-9, -9], [1, -9], [-9, 1], [1, 1]].forEach(([px, py]) => { rr(ctx, px, py, 9, 9, 2); ctx.fill(); ctx.stroke(); });
      break;
    case 'onionRings':
      ctx.strokeStyle = c; ctx.lineWidth = 3;
      [[-6, -4, 8], [7, 3, 6], [0, 9, 5]].forEach(([px, py, r]) => { ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.stroke(); });
      break;
    case 'eggFried':
      fill('#fdf6e3'); ctx.beginPath();
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; ctx.arc(Math.cos(a) * 9, Math.sin(a) * 9, 6.4, 0, 7); }
      ctx.fill(); ctx.stroke();
      fill('#f5a623'); ctx.beginPath(); ctx.arc(1, 0, 6, 0, 7); ctx.fill(); ctx.stroke();
      break;
    default: // burnt
      fill(c); ctx.beginPath(); ctx.arc(0, 1, 12, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(120,120,120,0.8)'; ctx.lineWidth = 2;
      [-5, 4].forEach((px) => { ctx.beginPath(); ctx.moveTo(px, -10); ctx.quadraticCurveTo(px + 4, -16, px, -22); ctx.stroke(); });
  }
  ctx.restore();
}

function drawTopBar(ctx, st) {
  ctx.fillStyle = '#20504f';
  ctx.fillRect(0, 0, W, 56);
  label(ctx, 'MIDNIGHT SKILLET', 18, 28, 22, '#ffd166', 'left');
  label(ctx, 'late-night diner kitchen', 252, 30, 12, '#bfe3dd', 'left', false);
  // shift clock
  const frac = Math.max(0, st.timeLeft / st.shiftLength);
  ctx.fillStyle = '#123332'; rr(ctx, 560, 14, 300, 28, 8); ctx.fill();
  ctx.fillStyle = frac > 0.25 ? '#7fb069' : '#e4572e'; rr(ctx, 564, 18, 292 * frac, 20, 6); ctx.fill();
  label(ctx, `SHIFT ${Math.ceil(st.timeLeft)}s`, 710, 29, 14, '#ffffff');
  label(ctx, `COINS ${st.coins}`, 1000, 28, 17, '#ffd166');
  label(ctx, `SERVED ${st.served}`, 1130, 28, 15, '#ffffff');
  label(ctx, `LEFT ${st.board.walkouts}`, 1224, 28, 15, '#f2a49a');
}

function drawTicket(ctx, t, i, now) {
  const x = 16 + i * 312;
  const y = 66;
  const urgent = t.patience / t.patienceMax < 0.3;
  ctx.fillStyle = urgent ? '#fdeceb' : '#fffdf5';
  rr(ctx, x, y, 300, 128, 10); ctx.fill();
  ctx.strokeStyle = urgent ? '#e4572e' : '#cbbf9f'; ctx.lineWidth = 2; ctx.stroke();
  label(ctx, t.recipe.name, x + 12, y + 20, 16, INK, 'left');
  label(ctx, `$${t.recipe.price}`, x + 288, y + 20, 16, '#20504f', 'right');
  t.recipe.needs.forEach((id, j) => {
    const ix = x + 12 + j * 56;
    drawIngredient(ctx, id, ix, y + 34, 40);
    label(ctx, INGREDIENTS[id].name.split(' ')[0], ix + 20, y + 86, 9.5, '#5a554d');
  });
  const frac = Math.max(0, t.patience / t.patienceMax);
  ctx.fillStyle = '#e8e2d2'; rr(ctx, x + 12, y + 102, 276, 12, 6); ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#7fb069' : frac > 0.25 ? '#f7c948' : '#e4572e';
  rr(ctx, x + 12, y + 102, 276 * frac, 12, 6); ctx.fill();
  if (urgent && Math.floor(now * 3) % 2 === 0) label(ctx, 'HURRY!', x + 150, y + 108, 10, '#e4572e');
}

function drawCrates(ctx, kitchen) {
  for (const c of LAYOUT.crates) {
    ctx.fillStyle = '#a9713f';
    rr(ctx, c.x, c.y, c.w, c.h, 8); ctx.fill();
    ctx.fillStyle = '#8a5527'; rr(ctx, c.x, c.y, c.w, 20, 8); ctx.fill();
    drawIngredient(ctx, c.id, c.x + 26, c.y + 24, 52);
    label(ctx, INGREDIENTS[c.id].name, c.x + c.w / 2, c.y + 88, 10.5, '#fff7e6');
    ctx.fillStyle = '#20504f'; ctx.beginPath(); ctx.arc(c.x + 14, c.y + 14, 9, 0, 7); ctx.fill();
    label(ctx, String(CRATE_ORDER_INDEX(c.id)), c.x + 14, c.y + 15, 11, '#ffffff');
  }
  label(ctx, 'INGREDIENT CRATES — click or keys 1-8', 124, 652, 12, '#5a554d');
}
function CRATE_ORDER_INDEX(id) { return ['bun', 'patty', 'cheese', 'tomato', 'lettuce', 'egg', 'potato', 'onion'].indexOf(id) + 1; }

function drawBoard(ctx, kitchen) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#d9b380'; rr(ctx, b.x, b.y, b.w, b.h, 10); ctx.fill();
  ctx.strokeStyle = '#a9713f'; ctx.lineWidth = 3; ctx.stroke();
  label(ctx, 'CHOPPING BOARD [C]', b.x + b.w / 2, b.y + 18, 13, '#6b4423');
  if (kitchen.board) {
    drawIngredient(ctx, kitchen.board.item, b.x + 67, b.y + 44, 80);
    ctx.fillStyle = '#e8e2d2'; rr(ctx, b.x + 22, b.y + 138, b.w - 44, 12, 6); ctx.fill();
    ctx.fillStyle = '#7fb069'; rr(ctx, b.x + 22, b.y + 138, (b.w - 44) * kitchen.board.progress, 12, 6); ctx.fill();
    if (kitchen.board.progress >= 1) label(ctx, 'READY — click to take', b.x + b.w / 2, b.y + 128, 11, '#20504f');
  } else {
    label(ctx, 'drop tomato, lettuce,', b.x + b.w / 2, b.y + 74, 12, '#6b4423', 'center', false);
    label(ctx, 'potato or onion here', b.x + b.w / 2, b.y + 94, 12, '#6b4423', 'center', false);
  }
}

function drawGrill(ctx, kitchen, now) {
  const g = LAYOUT.grill;
  ctx.fillStyle = '#4a4a52'; rr(ctx, g.x, g.y, g.w, g.h, 10); ctx.fill();
  label(ctx, 'GRILL [G]', g.x + g.w / 2, g.y + 16, 13, '#ffd166');
  LAYOUT.grillSlots.forEach((s, i) => {
    ctx.fillStyle = '#33333a'; rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    const slot = kitchen.grill[i];
    if (!slot) { label(ctx, 'empty', s.x + s.w / 2, s.y + s.h / 2, 11, '#9a9aa5', 'center', false); return; }
    const shown = slot.state === 'cooking' ? slot.item : slot.state === 'burnt' ? 'burnt' : INGREDIENTS[slot.item].cooks;
    drawIngredient(ctx, shown, s.x + 16, s.y + 12, 60);
    ctx.fillStyle = '#22222a'; rr(ctx, s.x + 10, s.y + 80, s.w - 20, 10, 5); ctx.fill();
    ctx.fillStyle = slot.state === 'burnt' ? '#e4572e' : slot.state === 'cooked' ? '#f7c948' : '#7fb069';
    rr(ctx, s.x + 10, s.y + 80, (s.w - 20) * Math.min(1, slot.progress), 10, 5); ctx.fill();
    if (slot.state === 'cooked') label(ctx, 'READY!', s.x + s.w / 2, s.y + 100, 10, '#ffd166');
    if (slot.state === 'burnt') label(ctx, 'BURNT!', s.x + s.w / 2, s.y + 100, 10, '#e4572e');
    if (slot.state === 'cooking' && Math.floor(now * 2) % 2 === 0) label(ctx, 'sizzle…', s.x + s.w / 2, s.y + 100, 9.5, '#bfe3dd', 'center', false);
  });
}

function drawPlates(ctx, kitchen) {
  LAYOUT.plates.forEach((p, i) => {
    const selected = kitchen.selectedPlate === i;
    ctx.fillStyle = selected ? '#fdf3d8' : '#efe9dc';
    rr(ctx, p.x, p.y, p.w, p.h, 10); ctx.fill();
    ctx.strokeStyle = selected ? '#f7c948' : '#cbbf9f'; ctx.lineWidth = selected ? 3.5 : 2; ctx.stroke();
    label(ctx, `PLATE ${i + 1} [${i === 0 ? 'Q' : 'W'}]`, p.x + p.w / 2, p.y + 16, 12.5, '#20504f');
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + 92, 62, 44, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#d8d2c2'; ctx.lineWidth = 2; ctx.stroke();
    kitchen.plates[i].forEach((id, j) => {
      const cols = 3;
      const ix = p.x + 22 + (j % cols) * 44;
      const iy = p.y + 48 + Math.floor(j / cols) * 44;
      drawIngredient(ctx, id, ix, iy, 38);
    });
    if (kitchen.plates[i].length === 0) label(ctx, 'empty plate', p.x + p.w / 2, p.y + 92, 11, '#9a958a', 'center', false);
  });
}

function drawServeTrash(ctx) {
  const s = LAYOUT.serve;
  ctx.fillStyle = '#20504f'; rr(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
  label(ctx, 'SERVE PLATE', s.x + s.w / 2, s.y + 62, 21, '#ffd166');
  label(ctx, 'window [Enter]', s.x + s.w / 2, s.y + 92, 12.5, '#bfe3dd', 'center', false);
  const t = LAYOUT.trash;
  ctx.fillStyle = '#8a4b2a'; rr(ctx, t.x, t.y, t.w, t.h, 10); ctx.fill();
  label(ctx, 'BIN', t.x + t.w / 2, t.y + 62, 18, '#ffffff');
  label(ctx, '[Bksp]', t.x + t.w / 2, t.y + 92, 12, '#f2c9b8', 'center', false);
}

function drawPanel(ctx, st) {
  const p = LAYOUT.panel;
  ctx.fillStyle = '#fffdf5'; rr(ctx, p.x, p.y, p.w, p.h, 10); ctx.fill();
  ctx.strokeStyle = '#cbbf9f'; ctx.lineWidth = 2; ctx.stroke();
  label(ctx, 'IN YOUR HAND', p.x + 18, p.y + 22, 12.5, '#20504f', 'left');
  if (st.kitchen.hand) {
    drawIngredient(ctx, st.kitchen.hand, p.x + 24, p.y + 34, 52);
    label(ctx, INGREDIENTS[st.kitchen.hand].name, p.x + 86, p.y + 60, 14, INK, 'left');
  } else {
    label(ctx, '— nothing —', p.x + 24, p.y + 60, 13, '#9a958a', 'left', false);
  }
  label(ctx, 'RECIPE BOOK', p.x + 18, p.y + 108, 12.5, '#20504f', 'left');
  RECIPES.forEach((r, i) => {
    const y = p.y + 126 + i * 34;
    label(ctx, `${r.name}  $${r.price}`, p.x + 18, y, 12, INK, 'left');
    r.needs.forEach((id, j) => drawIngredient(ctx, id, p.x + 218 + j * 34, y - 13, 26));
  });
  label(ctx, 'Fast service earns a tip: $5 / $3 / $1.', p.x + 18, p.y + 342, 11.5, '#5a554d', 'left', false);
  label(ctx, 'Burnt food and wrong plates earn nothing.', p.x + 18, p.y + 362, 11.5, '#5a554d', 'left', false);
  label(ctx, 'Three walkouts end the shift early!', p.x + 18, p.y + 388, 12, '#e4572e', 'left');
}

function drawOverlay(ctx, st) {
  ctx.fillStyle = 'rgba(24,32,32,0.82)';
  ctx.fillRect(0, 0, W, H);
  if (st.phase === 'title') {
    label(ctx, 'MIDNIGHT SKILLET', W / 2, 218, 58, '#ffd166');
    label(ctx, 'a late-night diner cooking game', W / 2, 268, 20, '#bfe3dd', 'center', false);
    label(ctx, 'Take orders, chop, grill, plate and serve before patience runs out.', W / 2, 330, 17, '#ffffff', 'center', false);
    label(ctx, 'Click crates to grab ingredients. Boards and the grill finish the prep.', W / 2, 360, 17, '#ffffff', 'center', false);
    label(ctx, 'Build a plate that matches a ticket, then hit SERVE. Tips reward speed.', W / 2, 390, 17, '#ffffff', 'center', false);
    label(ctx, 'CLICK OR PRESS ENTER TO OPEN THE DINER', W / 2, 470, 22, '#7fb069');
  } else {
    label(ctx, 'SHIFT OVER', W / 2, 226, 48, '#ffd166');
    label(ctx, `Coins earned: $${st.coins}`, W / 2, 300, 24, '#ffffff');
    label(ctx, `Plates served: ${st.served}    Customers who left: ${st.board.walkouts}`, W / 2, 340, 18, '#bfe3dd', 'center', false);
    label(ctx, st.coins >= 150 ? 'A legendary night shift!' : st.coins >= 90 ? 'A solid night at the pass.' : 'The diner lives to cook another night.', W / 2, 384, 17, '#ffffff', 'center', false);
    label(ctx, 'CLICK OR PRESS ENTER TO COOK AGAIN', W / 2, 462, 20, '#7fb069');
  }
}

export function render(ctx, st, now) {
  // diner wall and counter
  ctx.fillStyle = '#f3e5cf';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e6d3ae';
  ctx.fillRect(0, 56, W, 146);
  ctx.fillStyle = '#b08968';
  ctx.fillRect(0, 202, W, H - 202);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let x = 0; x < W; x += 64) ctx.fillRect(x, 202, 2, H - 202);

  drawTopBar(ctx, st);
  if (st.board.tickets.length === 0) {
    label(ctx, 'ORDER BOARD — waiting for the first customer…', 640, 130, 16, '#8a7a52');
  }
  st.board.tickets.forEach((t, i) => drawTicket(ctx, t, i, now));
  drawCrates(ctx, st.kitchen);
  drawBoard(ctx, st.kitchen);
  drawGrill(ctx, st.kitchen, now);
  drawPlates(ctx, st.kitchen);
  drawServeTrash(ctx);
  drawPanel(ctx, st);

  if (st.message && now - st.messageAt < 2.2) {
    ctx.fillStyle = 'rgba(32,80,79,0.92)';
    rr(ctx, 440, 660, 400, 40, 10); ctx.fill();
    label(ctx, st.message, 640, 681, 15, '#ffffff');
  }
  // the held item rides the mouse
  if (st.kitchen.hand && st.mouse.x > 0) {
    drawIngredient(ctx, st.kitchen.hand, st.mouse.x - 16, st.mouse.y - 40, 32);
  }
  if (st.phase !== 'play') drawOverlay(ctx, st);
}
