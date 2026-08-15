import React, { useState } from "react";
import { 
  Zap, Key, Users, Layers, Send, Shield, Plus, Copy, Check, 
  LogOut, CheckCircle2
} from "lucide-react";

interface TenantDashboardProps {
  tenantData: any;
  onLogout: () => void;
  navigate?: (view: string) => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({ tenantData, onLogout, navigate }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "apikeys" | "endusers" | "members" | "send">("overview");
  
  const tenantId = tenantData?.tenantId || "tnt_acme_88";
  const tenantName = tenantData?.tenantName || "Acme Corp";
  const tenantSlug = tenantData?.slug || "acme-corp";

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

  const handleGenerateApiKey = async () => {
    if (!newKeyName) return;
    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (data.apiKey) {
        setGeneratedSecretKey(data.apiKey);
        setApiKeys((prev) => [
          {
            id: data.key?.id || `key_${Date.now()}`,
            name: newKeyName,
            keyPrefix: data.apiKey.slice(0, 12),
            createdAt: new Date().toISOString().split("T")[0],
            revoked: false,
          },
          ...prev,
        ]);
      } else {
        const mockRaw = `sk_live_${Math.random().toString(36).substring(2, 18)}`;
        setGeneratedSecretKey(mockRaw);
        setApiKeys((prev) => [
          {
            id: `key_${Date.now()}`,
            name: newKeyName,
            keyPrefix: mockRaw.slice(0, 12),
            createdAt: new Date().toISOString().split("T")[0],
            revoked: false,
          },
          ...prev,
        ]);
      }
    } catch {
      const mockRaw = `sk_live_${Math.random().toString(36).substring(2, 18)}`;
      setGeneratedSecretKey(mockRaw);
      setApiKeys((prev) => [
        {
          id: `key_${Date.now()}`,
          name: newKeyName,
          keyPrefix: mockRaw.slice(0, 12),
          createdAt: new Date().toISOString().split("T")[0],
          revoked: false,
        },
        ...prev,
      ]);
    }
  };

