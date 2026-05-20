import urllib.request, gzip, re

url = 'https://www.arealgamer.org/gta-5-d20/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, deflate'})
with urllib.request.urlopen(req, timeout=20) as r:
    data = r.read()
    if r.headers.get('Content-Encoding', '') == 'gzip':
        data = gzip.decompress(data)
html = data.decode('utf-8', errors='replace')
for term in ['Developer', 'developer', 'Developed', 'publisher', 'Publisher', 'Company']:
    idx = html.lower().find(term.lower())
    print(term, idx)
    if idx != -1:
        snippet = html[max(0, idx-120):idx+240]
        print(snippet)
        print('---')
print('--- meta description ---')
md = re.search(r'<meta name="description" content="([^"]+)"', html, re.I)
print(md.group(1) if md else 'none')
print('--- og description ---')
og = re.search(r'<meta property="og:description" content="([^"]+)"', html, re.I)
print(og.group(1) if og else 'none')
PY