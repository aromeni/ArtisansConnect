import { GhanaRegion, JobStatus, UrgencyLevel } from "@prisma/client";

export function parseEnumParam<T extends Record<string, string>>(
  enumObject: T,
  value: string | undefined
): T[keyof T] | undefined {
  if (!value) return undefined;

  const values = Object.values(enumObject) as T[keyof T][];
  return values.includes(value as T[keyof T]) ? (value as T[keyof T]) : undefined;
}

export function parseGhanaRegion(value: string | undefined): GhanaRegion | undefined {
  return parseEnumParam(GhanaRegion, value);
}

export function parseJobStatus(value: string | undefined): JobStatus | undefined {
  return parseEnumParam(JobStatus, value);
}

export function parseUrgencyLevel(value: string | undefined): UrgencyLevel | undefined {
  return parseEnumParam(UrgencyLevel, value);
}
