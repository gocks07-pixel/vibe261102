'use strict';
// 전역 네임스페이스. 모든 파일은 G 아래에 모듈을 등록한다.
window.G = {};

G.U = {
  rand: (a, b) => a + Math.random() * (b - a),
  randi: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  chance: p => Math.random() < p,
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  // entries: [[값, 가중치], ...]
  weighted(entries) {
    let total = 0;
    for (const e of entries) total += e[1];
    let r = Math.random() * total;
    for (const e of entries) { r -= e[1]; if (r < 0) return e[0]; }
    return entries[entries.length - 1][0];
  },
  overlap: (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
  fmt: n => Math.floor(n).toLocaleString('ko-KR'),
  uid: (() => { let n = 0; return () => 'i' + Date.now().toString(36) + (n++).toString(36); })(),
  esc: s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  // 스킬 레벨 1 → max 사이 선형 보간
  lin: (a, b, max = 20) => lv => Math.round(a + (b - a) * (Math.max(1, lv) - 1) / (max - 1)),
};
