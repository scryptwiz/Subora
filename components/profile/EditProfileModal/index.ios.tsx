import {
  mergePreferredUsernameIntoUnsafeMetadata,
  preferredUsernameFromUnsafeMetadata,
  profileDisplayName,
} from "@/lib/profile-display-name";
import { getNativeDefault } from "@/theme/colors";
import { isClerkAPIResponseError, useUser } from "@clerk/expo";
import {
  BottomSheet,
  Button,
  Group,
  HStack,
  ProgressView,
  Spacer,
  Text,
  TextField,
  VStack,
  ZStack,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  cornerRadius,
  font,
  foregroundStyle,
  frame,
  padding,
  presentationDetents,
  presentationDragIndicator,
} from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

type ClerkUserImage = {
  setProfileImage?: (args: {
    file: { uri: string; name: string; type: string } | FormData;
  }) => Promise<unknown>;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function EditProfileModal({ visible, onClose }: Props) {
  const { user, isLoaded } = useUser();
  const usernameState = useNativeState("");
  const firstNameState = useNativeState("");
  const lastNameState = useNativeState("");
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const hydratedUserId = useRef<string | null>(null);
  const isGlassAvailable = isLiquidGlassAvailable();

  useEffect(() => {
    if (!visible) {
      hydratedUserId.current = null;
      return;
    }
    if (!user) return;
    if (hydratedUserId.current === user.id) return;
    hydratedUserId.current = user.id;
    usernameState.value =
      preferredUsernameFromUnsafeMetadata(user.unsafeMetadata) ||
      user.username ||
      "";
    firstNameState.value = user.firstName ?? "";
    lastNameState.value = user.lastName ?? "";
    setPickedUri(null);
  }, [visible, user]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Photos",
        "Allow photo library access to change your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;
    setPickedUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!user || saving) return;
    const usernameTrimmed = usernameState.value.trim();
    if (!usernameTrimmed) {
      Alert.alert("Username required", "Add a username before saving.");
      return;
    }
    setSaving(true);
    try {
      await user.update({
        firstName: firstNameState.value.trim() || undefined,
        lastName: lastNameState.value.trim() || undefined,
        unsafeMetadata: mergePreferredUsernameIntoUnsafeMetadata(
          user.unsafeMetadata,
          usernameTrimmed,
        ),
      });

      if (pickedUri) {
        const ext = pickedUri.split(".").pop()?.toLowerCase();
        const mime =
          ext === "png"
            ? "image/png"
            : ext === "webp"
              ? "image/webp"
              : "image/jpeg";
        const fileName =
          ext === "png" || ext === "webp" ? `avatar.${ext}` : "avatar.jpg";

        const withImage = user as unknown as ClerkUserImage;
        if (typeof withImage.setProfileImage === "function") {
          await withImage.setProfileImage({
            file: { uri: pickedUri, name: fileName, type: mime },
          });
        } else {
          Alert.alert(
            "Photo not updated",
            "Your name was saved. This build could not upload a new profile photo.",
          );
        }
      }

      await user.reload();
      onClose();
    } catch (e) {
      const msg = isClerkAPIResponseError(e)
        ? (e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message)
        : e instanceof Error
          ? e.message
          : "Could not update profile.";
      Alert.alert("Update failed", msg ?? "Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !user) return null;

  const displayName = profileDisplayName({
    unsafeMetadata: mergePreferredUsernameIntoUnsafeMetadata(
      user.unsafeMetadata,
      usernameState.value,
    ),
    username: user.username,
    firstName: firstNameState.value,
  });

  const previewUri = pickedUri ?? user.imageUrl ?? null;

  return (
    <BottomSheet
      isPresented={visible}
      onIsPresentedChange={(val) => {
        if (!val && !saving) onClose();
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
          <HStack alignment="center">
            <Spacer />
            <Text
              modifiers={[
                font({ size: 20, weight: "bold" }),
                foregroundStyle(getNativeDefault("text")),
              ]}
            >
              Edit profile
            </Text>
            <Spacer />
          </HStack>

          {/* Username Field */}
          <VStack spacing={8} alignment="leading">
            <Text
              modifiers={[
                font({ size: 12 }),
                foregroundStyle(getNativeDefault("secondaryText")),
              ]}
            >
              USERNAME
            </Text>
            <ZStack
              modifiers={[
                background(getNativeDefault("secondaryBackground")),
                cornerRadius(16),
              ]}
            >
              <TextField
                placeholder="Username"
                text={usernameState}
                onTextChange={(val) => {
                  usernameState.value = val;
                }}
                // editable={!saving}
                modifiers={[
                  font({ size: 16 }),
                  foregroundStyle(getNativeDefault("text")),
                  padding({ horizontal: 14, vertical: 12 }),
                ]}
              />
            </ZStack>
          </VStack>

          {/* First Name Field */}
          <VStack spacing={8} alignment="leading">
            <Text
              modifiers={[
                font({ size: 12 }),
                foregroundStyle(getNativeDefault("secondaryText")),
              ]}
            >
              FIRST NAME
            </Text>
            <ZStack
              modifiers={[
                background(getNativeDefault("secondaryBackground")),
                cornerRadius(16),
              ]}
            >
              <TextField
                placeholder="First name"
                text={firstNameState}
                onTextChange={(val) => {
                  firstNameState.value = val;
                }}
                // editable={!saving}
                modifiers={[
                  font({ size: 16 }),
                  foregroundStyle(getNativeDefault("text")),
                  padding({ horizontal: 14, vertical: 12 }),
                ]}
              />
            </ZStack>
          </VStack>

          {/* Last Name Field */}
          <VStack spacing={8} alignment="leading">
            <Text
              modifiers={[
                font({ size: 12 }),
                foregroundStyle(getNativeDefault("secondaryText")),
              ]}
            >
              LAST NAME
            </Text>
            <ZStack
              modifiers={[
                background(getNativeDefault("secondaryBackground")),
                cornerRadius(16),
              ]}
            >
              <TextField
                placeholder="Last name"
                text={lastNameState}
                onTextChange={(val) => {
                  lastNameState.value = val;
                }}
                // editable={!saving}
                modifiers={[
                  font({ size: 16 }),
                  foregroundStyle(getNativeDefault("text")),
                  padding({ horizontal: 14, vertical: 12 }),
                ]}
              />
            </ZStack>
          </VStack>

          {/* Save Changes Button */}
          <Button
            onPress={() => !saving && handleSave()}
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
              {saving ? (
                <ProgressView />
              ) : (
                <Text
                  modifiers={[
                    font({ size: 16, weight: "bold" }),
                    foregroundStyle("#FFFFFF"),
                  ]}
                >
                  Save changes
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
