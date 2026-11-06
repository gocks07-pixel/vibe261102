// 파라칸 · 녹스 보스 시험 (2026-11-06): 완주 시뮬의 보스 직전 캐릭터(약함 판 = 사냥터 · 보스 드롭 · 퀘스트 보상, 상점 X)로
//  장비 2단계(보통 · 강함) × 직접 플레이 모델(예고 공격 30% 회피, 보정 없음) · 자동 전투(AUTO_GUARD 그대로) 를 N번씩
//  강함: 파라칸 = 라그 강철 5부위 +3 / 녹스 = 천공 6부위(모자 · 상의 · 하의 · 신발 · 장갑 · 망토) +3 — 나머지는 그대로
//  기록: 승패 · 시간 · 물약 · 받은 피해를 패턴별로 (쓰러진 판은 마지막 10초에 맞은 패턴도)
//  실행: node bosstest.js <게임 주소> <덤프 파일> <map> <반복> > 결과.jsonl
const { chromium, devices } = require('playwright');
const fs = require('fs');
const [URL, DUMPF, MAP] = process.argv.slice(2, 5), REPS = +(process.argv[5] || 20);
const SETS = { buried_temple: ['ar40_hat', 'ar40_top', 'ar40_bottom', 'ar40_shoes', 'ar40_gloves'], void_throne: ['ar85_hat', 'ar85_top', 'ar85_bottom', 'ar85_shoes', 'ar85_gloves', 'ar85_cape'] };
const BOSS = { buried_temple: 'parakan', void_throne: 'nox' };
(async () => {
  const b = await chromium.launch();
  const dump = fs.readFileSync(DUMPF, 'utf8').trim();
  for (const gear of ['normal', 'strong']) for (const mode of (process.env.MODES || 'direct,auto').split(',')) for (let rep = 0; rep < REPS; rep++) {
    const pg = await (await b.newContext(devices['iPhone 13 landscape'])).newPage();
    pg.on('pageerror', e => console.error('PAGEERR', String(e).slice(0, 200)));
    await pg.goto(URL + '/index.html'); await pg.waitForTimeout(700);
    const r = await pg.evaluate(async ([dump, map, bossId, gear, mode, setIds, DOOMP]) => {
      G.Mobile.closeModal();
      const d = JSON.parse(dump);
      G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(d);
      const p = G.Game.player;
      const realSet = setIds.map(id => G.ITEMS[id] ? id : null);
      if (gear === 'strong') {
        for (const id of setIds) {
          if (!G.ITEMS[id]) continue;
          const it = G.Items.create(id, { boss: true }), slot = G.ITEMS[id].slot;
          for (let k = 0; k < 80 && (it.up || 0) < 3 && G.Items.slotsLeft(it) > 0; k++) G.Items.useScroll(it);
          d.eq[slot] = it;
        }
        p.recalc();
      }
      const eqDesc = G.EQUIP_SLOTS.map(s => d.eq[s] ? `${s}:${d.eq[s].tid}+${d.eq[s].up || 0}` : `${s}:-`).join(' ');
      G.Game.changeMap(map, null); G.Game.world.draw = () => {}; G.UI.frame = () => {};
      p.hp = p.st.maxHP; p.mp = p.st.maxMP;
      const NOD = new Set(['despair', 'devour', 'drain', 'chains', 'storm', 'erosion', 'prison', 'tide', 'spores', 'quicksand', 'chain-fail', 'curse', 'heat', 'echo']);
      const patId = () => { const m = G.Game.world.monsters.find(x => x.isBoss && !x.dead); return (m && m.boss && m.boss.cur && m.boss.cur.pt && m.boss.cur.pt.id) || 'contact'; };
      let t = 0; const dmg = {}, recent = [];
      const rec = (id, n) => { if (n <= 0) return; dmg[id] = (dmg[id] || 0) + n; recent.push([t, id, n]); };
      const hurt = G.Player.prototype.hurt, tdm = G.Player.prototype.trueDamage;
      G.Player.prototype.hurt = function (raw, fx, opt = {}) {
        const id = patId();
        if (mode === 'direct' && !NOD.has(id) && Math.random() < 0.3) return;
        const h0 = this.hp; inHurt = true; let r; try { r = hurt.apply(this, arguments); } finally { inHurt = false; } rec(id, h0 - this.hp); return r;
      };
      let inHurt = false;
      if (tdm) G.Player.prototype.trueDamage = function () { if (inHurt) return tdm.apply(this, arguments); const pid = patId();
        // 안전지대 패턴(태양의 심판 · 종말의 별): 직접 플레이도 30% 로 안전지대에 들어감 (예고 공격 30% 회피와 같은 기준). DOOM 환경변수로 바꿔 볼 수 있음
        if (mode === 'direct' && (pid === 'sun' || pid === 'doom') && Math.random() < DOOMP) return;
        const id = pid + '(고정)', h0 = this.hp, r = tdm.apply(this, arguments); rec(id, h0 - this.hp); return r; };
      G.Play.userT = -1e9; G.Play.forceBoss = true;
      if (mode === 'direct') G.Play.AUTO_GUARD = {};
      G.Play.autoOn = false; G.Play.toggleAuto();
      const potN = () => p.d.inv.use.reduce((n, s) => n + (s && G.ITEMS[s.tid].use && (G.ITEMS[s.tid].use.hp || G.ITEMS[s.tid].use.hpP) ? s.qty : 0), 0), pot0 = potN();
      let ts = performance.now(), gone = 0;
      const out = extra => Object.assign({ t: Math.round(t), pots: pot0 - potN(), maxHP: p.st.maxHP, def: p.st.def, atk: p.st.atk, dmg: Object.fromEntries(Object.entries(dmg).map(([k, v]) => [k, Math.round(v / p.st.maxHP * 100)])), eq: eqDesc, lv: p.d.level, job: p.d.job }, extra);
      while (t < 1500) {
        for (let i = 0; i < 60; i++) { t += 1 / 60; ts += 1000 / 60; G.Game.frame(ts); G.Input.endFrame(); }
        if (G.Dialog.isOpen()) G.Dialog.close();
        if (G.Cutscene.playing && G.Cutscene.playing()) G.Cutscene.finish();
        if (p.dead) {
          const last = {}; for (const [tt, id, n] of recent) if (t - tt <= 10) last[id] = (last[id] || 0) + Math.round(n / p.st.maxHP * 100);
          return out({ win: false, why: 'dead', last10: last });
        }
        const w = G.Game.world, alive = w.monsters.filter(m => m.isBoss && !m.dead);
        if (!alive.length) { if ((gone += 1) >= 3) return out({ win: true, hp: Math.round(p.hp / p.st.maxHP * 100) }); } else gone = 0;
        if (!G.Play.autoOn) { G.Play.forceBoss = true; G.Play.userT = -1e9; G.Play.toggleAuto(); }
      }
      return out({ win: false, why: 'timeout' });
    }, [dump, MAP, BOSS[MAP], gear, mode, SETS[MAP], +(process.env.DOOM || 0.3)]);
    console.log(JSON.stringify(Object.assign({ map: MAP, gear, mode, rep }, r)));
    await pg.context().close();
  }
  await b.close();
})();
