"""Builds kit.html for the Infinity Technologies Instagram kit (posts, profile photo, highlight covers).
Run: python3 build.py   then render with render.js."""
import re, math

base = open('../smart-silver-card/poster.base.html').read()
INF_INNER = re.search(r'<symbol id="inf" viewBox="-6 -6 252 93.5">(.*?)</symbol>',
                      open('../../brochure/brochure.html').read(), re.S).group(1)
LOGO = f'<svg viewBox="-6 -6 252 93.5">{INF_INNER}</svg>'
CARD_CSS = base[base.index('.card{'):base.index('.phone{')]
CARD_HTML = base[base.index('<div class="card">'):base.index('<div class="tapb">')]

def I(d): return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{d}</svg>'
IC = {
 'star': '<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/>',
 'tap': '<path d="M8.5 16.5a6 6 0 0 0 0-9"/><path d="M12 19a10 10 0 0 0 0-14"/><path d="M15.5 21.5a14 14 0 0 0 0-19"/><circle cx="5" cy="12" r="1.3" fill="currentColor"/>',
 'link': '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 'menu': '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
 'globe': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
 'cup': '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
 'pin': '<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
 'ig': '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".7" fill="currentColor"/>',
 'wa': '<path d="M4 20l1.3-3.8A8 8 0 1 1 8 19z"/>',
 'wifi': '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/>',
 'chef': '<path d="M7 14a4 4 0 1 1 1.2-7.8A4.5 4.5 0 0 1 16 6.3 4 4 0 1 1 17 14v6H7z"/><path d="M7 17h10"/>',
 'chat': '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
 'phone': '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/>',
}
WA = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2zm0 1.8a8 8 0 1 1-4.2 14.8l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4zm-3.2 4c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.6 0 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4l-.5-.3-1.8-.9c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4z"/></svg>'

def phone(img, w, x, y, rot=0):
    h = int(w * 2.06)
    return (f'<div class="ph" style="width:{w}px;height:{h}px;left:{x}px;top:{y}px;transform:rotate({rot}deg)">'
            f'<div class="s"><img src="img/{img}"></div><i class="isl"></i></div>')

def head(n, eyebrow, h1, sub):
    return (f'<div class="wm">{LOGO}</div>'
            f'<div class="top"><div class="br">{LOGO}<b>INFINITY</b></div><span class="pg"><b>{n:02d}</b> / 09</span></div>'
            f'<div class="eb"><i></i>{eyebrow}</div><h1>{h1}</h1><p class="sub">{sub}</p>')

def pts(items):
    return '<ol class="pts">' + ''.join(f'<li><span>{i+1:02d}</span>{t}</li>' for i, t in enumerate(items)) + '</ol>'

FOOT = '<div class="ft">WhatsApp 79864 04564</div>'
P = []

# 01 welcome
svc = [('star', 'Google review cards'), ('ig', 'Instagram cards'), ('link', 'All-in-one cards'), ('menu', 'Digital menus'),
       ('chef', 'Table ordering'), ('globe', 'Animated websites'), ('cup', 'Loyalty stamp cards'), ('pin', 'Google listing setup')]
P.append(f'''<div class="wm big">{LOGO}</div>
<div class="top"><div class="br">{LOGO}<b>INFINITY</b></div><span class="pg"><b>01</b> / 09</span></div>
<div class="eb"><i></i>SMART TOOLS FOR LOCAL BUSINESSES</div>
<h1 class="hero">Tap.<br>Scan.<br><em>Grow.</em></h1>
<div class="svc">{''.join(f'<div>{I(IC[k])}<span>{t}</span></div>' for k, t in svc)}</div>{FOOT}''')

# 02 review card
P.append(head(2, 'GOOGLE REVIEW CARD', 'More <em>5★ reviews.</em><br>One tap.', 'Keep it on the counter. Customers tap, the review page opens, done in 10 seconds.')
         + f'<div class="cardwrap">{CARD_HTML}</div>' + phone('review.jpg', 380, 640, 760, 4) + FOOT)

