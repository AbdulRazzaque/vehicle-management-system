import type { Vehicle } from '@/lib/data'

interface HistoryRecord {
  id: string
  type: 'Maintenance' | 'Repair'
  date: string
  recordType: string
  provider: string
  description: string
  cost: number
  status: string
}

interface FleetVehicleData {
  vehicle: Vehicle
  lastMaintenanceDate: string
  lastRepairDate: string
  totalCost: number
  historyRecords: HistoryRecord[]
}

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

interface InventoryUsageRecord {
  date: string
  type: string
  vehicleName: string
  vehicleId: string
  quantity: number
  unitPrice: number
  totalCost: number
  recordId: string
}

// Format date range string for filters header
function getDateRangeString(startDate: string, endDate: string) {
  if (startDate || endDate) {
    return `${startDate || 'Beginning'} to ${endDate || 'Present'}`
  }
  return 'All Time'
}

// Single-vehicle Excel history export
export async function exportToExcel(
  vehicle: Vehicle,
  history: HistoryRecord[],
  filters: { startDate: string; endDate: string; type: string }
) {
  const XLSX = await import('xlsx')
  const dateRangeStr = getDateRangeString(filters.startDate, filters.endDate)
  const typeFilter = filters.type === 'all' ? 'All Records' : filters.type

  const data = [
    ['VEHICLE HISTORY REPORT'],
    [],
    ['VEHICLE DETAILS'],
    ['Vehicle Name:', vehicle.name, 'Plate Number:', vehicle.plateNumber],
    ['Vehicle ID:', vehicle.id, 'Department:', vehicle.department],
    ['Driver:', vehicle.driver || 'Unassigned', 'Current Odometer:', `${vehicle.odometer.toLocaleString()} km`],
    ['Current Status:', vehicle.status],
    [],
    ['FILTERS APPLIED'],
    ['Date Range:', dateRangeStr, 'Type Filter:', typeFilter],
    [],
    ['HISTORY RECORDS'],
    ['Date', 'Record ID', 'Type', 'Category / Type', 'Provider / Workshop', 'Description', 'Cost ($)', 'Status'],
    ...history.map((item) => [
      item.date,
      item.id,
      item.type,
      item.recordType,
      item.provider,
      item.description,
      item.cost,
      item.status,
    ]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Vehicle History')

  const fileName = `${vehicle.name.replace(/\s+/g, '_')}_history_report.xlsx`
  XLSX.writeFile(wb, fileName)
}

// Fleet-level Excel history export
export async function exportFleetToExcel(
  fleetData: FleetVehicleData[],
  filters: { search: string; status: string; type: string; startDate: string; endDate: string }
) {
  const XLSX = await import('xlsx')

  const dateRangeStr = getDateRangeString(filters.startDate, filters.endDate)
  const statusFilter = filters.status === 'all' ? 'All Statuses' : filters.status
  const typeFilter = filters.type === 'all' ? 'All Categories' : filters.type
  const searchFilter = filters.search || 'None'

  // Sheet 1: Fleet summary sheet
  const summaryRows = [
    ['FLEET VEHICLES SUMMARY REPORT'],
    [],
    ['FILTERS APPLIED'],
    ['Search Query:', searchFilter, 'Vehicle Status:', statusFilter],
    ['Date Range:', dateRangeStr, 'Activity Type:', typeFilter],
    [],
    ['VEHICLES OVERVIEW'],
    ['Vehicle Name', 'Vehicle ID', 'Plate Number', 'Reg Number', 'Department', 'Driver', 'Odometer (km)', 'Last Maintenance', 'Last Repair', 'Status', 'Cost in Period ($)'],
    ...fleetData.map((d) => [
      d.vehicle.name,
      d.vehicle.id,
      d.vehicle.plateNumber,
      d.vehicle.registrationNumber,
      d.vehicle.department,
      d.vehicle.driver || 'Unassigned',
      d.vehicle.odometer,
      d.lastMaintenanceDate || '—',
      d.lastRepairDate || '—',
      d.vehicle.status,
      d.totalCost,
    ]),
  ]

  // Sheet 2: Flat work orders log
  const allLogs: any[] = []
  fleetData.forEach((d) => {
    d.historyRecords.forEach((item) => {
      allLogs.push({
        vehicleName: d.vehicle.name,
        vehicleId: d.vehicle.id,
        plateNumber: d.vehicle.plateNumber,
        ...item,
      })
    })
  })

  allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const detailedRows = [
    ['FLEET WORK HISTORY LOG'],
    [],
    ['FILTERS APPLIED'],
    ['Search Query:', searchFilter, 'Vehicle Status:', statusFilter],
    ['Date Range:', dateRangeStr, 'Activity Type:', typeFilter],
    [],
    ['WORK HISTORY RECORDS'],
    ['Date', 'Vehicle', 'Vehicle ID', 'Plate Number', 'Record ID', 'Type', 'Category / Details', 'Provider / Workshop', 'Description', 'Cost ($)', 'Status'],
    ...allLogs.map((log) => [
      log.date,
      log.vehicleName,
      log.vehicleId,
      log.plateNumber,
      log.id,
      log.type,
      log.recordType,
      log.provider,
      log.description,
      log.cost,
      log.status,
    ]),
  ]

  const wb = XLSX.utils.book_new()
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows)
  const wsDetails = XLSX.utils.aoa_to_sheet(detailedRows)

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Fleet Summary')
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Work History Logs')

  XLSX.writeFile(wb, 'fleet_history_report.xlsx')
}

// Single-vehicle PDF history export
export async function exportToPDF(
  vehicle: Vehicle,
  history: HistoryRecord[],
  filters: { startDate: string; endDate: string; type: string }
) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()
  const dateRangeStr = getDateRangeString(filters.startDate, filters.endDate)
  const typeFilter = filters.type === 'all' ? 'All (Maintenance & Repair)' : filters.type

  doc.setFontSize(18)
  doc.setTextColor(40, 116, 240)
  doc.setFont('helvetica', 'bold')
  doc.text('VEHICLE HISTORY REPORT', 14, 20)

  doc.setLineWidth(0.5)
  doc.setDrawColor(220, 225, 230)
  doc.line(14, 23, 196, 23)

  doc.setFontSize(10)
  doc.setTextColor(80, 85, 90)

  doc.setFont('helvetica', 'bold')
  doc.text('Vehicle Name:', 14, 31)
  doc.setFont('helvetica', 'normal')
  doc.text(vehicle.name, 42, 31)

  doc.setFont('helvetica', 'bold')
  doc.text('Plate Number:', 14, 36)
  doc.setFont('helvetica', 'normal')
  doc.text(vehicle.plateNumber, 42, 36)

  doc.setFont('helvetica', 'bold')
  doc.text('Vehicle ID:', 14, 41)
  doc.setFont('helvetica', 'normal')
  doc.text(vehicle.id, 42, 41)

  doc.setFont('helvetica', 'bold')
  doc.text('Driver:', 14, 46)
  doc.setFont('helvetica', 'normal')
  doc.text(vehicle.driver || 'Unassigned', 42, 46)

  doc.setFont('helvetica', 'bold')
  doc.text('Department:', 110, 31)
  doc.setFont('helvetica', 'normal')
  doc.text(vehicle.department || 'N/A', 135, 31)

  doc.setFont('helvetica', 'bold')
  doc.text('Current Odometer:', 110, 36)
  doc.setFont('helvetica', 'normal')
  doc.text(`${vehicle.odometer.toLocaleString()} km`, 135, 36)

  doc.setFont('helvetica', 'bold')
  doc.text('Current Status:', 110, 41)
  doc.setFont('helvetica', 'normal')
  doc.text(vehicle.status, 135, 41)

  doc.setFillColor(245, 247, 250)
  doc.rect(14, 52, 182, 12, 'F')
  doc.setDrawColor(225, 230, 235)
  doc.rect(14, 52, 182, 12, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 65, 70)
  doc.text('Filters Applied:', 18, 60)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 85, 90)
  doc.text(`Date Range: ${dateRangeStr}`, 48, 60)
  doc.text(`Type: ${typeFilter}`, 135, 60)

  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Chronological Service & Repair History', 14, 73)

  const columns = ['Date', 'Record ID', 'Type', 'Category / Details', 'Provider / Workshop', 'Cost', 'Status']
  const rows = history.map((item) => [
    item.date,
    item.id,
    item.type,
    `${item.recordType}\n${item.description}`,
    item.provider,
    `$${item.cost.toLocaleString()}`,
    item.status,
  ])

  autoTable(doc, {
    startY: 77,
    head: [columns],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      valign: 'middle',
    },
    columnStyles: {
      3: { cellWidth: 50 },
      5: { halign: 'right' },
    },
  })

  const totalCost = history.reduce((sum, item) => sum + item.cost, 0)
  const finalY = (doc as any).lastAutoTable.finalY + 10
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(40, 40, 40)
  doc.text(`Total Records: ${history.length}`, 14, finalY)
  doc.text(`Total Cost: $${totalCost.toLocaleString()}`, 110, finalY)

  const fileName = `${vehicle.name.replace(/\s+/g, '_')}_history_report.pdf`
  doc.save(fileName)
}

