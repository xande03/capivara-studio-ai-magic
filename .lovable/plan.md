

# Plano: Scanner com correção de perspectiva (estilo iPhone Notes)

Adicionar ao módulo "Escanear" uma nova funcionalidade de **correção de perspectiva** — o usuário faz upload de uma foto torta de um documento, arrasta 4 pontos nos cantos da folha, e o sistema corrige a perspectiva gerando um PDF limpo.

## Novo componente: `src/components/PerspectiveScanner.tsx`

### Interface
- Imagem exibida em um container com 4 **handles arrastáveis** (círculos nos cantos) posicionados sobre a imagem
- Handles conectados por linhas formando um quadrilátero (overlay SVG)
- Auto-detecção inicial: posicionar handles com margem de 10% dos cantos da imagem
- Botões: "Corrigir Perspectiva" → "Baixar PDF"

### Interação de arrastar
- Cada handle é um `div` arrastável via `onPointerDown/Move/Up`
- Ao arrastar, as linhas do quadrilátero atualizam em tempo real
- Coordenadas normalizadas (0-1) para funcionar em qualquer tamanho de tela

### Correção de perspectiva (homografia)
- Implementar transformação projetiva 2D no canvas:
  1. Os 4 pontos de origem (corners do usuário) mapeiam para um retângulo destino (A4 proporção)
  2. Calcular matriz homográfica 3x3 resolvendo sistema linear 8x8
  3. Para cada pixel do destino, aplicar transformação inversa para amostrar o pixel de origem
  4. Usar `canvas.getImageData()` / `putImageData()` — tudo client-side, sem servidor
- Aplicar filtro de contraste/brilho para simular efeito "scan" (branco mais limpo, texto mais nítido)

### Saída
- Preview da imagem corrigida
- Botão "Baixar como PDF" usando jsPDF
- Botão "Escanear Texto (OCR)" que envia a imagem corrigida para o edge function existente `document-process`

## Alteração em `src/pages/ConverterPage.tsx`

Na aba "Escanear", adicionar um **sub-seletor** com dois modos:
1. **OCR Direto** (comportamento atual)
2. **Corrigir & Escanear** (novo — abre o `PerspectiveScanner`)

Usar um toggle ou botões de modo dentro da tab `scan`.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/PerspectiveScanner.tsx` | Criar — componente completo com drag handles + homografia + export |
| `src/pages/ConverterPage.tsx` | Editar — adicionar sub-modo na aba Escanear |

