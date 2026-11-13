'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const { BL } = require('betterlogiclibrary');

BL._ = require('../assets/js/lodash.min.js');
BL.datetime = {
  toString: (format, date, locale, timeZone) => [format, date, locale, timeZone].join('|'),
  toTimeString: (format, timeMs, timeSec) => [format, timeMs, timeSec].join('|')
};
BL.number = { toString: (number, style, a, b, decimals, locale) => [number, locale].join('|') };

const filename = path.resolve(__dirname, '..', 'app.js');
const appModule = new Module(filename, module);
appModule.filename = filename;
appModule.paths = module.paths;
appModule.require = function (id) {
  if (id === 'homey') return { App: class {} };
  if (id === './lib/variablemanager.js' || id === './lib/FileServer.js') return {};
  return Module.prototype.require.call(this, id);
};
appModule._compile(fs.readFileSync(filename, 'utf8'), filename);
const App = appModule.exports;

function createApp(context = {}) {
  const app = new App();
  app.context = context;
  return app;
}

test('decode evaluates duplicate falsy and prototype-named expressions only once', () => {
  const app = createApp();
  for (const value of [0, false, '', null, undefined, NaN]) {
    const calls = [];
    app.runSandBox = code => { calls.push(code); return value; };
    const output = value === null ? 'null' : String(value);
    for (const code of ['zero()', 'constructor', 'toString', '__proto__']) {
      calls.length = 0;
      assert.equal(app.runCoding({ text: `{[${code}]} / {[${code}]}` }), `${output} / ${output}`);
      assert.deepEqual(calls, [code]);
    }
  }
});

test('decode preserves evaluation order, result conversion, escaping, and per-call freshness', () => {
  let calls = 0;
  const object = { value: 1 };
  const app = createApp({
    next: () => ++calls,
    object,
    array: [1, 2]
  });
  assert.equal(app.runCoding({
    text: '{[object]} {[object.value = 2]} {[array]} {[next()]} {[next()]} {{[next()]}}'
  }), '{"value":2} 2 1,2 1 1 {{[next()]}}');
  assert.equal(calls, 1);
  assert.equal(app.runCoding({ text: '{[next()]} {[next()]}' }), '2 2');
  assert.equal(calls, 2);
});

test('express preserves argument aliases and helper defaults without mutating caller properties', () => {
  const app = createApp();
  const properties = { value: 3, $other: 4, locale: 'nl-NL', timeZone: 'UTC', date: 'date', timeMs: 42, timeSec: 8 };
  const before = { ...properties };
  assert.equal(app.runSandBox('$value + $other', properties), 7);
  assert.equal(app.runSandBox('date("format")', properties), 'format|date|nl-NL|UTC');
  assert.equal(app.runSandBox('time("format")', properties), 'format|42|8');
  assert.equal(app.runSandBox('number(7)', properties), '7|nl-NL');
  assert.equal(app.runSandBox('\u2713 && !\u2a2f'), true);
  assert.deepEqual(properties, before);
});

test('express keeps globals isolated and preserves asynchronous results and errors', async () => {
  const app = createApp();
  assert.equal(app.runSandBox('globalThis.saved = $value; saved', { value: 5 }), 5);
  assert.equal(app.runSandBox('typeof saved'), 'undefined');
  assert.deepEqual(await Promise.all([
    app.runSandBox('Promise.resolve($value).then(value => number(value))', { value: 3, locale: 'nl-NL' }),
    app.runSandBox('Promise.resolve($value).then(value => number(value))', { value: 7, locale: 'en-US' })
  ]), ['3|nl-NL', '7|en-US']);
  assert.throws(() => app.runSandBox('const ='), /Unexpected token/);
  assert.throws(() => app.runSandBox('missingFunction()'), { name: 'ReferenceError' });
  await assert.rejects(app.runSandBox('Promise.reject(new Error("failure"))'), /failure/);
});
