/* Rhino's Gym: hanging poster cloth.
   Real-time Verlet cloth in plain WebGL 1, pinned at its two top corners.
   Grab it with the mouse or a finger, tug it around, let go and it settles. */
(function(){
"use strict";
const hero=document.getElementById("hero"), canvas=document.getElementById("cloth");
if(!hero||!canvas) return;
const fail=()=>{ hero.classList.add("no-cloth"); stop(); };
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- settings ---------- */
const S={ size:.90, aspect:1.12, spread:.98, pinRoll:5.5, flutter:.35, damping:.30, stiffness:.60, crumple:.55,
  grabRadius:.12, carryRadius:.20, gravity:2.6, tilt:-10, turn:-12, perspective:.45, maxSpeed:12, steps:8 };
const NX=46, NY=42, N=NX*NY, CH=S.size, CW=S.size*S.aspect;
const t=S.tilt*Math.PI/180, r=S.turn*Math.PI/180;
const R0=[Math.cos(r),0,Math.sin(r)],
      R1=[Math.sin(t)*Math.sin(r),Math.cos(t),-Math.sin(t)*Math.cos(r)],
      R2=[-Math.cos(t)*Math.sin(r),Math.sin(t),Math.cos(t)*Math.cos(r)];
const CAM=Math.exp(Math.log(18)*(1-S.perspective)+Math.log(1.7)*S.perspective);
const view=(x,y,z,o)=>{ o[0]=R0[0]*x+R0[1]*y+R0[2]*z; o[1]=R1[0]*x+R1[1]*y+R1[2]*z; o[2]=R2[0]*x+R2[1]*y+R2[2]*z; return o; };
const world=(x,y,z,o)=>{ o[0]=R0[0]*x+R1[0]*y+R2[0]*z; o[1]=R0[1]*x+R1[1]*y+R2[1]*z; o[2]=R0[2]*x+R1[2]*y+R2[2]*z; return o; };

/* ---------- geometry ---------- */
const id=(c,rw)=>rw*NX+c;
const pos=new Float32Array(N*3), prev=new Float32Array(N*3), rest=new Float32Array(N*3), flat=new Float32Array(N*2);
const nrm=new Float32Array(N*3), uvs=new Float32Array(N*2);
const ridge=x=>Math.sqrt(Math.sin(x)**2+.03)-.64;
const crease=(u,v)=>S.crumple*.045*CH*(ridge(2.7*u+2.9*v+.7)+.8*ridge(-2.6*u+3.3*v+2.1)+.5*Math.sin(4.9*u-1.4*v+2.2)+.55*ridge(1.1*u+6.4*v+1.3)+.4*ridge(8.3*u+3.9*v+.2)+.3*ridge(-5.7*u+9.1*v+1.6));
for(let rw=0;rw<NY;rw++) for(let c=0;c<NX;c++){ const i=id(c,rw), u=c/(NX-1), v=rw/(NY-1);
  flat[i*2]=(u-.5)*CW; flat[i*2+1]=(v-.5)*CH;
  rest[i*3]=flat[i*2]; rest[i*3+1]=flat[i*2+1]; rest[i*3+2]=crease(u,v);
  uvs[i*2]=c/(NX-1); uvs[i*2+1]=1-rw/(NY-1); }

/* pins: top-left and top-right; the left one sits a little higher */
const PL=id(0,NY-1), PR=id(NX-1,NY-1), half=.5*CW*S.spread, top=.5*CH, roll=S.pinRoll*Math.PI/180;
const PINS=[[PL,-half*Math.cos(roll),top+half*Math.sin(roll),0],[PR,half*Math.cos(roll),top-half*Math.sin(roll),0]];
const pinned=new Uint8Array(N); PINS.forEach(p=>pinned[p[0]]=1);

/* links: [a, b, rest length, stiffness] */
const L=[]; const bend=.02+(.60-.02)*S.stiffness;
const dist3=(a,b)=>Math.hypot(rest[a*3]-rest[b*3],rest[a*3+1]-rest[b*3+1],rest[a*3+2]-rest[b*3+2]);
const link=(a,b,k)=>L.push(a,b,dist3(a,b),k);
for(let rw=0;rw<NY;rw++) for(let c=0;c<NX;c++){ const a=id(c,rw);
  if(c+1<NX) link(a,id(c+1,rw),1); if(rw+1<NY) link(a,id(c,rw+1),1);
  if(c+1<NX&&rw+1<NY){ link(a,id(c+1,rw+1),.5); link(id(c+1,rw),id(c,rw+1),.5); }
  if(c+2<NX) link(a,id(c+2,rw),bend); if(rw+2<NY) link(a,id(c,rw+2),bend);
  if(c+5<NX) link(a,id(c+5,rw),bend*.5); if(rw+5<NY) link(a,id(c,rw+5),bend*.5); }
const NL=L.length/4, LA=new Int32Array(NL), LB=new Int32Array(NL), LR=new Float32Array(NL), LS=new Float32Array(NL);
for(let n=0;n<NL;n++){ LA[n]=L[n*4]; LB[n]=L[n*4+1]; LR[n]=L[n*4+2]; LS[n]=L[n*4+3]; }

/* tethers: never further from a pin than 1.02 x the flat distance to it */
const teth=new Float32Array(N*2);
for(let i=0;i<N;i++) PINS.forEach((p,k)=>{ teth[i*2+k]=1.02*Math.hypot(flat[i*2]-flat[p[0]*2],flat[i*2+1]-flat[p[0]*2+1]); });

/* starting pose: narrower at the top, rotated with the pins */
for(let i=0;i<N;i++){ const v=Math.floor(i/NX)/(NY-1);
  let x=rest[i*3]*(S.spread+(1-S.spread)*(1-v)**2), y=rest[i*3+1], z=rest[i*3+2];
  const a=-roll, dy=y-top; const xr=x*Math.cos(a)-dy*Math.sin(a), yr=top+x*Math.sin(a)+dy*Math.cos(a);
  pos[i*3]=xr; pos[i*3+1]=yr; pos[i*3+2]=z; }
PINS.forEach(p=>{ pos[p[0]*3]=p[1]; pos[p[0]*3+1]=p[2]; pos[p[0]*3+2]=p[3]; });
prev.set(pos);

/* ---------- simulation ---------- */
const W1s=new Float32Array(N),W1c=new Float32Array(N),W2s=new Float32Array(N),W2c=new Float32Array(N),W3s=new Float32Array(N),W3c=new Float32Array(N),W4s=new Float32Array(N),W4c=new Float32Array(N),WXs=new Float32Array(N),WXc=new Float32Array(N);
for(let i=0;i<N;i++){ const u=(i%NX)/(NX-1), v=Math.floor(i/NX)/(NY-1);
  const a1=9.1*u-3.7*v, a2=6.3*u+7.9*v+1.3, a3=2.9*u, a4=2.3*v, ax=3.3*v+u;
  W1s[i]=Math.sin(a1); W1c[i]=Math.cos(a1); W2s[i]=Math.sin(a2); W2c[i]=Math.cos(a2); W3s[i]=Math.sin(a3); W3c[i]=Math.cos(a3); W4s[i]=Math.sin(a4); W4c[i]=Math.cos(a4); WXs[i]=Math.sin(ax); WXc[i]=Math.cos(ax); }
let T=0, damping=S.damping, sweep=0;
const fixed=new Uint8Array(N);          // pins + points carried at full weight this step
const grab={on:false,i:-1,depth:0,off:[0,0,0],px:0,py:0,w:new Float32Array(N)};
const tmp=[0,0,0], tmp2=[0,0,0];
function tetherPoint(i,o){ for(let k=0;k<2;k++){ const p=PINS[k]; const dx=o[0]-p[1], dy=o[1]-p[2], dz=o[2]-p[3], d=Math.sqrt(dx*dx+dy*dy+dz*dz), m=teth[i*2+k];
  if(d>m&&d>0){ const s=m/d; o[0]=p[1]+dx*s; o[1]=p[2]+dy*s; o[2]=p[3]+dz*s; } } }
function step(h){
  T+=h;
  const damp=Math.exp(-(.15+5.85*damping)*h), gust=.6+.4*Math.sin(.37*T)*Math.sin(.23*T+1);
  const wind=RM?0:S.flutter*2.4*gust*(S.gravity/2.6), vmax=S.maxSpeed*h, h2=h*h;
  fixed.set(pinned);
  /* s1=sin(9.1u-3.7v+3.1T), s2=sin(6.3u+7.9v-2.3T+1.3), s3=sin(2.9u+phi)cos(2.3v-.9T), x=sin(3.3v+1.1T+u) */
  const c1=Math.cos(3.1*T), n1=Math.sin(3.1*T), c2=Math.cos(-2.3*T), n2=Math.sin(-2.3*T), phi=1.7*T+.8*Math.sin(.5*T), cp=Math.cos(phi), sp0=Math.sin(phi),
        c4=Math.cos(.9*T), n4=Math.sin(.9*T), cx=Math.cos(1.1*T), nx=Math.sin(1.1*T), g=S.gravity;
  for(let i=0;i<N;i++){ if(pinned[i]) continue; const j=i*3;
    const s1=W1s[i]*c1+W1c[i]*n1, s2=W2s[i]*c2+W2c[i]*n2, s3=(W3s[i]*cp+W3c[i]*sp0)*(W4c[i]*c4+W4s[i]*n4);
    const ax=wind*.25*(WXs[i]*cx+WXc[i]*nx), ay=wind*.1*s2-g, az=wind*(.45*s1+.35*s2+.3*s3);
    let vx=(pos[j]-prev[j])*damp+ax*h2, vy=(pos[j+1]-prev[j+1])*damp+ay*h2, vz=(pos[j+2]-prev[j+2])*damp+az*h2;
    const q2=vx*vx+vy*vy+vz*vz; if(q2>vmax*vmax){ const k=vmax/Math.sqrt(q2); vx*=k; vy*=k; vz*=k; }
    prev[j]=pos[j]; prev[j+1]=pos[j+1]; prev[j+2]=pos[j+2];
    pos[j]+=vx; pos[j+1]+=vy; pos[j+2]+=vz; }
  /* carry the grabbed area */
  if(grab.on){ const g=grab.i, k=(CAM-grab.depth)/CAM;
    view(0,0,0,tmp); // reset
    const qx=grab.px*k+grab.off[0], qy=grab.py*k+grab.off[1], qz=grab.depth+grab.off[2];
    world(qx,qy,qz,tmp); tetherPoint(g,tmp);
    const dx=tmp[0]-pos[g*3], dy=tmp[1]-pos[g*3+1], dz=tmp[2]-pos[g*3+2], W=grab.w;
    for(let i=0;i<N;i++){ const w=W[i]; if(!w) continue; const j=i*3;
      if(w>=.98){ pos[j]+=dx; pos[j+1]+=dy; pos[j+2]+=dz; fixed[i]=1; }
      else { pos[j]+=w*dx; pos[j+1]+=w*dy; pos[j+2]+=w*dz; prev[j]+=w*dx; prev[j+1]+=w*dy; prev[j+2]+=w*dz; } } }
  /* one sweep over the links, alternating direction */
  const fw=(sweep++&1)===0;
  for(let k=0;k<NL;k++){ const n=fw?k:NL-1-k, ia=LA[n], ib=LB[n];
    const wa=fixed[ia]?0:1, wb=fixed[ib]?0:1, ws=wa+wb; if(!ws) continue; const a=ia*3, b=ib*3;
    const dx=pos[b]-pos[a], dy=pos[b+1]-pos[a+1], dz=pos[b+2]-pos[a+2], d=Math.sqrt(dx*dx+dy*dy+dz*dz); if(d<1e-9) continue;
    const c=(d-LR[n])/d*LS[n]/ws;
    if(wa){ pos[a]+=dx*c; pos[a+1]+=dy*c; pos[a+2]+=dz*c; }
    if(wb){ pos[b]-=dx*c; pos[b+1]-=dy*c; pos[b+2]-=dz*c; } }
  const P0=PINS[0], P1=PINS[1];
  for(let i=0;i<N;i++){ if(fixed[i]) continue; const j=i*3;
    for(let k=0;k<2;k++){ const p=k?P1:P0, m=teth[i*2+k], dx=pos[j]-p[1], dy=pos[j+1]-p[2], dz=pos[j+2]-p[3], d2=dx*dx+dy*dy+dz*dz;
      if(d2>m*m){ const s=m/Math.sqrt(d2); pos[j]=p[1]+dx*s; pos[j+1]=p[2]+dy*s; pos[j+2]=p[3]+dz*s; } } }
}
/* settle before the first frame so it already hangs */
damping=1; for(let k=0;k<360;k++) step(1/240); damping=S.damping;

/* ---------- WebGL ---------- */
let gl=null;
try{ gl=canvas.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:"high-performance"}); }catch(e){}
if(!gl){ fail(); return; }
const VS=`attribute vec3 aP; attribute vec3 aN; attribute vec2 aT;
uniform vec3 uR0,uR1,uR2; uniform float uCam,uZoom,uAsp; uniform vec2 uC;
varying vec3 vV; varying vec3 vN; varying vec2 vT;
void main(){ vec3 q=vec3(dot(uR0,aP),dot(uR1,aP),dot(uR2,aP));
  float s=uCam/max(uCam-q.z,.001); vec2 sc=q.xy*s*uZoom;
  gl_Position=vec4(2.*(uC.x+sc.x/uAsp)-1., 1.-2.*(uC.y-sc.y), -q.z*.5, 1.);
  vV=q; vN=vec3(dot(uR0,aN),dot(uR1,aN),dot(uR2,aN)); vT=aT; }`;
