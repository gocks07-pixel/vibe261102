// node compose.js out title "id|이름|설명" ... [--crop y0,y1] — 줄마다 4장면
const { chromium } = require('playwright'); const fs = require('fs');
const args = process.argv.slice(2); const out = args[0], title = args[1]; let crop = [170, 720], cx = [0, 1280]; const rows = [];
for (let i = 2; i < args.length; i++) { if (args[i] === '--crop') { crop = args[++i].split(',').map(Number); } else if (args[i] === '--x') { cx = args[++i].split(',').map(Number); } else rows.push(args[i].split('|')); }
(async () => { const b = await chromium.launch(); const sw = 620, sh = Math.round((crop[1] - crop[0]) * sw / (cx[1] - cx[0])), W = sw * 4 + 30, H = 56 + rows.length * (sh + 46);
  const pg = await b.newPage({ viewport: { width: W, height: H } });
  const imgs = rows.map(([id]) => [0, 1, 2, 3].map(k => 'data:image/png;base64,' + fs.readFileSync(`ss_${id}_${k}.png`).toString('base64')));
  await pg.setContent('<body style="margin:0"><canvas id=c></canvas></body>');
  await pg.evaluate(async ([rows, imgs, W, H, sw, sh, crop, title, cx]) => { const cv = document.getElementById('c'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); c.fillStyle = '#e9ecf8'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#1a2040'; c.font = 'bold 22px sans-serif'; c.fillText(title, 14, 34);
    for (let r = 0; r < rows.length; r++) { const y0 = 56 + r * (sh + 46); c.font = 'bold 17px sans-serif'; c.fillStyle = '#1a2040'; c.fillText(rows[r][1] + '  —  ' + rows[r][2], 14, y0 + 26);
      for (let k = 0; k < 4; k++) { const im = new Image(); im.src = imgs[r][k]; await im.decode(); const s = im.width / 1280; c.drawImage(im, cx[0] * s, crop[0] * s, (cx[1] - cx[0]) * s, (crop[1] - crop[0]) * s, 6 + k * (sw + 6), y0 + 38, sw, sh); } } }, [rows, imgs, W, H, sw, sh, crop, title, cx]);
  await pg.locator('#c').screenshot({ path: out }); await b.close(); })();
