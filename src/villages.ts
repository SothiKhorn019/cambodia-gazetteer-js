import data from "../data/villages.json";
import { levelOf, normalizeCode, parentCode } from "./codes";
import { getCommune } from "./communes";
import { createIndex, type LevelIndex } from "./level";
import { getProvince } from "./provinces";
import type { CodeInput, Division, Village, VillageDetail } from "./types";

let index: LevelIndex | undefined;
const villages = () => (index ??= createIndex(data));

/** Villages (ភូមិ) of a commune, or all 14,570 when no code is given. */
export function getVillages(communeCode?: CodeInput): Village[] {
  if (communeCode === undefined) return [...villages().records];
  return villages().children(communeCode);
}

/** A village by code ("1020101", "01020101" or 1020101), with its commune, district and province. */
export function getVillage(code: CodeInput): VillageDetail | undefined {
  const village = villages().get(code);
  if (!village) return undefined;
  const { district, province, ...commune } = getCommune(parentCode(village.code))!;
  return { ...village, commune, district, province };
}

// One index per province, loaded on first use and shared by all its communes.
const provinces = new Map<string, Promise<LevelIndex>>();

/**
 * Villages of a commune, like getVillages(communeCode), but loads only the villages of
 * that commune's province instead of all 14,570. Bundlers put each province in its own
 * chunk, so an app that never calls getVillages, getVillage, lookup or search leaves the
 * full village list out of its bundle. Resolves to [] for an unknown or invalid code.
 */
export async function loadVillages(communeCode: CodeInput): Promise<Village[]> {
  const commune = normalizeCode(communeCode);
  if (commune === undefined || levelOf(commune) !== "commune") return [];
  const province = parentCode(parentCode(commune));
  if (!getProvince(province)) return [];

  let villagesOf = provinces.get(province);
  if (!villagesOf) {
    villagesOf = import(`../data/villages/${province}.json`).then(
      (file: { default: Division[] }) => createIndex(file.default),
    );
    provinces.set(province, villagesOf);
    // A chunk that fails to load (offline, say) is forgotten, so the next call retries.
    villagesOf.catch(() => provinces.delete(province));
  }
  return (await villagesOf).children(commune);
}
