import { ArrowRight, Box, Cpu, Fingerprint, Network, Shield, Workflow, Lock, Database, Code, Globe, Play, Server, Zap, Search, ActivitySquare, AlertTriangle, ShieldCheck, Crosshair, GitMerge, ShieldAlert } from 'lucide-react'

export function WhatIsSection() {
  return (
    <section id="product" className="py-24 px-6 bg-[#050505] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">One Security Layer. Every Application.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Applications generate thousands of isolated security events. SentinelSOC ingests them and turns them into actionable security intelligence.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {/* Applications */}
          <div className="flex flex-col gap-4 w-full md:w-1/3">
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase text-center mb-2">Your Applications</div>
            {[
              { name: 'MANIT Marketplace', type: 'Web App' },
              { name: 'Core API Gateway', type: 'API' },
              { name: 'Internal Admin Panel', type: 'Internal Tools' },
            ].map((app, i) => (
              <div key={i} className="glass-panel p-4 flex justify-between items-center bg-[#111416]/50">
                <span className="text-sm font-medium text-foreground">{app.name}</span>
                <span className="text-[10px] bg-secondary px-2 py-1 rounded text-muted-foreground">{app.type}</span>
              </div>
            ))}
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center text-primary/50">
            <ArrowRight className="w-8 h-8 rotate-90 md:rotate-0" />
          </div>

          {/* SentinelSOC */}
          <div className="w-full md:w-1/3 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-colors" />
            <div className="relative glass-panel p-8 bg-[#111416] text-center border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
              <ShieldAlert className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-4">SentinelSOC</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="bg-secondary/50 py-1.5 rounded">Event Ingestion</div>
                <div className="bg-secondary/50 py-1.5 rounded">Detection</div>
                <div className="bg-secondary/50 py-1.5 rounded">Correlation</div>
                <div className="bg-secondary/50 py-1.5 rounded">Risk Analysis</div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center text-primary/50">
            <ArrowRight className="w-8 h-8 rotate-90 md:rotate-0" />
          </div>

          {/* Operations */}
          <div className="flex flex-col gap-4 w-full md:w-1/3">
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase text-center mb-2">Security Operations</div>
            {[
              { name: 'Active Alerts', count: '12', color: 'text-high' },
              { name: 'Open Incidents', count: '3', color: 'text-critical' },
              { name: 'Investigation', count: 'Ready', color: 'text-primary' },
            ].map((op, i) => (
              <div key={i} className="glass-panel p-4 flex justify-between items-center bg-[#111416]/50">
                <span className="text-sm font-medium text-muted-foreground">{op.name}</span>
                <span className={`text-sm font-bold ${op.color}`}>{op.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
