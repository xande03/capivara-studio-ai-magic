

# Plano: Resumidor de PDF/Texto com IA + Gerador de Assinatura Digital

Duas novas ferramentas independentes, cada uma com sua própria página e rota.

---

## 1. Resumidor de PDF/Texto com IA

### Nova página: `src/pages/SummarizerPage.tsx`
- **Input**: Upload de PDF (extrai texto via `document-process` existente) OU colar texto longo em textarea
- **Modos de saída** (seletor com 3 opções):
  - **Resumo** — texto condensado
  - **Pontos-chave** — lista bullet points
  - **Flashcards** — pares pergunta/resposta para estudo
- Botão "Resumir com IA" → chama edge function
- Resultado renderizado com react-markdown, botão copiar e botão baixar como TXT/PDF

### Nova edge function: `supabase/functions/summarize/index.ts`
- Recebe `{ text, mode }` (mode = "summary" | "keypoints" | "flashcards")
- System prompt específico por modo:
  - summary: "Gere um resumo conciso e fiel ao conteúdo..."
  - keypoints: "Extraia os pontos-chave em bullet points..."
  - flashcards: "Crie flashcards no formato Pergunta: / Resposta:..."
- Usa Lovable AI Gateway com `google/gemini-3-flash-preview`
- Streaming SSE para resposta progressiva

### Config: adicionar ao `supabase/config.toml`
```toml
[functions.summarize]
verify_jwt = false
```

---

## 2. Gerador de Assinatura Digital

### Nova página: `src/pages/SignaturePage.tsx`
- **Canvas** de desenho com mouse/touch (pointer events)
- Controles:
  - **Cor da caneta**: preto, azul, vermelho (seletor)
  - **Espessura**: slider (1-5px)
  - **Limpar**: reset do canvas
- **Preview** em tempo real sobre fundo quadriculado (transparência)
- **Exportar como PNG transparente**: `canvas.toDataURL("image/png")` → download automático
- Implementação: `useRef<HTMLCanvasElement>`, drawing via `onPointerDown/Move/Up`, linhas com `ctx.lineTo()`

---

## 3. Integração no App

### `src/App.tsx`
- Importar e adicionar rotas `/summarizer` e `/signature`

### `src/components/AppSidebar.tsx`
- Adicionar ao array `tools`:
  - `{ title: "Resumidor IA", description: "Resumos e flashcards", url: "/summarizer", icon: BookOpen, color: "bg-amber-500/10 text-amber-600" }`
  - `{ title: "Assinatura", description: "Criar assinatura digital", url: "/signature", icon: PenTool, color: "bg-rose-500/10 text-rose-600" }`

---

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/pages/SummarizerPage.tsx` | Criar |
| `src/pages/SignaturePage.tsx` | Criar |
| `supabase/functions/summarize/index.ts` | Criar |
| `src/App.tsx` | Editar — 2 novas rotas |
| `src/components/AppSidebar.tsx` | Editar — 2 novos itens no sidebar |
| `supabase/config.toml` | Editar — adicionar function summarize |

