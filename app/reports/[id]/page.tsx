'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Truck,
  Wrench,
  Hammer,
  ArrowLeft,
  Calendar,
  FileSpreadsheet,
  Download,
  DollarSign,
  User,
  Activity,
  Layers,
  FileText,
  AlertCircle,
  Search,
  CheckCircle,
  HelpCircle
} from 'lucide-react'
import { useData } from '@/components/data-provider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { currency, sumItems, type Maintenance, type Repair } from '@/lib/data'
import { exportToExcel, exportToPDF } from '@/lib/export-utils'
import { toast } from 'sonner'

interface HistoryRecord {
  id: string
  type: 'Maintenance' | 'Repair'
  date: string
  recordType: string
  provider: string
  description: string
  cost: number
  status: string
  original: Maintenance | Repair
}

function StatCardMini({ label, value, icon: Icon, tone = 'default' }: { label: string; value: string | number; icon: any; tone?: string }) {
  const toneClasses = {
    default: 'bg-muted/40 text-foreground border-border',
    primary: 'bg-primary/5 text-primary border-primary/10',
    blue: 'bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10',
    amber: 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10',
  }

  return (
    <Card className={`border ${toneClasses[tone as keyof typeof toneClasses]} overflow-hidden`}>
      <CardContent className="p-3 flex items-center justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">{label}</p>
          <p className="text-sm font-bold truncate">{value}</p>
        </div>
        <div className="flex size-7 items-center justify-center rounded-lg bg-background border shrink-0">
          <Icon className="size-3.5" />
        </div>
      </CardContent>
    </Card>
  )
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  )
}

