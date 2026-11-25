// orders.js — the order board: tickets arrive, patience drains, and a ticket
// that waits too long walks out. Difficulty is a function of elapsed shift
// time: tickets come faster and patience runs shorter as the rush builds.

import { RECIPES } from './recipes.js';

let nextTicketId = 1;

export class OrderBoard {
  constructor() {
    this.tickets = []; // { id, recipe, patience, patienceMax }
    this.spawnIn = 0.5; // first customer arrives almost at once
    this.walkouts = 0;
  }

  // Seconds between new tickets: 7.5s at the open, tightening to 3.8s.
  spawnGap(elapsed) {
    return Math.max(3.8, 7.5 - elapsed * 0.028);
  }

  // Patience of a fresh ticket: 48s early, down to 30s late in the shift.
  patienceFor(elapsed) {
    return Math.max(30, 48 - elapsed * 0.13);
  }

  update(dt, elapsed, rng) {
    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.tickets.length < 4) {
      const recipe = RECIPES[Math.floor(rng() * RECIPES.length)];
      const patience = this.patienceFor(elapsed);
      this.tickets.push({ id: nextTicketId++, recipe, patience, patienceMax: patience });
      this.spawnIn = this.spawnGap(elapsed);
    }
    for (const t of this.tickets) t.patience -= dt;
    const before = this.tickets.length;
    this.tickets = this.tickets.filter((t) => t.patience > 0);
    this.walkouts += before - this.tickets.length;
  }

  // Serve: find a ticket whose recipe matches, remove it, and grade the tip
  // by the patience left. Returns { ticket, tip } or null when nothing fits.
  serve(recipe) {
    const idx = this.tickets.findIndex((t) => t.recipe.id === recipe.id);
    if (idx === -1) return null;
    const [ticket] = this.tickets.splice(idx, 1);
    const frac = ticket.patience / ticket.patienceMax;
    const tip = frac > 0.5 ? 5 : frac > 0.25 ? 3 : 1;
    return { ticket, tip };
  }
}
