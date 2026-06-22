import { Host, HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  lineLimit,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { router, Stack } from "expo-router";

export default function DeleteAccount() {
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={() => router.back()}>
          close
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <Host colorScheme="dark">
        <VStack alignment="leading" modifiers={[padding({ all: 24 })]}>
          <HStack>
            <Spacer />
            <Image
              systemName="person.crop.circle.badge.minus"
              size={72}
              color="red"
              modifiers={[padding({ top: 92, bottom: 24 })]}
            />
            <Spacer />
          </HStack>

          <Text modifiers={[font({ size: 18, weight: "medium" })]}>
            Delete your account?
          </Text>

          <Text
            modifiers={[
              font({ size: 16 }),
              lineLimit(0),
              foregroundStyle("#FFFFFF8F"),
            ]}
          >
            Deleting your account is a permanent, irreversible action. Once you
            proceed, all your personal data, saved preferences, history, and
            connected information will be permanently erased from our systems.
            We will not be able to recover your account or any associated data
            once this process is complete. Please be absolutely certain before
            continuing, as you will lose access to everything linked to this
            account immediately and forever.
          </Text>
          <Spacer />
        </VStack>
      </Host>
    </>
  );
}
