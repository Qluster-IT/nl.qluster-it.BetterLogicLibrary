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

test('library delivery explicitly rejects unavailable and unknown modules', async () => {
  const app = createApp();
  for (const name of ['coding', 'not-a-library']) {
    await assert.rejects(app.getLibrary(name), /Unsupported library/);
  }
  assert.match((await app.getLibrary('number')).file, /module\.exports/);
});

function createExpressionCards() {
  const bridge = {};
  const actions = new Map();
  const conditions = new Map();
  const updates = [];
  const requests = [];
  function card(listeners, id) {
    return {
      registerRunListener(listener) { listeners.set(id, listener); return this; },
      getArgument() { return this; },
      registerAutocompleteListener() { return this; }
    };
  }
  const variableManager = {
    homey: {
      flow: {
        getActionCard: id => card(actions, id),
        getConditionCard: id => card(conditions, id)
      },
      __: key => key
    },
    getVariable: name => ({ name, value: 4 }),
    updateVariable: async (name, value, type) => { updates.push({ name, value, type }); return true; }
  };
  for (const kind of ['Action', 'Condition', 'Trigger']) {
    const filename = path.resolve(__dirname, '..', 'lib', 'flow', `FlowCard${kind}Factory.js`);
    const m = new Module(filename, module);
    m.filename = filename;
    m.paths = module.paths;
    m.require = function (id) {
      requests.push(id);
      if (id === 'homey') return {};
      if (id === 'betterlogiclibrary') return { BL: bridge };
      if (id === '../util/util.js') {
        return { buildExpression: expression => expression.replaceAll('$input$', '4') };
      }
      return Module.prototype.require.call(this, id);
    };
    m._compile(fs.readFileSync(filename, 'utf8'), filename);
    if (kind !== 'Trigger') m.exports[`CreateFlowCard${kind}s`](variableManager);
  }
  return { bridge, actions, conditions, updates, requests };
}

test('flow factories register without loading a second mathjs bundle', () => {
  const { requests } = createExpressionCards();
  assert.equal(requests.includes('../util/math.js'), false);
});

async function createFormatCards(t, json) {
  const actions = new Map();
  const card = id => ({
    registerRunListener(listener) { actions.set(id, listener); return this; },
    getArgument() { return this; },
    registerAutocompleteListener() { return this; }
  });
  const app = createApp();
  app.log = () => {};
  app.error = () => {};
  app.setExports = async () => {};
  app.initFileServerFromSettings = async () => {};
  app.setFunctions = async () => {};
  app.homey = {
    settings: { get: async key => key === 'locale' ? { default: 'en-US' } : true, on() {} },
    clock: { getTimezone: () => 'UTC' },
    flow: { getActionCard: card },
    api: { realtime: async () => {} },
    setTimeout() {},
    log() {},
    error() {}
  };
  const previousHomey = BL.homey;
  const previousJson = BL._json;
  t.after(() => { BL.homey = previousHomey; BL.json = previousJson; });
  t.mock.method(BL, 'init', async () => { BL.homey = app.homey; });
  BL.json = json;

  await app.onInit();
  assert.equal(app.apiReady, true);
  return actions;
}

test('CSV formatting returns UTF-8 base64 for the same CSV as the plain format', async t => {
  const csv = 'name,value\ncaf\u00e9,\ud83d\ude0a';
  const format = (await createFormatCards(t, { toCsv: async () => csv })).get('format_json_csv');
  const args = { json: '[{"name":"caf\u00e9","value":"\ud83d\ude0a"}]', unwindArrays: false, expandArrayObjects: false };
  assert.deepEqual(await format({ ...args, returnType: 'csv' }), { result: csv });
  const encoded = await format({ ...args, returnType: 'csv_base64' });
  assert.deepEqual(encoded, { result: Buffer.from(csv, 'utf8').toString('base64') });
  assert.equal(Buffer.from(encoded.result, 'base64').toString('utf8'), csv);
});

