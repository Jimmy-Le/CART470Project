'use strict';
// A small actual 3D paper mesh, projected onto a 2D canvas. No library/download.
// x = across the hull, y = bow/stern, z = height above the water.
class PaperBoat {
  constructor(canvas) {
    this.canvas=canvas; this.ctx=canvas.getContext('2d');
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=96*dpr; canvas.height=96*dpr;
    this.ctx.scale(dpr,dpr);
    this.vertices=[
      [0,-43,6],[0,43,6],[-22,0,9],[22,0,9], // pointed rim
      [0,-29,-4],[0,29,-4],[-10,0,-6],[10,0,-6], // lower hull
      [0,-25,5],[0,25,5],[0,0,28], // raised central paper fold
      [-15,0,7],[15,0,7]
    ];
    this.faces=[
      {v:[0,2,6,4],c:[225,219,198]}, {v:[2,1,5,6],c:[242,235,216]},
      {v:[0,4,7,3],c:[249,244,227]}, {v:[3,7,5,1],c:[228,221,201]},
      {v:[0,8,11,2],c:[213,207,188]}, {v:[2,11,9,1],c:[222,216,197]},
      {v:[0,3,12,8],c:[232,226,206]}, {v:[3,1,9,12],c:[216,211,191]},
      {v:[8,10,11],c:[255,252,237]}, {v:[11,10,9],c:[247,242,224]},
      {v:[8,12,10],c:[230,224,205]}, {v:[12,9,10],c:[239,233,213]}
    ];
  }
  draw(heading,roll,pitch,bob=0) {
    const ctx=this.ctx; if(!ctx)return;
    const rad=Math.PI/180;
    const r=roll*rad,p=pitch*rad,h=heading*rad,tilt=38*rad;
    const points=this.vertices.map(([x,y,z])=>{
      // Roll around the boat's long axis, then pitch and turn in the water.
      [x,z]=[x*Math.cos(r)+z*Math.sin(r),-x*Math.sin(r)+z*Math.cos(r)];
      [y,z]=[y*Math.cos(p)-z*Math.sin(p),y*Math.sin(p)+z*Math.cos(p)];
      [x,y]=[x*Math.cos(h)-y*Math.sin(h),x*Math.sin(h)+y*Math.cos(h)];
      return {x:48+x*.88,y:48+(y*Math.cos(tilt)-z*Math.sin(tilt))*.88+bob,depth:y*Math.sin(tilt)+z*Math.cos(tilt)};
    });
    ctx.clearRect(0,0,96,96);
    ctx.save();ctx.translate(49,51);ctx.rotate(h);
    ctx.fillStyle='rgba(48,78,69,.12)';ctx.beginPath();ctx.ellipse(0,0,17,34,0,0,Math.PI*2);ctx.fill();ctx.restore();
    const faces=this.faces.map(face=>({...face,depth:face.v.reduce((s,i)=>s+points[i].depth,0)/face.v.length})).sort((a,b)=>a.depth-b.depth);
    for(const face of faces){
      const [a,b,c]=face.v.map(i=>points[i]);
      // Tiny light shift as the paper rocks; keep the paper cream, never metallic.
      const light=1+Math.sin(r)*((a.x+b.x+c.x)/3-48)*.002;
      ctx.fillStyle=`rgb(${face.c.map(v=>Math.min(255,Math.round(v*light))).join(',')})`;
      ctx.strokeStyle='rgba(112,119,99,.48)';ctx.lineWidth=.65;ctx.lineJoin='round';ctx.beginPath();
      face.v.forEach((i,n)=>n?ctx.lineTo(points[i].x,points[i].y):ctx.moveTo(points[i].x,points[i].y));
      ctx.closePath();ctx.fill();ctx.stroke();
    }
  }
}
window.PaperBoat=PaperBoat;