# 03 all-in-one
links = [('ig', 'Instagram'), ('globe', 'Website'), ('menu', 'Menu'), ('pin', 'Location'), ('wa', 'WhatsApp'), ('star', 'Reviews'), ('wifi', 'Wi-Fi')]
nodes = ''.join(f'<div class="nd" style="left:{540+360*math.cos(-math.pi/2+i*2*math.pi/7):.0f}px;top:{900+250*math.sin(-math.pi/2+i*2*math.pi/7):.0f}px">{I(IC[k])}<span>{t}</span></div>' for i, (k, t) in enumerate(links))
P.append(head(3, 'ALL-IN-ONE CARD', 'One card.<br><em>Every link.</em>', 'One tap opens a page with everything about your business. Change links anytime.')
         + f'<div class="hub">{I(IC["tap"])}<b>TAP</b></div>{nodes}{FOOT}')

# 04 digital menu
P.append(head(4, 'DIGITAL MENU', 'Scan the table.<br><em>See the menu.</em>', 'Your full menu on the customer’s phone.')
         + pts(['Change prices anytime', 'No reprinting menus', 'Search & veg filter', 'One menu per branch']) + phone('menu.jpg', 400, 600, 640, 4) + FOOT)

# 05 ordering
P.append(head(5, 'TABLE ORDERING', 'Order from the table.<br><em>No waiting.</em>', 'Orders go straight to the kitchen, with live status on the phone.')
         + pts(['Send to kitchen in one tap', 'Live status: Preparing, Ready', 'Call waiter & ask for bill', 'Fake-order protection']) + phone('order.jpg', 400, 600, 640, 4) + FOOT)

# 06 websites
P.append(head(6, 'ANIMATED WEBSITES', 'Websites that<br><em>move.</em>', 'Your shop comes alive when people scroll. 3D stores, cafés, hotels and more.')
         + phone('vxon.jpg', 380, 110, 700, -5) + phone('mnp.jpg', 380, 570, 640, 5))

# 07 loyalty
P.append(head(7, 'LOYALTY STAMP CARD', 'Bring them<br><em>back again.</em>', 'Customers tap on every visit and collect stamps.')
         + pts(['5 visits = 1 free treat', '1 stamp per visit, no cheating', 'Collect numbers for offers', 'No app needed']) + phone('stamp.jpg', 400, 600, 640, 4) + FOOT)

# 08 how it works
steps = [('tap', 'Tap or scan', 'Hold the phone near the card, or scan the QR.'),
         ('phone', 'Page opens', 'Review, menu, Instagram or website: you choose.'),
         ('star', 'You grow', 'More reviews, followers and repeat customers.')]
P.append(head(8, 'HOW IT WORKS', 'So easy,<br><em>anyone can use it.</em>', 'No app. No typing. Works on iPhone & Android.')
         + '<div class="steps">' + ''.join(f'<div class="stp"><div class="no">0{i+1}</div><div class="si">{I(IC[k])}</div><div><b>{a}</b><span>{t}</span></div></div>' for i, (k, a, t) in enumerate(steps)) + '</div>' + FOOT)

# 09 contact
P.append(head(9, "LET'S TALK", 'Let’s grow<br>your <em>business.</em>', 'Free demo for your shop, café, salon, gym or clinic.')
         + f'''<div class="cta"><div class="wab">{WA}79864 04564</div>
<div class="cl"><div>{I(IC["chat"])}DM us on Instagram</div><div>{I(IC["globe"])}growwithinfinity.github.io</div><div>{I(IC["pin"])}Amritsar · Mumbai</div></div></div>
<div class="sig">{LOGO}<b>INFINITY TECHNOLOGIES</b></div>''')

