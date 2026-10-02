"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SeverityBadge } from "@/components/ui/SeverityBadge"
import { RiskBadge } from "@/components/ui/RiskBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Shield, AlertTriangle, AlertCircle, Search, Loader2, Flame, CheckCircle2, Activity } from "lucide-react"

import { incidentsApi } from "@/lib/api/incidents"
import { IncidentSummary } from "@/lib/types/incident"
import Link from "next/link"
import { format } from "date-fns"

export default function IncidentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [incidents, setIncidents] = useState<any[]>([])
  const [summary, setSummary] = useState<IncidentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // Filters from URL
  const page = parseInt(searchParams.get("page") || "1")
  const status = searchParams.get("status") || "ALL"
  const severity = searchParams.get("severity") || "ALL"
  const search = searchParams.get("search") || ""

  const fetchIncidents = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, size: 25 }
      
      if (search) params.search = search
      if (status !== "ALL") params.status = status
      if (severity !== "ALL") params.severity = severity

      const res = await incidentsApi.getIncidents(params)
      setIncidents(res.items)
      setTotal(res.total)

      const sumRes = await incidentsApi.getSummary()
      setSummary(sumRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, status, severity, search])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "ALL") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== "page") params.set("page", "1")
    router.push(`/incidents?${params.toString()}`)
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Incident Management</h1>
          <p className="text-sm text-muted-foreground mt-1">SOC Analyst queue for investigating and resolving security incidents.</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-info/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Open / Investigating</h3>
            <AlertCircle className="h-4 w-4 text-info" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">{(summary?.open || 0) + (summary?.investigating || 0)}</div>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-medium/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contained</h3>
            <Shield className="h-4 w-4 text-medium" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">{summary?.contained ?? '-'}</div>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group border-critical/30 shadow-[0_0_15px_rgba(var(--critical),0.1)]">
          <div className="absolute inset-0 bg-critical/10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-critical/20 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
          <div className="flex flex-row items-center justify-between pb-2 relative z-10">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-critical">Critical Incidents</h3>
            <Flame className="h-4 w-4 text-critical animate-pulse" />
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-bold text-critical drop-shadow-[0_0_8px_rgba(var(--critical),0.8)]">{summary?.critical ?? '-'}</div>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Unassigned</h3>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">{summary?.unassigned ?? '-'}</div>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Avg Risk Score</h3>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">{summary ? Math.round(summary.average_risk_score) : '-'}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search incidents..."
              className="pl-9 w-[250px] bg-input border-border text-foreground focus:ring-primary focus:border-primary transition-all rounded-lg"
              value={search}
              onChange={(e) => updateFilters("search", e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(val) => updateFilters("status", val)}>
            <SelectTrigger className="w-[160px] bg-card border-border text-foreground shadow-sm h-10 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="INVESTIGATING">Investigating</SelectItem>
              <SelectItem value="CONTAINED">Contained</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={(val) => updateFilters("severity", val)}>
            <SelectTrigger className="w-[160px] bg-card border-border text-foreground shadow-sm h-10 rounded-lg">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="ALL">All Severities</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest w-[40%]">Incident details</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Priority</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Assigned</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Detected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-border hover:bg-transparent">
                  <TableCell><Skeleton className="h-10 w-full max-w-[400px] bg-secondary" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[100px] bg-secondary" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[100px] rounded-full bg-secondary" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px] bg-secondary" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[120px] bg-secondary" /></TableCell>
                </TableRow>
              ))
            ) : incidents.length === 0 ? (
              <TableRow className="border-border hover:bg-secondary/50">
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No incidents match your criteria.
                </TableCell>
              </TableRow>
            ) : (
              incidents.map(incident => (
                <TableRow key={incident.id} className="border-border hover:bg-secondary/50 transition-colors group">
                  <TableCell>
                    <Link href={`/incidents/${incident.id}`} className="font-medium text-foreground hover:text-primary transition-colors flex items-start gap-2">
                      <span className="text-primary font-mono text-sm bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0 mt-0.5">{incident.incident_number}</span>
                      <span>{incident.title}</span>
                    </Link>
                    {incident.description && (
                      <span className="text-xs text-muted-foreground block truncate max-w-md mt-1.5">{incident.description}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                        <SeverityBadge severity={incident.severity} />
                        <div>
                          <RiskBadge score={incident.risk_score} />
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      bg-transparent border transition-colors
                      ${incident.status === 'OPEN' ? 'border-critical/50 text-critical bg-critical/5' : 
                        incident.status === 'INVESTIGATING' ? 'border-high/50 text-high bg-high/5' : 
                        incident.status === 'CONTAINED' ? 'border-medium/50 text-medium bg-medium/5' : 
                        incident.status === 'RESOLVED' ? 'border-success/50 text-success bg-success/5' : 
                        'border-muted-foreground/50 text-muted-foreground bg-secondary/50'}
                    `}>{incident.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {incident.assigned_to ? (
                      <span className="text-xs font-medium text-foreground bg-secondary px-2 py-1 rounded border border-border">Assigned</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                    {format(new Date(incident.detected_at), 'MMM d, HH:mm')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {total > 25 && (
          <div className="flex items-center justify-between border-t border-border bg-card/50 px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{((page - 1) * 25) + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 25, total)}</span> of <span className="font-medium text-foreground">{total}</span> results
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => updateFilters("page", String(page - 1))}
                className="border-border bg-card text-foreground hover:bg-secondary h-8 shadow-sm"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page * 25 >= total}
                onClick={() => updateFilters("page", String(page + 1))}
                className="border-border bg-card text-foreground hover:bg-secondary h-8 shadow-sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
