'use strict';
// 1.5: 창고 (창고지기 도라) / 여행자의 나침반 / 방문 기록

// ---------------- 창고 ----------------
//  저장 데이터: p.d.storage = { equip: [30], use: [30], etc: [30], gold }
//  어느 마을의 창고지기에게 맡겨도 같은 창고. 세이브 슬롯마다 따로.
G.Storage = {
  SIZE: 30,
  of(p) {
    const d = p.d;
    if (!d.storage) d.storage = { equip: Array(this.SIZE).fill(null), use: Array(this.SIZE).fill(null), etc: Array(this.SIZE).fill(null), gold: 0 };
    return d.storage;
  },
  // 인벤토리 → 창고
  deposit(tab, idx) {
    const p = G.Game.player, it = p.d.inv[tab][idx];
    if (!it) return;
    const t = G.ITEMS[it.tid], st = this.of(p), arr = st[tab];
    if (t.quest) { G.UI.log('퀘스트 아이템은 창고에 맡길 수 없습니다.', '#ff7a7a'); G.Audio.play('error'); return; }
    if (t.cat !== 'equip') {   // 같은 아이템 묶음에 먼저 합치기
      for (const s of arr) {
        if (s && s.tid === it.tid && s.qty < t.stack) {
          const n = Math.min(it.qty, t.stack - s.qty); s.qty += n; it.qty -= n;
          if (it.qty <= 0) break;
        }
      }
      if (it.qty <= 0) { p.d.inv[tab][idx] = null; this.done(`${t.name}을(를) 맡겼습니다.`); return; }
    }
    const i = arr.indexOf(null);
    if (i < 0) { G.UI.log(`창고의 ${G.Inv.TABS[tab]} 칸이 가득 찼습니다. (${this.SIZE}칸)`, '#ff7a7a'); G.Audio.play('error'); G.UI.dirty(); return; }
    arr[i] = it; p.d.inv[tab][idx] = null;
    this.done(`${t.name}${it.qty > 1 ? ' ×' + it.qty : ''}을(를) 맡겼습니다.`);
  },
  // 창고 → 인벤토리
  withdraw(tab, idx) {
    const p = G.Game.player, st = this.of(p), it = st[tab][idx];
    if (!it) return;
    const t = G.ITEMS[it.tid], before = it.qty;
    if (!G.Inv.hasSpace(p, it.tid) || !G.Inv.add(p, it)) {
      if (t.cat !== 'equip' && it.qty < before) { this.done(`${t.name}을(를) 일부 찾았습니다. (인벤토리 부족)`); return; }
      G.UI.log('인벤토리 공간이 부족합니다.', '#ff7a7a'); G.Audio.play('error'); return;
    }
    st[tab][idx] = null;
    this.done(`${t.name}${before > 1 ? ' ×' + before : ''}을(를) 찾았습니다.`);
  },
  gold(kind, n) {
    const p = G.Game.player, st = this.of(p);
    n = Math.floor(+n || 0);
    if (n <= 0) return;
    if (kind === 'in') {
      n = Math.min(n, p.d.gold);
      if (n <= 0) { G.UI.log('맡길 골드가 없습니다.', '#ff7a7a'); return; }
      p.d.gold -= n; st.gold += n; this.done(`${G.U.fmt(n)} G를 맡겼습니다.`);
    } else {
      n = Math.min(n, st.gold);
      if (n <= 0) { G.UI.log('창고에 골드가 없습니다.', '#ff7a7a'); return; }
      st.gold -= n; p.d.gold += n; this.done(`${G.U.fmt(n)} G를 찾았습니다.`);
    }
  },
  done(msg) { G.UI.log(msg, '#bfe6ff'); G.Audio.play('pickup'); G.UI.dirty(); G.Game.save(true); },
  open() {
    G.UI.storageOpen = true;
    G.UI.openWin('storage'); G.UI.openWin('inv');
  },
};

// ---------------- 방문 기록 / 여행자의 나침반 ----------------
//  p.d.visited = { mapId: 1 }. 가 본 맵만, 보스 방·최종 보스 맵·튜토리얼은 제외
G.Teleport = {
  ok(id) {
    const m = G.MAPS[id];
    return !!m && !m.bossRoom && !m.hidden && id !== 'void_throne';
  },
  visit(id) {
    const p = G.Game.player;
    if (!p) return;
    if (!p.d.visited) p.d.visited = {};
    p.d.visited[id] = 1;
  },
  // 1.4 이하 세이브: 지나온 장의 지역 + 지금 맵을 방문한 것으로 채움
  prepare(d) {
    if (d.visited) return;
    d.visited = {};
    const ch = G.Chapter.current(d);
    G.WORLD.regions.forEach((r, i) => { if (i < ch) for (const id of r.maps) d.visited[id] = 1; });
    if (d.map) d.visited[d.map] = 1;
    if (d.town) d.visited[d.town] = 1;
  },
  list() {
    const p = G.Game.player, v = p.d.visited || {}, cur = G.Game.world.mapId;
    return G.WORLD.regions.map(r => ({ r, maps: r.maps.filter(id => this.ok(id) && v[id] && id !== cur) })).filter(x => x.maps.length);
  },
  open() {
    if (!this.list().length) { G.UI.log('아직 순간이동할 수 있는 곳이 없습니다. (가 본 적 있는 맵만 갈 수 있어요)', '#ff7a7a'); return; }
    G.UI.openWin('teleport');
  },
  go(id) {
    const p = G.Game.player;
    if (!this.ok(id) || !(p.d.visited || {})[id]) return;
    if (G.Inv.count(p, 'scroll_tele') <= 0) { G.UI.log('여행자의 나침반가 없습니다.', '#ff7a7a'); G.UI.closeWin('teleport'); return; }
    G.Inv.remove(p, 'scroll_tele', 1);
    G.UI.closeWin('teleport');
    G.UI.log(`여행자의 나침반: ${G.MAPS[id].name}(으)로 이동합니다.`, '#bfe6ff');
    G.FX.pillar(p.x, p.y, '#9ad8ff');
    G.Game.changeMap(id, null);
  },
};
