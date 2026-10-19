// Run: node tests/paths.test.js — the site is served from a sub-path (/clubs-for-love/),
// so no page may use root-absolute links; config.js must never contain a secret key;
// and every local link/asset must exist.
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..');
const html = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const files = [...html, ...fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f), 'css/styles.css', 'site.webmanifest'];
let passed = 0, links = 0;
for (const f of files) {
  const s = fs.readFileSync(path.join(root, f), 'utf8');
  const bad = s.match(/(?:href|src|action|srcset)=["']\/(?!\/)[^"']*/g) || [];
  assert.deepStrictEqual(bad, [], f + ' has root-absolute paths: ' + bad.join(', '));
  assert.ok(!/location\.origin\s*\+\s*["']\//.test(s), f + ' builds URLs from location.origin (breaks on sub-path)');
  assert.ok(!/url\(\s*["']?\/(?!\/)/.test(s), f + ' has a root-absolute CSS url()');
  if (f.endsWith('.html') && f !== '404.html') {
    for (const m of s.matchAll(/(?:href|src|srcset)="([^"#?:]+)(?:[?#][^"]*)?"/g)) {
      const target = m[1];
      if (/^(mailto|tel|https?|data)/.test(target) || target === '') continue;
      assert.ok(fs.existsSync(path.join(root, target)), f + ' links to missing file ' + target);
      links++;
    }
    assert.ok(/og:image" content="https:\/\/platinum00001\.github\.io\/clubs-for-love\/og\.jpg"/.test(s), f + ' missing og:image');
    assert.ok(/twitter:card" content="summary_large_image"/.test(s), f + ' missing twitter card');
    assert.ok(/id="our-sites"/.test(s), f + ' missing Our Sites footer');
    assert.ok(/privacy\.html/.test(s) && /terms\.html/.test(s), f + ' missing privacy/terms links');
  }
  passed++;
}
assert.ok(/id="data-deletion"/.test(fs.readFileSync(path.join(root, 'privacy.html'), 'utf8')), 'privacy.html needs #data-deletion');
const cfg = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
const code = cfg.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
assert.ok(!/service_role|sb_secret_/.test(code), 'config.js must not contain a service_role/secret key');
assert.ok(/CONTACT_EMAIL:\s*"clubs4lovema@gmail\.com"/.test(cfg), 'CONTACT_EMAIL constant missing');
const jwt = cfg.match(/eyJ[\w-]+\.([\w-]+)\./);
if (jwt) assert.notStrictEqual(JSON.parse(Buffer.from(jwt[1], 'base64').toString()).role, 'service_role');
// The email address should only be hard-coded in config.js (pages get it via data-email), apart from no-JS fallback text.
for (const f of files.filter(f => f.startsWith('js/'))) assert.ok(!/clubs4lovema@gmail\.com/.test(fs.readFileSync(path.join(root, f), 'utf8')) || f === 'js/common.js', f + ' hard-codes the contact email');
console.log('✓', passed, 'files use sub-path-safe links;', links, 'local links resolve; config.js has no secret key');
