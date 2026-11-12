'use strict';
// ============================================================
// 1번 꾸미기: 사용자가 준 남자 머리 코드 3종 (머리 부분만 씀, 얼굴 · 몸 함수는 쓰지 않음)
//  ⓐ 내추럴 댄디컷 (DandyCut) · ⓑ 부드러운 가르마컷 V7 (SoftPartCutV7) · ⓒ 반묶음 V4 (HalfUpFine)
//  원본: docs/drafts/design/male_hair/user_code/ · 우리 머리에 맞추는 값은 head2.js 의 EXT_TOP · EXT_W
// ============================================================
/*
 * Natural Dandy Cut / 내추럴 댄디컷 (2D mobile RPG, 2-head chibi)
 * Pure HTML5 Canvas 2D: vector paths, gradients, clipping, independent locks.
 * No image files, sprites or external libraries.
 *
 * Head-local datum: eye centers at (-37, 55), (37, 55).  Hair fringe
 * tips mostly stay above 57; face/body have their own adjustable drawing.
 *
 * Public API:
 *   DandyCut.draw(ctx, x, y, scale, {hair:'#855735', debug:false})
 *   DandyCut.drawHair(ctx, x, y, scale, {hair:'#855735'})  // hair only
 *   DandyCut.paths  // path strings, editable
 */
