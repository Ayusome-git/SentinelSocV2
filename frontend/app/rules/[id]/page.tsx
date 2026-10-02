"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from "@/components/layout/PageHeader"
import { rulesApi } from "@/lib/api/rules"
import { DetectionRule } from "@/lib/types/rule"
import { usePermissions } from "@/lib/permissions"
import { SeverityBadge } from "@/components/ui/SeverityBadge"
import { ArrowLeft, Loader2, Target, AlertTriangle, Edit2, Play, Square, Calendar, User, LayoutGrid, Clock, ShieldAlert, Activity } from "lucide-react"

export default function RuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission, isLoading } = usePermissions()
  const canManage = hasPermission('RULES_MANAGE')

  const [rule, setRule] = useState<DetectionRule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRule = useCallback(async () => {
    try {
      const data = await rulesApi.get(params.id as string)
      setRule(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rule')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchRule()
  }, [fetchRule])

  const toggleStatus = async () => {
    if (!rule) return
    try {
      const updated = await rulesApi.updateStatus(rule.id, !rule.enabled)
      setRule(updated)
    } catch (e: any) {
      console.error(e)
    }
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  if (error) return <div className="text-critical p-6 text-center">{error}</div>
  if (!rule) return null

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/rules" className="rounded-full h-10 w-10 flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border/50">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <PageHeader title={rule.name} description="Rule details and configuration." />
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {canManage && (
            <>
              <button
                onClick={toggleStatus}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors shadow-sm h-10"
              >
                {rule.enabled ? <Square className="h-4 w-4 text-muted-foreground" /> : <Play className="h-4 w-4 text-primary" />}
                {rule.enabled ? 'Disable' : 'Enable'}
              </button>
              <Link
                href={`/rules/${rule.id}/edit`}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm h-10"
              >
                <Edit2 className="h-4 w-4" />
                Edit Rule
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-6 py-4 flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Rule Configuration</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                  rule.enabled ? 'bg-success/10 text-success border border-success/20 shadow-sm' : 'bg-secondary text-muted-foreground border border-border'
                }`}>
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Severity</p>
                <SeverityBadge severity={rule.severity} className="text-xs px-3 py-1" />
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</p>
                <p className="text-sm text-foreground/90 leading-relaxed bg-background/50 p-3 rounded-lg border border-border/50">{rule.description || 'No description provided.'}</p>
              </div>
              
              <div className="sm:col-span-2 grid grid-cols-2 gap-6 pt-4 border-t border-border/50">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Event Type</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    {rule.event_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Group By</p>
                  <p className="text-sm font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border/50 inline-block">{rule.group_by}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Threshold</p>
                  <p className="text-sm font-medium text-foreground flex items-baseline gap-1">
                    <span className="text-lg">{rule.threshold}</span> 
                    <span className="text-muted-foreground text-xs">occurrences</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Time Window</p>
                  <p className="text-sm font-medium text-foreground flex items-baseline gap-1">
                    <span className="text-lg">{rule.window_seconds}</span>
                    <span className="text-muted-foreground text-xs">seconds</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="glass-panel overflow-hidden">
             <div className="border-b border-border bg-secondary/30 px-5 py-4 flex items-center gap-3">
              <LayoutGrid className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Metadata</h2>
            </div>
            <div className="p-5 space-y-5 text-sm">
              <div className="flex items-start gap-3 group">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Created</p>
                  <p className="text-foreground font-medium">{new Date(rule.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors shrink-0">
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Application Scope</p>
                  <p className="text-foreground font-medium">{rule.application_id ? <span className="font-mono text-xs bg-secondary px-1.5 rounded border border-border">{rule.application_id}</span> : 'Global'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors shrink-0">
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Rule Type</p>
                  <p className="text-foreground font-medium">{rule.rule_type}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
