import { Button } from "@/components/ui/button";
import {
    Palette,
    Smile,
    Presentation,
    Layout,
    StickyNote,
    Laptop,
    MousePointer2,
    Image as ImageIcon,
    BookOpen
} from "lucide-react";

export type CreationMode =
    | "anime"
    | "caricatura"
    | "slide"
    | "logomarca"
    | "adesivo"
    | "web-ui"
    | "modo-livre"
    | "hq"
    | "poster";

export const CREATION_MODES: { id: CreationMode; label: string; description: string; icon: any; instruction: string }[] = [
    {
        id: "modo-livre",
        label: "Livre",
        description: "Sem restrição de estilo",
        icon: MousePointer2,
        instruction: ""
    },
    {
        id: "caricatura",
        label: "Caricatura",
        description: "Estilo caricatura exagerada",
        icon: Smile,
        instruction: "Comic and exaggerated caricature style, artistic and expressive lines."
    },
    {
        id: "logomarca",
        label: "Logomarca",
        description: "Logo profissional",
        icon: Layout,
        instruction: "Logo design, minimalist, vectorized, solid background, professional look."
    },
    {
        id: "poster",
        label: "Poster",
        description: "Arte/design gráfico",
        icon: ImageIcon,
        instruction: "Cinematic poster style, high-impact artistic composition, dramatic lighting."
    },
    {
        id: "hq",
        label: "HQ",
        description: "Estilo quadrinhos clássico",
        icon: BookOpen,
        instruction: "Western comic book style, sharp inks, bold colors, dynamic layout, classic graphic novel aesthetic."
    },
    {
        id: "slide",
        label: "Slide",
        description: "Visual para apresentação",
        icon: Presentation,
        instruction: "Corporate presentation slide style, clean, informative and professional visual."
    },
    {
        id: "web-ui",
        label: "Web UI",
        description: "Interface web/app",
        icon: Laptop,
        instruction: "Web interface design (Web UI), modern layout, UI elements, clean visual."
    },
    {
        id: "adesivo",
        label: "Adesivo",
        description: "Sticker com contorno",
        icon: StickyNote,
        instruction: "Sticker style, sharp white outline, pop colors, modern look."
    },
    {
        id: "anime",
        label: "Anime",
        description: "Desenho japonês moderno",
        icon: Palette,
        instruction: "Japanese anime style, vibrant colors, sharp and expressive lines."
    },
];

interface Props {
    value: CreationMode;
    onChange: (v: CreationMode) => void;
}

export function CreationModeSelector({ value, onChange }: Props) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground">Modo de Criação</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {CREATION_MODES.map((mode) => (
                    <button
                        key={mode.id}
                        type="button"
                        onClick={() => onChange(mode.id)}
                        className={`group relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 border-2 overflow-hidden ${value === mode.id
                            ? "bg-orange-500/10 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                            : "bg-card/30 border-white/5 hover:border-white/10 hover:bg-card/50"
                            }`}
                    >
                        <div className={`mb-2 transition-transform duration-300 group-hover:scale-110 ${value === mode.id ? "text-orange-500" : "text-muted-foreground/80"
                            }`}>
                            <mode.icon className="h-6 w-6" />
                        </div>
                        <span className={`text-sm font-bold mb-0.5 transition-colors ${value === mode.id ? "text-orange-500" : "text-foreground/90"
                            }`}>
                            {mode.label}
                        </span>
                        <span className={`text-[9px] text-center leading-tight transition-colors ${value === mode.id ? "text-orange-500/80" : "text-muted-foreground/70"
                            }`}>
                            {mode.description}
                        </span>

                        {value === mode.id && (
                            <div className="absolute top-2 right-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
