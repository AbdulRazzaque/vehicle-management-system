'use client'

import { useState, useMemo } from 'react'
import {
  Truck,
  Wrench,
  Hammer,
  Search,
  Calendar,
  FileSpreadsheet,
  Download,
  ArrowLeft,
  DollarSign,
  User,
  Activity,
  Layers,
  AlertCircle
} from 'lucide-react'
import { useData } from '@/components/data-provider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { currency, sumItems, type Vehicle, type Maintenance, type Repair } from '@/lib/data'
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

export function VehicleHistoryReport() {
  const { vehicles, maintenance, repairs } = useData()

  // Selection states
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')

  // Filter states
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'Maintenance' | 'Repair'>('all')

  // Export states
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  // Find currently selected vehicle
  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || null
  }, [vehicles, selectedVehicleId])

  // Filter vehicles on the left sidebar
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) =>
      v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.id.toLowerCase().includes(vehicleSearch.toLowerCase())
    )
  }, [vehicles, vehicleSearch])

  // Compute history records for selected vehicle
  const allHistoryRecords = useMemo(() => {
    if (!selectedVehicleId) return []

    const mRecords: HistoryRecord[] = maintenance
      .filter((m) => m.vehicleId === selectedVehicleId)
      .map((m) => ({
        id: m.id,
        type: 'Maintenance',
        date: m.date,
        recordType: m.type,
        provider: m.vendor,
        description: m.description,
        cost: m.cost && m.cost > 0 ? m.cost : sumItems(m.items),
        status: m.status,
        original: m
      }))

    const rRecords: HistoryRecord[] = repairs
      .filter((r) => r.vehicleId === selectedVehicleId)
      .map((r) => ({
        id: r.id,
        type: 'Repair',
        date: r.date,
        recordType: r.type,
        provider: r.workshop,
        description: r.description,
        cost: r.cost && r.cost > 0 ? r.cost : sumItems(r.items),
        status: r.status,
        original: r
      }))

    // Combine and sort chronologically (latest first)
    return [...mRecords, ...rRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [selectedVehicleId, maintenance, repairs])

  // Apply filters (Date and Type) to history records
  const filteredHistoryRecords = useMemo(() => {
    return allHistoryRecords.filter((record) => {
      // Type Filter
      if (typeFilter !== 'all' && record.type !== typeFilter) {
        return false
      }

      // Date Range Filter
      if (startDate && new Date(record.date) < new Date(startDate)) {
        return false
      }
      if (endDate && new Date(record.date) > new Date(endDate)) {
        return false
      }

      return true
    })
  }, [allHistoryRecords, typeFilter, startDate, endDate])

  // Calculate history cost summary
  const totalHistoryCost = useMemo(() => {
    return filteredHistoryRecords.reduce((sum, r) => sum + r.cost, 0)
  }, [filteredHistoryRecords])

  const selectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    setMobileView('detail')
  }

  const handleExportExcel = async () => {
    if (!selectedVehicle) return
    try {
      setExportingExcel(true)
      await exportToExcel(selectedVehicle, filteredHistoryRecords, {
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
    if (!selectedVehicle) return
    try {
      setExportingPDF(true)
      await exportToPDF(selectedVehicle, filteredHistoryRecords, {
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {/* VEHICLE MASTER LIST */}
      <div className={`col-span-1 md:block ${mobileView === 'detail' ? 'hidden' : 'block'}`}>
        <Card className="flex h-[calc(100vh-220px)] flex-col p-0 overflow-hidden border-border bg-card/60 backdrop-blur-md">
          <CardHeader className="p-4 border-b border-border bg-muted/20">
            <CardTitle className="text-base font-semibold">Vehicles</CardTitle>
            <CardDescription className="text-xs">Select a vehicle to view history</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search vehicle name..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="h-9 pl-8 text-xs"
              />
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-foreground">
                <Truck className="size-8 opacity-20 mb-2" />
                No vehicles found
              </div>
            ) : (
              filteredVehicles.map((vehicle) => {
                const isActive = selectedVehicleId === vehicle.id
                return (
                  <button
                    key={vehicle.id}
                    onClick={() => selectVehicle(vehicle.id)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div
                      className={`flex size-9 items-center justify-center rounded-lg ${
                        isActive ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Truck className="size-4.5" />
                    </div>
                    <div className="flex-1 min-w-0 leading-tight">
                      <p className="text-xs font-semibold truncate">{vehicle.name}</p>
                      <p className={`text-[10px] ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'} truncate`}>
                        {vehicle.id} · {vehicle.plateNumber}
                      </p>
                    </div>
                    <div>
                      <StatusBadge status={vehicle.status} />
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </Card>
      </div>

      {/* VEHICLE HISTORY DETAIL PANEL */}
      <div className={`col-span-1 md:col-span-3 ${mobileView === 'list' ? 'hidden' : 'block'}`}>
        {!selectedVehicle ? (
          <Card className="flex h-[calc(100vh-220px)] flex-col items-center justify-center p-6 text-center border-dashed border-2">
            <Truck className="size-12 opacity-20 mb-4 animate-pulse text-primary" />
            <h3 className="text-base font-semibold">No Vehicle Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Select a vehicle from the list on the left to review its complete maintenance, repair logs, and export details.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* MOBILE BACK BUTTON */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileView('list')}
                className="gap-2 mb-2"
              >
                <ArrowLeft className="size-4" />
                Back to Vehicles List
              </Button>
            </div>

            {/* VEHICLE QUICK INFO CARD */}
            <Card className="border-border bg-card/60 backdrop-blur-md">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Truck className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold tracking-tight text-foreground">
                          {selectedVehicle.name}
                        </h2>
                        <StatusBadge status={selectedVehicle.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ID: <span className="font-mono">{selectedVehicle.id}</span> · Plate: <span className="font-semibold">{selectedVehicle.plateNumber}</span> · Type: {selectedVehicle.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
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

                {/* METRICS GRID */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-5 pt-5 border-t border-border">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <User className="size-3" /> Driver
                    </p>
                    <p className="text-sm font-semibold truncate mt-1">
                      {selectedVehicle.driver || 'Unassigned'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Layers className="size-3" /> Department
                    </p>
                    <p className="text-sm font-semibold truncate mt-1">
                      {selectedVehicle.department || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Activity className="size-3" /> Odometer
                    </p>
                    <p className="text-sm font-bold truncate mt-1">
                      {selectedVehicle.odometer.toLocaleString()} km
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="size-3 text-primary" /> Cost Summary
                    </p>
                    <p className="text-sm font-bold text-primary truncate mt-1">
                      {currency(totalHistoryCost)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FILTERS TOOLBAR */}
            <Card className="border-border bg-card/60 backdrop-blur-md">
              <CardContent className="flex flex-col gap-3 py-3 px-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Filters</span>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Type filter */}
                  <div className="w-[140px]">
                    <Select
                      value={typeFilter}
                      onValueChange={(val: any) => setTypeFilter(val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Logs</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Repair">Repairs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date filter */}
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-9 pl-8 text-xs w-[130px]"
                    />
                  </div>

                  <span className="text-xs text-muted-foreground">to</span>

                  {/* End Date filter */}
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-9 pl-8 text-xs w-[130px]"
                    />
                  </div>

                  {/* Reset Filters button */}
                  {(startDate || endDate || typeFilter !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStartDate('')
                        setEndDate('')
                        setTypeFilter('all')
                      }}
                      className="text-xs h-9 hover:bg-muted text-muted-foreground"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CHRONOLOGICAL HISTORY TIMELINE */}
            <div className="space-y-3">
              {filteredHistoryRecords.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                  <AlertCircle className="size-8 text-muted-foreground opacity-30 mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    No maintenance or repair history found for this vehicle.
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">
                    Try clearing date/type filters or select a different vehicle.
                  </p>
                </Card>
              ) : (
                filteredHistoryRecords.map((record) => {
                  const isMaintenance = record.type === 'Maintenance'
                  const colorClass = isMaintenance
                    ? 'border-blue-500/20 bg-blue-500/5 dark:bg-blue-900/10'
                    : 'border-amber-500/20 bg-amber-500/5 dark:bg-amber-900/10'
                  
                  return (
                    <Card
                      key={record.id}
                      className={`border-l-4 transition-all hover:shadow-sm ${colorClass} bg-card/60 backdrop-blur-md`}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          {/* Left contents */}
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
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-1">
                                <span>Date: <b>{record.date}</b></span>
                                <span>Provider: <b>{record.provider}</b></span>
                                
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

                          {/* Right contents: Cost and Status */}
                          <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0 gap-2 border-t pt-2 sm:border-0 sm:pt-0">
                            <span className="text-sm font-bold text-foreground">
                              {currency(record.cost)}
                            </span>
                            <StatusBadge status={record.status as any} />
                          </div>
                        </div>

                        {/* List items detail if they exist */}
                        {record.original.items && record.original.items.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                              Itemized Parts & Labor
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {record.original.items.map((item: any, idx: number) => {
                                const price = item.unitPrice ?? item.unitCost ?? 0
                                return (
                                  <div
                                    key={idx}
                                    className="text-[10px] bg-muted/40 border border-border px-2 py-0.5 rounded text-muted-foreground"
                                  >
                                    {item.name} (x{item.quantity}) - {currency(price)}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
