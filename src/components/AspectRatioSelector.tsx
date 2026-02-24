import { Button } from "@/components/ui/button";

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3";

const ratios: { id: AspectRatio; label: string }[] = [
  { id: "1:1", label: "1:1" },
  { id: "16:9", label: "16:9" },
  { id: "9:16", label: "9:16" },
  { id: "4:3", label: "4:3" },
  { id: "3:4", label: "3:4" },
  { id: "3:2", label: "3:2" },
  { id: "2:3", label: "2:3" },
];

interface Props {
  value: AspectRatio;
  onChange: (v: AspectRatio) => void;
}

export function AspectRatioSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">Proporção (Aspect Ratio)</label>
      <div className="flex gap-2 flex-wrap">
        {ratios.map((r) => (
          <Button
            key={r.id}
            type="button"
            variant={value === r.id ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(r.id)}
            className={value === r.id ? "gold-gradient text-primary-foreground" : ""}
          >
            {r.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
