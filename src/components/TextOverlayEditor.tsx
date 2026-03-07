import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Check, X, Type, Smile } from "lucide-react";

interface TextOverlayEditorProps {
  imageSrc: string;
  onConfirm: (resultDataUrl: string) => void;
  onCancel: () => void;
}

interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

const FONTS = [
  "Arial", "Georgia", "Courier New", "Impact", "Comic Sans MS", "Verdana",
  "Lobster", "Pacifico", "Oswald", "Bangers", "Permanent Marker", "Caveat"
];
const COLORS = ["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff6600", "#cc00ff"];
const STICKERS = ["⭐", "❤️", "🔥", "😂", "👍", "🎉", "💯", "🌟", "✨", "💀", "🤖", "🎨"];

// Load Google Fonts dynamically
const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Lobster&family=Pacifico&family=Oswald:wght@400;700&family=Bangers&family=Permanent+Marker&family=Caveat:wght@400;700&display=swap";

export function TextOverlayEditor({ imageSrc, onConfirm, onCancel }: TextOverlayEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState("Seu texto aqui");
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [scale, setScale] = useState(1);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [showStickers, setShowStickers] = useState(false);

  // Load Google Fonts
  useEffect(() => {
    if (!document.querySelector(`link[href*="Lobster"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => setImg(image);
    image.src = imageSrc;
  }, [imageSrc]);

  const drawCanvas = useCallback((ghostPos?: { x: number; y: number } | null) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    const maxW = container.clientWidth;
    const maxH = 500;
    const s = Math.min(maxW / img.width, maxH / img.height, 1);
    setScale(s);

    canvas.width = img.width * s;
    canvas.height = img.height * s;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    texts.forEach((t) => {
      ctx.font = `${t.fontSize * s}px ${t.fontFamily}`;
      ctx.fillStyle = t.color;
      ctx.strokeStyle = t.color === "#000000" ? "#ffffff" : "#000000";
      ctx.lineWidth = 2 * s;
      ctx.strokeText(t.text, t.x * s, t.y * s);
      ctx.fillText(t.text, t.x * s, t.y * s);

      if (t.id === selectedId) {
        const metrics = ctx.measureText(t.text);
        ctx.strokeStyle = "hsl(150, 80%, 50%)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(
          t.x * s - 4,
          t.y * s - t.fontSize * s - 4,
          metrics.width + 8,
          t.fontSize * s + 8
        );
        ctx.setLineDash([]);
      }
    });

    // Ghost preview at cursor position
    if (ghostPos && currentText) {
      ctx.globalAlpha = 0.5;
      ctx.font = `${fontSize * s}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.strokeStyle = fontColor === "#000000" ? "#ffffff" : "#000000";
      ctx.lineWidth = 1.5 * s;
      ctx.strokeText(currentText, ghostPos.x * s, ghostPos.y * s);
      ctx.fillText(currentText, ghostPos.x * s, ghostPos.y * s);
      ctx.globalAlpha = 1;

      // Crosshair
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ghostPos.x * s, 0);
      ctx.lineTo(ghostPos.x * s, canvas.height);
      ctx.moveTo(0, ghostPos.y * s);
      ctx.lineTo(canvas.width, ghostPos.y * s);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [img, texts, selectedId, currentText, fontSize, fontColor, fontFamily]);

  useEffect(() => {
    drawCanvas(mousePos);
  }, [drawCanvas, mousePos]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setMousePos({ x, y });
  };

  const handleCanvasMouseLeave = () => {
    setMousePos(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const clickedText = [...texts].reverse().find((t) => {
      const canvas2 = document.createElement("canvas");
      const ctx2 = canvas2.getContext("2d");
      if (!ctx2) return false;
      ctx2.font = `${t.fontSize}px ${t.fontFamily}`;
      const m = ctx2.measureText(t.text);
      return x >= t.x && x <= t.x + m.width && y >= t.y - t.fontSize && y <= t.y;
    });

    if (clickedText) {
      setSelectedId(clickedText.id);
      setCurrentText(clickedText.text);
      setFontSize(clickedText.fontSize);
      setFontColor(clickedText.color);
      setFontFamily(clickedText.fontFamily);
    } else {
      const newItem: TextItem = {
        id: Date.now().toString(),
        text: currentText,
        x,
        y,
        fontSize,
        color: fontColor,
        fontFamily,
      };
      setTexts((prev) => [...prev, newItem]);
      setSelectedId(newItem.id);
    }
  };

  const updateSelected = (updates: Partial<TextItem>) => {
    if (!selectedId) return;
    setTexts((prev) => prev.map((t) => (t.id === selectedId ? { ...t, ...updates } : t)));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setTexts((prev) => prev.filter((t) => t.id !== selectedId));
    setSelectedId(null);
  };

  const insertSticker = (sticker: string) => {
    setCurrentText(sticker);
    setFontSize(64);
    setShowStickers(false);
  };

  const handleConfirm = () => {
    if (!img) return;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = img.width;
    exportCanvas.height = img.height;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    texts.forEach((t) => {
      ctx.font = `${t.fontSize}px ${t.fontFamily}`;
      ctx.fillStyle = t.color;
      ctx.strokeStyle = t.color === "#000000" ? "#ffffff" : "#000000";
      ctx.lineWidth = 2;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
    });

    onConfirm(exportCanvas.toDataURL("image/png"));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
          <Type className="w-4 h-4" /> Inserir Texto na Imagem
        </h3>
        <p className="text-xs text-muted-foreground">Mova o mouse sobre a imagem para posicionar — clique para inserir</p>
      </div>

      <div ref={containerRef} className="rounded-xl overflow-hidden border border-border bg-muted/30">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          className="cursor-crosshair block"
          style={{ maxWidth: '100%' }}
        />
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Texto</Label>
            <Input
              value={selectedId ? texts.find((t) => t.id === selectedId)?.text || currentText : currentText}
              onChange={(e) => {
                setCurrentText(e.target.value);
                if (selectedId) updateSelected({ text: e.target.value });
              }}
              placeholder="Digite o texto..."
            />
          </div>
          <div>
            <Label className="text-xs">Fonte</Label>
            <Select
              value={fontFamily}
              onValueChange={(v) => {
                setFontFamily(v);
                if (selectedId) updateSelected({ fontFamily: v });
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs">Tamanho: {fontSize}px</Label>
          <Slider
            min={12}
            max={120}
            step={1}
            value={[fontSize]}
            onValueChange={([v]) => {
              setFontSize(v);
              if (selectedId) updateSelected({ fontSize: v });
            }}
          />
        </div>

        <div>
          <Label className="text-xs">Cor</Label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${fontColor === c ? "border-primary scale-110" : "border-border"}`}
                style={{ backgroundColor: c }}
                onClick={() => {
                  setFontColor(c);
                  if (selectedId) updateSelected({ color: c });
                }}
              />
            ))}
          </div>
        </div>

        {/* Stickers */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStickers(!showStickers)}
            className="gap-1"
          >
            <Smile className="w-4 h-4" />
            Figurinhas / Emojis
          </Button>
          {showStickers && (
            <div className="flex flex-wrap gap-2 mt-2 p-3 bg-secondary/50 rounded-lg border border-border animate-fade-in">
              {STICKERS.map((s) => (
                <button
                  key={s}
                  onClick={() => insertSticker(s)}
                  className="text-2xl hover:scale-125 transition-transform p-1"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 flex-wrap">
          {selectedId && (
            <Button variant="destructive" size="sm" onClick={deleteSelected}>
              <X className="w-4 h-4 mr-1" /> Remover
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" className="blue-gradient text-white" onClick={handleConfirm} disabled={texts.length === 0}>
            <Check className="w-4 h-4 mr-1" /> Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
