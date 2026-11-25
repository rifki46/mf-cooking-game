// Midnight Skillet — hand-in program for make.fun's best cooking game bounty.
//
// The game itself is the static site in game/ (open game/index.html in a
// desktop browser and play; it needs no network and no build step). This
// program's only job is the hand-in: copy game/ and screenshots/ into the
// output directory and write dossier.json there with make.fun's vendored
// dossier builder, so the sealed gate can rebuild the dossier from the same
// files and compare it byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own limits, passed to the builder so a hand-in that the scorer
// would refuse fails here first instead of at grading time.
const GATE_LIMITS = {
  text_max_bytes: 163840,               // dossier source text cap (160 KiB)
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,             // 48 MiB of game files at most
  game_path_max_bytes: 1000,
};

function handIn() {
  mkdirSync(outDir, { recursive: true });
  cpSync(join(repoDir, 'game'), join(outDir, 'game'), { recursive: true });
  const shots = join(repoDir, 'screenshots');
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  if (existsSync(shots)) cpSync(shots, join(outDir, 'screenshots'), { recursive: true });
  // buildDossier reads the copied game/ and screenshots/ back from outDir, so
  // the dossier describes exactly the bytes being handed in — never the repo.
  const dossier = buildDossier(outDir, GATE_LIMITS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  return dossier.length;
}

const bytes = handIn();
console.log(`Midnight Skillet handed in: dossier.json ${bytes} bytes -> ${outDir}`);
