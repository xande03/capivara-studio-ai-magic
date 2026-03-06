import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Send, Loader2, Bot, User, Trash2, Copy, Check } from "lucide-react";
import { streamPuterChat, sendPuterChat, type ChatMessage, type PuterModel } from "@/lib/puterAi";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const MODELS: { value: PuterModel; label: string }[] = [
  { value: "claude-3-7-sonnet", label: "Claude 3.7 Sonnet" },
  { value: "deepseek/deepseek-v3.2", label: "DeepSeek v3.2" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-md p-1 shadow-sm"
      title="Copiar"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<PuterModel>("claude-3-7-sonnet");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await streamPuterChat(
        newMessages,
        model,
        updateAssistant,
        () => setLoading(false)
      );
    } catch (streamErr) {
      console.warn("Streaming failed, trying non-streaming fallback:", streamErr);
      try {
        const fallbackResponse = await sendPuterChat(newMessages, model);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: fallbackResponse } : m));
          }
          return [...prev, { role: "assistant", content: fallbackResponse }];
        });
        setLoading(false);
      } catch (fallbackErr) {
        console.error("Both streaming and fallback failed:", fallbackErr);
        setLoading(false);
        toast({ title: "Erro ao gerar resposta", description: "Não foi possível conectar ao modelo. Tente novamente.", variant: "destructive" });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100dvh-6rem)]">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 pb-4">
        <div className="tool-header-card glow-cyan">
          <MessageCircle className="w-7 h-7 text-cyan-600" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Chat IA</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Converse com modelos de IA avançados</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={model} onValueChange={(v) => setModel(v as PuterModel)}>
            <SelectTrigger className="w-36 md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {messages.length > 0 && (
            <Button variant="outline" size="icon" onClick={() => setMessages([])}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center space-y-3 text-muted-foreground">
              <Bot className="w-16 h-16 mx-auto opacity-30" />
              <p className="text-lg font-medium">Comece uma conversa</p>
              <p className="text-sm">Escolha o modelo e digite sua mensagem abaixo</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`group flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="relative max-w-[85%] md:max-w-[80%]">
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass-card"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>pre]:bg-muted [&>pre]:rounded-lg [&>pre]:p-3">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              <CopyButton text={msg.content} />
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-foreground" />
              </div>
            )}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="glass-card rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass-card rounded-2xl p-3 flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          rows={1}
          className="resize-none border-0 bg-transparent focus-visible:ring-0 min-h-[40px] max-h-[120px]"
        />
        <Button
          size="icon"
          className="blue-gradient text-white shrink-0"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
