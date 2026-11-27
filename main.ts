// NestEgg — household budget site entry (Node 22, standard library only): the site is
// this directory's app/ folder, plain static files a browser opens at app/index.html
// (ES modules, CSS, no build step), its content held in its own files: nothing it runs,
// styles or shows loads over the network. The program hands it in: it copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json, the
// summary the judge reads (your screenshots, the first load's files and bytes, and your
// source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts as it
// is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Before copying, this entrypoint validates its own inputs and reports what it built:
// it refuses to hand in a broken entry (no app/index.html, too many screenshots, or a
// screenshot over the scorer's size cap) instead of silently shipping one, counts the
// files and bytes it copied, and reads dossier.json back after writing it to prove the
// file on disk is valid JSON. The output layout is unchanged: app/, screenshots/ and
// dossier.json, exactly as the starter produced.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
const CAPS = { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 };

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

// Walk a directory tree and total up its files and bytes, so the build summary below
// reports real numbers instead of guessing from the copy step.
function measureTree(dir: string): { files: number; bytes: number } {
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = measureTree(path);
      files += sub.files;
      bytes += sub.bytes;
    } else if (entry.isFile()) {
      files += 1;
      bytes += statSync(path).size;
    }
  }
  return { files, bytes };
}

// Pre-flight: refuse a broken hand-in before anything is copied.
const appDir = join(here, 'app');
if (!existsSync(join(appDir, 'index.html'))) fail('app/index.html is missing — nothing to hand in.');
const appTotals = measureTree(appDir);
if (appTotals.files > CAPS.app_max_files) fail(`app/ has ${appTotals.files} files, over the ${CAPS.app_max_files} cap.`);
if (appTotals.bytes > CAPS.app_max_bytes) fail(`app/ is ${appTotals.bytes} bytes, over the ${CAPS.app_max_bytes} cap.`);

const shotsDir = join(here, 'screenshots');
let shotTotals = { files: 0, bytes: 0 };
if (existsSync(shotsDir)) {
  const shots = readdirSync(shotsDir).filter((name) => statSync(join(shotsDir, name)).isFile());
  if (shots.length > CAPS.screenshots.max) fail(`${shots.length} screenshots, over the ${CAPS.screenshots.max} cap.`);
  for (const name of shots) {
    const size = statSync(join(shotsDir, name)).size;
    if (size > CAPS.screenshots.max_bytes) fail(`screenshot ${name} is ${size} bytes, over the ${CAPS.screenshots.max_bytes} cap.`);
  }
  shotTotals = measureTree(shotsDir);
}

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

writeFileSync(join(out, 'dossier.json'), buildDossier(out, CAPS));

// Post-write check: prove the dossier on disk parses before declaring success.
const dossierPath = join(out, 'dossier.json');
let dossierBytes = 0;
try {
  const raw = readFileSync(dossierPath, 'utf8');
  dossierBytes = Buffer.byteLength(raw, 'utf8');
  JSON.parse(raw);
} catch {
  fail('dossier.json was written but is not valid JSON.');
}

console.log(
  `built ${out}: app/ ${appTotals.files} files / ${appTotals.bytes} bytes, ` +
    `screenshots/ ${shotTotals.files} files / ${shotTotals.bytes} bytes, ` +
    `dossier.json ${dossierBytes} bytes`,
);
