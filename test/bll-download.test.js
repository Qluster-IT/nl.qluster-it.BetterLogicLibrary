'use strict';

const assert = require('node:assert/strict');
const { once } = require('node:events');
const http = require('node:http');
const { setImmediate: nextTurn } = require('node:timers/promises');
const test = require('node:test');
const { BL } = require('betterlogiclibrary');
const { BLL } = require('../bll/bll');

const bll = Object.create(BLL.prototype);

async function uploadServer(t, onRequest) {
  const server = http.createServer(onRequest);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  return { host: '127.0.0.1', port: server.address().port, path: '/getfile/test-token/', contentType: 'text/csv' };
}

function mockReservation(t, link) {
  const post = t.mock.fn(async () => link);
  t.mock.getter(BL, 'Current', () => ({ api: { post } }));
  return post;
}

test('reservation without a body only calls the Homey API', async t => {
  const link = { token: 'test-token' };
  const post = mockReservation(t, link);
  const callback = t.mock.fn();
  assert.equal(await bll.getDownloadUrl({ contentType: 'text/plain', filename: 'test.txt', callback }), link);
  assert.deepEqual(post.mock.calls.map(call => call.arguments), [
    ['/getdownloadurl/', { contentType: 'text/plain', filename: 'test.txt' }]
  ]);
  assert.equal(callback.mock.callCount(), 0);
});

test('uploads byte views, empty bodies, text, Base64 and JSON in their wire formats', async t => {
  const uploads = [];
  const link = await uploadServer(t, async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    uploads.push({ method: req.method, headers: req.headers, body: Buffer.concat(chunks) });
    res.writeHead(204).end();
  });
  mockReservation(t, link);
  for (const [options, type, body] of [
    [{ buffer: Buffer.from([9, 0, 255, 9]).subarray(1, 3) }, 'application/octet-stream', Buffer.from([0, 255])],
    [{ buffer: new Uint8Array([9, 128, 1, 9]).subarray(1, 3) }, 'application/octet-stream', Buffer.from([128, 1])],
    [{ text: '' }, 'text/plain', Buffer.alloc(0)],
    [{ base64: '' }, 'application/octet-stream', Buffer.alloc(0)],
    [{ text: 'été 📖' }, 'text/plain', Buffer.from('été 📖')],
    [{ base64: 'UEsDBAD/' }, 'application/octet-stream', Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0xff])],
    [{ json: '{ "label": "été" }' }, 'text/json', Buffer.from('{ "label": "été" }')],
    [{ json: { label: 'été' } }, 'text/json', Buffer.from('{"label":"été"}')],
  ]) {
    assert.equal(await bll.getDownloadUrl(options), link);
    const upload = uploads.shift();
    assert.equal(upload.method, 'POST');
    assert.equal(upload.headers.accept, link.contentType);
    assert.equal(upload.headers['content-type'], type);
    assert.equal(upload.headers['content-length'], String(body.length));
    assert.deepEqual(upload.body, body);
  }
});

test('2xx must finish before the callback starts, and the callback must finish before resolution', async t => {
  let response;
  let received;
  const started = new Promise(resolve => { received = resolve; });
  const link = await uploadServer(t, (req, res) => {
    req.resume();
    req.on('end', () => {
      response = res;
      res.writeHead(200).write('partial');
      received();
    });
  });
  let finishCallback;
  const callbackPending = new Promise(resolve => { finishCallback = resolve; });
  let callbackStarted;
  const called = new Promise(resolve => { callbackStarted = resolve; });
  const callback = t.mock.fn(async ready => {
    callbackStarted(ready);
    await callbackPending;
  });
  let resolved = false;
  const pending = bll.setDownloadUrl({ link, text: 'upload', callback }).then(ready => {
    resolved = true;
    return ready;
  });
  await started;
  await nextTurn();
  assert.equal(callback.mock.callCount(), 0);
  assert.equal(resolved, false);

  response.end();
  assert.equal(await called, link);
  assert.equal(resolved, false);
  finishCallback();
  assert.equal(await pending, link);
  assert.equal(callback.mock.callCount(), 1);
});

test('a failed readiness callback rejects the helper for both sync and async failures', async t => {
  const link = await uploadServer(t, (req, res) => {
    req.resume();
    req.on('end', () => res.writeHead(204).end());
  });
  const failure = new Error('callback failed');
  for (const callback of [() => { throw failure; }, async () => { throw failure; }]) {
    await assert.rejects(bll.setDownloadUrl({ link, text: 'upload', callback }), error => error === failure);
  }
});

test('non-2xx, network reset and truncated 2xx reject without calling back', async t => {
  const link = await uploadServer(t, (req, res) => {
    req.resume();
    req.on('end', () => {
      if (req.url === '/rejected') return res.writeHead(302).end('private response body');
      if (req.url === '/reset') return req.socket.destroy();
      res.writeHead(200, { 'Content-Length': 20 }).write('partial', () => res.destroy());
    });
  });
  const callback = t.mock.fn();
  for (const [path, message] of [
    ['/rejected', /^Download upload failed with HTTP 302$/],
    ['/reset', /^Download upload network error$/],
    ['/truncated', /^Download upload (was interrupted|network error)$/],
  ]) {
    await assert.rejects(bll.setDownloadUrl({ link: { ...link, path }, text: 'upload', callback }), { message });
  }
  assert.equal(callback.mock.callCount(), 0);
});

test('an unfinished upload times out, closes its connection and never calls back', async t => {
  let received;
  const started = new Promise(resolve => { received = resolve; });
  const link = await uploadServer(t, (req, res) => {
    req.resume();
    req.on('end', () => received({ closed: once(res, 'close') }));
  });
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const callback = t.mock.fn();
  const pending = assert.rejects(bll.setDownloadUrl({ link, text: 'upload', callback }), /Download upload timed out/);
  const { closed } = await started;
  t.mock.timers.tick(60_000);
  await pending;
  await closed;
  assert.equal(callback.mock.callCount(), 0);
});

test('invalid inputs reject without reserving or uploading a file', async t => {
  const post = mockReservation(t, {});
  for (const options of [
    { buffer: new Uint16Array(1) },
    { text: false },
    { base64: '**' },
    { json: 'not JSON' },
    { text: '', base64: '' },
    { text: '', callback: true },
  ]) {
    await assert.rejects(bll.getDownloadUrl(options), TypeError);
  }
  assert.equal(post.mock.callCount(), 0);
  await assert.rejects(bll.setDownloadUrl({ link: {} }), /Download body is required/);
  await assert.rejects(bll.setDownloadUrl({ link: {}, text: 'upload' }), /Invalid download upload link/);
});
