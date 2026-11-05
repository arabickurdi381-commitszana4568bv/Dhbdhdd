import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Sparkles, User, Clapperboard, Lightbulb } from 'lucide-react';

interface DirectorChatProps {
  currentAnswers: Record<string, string>;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'model',
    content: `سڵاو و ڕێز! من ئەندازیاری ڤیدیۆ و دەرهێنەری کورتەفیلمە سینەماییەکانم.
بیرۆکەکەت سەبارەت بەم گەنجە کوردییە ٢٠ ساڵانەی کە دووچاری سەرئێشەیەکی سەخت بووە و نازانێت چی بکات، پۆتێنسیالێکی سۆزداری و بینراوی زۆر بەهێزی هەیە.

ئەگەر هەر پرسیارێکت هەیە لەسەر:
١. باشترکردنی گۆشەی کامێرا و جووڵە (Camera Movement & Angles)
٢. دیالۆگ و مەنەلۆگی کوردی و هەستی ئازار
٣. جۆری ڕووناکی (Lighting) و دیزاینی دەنگ (Sound Design)
٤. گونجاندنی پرۆمپتەکە بۆ Sora یان Google Veo یان Runway

ڕاستەوخۆ لێرە پرسیار بکە و پێکەوە ڤیدیۆیەکی ٣٠ چرکەیی بێوێنە دەخوڵقێنین!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTED_QUESTIONS = [
  'چۆن وا بکەم بینەر هەست بە سەرگێژخواردنی گەنجەکە بکات؟',
  'چ ڕووناکییەک بۆ ژوورە تاریکەکە گونجاوە؟',
  'دیالۆگێکی کوردیی زۆر کورت و کاریگەرم بۆ دابنێ بۆ چرکەی ١٥.',
  'کام مۆدێلی ڤیدیۆ (Sora یان Veo) باشترین جووڵەی ڕووخسار دەدات؟',
];

export const DirectorChat: React.FC<DirectorChatProps> = ({ currentAnswers }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/director/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentAnswers,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'هەڵەیەک ڕوویدا');

      const modelMessage: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: data.text || 'ببورە، وەڵامێک نەگەڕایەوە.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: `ببورە، هەڵەیەک ڕوویدا لە وەڵامدانەوە: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col h-[750px] overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <span>ڕاوێژکاری دەرهێنەری کورتەڤیدیۆ</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </h2>
            <p className="text-xs text-slate-400">
              ئەندازیاری سینەمایی بە مۆدێلی Gemini 3.8 Flash بە زمانی کوردی
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Director: Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Clapperboard className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.content}
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    isUser ? 'text-slate-900/70 text-left' : 'text-slate-500 text-left'
                  }`}
                  dir="ltr"
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center flex-shrink-0">
              <Clapperboard className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>دەرهێنەر وەڵامەکەت دەنوسێت...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 flex-shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>پرسیارە خێراکان:</span>
        </span>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 whitespace-nowrap transition-all flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="پرسیارێک لە دەرهێنەر بکە لەسەر دیمەنەکان، ڕووناکی یان دیالۆگ بە کوردی..."
          className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <span>ناردن</span>
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};
