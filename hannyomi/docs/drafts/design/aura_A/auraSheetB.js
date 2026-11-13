const { chromium } = require('playwright'); const fs=require('fs');
const ROWS=[['w4a_awake','전사 a · 천붕검제의 각성','warrior','sword','불꽃 대검 다섯 (칠한 검)','등 뒤 불타는 거대 검'],['w4b_awake','전사 b · 불멸','warrior','sword','금빛 방패 문장 + 빛살','금빛 날개 + 천사 고리'],['a4b_awake','궁수 b · 저격왕의 각성','archer','bow','앞을 겨누는 조준 고리','등 뒤 대지 화살 셋'],['m4a_awake','마법사 a · 화염군주의 각성','mage','wand','칠한 불꽃 왕관','등 뒤 불꽃 고리'],['m4b_awake','마법사 b · 현자의 각성','mage','wand','발밑 마법진 + 오르는 빛','둘레를 도는 마법책'],['t4a_awake','도적 a · 야천의 각성','thief','dagger','보라 그림자 분신 둘','초승달 + 박쥐 날개 그림자'],['t4b_awake','도적 b · 검무의 각성','thief','dagger','몸 둘레 도는 독 단검','독빛 나비 떼']];
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1200,height:1440},deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);await pg.addScriptTag({content:fs.readFileSync('aura_b.js','utf8')});
await pg.evaluate((ROWS)=>{const W=1200,rh=200,H=40+ROWS.length*rh;const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.cssText='position:fixed;left:0;top:0;z-index:99999;width:'+W+'px';document.body.appendChild(cv);const c=cv.getContext('2d');c.scale(2,2);
 c.fillStyle='#e9ecf8';c.fillRect(0,0,W,40);c.fillStyle='#1a2040';c.font='bold 16px sans-serif';['지금','가','나'].forEach((s,i)=>c.fillText(s,i*400+190,27));
 ROWS.forEach(([id,name,fam,wp,ga,na],r)=>{const y0=40+r*rh;for(let col=0;col<3;col++){const dark=col%2===0;const g=c.createLinearGradient(0,y0,0,y0+rh);g.addColorStop(0,r%2?'#c8dcf4':'#3a2a1e');g.addColorStop(1,r%2?'#eef4fc':'#1e140c');c.fillStyle=g;c.fillRect(col*400,y0,400,rh);}
  c.fillStyle=r%2?'#1a2040':'#f0e8d8';c.font='bold 13px sans-serif';c.fillText(name,10,y0+18);c.font='12px sans-serif';c.fillText('가: '+ga,410,y0+18);c.fillText('나: '+na,810,y0+18);
  const lk=G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'),{hairStyle:'short',hairColor:'#4a3a2a'}),'#5a6a9a','#2a3050');
  for(let col=0;col<3;col++){const p={x:col*400+200,y:y0+rh-14,dir:1,t:1.2+col*0.5,buffs:{},drawOpts:()=>({x:0,y:0,dir:1,t:1,look:lk,weapon:wp,wcolor:'#d8dce8',scale:1}),dead:false};
   const draw=(cc,x,y,tint)=>{cc.save();cc.filter='brightness(0.25) sepia(1) hue-rotate(220deg) saturate(3)';G.Draw.humanoid(cc,{x,y,dir:1,t:p.t,look:lk,weapon:wp,wcolor:'#d8dce8',scale:1});cc.restore();};
   if(col===0){p.buffs[id]={};G.SkillX.aura(c,p);if(id==='a4b_awake'){c.fillStyle='#888';c.font='12px sans-serif';c.fillText('(모습 없음)',p.x-30,p.y-110);}}
   else{const f=G.AuraB[id.split('_')[0]+(col===1?'_ga':'_na')];if(id==='t4a_awake'&&col===1){for(const [dx,a] of [[-34,0.35],[-18,0.55]]){c.save();c.globalAlpha=a;draw(c,p.x+dx,p.y);c.restore();}}else f(c,p,p.t);}
   G.Draw.humanoid(c,{x:p.x,y:p.y,dir:1,t:p.t,look:lk,weapon:wp,wcolor:'#d8dce8',scale:1});}});},ROWS);
await pg.waitForTimeout(200);await pg.screenshot({path:'aura_b.png',fullPage:true});console.log(errs.slice(0,3));await b.close();})();
