import React from "react";

export default function PrivacyPage() {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="animate-fade-in rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-[0_28px_80px_rgba(7,89,122,0.22)]">
        <h1 className="text-3xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-300 leading-relaxed mb-6">
          AQ Gaming Hub values your privacy. This policy explains what information we collect, how we use it, and how we keep it secure.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-cyan-500/10 bg-white/5 p-6 shadow-lg shadow-cyan-500/10">
            <h2 className="text-xl font-semibold text-cyan-300 mb-3">Information We Collect</h2>
            <p className="text-slate-300 leading-relaxed">We collect non-personal usage data and technical details to improve performance and deliver a better experience.</p>
          </div>
          <div className="rounded-3xl border border-blue-500/10 bg-white/5 p-6 shadow-lg shadow-blue-500/10">
            <h2 className="text-xl font-semibold text-blue-300 mb-3">Cookies & Tracking</h2>
            <p className="text-slate-300 leading-relaxed">We use cookies for essential site functionality and analytics. Personal data is never sold or shared without consent.</p>
          </div>
        </div>
        <div className="mt-8 rounded-3xl border border-slate-700/50 bg-white/5 p-6 shadow-inner shadow-slate-950/20">
          <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
          <p className="text-slate-300 leading-relaxed">If you have questions about this policy, please visit the Contact page or email us directly at <strong className="text-cyan-300">malikwork72@gmail.com</strong>.</p>
        </div>
      </div>
    </section>
  );
}
