'use strict';
// 키보드 입력. down = 누르고 있는 중, pressed = 이번 프레임에 새로 눌림
// lastH = 마지막에 누른 좌우 방향키 (둘 다 눌려 있으면 이쪽을 따른다)
// dtap = 이번 프레임에 방향키를 0.25초 안에 두 번 누름
G.Input = {
  down: {}, pressed: {}, lastH: null, dtap: null, lastTap: null,
  PREVENT: new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'AltLeft', 'AltRight', 'Tab', 'ControlLeft', 'ControlRight', 'F1', 'ShiftLeft', 'ShiftRight']),
  KEY_FALLBACK: { ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ' ': 'Space' },
  codeOf(e) { return e.code || this.KEY_FALLBACK[e.key] || ''; },
  init() {
    window.addEventListener('keydown', e => {
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const code = this.codeOf(e);
      if (this.PREVENT.has(code) || e.key === 'Alt') e.preventDefault();
      if (!code) return;
      if (!this.down[code]) {
        this.pressed[code] = true;
        if (code === 'ArrowLeft' || code === 'ArrowRight') {
          const now = performance.now();
          if (this.lastTap && this.lastTap.code === code && now - this.lastTap.t < 250) { this.dtap = code; this.lastTap = null; }
          else this.lastTap = { code, t: now };
        }
      }
      this.down[code] = true;
      if (code === 'ArrowLeft' || code === 'ArrowRight') this.lastH = code;
    });
    window.addEventListener('keyup', e => {
      const code = this.codeOf(e);
      if (this.PREVENT.has(code) || e.key === 'Alt') e.preventDefault();
      if (code) this.down[code] = false;
    });
    // 포커스를 잃으면 keyup 을 못 받으므로 전부 뗀 것으로 처리
    const reset = () => { this.down = {}; this.lastH = null; };
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', reset);
  },
  isDown(...codes) { return codes.some(c => this.down[c]); },
  hit(...codes) { return codes.some(c => this.pressed[c]); },
  horizontal() {
    const L = this.down.ArrowLeft, R = this.down.ArrowRight;
    if (L && R) return this.lastH === 'ArrowLeft' ? -1 : 1;
    return L ? -1 : R ? 1 : 0;
  },
  endFrame() { this.pressed = {}; this.dtap = null; },
};
