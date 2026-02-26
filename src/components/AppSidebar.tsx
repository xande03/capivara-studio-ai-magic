import {
  Sparkles,
  ArrowUpCircle,
  Scissors,
  Pencil,
  LayoutGrid,
  Zap,
  QrCode,
  Music,
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
  { title: "Upscale", description: "Aumentar resolução com IA", url: "/upscale", icon: ArrowUpCircle, color: "bg-purple-500/10 text-purple-600" },
  { title: "Gerar Imagem", description: "Criar imagens com IA", url: "/generate", icon: Sparkles, color: "bg-emerald-500/10 text-emerald-600" },
  { title: "Editar Imagem", description: "Modificar e combinar imagens", url: "/edit", icon: Pencil, color: "bg-blue-500/10 text-blue-600" },
  { title: "Remover Fundo", description: "Recortar fundo automaticamente", url: "/remove-bg", icon: Scissors, color: "bg-orange-500/10 text-orange-600" },
  { title: "QR Code Magic", description: "Gerar QR Codes profissionais", url: "/qrcode", icon: QrCode, color: "bg-pink-500/10 text-pink-600" },
  { title: "Music DNA", description: "Análise profunda de áudio", url: "/music-dna", icon: Music, color: "bg-indigo-500/10 text-indigo-600" },
];

const gallery = [
  { title: "Galeria", description: "Ver imagens geradas", url: "/gallery", icon: LayoutGrid, color: "bg-slate-500/10 text-slate-600" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="pt-8">
        {!collapsed && (
          <div className="px-6 pb-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-emerald-500/20 border border-white/10 flex items-center justify-center bg-white dark:bg-black/20">
              <img src="/logo.png" alt="Capivara Stúdio" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black emerald-text font-['Space_Grotesk'] tracking-tighter leading-none">
                Capivara Stúdio
              </h1>
              <p className="text-[11px] text-foreground/50 font-black tracking-[0.2em] uppercase mt-1">
                STUDIO PRO
              </p>
            </div>
          </div>
        )}

        <SidebarGroup className="px-3">
          <SidebarGroupLabel className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-black pb-2 px-3">
            Ferramentas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0">
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 hover:bg-white/5 group border border-transparent hover:border-white/5"
                      activeClassName="bg-white/5 border-emerald-500/20 shadow-xl shadow-black/20"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${item.color} shadow-inner`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      {!collapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium leading-tight opacity-70 group-hover:opacity-100 transition-opacity truncate">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-3 mt-4">
          <SidebarGroupLabel className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-black pb-2 px-3">
            Explorar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {gallery.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0">
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 hover:bg-white/5 group border border-transparent hover:border-white/5"
                      activeClassName="bg-white/5 border-emerald-500/20 shadow-xl shadow-black/20"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${item.color} shadow-inner`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      {!collapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium leading-tight opacity-70 group-hover:opacity-100 transition-opacity truncate">
                            {item.description}
                          </span>
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
        <SidebarFooter className="p-6">
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/50 dark:text-emerald-500/50">Version</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500/80">Premium v2.4</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-500 animate-pulse" />
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
