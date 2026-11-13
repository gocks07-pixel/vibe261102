// 보스: 빌드 8 (지금 시험판) | 이음새 없이 · 녹스: 지금 | 확정 3차 | 3차 + 이음새 없이 + 윗도리·망토 이음
const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:900},deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
for(const f of ['refineS.js','nox_opt3.js'])await pg.addScriptTag({content:fs.readFileSync(f,'utf8')});
const parts=[['b9_1',['shellock','bark','morwen']],['b9_2',['grounder','parakan','kaien_boss']],['b9_3',['aurelion','eldrick']]];
for(const [part,list] of parts){await pg.setViewportSize({width:900,height:900});
await pg.evaluate((list)=>{const rowH=390,W=900,H=list.length*rowH+56;document.body.innerHTML='';document.body.style.cssText='margin:0;background:#0d1124';const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);
 ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffd36a';ctx.font='bold 17px sans-serif';ctx.fillText('빌드 8 (지금 시험판)',130,34);ctx.fillText('이음새 없이',600,34);
 list.forEach((id,r)=>{const y0=48+r*rowH;ctx.fillStyle='#161c36';ctx.fillRect(10,y0,W-20,rowH-8);ctx.fillStyle='#e9ecf8';ctx.font='bold 13px sans-serif';ctx.fillText(G.MONSTERS[id].name,22,y0+18);ctx.strokeStyle='#2c355c';ctx.beginPath();ctx.moveTo(450,y0);ctx.lineTo(450,y0+rowH-8);ctx.stroke();
  const d=G.MONSTERS[id];for(let col=0;col<2;col++){const m={id,d,x:0,y:0,w:d.w,h:d.h,dir:1,t:1.35,moving:false,dead:false,deadT:0,hurtT:0,atkAnim:-1,aggro:0,isBoss:true,boss:{phase:0,raise:0},lv:d.lv,status:{}};
   ctx.save();ctx.translate(col*440+225,y0+rowH-18);ctx.scale(1.05,1.05);const A=G.MonArt[id];if(col===0)G.Draw.monster(ctx,m,1.35);else{const r0=A.refine;A.refine=false;G.MonRefineS(ctx,m,1.35);A.refine=r0;}ctx.restore();}});},list);
await pg.waitForTimeout(200);const h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:900,height:Math.ceil(h)});await pg.screenshot({path:part+'.png'});}
// 녹스
await pg.setViewportSize({width:1100,height:900});
await pg.evaluate(()=>{const rows=[['지금',null],['확정 (3차)',{1:1,2:1,4:1,nc:1,crack:'ab'}],['3차 + 윗도리·망토 이음 (이음새 선 없음)',{1:1,2:1,4:1,nc:1,crack:'ab',tj:1}]];
 const rowH=360,W=1100,H=rows.length*rowH+56;document.body.innerHTML='';const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);
 ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffd36a';ctx.font='bold 18px sans-serif';['1페이즈 (체념)','2페이즈 (서러움)','3페이즈 (절망)'].forEach((s,i)=>ctx.fillText(s,230+i*290,34));
 const d=G.MONSTERS.nox,A=G.MonArt.nox,keep=A.draw;
 rows.forEach(([name,opt],r)=>{const y0=48+r*rowH;ctx.fillStyle='#161c36';ctx.fillRect(10,y0,W-20,rowH-8);ctx.fillStyle='#e9ecf8';ctx.font='bold 14px sans-serif';ctx.fillText(name,22,y0+22);
  for(let ph=0;ph<3;ph++){const cx=250+ph*290,cy=y0+rowH-22;ctx.save();ctx.beginPath();ctx.rect(cx-145,y0,290,rowH-8);ctx.clip();ctx.translate(cx,cy);ctx.scale(0.92,0.92);
   if(!opt){ctx.scale(1/(d.h/240),1/(d.h/240));const m={id:'nox',d,x:0,y:0,w:d.w,h:d.h,dir:1,t:1.35,boss:{phase:ph},dead:false,deadT:0,hurtT:0,atkAnim:-1,status:{}};ctx.scale(d.h/240,d.h/240);G.NoxArt.mix(ctx,1.35,ph,'#161c36');}
   else if(!opt.seam){window.NOXOPT=opt;G.NoxArtO.mix(ctx,1.35,ph,'#161c36');}
   else{window.NOXOPT=opt;const k=d.h/240;A.draw=(c,mm,tt)=>{c.scale(k,k);G.NoxArtO.mix(c,tt,ph,'#161c36');};const m={id:'nox',d,x:0,y:0,w:d.w,h:d.h,dir:1,t:1.35,boss:{phase:ph},dead:false,deadT:0,hurtT:0,atkAnim:-1,status:{}};ctx.scale(1/k,1/k);G.MonRefineS(ctx,m,1.35);A.draw=keep;}
   ctx.restore();window.NOXOPT={};}});});
await pg.waitForTimeout(200);const h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:1100,height:Math.ceil(h)});await pg.screenshot({path:'b9_nox.png'});
console.log(errs.slice(0,4));await b.close();})();
