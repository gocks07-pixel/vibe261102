'use strict';
// 1.7.9 스킬 아이콘 전용 문양 (스킬 id마다 하나, 서로 겹치지 않음) + 나쁜 효과 아이콘
//  - 공통 스킬 3개(돌 던지기 · 응급 처치 · 2단 점프)는 icons.js의 옛 문양 그대로
//  - 테두리 모양: 공격 = 둥근 사각형 · 버프 = 방패꼴 · 패시브 = 원 (icons.js skill())
//  - 버프에 눈 그림은 쓰지 않는다
//  - 그림은 1.7.10~1.7.11 스킬 수정 방향(docs/SKILL_REWORK.md)에 맞춘다
(function () {
  const W = '#ffffff', PI = Math.PI;
  const R = n => Math.round(n * 10) / 10;
  const P = (x, y) => R(x) + ' ' + R(y);
  // ---------- 기본 도형 ----------
  const fill = (d, c = W, ex = '') => `<path d="${d}" fill="${c}" ${ex}/>`;
  const st = (d, c = W, w = 2.5, ex = '') => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${ex}/>`;
  const cir = (x, y, r, c = W, ex = '') => `<circle cx="${R(x)}" cy="${R(y)}" r="${R(r)}" fill="${c}" ${ex}/>`;
  const ring = (x, y, r, c = W, w = 2.5, ex = '') => `<circle cx="${R(x)}" cy="${R(y)}" r="${R(r)}" fill="none" stroke="${c}" stroke-width="${w}" ${ex}/>`;
  const ell = (x, y, rx, ry, c = W, ex = '') => `<ellipse cx="${R(x)}" cy="${R(y)}" rx="${R(rx)}" ry="${R(ry)}" fill="${c}" ${ex}/>`;
  const poly = (pts, c = W, ex = '') => `<polygon points="${pts.map(([x, y]) => R(x) + ',' + R(y)).join(' ')}" fill="${c}" ${ex}/>`;
  const line = (pts, c = W, w = 2.5, ex = '') => st('M' + pts.map(([x, y]) => P(x, y)).join(' L'), c, w, ex);
  const g = (t, s) => `<g transform="${t}">${s}</g>`;
  const op = (o, s) => `<g opacity="${o}">${s}</g>`;
  const rot = (a, x, y, s) => g(`rotate(${a} ${x} ${y})`, s);
  const starPts = (cx, cy, n, r1, r2, a0 = -90) => { const o = []; for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = (a0 + 180 * i / n) * PI / 180; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
  const dir = (x1, y1, x2, y2) => { const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };

  // ---------- 무기·사물 ----------
  // 검: 손잡이 끝(x1,y1) → 칼끝(x2,y2)
  const sword = (x1, y1, x2, y2, d, w = 3, c = W) => {
    const [ux, uy] = dir(x1, y1, x2, y2), px = -uy, py = ux;
    return poly([[x1 + px * w, y1 + py * w], [x2 - ux * w * 1.6 + px * w, y2 - uy * w * 1.6 + py * w], [x2, y2], [x2 - ux * w * 1.6 - px * w, y2 - uy * w * 1.6 - py * w], [x1 - px * w, y1 - py * w]], c)
      + line([[x1 + ux * 2, y1 + uy * 2], [x2 - ux * w * 2.6, y2 - uy * w * 2.6]], d, 0.9)
      + line([[x1 + px * w * 2.5, y1 + py * w * 2.5], [x1 - px * w * 2.5, y1 - py * w * 2.5]], c, 2.8)
      + line([[x1, y1], [x1 - ux * 6, y1 - uy * 6]], c, 2.6) + cir(x1 - ux * 7, y1 - uy * 7, 1.8, c);
  };
  const dagger = (x1, y1, x2, y2, d, c = W) => {
    const [ux, uy] = dir(x1, y1, x2, y2), px = -uy, py = ux, w = 2.3;
    return poly([[x1 + px * w, y1 + py * w], [x2 - ux * 4 + px * w * 0.6, y2 - uy * 4 + py * w * 0.6], [x2, y2], [x1 - px * w, y1 - py * w]], c)
      + line([[x1 + px * 4.5, y1 + py * 4.5], [x1 - px * 4.5, y1 - py * 4.5]], c, 2.4) + line([[x1, y1], [x1 - ux * 5, y1 - uy * 5]], c, 2.4);
  };
  // 화살: 꼬리(x1,y1) → 촉(x2,y2)
  const arrow = (x1, y1, x2, y2, c = W, w = 2.2) => {
    const [ux, uy] = dir(x1, y1, x2, y2), px = -uy, py = ux;
    return line([[x1, y1], [x2 - ux * 5, y2 - uy * 5]], c, w)
      + poly([[x2, y2], [x2 - ux * 7 + px * 3.6, y2 - uy * 7 + py * 3.6], [x2 - ux * 7 - px * 3.6, y2 - uy * 7 - py * 3.6]], c)
      + line([[x1 + ux * 4, y1 + uy * 4], [x1 + px * 3, y1 + py * 3]], c, 1.8) + line([[x1 + ux * 4, y1 + uy * 4], [x1 - px * 3, y1 - py * 3]], c, 1.8);
  };
  // 석궁 볼트: 굵고 촉이 넓다
  const bolt = (x1, y1, x2, y2, c = W) => {
    const [ux, uy] = dir(x1, y1, x2, y2), px = -uy, py = ux;
    return line([[x1, y1], [x2 - ux * 5, y2 - uy * 5]], c, 3.4)
      + poly([[x2, y2], [x2 - ux * 6 + px * 4.6, y2 - uy * 6 + py * 4.6], [x2 - ux * 4, y2 - uy * 4], [x2 - ux * 6 - px * 4.6, y2 - uy * 6 - py * 4.6]], c)
      + poly([[x1, y1], [x1 + ux * 4 + px * 3.5, y1 + uy * 4 + py * 3.5], [x1 + ux * 5, y1 + uy * 5], [x1 + ux * 4 - px * 3.5, y1 + uy * 4 - py * 3.5]], c);
  };
  const flame = (cx, cy, s, c = W, inner) => {
    const f = (x, y, k) => `M${P(x, y - 12 * k)} C${P(x + 7 * k, y - 5 * k)} ${P(x + 9 * k, y + 3 * k)} ${P(x + 6 * k, y + 8 * k)} C${P(x + 3 * k, y + 11 * k)} ${P(x - 3 * k, y + 11 * k)} ${P(x - 6 * k, y + 8 * k)} C${P(x - 9 * k, y + 3 * k)} ${P(x - 4 * k, y - 3 * k)} ${P(x, y - 12 * k)} Z`;
    return fill(f(cx, cy, s), c) + (inner ? fill(f(cx, cy + 3.5 * s, s * 0.5), inner) : '');
  };
  const shuri = (cx, cy, r, d, c = W) => poly(starPts(cx, cy, 4, r, r * 0.32, -90), c) + cir(cx, cy, r * 0.2, d);
  const shieldD = (cx, cy, s) => `M${P(cx, cy - 14 * s)} L${P(cx + 11 * s, cy - 10 * s)} L${P(cx + 10 * s, cy + 2 * s)} Q${P(cx + 7 * s, cy + 11 * s)} ${P(cx, cy + 15 * s)} Q${P(cx - 7 * s, cy + 11 * s)} ${P(cx - 10 * s, cy + 2 * s)} L${P(cx - 11 * s, cy - 10 * s)} Z`;
  const shield = (cx, cy, s, c = W) => fill(shieldD(cx, cy, s), c);
  const zig = (pts, c = W, w = 2.6) => line(pts, c, w);
  const boltz = (x, y, s, c = W) => poly([[x + 2 * s, y - 12 * s], [x - 5 * s, y + 1 * s], [x, y + 1 * s], [x - 3 * s, y + 12 * s], [x + 6 * s, y - 2 * s], [x + 1 * s, y - 2 * s]], c);
  const cloud = (cx, cy, s, c = W) => cir(cx - 7 * s, cy + 2 * s, 5 * s, c) + cir(cx, cy - 2 * s, 7 * s, c) + cir(cx + 7 * s, cy + 2 * s, 5 * s, c) + ell(cx, cy + 4 * s, 11 * s, 4 * s, c);
  const snow = (cx, cy, r, c = W, w = 2.2) => { let s = ''; for (let k = 0; k < 3; k++) { const a = k * PI / 3, x = Math.cos(a) * r, y = Math.sin(a) * r; s += line([[cx - x, cy - y], [cx + x, cy + y]], c, w); for (const sg of [-1, 1]) { const bx = cx + sg * x * 0.62, by = cy + sg * y * 0.62, b = r * 0.3; s += line([[bx, by], [bx + Math.cos(a + sg * 2.4) * b, by + Math.sin(a + sg * 2.4) * b]], c, w * 0.7) + line([[bx, by], [bx + Math.cos(a - sg * 2.4) * b, by + Math.sin(a - sg * 2.4) * b]], c, w * 0.7); } } return s; };
  const crescent = (cx, cy, r, c = W) => fill(`M${P(cx, cy - r)} A${R(r)} ${R(r)} 0 1 0 ${P(cx, cy + r)} A${R(r * 0.72)} ${R(r * 0.82)} 0 1 1 ${P(cx, cy - r)} Z`, c);
  const heart = (cx, cy, s, c = W) => fill(`M${P(cx, cy + 9 * s)} C${P(cx - 12 * s, cy + 1 * s)} ${P(cx - 9 * s, cy - 9 * s)} ${P(cx, cy - 4 * s)} C${P(cx + 9 * s, cy - 9 * s)} ${P(cx + 12 * s, cy + 1 * s)} ${P(cx, cy + 9 * s)} Z`, c);
  const crown = (cx, cy, s, c = W) => poly([[cx - 10 * s, cy + 6 * s], [cx - 10 * s, cy - 5 * s], [cx - 5 * s, cy + 1 * s], [cx, cy - 8 * s], [cx + 5 * s, cy + 1 * s], [cx + 10 * s, cy - 5 * s], [cx + 10 * s, cy + 6 * s]], c);
  const fist = (cx, cy, s, d, c = W) => `<rect x="${R(cx - 8 * s)}" y="${R(cy - 7 * s)}" width="${R(16 * s)}" height="${R(15 * s)}" rx="${R(4 * s)}" fill="${c}"/>` + [-4, 0, 4].map(k => line([[cx + k * s, cy - 7 * s], [cx + k * s, cy - 1 * s]], d, 1.3)).join('') + `<rect x="${R(cx - 11 * s)}" y="${R(cy - 2 * s)}" width="${R(7 * s)}" height="${R(6 * s)}" rx="${R(3 * s)}" fill="${c}" stroke="${d}" stroke-width="1"/>`;
  const feather = (cx, cy, len, a, d, c = W) => rot(a, cx, cy, ell(cx, cy, len / 2, len * 0.17, c) + line([[cx - len / 2 - 3, cy], [cx + len / 2, cy]], d, 1.1) + [-0.2, 0.05, 0.3].map(k => line([[cx + len * k, cy], [cx + len * k - 3, cy - len * 0.15]], d, 0.8) + line([[cx + len * k, cy], [cx + len * k - 3, cy + len * 0.15]], d, 0.8)).join(''));
  const wing = (cx, cy, s, flip, d, c = W) => g(`translate(${cx} ${cy}) scale(${flip ? -s : s} ${s})`, fill('M0 0 C-4 -10 -14 -14 -18 -12 C-15 -9 -15 -7 -13 -6 C-17 -5 -18 -2 -17 0 C-14 -1 -12 -1 -11 0 C-13 2 -13 5 -11 7 C-7 5 -3 3 0 0 Z', c) + st('M-1 -1 L-14 -9 M-1 0 L-14 -3 M-2 1 L-11 5', d, 0.8));
  const bow = (cx, cy, h, c = W, w = 3) => st(`M${P(cx - 4, cy - h)} Q${P(cx + 10, cy)} ${P(cx - 4, cy + h)}`, c, w) + line([[cx - 4, cy - h], [cx - 4, cy + h]], c, 1);
  const person = (cx, cy, s, c = W) => cir(cx + 2 * s, cy - 11 * s, 3.6 * s, c) + st(`M${P(cx + 1 * s, cy - 7 * s)} L${P(cx - 2 * s, cy + 2 * s)} L${P(cx - 7 * s, cy + 9 * s)} M${P(cx - 2 * s, cy + 2 * s)} L${P(cx + 4 * s, cy + 9 * s)} M${P(cx, cy - 4 * s)} L${P(cx + 7 * s, cy - 6 * s)} M${P(cx, cy - 4 * s)} L${P(cx - 6 * s, cy)}`, c, 2.8 * s);
  const hood = (cx, cy, s, d, c = W) => fill(`M${P(cx, cy - 13 * s)} C${P(cx + 11 * s, cy - 12 * s)} ${P(cx + 12 * s, cy + 4 * s)} ${P(cx + 13 * s, cy + 13 * s)} L${P(cx - 13 * s, cy + 13 * s)} C${P(cx - 12 * s, cy + 4 * s)} ${P(cx - 11 * s, cy - 12 * s)} ${P(cx, cy - 13 * s)} Z`, c) + ell(cx, cy - 1 * s, 6 * s, 7 * s, d);
  const scimitar = (x1, y1, x2, y2, bend, c = W) => { const [ux, uy] = dir(x1, y1, x2, y2), px = -uy, py = ux, mx = (x1 + x2) / 2 + px * bend, my = (y1 + y2) / 2 + py * bend; return fill(`M${P(x1 + px * 2, y1 + py * 2)} Q${P(mx + px * 3, my + py * 3)} ${P(x2, y2)} Q${P(mx - px * 1, my - py * 1)} ${P(x1 - px * 2, y1 - py * 2)} Z`, c) + line([[x1, y1], [x1 - ux * 5, y1 - uy * 5]], c, 2.6) + line([[x1 + px * 4, y1 + py * 4], [x1 - px * 4, y1 - py * 4]], c, 2.2); };
  const slashArc = (cx, cy, r, a1, a2, c = W, w = 3) => { const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r, x2 = cx + Math.cos(a2) * r, y2 = cy + Math.sin(a2) * r; return st(`M${P(x1, y1)} A${R(r)} ${R(r)} 0 ${Math.abs(a2 - a1) > PI ? 1 : 0} 1 ${P(x2, y2)}`, c, w); };
  const speed = (x, ys, len, c = W) => ys.map(y => line([[x, y], [x + len, y]], c, 2, 'opacity=".75"')).join('');
  const target = (cx, cy, r, d, c = W) => ring(cx, cy, r, c, 2.4) + ring(cx, cy, r * 0.62, c, 2.2) + cir(cx, cy, r * 0.25, c);
  const ground = (y, c = W) => line([[5, y], [35, y]], c, 2.2);
  const drop = (cx, cy, s, c = W) => fill(`M${P(cx, cy - 9 * s)} Q${P(cx + 7 * s, cy)} ${P(cx + 6 * s, cy + 4 * s)} A${R(6 * s)} ${R(6 * s)} 0 0 1 ${P(cx - 6 * s, cy + 4 * s)} Q${P(cx - 7 * s, cy)} ${P(cx, cy - 9 * s)} Z`, c);
  const spiral = (cx, cy, r, c = W, w = 2.6) => st(`M${P(cx + r, cy)} A${R(r)} ${R(r)} 0 1 1 ${P(cx - r * 0.2, cy - r * 0.95)} M${P(cx + r * 0.55, cy)} A${R(r * 0.55)} ${R(r * 0.55)} 0 1 1 ${P(cx - r * 0.1, cy - r * 0.5)}`, c, w);
  const tornado = (cx, cy, s, c = W) => [[-9, 11, 1], [-3, 9, 0.85], [3, 7, 0.7], [9, 5, 0.55], [14, 3, 0.4]].map(([y, rx, o], i) => ell(cx + i * 0.8 * s, cy + y * s, rx * s, 2.3 * s, c, `opacity="${o + 0.3}"`)).join('');
  const pawPrint = (cx, cy, s, c = W) => ell(cx, cy + 3 * s, 6 * s, 5 * s, c) + [[-7, -4], [-2.5, -8], [2.5, -8], [7, -4]].map(([x, y]) => ell(cx + x * s, cy + y * s, 2.4 * s, 3 * s, c)).join('');
  const footPrint = (cx, cy, s, a, c = W) => rot(a, cx, cy, ell(cx, cy, 3.6 * s, 6.5 * s, c) + ell(cx, cy + 9.5 * s, 3 * s, 3 * s, c));
  const burst = (cx, cy, r1, r2, n, c = W) => poly(starPts(cx, cy, n, r1, r2), c);
  const sparkle = (cx, cy, r, c = W) => poly(starPts(cx, cy, 4, r, r * 0.3), c);
  const rays = (cx, cy, r1, r2, n, c = W, w = 2) => { let s = ''; for (let i = 0; i < n; i++) { const a = i * 2 * PI / n; s += line([[cx + Math.cos(a) * r1, cy + Math.sin(a) * r1], [cx + Math.cos(a) * r2, cy + Math.sin(a) * r2]], c, w); } return s; };
  const shard = (cx, cy, len, a, c = W, d) => rot(a, cx, cy, poly([[cx - len / 2, cy], [cx - len * 0.1, cy - 3.2], [cx + len / 2, cy], [cx - len * 0.1, cy + 3.2]], c) + (d ? line([[cx - len / 2, cy], [cx + len / 2, cy]], d, 0.8) : ''));
  const spear = (x1, y1, x2, y2, c = W, head = W) => { const [ux, uy] = dir(x1, y1, x2, y2), px = -uy, py = ux; return line([[x1, y1], [x2 - ux * 8, y2 - uy * 8]], c, 2.4) + poly([[x2, y2], [x2 - ux * 8 + px * 4, y2 - uy * 8 + py * 4], [x2 - ux * 11, y2 - uy * 11], [x2 - ux * 8 - px * 4, y2 - uy * 8 - py * 4]], head); };
  const rock = (cx, cy, s, c = W) => poly([[cx - 10 * s, cy + 5 * s], [cx - 8 * s, cy - 6 * s], [cx - 1 * s, cy - 10 * s], [cx + 8 * s, cy - 7 * s], [cx + 10 * s, cy + 3 * s], [cx + 4 * s, cy + 9 * s], [cx - 5 * s, cy + 9 * s]], c);
  const book = (cx, cy, s, d, c = W) => fill(`M${P(cx, cy - 6 * s)} Q${P(cx - 7 * s, cy - 10 * s)} ${P(cx - 14 * s, cy - 7 * s)} L${P(cx - 14 * s, cy + 9 * s)} Q${P(cx - 7 * s, cy + 6 * s)} ${P(cx, cy + 10 * s)} Q${P(cx + 7 * s, cy + 6 * s)} ${P(cx + 14 * s, cy + 9 * s)} L${P(cx + 14 * s, cy - 7 * s)} Q${P(cx + 7 * s, cy - 10 * s)} ${P(cx, cy - 6 * s)} Z`, c) + line([[cx, cy - 6 * s], [cx, cy + 10 * s]], d, 1.2) + [-1, 3].map(k => line([[cx - 11 * s, cy + k * s], [cx - 3 * s, cy + (k + 1) * s]], d, 1) + line([[cx + 3 * s, cy + (k + 1) * s], [cx + 11 * s, cy + k * s]], d, 1)).join('');
  const hexagram = (cx, cy, r, c = W, w = 1.8) => st(`M${starPts(cx, cy, 3, r, r, -90).filter((_, i) => i % 2 === 0).map(([x, y]) => P(x, y)).join(' L')} Z M${starPts(cx, cy, 3, r, r, 90).filter((_, i) => i % 2 === 0).map(([x, y]) => P(x, y)).join(' L')} Z`, c, w);
  const scope = (cx, cy, s, d, c = W) => `<rect x="${R(cx - 13 * s)}" y="${R(cy - 3.5 * s)}" width="${R(26 * s)}" height="${R(7 * s)}" rx="${R(3 * s)}" fill="${c}"/>` + `<rect x="${R(cx + 9 * s)}" y="${R(cy - 6 * s)}" width="${R(6 * s)}" height="${R(12 * s)}" rx="${R(2 * s)}" fill="${c}"/>` + `<rect x="${R(cx - 16 * s)}" y="${R(cy - 5 * s)}" width="${R(5 * s)}" height="${R(10 * s)}" rx="${R(2 * s)}" fill="${c}"/>` + line([[cx - 4 * s, cy + 3.5 * s], [cx - 4 * s, cy + 8 * s]], c, 2.4) + line([[cx + 4 * s, cy + 3.5 * s], [cx + 4 * s, cy + 8 * s]], c, 2.4) + ell(cx + 12 * s, cy, 1.4 * s, 3.5 * s, d);
  const crosshair = (cx, cy, r, c = W) => ring(cx, cy, r, c, 2.4) + line([[cx, cy - r - 4], [cx, cy - r * 0.35]], c, 2.4) + line([[cx, cy + r * 0.35], [cx, cy + r + 4]], c, 2.4) + line([[cx - r - 4, cy], [cx - r * 0.35, cy]], c, 2.4) + line([[cx + r * 0.35, cy], [cx + r + 4, cy]], c, 2.4);

  // ---------- 스킬별 문양 (d = 속성 진한 색, l = 속성 밝은 색) ----------
  const S = {
    // ===== 전사 1차 =====
    w_strike: d => sword(13, 7, 25, 29, d) + line([[22, 35], [32, 35]], W, 2) + line([[29, 30], [34, 27]], W, 1.8) + line([[31, 33], [35, 33]], W, 1.8),
    w_whirl: d => slashArc(20, 20, 14, -2.6, 2.2, W, 3) + poly([[8, 28], [4, 22], [11, 22]]) + sword(14, 26, 27, 13, d, 2.4),
    w_charge: d => fill('M12 30 Q10 12 26 10 Q33 10 33 16 L33 30 Z') + line([[16, 15], [28, 13]], d, 1.4) + line([[14, 21], [32, 19]], d, 1.4) + speed(3, [14, 21, 28], 7),
    w_iron: d => fill('M10 8 L16 6 Q20 10 24 6 L30 8 L31 20 Q31 30 20 34 Q9 30 9 20 Z') + line([[20, 10], [20, 32]], d, 1.6) + line([[12, 17], [28, 17]], d, 1.2) + line([[12, 23], [28, 23]], d, 1.2),
    w_mastery: d => sword(9, 31, 31, 9, d, 2.6) + sword(31, 31, 9, 9, d, 2.6),
    // ===== 대검사 → 파쇄자 → 천붕검제 =====
    w2a_cleave: d => sword(20, 5, 20, 27, d, 4) + ground(30) + zig([[20, 30], [24, 33], [28, 30], [33, 34]], W, 1.8) + zig([[20, 30], [15, 33], [11, 31], [7, 34]], W, 1.8),
    w2a_spin: (d, l) => slashArc(20, 20, 14, -2.8, 2.6, W, 3.2) + flame(20, 21, 0.75, W, l) + slashArc(20, 20, 9, 0.4, 3.6, W, 1.6),
    w2a_rage: (d, l) => fist(20, 26, 0.95, d) + flame(20, 9, 0.6, W, l) + flame(11, 13, 0.35) + flame(29, 13, 0.35),
    w2a_mastery: d => sword(20, 34, 20, 4, d, 4.6),
    w2a_blade: (d, l) => crescent(23, 20, 12) + speed(3, [14, 20, 26], 8) + flame(28, 20, 0.35, l),
    w2a_endure: d => fill('M8 18 H32 L28 23 H24 V30 H30 V34 H10 V30 H16 V23 H12 Z') + fill('M8 18 Q4 18 4 14 H14 V18 Z'),
    w3a_crush: d => rock(20, 22, 1.4) + zig([[14, 10], [19, 18], [15, 24], [21, 32]], d, 1.6) + zig([[19, 18], [27, 20], [30, 27]], d, 1.4),
    w3a_quake: () => ground(30) + st('M8 30 A12 12 0 0 1 32 30', W, 2.4) + st('M3 30 A17 15 0 0 1 37 30', W, 1.6, 'opacity=".7"') + st('M13 30 A7 7 0 0 1 27 30', W, 2.4) + poly([[20, 24], [17, 30], [23, 30]]),
    w3a_rush: (d, l) => sword(10, 28, 34, 24, d, 2.6) + flame(9, 22, 0.45) + flame(15, 20, 0.35, l) + speed(2, [31, 34], 10),
    w3a_will: d => fist(20, 22, 1.25, d) + line([[20, 35], [20, 31]], W, 3),
    w3a_roar: d => fill('M6 16 L14 14 L28 7 L28 33 L14 26 L6 24 Z') + st('M31 13 Q35 20 31 27', W, 2.2) + st('M34 9 Q40 20 34 31', W, 1.8, 'opacity=".7"') + line([[10, 16], [10, 24]], d, 1.4),
    w3a_meteor: (d, l) => ground(34) + flame(20, 23, 0.95, W, l) + [10, 20, 30].map((x, k) => line([[x, 2 + k % 2 * 2], [x, 8 + k % 2 * 2]], W, 2)).join('') + line([[7, 33], [4, 29]], W, 1.8) + line([[33, 33], [36, 29]], W, 1.8),
    w4a_heaven: d => cloud(20, 6, 0.75) + sword(20, 9, 20, 33, d, 4.2) + rays(20, 33, 4, 7, 6, W, 1.6),
    w4a_meteor: d => sword(8, 4, 15, 24, d, 2) + sword(18, 2, 24, 22, d, 2) + sword(28, 6, 33, 26, d, 2) + flame(15, 31, 0.3) + flame(25, 30, 0.3) + flame(34, 33, 0.25),
    w4a_awake: d => [-48, -24, 0, 24, 48].map(a => rot(a, 20, 33, sword(20, 32, 20, 12, d, 1.8))).join(''),
    w4a_mastery: d => sword(20, 35, 20, 13, d, 3.2) + sparkle(20, 7, 6),
    w4a_final: (d, l) => burst(20, 20, 17, 8, 8, W, 'opacity=".55"') + sword(20, 34, 20, 6, d, 3.6) + cir(20, 20, 3, l),
    // ===== 방패기사 → 철벽기사 → 불멸의 수호자 =====
    w2b_bash: d => shield(17, 21, 0.95) + line([[17, 13], [17, 31]], d, 2) + sparkle(31, 9, 4.5) + sparkle(34, 19, 3) + sparkle(28, 30, 3.2),
    w2b_wave: () => ell(20, 30, 4, 1.8) + `<ellipse cx="20" cy="30" rx="9" ry="3.5" fill="none" stroke="${W}" stroke-width="2.4"/><ellipse cx="20" cy="29" rx="15" ry="6.5" fill="none" stroke="${W}" stroke-width="2"/><ellipse cx="20" cy="27" rx="18" ry="10" fill="none" stroke="${W}" stroke-width="1.4" opacity=".6"/>` + line([[20, 4], [20, 24]], W, 2.2),
    w2b_oath: d => shield(22, 19, 0.95) + fill('M9 34 L9 24 Q9 21 11 21 L11 17 Q12 15.5 13 17 V21 V15 Q14 13.5 15 15 V21 V16 Q16 14.5 17 16 V22 Q19 20 20 22 L16 34 Z', W, `stroke="${'#00000040'}" stroke-width="1"`),
    w2b_mastery: d => shield(20, 20, 1.05) + poly(starPts(20, 19, 5, 7, 3), d),
    w2b_throw: d => cir(24, 20, 10) + cir(24, 20, 4, d) + ring(24, 20, 7.5, d, 1) + st('M4 13 Q10 9 13 13', W, 2) + st('M3 22 Q8 18 12 21', W, 2) + st('M5 30 Q10 26 13 29', W, 2),
    w2b_vigor: d => heart(20, 20, 1.3) + line([[20, 15], [20, 25]], d, 3) + line([[15, 20], [25, 20]], d, 3),
    w3b_wall: d => fill('M26 6 Q34 20 26 34 L20 34 Q27 20 20 6 Z') + line([[24, 12], [24, 28]], d, 1.4) + speed(3, [12, 20, 28], 12),
    w3b_hammer: d => rays(20, 13, 12, 16, 8, W, 1.6) + `<rect x="10" y="7" width="20" height="11" rx="2" fill="${W}"/>` + line([[20, 18], [20, 35]], W, 3.4) + line([[13, 12.5], [27, 12.5]], d, 1.2),
    w3b_sanct: () => `<ellipse cx="20" cy="31" rx="15" ry="4.5" fill="none" stroke="${W}" stroke-width="2.4"/>` + [10, 20, 30].map(x => line([[x, 29], [x, x === 20 ? 9 : 15]], W, 2.4, 'opacity=".8"')).join('') + line([[20, 5], [20, 13]], W, 2.4) + line([[16, 8], [24, 8]], W, 2.4),
    w3b_spirit: d => fill('M6 34 V14 H10 V10 H14 V14 H18 V10 H22 V14 H26 V10 H30 V14 H34 V34 Z') + `<rect x="16" y="24" width="8" height="10" rx="4" fill="${d}"/>`,
    w3b_aura: d => ring(20, 20, 15, W, 2, 'stroke-dasharray="4 3"') + shield(20, 20, 0.62) + ring(20, 20, 11, W, 1, 'opacity=".5"'),
    w3b_light: d => rays(29, 11, 6, 10, 6, W, 1.4) + spear(6, 34, 31, 9),
    w4b_strike: d => shield(16, 22, 0.8) + sword(31, 33, 11, 7, d, 2.4),
    w4b_judge: () => [10, 20, 30].map((x, i) => spear(x, 4 + i % 2 * 3, x, 30 + (i % 2) * 2)).join('') + ground(34),
    w4b_awake: d => wing(13, 20, 0.8, false, d) + wing(27, 20, 0.8, true, d) + shield(20, 21, 0.62) + line([[20, 14], [20, 28]], d, 1.5),
    w4b_pride: d => crown(20, 9, 0.7) + shield(20, 24, 0.72) + poly(starPts(20, 23, 5, 4.5, 2), d),
    w4b_final: (d, l) => rays(20, 20, 11, 18, 12, W, 1.6) + `<rect x="17" y="6" width="6" height="28" rx="2" fill="${W}"/><rect x="9" y="14" width="22" height="6" rx="2" fill="${W}"/>` + cir(20, 17, 2.5, l),
    // ===== 궁수 1차 =====
    a_double: () => arrow(5, 15, 34, 9) + arrow(5, 31, 34, 25),
    a_rain: () => [[11, 4], [20, 2], [29, 5]].map(([x, y]) => arrow(x, y, x - 3, y + 24)).join('') + ground(35),
    a_back: () => bow(26, 20, 13) + arrow(32, 20, 5, 20) + st('M14 6 Q22 2 30 7', W, 1.8) + poly([[30, 3], [33, 8], [27, 9]]),
    a_hawk: d => feather(20, 20, 30, -50, d),
    a_mastery: () => bow(16, 20, 15, W, 3.6) + st('M12 5 Q14 4 15 5 M12 35 Q14 36 15 35', W, 1.6),
    // ===== 사냥꾼 → 매의 사수 → 천궁 =====
    a2a_triple: () => arrow(5, 21, 35, 9) + arrow(5, 21, 35, 21) + arrow(5, 21, 35, 33),
    a2a_gale: () => arrow(4, 20, 36, 20, W, 2.4) + st('M8 13 Q12 27 16 13 Q20 27 24 13 Q28 27 31 14', W, 1.6, 'opacity=".75"'),
    a2a_bless: d => fill('M14 8 H22 V24 L33 27 Q35 33 30 33 H12 Z') + wing(13, 14, 0.6, false, d),
    a2a_instinct: () => pawPrint(20, 22, 1.4),
    a2a_burst: () => [[4, 9], [10, 15], [4, 21], [10, 27], [4, 33]].map(([x, y]) => arrow(x, y, x + 22, y - 2, W, 1.8)).join(''),
    a2a_swift: () => st('M4 12 Q20 4 34 12', W, 2.4) + st('M3 21 Q20 13 36 21', W, 2.8) + st('M4 30 Q20 22 34 30', W, 2.4) + poly([[36, 21], [30, 17], [31, 24]]),
    a3a_hawk: d => fill('M20 15 C14 8 6 7 2 10 C7 12 10 15 12 18 C8 18 5 21 4 24 C10 22 15 22 18 24 L20 32 L22 24 C25 22 30 22 36 24 C35 21 32 18 28 18 C30 15 33 12 38 10 C34 7 26 8 20 15 Z') + cir(20, 14, 3),
    a3a_storm: () => tornado(18, 22, 1) + arrow(16, 10, 34, 6, W, 1.8) + arrow(10, 28, 30, 33, W, 1.8),
    a3a_evade: () => st('M28 10 A11 11 0 1 0 31 22', W, 2.6) + poly([[28, 5], [33, 11], [26, 13]]) + arrow(18, 20, 4, 20, W, 2),
    a3a_eye: d => fill('M8 30 C8 16 14 8 24 8 C30 8 34 12 34 16 L38 19 L33 21 C31 26 26 28 22 28 L18 34 Z') + fill('M33 16 L38 19 L33 21 Z', d) + st('M14 18 Q20 15 26 17', d, 1.2),
    a3a_focus: d => ring(20, 20, 13, W, 2) + ring(20, 20, 7, W, 1.6) + feather(13, 13, 14, 45, d) + cir(20, 20, 2.2),
    a3a_dive: () => arrow(9, 3, 26, 33, W, 2.6) + line([[4, 8], [10, 18]], W, 1.6) + line([[12, 4], [18, 14]], W, 1.6) + ground(36),
    a4a_volley: (d, l) => rays(17, 20, 13, 17, 10, W, 1.4) + bow(17, 20, 13, W, 3.2) + arrow(10, 20, 34, 20, W, 2),
    a4a_rain: () => st('M5 12 Q20 -2 35 12', W, 2.6) + line([[5, 12], [35, 12]], W, 1.2, 'opacity=".6"') + [10, 20, 30].map(x => arrow(x, 14, x, 34, W, 1.8)).join(''),
    a4a_awake: d => wing(18, 22, 1.05, false, d) + wing(22, 22, 1.05, true, d),
    a4a_mastery: d => target(18, 22, 12, d) + arrow(36, 4, 19, 21, W, 2),
    a4a_final: (d, l) => cloud(20, 9, 0.9) + arrow(10, 15, 7, 33, W, 1.8) + arrow(30, 15, 27, 33, W, 1.8) + boltz(19, 25, 0.75),
    // ===== 석궁수 → 저격수 → 섬광의 저격왕 =====
    a2b_pierce: d => `<rect x="17" y="12" width="7" height="16" rx="1.5" fill="${W}" opacity=".55"/>` + bolt(3, 20, 37, 20),
    a2b_spread: () => [-30, -15, 0, 15, 30].map(a => rot(a, 7, 20, cir(18, 20, 2.4) + cir(27, 20, 2.8) + line([[9, 20], [14, 20]], W, 1.4, 'opacity=".6"'))).join('') + cir(6, 20, 3),
    a2b_aim: () => crosshair(20, 20, 11),
    a2b_mastery: d => line([[4, 22], [32, 22]], W, 4) + st('M24 8 Q30 22 24 36', W, 3.2) + line([[24, 8], [24, 36]], W, 1) + `<rect x="4" y="22" width="7" height="10" rx="2" fill="${W}"/>` + bolt(10, 18, 34, 18),
    a2b_net: () => bolt(8, 24, 36, 24) + st('M30 16 Q18 4 6 14', W, 2) + poly([[3, 12], [10, 10], [8, 17]]),
    a2b_steady: d => `<rect x="4" y="15" width="32" height="10" rx="5" fill="${W}"/>` + ell(20, 20, 4, 3, d) + line([[14, 15], [14, 25]], d, 1) + line([[26, 15], [26, 25]], d, 1) + line([[10, 25], [7, 34]], W, 2.4) + line([[30, 25], [33, 34]], W, 2.4),
    a3b_snipe: () => line([[3, 22], [30, 22]], W, 1.6, 'stroke-dasharray="3 2"') + crosshair(31, 22, 5) + bolt(3, 12, 20, 12),
    a3b_blast: (d, l) => bolt(3, 26, 24, 18) + burst(27, 16, 10, 4.5, 8) + cir(27, 16, 3, l),
    a3b_shadow: () => op(0.85, cir(12, 22, 7) + cir(19, 17, 8) + cir(10, 30, 5) + cir(20, 28, 6)) + bolt(16, 22, 38, 14),
    a3b_focus: d => scope(20, 20, 1, d),
    a3b_mark: d => ring(20, 28, 7, W, 2.4) + cir(20, 28, 2.4) + poly([[12, 6], [28, 6], [20, 17]]) + line([[20, 17], [20, 21]], W, 2),
    a3b_mine: d => ground(32) + fill('M8 32 Q8 20 20 20 Q32 20 32 32 Z') + [[12, 22], [20, 19], [28, 22]].map(([x, y]) => line([[x, y], [x + (x - 20) * 0.35, y - 6]], W, 2.4)).join('') + cir(20, 27, 2.4, d),
    a4b_flash: () => `<rect x="2" y="16" width="36" height="8" rx="4" fill="${W}"/>` + line([[4, 11], [30, 11]], W, 1.4, 'opacity=".7"') + line([[8, 29], [36, 29]], W, 1.4, 'opacity=".7"') + sparkle(33, 20, 8),
    a4b_barrage: () => ground(32) + [7, 14, 21, 28, 35].map((x, i) => bolt(x - 2, 6 + (i % 2) * 4, x, 31)).join(''),
    a4b_awake: d => crown(20, 12, 0.85) + crosshair(20, 27, 6),
    a4b_mastery: d => ring(20, 20, 15, W, 2) + ring(20, 20, 10, W, 2) + ring(20, 20, 5, W, 2) + cir(20, 20, 2.2),
    a4b_final: (d, l) => burst(20, 20, 18, 9, 10, W, 'opacity=".6"') + crosshair(20, 20, 8) + cir(20, 20, 3, l),
    // ===== 마법사 1차 =====
    m_bolt: (d, l) => cir(22, 21, 10) + cir(22, 21, 6, l) + sparkle(22, 21, 5) + speed(2, [16, 26], 7),
    m_burst: () => ring(20, 20, 15, W, 2.2) + ring(20, 20, 11, W, 1.2) + hexagram(20, 20, 10),
    m_blink: () => line([[4, 28], [24, 16]], W, 2, 'stroke-dasharray="2.5 3"') + poly(starPts(28, 13, 5, 9, 4)) + cir(5, 29, 2.2),
    m_shield: (d, l) => ring(20, 20, 14, W, 2.6) + cir(20, 20, 11, W, 'opacity=".25"') + poly(starPts(20, 21, 5, 7, 3)) + ell(14, 13, 3, 1.6, W, 'opacity=".8"'),
    m_flow: d => drop(13, 18, 1) + drop(27, 22, 1, W) + st('M16 32 Q24 37 30 31', W, 2) + poly([[31, 27], [33, 33], [27, 33]]) + st('M24 8 Q16 3 10 9', W, 2) + poly([[9, 13], [7, 7], [13, 7]]),
    // ===== 화염술사 → 업화술사 → 화염군주 =====
    m2a_fireball: (d, l) => cir(25, 20, 9) + cir(25, 20, 5, l) + fill('M17 13 Q8 15 2 12 Q8 19 3 26 Q10 24 17 27 Z'),
    m2a_explode: (d, l) => burst(20, 21, 17, 8, 7) + flame(20, 22, 0.55, l),
    m2a_veil: (d, l) => [8, 16, 24, 32].map((x, i) => flame(x, 22 - (i % 2) * 3, 0.75 + (i % 2) * 0.12, W, l)).join('') + ground(34),
    m2a_mastery: (d, l) => fill('M8 10 H30 V30 H10 Q6 30 6 26 V12 Q6 10 8 10 Z') + cir(30, 10, 3) + line([[12, 30], [12, 34]], W, 2) + flame(19, 21, 0.55, d),
    m2a_meteor: (d, l) => fill('M33 4 Q24 12 18 20 L24 25 Q30 16 36 7 Z', W, 'opacity=".6"') + rock(15, 26, 0.85) + cir(15, 26, 3.2, l),
    m2a_wisdom: d => poly([[20, 8], [27, 18], [20, 30], [13, 18]]) + line([[13, 18], [27, 18]], d, 1) + line([[20, 8], [20, 30]], d, 1) + line([[6, 30], [6, 12]], W, 2) + poly([[6, 8], [2, 14], [10, 14]]) + line([[34, 30], [34, 16]], W, 2) + poly([[34, 12], [30, 18], [38, 18]]),
    m3a_inferno: (d, l) => flame(20, 21, 1.35) + flame(20, 24, 0.75, d) + flame(20, 27, 0.35, l),
    m3a_pillar: (d, l) => ground(35) + [[10, 0.6], [20, 0.95], [30, 0.6]].map(([x, s]) => `<rect x="${x - 3.5}" y="${34 - 26 * s}" width="7" height="${26 * s}" rx="3" fill="${W}"/>` + flame(x, 33 - 26 * s, 0.4)).join(''),
    m3a_storm: (d, l) => tornado(18, 22, 1) + flame(28, 10, 0.4, l) + flame(10, 30, 0.35),
    m3a_heart: (d, l) => heart(20, 23, 1.15) + flame(20, 9, 0.5, W, l) + flame(20, 22, 0.45, d),
    m3a_flare: (d, l) => `<ellipse cx="20" cy="7" rx="9" ry="3" fill="none" stroke="${W}" stroke-width="2.2"/>` + flame(20, 24, 1.05, W, l),
    m3a_ring: (d, l) => `<ellipse cx="20" cy="28" rx="15" ry="5.5" fill="none" stroke="${W}" stroke-width="3"/>` + [[6, 27], [13, 23], [20, 22], [27, 23], [34, 27], [13, 33], [27, 33]].map(([x, y]) => flame(x, y - 3, 0.38)).join(''),
    m4a_lance: (d, l) => spear(5, 35, 27, 13, W) + flame(29, 10, 0.75, W, l),
    m4a_blaze: (d, l) => cloud(20, 8, 0.85) + [[9, 22], [19, 27], [29, 22], [14, 33], [26, 34]].map(([x, y]) => flame(x, y, 0.35)).join(''),
    m4a_awake: (d, l) => crown(20, 25, 1.1) + [10, 20, 30].map((x, i) => flame(x, i === 1 ? 10 : 14, i === 1 ? 0.55 : 0.4, W, l)).join(''),
    m4a_flame: (d, l) => `<rect x="15" y="18" width="10" height="16" rx="2" fill="${W}"/>` + ell(20, 34, 9, 2) + line([[20, 18], [20, 15]], d, 1.4) + flame(20, 10, 0.5, W, l),
    m4a_final: (d, l) => cir(20, 15, 9) + cir(20, 15, 5, l) + rays(20, 15, 11, 15, 10, W, 1.8) + [12, 20, 28].map(x => line([[x, 27], [x, 34]], W, 2.2)).join('') + [12, 20, 28].map(x => poly([[x, 37], [x - 3, 33], [x + 3, 33]])).join(''),
    // ===== 빙뢰술사 → 폭풍술사 → 천둥의 현자 =====
    m2b_beam: () => cir(7, 20, 5) + `<rect x="10" y="17" width="26" height="6" rx="3" fill="${W}" opacity=".85"/>` + snow(30, 20, 6, W, 1.6).replace(/#ffffff/g, '#bfe6ff'),
    m2b_chain: () => zig([[5, 8], [14, 20], [10, 22], [21, 32]], W, 2.6) + zig([[21, 32], [27, 18], [24, 17], [34, 7]], W, 2.6) + cir(5, 8, 3) + cir(21, 32, 3) + cir(34, 7, 3),
    m2b_armor: d => poly([[20, 4], [33, 11], [33, 27], [20, 36], [7, 27], [7, 11]]) + line([[20, 4], [20, 36]], d, 1) + line([[7, 11], [33, 27]], d, 1) + line([[33, 11], [7, 27]], d, 1),
    m2b_mastery: () => snow(15, 16, 10) + boltz(28, 25, 0.75),
    m2b_shard: d => shard(14, 13, 18, -15, W, d) + shard(22, 22, 20, 0, W, d) + shard(14, 30, 16, 12, W, d),
    m2b_focus: d => poly([[20, 12], [27, 20], [20, 28], [13, 20]]) + line([[13, 20], [27, 20]], d, 1) + [[4, 6], [36, 6], [4, 34], [36, 34]].map(([x, y]) => line([[x, y], [x + (20 - x) * 0.45, y + (20 - y) * 0.45]], W, 2)).join(''),
    m3b_thunder: () => cloud(20, 11, 1) + boltz(16, 27, 0.7) + boltz(27, 29, 0.55),
    m3b_freeze: d => `<rect x="9" y="9" width="22" height="22" rx="3" fill="${W}"/>` + zig([[9, 16], [17, 20], [14, 26], [22, 31]], d, 1.4) + zig([[17, 20], [25, 14], [31, 17]], d, 1.4) + [[5, 6], [35, 8], [34, 34], [5, 33]].map(([x, y]) => shard(x, y, 6, 45)).join(''),
    m3b_spear: d => rot(-40, 20, 20, poly([[2, 20], [8, 17], [30, 18], [38, 20], [30, 22], [8, 23]]) + line([[4, 20], [34, 20]], d, 0.9)) + snow(9, 30, 4, W, 1.4),
    m3b_eye: () => spiral(20, 20, 13, W, 2.6) + ring(20, 20, 3, W, 2),
    m3b_storm: () => st('M8 12 A13 13 0 0 1 32 12', W, 2.4) + poly([[34, 15], [28, 13], [33, 8]]) + st('M32 28 A13 13 0 0 1 8 28', W, 2.4) + poly([[6, 25], [12, 27], [7, 32]]) + poly(starPts(20, 20, 4, 7, 2.5)),
    m3b_bolt: () => ground(34) + poly([[23, 2], [11, 19], [18, 19], [13, 34], [29, 14], [21, 14], [27, 2]]),
    m4b_judge: () => `<rect x="13" y="2" width="14" height="32" rx="2" fill="${W}" opacity=".45"/>` + zig([[22, 2], [17, 13], [23, 17], [16, 34]], W, 3) + ground(35) + line([[8, 33], [5, 28]], W, 1.6) + line([[32, 33], [35, 28]], W, 1.6),
    m4b_zero: () => snow(20, 20, 15, W, 2.6) + cir(20, 20, 3),
    m4b_awake: () => ring(20, 20, 13, W, 2.4) + boltz(20, 7, 0.5) + boltz(20, 33, 0.5) + shard(7, 20, 9, 90) + shard(33, 20, 9, 90) + cir(20, 20, 4),
    m4b_wisdom: d => book(20, 22, 1.1, d) + sparkle(20, 7, 4.5),
    m4b_final: (d, l) => cloud(20, 8, 0.95) + boltz(10, 25, 0.6) + boltz(20, 26, 0.75) + boltz(30, 25, 0.6) + burst(20, 35, 6, 2.5, 6),
    // ===== 도적 1차 =====
    t_double: d => dagger(9, 31, 30, 10, d) + dagger(31, 31, 10, 10, d),
    t_star: d => rot(15, 20, 20, shuri(20, 20, 15, d)),
    t_shadow: () => cir(25, 10, 4.5) + st('M23 15 L17 25 L11 30 M23 15 L27 25 L33 31 M21 19 L30 17', W, 3.2) + st('M4 18 h7 M2 24 h8 M5 30 h5', W, 2, 'opacity=".6"'),
    t_venom: d => dagger(8, 32, 28, 12, d) + drop(30, 22, 0.8) + drop(25, 31, 0.55),
    t_mastery: d => dagger(10, 32, 31, 9, d),
    // ===== 암살자 → 그림자추적자 → 야천 =====
    t2a_triple: d => shuri(9, 26, 6.5, d) + shuri(20, 14, 7.5, d) + shuri(31, 24, 6.5, d),
    t2a_vital: d => dagger(6, 34, 22, 18, d) + ring(28, 12, 7, W, 2) + line([[24, 8], [32, 16]], W, 2) + line([[32, 8], [24, 16]], W, 2),
    t2a_prep: d => hood(20, 21, 1.1, d),
    t2a_mastery: d => shuri(15, 16, 10, d) + shuri(26, 25, 10, d),
    t2a_shadow: d => op(0.55, crescent(16, 20, 13)) + dagger(10, 30, 32, 9, d),
    t2a_swift: () => fill('M4 14 Q16 14 22 20 L34 9 L30 20 L38 24 L24 25 Q16 31 6 29 Q14 24 15 21 Q10 18 4 14 Z'),
    t3a_shadowstar: d => shuri(15, 23, 10, d) + st('M27 8 Q37 18 28 30', W, 2.2) + poly([[24, 32], [31, 26], [32, 34]]),
    t3a_flash: () => line([[3, 22], [37, 16]], W, 3.2) + line([[5, 28], [30, 24]], W, 1.6, 'opacity=".6"') + line([[9, 12], [33, 9]], W, 1.6, 'opacity=".6"') + sparkle(35, 16, 4),
    t3a_storm: d => ring(20, 20, 11, W, 1.6, 'stroke-dasharray="3 3"') + [0, 90, 180, 270].map(a => shuri(20 + Math.cos(a * PI / 180) * 11, 20 + Math.sin(a * PI / 180) * 11, 5.5, d)).join(''),
    t3a_instinct: () => footPrint(13, 22, 1, -12) + op(0.7, footPrint(27, 13, 0.9, 12)),
    t3a_veil: d => fill('M8 6 Q20 2 32 6 L34 34 Q28 30 26 34 Q22 30 20 34 Q16 30 14 34 Q10 30 6 34 Z') + line([[14, 8], [13, 30]], d, 1.2) + line([[26, 8], [27, 30]], d, 1.2),
    t3a_rain: d => [[10, 9], [22, 6], [31, 14], [15, 24], [27, 29]].map(([x, y]) => line([[x + 4, y - 8], [x, y]], W, 1.4, 'opacity=".6"') + shuri(x, y, 4.5, d)).join(''),
    t4a_night: () => op(0.4, person(10, 22, 0.8)) + op(0.7, person(18, 22, 0.9)) + person(27, 21, 1),
    t4a_dark: d => crescent(17, 18, 13) + line([[6, 34], [36, 6]], W, 1.8, 'opacity=".8"'),
    t4a_awake: d => op(0.45, hood(15, 22, 0.85, d)) + hood(24, 20, 0.95, d),
    t4a_mastery: d => poly(starPts(20, 21, 5, 15, 6.5), W) + poly(starPts(20, 21, 5, 10, 4.3), d),
    t4a_final: d => crescent(15, 20, 13) + [[10, 8, 34, 30], [6, 28, 32, 6], [20, 4, 30, 36]].map(([a, b, c2, e]) => line([[a, b], [c2, e]], W, 1.6)).join(''),
    // ===== 쌍검사 → 칼날무희 → 천인검무 =====
    t2b_dance: () => scimitar(8, 32, 33, 7, 5) + scimitar(32, 32, 7, 7, -5) + slashArc(20, 20, 17, -0.6, 0.6, W, 1.4),
    t2b_whirl: () => spiral(20, 20, 13, W, 2.2) + [0, 120, 240].map(a => rot(a, 20, 20, poly([[20, 3], [24, 9], [20, 8]]))).join(''),
    t2b_step: d => fill('M17 6 Q22 6 22 12 L23 24 Q24 30 30 31 Q32 34 28 35 L16 34 Q13 33 14 28 Z') + ell(31, 12, 3, 1.6, W, 'transform="rotate(30 31 12)"') + ell(8, 18, 3, 1.6, W, 'transform="rotate(-30 8 18)"') + ell(32, 22, 2.4, 1.3),
    t2b_mastery: d => sword(14, 34, 14, 6, d, 2.4) + sword(26, 34, 26, 6, d, 2.4),
    t2b_toss: (d, l) => dagger(14, 26, 34, 12, d) + drop(10, 22, 0.55) + drop(5, 30, 0.45) + drop(13, 34, 0.35),
    t2b_venom: d => fill('M16 5 H24 V13 Q33 17 33 26 Q33 36 20 36 Q7 36 7 26 Q7 17 16 13 Z') + cir(17, 26, 3, d) + cir(24, 22, 2, d) + cir(22, 30, 1.6, d),
    t3b_storm: () => [10, 18, 26].map((y, i) => st(`M4 ${y} Q20 ${y - 8} 36 ${y}`, W, 2 - i * 0.2)).join('') + [[12, 30], [28, 32], [20, 34]].map(([x, y]) => rot(-20, x, y, poly([[x - 4, y], [x + 4, y - 1.5], [x + 4, y + 1.5]]))).join(''),
    t3b_mist: () => op(0.6, cir(12, 26, 7) + cir(22, 22, 8) + cir(30, 28, 6)) + line([[4, 10], [36, 30]], W, 2.4) + line([[36, 10], [4, 30]], W, 2.4),
    t3b_blades: d => rot(-20, 13, 18, sword(13, 30, 13, 6, d, 2)) + rot(20, 27, 22, sword(27, 34, 27, 10, d, 2)) + sparkle(20, 7, 3.5) + sparkle(33, 8, 2.5),
    t3b_rhythm: d => fill('M14 8 L30 4 V26') + st('M14 8 L30 4 V26 M14 8 V30', W, 2.6) + ell(10, 30, 5, 4) + ell(26, 26, 5, 4) + dagger(27, 36, 38, 25, d),
    t3b_tempo: d => poly([[12, 34], [28, 34], [23, 6], [17, 6]]) + line([[20, 30], [27, 10]], d, 2) + cir(25.5, 14, 2.6, d),
    t3b_rain: d => [[9, 4], [20, 10], [31, 3]].map(([x, y]) => sword(x, y, x, y + 20, d, 1.8)).join('') + ground(36),
    t4b_thousand: d => [0, 45, 90, 135, 180, 225, 270, 315].map(a => rot(a, 20, 20, poly([[20, 2], [22, 11], [20, 13], [18, 11]]))).join('') + cir(20, 20, 4),
    t4b_tempest: () => tornado(20, 22, 1.05) + [[8, 10], [32, 14], [10, 32]].map(([x, y]) => rot(35, x, y, poly([[x - 5, y], [x + 5, y - 1.5], [x + 5, y + 1.5]]))).join(''),
    t4b_awake: d => [0, 72, 144, 216, 288].map(a => rot(a, 20, 20, fill('M20 19 Q24 12 20 3 Q16 12 20 19 Z'))).join('') + cir(20, 20, 4, d),
    t4b_mastery: d => fill('M4 28 Q12 26 14 32 Q16 22 20 20 Q24 22 26 32 Q28 26 36 28 Q32 36 20 36 Q8 36 4 28 Z') + sword(13, 24, 27, 4, d, 1.8) + sword(27, 24, 13, 4, d, 1.8),
    t4b_final: () => burst(20, 20, 17, 6, 12) + [[4, 10, 36, 30], [4, 30, 36, 10]].map(([a, b, c2, e]) => line([[a, b], [c2, e]], W, 2)).join(''),
  };
  G.SKILL_GLYPH = S;

  // ---------- 나쁜 효과 아이콘 ----------
  const DEBUFF = {
    poison: { name: '독', bg: ['#c58cf0', '#4a1a6a'], g: d => drop(20, 21, 1.5) + cir(17, 24, 3, d) + cir(23, 18, 1.8, d) },
    slow: { name: '둔화', bg: ['#9ac8ff', '#2a3a6a'], g: d => ell(16, 29, 13, 4) + spiral(18, 19, 9, W, 3) + fill('M26 28 Q30 20 34 20 Q36 22 33 24 L31 30 Z') },
    despair: { name: '절망', bg: ['#a0a0b8', '#2a2a3a'], g: d => heart(20, 21, 1.4) + zig([[20, 11], [17, 18], [22, 22], [18, 30]], d, 2) },
    curse: { name: '저주', bg: ['#d090ff', '#4a1460'], g: d => fill('M16 5 H24 V13 Q33 17 33 26 Q33 36 20 36 Q7 36 7 26 Q7 17 16 13 Z') + zig([[18, 14], [22, 21], [17, 26], [21, 34]], d, 2) + line([[6, 6], [34, 34]], '#ff5050', 3) },
    silence: { name: '침묵', bg: ['#ffb0c0', '#6a1a2a'], g: d => ell(20, 22, 12, 6) + line([[10, 22], [30, 22]], d, 2) + line([[6, 10], [34, 34]], '#ff5050', 3) + line([[34, 10], [6, 34]], '#ff5050', 3) },
    invert: { name: '좌우 반전', bg: ['#ffd080', '#6a3a10'], g: () => line([[6, 14], [32, 14]], W, 3) + poly([[36, 14], [29, 9], [29, 19]]) + line([[34, 26], [8, 26]], W, 3) + poly([[4, 26], [11, 21], [11, 31]]) },
  };
  G.DEBUFF_ICON = DEBUFF;
})();
