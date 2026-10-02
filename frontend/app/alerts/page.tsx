"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { SeverityBadge } from "@/components/ui/SeverityBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertCircle, ShieldAlert, CheckCircle2, XCircle, Search, Filter, Loader2, ChevronDown, Flame, Activity } from "lucide-react"

import { alertsApi } from "@/lib/api/alerts"
import { Alert, AlertSummary } from "@/lib/types/alert"
import Link from "next/link"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function AlertsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [summary, setSummary] = useState<AlertSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // Filters from URL
  const page = parseInt(searchParams.get("page") || "1")
  const status = searchParams.get("status") || "ALL"
  const risk_level = searchParams.get("risk_level") || "ALL"
  const search = searchParams.get("search") || ""
  const view = searchParams.get("view") || "triage" // triage or all
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, page_size: 25 }
      
      if (search) params.search = search
      if (status !== "ALL") params.status = status
      if (risk_level !== "ALL") params.risk_level = risk_level
      
      if (view === "triage") {
        params.sort_by = "risk_score"
        params.sort_dir = "desc"
      } else {
        params.sort_by = "detected_at"
        params.sort_dir = "desc"
      }

      const res = await alertsApi.getAlerts(params)
      setAlerts(res.items)
      setTotal(res.total)

      const sumRes = await alertsApi.getSummary()
      setSummary(sumRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, status, risk_level, search, view])

  useEffect(() => {
    fetchAlerts()
    
    // Auto-refresh the alerts page every 10 seconds so the demo is seamless!
    const interval = setInterval(() => {
      fetchAlerts()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [fetchAlerts])

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "ALL") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== "page") params.set("page", "1")
    router.push(`/alerts?${params.toString()}`)
  }

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === alerts.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(alerts.map(a => a.id)))
  }

  const handleBulkAction = async (action: 'ACKNOWLEDGE' | 'ASSIGN' | 'RESOLVE' | 'FALSE_POSITIVE') => {
    if (selectedIds.size === 0) return
    setBulkActionLoading(true)
    try {
      await alertsApi.bulkAction(Array.from(selectedIds), action)
      setSelectedIds(new Set())
      await fetchAlerts()
    } catch (err) {
      console.error(err)
      alert("Failed to execute bulk action")
    } finally {
      setBulkActionLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Alert Management</h1>
          <p className="text-sm text-muted-foreground mt-1">SOC Analyst queue for investigating and resolving security threats.</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-info/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Open Alerts</h3>
            <AlertCircle className="h-4 w-4 text-info" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">{summary?.open ?? '-'}</div>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-medium/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Acknowledged</h3>
            <ShieldAlert className="h-4 w-4 text-medium" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">{summary?.acknowledged ?? '-'}</div>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group border-critical/30 shadow-[0_0_15px_rgba(var(--critical),0.1)]">
          <div className="absolute inset-0 bg-critical/10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-critical/20 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
          <div className="flex flex-row items-center justify-between pb-2 relative z-10">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-critical">Critical Risk</h3>
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
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
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
              placeholder="Search alerts..."
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
              <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="FALSE_POSITIVE">False Positive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={risk_level} onValueChange={(val) => updateFilters("risk_level", val)}>
            <SelectTrigger className="w-[160px] bg-card border-border text-foreground shadow-sm h-10 rounded-lg">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="ALL">All Risks</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MODERATE">Moderate</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border shadow-inner">
          <Button 
            variant={view === "triage" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => updateFilters("view", "triage")}
            className={`rounded-md transition-all ${view === "triage" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary"}`}
          >
            Triage View
          </Button>
          <Button 
            variant={view === "all" ? "default" : "ghost"} 
            size="sm"
            onClick={() => updateFilters("view", "all")}
            className={`rounded-md transition-all ${view === "all" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary"}`}
          >
            All Alerts
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
          <div className="text-sm font-medium text-primary">
            <span className="font-bold">{selectedIds.size}</span> alert(s) selected
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-primary/50 bg-background hover:bg-primary/20 text-foreground h-9 px-3">
                  Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                <DropdownMenuItem onClick={() => handleBulkAction('ACKNOWLEDGE')} disabled={bulkActionLoading} className="cursor-pointer hover:bg-secondary">
                  Acknowledge Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('RESOLVE')} disabled={bulkActionLoading} className="cursor-pointer hover:bg-secondary">
                  Resolve Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('FALSE_POSITIVE')} disabled={bulkActionLoading} className="text-critical focus:text-critical cursor-pointer hover:bg-critical/10">
                  Mark as False Positive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[40px] text-muted-foreground text-center">
                <Checkbox 
                  checked={alerts.length > 0 && selectedIds.size === alerts.length} 
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Priority (Risk)</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest w-[40%]">Alert details</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Assigned</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Detected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-border hover:bg-transparent">
                  <TableCell><Skeleton className="h-4 w-4 bg-secondary" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[100px] bg-secondary" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-full max-w-[400px] bg-secondary" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[100px] rounded-full bg-secondary" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px] bg-secondary" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[120px] bg-secondary" /></TableCell>
                </TableRow>
              ))
            ) : alerts.length === 0 ? (
              <TableRow className="border-border hover:bg-secondary/50">
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No alerts match your criteria.
                </TableCell>
              </TableRow>
            ) : (
              alerts.map(alert => (
                <TableRow key={alert.id} className="border-border hover:bg-secondary/50 transition-colors group">
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedIds.has(alert.id)}
                      onCheckedChange={() => toggleSelection(alert.id)}
                      aria-label="Select alert"
                      className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableCell>
                  <TableCell>
                    {alert.risk_level ? (
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                          alert.risk_level === 'CRITICAL' ? 'text-critical drop-shadow-[0_0_8px_rgba(var(--critical),0.5)]' :
                          alert.risk_level === 'HIGH' ? 'text-high' :
                          alert.risk_level === 'MODERATE' ? 'text-medium' : 'text-low'
                        }`}>{alert.risk_level}</span>
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full ${
                                alert.risk_level === 'CRITICAL' ? 'bg-critical' :
                                alert.risk_level === 'HIGH' ? 'bg-high' :
                                alert.risk_level === 'MODERATE' ? 'bg-medium' : 'bg-low'
                               }`}
                               style={{ width: `${Math.min(100, Math.max(0, alert.risk_score || 0))}%` }}
                             />
                           </div>
                           <span className="text-[10px] font-mono text-muted-foreground">{alert.risk_score || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <SeverityBadge severity={alert.severity} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/alerts/${alert.id}`} className="font-medium text-foreground hover:text-primary transition-colors block">
                      {alert.title}
                    </Link>
                    {alert.description && (
                      <span className="text-xs text-muted-foreground block truncate mt-1">{alert.description}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      bg-transparent border transition-colors
                      ${alert.status === 'OPEN' ? 'border-critical/50 text-critical bg-critical/5' : 
                        alert.status === 'ACKNOWLEDGED' ? 'border-medium/50 text-medium bg-medium/5' : 
                        alert.status === 'RESOLVED' ? 'border-success/50 text-success bg-success/5' : 
                        'border-muted-foreground/50 text-muted-foreground bg-secondary/50'}
                    `}>{alert.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {alert.assigned_to ? (
                      <span className="text-xs font-medium text-foreground bg-secondary px-2 py-1 rounded border border-border">Assigned</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                    {format(new Date(alert.detected_at.endsWith('Z') || alert.detected_at.includes('+') ? alert.detected_at : alert.detected_at + 'Z'), 'MMM d, HH:mm')}
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
