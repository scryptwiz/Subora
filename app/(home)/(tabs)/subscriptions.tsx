import { SubscriptionsSkeleton } from "@/components/skeletons/subscriptions-skeleton";
import AddSubscriptionBtn from "@/components/subscriptions/AddSubscriptionBtn";
import EmptySubsState from "@/components/subscriptions/empty-subs-state";
import FilterPill, { Filter } from "@/components/subscriptions/FilterPill";
import { PeriodPill } from "@/components/subscriptions/PeriodPill";
import { SwipeableSubscriptionRow } from "@/components/subscriptions/swipeable-subscription-row";
import { usePreferences } from "@/contexts/preferences-context";
import { useSubscriptions } from "@/contexts/subscriptions-context";
import { useConvertedSpendTotals } from "@/hooks/use-converted-totals";
import {
  servicesSpendHeadline,
  type ServicesSpendPeriod,
} from "@/lib/services-spend-headline";
import { Subscription } from "@/lib/subscriptions";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface FilterOption {
  id: Filter;
  label: string;
}

export const FILTERS: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
];

export default function SubscriptionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    subscriptions: subs,
    loading,
    error,
    setSubscriptionActive,
    deleteSubscription,
  } = useSubscriptions();
  const { loading: prefsLoading, displayCurrency } = usePreferences();
  const converted = useConvertedSpendTotals();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [spendPeriod, setSpendPeriod] = useState<ServicesSpendPeriod>("all");

  const initializing = loading || prefsLoading || !converted.fxAttempted;

  const spendHeadline = useMemo(
    () =>
      servicesSpendHeadline(
        subs,
        spendPeriod,
        displayCurrency,
        converted.snapshot,
        new Date(),
      ),
    [subs, spendPeriod, displayCurrency, converted.snapshot],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subs.filter((s) => {
      if (spendPeriod !== "all" && s.billingCycle !== spendPeriod) return false;
      if (filter === "active" && !s.active) return false;
      if (filter === "paused" && s.active) return false;
      if (
        q &&
        !s.name.toLowerCase().includes(q) &&
        !(s.plan ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [subs, spendPeriod, filter, query]);

  const emptyReason = useMemo(() => {
    if (filtered.length > 0) return null;
    if (query.trim().length > 0) return "search" as const;
    if (subs.length === 0) return "none" as const;
    if (
      spendPeriod !== "all" &&
      !subs.some((s) => s.billingCycle === spendPeriod)
    )
      return "billing" as const;
    return "status" as const;
  }, [filtered.length, query, subs, spendPeriod]);

  const handleToggle = async (id: string, next: boolean) => {
    try {
      await setSubscriptionActive(id, next);
    } catch {}
  };

  const handleDelete = (sub: Subscription, cancel: () => void) => {
    Alert.alert(
      `Delete ${sub.name}?`,
      "This will remove the subscription from your tracker. This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: cancel,
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSubscription(sub.id);
            } catch (e) {
              const message =
                e instanceof Error ? e.message : "Could not delete.";
              Alert.alert("Delete failed", message);
              cancel();
            }
          },
        },
      ],
      { onDismiss: cancel },
    );
  };

  const handleEdit = (sub: Subscription) => {
    router.push({
      pathname: "/(home)/add-subscription",
      params: { id: sub.id },
    });
  };

  if (initializing) {
    return <SubscriptionsSkeleton />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        {/* header row */}
        <View style={styles.headerRow}>
          {/* Amount */}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerLabel}>Services</Text>
            <Text style={styles.headerAmount}>
              {spendHeadline.amount}
              <Text style={styles.headerAmountSuffix}>
                {" "}
                {spendHeadline.suffix}
              </Text>
            </Text>
          </View>

          {/* Add sub button */}
          <AddSubscriptionBtn />
        </View>

        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={18}
            color={getNativeDefault("secondaryText")}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search service..."
            placeholderTextColor={getNativeDefault("secondaryText")}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable hitSlop={8} onPress={() => setQuery("")}>
              <Feather
                name="x"
                size={18}
                color={getNativeDefault("secondaryText")}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <FilterPill
              active={filter}
              options={FILTERS}
              onFilter={setFilter}
            />
          </View>
          <View style={{ flexShrink: 0 }}>
            <PeriodPill
              value={spendPeriod}
              onChange={setSpendPeriod}
              options={["month", "year", "all"]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 40,
          gap: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {filtered.length === 0 ? (
          <EmptySubsState
            onAdd={() => router.push("/(home)/NewSubscription")}
            reason={emptyReason!}
            billingPeriod={spendPeriod}
          />
        ) : (
          filtered.map((sub) => (
            <SwipeableSubscriptionRow
              key={sub.id}
              subscription={sub}
              onPress={() => handleEdit(sub)}
              onToggleActive={(next) => void handleToggle(sub.id, next)}
              onDelete={(cancel) => handleDelete(sub, cancel)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getNativeDefault("background"),
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLabel: {
    ...Typography.caption,
    color: getNativeDefault("secondaryText"),
  },
  headerAmount: {
    ...Typography.titleBold,
    color: getNativeDefault("text"),
  },
  headerAmountSuffix: {
    ...Typography.small,
    color: getNativeDefault("secondaryText"),
  },
  searchBar: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  searchInput: {
    flex: 1,
    ...Typography.input,
    color: getNativeDefault("text"),
  },
  error: {
    borderRadius: 16,
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Typography.small,
    color: "rgba(252, 165, 165, 1)",
  },
  filterContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  filterRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minWidth: 0,
  },
});
