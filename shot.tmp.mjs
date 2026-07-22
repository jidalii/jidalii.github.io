import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await p.waitForTimeout(900);
await p.screenshot({ path: '/tmp/footer-flat.png', clip: { x: 0, y: 700, width: 1440, height: 200 } });
await b.close();
