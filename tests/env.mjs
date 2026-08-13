/* Where things are, so no test hardcodes one machine's paths.

   REPO / PUBLIC are derived from this file's own location, so the suite runs from
   any clone. tmpDir() hands out scratch directories under the OS temp dir and
   clears them first — several server tests build a fake @netlify/blobs module in
   one. CHROMIUM points at the preinstalled browser when there is one, and
   otherwise lets Playwright find its own; set GP_CHROMIUM to override. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PUBLIC = path.join(REPO, 'public');

const BASE = path.join(os.tmpdir(), 'gp-impact-tests');

/* Wipes first: the server tests build a fake @netlify/blobs module in here and
   must not inherit a previous run's. Do not use it for screenshots — a second
   caller in the same run would delete the first one's. */
export function tmpDir(name) {
  const d = path.join(BASE, name);
  if (name !== 'out') fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
  return d;
}

function findChromium() {
  if (process.env.GP_CHROMIUM) return process.env.GP_CHROMIUM;
  for (const p of ['/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser']) {
    try { if (fs.existsSync(p)) return p; } catch (e) { /* keep looking */ }
  }
  return undefined; // let Playwright use its own download
}

export const CHROMIUM = findChromium();
