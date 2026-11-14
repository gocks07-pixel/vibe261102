// node iconsheet.js out title "id|설명|장면번호" ... — 스킬 아이콘(게임 그림) + 실제 장면 한 컷
const { chromium } = require('playwright'); const fs = require('fs');
const [out, title, ...rows] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1400, height: 400 }, deviceScaleFactor: 2 });
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(2000);
  const R = rows.map(r => r.split('|')); const shots = R.map(([id, , k]) => 'data:image/png;base64,' + fs.readFileSync(`ss_${id}_${k}.png`).toString('base64'));
  const H = await pg.evaluate(([R, shots, title]) => { const S = G.SKILLS; let h = `<div id=sheet style="width:1380px;padding:14px;background:#e9ecf8;font-family:sans-serif;color:#1a2040"><div style="font:bold 22px sans-serif;margin-bottom:10px">${title}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">`;
    R.forEach(([id, desc], i) => { const sk = S[id]; h += `<div style="display:flex;gap:12px;align-items:center;background:#fff;border-radius:10px;padding:8px"><img src="${G.Icons.skill(sk)}" style="width:72px;height:72px;flex:none"><div style="flex:1;min-width:0"><div style="font:bold 17px sans-serif">${sk.name} <span style="font:13px sans-serif;color:#667">${id}</span></div><div style="font:13px sans-serif;margin-top:4px">${desc}</div></div><div style="width:320px;height:100px;flex:none;background:url(${shots[i]}) -32px -123px/413px auto no-repeat;border-radius:6px"></div></div>`; });
    h += '</div></div>'; document.body.innerHTML = h; document.body.style.margin = 0; return document.getElementById('sheet').offsetHeight; }, [R, shots, title]);
  await pg.setViewportSize({ width: 1410, height: H + 4 }); await pg.locator('#sheet').screenshot({ path: out }); await b.close(); })();
