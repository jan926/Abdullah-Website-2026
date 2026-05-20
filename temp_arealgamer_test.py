import urllib.request, urllib.parse, gzip, re

q = 'gta'
url = 'https://www.arealgamer.org/?s=' + urllib.parse.quote(q)
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, deflate'})
r = urllib.request.urlopen(req, timeout=20)
data = r.read()
if r.headers.get('Content-Encoding', '') == 'gzip':
    data = gzip.decompress(data)
html = data.decode('utf-8', errors='replace')
regex = re.compile(r'<article[^>]*class=["\']?[^"\'>]*apg-card[^"\'>]*["\']?[^>]*>[\s\S]*?<a[^>]*class=["\']?apg-thumb["\']?[^>]*>[\s\S]*?</a>[\s\S]*?<a[^>]*href=["\']([^"\']+)["\'][^>]*>([^<]+)</a>', re.I)
results = regex.findall(html)
print('RESULTS', len(results))
for item in results[:10]:
    print(item)
