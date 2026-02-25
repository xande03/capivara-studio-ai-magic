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
          <div className="px-5 pb-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/30 border-2 border-emerald-500/20 bg-emerald-950/50 p-1">
              <img src="/logo.png" alt="Capivara Logo" className="w-full h-full object-cover rounded-xl" />
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
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            Ferramentas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={cn(
                        "transition-all duration-300 py-3 px-3 mx-2 rounded-xl group/item flex items-center justify-between",
                        item.hoverColor
                      )}
                      activeClassName={cn("font-medium", item.activeColor)}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <div className="flex flex-col">
                            <span className="text-[13px] font-semibold">{item.title}</span>
                            <span className="text-[10px] opacity-70 leading-tight">{item.description}</span>
                          </div>
                        )}
                      </div>
                      {!collapsed && <ChevronRight className="w-4 h-4 opacity-0 group-[.active]/item:opacity-100 transition-opacity" />}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            Visualização
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {gallery.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={`hover:bg-secondary/50 transition-all duration-300 py-3 group/item`}
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className={cn("mr-2 h-5 w-5 shrink-0 transition-colors", item.color)} />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className={cn("text-sm transition-colors", item.color)}>{item.title}</span>
                          <span className="text-[10px] text-muted-foreground leading-tight">{item.description}</span>
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
