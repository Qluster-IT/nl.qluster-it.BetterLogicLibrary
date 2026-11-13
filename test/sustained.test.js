'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const { BL } = require('betterlogiclibrary');

BL._ = require('../assets/js/lodash.min.js');

async function createSustained(execute = 'every_time') {
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
  const saved = new Map();
  const variable = { name: 'temperature', type: 'number', value: 10, lastChangedTick: Date.now() };
  let args = [{
    variable: { name: variable.name }, condition: 'greater_than', value: 5,
    time: 30, unit: 'seconds', execute
  }];
  let sequence = 0;
  let triggered = 0;
  const homey = {
    manifest: { flow: {} },
    log() {},
    settings: {
      get() {},
      unset() {},
      set(key, value) { saved.set(key, JSON.parse(JSON.stringify(value))); }
    },
    setTimeout(callback) {
      const id = ++sequence;
      const handle = { [Symbol.toPrimitive]: () => id };
      timers.set(id, { handle, callback });
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
          card.registerRunListener = () => card;
          card.getArgument = () => ({ registerAutocompleteListener() {} });
          card.getArgumentValues = async () => id === 'variable_number_sustained' ? args : [];
          card.trigger = async () => { triggered++; };
          cards.set(id, card);
        }
        return cards.get(id);
      }
    }
  };
  factory.CreateFlowCardTriggers({
    homey, getVariables: () => [variable],
    getVariable: () => variable
  });
  await new Promise(resolve => setImmediate(resolve));
  return {
    factory, timers, saved, variable, cards,
    triggered: () => triggered,
    removeArguments: () => { args = []; },
    fire() {
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      timer.callback();
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
