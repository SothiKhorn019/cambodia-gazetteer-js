import metaData from "../data/meta.json";

export { getProvinces, getProvince } from "./provinces";
export { getDistricts, getDistrict } from "./districts";
export { getCommunes, getCommune } from "./communes";
export { getVillages, getVillage } from "./villages";
export { lookup } from "./lookup";
export { search, type SearchOptions } from "./search";
export { normalizeCode, parentCode, levelOf } from "./codes";
export type * from "./types";

export interface Meta {
  /** Release tag of the cambodia-gazetteer dataset bundled in this package, e.g. "v1.0.0". */
  readonly datasetVersion: string;
  readonly source: {
    /** The published dataset the data comes from (Open Development Cambodia). */
    readonly upstream: string;
  };
  readonly counts: {
    readonly provinces: number;
    readonly districts: number;
    readonly communes: number;
    readonly villages: number;
  };
}

/** Which dataset release is bundled, where it came from, and record counts. */
export const meta: Meta = metaData;
