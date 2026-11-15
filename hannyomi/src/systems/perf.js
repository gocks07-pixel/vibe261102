'use strict';
// 빌드 11: 자동 품질 조절 (계획 docs/drafts/plan_build11b.md · 시안 docs/drafts/design/perf12/)
//  실제 화면 간격(1초 평균)을 재서 느려지면(22ms 넘음 1초) "낮춤": 불 · 연기 · 빛 입자 수를 줄이고(G.Settings.fxMul 에 mul 을 곱함)
//  하늘 효과의 비 · 별 · 줄기 수도 줄이며(q), 장비 효과(gearfx)는 잠깐 쉼. 다시 빨라지면(18ms 아래 3초) "보통"으로
//  설정 창의 "스킬 이펙트" 저장 값은 바꾸지 않음. PC · EXE 와 같이 쓰는 파일 (main.js frame 에서 tick)
G.Perf = {
  low: false, mul: 1, q: 1,
  last: 0, acc: 0, n: 0, slowT: 0, fastT: 0, heavyT: 0,
  tick(ts) {
    const d = this.last ? ts - this.last : 16.7; this.last = ts;
    if (!(d > 0) || d > 250) return;   // 창 전환 · 멈춤 뒤 첫 장면은 빼고
    this.acc += d; this.n++;
    if (this.heavyT > 0) this.heavyT -= d / 1000;
    if (this.acc < 500) return;   // 0.5초마다 판단
    const avg = this.acc / this.n; this.acc = 0; this.n = 0;
    if (avg > 22) { this.slowT += 0.5; this.fastT = 0; } else if (avg < 18) { this.fastT += 0.5; this.slowT = 0; } else { this.slowT = 0; this.fastT = 0; }
    if (!this.low && this.slowT >= 1) this.set(true);
    else if (this.low && this.fastT >= 3) this.set(false);
  },
  set(low) { this.low = low; this.mul = low ? 0.55 : 1; this.q = low ? 0.55 : 1; this.slowT = 0; this.fastT = 0; },
  n2(k) { return Math.max(1, Math.round(k * this.q)); },   // 고정 개수 반복을 줄일 때
  heavy(sec) { this.heavyT = Math.max(this.heavyT, sec); },   // 큰 스킬 효과가 떠 있는 동안 (장비 효과 쉼)
  get rest() { return this.low || this.heavyT > 0; },
};
