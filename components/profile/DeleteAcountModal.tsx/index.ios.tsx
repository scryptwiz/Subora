import { useProfileActions } from "@/hooks/use-profile-actions";
import { getNativeDefault } from "@/theme/colors";
import {
  BottomSheet,
  Button,
  Group,
  HStack,
  ProgressView,
  Spacer,
  Image as SwiftUIImage,
  Text,
  TextField,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  cornerRadius,
  fixedSize,
  font,
  foregroundStyle,
  frame,
  padding,
  presentationDetents,
  presentationDragIndicator,
} from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useEffect, useMemo, useState } from "react";

const CONFIRM_PHRASE = "DELETE";

const ERASURE_BULLETS = [
  "All subscriptions and renewal history",
  "Your currency preference and settings",
  "Your name, photo and sign-in identity",
];

type Props = {
  visible: boolean;
  email?: string;
  onClose: () => void;
};

export function DeleteAccountModalIOS({ visible, onClose, email }: Props) {
  const [phrase, setPhrase] = useState("");
  const isGlassAvailable = isLiquidGlassAvailable();
  const { deleting, deleteError, handleDeleteAccount } = useProfileActions();

  useEffect(() => {
    if (!visible) setPhrase("");
  }, [visible]);

  const matches = useMemo(
    () => phrase.trim().toUpperCase() === CONFIRM_PHRASE,
    [phrase],
  );
  const canConfirm = matches && !deleting;

  return (
    <BottomSheet
      isPresented={visible}
      onIsPresentedChange={(val) => {
        if (!val && !deleting) onClose();
      }}
      fitToContents
    >
      <Group
        modifiers={[
          padding({ top: 24, bottom: 20, horizontal: 24 }),
          presentationDragIndicator("visible"),
          presentationDetents(["large", "medium"]),
        ]}
      >
        <VStack spacing={20} alignment="leading">
          <VStack spacing={12} alignment="leading">
            {/* warning icon */}
            <HStack
              modifiers={[
                frame({ width: 56, height: 56 }),
                background("rgba(239, 68, 68, 0.1)"),
                cornerRadius(16),
              ]}
              alignment="center"
            >
              <Spacer />
              <SwiftUIImage
                systemName="exclamationmark.triangle.fill"
                size={24}
                modifiers={[foregroundStyle("#EF4444")]}
              />
              <Spacer />
            </HStack>
            <Text
              modifiers={[
                font({ size: 20, weight: "bold" }),
                foregroundStyle(getNativeDefault("text")),
              ]}
            >
              This is permanent
            </Text>
            <Text
              modifiers={[
                font({ size: 14 }),
                foregroundStyle(getNativeDefault("secondaryText")),
                fixedSize({ horizontal: false, vertical: true }),
              ]}
            >
              Deleting your account is irreversible. We cannot recover your data
              after this. {email ? `Signed in as ${email}.` : ""}
            </Text>
          </VStack>

          <VStack
            spacing={8}
            alignment="leading"
            modifiers={[
              padding({ all: 16 }),
              background(getNativeDefault("secondaryBackground")),
              cornerRadius(16),
            ]}
          >
            <HStack>
              <Text
                modifiers={[
                  font({ size: 14, weight: "medium" }),
                  foregroundStyle(getNativeDefault("text")),
                ]}
              >
                What gets erased:
              </Text>
              <Spacer />
            </HStack>
            {ERASURE_BULLETS.map((b) => (
              <HStack key={b} spacing={8} alignment="center">
                <Text
                  modifiers={[
                    font({ size: 14 }),
                    foregroundStyle(getNativeDefault("secondaryText")),
                    padding({ leading: 8 }),
                  ]}
                >
                  • {b}
                </Text>
              </HStack>
            ))}
          </VStack>

          <VStack spacing={8} alignment="leading">
            <Text
              modifiers={[
                font({ size: 14 }),
                foregroundStyle(getNativeDefault("secondaryText")),
              ]}
            >
              Type{" "}
              <Text
                modifiers={[
                  font({ weight: "bold" }),
                  foregroundStyle(getNativeDefault("text")),
                ]}
              >
                {CONFIRM_PHRASE}
              </Text>{" "}
              to confirm
            </Text>
            <ZStack
              modifiers={[
                background(getNativeDefault("secondaryBackground")),
                cornerRadius(16),
              ]}
            >
              <TextField
                placeholder={CONFIRM_PHRASE}
                onTextChange={setPhrase}
                modifiers={[
                  font({ size: 16 }),
                  foregroundStyle(getNativeDefault("text")),
                  padding({ horizontal: 14, vertical: 12 }),
                ]}
              />
            </ZStack>
          </VStack>

          {deleteError ? (
            <VStack
              modifiers={[
                padding({ all: 12 }),
                background("rgba(239, 68, 68, 0.1)"),
                cornerRadius(16),
              ]}
            >
              <Text
                modifiers={[font({ size: 12 }), foregroundStyle("#EF4444")]}
              >
                {deleteError}
              </Text>
            </VStack>
          ) : null}

          <Button
            onPress={() => (canConfirm ? handleDeleteAccount() : undefined)}
            modifiers={[
              buttonStyle(
                isGlassAvailable ? "glassProminent" : "borderedProminent",
              ),
              cornerRadius(16),
              frame({ height: 50 }),
            ]}
          >
            <HStack
              spacing={8}
              alignment="center"
              modifiers={[padding({ vertical: 8 })]}
            >
              <Spacer />
              {deleting ? (
                <ProgressView />
              ) : (
                <Text
                  modifiers={[
                    font({ size: 16, weight: "bold" }),
                    foregroundStyle(
                      canConfirm ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)",
                    ),
                  ]}
                >
                  Delete my account
                </Text>
              )}
              <Spacer />
            </HStack>
          </Button>
        </VStack>
      </Group>
    </BottomSheet>
  );
}
