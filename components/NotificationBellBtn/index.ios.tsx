import { Button, Host, Image } from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  clipShape,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { router } from "expo-router";

export default function NotificationBellBtn() {
  return (
    <Host colorScheme="dark" matchContents>
      <Button
        onPress={() => router.push("/(home)/notifications")}
        modifiers={[
          clipShape("circle"),
          buttonStyle(isLiquidGlassAvailable() ? "glass" : "bordered"),
          background("transparent"),
        ]}
      >
        <Image
          systemName="bell"
          size={20}
          color="white"
          modifiers={[
            clipShape("circle"),
            padding({ vertical: 6, horizontal: 0 }),
          ]}
        />
      </Button>
    </Host>
  );
}
