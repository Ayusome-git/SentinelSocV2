"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from "@/components/layout/PageHeader"
import { usePermissions } from "@/lib/permissions"
import { rulesApi } from "@/lib/api/rules"
import { DetectionRule } from "@/lib/types/rule"
import {
  Search, Plus, Target, ChevronLeft, ChevronRight, AlertTriangle, Loader2, Play, Square, Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RulesPage() {
  const router = useRouter()
  const { hasPermission, isLoading } = usePermissions()
  const canManage = hasPermission('RULES_MANAGE')
  const canRead = hasPermission('RULES_READ')

  const [rules, setRules] = useState<DetectionRule[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRules = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await rulesApi.list({ 
        page, 
        page_size: pageSize, 
        search: search || undefined,
        category: categoryFilter || undefined,
        severity: severityFilter || undefined
      })
      setRules(data.items)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message || 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, categoryFilter, severityFilter])

  useEffect(() => {
    if (isLoading) return
    if (!canRead) {
      router.push('/dashboard')
      return
    }
    fetchRules()
  }, [isLoading, canRead, fetchRules, router])

  const toggleStatus = async (id: string, currentEnabled: boolean) => {
    try {
      await rulesApi.updateStatus(id, !currentEnabled)
      fetchRules()
    } catch (e: any) {
      console.error(e)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (isLoading || !canRead) return null

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Detection Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage security detection rules and thresholds.</p>
        </div>
      </div>

      <div className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search rules..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full sm:w-[250px] rounded-lg border border-border bg-input py-2 pl-9 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-card py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm h-10"
          >
            <option value="">All Categories</option>
            <option value="AUTHENTICATION">Authentication</option>
            <option value="AUTHORIZATION">Authorization</option>
            <option value="API_ABUSE">API Abuse</option>
            <option value="PRIVILEGE_ABUSE">Privilege Abuse</option>
            <option value="WEB_ATTACK">Web Attack</option>
            <option value="ANOMALY">Anomaly</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => { setSeverityFilter(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-card py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm h-10"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        
        {canManage && (
          <Link
            href="/rules/create"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm ml-auto"
          >
            <Plus className="h-4 w-4" />
            Create Rule
          </Link>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical flex items-center gap-2 shadow-[0_0_10px_rgba(var(--critical),0.1)]">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/30">
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Name</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Category</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Type</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Severity</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No rules found.
                  </td>
                </tr>
              ) : (
                rules.map(rule => (
                  <tr key={rule.id} className="group hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/rules/${rule.id}`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{rule.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{rule.description || '—'}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      {rule.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-widest bg-secondary text-foreground border border-border">
                          {rule.category}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-foreground">{rule.rule_type}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{rule.event_type}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                        rule.severity === 'CRITICAL' ? 'bg-critical/10 text-critical border border-critical/20 shadow-[0_0_10px_rgba(var(--critical),0.1)]' :
                        rule.severity === 'HIGH' ? 'bg-high/10 text-high border border-high/20' :
                        rule.severity === 'MEDIUM' ? 'bg-medium/10 text-medium border border-medium/20' :
                        'bg-low/10 text-low border border-low/20'
                      }`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                        rule.enabled ? 'bg-success/15 text-success border border-success/30' : 'bg-secondary text-muted-foreground border border-border'
                      }`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManage && (
                          <button
                            onClick={() => toggleStatus(rule.id, rule.enabled)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            title={rule.enabled ? "Disable" : "Enable"}
                          >
                            {rule.enabled ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4 text-success" />}
                          </button>
                        )}
                        <Link
                          href={`/rules/${rule.id}`}
                          className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-card/50 px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 border-border hover:bg-secondary">
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 border-border hover:bg-secondary">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
