

# Correção: build error no vite.config.ts

O erro é simples: `componentTagger` é referenciado na linha 19 mas não está importado. Esta função vem do pacote `lovable-tagger` e é usada apenas em desenvolvimento.

## Correção
- `vite.config.ts` linha 19: adicionar import de `componentTagger` de `lovable-tagger`, ou remover a referência se o pacote não estiver instalado.

Vou verificar se o pacote existe no projeto e aplicar a correção adequada.

