/**
 * Pusher Channels — real-time messaging abstraction.
 *
 * Server-side: Pusher SDK triggers events after DB writes.
 * Client-side: pusher-js subscribes to private channels.
 *
 * Channel naming conventions:
 *   private-job-{jobId}          → job-scoped chat thread
 *   private-user-{userId}        → user-level notifications
 *   private-dispute-{disputeId}  → dispute case updates
 *   private-admin                → admin-wide events
 */

import PusherServer from "pusher";
import PusherClient from "pusher-js";

// ─── Server-side Pusher instance ──────────────────────────────────────────────

let pusherServer: PusherServer | null = null;

export function getPusherServer(): PusherServer {
  if (!pusherServer) {
    pusherServer = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return pusherServer;
}

// ─── Client-side Pusher instance ─────────────────────────────────────────────

let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error("getPusherClient() must be called on the client side");
  }

  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });
  }
  return pusherClient;
}

// ─── Channel name helpers ─────────────────────────────────────────────────────

export const channels = {
  job: (jobId: string) => `private-job-${jobId}`,
  user: (userId: string) => `private-user-${userId}`,
  dispute: (disputeId: string) => `private-dispute-${disputeId}`,
  admin: () => "private-admin",
};

// ─── Event names ──────────────────────────────────────────────────────────────

export const events = {
  // Chat
  NEW_MESSAGE: "new-message",
  MESSAGE_READ: "message-read",
  // Job
  JOB_STATUS_CHANGED: "job-status-changed",
  INTEREST_RECEIVED: "interest-received",
  // Payment
  PAYMENT_CONFIRMED: "payment-confirmed",
  PAYOUT_SENT: "payout-sent",
  // Dispute
  DISPUTE_UPDATED: "dispute-updated",
  // Notification
  NOTIFICATION: "notification",
};

// ─── Trigger helpers ──────────────────────────────────────────────────────────

export async function triggerJobEvent(
  jobId: string,
  event: string,
  data: object
): Promise<void> {
  await getPusherServer().trigger(channels.job(jobId), event, data);
}

export async function triggerUserEvent(
  userId: string,
  event: string,
  data: object
): Promise<void> {
  await getPusherServer().trigger(channels.user(userId), event, data);
}

export async function triggerDisputeEvent(
  disputeId: string,
  event: string,
  data: object
): Promise<void> {
  await getPusherServer().trigger(channels.dispute(disputeId), event, data);
}
