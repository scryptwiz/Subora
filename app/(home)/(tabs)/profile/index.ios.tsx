import CurrencyPicker from "@/components/profile/CurrencyPicker.tsx/index.ios";
import { DeleteAccountModalIOS } from "@/components/profile/DeleteAcountModal.tsx/index.ios";
import { ExportDataModal } from "@/components/profile/ExportDataModal";
import ProfileImage from "@/components/profile/ProfileImage";
import { useProfileActions } from "@/hooks/use-profile-actions";
import { profileDisplayName } from "@/lib/profile-display-name";
import { getNativeDefault } from "@/theme/colors";
import { useUser } from "@clerk/expo";
import {
  Button,
  Form,
  Host,
  HStack,
  Section,
  Spacer,
  Image as SwiftUIImage,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  cornerRadius,
  font,
  foregroundStyle,
  frame,
  imageScale,
  listRowBackground,
  padding,
  scrollIndicators,
} from "@expo/ui/swift-ui/modifiers";
import Constants from "expo-constants";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreenIOS() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [exportDataOpen, setExportDataOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const displayName = profileDisplayName(user);
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  const { confirmSignOut } = useProfileActions();

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        headerLargeTitle: true,
        headerTransparent: isLiquidGlassAvailable(),
        headerTitleStyle: { color: getNativeDefault("text") },
        title: "Settings",
        contentStyle: { backgroundColor: getNativeDefault("background") },
      }}
    >
      <Host style={{ flex: 1 }}>
        <Form
          modifiers={[
            scrollIndicators("hidden"),
            padding({ bottom: isLiquidGlassAvailable() ? 0 : insets.bottom }),
            background(getNativeDefault("background")),
          ]}
        >
          {/* Profile Card Section */}
          <Section>
            <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
              <HStack alignment="center" spacing={16}>
                <HStack
                  modifiers={[
                    frame({ width: 60, height: 60 }),
                    cornerRadius(100),
                  ]}
                >
                  <ProfileImage />
                </HStack>
                <VStack alignment="leading" spacing={2}>
                  <Text modifiers={[font({ size: 22, weight: "bold" })]}>
                    {displayName}
                  </Text>
                  <Text
                    modifiers={[
                      foregroundStyle(getNativeDefault("secondaryText")),
                    ]}
                  >
                    {email}
                  </Text>
                </VStack>
                <Spacer />
                <SwiftUIImage
                  systemName="chevron.right"
                  size={16}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
              </HStack>
            </Button>

            {/* Currency */}
            <CurrencyPicker />
          </Section>

          {/* Preferences Section */}
          <Section>
            <Button
              onPress={() => router.push("/(home)/Notifications")}
              modifiers={[buttonStyle("plain")]}
            >
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="bell.badge.fill"
                  size={28}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
                <Text>Reminders</Text>
                <Spacer />
                <SwiftUIImage
                  systemName="chevron.right"
                  size={16}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
              </HStack>
            </Button>

            <Button
              onPress={() => setExportDataOpen(true)}
              modifiers={[buttonStyle("plain")]}
            >
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="arrow.down.doc.fill"
                  size={28}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
                <Text>Export data</Text>
                <Spacer />
                <SwiftUIImage
                  systemName="chevron.right"
                  size={16}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
              </HStack>
            </Button>
          </Section>

          {/* Support Section */}
          <Section>
            <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="questionmark.circle.fill"
                  size={28}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
                <Text>Help center</Text>
                <Spacer />
                <SwiftUIImage
                  systemName="chevron.right"
                  size={16}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
              </HStack>
            </Button>

            <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="shield.lefthalf.filled"
                  size={28}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
                <Text>Privacy policy</Text>
                <Spacer />
                <SwiftUIImage
                  systemName="chevron.right"
                  size={16}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
              </HStack>
            </Button>

            <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="doc.text.fill"
                  size={28}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
                <Text>Terms of service</Text>
                <Spacer />
                <SwiftUIImage
                  systemName="chevron.right"
                  size={16}
                  modifiers={[
                    foregroundStyle(getNativeDefault("secondaryText")),
                    imageScale("small"),
                  ]}
                />
              </HStack>
            </Button>
          </Section>

          {/* Action Section */}
          <Section>
            <Button onPress={confirmSignOut} modifiers={[buttonStyle("plain")]}>
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="arrow.right.to.line.compact"
                  size={28}
                  modifiers={[foregroundStyle("#EF4444"), imageScale("small")]}
                />
                <Text modifiers={[foregroundStyle("#EF4444")]}>Sign out</Text>
              </HStack>
            </Button>
          </Section>

          <Section title="Danger Zone">
            <Button
              onPress={() => setDeleteOpen(true)}
              modifiers={[buttonStyle("plain")]}
            >
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="trash.fill"
                  size={28}
                  modifiers={[foregroundStyle("#EF4444"), imageScale("small")]}
                />
                <Text modifiers={[foregroundStyle("#EF4444")]}>
                  Delete account
                </Text>
              </HStack>
            </Button>
          </Section>

          {/* Footer Version Section */}
          <Section
            modifiers={[
              listRowBackground("clear"),
              padding({ bottom: isLiquidGlassAvailable() ? 0 : 52 }),
            ]}
          >
            <HStack>
              <Spacer />
              <Text
                modifiers={[font({ size: 12 }), foregroundStyle("#52525B")]}
              >
                Subora · v{Constants.expoConfig?.version ?? "1.0.2"}
              </Text>
              <Spacer />
            </HStack>
          </Section>
        </Form>
        <ExportDataModal
          visible={exportDataOpen}
          onClose={() => setExportDataOpen(false)}
        />
        <DeleteAccountModalIOS
          email={email}
          visible={deleteOpen}
          onClose={() => setDeleteOpen(false)}
        />
      </Host>
    </Stack.Screen>
  );
}
