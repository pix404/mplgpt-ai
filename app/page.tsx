"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageGrid } from "@/components/ImageGrid";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";
import { NFTProgress } from "@/components/NFTProgress";
import { saveAs } from "file-saver";

type ImageResponse = {
  index: number;
  url: string;
  timings: { inference: number };
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [userAPIKey, setUserAPIKey] = useState("");
  const [generations, setGenerations] = useState<
    { prompt: string; image: ImageResponse }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 4;
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const progressRef = useRef({ current: 0, total: 0 });

  useEffect(() => {
    if (progressRef.current.current > 0) {
      setBatchProgress({
        current: progressRef.current.current,
        total: progressRef.current.total,
      });
    }
  }, [progressRef.current.current]);

  // Calculate total pages
  const totalPages = Math.ceil(generations.length / imagesPerPage);

  // Get current page's images
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = generations.slice(indexOfFirstImage, indexOfLastImage);

  const fetchImage = async (promptText: string) => {
    const res = await fetch("/api/generateImages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptText,
        userAPIKey,
        iterativeMode: false,
      }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const newImage = await res.json();
    return { prompt: promptText, image: newImage };
  };

  const handleGenerateMore = async (promptText: string) => {
    try {
      const newImage = await fetchImage(promptText);
      setGenerations((prev) => [...prev, newImage]);
      // Reset to first page when generating new images
      setCurrentPage(1);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    const total = 1000;
    setIsGenerating(true);
    setBatchProgress({ current: 0, total });
    const zip = new JSZip();
    abortControllerRef.current = new AbortController();

    try {
      for (let i = 0; i < total; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Generation cancelled");
        }

        try {
          const result = await fetchImage(prompt);
          if (!result?.image?.url) {
            throw new Error("Failed to generate image");
          }

          // Fetch the image as a blob
          const response = await fetch(
            `/api/proxyImage?url=${encodeURIComponent(result.image.url)}`,
          );
          const imageBlob = await response.blob();

          // Add to zip with a numbered filename
          zip.file(`image-${i + 1}.jpg`, imageBlob);

          setBatchProgress((prev) => ({
            current: i + 1,
            total,
          }));

          // Give React time to update the UI
          await new Promise((resolve) => setTimeout(resolve, 0));
        } catch (error) {
          console.error(`Error generating image ${i + 1}:`, error);
          continue;
        }
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

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col px-5">
      <header className="flex justify-center pt-20 md:justify-end md:pt-3">
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-200">
              [Optional] Add your{" "}
              <a
                href="https://api.together.xyz/settings/api-keys"
                target="_blank"
                className="underline underline-offset-4 transition hover:text-blue-500"
              >
                Together API Key
              </a>
            </label>
            <Input
              placeholder="Together API Key"
              type="password"
              value={userAPIKey}
              className="mt-1 bg-gray-400 text-gray-200 placeholder:text-gray-300"
              onChange={(e) => setUserAPIKey(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        <form className="mt-10 w-full max-w-lg" onSubmit={handleSubmit}>
          <fieldset>
            <div className="relative">
              <Textarea
                rows={4}
                spellCheck={false}
                placeholder="Describe your image..."
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full resize-none border-gray-300 border-opacity-50 bg-gray-400 px-4 text-base placeholder-gray-300"
              />
            </div>
          </fieldset>
          <div className="mt-4 flex gap-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Generate Image
            </Button>
            {prompt.trim() && (
              <Button
                type="button"
                onClick={handleBatchGenerate}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!!batchProgress}
              >
                Generate 10k Pack
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="flex w-full grow flex-col items-center justify-center space-y-4 px-4 pb-8 pt-4">
        {batchProgress ? (
          <div className="w-full max-w-lg">
            <NFTProgress
              current={batchProgress.current}
              total={batchProgress.total}
            />
            <Button
              onClick={handleStopGeneration}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Stop Generation
            </Button>
          </div>
        ) : (
          <>
            <ImageGrid
              images={generations.slice(
                (currentPage - 1) * imagesPerPage,
                currentPage * imagesPerPage,
              )}
              onGenerateMore={handleGenerateMore}
              onImageClick={() => {}}
            />
            <div className="mb-4 flex items-center gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="hover:bg-gray-700 rounded bg-gray-600 px-4 py-2 text-white disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-sm text-gray-300">
                {currentPage} of {Math.ceil(generations.length / imagesPerPage)}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      Math.ceil(generations.length / imagesPerPage),
                      currentPage + 1,
                    ),
                  )
                }
                disabled={
                  currentPage === Math.ceil(generations.length / imagesPerPage)
                }
                className="hover:bg-gray-700 rounded bg-gray-600 px-4 py-2 text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
