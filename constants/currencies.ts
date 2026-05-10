export type CurrencyOption = {
    code: string
    label: string
    symbol: string
}

/** Small curated list. Add more if needed; FX coverage matches Frankfurter. */
export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
    { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
    { code: 'DKK', label: 'Danish Krone', symbol: 'kr' },
    { code: 'EUR', label: 'Euro', symbol: '€' },
    { code: 'GBP', label: 'British Pound', symbol: '£' },
    { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
    { code: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
    { code: 'NOK', label: 'Norwegian Krone', symbol: 'kr' },
    { code: 'SEK', label: 'Swedish Krona', symbol: 'kr' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
]

export const SUPPORTED_CURRENCY_CODES = SUPPORTED_CURRENCIES.map(c => c.code)

export const DEFAULT_CURRENCY = 'USD'

export function getCurrencyOption(code: string): CurrencyOption {
    return (
        SUPPORTED_CURRENCIES.find(c => c.code === code) ?? {
            code,
            label: code,
            symbol: code,
        }
    )
}

export function isSupportedCurrency(code: string): boolean {
    return SUPPORTED_CURRENCY_CODES.includes(code)
}

/** Narrow symbol for UI chips (falls back to table). */
export function formatCurrencySymbol(code: string): string {
    const upper = code.toUpperCase()
    try {
        const parts = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: upper,
            currencyDisplay: 'narrowSymbol',
        }).formatToParts(0)
        return parts.find(p => p.type === 'currency')?.value ?? getCurrencyOption(upper).symbol
    } catch {
        return getCurrencyOption(upper).symbol
    }
}
