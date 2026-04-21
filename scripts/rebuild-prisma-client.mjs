/**
 * Windows: `npx prisma generate` sometimes fails with EPERM renaming query_engine.
 * Removing `node_modules/.prisma` first avoids a stale client (Unknown argument compareAtPrice).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const prismaDir = path.join(root, "node_modules", ".prisma");
if (fs.existsSync(prismaDir)) {
  fs.rmSync(prismaDir, { recursive: true, force: true });
  console.log("Removed node_modules/.prisma");
}
const r = spawnSync("npx", ["prisma", "generate"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
process.exit(r.status ?? 1);
