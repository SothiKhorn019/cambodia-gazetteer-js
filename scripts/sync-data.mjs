#!/usr/bin/env node
/**
 * Pull a tagged release of the Cambodia Gazetteer dataset into data/.
 *
 *   node scripts/sync-data.mjs v1.0.0      (or: npm run sync -- v1.0.0)
 *
 * Downloads the merged provinces/districts/communes/villages.json attached to the
 * GitHub Release of SothiKhorn019/cambodia-gazetteer, verifies them, and writes:
 *
 *   data/{level}.json   lean {code,name,en_name}, release order, one record per line
 *   data/meta.json      dataset version, source, counts
 *
 * The package derives every parent from the code alone (drop the last two digits;
 * pad a 1-digit province code to 2). The checks below prove that rule against the
 * nested parents in the release, for every record, so the runtime can rely on it.
 */

import { readFile, writeFile } from "node:fs/promises";

const SOURCE_REPO = "SothiKhorn019/cambodia-gazetteer";
const DATA_DIR = new URL("../data/", import.meta.url);

const LEVELS = ["provinces", "districts", "communes", "villages"];
// Nested parent keys in each merged file, nearest first.
const PARENT_KEYS = {
  provinces: [],
  districts: ["province"],
  communes: ["district", "province"],
  villages: ["commune", "district", "province"],
};
// Valid code lengths per level (provinces 01-09 use 3/5/7, 10-25 use 4/6/8).
const CODE_LENGTHS = {
  provinces: [2],
  districts: [3, 4],
  communes: [5, 6],
  villages: [7, 8],
};

// Same rule as src/codes.ts parentCode().
const parentCode = (code) => code.slice(0, -2).padStart(2, "0");

const tag = process.argv[2];
if (!tag || !/^v\d+\.\d+\.\d+/.test(tag)) {
  console.error("Usage: node scripts/sync-data.mjs <release tag>   e.g. v1.0.0");
  process.exit(1);
}

const errors = [];
const fail = (msg) => errors.push(msg);

async function download(level) {
  const url = `https://github.com/${SOURCE_REPO}/releases/download/${tag}/${level}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.json();
}

console.log(`Downloading ${SOURCE_REPO}@${tag} ...`);
const merged = Object.fromEntries(
  await Promise.all(LEVELS.map(async (level) => [level, await download(level)])),
);

const codeSets = {};
for (const level of LEVELS) {
  const records = merged[level];
  if (!Array.isArray(records) || records.length === 0) {
    fail(`${level}: expected a non-empty array`);
    continue;
  }
  const seen = new Set();
  for (const rec of records) {
    const { code, name, en_name } = rec;
    if (typeof code !== "string" || !/^\d+$/.test(code)) {
      fail(`${level}: non-numeric code ${JSON.stringify(code)}`);
      continue;
    }
    if (!CODE_LENGTHS[level].includes(code.length)) {
      fail(`${level} ${code}: unexpected code length ${code.length}`);
    }
    if (seen.has(code)) fail(`${level} ${code}: duplicate code`);
    seen.add(code);
    if (!name || !en_name) console.warn(`  warning: ${level} ${code} has an empty name field`);

    // Walk up: each nested parent must equal the code-derived ancestor.
    let ancestor = code;
    for (const key of PARENT_KEYS[level]) {
      ancestor = parentCode(ancestor);
      const nested = rec[key]?.code;
      if (nested !== ancestor) {
        fail(`${level} ${code}: ${key} is ${JSON.stringify(nested)}, code implies ${ancestor}`);
      }
    }
  }
  codeSets[level] = seen;
}

// Every derived parent must exist one level up.
for (let i = 1; i < LEVELS.length; i++) {
  const [parentLevel, level] = [LEVELS[i - 1], LEVELS[i]];
  for (const code of codeSets[level] ?? []) {
    if (!codeSets[parentLevel]?.has(parentCode(code))) {
      fail(`${level} ${code}: parent ${parentCode(code)} not found in ${parentLevel}`);
    }
  }
}

if (errors.length) {
  console.error(`\n${errors.length} integrity error(s):`);
  for (const e of errors.slice(0, 50)) console.error(`  ${e}`);
  if (errors.length > 50) console.error(`  ... and ${errors.length - 50} more`);
  process.exit(1);
}

let previous;
try {
  previous = JSON.parse(await readFile(new URL("meta.json", DATA_DIR), "utf8"));
} catch {
  previous = undefined;
}

const counts = {};
for (const level of LEVELS) {
  const lean = merged[level].map(({ code, name, en_name }) => ({ code, name, en_name }));
  const body = `[\n${lean.map((r) => JSON.stringify(r)).join(",\n")}\n]\n`;
  await writeFile(new URL(`${level}.json`, DATA_DIR), body);
  counts[level] = lean.length;
}

const meta = {
  datasetVersion: tag,
  source: {
    repository: `https://github.com/${SOURCE_REPO}`,
    release: `https://github.com/${SOURCE_REPO}/releases/tag/${tag}`,
    upstream: "https://data.opendevelopmentmekong.net/dataset/cambodia-gazetteer",
  },
  counts,
};
await writeFile(new URL("meta.json", DATA_DIR), `${JSON.stringify(meta, null, 2)}\n`);

console.log(`\nWrote data/ for ${tag}${previous ? ` (was ${previous.datasetVersion})` : ""}:`);
for (const level of LEVELS) {
  const before = previous?.counts?.[level];
  const delta = before === undefined ? "" : ` (${counts[level] - before >= 0 ? "+" : ""}${counts[level] - before})`;
  console.log(`  ${level.padEnd(10)} ${String(counts[level]).padStart(6)}${delta}`);
}
console.log("All integrity checks passed.");
