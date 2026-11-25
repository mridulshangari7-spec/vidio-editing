/* Rhino's Gym x Infinity: shared settings, menu and live messaging.
   Edit GYM and MENU here; every page reads from this file. */
window.GYM = {
  name: "Rhino's Gym",
  tagline: "Strength · Muscle · Transformation",
  area: "D-Block, Ranjit Avenue, Amritsar",
  rating: "4.5", reviews: "209",
  hours: "Open daily · 6 AM – 11 PM",                 // confirm with the gym
  openHour: 6, closeHour: 23,                         // used for the live "Open now" badge
  photos: [],                                         // add gym photos here, e.g. ["img/gym1.jpg","img/gym2.jpg"]: they play as a moving background
  phone: "+917528818080", whatsapp: "917528818080",
  google: "https://search.google.com/local/writereview?placeid=ChIJLXd2lVNlGTkRjNjUSr21v54",
  maps: "https://www.google.com/maps/search/?api=1&query=Rhino%27s+Gym+Amritsar&query_place_id=ChIJLXd2lVNlGTkRjNjUSr21v54",
  upi: { pa: "MAB.037216020750016@AXISBANK", pn: "BABA DEEP SINGH JI ENTERPRISES" },  // gym fees (from the gym's Axis Bank QR)
  wifi: { ssid: "Rhinos_Gym", pass: "ask-at-reception" },  // put the real Wi-Fi name and password here
  social: {
    instagram: "https://www.instagram.com/rhinosgym.amritsar/",
    threads: "https://www.threads.net/@rhinosgym.amritsar",
    facebook: "",      // add link if they have one
    snapchat: "",      // add link if they have one
    youtube: "",       // add link if they have one
    website: "https://rhinosgym.in/"
  }
};

/* Nutrition Treat café inside the gym */
window.CAFE = {
  name: "Nutrition Treat",
  line: "Healthy food makes you feel good",
  phones: ["+919115626721", "+916239901311"],
  whatsapp: "919115626721",
  upi: { pa: "MAB.037216020750016@AXISBANK", pn: "BABA DEEP SINGH JI ENTERPRISES" },  // replace with the café's own UPI if different
  room: "inf-rhino-nt-8w3k5q",   // live channel name, keep it hard to guess
  kitchenPin: "1234",
  waitBetweenOrders: 30,
  menu: [
    { cat: "Shakes", img: "shakes", items: [
      ["Banana Shake",100,1],["Strawberry Shake",120,1],["Chocolate Shake",150,1],["Kiwi Shake",180,1],["Cold Coffee Shake",120,1],
      ["Protein Shake",150,1,"High protein"],["Protein Shake with Peanut, Oats & Banana",190,1,"Post-workout favourite"],["Avocado Shake",190,1],["Blueberry Shake",190,1] ] },
    { cat: "Salads", img: "salad", items: [
      ["Green Salad",150,1],["Protein Salad",200,1],["Dry Fruit Protein Salad",290,1],["Sprouts Salad",180,1],["Protein Salad with Olive Oil",250,1],["Tofu Paneer Salad",190,1],
      ["Chicken Salad",280,0],["Boiled Chicken",250,0],["Chicken Protein Salad",300,0],["Chicken Egg Salad",320,0,"Without sauce"] ] },
    { cat: "Sandwiches", img: "sandwich", items: [
      ["Vegetable Sandwich",150,1],["Tofu Sandwich",190,1],["Protein Sandwich",200,1],["Mushroom Sandwich",240,1],["Paneer Tikka Sandwich",270,1],["Chilly Paneer Sandwich",290,1],
      ["Chicken Sandwich",200,0],["Chicken Tikka Sandwich",240,0],["Chilly Chicken Sandwich",280,0],["Egg Chicken Sandwich",300,0],
      ["Sub Paneer Tikka",220,1],["Sub Chicken",250,0] ] },
    { cat: "Roasted", img: "kebab", items: [
      ["Paneer Tikka Roasted",290,1],["Roasted Chicken",310,0],["Malai Chicken Tikka",320,0],["Fish Roasted (250 g)",400,0] ] },
    { cat: "Meals", img: "kebab", items: [
      ["Soya Paneer with Sauce",170,1],["Cheese Chilly (Dry / Gravy)",290,1],
      ["Butter Chicken (Fat Free)",350,0],["Chilly Chicken (Fat Free)",350,0],["Rara Chicken (Fat Free)",350,0],["Chicken Taka Tak",340,0],
      ["Chicken Egg Burji",340,0],["Protein Omelette",180,0],["Chicken Omelette",340,0],["Omelette",150,0] ] },
    { cat: "Biryani", img: "biryani", items: [
      ["Vegetable Biryani",240,1,"Takes about 20 min"],["Mushroom Paneer Biryani",270,1,"Takes about 20 min"],["Chilly Paneer Biryani",290,1,"Takes about 20 min"],["Chicken Biryani",310,0,"Takes about 20 min"] ] },
    { cat: "Pizza & Pasta", img: "pizza", items: [
      ["Veg Pizza",210,1,"Whole wheat"],["Non-Veg Pizza",290,0,"Whole wheat"],["Veg Pasta",240,1,"Whole wheat"],["Non-Veg Pasta",290,0,"Whole wheat"] ] },
    { cat: "Burgers", img: "sandwich", items: [
      ["Veg Burger",130,1,"Whole wheat"],["Paneer Burger",150,1,"Whole wheat"],["Egg Burger",150,0,"Whole wheat"],["Chicken Burger",190,0,"Whole wheat"],["Egg Chicken Burger",200,0,"Whole wheat"] ] },
    { cat: "Soups", img: "soup", items: [ ["Veg Protein Soup",160,1],["Chicken Soup",200,0] ] }
  ]
};
CAFE.items = {};
CAFE.menu.forEach((c, ci) => c.items = c.items.map((a, ii) => { const it = { id: `i${ci}_${ii}`, n: a[0], p: a[1], v: a[2], d: a[3] || "", cat: c.cat, img: c.img }; CAFE.items[it.id] = it; return it; }));

