'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const Module = require('node:module');
const test = require('node:test');
const { BL } = require('betterlogiclibrary');

test('locale-codes is loaded only when a locale list is requested', async () => {
  const required = [];
  const load = file => {
    const filename = require.resolve(file);
    const m = new Module(filename, module);
    m.filename = filename;
    m.paths = module.paths;
    m.require = id => {
      required.push(id);
      if (id === 'homey') return { App: class {} };
      if (id === './lib/variablemanager.js' || id === './lib/FileServer.js') return {};
      return Module.prototype.require.call(m, id);
    };
    m._compile(fs.readFileSync(filename, 'utf8'), filename);
    return m.exports;
  };
  load('../app');
  const api = load('../api');
  assert.ok(!required.includes('locale-codes'), 'locale-codes is required at startup');

  const locales = await api.getLocales({});
  assert.ok(locales.some(l => l.tag === 'nl-NL' && l.name));
});

test('a startup failure is logged and reported in a notification', async () => {
  const filename = require.resolve('../app');
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  m.require = id => {
    if (id === 'homey') return { App: class {} };
    if (id === './lib/variablemanager.js' || id === './lib/FileServer.js') return {};
    return Module.prototype.require.call(m, id);
  };
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  const failure = new Error('startup failure');
  const errors = [];
  const notifications = [];
  const app = new m.exports();
  app.homey = { notifications: { createNotification: async notification => { notifications.push(notification); } } };
  app.log = () => { throw failure; };
  app.error = (...args) => errors.push(args);

  await app.onInit();

  assert.equal(app.apiReady, false);
  assert.equal(errors[0]?.[1], failure);
  assert.deepEqual(notifications, [{ excerpt: 'Error while starting the app:startup failure' }]);
});

test('Excel variable export preserves the original generator error instead of replacing it or returning empty data', async () => {
  const filename = require.resolve('../app');
  const m = new Module(filename, module);
  const failure = new Error('Excel cells cannot contain more than 32767 characters');
  const errors = [];
  const homey = {
    __: key => key,
    app: { exportsSettings: {} },
    error: error => errors.push(error)
  };
  const library = {
    _: require('../assets/js/lodash.min.js'),
    homey,
    json: { exports: {}, toExcel: async () => { throw failure; } }
  };
  m.filename = filename;
  m.paths = module.paths;
  m.require = id => {
    if (id === 'homey') return { App: class {} };
    if (id === 'betterlogiclibrary') return { BL: library };
    if (id === './lib/variablemanager.js') return { getVariables: async () => [] };
    if (id === './lib/FileServer.js') return {};
    return Module.prototype.require.call(m, id);
  };
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  const app = new m.exports();
  app.homey = homey;
  for (const returnType of ['xlsx', 'xlsx_base64']) {
    await assert.rejects(app.getVariables({ returnType }), error => error === failure);
  }
  assert.deepEqual(errors, [failure, failure]);
});

test('the api-ready endpoint reflects the startup lifecycle', async () => {
  const filename = require.resolve('../api');
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  m.require = id => id === './lib/variablemanager.js' ? {} : Module.prototype.require.call(m, id);
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  const { getApiReady } = m.exports;
  const homey = { app: { apiReady: false } };

  assert.deepEqual(await getApiReady({ homey }), { ready: false });
  homey.app.apiReady = true;
  assert.deepEqual(await getApiReady({ homey }), { ready: true });
  homey.app.apiReady = undefined;
  assert.deepEqual(await getApiReady({ homey }), { ready: false });
});

test('JSON variable downloads stream a row snapshot while ordinary and Base64 exports retain their formats', async () => {
  const filename = require.resolve('../app');
  const m = new Module(filename, module);
  const variables = [{ name: 'Example', value: 'caf\u00e9', type: 'string' }];
  const previous = BL.submodules;
  BL.submodules = { json2csv: {} };
  let Json;
  try { Json = require('../bll/json'); } finally { BL.submodules = previous; }
  const homey = { __: key => key, app: {}, error: assert.fail };
  const library = { _: require('../assets/js/lodash.min.js'), homey, json: Json };
  m.filename = filename;
  m.paths = module.paths;
  m.require = id => {
    if (id === 'homey') return { App: class {} };
    if (id === 'betterlogiclibrary') return { BL: library };
    if (id === './lib/variablemanager.js') return { getVariables: async () => variables };
    if (id === './lib/FileServer.js') return {};
    return Module.prototype.require.call(m, id);
  };
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  const app = new m.exports();
  app.homey = homey;
  const expected = JSON.stringify(variables);
  assert.equal(await app.getVariables({ returnType: 'json' }), expected);
  assert.equal(Buffer.from(await app.getVariables({ returnType: 'json_base64', streamJson: true }), 'base64').toString(), expected);
  const stream = await app.getVariables({ returnType: 'json', streamJson: true });
  variables[0].value = 'updated while uploading';
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  assert.equal(Buffer.concat(chunks).toString('utf8'), expected);
});

