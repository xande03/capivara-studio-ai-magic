

# Plano: Melhorias de responsividade, novo modo cartoon, yout.com, persistência localStorage, conversor e chat

## 1. Responsividade mobile (Android/iOS)

**Layout.tsx:**
- Reduzir padding do `<div className="flex-1 overflow-auto p-6">` para `p-3 md:p-6`
- Header: esconder texto "Capivara Stúdio" em mobile, ajustar gaps

**AppSidebar.tsx:**
- Já usa `collapsible="icon"` — funciona bem
- Ajustar SidebarFooter e logo para não quebrar em telas menores

**Páginas individuais:**
- `ChatPage.tsx`: header com flex-wrap para model selector ficar embaixo em mobile; `h-[calc(100vh-6rem)]` → `h-[calc(100dvh-6rem)]` para iOS
- `ConverterPage.tsx`: tabs com `grid-cols-1 sm:grid-cols-3` para não comprimir em mobile
- `MusicDnaPage.tsx`: input + botão em coluna no mobile (já usa `flex-col md:flex-row`)
- `GeneratePage.tsx`, `EditPage.tsx`: grid `grid-cols-1 md:grid-cols-2` (já usam `md:grid-cols-2` — ok)
- `Index.tsx`: grid responsivo já ok

**Geral:**
- Usar `100dvh` em vez de `100vh` para Safari iOS
- Adicionar `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` no index.html se ausente

## 2. Modo "Cartoon" no gerador de imagem

**`src/components/CreationModeSelector.tsx`:**
- Adicionar novo modo:
```typescript
{
  id: "cartoon",
  label: "Cartoon",
  description: "Estilo cartoon ocidental",
  icon: Smile, // ou outro ícone adequado
  instruction: "Cartoon style, bold outlines, bright and saturated colors, playful and animated look, western animation aesthetic."
}
```
- Atualizar o type `CreationMode` para incluir `"cartoon"`

## 3. Yout.com — URL correta

**`src/pages/MusicDnaPage.tsx`:**
- A URL atual é `https://yout.com/video/${videoId}` — o formato correto do yout.com para converter é `https://yout.com/video/${videoId}/` ou simplesmente `https://yout.com/watch?v=${videoId}`
- Atualizar para `https://yout.com/video/${videoId}/` (com trailing slash) que é o formato funcional

## 4. Persistência no localStorage

O sistema `sessionHistory.ts` já salva no localStorage com a key `capivara-studio-history`. Todas as ferramentas que usam `addToHistory()` já persistem. Verificação:

- **Gerador**: ✅ já chama `addToHistory` com tool "generate"
- **Editor**: ✅ já chama `addToHistory` com tool "edit"  
- **QR Code**: Verificar se chama `addToHistory` — se não, adicionar
- **Remove BG / Upscale**: Verificar se chamam `addToHistory`
- **Galeria**: ✅ já lê do localStorage com `getAllHistory()`

Vou verificar e garantir que TODAS as ferramentas (upscale, remove-bg, qr-code) salvam no histórico localStorage. O QR Code já tem armazenamento próprio no Supabase Storage — manter separado.

## 5. Conversor PDF→Word — processamento efetivo

**Problema**: O edge function `document-process` envia o PDF inteiro como base64 no campo `pdfBase64` para o AI, mas modelos de texto não podem ler PDFs binários diretamente. A IA recebe um blob base64 e tenta interpretar — não funcional.

**Solução**: Converter cada página do PDF em imagem (usando canvas + pdf.js ou pdf-lib rendering) no client-side, e enviar cada página como imagem para OCR da IA. Alternativamente, usar a capacidade multimodal do Gemini que aceita imagens.

**Abordagem prática:**
- No client (`ConverterPage.tsx`), converter o PDF em imagens por página usando `pdfjs-dist` (precisa instalar)
- Enviar cada imagem de página para o edge function com action `ocr`
- Concatenar os textos extraídos
- Gerar .docx com formatação preservada

**Edge function** (`document-process`): manter a action `ocr` que já funciona com imagens — apenas o client precisa mudar para enviar imagens em vez de PDF binário.

**Scan**: Já funciona — envia imagem → OCR via IA → retorna texto. Garantir que funciona end-to-end.

## 6. Chat LLMs — garantir funcionamento

**Puter.js** carrega dinamicamente e chama `puter.ai.chat()`. O wrapper já está implementado.

**Verificações:**
- O streaming funciona para ambos os modelos
- Adicionar tratamento de erro mais robusto — se Puter.js falhar no carregamento (CORS, rede), mostrar mensagem clara
- Adicionar um fallback: se streaming falhar, tentar sem stream

## Arquivos a editar

| Arquivo | Mudança |
|---|---|
| `src/components/Layout.tsx` | Padding responsivo, meta viewport |
| `src/components/AppSidebar.tsx` | Ajustes mobile menores |
| `src/pages/ChatPage.tsx` | Flex-wrap header, 100dvh, fallback de erro |
| `src/pages/ConverterPage.tsx` | Tabs responsivas, PDF→imagens→OCR flow |
| `src/pages/MusicDnaPage.tsx` | URL yout.com corrigida |
| `src/components/CreationModeSelector.tsx` | Adicionar modo Cartoon |
| `src/pages/GeneratePage.tsx` | Garantir persistência |
| `src/pages/EditPage.tsx` | Garantir persistência (já ok) |
| `src/pages/QrCodePage.tsx` | Garantir `addToHistory` se ausente |
| `src/pages/UpscalePage.tsx` | Garantir `addToHistory` se ausente |
| `src/pages/RemoveBgPage.tsx` | Garantir `addToHistory` se ausente |
| `src/lib/puterAi.ts` | Fallback sem streaming |
| `index.html` | viewport meta com viewport-fit=cover |
| `package.json` | Instalar `pdfjs-dist` para render PDF→imagem |

