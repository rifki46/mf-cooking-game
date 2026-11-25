// kitchen.js — the working state of the kitchen: what the cook is holding,
// what is on the chopping board, what is on the grill, and the two plates
// being assembled. Pure state and rules; drawing lives in render.js.

import { INGREDIENTS, CHOP_SECONDS, COOK_SECONDS, BURN_SECONDS } from './recipes.js';

export class Kitchen {
  constructor() {
    this.hand = null;          // ingredient id the cook is holding, or null
    this.board = null;         // { item, progress } on the chopping board
    this.grill = [null, null]; // two grill slots: { item, progress, state }
    this.plates = [[], []];    // two plates, each a list of ingredient ids
    this.selectedPlate = 0;
  }

  takeFromCrate(id) {
    if (this.hand) return false;
    this.hand = id;
    return true;
  }

  // Chopping board: place a choppable raw ingredient, wait, collect the prep.
  boardAction() {
    if (this.board) {
      if (this.board.progress >= 1) {
        if (this.hand) return 'hand-full';
        this.hand = INGREDIENTS[this.board.item].chops;
        this.board = null;
        return 'collected';
      }
      return 'busy';
    }
    if (!this.hand) return 'empty';
    if (!INGREDIENTS[this.hand].chops) return 'not-choppable';
    this.board = { item: this.hand, progress: 0 };
    this.hand = null;
    return 'placed';
  }

  // Grill: place a cookable raw ingredient on a free slot, wait, collect it
  // cooked — or burnt if it sat past the grace time.
  grillAction(slot) {
    const g = this.grill[slot];
    if (g) {
      if (g.state === 'cooked' || g.state === 'burnt') {
        if (this.hand) return 'hand-full';
        this.hand = g.state === 'cooked' ? INGREDIENTS[g.item].cooks : 'burnt';
        this.grill[slot] = null;
        return 'collected';
      }
      return 'busy';
    }
    if (!this.hand) return 'empty';
    if (!INGREDIENTS[this.hand].cooks) return 'not-cookable';
    this.grill[slot] = { item: this.hand, progress: 0, state: 'cooking' };
    this.hand = null;
    return 'placed';
  }

  plateAction(index) {
    this.selectedPlate = index;
    if (!this.hand) return 'selected';
    if (this.hand === 'burnt') return 'burnt';
    this.plates[index].push(this.hand);
    this.hand = null;
    return 'added';
  }

  clearPlate(index) {
    const had = this.plates[index].length > 0;
    this.plates[index] = [];
    return had;
  }

  trashHand() {
    const had = this.hand !== null;
    this.hand = null;
    return had;
  }

  update(dt) {
    const events = [];
    if (this.board && this.board.progress < 1) {
      const before = Math.floor(this.board.progress * 4);
      this.board.progress = Math.min(1, this.board.progress + dt / CHOP_SECONDS);
      if (Math.floor(this.board.progress * 4) > before && this.board.progress < 1) events.push('chop');
      if (this.board.progress >= 1) events.push('board-done');
    }
    this.grill.forEach((g, i) => {
      if (!g) return;
      const need = COOK_SECONDS[g.item];
      if (g.state === 'cooking') {
        g.progress += dt / need;
        if (g.progress >= 1) { g.state = 'cooked'; g.progress = 0; events.push('grill-done'); }
      } else if (g.state === 'cooked') {
        g.progress += dt / BURN_SECONDS;
        if (g.progress >= 1) { g.state = 'burnt'; events.push('burnt'); }
      }
    });
    return events;
  }
}
