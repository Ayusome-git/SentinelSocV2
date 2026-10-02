export function TelemetrySection() {
  const stream = [
    { time: '09:41:03', event: 'LOGIN_FAILED', ip: '185.23.41.9', sev: 'HIGH', color: 'text-high', bg: 'bg-high/10' },
    { time: '09:41:08', event: 'LOGIN_FAILED', ip: '185.23.41.9', sev: 'HIGH', color: 'text-high', bg: 'bg-high/10' },
    { time: '09:41:14', event: 'LOGIN_SUCCESS', ip: '185.23.41.9', sev: 'MEDIUM', color: 'text-medium', bg: 'bg-medium/10' },
    { time: '09:41:21', event: 'ADMIN_LOGIN', ip: '185.23.41.9', sev: 'HIGH', color: 'text-high', bg: 'bg-high/10' },
    { time: '09:41:29', event: 'CORRELATION_DETECTED', ip: 'SYSTEM', sev: 'CRITICAL', color: 'text-critical', bg: 'bg-critical/20' },
  ]

  return (
    <section className="py-24 px-6 bg-[#0B0D0E]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Live Security Telemetry</h2>
          <p className="text-muted-foreground">Every action across your infrastructure, instantly analyzed and scored.</p>
        </div>

        <div className="glass-panel p-1 rounded-xl bg-[#111416] overflow-hidden">
          <div className="h-8 bg-[#171A1C] border-b border-border flex items-center px-4">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Global Event Stream</div>
          </div>
          <div className="p-4 space-y-2 font-mono text-xs">
            {stream.map((s, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded hover:bg-secondary/50 transition-colors border border-transparent hover:border-border group">
                <div className="flex items-center gap-6">
                  <span className="text-muted-foreground w-20">{s.time}</span>
                  <span className="font-semibold text-foreground w-48">{s.event}</span>
                  <span className="text-muted-foreground w-32">{s.ip}</span>
                </div>
                <div className={`px-2 py-1 mt-2 sm:mt-0 rounded text-[10px] uppercase font-bold tracking-wider ${s.bg} ${s.color} border border-${s.color}/20 w-fit`}>
                  {s.sev}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
