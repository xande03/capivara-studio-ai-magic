

# Plano: Ferramenta de Frames de Vídeo

Nova ferramenta para gerar múltiplos frames de vídeo via IA a partir de prompt.

## Funcionalidades

- **Input de prompt**: descrição da cena/vídeo desejado
- **Seletor de proporção**: 16:9, 9:16, 1:1, 4:3
- **Seletor de frames**: quantidade (4, 6, 8, 12)
- **Seletor de estilo** (baseado na imagem):
  - Realista, Cinematográfico, Anime, Pixar 3D, Cyberpunk, Fantasia
  - Câmera Lenta, Timelapse, Film Noir, Vintage, Onírico, Épico
- **Botão "Gerar Vídeo"**: gera os frames sequencialmente
- **Exibição**: grid com os frames gerados + opção de download

## Implementação

| Arquivo | Ação |
|---|---|
| `src/pages/VideoFramesPage.tsx` | Criar — página completa com UI e lógica |
| `src/components/VideoStyleSelector.tsx` | Criar — seletor de estilos visuais |
| `src/App.tsx` | Editar — adicionar rota `/video-frames` |
| `src/components/AppSidebar.tsx` | Editar — adicionar item no menu |

## Fluxo técnico

1. Usuário preenche prompt, escolhe proporção, número de frames e estilo
2. Ao clicar em "Gerar", chama `processImage` com action `generate` para cada frame
3. O prompt inclui instrução do estilo + "frame N of N" para progressão
4. Frames são exibidos em grid conforme gerados

