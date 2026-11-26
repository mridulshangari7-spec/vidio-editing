/* Rhino's Gym page: content, motion and interactions */
(function(){
const $=id=>document.getElementById(id), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const wa=t=>`https://wa.me/${GYM.whatsapp}?text=${encodeURIComponent(t)}`;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE=matchMedia("(hover:hover) and (pointer:fine)").matches;
const G=window.gsap, ST=window.ScrollTrigger, HAS=!!(G&&ST)&&!RM;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), seg=(p,a,b)=>clamp((p-a)/(b-a));
const buzz=p=>{ try{ navigator.vibrate&&navigator.vibrate(p||8); }catch(e){} };
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const inrs=n=>"₹"+Math.round(n).toLocaleString("en-IN");
window.toast=m=>{ const t=$("toast"); t.textContent=m; t.classList.add("on"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("on"),2200); };
if(HAS) G.registerPlugin(ST);

/* ---------- owner's on/off switches ---------- */
const FEAT=GYM.features||{};
$$("[data-f]").forEach(el=>{ if(FEAT[el.dataset.f]===false) el.remove(); });
if(!GYM.sample) $$("[data-sample]").forEach(el=>el.remove());

/* ---------- basic details ---------- */
$("gRate").textContent=GYM.rating; $("gRev").textContent=GYM.reviews; $("area").textContent=GYM.area;
$("mapLink").href=GYM.maps; ["callLink","dCall","mCall"].forEach(i=>$(i)&&($(i).href="tel:"+GYM.phone)); $("mWa").href=wa("Hi Rhino's Gym!");
$("callNo").textContent=GYM.phone.replace(/^\+91(\d{5})(\d{5})$/,"+91 $1 $2");
$("wSsid").textContent=GYM.wifi.ssid; $("wPass").textContent=GYM.wifi.pass; $("payee").textContent=GYM.upi.pn;
if(RT.local) ["orderLink","dOrder"].forEach(i=>$(i)&&($(i).href="menu.html?local"));
if(FEAT.order===false){ $("dOrder").remove(); $("hOrder")&&$("hOrder").remove(); }
["tJoin","hJoin"].forEach(i=>$(i)&&($(i).href=wa("Hi Rhino's Gym! I want to join. Please share membership details.")));
$("dsPro")&&($("dsPro").href=wa("Hi Rhino's Gym! I'm interested in Rhino Pro (personal trainer + diet plan)."));
$("dsCall")&&($("dsCall").href="tel:"+GYM.phone);
(function(){ const h=new Date().getHours(), open=h>=GYM.openHour&&h<GYM.closeHour, f=x=>x===0?"12 AM":x<12?x+" AM":x===12?"12 PM":(x-12)+" PM";
  $("oDot").classList.toggle("off",!open); $("oTxt").textContent=open?`Open now · till ${f(GYM.closeHour)}`:`Closed · opens ${f(GYM.openHour)}`; })();

/* ---------- smooth scroll ---------- */
let lenis=null;
if(HAS&&window.Lenis){ lenis=new Lenis({lerp:.11,smoothWheel:true}); lenis.on("scroll",ST.update); G.ticker.add(t=>lenis.raf(t*1000)); G.ticker.lagSmoothing(0); }
window.goTo=t=>scrollTo(t);
const scrollTo=t=>{ const el=typeof t==="string"?document.querySelector(t):t; if(!el) return; lenis?lenis.scrollTo(el,{offset:-70,duration:1.4}):el.scrollIntoView({behavior:"smooth"}); };

/* ---------- preloader → hero intro ---------- */
const pre=$("pre"), dock=$("dock");
function heroIn(){
  window.HERO_T0=performance.now();
  if(!HAS){ dock.style.transform="translate(-50%,0)"; return; }
  G.from(".top",{opacity:0,y:-20,duration:.9,ease:"power3.out",clearProps:"transform,opacity"});
  G.from("#rim",{opacity:0,duration:2,ease:"power2.out"});
  G.from(".hl .ln>span",{yPercent:115,duration:1.15,stagger:.14,ease:"power4.out",delay:.15});
  G.from(["#hEye","#hLede","#hCta"],{y:26,opacity:0,duration:.9,stagger:.12,ease:"power3.out",delay:.55});
  G.from("#dashWrap",{y:180,opacity:0,duration:1.5,ease:"power3.out",delay:.75});
  G.from(".ds-brand,.ds-i,.ds-pro",{x:-18,opacity:0,duration:.6,stagger:.04,ease:"power2.out",delay:1.25});
  G.from(".ds-top,.ds-st,.ds-chart,.ds-cal",{y:28,opacity:0,duration:.8,stagger:.1,ease:"power3.out",delay:1.35});
  G.fromTo(".ds-line",{strokeDasharray:1400,strokeDashoffset:1400},{strokeDashoffset:0,duration:2,ease:"power2.inOut",delay:1.6});
  G.from(".ds-area",{opacity:0,duration:1.2,delay:2.2});
  G.fromTo(dock,{x:0,y:0,xPercent:-50,yPercent:160},{x:0,y:0,xPercent:-50,yPercent:0,duration:1,ease:"back.out(1.4)",delay:1.8});
}
if(HAS){
  lenis&&lenis.stop();
  let loaded=false; const o={v:0}, tl=G.timeline({onComplete:()=>{ pre.remove(); lenis&&lenis.start(); }});
  tl.from(".pre-in img",{scale:.3,opacity:0,duration:.7,ease:"back.out(1.7)"})
    .from(".pre-name span",{yPercent:110,duration:.6,stagger:.05,ease:"power3.out"},"-=.4")
    .to(o,{v:88,duration:1.2,ease:"power2.out",onUpdate:()=>{ $("preN").textContent=Math.round(o.v); $("preBar").style.width=o.v+"%"; }},"-=.5")
    .add(()=>{ if(!loaded) tl.pause(); })
    .to(o,{v:100,duration:.35,ease:"power1.in",onUpdate:()=>{ $("preN").textContent=Math.round(o.v); $("preBar").style.width=o.v+"%"; }})
    .to(".pre-in",{y:-30,opacity:0,duration:.5,ease:"power2.in"})
    .to(".pre-p.p1",{yPercent:-100,duration:.9,ease:"expo.inOut"},"-=.1")
    .to(".pre-p.p2",{yPercent:100,duration:.9,ease:"expo.inOut",onStart:heroIn},"<");
  const ready=()=>{ loaded=true; if(tl.paused()) tl.play(); };
  if(document.readyState==="complete") ready(); else addEventListener("load",ready,{once:true});
  setTimeout(ready,6000);   // never wait more than 6 s
} else { pre.remove(); heroIn(); }

/* ---------- top bar + menu ---------- */
const top=$("top"), menu=$("menu"); let lastY=0, menuOpen=false;
function onScrollUI(){ const y=scrollY, H=document.documentElement.scrollHeight-innerHeight;
  $("prog").style.transform=`scaleX(${H>0?y/H:0})`;
  top.classList.toggle("solid",y>innerHeight*.5); if(!menuOpen) top.classList.toggle("hide",y>lastY+4&&y>innerHeight); if(y<lastY-4) top.classList.remove("hide"); lastY=y; }
function toggleMenu(open){ menuOpen=open; document.documentElement.classList.toggle("menu-open",open); top.classList.remove("hide");
  if(open){ menu.hidden=false; lenis&&lenis.stop();
    if(HAS){ G.fromTo(menu,{clipPath:"circle(0% at calc(100% - 38px) 34px)"},{clipPath:"circle(150% at calc(100% - 38px) 34px)",duration:.8,ease:"expo.inOut"}); G.from(".menu-in a",{y:50,opacity:0,stagger:.06,duration:.7,ease:"power3.out",delay:.25}); }
    else menu.style.clipPath="none"; }
  else { lenis&&lenis.start(); if(HAS) G.to(menu,{clipPath:"circle(0% at calc(100% - 38px) 34px)",duration:.6,ease:"expo.inOut",onComplete:()=>menu.hidden=true}); else menu.hidden=true; } }
$("burger").onclick=()=>{ buzz(); toggleMenu(!menuOpen); };
$$("[data-nav]").forEach(a=>a.addEventListener("click",e=>{ e.preventDefault(); toggleMenu(false); setTimeout(()=>scrollTo(a.getAttribute("href")),350); }));
$$(".brand").forEach(a=>a.addEventListener("click",e=>{ e.preventDefault(); lenis?lenis.scrollTo(0,{duration:1.6}):scrollTo(0,0); }));

addEventListener("scroll",onScrollUI,{passive:true}); onScrollUI();

/* ---------- headings: word reveal ---------- */
$$("[data-split]").forEach(h=>{ h.innerHTML=h.textContent.split(" ").map(w=>`<span class="wd"><span>${esc(w)}</span></span>`).join(" ");
  if(HAS) G.from(h.querySelectorAll(".wd>span"),{yPercent:115,rotate:6,duration:1,stagger:.07,ease:"power4.out",scrollTrigger:{trigger:h,start:"top 88%"}}); });
if(HAS){ $$(".sh2 .eye").forEach(e=>G.from(e,{x:-30,opacity:0,duration:.8,ease:"power3.out",scrollTrigger:{trigger:e,start:"top 90%"}})); }

/* ---------- manifesto: words light up while you scroll ---------- */
(function(){ const p=$("mani"); if(!p) return; const HL=["stronger","transformation","premium","care","café"];
  p.innerHTML=p.textContent.split(" ").map(w=>`<span class="mw${HL.some(h=>w.toLowerCase().startsWith(h))?" hl":""}">${esc(w)}</span>`).join(" ");
  if(HAS) G.to(p.querySelectorAll(".mw"),{opacity:1,stagger:.1,ease:"none",scrollTrigger:{trigger:p,start:"top 80%",end:"bottom 50%",scrub:true}});
  else p.querySelectorAll(".mw").forEach(s=>s.style.opacity=1); })();

/* ---------- marquees: speed + skew follow your scrolling ---------- */
if(HAS){ const els=$$(".mq-t"), mqs=els.map((el,i)=>G.fromTo(el,{xPercent:i?-50:0},{xPercent:i?0:-50,duration:i?26:20,ease:"none",repeat:-1}));
  let vel=0, cur=1, dir=1, sk=0;
  if(lenis) lenis.on("scroll",e=>{ vel=e.velocity; }); else { let ly=scrollY; addEventListener("scroll",()=>{ vel=scrollY-ly; ly=scrollY; },{passive:true}); }
  G.ticker.add(()=>{ if(Math.abs(vel)>.3) dir=vel>0?1:-1; const target=dir*(1+Math.min(4,Math.abs(vel)/6)); cur+=(target-cur)*.08; mqs.forEach(t=>t.timeScale(cur));
    const ts=Math.max(-10,Math.min(10,-vel*.4)); if(Math.abs(ts-sk)>.05){ sk+=(ts-sk)*.15; els.forEach(el=>G.set(el,{skewX:sk})); } vel*=.9; }); }

/* ---------- food slideshow ---------- */
if($("fps")){ const FOOD=[["shakes","Protein Shake",150],["salad","Protein Salad",200],["sandwich","Paneer Tikka Sandwich",270],["kebab","Malai Chicken Tikka",320],["biryani","Chicken Biryani",310],["pizza","Whole Wheat Pizza",210],["soup","Veg Protein Soup",160]];
  $("fps").innerHTML=FOOD.map((f,i)=>`<div class="fp${i?"":" on"}" style="background-image:url(img/${f[0]}.jpg)"></div>`).join("");
  let fi=0; const fps=$("fps").children, setF=()=>{ $("fPrice").textContent=`${FOOD[fi][1]} · ${inrs(FOOD[fi][2])}`; }; setF();
  setInterval(()=>{ if(document.hidden) return; fps[fi].classList.remove("on"); fi=(fi+1)%FOOD.length; fps[fi].classList.add("on"); $("fPrice").classList.add("swap"); setTimeout(()=>{ setF(); $("fPrice").classList.remove("swap"); },350); },3000);
  if(HAS) G.fromTo("#orderLink",{clipPath:"inset(30% 10% 30% 10% round 28px)"},{clipPath:"inset(0% 0% 0% 0% round 28px)",ease:"none",scrollTrigger:{trigger:"#orderLink",start:"top 95%",end:"top 45%",scrub:true}}); }

/* ---------- facilities: horizontal scroll ---------- */
(function(){ const tr=$("hzTrack"); if(!tr) return;
  const C=[["rgba(95,208,230,.35)","#5fd0e6"],["rgba(239,125,125,.32)","#ef7d7d"],["rgba(242,184,75,.32)","#f2b84b"],["rgba(150,140,255,.32)","#a79cff"],["rgba(120,220,150,.32)","#7ddc96"]];
  const list=GYM.facilities||[]; $("hzT").textContent=String(list.length).padStart(2,"0");
  tr.innerHTML=list.map(([k,n,d],i)=>`<div class="fc" style="--c1:${C[i%5][0]};--c2:${C[i%5][1]}"><span class="n">${String(i+1).padStart(2,"0")}</span><svg><use href="#f-${k}"/></svg><b>${esc(n)}</b><span>${esc(d)}</span></div>`).join("");
  if(!HAS){ tr.parentElement.style.height="auto"; tr.style.overflowX="auto"; tr.style.width="100%"; tr.style.paddingBottom="10px"; return; }
  const dist=()=>Math.max(0,tr.scrollWidth-innerWidth);
  const tw=G.to(tr,{x:()=>-dist(),ease:"none",scrollTrigger:{trigger:"#hzPin",pin:true,start:"top top",end:()=>"+="+dist(),scrub:.8,invalidateOnRefresh:true,anticipatePin:1,
    onUpdate:s=>{ $("hzBar").style.width=s.progress*100+"%"; $("hzN").textContent=String(Math.min(list.length,1+Math.floor(s.progress*list.length*.999))).padStart(2,"0"); }}});
  $$(".fc",tr).forEach(c=>{ G.from(c.querySelector("svg"),{rotate:-25,scale:.6,opacity:0,ease:"none",scrollTrigger:{trigger:c,containerAnimation:tw,start:"left 95%",end:"left 45%",scrub:true}});
    G.from(c.querySelector(".n"),{x:60,ease:"none",scrollTrigger:{trigger:c,containerAnimation:tw,start:"left right",end:"right left",scrub:true}}); });
})();

/* ---------- toolkit ---------- */
$$("[data-tool]").forEach(b=>b.addEventListener("click",()=>{ openTool(b.dataset.tool); try{ history.pushState({tool:1},""); }catch(e){} }));
$("pBack").onclick=()=>{ if(history.state&&history.state.tool) history.back(); else closeTool(); };
addEventListener("popstate",()=>{ if(!$("panel").hidden) closeTool(); });
{ const rt=window.refreshToolCards; window.refreshToolCards=()=>{ rt(); window.refreshDash&&refreshDash(); }; }
refreshToolCards();

/* ---------- class timetable ---------- */
(function(){ if(!$("days")) return; const S=GYM.schedule||{}, now=new Date(), D=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const days=[...Array(7)].map((_,i)=>{ const d=new Date(now); d.setDate(now.getDate()+i); return d; });
  $("days").innerHTML=days.map((d,i)=>`<button type="button" data-d="${i}" class="${i?"":"on td"}"><small>${i?D[d.getDay()]:"Today"}</small><b>${d.getDate()}</b></button>`).join("");
  const toM=t=>{ const [h,m]=t.split(":").map(Number); return h*60+m; }, fmt=t=>{ const [h,m]=t.split(":").map(Number); return `${h%12||12}:${String(m).padStart(2,"0")}`; };
  const show=i=>{ const d=days[i], list=S[d.getDay()]||[], nm=now.getHours()*60+now.getMinutes();
    $("cls").innerHTML=list.length?list.map(([a,b,n,c])=>{ let st=""; if(i===0){ if(nm>=toM(a)&&nm<toM(b)) st=`<span class="lv">LIVE NOW</span>`; else if(toM(a)>nm&&toM(a)-nm<=90) st=`<span class="lv soon">IN ${toM(a)-nm} MIN</span>`; else if(nm>=toM(b)) st=`<span class="lv done">DONE</span>`; }
      return `<div class="cl"><div class="tm"><b>${fmt(a)}</b><small>${+a.split(":")[0]<12?"AM":"PM"}</small></div><i class="ln"></i><div class="nm"><b>${esc(n)}</b><span>${esc(c)} · ${toM(b)-toM(a)} min</span></div>${st}</div>`; }).join("")
      :`<div class="none">No group classes this day. The gym floor is open as usual 💪</div>`;
    if(HAS) G.from("#cls .cl",{x:40,opacity:0,stagger:.07,duration:.6,ease:"power3.out"}); };
  $("days").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; $$("#days button").forEach(x=>x.classList.toggle("on",x===b)); buzz(); show(+b.dataset.d); });
  show(0); })();

