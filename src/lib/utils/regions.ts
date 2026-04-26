/**
 * Ghana regions — display-friendly labels mapped to Prisma enum values.
 */

export const GHANA_REGIONS_DISPLAY = [
  { value: "GREATER_ACCRA", label: "Greater Accra" },
  { value: "ASHANTI", label: "Ashanti" },
  { value: "WESTERN", label: "Western" },
  { value: "EASTERN", label: "Eastern" },
  { value: "CENTRAL", label: "Central" },
  { value: "VOLTA", label: "Volta" },
  { value: "NORTHERN", label: "Northern" },
  { value: "UPPER_EAST", label: "Upper East" },
  { value: "UPPER_WEST", label: "Upper West" },
  { value: "BRONG_AHAFO", label: "Brong-Ahafo" },
  { value: "OTI", label: "Oti" },
  { value: "AHAFO", label: "Ahafo" },
  { value: "BONO_EAST", label: "Bono East" },
  { value: "NORTH_EAST", label: "North East" },
  { value: "SAVANNAH", label: "Savannah" },
  { value: "WESTERN_NORTH", label: "Western North" },
] as const;

export function regionLabel(value: string): string {
  return GHANA_REGIONS_DISPLAY.find((r) => r.value === value)?.label ?? value;
}
