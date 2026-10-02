"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { correlationsApi } from "@/lib/api/correlations"
import { Correlation } from "@/lib/types/correlation"
import Link from "next/link"
import { format } from "date-fns"
import { SeverityBadge } from "@/components/ui/SeverityBadge"
import { RiskBadge } from "@/components/ui/RiskBadge"
import { Loader2, Activity, Network } from "lucide-react"

export default function CorrelationsPage() {
  const [correlations, setCorrelations] = useState<Correlation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    correlationsApi.getCorrelations()
      .then(res => setCorrelations(res.items))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Correlations</h1>
          <p className="text-sm text-muted-foreground mt-1">Correlated attack sequences linking multiple security signals.</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Severity</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Risk</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Correlation Sequence</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Last Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">Analyzing correlation chains...</p>
                  </td>
                </tr>
              ) : correlations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Network className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground">No correlations detected</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No multi-stage attacks or correlation sequences found.
                    </p>
                  </td>
                </tr>
              ) : (
                correlations.map(corr => (
                  <tr key={corr.id} className="group hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-4">
                      <SeverityBadge severity={corr.severity} />
                    </td>
                    <td className="px-5 py-4">
                      {corr.risk_level ? (
                        <RiskBadge level={corr.risk_level} score={corr.risk_score} />
                      ) : (
                        <span className="text-xs text-muted-foreground">Unscored</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                          <Network className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <Link href={`/correlations/${corr.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            {corr.name}
                          </Link>
                          <span className="text-xs text-muted-foreground font-mono mt-0.5">ID: {corr.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border ${
                        corr.status === 'ACTIVE' ? 'bg-success/15 text-success border-success/30' :
                        corr.status === 'RESOLVED' ? 'bg-medium/15 text-medium border-medium/30' :
                        'bg-secondary text-muted-foreground border-border'
                      }`}>
                        {corr.status === 'ACTIVE' && <Activity className="h-3 w-3" />}
                        {corr.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm text-muted-foreground font-mono text-[11px]">
                        {format(new Date(corr.last_event_at), 'MMM d, HH:mm:ss')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
