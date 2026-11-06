'use strict';
// 모바일 1차 (M1 화면 · M2 터치 조작 · M4 세이브 지키기)
//  다른 파일은 거의 고치지 않고 덧붙이는 방식: G.Game.frame · G.HUD.refresh · G.UI.showHelp · G.Win.menu · G.Keys.label 을 감싼다
//  터치 버튼이 꺼져 있으면(PC · EXE) 감싼 함수도 원래와 똑같이 동작한다
G.Mobile = {
  el: null, btn: {}, held: {}, dpadDir: {}, ready: false,
  lastTouch: 0, lastDbl: null, dblAt: 0, dlgSeen: false, dlgAt: 0, portrait: false,

  // 오른쪽 아래 기준 [오른쪽, 아래, 크기] (보통 크기, px). 좌우 바꾸기면 왼쪽 아래 기준
  LAYOUT: {
    attack: [18, 18, 78], jump: [104, 12, 62], dash: [14, 104, 50],
    skill1: [176, 14, 52], skill2: [160, 72, 52], skill3: [112, 120, 52],
    skill4: [228, 62, 50], skill5: [210, 122, 50], skill6: [166, 170, 50],
    hp: [64, 170, 44], mp: [16, 170, 44],
  },
  DPAD: [14, 18, 150],
  TOP: [['stat', '스탯'], ['equip', '장비'], ['inv', '인벤'], ['skill', '스킬'], ['quest', '퀘스트'], ['map', '지도'], ['menu', '≡ 메뉴']],
  // 터치 모드에서 튜토리얼 · 안내에 보일 버튼 이름 (G.Keys.label 대신)
  NAMES: { jump: '점프', attack: '공격', dash: '대쉬', skill1: '스킬1', skill2: '스킬2', skill3: '스킬3', skill4: '스킬4', skill5: '스킬5', skill6: '스킬6',
    hp: 'HP', mp: 'MP', stat: '스탯', equip: '장비', inv: '인벤', skill: '스킬', quest: '퀘스트', map: '지도' },

  init() {
    if (this.ready) return;
    this.ready = true;
    this.wrap();
    this.watchText();   // 2차-1.7: 휴대폰에 없는 키 문구 바꿔 보여 주기
    document.body.insertAdjacentHTML('beforeend', `<div id="touch"></div>
      <div id="rotate"><div class="ph">📱</div><b>휴대폰을 가로로 돌려 주세요</b><div>이 게임은 가로 화면에서 플레이해요</div></div>
      <div id="mob-modal"></div>`);
    this.el = document.getElementById('touch');
    this.modalEl = document.getElementById('mob-modal');
    this.modalEl.addEventListener('click', e => this.onModal(e));
    this.modalEl.addEventListener('change', e => this.onModalChange(e));
    this.build();
    this.apply();
    this.hookTaps();
    window.addEventListener('resize', () => { this.layout(); this.checkPortrait(); });
    window.addEventListener('orientationchange', () => setTimeout(() => { this.layout(); this.checkPortrait(); }, 300));
    // 아이폰: 두 손가락 확대 막기
    document.addEventListener('gesturestart', e => { if (G.Touch.active()) e.preventDefault(); });
    // 터치 버튼을 길게 눌렀을 때 메뉴가 뜨지 않게
    this.el.addEventListener('contextmenu', e => e.preventDefault());
    this.checkPortrait();
    this.fxDefault();
    this.scaleVars();
    window.addEventListener('resize', () => { this.scaleVars(); this.layoutWins(); });
    // 이름 입력 등으로 브라우저가 게임 화면을 밀어 올리면 제자리로 (화면이 어긋나지 않게)
    for (const id of ['stage', 'game']) { const el = document.getElementById(id); if (el) el.addEventListener('scroll', () => { if (el.scrollTop || el.scrollLeft) { el.scrollTop = 0; el.scrollLeft = 0; } }); }
    // 창 제목 줄을 손가락으로 끌어 옮긴 창은 자동 정렬에서 뺀다 (옮긴 자리 그대로)
    G.UI.root.addEventListener('pointerdown', e => { const h = e.target.closest('.win .wh'); if (h && !e.target.closest('.x') && G.Touch.active()) h.parentElement.dataset.moved = '1'; }, true);
  },

  // ---------- 원래 함수 감싸기 ----------
  wrap() {
    const M = this;
    const frame = G.Game.frame;
    G.Game.frame = function (ts) {
      // 세로 화면이면 게임을 잠시 멈춘다 (몬스터에게 맞지 않게)
      if (M.portrait && this.player && G.Touch.active()) { this.last = ts; M.tick(); return; }
      // 2차-1 배터리 절약: 1초에 30번만 그린다. 건너뛴 프레임은 입력을 지우지 않아 버튼이 씹히지 않는다 (게임 속도는 dt 로 그대로)
      if (G.Touch.opt.fps30 && G.Touch.active() && M.lastDraw && ts - M.lastDraw < 30) { M.skipNow = true; return; }
      M.lastDraw = ts;
      frame.call(this, ts);
      M.tick();
    };
    const endFrame = G.Input.endFrame;
    G.Input.endFrame = function () { if (M.skipNow) { M.skipNow = false; return; } endFrame.apply(this, arguments); };
    // 2차-1 창 키우기: 창을 열고 닫고 다시 그릴 때마다 배율 · 자리 맞추기
    const ow = G.UI.openWin, cw = G.UI.closeWin, rw = G.UI.renderWin;
    G.UI.openWin = function () { const r = ow.apply(this, arguments); M.layoutWins(); return r; };
    G.UI.closeWin = function () { const r = cw.apply(this, arguments); M.layoutWins(); return r; };
    G.UI.renderWin = function (name) {
      const r = rw.apply(this, arguments);
      // 휴대폰에서는 "더블클릭" 안내를 "두 번 탭"으로
      if (G.Touch.active() && this.wins[name]) { const b = this.wins[name].querySelector('.wb'); if (b && b.innerHTML.includes('더블클릭')) b.innerHTML = b.innerHTML.replace(/더블클릭/g, '두 번 탭'); }
      M.layoutWins(); return r;
    };
    const mt = G.UI.moveTip;
    G.UI.moveTip = function (e) { if (G.Touch.active()) M.moveTip(e); else mt.apply(this, arguments); };
    const refresh = G.HUD.refresh;
    G.HUD.refresh = function () { refresh.apply(this, arguments); M.refreshButtons(); };
    const label = G.Keys.label;
    G.Keys.label = function (id) { return G.Touch.active() && M.NAMES[id] ? M.NAMES[id] : label.call(this, id); };
    const help = G.UI.showHelp;
    G.UI.showHelp = function () { if (G.Touch.active()) { M.showGuide(); G.Tutorial.ev('help'); } else help.apply(this, arguments); };
    // 메뉴: 터치 모드면 "키 설정" 대신 "터치 버튼 설정" · "전체 화면", 모두에게 "세이브 옮기기"
    const mr = G.Win.menu.render, ma = G.Win.menu.act;
    G.Win.menu.render = function () {
      let h = mr.apply(this, arguments);
      const keysBtn = '<button class="btn" data-act="menu" data-arg="keys">키 설정</button>';
      const save = '<button class="btn" data-act="menu" data-arg="savefile">💾 세이브 옮기기</button>';
      if (G.Touch.device || G.Touch.active()) {
        const fs = M.canFullscreen() ? `<button class="btn" data-act="menu" data-arg="fullscreen">${M.isFullscreen() ? '전체 화면 끄기' : '전체 화면'}</button>` : '';
        h = h.replace(keysBtn, `<button class="btn" data-act="menu" data-arg="touchset">📱 터치 버튼 설정</button>${fs}`)
          .replace('>조작법 (F1)<', `>${G.Touch.active() ? '조작 안내' : '조작법 (F1)'}<`);
        if (G.Touch.active()) h = h.replace('>저장 후 타이틀로<', '>타이틀로 가기<');   // 2차-1.8
      }
      return h.replace('<button class="btn" data-act="menu" data-arg="sound">', m => save + m);
    };
    G.Win.menu.act = function (a) {
      if (a === 'savefile') { G.UI.closeWin('menu'); M.saveFile(); return; }
      if (a === 'touchset') { G.UI.closeWin('menu'); M.touchSettings(); return; }
      // 2차-1.8: 휴대폰 "타이틀로 가기" — 확인 창 (진행은 자동 저장되므로 저장 안 하기는 없음)
      if (a === 'title' && G.Touch.active() && G.Game.player) { const me = this; G.UI.ask('타이틀로 갈까요? 지금까지의 진행은 저장돼요.', '타이틀로', () => ma.call(me, 'title')); return; }
      if (a === 'fullscreen') { M.toggleFullscreen(); setTimeout(() => G.UI.isOpen('menu') && G.UI.renderWin('menu'), 400); return; }
      return ma.apply(this, arguments);
    };
  },

  // ---------- 2차-1.7 휴대폰에 없는 키 문구 → 휴대폰 버튼 말로 (보여 줄 때만, 원본 글 · PC · EXE 그대로) ----------
  //  로그 · 대화 · 창 · 퀘스트 알림 · 설명 풍선 · 튜토리얼 · 알림이 모두 G.UI.root 아래 글이라, 새로 생긴 글자 칸만 바꾼다
  TXT: [
    [/\s*\(Shift\+클릭:? ?5씩\)/g, ''], [/,?\s*Shift\+클릭:? ?5씩/g, ''],
    ['F1 키로 전체 단축키 설명을 볼 수 있어요. 키는 메뉴 → 키 설정에서 원하는 대로 바꿀 수 있어요.', '≡ 메뉴 → 조작 안내에서 전체 조작 설명을 볼 수 있어요.'],
    ['언제든 F1 키로 단축키를 확인할 수 있어요.', '언제든 ≡ 메뉴 → 조작 안내에서 조작법을 볼 수 있어요.'],
    ['(F1: 단축키 안내)', '(조작법: ≡ 메뉴 → 조작 안내)'], ['조작법 (F1)', '조작 안내'], [/\s*\(F9\)/g, ''],
    ['(우클릭/ESC 취소)', '(≡ 메뉴 버튼: 취소)'], ['(우클릭: 취소)', '(≡ 메뉴 버튼: 취소)'], ['(Esc: 취소)', '(≡ 메뉴 버튼: 취소)'], ['메뉴(Esc)', '메뉴 버튼'],
    ['인벤토리(I)', '인벤토리'], ['장비창은 E 키야', '장비창은 장비 버튼이야'], ['퀘스트 창(Q)', '퀘스트 창'], ['공격은 Z 키일세', '공격은 공격 버튼일세'],
    [/(^|[^A-Za-z])S 키로/g, '$1스탯 버튼으로'], [/(^|[^A-Za-z])K 키로/g, '$1스킬 버튼으로'], ['(K)', '(스킬 버튼)'],
    [/↑ 키를/g, '▲ 버튼을'], [/([가-힣]{2,}) 키\(\1\)/g, '$1 버튼'], [/([가-힣]{2,}) 키로/g, '$1 버튼으로'], [/([가-힣]{2,}) 키를/g, '$1 버튼을'],
    [/더블클릭/g, '두 번 탭'], [/클릭/g, '탭'], ['점프로 점프해 보세요.', '점프 버튼을 눌러 점프해 보세요.'],
  ],
  TXT_TEST: /F1|F9|Shift|Esc|ESC|우클릭|클릭|[A-Z] 키|\([IKQ]\)| 키[로를(]|↑ 키|점프로 점프/,
  fixText(t) {
    if (!t || !this.TXT_TEST.test(t)) return t;
    for (const [a, b] of this.TXT) t = typeof a === 'string' ? t.split(a).join(b) : t.replace(a, b);
    return t;
  },
  fixNode(n) {
    if (n.nodeType === 3) {
      const p = n.parentNode; if (!p || p.closest && (p.closest('textarea, input, script, style'))) return;
      if (p.tagName === 'KBD' && n.nodeValue.trim() === 'F1') { n.nodeValue = '≡ 메뉴'; return; }   // 튜토리얼 키 칸
      const v = n.nodeValue, w = this.fixText(v); if (w !== v) n.nodeValue = w;
    } else if (n.nodeType === 1 && !/^(TEXTAREA|INPUT|SCRIPT|STYLE|CANVAS)$/.test(n.tagName)) {
      const it = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let x; const list = [];
      while ((x = it.nextNode())) list.push(x);
      for (const t of list) this.fixNode(t);
    }
  },
  watchText() {
    const M = this, root = document.body;   // #ui (로그 · 창 · 대화 · 튜토리얼) + 몸 아래 알림 · 안내 창
    const ob = new MutationObserver(ms => {
      if (!G.Touch.active()) return;
      for (const m of ms) {
        if (m.type === 'characterData') M.fixNode(m.target);
        else for (const n of m.addedNodes) M.fixNode(n);
      }
    });
    ob.observe(root, { childList: true, subtree: true, characterData: true });
    if (G.Touch.active()) this.fixNode(root);
  },

  // ---------- 버튼 만들기 ----------
  build() {
    const L = this.LAYOUT;
    let h = '<div class="grp g-play">';
    h += `<div class="dpad" data-pad="1"><i data-d="u" style="left:50%;top:17%">▲</i><i data-d="d" style="left:50%;top:83%">▼</i><i data-d="l" style="left:17%;top:50%">◀</i><i data-d="r" style="left:83%;top:50%">▶</i><div class="knob"></div></div>`;
    for (const id in L) {
      const cls = id === 'attack' ? 'atk' : id === 'jump' ? 'jmp' : id === 'hp' || id === 'mp' ? 'pot' : '';
      const lb = { attack: '공격', jump: '점프', dash: '대쉬', hp: 'HP', mp: 'MP' }[id] || '';
      h += `<div class="tb ${cls}" data-b="${id}"><span class="lb">${lb}</span></div>`;
    }
    h += '</div><div class="grp g-top"><div class="topbar">';
    for (const [w, n] of this.TOP) h += `<div class="tw" data-w="${w}">${n}${w === 'stat' ? '<span class="badge" data-badge="ap" hidden></span>' : w === 'skill' ? '<span class="badge" data-badge="sp" hidden></span>' : ''}</div>`;
    h += '</div></div><div class="grp g-cut"><div class="skip" data-skip="1">건너뛰기 ▶▶</div></div>';
    this.el.innerHTML = h;
    for (const b of this.el.querySelectorAll('[data-b]')) this.btn[b.dataset.b] = b;
    this.pad = this.el.querySelector('.dpad');
    this.knob = this.pad.querySelector('.knob');
    this.bindButtons();
    this.layout();
  },
  layout() {
    if (!this.el) return;
    const o = G.Touch.opt, k = G.Touch.SIZE[o.size] * Math.max(0.8, Math.min(1.25, window.innerHeight / 400));
    const side = o.swap ? 'left' : 'right', other = o.swap ? 'right' : 'left';
    const sv = o.swap ? '--sl' : '--sr', ov = o.swap ? '--sr' : '--sl';
    for (const id in this.LAYOUT) {
      const [r, b, s] = this.LAYOUT[id], el = this.btn[id];
      el.style[other] = ''; el.style[side] = `calc(var(${sv}) + ${Math.round(r * k)}px)`;
      el.style.bottom = `calc(var(--sb) + ${Math.round(b * k)}px)`;
      el.style.width = el.style.height = Math.round(s * k) + 'px';
      el.style.fontSize = Math.round(13 * k) + 'px';
    }
    const [l, b, s] = this.DPAD, P = this.pad;
    P.style[side] = ''; P.style[other] = `calc(var(${ov}) + ${Math.round(l * k)}px)`;
    P.style.bottom = `calc(var(--sb) + ${Math.round(b * k)}px)`;
    P.style.width = P.style.height = Math.round(s * k) + 'px';
    this.el.style.setProperty('--a', G.Touch.ALPHA[o.alpha]);
  },
  // 터치 모드 켜기/끄기 (설정이 바뀔 때)
  apply() {
    document.body.classList.toggle('touch-on', G.Touch.active());
    this.layout();
    this.layoutWins();
    if (G.UI.tip && !G.Touch.active()) G.UI.tip.style.transform = '';
    this.releaseAll();
    if (G.Game.player) G.UI.dirty();
  },

  bindButtons() {
    const M = this;
    // 행동 버튼: 누르는 동안 그 키를 누르고 있는 것과 같다
    for (const id in this.btn) {
      const el = this.btn[id];
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch (x) { /* 무시 */ }
        M.hold(id, true); el.classList.add('on');
      });
      const up = e => { e.preventDefault(); M.hold(id, false); el.classList.remove('on'); };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
    }
    // 방향 패드: 누른 채 손가락을 미끄러뜨리면 방향이 바뀐다
    const P = this.pad;
    let pid = null;
    const move = e => {
      const r = P.getBoundingClientRect(), R = r.width / 2;
      let dx = (e.clientX - (r.left + R)) / R, dy = (e.clientY - (r.top + R)) / R;
      const len = Math.hypot(dx, dy);
      if (len > 1) { dx /= len; dy /= len; }
      this.knob.style.left = (50 + dx * 33) + '%'; this.knob.style.top = (50 + dy * 33) + '%';
      const dead = len < 0.22;
      this.setDir({ l: !dead && dx < -0.38, r: !dead && dx > 0.38, u: !dead && dy < -0.5, d: !dead && dy > 0.5 });
    };
    P.addEventListener('pointerdown', e => {
      e.preventDefault(); pid = e.pointerId;
      try { P.setPointerCapture(pid); } catch (x) { /* 무시 */ }
      P.classList.add('on'); move(e);
    });
    P.addEventListener('pointermove', e => { if (e.pointerId === pid) { e.preventDefault(); move(e); } });
    const end = e => { if (e.pointerId !== pid) return; pid = null; P.classList.remove('on'); this.knob.style.left = this.knob.style.top = '50%'; this.setDir({}); };
    P.addEventListener('pointerup', end); P.addEventListener('pointercancel', end); P.addEventListener('lostpointercapture', end);
    // 위쪽 창 버튼
    for (const b of this.el.querySelectorAll('[data-w]')) {
      b.addEventListener('pointerdown', e => {
        e.preventDefault();
        const w = b.dataset.w;
        if (w === 'menu') { G.Touch.press('Escape'); setTimeout(() => G.Touch.release('Escape'), 0); }   // Esc 와 같다: 열린 창 닫기 → 없으면 메뉴
        else if (G.Game.player) G.UI.toggle(w);
      });
    }
    this.el.querySelector('[data-skip]').addEventListener('pointerdown', e => { e.preventDefault(); if (G.Cutscene.playing()) G.Cutscene.finish(); });
  },
  hold(id, on) {
    const code = G.Touch.code(id);
    if (on) { G.Touch.press(code); this.held[id] = code; }
    else { G.Touch.release(this.held[id] || code); delete this.held[id]; }
  },
  setDir(d) {
    const C = { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown' };
    for (const k in C) {
      const on = !!d[k];
      if (on && !this.dpadDir[k]) G.Touch.press(C[k]);
      if (!on && this.dpadDir[k]) G.Touch.release(C[k]);
      this.dpadDir[k] = on;
      const i = this.pad.querySelector(`[data-d="${k}"]`);
      if (i) i.classList.toggle('on', on);
    }
  },
  releaseAll() {
    for (const id in this.held) G.Touch.release(this.held[id]);
    this.held = {};
    if (this.pad) this.setDir({});
    for (const id in this.btn) this.btn[id].classList.remove('on');
  },

  // 스킬 아이콘 · 물약 개수 (G.HUD.refresh 때)
  refreshButtons() {
    const p = G.Game.player;
    if (!p || !this.el) return;
    const d = p.d, B = this.btn;
    if (!this.atkIcon) this.atkIcon = G.Icons.skill(G.HUD.BASIC_ICON);
    B.attack.innerHTML = `<img src="${this.atkIcon}" style="opacity:.55"><span class="lb">공격</span>`;
    for (let i = 0; i < 6; i++) {
      const id = d.hot[i], el = B['skill' + (i + 1)], sk = id && G.SKILLS[id];
      el.classList.toggle('empty', !sk);
      el.innerHTML = sk ? `<img src="${G.Icons.skill(sk)}"><span class="kn">${i + 1}</span><div class="cd"></div><div class="cdt"></div>` : `<span class="lb">${i + 1}</span>`;
    }
    const ap = G.AutoPot.of(d);
    for (const kind of ['hp', 'mp']) {
      const idx = p.potionIdx(kind), s = idx >= 0 ? d.inv.use[idx] : null;
      const total = s ? d.inv.use.reduce((n, x) => n + (x && x.tid === s.tid ? x.qty : 0), 0) : 0;
      B[kind].classList.toggle('auto', !!ap[kind]);
      B[kind].innerHTML = (s ? `<img src="${G.Icons.item(G.ITEMS[s.tid])}" style="border-radius:20%">` : '') +
        `<span class="lb">${kind.toUpperCase()}</span><span class="ct">${total || ''}</span>${ap[kind] ? '<span class="au">자동</span>' : ''}`;
    }
    const ba = this.el.querySelector('[data-badge="ap"]'), bs = this.el.querySelector('[data-badge="sp"]');
    ba.hidden = !d.ap; ba.textContent = d.ap; bs.hidden = !d.sp; bs.textContent = d.sp;
    this.cdEls = [1, 2, 3, 4, 5, 6].map(i => [B['skill' + i].querySelector('.cd'), B['skill' + i].querySelector('.cdt'), B['skill' + i]]);
  },

  // ---------- 매 프레임: 보이기/숨기기 · 재사용 대기 ----------
  tick() {
    if (!this.el) return;
    const T = G.Touch, on = T.active();
    if (!on) { if (this.el.className) { this.el.className = ''; this.releaseAll(); } return; }
    const p = G.Game.player, U = G.UI;
    const cut = G.Cutscene.playing && G.Cutscene.playing();
    const ov = !!document.querySelector('#overlay .overlay');
    const bug = G.Bug && G.Bug.isOpen && G.Bug.isOpen();
    const modal = this.modalEl.classList.contains('on');
    const inGame = !!(p && G.Game.world) && !ov && !bug && !modal && !this.portrait;
    const anyWin = Object.keys(U.wins).length > 0;
    const busy = G.Dialog.isOpen() || U.asking() || !!U.target;
    const play = inGame && !anyWin && !busy;
    const cls = (play ? 'play ' : '') + (inGame ? 'top ' : '') + (cut && !modal ? 'cut' : '');
    if (cls !== this.el.className) {
      if (!play) this.releaseAll();
      this.el.className = cls;
    }
    // 대화가 열린 순간을 기억 (NPC 를 누른 바로 그 탭으로 대화가 넘어가지 않게)
    const dlg = G.Dialog.isOpen();
    if (dlg && !this.dlgSeen) this.dlgAt = performance.now();
    this.dlgSeen = dlg;
    // 오른쪽 위 퀘스트 안내: 커진 골드 · 버프 칸 아래로 (hud.js 가 정한 top 대신)
    if (this.Z && G.UI.root) {
      const bf = document.getElementById('buffs'), hz = this.HZ;
      const top = bf && bf.children.length && bf.offsetParent ? 46 + bf.offsetHeight * hz + 8 : 10 + 30 * hz + 8;
      const v = Math.round(top) + 'px';
      if (v !== this.trkTop) { this.trkTop = v; G.UI.root.style.setProperty('--trk', v); }
    }
    // 위쪽 창 버튼: 열린 창 표시
    if (inGame) for (const b of this.el.querySelectorAll('[data-w]')) b.classList.toggle('on', b.dataset.w !== 'menu' && U.isOpen(b.dataset.w));
    // 스킬 재사용 대기 (G.HUD.update 와 같은 규칙)
    if (play && this.cdEls && p) {
      for (let i = 0; i < 6; i++) {
        const [cd, cdt, el] = this.cdEls[i];
        if (!cd) continue;
        const id = p.d.hot[i], sk = id && G.SKILLS[id], left = id ? (p.cd[id] || 0) : 0;
        if (sk && left > 0 && sk.cd > 0.5) { cd.style.height = (left / sk.cd * 100) + '%'; cdt.textContent = Math.ceil(left); }
        else { cd.style.height = '0'; cdt.textContent = ''; }
        const lv = id ? p.d.skills[id] || 0 : 0;
        el.classList.toggle('nomp', !!sk && (lv <= 0 || (sk.mp && p.mp < sk.mp(lv))));
      }
    }
  },
  checkPortrait() {
    const was = this.portrait;
    this.portrait = G.Touch.active() && window.innerHeight > window.innerWidth * 1.05;
    document.getElementById('rotate').classList.toggle('on', this.portrait);
    if (was !== this.portrait) this.releaseAll();
  },

  // ---------- 창 · 대화를 손가락으로 ----------
  hookTaps() {
    const M = this, root = G.UI.root;
    const touchy = e => e.pointerType === 'touch' || e.pointerType === 'pen';
    window.addEventListener('pointerdown', e => { if (touchy(e)) M.lastTouch = performance.now(); }, true);
    const recent = () => G.Touch.active() && performance.now() - M.lastTouch < 900;
    // 손가락 탭 뒤에 따라오는 가짜 마우스 올림(mouseover)은 무시 → 아이폰에서 첫 탭이 씹히지 않게, 설명은 아래 click 에서 보여 준다
    //  (mouseleave 도: 탭 직후 브라우저가 보내서 설명이 바로 사라진다)
    for (const t of ['mouseover', 'mousemove', 'mouseleave']) root.addEventListener(t, e => { if (recent()) e.stopImmediatePropagation(); }, true);
    // 휴대폰이 스스로 만드는 dblclick 은 막고, 아래 "빠르게 두 번 탭"만 쓴다 (두 번 입혀지지 않게)
    root.addEventListener('dblclick', e => { if (recent()) e.stopImmediatePropagation(); }, true);
    // 같은 칸을 빠르게 두 번 탭 = 더블클릭 (장비 입기 · 물약 사용 · 판매 · 창고 · 퀘스트 길 안내)
    root.addEventListener('pointerup', e => {
      if (!touchy(e) || !G.Touch.active()) return;
      const el = e.target.closest('[data-dbl]');
      if (!el) { M.lastDbl = null; return; }
      const key = el.dataset.dbl, now = performance.now();
      if (M.lastDbl && M.lastDbl.key === key && now - M.lastDbl.t < 420) {
        M.lastDbl = null; M.dblAt = now;
        G.UI.onDbl({ target: el });
        G.UI.hideTip();
      } else M.lastDbl = { key, t: now };
    });
    // 한 번 탭 = 설명 보기 (마우스를 올린 것 대신)
    root.addEventListener('click', e => {
      if (!recent()) return;
      if (performance.now() - M.dblAt < 450) { G.UI.hideTip(); return; }
      const el = e.target.closest('[data-tip]');
      if (el && document.contains(el)) G.UI.showTip(el.dataset.tip, e); else G.UI.hideTip();
    });
    // 대화 중에는 화면 아무 곳이나 탭 = 다음 (Enter 와 같다)
    document.addEventListener('click', e => {
      if (!recent() || !G.Dialog.isOpen() || !M.dlgSeen) return;
      if (performance.now() - M.dlgAt < 350) return;
      if (e.target.closest('button, [data-act], input, textarea, .win, #touch, #mob-modal, .opts')) return;
      G.Dialog.enter();
    });
  },

  // ---------- 전체 화면 (갤럭시 크롬 등. 아이폰은 홈 화면에 추가하면 전체 화면) ----------
  canFullscreen() { const d = document.documentElement; return !!(document.fullscreenEnabled && d.requestFullscreen) || !!(document.webkitFullscreenEnabled && d.webkitRequestFullscreen); },
  isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
  toggleFullscreen() {
    const d = document.documentElement;
    try {
      if (this.isFullscreen()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      const p = (d.requestFullscreen || d.webkitRequestFullscreen).call(d);
      const lock = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* 무시 */ } };
      if (p && p.then) p.then(lock).catch(() => {}); else lock();
    } catch (e) { /* 지원 안 함 */ }
  },
  deviceText() {
    const ua = navigator.userAgent || '';
    const os = /iPhone/.test(ua) ? '아이폰' : /iPad/.test(ua) || G.Touch.ios ? '아이패드' : /Android/.test(ua) ? '안드로이드' : '기타';
    return `${os} · 화면 ${window.innerWidth}×${window.innerHeight} · ${G.Touch.standalone ? '홈 화면 앱' : '브라우저'}`;
  },

  // ---------- 모바일 창 ----------
  modal(html, onAct, wide) {
    this.modalAct = onAct;
    this.modalEl.innerHTML = `<div class="mm${wide ? ' wide' : ''}"><button class="mx" data-m="close" aria-label="닫기">✕</button>${html}</div>`;
    this.modalEl.classList.add('on');
    this.releaseAll();
  },
  closeModal() { this.modalEl.classList.remove('on'); this.modalEl.innerHTML = ''; this.modalAct = null; G.Input.down = {}; },
  onModal(e) {
    if (e.target === this.modalEl) return;   // 바깥 탭으로는 닫지 않는다 (실수 방지)
    const b = e.target.closest('[data-m]');
    if (!b || b.disabled) return;
    if (b.dataset.m === 'close') { this.closeModal(); return; }
    if (this.modalAct) this.modalAct(b.dataset.m, b, e);
  },
  onModalChange(e) { if (e.target.type === 'file' && this.modalAct) this.modalAct('file', e.target, e); },

  // 조작 안내 (F1 대신)
  showGuide() {
    const row = (k, t) => `<kbd>${k}</kbd><span>${t}</span>`;
    this.modal(`<h3>📱 조작 안내</h3><div class="guide">
      ${row('◀ ▶', '방향 패드: 이동 (누른 채 미끄러뜨리면 방향 바뀜)')}
      ${row('▲', '포탈 이동 · NPC 대화 · 보물상자 (NPC 를 직접 탭해도 대화)')}
      ${row('▼ + 점프', '발판 아래로 내려가기')}
      ${row('점프', '점프 · 공중에서 한 번 더: 2단 점프 (▲ 누른 채면 위로)')}
      ${row('공격', '기본 공격 (누르고 있으면 연속)')}
      ${row('대쉬', '땅에서 빠르게 이동')}
      ${row('1 ~ 6', '스킬 (스킬 창에서 칸에 등록)')}
      ${row('HP · MP', '물약 (자동 물약: 메뉴 → 자동 물약 설정)')}
      ${row('위쪽 버튼', '스탯 · 장비 · 인벤 · 스킬 · 퀘스트 · 지도 창 열고 닫기')}
      ${row('≡ 메뉴', '열린 창 닫기 → 없으면 메뉴 (저장 · 설정 · 버그 신고)')}
      ${row('한 번 탭', '아이템 · 스킬 설명 보기')}
      ${row('두 번 탭', '장비 입기 · 벗기, 물약 사용, 판매, 창고 넣기 · 빼기')}
      ${row('퀘스트 두 번 탭', '오른쪽 위 퀘스트 → 길 안내')}
      ${row('대화 중 탭', '다음 대사')}
      </div><div class="dim" style="margin-top:8px">창이나 대화가 열려 있는 동안에는 조작 버튼이 잠시 숨어요. 버튼 크기 · 투명도 · 좌우는 메뉴 → 📱 터치 버튼 설정</div>
      <div class="end"><button class="gold" data-m="close">닫기</button></div>`, () => {}, true);
  },

  // 터치 버튼 설정
  touchSettings() {
    const o = G.Touch.opt;
    const opt = (k, v, t) => `<button data-m="set:${k}:${v}" class="${String(o[k]) === String(v) ? 'on' : ''}">${t}</button>`;
    this.modal(`<h3>📱 터치 버튼 설정</h3>
      <div class="row"><b>터치 버튼</b>${opt('mode', 'auto', '자동 (휴대폰에서만)')}${opt('mode', 'on', '항상 켬')}${opt('mode', 'off', '끔')}</div>
      <div class="row"><b>크기</b>${opt('size', 's', '작게')}${opt('size', 'm', '보통')}${opt('size', 'l', '크게')}</div>
      <div class="row"><b>투명도</b>${opt('alpha', 's', '연하게')}${opt('alpha', 'm', '보통')}${opt('alpha', 'l', '진하게')}</div>
      <div class="row"><b>위치</b>${opt('swap', false, '이동 왼쪽 · 공격 오른쪽')}${opt('swap', true, '좌우 바꾸기 (왼손)')}</div>
      <div class="row"><b>자동 흡수</b>${opt('magnet', true, '켬 (골드 · 아이템이 날아와요)')}${opt('magnet', false, '끔')}</div>
      <div class="row"><b>공격 중 이동</b>${opt('moveCancel', true, '켬 (공격하다 바로 움직임)')}${opt('moveCancel', false, '끔')}</div>
      <div class="row"><b>배터리 절약</b>${opt('fps30', false, '끔 (부드럽게)')}${opt('fps30', true, '켬 (30프레임)')}</div>
      <div class="dim">배터리 절약을 켜면 화면을 1초에 30번만 그려서 휴대폰이 덜 뜨겁고 배터리가 오래 가요. 게임 속도는 그대로예요.</div>
      <div class="dim">"끔"으로 하면 블루투스 키보드 · 게임패드로 플레이할 수 있어요. 다시 켜려면 메뉴 → 📱 터치 버튼 설정</div>
      <div class="end"><button class="gold" data-m="close">닫기</button></div>`, a => {
      const [, k, v] = a.split(':');
      o[k] = ['swap', 'fps30', 'magnet', 'moveCancel'].includes(k) ? v === 'true' : v;
      G.Touch.save(); this.apply(); this.checkPortrait();
      this.touchSettings();
    });
  },

  // 처음 한 번: 휴대폰으로 하기 안내
  firstNotice() {
    const o = G.Touch.opt;
    // 2차-1: 아이폰 · 아이패드 사파리(홈 화면 앱이 아닐 때)는 "크게 보는 방법"을 처음 한 번
    if (this.showBigBtn() && !o.bigNoticed) { this.bigGuide(true); o.bigNoticed = true; o.noticed = true; G.Touch.save(); return; }
    if (!G.Touch.device || o.noticed) return;
    const ios = G.Touch.ios, home = !G.Touch.standalone;
    this.modal(`<h3>📱 휴대폰으로 플레이하기</h3><ul>
      <li>휴대폰을 <b>가로</b>로 들고 플레이해요. 왼쪽 방향 패드로 이동, 오른쪽 버튼으로 공격 · 점프 · 스킬</li>
      ${home ? `<li><b>${ios ? '사파리 공유 버튼 → "홈 화면에 추가"' : '크롬 메뉴(⋮) → "홈 화면에 추가"'}</b>를 하면 앱처럼 전체 화면으로 열리고, 세이브도 더 안전해요</li>` : ''}
      ${ios ? '<li>소리가 안 나면 아이폰 옆의 <b>무음 스위치</b>를 확인해 주세요</li>' : ''}
      <li>세이브는 이 브라우저 안에 저장돼요. 가끔 <b>메뉴 → 💾 세이브 옮기기</b>에서 내보내 두면, 데이터가 지워져도 되살릴 수 있어요</li>
      </ul><div class="end"><button class="gold" data-m="close">알겠어요</button></div>`, () => {});
    o.noticed = true; G.Touch.save();
  },
  // ---------- 2차-1 ① 아이폰 크게 보는 방법 ----------
  showBigBtn() { return G.Touch.device && G.Touch.ios && !G.Touch.standalone; },
  bigGuide(first) {
    // 사파리 버튼 모양 (코드로 그림)
    const share = '<svg class="ico" viewBox="0 0 24 24"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="#5aa9ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10H6v10h12V10h-2" fill="none" stroke="#5aa9ff" stroke-width="2" stroke-linejoin="round"/></svg>';
    const add = '<svg class="ico" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="#e8ecf6" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="#e8ecf6" stroke-width="2" stroke-linecap="round"/></svg>';
    const aa = '<span class="aa">가<small>가</small></span>';
    this.modal(`<h3>📱 아이폰에서 크게 보는 방법</h3>
      <div class="big-way rec"><div class="bw-h"><b>방법 1</b> 홈 화면에 추가 <span class="tagr">추천</span></div>
        <ol><li>사파리 아래쪽(또는 위쪽)의 공유 버튼 ${share} 을 눌러요</li>
          <li>목록을 올려서 ${add} <b>"홈 화면에 추가"</b> → 오른쪽 위 <b>"추가"</b></li>
          <li>홈 화면에 생긴 <b>별 아이콘 "RPG 대모험"</b>으로 열어요</li></ol>
        <div class="dim">주소창 없이 항상 크게 열리고, 세이브도 더 안전해요.</div></div>
      <div class="big-way"><div class="bw-h"><b>방법 2</b> 지금만 잠깐 크게</div>
        <ol><li>주소창 왼쪽의 ${aa} 버튼을 눌러요</li><li><b>"툴바 막대 가리기"</b>를 눌러요</li></ol>
        <div class="dim">사파리를 닫았다 다시 열면 원래대로 돌아와요. 화면 위쪽을 탭하면 주소창이 다시 보여요.</div></div>
      <div class="msg">💾 사파리에서 하던 세이브는 홈 화면 앱에서 보이지 않아요. 옮기려면 사파리에서 <b>💾 세이브 옮기기 → 글자 복사</b>, 홈 화면 앱에서 <b>글자 붙여넣기</b>. (처음부터 홈 화면 앱으로 시작하면 옮길 필요가 없어요)</div>
      ${first ? '<div class="dim">이 안내는 타이틀 화면의 <b>📱 크게 보는 방법</b> 버튼으로 다시 볼 수 있어요. 소리가 안 나면 아이폰 옆의 무음 스위치를 확인해 주세요.</div>' : ''}
      <div class="end"><button class="gold" data-m="close">알겠어요</button></div>`, () => {}, true);
  },

  // ---------- 2차-1 ④ 휴대폰 성능: 처음이면 스킬 이펙트 "보통" ----------
  fxDefault() {
    if (!G.Touch.device || G.Touch.opt.fxSet) return;
    let raw = {};
    try { raw = JSON.parse(localStorage.getItem(G.Settings.KEY) || '{}') || {}; } catch (e) { /* 없음 */ }
    if (!('fx' in raw)) { G.Settings.fx = 'normal'; G.Settings.save(); }
    G.Touch.opt.fxSet = true; G.Touch.save();
  },

  // ---------- 2차-1 ③ 창 키우기 ----------
  //  목표: 창 글자가 실제 화면에서 PC 의 약 85% 크기. 배율 = 0.85 ÷ 게임 화면 배율 (1 ~ 1.9)
  scaleVars() {
    const sc = G.Game.scale || 1, R = G.UI.root;
    this.Z = Math.max(1, Math.min(1.9, 0.85 / sc));
    this.HZ = Math.max(1, Math.min(1.5, this.Z * 0.8));
    // 위쪽 터치 창 버튼 줄 아래 (게임 좌표)
    this.TOP = Math.min(100, Math.round(44 / sc));
    if (!R) return;
    R.style.setProperty('--mz', this.Z.toFixed(3));
    R.style.setProperty('--hz', this.HZ.toFixed(3));
    R.style.setProperty('--dz', Math.min(this.Z, 1264 / 800).toFixed(3));
    R.style.setProperty('--tbar', this.TOP + 'px');
  },
  layoutWins() {
    const U = G.UI, list = Object.values(U.wins || {});
    if (!G.Touch.active()) {
      for (const el of list) if (el.dataset.mz) { el.style.transform = ''; el.style.transformOrigin = ''; const b = el.querySelector('.wb'); if (b) b.style.maxHeight = ''; delete el.dataset.mz; }
      return;
    }
    if (!list.length) return;
    const Z = this.Z || 1, GAP = 10, T = this.TOP || 80;
    const ws = list.map(el => el.offsetWidth);
    const total = ws.reduce((a, b) => a + b, 0) + GAP * (list.length - 1);
    const z = Math.max(0.6, Math.min(Z, 1264 / total));
    let x = Math.max(8, (1280 - total * z) / 2);
    list.forEach((el, i) => {
      const b = el.querySelector('.wb'), head = el.querySelector('.wh');
      const hh = head ? head.offsetHeight : 36;
      if (b) b.style.maxHeight = Math.max(120, Math.floor((712 - T) / z - hh - 4)) + 'px';
      el.style.transformOrigin = '0 0';
      el.style.transform = `scale(${z.toFixed(3)})`;
      el.dataset.mz = z.toFixed(3);
      if (!el.dataset.moved) { el.style.left = Math.round(x) + 'px'; el.style.top = T + 'px'; }
      x += (ws[i] + GAP) * z;
    });
  },
  // 설명: 창과 같은 배율로 크게, 탭한 곳 근처에서 화면 밖으로 안 나가게
  moveTip(e) {
    const tip = G.UI.tip, rect = G.UI.root.getBoundingClientRect(), sc = G.Game.scale, z = this.Z || 1;
    tip.style.transformOrigin = '0 0'; tip.style.transform = `scale(${z.toFixed(3)})`;
    const w = tip.offsetWidth * z, h = tip.offsetHeight * z;
    let x = (e.clientX - rect.left) / sc + 20, y = (e.clientY - rect.top) / sc - h / 2;
    if (x + w > 1272) x = (e.clientX - rect.left) / sc - w - 20;
    x = Math.max(8, Math.min(1272 - w, x)); y = Math.max(8, Math.min(712 - h, y));
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  },

  // ---------- 2차-2 인터넷 없이 실행 · 새 버전 안내 (배포판에서만: tools/build_web.js 가 src/webbuild.js 로 G.WEB_BUILD 를 넣는다) ----------
  sw() {
    if (!G.WEB_BUILD || window.electronAPI || !('serviceWorker' in navigator) || !window.isSecureContext) return;
    const SW = navigator.serviceWorker;
    let reloading = false;
    SW.addEventListener('controllerchange', () => { if (this.swSkip && !reloading) { reloading = true; location.reload(); } });
    SW.register('sw.js').then(reg => {
      this.swReg = reg;
      // 게임을 시작하기 전(타이틀)에 이미 새 버전이 받아져 있으면 바로 바꾼다 = "다음 실행 때 자동으로"
      if (reg.waiting && SW.controller && !G.Game.player) { this.swSkip = true; reg.waiting.postMessage('skip'); return; }
      if (reg.waiting && SW.controller) this.updateBar();
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && SW.controller) this.updateBar(); });
      });
      // 앱으로 돌아올 때마다 새 버전이 있는지 확인
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => { /* 지원 안 함 · 실패해도 게임은 그대로 */ });
  },
  updateBar() {
    if (document.getElementById('mob-update')) return;
    const el = document.createElement('div');
    el.id = 'mob-update';
    el.innerHTML = '✨ 새 버전이 준비됐어요 <button data-u="now" class="gold">지금 바꾸기</button><button data-u="later">나중에</button>';
    el.addEventListener('click', async e => {
      const b = e.target.closest('[data-u]');
      if (!b) return;
      if (b.dataset.u === 'later') { el.remove(); return; }
      b.disabled = true; b.textContent = '저장 중…';
      if (G.Game.player) await G.Game.save(true);   // 바꾸기 전에 저장
      const w = this.swReg && this.swReg.waiting;
      if (w) { this.swSkip = true; w.postMessage('skip'); } else location.reload();
    });
    document.body.appendChild(el);
  },

  // 저장 공간을 지우지 말라고 브라우저에 요청 (휴대폰에서 한 번)
  persist() {
    try { if (G.Touch.device && navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => { if (!p) navigator.storage.persist(); }).catch(() => {}); } catch (e) { /* 지원 안 함 */ }
  },

  // ---------- M4 세이브 옮기기 (내보내기 · 가져오기) ----------
  async saveFile(state) {
    const st = this.sf = Object.assign({ msg: '', err: false, paste: null, ask: null }, state || {});
    const S = G.Save, playing = G.Game.player ? S.slot : null;
    if (playing) await G.Game.save(true);   // 지금 하고 있는 슬롯은 최신으로 저장한 뒤 꺼낸다
    const saves = await S.loadAll();
    // 복사 · 공유는 탭한 그 순간에 해야 브라우저가 허락하므로 미리 꺼내 둔다
    this.raws = {}; this.packs = {};
    for (const s of S.SLOTS) { const raw = await S.exportRaw(s); if (raw) { this.raws[s] = raw; this.packs[s] = await S.packText(raw); } }
    const share = !!(navigator.canShare && window.File && (() => { try { return navigator.canShare({ files: [new File(['{}'], 'save_A.json', { type: 'application/json' })] }); } catch (e) { return false; } })());
    const esc = G.U.esc;
    let h = `<h3>💾 세이브 옮기기</h3><div class="dim">세이브를 파일이나 글자로 꺼내 두면 브라우저 데이터가 지워져도 되살릴 수 있어요.
      PC EXE 의 <b>문서\\RPG Adventure\\Save Data\\save_A.json</b> 파일도 그대로 넣을 수 있어요.</div>`;
    if (st.msg) h += `<div class="msg ${st.err ? 'err' : ''}">${st.msg}</div>`;
    if (st.ask) {
      const a = st.ask, cur = G.Save.info(saves[a.slot]), nw = G.Save.info(a.data);
      h += `<div class="slot"><div>슬롯 <b>${a.slot}</b> 에 <span class="nm">${esc(nw.name)}</span> (Lv.${nw.level} ${esc(nw.job)} · ${esc(nw.chapter)}) 를 넣을까요?</div>
        ${cur ? `<div class="dim">지금 슬롯 ${a.slot} 의 ${esc(cur.name)} (Lv.${cur.level}) 세이브는 백업해 두고 바꿔요.</div>` : ''}
        <div class="end"><button class="gold" data-m="doimport">넣기</button><button data-m="cancel">취소</button></div></div>`;
    } else if (st.paste) {
      h += `<div class="slot"><div>슬롯 <b>${st.paste}</b> 에 넣을 세이브 글자를 붙여 넣어 주세요 (HNY1: 로 시작하는 글자, 또는 save 파일 내용)</div>
        <textarea id="mob-paste" placeholder="여기에 길게 눌러 붙여넣기"></textarea>
        <div class="end"><button class="gold" data-m="pasteok">확인</button><button data-m="cancel">취소</button></div></div>`;
    } else {
      for (const s of S.SLOTS) {
        const info = S.info(saves[s]), busy = s === playing;
        h += `<div class="slot"><div>슬롯 ${s} · ${info ? `<span class="nm">${esc(info.name)}</span> Lv.${info.level} ${esc(info.job)} <span class="dim">${esc(info.time)}</span>` : '<span class="dim">비어 있음</span>'}${busy ? ' <span class="dim">(지금 플레이 중)</span>' : ''}</div>
          <div class="row">${info ? `<button data-m="dl:${s}">📄 파일로 저장</button>${share ? `<button data-m="share:${s}">📤 공유 (카카오톡 등)</button>` : ''}<button data-m="copy:${s}">📋 글자 복사</button>` : ''}
          <button data-m="pick:${s}" ${busy ? 'disabled' : ''}>📂 파일 가져오기</button><button data-m="paste:${s}" ${busy ? 'disabled' : ''}>📥 글자 붙여넣기</button></div></div>`;
      }
      if (playing) h += `<div class="dim">지금 플레이 중인 슬롯 ${playing} 에는 가져올 수 없어요 (자동 저장이 덮어써요). 타이틀 화면의 💾 세이브 옮기기에서 넣어 주세요.</div>`;
      h += '<input type="file" id="mob-file" accept=".json,application/json,text/plain" style="display:none">';
    }
    h += `<div class="end"><button data-m="close">닫기</button></div>`;
    this.modal(h, (a, b) => this.saveAct(a, b, saves));
  },
  async saveAct(a, b, saves) {
    const [k, s] = a.split(':'), S = G.Save, st = this.sf;
    const again = o => this.saveFile(o);
    if (k === 'cancel') return again();
    if (k === 'dl' || k === 'share' || k === 'copy') {
      const raw = this.raws[s];
      if (!raw) return again({ msg: '빈 슬롯이에요.', err: true });
      const name = `save_${s}.json`;
      if (k === 'dl') {
        const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
        const el = document.createElement('a'); el.href = url; el.download = name; document.body.appendChild(el); el.click(); el.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        return again({ msg: `${name} 파일을 저장했어요. (아이폰: "파일" 앱 → 다운로드 / 갤럭시: 내 파일 → 다운로드)` });
      }
      if (k === 'share') {
        try { await navigator.share({ files: [new File([raw], name, { type: 'application/json' })], title: `RPG 대모험 세이브 ${s}` }); return again({ msg: '공유했어요.' }); }
        catch (e) { return again(e && e.name === 'AbortError' ? {} : { msg: '공유하지 못했어요. 📄 파일로 저장을 써 주세요.', err: true }); }
      }
      const text = this.packs[s] || raw;
      if (await this.copyText(text)) return again({ msg: `슬롯 ${s} 세이브 글자(${text.length.toLocaleString()}자)를 복사했어요. 카카오톡 "나에게 보내기" 등에 붙여 넣어 보관하세요.` });
      // 복사가 막힌 브라우저: 글자를 보여 주고 직접 복사
      this.modal(`<h3>📋 세이브 글자</h3><div class="dim">자동 복사가 안 돼요. 아래 글자를 길게 눌러 "전체 선택 → 복사" 해 주세요.</div>
        <textarea readonly>${G.U.esc(text)}</textarea><div class="end"><button data-m="cancel">뒤로</button></div>`, x => x === 'cancel' && again());
      return;
    }
    if (k === 'pick') { const f = document.getElementById('mob-file'); f.dataset.slot = s; f.value = ''; f.click(); return; }
    if (k === 'file') {
      const f = b.files && b.files[0], slot = b.dataset.slot;
      if (!f) return;
      const r = await S.parseImport(await f.text());
      return again(r.err ? { msg: r.err, err: true } : { ask: { slot, data: r.data } });
    }
    if (k === 'paste') return again({ paste: s });
    if (k === 'pasteok') {
      const t = document.getElementById('mob-paste'), r = await S.parseImport(t ? t.value : '');
      return again(r.err ? { msg: r.err, err: true, paste: st.paste } : { ask: { slot: st.paste, data: r.data } });
    }
    if (k === 'doimport') {
      const { slot, data } = st.ask;
      if (G.Game.player && slot === S.slot) return again({ msg: '지금 플레이 중인 슬롯에는 넣을 수 없어요.', err: true });
      const ok = await S.importData(slot, data);
      if (!G.Game.player && G.Title) { G.Title.saves = await S.loadAll(); G.Title.render(); }
      return again(ok ? { msg: `슬롯 ${slot} 에 넣었어요! 타이틀에서 "이어하기"로 불러오세요.` } : { msg: '저장 공간이 부족해서 넣지 못했어요.', err: true });
    }
  },
  async copyText(t) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); return true; } } catch (e) { /* 아래 방법 */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length);
      const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch (e) { return false; }
  },
};

// G.Game.init (main.js 의 load 이벤트) 이 G.UI 를 만든 뒤에 시작한다
window.addEventListener('load', () => setTimeout(() => {
  G.Mobile.init();
  G.Mobile.firstNotice();
  G.Mobile.persist();
  G.Mobile.sw();
}, 0));
