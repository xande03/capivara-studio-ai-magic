import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { AspectRatioSelector, AspectRatio } from "@/components/AspectRatioSelector";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Lightbox } from "@/components/Lightbox";
import { CreditsBanner } from "@/components/CreditsBanner";
import { processImage, ModelType } from "@/lib/imageApi";
import { addToHistory, getToolHistory, HistoryItem } from "@/lib/sessionHistory";
import { GeneratingAnimation } from "@/components/GeneratingAnimation";
import { Scissors, Loader2, Download, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RemoveBgPage() {
  const [inputImage, setInputImage] = useState<string>("");
  const [model] = useState<ModelType>("nano-banana-pro");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>(() => getToolHistory("remove-bg"));
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const { toast } = useToast();

  const handleRemove = async () => {
    if (!inputImage) { toast({ title: "Selecione uma imagem", variant: "destructive" }); return; }
    setLoading(true);
    const res = await processImage({ action: "remove-bg", imageBase64: inputImage, model, aspectRatio });
    setLoading(false);
    if (res.error) {
      if (res.errorCode === "CREDITS_EXHAUSTED") setCreditsExhausted(true);
      toast({ title: "Erro", description: res.error, variant: "destructive" });
      return;
    }
    if (res.image) {
      setResult(res.image);
      addToHistory({ tool: "remove-bg", prompt: "Remover fundo", inputImage, outputImage: res.image, model });
      setHistory(getToolHistory("remove-bg"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="tool-header-card glow-teal">
          <Scissors className="w-7 h-7 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Remover Fundo</h1>
          <p className="text-sm text-muted-foreground">Remova o background automaticamente com IA</p>
        </div>
      </div>

      <CreditsBanner visible={creditsExhausted} />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Imagem Original</h3>
          <ImageUploader onImageSelect={setInputImage} currentImage={inputImage} onClear={() => setInputImage("")} />
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/5 border border-purple-500/10 rounded-xl">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-tight">Utilizando Nano Banana Pro</span>
          </div>
          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
          <Button onClick={handleRemove} disabled={loading || !inputImage || creditsExhausted} className="w-full blue-gradient text-white font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Scissors className="w-4 h-4 mr-2" />}
            {creditsExhausted ? "Créditos Insuficientes" : loading ? "Removendo..." : "Remover Fundo"}
          </Button>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Resultado</h3>
          {loading ? (
            <GeneratingAnimation label="Removendo fundo..." />
          ) : result ? (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLightbox(result)}>
                <img src={result} alt="Sem fundo" className="w-full object-contain max-h-96" loading="lazy" />
              </div>
              <Button variant="outline" size="sm" onClick={() => { const a = document.createElement("a"); a.href = result; a.download = `no-bg-${Date.now()}.png`; a.click(); }}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
          ) : (
            <div className="h-64 rounded-xl checkerboard flex items-center justify-center text-muted-foreground text-sm">O resultado aparecerá aqui</div>
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