// Fleet-level PDF history export
export async function exportFleetToPDF(
  fleetData: FleetVehicleData[],
  filters: { search: string; status: string; type: string; startDate: string; endDate: string }
) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()

  const dateRangeStr = getDateRangeString(filters.startDate, filters.endDate)
  const statusFilter = filters.status === 'all' ? 'All Statuses' : filters.status
  const typeFilter = filters.type === 'all' ? 'All Categories' : filters.type
  const searchFilter = filters.search || 'None'

  doc.setFontSize(20)
  doc.setTextColor(40, 116, 240)
  doc.setFont('helvetica', 'bold')
  doc.text('FLEET VEHICLES HISTORY REPORT', 14, 25)

  doc.setLineWidth(0.7)
  doc.setDrawColor(40, 116, 240)
  doc.line(14, 28, 196, 28)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORT FILTERS AND CONFIGURATION', 14, 38)

  doc.setFillColor(245, 247, 250)
  doc.rect(14, 42, 182, 22, 'F')
  doc.setDrawColor(225, 230, 235)
  doc.rect(14, 42, 182, 22, 'S')

  doc.setTextColor(80, 85, 90)
  doc.text('Search Query:', 18, 49)
  doc.setFont('helvetica', 'normal')
  doc.text(searchFilter, 45, 49)

  doc.setFont('helvetica', 'bold')
  doc.text('Vehicle Status:', 110, 49)
  doc.setFont('helvetica', 'normal')
  doc.text(statusFilter, 140, 49)

  doc.setFont('helvetica', 'bold')
  doc.text('Date Range:', 18, 57)
  doc.setFont('helvetica', 'normal')
  doc.text(dateRangeStr, 45, 57)

  doc.setFont('helvetica', 'bold')
  doc.text('Activity Type:', 110, 57)
  doc.setFont('helvetica', 'normal')
  doc.text(typeFilter, 140, 57)

  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Vehicles Summary Table', 14, 76)

  const summaryColumns = ['Vehicle Name', 'Plate', 'Reg. Number', 'Department', 'Odometer', 'Last Maint', 'Last Repair', 'Status', 'Cost']
  const summaryRows = fleetData.map((d) => [
    d.vehicle.name,
    d.vehicle.plateNumber,
    d.vehicle.registrationNumber,
    d.vehicle.department,
    `${d.vehicle.odometer.toLocaleString()} km`,
    d.lastMaintenanceDate || '—',
    d.lastRepairDate || '—',
    d.vehicle.status,
    `$${d.totalCost.toLocaleString()}`,
  ])

  autoTable(doc, {
    startY: 80,
    head: [summaryColumns],
    body: summaryRows,
    theme: 'striped',
    headStyles: {
      fillColor: [40, 116, 240],
      textColor: [255, 255, 255],
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      8: { halign: 'right' },
    },
  })

  fleetData.forEach((d) => {
    doc.addPage()

    doc.setFontSize(14)
    doc.setTextColor(40, 116, 240)
    doc.setFont('helvetica', 'bold')
    doc.text(`HISTORY LOG: ${d.vehicle.name.toUpperCase()}`, 14, 20)

    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `ID: ${d.vehicle.id}  |  Plate: ${d.vehicle.plateNumber}  |  Driver: ${d.vehicle.driver || 'Unassigned'}  |  Department: ${d.vehicle.department}`,
      14,
      25
    )

    doc.setLineWidth(0.3)
    doc.setDrawColor(200, 200, 200)
    doc.line(14, 27, 196, 27)

    if (d.historyRecords.length === 0) {
      doc.setFontSize(10)
      doc.setTextColor(120, 120, 120)
      doc.setFont('helvetica', 'italic')
      doc.text('No maintenance or repair history found for this vehicle in the selected period.', 14, 38)
    } else {
      const logColumns = ['Date', 'Record ID', 'Type', 'Category / Details', 'Provider / Workshop', 'Cost', 'Status']
      const logRows = d.historyRecords.map((item) => [
        item.date,
        item.id,
        item.type,
        `${item.recordType}\n${item.description}`,
        item.provider,
        `$${item.cost.toLocaleString()}`,
        item.status,
      ])

      autoTable(doc, {
        startY: 32,
        head: [logColumns],
        body: logRows,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        columnStyles: {
          3: { cellWidth: 50 },
          5: { halign: 'right' },
        },
      })

      const vTotal = d.historyRecords.reduce((sum, r) => sum + r.cost, 0)
      const fY = (doc as any).lastAutoTable.finalY + 8
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      doc.text(`Total Records: ${d.historyRecords.length}   |   Aggregated Cost: $${vTotal.toLocaleString()}`, 14, fY)
    }
  })

  doc.save('fleet_history_report.pdf')
}

