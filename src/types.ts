/** A single administrative division. */
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

/** A district with its province. */
export interface DistrictDetail extends District {
  readonly province: Province;
}

/** A commune with its district and province. */
export interface CommuneDetail extends Commune {
  readonly district: District;
  readonly province: Province;
}

/** A village with its commune, district and province. */
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
