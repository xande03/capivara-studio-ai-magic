

# Plano: Adicionar modo LEGO ao gerador de imagem

Adicionar o modo "LEGO" ao `CreationModeSelector.tsx`:

1. Adicionar `"lego"` ao type `CreationMode`
2. Importar ícone `Box` do lucide-react (representa bloco LEGO)
3. Adicionar entrada no array `CREATION_MODES`:
   - `id: "lego"`
   - `label: "LEGO"`
   - `description: "Estilo blocos LEGO"`
   - `instruction: "LEGO brick style, everything made of LEGO bricks and minifigures, plastic toy aesthetic, blocky shapes, bright primary colors, LEGO set box art quality, 3D rendered look."`

**Arquivo**: `src/components/CreationModeSelector.tsx`

