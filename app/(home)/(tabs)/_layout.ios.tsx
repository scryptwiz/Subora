import { useNotificationPermission } from "@/contexts/notification-permission-context";
import { getNativeDefault } from "@/theme/colors";
import { Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs, useRouter } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE = getNativeDefault("text");
const INACTIVE = getNativeDefault("secondaryText");
const TAB_HEIGHT = 68;
const TAB_ICON_SIZE = 26;
const FAB_ICON_SIZE = Math.round(TAB_ICON_SIZE * 1.35);

const isGlassAvailable = isLiquidGlassAvailable();

/** ─── Liquid-Glass NativeTabs (iOS 26+) ─────────────────────────── */
function LiquidGlassTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label hidden>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label hidden>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create" role="search">
        <NativeTabs.Trigger.Label hidden>Create</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus.circle.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

/** ─── Classic custom tab bar (iOS < 26 / fallback) ──────────────── */
function ClassicTabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showEnableNotificationsCue } = useNotificationPermission();

  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: ACTIVE,
          tabBarInactiveTintColor: INACTIVE,
          tabBarStyle: {
            ...styles.tabStyle,
            height: TAB_HEIGHT + bottomInset,
            paddingBottom: bottomInset,
          },
          tabBarItemStyle: styles.tabItemStyle,
          tabBarIconStyle: { marginTop: 8 },
          sceneStyle: { backgroundColor: getNativeDefault("background") },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Entypo name="home" size={TAB_ICON_SIZE} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Add Subscription",
            tabBarButton: () => (
              <View style={styles.NewSubContainer}>
                <Pressable
                  onPress={() => router.push("/(home)/NewSubscription")}
                  accessibilityRole="button"
                  accessibilityLabel="Add subscription"
                  style={styles.addSubBtn}
                >
                  <Feather
                    name="plus"
                    size={FAB_ICON_SIZE}
                    color={getNativeDefault("background")}
                  />
                </Pressable>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <View style={styles.profileBtnContainer}>
                <FontAwesome name="user" size={TAB_ICON_SIZE} color={color} />
                {showEnableNotificationsCue ? (
                  <View
                    style={styles.notificationDot}
                    accessibilityLabel="Notifications are off"
                  />
                ) : null}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="subscriptions"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}

/** ─── Layout export ─────────────────────────────────────────────── */
export default function TabsLayout() {
  if (isGlassAvailable) {
    return <LiquidGlassTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  tabStyle: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: getNativeDefault("background"),
    borderTopWidth: 0,
    borderTopColor: "transparent",
    borderRadius: 0,
    paddingTop: 8,
    paddingHorizontal: 0,
    elevation: 0,
  },
  tabItemStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  NewSubContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addSubBtn: {
    height: 76,
    width: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: getNativeDefault("text"),
    marginTop: -36,
  },
  profileBtnContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "red",
    position: "absolute",
    top: 2,
    right: -4,
    borderWidth: 2,
    borderColor: getNativeDefault("background"),
  },
});
