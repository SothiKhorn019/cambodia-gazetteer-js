# Changelog

All notable changes to this package are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/). A data refresh is a
minor release, or a major one if codes are removed or renamed.

## [2.2.0] — 2026-11-02

### Added

- `loadVillages(communeCode)`: a commune's villages, the same list `getVillages(communeCode)`
  returns, as a Promise that loads only the villages of that commune's province. Bundlers put
  each province in its own chunk, so a browser app that never calls `getVillages`,
  `getVillage`, `lookup` or `search` no longer bundles all 14,570 villages. Provinces,
  districts and communes come to about 130 KB, and a province's villages to about 40 KB on
  average (96 KB at most).
- `data/villages/{provinceCode}.json`: the villages again, one file per province. `npm run sync`
  writes them.

### Changed

- The CommonJS build can't be split into chunks, so `dist/index.cjs` carries the villages a
  second time, by province: about 2.2 MB, up from 1.1 MB. `require()` takes a few milliseconds
  longer. The ESM build only gains the province chunks.

## [2.1.0] — 2026-10-23

### Added

- `search` accepts common alternative spellings of province names, such as "Siem Reap",
  "Mondulkiri", "Ratanakiri", "Sihanoukville" and "Tbong Khmum", and the UN romanization
  ("Batdambang", "Otdar Meanchey"). `search("Siem Reap")` now returns province `17`
  before the district of the same name.
- `llms.txt`, a compact reference for AI assistants and tools. It's also shipped in the package.

### Changed

- Latin-name matching in `search` ignores accents, spaces and hyphens as well as case, so
  "Kratié", "siem-reap" and "Banteay Mean Chey" match. Results are a superset of 2.0.0's.
  The one exception is that a lone punctuation query no longer matches Latin names.
- README: an at-a-glance summary, Khmer terms with their romanized spellings, common tasks,
  a province table with accepted spellings, and what's not included.
- npm description and keywords now name the counts and common search terms.

## [2.0.0] — 2026-10-22

Breaking only for code that reads `meta.source.repository` or `meta.source.release`.
The lookup functions and the data are unchanged.

### Removed

- `meta.source.repository` and `meta.source.release`. They pointed to the private
  dataset repo, so they returned 404 for users. `meta.source` now holds only the public
  `upstream` source. Code that reads either removed field gets `undefined`.
- The README link to the private dataset repo.

### Changed

- `npm run sync` authenticates with `GITHUB_TOKEN` or your `gh` login again, because
  the dataset repo is private. Maintainer tooling only, not part of the package.

## [1.0.1] — 2026-10-22

Documentation only; the code and data are unchanged.

- README and type docs describe the package on its own, with no references to the
  hosted web API.

## [1.0.0] — 2026-10-22

Initial release.

- Bundles dataset v1.0.0:
  25 provinces, 210 districts, 1,652 communes, 14,570 villages (NCDD, 14 October 2024).
- `getProvinces/getDistricts/getCommunes/getVillages` and single lookups that return
  each record with its parents nested.
- `lookup(code)` with level inference, and `search(query)` over Khmer and Latin names.
- Accepts zero-padded and numeric codes (`"0102"`, `102`).
- ESM + CommonJS with TypeScript types; raw JSON under `data/`.

[2.2.0]: https://github.com/SothiKhorn019/cambodia-gazetteer-js/releases/tag/v2.2.0
[2.1.0]: https://github.com/SothiKhorn019/cambodia-gazetteer-js/releases/tag/v2.1.0
[2.0.0]: https://github.com/SothiKhorn019/cambodia-gazetteer-js/releases/tag/v2.0.0
[1.0.1]: https://github.com/SothiKhorn019/cambodia-gazetteer-js/releases/tag/v1.0.1
[1.0.0]: https://github.com/SothiKhorn019/cambodia-gazetteer-js/releases/tag/v1.0.0
