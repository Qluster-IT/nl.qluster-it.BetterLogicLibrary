'use strict';

const assert = require('node:assert/strict');
const { EventEmitter, once } = require('node:events');
const fs = require('node:fs');
const http = require('node:http');
const Module = require('node:module');
const path = require('node:path');
const { Writable } = require('node:stream');
const test = require('node:test');
const { BL } = require('betterlogiclibrary');

async function createServer(t, { autoShutdown = true, writable, removalError } = {}) {
  const timers = new Map();
  const directories = new Set();
  const removed = [];
  const errors = [];
  let closed = 0;
  const fakeHttp = {
    createServer() {
      const server = new EventEmitter();
      server.listen = () => server;
      server.close = callback => { closed++; setImmediate(callback); };
      return server;
    }
  };
  const filename = path.resolve(__dirname, '..', 'lib', 'FileServer.js');
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = module.paths;
  m.require = function (id) {
    if (id === 'http') return writable ? http : fakeHttp;
    if (id === 'fs') return {
      ...fs,
      existsSync: name => directories.has(name),
      mkdirSync: name => directories.add(name),
      rmSync(name) {
        if (removalError) throw removalError;
        directories.delete(name);
        removed.push(name);
      },
      createWriteStream: () => writable()
    };
    return Module.prototype.require.call(this, id);
  };
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  const server = new m.exports();
  const homey = {
    cloud: { getLocalAddress: async () => '127.0.0.1', getHomeyId: async () => 'test' },
    log() {},
    error(...args) { errors.push(args); },
    setTimeout(callback) {
      const handle = {};
      timers.set(handle, callback);
      return handle;
    },
    clearTimeout(handle) {
      assert.equal(typeof handle, 'object');
      timers.delete(handle);
    }
  };
  BL.homey = homey;
  await server.init({ homey, settings: { port: 0, autoStart: false, autoShutdown, fileAvailableDuration: 60 } });
  t.after(() => server.close());
  return {
    server, timers, directories, removed, errors,
    closed: () => closed,
    async expire(token) {
      const handle = server.files[token].timeout;
      const callback = timers.get(handle);
      timers.delete(handle);
      await callback();
    }
  };
}

test('one expiring download does not stop the server or remove other available files', async t => {
  const fixture = await createServer(t);
  const first = await fixture.server.getDownloadUrl({ base64: '', filename: 'first.txt' });
  const second = await fixture.server.getDownloadUrl({ base64: 'dGVzdA==', filename: 'second.txt' });
  fixture.directories.add(`/userdata/getfile/${first.token}/`);
  fixture.directories.add(`/userdata/getfile/${second.token}/`);
  await fixture.expire(first.token);
  assert.equal(fixture.closed(), 0);
  assert.deepEqual(Object.keys(fixture.server.files), [second.token]);
  assert.equal(fixture.timers.size, 1);
  assert.deepEqual(fixture.removed, [`/userdata/getfile/${first.token}/`]);
  await fixture.expire(second.token);
  assert.equal(fixture.closed(), 1);
  assert.equal(fixture.timers.size, 0);
  assert.deepEqual(fixture.server.files, {});
});

test('closing releases payloads and timers, resolves pending downloads, and waits for shutdown', async t => {
  const fixture = await createServer(t);
  const first = await fixture.server.getDownloadUrl({ base64: 'dGVzdA==', filename: 'first.txt' });
  await fixture.server.getDownloadUrl({ filename: 'upload.txt' });
  let resolved = 0;
  fixture.server.files[first.token].defer = { resolve() { resolved++; } };
  await Promise.all([fixture.server.close(), fixture.server.close()]);
  assert.equal(resolved, 1);
  assert.equal(fixture.closed(), 1);
  assert.equal(fixture.timers.size, 0);
  assert.equal(fixture.server.server, null);
  assert.deepEqual(fixture.server.files, {});
});

