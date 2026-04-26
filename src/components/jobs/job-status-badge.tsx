import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@prisma/client";

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "muted" }
> = {
  DRAFT:             { label: "Draft",       variant: "muted" },
  OPEN:              { label: "Open",        variant: "success" },
  MATCHED:           { label: "Matched",     variant: "default" },
  SHORTLISTED:       { label: "Shortlisted", variant: "default" },
  HIRED:             { label: "Hired",       variant: "warning" },
  IN_PROGRESS:       { label: "In Progress", variant: "warning" },
  COMPLETED:         { label: "Completed",   variant: "success" },
  CANCELLED:         { label: "Cancelled",   variant: "destructive" },
  DISPUTED:          { label: "Disputed",    variant: "destructive" },
  CLOSED:            { label: "Closed",      variant: "muted" },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
