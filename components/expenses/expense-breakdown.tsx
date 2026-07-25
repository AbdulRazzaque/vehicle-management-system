"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/components/data-provider"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell, Tooltip } from "recharts"

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export function ExpenseBreakdown() {
  const { expenses } = useData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const data = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    }
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [expenses])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend by Category</CardTitle>
        <CardDescription>Aggregated expense totals across all departments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    color: "var(--color-popover-foreground)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Total"]}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={22}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full rounded-lg bg-muted/10 animate-pulse" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
