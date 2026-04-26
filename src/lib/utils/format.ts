/**
 * Budget display helpers — used on job cards and detail pages.
 */

import type { BudgetType } from "@prisma/client";

export function formatBudgetDisplay(
  type: BudgetType,
  minPesewas: number | null,
  maxPesewas: number | null
): string {
  const fmt = (p: number) =>
    `GHS ${(p / 100).toLocaleString("en-GH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  switch (type) {
    case "FIXED":
      return minPesewas ? fmt(minPesewas) : "Fixed (amount TBD)";
    case "RANGE":
      if (minPesewas && maxPesewas) return `${fmt(minPesewas)} – ${fmt(maxPesewas)}`;
      if (minPesewas) return `From ${fmt(minPesewas)}`;
      return "Range (TBD)";
    case "REQUEST_QUOTE":
      return "Open to quotes";
  }
}

export function urgencyLabel(urgency: string): string {
  const map: Record<string, string> = {
    URGENT:         "Urgent",
    WITHIN_A_WEEK:  "Within a week",
    WITHIN_A_MONTH: "Within a month",
    FLEXIBLE:       "Flexible",
  };
  return map[urgency] ?? urgency;
}
