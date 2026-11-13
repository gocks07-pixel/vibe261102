// 현자 결정 후보: 번개 고리 구름이 캐릭터를 따라다님 — 움직이면 살짝 늦게 따라오며 기울고, 멈추면 머리 위로 돌아옴
(function () {
  const N = G.AuraM4b3, PI = Math.PI;
  G.AuraFollow = {
    // 게임에서 쓸 따라오기: p.__cl = {x, y, vx} 를 매 프레임 스프링으로 머리 위 목표점에 끌어당김
    step(p, dt) { const tx = p.x, ty = p.y - 100; const s = p.__cl || (p.__cl = { x: tx, y: ty, vx: 0, vy: 0 });
      const k = 40, d = 9; s.vx += ((tx - s.x) * k - s.vx * d) * dt; s.vy += ((ty - s.y) * k - s.vy * d) * dt; s.x += s.vx * dt; s.y += s.vy * dt; return s; },
    draw(c, p, t, s) { const tilt = Math.max(-0.35, Math.min(0.35, -s.vx / 600)); c.save(); c.translate(s.x, s.y); c.rotate(tilt); N.na(c, { x: 0, y: 100, dir: 1 }, t); c.restore(); },
  };
})();
