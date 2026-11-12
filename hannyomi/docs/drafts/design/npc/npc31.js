const { chromium } = require('playwright'); const fs=require('fs');
const NS=fs.readFileSync(__dirname+'/newstyle17.js','utf8');
const EXT=['dandy','part_v7','halfup','part_v8'].map(f=>fs.readFileSync(__dirname+'/ext/'+f+'.js','utf8'));
const SHEET=+process.argv[2];
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:1280,height:1080},deviceScaleFactor:2})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(String(e).slice(0,200)));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(1500);
for(const e of EXT) await pg.addScriptTag({content:e});
await pg.addScriptTag({content:NS});
await pg.evaluate((SHEET)=>{
 const cv=document.createElement('canvas');cv.id='npcsheet';cv.width=2560;cv.height=2160;cv.style.cssText='position:fixed;left:0;top:0;width:1280px;height:1080px;z-index:99999';document.body.appendChild(cv);
 const c=cv.getContext('2d');c.setTransform(2,0,0,2,0,0);const g=c.createLinearGradient(0,0,0,1080);g.addColorStop(0,'#2a3a6a');g.addColorStop(1,'#141a30');c.fillStyle=g;c.fillRect(0,0,1280,1080);
 const T=(x,y,t,col,sz,al)=>{c.fillStyle=col||'#e8ecff';c.font=`bold ${sz||14}px "Malgun Gothic",sans-serif`;c.textAlign=al||'center';c.fillText(t,x,y);};
 const EYE={soft_gentle:'온화한',intellectual:'지적인',intense_strong:'강인한',big:'초롱초롱한',round_big:'동그란',mystical:'신비로운',bright_smile:'화사한 웃음',mischievous:'장난기'};
 const HN={adv2:'ⓙ모험가',dandy_n:'ⓐ댄디',part_v7:'ⓑ가르마',halfup_v4:'ⓒ반묶음',tail:'ⓘ꽁지',long:'긴 생머리',twin:'양갈래',pony:'포니테일',bob:'단발',bun:'올림머리*',bald:'대머리*'};
 // [id, 새 머리, 성별, 눈, 눈 색(없으면 지금 색), 옷 종류, 덧붙임]
 const A=[
  ['trav','dandy_n','m','soft_gentle','#3a5a8a','cloak'],['silian','long','f','mystical',null,'mage',{acc:'circlet',nohat:1}],['seren','pony','f','intellectual','#3a6ad0','mage'],['pio','part_v7','m','big','#5a8a3a','explorer'],['kaien','dandy_n','m','intense_strong','#c03050','cloak'],
  ['orn','bald','m','intense_strong','#5a3a2a','squire'],['elin','twin','f','bright_smile','#c08a40','vest'],['volga','tail','m','soft_gentle','#5a4a3a','explorer'],['zen','adv2','m','intense_strong','#4a3a2a','vest'],['tiko','halfup_v4','m','big','#c07030','explorer'],
  ['rag_smith','part_v7','m','intense_strong','#4a4a5a','squire'],['rag_shop','bob','f','round_big','#8a4a7a','vest'],['yeonhee_rag','long','f','big',null,'sailor',{acc:'pin'}],
  ['azar','tail','m','intense_strong','#5a3a1a','explorer'],['hakim','dandy_n','m','mischievous','#6a4a2a','explorer'],['meirin','bun','f','intellectual','#6a4a8a','explorer'],['sah_smith','bald','m','intense_strong','#3a2a1a','vest'],['sah_shop','long','f','mystical','#c08a30','vest'],
  ['valeria','long','f','intellectual','#5a8ad0','mage',{acc:'circlet',nohat:1}],['artel','long','m','soft_gentle','#5a7ab0','mage'],['heidel','halfup_v4','m','intense_strong',null,'cloak'],['rok','tail','m','intellectual','#5a4a2a','ranger'],['fro_smith','part_v7','m','soft_gentle','#5a6a8a','squire'],['fro_shop','twin','f','round_big','#5a9ad0','vest'],
  ['aurelion_npc','long','m','mystical',null,'mage'],['orion','long','m','intellectual','#3a3a8a','mage'],['oriel','part_v7','m','intense_strong','#c8a030','squire'],['yuna','twin','f','big','#8a5ad0','mage'],['aer_smith','pony','f','intense_strong','#5a6ab0','squire'],['aer_shop','bob','f','bright_smile','#e08aa0','vest'],
  ['astra','long','m','mystical',null,'squire']];
 const S1=['trav','silian','seren','pio','kaien','orn','elin','volga','zen','tiko','rag_smith','rag_shop','yeonhee_rag','azar','hakim','meirin','sah_smith','sah_shop','BOSS'];
 const S2=['valeria','artel','heidel','rok','fro_smith','fro_shop','aurelion_npc','orion','oriel','yuna','aer_smith','aer_shop','astra'];
 const list=SHEET===1?S1:S2;
 T(640,32,SHEET===1?'2장 · 라그하르트 · 사막 NPC 18명 + 카이엔 보스 — 왼쪽: 지금 · 오른쪽: 새 그림체':'얼음성채 · 천공 · 종장 NPC 13명 — 왼쪽: 지금 · 오른쪽: 새 그림체','#ffe08a',22);
 T(640,54,'머리 · 눈은 확정 목록에서 배정 · *는 NPC 전용 · 옷 색 · 머리 색 · 수염 · 모자는 지금 그대로 · 두건 쓴 NPC는 머리카락이 두건 밖으로 안 나옴','#c8d0f0',11);
 list.forEach((id,i)=>{const r=i/5|0,k=i%5,x=130+k*250,y=245+r*250;
   if(id==='BOSS'){ const lk={skin:'#f0d8c0',hair:'#1a1a2a',top:'#2a2a4a',bottom:'#14141e',style:'side',eye:'sharp',eyeColor:'#c03050'};
     G.Draw.humanoid(c,{x:x-62,y,dir:1,t:0,look:lk,atk:-1,weapon:'sword',wcolor:'#8a5aff',cape:'#5a1a3a',scale:1.7});
     NS.draw(c,x+48,y,1.45,2,{hair:'#1a1a2a',style:'dandy_n',hk:1.04,fw:0.94,gender:'m',eye:'intense_strong',eyeColor:'#c03050',skin:'#f0d8c0'},{kind:'cloak',top:'#2a2a4a',bottom:'#14141e',cloakC:'#14141e',boots:true,shoe:'#1a1a2a',cape:'#5a1a3a',weapon:'sword'});
     T(x,y+24,'카이엔 · 교단 간부 (보스)',null,13); T(x,y+42,'ⓐ댄디 · 강인한 · 붉은 눈 · 망토 · 검 (분신은 반투명)','#8a94c0',11); return; }
   const a=A.find(q=>q[0]===id), d=G.NPCS[id], lk=Object.assign({skin:'#ffe0c2'},d.look);
   const [,st,gd,eye,ec,kind,ex]=a; const ext={dandy_n:1,part_v7:1,halfup_v4:1}[st];
   G.Draw.humanoid(c,{x:x-62,y,dir:1,t:0,look:lk,atk:-1,scale:1.7});
   const L=Object.assign({hair:lk.hair,style:st,gender:gd,eye,eyeColor:ec||lk.eyeColor||'#3a5ac0',skin:'#ffe0c2'},ext?{hk:1.04,fw:0.94}:{},lk.beard?{beard:1}:{},(lk.hat&&!(ex&&ex.nohat))?{hat:lk.hat}:{},ex&&ex.acc?{acc:ex.acc}:{});
   const O={kind,top:lk.top,bottom:lk.bottom,vest:lk.top,cloakC:lk.bottom,trim:'#e8c060',tabard:lk.top,navy:lk.bottom,boots:true,shoe:'#4a3a2a'};
   NS.draw(c,x+48,y,1.45,2,L,O);
   T(x,y+24,d.name+' · '+d.title,null,13);
   T(x,y+42,(HN[st]||st)+' · '+EYE[eye]+(lk.beard?' · 수염':'')+(L.hat?' · 두건':'')+(ex&&ex.acc==='circlet'?' · 머리장식':'')+(ex&&ex.acc==='pin'?' · 별 머리핀':''),'#8a94c0',11);});
},SHEET);
await (await pg.$('#npcsheet')).screenshot({path:__dirname+'/cat_npc31_'+SHEET+'.png'});console.log('errs',errs);await b.close();})();
