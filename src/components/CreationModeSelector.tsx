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
        instruction: "Estilo anime japonês, cores vibrantes, traços nítidos e expressivos."
    },
    {
        id: "caricatura",
        label: "Caricatura",
        icon: Smile,
        instruction: "Estilo caricatura cômica e exagerada, traços artísticos e expressivos."
    },
    {
        id: "slide",
        label: "Slide",
        icon: Presentation,
        instruction: "Estilo slide de apresentação corporativa, clean, visual informativo e profissional."
    },
    {
        id: "logomarca",
        label: "Logomarca",
        icon: Layout,
        instruction: "Design de logomarca (logo), minimalista, vetorizado, fundo sólido, visual profissional."
    },
    {
        id: "adesivo",
        label: "Adesivo",
        icon: StickyNote,
        instruction: "Estilo adesivo (sticker), contorno branco nítido, cores pop, visual moderno."
    },
    {
        id: "web-ui",
        label: "Web UI",
        icon: Laptop,
        instruction: "Design de interface de web (Web UI), layout moderno, elementos de UI, visual limpo."
    },
    {
        id: "poster",
        label: "Poster",
        icon: ImageIcon,
        instruction: "Estilo poster cinematográfico, composição artística de alto impacto, iluminação dramática."
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CREATION_MODES.map((mode) => (
                    <Button
                        key={mode.id}
                        type="button"
                        variant={value === mode.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => onChange(mode.id)}
                        className={`flex items-center gap-2 justify-start px-3 py-4 h-auto ${value === mode.id ? "gold-gradient text-primary-foreground border-transparent" : "hover:bg-secondary/50"
                            }`}
                    >
                        <mode.icon className={`h-4 w-4 ${value === mode.id ? "text-primary-foreground" : "text-primary"}`} />
                        <span className="text-xs font-medium">{mode.label}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
