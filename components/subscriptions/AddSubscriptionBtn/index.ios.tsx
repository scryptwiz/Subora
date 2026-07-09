import { getNativeDefault } from "@/theme/colors";
import { Button, Host, HStack, Image, Spacer, Text } from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  clipShape,
  cornerRadius,
  font,
  foregroundStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { router } from "expo-router";

export default function AddSubscriptionBtn() {
  return (
    <Host colorScheme="dark" matchContents>
      <Button
        onPress={() => router.push("/(home)/NewSubscription")}
        modifiers={[
          clipShape("circle"),
          buttonStyle(isLiquidGlassAvailable() ? "glass" : "bordered"),
          background("transparent"),
        ]}
      >
        <Image
          systemName="plus"
          size={20}
          modifiers={[
            clipShape("circle"),
            foregroundStyle(getNativeDefault("text")),
            padding({ vertical: 6, horizontal: 0 }),
          ]}
        />
      </Button>
    </Host>
  );
}

export function LargeAddSubscriptionBtn({ onAdd }: { onAdd: () => void }) {
  const isGlassAvailable = isLiquidGlassAvailable();
  return (
    <Host colorScheme="dark" matchContents style={{ marginTop: 18 }}>
      <Button
        onPress={onAdd}
        modifiers={[
          buttonStyle(isGlassAvailable ? "glass" : "borderedProminent"),
          cornerRadius(16),
        ]}
      >
        <HStack
          spacing={8}
          alignment="center"
          modifiers={[padding({ vertical: 6 })]}
        >
          <Spacer />
          <Image
            systemName="plus"
            size={16}
            modifiers={[foregroundStyle("#FFFFFF")]}
          />
          <Text
            modifiers={[
              font({ size: 14, weight: "medium" }),
              foregroundStyle("#FFFFFF"),
            ]}
          >
            Add subscription
          </Text>
          <Spacer />
        </HStack>
      </Button>
    </Host>
  );
}
