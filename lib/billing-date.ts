/**
 * Convert a calendar date to a stable ISO timestamp anchored at noon UTC.
 * Anchoring at noon UTC keeps the calendar day intact across timezones,
 * so a "May 10" pick stays "May 10" wherever it's read.
 */
export function dateToBillingIso(date: Date): string {
    const utcNoon = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0, 0
    ))
    return utcNoon.toISOString()
}

/** Friendly label for a calendar date (uses local timezone). */
export function formatBillingDate(date: Date): string {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)

    const oneDay = 1000 * 60 * 60 * 24
    const diff = Math.round((target.getTime() - today.getTime()) / oneDay)

    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    if (diff === -1) return 'Yesterday'

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: target.getFullYear() === today.getFullYear() ? undefined : 'numeric',
    }).format(date)
}