// ==========================================
// EXPENSE EXPORTS (EXCEL AND PDF)
// ==========================================

export async function exportExpensesToExcel(
  expensesList: UnifiedExpense[],
  filters: {
    search: string
    category: string
    type: string
    startDate: string
    endDate: string
    vehicle: string
  }
) {
  const XLSX = await import('xlsx')

  const dateRangeStr = getDateRangeString(filters.startDate, filters.endDate)
  const categoryFilter = filters.category === 'all' ? 'All Categories' : filters.category
  const typeFilter = filters.type === 'all' ? 'All Types' : filters.type
  const searchFilter = filters.search || 'None'
  const vehicleFilter = filters.vehicle === 'all' ? 'All Vehicles' : filters.vehicle

  const summaryData = [
    ['FLEET EXPENSES AND PURCHASES REPORT'],
    [],
    ['REPORT FILTERS APPLIED'],
    ['Search Query:', searchFilter, 'Category Filter:', categoryFilter],
    ['Date Range:', dateRangeStr, 'Expense Type:', typeFilter],
    ['Selected Vehicle:', vehicleFilter],
    [],
    ['EXPENSES SUMMARY STATISTICS'],
    ['Total Records:', expensesList.length],
    ['Total Cost sum:', expensesList.reduce((sum, e) => sum + e.amount, 0)],
    [],
    ['EXPENSES TRANSACTION LOG'],
    [
      'Date',
      'Expense ID',
      'Expense Type',
      'Category',
      'Vehicle / Item Name',
      'Description',
      'Quantity',
      'Unit Price ($)',
      'Supplier',
      'Total Cost ($)',
    ],
    ...expensesList.map((e) => [
      e.date,
      e.id,
      e.type,
      e.category,
      e.name,
      e.description,
      e.quantity !== undefined ? e.quantity : '—',
      e.unitPrice !== undefined ? e.unitPrice : '—',
      e.supplier || '—',
      e.amount,
    ]),
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses Report')

  XLSX.writeFile(wb, 'expenses_report.xlsx')
}

export async function exportExpensesToPDF(
  expensesList: UnifiedExpense[],
  filters: {
    search: string
    category: string
    type: string
    startDate: string
    endDate: string
    vehicle: string
  }
) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()
  const dateRangeStr = getDateRangeString(filters.startDate, filters.endDate)
  const categoryFilter = filters.category === 'all' ? 'All Categories' : filters.category
  const typeFilter = filters.type === 'all' ? 'All Types (Vehicle & Inventory)' : filters.type
  const searchFilter = filters.search || 'None'
  const vehicleFilter = filters.vehicle === 'all' ? 'All Vehicles' : filters.vehicle

  doc.setFontSize(20)
  doc.setTextColor(40, 116, 240)
  doc.setFont('helvetica', 'bold')
  doc.text('FLEET EXPENSES REPORT', 14, 25)

  doc.setLineWidth(0.7)
  doc.setDrawColor(40, 116, 240)
  doc.line(14, 28, 196, 28)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('REPORT FILTERS AND CONFIGURATION', 14, 38)

  doc.setFillColor(245, 247, 250)
  doc.rect(14, 42, 182, 28, 'F')
  doc.setDrawColor(225, 230, 235)
  doc.rect(14, 42, 182, 28, 'S')

  doc.setTextColor(80, 85, 90)
  doc.text('Search Query:', 18, 49)
  doc.setFont('helvetica', 'normal')
  doc.text(searchFilter, 45, 49)

  doc.setFont('helvetica', 'bold')
  doc.text('Expense Type:', 110, 49)
  doc.setFont('helvetica', 'normal')
  doc.text(typeFilter, 140, 49)

  doc.setFont('helvetica', 'bold')
  doc.text('Date Range:', 18, 57)
  doc.setFont('helvetica', 'normal')
  doc.text(dateRangeStr, 45, 57)

  doc.setFont('helvetica', 'bold')
  doc.text('Category:', 110, 57)
  doc.setFont('helvetica', 'normal')
  doc.text(categoryFilter, 140, 57)

  doc.setFont('helvetica', 'bold')
  doc.text('Vehicle Filter:', 18, 65)
  doc.setFont('helvetica', 'normal')
  doc.text(vehicleFilter, 45, 65)

  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Unified Expense Logs Table', 14, 82)

  const columns = ['Date', 'ID', 'Type', 'Category', 'Vehicle / Item', 'Provider / Supplier', 'Cost']
  const rows = expensesList.map((e) => [
    e.date,
    e.id,
    e.type,
    e.category,
    e.name,
    e.supplier || '—',
    `$${e.amount.toLocaleString()}`,
  ])

  autoTable(doc, {
    startY: 86,
    head: [columns],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [40, 116, 240],
      textColor: [255, 255, 255],
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      6: { halign: 'right' },
    },
  })

  const totalSum = expensesList.reduce((sum, e) => sum + e.amount, 0)
  const fY = (doc as any).lastAutoTable.finalY + 10
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(40, 40, 40)
  doc.text(`Total Transaction Records: ${expensesList.length}`, 14, fY)
  doc.text(`Grand Total Expenditure: $${totalSum.toLocaleString()}`, 105, fY)

  doc.save('expenses_report.pdf')
}

