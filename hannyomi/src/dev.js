'use strict';
// ============================================================
// 테스트 모드 (직접 플레이 검증용)
//  - Lv.100 4차 직업 8개 중 선택 (기본 천붕검제) + 별조각 계승자 풀세트 + 스킬 전부 마스터
//  - 게임 중 "직업만 바꾸기": 위치·장·퀘스트·골드는 그대로, 직업·스탯·스킬·장비만 교체 (1.7.3)
//  - 원하는 장부터 시작 (그 전 장의 메인 퀘스트는 완료 처리)
//  - 메뉴(Esc) → "🛠 테스트 순간이동"으로 모든 맵에 바로 이동 (보스 방 포함)
// ★ 최종 EXE 빌드 전에 이 파일과 index.html 의 <script src="src/dev.js"> 한 줄을 지우면 완전히 사라진다.
//   (세이브의 d.dev 값은 남아도 아무 영향 없음)
// ============================================================
G.Dev = {
  JOB: 'warrior_4a',   // 천붕검제 (기본값)
  JOBS4: ['warrior_4a', 'warrior_4b', 'archer_4a', 'archer_4b', 'mage_4a', 'mage_4b', 'thief_4a', 'thief_4b'],
  job: 'warrior_4a',
  WEAPON: { warrior: 'trial_sword', archer: 'trial_bow', mage: 'trial_wand', thief: 'trial_dagger' },
  ch: 5, saves: {}, ask: null,

  // ---------- 캐릭터 만들기 ----------
  // Lv.100, AP 전부 주스탯·부스탯, 스킬 전부 마스터, 별조각 계승자 세트 +5 (특수 효과 1줄씩), 물약·주문서
  base(job) {
    const d = G.Player.newData('테스트용사', G.LOOKS.random());
    const J = G.JOBS[job], fam = J.family;
    d.tut = null; d.level = 100; d.job = job; d.gold = 0;
    d.base = { STR: 4, DEX: 4, INT: 4, LUK: 4 };
    d.base[J.sub] += 100; d.base[J.main] += 404;   // AP 504 = 9 + 99 × 5
    d.ap = 0; d.sp = 0;
    for (const j of G.jobChain(job)) for (const sk of G.skillsOfJob(j)) d.skills[sk.id] = sk.maxLv;
    const by = t => G.skillsOfJob(t).filter(s => s.type === 'attack').map(s => s.id);
    const buffs = G.jobChain(job).flatMap(j => G.skillsOfJob(j).filter(s => s.type === 'buff').map(s => s.id)).reverse();
    d.hot = [...by(job).slice(0, 3), by(J.prev)[0], buffs[0], buffs[1] || 'b_aid'];
    const make = tid => {
      const it = G.Items.create(tid, { boss: true });
      it.up = 5; it.slots = Math.max(0, G.Items.maxSlots(G.ITEMS[tid]) - 3);
      it.sfx = [G.Items.rollSfx(0.5)];
      return it;
    };
    d.eq = {
      weapon: make(this.WEAPON[fam]), hat: make('trial_hat'), top: make('trial_top'), bottom: make('trial_bottom'),
      shoes: make('trial_shoes'), gloves: make('trial_gloves'), cape: make('trial_cape'),
      earring: make('trial_earring'), ring1: make('trial_ring'), ring2: make('trial_ring'), pendant: make('trial_pendant'), belt: make('trial_belt'),
    };
    d.inv = G.Inv.empty();
    const tmp = { d };
    for (const [tid, n] of [['pot_white', 300], ['pot_elixir', 150], ['scroll_100', 30], ['cube', 30], ['scroll_tele', 20]]) G.Inv.add(tmp, tid, n);
    return d;
  },
  build(ch) {
    const d = this.base(this.job);
    d.dev = true;
    d.gold = 10000000;
    const C = G.Chapter;
    for (let i = 1; i <= ch; i++) d.flags[C.FLAGS[i]] = true;
    // 고른 장 이전의 메인 퀘스트는 완료 처리 (각성 퀘스트 제외)
    for (const q of Object.values(G.QUESTS)) {
      if (q.type !== 'main' || q.job) continue;
      const qi = C.NAMES.findIndex(n => n[0] === q.ch);
      if (qi >= 0 && qi < ch) d.quests[q.id] = { s: 'done' };
    }
    // 이미 지나온 장의 별조각
    for (const [qid, el] of Object.entries(C.SHARD_Q)) {
      if (d.quests[qid]) G.Inv.add({ d }, 'star_' + el, 1);
    }
    const town = Object.keys(C.TOWN).find(t => C.TOWN[t] === ch);
    d.map = town; d.town = town; d.tut = null;
    d.hp = 999999; d.mp = 999999;
    return d;
  },

  // 게임 중 직업만 바꾸기: 위치·장·퀘스트·골드·인벤토리는 그대로
  swap(job) {
    const p = G.Game.player; if (!p || !p.d.dev) return;
    const nd = this.base(job), d = p.d;
    for (const k of ['job', 'level', 'base', 'ap', 'sp', 'skills', 'hot', 'eq']) d[k] = nd[k];
    d.exp = 0; p.buffs = {}; p.cd = {}; p.barrier = 0;
    p.recalc(); p.hp = p.st.maxHP; p.mp = p.st.maxMP;
    G.FX.pillar(p.x, p.y, '#9affc0');
    G.UI.dirty(); G.Game.save(true);
    G.UI.log(`[테스트 모드] 직업을 ${G.JOBS[job].name}(으)로 바꿨습니다. 스킬·장비·단축키가 새 직업에 맞춰졌어요.`, '#9affc0');
  },

  // ---------- 화면 ----------
  BG: 'background:radial-gradient(ellipse at 50% 40%, #1a3a2a 0%, #050a08 75%)',
  async open() { this.saves = await G.Save.loadAll(); this.ask = null; this.render(); },
  render() {
    const C = G.Chapter, esc = G.U.esc;
    let h = `<div class="overlay" style="${this.BG}"><h1 style="font-size:40px;color:#9affc0;text-shadow:0 3px 0 #0a2a14">🛠 테스트 모드</h1>
      <h2>Lv.100 4차 직업 · 별조각 계승자 풀세트(+5) · 스킬 전부 마스터 · 메뉴에서 어디든 순간이동 · 직업 바꾸기 · 엔딩 보기</h2>
      <div class="dim" style="margin:-18px 0 8px">직업</div><div class="dev-ch">`;
    for (const j of this.JOBS4) h += `<button class="btn sm ${this.job === j ? 'gold' : ''}" data-act="dev" data-arg="job:${j}">${esc(G.JOBS[j].name)}</button>`;
    h += `</div><div class="dim" style="margin:14px 0 8px">시작할 장</div><div class="dev-ch">`;
    C.NAMES.forEach((n, i) => { h += `<button class="btn sm ${this.ch === i ? 'gold' : ''}" data-act="dev" data-arg="ch:${i}">${esc(n[0])} · ${esc(n[1])}</button>`; });
    h += `</div><div class="dim" style="margin:14px 0 8px">저장할 슬롯</div><div class="dev-ch">`;
    for (const s of G.Save.SLOTS) {
      const info = G.Save.info(this.saves[s]);
      h += `<button class="btn" data-act="dev" data-arg="slot:${s}">슬롯 ${s}<br><small class="dim">${info ? `${esc(info.name)} Lv.${info.level} (덮어쓰기)` : '비어 있음'}</small></button>`;
    }
    h += `</div><button class="btn" data-act="dev" data-arg="back" style="margin-top:16px">뒤로</button>`;
    if (this.ask) {
      h += `<div class="ask-bg"><div class="ask"><div>슬롯 ${this.ask}의 <b>${esc(G.Save.info(this.saves[this.ask]).name)}</b> 데이터를 지우고 테스트 캐릭터를 만들까요?</div>
        <button class="btn red" data-act="dev" data-arg="yes">덮어쓰기</button> <button class="btn" data-act="dev" data-arg="no">취소</button></div></div>`;
    }
    G.UI.overlay(h + '</div>');
  },
  act(a) {
    if (a === 'open') this.open();
    else if (a === 'back') G.Title.render();
    else if (a.startsWith('ch:')) { this.ch = +a.slice(3); this.render(); }
    else if (a.startsWith('job:')) { this.job = a.slice(4); this.render(); }
    else if (a.startsWith('swap:')) { G.UI.closeWin('devtp'); this.swap(a.slice(5)); }
    else if (a.startsWith('slot:')) { const s = a.slice(5); if (this.saves[s]) { this.ask = s; this.render(); } else this.start(s); }
    else if (a === 'no') { this.ask = null; this.render(); }
    else if (a === 'yes') { const s = this.ask; this.ask = null; this.start(s); }
    else if (a === 'tp') { G.UI.closeWin('menu'); G.UI.openWin('devtp'); }
    else if (a.startsWith('go:')) { G.UI.closeWin('devtp'); G.Game.changeMap(a.slice(3), null); }
    else if (a === 'hiddenReq') { const p = G.Game.player; for (const id of G.Hidden.REQ) p.d.quests[id] = { s: 'done' }; G.UI.log('[테스트] 히든 엔딩 조건 퀘스트 6개를 완료로 표시했습니다.', '#9affc0'); G.UI.dirty(); }   // 2.0
    else if (a === 'elites') { const p = G.Game.player; for (const id in G.MONSTERS) if (G.MONSTERS[id].kind === 'elite') { p.d.flags['elite:' + id] = 1; const q = p.d.quests.c3_s5; if (q && q.s === 'active') q.k[id] = 1; } G.UI.log('[테스트] 정예 6종 처치 기록을 채웠습니다.', '#9affc0'); G.UI.dirty(); }
    else if (a === 'intro') { G.UI.closeWin('devtp'); G.Cutscene.play('intro', () => G.Music.playMap(G.Game.world.mapId, 2)); }
    else if (a.startsWith('end:')) { G.UI.closeWin('devtp'); G.Ending.play(a.slice(4), true); }   // 미리보기: 세이브에 기록 안 함
  },
  start(slot) {
    G.Save.slot = slot;
    G.UI.overlay('');
    G.Game.begin(this.build(this.ch));
    G.Game.save(true);
    G.UI.log(`[테스트 모드] ${G.JOBS[this.job].name} · ${G.Chapter.label(this.ch)}부터 시작합니다. Esc → "🛠 테스트 순간이동 · 엔딩 보기"에서 어디든 가고 엔딩도 볼 수 있어요.`, '#9affc0');
  },
};

