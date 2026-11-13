// node sheet.js <mockjs> <G.이름> <buffId> <weapon> <제목> <가 이름> <나> <다> <라> <out.png>
const { chromium } = require('playwright'); const fs = require('fs'); const [js, ns, bid, wp, title, n1, n2, n3, n4, out] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const W = 1300, H = 680; const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(1500); await pg.addScriptTag({ content: fs.readFileSync(js, 'utf8') });
  await pg.evaluate(([ns, bid, wp, title, names, W, H]) => { const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:' + W + 'px'; document.body.appendChild(cv); const c = cv.getContext('2d'); c.scale(2, 2);
    const cols = [['지금', null]].concat(names.map((n, i) => [n, ['ga', 'na', 'da', 'ra'][i]])); const bgs = [['#3a2a1e', '#1e140c'], ['#c8dcf4', '#eef4fc']];
    c.fillStyle = '#e9ecf8'; c.fillRect(0, 0, W, 80); c.fillStyle = '#1a2040'; c.font = 'bold 20px sans-serif'; c.fillText(title, 16, 30); c.font = 'bold 16px sans-serif'; cols.forEach(([n], i) => c.fillText(n, i * 260 + 16, 66));
    bgs.forEach(([a, b2], r) => { const y0 = 80 + r * 300; const g = c.createLinearGradient(0, y0, 0, y0 + 300); g.addColorStop(0, a); g.addColorStop(1, b2); c.fillStyle = g; c.fillRect(0, y0, W, 300); });
    for (let i = 1; i < 5; i++) { c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(i * 260 - 1, 80, 2, 600); }
    const lk = G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), { hairStyle: 'short', hairColor: '#4a3a2a' }), '#f4f6ff', '#c8d0e8');
    const eq = { hat: { tid: 'ar85_hat' }, top: { tid: 'ar85_top' }, bottom: { tid: 'ar85_bottom' }, shoes: { tid: 'ar85_shoes' }, gloves: { tid: 'ar85_gloves' }, cape: { tid: 'ar85_cape' } }; for (const k in eq) if (!G.ITEMS[eq[k].tid]) delete eq[k];
    const gear = G.Outfit.gearOf(eq);
    bgs.forEach((_, r) => cols.forEach(([n, k], i) => { const p = { x: i * 260 + 130, y: 80 + r * 300 + 280, dir: 1, t: 1.2 + i * 0.37 + r * 0.2, buffs: {}, dead: false };
      p.drawOpts = () => ({ x: 0, y: 0, dir: 1, t: 1, look: lk, gear, weapon: wp, wcolor: '#d8dce8', scale: 1 });
      if (k === null) { p.buffs[bid] = {}; G.SkillX.aura(c, p); } else G[ns][k](c, p, p.t);
      G.Draw.humanoid(c, { x: p.x, y: p.y, dir: 1, t: p.t, look: lk, gear, weapon: wp, wcolor: '#d8dce8', scale: 1 }); }));
  }, [ns, bid, wp, title, [n1, n2, n3, n4], W, H]);
  await pg.screenshot({ path: out }); console.log(errs.slice(0, 3)); await b.close(); })();
