import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  children,
  actions,
  className,
}: {
  title: string
  description?: string
  children?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  const headerActions = actions ?? children

  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>
      {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
    </div>
  )
}
