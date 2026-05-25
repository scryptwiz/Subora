import type { SubscriptionLikelihood } from "@/types/pdf-import";

export function likelihoodLabel(l: SubscriptionLikelihood): string {
  switch (l) {
    case "high":
      return "Likely sub";
    case "medium":
      return "Maybe sub";
    case "low":
      return "Unlikely";
    case "not":
      return "Not sub";
  }
}

export function likelihoodBadgeContainerClass(
  l: SubscriptionLikelihood,
): string {
  switch (l) {
    case "high":
      return "border border-emerald-400/50 bg-emerald-500/30";
    case "medium":
      return "border border-amber-400/50 bg-amber-500/30";
    case "low":
      return "border border-zinc-400/40 bg-zinc-500/30";
    case "not":
      return "border border-zinc-500/50 bg-zinc-600/40";
  }
}

export function likelihoodBadgeTextClass(l: SubscriptionLikelihood): string {
  switch (l) {
    case "high":
      return "text-emerald-100";
    case "medium":
      return "text-amber-100";
    case "low":
      return "text-zinc-200";
    case "not":
      return "text-zinc-300";
  }
}
