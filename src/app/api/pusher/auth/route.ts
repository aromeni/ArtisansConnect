/**
 * Pusher channel authentication endpoint.
 *
 * Pusher calls this when a client subscribes to a private channel.
 * We validate the session and confirm the user is allowed to access
 * the requested channel before signing.
 */

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPusherServer, channels } from "@/lib/pusher";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserRole } from "@/types";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(
    `pusher:${session.user.id}:${getClientIdentifier(req)}`,
    { limit: 120, windowMs: 60_000 }
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many channel authorization requests." },
      { status: 429 }
    );
  }

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const userId = session.user.id;

  // Only allow access to channels the user owns or participates in
  const isAllowed = await canAccessChannel(channelName, userId, session.user.role);

  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const authResponse = getPusherServer().authorizeChannel(socketId, channelName, {
    user_id: userId,
  });

  return NextResponse.json(authResponse);
}

async function canAccessChannel(
  channel: string,
  userId: string,
  role: UserRole
): Promise<boolean> {
  // Admin can access everything
  if (role === "ADMIN" || role === "SUPER_ADMIN") return true;

  // User notification channel — only the user themselves
  if (channel === channels.user(userId)) return true;

  const jobId = parsePrivateChannelId(channel, "private-job-");
  if (jobId) return canAccessJobChannel(jobId, userId);

  const disputeId = parsePrivateChannelId(channel, "private-dispute-");
  if (disputeId) return canAccessDisputeChannel(disputeId, userId);

  return false;
}

function parsePrivateChannelId(channel: string, prefix: string): string | null {
  if (!channel.startsWith(prefix)) return null;

  const id = channel.slice(prefix.length);
  return /^[a-z0-9]+$/i.test(id) ? id : null;
}

async function canAccessJobChannel(jobId: string, userId: string): Promise<boolean> {
  const job = await db.job.findFirst({
    where: {
      id: jobId,
      OR: [
        { customer: { userId } },
        { interests: { some: { tradesperson: { userId } } } },
        { hire: { tradesperson: { userId } } },
        {
          chatThreads: {
            some: {
              OR: [{ customerId: userId }, { tradespersonId: userId }],
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  return Boolean(job);
}

async function canAccessDisputeChannel(disputeId: string, userId: string): Promise<boolean> {
  const dispute = await db.dispute.findFirst({
    where: {
      id: disputeId,
      OR: [
        { raisedById: userId },
        { resolvedById: userId },
        { job: { customer: { userId } } },
        { hire: { tradesperson: { userId } } },
      ],
    },
    select: { id: true },
  });

  return Boolean(dispute);
}
