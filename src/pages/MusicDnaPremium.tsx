import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Music,
  Loader2,
  Download,
  FileText,
  Link2,
  Search,
  Disc,
  Activity,
  Waves,
  Mic2,
  Lock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeMusicLink, MusicInfo } from "@/lib/musicApi";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";

export default function MusicDnaPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<MusicInfo | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({ title: "Cole um link de música", variant: "destructive" });
      return;
    }
    setLoading(true);
    setScanning(true);
    setResult(null);

    // Artificial delay to make scanning feel "thorough"
    const analysisPromise = analyzeMusicLink(url.trim());
    const delayPromise = new Promise(resolve => setTimeout(resolve, 3500));

    const [res] = await Promise.all([analysisPromise, delayPromise]);

    setLoading(false);
    setScanning(false);

    if (res.error) {
      toast({ title: "Erro na Análise", description: res.error, variant: "destructive" });
      return;
    }

    if (res.data) {
      setResult(res.data);
      toast({ title: "DNA Extraído com Sucesso!", description: res.data.title });
    }
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFillColor(20, 20, 30);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Capivara Music DNA", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório de Diagnóstico de Áudio", 20, 33);

    y = 55;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.text("Informações Básicas", 20, y);
    y += 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 12;

    doc.setFontSize(12);
    const fields = [
      ["Título", result.title],
      ["Artista", result.artist],
      ["Gênero", result.genre],
      ["BPM", String(result.bpm)],
      ["Tom", result.key],
    ];

    for (const [label, value] of fields) {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}: `, 25, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 25 + doc.getTextWidth(`${label}: `) + 2, y);
      y += 10;
    }

    y += 10;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Letra & Conteúdo", 20, y);
    y += 10;
    doc.line(20, y, pageWidth - 20, y);
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
      y += 6;
    }

    doc.save(`MusicDNA_${result.title.replace(/\s+/g, '_')}.pdf`);
  };

  const handleDownloadMp3 = () => {
    if (!result) return;
    toast({
      title: "Redirecionando para Downloader",
      description: "Preparando processamento externo via Cobalt...",
    });
    window.open(`https://cobalt.tools/?u=${encodeURIComponent(url)}`, "_blank");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-600/10 blur-[100px] rounded-full" />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[1px] shadow-2xl shadow-purple-500/20">
            <div className="w-full h-full rounded-2xl bg-[#0a0a0c] flex items-center justify-center">
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-1">
              Music <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">DNA</span>
            </h1>
            <p className="text-zinc-400 font-medium">Extração de metadados e diagnóstico local</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Security Mode: Temporary</span>
        </div>
      </motion.div>

      {/* Search Input Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-[2rem] p-1 mb-12 border-zinc-800 shadow-2xl relative z-10"
      >
        <div className="bg-[#121215] rounded-[1.8rem] p-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              placeholder="Insira o link (YouTube, Spotify, etc.)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              className="pl-12 h-14 bg-zinc-950/50 border-zinc-800 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-2xl text-lg text-white"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="w-full md:w-auto h-14 px-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-900/20 group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Waves className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              {loading ? "Processando..." : "Extrair DNA"}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="min-h-[400px] relative">
        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-20"
            >
              <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                {/* Orbital Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-purple-500/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border border-emerald-500/20 rounded-full"
                />
                {/* Scanning Bar */}
                <motion.div
                  animate={{ top: ["0%", "90%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent z-10 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                />
                {/* Icon */}
                <Disc className="w-20 h-20 text-purple-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Escaneando Frequências</h2>
              <p className="text-zinc-500 animate-pulse">Desconstruindo estrutura harmônica e metadados...</p>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20"
            >
              {/* Left Column: Visual & Lyrics */}
              <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                {/* Cover & Main Info */}
                <div className="glass-card rounded-[2.5rem] p-8 border-zinc-800 shadow-2xl relative overflow-hidden bg-[#0c0c0e]">
                  <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    <div className="w-full md:w-64 h-64 rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800 relative group">
                      {result.thumbnail ? (
                        <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                          <Music className="w-20 h-20 text-zinc-800" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Waves className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                            {result.genre}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            {result.duration ? `${result.duration} MIN` : 'ANÁLISE COMPLETA'}
                          </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
                          {result.title}
                        </h2>
                        <p className="text-2xl text-zinc-400 font-medium flex items-center gap-2">
                          {result.artist}
                          {result.band && <span className="text-zinc-600 text-lg">· {result.band}</span>}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-8">
                        <Button variant="outline" onClick={handleDownloadPdf} className="h-12 border-zinc-700 bg-zinc-900/50 text-white rounded-xl hover:bg-white/5 font-bold">
                          <FileText className="w-4 h-4 mr-2" />
                          Diagnostic PDF
                        </Button>
                        <Button
                          className="h-12 bg-white text-black font-bold rounded-xl hover:bg-zinc-200"
                          onClick={handleDownloadMp3}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Audio
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lyrics Section */}
                <div className="glass-card rounded-[2.5rem] p-10 border-zinc-800 shadow-2xl bg-[#0c0c0e]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Mic2 className="w-6 h-6 text-emerald-400" />
                      <h3 className="text-xl font-bold text-white tracking-tight">Análise Lírica</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 transform hover:rotate-45 transition-transform cursor-pointer">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="relative group">
                    <pre className="whitespace-pre-wrap font-sans text-lg text-zinc-400 leading-[2] max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-800">
                      {result.lyrics}
                    </pre>
                    {result.lyrics.includes("Genius") && (
                      <div className="mt-8 pt-8 border-t border-white/5">
                        <a
                          href={`https://genius.com/search?q=${encodeURIComponent(result.title + " " + result.artist)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold group"
                        >
                          Buscar Letra Verificada no Genius
                          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: DNA Specs */}
              <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                <div className="glass-card rounded-[2rem] p-8 border-zinc-800 bg-black/40 shadow-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-8 px-2 flex items-center justify-between">
                    Technical DNA Specs
                    <Activity className="w-3 h-3 text-purple-500 animate-pulse" />
                  </h4>

                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <Waves className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Ritmo</span>
                      </div>
                      <span className="text-2xl font-black text-white">{result.bpm} <span className="text-sm font-medium text-zinc-600">BPM</span></span>
                    </div>

                    <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                          <Music className="w-5 h-5 text-cyan-400" />
                        </div>
                        <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Tonalidade</span>
                      </div>
                      <span className="text-2xl font-black text-white uppercase tracking-tight">{result.key}</span>
                    </div>

                    <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Disc className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Gênero</span>
                      </div>
                      <span className="text-xl font-black text-white uppercase tracking-tight">{result.genre}</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Info */}
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-white/5 shadow-inner">
                  <div className="flex items-start gap-4 mb-4">
                    <Activity className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                      <h5 className="text-white font-bold mb-1">Diagnóstico Efetivo</h5>
                      <p className="text-sm text-white/50 leading-relaxed font-medium">
                        O processo de extração utilizou metadados OEmbed de alta fidelidade e cálculos heurísticos para determinar a estrutura rítmica da obra.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-20 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-6">
                <Music className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-xl font-medium text-zinc-400 mb-2">Aguardando Input</h3>
              <p className="text-zinc-600 max-w-xs text-sm">Insira um link válido para iniciar a análise do DNA musical.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
