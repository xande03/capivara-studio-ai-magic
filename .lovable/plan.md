

# Plano: Melhorar prompts e apresentação do Resumidor IA

O problema é que os system prompts da edge function são genéricos demais, resultando em saídas mal formatadas. A solução é refinar os prompts e melhorar a renderização no frontend para cada modo.

## 1. Edge Function `supabase/functions/summarize/index.ts` — Refinar prompts

Atualizar os 3 system prompts:

- **summary**: Instruir a IA a gerar resumo em parágrafos contínuos com subtítulos (##), separando seções lógicas, descrevendo detalhes, aspectos e informações pertinentes. Manter formatação markdown com quebras de parágrafo claras.

- **keypoints**: Instruir a IA a organizar por categorias com títulos (### Categoria), cada ponto como bullet resumido (- **Título do ponto:** descrição breve). Agrupar tópicos relacionados.

- **flashcards**: Instruir a IA a gerar cards numerados no formato estruturado:
  ```
  ### Card 1
  **Pergunta:** ...
  **Resposta:** ...
  ```
  Garantir que perguntas sejam específicas e respostas completas e coerentes ao conteúdo.

## 2. Frontend `src/pages/SummarizerPage.tsx` — Melhorar renderização de flashcards

- Para o modo `flashcards`, renderizar o resultado dividindo por `### Card` e apresentando cada card em um componente visual estilizado (card com frente/verso ou pergunta destacada + resposta abaixo) em vez de markdown puro.
- Para `summary` e `keypoints`, manter ReactMarkdown (já funciona bem com prompts melhores).

## Arquivos

| Arquivo | Ação |
|---|---|
| `supabase/functions/summarize/index.ts` | Editar — refinar os 3 system prompts |
| `src/pages/SummarizerPage.tsx` | Editar — renderização especial para flashcards |

