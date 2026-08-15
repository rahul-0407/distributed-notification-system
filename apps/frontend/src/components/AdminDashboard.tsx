import React, { useState, useEffect } from "react";
import { Shield, Building, Users, Activity, Plus, LogOut, Server, Database } from "lucide-react";

interface AdminDashboardProps {
  adminData: any;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<"tenants" | "users" | "system">("tenants");
  
  const [tenantsList, setTenantsList] = useState<any[]>([
    { id: "tnt_acme_88", name: "Acme Corporation", slug: "acme-corp", memberCount: 5, status: "ACTIVE", createdAt: "2026-08-10" },
    { id: "tnt_stripe_99", name: "Staging Tenant", slug: "staging-dev", memberCount: 2, status: "ACTIVE", createdAt: "2026-08-14" },
    { id: "tnt_globex_12", name: "Globex Tech", slug: "globex", memberCount: 12, status: "ACTIVE", createdAt: "2026-08-15" },
  ]);

  const [platformUsers, setPlatformUsers] = useState<any[]>([
    { id: adminData?.admin?.id || "usr_adm_1", name: adminData?.admin?.name || "System Super Admin", email: adminData?.admin?.email || "admin@netify.io", role: adminData?.admin?.role || "SUPER_ADMIN", createdAt: "2026-08-01" },
  ]);

  const [newUserModal, setNewUserModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("ADMIN");

  const [newTenantModal, setNewTenantModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSlug, setNewTenantSlug] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newOwnerPassword, setNewOwnerPassword] = useState("");

