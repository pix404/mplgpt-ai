"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageGrid } from "@/components/ImageGrid";
import JSZip from "jszip";

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
  const [isGeneratingCollection, setIsGeneratingCollection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 10;
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const fetchImage = async (controller: AbortController) => {
    const res = await fetch("/api/generateImages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, userAPIKey, iterativeMode: false }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const newImage = await res.json();
    return { prompt, image: newImage };
  };

  const handleGenerateCollection = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first");
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGeneratingCollection(true);

    try {
      for (let i = 0; i < 100; i++) {
        const newImage = await fetchImage(controller);
        setGenerations((prev) => [...prev, newImage]);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Generation cancelled");
      } else {
        console.error("Error generating collection:", error);
        alert("Error generating collection. Please try again.");
      }
    } finally {
      setIsGeneratingCollection(false);
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const totalPages = Math.ceil(generations.length / imagesPerPage);
  const currentImages = generations.slice(
    (currentPage - 1) * imagesPerPage,
    currentPage * imagesPerPage,
  );

  return (
    <div className="flex h-full flex-col px-5">
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

      <div className="flex justify-center">
        <form className="mt-10 w-full max-w-lg">
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerateCollection}
              disabled={isGeneratingCollection}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Generate 100 Images
            </button>
            {isGeneratingCollection && (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Stop Generation
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="flex w-full grow flex-col items-center justify-center space-y-4 pb-8 pt-4 text-center">
        {generations.length > 0 ? (
          <>
            <ImageGrid
              images={currentImages}
              totalImages={generations.length}
              onDownloadRest={() => {}}
            />
            <div className="flex items-center gap-4 text-gray-200">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="disabled:opacity-50"
              >
                &lt;
              </button>
              <span>
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </>
        ) : (
          <div className="max-w-xl md:max-w-4xl lg:max-w-3xl">
            <p className="text-xl font-semibold text-gray-200 md:text-3xl lg:text-4xl">
              Generate NFT collections in real-time
            </p>
            <p className="mt-4 text-balance text-sm text-gray-300 md:text-base lg:text-lg">
              Enter a prompt and generate images in milliseconds as you type.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
