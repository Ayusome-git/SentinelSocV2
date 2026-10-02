"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Activity, ShieldAlert, AppWindow, Zap, RefreshCw, Clock, 
  Server, AlertTriangle, AlertCircle, CheckCircle2, Loader2, ArrowUpRight
} from "lucide-react"
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { dashboardApi } from "@/lib/api/dashboard"
import { DashboardOverviewResponse } from '@/lib/types/dashboard'
import { subMinutes, subHours, subDays, formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts'

const TIME_RANGES = [
  { label: 'Last 15 minutes', value: '15m', getStart: () => subMinutes(new Date(), 15) },
  { label: 'Last 1 hour', value: '1h', getStart: () => subHours(new Date(), 1) },
  { label: 'Last 6 hours', value: '6h', getStart: () => subHours(new Date(), 6) },
  { label: 'Last 24 hours', value: '24h', getStart: () => subHours(new Date(), 24) },
  { label: 'Last 7 days', value: '7d', getStart: () => subDays(new Date(), 7) },
]

const COLORS = {
  INFO: 'hsl(var(--info))',
  LOW: 'hsl(var(--low))',
  MEDIUM: 'hsl(var(--medium))',
  HIGH: 'hsl(var(--high))',
  CRITICAL: 'hsl(var(--critical))',
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const rangeOption = TIME_RANGES.find(r => r.value === timeRange) || TIME_RANGES[3]
      const start = rangeOption.getStart()
      const end = new Date()
      
      const response = await dashboardApi.getOverview({
        start_date: start.toISOString(),
        end_date: end.toISOString()
      })
      setData(response)
      setLastRefreshed(new Date())
    } catch (err: any) {
      console.error("Failed to fetch dashboard data", err)
      setError(err.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchData()
    }, 30000) // 30s
    return () => clearInterval(interval)
  }, [autoRefresh, fetchData])

  const timelineData = useMemo(() => {
    if (!data?.event_timeline) return []
    return data.event_timeline.map(pt => ({
      ...pt,
      displayTime: format(new Date(pt.timestamp), timeRange === '7d' ? 'MMM d' : 'HH:mm')
    }))
  }, [data?.event_timeline, timeRange])

  const severityData = useMemo(() => {
    if (!data?.severity_distribution) return []
    return Object.entries(data.severity_distribution)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [data?.severity_distribution])

  const getSeverityColor = (sev: string) => COLORS[sev as keyof typeof COLORS] || 'hsl(var(--muted-foreground))'

  const freshness = data?.latest_event_timestamp 
    ? formatDistanceToNow(new Date(data.latest_event_timestamp.endsWith('Z') || data.latest_event_timestamp.includes('+') ? data.latest_event_timestamp : data.latest_event_timestamp + 'Z'), { addSuffix: true })
    : 'No events received'

  if (error) {
    return (
      <div className="space-y-6 max-w-7xl animate-in fade-in duration-500">
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Security Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time visibility across your connected applications.</p>
        </div>
        <Card className="bg-critical/10 border-critical/20 shadow-none">
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <AlertCircle className="h-12 w-12 text-critical" />
            <p className="text-foreground font-medium">{error}</p>
            <Button onClick={fetchData} variant="outline" className="border-critical/30 hover:bg-critical/20">Retry Connection</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Security Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time visibility across your connected applications.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(val) => setTimeRange(val || '')}>
            <SelectTrigger className="w-[160px] h-9 bg-card border-border text-xs font-medium shadow-sm">
              <Clock className="mr-2 h-3.5 w-3.5 opacity-70" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {TIME_RANGES.map(r => (
                <SelectItem key={r.value} value={r.value} className="text-xs">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            className={`h-9 w-9 border-border bg-card shadow-sm transition-colors ${autoRefresh ? 'text-primary border-primary/30 bg-primary/10' : 'text-muted-foreground'}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? "Disable Auto-Refresh" : "Enable Auto-Refresh (30s)"}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
          </Button>
          
          <Button 
            variant="default" 
            onClick={fetchData} 
            disabled={loading}
            className="h-9 px-4 text-xs font-medium shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-wider pb-4 border-b border-border">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            {data ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Operational
          </span>
          <span className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 opacity-70" />
            Last Event: <span className="text-foreground capitalize-first">{freshness}</span>
          </span>
        </div>
        <span>
          {autoRefresh ? (
            <span className="flex items-center gap-2 text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span> Auto-Sync Active</span>
          ) : (
            `Updated: ${format(lastRefreshed, 'HH:mm:ss')}`
          )}
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Link href="/events" className="block outline-none group">
          <Card className="glass-panel hover:border-primary/50 transition-all duration-300 h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Events</span>
                <Activity className="h-4 w-4 text-primary opacity-80" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-semibold text-foreground tracking-tight">
                  {loading && !data ? '-' : (data?.total_events || 0).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/events?severity=CRITICAL" className="block outline-none group">
          <Card className="glass-panel hover:border-critical/50 transition-all duration-300 h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-critical/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-critical uppercase tracking-wider">Critical</span>
                <AlertTriangle className="h-4 w-4 text-critical opacity-80" />
              </div>
              <div className="text-3xl font-semibold text-critical tracking-tight">
                {loading && !data ? '-' : (data?.critical_events || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/events?severity=HIGH" className="block outline-none group">
          <Card className="glass-panel hover:border-high/50 transition-all duration-300 h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-high/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-high uppercase tracking-wider">High</span>
                <ShieldAlert className="h-4 w-4 text-high opacity-80" />
              </div>
              <div className="text-3xl font-semibold text-high tracking-tight">
                {loading && !data ? '-' : (data?.high_events || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card className="glass-panel h-full">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Apps</span>
              <AppWindow className="h-4 w-4 text-muted-foreground opacity-80" />
            </div>
            <div className="text-3xl font-semibold text-foreground tracking-tight">
              {loading && !data ? '-' : (data?.active_applications || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel h-full hidden xl:block">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Events / Hour</span>
              <Zap className="h-4 w-4 text-muted-foreground opacity-80" />
            </div>
            <div className="text-3xl font-semibold text-foreground tracking-tight">
              {loading && !data ? '-' : (data?.events_per_hour || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        {/* Main Chart */}
        <Card className="glass-panel lg:col-span-2 xl:col-span-3 flex flex-col">
          <CardHeader className="px-6 py-5 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Telemetry Volume</CardTitle>
                <CardDescription className="text-xs mt-1">Event ingestion over selected time period</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            {loading && !data ? (
              <div className="h-[280px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : timelineData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center border border-dashed border-border rounded-lg bg-secondary/20">
                <p className="text-sm text-muted-foreground">No telemetry data recorded in this timeframe.</p>
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                    <XAxis 
                      dataKey="displayTime" 
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
                      tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '13px' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px', marginBottom: '4px' }}
                      cursor={{stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="Events" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="glass-panel col-span-1 flex flex-col">
          <CardHeader className="px-6 py-5 border-b border-border/50">
            <CardTitle className="text-base font-medium">Severity Distribution</CardTitle>
            <CardDescription className="text-xs mt-1">Breakdown by risk level</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-6 flex flex-col justify-center">
            {loading && !data ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : severityData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No data</p>
              </div>
            ) : (
              <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      animationDuration={1000}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSeverityColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '13px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col -translate-y-[5%] pointer-events-none">
                  <span className="text-2xl font-bold text-foreground">{data?.total_events.toLocaleString()}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
                </div>
              </div>
            )}
            {severityData.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
                {severityData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: getSeverityColor(entry.name) }}></span>
                    <span className="capitalize">{entry.name.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* Threat Activity Feed */}
        <Card className="glass-panel xl:col-span-2">
          <CardHeader className="px-6 py-5 border-b border-border/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Live Activity Feed</CardTitle>
              <CardDescription className="text-xs mt-1">Real-time security telemetry</CardDescription>
            </div>
            <Link href="/events" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {(!data?.recent_events || data.recent_events.length === 0) ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent activity detected.
              </div>
            ) : (
              <div className="flex flex-col">
                {data.recent_events.map((event, i) => (
                  <div key={event.id} className={`flex items-start gap-4 p-4 hover:bg-secondary/30 transition-colors ${i !== data.recent_events!.length - 1 ? 'border-b border-border/50' : ''}`}>
                    <div className="flex flex-col items-center gap-2 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: getSeverityColor(event.severity) }} />
                      {i !== data.recent_events!.length - 1 && <div className="w-px h-10 bg-border" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Link href={`/events?event_type=${event.event_type}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          {event.event_type}
                        </Link>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {format(new Date(event.timestamp.endsWith('Z') || event.timestamp.includes('+') ? event.timestamp : event.timestamp + 'Z'), 'HH:mm:ss')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Server className="h-3 w-3" /> {event.application_name}</span>
                        {event.username && <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-[10px]">{event.username}</span>}
                        {event.source_ip && <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-[10px]">{event.source_ip}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk & App Summary */}
        <div className="flex flex-col gap-6">
          <Card className="glass-panel flex-1">
            <CardHeader className="px-5 py-4 border-b border-border/50">
              <CardTitle className="text-sm font-medium">Risk Posture</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {(!data?.risk_summary || Object.keys(data.risk_summary).length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active risk factors</p>
              ) : (
                <div className="space-y-3">
                  {['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(level => {
                    const count = data.risk_summary![level] || 0;
                    if (count === 0) return null;
                    const colorClass = 
                      level === 'CRITICAL' ? 'text-critical bg-critical/10 border-critical/20' :
                      level === 'HIGH' ? 'text-high bg-high/10 border-high/20' :
                      level === 'MODERATE' ? 'text-medium bg-medium/10 border-medium/20' : 'text-low bg-low/10 border-low/20';
                      
                    return (
                      <div key={level} className="flex items-center justify-between p-2.5 rounded-lg border bg-card/50 hover:bg-secondary/50 transition-colors">
                        <span className="text-xs font-medium text-foreground tracking-wide capitalize">{level.toLowerCase()} Alerts</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${colorClass}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel flex-1">
            <CardHeader className="px-5 py-4 border-b border-border/50">
              <CardTitle className="text-sm font-medium">App Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {(!data?.application_activity || data.application_activity.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-6">No applications active.</p>
              ) : (
                <div className="flex flex-col">
                  {data.application_activity.slice(0, 4).map((app, i) => (
                    <div key={app.application_id} className={`flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors ${i !== Math.min(3, data.application_activity!.length - 1) ? 'border-b border-border/50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded bg-secondary flex items-center justify-center border border-border">
                          <AppWindow className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs font-medium text-foreground">{app.application_name}</span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{app.event_count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
