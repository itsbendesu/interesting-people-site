"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface UploadedVideo {
  key: string;
  publicUrl: string;
  durationSec: number;
  file: File;
}

interface VideoUploaderProps {
  email: string;
  maxDurationSec?: number;
  onUploadComplete: (video: UploadedVideo) => void;
  onError: (error: string) => void;
}

type UploadState = "idle" | "validating" | "uploading" | "complete" | "error";

export default function VideoUploader({
  email,
  maxDurationSec = 120,
  onUploadComplete,
  onError,
}: VideoUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Revoke object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
  const MAX_SIZE_MB = 500;

  const resetState = useCallback(() => {
    setState("idle");
    setProgress(0);
    setError(null);
    setUploadedVideo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [previewUrl]);

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration === Infinity || isNaN(video.duration)) {
          reject(new Error("Could not determine video duration"));
        } else {
          resolve(video.duration);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Failed to load video file"));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const validateFile = async (file: File): Promise<{ valid: boolean; duration?: number; error?: string }> => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Please upload MP4, MOV, or WebM.`,
      };
    }

    // Check file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${MAX_SIZE_MB}MB.`,
      };
    }

    // Check duration. iOS Safari sometimes can't read .mov metadata; if so, allow upload.
    try {
      const duration = await getVideoDuration(file);
      if (duration > maxDurationSec) {
        return {
          valid: false,
          error: `Video too long (${Math.round(duration)}s). Maximum is ${maxDurationSec} seconds.`,
        };
      }
      return { valid: true, duration };
    } catch {
      // If duration probe fails (common on iOS Safari for .mov), let it through
      // and rely on server-side validation. Better than blocking valid uploads.
      return { valid: true, duration: 0 };
    }
  };

  const uploadFile = async (file: File, duration: number) => {
    setState("uploading");
    setProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      // Step 1: Get presigned URL
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: file.type,
          contentLength: file.size,
          fileName: file.name,
          email,
          durationSec: duration,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!presignRes.ok) {
        const data = await presignRes.json();
        throw new Error(data.error || "Failed to prepare upload");
      }

      const { uploadUrl, key, publicUrl } = await presignRes.json();

      // Step 2: Upload directly to R2
      await uploadWithProgress(uploadUrl, file, abortControllerRef.current.signal);

      // Step 3: Success
      const result: UploadedVideo = {
        key,
        publicUrl,
        durationSec: duration,
        file,
      };

      setUploadedVideo(result);
      setPreviewUrl(URL.createObjectURL(file));
      setState("complete");
      onUploadComplete(result);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        resetState();
        return;
      }

      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setState("error");
      onError(message);
    }
  };

  const uploadWithProgress = async (url: string, file: File, signal: AbortSignal): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      signal.addEventListener("abort", () => {
        xhr.abort();
      });

      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  const handleFile = async (file: File) => {
    resetState();
    setState("validating");

    const validation = await validateFile(file);

    if (!validation.valid) {
      setError(validation.error!);
      setState("error");
      onError(validation.error!);
      return;
    }

    await uploadFile(file, validation.duration!);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [email]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetState();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // Render complete state with preview
  if (state === "complete" && uploadedVideo && previewUrl) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-green-800">Video uploaded!</p>
            <p className="text-sm text-green-600 truncate">
              {uploadedVideo.file.name} ({Math.round(uploadedVideo.durationSec)}s)
            </p>
          </div>
        </div>

        <video
          src={previewUrl}
          controls
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          className="w-full rounded-lg bg-black aspect-video"
        />

        <button
          onClick={resetState}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Upload a different video
        </button>
      </div>
    );
  }

  // Render error state
  if (state === "error") {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-800">Upload failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>

        <button
          onClick={resetState}
          className="w-full min-h-[48px] py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 font-medium touch-manipulation"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Render uploading state
  if (state === "uploading" || state === "validating") {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {state === "validating" ? "Validating video..." : "Uploading..."}
            </span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state === "validating" ? 0 : progress}%` }}
            />
          </div>

          {state === "uploading" && (
            <>
              <p className="mt-3 text-xs text-gray-500">
                Keep this tab open. Don&apos;t close the browser until upload finishes.
              </p>
              <button
                onClick={handleCancel}
                className="mt-3 min-h-[44px] px-3 py-2 text-sm text-gray-500 hover:text-gray-700 active:text-gray-900 touch-manipulation"
              >
                Cancel upload
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Render idle/drop zone state
  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/*"
        capture="user"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div>
          <p className="text-gray-700 font-medium hidden sm:block">
            Drag and drop your video here
          </p>
          <p className="text-gray-700 font-medium sm:hidden">
            Choose a video to upload
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center min-h-[48px] px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 font-medium touch-manipulation"
            >
              Browse to upload
            </button>
          </p>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>MP4, MOV, or WebM up to {MAX_SIZE_MB}MB</p>
          <p>Maximum duration: {maxDurationSec} seconds</p>
        </div>
      </div>
    </div>
  );
}
