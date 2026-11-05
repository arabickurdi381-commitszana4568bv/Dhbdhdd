import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Wand2,
  UserCheck,
  Radio,
  Upload,
  FileAudio,
  Sliders,
  Check,
  MessageSquare,
  Headphones,
} from 'lucide-react';

export interface ClonedVoiceProfile {
  detectedGender: string;
  detectedAge: string;
  vocalPitch: string;
  accentDialect: string;
  matchedVoice: string;
  voiceStylePrompt: string;
  voiceSummaryKurdish: string;
  transcription?: string;
  recordedAudioUrl?: string;
}

interface VoiceRecorderProps {
  onVoiceCloned: (profile: ClonedVoiceProfile) => void;
  currentProfile: ClonedVoiceProfile | null;
  onApplyRealVoiceToStory?: (audioUrl: string, transcription?: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onVoiceCloned,
  currentProfile,
  onApplyRealVoiceToStory,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioSourceType, setAudioSourceType] = useState<'mic' | 'upload'>('mic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Equalizer & Studio Tuning for Real Voice
  const [bassGain, setBassGain] = useState(3); // +3dB natural warmth
  const [trebleGain, setTrebleGain] = useState(2); // +2dB speech presence
  const [isRoomReverbActive, setIsRoomReverbActive] = useState(false);
  const [appliedToStorySuccess, setAppliedToStorySuccess] = useState(false);

  // Web Audio playback refs
  const [isPlayingEnhanced, setIsPlayingEnhanced] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recordedAudioUrl && !recordedAudioUrl.startsWith('data:')) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [recordedAudioUrl]);

  // Initialize or update Web Audio filters
  const setupWebAudioPipeline = () => {
    if (!audioElementRef.current) return;

    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audioElementRef.current);
      sourceNodeRef.current = source;

      // Bass EQ (Low Shelf at 200 Hz)
      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 200;
      bass.gain.value = bassGain;
      bassFilterRef.current = bass;

      // Treble / Vocal Presence (Peaking at 3200 Hz)
      const treble = ctx.createBiquadFilter();
      treble.type = 'peaking';
      treble.frequency.value = 3200;
      treble.Q.value = 1.0;
      treble.gain.value = trebleGain;
      trebleFilterRef.current = treble;

      const gain = ctx.createGain();
      gain.gain.value = 1.0;
      gainNodeRef.current = gain;

      // Connect: source -> bass -> treble -> gain -> destination
      source.connect(bass);
      bass.connect(treble);
      treble.connect(gain);
      gain.connect(ctx.destination);
    } else {
      if (bassFilterRef.current) bassFilterRef.current.gain.value = bassGain;
      if (trebleFilterRef.current) trebleFilterRef.current.gain.value = trebleGain;
    }
  };

  // Update filter values whenever sliders change
  useEffect(() => {
    if (bassFilterRef.current) bassFilterRef.current.gain.value = bassGain;
  }, [bassGain]);

  useEffect(() => {
    if (trebleFilterRef.current) trebleFilterRef.current.gain.value = trebleGain;
  }, [trebleGain]);

  const startRecording = async () => {
    setErrorMessage(null);
    setRecordedAudioBlob(null);
    if (recordedAudioUrl && !recordedAudioUrl.startsWith('data:')) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setFileName(null);
    setAudioSourceType('mic');
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setAppliedToStorySuccess(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        'مایکرۆفۆن لەناو ئەم وێبگەڕەدا کارا نییە. تکایە دوگمەی "ئەپڵۆدکردنی فایلی دەنگ" بەکاربهێنە بۆ دیاریکردنی فایلی دەنگەکەت.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 45) {
            stopRecording();
            return 45;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Error accessing microphone:', err);
      let friendlyError =
        'دەستگەیشتن بە مایکرۆفۆن ڕێگری لێکراوە. دەتوانیت فایلی دەنگی خۆت (ڕیکۆردی مۆبایل) لە ڕێگەی ئەپڵۆدەوە دابنێیت.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyError =
          'مۆڵەتی مایکرۆفۆن نەدراوە. تکایە لە وێبگەڕ مۆڵەت بدە، یان ڕاستەوخۆ فایلی دەنگەکەت لە خوارەوە ئەپڵۆد بکە.';
      }
      setErrorMessage(friendlyError);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setAppliedToStorySuccess(false);
    if (recordedAudioUrl && !recordedAudioUrl.startsWith('data:')) {
      URL.revokeObjectURL(recordedAudioUrl);
    }

    setRecordedAudioBlob(file);
    const url = URL.createObjectURL(file);
    setRecordedAudioUrl(url);
    setFileName(file.name);
    setAudioSourceType('upload');
    setRecordingSeconds(10);
  };

  const togglePlayEnhancedRealVoice = async () => {
    if (!audioElementRef.current || !recordedAudioUrl) return;

    if (isPlayingEnhanced) {
      audioElementRef.current.pause();
      setIsPlayingEnhanced(false);
    } else {
      setupWebAudioPipeline();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      audioElementRef.current.play().catch(() => {});
      setIsPlayingEnhanced(true);
    }
  };

  // Directly analyze and recognize Kurdish voice
  const handleAnalyzeAndRecognize = async () => {
    if (!recordedAudioBlob) {
      setErrorMessage('تکایە سەرەتا دەنگت تۆمار بکە یان فایلێکی دەنگ ئەپڵۆد بکە.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(recordedAudioBlob);
      const audioBase64 = await base64Promise;

      const response = await fetch('/api/voice-clone/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: recordedAudioBlob.type || 'audio/webm',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'ناسینەوە و شیکردنەوەی دەنگ سەرکەوتوو نەبوو.');
      }

      const profile: ClonedVoiceProfile = {
        ...data.profile,
        recordedAudioUrl: recordedAudioUrl || undefined,
      };

      onVoiceCloned(profile);
    } catch (err: any) {
      console.error('Voice analysis failed:', err);
      setErrorMessage(err.message || 'پەیوەندی لەگەڵ مۆدێلی ناسینەوەی دەنگ سەرکەوتوو نەبوو.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToStoryDirectly = () => {
    if (!recordedAudioUrl) return;
    if (onApplyRealVoiceToStory) {
      onApplyRealVoiceToStory(recordedAudioUrl, currentProfile?.transcription);
    }
    setAppliedToStorySuccess(true);
    setTimeout(() => setAppliedToStorySuccess(false), 3500);
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6" dir="rtl">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac"
        className="hidden"
      />

      {/* Hidden HTML audio element connected to Web Audio */}
      {recordedAudioUrl && (
        <audio
          ref={audioElementRef}
          src={recordedAudioUrl}
          crossOrigin="anonymous"
          onEnded={() => setIsPlayingEnhanced(false)}
          onPause={() => setIsPlayingEnhanced(false)}
          onPlay={() => setIsPlayingEnhanced(true)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              ناسینەوە و تۆمارکردنی دەنگی ڕاستەقینەی خۆت (Direct Voice Recognition)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            لێرە دەنگت ڕاستەوخۆ تۆمار دەبێت، سیستەم پیت بە پیت دەنگەکەت دەناسێتەوە و دەتوانیت ڕاستەوخۆ هەمان دەنگی خۆت لەناو ڤیدیۆکەدا بەکاربهێنیت.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>ئەپڵۆدکردنی فایلی دەنگ (Upload Voice File)</span>
          </button>
        </div>
      </div>

      {/* Suggested Kurdish Script */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
        <span className="text-[11px] font-bold text-amber-400 block mb-1">
          💡 بۆ ئەوەی سیستەم بە تەواوی دەنگت بناسێتەوە، ئەم ڕستەیە بە ئازاری سەرئێشەوە بخوێنەرەوە:
        </span>
        <p className="text-sm font-medium text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          "ئای خوایە گیان... سەرم وەک چەکوش لێدەدات و خەریکە دەتەقێت! نازانم چی بکەم، هیچ دەرمانێکم لە ژوورەکەدا پێ نییە..."
        </p>
      </div>

      {/* Recording Stage Visualizer */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-4 text-center">
        {isRecording ? (
          <div className="space-y-3">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-rose-500/20 animate-ping absolute" />
              <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40">
                <Mic className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-base text-rose-300 font-mono tracking-wider">
                {formatSecs(recordingSeconds)}
              </p>
              <p className="text-xs text-slate-400">
                قسە بکە... مایکرۆفۆن دەنگت تۆمار دەکات
              </p>
            </div>

            {/* Simulated Voice Frequency Bars */}
            <div className="flex items-center justify-center gap-1.5 h-10 pt-2">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-rose-600 to-amber-400 animate-pulse"
                  style={{
                    height: `${Math.max(20, Math.sin(i * 0.7 + Date.now() / 200) * 80 + 30)}%`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : recordedAudioUrl ? (
          <div className="space-y-4 w-full max-w-lg">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {audioSourceType === 'upload'
                  ? `فایلی دەنگی خۆت بە سەرکەوتوویی بارکرا (${fileName || 'Audio'})`
                  : `دەنگی ڕاستەقینەت بە سەرکەوتوویی تۆمارکرا (${formatSecs(recordingSeconds)})`}
              </span>
            </div>

            {/* Live Playback Bar of User's REAL voice with Studio Equalizer */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={togglePlayEnhancedRealVoice}
                  className="w-11 h-11 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 active:scale-95 flex-shrink-0"
                  title={isPlayingEnhanced ? 'ڕاگرتن' : 'گوێگرتن لە دەنگی ڕاستەقینەی خۆت'}
                >
                  {isPlayingEnhanced ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <div className="flex-1 text-right">
                  <span className="text-xs font-bold text-white block">
                    {fileName ? fileName : 'دەنگی تۆمارکراوی ١٠٠٪ ڕاستەقینەت'}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono" dir="ltr">
                    Authentic Voice Audio • Ready
                  </span>
                </div>

                <button
                  onClick={startRecording}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
                  title="دووبارە تۆمارکردنەوە"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تۆمارکردنەوە</span>
                </button>
              </div>

              {/* Studio Voice Equalizer Controls */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1 text-right">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>قووڵکردنەوە (Bass Warmth):</span>
                    <span className="font-mono text-amber-300">+{bassGain}dB</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={bassGain}
                    onChange={(e) => setBassGain(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded"
                  />
                </div>

                <div className="space-y-1 text-right">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>ڕوونکردنەوەی پیتەکان (Vocal Clarity):</span>
                    <span className="font-mono text-indigo-300">+{trebleGain}dB</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={trebleGain}
                    onChange={(e) => setTrebleGain(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Mic className="w-7 h-7" />
            </div>
            <p className="text-xs text-slate-300">
              کلیك لە دوگمەی مایکرۆفۆن بکە، یان فایلێکی دەنگی خۆت ئەپڵۆد بکە
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>تەواوکردنی تۆمارکردن (Stop)</span>
            </button>
          ) : (
            <>
              <button
                onClick={startRecording}
                disabled={isAnalyzing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Mic className="w-4 h-4" />
                <span>{recordedAudioUrl ? 'دووبارە تۆمارکردنەوە' : 'تۆمارکردن بە مایکرۆفۆن'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>ئەپڵۆدکردنی فایلی دەنگ (MP3/WAV/M4A)</span>
              </button>
            </>
          )}

          {recordedAudioBlob && !isRecording && (
            <button
              onClick={handleAnalyzeAndRecognize}
              disabled={isAnalyzing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>سیستەم خەریکی ناسینەوەی ڕاستەوخۆی دەنگەکەتە...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-emerald-200" />
                  <span>ڕاستەوخۆ دەنگەکەم بناسەوە (Recognize My Voice)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Helpful Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
          <div className="pt-2 border-t border-amber-900/50 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-slate-300">
              دەتوانیت فایلی دەنگت لەسەر مۆبایلەکەت تۆمار بکەیت و لێرە ئەپڵۆدی بکەیت:
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ئەپڵۆدکردنی دەنگ</span>
            </button>
          </div>
        </div>
      )}

      {/* Voice Recognition & Cloned Profile Details */}
      {currentProfile && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-emerald-600/50 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </span>
              <div>
                <h3 className="font-bold text-white text-base">
                  سیستەم بە سەرکەوتوویی دەنگەکەتی ناسییەوە!
                </h3>
                <p className="text-xs text-slate-400">
                  دەنگ و قسەکانت بە وردی لەلایەن زیرەکی دەستکرد شیکرانەوە
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              دەنگت ناسرایەوە
            </span>
          </div>

          {/* Transcribed Kurdish Words */}
          {currentProfile.transcription && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>دەقی وتراوی تۆ بە زمانی کوردی (ڕاستەوخۆ ناسراوە):</span>
              </span>
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed pr-2">
                "{currentProfile.transcription}"
              </p>
            </div>
          )}

          {/* Acoustic Characteristics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">ڕەگەز و تەمەن:</span>
              <span className="font-bold text-white mt-1 block">
                {currentProfile.detectedGender} • {currentProfile.detectedAge}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">تۆن و پەستان:</span>
              <span className="font-bold text-white mt-1 block">{currentProfile.vocalPitch}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">شێوەزاری کوردی:</span>
              <span className="font-bold text-amber-300 mt-1 block">{currentProfile.accentDialect}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">مۆدێلی بنچینەیی AI:</span>
              <span className="font-mono font-bold text-indigo-300 mt-1 block">{currentProfile.matchedVoice}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-400 ml-1">پوختەی شیکاری دەنگەکەت:</span>
            {currentProfile.voiceSummaryKurdish}
          </div>

          {/* TWO CLEAR OPTIONS TO USE YOUR VOICE */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleApplyToStoryDirectly}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                {appliedToStorySuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>دەنگەکەت بۆ کورتەڤیدیۆکە دانرا!</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>بەکارھێنانی ڕاستەوخۆی دەنگەکەم بۆ ڤیدیۆکە (Direct Voice)</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Headphones className="w-4 h-4 text-amber-400" />
              <span>دەتوانیت لە ستۆدیۆی دەنگیشدا دەقی دیکە بە هەمان شێواز دروست بکەیت.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
