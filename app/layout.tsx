import React, { Suspense } from "react";
import Providers from "@/app/providers";
import bgPattern from "@/public/bg-pattern-transparent.png";
import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import localFont from "next/font/local";
import "./globals.css";

const ocdMono = localFont({
  src: "../public/fonts/VCR_OSD_MONO_1.001.ttf",
  variable: "--font-ocd-mono",
});

let title = "MPLGPT – Real-Time AI Image Generator";
let description = "Generate images with AI in milliseconds";
let url = "https://www.mplgpt.ai/";
let ogimage = "https://www.mplgpt.ai/og-image.png";
let sitename = "mplgpt.ai";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="color-scheme" content="dark" />
        <PlausibleProvider domain="mplgpt.ai" />
      </head>
      <body
        className={`${ocdMono.variable} h-full min-h-full font-mono text-gray-100 antialiased`}
        style={{
          backgroundImage: `url(footer_bg.png), url(candypix_bg.png)`,
          backgroundSize: `100%, cover`,
          backgroundRepeat: `no-repeat, no-repeat`,
          backgroundPosition: `bottom, center`,
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
