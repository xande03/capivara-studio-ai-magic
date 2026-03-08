import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ImageUploader";
import { Loader2, Download, ScanLine, RotateCcw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

type Point = { x: number; y: number };

const HANDLE_RADIUS = 14;
const A4_RATIO = 210 / 297; // width/height

function solveHomography(src: Point[], dst: Point[]): number[] {
  // Solve 8x8 system for homography matrix H such that dst = H * src
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const sx = src[i].x, sy = src[i].y;
    const dx = dst[i].x, dy = dst[i].y;
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    b.push(dx);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    b.push(dy);
  }
  // Gaussian elimination
  const n = 8;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];
    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-10) continue;
    for (let j = col; j <= n; j++) M[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col];
      for (let j = col; j <= n; j++) M[row][j] -= factor * M[col][j];
    }
  }
  const h = M.map((row) => row[n]);
  return [...h, 1]; // H = [h0..h7, 1]
}

function applyInverseHomography(
  srcCanvas: HTMLCanvasElement,
  corners: Point[],
  outWidth: number,
  outHeight: number
): HTMLCanvasElement {
  const srcCtx = srcCanvas.getContext("2d")!;
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const sw = srcCanvas.width, sh = srcCanvas.height;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outWidth;
  outCanvas.height = outHeight;
  const outCtx = outCanvas.getContext("2d")!;
  const outData = outCtx.createImageData(outWidth, outHeight);

  // Source corners in pixel coords
  const src = corners.map((p) => ({ x: p.x * sw, y: p.y * sh }));
  // Destination corners: full rectangle
  const dst: Point[] = [
    { x: 0, y: 0 },
    { x: outWidth, y: 0 },
    { x: outWidth, y: outHeight },
    { x: 0, y: outHeight },
  ];

  // We need inverse: for each output pixel, find source pixel
  // H maps dst -> src
  const H = solveHomography(dst, src);

  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      const w = H[6] * x + H[7] * y + H[8];
      const srcX = (H[0] * x + H[1] * y + H[2]) / w;
      const srcY = (H[3] * x + H[4] * y + H[5]) / w;

      const ix = Math.round(srcX);
      const iy = Math.round(srcY);

      if (ix >= 0 && ix < sw && iy >= 0 && iy < sh) {
        const si = (iy * sw + ix) * 4;
        const di = (y * outWidth + x) * 4;
        outData.data[di] = srcData.data[si];
        outData.data[di + 1] = srcData.data[si + 1];
        outData.data[di + 2] = srcData.data[si + 2];
        outData.data[di + 3] = 255;
      }
    }
  }

  outCtx.putImageData(outData, 0, 0);

  // Apply scan enhancement: increase contrast + brightness
  outCtx.globalCompositeOperation = "source-over";
  outCtx.filter = "contrast(1.3) brightness(1.1)";
  outCtx.drawImage(outCanvas, 0, 0);
  outCtx.filter = "none";

  return outCanvas;
}