CSS = '''
@font-face{font-family:D;src:url(DM-400.woff2);font-weight:400}@font-face{font-family:D;src:url(DM-500.woff2);font-weight:500}
@font-face{font-family:D;src:url(DM-600.woff2);font-weight:600}@font-face{font-family:D;src:url(DM-700.woff2);font-weight:700}
@font-face{font-family:S;src:url(IS.woff2)}@font-face{font-family:S;src:url(ISi.woff2);font-style:italic}
@font-face{font-family:L;src:url(Lora.woff2)}@font-face{font-family:Pp;src:url(Poppins-400.ttf);font-weight:400}@font-face{font-family:Pp;src:url(Poppins-500.ttf);font-weight:500}
*{box-sizing:border-box;margin:0;padding:0} body{background:#888;font-family:D,sans-serif}
:root{--ink:#0d0c0b;--soft:#4d4a45;--mute:#8a857c;--gold:#b8892a;--line:rgba(13,12,11,.12);--tile:#fbfaf7}
.post{width:1080px;height:1350px;position:relative;overflow:hidden;padding:72px 80px;margin:0 0 20px;color:var(--ink);
 background:radial-gradient(85% 60% at 50% 30%,#fbfaf7 0%,#f2f0ec 55%,#e7e3da 100%)}
.wm{position:absolute;right:-180px;top:520px;width:1100px;color:var(--ink);opacity:.035;pointer-events:none}
.wm svg{width:100%} .wm.big{right:-260px;top:600px;width:1400px;opacity:.045}
.top{position:relative;display:flex;align-items:center;justify-content:space-between}
.br{display:flex;align-items:center;gap:14px} .br svg{width:70px} .br b{font:400 26px/1 S,serif;letter-spacing:.38em}
.pg{font:400 26px/1 S,serif;color:var(--mute)} .pg b{font-weight:400;color:var(--ink)}
.eb{position:relative;display:flex;align-items:center;gap:16px;margin-top:84px;font-weight:700;font-size:22px;letter-spacing:.24em;color:var(--gold)}
.eb i{display:block;width:44px;height:2px;background:var(--gold)}
h1{position:relative;margin-top:26px;font:400 112px/.96 S,serif;letter-spacing:-.025em}
h1 em{font-style:italic;color:var(--gold)}
h1.hero{font-size:236px;line-height:.86;margin-top:30px}
.sub{position:relative;margin-top:28px;font-size:33px;line-height:1.38;color:var(--soft);max-width:860px}
.ft{position:absolute;left:80px;bottom:62px;font-weight:600;font-size:23px;letter-spacing:.04em;color:var(--soft)}
.svc{position:absolute;left:80px;right:80px;top:880px;display:grid;grid-template-columns:1fr 1fr;gap:0 40px;border-top:1px solid var(--line)}
.svc div{display:flex;align-items:center;gap:18px;padding:22px 0;border-bottom:1px solid var(--line);font-size:29px;font-weight:600}
.svc svg{width:34px;height:34px;color:var(--gold)}
.pts{position:absolute;left:80px;top:690px;list-style:none;width:470px;display:grid;gap:0;border-top:1px solid var(--line)}
.pts li{display:flex;gap:20px;align-items:baseline;padding:22px 0;border-bottom:1px solid var(--line);font-size:30px;font-weight:600;line-height:1.25}
.pts li span{flex:none;font:400 26px/1 S,serif;color:var(--gold)}
.ph{position:absolute;border-radius:52px;background:#0d0c0b;padding:13px;box-shadow:0 50px 90px -30px rgba(40,30,10,.45),0 0 0 2px #2c2a26}
.ph .s{width:100%;height:100%;border-radius:40px;overflow:hidden;background:#fff} .ph img{width:100%;display:block}
.ph .isl{position:absolute;left:50%;top:26px;transform:translateX(-50%);width:28%;height:28px;border-radius:20px;background:#000}
.cardwrap{position:absolute;left:30px;top:560px;width:700px;height:460px}
''' + CARD_CSS.replace('.card{position:absolute;left:10px;top:110px;', '.card{position:absolute;left:20px;top:90px;').replace('rgba(60,48,20,.14),0 50px 80px -30px rgba(0,0,0,.85)', 'rgba(60,48,20,.16),0 50px 90px -30px rgba(40,30,10,.55)') + '''
.hub{position:absolute;left:540px;top:900px;transform:translate(-50%,-50%);width:210px;height:210px;border-radius:50%;background:var(--ink);color:#f2f0ec;display:grid;place-items:center;align-content:center;gap:6px;
 box-shadow:0 0 0 22px rgba(184,137,42,.14),0 0 0 48px rgba(184,137,42,.07)}
.hub svg{width:72px;height:72px;color:var(--gold)} .hub b{font-size:24px;letter-spacing:.24em}
.nd{position:absolute;display:flex;align-items:center;gap:12px;font-weight:600;font-size:27px;background:var(--tile);border:1px solid var(--line);border-radius:40px;padding:14px 24px 14px 18px;transform:translate(-50%,-50%);box-shadow:0 10px 24px -14px rgba(40,30,10,.35)}
.nd svg{width:32px;height:32px;color:var(--gold)}
.steps{position:absolute;left:80px;right:80px;top:700px;display:grid;border-top:1px solid var(--line)}
.stp{display:grid;grid-template-columns:110px 100px 1fr;align-items:center;gap:26px;padding:34px 0;border-bottom:1px solid var(--line)}
.stp .no{font:400 88px/1 S,serif;color:var(--gold)}
.stp .si{width:100px;height:100px;border-radius:50%;border:1.5px solid var(--ink);display:grid;place-items:center} .stp .si svg{width:46px;height:46px}
.stp b{display:block;font-size:40px;font-weight:700} .stp span{display:block;font-size:28px;color:var(--soft);line-height:1.3;margin-top:6px}
.cta{position:absolute;left:80px;right:80px;top:760px;display:grid;gap:34px}
.wab{display:flex;align-items:center;gap:18px;width:max-content;background:var(--ink);color:#f2f0ec;font-weight:700;font-size:56px;padding:26px 44px;border-radius:80px}
.wab svg{width:58px;height:58px;color:#25d366}
.cl{display:grid;border-top:1px solid var(--line)} .cl div{display:flex;align-items:center;gap:18px;font-size:32px;font-weight:500;padding:22px 0;border-bottom:1px solid var(--line)}
.cl svg{width:36px;height:36px;color:var(--gold)}
.sig{position:absolute;left:80px;bottom:62px;display:flex;align-items:center;gap:16px} .sig svg{width:64px} .sig b{font:400 24px/1 S,serif;letter-spacing:.3em}
.pf,.hl{width:1080px;height:1080px;display:grid;place-items:center;position:relative;margin-bottom:20px;
 background:radial-gradient(75% 75% at 50% 38%,#fbfaf7 0%,#f2f0ec 60%,#e4dfd4 100%)}
.pf .ring{position:absolute;inset:118px;border-radius:50%;border:5px solid var(--gold)}
.pf svg{width:640px;color:var(--ink)}
.hl .ring{position:absolute;inset:150px;border-radius:50%;border:4px solid var(--gold)}
.hl svg{width:340px;height:340px;color:var(--ink);stroke-width:1.3}
'''
HL = [('reviews', 'star'), ('cards', 'tap'), ('menu', 'menu'), ('ordering', 'chef'), ('websites', 'globe'), ('contact', 'wa')]
html = ('<!doctype html><html><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>'
        + ''.join(f'<section class="post" id="p{i+1}">{b}</section>' for i, b in enumerate(P))
        + f'<section class="pf" id="profile"><i class="ring"></i>{LOGO}</section>'
        + ''.join(f'<section class="hl" id="hl-{n}"><i class="ring"></i>{I(IC[k])}</section>' for n, k in HL)
        + '</body></html>')
open('kit.html', 'w').write(html)
print('ok')
