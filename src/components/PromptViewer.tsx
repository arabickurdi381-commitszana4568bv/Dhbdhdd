import React, { useState, useRef, useEffect } from 'react';
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
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Upload,
  UserCheck,
} from 'lucide-react';

interface PromptViewerProps {
  promptResult: DirectorPromptResult;
  onPlayTTSLine: (text: string, style?: string, voice?: string) => void;
  onOpenTTSStudio: () => void;
  userRealVoiceUrl?: string | null;
  userVoiceTranscription?: string | null;
  onOpenPublish?: () => void;
}

export const PromptViewer: React.FC<PromptViewerProps> = ({
  promptResult,
  onPlayTTSLine,
  onOpenTTSStudio,
  userRealVoiceUrl,
  userVoiceTranscription,
  onOpenPublish,
}) => {
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // User real human voice recordings per shot index (0, 1, 2, 3)
  const [shotRecordings, setShotRecordings] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    if (userRealVoiceUrl) {
      initial[0] = userRealVoiceUrl;
    }
    return initial;
  });
  const [activeRecordingIndex, setActiveRecordingIndex] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingShotIndex, setPlayingShotIndex] = useState<number | null>(null);
  const [isPlayingFullMovie, setIsPlayingFullMovie] = useState(false);
  const [currentFullMovieShot, setCurrentFullMovieShot] = useState<number>(0);

  // Sync if userRealVoiceUrl is updated globally
  useEffect(() => {
    if (userRealVoiceUrl && !shotRecordings[0]) {
      setShotRecordings((prev) => ({ ...prev, 0: userRealVoiceUrl }));
    }
  }, [userRealVoiceUrl]);

  // Refs for recording & playback
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const shotAudioRef = useRef<HTMLAudioElement | null>(null);
  const fullMovieTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fullMovieTimerRef.current) clearInterval(fullMovieTimerRef.current);
      // Clean up blob URLs
      Object.values(shotRecordings).forEach((url) => {
        if (url && !url.startsWith('data:')) URL.revokeObjectURL(url);
      });
    };
  }, []);

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

  // Start recording user's real voice for a specific shot
  const startRecordingForShot = async (index: number) => {
    if (activeRecordingIndex !== null) return;
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setShotRecordings((prev) => ({ ...prev, [index]: url }));
        stream.getTracks().forEach((track) => track.stop());
        setActiveRecordingIndex(null);
      };

      mediaRecorder.start(200);
      setActiveRecordingIndex(index);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            stopRecordingForShot();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Microphone error in shot recording:', err);
      alert('تکایە دڵنیابەرەوە لە ڕێگەپێدانی مایکرۆفۆن بۆ تۆمارکردنی دەنگ.');
    }
  };

  const stopRecordingForShot = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Handle uploading audio for a shot
  const handleUploadAudioForShot = (index: number, file: File) => {
    const url = URL.createObjectURL(file);
    setShotRecordings((prev) => ({ ...prev, [index]: url }));
  };

  // Playback of user's authentic recorded voice for a specific shot
  const togglePlayRecordedShot = (index: number) => {
    const audioUrl = shotRecordings[index];
    if (!audioUrl) return;

    if (playingShotIndex === index) {
      shotAudioRef.current?.pause();
      setPlayingShotIndex(null);
    } else {
      if (shotAudioRef.current) {
        shotAudioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      shotAudioRef.current = audio;
      audio.onended = () => setPlayingShotIndex(null);
      audio.onpause = () => setPlayingShotIndex(null);
      audio.play().catch(() => {});
      setPlayingShotIndex(index);
    }
  };

  const deleteRecordingForShot = (index: number) => {
    const url = shotRecordings[index];
    if (url && !url.startsWith('data:')) URL.revokeObjectURL(url);
    setShotRecordings((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    if (playingShotIndex === index) {
      shotAudioRef.current?.pause();
      setPlayingShotIndex(null);
    }
  };

  // Play full 30s video timeline with recorded voices
  const playFullMovieTimeline = () => {
    if (isPlayingFullMovie) {
      shotAudioRef.current?.pause();
      setIsPlayingFullMovie(false);
      setCurrentFullMovieShot(0);
      return;
    }

    setIsPlayingFullMovie(true);
    let currentIdx = 0;

    const playNextShot = () => {
      if (currentIdx >= promptResult.shotTimeline.length) {
        setIsPlayingFullMovie(false);
        setCurrentFullMovieShot(0);
        return;
      }

      setCurrentFullMovieShot(currentIdx);
      const url = shotRecordings[currentIdx];

      if (url) {
        const audio = new Audio(url);
        shotAudioRef.current = audio;
        audio.onended = () => {
          currentIdx++;
          setTimeout(playNextShot, 600);
        };
        audio.play().catch(() => {
          currentIdx++;
          setTimeout(playNextShot, 600);
        });
      } else {
        // If not recorded, simulate shot time (3 seconds) then advance
        setTimeout(() => {
          currentIdx++;
          playNextShot();
        }, 3000);
      }
    };

    playNextShot();
  };

  const totalUserRecordings = Object.keys(shotRecordings).length;

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
            {onOpenPublish && (
              <button
                onClick={onOpenPublish}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>بڵاوکردنەوە (Publish)</span>
              </button>
            )}

            <button
              onClick={() => copyToClipboard(promptResult.masterPromptEnglishWithKurdishDialogue, 'master')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              {copiedMaster ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMaster ? 'کۆپی کرا!' : 'کۆپیکردنی پرۆمپت'}</span>
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

      {/* Real Voice Acting Studio Banner & Master 30s Player */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border border-rose-800/50 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-right w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 flex-shrink-0">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base sm:text-lg">
                ستۆدیۆی دۆبلاژ بە دەنگی ڕاستەقینەی خۆت (Voice Acting Studio)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30 font-bold">
                {totalUserRecordings} لە ٤ دێڕ تۆمارکراون
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              دەتوانیت هەر ٤ دێڕە کوردییەکە بە دەنگی واقیعیی خۆت تۆمار بکەیت تا تەواوی کورتەڤیدیۆکە ڕاستەوخۆ بە دەنگی تۆ پەخش بێت.
            </p>
          </div>
        </div>

        <button
          onClick={playFullMovieTimeline}
          className="flex-shrink-0 w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 transition-all active:scale-95"
        >
          {isPlayingFullMovie ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          <span>
            {isPlayingFullMovie
              ? `پەخشکردنی دیمەنی ${currentFullMovieShot + 1}... (ڕاگرتن)`
              : 'پەخشکردنی تەواوی ٣٠ چرکەکە بە دەنگی خۆت (Play 30s Movie)'}
          </span>
        </button>
      </div>

      {/* 30-Second Shot Breakdown with Real Voice Acting Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              دابەشکاریی ٣٠ چرکەیی دیمەن بە دیمەن + تۆمارکردنی دەنگی ڕاستەقینەت
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            ٤ دیمەنی سەرەکی بە دیالۆگی کوردی و تایبەتمەندی کامێرا
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {promptResult.shotTimeline.map((shot, idx) => {
            const hasUserRecording = Boolean(shotRecordings[idx]);
            const isThisRecording = activeRecordingIndex === idx;
            const isThisPlaying = playingShotIndex === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl transition-all border p-5 sm:p-6 shadow-md ${
                  hasUserRecording
                    ? 'bg-slate-900/90 border-emerald-900/60 shadow-emerald-950/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Shot Header */}
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
                    {hasUserRecording && (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>دەنگی ڕاستەقینەی خۆت تۆمارکرا</span>
                      </span>
                    )}
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

                {/* Kurdish Dialogue Box with Real Voice Actor & AI Options */}
                {shot.kurdishDialogue && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
                        <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                          "{shot.kurdishDialogue}"
                        </p>
                      </div>
                    </div>

                    {/* Voice Controls: Record Real Voice VS Play AI Voice */}
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                      {/* Left: User's real voice recording */}
                      <div className="flex items-center gap-2">
                        {isThisRecording ? (
                          <button
                            onClick={stopRecordingForShot}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md animate-pulse"
                          >
                            <Square className="w-3.5 h-3.5 fill-white" />
                            <span>تەواوکردنی تۆمار ({recordingSeconds}s)</span>
                          </button>
                        ) : hasUserRecording ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => togglePlayRecordedShot(idx)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95"
                            >
                              {isThisPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                              <span>{isThisPlaying ? 'ڕاگرتن' : 'پەخشی دەنگی ڕاستەقینەی خۆت'}</span>
                            </button>

                            <button
                              onClick={() => startRecordingForShot(idx)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                              title="دووبارە تۆمارکردنەوە بە دەنگی خۆت"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => deleteRecordingForShot(idx)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700"
                              title="سڕینەوەی تۆمار"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startRecordingForShot(idx)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              <span>تۆمارکردن بە دەنگی ڕاستەقینەی خۆت</span>
                            </button>

                            {/* One-click assign recorded global voice */}
                            {userRealVoiceUrl && (
                              <button
                                onClick={() => setShotRecordings((prev) => ({ ...prev, [idx]: userRealVoiceUrl }))}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 text-xs font-bold flex items-center gap-1 active:scale-95"
                                title="دانانی هەمان دەنگی تۆمارکراوی خۆت بۆ ئەم دیمەنە"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>دانانی دەنگەکەم</span>
                              </button>
                            )}

                            {/* Hidden file input for uploading audio for this shot */}
                            <label className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer" title="ئەپڵۆدکردنی فایلی دەنگ بۆ ئەم دێڕە">
                              <Upload className="w-3.5 h-3.5 text-amber-400" />
                              <input
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUploadAudioForShot(idx, file);
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Right: AI Voice option */}
                      <button
                        onClick={() => onPlayTTSLine(shot.kurdishDialogue, shot.dialogueContext)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>گوێگرتن لە دەنگی AI (Gemini TTS)</span>
                      </button>
                    </div>
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
            );
          })}
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
          {promptResult.ttsReadyLines.map((line) => {
            const isMentor = line.speaker.includes('مامۆستا') || line.speaker.includes('Mentor');
            const isBadini = line.speaker.includes('بادینی') || line.speaker.includes('Badini');
            const isKurdishBoy = line.speaker.includes('کوڕی کورد') || line.speaker.includes('Kurdish Boy');

            let borderColor = 'border-slate-800 hover:border-slate-700';
            let titleColor = 'text-amber-400';
            let tagBadge = null;

            if (isBadini) {
              borderColor = 'border-pink-900/50 hover:border-pink-600/60 bg-pink-950/20';
              titleColor = 'text-pink-400';
              tagBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
                  زاراوەی بادینی
                </span>
              );
            } else if (isKurdishBoy) {
              borderColor = 'border-amber-900/50 hover:border-amber-600/60 bg-amber-950/20';
              titleColor = 'text-amber-300';
              tagBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  قسەکردنی جوان
                </span>
              );
            } else if (isMentor) {
              borderColor = 'border-emerald-900/50 hover:border-emerald-600/60 bg-emerald-950/20';
              titleColor = 'text-emerald-400';
              tagBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  دەنگی ئاسایی
                </span>
              );
            }

            return (
              <div
                key={line.id}
                className={`p-4 rounded-xl flex flex-col justify-between border transition-all ${borderColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-bold ${titleColor}`}>
                      {line.speaker}
                    </span>
                    {tagBadge}
                  </div>
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
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                      isBadini
                        ? 'bg-pink-600/30 hover:bg-pink-600 text-pink-200 hover:text-white border border-pink-500/40'
                        : isKurdishBoy
                        ? 'bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40'
                        : isMentor
                        ? 'bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40'
                        : 'bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>پەخشکردن</span>
                  </button>
                </div>
              </div>
            );
          })}
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
