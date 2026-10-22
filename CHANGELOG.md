# Changelog

All notable changes to this package are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/). A data refresh is a
minor release, or a major one if codes are removed or renamed.

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

[2.0.0]: https://github.com/SothiKhorn019/cambodia-gazetteer-js/releases/tag/v2.0.0
[1.0.1]: https://github.com/SothiKhorn019/cambodia-gazetteer-js/releases/tag/v1.0.1
[1.0.0]: https://github.com/SothiKhorn019/cambodia-gazetteer-js/releases/tag/v1.0.0
