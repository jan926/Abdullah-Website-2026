from pathlib import Path

p = Path("src/app/pages/AdminPage.tsx")
lines = p.read_text(encoding="utf-8").splitlines(keepends=True)

start = None
end = None
for i, line in enumerate(lines):
    if start is None and '                <div className="space-y-4">' in line and i > 700:
        # download details inner - check previous lines
        if i >= 5 and "Download Details" in "".join(lines[i-5:i]):
            start = i
    if start is not None and end is None and i > start + 5:
        if '              </Card>' in line and "Media & Screenshots" in "".join(lines[i:i+8]):
            end = i
            break

print("start line", start + 1 if start else None, "end line", end + 1 if end else None)

replacement = '''                <DownloadPartsEditor
                  useMultiPart={formData.useMultiPart}
                  downloadLink={formData.downloadLink}
                  downloadParts={formData.downloadParts}
                  filePassword={formData.filePassword}
                  onChange={(patch) => setFormData({ ...formData, ...patch })}
                />
'''

if start is not None and end is not None:
    new_lines = lines[:start] + [replacement] + lines[end:]
    p.write_text("".join(new_lines), encoding="utf-8")
    print("patched ok")
else:
    print("failed to find range")
