import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2 } from "lucide-react";

interface FrameSequenceViewerProps {
  frames: string[];
}

export function FrameSequenceViewer({ frames }: FrameSequenceViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    stop();
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % frames.length);
    }, speed);
  }, [frames.length, speed, stop]);

  useEffect(() => {
    if (isPlaying) {
      play();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [speed, isPlaying, play]);

  useEffect(() => {
    if (currentIndex >= frames.length) setCurrentIndex(0);
  }, [frames.length, currentIndex]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (frames.length === 0) return null;

  return (
    <div ref={containerRef} className="space-y-3 bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Preview Sequencial</h4>
        <span className="text-xs text-muted-foreground">
          Frame {currentIndex + 1} / {frames.length}
        </span>
      </div>

      <div className="relative rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center min-h-[200px]">
        <img
          src={frames[currentIndex]}
          alt={`Frame ${currentIndex + 1}`}
          className="w-full h-auto max-h-[400px] object-contain"
        />
      </div>

      {/* Timeline dots */}
      <div className="flex justify-center gap-1.5">
        {frames.map((_, i) => (
          <button
            key={i}
            onClick={() => { stop(); setCurrentIndex(i); }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === currentIndex
                ? "bg-primary scale-125"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => { stop(); setCurrentIndex((prev) => (prev - 1 + frames.length) % frames.length); }}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => isPlaying ? stop() : play()}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => { stop(); setCurrentIndex((prev) => (prev + 1) % frames.length); }}
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-3 px-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Velocidade:</span>
        <Slider
          value={[1000 - speed]}
          onValueChange={([v]) => setSpeed(1000 - v)}
          min={100}
          max={900}
          step={50}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-12 text-right">{speed}ms</span>
      </div>
    </div>
  );
}