const FS=`precision highp float;
varying vec3 vV; varying vec3 vN; varying vec2 vT;
uniform sampler2D uTex; uniform float uHas, uCam;
const vec3 KEY=vec3(-0.42,0.45,0.79);
float box(vec3 d, vec3 c, vec2 hs, float soft){ float f=dot(d,c); if(f<=0.) return 0.;
  vec3 up=abs(c.y)<.99?vec3(0.,1.,0.):vec3(1.,0.,0.); vec3 bx=normalize(cross(up,c)); vec3 by=cross(c,bx);
  vec2 l=vec2(dot(d,bx),dot(d,by))/f; vec2 e=(abs(l)-hs)/soft;
  return (1.-smoothstep(-.5,.5,e.x))*(1.-smoothstep(-.5,.5,e.y)); }
vec3 rainbow(float p){ return clamp(vec3(0.58,0.84,0.97)+vec3(0.22,0.13,0.05)*cos(6.2831853*(p+vec3(0.,0.28,0.62))),0.,1.); }
void main(){
  vec3 n=normalize(vN); bool back=n.z<0.; if(back) n=-n;
  vec3 K=normalize(KEY);
  vec3 V=normalize(vec3(0.,0.,uCam)-vV); vec3 Rf=reflect(-V,n);
  float nv=clamp(dot(n,V),0.,1.), nl=max(dot(n,K),0.);
  vec3 print=uHas>.5?pow(texture2D(uTex,vT).rgb,vec3(2.2)):vec3(0.04,0.10,0.14);
  float shade=.46+.68*nl+.08*n.y;
  float key=pow(max(dot(Rf,K),0.),26.);
  float strip=box(Rf,normalize(vec3(.08,.93,.36)),vec2(1.1,.07),.22);
  float side=box(Rf,normalize(vec3(.86,.12,.50)),vec2(.06,.85),.20);
  float fill=box(Rf,K,vec2(.42,.30),.35);
  float phase=3.*(.85*dot(n.xy,vec2(.6,.8))+.75*(1.-nv)+.3*dot(Rf.xy,vec2(-.8,.6)))+.4*sin(5.*vT.x+7.*vT.y);
  vec3 holo=mix(vec3(1.),pow(rainbow(phase),vec3(2.2)),.8);
  float lum=dot(print,vec3(.2126,.7152,.0722));
  float gloss=mix(1.,.45,smoothstep(.55,.9,lum));
  vec3 spec=holo*gloss*mix(vec3(1.),print*2.4+.08,.65)*(.34*key+.11*strip+.07*side+.02*fill);
  vec3 col=print*shade+spec+holo*print*.6*pow(1.-nv,3.);
  if(back){ vec3 foil=vec3(.16,.30,.38)*(.35+.9*nl)+spec*1.3; col=mix(foil,print*shade,.38); }
  col=min(col,vec3(.8))+.2*(1.-exp(-max(col-.8,0.)/.2));
  gl_FragColor=vec4(pow(col,vec3(1./2.2)),1.); }`;
