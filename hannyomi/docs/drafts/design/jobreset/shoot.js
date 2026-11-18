const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 600 }, deviceScaleFactor: 2 }); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('http://127.0.0.1:8123/index.html'); await pg.waitForTimeout(1500); await pg.addScriptTag({ content: fs.readFileSync('sage.js', 'utf8') });
  await pg.evaluate(() => { const cv = document.createElement('canvas'); cv.width = 2400; cv.height = 1200; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:1200px'; document.body.appendChild(cv); const c = cv.getContext('2d'); c.scale(2, 2);
    const g = c.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, '#9ac4e8'); g.addColorStop(1, '#e8f0f4'); c.fillStyle = g; c.fillRect(0, 0, 1200, 600); c.fillStyle = '#8aa86a'; c.fillRect(0, 520, 1200, 80);
    ['ga', 'na', 'da'].forEach((v, i) => { const x = 200 + i * 400; SageNPC.draw(c, x, 520, 4, v, 1.2);
      c.fillStyle = '#1a2040'; c.font = 'bold 22px "Malgun Gothic"'; c.textAlign = 'center'; c.fillText(SageNPC.V[v].name, x, 40);
      // 게임 크기 (작게)
      SageNPC.draw(c, x + 140, 520, 1, v, 1.2); c.font = '11px "Malgun Gothic"'; c.fillText('게임 크기', x + 140, 540); });
  });
  await pg.screenshot({ path: 'sage.png' }); console.log(errs); await b.close(); })();
