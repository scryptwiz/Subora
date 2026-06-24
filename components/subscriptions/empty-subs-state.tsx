import { ServicesSpendPeriod } from "@/lib/services-spend-headline";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type EmptyReason = "search" | "none" | "billing" | "status";
const BILLING_LABEL: Record<ServicesSpendPeriod, string> = {
  month: "monthly",
  year: "yearly",
  all: "all billing types",
};

export default function EmptySubsState({
  onAdd,
  reason,
  billingPeriod,
}: {
  onAdd: () => void;
  reason: EmptyReason;
  billingPeriod: ServicesSpendPeriod;
}) {
  const title =
    reason === "search"
      ? "No matches"
      : reason === "none"
        ? "No subscriptions yet"
        : reason === "billing"
          ? `No ${BILLING_LABEL[billingPeriod]} subscriptions`
          : "Nothing to show";

  const subtitle =
    reason === "search"
      ? "Try a different name or clear the search."
      : reason === "none"
        ? "Track every recurring charge in one place."
        : reason === "billing"
          ? `Switch period above or add a ${BILLING_LABEL[billingPeriod]} plan.`
          : "Try All, switch Active/Paused, or change the period above.";

  const showAdd =
    reason === "none" || reason === "billing" || reason === "status";

  return (
    <View className="mt-16 items-center px-6">
      <View className="h-16 w-16 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]">
        <Feather
          name={reason === "search" ? "search" : "inbox"}
          size={22}
          color="#52525B"
        />
      </View>
      <Text className="mt-5 text-center font-inter-bold text-lg text-white">
        {title}
      </Text>
      <Text className="mt-2 text-center font-inter text-sm text-neutral-500">
        {subtitle}
      </Text>
      {showAdd ? (
        <Pressable
          onPress={onAdd}
          className="mt-6 flex-row items-center gap-2 rounded-2xl bg-white px-5 py-3"
          style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
        >
          <Feather name="plus" size={16} color="#111111" />
          <Text className="font-inter-medium text-sm text-[#111111]">
            Add subscription
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
