/**
 * Email service abstraction using Resend.
 *
 * All transactional emails are sent from this module.
 * React Email components live in src/emails/ (added in Phase 11).
 * For Phase 1, we use simple HTML templates to keep the abstraction clean.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "BuildersConnect <hello@buildersconnect.gh>";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

// ─── Core send ────────────────────────────────────────────────────────────────

async function sendEmail(payload: EmailPayload): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log("[EMAIL]", payload.subject, "→", payload.to);
    return; // Don't send real emails in development
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      ...(payload.replyTo && { reply_to: payload.replyTo }),
    });
  } catch (err) {
    console.error("[EMAIL ERROR]", err);
    // Don't throw — email failure should not break the primary flow
  }
}

// ─── Transactional emails ─────────────────────────────────────────────────────

export async function sendWelcomeEmail({
  to,
  name,
  role,
}: {
  to: string;
  name: string;
  role: "customer" | "tradesperson";
}): Promise<void> {
  await sendEmail({
    to,
    subject: "Welcome to BuildersConnect!",
    html: `
      <h2>Welcome to BuildersConnect, ${name}!</h2>
      <p>You've joined Ghana's trusted marketplace for home services.</p>
      ${role === "tradesperson"
        ? "<p>Complete your profile to start receiving job leads.</p>"
        : "<p>Post your first job and get quotes from verified tradespeople.</p>"
      }
      <p>The BuildersConnect Team</p>
    `,
  });
}

export async function sendVerificationApprovedEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: "Your identity has been verified ✓",
    html: `
      <h2>You're verified, ${name}!</h2>
      <p>Your Ghana Card verification has been approved. Your verified badge is now visible on your profile.</p>
      <p>The BuildersConnect Team</p>
    `,
  });
}

export async function sendJobInterestEmail({
  to,
  customerName,
  jobTitle,
  tradespersonName,
}: {
  to: string;
  customerName: string;
  jobTitle: string;
  tradespersonName: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: `${tradespersonName} is interested in your job`,
    html: `
      <h2>Hi ${customerName},</h2>
      <p><strong>${tradespersonName}</strong> has expressed interest in your job: <em>${jobTitle}</em>.</p>
      <p>Log in to compare proposals and hire.</p>
      <p>The BuildersConnect Team</p>
    `,
  });
}

export async function sendHiredEmail({
  to,
  tradespersonName,
  jobTitle,
}: {
  to: string;
  tradespersonName: string;
  jobTitle: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: `You've been hired for: ${jobTitle}`,
    html: `
      <h2>Congratulations, ${tradespersonName}!</h2>
      <p>You've been selected for the job: <em>${jobTitle}</em>.</p>
      <p>Log in to confirm details and get started.</p>
      <p>The BuildersConnect Team</p>
    `,
  });
}

export async function sendPaymentConfirmedEmail({
  to,
  name,
  amountFormatted,
  jobTitle,
}: {
  to: string;
  name: string;
  amountFormatted: string;
  jobTitle: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: `Payment confirmed — ${jobTitle}`,
    html: `
      <h2>Payment confirmed</h2>
      <p>Hi ${name},</p>
      <p>Your payment of <strong>${amountFormatted}</strong> for <em>${jobTitle}</em> has been received and is held securely until job completion.</p>
      <p>The BuildersConnect Team</p>
    `,
  });
}

export async function sendDisputeOpenedEmail({
  to,
  name,
  jobTitle,
  disputeId,
}: {
  to: string;
  name: string;
  jobTitle: string;
  disputeId: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: `Dispute opened — ${jobTitle}`,
    html: `
      <h2>A dispute has been opened</h2>
      <p>Hi ${name},</p>
      <p>A dispute (Case #${disputeId.slice(0, 8).toUpperCase()}) has been opened for job: <em>${jobTitle}</em>.</p>
      <p>Our resolution team will review the case and reach out within 2 business days.</p>
      <p>The BuildersConnect Team</p>
    `,
  });
}

export async function sendPayoutSentEmail({
  to,
  tradespersonName,
  amountFormatted,
  jobTitle,
}: {
  to: string;
  tradespersonName: string;
  amountFormatted: string;
  jobTitle: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: `Payout sent — ${amountFormatted}`,
    html: `
      <h2>Your payout is on its way!</h2>
      <p>Hi ${tradespersonName},</p>
      <p><strong>${amountFormatted}</strong> has been sent to your registered account for completing: <em>${jobTitle}</em>.</p>
      <p>The BuildersConnect Team</p>
    `,
  });
}
