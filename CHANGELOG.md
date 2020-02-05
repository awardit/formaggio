# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Renamed package from `@crossroads-loyalty-solutions/formaggio` to `@awardit/formaggio`.

## [0.2.2] - 2019-11-19
### Fixed
- Type error on `InputProps` with newer version of Flow.

## [0.2.1] - 2019-10-07
### Fixed
- Replaced `sketchy-null`
- Fixed type for event in `onError` and `onSubmit`

## [0.2.0] - 2019-09-22
### Added
- Module is now marked as side-effect free.
### Changes
- `Form` no longer automatically adds `noValidate` on its `<form />` element.
- `Form` `onError` prop is now optional.
- Added a minimum version reqiurement on `react` dependency.
### Removed
- **BREAKING CHANGE:** Removed `POSTAL_CODE`, `EMAIL` and `PHONE` exports.
### Fixed
- Fixed unnecessary rerenders caused by `Form` using identity comparison for
  `errors` to update the interal context value, instead a shallow error
  comparison is used.

## [0.1.0] - 2019-09-20
### Added
- Initial release