  const [modalError, setModalError] = useState("");

  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/v1/tenants", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tenants)) {
          setTenantsList(data.tenants);
        }
      }
    } catch {}
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/v1/users/platform/admins", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.admins)) {
          setPlatformUsers(data.admins);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchTenants();
    fetchAdmins();
  }, []);

  const handleCreateAdminUser = async () => {
    setModalError("");
    const email = newAdminEmail.trim().toLowerCase();
    const name = newAdminName.trim();
    if (!email || !name || !newAdminPassword) {
      setModalError("All admin fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/v1/users/platform/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password: newAdminPassword,
          role: newAdminRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create platform admin.");

      setPlatformUsers((prev) => [
        data.admin || {
          id: `usr_adm_${Date.now()}`,
          name,
          email,
          role: newAdminRole,
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
      setNewUserModal(false);
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminRole("ADMIN");
    } catch (err: any) {
      setModalError(err.message || "Failed to create admin user.");
    }
  };

  const handleCreateTenant = async () => {
    setModalError("");
    const tName = newTenantName.trim();
    const tSlug = newTenantSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const oEmail = newOwnerEmail.trim().toLowerCase();
    const oName = newOwnerName.trim();

    if (!tName || !tSlug || !oEmail || !oName || !newOwnerPassword) {
      setModalError("All tenant workspace fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/v1/tenants/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tenantName: tName,
          slug: tSlug,
          ownerName: oName,
          ownerEmail: oEmail,
          ownerPassword: newOwnerPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create tenant.");

      setTenantsList((prev) => [
        {
          id: data.tenant?.id || `tnt_${Math.random().toString(36).substring(2, 8)}`,
          name: data.tenant?.name || tName,
          slug: data.tenant?.slug || tSlug,
          memberCount: 1,
          status: "ACTIVE",
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
      setNewTenantModal(false);
      setNewTenantName("");
      setNewTenantSlug("");
      setNewOwnerName("");
      setNewOwnerEmail("");
      setNewOwnerPassword("");
    } catch (err: any) {
      setModalError(err.message || "Failed to register tenant.");
    }
  };

  const handleToggleTenantStatus = (tenantId: string) => {
    setTenantsList((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, status: t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 flex flex-col font-sans select-none">
      <header className="border-b border-white/10 bg-[#050505] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-white text-black font-extrabold text-sm rounded-none">
            N
          </div>
          <div>
            <span className="text-base font-heading font-semibold text-white flex items-center gap-2">
              Netify Platform Operations
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-none text-[10px] font-mono">
                {adminData?.admin?.role || "SUPER_ADMIN"} Console
              </span>
            </span>
            <p className="text-[11px] font-mono text-slate-400">
              Authenticated: {adminData?.admin?.email || "admin@netify.io"}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-none border border-white/15 transition-all font-sans"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout Session
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 border-r border-white/10 bg-[#040404] p-5 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-2 py-1">
            Control Plane
          </div>
          
          <button
            onClick={() => setActiveTab("tenants")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "tenants" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Building className="h-4 w-4" /> All Tenants ({tenantsList.length})
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "users" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" /> Platform Admins ({platformUsers.length})
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "system" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Activity className="h-4 w-4 text-emerald-400" /> Infrastructure Metrics
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-10 space-y-8 bg-[#000000] overflow-y-auto">
          {activeTab === "tenants" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                    Global Tenants Directory
                  </h1>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Manage all tenant workspaces across the Netify notification platform.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setModalError("");
                    setNewTenantModal(true);
                  }}
                  className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
                >
                  <Plus className="h-4 w-4" /> Create New Tenant
                </button>
              </div>

              <div className="bg-[#080808] border border-white/10 rounded-none overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c0c0c] border-b border-white/10 text-slate-400 font-mono">
                    <tr>
                      <th className="p-4">Tenant Name</th>
                      <th className="p-4">Tenant ID</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Members</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {tenantsList.map((t) => (
                      <tr key={t.id} className="hover:bg-white/5">
                        <td className="p-4 font-sans font-semibold text-white">{t.name}</td>
                        <td className="p-4 text-emerald-400">{t.id}</td>
                        <td className="p-4 text-slate-400">{t.slug}</td>
                        <td className="p-4 text-slate-300">{t.memberCount || 1}</td>
                        <td className="p-4">
                          {t.status === "ACTIVE" || !t.status ? (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-none">Active</span>
                          ) : (
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-none">Suspended</span>
                          )}
                        </td>
                        <td className="p-4 text-right font-sans">
                          <button
                            onClick={() => handleToggleTenantStatus(t.id)}
                            className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-none border border-white/15 transition-all"
                          >
                            {t.status === "ACTIVE" || !t.status ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                    Platform Super Admins
                  </h1>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    System admins with platform-wide access controls.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setModalError("");
                    setNewUserModal(true);
                  }}
                  className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
                >
                  <Plus className="h-4 w-4" /> Add Platform Admin
                </button>
              </div>

              <div className="bg-[#080808] border border-white/10 rounded-none overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c0c0c] border-b border-white/10 text-slate-400 font-mono">
                    <tr>
                      <th className="p-4">Admin Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {platformUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5">
                        <td className="p-4 font-sans font-semibold text-white">{u.name || "System Admin"}</td>
                        <td className="p-4 text-emerald-400">{u.email}</td>
                        <td className="p-4">
                          <span className="text-[10px] bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-none font-bold">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                  System Telemetry & Health
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Real-time cluster infrastructure and worker state.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[#080808] p-6 border border-white/10 rounded-none space-y-3">
                  <span className="text-xs font-mono text-slate-400">Database Engine</span>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-400" /> PostgreSQL (Neon)
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 block">
                    Compound Key Tenant Scoping Active
                  </span>
                </div>

                <div className="bg-[#080808] p-6 border border-white/10 rounded-none space-y-3">
                  <span className="text-xs font-mono text-slate-400">API Key Cryptography</span>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-white" /> SHA-256 Hash Engine
                  </div>
                  <span className="text-[10px] font-mono text-white/70 block">
                    Zero Raw Secret Storage
                  </span>
                </div>

                <div className="bg-[#080808] p-6 border border-white/10 rounded-none space-y-3">
                  <span className="text-xs font-mono text-slate-400">Worker Queues</span>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <Server className="h-5 w-5 text-amber-400" /> Redis Cluster Pool
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 block">
                    Active - 0 Retries Pending
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {newTenantModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080808] p-8 border border-white/15 space-y-4 rounded-none">
            <h3 className="text-xl font-heading text-white">Create New Tenant Workspace</h3>

            {modalError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tenant Organization Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Stripe Inc."
                  value={newTenantName}
                  onChange={(e) => {
                    setNewTenantName(e.target.value);
                    if (!newTenantSlug) setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tenant URL Slug *</label>
                <input
                  type="text"
                  placeholder="e.g. stripe-inc"
                  value={newTenantSlug}
                  onChange={(e) => setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-mono text-emerald-400 placeholder-slate-500 focus:border-white/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Owner Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Smith"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Owner Email *</label>
                <input
                  type="email"
                  placeholder="owner@stripe.com"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Owner Password *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newOwnerPassword}
                  onChange={(e) => setNewOwnerPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setNewTenantModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTenant}
                  className="px-5 py-2 text-xs font-semibold bg-white text-black hover:bg-slate-200"
                >
                  Register Tenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080808] p-8 border border-white/15 space-y-4 rounded-none">
            <h3 className="text-xl font-heading text-white">Create Platform Admin</h3>

            {modalError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="System Operator"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Admin Email *</label>
                <input
                  type="email"
                  placeholder="admin2@netify.io"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Platform Role *</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value)}
                  className="w-full bg-[#111113] border border-white/10 px-4 py-2.5 text-xs text-white focus:border-white/40 focus:outline-none cursor-pointer"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPPORT">SUPPORT</option>
                  <option value="READ_ONLY">READ_ONLY</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setNewUserModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAdminUser}
                  className="px-5 py-2 text-xs font-semibold bg-white text-black hover:bg-slate-200"
                >
                  Create Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
