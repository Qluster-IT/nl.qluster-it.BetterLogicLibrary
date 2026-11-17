'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const Module = require('node:module');
const test = require('node:test');
const { BL } = require('betterlogiclibrary');

const NativeDateTimeFormat = Intl.DateTimeFormat;

async function createDateTime(t) {
  BL._ = require('../assets/js/lodash.min.js');
  const api = new EventEmitter();
  BL._current = { api };
  BL._L = {
    clearObj(object) {
      for (const key of Object.keys(object)) delete object[key];
    }
  };
  BL.homey = {
    clock: { getTimezone: () => 'UTC' },
    i18n: { getLanguage: async () => 'en-US' },
    log() {}
  };
  const filename = require.resolve('../bll/dateTime');
  delete require.cache[filename];
  const DateTime = require(filename);
  await DateTime.init({ get: async () => ({ default: 'en-US' }) });
  t.after(() => {
    if (DateTime.onRealtime) DateTime.destroy();
  });
  return { DateTime, api };
}

function countFormatters(t) {
  let count = 0;
  t.mock.method(Intl, 'DateTimeFormat', function (...args) {
    count++;
    return new NativeDateTimeFormat(...args);
  });
  return () => count;
}

function originalFormat(DateTime, format, date, locale, timeZone) {
  const instance = new DateTime(locale, timeZone, date);
  instance.getString = function (options) {
    options.timeZone = this.timeZone || DateTime.timeZone;
    return (this.date || new Date()).toLocaleString(options.locale || this.locale || DateTime.locale, options);
  };
  return instance.toString(format);
}

test('formatters are reused across timestamps without changing locale, DST, or fractional-second output', async t => {
  const { DateTime } = await createDateTime(t);
  const count = countFormatters(t);
  const dates = [
    new Date('2026-03-29T00:59:59.999Z'),
    new Date('2026-03-29T01:00:00.001Z'),
    new Date('2026-10-25T00:59:59.999Z'),
    new Date('2026-10-25T01:00:00.001Z')
  ];
  const scenarios = [
    ['en-GB', 'Europe/London', { dateStyle: 'long', timeStyle: 'long' }],
    ['nl-NL', 'Europe/Amsterdam', { dateStyle: 'short', timeStyle: 'short' }],
    ['ar-EG-u-nu-arab', 'Africa/Cairo', { year: 'numeric', month: 'long', day: 'numeric' }],
    ['en-US', 'America/New_York', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, hour12: true }]
  ];
  for (const [locale, timeZone, options] of scenarios) {
    for (const date of dates) {
      const actual = new DateTime(locale, timeZone, date).getString({ ...options });
      assert.equal(actual, date.toLocaleString(locale, { ...options, timeZone }));
    }
  }
  assert.equal(count(), scenarios.length);
});

test('default date/time fields and invalid dates retain Date#toLocaleString behavior', async t => {
  const { DateTime } = await createDateTime(t);
  const date = new Date('2026-01-02T03:04:05.678Z');
  const instance = new DateTime('en-US', 'UTC', date);
  for (const options of [{}, { timeZoneName: 'short' }, { hour12: false }, { locale: 'nl-NL' }]) {
    assert.equal(instance.getString({ ...options }),
      date.toLocaleString(options.locale || 'en-US', { ...options, timeZone: 'UTC' }));
  }
  date.valueOf = () => 0;
  assert.equal(instance.getDateTimeByFormat('long'),
    date.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'long', timeZone: 'UTC' }));

  const invalid = new Date(Number.NaN);
  assert.equal(new DateTime('bad_locale', 'Invalid/Zone', invalid).getDateTimeByFormat('long'),
    invalid.toLocaleString('bad_locale', { dateStyle: 'long', timeStyle: 'long', timeZone: 'Invalid/Zone' }));
});

test('invalid locales, time zones, and incompatible options still throw', async t => {
  const { DateTime } = await createDateTime(t);
  const date = new Date('2026-01-02T03:04:05.678Z');
  const valid = new DateTime('en-US', 'UTC', date);
  const expected = valid.getDateTimeByFormat('long');
  assert.throws(() => new DateTime('bad_locale', 'UTC', date).getDateTimeByFormat('long'), RangeError);
  assert.throws(() => new DateTime('en-US', 'Invalid/Zone', date).getDateTimeByFormat('long'), RangeError);
  assert.throws(() => valid.getString({ dateStyle: 'long', year: 'numeric' }), TypeError);
  assert.equal(valid.getDateTimeByFormat('long'), expected);
});

