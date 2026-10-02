"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getSecurityOverview, exportSecurityOverview } from "@/lib/api/reports";
import { SecurityOverviewReport, ReportFilters } from "@/lib/types/report";
import { applicationsApi } from "@/lib/api/applications";
import { Application } from "@/lib/types/application";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend 
} from "recharts";
import { FileText, Download, Shield, AlertTriangle, Crosshair, CheckCircle2, Loader2, BarChart3, Activity } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  const [report, setReport] = useState<SecurityOverviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [appId, setAppId] = useState<string>("");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applicationsApi.list({ page_size: 100 }).then(res => setApplications(res.items)).catch(console.error);
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      let start = new Date();
      
      if (timeRange === "15m") start.setMinutes(now.getMinutes() - 15);
      else if (timeRange === "1h") start.setHours(now.getHours() - 1);
      else if (timeRange === "6h") start.setHours(now.getHours() - 6);
      else if (timeRange === "24h") start.setHours(now.getHours() - 24);
      else if (timeRange === "7d") start.setDate(now.getDate() - 7);
      else if (timeRange === "30d") start.setDate(now.getDate() - 30);
      
      const params: any = {
        start_date: start.toISOString(),
        end_date: now.toISOString(),
      };
      
      if (appId) params.application_id = appId;
      
      const res = await getSecurityOverview(params);
      setReport(res);
    } catch (e: any) {
      setError(e.message || "Failed to load report");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [timeRange, appId]);

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      if (format === 'pdf') setExportingPdf(true);
      else setExportingCsv(true);
      
      const now = new Date();
      let start = new Date();
      if (timeRange === "15m") start.setMinutes(now.getMinutes() - 15);
      else if (timeRange === "1h") start.setHours(now.getHours() - 1);
      else if (timeRange === "6h") start.setHours(now.getHours() - 6);
      else if (timeRange === "24h") start.setHours(now.getHours() - 24);
      else if (timeRange === "7d") start.setDate(now.getDate() - 7);
      else if (timeRange === "30d") start.setDate(now.getDate() - 30);
      
      const params: any = {
        start_date: start.toISOString(),
        end_date: now.toISOString(),
      };
      if (appId) params.application_id = appId;
      
      const blob = await exportSecurityOverview(params, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security_overview_${now.toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error(`Failed to export ${format}:`, e);
      alert(`Failed to export report as ${format.toUpperCase()}`);
    } finally {
      setExportingPdf(false);
      setExportingCsv(false);
    }
  };

  const trendData = report?.trends.events.map(e => {
    const alertPoint = report.trends.alerts.find(a => a.timestamp === e.timestamp);
    const incidentPoint = report.trends.incidents.find(i => i.timestamp === e.timestamp);
    
    // Format timestamp for display depending on range
    let label = new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    if (timeRange === "7d" || timeRange === "30d") {
      label = new Date(e.timestamp).toLocaleDateString();
    }
    
    return {
      name: label,
      Events: e.count,
      Alerts: alertPoint?.count || 0,
      Incidents: incidentPoint?.count || 0
    };
  }) || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Security Reports" 
          description="Analyze security activity, detections, incidents, risk, and response performance."
        />
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => handleExport('csv')}
            disabled={exportingCsv || loading}
            className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors shadow-sm h-10 w-full sm:w-auto"
          >
            {exportingCsv ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Download className="h-4 w-4 text-muted-foreground" />}
            {exportingCsv ? "Exporting..." : "Export CSV"}
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            disabled={exportingPdf || loading}
            className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors shadow-sm h-10 w-full sm:w-auto"
          >
            {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
            {exportingPdf ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-5 glass-panel">
        <div className="flex flex-col gap-1.5 w-full sm:w-48">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Report Type</label>
          <select className="bg-input border border-border rounded-md text-sm text-foreground px-3 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none transition-all">
            <option value="overview">Security Overview</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-1.5 w-full sm:w-48">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Range</label>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-input border border-border rounded-md text-sm text-foreground px-3 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none transition-all"
          >
            <option value="15m">Last 15 minutes</option>
            <option value="1h">Last 1 hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-1.5 w-full sm:w-64">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Application</label>
          <select 
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            className="bg-input border border-border rounded-md text-sm text-foreground px-3 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none transition-all"
          >
            <option value="">All Applications</option>
            {applications.map(app => (
              <option key={app.id} value={app.id}>{app.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end flex-1 justify-end">
          <button 
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm h-10 w-full sm:w-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center border border-critical/30 bg-critical/10 rounded-xl text-critical shadow-sm">
          <AlertTriangle className="h-10 w-10 mx-auto mb-4 opacity-80" />
          <h3 className="text-lg font-semibold mb-1">Report Generation Failed</h3>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground glass-panel">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-sm font-medium">Generating report data...</p>
        </div>
      ) : report ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Executive Summary */}
          <div className="glass-panel overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
            <div className="p-6 relative z-10">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Executive Summary
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed max-w-4xl">
                During the selected period, SentinelSOC recorded <span className="text-foreground font-semibold bg-secondary/50 px-1.5 py-0.5 rounded border border-border/50">{report.summary.total_events.toLocaleString()}</span> security events
                {appId ? ` for the selected application` : ` across monitored applications`}. 
                The platform generated <span className="text-foreground font-semibold bg-secondary/50 px-1.5 py-0.5 rounded border border-border/50">{report.summary.total_alerts.toLocaleString()}</span> alerts, 
                including <span className="text-critical font-semibold bg-critical/10 px-1.5 py-0.5 rounded border border-critical/20">{report.summary.critical_alerts}</span> critical alerts.
                {report.summary.open_incidents > 0 ? (
                  ` There are ${report.summary.open_incidents} incidents currently open and requiring attention.`
                ) : (
                  ` No incidents are currently open.`
                )}
                {report.summary.average_alert_risk !== null && (
                  ` The average alert risk score was ${Math.round(report.summary.average_alert_risk)}/100.`
                )}
              </p>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
            <div className="glass-panel p-5 flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Total Events</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tighter text-foreground">{report.summary.total_events.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="glass-panel p-5 flex flex-col justify-between group hover:border-critical/50 transition-colors">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Critical Events</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tighter text-critical">{report.summary.critical_events.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="glass-panel p-5 flex flex-col justify-between group hover:border-warning/50 transition-colors">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Alerts</span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-bold tracking-tighter text-warning">{report.summary.open_alerts.toLocaleString()}</span>
                {report.summary.critical_alerts > 0 && (
                  <span className="text-xs font-semibold text-critical bg-critical/10 px-1.5 py-0.5 rounded border border-critical/20">({report.summary.critical_alerts} Critical)</span>
                )}
              </div>
            </div>
            
            <div className="glass-panel p-5 flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Open Incidents</span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-bold tracking-tighter text-foreground">{report.summary.open_incidents.toLocaleString()}</span>
                {report.summary.critical_incidents > 0 && (
                  <span className="text-xs font-semibold text-critical bg-critical/10 px-1.5 py-0.5 rounded border border-critical/20">({report.summary.critical_incidents} Critical)</span>
                )}
              </div>
            </div>
            
            <div className="glass-panel p-5 flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Average Risk</span>
              <div className="flex items-baseline gap-2">
                {report.summary.average_alert_risk !== null ? (
                  <span className="text-3xl font-bold tracking-tighter text-foreground">{Math.round(report.summary.average_alert_risk)}<span className="text-sm text-muted-foreground font-medium ml-1">/100</span></span>
                ) : (
                  <span className="text-lg font-medium text-muted-foreground italic">No data</span>
                )}
              </div>
            </div>
            
            <div className="glass-panel p-5 flex flex-col justify-between group hover:border-success/50 transition-colors">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Response Success</span>
              <div className="flex items-baseline gap-2">
                {report.summary.total_response_actions > 0 ? (
                  <span className="text-3xl font-bold tracking-tighter text-success">
                    {Math.round((report.summary.successful_response_actions / report.summary.total_response_actions) * 100)}%
                  </span>
                ) : (
                  <span className="text-lg font-medium text-muted-foreground italic">No actions</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Security Activity Trend
              </h3>
              <div className="h-[320px] w-full flex-1">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontSize: '12px', padding: '12px' }}
                        itemStyle={{ fontSize: '13px', fontWeight: 500, padding: '2px 0' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px', opacity: 0.8 }} iconType="circle" iconSize={8} />
                      <Line type="monotone" dataKey="Events" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'hsl(var(--muted-foreground))', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="Alerts" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'hsl(var(--warning))', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="Incidents" stroke="hsl(var(--critical))" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'hsl(var(--critical))', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col h-full items-center justify-center text-sm text-muted-foreground bg-secondary/20 rounded-lg border border-dashed border-border/50">
                    <Activity className="h-8 w-8 mb-3 opacity-20" />
                    No activity data in this period
                  </div>
                )}
              </div>
            </div>
            
            <div className="glass-panel p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Severity Distribution (Events)
              </h3>
              <div className="h-[320px] w-full flex-1">
                {report.summary.total_events > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Critical', value: report.summary.critical_events, fill: 'hsl(var(--critical))' },
                      { name: 'High', value: report.summary.high_events, fill: '#f97316' },
                      { name: 'Medium', value: report.summary.medium_events, fill: 'hsl(var(--warning))' },
                      { name: 'Low', value: report.summary.low_events, fill: 'hsl(var(--info))' },
                    ]} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} opacity={0.5} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={60} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{fill: 'hsl(var(--secondary))', opacity: 0.5}}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontSize: '13px' }}
                        itemStyle={{ fontWeight: 500 }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col h-full items-center justify-center text-sm text-muted-foreground bg-secondary/20 rounded-lg border border-dashed border-border/50">
                    <BarChart3 className="h-8 w-8 mb-3 opacity-20" />
                    No events recorded in this period
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      ) : null}
    </div>
  );
}