/* ---------- crowd meter ---------- */
(function(){ if(!$("crBars")) return; const c=GYM.crowd||[], h=new Date().getHours(), idx=h-GYM.openHour, open=h>=GYM.openHour&&h<GYM.closeHour;
  $("crBars").innerHTML=c.map((v,i)=>`<i class="${i===idx&&open?"now":""}" style="height:${Math.max(6,v)}%"></i>`).join("");
  const v=open?c[idx]||0:0; $("crNow").textContent=!open?"Closed right now":v<35?"Quiet right now · great time to train 🟢":v<65?"Moderately busy right now 🟡":"Peak hours right now 🔥";
  if(HAS) G.from("#crBars i",{scaleY:0,stagger:.03,duration:.8,ease:"back.out(1.6)",scrollTrigger:{trigger:"#crBars",start:"top 90%"}}); })();

/* ---------- stacking cards ---------- */
(function(){ const cards=$$("#stack .sc"); cards.forEach((c,i)=>c.style.setProperty("--i",i));
  if(!HAS) return; cards.forEach((c,i)=>{ if(i===cards.length-1) return;
    G.to(c,{scale:.92,opacity:.55,ease:"none",scrollTrigger:{trigger:cards[i+1],start:"top 55%",end:"top "+(90+(i+1)*14)+"px",scrub:true}}); });
  cards.forEach(c=>G.from(c.querySelector(".em"),{scale:0,rotate:-40,duration:.8,ease:"back.out(2)",scrollTrigger:{trigger:c,start:"top 85%"}})); })();