test('complex arguments and custom date receivers preserve their original delegation', async t => {
  const { DateTime } = await createDateTime(t);
  const date = new Date('2026-01-02T03:04:05.678Z');
  const locales = ['nl-NL', 'en-US'];
  assert.equal(new DateTime(locales, 'UTC', date).getMonthByFormat('long'),
    date.toLocaleString(locales, { month: 'long', timeZone: 'UTC' }));
  let month = 'long';
  const format = { toString: () => month };
  const instance = new DateTime('en-US', 'UTC', date);
  const nonEnumerable = Object.defineProperty({}, 'month', { value: 'long' });
  assert.equal(instance.getString(nonEnumerable),
    date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }));
  function accessorOptions() {
    let reads = 0;
    return {
      options: { timeZone: 'UTC', get month() { reads++; return reads < 3 ? 'long' : 'short'; } },
      reads: () => reads
    };
  }
  const nativeAccessor = accessorOptions();
  const cachedAccessor = accessorOptions();
  const expectedAccessor = date.toLocaleString('en-US', nativeAccessor.options);
  assert.equal(instance.getString(cachedAccessor.options), expectedAccessor);
  assert.equal(cachedAccessor.reads(), nativeAccessor.reads());
  assert.equal(instance.getMonthByFormat(format), date.toLocaleString('en-US', { month: format, timeZone: 'UTC' }));
  month = 'numeric';
  assert.equal(instance.getMonthByFormat(format), date.toLocaleString('en-US', { month: format, timeZone: 'UTC' }));
  const inherited = Object.create({ month: 'long' });
  assert.equal(instance.getString(inherited), date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }));
  date.toLocaleString = () => 'custom receiver';
  assert.equal(instance.getDateTimeByFormat('long'), 'custom receiver');
  assert.equal(new DateTime('en-US', 'UTC', 'unchanged').getDateTimeByFormat('long'), 'unchanged');
});

test('locale and format changes preserve BLL format semantics', async t => {
  const { DateTime, api } = await createDateTime(t);
  const count = countFormatters(t);
  const date = new Date('2026-03-29T01:02:03.456Z');
  const previous = DateTime.toString('datetime', date);
  assert.equal(previous, originalFormat(DateTime, 'datetime', date));
  assert.equal(DateTime.toString('datetime', date), previous);
  const before = count();
  const settings = {
    default: 'nl-NL',
    dateFormats: { datetime: 'yyyy-MM-dd HH:mm:ss' },
    customDateFormats: [{ name: 'stamp', format: 'yyyy-MM-dd HH:mm:ss.fff' }]
  };
  api.emit('realtime', 'bllSetLocale', settings);
  for (const format of ['datetime', 'stamp', 'dddd MMMM d yyyy HH:mm:ss']) {
    assert.equal(DateTime.toString(format, date), originalFormat(DateTime, format, date));
    assert.equal(DateTime.toString(format, date, 'en-US', 'America/New_York'),
      originalFormat(DateTime, format, date, 'en-US', 'America/New_York'));
  }
  assert.ok(count() > before);
  const warmed = count();
  api.emit('realtime', 'bllSetLocale', settings);
  DateTime.toString('datetime', date);
  assert.equal(count(), warmed);
});