test('settings updates keep downloads available and close an empty auto-shutdown server', async t => {
  const fixture = await createServer(t, { autoShutdown: false });
  const file = await fixture.server.getDownloadUrl({ contentType: 'text/plain', filename: 'file.txt' });
  const settings = { port: 0, autoStart: false, autoShutdown: true, fileAvailableDuration: 60 };
  await fixture.server.update(settings);
  assert.equal(fixture.closed(), 0);
  await fixture.expire(file.token);
  assert.equal(fixture.closed(), 1);
});

test('cleanup errors are reported after all payloads and timers have been released', async t => {
  const fixture = await createServer(t, { removalError: new Error('disk error') });
  for (let i = 0; i < 2; i++) {
    const file = await fixture.server.getDownloadUrl({ base64: 'dGVzdA==', filename: `${i}.txt` });
    fixture.directories.add(`/userdata/getfile/${file.token}/`);
  }
  await assert.rejects(fixture.server.close(), error =>
    error instanceof AggregateError && error.errors.length === 2);
  assert.deepEqual(fixture.server.files, {});
  assert.equal(fixture.timers.size, 0);
  assert.equal(fixture.closed(), 1);
});

test('expiry still shuts down an empty server when disk cleanup fails', async t => {
  const failure = new Error('disk error');
  const fixture = await createServer(t, { removalError: failure });
  const file = await fixture.server.getDownloadUrl({ base64: 'dGVzdA==', filename: 'file.txt' });
  fixture.directories.add(`/userdata/getfile/${file.token}/`);
  await fixture.expire(file.token);
  assert.equal(fixture.closed(), 1);
  assert.equal(fixture.timers.size, 0);
  assert.deepEqual(fixture.server.files, {});
  assert.ok(fixture.errors.some(args => args[1] === failure));
});

async function upload(server, token, body) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      host: '127.0.0.1', port: server.port,
      path: `/getfile/${token}/file.bin`, method: 'POST'
    }, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    request.on('error', reject);
    request.end(body);
  });
}

test('binary uploads report success only after the output stream finishes', async t => {
  const received = [];
  let finished = false;
  const fixture = await createServer(t, {
    writable: () => new Writable({
      write(chunk, encoding, callback) { received.push(Buffer.from(chunk)); callback(); },
      final(callback) { setTimeout(() => { finished = true; callback(); }, 20); }
    })
  });
  const file = await fixture.server.getDownloadUrl({ contentType: 'application/octet-stream', filename: 'file.bin' });
  if (!fixture.server.server.listening) await once(fixture.server.server, 'listening');
  fixture.server.port = fixture.server.server.address().port;
  const bytes = Buffer.from([0, 1, 127, 128, 200, 255]);
  assert.equal(await upload(fixture.server, file.token, bytes), 200);
  assert.equal(finished, true);
  assert.deepEqual(Buffer.concat(received), bytes);
  assert.equal(fixture.timers.size, 1, 'Only the download expiry timer should remain');
  assert.equal(fixture.server.files[file.token].uploadController, undefined);
  assert.deepEqual(fixture.errors, []);
});

test('a rejected overlapping upload does not announce that the original file is ready', { timeout: 5000 }, async t => {
  let release;
  let started;
  const writing = new Promise(resolve => { started = resolve; });
  const fixture = await createServer(t, {
    writable: () => new Writable({
      write(chunk, encoding, callback) { release = callback; started(); }
    })
  });
  const file = await fixture.server.getDownloadUrl({ filename: 'file.bin' });
  if (!fixture.server.server.listening) await once(fixture.server.server, 'listening');
  fixture.server.port = fixture.server.server.address().port;
  const first = upload(fixture.server, file.token, Buffer.from('original'));
  let ready = false;
  try {
    await writing;
    fixture.server.files[file.token].defer.promise.then(() => { ready = true; });
    assert.equal(await upload(fixture.server, file.token, Buffer.from('overlap')), 400);
    assert.equal(ready, false);
  } finally {
    if (release) release();
    assert.equal(await first, 200);
  }
  assert.equal(ready, true);
  assert.equal(fixture.timers.size, 1);
});

