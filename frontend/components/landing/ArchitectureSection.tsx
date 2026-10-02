import { ArrowDown, Server, Database, Brain, Workflow, ShieldCheck } from 'lucide-react'

export function ArchitectureSection() {
  return (
    <section id="architecture" className="py-24 px-6 bg-[#0B0D0E]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Platform Architecture</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">A scalable, unified pipeline from ingestion to response.</p>
        </div>

        <div className="relative p-8 md:p-12 glass-panel rounded-2xl bg-[#111416]/80 flex flex-col items-center">
          
          {/* Applications */}
          <div className="flex gap-4 mb-6">
            <div className="px-6 py-3 bg-secondary/80 border border-border rounded-lg text-sm font-medium text-foreground text-center min-w-[120px]">Web App</div>
            <div className="px-6 py-3 bg-secondary/80 border border-border rounded-lg text-sm font-medium text-foreground text-center min-w-[120px]">API</div>
            <div className="px-6 py-3 bg-secondary/80 border border-border rounded-lg text-sm font-medium text-foreground text-center min-w-[120px]">Internal</div>
          </div>
          <ArrowDown className="w-6 h-6 text-primary/50 mb-6" />

          {/* Event Ingestion */}
          <div className="w-full max-w-lg p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(var(--primary),0.1)] mb-6">
            <Server className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-widest text-primary uppercase text-sm">Event Ingestion</span>
          </div>
          <ArrowDown className="w-6 h-6 text-primary/50 mb-6" />

          {/* Core Engine */}
          <div className="w-full max-w-2xl grid grid-cols-2 gap-6 mb-6">
            <div className="p-6 bg-secondary/50 border border-border rounded-xl text-center">
              <Workflow className="w-6 h-6 text-foreground mx-auto mb-3" />
              <div className="font-semibold text-foreground">Detection Engine</div>
              <div className="text-xs text-muted-foreground mt-1">Rule-based matching</div>
            </div>
            <div className="p-6 bg-secondary/50 border border-border rounded-xl text-center">
              <Brain className="w-6 h-6 text-foreground mx-auto mb-3" />
              <div className="font-semibold text-foreground">ML Analysis</div>
              <div className="text-xs text-muted-foreground mt-1">Anomaly detection</div>
            </div>
          </div>
          
          {/* Risk & Correlation */}
          <div className="w-full max-w-lg p-6 bg-secondary/80 border border-border rounded-xl flex flex-col items-center mb-6">
            <div className="font-bold text-foreground mb-2">Correlation & Risk Engine</div>
            <div className="text-xs text-muted-foreground">Aggregates signals into scored incidents</div>
          </div>
          <ArrowDown className="w-6 h-6 text-primary/50 mb-6" />

          {/* Operations */}
          <div className="flex gap-6 w-full max-w-2xl justify-center">
            <div className="flex-1 p-4 bg-[#0B0D0E] border border-border rounded-xl text-center">
              <Database className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm font-medium text-foreground">Investigation</div>
            </div>
            <div className="flex-1 p-4 bg-success/10 border border-success/20 rounded-xl text-center shadow-[0_0_15px_rgba(var(--success),0.1)]">
              <ShieldCheck className="w-5 h-5 text-success mx-auto mb-2" />
              <div className="text-sm font-medium text-success">Active Response</div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
