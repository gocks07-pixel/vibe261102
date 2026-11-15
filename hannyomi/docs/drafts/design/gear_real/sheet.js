const { chromium } = require('playwright'); const fs = require('fs');
const SETS0 = [['초보 탐험가', 'leather', ['leather_hat','leather_vest','leather_pants','leather_boots','leather_gloves'], 'sword_iron'], ['새싹 견습생', 'sprout', ['sprout_hat','sprout_top','sprout_bottom','sprout_shoes','traveler_cape','traveler_gloves'], 'sword_steel'],
 ['은빛 기사', 30], ['증기 기술자', 40], ['모래 왕국 근위병', 55], ['서리 사냥꾼', 70], ['하늘 순례자', 85], ['공허의 그림자', 90], ['별의 기사', 'star', ['trial_hat','trial_top','trial_bottom','trial_shoes','trial_gloves','trial_cape'], 'trial_sword']];
const [out, part] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 }); pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(1500); await pg.addScriptTag({ content: fs.readFileSync('gear.js', 'utf8') });
  const list = part === '1' ? SETS0.slice(0, 5) : SETS0.slice(5);
  const h = await pg.evaluate((list) => { document.body.innerHTML = ''; document.body.style.cssText = 'margin:0;background:#e9ecf8';
    const W = 1400, rowH = 250, H = 56 + list.length * rowH, cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2; cv.style.width = W + 'px'; document.body.appendChild(cv); const ctx = cv.getContext('2d'); ctx.scale(2, 2);
    ctx.fillStyle = '#e9ecf8'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#1a2040'; ctx.font = 'bold 18px sans-serif';
    [['지금 게임', 150], ['가: 빛 · 그림자만', 610], ['나: + 옷감 결 · 금속 광택', 1050]].forEach(([t, x]) => ctx.fillText(t, x, 34));
    list.forEach(([name, key, pieces, wid], r) => { let ids = pieces; if (typeof key === 'number') ids = ['hat','top','bottom','shoes','gloves','cape'].map(s => `ar${key}_${s}`).filter(id => G.ITEMS[id]);
      const y0 = 56 + r * rowH; for (let c = 0; c < 3; c++) { const g = ctx.createLinearGradient(0, y0, 0, y0 + rowH - 8); g.addColorStop(0, '#8ab4e0'); g.addColorStop(1, '#d8e8f4'); ctx.fillStyle = g; ctx.fillRect(10 + c * 462, y0, 452, rowH - 8); ctx.fillStyle = '#7a9a5a'; ctx.fillRect(10 + c * 462, y0 + rowH - 36, 452, 28); }
      ctx.fillStyle = '#1a2040'; ctx.font = 'bold 15px sans-serif'; ctx.fillText(name, 20, y0 + 20);
      [['warrior', 'm', 'short', '#2a1a12'], ['mage', 'f', 'long', '#5a3a22']].forEach(([fam, gd, hs, hc], i) => {
        let wi = null; if (typeof key === 'number') wi = [key, key + 5, key - 5].map(l => `wp${l}_${fam}`).find(id => G.ITEMS[id]); else if (fam === 'warrior') wi = wid; else wi = key === 'star' ? 'trial_wand' : null;
        const eq = {}; for (const id of ids.concat(wi && G.ITEMS[wi] ? [wi] : [])) eq[G.ITEMS[id].slot] = { tid: id }; const it = s => eq[s] ? G.ITEMS[eq[s].tid] : null;
        const L = G.LOOKS.toDraw(Object.assign(G.LOOKS.def(gd), { hairStyle: hs, hairColor: hc })), look = Object.assign({}, L, { top: it('top') ? it('top').color : L.top, bottom: it('bottom') ? it('bottom').color : L.bottom }), wp = it('weapon');
        const draw = (o) => G.Draw.humanoid(o, { x: 0, y: 0, dir: 1, t: 0.6, atk: -1, scale: 2.1, look, gear: G.Outfit.gearOf(eq), hatColor: it('hat') ? it('hat').color : null, cape: it('cape') ? it('cape').color : null, weapon: wp ? wp.type : null, wcolor: wp ? wp.color : null });
        for (let c = 0; c < 3; c++) GearReal.render(ctx, 130 + i * 200 + c * 462, y0 + rowH - 36, 2.1, draw, c);
      }); });
    return H; }, list);
  await pg.setViewportSize({ width: 1400, height: h }); await pg.screenshot({ path: out, fullPage: true }); await b.close(); })();
