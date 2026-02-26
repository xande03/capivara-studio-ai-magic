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
    Loader2,
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
import { supabase } from "@/integrations/supabase/client";

type QrCategory = "link" | "text" | "pdf" | "music" | "image" | "file";

const QrCodePage = () => {
    const [category, setCategory] = useState<QrCategory>("link");
    const [inputValue, setInputValue] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [qrValue, setQrValue] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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

                // Ensure we're using the correct bucket name or handle error if it doesn't exist
                const { error: uploadError } = await supabase.storage
                    .from('generated_contents')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("Storage error:", uploadError);
                    throw new Error("Erro ao enviar arquivo para o storage. Certifique-se de que o bucket 'generated_contents' existe.");
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('generated_contents')
                    .getPublicUrl(filePath);

                setQrValue(publicUrl);
                toast({
                    title: "Upload concluído!",
                    description: "Arquivo hospedado e QR Code gerado com sucesso.",
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
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/20 border border-white/10">
                        <img src="/logo.png" alt="Capivara Stúdio" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight emerald-text">QR Code Magic</h1>
                        <p className="text-muted-foreground text-sm font-medium">Implantando informações com precisão cinematográfica</p>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-8 items-start pb-12">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    <Card className="glass-card border-white/5 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                                Configuração Profissional
                            </CardTitle>
                            <CardDescription>
                                Selecione o tipo de dado que será incorporado ao QR Code.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Tabs value={category} onValueChange={handleCategoryChange} className="w-full">
                                <TabsList className="grid grid-cols-6 w-full bg-black/40 p-1 rounded-xl">
                                    <TabsTrigger value="link" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><LinkIcon className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="pdf" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><FileText className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="music" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><Music className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="image" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><ImageIcon className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="file" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><File className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="text" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"><Loader2 className="w-4 h-4 rotate-45" /></TabsTrigger>
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
                                                className="bg-black/30 border-white/10 focus:border-emerald-500/50 h-12 transition-all"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">Upload de {category.toUpperCase()}</Label>
                                            <label
                                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all group overflow-hidden relative"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                                                    {file ? (
                                                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3 animate-bounce" />
                                                    ) : (
                                                        <Upload className="w-10 h-10 text-muted-foreground group-hover:text-emerald-500 transition-colors mb-3" />
                                                    )}
                                                    <p className="text-sm font-medium text-foreground">
                                                        {file ? file.name : `Selecione seu arquivo ${category === 'music' ? 'de Áudio' : category.toUpperCase()}`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">Arraste e solte ou clique para navegar</p>
                                                </div>
                                                <input type="file" className="hidden" onChange={handleFileUpload} accept={category === 'music' ? 'audio/*' : category === 'image' ? 'image/*' : category === 'pdf' ? '.pdf' : '*'} />
                                            </label>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Label htmlFor="prompt" className="text-sm font-semibold italic opacity-80 underline decoration-emerald-500/30">Deseja um estilo visual via IA? (Opcional)</Label>
                                        <Input
                                            id="prompt"
                                            placeholder="Ex: Estilo Tech, Futurista com bordas arredondadas..."
                                            className="bg-black/20 border-white/5 focus:border-emerald-500/20 italic text-xs h-10"
                                        />
                                    </div>
                                </div>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button
                                onClick={generateQrCode}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 rounded-xl gap-2 shadow-xl shadow-emerald-900/40 transition-all hover:scale-[1.01] active:scale-[0.98]"
                                disabled={isGenerating || isUploading}
                            >
                                {(isGenerating || isUploading) ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Gerando Magia...
                                    </>
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
                                    Todos os arquivos são criptografados e o link gerado é permanente enquanto sua conta estiver ativa. Digitalização 100% precisa.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Result Panel */}
                <div className="lg:sticky lg:top-8">
                    <Card className="glass-card border-white/5 p-10 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden rounded-3xl shadow-2xl">
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
                                        Aponte sua câmera agora para verificar a informação implantada. Sincronização em tempo real concluída.
                                    </p>
                                </div>

                                <div className="w-full max-w-[320px] space-y-3">
                                    <Button
                                        onClick={downloadQrCode}
                                        className="w-full bg-white text-black hover:bg-white/90 font-bold h-12 rounded-xl gap-2 shadow-lg transition-all"
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
                                <div className="w-56 h-56 bg-black/40 rounded-[40px] flex items-center justify-center border border-white/5 relative group">
                                    <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all rounded-full" />
                                    <QrCode className="w-20 h-20 text-white/5 group-hover:text-emerald-500/20 transition-all" />
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
