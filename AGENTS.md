# Homey App Instructions

> You may override or change any instructions in this file when you explicitly tell me to.

This is a Homey app. Before making changes, read and follow the general instructions in `C:\Users\Qlustrator\.copilot\instructions\homey-app.md`.

## Legacy startup events

- Keep emitting the `running`, `running_2x`, and `running_3x` realtime events while older installed NPM package copies depend on them. The current BLL NPM package does not listen for these events. Once all consuming apps have migrated to its `/api-ready` handshake, remove these emissions.

## Export compatibility

- The bundled Excel writer must keep widths at most 255, reject cells over 32,767 characters explicitly without truncating their data, XML-escape sheet names and declare all worksheets in the package content types. Preserve its `Uint8Array` return type and browser fallback.
- Emit font properties in SpreadsheetML schema order (bold/italic before size, color, name and family). XML well-formedness and desktop Excel opening are not sufficient checks for mobile Excel compatibility; validate the workbook with the Open XML SDK when investigating repair warnings.
- Shared downloads resolve and call ready callbacks only after a complete successful upload. Preserve byte-view offsets and empty files, and reject HTTP, network, timeout and callback failures. Settings downloads report failures through `downloadFileFailed`.

## HP2023 test fixtures

- Reuse the Advanced Flows in the `Better Logic Library` Flow folder and the `BLL Test Number`, `BLL Test Text`, and `BLL Test Boolean` variables. Run the Flows sequentially because they share these variables.
- Reuse the `BLL Test Boolean` and `BLL Test Pair True` BitFlip devices, `BLL Test Number` NumSlide device, and `BLL Test Trigger` Trigger device in the `Better Logic Library` zone. The `Test - Device variable synchronization` Advanced Flow exercises their synchronization.
- Keep the `BLLTestDouble` custom function and `BLLTestDate` custom date format as fixtures for the `Test - Settings fixtures and variable properties` Advanced Flow.
- Check the individual results in Simple (Sys) Log under `Better Logic Library`; a triggered Flow or a `DONE` message alone does not establish that every scenario passed.
- Capture matching log entry IDs before each scenario and assert against new entries afterward. Do not compare Homey log timestamps with the test computer's clock; small clock differences can hide fast events.
- Reuse `Test - Trigger boundaries and sustained lifecycle` for numeric thresholds, same-value updates, typed any-variable tokens, and sustained-condition isolation. Drive its shared variables sequentially; verify exact event counts, cancellation and rearming, then restore their original values to stop repeating timers.
- Reuse `Test - Auto variable lifecycle` when testing automatic creation and removal. Add only its isolated `BLL Test Lifecycle Number`, `BLL Test Lifecycle Text`, and `BLL Test Lifecycle Boolean` references; remove those references afterward and verify their variables disappear. Never use existing variables for removal tests.

## HP2019 test fixtures

- Reuse the matching BLL Flow folder, zone, thirteen Advanced Flows, shared variables, custom function and custom format on HP2019. Keep test runs sequential and leave other apps' fixtures untouched.
- Reuse the four standard BLL test devices and the `BLL Test Recovery Number` NumSlide fixture (minimum -10, maximum 10, step 0.5). Only that isolated recovery variable may be temporarily removed when testing missing-variable errors; recreate it and verify device control recovers.
- When copying Advanced Flows to HP2019, use UUID node IDs and remap their edges, token references, picker values and device IDs to that Homey. Verify the saved Flow is not broken before running it.
- HP2019 can omit card-update events after the final BLL cards are removed. A legacy-only reference reconciliation runs once per day; verify this with a controlled timer in local tests rather than waiting a day during device tests. Startup also reconciles references.
