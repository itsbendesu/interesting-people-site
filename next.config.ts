import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  // Serve modern image formats (AVIF first, WebP fallback). AVIF is ~20-30%
  // smaller than WebP at equivalent quality and is supported by every modern
  // mobile browser (Chrome, Safari 16+, Firefox).
  images: {
    formats: ["image/avif", "image/webp"],
    // Trim default device sizes to ones we actually serve. Default is
    // [640, 750, 828, 1080, 1200, 1920, 2048, 3840] — 3840 is wasted bandwidth
    // for a marketing site that tops out at a 100vw hero image and 128px avatars.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/alumni/friends", destination: "/alumni/friend", permanent: true },
    ];
  },
};

export default nextConfig;
