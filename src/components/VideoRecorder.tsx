"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface VideoRecorderProps {
  maxDuration: number;
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  // Order matters: prefer mp4 on Safari (which is the only thing it supports),
  // webm/vp9 on Chrome/Firefox.
  const types = [
    "video/mp4;codecs=h264,aac",
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=h264,opus",
    "video/webm",
  ];
  for (const type of types) {
    try {
      if (MediaRecorder.isTypeSupported(type)) return type;
    } catch {
      // ignore
    }
  }
  return "";
}

export default function VideoRecorder({ maxDuration, onRecordingComplete }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mimeTypeRef = useRef<string>("");

  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Your browser doesn't support video recording. Try Safari or Chrome on a recent device.");
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera access denied. Open your browser settings, allow camera + microphone for this site, then tap Try Again.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found. Make sure your device has a working camera.");
        } else if (err.name === "NotReadableError") {
          setError("Your camera is being used by another app. Close other camera apps and try again.");
        } else {
          setError("Couldn't start the camera. Please try again.");
        }
      } else {
        setError("Couldn't start the camera. Please try again.");
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

  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("stop() failed:", e);
      }
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const startRecording = useCallback(() => {
    if (!stream) return;

    chunksRef.current = [];
    setDuration(0);
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    const supportedMimeType = getSupportedMimeType();
    mimeTypeRef.current = supportedMimeType;

    const recorderOptions: MediaRecorderOptions = {};
    if (supportedMimeType) {
      recorderOptions.mimeType = supportedMimeType;
    }

    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, recorderOptions);
    } catch (err) {
      console.error("MediaRecorder construction failed:", err);
      setError("This browser can't record video in a supported format. Try Safari or Chrome.");
      return;
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blobType = supportedMimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type: blobType });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setPreviewUrl(url);
      setIsPreviewing(true);
      stopCamera();
    };

    mediaRecorder.onerror = (e) => {
      console.error("MediaRecorder error:", e);
      setError("Recording stopped unexpectedly. Please try again.");
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
    setIsRecording(true);

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed++;
      setDuration(elapsed);
      if (elapsed >= maxDuration) {
        stopRecording();
      }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, maxDuration, stopCamera, stopRecording, previewUrl]);

  const retake = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRecordedBlob(null);
    setIsPreviewing(false);
    setDuration(0);
    startCamera();
  }, [startCamera, previewUrl]);

  const confirmRecording = useCallback(() => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob, duration);
    }
  }, [recordedBlob, duration, onRecordingComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={startCamera}
          className="mt-3 min-h-[44px] px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 font-medium touch-manipulation"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stream && !isPreviewing) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">Record a {maxDuration}-second video response</p>
        <p className="text-xs text-gray-500 mb-4">We&apos;ll ask for camera and microphone permission. Tap Allow when prompted.</p>
        <button
          onClick={startCamera}
          className="min-h-[56px] px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 font-medium touch-manipulation"
        >
          Enable Camera
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-[3/4] sm:aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted={!isPreviewing}
          playsInline
          webkit-playsinline="true"
          controls={isPreviewing}
          src={isPreviewing && previewUrl ? previewUrl : undefined}
          className="w-full h-full object-cover"
        />

        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full shadow-lg">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            <span className="font-mono text-sm tabular-nums">{formatTime(duration)} / {formatTime(maxDuration)}</span>
          </div>
        )}

        {isRecording && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-red-500 transition-all duration-1000"
              style={{ width: `${(duration / maxDuration) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {!isPreviewing && !isRecording && (
          <button
            onClick={startRecording}
            aria-label="Start recording"
            className="min-h-[64px] min-w-[64px] px-7 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 active:bg-red-800 font-medium flex items-center gap-3 touch-manipulation shadow-lg"
          >
            <span className="w-4 h-4 bg-white rounded-full" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            aria-label="Stop recording"
            className="min-h-[64px] px-7 py-4 bg-gray-900 text-white rounded-full hover:bg-black active:bg-black font-medium touch-manipulation shadow-lg"
          >
            Stop Recording
          </button>
        )}

        {isPreviewing && (
          <>
            <button
              onClick={retake}
              className="min-h-[44px] px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 active:bg-gray-400 font-medium touch-manipulation"
            >
              Retake
            </button>
            <button
              onClick={confirmRecording}
              className="min-h-[44px] px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 font-medium touch-manipulation"
            >
              Use This Video ({formatTime(duration)})
            </button>
          </>
        )}
      </div>
    </div>
  );
}