window.RT = (() => {
  const local = new URLSearchParams(location.search).has("local");
  const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const topic = ch => `${CAFE.room}-${ch}`;
  const handlers = {}, seen = new Set();
  let bc = null;
  if (local && "BroadcastChannel" in window) { bc = new BroadcastChannel(CAFE.room); bc.onmessage = e => deliver(e.data.ch, e.data.o); }
  function deliver(ch, o) { if (!o || seen.has(o._id)) return; seen.add(o._id); (handlers[ch] || []).forEach(f => { try { f(o); } catch (e) { console.error(e); } }); }
  const store = ch => { try { return JSON.parse(localStorage.getItem("rt_" + topic(ch))) || []; } catch (e) { return []; } };
  return {
    local, rid,
    send(ch, o) {
      o._id = o._id || rid(); o.ts = o.ts || Date.now();
      if (local) { const l = store(ch); l.push(o); try { localStorage.setItem("rt_" + topic(ch), JSON.stringify(l.slice(-400))); } catch (e) {}
        bc && bc.postMessage({ ch, o }); deliver(ch, o); return Promise.resolve(true); }
      return fetch(`https://ntfy.sh/${topic(ch)}`, { method: "POST", body: JSON.stringify(o) }).then(r => r.ok);
    },
    listen(ch, fn) {
      (handlers[ch] = handlers[ch] || []).push(fn);
      if (local) { store(ch).forEach(o => deliver(ch, o)); return; }
      const es = new EventSource(`https://ntfy.sh/${topic(ch)}/sse?since=12h`);
      es.onmessage = e => { let d; try { d = JSON.parse(e.data); } catch (_) { return; } if (d.event && d.event !== "message") return;
        let o; try { o = JSON.parse(d.message); } catch (_) { return; } deliver(ch, o); };
    }
  };
})();
window.inr = n => "₹" + Number(n).toLocaleString("en-IN");
window.upiLink = (u, amt, note) => `upi://pay?pa=${encodeURIComponent(u.pa)}&pn=${encodeURIComponent(u.pn)}${amt ? "&am=" + amt : ""}&cu=INR${note ? "&tn=" + encodeURIComponent(note) : ""}`;
