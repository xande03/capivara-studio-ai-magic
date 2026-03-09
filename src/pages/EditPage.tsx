import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { AspectRatioSelector, AspectRatio } from "@/components/AspectRatioSelector";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Lightbox } from "@/components/Lightbox";
import { TextOverlayEditor } from "@/components/TextOverlayEditor";
import { CreditsBanner } from "@/components/CreditsBanner";
import { processImage, ModelType } from "@/lib/imageApi";
import { addToHistory, getToolHistory, HistoryItem } from "@/lib/sessionHistory";
import { GeneratingAnimation } from "@/components/GeneratingAnimation";
import { Pencil, Loader2, Download, Crown, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EditPage() {
  const [inputImage, setInputImage] = useState<string>("");
  const [secondImage, setSecondImage] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [model] = useState<ModelType>("nano-banana-pro");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>(() => getToolHistory("edit"));
  const [showTextOverlay, setShowTextOverlay] = useState(false);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const { toast } = useToast();

  const handleEdit = async () => {
    if (!inputImage) { toast({ title: "Selecione uma imagem", variant: "destructive" }); return; }
    if (!prompt.trim()) { toast({ title: "Digite um prompt", variant: "destructive" }); return; }
    setLoading(true);
    const res = await processImage({ action: "edit", prompt, imageBase64: inputImage, imageBase64Second: secondImage || undefined, model, aspectRatio });
    setLoading(false);
    if (res.error) {
      if (res.errorCode === "CREDITS_EXHAUSTED") setCreditsExhausted(true);
      toast({ title: "Erro", description: res.error, variant: "destructive" });
      return;
    }
    if (res.image) {
      setResult(res.image);
      addToHistory({ tool: "edit", prompt, inputImage, outputImage: res.image, model });
      setHistory(getToolHistory("edit"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="tool-header-card glow-cyan">
          <Pencil className="w-7 h-7 text-cyan-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Imagem</h1>
          <p className="text-sm text-muted-foreground">Modificar e combinar imagens</p>
        </div>
      </div>

      <CreditsBanner visible={creditsExhausted} />

      {showTextOverlay && inputImage ? (
        <TextOverlayEditor
          imageSrc={inputImage}
          onConfirm={(dataUrl) => {
            setResult(dataUrl);
            setShowTextOverlay(false);
            addToHistory({ tool: "edit", prompt: "Texto inserido na imagem", inputImage, outputImage: dataUrl, model });
            setHistory(getToolHistory("edit"));
          }}
          onCancel={() => setShowTextOverlay(false)}
        />
      ) : (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Imagem Original</h3>
          <ImageUploader onImageSelect={setInputImage} currentImage={inputImage} onClear={() => setInputImage("")} label="Imagem principal" />
          <div>
            <p className="text-xs text-muted-foreground mb-2">Segunda imagem (opcional — para combinar)</p>
            <ImageUploader onImageSelect={setSecondImage} currentImage={secondImage} onClear={() => setSecondImage("")} label="Segunda imagem (opcional)" />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/5 border border-purple-500/10 rounded-xl">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-tight">Utilizando Nano Banana Pro</span>
          </div>
          {inputImage && (
            <Button variant="outline" onClick={() => setShowTextOverlay(true)} className="w-full">
              <Type className="w-4 h-4 mr-2" /> Inserir Texto na Imagem
            </Button>
          )}
          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
          <Textarea placeholder="O que deseja editar? Ex: 'remova o fundo e adicione uma praia'" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="resize-none" rows={3} />
          <Button onClick={handleEdit} disabled={loading || !inputImage || !prompt.trim() || creditsExhausted} className="w-full blue-gradient text-white font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Pencil className="w-4 h-4 mr-2" />}
            {creditsExhausted ? "Créditos Insuficientes" : loading ? "Editando..." : "Editar Imagem"}
          </Button>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Resultado</h3>
          {loading ? (
            <GeneratingAnimation label="Editando imagem..." />
          ) : result ? (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLightbox(result)}>
                <img src={result} alt="Imagem editada" className="w-full object-contain max-h-96" loading="lazy" />
              </div>
              <Button variant="outline" size="sm" onClick={() => { const a = document.createElement("a"); a.href = result; a.download = `edited-${Date.now()}.png`; a.click(); }}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
          ) : (
            <div className="h-64 rounded-xl checkerboard flex items-center justify-center text-muted-foreground text-sm">O resultado aparecerá aqui</div>
          )}
        </div>
      </div>
      )}
      <div>
        <h3 className="text-sm font-medium mb-3 text-foreground">Histórico desta sessão</h3>
        <HistoryPanel items={history} onSelect={(item) => setLightbox(item.outputImage)} />
      </div>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox("")} />}
    </div>
  );
}
