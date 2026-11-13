// 보스 최종 시안 모음: 지금 | 확정 (이야기 순서)
const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:900},deviceScaleFactor:2});
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
for(const f of ['monB.js','monB2.js','monB3.js','monB4.js','aur_nat.js','grd_nat.js','monB5.js','monB6.js','monB7.js','monB8.js'])await pg.addScriptTag({content:fs.readFileSync(f,'utf8')});
const MODE={shellock:'na2',bark:'na',morwen:'na6',grounder:'nat',parakan:'na',kaien_boss:'na',aurelion:'nat',eldrick:'na8',nox:'ref'};
const NOTE={shellock:'보물 상자 소라게 · 자연스러운 집게',bark:'새 그림체 머리 · 붉은 두건 · 언월도',morwen:'지금 그림 + 연꽃 (연잎 · 연꽃 치마 · 연꽃 봉오리)',grounder:'지금 그림을 자연스럽게',parakan:'새 디자인',kaien_boss:'새 디자인',aurelion:'자연스러운 다리 · 날개 · 가시 · 이음새',eldrick:'여자 · 냉미녀 흑마법사',nox:'지금 그림 + 다듬기'};
const parts=[['final_1',['shellock','bark','morwen']],['final_2',['grounder','parakan','kaien_boss']],['final_3',['aurelion','eldrick','nox']]];
for(const [part,list] of parts){
await pg.setViewportSize({width:900,height:900});
await pg.evaluate(([list,MODE,NOTE])=>{
 const rowH=390,sc=1.05;document.body.innerHTML='';document.body.style.cssText='margin:0;background:#0d1124';const W=900,H=list.length*rowH+56;
 const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);
 ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffd36a';ctx.font='bold 18px sans-serif';ctx.fillText('지금',200,34);ctx.fillText('확정',640,34);
 list.forEach((id,r)=>{const y0=48+r*rowH;ctx.fillStyle='#161c36';ctx.fillRect(10,y0,W-20,rowH-8);
  ctx.fillStyle='#e9ecf8';ctx.font='bold 13px sans-serif';ctx.fillText(G.MONSTERS[id].name,22,y0+18);ctx.fillStyle='#a8b0d8';ctx.font='12px sans-serif';ctx.fillText(NOTE[id],462,y0+18);
  ctx.strokeStyle='#2c355c';ctx.beginPath();ctx.moveTo(450,y0);ctx.lineTo(450,y0+rowH-8);ctx.stroke();
  const d=G.MONSTERS[id];const mk=(walk,t)=>({id,d,x:0,y:0,w:d.w,h:d.h,dir:1,t,moving:walk,dead:false,deadT:0,hurtT:0,atkAnim:-1,aggro:0,isBoss:true,boss:{phase:0,raise:0},lv:d.lv,status:{}});
  for(const [col,mode] of [[0,'now'],[1,MODE[id]]]){
   ctx.save();const cx=col*440+225,cy=y0+rowH-18;ctx.translate(cx,cy);ctx.scale(sc,sc);const t=1.35,m=mk(false,t);const A=G.MonArt[id],keep=A.draw;
   if(mode==='na')A.draw=(c,mm,tt,s)=>G.MonNew[id](c,mm,tt,s);if(mode==='na2')A.draw=(c,mm,tt,s)=>G.MonNew2[id](c,mm,tt,s);if(mode==='na6')A.draw=(c,mm,tt,s)=>G.MonNew6[id](c,mm,tt,s);if(mode==='na8')A.draw=(c,mm,tt,s)=>G.MonNew8[id](c,mm,tt,s);if(mode==='nat')A.draw=G.MonArtN[id].draw;
   if(mode==='now'||mode==='na8')G.Draw.monster(ctx,m,t);else G.MonRefine(ctx,m,t);A.draw=keep;ctx.restore();}
 });
},[list,MODE,NOTE]);
await pg.waitForTimeout(300);const h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:900,height:Math.ceil(h)});
await pg.screenshot({path:'boss_'+part+'.png'});}
await b.close();})();
