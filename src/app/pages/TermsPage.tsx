import React from "react";

export default function TermsPage() {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="animate-fade-in rounded-[2rem] border border-slate-700/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-[0_28px_80px_rgba(7,89,122,0.22)]">
        <h1 className="text-3xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-slate-300 leading-relaxed mb-6">
          By using AQ Gaming Hub, you agree to follow our rules and the law. Please read these terms before using our services.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-cyan-500/10 bg-white/5 p-6 shadow-lg shadow-cyan-500/10">
            <h2 className="text-xl font-semibold text-cyan-300 mb-3">Usage Rules</h2>
            <p className="text-slate-200 leading-relaxed">Use the site for lawful purposes only. Do not upload or distribute content that violates copyrights or other rights.</p>
          </div>
          <div className="rounded-3xl border border-violet-500/10 bg-white/5 p-6 shadow-lg shadow-violet-500/10">
            <h2 className="text-xl font-semibold text-violet-300 mb-3">Disclaimer</h2>
            <p className="text-slate-200 leading-relaxed">AQ Gaming Hub is not responsible for third-party downloads. Always verify files and use antivirus protection.</p>
          </div>
        </div>
        <div className="mt-8 rounded-3xl border border-slate-700/50 bg-white/5 p-6 shadow-inner shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white mb-3">Updates</h2>
          <p className="text-slate-300 leading-relaxed">We may update these terms at any time. Continued use means you accept the latest version.</p>
        </div>
      </div>
    </section>
  );
}
