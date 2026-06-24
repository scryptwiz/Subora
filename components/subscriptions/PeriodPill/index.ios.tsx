import { getNativeDefault } from "@/theme/colors";
import { Button, Host, Menu } from "@expo/ui/swift-ui";
import { buttonStyle, foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Period } from "./index";

const LABELS: Record<Period, string> = {
  month: "Month",
  year: "Year",
  all: "All time",
};

type Props = {
  value: Period;
  options?: Period[];
  onChange: (next: Period) => void;
};

export function PeriodPill({
  value,
  options = ["month", "year", "all"],
  onChange,
}: Props) {
  return (
    <Host matchContents>
      <Menu
        label={`${LABELS[value]}`}
        modifiers={[
          buttonStyle(isLiquidGlassAvailable() ? "glass" : "bordered"),
          foregroundStyle(getNativeDefault("text")),
        ]}
      >
        {options.map((opt) => (
          <Button key={opt} label={LABELS[opt]} onPress={() => onChange(opt)} />
        ))}
      </Menu>
    </Host>
  );
}
