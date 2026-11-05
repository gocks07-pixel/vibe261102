'use strict';
// 모바일 1차: 터치 화면 판별 + 터치 버튼 설정 + "키를 누른 것처럼" 입력 넣기
//  터치 버튼은 게임 규칙을 건드리지 않고 G.Input 에 키 코드를 넣는다 → 키 설정(G.Keys.map)을 그대로 따른다
//  설정은 세이브와 별도 키 'hny_touch' 에 저장 (세이브 형식 · hny_settings 는 그대로)
G.Touch = {
  KEY: 'hny_touch',
  // mode: auto = 휴대폰·태블릿에서만 / on = 항상 / off = 끔
  opt: { mode: 'auto', size: 'm', alpha: 'm', swap: false, noticed: false },
  SIZE: { s: 0.85, m: 1, l: 1.18 },
  ALPHA: { s: 0.32, m: 0.55, l: 0.8 },

  // 휴대폰 · 태블릿인지 (EXE 는 항상 아님)
  device: (() => {
    if (window.electronAPI) return false;
    try {
      const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
      const ua = navigator.userAgent || '';
      const ipad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;   // 아이패드는 맥처럼 보인다
      return !!(coarse || ipad || /Android|iPhone|iPad|iPod|Mobile/.test(ua));
    } catch (e) { return false; }
  })(),
  get ios() { const ua = navigator.userAgent || ''; return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1); },
  get standalone() { return !!(navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches)); },
  active() { return this.opt.mode === 'on' || (this.opt.mode === 'auto' && this.device); },

  load() {
    try { Object.assign(this.opt, JSON.parse(localStorage.getItem(this.KEY) || '{}') || {}); } catch (e) { /* 저장소 없음 */ }
    if (!this.SIZE[this.opt.size]) this.opt.size = 'm';
    if (!this.ALPHA[this.opt.alpha]) this.opt.alpha = 'm';
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.opt)); } catch (e) { /* 저장소 없음 */ } },

  // 키보드에서 누른 것과 똑같이 (src/core/input.js 의 keydown 과 같은 규칙)
  press(code) {
    const I = G.Input;
    if (!code) return;
    if (!I.down[code]) {
      I.pressed[code] = true;
      if (code === 'ArrowLeft' || code === 'ArrowRight') {
        const now = performance.now();
        if (I.lastTap && I.lastTap.code === code && now - I.lastTap.t < 250) { I.dtap = code; I.lastTap = null; }
        else I.lastTap = { code, t: now };
      }
    }
    I.down[code] = true;
    if (code === 'ArrowLeft' || code === 'ArrowRight') I.lastH = code;
  },
  release(code) { if (code) G.Input.down[code] = false; },
  // 행동 이름(jump, attack, skill1 …) → 지금 키 설정의 키 코드
  code(id) { return G.Keys.map[id] || (G.Keys.codes(id) || [])[0]; },
};
G.Touch.load();
Object.defineProperty(G, 'IS_MOBILE', { get() { return G.Touch.device; } });
