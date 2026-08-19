import { dbConnect } from './db/connect'
import { VehicleModel } from '@/models/Vehicle'
import { NotificationModel } from '@/models/Notification'
import { getTwoMonthsPriorDate } from './date-utils'

/**
 * Backend scheduled job function to check vehicle registration expiries
 * and automatically insert reminder notifications into MongoDB 2 calendar months prior.
 */
export async function checkAndGenerateRegistrationExpiryNotifications() {
  try {
    await dbConnect()
    const vehicles = await VehicleModel.find({ registrationExpiry: { $ne: '' } }).lean()

    const todayStr = new Date().toISOString().split('T')[0]

    for (const vehicle of vehicles) {
      if (!vehicle.registrationExpiry) continue

      const reminderDateStr = getTwoMonthsPriorDate(vehicle.registrationExpiry)
      if (!reminderDateStr) continue

      // Trigger if today is on or after the 2-month reminder date
      if (todayStr >= reminderDateStr) {
        const notificationId = `reg-reminder-${vehicle.id}-${vehicle.registrationExpiry}`

        // Ensure reminder is only sent ONCE for the same vehicle & expiry date
        const existing = await NotificationModel.findOne({ id: notificationId }).lean()
        if (!existing) {
          const vehicleDisplayName = vehicle.name || vehicle.plateNumber || vehicle.registrationNumber || vehicle.id
          await NotificationModel.create({
            id: notificationId,
            category: 'Registration Expiry',
            title: 'Registration Expiry Reminder',
            detail: `The registration for ${vehicleDisplayName} will expire on ${vehicle.registrationExpiry}. Please renew the registration before the expiry date.`,
            severity: 'info',
            time: 'Renewal due soon',
            read: false,
            dismissed: false,
            vehicleId: vehicle.id,
            registrationExpiry: vehicle.registrationExpiry,
          })
        }
      }
    }
  } catch (error) {
    console.error('Error checking registration expiries on backend:', error)
  }
}

/**
 * Automatically dismisses any active registration expiry notifications for a vehicle
 * after its registration/expiry details have been updated.
 */
export async function dismissVehicleRegistrationNotifications(vehicleId: string) {
  try {
    await dbConnect()
    await NotificationModel.updateMany(
      { vehicleId, category: 'Registration Expiry' },
      { $set: { dismissed: true, read: true } }
    )
  } catch (error) {
    console.error('Error dismissing registration notifications:', error)
  }
}
