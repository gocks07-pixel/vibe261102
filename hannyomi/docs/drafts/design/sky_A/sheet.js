// node sheet.js <out> <제목> [k=0.45] — 행: 1~3번 스킬, 열: 지금 · 가 · 나
const { chromium } = require('playwright'); const fs = require('fs'); const [out, title, kk] = process.argv.slice(2);
const src = fs.readFileSync('/home/user/vibe261102/hannyomi/src/systems/skillx.js', 'utf8').replace('G.SkillX = {', 'G.__FXS = FXS; G.SkillX = {');
const ROWS = [['stormcloud', '1. 천궁 폭풍우', 's1a', '가: 거대한 적란운 + 비 + 번개', 's1b', '나: 먹구름 + 회오리 바람'],
  ['cloud', '2. 썬더 스톰 · 천둥 신의 분노', 's2a', '가: 먹구름 띠 + 속에서 푸른 번쩍', 's2b', '나: 가 + 아래로 갈라지는 번개'],
  ['sun', '3. 태양 낙하', 's3a', '가: 눈부신 해 (빛살 · 렌즈 빛)', 's3b', '나: 불타는 태양 (표면 불꽃)']];
(async () => { const b = await chromium.launch(); const cw = 500, ch = 400, W = cw * 3, H = 40 + ch * 3; const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(1500); await pg.addScriptTag({ content: src }); await pg.addScriptTag({ content: fs.readFileSync('skyreal.js', 'utf8') });
  await pg.evaluate(([ROWS, cw, ch, W, H, title, K]) => { const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:' + W + 'px'; document.body.appendChild(cv); const c = cv.getContext('2d'); c.scale(2, 2);
    c.fillStyle = '#e9ecf8'; c.fillRect(0, 0, W, H); c.fillStyle = '#1a2040'; c.font = 'bold 18px sans-serif'; c.fillText(title, 12, 27);
    const lk = G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), { hairStyle: 'short', hairColor: '#4a3a2a' }), '#f4f6ff', '#c8d0e8');
    ROWS.forEach(([fxk, nm, ka, na, kb, nb], r) => [['지금 · ' + nm, null], [na, ka], [nb, kb]].forEach(([label, key], col) => { const x0 = col * cw, y0 = 40 + r * ch;
      c.save(); c.beginPath(); c.rect(x0 + 2, y0 + 2, cw - 4, ch - 4); c.clip(); const g = c.createLinearGradient(0, y0, 0, y0 + ch); g.addColorStop(0, '#7aa6d8'); g.addColorStop(1, '#d8e8f4'); c.fillStyle = g; c.fillRect(x0, y0, cw, ch); c.fillStyle = '#6a8a4a'; c.fillRect(x0, y0 + ch - 30, cw, 30);
      c.translate(x0 + 50, y0 + ch - 30); c.scale(0.55, 0.55); const p = { x: 0, y: 0, sx: 0, dir: 1, t: 1 }; let got = null; const add = G.FX.add; G.FX.add = o => { got = got || o; }; try { G.__FXS[fxk](p, {}, '#a0c8ff'); } catch (e) { } G.FX.add = add;
      if (key === null) { if (got) { c.save(); got.draw(c, got, K); c.restore(); } } else { c.save(); G.SkyReal.opt[key](c, got, K, 1.3 + K * 1.2); c.restore(); }
      G.Draw.humanoid(c, { x: 0, y: 0, dir: 1, t: 1, look: lk, weapon: r === 0 ? 'bow' : 'wand', wcolor: '#ddd', scale: 1 }); c.restore();
      c.fillStyle = 'rgba(255,255,255,.88)'; c.fillRect(x0 + 2, y0 + 2, cw - 4, 24); c.fillStyle = '#1a2040'; c.font = 'bold 13px sans-serif'; c.fillText(label, x0 + 10, y0 + 19); })); }, [ROWS, cw, ch, W, H, title, +(kk || 0.45)]);
  await pg.screenshot({ path: out }); await b.close(); })();
