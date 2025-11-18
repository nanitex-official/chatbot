import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle bot response - support both { reply: "..." } and { message: "..." } formats
      const botReply = data.reply || data.message || "No response from bot";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to send message";
      setError(errorMsg);
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-nanitex-light to-nanitex-secondary">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-nanitex-primary to-nanitex-dark bg-clip-text text-transparent">
            AI Assistant
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Powered by n8n • Always here to help
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {messages.length === 0 && !error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-nanitex-secondary to-nanitex-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-nanitex-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  Start a conversation
                </h2>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Ask me anything and I'll do my best to help. Your messages are
                  processed securely.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-800 text-sm mt-1">{error}</p>
                {error.includes("N8N_WEBHOOK_URL") && (
                  <p className="text-red-700 text-sm mt-2">
                    ✓ Add N8N_WEBHOOK_URL to your .env.local file to get started
                  </p>
                )}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nanitex-primary to-nanitex-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              )}

              <div
                className={cn(
                  "max-w-md px-4 py-3 rounded-lg text-sm leading-relaxed",
                  message.sender === "user"
                    ? "bg-nanitex-primary text-white rounded-br-none shadow-md"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                )}
              >
                <p className="break-words">{message.text}</p>
              </div>

              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">You</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nanitex-primary to-nanitex-dark flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="bg-white text-slate-800 border border-slate-200 rounded-lg rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-4 shadow-lg">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            className={cn(
              "flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none",
              "bg-white text-slate-900 placeholder-slate-400",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "bg-gradient-to-r from-nanitex-primary to-nanitex-dark hover:from-nanitex-dark hover:to-nanitex-primary text-white px-6 py-3 rounded-lg font-medium transition-all",
              "flex items-center gap-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </Button>
        </form>
        
        {/* Footer */}
        <div className="max-w-4xl mx-auto mt-3 text-center">
          <p className="text-xs text-slate-500">
            Developed by{" "}
            <a
              href="https://nanitex.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-nanitex-primary hover:text-nanitex-dark transition-colors"
            >
              NaniteX
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
