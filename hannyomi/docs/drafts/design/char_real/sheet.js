const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 860 }, deviceScaleFactor: 2 }); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(1500); await pg.addScriptTag({ content: fs.readFileSync('charfx.js', 'utf8') });
  await pg.evaluate(() => { const cv = document.createElement('canvas'); cv.width = 2400; cv.height = 1720; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:1200px'; document.body.appendChild(cv); const ctx = cv.getContext('2d'); ctx.scale(2, 2);
    const g = ctx.createLinearGradient(0, 0, 0, 860); g.addColorStop(0, '#8ab4e0'); g.addColorStop(1, '#d8e8f4'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1200, 860);
    const eqOf = key => { const eq = {}; ['hat','top','bottom','shoes','gloves','cape'].map(s => `ar${key}_${s}`).filter(id => G.ITEMS[id]).forEach(id => eq[G.ITEMS[id].slot] = { tid: id }); return eq; };
    const P = (lookIn, key, wtype) => { const eq = key ? eqOf(key) : {}; const it = s => eq[s] ? G.ITEMS[eq[s].tid] : null; const L = G.LOOKS.toDraw(Object.assign(G.LOOKS.def(lookIn.gender || 'm'), lookIn), it('top') && it('top').color, it('bottom') && it('bottom').color);
      return { dir: 1, t: 0.6, atk: -1, look: L, gear: G.Outfit.gearOf(eq), hatColor: it('hat') ? it('hat').color : null, cape: it('cape') ? it('cape').color : null, weapon: wtype || null, wcolor: '#d8d8e0' }; };
    const N = id => { const n = G.NPCS[id]; return { dir: 1, t: 0.6, atk: -1, look: Object.assign({ skin: '#ffe0c2' }, n.look) }; };
    const cols = [['연희 (모험가)', P({ hairStyle: 'short', hairColor: '#684932' }, 0, 'sword')], ['여자 · 긴 머리', P({ gender: 'f', hairStyle: 'long', hairColor: '#DDBC85', eye: 'big' }, 0, null)], ['은빛 기사', P({ hairStyle: 'spiky', hairColor: '#282936' }, 40, 'sword')],
      ['루미 (NPC)', N('lumi')], ['하르몬 (NPC)', N('harmon')], ['루루 (NPC)', N('lulu')]];
    const rows = [['지금', 0, false], ['장비 나 (적용됨)', 0, true], ['가 피부 음영', 1, true], ['나 + 머리 윤기', 2, true], ['다 + 주변 빛', 3, true]];
    ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = '#1a2040';
    cols.forEach(([nm], ci) => ctx.fillText(nm, 120 + ci * 180 - ctx.measureText(nm).width / 2 + 20, 20));
    rows.forEach(([nm, lv, gear], ri) => { const yb = 190 + ri * 165; ctx.fillStyle = '#1a2040'; ctx.fillText(nm, 8, yb - 120); ctx.fillStyle = 'rgba(122,154,90,.5)'; ctx.fillRect(0, yb, 1200, 3);
      cols.forEach(([, dop], ci) => CharFX.render(ctx, 140 + ci * 180, yb, 1.75, dop, lv, gear)); }); });
  await pg.screenshot({ path: 'c1.png' }); await pg.screenshot({ path: 'c2.png', clip: { x: 60, y: 30, width: 540, height: 1 } }).catch(()=>{}); console.log(errs); await b.close(); })();
