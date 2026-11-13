const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:640},deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);await pg.addScriptTag({content:fs.readFileSync('aura_a.js','utf8')});
await pg.evaluate(()=>{const W=1300,H=640;const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.cssText='position:fixed;left:0;top:0;z-index:99999;width:'+W+'px';document.body.appendChild(cv);const c=cv.getContext('2d');c.scale(2,2);
 const cols=[['지금',null],['가: 바람 깃털 날개','ga'],['나: 금빛 별 활','na'],['다: 회오리 바람','da'],['라: 매의 눈','ra']];
 const bgs=[['#3a2a1e','#1e140c'],['#c8dcf4','#eef4fc']];
 bgs.forEach(([a,b2],r)=>{const y0=40+r*300;const g=c.createLinearGradient(0,y0,0,y0+290);g.addColorStop(0,a);g.addColorStop(1,b2);c.fillStyle=g;c.fillRect(0,y0,W,300);});
 c.fillStyle='#ffd36a';c.font='bold 16px sans-serif';c.fillStyle='#e9ecf8';c.fillRect(0,0,W,40);c.fillStyle='#1a2040';cols.forEach(([n],i)=>c.fillText(n,i*260+70,26));
 const lk=G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'),{hairStyle:'short',hairColor:'#8a5a3a'}),'#f4f6ff','#c8d0e8');
 const eq={hat:{tid:'ar85_hat'},top:{tid:'ar85_top'},bottom:{tid:'ar85_bottom'},shoes:{tid:'ar85_shoes'},gloves:{tid:'ar85_gloves'},cape:{tid:'ar85_cape'},weapon:{tid:'wp85_archer'}};for(const k in eq)if(!G.ITEMS[eq[k].tid])delete eq[k];
 bgs.forEach((_,r)=>cols.forEach(([n,k],i)=>{const p={x:i*260+130,y:40+r*300+250,dir:1,t:1.2+i*0.3};
  if(k===null){const fake={x:p.x,y:p.y,dir:1,t:p.t,buffs:{a4a_awake:{}},activeBuffs:[]};try{const AU=G.SkillX;const keep=null;}catch(e){}
   c.save();c.globalCompositeOperation='lighter';c.globalAlpha=0.6;const f=Math.sin(p.t*4)*0.1;for(const sg of [-1,1])for(let j=0;j<4;j++){c.save();c.translate(p.x,p.y-48);c.scale(sg,1);c.rotate(-0.9+j*0.32+f);c.fillStyle='rgba(190,255,200,.7)';c.beginPath();c.ellipse(30,0,24,5,0,0,Math.PI*2);c.fill();c.restore();}c.restore();}
  else G.AuraMock[k](c,p,p.t);
  c.save();G.Draw.humanoid(c,{x:p.x,y:p.y,dir:1,t:p.t,look:lk,gear:G.Outfit.gearOf(eq),weapon:'bow',wcolor:'#e8f0ff',scale:1});c.restore();
  if(k==='na'||k===null){} }));});
await pg.screenshot({path:'aura_a.png'});console.log(errs.slice(0,3));await b.close();})();
