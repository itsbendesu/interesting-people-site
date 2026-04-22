"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Prompt {
  id: string;
  text: string;
}

interface ApplicationData {
  id: string;
  name: string;
  email: string;
  prompts: Prompt[];
  expiresAt: string;
}


function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

function getExtensionForMimeType(mimeType: string): string {
  if (mimeType.startsWith("video/mp4")) return "mp4";
  return "webm";
}

export default function UploadPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hasStarted, setHasStarted] = useState(false);

  // Recording state
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);
  const mimeTypeRef = useRef("");

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const MAX_DURATION = 90;
  const PROMPT_DURATION = 45; // Each prompt shown for 45 seconds

  // Fetch application data
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch(`/api/apply/${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Application not found");
        }

        setApplication(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [token, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  // Attach stream to video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setStream(mediaStream);
      setError(null);
      setHasStarted(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Camera access was denied. Please check your browser's site settings, allow camera and microphone access, then refresh the page.");
      } else {
        setError("Could not access camera. Please make sure no other app is using your camera, then try again.");
      }
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startRecording = useCallback(() => {
    if (!stream) return;

    chunksRef.current = [];
    setDuration(0);
    setCurrentPromptIndex(0);
    setRecordedBlob(null);

    const supportedMimeType = getSupportedMimeType();
    mimeTypeRef.current = supportedMimeType;

    const recorderOptions: MediaRecorderOptions = {};
    if (supportedMimeType) {
      recorderOptions.mimeType = supportedMimeType;
    }

    const mediaRecorder = new MediaRecorder(stream, recorderOptions);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: supportedMimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      stopCamera();

      // Get actual duration from blob metadata instead of relying on interval timer
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      tempVideo.onloadedmetadata = () => {
        if (tempVideo.duration && isFinite(tempVideo.duration)) {
          setVideoDuration(Math.round(tempVideo.duration));
        }
      };
      tempVideo.src = url;
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
    setIsRecording(true);
    isRecordingRef.current = true;

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed++;
      setDuration(elapsed);

      // Cycle to next prompt every PROMPT_DURATION seconds
      const newPromptIndex = Math.min(
        Math.floor(elapsed / PROMPT_DURATION),
        (application?.prompts.length || 1) - 1
      );
      setCurrentPromptIndex(newPromptIndex);

      if (elapsed >= MAX_DURATION) {
        // Stop recording - use refs to avoid stale closure
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setVideoDuration(elapsed);
        if (mediaRecorderRef.current && isRecordingRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          isRecordingRef.current = false;
        }
      }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, stopCamera, application?.prompts.length]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      setVideoDuration(duration);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [duration]);

  const uploadRecordedVideo = async (): Promise<{ key: string; url: string } | null> => {
    if (!recordedBlob) return null;

    const contentType = (mimeTypeRef.current || "video/webm").split(";")[0];
    const ext = getExtensionForMimeType(contentType);
    const filename = `recording.${ext}`;

    try {
      // Check if we should use local mode
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          fileName: filename,
          contentType,
          contentLength: recordedBlob.size || 1,
          email: application?.email || "unknown@unknown.com",
          durationSec: Math.max(1, Math.round(videoDuration || duration || 1)),
        }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json();
        throw new Error(data.error || "Failed to get upload URL");
      }

      const presignData = await presignRes.json();

      // Handle local upload mode (development)
      if (presignData.localMode) {
        const formData = new FormData();
        formData.append("file", new File([recordedBlob], filename, { type: contentType }));

        const localRes = await fetch("/api/upload/local", {
          method: "POST",
          body: formData,
        });

        if (!localRes.ok) {
          const data = await localRes.json();
          throw new Error(data.error || "Local upload failed");
        }

        setUploadProgress(100);
        const { key, url } = await localRes.json();
        return { key, url };
      }

      // Handle Vercel Blob upload (manual token exchange + direct PUT)
      if (presignData.blobMode) {
        const pathname = `recordings/${Date.now()}.${ext}`;

        // Step 1: Get client token from our server
        const tokenRes = await fetch("/api/upload/blob", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "blob.generate-client-token",
            payload: {
              pathname,
              callbackUrl: `${window.location.origin}/api/upload/blob`,
              multipart: false,
              clientPayload: null,
            },
          }),
        });

        if (!tokenRes.ok) {
          const err = await tokenRes.json().catch(() => ({}));
          throw new Error(err.error || "Failed to get upload token");
        }

        const tokenData = await tokenRes.json();
        const clientToken = tokenData.clientToken;

        // Extract store URL from token: vercel_blob_client_{storeId}_...
        const parts = clientToken.split("_");
        if (parts.length < 4 || !parts[3]) {
          throw new Error("Invalid upload token format. Please try again or contact support.");
        }
        const storeId = parts[3];
        const blobUploadUrl = `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com/${pathname}`;

        // Step 2: PUT file directly to Vercel Blob
        const xhr = new XMLHttpRequest();

        const responseText = await new Promise<string>((resolve, reject) => {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(`Upload to storage failed (${xhr.status}): ${xhr.responseText?.slice(0, 200)}`));
            }
          };

          xhr.onerror = () => reject(new Error("Upload failed — network error"));

          xhr.open("PUT", blobUploadUrl);
          xhr.setRequestHeader("authorization", `Bearer ${clientToken}`);
          xhr.setRequestHeader("x-content-type", contentType);
          xhr.setRequestHeader("x-api-version", "7");
          xhr.send(recordedBlob);
        });

        const blobResult = JSON.parse(responseText);
        return { key: blobResult.pathname, url: blobResult.url };
      }

      // Handle R2 upload via XHR (for progress tracking) with retry
      const { uploadUrl, key, publicUrl } = presignData;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                setUploadProgress(Math.round((e.loaded / e.total) * 100));
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`R2 upload failed (${xhr.status}): ${xhr.responseText?.slice(0, 300)}`));
              }
            };

            xhr.onerror = () => reject(new Error("Upload failed — network error"));

            xhr.open("PUT", uploadUrl);
            xhr.setRequestHeader("Content-Type", contentType);
            xhr.send(recordedBlob);
          });
          break; // success
        } catch (err) {
          if (attempt === maxRetries) throw err;
          setUploadProgress(0);
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }

      return { key, url: publicUrl };
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!recordedBlob) {
      setError("Please record a video first");
      return;
    }

    if (videoDuration < 5) {
      setError("Recording too short. Please record at least 5 seconds.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      const videoData = await uploadRecordedVideo();

      if (!videoData) {
        throw new Error("Failed to upload video");
      }

      const res = await fetch("/api/apply/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          videoKey: videoData.key,
          videoUrl: videoData.url,
          videoDurationSec: Math.max(1, Math.round(videoDuration || duration || 1)),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      router.push("/confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const clearVideo = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setUploadProgress(0);
    setVideoDuration(0);
    setDuration(0);
    setHasStarted(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-white">
        <nav className="border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <Link href="/" className="font-serif text-xl font-bold text-slate-900 tracking-tight">
              IP4
            </Link>
          </div>
        </nav>
        <div className="flex items-center justify-center px-6 py-32">
          <div className="max-w-md text-center">
            <h1 className="font-serif text-3xl font-bold text-slate-900 mb-4">Application Not Found</h1>
            <p className="text-slate-500 mb-8">{error || "This application may have expired or already been submitted."}</p>
            <Link
              href="/apply"
              className="inline-block px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
            >
              Start New Application
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const hasVideo = recordedBlob !== null;

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold text-slate-900 tracking-tight">
            IP4
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-xs flex items-center justify-center text-emerald-600 font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="hidden sm:inline text-slate-400">Info</span>
            </span>
            <div className="w-8 h-px bg-slate-200" />
            <span className="flex items-center gap-2 text-slate-900 font-medium">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-medium">
                2
              </span>
              <span className="hidden sm:inline">Record</span>
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-slate-400 mb-2">Hi {application.name},</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Record your response.</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Prompt - only visible during recording */}
        {isRecording && (
          <div className="bg-slate-900 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400 font-medium">
                Question {currentPromptIndex + 1} of {application.prompts.length}
              </p>
              <div className="flex gap-2">
                {application.prompts.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentPromptIndex
                        ? "bg-white scale-125"
                        : idx < currentPromptIndex
                        ? "bg-slate-500"
                        : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
              {application.prompts[currentPromptIndex]?.text}
            </p>
            <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/50 transition-all duration-1000"
                style={{
                  width: `${((duration % PROMPT_DURATION) / PROMPT_DURATION) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {currentPromptIndex < (application?.prompts.length || 1) - 1
                ? `${PROMPT_DURATION - (duration % PROMPT_DURATION)}s until next question`
                : `${Math.max(0, MAX_DURATION - duration)}s remaining`}
            </p>
          </div>
        )}

        {/* Rules - only show before starting */}
        {!hasStarted && (
          <div className="bg-slate-900 rounded-2xl p-6 mb-8">
            <h2 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">
              How it works
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs text-white/70">1</span>
                <p className="text-slate-300"><span className="text-white font-medium">{application.prompts.length} questions, {PROMPT_DURATION}s each.</span> Questions appear one at a time when you start recording.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs text-white/70">2</span>
                <p className="text-slate-300"><span className="text-white font-medium">One take.</span> You won&apos;t see the questions beforehand and there are no do-overs.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs text-white/70">3</span>
                <p className="text-slate-300"><span className="text-white font-medium">No editing.</span> We want the real you, not the polished you.</p>
              </li>
            </ul>
            <p className="mt-4 text-xs text-slate-500 italic">
              Tip: Don&apos;t overthink it. When the question changes, just start talking.
            </p>
          </div>
        )}

        {/* Video area */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-6">
          {!hasStarted && !hasVideo && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-600 mb-2">Record your {MAX_DURATION}-second response</p>
              <p className="text-sm text-slate-500 mb-5">
                Questions will appear on screen once you start recording.
              </p>
              <button
                onClick={startCamera}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Enable Camera
              </button>
            </div>
          )}

          {/* Recording view */}
          {stream && !recordedBlob && (
            <div className="space-y-6">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-[3/4] sm:aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {isRecording && (
                  <>
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="font-mono text-sm">{formatTime(duration)} / {formatTime(MAX_DURATION)}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                      <div
                        className="h-full bg-red-500 transition-all duration-1000"
                        style={{ width: `${(duration / MAX_DURATION) * 100}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-center gap-4">
                {!isRecording && (
                  <button
                    onClick={startRecording}
                    className="px-8 py-4 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-all flex items-center gap-3"
                  >
                    <span className="w-3 h-3 bg-white rounded-full" />
                    Start Recording
                  </button>
                )}

                {isRecording && (
                  <button
                    onClick={stopRecording}
                    disabled={duration < PROMPT_DURATION * (application?.prompts.length || 1)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {duration < PROMPT_DURATION
                      ? `Answer both questions (${PROMPT_DURATION - duration}s)`
                      : "Stop Recording"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recording complete */}
          {recordedBlob && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-emerald-800">Video recorded!</p>
                  <p className="text-sm text-emerald-600">{formatTime(videoDuration || duration)} — ready to submit</p>
                </div>
              </div>

              {/* Video preview */}
              {recordedUrl && (
                <div className="bg-slate-900 rounded-xl overflow-hidden">
                  <video
                    src={recordedUrl}
                    controls
                    playsInline
                    className="w-full aspect-[3/4] sm:aspect-video"
                  />
                </div>
              )}
            </div>
          )}


          {/* Upload progress */}
          {submitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        {hasVideo && (
          <div className="space-y-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
            <p className="text-center text-sm text-slate-500">
              Reminder: you can only submit your application once.
            </p>
          </div>
        )}

        {/* Expiration notice */}
        <div className="mt-10 text-center text-sm text-slate-400">
          Application expires: {new Date(application.expiresAt).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
