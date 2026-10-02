"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { alertsApi } from "@/lib/api/alerts"
import { usersApi } from "@/lib/api/users"
import { Alert, AlertComment } from "@/lib/types/alert"
import { User } from "@/lib/types/user"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SeverityBadge } from "@/components/ui/SeverityBadge"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import Link from "next/link"
import { Loader2, Send, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert, User as UserIcon, Activity, ListTree, BugPlay, Shield, MessageSquare, Briefcase } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AlertDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  const [alert, setAlert] = useState<Alert | null>(null)
  const [comments, setComments] = useState<AlertComment[]>([])
  const [users, setUsers] = useState<User[]>([])
  
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  const [newComment, setNewComment] = useState("")

  const fetchData = async () => {
    try {
      const [alertData, commentsData, usersData] = await Promise.all([
        alertsApi.getAlert(params.id),
        alertsApi.getComments(params.id),
        usersApi.getUsers()
      ])
      setAlert(alertData)
      setComments(commentsData)
      setUsers(usersData.items.filter(u => u.is_active))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [params.id])

  const handleAction = async (action: 'acknowledge' | 'resolve' | 'falsePositive') => {
    setActionLoading(true)
    try {
      if (action === 'acknowledge') await alertsApi.acknowledge(params.id)
      if (action === 'resolve') await alertsApi.resolve(params.id)
      if (action === 'falsePositive') await alertsApi.markFalsePositive(params.id)
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateIncident = async () => {
    setActionLoading(true)
    try {
      const res = await alertsApi.createIncident(params.id)
      try {
        router.push(`/incidents/${res.incident_id}`)
      } catch (navErr) {
        window.location.href = `/incidents/${res.incident_id}`
      }
    } catch (err) {
      console.error(err)
      window.alert(`Failed to create incident: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssign = async (userId: string | null) => {
    setActionLoading(true)
    try {
      await alertsApi.assign(params.id, userId === "unassigned" || userId === null ? null : userId)
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setActionLoading(true)
    try {
      await alertsApi.addComment(params.id, newComment)
      setNewComment("")
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
  if (!alert) return <div className="p-8 text-critical">Alert not found.</div>

  const isTerminal = alert.status === "RESOLVED" || alert.status === "FALSE_POSITIVE"

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title={alert.title}
          description={`Detected at ${format(new Date(alert.detected_at), 'MMM d, yyyy HH:mm:ss')}`}
        />
        
        {/* Action Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="default"
            size="sm"
            onClick={handleCreateIncident}
            disabled={actionLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            Create Incident
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAction('acknowledge')}
            disabled={alert.status !== "OPEN" || actionLoading || isTerminal}
            className="border-warning/30 text-warning hover:bg-warning/10"
          >
            <ShieldCheck className="h-4 w-4 mr-2" /> Acknowledge
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAction('resolve')}
            disabled={actionLoading || isTerminal}
            className="border-success/30 text-success hover:bg-success/10"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" /> Resolve
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAction('falsePositive')}
            disabled={actionLoading || isTerminal}
            className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <AlertTriangle className="h-4 w-4 mr-2" /> False Positive
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Alert Summary</h3>
              </div>
              <Badge variant={
                alert.status === 'OPEN' ? 'destructive' : 
                alert.status === 'ACKNOWLEDGED' ? 'warning' : 
                alert.status === 'RESOLVED' ? 'outline' : 'secondary'
              } className="uppercase tracking-wider text-[10px] font-semibold">{alert.status}</Badge>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Description</span>
                  <p className="mt-1.5 text-foreground leading-relaxed text-sm">{alert.description || 'No description provided.'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px]">Application ID</span>
                  <p className="mt-1.5 text-foreground font-mono text-sm bg-secondary inline-block px-2 py-0.5 rounded border border-border">{alert.application_id}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BugPlay className="h-4 w-4 text-primary" />
                  Detection Explanation
                </h3>
                <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {alert.detection_source === "ML" 
                      ? "This alert was generated by the Machine Learning Anomaly Detection Engine because application behavior deviated significantly from learned baselines."
                      : alert.correlation_id 
                        ? "This alert was generated by the Event Correlation Engine because a sequence of events matched a defined correlation rule indicating a composite attack."
                        : "This alert was generated by the Rule-Based Detection Engine because a security event matched a configured detection rule."}
                  </p>
                </div>
              </div>

              {alert.threat_intel_indicators && alert.threat_intel_indicators.length > 0 && (
                <div className="pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-warning" />
                    Threat Intelligence Insights
                  </h3>
                  <div className="space-y-3">
                    {alert.threat_intel_indicators.map((ti: any) => (
                      <div key={ti.id} className="p-4 bg-background/50 rounded-lg border border-border/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            {ti.malicious ? <ShieldAlert className="h-4 w-4 text-critical" /> : <ShieldCheck className="h-4 w-4 text-success" />}
                            <span className="font-mono text-sm text-foreground bg-secondary px-2 py-0.5 rounded border border-border">{ti.indicator}</span>
                            <Badge variant="outline" className="text-[10px] py-0 tracking-wider bg-transparent">{ti.indicator_type}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                            Source: {ti.source}
                          </div>
                        </div>
                        <Badge variant={ti.malicious ? "destructive" : "secondary"} className="self-start sm:self-auto">
                          Confidence: {ti.confidence}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="glass-panel flex flex-col h-[600px] overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-6 py-4">
              <div className="flex items-center gap-3 mb-1">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Analyst Investigation Notes</h3>
              </div>
              <p className="text-sm text-muted-foreground">Append-only audit trail of analyst findings.</p>
            </div>
            <div className="flex-1 flex flex-col min-h-0 p-6 bg-background/30">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 custom-scrollbar">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                    <MessageSquare className="h-10 w-10 mb-3" />
                    <span className="text-sm font-medium">No investigation notes yet.</span>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="p-4 bg-card rounded-lg border border-border/50 shadow-sm">
                      <div className="flex justify-between items-center mb-3 border-b border-border/50 pb-3">
                        <span className="text-sm font-medium text-primary flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="h-3 w-3" />
                          </div>
                          {users.find(u => u.id === comment.user_id)?.full_name || comment.user_id}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {format(new Date(comment.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed pl-1">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-border/50">
                <Textarea 
                  placeholder="Add a note to the investigation..." 
                  className="bg-input border-border resize-none h-24 mb-3 focus:ring-1 focus:ring-primary transition-colors text-sm placeholder:text-muted-foreground"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <Button 
                  className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border" 
                  onClick={handleAddComment}
                  disabled={actionLoading || !newComment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" /> Submit Note
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="glass-panel overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-5 py-4 flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Assignment</h3>
            </div>
            <div className="p-5">
              <Select 
                value={alert.assigned_to || "unassigned"} 
                onValueChange={handleAssign}
                disabled={actionLoading}
              >
                <SelectTrigger className="w-full bg-input border-border text-foreground h-10 focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="unassigned" className="italic text-muted-foreground">Unassigned</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {u.full_name || u.email}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-5 py-4 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Risk & Priority</h3>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Severity</span>
                <SeverityBadge severity={alert.severity} className="text-sm px-3 py-1" />
              </div>
              
              <div className="pt-5 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Risk Score</span>
                <div className="flex items-end gap-3">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold tracking-tighter text-foreground">{alert.risk_score || 0}</span>
                    <span className="text-muted-foreground font-medium ml-1">/100</span>
                  </div>
                  {alert.risk_level && (
                    <Badge variant={
                      alert.risk_level === 'CRITICAL' ? 'destructive' :
                      alert.risk_level === 'HIGH' ? 'destructive' :
                      alert.risk_level === 'MODERATE' ? 'warning' : 'secondary'
                    } className="mb-1">{alert.risk_level}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {alert.risk_factors && (
            <div className="glass-panel overflow-hidden">
              <div className="border-b border-border bg-secondary/30 px-5 py-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Risk Factors
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {Object.entries(alert.risk_factors).map(([factor, score]) => (
                    <div key={factor} className="flex items-center justify-between group">
                      <span className="text-sm text-foreground capitalize group-hover:text-primary transition-colors">{factor.replace('_', ' ')}</span>
                      <span className="font-mono text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded">+{score}</span>
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Final Score</span>
                    <span className="font-mono font-bold text-primary">{alert.risk_score}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-5 py-4 flex items-center gap-3">
              <ListTree className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Security Evidence</h3>
            </div>
            <div className="p-5 space-y-4">
              {alert.correlation_id ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">This alert originated from a correlated sequence.</p>
                  <Link href={`/correlations/${alert.correlation_id}`} className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium w-full h-10 transition-colors">
                    <ListTree className="h-4 w-4" />
                    View Correlated Sequence
                  </Link>
                </div>
              ) : alert.security_event_id ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">This alert originated from a single detection event.</p>
                  <Link href={`/events/${alert.security_event_id}`} className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium w-full h-10 transition-colors">
                    <Activity className="h-4 w-4" />
                    View Triggering Event
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground bg-background/50 rounded border border-border/50">
                  <ShieldCheck className="h-6 w-6 mb-2 opacity-50" />
                  <p className="text-sm font-medium">No direct evidence linked.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

