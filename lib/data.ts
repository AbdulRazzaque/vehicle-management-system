// Centralized mock data + types for the FleetCore platform.

export type VehicleStatus = 'Active' | 'Maintenance' | 'Repair' | 'Inactive'

export type Vehicle = {
  id: string
  name: string
  model: string
  modelNumber: string
  plateNumber: string
  registrationNumber: string
  year: number
  color: string
  chassisNumber: string
  engineNumber: string
  type: string
  fuelType: string
  insurer: string
  insuranceExpiry: string
  registrationExpiry: string
  department: string
  driver: string
  status: VehicleStatus
  odometer: number
  notes: string
  createdBy?: string
}

export type MaintenanceItem = {
  name: string
  quantity: number
  unitPrice: number
}

export type Maintenance = {
  id: string
  vehicleId: string
  vehicleName: string
  date: string
  type: string
  vendor: string
  odometer: number
  description: string
  nextDate: string
  status: 'Scheduled' | 'In Progress' | 'Completed'
  items: MaintenanceItem[]
  cost?: number
  createdBy?: string
}

export type Repair = {
  id: string
  vehicleId: string
  vehicleName: string
  date: string
  type: string
  workshop: string
  description: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Scheduled' | 'In Progress' | 'Completed'
  items: { name: string; quantity: number; unitCost: number }[]
  cost?: number
  createdBy?: string
}

export type InventoryItem = {
  id: string
  code: string
  name: string
  category: string
  brand: string
  unit: string
  purchasePrice: number
  usagePrice: number
  stock: number
  minStock: number
  supplier: string
  location: string
  createdBy?: string
}

// export const vehicles: Vehicle[] = [
//   {
//     id: 'VH-1042',
//     name: 'Volvo FH16',
//     model: 'FH16 Globetrotter',
//     modelNumber: 'FH16-750',
//     plateNumber: 'KJ-8841',
//     registrationNumber: 'REG-2021-8841',
//     year: 2021,
//     color: 'Midnight Blue',
//     chassisNumber: 'YV2RT40A8MB123456',
//     engineNumber: 'D16K750-9921',
//     type: 'Heavy Truck',
//     fuelType: 'Diesel',
//     insurer: 'Allianz Fleet',
//     insuranceExpiry: '2026-02-18',
//     registrationExpiry: '2026-08-01',
//     department: 'Logistics',
//     driver: 'Marcus Reed',
//     status: 'Active',
//     odometer: 184320,
//     notes: 'Long-haul unit. Telematics installed.',
//   },
//   {
//     id: 'VH-1043',
//     name: 'Mercedes Sprinter',
//     model: 'Sprinter 315 CDI',
//     modelNumber: 'SPR-315',
//     plateNumber: 'LM-2290',
//     registrationNumber: 'REG-2022-2290',
//     year: 2022,
//     color: 'Arctic White',
//     chassisNumber: 'WDB9066331S987654',
//     engineNumber: 'OM651-44210',
//     type: 'Van',
//     fuelType: 'Diesel',
//     insurer: 'AXA Commercial',
//     insuranceExpiry: '2026-01-05',
//     registrationExpiry: '2026-05-22',
//     department: 'Field Service',
//     driver: 'Aisha Bello',
//     status: 'Maintenance',
//     odometer: 96210,
//     notes: 'Scheduled 90k service in progress.',
//   },
//   {
//     id: 'VH-1044',
//     name: 'Toyota Hilux',
//     model: 'Hilux Double Cab',
//     modelNumber: 'HLX-2.8',
//     plateNumber: 'RT-5512',
//     registrationNumber: 'REG-2020-5512',
//     year: 2020,
//     color: 'Silver Metallic',
//     chassisNumber: 'AHTFR22G306512345',
//     engineNumber: '1GD-FTV-7781',
//     type: 'Pickup',
//     fuelType: 'Diesel',
//     insurer: 'Allianz Fleet',
//     insuranceExpiry: '2025-12-30',
//     registrationExpiry: '2026-03-14',
//     department: 'Operations',
//     driver: 'Carlos Mendez',
//     status: 'Repair',
//     odometer: 142880,
//     notes: 'Front suspension repair underway.',
//   },
//   {
//     id: 'VH-1045',
//     name: 'Ford Transit',
//     model: 'Transit 350L',
//     modelNumber: 'TRN-350L',
//     plateNumber: 'BX-7730',
//     registrationNumber: 'REG-2023-7730',
//     year: 2023,
//     color: 'Race Red',
//     chassisNumber: 'WF0XXXTTGXMB45678',
//     engineNumber: 'EcoBlue-22014',
//     type: 'Van',
//     fuelType: 'Diesel',
//     insurer: 'Zurich Mobility',
//     insuranceExpiry: '2026-09-11',
//     registrationExpiry: '2026-11-02',
//     department: 'Field Service',
//     driver: 'Hannah Cole',
//     status: 'Active',
//     odometer: 41200,
//     notes: '',
//   },
//   {
//     id: 'VH-1046',
//     name: 'Tesla Model Y',
//     model: 'Model Y Long Range',
//     modelNumber: 'MY-LR',
//     plateNumber: 'EV-0091',
//     registrationNumber: 'REG-2024-0091',
//     year: 2024,
//     color: 'Pearl White',
//     chassisNumber: '7SAYGDEE1RF123456',
//     engineNumber: 'N/A (Dual Motor)',
//     type: 'SUV',
//     fuelType: 'Electric',
//     insurer: 'Zurich Mobility',
//     insuranceExpiry: '2026-07-19',
//     registrationExpiry: '2027-01-08',
//     department: 'Executive',
//     driver: 'Sofia Rossi',
//     status: 'Active',
//     odometer: 18760,
//     notes: 'EV pool vehicle.',
//   },
//   {
//     id: 'VH-1047',
//     name: 'Scania R450',
//     model: 'R450 Highline',
//     modelNumber: 'R450',
//     plateNumber: 'KJ-1199',
//     registrationNumber: 'REG-2019-1199',
//     year: 2019,
//     color: 'Graphite Grey',
//     chassisNumber: 'XLER4X20005123456',
//     engineNumber: 'DC13-450-7711',
//     type: 'Heavy Truck',
//     fuelType: 'Diesel',
//     insurer: 'AXA Commercial',
//     insuranceExpiry: '2025-11-28',
//     registrationExpiry: '2026-02-20',
//     department: 'Logistics',
//     driver: 'Ivan Petrov',
//     status: 'Inactive',
//     odometer: 312540,
//     notes: 'Awaiting decommission review.',
//   },
// ]