export function PerspectiveScanner() {
  const { toast } = useToast();
  const [image, setImage] = useState("");
  const [corners, setCorners] = useState<Point[]>([
    { x: 0.1, y: 0.1 },
    { x: 0.9, y: 0.1 },
    { x: 0.9, y: 0.9 },
    { x: 0.1, y: 0.9 },
  ]);
  const [correctedImage, setCorrectedImage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [scanLoading, setScanLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const draggingIdx = useRef<number | null>(null);

  const resetCorners = () => {
    setCorners([
      { x: 0.1, y: 0.1 },
      { x: 0.9, y: 0.1 },
      { x: 0.9, y: 0.9 },
      { x: 0.1, y: 0.9 },
    ]);
    setCorrectedImage("");
    setScanResult("");
  };

  const handleImageSelect = (base64: string) => {
    setImage(base64);
    resetCorners();
  };

  const getRelativePos = useCallback((e: PointerEvent | React.PointerEvent): Point | null => {
    const img = imgRef.current;
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  }, []);

  const handlePointerDown = useCallback((idx: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingIdx.current = idx;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (draggingIdx.current === null) return;
    const pos = getRelativePos(e);
    if (!pos) return;
    setCorners((prev) => {
      const next = [...prev];
      next[draggingIdx.current!] = pos;
      return next;
    });
  }, [getRelativePos]);

  const handlePointerUp = useCallback(() => {
    draggingIdx.current = null;
  }, []);

  const handleCorrect = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setCorrectedImage("");
    setScanResult("");

    try {
      await new Promise((r) => setTimeout(r, 50)); // let UI update

      const img = new window.Image();
      img.src = image;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = img.naturalWidth;
      srcCanvas.height = img.naturalHeight;
      const ctx = srcCanvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      // Output: A4-like proportions, max 2480px wide (300dpi A4)
      const outWidth = Math.min(2480, img.naturalWidth);
      const outHeight = Math.round(outWidth / A4_RATIO);

      const result = applyInverseHomography(srcCanvas, corners, outWidth, outHeight);
      setCorrectedImage(result.toDataURL("image/png"));
      toast({ title: "Perspectiva corrigida!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao corrigir perspectiva", variant: "destructive" });
    }
    setProcessing(false);
  }, [image, corners, toast]);

  const handleDownloadPdf = useCallback(() => {
    if (!correctedImage) return;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    pdf.addImage(correctedImage, "PNG", 0, 0, pageW, pageH);
    pdf.save(`scan-corrected-${Date.now()}.pdf`);
    toast({ title: "PDF salvo!" });
  }, [correctedImage, toast]);

  const handleOcr = useCallback(async () => {
    if (!correctedImage) return;
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
          body: JSON.stringify({ action: "ocr", imageBase64: correctedImage }),
        }
      );
      if (!response.ok) throw new Error("Erro no servidor");
      const data = await response.json();
      setScanResult(data.text || "Nenhum texto encontrado.");
    } catch {
      toast({ title: "Erro ao escanear texto", variant: "destructive" });
    }
    setScanLoading(false);
  }, [correctedImage, toast]);

  const cornerLabels = ["Superior Esq.", "Superior Dir.", "Inferior Dir.", "Inferior Esq."];

  return (
    <div className="space-y-4">
      {!image ? (
        <ImageUploader
          onImageSelect={handleImageSelect}
          currentImage=""
          onClear={() => {}}
          label="Upload da foto do documento"
        />
      ) : (
        <>
          {/* Interactive corner editor */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Arraste os 4 pontos para os cantos do documento
            </p>
            <div
              ref={containerRef}
              className="relative inline-block w-full select-none touch-none"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <img
                ref={imgRef}
                src={image}
                alt="Documento"
                className="w-full rounded-lg"
                draggable={false}
              />

              {/* SVG overlay for quadrilateral */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
              >
                <polygon
                  points={corners.map((c) => `${c.x},${c.y}`).join(" ")}
                  fill="hsl(var(--primary) / 0.15)"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.004"
                  strokeLinejoin="round"
                />
                {/* Edge lines with dashes */}
                {corners.map((c, i) => {
                  const next = corners[(i + 1) % 4];
                  return (
                    <line
                      key={i}
                      x1={c.x} y1={c.y}
                      x2={next.x} y2={next.y}
                      stroke="hsl(var(--primary))"
                      strokeWidth="0.003"
                      strokeDasharray="0.01 0.005"
                    />
                  );
                })}
              </svg>

              {/* Draggable handles */}
              {corners.map((c, i) => (
                <div
                  key={i}
                  className="absolute z-10 flex items-center justify-center"
                  style={{
                    left: `${c.x * 100}%`,
                    top: `${c.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: HANDLE_RADIUS * 2,
                    height: HANDLE_RADIUS * 2,
                    cursor: "grab",
                    touchAction: "none",
                  }}
                  onPointerDown={handlePointerDown(i)}
                >
                  <div className="w-6 h-6 rounded-full bg-primary border-2 border-primary-foreground shadow-lg flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary-foreground">{i + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCorrect}
                disabled={processing}
                className="blue-gradient text-white"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Corrigir Perspectiva
              </Button>
              <Button variant="outline" size="default" onClick={resetCorners}>
                <RotateCcw className="w-4 h-4 mr-2" /> Resetar Pontos
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => {
                  setImage("");
                  resetCorners();
                }}
              >
                Trocar Imagem
              </Button>
            </div>
          </div>

          {/* Corrected result */}
          {correctedImage && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Resultado Corrigido
              </h3>
              <img
                src={correctedImage}
                alt="Documento corrigido"
                className="w-full max-w-lg rounded-lg border border-border"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="blue-gradient text-white" onClick={handleDownloadPdf}>
                  <Download className="w-4 h-4 mr-2" /> Baixar como PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOcr}
                  disabled={scanLoading}
                >
                  {scanLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ScanLine className="w-4 h-4 mr-2" />
                  )}
                  Escanear Texto (OCR)
                </Button>
              </div>
            </div>
          )}

          {/* OCR result */}
          {scanResult && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Texto Extraído
              </h3>
              <Textarea
                value={scanResult}
                onChange={(e) => setScanResult(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="blue-gradient text-white"
                  onClick={() => {
                    const pdf = new jsPDF();
                    const lines = pdf.splitTextToSize(scanResult, 170);
                    pdf.setFontSize(12);
                    pdf.text(lines, 20, 20);
                    pdf.save(`ocr-${Date.now()}.pdf`);
                    toast({ title: "PDF salvo!" });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" /> Salvar Texto como PDF
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
                    saveAs(blob, `ocr-${Date.now()}.docx`);
                    toast({ title: "Arquivo .docx salvo!" });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" /> Salvar como .docx
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
