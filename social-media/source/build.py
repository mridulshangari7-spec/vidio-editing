INF=open('inf_paths.txt').read()
QR=open('wa_qr.svg').read()
WA="+91 79864 04564"
SITE="growwithinfinity.github.io"
def inf(cls="inf",color="currentColor"): return f'<svg class="{cls}" viewBox="-6 -6 252 93.5" style="color:{color}">{INF}</svg>'
def brand(dark=True): return f'<div class="brand a0">{inf("bi")}<span>INFINITY<small>TECHNOLOGIES</small></span></div>'
def cta(text="WhatsApp for a free demo"): return f'<div class="cta a5"><span class="wa"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 5 5.1-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg></span><b>{text}</b><em>{WA}</em></div>'
def phone(inner,cls=""): return f'<div class="phone {cls}"><div class="notch"></div><div class="scr">{inner}</div></div>'
def card(label="TAP TO REVIEW",cls=""): return f'<div class="card {cls}">{inf("ci")}<div class="waves"><i></i><i></i><i></i></div><p>{label}</p><small>INFINITY</small></div>'
STAR='<svg viewBox="0 0 24 24"><path fill="#fbbc04" d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>'
def bullets(items): return '<ul class="bl a4">'+''.join(f'<li><i>✓</i>{x}</li>' for x in items)+'</ul>'

