const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1100,height:900},deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
await pg.addScriptTag({content:fs.readFileSync('nox_opt3.js','utf8')});
const BASE={1:1,2:1,4:1,nc:1};
// A: 페이즈
await pg.evaluate(([BASE])=>{const rows=[['지금',{}],['지난 가',Object.assign({crack:'a'},BASE)],['이번: 가 + 별빛이 새어 나감',Object.assign({crack:'ab'},BASE)]];
 const rowH=360,W=1100,H=rows.length*rowH+56;document.body.innerHTML='';document.body.style.cssText='margin:0;background:#0d1124';const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);
 ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffd36a';ctx.font='bold 18px sans-serif';['1페이즈 (체념)','2페이즈 (서러움)','3페이즈 (절망)'].forEach((s,i)=>ctx.fillText(s,230+i*290,34));
 rows.forEach(([name,opt],r)=>{const y0=48+r*rowH;ctx.fillStyle=r?'#161c36':'#1c1a2c';ctx.fillRect(10,y0,W-20,rowH-8);ctx.fillStyle='#e9ecf8';ctx.font='bold 14px sans-serif';ctx.fillText(name,22,y0+22);window.NOXOPT=opt;
  for(let ph=0;ph<3;ph++){const cx=250+ph*290,cy=y0+rowH-22;ctx.save();ctx.beginPath();ctx.rect(cx-145,y0,290,rowH-8);ctx.clip();ctx.translate(cx,cy);ctx.scale(0.92,0.92);G.NoxArtO.mix(ctx,1.35,ph,'#161c36');ctx.restore();}});window.NOXOPT={};},[BASE]);
await pg.waitForTimeout(200);let h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:1100,height:Math.ceil(h)});await pg.screenshot({path:'nox_opt3_a.png'});
// B: 쓰러질 때 빛이 채워지는 장면
await pg.setViewportSize({width:1300,height:900});
await pg.evaluate(([BASE])=>{const ks=[0.08,0.3,0.5,0.62,0.76,1];const rows=[['지금',null],['지난 가',Object.assign({crack:'a'},BASE)],['이번: 금이 채워져 하나의 별로',Object.assign({crack:'ab'},BASE)]];
 const rowH=330,W=1300,H=rows.length*rowH+56;document.body.innerHTML='';const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);
 ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffd36a';ctx.font='bold 16px sans-serif';['빛이 닿음','금이 금빛으로 참','금이 모임','하나의 별','두 구체','등불까지'].forEach((s,i)=>ctx.fillText(s,120+i*210,34));
 rows.forEach(([name,opt],r)=>{const y0=48+r*rowH;ctx.fillStyle=r?'#161c36':'#1c1a2c';ctx.fillRect(10,y0,W-20,rowH-8);ctx.fillStyle='#e9ecf8';ctx.font='bold 14px sans-serif';ctx.fillText(name,22,y0+22);window.NOXOPT=opt||{};
  ks.forEach((k,i)=>{const cx=150+i*210,cy=y0+rowH-24;ctx.save();ctx.beginPath();ctx.rect(cx-105,y0,210,rowH-8);ctx.clip();ctx.translate(cx,cy);ctx.scale(0.75,0.75);
   const hx=-110;ctx.save();ctx.translate(hx,0);G.Draw.humanoid(ctx,{x:0,y:0,dir:1,t:1,look:G.LOOKS.toDraw(G.LOOKS.def('f')),scale:1});ctx.restore();
   if(opt)G.NoxArtO.lit2(ctx,1.3+i*0.37,k,'#161c36',hx);else G.NoxArt.lit(ctx,1.3+i*0.37,k,'#161c36',hx);ctx.restore();});});window.NOXOPT={};},[BASE]);
await pg.waitForTimeout(200);h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:1300,height:Math.ceil(h)});await pg.screenshot({path:'nox_opt3_b.png'});
console.log(errs.slice(0,3));await b.close();})();