export const maintenance: Maintenance[] = [
  {
    id: 'MNT-3301',
    vehicleId: 'VH-1043',
    vehicleName: 'Mercedes Sprinter',
    date: '2025-06-08',
    type: 'Scheduled Service (90k)',
    vendor: 'AutoCare Pro',
    odometer: 96210,
    description: 'Full 90,000 km service interval.',
    nextDate: '2025-12-08',
    status: 'In Progress',
    items: [
      { name: 'Engine Oil (5W-30)', quantity: 6, unitPrice: 9.5 },
      { name: 'Oil Filter', quantity: 1, unitPrice: 14 },
      { name: 'Air Filter', quantity: 1, unitPrice: 22 },
      { name: 'Labor Charges', quantity: 3, unitPrice: 45 },
    ],
  },
  {
    id: 'MNT-3300',
    vehicleId: 'VH-1042',
    vehicleName: 'Volvo FH16',
    date: '2025-05-21',
    type: 'Oil & Filter Change',
    vendor: 'Fleet Service Center',
    odometer: 181900,
    description: 'Routine oil change and inspection.',
    nextDate: '2025-11-21',
    status: 'Completed',
    items: [
      { name: 'Engine Oil (15W-40)', quantity: 12, unitPrice: 8.2 },
      { name: 'Oil Filter', quantity: 2, unitPrice: 16 },
      { name: 'Coolant', quantity: 4, unitPrice: 11 },
      { name: 'Labor Charges', quantity: 4, unitPrice: 50 },
    ],
  },
  {
    id: 'MNT-3299',
    vehicleId: 'VH-1045',
    vehicleName: 'Ford Transit',
    date: '2025-05-12',
    type: 'Brake Inspection',
    vendor: 'AutoCare Pro',
    odometer: 39800,
    description: 'Brake pad inspection, within spec.',
    nextDate: '2025-11-12',
    status: 'Completed',
    items: [
      { name: 'Brake Fluid', quantity: 1, unitPrice: 18 },
      { name: 'Labor Charges', quantity: 1.5, unitPrice: 45 },
    ],
  },
  {
    id: 'MNT-3298',
    vehicleId: 'VH-1046',
    vehicleName: 'Tesla Model Y',
    date: '2025-07-02',
    type: 'Tire Rotation',
    vendor: 'EV Specialists',
    odometer: 18760,
    description: 'Scheduled tire rotation and software check.',
    nextDate: '2026-01-02',
    status: 'Scheduled',
    items: [{ name: 'Labor Charges', quantity: 1, unitPrice: 40 }],
  },
]

