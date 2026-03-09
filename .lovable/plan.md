

## Plano: Corrigir todas as ferramentas e melhorar Frames de Vídeo

### Problema Principal
Todas as ferramentas que dependem do AI Gateway (imagem, chat, resumo, conversor OCR) estão falhando com erro **402 - Créditos insuficientes**. A assinatura digital é client-side pura e deve funcionar normalmente.

### Diagnóstico por Ferramenta

| Ferramenta | Depende de AI Gateway? | Status |
|---|---|---|
| Gerar Imagem | Sim (image-process) | 402 |
| Upscale | Sim (image-process) | 402 |
| Editar Imagem | Sim (image-process) | 402 |
| Remover Fundo | Sim (image-process) | 402 |
| Chat IA | Sim (chat) + Puter.js | 402 para Gemini; Puter pode funcionar |
| Conversor PDF | Parcial (document-process para OCR) | img2pdf funciona; OCR falha com 402 |
| Resumidor IA | Sim (summarize) | 402 |
| Assinatura | Não (client-side canvas) | Deve funcionar |
| Frames de Vídeo | Sim (image-process) | 402 |

### Solução

**A causa raiz é falta de créditos no workspace.** O código está correto - todos os edge functions tratam 402/429 adequadamente. Para resolver sem depender de créditos, vou implementar:

#### 1. Melhorar tratamento de erro 402 em todas as páginas
- Mostrar mensagem clara e amigável quando créditos acabam
- Adicionar banner/alerta persistente informando sobre créditos insuficientes
- Desabilitar botões de ação quando 402 é detectado, com mensagem explicativa

#### 2. Atualizar o Chat para ser mais resiliente
- O Chat usa Puter.js para Claude e DeepSeek (funciona sem créditos)
- Apenas Gemini 3 Pro depende do gateway - marcar como indisponível quando sem créditos
- Garantir fallback para modelos Puter.js funcione corretamente

#### 3. Conversor de Documentos
- img2pdf é 100% client-side (jsPDF) - não depende de AI, já funciona
- PDF-to-Word extrai texto com pdfjs-dist client-side, só usa OCR como fallback - funciona parcialmente
- OCR/Scan depende do gateway - mostrar erro claro

#### 4. Melhorias nos Frames de Vídeo (plano aprovado anteriormente)
- Atualizar textos e labels para "Sequência de Frames" / storyboard
- Melhorar placeholders e descrições
- Adicionar download em lote (ZIP) com jszip
- Criar componente FrameSequenceViewer (slideshow/carrossel)
- Melhorar prompts para continuidade narrativa entre frames
- Grid responsivo adaptado ao número de frames
- Loading state mostrando qual frame está sendo gerado (já existe parcialmente)

### Arquivos a Modificar

1. **`src/lib/imageApi.ts`** - Adicionar detecção de erro 402 e tipo de erro específico
2. **`src/pages/GeneratePage.tsx`** - Banner de créditos insuficientes
3. **`src/pages/UpscalePage.tsx`** - Mesmo tratamento
4. **`src/pages/EditPage.tsx`** - Mesmo tratamento  
5. **`src/pages/RemoveBgPage.tsx`** - Mesmo tratamento
6. **`src/pages/ChatPage.tsx`** - Marcar Gemini como indisponível; manter Puter models
7. **`src/pages/ConverterPage.tsx`** - Tratamento para OCR; img2pdf já ok
8. **`src/pages/SummarizerPage.tsx`** - Banner de créditos
9. **`src/pages/VideoFramesPage.tsx`** - Reescrever com melhorias do plano de frames
10. **`src/components/FrameSequenceViewer.tsx`** - Novo componente slideshow
11. **`src/components/VideoStyleSelector.tsx`** - Adicionar tipos de sequência

### Detalhes Técnicos

**Detecção de 402**: Modificar `processImage` em `imageApi.ts` para retornar `error` com código identificável (ex: `"CREDITS_EXHAUSTED: ..."`) para que as páginas possam reagir diferentemente.

**FrameSequenceViewer**: Carrossel com play/pause, navegação manual, controle de velocidade (100-900ms), e modo fullscreen.

**Download ZIP**: Usar jszip (já instalado) para empacotar todos os frames gerados.

**Prompts de frames melhorados**: Adicionar contexto narrativo por posição (início/meio/fim da cena) para melhor continuidade visual.

