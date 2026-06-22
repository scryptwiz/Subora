import { deleteAccount } from "@/lib/delete-account";
import {
  isClerkAPIResponseError,
  useAuth,
  useClerk,
  useUser,
} from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { useSupabase } from "./use-supabase";

export function useProfileActions() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { userId } = useAuth();
  const supabase = useSupabase();

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount({ supabase, user, userId });
      try {
        await signOut();
      } catch {
        // user is already gone server-side; ignore stale session errors
      }
      setDeleteOpen(false);
      router.replace("/(auth)/sign-in");
    } catch (e) {
      const msg = isClerkAPIResponseError(e)
        ? (e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message)
        : e instanceof Error
          ? e.message
          : "Could not delete your account.";
      setDeleteError(msg ?? "Could not delete your account.");
    } finally {
      setDeleting(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert("Sign out", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return {
    deleting,
    deleteError,
    deleteOpen,
    setDeleteOpen,
    setDeleteError,
    handleDeleteAccount,
    confirmSignOut,
  };
}
