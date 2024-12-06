"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-ant-design";
import "@solana/wallet-adapter-ant-design/styles.css";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState(1);
  const [progress, setProgress] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Form submitted");
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const prompt = formData.get("prompt") as string;
    
    setError(null);
    setIsGenerating(true);
    setGeneratedImages([]);
    setProgress(0);
    
    try {
      const BATCH_SIZE = 10;
      const totalBatches = Math.ceil(imageCount / BATCH_SIZE);
      const allImages: string[] = [];

      for (let batch = 0; batch < totalBatches; batch++) {
        const batchCount = Math.min(BATCH_SIZE, imageCount - batch * BATCH_SIZE);
        
        const response = await fetch("/api/generateImages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, count: batchCount }),
        });
        
        const data = await response.json();
        
        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to generate images');
        }

        const batchImages = Array.isArray(data) ? data.map(d => d.url) : [data.url];
        allImages.push(...batchImages);
        
        const currentProgress = Math.min(100, ((batch + 1) * BATCH_SIZE * 100) / imageCount);
        setProgress(currentProgress);
        setGeneratedImages([...allImages]); // Update UI with each batch
      }
      
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  }

  const handleBack = () => {
    setGeneratedImages([]);
    setError(null);
    setProgress(0);
  };

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
            {generatedImages.length > 0 && (
              <button 
                onClick={handleBack}
                className="vs-button mb-4"
              >
                ← Back to Generation
              </button>
            )}

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
              <div className="flex items-center gap-4 mb-4">
                <label className="text-white">Number of images:</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={imageCount}
                  onChange={(e) => setImageCount(Number(e.target.value))}
                  className="vs-input w-32"
                />
              </div>
              <button 
                type="submit" 
                disabled={isGenerating}
                className="vs-button"
              >
                {isGenerating ? `Generating (${progress.toFixed(1)}%)` : 'Generate Images'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded text-red-200">
                {error}
              </div>
            )}

            {isGenerating && progress > 0 && (
              <div className="mt-4">
                <div className="w-full h-2 bg-gray-700 rounded">
                  <div 
                    className="h-full bg-green-500 rounded transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Generated {generatedImages.length} of {imageCount} images
                </p>
              </div>
            )}

            {generatedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {generatedImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Generated image ${index + 1}`}
                    className="w-full rounded"
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
