"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SeverityBadge } from "@/components/ui/SeverityBadge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, ArrowLeft, Shield, Clock, CheckCircle2, Save, FileText, Search, Star, Activity, ArrowRight, ShieldAlert, GitMerge, UserIcon } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

import { incidentsApi } from "@/lib/api/incidents"
import { TimelineEntry, EntitiesResponse, IncidentEvidenceResponse } from "@/lib/types/investigation"
import { TimelineEntry as TimelineEntryComponent } from "@/components/investigation/TimelineEntry"
import { EntitySummary } from "@/components/investigation/EntitySummary"
import { KeyEvidencePanel } from "@/components/investigation/KeyEvidencePanel"
import { ResponseActionsPanel } from "@/components/investigation/ResponseActionsPanel"

export default function InvestigationWorkspace() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [incident, setIncident] = useState<any>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [entities, setEntities] = useState<EntitiesResponse | null>(null)
  
  const [pinnedEvidence, setPinnedEvidence] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [newComment, setNewComment] = useState("")
  const [addingComment, setAddingComment] = useState(false)
  
  // Timeline Filters
  const [filterTypes, setFilterTypes] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")

  // Drawer State
  const [selectedEvent, setSelectedEvent] = useState<TimelineEntry | null>(null)

  const fetchWorkspaceData = useCallback(async () => {
    try {
      const incData = await incidentsApi.getIncident(id)
      setIncident(incData)
      
      const timelineData = await incidentsApi.getTimeline(id, { types: filterTypes, search: searchQuery })
      setTimeline((timelineData.items as any) || [])
      
      const entitiesData = await incidentsApi.getEntities(id)
      setEntities(entitiesData as any)
      
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id, filterTypes, searchQuery])

  useEffect(() => {
    fetchWorkspaceData()
  }, [fetchWorkspaceData])

  const handleStatusChange = async (newStatus: string) => {
    try {
      await incidentsApi.updateStatus(id, newStatus)
      await fetchWorkspaceData()
    } catch (err) {
      console.error("Failed to update status", err)
      alert("Failed to update status")
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setAddingComment(true)
    try {
      await incidentsApi.addComment(id, newComment)
      setNewComment("")
      await fetchWorkspaceData()
    } catch (err) {
      console.error("Failed to add comment", err)
      alert("Failed to add comment")
    } finally {
      setAddingComment(false)
    }
  }

  const handleTogglePin = async (entry: TimelineEntry) => {
    const isPinned = pinnedEvidence.some(p => p.evidence_id === (entry.security_event_id || entry.alert_id || entry.correlation_id))
    
    let evType = ""
    let evId = ""
    if (entry.entry_type === "SECURITY_EVENT") { evType = "SECURITY_EVENT"; evId = entry.security_event_id! }
    else if (entry.entry_type === "ALERT") { evType = "ALERT"; evId = entry.alert_id! }
    else if (entry.entry_type === "CORRELATION") { evType = "CORRELATION"; evId = entry.correlation_id! }
    else return

    try {
      if (isPinned) {
        await incidentsApi.removeEvidence(id, evType, evId)
        setPinnedEvidence(prev => prev.filter(p => p.evidence_id !== evId))
      } else {
        await incidentsApi.addEvidence(id, { evidence_type: evType as any, evidence_id: evId })
        setPinnedEvidence(prev => [...prev, { evidence_type: evType, evidence_id: evId }])
      }
      fetchWorkspaceData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleEntityClick = (type: string, value: string) => {
    setSearchQuery(value)
  }

  const scrollToTimelineItem = (itemId: string) => {
    const el = document.getElementById(`timeline-item-${itemId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('bg-primary/20', 'transition-colors', 'duration-1000')
      setTimeout(() => el.classList.remove('bg-primary/20'), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <ShieldAlert className="h-12 w-12 text-critical mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Incident Not Found</h2>
        <p className="text-muted-foreground mb-6">The incident you are looking for does not exist or you do not have permission to view it.</p>
        <Button onClick={() => router.push("/incidents")} variant="outline" className="border-border">Back to Incidents</Button>
      </div>
    )
  }

  // Calculate Metrics
  const eventCount = timeline.filter(t => t.entry_type === "SECURITY_EVENT").length
  const alertCount = timeline.filter(t => t.entry_type === "ALERT").length
  const correlationCount = timeline.filter(t => t.entry_type === "CORRELATION").length
  const ipCount = entities?.source_ips.length || 0
  const userCount = entities?.users.length || 0

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/incidents")} className="hover:bg-secondary rounded-full h-10 w-10 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{incident.incident_number}</h1>
              <SeverityBadge severity={incident.severity} className="text-xs px-2.5 py-0.5 uppercase tracking-wider" />
              {incident.risk_score && (
                <Badge variant="outline" className="border-warning/50 text-warning bg-warning/10 uppercase tracking-wider text-[10px]">Risk {incident.risk_score}</Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
              {incident.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={incident.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] bg-input border-border text-foreground shadow-sm h-10">
              <SelectValue placeholder="Change Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="OPEN" className="cursor-pointer">Open</SelectItem>
              <SelectItem value="INVESTIGATING" className="cursor-pointer">Investigating</SelectItem>
              <SelectItem value="CONTAINED" className="cursor-pointer">Contained</SelectItem>
              <SelectItem value="RESOLVED" className="cursor-pointer">Resolved</SelectItem>
              <SelectItem value="CLOSED" className="cursor-pointer">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        
        {/* Left/Main Column - Workspace */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Investigation Metrics */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Events', value: eventCount },
              { label: 'Alerts', value: alertCount },
              { label: 'Correlations', value: correlationCount },
              { label: 'Key Evidence', value: pinnedEvidence.length },
              { label: 'Source IPs', value: ipCount },
              { label: 'Users', value: userCount },
            ].map((metric, i) => (
              <div key={i} className="glass-panel p-4 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-200 cursor-default">
                <span className="text-2xl font-bold tracking-tight text-foreground">{metric.value}</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">{metric.label}</span>
              </div>
            ))}
          </div>

          {/* Investigation Summary Auto-Generated */}
          {incident.correlation_id && (
            <div className="glass-panel overflow-hidden border-primary/30 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
              <div className="border-b border-border/50 bg-secondary/20 px-5 py-3 relative z-10">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Investigation Summary & Attack Chain
                </h3>
              </div>
              <div className="p-5 relative z-10">
                <p className="text-sm text-foreground/90 leading-relaxed mb-5">
                  A high-confidence attack sequence was detected. Multiple security events triggered a correlation rule resulting in an escalated incident. 
                  Review the attack chain and timeline below to verify the threat and initiate containment actions.
                </p>
                {/* Visual Attack Chain */}
                <div className="flex flex-wrap items-center gap-3 bg-background/50 p-4 rounded-lg border border-border/50 shadow-inner">
                  <div className="flex items-center gap-2 text-xs font-semibold bg-secondary/80 border border-border px-3 py-1.5 rounded-md text-foreground shadow-sm">
                    <Activity className="h-3.5 w-3.5 text-warning" /> Brute Force
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                  <div className="flex items-center gap-2 text-xs font-semibold bg-secondary/80 border border-border px-3 py-1.5 rounded-md text-foreground shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Successful Login
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                  <div className="flex items-center gap-2 text-xs font-semibold bg-secondary/80 border border-border px-3 py-1.5 rounded-md text-foreground shadow-sm">
                    <UserIcon className="h-3.5 w-3.5 text-primary" /> Admin Login
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                  <div className="flex items-center gap-2 text-xs font-semibold bg-secondary/80 border border-border px-3 py-1.5 rounded-md text-foreground shadow-sm">
                    <ShieldAlert className="h-3.5 w-3.5 text-critical" /> Admin Action
                  </div>
                </div>
              </div>
            </div>
          )}

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="bg-secondary border border-border p-1 w-full flex">
              <TabsTrigger value="timeline" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all">Investigation Timeline</TabsTrigger>
              <TabsTrigger value="notes" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all">Analyst Notes</TabsTrigger>
              <TabsTrigger value="response" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all">Response Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search timeline events, users, IPs..." 
                    className="w-full bg-input border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterTypes} onValueChange={(val) => setFilterTypes(val || '')}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-input border-border text-foreground h-10 shadow-sm">
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="" className="cursor-pointer">All Events</SelectItem>
                    <SelectItem value="SECURITY_EVENT" className="cursor-pointer">Security Events</SelectItem>
                    <SelectItem value="ALERT" className="cursor-pointer">Alerts</SelectItem>
                    <SelectItem value="CORRELATION" className="cursor-pointer">Correlations</SelectItem>
                    <SelectItem value="COMMENT" className="cursor-pointer">Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {timeline.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-secondary/30 rounded-lg border border-dashed border-border/50">
                    <GitMerge className="h-10 w-10 mb-4 opacity-50" />
                    <p className="text-sm font-medium">No timeline events match your filters.</p>
                  </div>
                ) : (
                  timeline.map(entry => (
                    <div id={`timeline-item-${entry.id}`} key={entry.id} className="transition-colors rounded-lg">
                      <TimelineEntryComponent 
                        entry={entry} 
                        isPinned={pinnedEvidence.some(p => p.evidence_id === (entry.security_event_id || entry.alert_id || entry.correlation_id))}
                        onTogglePin={handleTogglePin}
                        onEventClick={setSelectedEvent}
                      />
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <div className="glass-panel flex flex-col min-h-[500px]">
                <div className="border-b border-border bg-secondary/30 px-6 py-4">
                  <h3 className="text-base font-semibold text-foreground">Investigation Notes</h3>
                  <p className="text-sm text-muted-foreground mt-1">Append-only audit trail of analyst findings.</p>
                </div>
                <div className="p-6 flex-1 flex flex-col bg-background/30">
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex-1 mb-4">
                    {timeline.filter(t => t.entry_type === 'COMMENT').length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                        <FileText className="h-10 w-10 mb-3" />
                        <span className="text-sm font-medium">No notes yet. Add one below.</span>
                      </div>
                    ) : (
                      timeline.filter(t => t.entry_type === 'COMMENT').map(c => (
                        <div key={c.id} className="bg-card p-4 rounded-lg border border-border/50 shadow-sm">
                          <div className="flex justify-between items-center mb-3 border-b border-border/50 pb-3">
                            <span className="text-sm font-medium text-primary flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="h-3 w-3" />
                              </div>
                              {c.title}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">{format(new Date(c.occurred_at), 'MMM d, HH:mm')}</span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed pl-1">{c.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="pt-5 border-t border-border/50 mt-auto">
                    <Textarea 
                      placeholder="Add a new investigation note..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-input border-border text-foreground min-h-[100px] mb-3 focus:ring-1 focus:ring-primary transition-colors resize-none placeholder:text-muted-foreground text-sm"
                    />
                    <Button 
                      onClick={handleAddComment} 
                      disabled={!newComment.trim() || addingComment}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-10"
                    >
                      {addingComment ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Note
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="response" className="mt-6">
              <ResponseActionsPanel incidentId={id} applicationId={incident.application_id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Entities & Evidence */}
        <div className="space-y-6">
          <KeyEvidencePanel 
            timeline={timeline}
            pinnedEvidence={pinnedEvidence}
            onItemClick={scrollToTimelineItem}
          />

          <EntitySummary 
            entities={entities} 
            onEntityClick={handleEntityClick} 
          />

          <div className="glass-panel overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-5 py-4 flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Timeline Metadata</h3>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Detected</span>
                  <span className="text-foreground font-medium">{format(new Date(incident.detected_at), 'MMM d, yyyy HH:mm:ss')}</span>
                </div>
              </div>
              
              {incident.contained_at && (
                <div className="flex items-center gap-3 group">
                  <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center border border-warning/20 group-hover:border-warning/50 transition-colors">
                    <Shield className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Contained</span>
                    <span className="text-foreground font-medium">{format(new Date(incident.contained_at), 'MMM d, yyyy HH:mm:ss')}</span>
                  </div>
                </div>
              )}
              
              {incident.resolved_at && (
                <div className="flex items-center gap-3 group">
                  <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center border border-success/20 group-hover:border-success/50 transition-colors">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Resolved</span>
                    <span className="text-foreground font-medium">{format(new Date(incident.resolved_at), 'MMM d, yyyy HH:mm:ss')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="glass-panel border-border sm:max-w-2xl bg-background overflow-hidden p-0">
          <DialogHeader className="p-6 border-b border-border bg-secondary/30">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-5 w-5 text-primary" />
              Event Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">Detailed view of the selected timeline event.</DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Timestamp</span>
                  <span className="text-foreground font-mono bg-secondary px-2 py-0.5 rounded border border-border inline-block">{format(new Date(selectedEvent.occurred_at), "yyyy-MM-dd HH:mm:ss")}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Type</span>
                  <span className="text-foreground font-medium">{selectedEvent.title}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Source IP</span>
                  <span className="text-foreground font-mono bg-secondary px-2 py-0.5 rounded border border-border inline-block">{selectedEvent.source_ip || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Username</span>
                  <span className="text-foreground font-medium">{selectedEvent.username || "N/A"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Description</span>
                  <span className="text-foreground leading-relaxed break-all inline-block">{selectedEvent.description || "N/A"}</span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Raw Metadata
                </h4>
                <div className="bg-input p-4 rounded-lg border border-border overflow-x-auto shadow-inner">
                  <pre className="text-xs text-muted-foreground font-mono leading-relaxed">
                    {JSON.stringify(selectedEvent.metadata_fields || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

