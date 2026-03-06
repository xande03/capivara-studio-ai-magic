

# Plano: Corrigir texto na imagem, copiar no chat, testar conversor

## 1. TextOverlayEditor — bug de coordenadas

**Problema**: O canvas tem `className="cursor-crosshair w-full"` que aplica CSS `width: 100%`, mas o canvas já tem dimensões definidas via JS (`canvas.width = img.width * s`). O CSS estica o canvas novamente, causando dupla escala — os cliques não correspondem à posição real e o texto fica em lugar errado ou invisível.

**Correção em `src/components/TextOverlayEditor.tsx`**:
- Remover `w-full` do className do canvas
- Adicionar `style={{ maxWidth: '100%' }}` para que o canvas respeite suas dimensões reais mas não ultrapasse o container
- Isso garante que `getBoundingClientRect()` retorna dimensões que correspondem exatamente ao canvas, e os cliques mapeiam corretamente

## 2. Botão de copiar texto no Chat

**Adicionar em `src/pages/ChatPage.tsx`**:
- Importar `Copy` e `Check` do lucide-react
- Em cada bolha de mensagem (tanto user quanto assistant), adicionar um botão de copiar que aparece no hover
- Usar `navigator.clipboard.writeText()` para copiar
- Feedback visual: trocar ícone para Check por 2 segundos após copiar
- Componente inline com estado local para o feedback

## 3. Testar conversor

Vou testar a edge function `document-process` para verificar se está respondendo. As 3 funções do conversor dependem de:
- **Imagem→PDF**: client-side com jsPDF (deve funcionar)
- **PDF→Word**: edge function `document-process` com action `pdf-to-text`
- **Escanear**: edge function `document-process` com action `ocr`

Vou fazer um curl na edge function para confirmar que está deployada e respondendo.

## Arquivos a editar
1. `src/components/TextOverlayEditor.tsx` — remover `w-full`, corrigir escala
2. `src/pages/ChatPage.tsx` — adicionar botão copiar em cada mensagem

