const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900},deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html');await pg.waitForTimeout(1500);
await pg.addScriptTag({content:fs.readFileSync('outfit_w.js','utf8')});
for (const [PART,ALL] of [['1',[['초보 탐험가 무기 (Lv.10)','basic'],['새싹 견습생 무기 (Lv.15)','s15'],['숲의 레인저 무기 (붉은손 Lv.20)','red'],['은빛 기사 (미스릴 Lv.30)',30],['증기 기술자 (라그 Lv.40)',40],['사막 유랑자 (Lv.50)',50]]],['2',[['태양의 사제 (파라오 Lv.60)',60],['서리 사냥꾼 (Lv.70)',70],['폭풍의 기수 (Lv.80)',80],['하늘 순례자 (천공 Lv.85)',85],['공허의 그림자 (Lv.90)',90],['별의 기사 (별조각)','star']]]]) {
await pg.setViewportSize({width:1300,height:900});
await pg.evaluate((ALL)=>{
 const SETS=ALL;
 document.body.innerHTML='';document.body.style.cssText='margin:0;background:#0d1124';const W=1300,rowH=200,H=SETS.length*rowH+60;
 const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.style.width=W+'px';document.body.appendChild(cv);const ctx=cv.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#0d1124';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#ffd36a';ctx.font='bold 20px sans-serif';ctx.fillText('지금 무기',250,36);ctx.fillText('새 무기 시안',870,36);
 const REAL=G.Outfit;
 SETS.forEach(([name,key,st],r)=>{
  const WEAPS={basic:['sword_iron','dagger_twin','wand_novice','bow_hunter'],s15:['sword_steel','dagger_shadow','wand_crystal','bow_wind'],red:['sword_red','dagger_red','wand_red','bow_red']};
  const SETI={basic:['leather_hat','leather_vest','leather_pants','leather_boots','leather_gloves'],s15:['sprout_hat','sprout_top','sprout_bottom','sprout_shoes','traveler_cape','traveler_gloves'],red:['elen_hat','elen_top','elen_bottom','elen_shoes','elen_gloves']};
  const ids=SETI[key]?SETI[key]:key==='star'?['trial_hat','trial_top','trial_bottom','trial_shoes','trial_gloves','trial_cape']:['hat','top','bottom','shoes','gloves','cape'].map(s=>`ar${key}_${s}`).filter(id=>G.ITEMS[id]);
  const y0=60+r*rowH;ctx.fillStyle='#161c36';ctx.fillRect(10,y0,W-20,rowH-10);ctx.fillStyle='#e9ecf8';ctx.font='bold 14px sans-serif';ctx.fillText(name,22,y0+20);
  ctx.strokeStyle='#2c355c';ctx.beginPath();ctx.moveTo(650,y0);ctx.lineTo(650,y0+rowH-10);ctx.stroke();
  [['warrior','sword','m'],['thief','dagger','m'],['mage','wand','f'],['archer','bow','f']].forEach(([fam,wt,gd],i)=>{
   const wid=typeof key==='string'&&key!=='star'?WEAPS[key][i]:key==='star'?'trial_'+wt:[key,key+5,key-5].map(l=>`wp${l}_${fam}`).find(id=>G.ITEMS[id]);const wi=G.ITEMS[wid];
   const eq={};for(const id of ids)eq[G.ITEMS[id].slot]={tid:id};if(wi)eq.weapon={tid:wid};const it=s=>eq[s]?G.ITEMS[eq[s].tid]:null;
   const L=G.LOOKS.toDraw(G.LOOKS.def(gd));const look=Object.assign({},L,{top:it('top')?it('top').color:L.top,bottom:it('bottom')?it('bottom').color:L.bottom});
   for(const [side,OF] of [[0,REAL],[1,G.OutfitW]]){G.Outfit=OF;
    G.Draw.humanoid(ctx,{x:90+i*145+side*640,y:y0+rowH-24,dir:1,t:0.6,atk:0.6,atkKind:wt==='bow'||wt==='wand'?'proj':'melee',scale:2.1,look,gear:OF.gearOf(eq),hatColor:it('hat')?it('hat').color:null,cape:it('cape')?it('cape').color:null,weapon:wi?wi.type:wt,wcolor:wi?wi.color:'#ccc'});G.Outfit=REAL;}
  });
 });
},ALL);
await pg.waitForTimeout(300);const h=await pg.evaluate(()=>document.querySelector('canvas').getBoundingClientRect().height);await pg.setViewportSize({width:1300,height:Math.ceil(h)});
await pg.screenshot({path:'weap_'+PART+'.png'});}
console.log(errs);await b.close();})();
