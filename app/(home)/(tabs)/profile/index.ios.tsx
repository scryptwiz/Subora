import { profileDisplayName } from "@/lib/profile-display-name";
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
  buttonStyle,
  font,
  foregroundStyle,
  frame,
  imageScale,
  listRowBackground,
  padding,
  resizable,
  scrollContentBackground,
  scrollIndicators,
} from "@expo/ui/swift-ui/modifiers";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreenIOS() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const displayName = profileDisplayName(user);
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        headerLargeTitle: true,
        headerTransparent: true,
        headerTintColor: "#FFFFFF",
        title: "Settings",
        contentStyle: { backgroundColor: "#111111" },
      }}
    >
      <Host style={{ flex: 1 }} colorScheme="dark">
        <Form
          modifiers={[
            scrollContentBackground("hidden"),
            scrollIndicators("hidden"),
            padding({ bottom: insets.bottom }),
          ]}
        >
          {/* Profile Card Section */}
          <Section>
            <HStack alignment="center" spacing={18}>
              {/* {user?.imageUrl ? (
              <ExpoImage
                source={{ uri: user.imageUrl }}
                style={{ width: 88, height: 88, borderRadius: 44 }}
              />
            ) : ( */}
              <SwiftUIImage
                systemName="person.crop.circle.fill"
                modifiers={[
                  foregroundStyle("#3F3F46"),
                  resizable(),
                  frame({ width: 60, height: 60 }),
                ]}
              />
              {/* )} */}
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
                  modifiers={[foregroundStyle("#A1A1AA"), imageScale("small")]}
                />
                <Text>Edit profile</Text>
              </HStack>
            </Button>

            <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="bell"
                  modifiers={[foregroundStyle("#A1A1AA"), imageScale("small")]}
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
                  modifiers={[foregroundStyle("#A1A1AA"), imageScale("small")]}
                />
                <Text>Currency</Text>
              </HStack>
            </Button>

            <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="arrow.down.doc"
                  modifiers={[foregroundStyle("#A1A1AA"), imageScale("small")]}
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
                  modifiers={[foregroundStyle("#A1A1AA"), imageScale("small")]}
                />
                <Text>Help center</Text>
              </HStack>
            </Button>

            <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="shield"
                  modifiers={[foregroundStyle("#A1A1AA"), imageScale("small")]}
                />
                <Text>Privacy policy</Text>
              </HStack>
            </Button>

            <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="doc.text"
                  modifiers={[foregroundStyle("#A1A1AA"), imageScale("small")]}
                />
                <Text>Terms of service</Text>
              </HStack>
            </Button>
          </Section>

          {/* Action Section */}
          <Section>
            <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="arrow.right.to.line"
                  modifiers={[foregroundStyle("#EF4444"), imageScale("small")]}
                />
                <Text modifiers={[foregroundStyle("#EF4444")]}>Sign out</Text>
              </HStack>
            </Button>
          </Section>

          <Section title="Danger Zone">
            <Button onPress={() => {}} modifiers={[buttonStyle("plain")]}>
              <HStack spacing={12}>
                <SwiftUIImage
                  systemName="trash"
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
            modifiers={[listRowBackground("clear"), padding({ bottom: 52 })]}
          >
            <HStack>
              <Spacer />
              <Text
                modifiers={[font({ size: 12 }), foregroundStyle("#52525B")]}
              >
                Subora · v1.0.0
              </Text>
              <Spacer />
            </HStack>
          </Section>
        </Form>
      </Host>
    </Stack.Screen>
  );
}
