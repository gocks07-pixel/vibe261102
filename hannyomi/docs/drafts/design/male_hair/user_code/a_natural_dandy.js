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
