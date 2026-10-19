// Headless check of every page: JS errors, failed requests, screenshots.
// Usage: node tools/smoke.js <baseURL> <shotDir>   (needs puppeteer-core + Chrome)
const puppeteer = require(process.env.PUPPETEER || 'puppeteer-core');
const fs = require('fs');
const base = process.argv[2] || 'https://platinum00001.github.io/clubs-for-love/';
const out = process.argv[3] || 'shots';
const pages = ['', 'about.html', 'donate.html', 'pickup.html', 'request.html', 'drop-off.html', 'sponsors.html', 'affiliates.html', 'stories.html', 'calendar.html', 'contact.html', 'account.html', 'staff.html', 'privacy.html', 'terms.html', 'nope-404'];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const results = [];
  for (const p of pages) {
    const page = await b.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    const errs = [], fails = [];
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('response', (r) => { if (r.status() >= 400) fails.push(r.status() + ' ' + r.url()); });
    page.on('requestfailed', (r) => fails.push('failed ' + r.url() + ' ' + (r.failure() || {}).errorText));
    const resp = await page.goto(base + p, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1500));
    const name = (p || 'index').replace('.html', '');
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    if (p === '' ) { await page.setViewport({ width: 390, height: 844 }); await page.screenshot({ path: `${out}/index-mobile.png`, fullPage: true }); }
    const title = await page.title();
    results.push({ page: p || 'index', status: resp.status(), title, errors: errs, failed: fails });
    await page.close();
  }
  await b.close();
  console.log(JSON.stringify(results, null, 1));
})();
