/**
 * Calculates 2 calendar months prior to a given YYYY-MM-DD date string.
 * Accurately handles month-end dates (e.g., 29th, 30th, 31st).
 *
 * Example:
 *   "2026-08-20" -> "2026-06-20"
 *   "2026-10-31" -> "2026-08-31"
 *   "2026-04-30" -> "2026-02-28" (or 29 on leap year)
 */
export function getTwoMonthsPriorDate(expiryDateStr: string): string {
  if (!expiryDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDateStr)) {
    return ''
  }
  const parts = expiryDateStr.split('-')
  let year = parseInt(parts[0], 10)
  let month = parseInt(parts[1], 10) // 1-indexed (1..12)
  const day = parseInt(parts[2], 10)

  // Subtract 2 calendar months
  month -= 2
  if (month <= 0) {
    month += 12
    year -= 1
  }

  // Find maximum days in target month (year, month)
  // Date(year, month, 0) gives the last day of target month
  const maxDaysInTargetMonth = new Date(year, month, 0).getDate()
  const targetDay = Math.min(day, maxDaysInTargetMonth)

  const formattedMonth = String(month).padStart(2, '0')
  const formattedDay = String(targetDay).padStart(2, '0')

  return `${year}-${formattedMonth}-${formattedDay}`
}
