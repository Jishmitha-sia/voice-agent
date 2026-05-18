import { Activity, Database, Mic, PhoneCall, Radio, ShieldCheck } from "lucide-react";

const capabilities = [
  { label: "Realtime voice", icon: Mic },
  { label: "RAG knowledge", icon: Database },
  { label: "Inbound ready", icon: PhoneCall },
  { label: "Barge-in path", icon: Radio },
  { label: "Support guardrails", icon: ShieldCheck },
  { label: "Latency tracking", icon: Activity },
];

export default function Home() {
  return (
    <main className="shell">
      <section className="workspace">
        <div className="panel conversation">
          <div className="topbar">
            <div>
              <p className="eyebrow">Customer support agent</p>
              <h1>Voice Console</h1>
            </div>
            <span className="status">Foundation</span>
          </div>

          <div className="transcript">
            <div className="message customer">
              <span>Customer</span>
              <p>I need help with a billing issue.</p>
            </div>
            <div className="message agent">
              <span>Agent</span>
              <p>I can help with that. I will check the account, review the billing policy, and create a ticket if needed.</p>
            </div>
          </div>

          <div className="controls">
            <button className="primary" type="button">
              <Mic size={18} />
              Start test call
            </button>
            <button className="secondary" type="button">
              Configure agent
            </button>
          </div>
        </div>

        <aside className="panel side">
          <h2>Build Targets</h2>
          <div className="capabilityGrid">
            {capabilities.map((item) => (
              <div className="capability" key={item.label}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
