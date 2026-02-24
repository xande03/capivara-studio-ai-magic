import { ModelType } from "@/lib/imageApi";
import { Button } from "@/components/ui/button";
import { Zap, Crown } from "lucide-react";

interface ModelSelectorProps {
  value: ModelType;
  onChange: (model: ModelType) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={value === "nano-banana" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("nano-banana")}
        className="gap-1.5"
      >
        <Zap className="w-3.5 h-3.5" />
        Nano Banana
      </Button>
      <Button
        variant={value === "nano-banana-pro" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("nano-banana-pro")}
        className="gap-1.5"
      >
        <Crown className="w-3.5 h-3.5" />
        Nano Banana Pro
      </Button>
    </div>
  );
}
