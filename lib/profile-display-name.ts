/** App-chosen display handle (Clerk `user.update({ username })` only works if Username is enabled in Dashboard). */
export const PREFERRED_USERNAME_METADATA_KEY = 'preferredUsername'

export function preferredUsernameFromUnsafeMetadata(meta: unknown): string {
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return ''
    const raw = (meta as Record<string, unknown>)[PREFERRED_USERNAME_METADATA_KEY]
    return typeof raw === 'string' ? raw.trim() : ''
}

export function mergePreferredUsernameIntoUnsafeMetadata(
    existing: unknown,
    preferredUsername: string
): Record<string, unknown> {
    const base =
        existing && typeof existing === 'object' && !Array.isArray(existing)
            ? { ...(existing as Record<string, unknown>) }
            : {}
    base[PREFERRED_USERNAME_METADATA_KEY] = preferredUsername
    return base
}

/** Shown name: preferredUsername (unsafeMetadata), else Clerk username, else first name, else fallback. */
export function profileDisplayName(
    user: {
        unsafeMetadata?: unknown
        username?: string | null
        firstName?: string | null
    } | null | undefined,
    fallback = 'User name'
): string {
    const p = preferredUsernameFromUnsafeMetadata(user?.unsafeMetadata)
    if (p) return p
    const u = user?.username?.trim()
    if (u) return u
    const f = user?.firstName?.trim()
    if (f) return f
    return fallback
}
