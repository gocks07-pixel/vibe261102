// 전체 완주 시뮬레이션 (docs/SIM_FULLRUN_PLAN.md): 새 캐릭터 Lv.1 → 메인 · 서브 퀘스트 전부 → 녹스 → 엔딩 3종
//  실제 게임을 띄워 프레임만 빨리 넘긴다 (그리기 생략). 게임 규칙 · 경험치 · 드롭 · 확률은 그대로
//  사냥 = 휴대폰판 자동 사냥(G.Play). 보스: 1~5 직접(자동 사냥 움직임 + 예고 공격 30% 회피, 자동 보정 없음) → 6 자동 → Lv.100 → 7~10 자동
//  실행: hannyomi 를 웹 서버(예: 8123)로 띄우고  node fullrun.js '{"fam":"warrior","line":"a","gear":"normal"}' http://localhost:8123 > out.json
const { chromium, devices } = require('playwright');
const R = JSON.parse(process.argv[2] || '{"fam":"warrior","line":"a","gear":"normal"}');
const BASE = process.argv[3] || 'http://localhost:8123';
const LIMIT_H = +(process.argv[4] || 120);   // 게임 시간 상한 (시간)

const BOT = function (R) {
  const B = window.BOT = {
    R, t: 0, ts: performance.now(), log: [], ev: (type, o = {}) => B.log.push(Object.assign({ t: Math.round(B.t), type, L: G.Game.player ? G.Game.player.d.level : 0 }, o)),
    mode: 'idle', target: null, boss: null, lastProg: 0, progSig: '', stuck: 0, chapter: -1, granted: {}, buyT: 0, endings: [], phase: 'story',
    deaths: { field: 0 }, pots: 0, goldLow: 0, grind: 0, grindStart: null,
  };
  const P = () => G.Game.player, W = () => G.Game.world;
  const NODODGE = new Set(['despair', 'devour', 'drain', 'chains', 'storm', 'erosion', 'prison', 'tide', 'spores', 'quicksand', 'chain-fail', 'curse', 'heat', 'echo']);

  // ---------- 직업 경로 ----------
  B.jobFor = tier => tier === 1 ? R.fam : `${R.fam}_${tier}${R.line}`;
  B.questOk = q => !(q.act && q.act.job) || [1, 2, 3, 4].some(t => B.jobFor(t) === q.act.job);

  // ---------- 맵 찾기 ----------
  const spawnsOf = id => { const m = G.MAPS[id]; return (m.spawns || []).map(s => s.m); };
  B.mapOfMon = mon => {
    const hit = Object.keys(G.MAPS).filter(id => spawnsOf(id).includes(mon) || spawnsOf(id).some(s => G.MONSTERS[s] && G.MONSTERS[s].next === mon));
    if (hit.length) return hit.sort((a, b) => (G.MAPS[a].bossRoom ? 1 : 0) - (G.MAPS[b].bossRoom ? 1 : 0))[0];
    const raw = Object.keys(G.MAPS).find(id => JSON.stringify(G.MAPS[id]).includes(`"${mon}"`));
    return raw || null;
  };
  B.monsForItem = item => Object.keys(G.MONSTERS).filter(m => (G.MONSTERS[m].quest || []).includes(item));
  B.fieldMaps = () => Object.keys(G.MAPS).filter(id => { const m = G.MAPS[id]; return !m.town && !m.bossRoom && !m.hidden && id !== 'dream_beach' && (m.spawns || []).length; });
  B.mapLv = id => Math.max(0, ...spawnsOf(id).map(m => (G.MONSTERS[m] && G.MONSTERS[m].lv) || 0));
  B.grindMap = () => {
    const L = P().d.level, ban = B.ban || {};
    const cap = P().d.job === 'beginner' ? L : L + 1;
    const f = B.fieldMaps().filter(id => B.mapLv(id) <= cap && !(ban[id] && B.t - ban[id] < 1200)).sort((a, b) => B.mapLv(b) - B.mapLv(a));
    return f[0] || B.fieldMaps()[0];
  };
  B.go = id => { if (W().mapId !== id) { G.Game.changeMap(id, null); B.ev('map', { to: id }); } };

  // ---------- 성장 · 장비 ----------
  B.grow = () => {
    const p = P(), d = p.d;
    if (d.ap > 0) p.addAP(d.job === 'beginner' ? 'STR' : G.JOBS[d.job].main, d.ap);
    if (d.sp > 0) {
      const chain = G.jobChain(d.job), sk = chain.flatMap(j => G.skillsOfJob(j)).filter(s => !s.fixed);
      const order = [...sk.filter(s => s.type === 'attack'), ...sk.filter(s => s.type === 'buff'), ...sk.filter(s => s.type === 'passive'), ...sk.filter(s => !['attack', 'buff', 'passive'].includes(s.type))];
      for (const s of order) { while (d.sp > 0 && (d.skills[s.id] || 0) < s.maxLv) { const b = d.sp; p.addSP(s.id); if (d.sp === b) break; } if (d.sp <= 0) break; }
    }
    // 스킬 칸: 공격 4 (예상 피해) + 버프 2
    const chain = G.jobChain(d.job), sks = chain.flatMap(j => G.skillsOfJob(j)).filter(s => d.skills[s.id] > 0);
    const val = s => { const a = s.atk || {}, lv = d.skills[s.id]; return (a.pct ? a.pct(lv) : 0) * (a.hits || 1) * (a.count || 1) * Math.min(a.targets || 1, 3); };
    const atk = sks.filter(s => s.type === 'attack' && s.atk).sort((a, b) => val(b) - val(a)).slice(0, 4), buf = sks.filter(s => s.type === 'buff').slice(-2);
    const hot = [...atk, ...buf].map(s => s.id).concat([null, null, null, null, null, null]).slice(0, 6);
    if (JSON.stringify(hot) !== JSON.stringify(d.hot)) { d.hot = hot; G.UI.dirty(); }
  };
  B.bestGear = () => { const cur = G.Play.bestSet(), d = P().d; if (G.EQUIP_SLOTS.some(s => cur[s] !== d.eq[s])) G.Play.applyEquip(cur); };
  B.townOf = () => G.MAPS[W().mapId].home || P().d.town || 'sprout_port';
  B.shopNpcs = town => (G.MAPS[town].npcs || []).map(n => n.id).filter(id => G.NPCS[id] && G.NPCS[id].shop);
  B.shopping = () => {
    const p = P(), d = p.d, town = B.townOf(), shops = B.shopNpcs(town).flatMap(id => G.NPCS[id].shop).filter(id => G.ITEMS[id]);
    // 장비 (보통 · 강함): 레벨에 맞고 지금보다 좋아지면 산다 (골드의 70% 까지)
    if (R.gear !== 'weak') {
      for (const id of shops) {
        const t = G.ITEMS[id];
        if (t.cat !== 'equip' || G.Items.canEquip(p, t) || !t.price || d.gold * 0.7 < t.price) continue;
        const it = G.Items.create(id, { plain: true }), slot = G.Play.slotFor(it, d.eq);
        const a = G.Play.score(G.Play.statsWith(d.eq)), b = G.Play.score(G.Play.statsWith(Object.assign({}, d.eq, { [slot]: it })));
        const hpA = G.Play.statsWith(d.eq).maxHP, hpB = G.Play.statsWith(Object.assign({}, d.eq, { [slot]: it })).maxHP;
        if ((b > a * 1.01 || (b >= a * 0.999 && hpB > hpA * 1.02)) && G.Inv.hasSpace(p, id)) { d.gold -= t.price; G.Inv.add(p, it); B.ev('buy', { item: id, price: t.price }); }
      }
    }
    B.bestGear();   // ⭐ 최고 장비 입기 — 세 단계 모두 (약함도 퀘스트 보상 · 주운 장비는 입음)
    // 물약: 이 마을에서 파는 가장 좋은 HP · MP 물약 (HP 100 · MP 50 까지)
    const pots = shops.filter(id => G.ITEMS[id].cat === 'use' && G.ITEMS[id].use);
    const best = k => pots.filter(id => G.ITEMS[id].use[k] && !G.ITEMS[id].use.cd).sort((a, b) => G.ITEMS[b].use[k] - G.ITEMS[a].use[k])[0];
    // 좋은 물약을 살 골드가 모자라면 남은 개수는 싼 물약으로 채움 (사람처럼)
    for (const [k, want] of [['hp', 100], ['mp', 50]]) {
      const list = pots.filter(id => G.ITEMS[id].use[k] && !G.ITEMS[id].use.cd).sort((a, b) => G.ITEMS[b].use[k] - G.ITEMS[a].use[k]);
      if (!list.length) continue;
      let need = want - list.reduce((n, id) => n + G.Inv.count(p, id), 0);
      const id0 = list[0], n0 = Math.max(0, Math.min(need, Math.floor(d.gold * 0.9 / (G.ITEMS[id0].price || 1))));
      if (need > 0 && n0 < need * 0.5) { B.goldLow++; B.ev('goldLow', { item: id0, want: need, can: n0, gold: d.gold }); }
      for (const id of list) {
        if (need <= 0) break;
        const price = G.ITEMS[id].price || 1, n = Math.max(0, Math.min(need, Math.floor(d.gold * 0.9 / price)));
        if (n > 0 && G.Inv.hasSpace(p, id)) { d.gold -= n * price; G.Inv.add(p, id, n); need -= n; }
      }
    }
    // 장비 칸 정리: 26칸 넘으면 약한 장비부터 판다
    const eqInv = d.inv.equip;
    if (eqInv.filter(Boolean).length > 26) {
      const list = eqInv.map((it, i) => it ? { i, v: G.Items.sellPrice(it) } : null).filter(Boolean).sort((a, b) => a.v - b.v).slice(0, 10);
      for (const x of list) { d.gold += x.v; eqInv[x.i] = null; }
    }
    G.UI.dirty();
  };
  // 강함: 레벨에 맞는 세트를 모았다고 보고 지급 + 각인 +4 안팎 + 각인 등급 "빛남"
  B.strong = () => {
    if (R.gear !== 'strong') return;
    const p = P(), d = p.d, fam = G.familyOf(d.job);
    for (const sid of Object.keys(G.SETS)) {
      if (B.granted[sid] || sid === 'starheir') continue;
      const pieces = G.SETS[sid].pieces.map(x => { const alt = x.split('|'); return alt.find(id => G.ITEMS[id] && (G.ITEMS[id].job === 'any' || G.ITEMS[id].job === fam)) || alt[0]; }).filter(id => G.ITEMS[id]);
      if (!pieces.length || pieces.some(id => G.ITEMS[id].lv > d.level) || Math.max(...pieces.map(id => G.ITEMS[id].lv)) < d.level - 25) continue;
      B.granted[sid] = true;
      for (const id of pieces) { const it = G.Items.create(id, { boss: true }); if (G.Inv.hasSpace(p, id)) G.Inv.add(p, it); }
      B.ev('grant', { set: sid, n: pieces.length });
    }
    B.bestGear();
    for (const s of G.EQUIP_SLOTS) {
      const it = d.eq[s]; if (!it) continue;
      let tries = 0; while ((it.up || 0) < 4 && G.Items.slotsLeft(it) > 0 && tries++ < 12) G.Items.useScroll(it);
      if ((it.grade || 0) < 2) { it.grade = 2; it.pot = G.Items.rollPot(G.ITEMS[it.tid], 2); }
    }
    p.recalc();
  };
  // 영웅의 갑옷 고르기 (1.7.12): 가장 좋아지는 것부터
  B.heroPick = () => {
    const p = P(), d = p.d;
    while (d.flags.heroPick > 0) {
      const cands = ['starheir', 'sky'].flatMap(s => G.Win.heroset.pieces(s)).map(x => typeof x === 'string' ? x : x.id).filter(id => G.ITEMS[id]);
      let best = cands[0], bs = -1;
      for (const id of cands) { const it = G.Items.create(id, { plain: true }), sc = G.Play.score(G.Play.statsWith(Object.assign({}, d.eq, { [G.Play.slotFor(it, d.eq)]: it }))); if (sc > bs) { bs = sc; best = id; } }
      if (!best || !G.Inv.hasSpace(p, best)) break;
      G.Inv.add(p, G.Items.create(best, { boss: true })); d.flags.heroPick--; B.ev('heroPick', { item: best });
    }
    B.bestGear();
  };

  // ---------- 퀘스트 ----------
  B.quests = () => {
    let did = false;
    for (const q of Object.values(G.QUESTS)) {
      if (q.id === 'f_08') continue;   // 엔딩은 따로
      if (G.Quest.ready(q)) { if (G.Quest.complete(q.id)) { did = true; B.ev('done', { q: q.id, main: q.type === 'main' }); } else B.ev('cantComplete', { q: q.id }); }
    }
    for (const q of Object.values(G.QUESTS)) if (G.Quest.available(q) && B.questOk(q)) { G.Quest.accept(q.id); did = true; B.ev('accept', { q: q.id }); }
    if (P().d.flags.heroPick > 0) B.heroPick();
    return did;
  };
  // 남은 목표 → [{mon, map, boss}]
  B.goals = () => {
    const out = [];
    for (const id in P().d.quests) {
      const s = P().d.quests[id]; if (s.s !== 'active') continue;
      const q = G.QUESTS[id];
      for (const o of q.obj) {
        const [c, n] = G.Quest.progress(q, o); if (c >= n) continue;
        const mons = o.t === 'kill' ? [o.mon] : o.t === 'item' ? B.monsForItem(o.id) : [];
        for (const mon of mons) { const map = B.mapOfMon(mon); if (map) out.push({ q: id, mon, map, boss: !!G.MAPS[map].bossRoom, lv: (G.MONSTERS[mon] || {}).lv || 0 }); else B.ev('noMap', { q: id, mon }); }
        if (o.t === 'map') out.push({ q: id, map: o.map, visit: true });
      }
    }
    return out.sort((a, b) => (a.boss - b.boss) || (a.lv - b.lv));
  };
  B.nextMainLv = () => {
    const L = Object.values(G.QUESTS).filter(q => G.Quest.soon(q) && B.questOk(q)).map(q => q.lv);
    return L.length ? Math.min(...L) : null;
  };

  // ---------- 보스 ----------
  B.bossTry = g => {
    const key = g.map, st = B.bossSt || (B.bossSt = {}), b = st[key] || (st[key] = { tries: 0, wins: 0, log: [], manual: 0, auto: 0, lv100: false, skipped: false });
    return b;
  };
  B.startBoss = g => {
    if (R.dumpAt === g.map) { window.__dump = JSON.stringify(P().d); B.phase = 'dump'; return; }   // 보스 직전 캐릭터 상태 꺼내기 (보스 값 맞추기용)
    const b = B.bossTry(g); b.tries++;
    const auto = b.tries >= 6;
    B.boss = { g, b, t0: B.t, auto, hp0: P().hp };
    B.go(g.map);
    G.Play.forceBoss = true;
    G.Play.AUTO_GUARD = Object.assign({}, B.GUARD0, auto ? {} : { [g.map]: 1 });   // 직접 = 자동 보정 없음
    B.manualDodge = !auto;
    G.Play.autoOn = false; G.Play.toggleAuto();
    B.ev('bossStart', { map: g.map, mon: g.mon, try: b.tries, auto, lv: P().d.level });
  };
  B.endBoss = (win, why) => {
    const { g, b, t0, auto } = B.boss, secs = Math.round(B.t - t0);
    b.log.push({ try: b.tries, auto, win, why, secs, L: P().d.level });
    if (win) { b.wins++; b.winTry = b.tries; b.winAuto = auto; }
    B.ev('bossEnd', { map: g.map, try: b.tries, auto, win, why, secs });
    B.boss = null; B.manualDodge = false; G.Play.forceBoss = false; G.Play.stop(); G.Play.AUTO_GUARD = Object.assign({}, B.GUARD0);
    if (!win) {
      if (b.tries === 6) { b.failAuto6 = true; if (P().d.level < 100) { B.mode = 'to100'; B.ev('to100', { map: g.map }); } }
      if (b.tries >= 10) { b.skipped = true; B.skipBoss(g); }
    }
  };
  // 10번 실패: 결과에 표시하고 이야기를 이어 가기 위해 그 처치 목표만 채움
  B.skipBoss = g => {
    const s = P().d.quests[g.q]; if (s && s.s === 'active') { const q = G.QUESTS[g.q]; for (const o of q.obj) if (o.t === 'kill') s.k[o.mon] = o.n; }
    B.ev('bossSkip', { map: g.map, q: g.q });
  };
  B.bossTick = () => {
    const w = W(), p = P(), bs = B.boss;
    if (p.dead) { B.endBoss(false, 'dead'); return; }
    // 2단계 보스: 다음 단계가 있는 보스가 쓰러지면 게임 시간 2.8초 뒤 다음 보스 (게임의 실제 타이머 대신)
    for (const m of w.monsters) if (m.isBoss && m.d.next) { if (!m.dead) bs.stage = m; }
    if (bs.stage && bs.stage.dead && !bs.stageDone) { bs.stageDone = true; B.next = { m: bs.stage, id: w.mapId, t: 2.8 }; B.nextPending = true; B.ev('stage2', { map: w.mapId }); }
    // 이김 = 퀘스트 목표(처치)가 채워짐
    if (G.Quest.isDone(bs.g.q) || (G.Quest.isActive(bs.g.q) && G.Quest.ready(G.QUESTS[bs.g.q]))) { B.endBoss(true, 'win'); return; }
    if (B.t - bs.t0 > 1500) { B.endBoss(false, 'timeout'); G.Game.changeMap(B.townOf(), null); return; }
    if (!G.Play.autoOn) { G.Play.forceBoss = true; G.Play.toggleAuto(); }
  };

  // ---------- 한 번 생각하기 (게임 1초마다) ----------
  B.think = () => {
    const p = P(), w = W();
    // 화면 정리
    if (G.Mobile && G.Mobile.modalEl.classList.contains('on')) G.Mobile.closeModal();
    if (G.Dialog.isOpen()) G.Dialog.close();
    if (G.UI.asking()) G.UI.answer(false);
    for (const n of Object.keys(G.UI.wins)) G.UI.closeWin(n);
    if (G.Cutscene.playing && G.Cutscene.playing()) G.Cutscene.finish();
    const ov = document.querySelector('#overlay .overlay');
    if (p.dead || (ov && /쓰러졌습니다/.test(ov.textContent))) {
      if (B.boss) { B.endBoss(false, 'dead'); }
      else {
        B.deaths.field++; B.ev('fieldDeath', { map: w.mapId });
        const rec = (B.dmap || (B.dmap = {}))[w.mapId] = ((B.dmap[w.mapId] || []).concat(B.t)).filter(t => B.t - t < 600);
        if (rec.length >= 3) { (B.ban || (B.ban = {}))[w.mapId] = B.t; B.ev('banMap', { map: w.mapId }); }
      }
      G.UI.overlay(''); p.revive(); B.restNow(); return;
    }
    if (ov) G.UI.overlay('');
    if (B.boss) { B.bossTick(); return; }
    // 쉬기: 마을에서 HP 95% · MP 90% 까지 (자연 회복 5초마다 2%, 최대 3분) — 사람이 재도전 전에 회복하는 것처럼
    if (B.mode === 'rest') {
      if ((p.hp >= p.st.maxHP * 0.95 && p.mp >= p.st.maxMP * 0.9) || B.t - B.restT > 180) B.mode = B.afterRest || 'idle';
      else return;
    }
    B.grow();
    // 장 바뀜: 기록 · 세이브 확인 · 강함 지급
    const ch = G.Chapter.current(p.d);
    if (ch !== B.chapter) { B.chapter = ch; B.ev('chapter', { ch, gold: p.d.gold }); B.saveCheck(); }
    B.strong();
    // 마을 들르기 (5분마다 · 보스 전): 물약 · 장비
    if (B.t - B.buyT > 300) { B.buyT = B.t; B.shopping(); }
    // Lv.100 까지 키우기 (보스 6번 실패 뒤)
    if (B.mode === 'to100') { if (p.d.level >= 100) { B.mode = 'idle'; B.ev('reached100'); } else { B.hunt(B.grindMap(), 'to100'); return; } }
    B.quests();
    if (G.Quest.ready(G.QUESTS.f_08) || G.Quest.isDone('f_08')) { B.phase = 'ending'; return; }
    const goals = B.goals();
    // 내 레벨보다 훨씬 높은 목표(예: 연희의 선물 — 후반 정예 6종)는 레벨이 될 때까지 미룸. 메인 퀘스트 목표 먼저
    const L = p.d.level, isMain = g => G.QUESTS[g.q].type === 'main';
    // 3번 쓰러져 막힌 사냥터의 목표는 20분 동안 미루고, 그동안 더 쉬운 곳에서 레벨 · 골드를 모음 (사람처럼)
    const banned = g => B.ban && B.ban[g.map] && B.t - B.ban[g.map] < 1200;
    const field0 = goals.filter(g => !g.boss && !g.visit && g.lv <= L + 4), field = field0.filter(g => !banned(g)).sort((a, b) => (isMain(b) - isMain(a)) || (a.lv - b.lv));
    if (!field.length && field0.length) { B.hunt(B.grindMap(), 'level'); return; }
    const boss = goals.filter(g => g.boss && (isMain(g) || g.lv <= L + 4)), visit = goals.filter(g => g.visit);
    if (visit.length) { B.go(visit[0].map); G.Quest.onMap(visit[0].map); return; }
    if (field.length) { B.hunt(field[0].map, 'quest'); return; }
    if (boss.length) {
      const g = boss[0], b = B.bossTry(g);
      if (b.skipped) { B.skipBoss(g); return; }
      if (b.tries >= 6 && b.failAuto6 && p.d.level < 100) { B.mode = 'to100'; return; }
      if (B.hpPots() < 30) {
        B.shopping();
        if (B.hpPots() < 30 && (B.farmT == null || B.t - B.farmT < 1800)) { if (B.farmT == null) { B.farmT = B.t; B.ev('farmGold', { map: g.map, gold: p.d.gold, pots: B.hpPots() }); } B.hunt(B.grindMap(), 'gold'); return; }
      }
      B.farmT = null;
      B.potFull();
      if (p.hp < p.st.maxHP * 0.95 || p.mp < p.st.maxMP * 0.9) { B.restNow(); return; }
      B.buyT = B.t; B.shopping(); B.startBoss(g); return;
    }
    // 할 퀘스트가 없음 → 다음 퀘스트 레벨까지 사냥
    const need = B.nextMainLv(), later = goals.filter(g => !g.boss && !g.visit && g.lv > L + 4).map(g => g.lv);
    const want = Math.min(need || 999, later.length ? Math.min(...later) - 4 : 999);
    if (want < 999 && p.d.level < want) { B.hunt(B.grindMap(), 'level'); return; }
    if (!need && !goals.length) { B.ev('noWork'); B.hunt(B.grindMap(), 'idle'); }
  };
  B.hpPots = () => P().d.inv.use.reduce((n, s) => n + (s && G.ITEMS[s.tid].use && (G.ITEMS[s.tid].use.hp || G.ITEMS[s.tid].use.hpP) ? s.qty : 0), 0);
  // 마을에서 물약으로 HP · MP 를 가득 채움 (재도전 전, 사람처럼)
  B.potFull = () => {
    const p = P(), use = p.d.inv.use;
    for (const k of ['hp', 'mp']) for (let i = 0; i < 60; i++) {
      const cur = k === 'hp' ? p.hp / p.st.maxHP : p.mp / p.st.maxMP; if (cur >= 0.999) break;
      const idx = use.findIndex(s => s && G.ITEMS[s.tid].use && (G.ITEMS[s.tid].use[k] || G.ITEMS[s.tid].use[k + 'P']) && !G.ITEMS[s.tid].use.cd);
      if (idx < 0) break;
      p.itemCd = {}; p.useItem(idx, W()); B.potsTown = (B.potsTown || 0) + 1;
    }
  };
  B.restNow = () => { if (B.mode === 'rest') return; G.Play.stop(); B.go(B.townOf()); B.afterRest = B.mode === 'to100' ? 'to100' : 'idle'; B.mode = 'rest'; B.restT = B.t; };
  B.hunt = (map, why) => {
    if (W().mapId !== map || !G.Play.autoOn) { B.go(map); G.Play.forceBoss = false; if (!G.Play.autoOn) G.Play.toggleAuto(); }
    if (why === 'level' || why === 'to100') B.grind += 1;
  };
  // 세이브 → 불러오기 확인 (장마다)
  B.saveCheck = () => {   // 저장 직후 바로 비교 (나중에 비교하면 자동 저장이 덮어써 다르게 보임)
    try {
      const snap = JSON.parse(JSON.stringify(P().d));
      G.Game.save(true);   // 브라우저 저장은 바로 써짐
      const raw = localStorage.getItem(G.Save.key(G.Save.slot)), data = JSON.parse(raw);
      const d = snap, diff = ['level', 'gold', 'exp', 'job', 'map'].filter(k => data.d[k] !== d[k]).concat(JSON.stringify(data.d.quests) === JSON.stringify(d.quests) ? [] : ['quests']);
      B.ev('saveCheck', { ok: !diff.length, diff, slot: G.Save.slot });
    } catch (e) { B.ev('saveCheck', { ok: false, err: String(e) }); }
  };
  // 진행이 10분(게임) 동안 없으면 멈춤 기록
  B.progressCheck = () => {
    const d = P().d, sig = d.level + ':' + d.exp + ':' + JSON.stringify(d.quests).length + ':' + Object.values(d.quests).filter(s => s.s === 'done').length + ':' + JSON.stringify(Object.values(d.quests).map(s => s.k));
    if (sig !== B.progSig || B.boss) { B.progSig = sig; B.lastProg = B.t; return false; }   // 보스전은 따로 25분 제한
    if (B.t - B.lastProg > 600) {
      const p = P(), w = W(), U = G.UI;
      B.ev('stuckDetail', { autoOn: G.Play.autoOn, paused: G.Play.paused(), busy: G.Play.userBusy(), fieldOk: G.Play.fieldOk(), blocking: U.blocking(), wins: Object.keys(U.wins), ov: (document.querySelector('#overlay') || {}).textContent.slice(0, 80),
        modal: G.Mobile.modalEl.classList.contains('on'), cut: G.Cutscene.playing(), dead: p.dead, px: Math.round(p.x), py: Math.round(p.y), plat: p.plat && p.plat.y, onG: p.onGround, lock: p.lock, held: [...G.Play.held],
        mons: w.monsters.slice(0, 12).map(m => `${m.id}@${Math.round(m.x)},${Math.round(m.y)}${m.dead ? 'x' : ''}`), plats: w.platforms.map(q => `${q.x}-${q.x + q.w}@${q.y}`), portrait: G.Mobile.portrait, ask: U.asking(), tgt: !!U.target, active: G.Touch.active(), dbg: G.Play.dbg, goals: B.goals().slice(0, 4), active: Object.keys(P().d.quests).filter(k => P().d.quests[k].s === "active"), taps: G.Play.taps, lastSkill: G.Play.lastSkill, weapon: p.d.eq.weapon && p.d.eq.weapon.tid, boss: B.bossSt });
      B.ev('stuck', { map: W().mapId, x: Math.round(P().x), mode: B.mode, goals: B.goals().slice(0, 3), auto: G.Play.autoOn }); B.lastProg = B.t; return true; }
    return false;
  };

  // ---------- 프레임 넘기기 ----------
  B.run = secs => {
    const end = B.t + secs;
    while (B.t < end) {
      for (let i = 0; i < 60; i++) {
        B.t += 1 / 60; B.ts += 1000 / 60;
        if (B.next) { B.next.t -= 1 / 60; if (B.next.t <= 0) { const n = B.next; B.next = null; B.spawnNext(n.m, n.id); B.nextPending = false; } }
        G.Game.frame(B.ts); G.Input.endFrame();
      }
      B.think();
      B.progressCheck();
      if (B.phase !== 'story') return B.phase;
    }
    return 'running';
  };

  // ---------- 시작 ----------
  G.Game.loop = () => {};
  G.Touch.opt.fps30 = false; G.Touch.opt.moveCancel = true; G.Touch.opt.magnet = true;
  B.GUARD0 = Object.assign({}, G.Play.AUTO_GUARD);
  // 2단계 보스 소환 타이머를 게임 시간으로
  const hookWorld = () => { const w = W(); if (!w || w.__bot) return; w.__bot = 1; w.draw = () => {}; B.spawnNext = G.World.prototype.spawnNextBoss.bind(w); w.spawnNextBoss = () => {}; };   // 월드는 맵을 옮겨도 같은 객체 → 항상 원래 함수를 씀   // 실제 타이머(2.8초)는 무시하고 bossTick 이 게임 시간으로 부름
  const cm = G.Game.changeMap.bind(G.Game);
  G.Game.changeMap = (...a) => { const r = cm(...a); const w = W(); w.__bot = 0; hookWorld(); return r; };
  hookWorld(); G.UI.frame = () => {};
  // 직접 플레이 모델: 보스 예고 공격을 30% 확률로 피함 (휴대폰 기준, 2.1 시뮬레이터와 같은 분류)
  const hurt = G.Player.prototype.hurt;
  G.Player.prototype.hurt = function (raw, fx, opt = {}) {
    if (B.manualDodge && B.boss) {
      const m = W().monsters.find(x => x.isBoss && !x.dead), id = (m && m.boss && m.boss.cur && m.boss.cur.pt && m.boss.cur.pt.id) || 'contact';
      if (!NODODGE.has(id) && Math.random() < 0.3) return;
    }
    return hurt.apply(this, arguments);
  };
  // 안전지대 패턴(파라칸 태양의 심판 · 녹스 종말의 별)도 같은 30% 로 안전지대에 들어감 (2026-11-06: 전에는 피해 함수가 달라서 한 번도 못 들어갔음)
  const tdm = G.Player.prototype.trueDamage;
  G.Player.prototype.trueDamage = function () {
    if (B.manualDodge && B.boss) {
      const m = W().monsters.find(x => x.isBoss && !x.dead), id = m && m.boss && m.boss.cur && m.boss.cur.pt && m.boss.cur.pt.id;
      if ((id === 'sun' || id === 'doom') && Math.random() < 0.3) return;
    }
    return tdm.apply(this, arguments);
  };
  const qp = G.Player.prototype.quickPotion; G.Player.prototype.quickPotion = function () { B.pots++; return qp.apply(this, arguments); };
  return true;
};

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13 landscape'] });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  await pg.goto(BASE + '/index.html'); await pg.waitForTimeout(1200);
  // 새 캐릭터 (실제 타이틀 · 캐릭터 만들기 흐름)
  await pg.evaluate(() => { G.Mobile.closeModal(); G.Title.act('new'); }); await pg.waitForTimeout(200);
  await pg.evaluate(() => G.Title.act('pick:A')); await pg.waitForTimeout(200);
  await pg.fill('#nameInput', '연희'); await pg.evaluate(() => G.Creator.act('start')); await pg.waitForTimeout(1200);
  if (await pg.evaluate(() => G.Cutscene.playing())) { await pg.evaluate(() => G.Cutscene.finish()); await pg.waitForTimeout(800); }
  for (let k = 0; k < 10 && !(await pg.evaluate(() => !!G.Game.player)); k++) await pg.waitForTimeout(300);
  await pg.evaluate(() => { G.Tutorial.skip(); }); await pg.waitForTimeout(200); await pg.evaluate(() => G.UI.answer(true)); await pg.waitForTimeout(800);
  await pg.evaluate(BOT, R);
  const t0 = Date.now();
  let st = 'running';
  while (st === 'running') {
    st = await pg.evaluate(() => BOT.run(600));
    const pr = await pg.evaluate(() => { const d = G.Game.player.d, q = Object.values(d.quests).filter(s => s.s === 'done').length; return { h: BOT.t / 3600, L: d.level, job: d.job, q, map: G.Game.world.mapId, mode: BOT.mode, boss: BOT.boss ? BOT.boss.g.map + '#' + BOT.boss.b.tries : '', gold: d.gold }; });
    const h = pr.h;
    const sd = await pg.evaluate(() => { const e = BOT.log.filter(x => x.type === 'stuckDetail'); const r = e.slice(BOT._sdN || 0); BOT._sdN = e.length; return r; });
    for (const x of sd) process.stderr.write('STUCK ' + JSON.stringify(x) + '\n');
    process.stderr.write(`${(Date.now() - t0) / 1000 | 0}s | ${h.toFixed(2)}h Lv.${pr.L} ${pr.job} 완료${pr.q} ${pr.map} ${pr.mode} ${pr.boss} ${pr.gold}G\n`);
    if (h > LIMIT_H) { st = 'limit'; break; }
    await pg.waitForTimeout(20);   // 사이에 게임 타이머(setTimeout) 처리
  }
  if (st === 'dump') { console.log(await pg.evaluate(() => window.__dump)); await b.close(); return; }
  // ---------- 엔딩 3종 ----------
  const endings = [];
  if (st === 'ending') {
    const watch = async kind => pg.evaluate(async kind => {
      const p = G.Game.player;
      G.Ending.play(kind);
      for (let i = 0; i < 40 && G.Cutscene.playing(); i++) { G.Cutscene.finish(); await new Promise(r => setTimeout(r, 50)); }
      await new Promise(r => setTimeout(r, 300));
      const cr = document.querySelector('.credits');
      return { kind, credits: !!cr, copy: !!document.querySelector('.cr-copy'), ending: p.d.ending, cleared: !!(p.d.flags && p.d.flags.cleared), hidden: !!(p.d.flags && p.d.flags.hiddenClear) };
    }, kind);
    const snap = await pg.evaluate(() => { BOT.ev('endingReady', { hiddenReady: G.Hidden.ready(), hiddenCount: G.Hidden.count() }); return JSON.stringify(G.Game.player.d); });
    for (const kind of ['seal', 'purify']) {
      await pg.evaluate(s => { G.UI.overlay(''); G.Game.begin(JSON.parse(s)); }, snap); await pg.waitForTimeout(300);
      const ok = await pg.evaluate(() => G.Quest.complete('f_08'));
      endings.push(Object.assign({ completed: ok }, await watch(kind)));
    }
    // 히든: 엘마의 "별조각의 기억" (조건 6/6 일 때만)
    const ready = await pg.evaluate(() => G.Hidden.ready());
    if (ready) endings.push(Object.assign({ via: 'memory' }, await watch('hidden')));
    else endings.push({ kind: 'hidden', skipped: 'REQ 미달', count: await pg.evaluate(() => G.Hidden.count()) });
  }
  const res = await pg.evaluate(() => {
    const p = G.Game.player, d = p.d, B = BOT;
    const qs = Object.values(G.QUESTS), done = id => d.quests[id] && d.quests[id].s === 'done';
    return {
      gameHours: +(B.t / 3600).toFixed(2), level: d.level, job: d.job, gold: d.gold,
      main: `${qs.filter(q => q.type === 'main' && done(q.id)).length}/${qs.filter(q => q.type === 'main').length}`,
      sub: `${qs.filter(q => q.type === 'sub' && done(q.id)).length}/${qs.filter(q => q.type === 'sub').length}`,
      notDone: qs.filter(q => !done(q.id) && B.questOk(q)).map(q => q.id),
      boss: B.bossSt, fieldDeaths: B.deaths.field, pots: B.pots, goldLow: B.goldLow,
      errlog: (G.ErrLog && Array.isArray(G.ErrLog.list) ? G.ErrLog.list.slice(0, 15).map(x => G.ErrLog.line(x)) : []),
      chapters: B.log.filter(e => e.type === 'chapter'), stuck: B.log.filter(e => e.type === 'stuck').slice(0, 10),
      saveChecks: B.log.filter(e => e.type === 'saveCheck'), bugs: B.log.filter(e => ['noMap', 'cantComplete', 'bossSkip', 'noWork'].includes(e.type)).slice(0, 30),
      eq: G.EQUIP_SLOTS.map(s => d.eq[s] ? `${s}:${d.eq[s].tid}+${d.eq[s].up || 0}` : `${s}:-`).join(' '),
      log: B.log,
    };
  });
  res.R = R; res.status = st; res.endings = endings; res.pageErrors = [...new Set(errs)].slice(0, 20); res.realSec = Math.round((Date.now() - t0) / 1000);
  console.log(JSON.stringify(res));
  await b.close();
})();
