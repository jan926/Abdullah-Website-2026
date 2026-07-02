import React from "react";

export default function ContactPage() {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="animate-fade-in rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-[0_28px_80px_rgba(7,89,122,0.22)]">
        <h1 className="text-3xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-slate-300 leading-relaxed mb-6">
          Reach out to AQ Gaming Hub for support, feedback, or licensing questions. We respond quickly to all legitimate inquiries.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-700/60 bg-white/5 p-6 shadow-lg shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-cyan-300 mb-3">Email</h2>
            <p className="text-slate-200">malikwork72@gmail.com</p>
          </div>
          <div className="rounded-3xl border border-blue-500/10 bg-white/5 p-6 shadow-lg shadow-blue-500/10">
            <h2 className="text-xl font-semibold text-blue-300 mb-3">Social Profiles</h2>
            <ul className="space-y-3 text-slate-200">
              <li>
                <a href="https://www.facebook.com/profile.php?id=61582089132682" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-white transition">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/malik-abdullah-jan-zia-a596963a2/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-white transition">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/aq_gaming_hub_official/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-white transition">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
