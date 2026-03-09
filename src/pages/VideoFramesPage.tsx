import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CreditsBanner } from "@/components/CreditsBanner";
import { FrameSequenceViewer } from "@/components/FrameSequenceViewer";
import { Loader2, Download, Film, PackageOpen } from "lucide-react";
import { AspectRatioSelector, AspectRatio } from "@/components/AspectRatioSelector";
import { VideoStyleSelector, VideoStyle } from "@/components/VideoStyleSelector";
import { processImage } from "@/lib/imageApi";
import JSZip from "jszip";

export default function VideoFramesPage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [framesCount, setFramesCount] = useState<number>(4);
  const [style, setStyle] = useState<VideoStyle>("Cinematográfico");
  const [isGenerating, setIsGenerating] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const { toast } = useToast();

  const getSequenceContext = (i: number, total: number) => {
    if (i === 1) return "início da cena, estabelecendo o cenário e personagens";
    if (i === total) return "conclusão da cena, momento final e resolução";
    if (i <= total * 0.3) return "desenvolvimento inicial, construindo a ação";
    if (i <= total * 0.7) return "meio da ação, clímax ou momento de tensão";
    return "transição para o final, desaceleração da ação";
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt vazio", description: "Descreva a cena para gerar os frames.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setFrames([]);
    try {
      const generatedFrames: string[] = [];
      for (let i = 1; i <= framesCount; i++) {
        const context = getSequenceContext(i, framesCount);
        const fullPrompt = `${prompt}, estilo ${style}, frame ${i} of ${framesCount} showing sequential progression in a storyboard (${context}), maintain visual consistency with previous frames`;
        const response = await processImage({ action: "generate", prompt: fullPrompt, aspectRatio, model: "nano-banana-pro" });
        if (response.error) {
          if (response.errorCode === "CREDITS_EXHAUSTED") setCreditsExhausted(true);
          throw new Error(response.error);
        }
        if (response.image) {
          generatedFrames.push(response.image);
          setFrames([...generatedFrames]);
        }
      }
      toast({ title: "Sucesso!", description: `${framesCount} frames gerados com sucesso!` });
    } catch (error: any) {
      toast({ title: "Erro na geração", description: error.message || "Ocorreu um erro ao gerar os frames.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFrame = (imageStr: string, index: number) => {
    const a = document.createElement("a");
    a.href = imageStr;
    a.download = `frame-${index + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllFrames = async () => {
    if (frames.length === 0) return;
    toast({ title: "Preparando ZIP..." });
    try {
      const zip = new JSZip();
      await Promise.all(
        frames.map(async (frame, index) => {
          const response = await fetch(frame);
          const blob = await response.blob();
          zip.file(`frame-${index + 1}.png`, blob);
        })
      );
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `frames-sequence-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "ZIP baixado com sucesso!" });
    } catch {
      toast({ title: "Erro ao criar ZIP", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Film className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Sequência de Frames</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gere imagens sequenciais para storyboards, animações e vídeos
          </p>
        </div>
      </div>

      <CreditsBanner visible={creditsExhausted} />

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Descrição da Cena</label>
            <Textarea
              placeholder="Ex: Um gato astronauta flutuando no espaço, se aproximando da lua com estrelas ao fundo..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-32 resize-none"
            />
            <p className="text-[10px] text-muted-foreground">
              💡 Descreva a cena completa — cada frame será gerado com contexto narrativo (início, meio e fim)
            </p>
          </div>

          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quantidade de Frames</label>
            <div className="flex gap-2">
              {[4, 6, 8, 12].map((num) => (
                <Button
                  key={num}
                  variant={framesCount === num ? "default" : "outline"}
                  onClick={() => setFramesCount(num)}
                  size="sm"
                  className={framesCount === num ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
                >
                  {num} frames
                </Button>
              ))}
            </div>
          </div>

          <VideoStyleSelector value={style} onChange={setStyle} />

          <Button
            className="w-full h-12 text-base mt-2"
            onClick={handleGenerate}
            disabled={isGenerating || creditsExhausted}
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Gerando frame {frames.length + 1} de {framesCount}...</>
            ) : creditsExhausted ? (
              "Créditos Insuficientes"
            ) : (
              <><Film className="w-5 h-5 mr-2" /> Gerar Sequência</>
            )}
          </Button>
        </div>

        <div className="md:col-span-7 space-y-4">
          {/* Frame Sequence Viewer */}
          {frames.length > 1 && !isGenerating && (
            <FrameSequenceViewer frames={frames} />
          )}

          {/* Grid */}
          <div className="bg-card border rounded-2xl p-5 min-h-[300px] flex flex-col">
            {frames.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">{frames.length} frame(s) gerado(s)</h3>
                {frames.length > 1 && (
                  <Button variant="outline" size="sm" onClick={downloadAllFrames} className="gap-1.5">
                    <PackageOpen className="w-4 h-4" /> Baixar Todos (ZIP)
                  </Button>
                )}
              </div>
            )}

            {frames.length > 0 || isGenerating ? (
              <div className={`grid gap-3 ${frames.length <= 4 ? "grid-cols-2" : frames.length <= 6 ? "grid-cols-3" : "grid-cols-4"}`}>
                {frames.map((frame, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border bg-background/50">
                    <img src={frame} alt={`Frame ${i + 1}`} className="w-full h-auto object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="icon" variant="secondary" onClick={() => downloadFrame(frame, i)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {i + 1}/{framesCount}
                    </div>
                  </div>
                ))}
                {isGenerating && frames.length < framesCount && (
                  <div className="aspect-video bg-muted rounded-xl flex flex-col items-center justify-center animate-pulse border">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                    <span className="text-xs text-muted-foreground">Frame {frames.length + 1}...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                <Film className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm">Descreva uma cena e clique em Gerar<br />para criar sua sequência de frames</p>
                <p className="text-[10px] mt-2 opacity-60">Cada frame é gerado com contexto narrativo para manter continuidade visual</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
