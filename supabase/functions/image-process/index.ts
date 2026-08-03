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
    // 1. (Optional) Check LOVABLE_API_KEY
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, prompt, imageBase64, imageBase64Second, model, aspectRatio } = await req.json();
    console.log(`Processing action: ${action}, model: ${model}`);

    // --- Input validation ---
    const allowedActions = ["generate", "upscale", "remove-bg", "edit"];
    if (typeof action !== "string" || !allowedActions.includes(action)) {
      return new Response(JSON.stringify({ error: "Ação inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (prompt !== undefined && prompt !== null) {
      if (typeof prompt !== "string" || prompt.length > 4000) {
        return new Response(
          JSON.stringify({ error: "Prompt inválido (máximo 4000 caracteres)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    if (action === "generate" && (!prompt || !prompt.trim())) {
      return new Response(JSON.stringify({ error: "Prompt obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    for (const img of [imageBase64, imageBase64Second]) {
      if (img === undefined || img === null) continue;
      if (typeof img !== "string" || !/^data:image\/(png|jpe?g|webp|gif);base64,/.test(img)) {
        return new Response(JSON.stringify({ error: "Imagem inválida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    if (action !== "generate" && !imageBase64) {
      return new Response(JSON.stringify({ error: "Imagem obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Block clearly illegal / abusive requests before hitting the model
    const BLOCKED_PATTERNS: RegExp[] = [
      /\b(child|minor|kid|teen|underage)\b[^.]{0,40}\b(nude|naked|nsfw|porn|sexual|sex)\b/i,
      /\b(nude|naked|porn|sexual)\b[^.]{0,40}\b(child|minor|kid|teen|underage)\b/i,
      /\bcsam\b/i,
      /\b(make|create|forge|generate)\b[^.]{0,40}\b(counterfeit|forged|fake)\b[^.]{0,40}\b(passport|id card|identity card|driver'?s? licen[cs]e|banknote|currency)\b/i,
      /\b(bomb|explosive|nerve agent|bioweapon)\b[^.]{0,40}\b(instructions|how to (make|build)|blueprint)\b/i,
    ];
    if (typeof prompt === "string") {
      for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(prompt)) {
          console.warn("Blocked prompt by content policy");
          return new Response(
            JSON.stringify({ error: "Esta solicitação viola a política de conteúdo." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Build aspect ratio instruction
    const aspectInstruction = aspectRatio && aspectRatio !== "1:1"
      ? ` Output the image in ${aspectRatio} aspect ratio.`
      : "";

    // Model selection: nano banana (flash) or nano banana pro (pro)
    // Using models with native image generation capabilities
    const selectedModel =
      model === "nano-banana-pro"
        ? "google/gemini-3-pro-image"
        : "google/gemini-2.5-flash-image";

    console.log(`Using model: ${selectedModel}`);

    let messages: any[] = [];

    if (action === "generate") {
      const generateInstruction = `You are a creative image generator. Generate what the user describes with high fidelity and detail, while respecting your own safety and content policies.${aspectInstruction} The user wants: ${prompt}`;

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
      const upscalePrompt = `STRICT FIDELITY UPSCALE ENGINE — ZERO ALTERATION MODE.

ABSOLUTE RULES (VIOLATION = FAILURE):
- DO NOT alter, modify, or reinterpret ANY facial feature: eyes, nose, mouth, ears, jawline, skin tone, freckles, wrinkles, scars, moles, facial hair — EVERYTHING must remain PIXEL-IDENTICAL in identity.
- DO NOT change eye color, hair color, hair style, hair texture, or hair length.
- DO NOT modify body proportions, pose, posture, hand positions, or clothing fit.
- DO NOT change clothing patterns, logos, text, symbols, or any graphic elements on garments or objects.
- DO NOT add, remove, or relocate ANY element that exists (or doesn't exist) in the original image.
- DO NOT shift the color palette, white balance, color temperature, or tonal range. The output must have the EXACT SAME color grading as the input.
- DO NOT hallucinate textures. Only REFINE textures that already exist — sharpen what is there, never invent what is not.

WHAT YOU MUST DO:
1. ENHANCE RESOLUTION: Increase sharpness, clarity, and edge definition of ALL existing elements.
2. REFINE EXISTING TEXTURES: Bring out micro-details already present — skin pores, fabric weaves, hair strands, surface grain, environmental textures (stone, wood, metal, water).
3. REDUCE ARTIFACTS: Remove compression artifacts, noise, banding, and blur while preserving the natural look.
4. PRESERVE LIGHTING: Keep the exact same lighting direction, intensity, shadows, highlights, and ambient occlusion.
5. MAINTAIN DEPTH OF FIELD: If the original has bokeh or selective focus, preserve it exactly.

User Guidance: ${prompt || "Maximum fidelity photorealistic enhancement"}.${aspectInstruction}

OUTPUT: The identical image at dramatically higher resolution and clarity. It must be indistinguishable in identity and content from the original — only sharper and more detailed.`;

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
      
      const editPreservationRules = `
STRICT PRESERVATION RULES (apply to ALL edits):
- Under NO circumstances change ANY face, facial expression, skin tone, eye color, hair style, body proportion, or identifying characteristic that the user did NOT explicitly ask to modify.
- ALL untouched areas must remain PIXEL-PERFECT — no color drift, no texture smoothing, no subtle alterations.
- Preserve the EXACT lighting direction, color temperature, white balance, and shadow/highlight balance of the original image.
- Preserve the EXACT perspective, lens distortion, and depth of field of the original image.
- When ADDING elements: match the existing lighting, perspective, color grading, and resolution seamlessly. Added elements must look native to the scene.
- When REMOVING elements: fill the area with contextually appropriate background that matches surrounding textures, colors, and patterns perfectly.
- DO NOT "enhance", "improve", or "clean up" any part of the image that was not mentioned in the user's request.`;

      const editInstruction = hasSecondImage
        ? `You are a surgical-precision image editor. You have TWO images. Use the second image ONLY as reference material. Apply the user's instructions to modify the first image. Change ONLY what the user explicitly requests — nothing more.${editPreservationRules}${aspectInstruction}

The user wants: ${prompt}`
        : `You are a surgical-precision image editor. Edit this image with ABSOLUTE MINIMAL intervention. Change ONLY what the user explicitly requests — nothing else.${editPreservationRules}${aspectInstruction}

The user wants: ${prompt}`;

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
    console.log("AI response structure:", JSON.stringify(data).slice(0, 500));
    
    // The gateway may return images in different formats depending on model
    const message = data.choices?.[0]?.message;
    let resultImage = null;
    let resultText = null;

    // Format 1: images array (some models)
    if (message?.images?.[0]?.image_url?.url) {
      resultImage = message.images[0].image_url.url;
    }
    // Format 2: content array with image_url parts (multimodal response)
    if (!resultImage && Array.isArray(message?.content)) {
      for (const part of message.content) {
        if (part.type === "image_url" && part.image_url?.url) {
          resultImage = part.image_url.url;
        } else if (part.type === "text") {
          resultText = part.text;
        }
      }
    }
    // Format 3: inline_data in content parts
    if (!resultImage && Array.isArray(message?.content)) {
      for (const part of message.content) {
        if (part.inline_data?.data) {
          resultImage = `data:${part.inline_data.mime_type || "image/png"};base64,${part.inline_data.data}`;
        }
      }
    }
    // Format 4: plain string content (text only)
    if (!resultImage && typeof message?.content === "string") {
      resultText = message.content;
    }

    console.log("Parsed result - hasImage:", !!resultImage, "hasText:", !!resultText);

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
