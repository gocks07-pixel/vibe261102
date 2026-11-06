// 2차-1.4 자동 사냥 고치기 전후 비교: 보스 직전 캐릭터(fullrun.js dumpAt)를 사냥터에 넣고 자동 사냥만 게임 N분
//  쓰러짐 · 처치 수 · 정예 처치 시간 · 자동이 멈춘 횟수를 잰다. 쓰러지면 그 자리에서 다시 시작 (HP · MP 가득)
//  실행: node autofix.js <게임 주소> '<시험 목록 JSON>' <반복> <분>
//   시험 목록: [{"label":"궁수a 공방","dump":"/경로/archer_a_cult_factory.json","map":"workshop"}, ...]
const { chromium, devices } = require('playwright');
const fs = require('fs');
const URL = process.argv[2], LIST = JSON.parse(process.argv[3]), REPS = +(process.argv[4] || 5), MINS = +(process.argv[5] || 30);
(async () => {
  const b = await chromium.launch();
  for (const sc of LIST) for (let rep = 0; rep < REPS; rep++) {
    const dump = fs.readFileSync(sc.dump, 'utf8').trim();
    const pg = await (await b.newContext(devices['iPhone 13 landscape'])).newPage();
    pg.on('pageerror', e => console.error('PAGEERR', sc.label, String(e).slice(0, 200)));
    await pg.goto(URL + '/index.html'); await pg.waitForTimeout(800);
    const r = await pg.evaluate(async ([dump, map, MINS, EXTRA]) => {
      G.Mobile.closeModal();
      const d = JSON.parse(dump);
      G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(d);
      G.Game.changeMap(map, null); G.Game.world.draw = () => {}; G.UI.frame = () => {};
      const p = G.Game.player;
      // POTS 환경변수: 가진 것 중 가장 좋은 HP 물약을 더 줌
      const hpPot = d.inv.use.filter(s => s && G.ITEMS[s.tid].use && G.ITEMS[s.tid].use.hp).sort((a, b) => G.ITEMS[b.tid].use.hp - G.ITEMS[a.tid].use.hp)[0];
      if (hpPot && EXTRA) G.Inv.add(p, hpPot.tid, EXTRA);   // 기본 0: 보스 직전 그대로의 물약 (물약이 떨어지면 쓰러짐도 그대로 잼)
      const full = () => { p.hp = p.st.maxHP; p.mp = p.st.maxMP; };
      full();
      G.Play.userT = -1e9; G.Play.forceBoss = false; G.Play.autoOn = false; G.Play.toggleAuto();
      let t = 0, ts = performance.now(), deaths = 0, stops = 0, kills = 0, eliteKills = [], toasts = [];
      const seen = new WeakSet();
      const tf = G.Play.toast.bind(G.Play); G.Play.toast = m => { if (/정예/.test(m)) toasts.push(Math.round(t)); return tf(m); };
      const elites0 = Object.keys(G.MONSTERS).filter(id => G.MONSTERS[id].kind === 'elite');
      const end = MINS * 60;
      while (t < end) {
        for (let i = 0; i < 60; i++) { t += 1 / 60; ts += 1000 / 60; G.Game.frame(ts); G.Input.endFrame(); }
        if (G.Dialog.isOpen()) G.Dialog.close();
        for (const n of Object.keys(G.UI.wins)) G.UI.closeWin(n);
        const w = G.Game.world;
        for (const m of w.monsters) if (m.dead && !seen.has(m)) { seen.add(m); kills++; if (m.d && m.d.kind === 'elite') eliteKills.push(Math.round(t)); }
        const ov = document.querySelector('#overlay .overlay');
        if (p.dead || (ov && /쓰러졌습니다/.test(ov.textContent))) {
          deaths++; G.UI.overlay(''); p.revive(); G.Game.changeMap(map, null); G.Game.world.draw = () => {}; full();
          G.Play.userT = -1e9; G.Play.autoOn = false; G.Play.toggleAuto(); continue;
        }
        if (w.mapId !== map) { G.Game.changeMap(map, null); G.Game.world.draw = () => {}; }
        if (!G.Play.autoOn) { stops++; full(); G.Play.userT = -1e9; G.Play.toggleAuto(); }
      }
      const elitesHere = [...new Set(G.Game.world.monsters.filter(m => m.d && m.d.kind === 'elite').map(m => m.id))];
      return { deaths, stops, kills, killsPerH: Math.round(kills / (MINS / 60)), eliteKills, firstElite: eliteKills[0] ?? null, eliteToasts: toasts.slice(0, 5), elitesHere, lv: p.d.level, job: p.d.job };
    }, [dump, sc.map, MINS, +(process.env.POTS || 0)]);
    console.log(JSON.stringify(Object.assign({ label: sc.label, map: sc.map, rep }, r)));
    await pg.context().close();
  }
  await b.close();
})();
