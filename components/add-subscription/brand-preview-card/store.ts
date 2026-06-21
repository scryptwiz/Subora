import { DEFAULT_CURRENCY } from "@/constants/currencies";
import type { BrandPreset } from "@/lib/brand-presets";
import { deriveDomain } from "@/lib/logo";
import type { BillingCycle } from "@/lib/subscriptions";
import { create } from "zustand";

export interface SubscriptionFormState {
  name: string;
  domainInput: string;
  effectiveDomain: string | undefined;
  iconSlug: string | undefined;
  brandColor: string | undefined;
  emoji: string | undefined;
  price: string;
  cycle: BillingCycle;
  currency: string;
  renewalDate: Date;
  active: boolean;
  reminderOffsets: number[];
  saving: boolean;
  isEditing: boolean;
  editingId: string | undefined;

  // Actions
  setName: (name: string) => void;
  setDomainInput: (domain: string) => void;
  setPrice: (price: string) => void;
  setCycle: (cycle: BillingCycle) => void;
  setCurrency: (currency: string) => void;
  setRenewalDate: (date: Date) => void;
  setActive: (active: boolean) => void;
  setReminderOffsets: (
    offsets: number[] | ((prev: number[]) => number[]),
  ) => void;
  setSaving: (saving: boolean) => void;
  applyPreset: (preset: BrandPreset) => void;
  clearLogoIfNameEdited: (next: string) => void;
  handleEmojiSelect: (emoji: string) => void;
  resetForm: () => void;
  hydrateForm: (values: Partial<SubscriptionFormState>) => void;
}

export const useSubscriptionFormStore = create<SubscriptionFormState>(
  (set, get) => ({
    name: "",
    domainInput: "",
    effectiveDomain: undefined,
    iconSlug: undefined,
    brandColor: undefined,
    emoji: undefined,
    price: "",
    cycle: "month",
    currency: DEFAULT_CURRENCY,
    renewalDate: new Date(),
    active: true,
    reminderOffsets: [0],
    saving: false,
    isEditing: false,
    editingId: undefined,

    setName: (name) =>
      set({
        name,
        effectiveDomain:
          get().domainInput.trim() || deriveDomain(name) || undefined,
      }),
    setDomainInput: (domainInput) =>
      set({
        domainInput,
        effectiveDomain:
          domainInput.trim() || deriveDomain(get().name) || undefined,
      }),
    setPrice: (price) => set({ price }),
    setCycle: (cycle) => set({ cycle }),
    setCurrency: (currency) => set({ currency }),
    setRenewalDate: (renewalDate) => set({ renewalDate }),
    setActive: (active) => set({ active }),
    setReminderOffsets: (offsets) =>
      set((state) => ({
        reminderOffsets:
          typeof offsets === "function"
            ? offsets(state.reminderOffsets)
            : offsets,
      })),
    setSaving: (saving) => set({ saving }),
    applyPreset: (preset) =>
      set({
        name: preset.name,
        domainInput: preset.domain,
        effectiveDomain: preset.domain.trim() || undefined,
        iconSlug: preset.iconSlug,
        brandColor: preset.brandColor,
        emoji: undefined,
      }),
    clearLogoIfNameEdited: (next) => {
      const { name, iconSlug } = get();
      if (next !== name && iconSlug) {
        set({ name: next, iconSlug: undefined, brandColor: undefined });
      } else {
        set({ name: next });
      }
      set({
        effectiveDomain:
          get().domainInput.trim() || deriveDomain(next) || undefined,
      });
    },
    handleEmojiSelect: (emoji) =>
      set({
        emoji,
        iconSlug: undefined,
        brandColor: undefined,
      }),
    resetForm: () =>
      set({
        name: "",
        domainInput: "",
        effectiveDomain: undefined,
        iconSlug: undefined,
        brandColor: undefined,
        emoji: undefined,
        price: "",
        cycle: "month",
        currency: DEFAULT_CURRENCY,
        renewalDate: new Date(),
        active: true,
        reminderOffsets: [0],
        saving: false,
        isEditing: false,
        editingId: undefined,
      }),
    hydrateForm: (values) =>
      set((state) => {
        const nextName = values.name !== undefined ? values.name : state.name;
        const nextDomainInput =
          values.domainInput !== undefined
            ? values.domainInput
            : state.domainInput;
        return {
          ...values,
          effectiveDomain:
            nextDomainInput.trim() || deriveDomain(nextName) || undefined,
        };
      }),
  }),
);
