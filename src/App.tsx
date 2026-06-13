import { useEffect, useState } from "react";
import { Sparkles, Terminal } from "lucide-react";
import ChatPlayground from "./components/ChatPlayground";

export default function App() {
  return (
    <div className="min-h-screen bg-[#030305] text-zinc-100 flex flex-col font-sans relative cyber-grid scanlines" id="app-root-container">
      {/* Subtle scan line effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-indigo-500/30 opacity-15 pointer-events-none scan-bar" />

      {/* Elegant ambient background glows */}
      <div className="absolute top-[-10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-cyan-950/10 blur-[100px] pointer-events-none" />

      {/* Clean minimal header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-zinc-800/50 px-6 py-4 sticky top-0 z-30" id="app-header">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-mono font-bold text-base shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              AI
            </div>
            <div>
              <h1 className="font-display font-medium text-base text-zinc-100 tracking-tight glow-indigo">AI Chat</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Online</span>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center relative z-10" id="app-main-grid">
        <ChatPlayground />
      </main>

      {/* elegant minimalist footer */}
      <footer className="bg-black/40 border-t border-zinc-900/60 py-4 px-6 text-center text-[10px] text-zinc-550 shrink-0 font-mono text-zinc-600" id="app-footer">
        <div className="max-w-3xl mx-auto flex justify-between items-center text-[10px]">
          <span>Gemini Platform</span>
          <span>Secure Session</span>
        </div>
      </footer>
    </div>
  );
}

