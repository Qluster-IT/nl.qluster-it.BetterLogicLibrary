# Homey App Instructions

> You may override or change any instructions in this file when you explicitly tell me to.

This is a Homey app. Before making changes, read and follow the general instructions in `C:\Users\Qlustrator\.copilot\instructions\homey-app.md`.

## Legacy startup events

- Keep emitting the `running`, `running_2x`, and `running_3x` realtime events while older installed NPM package copies depend on them. The current BLL NPM package does not listen for these events. Once all consuming apps have migrated to its `/api-ready` handshake, remove these emissions.

## HP2023 test fixtures

- Reuse the Advanced Flows in the `Better Logic Library` Flow folder and the `BLL Test Number`, `BLL Test Text`, and `BLL Test Boolean` variables. Run the Flows sequentially because they share these variables.
- Reuse the `BLL Test Boolean` and `BLL Test Pair True` BitFlip devices, `BLL Test Number` NumSlide device, and `BLL Test Trigger` Trigger device in the `Better Logic Library` zone. The `Test - Device variable synchronization` Advanced Flow exercises their synchronization.
- Keep the `BLLTestDouble` custom function and `BLLTestDate` custom date format as fixtures for the `Test - Settings fixtures and variable properties` Advanced Flow.
- Check the individual results in Simple (Sys) Log under `Better Logic Library`; a triggered Flow or a `DONE` message alone does not establish that every scenario passed.
- Reuse `Test - Trigger boundaries and sustained lifecycle` for numeric thresholds, same-value updates, typed any-variable tokens, and sustained-condition isolation. Drive its shared variables sequentially; verify exact event counts, cancellation and rearming, then restore their original values to stop repeating timers.
- Reuse `Test - Auto variable lifecycle` when testing automatic creation and removal. Add only its isolated `BLL Test Lifecycle Number`, `BLL Test Lifecycle Text`, and `BLL Test Lifecycle Boolean` references; remove those references afterward and verify their variables disappear. Never use existing variables for removal tests.
