import { useUser } from "@clerk/expo";

// Generates a consistent DiceBear fun avatar URL from a seed (user ID or username).
export function getFunAvatarUrl(
  seed?: string | null,
  style: "fun-emoji" | "lorelei" = "fun-emoji",
): string {
  const cleanSeed = encodeURIComponent(seed?.trim() || "default-user");
  return `https://api.dicebear.com/10.x/${style}/svg?seed=${cleanSeed}`;
}

export function useFunAvatar(
  style: "fun-emoji" | "lorelei" = "fun-emoji",
): string {
  const { user } = useUser();
  const seed = user?.id || user?.username || user?.fullName || "default-user";
  return getFunAvatarUrl(seed, style);
}
