// Complete file content — EVERY LINE
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
import MusicFxPage from "./pages/MusicFxPage";
import QrCodePage from "./pages/QrCodePage";
import ConverterPage from "./pages/ConverterPage";
import ChatPage from "./pages/ChatPage";
import MusicDnaPage from "./pages/MusicDnaPage";
import SummarizerPage from "./pages/SummarizerPage";
import SignaturePage from "./pages/SignaturePage";
import VideoFramesPage from "./pages/VideoFramesPage";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/upscale" element={<UpscalePage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/edit" element={<EditPage />} />
              <Route path="/remove-bg" element={<RemoveBgPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/music-fx" element={<MusicFxPage />} />
              <Route path="/music-dna" element={<MusicDnaPage />} />
              <Route path="/qr-code" element={<QrCodePage />} />
              <Route path="/qrcode" element={<QrCodePage />} />
              <Route path="/converter" element={<ConverterPage />} />
              <Route path="/summarizer" element={<SummarizerPage />} />
              <Route path="/signature" element={<SignaturePage />} />
              <Route path="/video-frames" element={<VideoFramesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;