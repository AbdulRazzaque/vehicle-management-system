'use client'

import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import {
  monthlyCosts,
  departmentExpenses,
  topParts,
  inventoryTrend,
} from '@/lib/data'

const axis = {
  stroke: 'var(--muted-foreground)',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
}

function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  const mounted = useMounted()

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="h-[260px] w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            {children as React.ReactElement}
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-lg bg-muted/10 animate-pulse" />
        )}
      </div>
    </Card>
  )
}

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: 12,
  color: 'var(--popover-foreground)',
}

export function MaintenanceRepairChart() {
  return (
    <ChartCard
      title="Maintenance vs Repair Cost"
      subtitle="Monthly spend over the last 6 months"
    >
      <AreaChart data={monthlyCosts} margin={{ left: -16, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="gMnt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gRep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="maintenance"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#gMnt)"
        />
        <Area
          type="monotone"
          dataKey="repair"
          stroke="var(--chart-3)"
          strokeWidth={2}
          fill="url(#gRep)"
        />
      </AreaChart>
    </ChartCard>
  )
}

export function ExpenseTrendChart() {
  return (
    <ChartCard title="Fuel Expense Trend" subtitle="Monthly fuel spend">
      <AreaChart data={monthlyCosts} margin={{ left: -16, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="gFuel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="fuel"
          stroke="var(--chart-2)"
          strokeWidth={2}
          fill="url(#gFuel)"
        />
      </AreaChart>
    </ChartCard>
  )
}

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
]

export function DepartmentChart() {
  return (
    <ChartCard
      title="Department-wise Expenses"
      subtitle="Total spend by department"
    >
      <PieChart>
        <Pie
          data={departmentExpenses}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
        >
          {departmentExpenses.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ChartCard>
  )
}

export function TopPartsChart() {
  return (
    <ChartCard
      title="Top Consumed Spare Parts"
      subtitle="Units consumed this quarter"
    >
      <BarChart
        data={topParts}
        layout="vertical"
        margin={{ left: 24, right: 12 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" {...axis} />
        <YAxis type="category" dataKey="name" {...axis} width={80} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
        <Bar dataKey="used" fill="var(--chart-1)" radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ChartCard>
  )
}

export function InventoryTrendChart() {
  return (
    <ChartCard
      title="Inventory Usage Trends"
      subtitle="Stock in vs stock out"
    >
      <BarChart data={inventoryTrend} margin={{ left: -16, right: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
        <Bar dataKey="stockIn" fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={14} />
        <Bar dataKey="stockOut" fill="var(--chart-3)" radius={[4, 4, 0, 0]} barSize={14} />
      </BarChart>
    </ChartCard>
  )
}
