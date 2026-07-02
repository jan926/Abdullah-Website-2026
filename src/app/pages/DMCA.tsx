import React from "react";

export default function DmcaPage() {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="animate-fade-in rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-[0_28px_80px_rgba(13,110,253,0.22)]">
        <h1 className="text-3xl font-bold text-white mb-4">DMCA & Copyright</h1>
        <p className="text-slate-300 leading-relaxed mb-6">
          If you believe that content on AQ Gaming Hub infringes your copyright, please send a DMCA takedown request with the information below.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-cyan-500/10 bg-white/5 p-6 shadow-lg shadow-cyan-500/10">
            <h2 className="text-xl font-semibold text-cyan-300 mb-3">Required Information</h2>
            <ol className="list-decimal list-inside space-y-3 text-slate-200">
              <li>Your full contact details (name, address, phone, email).</li>
              <li>Identification of the copyrighted work.</li>
              <li>Exact URL(s) of the infringing material.</li>
            </ol>
          </div>
          <div className="rounded-3xl border border-indigo-500/10 bg-white/5 p-6 shadow-lg shadow-indigo-500/10">
            <h2 className="text-xl font-semibold text-indigo-300 mb-3">Additional Details</h2>
            <ol className="list-decimal list-inside space-y-3 text-slate-200">
              <li>A statement that the use is unauthorized.</li>
              <li>Electronic or physical signature.</li>
              <li>Send notices to <strong className="text-cyan-300">malikwork72@gmail.com</strong>.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
