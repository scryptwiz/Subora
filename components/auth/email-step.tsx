import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type EmailStepProps = {
  onSubmit: (email: string) => void;
  loading: boolean;
  error: string | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailStep({ onSubmit, loading, error }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const inputRef = useRef<TextInput>(null);

  const isValid = EMAIL_REGEX.test(email.trim());

  const handleContinue = () => {
    if (!isValid || loading) return;
    Keyboard.dismiss();
    onSubmit(email.trim().toLowerCase());
  };

  return (
    <View className="flex-1 px-6 pt-8">
      {/* Heading */}
      <Text className="text-3xl text-white font-inter-bold">
        Enter your email
      </Text>
      <Text className="mt-2 text-base text-neutral-400 font-inter">
        We’ll email you a sign‑in code.
      </Text>

      {/* Input */}
      <View className="mt-8">
        <TextInput
          ref={inputRef}
          className="h-16 rounded-2xl border border-[#27272A] bg-[#14141A] px-5 text-lg text-white font-inter"
          placeholder="name@example.com"
          placeholderTextColor="#525252"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={handleContinue}
          editable={!loading}
        />
      </View>

      {/* Error message */}
      {error && (
        <View className="mt-3 rounded-xl bg-red-500/10 px-4 py-3">
          <Text className="text-sm text-red-400 font-inter-medium">
            {error}
          </Text>
        </View>
      )}

      {/* Continue button */}
      <Pressable
        className={`mt-6 h-16 items-center justify-center rounded-2xl ${isValid && !loading ? "bg-white" : "bg-white/20"
          }`}
        style={({ pressed }) =>
          pressed && isValid ? { opacity: 0.85 } : undefined
        }
        onPress={handleContinue}
        disabled={!isValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#111111" />
        ) : (
          <Text
            className={`text-xl font-inter-medium ${isValid ? "text-[#111111]" : "text-neutral-500"
              }`}
          >
            Continue
          </Text>
        )}
      </Pressable>
    </View>
  );
}
