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
  ArrowRight,
  Pencil,
  Trash2,
  Eye,
  ArrowUpDown,
  Tag,
  CreditCard,
  User,
  Filter,
} from 'lucide-react'
import { useData } from '@/components/data-provider'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { AdminAction } from '@/components/admin-action'
import { ExpenseFormDialog } from '@/components/expenses/expense-form'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { currency, sumItems, type Expense } from '@/lib/data'
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
  ResponsiveContainer,
} from 'recharts'

interface UnifiedExpense {
  id: string
  sourceId: string
  type: 'Vehicle' | 'Inventory' | 'Custom'
  category: string
  name: string
  date: string
  description: string
  amount: number
  quantity?: number
  unitPrice?: number
  supplier?: string
  vehicleId?: string
  paymentMethod?: string
  createdBy?: string
  isManual?: boolean
  rawExpense?: Expense
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
  const { vehicles, expenses: manualExpenses, maintenance, repairs, inventory, deleteExpense } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [viewingExpense, setViewingExpense] = useState<UnifiedExpense | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter & Sort States
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc')

  // Export States
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  // 1. Unified dynamically aggregated expense list
  const allUnifiedExpenses = useMemo(() => {
    const list: UnifiedExpense[] = []

    // A. Manually logged expenses
    manualExpenses.forEach((e) => {
      list.push({
        id: e.id,
        sourceId: e.id,
        type: e.itemType || (e.vehicleId ? 'Vehicle' : 'Custom'),
        category: e.category || e.itemType || 'General',
        name: e.item || e.vehicleName || 'Expense Item',
        date: e.date,
        description: e.description || 'Logged Expense',
        amount: e.amount,
        vehicleId: e.vehicleId,
        paymentMethod: e.paymentMethod || 'Cash',
        createdBy: e.createdBy || 'Admin',
        isManual: true,
        rawExpense: e,
      })
    })

    // B. Automated Maintenance costs
    maintenance.forEach((m) => {
      const amt = m.cost && m.cost > 0 ? m.cost : sumItems(m.items)
      list.push({
        id: `EXP-${m.id}`,
        sourceId: m.id,
        type: 'Vehicle',
        category: 'Maintenance Cost',
        name: m.vehicleName,
        date: m.date,
        description: `Automated: ${m.type} at ${m.vendor || 'Vendor'}`,
        amount: amt,
        vehicleId: m.vehicleId,
        paymentMethod: 'System Auto',
        createdBy: 'System',
        isManual: false,
      })
    })

    // C. Automated Repair costs
    repairs.forEach((r) => {
      const amt = r.cost && r.cost > 0 ? r.cost : sumItems(r.items)
      list.push({
        id: `EXP-${r.id}`,
        sourceId: r.id,
        type: 'Vehicle',
        category: 'Repair Cost',
        name: r.vehicleName,
        date: r.date,
        description: `Automated: ${r.type} at ${r.workshop || 'Workshop'}`,
        amount: amt,
        vehicleId: r.vehicleId,
        paymentMethod: 'System Auto',
        createdBy: 'System',
        isManual: false,
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
        date: '2025-05-28',
        description: `Automated Purchase: ${i.name} (${i.brand || 'General'})`,
        amount: amt,
        quantity: i.stock,
        unitPrice: i.purchasePrice,
        supplier: i.supplier,
        paymentMethod: 'System Auto',
        createdBy: 'System',
        isManual: false,
      })
    })

    return list
  }, [manualExpenses, maintenance, repairs, inventory])

  // 2. Lifetime statistics
  const lifetimeStats = useMemo(() => {
    let vehCost = 0
    let invCost = 0
    let customCost = 0
    let maintCost = 0
    let repairCost = 0

    allUnifiedExpenses.forEach((e) => {
      if (e.type === 'Vehicle') vehCost += e.amount
      else if (e.type === 'Inventory') invCost += e.amount
      else customCost += e.amount

      if (e.category === 'Maintenance Cost') maintCost += e.amount
      if (e.category === 'Repair Cost') repairCost += e.amount
    })

    return {
      totalVehicleExpenses: vehCost,
      totalInventoryExpenses: invCost,
      totalCustomExpenses: customCost,
      totalMaintenanceCost: maintCost,
      totalRepairCost: repairCost,
      grandTotal: vehCost + invCost + customCost,
    }
  }, [allUnifiedExpenses])

