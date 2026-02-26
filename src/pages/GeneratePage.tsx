import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "@/components/ModelSelector";
import { CreationModeSelector, CREATION_MODES, CreationMode } from "@/components/CreationModeSelector";
import { AspectRatioSelector, AspectRatio } from "@/components/AspectRatioSelector";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Lightbox } from "@/components/Lightbox";
import { processImage, ModelType } from "@/lib/imageApi";
import { addToHistory, getToolHistory, HistoryItem } from "@/lib/sessionHistory";
import { Sparkles, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelType>("nano-banana");
  const [creationMode, setCreationMode] = useState<CreationMode>("modo-livre");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>(() => getToolHistory("generate"));
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Digite um prompt", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Construct optimized prompt based on creation mode
    const selectedMode = CREATION_MODES.find(m => m.id === creationMode);
    const finalPrompt = selectedMode?.instruction
      ? `${selectedMode.instruction} ${prompt}`
      : prompt;

    const res = await processImage({
      action: "generate",
      prompt: finalPrompt,
      model,
      aspectRatio
    });

    setLoading(false);
    if (res.error) {
      toast({ title: "Erro", description: res.error, variant: "destructive" });
      return;
    }
    if (res.image) {
      setResult(res.image);
      addToHistory({ tool: "generate", prompt: finalPrompt, outputImage: res.image, model });
      setHistory(getToolHistory("generate"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="tool-header-card glow-blue">
          <Sparkles className="w-7 h-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gerar Imagem
          </h1>
          <p className="text-sm text-muted-foreground">
            Criar imagens com IA
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Configurações</h3>
          <ModelSelector value={model} onChange={setModel} />
          <CreationModeSelector value={creationMode} onChange={setCreationMode} />
          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
          <Textarea
            placeholder="Descreva o que deseja criar..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none"
            rows={4}
          />
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="w-full blue-gradient text-white font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Gerando..." : "Gerar Imagem"}
          </Button>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Resultado</h3>
          {result ? (
            <div className="space-y-3">
              <div
                className="rounded-xl overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setLightbox(result)}
              >
                <img src={result} alt="Imagem gerada" className="w-full object-contain max-h-96" loading="lazy" />
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                const a = document.createElement("a");
                a.href = result;
                a.download = `generated-${Date.now()}.png`;
                a.click();
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          ) : (
            <div className="h-64 rounded-xl checkerboard flex items-center justify-center text-muted-foreground text-sm">
              A imagem gerada aparecerá aqui
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3 text-foreground">Histórico desta sessão</h3>
        <HistoryPanel items={history} onSelect={(item) => setLightbox(item.outputImage)} />
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox("")} />}
    </div>
  );
}
