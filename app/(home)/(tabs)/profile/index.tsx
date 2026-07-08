import { CurrencyPickerModal } from "@/components/profile/CurrencyPicker.tsx";
import { DeleteAccountModal } from "@/components/profile/DeleteAcountModal.tsx";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { ExportDataModal } from "@/components/profile/ExportDataModal";
import ProfileImage from "@/components/profile/ProfileImage";
import { PushNotificationPromptSection } from "@/components/profile/push-notification-prompt-section";
import { ScrollRevealTopChrome } from "@/components/scroll-reveal-top-chrome";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { SectionCard } from "@/components/settings/SettingsSectionCard";
import { getCurrencyOption } from "@/constants/currencies";
import { usePreferences } from "@/contexts/preferences-context";
import { useProfileActions } from "@/hooks/use-profile-actions";
import { profileDisplayName } from "@/lib/profile-display-name";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { useUser } from "@clerk/expo";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const [scrollY] = useState(() => new Animated.Value(0));

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

  const {
    deleting,
    deleteError,
    deleteOpen,
    setDeleteOpen,
    setDeleteError,
    handleDeleteAccount,
    confirmSignOut,
  } = useProfileActions();

  const currencySubtitle = prefsLoading
    ? "Loading…"
    : `${displayCurrency} · ${getCurrencyOption(displayCurrency).label}`;

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
          {/* Profile card */}
          <View style={styles.profileCard}>
            <ProfileImage />
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>{displayName}</Text>
              <Text style={styles.email}>{email}</Text>
            </View>
          </View>

          <PushNotificationPromptSection />

          {/* Account section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
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
                onPress={() => router.push("/(home)/Notifications")}
              />
            </SectionCard>
          </View>

          {/* Preferences section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
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
          <View style={styles.section}>
            <Text style={styles.dangerSectionTitle}>Danger zone</Text>
            <SectionCard>
              <SettingsRow
                icon="trash-2"
                title="Delete account"
                subtitle="Permanently erase your data"
                onPress={() => router.push("/(home)/DeleteAccount")}
                danger
              />
            </SectionCard>
          </View>

          <Text style={styles.versionText}>
            Subora · v{Constants.expoConfig?.version ?? "1.0.0"}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getNativeDefault("background"),
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    alignItems: "center",
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    padding: 24,
  },
  profileInfo: {
    alignItems: "center",
  },
  displayName: {
    ...Typography.titleBold,
    color: getNativeDefault("text"),
  },
  email: {
    marginTop: 4,
    ...Typography.base,
    color: getNativeDefault("secondaryText"),
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    paddingHorizontal: 4,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#737373",
  },
  dangerSectionTitle: {
    paddingHorizontal: 4,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "rgba(248, 113, 113, 0.8)",
  },
  versionText: {
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#525252",
  },
});
