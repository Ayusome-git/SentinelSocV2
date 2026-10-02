"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getIndicators, lookupIndicator } from "@/lib/api/threat_intel";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, ShieldCheck, ShieldAlert, Loader2, Info, Crosshair, Network } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ThreatIntelligencePage() {
  const [lookupValue, setLookupValue] = useState("");
  const [lookupType, setLookupType] = useState("IP_ADDRESS");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<any>(null);
  
  const { data: indicatorsData, isLoading } = useQuery({
    queryKey: ["threat_indicators"],
    queryFn: () => getIndicators({ page_size: 10 })
  });

  const handleLookup = async () => {
    if (!lookupValue) return;
    setIsLookingUp(true);
    setLookupResult(null);
    try {
      const result = await lookupIndicator({ indicator: lookupValue, indicator_type: lookupType });
      setLookupResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
          <Network className="h-6 w-6 text-primary" />
        </div>
        <PageHeader 
          title="Threat Intelligence" 
          description="Configure threat intelligence providers and perform manual lookups."
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel p-0 overflow-hidden flex flex-col h-full">
          <div className="border-b border-border bg-secondary/30 px-6 py-4 flex items-center gap-3">
            <Search className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-semibold text-foreground">Manual Indicator Lookup</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Query an indicator against configured providers</p>
            </div>
          </div>
          <div className="p-6 space-y-4 flex-1">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Select value={lookupType} onValueChange={(v) => setLookupType(v || "IP_ADDRESS")}>
                <SelectTrigger className="w-full sm:w-[140px] bg-input border-border h-10 shrink-0 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="IP_ADDRESS">IP Address</SelectItem>
                  <SelectItem value="DOMAIN">Domain</SelectItem>
                  <SelectItem value="URL">URL</SelectItem>
                  <SelectItem value="HASH_SHA256">SHA256</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Enter indicator value..." 
                value={lookupValue}
                onChange={(e) => setLookupValue(e.target.value)}
                className="bg-input border-border h-10 focus-visible:ring-primary flex-1 font-mono text-sm"
              />
              <Button 
                onClick={handleLookup} 
                disabled={isLookingUp || !lookupValue}
                className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0"
              >
                {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                {isLookingUp ? "Searching..." : "Lookup"}
              </Button>
            </div>
            
            {lookupResult && (
              <div className="mt-6 pt-6 border-t border-border animate-in slide-in-from-bottom-2">
                {lookupResult.found ? (
                  <div className={`rounded-lg border p-4 ${lookupResult.malicious ? 'bg-critical/10 border-critical/20' : 'bg-success/10 border-success/20'}`}>
                    <div className="flex items-start gap-3">
                      {lookupResult.malicious ? <ShieldAlert className="h-5 w-5 text-critical shrink-0 mt-0.5" /> : <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />}
                      <div>
                        <h4 className={`text-sm font-semibold ${lookupResult.malicious ? 'text-critical' : 'text-success'}`}>
                          {lookupResult.malicious ? "Malicious Indicator" : "Benign Indicator"} 
                          <span className="opacity-80 ml-1 font-normal">(Score: {lookupResult.confidence})</span>
                        </h4>
                        <div className="mt-3 space-y-2 text-sm text-foreground/80">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <strong className="text-muted-foreground w-16">Source:</strong> 
                            <span className="bg-background/50 px-2 py-0.5 rounded border border-border/50 text-xs uppercase tracking-wider">{lookupResult.source}</span>
                          </div>
                          {lookupResult.categories && lookupResult.categories.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <strong className="text-muted-foreground w-16">Categories:</strong>
                              <div className="flex flex-wrap gap-1">
                                {lookupResult.categories.map((c: string) => (
                                  <span key={c} className="bg-secondary px-2 py-0.5 rounded border border-border text-xs text-foreground uppercase tracking-wider">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-secondary/50 p-4 flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">No Match Found</h4>
                      <p className="mt-1 text-sm text-muted-foreground">The indicator was not found in the configured Threat Intelligence provider databases.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="glass-panel p-0 overflow-hidden flex flex-col h-full">
          <div className="border-b border-border bg-secondary/30 px-6 py-4 flex items-center gap-3">
            <Crosshair className="h-5 w-5 text-critical" />
            <div>
              <h3 className="text-base font-semibold text-foreground">Recent Intel Detections</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Recently identified malicious indicators</p>
            </div>
          </div>
          <div className="p-0 flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 h-full text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-3" />
                <p className="text-sm font-medium">Loading detections...</p>
              </div>
            ) : indicatorsData?.items && indicatorsData.items.filter((i:any) => i.malicious).length > 0 ? (
              <div className="divide-y divide-border">
                {indicatorsData.items.filter((i:any) => i.malicious).slice(0, 5).map((item:any) => (
                  <div key={item.id} className="flex justify-between items-center p-4 hover:bg-secondary/30 transition-colors group">
                    <div>
                      <div className="font-semibold font-mono text-sm text-foreground">{item.indicator}</div>
                      <div className="text-xs text-muted-foreground flex items-center mt-1.5 gap-2">
                        <span className="bg-secondary/80 border border-border px-1.5 py-0.5 rounded uppercase tracking-wider text-[10px] text-foreground font-medium">{item.indicator_type}</span>
                        <span>Source: <span className="font-medium text-foreground/80">{item.source}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-critical/10 text-critical border border-critical/20 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
                        Conf: {item.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 h-full text-muted-foreground border-t border-transparent bg-secondary/10">
                <ShieldCheck className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">No recent malicious indicators found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
