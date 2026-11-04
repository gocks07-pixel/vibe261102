'use strict';
// 키 설정. 행동마다 원하는 키를 지정할 수 있다 (방향키, F1, Esc, Enter 는 고정)
// fixed: 항상 함께 동작하는 보조 키
G.Keys = {
  ACTIONS: [
    ['jump', '점프', 'Space'],          // 1.6.1: 보조 키(Alt·Ctrl) 기본 지정 없음. 키 설정에서 바꿀 수 있다
    ['attack', '기본 공격', 'KeyZ'],
    ['dash', '대쉬', 'ShiftLeft', ['ShiftRight']],
    ['skill1', '스킬 칸 1', 'Digit1'], ['skill2', '스킬 칸 2', 'Digit2'], ['skill3', '스킬 칸 3', 'Digit3'],
    ['skill4', '스킬 칸 4', 'Digit4'], ['skill5', '스킬 칸 5', 'Digit5'], ['skill6', '스킬 칸 6', 'Digit6'],
    ['hp', 'HP 물약', 'KeyH'], ['mp', 'MP 물약', 'KeyJ'],
    ['stat', '스탯 창', 'KeyS'], ['equip', '장비 창', 'KeyE'], ['inv', '인벤토리', 'KeyI'],
    ['skill', '스킬 창', 'KeyK'], ['quest', '퀘스트 창', 'KeyQ'], ['map', '지도', 'KeyM'],
  ],
  FIXED_CODES: new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'F1', 'Escape', 'Enter', 'NumpadEnter', 'F11']),
  map: {}, waiting: null,
  STORE: 'hny_keys',

  init() {
    for (const [id, , def] of this.ACTIONS) this.map[id] = def;
    try { Object.assign(this.map, JSON.parse(localStorage.getItem(this.STORE) || '{}')); } catch (e) { /* 저장소 없음 */ }
    // 키 변경 대기 중이면 다음 키 입력을 가로챈다 (게임 입력보다 먼저)
    window.addEventListener('keydown', e => {
      if (!this.waiting) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.code === 'Escape') { this.waiting = null; G.UI.renderWin('keys'); return; }
      if (this.FIXED_CODES.has(e.code)) { G.UI.log('방향키, F1, Esc, Enter 는 고정 키입니다.', '#ff7a7a'); return; }
      this.bind(this.waiting, e.code);
      this.waiting = null;
      G.UI.renderWin('keys'); G.UI.dirty();
    }, true);
  },
  save() { try { localStorage.setItem(this.STORE, JSON.stringify(this.map)); } catch (e) { /* 저장소 없음 */ } },
  bind(id, code) {
    const other = Object.keys(this.map).find(k => k !== id && this.map[k] === code);
    if (other) this.map[other] = this.map[id];   // 겹치면 서로 바꿈
    this.map[id] = code;
    this.save();
  },
  reset() { for (const [id, , def] of this.ACTIONS) this.map[id] = def; this.save(); },
  codes(id) {
    const a = this.ACTIONS.find(x => x[0] === id);
    return [this.map[id], ...((a && a[3]) || [])];
  },
  label(id) { return this.codeLabel(this.map[id]); },
  codeLabel(code) {
    if (!code) return '-';
    const T = { Space: 'Space', ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Ctrl', ControlRight: 'Ctrl', AltLeft: 'Alt', AltRight: 'Alt',
                ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Tab: 'Tab', CapsLock: 'Caps', Backquote: '`', Minus: '-', Equal: '=',
                BracketLeft: '[', BracketRight: ']', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', Backslash: '\\' };
    if (T[code]) return T[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Numpad')) return 'Num' + code.slice(6);
    return code;
  },
  hit(id) { return G.Input.hit(...this.codes(id)); },
  down(id) { return G.Input.isDown(...this.codes(id)); },
};
