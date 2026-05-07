import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interesting People 4 — Victoria, July 2026",
  description:
    "150 people selected for curiosity and warmth, hanging out in one of the world's most beautiful places. July 27-29, 2026. Victoria, Canada.",
  openGraph: {
    title: "Interesting People 4 — Victoria, July 2026",
    description:
      "150 people selected for curiosity and warmth, hanging out in one of the world's most beautiful places.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Interesting People — July 27-29, 2026, Victoria, Canada",
      },
    ],
    siteName: "Interesting People",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interesting People 4 — Victoria, July 2026",
    description:
      "150 people selected for curiosity and warmth, hanging out in one of the world's most beautiful places.",
    images: ["/images/og-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
