import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, Sparkles, Pencil, Scissors, Film, QrCode, Music, FileText, MessageCircle } from "lucide-react";

const tools = [
  {
    title: "Upscale & Restauração",
    description: "Aumente resolução e restaure detalhes escondidos com IA",
    icon: ArrowUpCircle,
    path: "/upscale",
  },
  {
    title: "Gerar Imagem",
    description: "Crie imagens de personagens, cenários, fenômenos e mais",
    icon: Sparkles,
    path: "/generate",
  },
  {
    title: "Editar Imagem",
    description: "Edite, remova ou combine elementos em imagens",
    icon: Pencil,
    path: "/edit",
  },
  {
    title: "Remover Fundo",
    description: "Remova fundos automaticamente com precisão",
    icon: Scissors,
    path: "/remove-bg",
  },
  {
    title: "Gerar Vídeo",
    description: "Crie vídeos a partir de prompts — em breve",
    icon: Film,
    path: "/video",
  },
  {
    title: "QR Code Magic",
    description: "Crie QR Codes dinâmicos para arquivos, mídia e links",
    icon: QrCode,
    path: "/qrcode",
  },
  {
    title: "Music DNA",
    description: "Identifique BPM, Tom, Letras e muito mais com IA",
    icon: Music,
    path: "/music-dna",
  },
  {
    title: "Conversor de Documentos",
    description: "Converta imagens em PDF, PDF em Word e escaneie documentos",
    icon: FileText,
    path: "/converter",
  },
  {
    title: "Chat IA",
    description: "Converse com Claude 3.7 Sonnet e DeepSeek v3.2",
    icon: MessageCircle,
    path: "/chat",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="text-center space-y-4 py-8">
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <img src="/logo.png" alt="Capivara Stúdio" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-4xl font-bold emerald-text">Capivara Stúdio</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Suite profissional de processamento de imagens com IA. Upscale, geração, edição e muito mais — com modelos Nano Banana e Nano Banana Pro.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.path}
            className="glass-card rounded-xl p-6 cursor-pointer hover:border-primary/40 transition-all hover:scale-[1.02] group"
            onClick={() => navigate(tool.path)}
          >
            <tool.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-foreground mb-1">{tool.title}</h3>
            <p className="text-xs text-muted-foreground">{tool.description}</p>
          </div>
        ))}
      </section>

      <footer className="text-center pb-6">
        <p className="text-xs text-muted-foreground/50">
          Capivara Stúdio • Processamento de imagens com inteligência artificial
        </p>
      </footer>
    </div>
  );
};

export default Index;
