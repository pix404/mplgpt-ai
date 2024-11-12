import Image from "next/image";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { useState } from "react";

interface ImageResponse {
  url: string;
  index: number;
}

interface ImageGridProps {
  images: { prompt: string; image: ImageResponse }[];
  onGenerateMore: (promptText: string) => Promise<void>;
  onImageClick: () => void;
}

export function ImageGrid({
  images,
  onGenerateMore,
  onImageClick,
}: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {images.map((item, index) => (
          <div key={index} className="group relative">
            <Image
              src={item.image.url}
              alt={item.prompt}
              width={1024}
              height={1024}
              className="cursor-pointer rounded-lg transition hover:opacity-80"
              onClick={() => setSelectedImage(item.image.url)}
            />
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
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
