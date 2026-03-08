

# Plano: Potencializar prompts de Upscale e Edição para preservação de fidelidade

O objetivo é reforçar as instruções enviadas ao modelo de IA no edge function `image-process` para que o upscale e a edição preservem rigorosamente texturas, rostos, identidade e elementos originais.

## Mudanças no `supabase/functions/image-process/index.ts`

### 1. Upscale (linhas 65-77) — Reforçar preservação
Reescrever o prompt de upscale com ênfase em:
- **Zero alteração de identidade**: rostos, expressões, poses, proporções corporais devem permanecer idênticos
- **Preservação de texturas originais**: não inventar texturas inexistentes, apenas refinar as existentes
- **Fidelidade cromática**: manter paleta de cores, iluminação e tom exatos
- **Anti-hallucination**: instruir explicitamente para NÃO adicionar, remover ou modificar elementos que não estão no original
- **Instrução negativa**: "DO NOT alter facial features, skin tone, eye color, hair style, clothing patterns, or any identifying characteristics"

### 2. Edit (linhas 107-122) — Reforçar cirurgia precisa
Reescrever o prompt de edição com ênfase em:
- **Mudança cirúrgica**: alterar SOMENTE o que foi explicitamente pedido
- **Preservação total do resto**: rostos, texturas, cores, iluminação, perspectiva de tudo que não foi mencionado deve permanecer pixel-perfect
- **Consistência de iluminação**: elementos adicionados devem respeitar a iluminação existente
- **Anti-drift**: "Under NO circumstances should you change any face, body proportion, skin tone, background detail, or texture that the user did not explicitly ask to modify"

**Arquivo único a editar**: `supabase/functions/image-process/index.ts`

