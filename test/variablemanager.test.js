'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');

const flush = () => new Promise(resolve => setImmediate(resolve));

function createHomey({ variables = [] } = {}) {
  const settings = new Map([['variables', variables]]);
  const settingListeners = [];
  const registeredTokens = new Map();
  const logs = new Map();
  const calls = { getLog: 0, createLog: 0, entries: [], deleted: [] };
  const homey = {
    settings: {
      get: key => settings.get(key),
      set: (key, value) => { settings.set(key, value); for (const fn of settingListeners) fn(key); },
      on: (event, fn) => settingListeners.push(fn)
    },
    flow: {
      getToken: async name => {
        if (!registeredTokens.has(name)) throw new Error('not found');
        return registeredTokens.get(name);
      },
      createToken: async name => {
        const token = { id: name, values: [], setValue: async value => { token.values.push(value); }, unregister: async () => registeredTokens.delete(name) };
        registeredTokens.set(name, token);
        return token;
      },
      getTriggerCard: () => ({ trigger: async () => {} })
    },
    insights: {
      getLog: async name => {
        calls.getLog++;
        if (!logs.has(name)) throw new Error('not found');
        return logs.get(name);
      },
      createLog: async name => {
        calls.createLog++;
        const log = { name, createEntry: async value => { if (!logs.has(name) || logs.get(name) !== log) throw new Error('log deleted'); calls.entries.push(value); } };
        logs.set(name, log);
        return log;
      },
      getLogs: async () => [...logs.values()],
      deleteLog: async log => { calls.deleted.push(log.name); logs.delete(log.name); }
    },
    api: { realtime() {} },
    notifications: { createNotification: async () => {} },
    error() {}
  };
  return { homey, calls, logs, registeredTokens };
}

function loadVariableManager() {
  const filename = path.resolve(__dirname, '..', 'lib', 'variablemanager.js');
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  m.require = id => {
    if (id === 'homey') return {};
    if (id === 'betterlogiclibrary') return { BL: { datetime: { toString: () => '' }, _: require('../assets/js/lodash.min.js') } };
    if (id.startsWith('./flow/')) return { CreateFlowCardActions() {}, CreateFlowCardConditions() {}, CreateFlowCardTriggers: () => ({ updateSustained() {} }) };
    if (id === './util/util.js') return {};
    return Module.prototype.require.call(m, id);
  };
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  return m.exports;
}

test('an already registered token is tracked once, so a variable update sets it once', async () => {
  const { homey, registeredTokens } = createHomey({ variables: [{ name: 'counter', type: 'number', value: 1 }] });
  const token = await homey.flow.createToken('counter');
  const manager = loadVariableManager();
  manager.init(homey);
  await flush();
  manager.init(homey);
  await flush();
  await manager.updateVariable('counter', 2, 'number');
  assert.equal(registeredTokens.get('counter'), token);
  assert.equal(token.values.filter(value => value === 2).length, 1);
});

test('number updates reuse the Insights log and recover when it was deleted elsewhere', async () => {
  const { homey, calls, logs } = createHomey();
  const manager = loadVariableManager();
  manager.init(homey);
  await manager.addVariable('power', 'number', 1);
  for (const value of [2, 3, 4]) await manager.updateVariable('power', value, 'number');
  assert.equal(calls.getLog + calls.createLog, 2, 'one failed lookup and one creation, then cached');
  assert.deepEqual(calls.entries, [1, 2, 3, 4]);

  logs.delete('power');
  await manager.updateVariable('power', 5, 'number');
  assert.deepEqual(calls.entries, [1, 2, 3, 4, 5]);
  assert.equal(calls.createLog, 2);
});

test('delete all removes every Insights log through the promise API', async () => {
  const { homey, calls, logs } = createHomey();
  const manager = loadVariableManager();
  manager.init(homey);
  await manager.addVariable('a', 'number', 1);
  await manager.addVariable('b', 'number', 2);
  homey.settings.set('deleteall', true);
  await flush();
  assert.deepEqual(calls.deleted.sort(), ['a', 'b']);
  assert.equal(logs.size, 0);
  assert.deepEqual(manager.getVariables(), []);
  await manager.addVariable('a', 'number', 3);
  assert.equal(calls.entries.at(-1), 3);
  assert.deepEqual(homey.settings.get('variables').map(variable => variable.name), ['a'], 'deleted variables must not be saved back');
});

test('import validates the entire input before changing existing variables', async () => {
  const { homey } = createHomey();
  const manager = loadVariableManager();
  manager.init(homey);
  await manager.addVariable('existing', 'number', 7);
  await assert.rejects(manager.importVariables([
    { name: 'new', type: 'number', value: 1 },
    { name: 'bad', type: 'number', value: null }
  ]), /Invalid value/);
  await assert.rejects(manager.importVariables([
    { name: 'duplicate', type: 'string', value: '' },
    { name: 'duplicate', type: 'boolean', value: true }
  ]), /unique/);
  assert.deepEqual(manager.getVariables().map(({ name, value }) => ({ name, value })), [{ name: 'existing', value: 7 }]);
});

test('import replaces cached variables and cleans up old tokens and insights before recreating names', async () => {
  const { homey, logs, registeredTokens } = createHomey();
  const manager = loadVariableManager();
  manager.init(homey);
  await manager.addVariable('same', 'number', 1);
  await manager.addVariable('old', 'number', 2);
  const oldToken = registeredTokens.get('same');
  await manager.importVariables([
    { name: 'same', type: 'boolean', value: true },
    { name: 'new', type: 'string', value: '' }
  ]);
  assert.deepEqual(manager.getVariables().map(({ name, type, value }) => ({ name, type, value })).sort((a, b) => a.name.localeCompare(b.name)), [
    { name: 'new', type: 'string', value: '' },
    { name: 'same', type: 'boolean', value: true }
  ]);
  assert.equal(registeredTokens.has('old'), false);
  assert.notEqual(registeredTokens.get('same'), oldToken);
  assert.equal(logs.has('same'), false);
  assert.equal(logs.has('old'), false);
  assert.deepEqual(homey.settings.get('variables'), manager.getVariables());
});

test('a second import cannot overlap an import already removing variables', async () => {
  const { homey, registeredTokens } = createHomey();
  const manager = loadVariableManager();
  manager.init(homey);
  await manager.addVariable('existing', 'number', 1);
  let release;
  const token = registeredTokens.get('existing');
  const unregister = token.unregister;
  token.unregister = async () => {
    await new Promise(resolve => { release = resolve; });
    await unregister();
  };
  const first = manager.importVariables([{ name: 'new', type: 'number', value: 2 }]);
  while (!release) await flush();
  await assert.rejects(manager.importVariables([]), /already in progress/);
  release();
  await first;
  assert.equal(manager.getVariable('new').value, 2);
});
