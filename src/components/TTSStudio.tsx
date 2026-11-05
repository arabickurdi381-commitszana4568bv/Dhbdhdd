import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Radio,
  Sliders,
  Check,
  AlertCircle,
  Copy,
  Wand2,
  VolumeX,
} from 'lucide-react';

interface TTSStudioProps {
  initialText?: string;
  initialStyle?: string;
  initialVoice?: string;
}

const VOICES = [
  {
    id: 'Fenrir',
    name: 'Fenrir',
    descKurdish: 'دەنگێکی قووڵ و پڕ لە هەست (گونجاوترین بۆ گەنجی ٢٠ ساڵانی کورد)',
    gender: 'نێر (Male)',
  },
  {
    id: 'Puck',
    name: 'Puck',
    descKurdish: 'دەنگێکی توند و کارتێکەر بە هەستی بێزاری و هەژان',
    gender: 'نێر (Male)',
  },
  {
    id: 'Charon',
    name: 'Charon',
    descKurdish: 'دەنگێکی هێمن و نزم و کز',
    gender: 'نێر (Male)',
  },
  {
    id: 'Kore',
    name: 'Kore',
    descKurdish: 'دەنگێکی ڕوون و پاک',
    gender: 'مێ (Female)',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    descKurdish: 'دەنگێکی نەرم و کراوە',
    gender: 'مێ (Female)',
  },
];

const STYLE_PRESETS = [
  {
    id: 'migraine_agony',
    labelKurdish: '😫 ئازاری کوشندەی سەرئێشە (Severe Migraine Agony)',
    prompt: 'Pained, agonizing whisper of a 20-year-old Kurdish young man holding his throbbing head, groaning in despair',
  },
  {
    id: 'crying_for_mother',
    labelKurdish: '🗣️ بانگکردنی دایک بە لەرزۆکی (Calling for Help/Mother)',
    prompt: 'Trembling, desperate voice calling out for his mother and painkillers, wincing from pain',
  },
  {
    id: 'breathless_exhaustion',
    labelKurdish: '😮‍💨 بێهێز و هەناسەسوار (Breathless Exhaustion)',
    prompt: 'Weak, slow, exhausted voice breathing heavily between words, completely drained of energy',
  },
  {
    id: 'quiet_mutter',
    labelKurdish: '🤫 پرتەی ژێر لێو (Quiet Inner Mutter)',
    prompt: 'Quiet, frustrated mutter under the breath in a dark quiet room, squinting eyes',
  },
];

const KURDISH_SAMPLE_LINES = [
  'ئای خوایە... سەرم خەریکە دەتەقێت، چی بکەم؟ هیچ دەرمانێک لێرە نییە!',
  'دایە گیان کوا دەرمانەکان؟ ئەی هاوار تەحەممولم نەماوە، بۆچی ئاوام لێهات؟',
  'پێویستە کەمێک ئاو بخۆمەوە... چاوەکانم لێڵ بوون، تەنیا کەمێک تاریکی و بێدەنگیم دەوێت.',
  'ئەم شاشەیە چاوم دەسووتێنێت... ئیتر ناتوانم تەماشای بکەم، سەرم وەک چەکوش لێدەدات.',
];

