/** Normalize user_settings.reminder_default_offsets: unique, sorted, 0–30, max 3; never empty. */
export function normalizeDefaultReminderOffsets(raw: unknown, legacySingleDay: number): number[] {
    const legacy = Math.min(30, Math.max(0, Math.round(Number(legacySingleDay)) || 1))
    if (Array.isArray(raw) && raw.length > 0) {
        const nums = raw
            .map(v => Math.min(30, Math.max(0, Math.round(Number(v)))))
            .filter(n => Number.isFinite(n))
        const unique = [...new Set(nums)].sort((a, b) => a - b).slice(0, 3)
        if (unique.length > 0) return unique
    }
    return [legacy]
}

/** Save path: user-picked offsets, unique sorted, max 3, each 0–30; default [1]. */
export function clampUserReminderOffsets(input: number[]): number[] {
    const u = [...new Set(input.map(n => Math.min(30, Math.max(0, Math.round(Number(n))))))]
        .filter(n => Number.isFinite(n))
        .sort((a, b) => a - b)
        .slice(0, 3)
    return u.length > 0 ? u : [1]
}
