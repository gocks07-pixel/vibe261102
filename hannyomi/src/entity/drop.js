'use strict';
// 바닥에 떨어진 골드/아이템. payload: {gold} | {item: 장비 인스턴스 또는 {tid, qty}}
G.Drop = class {
  constructor(x, y, payload) {
    this.x = x; this.y = y; this.vx = G.U.rand(-70, 70); this.vy = -340;
    this.payload = payload; this.landed = false; this.t = Math.random() * 6; this.life = 90; this.dead = false;
    if (payload.item) this.tpl = G.ITEMS[payload.item.tid];
  }
  get box() { return { x: this.x - 16, y: this.y - 30, w: 32, h: 30 }; }
  update(dt, w) {
    this.t += dt; this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    if (this.landed) return;
    this.vy += 1400 * dt;
    const ny = this.y + this.vy * dt;
    this.x = G.U.clamp(this.x + this.vx * dt, 20, w.map.width - 20);
    if (this.vy > 0) {
      const gy = w.groundBelow(this.x, this.y);
      if (ny >= gy) { this.y = gy; this.landed = true; return; }
    }
    this.y = ny;
  }
  draw(ctx) {
    const bob = this.landed ? Math.sin(this.t * 4) * 3 - 4 : 0;
    ctx.save(); ctx.translate(this.x, this.y + bob);
    if (this.life < 10 && Math.floor(this.t * 8) % 2) ctx.globalAlpha = 0.4;
    if (this.payload.gold != null) {
      const big = this.payload.gold > 200, r = big ? 15 : 12;
      const glow = ctx.createRadialGradient(0, -14, 2, 0, -14, r * 2.2);
      glow.addColorStop(0, 'rgba(255,220,90,.55)'); glow.addColorStop(1, 'rgba(255,220,90,0)');
      ctx.fillStyle = glow; ctx.fillRect(-r * 2.2, -14 - r * 2.2, r * 4.4, r * 4.4);
      const sq = Math.abs(Math.cos(this.t * 3));   // 빙글빙글 도는 동전
      G.Draw.ell(ctx, 0, -14, r * (0.25 + sq * 0.75), r, '#ffd54a', '#a87a10', 2);
      if (sq > 0.5) { ctx.fillStyle = '#a87a10'; ctx.font = `bold ${big ? 14 : 12}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('G', 0, -9); }
      const tw = (this.t * 2) % 3;
      if (tw < 0.4) {
        ctx.fillStyle = '#fff'; ctx.globalAlpha = 1 - tw / 0.4;
        ctx.beginPath(); ctx.moveTo(6, -30); ctx.lineTo(8, -25); ctx.lineTo(13, -23); ctx.lineTo(8, -21); ctx.lineTo(6, -16); ctx.lineTo(4, -21); ctx.lineTo(-1, -23); ctx.lineTo(4, -25); ctx.closePath(); ctx.fill();
      }
    } else {
      const it = this.payload.item, g = it.grade || 0;
      if (g > 0) {
        const glow = ctx.createRadialGradient(0, -14, 2, 0, -14, 26);
        glow.addColorStop(0, G.GRADES[g].color); glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha *= 0.6 + Math.sin(this.t * 5) * 0.3; ctx.fillStyle = glow; ctx.fillRect(-26, -40, 52, 52); ctx.globalAlpha = 1;
      }
      const im = G.Icons.img(G.Icons.item(this.tpl));
      if (im.complete) ctx.drawImage(im, -15, -30, 30, 30);
      if (this.tpl.quest) { ctx.fillStyle = '#ffd54a'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Q', 12, -26); }
    }
    ctx.restore();
  }
};
