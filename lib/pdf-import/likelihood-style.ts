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

export function likelihoodBadgeClass(l: SubscriptionLikelihood): string {
  switch (l) {
    case "high":
      return "bg-emerald-500/20 text-emerald-300";
    case "medium":
      return "bg-amber-500/20 text-amber-300";
    case "low":
      return "bg-zinc-500/20 text-zinc-400";
    case "not":
      return "bg-zinc-700/40 text-zinc-500";
  }
}
