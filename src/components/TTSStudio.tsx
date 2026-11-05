import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Download,
  Sparkles,
  Radio,
  Sliders,
  Check,
  AlertCircle,
  Wand2,
  Mic,
  RotateCcw,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VoiceRecorder, ClonedVoiceProfile } from './VoiceRecorder';

interface TTSStudioProps {
  initialText?: string;
  initialStyle?: string;
  initialVoice?: string;
  initialRealVoiceUrl?: string | null;
  initialVoiceProfile?: ClonedVoiceProfile | null;
  onApplyRealVoiceToStory?: (audioUrl: string, transcription?: string) => void;
}

export type PersonaType =
  | 'my_voice'
  | 'kurdish_boy'
  | 'badini_girl'
  | 'mentor'
  | 'caring_girl'
  | 'best_friend'
  | 'sick_student';

interface PersonaConfig {
  id: PersonaType;
  nameKurdish: string;
  dialectTag: string;
  badge: string;
  descKurdish: string;
  defaultVoice: string;
  defaultStyle: string;
  defaultText: string;
  sampleLines: string[];
  stylePresets: { id: string; labelKurdish: string; prompt: string }[];
}

const DEFAULT_PERSONAS: PersonaConfig[] = [
  {
    id: 'kurdish_boy',
    nameKurdish: '👦 کوڕی کوردی گەنج (قسەکردنی جوان و ڕوون)',
    dialectTag: 'سۆرانی پاراو',
    badge: 'دەنگی جوان و قۆز',
    descKurdish: 'دەنگێکی پڕ لە وزە، ڕوون و زەلال کە زۆر بە جوانی و ئەدەبەوە بە زمانی کوردی قسە دەکات.',
    defaultVoice: 'Puck',
    defaultStyle: 'Natural, articulate, handsome, and vibrant 20-year-old Kurdish young man speaking warmly, beautifully, and eloquently in standard Kurdish Sorani with smooth cadence',
    defaultText: 'سڵاو هاوڕێ گیان، دەزانم سەرئێشەکەت چەند سەختە، بەڵام بڕوا بکە بە کەمێک پشوودان هەمووی باش دەبێتەوە. تۆ زۆر لەوە بەهێزتریت!',
    sampleLines: [
      'سڵاو هاوڕێ گیان، دەزانم سەرئێشەکەت چەند سەختە، بەڵام بڕوا بکە بە کەمێک پشوودان هەمووی باش دەبێتەوە. تۆ زۆر لەوە بەهێزتریت!',
      'ژیان هێندە دەهێنێت کە پێبکەنی؛ با ئەم شەوانەی تاقیکردنەوە تەندروستیت تێکنەدەن، پەرداخێک ئاو بخۆرەوە و پشوو بدە.',
      'وەک گەنجێکی هاوتەمەنی خۆت پێت دەڵێم: سەرت کەمێک دانێ، گوێ لەم بێدەنگییە بگرە و ئارام بەرەوە.',
      'هەموو ڕۆژێک دەرفەتێکی نوێیە؛ تەنیا کەمێک هێمنی پێویستە بۆ ئەوەی دووبارە بە تین و تاوەوە دەستپێبکەیتەوە.',
    ],
    stylePresets: [
      {
        id: 'boy_charming',
        labelKurdish: '✨ قسەکردنی جوان و سەرنجڕاکێش (Charming & Fluent)',
        prompt: 'Articulate, charismatic, and polite 20-year-old Kurdish youth speaking beautifully and fluently with a melodic, friendly Kurdish accent',
      },
      {
        id: 'boy_warm_encouraging',
        labelKurdish: '💪 هاندەر و وزەبەخش (Inspiring & Warm)',
        prompt: 'Vibrant, warm, and uplifting Kurdish young male voice, inspiring confidence and positivity',
      },
      {
        id: 'boy_calm_late_night',
        labelKurdish: '🌙 کاتژمێری شەوانەی ئارام (Calm Midnight Voice)',
        prompt: 'Intimate, soothing, and softly-spoken young Kurdish gentleman speaking smoothly in a quiet room',
      },
    ],
  },
  {
    id: 'badini_girl',
    nameKurdish: '👧 کچی کورد بە زاراوەی بادینی (Badini Dialect)',
    dialectTag: 'بادینی (دهۆک و زاخۆ)',
    badge: 'شێوەزاری بادینان',
    descKurdish: 'دەنگێکی زۆر نەرم و ڕەسەن بە زاراوەی بادینیی شیرین (دهۆک، زاخۆ و ئامێدی) پڕ لە دڵسۆزی.',
    defaultVoice: 'Zephyr',
    defaultStyle: 'Gentle, authentic, melodious and sweet young Kurdish woman speaking naturally and fluently in the Badini (Kurmanji) dialect of Duhok and Zakho',
    defaultText: 'برا، دەستێ خۆ بدە بەر سەرێ خۆ و کێمەکێ ئارام ببە... پەرداخەکا ئاڤێ ڤەخۆ و بەس ل شاشێ موبایلێ بنێڕە.',
    sampleLines: [
      'برا، دەستێ خۆ بدە بەر سەرێ خۆ و کێمەکێ ئارام ببە... پەرداخەکا ئاڤێ ڤەخۆ و بەس ل شاشێ موبایلێ بنێڕە.',
      'ژ بۆ تە دێ دەرمانەکێ سەرئێشانێ بینم... چاڤێن خۆ بگرە و بێهنا خۆ فراوان بکە، هەمی تشت دێ باش بیت.',
      'سەرێ تە گەلەک دئێشیت؟ وەرە د تاریاتیێ دا پاڵکەوە، ئەڤ نەساخییە ب بێدەنگی و ئاڤێ دێ قەدەغە بیت.',
      'نەخۆش نەکەڤە قوربان، تەندروستیا تە ژ تاقیکرنێن زانکۆیێ گەلەک گرنگترە.',
    ],
    stylePresets: [
      {
        id: 'badini_sweet',
        labelKurdish: '🌸 بادینیی نەرم و میهرەبان (Gentle Badini Comfort)',
        prompt: 'Gentle, affectionate, and melodious young Kurdish woman speaking in genuine Badini dialect with caring maternal sweetness',
      },
      {
        id: 'badini_clear_spoken',
        labelKurdish: '🗣️ بادینیی ڕوون و ئاسایی (Articulate Badini Speech)',
        prompt: 'Clear, articulate, and natural Kurdish female voice speaking in authentic Duhok Badini accent',
      },
      {
        id: 'badini_whisper',
        labelKurdish: '🤫 چپەی هێورکەرەوە بە بادینی (Soothing Badini Whisper)',
        prompt: 'Soft, whispering, empathetic Badini young woman consoling someone with a painful headache',
      },
    ],
  },
  {
    id: 'mentor',
    nameKurdish: '👨‍🏫 مامۆستای پەروەردە و ڕاهێنەر (Educational Mentor)',
    dialectTag: 'سۆرانی ئاسایی',
    badge: 'دەنگی ئاسایی و ڕێبەر',
    descKurdish: 'دەنگێکی سروشتی، ئاسایی و هێمن وەک مامۆستا و ڕاهێنەرێک کە ئامۆژگاری و ڕێنمایی دەبەخشێت.',
    defaultVoice: 'Charon',
    defaultStyle: 'Warm, calm, empathetic, and articulate voice of an educational teacher and mentor speaking in clear, natural Kurdish, giving patient, loving guidance to an exhausted student',
    defaultText: 'کوڕم، ئارام بەوە... کەمێک چاوەکانت دابخە، پەرداخێک ئاو بخۆرەوە و مۆبایلەکەت دابنێ. خوێندن گرنگە، بەڵام تەندروستیت لە هەموو شتێک لەپێشترە.',
    sampleLines: [
      'کوڕم، ئارام بەوە... کەمێک چاوەکانت دابخە، پەرداخێک ئاو بخۆرەوە و مۆبایلەکەت دابنێ. خوێندن گرنگە، بەڵام تەندروستیت لە هەموو شتێک لەپێشترە.',
      'وەک مامۆستایەک پێت دەڵێم: کاتێک مێشکت ماندوو بوو، ئیتر زانیاری وەرناگرێت. ئێستا کاتی پشوودانە نەک خۆسزادان.',
      'هەناسەیەکی قووڵ هەڵمژە. ڕووناکییەکە کز بکە و بیر لە کێشەکان مەکەرەوە، هەموو شتێک بە کات چارەسەر دەبێت.',
      'هەموومان لە تەمەنی تۆدا ئەم فشارەمان بینیوە؛ مەهێڵە دڵەڕاوکێ زاڵ بێت بەسەرتدا، تەندروستیت سەرمایەی سەرەکیتە.',
    ],
    stylePresets: [
      {
        id: 'mentor_gentle',
        labelKurdish: '🎓 ڕێنمایی و دڵنەوایی مامۆستا (Gentle Teacher Guidance)',
        prompt: 'Warm, calm, empathetic, and articulate voice of an educational teacher and mentor speaking in clear, natural Kurdish, giving patient, loving guidance to an exhausted student',
      },
      {
        id: 'mentor_coach',
        labelKurdish: '💡 ئامۆژگاری و هۆشیاری ژیان (Life Coach & Health Wisdom)',
        prompt: 'Authoritative, reassuring, and balanced mentor voice, calmly reminding the young student that health and well-being come before exam stress',
      },
      {
        id: 'mentor_calming',
        labelKurdish: '🧘 هێورکردنەوە و پشوودان (Calming & Mindfulness)',
        prompt: 'Soft, gentle, supportive teacher voice guiding the listener to breathe slowly, drink cold water, and rest in peaceful darkness',
      },
    ],
  },
  {
    id: 'caring_girl',
    nameKurdish: '👩‍⚕️ کچی میهرەبان و دڵسۆز (Caring Nurse / Sister)',
    dialectTag: 'سۆرانی نەرم',
    badge: 'سۆز و دڵنەوایی',
    descKurdish: 'دەنگێکی ئارام و پڕ لە بەزەیی وەک پەرستار، خوشک، یان دایکێک کە دەرمان و فریاگوزاری پێشکەش دەکات.',
    defaultVoice: 'Kore',
    defaultStyle: 'Tender, compassionate, and soothing voice of a young Kurdish female caregiver or loving sister offering medicine and comfort',
    defaultText: 'سەرت بەم قوماشە فێنکە دادەپۆشم، ئەم پەردانەش دادەمەوە تا ڕووناکی چاوت نەئێشێنێت. خەمت نەبێت، هەموو شتێک باش دەبێت.',
    sampleLines: [
      'سەرت بەم قوماشە فێنکە دادەپۆشم، ئەم پەردانەش دادەمەوە تا ڕووناکی چاوت نەئێشێنێت. خەمت نەبێت، هەموو شتێک باش دەبێت.',
      'خەمت نەبێت براکەم، دەرمانەکەم بۆ هێناوی؛ ئارام پاڵکەوە و چاوەکانت دابخە تا ئازارەکە هێور دەبێتەوە.',
      'با دەست بخەمە سەر تەوێڵت، پلەی گەرمیت کەمێک بەرزە؛ کەمێک ئاوی سارد بخۆرەوە.',
    ],
    stylePresets: [
      {
        id: 'nurse_tender',
        labelKurdish: '🩺 دڵسۆزیی پەرستاری و دەرمان (Medical Compassion)',
        prompt: 'Soft, professional, deeply empathetic Kurdish female nurse comforting an acute migraine patient',
      },
      {
        id: 'sisterly_love',
        labelKurdish: '❤️ خۆشەویستی و سۆزی خوشکانە (Sisterly Tenderness)',
        prompt: 'Loving, gentle, and concerned sister comforting her 20-year-old brother in distress',
      },
    ],
  },
  {
    id: 'best_friend',
    nameKurdish: '🤝 هاوڕێی نزیک و ژوور (Roommate & Loyal Friend)',
    dialectTag: 'سۆرانی دۆستانە',
    badge: 'هاوڕێیەتی ڕاستەقینە',
    descKurdish: 'دەنگی هاوڕێیەکی نزیکی زانکۆ کە شەکەتیی هاوڕێکەی پێ قبووڵ ناکرێت و هاوکاری دەکات.',
    defaultVoice: 'Fenrir',
    defaultStyle: 'Loyal, concerned, and down-to-earth 20-year-old university roommate speaking in conversational Kurdish to take care of his sick friend',
    defaultText: 'برای خۆم، دەمبینی چەند لە ئازاردایت نەمتوانی بێدەنگ بم، وا دەرمان و ئاوم بۆ هێنایت. ئیتر شاشەکان خامۆش بکە!',
    sampleLines: [
      'برای خۆم، دەمبینی چەند لە ئازاردایت نەمتوانی بێدەنگ بم، وا دەرمان و ئاوم بۆ هێنایت. ئیتر شاشەکان خامۆش بکە!',
      'ئیتر لاپتۆپ و دەفتەرەکان دابخە! ئەمشەو هیچ مەخوێنە، سبەینێ پێکەوە پێداچوونەوە بۆ تاقیکردنەوەکە دەکەین.',
      'هەستە بڕۆ سەر جێگاکەت براکەم، من هەموو شتێک ڕێکدەخەم و گڵۆپەکان دەکوژێنمەوە.',
    ],
    stylePresets: [
      {
        id: 'friend_concerned',
        labelKurdish: '🫂 نیگەرانی و برایەتی (Loyal & Brotherly)',
        prompt: 'Brotherly, earnest, and deeply caring Kurdish young man helping his best friend',
      },
      {
        id: 'friend_chill',
        labelKurdish: '🌿 هێمنکردنەوەی هاوڕێیانە (Calm Roommate)',
        prompt: 'Easygoing, warm, and supportive college roommate talking softly in the dorm',
      },
    ],
  },
  {
    id: 'sick_student',
    nameKurdish: '🧑‍🎓 گەنجە ٢٠ ساڵانەکە (Sick 20-Year-Old Student)',
    dialectTag: 'سۆرانی دراماتیک',
    badge: 'ئازار و کڕوزانەوە',
    descKurdish: 'دەنگێکی پڕ لە ئازار و تەنگەتاوی گەنجێک کە بەدەست سەرئێشە و مایگرەینی سەختەوە دەناڵێنێت.',
    defaultVoice: 'Fenrir',
    defaultStyle: 'Pained, agonizing whisper of a 20-year-old Kurdish young man holding his throbbing head, groaning in despair',
    defaultText: 'ئای خوایە... سەرم خەریکە دەتەقێت، چی بکەم؟ هیچ دەرمانێک لێرە نییە!',
    sampleLines: [
      'ئای خوایە... سەرم خەریکە دەتەقێت، چی بکەم؟ هیچ دەرمانێک لێرە نییە!',
      'دایە گیان کوا دەرمانەکان؟ ئەی هاوار تەحەممولم نەماوە، بۆچی ئاوام لێهات؟',
      'پێویستە کەمێک ئاو بخۆمەوە... چاوەکانم لێڵ بوون، تەنیا کەمێک تاریکی و بێدەنگیم دەوێت.',
      'ئەم شاشەیە چاوم دەسووتێنێت... ئیتر ناتوانم تەماشای بکەم، سەرم وەک چەکوش لێدەدات.',
    ],
    stylePresets: [
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
    ],
  },
];

