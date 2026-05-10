import { isSupabaseConfigured, useSupabase } from '@/hooks/use-supabase'
import { DEFAULT_CURRENCY, isSupportedCurrency } from '@/constants/currencies'
import { useAuth } from '@clerk/expo'
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'

type PreferencesContextValue = {
    displayCurrency: string
    loading: boolean
    error: string | null
    setDisplayCurrency: (code: string) => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const supabase = useSupabase()
    const { userId, isLoaded } = useAuth()
    const configured = isSupabaseConfigured()

    const [displayCurrency, setDisplayCurrencyState] = useState<string>(DEFAULT_CURRENCY)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const ensureRow = useCallback(async () => {
        if (!supabase || !userId) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        const { data, error: selectError } = await supabase
            .from('user_settings')
            .select('display_currency')
            .eq('user_id', userId)
            .maybeSingle()

        if (selectError) {
            setError(selectError.message)
            setLoading(false)
            return
        }

        if (data?.display_currency) {
            setDisplayCurrencyState(data.display_currency)
            setLoading(false)
            return
        }

        const { error: insertError } = await supabase
            .from('user_settings')
            .insert({ user_id: userId, display_currency: DEFAULT_CURRENCY })

        if (insertError && insertError.code !== '23505') {
            setError(insertError.message)
        } else {
            setDisplayCurrencyState(DEFAULT_CURRENCY)
        }
        setLoading(false)
    }, [supabase, userId])

    useEffect(() => {
        if (!isLoaded) return
        if (!configured || !userId) {
            setLoading(false)
            return
        }
        void ensureRow()
    }, [isLoaded, configured, userId, ensureRow])

    const setDisplayCurrency = useCallback(
        async (code: string) => {
            if (!isSupportedCurrency(code)) {
                throw new Error(`Unsupported currency: ${code}`)
            }
            if (!supabase || !userId) {
                throw new Error('Sign in required.')
            }

            const previous = displayCurrency
            setDisplayCurrencyState(code)
            setError(null)

            const { error: upsertError } = await supabase
                .from('user_settings')
                .upsert(
                    { user_id: userId, display_currency: code },
                    { onConflict: 'user_id' }
                )

            if (upsertError) {
                setDisplayCurrencyState(previous)
                setError(upsertError.message)
                throw upsertError
            }
        },
        [supabase, userId, displayCurrency]
    )

    const value = useMemo(
        () => ({ displayCurrency, loading, error, setDisplayCurrency }),
        [displayCurrency, loading, error, setDisplayCurrency]
    )

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    )
}

export function usePreferences(): PreferencesContextValue {
    const ctx = useContext(PreferencesContext)
    if (!ctx) {
        throw new Error('usePreferences must be used within PreferencesProvider.')
    }
    return ctx
}
