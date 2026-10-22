# Cambodia Gazetteer (npm)

[![npm](https://img.shields.io/npm/v/@sothikhorn/cambodia-gazetteer)](https://www.npmjs.com/package/@sothikhorn/cambodia-gazetteer)
[![CI](https://github.com/SothiKhorn019/cambodia-gazetteer-js/actions/workflows/ci.yml/badge.svg)](https://github.com/SothiKhorn019/cambodia-gazetteer-js/actions/workflows/ci.yml)

Cambodia's administrative divisions — **province → district → commune → village** — in Khmer and English, bundled as data with typed lookups. Works offline and has no dependencies. Runs in Node 18+ and any bundler, from both ESM and CommonJS.

| Level | Count |
|-------|------:|
| Provinces (ខេត្ត / រាជធានី) | 25 |
| Districts (ស្រុក / ក្រុង / ខណ្ឌ) | 210 |
| Communes (ឃុំ / សង្កាត់) | 1,652 |
| Villages (ភូមិ) | 14,570 |

## Install

```sh
npm install @sothikhorn/cambodia-gazetteer
```

## Usage

```js
import { getProvinces, getDistricts, getCommunes, getVillages, getVillage } from "@sothikhorn/cambodia-gazetteer";

getProvinces();
// [{ code: "01", name: "បន្ទាយមានជ័យ", en_name: "Banteay Meanchey" }, ...]

getDistricts("01");   // districts of Banteay Meanchey
getCommunes("102");   // communes of Mongkol Borei
getVillages("10201"); // villages of Banteay Neang

getVillage("1020101");
// {
//   code: "1020101", name: "អូរធំ", en_name: "Ou Thum",
//   commune:  { code: "10201", name: "បន្ទាយនាង", en_name: "Banteay Neang" },
//   district: { code: "102",   name: "មង្គលបូរី", en_name: "Mongkol Borei" },
//   province: { code: "01",    name: "បន្ទាយមានជ័យ", en_name: "Banteay Meanchey" }
// }
```

CommonJS works too:

```js
const { getProvince } = require("@sothikhorn/cambodia-gazetteer");
getProvince("12"); // { code: "12", name: "ភ្នំពេញ", en_name: "Phnom Penh" }
```

### Look up any code, or search by name

```js
import { lookup, search } from "@sothikhorn/cambodia-gazetteer";

lookup("10201");
// { level: "commune", code: "10201", name: "បន្ទាយនាង", en_name: "Banteay Neang", district: {...}, province: {...} }

search("phnom penh");                       // Latin names, case-insensitive
search("ភ្នំពេញ", { level: "province" });     // Khmer names
search("Banteay", { level: ["district", "commune"], limit: 10 });
```

`search` matches anywhere in the Khmer or Latin name. Exact matches come first, then names that start with the query, then the rest. Within each group, provinces come before districts, communes and villages.

### Cascading dropdowns

```js
import { getProvinces, getDistricts, getCommunes, getVillages } from "@sothikhorn/cambodia-gazetteer";

const options = (items) => items.map((d) => ({ value: d.code, label: `${d.name} (${d.en_name})` }));

provinceSelect.options = options(getProvinces());
provinceSelect.onchange = (e) => (districtSelect.options = options(getDistricts(e.target.value)));
districtSelect.onchange = (e) => (communeSelect.options = options(getCommunes(e.target.value)));
communeSelect.onchange  = (e) => (villageSelect.options = options(getVillages(e.target.value)));
```

### TypeScript

Types are included:

```ts
import type { Province, District, VillageDetail, LookupResult, Level } from "@sothikhorn/cambodia-gazetteer";
```

### Raw JSON

The data files ship with the package if you'd rather use them directly. They hold flat `{ code, name, en_name }` records:

```js
import provinces from "@sothikhorn/cambodia-gazetteer/data/provinces.json" with { type: "json" };
// also: data/districts.json, data/communes.json, data/villages.json, data/meta.json
```

## Functions

| Function | Returns |
|----------|---------|
| `getProvinces()` | all 25 provinces |
| `getProvince(code)` | a province, or `undefined` |
| `getDistricts(provinceCode?)` | districts of a province (all 210 if omitted) |
| `getDistrict(code)` | a district with its `province`, or `undefined` |
| `getCommunes(districtCode?)` | communes of a district (all 1,652 if omitted) |
| `getCommune(code)` | a commune with its `district` and `province`, or `undefined` |
| `getVillages(communeCode?)` | villages of a commune (all 14,570 if omitted) |
| `getVillage(code)` | a village with its `commune`, `district` and `province`, or `undefined` |
| `lookup(code)` | any record with its parents and a `level`, inferred from the code |
| `search(query, { level?, limit? })` | matching records with their parents and a `level` |
| `normalizeCode(code)` · `parentCode(code)` · `levelOf(code)` | code helpers (see below) |
| `meta` | `{ datasetVersion, source, counts }`: which dataset release is bundled |

Lists contain `{ code, name, en_name }`, where `name` is Khmer and `en_name` is Latin. Single lookups add the record's parents as nested objects: `province` for a district, `district` and `province` for a commune, and `commune`, `district` and `province` for a village. Returned arrays are copies, and records are frozen.

## Codes

Codes are NCDD's, exactly as they appear in the source data. Provinces 01–09 have **no leading zero** below province level:

| | Province | District | Commune | Village |
|-|----------|----------|---------|---------|
| Banteay Meanchey (01) | `01` | `102` | `10201` | `1020101` |
| Phnom Penh (12) | `12` | `1201` | `120101` | `12010101` |

A parent's code is the child's code without its last two digits. Every function also accepts the zero-padded form and numbers, so `getDistrict("0102")`, `getDistrict("102")` and `getDistrict(102)` all return Mongkol Borei. `normalizeCode`, `parentCode` and `levelOf` expose these rules.

## Bundle size

All data is bundled: about 1.1 MB minified, or about 220 KB gzipped, and the village list is most of that. Each level is only built on first use, and bundlers drop levels you never call. A bundle that only uses `getProvinces` comes to about 2 KB.

## Data source and license

- **Data:** [Cambodia Gazetteer — Open Development Cambodia](https://data.opendevelopmentmekong.net/dataset/cambodia-gazetteer), from the NCDD admin database (25 provinces), dated 14 October 2024. The publisher lists the dataset's license as *not specified*. Check that its terms fit your use.
- **Known gap in the source:** village `2010508` (ប៉ៃឡាំ) has no Latin name (`en_name: ""`).
- **Code:** [MIT](LICENSE). This covers this package's code and packaging, not the underlying data.

## Updating the data (maintainers)

The bundled data comes from a tagged release of the dataset repo:

```sh
npm run sync -- v1.1.0          # download, verify, and rewrite data/
npm test                        # counts and integrity
git commit -am "data: sync dataset v1.1.0"
npm version minor               # data refresh = minor (major if codes are removed or renamed)
git push --follow-tags          # CI publishes to npm and creates a GitHub Release
```

`sync` checks every record before writing anything. Codes must be unique, and each record's code-derived parents must equal the nested parents in the release. The dataset repo is private, so `sync` authenticates with `GITHUB_TOKEN` or your `gh` login.
