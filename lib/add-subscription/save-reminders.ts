import type { SupabaseClient } from "@supabase/supabase-js";

export async function saveSubscriptionReminders(
  supabase: SupabaseClient,
  userId: string,
  subscriptionId: string,
  offsets: number[],
): Promise<void> {
  const unique = [...new Set(offsets)]
    .filter((v) => v >= 0 && v <= 30)
    .slice(0, 3);
  await supabase
    .from("subscription_reminders")
    .delete()
    .eq("subscription_id", subscriptionId)
    .eq("user_id", userId);
  if (!unique.length) return;
  const rows = unique.map((offset) => ({
    user_id: userId,
    subscription_id: subscriptionId,
    offset_days: offset,
  }));
  const { error } = await supabase.from("subscription_reminders").insert(rows);
  if (error) throw error;
}
