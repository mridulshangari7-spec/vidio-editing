/* Rhino's member toolkit: calorie tracker, interval timer, 1-rep-max, water, gym streak.
   Everything is saved only on the member's own phone (localStorage). */
(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const load=(k,d)=>{ try{ const v=JSON.parse(localStorage.getItem(k)); return v??d; }catch(e){ return d; } };
const save=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
const dkey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const r0=n=>Math.round(n), r1=n=>Math.round(n*10)/10;
const buzz=p=>{ try{ navigator.vibrate&&navigator.vibrate(p||10); }catch(e){} };
const toast=m=>window.toast?window.toast(m):alert(m);
let actx=null;
function beep(f=880,d=.15,v=.3){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const o=actx.createOscillator(), g=actx.createGain(); o.frequency.value=f; o.connect(g); g.connect(actx.destination);
  const t=actx.currentTime; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.start(t); o.stop(t+d+.02); }catch(e){} }

/* =================== CALORIE TRACKER =================== */
const CK="rh_cal_v1";
const F=(window.FOODS||[]).map(a=>({n:a[0],al:a[1].split("|"),s:a[2],g:a[3],k:a[4],p:a[5],c:a[6],f:a[7]}));
const NUMW={a:1,an:1,one:1,ek:1,two:2,do:2,three:3,teen:3,four:4,char:4,chaar:4,five:5,paanch:5,panch:5,six:6,che:6,seven:7,eight:8,nine:9,ten:10,half:.5,aadha:.5,adha:.5,couple:2,double:2,few:3,dozen:12,quarter:.25};
const UNITS="bowl|bowls|katori|plate|plates|cup|cups|glass|glasses|piece|pieces|pc|pcs|slice|slices|scoop|scoops|tbsp|tsp|spoon|spoons|serving|servings|small|medium|large|big|of|full|katoriyan|handful|handfuls|bar|bars|can|cans|pack|packet|pint";
const bigr=s=>{ const t=" "+s+" ", m=new Map(); for(let i=0;i<t.length-1;i++){ const b=t.slice(i,i+2); m.set(b,(m.get(b)||0)+1); } return m; };
function dice(a,b){ if(!a||!b) return 0; const A=bigr(a), B=bigr(b); let inter=0, tot=0; A.forEach((v,k)=>{ tot+=v; if(B.has(k)) inter+=Math.min(v,B.get(k)); }); B.forEach(v=>tot+=v); return 2*inter/tot; }
const sing=w=>w.length>4&&w.endsWith("es")&&!w.endsWith("ses")?w.slice(0,-2):w.length>3&&w.endsWith("s")?w.slice(0,-1):w;
function findFood(txt){
  const words=txt.split(/\s+/).filter(Boolean), variants=[words.join(" "),words.map(sing).join(" ")];
  let best=null, bs=0;
  F.forEach(f=>f.al.forEach(a=>variants.forEach(v=>{ if((" "+v+" ").includes(" "+a+" ")){ const sc=a.length*2+(v===a?5:0); if(sc>bs){bs=sc;best=f;} } })));
  if(best) return {food:best};
  let top=[]; F.forEach(f=>{ let s=0; f.al.forEach(a=>{ s=Math.max(s,dice(variants[0],a),dice(variants[1],a)); }); top.push([s,f]); });
  top.sort((x,y)=>y[0]-x[0]);
  if(top[0]&&top[0][0]>=.62) return {food:top[0][1]};
  return {sugg:top.filter(x=>x[0]>.25).slice(0,3).map(x=>x[1])};
}
function parse(text){
  const out=[], unknown=[];
  text.toLowerCase().replace(/\band\b|\bwith\b|\baur\b|\bplus\b|&|\+|;|\n|\//g,",").split(",").map(s=>s.trim()).filter(Boolean).forEach(chunk=>{
    let q=1, grams=null, m;
    if((m=chunk.match(/(\d+(?:\.\d+)?)\s*(g|gm|gms|gram|grams|ml)\b/))){ grams=+m[1]; chunk=chunk.replace(m[0]," "); }
    else if((m=chunk.match(/(\d+)\s*\/\s*(\d+)/))){ q=+m[1]/+m[2]; chunk=chunk.replace(m[0]," "); }
    else if((m=chunk.match(/\d+(?:\.\d+)?/))){ q=+m[0]; chunk=chunk.replace(m[0]," "); }
    else { const w=chunk.split(/\s+/).find(w=>w in NUMW); if(w){ q=NUMW[w]; chunk=chunk.replace(new RegExp("\\b"+w+"\\b")," "); } }
    chunk=chunk.replace(new RegExp("\\b("+UNITS+")\\b","g")," ").replace(/[^a-z' ]/g," ").replace(/\s+/g," ").trim();
    if(!chunk) return;
    const r=findFood(chunk);
    if(r.food){ const f=r.food, mult=grams?grams/f.g:q;
      out.push({n:f.n,lbl:grams?`${grams} ${/ml/.test(text)?"ml":"g"}`:`${r1(q)} × ${f.s}`,k:r0(f.k*mult),p:r1(f.p*mult),c:r1(f.c*mult),f:r1(f.f*mult)}); }
    else unknown.push({txt:chunk,q,grams,sugg:r.sugg||[]});
  });
  return {out,unknown};
}
const MEALS=["Breakfast","Lunch","Snacks","Dinner"];
const mealNow=()=>{ const h=new Date().getHours(); return h<11?0:h<16?1:h<19?2:3; };
let cal=load(CK,{profile:null,goal:null,days:{}}), curMeal=mealNow(), pend=[];
const today=()=>(cal.days[dkey()]=cal.days[dkey()]||[]);
function calcGoal(p){ const bmr=10*p.w+6.25*p.h-5*p.a+(p.sex==="Male"?5:-161), act={Light:1.375,Moderate:1.55,"Very active":1.725}[p.act]||1.55;
  const kcal=r0((bmr*act+({"Lose fat":-450,"Build muscle":300}[p.goal]||0))/10)*10, pro=r0(p.w*(p.goal==="Build muscle"?2:1.8)), fat=r0(kcal*.25/9), carb=Math.max(50,r0((kcal-pro*4-fat*9)/4));
  return {k:kcal,p:pro,c:carb,f:fat}; }
function calSetup(el){
  const p=cal.profile||{a:25,sex:"Male",w:70,h:170,act:"Moderate",goal:"Lose fat"};
  const chips=(g,opts,v)=>`<div class="opt" data-tg="${g}">${opts.map(o=>`<button type="button" class="${o===v?"on":""}">${o}</button>`).join("")}</div>`;
  el.innerHTML=`<div class="tl-hero"><div class="tl-ic">🔥</div><h3>Set your daily target</h3><p class="n">We'll work out your calories and protein for your goal.</p></div>
  <label class="f">Your goal</label>${chips("goal",["Lose fat","Build muscle","Stay fit"],p.goal)}
  <div class="two"><label class="f">Age<input id="cA" inputmode="numeric" value="${p.a}"></label><label class="f">Gender</label></div>
  ${chips("sex",["Male","Female"],p.sex)}
  <div class="two"><label class="f">Weight (kg)<input id="cW" inputmode="decimal" value="${p.w}"></label><label class="f">Height (cm)<input id="cH" inputmode="decimal" value="${p.h}"></label></div>
  <label class="f">How active are you?</label>${chips("act",["Light","Moderate","Very active"],p.act)}
  <button class="btn" id="cGo">Calculate my target</button>`;
  el.querySelectorAll("[data-tg]").forEach(g=>g.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; g.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b)); buzz(); }));
  const v=g=>el.querySelector(`[data-tg=${g}] .on`).textContent;
  $("cGo").onclick=()=>{ const np={a:+$("cA").value||25,w:+$("cW").value||70,h:+$("cH").value||170,sex:v("sex"),act:v("act"),goal:v("goal")};
    cal.profile=np; cal.goal=calcGoal(np); save(CK,cal); buzz([10,30,10]); calMain(el); };
}
function totals(list){ return list.reduce((t,i)=>({k:t.k+i.k,p:t.p+i.p,c:t.c+i.c,f:t.f+i.f}),{k:0,p:0,c:0,f:0}); }
const QUICK=[["2 eggs","🥚"],["2 roti","🫓"],["1 bowl dal","🍲"],["1 bowl rice","🍚"],["1 scoop whey","🥤"],["100g chicken breast","🍗"],["100g paneer","🧀"],["1 banana","🍌"],["1 bowl curd","🥣"],["protein shake","💪"],["1 bowl oats","🌾"],["1 apple","🍎"]];
function calMain(el){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  el.innerHTML=`<div class="cal-top">
      <div class="ring"><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="68" class="rb"/><circle cx="80" cy="80" r="68" class="rf" id="cRing"/></svg>
        <div class="rc"><b id="cEat">0</b><span id="cOf"></span><em id="cLeft"></em></div></div>
      <div class="macros" id="cMac"></div></div>
    <div class="cal-in">
      <div class="mealtabs" id="cMeals">${MEALS.map((m,i)=>`<button type="button" data-m="${i}" class="${i===curMeal?"on":""}">${m}</button>`).join("")}</div>
      <div class="ask"><textarea id="cTxt" rows="2" placeholder="What did you eat? e.g. 2 roti, 1 bowl dal, 100g paneer"></textarea>
        ${SR?`<button type="button" class="mic" id="cMic" aria-label="Speak">🎙️</button>`:""}</div>
      <button class="btn" id="cAdd">＋ Add to ${MEALS[curMeal]}</button>
      <div id="cUnk"></div>
      <div class="quick" id="cQuick">${QUICK.map(([t,e])=>`<button type="button" data-q="${t}">${e} ${t}</button>`).join("")}</div>
    </div>
    <div id="cList"></div>
    <div class="wk"><div class="wkh"><b>Last 7 days</b><span id="cAvg"></span></div><div class="bars" id="cWeek"></div></div>
    <div class="two" style="margin-top:14px"><button class="btn ghost" id="cGoal">🎯 Change goal</button><button class="btn wa" id="cShare">Send to trainer</button></div>
    <p class="n" style="text-align:center;margin-top:12px;font-size:12px">Calories are close estimates for common Indian portions. Saved only on this phone.</p>`;
  $("cMeals").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; curMeal=+b.dataset.m; $("cMeals").querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b)); $("cAdd").textContent=`＋ Add to ${MEALS[curMeal]}`; buzz(); });
  $("cAdd").onclick=()=>addText($("cTxt").value);
  $("cTxt").addEventListener("keydown",e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); addText($("cTxt").value); } });
  $("cQuick").addEventListener("click",e=>{ const b=e.target.closest("[data-q]"); if(b) addText(b.dataset.q); });
  $("cGoal").onclick=()=>calSetup(el);
  $("cShare").onclick=()=>{ const l=today(), t=totals(l), g=cal.goal;
    const lines=MEALS.map((m,i)=>{ const it=l.filter(x=>x.m===i); return it.length?`*${m}*: ${it.map(x=>`${x.n} (${x.k})`).join(", ")}`:""; }).filter(Boolean).join("\n");
    window.open(`https://wa.me/${GYM.whatsapp}?text=${encodeURIComponent(`Hi coach! My food today 🍽️\n${lines||"(nothing logged)"}\n\nTotal: ${r0(t.k)} / ${g.k} kcal · Protein ${r0(t.p)} / ${g.p} g`)}`,"_blank"); };
  if(SR){ let rec=null; $("cMic").onclick=()=>{ if(rec){ rec.stop(); return; } rec=new SR(); rec.lang="en-IN"; rec.interimResults=true;
    $("cMic").classList.add("live"); buzz();
    rec.onresult=ev=>{ $("cTxt").value=[...ev.results].map(r=>r[0].transcript).join(" "); };
    rec.onend=()=>{ $("cMic").classList.remove("live"); rec=null; if($("cTxt").value.trim()) addText($("cTxt").value); };
    rec.onerror=()=>{ toast("Couldn't hear you. Please type instead."); };
    rec.start(); }; }
  drawCal();
}
function addText(t){
  if(!t||!t.trim()) return;
  const {out,unknown}=parse(t);
  out.forEach(i=>{ i.m=curMeal; i.id=Date.now().toString(36)+Math.random().toString(36).slice(2,5); today().push(i); });
  save(CK,cal); $("cTxt").value=""; pend=unknown;
  if(out.length){ buzz([8,30,8]); toast(`Added ${out.length} item${out.length>1?"s":""} · ${out.reduce((a,b)=>a+b.k,0)} kcal`); }
  drawCal(out.length);
}
function drawCal(flash){
  const l=today(), t=totals(l), g=cal.goal, C=2*Math.PI*68, pct=Math.min(1,t.k/g.k);
  $("cEat").textContent=r0(t.k); $("cOf").textContent=`of ${g.k.toLocaleString("en-IN")} kcal`;
  const left=g.k-t.k; $("cLeft").textContent=left>=0?`${r0(left)} left`:`${r0(-left)} over`; $("cLeft").className=left>=0?"":"over";
  const ring=$("cRing"); ring.style.strokeDasharray=C; requestAnimationFrame(()=>{ ring.style.strokeDashoffset=C*(1-pct); }); ring.classList.toggle("over",left<0);
  $("cMac").innerHTML=[["Protein","p","#5fd0e6"],["Carbs","c","#f2b84b"],["Fat","f","#ef7d7d"]].map(([n,k,c])=>`<div class="mac"><div class="mh"><span>${n}</span><b>${r0(t[k])}<small>/${g[k]} g</small></b></div><div class="mb"><i style="width:${Math.min(100,t[k]/g[k]*100)}%;background:${c}"></i></div></div>`).join("");
  $("cUnk").innerHTML=pend.map((u,ui)=>`<div class="unk"><p>Couldn't find <b>"${esc(u.txt)}"</b>. Did you mean:</p><div class="quick">${u.sugg.map((f,fi)=>`<button type="button" data-ui="${ui}" data-fi="${F.indexOf(f)}">${esc(f.n)}</button>`).join("")}</div>
    <div class="cust"><input inputmode="numeric" placeholder="or type kcal" id="cu${ui}"><button type="button" data-cu="${ui}">Add</button></div></div>`).join("");
  $("cUnk").querySelectorAll("[data-fi]").forEach(b=>b.onclick=()=>{ const u=pend[+b.dataset.ui], f=F[+b.dataset.fi], mult=u.grams?u.grams/f.g:u.q;
    today().push({n:f.n,lbl:u.grams?`${u.grams} g`:`${r1(u.q)} × ${f.s}`,k:r0(f.k*mult),p:r1(f.p*mult),c:r1(f.c*mult),f:r1(f.f*mult),m:curMeal,id:Date.now().toString(36)}); pend.splice(+b.dataset.ui,1); save(CK,cal); buzz(); drawCal(1); });
  $("cUnk").querySelectorAll("[data-cu]").forEach(b=>b.onclick=()=>{ const ui=+b.dataset.cu, u=pend[ui], k=+$("cu"+ui).value; if(!k) return;
    today().push({n:u.txt.replace(/\b\w/g,c=>c.toUpperCase()),lbl:`${r1(u.q)} serving`,k:r0(k),p:0,c:0,f:0,m:curMeal,id:Date.now().toString(36)}); pend.splice(ui,1); save(CK,cal); drawCal(1); });
  $("cList").innerHTML=MEALS.map((m,i)=>{ const it=l.filter(x=>x.m===i); if(!it.length) return ""; const s=it.reduce((a,b)=>a+b.k,0);
    return `<div class="meal"><div class="mh2"><b>${m}</b><span>${s} kcal</span></div>${it.map((x,j)=>`<div class="fi${flash&&j>=it.length-flash?" new":""}"><div><b>${esc(x.n)}</b><span>${esc(x.lbl)} · P ${r0(x.p)}g</span></div><em>${x.k}</em><button type="button" data-del="${x.id}" aria-label="Remove">✕</button></div>`).join("")}</div>`; }).join("")
    ||`<div class="empty-c">🍽️<p>Nothing logged yet today.<br>Type what you ate, tap a quick item or use the mic.</p></div>`;
  $("cList").querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{ const d=today(), i=d.findIndex(x=>x.id===b.dataset.del); if(i>=0) d.splice(i,1); save(CK,cal); drawCal(); });
  const days=[...Array(7)].map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-6+i); const k=dkey(d); return [d,(cal.days[k]||[]).reduce((a,b)=>a+b.k,0)]; });
  const mx=Math.max(g.k*1.2,...days.map(x=>x[1])), logged=days.filter(x=>x[1]>0);
  $("cWeek").innerHTML=days.map(([d,k],i)=>`<div class="bc"><i style="height:${k/mx*100}%" class="${k>g.k?"over":""}${i===6?" td":""}"></i><span>${"SMTWTFS"[d.getDay()]}</span></div>`).join("")+`<div class="gl" style="bottom:calc(${g.k/mx*100}% * .78 + 18px)"></div>`;
  $("cAvg").textContent=logged.length?`avg ${r0(logged.reduce((a,b)=>a+b[1],0)/logged.length)} kcal`:"";
}

