
## Análise da Funcionalidade "Frames de Vídeo"

Após revisar o código, confirmo que a funcionalidade **já está correta** - ela gera um conjunto de imagens sequenciais (frames) que podem ser usadas para criar vídeos, não um vídeo propriamente dito.

### Estado Atual ✅
- Gera múltiplas imagens em sequência (4, 6, 8, ou 12 frames)
- Cada frame recebe prompt com "frame X of Y showing progression in the sequence"
- Interface permite download individual de cada imagem
- Sidebar já descreve como "Sequências de imagens"

### Melhorias Propostas

**1. Interface Mais Clara**
- Atualizar textos e labels para enfatizar que são "frames/imagens sequenciais"
- Adicionar explicação sobre o uso dos frames para criação de vídeos
- Melhorar o placeholder do prompt com exemplo mais claro

**2. Funcionalidades Adicionais**
- **Download em lote**: Botão para baixar todos os frames de uma vez em ZIP
- **Visualização sequencial**: Preview tipo slideshow dos frames gerados
- **Numeração visual**: Indicadores mais claros da ordem/sequência dos frames

**3. Melhor Geração de Sequência**
- Prompts mais inteligentes para garantir continuidade narrativa
- Opções de tipo de sequência (ação contínua, transições, storyboard)
- Sugestões de prompts específicos para frames sequenciais

**4. UX Aprimorada**
- Grid responsivo melhor para diferentes quantidades de frames
- Loading state mais informativo mostrando qual frame está sendo gerado
- Preview em miniatura durante a geração

### Implementação

1. **Clarificar textos e interface** - melhorar labels, descrições e help text
2. **Adicionar download em lote** - funcionalidade ZIP para todos os frames
3. **Implementar preview sequencial** - visualizador tipo carrossel/slideshow
4. **Melhorar sistema de prompts** - garantir melhor continuidade entre frames
5. **Aprimorar responsividade** - grid que se adapta ao número de frames

### Arquivos a Modificar
- `src/pages/VideoFramesPage.tsx` - interface principal e lógica
- `src/components/VideoStyleSelector.tsx` - possíveis novos estilos
- Criar novo componente `FrameSequenceViewer` para visualização
- Adicionar utilitário para download em lote (ZIP)
