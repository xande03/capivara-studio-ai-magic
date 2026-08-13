// Complete file content — EVERY LINE
      import { useState } from 'react';
      import { Input } from '@/components/ui/input';
      import { Button } from '@/components/ui/button';
      import {
        Music,
        Loader2,
        Download,
        FileText,
        Search,
        Disc,
        Activity,
        Waves,
        Mic2,
        Lock,
        ExternalLink,
        ChevronRight
      } from 'lucide-react';
      import { useToast } from '@/hooks/use-toast';
      import { analyzeMusicLink, MusicInfo } from '@/lib/musicApi';
      import jsPDF from 'jspdf';
      import { motion, AnimatePresence } from 'framer-motion';
      import { ImageUploader } from '@/components/ImageUploader';

      export default function MusicFxPage() {
        const [url, setUrl] = useState('');
        const [loading, setLoading] = useState(false);
        const [scanning, setScanning] = useState(false);
        const [result, setResult] = useState<MusicInfo | null>(null);
        const [selectedFile, setSelectedFile] = useState<File | null>(null);
        const { toast } = useToast();

        const handleAnalyze = async () => {
          if (!url.trim() && !selectedFile) {
            toast({ title: 'Cole um link de música ou faça upload', variant: 'destructive' });
            return;
          }
          setLoading(true);
          setScanning(true);
          setResult(null);

          if (selectedFile) {
            // Lógica para análise de arquivo de música carregado
            // Aqui você pode usar uma biblioteca como a music-metadata para ler metadados do arquivo
            // e então chamar a função analyzeMusicLink com os metadados extraídos
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
              if (e.target && e.target.result) {
                // Simulação de análise de arquivo, substitua com lógica real
                const fileResult = await analyzeMusicLink(e.target.result as string);
                setLoading(false);
                setScanning(false);
                if (fileResult.error) {
                  toast({ title: 'Erro na Análise', description: fileResult.error, variant: 'destructive' });
                  return;
                }
                if (fileResult.data) {
                  setResult(fileResult.data);
                  toast({ title: 'DNA Extraído com Sucesso!', description: fileResult.data.title });
                }
              }
            };
            fileReader.readAsDataURL(selectedFile);
          } else {
            const analysisPromise = analyzeMusicLink(url.trim());
            const delayPromise = new Promise(resolve => setTimeout(resolve, 3500));

            const [res] = await Promise.all([analysisPromise, delayPromise]);

            setLoading(false);
            setScanning(false);

            if (res.error) {
              toast({ title: 'Erro na Análise', description: res.error, variant: 'destructive' });
              return;
            }

            if (res.data) {
              setResult(res.data);
              toast({ title: 'DNA Extraído com Sucesso!', description: res.data.title });
            }
          }
        };

        const handleFileChange = (file: File | null) => {
          setSelectedFile(file);
          setUrl('');
        };

        const handleDownloadPdf = () => {
          if (!result) return;
          const doc = new jsPDF();
          const pageWidth = doc.internal.pageSize.getWidth();
          let y = 20;

          doc.setFillColor(20, 20, 30);
          doc.rect(0, 0, pageWidth, 40, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(24);
          doc.setFont('helvetica', 'bold');
          doc.text('Capivara Music FX', 20, 25);

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('Relatório de Diagnóstico de Áudio', 20, 33);

          y = 55;
          doc.setTextColor(40, 40, 40);
          doc.setFontSize(16);
          doc.text('Informações Básicas', 20, y);
          y += 10;

          doc.setDrawColor(200, 200, 200);
          doc.line(20, y, pageWidth - 20, y);
          y += 12;

          doc.setFontSize(12);
          const fields = [
            ['Título', result?.title],
            ['Artista', result?.artist],
            ['Gênero', result?.genre],
            ['BPM', String(result?.bpm)],
            ['Tom', result?.key],
          ];

          for (const [label, value] of fields) {
            doc.setFont('helvetica', 'bold');
            doc.text(`${label}: `, 25, y);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 25 + doc.getTextWidth(`${label}: `) + 2, y);
            y += 10;
          }

          y += 10;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Letra & Conteúdo', 20, y);
          y += 10;
          doc.line(20, y, pageWidth - 20, y);
          y += 10;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const lyricsLines = doc.splitTextToSize(result?.lyrics || 'Letra não disponível', pageWidth - 40);
          for (const line of lyricsLines) {
            if (y > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, 20, y);
            y += 6;
          }

          doc.save(`MusicFX_${result?.title?.replace(/s+/g, '_')}.pdf`);
        };

        const handleDownloadMp3 = () => {
          if (!result) return;

          let downloadUrl = url;
          // Extract YouTube ID for more reliable redirection to yout.com
          let videoId: string | null = null;
          try {
            const parsed = new URL(url);
            if (parsed.hostname.includes("youtu.be")) {
              videoId = parsed.pathname.slice(1).split("/")[0] || null;
            } else if (parsed.hostname.includes("youtube.com")) {
              videoId = parsed.searchParams.get("v") || parsed.pathname.split("/").pop() || null;
            }
            if (videoId && videoId.length !== 11) videoId = null;
          } catch {
            videoId = null;
          }

          if (videoId) {
            toast({
              title: 'Redirecionando para Yout.com',
              description: 'Abrindo conversão direta para MP3...',
            });
            downloadUrl = `https://yout.com/video/?url=https://www.youtube.com/watch?v=${videoId}`;
          } else if (result.mp3Url) {
            downloadUrl = result.mp3Url;
          } else if (!downloadUrl) {
            toast({ title: 'Nenhum link disponível para download', variant: 'destructive' });
            return;
          }

          window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        };

        const infoCards = result
          ? [
              { icon: Disc, label: 'Gênero', value: result.genre },
              { icon: Activity, label: 'BPM', value: String(result.bpm) },
              { icon: Waves, label: 'Tom', value: result.key },
              { icon: Mic2, label: 'Banda / Artista', value: result.band || result.artist },
            ]
          : [];

        return (
          <div className='container mx-auto px-4 py-8 max-w-5xl'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-3 bg-primary/10 rounded-2xl'>
                <Music className='w-6 h-6 text-primary' />
              </div>
              <div>
                <h1 className='text-3xl font-black tracking-tight text-foreground'>Music FX</h1>
                <p className='text-muted-foreground mt-1 text-sm'>
                  Cole o link de uma música e extraia o DNA completo: gênero, BPM, tom e letra
                </p>
              </div>
            </div>

            <div className='glass-card rounded-2xl p-5 space-y-4'>
              <div className='flex flex-col sm:flex-row gap-3'>
                <Input
                  placeholder='https://www.youtube.com/watch?v=...'
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  className='flex-1'
                />
                <Button onClick={handleAnalyze} disabled={loading} className='h-10 sm:w-44'>
                  {loading ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Search className='w-4 h-4 mr-2' />
                      Extrair DNA
                    </>
                  )}
                </Button>
              </div>
              <p className='text-[11px] text-muted-foreground flex items-center gap-1.5'>
                <Lock className='w-3 h-3' />
                Suporta YouTube, Spotify e Deezer. A análise é feita por IA.
              </p>
              <div className='flex flex-col sm:flex-row gap-3'>
                <input
                  type='file'
                  accept='.mp3'
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className='block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                />
              </div>
            </div>

            <AnimatePresence>
              {scanning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className='mt-6 glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center'
                >
                  <Loader2 className='w-10 h-10 text-primary animate-spin mb-4' />
                  <p className='text
... [TRUNCATED, 13186 total]