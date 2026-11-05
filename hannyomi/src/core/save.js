'use strict';
// 저장/불러오기 (슬롯 A / B / C)
//  EXE(Electron): 문서/Hannyomi/save_A.json, save_B.json, save_C.json
//  브라우저: localStorage 'hny_save_A' ...
//  1.3 이전 세이브(arcelia_save_v1, EXE는 save.json)는 처음 읽을 때 슬롯 A로 옮긴다
G.Save = {
  SLOTS: ['A', 'B', 'C'],
  OLD_KEY: 'arcelia_save_v1',
  key: s => 'hny_save_' + s,
  slot: 'A',   // 지금 플레이 중인 슬롯 (자동 저장도 이 슬롯에만)
  VERSION: 4,  // 세이브 형식 버전 (1.4 = 2, 1.5 = 3, 1.6.1 = 4). 형식이 바뀌면 올리고 upgrade() 에 변환 코드를 넣는다

  migrate() {
    if (window.electronAPI) return;   // EXE는 메인 프로세스가 옮긴다
    try {
      const old = localStorage.getItem(this.OLD_KEY);
      if (old && !localStorage.getItem(this.key('A'))) localStorage.setItem(this.key('A'), old);
      if (old && localStorage.getItem(this.key('A'))) localStorage.removeItem(this.OLD_KEY);
    } catch (e) { /* 저장소 없음 */ }
  },
  async read(s) {
    try {
      if (window.electronAPI) return await window.electronAPI.loadGame(s);
      return localStorage.getItem(this.key(s));
    } catch (e) { return null; }
  },
  async write(s, json) {
    try {
      if (window.electronAPI) await window.electronAPI.saveGame(s, json);
      else localStorage.setItem(this.key(s), json);
      return true;
    } catch (e) { return false; }
  },
  async remove(s) {
    try {
      if (window.electronAPI) await window.electronAPI.deleteGame(s);
      else localStorage.removeItem(this.key(s));
      return true;
    } catch (e) { return false; }
  },
  async load(s) {
    const raw = await this.read(s);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (!data || !data.d) return null;
      // 옛 버전 세이브: 바꾸기 전에 원본을 백업 (save_A.backup.json / hny_save_A_backup)
      if ((data.v || 1) < this.VERSION) await this.backup(s, raw);
      return data;
    } catch (e) { return null; }
  },
  async backup(s, raw) {
    try {
      if (window.electronAPI) { if (window.electronAPI.backupGame) await window.electronAPI.backupGame(s, raw); }
      else localStorage.setItem(this.key(s) + '_backup', raw);
    } catch (e) { /* 백업 실패해도 게임은 계속 */ }
  },
  // 옛 세이브에 새 항목 기본값을 채운다 (게임 시작 직전에 한 번)
  upgrade(d) {
    // 1.4: 챕터 카드 기록
    G.Chapter.prepare(d);
    // 1.5: 방문 기록(여행자의 나침반), 창고, 세트 무기 보증 횟수
    G.Teleport.prepare(d);
    if (!d.pity) d.pity = {};
    // EXE 빌드: 자동 물약 설정 + 이미 f_06(마지막 별조각)을 끝낸 세이브에 별의 정수 3개 (녹스 전, 한 번만)
    G.AutoPot.of(d);
    if (!d.vExe) {
      const q = d.quests || {}, done = id => q[id] && q[id].s === 'done';
      if (done('f_06') && !done('f_07')) {
        const tmp = { d };
        if (!G.Inv.add(tmp, 'pot_essence', 3) && d.storage) G.Inv.add({ d: { inv: d.storage } }, 'pot_essence', 3);
        d.essGift = true;
      }
      d.vExe = true;
    }
    // 1.5: 레벨업 SP 상향 (30~59: 4 → 5, 60~: 5 → 6). 이미 올린 레벨만큼 차액을 지급
    // 1.6.1: 고유 시스템으로 변환 (한 번만)
    if (!d.v161) this.upgrade161(d);
    if ((d.spv || 1) < 2) {
      let add = 0;
      for (let L = 2; L <= d.level; L++) add += G.F.spFor(L) - G.F.spForOld(L);
      if (add > 0) { d.sp = (d.sp || 0) + add; d.spGift = add; }
      d.spv = 2;
    }
  },
  // 1.6.1 변환: 불꽃석 → 골드 환급, 용기·도박의 주문서 → 별빛 각인서 2·3장, 강화 수치를 새 배율(1.5배)에 맞게 환산
  upgrade161(d) {
    const msg = [];
    let gold = 0, scrolls = 0;
    const bags = [d.inv, d.storage].filter(Boolean);
    for (const bag of bags) for (const tab of ['use', 'etc']) {
      const arr = bag[tab] || [];
      for (let i = 0; i < arr.length; i++) {
        const s = arr[i];
        if (!s) continue;
        if (s.tid === 'flame') { gold += 1500 * s.qty; arr[i] = null; }
        else if (s.tid === 'scroll_70' || s.tid === 'scroll_30') { scrolls += s.qty * (s.tid === 'scroll_70' ? 2 : 3); arr[i] = null; }
      }
    }
    if (gold) { d.gold += gold; msg.push(`불꽃석 → ${G.U.fmt(gold)} 골드 환급`); }
    if (scrolls) {
      const tmp = { d };
      if (!G.Inv.add(tmp, 'scroll_100', scrolls)) { if (d.storage) G.Inv.add({ d: { inv: d.storage } }, 'scroll_100', scrolls); }
      msg.push(`옛 주문서 → 별빛 각인서 ${scrolls}장`);
    }
    // 옛 강화(+1/+2/+3)는 새 배율로 환산해 능력치가 거의 그대로 유지되게
    const items = [];
    for (const k in d.eq) if (d.eq[k]) items.push(d.eq[k]);
    for (const bag of bags) for (const it of bag.equip || []) if (it) items.push(it);
    for (const it of items) if (it.up) it.up = Math.max(1, Math.round(it.up / 1.5));
    d.v161 = true;
    if (msg.length) d.notice161 = msg.join(' · ');
  },

  // 슬롯 3개를 한 번에 → { A: data|null, B: ..., C: ... }
  async loadAll() {
    this.migrate();
    const out = {};
    for (const s of this.SLOTS) out[s] = await this.load(s);
    return out;
  },
  async store(player, s = this.slot) {
    return this.write(s, JSON.stringify({ v: this.VERSION, slot: s, time: Date.now(), d: player.d }));
  },

  // 슬롯 카드에 보여 줄 요약
  info(data) {
    if (!data) return null;
    const d = data.d, map = G.MAPS[d.map];
    const job = G.JOBS[d.job];
    return {
      name: d.name, level: d.level, job: job ? job.name : '',
      where: map ? map.name : '',
      chapter: G.Chapter ? G.Chapter.label(G.Chapter.current(d)) : '',
      time: data.time ? this.timeText(data.time) : '',
      cleared: !!(d.flags && d.flags.cleared),
      ending: d.ending,
      hidden: !!(d.flags && d.flags.hiddenClear),
    };
  },
  timeText(t) {
    const d = new Date(t), p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  },
};
