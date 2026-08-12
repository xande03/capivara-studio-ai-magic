import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-[100dvh] flex w-full text-foreground">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-3 md:px-4 glass-card shrink-0">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2 md:mr-4" />
              <span className="hidden sm:inline text-sm text-emerald-500/80 font-semibold tracking-wider uppercase">
                Capivara Stúdio
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-tighter">Online</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 text-emerald-500/70 hover:text-emerald-500 hover:bg-emerald-500/10"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-3 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
