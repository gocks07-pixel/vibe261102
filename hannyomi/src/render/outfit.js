'use strict';
// 1.9: 복장 4종(선원·여행자·견습생 로브·캐주얼) + 장비 모양 (모자·상의·하의·신발·장갑·망토·무기)
//  - 이미지 없이 도형으로 그린다. 좌표는 sprites.js humanoid 와 같다 (발밑 0,0 · 오른쪽 = 앞)
//  - 장비는 아이템 id 로 디자인 묶음(style)을 찾고, 색은 아이템 색을 쓴다
//  - 레벨 0 기본 옷(선원 셔츠 등)은 장비 모양 대신 캐릭터 만들기에서 고른 복장 모양을 보여 준다
G.Outfit = (function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, sh = (c, f) => G.Icons.shade(c, f);
  const PI = Math.PI;
  function poly(ctx, pts, fill, stroke, lw) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
  }
  function line(ctx, pts, color, lw) {
    ctx.strokeStyle = color; ctx.lineWidth = lw || 1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
  function star(ctx, x, y, r, fill, pts = 5, inner = 0.45) {
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const a = -PI / 2 + i * PI / pts, rr = i % 2 ? r * inner : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  }
  function glowOn(ctx, c, b) { ctx.shadowColor = c; ctx.shadowBlur = b || 6; }
  function glowOff(ctx) { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; }

  // ---------------- 장비 → 디자인 묶음 ----------------
  const TIER = { 30: 'mithril', 40: 'rag', 50: 'desert', 55: 'sahrin', 60: 'pharaoh', 70: 'frost', 80: 'storm', 85: 'sky', 90: 'void' };
  const PREFIX = [['trial_', 'starheir'], ['leather_', 'leather'], ['sprout_', 'sprout'], ['elen_', 'elen'], ['traveler_', 'traveler']];
  const WEAP_ID = { sword_steel: 'steel', bow_wind: 'wind', wand_crystal: 'crystal', dagger_shadow: 'shadow' };
  const cache = {};
  function styleOf(id) {
    if (!id) return null;
    if (id in cache) return cache[id];
    let st = 'basic';
    const m = id.match(/^(?:ar|wp)(\d+)_/);
    if (m) st = TIER[m[1]] || 'basic';
    else {
      for (const [p, s] of PREFIX) if (id.startsWith(p)) st = s;
      if (/_red$/.test(id)) st = 'red';
      if (WEAP_ID[id]) st = WEAP_ID[id];
    }
    return (cache[id] = st);
  }
  // 묶음별 부위 모양 · 장식색(trim) · 빛(glow)
  const S = {
    basic:    {},
    leather:  { hat: 'cap', top: 'vest', bottom: 'pants', shoes: 'boot', gloves: 'glove' },
    sprout:   { hat: 'sprout', top: 'tunic', emblem: 'leaf', shoes: 'curl', trim: '#f4e27a' },
    traveler: { cape: 'travel', gloves: 'glove' },
    elen:     { hat: 'ranger', top: 'tunic', emblem: 'leaf', shoes: 'curl', gloves: 'glove', trim: '#e2c66a' },
    mithril:  { hat: 'helm', top: 'plate', bottom: 'greave', shoes: 'sabaton', gloves: 'gauntlet', cape: 'long', trim: '#f4f8ff' },
    rag:      { hat: 'goggle', top: 'plate', emblem: 'gear', bottom: 'greave', shoes: 'sabaton', gloves: 'gauntlet', trim: '#d0843e', rivet: true },
    desert:   { hat: 'turban', top: 'wrap', bottom: 'baggy', shoes: 'sandal', gloves: 'wrap', cape: 'long', trim: '#b0503a' },
    sahrin:   { hat: 'circlet', top: 'royal', emblem: 'sun', bottom: 'kilt', shoes: 'sandal', gloves: 'bracer', trim: '#3a7ad0' },
    pharaoh:  { hat: 'nemes', top: 'royal', emblem: 'sun', bottom: 'kilt', shoes: 'sandal', gloves: 'bracer', cape: 'long', trim: '#2a50b0' },
    frost:    { hat: 'horn', top: 'plate', emblem: 'flake', bottom: 'greave', shoes: 'sabaton', gloves: 'gauntlet', cape: 'icy', trim: '#ffffff', spikes: true, glow: '#bfe8ff' },
    storm:    { hat: 'crest', top: 'plate', emblem: 'bolt', bottom: 'greave', shoes: 'sabaton', gloves: 'gauntlet', cape: 'long', trim: '#ffe060', glow: '#fff09a' },
    sky:      { hat: 'wing', top: 'plate', emblem: 'feather', bottom: 'greave', shoes: 'winged', gloves: 'gauntlet', cape: 'feather', trim: '#fff6d0', glow: '#e8f0ff' },
    void:     { hat: 'void', top: 'plate', emblem: 'voidgem', bottom: 'greave', shoes: 'sabaton', gloves: 'gauntlet', cape: 'tattered', trim: '#c890ff', spikes: true, glow: '#b070ff' },
    starheir: { hat: 'crown', top: 'plate', emblem: 'star', bottom: 'greave', shoes: 'sabaton', gloves: 'gauntlet', cape: 'star', trim: '#fff2a8', glow: '#ffe680' },
    red: {}, steel: {}, wind: {}, crystal: {}, shadow: {},
  };
  const DEF = { hat: 'cap', top: 'tunic', bottom: 'pants', shoes: 'boot', gloves: 'glove', cape: 'long' };
  const SLOTS = ['hat', 'top', 'bottom', 'shoes', 'gloves', 'cape', 'weapon'];
  // 장착 장비 → { slot: { st, c, k(모양), sp(묶음) } }
  function gearOf(eq) {
    const g = {};
    for (const s of SLOTS) {
      const e = eq && eq[s]; if (!e) continue;
      const it = G.ITEMS[e.tid]; if (!it) continue;
      if ((s === 'top' || s === 'bottom' || s === 'shoes') && !(it.lv > 0)) continue;   // 기본 옷 → 복장 모양
      const st = styleOf(e.tid), sp = S[st] || {};
      g[s] = { st, c: it.color, k: sp[s] || DEF[s], sp };
    }
    return g;
  }
  // 아이템 id 목록으로 바로 만들기 (확인용 페이지 · 컷신용)
  function gearFrom(ids) {
    const eq = {};
    for (const id of ids) { const it = G.ITEMS[id]; if (it && it.slot) eq[it.slot] = { tid: id }; }
    return gearOf(eq);
  }

  // ---------------- 엠블럼 (가슴 문양) ----------------
  function emblem(ctx, kind, x, y, c, trim) {
    const t = trim || '#fff';
    switch (kind) {
      case 'leaf':
        ctx.fillStyle = t; ctx.beginPath(); ctx.ellipse(x, y, 2.2, 3.6, 0.6, 0, PI * 2); ctx.fill();
        line(ctx, [[x - 1.6, y + 2], [x + 1.4, y - 2]], sh(c, -0.4), 0.8); break;
      case 'gear':
        ctx.fillStyle = t;
        for (let i = 0; i < 8; i++) { const a = i * PI / 4; ctx.fillRect(x + Math.cos(a) * 3.2 - 1, y + Math.sin(a) * 3.2 - 1, 2, 2); }
        ell(ctx, x, y, 3, 3, t); ell(ctx, x, y, 1.2, 1.2, sh(c, -0.4)); break;
      case 'sun':
        ctx.strokeStyle = t; ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) { const a = i * PI / 4; line(ctx, [[x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6], [x + Math.cos(a) * 4.4, y + Math.sin(a) * 4.4]], t, 1); }
        ell(ctx, x, y, 2.4, 2.4, '#e84a3a', t, 0.8); break;
      case 'flake':
        for (let i = 0; i < 3; i++) { const a = i * PI / 3; line(ctx, [[x - Math.cos(a) * 4, y - Math.sin(a) * 4], [x + Math.cos(a) * 4, y + Math.sin(a) * 4]], t, 1.2); }
        ell(ctx, x, y, 1.3, 1.3, '#7ac8ff'); break;
      case 'bolt':
        poly(ctx, [[x + 1, y - 5], [x - 2.5, y + 0.5], [x, y + 0.5], [x - 1.5, y + 5], [x + 3, y - 1], [x + 0.4, y - 1]], t); break;
      case 'feather':
        ctx.fillStyle = t; ctx.beginPath(); ctx.ellipse(x, y, 1.8, 4.5, 0.5, 0, PI * 2); ctx.fill();
        line(ctx, [[x - 2, y + 3.4], [x + 2, y - 3.4]], sh(c, -0.3), 0.7); break;
      case 'voidgem':
        poly(ctx, [[x, y - 4], [x + 3, y], [x, y + 4], [x - 3, y]], '#2a0a4a', t, 1);
        ell(ctx, x, y, 1.3, 1.3, t); break;
      case 'star':
        star(ctx, x, y, 4.2, t); star(ctx, x, y, 1.8, '#fff'); break;
    }
  }

  // ---------------- 망토 (몸 뒤) ----------------
  function cape(ctx, o, kind, c, sp) {
    const m = o.moving ? 4 : 0, wv = Math.sin((o.t || 0) * 6) * (o.moving ? 1.5 : 0.6);
    const hemX = -19 - m + wv, d = sh(c, -0.3);
    switch (kind) {
      case 'travel':   // 짧은 어깨 망토 (여행자)
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-7, -36);
        ctx.quadraticCurveTo(-15 - m, -30, -13 - m + wv, -19); ctx.lineTo(-2, -21); ctx.lineTo(4, -36); ctx.closePath(); ctx.fill();
        line(ctx, [[-13 - m + wv, -19], [-2, -21]], d, 1.5);
        break;
      case 'icy': {    // 서리용: 뾰족뾰족한 얼음 밑단
        const pts = [[-6, -36], [hemX + 1, -9]];
        for (let i = 0; i < 4; i++) pts.push([hemX + 4 + i * 4.5, -4 - (i % 2 ? 4 : 0)]);
        pts.push([3, -10], [4, -36]);
        poly(ctx, pts, c, d, 1);
        line(ctx, [[-4, -32], [hemX + 5, -10]], 'rgba(255,255,255,.55)', 1.5);
        break;
      }
      case 'feather': {   // 천공: 깃털 겹 밑단
        poly(ctx, [[-6, -36], [hemX, -10], [3, -11], [4, -36]], c);
        for (let i = 0; i < 4; i++) ell(ctx, hemX + 3 + i * 4.3, -8 + (i % 2) * 1.5, 3, 5.5, i % 2 ? sh(c, 0.25) : '#ffffff', d, 0.6);
        ell(ctx, -6, -33, 3, 3, sp.trim || '#fff6d0');
        break;
      }
      case 'tattered': {  // 공허: 찢어진 밑단 + 보랏빛 테두리
        const pts = [[-6, -36], [hemX, -3]];
        for (let i = 0; i < 4; i++) pts.push([hemX + 2.5 + i * 4.5, -10 + (i % 2 ? 6 : 0)]);
        pts.push([3, -7], [4, -36]);
        poly(ctx, pts, c, sp.trim || '#c890ff', 1);
        break;
      }
      case 'star': {      // 별조각 계승자: 금빛 안감 + 별무늬
        poly(ctx, [[-6, -36], [hemX - 1, -3], [4, -6], [4, -36]], sp.trim || '#ffe680');
        poly(ctx, [[-5, -36], [hemX + 1, -5], [3, -7.5], [3, -36]], c);
        for (const [x, y, r] of [[-7, -27, 1.6], [-10 - m * 0.5, -16, 1.9], [-4, -13, 1.3], [-12 - m * 0.7 + wv, -8, 1.4]]) star(ctx, x, y, r, '#fff4b8', 4);
        break;
      }
      default:            // 긴 망토
        poly(ctx, [[-6, -36], [hemX, -4], [3, -7], [4, -36]], c);
        line(ctx, [[hemX, -4], [3, -7]], d, 2);
        if (sp && sp.trim) line(ctx, [[-6, -36], [4, -36]], sp.trim, 2);
    }
  }

  // ---------------- 다리 · 신발 ----------------
  function leg(ctx, kind, c, skin) {
    switch (kind) {
      case 'wide':   poly(ctx, [[-3, 0], [3, 0], [4.8, 12], [-4.8, 12]], c); line(ctx, [[-4.6, 11], [4.6, 11]], sh(c, 0.35), 1); break;
      case 'shorts': rrect(ctx, -2.5, 4, 5, 9, 2, skin); rrect(ctx, -3.4, 0, 6.8, 6.5, 2, c); break;
      case 'greave':
        rrect(ctx, -3, 0, 6, 12, 2, sh(c, -0.3));
        rrect(ctx, -3.6, 6, 7.2, 6.5, 2, c, sh(c, -0.4));
        ell(ctx, 0.3, 5.2, 3.8, 3, c, sh(c, -0.45), 1);
        break;
      case 'baggy':  ell(ctx, 0, 5.5, 4.6, 7, c); rrect(ctx, -3, 9.5, 6, 3, 1.5, sh(c, -0.3)); break;
      case 'bare':   rrect(ctx, -2.6, 0, 5.2, 12, 2, skin); break;
      case 'robe':   rrect(ctx, -2.8, 4, 5.6, 9, 2, sh(c, -0.35)); break;
      default:       rrect(ctx, -3, 0, 6, 12, 2, c);
    }
  }
  function shoe(ctx, kind, c, skin, sp) {
    const d = sh(c, -0.4);
    switch (kind) {
      case 'boot':     rrect(ctx, -3.6, 5, 7.4, 8, 2, c); rrect(ctx, -3.4, 10, 9, 5, 2.2, c); line(ctx, [[-3.6, 6.5], [3.8, 6.5]], d, 1.4); break;
      case 'tallboot': rrect(ctx, -3.6, 3, 7.4, 10, 2, c); rrect(ctx, -3.4, 10, 9, 5, 2.2, c); line(ctx, [[-3.6, 4.6], [3.8, 4.6]], sh(c, 0.3), 1.6); break;
      case 'sneaker':
        rrect(ctx, -3.2, 9.6, 9.4, 5.4, 2.6, '#f4f4f6'); line(ctx, [[-1, 11.5], [4.5, 11]], c, 1.6);
        ctx.fillStyle = sh(c, -0.2); ctx.fillRect(-3.2, 13.6, 9.4, 1.4); break;
      case 'curl':
        rrect(ctx, -3.2, 9, 8.4, 6, 2, c);
        ctx.strokeStyle = c; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(5.6, 10.6, 2.2, PI * 0.5, PI * 1.6, true); ctx.stroke();
        if (sp && sp.trim) ell(ctx, 0, 10, 1.2, 1.2, sp.trim);
        break;
      case 'sabaton': case 'winged':
        poly(ctx, [[-3.8, 7], [3.6, 7], [8.6, 13], [8.6, 15], [-3.8, 15]], c, d, 1);
        line(ctx, [[-3.6, 11], [5.4, 11]], sp && sp.trim ? sp.trim : sh(c, 0.3), 1);
        if (sp && sp.spikes) poly(ctx, [[-3.8, 9], [-7, 7.5], [-3.8, 12]], sp.trim || '#fff');
        if (kind === 'winged') for (let i = 0; i < 2; i++) ell(ctx, -5 - i * 1.4, 8.5 - i * 1.8, 2.8 - i * 0.6, 1.1, '#ffffff', sh(c, -0.2), 0.4);
        break;
      case 'sandal':
        rrect(ctx, -3, 10.5, 8.6, 4, 2, skin);
        ctx.fillStyle = sh(c, -0.25); ctx.fillRect(-3.4, 13.6, 9.4, 1.6);
        line(ctx, [[-2.4, 11], [5, 13]], c, 1.3); line(ctx, [[-2.6, 7], [-2.6, 13]], c, 1.3);
        break;
      default: rrect(ctx, -3, 10, 8, 5, 2, c);
    }
  }

  // ---------------- 하의 위쪽 (치마 · 로브 자락 · 킬트) ----------------
  function lower(ctx, kind, c, sp, sw, female) {
    const d = sh(c, -0.3);
    switch (kind) {
      case 'robe': {   // 견습생 로브: 발목까지, 걸을 때 자락이 흔들린다
        const k = sw * 2.5;
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-9, -18);
        ctx.lineTo(-12 - k, -2); ctx.quadraticCurveTo(0, 1, 12 + k, -2); ctx.lineTo(9, -18); ctx.closePath(); ctx.fill();
        line(ctx, [[-12 - k, -2.6], [0, -0.5], [12 + k, -2.6]], sh(c, 0.35), 2);
        line(ctx, [[2, -16], [2.5 + k * 0.4, -2]], d, 1);
        break;
      }
      case 'pleat':    // 주름치마 (선원)
        poly(ctx, [[-9, -18], [-13, -6], [13, -6], [9, -18]], c);
        for (const x of [-6, -1.5, 3, 7.5]) line(ctx, [[x * 0.75, -17], [x, -7]], d, 0.9);
        line(ctx, [[-12, -7.6], [12, -7.6]], sp, 1);
        break;
      case 'tasset':   // 갑옷 치마 (판금 조각)
        for (let i = 0; i < 4; i++) {
          const x0 = -10 + i * 5.2;
          poly(ctx, [[x0, -18], [x0 + 5.8, -18], [x0 + 6.4 + (i - 1.5) * 0.6, -7], [x0 - 0.6 + (i - 1.5) * 0.6, -7]], i % 2 ? c : sh(c, -0.12), d, 0.8);
        }
        if (sp && sp.trim) line(ctx, [[-11, -7.5], [11.5, -7.5]], sp.trim, 1.2);
        break;
      case 'kilt':     // 왕조 · 파라오: 앞판이 있는 짧은 치마
        poly(ctx, [[-9, -18], [-11, -6], [11, -6], [9, -18]], '#f4ecd8');
        poly(ctx, [[0, -18], [-1.5, -5], [7.5, -5], [6, -18]], c, sh(c, -0.35), 0.8);
        for (let i = 0; i < 3; i++) line(ctx, [[0.2, -14 + i * 3.5], [6.8, -14 + i * 3.5]], sp && sp.trim ? sp.trim : d, 1);
        break;
      default:         // 예전 치마
        poly(ctx, [[-9, -18], [-13, -6], [13, -6], [9, -18]], c);
    }
  }

  // ---------------- 몸통 ----------------
  function torso(ctx, kind, c, lk, sp, e) {
    const d = sh(c, -0.35), bc = lk.bottom;
    rrect(ctx, -9, -36, 18, 23, 6, c, d);
    switch (kind) {
      case 'sailor': {
        const nv = e.navy;
        line(ctx, [[-8.5, -24], [8.5, -24]], nv, 0.8); line(ctx, [[-8.5, -21], [8.5, -21]], nv, 0.8);
        rrect(ctx, -11, -37, 9, 8, 1.5, nv); line(ctx, [[-10, -31], [-3, -31]], '#fff', 1);   // 등 뒤 세일러 칼라
        poly(ctx, [[1, -36.5], [9.2, -36.5], [5.5, -27]], nv); line(ctx, [[2.5, -35.5], [5.5, -29], [8, -35.5]], '#fff', 0.9);
        poly(ctx, [[3.4, -29], [7.6, -29], [5.5, -24.5]], '#e0453a');   // 스카프
        ctx.fillStyle = sh(bc, -0.25); ctx.fillRect(-9, -17, 18, 3);
        break;
      }
      case 'traveler':
        line(ctx, [[0, -36], [3, -28]], d, 1);
        rrect(ctx, -9.5, -19, 19, 3.6, 1, '#4a2e18'); rrect(ctx, 2.5, -19.4, 3.6, 4.4, 1, '#d8b060');   // 벨트 + 버클
        rrect(ctx, -11.5, -19, 6, 6.5, 2, '#7a4e2a', '#4a2e18');   // 허리 가방
        line(ctx, [[-11.4, -16.8], [-5.6, -16.8]], '#4a2e18', 1);
        break;
      case 'apprentice':
        poly(ctx, [[-1, -36], [8.6, -36], [4.5, -26]], sh(c, 0.35));   // V넥
        line(ctx, [[-1, -36], [4.5, -26], [8.6, -36]], e.sash, 1.2);
        rrect(ctx, -9.5, -19.5, 19, 3.6, 1.5, e.sash);   // 허리끈
        line(ctx, [[-6, -16], [-8, -10]], e.sash, 2); line(ctx, [[-4, -16], [-4.6, -11]], e.sash, 2);
        star(ctx, 5.6, -30.5, 1.8, '#fff2a8', 4);
        break;
      case 'casual':
        rrect(ctx, -3, -24.5, 11, 6.5, 2, sh(c, -0.15), d);   // 앞주머니
        line(ctx, [[5.5, -35], [5.2, -29.5]], '#ffffff', 1); line(ctx, [[8.2, -35], [8.4, -30]], '#ffffff', 1);   // 끈
        rrect(ctx, -9, -16.5, 18, 2.6, 1.2, sh(c, -0.2));   // 밑단 고무줄
        break;
      case 'vest':
        rrect(ctx, 3, -36, 6, 22, 3, '#ece2cc');   // 안쪽 셔츠
        line(ctx, [[3, -35], [3, -15]], d, 1.2);
        for (let i = 0; i < 3; i++) line(ctx, [[2.5, -31 + i * 4.5], [6, -30 + i * 4.5]], '#5a3a1a', 0.8);
        ctx.fillStyle = sh(bc, -0.3); ctx.fillRect(-9, -17, 18, 3);
        break;
      case 'tunic':
        poly(ctx, [[1.5, -36], [8, -36], [5, -31]], sh(c, 0.3));
        rrect(ctx, -9.5, -19, 19, 3.2, 1, sp.trim ? sh(sp.trim, -0.35) : sh(bc, -0.3));
        if (sp.trim) line(ctx, [[-8, -35.5], [8, -35.5]], sp.trim, 1);
        if (sp.emblem) emblem(ctx, sp.emblem, 3.5, -27.5, c, sp.trim);
        break;
      case 'plate':
        ell(ctx, -1.5, -31, 5.5, 4, 'rgba(255,255,255,.22)');
        line(ctx, [[-8.5, -23], [8.5, -23]], d, 1); line(ctx, [[-8.5, -20], [8.5, -20]], d, 1);
        line(ctx, [[-8, -36], [8, -36]], sp.trim || sh(c, 0.4), 1.6);
        rrect(ctx, -9.5, -18.5, 19, 3.4, 1, sh(c, -0.45));
        if (sp.rivet) for (const [x, y] of [[-6.5, -33], [7, -33], [-6.5, -26], [7, -26]]) ell(ctx, x, y, 0.9, 0.9, sh(c, 0.45));
        if (sp.glow) glowOn(ctx, sp.glow, 5);
        if (sp.emblem) emblem(ctx, sp.emblem, 3, -29, c, sp.trim);
        glowOff(ctx);
        break;
      case 'wrap':   // 사막: 대각선 띠
        ctx.save(); ctx.beginPath(); ctx.roundRect(-9, -36, 18, 23, 6); ctx.clip();
        poly(ctx, [[-10, -38], [-4, -38], [11, -18], [5, -18]], sp.trim || d);
        line(ctx, [[-7, -38], [8, -18]], sh(sp.trim || d, 0.3), 0.8);
        ctx.restore();
        rrect(ctx, -9.5, -19, 19, 3.4, 1, sh(c, -0.3));
        break;
      case 'royal': {   // 왕조 · 파라오: 넓은 목깃 장식 + 태양 문양
        const t = sp.trim || '#3a7ad0';
        ctx.save(); ctx.beginPath(); ctx.roundRect(-9, -36, 18, 23, 6); ctx.clip();
        for (let i = 3; i >= 0; i--) ell(ctx, 1, -36, 13 - i * 0, 9 - i * 2, i % 2 ? t : c, null);
        ell(ctx, 1, -36, 6, 2.5, sh(c, 0.2));
        ctx.restore();
        rrect(ctx, -9.5, -19, 19, 3.6, 1, c, sh(c, -0.4));
        emblem(ctx, 'sun', 3, -17.2, c, '#fff4c0');
        break;
      }
      default:   // 예전 모양 (NPC)
        ctx.fillStyle = sh(bc, -0.3); ctx.fillRect(-9, -17, 18, 3);
    }
  }

  // ---------------- 모자 · 투구 ----------------
  function dome(ctx, c, d, top = -65) {   // 머리를 덮는 투구 본체
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-13.5, -53);
    ctx.quadraticCurveTo(-14, top, 1, top); ctx.quadraticCurveTo(16, top, 15.5, -53); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = d; ctx.lineWidth = 1; ctx.stroke();
  }
  function hat(ctx, kind, c, sp, t) {
    const d = sh(c, -0.35), tr = sp.trim || sh(c, 0.4);
    switch (kind) {
      case 'sprout':
        ell(ctx, 1, -60, 16, 4.2, sh(c, -0.2));
        ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(1, -61, 11, 9, 0, PI, 0); ctx.fill();
        line(ctx, [[1, -69], [1, -73.5]], '#3e8e34', 1.6);
        ctx.fillStyle = '#7ad66a'; ctx.beginPath(); ctx.ellipse(-2.4, -74, 3.4, 1.8, -0.5, 0, PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(4.4, -75, 3.4, 1.8, 0.5, 0, PI * 2); ctx.fill();
        break;
      case 'ranger':   // 엘렌 숲지기: 끝이 뒤로 휜 뾰족 모자 + 깃털
        ell(ctx, 1, -59.5, 17, 4, d);
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-10, -60);
        ctx.quadraticCurveTo(-4, -74, -14, -79); ctx.quadraticCurveTo(6, -76, 12, -60); ctx.closePath(); ctx.fill();
        line(ctx, [[-10, -62], [11.5, -62]], tr, 1.6);
        ctx.fillStyle = '#f4f0e0'; ctx.beginPath(); ctx.ellipse(-8, -68, 1.8, 6, -0.9, 0, PI * 2); ctx.fill();
        break;
      case 'helm':     // 미스릴: 테두리 + 코 가리개
        dome(ctx, c, d); line(ctx, [[-13.5, -56], [15.5, -56]], tr, 2);
        rrect(ctx, 8.5, -57, 2.6, 8, 1, c, d);
        poly(ctx, [[-13.5, -55], [-15, -44], [-9, -46], [-8, -55]], c, d, 1);   // 목 보호대
        ell(ctx, -3, -61, 4, 2, 'rgba(255,255,255,.35)');
        break;
      case 'goggle':   // 라그 강철: 리벳 투구 + 이마 고글
        dome(ctx, c, d);
        for (const x of [-8, -2, 4, 10]) ell(ctx, x, -61.5 + Math.abs(x - 1) * 0.12, 0.9, 0.9, sh(c, 0.45));
        rrect(ctx, -13.5, -58.5, 29, 3.4, 1.4, '#3a3028');
        for (const x of [6, 12]) { ell(ctx, x, -59, 3.2, 3.2, '#5a4a3a'); ell(ctx, x, -59, 2.2, 2.2, tr); ell(ctx, x - 0.8, -59.8, 0.7, 0.7, '#fff'); }
        break;
      case 'turban': { // 사막: 감은 천 + 뒤로 늘어진 천 + 보석
        ctx.fillStyle = d; ctx.beginPath(); ctx.moveTo(-12, -56); ctx.quadraticCurveTo(-19, -48, -16 + Math.sin(t * 5) * 1.2, -40); ctx.lineTo(-11, -42); ctx.closePath(); ctx.fill();
        ell(ctx, 1, -58, 14.5, 6.5, c, d, 1); ell(ctx, 0, -63, 12, 5.5, c, d, 1);
        line(ctx, [[-12, -60], [12, -56]], d, 0.8); line(ctx, [[-10, -65], [11, -61]], d, 0.8);
        ell(ctx, 11, -60, 2.2, 2.6, tr, '#f0d070', 1);
        break;
      }
      case 'circlet': {// 사하린 왕조: 금 머리띠 + 태양 볏
        rrect(ctx, -12.5, -59.5, 27.5, 3.4, 1.5, c, d);
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(6, -59); ctx.lineTo(9, -70); ctx.lineTo(12, -59); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 5; i++) { const a = -PI / 2 + (i - 2) * 0.45; line(ctx, [[9 + Math.cos(a) * 4.5, -66 + Math.sin(a) * 4.5], [9 + Math.cos(a) * 7, -66 + Math.sin(a) * 7]], c, 1.2); }
        ell(ctx, 9, -64.5, 2, 2, tr); ell(ctx, -4, -58, 1.3, 1.3, tr);
        break;
      }
      case 'nemes': {  // 파라오: 줄무늬 머릿수건 (뒤로 늘어짐)
        poly(ctx, [[-13.5, -57], [-5, -57], [-4, -36], [-15, -38]], c);
        for (let i = 0; i < 4; i++) line(ctx, [[-14, -53 + i * 4.5], [-4.5, -53 + i * 4.5]], tr, 1.6);
        dome(ctx, c, d, -66);
        for (let i = 0; i < 3; i++) line(ctx, [[-12 + i * 0.5, -61 + i * 2.8], [14 - i * 0.5, -61 + i * 2.8]], tr, 1.4);
        rrect(ctx, -13, -56.5, 28.5, 2.6, 1, '#f0d060');
        ell(ctx, 12, -60, 1.8, 2.6, '#e84a3a', '#f0d060', 0.8);
        break;
      }
      case 'horn': {   // 서리용: 뒤로 휜 뿔 + 등줄기 비늘
        ctx.fillStyle = '#f4fbff';
        for (const [x, k] of [[-5, 1], [3, 0.75]]) {   // 굵은 뿌리에서 뒤로 휘는 뿔
          ctx.beginPath(); ctx.moveTo(x - 5, -61); ctx.quadraticCurveTo(x - 6 * k, -70, x - 14 * k, -74);
          ctx.quadraticCurveTo(x - 2 * k, -70, x + 4, -62); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#9ac8e8'; ctx.lineWidth = 0.8; ctx.stroke();
        }
        dome(ctx, c, d);
        for (let i = 0; i < 4; i++) poly(ctx, [[-8 + i * 5, -63.5 + Math.abs(i - 1.5) * 0.8], [-6 + i * 5, -67.5 + Math.abs(i - 1.5)], [-4 + i * 5, -63.5 + Math.abs(i - 1.5) * 0.8]], tr);
        line(ctx, [[-13.5, -56], [15.5, -56]], tr, 1.6);
        glowOn(ctx, sp.glow, 6); poly(ctx, [[10, -61], [12, -57.5], [10, -54], [8, -57.5]], '#7ad0ff'); glowOff(ctx);
        break;
      }
      case 'crest':    // 폭풍: 번개 모양 볏
        poly(ctx, [[-1, -63], [-6, -73], [0, -71], [-3, -80], [6, -68], [1, -69.5], [5, -63]], tr, sh(tr, -0.4), 0.8);
        dome(ctx, c, d); line(ctx, [[-13.5, -56], [15.5, -56]], tr, 1.6);
        rrect(ctx, 8.5, -57, 2.6, 7, 1, c, d);
        break;
      case 'wing': {   // 천공: 하얀 날개 머리띠
        const f = Math.sin(t * 3) * 0.08;
        for (let i = 0; i < 4; i++) {
          ctx.save(); ctx.translate(-9, -59); ctx.rotate(-0.5 - i * 0.32 + f);
          ell(ctx, -6 - i * 0.5, 0, 7.5 - i * 0.6, 2.2, i % 2 ? '#e8f0ff' : '#ffffff', '#b8c8e8', 0.6); ctx.restore();
        }
        rrect(ctx, -12.5, -59.5, 27.5, 3.2, 1.5, c, d);
        glowOn(ctx, sp.glow, 6); ell(ctx, 10, -58, 2.2, 2.2, '#ffffff'); glowOff(ctx);
        break;
      }
      case 'void':     // 공허 수호자: 가시 투구 + 빛나는 보석
        for (const [x, h] of [[-8, 8], [-1, 11], [6, 8]]) poly(ctx, [[x - 3, -62], [x, -62 - h], [x + 3, -62]], sh(c, -0.25));
        dome(ctx, c, d);
        line(ctx, [[-13.5, -56], [15.5, -56]], tr, 1.4);
        glowOn(ctx, sp.glow, 8); poly(ctx, [[2, -63], [4.5, -59.5], [2, -56.5], [-0.5, -59.5]], tr); glowOff(ctx);
        break;
      case 'crown':    // 별조각 계승자: 별 세 개가 박힌 왕관
        poly(ctx, [[-11, -57], [-12, -67], [-6, -62], [1, -70], [8, -62], [14, -67], [13, -57]], c, d, 1);
        rrect(ctx, -11.5, -59, 25, 3.4, 1.4, sh(c, -0.15));
        for (const x of [-3.5, 1, 5.5]) ell(ctx, x, -57.3, 1, 1, '#e84a7a');
        glowOn(ctx, sp.glow, 8);
        star(ctx, -12, -68, 2.4, '#fffbe0'); star(ctx, 1, -71.5, 3.2, '#fffbe0'); star(ctx, 14, -68, 2.4, '#fffbe0');
        glowOff(ctx);
        break;
      default:         // 챙 모자 (가죽 모자 · NPC)
        ell(ctx, 1, -60, 17, 4.5, sh(c, -0.2));
        ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(1, -61, 11, 10, 0, PI, 0); ctx.fill();
        if (kind === 'cap' && sp.top === 'vest') line(ctx, [[-10, -61.5], [12, -61.5]], sh(c, -0.4), 1.6);
    }
  }
  // 후드 (캐주얼, 머리 뒤)
  function hood(ctx, c) {
    ctx.fillStyle = sh(c, -0.12); ctx.beginPath(); ctx.ellipse(-8, -38, 8, 5, -0.3, 0, PI * 2); ctx.fill();
    ctx.strokeStyle = sh(c, -0.35); ctx.lineWidth = 1; ctx.stroke();
  }
  // 여행자 어깨 망토 앞쪽 덮개
  function mantle(ctx, c) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-10, -36); ctx.quadraticCurveTo(0, -38.5, 10, -36);
    ctx.quadraticCurveTo(9, -29, 1, -29); ctx.quadraticCurveTo(-8, -29, -10, -36); ctx.fill();
    ell(ctx, 6, -33.5, 1.5, 1.5, '#d8b060');
  }

  // ---------------- 팔 · 장갑 ----------------
  function sleeve(ctx, kind, c, e, sp) {
    switch (kind) {
      case 'apprentice': poly(ctx, [[-3, 0], [3, 0], [6.5, 13], [-5.5, 13]], c); line(ctx, [[-5.5, 12.6], [6.5, 12.6]], e.sash, 1.4); break;
      case 'sailor':     rrect(ctx, -2.8, 0, 5.6, 14, 2.5, c); line(ctx, [[-2.8, 10.5], [2.8, 10.5]], e.navy, 1.4); break;
      case 'casual':     rrect(ctx, -2.9, 0, 5.8, 14, 2.5, c); rrect(ctx, -3, 10, 6, 2.4, 1, sh(c, -0.2)); break;
      case 'plate': case 'royal':
        rrect(ctx, -2.8, 0, 5.6, 14, 2.5, kind === 'royal' ? '#f4ecd8' : sh(c, -0.25)); break;
      default: rrect(ctx, -2.8, 0, 5.6, 14, 2.5, c);
    }
  }
  function pauldron(ctx, kind, c, sp) {
    if (kind === 'plate') {
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 2, 6, 5, 0, PI * 0.95, PI * 2.05); ctx.fill();
      ctx.strokeStyle = sp.trim || sh(c, -0.4); ctx.lineWidth = 1; ctx.stroke();
      if (sp.spikes) poly(ctx, [[-2, -2.4], [-5, -7], [1, -3]], sp.trim || '#fff');
      if (sp.rivet) ell(ctx, 0, 0, 0.9, 0.9, sh(c, 0.45));
    } else if (kind === 'royal') {
      ell(ctx, 0, 2, 4.6, 3.6, c, sh(c, -0.4), 0.8);
    }
  }
  function hand(ctx, kind, c, skin, sp) {
    switch (kind) {
      case 'glove': rrect(ctx, -3.1, 9.5, 6.2, 3, 1, sh(c, -0.2)); ell(ctx, 0, 14, 3.4, 3.4, c); break;
      case 'gauntlet':
        poly(ctx, [[-4.2, 8.6], [4.2, 8.6], [3.4, 12.4], [-3.4, 12.4]], sp.trim || sh(c, 0.3), sh(c, -0.4), 0.8);
        ell(ctx, 0, 14.3, 3.9, 3.8, c, sh(c, -0.45), 1);
        if (sp.spikes) poly(ctx, [[-4.2, 9], [-7.5, 8], [-4, 11.5]], sp.trim || '#fff');
        break;
      case 'wrap':
        ell(ctx, 0, 14, 3.2, 3.2, skin);
        for (let i = 0; i < 3; i++) line(ctx, [[-3, 9 + i * 2], [3, 10.4 + i * 2]], c, 1.4);
        break;
      case 'bracer':
        ell(ctx, 0, 14, 3.2, 3.2, skin);
        rrect(ctx, -3.3, 8.5, 6.6, 4, 1.5, c, sh(c, -0.4)); ell(ctx, 0, 10.5, 1.1, 1.1, sp.trim || '#3a7ad0');
        break;
      default: ell(ctx, 0, 14, 3.2, 3.2, skin);
    }
  }

  // ---------------- 무기 (묶음별 모양) ----------------
  const WSTYLE = {
    mithril: { blade: 'straight', guard: 'bar', head: 'orb', limb: 'plain', tint: '#f4f8ff' },
    rag:     { blade: 'broad', guard: 'gear', head: 'gear', limb: 'mech' },
    desert:  { blade: 'curved', guard: 'bar', head: 'crescent', limb: 'recurve' },
    pharaoh: { blade: 'khopesh', guard: 'bar', head: 'sun', limb: 'recurve', tint: '#2a50b0' },
    frost:   { blade: 'crystal', guard: 'ice', head: 'crystal', limb: 'crystal', glow: '#bfe8ff' },
    storm:   { blade: 'zig', guard: 'bar', head: 'bolt', limb: 'zig', glow: '#fff09a' },
    sky:     { blade: 'straight', guard: 'wing', head: 'wing', limb: 'wing', glow: '#e8f0ff' },
    void:    { blade: 'jagged', guard: 'spike', head: 'void', limb: 'spike', glow: '#b070ff' },
    starheir:{ blade: 'radiant', guard: 'star', head: 'star', limb: 'star', glow: '#ffe680' },
    red:     { blade: 'jagged', guard: 'bar', head: 'orb', limb: 'plain' },
    steel:   { blade: 'broad', guard: 'bar', head: 'orb', limb: 'plain' },
    crystal: { blade: 'straight', guard: 'bar', head: 'crystal', limb: 'plain' },
  };
  function blade(ctx, kind, len, w, c) {
    const d = sh(c, -0.4), x = w / 2;
    switch (kind) {
      case 'broad': poly(ctx, [[-x - 1, 4], [x + 1, 4], [x + 1.5, len - 6], [0, len + 1], [-x - 1, len - 4]], c, d, 1);
        ell(ctx, 0, 8, 0.9, 0.9, d); ell(ctx, 0, len * 0.5, 0.9, 0.9, d); break;
      case 'curved':
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-x, 4); ctx.quadraticCurveTo(-x - 1, len * 0.7, -x - 7, len);
        ctx.quadraticCurveTo(x + 3, len * 0.65, x, 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = d; ctx.lineWidth = 1; ctx.stroke(); break;
      case 'khopesh':
        rrect(ctx, -x * 0.7, 4, x * 1.4, len * 0.45, 1, c, d);
        ctx.strokeStyle = c; ctx.lineWidth = w + 1.5; ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.arc(-5, len * 0.45 + 6, 7, -0.2, PI * 0.95); ctx.stroke();
        ctx.strokeStyle = '#f0d060'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-5, len * 0.45 + 6, 7 + w / 2 + 0.4, -0.2, PI * 0.95); ctx.stroke(); break;
      case 'crystal':
        poly(ctx, [[-x, 4], [x, 4], [x + 2.5, len * 0.55], [0, len + 3], [-x - 2.5, len * 0.55]], c, '#ffffff', 1);
        line(ctx, [[0, 5], [0, len]], 'rgba(255,255,255,.75)', 1); break;
      case 'zig': {
        const pts = [[-x, 4]];
        for (let i = 1; i < 5; i++) pts.push([-x - (i % 2 ? 2.2 : 0), 4 + (len - 4) * i / 5]);
        pts.push([0, len + 2]);
        for (let i = 4; i > 0; i--) pts.push([x + (i % 2 ? 0 : 2.2), 4 + (len - 4) * i / 5]);
        pts.push([x, 4]); poly(ctx, pts, c, d, 1); break;
      }
      case 'jagged': {
        const pts = [[-x, 4]];
        for (let i = 1; i < 6; i++) pts.push([-x - (i % 2 ? 2.4 : 0), 4 + (len - 4) * i / 6]);
        pts.push([0, len + 1], [x, len - 4], [x, 4]); poly(ctx, pts, c, d, 1); break;
      }
      case 'radiant':
        poly(ctx, [[-x - 0.5, 4], [x + 0.5, 4], [x + 0.5, len - 4], [0, len + 3], [-x - 0.5, len - 4]], c, '#fffbe0', 1);
        line(ctx, [[0, 6], [0, len - 1]], '#ffffff', 1.4); break;
      default: rrect(ctx, -x, 4, w, len, 2, c, d);
    }
  }
  function guard(ctx, kind, w, c) {
    switch (kind) {
      case 'gear': ctx.fillStyle = '#7a6a5a'; for (let i = 0; i < 6; i++) { const a = i * PI / 3; ctx.fillRect(Math.cos(a) * 5 - 1.3, 3.5 + Math.sin(a) * 5 - 1.3, 2.6, 2.6); }
        ell(ctx, 0, 3.5, 4.4, 4.4, '#9a8a7a'); ell(ctx, 0, 3.5, 1.6, 1.6, '#d0843e'); break;
      case 'ice': poly(ctx, [[-w, 3], [-w - 3, 0], [0, 4.5], [w + 3, 0], [w, 3], [0, 6]], '#e8f6ff', '#7ab8e0', 0.8); break;
      case 'wing': for (const s of [-1, 1]) for (let i = 0; i < 3; i++) ell(ctx, s * (4 + i * 2.2), 3 - i * 1.6, 3.2 - i * 0.5, 1.4, '#ffffff', '#b8c8e8', 0.5); break;
      case 'spike': poly(ctx, [[-w - 4, -1], [-1, 3], [1, 3], [w + 4, -1], [w, 5], [-w, 5]], '#3a1a5a', '#c890ff', 0.8); break;
      case 'star': ctx.fillStyle = '#c9a33a'; ctx.fillRect(-w, 2, w * 2, 3); star(ctx, 0, 3.5, 4, '#fff4b0'); break;
      default: ctx.fillStyle = '#c9a33a'; ctx.fillRect(-w, 2, w * 2, 3.5);
    }
  }
  function weapon(ctx, type, color, st) {
    const c = color || '#ccc', W = WSTYLE[st] || {};
    if (!W.blade && !W.head && !W.limb) { D.weapon(ctx, type, color); return; }   // 기본 무기는 예전 모양
    ctx.save(); ctx.translate(0, 14);
    if (W.glow) glowOn(ctx, W.glow, 7);
    if (type === 'sword' || type === 'dagger') {
      const dag = type === 'dagger';
      ctx.rotate(dag ? -1.8 : -1.9);
      blade(ctx, W.blade || 'straight', dag ? 17 : 32, dag ? 4 : 5, c);
      glowOff(ctx);
      guard(ctx, W.guard || 'bar', dag ? 5 : 7, c);
      ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-2, -6, 4, 8);
      if (W.guard === 'star') star(ctx, 0, -7, 2.4, '#fff4b0', 4);
      else ell(ctx, 0, -6.5, 2.2, 2.2, W.tint || '#c9a33a');
    } else if (type === 'wand') {
      ctx.rotate(-1.4);
      ctx.strokeStyle = st === 'void' ? '#2a1a3a' : st === 'starheir' || st === 'pharaoh' ? '#c9a33a' : '#7a4a22';
      ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      glowOff(ctx); ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, 22); ctx.stroke();
      if (W.glow) glowOn(ctx, W.glow, 8);
      const y = 26;
      switch (W.head) {
        case 'gear': for (let i = 0; i < 8; i++) { const a = i * PI / 4; ctx.fillStyle = '#7a6a5a'; ctx.fillRect(Math.cos(a) * 5.6 - 1.4, y + Math.sin(a) * 5.6 - 1.4, 2.8, 2.8); }
          ell(ctx, 0, y, 5, 5, '#9a8a7a'); ell(ctx, 0, y, 2.6, 2.6, c); break;
        case 'crescent': ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, y, 6, PI * 0.15, PI * 1.85); ctx.arc(2.5, y, 4.4, PI * 1.7, PI * 0.3, true); ctx.fill(); break;
        case 'sun': for (let i = 0; i < 8; i++) { const a = i * PI / 4; line(ctx, [[Math.cos(a) * 5, y + Math.sin(a) * 5], [Math.cos(a) * 8, y + Math.sin(a) * 8]], '#f0d060', 1.6); }
          ell(ctx, 0, y, 5, 5, c, '#f0d060', 1); break;
        case 'crystal': poly(ctx, [[0, y - 6], [4, y], [0, y + 9], [-4, y]], c, '#ffffff', 1); break;
        case 'bolt': poly(ctx, [[1, y - 4], [-3.5, y + 3], [0, y + 3], [-2, y + 10], [4.5, y + 1], [1, y + 1]], c, '#fff', 0.6); break;
        case 'wing': for (const s of [-1, 1]) for (let i = 0; i < 3; i++) ell(ctx, s * (6 + i * 1.6), y - 2 + i * 2, 4 - i * 0.6, 1.6, '#ffffff', '#b8c8e8', 0.5);
          ell(ctx, 0, y, 4.6, 4.6, c); break;
        case 'void': ell(ctx, 0, y, 5.4, 5.4, '#1a0a2a', '#c890ff', 1.4); ell(ctx, 0, y, 2, 2, '#e0b0ff'); break;
        case 'star': star(ctx, 0, y, 7.5, c); star(ctx, 0, y, 3, '#ffffff'); break;
        default: ell(ctx, 0, y - 1, 5, 5, c, sh(c, -0.4)); ell(ctx, -1.5, y - 2.5, 1.5, 1.5, '#fff');
      }
    } else if (type === 'bow') {
      const lc = st === 'void' ? '#3a1a5a' : c;
      ctx.strokeStyle = lc; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-17, -2); ctx.quadraticCurveTo(0, 22, 17, -2); ctx.stroke();
      glowOff(ctx);
      ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-17, -2); ctx.lineTo(17, -2); ctx.stroke();
      if (W.glow) glowOn(ctx, W.glow, 7);
      for (const s of [-1, 1]) {
        const x = s * 17, y = -2;
        switch (W.limb) {
          case 'recurve': ctx.strokeStyle = lc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + s * 4, y - 1, x + s * 4, y - 5); ctx.stroke(); break;
          case 'mech': ell(ctx, x, y, 3, 3, '#7a6a5a', '#3a3028', 1); ell(ctx, x, y, 1, 1, '#d0843e'); break;
          case 'crystal': poly(ctx, [[x, y - 5], [x + s * 3, y], [x, y + 4], [x - s * 2, y]], '#e8f6ff', '#7ab8e0', 0.8); break;
          case 'zig': poly(ctx, [[x, y], [x + s * 4, y - 3], [x + s * 2, y - 3], [x + s * 5, y - 7], [x + s * 1, y - 3.5]], '#ffe060'); break;
          case 'wing': for (let i = 0; i < 3; i++) ell(ctx, x - s * (1 + i * 3), y + 2 + i * 3.5, 3.4, 1.4, '#ffffff', '#b8c8e8', 0.5); break;
          case 'spike': poly(ctx, [[x, y + 1], [x + s * 5, y - 5], [x - s * 1, y - 2]], '#c890ff'); break;
          case 'star': star(ctx, x, y, 3.2, '#fff4b0'); break;
        }
      }
      if (W.limb === 'star') star(ctx, 0, 8, 3.6, '#fff4b0');
      else if (W.limb === 'wing' || W.limb === 'crystal' || W.limb === 'spike') ell(ctx, 0, 8.5, 2, 2, W.glow || c);
    } else D.weapon(ctx, type, color);
    glowOff(ctx);
    ctx.restore();
  }

  // ---------------- 복장 (캐릭터 만들기 4종) ----------------
  //  e.navy / e.sash : 복장마다 쓰는 장식색 (하의 색에서 뽑는다 → NPC가 써도 그 NPC 색에 맞음)
  function outfitParts(id, lk) {
    switch (id) {
      case 'sailor':     return { top: 'sailor', leg: 'wide', shoe: 'shoe', skirt: 'pleat', sleeve: 'sailor', navy: lk.bottom };
      case 'traveler':   return { top: 'traveler', leg: 'pants', shoe: 'tallboot', skirt: 'plain', cape: 'travel', mantle: true };
      case 'apprentice': return { top: 'apprentice', leg: 'robe', shoe: 'shoe', robe: true, sleeve: 'apprentice', sash: '#e8c060' };
      // 1번 꾸미기: casual = 초보 모험가 복장 (조끼), 새 처음 옷 4종
      case 'casual':     return { top: 'vest', leg: 'pants', shoe: 'boot', skirt: 'plain' };
      case 'ranger':     return { top: 'tunic', leg: 'pants', shoe: 'tallboot', skirt: 'plain' };
      case 'scholar':    return { top: 'vest', leg: 'pants', shoe: 'shoe', skirt: 'pleat' };
      case 'explorer':   return { top: 'tunic', leg: 'pants', shoe: 'tallboot', skirt: 'plain', mantle: true };
      case 'squire':     return { top: 'plate', leg: 'pants', shoe: 'boot', skirt: 'plain' };
      default:           return { top: 'plain', leg: 'pants', shoe: 'shoe', skirt: 'plain' };
    }
  }

  // ---------------- 전체 그리기 ----------------
  // o: humanoid 인자 + gear (gearOf 결과). look.outfit: 복장 id
  function draw(ctx, o) {
    const s = o.scale || 1, lk = o.look, g = o.gear || {}, t = o.t || 0;
    const skin = lk.skin || '#ffe0c2', fem = lk.gender === 'f';
    const e = outfitParts(lk.outfit, lk);
    const sTop = g.top ? g.top.sp : {}, topC = lk.top, botC = lk.bottom;
    const topKind = g.top ? g.top.k : e.top;
    ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.dir * s, s);
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    if (o.hurt) ctx.filter = 'brightness(1.8)';
    D.shadow(ctx, 15);
    // 1번 꾸미기: 새 그림체 머리 (G.Head2). 사람 모양 몬스터(oldHead) · 가면은 옛 머리
    const H2 = G.Head2 && !o.oldHead && !o.mask ? G.Head2 : null;
    if (H2) H2.back(ctx, lk, !!g.hat);
    const sw = o.moving && !o.air ? Math.sin(t * 14) * 0.55 : (o.air ? 0.45 : 0);

    // 망토 (장비 망토가 우선, 여행자 복장은 기본 어깨 망토)
    if (o.cape) cape(ctx, o, g.cape ? g.cape.k : (lk.outfit === 'traveler' && !g.top ? 'travel' : 'long'), o.cape, g.cape ? g.cape.sp : {});
    else if (e.cape && !g.top) cape(ctx, o, e.cape, sh(topC, -0.3), {});
    // 후드 (캐주얼)
    if (e.hood && !g.top) hood(ctx, topC);

    // 다리 + 신발
    const robe = e.robe && !g.bottom;
    const legKind = g.bottom ? g.bottom.k : e.leg;
    const shoeKind = g.shoes ? g.shoes.k : (robe ? 'shoe' : e.shoe);
    const shoeC = g.shoes ? g.shoes.c : sh(botC, -0.45);
    for (const [lx, a] of [[-4, sw], [4, -sw]]) {
      ctx.save(); ctx.translate(lx, -15); ctx.rotate(a);
      leg(ctx, legKind === 'kilt' ? 'bare' : legKind, botC, skin);
      shoe(ctx, shoeKind, shoeC, skin, g.shoes ? g.shoes.sp : {});
      ctx.restore();
    }
    // 치마 · 로브 자락 · 킬트
    if (robe) lower(ctx, 'robe', topC, null, sw);
    else if (legKind === 'kilt') lower(ctx, 'kilt', botC, g.bottom.sp, sw);
    else if (fem && !(e.noSkirt && !g.bottom)) {
      if (g.bottom && g.bottom.k === 'greave') lower(ctx, 'tasset', botC, g.bottom.sp, sw);
      else if (!g.bottom && e.skirt === 'pleat') lower(ctx, 'pleat', botC, '#ffffff', sw);
      else if (!(g.bottom && g.bottom.k === 'baggy')) lower(ctx, 'plain', botC, null, sw);
    }

    // 몸통
    torso(ctx, topKind, topC, lk, sTop, e);
    if (e.mantle && !g.top && !o.cape) mantle(ctx, sh(topC, -0.3));

    // 머리
    if (H2) H2.front(ctx, lk, t, !!g.hat);
    else {
    D.hairBack(ctx, lk);
    ell(ctx, 1, -50, 13, 13, skin, sh(skin, -0.25), 1);
    D.hair(ctx, lk);
    if (o.mask) {
      ctx.fillStyle = o.mask; ctx.fillRect(-12, -55, 27, 7);
      ell(ctx, 6, -51, 2, 2, '#fff'); ell(ctx, 11, -51, 2, 2, '#fff');
      ctx.fillStyle = o.mask; ctx.beginPath(); ctx.moveTo(-12, -54); ctx.lineTo(-20, -60); ctx.lineTo(-19, -50); ctx.closePath(); ctx.fill();
    } else D.face(ctx, lk, t);
    if (lk.beard) { ctx.fillStyle = lk.hair || '#ddd'; ctx.beginPath(); ctx.arc(4, -42, 8, 0, PI); ctx.fill(); }
    }
    const hc = o.hatColor || lk.hat;
    if (hc && !H2) hat(ctx, g.hat ? g.hat.k : 'plain', hc, g.hat ? g.hat.sp : {}, t);
    else if (hc && (g.hat || o.hatColor)) { ctx.save(); H2.hatSpace(ctx); hat(ctx, g.hat ? g.hat.k : 'plain', hc, g.hat ? g.hat.sp : {}, t); ctx.restore(); }   // 장비 모자는 새 머리 크기로

    // 팔 + 장갑 + 무기
    let arm = -0.3;
    if (o.atk >= 0) {
      if (o.atkKind === 'melee') { const k = 1 - Math.pow(1 - o.atk, 3); arm = -2.8 + k * 3.3; }
      else arm = -1.45;
    } else if (o.moving && !o.air) arm = -0.3 + Math.sin(t * 14) * 0.3;
    ctx.save(); ctx.translate(2, -31); ctx.rotate(arm);
    sleeve(ctx, g.top ? (topKind === 'plate' || topKind === 'royal' ? topKind : 'plain') : (e.sleeve || 'plain'), topC, e, sTop);
    hand(ctx, g.gloves ? g.gloves.k : 'none', g.gloves ? g.gloves.c : null, skin, g.gloves ? g.gloves.sp : {});
    if (o.weapon) weapon(ctx, o.weapon, o.wcolor, g.weapon ? g.weapon.st : null);
    if (g.top) pauldron(ctx, topKind, topC, sTop);
    ctx.restore();
    ctx.restore();
  }

  return { draw, gearOf, gearFrom, styleOf, S, WSTYLE, outfitParts };
})();
