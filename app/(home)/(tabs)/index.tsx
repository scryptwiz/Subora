import NotificationBellBtn from "@/components/NotificationBellBtn";
import { usePreferences } from "@/contexts/preferences-context";
import { useSubscriptions } from "@/contexts/subscriptions-context";
import { useConvertedSpendTotals } from "@/hooks/use-converted-totals";
import { profileDisplayName } from "@/lib/profile-display-name";
import { formatSpendLabelForPeriod } from "@/lib/spend-by-period";
import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import { Alert, Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollRevealTopChrome } from "../../../components/scroll-reveal-top-chrome";
import { DashboardSkeleton } from "../../../components/skeletons/dashboard-skeleton";
import { StatCard } from "../../../components/subscriptions/stat-card";
import { SwipeableSubscriptionRow } from "../../../components/subscriptions/swipeable-subscription-row";
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
    <View className="flex-1 bg-[#111111]">
      <Animated.ScrollView
        className="flex-1"
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
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="font-inter text-sm text-neutral-500">
              {todayLabel}
            </Text>
            <Text className="mt-1 font-inter-bold text-2xl text-white">
              Hi, {greeting}
            </Text>
          </View>
          <NotificationBellBtn />
        </View>

        {error ? (
          <Text className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-inter text-sm text-red-300">
            {error}
          </Text>
        ) : null}

        <View className="rounded-3xl border border-[#1F1F22] bg-[#16161A] p-5">
          <Text className="font-inter text-xs uppercase tracking-wider text-neutral-500">
            This month
          </Text>
          <View className="mt-2 flex-row items-baseline gap-1">
            <Text className="font-inter-bold text-5xl text-white">
              {monthSpend}
            </Text>
            <Text className="font-inter-medium text-xl text-neutral-400">
              /mo
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <StatCard
            label="Active"
            value={String(activeCount)}
            caption="services"
          />
          <StatCard
            label="Per year"
            value={yearSpend}
            caption="at this pace"
            accent="highlight"
          />
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-bold text-lg text-white">Upcoming</Text>
            <Link href="/(home)/subscriptions" asChild>
              <Pressable hitSlop={8}>
                <Text className="font-inter-medium text-sm text-neutral-400">
                  Show all
                </Text>
              </Pressable>
            </Link>
          </View>
          <View className="gap-2.5">
            {upcoming.length === 0 ? (
              <Text className="rounded-2xl border border-[#1F1F22] bg-[#16161A] px-4 py-6 text-center font-inter text-sm text-neutral-500">
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
          onPress={() => router.push("/(home)/add-subscription")}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-[#3F3F46] bg-[#16161A] py-4"
          style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
        >
          <Feather name="plus" size={18} color="#A3A3A3" />
          <Text className="font-inter-medium text-sm text-neutral-400">
            Add a subscription
          </Text>
        </Pressable>
      </Animated.ScrollView>

      <ScrollRevealTopChrome scrollY={scrollY} topInset={insets.top} />
    </View>
  );
}
