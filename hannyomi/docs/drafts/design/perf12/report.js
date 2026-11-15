// 시안 그림: 측정 결과(전/후) + 고치는 방법 + 모습 비교
const { chromium } = require('playwright'); const fs = require('fs');
const L = s => s.split('\n').filter(x => x.trim().startsWith('{')).map(x => JSON.parse(x));
const old = {}, fix = {}; for (const f of fs.readdirSync('.')) { const m = /^([AB])_.*\.txt$/.exec(f); if (!m) continue; for (const r of L(fs.readFileSync(f, 'utf8'))) (m[1] === 'A' ? old : fix)[r.job] = r.out; }
const P = JSON.parse(fs.readFileSync('probe3.json', 'utf8'));
const JN = { warrior_4a: '천붕검제', warrior_4b: '불멸', archer_4a: '천궁', archer_4b: '저격왕', mage_4a: '화염군주', mage_4b: '천둥의 현자', thief_4a: '야천', thief_4b: '검무' };
const rows = []; for (const j of Object.keys(JN)) { if (!old[j] || !fix[j]) continue; const fm = Object.fromEntries(fix[j]); for (const [nm, o] of old[j]) { if (nm === '없음') continue; const n = fm[nm]; if (!n) continue; rows.push({ job: JN[j], nm, oa: o.ms, om: o.mx, na: n.ms, nm2: n.mx }); } }
rows.sort((a, b) => b.oa - a.oa); const top = rows.slice(0, 18);
const mxv = Math.max(...top.map(r => r.oa));
const bar = (v, c) => `<div class="b" style="width:${Math.max(2, v / mxv * 100)}%;background:${c}"></div>`;
const img = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;font-family:sans-serif;background:#f4f6fb;color:#1a2040;width:1200px}h1{font-size:26px;margin:18px 24px 6px}h2{font-size:19px;margin:22px 24px 8px}.n{margin:0 24px;font-size:14px;color:#4a5070}
table{margin:6px 24px;border-collapse:collapse;width:1150px;font-size:13.5px}td,th{padding:4px 6px;border-bottom:1px solid #dde2ee;text-align:left}th{background:#e6eaf4}.bw{width:420px}.b{height:9px;border-radius:4px;margin:1px 0}
.card{display:inline-block;vertical-align:top;width:360px;margin:6px 6px 6px 24px;background:#fff;border-radius:12px;padding:10px 14px;box-shadow:0 1px 4px rgba(0,0,0,.08);font-size:13.5px;line-height:1.5}.card b{font-size:15px}
.big{font-size:22px;font-weight:bold}.g{color:#1a8a4a}.r{color:#c03040}img{border-radius:8px}</style>
<h1>스킬 렉 줄이기 시안 (빌드 11)</h1><div class="n">측정: 아이폰 13 가로 화면 크기 · 8직업 3·4차·궁극기 공격 스킬 · 스킬을 쓰고 1초(60장면) · 같은 컴퓨터에서 지금 판과 고친 판을 번갈아 (컴퓨터 브라우저라 숫자 크기는 실제 아이폰과 다르고, <b>전후 차이</b>를 봄)</div>
<h2>① 찾은 원인: 몬스터가 맞을 때 · 쓰러질 때</h2>
<div class="card"><b>맞아서 하얗게 번쩍일 때</b><br>몬스터 그리기 시간 (14마리)<br><span class="big r">${P.old.hit.monDraw}ms</span> → <span class="big g">${P.new.hit.monDraw}ms</span></div>
<div class="card"><b>한꺼번에 쓰러질 때</b><br>몬스터 그리기 시간 (14마리)<br><span class="big r">${P.old.dying.monDraw}ms</span> → <span class="big g">${P.new.dying.monDraw}ms</span></div>
<div class="card"><b>평소 (참고)</b><br>몬스터 그리기 시간 (14마리)<br><span class="big">${P.old.normal.monDraw}ms</span> → <span class="big">${P.new.normal.monDraw}ms</span></div>
<div class="n" style="margin-top:6px">맞을 때 번쩍 · 얼음 · 열기 색 필터를 몬스터의 선 · 도형 하나하나에 걸고 있었음 (사람 모양 몬스터는 수백 번) → <b>몬스터 한 장에 한 번만</b>. 쓰러지는 몬스터는 다듬기 필터를 매 장면 새로 만들던 것 → 1/30초마다. 큰 스킬일수록 맞고 쓰러지는 몬스터가 많아 렉이 컸음</div>
<h2>② 스킬별 한 장면 그리는 시간 (스킬 쓰고 1초 평균 · 전 → 후, 무거운 순)</h2>
<table><tr><th>직업</th><th>스킬</th><th>평균 (ms)</th><th>가장 긴 멈춤 (ms)</th><th class="bw">평균 — 빨강 = 지금 · 초록 = 고친 뒤</th></tr>
${top.map(r => `<tr><td>${r.job}</td><td>${r.nm}</td><td>${r.oa} → <b>${r.na}</b></td><td>${r.om} → <b>${r.nm2}</b></td><td class="bw">${bar(r.oa, '#e0606a')}${bar(r.na, '#3aa86a')}</td></tr>`).join('')}</table>
<div class="n" style="margin-top:6px">고친 뒤에도 무거운 스킬(천궁 폭풍우 · 천상의 심판 · 성역 · 멸천 낙화 · 대화재 · 화염 고리)은 몬스터가 아니라 효과 자체가 무거움 → ③의 3 · 4 로 줄임. 숫자는 매번 ±5ms 정도 흔들림</div>
<h2>③ 고치는 5가지</h2>
<div class="card"><b>1. 몬스터 색 필터 한 번만 ✔ (위 측정에 반영)</b><br>맞을 때 번쩍 · 얼음 · 열기 · 기술 예고 번쩍 · 그림자 분신(도적 버프)을 한 장에 그린 뒤 한 번만 필터. 모습은 같음</div>
<div class="card"><b>2. 쓰러지는 몬스터 ✔ (위 측정에 반영)</b><br>다듬기 그림을 매 장면 → 1/30초마다 새로 만듦</div>
<div class="card"><b>3. 자동 품질 조절</b><br>화면이 느려지는 순간만 불 · 연기 · 빛 입자를 절반으로 (보통 · 낮춤 모습은 아래 ④). 빠른 기기는 그대로</div>
<div class="card"><b>4. 처음 쓸 때 멈칫 없애기</b><br>맵에 들어갈 때 스킬 그림 재료(빛 스프라이트 · 구름 · 해)를 미리 만들어 둠</div>
<div class="card"><b>5. 큰 스킬 효과 중 장비 효과 쉬기</b><br>큰 스킬 효과가 떠 있는 동안(1~2초)만 장비 빛 · 결을 빼고 그림. 효과가 끝나면 다시 켜짐</div>
<h2>④ 자동 품질: 보통(위) / 낮춤(아래) — 화염군주 대화재 · 태양 낙하</h2>
<div style="margin:0 24px"><img src="${img('cmp_m4a_blaze.png')}" width="560"> <img src="${img('cmp_m4a_final.png')}" width="560"></div>
<h2>⑤ 고친 뒤 모습 비교: 지금(왼쪽) / 고친 뒤(오른쪽) — 천붕멸겁 · 칠흑의 밤 · 절대 영도</h2>
<div style="margin:0 24px 24px"><img src="${img('look_cmp.png')}" width="1140"></div>`;
fs.writeFileSync('report.html', html);
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 800 } }); await pg.goto('file://' + __dirname + '/report.html'); await pg.screenshot({ path: 'report.png', fullPage: true }); await b.close(); })();
