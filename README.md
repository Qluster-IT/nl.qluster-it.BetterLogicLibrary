# Better Logic Library

Advanced logic, variable management and shared libraries for Homey.

## Features

- Manage text, number, yes/no and trigger variables, with tags for use in Flows.
- Create variables directly from supported Flow-card pickers.
- Use Text, BLL and Math.js action and condition cards, with localized hints
  explaining how their inputs are interpreted.
- Trigger Flows when variables are set, change, cross a numeric-change threshold,
  or meet a condition for a chosen duration.
- Control variables through BitFlip, NumSlide and Trigger devices.
- Format dates, durations and numbers using configurable locales, time zones and
  custom formats.
- Use BLL expressions and custom functions in this app and other apps that support
  Better Logic Library.
- Convert JSON to CSV or Excel and export variables as JSON, CSV or Excel.
- Share downloads and receive uploads through the file server.
- Let other apps use BLL's libraries and APIs.

## Getting started

Open the app settings to manage variables, custom functions, formatting, exports
and the file server.

To create a variable in a supported Flow card, type its name in the variable
picker, select the new-variable suggestion and save the Flow. Save before using
its tag. Automatically created variables are removed when they are no longer
referenced by the relevant Flow cards. Variables created manually in settings are
not automatically removed.

BLL-supported text can contain expressions inside `{[` and `]}`:

```text
Hello, today is {[date("dddd")]}.
The answer is {[6 * 7]}.
```

Check each card's hint: plain Text, BLL expressions and Math.js expressions do not
all interpret input in the same way.

## Version 4.3.0 highlights

### Performance and resource use

- Reuse bounded date/time and number formatter caches without caching values or
  formatted results.
- Avoid repeated evaluation of identical expressions within one decoded text,
  including expressions returning `0`, `false` or an empty string.
- Reuse the app's Math.js instance and numeric Insights logs, and load locale
  lists only when needed.
- Avoid an extra workbook-buffer copy during Excel generation.
- Release download payloads, upload streams, timers and library listeners when
  they are no longer needed.

### Flow cards and devices

- Add localized hints distinguishing Text, BLL and Math.js cards.
- Resolve asynchronous BLL expression results before filling returned tags.
- Fix CSV base64 output.
- Match sustained triggers to their variable, comparison, duration and execution
  mode, and cancel timers using their original Homey handles.
- Initialize BitFlip and NumSlide from their current variable values, and keep
  devices paired after app startup synchronized.

### Settings, imports and APIs

- Keep variable controls disabled until settings finish loading and report load
  errors rather than treating failures as an empty variable list.
- Respect import cancellation, validate the entire import before replacing
  variables, and reject overlapping imports.
- Improve variable-tag tracking and Insights cleanup.
- Require complete, finite numeric API inputs and reject arithmetic overflow.
- Return explicit errors for unsupported export formats or unavailable libraries,
  and report download-generation and startup failures.
- Provide the shared `/api-ready` endpoint and `api-ready` event for consuming apps.
- Update the `betterlogiclibrary` npm dependency to `1.0.6`.

The complete localized release history is in [.homeychangelog.json](./.homeychangelog.json).

## Upgrade and data safety

Existing variables and saved Flows do not need to be recreated for this update.
Keep a variable export as a backup before using import.

**Import replaces the existing variables and their Insights.** Cancelling the
confirmation leaves them unchanged. Input validation happens before replacement;
it is not a rollback mechanism for failures during replacement.

Numeric API values must be complete decimal or exponent values, for example
`12.5`, `-2` or `1e3`. Partial values such as `2oops`, `NaN` and infinity are
rejected. Clients relying on permissive numeric parsing must send valid numbers.

## Integration and implementation notes

- Date/time and number modules each retain at most 32 Intl formatters per loaded
  module. Locale/format changes and module shutdown clear the relevant cache.
- Expression results are reused only within the same decoded text, not between
  calls. Separate evaluations use fresh JavaScript contexts.
- Math.js configuration and imports are shared within the BLL app:
  `math.config(...)` and `math.import(...)` affect later evaluations in that app.
  Other apps loading the Math.js library keep their own instances.
- Excel output preserves its `Uint8Array` result and browser fallback. Shared
  strings such as `constructor` and `__proto__` remain ordinary cell text.
- Expiring one download does not remove other available downloads. Upload success
  is returned only after writing finishes; server shutdown also cancels unfinished
  requests and clears its timers.
- Consuming apps should check availability, subscribe to `api-ready`, and confirm
  readiness through `GET /api-ready` before using BLL APIs.

## Development

Requires Homey SDK 3; the app's minimum Homey version is defined in `app.json`.

Run the automated tests and validate the app:

```sh
npm test
homey app validate
```

Local validation is not a substitute for testing the applicable functionality on
the supported Homey test devices.

## Documentation and support

- [Wiki](https://github.com/Qluster-IT/nl.qluster-it.BetterLogicLibrary/wiki)
- [Community forum](https://community.homey.app/t/71876)
- [Report an issue](https://github.com/Qluster-IT/nl.qluster-it.BetterLogicLibrary/issues)
