/* PumpWatch by Infinity: shared settings, storage and live messaging.
   DEMO: change PW.pump, nozzles, workers, rates and the owner's WhatsApp for a real pump. */
window.PW = {
  pump: "Your Petrol Pump",                  // shown everywhere
  ownerWa: "",                               // owner's WhatsApp, e.g. "9198xxxxxxxx" (customer reports also go live to the dashboard)
  room: "inf-pumpwatch-demo-x7k2q9",         // live channel, keep it hard to guess
  ownerPin: "0000",
  nozzles: [                                 // k = secret written on that nozzle's NFC tag
    { n: 1, fuel: "Petrol", k: "p1x9" }, { n: 2, fuel: "Petrol", k: "p2m4" },
    { n: 3, fuel: "Diesel", k: "d3q7" }, { n: 4, fuel: "Diesel", k: "d4z2" }
  ],
  workers: [                                 // demo staff
    { id: "w1", name: "Raju", pin: "1111" }, { id: "w2", name: "Sunny", pin: "2222" },
    { id: "w3", name: "Gurpreet", pin: "3333" }, { id: "w4", name: "Aman", pin: "4444" }
  ],
  defaultRates: { Petrol: 97.00, Diesel: 88.00 },   // demo rates, the owner sets today's rate on the dashboard
  shortLimit: 100                                   // alert when a shift is short by more than ₹100
};
PW.load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
PW.save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
PW.rates = () => PW.load("pw_rates", PW.defaultRates);
PW.inr = n => (Math.round(n) < 0 ? "−₹" : "₹") + Math.abs(Math.round(n)).toLocaleString("en-IN");
PW.l = n => (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " L";
PW.worker = id => PW.workers.find(w => w.id === id) || { name: "?" };
PW.nozzle = n => PW.nozzles.find(z => z.n === +n);
PW.time = ts => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/* live channel: ntfy.sh (free), or same-browser tabs with ?local */
PW.RT = (() => {
  const local = new URLSearchParams(location.search).has("local");
  const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const handlers = [], seen = new Set();
  let bc = null;
  if (local && "BroadcastChannel" in window) { bc = new BroadcastChannel(PW.room); bc.onmessage = e => deliver(e.data); }
  function deliver(o) { if (!o || seen.has(o._id)) return; seen.add(o._id); handlers.forEach(f => { try { f(o); } catch (e) { console.error(e); } }); }
  const KEY = "pw_local_log";
  return {
    local, rid,
    send(o) {
      o._id = o._id || rid(); o.ts = o.ts || Date.now();
      if (local) { const l = PW.load(KEY, []); l.push(o); PW.save(KEY, l.slice(-300)); bc && bc.postMessage(o); deliver(o); return Promise.resolve(true); }
      return fetch(`https://ntfy.sh/${PW.room}`, { method: "POST", body: JSON.stringify(o) }).then(r => r.ok);
    },
    listen(fn) {
      handlers.push(fn);
      if (local) { PW.load(KEY, []).forEach(deliver); return; }
      const es = new EventSource(`https://ntfy.sh/${PW.room}/sse?since=24h`);
      es.onmessage = e => { let d; try { d = JSON.parse(e.data); } catch (_) { return; } if (d.event && d.event !== "message") return;
        let o; try { o = JSON.parse(d.message); } catch (_) { return; } deliver(o); };
    }
  };
})();

/* tiny meter photo for proof (kept small so it fits in one live message) */
PW.thumb = file => new Promise(res => {
  if (!file) return res("");
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => { const w = 128, h = Math.round(w * img.height / img.width), c = document.createElement("canvas"); c.width = w; c.height = h;
    c.getContext("2d").drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", .42)); };
  img.onerror = () => res(""); img.src = url;
});
