"use client";

import { Navigation } from "@/components/Navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-ant-design";
import { Suspense } from "react";

export default function LaunchpadPage() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "mplgpt.ai";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col px-5">
        <header className="flex items-center justify-between border-b border-white/10 py-2">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-normal text-white">{domain} - Solana NFT AI Studio</h1>
            <Navigation />
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <WalletMultiButton className="vs-button" />
          </Suspense>
        </header>

        <main className="mt-6">
          <div className="vs-container p-4">
            <h2 className="text-lg font-normal text-white">Launchpad</h2>
            <p className="mt-4 text-white/70">Coming soon...</p>
          </div>
        </main>
      </div>
    </div>
  );
}