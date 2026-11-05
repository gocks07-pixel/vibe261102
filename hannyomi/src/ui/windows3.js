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

  // ---------------- 1.7.12 영웅의 갑옷 고르기 (연희의 선물 보상) ----------------
  //  p.d.flags.heroPick = 남은 개수. 별조각 계승자 · 천공 세트에서 자유롭게 (무기는 자기 직업만, 섞어서 · 같은 부위 2개 가능)
  G.Win.heroset = {
    title: '✦ 영웅의 갑옷 고르기', x: 330, y: 40, w: 620, tab: 'starheir',
    pieces(sid) {
      const fam = G.familyOf(P().d.job), f = fam === 'beginner' ? 'warrior' : fam;
      return G.SETS[sid].pieces.map(pc => pc.includes('|') ? pc.split('|').find(id => G.ITEMS[id].job === f) || pc.split('|')[0] : pc);
    },
    owned(id) {
      const p = P(), st = G.Storage.of(p);
      return [...p.d.inv.equip, ...(st.equip || []), ...Object.values(p.d.eq)].some(it => it && it.tid === id);
    },
    render() {
      const p = P(), left = p.d.flags.heroPick || 0;
      let h = `<div class="dim" style="font-size:12px;margin-bottom:6px">아스트라: "우리가 남긴 갑옷 중 마음에 드는 것을 골라라." 섞어서 골라도 되고, 같은 부위를 두 번 골라도 된다.</div>
        <div class="ap-box">남은 선택<b>${left}</b><span class="dim" style="margin-left:auto;font-size:11px">무기는 자기 직업 무기만 보입니다</span></div>`;
      h += '<div class="tabs">' + [['starheir', '별조각 계승자 세트 (Lv.90)'], ['sky', '천공 세트 (Lv.85)']].map(([k, n]) => `<span class="t ${this.tab === k ? 'on' : ''}" data-act="tab" data-arg="heroset:${k}">${n}</span>`).join('') + '</div>';
      h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
      for (const id of this.pieces(this.tab)) {
        const t = G.ITEMS[id], own = this.owned(id);
        h += `<div class="sa-row" style="align-items:center"><img src="${G.Icons.item(t)}" width="34" height="34" data-tip="tpl:${id}">
          <div class="sa-i"><b>${esc(t.name)}</b>${own ? ' <span style="color:#7dff9a;font-size:11px">보유</span>' : ''}<br><span class="dim">Lv.${t.lv} · ${G.SLOT_NAMES[t.slot] || t.slot}</span></div>
          <button class="btn sm gold" data-act="hero" data-arg="${id}" ${left > 0 ? '' : 'disabled'}>고르기</button></div>`;
      }
      h += '</div>';
      const S = G.SETS[this.tab];
      h += `<div class="sep"></div><div style="font-size:12px"><b style="color:#ffe08a">${esc(S.name)} 효과</b>` +
        Object.entries(S.bonus).map(([n, b]) => `<div><span class="dim">${n}부위</span> ${Object.entries(b).map(([k, v]) => k === 'sfx' ? '' : G.statText(k, v)).filter(Boolean).join(', ')}</div>`).join('') + '</div>';
      return h;
    },
    act(id) {
      const p = P();
      if (!(p.d.flags.heroPick > 0) || !G.ITEMS[id]) return;
      G.UI.ask(`<b>${esc(G.ITEMS[id].name)}</b>을(를) 고를까요? (남은 선택 ${p.d.flags.heroPick}개)`, '고르기', () => {
        if (!(p.d.flags.heroPick > 0)) return;
        if (!G.Inv.hasSpace(p, id)) { G.UI.log('장비 칸이 가득 찼습니다. 한 칸을 비우고 다시 골라 주세요. (아스트라에게 말을 걸면 다시 고를 수 있어요)', '#ff7a7a'); G.Audio.play('error'); return; }
        G.Inv.add(p, G.Items.create(id, { boss: true }), 1);
        p.d.flags.heroPick--;
        G.UI.log(`[영웅의 갑옷] ${G.ITEMS[id].name}을(를) 받았습니다.`, '#ffe08a'); G.Audio.play('quest');
        G.UI.dirty(); G.Game.save(true);
        if (p.d.flags.heroPick > 0) G.UI.renderWin('heroset');
        else { G.UI.closeWin('heroset'); G.UI.banner('영웅의 갑옷', '아스트라: 그 갑옷과 함께, 끝까지 빛나거라.'); }
      });
    },
  };
})();
