"use client";

import { Navigation } from "@/components/Navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-ant-design";
import { Suspense } from "react";

export default function DocsPage() {
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
            <h2 className="text-lg font-normal text-white">Documentation</h2>
            <div className="mt-4 space-y-4 text-white/70">
              <p>Welcome to the {domain} documentation.</p>
              <h3 className="text-white">Getting Started</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Connect your Solana wallet</li>
                <li>Enter a detailed prompt describing your desired NFT</li>
                <li>Click &quot;Generate Image&quot; to create a single NFT</li>
                <li>Use &quot;Generate 10k Pack&quot; for collection generation</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
