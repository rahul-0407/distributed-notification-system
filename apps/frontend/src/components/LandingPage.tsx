import React, { useState, useEffect } from "react";
import { 
  Zap, Shield, Key, Send, Terminal, Activity, Globe, Plus, Minus, Layers, Cpu, Box, Radio, CircleDot, Check, Network, Share2
} from "lucide-react";

interface LandingPageProps {
  navigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [simChannel, setSimChannel] = useState<"EMAIL" | "SMS" | "PUSH" | "WEBHOOK">("EMAIL");
  const [simRecipient, setSimRecipient] = useState("usr_99812a");
  const [simStatus, setSimStatus] = useState<"idle" | "sending" | "success">("idle");
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const [logoSet, setLogoSet] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoSet((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateSend = () => {
    setSimStatus("sending");
    setSimLogs([
      "18:01:01.002 [AUTH] Verifying API Key signature (SHA-256)...",
      "18:01:01.045 [TENANT] Scoped request to tenant context: tnt_acme_corp",
    ]);

    setTimeout(() => {
      setSimLogs((prev) => [
        ...prev,
        `18:01:01.120 [ROUTER] Selected provider for ${simChannel}: provider_primary`,
        "18:01:01.198 [ENQUEUE] Enqueued message to Redis worker queue",
      ]);
    }, 400);

    setTimeout(() => {
      setSimLogs((prev) => [
        ...prev,
        `18:01:01.285 [DELIVERED] Notification delivered to recipient (${simRecipient}) in 283ms`,
      ]);
      setSimStatus("success");
    }, 900);
  };

  const logoSets = [
    [
      { name: "Colfare", icon: Zap },
      { name: "PolarX", icon: Shield },
      { name: "PayCare", icon: Key },
      { name: "EarnAK", icon: Activity },
      { name: "Analyx", icon: Globe },
    ],
    [
      { name: "NEORICK", icon: Layers },
      { name: "GinterX", icon: Cpu },
      { name: "Matic", icon: Box },
      { name: "PrimusK", icon: Radio },
      { name: "Plastic", icon: CircleDot },
    ]
  ];

  const testimonials = [
    {
      name: "Lina Mills",
      role: "/ CTO at CloudScale",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
      quote: "Finally, an SDK that feels like it was built by developers, for developers. The integration was seamless, and the abstraction layer is so clean that we switched from SendGrid to Resend in literally one line of code. No more boilerplate, no more mess.",
      hasMeshGlow: true
    },
    {
      name: "Michael Klark",
      role: "/ Lead Engineer at Orbit",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
      quote: "It cut our deployment time from weeks to hours by removing the friction of manual infrastructure. The platform is super focused—it's everything we needed to scale our notification operations.",
      hasMeshGlow: false
    },
    {
      name: "Patricia Ashford",
      role: "/ VP at Aether Inc.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
      quote: "The real-time insights are a game changer. Being able to monitor delivery rates and provider performance across different models in a single dashboard gave us the confidence to scale our production environment much faster.",
      hasMeshGlow: false
    },
    {
      name: "Alexander Thorne",
      role: "/ CEO at Synthetix",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
      quote: "This is the missing layer of the modern notification stack. I wouldn't build a production-grade notification app without it.",
      hasMeshGlow: false
    },
    {
      name: "Melinda Taylor",
      role: "/ Engineer Lead at Fink",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
      quote: "The most reliable way to orchestrate notifications. The built-in retry logic and global edge distribution make it an essential part of our tech stack.",
      hasMeshGlow: false
    },
    {
      name: "Jordan Smith",
      role: "/ Lead Developer at Maruki",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
      quote: "We were spending way too much time building custom logic to handle provider fallbacks and rate limits. This platform took all that complexity and tucked it behind a beautiful interface that just works. It has transformed our deployment pipeline.",
      hasMeshGlow: false
    }
  ];

  const faqs = [
    {
      q: "Which LLM providers do you support?",
      a: "Netify supports all major notification & AI gateway infrastructure providers out-of-the-box including SendGrid, Resend, AWS SES, Twilio, FCM, OpenAI, Anthropic, and custom Webhooks."
    },
    {
      q: "How does the model fallback system work?",
      a: "If your primary notification provider encounters rate limits, timeouts, or downtime, our edge orchestration layer automatically reroutes the payload to your configured secondary provider in milliseconds."
    },
    {
      q: "Can I switch models without redeploying code?",
      a: "Yes. Because your codebase integrates with the unified Netify SDK once, provider switching and percentage routing are managed dynamically from your workspace dashboard without code changes."
    },
    {
      q: "Is my data used to train your models?",
      a: "No. All tenant data is cryptographically isolated using Prisma compound constraints matching tenantId. Payload content is encrypted in-transit with TLS 1.3 and at-rest with AES-256."
    },
    {
      q: "Will using an SDK add significant latency?",
      a: "Our SDK connects to edge-native API gateways maintaining under 15ms global network overhead. Worker pools process dispatch queues asynchronously."
    },
    {
      q: "How do you handle usage-based billing and limits?",
      a: "Usage is calculated per successful notification dispatch. Your workspace dashboard provides real-time token and delivery volume meters with automated cost guardrails."
    },
    {
      q: "Do you support Image or audio models?",
      a: "Yes. Netify supports template variables, rich HTML formatting, image attachments, audio payloads, action buttons, and custom metadata."
    },
    {
      q: "Can I self-host the orchestration layer?",
      a: "Yes. Netify Enterprise provides Docker containers and Helm charts allowing you to deploy the full notification pipeline inside your AWS, GCP, or Azure VPC."
    }
  ];

  const currentLogos = logoSets[logoSet];

  return (
    <div className="bg-[#000000] text-slate-100 min-h-screen">
      <div className="framed-container">
        
        <section className="relative overflow-hidden min-h-145 bg-[#080808] border-b border-white/10">
          <img
            src="/footer-mesh.png"
            alt="Hero Footer Mesh 1"
            className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
          />

          <img
            src="/hero-mesh-2.png"
            alt="Hero Mesh 2"
            className="absolute inset-0 w-full h-full object-cover animate-mesh-crossfade pointer-events-none"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-145">
            <div className="lg:col-span-7 pt-28 md:pt-36 p-8 md:p-12 lg:p-16 flex flex-col justify-center space-y-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.06] font-heading">
                The notification layer <br />
                <span className="text-slate-200">for developers</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
                The universal SDK to orchestrate, optimize, and scale notifications. One integration, infinite channels.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => navigate("tenant-auth-signup")}
                  className="pill-white px-7 py-3 text-sm font-semibold text-black"
                >
                  Start for Free
                </button>

                <button
                  onClick={() => navigate("pricing")}
                  className="pill-dark px-7 py-3 text-sm font-medium"
                >
                  Check Plans
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-end p-8 md:p-12 overflow-hidden pointer-events-none select-none">
              <div className="font-mono text-[11px] leading-[1.3] text-emerald-400/35 tracking-widest text-right opacity-80 space-y-1 w-full max-w-sm">
                <p>UXFS2SXX3MEGERHE</p>
                <p>182NTXNJS7F8EPNTD9</p>
                <p>0+RR6ERUYZLSUWLKS9ZIHAR</p>
                <p>S9HBZ3ITNH0K7TF4J9PJPNY</p>
                <p>FBKF10S7S$WTGA02CBUKMA2GR</p>
                <p>Y2CIWJHOX+C+KI2C1EJCGF6+C</p>
                <p>F8CN=YK+ZJBZ302120DLB5DKTB</p>
                <p>68A0#67B36B4Q7TCK8946QTKB</p>
                <p>IOP21V0M#Q!MRV=H=K7=T7MD</p>
                <p>IWIQD1=IN8=N17WZ938$8SJ5R</p>
                <p>S9W3HS6F9KDH3M8XQHUM9IC</p>
                <p>TVKI0P24QMDW#RXYSJFFZ8BTP</p>
                <p>NB0JW39=QT50==S#JU</p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-16 diagonal-stripes border-b border-white/10"></div>

        <section className="grid grid-cols-2 md:grid-cols-5 divide-x divide-white/10 border-b border-white/10 bg-[#070707]">
          {currentLogos.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.name}
                className="flex items-center justify-center gap-2 py-8 px-4 font-bold tracking-widest text-sm text-slate-300 transition-all duration-700 ease-in-out"
              >
                <IconComp className="h-4 w-4" />
                <span>{item.name}</span>
              </div>
            );
          })}
        </section>

        <div className="h-16 diagonal-stripes border-b border-white/10"></div>

        <section className="border-b border-white/10">
          <div className="px-8 md:px-14 py-16 border-b border-white/10">
            <h2 className="text-4xl md:text-5xl font-normal text-white tracking-tight font-heading">
              Engineered for production-grade notifications
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/10">
            <div className="lg:col-span-6 p-8 md:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 space-y-6">
              <h3 className="text-3xl md:text-4xl font-normal text-white tracking-tight font-heading">
                One SDK for every foundation model
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Stop writing custom boilerplate for every new notification provider. Integrate our unified SDK once and switch between SendGrid, Resend, Twilio, or FCM with a single line of code.
              </p>
            </div>

            <div className="lg:col-span-6 p-8 md:p-12 flex items-center justify-center relative overflow-hidden min-h-95 bg-[#040404]">
              <div className="w-full max-w-md h-75 rounded-xl overflow-hidden relative border border-white/10 bg-[#020202] shadow-2xl flex items-center justify-center">
                <img
                  src="/hero-mesh.png"
                  alt="Feature Mesh Graphic"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
                />

                <img
                  src="/hero-mesh-2.png"
                  alt="Feature Mesh Graphic 2"
                  className="absolute inset-0 w-full h-full object-cover animate-mesh-crossfade pointer-events-none"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                <div className="relative z-10 font-mono text-[11px] leading-[1.3] text-emerald-300/40 tracking-widest text-center select-none pointer-events-none space-y-1">
                  <p>UXFS2SXX3MEGERHE</p>
                  <p>182NTXNJS7F8EPNTD9</p>
                  <p>0+RR6ERUYZLSUWLKS9ZIHAR</p>
                  <p>S9HBZ3ITNH0K7TF4J9PJPNY</p>
                  <p>FBKF10S7S$WTGA02CBUKMA2GR</p>
                  <p>Y2CIWJHOX+C+KI2C1EJCGF6+C</p>
                  <p>F8CN=YK+ZJBZ302120DLB5DKTB</p>
                  <p>VPL68A0#67B36B4Q7TCK8946QTKB</p>
                  <p>IOP21V0M#Q!MRV=H=K7=T7MD</p>
                  <p>IWIQD1=IN8=N17WZ938$8SJ5R</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/10">
            <div className="lg:col-span-6 p-8 md:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 space-y-6">
              <h3 className="text-3xl md:text-4xl font-normal text-white tracking-tight font-heading">
                fallbacks
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Eliminate rate-limit headaches. If your primary notification provider goes dark, our orchestration engine automatically reroutes traffic to the next best provider in milliseconds.
              </p>
            </div>

            <div className="lg:col-span-6 p-8 md:p-12 flex items-center justify-center relative overflow-hidden min-h-[380px] bg-[#040404]">
              <div className="w-full max-w-md bg-[#030303]/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 font-medium">Failover Latency</span>
                  <span className="text-emerald-400 font-bold">14ms</span>
                </div>
                <div className="h-20 flex items-end gap-2 pt-2 border-b border-white/10 pb-3">
                  <div className="w-1/6 bg-emerald-500/40 h-[40%] rounded-t"></div>
                  <div className="w-1/6 bg-emerald-500/60 h-[50%] rounded-t"></div>
                  <div className="w-1/6 bg-emerald-500/80 h-[45%] rounded-t"></div>
                  <div className="w-1/6 bg-amber-500/90 h-[85%] rounded-t"></div>
                  <div className="w-1/6 bg-emerald-500 h-[60%] rounded-t"></div>
                  <div className="w-1/6 bg-emerald-500 h-[55%] rounded-t"></div>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Primary provider failover resolved seamlessly
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 p-8 md:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 space-y-6">
              <h3 className="text-3xl md:text-4xl font-normal text-white tracking-tight font-heading">
                Total visibility over token burn and costs
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Gain full control over your operations. Track real-time usage across every project with centralized logging, cost-guardrails, and enterprise-grade security headers.
              </p>
            </div>

            <div className="lg:col-span-6 p-8 md:p-12 flex items-center justify-center relative overflow-hidden min-h-[380px] bg-[#040404]">
              <div className="w-full max-w-md space-y-4">
                <div className="bg-[#030303]/90 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex items-center justify-between">
                  <div className="led-bar-red h-4 w-40 rounded-full"></div>
                  <span className="text-xs font-mono text-red-400 font-bold">Provider Alert</span>
                </div>

                <div className="bg-[#030303]/90 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex items-center justify-between">
                  <div className="led-bar-green h-4 w-52 rounded-full"></div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">99.99% Operational</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="px-8 md:px-12 py-12 border-b border-white/10">
            <h2 className="text-4xl md:text-5xl font-normal text-white tracking-tight font-heading">
              The engineering teams scale first
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="p-8 md:p-10 space-y-8 flex flex-col justify-between">
              <div className="h-32 bg-[#05070a] border border-white/10 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                <div className="liquid-rainbow-mesh absolute inset-0 opacity-30 pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-2 bg-[#020202] border border-white/10 px-4 py-2 rounded-full text-xs font-mono text-slate-300">
                  <span>Client</span>
                  <span className="text-emerald-400 font-bold">⚙</span>
                  <span>Service</span>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white font-heading">Unified integration</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Connect to our edge-native API gateway once and gain immediate access to every delivery provider.
                </p>
              </div>
            </div>

            <div className="p-8 md:p-10 space-y-8 flex flex-col justify-between">
              <div className="h-32 bg-[#05070a] border border-white/10 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                <div className="liquid-rainbow-mesh absolute inset-0 opacity-30 pointer-events-none"></div>
                <div className="relative z-10 w-full px-6">
                  <div className="led-bar-red h-3.5 w-full rounded-full"></div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white font-heading">Resilient orchestration</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Build dynamic routing to keep your applications running seamlessly during provider downtime.
                </p>
              </div>
            </div>

            <div className="p-8 md:p-10 space-y-8 flex flex-col justify-between">
              <div className="h-32 bg-[#05070a] border border-white/10 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                <div className="liquid-rainbow-mesh absolute inset-0 opacity-30 pointer-events-none"></div>
                <div className="relative z-10 h-10 w-10 rounded-full bg-[#020202] border border-white/20 flex items-center justify-center text-emerald-400">
                  ✦
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white font-heading">Granular governance</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Take control of your infrastructure costs with centralized delivery monitoring and real-time logging.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="px-8 md:px-14 py-16 border-b border-white/10">
            <h2 className="text-4xl md:text-5xl font-normal text-white tracking-tight font-heading">
              The people we empower
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-white/10 md:divide-y-0 border-b border-white/10">
            {testimonials.slice(0, 3).map((item, idx) => (
              <div
                key={item.name}
                className={`p-8 md:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden bg-[#080808] ${
                  idx < 2 ? "md:border-r border-white/10" : ""
                }`}
              >
                {item.hasMeshGlow && (
                  <div className="liquid-rainbow-mesh absolute -top-12 -right-12 w-64 h-64 opacity-25 pointer-events-none"></div>
                )}

                <div className="space-y-6 relative z-10">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-md"
                  />
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                    "{item.quote}"
                  </p>
                </div>

                <div className="pt-4 relative z-10">
                  <h4 className="text-sm font-bold text-white font-heading">{item.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{item.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-white/10 md:divide-y-0">
            {testimonials.slice(3, 6).map((item, idx) => (
              <div
                key={item.name}
                className={`p-8 md:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden bg-[#080808] ${
                  idx < 2 ? "md:border-r border-white/10" : ""
                }`}
              >
                <div className="space-y-6 relative z-10">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-md"
                  />
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                    "{item.quote}"
                  </p>
                </div>

                <div className="pt-4 relative z-10">
                  <h4 className="text-sm font-bold text-white font-heading">{item.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="h-16 diagonal-stripes border-b border-white/10"></div>

          <div className="px-8 md:px-14 py-16 border-b border-white/10 bg-[#080808]">
            <h2 className="text-4xl md:text-5xl font-normal text-white tracking-tight font-heading">
              The scale modern intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-white/10 md:divide-y-0 divide-x divide-white/10 border-b border-white/10 bg-[#080808]">
            <div className="p-8 md:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden bg-[#080808] min-h-[320px]">
              <img
                src="/metric-mesh-1.png"
                alt="Metric Mesh 1"
                className="absolute right-0 bottom-0 top-0 w-3/5 object-cover opacity-60 pointer-events-none"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-300">
                  <Network className="h-4 w-4" />
                </div>

                <div>
                  <div className="text-5xl md:text-6xl font-normal text-white font-heading tracking-tight mb-4">
                    4.7B
                  </div>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-xs">
                    Tokens routed and processed securely through our global edge network with zero dropped requests.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden bg-[#080808] min-h-[320px]">
              <img
                src="/metric-mesh-2.png"
                alt="Metric Mesh 2"
                className="absolute right-0 bottom-0 top-0 w-3/5 object-cover opacity-60 pointer-events-none"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-300">
                  <Cpu className="h-4 w-4" />
                </div>

                <div>
                  <div className="text-5xl md:text-6xl font-normal text-white font-heading tracking-tight mb-4">
                    280K
                  </div>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-xs">
                    Hours saved in unnecessary infrastructure overhead and LLM token costs via smart semantic caching.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden bg-[#080808] min-h-[320px]">
              <img
                src="/metric-mesh-3.png"
                alt="Metric Mesh 3"
                className="absolute right-0 bottom-0 top-0 w-3/5 object-cover opacity-60 pointer-events-none"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-300">
                  <Share2 className="h-4 w-4" />
                </div>

                <div>
                  <div className="text-5xl md:text-6xl font-normal text-white font-heading tracking-tight mb-4">
                    99.9%
                  </div>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-xs">
                    Uptime guaranteed. Maintained across production environments thanks to automated multi-model fallbacks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="h-16 diagonal-stripes border-b border-white/10"></div>

          <div className="px-8 md:px-14 py-16 border-b border-white/10 bg-[#080808]">
            <h2 className="text-4xl md:text-5xl font-normal text-white tracking-tight font-heading">
              Simple pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-white/10 md:divide-y-0 divide-x border-b border-white/10 bg-[#080808]">
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
          </div>

          <div className="p-8 md:p-12 border-b border-white/10 bg-[#080808] flex flex-col sm:flex-row items-center justify-between gap-6">
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
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="px-8 md:px-14 py-16 border-b border-white/10">
            <h2 className="text-4xl md:text-5xl font-normal text-white tracking-tight font-heading">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] p-8 md:p-14 border-b border-white/10">
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[380px] bg-[#080808]">
              <div className="floating-faq-glow w-full max-w-md h-[360px] pointer-events-none"></div>
            </div>

            <div className="lg:col-span-7 flex items-center">
              <div className="w-full border border-white/10 divide-y divide-white/10 bg-[#080808]">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="group">
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full py-4.5 px-6 flex items-center justify-between text-left font-heading text-sm sm:text-base font-normal text-slate-200 hover:text-white hover:bg-white/[0.02] transition-colors"
                    >
                      <span>{faq.q}</span>
                      {activeFaq === idx ? (
                        <Minus className="h-4 w-4 text-white flex-shrink-0" />
                      ) : (
                        <Plus className="h-4 w-4 text-slate-400 group-hover:text-white flex-shrink-0" />
                      )}
                    </button>
                    {activeFaq === idx && (
                      <div className="px-6 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed font-sans border-t border-white/5 pt-3 bg-white/[0.01]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-16 diagonal-stripes"></div>
        </section>

        <section className="py-24 px-8 border-b border-white/10 text-center space-y-8 bg-[#080808]">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight font-heading max-w-4xl mx-auto">
            Drop the boilerplate. Start shipping
          </h2>
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate("tenant-auth-signup")}
              className="pill-white px-7 py-3.5 text-sm font-semibold text-black"
            >
              Start for Free
            </button>

            <button
              onClick={() => navigate("pricing")}
              className="pill-dark px-7 py-3.5 text-sm font-medium"
            >
              Check Plans
            </button>
          </div>
        </section>

        <div className="h-16 diagonal-stripes border-b border-white/10"></div>

        <section className="p-8 md:p-12 space-y-12">
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono">Interactive Developer Sandbox</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">Test Notification Pipeline</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 bg-[#040404] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Send className="h-4 w-4 text-emerald-400" />
                  Dispatch Payload Config
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Target Channel</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["EMAIL", "SMS", "PUSH", "WEBHOOK"] as const).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setSimChannel(ch)}
                        className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                          simChannel === ch
                            ? "bg-white text-black font-bold"
                            : "bg-[#090909] text-slate-400 hover:bg-slate-800 border border-white/10"
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">End User External ID</label>
                  <input
                    type="text"
                    value={simRecipient}
                    onChange={(e) => setSimRecipient(e.target.value)}
                    className="w-full rounded-lg bg-[#090909] border border-white/10 px-3.5 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulateSend}
                disabled={simStatus === "sending"}
                className="mt-6 pill-white w-full py-3 text-xs font-semibold text-black flex items-center justify-center gap-2"
              >
                {simStatus === "sending" ? "Dispatching..." : "Simulate Delivery Pipeline"}
              </button>
            </div>

            <div className="lg:col-span-7 bg-[#030303] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    Live Execution Log Stream
                  </span>
                  {simStatus === "success" && (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      Delivered in 283ms
                    </span>
                  )}
                </div>

                {simLogs.length === 0 ? (
                  <div className="h-44 flex items-center justify-center text-xs text-slate-600 font-mono">
                    Click "Simulate Delivery Pipeline" to inspect execution trace...
                  </div>
                ) : (
                  <div className="space-y-2 font-mono text-xs">
                    {simLogs.map((log, i) => (
                      <div key={i} className="text-slate-300 bg-[#080808] p-2.5 rounded-lg border border-white/5">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
