'use strict';
// 스킬 창 / 메뉴 / 키 설정 창
(function () {
  const P = () => G.Game.player;

  // ---------------- 스킬 (초보자 → 1차 → 2차 → 3차 → 4차 탭) ----------------
  G.Win.skill = {
    title: '스킬', x: 300, y: 40, w: 470, tab: null,
    render() {
      const p = P(), d = p.d, chain = G.jobChain(d.job);
      if (!this.tab || !chain.includes(this.tab)) this.tab = chain[chain.length - 1];
      const tabName = j => j === 'beginner' ? '표류자' : `${G.tierName(G.JOBS[j].tier)} ${G.JOBS[j].name}`;
      let h = '<div class="tabs" style="flex-wrap:wrap">' + chain.map(j => `<span class="t ${this.tab === j ? 'on' : ''}" data-act="tab" data-arg="skill:${j}">${tabName(j)}</span>`).join('') + '</div>';
      h += `<div class="ap-box">남은 기술 포인트<b>${d.sp}</b><span class="dim" style="margin-left:auto;font-size:11px">레벨업 기술 포인트: Lv.10~ 3 · 30~ 5 · 60~ 6</span></div>`;
      for (const sk of G.skillsOfJob(this.tab)) {
        const lv = d.skills[sk.id] || 0;
        const canUp = !sk.fixed && d.sp > 0 && lv < sk.maxLv;
        h += `<div class="sk"><img src="${G.Icons.skill(sk)}" data-tip="skill:${sk.id}" style="${lv ? '' : 'filter:grayscale(1) brightness(.6)'}">
          <div class="info"><b>${sk.name}</b> <span class="dim">Lv.${lv}/${sk.maxLv}</span><div class="d">${sk.desc(Math.max(1, lv))}</div></div>`;
        if (sk.type === 'toggle') {
          h += `<div class="keys" style="width:120px"><span class="dim" style="font-size:11px;width:100%">2단 점프 모드</span>
            <button class="btn sm ${d.djump === 'fwd' ? 'on' : ''}" data-act="djump" data-arg="fwd">앞으로</button>
            <button class="btn sm ${d.djump === 'up' ? 'on' : ''}" data-act="djump" data-arg="up">위로</button></div>`;
        } else if (sk.type !== 'passive' && lv > 0) {
          h += '<div class="keys">' + [0, 1, 2, 3, 4, 5].map(i => `<button class="btn sm ${d.hot[i] === sk.id ? 'on' : ''}" data-act="hot" data-arg="${sk.id}:${i}">${G.Keys.label('skill' + (i + 1))}</button>`).join('') + '</div>';
        }
        if (!sk.fixed) h += `<button class="btn" data-act="sp" data-arg="${sk.id}" ${canUp ? '' : 'disabled'}>+</button>`;
        h += '</div>';
      }
      const J = G.JOBS[d.job];
      h += '<div class="sep"></div><div style="font-size:12px">';
      if (d.job === 'beginner') h += '<span class="dim">Lv.10에 바람결 마을 모험가 길드에서 각성 Ⅰ을 할 수 있습니다.</span>';
      else if (J.tier < 4) {
        const next = { 1: [30, '엘렌하임의 세렌'], 2: [60, '프로스트벨의 아르텔'], 3: [85, '아에로스의 오리엘'] }[J.tier];
        const opts = Object.keys(G.JOBS).filter(k => G.JOBS[k].prev === d.job).map(k => G.JOBS[k].name).join(' / ');
        h += `<b>다음 각성</b> <span class="dim">Lv.${next[0]} · ${next[1]}</span><div class="dim">→ ${opts}</div>`;
      } else h += '<b style="color:#ffe08a">최종 각성을 마쳤습니다.</b>';
      return h + '</div>';
    },
  };

  // ---------------- 메뉴 ----------------
  G.Win.menu = {
    title: '메뉴', x: 545, y: 160, w: 200,
    render() {
      return `<div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn" data-act="menu" data-arg="save">저장하기 (슬롯 ${G.Save.slot})</button>
        <button class="btn" data-act="menu" data-arg="saveas">다른 슬롯에 저장</button>
        <button class="btn" data-act="menu" data-arg="help">조작법 (F1)</button>
        <button class="btn" data-act="menu" data-arg="keys">키 설정</button>
        <button class="btn" data-act="menu" data-arg="sound">음향 설정</button>
        <button class="btn" data-act="menu" data-arg="autopot">자동 물약 설정</button>
        <button class="btn" data-act="menu" data-arg="fx">스킬 이펙트: ${G.Settings.fx === 'high' ? '화려' : '보통'}</button>
        <button class="btn" data-act="menu" data-arg="minimap">미니맵: ${G.Settings.minimap ? '켬' : '끔'}</button>
        <button class="btn" data-act="menu" data-arg="dtap">방향키 두 번 대쉬: ${G.Settings.dtapDash ? '켬' : '끔'}</button>
        ${G.Game.player && G.Game.player.d.ending ? '<button class="btn" data-act="menu" data-arg="replay">✦ 엔딩 다시 보기</button>' : ''}
        <button class="btn" data-act="bug" data-arg="menu">🐞 버그 신고 (F9)</button>
        <button class="btn" data-act="menu" data-arg="title">저장 후 타이틀로</button></div>
        <div class="dim" style="font-size:11px;margin-top:8px">맵 이동, 퀘스트 완료 시 슬롯 ${G.Save.slot}에 자동 저장됩니다.</div>`;
    },
    act(a) {
      if (a === 'replay') { const p = G.Game.player; G.UI.closeWin('menu'); G.Cutscene.play(p.d.ending, () => G.Music.playMap(G.Game.world.mapId, 2)); return; }   // 1.7.7
      const S = G.Settings;
      if (a === 'save') G.Game.save(false);
      if (a === 'help') { G.UI.closeWin('menu'); G.UI.showHelp(); }
      if (a === 'keys') { G.UI.closeWin('menu'); G.UI.openWin('keys'); }
      if (a === 'sound') { G.UI.closeWin('menu'); G.UI.openWin('sound'); return; }
      if (a === 'autopot') { G.UI.closeWin('menu'); G.UI.openWin('autopot'); return; }
      if (a === 'saveas') { G.UI.closeWin('menu'); G.UI.openWin('saveas'); return; }
      if (a === 'fx') { S.fx = S.fx === 'high' ? 'normal' : 'high'; S.save(); }
      if (a === 'minimap') { S.minimap = !S.minimap; S.save(); }
      if (a === 'dtap') { S.dtapDash = !S.dtapDash; S.save(); }
      if (a === 'title') { if (!G.Game.player) location.reload(); else G.Game.save(true).then(() => location.reload()); return; }
      if (G.UI.isOpen('menu')) G.UI.renderWin('menu');
    },
  };

  // ---------------- 음향 설정 ----------------
  G.Win.sound = {
    title: '음향 설정', x: 470, y: 150, w: 340,
    render() {
      const S = G.Settings;
      const row = (k, vk, name) => `<div class="snd-row">
        <b>${name}</b><button class="btn sm ${S[k] ? 'on' : ''}" data-act="snd" data-arg="${k}">${S[k] ? '켬' : '끔'}</button>
        <input type="range" min="0" max="100" step="5" value="${S[vk]}" data-snd="${vk}" ${S[k] ? '' : 'disabled'}>
        <span class="v" id="snd-${vk}">${S[vk]}%</span></div>`;
      const cur = G.Music.cur ? (G.SONG_NAMES[G.Music.cur.id] || G.SONG_NAMES.nox1) : '';
      return row('bgm', 'bgmVol', '배경음악') + row('sfx', 'sfxVol', '효과음') +
        `<div class="dim" style="font-size:11px;margin-top:8px">${cur ? `지금 흐르는 곡: ♪ ${G.U.esc(cur)}<br>` : ''}설정은 저장되어 다음 실행에도 유지됩니다.</div>`;
    },
    act(a) {
      const S = G.Settings;
      if (a === 'bgm' || a === 'sfx') { S[a] = !S[a]; S.save(); G.Audio.applyVolume(); if (a === 'sfx' && S.sfx) G.Audio.play('pickup'); }
      G.UI.renderWin('sound');
    },
    // 슬라이더 (드래그 중에도 바로 반영)
    input(k, v) {
      const S = G.Settings;
      S[k] = Math.max(0, Math.min(100, Math.round(+v)));
      const el = document.getElementById('snd-' + k);
      if (el) el.textContent = S[k] + '%';
      G.Audio.applyVolume();
    },
    change(k) { G.Settings.save(); if (k === 'sfxVol') G.Audio.play('pickup'); },
  };

  // ---------------- 다른 슬롯에 저장 ----------------
  G.Win.saveas = {
    title: '다른 슬롯에 저장', x: 440, y: 140, w: 400, saves: null, ask: null,
    async onOpen() { this.ask = null; this.saves = null; this.saves = await G.Save.loadAll(); G.UI.renderWin('saveas'); },
    render() {
      if (!this.saves) return '<div class="dim">불러오는 중...</div>';
      const esc = G.U.esc;
      let h = `<div class="dim" style="font-size:12px;margin-bottom:6px">지금 캐릭터를 다른 슬롯에 복사해 저장합니다. 이후 자동 저장은 계속 <b>슬롯 ${G.Save.slot}</b>에 됩니다.</div>`;
      for (const s of G.Save.SLOTS) {
        const info = G.Save.info(this.saves[s]), me = s === G.Save.slot;
        h += `<div class="sa-row ${me ? 'me' : ''}"><b>슬롯 ${s}</b><div class="sa-i">${info ? `${esc(info.name)} · Lv.${info.level} ${esc(info.job)}<br><span class="dim">${esc(info.chapter)} · ${esc(info.time)}</span>` : '<span class="dim">비어 있음</span>'}</div>
          ${me ? '<span class="dim" style="font-size:11px">플레이 중</span>' : `<button class="btn sm" data-act="saveas" data-arg="${s}">저장</button>`}</div>`;
      }
      if (this.ask) {
        const info = G.Save.info(this.saves[this.ask]);
        h += `<div class="sa-ask">슬롯 ${this.ask}의 <b>${esc(info.name)}</b> (Lv.${info.level}) 데이터를 덮어쓸까요?<br>
          <button class="btn sm red" data-act="saveas" data-arg="yes">덮어쓰기</button> <button class="btn sm" data-act="saveas" data-arg="no">취소</button></div>`;
      }
      return h;
    },
    async act(a) {
      if (a === 'no') { this.ask = null; G.UI.renderWin('saveas'); return; }
      let s = a;
      if (a === 'yes') { s = this.ask; this.ask = null; }
      else if (this.saves && this.saves[s]) { this.ask = s; G.UI.renderWin('saveas'); return; }
      if (!s || s === G.Save.slot) return;
      const p = G.Game.player;
      p.d.hp = Math.max(1, Math.round(p.hp)); p.d.mp = Math.round(p.mp);
      const ok = await G.Save.store(p, s);
      G.UI.log(ok ? `슬롯 ${s}에 저장했습니다. (플레이는 계속 슬롯 ${G.Save.slot}에 저장됩니다)` : '저장에 실패했습니다.', ok ? '#7dff9a' : '#ff7a7a');
      this.saves = await G.Save.loadAll();
      if (G.UI.isOpen('saveas')) G.UI.renderWin('saveas');
    },
  };

  // ---------------- 키 설정 ----------------
  G.Win.keys = {
    title: '키 설정', x: 430, y: 40, w: 420,
    onClose() { G.Keys.waiting = null; },
    render() {
      const K = G.Keys;
      let h = '<div class="dim" style="font-size:12px;margin-bottom:6px">[변경]을 누른 뒤 원하는 키를 누르세요. 이미 쓰는 키면 서로 바뀝니다. (Esc: 취소)<br>방향키 · F1 · Esc · Enter 는 고정입니다. 스킬은 스킬창(K)에서 칸에 등록하세요.</div>';
      for (const [id, name, , fixed] of K.ACTIONS) {
        const wait = K.waiting === id;
        h += `<div class="keyrow"><span class="nm">${name}</span><kbd class="${wait ? 'wait' : ''}">${wait ? '입력 대기' : K.label(id)}</kbd>
          ${fixed ? `<span class="dim" style="width:70px;font-size:10px">+ ${[...new Set(fixed.map(c => K.codeLabel(c)))].join('/')}</span>` : '<span style="width:70px"></span>'}
          <button class="btn sm" data-act="keyset" data-arg="${id}">변경</button></div>`;
      }
      h += '<div style="margin-top:8px;text-align:right"><button class="btn" data-act="keyreset">기본값으로 되돌리기</button></div>';
      return h;
    },
  };
})();
