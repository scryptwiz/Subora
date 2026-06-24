import { Host, Picker, Text } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";
import { FilterPillProps } from ".";

export default function FilterPills({
  active,
  options,
  onFilter,
}: FilterPillProps) {
  return (
    <Host matchContents>
      <Picker
        modifiers={[pickerStyle("segmented")]}
        selection={active}
        onSelectionChange={onFilter}
      >
        {options.map((f) => (
          <Text key={f.id} modifiers={[tag(f.id)]}>
            {f.label}
          </Text>
        ))}
      </Picker>
    </Host>
  );
}
