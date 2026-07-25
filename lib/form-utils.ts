export function nextId(prefix: string, existingIds: string[]): string {
  const numbers = existingIds
    .filter((id) => id.startsWith(`${prefix}-`))
    .map((id) => parseInt(id.slice(prefix.length + 1), 10))
    .filter((n) => !Number.isNaN(n))

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1
  return `${prefix}-${String(next).padStart(numbers.some((n) => n >= 1000) ? 4 : 2, '0')}`
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