export const repairs: Repair[] = [
  {
    id: 'RPR-2210',
    vehicleId: 'VH-1044',
    vehicleName: 'Toyota Hilux',
    date: '2025-06-05',
    type: 'Suspension',
    workshop: 'Precision Motors',
    description: 'Front suspension overhaul after rough-terrain damage.',
    priority: 'High',
    status: 'In Progress',
    items: [
      { name: 'Shock Absorber (Front)', quantity: 2, unitCost: 120 },
      { name: 'Control Arm Bushing', quantity: 4, unitCost: 28 },
      { name: 'Labor Charges', quantity: 6, unitCost: 55 },
    ],
  },
  {
    id: 'RPR-2209',
    vehicleId: 'VH-1042',
    vehicleName: 'Volvo FH16',
    date: '2025-05-18',
    type: 'Electrical',
    workshop: 'Fleet Service Center',
    description: 'Alternator replacement and wiring repair.',
    priority: 'Critical',
    status: 'Completed',
    items: [
      { name: 'Alternator', quantity: 1, unitCost: 410 },
      { name: 'Electrical Parts', quantity: 1, unitCost: 95 },
      { name: 'Labor Charges', quantity: 5, unitCost: 60 },
    ],
  },
  {
    id: 'RPR-2208',
    vehicleId: 'VH-1047',
    vehicleName: 'Scania R450',
    date: '2025-04-30',
    type: 'Brakes',
    workshop: 'Precision Motors',
    description: 'Brake disc and pad replacement, all axles.',
    priority: 'Medium',
    status: 'Completed',
    items: [
      { name: 'Brake Disc', quantity: 4, unitCost: 85 },
      { name: 'Brake Pads', quantity: 8, unitCost: 32 },
      { name: 'Labor Charges', quantity: 7, unitCost: 55 },
    ],
  },
]

export const inventory: InventoryItem[] = [
  { id: 'INV-001', code: 'OIL-5W30', name: 'Engine Oil 5W-30', category: 'Engine Oil', brand: 'Mobil', unit: 'Litre', purchasePrice: 7.2, usagePrice: 9.5, stock: 240, minStock: 80, supplier: 'LubriMax', location: 'A1-03' },
  { id: 'INV-002', code: 'FLT-OIL', name: 'Oil Filter', category: 'Oil Filter', brand: 'Bosch', unit: 'Piece', purchasePrice: 10, usagePrice: 14, stock: 18, minStock: 25, supplier: 'PartsHub', location: 'B2-11' },
  { id: 'INV-003', code: 'FLT-AIR', name: 'Air Filter', category: 'Air Filter', brand: 'Mann', unit: 'Piece', purchasePrice: 16, usagePrice: 22, stock: 42, minStock: 20, supplier: 'PartsHub', location: 'B2-14' },
  { id: 'INV-004', code: 'BRK-PAD', name: 'Brake Pads Set', category: 'Brake Pads', brand: 'Brembo', unit: 'Set', purchasePrice: 26, usagePrice: 32, stock: 12, minStock: 15, supplier: 'StopTech Supply', location: 'C1-02' },
  { id: 'INV-005', code: 'BRK-DSC', name: 'Brake Disc', category: 'Brake Disc', brand: 'Brembo', unit: 'Piece', purchasePrice: 68, usagePrice: 85, stock: 30, minStock: 10, supplier: 'StopTech Supply', location: 'C1-05' },
  { id: 'INV-006', code: 'BAT-12V', name: 'Battery 12V 100Ah', category: 'Battery', brand: 'Varta', unit: 'Piece', purchasePrice: 130, usagePrice: 165, stock: 8, minStock: 10, supplier: 'PowerCell', location: 'D3-01' },
  { id: 'INV-007', code: 'TIRE-HD', name: 'Heavy Duty Tire', category: 'Tire', brand: 'Michelin', unit: 'Piece', purchasePrice: 290, usagePrice: 350, stock: 22, minStock: 8, supplier: 'TireWorld', location: 'E1-08' },
  { id: 'INV-008', code: 'COOL-G12', name: 'Coolant G12', category: 'Coolant', brand: 'Castrol', unit: 'Litre', purchasePrice: 8, usagePrice: 11, stock: 96, minStock: 40, supplier: 'LubriMax', location: 'A1-07' },
  { id: 'INV-009', code: 'SPK-PLG', name: 'Spark Plug', category: 'Spark Plug', brand: 'NGK', unit: 'Piece', purchasePrice: 4.5, usagePrice: 7, stock: 6, minStock: 24, supplier: 'PartsHub', location: 'B3-02' },
  { id: 'INV-010', code: 'BLT-SRP', name: 'Serpentine Belt', category: 'Belts', brand: 'Gates', unit: 'Piece', purchasePrice: 22, usagePrice: 30, stock: 34, minStock: 12, supplier: 'PartsHub', location: 'B3-09' },
]

