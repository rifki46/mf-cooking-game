// recipes.js — every ingredient and dish in Midnight Skillet, defined once.
// Ingredients move through three states: raw (from a crate), prepped (chopped)
// and cooked (off the grill). A dish is a set of finished ingredient ids.

export const INGREDIENTS = {
  bun:     { name: 'Bun',           color: '#e8a94e', crate: true },
  patty:   { name: 'Beef patty',    color: '#8a4b2a', crate: true, cooks: 'pattyCooked' },
  cheese:  { name: 'Cheese slice',  color: '#f7c948', crate: true },
  tomato:  { name: 'Tomato',        color: '#e4572e', crate: true, chops: 'tomatoSlices' },
  lettuce: { name: 'Lettuce',       color: '#7fb069', crate: true, chops: 'lettuceShred' },
  egg:     { name: 'Egg',           color: '#f4f1de', crate: true, cooks: 'eggFried' },
  potato:  { name: 'Potato',        color: '#c9a227', crate: true, chops: 'potatoDiced' },
  onion:   { name: 'Onion',         color: '#b8a9c9', crate: true, chops: 'onionRings' },
  tomatoSlices: { name: 'Tomato slices', color: '#ef6f4c' },
  lettuceShred: { name: 'Shredded lettuce', color: '#95c26e' },
  potatoDiced:  { name: 'Diced potato', color: '#dbb93f' },
  onionRings:   { name: 'Onion rings', color: '#cdbfd9' },
  pattyCooked:  { name: 'Grilled patty', color: '#6e3a1f' },
  eggFried:     { name: 'Fried egg', color: '#f2cc8f' },
  burnt:        { name: 'Burnt food', color: '#3d3d3d' },
};

export const CRATE_ORDER = ['bun', 'patty', 'cheese', 'tomato', 'lettuce', 'egg', 'potato', 'onion'];

export const CHOP_SECONDS = 2.0;
export const COOK_SECONDS = { patty: 4.5, egg: 3.2 };
export const BURN_SECONDS = 5.0; // grace time on the grill after cooking before it burns

export const RECIPES = [
  { id: 'classic', name: 'Classic Burger', price: 14, needs: ['bun', 'pattyCooked', 'cheese'] },
  { id: 'garden',  name: 'Garden Burger',  price: 20, needs: ['bun', 'pattyCooked', 'cheese', 'tomatoSlices', 'lettuceShred'] },
  { id: 'sunny',   name: 'Sunny Skillet',  price: 16, needs: ['eggFried', 'potatoDiced', 'tomatoSlices'] },
  { id: 'melt',    name: 'Double Cheese Melt', price: 15, needs: ['bun', 'cheese', 'cheese', 'tomatoSlices'] },
  { id: 'rancher', name: 'Rancher Plate',  price: 22, needs: ['pattyCooked', 'eggFried', 'onionRings', 'potatoDiced'] },
  { id: 'bowl',    name: 'Fresh Garden Bowl', price: 13, needs: ['lettuceShred', 'tomatoSlices', 'onionRings', 'cheese'] },
];

// A plate matches a recipe when the two multisets of ingredient ids are equal.
export function plateMatchesRecipe(plateItems, recipe) {
  if (plateItems.length !== recipe.needs.length) return false;
  const a = [...plateItems].sort();
  const b = [...recipe.needs].sort();
  return a.every((v, i) => v === b[i]);
}

export function findRecipe(plateItems) {
  return RECIPES.find((r) => plateMatchesRecipe(plateItems, r)) ?? null;
}
