import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobStatusBadge } from "./job-status-badge";
import { formatBudgetDisplay, urgencyLabel } from "@/lib/utils/format";
import { MapPin, Clock, Users, Calendar } from "lucide-react";
import type { BudgetType, JobStatus, UrgencyLevel } from "@prisma/client";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    region: string;
    city: string | null;
    budgetType: BudgetType;
    budgetMin: number | null;
    budgetMax: number | null;
    urgency: UrgencyLevel;
    status: JobStatus;
    interestCount: number;
    publishedAt: Date | null;
    category: { name: string; color: string | null };
    images: { url: string }[];
  };
  href: string;
  /** Show my interest status — for tradesperson view */
  myInterest?: { status: string } | null;
}

export function JobCard({ job, href, myInterest }: JobCardProps) {
  const budget = formatBudgetDisplay(job.budgetType, job.budgetMin, job.budgetMax);
  const urgency = urgencyLabel(job.urgency);
  const isUrgent = job.urgency === "URGENT";

  return (
    <Link href={href}>
      <Card className="hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer h-full">
        {job.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.images[0].url}
            alt={job.title}
            className="w-full h-36 object-cover rounded-t-lg"
          />
        )}
        <CardContent className="pt-4 pb-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {job.category.name}
                </Badge>
                {isUrgent && (
                  <Badge variant="destructive" className="text-xs">Urgent</Badge>
                )}
                {myInterest && (
                  <Badge
                    variant={
                      myInterest.status === "HIRED"
                        ? "success"
                        : myInterest.status === "SHORTLISTED"
                        ? "warning"
                        : myInterest.status === "DECLINED" || myInterest.status === "WITHDRAWN"
                        ? "destructive"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {myInterest.status === "PENDING"
                      ? "Applied"
                      : myInterest.status === "SHORTLISTED"
                      ? "Shortlisted"
                      : myInterest.status === "HIRED"
                      ? "Hired"
                      : myInterest.status === "DECLINED"
                      ? "Not selected"
                      : "Withdrawn"}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-sm leading-snug line-clamp-2">{job.title}</h3>
            </div>
            <JobStatusBadge status={job.status} />
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {job.city ? `${job.city}, ` : ""}
              {job.region.replace(/_/g, " ")}
            </span>
            <span className="flex items-center gap-1 font-medium text-foreground">
              {budget}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {urgency}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {job.interestCount} interested
            </span>
            {job.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(job.publishedAt).toLocaleDateString("en-GH", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