/* =================== INTERVAL TIMER =================== */
let tm={work:40,rest:20,rounds:8,run:false,phase:"ready",left:0,round:0,raf:0,lock:null};
const PRE=[["Tabata",20,10,8],["HIIT",40,20,10],["EMOM",60,0,10],["Rest",90,0,1]];
function timerUI(el){
  el.innerHTML=`<div class="tmw"><div class="tmring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" class="rb"/><circle cx="100" cy="100" r="88" class="rf" id="tRing"/></svg>
    <div class="rc"><span id="tPh">READY</span><b id="tLeft">00:00</b><em id="tRd"></em></div></div>
    <div class="tpre" id="tPre">${PRE.map(([n,w,r,k])=>`<button type="button" data-p="${w},${r},${k}">${n}<small>${w}s${r?"/"+r+"s":""} × ${k}</small></button>`).join("")}</div>
    <div class="steps">${[["work","Work"],["rest","Rest"],["rounds","Rounds"]].map(([k,n])=>`<div><span>${n}</span><div class="st"><button type="button" data-s="${k}" data-d="-1">−</button><b id="t_${k}"></b><button type="button" data-s="${k}" data-d="1">+</button></div></div>`).join("")}</div>
    <div class="two"><button class="btn" id="tGo">▶ Start</button><button class="btn ghost" id="tReset">↺ Reset</button></div>
    <p class="n" style="text-align:center;font-size:12px;margin-top:10px">Beeps in the last 3 seconds of every round. Keep this screen open.</p></div>`;
  const sync=()=>{ ["work","rest","rounds"].forEach(k=>$("t_"+k).textContent=k==="rounds"?tm[k]:tm[k]+"s"); };
  sync(); drawT();
  $("tPre").onclick=e=>{ const b=e.target.closest("[data-p]"); if(!b||tm.run) return; [tm.work,tm.rest,tm.rounds]=b.dataset.p.split(",").map(Number); sync(); stopT(); buzz(); };
  el.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{ if(tm.run) return; const k=b.dataset.s, st=k==="rounds"?1:5; tm[k]=Math.max(k==="work"?5:k==="rounds"?1:0,tm[k]+st*+b.dataset.d); sync(); stopT(); });
  $("tGo").onclick=()=>{ if(tm.run){ tm.run=false; cancelAnimationFrame(tm.raf); $("tGo").textContent="▶ Resume"; return; }
    if(tm.phase==="ready"||tm.phase==="done"){ tm.phase="get"; tm.left=5; tm.round=1; }
    tm.run=true; $("tGo").textContent="⏸ Pause"; try{ navigator.wakeLock&&navigator.wakeLock.request("screen").then(l=>tm.lock=l).catch(()=>{}); }catch(e){}
    let last=performance.now(), lastSec=Math.ceil(tm.left);
    const loop=now=>{ if(!tm.run) return; tm.left-=(now-last)/1000; last=now;
      const s=Math.ceil(tm.left); if(s!==lastSec){ lastSec=s; if(s<=3&&s>0) beep(660,.12); }
      if(tm.left<=0){ next(); lastSec=Math.ceil(tm.left); }
      drawT(); if(tm.run) tm.raf=requestAnimationFrame(loop); };
    tm.raf=requestAnimationFrame(loop); };
  $("tReset").onclick=stopT;
}
function next(){
  const go=()=>{ tm.phase="work"; tm.left=tm.work; beep(1046,.35,.4); buzz(200); };
  if(tm.phase==="get"){ go(); return; }
  if(tm.phase==="rest"){ tm.round++; go(); return; }
  if(tm.phase==="work"){
    if(tm.round>=tm.rounds){ tm.phase="done"; tm.run=false; beep(880,.2); setTimeout(()=>beep(1175,.2),220); setTimeout(()=>beep(1568,.4),440); buzz([200,80,200,80,400]);
      $("tGo").textContent="▶ Again"; try{ tm.lock&&tm.lock.release(); }catch(e){} return; }
    if(tm.rest>0){ tm.phase="rest"; tm.left=tm.rest; beep(523,.35,.4); buzz(120); return; }
    tm.round++; go();
  }
}
function stopT(){ tm.run=false; cancelAnimationFrame(tm.raf); tm.phase="ready"; tm.left=0; tm.round=0; const g=$("tGo"); if(g) g.textContent="▶ Start"; drawT(); try{ tm.lock&&tm.lock.release(); }catch(e){} }
function drawT(){
  const ring=$("tRing"); if(!ring) return; const C=2*Math.PI*88, tot={get:5,work:tm.work,rest:tm.rest}[tm.phase]||1, l=Math.max(0,tm.left);
  ring.style.strokeDasharray=C; ring.style.strokeDashoffset=tm.phase==="ready"||tm.phase==="done"?0:C*(1-l/tot);
  ring.setAttribute("class","rf "+tm.phase);
  const s=tm.phase==="ready"?tm.work:Math.ceil(l); $("tLeft").textContent=`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  $("tPh").textContent={ready:"READY",get:"GET READY",work:"WORK",rest:"REST",done:"DONE 💪"}[tm.phase]; $("tPh").className=tm.phase;
  $("tRd").textContent=tm.phase==="ready"?`${tm.rounds} rounds`:tm.phase==="done"?"Great job!":`Round ${tm.round} / ${tm.rounds}`;
}

/* =================== 1 REP MAX =================== */
function ormUI(el){
  el.innerHTML=`<div class="tl-hero"><div class="tl-ic">🏋️</div><h3>Your 1-rep max</h3><p class="n">Lifted a weight for a few reps? We'll estimate your max and your training weights.</p></div>
    <div class="two"><label class="f">Weight lifted (kg)<input id="oW" inputmode="decimal" placeholder="e.g. 60"></label><label class="f">Reps done<input id="oR" inputmode="numeric" placeholder="e.g. 8"></label></div>
    <div class="orm" id="oOut"><b>--</b><span>estimated 1-rep max</span></div><div class="ormt" id="oTab"></div>`;
  const calc=()=>{ const w=+$("oW").value, r=Math.min(15,+$("oR").value); if(!w||!r){ $("oOut").innerHTML="<b>--</b><span>estimated 1-rep max</span>"; $("oTab").innerHTML=""; return; }
    const m=r===1?w:w*(1+r/30);
    $("oOut").innerHTML=`<b>${r1(m)} kg</b><span>estimated 1-rep max</span>`;
    $("oTab").innerHTML=[[95,2,"Max strength"],[90,4,"Strength"],[85,6,"Strength"],[80,8,"Muscle"],[75,10,"Muscle"],[70,12,"Muscle"],[60,15,"Endurance"]].map(([p,rp,z])=>`<div><span>${p}%</span><b>${r1(Math.round(m*p/100/2.5)*2.5)} kg</b><em>~${rp} reps · ${z}</em></div>`).join(""); };
  ["oW","oR"].forEach(i=>$(i).addEventListener("input",calc));
}

/* =================== WATER =================== */
const WK="rh_water_v1";
function waterUI(el){
  const st=load(WK,{}), prof=cal.profile, goal=prof?Math.max(8,Math.round(prof.w*35/250)):10;
  const draw=()=>{ const n=st[dkey()]||0, pct=Math.min(1,n/goal);
    el.innerHTML=`<div class="wat"><div class="jar"><div class="wave" style="height:${pct*100}%"><i></i><i></i></div><div class="wtx"><b>${n*250>=1000?(n*250/1000).toFixed(2).replace(/0$/,"")+" L":n*250+" ml"}</b><span>of ${(goal*.25).toFixed(1)} L</span></div></div>
      <div class="glasses">${[...Array(goal)].map((_,i)=>`<i class="${i<n?"on":""}"></i>`).join("")}</div>
      <div class="two"><button class="btn" id="wAdd">💧 + 1 glass</button><button class="btn ghost" id="wSub">− Undo</button></div>
      <p class="n" style="text-align:center;margin-top:10px">${n>=goal?"Goal reached! Great hydration 🎉":`${goal-n} more glasses to go today`}</p></div>`;
    $("wAdd").onclick=()=>{ st[dkey()]=(st[dkey()]||0)+1; save(WK,st); buzz(15); draw(); };
    $("wSub").onclick=()=>{ st[dkey()]=Math.max(0,(st[dkey()]||0)-1); save(WK,st); draw(); }; };
  draw();
}

/* =================== GYM STREAK =================== */
const SKK="rh_streak_v1";
function streakOf(days){ let s=0; const d=new Date(); if(!days.includes(dkey(d))) d.setDate(d.getDate()-1); while(days.includes(dkey(d))){ s++; d.setDate(d.getDate()-1); } return s; }
function streakUI(el){
  const st=load(SKK,{days:[]});
  const draw=(boom)=>{ const s=streakOf(st.days), done=st.days.includes(dkey()), best=Math.max(s,st.best||0);
    const grid=[...Array(28)].map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-27+i); return `<i class="${st.days.includes(dkey(d))?"on":""}${i===27?" td":""}"></i>`; }).join("");
    const next=[3,7,14,21,30,50,100].find(x=>x>s)||s+10;
    el.innerHTML=`<div class="stk"><div class="flame${boom?" boom":""}">🔥<b>${s}</b></div><h3>${s?`${s} day streak!`:"Start your streak today"}</h3>
      <p class="n">Best: ${best} days · Next badge at ${next} days</p>
      <button class="btn${done?" ghost":""}" id="sIn" ${done?"disabled":""}>${done?"✓ Checked in today":"💪 I'm at the gym · Check in"}</button>
      <div class="cal28">${grid}</div><p class="n" style="font-size:12px;text-align:center">Last 4 weeks · saved on this phone</p></div>`;
    $("sIn").onclick=()=>{ if(done) return; st.days.push(dkey()); st.best=Math.max(best,streakOf(st.days)); save(SKK,st); buzz([20,40,20,40,60]); beep(880,.12); setTimeout(()=>beep(1320,.25),140); draw(true); }; };
  draw();
}

/* =================== panel host =================== */
const TOOLS={
  cal:{t:"Calorie tracker",r:el=>cal.goal?calMain(el):calSetup(el)},
  timer:{t:"Workout timer",r:timerUI,close:stopT},
  orm:{t:"1-rep max",r:ormUI},
  water:{t:"Water tracker",r:waterUI},
  streak:{t:"Gym streak",r:streakUI}
};
let curTool=null;
window.openTool=name=>{ const T=TOOLS[name]; if(!T) return; curTool=T; $("pTitle").textContent=T.t; T.r($("pBody")); $("panel").hidden=false; $("panel").scrollTop=0; document.documentElement.classList.add("lock"); buzz(); };
window.closeTool=()=>{ if(curTool&&curTool.close) curTool.close(); $("panel").hidden=true; document.documentElement.classList.remove("lock"); curTool=null; window.refreshToolCards&&window.refreshToolCards(); };
/* live numbers on the toolkit cards */
window.refreshToolCards=()=>{ const set=(id,v)=>{ const e=$(id); if(e) e.textContent=v; };
  const t=totals(cal.days[dkey()]||[]); set("kCal",cal.goal?`${r0(t.k)} / ${cal.goal.k} kcal`:"Set your goal");
  const w=load(WK,{})[dkey()]||0; set("kWat",`${w} glass${w===1?"":"es"} today`);
  const s=streakOf(load(SKK,{days:[]}).days); set("kStk",s?`${s} day streak 🔥`:"Check in today");
  const kr=$("kRing"); if(kr&&cal.goal){ const C=2*Math.PI*26; kr.style.strokeDasharray=C; kr.style.strokeDashoffset=C*(1-Math.min(1,t.k/cal.goal.k)); } };
})();
