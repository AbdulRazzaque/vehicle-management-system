'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '@/components/data-provider'
import { sumItems, type Vehicle, type Maintenance, type Repair, type InventoryItem, type Expense } from '@/lib/data'
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

const tooltipStyle = {
  background: 'var(--color-popover)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  color: 'var(--color-popover-foreground)',
  fontSize: 12,
}

const axisTick = { fill: 'var(--color-muted-foreground)', fontSize: 12 }
const PIE_COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)']

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

export function ReportCharts() {
  const { vehicles, maintenance, repairs, expenses, inventory } = useData()
  
  const costTrendData = getMonthlyCosts(maintenance, repairs, expenses)
  const departmentData = getDepartmentExpenses(vehicles, maintenance, repairs, expenses)
  const topPartsData = getTopParts(maintenance, repairs)
  const inventoryStockData = getInventoryStockData(inventory)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Cost Trend by Type</CardTitle>
          <CardDescription>Monthly maintenance, repair and fuel spend</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <AreaChart data={costTrendData} margin={{ left: -16, right: 8 }}>
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
                data={departmentData}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={96}
                paddingAngle={3}
              >
                {departmentData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="var(--color-card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `$${Number(v || 0).toLocaleString()}`} />
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
            <BarChart data={topPartsData} margin={{ left: -16, right: 8 }}>
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
          <CardTitle>Inventory Stock Levels</CardTitle>
          <CardDescription>Current stock level vs minimum required stock threshold</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <LineChart data={inventoryStockData} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis tickLine={false} axisLine={false} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="CurrentStock" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="MinRequired" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartWrapper>
        </CardContent>
      </Card>
    </div>
  )
}
