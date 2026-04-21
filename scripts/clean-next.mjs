import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
/** `.next-dev` first (active distDir); then orphans; `.next` last (often locked). */
const dirs = [".next-dev", ".next-output", ".next-build", ".next"];
let removedAny = false;
const failures = [];

for (const name of dirs) {
  const dir = path.join(root, name);
  if (!fs.existsSync(dir)) continue;
  try {
    fs.rmSync(dir, {
      recursive: true,
      force: true,
      maxRetries: 15,
      retryDelay: 300,
    });
    console.log(`Removed ${name}`);
    removedAny = true;
  } catch (err) {
    failures.push({ name, message: err.message });
  }
}

if (failures.length) {
  for (const { name, message } of failures) {
    console.error(`Could not delete ${name}: ${message}`);
  }
  console.error(
    "If .next is locked: close all terminals running `next dev`, close Cursor Simple Browser, then in Task Manager end any stray `node.exe` for this folder. Run: npm run clean",
  );
  if (!removedAny) process.exit(1);
  console.warn("Partial clean: removed what was possible. Run `npm run dev` again.");
}

if (!removedAny && failures.length === 0) {
  console.log(
    "No Next.js cache folders to remove (.next-dev, .next-output, .next-build, .next).",
  );
}
