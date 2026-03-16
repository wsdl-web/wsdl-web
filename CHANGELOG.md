# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.6.4] - 2026-03-16
### Changed
- build: upgrade to Node.js 24 for npm trusted publishing

## [0.6.3] - 2026-03-16
### Fixed
- fix: use OIDC auth for npm publish instead of setup-node token

## [0.6.2] - 2026-03-16
### Changed
- build: use npm trusted publishing instead of token
- docs: add embedding section to README and docs index

### Fixed
- fix: correct license field to Apache-2.0

## [0.6.1] - 2026-03-16
### Fixed
- fix: remove redundant version-from-tag step in CI

## [0.6.0] - 2026-03-16
### Added
- feat: add embeddable wsdl-web with dist bundle, npm package, and CI publishing (#30)

## [0.5.0] - 2026-03-16
### Added
- feat: resolve WSDL and XSD imports/includes (#26)

### Changed
- build: ignore test outputs
- ci: create release on tag push

## [0.4.0] - 2026-03-16
### Added
- feat: add sticky footer with product name and GitHub link (#29)

### Changed
- build: update PR instructions

## [0.3.0] - 2026-03-16
### Added
- feat: SOAP Fault parsing and display (#25)

### Changed
- ci: only deploy to GitHub Pages on tag push

### Fixed
- fix: extract SOAPAction from WSDL 2.0 interface operations (#28)

## [0.2.0] - 2026-03-16
### Added
- feat: add custom request headers panel (#24)

### Fixed
- fix: build multiplatform Docker image for arm64 support (#27)

## [0.1.2] - 2026-03-15
### Changed
- build: add since.yaml for release automation (#22)
- build: adds changelog
- ci: update GitHub Actions to latest stable versions (#23)
- docs: move Docker instructions near top of README

## [0.1.0] - 2026-03-15
### Added
- feat: add Dockerfile and Docker Hub CI/CD (#3)
- feat: add copy request as cURL button
- feat: add deep linking with URL hash routing (#4)
- feat: extract and display WSDL documentation elements (#5)
- feat: redesign UI, add file browse, base URL override, AGENTS.md

### Changed
- chore: add Apache 2.0 license
- chore: release v0.1.0
- ci: add GitHub Actions workflow and deploy to GitHub Pages (#1)
- docs: add CI badge to README
- docs: add Mocks Cloud support mention to README
- docs: add PR title convention to AGENTS.md
- docs: add feature roadmap
- docs: add pages for deep linking and WSDL documentation display
- docs: add screenshots and improve README layout
- docs: add user documentation with index
- docs: move screenshots to docs/img
- refactor: rename project to WSDL Web (wsdl-web)
- test: add Playwright E2E tests (#2)

### Fixed
- fix: move useState before early return in OperationDetail
- fix: rename cURL button to 'Copy as cURL'

### Other
- initial commit
