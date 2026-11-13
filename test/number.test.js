'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');
const { BL } = require('betterlogiclibrary');
const NativeNumberFormat = Intl.NumberFormat;

async function createNumber(t) {
  BL._ = require('../assets/js/lodash.min.js');
  const api = new EventEmitter();
  BL._current = { api };
  BL._L = { clearObj(object) { for (const key of Object.keys(object)) delete object[key]; } };
  BL.homey = { log() {}, i18n: { getLanguage: async () => 'en-US' } };
  const filename = require.resolve('../bll/number');
  delete require.cache[filename];
  const NumberModule = require(filename);
  await NumberModule.init({ get: async () => ({ default: 'en-US' }) });
  t.after(() => NumberModule.destroy());
  return { NumberModule, api };
}

test('number formatters reuse configurations, not results, across styles and values', async t => {
  const { NumberModule } = await createNumber(t);
  let created = 0;
  t.mock.method(Intl, 'NumberFormat', function (...args) {
    created++;
    return new NativeNumberFormat(...args);
  });
  const cases = [
    ['decimal', undefined, undefined, 'nl-NL', { style: 'decimal' }],
    ['currency', 'EUR', 'name', 'de-DE', { style: 'currency', currency: 'EUR', currencyDisplay: 'name' }],
    ['unit', 'kilometer', 'long', 'en-GB', { style: 'unit', unit: 'kilometer', unitDisplay: 'long' }],
    ['decimal', 'compact_short', { id: 'noGrouping' }, 'en-US', { style: 'decimal', notation: 'compact', compactDisplay: 'short', useGrouping: false }],
    ['percent', undefined, undefined, 'ar-EG', { style: 'percent' }]
  ];
  for (const [style, option1, option2, locale, opts] of cases) {
    for (const value of [0, -0, -12.75, 1234.56, NaN, Infinity]) {
      assert.equal(NumberModule.toString(value, style, option1, option2, 2, locale),
        value.toLocaleString(locale, { ...opts, minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  }
  assert.equal(created, cases.length);
});

test('number formatting handles scientific notation and non-finite values with default precision', async t => {
  const { NumberModule } = await createNumber(t);
  for (const [value, digits] of [[1e-7, 7], [1.25e-7, 9], [-2.5e-8, 9], [1.25, 2], [NaN, 0], [Infinity, 0]]) {
    assert.equal(NumberModule.toString(value), value.toLocaleString('en-US', {
      style: 'decimal', minimumFractionDigits: digits, maximumFractionDigits: digits
    }));
  }
});

test('number formatting preserves complex arguments, native errors and custom receivers', async t => {
  const { NumberModule } = await createNumber(t);
  assert.equal(NumberModule.toString(1.25, 2, ['nl-NL', 'en-US']), '1,25');
  let currency = 'EUR';
  const option = { toString: () => currency };
  const instance = new NumberModule('en-US', 2);
  assert.equal(new NumberModule('en-US', Object(1.25)).format('decimal'), '1.25');
  for (currency of ['EUR', 'USD']) {
    assert.equal(instance.format('currency', option, undefined, 2),
      (2).toLocaleString('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }
  assert.throws(() => NumberModule.toString(2, 2, 'bad_locale'), RangeError);
  assert.throws(() => instance.format('currency', undefined, undefined, 2), TypeError);
  t.mock.method(Number.prototype, 'toLocaleString', () => 'custom');
  assert.equal(NumberModule.toString(1.25, 2, 'en-US'), 'custom');
});

test('number caches evict old configurations and clear on locale updates and destruction', async t => {
  const { NumberModule, api } = await createNumber(t);
  let created = 0;
  t.mock.method(Intl, 'NumberFormat', function (...args) {
    created++;
    return new NativeNumberFormat(...args);
  });
  const currencies = Intl.supportedValuesOf('currency').slice(0, 34);
  for (const currency of currencies) NumberModule.toString(2, 'currency', currency, undefined, 2, 'en-US');
  NumberModule.toString(3, 'currency', currencies[33], undefined, 2, 'en-US');
  assert.equal(created, 34);
  NumberModule.toString(3, 'currency', currencies[0], undefined, 2, 'en-US');
  assert.equal(created, 35);
  NumberModule.toString(1.25, 2);
  api.emit('realtime', 'bllSetLocale', { default: 'nl-NL' });
  assert.equal(NumberModule.toString(1.25, 2), '1,25');
  const before = created;
  NumberModule.destroy();
  await NumberModule.init({ get: async () => ({ default: 'nl-NL' }) });
  assert.equal(NumberModule.toString(1.25, 2), '1,25');
  assert.equal(created, before + 1);
  assert.equal(api.listenerCount('realtime'), 1);
});