/* ---------- counters ---------- */
const CNT={rate:[+GYM.rating,1],rev:[+GYM.reviews,0],hrs:[GYM.closeHour-GYM.openHour,0],menu:[Math.floor(Object.keys(CAFE.items).length/10)*10,0]};
$$("[data-count]").forEach(el=>{ const [to,dp]=CNT[el.dataset.count]; if(!HAS){ el.textContent=to.toFixed(dp); return; }
  const o={v:0}; G.to(o,{v:to,duration:2,ease:"power3.out",onUpdate:()=>el.textContent=o.v.toFixed(dp),scrollTrigger:{trigger:el,start:"top 90%"}}); });

/* ---------- pricing ---------- */
(function(){ if(!$("plans")) return; const P=GYM.pricing||[], LBL={m:"/ month",q:"/ 3 months",y:"/ year"}, MUL={m:1,q:3,y:12}; let per="m";
  $("plans").innerHTML=P.map((p,i)=>`<div class="pl${p.tag?" pop":""}">${p.tag?`<span class="tg2">${esc(p.tag)}</span>`:""}<h4>${esc(p.name)}</h4>
    <div class="pr"><b data-pr="${i}">${inrs(p.m)}</b><span data-lb>${LBL.m}</span></div><div class="sv" data-sv="${i}"></div>
    <ul>${p.perks.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><a class="btn${p.tag?"":" ghost"} rp" data-join="${i}" target="_blank" rel="noopener">Join ${esc(p.name)}</a></div>`).join("");
  const draw=(anim)=>{ P.forEach((p,i)=>{ const el=document.querySelector(`[data-pr="${i}"]`), from=+el.dataset.v||p.m, to=p[per];
      if(anim&&HAS){ const o={v:from}; G.to(o,{v:to,duration:.8,ease:"power3.out",onUpdate:()=>el.textContent=inrs(o.v)}); G.fromTo(el,{y:-12,opacity:.3},{y:0,opacity:1,duration:.5,ease:"back.out(2)"}); } else el.textContent=inrs(to);
      el.dataset.v=to; const save=p.m*MUL[per]-to; document.querySelector(`[data-sv="${i}"]`).textContent=save>0?`You save ${inrs(save)}`:"";
      document.querySelector(`[data-join="${i}"]`).href=wa(`Hi Rhino's Gym! I want to join the ${p.name} plan (${({m:"monthly",q:"3 months",y:"yearly"})[per]}).`); });
    $$("#plans [data-lb]").forEach(s=>s.textContent=LBL[per]); };
  $("per").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; per=b.dataset.per; const i=["m","q","y"].indexOf(per);
    $$("#per button").forEach(x=>x.classList.toggle("on",x===b)); $("perPill").style.transform=`translateX(${i*100}%)`; buzz(); draw(true); });
  draw(false);
  if(HAS) G.from("#plans .pl",{y:60,opacity:0,stagger:.12,duration:.9,ease:"power3.out",scrollTrigger:{trigger:"#plans",start:"top 85%"}}); })();

