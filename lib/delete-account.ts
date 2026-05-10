import type { SupabaseClient } from '@supabase/supabase-js'

/** Minimal shape we need from a Clerk `UserResource`. */
type DeletableUser = {
    delete: () => Promise<unknown>
}

/**
 * Permanently erases a user's footprint:
 *   1. their rows in Supabase (subscriptions, user_settings)
 *   2. their Clerk identity itself
 *
 * Order matters. Supabase data is removed FIRST while the Clerk session token
 * is still valid (RLS scopes the deletes to the calling user's `sub`). Only
 * after that succeeds do we ask Clerk to remove the user — once Clerk is gone
 * the access token is invalid and we'd lose the ability to clean Supabase.
 *
 * GDPR right-to-erasure: this is a hard delete, not a soft delete. The caller
 * is responsible for confirming intent before invoking this.
 */
export async function deleteAccount(args: {
    supabase: SupabaseClient | null
    user: DeletableUser | null | undefined
    userId: string | null | undefined
}): Promise<void> {
    const { supabase, user, userId } = args

    if (!user) throw new Error('You are not signed in.')
    if (!supabase || !userId) {
        throw new Error('Storage is not configured. Cannot remove your data safely.')
    }

    const { error: subsError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId)
    if (subsError) {
        throw new Error(`Could not delete subscriptions: ${subsError.message}`)
    }

    const { error: settingsError } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', userId)
    if (settingsError) {
        throw new Error(`Could not delete settings: ${settingsError.message}`)
    }

    await user.delete()
}
