// node strip.js <js> <ns> <key> <weapon> <out>  — 한 안을 6장면(시간)으로
const { chromium } = require('playwright'); const fs = require('fs'); const [js, ns, k, wp, out] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const W = 960, H = 340; const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(1500); await pg.addScriptTag({ content: fs.readFileSync(js, 'utf8') });
  await pg.evaluate(([ns, k, wp, W, H, T]) => { const process_T = T; const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:' + W + 'px'; document.body.appendChild(cv); const c = cv.getContext('2d'); c.scale(2, 2);
    [['#3a2a1e', '#1e140c'], ['#c8dcf4', '#eef4fc']].forEach(([a, b2], r) => { const g = c.createLinearGradient(0, r * 170, 0, r * 170 + 170); g.addColorStop(0, a); g.addColorStop(1, b2); c.fillStyle = g; c.fillRect(0, r * 170, W, 170); });
    const lk = G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), { hairStyle: 'short', hairColor: '#4a3a2a' }), '#f4f6ff', '#c8d0e8');
    const eq = { hat: { tid: 'ar85_hat' }, top: { tid: 'ar85_top' }, bottom: { tid: 'ar85_bottom' }, shoes: { tid: 'ar85_shoes' }, gloves: { tid: 'ar85_gloves' }, cape: { tid: 'ar85_cape' } }; const gear = G.Outfit.gearOf(eq);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const t = (process_T || (Math.PI * 2 / 1.6)) * i / 6; const p = { x: 80 + i * 160, y: r * 170 + 150, dir: 1, t };
      if (G[ns][k]) G[ns][k](c, p, t); G.Draw.humanoid(c, { x: p.x, y: p.y, dir: 1, t, look: lk, gear, weapon: wp, wcolor: '#d8dce8', scale: 1 }); if (G[ns][k + 'Front']) G[ns][k + 'Front'](c, p, t); } }, [ns, k, wp, W, H, +(process.argv[7] || 0)]);
  await pg.screenshot({ path: out }); await b.close(); })();
