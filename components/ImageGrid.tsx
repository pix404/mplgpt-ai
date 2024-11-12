import Image from "next/image";
import { Button } from "./ui/button";

interface ImageGridProps {
  images: { prompt: string; image: { url: string; index: number } }[];
  totalImages: number;
  onDownloadRest: () => void;
}

export function ImageGrid({
  images,
  totalImages,
  onDownloadRest,
}: ImageGridProps) {
  const imagesPerPage = 100;
  const displayedImages = images.slice(0, imagesPerPage);

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-5 gap-4">
        {displayedImages.map((img) => (
          <div key={img.image.index} className="relative aspect-square">
            <Image
              src={img.image.url}
              alt={`Generated image ${img.image.index}`}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        ))}
      </div>

      {totalImages > imagesPerPage && (
        <div className="flex justify-end">
          <Button
            onClick={onDownloadRest}
            className="bg-green-600 hover:bg-green-700"
          >
            Download Remaining {totalImages - imagesPerPage} Images
          </Button>
        </div>
      )}
    </div>
  );
}
