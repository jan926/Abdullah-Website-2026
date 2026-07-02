import React from "react";

export function InstallGuide() {
  return (
    <aside className="rounded-2xl border border-[rgba(226,232,240,0.08)] bg-[var(--card)] p-4 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
      <h2 className="text-lg md:text-xl font-semibold text-[var(--foreground)] mb-3">How to Install</h2>
      <ol className="list-decimal list-inside space-y-3 text-sm md:text-base text-[var(--foreground)]">
        <li>
          <strong>Download the game:</strong> Click the <em>Download</em> button on this page to start downloading the game archive or installer.
        </li>
        <li>
          <strong>Extract the files:</strong> After download completes, extract the ZIP/RAR archive using your preferred extractor (WinRAR, 7-Zip, or Windows built-in extractor).
        </li>
        <li>
          <strong>Run the installer:</strong> Open the extracted folder and run the setup or installer file (usually named <code>setup.exe</code> or similar). Follow the on-screen instructions to install.
        </li>
        <li>
          <strong>Launch the game:</strong> Once installation finishes, open the game's executable (for example, <code>GameName.exe</code>) from the install directory or the desktop shortcut.
        </li>
      </ol>
      <p className="mt-4 text-xs text-[var(--muted-foreground)]">If the download is split into multiple parts, use the provided parts or the built-in download manager on this page. If an extraction password is provided, it is shown above the download button.</p>
    </aside>
  );
}
