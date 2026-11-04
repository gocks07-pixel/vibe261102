'use strict';
// 1.5: 창고 창 / 여행자의 나침반 창
(function () {
  const P = () => G.Game.player;
  const esc = G.U.esc, fmt = G.U.fmt;

  // ---------------- 창고 ----------------
  G.Win.storage = {
    title: '📦 창고', x: 420, y: 60, w: 330, tab: 'equip',
    onClose() { G.UI.storageOpen = false; G.UI.dirty(); },
    render() {
      const p = P(), st = G.Storage.of(p), arr = st[this.tab];
      const used = arr.filter(Boolean).length;
      let h = '<div class="tabs">' + Object.keys(G.Inv.TABS).map(t => `<span class="t ${this.tab === t ? 'on' : ''}" data-act="tab" data-arg="storage:${t}">${G.Inv.TABS[t]}</span>`).join('') + '</div>';
      h += `<div class="dim" style="font-size:12px;margin-bottom:6px">창고 칸 더블클릭: 꺼내기 · 인벤토리 더블클릭: 맡기기 <span style="float:right">${used}/${G.Storage.SIZE}</span></div>`;
      h += '<div class="grid sto">' + arr.map((it, i) => G.cell(it, `data-tip="sto:${this.tab}:${i}" data-dbl="sto:${this.tab}:${i}"`)).join('') + '</div>';
      h += `<div class="sto-gold"><div><span class="dim">창고</span> <b>💰 ${fmt(st.gold)} G</b></div><div><span class="dim">소지</span> <b>💰 ${fmt(p.d.gold)} G</b></div>
        <div class="row" style="gap:4px;margin-top:4px"><input id="stoGold" type="number" min="1" placeholder="금액" class="sto-in">
        <button class="btn sm" data-act="sto" data-arg="in">맡기기</button><button class="btn sm" data-act="sto" data-arg="out">찾기</button>
        <button class="btn sm" data-act="sto" data-arg="inAll">전부 맡기기</button></div></div>`;
      return h;
    },
    act(a) {
      const p = P(), inp = document.getElementById('stoGold'), n = inp ? +inp.value : 0;
      if (a === 'in') G.Storage.gold('in', n);
      if (a === 'out') G.Storage.gold('out', n);
      if (a === 'inAll') G.Storage.gold('in', p.d.gold);
    },
  };

  // ---------------- 여행자의 나침반 ----------------
  G.Win.teleport = {
    title: '🌀 여행자의 나침반', x: 340, y: 70, w: 600,
    render() {
      const n = G.Inv.count(P(), 'scroll_tele');
      let h = `<div class="dim" style="font-size:12px;margin-bottom:6px">가 본 적 있는 맵만 갈 수 있어요. 보스 방과 공허의 왕좌는 갈 수 없습니다. 이동하면 나침반 1개가 사라집니다. (남은 주문서 ${n}장)</div>`;
      for (const { r, maps } of G.Teleport.list()) {
        h += `<div class="dev-row"><b style="color:#ffcf4a">${esc(r.name)}</b><div>` +
          maps.map(id => `<button class="btn sm" data-act="tele" data-arg="${id}" data-tip="map:${id}">${esc(G.MAPS[id].name)}</button>`).join('') + '</div></div>';
      }
      return h;
    },
  };
})();
