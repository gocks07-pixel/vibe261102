'use strict';
// 1.7.10 직업 스킬 수정 (전사 · 궁수) + 1.7.11 (마법사 · 도적). 피해 배율 · MP · 재사용 대기는 그대로, 동작 · 효과 · 연출만 덧붙인다
//  G.SKILL_X[스킬 id] = {
//    heavy: 타격 멈춤(초) + 흔들림,  push/pull: 밀쳐내기/끌어오기 세기,  stun: 기절(초),  slow: [초, %]
//    crack: { len, mul } 땅 갈라짐 → 0.4초 뒤 앞쪽에 한 번 더 (mul = 배율 비율, 0이면 연출만)
//    zone: { r, dur, mul, kind, ahead } 바닥 장판 (0.5초마다 피해)
//    explode: { delay, r, mul } 처음 맞은 적 자리에서 지연 폭발,  slowNear: { r, dur, v } 쓴 자리 주변 둔화
//    burn: [초, 최대 데미지 비율] 화상,  freeze: 빙결(초),  chain: { n, r, mul, star } 튕기기,  mark: { dur, mul } 표식,  poisonStack: { max, dps, dur } 독 쌓기,  advance: 앞으로 이동,  ret: 돌아오는 투사체
//    aim: 조준선 시간(초) 뒤에 발사,  invuln: 무적(초),  trail: 돌진 불꽃 색,  proj: 투사체 그림,  fx: 전용 연출,  note: 설명에 덧붙는 말
//  }
// 버프 각성(천붕검제 · 불멸 · 천궁 · 분노)은 버프가 켜져 있는 동안 캐릭터 뒤에 모습이 보인다 (aura)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos, rand = (a, b) => G.U.rand(a, b);

  G.SKILL_X = {
    // ===== 전사 1차 =====
    w_strike: { heavy: 0.07, fx: 'dust' },
    w_whirl: { push: 120 },
    w_charge: { push: 260, note: '맞은 적을 밀쳐냅니다.' },
    // ===== 대검사 → 파쇄자 → 천붕검제: 무거운 한 방 + 땅 가르기 =====
    w2a_cleave: { heavy: 0.06, crack: { len: 300, mul: 0.5 }, note: '0.4초 뒤 갈라진 땅이 한 번 더 터져 50% 피해.' },
    w2a_spin: { push: 150, fx: 'firering' },
    w2a_blade: { proj: 'crescent' },
    w3a_crush: { heavy: 0.08, fx: 'rocks' },
    w3a_quake: { heavy: 0.05, fx: 'quake', stun: 0.4, note: '맞은 적이 잠깐(0.4초) 휘청입니다.' },
    w3a_rush: { trail: '#ff9a3a', heavy: 0.05 },
    w3a_meteor: { proj: 'flamedrop' },
    w4a_heaven: { heavy: 0.09, fx: 'bigsword', crack: { len: 240, mul: 0 } },
    w4a_meteor: { proj: 'fsword' },
    w4a_final: { heavy: 0.1, fx: 'bigsword2' },
    // ===== 방패기사 → 철벽기사 → 불멸의 수호자: 막고 · 기절 · 지키기 =====
    w2b_bash: { stun: 1.0, fx: 'shieldflash', note: '맞은 적을 1초 기절시킵니다.' },
    w2b_wave: { pull: 300, fx: 'goldwave', note: '주변 적을 앞으로 끌어당깁니다.' },
    w2b_throw: { proj: 'shieldp' },
    w3b_wall: { push: 320, invuln: 0.4, note: '돌진하는 동안 무적, 적을 밀어냅니다.' },
    w3b_hammer: { stun: 1.5, fx: 'hammer', note: '맞은 적을 1.5초 기절시킵니다.' },
    w3b_sanct: { zone: { r: 220, dur: 4, mul: 0.25, kind: 'sanct' }, note: '4초 동안 성역이 남아 0.5초마다 25% 피해.' },
    w3b_light: { proj: 'lspear' },
    w4b_strike: { heavy: 0.07, fx: 'lightpillar' },
    w4b_judge: { proj: 'lspear', stun: 0.8, note: '맞은 적을 0.8초 기절시킵니다.' },
    w4b_final: { heavy: 0.1, fx: 'cross' },
    // ===== 궁수 1차 =====
    a_back: { invuln: 0.3 },
    // ===== 사냥꾼 → 매의 사수 → 천궁: 빠른 연사 + 바람 관통 + 매 =====
    a2a_gale: { proj: 'windarrow' },
    a3a_hawk: { proj: 'hawk' },
    a3a_storm: { zone: { r: 150, dur: 2, mul: 0.3, kind: 'tornado', ahead: 240 }, note: '회오리가 2초 남아 0.5초마다 30% 피해.' },
    a3a_evade: { invuln: 0.5, note: '물러나는 동안 무적.' },
    a3a_dive: { proj: 'windarrow' },
    a4a_volley: { fx: 'bowglow' },
    a4a_rain: { fx: 'gate' },
    a4a_final: { fx: 'stormcloud' },
    // ===== 석궁수 → 저격수 → 섬광의 저격왕: 모았다 쏘는 한 방 + 폭발 =====
    a2b_pierce: { proj: 'bolt', push: 200, note: '맞은 적을 밀쳐냅니다.' },
    a2b_spread: { proj: 'pellet' },
    a2b_net: { proj: 'bolt', invuln: 0.3 },
    a3b_snipe: { proj: 'bolt', aim: 0.35, heavy: 0.06, note: '0.35초 조준한 뒤 쏩니다.' },
    a3b_blast: { proj: 'bolt', explode: { delay: 1, r: 120, mul: 0.6 }, note: '1초 뒤 처음 맞은 자리에서 폭발해 주변에 60% 피해.' },
    a3b_shadow: { proj: 'bolt', fx: 'smoke', slowNear: { r: 160, dur: 3, v: 40 }, invuln: 0.4, note: '연막을 남겨 주변 적을 3초 둔화.' },
    a3b_mine: { proj: 'mine' },
    a4b_flash: { aim: 0.3, fx: 'lbeam', heavy: 0.06, note: '0.3초 조준한 뒤 쏩니다.' },
    a4b_barrage: { proj: 'bolt' },
    a4b_final: { aim: 0.45, fx: 'lbeam', heavy: 0.1, note: '0.45초 조준한 뒤 쏩니다.' },

    // ======================= 1.7.11 마법사 · 도적 =======================
    // ===== 마법사 1차 =====
    m_bolt: { proj: 'starorb' },
    m_burst: { fx: 'magiccircle' },
    // ===== 화염술사 → 업화술사 → 화염군주: 불붙이고 터뜨리기 =====
    m2a_fireball: { proj: 'fireball', burn: [3, 0.25], note: '맞은 적에게 3초 화상.' },
    m2a_explode: { fx: 'firebloom', burnPop: true, note: '화상 입은 적은 더 크게 터집니다.' },
    m2a_meteor: { proj: 'meteor' },
    m3a_inferno: { proj: 'inferno', burn: [3, 0.3], note: '맞은 적에게 3초 화상.' },
    m3a_pillar: { proj: 'flamedrop', fx: 'pillars' },
    m3a_storm: { fx: 'firetornado', burn: [2, 0.2], note: '맞은 적에게 2초 화상.' },
    m3a_ring: { fx: 'firering2', burn: [3, 0.2], note: '맞은 적에게 3초 화상.' },
    m4a_lance: { proj: 'firelance', burn: [3, 0.3], note: '맞은 적에게 3초 화상.' },
    m4a_blaze: { proj: 'flamedrop', zone: { r: 260, dur: 3, mul: 0.2, kind: 'fire', ahead: 240 }, note: '바닥이 3초 동안 불바다가 되어 0.5초마다 20% 피해.' },
    m4a_final: { proj: 'meteor', fx: 'sun', heavy: 0.08 },
    // ===== 빙뢰술사 → 폭풍술사 → 천둥의 현자: 얼려서 느리게 + 튕기는 번개 =====
    m2b_beam: { proj: 'icebeam', slow: [2, 40], note: '맞은 적을 2초 둔화.' },
    m2b_chain: { chain: { n: 3, r: 280, mul: 0.5 }, note: '번개가 주변 적 3명에게 튕겨 50% 피해.' },
    m2b_shard: { proj: 'icicle', slow: [1.5, 30] },
    m3b_thunder: { proj: 'lightning', fx: 'cloud' },
    m3b_freeze: { freeze: 0.8, fx: 'icecrack', note: '맞은 적을 0.8초 빙결.' },
    m3b_spear: { proj: 'icespear', slow: [2, 40], note: '맞은 적을 2초 둔화.' },
    m3b_bolt: { proj: 'lightning', stun: 0.3 },
    m4b_judge: { proj: 'lightning', fx: 'thunderpillar' },
    m4b_zero: { freeze: 1, fx: 'frostscreen', heavy: 0.06, note: '맞은 적을 1초 빙결.' },
    m4b_final: { fx: 'cloud', chain: { n: 5, r: 320, mul: 0.4 }, heavy: 0.08, note: '번개가 주변 적 5명에게 튕겨 40% 피해.' },
    // ===== 암살자 → 그림자추적자 → 야천: 표창 + 그림자 + 표식 =====
    t2a_triple: { chain: { n: 1, r: 260, mul: 0.6, star: true }, note: '표창이 다음 적에게 한 번 튕겨 60% 피해.' },
    t2a_vital: { mark: { dur: 5, mul: 0.2 }, note: '맞은 적에게 5초 표식 (받는 피해 +20%).' },
    t2a_shadow: { fx: 'shadowpuff', trail: '#8a6ad0' },
    t3a_shadowstar: { proj: 'bigstar', ret: true, note: '표창이 돌아오며 한 번 더 맞힙니다.' },
    t3a_flash: { trail: '#8a6ad0', fx: 'shadowpuff' },
    t3a_storm: { fx: 'starring' },
    t4a_night: { fx: 'clones' },
    t4a_dark: { fx: 'darknight', heavy: 0.06 },
    t4a_final: { fx: 'darknight', heavy: 0.1, mark: { dur: 5, mul: 0.2 }, note: '맞은 적에게 5초 표식 (받는 피해 +20%).' },
    // ===== 쌍검사 → 칼날무희 → 천인검무: 끊이지 않는 연속 베기 + 독 쌓기 =====
    t2b_dance: { poisonStack: { max: 5, dps: 0.08, dur: 4 }, note: '맞을 때마다 독이 쌓입니다 (최대 5번).' },
    t2b_whirl: { advance: 120, note: '회전하면서 앞으로 나아갑니다.' },
    t2b_toss: { proj: 'pdagger', poisonStack: { max: 5, dps: 0.08, dur: 4 }, note: '맞을 때마다 독이 쌓입니다 (최대 5번).' },
    t3b_storm: { fx: 'bladewind' },
    t3b_mist: { fx: 'mist' },
    t3b_blades: { fx: 'floatblades' },
    t3b_rain: { proj: 'blade' },
    t4b_thousand: { fx: 'thousand', heavy: 0.07, poisonStack: { max: 5, dps: 0.08, dur: 4 } },
    t4b_tempest: { advance: 200, fx: 'bladewind', note: '칼날 폭풍과 함께 앞으로 휩쓸며 나아갑니다.' },
    t4b_final: { fx: 'thousand', heavy: 0.1, poisonStack: { max: 5, dps: 0.08, dur: 4 } },
  };
  // 버프가 켜져 있는 동안 보이는 모습
  const AURA = { w2a_rage: 'rage', w4a_awake: 'swords', w4b_awake: 'wings', a4a_awake: 'feathers', m4a_awake: 'flamecrown', m4b_awake: 'stormring', t4a_awake: 'shadowclone', t4b_awake: 'petals' };

  // ---------- 그리기 도우미 ----------
  const glowC = (ctx, x, y, r, col, a) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const poly = (ctx, pts, fill, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } };
  const zigLine = (ctx, x0, y, dir, len, seed, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x0, y); const n = 9; for (let i = 1; i <= n; i++) ctx.lineTo(x0 + dir * len * i / n, y + ((i * 7 + seed) % 5 - 2) * 2.2); ctx.stroke(); };
  const sword = (ctx, len, w, col, edge) => {   // +x 방향으로 날이 선 검 (원점 = 손잡이)
    poly(ctx, [[0, -w], [len - w * 2, -w], [len, 0], [len - w * 2, w], [0, w]], col, edge, 1.5);
    ctx.fillStyle = edge; ctx.fillRect(-3, -w * 2.4, 5, w * 4.8); ctx.fillRect(-14, -2.5, 12, 5);
  };
  const fx = (o) => G.FX.add(Object.assign({ k: 'fn', glow: true }, o));
  const shuriPath = (ctx, r) => { ctx.fillStyle = 'rgba(230,220,255,.95)'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.3 : r, a = i * PI / 4; ctx.lineTo(cos(a) * rr, sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.fillStyle = '#3a2a5a'; ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, PI * 2); ctx.fill(); };

  // ---------- 전용 연출 (스킬을 쓸 때 한 번) ----------
  const FXS = {
    dust: (p, w, el) => { const gx = p.x + p.dir * 70; for (let i = 0; i < 10; i++) G.FX.add({ k: 'p', x: gx + rand(-30, 30), y: p.y - 4, vx: rand(-90, 90), vy: rand(-160, -60), grav: 400, color: 'rgba(200,180,150,.85)', r: rand(2, 4), life: 0.5 }); },
    firering: (p, w, el) => fx({ x: p.x, y: p.y - 6, life: 0.5, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#ffb050'; ctx.lineWidth = 8 * (1 - k); ctx.beginPath(); ctx.ellipse(f.x, f.y, 60 + k * 120, 16 + k * 26, 0, 0, PI * 2); ctx.stroke(); } }),
    rocks: (p, w) => { const gx = p.x + p.dir * 90; for (let i = 0; i < 12; i++) G.FX.add({ k: 'p', x: gx + rand(-40, 40), y: p.y - 20, vx: rand(-200, 200), vy: rand(-380, -160), grav: 900, color: ['#8a7a6a', '#6a5a4a', '#b0a090'][i % 3], r: rand(3, 6), life: 0.8 }); w.shake(6); },
    quake: (p, w, el) => {
      for (let i = 0; i < 3; i++) setTimeout(() => G.FX.add({ k: 'fn', x: p.x, y: p.y - 4, life: 0.5, glow: true, draw(ctx, f, k) { ctx.globalAlpha = (1 - k) * 0.9; ctx.strokeStyle = el; ctx.lineWidth = 6 * (1 - k); ctx.beginPath(); ctx.ellipse(f.x, f.y, 80 + k * 220, 10 + k * 14, 0, PI, PI * 2); ctx.stroke(); } }), i * 110);
      FXS.rocks(p, w);
    },
    bigsword: (p, w, el) => fx({ x: p.x + p.dir * 120, y: p.y, dir: p.dir, life: 0.7, draw(ctx, f, k) {
      const drop = Math.min(1, k / 0.3), y = f.y - 300 * (1 - drop) - 10;
      ctx.globalAlpha = k < 0.3 ? 0.9 : (1 - k) / 0.7 * 0.9;
      ctx.save(); ctx.translate(f.x, y); ctx.rotate(PI / 2); glowC(ctx, -60, 0, 90, '#ffd080', 0.6); sword(ctx, 0, 0, '', ''); ctx.translate(-190, 0); sword(ctx, 190, 13, 'rgba(255,240,200,.95)', '#ffb040'); ctx.restore();
      if (drop >= 1 && !f.hit) { f.hit = true; G.Game.world.shake(9); G.FX.burst(f.x, f.y - 6, '#ffb040', 18, 320); }
    } }),
    bigsword2: (p, w, el) => { FXS.bigsword(p, w, el); setTimeout(() => G.FX.shock(p.x, p.y - 30, 400, '#ffb040'), 220); G.FX.flash(p.x, p.y - 60, 260, '#ffd080', 0.4); },
    shieldflash: (p, w) => fx({ x: p.x + p.dir * 70, y: p.y - 45, life: 0.35, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; ctx.save(); ctx.translate(f.x, f.y); ctx.scale(1 + k * 0.6, 1 + k * 0.6); poly(ctx, [[0, -30], [24, -22], [22, 4], [0, 30], [-22, 4], [-24, -22]], 'rgba(255,230,140,.55)', '#fff3b0', 3); ctx.restore(); } }),
    goldwave: (p, w) => fx({ x: p.x, y: p.y - 4, life: 0.6, draw(ctx, f, k) { for (let i = 0; i < 3; i++) { const kk = Math.max(0, 1 - k - i * 0.15); ctx.globalAlpha = kk; ctx.strokeStyle = '#ffe080'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(f.x, f.y, 40 + (1 - kk) * 200 + i * 30, 10 + (1 - kk) * 22, 0, 0, PI * 2); ctx.stroke(); } } }),
    hammer: (p, w) => fx({ x: p.x + p.dir * 110, y: p.y, life: 0.6, draw(ctx, f, k) {
      const drop = Math.min(1, k / 0.25), y = f.y - 40 - 220 * (1 - drop);
      ctx.globalAlpha = k < 0.3 ? 1 : (1 - k) / 0.7;
      glowC(ctx, f.x, y - 20, 80, '#fff0a0', 0.6);
      ctx.fillStyle = 'rgba(255,245,200,.95)'; ctx.fillRect(f.x - 6, y - 70, 12, 70); ctx.fillRect(f.x - 38, y - 18, 76, 40);
      ctx.strokeStyle = '#ffc040'; ctx.lineWidth = 3; ctx.strokeRect(f.x - 38, y - 18, 76, 40);
      if (drop >= 1 && !f.hit) { f.hit = true; G.Game.world.shake(7); G.FX.shock(f.x, f.y - 10, 120, '#ffe080'); }
    } }),
    lightpillar: (p, w) => { const x = p.x + p.dir * 120; G.FX.pillar(x, p.y, '#fff0a0'); fx({ x, y: p.y, life: 0.6, draw(ctx, f, k) { ctx.globalAlpha = (1 - k) * 0.85; const g = ctx.createLinearGradient(f.x - 40, 0, f.x + 40, 0); g.addColorStop(0, 'rgba(255,240,160,0)'); g.addColorStop(0.5, 'rgba(255,250,220,1)'); g.addColorStop(1, 'rgba(255,240,160,0)'); ctx.fillStyle = g; ctx.fillRect(f.x - 40, f.y - 420, 80, 420); } }); },
    cross: (p, w) => { fx({ x: p.x, y: p.y - 90, life: 0.9, draw(ctx, f, k) { const s = 1 + k * 0.8; ctx.globalAlpha = (1 - k); glowC(ctx, f.x, f.y, 220 * s, '#fff0a0', 0.7); ctx.fillStyle = 'rgba(255,250,220,.95)'; ctx.fillRect(f.x - 12 * s, f.y - 90 * s, 24 * s, 180 * s); ctx.fillRect(f.x - 60 * s, f.y - 40 * s, 120 * s, 24 * s); } }); G.FX.shock(p.x, p.y - 30, 400, '#ffe080'); },
    bowglow: (p) => fx({ x: p.x + p.dir * 24, y: p.y - 40, life: 0.35, draw(ctx, f, k) { glowC(ctx, f.x, f.y, 60, '#c8ffd0', 1 - k); } }),
    gate: (p, w) => fx({ x: p.x + p.dir * 260, y: p.y - 430, life: 0.9, draw(ctx, f, k) { const a = k < 0.2 ? k / 0.2 : (1 - k) / 0.8; ctx.globalAlpha = a; ctx.strokeStyle = '#d8ffe0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(f.x, f.y, 300, 60, 0, PI, PI * 2); ctx.stroke(); glowC(ctx, f.x, f.y, 260, '#a0ffb0', 0.35 * a); } }),
    stormcloud: (p, w) => { const x = p.x + p.dir * 280; fx({ x, y: p.y - 400, life: 1.2, glow: false, draw(ctx, f, k) { const a = k < 0.15 ? k / 0.15 : (1 - k) / 0.85; ctx.globalAlpha = a * 0.85; ctx.fillStyle = '#5a6a7a'; for (const [dx, dy, r] of [[-200, 10, 70], [-90, -10, 90], [30, 0, 100], [150, -8, 85], [250, 12, 60]]) { ctx.beginPath(); ctx.arc(f.x + dx, f.y + dy, r, 0, PI * 2); ctx.fill(); } if (Math.floor(k * 12) % 3 === 0) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#fff6b0'; ctx.lineWidth = 4; ctx.beginPath(); let xx = f.x - 120 + (Math.floor(k * 12) * 53) % 260, yy = f.y + 60; ctx.moveTo(xx, yy); for (let i = 0; i < 6; i++) { xx += rand(-20, 20); yy += 60; ctx.lineTo(xx, yy); } ctx.stroke(); } } }); },
    smoke: (p, w) => { for (let i = 0; i < 16; i++) G.FX.add({ k: 'p', x: p.sx + rand(-50, 50), y: p.y - rand(10, 60), vx: rand(-60, 60), vy: rand(-50, -10), grav: -10, color: 'rgba(150,150,165,.7)', r: rand(8, 16), life: 1.2 }); },
    lbeam: (p, w) => fx({ x: p.x + p.dir * 20, y: p.y - 36, dir: p.dir, life: 0.4, draw(ctx, f, k) { const len = 1100, a = 1 - k; ctx.globalAlpha = a; const x1 = f.dir > 0 ? f.x : f.x - len; const g = ctx.createLinearGradient(0, f.y - 14, 0, f.y + 14); g.addColorStop(0, 'rgba(255,240,180,0)'); g.addColorStop(0.5, 'rgba(255,255,240,1)'); g.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = g; ctx.fillRect(x1, f.y - 14 * (1 + k), len, 28 * (1 + k)); } }),

    // ----- 1.7.11 마법사 · 도적 -----
    magiccircle: (p, w, el) => fx({ x: p.x + p.dir * 90, y: p.y - 40, life: 0.55, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; ctx.strokeStyle = el; ctx.lineWidth = 3; ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(k * 2); ctx.beginPath(); ctx.arc(0, 0, 50, 0, PI * 2); ctx.stroke(); ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * PI / 3; ctx.lineTo(cos(a) * 46, sin(a) * 46); } ctx.closePath(); ctx.stroke(); ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * PI / 3 + PI / 6; ctx.lineTo(cos(a) * 46, sin(a) * 46); } ctx.closePath(); ctx.stroke(); ctx.restore(); } }),
    firebloom: (p, w) => fx({ x: p.x, y: p.y - 40, life: 0.45, draw(ctx, f, k) { glowC(ctx, f.x, f.y, 80 + k * 140, '#ff8a30', (1 - k) * 0.9); } }),
    pillars: (p, w) => { for (let i = 0; i < 3; i++) setTimeout(() => { const x = p.x + p.dir * (120 + i * 110); G.FX.add({ k: 'fn', x, y: p.y, life: 0.6, glow: true, draw(ctx, f, k) { const h = 260 * Math.min(1, k * 4); ctx.globalAlpha = 1 - k; const g = ctx.createLinearGradient(0, f.y - h, 0, f.y); g.addColorStop(0, 'rgba(255,200,80,0)'); g.addColorStop(1, 'rgba(255,120,30,.95)'); ctx.fillStyle = g; ctx.fillRect(f.x - 24, f.y - h, 48, h); } }); }, i * 130); },
    firetornado: (p, w) => fx({ x: p.x, y: p.y, life: 0.8, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; for (let i = 0; i < 7; i++) { ctx.strokeStyle = i % 2 ? '#ffb050' : '#ff6a20'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(f.x, f.y - 10 - i * 30, 50 + i * 26, 10 + i * 2, 0, k * 14 + i, k * 14 + i + PI * 1.3); ctx.stroke(); } } }),
    firering2: (p, w) => fx({ x: p.x, y: p.y - 4, life: 0.7, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; const r = 60 + k * 200; for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2, x = f.x + cos(a) * r, y = f.y + sin(a) * r * 0.25; glowC(ctx, x, y - 10, 22, '#ff7a20', 0.9); } } }),
    sun: (p, w) => fx({ x: p.x + p.dir * 260, y: p.y - 420, life: 1.3, draw(ctx, f, k) { const a = k < 0.2 ? k / 0.2 : (1 - k) / 0.8; glowC(ctx, f.x, f.y, 240, '#ffb040', a * 0.8); ctx.globalAlpha = a; ctx.fillStyle = '#fff0b0'; ctx.beginPath(); ctx.arc(f.x, f.y, 60, 0, PI * 2); ctx.fill(); ctx.strokeStyle = '#ffd060'; ctx.lineWidth = 4; for (let i = 0; i < 12; i++) { const an = i * PI / 6 + k; ctx.beginPath(); ctx.moveTo(f.x + cos(an) * 72, f.y + sin(an) * 72); ctx.lineTo(f.x + cos(an) * 104, f.y + sin(an) * 104); ctx.stroke(); } } }),
    cloud: (p, w) => fx({ x: p.x + p.dir * 240, y: p.y - 400, life: 1.0, glow: false, draw(ctx, f, k) { const a = k < 0.15 ? k / 0.15 : (1 - k) / 0.85; ctx.globalAlpha = a * 0.85; ctx.fillStyle = '#4a5068'; for (const [dx, dy, r] of [[-160, 10, 60], [-70, -10, 80], [40, 0, 90], [140, 10, 65]]) { ctx.beginPath(); ctx.arc(f.x + dx, f.y + dy, r, 0, PI * 2); ctx.fill(); } } }),
    icecrack: (p, w) => fx({ x: p.x, y: p.y - 4, life: 0.8, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#d8f4ff'; ctx.lineWidth = 3; for (let i = 0; i < 10; i++) { const a = PI + i / 9 * PI, r = 60 + k * 200; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + cos(a) * r * 0.6 + 6, f.y + sin(a) * r * 0.3); ctx.lineTo(f.x + cos(a) * r, f.y + sin(a) * r * 0.5); ctx.stroke(); } for (let i = 0; i < 8; i++) { const x = f.x + (i - 3.5) * 60; poly(ctx, [[x - 8, f.y], [x, f.y - 40 * (1 - k) - 10], [x + 8, f.y]], 'rgba(200,240,255,.85)', '#ffffff', 1); } } }),
    thunderpillar: (p, w) => fx({ x: p.x + p.dir * 250, y: p.y, life: 0.6, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; for (let j = 0; j < 3; j++) { ctx.strokeStyle = j === 1 ? '#ffffff' : '#fff6a0'; ctx.lineWidth = j === 1 ? 4 : 10; ctx.globalAlpha = (1 - k) * (j === 1 ? 1 : 0.4); ctx.beginPath(); let x = f.x, y = f.y - 460; ctx.moveTo(x, y); for (let i = 0; i < 10; i++) { x = f.x + ((i * 37 + Math.floor(k * 20) * 13) % 50 - 25); y += 46; ctx.lineTo(x, y); } ctx.stroke(); } } }),
    frostscreen: (p, w) => { fx({ x: p.x, y: p.y, life: 1.0, glow: false, draw(ctx, f, k) { const cam = G.Game.world.cam || { x: f.x - 640 }; ctx.globalAlpha = (1 - k) * 0.35; ctx.fillStyle = '#cdeeff'; ctx.fillRect(f.x - 700, f.y - 720, 1400, 760); } }); FXS.icecrack(p, w); },
    shadowpuff: (p, w) => { for (let i = 0; i < 12; i++) G.FX.add({ k: 'p', x: p.sx + rand(-30, 30), y: p.y - rand(10, 60), vx: rand(-80, 80), vy: rand(-60, -10), grav: -10, color: 'rgba(60,40,90,.75)', r: rand(6, 12), life: 0.8 }); },
    starring: (p, w) => fx({ x: p.x, y: p.y - 40, life: 0.6, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; const r = 60 + k * 160; for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2 + k * 8; ctx.save(); ctx.translate(f.x + cos(a) * r, f.y + sin(a) * r * 0.45); ctx.rotate(k * 30); shuriPath(ctx, 10); ctx.restore(); } } }),
    clones: (p, w) => { const o = p.drawOpts(1); for (const dx of [-50, -95]) G.FX.add({ k: 'ghost', o: Object.assign({}, o, { x: o.x + dx * p.dir }), color: '#6a4aa0', life: 0.6 }); for (const dx of [-50, -95]) setTimeout(() => G.FX.flash(p.x + dx * p.dir, p.y - 40, 30, '#b090ff'), 80); },
    darknight: (p, w) => fx({ x: p.x, y: p.y - 60, life: 0.9, glow: false, draw(ctx, f, k) { const a = k < 0.2 ? k / 0.2 : (1 - k) / 0.8; ctx.globalAlpha = a * 0.55; ctx.fillStyle = '#0a0618'; ctx.fillRect(f.x - 700, f.y - 660, 1400, 760); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#e8e0ff'; ctx.beginPath(); ctx.arc(f.x + 200, f.y - 200, 50, -1.2, 1.9); ctx.arc(f.x + 182, f.y - 206, 44, 1.7, -1.0, true); ctx.fill(); ctx.strokeStyle = '#cbb8ff'; ctx.lineWidth = 3; for (let i = 0; i < 5; i++) { const t = (k * 5 + i * 0.37) % 1, x = f.x - 300 + i * 150; ctx.globalAlpha = a * (1 - t); ctx.beginPath(); ctx.arc(x, f.y + 20, 70, -0.6 - t, 0.6 - t); ctx.stroke(); } } }),
    mist: (p, w) => { for (let i = 0; i < 18; i++) G.FX.add({ k: 'p', x: p.sx + p.dir * rand(0, 300), y: p.y - rand(10, 60), vx: rand(-40, 40), vy: rand(-40, -5), grav: -8, color: 'rgba(190,210,180,.65)', r: rand(8, 15), life: 1.0 }); },
    floatblades: (p, w) => fx({ x: p.x, y: p.y - 50, dir: p.dir, life: 0.5, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; for (const sg of [-1, 1]) { ctx.save(); ctx.translate(f.x + f.dir * (40 + k * 90), f.y + sg * 26); ctx.rotate(k * 18 * sg); ctx.translate(-20, 0); sword(ctx, 40, 3, 'rgba(220,255,200,.9)', '#9adf6a'); ctx.restore(); } } }),
    bladewind: (p, w) => fx({ x: p.x, y: p.y - 40, dir: p.dir, life: 0.6, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#d8ffc0'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(f.x + f.dir * k * 100, f.y - 20 + i * 14, 90 + k * 160, 14, 0, -PI * 0.9 + k * 6 + i, -PI * 0.2 + k * 6 + i); ctx.stroke(); } } }),
    thousand: (p, w) => fx({ x: p.x + p.dir * 100, y: p.y - 45, life: 0.7, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#e8ffd8'; ctx.lineWidth = 2.4; for (let i = 0; i < 16; i++) { const a = i * 2.4 + k * 3, r = 30 + ((i * 17) % 60) + k * 40; ctx.beginPath(); ctx.moveTo(f.x + cos(a) * r, f.y + sin(a) * r * 0.7); ctx.lineTo(f.x - cos(a) * r, f.y - sin(a) * r * 0.7); ctx.stroke(); } } }),
  };

  // ---------- 투사체 그림 (projectile.js가 kind로 찾아 부른다. ctx는 투사체 위치로 옮겨진 상태, a = 진행 각도) ----------
  const PROJ = {
    crescent: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 34, '#ff9a40', 0.8); ctx.fillStyle = 'rgba(255,220,150,.95)'; ctx.beginPath(); ctx.arc(-6, 0, 24, -1.2, 1.2); ctx.arc(-16, 0, 20, 1.0, -1.0, true); ctx.closePath(); ctx.fill(); },
    shieldp: (ctx, o) => { ctx.rotate(o.t * 16); glowC(ctx, 0, 0, 28, '#fff0a0', 0.6); ctx.fillStyle = '#f0d070'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, PI * 2); ctx.fill(); ctx.strokeStyle = '#fff8d0'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#b08020'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, PI * 2); ctx.fill(); ctx.fillRect(-1.5, -13, 3, 26); },
    bolt: (ctx, o, a) => { ctx.rotate(a); ctx.strokeStyle = '#6a5034'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(10, 0); ctx.stroke(); poly(ctx, [[18, 0], [8, -6], [10, 0], [8, 6]], '#c8ccd4', '#5a606a', 1); ctx.fillStyle = '#d8b070'; ctx.fillRect(-22, -4, 6, 8); },
    pellet: (ctx, o) => { glowC(ctx, 0, 0, 10, '#ffe0a0', 0.6); ctx.fillStyle = '#d8c8a8'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, PI * 2); ctx.fill(); },
    windarrow: (ctx, o, a) => { ctx.rotate(a); ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(12, 0); ctx.stroke(); poly(ctx, [[20, 0], [10, -5], [10, 5]], '#e8f0f8'); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(160,255,190,.8)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-14 + i * 11, 0, 4, 9, 0, o.t * 20 + i, o.t * 20 + i + PI * 1.3); ctx.stroke(); } },
    hawk: (ctx, o, a) => { if (Math.cos(a) < 0) ctx.scale(-1, 1); glowC(ctx, 0, 0, 30, '#a0ffb0', 0.5); const f = sin(o.t * 30) * 8; ctx.fillStyle = '#f4fff4'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(4, -3); ctx.lineTo(-6, -6 - f - 10); ctx.lineTo(-4, -2); ctx.lineTo(-16, -2); ctx.lineTo(-20, 3); ctx.lineTo(-4, 3); ctx.lineTo(-6, 6 + f + 6); ctx.lineTo(4, 3); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffd040'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(19, 1.5); ctx.lineTo(13, 2.5); ctx.fill(); },
    fsword: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 40, '#ff8a30', 0.7); ctx.translate(-30, 0); sword(ctx, 46, 5, 'rgba(255,230,190,.95)', '#ff8a30'); },
    lspear: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 36, '#fff0a0', 0.7); ctx.strokeStyle = 'rgba(255,250,220,.95)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(10, 0); ctx.stroke(); poly(ctx, [[24, 0], [10, -7], [4, 0], [10, 7]], '#fff8d0', '#ffd040', 1.5); },
    flamedrop: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 34, '#ff7a20', 0.8); ctx.fillStyle = '#ffb050'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.quadraticCurveTo(4, -12, -26, 0); ctx.quadraticCurveTo(4, 12, 16, 0); ctx.fill(); ctx.fillStyle = '#fff0a0'; ctx.beginPath(); ctx.arc(8, 0, 5, 0, PI * 2); ctx.fill(); },
    mine: (ctx, o) => { ctx.fillStyle = '#4a4038'; ctx.beginPath(); ctx.arc(0, 0, 10, PI, 0); ctx.lineTo(10, 4); ctx.lineTo(-10, 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#8a7a6a'; ctx.lineWidth = 2; for (const ang of [-2.4, -1.57, -0.7]) { ctx.beginPath(); ctx.moveTo(cos(ang) * 9, sin(ang) * 9); ctx.lineTo(cos(ang) * 15, sin(ang) * 15); ctx.stroke(); } ctx.fillStyle = Math.floor(o.t * 10) % 2 ? '#ff4030' : '#601810'; ctx.beginPath(); ctx.arc(0, -3, 3, 0, PI * 2); ctx.fill(); },

    // ----- 1.7.11 -----
    starorb: (ctx, o) => { glowC(ctx, 0, 0, 26, '#9ec0ff', 0.9); ctx.fillStyle = '#ffffff'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 11, a = i * PI / 4 + o.t * 8; ctx.lineTo(cos(a) * r, sin(a) * r); } ctx.closePath(); ctx.fill(); },
    fireball: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 34, '#ff8a30', 0.9); ctx.fillStyle = '#ffb050'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.quadraticCurveTo(10, -14, -6, -10); ctx.quadraticCurveTo(-30, -4, -36, 0); ctx.quadraticCurveTo(-30, 4, -6, 10); ctx.quadraticCurveTo(10, 14, 14, 0); ctx.fill(); ctx.fillStyle = '#fff0b0'; ctx.beginPath(); ctx.arc(4, 0, 7, 0, PI * 2); ctx.fill(); },
    meteor: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 40, '#ff7a20', 0.8); ctx.fillStyle = 'rgba(255,170,80,.7)'; ctx.beginPath(); ctx.moveTo(10, -9); ctx.lineTo(-50, 0); ctx.lineTo(10, 9); ctx.fill(); ctx.fillStyle = '#6a4030'; ctx.beginPath(); ctx.arc(8, 0, 11, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#ffb050'; ctx.beginPath(); ctx.arc(11, -2, 4, 0, PI * 2); ctx.fill(); },
    inferno: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 44, '#c0301a', 0.9); ctx.fillStyle = '#a82010'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#ff8a30'; ctx.beginPath(); ctx.arc(2, -2, 9, 0, PI * 2); ctx.fill(); if (Math.random() < 0.6) G.FX.add({ k: 'p', x: o.x, y: o.y + rand(-6, 6), vx: 0, vy: -50, grav: -40, color: '#ff6a20', r: rand(3, 6), life: 0.6, glow: true }); },
    firelance: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 44, '#ff8a30', 0.8); ctx.strokeStyle = '#ffd090'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-46, 0); ctx.lineTo(12, 0); ctx.stroke(); poly(ctx, [[30, 0], [12, -9], [6, 0], [12, 9]], '#fff0b0', '#ff8a30', 2); },
    icebeam: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 30, '#9ae6ff', 0.8); ctx.fillStyle = 'rgba(220,245,255,.9)'; ctx.fillRect(-40, -4, 52, 8); poly(ctx, [[20, 0], [10, -6], [10, 6]], '#ffffff'); },
    icicle: (ctx, o, a) => { ctx.rotate(a); poly(ctx, [[14, 0], [-10, -5], [-14, 0], [-10, 5]], 'rgba(220,245,255,.95)', '#7ac8f0', 1.2); },
    icespear: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 30, '#9ae6ff', 0.7); poly(ctx, [[26, 0], [6, -6], [-30, -3], [-34, 0], [-30, 3], [6, 6]], 'rgba(230,248,255,.95)', '#7ac8f0', 1.5); },
    lightning: (ctx, o) => { glowC(ctx, 0, 0, 30, '#fff6a0', 0.9); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -60); for (let i = 1; i <= 5; i++) ctx.lineTo(((i * 13 + Math.floor(o.t * 30) * 7) % 18) - 9, -60 + i * 12); ctx.stroke(); },
    bigstar: (ctx, o) => { glowC(ctx, 0, 0, 30, '#b090ff', 0.6); ctx.rotate(o.t * 20); shuriPath(ctx, 18); },
    pdagger: (ctx, o, a) => { ctx.rotate(a + o.t * 18); ctx.fillStyle = '#e0ffd0'; poly(ctx, [[14, 0], [-4, -3], [-4, 3]], '#e8ffe0'); ctx.fillStyle = '#5a3a2a'; ctx.fillRect(-12, -2, 8, 4); glowC(ctx, 6, 0, 12, '#a8f060', 0.6); },
    blade: (ctx, o, a) => { ctx.rotate(a); glowC(ctx, 0, 0, 22, '#c8ff90', 0.5); ctx.translate(-16, 0); sword(ctx, 30, 2.6, 'rgba(230,255,220,.95)', '#7ac850'); },
  };
  // 땅에 닿을 때
  const LAND = {
    fsword: o => { G.FX.burst(o.x, o.groundY, '#ff9a40', 10, 220); G.FX.flash(o.x, o.groundY - 10, 40, '#ffb050'); },
    flamedrop: o => { G.FX.burst(o.x, o.groundY, '#ff7a20', 10, 200); },
    lspear: o => { G.FX.flash(o.x, o.groundY - 20, 36, '#fff0a0'); G.FX.ring(o.x, o.groundY - 2, 30, '#ffe080'); },
    mine: o => { G.FX.flash(o.x, o.groundY - 10, 60, '#ffb060'); G.FX.burst(o.x, o.groundY - 6, '#8a7a6a', 12, 260); G.FX.shock(o.x, o.groundY - 10, 60, '#e0c890'); },
    meteor: o => { G.FX.burst(o.x, o.groundY, '#ff7a20', 14, 260); G.FX.flash(o.x, o.groundY - 10, 50, '#ffb050'); G.FX.shock(o.x, o.groundY - 8, 50, '#ff9a40'); },
    lightning: o => { G.FX.flash(o.x, o.groundY - 20, 50, '#fff6a0'); G.FX.burst(o.x, o.groundY - 4, '#fff6a0', 8, 200); },
    blade: o => { G.FX.burst(o.x, o.groundY, '#c8ff90', 6, 160); },
  };

  // ---------- 바닥 장판 연출 ----------
  const ZONE_DRAW = {
    sanct: (ctx, z, k) => { const a = Math.min(1, z.age / 0.3) * Math.min(1, z.left / 0.4); ctx.globalAlpha = a; ctx.strokeStyle = '#ffe890'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(z.x, z.y - 2, z.r, z.r * 0.18, 0, 0, PI * 2); ctx.stroke(); ctx.globalAlpha = a * 0.5; ctx.beginPath(); ctx.ellipse(z.x, z.y - 2, z.r * 0.7, z.r * 0.12, 0, 0, PI * 2); ctx.stroke(); for (let i = 0; i < 5; i++) { const x = z.x + cos(z.age * 1.5 + i * 1.26) * z.r * 0.85; const g = ctx.createLinearGradient(0, z.y - 120, 0, z.y); g.addColorStop(0, 'rgba(255,240,160,0)'); g.addColorStop(1, 'rgba(255,240,160,.5)'); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x - 5, z.y - 120, 10, 120); } },
    tornado: (ctx, z) => { const a = Math.min(1, z.age / 0.2) * Math.min(1, z.left / 0.3); ctx.globalAlpha = a * 0.8; ctx.strokeStyle = '#c8ffd0'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { const y = z.y - 10 - i * 26, rx = 30 + i * 18; ctx.beginPath(); ctx.ellipse(z.x + sin(z.age * 6 + i) * 10, y, rx, 8 + i, 0, z.age * 8 + i, z.age * 8 + i + PI * 1.4); ctx.stroke(); } },
    fire: (ctx, z) => { const a = Math.min(1, z.age / 0.2) * Math.min(1, z.left / 0.4); for (let i = 0; i < 9; i++) { const x = z.x + (i - 4) * z.r / 4.5, h = 30 + sin(z.age * 9 + i * 1.7) * 12; ctx.globalAlpha = a; const g = ctx.createLinearGradient(0, z.y - h, 0, z.y); g.addColorStop(0, 'rgba(255,200,80,0)'); g.addColorStop(1, 'rgba(255,110,30,.85)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 16, z.y); ctx.quadraticCurveTo(x - 6, z.y - h * 0.6, x, z.y - h); ctx.quadraticCurveTo(x + 6, z.y - h * 0.6, x + 16, z.y); ctx.fill(); } },
  };

  // ---------- 버프 모습 (캐릭터 뒤) ----------
  const AURA_DRAW = {
    rage: (ctx, p) => { if (Math.random() < 0.25 * G.Settings.fxMul) G.FX.add({ k: 'p', x: p.x + rand(-16, 16), y: p.y - rand(0, 20), vx: 0, vy: -70, grav: -30, color: '#ff7a30', r: rand(2, 4), life: 0.5, glow: true }); },
    swords: (ctx, p) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55 + sin(p.t * 3) * 0.1; for (let i = -2; i <= 2; i++) { ctx.save(); ctx.translate(p.x - p.dir * 6, p.y - 46); ctx.rotate(-PI / 2 + i * 0.32 - p.dir * 0.0); ctx.translate(14, 0); sword(ctx, 46, 3.5, 'rgba(255,200,140,.8)', 'rgba(255,150,60,.9)'); ctx.restore(); } ctx.restore(); },
    wings: (ctx, p) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.6; const f = sin(p.t * 3) * 0.08; for (const sg of [-1, 1]) { ctx.save(); ctx.translate(p.x, p.y - 50); ctx.scale(sg, 1); ctx.rotate(f); ctx.fillStyle = 'rgba(255,235,150,.75)'; ctx.beginPath(); ctx.moveTo(4, 0); ctx.bezierCurveTo(20, -30, 50, -36, 62, -24); ctx.bezierCurveTo(50, -18, 52, -10, 46, -6); ctx.bezierCurveTo(54, 0, 50, 8, 40, 8); ctx.bezierCurveTo(44, 16, 30, 20, 4, 6); ctx.closePath(); ctx.fill(); ctx.restore(); } ctx.restore(); },
    feathers: (ctx, p) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.6; const f = sin(p.t * 4) * 0.1; for (const sg of [-1, 1]) for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(p.x, p.y - 48); ctx.scale(sg, 1); ctx.rotate(-0.9 + i * 0.32 + f); ctx.fillStyle = 'rgba(190,255,200,.7)'; ctx.beginPath(); ctx.ellipse(30, 0, 24, 5, 0, 0, PI * 2); ctx.fill(); ctx.restore(); } ctx.restore(); },
    flamecrown: (ctx, p) => { const y = p.y - 92; for (let i = -2; i <= 2; i++) glowC(ctx, p.x + i * 9, y - (2 - Math.abs(i)) * 5 + sin(p.t * 8 + i) * 2, 9, '#ff9a40', 0.8); },
    stormring: (ctx, p) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.7; ctx.strokeStyle = '#d8ecff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p.x, p.y - 40, 40, 12, 0, 0, PI * 2); ctx.stroke(); for (let i = 0; i < 3; i++) { const a = p.t * 3 + i * 2.1; ctx.fillStyle = '#e8f8ff'; ctx.save(); ctx.translate(p.x + cos(a) * 40, p.y - 40 + sin(a) * 12); ctx.rotate(a); ctx.fillRect(-2, -6, 4, 12); ctx.restore(); } if (Math.floor(p.t * 6) % 4 === 0) { ctx.strokeStyle = '#fff6a0'; ctx.beginPath(); ctx.moveTo(p.x - 30, p.y - 60); ctx.lineTo(p.x - 20, p.y - 48); ctx.lineTo(p.x - 28, p.y - 44); ctx.lineTo(p.x - 16, p.y - 30); ctx.stroke(); } ctx.restore(); },
    shadowclone: (ctx, p) => { if (!G.Draw || !G.Draw.humanoid) return; const o = p.drawOpts(0.3); ctx.save(); ctx.globalAlpha = 0.3; ctx.filter = 'brightness(0.2) sepia(1) hue-rotate(220deg)'; G.Draw.humanoid(ctx, Object.assign({}, o, { x: p.x - p.dir * 36, y: p.y })); ctx.restore(); },
    petals: (ctx, p) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const a = p.t * 2.5 + i * PI * 0.4; ctx.save(); ctx.translate(p.x + cos(a) * 34, p.y - 40 + sin(a) * 14); ctx.rotate(a + PI / 2); ctx.fillStyle = 'rgba(210,255,180,.7)'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.quadraticCurveTo(4, 0, 0, 9); ctx.quadraticCurveTo(-4, 0, 0, -9); ctx.fill(); ctx.restore(); } ctx.restore(); },
  };

  G.SkillX = {
    PROJ, LAND, pending: [], zones: [],
    // 조준선이 있는 스킬: 선을 보여 준 뒤 발사
    pre(p, sk, lv, w, el) {
      const X = G.SKILL_X[sk.id];
      if (!X || !X.aim) return false;
      p.lock = Math.max(p.lock, X.aim + 0.12);
      fx({ x: p.x, y: p.y - 36, dir: p.dir, life: X.aim, glow: false, draw(ctx, f, k) {
        const len = 1000, x2 = f.x + f.dir * len * Math.min(1, k * 3);
        ctx.globalAlpha = 0.5 + 0.5 * (Math.floor(k * 10) % 2); ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = 1.6; ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(f.x + f.dir * 20, f.y); ctx.lineTo(x2, f.y); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(x2, f.y, 9, 0, PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x2 - 14, f.y); ctx.lineTo(x2 + 14, f.y); ctx.moveTo(x2, f.y - 14); ctx.lineTo(x2, f.y + 14); ctx.stroke();
      } });
      this.pending.push({ t: X.aim, w, fn: () => { if (!p.dead) { p.doAttack(sk, lv, w, el, true); G.Sound.skill(sk); } } });
      return true;
    },
    // 맞은 적마다 (한 번만): 기절 · 둔화 · 밀쳐내기 · 끌어오기 · 폭발 예약
    hitFn(p, X, el, w, pct) {
      const seen = new Set();
      let exploded = false, chained = false;
      return m => {
        if (seen.has(m)) return;
        seen.add(m);
        const kb = !m.isBoss && !m.flying && !m.d.noKb;
        if (!m.dead) {
          if (X.stun) m.applyStatus('stun', X.stun);
          if (X.slow) m.applyStatus('slow', X.slow[0], X.slow[1]);
          if (X.push && kb) m.kb = Math.sign(m.x - p.x || p.dir) * X.push;
          if (X.pull && kb) m.kb = Math.sign(p.x - m.x) * X.pull;
        }
        if (!m.dead) {
          if (X.freeze) { m.applyStatus('freeze', X.freeze); G.Sound.play('frozen'); }
          if (X.burn) { m.poison = { dps: p.st.maxDmg * X.burn[1], left: X.burn[0], tick: 1, burn: true }; G.FX.text(m.x, m.y - m.h - 24, '화상', '#ff9a40', 13, 0.7); G.Sound.play('burn'); }
          if (X.burnPop && m.poison && m.poison.burn) { G.FX.flash(m.x, m.y - m.h / 2, 70, '#ff8a30', 0.3); G.FX.burst(m.x, m.y - m.h / 2, '#ffb050', 14, 280); }
          if (X.mark) { m.markUntil = Date.now() + X.mark.dur * 1000; m.markMul = X.mark.mul; this.markFx(m, X.mark.dur); G.Sound.play('mark'); }
          if (X.poisonStack) { const P = X.poisonStack; m.pstack = Math.min(P.max, (m.poison && !m.poison.burn ? (m.pstack || 0) : 0) + 1); m.poison = { dps: p.st.maxDmg * P.dps * m.pstack, left: P.dur, tick: 1 }; G.FX.text(m.x, m.y - m.h - 24, '독 ×' + m.pstack, '#a8f060', 13, 0.6); G.Sound.play('poisonStack', { k: 1 + m.pstack * 0.12 }); }
        }
        if (X.chain && !chained) { chained = true; this.chain(p, w, m, X.chain, pct, el); if (!X.chain.star) G.Sound.play('chain', { delay: 0.08 }); }
        if (X.explode && !exploded) {
          exploded = true;
          const x = m.x, y = m.y - m.h / 2, E = X.explode;
          fx({ x, y, life: E.delay, draw(ctx, f, k) { glowC(ctx, f.x, f.y, 14 + k * 20, '#ffb060', 0.5 + 0.5 * (Math.floor(k * 12) % 2)); } });
          this.pending.push({ t: E.delay, w, fn: () => this.blast(p, w, x, y, E.r, pct * E.mul, el) });
        }
      };
    },
    // 튕기는 번개 · 표창: 처음 맞은 적에서 가까운 적으로 차례로
    chain(p, w, from, C, pct, el) {
      let prev = from; const hit = new Set([from]);
      for (let i = 0; i < C.n; i++) {
        const next = w.monsters.filter(m => !m.dead && !hit.has(m) && Math.abs(m.x - prev.x) < C.r && Math.abs(m.y - prev.y) < 160).sort((a, b) => Math.abs(a.x - prev.x) - Math.abs(b.x - prev.x))[0];
        if (!next) break;
        hit.add(next);
        const a = { x: prev.x, y: prev.y - prev.h / 2 }, b = { x: next.x, y: next.y - next.h / 2 };
        this.pending.push({ t: 0.08 * (i + 1), w, fn: () => {
          fx({ life: 0.25, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; if (C.star) { ctx.save(); ctx.translate(a.x + (b.x - a.x) * Math.min(1, k * 3), a.y + (b.y - a.y) * Math.min(1, k * 3)); ctx.rotate(k * 20); shuriPath(ctx, 9); ctx.restore(); return; } ctx.strokeStyle = '#fff6a0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a.x, a.y); for (let j = 1; j < 6; j++) ctx.lineTo(a.x + (b.x - a.x) * j / 6 + rand(-10, 10), a.y + (b.y - a.y) * j / 6 + rand(-12, 12)); ctx.lineTo(b.x, b.y); ctx.stroke(); } });
          if (!next.dead) G.Combat.hit(p, next, pct * C.mul, 1, el);
        } });
        prev = next;
      }
    },
    // 표식: 머리 위 붉은 과녁 (받는 피해 증가는 combat.js)
    markFx(m, dur) {
      fx({ life: dur, glow: false, draw(ctx, f, k) { if (m.dead || !(m.markUntil > Date.now())) return; const x = m.x, y = m.y - m.h - 34; ctx.globalAlpha = 0.85; ctx.strokeStyle = '#ff5a6a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 9, 0, PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 13, y); ctx.lineTo(x - 5, y); ctx.moveTo(x + 5, y); ctx.lineTo(x + 13, y); ctx.moveTo(x, y - 13); ctx.lineTo(x, y - 5); ctx.moveTo(x, y + 5); ctx.lineTo(x, y + 13); ctx.stroke(); } });
    },
    blast(p, w, x, y, r, pct, el) {
      G.FX.flash(x, y, r, '#ffc070', 0.3); G.FX.shock(x, y, r, '#ffb060'); G.Sound.play('explosion'); G.FX.burst(x, y, '#ff9a40', 18, 300); w.shake(5);
      const box = { x: x - r, y: y - r, w: r * 2, h: r * 2 };
      w.monsters.filter(m => !m.dead && G.U.overlap(box, m.box)).slice(0, 10).forEach(m => G.Combat.hit(p, m, pct, 1, el));
    },
    // 스킬을 쓴 직후 한 번
    after(p, sk, X, pct, w, el, a) {
      if (X.invuln) p.invuln = Math.max(p.invuln, X.invuln);
      if (X.advance) { G.FX.ghost(p.drawOpts(1), el); p.x = G.U.clamp(p.x + p.dir * X.advance, 15, w.map.width - 15); }
      if (X.heavy) { G.Game.hitstop = Math.max(G.Game.hitstop, X.heavy); w.shake(G.Settings.fx === 'high' ? 6 : 3); }
      if (X.fx && FXS[X.fx]) FXS[X.fx](p, w, el);
      if (X.slowNear) {
        const S = X.slowNear, box = { x: p.sx - S.r, y: p.y - 120, w: S.r * 2, h: 130 };
        w.monsters.filter(m => !m.dead && G.U.overlap(box, m.box)).forEach(m => m.applyStatus('slow', S.dur, S.v));
      }
      if (X.crack) {
        const C = X.crack, x0 = p.x + p.dir * 30, y = p.y - 2, dir = p.dir, seed = Math.floor(Math.random() * 5);
        fx({ x: x0, y, life: 0.9, draw(ctx, f, k) { const grow = Math.min(1, k / 0.3); ctx.globalAlpha = 1 - Math.max(0, k - 0.5) * 2; zigLine(ctx, f.x, f.y, dir, C.len * grow, seed, '#ffb040', 5); zigLine(ctx, f.x, f.y, dir, C.len * grow, seed, '#fff0c0', 2); } });
        if (C.mul > 0) this.pending.push({ t: 0.4, w, fn: () => {
          const box = { x: dir > 0 ? x0 : x0 - C.len, y: y - 90, w: C.len, h: 96 };
          for (let i = 0; i < 6; i++) G.FX.add({ k: 'p', x: x0 + dir * C.len * i / 5, y: y - 4, vx: rand(-40, 40), vy: rand(-260, -120), grav: 700, color: '#ffb050', r: rand(2, 4), life: 0.6, glow: true });
          w.shake(4); G.Sound.play('crack');
          w.monsters.filter(m => !m.dead && G.U.overlap(box, m.box)).slice(0, a.targets || 6).forEach(m => G.Combat.hit(p, m, pct * C.mul, 1, el));
        } });
      }
      if (X.zone) {
        const Z = X.zone, x = p.x + p.dir * (Z.ahead || 0);
        const z = { x, y: w.groundBelow(x, p.y - 30), r: Z.r, left: Z.dur, age: 0, tick: 0.5, pct: pct * Z.mul, el, kind: Z.kind, w, p };
        this.zones.push(z);
        fx({ life: Z.dur + 0.1, glow: true, draw(ctx, f, k) { if (z.left > 0) ZONE_DRAW[z.kind](ctx, z, k); } });
      }
    },
    update(dt, w) {
      if (this.pending.length) {
        const due = [];
        for (const e of this.pending) { e.t -= dt; if (e.t <= 0) due.push(e); }
        this.pending = this.pending.filter(e => e.t > 0);
        for (const e of due) if (e.w === G.Game.world) e.fn();
      }
      for (const z of this.zones) {
        z.left -= dt; z.age += dt; z.tick -= dt;
        if (z.tick <= 0 && z.left > 0 && z.w === G.Game.world) {
          z.tick = 0.5;
          const box = { x: z.x - z.r, y: z.y - 150, w: z.r * 2, h: 156 };
          w.monsters.filter(m => !m.dead && G.U.overlap(box, m.box)).slice(0, 10).forEach(m => G.Combat.hit(z.p, m, z.pct, 0, z.el));
        }
      }
      this.zones = this.zones.filter(z => z.left > 0 && z.w === G.Game.world);
    },
    // 버프가 켜져 있는 동안의 모습 (캐릭터보다 먼저 그림)
    aura(ctx, p) {
      if (p.dead) return;
      for (const id in p.buffs) if (AURA[id]) AURA_DRAW[AURA[id]](ctx, p);
    },
  };

  // 설명에 바뀐 동작 한 줄 덧붙이기
  for (const id in G.SKILL_X) {
    const sk = G.SKILLS[id], X = G.SKILL_X[id];
    if (sk && X.note && sk.desc) { const d = sk.desc; sk.desc = lv => d(lv) + ' ' + X.note; }
  }
})();
