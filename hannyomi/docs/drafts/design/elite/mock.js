const { chromium } = require('playwright'); const fs = require('fs');
const DUMP = fs.readFileSync('../boss/dump/mage_b_void_throne.json', 'utf8').trim();
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await pg.goto('http://127.0.0.1:8123/index.html'); await pg.waitForTimeout(2500);
  for (const v of ['now', 'ga', 'na', 'da']) {
    const du = await pg.evaluate(([d, v]) => { if (G.Mobile) G.Mobile.closeModal(); G.Game.loop = () => {}; G.UI.overlay(''); G.Game.save = () => {}; G.Game.begin(JSON.parse(d)); G.Game.changeMap('star_corridor', null);
      const w = G.Game.world, p = G.Game.player; p.hurt = () => {}; p.trueDamage = () => {}; G.MonSkill.update = () => false; let ts = performance.now();
      const E = w.monsters.find(m => m.id === 'storm_guardian'); w.monsters.forEach(m => { if (m !== E) m.d = Object.assign({}, m.d, { harmless: true, aggressive: false }); });
      if (v !== 'now') { E.x = 1180; E.y = G.GROUND_Y; } p.x = v === 'now' ? 700 : 900; p.dir = 1;
      E.update = function () {}; for (let i = 0; i < 40; i++) { ts += 16.7; G.Game.frame(ts); G.Input.endFrame(); p.x = v === 'now' ? 700 : 900; p.y = G.GROUND_Y; p.onGround = true; p.dir = 1; }
      if (v === 'da') E.dead = true, E.deadT = 0.3;
      ts += 16.7; G.Game.frame(ts);
      const c = document.getElementById('canvas').getContext('2d'), S = G.SpellFX.soft, cam = w.cam, ex = E.x - cam, gy = G.GROUND_Y, t = w.time;
      const ring = (x, y, R, col, a, lw) => { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.ellipse(x, y, R, R * 0.16, 0, 0, Math.PI * 2); c.stroke(); c.restore(); };
      const banner = (txt, sub, col) => { c.save(); c.textAlign = 'center'; c.font = '900 30px "Malgun Gothic"'; c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,.65)'; c.strokeText(txt, 640, 150); c.fillStyle = col; c.fillText(txt, 640, 150); if (sub) { c.font = 'bold 16px "Malgun Gothic"'; c.lineWidth = 4; c.strokeText(sub, 640, 176); c.fillStyle = '#f0f0ff'; c.fillText(sub, 640, 176); } c.restore(); };
      const crown = (x, y) => { c.save(); c.fillStyle = '#ffd54a'; c.strokeStyle = '#7a5a10'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 6, y + 3); c.lineTo(x - 6, y - 3); c.lineTo(x - 3, y); c.lineTo(x, y - 5); c.lineTo(x + 3, y); c.lineTo(x + 6, y - 3); c.lineTo(x + 6, y + 3); c.closePath(); c.fill(); c.stroke(); c.restore(); };
      if (v === 'ga' || v === 'na') {   // 별빛 결계: 땅 빛 고리 + 반투명 돔 + 위로 오르는 빛 알갱이
        c.save(); c.globalCompositeOperation = 'lighter'; const R = 250; const g = c.createRadialGradient(ex, gy, R * 0.2, ex, gy, R); g.addColorStop(0, 'rgba(170,150,255,0)'); g.addColorStop(0.85, 'rgba(170,150,255,.10)'); g.addColorStop(1, 'rgba(210,200,255,.28)'); c.fillStyle = g; c.beginPath(); c.ellipse(ex, gy, R, R * 0.95, 0, Math.PI, 0); c.fill(); c.restore();
        ring(ex, gy - 2, 250, '#d8ccff', 0.8, 2.5); ring(ex, gy - 2, 238, '#a890ff', 0.45, 6);
        for (let i = 0; i < 40; i++) { const u = (t * 0.4 + i * 0.137) % 1, a = i * 2.4; S(c, ex + Math.cos(a) * 240 * (0.6 + 0.4 * ((i * 7) % 5) / 5), gy - u * 230, 2.4, '230,220,255', (1 - u) * 0.9, true); }
        S(c, ex, gy - 120, 140, '160,140,255', 0.12, true);
        // 미니맵 왕관
        const M = w.map, sc = 230 / M.width; crown(14 + E.x * sc, 82 + 8 + (gy - 250) / (gy - 250) * 58 - 10);
      }
      if (v === 'ga') { // 출현 빛기둥 + 알림
        c.save(); c.globalCompositeOperation = 'lighter'; const g2 = c.createLinearGradient(ex - 60, 0, ex + 60, 0); g2.addColorStop(0, 'rgba(180,160,255,0)'); g2.addColorStop(0.5, 'rgba(235,225,255,.55)'); g2.addColorStop(1, 'rgba(180,160,255,0)'); c.fillStyle = g2; c.fillRect(ex - 60, 0, 120, gy); c.restore();
        banner('★ 정예 출현! 뇌운 거인', '별빛 결계 안에서 쓰러뜨리세요 · 미니맵 왕관', '#ffe08a'); }
      if (v === 'na') { // 고유 패턴: 바닥 번개 표시 3곳 → 피하면 약점
        for (const dx of [-170, 40, 190]) { const x = ex + dx; ring(x, gy - 2, 46, '#ff6a6a', 0.9, 2.5); S(c, x, gy - 4, 50, '255,90,90', 0.35, true, 0.25); c.save(); c.fillStyle = 'rgba(255,120,120,.9)'; c.font = 'bold 13px "Malgun Gothic"'; c.textAlign = 'center'; c.fillText('⚡ 2', x, gy - 20); c.restore(); }
        S(c, ex, E.y - 90, 90, '255,230,140', 0.35, true); c.save(); c.textAlign = 'center'; c.font = '900 22px "Malgun Gothic"'; c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,.6)'; c.strokeText('약점 노출! 받는 피해 +50%', ex, E.y - E.h - 40); c.fillStyle = '#ffd86a'; c.fillText('약점 노출! 받는 피해 +50%', ex, E.y - E.h - 40); c.restore();
        banner('번개 표시를 피하면 거인이 휘청여요', null, '#ffb0b0'); }
      if (v === 'da') { // 처치: 결계가 터짐 + 보물 상자 + 별빛 축복
        for (let k = 0; k < 3; k++) ring(ex, gy - 2, 120 + k * 90, '#e8dcff', 0.6 - k * 0.15, 4 - k);
        for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, d = 80 + (i * 37 % 160); S(c, ex + Math.cos(a) * d, gy - 40 + Math.sin(a) * d * 0.5, 3, '255,245,220', 0.9, true); }
        c.save(); c.translate(ex, gy - 18); c.fillStyle = '#a0682a'; c.fillRect(-26, -18, 52, 36); c.fillStyle = '#ffd54a'; c.fillRect(-26, -6, 52, 6); c.fillRect(-4, -18, 8, 36); c.strokeStyle = '#5a3a10'; c.lineWidth = 2; c.strokeRect(-26, -18, 52, 36); c.restore(); S(c, ex, gy - 30, 70, '255,220,120', 0.45, true);
        banner('정예 처치! 별빛 축복 1분', '사냥터 전체 경험치 · 드롭 +20%', '#7dff9a');
        c.save(); c.fillStyle = 'rgba(10,12,22,.75)'; c.beginPath(); c.roundRect(1100, 70, 160, 34, 8); c.fill(); c.fillStyle = '#ffe08a'; c.font = 'bold 14px "Malgun Gothic"'; c.textAlign = 'left'; c.fillText('✦ 별빛 축복 0:58', 1114, 92); c.restore(); }
      if (v === 'now') banner('지금: 정예는 맨 위 짧은 발판', null, '#d0d8ff');
      return document.getElementById('canvas').toDataURL('image/png'); }, [DUMP, v]);
    fs.writeFileSync(`e_${v}.png`, Buffer.from(du.split(',')[1], 'base64')); }
  console.log(errs); await b.close(); })();
