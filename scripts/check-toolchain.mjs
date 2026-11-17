import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const npmVersion = process.env.npm_config_user_agent?.match(/^npm\/([^ ]+)/)?.[1];

// On Vercel build infrastructure, ensure major runtime compatibility with Node 26.x
if (process.env.VERCEL === "1") {
  const nodeMajor = process.versions.node.split(".")[0];
  const requiredMajor = manifest.engines.node.split(".")[0];
  if (nodeMajor !== requiredMajor) {
    console.error(`Vercel build requires Node ${requiredMajor}.x, received Node ${process.versions.node}`);
    process.exitCode = 1;
  }
} else if (process.versions.node !== manifest.engines.node || npmVersion !== manifest.engines.npm) {
  console.error(`Use Node ${manifest.engines.node} and npm ${manifest.engines.npm}; see README.md.`);
  process.exitCode = 1;
}