const VS_S=`attribute vec3 aP; uniform vec3 uR0,uR1,uR2; uniform float uCam,uZoom,uAsp; uniform vec2 uC;
void main(){ vec3 q=vec3(dot(uR0,aP),dot(uR1,aP),dot(uR2,aP)); float s=uCam/max(uCam-q.z,.001); vec2 sc=q.xy*s*uZoom;
  gl_Position=vec4(2.*(uC.x+sc.x/uAsp)-1., 1.-2.*(uC.y-sc.y), 0., 1.); }`;
const FS_S=`precision mediump float; void main(){ gl_FragColor=vec4(1.); }`;
const VS_B=`attribute vec2 aQ; varying vec2 vU; void main(){ vU=aQ*.5+.5; gl_Position=vec4(aQ,0.,1.); }`;
const FS_B=`precision mediump float; varying vec2 vU; uniform sampler2D uS; uniform vec2 uStep, uShift;
void main(){ float a=0., ws=0.;
  for(int i=-3;i<=3;i++) for(int j=-3;j<=3;j++){ float w=exp(-float(i*i+j*j)/6.); a+=w*texture2D(uS,vU-uShift+vec2(float(i),float(j))*uStep).a; ws+=w; }
  a=a/ws*.30; gl_FragColor=vec4(vec3(.07,.07,.16)*a,a); }`;
