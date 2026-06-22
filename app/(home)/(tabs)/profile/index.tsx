import { CurrencyPickerModal } from "@/components/profile/currency-picker-modal";
import { DeleteAccountModal } from "@/components/profile/delete-account-modal";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { ExportDataModal } from "@/components/profile/export-data-modal";
import { PushNotificationPromptSection } from "@/components/profile/push-notification-prompt-section";
import { ScrollRevealTopChrome } from "@/components/scroll-reveal-top-chrome";
import { getCurrencyOption } from "@/constants/currencies";
import { usePreferences } from "@/contexts/preferences-context";
import { useSupabase } from "@/hooks/use-supabase";
import { deleteAccount } from "@/lib/delete-account";
import { avatarColor, initials } from "@/lib/logo";
import { profileDisplayName } from "@/lib/profile-display-name";
import {
  isClerkAPIResponseError,
  useAuth,
  useClerk,
  useUser,
} from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RowProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
};

function SettingsRow({ icon, title, subtitle, onPress, danger }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 px-4 py-4"
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl ${danger ? "bg-red-500/10" : "bg-[#1F1F22]"}`}
      >
        <Feather name={icon} size={18} color={danger ? "#F87171" : "#FFFFFF"} />
      </View>
      <View className="flex-1">
        <Text
          className={`font-inter-medium text-base ${danger ? "text-red-400" : "text-white"}`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 font-inter text-xs text-neutral-500">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={18} color="#52525B" />
    </Pressable>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#16161A]">
      {React.Children.toArray(children).map((child, idx, arr) => (
        <View key={idx}>
          {child}
          {idx < arr.length - 1 ? (
            <View className="ml-[68px] h-px bg-[#1F1F22]" />
          ) : null}
        </View>
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { userId } = useAuth();
  const supabase = useSupabase();
  const scrollY = useRef(new Animated.Value(0)).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
    },
  );

  const displayName = profileDisplayName(user);
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  const {
    displayCurrency,
    loading: prefsLoading,
    setDisplayCurrency,
  } = usePreferences();
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [exportDataOpen, setExportDataOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const currencySubtitle = prefsLoading
    ? "Loading…"
    : `${displayCurrency} · ${getCurrencyOption(displayCurrency).label}`;

  const handleDeleteAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount({ supabase, user, userId });
      try {
        await signOut();
      } catch {
        // user is already gone server-side; ignore stale session errors
      }
      setDeleteOpen(false);
      router.replace("/(auth)/sign-in");
    } catch (e) {
      const msg = isClerkAPIResponseError(e)
        ? (e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message)
        : e instanceof Error
          ? e.message
          : "Could not delete your account.";
      setDeleteError(msg ?? "Could not delete your account.");
    } finally {
      setDeleting(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert("Sign out", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <Stack.Screen
      options={{
        title: "",
        headerShown: false,
        headerLargeTitle: true,
        headerTransparent: true,
        headerTintColor: "#FFFFFF",
        contentStyle: { backgroundColor: "#111111" },
      }}
    >
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
          {/* Profile card */}
          <View className="items-center gap-3 rounded-3xl border border-[#1F1F22] bg-[#16161A] p-6">
            {user?.imageUrl ? (
              <Image
                key={user.imageUrl}
                source={{ uri: user.imageUrl }}
                style={{ width: 88, height: 88, borderRadius: 44 }}
                contentFit="cover"
                recyclingKey={user.imageUrl}
              />
            ) : (
              <View
                className="h-[88px] w-[88px] items-center justify-center rounded-full"
                style={{ backgroundColor: avatarColor(displayName) }}
              >
                <Text className="font-inter-bold text-3xl text-white">
                  {initials(displayName)}
                </Text>
              </View>
            )}
            <View className="items-center">
              <Text className="font-inter-bold text-xl text-white">
                {displayName}
              </Text>
              <Text className="mt-1 font-inter text-sm text-neutral-500">
                {email}
              </Text>
            </View>
          </View>

          <PushNotificationPromptSection />

          {/* Account section */}
          <View className="gap-3">
            <Text className="px-1 font-inter text-xs uppercase tracking-wider text-neutral-500">
              Account
            </Text>
            <SectionCard>
              <SettingsRow
                icon="user"
                title="Edit profile"
                subtitle="Username, name, and photo"
                onPress={() => setEditProfileOpen(true)}
              />
              <SettingsRow
                icon="bell"
                title="Reminders"
                subtitle="Renewal alerts"
                onPress={() => router.push("/(home)/notifications")}
              />
            </SectionCard>
          </View>

          {/* Preferences section */}
          <View className="gap-3">
            <Text className="px-1 font-inter text-xs uppercase tracking-wider text-neutral-500">
              Preferences
            </Text>
            <SectionCard>
              <SettingsRow
                icon="dollar-sign"
                title="Currency"
                subtitle={currencySubtitle}
                onPress={() => setCurrencyPickerOpen(true)}
              />
              <SettingsRow
                icon="download"
                title="Export data"
                subtitle="CSV for spreadsheets"
                onPress={() => setExportDataOpen(true)}
              />
            </SectionCard>
          </View>

          {/* Support */}
          <View className="gap-3">
            <Text className="px-1 font-inter text-xs uppercase tracking-wider text-neutral-500">
              Support
            </Text>
            <SectionCard>
              <SettingsRow icon="help-circle" title="Help center" />
              <SettingsRow icon="shield" title="Privacy policy" />
              <SettingsRow icon="file-text" title="Terms of service" />
            </SectionCard>
          </View>

          {/* Sign out */}
          <SectionCard>
            <SettingsRow
              icon="log-out"
              title="Sign out"
              onPress={confirmSignOut}
              danger
            />
          </SectionCard>

          {/* Danger zone */}
          <View className="gap-3">
            <Text className="px-1 font-inter text-xs uppercase tracking-wider text-red-400/80">
              Danger zone
            </Text>
            <SectionCard>
              <SettingsRow
                icon="trash-2"
                title="Delete account"
                subtitle="Permanently erase your data"
                onPress={() => {
                  setDeleteError(null);
                  setDeleteOpen(true);
                }}
                danger
              />
            </SectionCard>
          </View>

          <Text className="text-center font-inter text-xs text-neutral-600">
            Subora · v1.0.0
          </Text>
        </Animated.ScrollView>

        <ScrollRevealTopChrome scrollY={scrollY} topInset={insets.top} />

        <CurrencyPickerModal
          visible={currencyPickerOpen}
          selectedCode={displayCurrency}
          onClose={() => setCurrencyPickerOpen(false)}
          onSelect={(code) => {
            void setDisplayCurrency(code).catch(() => {
              Alert.alert("Could not save", "Try again in a moment.");
            });
          }}
        />

        <EditProfileModal
          visible={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
        />

        <ExportDataModal
          visible={exportDataOpen}
          onClose={() => setExportDataOpen(false)}
        />

        <DeleteAccountModal
          visible={deleteOpen}
          email={user?.primaryEmailAddress?.emailAddress ?? undefined}
          deleting={deleting}
          error={deleteError}
          onClose={() => {
            if (deleting) return;
            setDeleteOpen(false);
          }}
          onConfirm={() => void handleDeleteAccount()}
        />
      </View>
    </Stack.Screen>
  );
}
