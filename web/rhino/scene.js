import * as THREE from "three";
import { RoomEnvironment } from "./lib/RoomEnvironment.js";
/* Rhino coin + barbell 3D scene. Reads window.STAGE_P (0..1) set by app.js while the hero is pinned. */
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas=document.getElementById("gl"), pin=document.getElementById("stagePin");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene(); scene.fog=new THREE.FogExp2(0x0b1218,.06);
const pmrem=new THREE.PMREMGenerator(renderer); scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
const cam=new THREE.PerspectiveCamera(38,1,.1,100);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), seg=(p,a,b)=>clamp((p-a)/(b-a),0,1), ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2, lerp=(a,b,t)=>a+(b-a)*t;

/* lights */
scene.add(new THREE.AmbientLight(0x88aabb,.35));
const key=new THREE.SpotLight(0xbfefff,60,30,.5,.6,1.4); key.position.set(3,7,6); scene.add(key);
const rim=new THREE.PointLight(0x5fd0e6,30,20,1.6); rim.position.set(-4,2,-3); scene.add(rim);
const warm=new THREE.PointLight(0xf2b84b,10,14,1.8); warm.position.set(4,-1,3); scene.add(warm);

/* textures drawn in code */
function canvasTex(w,h,draw){ const c=document.createElement("canvas"); c.width=w; c.height=h; draw(c.getContext("2d"),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t; }
const coinFace=canvasTex(1024,1024,(g,w)=>{ g.fillStyle="#e9f1f4"; g.fillRect(0,0,w,w); });
const logoImg=new Image(); logoImg.onload=()=>{ const c=coinFace.image, g=c.getContext("2d"), w=c.width;
  const gr=g.createRadialGradient(w/2,w/2,w*.3,w/2,w/2,w/2); gr.addColorStop(0,"#ffffff"); gr.addColorStop(1,"#cfdde3"); g.fillStyle=gr; g.fillRect(0,0,w,w);
  g.drawImage(logoImg,w*.08,w*.08,w*.84,w*.84); coinFace.needsUpdate=true; }; logoImg.src="img/logo.png";
const plateTex=canvasTex(1024,1024,(g,w)=>{ const c=w/2; g.fillStyle="#141d24"; g.fillRect(0,0,w,w);
  g.strokeStyle="#3f7a8a"; g.lineWidth=18; g.beginPath(); g.arc(c,c,w*.46,0,7); g.stroke();
  g.strokeStyle="#22313b"; g.lineWidth=46; g.beginPath(); g.arc(c,c,w*.25,0,7); g.stroke();
  g.fillStyle="#9fd0dc"; g.font="bold 64px Georgia,serif"; g.textAlign="center"; g.textBaseline="middle";
  const txt="RHINO'S GYM  ·  AMRITSAR  ·  "; const R=w*.38; for(let i=0;i<txt.length;i++){ const a=i/txt.length*Math.PI*2-Math.PI/2; g.save(); g.translate(c+Math.cos(a)*R,c+Math.sin(a)*R); g.rotate(a+Math.PI/2); g.fillText(txt[i],0,0); g.restore(); }
  g.fillStyle="#f2b84b"; g.font="bold 92px Georgia,serif"; g.fillText("20 KG",c,c+w*.0); });

/* materials */
const chrome=new THREE.MeshStandardMaterial({color:0xe6eef1,metalness:1,roughness:.16});
const steel=new THREE.MeshStandardMaterial({color:0xa9bcc5,metalness:1,roughness:.32});
const tealMetal=new THREE.MeshStandardMaterial({color:0x5fa9bb,metalness:.9,roughness:.22});

/* --- the Rhino coin --- */
const coin=new THREE.Group(), spinner=new THREE.Group(); coin.add(spinner);
coinFace.center.set(.5,.5); coinFace.rotation=Math.PI/2;
const faceMat=new THREE.MeshStandardMaterial({map:coinFace,emissiveMap:coinFace,emissive:0xffffff,emissiveIntensity:.6,metalness:.15,roughness:.32});
const body=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.16,96,1),[tealMetal,faceMat,faceMat]); body.rotation.x=Math.PI/2; spinner.add(body);
spinner.add(new THREE.Mesh(new THREE.TorusGeometry(1.02,.06,24,120),chrome));
[.085,-.085].forEach(z=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(.93,.018,12,120),chrome); r.position.z=z; spinner.add(r); });
const glowTex=canvasTex(256,256,(g,w)=>{ const r=g.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2); r.addColorStop(0,"rgba(95,208,230,.9)"); r.addColorStop(.35,"rgba(95,208,230,.25)"); r.addColorStop(1,"rgba(95,208,230,0)"); g.fillStyle=r; g.fillRect(0,0,w,w); });
const halo=new THREE.Mesh(new THREE.PlaneGeometry(4.4,4.4),new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.75})); halo.position.z=-.7; coin.add(halo);
const orbit=new THREE.Mesh(new THREE.TorusGeometry(1.5,.008,8,160),new THREE.MeshBasicMaterial({color:0x5fd0e6,transparent:true,opacity:.6,blending:THREE.AdditiveBlending})); orbit.rotation.x=1.25; coin.add(orbit);
const orbDot=new THREE.Mesh(new THREE.SphereGeometry(.05,16,16),new THREE.MeshBasicMaterial({color:0xbff4ff})); coin.add(orbDot);
scene.add(coin);

