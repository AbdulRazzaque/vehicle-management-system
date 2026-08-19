import type { Vehicle, InventoryItem, Repair, Maintenance, Notification } from '@/lib/data'

export function getLiveNotifications(
  vehicles: Vehicle[],
  inventory: InventoryItem[],
  repairs: Repair[],
  maintenance: Maintenance[]
): Notification[] {
  const list: Notification[] = []
  const today = new Date()
  
  // Set time of today to 00:00:00 to compare purely by date
  today.setHours(0, 0, 0, 0)
  
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  // 1. Critical Repairs
  repairs.forEach((r) => {
    if (r.priority === 'Critical' && r.status !== 'Completed') {
      list.push({
        id: `r-${r.id}`,
        category: 'Critical Repair',
        title: 'Critical repair in progress',
        detail: `${r.vehicleName || 'Vehicle'} suspension/engine repair flagged high priority (${r.type}).`,
        severity: 'critical',
        time: r.date || 'Just now',
        read: false,
      })
    }
  })

  // 2. Low Inventory
  inventory.forEach((i) => {
    if (i.stock < i.minStock) {
      list.push({
        id: `inv-${i.id}`,
        category: 'Low Inventory',
        title: `${i.name} below minimum threshold`,
        detail: `${i.stock} ${i.unit || 'units'} in stock, minimum required is ${i.minStock}.`,
        severity: 'warning',
        time: 'Just now',
        read: false,
      })
    }
  })

  // 3. Vehicles Insurance Expiry
  vehicles.forEach((v) => {
    if (v.insuranceExpiry) {
      const exp = new Date(v.insuranceExpiry)
      if (exp > today && exp <= thirtyDaysFromNow) {
        list.push({
          id: `ins-${v.id}`,
          category: 'Insurance Expiry',
          title: 'Insurance expiring soon',
          detail: `${v.name} (${v.plateNumber}) insurance expires on ${v.insuranceExpiry}.`,
          severity: 'warning',
          time: 'Expiry coming up',
          read: false,
        })
      } else if (exp <= today) {
        list.push({
          id: `ins-exp-${v.id}`,
          category: 'Insurance Expiry',
          title: 'Insurance EXPIRED',
          detail: `${v.name} (${v.plateNumber}) insurance expired on ${v.insuranceExpiry}!`,
          severity: 'critical',
          time: 'Expired',
          read: false,
        })
      }
    }

    // 4. Vehicles Registration Expiry
    if (v.registrationExpiry) {
      const exp = new Date(v.registrationExpiry)
      if (exp > today && exp <= thirtyDaysFromNow) {
        list.push({
          id: `reg-${v.id}`,
          category: 'Registration Expiry',
          title: 'Registration renewal due',
          detail: `${v.name} (${v.plateNumber}) registration expires on ${v.registrationExpiry}.`,
          severity: 'info',
          time: 'Expiry coming up',
          read: false,
        })
      } else if (exp <= today) {
        list.push({
          id: `reg-exp-${v.id}`,
          category: 'Registration Expiry',
          title: 'Registration EXPIRED',
          detail: `${v.name} (${v.plateNumber}) registration expired on ${v.registrationExpiry}!`,
          severity: 'critical',
          time: 'Expired',
          read: false,
        })
      }
    }
  })

  // 5. Maintenance Due
  maintenance.forEach((m) => {
    if (m.status === 'Scheduled') {
      list.push({
        id: `mnt-${m.id}`,
        category: 'Maintenance Due',
        title: 'Scheduled maintenance pending',
        detail: `${m.vehicleName || 'Vehicle'} maintenance (${m.type}) scheduled for ${m.date}.`,
        severity: 'info',
        time: m.date || 'Scheduled',
        read: false,
      })
    }
  })

  return list
}
