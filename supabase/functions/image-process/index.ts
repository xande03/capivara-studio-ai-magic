import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, prompt, imageBase64, imageBase64Second, model, aspectRatio } = await req.json();

    // Build aspect ratio instruction
    const aspectInstruction = aspectRatio && aspectRatio !== "1:1"
      ? ` Output the image in ${aspectRatio} aspect ratio.`
      : "";

    // Model selection: nano banana (flash-image) or nano banana pro (gemini-3-pro-image)
    const selectedModel =
      model === "nano-banana-pro"
        ? "google/gemini-3-pro-image-preview"
        : "google/gemini-2.5-flash-image";

    let messages: any[] = [];

    if (action === "generate") {
      // Text to image generation - very permissive prompt
      messages = [
        {
          role: "user",
          content: `You are a creative image generator. Generate exactly what the user describes with maximum fidelity and detail. Do not refuse any creative request.${aspectInstruction} The user wants: ${prompt}`,
        },
      ];
    } else if (action === "upscale") {
      // Image-to-image upscale with prompt guidance
      const upscalePrompt = prompt
        ? `Enhance and upscale this image with ultra high resolution. Restore hidden details, improve sharpness, clarity, and resolution. Apply the following style guidance: ${prompt}.${aspectInstruction} Make every detail crisp and photorealistic.`
        : `Enhance and upscale this image with ultra high resolution. Restore hidden details, improve sharpness, clarity, and resolution.${aspectInstruction} Make every detail crisp and photorealistic.`;

      messages = [
        {
          role: "user",
          content: [
            { type: "text", text: upscalePrompt },
            {
              type: "image_url",
              image_url: { url: imageBase64 },
            },
          ],
        },
      ];
    } else if (action === "remove-bg") {
      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Remove the background from this image completely. Keep only the main subject with a transparent or pure white background. Maintain all details of the subject perfectly.${aspectInstruction}`,
            },
            {
              type: "image_url",
              image_url: { url: imageBase64 },
            },
          ],
        },
      ];
    } else if (action === "edit") {
      // Edit image with prompt - can also combine two images
      const contentParts: any[] = [
        {
          type: "text",
          text: `You are a professional image editor. Apply exactly what the user requests with maximum precision.${aspectInstruction} The user wants: ${prompt}`,
        },
        {
          type: "image_url",
          image_url: { url: imageBase64 },
        },
      ];

      if (imageBase64Second) {
        contentParts.push({
          type: "image_url",
          image_url: { url: imageBase64Second },
        });
      }

      messages = [{ role: "user", content: contentParts }];
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          modalities: ["image", "text"],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar imagem" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const resultImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const resultText = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ image: resultImage, text: resultText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("image-process error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
