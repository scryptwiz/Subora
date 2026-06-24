import { getNativeDefault } from "@/theme/colors";
import { Button, Host, Image } from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  clipShape,
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
