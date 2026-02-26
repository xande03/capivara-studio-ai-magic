import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
    QrCode,
    Upload,
    Link as LinkIcon,
    FileText,
    Music,
    File,
    Download,
    Sparkles,
    ChevronRight,
    ShieldCheck,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type QrCategory = "link" | "text" | "pdf" | "music" | "file";

const QrCodePage = () => {
    const [category, setCategory] = useState<QrCategory>("link");
    const [inputValue, setInputValue] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [qrValue, setQrValue] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const qrRef = useRef<HTMLDivElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setInputValue(selectedFile.name);
        }
    };

    const generateQrCode = async () => {
        if (category === "link" || category === "text") {
            if (!inputValue) {
                toast({
                    title: "Erro",
                    description: "Por favor, insira um link ou texto.",
                    variant: "destructive",
                });
                return;
            }
            setIsGenerating(true);
            setTimeout(() => {
                setQrValue(inputValue);
                setIsGenerating(false);
                toast({
                    title: "Sucesso!",
                    description: "Seu QR Code foi gerado com sucesso.",
                });
            }, 800);
        } else {
            if (!file) {
                toast({
                    title: "Erro",
                    description: "Por favor, selecione um arquivo.",
                    variant: "destructive",
                });
                return;
            }

            try {
                setIsUploading(true);
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                const filePath = `qrcode-files/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('generated_contents')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('generated_contents')
                    .getPublicUrl(filePath);

                setQrValue(publicUrl);
                toast({
                    title: "Upload concluído!",
                    description: "Arquivo hospedado e QR Code gerado.",
                });
            } catch (error: any) {
                console.error("Error uploading file:", error);
                toast({
                    title: "Erro no upload",
                    description: error.message || "Tente novamente mais tarde.",
                    variant: "destructive",
                });
            } finally {
                setIsUploading(false);
            }
        }
    };

    const downloadQrCode = () => {
        const svg = qrRef.current?.querySelector("svg");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = 500;
            canvas.height = 500;
            ctx?.drawImage(img, 0, 0, 500, 500);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `qrcode-capivara-${Date.now()}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl emerald-gradient flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight emerald-text">QR Code Magic</h1>
                        <p className="text-muted-foreground text-sm">Crie conexões instantâneas para seus arquivos e mídia</p>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    <Card className="glass-card border-white/10 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                                Configuração do QR Code
                            </CardTitle>
                            <CardDescription>
                                Selecione a categoria e o conteúdo que deseja "implantar" no QR Code.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Tabs defaultValue="link" onValueChange={(v) => setCategory(v as QrCategory)} className="w-full">
                                <TabsList className="grid grid-cols-5 w-full bg-black/20 p-1">
                                    <TabsTrigger value="link" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-500"><LinkIcon className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="pdf" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-500"><FileText className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="music" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-500"><Music className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="file" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-500"><File className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="text" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-500"><Loader2 className="w-4 h-4 rotate-45" /></TabsTrigger>
                                </TabsList>

                                <div className="mt-6 space-y-4">
                                    {(category === "link" || category === "text") ? (
                                        <div className="space-y-2">
                                            <Label htmlFor="content">{category === "link" ? "URL do Destino" : "Texto do QR Code"}</Label>
                                            <Input
                                                id="content"
                                                placeholder={category === "link" ? "https://exemplo.com" : "Digite seu texto aqui..."}
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className="bg-black/20 border-white/10 focus:border-emerald-500/50"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label>Enviar Arquivo ({category.toUpperCase()})</Label>
                                            <label
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all group"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-emerald-500 transition-colors mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        {file ? file.name : `Clique para fazer upload do seu ${category.toUpperCase()}`}
                                                    </p>
                                                </div>
                                                <input type="file" className="hidden" onChange={handleFileUpload} />
                                            </label>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="prompt">Vibe do QR Code (Prompt Visual)</Label>
                                        <Input
                                            id="prompt"
                                            placeholder="Ex: Futurista, Minimalista, Cyberpunk..."
                                            className="bg-black/20 border-white/10 focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>
                            </Tabs>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={generateQrCode}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 gap-2 shadow-lg shadow-emerald-500/20"
                                disabled={isGenerating || isUploading}
                            >
                                {(isGenerating || isUploading) ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        Gerar QR Code Magic
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="flex items-center gap-4 px-2">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            Links Seguros
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Alta Definição
                        </div>
                    </div>
                </div>

                {/* Result Panel */}
                <div className="lg:sticky lg:top-8">
                    <Card className="glass-card border-white/10 p-8 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full" />

                        {qrValue ? (
                            <div className="space-y-8 flex flex-col items-center w-full">
                                <div
                                    ref={qrRef}
                                    className="p-6 bg-white rounded-3xl shadow-2xl relative group"
                                >
                                    <QRCodeSVG
                                        value={qrValue}
                                        size={280}
                                        level="H"
                                        includeMargin={false}
                                    />
                                    <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-3xl group-hover:border-emerald-500/50 transition-colors pointer-events-none" />
                                </div>

                                <div className="text-center space-y-2">
                                    <h3 className="font-bold text-lg text-foreground">QR Code Pronto!</h3>
                                    <p className="text-xs text-muted-foreground max-w-[280px]">
                                        Aponte a câmera para testar. O link gerado expira em 30 dias se o arquivo for removido.
                                    </p>
                                </div>

                                <Button
                                    onClick={downloadQrCode}
                                    variant="outline"
                                    className="w-full max-w-[280px] border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-500 font-bold h-12 gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Baixar QR Code (PNG)
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 flex flex-col items-center animate-pulse">
                                <div className="w-48 h-48 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                                    <QrCode className="w-16 h-16 text-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-muted-foreground font-medium">Aguardando configuração...</p>
                                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-tighter">O QR Code aparecerá aqui</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QrCodePage;
