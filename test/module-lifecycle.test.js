'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');
const { BL } = require('betterlogiclibrary');

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
