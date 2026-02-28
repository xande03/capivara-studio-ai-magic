

# Plano: Corrigir ferramentas de imagem, build error, e integrar QR na galeria

## Problema raiz das ferramentas de imagem

A edge function `image-process` usa modelos **inexistentes** (`google/gemini-1.5-pro` e `google/gemini-1.5-flash`). Os modelos corretos com capacidade de gerar/editar imagens são:
- `google/gemini-2.5-flash` (nano-banana) — com `modalities: ["image", "text"]`
- `google/gemini-3-pro-image-preview` (nano-banana-pro) — modelo avançado de imagem

## Etapas

### 1. Corrigir build error em `music-dna/index.ts`
- Linha 95: `err.message` → `(err as Error).message`

### 2. Corrigir modelos em `image-process/index.ts`
- Trocar `google/gemini-1.5-pro` → `google/gemini-3-pro-image-preview`
- Trocar `google/gemini-1.5-flash` → `google/gemini-2.5-flash`
- Ambos já suportam `modalities: ["image", "text"]`

### 3. Integrar QR Codes na galeria
- Atualizar `src/lib/sessionHistory.ts` para suportar itens do tipo "qr-code"
- Em `QrCodePage.tsx`, após gerar QR com sucesso, salvar no histórico de sessão com `tool: "qr-code"` e a imagem do QR (converter SVG para data URL)
- Em `GalleryPage.tsx`:
  - Adicionar filtro "QR Code" com `tool: "qr-code"`
  - Adicionar label "QR Code" no `toolLabels`
  - Adicionar botão de excluir em cada item da galeria (remove do sessionStorage)

### 4. Adicionar exclusão na galeria
- Adicionar função `removeFromHistory(id)` em `sessionHistory.ts`
- Adicionar botão de lixeira em cada card da galeria
- Ao excluir, atualizar o estado local

## Detalhes Técnicos

**Modelos de imagem (correção crítica):**
```text
nano-banana      → google/gemini-2.5-flash (rápido, bom custo-benefício)
nano-banana-pro  → google/gemini-3-pro-image-preview (máxima qualidade)
```

**QR na galeria:** O QR SVG será convertido para PNG data URL via canvas antes de salvar no histórico, garantindo que apareça como thumbnail na galeria.

