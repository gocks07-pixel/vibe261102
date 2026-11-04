'use strict';
// 캐릭터/몬스터를 캔버스 도형으로 그린다. 모든 좌표는 발밑(x, y) 기준
G.Draw = (function () {
  const shade = (c, f) => G.Icons.shade(c, f);

  function ell(ctx, x, y, rx, ry, fill, stroke, lw) {
    ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); }
  }
  function rrect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  function shadow(ctx, w) { ell(ctx, 0, 0, w, w * 0.25, 'rgba(0,0,0,.22)'); }
  function eyes(ctx, x, y, gap, r, look) {
    ell(ctx, x, y, r, r * 1.2, '#fff'); ell(ctx, x + gap, y, r, r * 1.2, '#fff');
    ell(ctx, x + r * 0.3, y, r * 0.55, r * 0.7, look || '#222'); ell(ctx, x + gap + r * 0.3, y, r * 0.55, r * 0.7, look || '#222');
  }

  // ---------------- 사람형 (플레이어, NPC, 도적) ----------------
  function weapon(ctx, type, color) {
    const c = color || '#ccc';
    ctx.save(); ctx.translate(0, 14);
    if (type === 'sword') {
      ctx.rotate(-1.9);
      rrect(ctx, -2.5, 4, 5, 32, 2, c, shade(c, -0.4));
      ctx.fillStyle = '#c9a33a'; ctx.fillRect(-7, 2, 14, 3.5);
      ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-2, -6, 4, 8);
    } else if (type === 'dagger') {
      ctx.rotate(-1.8);
      rrect(ctx, -2, 3, 4, 17, 2, c, shade(c, -0.4));
      ctx.fillStyle = '#c9a33a'; ctx.fillRect(-5, 1, 10, 3);
    } else if (type === 'stick') {
      ctx.rotate(-1.9);
      ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, 26); ctx.stroke();
    } else if (type === 'wand') {
      ctx.rotate(-1.4);
      ctx.strokeStyle = '#7a4a22'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, 22); ctx.stroke();
      ell(ctx, 0, 25, 5, 5, c, shade(c, -0.4));
      ell(ctx, -1.5, 23.5, 1.5, 1.5, '#fff');
    } else if (type === 'bow') {
      ctx.strokeStyle = c; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-17, -2); ctx.quadraticCurveTo(0, 22, 17, -2); ctx.stroke();
      ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-17, -2); ctx.lineTo(17, -2); ctx.stroke();
    }
    ctx.restore();
  }

  // 머리 뒤쪽 (얼굴보다 먼저 그림)
  function hairBack(ctx, lk) {
    const h = lk.hair || '#3a2a1a', st = lk.style || 'short';
    if (st === 'long') rrect(ctx, -15, -58, 17, 33, 6, h);
    if (st === 'wavy') {
      rrect(ctx, -15, -58, 17, 24, 6, h);
      for (const [x, y] of [[-12, -33], [-7, -29], [-13, -26], [-6, -23]]) ell(ctx, x, y, 5, 5, h);
    }
    if (st === 'bob') rrect(ctx, -15, -59, 31, 24, 9, h);
    if (st === 'pony') { ell(ctx, -15, -46, 5, 12, h); ell(ctx, -12, -56, 4, 4, h); }
    if (st === 'twin') { ell(ctx, -13, -40, 5, 10, h); ell(ctx, 14, -40, 5, 10, h); }
  }
  function hair(ctx, lk) {
    const h = lk.hair || '#3a2a1a', st = lk.style || 'short';
    if (st === 'bald') { ell(ctx, -9, -48, 4, 6, h); return; }
    ctx.fillStyle = h;
    ctx.beginPath(); ctx.arc(1, -50, 14, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
    if (st === 'spiky') {
      for (const [x, y] of [[-11, -64], [-4, -69], [4, -69], [11, -64]]) { ctx.beginPath(); ctx.moveTo(x - 5, y + 9); ctx.lineTo(x, y); ctx.lineTo(x + 5, y + 9); ctx.fill(); }
    }
    if (st === 'side') {
      ctx.beginPath(); ctx.moveTo(-12, -54); ctx.quadraticCurveTo(10, -71, 17, -50); ctx.quadraticCurveTo(14, -43, 10, -46); ctx.quadraticCurveTo(4, -56, -4, -52); ctx.closePath(); ctx.fill();
      return;
    }
    if (st === 'bun') ell(ctx, -5, -66, 6.5, 6.5, h);
    ctx.fillStyle = h;
    ctx.beginPath(); ctx.moveTo(-12, -52); ctx.quadraticCurveTo(6, -66, 15, -52); ctx.lineTo(12, -47); ctx.quadraticCurveTo(6, -54, -2, -50); ctx.closePath(); ctx.fill();
    if (['long', 'wavy', 'bob', 'twin'].includes(st)) rrect(ctx, 11, -55, 4.5, 15, 2, h);
  }
  // 눈 (모양 4종 + 색), 여자 캐릭터는 속눈썹
  function face(ctx, lk, t) {
    const ec = lk.eyeColor || '#222', kind = lk.eye || 'round';
    const blink = (Math.floor((t || 0) * 10) % 37) === 0;
    if (blink) { ctx.fillStyle = ec; ctx.fillRect(5, -49, 3, 1.5); ctx.fillRect(10, -49, 3, 1.5); }
    else if (kind === 'big') {
      ell(ctx, 6, -50, 2.7, 3.5, '#fff'); ell(ctx, 11.6, -50, 2.7, 3.5, '#fff');
      ell(ctx, 6.5, -49.6, 2, 2.7, ec); ell(ctx, 12.1, -49.6, 2, 2.7, ec);
      ell(ctx, 7.1, -51, 0.9, 0.9, '#fff'); ell(ctx, 12.7, -51, 0.9, 0.9, '#fff');
    } else if (kind === 'smile') {
      ctx.strokeStyle = ec; ctx.lineWidth = 1.7;
      ctx.beginPath(); ctx.arc(6.3, -48.5, 2.3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(11.6, -48.5, 2.3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    } else if (kind === 'sharp') {
      ctx.fillStyle = ec;
      for (const ox of [0, 6]) { ctx.beginPath(); ctx.moveTo(4 + ox, -49); ctx.lineTo(8.5 + ox, -52); ctx.lineTo(8.8 + ox, -49.6); ctx.lineTo(4.4 + ox, -47.6); ctx.closePath(); ctx.fill(); }
    } else { ctx.fillStyle = ec; ctx.fillRect(5, -52, 2.6, 4.2); ctx.fillRect(10, -52, 2.6, 4.2); }
    if (lk.gender === 'f' && !blink && kind !== 'smile') {
      ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(4, -53.6); ctx.lineTo(8.4, -54.2); ctx.moveTo(9.6, -54.2); ctx.lineTo(14, -53.6); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,120,120,.35)'; ctx.fillRect(4, -45, 4, 2); ctx.fillRect(11, -45, 3, 2);
  }

  // o: {x, y, dir, t, moving, air, atk(0~1 또는 -1), atkKind, look, weapon, wcolor, scale, alpha, hurt, mask, cape, hatColor}
  function humanoid(ctx, o) {
    const s = o.scale || 1, lk = o.look;
    ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.dir * s, s);
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    if (o.hurt) ctx.filter = 'brightness(1.8)';
    shadow(ctx, 15);
    const sw = o.moving && !o.air ? Math.sin(o.t * 14) * 0.55 : (o.air ? 0.45 : 0);
    // 다리
    for (const [lx, a] of [[-4, sw], [4, -sw]]) {
      ctx.save(); ctx.translate(lx, -15); ctx.rotate(a);
      rrect(ctx, -3, 0, 6, 12, 2, lk.bottom);
      rrect(ctx, -3, 10, 8, 5, 2, shade(lk.bottom, -0.45));
      ctx.restore();
    }
    if (lk.gender === 'f') {
      ctx.fillStyle = lk.bottom;
      ctx.beginPath(); ctx.moveTo(-9, -18); ctx.lineTo(-13, -6); ctx.lineTo(13, -6); ctx.lineTo(9, -18); ctx.closePath(); ctx.fill();
    }
    if (o.cape) {
      ctx.fillStyle = o.cape;
      ctx.beginPath(); ctx.moveTo(-6, -35); ctx.lineTo(-15 - (o.moving ? 4 : 0), -6); ctx.lineTo(2, -9); ctx.lineTo(4, -35); ctx.closePath(); ctx.fill();
    }
    // 몸통
    rrect(ctx, -9, -36, 18, 23, 6, lk.top, shade(lk.top, -0.35));
    ctx.fillStyle = shade(lk.bottom, -0.3); ctx.fillRect(-9, -17, 18, 3);
    // 머리
    hairBack(ctx, lk);
    ell(ctx, 1, -50, 13, 13, lk.skin || '#ffe0c2', shade(lk.skin || '#ffe0c2', -0.25), 1);
    hair(ctx, lk);
    if (o.mask) {
      ctx.fillStyle = o.mask; ctx.fillRect(-12, -55, 27, 7);
      ell(ctx, 6, -51, 2, 2, '#fff'); ell(ctx, 11, -51, 2, 2, '#fff');
      ctx.fillStyle = o.mask; ctx.beginPath(); ctx.moveTo(-12, -54); ctx.lineTo(-20, -60); ctx.lineTo(-19, -50); ctx.closePath(); ctx.fill();
    } else {
      face(ctx, lk, o.t);
    }
    if (lk.beard) { ctx.fillStyle = lk.hair || '#ddd'; ctx.beginPath(); ctx.arc(4, -42, 8, 0, Math.PI); ctx.fill(); }
    const hat = o.hatColor || lk.hat;
    if (hat) {
      ell(ctx, 1, -60, 17, 4.5, shade(hat, -0.2));
      ctx.fillStyle = hat; ctx.beginPath(); ctx.ellipse(1, -61, 11, 10, 0, Math.PI, 0); ctx.fill();
    }
    // 팔 + 무기
    let arm = -0.3;
    if (o.atk >= 0) {
      if (o.atkKind === 'melee') { const e = 1 - Math.pow(1 - o.atk, 3); arm = -2.8 + e * 3.3; }
      else arm = -1.45;
    } else if (o.moving && !o.air) arm = -0.3 + Math.sin(o.t * 14) * 0.3;
    ctx.save(); ctx.translate(2, -31); ctx.rotate(arm);
    rrect(ctx, -2.8, 0, 5.6, 14, 2.5, lk.top);
    ell(ctx, 0, 14, 3.2, 3.2, lk.skin || '#ffe0c2');
    if (o.weapon) weapon(ctx, o.weapon, o.wcolor);
    ctx.restore();
    ctx.restore();
  }

  // ---------------- 몬스터 ----------------
  const MON = {
    blob(ctx, m, t) {
      const sq = 1 + Math.sin(t * 6) * 0.08, w = m.w / 2, h = m.h;
      ell(ctx, 0, -h / 2 * (1 / sq), w * sq, h / 2 / sq, m.d.color, m.d.color2, 2);
      ell(ctx, -w * 0.35, -h * 0.7, w * 0.22, h * 0.1, 'rgba(255,255,255,.55)');
      eyes(ctx, w * 0.05, -h * 0.5, w * 0.4, 3.2);
      ctx.strokeStyle = '#2a4a22'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(w * 0.28, -h * 0.32, 3, 0.2, Math.PI - 0.2); ctx.stroke();
      // 잎사귀
      ctx.fillStyle = '#3e8e34'; ctx.beginPath(); ctx.ellipse(-2, -h + 2, 4, 9, -0.5, 0, Math.PI * 2); ctx.fill();
    },
    spore(ctx, m, t) {
      const b = Math.abs(Math.sin(t * 4)) * 12, r = m.w / 2;
      ctx.translate(0, -b);
      ell(ctx, 0, -r, r, r, m.d.color, m.d.color2, 2);
      for (const [x, y, rr] of [[-8, -r - 9, 3], [6, -r - 12, 2.5], [-11, -r + 4, 2], [10, -r + 6, 2.2]]) ell(ctx, x, y, rr, rr, m.d.color2);
      eyes(ctx, -1, -r, 9, 3);
      ctx.translate(0, b);
    },
    crab(ctx, m, t, big) {
      const k = m.w / 50, walk = Math.sin(t * 12) * (m.moving ? 1 : 0.2);
      ctx.save(); ctx.scale(k, k);
      if (m.boss && m.boss.guarding) {
        // 껍데기 속에 숨은 상태
        ell(ctx, 0, -18, 26, 18, '#d8c0a0', '#8a6a4a', 2);
        ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -18, 12, 0, Math.PI * 1.6); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -18, 6, 0, Math.PI * 1.6); ctx.stroke();
        ctx.restore(); return;
      }
      ctx.strokeStyle = m.d.color2; ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) for (const sgn of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(sgn * 8, -10); ctx.lineTo(sgn * (16 + i * 3), -6 + (i % 2 ? walk : -walk) * 3); ctx.lineTo(sgn * (18 + i * 4), 0); ctx.stroke();
      }
      if (big) { // 소라 껍데기
        ell(ctx, -10, -24, 20, 16, '#d8c0a0', '#8a6a4a', 2);
        ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(-10, -24, 10, 0, Math.PI * 1.6); ctx.stroke();
        ctx.beginPath(); ctx.arc(-10, -24, 4, 0, Math.PI * 1.6); ctx.stroke();
      }
      ell(ctx, 0, -14, 17, 11, m.d.color, m.d.color2, 2);
      const raise = m.boss && m.boss.raise ? m.boss.raise : 0;
      ell(ctx, 20, -18 - raise * 14, 8, 6, m.d.color, m.d.color2, 2);
      ell(ctx, 24, -22 - raise * 14, 5, 3, shade(m.d.color, 0.2));
      ctx.strokeStyle = m.d.color2; ctx.beginPath(); ctx.moveTo(4, -22); ctx.lineTo(5, -30); ctx.moveTo(10, -21); ctx.lineTo(12, -29); ctx.stroke();
      ell(ctx, 5, -31, 3, 3, '#fff'); ell(ctx, 12, -30, 3, 3, '#fff');
      ell(ctx, 6, -31, 1.6, 1.6, '#111'); ell(ctx, 13, -30, 1.6, 1.6, '#111');
      if (m.boss) { ctx.fillStyle = '#300'; ctx.fillRect(2, -13, 10, 2); }
      ctx.restore();
    },
    mushroom(ctx, m, t) {
      const h = m.h, w = m.w / 2, hop = m.moving ? Math.abs(Math.sin(t * 9)) * 4 : 0;
      ctx.translate(0, -hop);
      rrect(ctx, -w * 0.45, -h * 0.55, w * 0.9, h * 0.55, 6, m.d.color2, '#a08060');
      eyes(ctx, -2, -h * 0.33, 8, 2.6);
      ctx.fillStyle = m.d.color; ctx.strokeStyle = shade(m.d.color, -0.4); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, -h * 0.55, w * 1.05, h * 0.45, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (const [x, y, r] of [[-10, -h * 0.75, 4], [6, -h * 0.85, 3.5], [14, -h * 0.65, 3]]) ell(ctx, x, y, r, r, '#fff3dc');
      // 작은 창
      ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(w * 0.6, -h * 0.15); ctx.lineTo(w * 1.1, -h * 0.75); ctx.stroke();
      ctx.fillStyle = '#ccc'; ctx.beginPath(); ctx.moveTo(w * 1.1, -h * 0.75); ctx.lineTo(w * 1.25, -h * 0.95); ctx.lineTo(w * 0.98, -h * 0.82); ctx.fill();
      ctx.translate(0, hop);
    },
    shell(ctx, m, t) {
      const w = m.w / 2, open = 0.25 + Math.abs(Math.sin(t * 1.6)) * 0.35;
      ell(ctx, 0, -6, w, 6, m.d.color2);
      ell(ctx, 4, -12, 6, 5, '#f4fbff', '#b0c0d0', 1);
      ctx.save(); ctx.translate(-w + 4, -8); ctx.rotate(-open);
      ctx.fillStyle = m.d.color; ctx.strokeStyle = m.d.color2; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(w - 4, 0, w, m.h * 0.6, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const a = Math.PI + (i + 0.5) * Math.PI / 5, x = w - 4 + Math.cos(a) * w, y = Math.sin(a) * m.h * 0.6;
        ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); ctx.lineTo(x + 3, y); ctx.fill();
      }
      ctx.restore();
      eyes(ctx, 6, -7, 9, 2.2);
    },
    lizard(ctx, m, t) {
      const w = m.w / 2, wk = m.moving ? Math.sin(t * 14) : 0;
      ctx.fillStyle = m.d.color2; ctx.beginPath(); ctx.moveTo(-w * 0.5, -14); ctx.quadraticCurveTo(-w * 1.1, -12 + wk * 3, -w, -2); ctx.lineTo(-w * 0.4, -8); ctx.fill();
      for (const [x, a] of [[-10, wk], [12, -wk]]) { ctx.save(); ctx.translate(x, -8); ctx.rotate(a * 0.5); ctx.fillStyle = m.d.color2; ctx.fillRect(-2, 0, 4, 9); ctx.restore(); }
      ell(ctx, 0, -14, w * 0.6, 9, m.d.color, m.d.color2, 2);
      ell(ctx, w * 0.62, -18, 12, 8, m.d.color, m.d.color2, 2);
      ctx.fillStyle = '#ffd36a'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-14 + i * 8, -22); ctx.lineTo(-10 + i * 8, -29); ctx.lineTo(-6 + i * 8, -22); ctx.fill(); }
      ell(ctx, w * 0.7, -21, 3, 3, '#fff'); ell(ctx, w * 0.72, -21, 1.6, 2, '#111');
    },
    rat(ctx, m, t) {
      const w = m.w / 2, hop = m.moving ? Math.abs(Math.sin(t * 16)) * 3 : 0;
      ctx.translate(0, -hop);
      ctx.strokeStyle = '#d09090'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * 0.7, -10); ctx.quadraticCurveTo(-w * 1.3, -20, -w * 1.2, -4); ctx.stroke();
      ell(ctx, -2, -12, w * 0.7, 12, m.d.color, m.d.color2, 2);
      ell(ctx, w * 0.55, -15, 11, 9, m.d.color, m.d.color2, 2);
      ell(ctx, w * 0.35, -25, 6, 6, '#e8b0b0', m.d.color2, 1.5);
      ell(ctx, w * 0.95, -14, 2.5, 2.5, '#f08080');
      ell(ctx, w * 0.62, -18, 2, 2.4, '#111');
      ctx.translate(0, hop);
    },
    golem(ctx, m, t) {
      const h = 78, sway = Math.sin(t * 3) * 0.06;
      ctx.scale(m.w / 52, m.h / 78);   // 기준 크기(52×78)로 그린 뒤 확대
      ctx.rotate(sway);
      ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-3, -h * 0.45, 6, h * 0.45);
      ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-26, -h * 0.62); ctx.lineTo(26, -h * 0.62); ctx.stroke();
      ctx.strokeStyle = m.d.color; ctx.lineWidth = 2; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 26, -h * 0.62); ctx.lineTo(sx * 31, -h * 0.55); ctx.moveTo(sx * 26, -h * 0.62); ctx.lineTo(sx * 31, -h * 0.68); ctx.stroke(); }
      rrect(ctx, -14, -h * 0.75, 28, h * 0.38, 6, '#c0904a', '#7a5a2a');
      ell(ctx, 0, -h * 0.82, 13, 12, m.d.color, m.d.color2, 2);
      ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(-6, -h * 0.85); ctx.lineTo(-2, -h * 0.81); ctx.moveTo(-2, -h * 0.85); ctx.lineTo(-6, -h * 0.81);
      ctx.moveTo(3, -h * 0.85); ctx.lineTo(7, -h * 0.81); ctx.moveTo(7, -h * 0.85); ctx.lineTo(3, -h * 0.81);
      ctx.moveTo(-6, -h * 0.76); ctx.lineTo(7, -h * 0.76); ctx.stroke();
      ell(ctx, 0, -h * 0.92, 20, 4, '#b08a3a'); ctx.fillStyle = '#c9a050'; ctx.beginPath(); ctx.ellipse(0, -h * 0.93, 11, 9, 0, Math.PI, 0); ctx.fill();
    },
    spirit(ctx, m, t) {
      const r = m.w / 2;
      ctx.globalAlpha *= 0.85;
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = m.d.color2; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(-r * 0.4 - i * 7, -r + Math.sin(t * 5 + i) * 6, 8 - i * 2, 0, Math.PI * 1.5); ctx.stroke();
      }
      ell(ctx, 0, -r, r * 0.8, r * 0.85, m.d.color, m.d.color2, 2);
      ell(ctx, -r * 0.2, -r * 1.25, r * 0.3, r * 0.15, 'rgba(255,255,255,.7)');
      eyes(ctx, 0, -r, 9, 2.8, '#1a5a6a');
    },
    boar(ctx, m, t) {
      const w = m.w / 2, wk = m.moving ? Math.sin(t * 16) : 0, flap = Math.sin(t * 18);
      for (const [x, a] of [[-w * 0.5, wk], [-w * 0.2, -wk], [w * 0.25, wk], [w * 0.5, -wk]]) {
        ctx.save(); ctx.translate(x, -12); ctx.rotate(a * 0.45); ctx.fillStyle = m.d.color2; ctx.fillRect(-3, 0, 6, 12); ctx.restore();
      }
      ell(ctx, 0, -24, w * 0.85, 15, m.d.color, m.d.color2, 2);
      ctx.fillStyle = '#e8f0ff'; ctx.strokeStyle = '#a0b0c8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-6, -36); ctx.quadraticCurveTo(-26, -58 - flap * 8, -30, -36 - flap * 4); ctx.quadraticCurveTo(-18, -40, -6, -34); ctx.fill(); ctx.stroke();
      ell(ctx, w * 0.75, -26, 13, 11, m.d.color, m.d.color2, 2);
      ell(ctx, w * 0.98, -24, 6, 5, '#d8a090', '#8a5a4a', 1.5);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(w * 0.88, -19); ctx.lineTo(w * 1.02, -30); ctx.lineTo(w * 0.94, -18); ctx.fill();
      ell(ctx, w * 0.78, -31, 2, 2.5, '#111');
    },
    // 공허의 군주 녹스: 떠 있는 망토 형체 + 왕관 + 붉은 눈. 페이즈가 오를수록 오라가 커짐
    nox(ctx, m, t) {
      const ph = m.boss ? m.boss.phase : 0, h = m.h, w = m.w / 2, hover = Math.sin(t * 2) * 8 - 20;
      ctx.save(); ctx.translate(0, hover);
      ctx.globalCompositeOperation = 'lighter';
      const aura = ctx.createRadialGradient(0, -h * 0.55, 10, 0, -h * 0.55, w * (1.6 + ph * 0.35));
      aura.addColorStop(0, ph === 2 ? 'rgba(255,60,120,.5)' : 'rgba(170,60,255,.45)'); aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, -h * 0.55, w * (1.6 + ph * 0.35), 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, -h, 0, 0);
      g.addColorStop(0, '#3a1a5a'); g.addColorStop(1, '#0a0412');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(-w * 0.45, -h * 0.78);
      for (let i = 0; i <= 8; i++) { const x = -w + i * (w * 2 / 8); ctx.lineTo(x, -10 + Math.sin(t * 5 + i) * 8 + (i % 2) * 14); }
      ctx.lineTo(w * 0.45, -h * 0.78); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#c040ff'; ctx.lineWidth = 2; ctx.stroke();
      // 팔
      for (const s of [-1, 1]) {
        ctx.strokeStyle = '#2a1040'; ctx.lineWidth = 14; ctx.lineCap = 'round';
        const raise = m.boss && m.boss.cur ? -0.9 : Math.sin(t * 1.5 + s) * 0.2;
        ctx.beginPath(); ctx.moveTo(s * w * 0.4, -h * 0.68); ctx.lineTo(s * w * 0.95, -h * (0.42 - raise * 0.25)); ctx.stroke();
        G.Draw.ell(ctx, s * w * 0.95, -h * (0.42 - raise * 0.25), 9, 9, '#c040ff');
      }
      // 머리 + 왕관 + 눈
      G.Draw.ell(ctx, 0, -h * 0.84, w * 0.36, w * 0.4, '#140820', '#c040ff', 2);
      ctx.fillStyle = '#e8c060';
      ctx.beginPath(); ctx.moveTo(-w * 0.34, -h * 0.94);
      for (let i = 0; i < 5; i++) { ctx.lineTo(-w * 0.34 + (i + 0.5) * w * 0.136, -h * 1.06 - (i % 2 ? 0 : 10)); ctx.lineTo(-w * 0.34 + (i + 1) * w * 0.136, -h * 0.95); }
      ctx.closePath(); ctx.fill();
      const eye = ph === 2 ? '#ff3060' : '#ff5050';
      ctx.shadowColor = eye; ctx.shadowBlur = 14;
      G.Draw.ell(ctx, -w * 0.13, -h * 0.85, 6, 3.5, eye); G.Draw.ell(ctx, w * 0.13, -h * 0.85, 6, 3.5, eye);
      ctx.shadowBlur = 0;
      if (m.guard >= 1) {   // 사슬
        ctx.strokeStyle = '#c8b8e8'; ctx.lineWidth = 5; ctx.setLineDash([10, 6]);
        for (const yy of [0.35, 0.55, 0.75]) { ctx.beginPath(); ctx.ellipse(0, -h * yy, w * 0.9, 14, 0.15, 0, Math.PI * 2); ctx.stroke(); }
        ctx.setLineDash([]);
      }
      ctx.restore();
    },
    pillar(ctx, m, t) {
      const h = m.h;
      ctx.fillStyle = '#2a1040'; ctx.fillRect(-26, -10, 52, 10);
      const g = ctx.createLinearGradient(-20, 0, 20, 0);
      g.addColorStop(0, '#5a20a0'); g.addColorStop(0.5, '#d0a0ff'); g.addColorStop(1, '#5a20a0');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-20, -10); ctx.lineTo(-14, -h); ctx.lineTo(0, -h - 18); ctx.lineTo(14, -h); ctx.lineTo(20, -10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#c8b8e8'; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
      ctx.beginPath(); ctx.moveTo(0, -h * 0.6); ctx.lineTo(0, -h * 0.6 - 200 + Math.sin(t * 3) * 6); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalCompositeOperation = 'lighter'; G.Draw.ell(ctx, 0, -h * 0.6, 22 + Math.sin(t * 6) * 4, 22 + Math.sin(t * 6) * 4, 'rgba(200,120,255,.35)');
    },
    echo(ctx, m, t) {
      ctx.globalAlpha *= 0.75;
      ctx.shadowColor = '#7ab8ff'; ctx.shadowBlur = 16;
      humanoid(ctx, {
        x: 0, y: 0, dir: 1, t, moving: m.moving, air: false, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee',
        look: { skin: '#cfe6ff', hair: '#e8f4ff', top: '#5a8ad0', bottom: '#3a5aa0', style: 'long', eye: 'sharp', eyeColor: '#bfe6ff' },
        weapon: 'sword', wcolor: '#e8f4ff', cape: '#7ab8ff',
      });
    },
    kaien(ctx, m, t) {
      if (m.d.clone) ctx.globalAlpha *= 0.6;
      humanoid(ctx, {
        x: 0, y: 0, dir: 1, t, moving: m.moving, air: false, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee',
        look: { skin: '#f0d8c0', hair: '#1a1a2a', top: '#2a2a4a', bottom: '#14141e', style: 'side', eye: 'sharp', eyeColor: '#c03050' },
        weapon: 'sword', wcolor: '#8a5aff', cape: '#5a1a3a', scale: m.h / 70,
      });
    },
    priest(ctx, m, t) {
      humanoid(ctx, {
        x: 0, y: 0, dir: 1, t, moving: m.moving, air: false, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'proj',
        look: { skin: '#e8d8d0', hair: '#c0c0d0', top: m.d.color, bottom: m.d.color2, style: 'long', beard: true, eye: 'sharp', eyeColor: '#ff3060', hat: '#2a1a4a' },
        weapon: 'wand', wcolor: '#c040ff', cape: '#1a0a3a', scale: m.h / 66,
      });
    },
    bandit(ctx, m, t) {
      const big = m.d.big;
      humanoid(ctx, {
        x: 0, y: 0, dir: 1, t, moving: m.moving, air: false, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: m.d.bow ? 'proj' : 'melee',
        look: { skin: '#f0c8a0', hair: '#2a1a1a', top: m.d.color, bottom: m.d.color2, style: 'short' },
        weapon: m.d.bow ? 'bow' : (big ? 'sword' : 'dagger'), wcolor: big ? '#d0d0d8' : '#b0b0b8',
        mask: big ? '#8a1a1a' : '#1a1a22', scale: big ? 1.7 : 1, cape: big ? '#5a1a1a' : null,
      });
    },
  };

  // 1.6: 전용 그림이 있는 몬스터 (src/render/monsters2.js)
  //  공통 동작: 맞으면 뒤로 움찔, 쓰러질 때는 종류별 방식(뒤집힘·녹아내림·떨어짐·부서짐·터짐)
  function art(ctx, m, t, A) {
    const die = m.dead ? Math.min(1, m.deadT / 0.55) : 0, hurt = m.hurtT > 0 ? m.hurtT / 0.12 : 0;
    let atk = m.atkAnim >= 0 ? m.atkAnim : 0;
    const p = G.Game.player;
    if (!atk && m.aggro > 0 && p && !m.dead && Math.abs(p.x - m.x) < m.w * 0.6 + 40 && Math.abs(p.y - m.y) < 80) atk = (Math.sin(t * 5) + 1) / 2;
    const s = { walk: m.moving ? 1 : 0, atk, hurt, die, t };
    ctx.save(); ctx.translate(m.x, m.y);
    if (m.dead) ctx.globalAlpha = Math.max(0, 1 - Math.max(0, m.deadT - 0.4) / 0.5);
    if (A.sh && !(A.die === 'fall' && die > 0)) shadow(ctx, m.w * 0.45 * A.sh);
    if (m.hurtT > 0) ctx.filter = 'brightness(1.9)';
    ctx.scale(m.dir, 1);
    if (hurt) { ctx.translate(-hurt * 4, 0); ctx.rotate(-hurt * 0.12); }
    if (die) {
      const e = 1 - Math.pow(1 - die, 2);
      switch (A.die) {
        case 'flip': ctx.translate(-e * m.w * 0.2, 0); ctx.rotate(-e * 1.45); break;
        case 'melt': ctx.scale(1 + e * 0.55, Math.max(0.08, 1 - e * 0.9)); break;
        case 'fall': ctx.translate(-e * 10, e * e * 120); ctx.rotate(-e * 2.4); break;
        case 'crumble': ctx.translate(Math.sin(t * 60) * 2 * (1 - e), 0); ctx.scale(1 + e * 0.15, Math.max(0.1, 1 - e * 0.7)); ctx.rotate(e * 0.2); break;
        case 'pop': ctx.translate(0, -m.h * 0.5); ctx.scale(1 + e * 0.6, 1 + e * 0.6); ctx.translate(0, m.h * 0.5); break;
      }
    }
    A.draw(ctx, m, t, s);
    ctx.restore();
  }

  function monster(ctx, m, t) {
    const A = G.MonArt && G.MonArt[m.id];
    if (A) { art(ctx, m, t, A); return; }
    ctx.save(); ctx.translate(m.x, m.y);
    if (m.dead) ctx.globalAlpha = Math.max(0, 1 - m.deadT / 0.6);
    if (m.hurtT > 0) ctx.filter = 'brightness(1.9)';
    if (!['bandit', 'echo', 'kaien', 'priest'].includes(m.d.shape)) shadow(ctx, m.w * 0.45);
    ctx.scale(m.dir, 1);
    const f = MON[m.d.shape] || MON.blob;
    f(ctx, m, t, m.d.kind === 'boss');
    ctx.restore();
  }

  return { humanoid, monster, ell, rrect, MON };   // MON: 1.7에서 기존 전용 모양(녹스·카이엔 등)을 감싸 다듬을 때 사용
})();
