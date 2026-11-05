import React from 'react';
import { DIRECTOR_QUESTIONS, PRESET_PACKAGES } from '../data/questionnaire';
import { Sparkles, CheckCircle2, Wand2, Sliders, Edit3, ArrowLeft, HelpCircle } from 'lucide-react';

interface QuestionnaireSectionProps {
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customNotes: string;
  setCustomNotes: (notes: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const QuestionnaireSection: React.FC<QuestionnaireSectionProps> = ({
  answers,
  setAnswers,
  customNotes,
  setCustomNotes,
  onGenerate,
  isGenerating,
}) => {
  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleApplyPreset = (presetAnswers: Record<string, string>) => {
    setAnswers(presetAnswers);
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = DIRECTOR_QUESTIONS.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Hero Director Intro */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ڕاوێژکاری ئەندازیاری ڤیدیۆ (Video Prompt Engineering Consultation)</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <span>ماوەی ڤیدیۆ:</span>
              <span className="font-bold text-amber-400">٣٠ چرکە (30s Short Film)</span>
              <span className="text-slate-500">|</span>
              <span>کارەکتەر:</span>
              <span className="font-bold text-indigo-300">گەنجی کوردی ٢٠ ساڵان</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-relaxed">
            وەڵامی پرسیارەکانی دەرهێنەر بدەرەوە بۆ داڕشتنی پرۆمپتێکی ورد و دیالۆگی کوردی
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            بیرۆکەکەت: <strong className="text-amber-300">"گەنجێکی کوردی ٢٠ ساڵان نەخۆشە و سەرئێشەیەکی زۆری هەیە، نازانێت چی بکات بۆی."</strong>
            <br />
            بۆ ئەوەی پێکەوە بەهێزترین پرۆمپت بە ئینگلیزی (بۆ Sora, Veo, Runway, Kling) بنووسین و هەموو قسەکانی کارەکتەرەکە بە دەقی ڕەسەنی کوردی تێدا بچەسپێنین لەگەڵ دەنگی ڕاستەقینەی Gemini TTS، ئەم پرسیارانەی خوارەوە تەواو بکە:
          </p>

          {/* Quick Presets */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>پێشنیازە ئامادەکراوەکانی دەرهێنەر:</span>
            </span>
            {PRESET_PACKAGES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.answers)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500/50 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>{preset.nameKurdish}</span>
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs mb-1.5 text-slate-400">
              <span>ئاستی ئامادەیی سیناریۆ:</span>
              <span className="text-amber-400 font-bold">{answeredCount} لە {totalQuestions} پرسیار پڕکراونەتەوە ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-amber-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* The 6 Director Questions */}
      <div className="space-y-6">
        {DIRECTOR_QUESTIONS.map((q, idx) => {
          const selectedOptionId = answers[q.id];
          return (
            <div
              key={q.id}
              className={`rounded-2xl transition-all border p-5 sm:p-6 ${
                selectedOptionId
                  ? 'bg-slate-900/90 border-indigo-900/60 shadow-lg shadow-indigo-950/20'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-amber-400">
                        {q.categoryKurdish}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                        ({q.categoryEnglish})
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                      {q.questionKurdish}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {q.descriptionKurdish}
                    </p>
                  </div>
                </div>

                {selectedOptionId && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>دیاریکرا</span>
                  </span>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {q.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`text-right p-4 rounded-xl border transition-all flex flex-col justify-between relative group ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500'
                          : 'bg-slate-800/50 hover:bg-slate-800/80 border-slate-700/60 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-xs sm:text-sm leading-snug">
                            {opt.labelKurdish}
                          </p>
                          <div
                            className={`w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400 text-slate-950'
                                : 'border-slate-600 group-hover:border-slate-400'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                        </div>

                        {opt.detailKurdish && (
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                            {opt.detailKurdish}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-700/40 text-[10px] text-slate-500 font-mono" dir="ltr">
                        {opt.labelEnglish}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Extra Director Notes */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2 text-slate-200">
          <Edit3 className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm sm:text-base">تێبینی و دەستکاریی زیاتری دەرهێنان (ئارەزوومەندانە)</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          ئەگەر دەتەوێت وردەکارییەکی دیاریکراو وەک ڕەنگی جل، شار (سلێمانی / هەولێر / دهۆک)، کاتی ڕۆژ، یان ئامێرێکی تایبەت زیاد بکەیت، لێرەدا بینووسە:
        </p>
        <textarea
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="نموونە: دڵنیابە گەنجەکە تیپێکی ئاسایی زانکۆی لەبەردایە، تیشکی مۆبایلەکەی بە ڕەنگی شین ئەورای مایگرەینەکەی لەسەر دەموچاوی دروست بکات، و لە چرکەی ٢٠ بە دەنگێکی نزم بڵێت: ئای دایە گیان..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500 transition-all resize-y"
        />
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-4 z-40 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-right">
          <p className="font-bold text-sm text-white flex items-center justify-center sm:justify-start gap-2">
            <span>ئامادەی دروستکردنی پرۆمپت و سیناریۆیەکەت؟</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Gemini 3.8 Flash Ready
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            پرۆمپتی وردی ئینگلیزی + دەقی کوردی دیالۆگەکان + دەنگی Gemini 3.8 Flash TTS
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>ئەندازیاری ڤیدیۆ خەریکی داڕشتنە...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>دروستکردنی پرۆمپتی ٣٠ چرکەیی و سیناریۆ</span>
              <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
