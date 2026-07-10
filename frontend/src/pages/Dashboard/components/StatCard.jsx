import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/lib/utils'

const StatCard = ({
  icon: Icon,
  iconClassName,
  iconBgClassName,
  value,
  label,
  sublabel,
  sublabelClassName,
  onDoubleClick,
  loading = false,
}) => {
  return (
    <div
      onDoubleClick={onDoubleClick}
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors sm:p-6',
        onDoubleClick && 'cursor-pointer hover:bg-muted/40',
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            iconBgClassName,
          )}
        >
          <Icon className={cn('h-5 w-5', iconClassName)} />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {loading ? '—' : value}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        <p className={cn('mt-2 text-sm font-medium', sublabelClassName)}>
          {sublabel}
        </p>
      </div>
    </div>
  )
}

export default StatCard
