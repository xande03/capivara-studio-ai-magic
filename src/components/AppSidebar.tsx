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
  { title: "Upscale", description: "Aumentar resolução com IA", url: "/upscale", icon: ArrowUpCircle, color: "hover:text-indigo-500" },
  { title: "Gerar Imagem", description: "Criar imagens com IA", url: "/generate", icon: Sparkles, color: "hover:text-cyan-500" },
  { title: "Editar Imagem", description: "Modificar e combinar imagens", url: "/edit", icon: Pencil, color: "hover:text-blue-500" },
  { title: "Remover Fundo", description: "Recortar fundo automaticamente", url: "/remove-bg", icon: Scissors, color: "hover:text-sky-500" },
];

const gallery = [
  { title: "Galeria", description: "Ver imagens geradas", url: "/gallery", icon: LayoutGrid, color: "hover:text-violet-500" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="pt-4">
        {!collapsed && (
          <div className="px-4 pb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg blue-gradient flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold blue-text font-['Space_Grotesk']">
                Capivara Stúdio
              </h1>
              <p className="text-[10px] text-primary font-semibold tracking-widest uppercase opacity-80">
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
                      className="hover:bg-secondary/50 transition-all duration-300 py-3 group/item border-l-2 border-transparent hover:border-primary/30"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className={cn("mr-2 h-5 w-5 shrink-0 transition-colors", item.color)} />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className={cn("text-sm transition-colors font-medium", item.color)}>{item.title}</span>
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
