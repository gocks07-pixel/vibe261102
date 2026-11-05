'use strict';
// 2.0: 녹스전 동료 도움 연출 — 컷인(초상화 + 이름 + 대사) + 실제 등장 (카이엔 결박 · 엘마 회복 · 아우렐리온 브레스)
//  동료는 연출용: 공격받지 않고 길을 막지 않는다. 효과(회복량 · 그로기 · 기둥 1개)는 1.7.2와 같다
//  w.allies: 월드 좌표 배우 목록, w.cutins: 화면 좌표 컷인 목록 (World.load 에서 비움)
G.Assist = (function () {
  const PI = Math.PI;
  const ease = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const LOOK = {
    elma: () => Object.assign({ skin: '#ffe0c2', gender: 'f' }, G.NPCS.elma.look),
    kaien: () => Object.assign({ skin: '#f0d0b0' }, G.NPCS.kaien.look),
  };
  const CUT = {
    kaien: ['카이엔', '지금이다! 내가 녀석을 붙잡고 있겠다!', '3초 그로기'],
    elma: ['엘마', '포기하지 마세요! 별빛이 당신을 지켜요!', 'HP 50% 회복'],
    aurelion: ['아우렐리온', '지금이다, 여덟 번째 별이여!', '사슬 기둥 하나 파괴'],
  };
  function glow(c, x, y, r, col, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore();
  }
  function sparkle(c, x, y, r, col) {
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = -PI / 2 + i * PI / 4, rr = i % 2 ? r * 0.3 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
  }
  const aurFake = () => ({ x: 0, y: 0, w: 220, h: 200, dir: 1, dead: false, deadT: 0, hurtT: 0, atkAnim: -1, aggro: 0, moving: false, d: G.MONSTERS.aurelion, id: 'aurelion', purified: true, soarY: 40 });

  // ---------------- 시작 ----------------
  function cut(w, who, right) { (w.cutins = w.cutins || []).push({ who, t: 0, right: !!right }); G.Sound.play('buff', { s: 0.7 }); }
  function add(w, a) { (w.allies = w.allies || []).push(Object.assign({ t: 0 }, a)); }

  // 카이엔: 화면 끝에서 달려와 사슬로 녹스를 묶는다 → 3초 결박 → 뒤로 뛰어 퇴장
  function kaien(w, m) {
    const side = Math.sign(m.x - w.player.x) || 1;   // 녹스가 있는 쪽
    const from = side > 0 ? w.cam - 60 : w.cam + 1340;
    const stop = m.x - side * (m.w / 2 + 170);
    m.groggy = 3.7; m.vuln = Math.max(m.vuln || 0, 0);
    add(w, { kind: 'kaien', m, side, from, stop, y: m.y }); G.Sound.play('dash');
    cut(w, 'kaien');
    G.UI.log('카이엔: 지금이다! 내가 녀석을 붙잡고 있겠다! (3초 그로기)', '#bfe6ff');
  }
  // 엘마: 플레이어 뒤에 별빛과 함께 나타나 회복 → 사라짐
  function elma(w) {
    const p = w.player;
    add(w, { kind: 'elma', x: p.x - (p.dir || 1) * 110, dir: p.dir || 1, healed: false });
    cut(w, 'elma');
    G.UI.log('엘마: 포기하지 마세요! 별빛이 당신을 지켜요! (HP 50% 회복)', '#fff0a0');
  }
  // 아우렐리온: 날아와 기둥 위에 멈춤 → 숨을 모아 기둥에 브레스 → 기둥 파괴 → 하늘로 퇴장
  function aurelion(w, tg) {
    const left = tg.x - w.cam > 640;   // 기둥이 화면 오른쪽이면 왼쪽에서 와서 오른쪽을 본다
    const dir = left ? 1 : -1, hx = tg.x - dir * 300;
    add(w, { kind: 'aurelion', tg, dir, hx, hy: tg.y - 250, from: dir > 0 ? w.cam - 260 : w.cam + 1540, broke: false });
    cut(w, 'aurelion', hx - w.cam < 640);   // 용이 멈추는 자리의 반대쪽에서 컷인 (가려지지 않게)
  }

  // ---------------- 갱신 ----------------
  function update(dt, w) {
    if (w.cutins) { for (const c of w.cutins) c.t += dt; w.cutins = w.cutins.filter(c => c.t < 2.8); }
    if (!w.allies) return;
    for (const a of w.allies) {
      a.t += dt;
      if (a.kind === 'elma' && !a.healed && a.t >= 1.4) {
        a.healed = true; const p = w.player;
        if (!p.dead) { p.heal(Math.round(p.st.maxHP * 0.5)); G.FX.pillar(p.x, p.y, '#fff0a0'); G.Sound.play('heal'); }
      }
      if (a.kind === 'kaien' && !a.bound && a.t >= 0.75) { a.bound = true; w.shake(6); G.Sound.play('chain'); }
      if (a.kind === 'kaien' && a.m.dead) a.t = Math.max(a.t, 3.75);
      if (a.kind === 'aurelion' && !a.beam && a.t >= 1.05) { a.beam = true; G.Sound.play('beam', { k: 0.7, s: 1.2 }); }
      if (a.kind === 'aurelion' && !a.broke && a.t >= 1.45) {
        a.broke = true;
        if (!a.tg.dead) {
          G.FX.flash(a.tg.x, a.tg.y - 70, 260, '#fff0b0', 0.4); G.FX.burst(a.tg.x, a.tg.y - 60, '#fff0b0', 30, 360); a.tg.die(w);
        }
        G.UI.log('별빛 숨결이 사슬 기둥 하나를 부쉈다!', '#fff0b0'); w.shake(10);
      }
    }
    w.allies = w.allies.filter(a => a.t < ({ kaien: 4.7, elma: 3.2, aurelion: 3.4 })[a.kind]);
  }

  // ---------------- 그리기 (월드 좌표) ----------------
  function drawWorld(ctx, w) {
    if (!w.allies || !w.allies.length) return;
    const t = w.time;
    for (const a of w.allies) {
      ctx.save();
      if (a.kind === 'kaien') drawKaien(ctx, a, t);
      else if (a.kind === 'elma') drawElma(ctx, a, t);
      else drawAurelion(ctx, a, t);
      ctx.restore();
    }
  }
  function drawKaien(c, a, t) {
    const k = a.t, look = LOOK.kaien(), y = a.y;
    let x = a.stop, pose = -1, alpha = 1, air = 0, dir = a.side, moving = false;
    if (k < 0.7) { x = a.from + (a.stop - a.from) * ease(k / 0.7); moving = true; }
    else if (k < 3.75) { pose = k < 1.0 ? (k - 0.7) / 0.3 : -1; }
    else { const u = (k - 3.75) / 0.9; x = a.stop - a.side * u * 420; alpha = 1 - u; air = Math.sin(u * PI) * 70; dir = -a.side; }
    if (k < 0.7) for (let i = 1; i < 5; i++) { c.save(); c.globalAlpha = 0.18 * (5 - i) / 4; G.Draw.humanoid(c, { x: x - a.side * i * 34, y, dir, t, moving: true, atk: -1, look, weapon: 'sword', wcolor: '#8a5aff' }); c.restore(); }
    c.save(); c.globalAlpha = Math.max(0, alpha);
    G.Draw.humanoid(c, { x, y: y - air, dir, t, moving, air: air > 0, atk: pose, atkKind: 'melee', look, weapon: 'sword', wcolor: '#8a5aff', cape: '#3a2a5a' });
    c.restore();
    // 사슬 (카이엔 손 → 녹스, 녹스 몸을 감는 고리)
    if (k >= 0.75 && k < 3.85) {
      const m = a.m, reach = clamp((k - 0.75) / 0.3, 0, 1), fade = k > 3.6 ? 1 - (k - 3.6) / 0.25 : 1;
      c.save(); c.globalAlpha = Math.max(0, fade); c.shadowColor = '#9ad8ff'; c.shadowBlur = 12; c.strokeStyle = '#cfe8ff'; c.lineWidth = 3;
      const sx = x + a.side * 18, sy = y - 32, ex = m.x - a.side * m.w * 0.3, ey = m.y - m.h * 0.55, n = 14;
      for (let i = 0; i < n * reach; i++) {
        const u = i / n, px = sx + (ex - sx) * u, py = sy + (ey - sy) * u - Math.sin(u * PI) * 18 + Math.sin(t * 20) * 1.2;
        c.beginPath(); c.ellipse(px, py, 7, 4, i % 2 ? 0.5 : -0.5, 0, 7); c.stroke();
      }
      if (reach >= 1) {
        c.setLineDash([12, 7]); c.lineDashOffset = -t * 30;
        for (const [yy, rx] of [[0.38, 0.62], [0.62, 0.56], [0.85, 0.46]]) { c.beginPath(); c.ellipse(m.x, m.y - m.h * yy, m.w * rx, 16, 0.08, 0, 7); c.stroke(); }
        c.setLineDash([]);
      }
      c.restore();
    }
    if (k >= 3.6 && k < 4.0) {   // 사슬이 끊어지는 조각
      const u = (k - 3.6) / 0.4, m = a.m;
      for (let i = 0; i < 18; i++) { const ang = i * 0.35, r = u * 240; sparkle(c, m.x + Math.cos(ang) * r * 0.5, m.y - m.h * 0.6 + Math.sin(ang) * r * 0.3, 5, `rgba(207,232,255,${1 - u})`); }
    }
  }
  function drawElma(c, a, t) {
    const k = a.t, look = LOOK.elma(), p = G.Game.player, y = p ? p.y : G.GROUND_Y;
    let al = 0;
    if (k < 0.6) al = k / 0.6; else if (k < 2.5) al = 1; else al = 1 - (k - 2.5) / 0.7;
    al = clamp(al, 0, 1);
    glow(c, a.x, y - 60, 110, 'rgba(255,240,180,.9)', 0.45 * al);
    for (let i = 0; i < 10; i++) { const yy = y - ((t * 60 + i * 37) % 160), xx = a.x + Math.sin(i * 2.1 + t) * 40; sparkle(c, xx, yy, 4, `rgba(255,246,200,${0.8 * al})`); }
    c.save(); c.globalAlpha = al;
    G.Draw.humanoid(c, { x: a.x, y: y - (1 - al) * 20, dir: a.dir, t, atk: k > 0.7 && k < 2.4 ? 0.5 : -1, atkKind: 'proj', look, weapon: 'wand', wcolor: '#fff0a0' });
    c.restore();
    if (p && k > 0.9 && k < 1.5) {   // 별빛이 플레이어에게 날아간다
      c.save(); c.strokeStyle = 'rgba(255,240,180,.8)'; c.lineWidth = 3; c.setLineDash([6, 8]); c.lineDashOffset = -t * 60;
      c.beginPath(); c.moveTo(a.x + a.dir * 30, y - 90); c.quadraticCurveTo((a.x + p.x) / 2, y - 200, p.x, y - 160); c.stroke(); c.restore();
    }
  }
  function drawAurelion(c, a, t) {
    const k = a.t, tg = a.tg, s = 0.8;
    let x, y, al = 1;
    if (k < 0.7) { const u = ease(k / 0.7); x = a.from + (a.hx - a.from) * u; y = a.hy - 110 + u * 110; al = Math.min(1, k * 4); }
    else if (k < 1.8) { x = a.hx; y = a.hy + Math.sin(t * 5) * 6; }
    else { const u = (k - 1.8) / 1.6; x = a.hx + a.dir * u * u * 1200; y = a.hy - u * 320; al = 1 - Math.max(0, u - 0.6) / 0.4; }
    c.save(); c.globalAlpha = Math.max(0, al); c.translate(x, y); c.scale(a.dir * s, s);
    G.MonArt.aurelion.draw(c, aurFake(), t, { walk: 0, atk: 0, hurt: 0, die: 0, t }); c.restore();
    const mx = x + a.dir * 100 * s, my = y - 180 * s, tx = tg.x, ty = tg.y - 90;
    if (k >= 0.7 && k < 1.05) glow(c, mx, my, 20 + (k - 0.7) * 90, 'rgba(255,246,200,1)', 0.8);   // 숨 모으기
    if (k >= 1.05 && k < 1.65) {
      const u = (k - 1.05) / 0.6, reach = Math.min(1, u * 4), ex = mx + (tx - mx) * reach, ey = my + (ty - my) * reach;
      c.save(); c.lineCap = 'round'; c.shadowColor = '#fff0b0'; c.shadowBlur = 30;
      for (const [lw, col] of [[34, 'rgba(255,230,150,.35)'], [18, 'rgba(255,244,200,.8)'], [7, '#ffffff']]) {
        c.strokeStyle = col; c.lineWidth = Math.max(0.5, lw * (1 - Math.max(0, u - 0.75) * 3)); c.beginPath(); c.moveTo(mx, my); c.lineTo(ex, ey); c.stroke();
      }
      c.restore();
      for (let i = 0; i < 6; i++) { const v = ((t * 3 + i / 6) % 1) * reach; sparkle(c, mx + (tx - mx) * v + Math.sin(i * 7 + t * 20) * 10, my + (ty - my) * v + Math.cos(i * 5 + t * 20) * 10, 5, 'rgba(255,255,255,.9)'); }
      if (reach >= 1) glow(c, tx, ty, 70, 'rgba(255,246,200,1)', 0.8);
    }
  }

  // ---------------- 컷인 (화면 좌표) ----------------
  function portrait(c, who, cx, cy, r, t) {
    c.save(); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.clip();
    const au = who === 'aurelion', bg = c.createRadialGradient(cx, cy - 10, 4, cx, cy, r);
    bg.addColorStop(0, au ? '#fff3c8' : '#4a5a9a'); bg.addColorStop(1, au ? '#8a7ad8' : '#1a2048'); c.fillStyle = bg; c.fillRect(cx - r, cy - r, r * 2, r * 2);
    if (au) { c.translate(cx - 75 * 1.5 + 6, cy + 150 * 1.5 + 8); c.scale(1.5, 1.5); const m = aurFake(); m.soarY = 0; G.MonArt.aurelion.draw(c, m, t, { walk: 0, atk: 0, hurt: 0, die: 0, t }); }
    else { const S = 2.3; G.Draw.humanoid(c, { x: cx - 2 * S, y: cy + 50 * S + 14, dir: 1, t, atk: -1, scale: S, look: LOOK[who]() }); }
    c.restore();
    c.strokeStyle = '#ffd36a'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
  }
  function drawCut(c, ci, t) {
    const dur = 2.8, k = ci.t, right = ci.right;
    const inK = ease(k / 0.35), outK = k > dur - 0.35 ? ease((dur - k) / 0.35) : 1, a = Math.min(inK, outK);
    const x = right ? 1280 - 600 + (1 - inK) * 640 : -620 + 640 * inK, y = 236;   // 미니맵 · 페이즈 알림 아래
    c.save(); c.globalAlpha = a;
    const P = right ? [[x + 40, y], [x + 600, y], [x + 600, y + 120], [x, y + 120]] : [[x, y], [x + 600, y], [x + 560, y + 120], [x, y + 120]];
    c.fillStyle = 'rgba(14,12,34,.92)'; c.beginPath(); P.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.fill();
    c.strokeStyle = '#ffd36a'; c.lineWidth = 2.5; c.beginPath();
    if (right) { c.moveTo(x + 600, y); c.lineTo(x + 40, y); c.lineTo(x, y + 120); } else { c.moveTo(x, y); c.lineTo(x + 600, y); c.lineTo(x + 560, y + 120); }
    c.stroke();
    for (let i = 0; i < 3; i++) { c.fillStyle = `rgba(255,211,106,${0.25 - i * 0.07})`; const wd = 520 - i * 90; c.fillRect(right ? x + 600 - wd : x, y + 128 + i * 6, wd, 3); }
    const px = right ? x + 510 : x + 90, tx = right ? x + 422 : x + 178;
    portrait(c, ci.who, px, y + 58, 66, t);
    const [name, line, tag] = CUT[ci.who];
    c.textAlign = right ? 'right' : 'left'; c.textBaseline = 'alphabetic';
    c.font = '30px Jua, "Malgun Gothic", sans-serif'; c.fillStyle = '#ffd36a'; c.fillText(name, tx, y + 44);
    const n = Math.floor(clamp((k - 0.2) / 1.0, 0, 1) * line.length);
    c.font = 'bold 21px "Malgun Gothic", sans-serif'; c.fillStyle = '#ffffff'; c.fillText(line.slice(0, n), tx, y + 80);
    c.font = 'bold 15px "Malgun Gothic", sans-serif'; c.fillStyle = '#9ad8ff'; c.fillText('✦ ' + tag, tx, y + 106);
    c.restore();
  }
  function drawScreen(ctx, w) {
    if (!w.cutins || !w.cutins.length) return;
    for (const ci of w.cutins) drawCut(ctx, ci, w.time);
  }

  return { kaien, elma, aurelion, update, drawWorld, drawScreen, CUT };
})();
