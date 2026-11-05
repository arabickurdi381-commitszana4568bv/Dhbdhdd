import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { QuestionnaireSection } from './components/QuestionnaireSection';
import { PromptViewer } from './components/PromptViewer';
import { TTSStudio } from './components/TTSStudio';
import { DirectorChat } from './components/DirectorChat';
import { PRESET_PACKAGES } from './data/questionnaire';
import { DEFAULT_PROMPT_RESULT } from './data/defaultPrompt';
import { DirectorPromptResult } from './types';
import { Sparkles, Film, Volume2, Clapperboard, CheckCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'questionnaire' | 'prompt' | 'tts' | 'chat'>('questionnaire');
  const [answers, setAnswers] = useState<Record<string, string>>(PRESET_PACKAGES[0].answers);
  const [customNotes, setCustomNotes] = useState('');
  const [promptResult, setPromptResult] = useState<DirectorPromptResult>(DEFAULT_PROMPT_RESULT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected TTS line for playback
  const [selectedTTSData, setSelectedTTSData] = useState<{
    text: string;
    style?: string;
    voice?: string;
  }>({
    text: DEFAULT_PROMPT_RESULT.ttsReadyLines[0].kurdishText,
    style: DEFAULT_PROMPT_RESULT.ttsReadyLines[0].suggestedStyle,
    voice: DEFAULT_PROMPT_RESULT.ttsReadyLines[0].suggestedVoice,
  });

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/director/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          customNotes: customNotes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'هەڵەیەک ڕوویدا لە دروستکردنی پرۆمپتەکەدا.');
      }

      setPromptResult(data.data);
      if (data.data.ttsReadyLines && data.data.ttsReadyLines.length > 0) {
        setSelectedTTSData({
          text: data.data.ttsReadyLines[0].kurdishText,
          style: data.data.ttsReadyLines[0].suggestedStyle,
          voice: data.data.ttsReadyLines[0].suggestedVoice,
        });
      }
      setActiveTab('prompt');
    } catch (err: any) {
      console.error('Error generating prompt:', err);
      setErrorMessage(err.message || 'پەیوەندی لەگەڵ Gemini 3.8 Flash سەرکەوتوو نەبوو.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayTTSLine = (text: string, style?: string, voice?: string) => {
    setSelectedTTSData({
      text,
      style: style || 'Pained 20-year-old Kurdish youth suffering from severe headache',
      voice: voice || 'Fenrir',
    });
    setActiveTab('tts');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasGeneratedPrompt={true}
        isPlayingAnyAudio={false}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-red-400 hover:text-white px-2 py-1 rounded bg-red-900/40"
            >
              داخستن
            </button>
          </div>
        )}

        {/* Tab 1: Questionnaire & Consultation */}
        {activeTab === 'questionnaire' && (
          <QuestionnaireSection
            answers={answers}
            setAnswers={setAnswers}
            customNotes={customNotes}
            setCustomNotes={setCustomNotes}
            onGenerate={handleGeneratePrompt}
            isGenerating={isGenerating}
          />
        )}

        {/* Tab 2: Generated Prompt & Screenplay */}
        {activeTab === 'prompt' && (
          <PromptViewer
            promptResult={promptResult}
            onPlayTTSLine={handlePlayTTSLine}
            onOpenTTSStudio={() => setActiveTab('tts')}
          />
        )}

        {/* Tab 3: Dedicated TTS Voice Studio */}
        {activeTab === 'tts' && (
          <TTSStudio
            initialText={selectedTTSData.text}
            initialStyle={selectedTTSData.style}
            initialVoice={selectedTTSData.voice}
          />
        )}

        {/* Tab 4: Direct Consultation with AI Director */}
        {activeTab === 'chat' && (
          <DirectorChat currentAnswers={answers} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Clapperboard className="w-4 h-4 text-amber-500" />
            <span>Kurdish Video Director & TTS Studio</span>
            <span>•</span>
            <span>ماوە: ٣٠ چرکە بۆ گەنجێکی ٢٠ ساڵانی کورد</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]" dir="ltr">
            <span>Powered by Gemini 3.8 Flash & Gemini 3.8 Flash TTS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
