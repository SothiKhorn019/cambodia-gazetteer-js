import { describe, expect, it } from "vitest";
import { levelOf, normalizeCode, parentCode } from "../src/codes";

describe("normalizeCode", () => {
  it.each([
    ["01", "01"],
    ["1", "01"],
    [1, "01"],
    [" 12 ", "12"],
    ["0102", "102"],
    ["102", "102"],
    [102, "102"],
    ["010201", "10201"],
    ["01020101", "1020101"],
    ["1001", "1001"],
    ["10010101", "10010101"],
  ])("%j → %j", (input, expected) => {
    expect(normalizeCode(input)).toBe(expected);
  });

  it.each(["", "  ", "abc", "01-02", "1.5", "-1"])("rejects %j", (input) => {
    expect(normalizeCode(input)).toBeUndefined();
  });
});

describe("parentCode", () => {
  it.each([
    ["102", "01"],
    ["1001", "10"],
    ["10201", "102"],
    ["100101", "1001"],
    ["1020101", "10201"],
    ["10010101", "100101"],
  ])("%s → %s", (code, expected) => {
    expect(parentCode(code)).toBe(expected);
  });
});

describe("levelOf", () => {
  it.each([
    ["01", "province"],
    ["25", "province"],
    ["102", "district"],
    ["0102", "district"],
    ["1001", "district"],
    ["10201", "commune"],
    ["100101", "commune"],
    ["1020101", "village"],
    ["10010101", "village"],
  ])("%s → %s", (code, expected) => {
    expect(levelOf(code)).toBe(expected);
  });

  it("returns undefined for invalid lengths and input", () => {
    expect(levelOf("123456789")).toBeUndefined();
    expect(levelOf("x")).toBeUndefined();
  });
});
