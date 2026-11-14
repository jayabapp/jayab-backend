const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { verifyBuild } = require('./verify-build.cjs');

test('compiled imports must resolve from the emitted file', (t) => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'jayab-build-check-'));
  t.after(() => fs.rmSync(dist, { recursive: true, force: true }));
  const src = path.join(dist, 'src');
  fs.mkdirSync(path.join(src, 'config'), { recursive: true });
  const entry = path.join(src, 'main.js');
  const target = path.join(src, 'config', 'settings.js');
  fs.writeFileSync(target, 'module.exports = {};');

  fs.writeFileSync(entry, 'require("src/config/settings");');
  assert.throws(() => verifyBuild(dist, false), /src\/config\/settings/);
  fs.writeFileSync(entry, 'require("./config/settings");');
  assert.equal(verifyBuild(dist, false), 2);
  fs.unlinkSync(target);
  assert.throws(() => verifyBuild(dist, false), /\.\/config\/settings/);
});
