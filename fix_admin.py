from pathlib import Path

p = Path('src/app/pages/AdminPage.tsx')
text = p.read_text(encoding='utf-8')
replacements = [
    ('bg-white border-slate-200 shadow-sm', 'border-[var(--border)] shadow-sm'),
    ('bg-white border-slate-200', 'border-[var(--border)]'),
    ('bg-white border border-slate-200', 'border-[var(--border)]'),
    ('className="bg-white border-slate-300"', 'className="border-[var(--border)]"'),
    ('text-slate-900', 'text-[var(--foreground)]'),
]
for old, new in replacements:
    text = text.replace(old, new)
p.write_text(text, encoding='utf-8')
