'use strict';
// 각 창의 내용. render() 는 HTML 문자열을 돌려준다
G.Win = {};
(function () {
  const P = () => G.Game.player;
  const esc = G.U.esc, fmt = G.U.fmt;

  function cell(it, attrs) {
    if (!it) return `<div class="cell" ${attrs}></div>`;
    const t = G.ITEMS[it.tid], g = it.grade || 0;
    const gm = g ? `<span class="gm" style="border-top-color:${G.GRADES[g].color}"></span>` : '';
    const up = it.up ? `<span class="up">+${it.up}</span>` : '';
    return `<div class="cell" ${attrs}><img src="${G.Icons.item(t)}">${gm}${up}${it.qty > 1 ? `<span class="q">${it.qty}</span>` : ''}</div>`;
  }
  G.cell = cell;   // 1.5: 창고 창에서도 같은 칸 모양을 쓴다

  // ---------------- 스탯 ----------------
  G.Win.stat = {
    title: '캐릭터 정보', x: 30, y: 60, w: 290,
    render() {
      const p = P(), d = p.d, s = p.st, job = G.JOBS[d.job];
      let h = `<div class="row" style="margin-bottom:8px"><b style="font-size:15px">${esc(d.name)}</b><span class="dim">Lv.${d.level} · ${job.name}</span></div>`;
      h += `<div class="ap-box">남은 능력 포인트<b>${d.ap}</b><span class="dim" style="margin-left:auto;font-size:11px">Shift+클릭: 5씩</span></div>`;
      for (const k of G.STATS4) {
        const isMain = k === job.main, isSub = k === job.sub;
        h += `<div class="stat-row"><span class="k" style="color:${isMain ? '#ffd54a' : isSub ? '#9fd8ff' : '#c9d1ea'}">${G.STAT_NAMES[k]}</span>
          <span class="v">${s[k]} <em>${s[k + 'bonus'] ? `(${d.base[k]} + ${s[k + 'bonus']})` : ''}</em></span>
          <button class="btn sm" data-act="ap" data-arg="${k}" ${d.ap ? '' : 'disabled'}>+</button></div>`;
      }
      h += `<div class="dim" style="font-size:11px;margin:4px 0">주스탯 <b style="color:#ffd54a">${G.STAT_NAMES[job.main]}</b> · 부스탯 <b style="color:#9fd8ff">${G.STAT_NAMES[job.sub]}</b>${d.job === 'beginner' ? '' : ` · 레벨업마다 ${G.STAT_NAMES[job.main]} 자동 +${G.F.AUTO_STAT}`}</div>`;
      h += `<div class="sep"></div><div class="dl">
        <span>스탯 공격력</span><span class="dv">${fmt(s.minDmg)} ~ ${fmt(s.maxDmg)}</span>
        <span>공격력</span><span class="dv">${s.atk}</span>
        <span>최대 HP</span><span class="dv">${fmt(s.maxHP)}</span>
        <span>최대 MP</span><span class="dv">${fmt(s.maxMP)}</span>
        <span>방어력</span><span class="dv">${s.def}</span>
        <span>치명타 확률</span><span class="dv">${s.crit}%</span>
        <span>치명타 피해</span><span class="dv">+${s.critDmg}%</span>
        <span>데미지</span><span class="dv">+${s.dmgp}%</span>
        <span>보스 공격 시 데미지</span><span class="dv">+${s.bossDmg}%</span>
        <span>방어율 무시</span><span class="dv">${s.ignoreDef}%</span>
        <span>공격 속도 / 이동속도</span><span class="dv">+${s.aspd}% / +${s.mspd}%</span></div>`;
      const fx = Object.keys(s.sfx);
      if (fx.length) {
        h += `<div class="sep"></div><b style="font-size:12px;color:#ffe08a">장비 특수 효과</b>`;
        h += fx.map(id => `<div style="font-size:11px;color:#ffe8a0">${G.Items.sfxText({ id, p: s.sfx[id].p, v: s.sfx[id].v })}</div>`).join('');
      }
      return h;
    },
  };

  // ---------------- 장비 ----------------
  G.Win.equip = {
    title: '장비', x: 330, y: 60, w: 300,
    render() {
      const p = P(), d = p.d, tgt = G.UI.target;
      let h = '<div class="eqgrid">';
      for (const slot of G.EQUIP_SLOTS) {
        const it = d.eq[slot];
        const c = cell(it, `data-tip="eq:${slot}" data-dbl="eq:${slot}" ${it ? `data-tgt="eq:${slot}"` : ''}`);
        h += `<div class="eqslot">${tgt && it ? c.replace('class="cell"', 'class="cell target"') : c}${G.SLOT_NAMES[slot]}</div>`;
      }
      h += '</div><div class="dim" style="font-size:11px;text-align:center;margin-top:6px">더블클릭: 장비 해제</div>';
      const sets = Object.keys(p.st.setCount);
      h += '<div class="sep"></div><b style="font-size:12px">세트 효과</b>';
      if (!sets.length) h += '<div class="dim" style="font-size:12px">착용 중인 세트 장비가 없습니다.</div>';
      for (const sid of sets) {
        const set = G.SETS[sid], cnt = p.st.setCount[sid];
        h += `<div style="margin-top:4px;font-size:12px" data-tip="set:${sid}"><b style="color:#7de3b0">${set.name} (${cnt}/${set.pieces.length})</b>`;
        for (const n in set.bonus) {
          h += `<div style="color:${cnt >= +n ? '#7dff9a' : '#5d6585'}">${n}세트: ${Object.keys(set.bonus[n]).map(k => G.statText(k, set.bonus[n][k])).join(', ')}</div>`;
        }
        h += '</div>';
      }
      return h;
    },
  };

  // ---------------- 인벤토리 ----------------
  G.Win.inv = {
    title: '인벤토리', x: 900, y: 60, tab: 'equip',
    render() {
      const p = P(), d = p.d, tgt = G.UI.target;
      let h = '<div class="tabs">' + Object.keys(G.Inv.TABS).map(t => `<span class="t ${this.tab === t ? 'on' : ''}" data-act="tab" data-arg="inv:${t}">${G.Inv.TABS[t]}</span>`).join('') + '</div>';
      if (tgt) h += `<div class="tgtline">✨ <b>${tgt.kind === 'smith' ? '장비 단련' : esc(G.ITEMS[tgt.tid].name)}</b>: 대상 장비를 고르세요${tgt.kind === 'smith' ? ' <span class="dim">(비용: 장비 레벨 × 60 + 500 G)</span>' : ''} <button class="btn" data-act="tgtcancel">취소</button></div>`;   // 빌드 3 (11): 고르는 중 띠 + [취소]
      if (G.UI.storageOpen) h += `<div style="color:#9ad8ff;font-size:12px;margin-bottom:6px">창고 이용 중: 더블클릭하면 창고에 맡깁니다.</div>`;
      else if (G.UI.shopNpc) h += `<div style="color:#ffd54a;font-size:12px;margin-bottom:6px">상점 이용 중: 더블클릭하면 판매합니다.</div>`;
      h += '<div class="grid">';
      d.inv[this.tab].forEach((it, i) => {
        const attrs = `data-tip="inv:${this.tab}:${i}" data-dbl="inv:${this.tab}:${i}"` + (this.tab === 'equip' && it ? ` data-tgt="inv:${i}"` : '');
        h += cell(it, attrs).replace('class="cell"', `class="cell${tgt && this.tab === 'equip' && it ? ' target' : ''}"`);
      });
      h += `</div><div class="row" style="margin-top:8px"><span style="color:#ffd54a;font-weight:700">💰 ${fmt(d.gold)} G</span><span class="dim" style="margin-left:auto;font-size:11px">더블클릭: 착용/사용</span></div>`;
      return h;
    },
  };

  // ---------------- 퀘스트 ----------------
  G.Win.quest = {
    title: '퀘스트', x: 400, y: 60, w: 520, tab: 'active', sel: null,
    render() {
      const p = P(), Q = G.Quest;
      const all = Object.values(G.QUESTS);
      const lists = {
        active: all.filter(q => Q.isActive(q.id)),
        avail: all.filter(q => Q.available(q) || Q.soon(q)),
        done: all.filter(q => Q.isDone(q.id)),
      };
      const names = { active: `진행 중 (${lists.active.length})`, avail: `시작 가능 (${lists.avail.length})`, done: `완료 (${lists.done.length})` };
      let h = '<div class="tabs">' + Object.keys(names).map(t => `<span class="t ${this.tab === t ? 'on' : ''}" data-act="tab" data-arg="quest:${t}">${names[t]}</span>`).join('') + '</div>';
      const list = lists[this.tab];
      if (!list.find(q => q.id === this.sel)) this.sel = list[0] && list[0].id;
      h += '<div style="display:flex;gap:10px"><div style="width:190px;max-height:380px;overflow-y:auto">';
      if (!list.length) h += '<div class="dim">없음</div>';
      for (const q of list) {
        const soon = this.tab === 'avail' && !Q.available(q);
        h += `<div class="ql ${this.sel === q.id ? 'on' : ''}" data-act="qsel" data-arg="${q.id}"><span class="tag ${q.type}">${q.type === 'main' ? '메인' : '서브'}</span>${esc(q.name)}${soon ? ` <span class="dim">(Lv.${q.lv})</span>` : ''}${Q.ready(q) ? ' <span style="color:#7dff9a">✔</span>' : ''}${this.tab === 'active' && p.d.quests[q.id] && p.d.quests[q.id].h ? ' <span class="dim">(숨김)</span>' : ''}</div>`;
      }
      h += '</div><div style="flex:1;font-size:12px">';
      const q = G.QUESTS[this.sel];
      if (q) {
        h += `<b style="font-size:14px;color:${q.type === 'main' ? '#ffcf4a' : '#7fc8ff'}">${esc(q.name)}</b> <span class="dim">${esc(G.Chapter.qLabel(q.ch))} · Lv.${q.lv}</span>`;
        h += `<div style="margin:6px 0">${esc(q.desc)}</div>`;
        h += `<div class="dim">시작: ${G.NPCS[q.start].name} → 완료: ${G.NPCS[q.end].name}</div>`;
        if (q.obj.length && this.tab !== 'done') h += '<div class="sep"></div>' + q.obj.map(o => `<div>• ${Q.objText(q, o)}</div>`).join('');
        h += `<div class="sep"></div><div class="rew">보상: ${Q.rewardText(q)}</div>`;
        if (Q.isActive(q.id)) h += `<button class="btn ${G.Nav.qid === q.id ? 'gold' : ''}" style="margin-top:8px" data-act="nav" data-arg="${q.id}">🧭 길 안내 ${G.Nav.qid === q.id ? '끄기' : '켜기'}</button>`;
        if (Q.isActive(q.id)) { const hid = !!p.d.quests[q.id].h; h += ` <button class="btn" style="margin-top:8px" data-act="qhide" data-arg="${q.id}">👁 ${hid ? '목록에 다시 보이기' : '목록에서 숨기기'}</button>`; }
      }
      return h + '</div></div>';
    },
  };

  // ---------------- 상점 ----------------
  G.Win.shop = {
    title: '상점', x: 380, y: 60, w: 440,
    onClose() { G.UI.shopNpc = null; G.UI.dirty(); },
    render() {
      const p = P(), npc = G.NPCS[G.UI.shopNpc];
      if (!npc) return '';
      let h = `<div class="dim" style="font-size:12px;margin-bottom:6px">인벤토리에서 아이템을 더블클릭하면 판매합니다.</div>`;
      for (const tid of npc.shop) {
        const t = G.ITEMS[tid], stack = t.cat !== 'equip';
        const sub = t.cat === 'equip' ? `Lv.${t.lv} · ${t.job === 'any' ? '공용' : G.JOBS[t.job].name}` : esc((t.desc || '').split('\n')[0]);
        h += `<div class="shop-row"><img src="${G.Icons.item(t)}" data-tip="tpl:${tid}"><div class="nm">${esc(t.name)}<div class="dim" style="font-size:11px">${sub}</div></div>
          <span class="pr">${fmt(t.price)} G</span>
          <button class="btn sm" data-act="buy" data-arg="${tid}:1" ${p.d.gold >= t.price ? '' : 'disabled'}>구매</button>
          ${stack ? `<button class="btn sm" data-act="buy" data-arg="${tid}:10" ${p.d.gold >= t.price * 10 ? '' : 'disabled'}>×10</button>` : '<span style="width:34px"></span>'}</div>`;
      }
      return h;
    },
  };

  // ---------------- 공명석 · 별자리 각인 (1.6.1) ----------------
  //  장비를 고르면 이 창이 열리고, 다시 새길 줄을 직접 고른다. 공명 게이지가 차면 등급이 오른다
  G.Win.cube = {
    title: '💠 공명석 · 별자리 각인', x: 470, y: 150, w: 360, it: null, last: null,
    render() {
      const it = this.it;
      if (!it) return '';
      const t = G.ITEMS[it.tid], g = G.GRADES[it.grade], need = G.Items.resNeed(it), res = it.res || 0;
      const n = G.Inv.count(P(), 'cube'), L = this.last;
      let h = `<div style="text-align:center;font-weight:800;color:${g.color}">${esc(G.Items.displayName(it))}</div>
        <div style="text-align:center;font-size:12px;color:${g.color}">별자리 각인 · ${g.name}</div>`;
      if (L && L.up) h += `<div style="text-align:center;color:#ffe06a;font-weight:800;margin:4px 0">★ 공명 완성! ${G.GRADES[L.from].name} → ${g.name} (모든 줄이 새로 새겨졌어요)</div>`;
      h += '<div class="sep"></div>';
      it.pot.forEach((o, i) => {
        const hot = L && !L.up && L.line === i;
        h += `<div class="reso-row ${hot ? 'hot' : ''}"><span style="color:${G.GRADES[o.g].color}">${G.statText(o.stat, o.val)}</span>
          <button class="btn sm" data-act="reso" data-arg="${i}" ${n > 0 ? '' : 'disabled'}>이 줄 다시 새기기</button></div>`;
        if (hot && L.before) h += `<div class="dim" style="font-size:11px;margin:-2px 0 4px 8px">이전: ${G.statText(L.before.stat, L.before.val)}</div>`;
      });
      h += '<div class="sep"></div>';
      if (need) h += `<div style="font-size:12px">공명 게이지 <b style="color:#c58bff">${res} / ${need}</b> <span class="dim">— 가득 차면 ${G.GRADES[it.grade + 1].name} 등급으로</span></div>
        <div class="bar" style="height:8px;margin-top:4px"><i style="width:${Math.min(100, res / need * 100)}%;background:linear-gradient(#e0b0ff,#8a4ad0)"></i></div>`;
      else h += '<div style="font-size:12px;color:#ffd54a">최고 등급입니다. 줄을 골라 다시 새길 수 있어요.</div>';
      h += `<div class="dim" style="font-size:11px;margin-top:6px">남은 공명석 ${n}개 · 한 번에 1개를 쓰고, 고른 줄만 바뀝니다.</div>`;
      return h;
    },
    act(i) {
      const p = P(), it = this.it;
      if (!it) return;
      if (G.Inv.count(p, 'cube') <= 0) { G.UI.log('공명석이 없습니다.', '#ff7a7a'); G.Audio.play('error'); return; }
      G.Inv.remove(p, 'cube', 1);
      const r = G.Items.resonate(it, +i), name = G.ITEMS[it.tid].name;
      this.last = r;
      if (r.up) { G.UI.banner('공명 완성!', `${name} → ${G.GRADES[it.grade].name}`); G.Audio.play('levelup'); }
      else G.Audio.play('cube');
      G.UI.log(r.up ? `${name}: 공명 게이지가 가득 차 ${G.GRADES[it.grade].name} 등급이 되었습니다!` : `${name}: ${i * 1 + 1}번째 각인을 다시 새겼습니다. (공명 ${it.res}/${G.Items.resNeed(it)})`, G.GRADES[it.grade].color);
      p.recalc(); G.UI.dirty();
      G.UI.renderWin('cube');
    },
  };

  // ---------------- 별빛 각인서 결과 (1.6.1) ----------------
  G.Win.scroll = {
    title: '✦ 별빛 각인서', x: 480, y: 180, w: 340, result: null,
    render() {
      const r = this.result;
      if (!r) return '';
      const it = r.it, t = G.ITEMS[it.tid], left = G.Items.slotsLeft(it), max = G.Items.maxSlots(t);
      let h = `<div style="text-align:center;font-size:12px" class="dim">${r.stage}칸째 각인 · 성공률 ${Math.round(r.rate * 100)}%</div>
        <div style="text-align:center;font-size:22px;font-weight:900;margin:6px 0;color:${r.ok ? '#7dff9a' : '#ff8a8a'}">${r.ok ? '각인 성공! +1' : '각인 실패...'}</div>
        <div style="text-align:center;font-weight:800">${esc(G.Items.displayName(it))}</div>
        <div style="text-align:center" class="dim">각인 칸 ${max - left} / ${max}${left > 0 ? ` · 다음 칸 성공률 ${Math.round(G.Items.engraveRate(it) * 100)}%` : ' · 모든 칸을 채웠어요'}</div>
        ${r.ok ? '' : '<div style="text-align:center;font-size:12px;color:#ffb0b0">칸은 그대로 남아 있어요. 다시 도전할 수 있어요.</div>'}`;
      if (r.fx) {
        h += `<div class="sep"></div><div style="color:#ffe08a;font-weight:800">✨ 특수 효과 부여!</div><div style="color:#ffe8a0">${G.Items.sfxText(r.fx)}</div>`;
        if (r.replaced) h += `<div class="dim" style="font-size:11px">기존 효과 교체됨: ${G.Items.sfxText(r.replaced)}</div>`;
      }
      return h;
    },
  };

  // ---------------- 대장장이 단련 결과 (1.6.1) ----------------
  G.Win.temper = {
    title: '🔨 장비 단련', x: 480, y: 180, w: 340, result: null,
    render() {
      const r = this.result;
      if (!r) return '<div class="dim">단련할 장비를 클릭하세요.</div>';
      const lines = arr => arr.length ? arr.map(o => `<div style="color:#ffd8a8">${G.statText(o.stat, o.val)} <span class="dim">(${o.stage}단계)</span></div>`).join('') : '<div class="dim">없음</div>';
      return `<div style="text-align:center;font-weight:800">${esc(G.Items.displayName(r.it))}</div>
        <div style="text-align:center" class="dim">비용 ${fmt(r.cost)} G</div>
        <div style="display:flex;gap:10px;margin-top:6px;font-size:12px">
          <div style="flex:1"><b class="dim">이전 단련 효과</b>${lines(r.before)}</div>
          <div style="flex:1"><b style="color:#ffb070">새 단련 효과</b>${lines(r.it.add)}</div></div>
        <div class="dim" style="font-size:11px;margin-top:8px">대장장이에게 다시 말을 걸면 또 단련할 수 있어요.</div>`;
    },
  };

})();

