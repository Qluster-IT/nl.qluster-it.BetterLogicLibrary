'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');

function createApi(value = 7) {
  const updates = [];
  const variableManager = {
    getVariable: name => ({ name, type: 'number', value }),
    updateVariable: async (...args) => { updates.push(args); }
  };
  const filename = path.resolve(__dirname, '..', 'api.js');
  const apiModule = new Module(filename, module);
  apiModule.filename = filename;
  apiModule.paths = module.paths;
  apiModule.require = function (id) {
    if (id === './lib/variablemanager.js') return variableManager;
    return Module.prototype.require.call(this, id);
  };
  apiModule._compile(fs.readFileSync(filename, 'utf8'), filename);
  return { api: apiModule.exports, updates };
}

test('numeric variable API rejects non-finite and partial values without updating the variable', async () => {
  const { api, updates } = createApi();
  for (const value of ['not-a-number', 'Infinity', '-Infinity', '2oops', '1.2.3', '1e', '0x10', ' ', '1e309']) {
    await assert.rejects(api.setVariableAction({ params: { variable: 'test', action: 'increment', value } }), /Incorrect value for number/);
    await assert.rejects(api.setVariable({ params: { variable: 'test', value } }), /Incorrect value for number/);
  }
  assert.deepEqual(updates, []);
});

test('numeric variable API accepts complete decimal and exponent values', async () => {
  const { api, updates } = createApi();
  for (const value of ['0', '-2.5', '+.5', '1.', '1e2', ' -2.5E-1 ']) {
    await api.setVariable({ params: { variable: 'test', value } });
    await api.setVariableAction({ params: { variable: 'test', action: 'increment', value } });
  }
  assert.deepEqual(updates.map(x => x[1]), [0, 7, -2.5, 4.5, 0.5, 7.5, 1, 8, 100, 107, -0.25, 6.75]);
});

test('numeric variable API rejects arithmetic overflow and preserves valid operations', async () => {
  const overflow = createApi(Number.MAX_VALUE);
  await assert.rejects(overflow.api.setVariableAction({ params: { variable: 'test', action: 'increment', value: String(Number.MAX_VALUE) } }), /finite number/);
  assert.deepEqual(overflow.updates, []);

  const { api, updates } = createApi();
  await api.setVariableAction({ params: { variable: 'test', action: 'increment', value: '2' } });
  await api.setVariableAction({ params: { variable: 'test', action: 'd', value: '2' } });
  assert.deepEqual(updates, [['test', 9, 'number'], ['test', 5, 'number']]);
});