// ---------- 순간이동 창 ----------
G.Win.devtp = {
  title: '🛠 테스트 순간이동 · 직업 · 엔딩', x: 300, y: 40, w: 680,
  render() {
    const cur = G.Game.world && G.Game.world.mapId;
    let h = `<div class="dev-row"><b style="color:#9affc0">🎬 엔딩 보기</b><div>
      <button class="btn sm" data-act="dev" data-arg="end:seal">희생 · 영원한 별</button>
      <button class="btn sm" data-act="dev" data-arg="end:purify">구원 · 새로운 별</button>
      <button class="btn sm" data-act="dev" data-arg="end:hidden">히든 · 함께 빛나는 별</button>
      <button class="btn sm" data-act="dev" data-arg="intro">배경 설명 영상</button>
      <button class="btn sm" data-act="dev" data-arg="elites">정예 처치 기록 채우기 (연희의 선물)</button>
      <button class="btn sm" data-act="dev" data-arg="hiddenReq">히든 엔딩 조건 채우기 (서브 퀘스트 6개)</button>
      <span class="dim" style="font-size:11px;align-self:center">미리보기라 세이브에 기록되지 않아요</span></div></div>`;
    const pj = G.Game.player && G.Game.player.d.job;
    h += `<div class="dev-row"><b style="color:#9affc0">🧙 직업만 바꾸기</b><div>`;
    for (const j of G.Dev.JOBS4) h += `<button class="btn sm ${j === pj ? 'gold' : ''}" data-act="dev" data-arg="swap:${j}" ${j === pj ? 'disabled' : ''}>${G.U.esc(G.JOBS[j].name)}</button>`;
    h += `<span class="dim" style="font-size:11px;align-self:center">위치·퀘스트·골드는 그대로</span></div></div><div class="sep"></div>`;
    h += '<div class="dim" style="font-size:12px;margin-bottom:6px">테스트 모드 전용. 보스 방 포함 모든 맵으로 바로 이동합니다.</div>';
    for (const r of G.WORLD.regions) {
      h += `<div class="dev-row"><b style="color:${r.color === '#4a2a6a' ? '#c08aff' : '#ffcf4a'}">${G.U.esc(r.name)}</b><div>`;
      for (const id of r.maps) {
        const m = G.MAPS[id];
        h += `<button class="btn sm ${id === cur ? 'gold' : ''}" data-act="dev" data-arg="go:${id}" ${id === cur ? 'disabled' : ''}>${G.U.esc(m.name)}${m.bossRoom ? ' ⚔' : ''}</button>`;
      }
      h += '</div></div>';
    }
    return h;
  },
};

