'use strict';

const assert = require('node:assert/strict');
const { setImmediate: nextTurn } = require('node:timers/promises');
const test = require('node:test');
const { BL } = require('betterlogiclibrary');
BL.submodules = { json2csv: {} };
const Json = require('../bll/json');

async function text(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

test('JSON streams preserve native array encoding, Unicode, holes and toJSON index keys', async () => {
  const rows = [
    { name: 'caf\u00e9 \uD83C\uDF19', value: '"\\\n'.repeat(7000), date: new Date('2026-01-02T03:04:05Z') },
    undefined, null, NaN, Infinity, Symbol('ignored'), () => {},
    { toJSON(key) { return { index: key }; } },
    { toJSON() { return undefined; } }
  ];
  rows.length += 2;
  rows.push({ toJSON(key) { return { index: key }; } });
  assert.equal(await text(Json.toJson(rows, { outputStream: true })), JSON.stringify(rows));
  assert.equal(await text(Json.toJson([], { outputStream: true })), '[]');
  const custom = Object.assign([], { toJSON() { return { custom: true }; } });
  assert.equal(await text(Json.toJson(custom, { outputStream: true })), JSON.stringify(custom));
  assert.equal(Json.toJson({ value: 1 }), '{"value":1}');
});

test('JSON streaming reports serialization and source failures and closes abandoned inputs', async () => {
  const circular = {};
  circular.self = circular;
  await assert.rejects(text(Json.toJson([circular], { outputStream: true })), /circular/i);
  await assert.rejects(text(Json.toJson([1n], { outputStream: true })), /BigInt/);
  const failure = new Error('source unavailable');
  async function* failing() { yield { value: 1 }; throw failure; }
  await assert.rejects(text(Json.toJson(failing(), { outputStream: true })), error => error === failure);
  let produced = 0;
  let closed = false;
  async function* source() {
    try {
      for (let index = 0; index < 10000; index++) {
        produced++;
        yield { value: 'x'.repeat(4096) };
      }
    } finally { closed = true; }
  }
  const stream = Json.toJson(source(), { outputStream: true });
  for await (const chunk of stream) { assert.ok(chunk.byteLength); break; }
  await nextTurn();
  assert.equal(closed, true);
  assert.ok(produced < 100, 'backpressure must not serialize the entire input before cancellation');
  assert.throws(() => Json.toJson(null, { outputStream: true }), /array or iterable/);
});
