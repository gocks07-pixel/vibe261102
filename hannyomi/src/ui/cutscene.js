'use strict';
// 1.7.7 이야기 영상(컷신): 배경 설명 · 희생 엔딩 · 구원 엔딩 (히든 엔딩 장면은 2.0에서 연결)
//  장면 그림은 코드로 그리고, 사람·녹스는 게임과 같은 그리기 함수(주인공 = 플레이어의 실제 외형·장비)를 쓴다
// 컷신 장면 시안: 배경 설명 5 · 희생 4 · 구원 4 · 히든 5. 장면 480×270, 게임 그리기 코드(사람·녹스·아우렐리온) 재사용
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos, W = 480, H = 270;
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const poly = (c, f, p, s, lw) => { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const line = (c, col, w, p) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const starP = (x, y, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } return p; };
  const star = (c, x, y, r, f, a = 0.7) => { glow(c, x, y, r * 3, f, a * 0.6); poly(c, f, starP(x, y, r)); };
  const sky = (c, top, bot, n = 60, seed = 1) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < n; i++) { const x = (i * 97 * seed) % W, y = (i * 53 + seed * 7) % (H * 0.75); ell(c, x, y, 0.6 + (i % 3) * 0.4, 0.6 + (i % 3) * 0.4, `rgba(230,234,255,${0.3 + (i % 5) * 0.12})`); } };
  const ground = (c, y, col, edge) => { c.fillStyle = col; c.fillRect(0, y, W, H - y); if (edge) { c.fillStyle = edge; c.fillRect(0, y, W, 2); } };
  const sea = (c, y) => { const g = c.createLinearGradient(0, y, 0, H); g.addColorStop(0, '#1e3a6a'); g.addColorStop(1, '#0c1a34'); c.fillStyle = g; c.fillRect(0, y, W, H - y);
    for (let i = 0; i < 9; i++) line(c, 'rgba(180,210,255,.25)', 1, [[i * 60 - 20, y + 8 + (i % 3) * 10], [i * 60 + 20, y + 8 + (i % 3) * 10]]); };
  // 사람 (게임 그리기 코드)
  const LOOK = {
    hero: { skin: '#ffe0c2', hair: '#6a3a1a', top: '#f2d06a', bottom: '#5a3a8a', style: 'short', hat: '#f0c040', eye: 'big', eyeColor: '#3a2a1a' },
    elma: () => Object.assign({ skin: '#ffe0c2' }, G.NPCS.elma.look),
    kaien: () => Object.assign({ skin: '#f0d0b0' }, G.NPCS.kaien.look),
    folk1: { skin: '#f0d0b0', hair: '#4a3020', top: '#6a8a5a', bottom: '#3a4a3a', style: 'short' },
    folk2: { skin: '#ffe0c2', hair: '#8a5a2a', top: '#b06a4a', bottom: '#5a4030', style: 'long', gender: 'f' },
    echo: () => Object.assign({ skin: '#cfe6ff' }, G.NPCS.astra.look),
  };
  const person = (c, who, x, y, s = 1.4, dir = 1, extra = {}) => {
    if (who === 'hero') { G.Draw.humanoid(c, Object.assign({ x, y, dir, t: 1, atk: -1, scale: s }, G.Cutscene.hero(), extra)); return; }
    const look = typeof LOOK[who] === 'function' ? LOOK[who]() : LOOK[who];
    G.Draw.humanoid(c, Object.assign({ x, y, dir, t: 1, look, atk: -1, scale: s }, extra));
  };
  const ghost = (c, x, y, s = 1, a = 0.55) => { c.save(); c.globalAlpha = a; person(c, 'echo', x, y, s, 1); c.restore(); glow(c, x, y - 30 * s, 24 * s, '#9ad8ff', 0.35); };
  const nox = (c, x, y, s, ph, bg) => { c.save(); c.translate(x, y); c.scale(s, s); G.NoxArt.mix(c, 1.8, ph, bg || '#141432'); c.restore(); };
  const lighthouse = (c, x, y, s, lit) => { c.save(); c.translate(x, y); c.scale(s, s);
    poly(c, '#d8d0c0', [[-10, 0], [10, 0], [6, -60], [-6, -60]], '#6a6050', 1); for (const k of [-15, -35]) poly(c, '#b04a3a', [[-9 + k / -60 * -4, k], [9 - k / -60 * -4, k], [8, k - 8], [-8, k - 8]]);
    poly(c, '#3a3a4a', [[-9, -60], [9, -60], [7, -72], [-7, -72]]); poly(c, '#5a3a2a', [[-10, -72], [10, -72], [0, -82]]);
    if (lit) { glow(c, 0, -66, 50, '#ffe6a0', 0.8); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,236,170,.18)'; poly(c, 'rgba(255,236,170,.16)', [[0, -66], [-160, -110], [-160, -30]]); c.restore(); }
    c.restore(); };
  const lantern = (c, x, y, lit, s = 1) => { c.save(); c.translate(x, y); c.scale(s, s);
    line(c, '#6a6a90', 1.2, [[0, -16], [0, -4]]); ell(c, 0, 10, 9, 12, lit ? 'rgba(255,236,170,.55)' : 'rgba(120,120,200,.15)', lit ? '#ffe9a8' : '#8a86c8', 1.4);
    poly(c, lit ? '#fffaf0' : 'rgba(216,222,248,.18)', starP(0, 10, 4.5)); if (lit) glow(c, 0, 10, 40, '#ffcf6a', 0.8); c.restore(); };
  const shards = (c, cx, cy, r, t = 0, a = 1) => { const C = ['#9ef0c0', '#7de08a', '#d8a860', '#ffd040', '#a8e0ff', '#c0c8ff', '#b080ff'];
    C.forEach((col, i) => { const an = -PI / 2 + i * PI * 2 / 7 + t, x = cx + cos(an) * r, y = cy + sin(an) * r * 0.5; glow(c, x, y, 12, col, 0.6 * a); poly(c, col, [[x, y - 7], [x + 3.5, y], [x, y + 7], [x - 3.5, y]], 'rgba(255,255,255,.7)', 0.8); }); };
  const dragon = (c, x, y, s, col, wingCol) => { c.save(); c.translate(x, y); c.scale(s, s);   // 실루엣 용
    poly(c, wingCol, [[0, -10], [-60, -60], [-40, -20], [-70, -30], [-30, 0]]); poly(c, wingCol, [[10, -10], [70, -64], [50, -22], [78, -30], [36, 2]]);
    ell(c, 5, 0, 30, 12, col); poly(c, col, [[25, -4], [50, -24], [58, -20], [34, 4]]); ell(c, 58, -24, 9, 6, col); line(c, col, 6, [[-22, 2], [-50, 10], [-70, 0]]); c.restore(); };
  const fog = (c, a) => { const g = c.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); };

  G.SCENES = {
    intro: [
      ['별과 밤', '아주 오래전, 하늘에는 별이 있었고, 별들 사이에는 밤이 있었다. 사람들은 별에 이름을 붙였지만, 밤을 바라보는 이는 없었다.', c => {
        sky(c, '#0a0c22', '#1a2448', 0);
        for (const [x, y, r, col] of [[70, 50, 5, '#fff2c0'], [150, 30, 4, '#c8e0ff'], [260, 60, 6, '#ffe0a0'], [360, 35, 4, '#d8f0ff'], [420, 80, 5, '#fff2c0'], [210, 100, 3, '#c8e0ff']]) star(c, x, y, r, col, 0.9);
        // 별들 사이의 밤 (희미한 거대한 형체)
        c.save(); c.globalAlpha = 0.5; const g = c.createRadialGradient(330, 120, 10, 330, 120, 140); g.addColorStop(0, '#05050c'); g.addColorStop(1, 'rgba(5,5,12,0)'); c.fillStyle = g; c.beginPath(); c.arc(330, 120, 140, 0, 7); c.fill(); c.restore();
        ell(c, 322, 112, 2.4, 1.2, 'rgba(216,222,248,.55)'); ell(c, 340, 112, 2.4, 1.2, 'rgba(216,222,248,.55)');
        ground(c, 220, '#14182c', '#2a3050');
        person(c, 'folk1', 60, 220, 1.0, 1); person(c, 'folk2', 92, 220, 1.0, 1); person(c, 'folk1', 124, 220, 1.0, 1);
        line(c, 'rgba(255,240,200,.5)', 1, [[98, 184], [150, 40]]);
      }],
      ['별을 삼키는 밤', '외로워진 밤은 별을 삼키기 시작했다. 별을 품으면 자신도 빛날 거라 믿고. 하지만 삼킨 별빛은 그 안에서 꺼질 뿐이었다.', c => {
        sky(c, '#06060e', '#141430', 30, 2);
        for (let i = 0; i < 9; i++) { const a = i * 0.7, r = 90 + i * 12, x = 240 + cos(a) * r, y = 130 + sin(a) * r * 0.5; line(c, 'rgba(255,240,200,.35)', 1.2, [[x, y], [x + (240 - x) * 0.25, y + (120 - y) * 0.25]]); star(c, x, y, 3, '#fff2c0', 0.6); }
        nox(c, 240, 260, 0.95, 2);
        fog(c, 0.5);
      }],
      ['일곱 영웅과 두 용', '일곱 영웅과 두 용은 일곱 별조각으로 그를 봉인했다. 그의 가슴에 남아 있던 작은 빛 하나마저 떼어 내어.', c => {
        sky(c, '#0e1030', '#1c2050', 40, 3);
        dragon(c, 90, 70, 0.9, '#bfe6ff', 'rgba(150,200,240,.8)'); dragon(c, 390, 60, 0.9, '#ece9ff', 'rgba(220,210,255,.8)');
        ground(c, 228, '#141830', '#2a3050');
        nox(c, 240, 228, 0.55, 0);
        shards(c, 240, 140, 70, 0.3);
        [50, 100, 150, 196, 290, 340, 390, 440].slice(0, 3).concat([290, 340, 390, 440]).forEach(x => ghost(c, x, 228, 0.9, 0.7));
      }],
      ['여덟 번째 별', '그러나 봉인은 완전하지 않았다. 영웅들은 마지막 열쇠를 남겼다. 사람의 모습을 한 별, 여덟 번째 별을.', c => {
        sky(c, '#0a1030', '#22305a', 70, 4);
        sea(c, 200);
        for (let i = 0; i < 7; i++) ghost(c, 120 + i * 40, 195 - Math.abs(i - 3) * 6, 0.7, 0.25);
        // 떨어지는 별
        line(c, 'rgba(255,240,200,.45)', 3, [[330, 30], [260, 150]]); star(c, 255, 160, 9, '#fff6c8', 1);
      }],
      ['500년 뒤, 바닷가', '그리고 오백 년 뒤 — 새싹항의 바닷가에, 기억을 잃은 표류자가 떠밀려 왔다. 손등에 별의 문양을 새긴 채.', c => {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7ab8e8'); g.addColorStop(0.6, '#f0d8b0'); g.addColorStop(1, '#f0d8b0'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        ell(c, 400, 60, 26, 26, '#fff4d0'); glow(c, 400, 60, 60, '#fff0c0', 0.6);
        c.fillStyle = '#3a7ab8'; c.fillRect(0, 150, W, 40); for (let i = 0; i < 8; i++) line(c, 'rgba(255,255,255,.6)', 1.5, [[i * 64, 186], [i * 64 + 30, 186]]);
        lighthouse(c, 430, 150, 0.9, false);
        c.fillStyle = '#ead2a2'; c.fillRect(0, 188, W, 82);
        // 누워 있는 표류자
        c.save(); c.translate(200, 236); c.rotate(-PI / 2); person(c, 'hero', 0, 0, 1.3, 1); c.restore();
        star(c, 176, 226, 3.5, '#ffe9a0', 1);
        person(c, 'folk2', 300, 236, 1.1, -1);
      }],
    ],
    seal: [
      ['봉인의 마지막 고리', '당신은 일곱 별조각을 품에 안고 공허의 문 앞에 섰다. 별빛이 몸을 감싸며, 손끝부터 천천히 흩어지기 시작했다.', c => {
        sky(c, '#0a0818', '#1a1430', 30, 5); ground(c, 225, '#100c1c', '#2a2040');
        person(c, 'hero', 240, 225, 1.6, 1, { alpha: 0.75 }); shards(c, 240, 160, 60, 0.4);
        for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 20 + (i * 7 % 60); ell(c, 240 + cos(a) * r, 170 + sin(a) * r * 0.8 - 20, 1.6, 1.6, '#fff2c0'); }
        glow(c, 240, 170, 90, '#ffe9a0', 0.5);
      }],
      ['다시 잠든 밤', '공허는 다시 사슬에 감겼다. 녹스의 등불은 끝내 켜지지 못한 채, 오래고 깊은 잠에 들었다.', c => {
        sky(c, '#05050c', '#0e0e22', 20, 6); ground(c, 228, '#0a0a16', '#1c1c34');
        nox(c, 240, 228, 0.9, 0);
        fog(c, 0.6);
      }],
      ['남겨진 사람들', '엘마는 울며 당신의 이름을 불렀고, 카이엔은 끝내 고개를 돌리지 못했다.', c => {
        sky(c, '#1a1a3a', '#3a3050', 30, 7); ground(c, 220, '#1e2034', '#34385a');
        person(c, 'elma', 210, 220, 1.6, 1); person(c, 'kaien', 290, 220, 1.6, -1);
        for (const [x, y] of [[214, 166], [210, 176]]) ell(c, x, y, 1.6, 2.6, 'rgba(180,220,255,.9)');
      }],
      ['계승자의 별', '그날 이후, 아르셀리아의 밤하늘에는 전에 없던 별 하나가 떴다. 사람들은 그 별을 "계승자의 별"이라 불렀다.', c => {
        sky(c, '#060a20', '#1a2244', 80, 8);
        star(c, 260, 70, 11, '#fff6c8', 1.1);
        ground(c, 230, '#0c1020', '#20284a');
        c.save(); c.globalAlpha = 0.9; person(c, 'elma', 200, 230, 1.0, 1); person(c, 'kaien', 232, 230, 1.0, 1); c.restore();
      }],
    ],
    purify: [
      ['내민 손', '당신은 무너진 녹스에게 손을 내밀었다. 공허는 증오가 아니었다. 별빛이 닿지 않던 곳에 쌓인, 오래된 외로움이었다.', c => {
        sky(c, '#0a0a1c', '#1a1a3a', 30, 9); ground(c, 228, '#0e0e1e', '#24244a');
        c.save(); c.translate(170, 228); c.scale(0.85, 0.85); G.NoxArt.lit(c, 1.6, 0.2, '#141432', 140); c.restore();
        person(c, 'hero', 330, 228, 1.6, -1); glow(c, 330, 190, 50, '#ffe9a0', 0.5);
      }],
      ['처음으로 켜진 등불', '"…따뜻하구나. 이것이… 별빛인가." 등불이 처음으로 켜지고, 녹스의 형체가 천천히 빛으로 녹아내렸다.', c => {
        sky(c, '#141428', '#2a2440', 30, 10); ground(c, 228, '#141420', '#2a2a44');
        c.save(); c.translate(220, 228); c.scale(0.85, 0.85); G.NoxArt.lit(c, 1.6, 1, '#1a1a36', 140); c.restore();
        for (let i = 0; i < 24; i++) { const x = 160 + (i * 37 % 120), y = 60 + (i * 53 % 140); ell(c, x, y, 1.6, 1.6, '#ffe9a8'); }
        glow(c, 220, 130, 120, '#ffcf6a', 0.25);
      }],
      ['새로운 별들', '공허의 문은 닫히지 않았다. 대신 그곳에서, 처음 보는 작은 별들이 태어나기 시작했다.', c => {
        sky(c, '#0c0a24', '#24183c', 30, 11);
        c.save(); c.translate(240, 150); for (let k = 0; k < 4; k++) { c.strokeStyle = `rgba(200,180,255,${0.35 - k * 0.07})`; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 50 + k * 22, 70 + k * 26, 0, 0, 7); c.stroke(); } c.restore();
        ell(c, 240, 150, 46, 66, '#05050e');
        for (let i = 0; i < 14; i++) { const a = i * 0.9, r = 20 + i * 9; star(c, 240 + cos(a) * r, 150 + sin(a) * r * 0.8 - i * 3, 2 + (i % 3), i % 2 ? '#fff2c0' : '#d8e8ff', 0.8); }
        lantern(c, 240, 140, true, 1.3);
      }],
      ['다시, 하늘을', '엘마는 웃었고, 카이엔은 처음으로 하늘을 올려다보았다. 당신의 모험은 끝나지 않았다. 새로운 별들의 세계가 기다리고 있으니까.', c => {
        sky(c, '#1a2a5a', '#e0a878', 60, 12);
        for (const [x, y] of [[120, 50], [200, 30], [300, 60], [380, 40], [250, 90]]) star(c, x, y, 3, '#fff2c0', 0.8);
        ground(c, 222, '#2a3a4a', '#4a5a70');
        person(c, 'elma', 190, 222, 1.5, 1); person(c, 'hero', 240, 222, 1.5, 1); person(c, 'kaien', 290, 222, 1.5, -1);
      }],
    ],
    hidden: [
      ['공명', '당신은 별빛을 혼자 바치지 않았다. 영웅의 피를 이은 엘마, 교단에서 돌아온 카이엔, 그리고 일곱 영웅의 잔영과 함께 나누었다.', c => {
        sky(c, '#0c0a24', '#1e1a40', 40, 13); ground(c, 228, '#100e20', '#2a2648');
        const pts = [[240, 228, 'hero'], [180, 228, 'elma'], [300, 228, 'kaien']];
        for (let i = 0; i < 7; i++) { const a = PI + 0.25 + i * (PI - 0.5) / 6; ghost(c, 240 + cos(a) * 180, 228, 0.85, 0.6); line(c, 'rgba(180,220,255,.35)', 1.2, [[240 + cos(a) * 180, 190], [240, 110]]); }
        for (const [x, y, w] of pts) { person(c, w, x, y, 1.4, 1); line(c, 'rgba(255,233,168,.6)', 2, [[x, y - 40], [240, 110]]); }
        star(c, 240, 110, 10, '#fff6c8', 1.2);
      }],
      ['처음으로, 별이 되다', '녹스는 오백 년의 외로움에서 풀려나, 처음으로 별이 되었다. 아무도 사라지지 않았다.', c => {
        sky(c, '#100c28', '#2a2048', 40, 14); ground(c, 232, '#141026', '#2c2650');
        c.save(); c.globalAlpha = 0.45; nox(c, 240, 232, 0.7, 1); c.restore();
        glow(c, 240, 120, 110, '#ffe9a8', 0.6); star(c, 240, 110, 16, '#fffaf0', 1.3);
        for (let i = 0; i < 30; i++) { const x = 200 + (i * 29 % 80), y = 130 + (i * 41 % 100); ell(c, x, y, 1.3, 1.3, '#ffe9a8'); }
      }],
      ['잠드는 영웅들', '일곱 영웅의 잔영은 그제야 고개를 숙이고, 편히 잠들었다. "고맙다, 여덟 번째 별이여."', c => {
        sky(c, '#141a3a', '#2a3460', 40, 15); ground(c, 226, '#18203a', '#2e3a64');
        for (let i = 0; i < 7; i++) { const x = 70 + i * 57; ghost(c, x, 226, 1.0, 0.45 - Math.abs(i - 3) * 0.04); for (let k = 0; k < 4; k++) ell(c, x + sin(i + k) * 8, 150 - k * 22, 1.5, 1.5, 'rgba(200,230,255,.6)'); }
      }],
      ['등대와 등불', '바닷가의 등대에 불이 켜지고, 그 곁 밤하늘에는 녹스의 등불이 나란히 빛났다. 어둠 속에서 길을 잃지 않도록.', c => {
        sky(c, '#0c1430', '#24305a', 60, 16); sea(c, 200);
        lighthouse(c, 150, 200, 1.4, true);
        lantern(c, 330, 90, true, 1.6); star(c, 380, 60, 4, '#fff6c8', 0.9);
      }],
      ['새싹항 바닷가', '모든 것이 시작된 새싹항의 바닷가에서, 셋은 새로 태어난 별을 올려다보았다.', c => {
        sky(c, '#0e1a40', '#3a3a6a', 80, 17);
        star(c, 260, 60, 10, '#fff6c8', 1.1); for (const [x, y] of [[220, 40], [300, 50], [240, 90]]) star(c, x, y, 2.5, '#d8e8ff', 0.7);
        c.fillStyle = '#1e3a6a'; c.fillRect(0, 175, W, 30);
        lighthouse(c, 430, 176, 0.9, true);
        c.fillStyle = '#c8b088'; c.fillRect(0, 204, W, 66);
        person(c, 'elma', 200, 236, 1.4, 1); person(c, 'hero', 240, 236, 1.4, 1); person(c, 'kaien', 280, 236, 1.4, 1);
      }],
    ],
  };
})();

