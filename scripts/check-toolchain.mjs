import { readFileSync } from "node:fs";

// Deployment policy: any Node.js 26.x patch release and npm >= 11 (local pins live in .nvmrc / packageManager).
const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const requiredNodeMajor = manifest.engines.node.match(/^(\d+)\.x$/)?.[1];
const requiredNpmMajor = manifest.engines.npm.match(/^>=(\d+)\./)?.[1];
const npmVersion = process.env.npm_config_user_agent?.match(/^npm\/([^ ]+)/)?.[1];
const nodeMajor = process.versions.node.split(".")[0];
const npmMajor = npmVersion?.split(".")[0];

if (!requiredNodeMajor || !requiredNpmMajor) {
  console.error("package.json engines must use the form node \"<major>.x\" and npm \">=<major>.0.0\".");
  process.exitCode = 1;
} else if (nodeMajor !== requiredNodeMajor || !npmMajor || Number(npmMajor) < Number(requiredNpmMajor)) {
  console.error(`Use Node ${requiredNodeMajor}.x and npm >=${requiredNpmMajor} (received Node ${process.versions.node}, npm ${npmVersion ?? "unknown"}); see README.md.`);
  process.exitCode = 1;
}
