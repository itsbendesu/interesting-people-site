"use client";

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export default function VideoPlayer({ src, className = "" }: VideoPlayerProps) {
  return (
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        src={src}
        controls
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        preload="metadata"
        controlsList="nodownload"
        className="w-full h-full"
      />
    </div>
  );
}
