import { ServicesSpendPeriod } from "@/lib/services-spend-headline";
import { getNativeDefault } from "@/theme/colors";
import { FontFamilies } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { LargeAddSubscriptionBtn } from "./AddSubscriptionBtn";

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
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather
          name={reason === "search" ? "search" : "inbox"}
          size={22}
          color={getNativeDefault("secondaryText")}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {showAdd ? <LargeAddSubscriptionBtn onAdd={onAdd} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 64,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 20,
    textAlign: "center",
    fontFamily: FontFamilies.bold,
    fontSize: 18,
    color: getNativeDefault("text"),
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: FontFamilies.regular,
    fontSize: 14,
    color: getNativeDefault("secondaryText"),
  },
});
