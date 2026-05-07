/**
 * Logo URL helpers.
 *
 * For the demo we follow this fallback chain:
 *   1. simpleicons CDN (crisp coloured brand SVG) when an iconSlug is known
 *   2. Google's favicon API for any domain (best-effort)
 *   3. A first-letter avatar tile rendered in `SubscriptionLogo`
 *
 * For production, swap step 1/2 for Logo.dev or Brandfetch (both have free tiers
 * but require a token) — only the URLs in this file would need to change.
 */

const SIMPLE_ICONS_CDN = 'https://cdn.simpleicons.org'
const GOOGLE_FAVICON = 'https://www.google.com/s2/favicons'

/** Crisp coloured SVG icon for a known brand. Returns undefined when no slug. */
export function simpleIconUrl(slug?: string): string | undefined {
    if (!slug) return undefined
    return `${SIMPLE_ICONS_CDN}/${slug}`
}

/** Best-effort favicon for any domain. */
export function faviconUrl(domain?: string, size: 64 | 128 | 256 = 128): string | undefined {
    if (!domain) return undefined
    return `${GOOGLE_FAVICON}?domain=${encodeURIComponent(domain)}&sz=${size}`
}

/**
 * Return the most reliable list of URLs to attempt for a subscription, in
 * order. Consumers can hand this directly to `expo-image`'s source array.
 */
export function logoSources(opts: { iconSlug?: string; domain?: string }): { uri: string }[] {
    const sources: { uri: string }[] = []
    const simple = simpleIconUrl(opts.iconSlug)
    if (simple) sources.push({ uri: simple })
    const fav = faviconUrl(opts.domain, 128)
    if (fav) sources.push({ uri: fav })
    return sources
}

/** Deterministic background colour derived from a brand name (used for letter avatars). */
export function avatarColor(name: string): string {
    const palette = [
        '#3B82F6', // blue
        '#22C55E', // green
        '#F97316', // orange
        '#EAB308', // yellow
        '#EC4899', // pink
        '#8B5CF6', // violet
        '#06B6D4', // cyan
        '#EF4444', // red
        '#14B8A6', // teal
        '#A855F7', // purple
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) | 0
    }
    return palette[Math.abs(hash) % palette.length]
}

export function initials(name: string): string {
    const trimmed = name.trim()
    if (!trimmed) return '?'
    const parts = trimmed.split(/\s+/)
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
    return ((parts[0]![0] ?? '') + (parts[1]![0] ?? '')).toUpperCase()
}

/** Try to derive a clean domain from free-form user input ("Netflix" or "https://netflix.com/foo"). */
export function deriveDomain(input: string): string | undefined {
    const trimmed = input.trim().toLowerCase()
    if (!trimmed) return undefined
    try {
        const withScheme = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
        const url = new URL(withScheme)
        if (url.hostname.includes('.')) {
            return url.hostname.replace(/^www\./, '')
        }
    } catch {
        // fall through to the heuristic below
    }
    if (trimmed.includes('.') && !trimmed.includes(' ')) return trimmed.replace(/^www\./, '')
    return undefined
}
