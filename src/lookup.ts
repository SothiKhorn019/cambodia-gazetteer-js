import { levelOf } from "./codes";
import { getCommune } from "./communes";
import { getDistrict } from "./districts";
import { getProvince } from "./provinces";
import type { CodeInput, LookupResult } from "./types";
import { getVillage } from "./villages";

/**
 * Look up any code, inferring its level from its length.
 *
 *   lookup("10201") → { level: "commune", code: "10201", ..., district, province }
 */
export function lookup(code: CodeInput): LookupResult | undefined {
  switch (levelOf(code)) {
    case "province": {
      const r = getProvince(code);
      return r && { level: "province", ...r };
    }
    case "district": {
      const r = getDistrict(code);
      return r && { level: "district", ...r };
    }
    case "commune": {
      const r = getCommune(code);
      return r && { level: "commune", ...r };
    }
    case "village": {
      const r = getVillage(code);
      return r && { level: "village", ...r };
    }
    default:
      return undefined;
  }
}
