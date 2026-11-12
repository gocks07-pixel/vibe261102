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