/* ---------- coaches ---------- */
(function(){ if(!$("coaches")) return; const A=[["#3f7a8a","#5fd0e6"],["#8a3f6b","#ef7d9d"],["#7a5a26","#f2b84b"],["#3d4f8a","#a79cff"]];
  $("coaches").innerHTML=(GYM.trainers||[]).map(([n,r,y],i)=>`<div class="co" style="--a1:${A[i%4][0]};--a2:${A[i%4][1]}"><div class="av">${esc(n.replace(/^Coach\s+/,"").split(" ").map(w=>w[0]).join("").slice(0,2))}</div>
    <b>${esc(n)}</b><span>${esc(r)}</span><em>${esc(y)} experience</em><a class="bk rp" target="_blank" rel="noopener" href="${wa(`Hi Rhino's Gym! I'd like to book a session with ${n}.`)}"><svg><use href="#i-wa"/></svg>Book a session</a></div>`).join("");
  if(HAS) G.from("#coaches .co",{x:80,opacity:0,stagger:.1,duration:.9,ease:"power3.out",scrollTrigger:{trigger:"#coaches",start:"top 88%"}}); })();

/* ---------- social ---------- */
(function(){ const el=$("soc"); if(!el) return; const SOC=[["instagram","Instagram","ig","linear-gradient(135deg,#f9a03f,#e1306c,#833ab4)"],["facebook","Facebook","fb","#1877f2"],["snapchat","Snapchat","snap","#f7c600"],["youtube","YouTube","yt","#ff0000"],["threads","Threads","th","#000"],["website","Website","globe","#3f7a8a"]];
  el.innerHTML=SOC.filter(([k])=>GYM.social[k]).map(([k,n,i,c])=>`<a class="gc rp" href="${GYM.social[k]}" target="_blank" rel="noopener"><i style="background:${c}"><svg><use href="#i-${i}"/></svg></i>${n}</a>`).join(""); })();

