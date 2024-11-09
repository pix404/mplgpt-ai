import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface NFTProgressProps {
  total: number;
  current: number;
  onComplete?: () => void;
}

export function NFTProgress({ total, current, onComplete }: NFTProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const percentage = (current / total) * 100;
    setProgress(percentage);
    
    if (percentage === 100 && onComplete) {
      onComplete();
    }
  }, [current, total, onComplete]);

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
        >
          {progress === 100 ? "Download" : "Generating..."}
        </Button>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}