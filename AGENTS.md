# Homey App Instructions

> You may override or change any instructions in this file when you explicitly tell me to.

This is a Homey app. Before making changes, read and follow the general instructions in `C:\Users\Qlustrator\.copilot\instructions\homey-app.md`.

## Legacy startup events

- Keep emitting the `running`, `running_2x`, and `running_3x` realtime events while older installed NPM package copies depend on them. The current BLL NPM package does not listen for these events. Once all consuming apps have migrated to its `/api-ready` handshake, remove these emissions.

## HP2023 test fixtures

- Reuse the Advanced Flows in the `Better Logic Library` Flow folder and the `BLL Test Number`, `BLL Test Text`, and `BLL Test Boolean` variables. Run the Flows sequentially because they share these variables.
- Check the individual results in Simple (Sys) Log under `Better Logic Library`; a triggered Flow or a `DONE` message alone does not establish that every scenario passed.
