import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PenTool, Trash2, Download, Undo2 } from "lucide-react";

const COLORS = [
  { name: "Preto", value: "#000000" },
  { name: "Azul", value: "#1e40af" },
  { name: "Vermelho", value: "#dc2626" },
  { name: "Verde", value: "#16a34a" },
];

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export default function SignaturePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[0].value);
  const [thickness, setThickness] = useState(2.5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);
  const { toast } = useToast();

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvasRef.current!.width / rect.width),
      y: (e.clientY - rect.top) * (canvasRef.current!.height / rect.height),
    };
  };

  const redraw = useCallback((strokesToDraw: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokesToDraw) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    redraw(strokes);
  }, [strokes, redraw]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pos = getPos(e);
    currentStroke.current = { points: [pos], color, width: thickness };
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke.current) return;
    const pos = getPos(e);
    currentStroke.current.points.push(pos);
    redraw([...strokes, currentStroke.current]);
  };

  const handlePointerUp = () => {
    if (currentStroke.current && currentStroke.current.points.length > 1) {
      setStrokes((prev) => [...prev, currentStroke.current!]);
    }
    currentStroke.current = null;
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) {
      toast({ title: "Desenhe sua assinatura primeiro", variant: "destructive" });
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "assinatura.png";
    a.click();
    toast({ title: "Assinatura salva como PNG transparente!" });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <PenTool className="w-5 h-5 text-rose-600" />
          </div>
          Assinatura Digital
        </h1>
        <p className="text-muted-foreground text-sm">
          Desenhe sua assinatura e exporte como PNG transparente para usar em documentos.
        </p>
      </div>

      {/* Controls */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Color selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Cor:</span>
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value ? "border-primary scale-110 shadow-md" : "border-border"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Thickness */}
            <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-[200px]">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                Espessura:
              </span>
              <Slider
                value={[thickness]}
                onValueChange={([v]) => setThickness(v)}
                min={1}
                max={6}
                step={0.5}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-6 text-right">{thickness}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-1 ml-auto">
              <Button variant="ghost" size="sm" onClick={handleUndo} disabled={strokes.length === 0} className="gap-1">
                <Undo2 className="w-4 h-4" /> Desfazer
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear} disabled={strokes.length === 0} className="gap-1">
                <Trash2 className="w-4 h-4" /> Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div
            className="relative w-full"
            style={{
              background:
                "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, transparent 0% 50%) 50% / 20px 20px",
            }}
          >
            <canvas
              ref={canvasRef}
              width={1200}
              height={400}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="w-full cursor-crosshair touch-none"
              style={{ display: "block" }}
            />
            {strokes.length === 0 && !isDrawing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-muted-foreground/40 text-lg font-medium select-none">
                  Desenhe sua assinatura aqui
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Button onClick={handleExport} disabled={strokes.length === 0} className="w-full gap-2 font-bold">
        <Download className="w-4 h-4" />
        Exportar como PNG Transparente
      </Button>
    </div>
  );
}
