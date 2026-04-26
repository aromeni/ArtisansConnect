/**
 * Cloudinary storage abstraction.
 *
 * All file uploads go through the server — the Cloudinary API secret
 * is never exposed to the client. The client requests a signed upload
 * URL from /api/uploads/sign, then uploads directly to Cloudinary.
 *
 * Folder strategy:
 *   buildersconnect/profiles/     → public profile photos
 *   buildersconnect/ids/          → Ghana Card images (PRIVATE)
 *   buildersconnect/qualifications/ → certification docs (PRIVATE)
 *   buildersconnect/portfolio/    → tradesperson project images (public)
 *   buildersconnect/jobs/         → job posting images (public)
 *   buildersconnect/disputes/     → dispute evidence (PRIVATE)
 *   buildersconnect/chat/         → chat image attachments (restricted)
 */

import { v2 as cloudinary } from "cloudinary";
import type { UploadFolder, UploadResult } from "@/types";

// Private folders — these assets require signed URLs to access
const PRIVATE_FOLDERS: UploadFolder[] = ["ids", "qualifications", "disputes"];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

/**
 * Generate a signed upload preset for the client to upload directly.
 * Called by /api/uploads/sign route.
 */
export async function generateSignedUploadParams(
  folder: UploadFolder,
  options: { maxBytes?: number; allowedFormats?: string[] } = {}
) {
  const timestamp = Math.round(Date.now() / 1000);
  const isPrivate = PRIVATE_FOLDERS.includes(folder);

  const paramsToSign: Record<string, string | number | boolean> = {
    timestamp,
    folder: `buildersconnect/${folder}`,
    ...(isPrivate && { type: "private" }),
    ...(options.maxBytes && { max_bytes: options.maxBytes }),
    ...(options.allowedFormats && {
      allowed_formats: options.allowedFormats.join(","),
    }),
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder: `buildersconnect/${folder}`,
    isPrivate,
  };
}

/**
 * Generate a short-lived signed URL for accessing a private asset.
 * Use for Ghana Card images and qualification docs shown to admins.
 */
export function getSignedUrl(
  publicId: string,
  expiresInSeconds = 3600
): string {
  return cloudinary.url(publicId, {
    type: "private",
    sign_url: true,
    expires_at: Math.round(Date.now() / 1000) + expiresInSeconds,
    secure: true,
  });
}

/**
 * Delete an asset from Cloudinary.
 * Used when a user replaces an ID document or deletes their account.
 */
export async function deleteAsset(
  publicId: string,
  isPrivate = false
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    type: isPrivate ? "private" : "upload",
    invalidate: true,
  });
}

/**
 * Server-side upload (for small files like profile photos during onboarding).
 * For large files, use the signed upload flow.
 */
export async function uploadBuffer(
  buffer: Buffer,
  folder: UploadFolder,
  options: { publicId?: string; transformation?: object } = {}
): Promise<UploadResult> {
  const isPrivate = PRIVATE_FOLDERS.includes(folder);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `buildersconnect/${folder}`,
        type: isPrivate ? "private" : "upload",
        overwrite: true,
        ...(options.publicId && { public_id: options.publicId }),
        ...(options.transformation && { transformation: options.transformation }),
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          isPrivate,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}

export { cloudinary };