test('a variables download that cannot be generated is logged for every file type', async t => {
  const filename = require.resolve('../api');
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  m.require = id => id === './lib/variablemanager.js' ? {} : Module.prototype.require.call(m, id);
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  const timers = [];
  const errors = [];
  const realtime = [];
  const homey = {
    app: {
      exportsSettings: { csvFilename: 'vars', jsonFilename: 'vars', xlsxFilename: 'vars' },
      getVariables: async () => { throw new Error('settings unavailable'); }
    },
    api: { realtime: (event, data) => realtime.push([event, data]) },
    setTimeout: callback => timers.push(callback),
    error: (...args) => errors.push(args)
  };
  t.mock.method(BL, 'decode', async name => name);
  t.mock.method(BL, 'getDownloadUrl', async () => ({ token: 'download' }));
  for (const returnType of ['csv', 'xlsx', 'json']) {
    assert.deepEqual(await m.exports.getVariablesDownloadUrl({ homey, params: { returnType } }), { token: 'download' });
    await timers.shift()();
  }
  assert.deepEqual(errors.map(([message, error]) => [message, error.message]), [
    ['Variables download (csv) could not be generated', 'settings unavailable'],
    ['Variables download (xlsx) could not be generated', 'settings unavailable'],
    ['Variables download (json) could not be generated', 'settings unavailable']
  ]);
  assert.deepEqual(realtime, Array(3).fill(['downloadFileFailed', { token: 'download', message: 'settings unavailable' }]));
});

test('variable download links request streaming formats and still support buffered content', async t => {
  const filename = require.resolve('../api');
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  m.require = id => id === './lib/variablemanager.js' ? {} : Module.prototype.require.call(m, id);
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  const timers = [];
  const { Readable } = require('node:stream');
  const stream = Readable.from([Buffer.from('PK')]);
  const payloads = { csv: 'name,value\n', xlsx: stream, json: '[]' };
  const homey = {
    app: {
      exportsSettings: { csvFilename: 'vars', xlsxFilename: 'vars', jsonFilename: 'vars' },
      getVariables: async ({ returnType, streamExcel, streamJson, streamCsv }) => {
        assert.equal(Boolean(streamExcel), returnType.startsWith('xlsx'));
        assert.equal(streamJson, returnType === 'json');
        assert.equal(streamCsv, returnType === 'csv');
        return payloads[returnType];
      }
    },
    api: { realtime() {} },
    setTimeout: callback => timers.push(callback),
    error: (...args) => assert.fail(String(args))
  };
  t.mock.method(BL, 'decode', async name => name);
  const link = { token: 'download' };
  t.mock.method(BL, 'getDownloadUrl', async () => link);
  const uploaded = [];
  t.mock.method(BL, 'setDownloadUrl', async options => uploaded.push(options));
  for (const returnType of Object.keys(payloads)) {
    await m.exports.getVariablesDownloadUrl({ homey, params: { returnType } });
    await timers.shift()();
  }
  assert.deepEqual(uploaded.map(({ callback, ...options }) => options),
    [{ link, text: payloads.csv }, { link, stream }, { link, text: payloads.json }]);
});

test('unsupported exports and link creation failures reject instead of returning success', async t => {
  const filename = require.resolve('../api');
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  m.require = id => id === './lib/variablemanager.js' ? {} : Module.prototype.require.call(m, id);
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  const errors = [];
  const homey = {
    app: { exportsSettings: { csvFilename: 'vars', jsonFilename: 'vars', xlsxFilename: 'vars' } },
    error: (...args) => errors.push(args),
    __: key => key
  };
  t.mock.method(BL, 'decode', async name => name);
  const failure = new Error('file server unavailable');
  const reserve = t.mock.method(BL, 'getDownloadUrl', async () => { throw failure; });
  for (const returnType of ['invalid', 'csv_base64', 'xlsx_base64', 'json_base64']) {
    await assert.rejects(m.exports.getVariablesDownloadUrl({ homey, params: { returnType } }), /Unsupported export format/);
  }
  assert.equal(reserve.mock.callCount(), 0);
  for (const returnType of ['csv', 'xlsx', 'json']) {
    await assert.rejects(m.exports.getVariablesDownloadUrl({ homey, params: { returnType } }), error => error === failure);
  }
  assert.equal(errors.length, 7);
});

for (const name of ['dateTime', 'number', 'json']) {
  test(`${name} removes its own realtime listener when the bridge API is cleared or replaced`, async () => {
    for (const replacement of [null, new EventEmitter()]) {
      const api = new EventEmitter();
      BL._ = require('../assets/js/lodash.min.js');
      BL._current = { api };
      BL._L = { clearObj(object) { for (const key of Object.keys(object)) delete object[key]; } };
      BL.homey = {
        log() {}, clock: { getTimezone: () => 'UTC' },
        i18n: { getLanguage: async () => 'en-US' }
      };
      BL.submodules = { 'write-excel-file-min': () => {}, json2csv: {} };
      const filename = require.resolve(`../bll/${name}`);
      delete require.cache[filename];
      const library = require(filename);
      await library.init({ get: async () => ({ default: 'en-US' }) });
      assert.equal(api.listenerCount('realtime'), 1);
      BL._current.api = replacement;
      library.destroy();
      assert.equal(api.listenerCount('realtime'), 0);
      if (replacement) assert.equal(replacement.listenerCount('realtime'), 0);
    }
  });
}
