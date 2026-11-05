// 모바일 2차-1.3: 보스 자동 전투 측정 — 실제 게임의 자동 사냥(G.Play, 보스 방 모드)을 그대로 돌린다
//  캐릭터 · 장비 · 보스는 fullsim4.js · mk3.py 와 같음. 차이: 시뮬레이터가 움직이지 않고 게임 프레임만 빨리 넘긴다
//  → 터치 입력 경로 · 스킬 효율 선택 · 자동 물약 · 기믹 대상 고르기가 실제와 같음. 피하지 않는다
//  한 판 = 쓰러지거나(실제로는 마을로) 최종 보스를 이기거나 25분(게임 시간)까지
//  실행: hannyomi 폴더를 웹 서버(예: 8123)로 띄우고 node simauto.js "$(cat runs_x.json)" http://localhost:8123
const { chromium, devices } = require('playwright');
const RUNS = JSON.parse(process.argv[2] || '[]');
const BASE = process.argv[3] || 'http://localhost:8123';
(async () => {
  const b = await chromium.launch();
  for (const R of RUNS) {
    const ctx = await b.newContext({ ...devices['iPhone 13 landscape'] });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/index.html'); await pg.waitForTimeout(1200);
    await pg.evaluate(R => { G.Mobile.closeModal(); G.Dev.job = 'warrior_4a'; G.Dev.ch = 7; G.Dev.start('C'); }, R);
    await pg.waitForTimeout(1500);
    await pg.evaluate(R => {
      G.Game.loop = () => {};   // 화면 루프 정지 → 아래에서 프레임을 직접 넘김
      const p = G.Game.player, d = p.d;
      const fam = R.fam, job = R.tier === 0 ? 'beginner' : R.tier === 1 ? fam : `${fam}_${R.tier}a`, J2 = G.JOBS[job];
      d.job = job; d.level = R.L;
      const ap = 9 + (R.L - 1) * 5, sub = Math.min(R.L, ap); d.base = { STR: 4, DEX: 4, INT: 4, LUK: 4 }; d.base[J2.sub] += sub; d.base[J2.main] += ap - sub; d.ap = 0;
      d.skills = {}; for (const j of G.jobChain(job)) for (const sk of G.skillsOfJob(j)) d.skills[sk.id] = sk.maxLv;
      d.eq = {};
      for (const id of R.eq) { const it = G.ITEMS[id]; if (!it) continue; let slot = it.slot; if (slot === 'ring') slot = d.eq.ring1 ? 'ring2' : 'ring1'; d.eq[slot] = G.Items.create(id, { plain: true }); }
      // 스킬 칸: 버프 2 + 공격 4 (예상 피해가 높은 것) — 사람이 넣어 둘 법한 구성
      const chain = G.jobChain(job), skills = chain.flatMap(j => G.skillsOfJob(j)).filter(s => d.skills[s.id]);
      const val = s => { const a = s.atk || {}, lv = d.skills[s.id]; return (a.pct ? a.pct(lv) : 0) * (a.hits || 1) * (a.count || 1) * Math.min(a.targets || 1, 3); };
      const atk = skills.filter(s => s.type === 'attack' && s.atk).sort((a, c) => val(c) - val(a)).slice(0, 4);
      const buffs = skills.filter(s => s.type === 'buff').slice(-2);
      d.hot = [...atk, ...buffs].map(s => s.id).concat([null, null, null, null, null, null]).slice(0, 6);
      // 물약: 실제 물약 + 자동 물약 (HP 50% · MP 30%)
      d.inv.use = d.inv.use.map(() => null);
      const hp = G.ITEMS.pot_hp5 ? 'pot_hp5' : 'pot_white', mpp = G.ITEMS.pot_mp4 ? 'pot_mp4' : 'pot_blue';
      d.inv.use[0] = { tid: hp, qty: 999 }; d.inv.use[1] = { tid: mpp, qty: 999 };
      const ap2 = G.AutoPot.of(d); Object.assign(ap2, { hp: true, mp: true });
      d.quests.c6_07 = { s: 'done' }; G.Game.ckpt = null;
      p.recalc(); p.hp = p.st.maxHP; p.mp = p.st.maxMP;
      G.Touch.opt.fps30 = false; G.Touch.opt.moveCancel = true; G.Touch.opt.magnet = true;
      G.Game.changeMap(R.map, null);
      G.Game.world.draw = () => {}; G.UI.frame = () => {};   // 그리기 생략 (속도)
      // 2단계 보스: 실제 2.8초 타이머 대신 게임 시간으로
      const w = G.Game.world, sp = w.spawnNextBoss.bind(w);
      window.__next = null; w.spawnNextBoss = (m, id) => { window.__next = { m, id, t: 2.8 }; };
      window.__sp = sp;
      G.Play.forceBoss = true; G.Play.autoOn = false; G.Play.toggleAuto();
      window.__T = { t: 0, ts: performance.now(), dead: false, pot: 0, maxBossHp: 0, bossHp: [] };
      const oq = p.quickPotion.bind(p); p.quickPotion = k => { window.__T.pot++; return oq(k); };
    }, R);
    let res = null;
    for (let chunk = 0; chunk < 200 && !res; chunk++) {
      res = await pg.evaluate(R => {
        const T = window.__T, w = G.Game.world, p = G.Game.player;
        for (let i = 0; i < 1200; i++) {   // 20초씩
          T.t += 1 / 60; T.ts += 1000 / 60;
          if (window.__next) { window.__next.t -= 1 / 60; if (window.__next.t <= 0) { const n = window.__next; window.__next = null; window.__sp(n.m, n.id); } }
          if (G.Dialog.isOpen()) G.Dialog.close();
          const ov = document.querySelector('#overlay .overlay');
          G.Game.frame(T.ts); G.Input.endFrame();
          if (p.dead) return { win: false, t: T.t, why: 'dead' };
          const fin = w.monsters.find(m => m.id === R.final);
          if (fin && fin.dead) return { win: true, t: T.t };
          if (!G.Play.autoOn && !window.__next && !w.monsters.some(m => m.isBoss && !m.dead)) return { win: true, t: T.t, why: 'auto-off' };
          if (!G.Play.autoOn && T.t > 2) G.Play.toggleAuto();   // 잠깐 꺼졌으면 다시 (연출 등)
          if (T.t > 1500) return { win: false, t: T.t, why: 'timeout' };
        }
        return null;
      }, R);
    }
    const info = await pg.evaluate(() => { const w = G.Game.world, p = G.Game.player, m = w.monsters.find(x => x.isBoss); return { hp: Math.round(p.hp), maxHP: p.st.maxHP, pot: window.__T.pot, bossLeft: m ? Math.round(m.hp / m.maxHp * 100) : 0 }; });
    console.log(JSON.stringify({ boss: R.boss, fam: R.fam, gear: R.gear, L: R.L, ...res, t: Math.round(res ? res.t : -1), ...info, errs: errs.slice(0, 3) }));
    await ctx.close();
  }
  await b.close();
})();
