'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navItems, navGroups } from '@/lib/nav'
import { ScrollArea } from '@/components/ui/scroll-area'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Gauge className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Tharb</p>
          <p className="text-[11px] text-muted-foreground">Tharb Fleet Management</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-5">
          {navGroups.map((group) => (
            <div key={group} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
              {navItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const active =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.title}
                    </Link>
                  )
                })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent px-3 py-2.5">
          <p className="text-xs font-medium text-sidebar-accent-foreground">
            All systems operational
          </p>
          <p className="text-[11px] text-muted-foreground">v2.4.0 · Enterprise</p>
        </div>
      </div> */}
    </div>
  )
}
