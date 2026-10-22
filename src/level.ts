import { normalizeCode, parentCode } from "./codes";
import type { CodeInput, Division } from "./types";

/** In-memory index over one level's records. */
export interface LevelIndex {
  readonly records: readonly Division[];
  get(code: CodeInput): Division | undefined;
  children(parent: CodeInput): Division[];
}

export function createIndex(raw: readonly Division[]): LevelIndex {
  const records = raw.map((r) => Object.freeze({ code: r.code, name: r.name, en_name: r.en_name }));
  const byCode = new Map(records.map((r) => [r.code, r]));
  const byParent = new Map<string, Division[]>();
  for (const r of records) {
    const parent = parentCode(r.code);
    const siblings = byParent.get(parent);
    if (siblings) siblings.push(r);
    else byParent.set(parent, [r]);
  }
  return {
    records,
    get(code) {
      const c = normalizeCode(code);
      return c === undefined ? undefined : byCode.get(c);
    },
    children(parent) {
      const c = normalizeCode(parent);
      return c === undefined ? [] : [...(byParent.get(c) ?? [])];
    },
  };
}
