#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PACKAGES_DIR = path.join(ROOT, "packages");
const DO_PUBLISH = process.env.PUBLISH === "1"; // set PUBLISH=1 to actually publish
const DRY = process.env.DRY === "1";

const sh = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

function listPackageDirs() {
  const out = [];
  const walk = (dir) => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const d = path.join(dir, ent.name);
      if (existsSync(path.join(d, "package.json"))) out.push(d);
      walk(d);
    }
  };
  if (existsSync(PACKAGES_DIR)) walk(PACKAGES_DIR);
  return out;
}


// Minimal semver compare for x.y.z (ignores prerelease/build).
// returns 1 if a>b, 0 if equal, -1 if a<b
function cmpSemver(a, b) {
  const pa = String(a).match(/^(\d+)\.(\d+)\.(\d+)/);
  const pb = String(b).match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!pa || !pb) throw new Error(`Unsupported semver: local=${a} npm=${b}`);
  const A = [Number(pa[1]), Number(pa[2]), Number(pa[3])];
  const B = [Number(pb[1]), Number(pb[2]), Number(pb[3])];
  for (let i = 0; i < 3; i++) {
    if (A[i] > B[i]) return 1;
    if (A[i] < B[i]) return -1;
  }
  return 0;
}

function npmLatest(name) {
  try {
    const out = execFileSync("npm", ["view", name, "version", "--json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, npm_config_loglevel: "silent" },
    }).trim();
    return out ? JSON.parse(out) : null;
  } catch (e) {
    return null; // not found, no access, auth issue, etc.
  }
}

function topoSort(pkgs) {
  // deps-first order among these pkgs, using local deps from dependencies/optional/peer
  const byName = new Map(pkgs.map((p) => [p.name, p]));
  const local = new Set(pkgs.map((p) => p.name));

  const depFields = ["dependencies", "optionalDependencies", "peerDependencies"];
  const depsOf = new Map();
  const indeg = new Map();

  for (const p of pkgs) {
    indeg.set(p.name, 0);
    const deps = new Set();
    for (const f of depFields) {
      const obj = p.json[f];
      if (!obj) continue;
      for (const dep of Object.keys(obj)) if (local.has(dep)) deps.add(dep);
    }
    depsOf.set(p.name, deps);
  }

  for (const [name, deps] of depsOf.entries()) indeg.set(name, deps.size);

  const q = [];
  for (const [name, d] of indeg.entries()) if (d === 0) q.push(name);

  const out = [];
  const depsOfCopy = new Map([...depsOf.entries()].map(([k, v]) => [k, new Set(v)]));

  while (q.length) {
    const n = q.shift();
    out.push(byName.get(n));
    for (const [m, deps] of depsOfCopy.entries()) {
      if (deps.has(n)) {
        deps.delete(n);
        indeg.set(m, indeg.get(m) - 1);
        if (indeg.get(m) === 0) q.push(m);
      }
    }
  }

  return out.length === pkgs.length ? out : pkgs; // if cycle, fall back
}

const dirs = listPackageDirs();
if (dirs.length === 0) {
  console.error("No packages found under ./packages/*/package.json");
  process.exit(2);
}

const all = [];
for (const dir of dirs) {
  const file = path.join(dir, "package.json");
  const j = readJson(file);
  if (!j.name || !j.version) continue;
  all.push({ dir, file, name: j.name, local: j.version, private: !!j.private, json: j });
}

const report = { BEHIND: [], EQUAL: [], AHEAD_REMOTE: [], MISSING: [], SKIP: [] };

for (const p of all) {
  if (p.private) {
    report.SKIP.push(p);
    continue;
  }
  const latest = npmLatest(p.name);
  if (!latest) {
    report.MISSING.push({ ...p, npm: null });
    continue;
  }
  const c = cmpSemver(p.local, latest);
  if (c > 0) report.BEHIND.push({ ...p, npm: latest });
  else if (c === 0) report.EQUAL.push({ ...p, npm: latest });
  else report.AHEAD_REMOTE.push({ ...p, npm: latest });
}

for (const p of report.SKIP) console.log(`SKIP  ${p.name} (private)`);
for (const p of report.EQUAL) console.log(`OK    ${p.name}  local=${p.local}  npm(latest)=${p.npm}`);
for (const p of report.BEHIND) console.log(`BEHIND ${p.name}  local=${p.local}  npm(latest)=${p.npm}`);
for (const p of report.MISSING) console.log(`MISSING ${p.name}  local=${p.local}  (not on npm / no access)`);
for (const p of report.AHEAD_REMOTE) console.log(`REMOTE_NEWER ${p.name}  local=${p.local}  npm(latest)=${p.npm}`);

if (!DO_PUBLISH) process.exit((report.BEHIND.length || report.MISSING.length) ? 1 : 0);

if (DRY) {
  console.log("DRY=1 and PUBLISH=1: would publish BEHIND packages only.");
  process.exit(0);
}

const publishSet = report.BEHIND.concat(report.MISSING);
const toPublish = topoSort(
  publishSet.map(({ dir, file, name, local, private: priv, json, npm }) => ({
    dir, file, name, local, private: priv, json, npm
  }))
);


for (const p of toPublish) {
  console.log(`PUBLISH ${p.name}@${p.local}`);
  execFileSync("npm", ["publish", "--access", "public"], { cwd: p.dir, stdio: "inherit" });
}
