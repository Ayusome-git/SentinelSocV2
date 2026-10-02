"use client"

import { Activity, AlertTriangle, ShieldAlert, Users, Server, Globe, Lock } from "lucide-react"

export function DashboardPreview() {
  return (
    <div className="w-full max-w-6xl mx-auto rounded-xl overflow-hidden border border-border bg-[#0B0D0E] shadow-2xl relative group">
      {/* Browser Chrome */}
      <div className="h-10 bg-[#111416] border-b border-border flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-1 text-[10px] text-muted-foreground bg-[#0B0D0E] border border-border rounded-md font-mono flex items-center gap-2">
            <Lock className="w-3 h-3 text-muted-foreground" />
            sentinelsoc.example.com
          </div>
        </div>
      </div>

      {/* App Shell */}
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-[#0B0D0E] p-4 hidden md:flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold tracking-wider text-sm text-foreground">SentinelSOC</span>
          </div>

          <div className="space-y-6 flex-1">
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">Overview</div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-foreground bg-secondary/50 rounded-md">
                <Globe className="w-4 h-4 text-primary" /> Dashboard
              </div>
            </div>
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">Monitor</div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground">
                <Activity className="w-4 h-4" /> Events
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="w-4 h-4" /> Alerts
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#050505] overflow-hidden flex flex-col">
          {/* TopNav */}
          <div className="h-14 border-b border-border bg-[#0B0D0E] flex items-center justify-between px-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Overview <span className="text-border">/</span> <span className="text-foreground font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Operational</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary border border-border" />
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Security Command Center</h1>
                <p className="text-sm text-muted-foreground mt-1">Real-time visibility across your connected applications.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Security Events', value: '128.4K', change: '+12%', color: 'text-primary' },
                { label: 'Active Alerts', value: '24', change: '-4', color: 'text-high' },
                { label: 'Open Incidents', value: '3', change: '+1', color: 'text-critical' },
                { label: 'Avg Risk Score', value: '42', change: '-5', color: 'text-medium' },
              ].map((kpi, i) => (
                <div key={i} className="glass-panel p-4 flex flex-col gap-2">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{kpi.label}</div>
                  <div className="flex items-end justify-between">
                    <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
                    <div className="text-xs text-muted-foreground font-mono bg-secondary/50 px-1.5 py-0.5 rounded">{kpi.change}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 glass-panel p-5 h-64 flex flex-col">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Event Volume (24h)</div>
                <div className="flex-1 flex items-end gap-1">
                  {/* Fake Chart Bars */}
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors"
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-1 glass-panel p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Active Incidents</div>
                <div className="space-y-3">
                  {[
                    { id: 'INC-042', title: 'Brute Force Activity', severity: 'CRITICAL', time: '12m ago' },
                    { id: 'INC-041', title: 'Multiple Failed Logins', severity: 'HIGH', time: '1h ago' },
                    { id: 'INC-040', title: 'Suspicious IP Pattern', severity: 'MEDIUM', time: '3h ago' },
                  ].map((inc, i) => (
                    <div key={i} className="flex flex-col gap-1 p-2 rounded bg-secondary/30 border border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-muted-foreground">{inc.id}</span>
                        <span className="text-[10px] text-muted-foreground">{inc.time}</span>
                      </div>
                      <div className="text-sm font-medium text-foreground">{inc.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
