import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  summary: `Você é um especialista em produzir resumos acadêmicos e profissionais detalhados. A partir do texto fornecido:

1. Crie um resumo estruturado em parágrafos contínuos e bem desenvolvidos.
2. Use subtítulos com ## para separar seções lógicas (ex: ## Introdução, ## Conceitos Principais, ## Detalhes Importantes, ## Conclusão).
3. Cada parágrafo deve conter pelo menos 3-4 frases, descrevendo detalhes, aspectos, contexto e informações pertinentes.
4. Mantenha fidelidade total ao conteúdo original — não invente informações.
5. Separe os parágrafos com uma linha em branco para boa legibilidade.
6. Se o texto mencionar dados, números ou citações importantes, inclua-os no resumo.

Responda em português do Brasil. Use formatação markdown.`,

  keypoints: `Você é um especialista em análise e síntese de informações. A partir do texto fornecido:

1. Identifique e agrupe os pontos-chave por categorias temáticas.
2. Use o formato exato abaixo para cada categoria:

### [Nome da Categoria]
- **[Título do ponto]:** descrição resumida em 1-2 frases
- **[Título do ponto]:** descrição resumida em 1-2 frases

3. Crie entre 3 e 8 categorias dependendo da complexidade do texto.
4. Cada categoria deve ter entre 2 e 5 pontos.
5. Os títulos dos pontos devem ser curtos (2-5 palavras) e descritivos.
6. As descrições devem ser objetivas mas informativas.

Responda em português do Brasil. Use formatação markdown.`,

  flashcards: `Você é um especialista em criar material de estudo eficaz. A partir do texto fornecido, crie flashcards para revisão e memorização.

REGRAS OBRIGATÓRIAS:
1. Crie entre 8 e 20 flashcards dependendo da extensão do conteúdo.
2. Use EXATAMENTE este formato para cada card:

### Card 1
**Pergunta:** [pergunta específica e clara]
**Resposta:** [resposta completa e precisa, 1-3 frases]

### Card 2
**Pergunta:** [pergunta específica e clara]
**Resposta:** [resposta completa e precisa, 1-3 frases]

3. As perguntas devem ser específicas (não genéricas) e testáveis.
4. As respostas devem ser completas, coerentes e fiéis ao conteúdo original.
5. Cubra os conceitos mais importantes, definições, relações causais e dados relevantes.
6. Varie os tipos de pergunta: "O que é...", "Qual a diferença entre...", "Por que...", "Como funciona...", "Quais são...".

Responda em português do Brasil.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, mode } = await req.json();

    if (!text || !mode) {
      return new Response(JSON.stringify({ error: "text and mode are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = systemPrompts[mode] || systemPrompts.summary;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("summarize error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
