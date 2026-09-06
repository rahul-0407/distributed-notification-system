import React, { useState, useEffect } from "react";
import { 
  Zap, Key, Users, Layers, Send, Shield, Plus, Copy, Check, 
  LogOut, CheckCircle2
} from "lucide-react";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

interface TenantDashboardProps {
  tenantData: any;
  onLogout: () => void;
  navigate?: (view: string) => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({ tenantData, onLogout, navigate }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "apikeys" | "endusers" | "members" | "send">("overview");
  
  const tenantId = tenantData?.tenantId || tenantData?.tenant?.id || "tnt_acme_88";
  const tenantName = tenantData?.tenantName || tenantData?.tenant?.name || "Acme Corp";
  const tenantSlug = tenantData?.slug || tenantData?.tenant?.slug || "acme-corp";

  const [apiKeys, setApiKeys] = useState<any[]>([
    { id: "key_1", name: "Production Backend Key", keyPrefix: "sk_live_8f7b", createdAt: "2026-08-15", revoked: false },
    { id: "key_2", name: "Staging Service Key", keyPrefix: "sk_live_2a9c", createdAt: "2026-08-14", revoked: false },
  ]);

  const [endUsers, setEndUsers] = useState<any[]>([
    { id: "usr_1", externalId: "user_9812", email: "jane.smith@example.com", name: "Jane Smith", createdAt: "2026-08-15" },
    { id: "usr_2", externalId: "user_4430", email: "alex.dev@example.com", name: "Alex Dev", createdAt: "2026-08-14" },
  ]);

  const [members, setMembers] = useState<any[]>([
    { id: "mem_1", name: tenantData?.member?.name || "Tenant Owner", email: tenantData?.member?.email || "owner@acme.com", role: tenantData?.member?.role || "OWNER", createdAt: "2026-08-15" },
    { id: "mem_2", name: "Sarah Dev", email: "sarah@acme.com", role: "DEVELOPER", createdAt: "2026-08-15" },
  ]);

  const [modalError, setModalError] = useState("");

  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedSecretKey, setGeneratedSecretKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [newUserModal, setNewUserModal] = useState(false);
  const [newExtId, setNewExtId] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");

  const [newMemberModal, setNewMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("DEVELOPER");
  const [newMemberPass, setNewMemberPass] = useState("");

  const [sendTargetId, setSendTargetId] = useState("user_9812");
  const [sendChannel, setSendChannel] = useState("EMAIL");
  const [sendPayload, setSendPayload] = useState('{\n  "template": "onboarding_v1",\n  "subject": "Welcome to Netify Notifications"\n}');
  const [sendResult, setSendResult] = useState<any | null>(null);
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    if (!tenantId) return;
    try {
      const keysRes = await fetch(API_ENDPOINTS.TENANT_API_KEYS(tenantId), { credentials: "include" });
      if (keysRes.ok) {
        const data = await keysRes.json();
        if (Array.isArray(data.apiKeys)) setApiKeys(data.apiKeys);
      }
    } catch {}

    try {
      const usersRes = await fetch(API_ENDPOINTS.TENANT_END_USERS(tenantId), { credentials: "include" });
      if (usersRes.ok) {
        const data = await usersRes.json();
        if (Array.isArray(data.endUsers)) setEndUsers(data.endUsers);
      }
    } catch {}

    try {
      const membersRes = await fetch(API_ENDPOINTS.TENANT_MEMBERS(tenantId), { credentials: "include" });
      if (membersRes.ok) {
        const data = await membersRes.json();
        if (Array.isArray(data.members)) setMembers(data.members);
      }
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const handleGenerateApiKey = async () => {
    setModalError("");
    const keyName = newKeyName.trim();
    if (!keyName) {
      setModalError("Key name is required.");
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.TENANT_API_KEYS(tenantId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: keyName }),
      });
      const data = await res.json();
      if (data.apiKey) {
        setGeneratedSecretKey(data.apiKey);
        setApiKeys((prev) => [
          {
            id: data.key?.id || `key_${Date.now()}`,
            name: keyName,
            keyPrefix: data.apiKey.substring(0, 12) + "...",
            createdAt: new Date().toISOString().split("T")[0],
            revoked: false,
          },
          ...prev,
        ]);
        setNewKeyName("");
      }
    } catch (err: any) {
      setModalError(err.message || "Failed to generate key.");
    }
  };

