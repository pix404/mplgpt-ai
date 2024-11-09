import { Progress } from "@/components/ui/progress";

interface NFTProgressProps {
  current: number;
  total: number;
  onConfirm: () => void;
}

export default function NFTProgress({ current, total, onConfirm }: NFTProgressProps) {
  const progress = (current / total) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-400 p-4">
      <div className="mx-auto max-w-4xl flex items-center gap-4">
        <div className="flex-1">
          <Progress value={progress} />
          <p className="mt-2 text-sm text-gray-200">
            Generating NFTs: {current} / {total}
          </p>
        </div>
        <Button 
          onClick={onConfirm}
          className="bg-green-600 hover:bg-green-700"
          disabled={current < total}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}