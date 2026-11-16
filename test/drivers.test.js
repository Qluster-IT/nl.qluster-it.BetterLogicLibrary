'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const Module = require('node:module');
const test = require('node:test');

function loadDriver(name, variableManager = {}) {
  const filename = require.resolve(`../drivers/${name}/driver.js`);
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  m.require = id => {
    if (id === 'homey') return {
      Driver: class {
        log() {}
        error(...args) { (this.errors ||= []).push(args); }
        getDevices() { return this.devices; }
      }
    };
    if (id === '../../lib/util/util.js') return {};
    if (id === '../../lib/variablemanager.js') return variableManager;
    return Module.prototype.require.call(m, id);
  };
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  return m.exports;
}

function createDevice(id, updates) {
  return {
    getData: () => ({ id }),
    async setCapabilityValue(capability, value) { updates.push([id, capability, value]); }
  };
}

for (const [driver, type, capability, values] of [
  ['bitflip', 'boolean', 'onoff', [true, false]],
  ['numslide', 'number', 'dim', [11, 0]]
]) test(`${driver} initializes its capability from the current variable`, async () => {
  const filename = require.resolve(`../drivers/${driver}/device.js`);
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  let value;
  m.require = id => {
    if (id === 'homey') return { Device: class {
      getData() { return { id: 'test', type }; }
      registerCapabilityListener() {}
      async setCapabilityValue(capability, current) { this.state = [capability, current]; }
    } };
    if (id === '../../lib/variablemanager.js') return {
      getVariable: () => ({ name: 'test', type, value })
    };
    return Module.prototype.require.call(m, id);
  };
  m._compile(fs.readFileSync(filename, 'utf8'), filename);

  for (value of values) {
    const device = new m.exports();
    await device.onInit();
    assert.deepEqual(device.state, [capability, value]);
  }
});

for (const [name, key, capability, type, value] of [
  ['numslide', 'numValueChanged', 'dim', 'number', 5],
  ['bitflip', 'boolValueChanged', 'onoff', 'boolean', true]
]) {
  test(`${name} devices paired after startup follow their variable and deleted devices are no longer updated`, () => {
    const Driver = loadDriver(name);
    const updates = [];
    const stored = {};
    const settings = new EventEmitter();
    settings.get = setting => stored[setting];
    const driver = new Driver();
    driver.homey = settings.homey = { settings };
    driver.devices = [createDevice('removed', updates)];
    driver.onInit();

    driver.devices = [createDevice('added', updates)];
    for (const variable of ['added', 'removed']) {
      stored[key] = { name: variable, type, value };
      settings.emit('set', key);
    }

    assert.deepEqual(updates, [['added', capability, value]]);
  });

  test(`${name} logs and notifies a device that rejects its new value`, async () => {
    const Driver = loadDriver(name);
    const failure = new Error('invalid value');
    const settings = new EventEmitter();
    settings.get = () => ({ name: 'rejected', type, value });
    const notifications = [];
    const driver = new Driver();
    driver.homey = settings.homey = { settings, notifications: { createNotification: async notification => { notifications.push(notification.excerpt); } } };
    driver.devices = [{ getData: () => ({ id: 'rejected' }), setCapabilityValue: async () => { throw failure; } }];
    driver.onInit();

    settings.emit('set', key);
    await new Promise(resolve => setImmediate(resolve));

    assert.equal(driver.errors?.[0]?.[1], failure);
    assert.deepEqual(notifications, ['Error while setting device rejected: invalid value']);
  });
}
