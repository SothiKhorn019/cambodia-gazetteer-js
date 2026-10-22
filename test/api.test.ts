import { describe, expect, it } from "vitest";
import {
  getCommune,
  getCommunes,
  getDistrict,
  getDistricts,
  getProvince,
  getProvinces,
  getVillage,
  getVillages,
  lookup,
  meta,
  search,
} from "../src/index";

const BANTEAY_MEANCHEY = { code: "01", name: "បន្ទាយមានជ័យ", en_name: "Banteay Meanchey" };
const MONGKOL_BOREI = { code: "102", name: "មង្គលបូរី", en_name: "Mongkol Borei" };
const BANTEAY_NEANG = { code: "10201", name: "បន្ទាយនាង", en_name: "Banteay Neang" };
const OU_THUM = { code: "1020101", name: "អូរធំ", en_name: "Ou Thum" };

describe("lists", () => {
  it("returns every record when no parent is given", () => {
    expect(getProvinces()).toHaveLength(25);
    expect(getDistricts()).toHaveLength(210);
    expect(getCommunes()).toHaveLength(1652);
    expect(getVillages()).toHaveLength(14570);
  });

  it("filters by parent, accepting padded, unpadded and numeric codes", () => {
    const byString = getDistricts("01");
    expect(byString.length).toBeGreaterThan(0);
    expect(getDistricts("1")).toEqual(byString);
    expect(getDistricts(1)).toEqual(byString);
    expect(byString).toContainEqual(MONGKOL_BOREI);

    expect(getCommunes("0102")).toEqual(getCommunes("102"));
    expect(getCommunes("102")).toContainEqual(BANTEAY_NEANG);
    expect(getVillages("010201")).toEqual(getVillages("10201"));
    expect(getVillages("10201")[0]).toEqual(OU_THUM);
  });

  it("covers every child exactly once when walking the hierarchy", () => {
    let districts = 0;
    let communes = 0;
    let villages = 0;
    for (const p of getProvinces()) {
      for (const d of getDistricts(p.code)) {
        districts++;
        for (const c of getCommunes(d.code)) {
          communes++;
          villages += getVillages(c.code).length;
        }
      }
    }
    expect([districts, communes, villages]).toEqual([210, 1652, 14570]);
  });

  it("returns [] for an unknown or invalid parent", () => {
    expect(getDistricts("99")).toEqual([]);
    expect(getCommunes("abc")).toEqual([]);
  });

  it("returns copies, and records cannot be mutated", () => {
    const list = getProvinces();
    list.pop();
    expect(getProvinces()).toHaveLength(25);
    expect(() => {
      (getProvinces()[0] as { name: string }).name = "x";
    }).toThrow(TypeError);
  });
});

describe("single lookups", () => {
  it("getProvince", () => {
    expect(getProvince("01")).toEqual(BANTEAY_MEANCHEY);
    expect(getProvince(1)).toEqual(BANTEAY_MEANCHEY);
    expect(getProvince("12")?.en_name).toBe("Phnom Penh");
  });

  it("getDistrict includes its province", () => {
    expect(getDistrict("102")).toEqual({ ...MONGKOL_BOREI, province: BANTEAY_MEANCHEY });
    expect(getDistrict("0102")).toEqual(getDistrict("102"));
  });

  it("getCommune includes district and province", () => {
    expect(getCommune("10201")).toEqual({
      ...BANTEAY_NEANG,
      district: MONGKOL_BOREI,
      province: BANTEAY_MEANCHEY,
    });
  });

  it("getVillage matches the API's merged villages.json shape", () => {
    const village = getVillage("1020101");
    expect(village).toEqual({
      ...OU_THUM,
      commune: BANTEAY_NEANG,
      district: MONGKOL_BOREI,
      province: BANTEAY_MEANCHEY,
    });
    expect(Object.keys(village!)).toEqual(["code", "name", "en_name", "commune", "district", "province"]);
    expect(getVillage("01020101")).toEqual(village);
  });

  it("works for provinces 10–25 (4/6/8-digit codes)", () => {
    const district = getDistricts("12")[0]!;
    expect(district.code).toHaveLength(4);
    const commune = getCommunes(district.code)[0]!;
    const village = getVillages(commune.code)[0]!;
    expect(getVillage(village.code)?.province.en_name).toBe("Phnom Penh");
    expect(getVillage(village.code)?.commune.code).toBe(commune.code);
  });

  it("returns undefined for unknown codes", () => {
    expect(getProvince("99")).toBeUndefined();
    expect(getDistrict("9999")).toBeUndefined();
    expect(getCommune("")).toBeUndefined();
    expect(getVillage("not-a-code")).toBeUndefined();
  });
});

describe("lookup", () => {
  it("infers the level from the code", () => {
    expect(lookup("01")).toEqual({ level: "province", ...BANTEAY_MEANCHEY });
    expect(lookup("102")?.level).toBe("district");
    expect(lookup("10201")?.level).toBe("commune");
    expect(lookup("1020101")).toEqual({ level: "village", ...getVillage("1020101") });
  });

  it("returns undefined for unknown or malformed codes", () => {
    expect(lookup("99")).toBeUndefined();
    expect(lookup("123456789")).toBeUndefined();
    expect(lookup("x")).toBeUndefined();
  });
});

describe("search", () => {
  it("finds by Latin name, case-insensitively", () => {
    const [first] = search("phnom penh");
    expect(first).toMatchObject({ level: "province", code: "12", en_name: "Phnom Penh" });
  });

  it("finds by Khmer name", () => {
    expect(search("ភ្នំពេញ", { level: "province" })).toEqual([
      { level: "province", ...getProvince("12") },
    ]);
  });

  it("ranks exact, then prefix, then substring matches", () => {
    const results = search("Banteay Neang");
    expect(results.length).toBeGreaterThan(1);
    const ranks = results.map((r) =>
      r.en_name.toLowerCase() === "banteay neang" ? 0 : r.en_name.toLowerCase().startsWith("banteay neang") ? 1 : 2,
    );
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("filters by level and respects limit", () => {
    const communes = search("Banteay", { level: "commune" });
    expect(communes.length).toBeGreaterThan(0);
    expect(communes.every((r) => r.level === "commune")).toBe(true);
    expect(search("Banteay", { level: ["district", "commune"], limit: 3 })).toHaveLength(3);
  });

  it("returns [] for an empty query", () => {
    expect(search("   ")).toEqual([]);
  });
});

describe("meta", () => {
  it("records the bundled dataset version and counts", () => {
    expect(meta.datasetVersion).toMatch(/^v\d+\.\d+\.\d+/);
    expect(meta.counts).toEqual({ provinces: 25, districts: 210, communes: 1652, villages: 14570 });
  });
});
