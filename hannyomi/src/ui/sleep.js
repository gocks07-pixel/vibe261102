'use strict';
// 빌드 15 (휴대폰 전용): 자동 사냥 중 화면 켜 두기 · 절전 화면 · 절전 중에 얻은 것 요약 (시안 docs/drafts/design/sleep/sleep_mock.png)
//  - 자동 사냥이 켜져 있으면 브라우저 화면 켜짐 유지(Wake Lock)를 요청, 끄면 풀어 줌. 다른 앱에서 돌아오면 다시 요청
//  - 메뉴 [🌙 절전 화면: 끔 / 3분 / 10분] (이 기기에만 저장 'hny_sleep', 처음 3분) · [🌙 지금 절전 화면으로]
//  - 자동 사냥 중 정한 시간 동안 손대지 않으면 검은 절전 화면: 게임은 계속 돌고 그리기만 쉼 · 밀어서 풀기
//  - 자동 사냥이 멈추면(쓰러짐 · 물약 없음 등) 절전 화면이 풀리고 요약 창에 멈춘 까닭을 보여 줌
//  play.js · mobile.js 다음에 불러옴. PC · EXE 에는 없는 파일 (G.Touch.active() 일 때만 동작, 세이브 형식 그대로)
G.Sleep = (function () {
  const S = { on: false, mins: 3, lock: null, idle: 0, lastT: 0, st: null, el: null, sec: 0, stopMsg: '' };
  try { const v = localStorage.getItem('hny_sleep'); if (v != null && [0, 3, 10].includes(+v)) S.mins = +v; } catch (e) { /* 저장소 없음 */ }
  const active = () => !!(G.Touch && G.Touch.active() && G.Play);
  const autoOn = () => !!(G.Play && G.Play.autoOn);
  const fmt = n => G.U.fmt(Math.round(n));
  const potKinds = p => { let hp = 0, mp = 0; for (const s of p.d.inv.use) { if (!s) continue; const u = G.ITEMS[s.tid].use || {}; if (u.hp || u.hpP) hp += s.qty || 1; if (u.mp || u.mpP) mp += s.qty || 1; } return { hp, mp }; };
  const free = (p, tab) => p.d.inv[tab].filter(x => !x).length;

  // ---------- 화면 켜짐 유지 ----------
  async function wantLock(want) {
    if (want && !S.lock && document.visibilityState === 'visible' && navigator.wakeLock && !S.asking) {
      S.asking = true;
      try { S.lock = await navigator.wakeLock.request('screen'); S.lock.addEventListener('release', () => { S.lock = null; }); } catch (e) { /* 지원 안 함 · 거부 */ }
      S.asking = false;
      if (S.lock && !autoOn()) { const l = S.lock; S.lock = null; l.release().catch(() => {}); }
    } else if (!want && S.lock) { const l = S.lock; S.lock = null; l.release().catch(() => {}); }
  }

  // ---------- 손대면 대기 시간 다시 ----------
  const poke = () => { S.idle = 0; };
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev => document.addEventListener(ev, poke, { capture: true, passive: true }));

  // ---------- 절전 중 기록 ----------
  function startStats() {
    const p = G.Game.player;
    S.st = { lv: p.d.level, exp: p.d.exp, gold: p.d.gold, kills: 0, items: {}, nItems: 0, hp: 0, mp: 0, t: 0 };
    S.stopMsg = '';
  }
  function addItem(it, qty) {
    const t = G.ITEMS[it.tid], g = it.grade || 0, k = it.tid + '|' + g;
    const o = S.st.items[k] || (S.st.items[k] = { name: t.name, g, qty: 0, eq: t.cat === 'equip' });
    o.qty += qty; S.st.nItems += qty;
  }
  function hookOnce() {
    if (hookOnce.done) return; hookOnce.done = true;
    const W = G.World.prototype, pk = W.pickup, ok = W.onKill;
    W.pickup = function (dr) {
      if (!S.on || !S.st) return pk.apply(this, arguments);
      const pl = dr.payload, wasDead = dr.dead, it = pl && pl.gold == null && pl.item, q = it ? (it.qty || 1) : 0;
      const r = pk.apply(this, arguments);
      if (!wasDead && dr.dead && it) addItem(it, q);   // 골드는 시작 때와의 차이로
      return r;
    };
    W.onKill = function () { if (S.on && S.st) S.st.kills++; return ok.apply(this, arguments); };
    const P = G.Player.prototype, ui = P.useItem;
    P.useItem = function (idx) {
      const s = this.d.inv.use[idx], tid = s && s.tid, q0 = s ? s.qty : 0;
      const r = ui.apply(this, arguments);
      if (S.on && S.st && tid) { const s2 = this.d.inv.use[idx], used = q0 - (s2 && s2.tid === tid ? s2.qty : 0); if (used > 0) { const u = G.ITEMS[tid].use || {}; if (u.hp || u.hpP) S.st.hp += used; if (u.mp || u.mpP) S.st.mp += used; } }
      return r;
    };
    const stop = G.Play.stop;
    G.Play.stop = function (msg) { if (S.on && msg) S.stopMsg = msg; return stop.apply(this, arguments); };
    // 절전 중에는 그리기만 쉼 (게임 계산은 그대로)
    const dr = W.draw;
    W.draw = function () { if (S.on) return; return dr.apply(this, arguments); };
  }
  // 경험치: 시작 때와 지금의 차이 (레벨이 오르면 "Lv.47 → 48")
  function expGain() {
    const p = G.Game.player, st = S.st, F = G.F;
    let pct = 0; const M = F.MAX_LEVEL;
    if (st.lv >= M) return 0;   // 최고 레벨
    if (p.d.level === st.lv) pct = (p.d.exp - st.exp) / F.expToNext(st.lv) * 100;
    else { pct = (F.expToNext(st.lv) - st.exp) / F.expToNext(st.lv) * 100 + (p.d.level - st.lv - 1) * 100 + (p.d.level >= M ? 0 : p.d.exp / F.expToNext(p.d.level) * 100); }
    return Math.max(0, pct);
  }
  const hms = s => { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
  const hmsKo = s => { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return (h ? h + '시간 ' : '') + (h || m ? m + '분 ' : '') + x + '초'; };

  // ---------- 절전 화면 ----------
  function enter() {
    if (S.on || !active() || !G.Game.player || !autoOn()) return false;
    hookOnce(); startStats(); S.on = true; S.sec = 0;
    const el = S.el = document.createElement('div'); el.id = 'slp';
    el.innerHTML = `<div class="moon">🌙 절전 화면</div><div class="clk">0:00</div><div class="sub"><span class="live"></span><span class="where"></span></div>
      <div class="lv"></div><div class="bar"><i></i></div>
      <div class="grid"><div><b class="k">0</b><span>잡은 수</span></div><div><b class="e">+0%</b><span>경험치</span></div><div><b class="g">+0</b><span>골드</span></div><div><b class="n">0</b><span>아이템</span></div></div>
      <div class="pot"></div><div class="warn"></div>
      <div class="slide"><div class="knob">➜</div><div class="t">밀어서 풀기</div></div>`;
    document.body.appendChild(el);
    ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend', 'click', 'contextmenu'].forEach(ev => el.addEventListener(ev, e => { e.stopPropagation(); if (ev === 'contextmenu' || ev === 'touchmove') e.preventDefault(); }, { passive: false }));
    slider(el.querySelector('.slide'), el.querySelector('.knob'));
    paint(); G.Game.save(true);
    return true;
  }
  function slider(track, knob) {
    let x0 = null, dx = 0;
    const max = () => track.clientWidth - knob.offsetWidth - 4;
    knob.addEventListener('pointerdown', e => { x0 = e.clientX; dx = 0; knob.setPointerCapture(e.pointerId); knob.style.transition = 'none'; });
    knob.addEventListener('pointermove', e => { if (x0 == null) return; dx = Math.max(0, Math.min(max(), e.clientX - x0)); knob.style.transform = `translateX(${dx}px)`; });
    const up = () => { if (x0 == null) return; x0 = null; if (dx >= max() * 0.85) { leave(); return; } knob.style.transition = 'transform .2s'; knob.style.transform = 'translateX(0)'; };
    knob.addEventListener('pointerup', up); knob.addEventListener('pointercancel', up);
  }
  function paint() {
    const el = S.el, p = G.Game.player, w = G.Game.world; if (!el || !p) return;
    const q = c => el.querySelector(c), st = S.st, cur = p.d.level >= G.F.MAX_LEVEL ? 100 : p.d.exp / G.F.expToNext(p.d.level) * 100;
    q('.clk').textContent = hms(S.sec);
    q('.where').textContent = (autoOn() ? '자동 사냥 중 · ' : '') + (w && w.map ? w.map.name : '');
    q('.lv').textContent = `Lv.${p.d.level} ${G.JOBS[p.d.job].name} · 경험치 ${cur.toFixed(1)}%`;
    q('.bar i').style.width = cur.toFixed(1) + '%';
    q('.k').textContent = fmt(st.kills); q('.e').textContent = st.lv >= G.F.MAX_LEVEL ? '최고' : '+' + expGain().toFixed(1) + '%';
    q('.g').textContent = '+' + fmt(Math.max(0, p.d.gold - st.gold)); q('.n').textContent = fmt(st.nItems);
    const pk = potKinds(p), fe = free(p, 'equip');
    q('.pot').textContent = `HP 물약 ${fmt(pk.hp)} · MP 물약 ${fmt(pk.mp)} · 장비 칸 빈칸 ${fe}`;
    const warn = [];
    if (pk.hp < 100) warn.push(`HP 물약이 ${pk.hp ? '100개보다 적어요' : '없어요'}`);
    if (pk.mp < 100) warn.push(`MP 물약이 ${pk.mp ? '100개보다 적어요' : '없어요'}`);
    if (!fe) warn.push('장비 칸이 가득 찼어요');
    q('.warn').textContent = warn.length ? '⚠ ' + warn.join(' · ') : '';
  }
  function leave() {
    if (!S.on) return;
    S.on = false; S.idle = 0;
    if (S.el) { S.el.remove(); S.el = null; }
    summary();
    G.UI.dirty();
  }
  function summary() {
    const p = G.Game.player, st = S.st; if (!p || !st) return;
    const lvTxt = p.d.level > st.lv ? ` (Lv.${st.lv} → ${p.d.level})` : '';
    const items = Object.values(st.items).sort((a, b) => b.g - a.g || b.eq - a.eq || b.qty - a.qty);
    const shown = items.slice(0, 10).map(o => `<span style="color:${o.g ? G.GRADES[o.g].color : '#dfe5f7'}">${o.g ? G.U.esc(G.GRADES[o.g].name) + ' · ' : ''}${G.U.esc(o.name)}${o.qty > 1 ? ' ×' + o.qty : ''}</span>`).join('');
    const more = items.length > 10 ? `<span>그 밖에 ${items.length - 10}종</span>` : '';
    const el = document.createElement('div'); el.id = 'slpsum';
    el.innerHTML = `<div class="w"><h3>🌙 절전 중에 얻은 것</h3><div class="tm">${hmsKo(S.sec)}${S.stopMsg ? '' : ' · 자동 사냥'}</div>
      ${S.stopMsg ? `<div class="why">${G.U.esc(S.stopMsg)}</div>` : ''}
      <div class="r"><span>경험치</span><b>${st.lv >= G.F.MAX_LEVEL ? '최고 레벨' : '+' + expGain().toFixed(1) + '%' + lvTxt}</b></div>
      <div class="r"><span>잡은 몬스터</span><b>${fmt(st.kills)}마리</b></div>
      <div class="r"><span>골드</span><b>+${fmt(Math.max(0, p.d.gold - st.gold))} G</b></div>
      <div class="r"><span>쓴 물약</span><b>HP ${fmt(st.hp)} · MP ${fmt(st.mp)}</b></div>
      <div class="its">${shown || '<span>얻은 아이템 없음</span>'}${more}</div>
      <button class="btn gold">확인</button></div>`;
    document.body.appendChild(el);
    el.querySelector('button').addEventListener('click', () => el.remove());
    S.st = null;
  }

  // ---------- 매 프레임 (가볍게) ----------
  function tick() {
    const now = performance.now(), dt = Math.min(1, (now - (S.lastT || now)) / 1000); S.lastT = now;
    if (!active() || !G.Game.player) { wantLock(false); if (S.on) leave(); return; }
    const on = autoOn();
    wantLock(on);
    if (S.on) {
      S.sec += dt;
      if (!on || G.Game.player.dead) { leave(); return; }
      if ((S.pt = (S.pt || 0) + dt) >= 1) { S.pt = 0; paint(); }
      return;
    }
    if (!on) { S.idle = 0; return; }
    S.idle += dt;
    if (S.mins > 0 && S.idle >= S.mins * 60 && !document.getElementById('slpsum')) enter();
  }
  document.addEventListener('visibilitychange', () => { S.lastT = performance.now(); if (document.visibilityState === 'visible') S.idle = 0; });

  function wrap() {
    const fr = G.Game.frame;
    G.Game.frame = function () { const r = fr.apply(this, arguments); try { tick(); } catch (e) { G.ErrLog && G.ErrLog.add(e); } return r; };
    // 메뉴 두 줄 (휴대폰만): 미니맵 버튼 다음
    const mr = G.Win.menu.render, ma = G.Win.menu.act;
    G.Win.menu.render = function () {
      const h = mr.apply(this, arguments); if (!active() || !G.Game.player) return h;
      const add = `<button class="btn" data-act="menu" data-arg="sleepset">🌙 절전 화면: ${S.mins ? S.mins + '분' : '끔'}</button><button class="btn" data-act="menu" data-arg="sleepnow">🌙 지금 절전 화면으로</button>`;
      return h.replace(/(<button class="btn" data-act="menu" data-arg="minimap">[^<]*<\/button>)/, '$1' + add);
    };
    G.Win.menu.act = function (a) {
      if (a === 'sleepset') { S.mins = S.mins === 0 ? 3 : S.mins === 3 ? 10 : 0; try { localStorage.setItem('hny_sleep', String(S.mins)); } catch (e) { /* 저장소 없음 */ } S.idle = 0; G.UI.renderWin('menu'); return; }
      if (a === 'sleepnow') {
        if (!autoOn()) { G.Play.toast('🌙 절전 화면은 자동 사냥 중에만 쓸 수 있어요'); return; }
        G.UI.closeWin('menu'); enter(); return;
      }
      return ma.apply(this, arguments);
    };
  }
  if (typeof window !== 'undefined') window.addEventListener('load', wrap);   // main.js(G.Game) 가 뒤에 불러와져서 load 때 감쌈
  return { S, enter, leave, paint, expGain };
})();
