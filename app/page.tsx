"use client";

import { useQuery, QueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import { useEffect, useState, useRef, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageGrid } from "@/components/ImageGrid";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";
import { NFTProgress } from "@/components/NFTProgress";
import { saveAs } from "file-saver";
import Spinner from "@/components/spinner";
import { NFTMetadata } from "@/types/nft";
import { WalletMultiButton } from "@solana/wallet-adapter-ant-design";
import { useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-ant-design/styles.css";
import "@solana/wallet-adapter-react-ui/styles.css";

type ImageResponse = {
  index: number;
  url: string;
  timings: { inference: number };
};

type Generation = {
  prompt: string;
  image: ImageResponse;
};

type BatchProgress = {
  current: number;
  total: number;
} | null;

export default function Home() {
  const { publicKey, disconnect } = useWallet();
  const [prompt, setPrompt] = useState("");
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 4;
  const [batchProgress, setBatchProgress] = useState<BatchProgress>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressRef = useRef<{ current: number; total: number }>({ current: 0, total: 0 });

  useEffect(() => {
    if (progressRef.current.current > 0) {
      setBatchProgress({
        current: progressRef.current.current,
        total: progressRef.current.total,
      });
    }
  }, [progressRef.current.current]);

  useEffect(() => {
    if (publicKey) {
      console.log("Connected wallet public key:", publicKey.toBase58());
    }
  }, [publicKey]);

  const queryClient = new QueryClient();

  const fetchImage = async (promptText: string) => {
    const queryKey = ["image", promptText];
    const cachedData = queryClient.getQueryData<Generation>(queryKey);
    if (cachedData) return cachedData;

    const res = await fetch("/api/generateImages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptText,
        iterativeMode: false,
        publicKey: publicKey!.toBase58(),
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const newImage = await res.json();
    const result: Generation = { prompt: promptText, image: newImage };
    queryClient.setQueryData(queryKey, result);
    return result;
  };

  const handleGenerateMore = async (promptText: string, amount: number) => {
    setIsGenerating(true);
    setBatchProgress({ current: 0, total: amount });

    try {
      const batchSize = 3;
      for (let i = 0; i < amount; i += batchSize) {
        const batch = Array.from(
          { length: Math.min(batchSize, amount - i) },
          (_, j) => i + j
        );

        const results = await Promise.all(
          batch.map(async () => {
            const result = await fetchImage(promptText);
            return result;
          })
        );

        setGenerations((prev) => [...prev, ...results]);
        setBatchProgress((prev) => ({
          current: Math.min((prev?.current || 0) + batchSize, amount),
          total: amount,
        }));

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setCurrentPage(1);
    } catch (error) {
      console.error("Error generating images:", error);
      alert("Error generating images. Please try again.");
    } finally {
      setIsGenerating(false);
      setBatchProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!publicKey) {
      alert("Please connect your wallet first");
      return;
    }
    if (!prompt.trim()) {
      alert("Please enter a prompt first");
      return;
    }

    try {
      const newImage = await fetchImage(prompt);
      setGenerations((prev) => [...prev, newImage]);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");
    }
  };

  const handleBatchGenerate = async () => {
    if (!publicKey) {
      alert("Please connect your wallet first");
      return;
    }
    const total = 1000;
    const batchSize = 3;
    setIsGenerating(true);
    setBatchProgress({ current: 0, total });
    const zip = new JSZip();
    abortControllerRef.current = new AbortController();

    try {
      for (let i = 0; i < total; i += batchSize) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Generation cancelled");
        }

        const batch = Array.from(
          { length: Math.min(batchSize, total - i) },
          (_, j) => i + j
        );

        const results = await Promise.all(
          batch.map(async (index) => {
            const result = await fetchImage(prompt);
            if (!result?.image?.url) throw new Error("Failed to generate image");

            const response = await fetch(result.image.url);
            if (!response.ok) throw new Error("Failed to fetch image data");
            const imageBlob = await response.blob();

            return { index, imageBlob, result };
          })
        );

        for (const { index, imageBlob, result } of results) {
          zip.file(`${index + 1}.jpg`, imageBlob);

          const metadata: NFTMetadata = {
            name: `${prompt.slice(0, 30)} #${index + 1}`,
            description: prompt,
            image: `${index + 1}.jpg`,
            attributes: [
              {
                prompt: prompt,
                model: "black-forest-labs/FLUX.1-schnell",
                timestamp: new Date().toISOString(),
                index: index + 1,
              },
            ],
          };

          zip.file(`${index + 1}.json`, JSON.stringify(metadata, null, 2));
        }

        setBatchProgress((prev) => ({
          current: Math.min(i + batchSize, total),
          total,
        }));

        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${prompt.slice(0, 30)}-pack.zip`);
    } catch (error) {
      console.error("Batch generation error:", error);
      if (error instanceof Error && error.message !== "Generation cancelled") {
        alert(error.message || "Error generating images. Please try again.");
      }
    } finally {
      setIsGenerating(false);
      setBatchProgress(null);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    abortControllerRef.current?.abort();
  };

  const handleDownloadZip = async () => {
    if (generations.length === 0) return;

    setBatchProgress({ current: 0, total: generations.length });
    const zip = new JSZip();

    try {
      for (let i = 0; i < generations.length; i++) {
        const generation = generations[i];
        const response = await fetch(
          `/api/proxyImage?url=${encodeURIComponent(generation.image.url)}`
        );
        if (!response.ok) throw new Error("Failed to fetch image data");
        const imageBlob = await response.blob();

        zip.file(`${i + 1}.jpg`, imageBlob);

        const metadata: NFTMetadata = {
          name: `${prompt.slice(0, 30)} #${i + 1}`,
          description: prompt,
          image: `${i + 1}.jpg`,
          attributes: [
            {
              prompt: prompt,
              model: "black-forest-labs/FLUX.1-schnell",
              timestamp: new Date().toISOString(),
              index: i + 1,
            },
          ],
        };

        zip.file(`${i + 1}.json`, JSON.stringify(metadata, null, 2));
        setBatchProgress((prev) => ({
          current: i + 1,
          total: generations.length,
        }));
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${prompt.slice(0, 30)}-collection.zip`);
    } catch (error) {
      console.error("Error creating zip:", error);
      alert("Error creating zip file. Please try again.");
    } finally {
      setBatchProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col px-5">
        <header className="flex items-center justify-between border-b border-white/10 py-2">
          <h1 className="text-xl font-normal text-white">PIX404 NFT Generator</h1>
          <Suspense fallback={<div>Loading...</div>}>
            <WalletMultiButton className="vs-button" />
          </Suspense>
        </header>

        <main className="mt-6">
          <form className="vs-container p-4" onSubmit={handleSubmit}>
            <Textarea
              rows={4}
              spellCheck={false}
              placeholder="Describe your image..."
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="vs-input mb-4 w-full resize-none"
            />
            <div className="flex gap-2">
              <Button type="submit" className="vs-button">
                Generate Image
              </Button>
              {prompt.trim() && (
                <>
                  <Button
                    type="button"
                    onClick={handleBatchGenerate}
                    className="vs-button"
                    disabled={!!batchProgress}
                  >
                    Generate 10k Pack
                  </Button>
                  {generations.length > 0 && (
                    <Button
                      type="button"
                      onClick={handleDownloadZip}
                      className="vs-button"
                      disabled={!!batchProgress}
                    >
                      {batchProgress ? (
                        <div className="flex items-center gap-2">
                          <Spinner className="h-3 w-3" />
                          Downloading...
                        </div>
                      ) : (
                        "Download All"
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </form>

          <div className="mt-6">
            {batchProgress && isGenerating ? (
              <div className="vs-container p-4">
                <NFTProgress current={batchProgress.current} total={batchProgress.total} />
                <Button onClick={handleStopGeneration} className="mt-4 vs-button bg-red-600 hover:bg-red-700">
                  Stop Generation
                </Button>
              </div>
            ) : (
              <>
                <div className="vs-container p-4">
                  <ImageGrid
                    images={generations.slice(
                      (currentPage - 1) * imagesPerPage,
                      currentPage * imagesPerPage
                    )}
                    onGenerateMore={handleGenerateMore}
                    onImageClick={() => {}}
                  />
                </div>
                {generations.length > 0 && (
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="vs-button disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-white">
                      {currentPage} of {Math.ceil(generations.length / imagesPerPage)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(
                            Math.ceil(generations.length / imagesPerPage),
                            currentPage + 1
                          )
                        )
                      }
                      disabled={currentPage === Math.ceil(generations.length / imagesPerPage)}
                      className="vs-button disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
