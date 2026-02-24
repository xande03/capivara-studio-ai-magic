import { useState } from "react";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatioSelector, AspectRatio } from "@/components/AspectRatioSelector";
import { useToast } from "@/hooks/use-toast";

const videoModels = [
  { id: "seedream", label: "SeedReam" },
  { id: "veo", label: "Veo" },
  { id: "runway", label: "Runway" },
];

export default function VideoPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("seedream");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({ title: "Digite um prompt", description: "Descreva o vídeo que deseja gerar.", variant: "destructive" });
      return;
    }
    toast({ title: "Em desenvolvimento", description: `Geração de vídeo com ${videoModels.find(m => m.id === selectedModel)?.label} estará disponível em breve.` });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold gold-text flex items-center gap-2">
          <Film className="w-7 h-7 text-primary" />
          Gerar Vídeo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Descreva o vídeo que deseja criar e escolha o modelo de IA
        </p>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Prompt</label>
          <Textarea
            placeholder="Descreva o vídeo que deseja gerar..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="bg-secondary/50 border-border resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Modelo</label>
          <div className="flex gap-2 flex-wrap">
            {videoModels.map((model) => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedModel(model.id)}
                className={selectedModel === model.id ? "gold-gradient text-primary-foreground" : ""}
              >
                {model.label}
              </Button>
            ))}
          </div>
        </div>

        <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />

        <Button onClick={handleGenerate} className="w-full gold-gradient text-primary-foreground font-semibold">
          <Film className="w-4 h-4 mr-2" />
          Gerar Vídeo
        </Button>
      </div>
    </div>
  );
}
