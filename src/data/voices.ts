import { VoiceInfo, LanguageInfo, TonePreset, AudioTag } from '../types';

export const GEMINI_VOICES: VoiceInfo[] = [
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    character: 'Upbeat & Engaging',
    tone: 'Bright, lively, and optimistic',
    style: 'Commercial & Conversational',
    accent: 'Neutral American',
    description: 'Energetic, cheerful, and approachable. Ideal for podcasts, tutorials, dynamic advertisements, and upbeat voiceovers.',
    personality: ['Friendly', 'Enthusiastic', 'Agile', 'Bright']
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    character: 'Deep & Authoritative',
    tone: 'Grounded, profound, and steady',
    style: 'Broadcast & Documentary',
    accent: 'Standard Cinematic',
    description: 'Deep baritone with rich resonance and commanding presence. Perfect for film trailers, dramatic documentaries, and serious announcements.',
    personality: ['Authoritative', 'Commanding', 'Low-pitch', 'Serious']
  },
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female',
    character: 'Firm & Articulate',
    tone: 'Crisp, confident, and professional',
    style: 'Corporate & Educational',
    accent: 'Clear Modern',
    description: 'Polished, direct, and authoritative female voice. Superb for corporate presentations, news broadcasting, and technical briefings.',
    personality: ['Confident', 'Direct', 'Executive', 'Sharp']
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    character: 'Resonant & Intense',
    tone: 'Gritty, muscular, and magnetic',
    style: 'Narrative & Gaming',
    accent: 'Deep Nordic-American',
    description: 'Heavy textured timbre with dramatic weight. Excellent for audiobooks, sci-fi/fantasy storytelling, and high-stakes dialogue.',
    personality: ['Dramatic', 'Intense', 'Rugged', 'Powerful']
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Female',
    character: 'Gentle & Melodic',
    tone: 'Warm, empathetic, and serene',
    style: 'Meditation & Storytelling',
    accent: 'Soft Nuanced',
    description: 'Soft-spoken, soothing, and breathy resonance. Tailor-made for guided meditations, bedtime stories, and calming luxury branding.',
    personality: ['Calm', 'Soothing', 'Empathetic', 'Whisper-like']
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    gender: 'Female',
    character: 'Lyrical & Expressive',
    tone: 'Nuanced, rhythmic, and poetic',
    style: 'Audiobook & Performance',
    accent: 'Contemporary Transatlantic',
    description: 'Warm, expressive cadence with vivid emotional range. Outstanding for dramatic fiction, stage monologues, and creative essays.',
    personality: ['Expressive', 'Nuanced', 'Storyteller', 'Warm']
  },
  {
    id: 'Leda',
    name: 'Leda',
    gender: 'Female',
    character: 'Sophisticated & Polished',
    tone: 'Balanced, cultured, and smooth',
    style: 'Documentary & Premium Commercial',
    accent: 'Refined Global',
    description: 'Elegant vocal delivery with impeccable pacing. Great for museum audio tours, luxury product launches, and narrative essays.',
    personality: ['Sophisticated', 'Balanced', 'Refined', 'Smooth']
  },
  {
    id: 'Orpheus',
    name: 'Orpheus',
    gender: 'Male',
    character: 'Warm & Reflective',
    tone: 'Intimate, thoughtful, and resonant',
    style: 'Literary & Personal Essay',
    accent: 'Warm Acoustic',
    description: 'Close-mic warmth and introspective nuance. Designed for memoirs, long-form journalism, and reflective monologues.',
    personality: ['Intimate', 'Warm', 'Reflective', 'Acoustic']
  }
];

