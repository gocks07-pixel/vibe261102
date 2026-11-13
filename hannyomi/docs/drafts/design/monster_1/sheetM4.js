const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1200,height:900},deviceScaleFactor:2});
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
for(const f of ['monB.js','refineS.js','monC4.js'])await pg.addScriptTag({content:fs.readFileSync(f,'utf8')});
await pg.evaluate(()=>{const rows=[['spore','포자 방울'],['snow_wolf','설원 늑대'],['frost_bat','서리 박쥐']];const heads={spore:['가: 버섯 달팽이 (새 몬스터)','나: 민들레 솜털 정령 (새 몬스터)'],snow_wolf:['가: 털 풍성한 눈늑대 (다른 디자인)','나: 눈토끼 무리장 (새 몬스터)'],frost_bat:['가: 고드름 박쥐 (다른 디자인)','나: 눈송이 나방 (새 몬스터)']};
 const rowH=210,W=1200,H=rows.length*rowH+20;document.body.innerHTML='';document.body.style.cssText='margin:0;background:#0d1124';const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);
 rows.forEach(([id,name],r)=>{const y0=10+r*rowH;ctx.fillStyle='#161c36';ctx.fillRect(8,y0,W-16,rowH-6);ctx.fillStyle='#e9ecf8';ctx.font='bold 14px sans-serif';ctx.fillText(name,18,y0+20);ctx.fillStyle='#ffd36a';ctx.font='bold 13px sans-serif';ctx.fillText('지금',150,y0+40);ctx.fillText(heads[id][0],440,y0+40);ctx.fillText(heads[id][1],850,y0+40);
  for(const x of [400,800]){ctx.strokeStyle='#2c355c';ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y0+rowH-6);ctx.stroke();}
  const d=G.MONSTERS[id];for(let col=0;col<3;col++)for(const [j,walk,t,atk] of [[0,false,0.6,-1],[1,true,1.35,-1],[2,false,0.9,0.5]]){const m={id,d,x:0,y:0,w:d.w,h:d.h,dir:1,t,moving:walk,dead:false,deadT:0,hurtT:0,atkAnim:atk,aggro:0,isBoss:false,boss:null,lv:d.lv,status:{}};
   ctx.save();ctx.translate(col*400+90+j*115,y0+rowH-18);const sc=Math.min(1.1,120/d.h,100/d.w);ctx.scale(sc,sc);const A=G.MonArt[id],keep=A.draw;
   if(col>0){const f=G.MonNewC4[id+(col===1?'_a':'_b')];A.draw=(c,mm,tt,s)=>f(c,mm,tt,s);G.MonRefineS(ctx,m,t);}else G.Draw.monster(ctx,m,t);A.draw=keep;ctx.restore();}});});
await pg.waitForTimeout(200);const h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:1200,height:Math.ceil(h)});await pg.screenshot({path:'m4_redo.png'});await b.close();})();
