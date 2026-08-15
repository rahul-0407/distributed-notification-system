import React from "react";
import { Check, Shield, Eye, Database, Key, Network, Cpu, Share2, Zap, Layers, Sliders, RefreshCw, BarChart2 } from "lucide-react";

interface MetricsPageProps {
  navigate?: (view: string) => void;
}

export const MetricsPage: React.FC<MetricsPageProps> = () => {
  return (
    <div className="bg-[#000000] text-slate-100 min-h-screen">
      <div className="framed-container">
        
        <section className="relative overflow-hidden border-b border-white/10 bg-[#080808]">
          <img
            src="/pro-mesh.png"
            alt="Metrics Header Mesh"
            className="absolute right-0 top-0 bottom-0 w-2/3 object-cover opacity-30 pointer-events-none"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#080808] via-[#080808]/90 to-transparent pointer-events-none"></div>

          <div className="relative z-10 px-8 md:px-14 pt-28 md:pt-36 pb-16">
            <h1 className="text-4xl md:text-5xl font-normal text-white tracking-tight font-heading">
              How we compare
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-sans mt-3 max-w-xl leading-relaxed">
              Benchmark Netify's edge notification infrastructure against legacy queue setups and generic API gateways.
            </p>
          </div>
        </section>

        <section className="p-8 md:p-14 border-b border-white/10 overflow-x-auto bg-[#080808] relative">
          <div className="relative min-w-175">
            
            <div className="absolute top-0 bottom-0 left-[40%] w-[20%] overflow-hidden pointer-events-none z-10">
              <div className="w-full h-full bg-linear-to-r from-transparent via-white/8 to-transparent animate-shine-sweep"></div>
            </div>

            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col className="w-[40%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-6 px-6 text-sm font-semibold text-slate-300 font-sans align-bottom">
                    Features breakdown
                  </th>

                  <th className="py-6 px-6 text-center align-bottom border-x border-white/10 relative">
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      <span className="text-xs font-semibold text-white font-sans tracking-wide">Netify</span>
                    </div>
                  </th>

                  <th className="py-6 px-6 text-center align-bottom border-r border-white/10">
                    <span className="text-xs font-medium text-slate-400 font-sans">Standard Gateways</span>
                  </th>

                  <th className="py-6 px-6 text-center align-bottom">
                    <span className="text-xs font-medium text-slate-400 font-sans">Legacy Queues</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10 text-xs font-sans">
                {[
                  { name: "Automatic Fallbacks", icon: Zap, netify: true, std: true, legacy: true },
                  { name: "Edge Latency Optimization", icon: Network, netify: true, std: true, legacy: false },
                  { name: "Prompt Versioning", icon: Sliders, netify: true, std: "partial", legacy: true },
                  { name: "Streaming support", icon: RefreshCw, netify: true, std: false, legacy: false },
                  { name: "Usage & Cost Guardrails", icon: BarChart2, netify: true, std: false, legacy: "partial" },
                  { name: "Smart Caching layer", icon: Database, netify: true, std: true, legacy: false },
                  { name: "PII Anonymization", icon: Shield, netify: true, std: false, legacy: false },
                  { name: "Advanced Observability", icon: Eye, netify: true, std: "partial", legacy: true },
                  { name: "Semantic Cache & Search", icon: Layers, netify: true, std: false, legacy: true },
                  { name: "RBAC & API Key Management", icon: Key, netify: true, std: true, legacy: false },
                ].map((row, idx) => {
                  const IconComp = row.icon;
                  return (
                    <tr key={idx} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 px-6 text-slate-200 font-normal flex items-center gap-3">
                        <IconComp className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{row.name}</span>
                      </td>

                      <td className="py-4 px-6 text-center border-x border-white/10">
                        {row.netify ? (
                          <Check className="h-4 w-4 text-white mx-auto font-bold" />
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center border-r border-white/10">
                        {row.std === true ? (
                          <Check className="h-4 w-4 text-slate-400 mx-auto" />
                        ) : row.std === "partial" ? (
                          <span className="text-slate-400 font-mono text-[11px]">• • •</span>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        {row.legacy === true ? (
                          <Check className="h-4 w-4 text-slate-400 mx-auto" />
                        ) : row.legacy === "partial" ? (
                          <span className="text-slate-400 font-mono text-[11px]">• • •</span>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="h-16 diagonal-stripes border-b border-white/10"></div>

        <section className="border-b border-white/10">
          <div className="px-8 md:px-14 py-16 border-b border-white/10 bg-[#080808]">
            <h2 className="text-4xl md:text-5xl font-normal text-white tracking-tight font-heading">
              The scale modern intelligence requires
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-[#080808]">
            <div className="p-8 md:p-12 space-y-4 hover:bg-white/2 transition-colors">
              <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white mb-6">
                <Network className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-normal text-white font-heading">Global Edge Mesh</h3>
              <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                Sub-50ms dispatch latency across 250+ global POP edge locations with automated payload routing.
              </p>
            </div>

            <div className="p-8 md:p-12 space-y-4 hover:bg-white/2 transition-colors">
              <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white mb-6">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-normal text-white font-heading">AI Fallback Engine</h3>
              <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                Smart provider failovers dynamically select backup channels when primary vendor APIs degrade.
              </p>
            </div>

            <div className="p-8 md:p-12 space-y-4 hover:bg-white/2 transition-colors">
              <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white mb-6">
                <Share2 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-normal text-white font-heading">Zero-Data Retention</h3>
              <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                End-to-end payload encryption ensures notification content is never stored unencrypted on disk.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
