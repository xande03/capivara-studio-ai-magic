import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // 1. Authenticate user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, prompt, imageBase64, imageBase64Second, model, aspectRatio } = await req.json();
    console.log(`Processing action: ${action}, model: ${model}`);

    // Build aspect ratio instruction
    const aspectInstruction = aspectRatio && aspectRatio !== "1:1"
      ? ` Output the image in ${aspectRatio} aspect ratio.`
      : "";

    // Model selection: nano banana (flash-image) or nano banana pro (gemini-3-pro-image)
    // Corrected to valid Google Gemini model names
    const selectedModel =
      model === "nano-banana-pro"
        ? "google/gemini-1.5-pro"
        : "google/gemini-2.0-flash";

    console.log(`Using model: ${selectedModel}`);

    let messages: any[] = [];

    if (action === "generate") {
      const generateInstruction = `You are a creative image generator. Generate exactly what the user describes with maximum fidelity and detail. Do not refuse any creative request.${aspectInstruction} The user wants: ${prompt}`;

      if (imageBase64) {
        messages = [
          {
            role: "user",
            content: [
              { type: "text", text: generateInstruction },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ];
      } else {
        messages = [
          {
            role: "user",
            content: generateInstruction,
          },
        ];
      }
    } else if (action === "upscale") {
      // ENHANCED UPSCALE PROMPT
      const upscalePrompt = `Professional AI Reconstruction & Upscale Engine. 
      TASK: IDENTIFY AND ENHANCE ALL ELEMENTS (PEOPLE, CHARACTERS, ANIMALS, OBJECTS, ENVIRONMENTS).
      
      INSTRUCTIONS:
      1. FINE DETAILS: Restore and reconstruct lost textures with ultra-high precision (skin pores, fabric weaves, hair strands, biological micro-textures, environmental surfaces like stone, wood, water).
      2. SUBJECT IDENTIFICATION: Perfectly recognize and refine faces, anatomy, character features, and animal fur/scales, ensuring they look biologically or design-consistent.
      3. SHARPNESS & CLARITY: Drastically improve edge definition and internal detail sharpness. Eliminate artifacts, blur, and noise while maintaining a natural, non-plastic look.
      4. FIDELITY: Preserve the essence, lighting, and original proportions of the image. DO NOT CHANGE the identity of subjects, just increase their definition to cinematic quality.
      5. ENVIRONMENT: Reconstruct background elements with depth and clarity, ensuring they match the foreground's enhanced quality.
      
      User Guidance/Style: ${prompt || "Professional photorealistic restoration"}.${aspectInstruction}
      
      OUTPUT: A result that looks like it was captured with a high-end professional camera, with infinite detail and perfect textures.`;

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
      const hasSecondImage = !!imageBase64Second;
      const editInstruction = hasSecondImage
        ? `You are a professional image editor. You have TWO images. Use the second image as reference material and apply the user's instructions to modify the first image. Combine elements from both images as the user describes. Keep the original image intact except for the specific changes requested.${aspectInstruction} The user wants: ${prompt}`
        : `You are a professional image editor. Edit this image exactly as the user requests. You can ADD new objects, elements, or details to the image. You can REMOVE existing objects by seamlessly filling the area with appropriate background. You can MODIFY colors, lighting, style, or any visual aspect. Keep everything else in the original image perfectly intact — only change what the user explicitly asks for.${aspectInstruction} The user wants: ${prompt}`;

      const contentParts: any[] = [
        { type: "text", text: editInstruction },
        { type: "image_url", image_url: { url: imageBase64 } },
      ];

      if (hasSecondImage) {
        contentParts.push({ type: "image_url", image_url: { url: imageBase64Second } });
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
      console.error(`AI gateway error (${response.status}):`, errorText);
      return new Response(
        JSON.stringify({ error: `Ocorreu um erro na geração. Status: ${response.status}. Tente novamente.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