test('custom-only changes update shared formats without rebuilding tables or clearing formatters', async t => {
  const { DateTime, api } = await createDateTime(t);
  const count = countFormatters(t);
  const codes = DateTime.codes;
  const init = t.mock.method(codes, 'init');
  const timeArray = codes.timeArray;
  const defaultCode = codes.array.find(code => code.code === 'datetime' && code.customisable);
  const date = '2026-03-29T01:02:03.456Z';
  const builtIn = () => DateTime.toString('DATE', date, 'en-US', 'UTC');
  builtIn();
  const settings = { default: 'en-US', customDateFormats: [{ name: 'myStamp', format: 'yyyy-MM-dd' }] };
  api.emit('realtime', 'bllSetLocale', settings);
  assert.equal(DateTime.toString('myStamp', date, undefined, 'UTC'), '2026-03-29');
  assert.equal(codes.timeArray, timeArray);
  assert.equal(codes.array.find(code => code.code === 'datetime' && code.customisable), defaultCode);
  const afterCustom = count();
  builtIn();
  assert.equal(count(), afterCustom);
  const unchanged = codes.array;
  api.emit('realtime', 'bllSetLocale', settings);
  assert.equal(codes.array, unchanged);

  settings.customDateFormats[0].format = 'HH:mm';
  api.emit('realtime', 'bllSetLocale', settings);
  assert.equal(DateTime.toString('myStamp', date, undefined, 'UTC'), '01:02');
  settings.customDateFormats[0].name = 'renamedStamp';
  settings.customDateFormats.push({ name: 'secondStamp', format: 'yyyy' });
  api.emit('realtime', 'bllSetLocale', settings);
  assert.deepEqual(codes.array.filter(code => code.custom).map(code => code.code), ['renamedStamp', 'secondStamp']);
  assert.equal(DateTime.toString('renamedStamp', date, undefined, 'UTC'), '01:02');
  settings.customDateFormats.reverse();
  api.emit('realtime', 'bllSetLocale', settings);
  assert.deepEqual(codes.array.filter(code => code.custom).map(code => code.code), ['secondStamp', 'renamedStamp']);
  settings.customDateFormats.length = 0;
  api.emit('realtime', 'bllSetLocale', settings);
  assert.deepEqual(codes.array.filter(code => code.custom), []);
  const beforeBuiltIn = count();
  builtIn();
  assert.equal(count(), beforeBuiltIn);
  assert.equal(init.mock.callCount(), 0);
});

test('default-format changes and removal restore their original behavior', async t => {
  const { DateTime, api } = await createDateTime(t);
  const codes = DateTime.codes;
  const init = t.mock.method(codes, 'init');
  const timeArray = codes.timeArray;
  const date = '2026-03-29T01:02:03.456Z';
  const initial = DateTime.toString('datetime', date, undefined, 'UTC');
  const settings = { default: 'en-US', dateFormats: { datetime: 'yyyy-MM-dd' } };
  api.emit('realtime', 'bllSetLocale', settings);
  assert.equal(DateTime.toString('datetime', date, undefined, 'UTC'), '2026-03-29');
  settings.dateFormats.datetime = 'HH:mm';
  api.emit('realtime', 'bllSetLocale', settings);
  assert.equal(DateTime.toString('datetime', date, undefined, 'UTC'), '01:02');
  delete settings.dateFormats.datetime;
  api.emit('realtime', 'bllSetLocale', settings);
  assert.equal(DateTime.toString('datetime', date, undefined, 'UTC'), initial);
  assert.equal(codes.timeArray, timeArray);
  assert.equal(init.mock.callCount(), 0);
});

