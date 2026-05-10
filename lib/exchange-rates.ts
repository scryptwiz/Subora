/**
 * Daily exchange rates from open.er-api.com (https://www.exchangerate-api.com/docs/free).
 * Public, no API key, daily rates covering ~160 currencies including NGN — fine for
 * "approximate budgeting" display in a subscription tracker. Not for money movement.
 *
 * Cache strategy: simple in-memory map keyed by base currency, 24h TTL.
 * Lives only for the lifetime of the JS context.
 */

export type RateMap = Record<string, number>

export type RatesSnapshot = {
    base: string
    rates: RateMap
    fetchedAt: number
}

const TTL_MS = 24 * 60 * 60 * 1000

const cache = new Map<string, RatesSnapshot>()
const inflight = new Map<string, Promise<RatesSnapshot>>()

function isFresh(snapshot: RatesSnapshot): boolean {
    return Date.now() - snapshot.fetchedAt < TTL_MS
}

async function fetchSnapshot(base: string): Promise<RatesSnapshot> {
    const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Rates fetch failed (${res.status})`)
    const json = (await res.json()) as {
        result?: string
        base_code?: string
        rates?: RateMap
        ['error-type']?: string
    }
    if (json.result !== 'success' || !json.rates) {
        throw new Error(json['error-type'] ?? 'Malformed rates response')
    }
    const rates = { ...json.rates, [base]: 1 }
    return { base, rates, fetchedAt: Date.now() }
}

/** Get a (possibly cached) rates snapshot keyed by `base`. */
export async function getRates(base: string): Promise<RatesSnapshot> {
    const upper = base.toUpperCase()
    const cached = cache.get(upper)
    if (cached && isFresh(cached)) return cached

    const existing = inflight.get(upper)
    if (existing) return existing

    const promise = fetchSnapshot(upper)
        .then(snap => {
            cache.set(upper, snap)
            return snap
        })
        .finally(() => {
            inflight.delete(upper)
        })

    inflight.set(upper, promise)
    return promise
}

/**
 * Convert `amount` from `from` currency into `to` currency using a rates
 * snapshot whose `base === to`. If the source currency isn't in the snapshot,
 * return null so callers can decide how to fall back.
 */
export function convertAmount(
    amount: number,
    from: string,
    to: string,
    snapshot: RatesSnapshot | null
): number | null {
    const f = from.toUpperCase()
    const t = to.toUpperCase()
    if (f === t) return amount
    if (!snapshot) return null
    if (snapshot.base.toUpperCase() !== t) return null

    const rateFromBaseToFrom = snapshot.rates[f]
    if (typeof rateFromBaseToFrom !== 'number' || rateFromBaseToFrom === 0) {
        return null
    }
    return amount / rateFromBaseToFrom
}