/* ---------- general reveals ---------- */
if(HAS){
  ST.batch(".bento>*, .kit>*, .stats>*, .rows>*, .map, .soc>*, .crowd",{start:"top 92%",once:true,
    onEnter:b=>G.from(b,{y:50,opacity:0,scale:.96,stagger:.08,duration:.9,ease:"power3.out",clearProps:"transform,opacity"})});
  G.fromTo("#ftBig",{backgroundSize:"0% 100%"},{backgroundSize:"100% 100%",ease:"none",scrollTrigger:{trigger:".ft",start:"top 85%",end:"bottom bottom",scrub:true}});
  G.from("#ftBig",{yPercent:60,scale:.8,ease:"none",scrollTrigger:{trigger:".ft",start:"top bottom",end:"bottom bottom",scrub:true}});
  G.from(".mani .eye",{x:-30,opacity:0,duration:.8,scrollTrigger:{trigger:".mani",start:"top 85%"}});
}

/* ---------- cursor + magnetic (desktop) ---------- */
if(FINE&&HAS){ const cur=$("cur"), qx=G.quickTo(cur,"x",{duration:.35,ease:"power3"}), qy=G.quickTo(cur,"y",{duration:.35,ease:"power3"});
  addEventListener("pointermove",e=>{ cur.classList.add("on"); qx(e.clientX); qy(e.clientY); },{passive:true});
  document.addEventListener("pointerover",e=>cur.classList.toggle("big",!!e.target.closest("a,button")));
  $$(".go,.dock .main,.burger").forEach(m=>{ m.addEventListener("pointermove",e=>{ const r=m.getBoundingClientRect(); G.to(m,{x:(e.clientX-r.left-r.width/2)*.3,y:(e.clientY-r.top-r.height/2)*.3,duration:.4}); });
    m.addEventListener("pointerleave",()=>G.to(m,{x:0,y:0,duration:.6,ease:"elastic.out(1,.4)"})); });
  $$(".b-order,.b-goal,.k-cal,.pl").forEach(c=>{ c.addEventListener("pointermove",e=>{ const r=c.getBoundingClientRect(); G.to(c,{rotateY:((e.clientX-r.left)/r.width-.5)*8,rotateX:-((e.clientY-r.top)/r.height-.5)*8,transformPerspective:800,duration:.5}); });
    c.addEventListener("pointerleave",()=>G.to(c,{rotateX:0,rotateY:0,duration:.8,ease:"elastic.out(1,.5)"})); }); }

