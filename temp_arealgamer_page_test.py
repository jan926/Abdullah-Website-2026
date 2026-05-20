import urllib.request, gzip, re

url = 'https://www.arealgamer.org/gta-5-d20/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, deflate'})
with urllib.request.urlopen(req, timeout=20) as r:
    data = r.read()
    if r.headers.get('Content-Encoding', '') == 'gzip':
        data = gzip.decompress(data)
html = data.decode('utf-8', errors='replace')
match = re.search(r'Minimum System Requirements:[\s\S]*?<p[^>]*>([\s\S]*?)</p>', html, re.I)
print('MATCH', bool(match))
if match:
    block = match.group(1)
    print(block)
    text = re.sub(r'<br\s*/?>', '\n', block, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    print(lines)
