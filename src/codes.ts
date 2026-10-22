import type { CodeInput, Level } from "./types";

/**
 * Normalise a code to the form the dataset uses.
 *
 * Provinces 01–09 store lower levels without the leading zero ("102", not "0102"),
 * so a padded code is accepted and stripped; a 1-digit province code is padded.
 *
 *   normalizeCode("0102") → "102"    normalizeCode(1) → "01"    normalizeCode(" 12 ") → "12"
 *
 * Returns undefined when the input is not a string of digits.
 */
export function normalizeCode(input: CodeInput): string | undefined {
  let code = String(input).trim();
  if (!/^\d+$/.test(code)) return undefined;
  if (code.length > 2) code = code.replace(/^0+/, "");
  return code.padStart(2, "0");
}

/**
 * The parent's code: the code without its last two digits, padded to 2 for a province.
 * Mirrors parent_code() in the cambodia-gazetteer build.
 *
 *   parentCode("10201") → "102"    parentCode("102") → "01"
 */
export function parentCode(code: string): string {
  return code.slice(0, -2).padStart(2, "0");
}

/**
 * The level a code belongs to, from its length (after normalising).
 * Provinces 01–09 use 3/5/7-digit codes below province level; 10–25 use 4/6/8.
 */
export function levelOf(input: CodeInput): Level | undefined {
  const code = normalizeCode(input);
  switch (code?.length) {
    case 2:
      return "province";
    case 3:
    case 4:
      return "district";
    case 5:
    case 6:
      return "commune";
    case 7:
    case 8:
      return "village";
    default:
      return undefined;
  }
}
