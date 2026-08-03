
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

      export default function MusicDnaPage() {
        const [url, setUrl] = useState('');
        const [loading, setLoading] = useState(false);
        const [scanning, setScanning] = useState(false);
        const [result, setResult] = useState<MusicInfo | null>(null);
        const [selectedFile, setSelectedFile] = useState<File | null>(null);
        const { toast } = useToast();

        const handleAnalyze = async () => {
          if (!url.trim() && !selectedFile) {
            toast({ title: 'Cole um link de mÃºsica ou faÃ§a upload', variant: 'destructive' });
            return;
          }
          setLoading(true);
          setScanning(true);
          setResult(null);

          if (selectedFile) {
            // LÃ³gica para anÃ¡lise de arquivo de mÃºsica carregado
            // Aqui vocÃª pode usar uma biblioteca como a music-metadata para ler metadados do arquivo
            // e entÃ£o chamar a funÃ§Ã£o analyzeMusicLink com os metadados extraÃ­dos
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
              if (e.target && e.target.result) {
                // SimulaÃ§Ã£o de anÃ¡lise de arquivo, substitua com lÃ³gica real
                const fileResult = await analyzeMusicLink(e.target.result as string);
                setLoading(false);
                setScanning(false);
                if (fileResult.error) {
                  toast({ title: 'Erro na AnÃ¡lise', description: fileResult.error, variant: 'destructive' });
                  return;
                }
                if (fileResult.data) {
                  setResult(fileResult.data);
                  toast({ title: 'DNA ExtraÃ­do com Sucesso!', description: fileResult.data.title });
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
              toast({ title: 'Erro na AnÃ¡lise', description: res.error, variant: 'destructive' });
              return;
            }

            if (res.data) {
              setResult(res.data);
              toast({ title: 'DNA ExtraÃ­do com Sucesso!', description: res.data.title });
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
          doc.text('Capivara Music DNA', 20, 25);

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('RelatÃ³rio de DiagnÃ³stico de Ãudio', 20, 33);

          y = 55;
          doc.setTextColor(40, 40, 40);
          doc.setFontSize(16);
          doc.text('InformaÃ§Ãµes BÃ¡sicas', 20, y);
          y += 10;

          doc.setDrawColor(200, 200, 200);
          doc.line(20, y, pageWidth - 20, y);
          y += 12;

          doc.setFontSize(12);
          const fields = [
            ['TÃ­tulo', result?.title],
            ['Artista', result?.artist],
            ['GÃªnero', result?.genre],
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
          doc.text('Letra & ConteÃºdo', 20, y);
          y += 10;
          doc.line(20, y, pageWidth - 20, y);
          y += 10;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const lyricsLines = doc.splitTextToSize(result?.lyrics || 'Letra nÃ£o disponÃ­vel', pageWidth - 40);
          for (const line of lyricsLines) {
            if (y > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, 20, y);
            y += 6;
          }

          doc.save(`MusicDNA_${result?.title?.replace(/s+/g, '_')}.pdf`);
        };

        const handleDownloadMp3 = () => {
          if (!result) return;

          let downloadUrl = url;
          // Extract YouTube ID for more reliable redirection to yout.com
          const ytMatch = url.match(/(?:youtube.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu.be/)([^&?/s]{11})/);
          const videoId = ytMatch ? ytMatch[1] : null;

          if (videoId) {
            toast({
              title: 'Redirecionando para Yout.com',
              description: 'Abrindo conversÃ£o direta para MP3...',
            });
            downloadUrl = `https://yout.com/video/?url=https://www.youtube.com/watch?v=${videoId}`;
          } else if (result.mp3Url) {
            downloadUrl = result.mp3Url;
          } else if (!downloadUrl) {
            toast({ title: 'Nenhum link disponÃ­vel para download', variant: 'destructive' });
            return;
          }

          window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        };

        const infoCards = result
          ? [
              { icon: Disc, label: 'GÃªnero', value: result.genre },
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
                <h1 className='text-3xl font-black tracking-tight text-foreground'>Music DNA</h1>
                <p className='text-muted-foreground mt-1 text-sm'>
                  Cole o link de uma mÃºsica e extraia o DNA completo: gÃªnero, BPM, tom e letra
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
                Suporta YouTube, Spotify e Deezer. A anÃ¡lise Ã© feita por IA.
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
                  <p className='text-sm font-medium text-foreground'>Sequenciando o DNA musical...</p>
                  <p className='text-xs text-muted-foreground mt-1'>Isso pode levar alguns segundos</p>
                </motion.div>
              )}
            </AnimatePresence>

            {result && !scanning && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className='mt-6 space-y-5'
              >
                <div className='glass-card rounded-2xl p-5 flex flex-col sm:flex-row gap-5'>
                  {result.thumbnail && (
                    <img
                      src={result.thumbnail}
                      alt={`Capa de ${result.title}`}
                      className='w-full sm:w-40 h-40 object-cover rounded-xl border'
                      loading='lazy'
                    />
                  )}
                  <div className='flex-1 min-w-0'>
                    <h2 className='text-xl font-bold text-foreground truncate'>{result.title}</h2>
                    <p className='text-muted-foreground text-sm'>{result.artist}</p>
                    {result.duration && (
                      <p className='text-xs text-muted-foreground mt-1'>DuraÃ§Ã£o: {result.duration}</p>
                    )}
                    <div className='flex flex-wrap gap-2 mt-4'>
                      <Button size='sm' variant='outline' onClick={handleDownloadPdf} className='gap-1.5'>
                        <FileText className='w-4 h-4' />
                        RelatÃ³rio PDF
                      </Button>
                      <Button size='sm' onClick={handleDownloadMp3} className='gap-1.5'>
                        <Download className='w-4 h-4' />
                        Baixar MP3
                        <ExternalLink className='w-3 h-3 opacity-70' />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                  {infoCards.map(({ icon: Icon, label, value }) => (
                    <div key={label} className='glass-card rounded-xl p-4'>
                      <div className='flex items-center gap-2 text-muted-foreground text-xs mb-1.5'>
                        <Icon className='w-3.5 h-3.5' />
                        {label}
                      </div>
                      <p className='text-sm font-semibold text-foreground truncate'>{value || 'â'}</p>
                    </div>
                  ))}
                </div>

                <div className='glass-card rounded-2xl p-5'>
                  <h3 className='text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3'>
                    <ChevronRight className='w-4 h-4 text-primary' />
                    Letra
                  </h3>
                  <pre className='whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed max-h-96 overflow-y-auto'>
                    {result.lyrics || 'Letra nÃ£o disponÃ­vel'}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        );
      }
  