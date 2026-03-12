// Puter.js AI wrapper + Lovable AI Gateway for Gemini models
// Automatic fallback: Gemini 402 → Claude 3.7 Sonnet via Puter.js

let puterLoaded = false;
let puterLoadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          options?: { model?: string; stream?: boolean }
        ) => Promise<any>;
      };
    };
  }
}

export function loadPuter(): Promise<void> {
  if (puterLoaded) return Promise.resolve();
  if (puterLoadPromise) return puterLoadPromise;

  puterLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.onload = () => {
      puterLoaded = true;
      resolve();
    };
    script.onerror = () => {
      puterLoadPromise = null;
      reject(new Error("Falha ao carregar Puter.js. Verifique sua conexão."));
    };
    document.head.appendChild(script);
  });

  return puterLoadPromise;
}

export type PuterModel = "claude-3-7-sonnet" | "deepseek/deepseek-v3.2" | "gemini-3-pro";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface FallbackInfo {
  from: PuterModel;
  to: PuterModel;
}

const FALLBACK_MODEL: PuterModel = "claude-3-7-sonnet";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

function isCreditError(error: any): boolean {
  const msg = error?.message || String(error);
  return msg.includes("402") || msg.includes("Créditos") || msg.includes("créditos") || msg.includes("insufficient");
}

async function streamGeminiChat(
  messages: ChatMessage[],
  onDelta: (text: string) => void,
  onDone: () => void
) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, model: "google/gemini-3-pro-preview" }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro ${resp.status}`);
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Flush remaining
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

async function streamViaPuter(
  messages: ChatMessage[],
  model: string,
  onDelta: (text: string) => void,
  onDone: () => void
) {
  await loadPuter();
  const formattedMessages = messages.map((m) => ({ role: m.role, content: m.content }));

  const response = await window.puter.ai.chat(formattedMessages, { model, stream: true });
  for await (const part of response) {
    const text = part?.text || part?.message?.content?.[0]?.text || "";
    if (text) onDelta(text);
  }
  onDone();
}

export async function streamPuterChat(
  messages: ChatMessage[],
  model: PuterModel,
  onDelta: (text: string) => void,
  onDone: () => void,
  onFallback?: (info: FallbackInfo) => void
) {
  if (model === "gemini-3-pro") {
    try {
      return await streamGeminiChat(messages, onDelta, onDone);
    } catch (err) {
      if (isCreditError(err)) {
        onFallback?.({ from: "gemini-3-pro", to: FALLBACK_MODEL });
        return await streamViaPuter(messages, FALLBACK_MODEL, onDelta, onDone);
      }
      throw err;
    }
  }

  try {
    return await streamViaPuter(messages, model, onDelta, onDone);
  } catch (err) {
    console.error("Puter AI streaming error:", err);
    throw err;
  }
}

export async function sendPuterChat(
  messages: ChatMessage[],
  model: PuterModel,
  onFallback?: (info: FallbackInfo) => void
): Promise<string> {
  if (model === "gemini-3-pro") {
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages, model: "google/gemini-3-pro-preview" }),
      });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${resp.status}`);
      }
      const text = await resp.text();
      let full = "";
      for (const line of text.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) full += content;
        } catch { /* ignore */ }
      }
      return full || "Sem resposta";
    } catch (err) {
      if (isCreditError(err)) {
        onFallback?.({ from: "gemini-3-pro", to: FALLBACK_MODEL });
        // Fall through to Puter with Claude
      } else {
        throw err;
      }
    }
  }

  await loadPuter();
  const actualModel = model === "gemini-3-pro" ? FALLBACK_MODEL : model;
  const formattedMessages = messages.map((m) => ({ role: m.role, content: m.content }));

  try {
    const response = await window.puter.ai.chat(formattedMessages, { model: actualModel });
    return (
      response?.message?.content?.[0]?.text ||
      response?.message?.content ||
      response?.text ||
      "Sem resposta"
    );
  } catch (err) {
    console.error("Puter AI non-streaming error:", err);
    throw err;
  }
}
