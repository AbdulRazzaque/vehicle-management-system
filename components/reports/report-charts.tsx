"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { monthlyCosts, topParts, inventoryTrend, departmentExpenses } from "@/lib/data"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius)",
  color: "var(--color-popover-foreground)",
  fontSize: 12,
}

const axisTick = { fill: "var(--color-muted-foreground)", fontSize: 12 }
const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"]

function ChartWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[280px] w-full rounded-lg bg-muted/10 animate-pulse" />
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

export function ReportCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Cost Trend by Type</CardTitle>
          <CardDescription>Monthly maintenance, repair and fuel spend</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <AreaChart data={monthlyCosts} margin={{ left: -16, right: 8 }}>
              <defs>
                <linearGradient id="rm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis tickLine={false} axisLine={false} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="maintenance" stroke="var(--color-chart-1)" fill="url(#rm)" strokeWidth={2} />
              <Area type="monotone" dataKey="repair" stroke="var(--color-chart-4)" fill="url(#rr)" strokeWidth={2} />
            </AreaChart>
          </ChartWrapper>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Share by Department</CardTitle>
          <CardDescription>Distribution of total fleet spend</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <PieChart>
              <Pie
                data={departmentExpenses}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={96}
                paddingAngle={3}
              >
                {departmentExpenses.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="var(--color-card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v.toLocaleString()}`} />
            </PieChart>
          </ChartWrapper>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Used Spare Parts</CardTitle>
          <CardDescription>Units consumed across all vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <BarChart data={topParts} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ ...axisTick, fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={axisTick} />
              <Tooltip cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} contentStyle={tooltipStyle} />
              <Bar dataKey="used" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} barSize={34} />
            </BarChart>
          </ChartWrapper>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Stock Flow</CardTitle>
          <CardDescription>Monthly stock in vs stock out</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <LineChart data={inventoryTrend} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis tickLine={false} axisLine={false} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="stockIn" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stockOut" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartWrapper>
        </CardContent>
      </Card>
    </div>
  )
}
