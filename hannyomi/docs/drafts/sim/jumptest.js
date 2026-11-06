// 2.1.6 2단 점프 오르기 시험: 사냥터 · 보스 방 · 튜토리얼의 발판마다, 바로 아래(바닥 또는 아래 발판)에서 점프 → 꼭대기 앞뒤 여러 때에 ↑+점프 → 그 발판에 섰는지
//  그냥 점프만 했을 때도 따로 잼. 실행: node jumptest.js <게임 주소> <덤프>
const { chromium, devices } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await (await b.newContext(devices['iPhone 13 landscape'])).newPage();
  await pg.goto(process.argv[2] + '/index.html'); await pg.waitForTimeout(900);
  const r = await pg.evaluate(dump => {
    G.Mobile.closeModal(); const d = JSON.parse(dump); d.level = Math.max(d.level, 10); G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(d);
    const p = G.Game.player; for (const s of ['hat','top','bottom','shoes','gloves','cape','weapon','earring','pendant','ring1','ring2','belt']) d.eq[s] = null; p.recalc();   // 이동 속도 보너스 없음
    const JK = G.Touch.code('jump'), UP = 'ArrowUp'; let ts = performance.now();
    const fr = () => { ts += 1000 / 60; G.Game.frame(ts); G.Input.endFrame(); };
    const out = {};
    for (const [id, m] of Object.entries(G.MAPS)) {
      if (m.town || m.hidden) continue;
      for (let ti = 0; ti < m.platforms.length; ti++) {
        const t = m.platforms[ti]; if (t.ground) continue;
        // 바로 아래 발판: 옆으로 겹치는 것 중 가장 가까운 아래
        const below = m.platforms.filter(a => a !== t && a.y > t.y && Math.min(a.x + a.w, t.x + t.w) - Math.max(a.x, t.x) > 40).sort((a, b) => a.y - b.y)[0];
        if (!below) continue;
        const cx = Math.max(below.x + 20, Math.min(below.x + below.w - 20, t.x + t.w / 2));
        const tryOne = (dj, off) => {
          G.Game.changeMap(id, null); const w = G.Game.world; w.monsters.forEach(mm => { mm.dead = true; mm.hp = 0; }); w.draw = () => {};
          const bi = m.platforms.indexOf(below), ti2 = ti;
          p.x = cx; p.y = w.platforms[bi].y; p.vy = 0; p.onGround = true; p.plat = w.platforms[bi]; p.airDashed = false; p.dead = false; p.hp = p.st.maxHP;
          for (let i = 0; i < 3; i++) fr();
          G.Touch.press(JK); fr(); G.Touch.release(JK);
          let f = 0, done = false;
          const apexF = Math.round(780 / 1900 * 60), at = apexF + Math.round(off * 60);
          for (; f < 150; f++) {
            if (dj && f === at) { G.Touch.press(UP); G.Touch.press(JK); fr(); G.Touch.release(JK); }
            else fr();
            if (f > at + 2 && p.onGround) { done = true; break; }
          }
          G.Touch.release(UP);
          return done && p.plat === w.platforms[ti2];
        };
        const offs = [-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1];
        const dj = offs.map(o => tryOne(true, o)), sj = tryOne(false, 0);
        out[`${id}#${ti}`] = { rise: below.y - t.y, from: below.ground ? '바닥' : '발판', high: !!t.high, single: sj, double: dj.filter(Boolean).length + '/' + offs.length };
      }
    }
    return out;
  }, fs.readFileSync(process.argv[3], 'utf8'));
  console.log(JSON.stringify(r)); await b.close();
})();
