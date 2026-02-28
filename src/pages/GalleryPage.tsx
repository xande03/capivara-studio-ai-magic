import { useState } from "react";
import { getAllHistory, removeFromHistory, HistoryItem } from "@/lib/sessionHistory";
import { Lightbox } from "@/components/Lightbox";
import { LayoutGrid, Trash2 } from "lucide-react";

const toolLabels: Record<string, string> = {
  upscale: "Upscale",
  generate: "Geração",
  edit: "Edição",
  "remove-bg": "Remover Fundo",
  "qr-code": "QR Code",
};

export default function GalleryPage() {
  const [allItems, setAllItems] = useState<HistoryItem[]>(() => getAllHistory());
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [lightbox, setLightbox] = useState<string>("");

  const filters = [
    { label: "Todas", tool: null },
    { label: "Upscale", tool: "upscale" },
    { label: "Fundo", tool: "remove-bg" },
    { label: "Geradas", tool: "generate" },
    { label: "QR Code", tool: "qr-code" },
  ];

  const handleDelete = (id: string) => {
    removeFromHistory(id);
    setAllItems(prev => prev.filter(item => item.id !== id));
  };

  const filteredItems = activeFilter === "Todas"
    ? allItems
    : allItems.filter(item => {
      const targetTool = filters.find(f => f.label === activeFilter)?.tool;
      return item.tool === targetTool;
    });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black emerald-text flex items-center gap-2">
            <LayoutGrid className="w-7 h-7 text-emerald-500" />
            Galeria
          </h1>
          <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-medium opacity-70">
            {filteredItems.length} {(filteredItems.length === 1) ? 'item processado' : 'itens processados'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card/30 p-1.5 rounded-full border border-border backdrop-blur-md">
          {filters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${activeFilter === filter.label
                ? "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20 scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <LayoutGrid className="w-16 h-16 mx-auto mb-4 text-primary/40" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Galeria Vazia</h2>
          <p className="text-sm text-muted-foreground">
            Processe imagens usando as ferramentas para vê-las aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group cursor-pointer rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:scale-[1.02] relative"
              onClick={() => setLightbox(item.outputImage)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <img
                src={item.outputImage}
                alt={item.prompt}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
              <div className="p-3 bg-card">
                <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary mb-1">
                  {toolLabels[item.tool] || item.tool}
                </span>
                <p className="text-xs text-foreground truncate">{item.prompt || "Sem prompt"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.model}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox("")} />}
    </div>
  );
}
