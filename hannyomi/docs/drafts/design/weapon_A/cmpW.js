const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900},deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
await pg.addScriptTag({content:fs.readFileSync('outfit_w.js','utf8')});
await pg.evaluate(()=>{
 const SETS=[['은빛 기사 (미스릴)',30,'mithril'],['증기 기술자 (라그)',40,'rag'],['서리 사냥꾼 (서리용)',70,'frost'],['공허의 그림자 (공허)',90,'void'],['별의 기사 (별조각)','star','starheir']];
 document.body.innerHTML='';document.body.style.cssText='margin:0;background:#0d1124';const W=1300,rowH=200,H=SETS.length*rowH+60;
 const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#ffd36a';ctx.font='bold 20px sans-serif';ctx.fillText('지금 무기',250,36);ctx.fillText('새 무기 시안',870,36);
 const REAL=G.Outfit;
 SETS.forEach(([name,key,st],r)=>{
  const ids=key==='star'?['trial_hat','trial_top','trial_bottom','trial_shoes','trial_gloves','trial_cape']:['hat','top','bottom','shoes','gloves','cape'].map(s=>`ar${key}_${s}`).filter(id=>G.ITEMS[id]);
  const y0=60+r*rowH;ctx.fillStyle='#161c36';ctx.fillRect(10,y0,W-20,rowH-10);ctx.fillStyle='#e9ecf8';ctx.font='bold 14px sans-serif';ctx.fillText(name,22,y0+20);
  ctx.strokeStyle='#2c355c';ctx.beginPath();ctx.moveTo(650,y0);ctx.lineTo(650,y0+rowH-10);ctx.stroke();
  [['warrior','sword','m'],['thief','dagger','m'],['mage','wand','f'],['archer','bow','f']].forEach(([fam,wt,gd],i)=>{
   const wid=key==='star'?'trial_'+wt:[key,key+5,key-5].map(l=>`wp${l}_${fam}`).find(id=>G.ITEMS[id]);const wi=G.ITEMS[wid];
   const eq={};for(const id of ids)eq[G.ITEMS[id].slot]={tid:id};if(wi)eq.weapon={tid:wid};const it=s=>eq[s]?G.ITEMS[eq[s].tid]:null;
   const L=G.LOOKS.toDraw(G.LOOKS.def(gd));const look=Object.assign({},L,{top:it('top').color,bottom:it('bottom')?it('bottom').color:L.bottom});
   for(const [side,OF] of [[0,REAL],[1,G.OutfitW]]){G.Outfit=OF;
    G.Draw.humanoid(ctx,{x:90+i*145+side*640,y:y0+rowH-24,dir:1,t:0.6,atk:0.6,atkKind:wt==='bow'||wt==='wand'?'proj':'melee',scale:2.1,look,gear:OF.gearOf(eq),hatColor:it('hat').color,cape:it('cape')?it('cape').color:null,weapon:wi?wi.type:wt,wcolor:wi?wi.color:'#ccc'});G.Outfit=REAL;}
  });
 });
});
await pg.waitForTimeout(300);const h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:1300,height:Math.ceil(h)});
await pg.screenshot({path:'weap_cmp.png'});console.log(errs);await b.close();})();
