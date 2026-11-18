'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { Readable } = require('node:stream');
const test = require('node:test');
const vm = require('node:vm');
const converter = require('../lib/json2csv');
const { json2csv, json2csvAsync } = converter;

function loadJson(csv = converter, loadStream = () => ({ Readable })) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../bll/json'), 'utf8'), {
    module,
    require(name) {
      if (name === 'betterlogiclibrary') return { BL: { submodules: { json2csv: csv } } };
      if (name === 'stream') return loadStream();
      throw new Error(`Unexpected dependency ${name}`);
    }
  });
  return module.exports;
}

async function readCsv(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

test('CSV preserves first-seen columns and quoting across batches, including sparse and nested rows', async () => {
  const rows = Array.from({ length: 600 }, (_, i) => ({ id: i + 1, details: { name: 'a,"b"\n' } }));
  delete rows[256];
  rows[599]['literal.dot'] = 'tail';
  rows.length++;
  const csv = await json2csvAsync(rows, { emptyFieldValue: '', delimiter: { eol: '\r\n' } });
  const expected = ['id,details.name,literal\\.dot'];
  for (let i = 0; i < rows.length; i++) {
    expected.push(rows[i] ? `${i + 1},"a,""b""\n",${i === 599 ? 'tail' : ''}` : '');
  }
  assert.equal(csv, expected.join('\r\n'));
});

test('CSV stream matches exact buffered bytes for quoted Unicode, large rows and custom delimiters', async () => {
  const Json = loadJson();
  const time = new Date('2026-03-04T05:06:07.008Z');
  const large = 'é"漢🦊\r\n'.repeat(12000);
  const rows = [
    , { id: 1, 'literal.dot': 'a||b', detail: { message: large }, time },
    { id: 2, 'literal.dot': null, detail: { message: '' } }
  ];
  rows.length += 2;
  const options = {
    delimiter: { field: '||', eol: '\r\n' },
    excelBOM: true,
    emptyFieldValue: '(missing)',
    useDateIso8601Format: true,
    keys: ['id', { field: 'literal\\.dot', title: 'Dot||name' }, 'detail.message', 'time']
  };
  const expected = '\uFEFFid||"Dot||name"||detail.message||time\r\n\r\n' +
    `1||"a||b"||"${large.replace(/"/g, '""')}"||2026-03-04T05:06:07.008Z\r\n` +
    '2||(missing)||(missing)||(missing)\r\n\r\n';
  assert.equal(await Json.toCsv(rows, options), expected);
  const stream = await Json.toCsv(rows, { ...options, outputStream: true });
  assert.ok(stream instanceof Readable);
  assert.deepEqual(await readCsv(stream), Buffer.from(expected));
});

test('CSV streaming preserves headerless and empty output, array expansion, and custom parsers', async () => {
  const Json = loadJson();
  for (const [rows, options] of [
    [[], { prependHeader: false }],
    [Array(1400), { prependHeader: false }],
    [{ id: 1 }, { excelBOM: true, prependHeader: false }],
    [[{ items: [{ code: 'a' }, { code: 'b' }] }, { items: [] }], { expandArrayObjects: true }],
    [[{ items: [{ code: 'a' }, { code: 'b' }] }, { items: [] }], { unwindArrays: true }],
    [[{ value: 'bb' }], { parseValue: (value, stringify) => stringify(value).toUpperCase() }]
  ]) {
    const text = await Json.toCsv(rows, options);
    assert.deepEqual(await readCsv(await Json.toCsv(rows, { ...options, outputStream: true })), Buffer.from(text));
  }
});

test('CSV keeps a UTF-8 surrogate pair intact across unusual row boundaries', async () => {
  const Json = loadJson();
  const rows = Array.from({ length: 600 }, () => ({ value: 'x\uD83D' }));
  const options = { delimiter: { eol: '\uDE00' } };
  const text = await Json.toCsv(rows, options);
  assert.ok(text.includes('x😀x'));
  assert.deepEqual(await readCsv(await Json.toCsv(rows, { ...options, outputStream: true })), Buffer.from(text));
});

test('CSV stream reads rows on demand and propagates encoding and schema errors', async () => {
  const Json = loadJson();
  let visits = 0;
  const rows = Array.from({ length: 2000 }, () => ({
    get value() {
      visits++;
      return 'a'.repeat(2048);
    }
  }));
  const stream = await Json.toCsv(rows, { keys: ['value'], outputStream: true });
  assert.equal(visits, 0);
  for await (const chunk of stream) {
    assert.ok(chunk.length > 0);
    break;
  }
  assert.ok(visits > 0 && visits < rows.length);
  const invalidDate = await Json.toCsv([{ date: new Date(NaN) }], { useDateIso8601Format: true, outputStream: true });
  await assert.rejects(readCsv(invalidDate), /Invalid time value/);
  const strict = { checkSchemaDifferences: true };
  assert.equal(await Json.toCsv([{ a: 1, b: 2 }, , { b: 3, a: 4 }], strict), 'a,b\n1,2\n\n4,3');
  const invalidSchema = [{ a: 1 }, { b: 2 }];
  await assert.rejects(Json.toCsv(invalidSchema, strict), /Not all documents have the same schema/);
  await assert.rejects(readCsv(await Json.toCsv(invalidSchema, { ...strict, outputStream: true })),
    /Not all documents have the same schema/);
});

test('Legacy CSV callbacks and browser string export do not load Node streams', async () => {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../lib/json2csv'), 'utf8'), {
    module,
    require(name) {
      assert.equal(name, 'betterlogiclibrary/src/bl');
      return { BL: {} };
    }
  });
  const browser = loadJson(module.exports, () => { throw new Error('Node stream loaded in browser'); });
  assert.equal(await browser.toCsv([{ a: 'é,🚀' }]), 'a\n"é,🚀"');
  assert.equal(await new Promise((resolve, reject) => {
    json2csv([{ a: 'é,🚀' }], (err, output) => err ? reject(err) : resolve(output));
  }), 'a\n"é,🚀"');
  const olderModule = loadJson({ json2csvAsync });
  assert.deepEqual(await readCsv(await olderModule.toCsv([{ a: 1 }], { outputStream: true })), Buffer.from('a\n1'));
});
