// Fills the donate form headlessly: checks photo requirement and the email fallback.
const puppeteer = require(process.env.PUPPETEER || 'puppeteer-core');
const base = process.argv[2], img = process.argv[3];
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(base + 'donate.html', { waitUntil: 'networkidle2' });
  await p.type('#f-name', 'Test Donor'); await p.type('#f-email', 'donor@test.invalid');
  await p.click('input[name=items][value="Clubs and bags"]'); await p.click('input[name=collect][value="Drop in Falmouth"]'); await p.click('input[name=gift_terms]');
  await p.click('button[type=submit]'); await new Promise((r) => setTimeout(r, 800));
  const noPhoto = await p.$eval('.form-status', (e) => e.innerText);
  const inp = await p.$('#donation-lib'); await inp.uploadFile(img); await new Promise((r) => setTimeout(r, 500));
  const thumbs = await p.$$eval('.thumb', (t) => t.length);
  await p.click('button[type=submit]'); await new Promise((r) => setTimeout(r, 4000));
  const after = await p.$eval('.form-status', (e) => e.innerText);
  const mailto = await p.$eval('.form-status a.btn', (a) => a.href).catch(() => '');
  await p.screenshot({ path: process.argv[4] || '/tmp/c4l_formtest.png', fullPage: false });
  console.log(JSON.stringify({ noPhoto, thumbs, after, mailto: decodeURIComponent(mailto).slice(0, 300), errs }, null, 1));
  await b.close();
})();
