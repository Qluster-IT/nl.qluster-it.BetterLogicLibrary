'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');
const { crc32, inflateRawSync } = require('node:zlib');
const write = require('../lib/write-excel-file-min');

function unzip(bytes, streamedParts = []) {
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
    if (crc32) assert.equal(crc32(content), buffer.readUInt32LE(offset + 16));
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);
    const streamed = Boolean(buffer.readUInt16LE(local + 6) & 8);
    if (streamedParts.includes(name)) assert.ok(streamed, `${name} must have a ZIP data descriptor`);
    if (streamed) {
      const descriptor = start + size;
      assert.equal(buffer.readUInt32LE(descriptor), 0x08074b50);
      assert.equal(buffer.readUInt32LE(descriptor + 4), buffer.readUInt32LE(offset + 16));
      assert.equal(buffer.readUInt32LE(descriptor + 8), size);
      assert.equal(buffer.readUInt32LE(descriptor + 12), content.length);
    }
    entries.set(name, content.toString('utf8'));
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

test('bold and italic font properties precede size and family in SpreadsheetML order', async () => {
  const entries = unzip(await write([[
    { type: String, value: 'bold', fontWeight: 'bold' },
    { type: String, value: 'italic', fontStyle: 'italic' },
    { type: String, value: 'both', fontWeight: 'bold', fontStyle: 'italic' }
  ]]));
  const fonts = [...entries.get('xl/styles.xml').matchAll(/<font>(.*?)<\/font>/g)].map(match => match[1]);
  assert.ok(fonts.some(font => font.startsWith('<b/><sz')));
  assert.ok(fonts.some(font => font.startsWith('<i/><sz')));
  assert.ok(fonts.some(font => font.startsWith('<b/><i/><sz')));
  for (const font of fonts) {
    assert.doesNotMatch(font, /<(?:sz|color|name|family|scheme)\b.*<(?:b|i)\/>/);
  }
});

