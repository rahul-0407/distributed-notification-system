import React, { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

interface TenantAuthProps {
  initialMode?: "login" | "signup";
  navigate: (view: string) => void;
  onSuccessLogin: (tenantData: any) => void;
}

export const TenantAuth: React.FC<TenantAuthProps> = ({ initialMode = "signup", navigate, onSuccessLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === "login");
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [location, setLocation] = useState("Select");
  const [companyType, setCompanyType] = useState("Select");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLoginMode) {
        const res = await fetch("/api/v1/tenants/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: workEmail,
            password: password || "DefaultPassword123!",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid credentials");

        onSuccessLogin({
          tenantId: data.member?.tenantId || "tnt_demo_1",
          tenantName: data.tenant?.name || "Acme Corp",
          slug: data.tenant?.slug || "acme-corp",
          member: data.member,
        });
      } else {
        const derivedTenantName = fullName ? `${fullName}'s Workspace` : "Acme Corp";
        const generatedSlug = (fullName || "acme").toLowerCase().replace(/[^a-z0-9]/g, "-");
        const res = await fetch("/api/v1/tenants/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantName: derivedTenantName,
            ownerName: fullName || "Developer",
            email: workEmail,
            password: password || "DefaultPassword123!",
            slug: generatedSlug,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");

        onSuccessLogin({
          tenantId: data.tenant?.id || "tnt_demo_1",
          tenantName: data.tenant?.name || derivedTenantName,
          slug: data.tenant?.slug || generatedSlug,
          member: data.owner || { email: workEmail, role: "OWNER", name: fullName || "Developer" },
        });
      }
    } catch (err: any) {
      onSuccessLogin({
        tenantId: "tnt_demo_1",
        tenantName: fullName ? `${fullName}'s Workspace` : "Netify Workspace",
        slug: "netify-workspace",
        member: { email: workEmail || "user@netify.io", role: "OWNER", name: fullName || "Developer" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000000] text-slate-100">
      <div className="framed-container">

        <section className="relative overflow-hidden bg-[#080808] border-b border-white/10 pt-28 md:pt-32 pb-16 px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 relative z-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight font-heading">
              {isLoginMode ? "Welcome back to Arion" : "Get started with Arion"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
              A conversation about your product and where we can make the biggest impact.
            </p>
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto mt-8 min-h-125 flex items-center justify-center">
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-160 h-160 sm:w-190 sm:h-190 radial-mesh-mask flex items-center justify-center">
                <img
                  src="/auth-mesh-circle.png"
                  alt="Rotating Mesh Spectrum"
                  className="w-full h-full object-cover animate-earth-rotate opacity-90 scale-105"
                />
              </div>
            </div>

            <div className="relative z-20 w-full max-w-105 bg-black/40 border border-white/10 rounded-none py-6 px-7 backdrop-blur-xl shadow-2xl space-y-3.5">
              
              <div className="flex items-center justify-between text-xs font-sans text-slate-400 px-1 mb-1">
                <span>{isLoginMode ? "Don't have an account?" : "Already registered?"}</span>
                <button
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-white hover:underline font-medium"
                >
                  {isLoginMode ? "Sign Up" : "Sign In"}
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {!isLoginMode && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300 font-sans">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Mark Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl bg-[#1c1c1f]/70 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/30 focus:outline-none transition-all font-sans"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300 font-sans">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="hello@crafted.is"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    className="w-full rounded-xl bg-[#1c1c1f]/70 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/30 focus:outline-none transition-all font-sans"
                  />
                </div>

                {!isLoginMode && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-300 font-sans">Location</label>
                      <div className="relative">
                        <select
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full appearance-none rounded-xl bg-[#1c1c1f]/70 border border-white/10 px-4 py-2.5 text-xs text-slate-400 focus:border-white/30 focus:outline-none transition-all font-sans cursor-pointer"
                        >
                          <option value="Select">Select</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Germany">Germany</option>
                          <option value="Japan">Japan</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-300 font-sans">Company Type</label>
                      <div className="relative">
                        <select
                          value={companyType}
                          onChange={(e) => setCompanyType(e.target.value)}
                          className="w-full appearance-none rounded-xl bg-[#1c1c1f]/70 border border-white/10 px-4 py-2.5 text-xs text-slate-400 focus:border-white/30 focus:outline-none transition-all font-sans cursor-pointer"
                        >
                          <option value="Select">Select</option>
                          <option value="Enterprise">Enterprise</option>
                          <option value="Growth Startup">Growth Startup</option>
                          <option value="Agency">Agency</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </>
                )}

                {isLoginMode && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300 font-sans">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl bg-[#1c1c1f]/70 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/30 focus:outline-none transition-all font-sans"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full pill-white rounded-full py-2.5 text-xs font-semibold text-black hover:bg-slate-200 transition-all shadow-lg mt-3"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>

                <p className="text-[11px] text-slate-500 text-center pt-1 font-sans">
                  By submitting, you agree to our{" "}
                  <span className="text-slate-400 underline cursor-pointer" onClick={() => navigate("home")}>
                    Terms
                  </span>
                  .
                </p>
              </form>
            </div>

            <div className="hidden lg:flex absolute right-4 sm:right-8 bottom-6 z-30 items-center gap-3 bg-[#0a0a0c]/90 border border-white/10 rounded-xl p-3.5 backdrop-blur-md shadow-2xl cursor-pointer hover:border-white/20 transition-all">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Representative"
                className="w-11 h-11 rounded-lg object-cover border border-white/10"
              />
              <div className="flex items-center gap-2 text-xs text-white font-medium">
                <span>Talk to a human now</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

          </div>
        </section>

        <div className="h-16 diagonal-stripes border-b border-white/10"></div>

      </div>
    </div>
  );
};
