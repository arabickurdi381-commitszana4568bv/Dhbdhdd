export interface QuestionnaireQuestion {
  id: string;
  categoryKurdish: string;
  categoryEnglish: string;
  questionKurdish: string;
  questionEnglish: string;
  descriptionKurdish: string;
  options: {
    id: string;
    labelKurdish: string;
    labelEnglish: string;
    detailKurdish?: string;
  }[];
}

export interface ShotTimelineItem {
  timeRange: string;
  shotTitleKurdish: string;
  shotTitleEnglish: string;
  visualDescription: string;
  cameraSpecs: string;
  kurdishDialogue: string;
  dialogueContext: string;
  soundEffects: string;
}

export interface TTSReadyLine {
  id: string;
  speaker: string;
  kurdishText: string;
  suggestedVoice: string;
  suggestedStyle: string;
}

export interface DirectorPromptResult {
  projectTitleKurdish: string;
  projectTitleEnglish: string;
  loglineKurdish: string;
  loglineEnglish: string;
  characterDescription: string;
  masterPromptEnglishWithKurdishDialogue: string;
  shotTimeline: ShotTimelineItem[];
  cinematographyNotes: {
    lighting: string;
    colorGrading: string;
    aspectRatio: string;
    soundtrackMood: string;
  };
  ttsReadyLines: TTSReadyLine[];
  directorTipsKurdish: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
