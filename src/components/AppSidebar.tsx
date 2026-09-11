import {
  ArrowUpCircle,
  BookOpen,
  CalendarDays,
  FileText,
  Film,
  LayoutGrid,
  MessageCircle,
  Music,
  NotebookPen,
  Pencil,
  PenTool,
  QrCode,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

const tools = [
  { title: 'Chat IA', description: 'Claude & DeepSeek', url: '/chat', icon: MessageCircle, color: 'text-violet-600' },
  { title: 'Upscale', description: 'Aumentar resolução com IA', url: '/upscale', icon: ArrowUpCircle, color: 'text-purple-600' },
  { title: 'Gerar Imagem', description: 'Criar imagens com IA', url: '/generate', icon: Sparkles, color: 'text-red-600' },
  { title: 'Editar Imagem', description: 'Ferramentas de edição', url: '/edit', icon: Scissors, color: 'text-red-600' },
  { title: 'Remover Fundo', description: 'Remover fundo de imagens', url: '/remove-bg', icon: Pencil, color: 'text-amber-600' },
  { title: 'Music FX', description: 'Efeitos musicais com IA', url: '/music-fx', icon: Music, color: 'text-pink-600' },
  { title: 'QR Code', description: 'Gerar QR codes', url: '/qr-code', icon: QrCode, color: 'text-cyan-600' },
  { title: 'Conversor', description: 'Converter arquivos', url: '/converter', icon: FileText, color: 'text-orange-600' },
  { title: 'Resumir Texto', description: 'Resumir documentos', url: '/summarizer', icon: BookOpen, color: 'text-teal-600' },
  { title: 'Assinatura Digital', description: 'Criar assinatura', url: '/signature', icon: PenTool, color: 'text-indigo-600' },
  { title: 'Frames de Vídeo', description: 'Extrair frames', url: '/video-frames', icon: Film, color: 'text-rose-600' },
  { title: 'Galeria', description: 'Galeria de imagens', url: '/gallery', icon: LayoutGrid, color: 'text-sky-600' },
  { title: 'Calendário', description: 'Organizar compromissos', url: '/calendar', icon: CalendarDays, color: 'text-red-600' },
  { title: 'Notas', description: 'Bloco de notas pessoal', url: '/notes', icon: NotebookPen, color: 'text-red-600' },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="top-nav-island top-nav-scroll w-full max-w-[1440px] touch-pan-x overflow-x-auto rounded-[2rem] p-2 sm:p-2.5">
        <div className="flex min-w-max items-center gap-2">
          <NavLink
            to="/"
            aria-label="Ir para o início do Capivara Studio"
            className={cn(
              'group flex shrink-0 items-center gap-2 rounded-2xl px-2.5 py-2 transition-all duration-300 sm:px-3',
              location.pathname === '/'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-red-500/25'
                : 'text-foreground hover:bg-secondary',
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-600 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="hidden whitespace-nowrap text-sm font-bold tracking-tight lg:inline">Capivara Studio</span>
          </NavLink>

          <div className="hidden h-8 w-px shrink-0 bg-border sm:block" aria-hidden="true" />

          <nav
            aria-label="Ferramentas IA"
            className="flex shrink-0 items-center gap-1 scroll-smooth"
          >
            {tools.map((tool) => {
              const isActive = location.pathname === tool.url;
              const Icon = tool.icon;

              return (
                <NavLink
                  key={tool.url}
                  to={tool.url}
                  title={`${tool.title} — ${tool.description}`}
                  aria-label={tool.title}
                  className={cn(
                    'group relative flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:px-3.5 sm:text-sm',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-red-500/25'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110',
                      isActive ? 'text-primary-foreground' : tool.color,
                    )}
                  />
                  <span className="hidden whitespace-nowrap md:inline">{tool.title}</span>
                  {isActive && (
                    <span className="absolute inset-x-5 -bottom-0.5 h-0.5 rounded-full bg-primary-foreground/80" aria-hidden="true" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
