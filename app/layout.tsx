import React, { Suspense } from "react";
import Providers from "./providers";
import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import localFont from "next/font/local";
import "./globals.css";

const ocdMono = localFont({
  src: "../public/fonts/VCR_OSD_MONO_1.001.ttf",
  variable: "--font-ocd-mono",
});

const domain = process.env.NEXT_PUBLIC_DOMAIN || "mplgpt.ai";
let title = `${domain} - Solana NFT AI Studio`;
let description = "Generate images with AI in milliseconds";
let url = `https://${domain}`;
let ogimage = "/pix-logo.svg";
let sitename = domain;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/pix-logo.svg",
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
        <PlausibleProvider domain={domain} />
      </head>
      <body className={`${ocdMono.variable} h-full min-h-full font-mono text-white antialiased bg-black`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
