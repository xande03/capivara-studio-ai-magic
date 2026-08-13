import { Sparkles, ArrowUpCircle, Scissors, Pencil, LayoutGrid, Zap, QrCode, Music, FileText, MessageCircle, BookOpen, PenTool, Film } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar } from '@/components/ui/sidebar';

const tools = [
  { title: 'Chat IA', description: 'Claude & DeepSeek', url: '/chat', icon: MessageCircle, color: 'bg-violet-500/10 text-violet-600' },
  { title: 'Upscale', description: 'Aumentar resolução com IA', url: '/upscale', icon: ArrowUpCircle, color: 'bg-purple-500/10 text-purple-600' },
  { title: 'Gerar Imagem', description: 'Criar imagens com IA', url: '/generate', icon: Sparkles, color: 'bg-blue-500/10 text-blue-600' },
  { title: 'Editar Imagem', description: 'Ferramentas de edição', url: '/edit', icon: Scissors, color: 'bg-emerald-500/10 text-emerald-600' },
  { title: 'Remover Fundo', description: 'Remover fundo de imagens', url: '/remove-bg', icon: Pencil, color: 'bg-amber-500/10 text-amber-600' },
  { title: 'Music FX', description: 'Efeitos musicais com IA', url: '/music-fx', icon: Music, color: 'bg-pink-500/10 text-pink-600' },
  { title: 'QR Code', description: 'Gerar QR codes', url: '/qr-code', icon: QrCode, color: 'bg-cyan-500/10 text-cyan-600' },
  { title: 'Conversor', description: 'Converter arquivos', url: '/converter', icon: FileText, color: 'bg-orange-500/10 text-orange-600' },
  { title: 'Resumir Texto', description: 'Resumir documentos', url: '/summarizer', icon: BookOpen, color: 'bg-teal-500/10 text-teal-600' },
  { title: 'Assinatura Digital', description: 'Criar assinatura', url: '/signature', icon: PenTool, color: 'bg-indigo-500/10 text-indigo-600' },
  { title: 'Frames de Vídeo', description: 'Extrair frames', url: '/video-frames', icon: Film, color: 'bg-rose-500/10 text-rose-600' },
  { title: 'Gallery', description: 'Galeria de imagens', url: '/gallery', icon: LayoutGrid, color: 'bg-sky-500/10 text-sky-600' },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas IA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((tool) => (
                <SidebarMenuItem key={tool.url}>
                  <SidebarMenuButton asChild isActive={location.pathname === tool.url}>
                    <NavLink to={tool.url} className={tool.color}>
                      <tool.icon />
                      <span>{tool.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}