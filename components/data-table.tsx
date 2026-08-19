"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type Column<T> = {
  key: string
  header: string
  className?: string
  sortable?: boolean
  render?: (row: T) => ReactNode
}

export type FilterConfig = {
  key: string
  label: string
  options: string[]
}

export type SingleFilterConfig<T> = {
  placeholder?: string
  options: string[]
  accessor: (row: T) => any
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys,
  searchPlaceholder = "Search...",
  filter,
  filters,
  toolbar,
  onRowClick,
}: {
  data: T[]
  columns: Column<T>[]
  searchKeys: (keyof T)[]
  searchPlaceholder?: string
  filter?: SingleFilterConfig<T>
  filters?: FilterConfig[]
  toolbar?: ReactNode
  onRowClick?: (row: T) => void
}) {
  const [query, setQuery] = useState("")
  const [singleFilterVal, setSingleFilterVal] = useState("all")
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const processed = useMemo(() => {
    let rows = data.filter((row) => {
      const matchesQuery =
        query === "" ||
        searchKeys.some((k) =>
          String(row[k] ?? "")
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      const matchesSingleFilter =
        !filter ||
        singleFilterVal === "all" ||
        String(filter.accessor(row)) === singleFilterVal
      const matchesFilters =
        !filters ||
        filters.every((f) => {
          const v = filterValues[f.key]
          return !v || v === "all" || String(row[f.key]) === v
        })
      return matchesQuery && matchesSingleFilter && matchesFilters
    })

    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (typeof av === "number" && typeof bv === "number") {
          return sortDir === "asc" ? av - bv : bv - av
        }
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av))
      })
    }

    return rows
  }, [data, query, filterValues, filters, searchKeys, sortKey, sortDir])

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-9"
          />
        </div>
        {filter && (
          <Select value={singleFilterVal} onValueChange={setSingleFilterVal}>
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder={filter.placeholder || "Filter"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.placeholder || "All"}</SelectItem>
              {filter.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {filters?.map((f) => (
          <Select
            key={f.key}
            value={filterValues[f.key] ?? "all"}
            onValueChange={(v) => setFilterValues((prev) => ({ ...prev, [f.key]: v }))}
          >
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {f.label}</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {toolbar}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                    >
                      {c.header}
                      {sortKey === c.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processed.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              processed.map((row, i) => (
                <TableRow
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render ? c.render(row) : (row[c.key] as ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span>
          Showing {processed.length} of {data.length} records
        </span>
      </div>
    </Card>
  )
}
