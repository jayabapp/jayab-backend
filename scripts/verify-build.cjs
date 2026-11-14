const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');

function verifyBuild(dist = path.join(projectRoot, 'dist'), checkAssets = true) {
  const entry = path.join(dist, 'src', 'main.js');
  assert.ok(fs.existsSync(entry), `Missing compiled entry: ${entry}`);

  let checked = 0;
  const failures = [];
  function visit(directory) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) {
        visit(file);
        continue;
      }
      if (!item.name.endsWith('.js')) continue;
      checked++;
      const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.ES2022);
      function scan(node) {
        if (
          ts.isCallExpression(node) &&
          node.arguments.length === 1 &&
          ts.isStringLiteral(node.arguments[0]) &&
          (node.expression.getText(source) === 'require' ||
            node.expression.getText(source) === 'require.resolve')
        ) {
          const specifier = node.arguments[0].text;
          try {
            const resolved = require.resolve(specifier, { paths: [path.dirname(file)] });
            if (specifier.startsWith('.') && !fs.existsSync(resolved)) throw new Error('Missing file');
          } catch {
            failures.push(`${path.relative(dist, file)}: ${specifier}`);
          }
        }
        ts.forEachChild(node, scan);
      }
      scan(source);
    }
  }
  visit(dist);
  if (checkAssets) {
    for (const asset of [
      'views/success-payment.ejs',
      'views/failed-payment.ejs',
      'views/fonts/woff2/Estedad-Regular.woff2',
      'storage/public/index.html',
      'storage/public/robots.txt',
      'node_modules/.prisma/client/default.js',
    ]) {
      if (!fs.existsSync(path.join(projectRoot, asset))) failures.push(`Missing runtime asset: ${asset}`);
    }
  }
  assert.deepEqual(failures, [], `Unresolved compiled imports or missing assets:\n${failures.join('\n')}`);
  return checked;
}

if (require.main === module) console.log(`Verified ${verifyBuild()} compiled JavaScript files`);
module.exports = { verifyBuild };