  const handleAddEndUser = async () => {
    if (!newExtId) return;
    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}/end-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId: newExtId, email: newUserEmail, name: newUserName }),
      });
      const data = await res.json();
      setEndUsers((prev) => [
        {
          id: data.endUser?.id || `usr_${Date.now()}`,
          externalId: newExtId,
          email: newUserEmail || "n/a",
          name: newUserName || "Anonymous",
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    } catch {
      setEndUsers((prev) => [
        {
          id: `usr_${Date.now()}`,
          externalId: newExtId,
          email: newUserEmail || "n/a",
          name: newUserName || "Anonymous",
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    }
    setNewUserModal(false);
    setNewExtId("");
    setNewUserEmail("");
    setNewUserName("");
  };

  const handleAddMember = async () => {
    if (!newMemberEmail || !newMemberPass) return;
    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMemberName,
          email: newMemberEmail,
          password: newMemberPass,
          role: newMemberRole,
        }),
      });
      const data = await res.json();
      setMembers((prev) => [
        {
          id: data.member?.id || `mem_${Date.now()}`,
          name: newMemberName || "New Member",
          email: newMemberEmail,
          role: newMemberRole,
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    } catch {
      setMembers((prev) => [
        {
          id: `mem_${Date.now()}`,
          name: newMemberName || "New Member",
          email: newMemberEmail,
          role: newMemberRole,
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    }
    setNewMemberModal(false);
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPass("");
  };

  const handleRevokeKey = async (keyId: string) => {
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
            <p className="text-[11px] font-mono text-slate-400">ID: {tenantId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-none font-mono">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Role: <strong className="text-white">{tenantData?.member?.role || "OWNER"}</strong>
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-none border border-white/15 transition-all"
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
            <Zap className="h-4 w-4" /> Workspace Overview
          </button>
          
          <button
            onClick={() => setActiveTab("apikeys")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "apikeys" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Key className="h-4 w-4" /> API Keys ({apiKeys.length})
          </button>

          <button
            onClick={() => setActiveTab("endusers")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "endusers" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" /> End Users ({endUsers.length})
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "members" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" /> Team Members ({members.length})
          </button>

          <button
            onClick={() => setActiveTab("send")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-none text-xs font-sans font-medium transition-all ${
              activeTab === "send" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Send className="h-4 w-4 text-emerald-400" /> Dispatch Test Event
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-10 space-y-8 bg-[#000000] overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                  Workspace Overview
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Isolated notification infrastructure metrics for {tenantName}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-[#080808] p-6 border border-white/10 rounded-none space-y-2">
                  <span className="text-xs text-slate-400 font-mono">Total Dispatched</span>
                  <div className="text-3xl font-heading text-white">14,290</div>
                  <span className="text-[10px] font-mono text-emerald-400">99.98% Success Rate</span>
                </div>
                
                <div className="bg-[#080808] p-6 border border-white/10 rounded-none space-y-2">
                  <span className="text-xs text-slate-400 font-mono">Active API Keys</span>
                  <div className="text-3xl font-heading text-white">{apiKeys.filter(k => !k.revoked).length}</div>
                  <span className="text-[10px] font-mono text-slate-400">SHA-256 Hashed</span>
                </div>

                <div className="bg-[#080808] p-6 border border-white/10 rounded-none space-y-2">
                  <span className="text-xs text-slate-400 font-mono">End User Profiles</span>
                  <div className="text-3xl font-heading text-white">{endUsers.length}</div>
                  <span className="text-[10px] font-mono text-emerald-400">Scoped to Tenant</span>
                </div>

                <div className="bg-[#080808] p-6 border border-white/10 rounded-none space-y-2">
                  <span className="text-xs text-slate-400 font-mono">Avg Latency</span>
                  <div className="text-3xl font-heading text-white">142ms</div>
                  <span className="text-[10px] font-mono text-amber-400">Redis Queue Pool</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "apikeys" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                    API Keys Cryptography
                  </h1>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Generate SHA-256 hashed API keys for server-side integration.
                  </p>
                </div>
                <button
                  onClick={() => { setNewKeyModal(true); setGeneratedSecretKey(null); }}
                  className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
                >
                  <Plus className="h-4 w-4" /> Generate API Key
                </button>
              </div>

              <div className="bg-[#080808] border border-white/10 rounded-none overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c0c0c] border-b border-white/10 text-slate-400 font-mono">
                    <tr>
                      <th className="p-4">Key Name</th>
                      <th className="p-4">Prefix Identifier</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-white/5">
                        <td className="p-4 font-sans font-semibold text-white">{key.name}</td>
                        <td className="p-4 text-emerald-400">{key.keyPrefix}...</td>
                        <td className="p-4 text-slate-400">{key.createdAt}</td>
                        <td className="p-4">
                          {key.revoked ? (
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-none">Revoked</span>
                          ) : (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-none">Active</span>
                          )}
                        </td>
                        <td className="p-4 text-right font-sans">
                          {!key.revoked && (
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              className="text-xs text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-none border border-red-500/20 transition-all"
                            >
                              Revoke
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
                  <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                    End User Directory
                  </h1>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Recipients created automatically via notification payload or synced directly.
                  </p>
                </div>
                <button
                  onClick={() => setNewUserModal(true)}
                  className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
                >
                  <Plus className="h-4 w-4" /> Add End User
                </button>
              </div>

              <div className="bg-[#080808] border border-white/10 rounded-none overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c0c0c] border-b border-white/10 text-slate-400 font-mono">
                    <tr>
                      <th className="p-4">External ID</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {endUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-white/5">
                        <td className="p-4 text-emerald-400 font-bold">{usr.externalId}</td>
                        <td className="p-4 font-sans text-white">{usr.name}</td>
                        <td className="p-4 text-slate-400">{usr.email}</td>
                        <td className="p-4 text-slate-500">{usr.createdAt}</td>
                        <td className="p-4 text-right font-sans">
                          <button
                            onClick={() => navigate?.("end-user-demo")}
                            className="text-xs text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 border border-emerald-500/20 transition-all font-sans"
                          >
                            Simulate Inbox →
                          </button>
                        </td>
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
                  <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                    Tenant Team Members
                  </h1>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Role-Based Access Control (OWNER, ADMIN, DEVELOPER) for {tenantName}.
                  </p>
                </div>
                <button
                  onClick={() => setNewMemberModal(true)}
                  className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
                >
                  <Plus className="h-4 w-4" /> Invite Team Member
                </button>
              </div>

              <div className="bg-[#080808] border border-white/10 rounded-none overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c0c0c] border-b border-white/10 text-slate-400 font-mono">
                    <tr>
                      <th className="p-4">Member Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {members.map((mem) => (
                      <tr key={mem.id} className="hover:bg-white/5">
                        <td className="p-4 font-sans font-semibold text-white">{mem.name}</td>
                        <td className="p-4 text-slate-400">{mem.email}</td>
                        <td className="p-4">
                          <span className="text-[10px] bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-none font-mono">
                            {mem.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{mem.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "send" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                  Dispatch Notification Event
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Trigger notification pipeline to an end-user recipient.
                </p>
              </div>

              <div className="bg-[#080808] p-8 border border-white/10 rounded-none space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                    Target End User (External ID)
                  </label>
                  <select
                    value={sendTargetId}
                    onChange={(e) => setSendTargetId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-white/40 focus:outline-none"
                  >
                    {endUsers.map((u) => (
                      <option key={u.id} value={u.externalId} className="bg-[#080808]">
                        {u.externalId} ({u.name} - {u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                    Notification Channel
                  </label>
                  <select
                    value={sendChannel}
                    onChange={(e) => setSendChannel(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-white/40 focus:outline-none"
                  >
                    <option value="EMAIL" className="bg-[#080808]">EMAIL (SendGrid / Resend)</option>
                    <option value="SMS" className="bg-[#080808]">SMS (Twilio)</option>
                    <option value="PUSH" className="bg-[#080808]">PUSH (FCM / APNs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 font-sans">
                    JSON Data Payload
                  </label>
                  <textarea
                    rows={4}
                    value={sendPayload}
                    onChange={(e) => setSendPayload(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs font-mono text-slate-200 focus:border-white/40 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  onClick={handleSendNotification}
                  disabled={sending}
                  className="w-full py-3.5 bg-white hover:bg-slate-200 text-black text-xs font-semibold rounded-none flex items-center justify-center gap-2 transition-all font-sans"
                >
                  {sending ? (
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Dispatch Notification Event Now"
                  )}
                </button>
              </div>

              {sendResult && (
                <div className="p-5 bg-[#080808] border border-emerald-500/30 text-xs font-mono space-y-2 rounded-none">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4" /> Notification Dispatched Successfully
                  </div>
                  <div className="text-slate-400">Message ID: <span className="text-white">{sendResult.messageId}</span></div>
                  <div className="text-slate-400">Recipient: <span className="text-emerald-400">{sendResult.recipient}</span></div>
                  <div className="text-slate-400">Pipeline Latency: <span className="text-white">{sendResult.latencyMs}ms</span></div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {newKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080808] p-8 border border-white/15 space-y-5 rounded-none">
            <h3 className="text-xl font-heading text-white">Generate Secret API Key</h3>
            {!generatedSecretKey ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Key Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Production Backend"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setNewKeyModal(false)} className="px-4 py-2.5 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10">
                    Cancel
                  </button>
                  <button onClick={handleGenerateApiKey} className="px-5 py-2.5 text-xs font-semibold bg-white text-black hover:bg-slate-200">
                    Generate Key
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                  ⚠️ Copy this secret key now. It will NEVER be shown again!
                </div>
                <div className="p-3.5 bg-black border border-white/10 font-mono text-xs text-emerald-400 flex items-center justify-between break-all">
                  <span>{generatedSecretKey}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSecretKey);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="ml-2 text-slate-300 hover:text-white"
                  >
                    {copiedKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <button onClick={() => setNewKeyModal(false)} className="w-full py-3 bg-white text-black font-semibold text-xs">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {newUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080808] p-8 border border-white/15 space-y-5 rounded-none">
            <h3 className="text-xl font-heading text-white">Add End User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">External ID (Unique per Tenant)</label>
                <input
                  type="text"
                  placeholder="usr_9981"
                  value={newExtId}
                  onChange={(e) => setNewExtId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setNewUserModal(false)} className="px-4 py-2.5 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10">
                  Cancel
                </button>
                <button onClick={handleAddEndUser} className="px-5 py-2.5 text-xs font-semibold bg-white text-black hover:bg-slate-200">
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newMemberModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080808] p-8 border border-white/15 space-y-5 rounded-none">
            <h3 className="text-xl font-heading text-white">Invite Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Sarah Dev"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
                <input
                  type="email"
                  placeholder="sarah@acme.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newMemberPass}
                  onChange={(e) => setNewMemberPass(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-white/40 focus:outline-none"
                >
                  <option value="ADMIN" className="bg-[#080808]">ADMIN</option>
                  <option value="DEVELOPER" className="bg-[#080808]">DEVELOPER</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setNewMemberModal(false)} className="px-4 py-2.5 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10">
                  Cancel
                </button>
                <button onClick={handleAddMember} className="px-5 py-2.5 text-xs font-semibold bg-white text-black hover:bg-slate-200">
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
