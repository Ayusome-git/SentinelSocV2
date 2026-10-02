"use client"

import { Search, User, LogOut, ChevronRight, Activity } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { usePathname } from "next/navigation"

export function TopNav() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  
  // Simple breadcrumb logic
  const pathSegments = pathname.split('/').filter(Boolean)
  const currentPage = pathSegments.length > 0 
    ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + pathSegments[pathSegments.length - 1].slice(1)
    : 'Dashboard'

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center text-sm font-medium text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">SentinelSOC</span>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
          <span className="text-foreground">{currentPage}</span>
        </div>
        
        <div className="h-4 w-px bg-border mx-2"></div>
        
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-border shadow-sm text-xs font-medium text-muted-foreground">
          Environment: <span className="text-foreground">PRODUCTION</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-border shadow-sm text-xs font-medium text-muted-foreground">
          System: <span className="flex items-center text-emerald-400 gap-1.5"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Operational</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="flex items-center justify-between w-64 px-3 py-1.5 text-sm text-muted-foreground bg-input/50 hover:bg-input border border-border rounded-md transition-colors shadow-sm group">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span>Search...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-muted-foreground bg-background border border-border rounded opacity-70">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        <div className="h-6 w-px bg-border mx-2"></div>

        <NotificationBell />
        
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium text-foreground leading-none mb-1">{user.full_name || user.email}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.role}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border shadow-sm">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <button 
              onClick={logout}
              className="text-muted-foreground hover:text-foreground transition-colors ml-1 p-1 rounded-md hover:bg-secondary"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border shadow-sm">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </header>
  )
}
