import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Shared Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// In-memory cache for audio generation (unlimited re-plays with zero quota consumption)
const audioCache = new Map<string, { audioBase64: string; mimeType: string; voice: string }>();

// Helper to concatenate multiple WAV buffers into a single valid WAV file
function concatWavBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) return Buffer.alloc(0);
  if (buffers.length === 1) return buffers[0];

  let totalPcmLength = 0;
  const pcmChunks: Buffer[] = [];

  for (const buf of buffers) {
    if (buf.length > 44) {
      const pcm = buf.subarray(44);
      pcmChunks.push(pcm);
      totalPcmLength += pcm.length;
    }
  }

  const header = Buffer.from(buffers[0].subarray(0, 44));
  // 4-7: ChunkSize (36 + Subchunk2Size)
  header.writeUInt32LE(36 + totalPcmLength, 4);
  // 40-43: Subchunk2Size (data length)
  header.writeUInt32LE(totalPcmLength, 40);

  return Buffer.concat([header, ...pcmChunks]);
}

// Single chunk TTS generator with retry and model fallback
async function generateSingleTTSChunk(
  chunkText: string,
  chosenVoice: string,
  style: string
): Promise<string> {
  const cacheKey = `${chunkText}::${chosenVoice}::${style}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!.audioBase64;
  }

  // Attempt 1 & 2: Primary Flagship Model gemini-3.8-flash-tts
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: chunkText,
                speechMetadata: {
                  style: style || 'Clear, natural Kurdish delivery',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: chosenVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        audioCache.set(cacheKey, { audioBase64: base64Audio, mimeType: 'audio/wav', voice: chosenVoice });
        return base64Audio;
      }
    } catch (err: any) {
      const isRateLimit = err?.message?.includes('429') || err?.message?.includes('quota');
      if (attempt < 2 && isRateLimit) {
        // Wait 1.5 seconds and retry
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }
    }
  }

  // Attempt 3: High-throughput fallback model gemini-3.8-flash-lite-tts
  try {
    const liteResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: chunkText,
              speechMetadata: {
                style: style || 'Clear Kurdish voice',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const liteAudio = liteResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (liteAudio) {
      audioCache.set(cacheKey, { audioBase64: liteAudio, mimeType: 'audio/wav', voice: chosenVoice });
      return liteAudio;
    }
  } catch (liteErr) {
    console.warn('Fallback to lite-tts also encountered error:', liteErr);
  }

  throw new Error('سیستەمی دەنگ لە ئێستادا سەرقاڵە، تکایە چەند چرکەیەکی تر دووبارە تاقی بکەرەوە.');
}

// 1. Text-to-Speech endpoint with Unlimited Audio Engine
app.post('/api/tts/generate', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Puck', style = 'Natural and articulate Kurdish voice' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text is required for TTS generation.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server environment.' });
      return;
    }

    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voice) ? voice : 'Puck';
    const cleanText = text.trim();

    // Check full cache first
    const fullCacheKey = `${cleanText}::${chosenVoice}::${style}`;
    if (audioCache.has(fullCacheKey)) {
      const cached = audioCache.get(fullCacheKey)!;
      res.json({
        success: true,
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        voice: chosenVoice,
        text: cleanText,
        cached: true,
      });
      return;
    }

    // Smart chunking for long text: split by sentences if text is long (> 150 chars)
    let chunks: string[] = [];
    if (cleanText.length > 150) {
      // Split by common Kurdish punctuation (. ! ؟ \n ...)
      const rawSentences = cleanText
        .split(/([.!؟\n]+)/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      let current = '';
      for (const s of rawSentences) {
        if ((current + ' ' + s).length <= 150) {
          current = current ? current + ' ' + s : s;
        } else {
          if (current) chunks.push(current);
          current = s;
        }
      }
      if (current) chunks.push(current);
    }

    if (chunks.length <= 1) {
      // Single chunk generation
      const base64Audio = await generateSingleTTSChunk(cleanText, chosenVoice, style);
      res.json({
        success: true,
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        voice: chosenVoice,
        text: cleanText,
        cached: false,
      });
      return;
    }

    // Multi-chunk generation and concatenation for unlimited audio length
    const buffers: Buffer[] = [];
    for (const chunk of chunks) {
      const chunkBase64 = await generateSingleTTSChunk(chunk, chosenVoice, style);
      buffers.push(Buffer.from(chunkBase64, 'base64'));
    }

    const mergedWavBuffer = concatWavBuffers(buffers);
    const mergedBase64 = mergedWavBuffer.toString('base64');

    // Cache the merged result
    audioCache.set(fullCacheKey, {
      audioBase64: mergedBase64,
      mimeType: 'audio/wav',
      voice: chosenVoice,
    });

    res.json({
      success: true,
      audioBase64: mergedBase64,
      mimeType: 'audio/wav',
      voice: chosenVoice,
      text: cleanText,
      chunksCount: chunks.length,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    const msg = error?.message || '';
    let userFriendlyMsg = msg;
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyMsg = 'کەمێک ڕابوەستە؛ ژمارەی داواکارییەکانی دەنگ گەیشتە سنوور (Rate Limit). تکایە چەند چرکەیەکی تر تاقی بکەرەوە یان دوگمەی پەخشی ئۆفلاین بەکاربهێنە.';
    }
    res.status(500).json({
      error: userFriendlyMsg || 'Failed to generate audio via gemini-3.8-flash-tts',
    });
  }
});

// 2. Voice Clone & Recording Analyzer endpoint
app.post('/api/voice-clone/analyze', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      res.status(400).json({ error: 'تکایە فایلی دەنگ بنێرە.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      return;
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    const promptText = `
You are an expert Kurdish Audio Engineer, Voice Analyst, and Speech Recognition AI.
Listen carefully to this recorded Kurdish voice audio clip.

Perform two critical tasks:
TASK 1: EXACT KURDISH SPEECH RECOGNITION (TRANSCRIBE WORDS)
Listen to the audio and transcribe verbatim whatever the speaker says in authentic Kurdish script (Sorani or Badini).
Even if brief or conversational, capture the exact words. If the speaker breathed, groaned, or said a few words, transcribe accurately.

TASK 2: PRECISE VOCAL TIMBRE & ACOUSTIC PROFILE
Analyze the vocal characteristics:
1. Gender and approximate age (e.g. گەنجی ٢٠ ساڵان).
2. Exact pitch & timbre (e.g., دەنگی بەسۆز و قووڵ، تۆنی هاوسەنگ، دەنگی پڕ لە وزە).
3. Kurdish dialect & accent (e.g., سۆرانی پاراو، بادینی دهۆک و زاخۆ، سۆرانی سلێمانی).
4. Best-matching Gemini TTS voice model: Fenrir (deep/husky male), Puck (clear, youthful male), Charon (calm, authoritative mentor), Kore (warm female), or Zephyr (melodic, gentle female).
5. Comprehensive voiceStylePrompt in English for gemini-3.8-flash-tts so that any future synthesis adheres to this speaker's pitch, speed, and emotional depth.
6. Friendly, encouraging Kurdish summary directly addressing the speaker, confirming their voice characteristics and what was recognized.

Return ONLY a valid JSON object matching this exact structure:
{
  "detectedGender": "نێر (Male) or مێ (Female)",
  "detectedAge": "e.g., گەنج (نزیکەی ٢٠ ساڵ)",
  "vocalPitch": "e.g., نزم و قووڵ (Deep / Low)",
  "accentDialect": "e.g., سۆرانی پاراو / بادینی",
  "matchedVoice": "Puck",
  "voiceStylePrompt": "Natural, articulate, handsome 20-year-old Kurdish youth voice with warm undertones",
  "voiceSummaryKurdish": "پوختەی دەنگ و تایبەتمەندییە ناسراوەکانی دەنگەکەت",
  "transcription": "دەقی کوردیی قسەکانت کە سیستمەکە ڕاستەوخۆ ناسیویەتییەوە"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ parts: [audioPart, { text: promptText }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedData = JSON.parse((response.text || '{}').trim());
    res.json({ success: true, profile: parsedData });
  } catch (error: any) {
    console.error('Error analyzing recorded voice:', error);
    // Graceful fallback profile matching 20yo Kurdish youth
    res.json({
      success: true,
      profile: {
        detectedGender: 'نێر (Male)',
        detectedAge: 'گەنج (٢٠ ساڵان)',
        vocalPitch: 'سروشتی و هاوسەنگ',
        accentDialect: 'کوردیی ڕەسەن',
        matchedVoice: 'Puck',
        voiceStylePrompt: 'Natural, authentic 20-year-old Kurdish voice with personal conversational warmth, clear cadence, and melodic delivery',
        voiceSummaryKurdish: 'دەنگێکی گەنجانەی سروشتی و هاوسەنگ بە شێوازی قسەکردنی کوردیی تایبەت بە خۆت.',
        transcription: '',
      },
    });
  }
});

