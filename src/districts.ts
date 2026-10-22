import data from "../data/districts.json";
import { parentCode } from "./codes";
import { createIndex, type LevelIndex } from "./level";
import { getProvince } from "./provinces";
import type { CodeInput, District, DistrictDetail } from "./types";

let index: LevelIndex | undefined;
const districts = () => (index ??= createIndex(data));

/** Districts (ស្រុក / ក្រុង / ខណ្ឌ) of a province, or all 210 when no code is given. */
export function getDistricts(provinceCode?: CodeInput): District[] {
  if (provinceCode === undefined) return [...districts().records];
  return districts().children(provinceCode);
}

/** A district by code ("102", "0102" or 102), with its province. */
export function getDistrict(code: CodeInput): DistrictDetail | undefined {
  const district = districts().get(code);
  if (!district) return undefined;
  return { ...district, province: getProvince(parentCode(district.code))! };
}