export type Expense = {
  id: string
  item: string
  itemType: 'Vehicle' | 'Inventory' | 'Custom'
  itemId?: string
  vehicleId?: string
  vehicleName?: string
  date: string
  category?: string
  amount: number
  description: string
  paymentMethod?: string
  createdBy?: string
}

export const expenses: Expense[] = [
  { id: 'EXP-5001', item: 'Volvo FH16', itemType: 'Vehicle', itemId: 'VH-1042', vehicleId: 'VH-1042', vehicleName: 'Volvo FH16', date: '2025-06-02', category: 'Fuel Cost', amount: 820, description: 'Diesel refuel — long haul', paymentMethod: 'Corporate Card', createdBy: 'Daniel Okoro' },
  { id: 'EXP-5002', item: 'Mercedes Sprinter', itemType: 'Vehicle', itemId: 'VH-1043', vehicleId: 'VH-1043', vehicleName: 'Mercedes Sprinter', date: '2025-06-08', category: 'Maintenance Cost', amount: 312, description: '90k service', paymentMethod: 'Bank Transfer', createdBy: 'Aisha Bello' },
  { id: 'EXP-5003', item: 'Toyota Hilux', itemType: 'Vehicle', itemId: 'VH-1044', vehicleId: 'VH-1044', vehicleName: 'Toyota Hilux', date: '2025-06-05', category: 'Repair Cost', amount: 678, description: 'Suspension repair', paymentMethod: 'Cash', createdBy: 'Daniel Okoro' },
  { id: 'EXP-5004', item: 'Tesla Model Y', itemType: 'Vehicle', itemId: 'VH-1046', vehicleId: 'VH-1046', vehicleName: 'Tesla Model Y', date: '2025-06-01', category: 'Insurance Cost', amount: 540, description: 'Quarterly premium', paymentMethod: 'Bank Transfer', createdBy: 'Priya Nair' },
  { id: 'EXP-5005', item: 'Scania R450', itemType: 'Vehicle', itemId: 'VH-1047', vehicleId: 'VH-1047', vehicleName: 'Scania R450', date: '2025-05-30', category: 'Registration Cost', amount: 220, description: 'Annual registration renewal', paymentMethod: 'Credit Card', createdBy: 'Daniel Okoro' },
  { id: 'EXP-5006', item: 'Brake Pads Set', itemType: 'Inventory', itemId: 'INV-201', date: '2025-05-28', category: 'Inventory', amount: 700, description: 'Bulk order brake pads', paymentMethod: 'Corporate Card', createdBy: 'System User' },
  { id: 'EXP-5007', item: 'Office Supplies & Stationeries', itemType: 'Custom', date: '2025-05-18', category: 'General', amount: 155, description: 'Keyboards, paper & pens for fleet office', paymentMethod: 'Cash', createdBy: 'Aisha Bello' },
]

export const monthlyCosts = [
  { month: 'Jan', maintenance: 4200, repair: 2800, fuel: 6100 },
  { month: 'Feb', maintenance: 3800, repair: 3400, fuel: 5800 },
  { month: 'Mar', maintenance: 5100, repair: 2100, fuel: 6400 },
  { month: 'Apr', maintenance: 4600, repair: 3900, fuel: 6000 },
  { month: 'May', maintenance: 5400, repair: 4200, fuel: 6700 },
  { month: 'Jun', maintenance: 4900, repair: 3100, fuel: 6300 },
]

