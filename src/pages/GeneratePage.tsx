import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { ModelSelector } from "@/components/ModelSelector";
import { CreationModeSelector, CREATION_MODES, CreationMode } from "@/components/CreationModeSelector";
import { AspectRatioSelector, AspectRatio } from "@/components/AspectRatioSelector";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Lightbox } from "@/components/Lightbox";
import { GeneratingAnimation } from "@/components/GeneratingAnimation";
import { CreditsBanner } from "@/components/CreditsBanner";
import { processImage, ModelType } from "@/lib/imageApi";
import { addToHistory, getToolHistory, HistoryItem } from "@/lib/sessionHistory";
import { Sparkles, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GeneratePage() {
  const [inputImage, setInputImage] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelType>("nano-banana-pro");
  const [creationMode, setCreationMode] = useState<CreationMode>("modo-livre");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>(() => getToolHistory("generate"));
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const previousModeRef = useRef<CreationMode>("modo-livre");
  const { toast } = useToast();

  const handleModeChange = (newMode: CreationMode) => {
    const prevMode = previousModeRef.current;
    const prevInstruction = CREATION_MODES.find(m => m.id === prevMode)?.instruction || "";
    const newInstruction = CREATION_MODES.find(m => m.id === newMode)?.instruction || "";

    if (!prompt.trim() || prompt.trim() === prevInstruction.trim()) {
      setPrompt(newInstruction);
    }

    previousModeRef.current = newMode;
    setCreationMode(newMode);
  };

  const handleGenerate = async () => {
    const selectedMode = CREATION_MODES.find(m => m.id === creationMode);
    const modeInstruction = selectedMode?.instruction || "";

    if (!prompt.trim() && !inputImage) {
      toast({ title: "Digite um prompt ou adicione uma imagem", variant: "destructive" });
      return;
    }

    setLoading(true);

    const finalPrompt = modeInstruction
      ? `${modeInstruction} ${prompt}`.trim()
      : prompt;

    const res = await processImage({
      action: "generate",
      prompt: finalPrompt,
      imageBase64: inputImage || undefined,
      model,
      aspectRatio
    });

    setLoading(false);
    if (res.error) {
      if (res.errorCode === "CREDITS_EXHAUSTED") setCreditsExhausted(true);
      toast({ title: "Erro", description: res.error, variant: "destructive" });
      return;
    }
    if (res.image) {
      setResult(res.image);
      addToHistory({ tool: "generate", prompt: finalPrompt, inputImage: inputImage || undefined, outputImage: res.image, model });
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
          <h1 className="text-2xl font-bold text-foreground">Gerar Imagem</h1>
          <p className="text-sm text-muted-foreground">Criar imagens com IA — agora com suporte a imagem de referência</p>
        </div>
      </div>

      <CreditsBanner visible={creditsExhausted} />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Configurações</h3>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Imagem de Referência (Opcional)</p>
            <ImageUploader onImageSelect={setInputImage} currentImage={inputImage} onClear={() => setInputImage("")} label="Arraste uma imagem base" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Modelo de IA</p>
            <ModelSelector value={model} onChange={setModel} />
          </div>
          <CreationModeSelector value={creationMode} onChange={handleModeChange} />
          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
          <Textarea
            placeholder={creationMode === "avatar" ? "Descreva o avatar desejado ou deixe vazio para usar a imagem..." : "Descreva o que deseja criar..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none"
            rows={4}
          />
          <Button
            onClick={handleGenerate}
            disabled={loading || creditsExhausted || (!prompt.trim() && !inputImage)}
            className="w-full blue-gradient text-white font-semibold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {creditsExhausted ? "Créditos Insuficientes" : loading ? "Gerando..." : "Gerar Imagem"}
          </Button>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Resultado</h3>
          {loading ? (
            <GeneratingAnimation label="Gerando imagem..." />
          ) : result ? (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLightbox(result)}>
                <img src={result} alt="Imagem gerada" className="w-full object-contain max-h-96" loading="lazy" />
              </div>
              <Button variant="outline" size="sm" onClick={() => { const a = document.createElement("a"); a.href = result; a.download = `generated-${Date.now()}.png`; a.click(); }}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
          ) : (
            <div className="h-64 rounded-xl checkerboard flex items-center justify-center text-muted-foreground text-sm">A imagem gerada aparecerá aqui</div>
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
