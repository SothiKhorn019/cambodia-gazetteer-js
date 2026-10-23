# Cambodia Gazetteer: provinces, districts, communes and villages in Khmer and English

[![npm](https://img.shields.io/npm/v/@sothikhorn/cambodia-gazetteer)](https://www.npmjs.com/package/@sothikhorn/cambodia-gazetteer)
[![CI](https://github.com/SothiKhorn019/cambodia-gazetteer-js/actions/workflows/ci.yml/badge.svg)](https://github.com/SothiKhorn019/cambodia-gazetteer-js/actions/workflows/ci.yml)

Cambodia's administrative divisions, **province → district → commune → village**, as an npm package for JavaScript and TypeScript.

- **Complete:** all 25 provinces, 210 districts, 1,652 communes and 14,570 villages, with official NCDD codes.
- **Bilingual:** every record has a Khmer name (`name`) and a Latin-script name (`en_name`).
- **Offline:** the data is bundled, so there are no network calls and no dependencies.
- **Typed:** TypeScript types are included. It works from ESM and CommonJS, in Node 18+ and in any bundler.
- **Searchable:** look up any code, list a division's children, or search by Khmer or English name.
- **Current:** NCDD admin database, dated 14 October 2024.

AI assistants and tools can read a compact reference in [`llms.txt`](llms.txt).

| Level | Khmer terms | Count |
|-------|-------------|------:|
| Province | ខេត្ត *khaet* (province) / រាជធានី *reachthani* (capital: Phnom Penh) | 25 |
| District | ស្រុក *srok* / ក្រុង *krong* (municipality) / ខណ្ឌ *khan* (Phnom Penh district) | 210 |
| Commune | ឃុំ *khum* / សង្កាត់ *sangkat* (urban commune) | 1,652 |
| Village | ភូមិ *phum* | 14,570 |

## Install

```sh
npm install @sothikhorn/cambodia-gazetteer
# or: pnpm add / yarn add / bun add @sothikhorn/cambodia-gazetteer
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
search("Siem Reap", { level: "province" }); // common spellings work too: Siemreap (17)
search("Banteay", { level: ["district", "commune"], limit: 10 });
```

`search` matches anywhere in the Khmer or Latin name.
- **Latin matching is forgiving:** it ignores case, accents, spaces and hyphens, so "Siem Reap", "siem-reap" and "Siemreap" are the same query.
- **Province spellings:** provinces also match their [common alternative spellings](#provinces).
- **Ordering:** exact matches come first, then names that start with the query, then the rest. Within each group, provinces come before districts, communes and villages.

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

## Common tasks

### List the districts (khans) of Phnom Penh

```js
import { getDistricts } from "@sothikhorn/cambodia-gazetteer";

const khans = getDistricts("12"); // Phnom Penh is province 12
khans.length; // 14
khans[0];     // { code: "1201", name: "ចំការមន", en_name: "Chamkar Mon" }
```

### Build a full address from a village code

```js
import { getVillage } from "@sothikhorn/cambodia-gazetteer";

const v = getVillage("12010101");
[v.name, v.commune.name, v.district.name, v.province.name].join(", ");
// "ភូមិ ១, ទន្លេបាសាក់, ចំការមន, ភ្នំពេញ"
[v.en_name, v.commune.en_name, v.district.en_name, v.province.en_name].join(", ");
// "Phum 1, Tonle Basak, Chamkar Mon, Phnom Penh"
```

### Find a village by name

Village names repeat across the country. For example, 151 villages are named exactly "Thmei", in 24 provinces. So check each result's `district` and `province`:

```js
import { search } from "@sothikhorn/cambodia-gazetteer";

const matches = search("Thmei", { level: "village" }).filter((v) => v.en_name === "Thmei");
matches.map((v) => `${v.code}: ${v.district.en_name}, ${v.province.en_name}`);
```

### Check whether a code is valid

```js
import { lookup, levelOf } from "@sothikhorn/cambodia-gazetteer";

levelOf("10201");    // "commune" (from the code's length)
lookup("10201");     // the commune with its district and province
lookup("99999");     // undefined: no such commune
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

## Provinces

| Code | Khmer | English (NCDD spelling) |
|------|-------|---------|
| `01` | បន្ទាយមានជ័យ | Banteay Meanchey |
| `02` | បាត់ដំបង | Battambang |
| `03` | កំពង់ចាម | Kampong Cham |
| `04` | កំពង់ឆ្នាំង | Kampong Chhnang |
| `05` | កំពង់ស្ពឺ | Kampong Speu |
| `06` | កំពង់ធំ | Kampong Thom |
| `07` | កំពត | Kampot |
| `08` | កណ្ដាល | Kandal |
| `09` | កោះកុង | Koh Kong |
| `10` | ក្រចេះ | Kratie |
| `11` | មណ្ឌលគិរី | Mondul Kiri |
| `12` | ភ្នំពេញ | Phnom Penh |
| `13` | ព្រះវិហារ | Preah Vihear |
| `14` | ព្រៃវែង | Prey Veng |
| `15` | ពោធិ៍សាត់ | Pursat |
| `16` | រតនគិរី | Ratanak Kiri |
| `17` | សៀមរាប | Siemreap |
| `18` | ព្រះសីហនុ | Preah Sihanouk |
| `19` | ស្ទឹងត្រែង | Stung Treng |
| `20` | ស្វាយរៀង | Svay Rieng |
| `21` | តាកែវ | Takeo |
| `22` | ឧត្ដរមានជ័យ | Oddar Meanchey |
| `23` | កែប | Kep |
| `24` | ប៉ៃលិន | Pailin |
| `25` | ត្បូងឃ្មុំ | Tboung Khmum |

English names (`en_name`) follow NCDD's spelling. `search` also accepts these other common spellings, including Wikipedia's, older "Kompong" forms and the UN romanization:

| NCDD name | `search` also matches |
|-----------|----------------------|
| Siemreap (`17`) | Siem Reap, Siem Reab |
| Mondul Kiri (`11`) | Mondulkiri, Mondol Kiri |
| Ratanak Kiri (`16`) | Ratanakiri, Rattanakiri, Rotanokiri |
| Preah Sihanouk (`18`) | Sihanoukville, Kampong Som |
| Tboung Khmum (`25`) | Tbong Khmum |
| Oddar Meanchey (`22`) | Otdar Meanchey, Oddor Meanchey |
| Stung Treng (`19`) | Stoeng Treng, Steung Treng |
| Battambang (`02`) | Batdambang |
| Pursat (`15`) | Pouthisat |
| Kratie (`10`) | Kratié, Kracheh |
| Takeo (`21`) | Takéo, Takev |
| Koh Kong (`09`) | Kaoh Kong |
| Phnom Penh (`12`) | Phnum Penh |
| Kampong Cham, Chhnang, Speu, Thom (`03`–`06`) | Kompong Cham, Kompong Chhnang, Kompong Speu, Kompong Thom, Kampong Spoe, Kampong Thum |

`search("Siem Reap")` returns the province first, then the district of the same name (`1710`). Lookups by code (`getProvince("17")`) don't depend on spelling at all.

## Bundle size

All data is bundled: about 1.1 MB minified, or about 220 KB gzipped, and the village list is most of that. Each level is only built on first use, and bundlers drop levels you never call. A bundle that only uses `getProvinces` comes to about 2 KB.

## What's not included

- No coordinates, boundaries or other GIS shapes. This is a list of names and codes, not a map.
- No postal codes or statistics such as population.
- No division types. It doesn't record whether a district is a srok, krong or khan, or whether a commune is a khum or sangkat.
- No changes after 14 October 2024, the date of the NCDD snapshot.

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
