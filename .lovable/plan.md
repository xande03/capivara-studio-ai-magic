

# Plano: Melhorias no gerador, chat, editor de texto, loading e Music DNA

## 1. Gerador de Imagem

### 1.1 Cartoon visível
O modo "cartoon" já existe em `CreationModeSelector.tsx` (linha 43-48). Provavelmente o problema é que o grid `grid-cols-2 sm:grid-cols-3` com 10 itens faz o cartoon ficar fora da vista em telas menores. Vou aumentar o grid para `lg:grid-cols-4` ou `lg:grid-cols-5` para mostrar todos os modos, e reordenar para que Cartoon fique mais visível.

### 1.2 Modo "Avatar"
Adicionar novo modo em `CreationModeSelector.tsx`:
- `id: "avatar"`, instruction focada em rosto/retrato estilizado
- No `GeneratePage.tsx`, quando modo "avatar" estiver selecionado e não houver prompt, permitir gerar só com imagem (remover validação de prompt obrigatório quando há imagem + modo avatar)

### 1.3 Auto-preencher prompt ao selecionar modo
Em `GeneratePage.tsx`, quando o usuário clica em um modo de criação:
- Se o prompt estiver vazio, preencher automaticamente com a `instruction` do modo selecionado traduzida/resumida como placeholder
- Implementar via `onChange` do `CreationModeSelector`: ao mudar modo, se prompt vazio ou igual à instruction anterior, substituir pelo novo instruction

### 1.4 Modelo padrão Nano Banana Pro
Mudar `useState<ModelType>("nano-banana")` para `useState<ModelType>("nano-banana-pro")` na linha 18.

## 2. Chat — Adicionar Gemini 3 Pro

### `src/lib/puterAi.ts`
- Não usar Puter.js para Gemini — Gemini 3 Pro está disponível via Lovable AI Gateway
- Adicionar tipo `"gemini-3-pro"` ao `PuterModel`
- No `streamPuterChat`, se model === "gemini-3-pro", chamar edge function em vez de Puter.js

### Nova edge function `supabase/functions/chat/index.ts`
- Usar Lovable AI Gateway com model `google/gemini-3-pro-preview`
- Streaming SSE, system prompt em português
- Usar LOVABLE_API_KEY (já disponível)

### `src/pages/ChatPage.tsx`
- Adicionar `{ value: "gemini-3-pro", label: "Gemini 3 Pro" }` ao array MODELS

## 3. Editor de Texto — Preview simultâneo e mais fontes

### `src/components/TextOverlayEditor.tsx`
- Adicionar cursor visual: ao mover o mouse sobre o canvas, mostrar um indicador (crosshair + preview do texto) na posição atual antes de clicar
- Implementar via `onMouseMove` no canvas: redesenhar canvas + texto fantasma na posição do cursor
- Texto em tempo real: quando o usuário digita no input, o texto selecionado ou o preview atualiza instantaneamente (já faz isso parcialmente, precisa garantir re-render)
- Mais fontes: adicionar "Lobster", "Pacifico", "Oswald", "Bangers", "Permanent Marker", "Caveat" (Google Fonts — carregar via link no head)
- Adicionar categoria de "figurinhas/stickers": emojis predefinidos (⭐, ❤️, 🔥, 😂, 👍, etc.) que o usuário pode inserir como texto grande

## 4. Animação de Loading para resultados

Criar componente `LoadingOverlay` com:
- Skeleton pulse animado na área do resultado
- Texto animado tipo "Processando...", "Quase lá...", "Finalizando..."
- Progress bar indeterminada com gradiente animado
- Aplicar em: `GeneratePage`, `EditPage`, `UpscalePage`, `RemoveBgPage`, `QrCodePage`

## 5. Music DNA — Yout.com redirect

O código atual usa `https://yout.com/video/${videoId}/` que parece correto. Vou verificar se o problema é popup blocker. Trocar para formato alternativo `https://yout.com/watch?v=${videoId}` e adicionar `rel="noopener"` no window.open. Se ambos falharem, usar `window.location.href` como fallback.

## Arquivos a editar/criar

| Arquivo | Mudança |
|---|---|
| `src/components/CreationModeSelector.tsx` | Adicionar modo Avatar, reordenar grid |
| `src/pages/GeneratePage.tsx` | Default pro, auto-fill prompt, permitir gerar sem prompt com imagem+avatar |
| `src/lib/puterAi.ts` | Adicionar tipo gemini-3-pro, roteamento para edge function |
| `src/pages/ChatPage.tsx` | Adicionar Gemini 3 Pro ao seletor |
| `supabase/functions/chat/index.ts` | Criar edge function para Gemini via Lovable AI Gateway |
| `src/components/TextOverlayEditor.tsx` | Mouse preview, mais fontes, stickers/emojis |
| `src/components/GeneratingAnimation.tsx` | Criar componente de loading animado |
| `src/pages/EditPage.tsx` | Usar loading animado |
| `src/pages/UpscalePage.tsx` | Usar loading animado |
| `src/pages/RemoveBgPage.tsx` | Usar loading animado |
| `src/pages/QrCodePage.tsx` | Usar loading animado |
| `src/pages/MusicDnaPage.tsx` | Fix yout.com redirect |
| `index.html` | Google Fonts link para novas fontes |

