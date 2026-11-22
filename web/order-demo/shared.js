/* Shared settings + live messaging for the table-ordering demo.
   Messages go through ntfy.sh (free, no account). Add ?local to any page to test
   on one device with tabs instead (no internet needed). */
window.CAFE = {
  name: "Brew & Bloom Café",
  area: "Demo café · Amritsar",
  room: "inf-bnb-demo-7q4k2x",      // channel name; keep it hard to guess
  kitchenPin: "1234",
  waitBetweenOrders: 30,            // seconds a phone must wait between orders
  farMetres: 300,                   // orders placed further than this from the café get flagged
  menu: [
    { cat: "Coffee", items: [
      { id: "c1", n: "Cappuccino", d: "Double shot, silky foam", p: 180, e: "☕", v: 1 },
      { id: "c2", n: "Café Latte", d: "Smooth and milky", p: 190, e: "🥛", v: 1 },
      { id: "c3", n: "Hazelnut Cold Coffee", d: "Blended, with ice cream", p: 220, e: "🧋", v: 1 },
      { id: "c4", n: "Americano", d: "Black, bold", p: 150, e: "☕", v: 1 } ] },
    { cat: "Coolers", items: [
      { id: "d1", n: "Mint Mojito", d: "Fresh mint, lime, soda", p: 160, e: "🍹", v: 1 },
      { id: "d2", n: "Peach Iced Tea", d: "Brewed in house", p: 150, e: "🧊", v: 1 } ] },
    { cat: "Food", items: [
      { id: "f1", n: "Pesto Pasta", d: "Basil pesto, parmesan", p: 320, e: "🍝", v: 1 },
      { id: "f2", n: "Peri Peri Fries", d: "Crispy, spicy", p: 170, e: "🍟", v: 1 },
      { id: "f3", n: "Chicken Club Sandwich", d: "Grilled, triple layer", p: 290, e: "🥪", v: 0 },
      { id: "f4", n: "Margherita Pizza", d: "Thin crust, 8 inch", p: 340, e: "🍕", v: 1 },
      { id: "f5", n: "Paneer Tikka Wrap", d: "Mint mayo, onions", p: 240, e: "🌯", v: 1 } ] },
    { cat: "Desserts", items: [
      { id: "s1", n: "Blueberry Cheesecake", d: "Baked, New York style", p: 260, e: "🍰", v: 1 },
      { id: "s2", n: "Brownie with Ice Cream", d: "Served warm", p: 220, e: "🍫", v: 1 } ] }
  ]
};
CAFE.items = Object.fromEntries(CAFE.menu.flatMap(c => c.items.map(i => [i.id, i])));

window.RT = (() => {
  const local = new URLSearchParams(location.search).has("local");
  const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const topic = ch => `${CAFE.room}-${ch}`;
  const handlers = {};
  let bc = null;
  if (local && "BroadcastChannel" in window) {
    bc = new BroadcastChannel(CAFE.room);
    bc.onmessage = e => deliver(e.data.ch, e.data.o);
  }
  const seen = new Set();
  function deliver(ch, o) {
    if (!o || seen.has(o._id)) return; seen.add(o._id);
    (handlers[ch] || []).forEach(f => { try { f(o); } catch (e) { console.error(e); } });
  }
  function store(ch) { try { return JSON.parse(localStorage.getItem("rt_" + topic(ch))) || []; } catch (e) { return []; } }
  return {
    local, rid,
    send(ch, o) {
      o._id = o._id || rid(); o.ts = o.ts || Date.now();
      if (local) {
        const list = store(ch); list.push(o);
        try { localStorage.setItem("rt_" + topic(ch), JSON.stringify(list.slice(-400))); } catch (e) {}
        bc && bc.postMessage({ ch, o }); deliver(ch, o);
        return Promise.resolve(true);
      }
      return fetch(`https://ntfy.sh/${topic(ch)}`, { method: "POST", body: JSON.stringify(o) }).then(r => r.ok);
    },
    listen(ch, fn) {
      (handlers[ch] = handlers[ch] || []).push(fn);
      if (local) { store(ch).forEach(o => deliver(ch, o)); return; }
      const es = new EventSource(`https://ntfy.sh/${topic(ch)}/sse?since=12h`);
      es.onmessage = e => {
        let d; try { d = JSON.parse(e.data); } catch (_) { return; }
        if (d.event && d.event !== "message") return;
        let o; try { o = JSON.parse(d.message); } catch (_) { return; }
        deliver(ch, o);
      };
    }
  };
})();

window.inr = n => "₹" + Number(n).toLocaleString("en-IN");
window.metres = (a, b) => { const R = 6371000, r = x => x * Math.PI / 180;
  const dLa = r(b.lat - a.lat), dLo = r(b.lng - a.lng);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h))); };