// ======================= 재생기 =======================
//  G.Cutscene.play(kind, done, opt)  kind: intro | seal | purify | hidden
//  장면마다 천천히 확대 + 별 반짝임 + 페이드, 화면 아래 멘트. 아무 키·클릭 = 다음 장면, Esc = 건너뛰기
G.Cutscene = {
  MUSIC: { intro: 'title', seal: 'end_seal', purify: 'end_purify', hidden: 'end_purify' },
  DUR: 7.5, FADE: 0.9,
  heroOpt: null,
  hero() { return this.heroOpt || (G.Game.player ? G.Game.player.look() : { look: G.LOOKS.toDraw(G.LOOKS.normalize({})) }); },
  playing() { return !!this.cur; },
  play(kind, done, opt = {}) {
    const list = G.SCENES[kind];
    if (!list) { if (done) done(); return; }
    this.stop();
    this.heroOpt = opt.look ? { look: G.LOOKS.toDraw(G.LOOKS.normalize(opt.look)) } : null;
    if (this.MUSIC[kind]) G.Music.play(this.MUSIC[kind], 1.5);
    G.UI.overlay(`<div class="overlay cutscene"><canvas id="cutCv" width="1280" height="720"></canvas>
      <div class="cut-cap" id="cutCap"></div><div class="cut-hint">아무 키: 다음 · Esc: 건너뛰기</div></div>`);
    const cv = document.getElementById('cutCv');
    this.cur = { kind, list, i: 0, t: 0, done, cv, ctx: cv.getContext('2d'), last: performance.now(), out: false };
    this.onKey = e => { if (!this.cur) return; e.preventDefault(); e.stopPropagation(); if (e.key === 'Escape') this.finish(); else this.next(); };
    this.onClick = () => this.next();
    window.addEventListener('keydown', this.onKey, true);
    cv.addEventListener('mousedown', this.onClick);
    this.showCap();
    const loop = now => { if (!this.cur) return; this.frame(now); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  },
  showCap() {
    const c = this.cur, el = document.getElementById('cutCap'); if (!el) return;
    const [title, text] = c.list[c.i];
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    el.innerHTML = `<b>${G.U.esc(title)}</b>${G.U.esc(text)}`;
  },
  next() {
    const c = this.cur; if (!c || c.out) return;
    if (c.t < 0.6) return;   // 실수로 두 번 눌러 건너뛰지 않게
    c.out = true; c.outT = 0;
  },
  frame(now) {
    const c = this.cur, dt = Math.min(0.05, (now - c.last) / 1000); c.last = now;
    c.t += dt;
    if (!c.out && c.t >= this.DUR) { c.out = true; c.outT = 0; }
    if (c.out) { c.outT += dt; if (c.outT >= this.FADE * 0.7) { c.i++; if (c.i >= c.list.length) { this.finish(); return; } c.t = 0; c.out = false; this.showCap(); } }
    const x = c.ctx, k = Math.min(1, c.t / this.DUR);
    x.save(); x.fillStyle = '#000'; x.fillRect(0, 0, 1280, 720);
    // 천천히 확대 (가운데 기준)
    const z = 1280 / 480 * (1 + k * 0.05);
    x.translate(640, 360); x.scale(z, z); x.translate(-240, -135);
    c.list[c.i][2](x);
    x.restore();
    // 별 반짝임
    x.save(); x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) { const a = 0.5 + 0.5 * Math.sin(c.t * 2.2 + i * 1.7); if (a < 0.75) continue; const sx = (i * 263 + c.i * 97) % 1280, sy = (i * 151 + c.i * 41) % 380;
      x.fillStyle = `rgba(255,248,220,${(a - 0.75) * 2.4})`; x.beginPath(); x.arc(sx, sy, 1.8, 0, 7); x.fill(); }
    x.restore();
    // 페이드
    let f = c.t < this.FADE ? 1 - c.t / this.FADE : 0;
    if (c.out) f = Math.min(1, c.outT / (this.FADE * 0.7));
    if (f > 0) { x.fillStyle = `rgba(0,0,0,${f})`; x.fillRect(0, 0, 1280, 720); }
  },
  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.onKey) window.removeEventListener('keydown', this.onKey, true);
    this.cur = null; this.raf = 0;
  },
  finish() {
    const c = this.cur; if (!c) return;
    this.stop(); G.UI.overlay('');
    if (c.done) c.done();
  },
};