export const TTSStudio: React.FC<TTSStudioProps> = ({
  initialText,
  initialStyle,
  initialVoice,
}) => {
  const [text, setText] = useState(
    initialText || 'ئای خوایە... سەرم خەریکە دەتەقێت، چی بکەم؟ هیچ دەرمانێک لێرە نییە!'
  );
  const [selectedVoice, setSelectedVoice] = useState(initialVoice || 'Fenrir');
  const [selectedStyle, setSelectedStyle] = useState(
    initialStyle || STYLE_PRESETS[0].prompt
  );
  const [customStyle, setCustomStyle] = useState('');
  const [isCustomStyleActive, setIsCustomStyleActive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Playback State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Sync if initial props change
  useEffect(() => {
    if (initialText) setText(initialText);
    if (initialVoice) setSelectedVoice(initialVoice);
    if (initialStyle) {
      setSelectedStyle(initialStyle);
      setIsCustomStyleActive(true);
      setCustomStyle(initialStyle);
    }
  }, [initialText, initialVoice, initialStyle]);

  const activeStylePrompt = isCustomStyleActive ? customStyle : selectedStyle;

  const handleGenerateTTS = async () => {
    if (!text.trim()) {
      setErrorMessage('تکایە دەقێکی کوردی بنووسە.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice,
          style: activeStylePrompt || 'Pained 20-year-old Kurdish youth suffering from severe headache',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'هەڵەیەک ڕوویدا لە دروستکردنی دەنگدا.');
      }

      const wavBlobUrl = `data:audio/wav;base64,${data.audioBase64}`;
      setAudioUrl(wavBlobUrl);

      // Automatically play the generated audio
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }, 100);
    } catch (err: any) {
      console.error('TTS generation failed:', err);
      setErrorMessage(err.message || 'پەیوەندی لەگەڵ Gemini 3.8 Flash TTS سەرکەوتوو نەبوو.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `kurdish_young_man_migraine_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={handleAudioEnded}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      )}

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-900/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>مۆدێلی دەنگی Gemini 3.8 Flash TTS</span>
          </div>

          <span className="text-xs text-slate-400 font-mono" dir="ltr">
            Output: 24kHz Unary WAV (Mono 16-bit)
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          ستۆدیۆی بەدەنگکردنی دیالۆگی کوردی (TTS Voice Studio)
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          بە دەنگێکی سروشتی و واقیعی، قسە و دەربڕینە کوردییەکانی گەنجە ٢٠ ساڵانەکە بە هەست و سۆزی ئازاری سەرئێشە ببیستە. دەتوانیت جۆری دەنگ، تۆنی ئەکتەری، و دەقی قسەکان بگۆڕیت و دەنگەکە دابگریت (Download WAV).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Input & Styles) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Kurdish Text Input */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-sm text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-rose-400" />
                <span>دەقی کوردی بۆ خوێندنەوە (Kurdish Spoken Dialogue)</span>
              </label>
              <span className="text-[11px] text-slate-400">{text.length} پیت</span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="دەقی کوردی لێرە بنووسە یان یەکێک لە نموونەکان هەڵبژێرە..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 text-sm sm:text-base leading-relaxed focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all resize-y"
            />

            {/* Quick Sample Chips */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>نموونەی دیالۆگ:</span>
              </span>
              {KURDISH_SAMPLE_LINES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setText(sample)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-right truncate max-w-xs active:scale-95"
                  title={sample}
                >
                  "{sample.slice(0, 32)}..."
                </button>
              ))}
            </div>
          </div>

          {/* Voice Presets */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-md">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>هەڵبژاردنی دەنگی کارەکتەر (Gemini Voice Personality)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VOICES.map((v) => {
                const isSelected = selectedVoice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={`text-right p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm font-mono">{v.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {v.gender}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      {v.descKurdish}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acting & Emotional Style */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <span>شێوازی ڕۆڵگێڕان و تۆنی دەنگ (Voice Acting Style)</span>
              </h3>
              <button
                onClick={() => setIsCustomStyleActive(!isCustomStyleActive)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                {isCustomStyleActive ? 'گەڕانەوە بۆ شێوازە ئامادەکراوەکان' : 'نووسینی شێوازی تایبەت'}
              </button>
            </div>

            {!isCustomStyleActive ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STYLE_PRESETS.map((st) => {
                  const isSelected = selectedStyle === st.prompt;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStyle(st.prompt)}
                      className={`text-right p-3 rounded-xl border transition-all text-xs ${
                        isSelected
                          ? 'bg-rose-950/70 border-rose-500 text-white font-bold ring-1 ring-rose-500'
                          : 'bg-slate-950/50 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="block">{st.labelKurdish}</span>
                      <span className="block text-[10px] text-slate-500 mt-1 font-mono truncate" dir="ltr">
                        {st.prompt}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <textarea
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder="e.g. Agonized, groaning with deep pain, 20-year-old Kurdish man, slow pacing..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500"
                  dir="ltr"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  دەتوانیت ڕێنمایی دەنگی بە ئینگلیزی بنووسیت بۆ ئەوەی مۆدێلی Gemini TTS پەیڕەوی بکات.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Live Player & Controls) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main TTS Player Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  پەخشی دەنگیی ڕاستەوخۆ
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {selectedVoice} • 24kHz WAV
                </span>
              </div>

              {/* Waveform / Visualizer Animation */}
              <div className="h-28 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center gap-1.5 px-6 relative overflow-hidden">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-7 h-7 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                    <span className="text-xs text-rose-300 font-medium animate-pulse">
                      Gemini 3.8 Flash TTS خەریکی بەرهەمهێنانی دەنگە...
                    </span>
                  </div>
                ) : audioUrl ? (
                  <div className="flex items-end justify-center gap-1 sm:gap-1.5 h-16 w-full">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const height = isPlaying
                        ? Math.max(15, Math.sin((i + Date.now() / 150) * 0.7) * 45 + 35)
                        : (i % 4) * 8 + 12;
                      return (
                        <div
                          key={i}
                          className={`w-1.5 sm:w-2 rounded-full transition-all duration-75 ${
                            isPlaying
                              ? 'bg-gradient-to-t from-rose-500 to-amber-400'
                              : 'bg-slate-700'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs">
                    <Volume2 className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <span>تکایە کلیك لە "بەرهەمهێنانی دەنگ" بکە بۆ دروستکردن</span>
                  </div>
                )}
              </div>

              {/* Time slider & indicator */}
              {audioUrl && (
                <div className="mt-4 space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 1}
                    step={0.01}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono" dir="ltr">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Playback Controls */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={togglePlayPause}
                  disabled={!audioUrl || isLoading}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={isPlaying ? 'ڕاگرتن' : 'پەخشکردن'}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>

                {audioUrl && (
                  <button
                    onClick={handleDownload}
                    className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
                    title="داگرتنی فایلی دەنگ (WAV)"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Playback Speed selector */}
              {audioUrl && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs">
                  <span className="text-slate-400">خێرایی:</span>
                  {[0.75, 1, 1.25].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2 py-0.5 rounded font-mono ${
                        playbackSpeed === spd
                          ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Primary Generate Button */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <button
                onClick={handleGenerateTTS}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>خەریکی دروستکردنی دەنگی کوردییە...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>بەرهەمهێنانی دەنگ بە Gemini 3.8 Flash TTS</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                مۆدێلی gemini-3.8-flash-tts بەکاردەهێنرێت لەگەڵ prebuiltVoiceConfig
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