(function(root) {
 'use strict';
 const PATHS={
   behind: [
     // Lateral silhouette behind ears, with asymmetric outer points.
     'M -101 15 C -119 -15 -109 -75 -74 -102 C -47 -121 12 -127 59 -106 C 89 -93 110 -57 106 -12 Q 112 12 118 26 Q 111 43 96 49 Q 97 72 81 85 Q 68 88 58 73 L -57 80 Q -80 92 -95 70 Q -110 70 -101 40 Z',
     'M -94 5 C -111 24 -119 54 -102 72 Q -95 82 -75 76 Q -82 62 -76 36 Z',
     'M 91 3 C 119 20 119 51 104 63 Q 113 67 120 60 Q 118 81 93 84 Q 79 79 80 56 Z'
   ],
   // Distinct top volume, not merely one generic oval shared with other cuts.
   crown: 'M -110 -36 C -113 -67 -84 -111 -30 -120 C -12 -137 24 -139 50 -124 C 69 -121 85 -108 97 -89 C 108 -67 109 -38 105 -10 Q 116 -1 128 1 Q 113 20 99 16 Q 98 47 89 62 L 72 52 Q 61 32 47 14 L -59 28 Q -79 51 -95 57 Q -109 37 -107 16 Z',
   // Crown undercoat: warm volume mass inside outer boundary.
   crownVolume: 'M -99 -39 C -93 -91 -50 -117 -5 -123 C 27 -131 71 -112 90 -82 Q 104 -53 97 -28 Q 68 -69 37 -78 Q -2 -93 -41 -60 Q -73 -32 -99 -20 Z',
   // Structured overlapping hair clumps, in painter order, rather than triangular fringe end-points.
   leftBackLocks:[
      'M -46 -108 C -83 -104 -106 -74 -108 -43 Q -113 -9 -133 -9 Q -115 15 -81 1 C -54 -11 -42 -32 -25 -67 Z',
      'M -82 -58 C -103 -36 -111 -13 -126 -8 Q -116 25 -72 19 C -48 12 -24 -10 -9 -38 C -40 -24 -55 -38 -82 -58 Z',
      'M -98 -18 C -107 7 -109 23 -115 41 Q -103 51 -81 38 Q -50 28 -39 -8 Z'
   ],
   rightBackLocks:[
      'M 75 -95 C 101 -83 109 -57 104 -32 Q 108 -1 133 3 Q 118 23 95 18 Q 93 -9 73 -27 Z',
      'M 96 -13 Q 115 20 107 44 Q 98 64 84 66 Q 68 58 61 29 L 74 -30 Z'
   ],
   topSweep:[
      'M 15 -124 C -16 -141 -54 -130 -85 -107 Q -111 -91 -119 -63 C -92 -70 -59 -87 -35 -101 C -18 -109 7 -109 27 -99 Q 31 -114 15 -124 Z',
      'M 55 -120 C 30 -135 -11 -124 -37 -114 Q -74 -99 -92 -76 C -105 -57 -117 -27 -129 -18 Q -114 -9 -93 -20 C -52 -35 -31 -70 -2 -84 Q 29 -99 47 -84 Q 69 -97 55 -120 Z'
   ],
   fringe: [
     // Backward-swept airy left clump, tip opens around temple.
     'M -16 -96 C -47 -93 -75 -67 -90 -32 C -98 -12 -120 11 -125 13 Q -100 15 -78 3 C -53 -12 -42 -42 -17 -52 Q 2 -61 7 -78 Z',
     // Sweeping left fringe: thin at root, widens then tapers naturally toward cheek.
     'M 10 -112 C -18 -112 -50 -87 -68 -50 C -78 -26 -81 4 -93 27 Q -76 36 -54 24 C -24 8 -15 -24 5 -52 Q 21 -80 33 -91 Z',
     // Main broad asymmetric fringe which reaches eyebrow, but not whole eye.
     'M 40 -104 C 17 -115 -7 -100 -22 -76 C -36 -54 -43 -12 -58 36 Q -51 48 -36 42 C -9 30 6 -2 19 -37 Q 30 -72 49 -75 Z',
     // Forehead left of part, gently rounded instead of a rigid spike.
     'M 54 -98 C 37 -107 26 -103 12 -86 C -7 -66 -13 -32 -18 9 Q -20 42 -34 51 Q -10 62 6 45 C 24 27 26 -8 38 -38 Q 48 -63 64 -69 Z',
     // Central secondary fringe leaves a small skin gap between the eye region.
     'M 66 -100 C 48 -113 37 -98 31 -78 Q 25 -48 26 -13 C 26 10 24 28 12 47 Q 35 52 47 35 Q 58 14 56 -20 Q 53 -55 74 -67 Z',
     // Rightmost fringe stays near edge of outer right eye.
     'M 82 -93 C 63 -109 54 -85 57 -59 Q 68 -18 68 22 Q 68 49 81 62 Q 95 53 95 29 Q 98 -13 87 -48 Z'
   ],
   detail: [
     // Brown inter-lock creases in hair flow.
     'M -87 -51 Q -55 -91 -10 -106',
     'M -109 -16 Q -74 -26 -43 -60',
     'M -66 3 Q -37 -16 -25 -62',
     'M -41 20 Q -13 -13 -2 -68',
     'M 4 26 Q 19 -11 24 -62',
     'M 46 10 Q 47 -24 45 -68',
     'M 77 20 Q 77 -24 69 -69',
     'M 96 -40 Q 111 -4 110 21'
   ],
   smallHighlights:[
      'M -70 -86 Q -48 -106 -23 -111',
      'M -78 -71 Q -68 -78 -61 -81',
      'M 3 -100 Q 12 -107 22 -108',
      'M 39 -79 Q 44 -80 48 -77',
      'M 69 -78 Q 75 -76 78 -69'
   ]
 };
 const colorClamp=n=>Math.round(Math.min(255,Math.max(0,n)));
 function rgb(hex){const s=hex.replace('#','');const v=s.length===3?s.split('').map(x=>x+x).join(''):s;return [0,2,4].map(i=>parseInt(v.slice(i,i+2),16));}
 function shade(hex,amount){const [r,g,b]=rgb(hex);return '#'+[r,g,b].map(c=>colorClamp(c+amount).toString(16).padStart(2,'0')).join('');}
 function alpha(hex,a){const [r,g,b]=rgb(hex);return `rgba(${r},${g},${b},${a})`;}
 function fill(ctx,d,paint,stroke=null,sw=2){const p=new Path2D(d);ctx.fillStyle=paint;ctx.fill(p);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.stroke(p)}return p;}
 function stroke(ctx,d,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.stroke(new Path2D(d));}
 function ellipse(ctx,x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();}
 function grad(ctx,x0,y0,x1,y1,stops){let g=ctx.createLinearGradient(x0,y0,x1,y1);stops.forEach(([t,c])=>g.addColorStop(t,c));return g;}
 function radial(ctx,x,y,r0,xx,yy,r1,stops){let g=ctx.createRadialGradient(x,y,r0,xx,yy,r1);stops.forEach(([t,c])=>g.addColorStop(t,c));return g;}
 function hairPaint(ctx,base,bounds,intensity=1){const [x0,y0,x1,y1]=bounds;return grad(ctx,x0,y0,x1,y1,[[0,shade(base,28*intensity)],[.29,shade(base,17*intensity)],[.67,base],[1,shade(base,-31*intensity)]]);}
 function drawBody(ctx){
   // 2-head SD model.  The body is a vector stand-in; swap this routine with game body renderer.
   ellipse(ctx,0,323,80,11,'rgba(5,10,25,.40)');
   // boots behind pants
   fill(ctx,'M -48 295 L -5 295 L -4 319 Q -5 326 -15 327 L -48 327 Q -57 324 -55 315 Z','#795a48','#42332d',2.6);
   fill(ctx,'M 7 295 L 49 295 L 56 313 Q 59 324 48 327 L 14 327 Q 5 325 7 316 Z','#795a48','#42332d',2.6);
   // pants
   fill(ctx,'M -52 229 L 55 229 L 53 304 Q 28 310 7 302 L 4 251 L -1 251 L -4 303 Q -34 310 -52 302 Z',grad(ctx,-40,230,45,315,[[0,'#5a533d'],[.54,'#726549'],[1,'#493f32']]),'#352c27',3);
   // Shirt arms and torso (behind vest)
   fill(ctx,'M -57 139 C -79 140 -84 154 -82 176 L -83 226 Q -83 243 -68 244 Q -52 244 -52 226 L -48 172 L 48 172 L 55 227 Q 55 244 72 243 Q 83 243 82 227 L 81 174 Q 79 139 56 138 Z',grad(ctx,-85,130,86,218,[[0,'#fff2df'],[.52,'#f2eadb'],[1,'#c7b9a2']]),'#705a4d',2.8);
   // neck
   fill(ctx,'M -19 130 L 19 130 L 18 153 Q 0 167 -20 153 Z','#f6d5bb','#aa7f6e',2);
   // vest
   fill(ctx,'M -51 150 Q -30 139 -6 143 L -6 232 L -49 232 Z',grad(ctx,-52,166,-2,232,[[0,'#9f6d42'],[.46,'#815233'],[1,'#65432e']]),'#5a3c32',2.4);
   fill(ctx,'M 7 143 Q 31 138 53 150 L 50 232 L 7 232 Z',grad(ctx,7,142,57,230,[[0,'#faf2dd'],[.70,'#ddcfb5'],[1,'#b9a88c']]),'#6d5b4e',2.1);
   fill(ctx,'M -6 143 L 6 143 L 6 234 L -6 234 Z','#f3e6d0','#b59b86',1);
   ellipse(ctx,18,175,3.5,3.5,'#986b4e'); ellipse(ctx,18,205,3.5,3.5,'#986b4e');
   fill(ctx,'M -51 229 L 50 229 L 51 240 L -51 240 Z','#bea04c','#665331',1.5);
   fill(ctx,'M -7 228 L 8 228 L 8 242 L -7 242 Z','#edd27b','#9a7741',1.5);
   // hands
   ellipse(ctx,-74,244,13,14,'#ffdabd');ellipse(ctx,73,244,13,14,'#ffdabd');
   ellipse(ctx,-77,241,4.3,6.3,'rgba(255,255,255,.45)'); ellipse(ctx,70,240,4,6,'rgba(255,255,255,.45)');
 }
 function drawFace(ctx){
   // Big, horizontally broad face like user's character, with ears under hair.
   ellipse(ctx,-85,57,12,19,'#f4c5a7');ellipse(ctx,85,57,12,19,'#f4c5a7');
   fill(ctx,'M -84 -5 C -92 16 -93 61 -85 84 Q -69 121 -12 133 Q 5 135 23 131 Q 73 117 88 86 Q 97 55 88 13 Q 71 -22 7 -29 Q -62 -28 -84 -5 Z',
     grad(ctx,-60,-9,35,130,[[0,'#fff3db'],[.36,'#ffe5cc'],[.83,'#fbd3b6'],[1,'#efbba7']]),'#a77867',2.8);
   // central face soft highlight
   ellipse(ctx,-28,36,24,18,'rgba(255,255,255,.11)');
   // eyebrows (only occasionally seen through bangs)
   ctx.lineCap='round';stroke(ctx,'M -63 29 Q -43 21 -25 26','#67483a',5.6);stroke(ctx,'M 25 26 Q 46 21 62 29','#67483a',5.6);
   // Eyes with slight asymmetry and deep blue gradient; at local y=61.
   for(const sign of [-1,1]){
     const ex=sign*37,ey=62;
     // lash shape
     fill(ctx,`M ${ex-27} ${ey-9} Q ${ex-13} ${ey-25} ${ex+5} ${ey-22} Q ${ex+26} ${ey-20} ${ex+26} ${ey-3} L ${ex+21} ${ey+13} Q ${ex-1} ${ey+23} ${ex-24} ${ey+7} Z`, '#49372f');
     ellipse(ctx,ex,ey+3,23,26,'#fff8f5');
     let iris=grad(ctx,ex,ey-22,ex,ey+29,[[0,'#163761'],[.25,'#3778b3'],[.76,'#62a4e0'],[1,'#90c8ea']]);
     ellipse(ctx,ex,ey+5,17,24,iris);
     ellipse(ctx,ex,ey+2,10,17,'#172d50');
     ellipse(ctx,ex-7,ey-9,6.5,8,'#fff');
     ellipse(ctx,ex+10,ey+18,3,3.8,'rgba(255,255,255,.92)');
     // lid draws clean upper silhouette without heavy lower outline
     ctx.lineCap='round';stroke(ctx,`M ${ex-23} ${ey-11} Q ${ex-5} ${ey-27} ${ex+21} ${ey-12}`,'#4c352d',4.4);
   }
   ellipse(ctx,-67,100,19,8,'rgba(241,136,157,.43)');ellipse(ctx,65,100,19,8,'rgba(241,136,157,.43)');
   // two small center highlights + mouth
   ctx.lineCap='round';stroke(ctx,'M -11 113 Q 0 125 12 113','#a45158',4.3);
 }
 function drawBackHair(ctx,p){
   const base=p.hair,edge=shade(base,-53),under=shade(base,-35);
   fill(ctx,PATHS.behind[0],hairPaint(ctx,base,[-86,-126,85,91]),edge,4.2);
   fill(ctx,PATHS.behind[1],grad(ctx,-100,-40,-81,89,[[0,shade(base,6)],[1,under]]),edge,2.9);
   fill(ctx,PATHS.behind[2],grad(ctx,88,-43,106,87,[[0,base],[1,under]]),edge,2.9);
 }
 function drawCrown(ctx,p){
   const base=p.hair,edge=shade(base,-54);
   fill(ctx,PATHS.crown,hairPaint(ctx,base,[-110,-127,115,66]),edge,4.2);
   fill(ctx,PATHS.crownVolume,radial(ctx,-41,-104,1,-21,-83,142,[[0,alpha(shade(base,55),.65)],[.5,alpha(shade(base,23),.27)],[1,'rgba(255,255,255,0)']]),null,0);
 }
 function drawLock(ctx,d,p,i,total,kind){
   const base=p.hair,edge=shade(base,-56);
   const colors={left:[15,-7],right:[1,-8],sweep:[15,-4],fringe:[10,-12]};
   const [lightAdd,darkAdd]=colors[kind];
   const sign=(i%2?1:-1), x0=kind==='fringe'? -69+i*20:-83+i*25;
   const g=grad(ctx,x0-25,-110,x0+38,60,[[0,shade(base,24+lightAdd+sign*3)], [.29,shade(base,15+lightAdd)], [.65,shade(base,-5+darkAdd+sign*5)], [1,shade(base,-24)]]);
   ctx.save();ctx.shadowColor='rgba(28,12,10,.18)';ctx.shadowBlur=2.0;ctx.shadowOffsetY=2.5;
   const path=fill(ctx,d,g,edge,3);ctx.restore();
   // single subtle satin highlight, clipped to this clump, and shadow contour on one side
   ctx.save();ctx.clip(path);
   const hl=radial(ctx,x0-7,-72,1,x0+12,-56,80,[[0,'rgba(255,225,188,.25)'],[.5,'rgba(255,211,166,.07)'],[1,'rgba(255,255,255,0)']]);
   ctx.fillStyle=hl;ctx.fillRect(-150,-140,300,220);
   ctx.restore();
 }
 function drawFrontHair(ctx,p){
   const base=p.hair,edge=shade(base,-56),mid=shade(base,-26);
   drawCrown(ctx,p);
   PATHS.leftBackLocks.forEach((d,i)=>drawLock(ctx,d,p,i,3,'left'));
   PATHS.rightBackLocks.forEach((d,i)=>drawLock(ctx,d,p,i,2,'right'));
   PATHS.topSweep.forEach((d,i)=>drawLock(ctx,d,p,i,2,'sweep'));
   PATHS.fringe.forEach((d,i)=>drawLock(ctx,d,p,i,6,'fringe'));
   // Low-contrast fiber lines.  Short lines bend with flow; no long sharp vertical strings.
   ctx.lineCap='round';ctx.lineJoin='round';
   for(let i=0;i<PATHS.detail.length;i++){
      stroke(ctx,PATHS.detail[i],alpha(mid,i%3===0?.57:.40),2.35);
   }
   // Overall top-left soft sheet-gloss, masked to crown and strand silhouette, not a huge white stripe.
   ctx.save();ctx.clip(new Path2D(PATHS.crown));
   ctx.fillStyle=radial(ctx,-42,-85,4,-22,-87,77,[[0,'rgba(255,235,211,.22)'],[.5,'rgba(255,231,204,.10)'],[1,'rgba(255,239,209,0)']]);
   ctx.fillRect(-140,-142,290,150);ctx.restore();
   // Sparse, subtle light reflections that follow the style.
   for(let i=0;i<PATHS.smallHighlights.length;i++){
      stroke(ctx,PATHS.smallHighlights[i],`rgba(255,225,201,${i===0?.33:.18})`,i===0?8:4);
   }
 }
 function drawHair(ctx,x,y,scale=1,opts={}){
   const p={hair:'#8b603f',...opts};ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
   drawBackHair(ctx,p);drawFrontHair(ctx,p);ctx.restore();
 }
 function draw(ctx,x,y,scale=1,opts={}){
   const p={hair:'#8b603f',debug:false,...opts};
   ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
   ctx.lineJoin='round';ctx.lineCap='round';
   drawBackHair(ctx,p);
   drawBody(ctx);
   drawFace(ctx);
   drawFrontHair(ctx,p);
   if(p.debug)drawGuide(ctx);
   ctx.restore();
 }
 function drawGuide(ctx){
   ctx.save();ctx.lineWidth=1;ctx.strokeStyle='rgba(68,214,232,.63)';ctx.setLineDash([4,5]);
   ctx.beginPath();ctx.moveTo(-130,62);ctx.lineTo(131,62);ctx.moveTo(-130,32);ctx.lineTo(131,32);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle='#56d9e3';ctx.font='11px sans-serif';ctx.fillText('눈 중심 y=62',-128,74);ctx.fillText('눈썹 y≈26',-128,20);ctx.restore();
 }
 function drawBack(ctx,x,y,scale=1,opts={}){
   const p={hair:'#8b603f',...opts};ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
   drawBackHair(ctx,p);ctx.restore();
 }
 function drawFront(ctx,x,y,scale=1,opts={}){
   const p={hair:'#8b603f',...opts};ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
   drawFrontHair(ctx,p);ctx.restore();
 }
 root.DandyCut={draw,drawHair,drawBack,drawFront,paths:PATHS,shade};
})(typeof window!=='undefined'?window:globalThis);

