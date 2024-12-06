"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-ant-design";
import "@solana/wallet-adapter-ant-design/styles.css";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Form submitted");
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const prompt = formData.get("prompt") as string;
    
    setError(null);
    setIsGenerating(true);
    setGeneratedImage(null);
    
    try {
      const response = await fetch("/api/generateImages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.url);
      
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col px-5">
        <header className="flex items-center justify-between border-b border-white/10 py-2">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-normal text-white">
              Solana NFT AI Studio
            </h1>
            <Navigation />
          </div>
          <WalletMultiButton className="vs-button" />
        </header>

        <main className="mt-6">
          <div className="vs-container p-4">
            <form onSubmit={handleSubmit}>
              <textarea
                name="prompt"
                rows={4}
                spellCheck={false}
                placeholder="Describe your image..."
                required
                defaultValue="pixel racer"
                className="vs-input mb-4 w-full resize-none"
              />
              <button 
                type="submit" 
                disabled={isGenerating}
                className="vs-button"
              >
                Generate Image
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded text-red-200">
                {error}
              </div>
            )}

            {generatedImage && (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="w-full rounded"
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
