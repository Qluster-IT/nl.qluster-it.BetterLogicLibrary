'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createController() {
  let controller;
  let confirm;
  const calls = [];
  const homey = {
    __: value => value,
    confirm: (message, type, callback) => { confirm = callback; },
    api: (...args) => { calls.push(args); },
    get: (name, callback) => callback(null, []),
    set: (...args) => { calls.push(args); },
    alert: error => { calls.push(['alert', error]); }
  };
  const scope = { $apply: callback => callback() };
  const angular = {
    module: () => ({ controller: (name, definition) => { controller = definition.at(-1); } }),
    fromJson: JSON.parse
  };
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'settings', 'variableController.js'), 'utf8');
  vm.runInNewContext(source, { angular, _: require('../assets/js/lodash.min.js'), console, Date });
  const instance = new controller(scope, { init() {}, api() {} }, { Homey: homey }, {});
  return { instance, calls, confirm: value => confirm(null, value) };
}

test('cancelling variable import does not modify existing variables', () => {
  const { instance, calls, confirm } = createController();
  instance.variables = [{ name: 'existing', type: 'number', value: 7 }];
  instance.importJson = JSON.stringify([{ name: 'new', type: 'number', value: 1 }]);
  instance.import();
  assert.equal(calls.length, 0);
  confirm(false);
  assert.equal(calls.length, 0);
  assert.equal(instance.variables[0].name, 'existing');
});

test('confirmed variable import is sent to the app only after confirmation', () => {
  const { instance, calls, confirm } = createController();
  instance.importJson = JSON.stringify([{ name: 'new', type: 'number', value: 1 }]);
  instance.import();
  confirm(true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'POST');
  assert.equal(calls[0][1], '/importvariables');
  assert.equal(calls[0][2].variables[0].name, 'new');
});
