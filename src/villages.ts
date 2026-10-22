import data from "../data/villages.json";
import { parentCode } from "./codes";
import { getCommune } from "./communes";
import { createIndex, type LevelIndex } from "./level";
import type { CodeInput, Village, VillageDetail } from "./types";

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