/* --- the barbell --- */
const bar=new THREE.Group(), barSpin=new THREE.Group(); bar.add(barSpin);
const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,4.4,24),chrome); shaft.rotation.z=Math.PI/2; barSpin.add(shaft);
const plates=[];
[-1,1].forEach(side=>{
  const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,1.15,32),steel); sleeve.rotation.z=Math.PI/2; sleeve.position.x=side*1.75; barSpin.add(sleeve);
  const collar=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.08,32),chrome); collar.rotation.z=Math.PI/2; collar.position.x=side*1.18; barSpin.add(collar);
  [[.8,.15,1.32],[.62,.12,1.5]].forEach(([r,h,x],k)=>{
    const face=new THREE.MeshStandardMaterial({map:plateTex,metalness:.3,roughness:.5});
    const edge=new THREE.MeshStandardMaterial({color:k?0x2b5d6b:0x1a252d,metalness:.5,roughness:.45});
    const p=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,72),[edge,face,face]); p.rotation.z=side*Math.PI/2;
    const rr=new THREE.Mesh(new THREE.TorusGeometry(r,.026,12,90),tealMetal); rr.rotation.y=Math.PI/2;
    const g=new THREE.Group(); g.add(p,rr); g.userData={side,x}; barSpin.add(g); plates.push(g);
  });
});
scene.add(bar);

