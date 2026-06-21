import { NotificationPermissionProvider } from "@/contexts/notification-permission-context";
import { PreferencesProvider } from "@/contexts/preferences-context";
import { SubscriptionsProvider } from "@/contexts/subscriptions-context";
import { usePushRegistration } from "@/hooks/use-push-registration";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

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
              contentStyle: { backgroundColor: "#111111" },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="NewSubscription"
              options={{
                title: "",
                presentation: "formSheet",
                animation: "slide_from_bottom",
                contentStyle: { backgroundColor: "#111111" },
              }}
            />
            <Stack.Screen
              name="import-subscriptions-from-pdf"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
                contentStyle: { backgroundColor: "#111111" },
              }}
            />
            <Stack.Screen name="notifications" />
          </Stack>
        </SubscriptionsProvider>
      </NotificationPermissionProvider>
    </PreferencesProvider>
  );
}
