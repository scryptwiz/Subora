import {
  BrandPreviewCardIOS,
  BrandPreviewProvider,
  useBrandPreview,
} from "@/components/add-subscription/brand-preview-card";
import {
  getCurrencyOption,
  SUPPORTED_CURRENCIES,
} from "@/constants/currencies";
import { getNativeDefault } from "@/theme/colors";
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
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  autocorrectionDisabled,
  background,
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
  scrollIndicators,
  shapes,
  tag,
  textInputAutocapitalization,
} from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack } from "expo-router";
import { useEffect } from "react";

const CYCLES = [
  { tag: "month", label: "Monthly" },
  { tag: "year", label: "Yearly" },
];

const REMINDER_OPTIONS = [
  { id: 0, label: "Same day" },
  { id: 2, label: "2 days before" },
  { id: 5, label: "5 days before" },
];

const MAX_REMINDERS = 3;

function AddSubscriptionFormInner() {
  const {
    name,
    setName,
    setDomainInput,
    price,
    setPrice,
    cycle,
    setCycle,
    currency,
    setCurrency,
    renewalDate,
    setRenewalDate,
    reminderOffsets,
    setReminderOffsets,
    isValid,
    saving,
    handleSave,
    isEditing,
  } = useBrandPreview();

  const nameState = useNativeState(name);
  const priceState = useNativeState(price);

  useEffect(() => {
    nameState.value = name;
  }, [name]);

  useEffect(() => {
    priceState.value = price;
  }, [price]);

  const toggle = (offset: number) => {
    if (reminderOffsets.includes(offset)) {
      setReminderOffsets(reminderOffsets.filter((o) => o !== offset));
    } else {
      if (reminderOffsets.length >= MAX_REMINDERS) return;
      setReminderOffsets([...reminderOffsets, offset]);
    }
  };

  const currencyOption = getCurrencyOption(currency);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLargeTitle: true,
          headerTransparent: isLiquidGlassAvailable(),
          headerTitleStyle: { color: getNativeDefault("text") },
          title: isEditing ? "Edit subscription" : "Add subscription",
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          disabled={!isValid || saving}
          onPress={() => void handleSave()}
        >
          {saving ? "Saving..." : "Save"}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <Host style={{ flex: 1 }}>
        <Form
          modifiers={[
            scrollIndicators("hidden"),
            background(getNativeDefault("background")),
          ]}
        >
          <Section>
            <BrandPreviewCardIOS />
          </Section>

          <Section title="Service">
            <TextField
              placeholder="e.g. Netflix"
              text={nameState}
              onTextChange={(val) => {
                nameState.value = val;
                setName(val);
              }}
            />
            <TextField
              placeholder="netflix.com (Optional)"
              onTextChange={setDomainInput}
              modifiers={[
                textInputAutocapitalization("never"),
                autocorrectionDisabled(true),
              ]}
            />
          </Section>

          <Section title="Price">
            <HStack spacing={12}>
              <Menu
                label={currencyOption.symbol}
                modifiers={[buttonStyle("bordered")]}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <Button
                    key={c.code}
                    label={`${c.symbol}  ${c.code}`}
                    onPress={() => setCurrency(c.code)}
                  />
                ))}
              </Menu>
              <TextField
                placeholder="0.00"
                text={priceState}
                modifiers={[keyboardType("decimal-pad")]}
                onTextChange={(val) => {
                  priceState.value = val;
                  setPrice(val);
                }}
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
              const isSelected = reminderOffsets.includes(option.id);
              const atCap =
                reminderOffsets.length >= MAX_REMINDERS && !isSelected;

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

export default function AddSubscriptionScreen() {
  return (
    <BrandPreviewProvider>
      <AddSubscriptionFormInner />
    </BrandPreviewProvider>
  );
}
