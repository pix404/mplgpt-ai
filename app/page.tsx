"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { NFTProgress } from "@/components/NFTProgress";
import imagePlaceholder from "@/public/image-placeholder.png";

type ImageResponse = {
  b64_json: string;
  timings: { inference: number };
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [iterativeMode, setIterativeMode] = useState(false);
  const [userAPIKey, setUserAPIKey] = useState("");
  const [isGeneratingCollection, setIsGeneratingCollection] = useState(false);
  const [generatedNFTs, setGeneratedNFTs] = useState(0);
  const debouncedPrompt = useDebounce(prompt, 300);
  const [generations, setGenerations] = useState<
    { prompt: string; image: ImageResponse }[]
  >([]);
  let [activeIndex, setActiveIndex] = useState<number>();

  const { data: image, isFetching } = useQuery({
    placeholderData: (previousData) => previousData,
    queryKey: [debouncedPrompt],
    queryFn: async () => {
      let res = await fetch("/api/generateImages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, userAPIKey, iterativeMode }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      return (await res.json()) as ImageResponse;
    },
    enabled: !!debouncedPrompt.trim(),
    staleTime: Infinity,
    retry: false,
  });

  let isDebouncing = prompt !== debouncedPrompt;

  useEffect(() => {
    if (image && !generations.map((g) => g.image).includes(image)) {
      setGenerations((images) => [...images, { prompt, image }]);
      setActiveIndex(generations.length);
    }
  }, [generations, image, prompt]);

  let activeImage =
    activeIndex !== undefined ? generations[activeIndex].image : undefined;

  const handleGenerateCollection = () => {
    setIsGeneratingCollection(true);
    // Simulate NFT generation progress
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setGeneratedNFTs(count);
      if (count >= 10000) {
        clearInterval(interval);
      }
    }, 10);
  };

  const handleDownloadCollection = () => {
    // Implement download logic here
    console.log("Downloading collection...");
    setIsGeneratingCollection(false);
    setGeneratedNFTs(0);
  };

  return (
    <div className="flex h-full flex-col px-5">
      <header className="flex justify-center pt-20 md:justify-end md:pt-3">
        <div className="absolute left-1/2 top-6 -translate-x-1/2">
          <a href="https://mplgpt.ai" target="_blank">
            <Image
              src="/logo.svg"
              alt="MPLGPT.AI"
              width={128}
              height={128}
              priority
            />
          </a>
        </div>
        <div>
          <label className="text-xs text-gray-200">
            [Optional] Add your{" "}
            <a
              href="https://api.together.xyz/settings/api-keys"
              target="_blank"
              className="underline underline-offset-4 transition hover:text-blue-500"
            >
              Together API Key
            </a>{" "}
          </label>
          <Input
            placeholder="API Key"
            type="password"
            value={userAPIKey}
            className="mt-1 bg-gray-400 text-gray-200 placeholder:text-gray-300"
            onChange={(e) => setUserAPIKey(e.target.value)}
          />
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
              <div
                className={`${isFetching || isDebouncing ? "flex" : "hidden"} absolute bottom-3 right-3 items-center justify-center`}
              >
                <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
              </div>
            </div>

            <div className="mt-3 text-sm md:text-right">
              <label
                title="Use earlier images as references"
                className="inline-flex items-center gap-2"
              >
                Consistency mode
                <Switch
                  checked={iterativeMode}
                  onCheckedChange={setIterativeMode}
                />
              </label>
            </div>
          </fieldset>
        </form>
      </div>

      <div className="flex w-full grow flex-col items-center justify-center pb-8 pt-4 text-center">
        {!activeImage || !prompt ? (
          <div className="max-w-xl md:max-w-4xl lg:max-w-3xl">
            <p className="text-xl font-semibold text-gray-200 md:text-3xl lg:text-4xl">
              Generate NFT collections in real-time
            </p>
            <p className="mt-4 text-balance text-sm text-gray-300 md:text-base lg:text-lg">
              Enter a prompt and generate images in milliseconds as you type.
              Then generate your entire NFT collection with one click.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex w-full max-w-4xl flex-col justify-center">
            <div className="relative group">
              <Image
                placeholder="blur"
                blurDataURL={imagePlaceholder.blurDataURL}
                width={1024}
                height={768}
                src={`data:image/png;base64,${activeImage.b64_json}`}
                alt=""
                className={`${isFetching ? "animate-pulse" : ""} max-w-full rounded-lg object-cover shadow-sm shadow-black`}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={handleGenerateCollection}
                  disabled={isGeneratingCollection}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Generate 10K
                </button>
              </div>
            </div>

            {isGeneratingCollection && (
              <div className="mt-4">
                <NFTProgress
                  total={10000}
                  current={generatedNFTs}
                  onComplete={handleDownloadCollection}
                />
              </div>
            )}

            <div className="mt-4 flex gap-4 overflow-x-scroll pb-4">
              {generations.map((generatedImage, i) => (
                <button
                  key={i}
                  className="w-32 shrink-0 opacity-50 hover:opacity-100"
                  onClick={() => setActiveIndex(i)}
                >
                  <Image
                    placeholder="blur"
                    blurDataURL={imagePlaceholder.blurDataURL}
                    width={1024}
                    height={768}
                    src={`data:image/png;base64,${generatedImage.image.b64_json}`}
                    alt=""
                    className="max-w-full rounded-lg object-cover shadow-sm shadow-black"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-16 w-full items-center pb-10 text-center text-gray-300 md:mt-4 md:flex md:justify-between md:pb-5 md:text-xs lg:text-sm">
        <p>
          Powered by{" "}
          <a
            href="https://pix404.com"
            target="_blank"
            className="underline underline-offset-4 transition hover:text-blue-500"
          >
            pix404.com
          </a>
        </p>
      </footer>
    </div>
  );
}