'use strict';
// 투사체. owner: 'player'(onHit 콜백으로 몬스터 타격) | 'enemy'(hurt 정보로 플레이어 타격)
G.Projectile = class {
  constructor(o) {
    Object.assign(this, { vx: 0, vy: 0, life: 3, dist: 0, range: 600, pierce: 1, kind: 'arrow', r: 8, owner: 'player', dead: false, t: 0 }, o);
    this.hits = new Set();
  }
  update(dt, w) {
    this.t += dt;
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.dist += Math.hypot(this.vx, this.vy) * dt;
    this.life -= dt;
    if (this.bounce) {   // 화면 안을 튕겨 다님 (어둠 구체)
      if (this.x < 20 || this.x > w.map.width - 20) { this.vx *= -1; this.x = G.U.clamp(this.x, 20, w.map.width - 20); }
      if (this.y < 240 || this.y > G.GROUND_Y - 18) { this.vy *= -1; this.y = G.U.clamp(this.y, 240, G.GROUND_Y - 18); }
    }
    if (this.life <= 0 || this.dist > this.range || this.x < -50 || this.x > w.map.width + 50) { this.dead = true; return; }
    // 꼬리 빛 (플레이어 스킬)
    if (this.color && Math.random() < 0.7 * G.Settings.fxMul) {
      G.FX.add({ k: 'p', x: this.x, y: this.y, vx: -this.vx * 0.05, vy: G.U.rand(-20, 20), grav: 0, color: this.color, r: G.U.rand(1.5, 3.5), life: 0.3, glow: true });
    }
    if (this.groundY != null && this.y >= this.groundY) {
      this.dead = true;
      G.FX.burst(this.x, this.groundY, this.color || '#ccc', 6, 160);
      if (this.color) G.FX.flash(this.x, this.groundY - 6, 26, this.color);
      return;
    }
    const hb = { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 };
    if (this.owner === 'player') {
      for (const m of w.monsters) {
        if (m.dead || this.hits.has(m) || !G.U.overlap(hb, m.box)) continue;
        this.hits.add(m);
        this.onHit(m, this.hits.size - 1);
        if (--this.pierce <= 0) { this.dead = true; break; }
      }
    } else {
      const p = w.player;
      if (!p.dead && G.U.overlap(hb, p.box)) {
        this.dead = true;
        p.hurt(this.hurt.raw || 0, this.x - this.vx, this.hurt);
      }
    }
  }
  draw(ctx) {
    const a = Math.atan2(this.vy, this.vx);
    ctx.save(); ctx.translate(this.x, this.y);
    switch (this.kind) {
      case 'arrow':
        ctx.rotate(a);
        ctx.strokeStyle = this.owner === 'enemy' ? '#5a3a1a' : '#8a5a2a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(10, 0); ctx.stroke();
        ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(8, -5); ctx.lineTo(8, 5); ctx.fill();
        ctx.fillStyle = this.owner === 'enemy' ? '#c03030' : '#fff'; ctx.fillRect(-24, -4, 7, 3); ctx.fillRect(-24, 1, 7, 3);
        break;
      case 'stone':
        G.Draw.ell(ctx, 0, 0, 7, 6, '#9a9088', '#5a5048');
        break;
      case 'orb': {
        const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
        g.addColorStop(0, '#fff'); g.addColorStop(0.35, '#8fb4ff'); g.addColorStop(1, 'rgba(80,120,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'star':
        ctx.rotate(this.t * 25); ctx.fillStyle = '#d8d8e8'; ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) { const r = i % 2 ? 3 : 10, an = i * Math.PI / 4; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      case 'bubble':
        G.Draw.ell(ctx, 0, 0, this.r, this.r, 'rgba(160,220,255,.45)', 'rgba(255,255,255,.9)', 2);
        G.Draw.ell(ctx, -this.r * 0.35, -this.r * 0.35, this.r * 0.25, this.r * 0.18, 'rgba(255,255,255,.9)');
        break;
      case 'wave': {
        ctx.scale(Math.sign(this.vx) || 1, 1); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = '#8a5aff'; ctx.lineWidth = 6; ctx.shadowColor = '#8a5aff'; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(-10, 0, 20, -1.2, 1.2); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-10, 0, 18, -1, 1); ctx.stroke();
        break;
      }
      case 'deadstar': {   // 1.7.7 녹스: 꺼진 별 구체 (검은 구 + 별빛 테두리 + 희미한 별)
        const g = ctx.createRadialGradient(0, 0, 2, 0, 0, this.r * 2.2); g.addColorStop(0, 'rgba(150,140,220,.35)'); g.addColorStop(1, 'rgba(150,140,220,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, this.r * 2.2, 0, Math.PI * 2); ctx.fill();
        G.Draw.ell(ctx, 0, 0, this.r, this.r, '#05050e', '#9a7ae0', 2);
        ctx.fillStyle = `rgba(216,222,248,${0.3 + 0.2 * Math.sin(this.t * 5)})`; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5 + this.t, rr = i % 2 ? this.r * 0.2 : this.r * 0.5; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.fill();
        break;
      }
      case 'darkorb': {   // 1.7.4 장막의 사제·녹스의 전령의 어둠 구슬
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 13);
        g.addColorStop(0, '#12061e'); g.addColorStop(0.5, '#5a1a90'); g.addColorStop(1, 'rgba(224,128,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e090ff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 6, this.t * 8, this.t * 8 + 4); ctx.stroke();
        break;
      }
      case 'spike':     // 1.7.5 가시 조개 가시
        ctx.rotate(a); ctx.fillStyle = '#f0e0c0'; ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -3.5); ctx.lineTo(-6, 3.5); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      case 'windblade': // 1.7.5 바람 정령 바람 칼날
        ctx.scale(Math.sign(this.vx) || 1, 1); ctx.strokeStyle = '#9ef0c0'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(-8, 0, 14, -1.1, 1.1); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(-8, 0, 12, -0.9, 0.9); ctx.stroke();
        break;
      case 'iceshard':  // 1.7.6 서리 박쥐 서리 파편
        ctx.rotate(a); ctx.fillStyle = '#d8f2ff'; ctx.strokeStyle = '#6ab0e0'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-3, -4); ctx.lineTo(-9, 0); ctx.lineTo(-3, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      case 'laser':     // 1.7.5 감시 드론 레이저
        ctx.rotate(a); ctx.strokeStyle = 'rgba(255,80,80,.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(10, 0); ctx.stroke();
        ctx.strokeStyle = '#ffd0d0'; ctx.lineWidth = 2; ctx.stroke();
        break;
      case 'feather':   // 1.7.3 천공의 부엉이 깃털 화살
        ctx.rotate(a);
        ctx.fillStyle = '#eef0ff'; ctx.strokeStyle = '#9097dc'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(14, 0); ctx.quadraticCurveTo(0, -6, -14, -3); ctx.lineTo(-10, 0); ctx.lineTo(-14, 3); ctx.quadraticCurveTo(0, 6, 14, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#7d8ff0'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, 0); ctx.stroke();
        break;
      case 'gust': {   // 1.7.2 천공 돌풍: 바닥을 구르는 회오리
        for (let i = 0; i < 5; i++) {
          const yy = 14 - i * 9, rx = 8 + i * 4, ph = this.t * 14 + i;
          ctx.strokeStyle = i % 2 ? 'rgba(225,230,255,.9)' : 'rgba(200,180,255,.85)'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(Math.sin(ph) * 3, yy, rx, 3.5, 0, Math.PI * 0.1, Math.PI * 1.9); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,240,180,.9)'; ctx.beginPath(); ctx.arc(Math.sin(this.t * 9) * 10, -26, 2.5, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'voidorb': {
        const g = ctx.createRadialGradient(0, 0, 3, 0, 0, this.r * 1.8);
        g.addColorStop(0, '#000'); g.addColorStop(0.55, '#5a1090'); g.addColorStop(1, 'rgba(200,80,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, this.r * 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e0a0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, this.r, this.t * 6, this.t * 6 + 4); ctx.stroke();
        break;
      }
      case 'dagger':
        ctx.rotate(a);
        ctx.fillStyle = '#c0c8d0'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4); ctx.fill();
        ctx.fillStyle = '#6ad040'; ctx.fillRect(-2, -1.5, 12, 3);
        ctx.fillStyle = '#3a2a1a'; ctx.fillRect(-12, -2.5, 8, 5);
        break;
    }
    ctx.restore();
  }
};