// ==========================================
// NEW: INVENTORY DETAILS EXPORTS
// ==========================================

export async function exportInventoryToExcel(
  item: any,
  usages: InventoryUsageRecord[],
  filters: { startDate: string; endDate: string; type: string; search: string }
) {
  const XLSX = await import('xlsx')
  const dateRangeStr = getDateRangeString(filters.startDate, filters.endDate)
  const typeFilter = filters.type === 'all' ? 'All Activities' : filters.type
  const searchQuery = filters.search || 'None'

  const data = [
    ['INVENTORY ITEM DETAILS REPORT'],
    [],
    ['ITEM SPECIFICATIONS'],
    ['Item Name:', item.name, 'Item Code:', item.code],
    ['Brand:', item.brand, 'Category:', item.category],
    ['Location:', item.location, 'Current Stock:', `${item.stock} ${item.unit}`],
    ['Minimum Stock Level:', `${item.minStock} ${item.unit}`, 'Supplier:', item.supplier],
    [],
    ['SUMMARY STATISTICS'],
    ['Unit Purchase Price:', `$${item.purchasePrice}`, 'Total Amount Spent:', `$${(item.stock * item.purchasePrice).toLocaleString()}`],
    [],
    ['FILTERS APPLIED TO USAGE'],
    ['Date Range:', dateRangeStr, 'Activity Type:', typeFilter],
    ['Search Query:', searchQuery],
    [],
    ['ITEM CONSUMPTION & USAGE LOG'],
    ['Date', 'Log ID', 'Activity Type', 'Vehicle Name', 'Vehicle ID', 'Quantity Replaced', 'Unit Usage Price ($)', 'Total Usage Cost ($)'],
    ...usages.map((u) => [
      u.date,
      u.recordId,
      u.type,
      u.vehicleName,
      u.vehicleId,
      u.quantity,
      u.unitPrice,
      u.totalCost,
    ]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory Details')

  const fileName = `${item.name.replace(/\s+/g, '_')}_history_report.xlsx`
  XLSX.writeFile(wb, fileName)
}

export async function exportInventoryToPDF(
  item: any,
  usages: InventoryUsageRecord[],
  filters: { startDate: string; endDate: string; type: string; search: string }
) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()
  const dateRangeStr = getDateRangeString(filters.startDate, filters.endDate)
  const typeFilter = filters.type === 'all' ? 'All (Maintenance & Repair)' : filters.type

  doc.setFontSize(18)
  doc.setTextColor(40, 116, 240)
  doc.setFont('helvetica', 'bold')
  doc.text('INVENTORY ITEM DETAILS REPORT', 14, 20)

  doc.setLineWidth(0.5)
  doc.setDrawColor(220, 225, 230)
  doc.line(14, 23, 196, 23)

  doc.setFontSize(10)
  doc.setTextColor(80, 85, 90)

  doc.setFont('helvetica', 'bold')
  doc.text('Item Name:', 14, 31)
  doc.setFont('helvetica', 'normal')
  doc.text(item.name, 42, 31)

  doc.setFont('helvetica', 'bold')
  doc.text('Item Code:', 14, 36)
  doc.setFont('helvetica', 'normal')
  doc.text(item.code, 42, 36)

  doc.setFont('helvetica', 'bold')
  doc.text('Brand:', 14, 41)
  doc.setFont('helvetica', 'normal')
  doc.text(item.brand, 42, 41)

  doc.setFont('helvetica', 'bold')
  doc.text('Category:', 14, 46)
  doc.setFont('helvetica', 'normal')
  doc.text(item.category, 42, 46)

  doc.setFont('helvetica', 'bold')
  doc.text('Supplier:', 110, 31)
  doc.setFont('helvetica', 'normal')
  doc.text(item.supplier || '—', 135, 31)

  doc.setFont('helvetica', 'bold')
  doc.text('Current Stock:', 110, 36)
  doc.setFont('helvetica', 'normal')
  doc.text(`${item.stock} ${item.unit}`, 135, 36)

  doc.setFont('helvetica', 'bold')
  doc.text('Unit Purchase Price:', 110, 41)
  doc.setFont('helvetica', 'normal')
  doc.text(`$${item.purchasePrice}`, 148, 41)

  doc.setFont('helvetica', 'bold')
  doc.text('Total Amount Spent:', 110, 46)
  doc.setFont('helvetica', 'normal')
  doc.text(`$${(item.stock * item.purchasePrice).toLocaleString()}`, 148, 46)

  doc.setFillColor(245, 247, 250)
  doc.rect(14, 52, 182, 12, 'F')
  doc.setDrawColor(225, 230, 235)
  doc.rect(14, 52, 182, 12, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 65, 70)
  doc.text('Usage Filters Applied:', 18, 60)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 85, 90)
  doc.text(`Date Range: ${dateRangeStr}`, 58, 60)
  doc.text(`Type: ${typeFilter}`, 135, 60)

  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Item Consumption & Usage Logs', 14, 73)

  const columns = ['Date', 'Log ID', 'Type', 'Vehicle Name', 'Vehicle ID', 'Qty Replaced', 'Usage Price', 'Total Cost']
  const rows = usages.map((u) => [
    u.date,
    u.recordId,
    u.type,
    u.vehicleName,
    u.vehicleId,
    u.quantity,
    `$${u.unitPrice.toLocaleString()}`,
    `$${u.totalCost.toLocaleString()}`,
  ])

  autoTable(doc, {
    startY: 77,
    head: [columns],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      valign: 'middle',
    },
    columnStyles: {
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
  })

  const totalUsageCost = usages.reduce((sum, u) => sum + u.totalCost, 0)
  const finalY = (doc as any).lastAutoTable.finalY + 10
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(40, 40, 40)
  doc.text(`Total Usages Found: ${usages.length}`, 14, finalY)
  doc.text(`Total Usage Value: $${totalUsageCost.toLocaleString()}`, 110, finalY)

  const fileName = `${item.name.replace(/\s+/g, '_')}_history_report.pdf`
  doc.save(fileName)
}
