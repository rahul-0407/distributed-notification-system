import React from "react";

interface ChangelogPageProps {
  navigate: (view: string) => void;
}

export const ChangelogPage: React.FC<ChangelogPageProps> = () => {
  const releases = [
    {
      version: "v1.0.0",
      date: "August 15, 2026",
      title: "Initial Launch — Multi-Tenant Notification Core",
      changes: [
        "Architected multi-tenant isolation utilizing Prisma compound keys (@@unique([tenantId, externalId]))",
        "Implemented cryptographic API key authentication stored with SHA-256 hashes",
        "Added standardized AppError middleware returning typed JSON error responses",
        "Integrated Express proxy router with Vite frontend dev server"
      ]
    },
    {
      version: "v0.9.0",
      date: "August 10, 2026",
      title: "Beta Control Plane & Express Routers",
      changes: [
        "Added dedicated tenant management endpoints (/api/v1/tenants/signup, /auth/login)",
        "Added super-admin user endpoints (/api/v1/users)",
        "Configured Redis queue worker pools for asynchronous notification delivery"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      <div className="space-y-3 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold text-white">Changelog & System History</h1>
        <p className="text-slate-400 text-sm">Follow product updates, architecture changes, and release notes.</p>
      </div>

      <div className="space-y-8">
        {releases.map((rel, idx) => (
          <div key={idx} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-indigo-600 text-white px-3 py-1 rounded-full">{rel.version}</span>
                <h3 className="text-lg font-bold text-white">{rel.title}</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">{rel.date}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {rel.changes.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold select-none">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
