import { CheckCircle2 } from 'lucide-react'

export function SecurityPrinciplesSection() {
  const principles = [
    { title: "No Secrets in Frontend", desc: "API keys and sensitive data are strictly confined to the backend layer." },
    { title: "Application-Scoped API Keys", desc: "Granular access control ensuring minimal blast radius per application." },
    { title: "Role-Based Access Control", desc: "Strict RBAC enforces separation of duties between analysts and admins." },
    { title: "Immutable Audit Logging", desc: "Every analyst action and system modification is permanently recorded." },
    { title: "Strict Input Validation", desc: "Comprehensive Pydantic schemas validate all incoming telemetry." },
    { title: "Human-in-the-loop Response", desc: "Automated responses require explicit analyst approval before execution." }
  ]

  return (
    <section className="py-24 px-6 bg-[#0B0D0E]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold tracking-widest uppercase mb-6">
            Secure by Design
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Security Principles</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">A security product must itself be secure. SentinelSOC is built on fundamental defense-in-depth patterns.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {principles.map((p, i) => (
            <div key={i} className="flex gap-4 p-6 glass-panel bg-[#111416]/50">
              <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
              <div>
                <h4 className="font-bold text-foreground mb-1">{p.title}</h4>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
