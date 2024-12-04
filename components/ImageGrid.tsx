import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageGridProps {
  images: Array<{
    prompt: string;
    image: {
      url: string;
      timings: { inference: number };
    };
  }>;
  onGenerateMore: (prompt: string, amount: number) => void;
  onImageClick: (image: string) => void;
}

export function ImageGrid({ images, onGenerateMore, onImageClick }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-white/50">
        No images generated yet. Start by entering a prompt above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {images.map((generation, i) => (
        <div
          key={i}
          className="group relative overflow-hidden border border-white/10 bg-black"
        >
          <div className="relative aspect-[4/3]">
            <Image
              src={generation.image.url}
              alt={generation.prompt}
              fill
              className="object-cover"
              onClick={() => onImageClick(generation.image.url)}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="text-xs text-white line-clamp-2">{generation.prompt}</p>
            <div className="mt-2 flex justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onGenerateMore(generation.prompt, 4)}
                className="vs-button"
              >
                Generate More
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