const VOICES = [
  {
    id: 'Puck',
    name: 'Puck',
    descKurdish: 'دەنگێکی قۆز، زیندوو و ڕوون (پێشنیاز بۆ کوڕی گەنج بە قسەکردنی جوان)',
    gender: 'نێر (Male)',
    tag: 'کوڕی جوان و ڕوون',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    descKurdish: 'دەنگێکی شیرین و مۆسیقی (پێشنیاز بۆ کچی کورد بە زاراوەی بادینی)',
    gender: 'مێ (Female)',
    tag: 'کچی بادینی',
  },
  {
    id: 'Kore',
    name: 'Kore',
    descKurdish: 'دەنگێکی نەرم، میهرەبان و ئارامبەخش (بۆ کچی دڵسۆز و پەرستار)',
    gender: 'مێ (Female)',
    tag: 'کچی میهرەبان',
  },
  {
    id: 'Charon',
    name: 'Charon',
    descKurdish: 'دەنگێکی ئاسایی، قووڵ و سەنگین (بۆ مامۆستای پەروەردە و ڕاهێنەر)',
    gender: 'نێر (Male)',
    tag: 'مامۆستای پەروەردە',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    descKurdish: 'دەنگێکی پڕ لە هەست و پیاوانە (بۆ گەنجە نەخۆشەکە یان هاوڕێی نزیک)',
    gender: 'نێر (Male)',
    tag: 'گەنجی ٢٠ ساڵان',
  },
];

