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
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";

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
            {generations.length > 0 && (
              <Button
                type="button"
                onClick={() => handleGenerateMore(prompt)}
                className="bg-green-600 hover:bg-green-700"
              >
                Generate More
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="flex w-full grow flex-col items-center justify-center space-y-4 px-4 pb-8 pt-4">
        {generations.length > 0 ? (
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
        ) : (
          <div className="max-w-xl md:max-w-4xl lg:max-w-3xl">
            <p className="text-xl font-semibold text-gray-200 md:text-3xl lg:text-4xl">
              Generate images one by one
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
