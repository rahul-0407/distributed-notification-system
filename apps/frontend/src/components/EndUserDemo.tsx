import React, { useState, useEffect } from "react";
import { Bell, Mail, Smartphone, ArrowLeft, CheckCircle2, ShoppingBag, Key, CreditCard, Sparkles, Check } from "lucide-react";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

interface EndUserDemoProps {
  navigate: (view: string) => void;
}

export const EndUserDemo: React.FC<EndUserDemoProps> = ({ navigate }) => {
  const [selectedChannel, setSelectedChannel] = useState<"inapp" | "email" | "sms">("inapp");
  const [firingEvent, setFiringEvent] = useState<string | null>(null);
  const [lastEventToast, setLastEventToast] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "ntf_1001",
      title: "Welcome to Acme Corp!",
      body: "Your user profile user_9812 has been synced. Notifications will land here.",
      timestamp: "Just now",
      read: false,
      channel: "EMAIL",
      sender: "Acme Notification Engine",
    },
    {
      id: "ntf_1002",
      title: "Security Alert: API Key Active",
      body: "Tenant acme-corp stream backend key sk_live_8f7b is active.",
      timestamp: "5 mins ago",
      read: true,
      channel: "PUSH",
      sender: "Netify Stream Pipeline",
    },
  ]);

  const [smsMessages, setSmsMessages] = useState<any[]>([
    { id: "sms_1", text: "[Netify] Your 2FA security code is 894-201. Valid for 5 minutes.", time: "10 mins ago" }
  ]);

  const [pushMessages, setPushMessages] = useState<any[]>([
    { id: "push_1", title: "Acme Order Shipped", body: "Package #9921 is out for delivery via FedEx.", time: "1 hour ago" }
  ]);

  const fetchUserNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/analytics/notifications/user/user_9812/notifications`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications) && data.notifications.length > 0) {
          const mapped = data.notifications.map((n: any) => ({
            id: n.id,
            title: n.title,
            body: n.body,
            timestamp: new Date(n.createdAt).toLocaleTimeString(),
            read: n.status === "SENT",
            channel: n.eventType?.includes("2FA") ? "SMS" : n.eventType?.includes("SUB") ? "PUSH" : "EMAIL",
            sender: n.tenantId || "Netify System",
          }));
          setNotifications(mapped);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchUserNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSimulateEndUserAction = async (actionType: "ORDER" | "2FA" | "SUBSCRIPTION") => {
    setFiringEvent(actionType);

    let eventPayload: any = {};
    let notificationItem: any = {};

    if (actionType === "ORDER") {
      eventPayload = {
        tenantId: "tnt_acme_88",
        userId: "user_9812",
        eventType: "ORDER_PLACED",
        title: "Order #9942 Confirmed! ($89.00)",
        body: "Thank you for buying. Your payment of $89.00 was processed.",
        channels: ["EMAIL"],
      };
      notificationItem = {
        id: `ntf_${Date.now()}`,
        title: "Order #9942 Confirmed! ($89.00)",
        body: "Thank you for buying. Your payment of $89.00 was processed.",
        timestamp: "Just now",
        read: false,
        channel: "EMAIL",
        sender: "Acme Store Backend",
      };
    } else if (actionType === "2FA") {
      const code = Math.floor(100000 + Math.random() * 900000);
      eventPayload = {
        tenantId: "tnt_acme_88",
        userId: "user_9812",
        eventType: "AUTH_2FA",
        title: `Security Code: ${code}`,
        body: `[Netify] Your login verification code is ${code}.`,
        channels: ["SMS"],
      };
      notificationItem = {
        id: `ntf_${Date.now()}`,
        title: `Security Code: ${code}`,
        body: `[Netify] Your login verification code is ${code}.`,
        timestamp: "Just now",
        read: false,
        channel: "SMS",
        sender: "Acme Auth Service",
      };
      setSmsMessages((prev) => [{ id: `sms_${Date.now()}`, text: `[Netify] Your 2FA security code is ${code}. Valid for 5 minutes.`, time: "Just now" }, ...prev]);
    } else if (actionType === "SUBSCRIPTION") {
      eventPayload = {
        tenantId: "tnt_acme_88",
        userId: "user_9812",
        eventType: "SUB_RENEWED",
        title: "Pro Plan Renewed Successfully",
        body: "Your monthly subscription renewed for $49/mo. Invoice #INV-4029.",
        channels: ["PUSH"],
      };
      notificationItem = {
        id: `ntf_${Date.now()}`,
        title: "Pro Plan Renewed Successfully",
        body: "Your monthly subscription renewed for $49/mo. Invoice #INV-4029.",
        timestamp: "Just now",
        read: false,
        channel: "PUSH",
        sender: "Acme Billing Engine",
      };
      setPushMessages((prev) => [{ id: `push_${Date.now()}`, title: "Pro Plan Renewed Successfully", body: "Subscription active. Invoice #INV-4029 issued.", time: "Just now" }, ...prev]);
    }

    try {
      await fetch(API_ENDPOINTS.NOTIFICATIONS_DISPATCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      });
    } catch {}

    setTimeout(() => {
      setNotifications((prev) => [notificationItem, ...prev]);
      setFiringEvent(null);
      setLastEventToast(`Event '${eventPayload.eventType}' produced to Kafka stream & routed to Jane Smith!`);
      setTimeout(() => setLastEventToast(null), 4000);
      fetchUserNotifications();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 font-sans flex flex-col select-none">
      <header className="border-b border-white/10 bg-[#050505] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("home")}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-base font-heading font-semibold text-white flex items-center gap-2">
              End User Notification Simulator
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono">
                Jane Smith (user_9812)
              </span>
            </span>
            <p className="text-[11px] font-mono text-slate-400">
              Simulating end-user actions → Kafka Stream → Netify Queue → Recipient Inbox
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 border border-white/15 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Mark All Read
          </button>
        </div>
      </header>

      <div className="bg-[#080808] border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Trigger Real End-User Action (Event Producer)
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Click any button below to simulate Jane Smith performing an action on Acme's app:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleSimulateEndUserAction("ORDER")}
              disabled={firingEvent !== null}
              className="bg-white hover:bg-slate-200 text-black px-3.5 py-2 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
            >
              {firingEvent === "ORDER" ? (
                <div className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ShoppingBag className="h-3.5 w-3.5" />
              )}
              1. Place Order ($89.00)
            </button>

            <button
              onClick={() => handleSimulateEndUserAction("2FA")}
              disabled={firingEvent !== null}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
            >
              {firingEvent === "2FA" ? (
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Key className="h-3.5 w-3.5 text-amber-400" />
              )}
              2. Request 2FA Code
            </button>

            <button
              onClick={() => handleSimulateEndUserAction("SUBSCRIPTION")}
              disabled={firingEvent !== null}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 text-xs font-semibold rounded-none flex items-center gap-2 transition-all font-sans"
            >
              {firingEvent === "SUBSCRIPTION" ? (
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CreditCard className="h-3.5 w-3.5 text-cyan-400" />
              )}
              3. Renew Subscription
            </button>
          </div>
        </div>

        {lastEventToast && (
          <div className="max-w-6xl mx-auto mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fade-in">
            <Check className="h-4 w-4" /> {lastEventToast}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 border-r border-white/10 bg-[#040404] p-5 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-2 py-1">
            Notification Channels
          </div>

          <button
            onClick={() => setSelectedChannel("inapp")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-sans transition-all ${
              selectedChannel === "inapp" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Bell className="h-4 w-4" /> In-App Notification Feed ({notifications.length})
          </button>

          <button
            onClick={() => setSelectedChannel("email")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-sans transition-all ${
              selectedChannel === "email" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Mail className="h-4 w-4" /> Email Inbox Preview
          </button>

          <button
            onClick={() => setSelectedChannel("sms")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-sans transition-all ${
              selectedChannel === "sms" ? "bg-white text-black font-semibold shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Smartphone className="h-4 w-4" /> Push & SMS Simulator
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-10 space-y-8 bg-[#000000] overflow-y-auto">
          {selectedChannel === "inapp" && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                    In-App Notification Feed
                  </h1>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Real-time notifications delivered via Netify Redis WebSocket & HTTP pipeline.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-5 border transition-all ${
                      !n.read
                        ? "bg-[#0c0c0c] border-emerald-500/40"
                        : "bg-[#080808] border-white/10 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-white/10 text-emerald-400 border border-white/15 px-2 py-0.5">
                          {n.sender}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{n.timestamp}</span>
                      </div>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white font-sans">{n.title}</h3>
                    <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedChannel === "email" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                  Transactional Email Inbox Preview
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  How email templates render when sent via SendGrid / Resend connectors.
                </p>
              </div>

              <div className="space-y-4">
                {notifications.filter(n => n.channel === "EMAIL").map((n) => (
                  <div key={n.id} className="bg-[#080808] border border-white/15 p-8 space-y-6">
                    <div className="border-b border-white/10 pb-4 space-y-1.5 text-xs font-mono">
                      <div className="text-slate-400">From: <span className="text-white">notifications@acme.com</span></div>
                      <div className="text-slate-400">To: <span className="text-emerald-400">jane.smith@example.com</span></div>
                      <div className="text-slate-400">Subject: <span className="text-white font-sans font-semibold">{n.title}</span></div>
                    </div>

                    <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
                      <p className="text-sm font-semibold text-white">Hi Jane,</p>
                      <p>{n.body}</p>
                      <div className="pt-2">
                        <button className="bg-white text-black font-semibold text-xs px-5 py-2.5 hover:bg-slate-200 transition-all">
                          View Order Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedChannel === "sms" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white font-heading">
                  Push & SMS Mobile Device Simulator
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Simulating APNs / FCM push banners and Twilio SMS text alerts on mobile.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#080808] border border-white/15 p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>APNs / FCM Push Banners</span>
                    <span className="text-emerald-400">Delivered</span>
                  </div>

                  <div className="space-y-3">
                    {pushMessages.map((pm) => (
                      <div key={pm.id} className="p-4 bg-white/5 border border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className="font-bold text-white uppercase tracking-wider">NETIFY PUSH</span>
                          <span>{pm.time}</span>
                        </div>
                        <div className="text-xs font-semibold text-white">{pm.title}</div>
                        <div className="text-[11px] text-slate-400 leading-snug">{pm.body}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#080808] border border-white/15 p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Twilio SMS Alerts</span>
                    <span className="text-emerald-400">Delivered</span>
                  </div>

                  <div className="space-y-3">
                    {smsMessages.map((sm) => (
                      <div key={sm.id} className="p-4 bg-white/5 border border-white/10 space-y-1.5 font-mono text-xs">
                        <div className="text-[10px] text-slate-500 mb-1">+1 (888) 404-NETIFY ({sm.time})</div>
                        <div className="text-slate-200">{sm.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
