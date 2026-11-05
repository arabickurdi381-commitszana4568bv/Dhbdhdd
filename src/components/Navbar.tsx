import React from 'react';
import { Clapperboard, Sparkles, Volume2, MessageSquare, Film, Radio } from 'lucide-react';

interface NavbarProps {
  activeTab: 'questionnaire' | 'prompt' | 'tts' | 'chat';
  setActiveTab: (tab: 'questionnaire' | 'prompt' | 'tts' | 'chat') => void;
  hasGeneratedPrompt: boolean;
  isPlayingAnyAudio: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasGeneratedPrompt,
  isPlayingAnyAudio,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0d131f]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Meta */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-white tracking-wide">
                  دەرهێنەری کورتەڤیدیۆ
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  30s Kurdish Director
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                پرۆمپتساز بۆ ڤیدیۆی گەنجی ٢٠ ساڵان + خوێندنەوەی دەنگ بە Gemini 3.8 Flash TTS
              </p>
            </div>
          </div>

          {/* Model indicator pills */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-800/40 text-[11px] text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Brain: gemini-3.8-flash</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/60 border border-rose-800/40 text-[11px] text-rose-300">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Voice: gemini-3.8-flash-tts</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('questionnaire')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'questionnaire'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Film className="w-4 h-4" />
              <span className="hidden md:inline">پرسیارەکان</span>
              <span className="md:hidden">پرسیار</span>
            </button>

            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                activeTab === 'prompt'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">پرۆمپت و سیناریۆ</span>
              <span className="md:hidden">سیناریۆ</span>
              {hasGeneratedPrompt && activeTab !== 'prompt' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('tts')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                activeTab === 'tts'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAnyAudio ? 'text-rose-400 animate-bounce' : ''}`} />
              <span className="hidden md:inline">دەنگی کوردی (TTS)</span>
              <span className="md:hidden">دەنگ</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-rose-500/30 text-rose-300 rounded font-bold">
                TTS
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">وتووێژی دەرهێنەر</span>
              <span className="md:hidden">وتووێژ</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
