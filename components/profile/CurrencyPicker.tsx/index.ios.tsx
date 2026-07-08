import { SUPPORTED_CURRENCIES } from "@/constants/currencies";
import { usePreferences } from "@/contexts/preferences-context";
import { Picker, Text } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";
import { Alert } from "react-native";

export default function CurrencyPicker() {
  const { displayCurrency, setDisplayCurrency } = usePreferences();

  return (
    <Picker
      modifiers={[pickerStyle("menu")]}
      label="Currency"
      selection={displayCurrency}
      onSelectionChange={(selection) => {
        void setDisplayCurrency(selection).catch(() => {
          Alert.alert("Could not save", "Try again in a moment.");
        });
      }}
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <Text key={c.code} modifiers={[tag(c.code)]}>
          {c.code} · {c.label}
        </Text>
      ))}
    </Picker>
  );
}
