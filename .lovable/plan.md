# Plano: Corrigir texto na imagem, copiar no chat, testar conversor

## 1. TextOverlayEditor — bug de coordenadas

**Problema**: O canvas tem `className="cursor-crosshair w-full"` que aplica CSS `width: 100%`, mas o canvas já tem dimensões definidas via JS (`canvas.width = img.width * s`). O CSS estica o canvas novamente, causando dupla escala — os cliques não correspondem à posição real e o texto fica em lugar errado ou invisível.

**Correção em `src/components/TextOverlayEditor.tsx`**:
- Remover `w-full` do className do canvas
- Adicionar `style={{ maxWidth: '100%' }}` para que o canvas respeite suas dimensões reais mas não ultrapasse o container
- Isso garante que `getBoundingClientRect()` retorna dimensões que correspondem exatamente ao canvas, e os cliques mapeiam corretamente

## 2
... (truncado)