export const TONE_PRESETS: TonePreset[] = [
  {
    id: 'neutral',
    label: 'Neutral',
    instruction: 'Speak with a balanced, clear, and natural conversational cadence.',
    rate: 1.0,
    pitch: 0,
    iconName: 'Minus',
    tagline: 'Balanced baseline'
  },
  {
    id: 'cheerful',
    label: 'Cheerful',
    instruction: 'Speak with a bright, sunny, and enthusiastic delivery, infusing optimism and warmth into every phrase.',
    rate: 1.1,
    pitch: 2,
    iconName: 'Smile',
    tagline: 'Warm & joyful'
  },
  {
    id: 'professional',
    label: 'Professional',
    instruction: 'Deliver this with crisp diction, measured cadence, and executive authority as an industry broadcast specialist.',
    rate: 1.0,
    pitch: -1,
    iconName: 'Briefcase',
    tagline: 'Sharp & authoritative'
  },
  {
    id: 'excited',
    label: 'Excited',
    instruction: 'Speak with high energy, dynamic vocal inflections, and breathless enthusiasm like a live sports commentator or breakthrough announcement.',
    rate: 1.25,
    pitch: 3,
    iconName: 'Zap',
    tagline: 'High velocity & punchy'
  },
  {
    id: 'calm',
    label: 'Calm',
    instruction: 'Speak very gently, breathing between thoughts with tranquil cadence, warm acoustic resonance, and soothing pacing.',
    rate: 0.85,
    pitch: -1,
    iconName: 'Moon',
    tagline: 'Tranquil & centered'
  },
  {
    id: 'dramatic',
    label: 'Dramatic',
    instruction: 'Deliver with theatrical intensity, heavy deliberate pauses, intense resonance, and dark cinematic gravitas.',
    rate: 0.9,
    pitch: -3,
    iconName: 'Flame',
    tagline: 'Cinematic gravitas'
  },
  {
    id: 'whisper',
    label: 'Whisper',
    instruction: 'Speak in a close-mic, intimate, ASMR-style breathy whisper, keeping vocal cords relaxed and close to the listener.',
    rate: 0.8,
    pitch: -1,
    iconName: 'Wind',
    tagline: 'Intimate ASMR breath'
  }
];

export const AUDIO_TAGS: AudioTag[] = [
  { tag: '[whispers]', label: '[whispers]', category: 'vocal', tooltip: 'Switches into intimate soft whisper delivery' },
  { tag: '[excited]', label: '[excited]', category: 'emotion', tooltip: 'Increases pitch, dynamic energy, and vocal speed' },
  { tag: '[laughs]', label: '[laughs]', category: 'vocal', tooltip: 'Inserts light laughter or chuckling' },
  { tag: '[sighs]', label: '[sighs]', category: 'vocal', tooltip: 'Adds an audible exhalation or reflective sigh' },
  { tag: '[short pause]', label: '[short pause]', category: 'pause', tooltip: 'Brief acoustic hesitation (~0.4s)' },
  { tag: '[medium pause]', label: '[medium pause]', category: 'pause', tooltip: 'Deliberate breath pause (~0.8s)' },
  { tag: '[long pause]', label: '[long pause]', category: 'pause', tooltip: 'Dramatic scene silence (~1.5s)' },
  { tag: '[sarcasm]', label: '[sarcasm]', category: 'emotion', tooltip: 'Dry, ironic, wry intonation' },
  { tag: '[robotic]', label: '[robotic]', category: 'vocal', tooltip: 'Monotone, synthesized mechanical rhythm' },
  { tag: '[gasp]', label: '[gasp]', category: 'vocal', tooltip: 'Audible sharp intake of breath' },
  { tag: '[fast]', label: '[fast]', category: 'pacing', tooltip: 'Rapid, urgent tempo acceleration' },
  { tag: '[slow]', label: '[slow]', category: 'pacing', tooltip: 'Deliberate, lingering slow cadence' }
];

