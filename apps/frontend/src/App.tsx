import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { DocsPage } from "./components/DocsPage";
import { PricingPage } from "./components/PricingPage";
import { MetricsPage } from "./components/MetricsPage";
import { ChangelogPage } from "./components/ChangelogPage";
import { TenantAuth } from "./components/TenantAuth";
import { TenantDashboard } from "./components/TenantDashboard";
import { AdminAuth } from "./components/AdminAuth";
import { AdminDashboard } from "./components/AdminDashboard";
import { EndUserDemo } from "./components/EndUserDemo";

export function App() {
  const [currentView, setCurrentView] = useState("home");
  const [tenantData, setTenantData] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    const checkSessions = async () => {
      try {
        const tenantRes = await fetch("/api/v1/tenants/auth/me", {
          credentials: "include",
        });
        if (tenantRes.ok) {
          const data = await tenantRes.json();
          if (data.member) {
            setTenantData({
              tenantId: data.member.tenantId || data.member.tenant?.id,
              tenantName: data.member.tenant?.name,
              slug: data.member.tenant?.slug,
              member: data.member,
            });
          }
        }
      } catch {}

      try {
        const adminRes = await fetch("/api/v1/users/platform/me", {
          credentials: "include",
        });
        if (adminRes.ok) {
          const data = await adminRes.json();
          if (data.admin) {
            setAdminData({ admin: data.admin });
          }
        }
      } catch {}
    };

    checkSessions();
  }, []);

  const navigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTenantLoginSuccess = (data: any) => {
    setTenantData(data);
    setCurrentView("tenant-dashboard");
  };

  const handleAdminLoginSuccess = (data: any) => {
    setAdminData(data);
    setCurrentView("admin-dashboard");
  };

  const handleLogout = async () => {
    try {
      if (tenantData) {
        await fetch("/api/v1/tenants/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      }
      if (adminData) {
        await fetch("/api/v1/users/platform/logout", {
          method: "POST",
          credentials: "include",
        });
      }
    } catch {}

    setTenantData(null);
    setAdminData(null);
    setCurrentView("home");
  };

  if (currentView === "tenant-dashboard") {
    return <TenantDashboard tenantData={tenantData} onLogout={handleLogout} navigate={navigate} />;
  }

  if (currentView === "admin-auth") {
    return <AdminAuth navigate={navigate} onAdminLogin={handleAdminLoginSuccess} />;
  }

  if (currentView === "admin-dashboard") {
    return <AdminDashboard adminData={adminData} onLogout={handleLogout} />;
  }

  if (currentView === "end-user-demo") {
    return <EndUserDemo navigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#000000]">
      <Navbar currentView={currentView} navigate={navigate} />

      <main className="flex-1">
        {currentView === "home" && <LandingPage navigate={navigate} />}
        {currentView === "docs" && <DocsPage navigate={navigate} />}
        {currentView === "pricing" && <PricingPage navigate={navigate} />}
        {currentView === "metrics" && <MetricsPage navigate={navigate} />}
        {currentView === "changelog" && <ChangelogPage navigate={navigate} />}
        {currentView === "tenant-auth" && (
          <TenantAuth initialMode="login" navigate={navigate} onSuccessLogin={handleTenantLoginSuccess} />
        )}
        {currentView === "tenant-auth-signup" && (
          <TenantAuth initialMode="signup" navigate={navigate} onSuccessLogin={handleTenantLoginSuccess} />
        )}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}

export default App;
