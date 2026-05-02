/* Remove Next.js output, webpack cache, and SWC cache (fixes missing chunk / stale dev errors). */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

for (const rel of ['.next', path.join('node_modules', '.cache'), '.swc']) {
  const target = path.join(root, rel);
  try {
    fs.rmSync(target, { recursive: true, force: true });
    process.stdout.write(`Removed ${rel}\n`);
  } catch (err) {
    process.stdout.write(`Skip ${rel}: ${err && err.message}\n`);
  }
}