export const departmentExpenses = [
  { name: 'Logistics', value: 18400 },
  { name: 'Field Service', value: 12600 },
  { name: 'Operations', value: 9800 },
  { name: 'Executive', value: 4200 },
]

export const topParts = [
  { name: 'Engine Oil', used: 320 },
  { name: 'Brake Pads', used: 188 },
  { name: 'Oil Filter', used: 142 },
  { name: 'Coolant', used: 120 },
  { name: 'Air Filter', used: 96 },
]

export const inventoryTrend = [
  { month: 'Jan', stockIn: 420, stockOut: 380 },
  { month: 'Feb', stockIn: 360, stockOut: 410 },
  { month: 'Mar', stockIn: 480, stockOut: 360 },
  { month: 'Apr', stockIn: 400, stockOut: 440 },
  { month: 'May', stockIn: 520, stockOut: 470 },
  { month: 'Jun', stockIn: 380, stockOut: 420 },
]

export type Activity = {
  id: string
  type: 'Maintenance' | 'Repair' | 'Inventory' | 'Vehicle' | 'User'
  text: string
  user: string
  time: string
}

export const activities: Activity[] = [
  { id: 'a1', type: 'Maintenance', text: 'Started 90k service on Mercedes Sprinter', user: 'Daniel Okoro', time: '12m ago' },
  { id: 'a2', type: 'Repair', text: 'Updated suspension repair RPR-2210 to In Progress', user: 'Daniel Okoro', time: '48m ago' },
  { id: 'a3', type: 'Inventory', text: 'Stock out: 6 Brake Pads Set for VH-1044', user: 'System', time: '1h ago' },
  { id: 'a4', type: 'Vehicle', text: 'Added Tesla Model Y to the Executive fleet', user: 'Priya Nair', time: '3h ago' },
  { id: 'a5', type: 'User', text: 'Aisha Bello signed in', user: 'Aisha Bello', time: '5h ago' },
  { id: 'a6', type: 'Inventory', text: 'Low stock alert: Spark Plug below minimum level', user: 'System', time: '6h ago' },
]

export type Notification = {
  id: string
  category: 'Maintenance Due' | 'Registration Expiry' | 'Insurance Expiry' | 'Low Inventory' | 'Critical Repair'
  title: string
  detail: string
  severity: 'info' | 'warning' | 'critical'
  time: string
  read: boolean
  vehicleId?: string
}

export const notifications: Notification[] = [
  { id: 'n1', category: 'Critical Repair', title: 'Critical repair in progress', detail: 'Toyota Hilux suspension repair flagged high priority.', severity: 'critical', time: '12m ago', read: false },
  { id: 'n2', category: 'Low Inventory', title: 'Spark Plug below minimum', detail: '6 in stock, minimum is 24.', severity: 'warning', time: '6h ago', read: false },
  { id: 'n3', category: 'Insurance Expiry', title: 'Insurance expiring soon', detail: 'Scania R450 insurance expires 2025-11-28.', severity: 'warning', time: '1d ago', read: false },
  { id: 'n4', category: 'Maintenance Due', title: 'Maintenance due', detail: 'Tesla Model Y tire rotation scheduled 2025-07-02.', severity: 'info', time: '1d ago', read: true },
  { id: 'n5', category: 'Registration Expiry', title: 'Registration renewal', detail: 'Toyota Hilux registration expires 2026-03-14.', severity: 'info', time: '2d ago', read: true },
]

export type SystemUser = {
  id: string
  name: string
  username: string
  email?: string
  role: 'Admin' | 'User'
  department: string
  status: 'Active' | 'Suspended'
  lastActive: string
}

