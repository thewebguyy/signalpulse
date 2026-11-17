import fs from "node:fs";
import path from "node:path";
const directory = path.resolve(".next/static");
if (!fs.existsSync(directory)) throw new Error("Build must run before bundle inspection.");
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const forbidden = ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY", "SIGNALPULSE_DATA_MODE", "Unsupported environment configuration."];
const files = walk(directory).filter((file) => /\.(js|map)$/.test(file));
if (!files.length) throw new Error("No browser bundles found.");
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (forbidden.some((marker) => content.includes(marker))) throw new Error("Server marker found in browser bundle: " + path.basename(file));
}
console.log("Inspected " + files.length + " browser JS/map files: no configured server markers. This is not a general secret scanner.");
