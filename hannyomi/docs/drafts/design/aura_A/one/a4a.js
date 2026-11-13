// 천궁 결정 후보: 금빛 별 활(나) 0.6배 + 따라다니기 — 등 뒤 목표점으로 스프링처럼 따라옴, 움직이면 기울어짐
(function () {
  const A = G.AuraMock;
  G.AuraFollowBow = {
    step(p, dt) { const tx = p.x - p.dir * 6, ty = p.y - 50; const s = p.__cb || (p.__cb = { x: tx, y: ty, vx: 0, vy: 0 });
      const k = 40, d = 9; s.vx += ((tx - s.x) * k - s.vx * d) * dt; s.vy += ((ty - s.y) * k - s.vy * d) * dt; s.x += s.vx * dt; s.y += s.vy * dt; return s; },
    draw(c, p, t, s) { const tilt = Math.max(-0.35, Math.min(0.35, -s.vx / 600)); c.save(); c.translate(s.x, s.y); c.rotate(tilt); c.scale(0.6, 0.6); A.na(c, { x: -p.dir * 14, y: 44, dir: p.dir }, t); c.restore(); },
  };
})();
