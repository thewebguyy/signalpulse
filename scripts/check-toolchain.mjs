import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const npmVersion = process.env.npm_config_user_agent?.match(/^npm\/([^ ]+)/)?.[1];
if (process.versions.node !== manifest.engines.node || npmVersion !== manifest.engines.npm) {
  console.error(`Use Node ${manifest.engines.node} and npm ${manifest.engines.npm}; see README.md.`);
  process.exitCode = 1;
}