export const SAMPLE_SCRIPTS = [
  {
    id: 'noir',
    title: 'Cinematic Noir — Midnight Echoes',
    voice: 'Charon',
    styleInstruction: 'A gritty, cynical detective monologue recorded in a rain-slicked city office at 3 AM. Heavy atmospheric pauses and gravelly low tones.',
    sceneDirection: 'Rain beat against the venetian blinds like frantic fingers. The neon diner sign across 8th Avenue bled crimson into the puddles.',
    isMultiSpeaker: false,
    text: `The rain had been falling over the docks for three solid days. [sighs] [medium pause] When the phone finally rang at 3:14 AM, I already knew nothing good was waiting on the other end of that wire. [short pause] 

"Look, Callahan," [whispers] she said, her voice shaking like wet paper, [short pause] "you have no idea what you walked into tonight." [long pause] 

I took another sip of black coffee. Cold. Stale. Just like every other promise made in this city.`
  },
  {
    id: 'tech_podcast',
    title: 'Tech Podcast — The Quantum Dawn',
    voice: 'Puck',
    styleInstruction: 'An upbeat, infectious tech host kicking off an episode with high energy, snappy pacing, and curiosity.',
    sceneDirection: 'Modern acoustic broadcast studio with high-grade condenser microphones, RGB audio meters dancing.',
    isMultiSpeaker: false,
    text: `Welcome back to The Daily Pulse! [excited] I'm your host, and today... [short pause] we are diving headfirst into the biggest compute breakthrough of the decade! [laughs] 

Imagine training a multi-modal reasoning engine in under thirty seconds. [medium pause] Sounds like science fiction, right? [short pause] Well, today's guests just published the benchmark results, and let's just say—the industry is never going to be the same.`
  },
  {
    id: 'meditation',
    title: 'Mindfulness — Twilight Horizon',
    voice: 'Zephyr',
    styleInstruction: 'A soothing, tranquil mindfulness meditation guide speaking in a soft, resonant, comforting voice with gentle pacing.',
    sceneDirection: 'A quiet mountain sanctuary at twilight, gentle wind chime in the distance, warm acoustic reflections.',
    isMultiSpeaker: false,
    text: `Gently close your eyes. [long pause] 

Allow the shoulders to drop away from the ears. [medium pause] [sighs] Feel the rhythm of your breath as cool air enters, [short pause] and warm air leaves. [medium pause] 

[whispers] There is nowhere else you need to be right now. [long pause] With every exhale, let go of any tension carried from the day.`
  },
  {
    id: 'dialogue',
    title: 'Dialogue — The Secret Briefing',
    voice: 'Charon',
    secondaryVoice: 'Kore',
    styleInstruction: 'A tense conversation between an intelligence director and a senior field analyst in a secure subterranean facility.',
    sceneDirection: 'Subterranean operations room with glowing status monitors and low acoustic reverberation.',
    isMultiSpeaker: true,
    speakers: [
      { id: '1', name: 'Director', voice: 'Charon', role: 'Director' },
      { id: '2', name: 'Analyst', voice: 'Kore', role: 'Analyst' }
    ],
    text: `Director: Are we certain the telemetry was routed through the London hub? [short pause]

Analyst: Confirmed, Director. The signal hopped seven encrypted nodes before terminating at the dockside warehouse. [medium pause]

Director: Then we move before sunrise. [whispers] No mistakes this time.

Analyst: [sighs] Tactical team is already prepped on frequency alpha.`
  },
  {
    id: 'documentary',
    title: 'Nature Documentary — The Mariana Trench',
    voice: 'Leda',
    styleInstruction: 'A sophisticated, awe-struck natural history documentary narrator exploring the deepest abyss on Earth.',
    sceneDirection: 'Submersible descent into the abyss, bioluminescent creatures flickering in eternal darkness.',
    isMultiSpeaker: false,
    text: `Eleven thousand meters below the surface of the Pacific, sunlight is entirely forgotten. [medium pause] Here, in the Challenger Deep, pressure exceeds one thousand atmospheres. [short pause]

And yet, [whispers] life doesn't merely survive here. [medium pause] It thrives in spectral blooms of bioluminescent light.`
  }
];

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en-US', name: 'English (United States)', region: 'North America' },
  { code: 'en-GB', name: 'English (United Kingdom)', region: 'Europe' },
  { code: 'en-AU', name: 'English (Australia)', region: 'Oceania' },
  { code: 'en-CA', name: 'English (Canada)', region: 'North America' },
  { code: 'en-IN', name: 'English (India)', region: 'Asia' },
  { code: 'en-IE', name: 'English (Ireland)', region: 'Europe' },
  { code: 'en-ZA', name: 'English (South Africa)', region: 'Africa' },
  { code: 'en-NZ', name: 'English (New Zealand)', region: 'Oceania' },
  { code: 'es-ES', name: 'Spanish (Spain)', region: 'Europe' },
  { code: 'es-MX', name: 'Spanish (Mexico)', region: 'Latin America' },
  { code: 'es-AR', name: 'Spanish (Argentina)', region: 'Latin America' },
  { code: 'es-CO', name: 'Spanish (Colombia)', region: 'Latin America' },
  { code: 'es-CL', name: 'Spanish (Chile)', region: 'Latin America' },
  { code: 'es-US', name: 'Spanish (United States)', region: 'North America' },
  { code: 'fr-FR', name: 'French (France)', region: 'Europe' },
  { code: 'fr-CA', name: 'French (Canada)', region: 'North America' },
  { code: 'fr-BE', name: 'French (Belgium)', region: 'Europe' },
  { code: 'fr-CH', name: 'French (Switzerland)', region: 'Europe' },
  { code: 'de-DE', name: 'German (Germany)', region: 'Europe' },
  { code: 'de-AT', name: 'German (Austria)', region: 'Europe' },
  { code: 'de-CH', name: 'German (Switzerland)', region: 'Europe' },
  { code: 'it-IT', name: 'Italian (Italy)', region: 'Europe' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', region: 'Latin America' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', region: 'Europe' },
  { code: 'ja-JP', name: 'Japanese (Japan)', region: 'Asia' },
  { code: 'ko-KR', name: 'Korean (South Korea)', region: 'Asia' },
  { code: 'zh-CN', name: 'Chinese (Mandarin, Simplified)', region: 'Asia' },
  { code: 'zh-TW', name: 'Chinese (Mandarin, Traditional)', region: 'Asia' },
  { code: 'zh-HK', name: 'Chinese (Cantonese)', region: 'Asia' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)', region: 'Europe' },
  { code: 'nl-BE', name: 'Dutch (Belgium)', region: 'Europe' },
  { code: 'ru-RU', name: 'Russian (Russia)', region: 'Europe' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', region: 'Middle East' },
  { code: 'ar-EG', name: 'Arabic (Egypt)', region: 'Middle East' },
  { code: 'ar-AE', name: 'Arabic (UAE)', region: 'Middle East' },
  { code: 'hi-IN', name: 'Hindi (India)', region: 'Asia' },
  { code: 'bn-BD', name: 'Bengali (Bangladesh/India)', region: 'Asia' },
  { code: 'ta-IN', name: 'Tamil (India/Sri Lanka)', region: 'Asia' },
  { code: 'te-IN', name: 'Telugu (India)', region: 'Asia' },
  { code: 'mr-IN', name: 'Marathi (India)', region: 'Asia' },
  { code: 'ur-PK', name: 'Urdu (Pakistan/India)', region: 'Asia' },
  { code: 'tr-TR', name: 'Turkish (Turkey)', region: 'Europe' },
  { code: 'pl-PL', name: 'Polish (Poland)', region: 'Europe' },
  { code: 'sv-SE', name: 'Swedish (Sweden)', region: 'Europe' },
  { code: 'da-DK', name: 'Danish (Denmark)', region: 'Europe' },
  { code: 'no-NO', name: 'Norwegian (Norway)', region: 'Europe' },
  { code: 'fi-FI', name: 'Finnish (Finland)', region: 'Europe' },
  { code: 'el-GR', name: 'Greek (Greece)', region: 'Europe' },
  { code: 'cs-CZ', name: 'Czech (Czech Republic)', region: 'Europe' },
  { code: 'ro-RO', name: 'Romanian (Romania)', region: 'Europe' },
  { code: 'hu-HU', name: 'Hungarian (Hungary)', region: 'Europe' },
  { code: 'uk-UA', name: 'Ukrainian (Ukraine)', region: 'Europe' },
  { code: 'vi-VN', name: 'Vietnamese (Vietnam)', region: 'Asia' },
  { code: 'th-TH', name: 'Thai (Thailand)', region: 'Asia' },
  { code: 'id-ID', name: 'Indonesian (Indonesia)', region: 'Asia' },
  { code: 'ms-MY', name: 'Malay (Malaysia)', region: 'Asia' },
  { code: 'fil-PH', name: 'Filipino / Tagalog (Philippines)', region: 'Asia' },
  { code: 'he-IL', name: 'Hebrew (Israel)', region: 'Middle East' },
  { code: 'fa-IR', name: 'Persian / Farsi (Iran)', region: 'Middle East' },
  { code: 'sw-KE', name: 'Swahili (Kenya/Tanzania)', region: 'Africa' },
  { code: 'bg-BG', name: 'Bulgarian (Bulgaria)', region: 'Europe' },
  { code: 'hr-HR', name: 'Croatian (Croatia)', region: 'Europe' },
  { code: 'sk-SK', name: 'Slovak (Slovakia)', region: 'Europe' },
  { code: 'sl-SI', name: 'Slovenian (Slovenia)', region: 'Europe' },
  { code: 'sr-RS', name: 'Serbian (Serbia)', region: 'Europe' },
  { code: 'lt-LT', name: 'Lithuanian (Lithuania)', region: 'Europe' },
  { code: 'lv-LV', name: 'Latvian (Latvia)', region: 'Europe' },
  { code: 'et-EE', name: 'Estonian (Estonia)', region: 'Europe' },
  { code: 'is-IS', name: 'Icelandic (Iceland)', region: 'Europe' },
  { code: 'ga-IE', name: 'Irish (Ireland)', region: 'Europe' },
  { code: 'cy-GB', name: 'Welsh (Wales)', region: 'Europe' },
  { code: 'af-ZA', name: 'Afrikaans (South Africa)', region: 'Africa' },
  { code: 'ca-ES', name: 'Catalan (Spain)', region: 'Europe' }
];