function prog(vs,fs){ const mk=(t,s)=>{ const sh=gl.createShader(t); gl.shaderSource(sh,s); gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
  const p=gl.createProgram(); gl.attachShader(p,mk(gl.VERTEX_SHADER,vs)); gl.attachShader(p,mk(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const U={}; const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS); for(let i=0;i<n;i++){ const u=gl.getActiveUniform(p,i); U[u.name]=gl.getUniformLocation(p,u.name); }
  return {p,U,a:nm=>gl.getAttribLocation(p,nm)}; }
let PC,PS,PB;
try{ PC=prog(VS,FS); PS=prog(VS_S,FS_S); PB=prog(VS_B,FS_B); }catch(e){ console.warn(e); fail(); return; }
const bP=gl.createBuffer(), bN=gl.createBuffer(), bT=gl.createBuffer(), bI=gl.createBuffer(), bQ=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,bT); gl.bufferData(gl.ARRAY_BUFFER,uvs,gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER,bQ); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const idx=new Uint16Array((NX-1)*(NY-1)*6); { let k=0; for(let rw=0;rw<NY-1;rw++) for(let c=0;c<NX-1;c++){ const a=id(c,rw), b=a+1, d=a+NX, e=d+1; idx.set([a,b,e,a,e,d],k); k+=6; } }
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bI); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);

