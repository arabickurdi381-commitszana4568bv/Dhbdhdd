import { DirectorPromptResult } from '../types';

export const DEFAULT_PROMPT_RESULT: DirectorPromptResult = {
  projectTitleKurdish: 'تەنگەتاوی لە تاریکیدا (Aura of Agony)',
  projectTitleEnglish: 'Aura of Agony: 30-Second Kurdish Migraine Short',
  loglineKurdish: 'گەنجێکی ٢٠ ساڵانی کورد لە ژوورێکی تاریکدا بە توندی تووشی سەرئێشەیەکی لەناکاو دەبێت؛ لە نێوان شاشەی سووتێنەری مۆبایل و پاکەتە بەتاڵەکانی دەرماندا دەناڵێنێت تا ئەو کاتەی چارەسەرێکی چاوەڕواننەکراو دەردەکەوێت.',
  loglineEnglish: 'A 20-year-old Kurdish youth battles an excruciating late-night migraine in a dim room, caught between the blinding glare of his phone and empty pill blisters until a comforting presence intervenes.',
  characterDescription: 'A 20-year-old Kurdish young man with messy dark hair, intense expressive brown eyes lined with fatigue, wearing an oversized dark charcoal hoodie. Pale, cold-sweat skin on his forehead and throbbing temporal veins.',
  masterPromptEnglishWithKurdishDialogue: `A cinematic 30-second dramatic short film, shot on Arri Alexa Mini LF with Cooke Anamorphic 35mm lens, 4K UHD, moody low-key lighting. 
Location: A moody student apartment in Slemani/Erbil at 2:00 AM. 
The subject is a 20-year-old Kurdish young man with disheveled dark hair and weary eyes, visibly suffering from a debilitating migraine headache.

[00:00 - 00:06] OPENING HOOK: Handheld macro camera shot slowly pushing into the young man's face. Cold blue moonlight filters through wooden blinds, clashing with the harsh amber glow of a study desk lamp. His hands violently clutch his temples; temporal arteries visibly pulse under damp skin. He squeezes his eyelids shut, grimacing in intense agony, muttering hoarsely in Kurdish: "ئای خوایە... سەرم خەریکە دەتەقێت!". Sound of a sharp high-frequency tinnitus ringing mixed with a deep muffled heartbeat.

[00:06 - 00:14] RISING AGONY & DISORIENTATION: Dutch angle vertigo shot with shallow depth of field. The young man stumbles across the room toward a wooden nightstand, his vision blurred with rainbow visual aura and radial lens distortion. He feverishly yanks open drawers, tossing aside university notes, hunting for painkillers. He grabs a foil blister pack, only to discover all silver foil pockets are empty. His eyes widen in despair, gasping in authentic Kurdish: "چی بکەم باشە؟ هیچ دەرمانێک لێرە نییە!".

[00:14 - 00:22] CLIMAX & BLINDING PHONE GLARE: The young man snatches his smartphone from the bed to call for help. As the OLED screen lights up, the harsh 6500K white light violently strikes his dilated pupils. He winces in shock, crying out in a cracked, desperate Kurdish voice: "دایە گیان کوا دەرمانەکان؟ ئەی هاوار تەحەممولم نەماوە...". He hurls the phone onto the soft bed, collapsing onto his knees against the wall, clutching his skull with both hands.

[00:22 - 00:30] RESOLUTION & COMFORT: The bedroom door creaks softly open, casting a warm golden 2700K hallway glow across the dark floor. A caring hand gently places a cool wet compress on his forehead and sets down a tall glass of cold water and fresh medicine. The high-pitched tinnitus fades into soft soothing acoustic oud ambient tones. The young man releases a long, trembling breath in Kurdish: "سوپاس... تەنیا کەمێک تاریکیم دەوێت.", slowly closing his eyes as the frame fades to black.`,
  shotTimeline: [
    {
      timeRange: '00:00 - 00:06',
      shotTitleKurdish: 'دەستپێک / دەمارەکانی سەرئێشە',
      shotTitleEnglish: 'Macro Hook on Pulsing Temples',
      visualDescription: 'Macro extreme close-up pushing in on the 20-year-old Kurdish youth clutching his head under cold blue light.',
      cameraSpecs: '35mm anamorphic, handheld subtle breathing, f/1.8 shallow depth',
      kurdishDialogue: 'ئای خوایە... سەرم خەریکە دەتەقێت!',
      dialogueContext: 'Pained, agonizing gasp under breath',
      soundEffects: 'High-pitch 8kHz tinnitus tone crossfaded with low sub-bass heartbeat',
    },
    {
      timeRange: '00:06 - 00:14',
      shotTitleKurdish: 'گەڕان بەدوای دەرمان و پاکەتی بەتاڵ',
      shotTitleEnglish: 'Desperate Search & Empty Blister',
      visualDescription: 'Vertigo Dutch angle tracking him rummaging frantically through messy drawers, finding an empty pill pack.',
      cameraSpecs: '24mm wide angle, Dutch tilt 15-degrees, rapid rack focus',
      kurdishDialogue: 'چی بکەم باشە؟ هیچ دەرمانێک لێرە نییە!',
      dialogueContext: 'Panicked, trembling voice in despair',
      soundEffects: 'Drawer rattling, foil crinkling, rapid shallow breathing',
    },
    {
      timeRange: '00:14 - 00:22',
      shotTitleKurdish: 'سووتانەوە بە تیشکی مۆبایل و هاوار',
      shotTitleEnglish: 'Phone Screen Glare & Climax',
      visualDescription: 'He unlocks phone to call for help, but the blinding white screen flares into his eyes, causing acute photophobia.',
      cameraSpecs: '50mm portrait lens, lens flare streak, over-the-shoulder to frontal switch',
      kurdishDialogue: 'دایە گیان کوا دەرمانەکان؟ ئەی هاوار تەحەممولم نەماوە...',
      dialogueContext: 'Cracked, pained cry for his mother',
      soundEffects: 'Phone thud on mattress, muffled vocal reverberation',
    },
    {
      timeRange: '00:22 - 00:30',
      shotTitleKurdish: 'چارەسەر، ئاوی سارد و ئارامبوونەوە',
      shotTitleEnglish: 'Door Opens & Gentle Relief',
      visualDescription: 'A warm golden slit of light from the doorway; a comforting hand brings cold water and a wet cloth.',
      cameraSpecs: 'Slow smooth push-in, 85mm soft focus, slow fade to black',
      kurdishDialogue: 'سوپاس... تەنیا کەمێک تاریکیم دەوێت.',
      dialogueContext: 'Exhausted, grateful whisper fading away',
      soundEffects: 'Gentle water glass clink, soft acoustic ambient drone fading out',
    },
  ],
  cinematographyNotes: {
    lighting: 'Bipolar contrast: Cold moody 5600K cyan light bleeding through blinds vs. harsh 6500K phone screen glare, transitioning to warm 2700K relief light.',
    colorGrading: 'Kodak 2383 Film LUT emulation with desaturated cyan shadows and natural skin tones on the Kurdish protagonist.',
    aspectRatio: '9:16 vertical (for TikTok / Reels / Shorts) or 16:9 cinematic widescreen',
    soundtrackMood: 'Visceral sound design with subjective audio perspective: tinnitus, muffled heartbeat, and heavy breathing.',
  },
  ttsReadyLines: [
    {
      id: 'line_kurdish_boy_1',
      speaker: '👦 کوڕی کوردی گەنج (Articulate Kurdish Boy)',
      kurdishText: 'سڵاو هاوڕێ گیان، دەزانم سەرئێشەکەت چەند سەختە، بەڵام بڕوا بکە بە کەمێک پشوودان هەمووی باش دەبێتەوە. تۆ زۆر لەوە بەهێزتریت!',
      suggestedVoice: 'Puck',
      suggestedStyle: 'Natural, articulate, handsome, and vibrant 20-year-old Kurdish young man speaking warmly, beautifully, and eloquently in standard Kurdish Sorani',
    },
    {
      id: 'line_badini_girl_1',
      speaker: '👧 کچی کورد بە زاراوەی بادینی (Badini Kurdish Girl)',
      kurdishText: 'برا، دەستێ خۆ بدە بەر سەرێ خۆ و کێمەکێ ئارام ببە... پەرداخەکا ئاڤێ ڤەخۆ و بەس ل شاشێ موبایلێ بنێڕە.',
      suggestedVoice: 'Zephyr',
      suggestedStyle: 'Gentle, authentic, melodious and sweet young Kurdish woman speaking naturally and fluently in the Badini (Kurmanji) dialect of Duhok and Zakho',
    },
    {
      id: 'line_mentor_1',
      speaker: '👨‍🏫 مامۆستای پەروەردە و ڕاهێنەر (Educational Mentor)',
      kurdishText: 'کوڕم، ئارام بەوە... کەمێک چاوەکانت دابخە، پەرداخێک ئاو بخۆرەوە و مۆبایلەکەت دابنێ. خوێندن گرنگە، بەڵام تەندروستیت لە هەموو شتێک لەپێشترە.',
      suggestedVoice: 'Charon',
      suggestedStyle: 'Warm, calm, empathetic, and articulate voice of an educational teacher and mentor speaking in clear, natural Kurdish, giving patient, loving guidance to an exhausted student',
    },
    {
      id: 'line_1',
      speaker: '🧑‍🎓 گەنجە ٢٠ ساڵانەکە (The 20-year-old Young Man)',
      kurdishText: 'ئای خوایە... سەرم خەریکە دەتەقێت، چی بکەم؟ هیچ دەرمانێک لێرە نییە!',
      suggestedVoice: 'Fenrir',
      suggestedStyle: 'Pained, agonizing whisper of a 20-year-old Kurdish youth clutching his head',
    },
    {
      id: 'line_2',
      speaker: '🧑‍🎓 گەنجە ٢٠ ساڵانەکە (The 20-year-old Young Man)',
      kurdishText: 'دایە گیان کوا دەرمانەکان؟ ئەی هاوار تەحەممولم نەماوە...',
      suggestedVoice: 'Fenrir',
      suggestedStyle: 'Trembling, desperate voice calling out for his mother and painkillers',
    },
    {
      id: 'line_badini_girl_2',
      speaker: '👧 کچی کورد بە زاراوەی بادینی (Badini Kurdish Girl)',
      kurdishText: 'ژ بۆ تە دێ دەرمانەکێ سەرئێشانێ بینم... چاڤێن خۆ بگرە و بێهنا خۆ فراوان بکە، هەمی تشت دێ باش بیت.',
      suggestedVoice: 'Zephyr',
      suggestedStyle: 'Tender, comforting Badini female voice speaking in soft Duhok accent',
    },
  ],
  directorTipsKurdish: [
    'لەم مۆدێلانەی ڤیدیۆ (وەک Sora یان Kling)، کاتێک دەقی کوردی دیالۆگەکان دادەنێیت، با لە ناو دووانەی کەوانەیی " " بێت بۆ ئەوەی مۆدێلەکە جووڵەی لێو (Lip Sync) بە شێوازێکی سروشتی ڕێکبخات.',
    'بۆ پێدانی هەستی واقیعی مایگرەین بە بینەر، هەڵبژاردنی Dutch Angle (گۆشەی لار) و Lens Blur ئەزموونی سەرئێشەکە لە ڕووی بینراوەوە دەگوازێتەوە.',
    'دەتوانیت دەنگە دروستکراوەکانی Gemini 3.8 Flash TTS لە ڕێگەی مۆنتاژکارێکی وەک Premiere یان CapCut بخەیتە سەر ڤیدیۆکە.',
  ],
};
