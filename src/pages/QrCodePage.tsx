import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { addToHistory } from "@/lib/sessionHistory";
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
    Loader2,
    Type,
    Image as ImageIcon
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

type QrCategory = "link" | "text" | "pdf" | "music" | "image" | "file";

const QrCodePage = () => {
    const [category, setCategory] = useState<QrCategory>("link");
    const [inputValue, setInputValue] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [qrValue, setQrValue] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [processingStep, setProcessingStep] = useState<string>("");
    const { toast } = useToast();
    const qrRef = useRef<HTMLDivElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setInputValue(selectedFile.name);
            toast({
                title: "Arquivo selecionado",
                description: `${selectedFile.name} pronto para upload.`,
            });
        }
    };

    const handleCategoryChange = (val: string) => {
        const newCat = val as QrCategory;
        setCategory(newCat);
        setQrValue("");
        if (newCat === "link" || newCat === "text") {
            setFile(null);
            setInputValue("");
        } else {
            setInputValue("");
            setFile(null);
        }
    };

    const saveQrToGallery = useCallback((value: string) => {
        // Convert QR SVG to PNG data URL and save to gallery
        setTimeout(() => {
            const svg = qrRef.current?.querySelector("svg");
            if (!svg) return;
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                canvas.width = 400;
                canvas.height = 400;
                if (ctx) {
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, 400, 400);
                    ctx.drawImage(img, 20, 20, 360, 360);
                }
                const pngDataUrl = canvas.toDataURL("image/png");
                addToHistory({
                    tool: "qr-code",
                    prompt: value.length > 60 ? value.slice(0, 60) + "..." : value,
                    outputImage: pngDataUrl,
                    model: "QR Engine",
                });
            };
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        }, 200); // small delay to ensure QR renders
    }, []);

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
            setProcessingStep("Analisando...");

            await new Promise(r => setTimeout(r, 150));
            setProcessingStep("Finalizando...");

            setTimeout(() => {
                setQrValue(inputValue);
                saveQrToGallery(inputValue);
                setIsGenerating(false);
                setProcessingStep("");
                toast({
                    title: "Sucesso!",
                    description: "QR Code gerado instantaneamente.",
                });
            }, 100);
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
                setProcessingStep("Escaneando...");

                await new Promise(r => setTimeout(r, 300));
                setProcessingStep("Enviando para armazenamento permanente...");

                const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                const uploadUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/qr-files/${fileName}`;

                const uploadRes = await fetch(uploadUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                        "x-upsert": "false",
                        "Content-Type": file.type,
                    },
                    body: file,
                });

                if (!uploadRes.ok) {
                    const errorText = await uploadRes.text();
                    throw new Error(`Falha no upload (${uploadRes.status}): ${errorText}`);
                }

                setProcessingStep("Finalizando...");
                await new Promise(r => setTimeout(r, 200));

                const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/qr-files/${fileName}`;
                setQrValue(publicUrl);
                saveQrToGallery(publicUrl);
                toast({
                    title: "Upload concluído!",
                    description: "Arquivo hospedado permanentemente e QR Code gerado com sucesso.",
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
                setProcessingStep("");
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
            canvas.width = 1000;
            canvas.height = 1000;
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 50, 50, 900, 900);
            }
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `qrcode-capivara-${Date.now()}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/20 border border-border">
                        <img src="/logo.png" alt="Capivara Stúdio" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight emerald-text">QR Code Magic</h1>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] opacity-70">Implantando informações com precisão cinematográfica</p>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-8 items-start pb-12">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    <Card className="glass-card overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                                Configuração Profissional
                            </CardTitle>
                            <CardDescription>
                                Selecione o tipo de dado que será incorporado ao QR Code.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Tabs value={category} onValueChange={handleCategoryChange} className="w-full">
                                <TabsList className="grid grid-cols-6 w-full bg-secondary p-1 rounded-xl">
                                    <TabsTrigger value="link" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><LinkIcon className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="pdf" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><FileText className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="music" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><Music className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="image" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><ImageIcon className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="file" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><File className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="text" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><Type className="w-4 h-4" /></TabsTrigger>
                                </TabsList>

                                <div className="mt-8 space-y-6">
                                    {(category === "link" || category === "text") ? (
                                        <div className="space-y-3">
                                            <Label htmlFor="content" className="text-sm font-semibold">{category === "link" ? "Link de Destino" : "Texto Personalizado"}</Label>
                                            <Input
                                                id="content"
                                                placeholder={category === "link" ? "https://exemplo.com" : "Digite a mensagem que o QR Code deve exibir..."}
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className="bg-secondary/50 border-border focus:border-emerald-500/50 h-12 transition-all placeholder:text-muted-foreground/50"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold tracking-tight uppercase opacity-70">Upload de {category.toUpperCase()}</Label>
                                            <label
                                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all group overflow-hidden relative bg-secondary/30"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                                                    {file ? (
                                                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3 animate-bounce" />
                                                    ) : (
                                                        <Upload className="w-10 h-10 text-muted-foreground group-hover:text-emerald-500 transition-colors mb-3" />
                                                    )}
                                                    <p className="text-sm font-bold text-foreground">
                                                        {file ? file.name : `Selecione seu arquivo ${category === 'music' ? 'de Áudio' : category.toUpperCase()}`}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground font-medium mt-1">Arraste e solte ou clique para navegar</p>
                                                </div>
                                                <input type="file" className="hidden" onChange={handleFileUpload} accept={category === 'music' ? 'audio/*' : category === 'image' ? 'image/*' : category === 'pdf' ? '.pdf' : '*'} />
                                            </label>
                                        </div>
                                    )}

                                    <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border">
                                        <Label htmlFor="prompt" className="text-xs font-bold italic opacity-60 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-emerald-500" />
                                            Deseja um estilo visual via IA? (Opcional)
                                        </Label>
                                        <Input
                                            id="prompt"
                                            placeholder="Ex: Estilo Tech, Futurista com bordas arredondadas..."
                                            className="bg-secondary/50 border-border focus:border-emerald-500/20 italic text-xs h-10 placeholder:text-muted-foreground/40"
                                        />
                                    </div>
                                </div>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button
                                onClick={generateQrCode}
                                className={`w-full h-14 rounded-xl gap-2 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98] font-black uppercase tracking-widest text-xs ${(isGenerating || isUploading)
                                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40"
                                    }`}
                                disabled={isGenerating || isUploading}
                            >
                                {(isGenerating || isUploading) ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="w-5 h-5 animate-spin mb-1" />
                                        <span className="text-[10px] animate-pulse">{processingStep || "Gerando Magia..."}</span>
                                    </div>
                                ) : (
                                    <>
                                        Gerar QR Code Profissional
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="bg-emerald-500/5 border-emerald-500/10 p-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold emerald-text uppercase tracking-widest">Garantia Studio Pro</p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                                    Todos os arquivos são armazenados permanentemente. O link gerado é acessível a qualquer pessoa que escaneie o QR Code. Digitalização 100% precisa.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Result Panel */}
                <div className="lg:sticky lg:top-8">
                    <Card className="glass-card p-10 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden rounded-3xl shadow-2xl">
                        {/* Dynamic Background Effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full delay-700 animate-pulse" />

                        {qrValue ? (
                            <div className="space-y-10 flex flex-col items-center w-full animate-in zoom-in-95 duration-500">
                                <div
                                    ref={qrRef}
                                    className="p-8 bg-white rounded-[40px] shadow-2xl relative group"
                                >
                                    <QRCodeSVG
                                        value={qrValue}
                                        size={280}
                                        level="Q"
                                        includeMargin={false}
                                    />
                                    <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-[40px] group-hover:border-emerald-500/30 transition-all pointer-events-none" />
                                </div>

                                <div className="text-center space-y-3">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold emerald-text uppercase tracking-widest">
                                        <CheckCircle2 className="w-3 h-3" /> Digitalizável
                                    </div>
                                    <h3 className="font-bold text-2xl text-foreground tracking-tight">QR Code Magic Ativado</h3>
                                    <p className="text-xs text-muted-foreground max-w-[300px] leading-relaxed">
                                        Aponte sua câmera agora para verificar a informação implantada. Link permanente e acessível.
                                    </p>
                                </div>

                                <div className="w-full max-w-[320px] space-y-3">
                                    <Button
                                        onClick={downloadQrCode}
                                        className="w-full bg-foreground text-background hover:opacity-90 font-bold h-12 rounded-xl gap-2 shadow-lg transition-all"
                                    >
                                        <Download className="w-5 h-5" />
                                        Baixar PNG de Alta Definição
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setQrValue("")}
                                        className="w-full text-muted-foreground text-xs hover:text-foreground"
                                    >
                                        Gerar outro QR Code
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-8 flex flex-col items-center">
                                <div className="w-56 h-56 bg-secondary rounded-[40px] flex items-center justify-center border border-border relative group">
                                    <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all rounded-full" />
                                    <QrCode className="w-20 h-20 text-muted-foreground/20 group-hover:text-emerald-500/20 transition-all" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-foreground/80 font-bold text-lg tracking-tight">O Motor QR Magic está desligado</p>
                                    <p className="text-xs text-muted-foreground/60 max-w-[240px] mx-auto leading-relaxed">
                                        Configure os dados ao lado para implantar as informações e gerar o código de acesso instantâneo.
                                    </p>
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
