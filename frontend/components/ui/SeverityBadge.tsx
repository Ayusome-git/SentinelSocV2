import { cn } from "@/lib/utils"

export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string

interface SeverityBadgeProps {
  severity: Severity
  className?: string
  dot?: boolean
}

export function SeverityBadge({ severity, className, dot = true }: SeverityBadgeProps) {
  const upperSeverity = severity?.toUpperCase() || 'INFO'
  
  const getStyles = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          wrapper: 'bg-critical/10 text-critical border-critical/20 shadow-[0_0_10px_rgba(var(--critical),0.1)]',
          dot: 'bg-critical shadow-[0_0_5px_rgba(var(--critical),0.5)]'
        }
      case 'HIGH':
        return {
          wrapper: 'bg-high/10 text-high border-high/20',
          dot: 'bg-high'
        }
      case 'MEDIUM':
        return {
          wrapper: 'bg-medium/10 text-medium border-medium/20',
          dot: 'bg-medium'
        }
      case 'LOW':
        return {
          wrapper: 'bg-low/10 text-low border-low/20',
          dot: 'bg-low'
        }
      case 'INFO':
      default:
        return {
          wrapper: 'bg-info/10 text-info border-info/20',
          dot: 'bg-info'
        }
    }
  }

  const styles = getStyles(upperSeverity)

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm", styles.wrapper, className)}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {upperSeverity === 'CRITICAL' && (
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", styles.dot)}></span>
          )}
          <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", styles.dot)}></span>
        </span>
      )}
      {upperSeverity}
    </span>
  )
}
