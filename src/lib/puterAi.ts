// Puter.js AI wrapper - loads script dynamically and provides chat interface

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
    script.onerror = () => reject(new Error("Failed to load Puter.js"));
    document.head.appendChild(script);
  });

  return puterLoadPromise;
}

export type PuterModel = "claude-3-7-sonnet" | "deepseek/deepseek-v3.2";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function streamPuterChat(
  messages: ChatMessage[],
  model: PuterModel,
  onDelta: (text: string) => void,
  onDone: () => void
) {
  await loadPuter();

  const formattedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const response = await window.puter.ai.chat(formattedMessages, {
      model,
      stream: true,
    });

    for await (const part of response) {
      const text = part?.text || part?.message?.content?.[0]?.text || "";
      if (text) onDelta(text);
    }
    onDone();
  } catch (err) {
    console.error("Puter AI error:", err);
    throw err;
  }
}

export async function sendPuterChat(
  messages: ChatMessage[],
  model: PuterModel
): Promise<string> {
  await loadPuter();

  const formattedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await window.puter.ai.chat(formattedMessages, { model });
  return (
    response?.message?.content?.[0]?.text ||
    response?.message?.content ||
    response?.text ||
    "Sem resposta"
  );
}
