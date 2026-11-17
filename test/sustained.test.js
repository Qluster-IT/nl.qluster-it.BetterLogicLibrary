'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const { BL } = require('betterlogiclibrary');

BL._ = require('../assets/js/lodash.min.js');

async function createSustained(execute = 'every_time', legacy = false) {
  const filename = path.resolve(__dirname, '..', 'lib', 'flow', 'FlowCardTriggerFactory.js');
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  m.require = function (id) {
    if (['homey', '../util/math.js', '../util/util.js'].includes(id)) return {};
    return Module.prototype.require.call(this, id);
  };
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  const factory = m.exports;
  const timers = new Map();
  const cards = new Map();
  const listeners = new Map();
  const states = [];
  const saved = new Map();
  const variable = { name: 'temperature', type: 'number', value: 10, lastChangedTick: Date.now() };
  const variables = [variable];
  const removed = [];
  const errors = [];
  let args = [{
    variable: { name: variable.name }, condition: 'greater_than', value: 5,
    time: 30, unit: 'seconds', execute
  }];
  let sequence = 0;
  let triggered = 0;
  const homey = {
    platform: 'local',
    platformVersion: legacy ? 1 : 2,
    manifest: { flow: { triggers: [{ id: 'variable_number_sustained', args: [{ name: 'variable', type: 'autocomplete' }] }] } },
    log() {},
    error(...args) { errors.push(args); },
    settings: {
      get() {},
      unset() {},
      set(key, value) { saved.set(key, JSON.parse(JSON.stringify(value))); }
    },
    setTimeout(callback, delay) {
      const id = ++sequence;
      const handle = { [Symbol.toPrimitive]: () => id };
      timers.set(id, { handle, callback, delay });
      return handle;
    },
    clearTimeout(handle) {
      assert.equal(typeof handle, 'object', 'Homey must receive its original timer handle');
      assert.equal(timers.get(+handle)?.handle, handle);
      timers.delete(+handle);
    },
    flow: {
      getTriggerCard(id) {
        if (!cards.has(id)) {
          const card = new EventEmitter();
          card.registerRunListener = listener => { listeners.set(id, listener); return card; };
          card.getArgument = () => ({ registerAutocompleteListener() {} });
          card.getArgumentValues = async () => id === 'variable_number_sustained' ? args : [];
          card.trigger = async (tokens, state) => { triggered++; states.push(state); };
          cards.set(id, card);
        }
        return cards.get(id);
      }
    }
  };
  factory.CreateFlowCardTriggers({
    homey, getVariables: () => variables,
    getVariable: name => variables.find(x => x.name === name),
    addVariable: (name, type) => {
      variables.unshift({ name, type, auto: true });
      return new Promise(() => {});
    },
    removeVariable: name => {
      removed.push(name);
      variables.splice(variables.findIndex(x => x.name === name), 1);
      return new Promise(() => {});
    }
  });
  await new Promise(resolve => setImmediate(resolve));
  return {
    factory, timers, saved, variable, variables, removed, errors, cards, listeners, states,
    triggered: () => triggered,
    removeArguments: () => { args = []; },
    fire() {
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      return timer.callback();
    }
  };
}

test('cancelled sustained timers release the original Homey handles across repeated changes', async () => {
  const { factory, timers, variable, saved } = await createSustained();
  assert.equal(timers.size, 1);
  for (let i = 0; i < 100; i++) {
    variable.value = 0;
    factory.updateSustained(variable);
    assert.equal(timers.size, 0);
    variable.value = 10;
    factory.updateSustained(variable);
    assert.equal(timers.size, 1);
  }
  const state = saved.get('Sustained_number').variables.temperature.sustained[0];
  assert.equal(typeof state.timeoutId, 'number');
});

test('legacy Homeys reconcile missing removal notifications once per day and stop on shutdown', async () => {
  const fixture = await createSustained('every_time', true);
  fixture.variable.value = 0;
  fixture.factory.updateSustained(fixture.variable);
  assert.equal(fixture.timers.size, 1);
  assert.equal([...fixture.timers.values()][0].delay, 24 * 60 * 60 * 1000);
  fixture.variable.auto = true;
  fixture.variables.unshift(
    { name: 'unused1', type: 'number', auto: true },
    { name: 'unused2', type: 'number', auto: true },
    { name: 'manual', type: 'number', value: 3 }
  );
  fixture.removeArguments();
  assert.deepEqual(fixture.removed, []);
  await fixture.fire();
  assert.deepEqual(fixture.removed, ['unused1', 'unused2', 'temperature']);
  assert.deepEqual(fixture.variables.map(x => x.name), ['manual']);
  assert.deepEqual(fixture.errors, []);
  assert.equal(fixture.timers.size, 1);
  assert.equal([...fixture.timers.values()][0].delay, 24 * 60 * 60 * 1000);
  fixture.factory.destroy();
  assert.equal(fixture.timers.size, 0);
});

