import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ImageUploader";
import { Lightbox } from "@/components/Lightbox";
import { PerspectiveScanner } from "@/components/PerspectiveScanner";
import { FileText, Image, ScanLine, Loader2, Download, FileDown, Focus, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

export default function ConverterPage() {
  const [tab, setTab] = useState("img2pdf");
  const { toast } = useToast();

  // Image to PDF
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);

  // PDF to Word
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [wordText, setWordText] = useState("");
  const [wordLoading, setWordLoading] = useState(false);

  // OCR / Scan
  const [scanImage, setScanImage] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [scanLoading, setScanLoading] = useState(false);

  const [lightbox, setLightbox] = useState("");

  // === Image to PDF ===
  const handleAddPdfImage = (base64: string) => {
    setPdfImages((prev) => [...prev, base64]);
  };

  const handleConvertToPdf = () => {
    if (pdfImages.length === 0) {
      toast({ title: "Adicione pelo menos uma imagem", variant: "destructive" });
      return;
    }
    setPdfLoading(true);
    try {
      const pdf = new jsPDF();
      pdfImages.forEach((imgData, i) => {
        if (i > 0) pdf.addPage();
        const img = new window.Image();
        img.src = imgData;
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pageW / (img.width || 800), pageH / (img.height || 600));
        const w = (img.width || 800) * ratio;
        const h = (img.height || 600) * ratio;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;
        pdf.addImage(imgData, "PNG", x, y, w, h);
      });
      pdf.save(`converted-${Date.now()}.pdf`);
      toast({ title: "PDF gerado com sucesso!" });
    } catch {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
    setPdfLoading(false);
  };

  // === PDF to Word (client-side text extraction + AI OCR fallback) ===
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setWordText("");
    } else {
      toast({ title: "Selecione um arquivo PDF válido", variant: "destructive" });
    }
  };

  const handlePdfToWord = async () => {
    if (!pdfFile) return;
    setWordLoading(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        if (pageText.trim()) {
          fullText += `--- Página ${i} ---\n${pageText}\n\n`;
        } else {
          // Page has no extractable text — render as image and send to OCR
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const imageBase64 = canvas.toDataURL("image/png");

          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-process`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({ action: "ocr", imageBase64 }),
              }
            );
            if (response.ok) {
              const data = await response.json();
              fullText += `--- Página ${i} (OCR) ---\n${data.text || ""}\n\n`;
            } else {
              fullText += `--- Página ${i} ---\n[Não foi possível extrair texto desta página]\n\n`;
            }
          } catch {
            fullText += `--- Página ${i} ---\n[Erro ao processar OCR desta página]\n\n`;
          }
        }
      }

      setWordText(fullText.trim() || "Não foi possível extrair texto do PDF.");
      toast({ title: "Texto extraído com sucesso!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao processar PDF", variant: "destructive" });
    }
    setWordLoading(false);
  };

  const handleDownloadWord = async () => {
    if (!wordText) return;
    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const { saveAs } = await import("file-saver");

      const paragraphs = wordText.split("\n").map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line, size: 24 })],
            spacing: { after: 120 },
          })
      );

      const doc = new Document({
        sections: [{ children: paragraphs }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `document-${Date.now()}.docx`);
      toast({ title: "Arquivo .docx salvo!" });
    } catch {
      toast({ title: "Erro ao gerar Word", variant: "destructive" });
    }
  };

  // === OCR / Scan ===
  const handleScan = async () => {
    if (!scanImage) {
      toast({ title: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    setScanLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: "ocr",
            imageBase64: scanImage,
          }),
        }
      );

      if (!response.ok) throw new Error("Erro no servidor");
      const data = await response.json();
      setScanResult(data.text || "Nenhum texto encontrado.");
    } catch {
      toast({ title: "Erro ao escanear", variant: "destructive" });
    }
    setScanLoading(false);
  };

  const handleDownloadScanPdf = () => {
    if (!scanResult) return;
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(scanResult, 170);
    pdf.setFontSize(12);
    pdf.text(lines, 20, 20);
    pdf.save(`scan-${Date.now()}.pdf`);
    toast({ title: "PDF do scan salvo!" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="tool-header-card glow-cyan">
          <FileText className="w-7 h-7 text-cyan-600" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Conversor de Documentos</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Converta imagens em PDF, PDF em Word e escaneie documentos
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="img2pdf" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Image className="w-4 h-4" /> <span className="hidden sm:inline">Imagem →</span> PDF
          </TabsTrigger>
          <TabsTrigger value="pdf2word" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <FileDown className="w-4 h-4" /> <span className="hidden sm:inline">PDF →</span> Word
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <ScanLine className="w-4 h-4" /> Escanear
          </TabsTrigger>
        </TabsList>

        {/* Image to PDF */}
        <TabsContent value="img2pdf">
          <div className="glass-card rounded-xl p-4 md:p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Adicionar Imagens
            </h3>
            <ImageUploader
              onImageSelect={handleAddPdfImage}
              currentImage=""
              onClear={() => {}}
              label="Clique ou arraste imagens"
            />
            {pdfImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{pdfImages.length} imagem(ns) adicionada(s)</p>
                <div className="flex gap-2 flex-wrap">
                  {pdfImages.map((img, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 rounded border border-border overflow-hidden cursor-pointer"
                      onClick={() => setLightbox(img)}
                    >
                      <img src={img} alt={`Página ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPdfImages([])}
                  >
                    Limpar
                  </Button>
                  <Button
                    size="sm"
                    className="blue-gradient text-white"
                    onClick={handleConvertToPdf}
                    disabled={pdfLoading}
                  >
                    {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                    Converter para PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* PDF to Word */}
        <TabsContent value="pdf2word">
          <div className="glass-card rounded-xl p-4 md:p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Upload do PDF
            </h3>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            {pdfFile && (
              <p className="text-xs text-muted-foreground">Arquivo: {pdfFile.name}</p>
            )}
            <Button
              onClick={handlePdfToWord}
              disabled={!pdfFile || wordLoading}
              className="blue-gradient text-white"
            >
              {wordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              Extrair Texto
            </Button>

            {wordText && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Texto Extraído (edite se necessário)
                </h3>
                <Textarea
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="blue-gradient text-white" onClick={handleDownloadWord}>
                    <Download className="w-4 h-4 mr-2" /> Baixar como .docx
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const pdf = new jsPDF();
                      const lines = pdf.splitTextToSize(wordText, 170);
                      pdf.setFontSize(12);
                      pdf.text(lines, 20, 20);
                      pdf.save(`edited-${Date.now()}.pdf`);
                      toast({ title: "PDF salvo!" });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" /> Salvar como PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* OCR / Scan */}
        <TabsContent value="scan">
          <div className="glass-card rounded-xl p-4 md:p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Imagem do Documento
            </h3>
            <ImageUploader
              onImageSelect={setScanImage}
              currentImage={scanImage}
              onClear={() => { setScanImage(""); setScanResult(""); }}
              label="Upload da imagem do documento"
            />
            <Button
              onClick={handleScan}
              disabled={!scanImage || scanLoading}
              className="blue-gradient text-white"
            >
              {scanLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ScanLine className="w-4 h-4 mr-2" />}
              Escanear Documento
            </Button>

            {scanResult && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Texto Escaneado (edite se necessário)
                </h3>
                <Textarea
                  value={scanResult}
                  onChange={(e) => setScanResult(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="blue-gradient text-white" onClick={handleDownloadScanPdf}>
                    <Download className="w-4 h-4 mr-2" /> Salvar como PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const { Document, Packer, Paragraph, TextRun } = await import("docx");
                      const { saveAs } = await import("file-saver");
                      const doc = new Document({
                        sections: [{
                          children: scanResult.split("\n").map(
                            (line) => new Paragraph({ children: [new TextRun({ text: line, size: 24 })] })
                          ),
                        }],
                      });
                      const blob = await Packer.toBlob(doc);
                      saveAs(blob, `scan-${Date.now()}.docx`);
                      toast({ title: "Arquivo .docx salvo!" });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" /> Salvar como .docx
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox("")} />}
    </div>
  );
}
