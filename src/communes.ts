import data from "../data/communes.json";
import { parentCode } from "./codes";
import { getDistrict } from "./districts";
import { createIndex, type LevelIndex } from "./level";
import type { CodeInput, Commune, CommuneDetail } from "./types";

let index: LevelIndex | undefined;
const communes = () => (index ??= createIndex(data));

/** Communes (ឃុំ / សង្កាត់) of a district, or all 1,652 when no code is given. */
export function getCommunes(districtCode?: CodeInput): Commune[] {
  if (districtCode === undefined) return [...communes().records];
  return communes().children(districtCode);
}

/** A commune by code ("10201", "010201" or 10201), with its district and province. */
export function getCommune(code: CodeInput): CommuneDetail | undefined {
  const commune = communes().get(code);
  if (!commune) return undefined;
  const { province, ...district } = getDistrict(parentCode(commune.code))!;
  return { ...commune, district, province };
}
