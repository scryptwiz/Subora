import NotificationBellBtn from "@/components/NotificationBellBtn";
import { SwipeableSubscriptionRow } from "@/components/subscriptions/swipeable-subscription-row";
import { usePreferences } from "@/contexts/preferences-context";
import { useSubscriptions } from "@/contexts/subscriptions-context";
import { useConvertedSpendTotals } from "@/hooks/use-converted-totals";
import { profileDisplayName } from "@/lib/profile-display-name";
import { formatSpendLabelForPeriod } from "@/lib/spend-by-period";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollRevealTopChrome } from "../../../components/scroll-reveal-top-chrome";
import { DashboardSkeleton } from "../../../components/skeletons/dashboard-skeleton";
import { StatCard } from "../../../components/subscriptions/stat-card";
import { type Subscription } from "../../../lib/subscriptions";

const TODAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const {
    subscriptions: subs,
    loading: subsLoading,
    error,
    deleteSubscription,
  } = useSubscriptions();
  const { displayCurrency, loading: prefsLoading } = usePreferences();
  const converted = useConvertedSpendTotals();
  const initializing = subsLoading || prefsLoading || !converted.fxAttempted;
  const scrollY = useRef(new Animated.Value(0)).current;

  const todayLabel = useMemo(() => TODAY_FORMATTER.format(new Date()), []);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
    },
  );

  const monthSpend = useMemo(() => {
    const now = new Date();
    return formatSpendLabelForPeriod(
      subs,
      "month",
      displayCurrency,
      converted.snapshot,
      now,
    );
  }, [subs, displayCurrency, converted.snapshot]);

  const yearSpend = useMemo(() => {
    const now = new Date();
    return formatSpendLabelForPeriod(
      subs,
      "year",
      displayCurrency,
      converted.snapshot,
      now,
    );
  }, [subs, displayCurrency, converted.snapshot]);

  const upcoming = useMemo(
    () =>
      [...subs]
        .filter((s) => s.active)
        .sort(
          (a, b) =>
            new Date(a.nextRenewal).getTime() -
            new Date(b.nextRenewal).getTime(),
        )
        .slice(0, 5),
    [subs],
  );

  const activeCount = subs.filter((s) => s.active).length;

  const greeting = profileDisplayName(user, "there");

  const handleDelete = (sub: Subscription) => {
    Alert.alert(
      `Delete ${sub.name}?`,
      "This will remove the subscription from your tracker. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
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
            }
          },
        },
      ],
    );
  };

  const handleEdit = (sub: Subscription) => {
    router.push({
      pathname: "/(home)/add-subscription",
      params: { id: sub.id },
    });
  };

  if (initializing) {
    return <DashboardSkeleton />;
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 126,
          gap: 24,
        }}
        scrollEventThrottle={16}
        onScroll={onScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.todayLabel}>{todayLabel}</Text>
            <Text style={styles.greetingText}>Hi, {greeting}</Text>
          </View>
          <NotificationBellBtn />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>This month</Text>
          <View style={styles.cardSpendRow}>
            <Text style={styles.cardSpendText}>{monthSpend}</Text>
            <Text style={styles.cardSpendPeriod}>/mo</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="Active"
            value={String(activeCount)}
            caption="services"
          />
          <StatCard label="Per year" value={yearSpend} caption="at this pace" />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <Link href="/(home)/(tabs)/subscriptions" asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.showAllText}>Show all</Text>
              </Pressable>
            </Link>
          </View>
          <View style={styles.upcomingList}>
            {upcoming.length === 0 ? (
              <Text style={styles.emptyText}>
                No upcoming renewals. Add a subscription to see it here.
              </Text>
            ) : (
              upcoming.map((sub) => (
                <SwipeableSubscriptionRow
                  key={sub.id}
                  subscription={sub}
                  variant="history"
                  onPress={() => handleEdit(sub)}
                  onDelete={() => handleDelete(sub)}
                />
              ))
            )}
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/(home)/NewSubscription")}
          style={styles.addButton}
        >
          <Feather
            name="plus"
            size={18}
            color={getNativeDefault("secondaryText")}
          />
          <Text style={styles.addButtonText}>Add a subscription</Text>
        </Pressable>
      </Animated.ScrollView>

      <ScrollRevealTopChrome scrollY={scrollY} topInset={insets.top} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getNativeDefault("background"),
  },
  scrollView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextContainer: {
    minWidth: 0,
    flex: 1,
  },
  todayLabel: {
    ...Typography.caption,
    color: getNativeDefault("secondaryText"),
  },
  greetingText: {
    marginTop: 4,
    ...Typography.titleBold,
    color: getNativeDefault("text"),
  },
  errorText: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
    color: "#FCA5A5",
  },
  mainCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    padding: 20,
  },
  cardLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    lineHeight: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: getNativeDefault("secondaryText"),
  },
  cardSpendRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  cardSpendText: {
    ...Typography.h1Bold,
    color: getNativeDefault("text"),
  },
  cardSpendPeriod: {
    ...Typography.subheadingMedium,
    color: getNativeDefault("secondaryText"),
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    ...Typography.subheadingBold,
    color: getNativeDefault("text"),
  },
  showAllText: {
    ...Typography.smallMedium,
    color: getNativeDefault("secondaryText"),
  },
  upcomingList: {
    gap: 10,
  },
  emptyText: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 16,
    paddingVertical: 24,
    textAlign: "center",
    ...Typography.caption,
    color: getNativeDefault("secondaryText"),
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingVertical: 16,
  },
  addButtonText: {
    ...Typography.smallMedium,
    color: getNativeDefault("secondaryText"),
  },
});
