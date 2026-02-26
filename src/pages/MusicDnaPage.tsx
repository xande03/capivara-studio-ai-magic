import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music, Loader2, Download, FileText, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeMusicLink, MusicInfo } from "@/lib/musicApi";
import jsPDF from "jspdf";

export default function MusicDnaPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MusicInfo | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({ title: "Cole um link de música", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    const res = await analyzeMusicLink(url.trim());
    setLoading(false);
    if (res.error) {
      toast({ title: "Erro", description: res.error, variant: "destructive" });
      return;
    }
    if (res.data) {
      setResult(res.data);
      toast({ title: "Música identificada!", description: res.data.title });
    }
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Music DNA Report", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Divider
    doc.setDrawColor(100, 200, 150);
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 12;

    // Info fields
    doc.setFontSize(12);
    const fields = [
      ["Título", result.title],
      ["Artista", result.artist],
      ["Banda", result.band || "—"],
      ["Gênero", result.genre],
      ["BPM", String(result.bpm)],
      ["Tom", result.key],
    ];

    for (const [label, value] of fields) {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}: `, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 20 + doc.getTextWidth(`${label}: `), y);
      y += 8;
    }

    y += 5;
    doc.setDrawColor(100, 200, 150);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Lyrics
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Letra da Música", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lyricsLines = doc.splitTextToSize(result.lyrics || "Letra não disponível", pageWidth - 40);
    for (const line of lyricsLines) {
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 5;
    }

    doc.save(`${result.title || "music-dna"}-report.pdf`);
  };

  const handleDownloadMp3 = () => {
    toast({
      title: "Download MP3",
      description: "O download de MP3 depende da disponibilidade da plataforma. Para músicas do YouTube, use ferramentas como yt-dlp localmente.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="tool-header-card" style={{ boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)" }}>
          <Music className="w-7 h-7 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Music DNA</h1>
          <p className="text-sm text-muted-foreground">
            Identifique músicas por link — letra, BPM, tom e mais
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Link da Música
        </h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cole o link do YouTube, Spotify, YouTube Music..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Music className="w-4 h-4 mr-2" />
            )}
            {loading ? "Analisando..." : "Analisar"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {["YouTube", "Spotify", "YouTube Music", "Deezer", "SoundCloud"].map((p) => (
            <span
              key={p}
              className="text-[10px] px-3 py-1.5 rounded-full bg-secondary/50 border border-border/30 text-muted-foreground"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
            <Music className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-muted-foreground text-sm">Analisando a música...</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Info Card */}
          <div className="glass-card rounded-xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{result.title}</h2>
                <p className="text-muted-foreground">
                  {result.artist}
                  {result.band ? ` · ${result.band}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadMp3}>
                  <Download className="w-4 h-4 mr-2" />
                  MP3
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col items-center px-5 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">
                  Gênero
                </span>
                <span className="text-sm font-bold text-foreground mt-1">{result.genre}</span>
              </div>
              <div className="flex flex-col items-center px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  BPM
                </span>
                <span className="text-sm font-bold text-foreground mt-1">{result.bpm}</span>
              </div>
              <div className="flex flex-col items-center px-5 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
                  Tom
                </span>
                <span className="text-sm font-bold text-foreground mt-1">{result.key}</span>
              </div>
            </div>
          </div>

          {/* Lyrics */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Letra da Música
            </h3>
            <div className="max-h-96 overflow-y-auto pr-2">
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                {result.lyrics || "Letra não disponível"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