test('Excel Flow passes ordinary JSON rows through but preserves the legacy path for numeric keys', async t => {
  const calls = [];
  const format = (await createFormatCards(t, {
    toExcel: async (rows, options) => {
      calls.push({ rows, options });
      return options.outputBase64 ? 'UEs=' : Uint8Array.of(80, 75);
    }
  })).get('format_json_xlsx');
  assert.deepEqual(await format({ json: '[{"name":"first"},{"active":false}]', returnType: 'xlsx_base64' }), { result: 'UEs=' });
  assert.deepEqual(calls[0].rows, [{ name: 'first' }, { active: false }]);
  assert.deepEqual(calls[0].options.objectKeys, ['name', 'active']);
  assert.equal(calls[0].options.outputBase64, true);
  await format({ json: '[{"name":"first"},{"0":"second"}]', returnType: 'xlsx_base64' });
  assert.equal(calls[1].options.objectKeys, undefined);
  assert.deepEqual(calls[1].rows.map(row => row.map(cell => cell?.value)), [['0', 'Name'], ['first'], ['second', undefined]]);
});

test('math expression cards share VM imports and preserve results and errors', async () => {
  const { bridge, actions, conditions, updates } = createExpressionCards();
  bridge.math = require('../lib/util/math.js').create();
  const app = createApp({ math: bridge.math });
  app.runSandBox('math.import({ scaled: value => value * 3, failCalculation: () => { throw new Error("calculation failed"); } })');

  assert.equal(await actions.get('execute_expression')({ variable: { name: 'output' }, expression: 'scaled($input$) + 1' }), true);
  assert.deepEqual(updates, [{ name: 'output', value: 13, type: 'number' }]);
  assert.equal(await conditions.get('expression')({ expression: 'scaled($input$) == 12' }), true);
  assert.equal(await conditions.get('expression')({ expression: 'scaled($input$) == 13' }), false);
  await assert.rejects(actions.get('execute_expression')({ variable: { name: 'output' }, expression: 'failCalculation()' }), /Error executing expression: calculation failed/);
  await assert.rejects(conditions.get('expression')({ expression: 'failCalculation()' }), /calculation failed/);
  assert.equal(updates.length, 1);
});

test('math expression cards observe shared configuration changes after registration', async () => {
  const { bridge, actions, conditions, updates } = createExpressionCards();
  bridge.math = require('../lib/util/math.js').create();
  const app = createApp({ math: bridge.math });
  app.runSandBox('math.config({ number: "BigNumber", precision: 80 })');

  await actions.get('execute_expression')({ variable: { name: 'output' }, expression: '0.1 + 0.2' });
  assert.equal(updates[0].value.isBigNumber, true);
  assert.equal(updates[0].value.toString(), '0.3');
  assert.equal((await conditions.get('expression')({ expression: '1 + 1' })).isBigNumber, true);
  app.runSandBox('math.config({ number: "number" })');
  assert.equal(await conditions.get('expression')({ expression: '1 + 1' }), 2);
});

test('remote express failures return the expression in silent mode and throw otherwise', async () => {
  const { BLL } = require('../bll/bll.js');
  const previous = BL._L;
  const failure = new Error('Better Logic is not installed or running.');
  const current = { post: async () => { throw failure; } };
  BL._L = { Current: current };
  try {
    current.silent = true;
    assert.equal(await BLL.prototype.express.call(current, '1 + 1'), '1 + 1');
    current.silent = false;
    await assert.rejects(BLL.prototype.express.call(current, '1 + 1'), error => error === failure);
  } finally {
    BL._L = previous;
  }
});

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

test('decode resolves codings that return promises instead of inserting {}', async () => {
  const app = createApp({ later: async value => value * 2, fail: async () => { throw new Error('boom'); } });
  assert.equal(await app.runCoding({ text: 'a {[later(2)]} b {[later(2)]} {[1 + 1]} {[[1, 2]]}' }), 'a 4 b 4 2 1,2');
  assert.equal(await app.runCoding({ text: 'x {[fail()]} {[later(1)]}' }), 'x {[fail()]} {[later(1)]}');
  assert.equal(typeof app.runCoding({ text: '{[1 + 1]}' }), 'string', 'synchronous codings stay synchronous');
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