test('upload write errors are handled and release their timeout and stream', async t => {
  const fixture = await createServer(t, {
    writable: () => new Writable({
      write(chunk, encoding, callback) { callback(new Error('disk full')); }
    })
  });
  const file = await fixture.server.getDownloadUrl({ contentType: 'application/octet-stream', filename: 'file.bin' });
  if (!fixture.server.server.listening) await once(fixture.server.server, 'listening');
  fixture.server.port = fixture.server.server.address().port;
  const result = await upload(fixture.server, file.token, Buffer.from('data')).catch(error => error);
  assert.ok(result === 400 || result.code === 'ECONNRESET');
  assert.equal(fixture.timers.size, 1);
  assert.equal(fixture.server.files[file.token].uploadController, undefined);
  assert.ok(fixture.errors.some(args => args[1]?.message === 'disk full'));
});

test('expiry aborts an unfinished upload and releases its stream and timers', { timeout: 5000 }, async t => {
  let request;
  t.after(() => request?.destroy());
  let started;
  const writing = new Promise(resolve => { started = resolve; });
  let output;
  const fixture = await createServer(t, {
    writable: () => (output = new Writable({
      write(chunk, encoding, callback) { started(); callback(); }
    }))
  });
  const file = await fixture.server.getDownloadUrl({ contentType: 'application/octet-stream', filename: 'file.bin' });
  if (!fixture.server.server.listening) await once(fixture.server.server, 'listening');
  fixture.server.port = fixture.server.server.address().port;
  request = http.request({
    host: '127.0.0.1', port: fixture.server.port,
    path: file.path, method: 'POST'
  });
  request.on('error', error => assert.equal(error.code, 'ECONNRESET'));
  request.on('response', response => response.resume());
  request.write(Buffer.from('unfinished'));
  await writing;
  await fixture.expire(file.token);
  request.destroy();
  assert.equal(output.destroyed, true);
  assert.equal(fixture.timers.size, 0);
  assert.deepEqual(fixture.server.files, {});
  assert.equal(fixture.server.server, null);
});

test('shutdown cancels incomplete fallback requests and clears their Homey deadlines', { timeout: 5000 }, async t => {
  let request;
  t.after(() => request?.destroy());
  const fixture = await createServer(t, { writable: () => assert.fail('No file should be opened') });
  await fixture.server.getDownloadUrl({ contentType: 'text/plain', filename: 'file.txt' });
  if (!fixture.server.server.listening) await once(fixture.server.server, 'listening');
  fixture.server.port = fixture.server.server.address().port;
  const incoming = once(fixture.server.server, 'request');
  request = http.request({
    host: '127.0.0.1', port: fixture.server.port,
    path: '/getfile/missing/file.bin', method: 'POST'
  });
  request.on('error', error => assert.equal(error.code, 'ECONNRESET'));
  request.on('response', response => response.resume());
  request.write('unfinished');
  await incoming;
  assert.equal(fixture.server.transfers.size, 1);
  await fixture.server.close();
  request.destroy();
  assert.equal(fixture.server.transfers.size, 0);
  assert.equal(fixture.timers.size, 0);
});

test('JSON body downloads preserve binary data and release their request deadline', async t => {
  const fixture = await createServer(t, { writable: () => assert.fail('No file should be opened') });
  await fixture.server.getDownloadUrl({ contentType: 'text/plain', filename: 'file.txt' });
  if (!fixture.server.server.listening) await once(fixture.server.server, 'listening');
  fixture.server.port = fixture.server.server.address().port;
  const expected = Buffer.from([0, 128, 200, 255]);
  const actual = await new Promise((resolve, reject) => {
    const request = http.request({
      host: '127.0.0.1', port: fixture.server.port,
      path: '/getfile/missing/file.bin', method: 'POST',
      headers: { 'Content-Type': 'text/json' }
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    request.on('error', reject);
    request.end(JSON.stringify({ base64: expected.toString('base64') }));
  });
  assert.deepEqual(actual, expected);
  assert.equal(fixture.server.transfers.size, 0);
  assert.equal(fixture.timers.size, 1);
  assert.deepEqual(fixture.errors, []);
});
