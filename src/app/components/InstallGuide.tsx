import React from "react";

export function InstallGuide() {
  return (
    <aside className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-1 shadow-[0_22px_80px_rgba(7,89,122,0.25)] transition-transform duration-700 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(13,148,255,0.22)]">
      <div className="rounded-3xl bg-[var(--card)] p-5 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-4 tracking-[0.02em]">How to Install</h2>
        <ol className="space-y-4 text-sm md:text-base text-slate-100">
          <li className="rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-4 shadow-sm shadow-cyan-500/5 animate-fade-in">
            <strong className="text-cyan-300">1. Download the game:</strong> Click the <em>Download</em> button to save the game archive or installer to your device.
          </li>
          <li className="rounded-2xl border border-violet-500/10 bg-violet-500/5 p-4 shadow-sm shadow-violet-500/5 animate-fade-in delay-100">
            <strong className="text-violet-300">2. Extract the files:</strong> Unzip the downloaded archive using WinRAR, 7-Zip, or the Windows extractor.
          </li>
          <li className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4 shadow-sm shadow-rose-500/5 animate-fade-in delay-200">
            <strong className="text-rose-300">3. Run the installer:</strong> Open the extracted folder and launch the setup file (usually <code>setup.exe</code>). Follow the install prompts.
          </li>
          <li className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 shadow-sm shadow-amber-500/5 animate-fade-in delay-300">
            <strong className="text-amber-300">4. Launch the game:</strong> Open the game executable from the install folder or desktop shortcut to start playing.
          </li>
        </ol>
        <p className="mt-4 text-xs text-slate-400">If the download includes multiple parts, use the provided links or the download manager on this page. If a password is required, it will be shown above the download button.</p>
      </div>
    </aside>
  );
}
