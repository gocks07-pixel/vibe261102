'use strict';
// 데미지 숫자, 베기/폭발/섬광/잔상 이펙트, 파티클
// 'glow' 가 붙은 종류는 밝게 더해지는(lighter) 합성으로 그린다
G.FX = {
  list: [],
  MAX: 700,
  EL: { fire: '#ff9a40', wind: '#7ef0a0', arcane: '#8fb4ff', shadow: '#c08cff', poison: '#a8f060', earth: '#ffe0a0', holy: '#fff0a0' },
  n(k) { return Math.max(1, Math.round(k * G.Settings.fxMul)); },
  clear() { this.list = []; },
  add(o) { if (this.list.length < this.MAX) { o.t = 0; this.list.push(o); } return o; },

  dmg(x, y, val, type) { this.add({ k: 'num', x: x + G.U.rand(-6, 6), y, val, type, life: type === 'crit' ? 1.1 : 0.9 }); },
  text(x, y, str, color, size = 15, life = 1.2) { this.add({ k: 'text', x, y, str, color, size, life }); },
  slash(x, y, dir, w, h, color) {
    this.add({ k: 'slash', x, y, dir, w, h, color: color || '#fff', life: 0.26, glow: true });
    this.burst(x + dir * w * 0.2, y, color || '#fff', 6, 160);
  },
  ring(x, y, r, color, life = 0.45) { this.add({ k: 'ring', x, y, r, color, life, glow: true }); },
  flash(x, y, r, color, life = 0.18) { this.add({ k: 'flash', x, y, r, color, life, glow: true }); },
  burst(x, y, color, n = 10, spd = 220) {
    n = this.n(n);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = G.U.rand(spd * 0.3, spd);
      this.add({ k: 'p', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, color, r: G.U.rand(2, 4.5), life: G.U.rand(0.3, 0.7), glow: true });
    }
  },
  // 위로 떠오르는 작은 빛 (버프 오라, 회복)
  rise(x, y, color, n = 1) {
    n = this.n(n);
    for (let i = 0; i < n; i++) this.add({ k: 'p', x: x + G.U.rand(-16, 16), y, vx: G.U.rand(-10, 10), vy: G.U.rand(-90, -50), grav: -20, color, r: G.U.rand(1.5, 3), life: G.U.rand(0.5, 0.9), glow: true });
  },
  // 타격 섬광: 방사형 빛줄기 + 파편
  spark(x, y, color, big) {
    const rays = [];
    for (let i = 0; i < (big ? 8 : 5); i++) rays.push(Math.random() * Math.PI * 2);
    this.add({ k: 'spark', x, y, color, rays, len: big ? 46 : 30, life: big ? 0.22 : 0.16, glow: true });
    this.flash(x, y, big ? 50 : 32, color);
    this.burst(x, y, color, big ? 12 : 6, big ? 300 : 200);
  },
  stars(x, y, n = 6) {
    n = this.n(n);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = G.U.rand(120, 280);
      this.add({ k: 'star', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, rot: Math.random() * 6, life: G.U.rand(0.4, 0.7), color: '#ffe680', glow: true });
    }
  },
  whirl(x, y, r, color) { this.add({ k: 'whirl', x, y, r, color, life: 0.38, glow: true }); this.burst(x, y, color, 14, 320); },
  // 마법진 + 충격파
  shock(x, y, r, color) {
    this.add({ k: 'rune', x, y: y + 28, r: r * 0.55, color, life: 0.6, glow: true });
    this.add({ k: 'shock', x, y, r, color, life: 0.42, glow: true });
    this.burst(x, y, color, 20, 360);
  },
  pillar(x, y, color) { this.add({ k: 'pillar', x, y, color, life: 0.7, glow: true }); this.rise(x, y - 10, color, 10); },
  beam(x, y0, y1, color) { this.add({ k: 'beam', x, y0, y1, color, life: 0.28, glow: true }); },
  // 캐릭터 잔상 (o = G.Draw.humanoid 인자)
  ghost(o, color) { this.add({ k: 'ghost', o, color, life: 0.28 }); },
  wind(x, y, dir) {
    for (let i = 0; i < this.n(5); i++) this.add({ k: 'line', x: x - dir * G.U.rand(0, 30), y: y + G.U.rand(-30, 10), dir, len: G.U.rand(20, 45), life: 0.25, color: 'rgba(220,240,255,.9)' });
  },
  slam(rect) {
    this.add({ k: 'slam', x: rect.x, y: rect.y, w: rect.w, h: rect.h, life: 0.25 });
    this.burst(rect.x + rect.w / 2, rect.y + rect.h, '#d8c0a0', 16, 260);
  },

  update(dt) {
    for (const f of this.list) {
      f.t += dt;
      if (f.k === 'num' || f.k === 'text') f.y -= 38 * dt;
      if (f.k === 'p' || f.k === 'star') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.grav != null ? f.grav : 500) * dt; if (f.rot != null) f.rot += dt * 10; }
      if (f.k === 'line') f.x -= f.dir * 300 * dt;
    }
    this.list = this.list.filter(f => f.t < f.life);
  },

  draw(ctx) {
    for (const f of this.list) {
      const k = f.t / f.life;
      ctx.save();
      if (f.glow) ctx.globalCompositeOperation = 'lighter';
      switch (f.k) {
        case 'fn': f.draw(ctx, f, k); break;   // 1.7.10: 스킬 전용 연출 (skillx.js)
        case 'num': {
          const crit = f.type === 'crit', size = crit ? 28 : 20;
          const col = { hit: '#ffb43b', crit: '#ff4d5a', hurt: '#c48bff', heal: '#6dff8a', mp: '#6ab8ff', poison: '#9be35a', burn: '#ff8a3a' }[f.type] || '#fff';
          ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
          ctx.font = `900 ${size}px "Malgun Gothic", sans-serif`; ctx.textAlign = 'center';
          const s = (f.type === 'heal' ? '+' : '') + G.U.fmt(f.val);
          const sc = k < 0.12 ? 1.5 - k * 4.2 : 1;
          const shake = crit && f.t < 0.2 ? Math.sin(f.t * 90) * 3 : 0;
          ctx.translate(f.x + shake, f.y); ctx.scale(sc, sc);
          ctx.lineWidth = 4; ctx.strokeStyle = '#1a0f05'; ctx.strokeText(s, 0, 0);
          if (crit) { const g = ctx.createLinearGradient(0, -24, 0, 2); g.addColorStop(0, '#ffe680'); g.addColorStop(1, '#ff3b4a'); ctx.fillStyle = g; } else ctx.fillStyle = col;
          ctx.fillText(s, 0, 0);
          if (crit) { ctx.font = '900 12px "Malgun Gothic"'; ctx.strokeText('CRITICAL', 0, -26); ctx.fillStyle = '#ffd54a'; ctx.fillText('CRITICAL', 0, -26); }
          break;
        }
        case 'text':
          ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
          ctx.font = `800 ${f.size}px "Malgun Gothic", sans-serif`; ctx.textAlign = 'center';
          ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.strokeText(f.str, f.x, f.y);
          ctx.fillStyle = f.color; ctx.fillText(f.str, f.x, f.y);
          break;
        case 'slash': {
          ctx.globalAlpha = 1 - k;
          ctx.translate(f.x, f.y); ctx.scale(f.dir, 1);
          ctx.shadowColor = f.color; ctx.shadowBlur = 18;
          ctx.strokeStyle = f.color; ctx.lineWidth = 12 * (1 - k) + 2; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.ellipse(0, 0, f.w * 0.55, f.h * 0.5, 0, -1.4 + k * 0.7, 1.1 + k * 0.7); ctx.stroke();
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3 * (1 - k) + 1;
          ctx.beginPath(); ctx.ellipse(0, 0, f.w * 0.5, f.h * 0.44, 0, -1.2 + k * 0.7, 0.95 + k * 0.7); ctx.stroke();
          break;
        }
        case 'ring':
          ctx.globalAlpha = 1 - k; ctx.strokeStyle = f.color; ctx.lineWidth = 6 * (1 - k) + 1;
          ctx.shadowColor = f.color; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r * (0.3 + k * 0.9), f.r * (0.3 + k * 0.9) * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
          break;
        case 'flash': {
          const r = f.r * (0.6 + k * 0.6), g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
          g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - k)})`); g.addColorStop(0.35, f.color); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = 1 - k; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'p':
          ctx.globalAlpha = 1 - k; ctx.fillStyle = f.color;
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
          break;
        case 'spark':
          ctx.globalAlpha = 1 - k; ctx.strokeStyle = f.color; ctx.lineCap = 'round';
          for (const a of f.rays) {
            const r0 = f.len * k * 0.6, r1 = f.len * (0.4 + k);
            ctx.lineWidth = 4 * (1 - k) + 1;
            ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0); ctx.lineTo(f.x + Math.cos(a) * r1, f.y + Math.sin(a) * r1); ctx.stroke();
          }
          break;
        case 'star': {
          ctx.globalAlpha = 1 - k; ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.fillStyle = f.color;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.5 : 7, a = i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
          ctx.closePath(); ctx.fill();
          break;
        }
        case 'whirl':
          ctx.globalAlpha = 1 - k; ctx.translate(f.x, f.y); ctx.scale(1, 0.5); ctx.rotate(k * 9);
          ctx.shadowColor = f.color; ctx.shadowBlur = 16; ctx.lineCap = 'round';
          for (let i = 0; i < 3; i++) {
            ctx.rotate(Math.PI * 2 / 3);
            ctx.strokeStyle = i ? f.color : '#fff'; ctx.lineWidth = 9 * (1 - k) + 2;
            ctx.beginPath(); ctx.arc(0, 0, f.r * (0.55 + k * 0.45), 0, 1.6); ctx.stroke();
          }
          break;
        case 'shock': {
          const r = f.r * (0.2 + k), g = ctx.createRadialGradient(f.x, f.y, r * 0.6, f.x, f.y, r);
          g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.8, f.color); g.addColorStop(1, 'rgba(255,255,255,0.9)');
          ctx.globalAlpha = 1 - k; ctx.fillStyle = g;
          ctx.beginPath(); ctx.ellipse(f.x, f.y, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'rune':
          ctx.globalAlpha = (1 - k) * 0.9; ctx.translate(f.x, f.y); ctx.scale(1, 0.32); ctx.rotate(k * 3);
          ctx.strokeStyle = f.color; ctx.lineWidth = 3; ctx.shadowColor = f.color; ctx.shadowBlur = 14;
          ctx.beginPath(); ctx.arc(0, 0, f.r, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, f.r * 0.72, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) { const a = i * Math.PI * 4 / 6; ctx.lineTo(Math.cos(a) * f.r * 0.72, Math.sin(a) * f.r * 0.72); }
          ctx.stroke();
          break;
        case 'pillar': {
          const w = 46 * (1 - k * 0.5), g = ctx.createLinearGradient(f.x - w, 0, f.x + w, 0);
          g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, f.color); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = (k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8) * 0.85; ctx.fillStyle = g;
          ctx.fillRect(f.x - w, f.y - 260, w * 2, 260);
          break;
        }
        case 'beam': {
          ctx.globalAlpha = 1 - k; ctx.strokeStyle = f.color; ctx.lineWidth = 5 * (1 - k) + 1;
          ctx.shadowColor = f.color; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.moveTo(f.x, f.y0); ctx.lineTo(f.x, f.y1); ctx.stroke();
          break;
        }
        case 'ghost': {
          const o = Object.assign({}, f.o, { alpha: 0.45 * (1 - k) });
          G.Draw.humanoid(ctx, o);
          break;
        }
        case 'line':
          ctx.globalAlpha = 1 - k; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x - f.dir * f.len, f.y); ctx.stroke();
          break;
        case 'hand': {   // 바닥에서 솟구치는 공허의 손
          const up = Math.sin(Math.min(1, k * 2.2) * Math.PI / 2) * (1 - Math.max(0, k - 0.6) / 0.4);
          ctx.translate(f.x, f.y); ctx.fillStyle = '#2a0a40'; ctx.strokeStyle = '#c060ff'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-26, -150 * up);
          for (let i = 0; i < 4; i++) { ctx.lineTo(-22 + i * 14, -170 * up - 16); ctx.lineTo(-16 + i * 14, -150 * up); }
          ctx.lineTo(34, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
          break;
        }
        case 'nighthand': {   // 1.7.7 녹스: 별빛 테두리의 검은 밤의 손
          const up = Math.sin(Math.min(1, k * 2.2) * Math.PI / 2) * (1 - Math.max(0, k - 0.6) / 0.4);
          ctx.translate(f.x, f.y); ctx.fillStyle = '#0c0c20'; ctx.strokeStyle = '#b8b0f0'; ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-22, -140 * up);
          for (let i = 0; i < 4; i++) { ctx.lineTo(-19 + i * 12, -168 * up - 14); ctx.lineTo(-13 + i * 12, -140 * up); }
          ctx.lineTo(30, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'rgba(216,222,248,.8)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-16 + i * 8, -40 * up - i * 18 * up, 1.2, 0, 7); ctx.fill(); }
          break;
        }
        case 'drop': {   // 1.7.5 몬스터 낙하물: 위에서 떨어져 땅에 부딪힘
          const fall = Math.min(1, k * 3), y = f.y - 300 * (1 - fall);
          ctx.globalAlpha = k < 0.34 ? 1 : 1 - (k - 0.34) / 0.66;
          ctx.translate(f.x, fall < 1 ? y : f.y - 6);
          if (f.obj === 'ember') { ctx.fillStyle = '#ffb040'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff0a0'; ctx.beginPath(); ctx.arc(0, -1, 3.5, 0, Math.PI * 2); ctx.fill(); if (fall < 1) { ctx.strokeStyle = 'rgba(255,160,60,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -40); ctx.stroke(); } }
          else if (f.obj === 'bolt') { ctx.strokeStyle = '#fff6b0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -300 * (1 - fall) - 40); ctx.lineTo(8, -30); ctx.lineTo(-6, -16); ctx.lineTo(4, 0); ctx.stroke(); }
          else if (f.obj === 'crystal') { ctx.fillStyle = '#d090ff'; ctx.strokeStyle = '#6a2aa0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(7, -6); ctx.lineTo(0, 6); ctx.lineTo(-7, -6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,220,255,.8)'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(4, -7); ctx.lineTo(0, -4); ctx.closePath(); ctx.fill(); }
          else if (f.obj === 'icicle') { ctx.fillStyle = '#d8f2ff'; ctx.strokeStyle = '#6ab0e0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, -24); ctx.lineTo(6, -24); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); }
          else { ctx.fillStyle = '#9a8a78'; ctx.strokeStyle = '#5a4c40'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(-6, -14); ctx.lineTo(6, -13); ctx.lineTo(11, -2); ctx.lineTo(4, 6); ctx.lineTo(-7, 5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
          break;
        }
        case 'starfall': {   // 1.7.2 일곱 별 낙하: 하늘에서 별이 떨어져 땅에 부딪힘
          const fall = Math.min(1, k * 3), y = f.y - 320 * (1 - fall);
          ctx.globalAlpha = k < 0.34 ? 1 : 1 - (k - 0.34) / 0.66;
          if (fall < 1) { ctx.strokeStyle = 'rgba(255,240,180,.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(f.x + 40 * (1 - fall) + 30, y - 70); ctx.lineTo(f.x, y); ctx.stroke(); }
          ctx.translate(f.x, fall < 1 ? y : f.y - 10); ctx.rotate(k * 6); ctx.fillStyle = '#fff4c0'; ctx.strokeStyle = '#c9a640'; ctx.lineWidth = 2;
          ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 17, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
          if (fall >= 1) { ctx.rotate(-k * 6); ctx.strokeStyle = 'rgba(255,240,180,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 10, 30 + k * 40, 8 + k * 6, 0, 0, Math.PI * 2); ctx.stroke(); }
          break;
        }
        case 'trap': {   // 2.1 바르크 덫: 바닥에서 철 이빨이 닫힘
          const up = Math.min(1, k * 4); ctx.globalAlpha = 1 - Math.max(0, k - 0.6) / 0.4; ctx.translate(f.x, f.y);
          ctx.strokeStyle = '#c0c0c8'; ctx.lineWidth = 3;
          for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 9, 0); ctx.lineTo(i * 9 + (i % 2) * 4, -26 * up); ctx.stroke(); }
          ctx.strokeStyle = '#7a7a84'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, -2, 34, 7, 0, 0, Math.PI * 2); ctx.stroke();
          break;
        }
        case 'arrows': {   // 2.1 부하 궁수 화살 비
          const fall = Math.min(1, k * 3); ctx.globalAlpha = k < 0.4 ? 1 : 1 - (k - 0.4) / 0.6; ctx.strokeStyle = '#d8c8a0'; ctx.lineWidth = 2.5;
          for (let i = 0; i < 5; i++) { const x = f.x - 40 + i * 20, y = f.y - 280 * (1 - fall) - (i % 2) * 20; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y - 26); ctx.stroke(); ctx.fillStyle = '#8a8a90'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y - 7); ctx.lineTo(x + 3, y - 5); ctx.fill(); }
          break;
        }
        case 'spore': {   // 2.1 모르웬 독 포자 비
          ctx.globalAlpha = 1 - k; for (let i = 0; i < 6; i++) { const g = ctx.createRadialGradient(f.x - 40 + i * 16, f.y - 20 - (i % 3) * 18, 0, f.x - 40 + i * 16, f.y - 20 - (i % 3) * 18, 26 + k * 20); g.addColorStop(0, 'rgba(150,230,90,.8)'); g.addColorStop(1, 'rgba(150,230,90,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x - 40 + i * 16, f.y - 20 - (i % 3) * 18, 26 + k * 20, 0, 7); ctx.fill(); }
          break;
        }
        case 'missile': {   // 2.1 그라운더 미사일
          const fall = Math.min(1, k * 3), y = f.y - 340 * (1 - fall); ctx.globalAlpha = k < 0.34 ? 1 : 1 - (k - 0.34) / 0.66; ctx.translate(f.x, fall < 1 ? y : f.y);
          if (fall < 1) { ctx.fillStyle = '#c0c0c8'; ctx.fillRect(-4, -22, 8, 22); ctx.fillStyle = '#ff7a3a'; ctx.beginPath(); ctx.moveTo(-4, -22); ctx.lineTo(0, -30); ctx.lineTo(4, -22); ctx.fill(); ctx.fillStyle = 'rgba(255,180,80,.8)'; ctx.beginPath(); ctx.arc(0, -36, 6, 0, 7); ctx.fill(); }
          else { const g = ctx.createRadialGradient(0, -20, 0, 0, -20, 70); g.addColorStop(0, 'rgba(255,220,140,.95)'); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -20, 70, 0, 7); ctx.fill(); }
          break;
        }
        case 'icespear': {   // 2.1 카이엔 서리 창
          const fall = Math.min(1, k * 3), y = f.y - 320 * (1 - fall); ctx.globalAlpha = k < 0.4 ? 1 : 1 - (k - 0.4) / 0.6; ctx.translate(f.x, fall < 1 ? y : f.y);
          ctx.fillStyle = '#d8f2ff'; ctx.strokeStyle = '#6ab0e0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, -60); ctx.lineTo(9, -60); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
          break;
        }
        case 'cut': {    // 차원 절단 섬광 (tint: 녹스는 차가운 별빛)
          ctx.globalAlpha = 1 - k;
          const g = ctx.createLinearGradient(f.x, f.y, f.w > f.h ? f.x : f.x + f.w, f.w > f.h ? f.y + f.h : f.y), tc = f.tint || '160,60,255';
          g.addColorStop(0, `rgba(${tc},0)`); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, `rgba(${tc},0)`);
          ctx.fillStyle = g; ctx.fillRect(f.x, f.y, f.w, f.h);
          break;
        }
        case 'slam':
          ctx.globalAlpha = (1 - k) * 0.6; ctx.fillStyle = '#ff5030'; ctx.fillRect(f.x, f.y, f.w, f.h);
          break;
      }
      ctx.restore();
    }
  },
};
