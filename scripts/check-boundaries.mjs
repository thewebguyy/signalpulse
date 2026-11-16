import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}
const privateFile = (name) => /^(server|fixtures|config)\//.test(name);
const pureFile = (name) => /^(contracts|modules)\//.test(name);

/** Input keys are src-relative paths; used for both real files and adversarial graph tests. */
export function checkSourceGraph(sources) {
  const errors = [];
  const graph = new Map();
  const clients = [];
  for (const [name, source] of Object.entries(sources)) {
    const ast = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, name.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const dependencies = [];
    if (ast.statements.some((s) => ts.isExpressionStatement(s) && ts.isStringLiteral(s.expression) && s.expression.text === "use client")) clients.push(name);
    function register(specifier) {
      if (!ts.isStringLiteralLike(specifier)) {
        errors.push(name + ": nonliteral module loading is forbidden");
        return;
      }
      const value = specifier.text;
      if (value.endsWith(".css") && /^(app|components)\//.test(name)) return;
      let target;
      if (value.startsWith("@/")) target = value.slice(2);
      else if (value.startsWith(".")) target = path.posix.normalize(path.posix.join(path.posix.dirname(name), value));
      if (target) {
        const resolved = [target, target + ".ts", target + ".tsx", target + "/index.ts", target + "/index.tsx"].find((p) => sources[p] !== undefined);
        if (!resolved) { errors.push(name + ": unresolved local import " + value); return; }
        dependencies.push(resolved);
        if (name.startsWith("contracts/") && !resolved.startsWith("contracts/")) errors.push(name + ": contracts must remain independent");
        if (name.startsWith("modules/") && !resolved.startsWith("contracts/") && !resolved.startsWith(path.posix.dirname(name) + "/")) errors.push(name + ": domain port crosses module boundary");
      } else if (pureFile(name) && value !== "zod") {
        errors.push(name + ": forbidden domain dependency " + value);
      } else if (/^(node:|fs$|path$|crypto$|server-only$)/.test(value)) dependencies.push("!server:" + value);
    }
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) register(node.moduleSpecifier);
      if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) register(node.argument.literal);
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
        if (node.arguments[0]) register(node.arguments[0]); else errors.push(name + ": missing module specifier");
      }
      if (ts.isIdentifier(node) && node.text === "process" && name !== "config/server.ts") errors.push(name + ": process access is restricted to config/server.ts");
      ts.forEachChild(node, visit);
    }
    visit(ast);
    graph.set(name, dependencies);
  }
  for (const client of clients) {
    const seen = new Set();
    function traverse(name) {
      if (seen.has(name)) return;
      seen.add(name);
      if (privateFile(name) || name.startsWith("!server:")) { errors.push(client + ": client reaches private dependency " + name); return; }
      for (const dependency of graph.get(name) ?? []) traverse(dependency);
    }
    traverse(client);
  }
  for (const entry of ["server/foundation.ts", "config/server.ts"]) {
    if (sources[entry] && !/import\s+["']server-only["']/.test(sources[entry])) errors.push(entry + ": missing server-only guard");
  }
  return [...new Set(errors)];
}
export function scanRepository(root = process.cwd()) {
  const base = path.join(root, "src");
  const sources = Object.fromEntries(walk(base).map((file) => [path.relative(base, file).split(path.sep).join("/"), fs.readFileSync(file, "utf8")]));
  return checkSourceGraph(sources);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const failures = scanRepository();
  if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
  else console.log("Module boundaries passed (including transitive client imports).");
}
