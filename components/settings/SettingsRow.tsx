import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type RowProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
};

export function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: RowProps) {
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