/* Soft Part Cut (부드러운 가르마컷) - precise Canvas implementation
 * Pure Canvas 2D, no external images.
 * API:
 *   SoftPartCut.draw(ctx, x, y, scale, { hair:'#8b603f' });
 *   SoftPartCut.drawBack(ctx, x, y, scale, { hair });
 *   SoftPartCut.drawFront(ctx, x, y, scale, { hair });
 */
(function(root){'use strict';
  const clamp=n=>Math.round(Math.min(255,Math.max(0,n)));
  function rgb(hex){const s=hex.replace('#','');const v=s.length===3?s.split('').map(x=>x+x).join(''):s;return [0,2,4].map(i=>parseInt(v.slice(i,i+2),16));}
  function shade(hex,amount){const [r,g,b]=rgb(hex);return '#'+[r,g,b].map(c=>clamp(c+amount).toString(16).padStart(2,'0')).join('');}
  function alpha(hex,a){const [r,g,b]=rgb(hex);return `rgba(${r},${g},${b},${a})`;}
  function fill(ctx,d,paint,stroke=null,sw=2){const p=new Path2D(d);ctx.fillStyle=paint;ctx.fill(p);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.stroke(p);}return p;}
  function stroke(ctx,d,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.stroke(new Path2D(d));}
  function ellipse(ctx,x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  function grad(ctx,x0,y0,x1,y1,stops){const g=ctx.createLinearGradient(x0,y0,x1,y1);stops.forEach(([t,c])=>g.addColorStop(t,c));return g;}
  function radial(ctx,x,y,r0,xx,yy,r1,stops){const g=ctx.createRadialGradient(x,y,r0,xx,yy,r1);stops.forEach(([t,c])=>g.addColorStop(t,c));return g;}

  function drawBody(ctx){
    ellipse(ctx,0,323,80,11,'rgba(5,10,25,.40)');
    fill(ctx,'M -48 295 L -5 295 L -4 319 Q -5 326 -15 327 L -48 327 Q -57 324 -55 315 Z','#795a48','#42332d',2.6);
    fill(ctx,'M 7 295 L 49 295 L 56 313 Q 59 324 48 327 L 14 327 Q 5 325 7 316 Z','#795a48','#42332d',2.6);
    fill(ctx,'M -52 229 L 55 229 L 53 304 Q 28 310 7 302 L 4 251 L -1 251 L -4 303 Q -34 310 -52 302 Z',grad(ctx,-40,230,45,315,[[0,'#5a533d'],[.54,'#726549'],[1,'#493f32']]),'#352c27',3);
    fill(ctx,'M -57 139 C -79 140 -84 154 -82 176 L -83 226 Q -83 243 -68 244 Q -52 244 -52 226 L -48 172 L 48 172 L 55 227 Q 55 244 72 243 Q 83 243 82 227 L 81 174 Q 79 139 56 138 Z',grad(ctx,-85,130,86,218,[[0,'#fff2df'],[.52,'#f2eadb'],[1,'#c7b9a2']]),'#705a4d',2.8);
    fill(ctx,'M -19 130 L 19 130 L 18 153 Q 0 167 -20 153 Z','#f6d5bb','#aa7f6e',2);
    fill(ctx,'M -51 150 Q -30 139 -6 143 L -6 232 L -49 232 Z',grad(ctx,-52,166,-2,232,[[0,'#9f6d42'],[.46,'#815233'],[1,'#65432e']]),'#5a3c32',2.4);
    fill(ctx,'M 7 143 Q 31 138 53 150 L 50 232 L 7 232 Z',grad(ctx,7,142,57,230,[[0,'#faf2dd'],[.70,'#ddcfb5'],[1,'#b9a88c']]),'#6d5b4e',2.1);
    fill(ctx,'M -6 143 L 6 143 L 6 234 L -6 234 Z','#f3e6d0','#b59b86',1);
    ellipse(ctx,18,175,3.5,3.5,'#986b4e'); ellipse(ctx,18,205,3.5,3.5,'#986b4e');
    fill(ctx,'M -51 229 L 50 229 L 51 240 L -51 240 Z','#bea04c','#665331',1.5);
    fill(ctx,'M -7 228 L 8 228 L 8 242 L -7 242 Z','#edd27b','#9a7741',1.5);
    ellipse(ctx,-74,244,13,14,'#ffdabd'); ellipse(ctx,73,244,13,14,'#ffdabd');
    ellipse(ctx,-77,241,4.3,6.3,'rgba(255,255,255,.45)'); ellipse(ctx,70,240,4,6,'rgba(255,255,255,.45)');
  }

  function drawFace(ctx){
    ellipse(ctx,-85,57,12,19,'#f4c5a7'); ellipse(ctx,85,57,12,19,'#f4c5a7');
    fill(ctx,'M -84 -5 C -92 16 -93 61 -85 84 Q -69 121 -12 133 Q 5 135 23 131 Q 73 117 88 86 Q 97 55 88 13 Q 71 -22 7 -29 Q -62 -28 -84 -5 Z', grad(ctx,-60,-9,35,130,[[0,'#fff3db'],[.36,'#ffe5cc'],[.83,'#fbd3b6'],[1,'#efbba7']]), '#a77867', 2.8);
    ellipse(ctx,-28,36,24,18,'rgba(255,255,255,.11)');
    ctx.lineCap='round';
    stroke(ctx,'M -63 29 Q -43 21 -25 26','#67483a',5.6);
    stroke(ctx,'M 25 26 Q 46 21 62 29','#67483a',5.6);
    for(const sign of [-1,1]){
      const ex=sign*37, ey=62;
      fill(ctx,`M ${ex-27} ${ey-9} Q ${ex-13} ${ey-25} ${ex+5} ${ey-22} Q ${ex+26} ${ey-20} ${ex+26} ${ey-3} L ${ex+21} ${ey+13} Q ${ex-1} ${ey+23} ${ex-24} ${ey+7} Z`, '#49372f');
      ellipse(ctx,ex,ey+3,23,26,'#fff8f5');
      const iris=grad(ctx,ex,ey-22,ex,ey+29,[[0,'#163761'],[.25,'#3778b3'],[.76,'#62a4e0'],[1,'#90c8ea']]);
      ellipse(ctx,ex,ey+5,17,24,iris);
      ellipse(ctx,ex,ey+2,10,17,'#172d50');
      ellipse(ctx,ex-7,ey-9,6.5,8,'#fff');
      ellipse(ctx,ex+10,ey+18,3,3.8,'rgba(255,255,255,.92)');
      stroke(ctx,`M ${ex-23} ${ey-11} Q ${ex-5} ${ey-27} ${ex+21} ${ey-12}`,'#4c352d',4.4);
    }
    ellipse(ctx,-67,100,19,8,'rgba(241,136,157,.43)'); ellipse(ctx,65,100,19,8,'rgba(241,136,157,.43)');
    stroke(ctx,'M -11 113 Q 0 125 12 113','#a45158',4.3);
  }


  // Hair coordinates are relative to the FACE center; eyes are at y = +62.
  // Every individual swept lock is an independently drawn Bezier path.
  const HAIR = {
    back: `M -102 -33 C -118 -78 -88 -127 -39 -140 C -15 -151 5 -147 19 -143
      C 60 -149 97 -124 114 -86 C 130 -51 118 -20 132 -11
      C 139 0 124 15 111 19 C 125 32 114 47 94 51
      C 115 76 92 87 74 72 C 54 79 37 77 26 68
      C -2 84 -38 78 -54 70 C -82 91 -105 73 -101 57
      C -122 53 -137 33 -119 16 C -128 -5 -111 -19 -102 -33 Z`,
    crown: `M -112 -48 C -122 -91 -90 -130 -42 -145 C -16 -156 -1 -154 17 -148
      C 64 -154 101 -127 117 -89 C 135 -56 119 -21 130 -6
      C 118 9 107 6 102 13 C 92 23 73 11 64 4
      C 38 -9 13 -6 -5 -1 C -34 -4 -57 10 -80 20
      C -105 31 -123 16 -121 -5 C -131 -24 -118 -36 -112 -48 Z`,
    // Outer back locks frame ears, underneath the face layer.
    napeLeft:`M -100 -38 C -122 -2 -134 27 -119 46 C -110 59 -98 62 -90 55 C -91 74 -73 78 -58 56 L -54 19 Z`,
    napeRight:`M 93 -46 C 124 -24 134 4 126 22 C 133 37 124 50 110 49 C 115 71 99 77 82 61 L 62 16 Z`,
    crownSweepLeft:`M 10 -146 C -16 -160 -54 -145 -83 -128
      C -106 -112 -118 -83 -117 -47 C -111 -63 -96 -80 -75 -92
      C -48 -104 -16 -116 10 -146 Z`,
    crownSweepRight:`M 18 -145 C 57 -155 92 -137 112 -104
      C 124 -86 130 -60 119 -41 C 106 -59 90 -86 65 -105
      C 45 -122 30 -137 18 -145 Z`,
    // Lower silhouette tufts that are not symmetric and not regular triangles.
    rearSideLeft:`M -106 -60 C -130 -33 -127 -8 -140 -9 C -135 4 -124 8 -111 3
      C -129 20 -123 37 -107 38 C -84 35 -65 19 -56 1 L -69 -69 Z`,
    rearSideRight:`M 93 -86 C 121 -80 139 -49 139 -24 C 130 -14 117 -16 110 -21
      C 134 2 130 18 110 18 C 115 40 96 41 83 28 L 64 -61 Z`,
    // Center is covered by overlapping curved bangs; no exposed forehead gap.
    leftFull:`M 5 -145 C -14 -153 -47 -146 -74 -130 C -106 -112 -120 -83 -129 -58
      C -136 -44 -145 -29 -153 -26 C -150 -8 -124 -8 -102 -25
      C -91 -7 -112 1 -122 1 C -111 22 -86 19 -72 4
      C -58 -8 -52 -28 -43 -44 C -24 -76 -10 -105 5 -145 Z`,
    leftMiddle:`M -11 -133 C -37 -136 -69 -111 -84 -92
      C -98 -75 -100 -51 -114 -32 C -96 -26 -79 -39 -66 -55
      C -51 -72 -28 -105 -11 -133 Z`,
    leftInner:`M -5 -142 C -24 -132 -40 -110 -49 -87
      C -58 -59 -62 -42 -76 -17 C -85 1 -90 20 -78 25
      C -58 29 -48 11 -39 -8 C -30 -33 -25 -59 -18 -87
      C -13 -109 -9 -126 -5 -142 Z`,
    // Right side flows down and OUT from the part; delicate swirl near the eye.
    rightFull:`M 17 -144 C 47 -152 78 -139 99 -117
      C 114 -103 129 -80 127 -58 C 128 -31 143 -18 153 -15
      C 141 1 120 1 99 -16 C 109 5 133 10 139 7
      C 124 26 105 25 89 14 C 68 -5 55 -35 44 -64
      C 34 -91 23 -121 17 -144 Z`,
    rightOuter:`M 35 -132 C 66 -134 99 -108 112 -87
      C 117 -67 114 -45 127 -31 C 114 -22 100 -29 88 -47
      C 76 -74 54 -113 35 -132 Z`,
    rightInner:`M 27 -143 C 45 -132 59 -113 64 -91
      C 71 -65 68 -48 73 -28 C 81 -7 82 9 65 21
      C 46 32 35 12 33 -4 C 29 -23 28 -44 28 -66
      C 28 -98 26 -121 27 -143 Z`,
    rightLower:`M 76 -62 C 104 -58 121 -38 120 -16
      C 133 3 129 29 107 31 C 96 31 87 22 80 9
      C 90 -12 85 -36 76 -62 Z`,
    leftLower:`M -100 -54 C -119 -36 -121 -11 -129 5
      C -133 16 -144 20 -151 19 C -137 33 -117 29 -103 19
      C -98 41 -80 43 -66 29 L -72 0 Z`,
    // Individual highlight strokes, kept INSIDE locks (not one broad horizontal band).
    detailStrokes:[
      'M -102 -83 C -90 -112 -55 -131 -28 -131',
      'M -94 -65 C -79 -100 -53 -118 -35 -123',
      'M -68 -48 C -57 -81 -36 -113 -17 -126',
      'M -44 -66 C -30 -91 -14 -116 -3 -130',
      'M 50 -117 C 73 -113 96 -91 106 -67',
      'M 40 -99 C 57 -78 65 -52 68 -33',
      'M 96 -57 C 110 -39 111 -23 111 -15',
    ]
  };

  function paintPath(ctx,path,opts){
    const {base,brightness=0,top=-140,bottom=38,edge=-43,outline=2.9,glaze=0.24,shineX=-30,shadow=0} = opts;
    const p=new Path2D(path);
    ctx.save();
    ctx.lineJoin='round';
    if(shadow){ctx.shadowColor='rgba(40,16,11,.28)';ctx.shadowBlur=shadow;ctx.shadowOffsetY=1.8;}
    ctx.fillStyle=grad(ctx,-75,top,74,bottom,[[0,shade(base,35+brightness)],[.26,shade(base,18+brightness)],[.6,shade(base,brightness-3)],[1,shade(base,-27+brightness)]]);
    ctx.fill(p);
    ctx.restore();
    if(outline){ctx.lineWidth=outline;ctx.strokeStyle=shade(base,edge);ctx.stroke(p);}
    if(glaze){
      ctx.save();ctx.clip(p);
      ctx.fillStyle=radial(ctx,shineX,-100,1,shineX+13,-90,125,[[0,`rgba(255,229,194,${glaze})`],[.46,'rgba(255,220,190,.055)'],[1,'rgba(255,232,200,0)']]);
      ctx.fillRect(-170,-175,340,260);
      ctx.restore();
    }
  }

  function hairBack(ctx,color){
    paintPath(ctx,HAIR.napeLeft,{base:color,brightness:-25,edge:-52});
    paintPath(ctx,HAIR.napeRight,{base:color,brightness:-25,edge:-52});
    paintPath(ctx,HAIR.back,{base:color,brightness:-21,top:-150,bottom:90,edge:-63,outline:3.6,glaze:.13});
    paintPath(ctx,HAIR.rearSideLeft,{base:color,brightness:-15,edge:-57});
    paintPath(ctx,HAIR.rearSideRight,{base:color,brightness:-11,edge:-57});
  }

  function hairFront(ctx,color){
    paintPath(ctx,HAIR.crown,{base:color,top:-151,bottom:20,edge:-58,outline:4.2,glaze:.22,shineX:-50});
    paintPath(ctx,HAIR.crownSweepRight,{base:color,brightness:4,outline:1.3,edge:-39,glaze:.19,shineX:60});
    paintPath(ctx,HAIR.crownSweepLeft,{base:color,brightness:6,outline:1.2,edge:-40,glaze:.24,shineX:-50});
    // The center is filled with overlapping hair locks instead of a face-colored cutout.
    // A shallow part remains visible only in the direction of the flowing strands.

    // Outer and under locks first, front-most strands last.
    paintPath(ctx,HAIR.leftLower,{base:color,brightness:-12,top:-80,bottom:60,edge:-54,glaze:.09});
    paintPath(ctx,HAIR.rightLower,{base:color,brightness:-11,top:-90,bottom:44,edge:-54,glaze:.12});
    paintPath(ctx,HAIR.rightOuter,{base:color,brightness:3,edge:-45,outline:2.3,glaze:.22,shineX:65});
    paintPath(ctx,HAIR.leftFull,{base:color,brightness:8,edge:-48,outline:3.3,glaze:.27,shineX:-70,shadow:2.5});
    paintPath(ctx,HAIR.rightFull,{base:color,brightness:5,edge:-49,outline:3.0,glaze:.26,shineX:53,shadow:2.5});
    // Close the forehead opening with two gently overlapping central fringe layers.
    // Ends stop above the upper eyelids to keep the eyes readable at 64px.
    paintPath(ctx,`M -7 -139 C -19 -126 -28 -109 -27 -89
      C -28 -65 -18 -35 -15 -10 C -13 4 -10 15 -5 22
      C 3 16 7 4 9 -11 C 13 -32 12 -65 6 -91
      C 3 -112 -2 -126 -7 -139 Z`,
      {base:color,brightness:3,top:-140,bottom:35,edge:-47,outline:2.1,glaze:.17,shineX:-12});
    paintPath(ctx,`M 20 -138 C 35 -126 40 -108 36 -83
      C 33 -59 27 -30 23 -8 C 21 4 19 15 13 25
      C 7 17 5 7 7 -12 C 8 -35 9 -69 12 -94
      C 14 -111 17 -128 20 -138 Z`,
      {base:color,brightness:-2,top:-141,bottom:35,edge:-52,outline:2,glaze:.14,shineX:18});
    paintPath(ctx,HAIR.leftMiddle,{base:color,brightness:8,edge:-45,outline:2.1,glaze:.15,shineX:-78});
    paintPath(ctx,HAIR.rightInner,{base:color,brightness:-6,edge:-55,outline:3,glaze:.17,shineX:42,shadow:3});
    paintPath(ctx,HAIR.leftInner,{base:color,brightness:-2,edge:-51,outline:2.8,glaze:.14,shineX:-28,shadow:2.5});
    // Curving strands: understated darker grooves (not straight parallel bars).
    for(let i=0;i<HAIR.detailStrokes.length;i++){
      ctx.strokeStyle=alpha(shade(color,-41), i%2?0.22:0.29);
      ctx.lineCap='round';ctx.lineWidth=i%2?1.8:2.4;
      ctx.stroke(new Path2D(HAIR.detailStrokes[i]));
    }
    // Small, curved specular reflections constrained to natural hair curvature.
    ctx.strokeStyle='rgba(255,231,200,.23)'; ctx.lineWidth=6;ctx.lineCap='round';
    ctx.stroke(new Path2D('M -99 -103 C -83 -124 -58 -133 -35 -139'));
    ctx.lineWidth=3.3;ctx.strokeStyle='rgba(255,241,218,.18)';
    ctx.stroke(new Path2D('M -92 -94 C -75 -115 -53 -125 -35 -130'));
    ctx.stroke(new Path2D('M 54 -134 C 77 -123 94 -107 103 -89'));
    // Several short translucent strokes emphasize swept volume, not flat vertical spikes.
    ctx.lineWidth=3;ctx.strokeStyle='rgba(250,220,184,.18)';
    ctx.stroke(new Path2D('M -96 -79 C -81 -104 -66 -116 -52 -121'));
    ctx.stroke(new Path2D('M -75 -31 C -58 -59 -45 -88 -27 -111'));
    ctx.stroke(new Path2D('M 64 -106 C 83 -94 96 -72 100 -52'));
  }

  function transformed(ctx,x,y,scale,fn){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';fn();ctx.restore();}
  function draw(ctx,x,y,scale=1,options={}){
    const color=options.hair||'#8b603f';
    transformed(ctx,x,y,scale,()=>{hairBack(ctx,color);drawBody(ctx);drawFace(ctx);hairFront(ctx,color);});
  }
  function drawBack(ctx,x,y,scale=1,options={}){transformed(ctx,x,y,scale,()=>hairBack(ctx,options.hair||'#8b603f'));}
  function drawFront(ctx,x,y,scale=1,options={}){transformed(ctx,x,y,scale,()=>hairFront(ctx,options.hair||'#8b603f'));}
  root.SoftPartCutV7={name:'Soft Natural Filled Fringe V7',draw,drawBack,drawFront};
})(typeof window!=='undefined'?window:globalThis);

/* Natural half-up hair / hair-strand geometry only; no bitmap assets.
   Coordinates relative to center of face, eye baseline y=63, full character height 440 units.
   Render by HalfUpFine.draw(ctx,x,y,scale,{hair:'#9a6137'}).
   For game integration: drawBack -> your body/face -> drawFront.
*/
(function(root){'use strict';
  const clamp=v=>Math.max(0,Math.min(255,Math.round(v)));
  function rgb(hex){const s=hex.replace('#','');const v=s.length===3?s.split('').map(c=>c+c).join(''):s;return [0,2,4].map(i=>parseInt(v.slice(i,i+2),16));}
  function shade(hex,n){const [r,g,b]=rgb(hex);return '#'+[r+n,g+n,b+n].map(clamp).map(v=>v.toString(16).padStart(2,'0')).join('');}
  function alpha(hex,a){const [r,g,b]=rgb(hex);return `rgba(${r},${g},${b},${a})`;}
  function grad(ctx,x0,y0,x1,y1,stops){const g=ctx.createLinearGradient(x0,y0,x1,y1);stops.forEach(([t,c])=>g.addColorStop(t,c));return g;}
  function radial(ctx,x0,y0,r0,x1,y1,r1,stops){const g=ctx.createRadialGradient(x0,y0,r0,x1,y1,r1);stops.forEach(([t,c])=>g.addColorStop(t,c));return g;}
  function fillPath(ctx,d,fill,stroke=null,lw=2){const p=new Path2D(d);ctx.fillStyle=fill;ctx.fill(p);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke(p);}return p;}
  function roundRect(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
  function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
  function strokePath(ctx,d,color,w=2){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.stroke(new Path2D(d));}

  function drawBody(ctx){
    ellipse(ctx,0,321,78,12,'rgba(2,8,26,.32)');
    // boots
    fillPath(ctx,'M -44 292 L -7 292 L -6 322 Q -8 330 -17 330 L -46 329 Q -53 325 -51 315 Z','#84614f','#4c372e',2.6);
    fillPath(ctx,'M 10 292 L 47 292 L 53 315 Q 55 324 46 329 L 16 330 Q 8 327 9 319 Z','#84614f','#4c372e',2.6);
    // pants
    fillPath(ctx,'M -50 226 L 52 226 L 50 300 Q 26 306 6 299 L 5 248 L -2 248 L -4 299 Q -31 305 -51 299 Z',grad(ctx,-30,225,40,305,[[0,'#6d6548'],[.55,'#85774f'],[1,'#5b5038']]),'#43382a',2.8);
    // shirt
    fillPath(ctx,'M -57 141 C -78 142 -83 155 -82 176 L -82 226 Q -82 243 -67 243 Q -52 243 -52 226 L -48 171 L 48 171 L 53 226 Q 53 243 69 243 Q 83 243 82 226 L 81 176 Q 80 141 56 140 Z',grad(ctx,-84,137,84,224,[[0,'#fff7e9'],[.54,'#f1e8d7'],[1,'#cdbda7']]),'#7c685a',2.5);
    fillPath(ctx,'M -17 131 L 17 131 L 17 152 Q 0 164 -17 152 Z','#f7d6bc','#ae8371',1.6);
    fillPath(ctx,'M -49 149 Q -29 139 -7 142 L -7 229 L -48 229 Z',grad(ctx,-50,145,-4,228,[[0,'#aa6f40'],[.5,'#925b34'],[1,'#76482a']]),'#644132',2.1);
    fillPath(ctx,'M 7 142 Q 29 138 50 148 L 48 229 L 8 229 Z',grad(ctx,8,142,55,228,[[0,'#fff7e9'],[.72,'#e4d4ba'],[1,'#c8b699']]),'#746253',1.8);
    fillPath(ctx,'M -7 142 L 8 142 L 8 232 L -7 232 Z','#f8ebd8','#c0ac91',1.2);
    fillPath(ctx,'M -50 228 L 49 228 L 49 240 L -50 240 Z','#d2ad3a','#886c1e',1.4);
    fillPath(ctx,'M -6 227 L 8 227 L 8 242 L -6 242 Z','#f6d667','#af8630',1.3);
    ellipse(ctx,18,175,3.5,3.5,'#9f7152'); ellipse(ctx,18,205,3.5,3.5,'#9f7152');
    ellipse(ctx,-73,244,12,14,'#ffd9bf'); ellipse(ctx,73,244,12,14,'#ffd9bf');
  }

  function drawFace(ctx){
    ellipse(ctx,-82,59,11,18,'#f4c3a5'); ellipse(ctx,82,59,11,18,'#f4c3a5');
    fillPath(ctx,'M -82 -6 C -90 17 -90 60 -83 84 Q -68 118 -12 130 Q 8 133 25 129 Q 70 117 85 85 Q 95 58 86 16 Q 69 -20 8 -27 Q -61 -28 -82 -6 Z',grad(ctx,-58,-4,35,127,[[0,'#fff5dd'],[.36,'#ffe4cb'],[.84,'#f9cfb1'],[1,'#efbaa6']]),'#a97967',2.6);
    ctx.lineCap='round';
    strokePath(ctx,'M -58 30 Q -42 22 -25 26','#6b4b3d',5.4);
    strokePath(ctx,'M 24 26 Q 42 22 58 30','#6b4b3d',5.4);
    for(const s of [-1,1]){
      const ex=s*35, ey=63;
      fillPath(ctx,`M ${ex-24} ${ey-8} Q ${ex-11} ${ey-22} ${ex+6} ${ey-20} Q ${ex+24} ${ey-18} ${ex+24} ${ey-2} L ${ex+18} ${ey+10} Q ${ex} ${ey+19} ${ex-21} ${ey+6} Z`, '#4b3932');
      ellipse(ctx,ex,ey+2,22,24,'#fffdfb');
      const iris=grad(ctx,ex,ey-18,ex,ey+24,[[0,'#1d4d85'],[.36,'#2d7dc1'],[.82,'#7fc8f0'],[1,'#9fe3ff']]);
      ellipse(ctx,ex,ey+4,15,21,iris);
      ellipse(ctx,ex,ey+2,8.6,14,'#15345d');
      ellipse(ctx,ex-6,ey-8,5.5,6.5,'rgba(255,255,255,.95)');
      ellipse(ctx,ex+8,ey+14,2.8,3.4,'rgba(255,255,255,.9)');
    }
    ellipse(ctx,-63,98,16,7,'rgba(241,137,158,.44)'); ellipse(ctx,63,98,16,7,'rgba(241,137,158,.44)');
    strokePath(ctx,'M -10 113 Q 0 124 12 113','#ad5761',4.2);
  }


  // Every visible strand has its own geometry (not drawn on a solid helmet silhouette).
  // Bands are hand-defined tapered Bezier paths, stacked from back to front.
  const rear=[
    'M -72 -33 C -91 -23 -102 10 -94 45 Q -91 64 -80 72 Q -76 49 -62 24 Q -58 -9 -72 -33 Z',
    'M -57 -37 C -75 -12 -82 24 -77 57 Q -71 78 -58 83 Q -59 49 -44 17 Q -38 -12 -57 -37 Z',
    'M 68 -34 C 91 -20 100 12 91 53 Q 86 75 75 77 Q 79 44 61 19 Q 57 -10 68 -34 Z',
    'M 55 -38 C 70 -23 84 11 75 49 Q 68 80 55 87 Q 63 49 47 16 Q 43 -14 55 -38 Z',
    'M -42 -43 Q -61 -11 -57 31 Q -52 56 -40 68 Q -43 25 -28 -14 Z',
    'M 37 -46 Q 56 -10 54 35 Q 51 63 39 72 Q 40 28 26 -14 Z'
  ];
  const pony=[
    'M 48 -62 Q 72 -78 91 -62 Q 103 -45 91 -28 Q 76 -31 63 -39 Q 54 -49 48 -62 Z',
    'M 83 -58 C 107 -69 123 -48 118 -26 Q 113 -4 95 2 Q 103 -17 91 -31 Z',
    'M 90 -41 C 116 -40 127 -24 117 -9 Q 110 3 96 6 Q 105 -19 90 -41 Z',
    'M 97 -35 C 119 -25 122 -7 110 6 Q 105 11 98 11 Q 111 -5 97 -35 Z'
  ];
  // Rounded flowing locks: all hair silhouettes are constructed from curved strands.
  const crown=[
    'M -3 -74 C -32 -85 -68 -65 -84 -37 C -91 -24 -94 -10 -93 2 C -70 -5 -57 -24 -41 -47 C -28 -65 -14 -70 -3 -74 Z',
    'M -8 -75 C -34 -77 -72 -54 -84 -27 C -92 -9 -92 7 -88 15 C -69 9 -53 -13 -40 -34 C -27 -54 -17 -67 -8 -75 Z',
    'M -6 -77 C -38 -68 -60 -41 -65 -18 C -68 1 -74 15 -80 24 C -56 23 -43 6 -33 -16 C -22 -43 -13 -65 -6 -77 Z',
    'M 4 -75 C 22 -82 43 -70 60 -53 C 72 -39 81 -23 82 -12 C 60 -20 44 -39 30 -55 C 18 -68 12 -71 4 -75 Z',
    'M 8 -78 C 36 -81 67 -64 81 -42 C 91 -27 95 -15 95 -5 C 74 -11 60 -27 46 -43 C 29 -63 17 -70 8 -78 Z',
    'M 12 -71 C 34 -72 50 -56 64 -30 C 71 -15 81 -2 91 6 C 69 10 55 -5 45 -24 C 33 -46 22 -62 12 -71 Z',
    'M -7 -72 C -17 -59 -23 -40 -25 -20 C -28 -7 -33 6 -39 13 C -28 20 -16 9 -10 -5 C -2 -24 1 -47 -7 -72 Z',
    'M 6 -70 C 18 -58 24 -38 26 -20 C 28 -6 35 5 41 13 C 28 18 17 10 11 -5 C 5 -24 1 -50 6 -70 Z'
  ];
  const faceFringe=[
    'M -36 -46 C -56 -37 -70 -15 -74 7 C -77 23 -84 34 -89 40 C -73 43 -59 26 -52 9 C -45 -8 -40 -29 -36 -46 Z',
    'M -22 -54 C -41 -36 -45 -13 -42 6 C -39 20 -42 29 -48 35 C -33 37 -23 20 -23 5 C -24 -15 -19 -34 -22 -54 Z',
    'M -9 -65 C -19 -46 -19 -28 -17 -9 C -15 6 -12 17 -10 23 C 1 21 5 12 4 1 C 2 -18 -3 -43 -9 -65 Z',
    'M 17 -62 C 27 -43 26 -24 22 -9 C 19 4 19 17 22 23 C 12 24 7 13 7 1 C 6 -19 9 -43 17 -62 Z',
    'M 34 -52 C 52 -35 59 -12 55 7 C 52 20 58 29 65 35 C 50 36 41 19 40 6 C 39 -12 35 -34 34 -52 Z',
    'M 57 -40 C 74 -26 83 -8 82 9 C 80 26 85 34 92 38 C 75 39 64 23 62 7 C 62 -10 59 -27 57 -40 Z'
  ];
  const wisps=[
    'M -80 7 C -90 16 -95 29 -92 37 C -84 38 -80 29 -77 20 Q -73 13 -69 10 Z',
    'M -59 17 C -69 27 -69 39 -65 43 C -59 43 -55 34 -54 26 Q -51 20 -47 19 Z',
    'M 72 8 C 85 17 89 29 87 36 C 80 38 76 30 73 23 Q 68 15 63 13 Z',
    'M 59 19 C 68 27 69 38 65 43 C 59 43 55 34 53 28 Q 51 23 48 22 Z'
  ];
  function strand(ctx,d,hair,i,layer){
    const path=new Path2D(d);
    let gr=grad(ctx,-93+(i%5)*18,-83,74-(i%4)*9,68,[[0,shade(hair,35-(i%3)*4)],[.32,shade(hair,21-(i%4)*3)],[.74,shade(hair,-3-i%3*3)],[1,shade(hair,-31)]]);
    ctx.save();ctx.shadowColor='rgba(34,15,9,.12)';ctx.shadowBlur=1.9;ctx.shadowOffsetY=.5;
    ctx.fillStyle=gr;ctx.fill(path);
    ctx.shadowColor='transparent';ctx.strokeStyle=shade(hair,-40);ctx.lineWidth=layer==='wisps'?1.0:1.45;ctx.stroke(path);ctx.restore();
    ctx.save();ctx.clip(path);ctx.fillStyle=radial(ctx,-29+i%4*13,-62,0,-18+i%5*12,-43,75,[[0,'rgba(255,230,205,.18)'],[.5,'rgba(255,230,205,.045)'],[1,'rgba(255,240,224,0)']]);ctx.fillRect(-105,-90,210,160);ctx.restore();
  }
  function backLocal(ctx,h){
    rear.forEach((d,i)=>strand(ctx,d,h,i,'rear'));
    pony.forEach((d,i)=>strand(ctx,d,h,i+3,'pony'));
    fillPath(ctx,'M 83 -61 Q 93 -60 98 -51 L 96 -41 Q 90 -45 83 -45 Q 80 -52 83 -61 Z',shade(h,-42),shade(h,-60),1.3);
  }
  function frontLocal(ctx,h){
    // Thin scalp underpaint ONLY where the strand roots overlap. It closes
    // transparent gaps without introducing an oversized helmet silhouette.
    // The top/far-side outline remains defined by separate strands.
    fillPath(ctx,
      'M -88 29 C -104 -16 -85 -66 -45 -77 C -23 -91 7 -90 32 -79 C 68 -75 93 -39 91 17 C 84 38 74 39 63 28 C 44 8 28 0 4 -2 C -22 0 -42 12 -56 28 C -66 39 -79 39 -88 29 Z',
      grad(ctx,-48,-85,49,12,[[0,shade(h,20)],[.46,shade(h,7)],[1,shade(h,-22)]]));
    crown.forEach((d,i)=>strand(ctx,d,h,i,'crown'));
    // Short crown crossover strands hide empty scalp between individual locks.
    strand(ctx,'M -28 -72 C -13 -82 2 -82 17 -73 Q 5 -68 -4 -51 Q -14 -61 -28 -72 Z',h,12,'crown');
    strand(ctx,'M 10 -73 Q 28 -82 45 -71 Q 30 -66 19 -50 Q 17 -61 10 -73 Z',h,13,'crown');
    faceFringe.forEach((d,i)=>strand(ctx,d,h,i+4,'front'));
    wisps.forEach((d,i)=>strand(ctx,d,h,i+6,'wisps'));
    // Short directional hair-grain lines (not whole thick clumps).
    const grain=[
      'M -69 -37 Q -52 -61 -27 -68','M -75 -23 Q -59 -43 -42 -52',
      'M -55 -13 Q -43 -39 -24 -55','M -37 -10 Q -25 -33 -14 -53',
      'M 20 -63 Q 45 -66 61 -43','M 31 -45 Q 54 -45 70 -26',
      'M 45 -20 Q 59 -12 64 5','M 1 -56 Q -2 -27 -4 -6'
    ];
    grain.forEach((p,i)=>strokePath(ctx,p,i%2?alpha(shade(h,-46),.23):alpha('#ffe6c9',.23),i%3===0?1.9:1.35));
  }
  function t(ctx,x,y,s,fn){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineCap='round';ctx.lineJoin='round';fn();ctx.restore();}
  function draw(ctx,x,y,s=1,opt={}){const h=opt.hair||'#98643f';t(ctx,x,y,s,()=>{backLocal(ctx,h);drawBody(ctx);drawFace(ctx);frontLocal(ctx,h);});}
  function drawBack(ctx,x,y,s=1,opt={}){const h=opt.hair||'#98643f';t(ctx,x,y,s,()=>backLocal(ctx,h));}
  function drawFront(ctx,x,y,s=1,opt={}){const h=opt.hair||'#98643f';t(ctx,x,y,s,()=>frontLocal(ctx,h));}
  root.HalfUpFine={draw,drawBack,drawFront};
})(typeof window!=='undefined'?window:globalThis);
