import { supabase } from "@/integrations/supabase/client";

export type ImageAction = "generate" | "upscale" | "remove-bg" | "edit";
export type ModelType = "nano-banana" | "nano-banana-pro";
export type AspectRatioType = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3";

interface ProcessImageParams {
  action: ImageAction;
  prompt?: string;
  imageBase64?: string;
  imageBase64Second?: string;
  model?: ModelType;
  aspectRatio?: AspectRatioType;
}

export async function processImage(params: ProcessImageParams): Promise<{ image?: string; text?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke("image-process", {
    body: params,
  });

  if (error) {
    console.error("Edge function error:", error);
    return { error: error.message || "Erro ao processar imagem" };
  }

  if (data?.error) {
    return { error: data.error };
  }

  return { image: data?.image, text: data?.text };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
