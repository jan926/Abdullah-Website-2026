from pathlib import Path

p = Path("src/app/pages/AdminPage.tsx")
text = p.read_text(encoding="utf-8")

new_block = r'''                <motion className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={!formData.useMultiPart ? "default" : "outline"}
                      className={!formData.useMultiPart ? "bg-sky-500 text-white hover:bg-sky-600" : ""}
                      onClick={() => setFormData({ ...formData, useMultiPart: false })}
                    >
                      Single Download Link
                    </Button>
                    <Button
                      type="button"
                      variant={formData.useMultiPart ? "default" : "outline"}
                      className={formData.useMultiPart ? "bg-sky-500 text-white hover:bg-sky-600" : ""}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          useMultiPart: true,
                          downloadParts:
                            formData.downloadParts.length > 0
                              ? formData.downloadParts
                              : [{ id: "part-1", name: "Part 1", link: "", size: "" }],
                        })
                      }
                    >
                      Multi-Part Download
                    </Button>
                  </div>
                  {!formData.useMultiPart ? (
                    <div className="space-y-2">
                      <Label className="text-[var(--foreground)]">Download Link</Label>
                      <Input
                        type="url"
                        value={formData.downloadLink}
                        onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
                        required
                        className="border-[var(--border)]"
                        placeholder="magnet:?xt=... or https://..."
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-slate-50/80 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold text-[var(--foreground)]">Parts table</span> — add each file below
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-sky-500 text-white hover:bg-sky-600"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              downloadParts: [
                                ...formData.downloadParts,
                                {
                                  id: `part-${Date.now()}`,
                                  name: `Part ${formData.downloadParts.length + 1}`,
                                  link: "",
                                  size: "",
                                },
                              ],
                            })
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Part
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Part Name</TableHead>
                            <TableHead className="w-[110px]">Size</TableHead>
                            <TableHead>Download Link</TableHead>
                            <TableHead className="w-[70px] text-right">Del</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.downloadParts.map((part, i) => (
                            <TableRow key={part.id}>
                              <TableCell>
                                <Input
                                  value={part.name}
                                  onChange={(e) => {
                                    const downloadParts = [...formData.downloadParts];
                                    downloadParts[i] = { ...part, name: e.target.value };
                                    setFormData({ ...formData, downloadParts });
                                  }}
                                  placeholder="Part 1"
                                  className="border-[var(--border)]"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={part.size || ""}
                                  onChange={(e) => {
                                    const downloadParts = [...formData.downloadParts];
                                    downloadParts[i] = { ...part, size: e.target.value };
                                    setFormData({ ...formData, downloadParts });
                                  }}
                                  placeholder="5 GB"
                                  className="border-[var(--border)]"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="url"
                                  value={part.link}
                                  onChange={(e) => {
                                    const downloadParts = [...formData.downloadParts];
                                    downloadParts[i] = { ...part, link: e.target.value };
                                    setFormData({ ...formData, downloadParts });
                                  }}
                                  placeholder="https://..."
                                  className="border-[var(--border)]"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={formData.downloadParts.length <= 1}
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      downloadParts: formData.downloadParts.filter((_, idx) => idx !== i),
                                    })
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">File Password (optional)</Label>
                    <Input
                      value={formData.filePassword}
                      onChange={(e) => setFormData({ ...formData, filePassword: e.target.value })}
                      className="border-[var(--border)]"
                      placeholder="e.g. www.example.com"
                    />
                  </div>
                </div>'''

new_block = new_block.replace("<motion", "<div").replace("</motion>", "</motion>").replace('</motion>', '</motion>')
# fix - use div only
new_block = new_block.replace('className="space-y-4">', 'className="space-y-4">', 1)

# simpler - write file with div
new_block = new_block.replace("<motion className", "<div className").replace("</motion>", "")

import re
pattern = r'                <div className="space-y-4">\s*<div className="flex items-center justify-between rounded-lg border border-\[var\(--border\)\] p-4">.*?</motion>\s*</Card>\s*\n\s*<Card className="p-6 border-\[var\(--border\)\] shadow-sm">\s*\n\s*<h3 className="text-lg font-semibold text-\[var\(--foreground\)\] mb-6 flex items-center gap-2">\s*\n\s*<span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">3</span>'

# manual slice
start_marker = '                  Download Details\n                </h3>\n                <motion className="space-y-4">'
start_marker = '                  Download Details\n                </h3>\n                <div className="space-y-4">'
start = text.find(start_marker)
if start < 0:
    start_marker2 = '                  Download Details\n                </h3>\n                <div className="space-y-4">'
    start = text.find(start_marker2)
print('start', start)
start_content = start + len(start_marker)
end_marker = '\n              </Card>\n\n              <Card className="p-6 border-[var(--border)] shadow-sm">\n                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">\n                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">3</span>'
end = text.find(end_marker, start_content)
print('end', end)

fixed_new = '''                <div className="space-y-4">
                  <motion className="flex flex-wrap gap-2">PLACEHOLDER'''

# read new_block from file
new_block_path = Path('scripts/download_block.txt')
print('writing patch manually')
