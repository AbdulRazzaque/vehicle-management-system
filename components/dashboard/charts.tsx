'use client'

import { useEffect, useState } from 'react'
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
} from 'recharts'
import { Card } from '@/components/ui/card'
import { useData } from '@/components/data-provider'
import { sumItems, type Vehicle, type Maintenance, type Repair, type InventoryItem, type Expense } from '@/lib/data'

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

// Helpers for dynamic data calculations
function getMonthlyCosts(maintenance: Maintenance[], repairs: Repair[], expenses: Expense[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const result = []
  
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthLabel = months[d.getMonth()]
    const monthNum = d.getMonth()
    const year = d.getFullYear()

    const mCost = maintenance
      .filter((m) => {
        const recordDate = new Date(m.date)
        return recordDate.getMonth() === monthNum && recordDate.getFullYear() === year
      })
      .reduce((sum, m) => sum + (m.cost && m.cost > 0 ? m.cost : sumItems(m.items || [])), 0)

    const rCost = repairs
      .filter((r) => {
        const recordDate = new Date(r.date)
        return recordDate.getMonth() === monthNum && recordDate.getFullYear() === year
      })
      .reduce((sum, r) => sum + (r.cost && r.cost > 0 ? r.cost : sumItems(r.items || [])), 0)

    const fCost = expenses
      .filter((e) => {
        const recordDate = new Date(e.date)
        return e.category === 'Fuel Cost' && recordDate.getMonth() === monthNum && recordDate.getFullYear() === year
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0)

    result.push({
      month: monthLabel,
      maintenance: mCost,
      repair: rCost,
      fuel: fCost,
    })
  }
  return result
}

function getDepartmentExpenses(vehicles: Vehicle[], maintenance: Maintenance[], repairs: Repair[], expenses: Expense[]) {
  const deptMap: Record<string, number> = {}

  // Defaults
  const defaultDepts = ['Logistics', 'Field Service', 'Operations', 'Executive']
  defaultDepts.forEach((d) => {
    deptMap[d] = 0
  })

  vehicles.forEach((v) => {
    const dept = v.department || 'Operations'
    if (!deptMap[dept]) deptMap[dept] = 0

    const mSum = maintenance
      .filter((m) => m.vehicleId === v.id)
      .reduce((sum, m) => sum + (m.cost && m.cost > 0 ? m.cost : sumItems(m.items || [])), 0)

    const rSum = repairs
      .filter((r) => r.vehicleId === v.id)
      .reduce((sum, r) => sum + (r.cost && r.cost > 0 ? r.cost : sumItems(r.items || [])), 0)

    const eSum = expenses
      .filter((e) => e.vehicleId === v.id)
      .reduce((sum, e) => sum + (e.amount || 0), 0)

    deptMap[dept] += (mSum + rSum + eSum)
  })

  return Object.entries(deptMap).map(([name, value]) => ({ name, value }))
}

function getTopParts(maintenance: Maintenance[], repairs: Repair[]) {
  const partsMap: Record<string, number> = {}

  maintenance.forEach((m) => {
    ;(m.items || []).forEach((item) => {
      const name = item.name || 'Other'
      partsMap[name] = (partsMap[name] || 0) + (item.quantity || 0)
    })
  })

  repairs.forEach((r) => {
    ;(r.items || []).forEach((item) => {
      const name = item.name || 'Other'
      partsMap[name] = (partsMap[name] || 0) + (item.quantity || 0)
    })
  })

  const sorted = Object.entries(partsMap)
    .map(([name, used]) => ({ name, used }))
    .sort((a, b) => b.used - a.used)

  if (sorted.length === 0) {
    return [
      { name: 'Engine Oil', used: 0 },
      { name: 'Brake Pads', used: 0 },
      { name: 'Oil Filter', used: 0 },
      { name: 'Coolant', used: 0 },
      { name: 'Air Filter', used: 0 },
    ]
  }

  return sorted.slice(0, 5)
}

function getInventoryStockData(inventory: InventoryItem[]) {
  if (inventory.length === 0) {
    return [
      { month: 'Empty', CurrentStock: 0, MinRequired: 0 }
    ]
  }
  return inventory.slice(0, 6).map((item) => ({
    month: item.code || item.name.slice(0, 8),
    CurrentStock: item.stock,
    MinRequired: item.minStock,
  }))
}

export function MaintenanceRepairChart() {
  const { maintenance, repairs, expenses } = useData()
  const data = getMonthlyCosts(maintenance, repairs, expenses)

  return (
    <ChartCard
      title="Maintenance vs Repair Cost"
      subtitle="Monthly spend over the last 6 months"
    >
      <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
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
  const { maintenance, repairs, expenses } = useData()
  const data = getMonthlyCosts(maintenance, repairs, expenses)

  return (
    <ChartCard title="Fuel Expense Trend" subtitle="Monthly fuel spend">
      <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
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
  const { vehicles, maintenance, repairs, expenses } = useData()
  const data = getDepartmentExpenses(vehicles, maintenance, repairs, expenses)

  return (
    <ChartCard
      title="Department-wise Expenses"
      subtitle="Total spend by department"
    >
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ChartCard>
  )
}

export function TopPartsChart() {
  const { maintenance, repairs } = useData()
  const data = getTopParts(maintenance, repairs)

  return (
    <ChartCard
      title="Top Consumed Spare Parts"
      subtitle="Units consumed across all work orders"
    >
      <BarChart
        data={data}
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
  const { inventory } = useData()
  const data = getInventoryStockData(inventory)

  return (
    <ChartCard
      title="Inventory Stock Levels"
      subtitle="Current stock level vs minimum required stock threshold"
    >
      <BarChart data={data} margin={{ left: -16, right: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
        <Bar dataKey="CurrentStock" fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={14} />
        <Bar dataKey="MinRequired" fill="var(--chart-3)" radius={[4, 4, 0, 0]} barSize={14} />
      </BarChart>
    </ChartCard>
  )
}
