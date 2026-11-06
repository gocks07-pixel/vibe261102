// 2차-1.7 휴대폰 키 문구 검사: 소스에서 키 · 마우스 문구를 모아(keystr.json, 만드는 방법은 BUILD_MOBILE_PLAN.md 2차-1.7 결과) 휴대폰 · PC 모드로 띄워 남은 것을 찾는다
const { chromium, devices } = require('playwright'); const fs=require('fs');
const STR=JSON.parse(fs.readFileSync('keystr.json','utf8'));
const BAD=/S 키|K 키|Z 키|E 키|F1|F9|Shift|더블클릭|우클릭|Esc|ESC|클릭|\([IQK]\)/;
(async()=>{const b=await chromium.launch();
for (const [name,ctx] of [['phone',devices['iPhone 13 landscape']],['pc',{viewport:{width:1280,height:720}}]]){
 const pg=await (await b.newContext(ctx)).newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e).slice(0,150)));
 await pg.goto('http://localhost:8123/index.html');await pg.waitForTimeout(1000);
 const r=await pg.evaluate(async ([STR,dump])=>{
  const BAD=/S 키|K 키|Z 키|E 키|F1|F9|Shift|더블클릭|우클릭|Esc|ESC|클릭|\([IQK]\)/;
  G.Mobile.closeModal&&G.Mobile.closeModal(); const d=JSON.parse(dump); G.UI.overlay(''); G.Game.begin(d);
  const touch=G.Touch.active(), wait=ms=>new Promise(r=>setTimeout(r,ms)), res={touch, strLeft:[], screens:{}};
  // 1) 소스의 글 48곳: 로그로 실제 화면에 띄워 봄 (템플릿 ${…} 는 그대로 글자로)
  for(const s of STR){ G.UI.log(s.t,'#fff'); }
  await wait(300);
  const logTxt=[...document.querySelectorAll('#log div, #log p, #log span')].map(e=>e.textContent);
  const logAll=document.getElementById('log')?document.getElementById('log').innerText:'';
  for(const s of STR){ const fixed= touch? G.Mobile.fixText(s.t) : s.t; if(BAD.test(fixed)) res.strLeft.push(s.f+':'+s.l+' → '+fixed.slice(0,90)); }
  // 2) 실제 화면들
  const grab=k=>{const t=document.body.innerText; res.screens[k]=(t.match(new RegExp('.{0,30}('+BAD.source+').{0,30}','g'))||[]).slice(0,6);};
  // 튜토리얼 11 · 14 단계
  G.Game.changeMap('dream_beach',null); p=G.Game.player; p.d.tut={step:10,flags:{},moved:0,started:true};
  await wait(500); G.Tutorial.shown=-1; G.Tutorial.render(); await wait(150); res.tut11=document.getElementById('tut')&&document.getElementById('tut').innerText.replace(/\n/g,' / '); grab('tut11');
  p.d.tut.step=13; G.Tutorial.shown=-1; G.Tutorial.render(); await wait(150); res.tut14=document.getElementById('tut')&&document.getElementById('tut').innerText.replace(/\n/g,' / '); grab('tut14');
  p.d.tut=null; G.Tutorial.hide(); G.Game.changeMap('sprout_port',null); await wait(300);
  for(const w of ['stat','inv','equip','quest','skill','menu']){ G.UI.openWin(w); await wait(200); grab('win:'+w); if(w==='menu') res.menuTitle=[...document.querySelectorAll('[data-arg="title"]')].map(e=>e.textContent); G.UI.closeWin(w); }
  // 대상 고르기 (각인서)
  G.UI.setTarget('scroll','scroll_100'); await wait(200); grab('target'); G.UI.clearTarget(); G.UI.closeWin('inv');
  // 퀘스트 대사 (루루 m01 · 촌장)
  G.Dialog.npc='lulu'; G.Dialog.show({text:G.QUESTS.m01 && (G.QUESTS.m01.end && (G.QUESTS.m01.lines||{}).end||['(TIP: S 키로 스탯창을 열어 능력 포인트를 배분해 봐!)'])[0]||'(TIP: S 키로 스탯창을 열어 능력 포인트를 배분해 봐!)',opts:[{label:'확인',fn:()=>G.Dialog.close()}]});
  await wait(200); res.dialog=document.getElementById('dialog')&&document.getElementById('dialog').innerText.slice(0,160).replace(/\n/g,' / '); grab('dialog'); G.Dialog.close();
  res.logSample=logAll.split('\n').filter(l=>/스탯 버튼|스킬 버튼|조작 안내|두 번 탭|▲ 버튼|공격 버튼|장비 버튼|S 키|K 키|F1/.test(l)).slice(0,8);
  return res;},[STR,fs.readFileSync('boss/dump/warrior_a_cult_factory.json','utf8')]);
 console.log('=====',name,'touch',r.touch,'| 원본 글',STR.length,'곳 중 바꾼 뒤 남은 것',r.strLeft.length);
 if(r.strLeft.length) console.log(r.strLeft.join('\n'));
 console.log('tut11:',r.tut11); console.log('tut14:',r.tut14); console.log('dialog:',r.dialog); console.log('menu title:',r.menuTitle);
 console.log('화면에 남은 키 글:',JSON.stringify(r.screens)); console.log('로그 예:',r.logSample.join(' | ')); console.log('errs',errs);
 await pg.screenshot({path:'key_'+name+'.png'}); await pg.context().close();}
await b.close();})();
