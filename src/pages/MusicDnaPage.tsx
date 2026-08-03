
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
          doc.text('Capivara Music DNA', 20, 25);

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
            ['Título', result.title],
            ['Artista', result.artist],
            ['Gênero', result.genre],
            ['BPM', String(result.bpm)],
            ['Tom', result.key],
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
          const lyricsLines = doc.splitTextToSize(result.lyrics || 'Letra não disponível', pageWidth - 40);
          for (const line of lyricsLines) {
            if (y > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, 20, y);
            y += 6;
          }

          doc.save(`MusicDNA_${result.title.replace(/s+/g, '_')}.pdf`);
        };

        const handleDownloadMp3 = () => {
          if (!result) return;

          let downloadUrl = url;
          // Extract YouTube ID for more reliable redirection to yout.com
          const ytMatch = url.match(/(?:youtube.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu.be/)([^"&?/s]{11})/);
          const videoId = ytMatch ? ytMatch[1] : null;

          if (videoId) {
            toast({
              title: 'Redirecionando para Yout.com',
              description: 'Abrindo conversão direta para MP3...',
            });
            // Use the watch format which works more reliably
            downloadUrl =