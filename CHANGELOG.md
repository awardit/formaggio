# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2019-09-22
### Added
* Module is now marked as side-effect free.
### Changes
* `Form` no longer automatically adds `noValidate` on its `<form />` element.
* `Form` `onError` prop is now optional.
* Added a minimum version reqiurement on `react` dependency.
### Removed
* **BREAKING CHANGE:** Removed `POSTAL_CODE`, `EMAIL` and `PHONE` exports.
### Fixed
* Fixed unnecessary rerenders caused by `Form` using identity comparison for
  `errors` to update the interal context value, instead a shallow error
  comparison is used.

## [0.1.0] - 2019-09-20
### Added
* Initial release
