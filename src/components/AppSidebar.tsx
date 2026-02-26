import {
  Sparkles,
  ArrowUpCircle,
  Scissors,
  Pencil,
  Image,
  LayoutGrid,
  Zap,
  ChevronLeft,
  ChevronRight,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const tools = [
  { title: "Upscale", description: "Aumentar resolução com IA", url: "/upscale", icon: ArrowUpCircle, activeColor: "bg-emerald-600 text-white", hoverColor: "hover:text-emerald-500" },
  { title: "Remover Fundo", description: "Recortar fundo automaticamente", url: "/remove-bg", icon: Scissors, activeColor: "bg-teal-600 text-white", hoverColor: "hover:text-teal-500" },
  { title: "Gerar Imagem", description: "Criar imagens com IA", url: "/generate", icon: Sparkles, activeColor: "bg-emerald-500 text-white", hoverColor: "hover:text-emerald-400" },
  { title: "Editar Imagem", description: "Modificar e combinar imagens", url: "/edit", icon: Pencil, activeColor: "bg-cyan-600 text-white", hoverColor: "hover:text-cyan-400" },
  { title: "Music DNA", description: "Identificar músicas por link", url: "/music-dna", icon: Music, activeColor: "bg-purple-600 text-white", hoverColor: "hover:text-purple-500" },
];

const gallery = [
  { title: "Galeria", description: "Ver imagens geradas", url: "/gallery", icon: LayoutGrid, color: "hover:text-violet-500" },
];

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const collapsed = !isMobile && state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="pt-4">
        {!collapsed && (
          <div className="px-6 pb-8 pt-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500/30 bg-emerald-950/20 p-0.5">
              <img src="/logo.png" alt="Capivara Logo" className="w-full h-full object-cover rounded-[14px]" />
            </div>
            <div>
              <h1 className="text-lg font-black emerald-text font-['Outfit'] tracking-tight leading-none">
                Capivara
              </h1>
              <p className="text-[9px] text-emerald-500/60 font-black tracking-[0.2em] uppercase mt-1">
                STUDIO PRO
              </p>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 px-5">
            Ferramentas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3 px-2">
              {tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0">
                    <NavLink
                      to={item.url}
                      end
                      className={cn(
                        "transition-all duration-300 py-4 px-4 rounded-2xl group/item flex items-center justify-between border border-transparent shadow-sm",
                        item.hoverColor,
                        "hover:bg-white/5"
                      )}
                      activeClassName={cn("font-medium border-white/10 shadow-lg", item.activeColor)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold tracking-tight">{item.title}</span>
                            <span className="text-[10px] opacity-60 leading-tight font-medium">{item.description}</span>
                          </div>
                        )}
                      </div>
                      {!collapsed && <ChevronRight className="w-4 h-4 opacity-10 group-[.active]/item:opacity-100 transition-opacity" />}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 mt-6 px-5">
            Visualização
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3 px-2">
              {gallery.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0">
                    <NavLink
                      to={item.url}
                      end
                      className={`hover:bg-white/5 transition-all duration-300 py-4 px-4 rounded-2xl group/item flex items-center border border-transparent`}
                      activeClassName="bg-emerald-500/10 text-emerald-500 font-bold border-emerald-500/20 shadow-lg"
                    >
                      <item.icon className={cn("mr-3 h-5 w-5 shrink-0 transition-colors", item.color)} />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className={cn("text-[14px] font-bold tracking-tight transition-colors", item.color)}>{item.title}</span>
                          <span className="text-[10px] text-muted-foreground/60 leading-tight font-medium">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] tracking-wide uppercase">Powered by AI</span>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
