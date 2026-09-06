import React, { useState } from "react";
import { Lock, Mail, ArrowRight, Eye, EyeOff, Building, User } from "lucide-react";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

interface TenantAuthProps {
  initialMode?: "login" | "signup";
  navigate: (view: string) => void;
  onSuccessLogin: (tenantData: any) => void;
}

export const TenantAuth: React.FC<TenantAuthProps> = ({
  initialMode = "login",
  navigate,
  onSuccessLogin,
}) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [slug, setSlug] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("You must accept the terms & conditions.");
      return;
    }

    setLoading(true);

    try {
      if (isLoginMode) {
        if (!password) {
          setErrorMsg("Password is required.");
          setLoading(false);
          return;
        }

        const res = await fetch(API_ENDPOINTS.TENANT_LOGIN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: sanitizedEmail,
            password,
          }),
        });

        const text = await res.text();
        let data: any = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { error: text };
          }
        }

        if (!res.ok) throw new Error(data.error || data.message || "Invalid login credentials.");

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

        const res = await fetch(`${API_BASE_URL}/api/v1/tenants/signup`, {
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

        const text = await res.text();
        let data: any = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { error: text };
          }
        }

        if (!res.ok) throw new Error(data.error || data.message || "Registration failed. Check parameters.");

        onSuccessLogin({
          tenantId: data.tenant?.id,
          tenantName: data.tenant?.name,
          slug: data.tenant?.slug,
          member: data.member,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen min-h-screen bg-[#000000] text-slate-100 flex items-center justify-center p-0 md:p-6 lg:p-12 relative overflow-hidden select-none">
      <img
        src="/pro-mesh.png"
        alt="Background Mesh"
        className="absolute right-0 top-0 bottom-0 w-2/3 object-cover opacity-20 pointer-events-none"
      />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#000000]/60 to-[#000000] pointer-events-none"></div>

      <div className="w-full h-full md:h-auto md:min-h-175 md:max-w-7xl lg:max-w-310 bg-[#080808] border-0 md:border border-white/10 shadow-2xl overflow-hidden rounded-none relative z-10 grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 bg-[#050505] p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 min-h-85 lg:min-h-full">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <img
              src="/auth-mesh-circle.png"
              alt="Rotating Spectrum"
              className="w-[160%] h-[160%] max-w-none object-cover animate-earth-rotate opacity-50 radial-mesh-mask"
            />
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,#050505_70%)] pointer-events-none z-10"></div>
          <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-[#050505]/80 pointer-events-none z-10"></div>

          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="font-heading font-semibold text-white tracking-widest text-sm">NETIFY</span>
            </div>

            <button
              onClick={() => navigate("home")}
              className="text-xs font-sans font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              Back to website →
            </button>
          </div>

          <div className="relative z-20 mt-14 lg:mt-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-none border border-emerald-500/20 inline-block mb-3">
              Developer Platform
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-normal text-white leading-tight">
              {isLoginMode ? "Engineered for Extreme Velocity" : "Deploy Multi-Tenant Pipelines"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-sans mt-3 leading-relaxed">
              Real-time event delivery, robust audit logs, and isolated tenant routing infrastructure.
            </p>

            <div className="flex items-center gap-2 mt-8">
              <div className="h-1 w-8 bg-white rounded-none"></div>
              <div className="h-1 w-2.5 bg-white/30 rounded-none"></div>
              <div className="h-1 w-2.5 bg-white/30 rounded-none"></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 lg:p-20 flex flex-col justify-center bg-[#080808]">
          <div className="max-w-md mx-auto w-full space-y-7">
            <div>
              <h2 className="text-3xl sm:text-4xl font-normal text-white tracking-tight font-heading">
                {isLoginMode ? "Sign in to Workspace" : "Register Workspace"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-sans mt-2">
                {isLoginMode ? "Don't have a workspace?" : "Already registered?"}{" "}
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setErrorMsg("");
                  }}
                  className="text-white hover:underline font-medium underline"
                >
                  {isLoginMode ? "Create tenant account" : "Sign in here"}
                </button>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-none bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                      Organization Name *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Acme Inc."
                        value={tenantName}
                        onChange={(e) => {
                          setTenantName(e.target.value);
                          if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                        }}
                        className="w-full rounded-none bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                      Tenant URL Slug *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-xs font-mono text-slate-500">@</span>
                      <input
                        type="text"
                        required
                        placeholder="acme-inc"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                        className="w-full rounded-none bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-xs text-emerald-400 font-mono placeholder-slate-500 focus:border-white/40 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                      Owner Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Alex Owner"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full rounded-none bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  Work Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="alex@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-none bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-none bg-white/5 border border-white/10 pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded-none border-white/20 bg-white/10 text-white focus:ring-0 h-3.5 w-3.5"
                  />
                  <span className="text-xs text-slate-400 font-sans">
                    I agree to the <span className="text-white underline">Terms & Conditions</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-none bg-white hover:bg-slate-200 text-black text-xs font-semibold font-sans transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-white/5"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLoginMode ? "Access Workspace Dashboard" : "Register Workspace Now"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
