import { Button } from "./ui/button";

interface ImageActionsProps {
  onGenerate: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

export default function ImageActions({ onGenerate, onDelete, onCopy }: ImageActionsProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/50 rounded-lg">
      <div className="flex gap-2">
        <Button 
          onClick={onGenerate}
          className="bg-green-600 hover:bg-green-700"
          size="sm"
        >
          Gen
        </Button>
        <Button 
          onClick={onDelete}
          variant="destructive"
          size="sm"
        >
          Del
        </Button>
        <Button 
          onClick={onCopy}
          variant="secondary"
          size="sm"
        >
          Copy
        </Button>
      </div>
    </div>
  );
}