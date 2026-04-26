/**
 * Signed upload endpoint.
 *
 * Clients request a signed upload URL from here before uploading
 * directly to Cloudinary. This keeps the API secret server-side.
 *
 * POST /api/uploads/sign
 * Body: { folder: UploadFolder }
 * Returns: { signature, timestamp, cloudName, apiKey, folder }
 */

import { auth } from "@/lib/auth";
import { generateSignedUploadParams } from "@/lib/storage/cloudinary";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UploadFolder } from "@/types";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";

const ALLOWED_FOLDERS: UploadFolder[] = [
  "profiles",
  "portfolio",
  "jobs",
  "chat",
];

// Admins can sign uploads to private folders
const ADMIN_ONLY_FOLDERS: UploadFolder[] = ["ids", "qualifications", "disputes"];

const schema = z.object({
  folder: z.enum([
    "profiles", "ids", "qualifications", "portfolio", "jobs", "disputes", "chat",
  ]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(
    `uploads:${session.user.id}:${getClientIdentifier(req)}`,
    { limit: 30, windowMs: 60_000 }
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many upload requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const { folder } = parsed.data;
  const role = session.user.role;

  // Only admins can get sign tokens for private/sensitive folders via this endpoint
  // Tradespeople uploading their own IDs go through the onboarding flow which
  // has its own validated server action — not this generic endpoint
  if (
    ADMIN_ONLY_FOLDERS.includes(folder) &&
    role !== "ADMIN" &&
    role !== "SUPER_ADMIN"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!ALLOWED_FOLDERS.includes(folder) && !ADMIN_ONLY_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const params = await generateSignedUploadParams(folder, {
    maxBytes: 10 * 1024 * 1024, // 10 MB
    allowedFormats: ["jpg", "jpeg", "png", "webp", "pdf"],
  });

  return NextResponse.json(params);
}
