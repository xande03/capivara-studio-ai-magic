import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import ChatPage from '@/pages/ChatPage';
import GeneratePage from '@/pages/GeneratePage';
import EditPage from '@/pages/EditPage';
import UpscalePage from '@/pages/UpscalePage';
import RemoveBgPage from '@/pages/RemoveBgPage';
import ConverterPage from '@/pages/ConverterPage';
import QrCodePage from '@/pages/QrCodePage';
import SummarizerPage from '@/pages/SummarizerPage';
import MusicDnaPage from '@/pages/MusicDnaPage';
import MusicFxPage from '@/pages/MusicFxPage';
import VideoFramesPage from '@/pages/VideoFramesPage';
import SignaturePage from '@/pages/SignaturePage';
import GalleryPage from '@/pages/GalleryPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/edit" element={<EditPage />} />
          <Route path="/upscale" element={<UpscalePage />} />
          <Route path="/remove-bg" element={<RemoveBgPage />} />
          <Route path="/converter" element={<ConverterPage />} />
          <Route path="/qr-code" element={<QrCodePage />} />
          <Route path="/summarizer" element={<SummarizerPage />} />
          <Route path="/music-dna" element={<MusicDnaPage />} />
          <Route path="/music-fx" element={<MusicFxPage />} />
          <Route path="/video-frames" element={<VideoFramesPage />} />
          <Route path="/signature" element={<SignaturePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;