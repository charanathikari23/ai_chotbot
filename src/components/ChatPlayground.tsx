import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, RefreshCw, Trash2, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import { ChatMessage } from "../types";

// Clean, simple system instruction
const SYSTEM_INSTRUCTION = "You are a helpful, polite, and precise AI Assistant. Answer questions clearly and neatly.";
const TEMPERATURE = 0.7;

export default function ChatPlayground() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const savedMessages = localStorage.getItem("clean_chat_v3");
      if (savedMessages) {
        return JSON.parse(savedMessages);
      }
    } catch (e) {
      console.error("Local storage error loading clean messages", e);
    }
    return [];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages with local storage
  useEffect(() => {
    try {
      localStorage.setItem("clean_chat_v3", JSON.stringify(messages));
    } catch (e) {
      console.error("Local storage sync error", e);
    }
  }, [messages]);

  // Handle auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isGenerating) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputMessage("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/prompt/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages,
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: TEMPERATURE,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed secure handshake with server.");
      }

      const resData = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: "model",
        content: resData.text || "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Uplink failed. Please ensure the server is responsive.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Do you want to clear this entire conversation?")) {
      setMessages([]);
      setError(null);
      localStorage.removeItem("clean_chat_v3");
    }
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col bg-black/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.04)] h-[calc(100vh-170px)] min-h-[550px] relative backdrop-blur-md" id="chat-container">
      
      {/* Top clean header */}
      <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-800/50 flex justify-between items-center relative z-10" id="chat-header">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          <span className="font-semibold text-sm tracking-wide text-zinc-200">AI Assistant</span>
        </div>

        <div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer text-xs flex items-center gap-1.5"
              id="clear-chat-btn"
            >
              <Trash2 size={12} className="text-zinc-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Message window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-transparent to-indigo-950/5 scrollbar-thin" id="messages-feed">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto"
              id="empty-chat-state"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.15)] glow-indigo">
                <Sparkles size={20} />
              </div>
              <h2 className="text-base font-semibold text-zinc-200 mb-1 tracking-wide">Ready for Questions</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Type a message below to start chatting. Your history stays securely in your browser cache.
              </p>
              
              <div className="mt-5 flex flex-col gap-1.5 w-full">
                {["Explain cyber security in one sentence", "What are CSS filters?"].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(suggestion)}
                    className="text-[11px] font-sans text-zinc-400 bg-zinc-900/60 hover:bg-zinc-850/80 border border-zinc-800/80 hover:border-indigo-500/30 transition-all px-3 py-2 rounded-lg text-left cursor-pointer"
                  >
                    ⚡ {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  id={`msg-${m.id}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 shadow-lg relative group ${
                      isUser
                        ? "bg-zinc-900 border border-zinc-800/60 text-zinc-100 rounded-br-none"
                        : "bg-indigo-950/30 border border-indigo-500/20 text-indigo-50 rounded-bl-none backdrop-blur-sm shadow-[0_0_20px_rgba(99,102,241,0.02)]"
                    }`}
                  >
                    {/* Copy handler */}
                    {!isUser && (
                      <button
                        onClick={() => handleCopyToClipboard(m.content, m.id)}
                        className="absolute -top-2.5 -right-2.5 opacity-0 group-hover:opacity-100 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-cyan-400 shadow-xl transition-all duration-150 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === m.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      </button>
                    )}

                    <div className="text-xs md:text-[13px] leading-relaxed whitespace-pre-wrap select-text font-sans">
                      {m.content}
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-zinc-800/30 text-[9px] text-zinc-550 text-zinc-500">
                      <span>{isUser ? "You" : "AI"}</span>
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
              id="loader-bubble"
            >
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl rounded-bl-none px-4 py-3 shadow-md flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin text-indigo-400" />
                <span className="text-xs font-medium text-zinc-400">
                  Thinking...
                </span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-950/20 border border-red-500/20 text-red-100 rounded-xl p-4 flex gap-3 text-xs max-w-md mx-auto"
              id="error-bubble"
            >
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-400">Connection Error</p>
                <p className="mt-0.5 text-red-300/80">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Simple Cyber Composer */}
      <form onSubmit={handleSendMessage} className="p-4 bg-zinc-950/80 border-t border-zinc-800/50 flex gap-2 relative z-10" id="chat-composer">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question..."
          disabled={isGenerating}
          className="flex-1 px-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-black text-zinc-150 text-zinc-100 transition-all font-sans placeholder-zinc-500"
          id="chat-input-text"
          autoFocus
        />
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={!inputMessage.trim() || isGenerating}
          className="px-5 bg-indigo-600 hover:bg-indigo-500 outline-none text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:hover:bg-indigo-600 shadow-md shrink-0 cursor-pointer hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-white/5"
          id="chat-submit-btn"
        >
          <span>Send</span>
          <Send size={12} />
        </motion.button>
      </form>
    </div>
  );
}
