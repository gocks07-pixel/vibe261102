const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900},deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
await pg.addScriptTag({content:fs.readFileSync('monB.js','utf8')});await pg.addScriptTag({content:fs.readFileSync('monB2.js','utf8')});await pg.addScriptTag({content:fs.readFileSync('monB3.js','utf8')});
for (const [part,list,rowH,sc] of [['v2a',['shellock','morwen','grounder'],330,1.2],['v2b',['aurelion','eldrick','nox'],390,1.05]]) {
await pg.setViewportSize({width:1300,height:900});
await pg.evaluate(([list,rowH,sc])=>{
 document.body.innerHTML='';document.body.style.cssText='margin:0;background:#0d1124';const W=1300,H=list.length*rowH+56;
 const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);
 ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffd36a';ctx.font='bold 18px sans-serif';
 ctx.fillText('지금',190,34);ctx.fillText('지난 시안 (나)',560,34);ctx.fillText('새 시안 (다른 디자인)',940,34);
 list.forEach((id,r)=>{const y0=48+r*rowH;ctx.fillStyle='#161c36';ctx.fillRect(10,y0,W-20,rowH-8);
  ctx.fillStyle='#e9ecf8';ctx.font='bold 13px sans-serif';ctx.fillText(G.MONSTERS[id].name,22,y0+18);
  for(const x of [433,866]){ctx.strokeStyle='#2c355c';ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y0+rowH-8);ctx.stroke();}
  const d=G.MONSTERS[id];const mk=(x,walk,t)=>({id,d,x,y:0,w:d.w,h:d.h,dir:1,t,moving:walk,dead:false,deadT:0,hurtT:0,atkAnim:-1,aggro:0,isBoss:d.kind==='boss',boss:d.kind==='boss'?{phase:0,raise:0}:null,lv:d.lv,status:{}});
  for(const [col,mode] of [[0,'now'],[1,'na'],[2,'na2']]){
   if(mode==='na'&&!G.MonNew[id]){ctx.fillStyle='#6a7090';ctx.font='13px sans-serif';ctx.fillText('(이번 시안은 가만 — 단계 시안에서 새로)',890,y0+rowH/2);continue;}
   for(const [j,walk,t] of (d.kind==='boss'||d.kind==='final'?[[0.5,true,1.35]]:[[0,false,0.6],[1,true,1.35]])){
    ctx.save();const cx=(col*433)+120+j*170,cy=y0+rowH-18;ctx.translate(cx,cy);ctx.scale(sc,sc);
    const m=mk(0,walk,t);const A=G.MonArt[id],keep=A.draw;
    if(mode==='na')A.draw=(c,mm,tt,s)=>G.MonNew[id](c,mm,tt,s);if(mode==='na2')A.draw=(c,mm,tt,s)=>G.MonNew2[id](c,mm,tt,s);
    if(mode==='now')G.Draw.monster(ctx,m,t);else G.MonRefine(ctx,m,t);
    A.draw=keep;ctx.restore();}
  }});
},[list,rowH,sc]);
await pg.waitForTimeout(300);const h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:1300,height:Math.ceil(h)});
await pg.screenshot({path:'mon_'+part+'.png'});}
console.log(errs.slice(0,5));await b.close();})();
