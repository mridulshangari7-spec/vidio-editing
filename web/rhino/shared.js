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


/* ===== What shows on the page. The owner decides: set any of these to false to hide it. ===== */
GYM.features = {
  order: true,        // Nutrition Treat food ordering
  review: true,       // Google review
  plans: true,        // workout + diet plan request
  wifi: true,
  feedback: true,     // private feedback on WhatsApp
  facilities: true,   // horizontal facilities showcase
  toolkit: true,      // calorie tracker, timer, BMI, 1RM, water, streak
  schedule: true,     // class timetable
  crowd: true,        // "how busy is it now" meter
  why: true,          // why Rhino's (stacking cards)
  pricing: true,      // membership plans
  trainers: true,     // coaches
  members: true,      // fees, trial, refer, call
  social: true
};

/* Facilities: remove any the gym doesn't have */
GYM.facilities = [
  ["strength","Strength Zone","Racks, benches, plates & dumbbells up to heavy weights"],
  ["cardio","Cardio Deck","Treadmills, cycles, cross-trainers & rowers"],
  ["functional","Functional & HIIT","Turf, kettlebells, battle ropes, sleds"],
  ["machines","Premium Machines","Plate-loaded & selectorised machines for every muscle"],
  ["yoga","Yoga & Dance Studio","Group sessions for flexibility, cardio & fun"],
  ["pt","Personal Training","1-on-1 coaching with progress tracking"],
  ["cafe","Nutrition Café","Protein meals & shakes by Nutrition Treat"],
  ["locker","Lockers & Changing","Clean changing rooms and lockers"],
  ["steam","Steam & Recovery","Relax your muscles after training"],
  ["parking","Parking","Easy parking right outside"]
];

/* SAMPLE data for the demo: replace with the gym's real details (or switch the section off above) */
GYM.sample = false;   // the new site does not show sample pricing, classes, coaches or crowd data
GYM.pricing = [
  { name: "Basic", tag: "", m: 1500, q: 4000, y: 12000, perks: ["Full gym access","Locker","Wi-Fi"] },
  { name: "Pro", tag: "Most popular", m: 2500, q: 6500, y: 20000, perks: ["Everything in Basic","Yoga & dance classes","Monthly body check","Diet plan"] },
  { name: "Elite PT", tag: "", m: 6000, q: 16000, y: 55000, perks: ["Everything in Pro","Personal trainer","Weekly diet updates","Priority slots"] }
];
GYM.schedule = {   // day 0 = Sunday … 6 = Saturday: [start "HH:MM", end, class, coach]
  1: [["07:00","08:00","Yoga","Coach Simran"],["18:00","19:00","HIIT Blast","Coach Arjun"],["19:30","20:30","Zumba","Coach Neha"]],
  2: [["07:00","08:00","Mobility & Stretch","Coach Simran"],["18:00","19:00","Strength Basics","Coach Arjun"]],
  3: [["07:00","08:00","Yoga","Coach Simran"],["18:00","19:00","HIIT Blast","Coach Arjun"],["19:30","20:30","Bhangra Fitness","Coach Neha"]],
  4: [["07:00","08:00","Core & Abs","Coach Arjun"],["18:30","19:30","Zumba","Coach Neha"]],
  5: [["07:00","08:00","Yoga","Coach Simran"],["18:00","19:00","Functional Circuit","Coach Arjun"]],
  6: [["08:00","09:00","Weekend Bootcamp","Coach Arjun"],["18:00","19:00","Dance Party","Coach Neha"]],
  0: [["08:00","09:00","Sunday Yoga","Coach Simran"]]
};
GYM.trainers = [
  ["Coach Arjun","Head Coach · Strength & Fat loss","8 yrs"],
  ["Coach Simran","Yoga & Mobility","6 yrs"],
  ["Coach Neha","Zumba & Dance Fitness","5 yrs"],
  ["Coach Rahul","Bodybuilding & Contest prep","10 yrs"]
];
GYM.crowd = [15,35,55,60,45,30,20,18,20,25,30,45,70,90,95,80,55,30]; // typical busy % for 6 AM … 11 PM (sample)

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
/* Dishes with photos: they rotate on the café landing page and the gym site.
   Photos are sample photos (Unsplash) until the café's own top-down photos are added in nt/. */
CAFE.featured = [
  { item: "Protein Salad with Olive Oil", name: "PROTEIN SALAD /<br>OLIVE OIL",  tag: "SALADS",  img: "nt/salad.webp",      bg: "#B5D3A0", ink: "#1F3A1C" },
  { item: "Strawberry Shake",             name: "STRAWBERRY /<br>SHAKE",         tag: "SHAKES",  img: "nt/shake.webp",      bg: "#EFA9BD", ink: "#4A1F33" },
  { item: "Chicken Soup",                 name: "CHICKEN /<br>SOUP",             tag: "SOUPS",   img: "nt/chsoup.webp",     bg: "#9FD3C7", ink: "#123A31" },
  { item: "Chicken Egg Salad",            name: "CHICKEN /<br>EGG SALAD",        tag: "PROTEIN", img: "nt/eggsalad.webp",   bg: "#F5D4BA", ink: "#5A3216" },
  { item: "Chilly Chicken (Fat Free)",    name: "CHILLY CHICKEN /<br>FAT FREE",  tag: "MEALS",   img: "nt/chicken.webp",    bg: "#EBD98A", ink: "#2D2F63" },
  { item: "Green Salad",                  name: "GREEN /<br>SALAD",              tag: "SALADS",  img: "nt/greensalad.webp", bg: "#C9D7F0", ink: "#1B2A4A" },
  { item: "Veg Protein Soup",             name: "VEG PROTEIN /<br>SOUP",         tag: "SOUPS",   img: "nt/soup.webp",       bg: "#A99BDB", ink: "#241A45" }
].map(f => ({ ...f, it: Object.values(CAFE.items).find(i => i.n === f.item) })).filter(f => f.it);


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
