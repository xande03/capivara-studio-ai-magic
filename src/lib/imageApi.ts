
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

export interface ImageResult {
  image?: string;
  text?: string;
  error?: string;
  errorCode?: "CREDITS_EXHAUSTED" | "RATE_LIMITED" | "GENERIC";
}

export async function processImage(params: ProcessImageParams): Promise<ImageResult> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 402) {
        return {
          error: errorData.error || "Créditos insuficientes para processar imagens.",
          errorCode: "CREDITS_EXHAUSTED",
        };
      }
      if (response.status === 429) {
        return {
          error: errorData.error || "Limite de requisições excedido. Aguarde alguns instantes.",
          errorCode: "RATE_LIMITED",
        };
      }
      return {
        error: errorData.error || `Erro HTTP: ${response.status}`,
        errorCode: "GENERIC",
      };
    }

    const data = await response.json();
    return { image: data?.image, text: data?.text };
  } catch (err) {
    console.error("Direct fetch error:", err);
    return { error: "Falha na comunicação com o servidor de imagem", errorCode: "GENERIC" };
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
