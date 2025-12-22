#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const FLAGS = new Set(process.argv.slice(2));
const DRY_RUN = FLAGS.has("--dry-run");
const CHECK = FLAGS.has("--check");
const LIST = FLAGS.has("--list");
const QUIET = FLAGS.has("--quiet");

if (FLAGS.has("--help")) {
  const help = [
    "sync_readme_mirrors",
    "",
    "Copies each README.ai.md into AGENTS.md and .github/copilot-instructions.md",
    "in the same directory.",
    "",
    "Options:",
    "  --dry-run   Report changes without writing files",
    "  --check     Exit non-zero if changes would be made",
    "  --list      Print each README.ai.md discovered",
    "  --quiet     Only print errors",
    "  --help      Show this help",
  ].join("\n");
  process.stdout.write(`${help}\n`);
  process.exit(0);
}

const root = process.cwd();

async function findReadmes(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findReadmes(fullPath)));
      continue;
    }
    if (entry.isFile() && entry.name === "README.ai.md") {
      results.push(fullPath);
    }
  }
  return results;
}

function log(message) {
  if (!QUIET) {
    process.stdout.write(`${message}\n`);
  }
}

async function fileEquals(filePath, content) {
  try {
    const existing = await fs.readFile(filePath, "utf8");
    return existing === content;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function writeIfChanged(targetPath, content) {
  if (await fileEquals(targetPath, content)) {
    return false;
  }
  if (DRY_RUN || CHECK) {
    return true;
  }
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content);
  return true;
}

const readmes = await findReadmes(root);
if (LIST) {
  readmes.forEach((readme) => log(readme));
}

let changed = 0;
for (const readme of readmes) {
  const content = await fs.readFile(readme, "utf8");
  const dir = path.dirname(readme);
  const targets = [
    path.join(dir, "AGENTS.md"),
    path.join(dir, ".github", "copilot-instructions.md"),
  ];
  for (const target of targets) {
    if (await writeIfChanged(target, content)) {
      changed += 1;
      log(`synced ${path.relative(root, target)}`);
    }
  }
}

if (CHECK && changed > 0) {
  process.stderr.write(
    `sync_readme_instances: ${changed} file(s) out of sync\n`,
  );
  process.exit(1);
}
