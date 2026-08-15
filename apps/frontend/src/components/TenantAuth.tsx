import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

interface TenantAuthProps {
  initialMode?: "login" | "signup";
  navigate: (view: string) => void;
  onSuccessLogin: (tenantData: any) => void;
}

export const TenantAuth: React.FC<TenantAuthProps> = ({ initialMode = "signup", navigate, onSuccessLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === "login");
  const [tenantName, setTenantName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTenantNameChange = (val: string) => {
    setTenantName(val);
    if (!slug || slug === (tenantName.toLowerCase().replace(/[^a-z0-9]/g, "-"))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, "-"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const sanitizedEmail = workEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setErrorMsg("Please enter a valid work email address.");
      setLoading(false);
      return;
    }

    try {
      if (isLoginMode) {
        if (!password) {
          setErrorMsg("Password is required.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/v1/tenants/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: sanitizedEmail,
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid login credentials.");

        onSuccessLogin({
          tenantId: data.member?.tenantId || data.member?.tenant?.id,
          tenantName: data.member?.tenant?.name || data.tenant?.name,
          slug: data.member?.tenant?.slug || data.tenant?.slug,
          member: data.member,
        });
      } else {
        const sanitizedTenantName = tenantName.trim();
        const sanitizedOwnerName = ownerName.trim();
        const sanitizedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

        if (!sanitizedTenantName || !sanitizedOwnerName) {
          setErrorMsg("All workspace details are required.");
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setErrorMsg("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/v1/tenants/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            tenantName: sanitizedTenantName,
            ownerName: sanitizedOwnerName,
            ownerEmail: sanitizedEmail,
            ownerPassword: password,
            slug: sanitizedSlug,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed. Check parameters.");

        onSuccessLogin({
          tenantId: data.tenant?.id,
          tenantName: data.tenant?.name,
          slug: data.tenant?.slug,
          member: data.owner,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000000] text-slate-100 min-h-screen">
      <div className="framed-container">
        <section className="relative overflow-hidden bg-[#080808] border-b border-white/10 pt-28 md:pt-32 pb-16 px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 relative z-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight font-heading">
              {isLoginMode ? "Welcome back to Netify" : "Register Workspace"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
              {isLoginMode
                ? "Access your isolated notification infrastructure dashboard."
                : "Provision an atomic Tenant workspace with Owner developer access."}
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
                <span>{isLoginMode ? "Don't have a workspace?" : "Already registered?"}</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setErrorMsg("");
                  }}
                  className="text-white hover:underline font-medium"
                >
                  {isLoginMode ? "Create Tenant" : "Sign In"}
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-none bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {!isLoginMode && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-300 font-sans">Workspace / Company Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Acme Corp"
                        value={tenantName}
                        onChange={(e) => handleTenantNameChange(e.target.value)}
                        className="w-full rounded-none bg-[#1c1c1f]/70 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/30 focus:outline-none transition-all font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-300 font-sans">Workspace URL Slug *</label>
                      <input
                        type="text"
                        required
                        placeholder="acme-corp"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full rounded-none bg-[#1c1c1f]/70 border border-white/10 px-4 py-2.5 text-xs font-mono text-emerald-400 placeholder-slate-500 focus:border-white/30 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-300 font-sans">Owner Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Smith"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full rounded-none bg-[#1c1c1f]/70 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/30 focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300 font-sans">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@acme.com"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    className="w-full rounded-none bg-[#1c1c1f]/70 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/30 focus:outline-none transition-all font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300 font-sans">
                    {isLoginMode ? "Password *" : "Owner Account Password *"}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-none bg-[#1c1c1f]/70 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/30 focus:outline-none transition-all font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-none py-2.5 text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-all shadow-lg mt-3 font-sans"
                >
                  {loading ? "Authenticating..." : isLoginMode ? "Sign In to Workspace" : "Register Workspace"}
                </button>

                <p className="text-[11px] text-slate-500 text-center pt-1 font-sans">
                  By continuing, you agree to our{" "}
                  <span className="text-slate-400 underline cursor-pointer" onClick={() => navigate("home")}>
                    Terms of Service
                  </span>
                  .
                </p>
              </form>
            </div>

            <div className="hidden lg:flex absolute right-4 sm:right-8 bottom-6 z-30 items-center gap-3 bg-[#0a0a0c]/90 border border-white/10 rounded-none p-3.5 backdrop-blur-md shadow-2xl cursor-pointer hover:border-white/20 transition-all">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Representative"
                className="w-11 h-11 rounded-none object-cover border border-white/10"
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
