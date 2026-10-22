/** A single administrative division, as in the hosted API's split-by-parent files. */
export interface Division {
  /** NCDD code, e.g. "01" (province), "102" (district), "10201" (commune), "1020101" (village). */
  readonly code: string;
  /** Khmer name. */
  readonly name: string;
  /** Latin (English) name. May be "" where the source has none. */
  readonly en_name: string;
}

export type Province = Division;
export type District = Division;
export type Commune = Division;
export type Village = Division;

/** A district with its parent, same shape as records in the API's districts.json. */
export interface DistrictDetail extends District {
  readonly province: Province;
}

/** A commune with its parents, same shape as records in the API's communes.json. */
export interface CommuneDetail extends Commune {
  readonly district: District;
  readonly province: Province;
}

/** A village with its parents, same shape as records in the API's villages.json. */
export interface VillageDetail extends Village {
  readonly commune: Commune;
  readonly district: District;
  readonly province: Province;
}

export type Level = "province" | "district" | "commune" | "village";

/** Result of lookup() and search(): the record with its parents, tagged with its level. */
export type LookupResult =
  | ({ readonly level: "province" } & Province)
  | ({ readonly level: "district" } & DistrictDetail)
  | ({ readonly level: "commune" } & CommuneDetail)
  | ({ readonly level: "village" } & VillageDetail);

/** A code as a string ("0102", "102") or a number (102). */
export type CodeInput = string | number;
