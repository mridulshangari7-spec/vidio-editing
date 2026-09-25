"""Builds docs/index.html (a complete, hostable page) from site/index.html."""
import os
root=os.path.dirname(os.path.abspath(__file__))
s=open(os.path.join(root,'site/index.html')).read()
i=s.index('</style>')+len('</style>')
head,body=s[:i],s[i:]
out='''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f2f0ec">
<meta property="og:title" content="Infinity – NFC review cards">
<meta property="og:description" content="Tap once. Get the review. Infinity NFC cards send customers straight to your Google review page. Andheri East, Mumbai.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://growwithinfinity.github.io/">
<meta property="og:image" content="https://growwithinfinity.github.io/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://growwithinfinity.github.io/">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"Infinity","description":"NFC review cards that open your Google review page with one tap.",
 "url":"https://growwithinfinity.github.io/","telephone":"+91-79864-04564","email":"searchinfinity@gmail.com",
 "founder":{"@type":"Person","name":"Mridul Shingari"},
 "address":{"@type":"PostalAddress","streetAddress":"Bindra Sateri Legacy, near Aralia Business Hotel, MIDC Central Road","addressLocality":"Andheri East, Mumbai","addressRegion":"Maharashtra","postalCode":"400093","addressCountry":"IN"},
 "image":"https://growwithinfinity.github.io/og.jpg"}
</script>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23f2f0ec'/%3E%3Cpath d='M20 22c-6 0-10 4.5-10 10s4 10 10 10c8 0 16-20 24-20 6 0 10 4.5 10 10s-4 10-10 10c-8 0-16-20-24-20z' fill='none' stroke='%230d0c0b' stroke-width='5'/%3E%3C/svg%3E">
'''+head+'''
</head>
<body>
'''+body.strip()+'''
</body>
</html>
'''
os.makedirs(os.path.join(root,'docs'),exist_ok=True)
open(os.path.join(root,'docs/index.html'),'w').write(out)
open(os.path.join(root,'docs/.nojekyll'),'w').write('')