/* print texture (the Rhino's poster, painted by poster.js) */
const tex=gl.createTexture(); let hasTex=0;
function uploadPrint(src){ try{
  gl.bindTexture(gl.TEXTURE_2D,tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  const an=gl.getExtension("EXT_texture_filter_anisotropic")||gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
  if(an) gl.texParameterf(gl.TEXTURE_2D,an.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  hasTex=1; draw(); }catch(e){ console.warn(e); fail(); } }
window.RhinoPoster&&window.RhinoPoster.then(uploadPrint,fail);

/* shadow target */
let fb=null, ftex=null, fw=0, fh=0;
function shadowTarget(w,h){ if(w===fw&&h===fh&&fb) return; fw=w; fh=h;
  if(!ftex) ftex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,ftex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(p=>gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  if(!fb) fb=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,fb); gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,ftex,0);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null); }

/* ---------- view ---------- */
const V={cx:.402,cy:.485,zoom:1,asp:1,w:1,h:1};
function resize(){ const w=hero.clientWidth, h=hero.clientHeight; if(!w||!h) return; const dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
  const asp=w/h; V.asp=asp; V.w=w; V.h=h;
  if(w>=1100&&asp>=1.25){ V.cx=.402; V.cy=.485; V.zoom=Math.min(1,.58*asp/(CW*1.12)); }
  else { V.cx=.5; V.cy=asp<.75?.41:.43; V.zoom=Math.min(1,.92*asp/(CW*1.12),(asp<.75?.60:.66)/CH); }
  shadowTarget(Math.max(1,Math.round(canvas.width/8)),Math.max(1,Math.round(canvas.height/8)));
  draw(); }

