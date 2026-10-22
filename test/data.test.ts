import { describe, expect, it } from "vitest";
import communes from "../data/communes.json";
import districts from "../data/districts.json";
import meta from "../data/meta.json";
import provinces from "../data/provinces.json";
import villages from "../data/villages.json";
import { parentCode } from "../src/codes";

const levels = { provinces, districts, communes, villages };

describe("bundled data", () => {
  it("has the expected counts", () => {
    expect(provinces).toHaveLength(25);
    expect(districts).toHaveLength(210);
    expect(communes).toHaveLength(1652);
    expect(villages).toHaveLength(14570);
  });

  it("matches meta.counts", () => {
    for (const [level, records] of Object.entries(levels)) {
      expect(records.length, level).toBe(meta.counts[level as keyof typeof meta.counts]);
    }
  });

  it("has unique codes and only {code, name, en_name}", () => {
    for (const [level, records] of Object.entries(levels)) {
      expect(new Set(records.map((r) => r.code)).size, level).toBe(records.length);
      for (const r of records) expect(Object.keys(r)).toEqual(["code", "name", "en_name"]);
    }
  });

  it("derives an existing parent for every record", () => {
    const chain = [provinces, districts, communes, villages];
    for (let i = 1; i < chain.length; i++) {
      const parents = new Set(chain[i - 1]!.map((r) => r.code));
      const orphans = chain[i]!.filter((r) => !parents.has(parentCode(r.code)));
      expect(orphans).toEqual([]);
    }
  });
});
