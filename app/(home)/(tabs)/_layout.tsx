import { useNotificationPermission } from "@/contexts/notification-permission-context";
import { Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE = "#FFFFFF";
const INACTIVE = "#2F3238";
const TAB_HEIGHT = 68;
/** Side tabs — one size so Home / Profile match visually */
const TAB_ICON_SIZE = 26;
/** Center FAB — slightly larger, proportional to side icons */
const FAB_ICON_SIZE = Math.round(TAB_ICON_SIZE * 1.35);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showEnableNotificationsCue } = useNotificationPermission();

  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <View className="flex-1 bg-[#111111]">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: ACTIVE,
          tabBarInactiveTintColor: INACTIVE,
          tabBarStyle: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#111317",
            borderTopWidth: 0,
            borderTopColor: "transparent",
            borderRadius: 0,
            height: TAB_HEIGHT + bottomInset,
            paddingTop: 8,
            paddingBottom: bottomInset,
            paddingHorizontal: 0,
            elevation: 0,
          },
          tabBarItemStyle: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarIconStyle: { marginTop: 8 },
          sceneStyle: { backgroundColor: "#111111" },
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
              <View className="flex-1 items-center justify-center">
                <Pressable
                  onPress={() => router.push("/(home)/NewSubscription")}
                  accessibilityRole="button"
                  accessibilityLabel="Add subscription"
                  className="-mt-9 h-[76px] w-[76px] items-center justify-center rounded-full bg-white"
                  style={({ pressed }) =>
                    pressed ? { opacity: 0.85 } : undefined
                  }
                >
                  <Feather name="plus" size={FAB_ICON_SIZE} color="#111111" />
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
              <View
                className="items-center justify-center"
                style={{ position: "relative" }}
              >
                <FontAwesome name="user" size={TAB_ICON_SIZE} color={color} />
                {showEnableNotificationsCue ? (
                  <View
                    className="absolute rounded-full border-2 border-[#111317] bg-red-500"
                    style={{ width: 10, height: 10, top: 2, right: -4 }}
                    accessibilityLabel="Notifications are off"
                  />
                ) : null}
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
