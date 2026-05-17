from pathlib import Path

p = Path("src/app/pages/AdminPage.tsx")
text = p.read_text(encoding="utf-8")

start = text.find('                  Visibility Settings')
if start < 0:
    print("not found")
    exit(1)
# back to card start
card_start = text.rfind("<Card", 0, start)
card_end = text.find("</Card>", start) + len("</Card>")
new_text = text[:card_start] + text[card_end:]
# renumber System Requirements 5 -> 4
new_text = new_text.replace(
    '<span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">5</span>\n                  System Requirements',
    '<span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">4</span>\n                  System Requirements',
    1,
)
p.write_text(new_text, encoding="utf-8")
print("removed visibility card")
