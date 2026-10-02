import { cn } from "@/lib/utils"

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string

interface RiskBadgeProps {
  level?: RiskLevel
  score?: number
  className?: string
  dot?: boolean
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'MODERATE'
  return 'LOW'
}

export function RiskBadge({ level, score, className, dot = true }: RiskBadgeProps) {
  const finalLevel = level ? level : (score !== undefined ? getRiskLevel(score) : 'LOW')
  const upperLevel = finalLevel?.toUpperCase() || 'LOW'
  
  const getStyles = (lvl: string) => {
    switch (lvl) {
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
      case 'MODERATE':
        return {
          wrapper: 'bg-medium/10 text-medium border-medium/20',
          dot: 'bg-medium'
        }
      case 'LOW':
      default:
        return {
          wrapper: 'bg-low/10 text-low border-low/20',
          dot: 'bg-low'
        }
    }
  }

  const styles = getStyles(upperLevel)

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm", styles.wrapper, className)}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {upperLevel === 'CRITICAL' && (
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", styles.dot)}></span>
          )}
          <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", styles.dot)}></span>
        </span>
      )}
      {upperLevel} {score !== undefined ? `(${score})` : ''}
    </span>
  )
}
