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

test('a variables download that cannot be generated is logged for every file type', async t => {
  const filename = require.resolve('../api');
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  m.require = id => id === './lib/variablemanager.js' ? {} : Module.prototype.require.call(m, id);
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  const timers = [];
  const errors = [];
  const homey = {
    app: {
      exportsSettings: { csvFilename: 'vars', jsonFilename: 'vars', xlsxFilename: 'vars' },
      getVariables: async () => { throw new Error('settings unavailable'); }
    },
    api: { realtime() {} },
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
