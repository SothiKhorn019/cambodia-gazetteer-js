import { getCommunes } from "./communes";
import { getDistricts } from "./districts";
import { lookup } from "./lookup";
import { getProvinces } from "./provinces";
import type { Division, Level, LookupResult } from "./types";
import { getVillages } from "./villages";

export interface SearchOptions {
  /** Only search these levels. Default: all four. */
  level?: Level | readonly Level[];
  /** Maximum number of results. Default: no limit. */
  limit?: number;
}

const LEVELS: readonly Level[] = ["province", "district", "commune", "village"];
const RECORDS: Record<Level, () => Division[]> = {
  province: getProvinces,
  district: getDistricts,
  commune: getCommunes,
  village: getVillages,
};

interface Entry {
  level: Level;
  code: string;
  keys: [string, string];
}

let entries: Entry[] | undefined;

const fold = (s: string) => s.normalize("NFC").toLowerCase().trim();

function allEntries(): Entry[] {
  return (entries ??= LEVELS.flatMap((level) =>
    RECORDS[level]().map((r) => ({ level, code: r.code, keys: [fold(r.name), fold(r.en_name)] as [string, string] })),
  ));
}

/**
 * Find divisions whose Khmer or Latin name contains the query (case-insensitive).
 * Exact matches come first, then prefix matches, then the rest; within each group,
 * provinces before districts before communes before villages, in dataset order.
 *
 *   search("Phnom Penh")             search("ភ្នំពេញ", { level: "province" })
 */
export function search(query: string, options: SearchOptions = {}): LookupResult[] {
  const q = fold(query);
  if (!q) return [];
  const levels = options.level === undefined ? LEVELS : ([] as Level[]).concat(options.level);
  const limit = options.limit ?? Infinity;

  const ranked: { rank: number; entry: Entry }[] = [];
  for (const entry of allEntries()) {
    if (!levels.includes(entry.level)) continue;
    let rank = 3;
    for (const key of entry.keys) {
      if (key === q) rank = Math.min(rank, 0);
      else if (key.startsWith(q)) rank = Math.min(rank, 1);
      else if (key.includes(q)) rank = Math.min(rank, 2);
    }
    if (rank < 3) ranked.push({ rank, entry });
  }
  // Array.prototype.sort is stable, so dataset order is kept within a rank.
  ranked.sort((a, b) => a.rank - b.rank);

  return ranked.slice(0, limit).map(({ entry }) => lookup(entry.code)!);
}