test('legacy reference refresh reports failures and retries on the next daily interval', async () => {
  const fixture = await createSustained('every_time', true);
  fixture.variable.value = 0;
  fixture.variable.auto = true;
  fixture.factory.updateSustained(fixture.variable);
  const failure = new Error('Flow arguments unavailable');
  fixture.cards.get('variable_number_sustained').getArgumentValues = async () => { throw failure; };
  await fixture.fire();
  assert.equal(fixture.errors[0][1], failure);
  assert.deepEqual(fixture.removed, []);
  assert.equal(fixture.timers.size, 1);
  assert.equal([...fixture.timers.values()][0].delay, 24 * 60 * 60 * 1000);
  fixture.factory.destroy();
  assert.equal(fixture.timers.size, 0);
});

test('automatic variables of different types do not wait for another variable token setup', async () => {
  const fixture = await createSustained();
  fixture.factory.cards.number = { type: 'number', names: ['new number'] };
  fixture.factory.cards.string = { type: 'string', names: ['new text'] };
  await fixture.factory.setVariablesFromArguments();
  assert.equal(fixture.variables.find(variable => variable.name === 'new number').type, 'number');
  assert.equal(fixture.variables.find(variable => variable.name === 'new text').type, 'string');
  assert.deepEqual(fixture.errors, []);
});

test('daily reconciliation preserves referenced auto variables and cannot rearm after shutdown during a read', async () => {
  const fixture = await createSustained('every_time', true);
  fixture.variable.value = 0;
  fixture.variable.auto = true;
  fixture.factory.updateSustained(fixture.variable);
  let finishRead;
  fixture.cards.get('variable_number_sustained').getArgumentValues =
    () => new Promise(resolve => { finishRead = resolve; });
  const refresh = fixture.fire();
  fixture.factory.destroy();
  finishRead([{ variable: { name: fixture.variable.name } }]);
  await refresh;
  assert.deepEqual(fixture.removed, []);
  assert.equal(fixture.timers.size, 0);
});

test('daily reconciliation skips argument reads when there are no automatic variables', async () => {
  const fixture = await createSustained('every_time', true);
  fixture.variable.value = 0;
  fixture.factory.updateSustained(fixture.variable);
  fixture.cards.get('variable_number_sustained').getArgumentValues =
    async () => { throw new Error('Unnecessary argument read'); };
  await fixture.fire();
  assert.deepEqual(fixture.errors, []);
  assert.deepEqual(fixture.removed, []);
  assert.equal(fixture.timers.size, 1);
  fixture.factory.destroy();
});

test('sustained trigger state selects only its matching variable and execution mode', async () => {
  const fixture = await createSustained('one_time');
  fixture.fire();
  const listener = fixture.listeners.get('variable_number_sustained');
  const args = {
    variable: { name: fixture.variable.name }, condition: 'greater_than', value: 5,
    time: 30, unit: 'seconds', execute: 'one_time'
  };
  const state = fixture.states[0];
  assert.equal(await listener(args, state), true);
  assert.equal(await listener({ ...args, execute: 'every_time' }, state), false);
  assert.equal(await listener({ ...args, value: 6 }, state), false);
  assert.equal(await listener({ ...args, variable: { name: 'other' } }, state), false);
  assert.equal(await listener(args, { ...state, variable: undefined }), false);
});

test('repeating timers and removed sustained Flow arguments release their handles', async () => {
  const fixture = await createSustained();
  for (let i = 0; i < 5; i++) {
    fixture.fire();
    assert.equal(fixture.triggered(), i + 1);
    assert.equal(fixture.timers.size, 1);
  }
  fixture.removeArguments();
  fixture.cards.get('variable_number_sustained').emit('update');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(fixture.timers.size, 0);
  assert.deepEqual(fixture.saved.get('Sustained_number').variables, {});
});

test('one-time sustained timers fire once and can be rearmed after the condition resets', async () => {
  const fixture = await createSustained('one_time');
  fixture.fire();
  assert.equal(fixture.triggered(), 1);
  assert.equal(fixture.timers.size, 0);
  fixture.factory.updateSustained(fixture.variable);
  assert.equal(fixture.timers.size, 0);
  fixture.variable.value = 0;
  fixture.factory.updateSustained(fixture.variable);
  fixture.variable.value = 10;
  fixture.variable.lastChangedTick = Date.now() + 1;
  fixture.factory.updateSustained(fixture.variable);
  assert.equal(fixture.timers.size, 1);
  fixture.fire();
  assert.equal(fixture.triggered(), 2);
});
