# Changelog

All notable changes to this project will be documented in this file.

## [2.0.11] - 2025-01-25

Commit Summary: `refactor: move timer logic to server-side using Convex scheduled functions`

### Changed

- Migrated timer functionality from client to server-side
  - Implemented server-side timer using Convex scheduled functions
  - Added time drift compensation between client and server
  - Improved timer reliability by removing client-side state dependency
  - Timer now persists across page reloads and app closes

### Removed

- Removed client-side timer modal component
- Removed client-side timer state management

## [2.0.10] - 2025-01-21

Commit Summary: `fix: accurate timestamps for habit completions`

### Fixed

- Fixed habit completion timestamps
  - Today's completions now use accurate current timestamp instead of fixed time
  - Past completions maintain midnight timestamp for historical data
  - Improved completion tracking accuracy for current day habits

## [2.0.9] - 2025-01-18

Commit Summary: `fix: implement proper frontend pagination for completions`

### Changed

- Implemented proper frontend pagination for completions
  - Added state management for accumulated completions
  - Added loading states for pagination
  - Fixed type issues with cursor handling
  - Improved performance by loading completions in chunks

## [2.0.8] - 2025-01-18

Commit Summary: `perf: optimize completions query with pagination`

### Changed

- Optimized completions query with cursor-based pagination
  - Added limit and cursor support to prevent loading too many records
  - Capped maximum records per request to 100
  - Improved performance for users with many habit completions

## [2.0.7] - 2025-01-17

Commit Summary: `feat: add Buy Me a Coffee button to About page`

### Added

- Added Buy Me a Coffee button to support project development

## [2.0.6] - 2025-01-16

Commit Summary: `refactor: update next-intl to use stable setRequestLocale`

### Changed

- Updated `next-intl` implementation by replacing deprecated `unstable_setRequestLocale` with stable `setRequestLocale`

### Added

- Added changelog.md to track project changes
- Added instructions.md
