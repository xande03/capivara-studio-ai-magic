import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Download, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/ImageUploader";
import { GeneratingAnimation } from "@/components/GeneratingAnimation";

export default function MusicFxPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState("");
  const [intensity, setIntensity] = useState([50]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const effects = [
    { id: "reverb", name: "Reverb", description: "Adicionar reverberação" },
    { id: "distortion", name: "Distortion", description: "Efeito de distorção" },
    { id: "chorus", name: "Chorus", description: "Efeito de coro" },
    { id: "flanger", name: "Flanger", description: "Efeito flanger" },
    { id: "phaser", name: "Phaser", description: "Efeito phaser" },
    { id: "delay", name: "Delay", description: "Eco e atraso" },
    { id: "pitch-shift", name: "Pitch Shift", description: "Mudar tom" },
    { id: "tempo-change", name: "Mudar Tempo", description: "Acelerar ou diminuir" },
    { id: "noise-reduction", name: "Redução de Ruído", description: "Remover ruído" },
    { id: "equalizer", name: "Equalizador", description: "Ajustar frequências" },
  ];

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, envie um arquivo de áudio.",
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);
  };

  const handleProcess = async () => {
    if (!selectedFile || !selectedEffect) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione um arquivo e um efeito.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResultUrl(null);

    try {
      // Simulação de processamento
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Simular resultado
      setResultUrl("https://example.com/result.mp3");
      
      toast({
        title: "Processamento concluído!",
        description: "Seu áudio com efeito foi gerado.",
      });
    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar seu áudio.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = `music-fx-${Date.now()}.mp3`;
      a.click();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Music FX</h1>
        <p className="text-muted-foreground">
          Aplique efeitos de áudio com IA para transformar suas músicas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Upload de Áudio
            </CardTitle>
            <CardDescription>
              Envie um arquivo de áudio para aplicar efeitos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="audio-upload">Selecione um arquivo de áudio</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                <ImageUploader
                  onImageSelect={(base64) => {
                    // Em um caso real, aqui converteríamos base64 para File
                    // Para simplificar, vamos simular
                    const fakeFile = new File(
                      [base64],
                      "audio.mp3",
                      { type: "audio/mpeg" }
                    );
                    handleFileUpload(fakeFile);
                  }}
                  label="Arraste ou clique para upload"
                  currentImage={selectedFile ? URL.createObjectURL(selectedFile) : undefined}
                />
              </div>
              {selectedFile && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Arquivo selecionado: {selectedFile.name}
                </div>
              )}
            </div>

            <div className="mb-4">
              <Label htmlFor="effect-select">Selecione um efeito</Label>
              <Select value={selectedEffect} onValueChange={setSelectedEffect}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um efeito" />
                </SelectTrigger>
                <SelectContent>
                  {effects.map((effect) => (
                    <SelectItem key={effect.id} value={effect.id}>
                      <div>
                        <div className="font-medium">{effect.name}</div>
                        <div className="text-xs text-muted-foreground">{effect.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="intensity">Intensidade: {intensity[0]}%</Label>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="mb-6">
              <Label htmlFor="custom-prompt">Instruções customizadas (opcional)</Label>
              <Textarea
                id="custom-prompt"
                placeholder="Descreva como você quer que o efeito seja aplicado..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleProcess}
              disabled={isProcessing || !selectedFile || !selectedEffect}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Aplicar Efeito"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
            <CardDescription>
              Áudio processado com o efeito selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center h-64">
                <GeneratingAnimation label="Processando áudio..." />
              </div>
            ) : resultUrl ? (
              <div className="flex flex-col items-center">
                <div className="mb-4 w-full">
                  <audio controls src={resultUrl} className="w-full" />
                </div>
                <Button onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Áudio
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Music className="h-12 w-12 mb-4 opacity-50" />
                <p>Seu áudio processado aparecerá aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Efeitos Disponíveis</CardTitle>
            <CardDescription>
              Explore diferentes efeitos para transformar seu áudio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {effects.map((effect) => (
                <div
                  key={effect.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedEffect === effect.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  }`}
                  onClick={() => setSelectedEffect(effect.id)}
                >
                  <h3 className="font-medium">{effect.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {effect.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}