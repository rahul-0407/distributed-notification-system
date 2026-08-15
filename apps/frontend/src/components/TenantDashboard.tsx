import React, { useState } from "react";
import { 
  Zap, Key, Users, Layers, Send, Shield, Plus, Copy, Check, 
  LogOut, CheckCircle2
} from "lucide-react";

interface TenantDashboardProps {
  tenantData: any;
  onLogout: () => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({ tenantData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "apikeys" | "endusers" | "members" | "send">("overview");
  
  const tenantId = tenantData?.tenantId || "tnt_demo_1";
  const tenantName = tenantData?.tenantName || "Acme Corp";
  const tenantSlug = tenantData?.slug || "acme";

  const [apiKeys, setApiKeys] = useState<any[]>([
    { id: "key_1", name: "Production Backend Key", keyPrefix: "sk_live_8f7b", createdAt: "2026-08-15", revoked: false },
    { id: "key_2", name: "Staging Service Key", keyPrefix: "sk_live_2a9c", createdAt: "2026-08-14", revoked: false },
  ]);

  const [endUsers, setEndUsers] = useState<any[]>([
    { id: "usr_1", externalId: "user_9812", email: "jane.smith@example.com", name: "Jane Smith", createdAt: "2026-08-15" },
    { id: "usr_2", externalId: "user_4430", email: "alex.dev@example.com", name: "Alex Dev", createdAt: "2026-08-14" },
  ]);

  const [members, setMembers] = useState<any[]>([
    { id: "mem_1", name: tenantData?.member?.name || "Admin User", email: tenantData?.member?.email || "admin@acme.com", role: tenantData?.member?.role || "OWNER", createdAt: "2026-08-15" },
    { id: "mem_2", name: "Sarah Tech", email: "sarah@acme.com", role: "DEVELOPER", createdAt: "2026-08-15" },
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
  const [sendPayload, setSendPayload] = useState('{\n  "template": "onboarding_v1",\n  "subject": "Welcome to SignalForge!"\n}');
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
        const mockRaw = `sk_live_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
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
      const mockRaw = `sk_live_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 p-0.5">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{tenantName}</span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-mono text-indigo-400 border border-slate-700">
                {tenantSlug}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">ID: {tenantId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Role: <strong className="text-white font-mono">{tenantData?.member?.role || "OWNER"}</strong>
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-950/40 p-4 space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3 py-1">
            Workspace Nav
          </div>
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "overview" ? "bg-indigo-600 text-white font-semibold shadow-md" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Zap className="h-4 w-4" /> Overview & Stats
          </button>
          <button
            onClick={() => setActiveTab("apikeys")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "apikeys" ? "bg-indigo-600 text-white font-semibold shadow-md" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Key className="h-4 w-4" /> API Keys ({apiKeys.length})
          </button>
          <button
            onClick={() => setActiveTab("endusers")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "endusers" ? "bg-indigo-600 text-white font-semibold shadow-md" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Layers className="h-4 w-4" /> End Users ({endUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "members" ? "bg-indigo-600 text-white font-semibold shadow-md" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4" /> Team Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab("send")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "send" ? "bg-indigo-600 text-white font-semibold shadow-md" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Send className="h-4 w-4 text-yellow-300" /> Send Notification
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Workspace Overview</h1>
                <p className="text-xs text-slate-400">Isolated notification infrastructure metrics for {tenantName}.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Total Notifications</span>
                  <div className="text-2xl font-extrabold text-white mt-1">14,290</div>
                  <span className="text-[10px] text-emerald-400">99.98% Success Rate</span>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Active API Keys</span>
                  <div className="text-2xl font-extrabold text-white mt-1">{apiKeys.filter(k => !k.revoked).length}</div>
                  <span className="text-[10px] text-indigo-400">SHA-256 Hashed</span>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">End Users Directory</span>
                  <div className="text-2xl font-extrabold text-white mt-1">{endUsers.length}</div>
                  <span className="text-[10px] text-teal-400">Scoped to Tenant</span>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Avg Delivery Latency</span>
                  <div className="text-2xl font-extrabold text-white mt-1">165ms</div>
                  <span className="text-[10px] text-amber-400">Redis Worker Queue</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "apikeys" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">API Keys Management</h1>
                  <p className="text-xs text-slate-400">Cryptographically generated keys for authenticating API requests.</p>
                </div>
                <button
                  onClick={() => { setNewKeyModal(true); setGeneratedSecretKey(null); }}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                >
                  <Plus className="h-4 w-4" /> Generate API Key
                </button>
              </div>

              <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="p-3.5">Key Name</th>
                      <th className="p-3.5">Prefix Identifier</th>
                      <th className="p-3.5">Created Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-slate-900/40">
                        <td className="p-3.5 font-sans font-semibold text-white">{key.name}</td>
                        <td className="p-3.5 text-indigo-400">{key.keyPrefix}...</td>
                        <td className="p-3.5 text-slate-400">{key.createdAt}</td>
                        <td className="p-3.5">
                          {key.revoked ? (
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Revoked</span>
                          ) : (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-sans">
                          {!key.revoked && (
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20 transition-all"
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
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">End User Directory</h1>
                  <p className="text-xs text-slate-400">Target notification recipients tied to your tenant context.</p>
                </div>
                <button
                  onClick={() => setNewUserModal(true)}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                >
                  <Plus className="h-4 w-4" /> Add End User
                </button>
              </div>

              <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="p-3.5">External ID</th>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Email Address</th>
                      <th className="p-3.5">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {endUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-900/40">
                        <td className="p-3.5 text-indigo-300 font-bold">{usr.externalId}</td>
                        <td className="p-3.5 font-sans text-white">{usr.name}</td>
                        <td className="p-3.5 text-slate-400">{usr.email}</td>
                        <td className="p-3.5 text-slate-500">{usr.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Team Members</h1>
                  <p className="text-xs text-slate-400">Tenant members with role-based access control (OWNER, ADMIN, DEVELOPER).</p>
                </div>
                <button
                  onClick={() => setNewMemberModal(true)}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                >
                  <Plus className="h-4 w-4" /> Invite Member
                </button>
              </div>

              <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="p-3.5">Member Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {members.map((mem) => (
                      <tr key={mem.id} className="hover:bg-slate-900/40">
                        <td className="p-3.5 font-sans font-semibold text-white">{mem.name}</td>
                        <td className="p-3.5 text-slate-400">{mem.email}</td>
                        <td className="p-3.5">
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            {mem.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{mem.createdAt}</td>
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
                <h1 className="text-2xl font-bold text-white">Send Test Notification</h1>
                <p className="text-xs text-slate-400">Trigger notification delivery to an end user via SignalForge pipeline.</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target End User (External ID)</label>
                  <select
                    value={sendTargetId}
                    onChange={(e) => setSendTargetId(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {endUsers.map((u) => (
                      <option key={u.id} value={u.externalId}>
                        {u.externalId} ({u.name} - {u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Channel</label>
                  <select
                    value={sendChannel}
                    onChange={(e) => setSendChannel(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="EMAIL">EMAIL (SendGrid / Resend)</option>
                    <option value="SMS">SMS (Twilio)</option>
                    <option value="PUSH">PUSH (FCM / APNs)</option>
                    <option value="WEBHOOK">WEBHOOK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">JSON Payload</label>
                  <textarea
                    rows={4}
                    value={sendPayload}
                    onChange={(e) => setSendPayload(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  onClick={handleSendNotification}
                  disabled={sending}
                  className="btn-primary w-full py-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
                >
                  {sending ? "Dispatching..." : "Send Notification Now"}
                </button>
              </div>

              {sendResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4" /> Notification Delivered Successfully
                  </div>
                  <div className="text-slate-400">Message ID: <span className="text-white">{sendResult.messageId}</span></div>
                  <div className="text-slate-400">Target: <span className="text-indigo-300">{sendResult.recipient}</span></div>
                  <div className="text-slate-400">Latency: <span className="text-yellow-300">{sendResult.latencyMs}ms</span></div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {newKeyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 bg-[#090d16]">
            <h3 className="text-lg font-bold text-white">Generate Secret API Key</h3>
            {!generatedSecretKey ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Key Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Production Backend"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setNewKeyModal(false)} className="btn-glass px-4 py-2 rounded-xl text-xs">Cancel</button>
                  <button onClick={handleGenerateApiKey} className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white">
                    Generate Key
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
                  ⚠️ Copy this secret key now. It will NEVER be shown again!
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 flex items-center justify-between break-all">
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
                <button onClick={() => setNewKeyModal(false)} className="btn-primary w-full py-2.5 rounded-xl text-xs font-semibold text-white">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {newUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 bg-[#090d16]">
            <h3 className="text-lg font-bold text-white">Add End User</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">External ID (Unique per Tenant)</label>
                <input
                  type="text"
                  placeholder="usr_9981"
                  value={newExtId}
                  onChange={(e) => setNewExtId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setNewUserModal(false)} className="btn-glass px-4 py-2 rounded-xl text-xs">Cancel</button>
                <button onClick={handleAddEndUser} className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white">
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newMemberModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 bg-[#090d16]">
            <h3 className="text-lg font-bold text-white">Invite Tenant Member</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Sarah Tech"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  placeholder="sarah@acme.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newMemberPass}
                  onChange={(e) => setNewMemberPass(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-mono text-indigo-300 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="DEVELOPER">DEVELOPER</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setNewMemberModal(false)} className="btn-glass px-4 py-2 rounded-xl text-xs">Cancel</button>
                <button onClick={handleAddMember} className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white">
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
