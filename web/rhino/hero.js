/* Rhino's hero: starfield, glowing planet rim (WebGL), live Member Hub dashboard */
(function(){
const $=id=>document.getElementById(id);
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const hero=document.querySelector(".hero");
const DPR=Math.min(devicePixelRatio||1,1.75);

/* ---------- stars (static, like a real night sky) ---------- */
const sc=$("stars"), sx=sc.getContext("2d");
function drawStars(){
  const w=hero.clientWidth, h=hero.clientHeight; const D2=Math.min(DPR,1.5); sc.width=w*D2; sc.height=h*D2; sx.setTransform(D2,0,0,D2,0,0); sx.clearRect(0,0,w,h);
  let seed=7; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const n=Math.round(w*h/2600);
  for(let i=0;i<n;i++){ const x=rnd()*w, y=rnd()*h, r=rnd(), size=r>.985?1.6:r>.9?1.05:.6, a=.25+rnd()*.7;
    sx.globalAlpha=a; sx.fillStyle=rnd()>.85?"#cfefff":"#ffffff"; sx.beginPath(); sx.arc(x,y,size,0,7); sx.fill();
    if(size>1.5){ const g=sx.createRadialGradient(x,y,0,x,y,7); g.addColorStop(0,"rgba(190,240,255,.5)"); g.addColorStop(1,"rgba(190,240,255,0)"); sx.fillStyle=g; sx.fillRect(x-7,y-7,14,14); } }
  sx.globalAlpha=1;
}

/* ---------- planet rim: fragment shader ---------- */
const rc=$("rim");
let gl=null, prog=null, uRes, uS, uT, uR, uC, t0=performance.now(), visible=true;
try{ gl=rc.getContext("webgl",{premultipliedAlpha:true,alpha:true,antialias:false,powerPreference:"low-power",preserveDrawingBuffer:false}); }catch(e){}
const VS="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FS=`precision highp float;
uniform vec2 res; uniform float t; uniform float R; uniform vec2 C; uniform float S;
float h1(float n){return fract(sin(n)*43758.5453);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n2(p);p*=2.03;a*=.5;}return v;}
void main(){
  vec2 px=vec2(gl_FragCoord.x, res.y-gl_FragCoord.y);
  float push=1.+.018*sin(t*.35);
  float r=R*push; vec2 c=C+vec2(0.,(push-1.)*R*.6);
  vec2 v=px-c; float dist=length(v); float d=dist-r;           // >0 outside the planet
  float ang=atan(v.x,v.y);                                        // 0 at the bottom of the planet
  float spot=exp(-pow(ang/0.55,2.));                              // brightest at the bottom centre
  float wide=exp(-pow(ang/1.15,2.));
  float pulse=.86+.14*sin(t*2.1)+.06*sin(t*5.3+1.);
  float plasma=fbm(vec2(ang*34.,t*.55))*1.6+fbm(vec2(ang*90.-t*.9,t*.3))*.6;
  float core=exp(-abs(d)/(2.2*S))*(1.2+plasma*.6);
  float out_=step(0.,d);
  float g1=exp(-max(d,0.)/(22.*S))*.85*out_;
  float g2=exp(-max(d,0.)/(110.*S))*.42*out_;
  float g3=exp(-max(d,0.)/(380.*S))*.16*out_;
  /* light streaks racing outward */
  float sector=floor(ang*170.);
  float hs=h1(sector*1.7);
  float lane=smoothstep(.5,.0,abs(fract(ang*170.)-.5)*2.-.15);
  float run=fract(d/(320.*S)-t*(.35+hs*.5)+hs*7.);
  float streak=step(.9,hs)*lane*smoothstep(0.,.08,run)*smoothstep(.45,.08,run)*exp(-max(d,0.)/(520.*S))*step(0.,d);
  float rays=pow(fbm(vec2(ang*60.,t*.18))*1.15,7.)*exp(-max(d,0.)/(200.*S))*step(0.,d)*2.2;
  float outside=(core+g1+g2+g3)*pulse*(.35+.95*wide)*(.55+.9*spot)+(streak*1.4+rays)*wide;
  /* inside the planet: dark with a lit atmosphere band */
  float inside=0.;
  if(d<0.){ float a=exp(d/(38.*S)); float b=exp(d/(220.*S)); float surf=fbm(vec2(ang*14.,d*.01+t*.05));
    inside=(a*.75+b*.12*surf)*(.3+.9*wide)*pulse; }
  vec3 cCore=vec3(.86,.99,1.);
  vec3 cGlow=vec3(.14,.78,.95);
  vec3 cDeep=vec3(.12,.32,.85);
  vec3 col=cCore*core*(.5+.8*spot)+cGlow*g1+mix(cDeep,cGlow,.35)*(g2+g3*1.2);
  col*=pulse*(.35+.95*wide)*(.55+.9*spot);
  col+=cGlow*streak*wide*.8+cGlow*rays*wide*.35;
  col+=cGlow*inside*.9+cCore*inside*.15;
  float alpha=d<0.?1.:clamp(max(max(col.r,col.g),col.b),0.,1.);
  if(d<0.){ col=col+vec3(.006,.012,.018); }
  gl_FragColor=vec4(min(col,vec3(1.)),alpha);
}`;
function build(){
  const sh=(t,s)=>{ const o=gl.createShader(t); gl.shaderSource(o,s); gl.compileShader(o); if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  prog=gl.createProgram(); gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS)); gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS)); gl.linkProgram(prog); gl.useProgram(prog);
  const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(prog,"p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  uRes=gl.getUniformLocation(prog,"res"); uS=gl.getUniformLocation(prog,"S"); uT=gl.getUniformLocation(prog,"t"); uR=gl.getUniformLocation(prog,"R"); uC=gl.getUniformLocation(prog,"C");
}
let geo={};
function size(){
  drawStars();
  const w=hero.clientWidth, vh=innerHeight, mob=w<900||w<vh;
  const R=(mob?w*1.35:w*.82), apex=mob?Math.min(vh*.24,w*.56):vh*.2;
  const h=Math.min(hero.clientHeight,apex+vh*.62);          // only the part of the sky the glow reaches
  const Q=mob?.5:.6;                                          // canvas pixels per CSS pixel
  rc.style.height=h+"px"; rc.width=Math.round(w*Q); rc.height=Math.round(h*Q);
  geo={R:R*Q,C:[w/2*Q,(apex-R)*Q]};
  if(gl&&prog){ gl.viewport(0,0,rc.width,rc.height); gl.uniform2f(uRes,rc.width,rc.height); gl.uniform1f(uR,geo.R); gl.uniform2f(uC,geo.C[0],geo.C[1]); gl.uniform1f(uS,Q*Math.max(w/1400,.6)); }
  document.documentElement.style.setProperty("--apex",apex+"px");
  if(RM||!loopOn) frame(performance.now(),true);
}
let loopOn=false;
let lastF=0, scrollT=0; addEventListener("scroll",()=>{ scrollT=performance.now(); },{passive:true});
function frame(now,once){
  if(!once&&loopOn) requestAnimationFrame(frame);
  if(!gl||!prog||(!visible&&!once)||document.hidden) return;
  if(!once&&(now-lastF<21||now-scrollT<140)) return; lastF=now;
  gl.uniform1f(uT,(now-t0)/1000); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
if(gl){ try{ build(); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA); document.documentElement.classList.add("rim-ok"); }catch(e){ console.warn(e); gl=null; } }
new IntersectionObserver(es=>{ visible=es[0].isIntersecting; },{threshold:0}).observe(rc);
let lastW=innerWidth; addEventListener("resize",()=>{ if(Math.abs(innerWidth-lastW)<2&&matchMedia("(pointer:coarse)").matches) return; lastW=innerWidth; clearTimeout(size.t); size.t=setTimeout(size,150); });
size();
if(gl&&!RM){ loopOn=true; requestAnimationFrame(frame); }

/* ---------- Member Hub dashboard (live from the toolkit) ---------- */
const load=(k,d)=>{ try{ const v=JSON.parse(localStorage.getItem(k)); return v??d; }catch(e){ return d; } };
const dkey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const fmt=n=>Math.round(n).toLocaleString("en-IN");
function streakOf(days){ let s=0; const d=new Date(); if(!days.includes(dkey(d))) d.setDate(d.getDate()-1); while(days.includes(dkey(d))){ s++; d.setDate(d.getDate()-1); } return s; }
function smooth(pts){ let p=`M${pts[0][0]},${pts[0][1]}`; for(let i=1;i<pts.length;i++){ const [x0,y0]=pts[i-1],[x1,y1]=pts[i], mx=(x0+x1)/2; p+=` C${mx},${y0} ${mx},${y1} ${x1},${y1}`; } return p; }
window.refreshDash=function(){
  const now=new Date(), cal=load("rh_cal_v1",{days:{},goal:null}), st=load("rh_streak_v1",{days:[]}), wat=load("rh_water_v1",{});
  const prof=cal.profile;
  $("dsHi").textContent=`${now.getHours()<12?"Good morning":now.getHours()<17?"Good afternoon":"Good evening"} 👋`;
  $("dsDate").textContent=now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"});
  const today=(cal.days&&cal.days[dkey()])||[], k=today.reduce((a,b)=>a+b.k,0);
  $("dsK").textContent=fmt(k);
  if(cal.goal){ const pct=Math.round(k/cal.goal.k*100); $("dsKp").textContent=pct+"%"; $("dsKp").className=k>cal.goal.k?"dn":"up"; $("dsKg").textContent=`of ${fmt(cal.goal.k)} kcal goal`; }
  else { $("dsKp").textContent="Set goal"; $("dsKg").textContent="tap to start"; }
  const s=streakOf(st.days||[]), done=(st.days||[]).includes(dkey());
  $("dsS").textContent=s; $("dsSp").textContent=s===1?"day":"days"; $("dsSb").textContent=done?"checked in today ✓":"check in today";
  /* week chart */
  const days=[...Array(7)].map((_,i)=>{ const d=new Date(now); d.setDate(now.getDate()-6+i); return [d,((cal.days||{})[dkey(d)]||[]).reduce((a,b)=>a+b.k,0)]; });
  let vals=days.map(x=>x[1]); const demo=vals.every(v=>v===0);
  if(demo) vals=[1850,2120,1760,2240,1980,2060,1420];
  $("dsTag").textContent=demo?"demo · log food to see yours":`avg ${fmt(vals.filter(Boolean).reduce((a,b)=>a+b,0)/Math.max(1,vals.filter(Boolean).length))} kcal`;
  const mx=Math.max(...vals,(cal.goal&&cal.goal.k)||0)*1.15||1, W=600, H=200;
  const pts=vals.map((v,i)=>[20+i*(W-40)/6, H-14-(v/mx)*(H-34)]);
  const line=smooth(pts), area=line+` L${W-20},${H} L20,${H} Z`;
  const goalY=cal.goal?H-14-(cal.goal.k/mx)*(H-34):null;
  $("dsChart").innerHTML=`<defs><linearGradient id="dsA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fd6f2" stop-opacity=".55"/><stop offset="1" stop-color="#3fd6f2" stop-opacity="0"/></linearGradient>
    <filter id="dsF" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs>
    ${[50,100,150].map(y=>`<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.06)"/>`).join("")}
    ${goalY?`<line x1="0" x2="${W}" y1="${goalY}" y2="${goalY}" stroke="rgba(69,181,88,.7)" stroke-dasharray="5 6"/>`:""}
    <path d="${area}" fill="url(#dsA)" class="ds-area"/><path d="${line}" fill="none" stroke="#5fe0f5" stroke-width="5" opacity=".5" filter="url(#dsF)"/>
    <path d="${line}" fill="none" stroke="#8ef0ff" stroke-width="2.5" class="ds-line"/>
    ${pts.map(([x,y],i)=>i===6?`<circle cx="${x}" cy="${y}" r="6" fill="#0b1218" stroke="#8ef0ff" stroke-width="3"/>`:"").join("")}`;
  $("dsX").innerHTML=days.map(([d],i)=>`<span class="${i===6?"on":""}">${i===6?"Today":d.toLocaleDateString("en-IN",{weekday:"short"})}</span>`).join("");
  /* calendar */
  $("dsMonth").textContent=now.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
  const first=new Date(now.getFullYear(),now.getMonth(),1), dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const cells=["Su","Mo","Tu","We","Th","Fr","Sa"].map(x=>`<i class="wd">${x}</i>`);
  for(let i=0;i<first.getDay();i++) cells.push("<i></i>");
  for(let d=1;d<=dim;d++){ const k=dkey(new Date(now.getFullYear(),now.getMonth(),d)); cells.push(`<i class="${d===now.getDate()?"td":""}${(st.days||[]).includes(k)?" ck":""}${d>now.getDate()?" fu":""}">${d}</i>`); }
  $("dsDays").innerHTML=cells.join("");
  /* today rows */
  const toM=t=>{ const [h,m]=t.split(":").map(Number); return h*60+m; }, nm=now.getHours()*60+now.getMinutes();
  const cls=((GYM.schedule||{})[now.getDay()]||[]).find(c=>toM(c[1])>nm);
  const h=now.getHours(), open=h>=GYM.openHour&&h<GYM.closeHour, crowd=open?(GYM.crowd||[])[h-GYM.openHour]||0:0;
  const w=wat[dkey()]||0, wg=prof?Math.max(8,Math.round(prof.w*35/250)):10;
  const rows=[];
  if(GYM.features.schedule!==false) rows.push(["Next class",cls?`${cls[2]} · ${(+cls[0].split(":")[0])%12||12}:${cls[0].split(":")[1]} ${+cls[0].split(":")[0]<12?"AM":"PM"}`:"No more today",cls&&toM(cls[0])<=nm?"live":"", "#classes"]);
  if(GYM.features.crowd!==false) rows.push(["Crowd now",!open?"Closed":crowd<35?"Quiet":crowd<65?"Moderate":"Busy",!open?"dn":crowd<35?"up":crowd<65?"":"dn"]);
  if(GYM.features.toolkit!==false) rows.push(["Water today",`${w} / ${wg} glasses`,w>=wg?"up":"","tool:water"]);
  rows.push(["Gym hours",`${GYM.openHour} AM – ${GYM.closeHour-12} PM`,open?"up":"dn"]);
  $("dsRows").innerHTML=rows.map(([a,b,c,go])=>`<button class="ds-row"${go?` data-go="${go}"`:""}><span>${a}</span><b class="${c}">${b}</b></button>`).join("")
    +`<div class="ds-apps"><span>Quick links</span><b><a href="menu.html">Café</a> · <a href="review.html">Review</a> · <a data-sheet2="wifiSh">Wi-Fi</a></b></div>`;
};
refreshDash();
document.addEventListener("click",e=>{ const g=e.target.closest("[data-go]"); if(g){ const v=g.dataset.go; if(v.startsWith("tool:")) window.openTool&&openTool(v.slice(5)); else document.querySelector(v)&&(window.goTo?goTo(v):document.querySelector(v).scrollIntoView({behavior:"smooth"})); }
  const s2=e.target.closest("[data-sheet2]"); if(s2) $(s2.dataset.sheet2).hidden=false;
  const dg=e.target.closest("[data-dsgo]"); if(dg){ const v=dg.dataset.dsgo; if(v!=="home") window.goTo?goTo(v):document.querySelector(v).scrollIntoView({behavior:"smooth"}); } });
})();
