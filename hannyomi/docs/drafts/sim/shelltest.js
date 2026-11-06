// 쉘로크 체력 배율 맞추기: 실제 이야기 순서의 캐릭터(표류자 Lv.9, 나무 막대 — fullrun.js dumpAt 으로 꺼낸 상태)로
//  직접 플레이 모델(휴대폰 자동 사냥 움직임 + 예고 공격 30% 회피, 자동 보정 없음)이 쉘로크를 잡는 시간 · 승률
//  실행: node shelltest.js '[7,3,2,1.5]' 10 dump1.json dump2.json ... (배율은 지금 ×7 대신 넣을 값)
const { chromium, devices } = require('playwright');
const fs = require('fs');
const MULS = JSON.parse(process.argv[2] || '[7,2]'), REPS = +(process.argv[3] || 5), DUMPS = process.argv.slice(4).map(f => fs.readFileSync(f, 'utf8').trim());
const POTS = +(process.env.POTS || 0);   // 퀘스트로 더 줄 들풀 회복약 개수 (시험용)
(async () => {
  const b = await chromium.launch();
  for (const mul of MULS) for (let di = 0; di < DUMPS.length; di++) for (let rep = 0; rep < REPS; rep++) {
    const pg = await (await b.newContext(devices['iPhone 13 landscape'])).newPage();
    await pg.goto('http://localhost:8123/index.html'); await pg.waitForTimeout(800);
    const r = await pg.evaluate(async ([dump, mul, POTS]) => {
      G.Mobile.closeModal();
      const d = JSON.parse(dump);
      if (POTS) { const i = d.inv.use.findIndex(s => !s); d.inv.use[i] = { tid: 'pot_red', qty: POTS }; }
      G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(d);
      G.MONSTERS.shellock.hpMul = G.MONSTERS.shellock.hpMul / 0.9 * mul;   // 2.1.3 표의 ×0.9 를 mul 로 (2.1 때는 ×7)
      G.Game.changeMap('light_cave', null); G.Game.world.draw = () => {}; G.UI.frame = () => {};
      const p = G.Game.player; p.hp = p.st.maxHP; p.mp = p.st.maxMP;
      const hurt = G.Player.prototype.hurt, NOD = new Set(['despair', 'devour', 'drain', 'chains', 'storm', 'erosion', 'prison', 'tide', 'spores', 'quicksand', 'chain-fail', 'curse', 'heat', 'echo']);
      G.Player.prototype.hurt = function (raw, fx, opt = {}) { const m = G.Game.world.monsters.find(x => x.isBoss && !x.dead), id = (m && m.boss && m.boss.cur && m.boss.cur.pt && m.boss.cur.pt.id) || 'contact'; if (!NOD.has(id) && Math.random() < 0.3) return; return hurt.apply(this, arguments); };
      G.Play.userT = -1e9; G.Play.AUTO_GUARD = {}; G.Play.forceBoss = true; G.Play.autoOn = false; G.Play.toggleAuto();
      const potN = () => p.d.inv.use.reduce((n, s) => n + (s && G.ITEMS[s.tid].use && G.ITEMS[s.tid].use.hp ? s.qty : 0), 0), pot0 = potN();
      let t = 0, ts = performance.now();
      while (t < 1500) {
        for (let i = 0; i < 60; i++) { t += 1 / 60; ts += 1000 / 60; G.Game.frame(ts); G.Input.endFrame(); }
        if (G.Dialog.isOpen()) G.Dialog.close();
        if (p.dead) return { win: false, t, why: 'dead', pots: pot0 - potN() };
        const m = G.Game.world.monsters.find(x => x.id === 'shellock');
        if (!m || m.dead) return { win: true, t, pots: pot0 - potN(), hp: Math.round(p.hp / p.st.maxHP * 100) };
        if (!G.Play.autoOn) { G.Play.forceBoss = true; G.Play.toggleAuto(); }
      }
      return { win: false, t, why: 'timeout' };
    }, [DUMPS[di], mul, POTS]);
    console.log(JSON.stringify(Object.assign({ mul, dump: di, rep, POTS }, r, { t: Math.round(r.t) })));
    await pg.context().close();
  }
  await b.close();
})();
