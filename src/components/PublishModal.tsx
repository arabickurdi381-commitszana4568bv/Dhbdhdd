import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Film,
  Sparkles,
  Globe,
  X,
  Play,
  Video,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { DirectorPromptResult } from '../types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptResult: DirectorPromptResult;
  userRealVoiceUrl?: string | null;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  promptResult,
  userRealVoiceUrl,
}) => {
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const sharedAppUrl = 'https://ais-pre-5pgncgtm26xvyko7y24rp6-161659540113.europe-west2.run.app';

  const copyAppUrl = () => {
    navigator.clipboard.writeText(sharedAppUrl);
    setCopiedAppUrl(true);
    setTimeout(() => setCopiedAppUrl(false), 2500);
  };

  const copyPromptText = () => {
    navigator.clipboard.writeText(promptResult.masterPromptEnglishWithKurdishDialogue);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const downloadFullPackage = () => {
    const content = `=====================================================
کورتەڤیدیۆی ٣٠ چرکەیی - ${promptResult.projectTitleKurdish}
${promptResult.projectTitleEnglish}
=====================================================

[پوختەی دەرهێنان / LOGLINE]
کوردی: ${promptResult.loglineKurdish}
ئینگلیزی: ${promptResult.loglineEnglish}

=====================================================
پرۆمپتی وردی سینەمایی (MASTER AI VIDEO PROMPT)
(بۆ بەکارهێنان لە Google Veo 2 / Runway Gen-3 / Kling AI / OpenAI Sora)
=====================================================
${promptResult.masterPromptEnglishWithKurdishDialogue}

=====================================================
دابەشکاری دیمەنەکان بە چرکە (30-SECOND SHOT BREAKDOWN)
=====================================================
${promptResult.shotTimeline
  .map(
    (s, i) => `
دیمەنی ${i + 1} (${s.timeRange}): ${s.shotTitleKurdish} (${s.shotTitleEnglish})
کامێرا: ${s.cameraSpecs}
دیمەنی ڤیدیۆ: ${s.visualDescription}
دیالۆگی کوردی: "${s.kurdishDialogue}"
هەستی دەنگ: ${s.dialogueContext}
کاریگەری دەنگی SFX: ${s.soundEffects}
`
  )
  .join('\n-----------------------------------------------------\n')}

=====================================================
تایبەتمەندییە سینەماییەکان (CINEMATOGRAPHY SPECS)
=====================================================
ڕووناکی: ${promptResult.cinematographyNotes.lighting}
تۆنی ڕەنگ (LUT): ${promptResult.cinematographyNotes.colorGrading}
ڕێژەی شاشە: ${promptResult.cinematographyNotes.aspectRatio}
مۆسیقا و پاشبنەما: ${promptResult.cinematographyNotes.soundtrackMood}

=====================================================
ئامۆژگارییەکانی دەرهێنەر:
${promptResult.directorTipsKurdish.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kurdish_short_film_30s_production_pack_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بڵاوکردنەوە و بەرهەمهێنان (Publish & Export)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              چۆنیەتی بڵاوکردنەوەی ئەم ئەپڵیکەیشنە و دروستکردنی ڤیدیۆ ٣٠ چرکەییەکە
            </p>
          </div>
        </div>

        {/* 1. Live Public App URL */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-indigo-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>١. لینکی ڕاستەوخۆ و گشتیی ئەپڵیکەیشنەکەت (Public Web URL)</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              ئۆنلاینە و کارایە
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            ئەم لینکە بنێرە بۆ هەر کەسێک تا لەسەر مۆبایل یان کۆمپیوتەر ڕاستەوخۆ دەرهێنەر و ستۆدیۆی دەنگەکە بکاتەوە:
          </p>

          <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800" dir="ltr">
            <input
              type="text"
              readOnly
              value={sharedAppUrl}
              className="bg-transparent text-slate-300 text-xs flex-1 font-mono outline-none px-2 select-all truncate"
            />
            <button
              onClick={copyAppUrl}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow active:scale-95 flex-shrink-0"
            >
              {copiedAppUrl ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAppUrl ? 'کۆپی کرا!' : 'کۆپیکردنی لینک'}</span>
            </button>
            <a
              href={sharedAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="کردنەوە لە پەڕەیەکی نوێ"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 2. Step-by-Step: How to publish the 30s video */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Film className="w-4 h-4" />
            <span>٢. هەنگاوەکانی بڵاوکردنەوە و دروستکردنی ڤیدیۆکە لە ماڵپەڕە AI یەکان:</span>
          </span>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                ١
              </span>
              <div className="space-y-1">
                <span className="font-bold text-white block">کۆپیکردنی پرۆمپتە ئینگلیزییە وردەکە بە دیالۆگی کوردی</span>
                <p className="text-slate-400">
                  پرۆمپتەکە تایبەت داڕێژراوە بۆ گەنجێکی ٢٠ ساڵانی کورد لە ژوورێکی تاریکدا و دیالۆگی کوردی لەخۆدەگرێت.
                </p>
                <button
                  onClick={copyPromptText}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 shadow active:scale-95"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'پرۆمپت کۆپی کرا!' : 'کۆپیکردنی پرۆمپت (Copy AI Prompt)'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                ٢
              </span>
              <div className="space-y-1">
                <span className="font-bold text-white block">داگرتنی دەنگە تۆمارکراوەکەی خۆت</span>
                <p className="text-slate-400">
                  لە بەشی ستۆدیۆی دەنگ یان پرۆمپت، فایلی دەنگەکەت داگرە (Download WAV) تا دواتر بیخەیتە سەر ڤیدیۆکە.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                ٣
              </span>
              <div className="space-y-2">
                <span className="font-bold text-white block">پەیستکردن لە یەکێک لەم پلاتفۆرمە بەهێزانەی ڤیدیۆ:</span>
                <div className="flex flex-wrap gap-2 pt-1" dir="ltr">
                  <a
                    href="https://aitestkitchen.withgoogle.com/tools/video-fx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1 border border-slate-700 text-xs"
                  >
                    <span>Google Veo 2</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://runwayml.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1 border border-slate-700 text-xs"
                  >
                    <span>Runway Gen-3</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://klingai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1 border border-slate-700 text-xs"
                  >
                    <span>Kling AI</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://sora.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1 border border-slate-700 text-xs"
                  >
                    <span>OpenAI Sora</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                ٤
              </span>
              <div className="space-y-1">
                <span className="font-bold text-white block">مۆنتاژ و تێکەڵکردنی دەنگ و ڕەنگ لە CapCut یان Premiere</span>
                <p className="text-slate-400">
                  ڤیدیۆ دروستکراوەکە و فایلی دەنگە کوردییەکەت لە CapCut یان TikTok دابنێ، ڤیدیۆکەت ئامادەیە بۆ بڵاوکردنەوە لە ئینستاگرام، تیکتۆک، یان یوتیوب شۆرتس!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Download Full Production Package */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={downloadFullPackage}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>داگرتنی پاکێجی تەواوی سیناریۆ و پرۆمپتەکە (TXT)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            داخستنی پەنجەرە
          </button>
        </div>
      </div>
    </div>
  );
};
