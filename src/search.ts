import { PROVINCE_ALIASES } from "./aliases";
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
  /** Khmer name, folded. */
  khmer: string;
  /** Latin name plus any alternative spellings, compacted. */
  latin: string[];
}

let entries: Entry[] | undefined;

const fold = (s: string) => s.normalize("NFC").toLowerCase().trim();

/**
 * Latin text without case, accents, spaces or punctuation, so "Siem Reap",
 * "siem-reap" and "Siemréap" all become "siemreap". Only Latin names go through
 * this: stripping marks would break Khmer, whose vowel signs are combining marks.
 */
const compact = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/[^a-z0-9]/g, "");

function allEntries(): Entry[] {
  return (entries ??= LEVELS.flatMap((level) =>
    RECORDS[level]().map((r) => ({
      level,
      code: r.code,
      khmer: fold(r.name),
      latin: [r.en_name, ...((level === "province" && PROVINCE_ALIASES[r.code]) || [])].map(compact),
    })),
  ));
}

/** 0 exact, 1 prefix, 2 substring, 3 no match. */
function rankOf(key: string, q: string): number {
  if (key === q) return 0;
  if (key.startsWith(q)) return 1;
  if (key.includes(q)) return 2;
  return 3;
}

/**
 * Find divisions whose Khmer or Latin name contains the query. Latin matching ignores
 * case, accents, spaces and punctuation, and provinces also match common alternative
 * spellings ("Siem Reap", "Ratanakiri", "Sihanoukville"). Exact matches come first,
 * then prefix matches, then the rest; within each group, provinces before districts
 * before communes before villages, in dataset order.
 *
 *   search("Phnom Penh")             search("ភ្នំពេញ", { level: "province" })
 */
export function search(query: string, options: SearchOptions = {}): LookupResult[] {
  const q = fold(query);
  if (!q) return [];
  // Empty for a Khmer or punctuation-only query, which must not match every Latin name.
  const qLatin = compact(query);
  const levels = options.level === undefined ? LEVELS : ([] as Level[]).concat(options.level);
  const limit = options.limit ?? Infinity;

  const ranked: { rank: number; entry: Entry }[] = [];
  for (const entry of allEntries()) {
    if (!levels.includes(entry.level)) continue;
    let rank = rankOf(entry.khmer, q);
    if (qLatin) for (const key of entry.latin) rank = Math.min(rank, rankOf(key, qLatin));
    if (rank < 3) ranked.push({ rank, entry });
  }
  // Array.prototype.sort is stable, so dataset order is kept within a rank.
  ranked.sort((a, b) => a.rank - b.rank);

  return ranked.slice(0, limit).map(({ entry }) => lookup(entry.code)!);
}
