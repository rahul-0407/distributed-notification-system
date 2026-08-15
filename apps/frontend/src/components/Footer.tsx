import React from "react";

interface FooterProps {
  navigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#000000] text-slate-400">
      <div className="framed-container relative overflow-hidden bg-[#080808] border-t border-white/10">
        
        <img
          src="/footer-mesh.png"
          alt="Footer Mesh Background"
          className="absolute inset-0 w-full h-full object-cover opacity-75 pointer-events-none"
        />

        <div className="relative z-10 p-8 md:p-14 min-h-[460px] flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-sans">Crafted by</span>
                <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <div className="h-4 w-4 rounded-full bg-white text-black font-bold text-[9px] flex items-center justify-center">
                    N
                  </div>
                  <span className="text-xs font-semibold text-white">Netify</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-3 divide-x divide-white/10">
              <div className="space-y-3 pr-4">
                <h4 className="text-xs font-semibold text-slate-400 font-mono tracking-wider">Product</h4>
                <ul className="space-y-2 text-xs font-sans">
                  <li>
                    <button onClick={() => navigate("changelog")} className="hover:text-white transition-colors">
                      Changelog
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("home")} className="hover:text-white transition-colors">
                      Demo
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 px-4">
                <h4 className="text-xs font-semibold text-slate-400 font-mono tracking-wider">Utility</h4>
                <ul className="space-y-2 text-xs font-sans">
                  <li>
                    <button onClick={() => navigate("404")} className="hover:text-white transition-colors">
                      404
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("terms")} className="hover:text-white transition-colors">
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("privacy")} className="hover:text-white transition-colors">
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("admin-auth")} className="hover:text-white transition-colors  font-mono">
                      Admin Portal
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pl-4">
                <h4 className="text-xs font-semibold text-slate-400 font-mono tracking-wider">Let's Connect</h4>
                <ul className="space-y-2 text-xs font-sans">
                  <li>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                      X / Twitter
                    </a>
                  </li>
                  <li>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                      YouTube
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-4 overflow-hidden select-none pointer-events-none w-full">
            <div className="animate-marquee">
              <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-mono tracking-widest text-slate-100/15 uppercase whitespace-nowrap pr-12">
                ion Netify Netify Netify Netify
              </span>
              <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-mono tracking-widest text-slate-100/15 uppercase whitespace-nowrap pr-12">
                ion Netify Netify Netify Netify
              </span>
            </div>
          </div>
        </div>

        <div className="h-16 diagonal-stripes border-t border-white/10 relative z-10"></div>
      </div>
    </footer>
  );
};