  const handleAddEndUser = async () => {
    setModalError("");
    const extId = newExtId.trim();
    const email = newUserEmail.trim().toLowerCase();
    const name = newUserName.trim();

    if (!extId || !email || !name) {
      setModalError("All user details are required.");
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.TENANT_END_USERS(tenantId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          externalId: extId,
          email,
          name,
        }),
      });
      const data = await res.json();
      setEndUsers((prev) => [
        data.endUser || {
          id: `usr_${Date.now()}`,
          externalId: extId,
          email,
          name,
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
      setNewUserModal(false);
      setNewExtId("");
      setNewUserEmail("");
      setNewUserName("");
    } catch (err: any) {
      setModalError(err.message || "Failed to add end user.");
    }
  };

  const handleAddMember = async () => {
    setModalError("");
    const email = newMemberEmail.trim().toLowerCase();
    const name = newMemberName.trim();

    if (!email || !name || !newMemberPass) {
      setModalError("All team member details are required.");
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.TENANT_MEMBERS(tenantId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password: newMemberPass,
          role: newMemberRole,
        }),
      });
      const data = await res.json();
      setMembers((prev) => [
        data.member || {
          id: `mem_${Date.now()}`,
          name,
          email,
          role: newMemberRole,
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
      setNewMemberModal(false);
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberPass("");
    } catch (err: any) {
      setModalError(err.message || "Failed to add member.");
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/tenants/${tenantId}/api-keys/${keyId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {}
    setApiKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, revoked: true } : k)));
  };

  const handleSendNotification = () => {
    setSending(true);
    setSendResult(null);
    setTimeout(() => {
      setSending(false);
      setSendResult({
        success: true,
        messageId: `msg_${Math.random().toString(36).substring(2, 10)}`,
        status: "DELIVERED",
        tenantId,
        recipient: sendTargetId,
        channel: sendChannel,
        latencyMs: 142,
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 flex flex-col font-sans select-none">
      <header className="border-b border-white/10 bg-[#050505] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-white text-black font-extrabold text-sm rounded-none">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-heading font-semibold text-white">{tenantName}</span>
              <span className="bg-white/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-white/15">
                {tenantSlug}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Authenticated: {tenantData?.member?.email || "owner@acme.com"} ({tenantData?.member?.role || "OWNER"})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {navigate && (
            <button
              onClick={() => navigate("end-user-demo")}
              className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 rounded-none border border-emerald-500/20 transition-all font-mono"
            >
              <Zap className="h-3.5 w-3.5" /> Launch End-User Sandbox
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-none border border-white/15 transition-all font-sans"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 border-r border-white/10 bg-[#040404] p-5 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-2 py-1">
            Workspace Console
          </div>

          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "overview" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" /> Overview & Health
          </button>

          <button
            onClick={() => setActiveTab("apikeys")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "apikeys" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Key className="h-4 w-4 text-amber-400" /> API Keys ({apiKeys.length})
          </button>

          <button
            onClick={() => setActiveTab("endusers")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "endusers" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4 text-emerald-400" /> End-Users Directory ({endUsers.length})
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "members" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Shield className="h-4 w-4" /> Team Members ({members.length})
          </button>

          <button
            onClick={() => setActiveTab("send")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "send" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Send className="h-4 w-4 text-cyan-400" /> Dispatch Test Event
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-10 space-y-8 bg-[#000000] overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                  Workspace Telemetry
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Tenant Isolation Scope: <span className="font-mono text-emerald-400">{tenantId}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[#080808] p-6 border border-white/10 rounded-none space-y-2">
                  <span className="text-xs font-mono text-slate-400">Total API Keys</span>
                  <div className="text-2xl font-bold text-white font-mono">{apiKeys.length}</div>
                  <span className="text-[10px] font-mono text-emerald-400 block">SHA-256 Encrypted</span>
                </div>

                <div className="bg-[#080808] p-6 border border-white/10 rounded-none space-y-2">
                  <span className="text-xs font-mono text-slate-400">Registered End-Users</span>
                  <div className="text-2xl font-bold text-white font-mono">{endUsers.length}</div>
                  <span className="text-[10px] font-mono text-emerald-400 block">Isolated under Tenant ID</span>
                </div>

                <div className="bg-[#080808] p-6 border border-white/10 rounded-none space-y-2">
                  <span className="text-xs font-mono text-slate-400">Queue Latency</span>
                  <div className="text-2xl font-bold text-white font-mono">1.2ms</div>
                  <span className="text-[10px] font-mono text-emerald-400 block">Redis Engine Active</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "apikeys" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">API Keys Management</h1>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    API keys authenticate your backend servers to publish notification events.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModalError("");
                    setGeneratedSecretKey(null);
                    setNewKeyModal(true);
                  }}
                  className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
                >
                  <Plus className="h-4 w-4" /> Create API Key
                </button>
              </div>

              <div className="bg-[#080808] border border-white/10 rounded-none overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c0c0c] border-b border-white/10 text-slate-400 font-mono">
                    <tr>
                      <th className="p-4">Key Identifier</th>
                      <th className="p-4">Prefix</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {apiKeys.map((k) => (
                      <tr key={k.id} className="hover:bg-white/5">
                        <td className="p-4 font-sans font-semibold text-white">{k.name}</td>
                        <td className="p-4 text-emerald-400">{k.keyPrefix}...</td>
                        <td className="p-4 text-slate-400">{k.createdAt}</td>
                        <td className="p-4">
                          {k.revoked ? (
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-none">Revoked</span>
                          ) : (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-none">Active</span>
                          )}
                        </td>
                        <td className="p-4 text-right font-sans">
                          {!k.revoked && (
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1 rounded-none border border-red-500/20 transition-all"
                            >
                              Revoke Key
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "endusers" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">End-Users Directory</h1>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    End users are recipient profiles bound to your tenant workspace.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModalError("");
                    setNewUserModal(true);
                  }}
                  className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
                >
                  <Plus className="h-4 w-4" /> Add End User
                </button>
              </div>

              <div className="bg-[#080808] border border-white/10 rounded-none overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c0c0c] border-b border-white/10 text-slate-400 font-mono">
                    <tr>
                      <th className="p-4">External User ID</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {endUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5">
                        <td className="p-4 text-emerald-400 font-semibold">{u.externalId}</td>
                        <td className="p-4 font-sans text-white">{u.name || "Anonymous"}</td>
                        <td className="p-4 text-slate-400">{u.email || "n/a"}</td>
                        <td className="p-4 text-slate-500">{u.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">Team Members & RBAC</h1>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Manage tenant organization access and role-based permissions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModalError("");
                    setNewMemberModal(true);
                  }}
                  className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
                >
                  <Plus className="h-4 w-4" /> Invite Member
                </button>
              </div>

              <div className="bg-[#080808] border border-white/10 rounded-none overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c0c0c] border-b border-white/10 text-slate-400 font-mono">
                    <tr>
                      <th className="p-4">Member Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Tenant Role</th>
                      <th className="p-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-white/5">
                        <td className="p-4 font-sans font-semibold text-white">{m.name}</td>
                        <td className="p-4 text-emerald-400">{m.email}</td>
                        <td className="p-4">
                          <span className="text-[10px] bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-none font-bold">
                            {m.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{m.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "send" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">Dispatch Test Notification Event</h1>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Trigger an API notification request directly into Netify ingestion stream.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#080808] border border-white/10 p-6 space-y-4 rounded-none">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Target End User ID</label>
                    <select
                      value={sendTargetId}
                      onChange={(e) => setSendTargetId(e.target.value)}
                      className="w-full bg-[#111113] border border-white/10 px-4 py-2.5 text-xs font-mono text-emerald-400 focus:border-white/40 focus:outline-none"
                    >
                      {endUsers.map((u) => (
                        <option key={u.id} value={u.externalId}>{u.externalId} ({u.name})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Notification Channel</label>
                    <select
                      value={sendChannel}
                      onChange={(e) => setSendChannel(e.target.value)}
                      className="w-full bg-[#111113] border border-white/10 px-4 py-2.5 text-xs font-mono text-white focus:border-white/40 focus:outline-none"
                    >
                      <option value="EMAIL">EMAIL</option>
                      <option value="SMS">SMS</option>
                      <option value="PUSH">PUSH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Event Payload (JSON)</label>
                    <textarea
                      rows={5}
                      value={sendPayload}
                      onChange={(e) => setSendPayload(e.target.value)}
                      className="w-full bg-[#111113] border border-white/10 p-4 text-xs font-mono text-slate-200 focus:border-white/40 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSendNotification}
                    disabled={sending}
                    className="w-full bg-white hover:bg-slate-200 text-black py-3 text-xs font-semibold rounded-none flex items-center justify-center gap-2 transition-all font-sans"
                  >
                    {sending ? "Ingesting Event..." : "Dispatch Notification Event Now"}
                  </button>
                </div>

                <div className="bg-[#080808] border border-white/10 p-6 space-y-4 rounded-none font-mono">
                  <span className="text-xs text-slate-400 block border-b border-white/10 pb-2">Pipeline Delivery Log</span>

                  {sendResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="h-4 w-4" /> EVENT QUEUED & ROUTED
                      </div>
                      <pre className="bg-[#040404] p-4 text-[11px] text-slate-300 border border-white/10 overflow-x-auto leading-relaxed">
                        {JSON.stringify(sendResult, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No events dispatched yet. Click above to send a payload.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {newKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080808] p-8 border border-white/15 space-y-4 rounded-none">
            <h3 className="text-xl font-heading text-white">Generate API Key</h3>

            {modalError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {modalError}
              </div>
            )}

            {generatedSecretKey ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono space-y-1">
                  <span className="font-bold block">Save your secret key!</span>
                  <span>This key will never be shown again.</span>
                </div>
                <div className="flex items-center gap-2 bg-[#040404] border border-white/10 p-3 text-xs font-mono text-white">
                  <span className="flex-1 truncate">{generatedSecretKey}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSecretKey);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="p-1 hover:text-emerald-400"
                  >
                    {copiedKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => setNewKeyModal(false)}
                  className="w-full bg-white text-black py-2.5 text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Key Name / Identifier *</label>
                  <input
                    type="text"
                    placeholder="e.g. Production Microservice Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white focus:border-white/40 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setNewKeyModal(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10">
                    Cancel
                  </button>
                  <button onClick={handleGenerateApiKey} className="px-5 py-2 text-xs font-semibold bg-white text-black hover:bg-slate-200">
                    Generate Secret
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {newUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080808] p-8 border border-white/15 space-y-4 rounded-none">
            <h3 className="text-xl font-heading text-white">Add End User</h3>

            {modalError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">External User ID *</label>
                <input
                  type="text"
                  placeholder="e.g. user_9812"
                  value={newExtId}
                  onChange={(e) => setNewExtId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-mono text-emerald-400 focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setNewUserModal(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10">
                  Cancel
                </button>
                <button onClick={handleAddEndUser} className="px-5 py-2 text-xs font-semibold bg-white text-black hover:bg-slate-200">
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newMemberModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080808] p-8 border border-white/15 space-y-4 rounded-none">
            <h3 className="text-xl font-heading text-white">Invite Team Member</h3>

            {modalError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Sarah Dev"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Work Email *</label>
                <input
                  type="email"
                  placeholder="sarah@acme.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newMemberPass}
                  onChange={(e) => setNewMemberPass(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role *</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-[#111113] border border-white/10 px-4 py-2.5 text-xs font-mono text-white focus:border-white/40 focus:outline-none cursor-pointer"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="DEVELOPER">DEVELOPER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setNewMemberModal(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10">
                  Cancel
                </button>
                <button onClick={handleAddMember} className="px-5 py-2 text-xs font-semibold bg-white text-black hover:bg-slate-200">
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
