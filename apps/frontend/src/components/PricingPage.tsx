import React from "react";
import { Check } from "lucide-react";

interface PricingPageProps {
  navigate: (view: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate }) => {
  return (
    <div className="bg-[#000000] text-slate-100 min-h-screen">
      <div className="framed-container">
        
        <section className="relative overflow-hidden border-b border-white/10 bg-[#080808]">
          <img
            src="/pro-mesh.png"
            alt="Pricing Header Mesh"
            className="absolute right-0 top-0 bottom-0 w-2/3 object-cover opacity-30 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-transparent pointer-events-none"></div>

          <div className="relative z-10 px-8 md:px-14 pt-28 md:pt-36 pb-16">
            <h1 className="text-4xl md:text-5xl font-normal text-white tracking-tight font-heading">
              Simple pricing
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-sans mt-3 max-w-xl leading-relaxed">
              Transparent, predictable billing for engineering teams scaling notification pipelines.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 divide-y divide-white/10 md:divide-y-0 divide-x divide-white/10 border-b border-white/10 bg-[#080808]">
          <div className="p-8 md:p-10 flex flex-col justify-between space-y-8 bg-[#080808]">
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-slate-300 font-sans">Founder</span>
                <div className="text-5xl font-normal text-white font-heading mt-2 mb-2">$29</div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Perfect for side projects and early prototypes.
                </p>
              </div>

              <button
                onClick={() => navigate("tenant-auth-signup")}
                className="w-full py-3 rounded-full bg-[#181818] border border-white/15 text-white font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Start Building
              </button>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-sans">What's Included</h4>
                <ul className="space-y-3 text-xs text-slate-300 font-sans">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> Up to 50k monthly requests
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> Access to 3 foundational models
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> Basic prompt versioning
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> For teams getting started
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> Standard latency
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> 1 team member
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden bg-[#060606]">
            <img
              src="/pro-mesh.png"
              alt="Pro Mesh Background"
              className="absolute inset-0 w-full h-full object-cover opacity-75 pointer-events-none"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70 pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300 font-sans">Pro</span>
                  <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[11px] font-medium text-slate-200">
                    Popular
                  </span>
                </div>
                <div className="text-5xl font-normal text-white font-heading mb-2">$74</div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  All you need to scale your production app.
                </p>
              </div>

              <button
                onClick={() => navigate("tenant-auth-signup")}
                className="w-full py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors shadow-lg"
              >
                Start Building
              </button>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-sans">What's Included</h4>
                <ul className="space-y-3 text-xs text-slate-200 font-sans">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-white" /> Up to 250k monthly requests
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-white" /> Priority email support
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-white" /> Advanced observability & logs
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-white" /> Priority email support
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-white" /> Global edge distribution
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-white" /> Up to 5 team members
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 flex flex-col justify-between space-y-8 bg-[#080808]">
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-slate-300 font-sans">Team</span>
                <div className="text-5xl font-normal text-white font-heading mt-2 mb-2">$144</div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Advanced control for high-traffic platforms.
                </p>
              </div>

              <button
                onClick={() => navigate("tenant-auth-signup")}
                className="w-full py-3 rounded-full bg-[#181818] border border-white/15 text-white font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Start Building
              </button>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-sans">What's Included</h4>
                <ul className="space-y-3 text-xs text-slate-300 font-sans">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> Up to 1M monthly requests
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> Custom model routing logic
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> Dedicated throughput
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> 24/7 Priority support
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> RBAC & Security auditing
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-slate-100" /> Unlimited team members
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="p-8 md:p-12 border-b border-white/10 bg-[#080808] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-2xl font-normal text-white font-heading">Enterprise</h3>
            <p className="text-xs text-slate-400 font-sans">Dedicated infrastructure, custom SLAs, and VPC deployment support.</p>
          </div>
          <button
            onClick={() => navigate("tenant-auth-signup")}
            className="pill-white px-7 py-3 text-sm font-semibold text-black"
          >
            Contact Sales
          </button>
        </section>

      </div>
    </div>
  );
};
