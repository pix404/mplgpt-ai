import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Spinner from "./spinner";

interface NFTProgressProps {
  total: number;
  current: number;
  onComplete?: () => void;
}

export function NFTProgress({ total, current, onComplete }: NFTProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate percentage with better precision
    const percentage = parseFloat(((current / total) * 100).toFixed(2));

    // Use a timeout to ensure smooth state updates
    const timeoutId = setTimeout(() => {
      setProgress(percentage);

      if (percentage >= 100 && onComplete) {
        onComplete();
      }
    }, 16); // Roughly matches 60fps

    return () => clearTimeout(timeoutId);
  }, [current, total, onComplete]);

  const isGenerating = progress > 0 && progress < 100;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Generating NFTs</p>
          <p className="text-sm text-gray-300">
            {current} of {total} NFTs generated
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={progress !== 100}
          onClick={onComplete}
          className="min-w-[80px]"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-3 w-3" />
              {Math.floor(progress)}%
            </div>
          ) : progress === 100 ? (
            "Download"
          ) : (
            "0%"
          )}
        </Button>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