/* ---------- finger spotlight + ripple ---------- */
function spot(e){ const c=e.target.closest&&e.target.closest(".gc"); if(!c) return; const r=c.getBoundingClientRect(); c.style.setProperty("--mx",(e.clientX-r.left)+"px"); c.style.setProperty("--my",(e.clientY-r.top)+"px"); c.style.setProperty("--sp",1); }
if(FINE){ document.addEventListener("pointermove",spot,{passive:true}); }
document.addEventListener("pointerout",e=>{ const c=e.target.closest&&e.target.closest(".gc"); if(c&&!c.contains(e.relatedTarget)) c.style.setProperty("--sp",0); });
document.addEventListener("pointerdown",e=>{ const el=e.target.closest&&e.target.closest(".rp"); if(!el||RM) return; const r=el.getBoundingClientRect(), s=Math.max(r.width,r.height);
  const d=document.createElement("span"); d.className="rpl"; d.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`; el.appendChild(d); setTimeout(()=>d.remove(),700); buzz(); });

/* ---------- sheets + forms ---------- */
const closeAll=()=>{ $$(".sh").forEach(s=>s.hidden=true); lenis&&!menuOpen&&lenis.start(); };
$$("[data-sheet]").forEach(b=>b.addEventListener("click",()=>{ $(b.dataset.sheet).hidden=false; lenis&&lenis.stop(); }));
$$(".sh").forEach(s=>s.addEventListener("click",e=>{ if(e.target===s||e.target.closest("[data-close]")) closeAll(); }));
addEventListener("keydown",e=>{ if(e.key==="Escape"){ closeAll(); if(!$("panel").hidden) closeTool(); if(menuOpen) toggleMenu(false); } });
$$(".opt").forEach(g=>g.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; g.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b)); buzz(); }));
const pick=g=>{ const b=document.querySelector(`[data-group=${g}] .on`); return b?b.textContent:"-"; };
const go=t=>{ window.open(wa(t),"_blank"); closeAll(); };
$("workSend").onclick=()=>go(`Hi Rhino's Gym! 💪 I'd like a workout plan.\nName: ${$("wName").value||"-"}\nGoal: ${pick("wGoal")}\nLevel: ${pick("wLevel")}\nDays/week: ${pick("wDays")}`);
$("dietSend").onclick=()=>go(`Hi Rhino's Gym! 🥗 I'd like a diet plan.\nName: ${$("dName").value||"-"}\nWeight: ${$("dWt").value||"-"} kg, Height: ${$("dHt").value||"-"} cm\nGoal: ${pick("dGoal")}\nFood: ${pick("dFood")}`);
$("fbSend").onclick=()=>{ const t=$("fbTxt").value.trim(); if(!t){ toast("Please write your message"); return; } go(`Private feedback for Rhino's Gym:\n${t}`); };
$("trialSend").onclick=()=>go(`Hi Rhino's Gym! I'd like to book a free trial session.\nName: ${$("tName").value||"-"}\nPreferred time: ${pick("tTime")}`);
$("wCopy").onclick=()=>{ const ok=()=>toast("Password copied ✓"); if(navigator.clipboard) navigator.clipboard.writeText(GYM.wifi.pass).then(ok,()=>toast(GYM.wifi.pass)); else toast(GYM.wifi.pass); };
const updPay=()=>{ const a=+$("payAmt").value||0; $("payGo").href=upiLink(GYM.upi,a||"",`Rhino's Gym fees${$("payName").value?" - "+$("payName").value:""}`); };
["payAmt","payName"].forEach(i=>$(i).addEventListener("input",updPay)); updPay();
const ANG=v=>Math.max(-90,Math.min(90,(v-15)/20*180-90)), PT=a=>[110+92*Math.sin(a*Math.PI/180),108-92*Math.cos(a*Math.PI/180)].map(n=>n.toFixed(1)).join(" ");
$("bArcs").innerHTML=[[15,18.5,"#7fb0bf"],[18.5,25,"#3ddc84"],[25,30,"#f2b84b"],[30,35,"#ef5350"]].map(([a,b,c])=>`<path d="M${PT(ANG(a)+1.5)}A92 92 0 0 1 ${PT(ANG(b)-1.5)}" stroke="${c}"/>`).join("");
const bmi=()=>{ const w=+$("bWt").value, h=+$("bHt").value/100; if(!w||!h||h<1){ $("bVal").textContent="--"; $("bCat").textContent="Enter your weight and height"; $("bNd").style.transform="translateX(-50%) rotate(-90deg)"; return; }
  const v=w/(h*h); $("bVal").textContent=v.toFixed(1); $("bCat").textContent=v<18.5?"Underweight":v<25?"Healthy ✅":v<30?"Overweight":"Obese"; $("bNd").style.transform=`translateX(-50%) rotate(${ANG(v)}deg)`; };
["bWt","bHt"].forEach(i=>$(i).addEventListener("input",bmi));
$("shareBtn").onclick=async()=>{ const d={title:GYM.name,text:`Train with me at ${GYM.name}, Ranjit Avenue, Amritsar 💪`,url:location.href.split("?")[0]};
  if(navigator.share){ try{ await navigator.share(d); }catch(e){} } else window.open(`https://wa.me/?text=${encodeURIComponent(d.text+" "+d.url)}`,"_blank"); };

if(HAS){ ["#home","#facilities","#toolkit","#classes","#pricing"].forEach(id=>{ const el=document.querySelector(id), a=document.querySelector(`.tnav a[href="${id}"]`); if(!el||!a) return;
    ST.create({trigger:el,start:"top 45%",end:"bottom 45%",onToggle:t=>{ if(t.isActive){ $$(".tnav a").forEach(x=>x.classList.toggle("on",x===a)); } }}); });
  addEventListener("load",()=>ST.refresh()); document.fonts&&document.fonts.ready.then(()=>ST.refresh()); }
})();
