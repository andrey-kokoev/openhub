#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const sh = (cmd, args) =>
  execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

const tryJson = (cmd, args) => {
  try {
    const out = sh(cmd, args);
    return out ? JSON.parse(out) : null;
  } catch {
    return null;
  }
};

const readPkg = (dir) => {
  const p = path.join(dir, "package.json");
  if (!existsSync(p)) return null;
  const j = JSON.parse(readFileSync(p, "utf8"));
  if (!j.name || !j.version) return null;
  return { name: j.name, local: j.version, private: !!j.private };
};

const npmView = (spec, field) => {
  try {
    const out = execFileSync("npm", ["view", spec, field, "--json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, npm_config_loglevel: "silent" },
    }).trim();
    return out ? JSON.parse(out) : null;
  } catch {
    return null;
  }
};

const list = tryJson("pnpm", ["-r", "list", "--depth", "-1", "--json"]);
if (!Array.isArray(list) || list.length === 0) {
  console.error("No pnpm workspace packages found (is pnpm-workspace.yaml present?).");
  process.exit(2);
}

const pkgs = list.map((x) => x?.path).filter(Boolean).map(readPkg).filter(Boolean);
if (pkgs.length === 0) {
  console.error("pnpm returned paths, but no package.json had both name and version.");
  process.exit(2);
}

let exitCode = 0;

for (const p of pkgs) {
  if (p.private) {
    console.log(`SKIP  ${p.name} (private)`);
    continue;
  }

  const latest = npmView(p.name, "version"); // dist-tags.latest
  if (!latest) {
    console.log(`MISS  ${p.name}  local=${p.local}  (not found on npm or no access)`);
    exitCode = 1;
    continue;
  }

  const versions = npmView(p.name, "versions");
  const publishedLocal = Array.isArray(versions) && versions.includes(p.local);

  if (p.local === latest) {
    console.log(`OK    ${p.name}  local=${p.local}  npm(latest)=${latest}`);
  } else if (publishedLocal) {
    console.log(`TAG   ${p.name}  local=${p.local}  npm(latest)=${latest}  (local published, tag differs)`);
    exitCode = 1;
  } else {
    console.log(`DIFF  ${p.name}  local=${p.local}  npm(latest)=${latest}  (local not published)`);
    exitCode = 1;
  }
}

process.exit(exitCode);