export const TTSStudio: React.FC<TTSStudioProps> = ({
  initialText,
  initialStyle,
  initialVoice,
  initialRealVoiceUrl,
  initialVoiceProfile,
  onApplyRealVoiceToStory,
}) => {
  // Voice clone state initialized from props if provided
  const [clonedProfile, setClonedProfile] = useState<ClonedVoiceProfile | null>(() => {
    if (initialVoiceProfile) return initialVoiceProfile;
    if (initialRealVoiceUrl) {
      return {
        detectedGender: 'نێر (Male)',
        detectedAge: 'گەنج (٢٠ ساڵ)',
        vocalPitch: 'سروشتی و هاوسەنگ',
        accentDialect: 'سۆرانی پاراو',
        matchedVoice: 'Puck',
        voiceStylePrompt: 'Natural, articulate, handsome 20-year-old Kurdish youth voice with warm undertones',
        voiceSummaryKurdish: 'دەنگی ڕاستەقینەی خۆت لە سیستەمەکەدا ئامادەیە.',
        recordedAudioUrl: initialRealVoiceUrl,
      };
    }
    return null;
  });

  const [showRecorder, setShowRecorder] = useState(false);
  const [myVoicePlayMode, setMyVoicePlayMode] = useState<'real_voice' | 'ai_model'>('real_voice');

  // Combine dynamic personas with cloned persona if present
  const personas = useMemo(() => {
    if (!clonedProfile) return DEFAULT_PERSONAS;
    const myClonedPersona: PersonaConfig = {
      id: 'my_voice',
      nameKurdish: '🎙️ دەنگی تایبەتیی خۆت (Direct & Clone)',
      dialectTag: clonedProfile.accentDialect || 'دەنگی تایبەت',
      badge: '١٠٠٪ دەنگی خۆت + AI',
      descKurdish: clonedProfile.voiceSummaryKurdish || 'دەنگی ڕاستەقینەی خۆت بە شیکردنەوەی وردی زیرەکی دەستکرد.',
      defaultVoice: clonedProfile.matchedVoice || 'Puck',
      defaultStyle: clonedProfile.voiceStylePrompt || 'Natural personal Kurdish voice with warmth',
      defaultText: clonedProfile.transcription || 'سڵاو! ئەمە دەنگی تایبەتیی خۆمە کە لەناو سایتەکەدا تۆمارم کرد.',
      sampleLines: [
        clonedProfile.transcription || 'سڵاو! ئەمە دەنگی تایبەتیی خۆمە کە لەناو سایتەکەدا تۆمارم کرد.',
        'ئای خوایە گیان... سەرم خەریکە دەتەقێت لە تاو ئازار، چی بکەم؟',
        'برا گیان، ئارام بەوە و سەرئێشەکەت فەرامۆش بکە... کەمێک پشوو بدە و ئاو بخۆرەوە.',
      ],
      stylePresets: [
        {
          id: 'my_voice_natural',
          labelKurdish: '🎙️ دەنگی سروشتیی خۆم (Natural Cloned Voice)',
          prompt: clonedProfile.voiceStylePrompt,
        },
        {
          id: 'my_voice_warm',
          labelKurdish: '❤️ دەنگی بەسۆز و هێمن (Warm Cloned Delivery)',
          prompt: `${clonedProfile.voiceStylePrompt}, speaking with deep warmth, empathy and gentle comforting pace`,
        },
      ],
    };
    return [myClonedPersona, ...DEFAULT_PERSONAS];
  }, [clonedProfile]);

  const [activePersona, setActivePersona] = useState<PersonaType>(() => {
    return (initialVoiceProfile || initialRealVoiceUrl) ? 'my_voice' : 'kurdish_boy';
  });
  const currentPersonaObj = personas.find((p) => p.id === activePersona) || personas[0];

  const [text, setText] = useState(
    initialText || currentPersonaObj.defaultText
  );
  const [selectedVoice, setSelectedVoice] = useState(initialVoice || currentPersonaObj.defaultVoice);
  const [selectedStyle, setSelectedStyle] = useState(
    initialStyle || currentPersonaObj.defaultStyle
  );
  const [customStyle, setCustomStyle] = useState('');
  const [isCustomStyleActive, setIsCustomStyleActive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(() => {
    if (activePersona === 'my_voice' && clonedProfile?.recordedAudioUrl) {
      return clonedProfile.recordedAudioUrl;
    }
    return null;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCachedHit, setIsCachedHit] = useState(false);
  const [chunksCount, setChunksCount] = useState<number | null>(null);

  // Audio Playback State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Switch persona handler
  const handleSwitchPersona = (personaId: PersonaType) => {
    setActivePersona(personaId);
    const persona = personas.find((p) => p.id === personaId)!;
    setText(persona.defaultText);
    setSelectedVoice(persona.defaultVoice);
    setSelectedStyle(persona.defaultStyle);
    setIsCustomStyleActive(false);
    setIsCachedHit(false);
    setChunksCount(null);

    if (personaId === 'my_voice' && clonedProfile?.recordedAudioUrl) {
      setAudioUrl(clonedProfile.recordedAudioUrl);
      setMyVoicePlayMode('real_voice');
    }
  };

  // Called when user finishes recording and cloning voice
  const handleVoiceCloned = (profile: ClonedVoiceProfile) => {
    setClonedProfile(profile);
    setActivePersona('my_voice');
    if (profile.recordedAudioUrl) {
      setAudioUrl(profile.recordedAudioUrl);
      setMyVoicePlayMode('real_voice');
    }
    if (profile.transcription) {
      setText(profile.transcription);
    } else {
      setText('سڵاو! ئەمە دەنگی تایبەتیی خۆمە کە لەناو سایتەکەدا تۆمارم کرد.');
    }
    setSelectedVoice(profile.matchedVoice || 'Puck');
    setSelectedStyle(profile.voiceStylePrompt || 'Natural personal Kurdish voice');
    setIsCustomStyleActive(false);
    setShowRecorder(false);
  };

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

  // Fallback to Web Speech API for guaranteed unlimited audio
  const playWebSpeechFallback = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      setErrorMessage('وێبگەڕەکەت پشتگیری لە Web Speech ناکات.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ar-IQ'; // Closest browser synthesizer voice
    utterance.rate = playbackSpeed;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleGenerateTTS = async () => {
    if (!text.trim()) {
      setErrorMessage('تکایە دەقێکی کوردی بنووسە.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsCachedHit(false);
    setChunksCount(null);

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
          style: activeStylePrompt || currentPersonaObj.defaultStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'هەڵەیەک ڕوویدا لە دروستکردنی دەنگدا.');
      }

      const wavBlobUrl = `data:audio/wav;base64,${data.audioBase64}`;
      setAudioUrl(wavBlobUrl);
      setIsCachedHit(Boolean(data.cached));
      if (data.chunksCount) setChunksCount(data.chunksCount);

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
      setErrorMessage(err.message || 'پەیوەندی لەگەڵ مۆدێلی دەنگ سەرکەوتوو نەبوو.');
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
    a.download = `kurdish_tts_${activePersona}_${Date.now()}.wav`;
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
      <div className="rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/60 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span>Gemini 3.8 Flash TTS Voice Studio</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">دەنگی خۆت + ٦ کارەکتەر</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-bold">Unlimited Mode</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              ستۆدیۆی دەنگ: تۆمارکردنی دەنگی خۆت و خوێندنەوە بە شێوازی تۆ
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
              دەتوانیت <strong className="text-rose-400">دەنگی خۆت لەناو سایتەکە تۆمار بکەیت</strong> تا زیرەکی دەستکرد شێوازی قسەکردنت کلۆن بکات، یاخود یەکێک لە دەنگە ئامادەکراوەکانی کوڕی گەنج، کچی بادینی، یان مامۆستای پەروەردە هەڵبژێریت.
            </p>
          </div>

          {/* Primary Record Button in banner */}
          <button
            onClick={() => setShowRecorder(!showRecorder)}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xl shadow-rose-600/30 transition-all active:scale-95"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>{showRecorder ? 'داخستنی تۆمارکەر' : clonedProfile ? 'دووبارە تۆمارکردنەوەی دەنگم' : 'تۆمارکردنی دەنگی خۆم لەناو سایتەکە'}</span>
            {showRecorder ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Persona Selection Cards */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {personas.map((p) => {
            const isCurrent = activePersona === p.id;
            const isMyVoice = p.id === 'my_voice';
            return (
              <button
                key={p.id}
                onClick={() => handleSwitchPersona(p.id)}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between active:scale-95 ${
                  isCurrent
                    ? isMyVoice
                      ? 'bg-gradient-to-b from-rose-950/80 to-slate-900 border-rose-400 text-white ring-1 ring-rose-400 shadow-lg shadow-rose-950/50'
                      : 'bg-gradient-to-b from-indigo-900/60 to-slate-900 border-amber-400 text-white ring-1 ring-amber-400 shadow-lg shadow-indigo-950/40'
                    : isMyVoice
                    ? 'bg-rose-950/30 hover:bg-rose-950/50 border-rose-800/80 text-rose-200'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isMyVoice ? 'bg-rose-900 text-rose-200' : 'bg-slate-900 text-amber-300'
                    }`}>
                      {p.dialectTag}
                    </span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <h4 className="font-bold text-xs leading-snug">
                    {p.nameKurdish}
                  </h4>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 truncate">
                  {p.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* In-Browser Voice Recording Component */}
      {showRecorder && (
        <VoiceRecorder
          onVoiceCloned={handleVoiceCloned}
          currentProfile={clonedProfile}
          onApplyRealVoiceToStory={onApplyRealVoiceToStory}
        />
      )}

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Input & Styles) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Kurdish Text Input */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-sm text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>
                  دەقی خوێندنەوە بۆ: <span className="text-amber-300">{currentPersonaObj.nameKurdish}</span>
                </span>
              </label>
              <span className="text-[11px] text-slate-400">{text.length} پیت</span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="دەقی کوردی (سۆرانی یان بادینی) لێرە بنووسە..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 text-sm sm:text-base leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-y"
            />

            {/* Quick Sample Chips for this Persona */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>نموونەی وتەکان:</span>
              </span>
              {currentPersonaObj.sampleLines.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setText(sample)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-right truncate max-w-xs active:scale-95"
                  title={sample}
                >
                  "{sample.slice(0, 34)}..."
                </button>
              ))}
            </div>
          </div>

          {/* Voice Presets */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>دەنگە مۆدێلەکانی Gemini (Prebuilt Voice Models)</span>
              </h3>
              <span className="text-xs text-slate-400">
                Voice: <strong className="text-indigo-300 font-mono">{selectedVoice}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VOICES.map((v) => {
                const isSelected = selectedVoice === v.id;
                const isRecommendedForCurrent = v.id === currentPersonaObj.defaultVoice;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={`text-right p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/80 border-amber-400 text-white shadow-md shadow-indigo-500/20 ring-1 ring-amber-400'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm font-mono">{v.name}</span>
                        {isRecommendedForCurrent && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            هاوتای ئەم کارەکتەرە
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {v.gender}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-snug">
                      {v.descKurdish}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acting & Emotional Style for this Persona */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <span>شێوازی دەربڕین و تۆنی دەنگ (Voice Style Prompt)</span>
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
                {currentPersonaObj.stylePresets.map((st) => {
                  const isSelected = selectedStyle === st.prompt;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStyle(st.prompt)}
                      className={`text-right p-3 rounded-xl border transition-all text-xs ${
                        isSelected
                          ? 'bg-amber-950/50 border-amber-500 text-white font-bold ring-1 ring-amber-500'
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
                  placeholder="e.g. Natural personal Kurdish voice with warmth and clarity..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                  dir="ltr"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ڕێنمایی دەنگی بە زمانی ئینگلیزی بۆ مۆدێلی Gemini 3.8 Flash TTS.
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
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>پەخشی دەنگی: {currentPersonaObj.nameKurdish}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {selectedVoice} • 24kHz WAV
                </span>
              </div>

              {/* Mode switch for my personal voice */}
              {activePersona === 'my_voice' && (
                <div className="mb-4 p-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setMyVoicePlayMode('real_voice');
                      if (clonedProfile?.recordedAudioUrl) {
                        setAudioUrl(clonedProfile.recordedAudioUrl);
                      }
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      myVoicePlayMode === 'real_voice'
                        ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>دەنگی ١٠٠٪ ڕاستەقینەی خۆت (Direct Voice)</span>
                  </button>

                  <button
                    onClick={() => setMyVoicePlayMode('ai_model')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      myVoicePlayMode === 'ai_model'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>مۆدێلی Gemini TTS بە شێوازی تۆ</span>
                  </button>
                </div>
              )}

              {/* Waveform / Visualizer Animation */}
              <div className="h-28 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center gap-1.5 px-6 relative overflow-hidden">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-7 h-7 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    <span className="text-xs text-amber-300 font-medium animate-pulse">
                      Gemini 3.8 Flash TTS خەریکی دروستکردنی دەنگی کوردییە...
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
                              ? activePersona === 'my_voice'
                                ? 'bg-gradient-to-t from-rose-500 to-amber-300'
                                : activePersona === 'badini_girl'
                                ? 'bg-gradient-to-t from-pink-500 to-rose-300'
                                : 'bg-gradient-to-t from-amber-500 to-indigo-400'
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
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
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
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
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
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}

              {/* Unlimited Cache & Multi-Chunk Status Indicator */}
              {isCachedHit && (
                <div className="mt-3 py-1.5 px-3 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>لە کاشی خێراوە پەخشکرا (Instant Cache - بێ کۆتا)</span>
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded">Unlimited</span>
                </div>
              )}

              {chunksCount && chunksCount > 1 && (
                <div className="mt-2 py-1 px-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-[11px] flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-indigo-400" />
                  <span>دروستکردنی دەقی درێژ: {chunksCount} بەشی دەنگ پێکەوە لکێنران (Auto-Concatenated WAV)</span>
                </div>
              )}

              {/* Error Alert with Web Speech Fallback */}
              {errorMessage && (
                <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>

                  <div className="pt-2 border-t border-red-900/50 flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">
                      پەخشکردن بەبێ ئینتەرنێت و بێ کۆتا:
                    </span>
                    <button
                      onClick={() => playWebSpeechFallback(text)}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>پەخشی دەنگی وێبگەڕ (Web Speech Fallback)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Generate Button or Direct Real Voice Buttons */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              {activePersona === 'my_voice' && myVoicePlayMode === 'real_voice' ? (
                <div className="space-y-3">
                  <button
                    onClick={togglePlayPause}
                    disabled={!audioUrl}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    <span>{isPlaying ? 'ڕاگرتنی پەخش' : 'پەخشکردنی دەنگی ڕاستەقینەی خۆت (Play Real Voice)'}</span>
                  </button>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    {onApplyRealVoiceToStory && clonedProfile?.recordedAudioUrl && (
                      <button
                        onClick={() => onApplyRealVoiceToStory(clonedProfile.recordedAudioUrl!, clonedProfile.transcription)}
                        className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>دانانی ئەم دەنگەم بۆ کارەکتەر لە کورتەڤیدیۆکەدا</span>
                      </button>
                    )}

                    <button
                      onClick={() => setShowRecorder(true)}
                      className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>تۆمارکردنەوەی دەنگم</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGenerateTTS}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>خەریکی بەرهەمهێنانی دەنگە بە شێوازی تۆ...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      <span>بەرهەمهێنانی دەنگ بە {currentPersonaObj.nameKurdish}</span>
                    </>
                  )}
                </button>
              )}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>دۆخی ئانلیمیتد چالاکە: دەنگی ڕاستەقینەت + کاشکردنی خێرای Gemini TTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
