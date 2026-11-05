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

// 1. Text-to-Speech endpoint using gemini-3.8-flash-tts
app.post('/api/tts/generate', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Fenrir', style = 'Pained, 20-year-old Kurdish man suffering from a severe migraine headache, breathing heavily' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text is required for TTS generation.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server environment.' });
      return;
    }

    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voice) ? voice : 'Fenrir';

    // Call gemini-3.8-flash-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: style.trim(),
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

    if (!base64Audio) {
      res.status(502).json({ error: 'No audio data was returned from Gemini TTS model.' });
      return;
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voice: chosenVoice,
      text: text.trim(),
      style: style.trim(),
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate audio via gemini-3.8-flash-tts',
    });
  }
});

// 2. Interactive Director Chat / Consultation using gemini-3.8-flash
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
      "id": "line_1",
      "speaker": "گەنجەکە (The 20-year-old Young Man)",
      "kurdishText": "ئای خوایە... سەرم خەریکە دەتەقێت، چی بکەم؟ هیچ دەرمانێک لێرە نییە!",
      "suggestedVoice": "Fenrir",
      "suggestedStyle": "Pained, breathless, agonizing whisper of a 20-year-old Kurdish youth clutching his head"
    },
    {
      "id": "line_2",
      "speaker": "گەنجەکە (The 20-year-old Young Man)",
      "kurdishText": "دایە گیان کوا دەرمانەکان؟ ئەی هاوار تەحەممولم نەماوە...",
      "suggestedVoice": "Fenrir",
      "suggestedStyle": "Trembling, distressed voice, calling out in pain"
    },
    {
      "id": "line_3",
      "speaker": "گەنجەکە (The 20-year-old Young Man)",
      "kurdishText": "پێویستە کەمێک ئاو بخۆمەوە... چاوەکانم لێڵ بوون، تەنیا کەمێک تاریکی و بێدەنگیم دەوێت.",
      "suggestedVoice": "Fenrir",
      "suggestedStyle": "Exhausted, slow, weary mutter fading into silence"
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
