import React, { useState, useEffect } from "react";

interface NavbarProps {
  currentView: string;
  navigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, navigate }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (view: string, sectionId?: string) => {
    navigate(view);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-[#000000]/20 backdrop-blur-md border-b border-white/10 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-[1240px] mx-auto flex items-center justify-between px-8 py-5 bg-transparent">
        <div className="flex items-center cursor-pointer" onClick={() => navigate("home")}>
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white" stroke="currentColor">
            <path d="M4 17L10 5H14L8 17H4Z" fill="currentColor" stroke="none" />
            <path d="M10 19L16 7H20L14 19H10Z" fill="currentColor" opacity="0.75" stroke="none" />
          </svg>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs md:text-sm font-medium text-slate-300 font-sans">
          <button
            onClick={() => handleNavClick("home")}
            className={`transition-colors ${currentView === "home" ? "text-white font-semibold" : "hover:text-white"}`}
          >
            Product
          </button>
          <button
            onClick={() => handleNavClick("home", "testimonials")}
            className="hover:text-white transition-colors"
          >
            Testimonials
          </button>
          <button
            onClick={() => handleNavClick("pricing")}
            className={`transition-colors ${currentView === "pricing" ? "text-white font-semibold" : "hover:text-white"}`}
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavClick("metrics")}
            className={`transition-colors ${currentView === "metrics" ? "text-white font-semibold" : "hover:text-white"}`}
          >
            Metrics
          </button>
          <button
            onClick={() => handleNavClick("docs")}
            className={`transition-colors ${currentView === "docs" ? "text-white font-semibold" : "hover:text-white"}`}
          >
            Docs
          </button>
        </nav>

        <div className="flex items-center">
          <button
            onClick={() => navigate("tenant-auth-signup")}
            className="pill-white px-5 py-2 text-xs md:text-sm font-semibold text-black hover:bg-slate-200 transition-colors"
          >
            Start Free
          </button>
        </div>
      </div>
    </header>
  );
};