/* --- light beams, floor, dust --- */
const beams=[];
for(let i=0;i<3;i++){ const m=new THREE.Mesh(new THREE.ConeGeometry(1.6+i*.3,12,48,1,true),new THREE.MeshBasicMaterial({color:i===1?0xa9d3df:0x5fd0e6,transparent:true,opacity:.05,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  m.position.set((i-1)*3,4.5,-3-i); scene.add(m); beams.push(m); }
const grid=new THREE.GridHelper(40,60,0x3f7a8a,0x1d3340); grid.position.y=-2.2; grid.material.transparent=true; grid.material.opacity=.45; scene.add(grid);
const pool=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.5})); pool.rotation.x=-Math.PI/2; pool.position.y=-2.19; scene.add(pool);
const dotTex=canvasTex(64,64,(g,w)=>{ const r=g.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2); r.addColorStop(0,"rgba(255,255,255,1)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,w,w); });
const N=650, pos=new Float32Array(N*3), spd=new Float32Array(N);
for(let i=0;i<N;i++){ pos[i*3]=(Math.random()-.5)*14; pos[i*3+1]=Math.random()*9-3; pos[i*3+2]=(Math.random()-.5)*10-1; spd[i]=.15+Math.random()*.5; }
const dg=new THREE.BufferGeometry(); dg.setAttribute("position",new THREE.BufferAttribute(pos,3));
const dust=new THREE.Points(dg,new THREE.PointsMaterial({size:.07,map:dotTex,color:0xbfefff,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending})); scene.add(dust);
/* sparks when the coin is tapped */
const B=180, bpos=new Float32Array(B*3), bvel=new Float32Array(B*3); let bLife=0;
const bg=new THREE.BufferGeometry(); bg.setAttribute("position",new THREE.BufferAttribute(bpos,3));
const sparks=new THREE.Points(bg,new THREE.PointsMaterial({size:.1,map:dotTex,color:0xf2d38b,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending})); scene.add(sparks);
function burst(){ for(let i=0;i<B;i++){ const a=Math.random()*Math.PI*2, b=Math.acos(2*Math.random()-1), s=2+Math.random()*3.5;
  bpos.set([coin.position.x,coin.position.y,coin.position.z],i*3); bvel.set([Math.sin(b)*Math.cos(a)*s,Math.sin(b)*Math.sin(a)*s,Math.cos(b)*s],i*3); } bLife=1; }

/* --- interaction: drag to spin, tap to flip, tilt/move to look around --- */
let spinV=0, spinA=0, lastX=null, moved=0, flip=0, flipNow=0;
const look={x:0,y:0}, lookT={x:0,y:0};
canvas.addEventListener("pointerdown",e=>{ lastX=e.clientX; moved=0; });
addEventListener("pointermove",e=>{ if(e.pointerType==="mouse"){ lookT.x=e.clientX/innerWidth-.5; lookT.y=e.clientY/innerHeight-.5; }
  if(lastX!==null){ const dx=e.clientX-lastX; lastX=e.clientX; moved+=Math.abs(dx); spinV+=dx*.01; } },{passive:true});
addEventListener("pointerup",()=>{ if(lastX!==null&&moved<6&&(window.STAGE_P||0)<.3){ flip+=Math.PI*2; burst(); try{navigator.vibrate&&navigator.vibrate([12,40,12]);}catch(e){} } lastX=null; });
addEventListener("deviceorientation",e=>{ if(e.gamma==null) return; lookT.x=clamp(e.gamma/40,-.5,.5); lookT.y=clamp((e.beta-50)/50,-.5,.5); });

/* --- size --- */
let portrait=true;
function size(){ const w=pin.clientWidth, h=pin.clientHeight; renderer.setSize(w,h,false); cam.aspect=w/h; portrait=cam.aspect<.9; cam.updateProjectionMatrix(); }
addEventListener("resize",size); size();

/* --- loop --- */
let visible=true, sp=0, last=performance.now();
const T0=performance.now();
new IntersectionObserver(es=>{ visible=es[0].isIntersecting; },{threshold:0}).observe(pin);
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(!visible||document.hidden) return;
  const t=(now-T0)/1000;
  sp=lerp(sp,window.STAGE_P||0,RM?1:.09);
  look.x=lerp(look.x,lookT.x,.05); look.y=lerp(look.y,lookT.y,.05);
  const intro=RM?1:window.HERO_T0?ease(clamp((now-window.HERO_T0)/1500,0,1)):0;                 // coin rises in as the curtain opens
  /* camera */
  cam.position.set(look.x*1.2, .3-look.y*.7+sp*.8, (portrait?9.4:7.2)+sp*1.2);
  cam.lookAt(0,.3+sp*.6,0);
  /* coin: centre stage → floats up and back */
  const cUp=ease(seg(sp,.1,.42));
  spinV*=.94; spinA+=spinV*dt*4; flipNow=lerp(flipNow,flip,.06);
  coin.position.set(lerp(0,portrait?-.7:-2.2,cUp), lerp(1.1,2.7,cUp)+Math.sin(t*1.3)*.08-(1-intro)*5, lerp(0,-3,cUp));
  spinner.rotation.set(Math.sin(t*.7)*.1+flipNow, Math.sin(t*.55)*.55+spinA, 0);
  coin.scale.setScalar(lerp(1,.62,cUp)*(portrait?.86:1.15)*(.3+.7*intro));
  const oa=t*1.6; orbDot.position.set(Math.cos(oa)*1.5,Math.sin(oa)*1.5*Math.cos(1.25),Math.sin(oa)*1.5*Math.sin(1.25));
  halo.material.opacity=.5+Math.sin(t*2.2)*.2;
  /* barbell: flies in, plates slide on, then the lift */
  const bIn=ease(seg(sp,.16,.4)), lift=ease(seg(sp,.7,.92));
  bar.position.set(lerp(10,0,bIn), lerp(-.5,1.0,lift)+Math.sin(t*1.1)*.05, portrait?-.8:0);
  bar.rotation.set(0, lerp(-1.2,-.45,bIn)+look.x*.35, lerp(.4,0,bIn)+Math.sin(t*.8)*.03);
  barSpin.rotation.x=t*.35;
  bar.scale.setScalar(portrait?.8:1);
  plates.forEach((p,i)=>{ const k=i%2, on=ease(seg(sp,.34+k*.05,.56+k*.05)); p.position.x=p.userData.side*(p.userData.x+2.8*(1-on)); p.rotation.x=(1-on)*3; });
  /* atmosphere */
  beams.forEach((b,i)=>{ b.rotation.z=(i-1)*.25+Math.sin(t*.4+i)*.12; b.material.opacity=.04+Math.sin(t*.9+i*2)*.02+lift*.04; });
  rim.intensity=26+Math.sin(t*2)*6+lift*24;
  const a=dg.attributes.position.array; for(let i=0;i<N;i++){ a[i*3+1]+=spd[i]*dt*.5; if(a[i*3+1]>6) a[i*3+1]=-3; } dg.attributes.position.needsUpdate=true;
  dust.rotation.y=t*.02;
  if(bLife>0){ bLife-=dt*.9; for(let i=0;i<B*3;i++){ bpos[i]+=bvel[i]*dt; bvel[i]*=.96; } bg.attributes.position.needsUpdate=true; sparks.material.opacity=Math.max(0,bLife); }
  grid.position.z=(t*.6)%(40/60);
  renderer.render(scene,cam);
}
requestAnimationFrame(frame);
document.documentElement.classList.add("gl-ok");
