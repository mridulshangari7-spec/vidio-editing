"""Wraps each page in web/src/ with the shared <head> and writes it to web/.
The page body (objects, panels, PAGE config) lives in src/<name>.html; the first two lines
are <!--title: ...--> and <!--desc: ...-->."""
import os, re, glob
ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://growwithinfinity.github.io/"
ICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23f2f0ec'/%3E"
        "%3Cpath d='M20 22c-6 0-10 4.5-10 10s4 10 10 10c8 0 16-20 24-20 6 0 10 4.5 10 10s-4 10-10 10c-8 0-16-20-24-20z' fill='none' stroke='%230d0c0b' stroke-width='5'/%3E%3C/svg%3E")
LD = """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"Infinity","description":"NFC review cards, Instagram and YouTube NFC tags, animated websites, digital menus, UPI QR codes, AI receipts and business automation.",
 "url":"https://growwithinfinity.github.io/","email":"searchinfinity@gmail.com",
 "telephone":["+91-79864-04564","+91-98771-68353","+91-98782-25225","+91-93243-87537"],
 "address":{"@type":"PostalAddress","streetAddress":"Bindra Sateri Legacy, near Aralia Business Hotel, MIDC Central Road","addressLocality":"Andheri East, Mumbai","addressRegion":"Maharashtra","postalCode":"400093","addressCountry":"IN"},
 "image":"https://growwithinfinity.github.io/og.jpg"}
</script>"""

def esc(s): return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")

for src in sorted(glob.glob(os.path.join(ROOT, "src", "*.html"))):
    name = os.path.basename(src)
    raw = open(src, encoding="utf-8").read()
    title = re.search(r"<!--title:\s*(.*?)-->", raw).group(1).strip()
    desc = re.search(r"<!--desc:\s*(.*?)-->", raw).group(1).strip()
    body = re.sub(r"<!--(title|desc):.*?-->\n?", "", raw).strip()
    url = SITE + ("" if name == "index.html" else name)
    head = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#f2f0ec">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{url}">
<link rel="icon" href="{ICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&family=Lora:wght@400&family=Poppins:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
{LD if name == "index.html" else ""}
</head>
<body>
"""
    out = head + body + '\n<script src="assets/engine.js"></script>\n</body>\n</html>\n'
    open(os.path.join(ROOT, name), "w", encoding="utf-8").write(out)
    print("built", name)