// ---------------- 타이틀 (세이브 슬롯 A/B/C) ----------------
G.Title = {
  saves: {}, mode: null, ask: null,
  BG: 'background:radial-gradient(ellipse at 50% 40%, #2a2a5a 0%, #07090f 70%)',
  async show() {
    this.saves = await G.Save.loadAll();
    this.mode = null; this.ask = null;
    G.Music.play('title');
    this.render();
  },
  used() { return G.Save.SLOTS.filter(s => this.saves[s]); },
  latest() {
    let best = null;
    for (const s of this.used()) if (!best || (this.saves[s].time || 0) > (this.saves[best].time || 0)) best = s;
    return best;
  },
  render() {
    if (this.mode === 'juke') { this.renderJuke(); return; }
    if (this.mode) { this.renderSlots(); return; }
    const any = this.used().length > 0, S = G.Settings;
    // 2.0: 새 제목 (주아 글씨체) + 이야기 배경 (src/ui/titlebg.js)
    G.UI.overlay(`<div class="overlay title-ov" style="${this.BG}"><canvas class="title-bg" width="1280" height="720"></canvas>
      <div class="ttl"><div class="t1">과금없이 즐기는</div><div class="t2">연희의 RPG 대모험!<span class="st">✦</span></div></div>
      ${any ? '<button class="btn gold" data-act="title" data-arg="continue">이어하기</button>' : ''}
      <button class="btn ${any ? '' : 'gold'}" data-act="title" data-arg="new">새로 시작</button>
      <button class="btn" data-act="title" data-arg="help">${G.Touch.active() ? '조작 안내' : '조작법 (F1)'}</button>
      <button class="btn" data-act="title" data-arg="juke">♪ 음악 감상</button>
      <button class="btn" data-act="title" data-arg="story">✦ 이야기 다시 보기</button>
      <button class="btn" data-act="title" data-arg="savefile">💾 세이브 옮기기</button>
      ${G.Mobile && G.Mobile.showBigBtn() ? '<button class="btn" data-act="title" data-arg="bigview">📱 크게 보는 방법</button>' : ''}
      <div style="margin-top:14px;display:flex;gap:8px">
        <button class="btn sm" data-act="title" data-arg="bgm">♪ 배경음악: ${S.bgm ? '켬' : '끔'}</button>
        <button class="btn sm" data-act="title" data-arg="sfx">효과음: ${S.sfx ? '켬' : '끔'}</button>
      </div>
      <div class="dim" style="margin-top:18px;font-size:12px">${window.electronAPI ? `저장 위치: 문서/RPG Adventure/${G.IS_DEV ? 'Save Data (DEV)' : 'Save Data'}` : '브라우저 저장소에 저장됩니다 (슬롯 3개)'}</div>
      <div class="ver">v${G.VERSION}${G.IS_DEV ? ' DEV' : ''}${G.IS_MOBILE ? ' 모바일' : ''} · © 2026 HC</div></div>`);
    G.TitleBG.start(document.querySelector('#overlay .title-bg'));
  },
  // 음악 감상: 28곡 + 장 전환 효과음 8개
  JUKE: [
    ['기본', ['title', 'tutorial']],
    ['마을', ['t_sprout', 't_wind', 't_elen', 't_rag', 't_sahrin', 't_frost', 't_aeros', 't_nox']],
    ['사냥터', ['f_sprout', 'f_wind', 'f_elen', 'f_rag', 'f_sahrin', 'f_frost', 'f_aeros', 'f_nox']],
    ['보스', ['b_shellock', 'b_bark', 'b_morwen', 'b_grounder', 'b_parakan', 'b_kaien', 'b_eldrick']],
    ['최종 보스 녹스', [['nox1', '1페이즈'], ['nox2', '2페이즈'], ['nox3', '3페이즈'], ['nox4', '광폭화']]],
    ['엔딩', ['end_seal', 'end_purify', 'end_hidden']],
  ],
  renderJuke() {
    const cur = G.Music.cur && G.Music.cur.id;
    const b = (id, label) => `<button class="btn sm ${cur === id ? 'gold' : ''}" data-act="title" data-arg="song:${id}">${cur === id ? '♪ ' : ''}${G.U.esc(label)}</button>`;
    let h = `<div class="overlay" style="${this.BG}"><h1 style="font-size:36px">음악 감상</h1><div class="juke">`;
    for (const [grp, ids] of this.JUKE) {
      h += `<div class="jg"><b>${grp}</b><div>${ids.map(x => Array.isArray(x) ? b(x[0], x[1]) : b(x, G.SONG_NAMES[x])).join('')}</div></div>`;
    }
    const fx = Object.keys(G.Chapter.SHARD).map(k => `<button class="btn sm" data-act="title" data-arg="fx:${k}">${G.Chapter.SHARD[k][0]}</button>`).join('');
    h += `<div class="jg"><b>장 전환 효과음</b><div>${fx}<button class="btn sm" data-act="title" data-arg="fx:fanfare">챕터 클리어 팡파르</button></div></div>`;
    h += `</div><div class="dim" style="font-size:12px;margin:8px 0">총 ${Object.keys(G.SONG_NAMES).length}곡 · 모든 곡은 끊김 없이 반복됩니다</div>
      <button class="btn" data-act="title" data-arg="back">뒤로</button></div>`;
    G.UI.overlay(h);
  },
  card(s, mode) {
    const info = G.Save.info(this.saves[s]), esc = G.U.esc;
    const pickable = mode === 'new' || !!info;
    let h = `<div class="slot-card ${info ? '' : 'empty'}"><div class="sl">슬롯 ${s}${info && info.cleared ? '<span class="clr">★ 엔딩 클리어</span>' : ''}${info && info.hidden ? '<span class="clr hid">★ 히든 엔딩 클리어</span>' : ''}</div>`;
    if (info) {
      h += `<div class="nm">${esc(info.name)}</div><div class="jb">Lv.${info.level} ${esc(info.job)}</div>
        <div class="ln">📍 ${esc(info.where)}</div><div class="ln">📖 ${esc(info.chapter)}</div>
        <div class="ln dim">🕒 ${esc(info.time)}</div>`;
    } else h += '<div class="nm dim" style="margin:34px 0">비어 있음</div>';
    h += `<div class="bt"><button class="btn ${pickable ? 'gold' : ''}" data-act="title" data-arg="pick:${s}" ${pickable ? '' : 'disabled'}>${mode === 'new' ? (info ? '덮어쓰고 시작' : '여기서 시작') : '불러오기'}</button>`;
    if (info) h += `<button class="btn sm del" data-act="title" data-arg="del:${s}">삭제</button>`;
    return h + '</div></div>';
  },
  renderSlots() {
    const m = this.mode, a = this.ask;
    let h = `<div class="overlay" style="${this.BG}">
      <h1 style="font-size:40px">${m === 'new' ? '새로 시작' : '이어하기'}</h1><h2>${m === 'new' ? '새 모험을 저장할 슬롯을 고르세요' : '불러올 슬롯을 고르세요'}</h2>
      <div class="slot-row">${G.Save.SLOTS.map(s => this.card(s, m)).join('')}</div>
      <button class="btn" data-act="title" data-arg="back">뒤로</button>`;
    if (a) {
      h += `<div class="ask-bg"><div class="ask"><div>${a.msg}</div>
        <button class="btn ${a.danger ? 'red' : 'gold'}" data-act="title" data-arg="yes">${a.yes}</button>
        <button class="btn" data-act="title" data-arg="no">취소</button></div></div>`;
    }
    G.UI.overlay(h + '</div>');
  },
  async act(a) {
    const S = G.Settings;
    if (a === 'continue') { this.mode = 'continue'; this.render(); }
    if (a === 'new') { this.mode = 'new'; this.render(); }
    if (a === 'back') { if (this.mode === 'juke') G.Music.play('title'); this.mode = null; this.ask = null; this.render(); }
    if (a === 'juke') { this.mode = 'juke'; this.render(); }
    if (a === 'story') {   // 1.7.7: 배경 설명 다시 보기 · 2.0: 히든 엔딩을 본 슬롯이 있으면 히든 엔딩 영상도 고를 수 있다 (두 영상 모두 주인공 = 연희)
      const hid = this.used().some(s => { const d = this.saves[s].d || this.saves[s]; return d && d.flags && d.flags.hiddenClear; });
      if (!hid) { G.Cutscene.play('intro', () => { G.Music.play('title'); this.render(); }); return; }
      G.UI.overlay(`<div class="overlay title-ov" style="${this.BG}"><canvas class="title-bg" width="1280" height="720"></canvas>
        <div class="ttl"><div class="t3">이야기 다시 보기</div></div>
        <button class="btn gold" data-act="title" data-arg="story:intro">배경 설명</button>
        <button class="btn" data-act="title" data-arg="story:hidden">✦ 히든 엔딩 · 함께 빛나는 별</button>
        <button class="btn" data-act="title" data-arg="back">뒤로</button></div>`);
      G.TitleBG.start(document.querySelector('#overlay .title-bg'));
    }
    if (a === 'story:intro' || a === 'story:hidden') G.Cutscene.play(a.slice(6), () => { G.Music.play('title'); this.render(); });
    if (a.startsWith('song:')) { G.Music.play(a.slice(5), 0.6); this.render(); }
    if (a.startsWith('fx:')) { const k = a.slice(3); if (k === 'fanfare') G.Music.fanfare(); else G.Music.resonance(k); }
    if (a === 'bgm') { S.bgm = !S.bgm; S.save(); G.Audio.applyVolume(); this.render(); }
    if (a === 'sfx') { S.sfx = !S.sfx; S.save(); G.Audio.applyVolume(); this.render(); }
    if (a === 'help') G.UI.showHelp();
    if (a === 'savefile') G.Mobile.saveFile();   // 모바일 1차: 세이브 내보내기 · 가져오기
    if (a === 'bigview') G.Mobile.bigGuide();    // 모바일 2차-1: 아이폰 크게 보는 방법
    if (a === 'closehelp') {
      if (G.Game.player) { G.UI.overlay(''); if (G.Game.world && /^end_/.test(G.Music.want || '')) G.Music.playMap(G.Game.world.mapId, 2); }
      else this.render();
    }
    if (a.startsWith('pick:')) {
      const s = a.slice(5), info = G.Save.info(this.saves[s]);
      if (this.mode === 'continue' && this.saves[s]) this.startSlot(s);
      else if (this.mode === 'new') {
        if (info) { this.ask = { msg: `슬롯 ${s}의 <b>${G.U.esc(info.name)}</b> (Lv.${info.level} ${G.U.esc(info.job)}) 데이터를 지우고 새로 시작할까요?`, yes: '덮어쓰기', act: 'new:' + s, danger: true }; this.render(); }
        else G.Creator.open(s);
      }
    }
    if (a.startsWith('del:')) {
      const s = a.slice(4), info = G.Save.info(this.saves[s]);
      if (info) { this.ask = { msg: `슬롯 ${s}의 <b>${G.U.esc(info.name)}</b> (Lv.${info.level} ${G.U.esc(info.job)}) 데이터를 삭제할까요?<br><span class="dim">삭제하면 되돌릴 수 없습니다.</span>`, yes: '삭제', act: 'delete:' + s, danger: true }; this.render(); }
    }
    if (a === 'no') { this.ask = null; this.render(); }
    if (a === 'yes' && this.ask) {
      const [k, s] = this.ask.act.split(':');
      this.ask = null;
      if (k === 'new') G.Creator.open(s);
      if (k === 'delete') {
        await G.Save.remove(s);
        this.saves = await G.Save.loadAll();
        if (this.mode === 'continue' && !this.used().length) this.mode = null;
        this.render();
      }
    }
  },
  startSlot(s) {
    G.Save.slot = s;
    G.UI.overlay('');
    G.Game.begin(this.saves[s].d);
  },
};
