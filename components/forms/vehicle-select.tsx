'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Vehicle } from '@/lib/data'

export type VehicleSelectProps = {
  id?: string
  value: string
  onValueChange: (value: string) => void
  vehicles: Vehicle[]
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
}

export function formatVehicleTitle(v: Vehicle): string {
  const name = v.name || 'Vehicle'
  const type = v.type ? ` — ${v.type}` : ''
  return `${name}${type}`
}

export function formatVehicleSubtitle(v: Vehicle): string {
  const parts = [v.id, v.plateNumber, v.department].filter(Boolean)
  return parts.join(' • ')
}

export function VehicleSelect({
  id,
  value,
  onValueChange,
  vehicles = [],
  placeholder = 'Select vehicle',
  disabled = false,
  error,
  className,
}: VehicleSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedVehicle = vehicles.find((v) => v.id === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLower = search.toLowerCase().trim()
  const filteredVehicles = vehicles.filter((v) => {
    if (!searchLower) return true
    const title = formatVehicleTitle(v).toLowerCase()
    const subtitle = formatVehicleSubtitle(v).toLowerCase()
    const model = (v.model || '').toLowerCase()
    const reg = (v.registrationNumber || '').toLowerCase()
    return (
      title.includes(searchLower) ||
      subtitle.includes(searchLower) ||
      model.includes(searchLower) ||
      reg.includes(searchLower)
    )
  })

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background/50 px-3 py-1.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
          error
            ? 'border-destructive focus:ring-destructive/30'
            : 'border-border/60 focus:ring-primary/30 hover:border-border',
          open ? 'ring-2 ring-primary/30 border-primary' : ''
        )}
      >
        {selectedVehicle ? (
          <div className="flex flex-col text-left leading-tight overflow-hidden py-0.5">
            <span className="font-medium text-xs text-foreground truncate">
              {formatVehicleTitle(selectedVehicle)}
            </span>
            <span className="text-[11px] font-normal text-muted-foreground truncate mt-0.5">
              {formatVehicleSubtitle(selectedVehicle)}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        )}

        <ChevronDown className={cn('size-4 text-muted-foreground shrink-0 transition-transform duration-200', open ? 'rotate-180' : '')} />
      </button>

      {/* Dropdown Popup */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-border/50 bg-muted/20">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vehicle name, plate, type, department..."
                className="w-full rounded-md bg-background py-1.5 pl-8 pr-7 text-xs border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-border/20">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((v) => {
                const isSelected = v.id === value
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      onValueChange(v.id)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg p-2.5 text-left transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium dark:bg-primary/20'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <div className="flex flex-col text-left leading-tight overflow-hidden pr-2">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {formatVehicleTitle(v)}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {formatVehicleSubtitle(v)}
                      </span>
                    </div>

                    {isSelected && <Check className="size-4 text-primary shrink-0 ml-1" />}
                  </button>
                )
              })
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No vehicles found matching &quot;{search}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
