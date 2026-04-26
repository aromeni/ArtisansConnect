/**
 * Paystack payment abstraction.
 *
 * Paystack is Ghana's leading payment processor.
 * Supports: GHS, card payments, mobile money (MTN MoMo, Vodafone Cash, AirtelTigo Money).
 *
 * Commission model (all values in pesewas):
 *   Gross = customer payment
 *   Commission = 10% platform fee
 *   PSP fee = ~1.5% Paystack fee (approximate — deducted by Paystack from settlement)
 *   Net payout = Gross - Commission - PSP fee
 *
 * Fund flow:
 *   1. Customer pays → Paystack → platform's Paystack account
 *   2. Platform records a PaymentHold (funds reserved for tradesperson)
 *   3. On job completion → platform initiates Paystack Transfer to tradesperson's account
 *   4. On dispute → transfer is withheld until resolved
 *
 * Note: This is a "platform-controlled hold/release" model.
 * Full escrow (third-party trust account) requires additional Bank of Ghana licensing.
 */

const PAYSTACK_BASE = "https://api.paystack.co";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

async function paystackRequest<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: object
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message ?? "Paystack request failed");
  }
  return json.data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaystackTransaction {
  reference: string;
  access_code: string;
  authorization_url: string;
}

export interface PaystackTransactionVerification {
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number; // in kobo (Paystack uses kobo, same as pesewas for GHS)
  currency: string;
  paid_at: string;
  channel: string;
  customer: {
    email: string;
    phone: string | null;
  };
  metadata: Record<string, unknown>;
}

export interface PaystackTransferRecipient {
  recipient_code: string;
  name: string;
  type: "mobile_money" | "ghipss";
  currency: string;
  details: {
    account_number: string;
    bank_code?: string;
  };
}

export interface PaystackTransfer {
  transfer_code: string;
  status: "otp" | "pending" | "success" | "failed";
  amount: number;
  reference: string;
}

// ─── Initialise a payment ─────────────────────────────────────────────────────

export async function initializeTransaction({
  email,
  amountPesewas,
  reference,
  callbackUrl,
  metadata,
  channels,
}: {
  email: string;
  amountPesewas: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
  channels?: ("card" | "mobile_money" | "bank" | "ussd")[];
}): Promise<PaystackTransaction> {
  return paystackRequest<PaystackTransaction>("POST", "/transaction/initialize", {
    email,
    amount: amountPesewas, // Paystack uses kobo/pesewas (smallest denomination)
    currency: "GHS",
    reference,
    callback_url: callbackUrl,
    metadata,
    channels: channels ?? ["card", "mobile_money"],
  });
}

// ─── Verify a payment ─────────────────────────────────────────────────────────

export async function verifyTransaction(
  reference: string
): Promise<PaystackTransactionVerification> {
  return paystackRequest<PaystackTransactionVerification>(
    "GET",
    `/transaction/verify/${reference}`
  );
}

// ─── Create a transfer recipient (tradesperson's payout account) ──────────────

export async function createTransferRecipient({
  name,
  accountNumber,
  bankCode,
  type = "mobile_money",
}: {
  name: string;
  accountNumber: string; // mobile money number or bank account number
  bankCode?: string;
  type?: "mobile_money" | "ghipss";
}): Promise<PaystackTransferRecipient> {
  return paystackRequest<PaystackTransferRecipient>("POST", "/transferrecipient", {
    type,
    name,
    account_number: accountNumber,
    ...(bankCode && { bank_code: bankCode }),
    currency: "GHS",
  });
}

// ─── Initiate a payout transfer ───────────────────────────────────────────────

export async function initiateTransfer({
  amountPesewas,
  recipientCode,
  reference,
  reason,
}: {
  amountPesewas: number;
  recipientCode: string;
  reference: string;
  reason: string;
}): Promise<PaystackTransfer> {
  return paystackRequest<PaystackTransfer>("POST", "/transfer", {
    source: "balance",
    amount: amountPesewas,
    recipient: recipientCode,
    reference,
    reason,
    currency: "GHS",
  });
}

// ─── Verify a webhook signature ───────────────────────────────────────────────

import crypto from "crypto";

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

// ─── Refund ───────────────────────────────────────────────────────────────────

export async function refundTransaction({
  transactionReference,
  amountPesewas,
}: {
  transactionReference: string;
  amountPesewas?: number; // omit for full refund
}): Promise<{ status: string; refund_id: number }> {
  return paystackRequest("POST", "/refund", {
    transaction: transactionReference,
    ...(amountPesewas && { amount: amountPesewas }),
    currency: "GHS",
  });
}
