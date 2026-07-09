import { avatarColor, initials } from "@/lib/logo";
import {
  mergePreferredUsernameIntoUnsafeMetadata,
  preferredUsernameFromUnsafeMetadata,
  profileDisplayName,
} from "@/lib/profile-display-name";
import { getNativeDefault } from "@/theme/colors";
import { FontFamilies } from "@/theme/typography";
import { isClerkAPIResponseError, useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const { user, isLoaded } = useUser();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const hydratedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!visible) {
      hydratedUserId.current = null;
      return;
    }
    if (!user) return;
    if (hydratedUserId.current === user.id) return;
    hydratedUserId.current = user.id;
    setUsername(
      preferredUsernameFromUnsafeMetadata(user.unsafeMetadata) ||
        user.username ||
        "",
    );
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
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
    const usernameTrimmed = username.trim();
    if (!usernameTrimmed) {
      Alert.alert("Username required", "Add a username before saving.");
      return;
    }
    setSaving(true);
    try {
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
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
      username,
    ),
    username: user.username,
    firstName,
  });

  const previewUri = pickedUri ?? user.imageUrl ?? null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.header,
            { paddingTop: (Platform.OS === "ios" ? 0 : insets.top) + 24 },
          ]}
        >
          <Pressable hitSlop={12} onPress={onClose} accessibilityLabel="Close">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Edit profile</Text>
          <Pressable
            hitSlop={12}
            onPress={() => void handleSave()}
            disabled={saving}
            accessibilityLabel="Save profile"
          >
            {saving ? (
              <ActivityIndicator
                color={getNativeDefault("link")}
                size="small"
              />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: insets.bottom + 24,
            gap: 24,
            paddingTop: 24,
          }}
        >
          <View style={styles.avatarSection}>
            <Pressable
              onPress={() => void pickImage()}
              accessibilityLabel="Change profile photo"
            >
              {previewUri ? (
                <Image
                  key={previewUri}
                  source={{ uri: previewUri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.avatarFallback,
                    { backgroundColor: avatarColor(displayName) },
                  ]}
                >
                  <Text style={styles.avatarFallbackText}>
                    {initials(displayName)}
                  </Text>
                </View>
              )}
              <View style={styles.changePhotoRow}>
                <Feather name="camera" size={16} color="#A3A3A3" />
                <Text style={styles.changePhotoText}>Change photo</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#52525B"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="#52525B"
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor="#52525B"
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getNativeDefault("background"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: getNativeDefault("separator"),
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelText: {
    fontFamily: FontFamilies.medium,
    fontSize: 16,
    color: getNativeDefault("secondaryText"),
  },
  headerTitle: {
    fontFamily: FontFamilies.medium,
    fontSize: 16,
    color: getNativeDefault("text"),
  },
  saveText: {
    fontFamily: FontFamilies.medium,
    fontSize: 16,
    color: getNativeDefault("link"),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: "center",
    gap: 16,
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontFamily: FontFamilies.bold,
    fontSize: 36,
    color: "#FFFFFF",
  },
  changePhotoRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  changePhotoText: {
    fontFamily: FontFamilies.medium,
    fontSize: 14,
    color: getNativeDefault("secondaryText"),
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    paddingHorizontal: 4,
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: getNativeDefault("secondaryText"),
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 16,
    fontFamily: FontFamilies.regular,
    fontSize: 16,
    color: getNativeDefault("text"),
  },
});
