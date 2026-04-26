"use client";

import { useState } from "react";
import { getOnboardingUploadSignature } from "@/server/actions/onboarding";

interface UploadResult {
  publicId: string;
  secureUrl: string;
}

interface UseCloudinaryUploadReturn {
  upload: (file: File, folder?: "ids" | "profiles") => Promise<UploadResult>;
  uploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setUploading(false);
    setProgress(0);
    setError(null);
  }

  async function upload(
    file: File,
    folder: "ids" | "profiles" = "ids"
  ): Promise<UploadResult> {
    setUploading(true);
    setError(null);
    setProgress(0);

    // Validate file before upload
    const MAX = 10 * 1024 * 1024;
    if (file.size > MAX) {
      const msg = "File must be smaller than 10 MB";
      setError(msg);
      setUploading(false);
      throw new Error(msg);
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      const msg = "Only JPG, PNG, and WebP images are accepted";
      setError(msg);
      setUploading(false);
      throw new Error(msg);
    }

    // Get signed upload params from server action
    const signResult = await getOnboardingUploadSignature(folder);
    if (!signResult || "error" in signResult) {
      const msg = signResult?.error ?? "Could not get upload authorisation";
      setError(msg);
      setUploading(false);
      throw new Error(msg);
    }

    const { params } = signResult;

    // Upload directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", params.apiKey);
    formData.append("timestamp", String(params.timestamp));
    formData.append("signature", params.signature);
    formData.append("folder", params.folder);
    if (params.isPrivate) {
      formData.append("type", "private");
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve({ publicId: response.public_id, secureUrl: response.secure_url });
        } else {
          const msg = "Upload failed. Please try again.";
          setError(msg);
          reject(new Error(msg));
        }
      });

      xhr.addEventListener("error", () => {
        setUploading(false);
        const msg = "Upload failed. Check your connection and try again.";
        setError(msg);
        reject(new Error(msg));
      });

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`
      );
      xhr.send(formData);
    });
  }

  return { upload, uploading, progress, error, reset };
}
