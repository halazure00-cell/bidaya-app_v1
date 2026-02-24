import React, { useState, useRef, useEffect } from 'react';
import { BidayatState } from '../types';
import { createMuhasabahChat } from '../services/geminiService';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

interface AIMuhasabahProps {
  state: BidayatState;
}

export default function AIMuhasabah({ state }: AIMuhasabahProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Assalamu\'alaikum warahmatullah. Saya adalah Asisten Muhasabah Anda, terinspirasi dari ajaran Imam Al-Ghazali. Bagaimana keadaan hati Anda hari ini? Adakah hal yang ingin Anda renungkan bersama?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    try {
      chatRef.current = createMuhasabahChat();
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMessage.content });
      
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.'
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: 'Maaf, terjadi kesalahan saat menghubungi asisten. Silakan coba lagi nanti.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Muhasabah</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Teman renungan spiritual Anda</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' 
                  : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              
              <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-sm md:text-base">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm md:prose-base dark:prose-invert prose-p:leading-relaxed prose-a:text-indigo-500 max-w-none">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ceritakan keadaan hati Anda hari ini..."
            disabled={isLoading || !chatRef.current}
            className="w-full pl-4 pr-12 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !chatRef.current}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