/* ---------- render ---------- */
function normals(){ for(let rw=0;rw<NY;rw++) for(let c=0;c<NX;c++){ const i=id(c,rw);
  const l=id(Math.max(c-1,0),rw), rr=id(Math.min(c+1,NX-1),rw), dn=id(c,Math.max(rw-1,0)), up=id(c,Math.min(rw+1,NY-1));
  const ax=pos[rr*3]-pos[l*3], ay=pos[rr*3+1]-pos[l*3+1], az=pos[rr*3+2]-pos[l*3+2];
  const bx=pos[up*3]-pos[dn*3], by=pos[up*3+1]-pos[dn*3+1], bz=pos[up*3+2]-pos[dn*3+2];
  let nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx; const d=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
  nrm[i*3]=nx/d; nrm[i*3+1]=ny/d; nrm[i*3+2]=nz/d; } }
function common(P){ gl.uniform3fv(P.U.uR0,R0); gl.uniform3fv(P.U.uR1,R1); gl.uniform3fv(P.U.uR2,R2);
  gl.uniform1f(P.U.uCam,CAM); gl.uniform1f(P.U.uZoom,V.zoom); gl.uniform1f(P.U.uAsp,V.asp); gl.uniform2f(P.U.uC,V.cx,V.cy); }
function attr(P,name,buf,size){ const a=P.a(name); if(a<0) return; gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a,size,gl.FLOAT,false,0,0); }
function draw(){
  if(!gl||gl.isContextLost()) return;
  normals();
  gl.bindBuffer(gl.ARRAY_BUFFER,bP); gl.bufferData(gl.ARRAY_BUFFER,pos,gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,bN); gl.bufferData(gl.ARRAY_BUFFER,nrm,gl.DYNAMIC_DRAW);
  for(let i=0;i<8;i++) gl.disableVertexAttribArray(i);
  /* 1. silhouette into the small shadow target */
  gl.bindFramebuffer(gl.FRAMEBUFFER,fb); gl.viewport(0,0,fw,fh); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
  gl.useProgram(PS.p); common(PS); attr(PS,"aP",bP,3); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bI); gl.drawElements(gl.TRIANGLES,idx.length,gl.UNSIGNED_SHORT,0);
  for(let i=0;i<8;i++) gl.disableVertexAttribArray(i);
  /* 2. blurred soft shadow */
  gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,canvas.width,canvas.height);
  gl.clearColor(0,0,0,0); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(PB.p); attr(PB,"aQ",bQ,2);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,ftex); gl.uniform1i(PB.U.uS,1);
  const sp=.9+1.5*V.zoom*V.h/724; gl.uniform2f(PB.U.uStep,sp/fw,sp/fh);
  gl.uniform2f(PB.U.uShift,-.012*V.zoom/V.asp,-.045*V.zoom);
  gl.drawArrays(gl.TRIANGLES,0,3); gl.disable(gl.BLEND);
  for(let i=0;i<8;i++) gl.disableVertexAttribArray(i);
  /* 3. the cloth */
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
  gl.useProgram(PC.p); common(PC); attr(PC,"aP",bP,3); attr(PC,"aN",bN,3); attr(PC,"aT",bT,2);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,tex); gl.uniform1i(PC.U.uTex,0); gl.uniform1f(PC.U.uHas,hasTex);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bI); gl.drawElements(gl.TRIANGLES,idx.length,gl.UNSIGNED_SHORT,0);
}

