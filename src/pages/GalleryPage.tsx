import { useState } from "react";
import { getAllHistory, HistoryItem } from "@/lib/sessionHistory";
import { Lightbox } from "@/components/Lightbox";
import { LayoutGrid } from "lucide-react";

const toolLabels: Record<string, string> = {
  upscale: "Upscale",
  generate: "Geração",
  edit: "Edição",
  "remove-bg": "Remover Fundo",
};

export default function GalleryPage() {
  const [items] = useState<HistoryItem[]>(() => getAllHistory());
  const [lightbox, setLightbox] = useState<string>("");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold gold-text flex items-center gap-2">
          <LayoutGrid className="w-7 h-7 text-primary" />
          Galeria
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Todas as imagens processadas nesta sessão ({items.length} itens)
        </p>
      </div>

      {items.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <LayoutGrid className="w-16 h-16 mx-auto mb-4 text-primary/40" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Galeria Vazia</h2>
          <p className="text-sm text-muted-foreground">
            Processe imagens usando as ferramentas para vê-las aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group cursor-pointer rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:scale-[1.02]"
              onClick={() => setLightbox(item.outputImage)}
            >
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
