import { Film } from "lucide-react";

export default function VideoPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold gold-text flex items-center gap-2">
          <Film className="w-7 h-7 text-primary" />
          Gerar Vídeo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Geração de vídeos com IA — em breve via SeedReam e outras plataformas
        </p>
      </div>

      <div className="glass-card rounded-xl p-12 text-center">
        <Film className="w-16 h-16 mx-auto mb-4 text-primary/40" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Em Desenvolvimento</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          A ferramenta de geração de vídeos está sendo integrada com SeedReam e outras plataformas de IA generativa.
          Em breve você poderá criar vídeos a partir de prompts e imagens.
        </p>
      </div>
    </div>
  );
}
