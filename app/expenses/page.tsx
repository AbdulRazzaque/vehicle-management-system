'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  DollarSign,
  Wrench,
  Hammer,
  Boxes,
  Layers,
  Search,
  Calendar,
  Truck,
  FileSpreadsheet,
  Download,
  Activity,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { useData } from '@/components/data-provider'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { AdminAction } from '@/components/admin-action'
import { ExpenseFormDialog } from '@/components/forms/entity-forms'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { currency, sumItems } from '@/lib/data'
import { exportExpensesToExcel, exportExpensesToPDF } from '@/lib/export-utils'
import { toast } from 'sonner'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface UnifiedExpense {
  id: string
  sourceId: string
  type: 'Vehicle' | 'Inventory'
  category: string
  name: string
  date: string
  description: string
  amount: number
  quantity?: number
  unitPrice?: number
  supplier?: string
  vehicleId?: string
  relatedRecordId?: string
}

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

export default function ExpensesPage() {
  const router = useRouter()
  const { vehicles, expenses: manualExpenses, maintenance, repairs, inventory } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter States
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Export State Loaders
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  // 1. Unified dynamically aggregated expense list (Requirement 7: Automation)
  const allUnifiedExpenses = useMemo(() => {
    const list: UnifiedExpense[] = []

    // A. Manually logged expenses
    manualExpenses.forEach((e) => {
      list.push({
        id: e.id,
        sourceId: e.id,
        type: 'Vehicle',
        category: e.category,
        name: e.vehicleName,
        date: e.date,
        description: e.description,
        amount: e.amount,
        vehicleId: e.vehicleId,
      })
    })

    // B. Automated Maintenance costs
    maintenance.forEach((m) => {
      const amt = sumItems(m.items)
      list.push({
        id: `EXP-${m.id}`,
        sourceId: m.id,
        type: 'Vehicle',
        category: 'Maintenance Cost',
        name: m.vehicleName,
        date: m.date,
        description: `Automated: ${m.type} at ${m.vendor}`,
        amount: amt,
        vehicleId: m.vehicleId,
        relatedRecordId: m.id,
      })
    })

    // C. Automated Repair costs
    repairs.forEach((r) => {
      const amt = sumItems(r.items)
      list.push({
        id: `EXP-${r.id}`,
        sourceId: r.id,
        type: 'Vehicle',
        category: 'Repair Cost',
        name: r.vehicleName,
        date: r.date,
        description: `Automated: ${r.type} at ${r.workshop}`,
        amount: amt,
        vehicleId: r.vehicleId,
        relatedRecordId: r.id,
      })
    })

    // D. Automated Inventory Purchases
    inventory.forEach((i) => {
      const amt = i.stock * i.purchasePrice
      list.push({
        id: `EXP-${i.id}`,
        sourceId: i.id,
        type: 'Inventory',
        category: 'Inventory Purchase',
        name: i.name,
        date: '2025-05-28', // Standard mock date
        description: `Automated Purchase: ${i.name} (${i.brand})`,
        amount: amt,
        quantity: i.stock,
        unitPrice: i.purchasePrice,
        supplier: i.supplier,
      })
    })

    // Sort chronologically (latest first)
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [manualExpenses, maintenance, repairs, inventory])

  // 2. Compute Lifetime statistics for Summary Cards (Requirement 3: Expense Summary)
  const lifetimeStats = useMemo(() => {
    let vehCost = 0
    let invCost = 0
    let maintCost = 0
    let repairCost = 0

    allUnifiedExpenses.forEach((e) => {
      if (e.type === 'Vehicle') vehCost += e.amount
      if (e.type === 'Inventory') invCost += e.amount
      if (e.category === 'Maintenance Cost') maintCost += e.amount
      if (e.category === 'Repair Cost') repairCost += e.amount
    })

    return {
      totalVehicleExpenses: vehCost,
      totalInventoryExpenses: invCost,
      totalMaintenanceCost: maintCost,
      totalRepairCost: repairCost,
      grandTotal: vehCost + invCost,
    }
  }, [allUnifiedExpenses])

  // 3. Apply Filters to Unified list
  const filteredExpenses = useMemo(() => {
    return allUnifiedExpenses.filter((e) => {
      // Search: Name or Description
      if (search) {
        const query = search.toLowerCase()
        const matchName = e.name.toLowerCase().includes(query)
        const matchDesc = e.description.toLowerCase().includes(query)
        const matchId = e.id.toLowerCase().includes(query)
        if (!matchName && !matchDesc && !matchId) return false
      }

      // Date Range
      if (startDate && new Date(e.date) < new Date(startDate)) return false
      if (endDate && new Date(e.date) > new Date(endDate)) return false

      // Vehicle filter
      if (vehicleFilter !== 'all' && e.vehicleId !== vehicleFilter) return false

      // Category filter
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false

      // Expense Type (Vehicle vs Inventory)
      if (typeFilter !== 'all' && e.type !== typeFilter) return false

      return true
    })
  }, [allUnifiedExpenses, search, startDate, endDate, vehicleFilter, categoryFilter, typeFilter])

  // 4. Compute Charts Data
  const chartsData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // A. Monthly Expenses
    const monthMap = new Map<string, number>()
    filteredExpenses.forEach((e) => {
      const mIdx = new Date(e.date).getMonth()
      const mName = months[mIdx]
      monthMap.set(mName, (monthMap.get(mName) ?? 0) + e.amount)
    })
    const monthlyList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] // Standard list matching database cost trend
      .map((m) => ({ month: m, amount: monthMap.get(m) ?? 0 }))

    // B. Vehicle-wise Expenses
    const vehMap = new Map<string, number>()
    filteredExpenses.forEach((e) => {
      if (e.type === 'Vehicle') {
        vehMap.set(e.name, (vehMap.get(e.name) ?? 0) + e.amount)
      }
    })
    const vehicleList = Array.from(vehMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // C. Inventory-wise Expenses
    const invMap = new Map<string, number>()
    filteredExpenses.forEach((e) => {
      if (e.type === 'Inventory') {
        invMap.set(e.name, (invMap.get(e.name) ?? 0) + e.amount)
      }
    })
    const inventoryList = Array.from(invMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // D. Category Breakdown
    const catMap = new Map<string, number>()
    filteredExpenses.forEach((e) => {
      catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.amount)
    })
    const categoryList = Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    return {
      monthly: monthlyList,
      vehicle: vehicleList,
      inventory: inventoryList,
      category: categoryList,
    }
  }, [filteredExpenses])

  // 5. Compute Vehicle Expenses Summary Table Data
  const vehicleExpensesSummary = useMemo(() => {
    return vehicles.map((v) => {
      // Find matching expenses
      const vM = filteredExpenses.filter((e) => e.vehicleId === v.id && e.category === 'Maintenance Cost')
      const vR = filteredExpenses.filter((e) => e.vehicleId === v.id && e.category === 'Repair Cost')
      const vF = filteredExpenses.filter((e) => e.vehicleId === v.id && e.category === 'Fuel Cost')
      const vO = filteredExpenses.filter((e) => e.vehicleId === v.id && e.category !== 'Maintenance Cost' && e.category !== 'Repair Cost' && e.category !== 'Fuel Cost')

      const totalM = vM.reduce((sum, e) => sum + e.amount, 0)
      const totalR = vR.reduce((sum, e) => sum + e.amount, 0)
      const totalF = vF.reduce((sum, e) => sum + e.amount, 0)
      const totalO = vO.reduce((sum, e) => sum + e.amount, 0)

      return {
        vehicle: v,
        totalMaintenance: totalM,
        totalRepair: totalR,
        totalFuel: totalF,
        totalOther: totalO,
        overallExpense: totalM + totalR + totalF + totalO,
      }
    })
  }, [vehicles, filteredExpenses])

  // 6. Handle Exports
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true)
      await exportExpensesToExcel(filteredExpenses, {
        search,
        category: categoryFilter,
        type: typeFilter,
        startDate,
        endDate,
        vehicle: vehicleFilter,
      })
      toast.success('Excel report exported successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to export Excel report.')
    } finally {
      setExportingExcel(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true)
      await exportExpensesToPDF(filteredExpenses, {
        search,
        category: categoryFilter,
        type: typeFilter,
        startDate,
        endDate,
        vehicle: vehicleFilter,
      })
      toast.success('PDF report exported successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to export PDF report.')
    } finally {
      setExportingPDF(false)
    }
  }

  const tooltipStyle = {
    background: 'var(--color-popover)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    color: 'var(--color-popover-foreground)',
    fontSize: 11,
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Fleet & Inventory Expenses"
        description="Comprehensive analysis of fleet operations costs, spare parts logistics, and maintenance purchases."
        actions={
          <AdminAction
            permission="manage:expenses"
            icon={Plus}
            label="Log Expense"
            onAction={() => setFormOpen(true)}
          />
        }
      />

      {/* SUMMARY CARDS (Requirement 3) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Vehicle Expenses" value={currency(lifetimeStats.totalVehicleExpenses)} icon={Truck} tone="primary" />
        <StatCard label="Total Inventory Expenses" value={currency(lifetimeStats.totalInventoryExpenses)} icon={Boxes} tone="primary" />
        <StatCard label="Total Maintenance Cost" value={currency(lifetimeStats.totalMaintenanceCost)} icon={Wrench} tone="success" />
        <StatCard label="Total Repair Cost" value={currency(lifetimeStats.totalRepairCost)} icon={Hammer} tone="warning" />
        <StatCard label="Grand Total Expenses" value={currency(lifetimeStats.grandTotal)} icon={DollarSign} tone="primary" />
      </div>

      {/* CHARTS GRAPH GRID (Requirement 5) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Expenses Chart */}
        <Card className="border-border bg-card/60 backdrop-blur-md">
          <CardHeader className="p-4">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Monthly Spend Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-[180px] w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={chartsData.monthly} margin={{ left: -22, right: 5, top: 5 }}>
                    <defs>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}`, 'Total']} />
                    <Area type="monotone" dataKey="amount" stroke="var(--color-chart-1)" fill="url(#expGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full rounded-lg bg-muted/10 animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle-wise Expenses Chart */}
        <Card className="border-border bg-card/60 backdrop-blur-md">
          <CardHeader className="p-4">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Top Vehicles Spend</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-[180px] w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={chartsData.vehicle} margin={{ left: -22, right: 5, top: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                    <Tooltip cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} contentStyle={tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}`, 'Spend']} />
                    <Bar dataKey="value" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full rounded-lg bg-muted/10 animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Expenses Chart */}
        <Card className="border-border bg-card/60 backdrop-blur-md">
          <CardHeader className="p-4">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Top Inventory Items</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-[180px] w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={chartsData.inventory} layout="vertical" margin={{ left: -5, right: 10, top: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 8.5, fill: 'var(--color-muted-foreground)' }} width={80} />
                    <Tooltip cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} contentStyle={tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}`, 'Cost']} />
                    <Bar dataKey="value" fill="var(--color-chart-3)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full rounded-lg bg-muted/10 animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Spend Breakdown by Category Chart */}
        <Card className="border-border bg-card/60 backdrop-blur-md">
          <CardHeader className="p-4">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-[180px] w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={chartsData.category}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={62}
                      paddingAngle={3}
                    >
                      {chartsData.category.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full rounded-lg bg-muted/10 animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTER CONTROLS BAR (Requirement 4) */}
      <Card className="border border-border bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Search & Filters</span>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={exportingExcel}
                className="gap-1.5 h-9"
              >
                <FileSpreadsheet className="size-4 text-emerald-600" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="gap-1.5 h-9"
              >
                <Download className="size-4 text-rose-600" />
                PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search vehicle or item name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-xs"
              />
            </div>

            {/* Vehicle Selector */}
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Expense Type (Vehicle vs Inventory) */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Vehicle">Vehicle Expenses</SelectItem>
                <SelectItem value="Inventory">Inventory Expenses</SelectItem>
              </SelectContent>
            </Select>

            {/* Start Date */}
            <div className="relative flex items-center">
              <Calendar className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 pl-8 text-xs w-full"
              />
            </div>

            {/* End Date */}
            <div className="relative flex items-center">
              <Calendar className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 pl-8 text-xs w-full"
              />
            </div>
          </div>

          {/* Reset Filters button */}
          {(search || startDate || endDate || vehicleFilter !== 'all' || categoryFilter !== 'all' || typeFilter !== 'all') && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setStartDate('')
                  setEndDate('')
                  setVehicleFilter('all')
                  setCategoryFilter('all')
                  setTypeFilter('all')
                }}
                className="text-xs h-8 text-muted-foreground hover:text-foreground"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TABLES VIEW TABS */}
      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="vehicles">Vehicle Expenses Summary</TabsTrigger>
          <TabsTrigger value="unified">All Expense & Purchase Ledger</TabsTrigger>
        </TabsList>

        {/* TAB 1: VEHICLE EXPENSES OVERVIEW */}
        <TabsContent value="vehicles" className="focus-visible:outline-none">
          <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-md">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/10">
                    <TableHead>Vehicle Name / ID</TableHead>
                    <TableHead className="text-right">Maintenance Cost</TableHead>
                    <TableHead className="text-right">Repair Cost</TableHead>
                    <TableHead className="text-right">Fuel Cost</TableHead>
                    <TableHead className="text-right">Other Expenses</TableHead>
                    <TableHead className="text-right">Overall Expense</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleExpensesSummary.map((d) => (
                    <TableRow
                      key={d.vehicle.id}
                      onClick={() => router.push(`/reports/${d.vehicle.id}`)}
                      className="cursor-pointer group hover:bg-muted/40"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <Truck className="size-4" />
                          </div>
                          <div className="leading-tight">
                            <Link
                              href={`/reports/${d.vehicle.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-xs text-foreground hover:text-primary hover:underline transition-colors"
                            >
                              {d.vehicle.name}
                            </Link>
                            <p className="text-[10px] text-muted-foreground">
                              {d.vehicle.id} · Plate: {d.vehicle.plateNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">{currency(d.totalMaintenance)}</TableCell>
                      <TableCell className="text-xs text-right font-medium">{currency(d.totalRepair)}</TableCell>
                      <TableCell className="text-xs text-right font-medium">{currency(d.totalFuel)}</TableCell>
                      <TableCell className="text-xs text-right font-medium">{currency(d.totalOther)}</TableCell>
                      <TableCell className="text-xs text-right font-bold text-primary">{currency(d.overallExpense)}</TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="inline-flex size-7 items-center justify-center rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground">
                          <ArrowRight className="size-4" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground bg-muted/10">
              <span>
                Showing {vehicleExpensesSummary.length} of {vehicles.length} vehicles
              </span>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: UNIFIED EXPENSE RECORDS LIST */}
        <TabsContent value="unified" className="focus-visible:outline-none">
          <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-md">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/10">
                    <TableHead>Date</TableHead>
                    <TableHead>Expense ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vehicle / Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Supplier / Provider</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="size-6 text-muted-foreground opacity-30 mb-2" />
                          <p className="text-sm font-semibold">No expense records match the applied filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs font-semibold">{e.date}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{e.id}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className={e.type === 'Vehicle' ? 'text-blue-600 border-blue-500/20' : 'text-purple-600 border-purple-500/20'}>
                            {e.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="secondary">{e.category}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {e.type === 'Vehicle' ? (
                            <Link
                              href={`/reports/${e.vehicleId}`}
                              className="text-primary hover:underline font-bold"
                            >
                              {e.name}
                            </Link>
                          ) : (
                            <Link
                              href={`/reports/${e.sourceId}`}
                              className="text-purple-600 hover:underline font-bold"
                            >
                              {e.name}
                            </Link>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{e.description}</TableCell>
                        <TableCell className="text-xs font-medium">{e.supplier || '—'}</TableCell>
                        <TableCell className="text-xs font-bold text-right text-foreground">{currency(e.amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground bg-muted/10">
              <span>
                Showing {filteredExpenses.length} of {allUnifiedExpenses.length} transaction records
              </span>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
