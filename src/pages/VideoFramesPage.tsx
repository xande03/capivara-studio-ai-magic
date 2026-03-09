import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, Film } from "lucide-react";
import { AspectRatioSelector, AspectRatio } from "@/components/AspectRatioSelector";
import { VideoStyleSelector, VideoStyle } from "@/components/VideoStyleSelector";
import { processImage } from "@/lib/imageApi";

export default function VideoFramesPage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [framesCount, setFramesCount] = useState<number>(4);
  const [style, setStyle] = useState<VideoStyle>("Cinematográfico");
  const [isGenerating, setIsGenerating] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt vazio",
        description: "Descreva a cena para gerar os frames.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setFrames([]);
    
    try {
      const generatedFrames: string[] = [];
      
      for (let i = 1; i <= framesCount; i++) {
        const fullPrompt = `${prompt}, estilo ${style}, frame ${i} of ${framesCount} showing progression in the sequence`;
        
        const response = await processImage({
          action: "generate",
          prompt: fullPrompt,
          aspectRatio,
          model: "nano-banana-pro"
        });

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.image) {
          generatedFrames.push(response.image);
          setFrames([...generatedFrames]);
        }
      }
      
      toast({
        title: "Sucesso",
        description: `${framesCount} frames gerados com sucesso!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro na geração",
        description: error.message || "Ocorreu um erro ao gerar os frames.",
        variant: "destructive",
      });
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-fuchsia-500/10 rounded-2xl">
          <Film className="w-6 h-6 text-fuchsia-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Frames de Vídeo</h1>
          <p className="text-muted-foreground mt-1">Crie sequências de imagens para vídeos</p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Textarea
              placeholder="Descreva a cena principal..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-32 resize-none"
            />
          </div>

          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade de Frames</label>
            <div className="flex gap-2">
              {[4, 6, 8, 12].map((num) => (
                <Button
                  key={num}
                  variant={framesCount === num ? "default" : "outline"}
                  onClick={() => setFramesCount(num)}
                  size="sm"
                  className={framesCount === num ? "bg-fuchsia-600 hover:bg-fuchsia-700 text-white" : ""}
                >
                  {num} frames
                </Button>
              ))}
            </div>
          </div>

          <VideoStyleSelector value={style} onChange={setStyle} />

          <Button 
            className="w-full h-12 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-base mt-2"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando frame {frames.length + 1} de {framesCount}...
              </>
            ) : (
              <>
                <Film className="w-5 h-5 mr-2" />
                Gerar Frames
              </>
            )}
          </Button>
        </div>

        <div className="md:col-span-7">
          <div className="bg-card border rounded-3xl p-6 min-h-[400px] flex flex-col">
            {frames.length > 0 || isGenerating ? (
              <div className="grid grid-cols-2 gap-4">
                {frames.map((frame, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border bg-background/50">
                    <img 
                      src={frame} 
                      alt={`Frame ${i+1}`} 
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" onClick={() => downloadFrame(frame, i)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                      Frame {i + 1}
                    </div>
                  </div>
                ))}
                {isGenerating && frames.length < framesCount && (
                  <div className="aspect-video bg-muted rounded-xl flex flex-col items-center justify-center animate-pulse border">
                    <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin mb-2" />
                    <span className="text-sm text-muted-foreground">Processando frame {frames.length + 1}...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                <Film className="w-16 h-16 mb-4 opacity-20" />
                <p>Preencha as configurações e clique em Gerar<br/>para criar sua sequência de frames.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
