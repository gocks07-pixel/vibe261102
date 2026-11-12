const { chromium } = require('playwright'); const fs=require('fs');
const NS=fs.readFileSync(__dirname+'/newstyle17.js','utf8');
const EXT=['dandy','part_v7','halfup','part_v8'].map(f=>fs.readFileSync(__dirname+'/ext/'+f+'.js','utf8'));
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:1280,height:1080},deviceScaleFactor:2})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(String(e).slice(0,200)));
await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(1500);
for(const e of EXT) await pg.addScriptTag({content:e});
await pg.addScriptTag({content:NS});
await pg.evaluate(()=>{
 const cv=document.createElement('canvas');cv.id='npcsheet';cv.width=2560;cv.height=2160;cv.style.cssText='position:fixed;left:0;top:0;width:1280px;height:1080px;z-index:99999';document.body.appendChild(cv);
 const c=cv.getContext('2d');c.setTransform(2,0,0,2,0,0);const g=c.createLinearGradient(0,0,0,1080);g.addColorStop(0,'#2a3a6a');g.addColorStop(1,'#141a30');c.fillStyle=g;c.fillRect(0,0,1280,1080);
 const T=(x,y,t,col,sz,al)=>{c.fillStyle=col||'#e8ecff';c.font=`bold ${sz||14}px "Malgun Gothic",sans-serif`;c.textAlign=al||'center';c.fillText(t,x,y);};
 const EYE={soft_gentle:'온화한',intellectual:'지적인',intense_strong:'강인한',big:'초롱초롱한',round_big:'동그란',mystical:'신비로운',bright_smile:'화사한 웃음',mischievous:'장난기'};
 const HN={adv2:'ⓙ모험가',dandy_n:'ⓐ댄디',part_v7:'ⓑ가르마',halfup_v4:'ⓒ반묶음',tail:'ⓘ꽁지',long:'긴 생머리',twin:'양갈래',pony:'포니테일',bob:'단발',bun:'올림머리*',bald:'대머리*'};
 // [id, 이름, 새 머리, 성별, 눈, 눈 색, 옷 종류]
 const NEW=[['lumi','루미','bun','f','big','#3a5ac0','mage'],['lulu','루루','twin','f','bright_smile','#c44569','sailor'],['harmon','하르몬','bald','m','soft_gentle','#5a4a3a','scholar'],['brody','브로디','adv2','m','intense_strong','#3a4a6a','sailor'],
  ['mina','미나','long','f','round_big','#7a4a2a','vest'],['thor','토르','tail','m','intense_strong','#7a4a2a','squire'],['noah','노아','dandy_n','m','soft_gentle','#4a6a5a','explorer'],['elma','엘마','long','f','mystical','#3a5ac0','cloak'],
  ['kir','키르','dandy_n','m','mischievous','#3a4a6a','sailor'],['sera','세라','long','f','intellectual','#3a8a5a','ranger'],['garen','가렌','part_v7','m','intense_strong','#5a3a2a','squire'],['ria','리아','pony','f','big','#3a8a4a','ranger'],
  ['oswin','오스윈','long','m','intellectual','#5a5aa8','mage'],['vince','빈스','halfup_v4','m','mischievous','#6a4a8a','cloak'],['gren','그렌','bald','m','soft_gentle','#7a5a3a','explorer'],['penny','페니','twin','f','round_big','#c07040','vest'],
  ['haro','하로','part_v7','m','intellectual','#4a4a5a','squire'],['dora','도라','bob','f','soft_gentle','#7a5a8a','cloak'],['marco','마르코','tail','m','mischievous','#7a5a2a','cloak'],['_','','','','','','']];
 T(640,32,'NPC 20명 새 그림체 시안 — 왼쪽: 지금 게임 · 오른쪽: 새 그림체','#ffe08a',23);
 T(640,54,'머리 · 눈은 확정 목록에서 성격에 맞게 배정 · *는 NPC 전용(플레이어는 못 고름) · 옷 색은 지금 NPC 색 그대로','#c8d0f0',12);
 NEW.forEach(([id,nm,st,gd,eye,ec,kind],i)=>{ if(id==='_')return; const d=G.NPCS[id]; const lk=Object.assign({skin:'#ffe0c2'},d.look);
   const r=i/5|0,k=i%5,x=130+k*250,y=245+r*250;
   G.Draw.humanoid(c,{x:x-62,y:y,dir:1,t:0,look:lk,atk:-1,scale:1.7});
   const ext={dandy_n:1,part_v7:1,halfup_v4:1}[st];
   const L=Object.assign({hair:lk.hair,style:st,gender:gd,eye,eyeColor:ec,skin:'#ffe0c2'},ext?{hk:1.04,fw:0.94}:{}, lk.beard?{beard:1}:{}, lk.hat?{hat:lk.hat}:{});
   const O={kind,top:lk.top,bottom:lk.bottom,vest:lk.top,cloakC:lk.bottom,trim:'#e8c060',tabard:lk.top,navy:lk.bottom,boots:true,shoe:'#4a3a2a'};
   NS.draw(c,x+48,y,1.45,2,L,O);
   T(x,y+24,nm+' · '+d.title,null,13); T(x,y+42,(HN[st]||st)+' · '+EYE[eye]+(lk.beard?' · 수염':'')+(lk.hat?' · 모자':''),'#8a94c0',11);});
});
await (await pg.$('#npcsheet')).screenshot({path:__dirname+'/cat_npc20.png'});console.log('errs',errs);await b.close();})();
