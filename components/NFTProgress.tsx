import { Progress } from "@/components/ui/progress";

interface NFTProgressProps {
  current: number;
  total: number;
}

export function NFTProgress({ current, total }: NFTProgressProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-white">
        <span>Generating NFTs...</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="text-right text-xs text-white/50">
        {current} of {total} NFTs
      </div>
    </div>
  );
}
