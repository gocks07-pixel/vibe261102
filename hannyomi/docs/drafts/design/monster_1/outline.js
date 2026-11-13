const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1200,height:900},deviceScaleFactor:2});
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
await pg.evaluate(()=>{const ids=['snow_wolf','frost_bat','yeti','jelly','mine_rat','cloud_sheep'];const modes=[['지금 (진한 테두리)',null],['가: 테두리 밝게 (모양 그대로)',{sil:false,fade:0.55,tint:'#ffffff'}],['나: 테두리 옅게 (반투명 남색)',{silA:0.3,fade:0.35,tint:'#c8d4f0'}]];
 const W=1200,rowH=135,H=50+ids.length*rowH;const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.cssText='position:fixed;left:0;top:0;z-index:99999;width:'+W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#c8dcf4');g.addColorStop(1,'#e8f0fa');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#2a3a68';ctx.font='bold 17px sans-serif';modes.forEach(([n],i)=>ctx.fillText(n,i*400+110,30));
 // 실루엣 색 바꾸기: fillStyle 'rgba(28,18,40,.92)' 를 잠깐 바꿈
 const P=CanvasRenderingContext2D.prototype,fr=P.fillRect;
 ids.forEach((id,r)=>{const d=G.MONSTERS[id];modes.forEach(([n,mode],c)=>{for(let j=0;j<2;j++){
   G.MonRefine.EDGE=mode;
   const m={id,d,x:c*400+130+j*140,y:50+r*rowH+rowH-15,w:d.w,h:d.h,dir:-1,t:1+j*0.4+r*0.1+c*0.001,moving:!!j,dead:false,deadT:0,hurtT:0,atkAnim:-1,aggro:0,isBoss:false,boss:null,lv:d.lv,status:{}};
   ctx.save();const sc=Math.min(1,100/d.h);ctx.translate(m.x,m.y);ctx.scale(sc,sc);ctx.translate(-m.x,-m.y);G.Draw.monster(ctx,m,m.t);ctx.restore();G.MonRefine.EDGE=null;}});});});
await pg.screenshot({path:'outline.png'});await b.close();})();
