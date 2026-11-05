// 앱 아이콘 A(여덟 번째 별) → PNG 뽑기 (모바일 2차-1)
//  실행: hannyomi 폴더를 웹 서버로 띄운 뒤 (예: python3 -m http.server 8123)
//        node docs/drafts/icons/export_icons.js http://localhost:8123 icons
//  icon_drafts.html 의 iconA() 를 그대로 그려서 크기별 PNG 를 만든다 (playwright 필요)
const { chromium } = require('playwright');
const path = require('path');
const base = process.argv[2] || 'http://localhost:8123', out = process.argv[3] || 'icons';
const SIZES = [['icon-180.png', 180], ['icon-192.png', 192], ['icon-512.png', 512], ['icon-1024.png', 1024], ['favicon-32.png', 32]];
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  await pg.goto(base + '/docs/drafts/icons/icon_drafts.html');
  const svg = await pg.evaluate(() => iconA());
  for (const [name, size] of SIZES) {
    const p2 = await b.newPage({ viewport: { width: size, height: size } });
    await p2.setContent(`<html><body style="margin:0;background:#07090f">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
    await p2.waitForTimeout(150);
    await p2.screenshot({ path: path.join(out, name), clip: { x: 0, y: 0, width: size, height: size } });
    await p2.close();
    console.log('made', name);
  }
  await b.close();
})();
