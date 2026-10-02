"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  AppWindow, 
  Settings,
  Users,
  Target,
  Cpu,
  Globe,
  Zap,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/lib/permissions"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navigationGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    label: "MONITORING",
    items: [
      { name: "Events", href: "/events", icon: Activity },
      { name: "Alerts", href: "/alerts", icon: AlertTriangle },
      { name: "Incidents", href: "/incidents", icon: ShieldAlert },
      { name: "Correlations", href: "/correlations", icon: Activity },
    ]
  },
  {
    label: "DETECTION",
    items: [
      { name: "Rules", href: "/rules", icon: Target, permission: "RULES_READ" },
      { name: "ML Anomalies", href: "/settings/ml", icon: Cpu },
      { name: "Threat Intelligence", href: "/settings/threat-intelligence", icon: Globe, permission: "THREAT_INTEL_READ" },
    ]
  },
  {
    label: "INTEGRATIONS",
    items: [
      { name: "Applications", href: "/applications", icon: AppWindow },
    ]
  },
  {
    label: "REPORTING",
    items: [
      { name: "Reports", href: "/reports", icon: FileText },
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { hasPermission } = usePermissions()

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r border-border shadow-sm">
      <div className="flex h-14 items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 mr-3 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.15)]">
            <ShieldAlert className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-wide">SentinelSOC</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <nav className="flex-1 space-y-6 px-3">
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter(item => {
              if (!item.permission) return true
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return hasPermission(item.permission as any)
            })

            if (visibleItems.length === 0) return null

            return (
              <div key={group.label} className="space-y-1">
                <h3 className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {group.label}
                </h3>
                <div className="space-y-[2px]">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />
                        )}
                        <item.icon
                          className={cn(
                            "flex-shrink-0 mr-3 h-4 w-4 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-card to-background border border-border shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h4 className="text-xs font-semibold text-foreground mb-1">SOC Engine Active</h4>
          <p className="text-[10px] text-muted-foreground">All systems monitoring</p>
        </div>
      </div>
    </div>
  )
}

