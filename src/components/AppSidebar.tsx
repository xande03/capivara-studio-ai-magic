import {
  Sparkles,
  ArrowUpCircle,
  Scissors,
  Pencil,
  Image,
  LayoutGrid,
  Zap,
} from "lucide-react";
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
  { title: "Upscale", description: "Aumentar resolução com IA", url: "/upscale", icon: ArrowUpCircle },
  { title: "Gerar Imagem", description: "Criar imagens com IA", url: "/generate", icon: Sparkles },
  { title: "Editar Imagem", description: "Modificar e combinar imagens", url: "/edit", icon: Pencil },
  { title: "Remover Fundo", description: "Recortar fundo automaticamente", url: "/remove-bg", icon: Scissors },
];

const gallery = [
  { title: "Galeria", description: "Ver imagens geradas", url: "/gallery", icon: LayoutGrid },
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
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <Image className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="text-base font-bold gold-text font-['Space_Grotesk']">
                Capivara Stúdio
              </h1>
              <p className="text-[10px] text-primary/70 font-semibold tracking-widest uppercase">
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
                      className="hover:bg-secondary/50 transition-colors py-3"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className="mr-2 h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm">{item.title}</span>
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
                      className="hover:bg-secondary/50 transition-colors py-3"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className="mr-2 h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm">{item.title}</span>
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
