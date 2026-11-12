const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1300,height:900},deviceScaleFactor:2}); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
await pg.addScriptTag({content:fs.readFileSync('outfit_v2.js','utf8')}); await pg.addScriptTag({content:fs.readFileSync('outfit_v3.js','utf8')});
const SETS0=[['새싹 모험가','sprout',['sprout_hat','sprout_top','sprout_bottom','sprout_shoes','traveler_cape','traveler_gloves'],'sword_steel'],
 ['엘렌 숲지기','elen',['elen_hat','elen_top','elen_bottom','elen_shoes','elen_gloves'],'sword_red'],
 ['미스릴 Lv.30',30],['라그 강철 Lv.40',40],['서리용 Lv.70',70],['천공 Lv.85',85],['공허 수호자 Lv.90',90],
 ['별조각 계승자','star',['trial_hat','trial_top','trial_bottom','trial_shoes','trial_gloves','trial_cape'],'trial_sword']];
const SETS=[SETS0[2],SETS0[4],SETS0[6],SETS0[7]];
for (const [part,list] of [['a',SETS]]) {
await pg.evaluate((list)=>{
 document.body.innerHTML='';document.body.style.cssText='margin:0;background:#0d1124;color:#e9ecf8;font-family:sans-serif';
 const W=1300,rowH=210,cv=document.createElement('canvas');cv.width=W*2;cv.height=(list.length*rowH+60)*2;cv.style.width=W+'px';document.body.appendChild(cv);
 const ctx=cv.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,9999);
 ctx.fillStyle='#ffd36a';ctx.font='bold 20px sans-serif';ctx.fillText('세련 시안 A',270,36);ctx.fillText('시안 B (새 디자인)',860,36);
 const OLD=G.Outfit2,NEW=G.Outfit3,REAL=G.Outfit;
 list.forEach(([name,key,pieces,wid],r)=>{
  let ids=pieces;if(typeof key==='number'){ids=['hat','top','bottom','shoes','gloves','cape'].map(s=>`ar${key}_${s}`).filter(id=>G.ITEMS[id]);}
  const y0=60+r*rowH;ctx.fillStyle='#161c36';ctx.fillRect(10,y0,W-20,rowH-10);ctx.fillStyle='#e9ecf8';ctx.font='bold 15px sans-serif';ctx.fillText(name,22,y0+22);
  ctx.strokeStyle='#2c355c';ctx.beginPath();ctx.moveTo(650,y0);ctx.lineTo(650,y0+rowH-10);ctx.stroke();
  [['warrior','m','short','#2a1a12'],['mage','f','long','#5a3a22'],['archer','m','side','#684932']].forEach(([fam,gd,hs,hc],i)=>{
   const w=wid?G.ITEMS[(fam==='warrior'?wid:wid.replace('sword',fam==='mage'?'wand':'bow').replace(/_steel$/,'').replace(/_red$/,'_red'))]:null;
   let wi=null; if(typeof key==='number'){wi=[key,key+5,key-5].map(l=>`wp${l}_${fam}`).find(id=>G.ITEMS[id]);} else if(fam==='warrior') wi=wid; else wi=key==='star'?'trial_'+(fam==='mage'?'wand':'bow'):null;
   const eq={};for(const id of ids.concat(wi&&G.ITEMS[wi]?[wi]:[]))eq[G.ITEMS[id].slot]={tid:id};
   const it=s=>eq[s]?G.ITEMS[eq[s].tid]:null;
   const L=G.LOOKS.toDraw(Object.assign(G.LOOKS.def(gd),{hairStyle:hs,hairColor:hc}));
   const look=Object.assign({},L,{top:it('top')?it('top').color:L.top,bottom:it('bottom')?it('bottom').color:L.bottom});
   for(const [side,OF] of [[0,OLD],[1,NEW]]){ G.Outfit=OF;
    const wp=it('weapon');
    G.Draw.humanoid(ctx,{x:110+i*190+side*640,y:y0+rowH-28,dir:1,t:0.6,atk:-1,scale:2.25,look,gear:OF.gearOf(eq),hatColor:it('hat')?it('hat').color:null,cape:it('cape')?it('cape').color:null,weapon:wp?wp.type:null,wcolor:wp?wp.color:null});
   }
   G.Outfit=REAL;
  });
 });
},list);
await pg.waitForTimeout(300); const h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);
await pg.setViewportSize({width:1300,height:Math.ceil(h)}); await pg.screenshot({path:`cmpB_${part}.png`});
}
await b.close();})();
