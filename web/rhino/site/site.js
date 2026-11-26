/* Rhino's Gym studio site: content + interactions (no libraries) */
(function(){
"use strict";
const $=id=>document.getElementById(id), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const wa=t=>`https://wa.me/${GYM.whatsapp}?text=${encodeURIComponent(t)}`;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const buzz=p=>{ try{ navigator.vibrate&&navigator.vibrate(p||8); }catch(e){} };
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const set=(id,v)=>{ const e=$(id); if(e) e.textContent=v; };
window.toast=m=>{ const t=$("toast"); t.textContent=m; t.classList.add("on"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("on"),2300); };

/* ---------- owner switches: remove whatever is turned off ---------- */
const FEAT=GYM.features||{};
$$("[data-f]").forEach(el=>{ if(FEAT[el.dataset.f]===false) el.remove(); });

/* ---------- real details ---------- */
const phonePretty=GYM.phone.replace(/^\+91(\d{5})(\d{5})$/,"+91 $1 $2");
set("gRate",GYM.rating); set("gRev",GYM.reviews); set("area",GYM.area); set("mArea",GYM.area); set("hrs",GYM.hours.replace(/^Open daily · /,"Every day, ")); set("callNo",phonePretty); set("callNo2",phonePretty);
set("wSsid",GYM.wifi.ssid); set("wPass",GYM.wifi.pass); set("payee",GYM.upi.pn); set("yr",new Date().getFullYear());
$("gChip").href=GYM.google; $("mapLink").href=GYM.maps;
$$("[data-review]").forEach(a=>a.href=GYM.google);   /* Review opens Google reviews directly */
["callLink","dCall","mCall","callBtn","callNo2"].forEach(i=>$(i)&&($(i).href="tel:"+GYM.phone));
$("mWa").href=wa("Hi Rhino's Gym!");
["joinWa"].forEach(i=>$(i)&&($(i).href=wa("Hi Rhino's Gym! I want to join. Please share membership details.")));
const local=new URLSearchParams(location.search).has("local");
if(local) $$('a[href="menu.html"]').forEach(a=>a.href="menu.html?local");
(function(){ const h=new Date().getHours(), open=h>=GYM.openHour&&h<GYM.closeHour, f=x=>x===0?"12 AM":x<12?x+" AM":x===12?"12 PM":(x-12)+" PM";
  const txt=open?`Open now · till ${f(GYM.closeHour)}`:`Closed · opens ${f(GYM.openHour)}`;
  ["oDot","oDot2"].forEach(i=>$(i)&&$(i).classList.toggle("off",!open)); set("oTxt",txt); set("oTxt2",txt); })();

/* ---------- menu overlay ---------- */
const menu=$("menu"), mb=$("menuBtn"); let menuOpen=false;
function toggleMenu(o){ menuOpen=o; menu.classList.toggle("open",o); menu.setAttribute("aria-hidden",!o); mb.setAttribute("aria-expanded",o); document.documentElement.classList.toggle("lock",o);
  if(o) setTimeout(()=>$("menuClose").focus(),50); else mb.focus({preventScroll:true}); }
mb.addEventListener("click",()=>toggleMenu(true)); $("menuClose").addEventListener("click",()=>toggleMenu(false));
$$("[data-close-menu]").forEach(a=>a.addEventListener("click",()=>toggleMenu(false)));

/* ---------- the poster: hide the hint once someone tugs it ---------- */
$("cloth").addEventListener("pointerdown",()=>setTimeout(()=>{ if($("cloth").classList.contains("is-held")) $("hero").classList.add("tugged"); },30));

/* ---------- reveals ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }),{rootMargin:"0px 0px -8% 0px"});
$$(".rv,.rvs,.ft-big").forEach(el=>io.observe(el));

/* manifesto: words light up as you scroll */
(function(){ const p=$("mani"); if(!p) return; p.innerHTML=p.textContent.trim().split(/\s+/).map(w=>`<span class="w">${esc(w)}</span> `).join("");
  const ws=$$(".w",p); let tick=false;
  const upd=()=>{ tick=false; const r=p.getBoundingClientRect(), vh=innerHeight, k=Math.min(1,Math.max(0,(vh*.85-r.top)/(r.height+vh*.35)));
    const n=Math.round(k*ws.length); ws.forEach((w,i)=>w.classList.toggle("on",RM||i<n)); };
  addEventListener("scroll",()=>{ if(!tick){ tick=true; requestAnimationFrame(upd); } },{passive:true}); upd(); })();

/* counters */
(function(){ const menuN=(window.CAFE&&CAFE.menu)?CAFE.menu.reduce((a,c)=>a+c.items.length,0):0;
  const V={rate:+GYM.rating,rev:+GYM.reviews,hrs:GYM.closeHour-GYM.openHour,menu:menuN};
  const co=new IntersectionObserver(es=>es.forEach(e=>{ if(!e.isIntersecting) return; co.unobserve(e.target); const el=e.target, to=V[el.dataset.count]||0, dec=to%1?1:0, t0=performance.now();
    const f=now=>{ const k=RM?1:Math.min(1,(now-t0)/1400), v=to*(1-Math.pow(1-k,3)); el.textContent=dec?v.toFixed(1):Math.round(v); if(k<1) requestAnimationFrame(f); }; requestAnimationFrame(f); }),{threshold:.6});
  $$("[data-count]").forEach(el=>co.observe(el)); })();

/* ---------- café: rotating plates + dish rail (real menu items) ---------- */
(function(){ const F=(window.CAFE&&CAFE.featured)||[]; if(!F.length) return;
  const pl=$("plates"), now=$("plateNow");
  if(pl){ pl.innerHTML=F.map(f=>`<img src="${f.img}" alt="" loading="lazy" decoding="async">`).join(""); const ims=$$("img",pl); let k=0;
    const show=()=>{ ims.forEach((im,i)=>{ im.classList.toggle("on",i===k); im.classList.toggle("out",i===(k-1+ims.length)%ims.length); });
      const it=F[k].it; if(now&&it) now.innerHTML=`Now showing: <b>${esc(it.n)}</b> · ${inr(it.p)}`; };
    show(); if(!RM) setInterval(()=>{ if(document.hidden) return; k=(k+1)%ims.length; show(); },2600); }
  const rail=$("rail");
  if(rail) rail.innerHTML=F.map(f=>{ const it=f.it; return `<a class="dish" href="menu.html${local?"?local":""}#d-${it.id}"><div class="ph"><img src="${f.img}" alt="${esc(it.n)}" loading="lazy" decoding="async"></div>
    <b><span class="vg${it.v?"":" nv"}"><i></i></span>${esc(it.n)}</b><span>${inr(it.p)} · ${esc(f.tag.toLowerCase().replace(/^./,c=>c.toUpperCase()))}</span></a>`; }).join("");
  set("cafeLine",CAFE.line+".");
  /* drag to scroll on desktop */
  if(rail){ let down=false, sx=0, sl=0, moved=false;
    rail.addEventListener("pointerdown",e=>{ if(e.pointerType!=="mouse") return; down=true; moved=false; sx=e.clientX; sl=rail.scrollLeft; rail.style.scrollSnapType="none"; });
    addEventListener("pointermove",e=>{ if(!down) return; const d=e.clientX-sx; if(Math.abs(d)>4) moved=true; rail.scrollLeft=sl-d; });
    addEventListener("pointerup",()=>{ if(!down) return; down=false; rail.style.scrollSnapType=""; });
    rail.addEventListener("click",e=>{ if(moved){ e.preventDefault(); moved=false; } },true); }
})();

/* ---------- facilities ---------- */
(function(){ const el=$("fac"); if(!el||!GYM.facilities) return;
  const IC={strength:"dumb",cardio:"heart",functional:"kb",machines:"gear",yoga:"yoga",pt:"coach",cafe:"food",locker:"lock",steam:"steam",parking:"car"};
  el.innerHTML=GYM.facilities.map(([k,n,d],i)=>`<div class="fac-row"><span class="n">${String(i+1).padStart(2,"0")}</span><b>${esc(n)}</b><span>${esc(d)}</span><svg class="ic"><use href="#i-${IC[k]||"bolt"}"/></svg></div>`).join(""); })();

/* ---------- social ---------- */
(function(){ const el=$("soc"); if(!el) return; const S=[["instagram","Instagram","ig"],["facebook","Facebook","globe"],["snapchat","Snapchat","globe"],["youtube","YouTube","globe"],["threads","Threads","th"],["website","Website","globe"]];
  el.innerHTML=S.filter(([k])=>GYM.social[k]).map(([k,n,i])=>`<a class="chip" href="${GYM.social[k]}" target="_blank" rel="noopener"><svg class="ic" style="width:16px;height:16px"><use href="#i-${i}"/></svg>${n}</a>`).join(""); })();

/* ---------- toolkit (tools.js renders the panels) ---------- */
$$("[data-tool]").forEach(b=>b.addEventListener("click",()=>{ openTool(b.dataset.tool); try{ history.pushState({tool:1},""); }catch(e){} }));
$("pBack").onclick=()=>{ if(history.state&&history.state.tool) history.back(); else closeTool(); };
addEventListener("popstate",()=>{ if(!$("panel").hidden) closeTool(); });
{ const rt=window.refreshToolCards; window.refreshToolCards=()=>{ rt&&rt();
    let cal={}; try{ cal=JSON.parse(localStorage.getItem("rh_cal_v1"))||{}; }catch(e){}
    const d=new Date(), key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const eaten=Math.round(((cal.days||{})[key]||[]).reduce((a,b)=>a+(b.k||0),0)), goal=cal.goal&&cal.goal.k;
    set("kNum",goal?eaten.toLocaleString("en-IN"):"0"); set("kCal",goal?`of ${goal.toLocaleString("en-IN")} kcal`:"Set your goal");
    const r=$("kRing2"); if(r){ const C=2*Math.PI*52; r.style.strokeDasharray=C; r.style.strokeDashoffset=C*(1-(goal?Math.min(1,eaten/goal):0)); } }; }
refreshToolCards();

/* ---------- sheets + forms ---------- */
let lastFocus=null;
const closeAll=()=>{ $$(".sh").forEach(s=>s.hidden=true); document.documentElement.classList.remove("lock"); lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true}); };
$$("[data-sheet]").forEach(b=>b.addEventListener("click",()=>{ lastFocus=b; const s=$(b.dataset.sheet); s.hidden=false; document.documentElement.classList.add("lock"); const f=s.querySelector("input,textarea,button"); f&&setTimeout(()=>f.focus({preventScroll:true}),60); }));
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
$("bArcs").innerHTML=[[15,18.5,"#7fb0bf"],[18.5,25,"#2fbf71"],[25,30,"#f2a93b"],[30,35,"#e5484d"]].map(([a,b,c])=>`<path d="M${PT(ANG(a)+1.5)}A92 92 0 0 1 ${PT(ANG(b)-1.5)}" stroke="${c}"/>`).join("");
const bmi=()=>{ const w=+$("bWt").value, h=+$("bHt").value/100; if(!w||!h||h<1){ set("bVal","--"); set("bCat","Enter your weight and height"); $("bNd").style.transform="translateX(-50%) rotate(-90deg)"; return; }
  const v=w/(h*h); set("bVal",v.toFixed(1)); set("bCat",v<18.5?"Underweight":v<25?"Healthy ✅":v<30?"Overweight":"Obese"); $("bNd").style.transform=`translateX(-50%) rotate(${ANG(v)}deg)`; };
["bWt","bHt"].forEach(i=>$(i).addEventListener("input",bmi));
$("shareBtn")&&($("shareBtn").onclick=async()=>{ const d={title:GYM.name,text:`Train with me at ${GYM.name}, Ranjit Avenue, Amritsar 💪`,url:location.href.split(/[?#]/)[0]};
  if(navigator.share){ try{ await navigator.share(d); }catch(e){} } else window.open(`https://wa.me/?text=${encodeURIComponent(d.text+" "+d.url)}`,"_blank"); });

/* ---------- mobile dock: shows after the hero ---------- */
(function(){ const d=$("dock"); if(!d) return; new IntersectionObserver(es=>d.classList.toggle("on",!es[0].isIntersecting),{threshold:.25}).observe($("hero")); })();
})();
