import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import {
  BookOpen,
  List,
  GraduationCap,
  Upload,
  Loader2,
  Copy,
  Download,
  FileText,
  Sparkles,
  RotateCcw,
} from "lucide-react";

type Mode = "summary" | "keypoints" | "flashcards";

const modes: { value: Mode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "summary", label: "Resumo", icon: BookOpen, desc: "Texto condensado" },
  { value: "keypoints", label: "Pontos-chave", icon: List, desc: "Bullet points" },
  { value: "flashcards", label: "Flashcards", icon: GraduationCap, desc: "Pergunta & Resposta" },
];

export default function SummarizerPage() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("summary");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const content = await file.text();
      setText(content);
      return;
    }

    if (file.type === "application/pdf") {
      toast({ title: "Extraindo texto do PDF..." });
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const fullDataUrl = reader.result as string;
          const pdfBase64 = fullDataUrl.split(",")[1];
          const resp = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-process`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ action: "pdf-to-text", pdfBase64, pageCount: 1 }),
            }
          );
          const data = await resp.json();
          if (data.text) {
            setText(data.text);
            toast({ title: "Texto extraído com sucesso!" });
          } else {
            toast({ title: "Não foi possível extrair texto", variant: "destructive" });
          }
        };
        reader.readAsDataURL(file);
      } catch {
        toast({ title: "Erro ao processar PDF", variant: "destructive" });
      }
      return;
    }

    toast({ title: "Formato não suportado. Use PDF ou TXT.", variant: "destructive" });
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast({ title: "Cole ou envie um texto primeiro", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: text.slice(0, 30000), mode }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
        toast({ title: err.error || "Erro ao resumir", variant: "destructive" });
        setLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setResult(content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao processar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast({ title: "Copiado!" });
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumo-${mode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(result, 180);
    pdf.setFontSize(11);
    let y = 15;
    for (const line of lines) {
      if (y > 280) {
        pdf.addPage();
        y = 15;
      }
      pdf.text(line, 15, y);
      y += 6;
    }
    pdf.save(`resumo-${mode}.pdf`);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          Resumidor com IA
        </h1>
        <p className="text-muted-foreground text-sm">
          Cole um texto ou envie um PDF — a IA gera resumos, pontos-chave ou flashcards.
        </p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 flex-wrap">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              mode === m.value
                ? "bg-primary/10 border-primary/30 text-foreground"
                : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            <m.icon className="w-4 h-4" />
            <span>{m.label}</span>
            <span className="text-[10px] opacity-60 hidden sm:inline">— {m.desc}</span>
          </button>
        ))}
      </div>

      {/* Input area */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload PDF / TXT
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            {text && (
              <Button variant="ghost" size="sm" onClick={() => setText("")} className="gap-1 text-muted-foreground">
                <RotateCcw className="w-3 h-3" />
                Limpar
              </Button>
            )}
            <span className="text-[10px] text-muted-foreground ml-auto">
              {text.length > 0 ? `${text.length.toLocaleString()} caracteres` : ""}
            </span>
          </div>
          <Textarea
            placeholder="Cole seu texto aqui ou faça upload de um arquivo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[180px] resize-y bg-background/50"
          />
          <Button
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
            className="w-full gap-2 font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {mode === "summary" ? "Gerar Resumo" : mode === "keypoints" ? "Extrair Pontos-chave" : "Criar Flashcards"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                Resultado
              </h2>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1 text-xs">
                  <Copy className="w-3 h-3" /> Copiar
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownloadTxt} className="gap-1 text-xs">
                  <Download className="w-3 h-3" /> TXT
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownloadPdf} className="gap-1 text-xs">
                  <FileText className="w-3 h-3" /> PDF
                </Button>
              </div>
            </div>

            {mode === "flashcards" ? (
              <FlashcardsRenderer content={result} />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none bg-secondary/30 rounded-xl p-4 overflow-auto max-h-[500px]">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
