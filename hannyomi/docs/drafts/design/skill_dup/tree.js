const { chromium } = require('playwright');
const ATK = (n, s) => ({ n, s, k: 'a' }), BUF = (n) => ({ n, k: 'b' }), PAS = (n) => ({ n, k: 'p' });
// s: 'new' 새 모습 확정 · 'keep' 그대로 · 'sky' 구름 등 일부만 · undefined 연출 없음(버프 · 패시브)
const T = { root: ['마법사 (1차)', [ATK('마나 탄', 'keep'), ATK('마나 폭발', 'keep'), BUF('별빛 도약'), BUF('별의 장막'), PAS('마나 순환')]],
  a: [['화염술사 (2차)', [ATK('화염구', 'new'), ATK('화염 폭발', 'new'), ATK('유성 낙하', 'new'), BUF('화염 장막'), PAS('화염 숙련'), PAS('마력 증폭')]],
      ['업화술사 (3차)', [ATK('업화', 'new'), ATK('화염 기둥', 'new'), ATK('화염 수레바퀴 (← 불꽃 폭풍)', 'new'), ATK('화염 고리', 'new'), BUF('업화의 축복'), PAS('업화의 심장')]],
      ['화염군주 (4차)', [ATK('화염군주의 창', 'new'), ATK('대화재', 'new'), ATK('태양 낙하 (궁극기)', 'new'), BUF('화염군주의 각성 · 따라다니는 불씨'), PAS('불멸의 불꽃')]]],
  b: [['빙뢰술사 (2차)', [ATK('냉기 광선', 'keep'), ATK('얼음 파편', 'keep'), ATK('연쇄 번개', 'keep'), BUF('서리 갑옷'), PAS('빙뢰 숙련'), PAS('정신 집중')]],
      ['폭풍술사 (3차)', [ATK('썬더 스톰', 'new'), ATK('낙뢰', 'new'), ATK('빙결 폭발', 'keep'), ATK('얼음 창', 'keep'), BUF('폭풍의 가호'), PAS('폭풍의 눈')]],
      ['천둥의 현자 (4차)', [ATK('천둥의 심판', 'new'), ATK('절대 영도', 'keep'), ATK('천둥 신의 분노 (궁극기)', 'new'), BUF('현자의 각성 · 번개 고리 구름'), PAS('현자의 지혜')]]] };
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
  const chip = (s) => { const C = { a: ['#fff', '#1a2040'], b: ['#eef3ff', '#3a4a7a'], p: ['#f2f2f2', '#666'] }[s.k], tag = s.k !== 'a' ? '' : s.s === 'new' ? '<b style="background:#2e9a5a;color:#fff;padding:1px 6px;border-radius:6px;font-size:11px;margin-left:6px">새 모습 확정</b>' : '<b style="background:#d48a1a;color:#fff;padding:1px 6px;border-radius:6px;font-size:11px;margin-left:6px">그대로 (다시 볼 대상)</b>';
    return `<div style="background:${C[0]};color:${C[1]};border:1px solid #ccd;border-radius:7px;padding:4px 8px;margin:3px 0;font-size:13px">${s.k === 'a' ? '⚔ ' : s.k === 'b' ? '✦ ' : '· '}${s.n}${tag}</div>`; };
  const box = (t, list, col) => `<div style="width:300px;background:#fff;border:3px solid ${col};border-radius:14px;padding:10px 12px;box-shadow:0 2px 6px rgba(0,0,0,.12)"><div style="font:bold 18px sans-serif;color:${col};margin-bottom:6px">${t}</div>${list.map(chip).join('')}</div>`;
  const arrow = '<div style="font:bold 30px sans-serif;color:#8a94b8;align-self:center;margin:0 6px">→</div>';
  const row = (L, col, lab) => `<div style="display:flex;align-items:flex-start;gap:4px;margin:14px 0"><div style="width:70px;font:bold 16px sans-serif;color:${col};align-self:center">${lab}</div>${L.map(([t, l]) => box(t, l, col)).join(arrow)}</div>`;
  await pg.setContent(`<body style="margin:0;background:#e9ecf8;font-family:sans-serif"><div id=s style="padding:18px;width:1440px">
    <div style="font:bold 24px sans-serif;color:#1a2040">마법사 각성 흐름 · 스킬 (2차 → 3차 → 4차)</div>
    <div style="font:14px sans-serif;color:#445;margin:6px 0 10px">⚔ 공격 스킬 · ✦ 버프 · · 패시브 &nbsp;|&nbsp; <b style="color:#2e9a5a">새 모습 확정</b> = 이번 시안으로 바꾸기로 한 것 &nbsp; <b style="color:#d48a1a">그대로</b> = 아직 지금 모습 (현실적으로 다시 볼 대상)</div>
    <div style="display:flex;align-items:center;gap:10px">${box(...T.root, '#3f7fd9')}<div style="font:bold 15px sans-serif;color:#556">→ 2차에서 둘 중 하나 선택</div></div>
    ${row(T.a, '#d8501a', 'A 불')}${row(T.b, '#2a6ad0', 'B 얼음·번개')}</div></body>`);
  await pg.locator('#s').screenshot({ path: 'mage_tree.png' }); await b.close(); })();
