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
  clipShape,
  font,
  foregroundStyle,
  frame,
  imageScale,
  listRowBackground,
  padding,
  resizable,
  scrollIndicators,
} from "@expo/ui/swift-ui/modifiers";
import Constants from "expo-constants";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Image as ExpoImage } from "expo-image";
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreenIOS() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const displayName = profileDisplayName(user);
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  const {
    deleting,
    deleteError,
    deleteOpen,
    setDeleteOpen,
    handleDeleteAccount,
    confirmSignOut,
  } = useProfileActions();

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        headerLargeTitle: true,
        headerTransparent: isLiquidGlassAvailable(),
        headerTintColor: getNativeDefault("text"),
        title: "Settings",
        contentStyle: { backgroundColor: getNativeDefault("background") },
      }}
    >
      <>
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
              <HStack alignment="center" spacing={18}>
                {user?.imageUrl ? (
                  <VStack
                    modifiers={[
                      frame({ width: 60, height: 60 }),
                      clipShape("circle"),
                    ]}
                  >
                    <ExpoImage
                      source={{ uri: user.imageUrl }}
                      style={{ width: 60, height: 60 }}
                    />
                  </VStack>
                ) : (
                  <SwiftUIImage
                    systemName="person.crop.circle.fill"
                    modifiers={[
                      foregroundStyle("#3F3F46"),
                      resizable(),
                      frame({ width: 60, height: 60 }),
                    ]}
                  />
                )}
                <VStack alignment="leading" spacing={4}>
                  <Text modifiers={[font({ size: 20, weight: "bold" })]}>
                    {displayName}
                  </Text>
                  <Text
                    modifiers={[font({ size: 14 }), foregroundStyle("#A1A1AA")]}
                  >
                    {email}
                  </Text>
                </VStack>
              </HStack>
            </Section>

            {/* Account Section */}
            <Section>
              <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
                <HStack spacing={12}>
                  <SwiftUIImage
                    systemName="person.crop.circle"
                    modifiers={[
                      foregroundStyle("#A1A1AA"),
                      imageScale("small"),
                    ]}
                  />
                  <Text>Edit profile</Text>
                </HStack>
              </Button>

              <Button
                onPress={() => router.push("/(home)/notifications")}
                modifiers={[buttonStyle("plain")]}
              >
                <HStack spacing={12}>
                  <SwiftUIImage
                    systemName="bell"
                    modifiers={[
                      foregroundStyle("#A1A1AA"),
                      imageScale("small"),
                    ]}
                  />
                  <Text>Reminders</Text>
                </HStack>
              </Button>
            </Section>

            {/* Preferences Section */}
            <Section>
              <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
                <HStack spacing={12}>
                  <SwiftUIImage
                    systemName="dollarsign.circle"
                    modifiers={[
                      foregroundStyle("#A1A1AA"),
                      imageScale("small"),
                    ]}
                  />
                  <Text>Currency</Text>
                </HStack>
              </Button>

              <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
                <HStack spacing={12}>
                  <SwiftUIImage
                    systemName="arrow.down.doc"
                    modifiers={[
                      foregroundStyle("#A1A1AA"),
                      imageScale("small"),
                    ]}
                  />
                  <Text>Export data</Text>
                </HStack>
              </Button>
            </Section>

            {/* Support Section */}
            <Section>
              <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
                <HStack spacing={12}>
                  <SwiftUIImage
                    systemName="questionmark.circle"
                    modifiers={[
                      foregroundStyle("#A1A1AA"),
                      imageScale("small"),
                    ]}
                  />
                  <Text>Help center</Text>
                </HStack>
              </Button>

              <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
                <HStack spacing={12}>
                  <SwiftUIImage
                    systemName="shield"
                    modifiers={[
                      foregroundStyle("#A1A1AA"),
                      imageScale("small"),
                    ]}
                  />
                  <Text>Privacy policy</Text>
                </HStack>
              </Button>

              <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
                <HStack spacing={12}>
                  <SwiftUIImage
                    systemName="doc.text"
                    modifiers={[
                      foregroundStyle("#A1A1AA"),
                      imageScale("small"),
                    ]}
                  />
                  <Text>Terms of service</Text>
                </HStack>
              </Button>
            </Section>

            {/* Action Section */}
            <Section>
              <Button
                onPress={confirmSignOut}
                modifiers={[buttonStyle("plain")]}
              >
                <HStack spacing={12}>
                  <SwiftUIImage
                    systemName="arrow.right.to.line"
                    modifiers={[
                      foregroundStyle("#EF4444"),
                      imageScale("small"),
                    ]}
                  />
                  <Text modifiers={[foregroundStyle("#EF4444")]}>Sign out</Text>
                </HStack>
              </Button>
            </Section>

            <Section title="Danger Zone">
              <Button
                onPress={() => router.push("/(home)/DeleteAccount")}
                modifiers={[buttonStyle("plain")]}
              >
                <HStack spacing={12}>
                  <SwiftUIImage
                    systemName="trash"
                    modifiers={[
                      foregroundStyle("#EF4444"),
                      imageScale("small"),
                    ]}
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
        </Host>
        {/* <DeleteAccountModal
          visible={deleteOpen}
          email={user?.primaryEmailAddress?.emailAddress ?? undefined}
          deleting={deleting}
          error={deleteError}
          onClose={() => {
            if (deleting) return;
            setDeleteOpen(false);
          }}
          onConfirm={() => void handleDeleteAccount()}
        /> */}
      </>
    </Stack.Screen>
  );
}
