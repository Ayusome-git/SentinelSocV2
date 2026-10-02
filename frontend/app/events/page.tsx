"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SeverityBadge } from "@/components/ui/SeverityBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { eventsApi } from "@/lib/api/events"
import { applicationsApi } from "@/lib/api/applications"
import type { SecurityEvent, EventAnalyticsResponse } from "@/lib/types/event"
import type { Application } from "@/lib/types/application"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Loader2, AlertTriangle, ShieldAlert, X, Search, Filter, 
  ChevronDown, Copy, CheckCircle2, Clock, Activity 
} from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts'
import { format, subHours, subDays, formatISO } from 'date-fns'

// Format helper
const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

// --- Components ---

function EventDetailDrawer({ 
  event, 
  onClose,
  onFilter 
}: { 
  event: SecurityEvent, 
  onClose: () => void,
  onFilter: (key: string, value: string) => void
}) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!event) return null
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-lg h-full bg-card border-l border-border shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Event Details</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground font-mono">{event.id}</p>
                <button onClick={() => handleCopy('id', event.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {copied === 'id' ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-secondary/30">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Application</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{event.application_name}</p>
                <button 
                  onClick={() => onFilter('application_id', event.application_id)}
                  className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded border border-border hover:text-foreground transition-colors"
                >
                  Filter
                </button>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-secondary/30">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Severity</p>
              <SeverityBadge severity={event.severity} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Overview</h3>
            <div className="grid grid-cols-2 gap-y-6 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Event Type</p>
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-mono text-xs">{event.event_type}</p>
                  <button onClick={() => onFilter('event_type', event.event_type)} className="text-muted-foreground hover:text-primary"><Filter className="h-3 w-3" /></button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                <p className="text-foreground">{format(new Date(event.timestamp), 'PPpp')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="text-foreground bg-secondary/50 p-3 rounded-md border border-border mt-1">{event.message || '—'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Context</h3>
            <div className="grid grid-cols-2 gap-y-6 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Source IP</p>
                {event.source_ip ? (
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-mono text-xs">{event.source_ip}</p>
                    <button onClick={() => handleCopy('ip', event.source_ip!)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {copied === 'ip' ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <button onClick={() => onFilter('source_ip', event.source_ip!)} className="text-muted-foreground hover:text-primary"><Filter className="h-3 w-3" /></button>
                  </div>
                ) : <p className="text-muted-foreground">—</p>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Username</p>
                {event.username || event.user_id ? (
                  <div className="flex items-center gap-2">
                    <p className="text-foreground">{event.username || event.user_id}</p>
                    <button onClick={() => onFilter('username', event.username || event.user_id!)} className="text-muted-foreground hover:text-primary"><Filter className="h-3 w-3" /></button>
                  </div>
                ) : <p className="text-muted-foreground">—</p>}
              </div>
              
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                <p className="text-foreground text-xs break-all bg-secondary/50 p-2 rounded border border-border">{event.user_agent || '—'}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">HTTP Method</p>
                <p className="text-foreground font-mono">{event.http_method || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Path</p>
                {event.request_path ? (
                  <div className="flex items-center gap-2">
                    <p className="text-foreground break-all">{event.request_path}</p>
                    <button onClick={() => onFilter('request_path', event.request_path!)} className="text-muted-foreground hover:text-primary min-w-4"><Filter className="h-3 w-3" /></button>
                  </div>
                ) : <p className="text-muted-foreground">—</p>}
              </div>

              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Request ID</p>
                {event.request_id ? (
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-mono text-xs break-all">{event.request_id}</p>
                    <button onClick={() => handleCopy('req', event.request_id!)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {copied === 'req' ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <button onClick={() => onFilter('request_id', event.request_id!)} className="text-muted-foreground hover:text-primary"><Filter className="h-3 w-3" /></button>
                  </div>
                ) : <p className="text-muted-foreground">—</p>}
              </div>
              
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Session ID</p>
                {event.session_id ? (
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-mono text-xs break-all">{event.session_id}</p>
                    <button onClick={() => handleCopy('sess', event.session_id!)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {copied === 'sess' ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <button onClick={() => onFilter('session_id', event.session_id!)} className="text-muted-foreground hover:text-primary"><Filter className="h-3 w-3" /></button>
                  </div>
                ) : <p className="text-muted-foreground">—</p>}
              </div>
            </div>
          </div>

          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Metadata</h3>
              <div className="rounded-lg border border-border bg-secondary/50 p-4 overflow-x-auto">
                <pre className="text-xs text-foreground font-mono">
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Main Page ---

export default function EventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [analytics, setAnalytics] = useState<EventAnalyticsResponse | null>(null)
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // State from URL
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 50
  
  const search = searchParams.get('search') || ''
  const severity = searchParams.get('severity') || ''
  const eventType = searchParams.get('event_type') || ''
  const appId = searchParams.get('application_id') || ''
  const sourceIp = searchParams.get('source_ip') || ''
  const username = searchParams.get('username') || ''
  const requestPath = searchParams.get('request_path') || ''
  const requestId = searchParams.get('request_id') || ''
  const sessionId = searchParams.get('session_id') || ''
  const timeRange = searchParams.get('time_range') || '24h'
  
  const [searchInput, setSearchInput] = useState(search)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null)

  // Calculate dates based on timeRange
  const getDateRange = useCallback(() => {
    const now = new Date()
    let start: Date
    switch (timeRange) {
      case '1h': start = subHours(now, 1); break;
      case '6h': start = subHours(now, 6); break;
      case '24h': start = subDays(now, 1); break;
      case '7d': start = subDays(now, 7); break;
      case '30d': start = subDays(now, 30); break;
      default: start = subDays(now, 1); break;
    }
    return {
      start_date: formatISO(start),
      end_date: formatISO(now)
    }
  }, [timeRange])

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    // Reset to page 1 if any filter changes
    if (!updates.page && Object.keys(updates).length > 0) {
      params.set('page', '1')
    }
    router.push(`/events?${params.toString()}`)
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchInput) {
        updateUrl({ search: searchInput })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput, search])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const dates = getDateRange()
      const query = {
        application_id: appId,
        event_type: eventType,
        severity: severity,
        source_ip: sourceIp,
        username: username,
        request_path: requestPath,
        request_id: requestId,
        session_id: sessionId,
        search: search,
        start_date: dates.start_date,
        end_date: dates.end_date
      }

      // Load apps if not loaded
      if (apps.length === 0) {
        const appsData = await applicationsApi.list({ page_size: 100 })
        setApps(appsData.items)
      }

      const [eventsData, analyticsData] = await Promise.all([
        eventsApi.list({ ...query, page, page_size: pageSize }),
        eventsApi.getAnalytics(query)
      ])

      setEvents(eventsData.items)
      setAnalytics(analyticsData)
    } catch (e: any) {
      setError(e.message || 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [page, appId, eventType, severity, sourceIp, username, requestPath, requestId, sessionId, search, getDateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const activeFilterCount = [appId, severity, eventType, sourceIp, username, requestPath, requestId, sessionId].filter(Boolean).length

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Event Explorer</h1>
          <p className="text-sm text-muted-foreground mt-1">Investigate and analyze security telemetry across your infrastructure.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-critical/10 border border-critical/20 p-4 flex items-center gap-3 text-critical">
          <AlertTriangle className="h-5 w-5" />
          <div className="text-sm">{error}</div>
          <button onClick={() => fetchData()} className="ml-auto text-sm font-medium hover:underline">Retry</button>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search messages, users, IPs, paths..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={timeRange}
            onChange={e => updateUrl({ time_range: e.target.value })}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-[38px] shadow-sm cursor-pointer"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all h-[38px] shadow-sm ${
              showFilters || activeFilterCount > 0 
                ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                : 'bg-card border-border text-foreground hover:bg-secondary'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="glass-panel p-6 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Severity</label>
              <select 
                value={severity}
                onChange={e => updateUrl({ severity: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">Any Severity</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="INFO">Info</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Application</label>
              <select 
                value={appId}
                onChange={e => updateUrl({ application_id: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">Any Application</option>
                {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Event Type</label>
              <input 
                type="text"
                placeholder="e.g. LOGIN_FAILED"
                value={eventType}
                onChange={e => updateUrl({ event_type: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Source IP</label>
              <input 
                type="text"
                placeholder="192.168.1.1"
                value={sourceIp}
                onChange={e => updateUrl({ source_ip: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Username</label>
              <input 
                type="text"
                value={username}
                onChange={e => updateUrl({ username: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Request Path</label>
              <input 
                type="text"
                value={requestPath}
                onChange={e => updateUrl({ request_path: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Request ID</label>
              <input 
                type="text"
                value={requestId}
                onChange={e => updateUrl({ request_id: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Session ID</label>
              <input 
                type="text"
                value={sessionId}
                onChange={e => updateUrl({ session_id: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <button 
              onClick={() => {
                setSearchInput('')
                router.push('/events')
                setShowFilters(false)
              }}
              className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {severity && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
              Severity: {severity}
              <button onClick={() => updateUrl({ severity: null })} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
          {appId && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
              App: {apps.find(a => a.id === appId)?.name || appId}
              <button onClick={() => updateUrl({ application_id: null })} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
          {eventType && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
              Type: {eventType}
              <button onClick={() => updateUrl({ event_type: null })} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
          {sourceIp && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
              IP: {sourceIp}
              <button onClick={() => updateUrl({ source_ip: null })} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
          {username && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
              User: {username}
              <button onClick={() => updateUrl({ username: null })} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
          {requestPath && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
              Path: {requestPath}
              <button onClick={() => updateUrl({ request_path: null })} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
          {requestId && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
              Req ID: {requestId}
              <button onClick={() => updateUrl({ request_id: null })} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
          {sessionId && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
              Session ID: {sessionId}
              <button onClick={() => updateUrl({ session_id: null })} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          <div className="glass-panel lg:col-span-3 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                 Event Volume <span className="text-xs text-muted-foreground font-normal bg-secondary px-2 py-0.5 rounded-full">{timeRange}</span>
              </h3>
              <div className="text-xs text-muted-foreground font-mono bg-card px-2 py-1 rounded border border-border shadow-sm">
                Total: <span className="text-foreground font-medium">{formatNumber(analytics.total)}</span>
              </div>
            </div>
            <div className="flex-1 min-h-[200px] w-full">
              {analytics.timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timeline} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="eventsChartColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={t => format(new Date(t), timeRange === '24h' || timeRange === '1h' || timeRange === '6h' ? 'HH:mm' : 'MMM d')} 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px', marginBottom: '4px' }}
                      labelFormatter={t => format(new Date(t as string | number), 'PPpp')}
                      cursor={{stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="Events" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#eventsChartColor)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-lg bg-secondary/20">
                  No telemetry data available for this range
                </div>
              )}
            </div>
          </div>
          
          <div className="glass-panel p-6 flex flex-col">
            <h3 className="text-base font-medium text-foreground mb-6">
               Severity Distribution
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(s => {
                const count = analytics.severity_counts[s] || 0
                if (count === 0 && Object.keys(analytics.severity_counts).length > 0) return null
                const colorClass = 
                  s === 'CRITICAL' ? 'bg-critical shadow-[0_0_8px_rgba(var(--critical),0.5)]' :
                  s === 'HIGH' ? 'bg-high shadow-[0_0_8px_rgba(var(--high),0.3)]' :
                  s === 'MEDIUM' ? 'bg-medium' :
                  s === 'LOW' ? 'bg-low' : 'bg-info'
                  
                return (
                  <div key={s} className="flex items-center justify-between group cursor-pointer p-2 rounded-md hover:bg-secondary transition-colors" onClick={() => updateUrl({ severity: s })}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors capitalize">{s.toLowerCase()}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground bg-card px-2 py-0.5 rounded border border-border shadow-sm">{formatNumber(count)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest w-[180px]">Timestamp</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest w-[120px]">Severity</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest w-[200px]">Event Type</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest w-[160px]">Application</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Context</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest text-right">Source IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && events.length === 0 ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-border hover:bg-transparent">
                    <TableCell><Skeleton className="h-4 w-[150px] bg-secondary" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px] bg-secondary" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[150px] bg-secondary" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px] bg-secondary" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[250px] bg-secondary" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-[100px] ml-auto bg-secondary" /></TableCell>
                  </TableRow>
                ))
              ) : events.length === 0 ? (
                <TableRow className="border-border hover:bg-transparent">
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground text-sm">
                    No security events match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                events.map(event => (
                  <TableRow 
                    key={event.id} 
                    className="border-border hover:bg-secondary/50 cursor-pointer transition-colors group"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <TableCell className="text-foreground font-mono text-[11px] whitespace-nowrap">
                      {format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={event.severity} />
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-[11px] font-medium text-foreground truncate max-w-[180px] group-hover:text-primary transition-colors" title={event.event_type}>
                        {event.event_type}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground truncate max-w-[140px]">
                      {event.application_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs truncate max-w-[300px]">
                        {event.username || event.user_id ? (
                          <span className="text-foreground bg-secondary px-2 py-0.5 rounded border border-border">{event.username || event.user_id}</span>
                        ) : null}
                        {event.request_path ? (
                          <span className="text-muted-foreground font-mono bg-card px-2 py-0.5 rounded">{event.request_path}</span>
                        ) : (
                          <span className="text-muted-foreground truncate">{event.message}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground text-right">
                      {event.source_ip || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {analytics && (
          <div className="flex items-center justify-between border-t border-border bg-card/50 px-6 py-4">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{events.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span className="font-medium text-foreground">{Math.min(page * pageSize, analytics.total)}</span> of <span className="font-medium text-foreground">{formatNumber(analytics.total)}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateUrl({ page: String(Math.max(1, page - 1)) })}
                disabled={page === 1 || loading}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => updateUrl({ page: String(page + 1) })}
                disabled={page * pageSize >= analytics.total || loading || analytics.total === 0}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailDrawer 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onFilter={(key, value) => {
            updateUrl({ [key]: value })
            setSelectedEvent(null)
          }}
        />
      )}
    </div>
  )
}
