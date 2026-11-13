const { chromium } = require('playwright'); const fs = require('fs');
const src = fs.readFileSync('/home/user/vibe261102/hannyomi/src/systems/skillx.js', 'utf8').replace('G.SkillX = {', 'G.__FXS = FXS; G.SkillX = {');
const LIST = [['stormcloud', '천궁 폭풍우 (궁수 a 4차 궁극기)', 0.45], ['cloud', '썬더 스톰 (3차) · 천둥 신의 분노 (궁극기)', 0.4], ['sun', '태양 낙하 (화염군주 궁극기)', 0.45], ['gate', '천공의 화살비 (천궁 4차)', 0.45], ['darknight', '칠흑의 밤 · 야천 멸살 (야천)', 0.45], ['thunderpillar', '천둥의 심판 (현자 4차)', 0.2]];
(async () => { const b = await chromium.launch(); const W = 1500, H = 760; const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(1500); await pg.addScriptTag({ content: src });
  await pg.evaluate(([LIST, W, H]) => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999'; document.body.appendChild(cv); const c = cv.getContext('2d');
    c.fillStyle = '#e9ecf8'; c.fillRect(0, 0, W, H); const cw = W / 3, ch = (H) / 2;
    const lk = G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), { hairStyle: 'short', hairColor: '#4a3a2a' }), '#f4f6ff', '#c8d0e8');
    LIST.forEach(([k, name, at], i) => { const x0 = (i % 3) * cw, y0 = Math.floor(i / 3) * ch; c.save(); c.beginPath(); c.rect(x0 + 2, y0 + 2, cw - 4, ch - 4); c.clip();
      const g = c.createLinearGradient(0, y0, 0, y0 + ch); g.addColorStop(0, '#8ab4e0'); g.addColorStop(1, '#d8e8f4'); c.fillStyle = g; c.fillRect(x0, y0, cw, ch); c.fillStyle = '#7a9a5a'; c.fillRect(x0, y0 + ch - 30, cw, 30);
      // 화면 0.5배로 축소해서 그림 (스킬은 캐릭터 위 400px 근처라)
      c.translate(x0 + 60, y0 + ch - 30); c.scale(0.5, 0.5); const p = { x: 0, y: 0, sx: 0, dir: 1, t: 1 }; let got = null; const add = G.FX.add; G.FX.add = o => { got = got || o; };
      try { G.__FXS[k](p, {}, '#a0c8ff'); } catch (e) { } G.FX.add = add;
      if (got && got.draw) { c.save(); got.draw(c, got, at); c.restore(); }
      G.Draw.humanoid(c, { x: 0, y: 0, dir: 1, t: 1, look: lk, weapon: 'wand', wcolor: '#ddd', scale: 1 }); c.restore();
      c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(x0 + 2, y0 + 2, cw - 4, 26); c.fillStyle = '#1a2040'; c.font = 'bold 14px sans-serif'; c.fillText((i + 1) + '. ' + name, x0 + 10, y0 + 20); }); }, [LIST, W, H]);
  await pg.screenshot({ path: 'skyfx_now.png' }); await b.close(); })();
