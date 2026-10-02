"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getResponseActions, approveResponseAction, executeResponseAction, rejectResponseAction, cancelResponseAction } from "@/lib/api/response";
import { ResponseAction } from "@/lib/types/response";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2, XCircle, ShieldAlert, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function ResponseActionsPage() {
  const [actions, setActions] = useState<ResponseAction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rejectingId, setRejectingId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const data = await getResponseActions({ page_size: 100 });
      setActions(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleApprove = async (id: string) => {
    await approveResponseAction(id);
    fetchActions();
  };

  const handleExecute = async (id: string) => {
    await executeResponseAction(id);
    fetchActions();
  };

  const handleCancel = async (id: string) => {
    await cancelResponseAction(id);
    fetchActions();
  };

  const handleReject = async () => {
    await rejectResponseAction(rejectingId, rejectReason);
    setIsRejectModalOpen(false);
    setRejectReason("");
    fetchActions();
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDING_APPROVAL": return <Badge variant="warning" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case "APPROVED": return <Badge className="bg-primary/10 text-primary border-primary/20">Approved</Badge>;
      case "EXECUTING": return <Badge variant="outline" className="animate-pulse bg-info/10 text-info border-info/20">Executing...</Badge>;
      case "SUCCEEDED": return <Badge variant="default" className="bg-success/10 text-success border-success/20 hover:bg-success/20">Succeeded</Badge>;
      case "FAILED": return <Badge variant="destructive" className="bg-critical/10 text-critical border-critical/20">Failed</Badge>;
      case "REJECTED": return <Badge variant="destructive" className="bg-critical/10 text-critical border-critical/20">Rejected</Badge>;
      case "CANCELLED": return <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border">Cancelled</Badge>;
      default: return <Badge variant="outline" className="bg-secondary text-muted-foreground border-border">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <PageHeader 
        title="Security Response Actions" 
        description="Monitor and approve automated and manual security actions across connected applications."
      />
      
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading actions...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-secondary/30 border-b border-border">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold h-12">Action</TableHead>
                <TableHead className="text-muted-foreground font-semibold h-12">Target</TableHead>
                <TableHead className="text-muted-foreground font-semibold h-12">Status</TableHead>
                <TableHead className="text-muted-foreground font-semibold h-12">Requested At</TableHead>
                <TableHead className="text-muted-foreground font-semibold h-12 text-right">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.length === 0 ? (
                <TableRow className="border-border hover:bg-secondary/50 transition-colors">
                  <TableCell colSpan={5} className="h-32">
                     <div className="flex flex-col items-center justify-center text-muted-foreground">
                       <ShieldAlert className="h-8 w-8 mb-3 opacity-20" />
                       <p className="text-sm">No response actions found</p>
                     </div>
                  </TableCell>
                </TableRow>
              ) : (
                actions.map((action) => (
                  <TableRow key={action.id} className="border-border hover:bg-secondary/50 transition-colors group">
                    <TableCell>
                      <div className="font-semibold text-foreground">{action.action_type}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="uppercase tracking-wider">App</span>
                        <span className="font-mono bg-secondary px-1 py-0.5 rounded border border-border">{action.application_id.substring(0,8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant="outline" className="text-[10px] py-0 bg-background/50 border-border/50 uppercase tracking-wider">{action.target_type}</Badge>
                        <span className="font-mono text-xs text-foreground bg-secondary/50 px-1.5 py-0.5 rounded border border-border/50">{action.target_value}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(action.status)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-medium">
                      {format(new Date(action.requested_at), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        {action.status === "PENDING_APPROVAL" && (
                          <>
                            <Button size="sm" variant="outline" className="border-success/30 text-success hover:bg-success/10 hover:text-success h-8 shadow-sm transition-colors" onClick={() => handleApprove(action.id)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-critical/30 text-critical hover:bg-critical/10 hover:text-critical h-8 shadow-sm transition-colors" onClick={() => { setRejectingId(action.id); setIsRejectModalOpen(true); }}>
                              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                            </Button>
                          </>
                        )}
                        {action.status === "APPROVED" && (
                          <>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 shadow-sm transition-colors" onClick={() => handleExecute(action.id)}>
                              <Play className="h-3.5 w-3.5 mr-1.5" /> Execute
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 hover:bg-secondary text-muted-foreground hover:text-foreground" onClick={() => handleCancel(action.id)}>Cancel</Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="bg-card border-border text-foreground shadow-2xl p-0 overflow-hidden sm:rounded-xl">
          <div className="bg-critical/10 border-b border-critical/20 px-6 py-4 flex items-center gap-3">
             <AlertTriangle className="h-5 w-5 text-critical" />
             <DialogTitle className="text-lg font-semibold">Reject Action</DialogTitle>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reason for Rejection <span className="text-critical">*</span></label>
              <Input 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                className="bg-input border-border focus-visible:ring-primary h-10"
                placeholder="Enter justification for audit logs..."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="bg-secondary/30 px-6 py-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)} className="hover:bg-secondary text-muted-foreground">Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason} className="bg-critical hover:bg-critical/90 text-white shadow-sm">Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
