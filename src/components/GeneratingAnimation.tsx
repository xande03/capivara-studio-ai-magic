import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MESSAGES = [
  "Processando...",
  "Analisando dados...",
  "Aplicando inteligência...",
  "Quase lá...",
  "Finalizando...",
];

interface Props {
  label?: string;
}

export function GeneratingAnimation({ label }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        return p + Math.random() * 8;
      });
    }, 600);
    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="h-64 rounded-xl bg-muted/30 border border-border flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-ping" />
      </div>
      <div className="w-48">
        <Progress value={progress} className="h-1.5" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        {label || MESSAGES[msgIndex]}
      </p>
    </div>
  );
}
