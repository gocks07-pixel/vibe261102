// 모든 퀘스트 × 목표 상태: 버튼과 같은 함수(G.Play.questGo)로 실제 이동 → 맵이 바뀌었는지 · 그 맵에서 몇 초 지나도 오류 없는지 · 땅에 서 있는지
//  실행: node questgo_move.js <게임 주소> <덤프(아무 캐릭터)>
const { chromium, devices } = require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext(devices['iPhone 13 landscape'])).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(String(e).slice(0,200)));
await pg.goto(process.argv[2]+'/index.html');await pg.waitForTimeout(900);
const r=await pg.evaluate(async(dump)=>{G.Mobile.closeModal();const d=JSON.parse(dump);G.Game.loop=()=>{};G.UI.overlay('');G.Game.begin(d);
 const Q=G.Quest,ready0=Q.ready.bind(Q),prog0=Q.progress.bind(Q),act0=Q.isActive.bind(Q);
 const p=G.Game.player; let ts=performance.now(); const step=n=>{for(let i=0;i<n;i++){ts+=1000/60;G.Game.frame(ts);G.Input.endFrame();} if(G.Dialog.isOpen())G.Dialog.close(); if(G.Cutscene.playing&&G.Cutscene.playing())G.Cutscene.finish(); for(const k of Object.keys(G.UI.wins))G.UI.closeWin(k); G.UI.overlay('');};
 const out={moves:0,bad:[],byCh:{},maps:new Set()};
 for(const q of Object.values(G.QUESTS)){
  for(const stt of q.obj.map((o,i)=>({i})).concat([{ready:true}])){
   G.Game.changeMap('sprout_port',null); step(5);
   Q.isActive=id=>id===q.id||act0(id); Q.ready=qq=>qq.id===q.id?!!stt.ready:ready0(qq);
   Q.progress=(qq,o)=>{if(qq.id!==q.id)return prog0(qq,o);const i=q.obj.indexOf(o),n=o.n||1;return stt.ready||i<stt.i?[n,n]:[0,n];};
   const D=G.Play.questDest(q); if(!D) continue; const dest=D.map;
   p.dead=false; p.hp=p.st.maxHP; G.Play.questGo(q.id); const dlg=G.Dialog.isOpen(); const w0=G.Game.world;
   const nx=D.npc&&w0.npcs.find(n=>n.id===D.npc), px=D.portal&&w0.portals.find(x=>x.id===D.portal);
   const off=nx?Math.abs(p.x-nx.x):px?Math.abs(p.x-px.x):null; out.near=(out.near||0)+(off!=null&&off<100?1:0); if(D.npc)out.npc=(out.npc||0)+1; if(D.portal)out.portal=(out.portal||0)+1; if(D.npc&&!dlg)out.bad.push({q:q.id,stt,why:'no-dialog'});
   if(off!=null&&off>=100)out.bad.push({q:q.id,stt,why:'far:'+Math.round(off)});
   step(180);   // 3초
   const w=G.Game.world; out.moves++; out.maps.add(w.mapId); out.byCh[q.ch]=(out.byCh[q.ch]||0)+1;
   const why = w.mapId!==dest?'not-moved:'+w.mapId : !p.onGround&&p.y>2000?'fell' : null;
   if(why) out.bad.push({q:q.id,stt,dest,why});
  }
 }
 Q.isActive=act0;Q.ready=ready0;Q.progress=prog0; out.maps=out.maps.size; return out;},fs.readFileSync(process.argv[3],'utf8'));
console.log(JSON.stringify(Object.assign(r,{errs:[...new Set(errs)].slice(0,10)}),null,1));await b.close();})();
