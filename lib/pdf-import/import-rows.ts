import type {
  ImportFilter,
  ImportRowState,
  ParsedStatementLine,
} from "@/types/pdf-import";

export function defaultSelectedForLikelihood(
  likelihood: ParsedStatementLine["subscriptionLikelihood"],
): boolean {
  return likelihood === "high" || likelihood === "medium";
}

export function toImportRows(lines: ParsedStatementLine[]): ImportRowState[] {
  return lines.map((line) => ({
    line,
    selected: defaultSelectedForLikelihood(line.subscriptionLikelihood),
    removed: false,
  }));
}

export function filterImportRows(
  rows: ImportRowState[],
  filter: ImportFilter,
): ImportRowState[] {
  const visible = rows.filter((r) => !r.removed);
  if (filter === "all") return visible;
  if (filter === "suggested") {
    return visible.filter(
      (r) =>
        r.line.subscriptionLikelihood === "high" ||
        r.line.subscriptionLikelihood === "medium",
    );
  }
  return visible.filter(
    (r) =>
      r.line.subscriptionLikelihood === "low" ||
      r.line.subscriptionLikelihood === "not",
  );
}

export function countSelected(rows: ImportRowState[]): number {
  return rows.filter((r) => !r.removed && r.selected).length;
}