/* ---------- loop ---------- */
let raf=0, last=0, onScreen=true;
function frame(now){ raf=0; const dt=Math.min((now-last)/1000||0,1/30); last=now;
  const h=dt/S.steps; if(h>0) for(let k=0;k<S.steps;k++) step(h);
  draw(); if(onScreen&&!document.hidden) raf=requestAnimationFrame(frame); }
function start(){ if(!raf&&onScreen&&!document.hidden&&!hero.classList.contains("no-cloth")){ last=performance.now(); raf=requestAnimationFrame(frame); } }
function stop(){ if(raf){ cancelAnimationFrame(raf); raf=0; } }
new IntersectionObserver(es=>{ onScreen=es[0].isIntersecting; onScreen?start():stop(); },{threshold:0}).observe(hero);
document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
canvas.addEventListener("webglcontextlost",e=>{ e.preventDefault(); fail(); });
if(window.ResizeObserver) new ResizeObserver(resize).observe(hero);
addEventListener("resize",resize);
resize(); start();

/* ---------- grabbing ---------- */
function toScreen(cx,cy){ const b=canvas.getBoundingClientRect();
  return [((cx-b.left)/b.width-V.cx)*V.asp/V.zoom, (V.cy-(cy-b.top)/b.height)/V.zoom]; }
const q=[0,0,0];
function pick(cx,cy){ const [px,py]=toScreen(cx,cy), lim=S.grabRadius/V.zoom; let best=-1, bs=1e9, bd=0, bq=null;
  for(let i=0;i<N;i++){ view(pos[i*3],pos[i*3+1],pos[i*3+2],q); const s=CAM/Math.max(CAM-q[2],.001), sx=q[0]*s, sy=q[1]*s;
    const d=Math.hypot(sx-px,sy-py); if(d>lim) continue; const sc=d-.08*q[2]; if(sc<bs){ bs=sc; best=i; bd=q[2]; bq=[q[0],q[1],q[2]]; } }
  return best<0?null:{i:best,depth:bd,q:bq,px,py}; }
function begin(e){ const p=pick(e.clientX,e.clientY); if(!p) return false;
  grab.on=true; grab.i=p.i; grab.depth=p.depth; grab.px=p.px; grab.py=p.py;
  const k=(CAM-p.depth)/CAM; grab.off=[p.q[0]-p.px*k,p.q[1]-p.py*k,0];
  const gx=flat[p.i*2], gy=flat[p.i*2+1], rad=S.carryRadius*CH;
  for(let i=0;i<N;i++){ const d=Math.hypot(flat[i*2]-gx,flat[i*2+1]-gy)/rad; grab.w[i]=pinned[i]?0:d<1?(1-d*d)**2:0; }
  grab.w[p.i]=1;
  canvas.classList.add("is-held"); start(); return true; }
function move(e){ if(!grab.on) return; const [px,py]=toScreen(e.clientX,e.clientY); grab.px=px; grab.py=py; }
function end(){ if(!grab.on) return; grab.on=false; grab.w.fill(0); canvas.classList.remove("is-held"); }
canvas.addEventListener("pointerdown",e=>{ if(e.pointerType==="mouse"&&e.button!==0) return; if(begin(e)){ try{ canvas.setPointerCapture(e.pointerId); }catch(_){} } });
canvas.addEventListener("pointermove",e=>{ if(grab.on){ move(e); return; } if(e.pointerType==="mouse") canvas.classList.toggle("is-over",!!pick(e.clientX,e.clientY)); });
["pointerup","pointercancel","lostpointercapture"].forEach(t=>canvas.addEventListener(t,end));
canvas.addEventListener("pointerleave",()=>{ if(!grab.on) canvas.classList.remove("is-over"); });
canvas.addEventListener("touchstart",e=>{ const tt=e.touches[0]; if(tt&&pick(tt.clientX,tt.clientY)) e.preventDefault(); },{passive:false});
canvas.addEventListener("touchmove",e=>{ if(grab.on) e.preventDefault(); },{passive:false});
})();
