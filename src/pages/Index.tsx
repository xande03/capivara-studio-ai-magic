import { Link } from 'react-router-dom';
import { Sparkles, ArrowUpCircle, Scissors, Pencil, LayoutGrid, Zap, QrCode, Music, FileText, MessageCircle, BookOpen, PenTool, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Merge Skills
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Transforme suas ideias em realidade com nossa suíte de ferramentas de IA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Gerar Imagens
              </CardTitle>
              <CardDescription>
                Crie imagens únicas com base em sua descrição usando IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/generate">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-indigo-600" />
                Editar Imagens
              </CardTitle>
              <CardDescription>
                Modifique e melhore suas imagens com ferramentas avançadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/edit">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-indigo-600" />
                Aumentar Resolução
              </CardTitle>
              <CardDescription>
                Melhore a qualidade e a resolução das suas imagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/upscale">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-indigo-600" />
                Remover Fundo
              </CardTitle>
              <CardDescription>
                Remova o fundo das suas imagens com um clique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/remove-bg">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-indigo-600" />
                Converter Imagens
              </CardTitle>
              <CardDescription>
                Converta entre diferentes formatos de imagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/converter">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-600" />
                Gerar QR Code
              </CardTitle>
              <CardDescription>
                Códigos QR personalizados para suas necessidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/qr-code">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-indigo-600" />
                Análise Musical
              </CardTitle>
              <CardDescription>
                Analise músicas e obtenha insights detalhados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/music-dna">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                Efeitos Musicais
              </CardTitle>
              <CardDescription>
                Adicione efeitos especiais às suas músicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/music-fx">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Resumir Documentos
              </CardTitle>
              <CardDescription>
                Resumos e pontos-chave de documentos e PDFs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/summarizer">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-indigo-600" />
                Chat com IA
              </CardTitle>
              <CardDescription>
                Converse com assistentes de IA avançados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/chat">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Quadros de Vídeo
              </CardTitle>
              <CardDescription>
                Extraia quadros de vídeos e edite-os
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/video-frames">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-indigo-600" />
                Assinatura Digital
              </CardTitle>
              <CardDescription>
                Crie assinaturas digitais personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/signature">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5 text-indigo-600" />
                Galeria
              </CardTitle>
              <CardDescription>
                Visualize e gerencie suas criações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/gallery">
                <Button className="w-full">Começar</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}