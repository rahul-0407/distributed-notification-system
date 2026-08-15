import React, { useState } from "react";
import { Zap, Key, Shield, Layers, Terminal, Copy, Check, ArrowRight } from "lucide-react";

interface DocsPageProps {
  navigate: (view: string) => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ navigate }) => {
  const [activeSection, setActiveSection] = useState("quickstart");
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleCurl = `curl -X POST https://api.netify.io/v1/notifications \\
  -H "Authorization: Bearer sk_live_8f91a20b..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient": "usr_99812a",
    "channel": "EMAIL",
    "template": "welcome_onboarding",
    "params": { "name": "Alex" }
  }'`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-[#000000] text-slate-100 min-h-screen">
      <div className="framed-container">

        <section className="relative overflow-hidden border-b border-white/10 bg-[#080808]">
          <img
            src="/pro-mesh.png"
            alt="Docs Header Mesh"
            className="absolute right-0 top-0 bottom-0 w-2/3 object-cover opacity-30 pointer-events-none"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#080808] via-[#080808]/90 to-transparent pointer-events-none"></div>

          <div className="relative z-10 px-8 md:px-14 pt-28 md:pt-36 pb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-slate-300 font-mono mb-4">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              API v1 Documentation
            </div>
            <h1 className="text-4xl md:text-5xl font-normal text-white tracking-tight font-heading">
              Netify Developer Hub
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-sans mt-3 max-w-xl leading-relaxed">
              Integrate ultra-low latency notification dispatching and edge AI model fallbacks in minutes with our REST & Webhook APIs.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10 border-b border-white/10 bg-[#080808]">
          
          <aside className="lg:col-span-3 p-6 md:p-8 bg-[#080808] space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono px-3 mb-3">
                Getting Started
              </h3>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection("quickstart")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                    activeSection === "quickstart"
                      ? "bg-white text-black font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Quickstart Guide
                </button>
                <button
                  onClick={() => setActiveSection("auth")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                    activeSection === "auth"
                      ? "bg-white text-black font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Key className="h-3.5 w-3.5" />
                  API Keys & Security
                </button>
                <button
                  onClick={() => setActiveSection("endusers")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                    activeSection === "endusers"
                      ? "bg-white text-black font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Directory & Recipients
                </button>
                <button
                  onClick={() => setActiveSection("errors")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                    activeSection === "errors"
                      ? "bg-white text-black font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Error Handling Specs
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-semibold text-white font-heading">Need custom integration?</span>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Our enterprise solutions team offers hands-on SDK integration support.
                </p>
                <button
                  onClick={() => navigate("pricing")}
                  className="inline-flex items-center gap-1.5 text-xs text-white font-medium hover:underline"
                >
                  Explore Enterprise <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9 p-8 md:p-12 bg-[#080808] space-y-10">
            {activeSection === "quickstart" && (
              <div className="space-y-8">
                <div className="border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-normal text-white font-heading tracking-tight">
                    Quickstart Guide
                  </h2>
                  <p className="text-xs text-slate-400 font-sans mt-2">
                    Send high-throughput notifications across global edge nodes in under 3 minutes.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xs font-mono font-bold text-white shrink-0">
                      1
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-white font-heading">Create your Tenant Account</h3>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">
                        Register your organization to provision an isolated database context, secret keys, and default routing rules.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xs font-mono font-bold text-white shrink-0">
                      2
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-white font-heading">Generate an API Secret Key</h3>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">
                        In your Dashboard under API Keys, generate a production key starting with <code className="text-emerald-400 font-mono">sk_live_</code>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xs font-mono font-bold text-white shrink-0">
                      3
                    </div>
                    <div className="space-y-3 w-full">
                      <h3 className="text-sm font-medium text-white font-heading">Dispatch First Payload</h3>
                      
                      <div className="relative rounded-lg bg-[#000000] border border-white/10 p-4 font-mono text-xs text-slate-300">
                        <button
                          onClick={() => copyToClipboard(sampleCurl)}
                          className="absolute right-3 top-3 p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <pre className="overflow-x-auto text-emerald-400">{sampleCurl}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "auth" && (
              <div className="space-y-8">
                <div className="border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-normal text-white font-heading tracking-tight">
                    API Keys & Security Specs
                  </h2>
                  <p className="text-xs text-slate-400 font-sans mt-2">
                    Cryptographic key storage and tenant isolation guarantees.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-lg bg-white/5 border border-white/10 space-y-3">
                    <h3 className="text-sm font-semibold text-white font-heading">SHA-256 Key Hashing</h3>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      API secret keys are never saved in plaintext. Only SHA-256 key signatures are verified upon incoming edge requests.
                    </p>
                  </div>

                  <div className="p-6 rounded-lg bg-white/5 border border-white/10 space-y-3">
                    <h3 className="text-sm font-semibold text-white font-heading">Tenant Scope Isolation</h3>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      All endpoints execute within strict tenant boundaries enforced by compound database indexes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "endusers" && (
              <div className="space-y-8">
                <div className="border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-normal text-white font-heading tracking-tight">
                    Directory & Recipient API
                  </h2>
                  <p className="text-xs text-slate-400 font-sans mt-2">
                    Manage target recipients and sync device tokens dynamically.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#000000] border border-white/10 font-mono text-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">POST</span>
                      <span className="text-slate-200">/v1/tenants/:tenantId/end-users</span>
                    </div>
                    <span className="text-slate-500">Create / Sync User</span>
                  </div>

                  <div className="p-4 rounded-lg bg-[#000000] border border-white/10 font-mono text-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">GET</span>
                      <span className="text-slate-200">/v1/tenants/:tenantId/end-users</span>
                    </div>
                    <span className="text-slate-500">List Directory</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "errors" && (
              <div className="space-y-8">
                <div className="border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-normal text-white font-heading tracking-tight">
                    Error Handling Specifications
                  </h2>
                  <p className="text-xs text-slate-400 font-sans mt-2">
                    Standardized JSON error structures returned across all edge regions.
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                    <span className="text-red-400 font-bold">400 Bad Request</span>
                    <span className="text-slate-400">Invalid payload structure or missing channel parameters</span>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                    <span className="text-yellow-400 font-bold">401 Unauthorized</span>
                    <span className="text-slate-400">Invalid or revoked API secret key signature</span>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                    <span className="text-amber-400 font-bold">429 Rate Exceeded</span>
                    <span className="text-slate-400">Tenant request rate limit threshold reached</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        <div className="h-16 diagonal-stripes border-b border-white/10"></div>

        <section className="py-20 px-8 text-center space-y-8 bg-[#080808]">
          <h2 className="text-3xl sm:text-4xl font-normal text-white tracking-tight font-heading max-w-3xl mx-auto">
            Ready to integrate Netify in production?
          </h2>
          <div>
            <button
              onClick={() => navigate("tenant-auth-signup")}
              className="pill-white px-7 py-3 text-xs md:text-sm font-semibold text-black hover:bg-slate-200 transition-colors"
            >
              Start Building for Free
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
