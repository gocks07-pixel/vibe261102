// 몬스터 1단계 (프롤로그~2장): 지금 | 가 다듬기 | 나 새 디자인
const { chromium } = require('playwright'); const fs=require('fs');
const IDS=(process.env.IDS||'jelly,crab,spore,capshroom,spikeshell,sealizard,fieldrat,scarecrow,windspirit,wingboar,banditnov,banditarch,moss_slime,thorn_beetle,cave_spider,web_bat,swamp_toad,firefly_spirit').split(',');
const OUT=process.env.OUT||'m1';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1200,height:900},deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
for(const f of ['monB.js','monC1.js','monC2.js','monC3.js','refineS.js'])if(fs.existsSync(f))await pg.addScriptTag({content:fs.readFileSync(f,'utf8')});
const per=6;for(let pi=0;pi*per<IDS.length;pi++){const list=IDS.slice(pi*per,pi*per+per);
await pg.setViewportSize({width:1200,height:900});
await pg.evaluate(([list,process_S])=>{const rowH=190,W=1200,H=list.length*rowH+50;document.body.innerHTML='';document.body.style.cssText='margin:0;background:#0d1124';
 const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);
 ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffd36a';ctx.font='bold 17px sans-serif';ctx.fillText('지금',170,32);ctx.fillText(process_S?'가: 다듬기 + 이음새 없이':'가: 다듬기',process_S?500:540,32);ctx.fillText('나: 새 디자인',930,32);
 list.forEach((id,r)=>{const y0=44+r*rowH;ctx.fillStyle='#161c36';ctx.fillRect(8,y0,W-16,rowH-6);ctx.fillStyle='#e9ecf8';ctx.font='bold 13px sans-serif';ctx.fillText(G.MONSTERS[id].name,18,y0+18);
  for(const x of [400,800]){ctx.strokeStyle='#2c355c';ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y0+rowH-6);ctx.stroke();}
  const d=G.MONSTERS[id];const mk=(walk,t,atk)=>({id,d,x:0,y:0,w:d.w,h:d.h,dir:1,t,moving:walk,dead:false,deadT:0,hurtT:0,atkAnim:atk,aggro:0,isBoss:false,boss:null,lv:d.lv,status:{}});
  const NEW=(G.MonNewC||{})[id]||(G.MonNewC2||{})[id]||(G.MonNewC3||{})[id]||(G.MonNew||{})[id];
  for(let col=0;col<3;col++){for(const [j,walk,t,atk] of [[0,false,0.6,-1],[1,true,1.35,-1],[2,false,0.9,0.5]]){
    ctx.save();const cx=col*400+90+j*115,cy=y0+rowH-16;ctx.translate(cx,cy);const sc=Math.min(1,120/d.h,100/d.w);ctx.scale(sc,sc);const m=mk(walk,t,atk);const A=G.MonArt[id],keep=A.draw;
    if(col===2){if(!NEW){ctx.restore();if(j===0){ctx.fillStyle='#6a7090';ctx.font='12px sans-serif';ctx.fillText('(준비 중)',col*400+150,y0+rowH/2);}continue;}A.draw=(c,mm,tt,s)=>NEW(c,mm,tt,s);}
    if(col===0)G.Draw.monster(ctx,m,t);else if(col===1&&process_S)G.MonRefineS(ctx,m,t);else G.MonRefine(ctx,m,t);A.draw=keep;ctx.restore();}}
 });},[list,!!process.env.SEAMLESS]);
await pg.waitForTimeout(200);const h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:1200,height:Math.ceil(h)});
await pg.screenshot({path:`${OUT}_${pi+1}.png`});}
console.log(errs.slice(0,3));await b.close();})();
