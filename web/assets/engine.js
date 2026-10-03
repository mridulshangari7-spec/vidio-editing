/* Infinity scroll engine.
   Each page lists its steps as <section data-step> panels and gives a pose for every object
   per step (window.PAGE.scene). Scrolling never moves the page: it scrubs a fixed stage.
   Objects hold a pose while their step's copy is on screen and travel to the next pose in the
   gap between panels, so the motion itself explains the process. */
(function(){
  "use strict";
  var P=window.PAGE||{}, D=document, root=D.documentElement;
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine=window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  // ---------- shared content ----------
  var PHONES=[["+917986404564","+91 79864 04564"],["+919877168353","+91 98771 68353"],["+919878225225","+91 98782 25225"],["+919324387537","+91 93243 87537"]];
  var MAIL="searchinfinity@gmail.com";
  var MAPS="https://www.google.com/maps/search/?api=1&query=Bindra%20Sateri%20Legacy%2C%20MIDC%20Central%20Road%2C%20Andheri%20East%2C%20Mumbai%20400093";
  var WA="https://wa.me/917986404564?text="+encodeURIComponent("Hi Infinity, I'd like to know more about "+(P.service||"your services")+".");
  var IC={
    star:'<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill="currentColor"/>',
    web:'<rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18" stroke="currentColor" stroke-width="1.8"/><circle cx="6.5" cy="6.6" r=".9" fill="currentColor"/>',
    zap:'<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    menu:'<path d="M6 3h12v18H6z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    heart:'<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor"/>',
    rupee:'<path d="M7 4h11M7 8.5h11M7 4c6 0 7.5 9-1 9.5l8 6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    receipt:'<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 7h6M9 11h6M9 15h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    nfc:'<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8.5 16.5a6 6 0 0 0 0-9"/><path d="M12 19a10 10 0 0 0 0-14"/><path d="M15.5 21.5a14 14 0 0 0 0-19"/><path d="M5 14a2.5 2.5 0 0 0 0-4"/></g>',
    grid:'<g fill="currentColor"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></g>'
  };
  var SERVICES=[
    {k:"review",href:"nfc-review-cards.html",t:"NFC review cards",d:"One tap opens your Google review page.",ic:"star"},
    {k:"websites",href:"websites.html",t:"Animated websites",d:"Scroll stories that explain your business.",ic:"web"},
    {k:"automation",href:"automation.html",t:"Business automation",d:"Replies, reminders and bills that run themselves.",ic:"zap"},
    {k:"menu",href:"digital-menu.html",t:"Digital menus",d:"View, order on WhatsApp, or order and pay.",ic:"menu"},
    {k:"social",href:"social-tags.html",t:"Instagram & YouTube tags",d:"New followers and subscribers in one tap.",ic:"heart"},
    {k:"upi",href:"upi-qr.html",t:"UPI QR codes",d:"Branded payment standees for your counter.",ic:"rupee"},
    {k:"receipts",href:"ai-receipts.html",t:"AI receipts",d:"Bills on the phone, sorted by AI.",ic:"receipt"},
    {k:"nfcauto",href:"nfc-automation.html",t:"NFC automation tags",d:"Wi-Fi, contacts, check-ins and workflows.",ic:"nfc"},
    {k:"allinone",href:"all-in-one-nfc.html",t:"All-in-one NFC",d:"One tag that opens everything you share.",ic:"grid"}
  ];
  function ico(n){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>';}
  var INF_VB="-6 -6 252 93.5";

  // ---------- build the page chrome ----------
  var home=!!P.home;
  var defs='<svg width="0" height="0" style="position:absolute" aria-hidden="true">'+
    '<symbol id="inf" viewBox="'+INF_VB+'"><path fill="currentColor" d="M94.9 38.6 L94.1 37.9 L93.3 37.2 L92.5 36.5 L91.8 35.8 L91.0 35.1 L90.2 34.4 L89.4 33.7 L88.6 33.0 L87.8 32.4 L87.0 31.7 L86.1 31.0 L85.3 30.4 L84.5 29.7 L83.7 29.1 L82.8 28.4 L82.0 27.8 L81.1 27.2 L80.2 26.5 L79.4 25.9 L78.5 25.3 L77.6 24.8 L76.7 24.2 L75.8 23.6 L74.9 23.0 L74.0 22.5 L73.1 21.9 L72.1 21.4 L71.2 20.9 L70.2 20.4 L69.2 19.9 L68.3 19.4 L67.3 19.0 L66.3 18.6 L65.3 18.1 L64.2 17.7 L63.2 17.3 L62.2 16.9 L61.1 16.6 L60.1 16.3 L59.0 15.9 L57.9 15.7 L56.8 15.4 L55.7 15.1 L54.6 14.9 L53.5 14.7 L52.4 14.5 L51.2 14.4 L50.1 14.3 L49.0 14.2 L47.8 14.1 L46.6 14.1 L45.5 14.1 L44.3 14.1 L43.2 14.2 L42.0 14.2 L40.8 14.4 L39.7 14.5 L38.5 14.7 L37.4 15.0 L36.2 15.2 L35.1 15.6 L33.9 15.9 L32.8 16.3 L31.7 16.7 L30.6 17.2 L29.6 17.7 L28.5 18.2 L27.5 18.8 L26.5 19.4 L25.5 20.1 L24.5 20.8 L23.6 21.5 L22.7 22.3 L21.8 23.1 L21.0 23.9 L20.2 24.8 L19.5 25.7 L18.8 26.6 L18.1 27.5 L17.5 28.5 L16.9 29.5 L16.4 30.6 L15.9 31.6 L15.5 32.7 L15.1 33.8 L14.8 34.9 L14.6 36.0 L14.3 37.1 L14.2 38.2 L14.1 39.3 L14.1 40.5 L14.1 41.6 L14.2 42.8 L14.3 43.9 L14.4 45.0 L14.7 46.1 L15.0 47.2 L15.3 48.3 L15.7 49.4 L16.2 50.5 L16.6 51.5 L17.2 52.5 L17.8 53.5 L18.4 54.5 L19.1 55.4 L19.8 56.3 L20.6 57.2 L21.4 58.0 L22.3 58.9 L23.1 59.6 L24.1 60.4 L25.0 61.1 L26.0 61.8 L27.0 62.4 L28.0 63.0 L29.0 63.6 L30.1 64.1 L31.2 64.6 L32.3 65.0 L33.4 65.4 L34.5 65.8 L35.6 66.1 L36.8 66.4 L37.9 66.7 L39.1 66.9 L40.3 67.1 L41.4 67.2 L42.6 67.3 L43.8 67.4 L44.9 67.5 L46.1 67.5 L47.2 67.5 L48.4 67.4 L49.5 67.3 L50.7 67.2 L51.8 67.1 L52.9 66.9 L54.1 66.7 L55.2 66.5 L56.3 66.3 L57.4 66.0 L58.5 65.7 L59.5 65.4 L60.6 65.1 L61.6 64.8 L62.7 64.4 L63.7 64.0 L64.8 63.6 L65.8 63.2 L66.8 62.8 L67.8 62.3 L68.8 61.8 L69.7 61.4 L70.7 60.9 L71.7 60.4 L72.6 59.8 L73.5 59.3 L74.5 58.8 L75.4 58.2 L76.3 57.6 L77.2 57.1 L78.1 56.5 L78.9 55.9 L79.8 55.3 L80.7 54.7 L81.5 54.0 L82.4 53.4 L83.2 52.8 L84.1 52.1 L84.9 51.5 L85.7 50.8 L86.5 50.2 L87.4 49.5 L88.2 48.8 L89.0 48.2 L89.8 47.5 L90.6 46.8 L91.4 46.1 L92.2 45.4 L92.9 44.7 L93.7 44.0 L94.5 43.3 L95.3 42.6 L96.1 41.8 L96.8 41.1 L97.6 40.4 L98.4 39.7 L99.2 38.9 L99.9 38.2 L100.7 37.5 L101.5 36.7 L102.3 36.0 L103.0 35.3 L103.8 34.5 L104.6 33.8 L105.4 33.0 L106.2 32.3 L107.0 31.5 L107.8 30.8 L108.6 30.0 L109.4 29.3 L110.2 28.5 L111.0 27.8 L111.8 27.1 L112.7 26.3 L113.6 25.7 L114.7 25.2 L115.9 24.8 L117.0 24.4 L118.1 24.0 L119.3 23.6 L120.5 23.3 L121.7 22.9 L122.9 22.6 L124.1 22.3 L125.3 22.1 L126.6 21.8 L127.9 21.6 L129.2 21.5 L130.5 21.5 L131.9 21.5 L133.3 21.6 L134.9 21.9 L136.6 22.5 L138.4 24.0 L137.5 24.6 L136.7 25.2 L135.8 25.8 L134.9 26.4 L134.0 27.0 L133.2 27.6 L132.3 28.2 L131.5 28.9 L130.7 29.5 L129.8 30.2 L129.0 30.8 L128.2 31.5 L127.4 32.2 L126.6 32.9 L125.8 33.5 L125.0 34.2 L124.2 34.9 L123.4 35.6 L122.6 36.3 L121.8 37.0 L121.0 37.7 L120.2 38.4 L119.5 39.1 L118.7 39.9 L117.9 40.6 L117.1 41.3 L116.3 42.0 L115.6 42.8 L114.8 43.5 L114.0 44.2 L113.2 45.0 L112.5 45.7 L111.7 46.4 L110.9 47.2 L110.1 47.9 L109.3 48.7 L108.5 49.4 L107.8 50.2 L107.0 50.9 L106.2 51.7 L105.3 52.4 L104.5 53.2 L103.7 53.9 L102.9 54.7 L102.0 55.4 L101.2 56.1 L100.4 56.9 L99.5 57.6 L98.7 58.4 L97.8 59.1 L96.9 59.9 L96.0 60.6 L95.1 61.3 L94.2 62.1 L93.3 62.8 L92.4 63.5 L91.4 64.2 L90.5 64.9 L89.5 65.6 L88.5 66.3 L87.5 67.0 L86.5 67.7 L85.5 68.4 L84.5 69.1 L83.4 69.8 L82.4 70.4 L81.3 71.0 L80.2 71.7 L79.1 72.3 L78.0 72.9 L76.8 73.5 L75.7 74.1 L74.5 74.7 L73.3 75.2 L72.1 75.8 L70.8 76.3 L69.6 76.8 L68.3 77.3 L67.0 77.8 L65.7 78.2 L64.4 78.7 L63.0 79.0 L61.7 79.4 L60.3 79.8 L58.9 80.1 L57.5 80.4 L56.1 80.7 L54.6 80.9 L53.1 81.1 L51.7 81.2 L50.2 81.4 L48.7 81.5 L47.1 81.5 L45.6 81.5 L44.0 81.5 L42.5 81.4 L40.9 81.3 L39.4 81.1 L37.8 80.9 L36.2 80.7 L34.6 80.3 L33.0 80.0 L31.4 79.5 L29.9 79.1 L28.3 78.5 L26.7 78.0 L25.2 77.3 L23.6 76.6 L22.1 75.8 L20.6 75.0 L19.1 74.1 L17.7 73.2 L16.3 72.2 L14.9 71.1 L13.6 70.0 L12.3 68.8 L11.0 67.5 L9.8 66.2 L8.7 64.9 L7.6 63.5 L6.5 62.0 L5.6 60.5 L4.7 58.9 L3.9 57.3 L3.1 55.7 L2.4 54.0 L1.8 52.3 L1.3 50.5 L0.9 48.8 L0.5 47.0 L0.3 45.2 L0.1 43.4 L0.0 41.5 L0.0 39.7 L0.1 37.9 L0.3 36.1 L0.6 34.3 L0.9 32.5 L1.4 30.7 L1.9 29.0 L2.5 27.3 L3.2 25.6 L4.0 23.9 L4.8 22.4 L5.7 20.8 L6.7 19.3 L7.8 17.8 L8.8 16.4 L10.0 15.1 L11.2 13.8 L12.5 12.6 L13.8 11.4 L15.1 10.3 L16.5 9.2 L17.9 8.2 L19.4 7.3 L20.9 6.4 L22.4 5.6 L23.9 4.8 L25.4 4.1 L27.0 3.5 L28.5 2.9 L30.1 2.4 L31.7 1.9 L33.3 1.5 L34.9 1.1 L36.4 0.8 L38.0 0.6 L39.6 0.4 L41.2 0.2 L42.7 0.1 L44.3 0.0 L45.9 0.0 L47.4 0.0 L48.9 0.1 L50.4 0.2 L51.9 0.3 L53.4 0.5 L54.9 0.7 L56.3 0.9 L57.7 1.2 L59.1 1.5 L60.5 1.8 L61.9 2.2 L63.3 2.5 L64.6 3.0 L65.9 3.4 L67.2 3.8 L68.5 4.3 L69.8 4.8 L71.0 5.3 L72.3 5.8 L73.5 6.4 L74.7 6.9 L75.8 7.5 L77.0 8.1 L78.1 8.7 L79.3 9.3 L80.4 9.9 L81.5 10.6 L82.5 11.2 L83.6 11.9 L84.7 12.6 L85.7 13.2 L86.7 13.9 L87.7 14.6 L88.7 15.3 L89.7 16.0 L90.6 16.7 L91.6 17.4 L92.5 18.1 L93.5 18.9 L94.4 19.6 L95.3 20.3 L96.2 21.1 L97.0 21.8 L97.9 22.5 L98.8 23.3 L99.7 24.0 L100.5 24.8 L101.3 25.5 L102.2 26.2 L103.0 27.0 L103.8 27.7 L104.7 28.5 L105.1 28.9Z"/><path fill="currentColor" d="M145.1 42.9 L145.9 43.6 L146.7 44.3 L147.5 45.0 L148.2 45.8 L149.0 46.4 L149.8 47.1 L150.6 47.8 L151.4 48.5 L152.2 49.2 L153.1 49.9 L153.9 50.5 L154.7 51.2 L155.5 51.8 L156.3 52.5 L157.2 53.1 L158.0 53.7 L158.9 54.4 L159.8 55.0 L160.6 55.6 L161.5 56.2 L162.4 56.8 L163.3 57.4 L164.2 57.9 L165.1 58.5 L166.0 59.0 L166.9 59.6 L167.9 60.1 L168.8 60.6 L169.8 61.1 L170.8 61.6 L171.7 62.1 L172.7 62.5 L173.7 63.0 L174.7 63.4 L175.8 63.8 L176.8 64.2 L177.8 64.6 L178.9 64.9 L179.9 65.3 L181.0 65.6 L182.1 65.9 L183.2 66.2 L184.3 66.4 L185.4 66.6 L186.5 66.8 L187.6 67.0 L188.8 67.2 L189.9 67.3 L191.1 67.4 L192.2 67.4 L193.3 67.5 L194.5 67.5 L195.7 67.4 L196.8 67.4 L198.0 67.3 L199.2 67.2 L200.3 67.0 L201.5 66.8 L202.6 66.5 L203.8 66.3 L204.9 66.0 L206.1 65.6 L207.2 65.2 L208.3 64.8 L209.4 64.3 L210.4 63.8 L211.5 63.3 L212.5 62.7 L213.5 62.1 L214.5 61.5 L215.5 60.8 L216.4 60.0 L217.3 59.3 L218.2 58.5 L219.0 57.6 L219.8 56.8 L220.5 55.9 L221.2 54.9 L221.9 54.0 L222.5 53.0 L223.1 52.0 L223.6 51.0 L224.1 49.9 L224.5 48.9 L224.9 47.8 L225.2 46.7 L225.4 45.6 L225.7 44.4 L225.8 43.3 L225.9 42.2 L225.9 41.0 L225.9 39.9 L225.8 38.8 L225.7 37.6 L225.6 36.5 L225.3 35.4 L225.0 34.3 L224.7 33.2 L224.3 32.1 L223.8 31.1 L223.3 30.0 L222.8 29.0 L222.2 28.0 L221.6 27.1 L220.9 26.1 L220.2 25.2 L219.4 24.3 L218.6 23.5 L217.7 22.7 L216.9 21.9 L215.9 21.1 L215.0 20.4 L214.0 19.7 L213.0 19.1 L212.0 18.5 L211.0 17.9 L209.9 17.4 L208.8 16.9 L207.7 16.5 L206.6 16.1 L205.5 15.7 L204.4 15.4 L203.2 15.1 L202.1 14.8 L200.9 14.6 L199.7 14.4 L198.6 14.3 L197.4 14.2 L196.2 14.1 L195.1 14.1 L193.9 14.1 L192.8 14.1 L191.6 14.1 L190.5 14.2 L189.3 14.3 L188.2 14.4 L187.1 14.6 L185.9 14.8 L184.8 15.0 L183.7 15.2 L182.6 15.5 L181.6 15.8 L180.5 16.1 L179.4 16.4 L178.3 16.8 L177.3 17.1 L176.3 17.5 L175.2 17.9 L174.2 18.3 L173.2 18.8 L172.2 19.2 L171.2 19.7 L170.3 20.2 L169.3 20.7 L168.3 21.2 L167.4 21.7 L166.5 22.2 L165.6 22.8 L164.6 23.3 L163.7 23.9 L162.8 24.5 L161.9 25.0 L161.1 25.6 L160.2 26.2 L159.3 26.9 L158.5 27.5 L157.6 28.1 L156.8 28.7 L155.9 29.4 L155.1 30.0 L154.3 30.7 L153.5 31.3 L152.6 32.0 L151.8 32.7 L151.0 33.4 L150.2 34.0 L149.4 34.7 L148.6 35.4 L147.8 36.1 L147.1 36.8 L146.3 37.5 L145.5 38.2 L144.7 39.0 L143.9 39.7 L143.2 40.4 L142.4 41.1 L141.6 41.9 L140.8 42.6 L140.1 43.3 L139.3 44.0 L138.5 44.8 L137.7 45.5 L137.0 46.3 L136.2 47.0 L135.4 47.8 L134.6 48.5 L133.8 49.2 L133.0 50.0 L132.2 50.7 L131.4 51.5 L130.6 52.2 L129.8 53.0 L129.0 53.7 L128.2 54.5 L127.3 55.2 L126.4 55.8 L125.3 56.3 L124.1 56.7 L123.0 57.1 L121.9 57.5 L120.7 57.9 L119.5 58.3 L118.3 58.6 L117.1 58.9 L115.9 59.2 L114.7 59.5 L113.4 59.7 L112.1 59.9 L110.8 60.0 L109.5 60.1 L108.1 60.1 L106.7 59.9 L105.1 59.6 L103.4 59.0 L101.5 57.5 L102.5 56.9 L103.3 56.3 L104.2 55.8 L105.1 55.1 L106.0 54.5 L106.8 53.9 L107.7 53.3 L108.5 52.6 L109.3 52.0 L110.2 51.3 L111.0 50.7 L111.8 50.0 L112.6 49.4 L113.4 48.7 L114.2 48.0 L115.0 47.3 L115.8 46.6 L116.6 45.9 L117.4 45.2 L118.2 44.5 L119.0 43.8 L119.8 43.1 L120.5 42.4 L121.3 41.7 L122.1 41.0 L122.9 40.2 L123.7 39.5 L124.4 38.8 L125.2 38.0 L126.0 37.3 L126.8 36.6 L127.5 35.8 L128.3 35.1 L129.1 34.3 L129.9 33.6 L130.7 32.9 L131.5 32.1 L132.2 31.4 L133.1 30.6 L133.8 29.9 L134.7 29.1 L135.5 28.4 L136.3 27.6 L137.1 26.9 L137.9 26.1 L138.8 25.4 L139.6 24.6 L140.5 23.9 L141.3 23.1 L142.2 22.4 L143.1 21.7 L144.0 20.9 L144.9 20.2 L145.8 19.5 L146.7 18.7 L147.6 18.0 L148.6 17.3 L149.5 16.6 L150.5 15.9 L151.5 15.2 L152.5 14.5 L153.5 13.8 L154.5 13.1 L155.5 12.4 L156.6 11.8 L157.6 11.1 L158.7 10.5 L159.8 9.8 L160.9 9.2 L162.0 8.6 L163.2 8.0 L164.3 7.4 L165.5 6.8 L166.7 6.3 L167.9 5.7 L169.2 5.2 L170.4 4.7 L171.7 4.2 L173.0 3.8 L174.3 3.3 L175.6 2.9 L176.9 2.5 L178.3 2.1 L179.7 1.8 L181.1 1.4 L182.5 1.1 L183.9 0.9 L185.4 0.6 L186.8 0.5 L188.3 0.3 L189.8 0.1 L191.3 0.1 L192.9 0.0 L194.4 0.0 L195.9 0.0 L197.5 0.1 L199.1 0.2 L200.7 0.4 L202.2 0.6 L203.8 0.9 L205.4 1.2 L207.0 1.6 L208.6 2.0 L210.2 2.5 L211.7 3.0 L213.3 3.6 L214.8 4.2 L216.4 4.9 L217.9 5.7 L219.4 6.5 L220.9 7.4 L222.3 8.4 L223.7 9.4 L225.1 10.4 L226.4 11.6 L227.7 12.8 L229.0 14.0 L230.2 15.3 L231.3 16.7 L232.4 18.1 L233.5 19.5 L234.4 21.1 L235.3 22.6 L236.2 24.2 L236.9 25.9 L237.6 27.5 L238.2 29.2 L238.7 31.0 L239.1 32.8 L239.5 34.5 L239.7 36.4 L239.9 38.2 L240.0 40.0 L240.0 41.8 L239.9 43.6 L239.7 45.5 L239.4 47.3 L239.1 49.0 L238.6 50.8 L238.1 52.5 L237.5 54.3 L236.8 55.9 L236.0 57.6 L235.2 59.2 L234.3 60.7 L233.3 62.2 L232.2 63.7 L231.2 65.1 L230.0 66.4 L228.8 67.7 L227.5 69.0 L226.2 70.1 L224.9 71.3 L223.5 72.3 L222.1 73.3 L220.6 74.3 L219.2 75.1 L217.7 76.0 L216.1 76.7 L214.6 77.4 L213.0 78.0 L211.5 78.6 L209.9 79.2 L208.3 79.6 L206.7 80.0 L205.1 80.4 L203.6 80.7 L202.0 81.0 L200.4 81.2 L198.8 81.3 L197.3 81.4 L195.7 81.5 L194.2 81.5 L192.6 81.5 L191.1 81.5 L189.6 81.3 L188.1 81.2 L186.6 81.0 L185.2 80.8 L183.7 80.6 L182.3 80.3 L180.9 80.0 L179.5 79.7 L178.1 79.4 L176.7 79.0 L175.4 78.6 L174.1 78.2 L172.8 77.7 L171.5 77.2 L170.2 76.7 L169.0 76.2 L167.7 75.7 L166.5 75.2 L165.3 74.6 L164.2 74.0 L163.0 73.4 L161.9 72.8 L160.7 72.2 L159.6 71.6 L158.5 71.0 L157.5 70.3 L156.4 69.6 L155.3 69.0 L154.3 68.3 L153.3 67.6 L152.3 66.9 L151.3 66.2 L150.3 65.5 L149.4 64.8 L148.4 64.1 L147.5 63.4 L146.6 62.7 L145.6 61.9 L144.7 61.2 L143.8 60.5 L142.9 59.7 L142.1 59.0 L141.2 58.3 L140.3 57.5 L139.5 56.8 L138.7 56.0 L137.8 55.3 L137.0 54.5 L136.2 53.8 L135.3 53.0 L134.9 52.6Z"/></symbol>'+
    '<symbol id="nfc" viewBox="0 0 24 24">'+IC.nfc+'</symbol>'+
    '<symbol id="star" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></symbol>'+
    '<symbol id="lock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></g></symbol>'+
    '</svg>';
  D.body.insertAdjacentHTML("afterbegin",defs+
    '<div class="boot" id="boot"><div class="bar"><i id="bootBar"></i></div><p id="bootPct">LOADING 0%</p></div>');
  var obj=D.getElementById("obj");
  var stage=D.createElement("div"); stage.className="stage"; stage.setAttribute("aria-hidden","true");
  stage.innerHTML='<div class="veil"></div><svg class="bgmark" id="bgmark" viewBox="'+INF_VB+'"><use href="#inf"/></svg>';
  obj.parentNode.insertBefore(stage,obj); stage.appendChild(obj);
  stage.insertAdjacentHTML("beforeend",'<div class="grain"></div>');

  var main=D.querySelector("main.panels");
  var svcTiles=SERVICES.filter(function(s){return s.k!==P.key;}).map(function(s){
    return '<a class="svc" href="'+s.href+'"><span class="ic">'+ico(s.ic)+'</span><b>'+s.t+'</b><span>'+s.d+'</span></a>';}).join("");
  main.insertAdjacentHTML("beforeend",
    '<section class="panel" data-step id="services" data-pos="center" data-label="'+(home?"All services":"More services")+'" data-dim=".1">'+
      '<p class="eyebrow">'+(P.moreEyebrow||"More from Infinity")+'</p><h1>'+(P.moreTitle||"More ways <em>to grow.</em>")+'</h1>'+
      '<div class="svcs">'+svcTiles+'</div></section>'+
    '<section class="panel contact" data-step id="contact" data-pos="top" data-label="Contact">'+
      '<p class="eyebrow">Contact <span class="dot"></span> Infinity</p>'+
      '<h1>'+(P.contactTitle||"Let’s build it <em>for your business.</em>")+'</h1>'+
      '<p class="sub">Tell us what you need and we’ll plan it with you. Andheri East, Mumbai.</p>'+
      '<div class="cta"><a class="pill" href="'+WA+'" target="_blank" rel="noopener">Chat on WhatsApp</a>'+
      '<div class="calls"><span class="calls-l">Call us</span>'+PHONES.map(function(p){return '<a class="ghost" href="tel:'+p[0]+'">'+p[1]+'</a>';}).join("")+'</div>'+
      '<a class="ghost" href="mailto:'+MAIL+'" title="'+MAIL+'">Email us</a>'+
      '<a class="ghost" href="'+MAPS+'" target="_blank" rel="noopener">Get directions</a></div></section>');

  var panels=[].slice.call(D.querySelectorAll("[data-step]")), n=panels.length;
  var steps=panels.map(function(p){return {id:p.id,pos:p.dataset.pos||"center",label:p.dataset.label||"",dim:p.dataset.dim?parseFloat(p.dataset.dim):1};});

  var chapHTML=steps.map(function(s,i){return '<a href="#'+s.id+'" data-step-go="'+i+'"><span>'+s.label+'</span><i></i></a>';}).join("");
  D.body.insertAdjacentHTML("beforeend",
    '<i class="meter" id="meter"></i>'+
    '<header class="chrome"><a class="mark" href="index.html" aria-label="Infinity home"><svg viewBox="'+INF_VB+'" aria-hidden="true"><use href="#inf"/></svg><span class="mark-word">INFINITY</span></a>'+
      '<nav class="nav" aria-label="Main">'+
        '<a href="index.html"'+(home?' aria-current="page"':'')+'>Home</a>'+
        '<a class="nav-svc" href="'+(home?"#services":"index.html#services")+'"'+(home?' data-step-go="'+(n-2)+'"':'')+'>Services</a>'+
        '<a href="#contact" data-step-go="'+(n-1)+'">Contact</a>'+
        '<a class="pill" href="'+WA+'" target="_blank" rel="noopener">Talk to us</a></nav></header>'+
    '<nav class="chap" id="chap" aria-label="Chapters">'+chapHTML+'</nav>'+
    '<footer class="foot"><span><span class="f-x">Bindra Sateri Legacy, MIDC Central Road, </span>Andheri East &nbsp;&middot;&nbsp; +91 79864 04564<span class="f-x"> &nbsp;&middot;&nbsp; '+MAIL+'</span></span></footer>'+
    '<a class="wa-fab" href="'+WA+'" target="_blank" rel="noopener" aria-label="Chat with Infinity on WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3z"/></svg><span>Chat with us</span></a>'+
    '<div class="track" id="track"></div>');
  D.getElementById("track").style.height="calc("+(n*115)+"vh)";
  D.getElementById("track").style.minHeight=(n*700)+"px";

  // ---------- sample QR codes (decorative, they do not scan) ----------
  function qrSvg(seed){
    var N=25,m=[],x,y,i,r=seed>>>0;
    function rnd(){r=(Math.imul(r,1664525)+1013904223)>>>0;return r/4294967296;}
    function finder(ox,oy){for(y=-1;y<8;y++)for(x=-1;x<8;x++){var X=ox+x,Y=oy+y;if(X<0||Y<0||X>=N||Y>=N)continue;var e=Math.max(Math.abs(x-3),Math.abs(y-3));m[Y*N+X]=(e===3||e<=1)?1:0;}}
    for(i=0;i<N*N;i++)m[i]=rnd()<.47?1:0;
    finder(0,0);finder(N-7,0);finder(0,N-7);
    var d="";for(y=0;y<N;y++)for(x=0;x<N;x++)if(m[y*N+x])d+="M"+x+" "+y+"h1v1h-1z";
    return '<svg viewBox="0 0 25 25" shape-rendering="crispEdges" aria-hidden="true"><path fill="#1c1b19" d="'+d+'"/></svg>';
  }
  [].forEach.call(D.querySelectorAll("[data-qr]"),function(el){el.insertAdjacentHTML("beforeend",qrSvg(Math.imul(+el.dataset.qr||7,2654435761)));});

  // ---------- helpers ----------
  function clamp(v,a,b){return Math.min(b,Math.max(a,v));}
  function smooth(t){return t*t*(3-2*t);}
  function eio(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function ramp(p,a,b){if(b<=a)return p>=b?1:0;return smooth(clamp((p-a)/(b-a),0,1));}
  function mix(a,b,t){return a+(b-a)*t;}
  function kf(p,f){if(p<=f[0][0])return f[0][1];for(var i=1;i<f.length;i++){var t1=f[i][0],t0=f[i-1][0];if(p<=t1)return f[i-1][1]+(f[i][1]-f[i-1][1])*eio((p-t0)/((t1-t0)||1));}return f[f.length-1][1];}
  function show(el,name){[].forEach.call(el.querySelectorAll(":scope > .scr, :scope > .view"),function(s){s.classList.toggle("on",s.dataset.s===name);});}

  // ---------- objects and poses ----------
  var objs=[].slice.call(obj.querySelectorAll(".o")).map(function(el){return {el:el,name:el.dataset.o,w:0,h:0};});
  var BASE={x:0,y:0,s:1,rx:0,ry:0,rz:0,o:1};
  function fill(list){
    // every step needs a pose for every object; missing ones copy the nearest pose, hidden
    var out=[];
    for(var i=0;i<n;i++){
      var src=list[Math.min(i,list.length-1)]||{}, row={};
      if(i>=list.length) src=Object.assign({},list[list.length-1]||{});
      objs.forEach(function(o){
        var p=src[o.name];
        if(!p){ var j,near=null; for(j=1;j<n&&!near;j++){ var a=list[i-j]&&list[i-j][o.name], b=list[i+j]&&list[i+j][o.name]; near=a||b||null; } p=Object.assign({},near||{},{o:0}); }
        row[o.name]=Object.assign({},BASE,p);
      });
      out.push(row);
    }
    return out;
  }
  var SD=fill(P.scene||[]);
  var SM=fill((P.sceneM||P.scene||[]).map(function(row,i){
    if(P.sceneM&&P.sceneM[i])return P.sceneM[i];
    var r={};Object.keys(row).forEach(function(k){var p=row[k];r[k]=Object.assign({},p,{x:(p.x||0)*.55,y:(p.y||0)*.6});});return r;}));
  // services and contact steps reuse the last pose unless the page set them

  var W=0,H=0,wide=true,boxes=[],U=1;
  function contentBottom(p){var b=0;[].forEach.call(p.children,function(c){b=Math.max(b,c.offsetTop+c.offsetHeight);});return b;}
  function measure(){
    W=window.innerWidth;H=window.innerHeight;wide=W>=900;
    var short=H<520;
    objs.forEach(function(o){o.w=o.el.offsetWidth;o.h=o.el.offsetHeight;});
    boxes=steps.map(function(s,i){
      var pos=s.pos,b,cb=contentBottom(panels[i]),bottom=short?H-10:H-56;
      if(wide){
        if(pos==="left")b={x0:W*.5,x1:W-96,y0:84,y1:H-52};
        else if(pos==="right")b={x0:40,x1:W*.5,y0:84,y1:H-52};
        else if(pos==="top")b={x0:60,x1:W-96,y0:cb+16,y1:bottom+6};
        else b={x0:0,x1:W,y0:70,y1:H-40};
      }else{
        if(pos==="center")b={x0:0,x1:W,y0:70,y1:bottom};
        else b={x0:10,x1:W-10,y0:cb+14,y1:bottom};
      }
      var bw=b.x1-b.x0,bh=b.y1-b.y0;
      b.vis=clamp((bh-80)/70,0,1);
      b.fit=wide?clamp(Math.min(bw/620,bh/600),.38,1.3):clamp(Math.min(bw/400,bh/420),.28,1);
      return b;
    });
  }
  function abs(i,o){
    var p=(wide?SD:SM)[i][o.name],b=boxes[i],bw=b.x1-b.x0,bh=b.y1-b.y0;
    // never larger than the free box, and kept inside it, so objects cannot cover the copy
    var s=Math.min(p.s*b.fit, bh*.97/o.h, bw*.97/o.w);
    var hw=o.w*s/2, hh=o.h*s/2;
    var x=(b.x0+b.x1)/2+p.x*bw, y=(b.y0+b.y1)/2+p.y*bh;
    if(steps[i].dim>=1){ x=clamp(x,b.x0+hw,Math.max(b.x0+hw,b.x1-hw)); y=clamp(y,b.y0+hh,Math.max(b.y0+hh,b.y1-hh)); }
    return {x:x, y:y, s:s, rx:p.rx, ry:p.ry, rz:p.rz, o:p.o*b.vis};
  }

  // ---------- headline line reveal ----------
  var heads=panels.map(function(p){
    var h=p.querySelector("h1"); if(!h)return [];
    h.innerHTML=h.innerHTML.split(/<br\s*\/?>/i).map(function(part){return '<span class="ln"><span>'+part.trim()+'</span></span>';}).join("");
    return [].slice.call(h.querySelectorAll(".ln>span")).map(function(el){return {el:el,v:-1};});
  });

  // ---------- state ----------
  var meter=D.getElementById("meter"), bgmark=D.getElementById("bgmark"), chap=[].slice.call(D.querySelectorAll("#chap a"));
  var progress=0, sceneT=0, ready=false, lastChap=-1, intro=reduce?1:0, introStart=0;
  var mx=0,my=0,tmx=0,tmy=0;
  if(fine&&!reduce)window.addEventListener("pointermove",function(e){tmx=e.clientX/window.innerWidth*2-1;tmy=e.clientY/window.innerHeight*2-1;},{passive:true});
  function maxScroll(){return D.documentElement.scrollHeight-window.innerHeight;}
  function readScroll(){var m=maxScroll();progress=m>0?clamp(window.pageYOffset/m,0,1):0;}
  function stepTarget(i){return i>=n-1?1:(i+.36)/n;}
  function go(i,instant){window.scrollTo({top:stepTarget(i)*maxScroll(),behavior:(instant||reduce)?"auto":"smooth"});}

  function cue(i){var a=i/n,L=1/n;return [i?a+.02*L:-1, i?a+.16*L:0, i<n-1?a+.56*L:9, i<n-1?a+.68*L:10];}

  function paint(time){
    meter.style.transform="scaleX("+progress+")";
    bgmark.style.transform="translate(-50%,calc(-50% + "+((.5-sceneT/Math.max(1,n-1))*16).toFixed(2)+"vh)) rotate("+((sceneT/Math.max(1,n-1)-.5)*6).toFixed(2)+"deg)";
    // panels
    for(var i=0;i<n;i++){
      var c=cue(i),el=panels[i],enter=ramp(progress,c[0],c[1]),leave=ramp(progress,c[2],c[3]);
      var o=enter*(1-leave),y=(1-enter)*22-leave*22;
      el.style.opacity=o; el.style.transform="translate3d(0,"+y+"px,0)"; el.style.pointerEvents=o>.35?"auto":"none";
      var e=enter*(i===0?Math.min(1,intro*1.25):1),L=heads[i];
      for(var j=0;j<L.length;j++){var t=smooth(clamp(e*1.5-j*.22,0,1)),v=Math.round((1-t)*1100)/10;if(v!==L[j].v){L[j].v=v;L[j].el.style.transform="translate3d(0,"+v+"%,0)";}}
    }
    // chapter rail
    var ci=Math.min(n-1,Math.floor(progress*n+.0001));
    if(ci!==lastChap){chap.forEach(function(a,k){a.classList.toggle("on",k===ci);});lastChap=ci;}
    scene(time);
  }

  function scene(time){
    var t=clamp(sceneT,0,n-.0001), i=Math.min(n-1,Math.floor(t)), u=t-i;
    var b=i<n-1?smooth(clamp((u-.6)/.4,0,1)):0, ie=eio(intro);
    var f=mix(steps[i].dim,steps[Math.min(n-1,i+1)].dim,b);
    obj.style.opacity=(.02+.98*Math.pow(f,1.3)).toFixed(3);
    obj.style.filter=f<.98?"blur("+((1-f)*6).toFixed(2)+"px)":"none";
    objs.forEach(function(o,k){
      var A=abs(i,o),B=i<n-1?abs(i+1,o):A;
      // leaving objects fade in the first half of the move, arriving ones in the second, so nothing ghosts
      var ob=B.o<A.o?clamp(b*2,0,1):clamp(b*2-1,0,1);
      var x=mix(A.x,B.x,b),y=mix(A.y,B.y,b),s=mix(A.s,B.s,b),rx=mix(A.rx,B.rx,b),ry=mix(A.ry,B.ry,b),rz=mix(A.rz,B.rz,b),op=mix(A.o,B.o,ob);
      if(!reduce){y+=Math.sin(time/1100+k*1.7)*4;}
      y+=(1-ie)*H*.22; op*=ie;
      rx+=-my*5; ry+=mx*7;
      o.el.style.transform="translate("+(x-o.w/2).toFixed(1)+"px,"+(y-o.h/2).toFixed(1)+"px) scale("+s.toFixed(4)+") rotateZ("+rz.toFixed(2)+"deg) rotateX("+rx.toFixed(2)+"deg) rotateY("+ry.toFixed(2)+"deg)";
      o.el.style.opacity=op.toFixed(3);
      o.el.style.visibility=op<.01?"hidden":"visible";
    });
    if(P.tick)P.tick({t:t,i:i,u:u,n:n,W:W,H:H,wide:wide,kf:kf,clamp:clamp,smooth:smooth,mix:mix,show:show,step:steps[i]});
  }

  function frame(time){
    mx+=(tmx-mx)*.06; my+=(tmy-my)*.06;
    if(ready&&!introStart)introStart=time;
    if(!reduce&&introStart)intro=clamp((time-introStart-120)/1500,0,1);
    var target=progress*n; if(target>n-.0001)target=n-.0001;
    var gap=target-sceneT; if(Math.abs(gap)>0.0005)sceneT+=reduce?gap:gap*.115;
    paint(time); requestAnimationFrame(frame);
  }

  // ---------- boot ----------
  var bootBar=D.getElementById("bootBar"),bootPct=D.getElementById("bootPct"),t0=performance.now(),fontsDone=false;
  function setP(v){bootBar.style.transform="scaleX("+v+")";bootPct.textContent="LOADING "+Math.round(v*100)+"%";}
  if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){fontsDone=true;measure();});else fontsDone=true;
  function start(){
    if(ready)return; ready=true; setP(1); measure();
    var h=(location.hash||"").slice(1), k=steps.findIndex?steps.findIndex(function(s){return s.id===h;}):-1;
    if(h&&k>=0)go(k,true);
    readScroll(); sceneT=progress*n;
    setTimeout(function(){D.getElementById("boot").classList.add("done");root.classList.add("ready");},180);
  }
  (function tick(){var el=performance.now()-t0,v=Math.min(el/700,fontsDone?1:.9);setP(v);if((v>=1&&fontsDone)||el>2500){start();return;}requestAnimationFrame(tick);})();

  // ---------- navigation ----------
  function stepIndex(id){for(var i=0;i<n;i++)if(steps[i].id===id)return i;return -1;}
  D.addEventListener("click",function(e){
    var a=e.target.closest("a,[data-step-go]"); if(!a)return;
    if(a.dataset.stepGo){e.preventDefault();go(parseInt(a.dataset.stepGo,10));return;}
    var h=a.getAttribute("href")||"";
    if(h.charAt(0)==="#"){var k=stepIndex(h.slice(1)); if(k>=0){e.preventDefault();go(k);}}
  });
  window.addEventListener("keydown",function(e){
    if(e.altKey||e.ctrlKey||e.metaKey||/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(e.target.tagName||""))return;
    var dir=({ArrowDown:1,PageDown:1," ":e.shiftKey?-1:1,ArrowUp:-1,PageUp:-1})[e.key]; if(!dir)return;
    e.preventDefault();
    var cur=Math.min(n-1,Math.floor(progress*n+.0001)); var next=clamp(cur+dir,0,n-1);
    if(dir<0&&progress*n-cur>.5)next=cur;
    go(next);
  });
  window.addEventListener("scroll",readScroll,{passive:true});
  window.addEventListener("resize",function(){measure();readScroll();});
  window.addEventListener("load",measure);
  setTimeout(measure,600);

  readScroll(); measure(); sceneT=progress*n; paint(0); requestAnimationFrame(frame);
  window.INFINITY={go:go,qrSvg:qrSvg};
})();