test('date/time Flow suggestions track configured formats and search without changing format case', async t => {
  const { DateTime, api } = await createDateTime(t);
  const previous = BL._datetime;
  BL.datetime = DateTime;
  t.after(() => { BL._datetime = previous; });
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
  const app = new m.exports();
  const args = { date: '2026-03-29T01:02:03.456Z', locale: { id: 'nl-NL' }, timeZone: { id: 'Europe/Amsterdam' } };
  const suggestions = query => app.getDateTimeFormatSuggestions(query, args);

  api.emit('realtime', 'bllSetLocale', {
    default: 'en-US',
    dateFormats: { datetime: 'yyyy-MM-dd HH:mm:ss' },
    customDateFormats: [
      { name: 'MyStamp', format: 'yyyy-MM-dd HH:mm' },
      { name: 'VeryLongCustomDate', format: 'yyyy-MM-dd' }
    ]
  });
  const all = suggestions('');
  for (const name of ['DATE', 'date', 'DATETIMELONG', 'TIMELONG', 'MyStamp', 'dd-MM-yyyy', 'HH:mm:ss']) {
    const item = all.find(x => x.name === name);
    assert.ok(item, `Missing ${name}`);
    assert.equal(item.description, DateTime.toString(name, args.date, args.locale.id, args.timeZone.id));
  }
  assert.equal(new Set(all.map(x => x.name)).size, all.length);
  const defaultNames = [
    ...Object.keys(DateTime.dateTimeCodes),
    ...Object.keys(DateTime.dateCodes),
    ...Object.keys(DateTime.timeCodes)
  ];
  const names = all.map(x => x.name);
  assert.deepEqual(names.slice(0, 2), ['MyStamp', 'VeryLongCustomDate']);
  assert.deepEqual(names.slice(2, 2 + defaultNames.length), defaultNames);
  assert.deepEqual(names.slice(2 + defaultNames.length), ['dd-MM-yyyy', 'dd-MM-yyyy HH:mm', 'dd-MM-yyyy HH:mm:ss', 'HH:mm', 'HH:mm:ss']);
  const sharedNames = DateTime.codes.array.filter(code => code.customisable || code.custom).map(code => code.code);
  assert.deepEqual(sharedNames, ['MyStamp', 'VeryLongCustomDate', ...defaultNames]);
  const defaultArgs = { date: args.date, timeZone: args.timeZone };
  assert.equal(app.getDateTimeFormatSuggestions('datetime', defaultArgs)
    .find(x => x.name === 'datetime').description, '2026-03-29 03:02:03');

  const filtered = suggestions('date');
  assert.ok(filtered.some(x => x.name === 'date'));
  assert.ok(filtered.some(x => x.name === 'DATE'));
  assert.ok(filtered.every(x => x.name.toLowerCase().includes('date')));
  assert.equal(filtered.filter(x => x.name === 'date').length, 1);
  assert.ok(filtered.findIndex(x => x.name === 'VeryLongCustomDate') < filtered.findIndex(x => x.name === 'shortdate'));
  const custom = suggestions('mYs');
  assert.equal(custom[0].name, 'mYs');
  assert.ok(custom.some(x => x.name === 'MyStamp'));
  assert.ok(custom.every(x => x.name.toLowerCase().includes('mys')));
  assert.equal(custom[0].description, DateTime.toString('mYs', args.date, args.locale.id, args.timeZone.id));

  api.emit('realtime', 'bllSetLocale', {
    default: 'en-US', customDateFormats: [{ name: 'NewStamp', format: 'yyyy' }]
  });
  assert.ok(suggestions('').some(x => x.name === 'NewStamp'));
  assert.ok(!suggestions('').some(x => x.name === 'MyStamp'));
});

test('shared display ordering preserves longest-match formatting for overlapping codes', async t => {
  const { DateTime, api } = await createDateTime(t);
  const date = '2026-03-29T01:02:03.456Z';
  api.emit('realtime', 'bllSetLocale', {
    default: 'en-US',
    dateFormats: { datetime: 'yyyy-MM-dd HH:mm:ss' },
    customDateFormats: [{ name: 'dateCustom', format: 'yyyy-MM-dd' }]
  });
  assert.equal(DateTime.toString('yyyy-MM-dd HH:mm:ss.fff', date, 'en-US', 'UTC'), '2026-03-29 01:02:03.456');
  assert.equal(DateTime.toString('dateCustom', date, undefined, 'UTC'), '2026-03-29');
  assert.equal(DateTime.toString('datetime', date, undefined, 'UTC'), '2026-03-29 01:02:03');
  assert.equal(DateTime.toString('DATELONG', date, 'en-US', 'UTC'),
    new Date(date).toLocaleString('en-US', { dateStyle: 'full', timeZone: 'UTC' }));
});

test('the formatter cache retains a bounded working set and evicts old configurations', async t => {
  const { DateTime } = await createDateTime(t);
  const count = countFormatters(t);
  const date = new Date('2026-01-02T03:04:05.678Z');
  const zones = Intl.supportedValuesOf('timeZone').slice(0, 40);
  for (const zone of zones) new DateTime('en-US', zone, date).getDateTimeByFormat('long');
  const warmed = count();
  assert.equal(warmed, zones.length);
  for (const zone of zones.slice(-32)) new DateTime('en-US', zone, date).getDateTimeByFormat('long');
  assert.equal(count(), warmed);
  new DateTime('en-US', zones[0], date).getDateTimeByFormat('long');
  assert.equal(count(), warmed + 1);
});

test('destroying the datetime module releases its formatter cache and realtime listener', async t => {
  const { DateTime, api } = await createDateTime(t);
  const count = countFormatters(t);
  const instance = new DateTime('en-US', 'UTC', new Date('2026-01-02T03:04:05.678Z'));
  const expected = instance.getDateTimeByFormat('long');
  DateTime.destroy();
  assert.equal(api.listenerCount('realtime'), 0);
  assert.equal(instance.getDateTimeByFormat('long'), expected);
  assert.equal(count(), 2);
});
