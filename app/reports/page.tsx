'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Calendar,
  FileSpreadsheet,
  Download,
  Truck,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ReportCharts } from '@/components/reports/report-charts'
import { useData } from '@/components/data-provider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
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
import { currency, sumItems } from '@/lib/data'
import { exportFleetToExcel, exportFleetToPDF } from '@/lib/export-utils'
import { toast } from 'sonner'

export default function ReportsPage() {
  const router = useRouter()
  const { vehicles, maintenance, repairs } = useData()

  // Filter states
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [activityType, setActivityType] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Export states
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  // 1. Filter the vehicles list based on search/status/activity presence
  const processedVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Search term
      const matchesSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
        v.id.toLowerCase().includes(search.toLowerCase())

      // Status term
      const matchesStatus = status === 'all' || v.status === status

      // Log presence matching dates
      const vM = maintenance.filter((m) => {
        if (m.vehicleId !== v.id) return false
        if (startDate && new Date(m.date) < new Date(startDate)) return false
        if (endDate && new Date(m.date) > new Date(endDate)) return false
        return true
      })

      const vR = repairs.filter((r) => {
        if (r.vehicleId !== v.id) return false
        if (startDate && new Date(r.date) < new Date(startDate)) return false
        if (endDate && new Date(r.date) > new Date(endDate)) return false
        return true
      })

      let matchesActivity = true
      if (activityType === 'Maintenance') {
        matchesActivity = vM.length > 0
      } else if (activityType === 'Repair') {
        matchesActivity = vR.length > 0
      }

      return matchesSearch && matchesStatus && matchesActivity
    })
  }, [vehicles, search, status, activityType, startDate, endDate, maintenance, repairs])

  // 2. Map filtered vehicles to their derived summary details
  const tableData = useMemo(() => {
    return processedVehicles.map((v) => {
      const vM = maintenance.filter((m) => {
        if (m.vehicleId !== v.id) return false
        if (startDate && new Date(m.date) < new Date(startDate)) return false
        if (endDate && new Date(m.date) > new Date(endDate)) return false
        return true
      })

      const vR = repairs.filter((r) => {
        if (r.vehicleId !== v.id) return false
        if (startDate && new Date(r.date) < new Date(startDate)) return false
        if (endDate && new Date(r.date) > new Date(endDate)) return false
        return true
      })

      // Get dates
      const maintDates = vM.map((m) => new Date(m.date).getTime())
      const repairDates = vR.map((r) => new Date(r.date).getTime())

      const lastM = maintDates.length > 0 ? new Date(Math.max(...maintDates)).toISOString().split('T')[0] : ''
      const lastR = repairDates.length > 0 ? new Date(Math.max(...repairDates)).toISOString().split('T')[0] : ''

      // Calculate costs in period
      const maintCost = activityType === 'all' || activityType === 'Maintenance'
        ? vM.reduce((sum, m) => sum + sumItems(m.items), 0)
        : 0

      const repairCost = activityType === 'all' || activityType === 'Repair'
        ? vR.reduce((sum, r) => sum + sumItems(r.items), 0)
        : 0

      const cost = maintCost + repairCost

      // Build history items list matching filters for comprehensive export
      const historyRecords: any[] = []
      if (activityType === 'all' || activityType === 'Maintenance') {
        vM.forEach((m) => {
          historyRecords.push({
            id: m.id,
            type: 'Maintenance',
            date: m.date,
            recordType: m.type,
            provider: m.vendor,
            description: m.description,
            cost: sumItems(m.items),
            status: m.status,
          })
        })
      }
      if (activityType === 'all' || activityType === 'Repair') {
        vR.forEach((r) => {
          historyRecords.push({
            id: r.id,
            type: 'Repair',
            date: r.date,
            recordType: r.type,
            provider: r.workshop,
            description: r.description,
            cost: sumItems(r.items),
            status: r.status,
          })
        })
      }
      historyRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return {
        vehicle: v,
        lastMaintenanceDate: lastM,
        lastRepairDate: lastR,
        totalCost: cost,
        historyRecords,
      }
    })
  }, [processedVehicles, activityType, startDate, endDate, maintenance, repairs])

  const handleExportExcel = async () => {
    if (tableData.length === 0) {
      toast.error('No matching records to export.')
      return
    }
    try {
      setExportingExcel(true)
      await exportFleetToExcel(tableData, {
        search,
        status,
        type: activityType,
        startDate,
        endDate,
      })
      toast.success('Fleet Excel report exported successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to export Excel report.')
    } finally {
      setExportingExcel(false)
    }
  }

  const handleExportPDF = async () => {
    if (tableData.length === 0) {
      toast.error('No matching records to export.')
      return
    }
    try {
      setExportingPDF(true)
      await exportFleetToPDF(tableData, {
        search,
        status,
        type: activityType,
        startDate,
        endDate,
      })
      toast.success('Fleet PDF report exported successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to export PDF report.')
    } finally {
      setExportingPDF(false)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Reports & Analytics"
        description="Visualize fleet trends and view comprehensive vehicle activity logs below."
      />

      {/* ANALYTICS CHARTS AT THE TOP */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4.5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Fleet Analytics & Trends</h2>
        </div>
        <ReportCharts />
      </div>

      {/* SEARCH AND FILTERS SECTION */}
      <Card className="border-border bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Report Filters</span>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={exportingExcel}
                className="gap-1.5 h-9"
              >
                <FileSpreadsheet className="size-4 text-emerald-600" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="gap-1.5 h-9"
              >
                <Download className="size-4 text-rose-600" />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search by Vehicle Name */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by Vehicle Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-xs"
              />
            </div>

            {/* Vehicle Status Filter */}
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Repair">Repair</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Activity Type Filter */}
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Maintenance">Maintenance Only</SelectItem>
                <SelectItem value="Repair">Repairs Only</SelectItem>
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

          {/* Reset button */}
          {(search || status !== 'all' || activityType !== 'all' || startDate || endDate) && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setStatus('all')
                  setActivityType('all')
                  setStartDate('')
                  setEndDate('')
                }}
                className="text-xs h-8 text-muted-foreground hover:text-foreground"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* VEHICLES SUMMARY TABLE */}
      <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Vehicle Details</TableHead>
                <TableHead>Registration No.</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>Last Repair</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Period Cost</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="size-6 text-muted-foreground opacity-30 mb-2" />
                      <p className="text-sm font-semibold">No vehicles match the applied filters.</p>
                      <p className="text-xs text-muted-foreground/80 mt-0.5">Try clearing filters or search criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((d) => (
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
                          <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                            {d.vehicle.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {d.vehicle.id} · Plate: {d.vehicle.plateNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{d.vehicle.registrationNumber}</TableCell>
                    <TableCell className="text-xs">{d.vehicle.department}</TableCell>
                    <TableCell className="text-xs font-medium">{d.lastMaintenanceDate || '—'}</TableCell>
                    <TableCell className="text-xs font-medium">{d.lastRepairDate || '—'}</TableCell>
                    <TableCell>
                      <StatusBadge status={d.vehicle.status} />
                    </TableCell>
                    <TableCell className="text-xs font-bold text-right">
                      {currency(d.totalCost)}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="inline-flex size-7 items-center justify-center rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground">
                        <ArrowRight className="size-4" />
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
            Showing {tableData.length} of {vehicles.length} vehicles
          </span>
        </div>
      </Card>
    </div>
  )
}
