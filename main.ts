// Vice Cover Studio, the gta6-cover-art-01 entry: a static, offline cover-art
// maker under app/ (index.html plus its own ES modules, no library, no network
// request) that turns a person's photos and caption into a multi-panel
// GTA-style poster and exports it as a PNG in 1080 x 1080, 1080 x 1350 or
// 1920 x 1080. This program hands the entry in: it copies app/ and
// screenshots/ from beside this file into the output directory and writes
// /output/dossier.json with the vendored make.fun library's buildDossier.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output, so a local
// check looks like:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's caps from the bounty gate: only text_max_bytes changes the
// dossier bytes; the rest make this program fail exactly where the scorer
// would refuse an entry (more than 4 screenshots, one over 256 KiB, app/
// over 993 files or 48 MiB, or a path under app/ over 1000 bytes, since
// app/ shares /output's own 1000-entry cap with screenshots/ and dossier.json).
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
