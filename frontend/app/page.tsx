import Link from 'next/link'
import { ArrowRight, ArrowDown, Shield, ShieldAlert, Activity, Lock, Database, Code, Server, Zap, Search, ActivitySquare, AlertTriangle, ShieldCheck, Crosshair, GitMerge } from 'lucide-react'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { MatrixBackground } from '@/components/landing/MatrixBackground'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030603] text-[#E8F5E9] font-sans selection:bg-[#00FF41]/30 selection:text-[#E8F5E9] overflow-x-hidden">
      
      {/* Navbar - Matrix Simplified */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#030603]/90 backdrop-blur-md border-b border-[#183A1B]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-transparent border border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.15)]">
              <ShieldAlert className="h-4 w-4 text-[#00FF41]" />
            </div>
            <span className="font-bold tracking-[0.2em] text-sm text-[#E8F5E9] uppercase">SentinelSOC</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8F5E9] hover:text-[#39FF6A] transition-colors bg-[#081008] px-4 py-2 border border-[#183A1B] hover:border-[#00FF41] hover:shadow-[0_0_20px_rgba(0,255,65,0.15)] rounded">
              ENTER SOC <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Matrix Hero Section */}
        <section className="relative pt-40 pb-32 px-6 min-h-[90vh] flex flex-col items-center justify-center">
          <MatrixBackground />
          
          {/* Tactical Status Panel */}
          <div className="absolute left-6 top-32 hidden lg:flex flex-col gap-2 font-mono text-[10px] uppercase tracking-widest z-20">
            <div className="text-[#607A63] mb-2">SYSTEM STATUS</div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41]" />
              <span className="text-[#A7C4AA]">EVENT PIPELINE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41]" />
              <span className="text-[#A7C4AA]">DETECTION ENGINE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41]" />
              <span className="text-[#A7C4AA]">CORRELATION ENGINE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41]" />
              <span className="text-[#A7C4AA]">RISK ENGINE</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0B3D16] border border-[#00FF41] text-[#39FF6A] text-[10px] font-bold tracking-[0.2em] uppercase mb-8 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
              SYSTEM ONLINE
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#E8F5E9] mb-4 leading-[1.1]">
              SECURITY <br className="hidden md:block"/> INTELLIGENCE
            </h1>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#00FF41] mb-8 leading-[1.1]">
              FOR EVERY APPLICATION.
            </h2>
            
            <p className="text-lg text-[#A7C4AA] max-w-2xl mx-auto mb-12 font-mono text-sm leading-relaxed">
              Application-agnostic Security Operations Center. 
              Centralize events, detect threats, and correlate attacks in real-time.
            </p>
            
            <div className="flex flex-col items-center gap-8">
              <Link href="/login" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#081008] border border-[#00FF41] text-[#39FF6A] font-bold tracking-widest uppercase text-sm hover:bg-[#0B3D16] hover:shadow-[0_0_25px_rgba(0,255,65,0.18)] transition-all duration-300">
                <span className="absolute left-0 top-0 w-2 h-2 border-t border-l border-[#00FF41]" />
                <span className="absolute right-0 bottom-0 w-2 h-2 border-b border-r border-[#00FF41]" />
                [ ENTER THE SOC <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> ]
              </Link>
              
              <Link href="#telemetry" className="text-[10px] font-bold tracking-widest uppercase text-[#607A63] hover:text-[#00FF41] transition-colors flex flex-col items-center gap-2 mt-12">
                VIEW THE SYSTEM
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Showcase */}
        <section id="dashboard" className="py-32 px-6 border-t border-[#183A1B] bg-[#030603] overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-[#E8F5E9] uppercase mb-4">
                THE SECURITY OPERATIONS CENTER
              </h2>
              <div className="h-px w-48 bg-[#00FF41]/30 mx-auto" />
            </div>
            
            <div className="border border-[#183A1B] p-1 bg-[#050A05] shadow-[0_0_40px_rgba(0,255,65,0.05)] rounded-xl relative">
              {/* Product Frame styling */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00FF41]/50 to-transparent" />
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* Live Security Telemetry */}
        <section id="telemetry" className="py-24 px-6 relative border-t border-[#183A1B] bg-[#050A05]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-[10px] font-bold tracking-[0.3em] text-[#A7C4AA] uppercase mb-2">Live Security Telemetry</h2>
              <div className="h-px w-24 bg-[#00FF41]/30 mx-auto" />
            </div>

            <div className="border border-[#183A1B] bg-[#030603] p-1 font-mono text-xs">
              <div className="flex items-center justify-between p-2 border-b border-[#183A1B] text-[#607A63] uppercase tracking-widest text-[9px]">
                <span>Timestamp</span>
                <span>Event</span>
                <span>Source IP</span>
                <span>Severity</span>
              </div>
              
              {[
                { time: '09:41:03', event: 'LOGIN_FAILED', ip: '10.24.18.91', sev: 'HIGH', class: 'text-[#D9A441]' },
                { time: '09:41:08', event: 'LOGIN_FAILED', ip: '10.24.18.91', sev: 'HIGH', class: 'text-[#D9A441]' },
                { time: '09:41:14', event: 'LOGIN_SUCCESS', ip: '10.24.18.91', sev: 'MEDIUM', class: 'text-[#39FF6A]' },
                { time: '09:41:21', event: 'ADMIN_LOGIN', ip: '10.24.18.91', sev: 'HIGH', class: 'text-[#D9A441]' },
                { time: '09:41:29', event: 'THREAT_DETECTED', ip: '10.24.18.91', sev: 'CRITICAL', class: 'text-[#FF4D4D]' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-b border-[#183A1B]/30 hover:bg-[#081008] transition-colors">
                  <span className="text-[#607A63] w-24">{s.time}</span>
                  <span className={`font-semibold ${s.class} w-40`}>{s.event}</span>
                  <span className="text-[#A7C4AA] w-32">{s.ip}</span>
                  <span className={`${s.class} text-[10px] uppercase font-bold tracking-wider`}>{s.sev}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detection Pipeline */}
        <section className="py-24 px-6 border-t border-[#183A1B] bg-[#030603] flex flex-col items-center overflow-hidden">
          <div className="flex flex-col items-center">
            {[
              'EVENT', 'DETECT', 'CORRELATE', 'RISK', 'INCIDENT', 'RESPONSE'
            ].map((step, i, arr) => (
              <div key={step} className="flex flex-col items-center">
                <div className="px-6 py-2 border border-[#00FF41]/40 bg-[#081008] text-[#39FF6A] font-mono text-sm tracking-widest font-bold shadow-[0_0_15px_rgba(0,255,65,0.1)]">
                  {step}
                </div>
                {i !== arr.length - 1 && (
                  <div className="h-12 w-px bg-gradient-to-b from-[#00FF41] to-transparent my-1 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-[#00FF41] shadow-[0_0_10px_#00FF41] animate-[ping_1.5s_infinite]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Attack Chain */}
        <section className="py-24 px-6 border-t border-[#183A1B] bg-[#050A05]">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[10px] font-bold tracking-[0.3em] text-[#A7C4AA] uppercase mb-2">ATTACK CHAIN</h2>
              <div className="h-px w-24 bg-[#00FF41]/30 mx-auto" />
            </div>

            <div className="flex flex-col items-center font-mono text-xs">
              {[
                { event: 'LOGIN_FAILED', type: 'normal' },
                { event: 'BRUTE FORCE', type: 'warning' },
                { event: 'LOGIN_SUCCESS', type: 'normal' },
                { event: 'ADMIN_LOGIN', type: 'normal' },
                { event: 'ADMIN_ACTION', type: 'normal' },
                { event: 'RISK 91', type: 'critical' },
                { event: 'INC-000042', type: 'critical' },
              ].map((step, i, arr) => {
                let colorClass = "text-[#39FF6A] border-[#00FF41]/40";
                if (step.type === 'warning') colorClass = "text-[#D9A441] border-[#D9A441]/40 shadow-[0_0_10px_rgba(217,164,65,0.1)]";
                if (step.type === 'critical') colorClass = "text-[#FF4D4D] border-[#FF4D4D]/40 shadow-[0_0_15px_rgba(255,77,77,0.2)]";

                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`px-4 py-1.5 border bg-[#081008] font-bold tracking-wider ${colorClass}`}>
                      {step.event}
                    </div>
                    {i !== arr.length - 1 && (
                      <ArrowDown className="w-4 h-4 text-[#607A63] my-2" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>


        {/* Built for Developers */}
        <section className="py-24 px-6 border-t border-[#183A1B] bg-[#050A05]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[10px] font-bold tracking-[0.3em] text-[#A7C4AA] uppercase mb-2">BUILT FOR DEVELOPERS</h2>
              <div className="h-px w-24 bg-[#00FF41]/30 mx-auto" />
            </div>

            <div className="border border-[#183A1B] bg-[#020402] shadow-[0_0_20px_rgba(0,255,65,0.05)] mx-auto">
              <div className="flex gap-1.5 p-3 border-b border-[#183A1B] bg-[#050A05]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#183A1B]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#183A1B]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#183A1B]" />
                <span className="ml-4 text-[9px] font-mono text-[#607A63]">api_integration.ts</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-xs leading-loose text-[#A7C4AA]">
                  <span className="text-[#607A63]">import</span> {'{ sentinelsoc }'} <span className="text-[#607A63]">from</span> '@sentinelsoc/sdk';{'\n\n'}
                  
                  sentinelsoc.<span className="text-[#00FF41]">logEvent</span>({`{\n`}
                  {'  '}event_type: <span className="text-[#E8F5E9]">'LOGIN_FAILED'</span>,{'\n'}
                  {'  '}severity: <span className="text-[#E8F5E9]">'HIGH'</span>,{'\n'}
                  {'  '}source_ip: clientIp,{'\n'}
                  {'  '}user_id: user.id{'\n'}
                  {`}`});
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Final Statement / CTA */}
        <section className="py-40 px-6 border-t border-[#183A1B] bg-[#030603] relative overflow-hidden">
          <MatrixBackground />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030603] via-transparent to-[#030603] z-0" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#E8F5E9] mb-4 leading-tight">
              LOGS TELL YOU <br /> WHAT HAPPENED.
            </h2>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#00FF41] mb-16 leading-tight">
              SENTINELSOC SHOWS YOU <br /> WHAT IT MEANS.
            </h2>
            
            <Link href="/login" className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#030603] border border-[#00FF41] text-[#39FF6A] font-bold tracking-[0.2em] uppercase text-sm hover:bg-[#0B3D16] hover:shadow-[0_0_30px_rgba(0,255,65,0.25)] transition-all duration-300">
              <span className="absolute left-0 top-0 w-2 h-2 border-t border-l border-[#00FF41]" />
              <span className="absolute right-0 bottom-0 w-2 h-2 border-b border-r border-[#00FF41]" />
              [ ENTER SOC <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> ]
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#183A1B] py-8 px-6 bg-[#030603]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#607A63]" />
            <span className="font-bold tracking-[0.2em] text-[10px] text-[#607A63] uppercase">SentinelSOC</span>
          </div>
          <p className="text-[10px] font-mono text-[#607A63]">
            SYSTEM_VERSION: 1.0.0 // STATUS: ONLINE
          </p>
        </div>
      </footer>
    </div>
  )
}
