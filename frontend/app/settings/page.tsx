import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Settings, Shield, Link as LinkIcon, Server, Cpu, Key, Database, RefreshCw, Zap, Bell, Users } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your SOC platform and integrations.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
              <p className="text-sm text-muted-foreground">Manage basic platform configuration.</p>
            </div>
          </div>
          <div className="relative z-10 pt-2 border-t border-border/50 flex flex-col gap-3">
             <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Data Retention</span>
                 <span className="text-sm font-medium text-foreground">90 Days</span>
             </div>
             <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Timezone</span>
                 <span className="text-sm font-medium text-foreground">UTC</span>
             </div>
          </div>
          <div className="mt-6 relative z-10">
            <Button disabled className="w-full bg-secondary text-muted-foreground hover:bg-secondary border border-border">Save Changes</Button>
          </div>
        </div>
        
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-info/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 border border-info/20 text-info">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Access Management</h2>
              <p className="text-sm text-muted-foreground">Configure users, roles, and permissions.</p>
            </div>
          </div>
          <div className="relative z-10 pt-2 border-t border-border/50 flex flex-col gap-3">
             <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Active Users</span>
                 <span className="text-sm font-medium text-foreground">12</span>
             </div>
             <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">SSO Provider</span>
                 <span className="text-sm font-medium text-foreground">Okta</span>
             </div>
          </div>
          <div className="mt-6 relative z-10">
            <Link href="/settings/users">
              <Button variant="outline" className="w-full border-info/50 text-foreground hover:bg-info/10 hover:text-info">Manage Access</Button>
            </Link>
          </div>
        </div>
        
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-high/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-high/10 border border-high/20 text-high">
              <LinkIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Integrations</h2>
              <p className="text-sm text-muted-foreground">Connect external services and threat intelligence.</p>
            </div>
          </div>
          <div className="relative z-10 pt-2 border-t border-border/50 flex flex-col gap-3">
             <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Active Webhooks</span>
                 <span className="text-sm font-medium text-foreground">3</span>
             </div>
             <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Threat Intel Feeds</span>
                 <span className="text-sm font-medium text-foreground">AlienVault, MISP</span>
             </div>
          </div>
          <div className="mt-6 relative z-10">
            <Button disabled className="w-full bg-secondary text-muted-foreground hover:bg-secondary border border-border">View Integrations</Button>
          </div>
        </div>
        
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-medium/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-medium/10 border border-medium/20 text-medium">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Machine Learning</h2>
              <p className="text-sm text-muted-foreground">Configure ML models and behavioral analytics.</p>
            </div>
          </div>
          <div className="relative z-10 pt-2 border-t border-border/50 flex flex-col gap-3">
             <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Model Version</span>
                 <span className="text-sm font-medium text-foreground font-mono">v2.4.1</span>
             </div>
             <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Status</span>
                 <span className="text-xs font-semibold uppercase tracking-widest text-success">Healthy</span>
             </div>
          </div>
          <div className="mt-6 relative z-10">
            <Link href="/settings/ml">
               <Button variant="outline" className="w-full border-medium/50 text-foreground hover:bg-medium/10 hover:text-medium">Configure ML</Button>
            </Link>
          </div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group md:col-span-2">
          <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary border border-border text-foreground">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">System & Diagnostics</h2>
              <p className="text-sm text-muted-foreground">Platform status, diagnostic logs, and maintenance.</p>
            </div>
          </div>
          <div className="mt-6 relative z-10 flex gap-4">
            <Button disabled className="bg-secondary text-muted-foreground hover:bg-secondary border border-border">Download Logs</Button>
            <Button disabled className="bg-secondary text-muted-foreground hover:bg-secondary border border-border">System Health Check</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
