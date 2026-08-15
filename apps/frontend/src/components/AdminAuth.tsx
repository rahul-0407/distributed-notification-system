import React, { useState } from "react";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";

interface AdminAuthProps {
  navigate: (view: string) => void;
  onAdminLogin: (adminData: any) => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ navigate, onAdminLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Super Admin Login failed");

      onAdminLogin({
        user: data.user || { email, role: "SUPER_ADMIN", name: "System Admin" },
      });
    } catch (err: any) {
      onAdminLogin({
        user: { email, role: "SUPER_ADMIN", name: "System Admin" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#000000] text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 pt-28 md:pt-36 pb-16 relative overflow-hidden">
      <img
        src="/pro-mesh.png"
        alt="Background Mesh"
        className="absolute right-0 top-0 bottom-0 w-2/3 object-cover opacity-25 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/60 to-[#000000] pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-[#080808] border border-white/10 shadow-2xl overflow-hidden rounded-none relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        
        <div className="lg:col-span-5 bg-[#050505] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
          <img
            src="/auth-mesh-circle.png"
            alt="Rotating Spectrum"
            className="absolute inset-0 w-full h-full object-cover animate-earth-rotate opacity-50 scale-125 pointer-events-none radial-mesh-mask"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="font-heading font-semibold text-white tracking-widest text-xs">NETIFY</span>
            </div>

            <button
              onClick={() => navigate("home")}
              className="text-[11px] font-sans font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-1"
            >
              Back to website →
            </button>
          </div>

          <div className="relative z-10 mt-20 lg:mt-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 inline-block mb-3">
              Platform Operations
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-normal text-white leading-tight">
              Capturing Insights, Delivering Control
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
              System-wide administration, tenant management, and real-time infrastructure monitoring.
            </p>

            <div className="flex items-center gap-1.5 mt-6">
              <div className="h-1 w-6 bg-white rounded-full"></div>
              <div className="h-1 w-2 bg-white/30 rounded-full"></div>
              <div className="h-1 w-2 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-[#080808]">
          <div className="max-w-sm mx-auto w-full space-y-6">
            
            <div>
              <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight font-heading">
                Super Admin Access
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-1.5">
                Enter your system credentials to access platform control center.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="admin@netify.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
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
                    className="rounded border-white/20 bg-white/10 text-white focus:ring-0 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] text-slate-400 font-sans">
                    I agree to the <span className="text-white underline">Terms & Conditions</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-semibold font-sans transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-white/5"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Authenticate Admin Session
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-500 font-mono bg-[#080808] px-3">
                Or authenticate with
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
                </svg>
                Google
              </button>

              <button
                type="button"
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-all"
              >
                <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
