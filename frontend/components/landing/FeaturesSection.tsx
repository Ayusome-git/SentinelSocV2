import { Shield, GitMerge, ActivitySquare, Crosshair, Cpu, ShieldCheck } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      title: "Detection Engine",
      desc: "Turn security events into actionable alerts. Our rule-based and anomaly detection engines identify suspicious activity before it becomes a breach.",
      icon: Shield
    },
    {
      title: "Event Correlation",
      desc: "Connect isolated signals into attack chains. Understand the full scope of an incident by linking related activities across all your applications.",
      icon: GitMerge
    },
    {
      title: "Risk Intelligence",
      desc: "Understand what deserves attention first. Dynamic risk scoring based on asset criticality, threat severity, and historical context.",
      icon: ActivitySquare
    },
    {
      title: "Investigation Workspace",
      desc: "Trace incidents from first event to final action in a unified timeline. Gather evidence, add notes, and collaborate with your team.",
      icon: Crosshair
    },
    {
      title: "ML Anomaly Detection",
      desc: "Go beyond static rules. Our machine learning models establish baselines and detect unknown threats by identifying behavioral deviations.",
      icon: Cpu
    },
    {
      title: "Controlled Response",
      desc: "Respond with approval-driven security actions. Block IPs, suspend users, or trigger workflows with full auditability.",
      icon: ShieldCheck
    }
  ]

  return (
    <section id="features" className="py-24 px-6 bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Enterprise Capabilities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">A complete security operations suite built for modern engineering teams.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="glass-panel p-8 hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
