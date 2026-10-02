"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { correlationsApi } from "@/lib/api/correlations"
import { Correlation } from "@/lib/types/correlation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SeverityBadge } from "@/components/ui/SeverityBadge"
import Link from "next/link"
import { format } from "date-fns"
import { Loader2, GitMerge, AlertTriangle, ListTree, Activity, Clock, ShieldAlert } from "lucide-react"

export default function CorrelationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [correlation, setCorrelation] = useState<Correlation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    correlationsApi.getCorrelation(params.id)
      .then(res => setCorrelation(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleCreateIncident = async () => {
    setLoading(true)
    try {
      const res = await correlationsApi.createIncident(params.id)
      try {
        router.push(`/incidents/${res.incident_id}`)
      } catch (navErr) {
        window.location.href = `/incidents/${res.incident_id}`
      }
    } catch (err) {
      console.error(err)
      alert(`Failed to create incident: ${err instanceof Error ? err.message : String(err)}`)
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
  if (!correlation) return <div className="p-8 text-critical">Correlation not found.</div>

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title={correlation.name}
          description={`Correlated sequence spanning ${format(new Date(correlation.first_event_at), 'MMM d, yyyy HH:mm:ss')} to ${format(new Date(correlation.last_event_at), 'HH:mm:ss')}`}
        />
        <Button
          variant="default"
          onClick={handleCreateIncident}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          Create Incident
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-6 py-4 flex items-center gap-3">
              <GitMerge className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Attack Timeline</h3>
            </div>
            <div className="p-6">
              {correlation.evidence && correlation.evidence.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-primary/20 before:via-primary/50 before:to-primary/20">
                  {correlation.evidence.map((ev, i) => (
                    <div key={ev.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-secondary text-foreground shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:border-primary/50 group-hover:scale-110">
                        {i + 1}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-secondary/50 transition-colors shadow-sm group-hover:border-primary/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="bg-secondary/50 text-[10px] tracking-wider uppercase border-border">{ev.type}</Badge>
                          <time className="font-mono text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" />{format(new Date(ev.timestamp), 'HH:mm:ss')}</time>
                        </div>
                        <div className="font-medium text-sm text-foreground leading-relaxed flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
                          {ev.type === 'EVENT' ? ev.data.event_type : ev.data.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-secondary/30 rounded-lg border border-dashed border-border/50">
                  <GitMerge className="h-10 w-10 mb-4 opacity-50" />
                  <p className="text-sm font-medium">Timeline not available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-5 py-4 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Risk & Priority</h3>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Severity</span>
                <SeverityBadge severity={correlation.severity} className="text-sm px-3 py-1" />
              </div>
              
              <div className="pt-5 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Risk Score</span>
                <div className="flex items-end gap-3">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold tracking-tighter text-foreground">{correlation.risk_score || 0}</span>
                    <span className="text-muted-foreground font-medium ml-1">/100</span>
                  </div>
                  {correlation.risk_level && (
                    <Badge variant={
                      correlation.risk_level === 'CRITICAL' ? 'destructive' :
                      correlation.risk_level === 'HIGH' ? 'destructive' :
                      correlation.risk_level === 'MODERATE' ? 'warning' : 'secondary'
                    } className="mb-1">{correlation.risk_level}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {correlation.risk_factors && (
            <div className="glass-panel overflow-hidden">
              <div className="border-b border-border bg-secondary/30 px-5 py-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Risk Factors
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {Object.entries(correlation.risk_factors).map(([factor, score]) => (
                    <div key={factor} className="flex items-center justify-between group">
                      <span className="text-sm text-foreground capitalize group-hover:text-primary transition-colors">{factor.replace('_', ' ')}</span>
                      <span className="font-mono text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded">+{score}</span>
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Final Score</span>
                    <span className="font-mono font-bold text-primary">{correlation.risk_score}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {correlation.generated_alert_id && (
            <div className="glass-panel overflow-hidden border-primary/30 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="border-b border-border/50 bg-secondary/20 px-5 py-4 flex items-center gap-2 relative z-10">
                <ShieldAlert className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary">Escalated Alert</h3>
              </div>
              <div className="p-5 relative z-10">
                <p className="text-sm text-foreground/90 mb-4 leading-relaxed">
                  This correlation sequence met the threshold to be escalated into a formal security alert.
                </p>
                <Link href={`/alerts/${correlation.generated_alert_id}`} className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium w-full h-10 transition-colors shadow-sm">
                  View Generated Alert
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