  // 3. Apply Filters and Sorting
  const filteredExpenses = useMemo(() => {
    let list = allUnifiedExpenses.filter((e) => {
      // Search: Name, Description, ID, Created By
      if (search) {
        const query = search.toLowerCase()
        const matchName = e.name.toLowerCase().includes(query)
        const matchDesc = e.description.toLowerCase().includes(query)
        const matchId = e.id.toLowerCase().includes(query)
        const matchCreator = (e.createdBy || '').toLowerCase().includes(query)
        if (!matchName && !matchDesc && !matchId && !matchCreator) return false
      }

      // Date Range
      if (startDate && new Date(e.date) < new Date(startDate)) return false
      if (endDate && new Date(e.date) > new Date(endDate)) return false

      // Vehicle filter
      if (vehicleFilter !== 'all' && e.vehicleId !== vehicleFilter) return false

      // Item Type Filter (Vehicle / Inventory / Custom)
      if (typeFilter !== 'all' && e.type !== typeFilter) return false

      // Payment Method Filter
      if (paymentFilter !== 'all' && (e.paymentMethod || 'Cash').toLowerCase() !== paymentFilter.toLowerCase()) return false

      return true
    })

    // Sorting
    list = list.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortBy === 'amount-desc') return b.amount - a.amount
      if (sortBy === 'amount-asc') return a.amount - b.amount
      return 0
    })

    return list
  }, [allUnifiedExpenses, search, startDate, endDate, vehicleFilter, typeFilter, paymentFilter, sortBy])

  // 4. Compute Charts Data
  const chartsData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

    const monthMap = new Map<string, number>()
    filteredExpenses.forEach((e) => {
      const mIdx = new Date(e.date).getMonth()
      const mName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mIdx] || 'Jan'
      monthMap.set(mName, (monthMap.get(mName) ?? 0) + e.amount)
    })
    const monthlyList = months.map((m) => ({ month: m, amount: monthMap.get(m) ?? 0 }))

    const typeMap = new Map<string, number>()
    filteredExpenses.forEach((e) => {
      typeMap.set(e.type, (typeMap.get(e.type) ?? 0) + e.amount)
    })
    const typeList = Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }))

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

    const invMap = new Map<string, number>()
    filteredExpenses.forEach((e) => {
      if (e.type === 'Inventory' || e.type === 'Custom') {
        invMap.set(e.name, (invMap.get(e.name) ?? 0) + e.amount)
      }
    })
    const itemList = Array.from(invMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return {
      monthly: monthlyList,
      type: typeList,
      vehicle: vehicleList,
      item: itemList,
    }
  }, [filteredExpenses])

  // 5. Vehicle Expenses Summary
  const vehicleExpensesSummary = useMemo(() => {
    return vehicles.map((v) => {
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

  // 6. Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    const success = await deleteExpense(deletingId)
    setIsDeleting(false)
    if (success) {
      setDeletingId(null)
    }
  }

  // 7. Handle Exports
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true)
      await exportExpensesToExcel(filteredExpenses, {
        search,
        category: 'All',
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
        category: 'All',
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
        title="Expenses & Cost Tracking"
        description="Record and analyze fleet expenses for vehicles, inventory parts, and custom operational costs."
        actions={
          <AdminAction
            permission="manage:expenses"
            icon={Plus}
            label="Log Expense"
            onAction={() => {
              setEditingExpense(null)
              setFormOpen(true)
            }}
          />
        }
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Vehicle Expenses" value={currency(lifetimeStats.totalVehicleExpenses)} icon={Truck} tone="primary" />
        <StatCard label="Inventory Purchases" value={currency(lifetimeStats.totalInventoryExpenses)} icon={Boxes} tone="primary" />
        <StatCard label="Custom Expenses" value={currency(lifetimeStats.totalCustomExpenses)} icon={DollarSign} tone="success" />
        <StatCard label="Total Maintenance" value={currency(lifetimeStats.totalMaintenanceCost)} icon={Wrench} tone="warning" />
        <StatCard label="Grand Total Expenses" value={currency(lifetimeStats.grandTotal)} icon={DollarSign} tone="primary" />
      </div>

      {/* CHARTS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Spend Trend */}
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

        {/* Expense Type Breakdown */}
        <Card className="border-border bg-card/60 backdrop-blur-md">
          <CardHeader className="p-4">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Spend by Item Type</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-[180px] w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={chartsData.type}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={62}
                      paddingAngle={3}
                    >
                      {chartsData.type.map((_, i) => (
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

        {/* Top Vehicles Spend */}
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

        {/* Top Inventory & Custom Items */}
        <Card className="border-border bg-card/60 backdrop-blur-md">
          <CardHeader className="p-4">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Top Inventory & Custom Items</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-[180px] w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={chartsData.item} layout="vertical" margin={{ left: -5, right: 10, top: 5 }}>
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
      </div>

      {/* FILTER & SEARCH CONTROLS BAR */}
      <Card className="border border-border bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="size-3.5" /> Search & Filters
            </span>

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
            <div className="relative lg:col-span-2">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by item name, description, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-xs"
              />
            </div>

            {/* Item Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Item Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Item Types</SelectItem>
                <SelectItem value="Vehicle">Vehicle</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
                <SelectItem value="Custom">Custom Item</SelectItem>
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

          {/* Sort Control & Reset */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Sort By:</span>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="h-7 text-xs w-36 border-none bg-muted/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="amount-desc">Amount (Highest First)</SelectItem>
                  <SelectItem value="amount-asc">Amount (Lowest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(search || startDate || endDate || vehicleFilter !== 'all' || typeFilter !== 'all' || paymentFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setStartDate('')
                  setEndDate('')
                  setVehicleFilter('all')
                  setTypeFilter('all')
                  setPaymentFilter('all')
                  setSortBy('date-desc')
                }}
                className="text-xs h-7 text-muted-foreground hover:text-foreground"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TABLES VIEW TABS */}
      <Tabs defaultValue="expenses-table" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="expenses-table">Expenses Table ({filteredExpenses.length})</TabsTrigger>
          <TabsTrigger value="vehicles-summary">Vehicle Expenses Summary</TabsTrigger>
        </TabsList>

        {/* TAB 1: LOGGED & UNIFIED EXPENSES TABLE */}
        <TabsContent value="expenses-table" className="focus-visible:outline-none">
          <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-md">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/10">
                    <TableHead>Expense ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Item Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
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
                      <TableRow key={e.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-xs font-mono font-bold text-muted-foreground">{e.id}</TableCell>
                        <TableCell className="text-xs font-medium whitespace-nowrap">{e.date}</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          {e.name}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant="outline"
                            className={
                              e.type === 'Vehicle'
                                ? 'text-blue-600 border-blue-500/20 bg-blue-500/5'
                                : e.type === 'Inventory'
                                ? 'text-purple-600 border-purple-500/20 bg-purple-500/5'
                                : 'text-amber-600 border-amber-500/20 bg-amber-500/5'
                            }
                          >
                            {e.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate" title={e.description}>
                          {e.description || '—'}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-right text-foreground">{currency(e.amount)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{e.createdBy || 'Admin'}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* View Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-foreground"
                              title="View Details"
                              onClick={() => setViewingExpense(e)}
                            >
                              <Eye className="size-3.5" />
                            </Button>

                            {/* Edit Button (for manually logged expenses) */}
                            {e.isManual && e.rawExpense && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-primary"
                                title="Edit Expense"
                                onClick={() => {
                                  setEditingExpense(e.rawExpense || null)
                                  setFormOpen(true)
                                }}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            )}

                            {/* Delete Button (for manually logged expenses) */}
                            {e.isManual && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-destructive"
                                title="Delete Expense"
                                onClick={() => setDeletingId(e.id)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground bg-muted/10">
              <span>
                Showing {filteredExpenses.length} of {allUnifiedExpenses.length} records
              </span>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: VEHICLE EXPENSES SUMMARY */}
        <TabsContent value="vehicles-summary" className="focus-visible:outline-none">
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
          </Card>
        </TabsContent>
      </Tabs>

      {/* EXPENSE FORM DIALOG (CREATE / EDIT) */}
      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingExpense(null)
        }}
        initialData={editingExpense}
      />

      {/* VIEW EXPENSE DETAILS MODAL */}
      <Dialog open={!!viewingExpense} onOpenChange={(open) => !open && setViewingExpense(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              Expense Details — {viewingExpense?.id}
            </DialogTitle>
            <DialogDescription>Full record details for this expense transaction.</DialogDescription>
          </DialogHeader>

          {viewingExpense && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3">
                <div>
                  <span className="text-muted-foreground">Item Name</span>
                  <p className="font-semibold text-sm">{viewingExpense.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Item Type</span>
                  <p>
                    <Badge variant="outline" className="mt-0.5">
                      {viewingExpense.type}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount</span>
                  <p className="font-bold text-sm text-primary">{currency(viewingExpense.amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Transaction Date</span>
                  <p className="font-medium">{viewingExpense.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Method</span>
                  <p className="font-medium">{viewingExpense.paymentMethod || 'Cash'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created By</span>
                  <p className="font-medium">{viewingExpense.createdBy || 'Admin'}</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-muted-foreground">Description / Notes</span>
                <p className="mt-1 rounded-md border p-2.5 bg-background text-foreground">
                  {viewingExpense.description || 'No description provided.'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewingExpense(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Expense Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete expense record <strong className="font-mono">{deletingId}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeletingId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
