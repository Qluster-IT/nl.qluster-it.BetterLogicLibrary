'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');
const { inflateRawSync } = require('node:zlib');
const write = require('../lib/write-excel-file-min');

function unzip(bytes) {
  const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = buffer.length - 22;
  assert.equal(buffer.readUInt32LE(end), 0x06054b50);
  const entries = new Map();
  let offset = buffer.readUInt32LE(end + 16);
  for (let i = 0; i < buffer.readUInt16LE(end + 10); i++) {
    assert.equal(buffer.readUInt32LE(offset), 0x02014b50);
    const method = buffer.readUInt16LE(offset + 10);
    const size = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const local = buffer.readUInt32LE(offset + 42);
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    const data = buffer.subarray(start, start + size);
    assert.ok(method === 0 || method === 8);
    const content = method === 8 ? inflateRawSync(data) : data;
    assert.equal(content.length, buffer.readUInt32LE(offset + 24));
    entries.set(buffer.toString('utf8', offset + 46, offset + 46 + nameLength), content.toString('utf8'));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

test('Excel output preserves Uint8Array results, styles, values, dates, and caller data', async () => {
  const date = new Date('2026-01-02T03:04:05.000Z');
  const rows = [[
    { type: String, value: 'a & <b>', fontWeight: 'bold', wrap: true },
    { type: Number, value: 42.5, format: '0.00' },
    { type: Date, value: date, format: 'yyyy-mm-dd hh:mm:ss' },
    { type: Boolean, value: true },
    { type: 'Formula', value: 'SUM(B1,1)' }
  ]];
  const snapshot = rows.map(row => row.map(cell => ({ ...cell })));
  const output = await write(rows, { sheet: 'Data', stickyRowsCount: 1 });
  assert.ok(output instanceof Uint8Array);
  assert.equal(Buffer.isBuffer(output), false);
  const entries = unzip(output);
  const sheet = entries.get('xl/worksheets/sheet1.xml');
  assert.match(sheet, /<v>42\.5<\/v>/);
  assert.ok(sheet.includes(`<v>${date.getTime() / 864e5 + 25569}</v>`));
  assert.match(sheet, /<f>SUM\(B1,1\)<\/f>/);
  assert.match(sheet, /state="frozen"/);
  assert.match(entries.get('xl/sharedStrings.xml'), /a &amp; &lt;b&gt;/);
  assert.match(entries.get('xl/styles.xml'), /formatCode="0\.00"/);
  assert.deepEqual(rows, snapshot);
});

test('shared strings safely deduplicate object-prototype names without corrupting cells', async () => {
  const strings = ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'constructor'];
  const output = await write(strings.map(value => [{ type: String, value }]));
  const entries = unzip(output);
  const shared = entries.get('xl/sharedStrings.xml');
  for (const value of strings) assert.ok(shared.includes(`<t>${value}</t>`));
  assert.equal((shared.match(/<si>/g) || []).length, 4);
  const indexes = [...entries.get('xl/worksheets/sheet1.xml').matchAll(/<v>(.*?)<\/v>/g)].map(match => match[1]);
  assert.deepEqual(indexes, ['0', '1', '2', '3', '0']);
});

test('schema callbacks, headers, multiple sheets, and per-workbook state remain independent', async () => {
  const calls = [];
  const rows = [{ value: 'first' }, { value: 'second' }];
  const schema = [{ column: 'Header', type: String, value: row => { calls.push(row.value); return row.value; } }];
  const output = await write([rows, rows], { sheets: ['One', 'Two'], schema: [schema, schema] });
  const entries = unzip(output);
  assert.deepEqual(calls, ['first', 'second', 'first', 'second']);
  assert.match(entries.get('xl/workbook.xml'), /name="One"/);
  assert.match(entries.get('xl/workbook.xml'), /name="Two"/);
  assert.ok(entries.has('xl/worksheets/sheet2.xml'));
  assert.deepEqual(rows, [{ value: 'first' }, { value: 'second' }]);
  const next = unzip(await write([[{ type: String, value: 'fresh' }]]));
  assert.equal((next.get('xl/sharedStrings.xml').match(/<si>/g) || []).length, 1);
  assert.match(next.get('xl/worksheets/sheet1.xml'), /<v>0<\/v>/);
});

test('the bundled writer still works when Node Buffer is unavailable', async () => {
  const module = { exports: {} };
  const context = {
    module, exports: module.exports, Buffer: undefined,
    String, Number, Boolean, Date, Uint8Array, ArrayBuffer,
    Promise, setTimeout, clearTimeout, setImmediate, clearImmediate
  };
  context.global = context;
  vm.runInNewContext(fs.readFileSync(require.resolve('../lib/write-excel-file-min'), 'utf8'), context);
  const output = await module.exports([[{ type: String, value: 'browser-compatible' }]]);
  assert.ok(output instanceof Uint8Array);
  assert.equal(Buffer.isBuffer(output), false);
  assert.match(unzip(output).get('xl/sharedStrings.xml'), /browser-compatible/);
});