export const systemUsers: SystemUser[] = [
  { id: 'U-01', name: 'Daniel Okoro', username: 'daniel.okoro', email: 'daniel.okoro@fleetcore.io', role: 'Admin', department: 'Operations', status: 'Active', lastActive: '2m ago' },
  { id: 'U-02', name: 'Priya Nair', username: 'priya.nair', email: 'priya.nair@fleetcore.io', role: 'User', department: 'Finance', status: 'Active', lastActive: '3h ago' },
  { id: 'U-03', name: 'Marcus Reed', username: 'marcus.reed', email: 'marcus.reed@fleetcore.io', role: 'User', department: 'Logistics', status: 'Active', lastActive: '1d ago' },
  { id: 'U-04', name: 'Aisha Bello', username: 'aisha.bello', email: 'aisha.bello@fleetcore.io', role: 'User', department: 'Field Service', status: 'Active', lastActive: '5h ago' },
  { id: 'U-05', name: 'Tomas Vance', username: 'tomas.vance', email: 'tomas.vance@fleetcore.io', role: 'Admin', department: 'Maintenance', status: 'Suspended', lastActive: '12d ago' },
]

export type FleetDocument = {
  id: string
  name: string
  type: 'Registration' | 'Insurance' | 'Maintenance Invoice' | 'Repair Invoice' | 'Purchase Invoice' | 'Vehicle Image'
  vehicle: string
  size: string
  uploadedBy: string
  date: string
}

export const documents: FleetDocument[] = [
  { id: 'D-01', name: 'VH-1042_Registration.pdf', type: 'Registration', vehicle: 'Volvo FH16', size: '1.2 MB', uploadedBy: 'Daniel Okoro', date: '2025-03-12' },
  { id: 'D-02', name: 'VH-1046_Insurance_2026.pdf', type: 'Insurance', vehicle: 'Tesla Model Y', size: '880 KB', uploadedBy: 'Priya Nair', date: '2025-04-01' },
  { id: 'D-03', name: 'MNT-3300_Invoice.pdf', type: 'Maintenance Invoice', vehicle: 'Volvo FH16', size: '430 KB', uploadedBy: 'Tomas Vance', date: '2025-05-21' },
  { id: 'D-04', name: 'RPR-2209_Invoice.pdf', type: 'Repair Invoice', vehicle: 'Volvo FH16', size: '512 KB', uploadedBy: 'Tomas Vance', date: '2025-05-19' },
  { id: 'D-05', name: 'PO-8841_TireWorld.pdf', type: 'Purchase Invoice', vehicle: '—', size: '290 KB', uploadedBy: 'Daniel Okoro', date: '2025-05-28' },
  { id: 'D-06', name: 'VH-1044_front.jpg', type: 'Vehicle Image', vehicle: 'Toyota Hilux', size: '2.4 MB', uploadedBy: 'Aisha Bello', date: '2025-06-05' },
]

export type AuditLog = {
  id: string
  action: string
  entity: string
  user: string
  role: string
  timestamp: string
  type: 'Create' | 'Update' | 'Delete' | 'Login' | 'Export'
}

export const auditLogs: AuditLog[] = [
  { id: 'L-1001', action: 'Updated repair status to In Progress', entity: 'RPR-2210', user: 'Daniel Okoro', role: 'Admin', timestamp: '2025-06-12 09:42', type: 'Update' },
  { id: 'L-1000', action: 'Created maintenance record', entity: 'MNT-3301', user: 'Daniel Okoro', role: 'Admin', timestamp: '2025-06-08 14:10', type: 'Create' },
  { id: 'L-0999', action: 'Stock deduction (6 units)', entity: 'INV-004', user: 'System', role: 'System', timestamp: '2025-06-05 11:25', type: 'Update' },
  { id: 'L-0998', action: 'Added vehicle to fleet', entity: 'VH-1046', user: 'Priya Nair', role: 'Viewer', timestamp: '2025-06-01 08:03', type: 'Create' },
  { id: 'L-0997', action: 'Exported expense report (PDF)', entity: 'Expense Report', user: 'Priya Nair', role: 'Viewer', timestamp: '2025-05-30 16:48', type: 'Export' },
  { id: 'L-0996', action: 'Signed in', entity: 'Session', user: 'Aisha Bello', role: 'Viewer', timestamp: '2025-05-30 07:55', type: 'Login' },
  { id: 'L-0995', action: 'Deleted draft expense', entity: 'EXP-4990', user: 'Daniel Okoro', role: 'Admin', timestamp: '2025-05-29 13:20', type: 'Delete' },
]

// helpers
export const currency = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

export const sumItems = (
  items: { quantity: number; unitPrice?: number; unitCost?: number }[],
) =>
  items.reduce(
    (acc, i) => acc + i.quantity * (i.unitPrice ?? i.unitCost ?? 0),
    0,
  )