S=[]
# 1 brand intro
S.append(('01-brand','dark',f'''{brand()}
<div class="hero a1">{inf("big")}</div>
<p class="eye a2">SMART NFC · WEBSITES · AUTOMATION</p>
<h1 class="a2">Grow your business<br>with <em>one tap.</em></h1>
<div class="chips a3"><span>NFC Review Cards</span><span>Animated Websites</span><span>Digital Menus</span><span>Insta &amp; YouTube Tags</span><span>UPI QR</span><span>AI Receipts</span><span>Automation</span></div>
{cta("Message us today")}'''))
# 2 review card
S.append(('02-review-card','light',f'''{brand(False)}
<p class="eye a1">NFC GOOGLE REVIEW CARD</p>
<h1 class="a1">1 tap =<br><em>1 Google review.</em></h1>
<div class="scene a2">{card("TAP TO REVIEW","tapper")}{phone('<div class="g"><b>Google</b><span>Rate your visit</span><div class="stars">'+STAR*5+'</div><div class="btn">Post review</div></div>',"rp")}</div>
{bullets(["Customer taps the card, review page opens","No app, no QR hunting, works on any phone","More 5★ reviews = more customers find you"])}
{cta()}'''))
# 3 insta / youtube
S.append(('03-social-tags','dark',f'''{brand()}
<p class="eye a1">INSTAGRAM &amp; YOUTUBE NFC TAGS</p>
<h1 class="a1">Tap. Follow.<br><em>Done.</em></h1>
<div class="scene a2">{card("TAP TO FOLLOW","tapper")}{phone('<div class="ig"><div class="av"></div><b>yourbusiness</b><span>12.4K followers</span><div class="fbtn">Follow</div><div class="yt">▶ Subscribe</div></div>',"rp")}</div>
{bullets(["Stick it on the counter, table or bill folder","Customers follow your page in one tap","Turn every visit into a follower"])}
{cta()}'''))
# 4 digital menu
S.append(('04-digital-menu','light',f'''{brand(False)}
<p class="eye a1">DIGITAL MENU · QR + NFC</p>
<h1 class="a1">Your menu,<br><em>on every phone.</em></h1>
<div class="scene a2">{phone('<div class="mn"><b>Menu</b><div class="tabs"><i class="on">Ramen</i><i>Sushi</i><i>Coffee</i></div>'+''.join(f'<div class="it"><span class="d {c}"></span><div><b>{n}</b><small>{p}</small></div><em>+</em></div>' for n,p,c in [("Chicken Ramen","₹349","n"),("Veg Ramen","₹299","v"),("Iced Coffee","₹179","v")])+'<div class="ord">Order on WhatsApp</div></div>',"solo")}</div>
{bullets(["View menu, order on WhatsApp, or order + pay","Change prices anytime, no reprinting","Search, veg filter and photos"])}
{cta()}'''))
# 5 websites
S.append(('05-websites','dark',f'''{brand()}
<p class="eye a1">ANIMATED WEBSITES</p>
<h1 class="a1">Websites that<br><em>move people.</em></h1>
<div class="scene a2"><div class="browser"><div class="bar"><i></i><i></i><i></i><span>yourbusiness.com</span></div><div class="pg"><div class="hb"></div><div class="l1"></div><div class="l2"></div><div class="row"><div></div><div></div><div></div></div></div></div></div>
{bullets(["Scroll animations, walkthroughs, premium design","Fast on mobile, Google friendly","Menu, booking and WhatsApp built in"])}
{cta()}'''))
# 6 automation
S.append(('06-automation','light',f'''{brand(False)}
<p class="eye a1">BUSINESS AUTOMATION</p>
<h1 class="a1">Work that<br><em>runs itself.</em></h1>
<div class="scene a2"><div class="flow"><div class="node"><span>💬</span><b>Customer messages</b><small>11:42 PM</small></div><div class="arr"></div><div class="node"><span>⚡</span><b>Instant auto-reply</b><small>Menu, timings, prices</small></div><div class="arr"></div><div class="node"><span>📊</span><b>Lead saved</b><small>Google Sheet</small></div></div></div>
{bullets(["WhatsApp auto-replies, day and night","Bookings with automatic reminders","Bills and payment follow-ups"])}
{cta()}'''))
# 7 upi
S.append(('07-upi','dark',f'''{brand()}
<p class="eye a1">UPI QR + NFC PAYMENTS</p>
<h1 class="a1">Get paid<br><em>in a tap.</em></h1>
<div class="scene a2">{card("TAP TO PAY","tapper")}{phone('<div class="up"><b>Pay Your Business</b><div class="amt">₹ 450</div><div class="apps"><i>GPay</i><i>PhonePe</i><i>Paytm</i></div><div class="paid">✓ Paid</div></div>',"rp")}</div>
{bullets(["Branded UPI standee and NFC tag","Opens the customer's UPI app directly","No wrong numbers, no screenshots"])}
{cta()}'''))
# 8 ai receipts
S.append(('08-ai-receipts','light',f'''{brand(False)}
<p class="eye a1">AI RECEIPTS</p>
<h1 class="a1">Tap for the bill.<br><em>AI does the rest.</em></h1>
<div class="scene a2">{phone('<div class="rc"><b>Receipt #1042</b>'+''.join(f'<div class="r"><span>{a}</span><span>{b}</span></div>' for a,b in [("Chicken Ramen","₹349"),("Iced Coffee x2","₹358"),("Tempura Roll","₹329"),("GST 5%","₹52")])+'<div class="r t"><span>Total</span><span>₹1,088</span></div><div class="ai">✦ AI read 12 bills today · saved to sheet</div></div>',"solo")}</div>
{bullets(["Customer taps, the digital bill opens","No paper, no printer rolls","AI reads your bills and fills your accounts"])}
{cta()}'''))
# 9 nfc automation
S.append(('09-nfc-automation','dark',f'''{brand()}
<p class="eye a1">NFC AUTOMATION TAGS</p>
<h1 class="a1">One tap does<br><em>the job.</em></h1>
<div class="grid4 a2"><div><span>📶</span><b>Wi-Fi</b><small>Join without typing a password</small></div><div><span>👤</span><b>Save contact</b><small>Your number in their phone</small></div><div><span>🕘</span><b>Staff check-in</b><small>Attendance with a tap</small></div><div><span>⚙️</span><b>Workflows</b><small>Open forms, sheets, links</small></div></div>
{bullets(["Small stickers that work on any phone","We program and set up everything","Change what a tag does anytime"])}
{cta()}'''))
# 10 all in one
S.append(('10-all-in-one','light',f'''{brand(False)}
<p class="eye a1">ALL-IN-ONE NFC CARD</p>
<h1 class="a1">One card.<br><em>Everything.</em></h1>
<div class="scene a2">{card("TAP ME","tapper")}{phone('<div class="hub"><b>Your Business</b>'+''.join(f'<div class="hl"><span>{i}</span>{t}</div>' for i,t in [("★","Leave a Google review"),("◎","Follow on Instagram"),("☰","See the menu"),("₹","Pay by UPI")])+'</div>',"rp")}</div>
{bullets(["Reviews, socials, menu, payments in one tap","Your own branded page","Update the links anytime"])}
{cta()}'''))
# 11 our work: elgin
S.append(('11-our-work-elgin','dark',f'''{brand()}
<p class="eye a1">RECENTLY DELIVERED</p>
<h1 class="a1">Elgin Hospitality,<br><em>Amritsar.</em></h1>
<div class="work a2"><img class="w1" src="elgin_front.jpg" alt=""><img class="w2" src="elgin_back.jpg" alt=""></div>
<p class="wtxt a3">Custom NFC cards for all their venues. One tap opens every Elgin Instagram page.</p>
{bullets(["Designed to match their interiors","Tap or scan, works on any phone","Managed by us, updated anytime"])}
{cta("Want cards like these?")}'''))
# 12 contact
S.append(('12-contact','light',f'''{brand(False)}
<div class="hero a1">{inf("big gold")}</div>
<h1 class="a2 c">Let&rsquo;s grow<br><em>your business.</em></h1>
<p class="lead a2">Free demo at your shop. Tap a card, see it work, then decide.</p>
<div class="qrbox a3">{QR}<span>Scan to WhatsApp us</span></div>
<div class="contact a4"><b>{WA}</b><span>{SITE}</span><span>Amritsar, Punjab</span></div>
{cta("Book your free demo")}'''))

html=open('tpl.html').read().replace('/*STORIES*/','\n'.join(f'<section class="story {th}" id="s{i+1}" data-name="{n}">{b}</section>' for i,(n,th,b) in enumerate(S)))
open('stories.html','w').write(html)
open('names.txt','w').write('\n'.join(n for n,_,_ in S))
print(len(S))
