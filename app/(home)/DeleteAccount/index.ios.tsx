import { Host, HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { background, font, padding } from "@expo/ui/swift-ui/modifiers";
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
        <VStack
          alignment="leading"
          spacing={16}
          modifiers={[padding({ all: 24 })]}
        >
          <HStack
            modifiers={[
              padding({ vertical: 24, horizontal: 16 }),
              background("blue"),
            ]}
          >
            <Spacer />
            <Image
              systemName="person.crop.circle.badge.minus"
              size={72}
              color="red"
            />
            <Spacer />
          </HStack>

          <Text modifiers={[font({ size: 16, weight: "semibold" })]}>
            Delete your account?
          </Text>
          <Spacer />
        </VStack>
      </Host>
    </>
  );
}
