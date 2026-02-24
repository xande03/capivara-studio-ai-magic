import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { ModelSelector } from "@/components/ModelSelector";
import { AspectRatioSelector, AspectRatio } from "@/components/AspectRatioSelector";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Lightbox } from "@/components/Lightbox";
import { processImage, ModelType } from "@/lib/imageApi";
import { addToHistory, getToolHistory, HistoryItem } from "@/lib/sessionHistory";
import { ArrowUpCircle, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UpscalePage() {
  const [inputImage, setInputImage] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelType>("nano-banana");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>(() => getToolHistory("upscale"));
  const { toast } = useToast();

  const handleProcess = async () => {
    if (!inputImage) {
      toast({ title: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    setLoading(true);
    const res = await processImage({ action: "upscale", prompt, imageBase64: inputImage, model, aspectRatio });
    setLoading(false);
    if (res.error) {
      toast({ title: "Erro", description: res.error, variant: "destructive" });
      return;
    }
    if (res.image) {
      setResult(res.image);
      addToHistory({ tool: "upscale", prompt, inputImage, outputImage: res.image, model });
      setHistory(getToolHistory("upscale"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold gold-text flex items-center gap-2">
          <ArrowUpCircle className="w-7 h-7 text-primary" />
          Upscale & Restauração
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aumente a resolução e restaure detalhes com IA
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ImageUploader
            onImageSelect={setInputImage}
            currentImage={inputImage}
            onClear={() => setInputImage("")}
            label="Imagem para upscale"
          />
          <ModelSelector value={model} onChange={setModel} />
          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
          <Textarea
            placeholder="Prompt de guia (opcional): ex. 'ultra realista, detalhes nítidos, iluminação cinematográfica'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <Button onClick={handleProcess} disabled={loading || !inputImage} className="w-full gold-gradient text-background font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowUpCircle className="w-4 h-4 mr-2" />}
            {loading ? "Processando..." : "Fazer Upscale"}
          </Button>
        </div>

        <div className="space-y-4">
          {result ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Resultado</h3>
              <div
                className="rounded-xl overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setLightbox(result)}
              >
                <img src={result} alt="Resultado upscale" className="w-full object-contain max-h-96" loading="lazy" />
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                const a = document.createElement("a");
                a.href = result;
                a.download = `upscale-${Date.now()}.png`;
                a.click();
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          ) : (
            <div className="h-64 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
              O resultado aparecerá aqui
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
