"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

interface ImageResponse {
  url: string;
  index: number;
}

interface ImageGridProps {
  images: { prompt: string; image: ImageResponse }[];
  onGenerateMore: (promptText: string, amount: number) => Promise<void>;

  onImageClick: (url: string) => void;
  selectedImage?: string;
}

export function ImageGrid({
  images,
  onGenerateMore,
  onImageClick,
  selectedImage,
}: ImageGridProps) {
  const handleGenerateAmount = async (prompt: string, amount: number) => {
    await onGenerateMore(prompt, amount);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((item, index) => (
          <ContextMenu key={`${item.image.url}-${index}`}>
            <ContextMenuTrigger>
              <div
                className={`relative aspect-square w-full ${
                  selectedImage === item.image.url ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <Image
                  src={item.image.url}
                  alt={item.prompt}
                  width={1024}
                  height={1024}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="rounded-lg object-cover"
                  onClick={() => onImageClick(item.image.url)}
                />
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => handleGenerateAmount(item.prompt, 10)}
              >
                Generate 10
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleGenerateAmount(item.prompt, 100)}
              >
                Generate 100
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleGenerateAmount(item.prompt, 1000)}
              >
                Generate 1,000
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleGenerateAmount(item.prompt, 10000)}
              >
                Generate 10,000
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => onImageClick("")}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Selected image"
              width={1024}
              height={1024}
              className="rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
