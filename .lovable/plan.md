

## Plano: Fallback automático Gemini → Claude via Puter.js

### Problema
Quando o usuário seleciona Gemini 3 Pro e o gateway retorna 402, o erro é capturado mas o fallback depende de retry manual no `ChatPage`. O fallback deveria ser **transparente e automático**, dentro da própria camada `puterAi.ts`.

### Solução

Mover a lógica de fallback para **`src/lib/puterAi.ts`** — tanto `streamPuterChat` quanto `sendPuterChat`. Quando Gemini falhar com 402/créditos, automaticamente re-executar com Claude 3.7 Sonnet via Puter.js, emitindo um callback opcional para notificar a UI.

### Mudanças

**1. `src/lib/puterAi.ts`**
- Adicionar parâmetro opcional `onFallback?: (fromModel, toModel) => void` em `streamPuterChat` e `sendPuterChat`
- Em `streamGeminiChat`, detectar erro 402 e lançar erro tipado (ex: `CreditExhaustedError`)
- Em `streamPuterChat`: se modelo é `gemini-3-pro` e erro é 402, chamar `onFallback`, depois re-executar com `claude-3-7-sonnet` via Puter.js automaticamente
- Mesmo tratamento em `sendPuterChat`

**2. `src/pages/ChatPage.tsx`**
- Simplificar o `handleSend` — remover a lógica manual de retry com Claude (linhas 72-80)
- Passar callback `onFallback` que mostra toast e atualiza o modelo selecionado + `geminiUnavailable`
- O fallback agora é transparente na camada de API

### Resultado
O usuário pode selecionar Gemini livremente. Se falhar com 402, a resposta chega automaticamente via Claude sem nenhuma intervenção.

