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
