import { Button } from "@/components/ui/button";
import {
    Palette,
    Smile,
    Presentation,
    Layout,
    StickyNote,
    Laptop,
    MousePointer2,
    Image as ImageIcon
} from "lucide-react";

export type CreationMode =
    | "anime"
    | "caricatura"
    | "slide"
    | "logomarca"
    | "adesivo"
    | "web-ui"
    | "modo-livre"
    | "poster";

export const CREATION_MODES: { id: CreationMode; label: string; icon: any; instruction: string }[] = [
    {
        id: "modo-livre",
        label: "Modo Livre",
        icon: MousePointer2,
        instruction: ""
    },
    {
        id: "anime",
        label: "Anime",
        icon: Palette,
        instruction: "Japanese anime style, vibrant colors, sharp and expressive lines."
    },
    {
        id: "caricatura",
        label: "Caricatura",
        icon: Smile,
        instruction: "Comic and exaggerated caricature style, artistic and expressive lines."
    },
    {
        id: "slide",
        label: "Slide",
        icon: Presentation,
        instruction: "Corporate presentation slide style, clean, informative and professional visual."
    },
    {
        id: "logomarca",
        label: "Logomarca",
        icon: Layout,
        instruction: "Logo design, minimalist, vectorized, solid background, professional look."
    },
    {
        id: "adesivo",
        label: "Adesivo",
        icon: StickyNote,
        instruction: "Sticker style, sharp white outline, pop colors, modern look."
    },
    {
        id: "web-ui",
        label: "Web UI",
        icon: Laptop,
        instruction: "Web interface design (Web UI), modern layout, UI elements, clean visual."
    },
    {
        id: "poster",
        label: "Poster",
        icon: ImageIcon,
        instruction: "Cinematic poster style, high-impact artistic composition, dramatic lighting."
    },
];

interface Props {
    value: CreationMode;
    onChange: (v: CreationMode) => void;
}

export function CreationModeSelector({ value, onChange }: Props) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-foreground block">Modo de Criação</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {CREATION_MODES.map((mode) => (
                    <Button
                        key={mode.id}
                        type="button"
                        variant={value === mode.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => onChange(mode.id)}
                        className={`flex items-center gap-2 justify-center px-2 py-5 h-auto transition-all duration-300 ${value === mode.id ? "blue-gradient text-white border-transparent shadow-md" : "hover:bg-secondary/50"
                            }`}
                    >
                        <mode.icon className={`h-4 w-4 shrink-0 ${value === mode.id ? "text-white" : "text-primary"}`} />
                        <span className="text-[11px] font-semibold leading-tight break-words">{mode.label}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