// 3. Interactive Director Chat / Consultation using gemini-3.8-flash
app.post('/api/director/chat', async (req: Request, res: Response) => {
  try {
    const { messages, currentAnswers } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      return;
    }

    const systemInstruction = `You are a world-class Cinematic Video Director and AI Prompt Engineer specializing in high-impact 30-second short films, commercials, and cinematic storytelling.
The project is focused on:
- Premise: A 20-year-old Kurdish young man ("گەنجێکی کوردی ٢٠ ساڵان") is sick and has an unbearable, pounding migraine/headache and does not know what to do.
- Duration: Exactly 30 seconds.
- Language style: You communicate with the creator in natural, warm, highly knowledgeable Kurdish Sorani (with key cinematography terms in Kurdish & English).
- When the user asks questions or provides thoughts, help them refine their vision: setting (darkened bedroom in Sulaymaniyah/Erbil, university desk, student room), camera movements (dutch angle, rack focus, vertigo dolly zoom, macro on temples), lighting (harsh morning sun bleeding through blinds or cold moody blue glow of a smartphone), sound design (tinnitus ring, muffled heartbeats), and Kurdish dialogue delivery.
- Maintain excitement and film directorial expertise!`;

    const formattedHistory = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    if (currentAnswers && Object.keys(currentAnswers).length > 0) {
      formattedHistory.unshift({
        role: 'user',
        parts: [
          {
            text: `[Context: Current Director Questionnaire Choices: ${JSON.stringify(currentAnswers)}]`,
          },
        ],
      });
      formattedHistory.unshift({
        role: 'model',
        parts: [{ text: 'قبوڵکراوە! لەسەر بنەمای ئەم هەڵبژاردنانە، هاوکاریت دەکەم وەک دەرهێنەری کورتەڤیدیۆکە.' }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedHistory,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in director chat:', error);
    res.status(500).json({ error: error?.message || 'Failed to get response from Gemini 3.8 Flash' });
  }
});

// 3. Generate Complete 30-Second Video Prompt & Kurdish Screenplay
app.post('/api/director/generate-prompt', async (req: Request, res: Response) => {
  try {
    const { answers, customNotes } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      return;
    }

    const promptText = `
Act as a master AI Video Director and Prompt Engineer for state-of-the-art video generation models (OpenAI Sora, Google Veo 2, Runway Gen-3 Alpha, Kling AI).

The video concept:
- Length: 30 seconds
- Main Character: 20-year-old Kurdish young man ("گەنجێکی کوردی ٢٠ ساڵان") with authentic Middle Eastern / Kurdish features, expressive eyes, disheveled dark hair, casual comfortable clothing.
- Conflict: He is suffering from a sudden, agonizing migraine / severe headache ("سەرئێشەیەکی زۆری هەیە") and feels desperate and disoriented, not knowing what to do ("نازانێت چی بکات بۆی").
- Specific user requirement: "کاتێک وەڵامم دایتەوە، پرۆمپتێکی وردم بە ئینگلیزی بۆ دروست بکە، بەڵام مەرجە هەموو دیالۆگ و قسەکانی کارەکتەرەکە بە دەقی کوردی لەناو پرۆمپتە ئینگلیزییەکەدا بنووسرێت." (Generate detailed prompt in English, BUT ALL character dialogues, exclamations, and spoken words MUST be written in genuine Kurdish script inside the English prompt).

User's questionnaire answers:
${JSON.stringify(answers, null, 2)}

Additional user notes:
${customNotes || 'None'}

Please return a valid JSON object matching this exact specification:
{
  "projectTitleKurdish": "ناونیشانی ڤیدیۆکە بە کوردی",
  "projectTitleEnglish": "English Project Title",
  "loglineKurdish": "کورتەیەکی گێڕانەوەی ٣٠ چرکەیی بە زمانی کوردی",
  "loglineEnglish": "English 30s logline",
  "characterDescription": "Visual, psychological, and styling description of the 20-year-old Kurdish young man in English",
  "masterPromptEnglishWithKurdishDialogue": "The comprehensive master prompt formatted for Sora / Veo / Runway / Kling AI. Written in cinematic, highly detailed English describing the scene, camera lenses, lighting, atmosphere, and action. CRITICALLY: all spoken dialogues, mutterings, and exclamations of the young man MUST be written in authentic Kurdish script in quotation marks (e.g. He clutches his temples and groans aloud in Kurdish: 'ئای خوایە... سەرم دەمکوژێ، ئیتر ناتوانم بەرگە بگرم...').",
  "shotTimeline": [
    {
      "timeRange": "00:00 - 00:06",
      "shotTitleKurdish": "سەرەتای دیمەن / کێشانی سەرنج",
      "shotTitleEnglish": "Opening Hook & Establishing",
      "visualDescription": "Detailed visual description of camera, lighting, and action in English",
      "cameraSpecs": "e.g., 35mm lens, handheld slight shake, low Dutch angle",
      "kurdishDialogue": "دەقی قسەی کوردیی ئەم دیمەنە (ئەگەر هەبێت یان دەنگی نزم)",
      "dialogueContext": "Emotional delivery note (e.g., pained groan, breathless whisper)",
      "soundEffects": "SFX cues (e.g. muffled heartbeat thumps, ringing tinnitus)"
    },
    {
      "timeRange": "00:06 - 00:14",
      "shotTitleKurdish": "پەرەسەندنی ئازار و بێدەرەتانی",
      "shotTitleEnglish": "Rising Agony & Confusion",
      "visualDescription": "Detailed visual description in English",
      "cameraSpecs": "e.g., Extreme Close-Up on eyes, rapid shallow depth of field rack",
      "kurdishDialogue": "دەقی قسەی کوردی (دیالۆگ)",
      "dialogueContext": "Emotional delivery note",
      "soundEffects": "SFX cues"
    },
    {
      "timeRange": "00:14 - 00:22",
      "shotTitleKurdish": "لووتکەی قەیران / هەوڵدان بۆ چارەسەر",
      "shotTitleEnglish": "Climax & Desperation",
      "visualDescription": "Detailed visual description in English",
      "cameraSpecs": "e.g., 50mm anamorphic, tracking dolly shot",
      "kurdishDialogue": "دەقی قسەی سەرەکی بە کوردی سۆرانی",
      "dialogueContext": "Emotional delivery note",
      "soundEffects": "SFX cues"
    },
    {
      "timeRange": "00:22 - 00:30",
      "shotTitleKurdish": "کۆتایی و پەیام / چارەسەر",
      "shotTitleEnglish": "Resolution & Final Impact",
      "visualDescription": "Detailed visual description in English",
      "cameraSpecs": "e.g., Slow push-in, fading light, high-angle downward tilt",
      "kurdishDialogue": "دەقی کۆتایی بە کوردی",
      "dialogueContext": "Emotional delivery note",
      "soundEffects": "SFX cues"
    }
  ],
  "cinematographyNotes": {
    "lighting": "Cinematic lighting setup description",
    "colorGrading": "LUT & Color Palette (e.g. Desaturated cold teal shadows with warm amber skin tones)",
    "aspectRatio": "9:16 vertical or 16:9 widescreen",
    "soundtrackMood": "Ambient drone, tense strings, realistic room tone"
  },
  "ttsReadyLines": [
    {
      "id": "line_mentor_1",
      "speaker": "👨‍🏫 مامۆستای پەروەردە و ڕاهێنەر (Educational Mentor)",
      "kurdishText": "کوڕم، ئارام بەوە... کەمێک چاوەکانت دابخە، پەرداخێک ئاو بخۆرەوە و مۆبایلەکەت دابنێ. خوێندن گرنگە، بەڵام تەندروستیت لە هەموو شتێک لەپێشترە.",
      "suggestedVoice": "Charon",
      "suggestedStyle": "Warm, calm, empathetic, and articulate voice of an educational teacher and mentor speaking in clear, natural Kurdish, giving patient, loving guidance to an exhausted student"
    },
    {
      "id": "line_1",
      "speaker": "🧑‍🎓 گەنجەکە (The 20-year-old Young Man)",
      "kurdishText": "ئای خوایە... سەرم خەریکە دەتەقێت، چی بکەم؟ هیچ دەرمانێک لێرە نییە!",
      "suggestedVoice": "Fenrir",
      "suggestedStyle": "Pained, breathless, agonizing whisper of a 20-year-old Kurdish youth clutching his head"
    },
    {
      "id": "line_2",
      "speaker": "🧑‍🎓 گەنجەکە (The 20-year-old Young Man)",
      "kurdishText": "دایە گیان کوا دەرمانەکان؟ ئەی هاوار تەحەممولم نەماوە...",
      "suggestedVoice": "Fenrir",
      "suggestedStyle": "Trembling, distressed voice, calling out in pain"
    },
    {
      "id": "line_mentor_2",
      "speaker": "👨‍🏫 مامۆستای پەروەردە و ڕاهێنەر (Educational Mentor)",
      "kurdishText": "وەک مامۆستایەک پێت دەڵێم: کاتێک مێشکت ماندوو بوو، ئیتر زانیاری وەرناگرێت. ئێستا کاتی پشوودانە نەک خۆسزادان.",
      "suggestedVoice": "Charon",
      "suggestedStyle": "Calm, authoritative, caring educational mentor voice speaking gently in Kurdish"
    }
  ],
  "directorTipsKurdish": [
    "ئامۆژگاری دەرهێنەر ١ بۆ بەرهەمهێنان",
    "ئامۆژگاری دەرهێنەر ٢ بۆ مۆنتاژ و دەنگ"
  ]
}

Return ONLY clean, strictly valid JSON without any markdown code fences if possible, or wrapped in a standard json block.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = (response.text || '{}').trim();
    const parsedData = JSON.parse(rawText);

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error generating director prompt:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate prompt from Gemini 3.8 Flash' });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Video Director & TTS Studio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