test('custom number formats use the non-reserved range and cell styles reference their definitions', async () => {
  const entries = unzip(await write([[
    { type: Date, value: new Date('2026-01-02T03:04:05Z'), format: 'yyyy-mm-dd hh:mm:ss' },
    { type: Number, value: 42.5, format: '0.00' },
    { type: Number, value: 1.5, format: '0.00' },
    { type: String, value: 'header', fontWeight: 'bold' }
  ]]));
  const styles = entries.get('xl/styles.xml');
  const formats = [...styles.matchAll(/<numFmt numFmtId="(\d+)"/g)].map(match => Number(match[1]));
  assert.equal(formats.length, 2, 'reused formats must remain deduplicated');
  assert.ok(formats.every(id => id >= 164), 'custom formats must not reuse reserved Excel format IDs');
  assert.equal(new Set(formats).size, formats.length);
  assert.match(styles, /<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"\/><\/cellStyleXfs>/);
  assert.match(styles, /<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"\/><\/cellStyles>/);
  const cellXfs = styles.match(/<cellXfs\b[^>]*>(.*?)<\/cellXfs>/)[1];
  for (const match of cellXfs.matchAll(/<xf\b([^>]*)>/g)) {
    const attributes = Object.fromEntries([...match[1].matchAll(/(\w+)="([^"]*)"/g)].map(part => [part[1], part[2]]));
    assert.equal(attributes.xfId, '0', 'cell styles must reference the default base style');
    for (const key of ['numFmtId', 'fontId', 'fillId', 'borderId']) assert.ok(key in attributes);
    assert.ok(attributes.numFmtId === '0' || formats.includes(Number(attributes.numFmtId)));
  }
  const next = unzip(await write([[{ type: Number, value: 5, format: '0%' }]])).get('xl/styles.xml');
  assert.match(next, new RegExp(`<numFmt numFmtId="${formats[0]}" formatCode="0%"/>`));
});

test('frozen rows and columns activate and select a pane that exists', async () => {
  const cells = [[{ type: String, value: 'test' }]];
  for (const [options, pane, cell] of [
    [{ stickyRowsCount: 1 }, 'bottomLeft', 'A2'],
    [{ stickyColumnsCount: 2 }, 'topRight', 'C1'],
    [{ stickyRowsCount: 3, stickyColumnsCount: 2 }, 'bottomRight', 'C4']
  ]) {
    const xml = unzip(await write(cells, options)).get('xl/worksheets/sheet1.xml');
    assert.match(xml, new RegExp(`<pane[^>]*topLeftCell="${cell}"[^>]*activePane="${pane}"[^>]*state="frozen"`));
    assert.ok(xml.includes(`<selection pane="${pane}"/>`));
    if (!options.stickyRowsCount) assert.doesNotMatch(xml, /ySplit=/);
    if (!options.stickyColumnsCount) assert.doesNotMatch(xml, /xSplit=/);
  }
  const normal = unzip(await write(cells)).get('xl/worksheets/sheet1.xml');
  assert.doesNotMatch(normal, /<pane\b|<selection\b/);
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
  assert.match(entries.get('[Content_Types].xml'), /PartName="\/xl\/worksheets\/sheet2\.xml"/);
  assert.deepEqual(rows, [{ value: 'first' }, { value: 'second' }]);
  const next = unzip(await write([[{ type: String, value: 'fresh' }]]));
  assert.equal((next.get('xl/sharedStrings.xml').match(/<si>/g) || []).length, 1);
  assert.match(next.get('xl/worksheets/sheet1.xml'), /<v>0<\/v>/);
});

test('Excel column widths stay within Excel limits without changing caller data', async () => {
  const schema = [{ column: 'Message', type: String, value: row => row.message, width: 2654 }];
  const columns = [{ width: 300 }];
  const value = 'x'.repeat(2654);
  const entries = unzip(await write([{ message: value }], { schema }));
  assert.match(entries.get('xl/worksheets/sheet1.xml'), /width="255"/);
  assert.ok(entries.get('xl/sharedStrings.xml').includes(value));
  assert.equal(schema[0].width, 2654);
  const direct = unzip(await write([[{ type: String, value }]], { columns }));
  assert.match(direct.get('xl/worksheets/sheet1.xml'), /width="255"/);
  assert.equal(columns[0].width, 300);
  for (const width of [-1, Infinity, NaN]) {
    await assert.rejects(async () => write([[{ type: String, value }]], { columns: [{ width }] }), /column width/);
  }
});

test('oversized cell text fails explicitly and valid boundary text is preserved', async () => {
  const value = 'x'.repeat(32767);
  assert.ok(unzip(await write([[{ type: String, value }]])).get('xl/sharedStrings.xml').includes(value));
  await assert.rejects(async () => write([[{ type: String, value: value + 'x' }]]), /32767 characters/);
  await assert.rejects(async () => write([{}], { schema: [{
    column: 'Message', type: String, value: () => value + 'x'
  }] }), /32767 characters/);
});

test('sheet names are XML escaped without losing their text', async () => {
  const entries = unzip(await write([[{ type: String, value: 'test' }]], { sheet: 'A & "B" <C>' }));
  assert.match(entries.get('xl/workbook.xml'), /name="A &amp; &quot;B&quot; &lt;C&gt;"/);
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

test('browser fallback bounds shared-string retention and preserves later cells', async () => {
  const module = { exports: {} };
  const context = {
    module, exports: module.exports, Buffer: undefined,
    String, Number, Boolean, Date, Uint8Array, ArrayBuffer,
    Promise, setTimeout, clearTimeout, setImmediate, clearImmediate
  };
  context.global = context;
  vm.runInNewContext(fs.readFileSync(require.resolve('../lib/write-excel-file-min'), 'utf8'), context);
  const rows = Array.from({ length: 8200 }, (_, i) => [{ type: String, value: `browser-${i}` }]);
  const entries = unzip(await module.exports(rows));
  const shared = entries.get('xl/sharedStrings.xml');
  const worksheet = entries.get('xl/worksheets/sheet1.xml');
  assert.equal((shared.match(/<si>/g) || []).length, 8192);
  assert.match(worksheet, /<c r="A8193" t="inlineStr"><is><t>browser-8192<\/t><\/is><\/c>/);
});
test('large multi-sheet workbooks preserve shared and inline text after the string budget is reached', async () => {
  const rows = Array.from({ length: 2500 }, (_, i) => ({
    id: i + 1,
    text: ` ${i + 1}: ${'repeated text & <x> '.repeat(24)}\u00e9 `
  }));
  const schema = [
    { column: 'ID', type: Number, value: row => row.id },
    { column: 'Message', type: String, value: row => row.text }
  ];
  const output = await write([rows, [rows[2499], rows[0]]], { sheets: ['Export', 'Last'], schema: [schema, schema] });
  const entries = unzip(output);
  const firstSheet = entries.get('xl/worksheets/sheet1.xml');
  const secondSheet = entries.get('xl/worksheets/sheet2.xml');
  const strings = entries.get('xl/sharedStrings.xml');
  assert.equal((firstSheet.match(/<row\b/g) || []).length, 2501);
  assert.match(firstSheet, /<row r="2501">/);
  assert.match(secondSheet, /<row r="2">.*<v>2500<\/v>/);
  const escaped = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  assert.ok(strings.includes(`<t xml:space="preserve">${escaped(rows[0].text)}</t>`));
  assert.ok(!strings.includes(escaped(rows[2499].text)));
  assert.ok(firstSheet.includes(`<c r="B2501" t="inlineStr"><is><t xml:space="preserve">${escaped(rows[2499].text)}</t></is></c>`));
  assert.ok(secondSheet.includes(`<c r="B2" t="inlineStr"><is><t xml:space="preserve">${escaped(rows[2499].text)}</t></is></c>`));
  assert.match(secondSheet, /<c r="B3" t="s"><v>2<\/v><\/c>/);
  assert.ok(output.byteLength < Buffer.byteLength(firstSheet) / 5);
});

test('a late worksheet error rejects the export and does not affect the next workbook', async () => {
  const good = Array.from({ length: 1800 }, () => [{ type: String, value: 'sample'.repeat(50) }]);
  const bad = [...good, [{ type: String, value: 'x'.repeat(32768) }]];
  await assert.rejects(write([good, bad], { sheets: ['First', 'Second'] }), /32767 characters/);
  assert.ok(unzip(await write(good)).has('xl/worksheets/sheet1.xml'));
});

test('large XML rows stream cells without losing row heights or escaped inline text', async () => {
  const largeValue = index => String(index).padStart(4, '0') + '&<'.repeat(14998);
  const rows = Array.from({ length: 17 }, (_, index) => [{ type: String, value: largeValue(index) }]);
  rows.push([
    { type: String, value: largeValue(17), height: 23, fontWeight: 'bold' },
    { type: String, value: largeValue(18) }
  ]);
  const buffered = unzip(await write(rows));
  const stream = await write(rows, { outputStream: true });
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const streamed = unzip(Buffer.concat(chunks));
  assert.deepEqual(streamed, buffered);
  const worksheet = buffered.get('xl/worksheets/sheet1.xml');
  assert.match(worksheet, /<row r="18" ht="23" customHeight="1">/);
  assert.match(worksheet, /<c r="A18" s="\d+" t="inlineStr">/);
  assert.ok([...buffered.get('xl/styles.xml').matchAll(/<font>(.*?)<\/font>/g)].some(match => match[1].startsWith('<b/><sz')));
  const escaped = largeValue(18).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  assert.ok(worksheet.includes(`<c r="B18" t="inlineStr"><is><t>${escaped}</t></is></c>`));
});
test('multi-chunk compressed sheets retain their full contents and ZIP checksums', async () => {
  const rows = Array.from({ length: 512 }, (_, i) => ({
    payload: createHash('shake256', { outputLength: 640 }).update(String(i)).digest('base64')
  }));
  const output = await write([rows, rows.slice().reverse()], {
    sheets: ['Forward', 'Reverse'],
    objectKeys: ['payload']
  });
  const streamedParts = ['xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml', 'xl/sharedStrings.xml', 'xl/styles.xml'];
  const entries = unzip(output, streamedParts);
  for (const part of streamedParts) assert.ok(entries.has(part));
  const shared = [...entries.get('xl/sharedStrings.xml').matchAll(/<si><t>([^<]*)<\/t><\/si>/g)].map(match => match[1]);
  function values(sheetNumber) {
    const sheet = entries.get(`xl/worksheets/sheet${sheetNumber}.xml`);
    return [...sheet.matchAll(/<c\b[^>]* t="(s|inlineStr)">(?:<v>(\d+)<\/v>|<is><t>([^<]*)<\/t><\/is>)<\/c>/g)]
      .slice(1).map(match => match[1] === 's' ? shared[Number(match[2])] : match[3]);
  }
  const expected = rows.map(row => row.payload);
  assert.deepEqual(values(1), expected);
  assert.deepEqual(values(2), expected.slice().reverse());
  const encoded = await write([rows, rows.slice().reverse()], {
    sheets: ['Forward', 'Reverse'],
    objectKeys: ['payload'],
    outputBase64: true
  });
  assert.equal(typeof encoded, 'string');
  assert.deepEqual(unzip(Buffer.from(encoded, 'base64'), streamedParts), entries);
});

test('a failed Base64 export does not affect a concurrent or subsequent export', async () => {
  const rows = Array.from({ length: 1500 }, (_, i) => [{ value: `Message ${i}` }]);
  const options = { outputBase64: true };
  const results = await Promise.allSettled([
    write([...rows, [{ value: 'x'.repeat(32768) }]], options),
    write(rows, options)
  ]);
  assert.equal(results[0].status, 'rejected');
  assert.match(results[0].reason.message, /32767 characters/);
  assert.equal(results[1].status, 'fulfilled');
  const worksheet = 'xl/worksheets/sheet1.xml';
  assert.match(unzip(Buffer.from(results[1].value, 'base64')).get(worksheet), /<row r="1500">/);
  const next = await write([[{ value: 42 }]], options);
  assert.match(unzip(Buffer.from(next, 'base64')).get(worksheet), /<v>42<\/v>/);
});

test('a backpressured workbook stream yields the same entries as binary output and reports late errors', async () => {
  const rows = Array.from({ length: 600 }, (_, i) => [{ value: createHash('shake256', { outputLength: 640 }).update(String(i)).digest('base64') }]);
  const stream = await write(rows, { outputStream: true });
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
    await new Promise(resolve => setImmediate(resolve));
  }
  assert.deepEqual(unzip(Buffer.concat(chunks)), unzip(await write(rows)));

  const failed = await write([...rows, [{ value: 'x'.repeat(32768) }]], { outputStream: true });
  await assert.rejects(async () => { for await (const _ of failed) { /* Drain. */ } }, /32767 characters/);
  const cancelled = await write(rows, { outputStream: true });
  for await (const _ of cancelled) break;
  assert.equal(cancelled.destroyed, true);
});

test('native deflate works on older Node versions without a native CRC32 function', async () => {
  const module = { exports: {} };
  const { createDeflateRaw } = require('node:zlib');
  let nativeCalls = 0;
  const context = {
    module, exports: module.exports, Buffer,
    require(name) {
      if (name === 'zlib') return { createDeflateRaw(options) { nativeCalls++; return createDeflateRaw(options); } };
      return require(name);
    },
    String, Number, Boolean, Date, Uint8Array, ArrayBuffer,
    Promise, setTimeout, clearTimeout, setImmediate, clearImmediate
  };
  context.global = context;
  vm.runInNewContext(fs.readFileSync(require.resolve('../lib/write-excel-file-min'), 'utf8'), context);
  const value = 'A & \u00e9 '.repeat(4500);
  const rows = [[{ type: String, value }]];
  const bytes = await module.exports(rows);
  assert.ok(nativeCalls > 0);
  assert.deepEqual(unzip(bytes), unzip(await write(rows)));
});

test('lazy object rows preserve auto headers, sparse columns, and inferred cell types', async () => {
  const rows = [
    { name: 'first', count: 0 },
    { active: false, name: 'second', count: null },
    {},
    { count: 5, note: 'last & <row>', active: true }
  ];
  const options = { sheet: 'Data', stickyRowsCount: 1 };
  const legacyRows = [
    ['Name', 'Count', 'Active', 'Note'].map(value => ({ value, fontWeight: 'bold' })),
    [{ value: 'first' }, { value: 0 }],
    [{ value: 'second' }, { value: null }, { value: false }],
    [],
    [undefined, { value: 5 }, { value: true }, { value: 'last & <row>' }]
  ];
  const expected = unzip(await write(legacyRows, options));
  const actual = unzip(await write(rows, { ...options, objectKeys: ['name', 'count', 'active', 'note'] }));
  assert.deepEqual(actual, expected);
  assert.deepEqual(rows[1], { active: false, name: 'second', count: null });
});