export default function VehicleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { vehicles, maintenance, repairs } = useData()

  // Dynamic state loaders
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  // Local Page Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'Maintenance' | 'Repair'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Find vehicle
  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.id === id) || null
  }, [vehicles, id])

  // Get Manufacturer name
  const manufacturer = useMemo(() => {
    if (!vehicle) return '—'
    return vehicle.name.split(' ')[0]
  }, [vehicle])

  // Get Model name
  const modelName = useMemo(() => {
    if (!vehicle) return '—'
    return vehicle.model
  }, [vehicle])

  // Compute lifetime overall statistics (unfiltered)
  const lifetimeStats = useMemo(() => {
    const vMaint = maintenance.filter((m) => m.vehicleId === id)
    const vRepairs = repairs.filter((r) => r.vehicleId === id)

    const totalMaintCost = vMaint.reduce((sum, m) => sum + sumItems(m.items), 0)
    const totalRepairCost = vRepairs.reduce((sum, r) => sum + sumItems(r.items), 0)

    const maintDates = vMaint.map((m) => new Date(m.date).getTime())
    const repairDates = vRepairs.map((r) => new Date(r.date).getTime())

    const lastMaintDate = maintDates.length > 0 ? new Date(Math.max(...maintDates)).toISOString().split('T')[0] : '—'
    const lastRepairDate = repairDates.length > 0 ? new Date(Math.max(...repairDates)).toISOString().split('T')[0] : '—'

    return {
      maintenanceCount: vMaint.length,
      repairCount: vRepairs.length,
      maintenanceCost: totalMaintCost,
      repairCost: totalRepairCost,
      overallCost: totalMaintCost + totalRepairCost,
      lastMaintenanceDate: lastMaintDate,
      lastRepairDate: lastRepairDate,
    }
  }, [id, maintenance, repairs])

  // Compute complete service/repair log history (chronological, latest first)
  const allHistoryRecords = useMemo(() => {
    if (!vehicle) return []

    const mRecords: HistoryRecord[] = maintenance
      .filter((m) => m.vehicleId === id)
      .map((m) => ({
        id: m.id,
        type: 'Maintenance',
        date: m.date,
        recordType: m.type,
        provider: m.vendor,
        description: m.description,
        cost: sumItems(m.items),
        status: m.status,
        original: m
      }))

    const rRecords: HistoryRecord[] = repairs
      .filter((r) => r.vehicleId === id)
      .map((r) => ({
        id: r.id,
        type: 'Repair',
        date: r.date,
        recordType: r.type,
        provider: r.workshop,
        description: r.description,
        cost: sumItems(r.items),
        status: r.status,
        original: r
      }))

    return [...mRecords, ...rRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [id, vehicle, maintenance, repairs])

  // Apply filters to history timeline
  const filteredHistoryRecords = useMemo(() => {
    return allHistoryRecords.filter((record) => {
      // Type filter
      if (typeFilter !== 'all' && record.type !== typeFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'Completed' && record.status !== 'Completed') return false
        if (statusFilter === 'In Progress' && record.status !== 'In Progress') return false
        if (statusFilter === 'Pending' && record.status !== 'Scheduled' && record.status !== 'Open') return false
      }

      // Date Range filter
      if (startDate && new Date(record.date) < new Date(startDate)) {
        return false
      }
      if (endDate && new Date(record.date) > new Date(endDate)) {
        return false
      }

      // Search term (filters title, description, vendor/workshop)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchTitle = record.recordType.toLowerCase().includes(query)
        const matchDesc = record.description.toLowerCase().includes(query)
        const matchProvider = record.provider.toLowerCase().includes(query)
        const matchId = record.id.toLowerCase().includes(query)

        if (!matchTitle && !matchDesc && !matchProvider && !matchId) {
          return false
        }
      }

      return true
    })
  }, [allHistoryRecords, typeFilter, statusFilter, startDate, endDate, searchQuery])

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <AlertCircle className="size-12 text-destructive mb-4 animate-bounce" />
        <h3 className="text-lg font-semibold">Vehicle Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          The vehicle with ID "{id}" could not be found.
        </p>
        <Button asChild>
          <Link href="/reports" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to Reports
          </Link>
        </Button>
      </div>
    )
  }

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true)
      await exportToExcel(vehicle, filteredHistoryRecords, {
        startDate,
        endDate,
        type: typeFilter,
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
      await exportToPDF(vehicle, filteredHistoryRecords, {
        startDate,
        endDate,
        type: typeFilter,
      })
      toast.success('PDF report exported successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to export PDF report.')
    } finally {
      setExportingPDF(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER NAVIGATION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="gap-2 mb-2 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
            <Link href="/reports" className="flex items-center gap-1.5">
              <ArrowLeft className="size-4" />
              Back to Reports
            </Link>
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{vehicle.name}</h1>
                <StatusBadge status={vehicle.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                ID: <span className="font-mono">{vehicle.id}</span> · Plate: <span className="font-semibold">{vehicle.plateNumber}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* 7 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatCardMini
          label="Maint. Count"
          value={lifetimeStats.maintenanceCount}
          icon={Wrench}
          tone="blue"
        />
        <StatCardMini
          label="Repair Count"
          value={lifetimeStats.repairCount}
          icon={Hammer}
          tone="amber"
        />
        <StatCardMini
          label="Maint. Cost"
          value={currency(lifetimeStats.maintenanceCost)}
          icon={DollarSign}
          tone="blue"
        />
        <StatCardMini
          label="Repair Cost"
          value={currency(lifetimeStats.repairCost)}
          icon={DollarSign}
          tone="amber"
        />
        <StatCardMini
          label="Overall Cost"
          value={currency(lifetimeStats.overallCost)}
          icon={DollarSign}
          tone="primary"
        />
        <StatCardMini
          label="Last Maint"
          value={lifetimeStats.lastMaintenanceDate}
          icon={Calendar}
          tone="default"
        />
        <StatCardMini
          label="Last Repair"
          value={lifetimeStats.lastRepairDate}
          icon={Calendar}
          tone="default"
        />
      </div>

      {/* DETAILED SPECIFICATION CARD */}
      <Card className="border-border bg-card/60 backdrop-blur-md">
        <CardHeader className="py-3.5 px-5 border-b border-border bg-muted/10">
          <CardTitle className="text-sm font-semibold">Vehicle Profile & Assignment</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <DetailRow label="Vehicle Name" value={vehicle.name} />
            <DetailRow label="Registration Number" value={vehicle.registrationNumber} />
            <DetailRow label="Model" value={modelName} />
            <DetailRow label="Manufacturer" value={manufacturer} />
            <DetailRow label="Year" value={vehicle.year} />
            <DetailRow label="Current Mileage" value={`${vehicle.odometer.toLocaleString()} km`} />
            <DetailRow label="Current Status" value={vehicle.status} />
            <DetailRow label="Assigned Driver" value={vehicle.driver || 'Unassigned'} />
          </div>
          {vehicle.notes && (
            <>
              <Separator />
              <DetailRow label="Notes / Fleet Comments" value={vehicle.notes} />
            </>
          )}
        </CardContent>
      </Card>

      {/* FILTER BAR ON SAME PAGE */}
      <Card className="border-border bg-card/60 backdrop-blur-md">
        <CardContent className="flex flex-col gap-3 py-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Search & Filter Logs</span>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-[180px]">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 text-xs"
              />
            </div>

            {/* Type selector */}
            <div className="w-[130px]">
              <Select
                value={typeFilter}
                onValueChange={(val: any) => setTypeFilter(val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Repair">Repairs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status selector */}
            <div className="w-[130px]">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="relative flex items-center">
              <Calendar className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 pl-8 text-xs w-[120px]"
              />
            </div>

            <span className="text-xs text-muted-foreground">to</span>

            {/* End Date */}
            <div className="relative flex items-center">
              <Calendar className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 pl-8 text-xs w-[120px]"
              />
            </div>

            {/* Reset Filters */}
            {(searchQuery || startDate || endDate || typeFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setStartDate('')
                  setEndDate('')
                  setTypeFilter('all')
                  setStatusFilter('all')
                }}
                className="text-xs h-9 text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CHRONOLOGICAL HISTORY TIMELINE FEED */}
      <div className="space-y-4">
        {allHistoryRecords.length === 0 ? (
          /* REQUIREMENT 7: If the vehicle has NO maintenance or repair records whatsoever */
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
            <AlertCircle className="size-10 text-muted-foreground opacity-30 mb-3" />
            <p className="text-sm font-bold text-muted-foreground">
              No maintenance or repair history available for this vehicle.
            </p>
          </Card>
        ) : filteredHistoryRecords.length === 0 ? (
          /* Filtered empty state */
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
            <AlertCircle className="size-8 text-muted-foreground opacity-30 mb-2" />
            <p className="text-sm font-semibold text-muted-foreground">
              No matching maintenance or repair records found.
            </p>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              Try adjusting your filters above.
            </p>
          </Card>
        ) : (
          /* Render History Timeline */
          filteredHistoryRecords.map((record) => {
            const isMaintenance = record.type === 'Maintenance'
            const borderClass = isMaintenance
              ? 'border-blue-500/20 bg-blue-500/5 dark:bg-blue-900/5'
              : 'border-amber-500/20 bg-amber-500/5 dark:bg-amber-900/5'

            // Service mileage at time of service
            const mileage = isMaintenance
              ? (record.original as Maintenance).odometer
              : null

            return (
              <Card
                key={record.id}
                className={`border-l-4 p-4 rounded-lg transition-all hover:shadow-sm ${borderClass} border border-border bg-card/60 backdrop-blur-md`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                        isMaintenance ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {isMaintenance ? <Wrench className="size-4.5" /> : <Hammer className="size-4.5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          {record.id}
                        </span>
                        <Badge variant="outline" className="text-[10px] h-5 py-0">
                          {record.type}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground">
                          {record.recordType}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 font-medium">
                        {record.description}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground pt-1.5">
                        <span className="flex items-center gap-1 font-semibold text-foreground/80 bg-muted/65 px-2 py-0.5 rounded">
                          <Calendar className="size-3 text-muted-foreground" /> Date: <span>{record.date}</span>
                        </span>
                        <span>
                          Service Center: <b>{record.provider || '—'}</b>
                        </span>
                        <span>
                          Mileage at Service:{' '}
                          <b>{mileage ? `${mileage.toLocaleString()} km` : '—'}</b>
                        </span>
                        {isMaintenance && (record.original as Maintenance).nextDate && (
                          <span>Next Due: <b>{(record.original as Maintenance).nextDate}</b></span>
                        )}
                        {!isMaintenance && (record.original as Repair).priority && (
                          <span className="flex items-center gap-0.5">
                            Priority:{' '}
                            <span className={`font-semibold ${
                              (record.original as Repair).priority === 'Critical' || (record.original as Repair).priority === 'High'
                                ? 'text-red-500'
                                : 'text-muted-foreground'
                            }`}>
                              {(record.original as Repair).priority}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0 gap-2 border-t pt-2 sm:border-0 sm:pt-0">
                    <span className="text-sm font-bold text-foreground">
                      {currency(record.cost)}
                    </span>
                    <StatusBadge status={record.status as any} />
                  </div>
                </div>

                {/* Parts Replaced */}
                {record.original.items && record.original.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Parts Replaced
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {record.original.items.map((item: any, idx: number) => {
                        const price = item.unitPrice ?? item.unitCost ?? 0
                        return (
                          <div
                            key={idx}
                            className="text-[10px] bg-muted/40 border border-border px-2 py-0.5 rounded text-muted-foreground font-medium"
                          >
                            {item.name} (x{item.quantity}) - {currency(price)}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
