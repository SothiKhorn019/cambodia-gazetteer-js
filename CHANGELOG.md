# Changelog

All notable changes to this package are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/). A data refresh is a
minor release, or a major one if codes are removed or renamed.

## [1.0.0] — 2026-10-22

Initial release.

- Bundles dataset [v1.0.0](https://github.com/SothiKhorn019/cambodia-gazetteer/releases/tag/v1.0.0):
  25 provinces, 210 districts, 1,652 communes, 14,570 villages (NCDD, 14 October 2024).
- `getProvinces/getDistricts/getCommunes/getVillages` and single lookups that return
  parents in the same shape as the hosted API.
- `lookup(code)` with level inference, and `search(query)` over Khmer and Latin names.
- Accepts zero-padded and numeric codes (`"0102"`, `102`).
- ESM + CommonJS with TypeScript types; raw JSON under `data/`.

[1.0.0]: https://github.com/SothiKhorn019/cambodia-gazetteer-js/releases/tag/v1.0.0
