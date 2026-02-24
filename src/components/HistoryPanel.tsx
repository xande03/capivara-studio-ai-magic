import { HistoryItem } from "@/lib/sessionHistory";
import { Clock } from "lucide-react";

interface HistoryPanelProps {
  items: HistoryItem[];
  onSelect?: (item: HistoryItem) => void;
}

export function HistoryPanel({ items, onSelect }: HistoryPanelProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p>Nenhum item no histórico</p>
        <p className="text-xs mt-1 opacity-60">O histórico é temporário por sessão</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
          onClick={() => onSelect?.(item)}
        >
          <img
            src={item.outputImage}
            alt={item.prompt}
            className="w-full h-28 object-cover"
            loading="lazy"
          />
          <div className="p-2">
            <p className="text-xs text-foreground truncate">{item.prompt || "Sem prompt"}</p>
            <p className="text-[10px] text-muted-foreground">{item.model}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
