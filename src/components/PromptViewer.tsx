import React, { useState } from 'react';
import { DirectorPromptResult } from '../types';
import {
  Copy,
  Check,
  Film,
  Camera,
  Clock,
  Sparkles,
  Volume2,
  Sliders,
  Share2,
  ExternalLink,
  Layers,
  ChevronDown,
  PlayCircle,
  Eye,
} from 'lucide-react';

interface PromptViewerProps {
  promptResult: DirectorPromptResult;
  onPlayTTSLine: (text: string, style?: string, voice?: string) => void;
  onOpenTTSStudio: () => void;
}

export const PromptViewer: React.FC<PromptViewerProps> = ({
  promptResult,
  onPlayTTSLine,
  onOpenTTSStudio,
}) => {
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'sora' | 'veo' | 'runway'>('all');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    if (id === 'master') {
      setCopiedMaster(true);
      setTimeout(() => setCopiedMaster(false), 2000);
    } else {
      setCopiedSection(id);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Title & Logline Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              <span>کورتەڤیدیۆی ٣٠ چرکە (30-Second Cinematic Script)</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
              کارەکتەر: گەنجی کوردی ٢٠ ساڵان
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(promptResult.masterPromptEnglishWithKurdishDialogue, 'master')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              {copiedMaster ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMaster ? 'کۆپی کرا!' : 'کۆپیکردنی هەموو پرۆمپتەکە'}</span>
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {promptResult.projectTitleKurdish}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5" dir="ltr">
          {promptResult.projectTitleEnglish}
        </p>

        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <span className="font-bold text-amber-400 ml-1">پوختەی دەرهێنان (Logline):</span>
          {promptResult.loglineKurdish}
          <div className="mt-1 text-slate-500 text-xs font-mono" dir="ltr">
            "{promptResult.loglineEnglish}"
          </div>
        </div>
      </div>

      {/* The Master English Prompt with Kurdish Dialogues (The exact requested format) */}
      <div className="rounded-2xl bg-slate-900 border border-indigo-900/40 p-6 sm:p-7 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                پرۆمپتی وردی ئینگلیزی (Master AI Video Prompt)
              </h2>
              <p className="text-xs text-slate-400">
                بە زمانی ئینگلیزیی سینەماتیکی بۆ Sora / Veo / Runway، لەگەڵ هەموو دیالۆگ و مەنەلۆگ بە دەقی ڕەسەنی کوردی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">گونجاو بۆ:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">OpenAI Sora</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">Google Veo 2</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">Runway Gen-3</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">Kling AI</span>
          </div>
        </div>

        {/* Master Prompt Box */}
        <div className="relative group">
          <pre
            className="p-5 sm:p-6 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap selection:bg-amber-500 selection:text-slate-950 overflow-x-auto"
            dir="ltr"
          >
            {promptResult.masterPromptEnglishWithKurdishDialogue}
          </pre>

          <button
            onClick={() => copyToClipboard(promptResult.masterPromptEnglishWithKurdishDialogue, 'master-box')}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-lg opacity-90 group-hover:opacity-100 transition-all"
          >
            {copiedSection === 'master-box' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>کۆپی کرا</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کۆپیکردن (Copy Prompt)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 30-Second Shot Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              دابەشکاریی ٣٠ چرکەیی دیمەن بە دیمەن (Shot-by-Shot Timeline)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            ٤ دیمەنی سەرەکی بە دیالۆگی کوردی و تایبەتمەندی کامێرا
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {promptResult.shotTimeline.map((shot, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs" dir="ltr">
                    {shot.timeRange}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      {shot.shotTitleKurdish}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono" dir="ltr">
                      {shot.shotTitleEnglish}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700" dir="ltr">
                    {shot.cameraSpecs}
                  </span>
                </div>
              </div>

              {/* Visual description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4" dir="ltr">
                <strong className="text-slate-400 text-xs font-mono block mb-1">Visual & Action:</strong>
                {shot.visualDescription}
              </p>

              {/* Kurdish Dialogue Box with instant TTS trigger */}
              {shot.kurdishDialogue && (
                <div className="mt-3 p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-rose-300">
                        دیالۆگی کوردی کارەکتەر:
                      </span>
                      {shot.dialogueContext && (
                        <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                          {shot.dialogueContext}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white">
                      "{shot.kurdishDialogue}"
                    </p>
                  </div>

                  <button
                    onClick={() => onPlayTTSLine(shot.kurdishDialogue, shot.dialogueContext)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>گوێگرتن لە دەنگ (Gemini TTS)</span>
                  </button>
                </div>
              )}

              {/* Sound Effects */}
              {shot.soundEffects && (
                <div className="mt-2.5 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono" dir="ltr">
                  <span className="text-amber-400 font-sans font-bold text-xs" dir="rtl">دەنگ (SFX):</span>
                  <span>{shot.soundEffects}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TTS Ready Dialogue Lines Studio Preview */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 border border-rose-900/40 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                دەقە ئامادەکراوەکانی دەنگ (Gemini 3.8 Flash TTS Voice Lines)
              </h2>
              <p className="text-xs text-slate-400">
                بە مۆدێلی gemini-3.8-flash-tts بە تۆنی ئازارچەشتووی گەنجێکی ٢٠ ساڵانی کوردی گوێ لێ بگرە
              </p>
            </div>
          </div>

          <button
            onClick={onOpenTTSStudio}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
          >
            <span>کردنەوە لە ستۆدیۆی تەواوی دەنگ (Full TTS Studio)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {promptResult.ttsReadyLines.map((line) => (
            <div
              key={line.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold text-amber-400 block mb-1">
                  {line.speaker}
                </span>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  "{line.kurdishText}"
                </p>
                <p className="text-[10px] text-slate-400 mt-2 font-mono" dir="ltr">
                  Style: {line.suggestedStyle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-indigo-300 font-mono">
                  Voice: {line.suggestedVoice}
                </span>
                <button
                  onClick={() => onPlayTTSLine(line.kurdishText, line.suggestedStyle, line.suggestedVoice)}
                  className="px-2.5 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>پەخشکردن</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cinematography & Director Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cinematography Specs */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4 text-amber-400 font-bold text-sm sm:text-base">
            <Camera className="w-4 h-4" />
            <h3>تایبەتمەندییە سینەماییەکان (Cinematography Specs)</h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-medium block text-xs">ڕووناکی (Lighting):</span>
              <p className="text-slate-200 mt-0.5" dir="ltr">{promptResult.cinematographyNotes.lighting}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-medium block text-xs">ڕەنگ و تۆن (Color Grading / LUT):</span>
              <p className="text-slate-200 mt-0.5" dir="ltr">{promptResult.cinematographyNotes.colorGrading}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-medium block text-xs">مۆسیقا و پاشبنەما (Soundtrack & Mood):</span>
              <p className="text-slate-200 mt-0.5" dir="ltr">{promptResult.cinematographyNotes.soundtrackMood}</p>
            </div>
          </div>
        </div>

        {/* Director Tips */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold text-sm sm:text-base">
            <Sparkles className="w-4 h-4" />
            <h3>ئامۆژگارییەکانی دەرهێنەر بۆ بەرھەمهێنان</h3>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            {promptResult.directorTipsKurdish.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
