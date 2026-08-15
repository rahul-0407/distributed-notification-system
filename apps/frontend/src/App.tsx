import { useState } from "react";
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

export function App() {
  const [currentView, setCurrentView] = useState("home");
  const [tenantData, setTenantData] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);

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

  const handleLogout = () => {
    setTenantData(null);
    setAdminData(null);
    setCurrentView("home");
  };

  if (currentView === "tenant-dashboard") {
    return <TenantDashboard tenantData={tenantData} onLogout={handleLogout} />;
  }

  if (currentView === "admin-dashboard") {
    return <AdminDashboard adminData={adminData} onLogout={handleLogout} />;
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
        {currentView === "admin-auth" && (
          <AdminAuth navigate={navigate} onAdminLogin={handleAdminLoginSuccess} />
        )}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}

export default App;
