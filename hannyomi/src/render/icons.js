'use strict';
// 스킬/아이템 아이콘을 SVG로 직접 그린다 (외부 이미지 없음)
G.Icons = (function () {
  const cache = {}, imgCache = {};
  const EL = {
    fire: ['#ffad5c', '#b8321e'], wind: ['#8ef09a', '#1f7a44'], arcane: ['#9ec0ff', '#3236a8'],
    shadow: ['#c4a0ff', '#36195a'], poison: ['#c4f57a', '#2f5a14'], earth: ['#e3c28e', '#6a4a2a'], holy: ['#fff3b0', '#c08a10'],
  };
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  }
  const url = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const W = '#ffffff';

  function starPoints(cx, cy, n, r1, r2) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? r2 : r1, a = Math.PI * i / n - Math.PI / 2;
      pts.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1));
    }
    return pts.join(' ');
  }

  // ---------- 스킬 문양 ----------
  const GLYPH = {
    stone: () => `<path d="M10 27 L14 15 L24 11 L31 18 L29 28 L18 31 Z" fill="#efe6d4" stroke="#5a4a3a" stroke-width="1.5"/><path d="M15 17 L21 15" stroke="#fff" stroke-width="1.5"/>`,
    heal: d => `<path d="M16 8h8v8h8v8h-8v8h-8v-8H8v-8h8z" fill="${W}" stroke="${d}" stroke-width="1.5"/>`,
    slash: () => `<path d="M9 33 L29 9 L33 7 L31 11 L11 35 Z" fill="${W}"/><path d="M5 19 Q11 33 29 34" stroke="${W}" stroke-width="2.5" fill="none" opacity=".75"/>`,
    whirl: () => `<path d="M20 7 A13 13 0 1 1 7 20" stroke="${W}" stroke-width="3.5" fill="none"/><path d="M2 17 L7 26 L12 17 Z" fill="${W}"/><path d="M20 13 A7 7 0 1 1 13 20" stroke="${W}" stroke-width="2" fill="none" opacity=".7"/>`,
    dash: () => `<path d="M7 13h12M4 20h15M7 27h12" stroke="${W}" stroke-width="3" stroke-linecap="round"/><path d="M21 9 L34 20 L21 31 Z" fill="${W}"/>`,
    shield: d => `<path d="M20 5 L32 10 L31 22 Q28 31 20 35 Q12 31 9 22 L8 10 Z" fill="${W}"/><path d="M20 10 V30 M13 18 H27" stroke="${d}" stroke-width="2.5"/>`,
    book: d => `<rect x="9" y="7" width="22" height="26" rx="2" fill="${W}"/><path d="M13 13h14M13 18h14M13 23h9" stroke="${d}" stroke-width="2"/><path d="M9 29h22" stroke="${d}" stroke-width="1.5"/>`,
    arrows: () => `<path d="M7 28 L27 8 M11 34 L31 14" stroke="${W}" stroke-width="2.5"/><path d="M28 7 l-8 1 l7 7 z M32 13 l-8 1 l7 7 z" fill="${W}"/><path d="M7 28 l-2 -4 M7 28 l4 2 M11 34 l-2 -4 M11 34 l4 2" stroke="${W}" stroke-width="2"/>`,
    rain: () => [[12, 6], [22, 4], [31, 8], [9, 19], [19, 17], [29, 20], [15, 29], [25, 30]].map(([x, y]) => `<path d="M${x} ${y} l-4 8" stroke="${W}" stroke-width="2.5" stroke-linecap="round"/>`).join(''),
    backshot: () => `<path d="M15 20 H34" stroke="${W}" stroke-width="3"/><path d="M36 20 l-8 -5 v10 z" fill="${W}"/><path d="M13 9 Q3 20 13 31" stroke="${W}" stroke-width="2.5" fill="none"/><path d="M9 33 l6 0 l-3 -6 z" fill="${W}"/>`,
    orb: (d, l) => `<path d="M4 25 L17 22 M4 16 L17 19 M7 20 H17" stroke="${W}" stroke-width="2" opacity=".7"/><circle cx="25" cy="20" r="10" fill="${W}"/><circle cx="25" cy="20" r="6" fill="${l}"/>`,
    burst: (d, l) => `<polygon points="${starPoints(20, 20, 8, 16, 7)}" fill="${W}"/><circle cx="20" cy="20" r="5" fill="${l}"/>`,
    blink: () => `<circle cx="12" cy="20" r="7" fill="none" stroke="${W}" stroke-width="2" stroke-dasharray="3 3"/><circle cx="29" cy="20" r="7" fill="${W}"/><path d="M15 20 h8" stroke="${W}" stroke-width="2.5"/><path d="M23 16 l4 4 l-4 4" stroke="${W}" stroke-width="2.5" fill="none"/>`,
    barrier: () => `<circle cx="20" cy="20" r="14" fill="none" stroke="${W}" stroke-width="3"/><circle cx="20" cy="20" r="9" fill="${W}" opacity=".45"/><circle cx="20" cy="20" r="4" fill="${W}"/>`,
    flow: () => `<path d="M6 16 Q13 4 20 15 T34 14" stroke="${W}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M6 27 Q13 15 20 26 T34 25" stroke="${W}" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`,
    dagger2: () => `<path d="M8 31 L26 13 L31 9 L27 14 L10 33 Z" fill="${W}"/><path d="M32 31 L14 13 L9 9 L13 14 L30 33 Z" fill="${W}" opacity=".8"/><path d="M6 29 l5 5 M34 29 l-5 5" stroke="${W}" stroke-width="2.5"/>`,
    star: d => `<path d="M20 4 L23.5 16.5 L36 20 L23.5 23.5 L20 36 L16.5 23.5 L4 20 L16.5 16.5 Z" fill="${W}"/><circle cx="20" cy="20" r="3.5" fill="${d}"/>`,
    shadow: () => `<circle cx="25" cy="10" r="4.5" fill="${W}"/><path d="M23 15 L17 25 L11 30 M23 15 L27 25 L33 31 M21 19 L30 17" stroke="${W}" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M4 18 h7 M2 24 h8 M5 30 h5" stroke="${W}" stroke-width="2" opacity=".6"/>`,
    venom: d => `<path d="M20 5 Q31 19 29 26 A9 9 0 0 1 11 26 Q9 19 20 5 Z" fill="${W}"/><circle cx="18" cy="25" r="3" fill="${d}"/><circle cx="23" cy="20" r="1.8" fill="${d}"/>`,
  };

  // 1.7.9: 스킬마다 전용 문양(G.SKILL_GLYPH, icons2.js), 없으면 옛 문양. 테두리: 공격 = 둥근 사각 · 버프 = 방패꼴 · 패시브 = 원
  const FRAME = {
    rect: (f, s) => `<rect x="1" y="1" width="38" height="38" rx="7" fill="${f}" stroke="${s}" stroke-width="2"/>`,
    buff: (f, s) => `<path d="M20 1.5 L37 6 L36.5 21 Q34 33 20 38.5 Q6 33 3.5 21 L3 6 Z" fill="${f}" stroke="${s}" stroke-width="2" stroke-linejoin="round"/>`,
    passive: (f, s) => `<circle cx="20" cy="20" r="18.5" fill="${f}" stroke="${s}" stroke-width="2"/>`,
  };
  const wrap = (l, d, frame, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${l}"/><stop offset="1" stop-color="${d}"/></linearGradient></defs>
      <clipPath id="c">${frame('#000', 'none')}</clipPath>
      ${frame('url(#g)', extra || shade(d, -0.4))}<g opacity=".95" clip-path="url(#c)">${body}</g></svg>`;
  function skill(sk) {
    const key = 'sk:' + sk.id;
    if (cache[key]) return cache[key];
    const [l, d] = EL[sk.icon.el] || EL.earth;
    const own = G.SKILL_GLYPH && G.SKILL_GLYPH[sk.id];
    const g = own ? own(d, l) : (GLYPH[sk.icon.g] || GLYPH.book)(d, l);
    const frame = sk.type === 'passive' ? FRAME.passive : sk.type === 'buff' && own ? FRAME.buff : FRAME.rect;
    return (cache[key] = url(wrap(l, d, frame, g)));
  }
  // 1.7.9: 나쁜 효과 아이콘 (빨간 테두리)
  function debuff(kind) {
    const key = 'db:' + kind;
    if (cache[key]) return cache[key];
    const D = G.DEBUFF_ICON[kind], [l, d] = D.bg;
    return (cache[key] = url(wrap(l, d, FRAME.rect, D.g(d, l), '#ff4a4a')));
  }

  // ---------- 아이템 ----------
  const ITEM = {
    stick: (c, d) => `<path d="M9 33 L31 7" stroke="${d}" stroke-width="7" stroke-linecap="round"/><path d="M9 33 L31 7" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
    sword: (c, d) => `<path d="M12 28 L30 6 L34 6 L34 10 L16 32 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M8 24 L20 36" stroke="#c9a33a" stroke-width="3.5"/><path d="M6 38 L13 31" stroke="#6a3a1a" stroke-width="4" stroke-linecap="round"/>`,
    bow: (c, d) => `<path d="M10 4 Q36 20 10 36" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M10 4 Q36 20 10 36" stroke="${d}" stroke-width="1" fill="none"/><path d="M10 4 L10 36" stroke="#eee" stroke-width="1.2"/>`,
    wand: (c, d) => `<path d="M8 35 L27 14" stroke="#7a4a22" stroke-width="4" stroke-linecap="round"/><circle cx="29" cy="11" r="7" fill="${c}" stroke="${d}" stroke-width="1.5"/><circle cx="27" cy="9" r="2" fill="#fff"/>`,
    dagger: (c, d) => `<path d="M16 24 L30 8 L33 7 L32 10 L19 27 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M12 21 L22 31" stroke="#c9a33a" stroke-width="3"/><path d="M9 34 L15 28" stroke="#4a2a1a" stroke-width="4" stroke-linecap="round"/>`,
    hat: (c, d) => `<ellipse cx="20" cy="28" rx="16" ry="5" fill="${d}"/><path d="M9 28 Q10 10 20 9 Q30 10 31 28 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M10 23 H30" stroke="${d}" stroke-width="2.5"/>`,
    top: (c, d) => `<path d="M13 6 L20 10 L27 6 L36 13 L31 19 L28 16 L28 34 L12 34 L12 16 L9 19 L4 13 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/>`,
    bottom: (c, d) => `<path d="M10 5 H30 L32 35 H23 L20 17 L17 35 H8 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M10 9 H30" stroke="${d}" stroke-width="2"/>`,
    shoes: (c, d) => `<path d="M10 8 H19 V24 L33 27 Q35 33 30 33 H8 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M8 33 H31" stroke="${d}" stroke-width="2.5"/>`,
    gloves: (c, d) => `<path d="M11 35 V18 Q11 12 15 12 V7 Q17 5 19 7 V12 V5 Q21 3 23 5 V12 V7 Q25 5 27 7 V18 Q31 15 33 18 L27 28 V35 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/>`,
    cape: (c, d) => `<path d="M13 5 H27 L35 35 Q20 30 5 35 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M13 5 Q20 10 27 5" stroke="${d}" stroke-width="2" fill="none"/>`,
    earring: (c, d) => `<path d="M20 4 Q27 4 27 11 Q27 16 20 18" stroke="#d8b84a" stroke-width="2.5" fill="none"/><circle cx="20" cy="27" r="8" fill="${c}" stroke="${d}" stroke-width="1.5"/><circle cx="17" cy="24" r="2" fill="#fff" opacity=".8"/>`,
    ring: (c, d) => `<circle cx="20" cy="24" r="11" fill="none" stroke="#d8b84a" stroke-width="4"/><path d="M14 11 L20 4 L26 11 L20 15 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/>`,
    pendant: (c, d) => `<path d="M7 4 Q20 22 33 4" stroke="#d8b84a" stroke-width="2" fill="none"/><path d="M20 17 L28 26 L20 36 L12 26 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M17 24 L20 21" stroke="#fff" stroke-width="1.5"/>`,
    belt: (c, d) => `<rect x="3" y="15" width="34" height="10" rx="2" fill="${c}" stroke="${d}" stroke-width="1.5"/><rect x="15" y="12" width="10" height="16" rx="2" fill="none" stroke="#d8b84a" stroke-width="3"/>`,
    potion: (c, d) => `<path d="M16 5 H24 V13 Q33 17 33 26 Q33 36 20 36 Q7 36 7 26 Q7 17 16 13 Z" fill="#e8f2ff" opacity=".9" stroke="#8090a8" stroke-width="1.5"/><path d="M9 25 Q20 21 31 25 Q31 34 20 34 Q9 34 9 25 Z" fill="${c}" stroke="${d}"/><rect x="15" y="3" width="10" height="4" rx="1" fill="#a0703c"/>`,
    scroll: (c, d) => `<rect x="9" y="8" width="22" height="24" fill="#f5e6c0" stroke="#a08050"/><rect x="6" y="5" width="28" height="5" rx="2.5" fill="${c}" stroke="${d}"/><rect x="6" y="30" width="28" height="5" rx="2.5" fill="${c}" stroke="${d}"/><path d="M13 16h14M13 21h14M13 26h9" stroke="#a08050" stroke-width="1.5"/>`,
    flame: (c, d) => `<path d="M20 3 Q30 14 29 24 Q28 35 20 36 Q11 35 11 25 Q11 17 17 12 Q17 20 21 21 Q24 13 20 3 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M20 22 Q25 27 23 32 Q20 35 17 32 Q15 28 20 22 Z" fill="#ffe680"/>`,
    cube: (c, d) => `<path d="M20 4 L35 12 L35 28 L20 36 L5 28 L5 12 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M5 12 L20 20 L35 12 M20 20 V36" stroke="${d}" stroke-width="1.5" fill="none"/><path d="M20 4 L35 12 L20 20 L5 12 Z" fill="#fff" opacity=".35"/>`,
    jelly: (c, d) => `<path d="M6 30 Q4 12 20 10 Q36 12 34 30 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><ellipse cx="14" cy="17" rx="4" ry="2.5" fill="#fff" opacity=".6"/>`,
    shell: (c, d) => `<path d="M4 28 Q6 6 20 6 Q34 6 36 28 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M20 6 V28 M12 9 L14 28 M28 9 L26 28" stroke="${d}" stroke-width="1.3"/><rect x="14" y="28" width="12" height="5" fill="${c}" stroke="${d}"/>`,
    spore: (c, d) => `<circle cx="20" cy="20" r="13" fill="${c}" stroke="${d}" stroke-width="1.5"/><circle cx="15" cy="16" r="2.5" fill="#fff" opacity=".7"/><circle cx="24" cy="23" r="2" fill="${d}"/><circle cx="17" cy="26" r="1.5" fill="${d}"/>`,
    mushroom: (c, d) => `<path d="M4 22 Q4 6 20 6 Q36 6 36 22 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><circle cx="13" cy="14" r="3" fill="#fff" opacity=".8"/><circle cx="25" cy="12" r="2.5" fill="#fff" opacity=".8"/><rect x="15" y="22" width="10" height="12" rx="3" fill="#f1e0c0" stroke="#a08060"/>`,
    pearl: (c, d) => `<circle cx="20" cy="21" r="12" fill="${c}" stroke="#9ab" stroke-width="1.5"/><circle cx="16" cy="17" r="4" fill="#fff"/><circle cx="20" cy="21" r="15" fill="none" stroke="#fff" opacity=".4"/>`,
    gear: (c, d) => `<polygon points="${starPoints(20, 20, 8, 16, 12)}" fill="${c}" stroke="${d}" stroke-width="1.5"/><circle cx="20" cy="20" r="5" fill="#333"/>`,
    cloth: (c, d) => `<path d="M5 9 Q20 4 35 9 L33 33 Q20 28 7 33 Z" fill="${c}" stroke="#555" stroke-width="1.5"/><ellipse cx="20" cy="19" rx="7" ry="4" fill="none" stroke="#c03030" stroke-width="2"/><circle cx="20" cy="19" r="2" fill="#c03030"/>`,
    hide: (c, d) => `<path d="M8 10 Q20 4 32 10 Q36 20 32 30 Q20 36 8 30 Q4 20 8 10 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M14 16 Q20 20 26 16" stroke="${d}" fill="none"/>`,
    bag: (c, d) => `<path d="M12 12 Q8 34 20 35 Q32 34 28 12 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M12 12 Q20 7 28 12" stroke="${d}" stroke-width="3" fill="none"/>`,
    candy: (c, d) => `<path d="M3 14 L10 20 L3 26 Z M37 14 L30 20 L37 26 Z" fill="#ff9ad0" stroke="#c0508a" stroke-width="1.2"/><polygon points="${starPoints(20, 20, 5, 14, 6.5)}" fill="${c}" stroke="${d}" stroke-width="1.5"/><circle cx="17" cy="16" r="2" fill="#fff" opacity=".8"/>`,
    essence: (c, d) => `<circle cx="20" cy="22" r="17" fill="#ffe680" opacity=".25"/><path d="M15 6 H25 V12 Q34 16 34 25 Q34 36 20 36 Q6 36 6 25 Q6 16 15 12 Z" fill="#1e2350" stroke="#c9a33a" stroke-width="1.8"/><polygon points="${starPoints(20, 25, 5, 8, 3.5)}" fill="${c}" stroke="#ffd54a"/><circle cx="12" cy="20" r="1.2" fill="#fff"/><circle cx="28" cy="29" r="1" fill="#fff"/><rect x="14" y="3" width="12" height="4" rx="1" fill="#c9a33a"/>`,
    shard: (c, d) => `<circle cx="20" cy="20" r="16" fill="${c}" opacity=".3"/><path d="M20 3 L29 17 L20 37 L11 17 Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><path d="M20 3 L20 37 M11 17 H29" stroke="#fff" opacity=".6"/>`,
  };

  function item(tpl) {
    const key = 'it:' + tpl.id;
    if (cache[key]) return cache[key];
    const c = tpl.color || '#aaaaaa', d = shade(c, -0.45);
    const body = (ITEM[tpl.icon] || ITEM.bag)(c, d);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">${body}</svg>`;
    return (cache[key] = url(svg));
  }

  // 캔버스에 그릴 때 쓰는 Image 캐시
  function img(src) {
    if (!imgCache[src]) { const im = new Image(); im.src = src; imgCache[src] = im; }
    return imgCache[src];
  }

  return { skill, debuff, item, img, shade };
})();
