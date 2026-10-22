import data from "../data/provinces.json";
import { createIndex, type LevelIndex } from "./level";
import type { CodeInput, Province } from "./types";

// Built on first use, with no top-level calls, so bundlers can drop unused levels.
let index: LevelIndex | undefined;
const provinces = () => (index ??= createIndex(data));

/** All 25 provinces. */
export function getProvinces(): Province[] {
  return [...provinces().records];
}

/** A province by code ("01", "1" or 1). */
export function getProvince(code: CodeInput): Province | undefined {
  return provinces().get(code);
}
