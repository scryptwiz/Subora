import { NotificationPermissionProvider } from "@/contexts/notification-permission-context";
import { PreferencesProvider } from "@/contexts/preferences-context";
import { SubscriptionsProvider } from "@/contexts/subscriptions-context";
import { usePushRegistration } from "@/hooks/use-push-registration";
import { getNativeDefault } from "@/theme/colors";
import { useAuth } from "@clerk/expo";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Redirect, Stack } from "expo-router";
import { Platform } from "react-native";

function PushTokenRegistration() {
  usePushRegistration();
  return null;
}

export default function Layout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <PreferencesProvider>
      <NotificationPermissionProvider>
        <SubscriptionsProvider>
          <PushTokenRegistration />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{
                title: "",
                contentStyle: {
                  backgroundColor: getNativeDefault("background"),
                },
              }}
            />
            <Stack.Screen
              name="NewSubscription"
              options={{
                headerShown: Platform.OS === "ios",
                headerLargeTitle: true,
                headerTransparent: isLiquidGlassAvailable(),
                headerTintColor: getNativeDefault("text"),
                title: "Add Subscription",
                presentation: "formSheet",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="DeleteAccount"
              options={{
                title: "",
                headerTintColor: getNativeDefault("text"),
                headerLargeTitle: true,
                presentation: "formSheet",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="import-subscriptions-from-pdf"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen name="Notifications" />
          </Stack>
        </SubscriptionsProvider>
      </NotificationPermissionProvider>
    </PreferencesProvider>
  );
}
