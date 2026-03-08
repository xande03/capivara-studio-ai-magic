import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import UpscalePage from "./pages/UpscalePage";
import GeneratePage from "./pages/GeneratePage";
import EditPage from "./pages/EditPage";
import RemoveBgPage from "./pages/RemoveBgPage";
import GalleryPage from "./pages/GalleryPage";
import MusicDnaPage from "./pages/MusicDnaPage";
import QrCodePage from "./pages/QrCodePage";
import ConverterPage from "./pages/ConverterPage";
import ChatPage from "./pages/ChatPage";
import SummarizerPage from "./pages/SummarizerPage";
import SignaturePage from "./pages/SignaturePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/upscale" element={<UpscalePage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/edit" element={<EditPage />} />
              <Route path="/remove-bg" element={<RemoveBgPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/music-dna" element={<MusicDnaPage />} />
              <Route path="/qrcode" element={<QrCodePage />} />
              <Route path="/converter" element={<ConverterPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/summarizer" element={<SummarizerPage />} />
              <Route path="/signature" element={<SignaturePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

// Manual sync to trigger Lovable build: 22:56
