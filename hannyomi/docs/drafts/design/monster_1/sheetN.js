// 녹스 변경 시안 1~7 (+ 추천 조합): 페이즈 1 · 2 · 3
const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1100,height:900},deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
await pg.addScriptTag({content:fs.readFileSync('nox_opt.js','utf8')});
const ROWS=[['지금',{}],['1. 밤하늘 망토',{1:1}],['2. 페이즈 변화 크게',{2:1}],['3. 일식 · 그림자 날개',{3:1}],['4. 별빛 눈물',{4:1}],['5. 두 손으로 등불',{5:1}],['6. 부서진 별 왕관',{6:1}],['7. 망토 · 몸 자연스럽게',{7:1}],['추천 1 + 2 + 4',{1:1,2:1,4:1}]];
const parts=[['nox_opt_a',ROWS.slice(0,5)],['nox_opt_b',[ROWS[0]].concat(ROWS.slice(5))]];
for(const [part,rows] of parts){
await pg.setViewportSize({width:1100,height:900});
await pg.evaluate((rows)=>{
 const rowH=360,W=1100,H=rows.length*rowH+56;document.body.innerHTML='';document.body.style.cssText='margin:0;background:#0d1124';
 const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);
 ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffd36a';ctx.font='bold 18px sans-serif';
 ['1페이즈 (체념)','2페이즈 (서러움)','3페이즈 (절망)'].forEach((s,i)=>ctx.fillText(s,230+i*290,34));
 rows.forEach(([name,opt],r)=>{const y0=48+r*rowH;ctx.fillStyle=r?'#161c36':'#1c1a2c';ctx.fillRect(10,y0,W-20,rowH-8);ctx.fillStyle='#e9ecf8';ctx.font='bold 14px sans-serif';ctx.fillText(name,22,y0+22);
  window.NOXOPT=opt;
  for(let ph=0;ph<3;ph++){const cx=250+ph*290,cy=y0+rowH-22;ctx.save();ctx.beginPath();ctx.rect(cx-145,y0,290,rowH-8);ctx.clip();ctx.translate(cx,cy);ctx.scale(0.92,0.92);G.NoxArtO.mix(ctx,1.35,ph,'#161c36');ctx.restore();}
 });window.NOXOPT={};
},rows);
await pg.waitForTimeout(300);const h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:1100,height:Math.ceil(h)});
await pg.screenshot({path:part+'.png'});}
console.log(errs.slice(0,3));await b.close();})();
