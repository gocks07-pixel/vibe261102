'use strict';
// ============================================================
// EXE 빌드: 🐞 버그 신고 (F9 · 메뉴)
//  EXE: 문서/RPG Adventure/버그신고/날짜_시간/ 폴더에 아래 파일을 만들고 폴더를 연다
//    신고내용.txt (플레이어가 적은 글) · 게임정보.txt · 오류기록.txt · 화면.png · save_X.json
//  브라우저: 게임정보 + 오류기록을 화면에 보여 주고 복사 버튼
//  인터넷으로 보내지 않는다. PC 사용자 이름 같은 개인정보는 넣지 않는다.
// ============================================================
G.Bug = {
  el: null, shot: null, busy: false,

  isOpen() { return !!this.el; },

  async open() {
    if (this.el || this.busy) return;
    this.busy = true;
    // 신고 창을 띄우기 전의 화면을 먼저 찍어 둔다
    this.shot = null;
    try {
      const api = window.electronAPI;
      if (api && api.bugCapture) await api.bugCapture();
      else this.shot = document.getElementById('canvas').toDataURL('image/png');
    } catch (e) { G.ErrLog.add(e); }
    this.busy = false;
    const exe = !!(window.electronAPI && window.electronAPI.bugWrite);
    const div = document.createElement('div');
    div.className = 'bug-ov';
    div.innerHTML = `<div class="bug-box">
      <h3>🐞 버그 신고</h3>
      <div class="dim" style="font-size:12px;margin-bottom:6px">무슨 일이 있었나요? (안 적어도 괜찮아요)</div>
      <textarea class="bug-note" maxlength="2000" placeholder="예) 녹스와 싸우다가 화면이 멈췄어요"></textarea>
      <div class="bug-out"></div>
      <div class="bug-bt">
        <button class="btn gold" data-bug="make">${exe ? '신고 파일 만들기' : '신고 내용 만들기'}</button>
        <button class="btn" data-bug="close">취소</button>
      </div></div>`;
    document.getElementById('game').appendChild(div);
    this.el = div;
    div.addEventListener('click', e => {
      const b = e.target.closest('[data-bug]');
      if (!b) return;
      if (b.dataset.bug === 'close') this.close();
      if (b.dataset.bug === 'make') this.make();
      if (b.dataset.bug === 'copy') this.copy();
    });
    // Esc 로 닫기 (게임 쪽 Esc = 메뉴 열기로 넘어가지 않게 먼저 가로챈다)
    this.onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); this.close(); } };
    window.addEventListener('keydown', this.onKey, true);
    setTimeout(() => { const t = div.querySelector('textarea'); if (t) t.focus(); }, 0);
  },

  close() {
    if (!this.el) return;
    this.el.remove(); this.el = null; this.shot = null;
    window.removeEventListener('keydown', this.onKey, true);
    G.Input.down = {};
  },

  // 게임정보.txt
  info() {
    const p = G.Game.player, w = G.Game.world, L = [];
    L.push(`게임: 과금없이 즐기는 연희의 RPG 대모험`);
    L.push(`버전: v${G.VERSION}${G.IS_DEV ? ' DEV (테스트용)' : ''}${G.IS_MOBILE ? ' 모바일' : ''}`);
    L.push(`실행: ${window.electronAPI ? 'EXE' : G.IS_MOBILE ? `휴대폰 브라우저 (${G.Mobile ? G.Mobile.deviceText() : ''})` : '브라우저'}`);
    L.push(`신고 시각: ${G.ErrLog.stamp(Date.now())}`);
    if (!p) { L.push('화면: 타이틀 (캐릭터를 고르기 전)'); return L.join('\n'); }
    const d = p.d, job = G.JOBS[d.job], m = w && G.MAPS[w.mapId];
    L.push(`세이브 슬롯: ${G.Save.slot}`);
    L.push(`캐릭터: ${d.name} · Lv.${d.level} · ${job ? job.name : d.job} (${d.job})${d.dev ? ' · 테스트 모드 캐릭터' : ''}`);
    L.push(`현재 맵: ${m ? m.name : '?'} (${w ? w.mapId : '?'}) · 위치 x=${Math.round(p.x)} y=${Math.round(p.y)}`);
    L.push(`HP ${Math.round(p.hp)}/${p.st.maxHP} · MP ${Math.round(p.mp)}/${p.st.maxMP} · 골드 ${d.gold}`);
    try { L.push(`장: ${G.Chapter.label(G.Chapter.current(d))}`); } catch (e) { /* 없음 */ }
    const q = Object.entries(d.quests || {}).filter(([, s]) => s && s.s !== 'done');
    L.push(`진행 중인 퀘스트: ${q.length ? q.map(([id, s]) => `${(G.QUESTS[id] && G.QUESTS[id].name) || id} (${id}, ${s.s})`).join(', ') : '없음'}`);
    L.push(`완료한 퀘스트 수: ${Object.values(d.quests || {}).filter(s => s && s.s === 'done').length}`);
    if (w) {
      const boss = w.monsters.find(x => x.isBoss && !x.dead);
      if (boss) L.push(`보스: ${boss.d.name} (${boss.id}) HP ${Math.round(boss.hp)}/${boss.maxHp}${boss.boss && boss.boss.cur ? ` · 사용 중인 패턴 ${boss.boss.cur.id}` : ''}`);
    }
    const ap = G.AutoPot.of(d);
    L.push(`자동 물약: HP ${ap.hp ? ap.hpAt + '%' : '끔'} · MP ${ap.mp ? ap.mpAt + '%' : '끔'}`);
    L.push(`화면 크기: ${window.innerWidth}×${window.innerHeight}`);
    return L.join('\n');
  },

  async make() {
    const box = this.el;
    if (!box || this.busy) return;
    this.busy = true;
    const note = box.querySelector('textarea').value.trim();
    const info = this.info(), errors = G.ErrLog.text();
    let save = null;
    const p = G.Game.player;
    try {
      if (p) { await G.Game.save(true); save = await G.Save.read(G.Save.slot); }
    } catch (e) { G.ErrLog.add(e); }
    const api = window.electronAPI, out = box.querySelector('.bug-out');
    if (api && api.bugWrite) {
      try {
        const r = await api.bugWrite({ note, info, errors, slot: G.Save.slot, save });
        out.innerHTML = `<div class="bug-ok">신고 파일을 만들었어요!<br>열린 폴더 안의 파일들을 보내 주세요. 게임은 계속하셔도 돼요.<br><span class="dim">${G.U.esc(r && r.where || '')}</span></div>`;
      } catch (e) {
        G.ErrLog.add(e);
        out.innerHTML = `<div class="bug-ok" style="color:#ff9a9a">파일을 만들지 못했어요. 아래 내용을 복사해서 보내 주세요.</div>`;
        this.showText(out, note, info, errors);
      }
    } else this.showText(out, note, info, errors);
    box.querySelector('[data-bug="make"]').remove();
    box.querySelector('[data-bug="close"]').textContent = '닫기';
    box.querySelector('textarea').disabled = true;
    this.busy = false;
  },
  showText(out, note, info, errors) {
    const text = `[신고 내용]\n${note || '(적지 않음)'}\n\n[게임 정보]\n${info}\n\n[오류 기록]\n${errors}`;
    out.insertAdjacentHTML('beforeend', `<textarea class="bug-text" readonly>${G.U.esc(text)}</textarea>
      <button class="btn sm" data-bug="copy">📋 복사하기</button>`);
  },
  async copy() {
    const t = this.el && this.el.querySelector('.bug-text');
    if (!t) return;
    try { await navigator.clipboard.writeText(t.value); }
    catch (e) { t.select(); try { document.execCommand('copy'); } catch (e2) { /* 무시 */ } }
    G.UI.log('신고 내용을 복사했습니다.', '#7dff9a');
  },
};