// ---------- 기존 화면에 버튼 끼워 넣기 (이 파일만 지우면 함께 사라짐) ----------
(function () {
  const onClick = G.UI.onClick;
  G.UI.onClick = function (e) {
    const el = e.target.closest('[data-act="dev"]');
    if (el) { G.Dev.act(el.dataset.arg); return; }
    return onClick.call(this, e);
  };
  const titleRender = G.Title.render;
  G.Title.render = function () {
    titleRender.call(this);
    if (this.mode) return;
    const help = document.querySelector('#overlay [data-arg="help"]');
    if (help) help.insertAdjacentHTML('beforebegin', '<button class="btn" data-act="dev" data-arg="open" style="border-color:#3aa86a;background:#143a24">🛠 테스트 모드 (Lv.100 4차 직업)</button>');
  };
  const menuRender = G.Win.menu.render;
  G.Win.menu.render = function () {
    const h = menuRender.call(this), p = G.Game.player;
    if (!p || !p.d.dev) return h;
    return '<button class="btn" data-act="dev" data-arg="tp" style="width:100%;margin-bottom:6px;border-color:#3aa86a;background:#143a24">🛠 테스트 순간이동 · 직업 바꾸기 · 엔딩</button>' + h;
  };
  const st = document.createElement('style');
  st.textContent = `.dev-ch { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; max-width: 900px; }
    .overlay .dev-ch .btn { min-width: 0; margin: 0; }
    .dev-row { display: flex; gap: 8px; margin: 5px 0; align-items: flex-start; }
    .dev-row > b { width: 130px; flex: none; font-size: 12px; padding-top: 2px; }
    .dev-row > div { display: flex; flex-wrap: wrap; gap: 4px; }`;
  document.head.appendChild(st);
})();
