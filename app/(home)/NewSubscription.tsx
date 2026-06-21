import { SUPPORTED_CURRENCIES } from "@/constants/currencies";
import {
  Button,
  DatePicker,
  Form,
  Host,
  HStack,
  Image,
  Menu,
  Picker,
  Section,
  Spacer,
  Text,
  TextField,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  contentShape,
  datePickerStyle,
  disabled,
  foregroundStyle,
  hidden,
  keyboardType,
  onTapGesture,
  opacity,
  pickerStyle,
  shapes,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { Stack } from "expo-router";
import { useState } from "react";

const CYCLES = [
  { tag: "monthly", label: "Monthly" },
  { tag: "yearly", label: "Yearly" },
];

const REMINDER_OPTIONS = [
  { id: "same-day", label: "Same day" },
  { id: "2-days", label: "2 days before" },
  { id: "5-days", label: "5 days before" },
];

const MAX_REMINDERS = 3;

export default function NewSubscription() {
  const [cycle, setCycle] = useState("monthly");
  const [currency, setCurrency] = useState(SUPPORTED_CURRENCIES[0]);
  const [selected, setSelected] = useState<string[]>(["same-day"]);
  const [renewalDate, setRenewalDate] = useState(new Date());

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= MAX_REMINDERS) return prev; // at cap, ignore tap
      return [...prev, id];
    });
  };

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button disabled>Save</Stack.Toolbar.Button>
      </Stack.Toolbar>

      <Host style={{ flex: 1 }} colorScheme="dark">
        <Form>
          <Section title="Service">
            <TextField placeholder="e.g. Netflix" autoFocus />
            <TextField placeholder="netflix.com (Optional)" />
          </Section>

          <Section title="Price">
            <HStack spacing={12}>
              <Menu
                label={currency.symbol}
                modifiers={[buttonStyle("bordered")]}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <Button
                    key={c.code}
                    label={`${c.symbol}  ${c.code}`}
                    onPress={() => setCurrency(c)}
                  />
                ))}
              </Menu>

              <TextField
                placeholder="0.00"
                modifiers={[keyboardType("decimal-pad")]}
              />
            </HStack>

            <Picker
              modifiers={[pickerStyle("segmented")]}
              label="Billing cycle"
              selection={cycle}
              onSelectionChange={setCycle}
            >
              {CYCLES.map((c) => (
                <Text key={c.tag} modifiers={[tag(c.tag)]}>
                  {c.label}
                </Text>
              ))}
            </Picker>
          </Section>

          <Section title="Billing">
            <DatePicker
              title="Renewal Date"
              selection={renewalDate}
              displayedComponents={["date"]}
              onDateChange={setRenewalDate}
              modifiers={[datePickerStyle("compact")]}
            />
          </Section>

          <Section title="Reminders (up to 3)">
            {REMINDER_OPTIONS.map((option) => {
              const isSelected = selected.includes(option.id);
              const atCap = selected.length >= MAX_REMINDERS && !isSelected;

              return (
                <HStack
                  key={option.id}
                  modifiers={[
                    contentShape(shapes.rectangle()),
                    onTapGesture(() => toggle(option.id)),
                    disabled(atCap),
                    opacity(atCap ? 0.4 : 1),
                  ]}
                >
                  <Text>{option.label}</Text>
                  <Spacer />
                  <Image
                    systemName="checkmark"
                    modifiers={[
                      foregroundStyle("#0A84FF"),
                      hidden(!isSelected),
                    ]}
                  />
                </HStack>
              );
            })}
          </Section>
        </Form>
      </Host>
    </>
  );
}
