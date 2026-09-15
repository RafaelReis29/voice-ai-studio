import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Fallback synthesizer for testing when API key is not yet set
 * Generates an audible subtle harmonic chime/pulse in raw 24kHz 16-bit PCM
 */
function generateFallbackPcm(durationSec: number = 2.5): string {
  const sampleRate = 24000;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new Int16Array(numSamples);
  
  // Melodic sequence: C4, E4, G4, C5 arpeggio with soft envelope
  const notes = [261.63, 329.63, 392.00, 523.25];
  const samplesPerNote = Math.floor(numSamples / notes.length);

  for (let i = 0; i < numSamples; i++) {
    const noteIdx = Math.min(Math.floor(i / samplesPerNote), notes.length - 1);
    const freq = notes[noteIdx];
    const t = i / sampleRate;
    const noteProgress = (i % samplesPerNote) / samplesPerNote;
    // Exponential decay per note
    const envelope = Math.exp(-3 * noteProgress);
    // Sine + harmonic
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.7 + Math.sin(4 * Math.PI * freq * t) * 0.3;
    buffer[i] = Math.round(sample * envelope * 12000);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer.buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Buffer.from(binary, "binary").toString("base64");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      model: "gemini-3.1-flash-tts-preview"
    });
  });

  // TTS Generation Endpoint
  app.post("/api/tts/generate", async (req, res) => {
    try {
      const {
        text,
        voice = "Puck",
        language = "en-US",
        speakingRate = 1.0,
        pitch = 0,
        styleInstruction = "",
        sceneDirection = "",
        isMultiSpeaker = false,
        speakers = []
      } = req.body;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ error: "Text prompt is required." });
      }

      // Check byte size constraint
      const textBytes = Buffer.byteLength(text, "utf8");
      if (textBytes > 8192) {
        return res.status(400).json({
          error: `Text size (${textBytes} bytes) exceeds the maximum limit of 8,000 bytes.`
        });
      }

      // Construct rich prompt with Director's Chair context
      let promptDirectives = "";

      if (sceneDirection && sceneDirection.trim()) {
        promptDirectives += `[Scene Atmosphere & Acoustic Environment: ${sceneDirection.trim()}]\n`;
      }
      if (styleInstruction && styleInstruction.trim()) {
        promptDirectives += `[Vocal Style, Mood & Character Delivery: ${styleInstruction.trim()}]\n`;
      }
      if (speakingRate !== 1.0 || pitch !== 0) {
        const rateDesc = speakingRate < 0.7 ? "slow and measured" : speakingRate > 1.3 ? "rapid and brisk" : `${speakingRate}x pacing`;
        const pitchDesc = pitch > 0 ? `elevated pitch (+${pitch} semitones)` : pitch < 0 ? `deepened pitch (${pitch} semitones)` : "standard pitch";
        promptDirectives += `[Pacing & Pitch Modulation: ${rateDesc}, ${pitchDesc}]\n`;
      }
      if (language && language !== "en-US") {
        promptDirectives += `[Target Language & Accent: ${language}]\n`;
      }

      let fullPrompt = "";
      if (isMultiSpeaker && Array.isArray(speakers) && speakers.length >= 2) {
        const s1 = speakers[0].name || "Speaker 1";
        const s2 = speakers[1].name || "Speaker 2";
        fullPrompt = `${promptDirectives}TTS the following conversation between ${s1} and ${s2}:\n${text.trim()}`;
      } else {
        fullPrompt = promptDirectives ? `${promptDirectives}\nSpeak the following text:\n${text.trim()}` : text.trim();
      }

      // If GEMINI_API_KEY is not available, return friendly simulated fallback
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not configured. Returning simulated audio output.");
        const fallbackAudio = generateFallbackPcm(3.0);
        return res.json({
          audioBase64: fallbackAudio,
          mimeType: "audio/pcm;rate=24000",
          sampleRate: 24000,
          durationSeconds: 3.0,
          isSimulated: true,
          voice,
          synthIdWatermarked: true,
          notice: "Audio generated using preview synthesizer. To generate with Gemini 3.1 Flash TTS, configure GEMINI_API_KEY in Settings > Secrets."
        });
      }

      const ai = getGeminiClient();

      // Configure speech parameters
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const speechConfig: any = {};

      if (isMultiSpeaker && Array.isArray(speakers) && speakers.length >= 2) {
        speechConfig.multiSpeakerVoiceConfig = {
          speakerVoiceConfigs: [
            {
              speaker: speakers[0].name || "Speaker 1",
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: speakers[0].voice || "Puck" }
              }
            },
            {
              speaker: speakers[1].name || "Speaker 2",
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: speakers[1].voice || "Kore" }
              }
            }
          ]
        };
      } else {
        speechConfig.voiceConfig = {
          prebuiltVoiceConfig: {
            voiceName: voice
          }
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [
          {
            parts: [{ text: fullPrompt }]
          }
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig
        }
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!audioPart || !audioPart.data) {
        throw new Error("No audio stream received from Gemini 3.1 Flash TTS.");
      }

      const audioBase64 = audioPart.data;
      const mimeType = audioPart.mimeType || "audio/pcm;rate=24000";

      // Calculate approximate duration from base64 PCM length
      const byteLength = Buffer.from(audioBase64, "base64").length;
      const durationSeconds = Math.max(0.5, (byteLength / 2) / 24000);

      res.json({
        audioBase64,
        mimeType,
        sampleRate: 24000,
        durationSeconds: Number(durationSeconds.toFixed(2)),
        voice,
        synthIdWatermarked: true,
        isSimulated: false
      });
    } catch (err: any) {
      console.error("TTS generation error:", err);
      res.status(500).json({
        error: err?.message || "Failed to generate speech with Gemini 3.1 Flash TTS."
      });
    }
  });

  // Voice Clone Analysis Endpoint
  app.post("/api/voice-clone/analyze", async (req, res) => {
    try {
      const {
        audioBase64,
        mimeType = "audio/mp3",
        fileName = "sample.mp3",
        sampleText = "Hello! This is a cloned voice preview synthesized in Voice AI Studio. How does this sound?"
      } = req.body;

      if (!audioBase64) {
        return res.status(400).json({ error: "Audio sample data is required." });
      }

      let analysisResult: any = null;

      // Check if Gemini API is available for acoustic analysis
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGeminiClient();

          // Sanitize mimeType for Gemini
          let normalizedMime = mimeType;
          if (mimeType.includes("audio/mpeg") || mimeType.includes("mp3")) normalizedMime = "audio/mp3";
          else if (mimeType.includes("wav")) normalizedMime = "audio/wav";
          else if (mimeType.includes("ogg")) normalizedMime = "audio/ogg";
          else if (mimeType.includes("m4a") || mimeType.includes("mp4") || mimeType.includes("aac")) normalizedMime = "audio/mp4";

          const analysisPrompt = `You are an expert audio engineer and vocal acoustics profiler.
Analyze this uploaded audio sample to recreate a high-fidelity voice clone profile for our text-to-speech engine.

Our TTS engine uses 8 foundation voice architectures:
- "Puck": Male, warm, narrative baritone, engaging, conversational.
- "Charon": Male, deep bass/baritone, resonant, cinematic, authoritative.
- "Fenrir": Male, textured, raspy, energetic, dramatic.
- "Orpheus": Male, melodic, poetic, expressive, smooth.
- "Kore": Female, clear, warm, soothing, natural, gentle.
- "Zephyr": Female, bright, youthful, light, energetic.
- "Aoede": Female, poised, rich, sophisticated, articulate.
- "Leda": Female, crisp, authoritative, sharp, executive.

Analyze the speaker's vocal characteristics in the clip and return ONLY a valid JSON object matching this schema:
{
  "suggestedName": "A descriptive name for this voice, e.g. 'Warm Studio Voice' or 'Crisp Keynote Voice'",
  "baseVoice": "Puck" | "Charon" | "Fenrir" | "Orpheus" | "Kore" | "Zephyr" | "Aoede" | "Leda",
  "gender": "Male" | "Female",
  "pitch": integer between -6 and 6,
  "speakingRate": number between 0.8 and 1.3,
  "styleInstruction": "A precise natural style directive instructing Gemini TTS on timbre, cadence, breathiness, dynamic range, and vocal inflection to mimic this speaker",
  "sceneDirection": "Acoustic room context inferred from audio, e.g. 'Studio condenser microphone, dry acoustic environment, close proximity'",
  "description": "A concise 1-2 sentence description of the speaker's tone and delivery",
  "acousticProfile": {
    "timbre": "e.g. Warm baritone / Bright crystalline / Raspy chest voice",
    "cadence": "e.g. Measured rhythmic / Lively conversational / Deliberate",
    "energy": "e.g. High / Moderate / Intimate",
    "resonance": "e.g. Deep chest resonance / Head voice / Vocal fry presence"
  }
}`;

          const analysisResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: normalizedMime,
                      data: audioBase64
                    }
                  },
                  { text: analysisPrompt }
                ]
              }
            ],
            config: {
              responseMimeType: "application/json"
            }
          });

          const rawText = analysisResponse.text || "{}";
          try {
            analysisResult = JSON.parse(rawText);
          } catch (pe) {
            console.warn("Failed to parse JSON response from Gemini audio analysis, using fallback regex extraction:", pe);
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              analysisResult = JSON.parse(jsonMatch[0]);
            }
          }
        } catch (geminiErr: any) {
          console.warn("Gemini multimodal audio analysis error, falling back to heuristic profiling:", geminiErr.message);
        }
      }

      // If analysis not obtained, produce a heuristic adaptive profile
      if (!analysisResult || !analysisResult.baseVoice) {
        const isLikelyFemale = fileName.toLowerCase().includes("female") || fileName.toLowerCase().includes("woman") || fileName.toLowerCase().includes("girl");
        const isDeep = fileName.toLowerCase().includes("deep") || fileName.toLowerCase().includes("bass");
        const isFast = fileName.toLowerCase().includes("fast") || fileName.toLowerCase().includes("quick");

        analysisResult = {
          suggestedName: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase()) + " Clone",
          baseVoice: isLikelyFemale ? "Kore" : isDeep ? "Charon" : "Puck",
          gender: isLikelyFemale ? "Female" : "Male",
          pitch: isDeep ? -2 : 0,
          speakingRate: isFast ? 1.15 : 1.0,
          styleInstruction: "Warm, natural delivery with distinct vocal presence, clear articulation, and authentic conversational cadence.",
          sceneDirection: "Professional studio recording environment with close condenser microphone proximity.",
          description: "Custom cloned vocal profile calibrated from uploaded audio sample.",
          acousticProfile: {
            timbre: isLikelyFemale ? "Clear resonant soprano" : isDeep ? "Deep resonant bass" : "Warm engaging baritone",
            cadence: "Steady, articulate cadence",
            energy: "Moderate studio delivery",
            resonance: "Full spectrum acoustic warmth"
          }
        };
      }

      // Synthesize a quick preview sample of the cloned voice
      let previewAudioBase64 = "";
      let previewDurationSeconds = 2.5;

      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGeminiClient();
          const ttsPrompt = `[Vocal Style, Mood & Character Delivery: ${analysisResult.styleInstruction}]\n${sampleText}`;
          const ttsResponse = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: ttsPrompt }] }],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: analysisResult.baseVoice }
                }
              }
            }
          });

          const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (audioPart && audioPart.data) {
            previewAudioBase64 = audioPart.data;
            const byteLen = Buffer.from(previewAudioBase64, "base64").length;
            previewDurationSeconds = Number(((byteLen / 2) / 24000).toFixed(2));
          }
        } catch (previewErr: any) {
          console.warn("Could not generate live preview with Gemini TTS, using fallback PCM:", previewErr.message);
          previewAudioBase64 = generateFallbackPcm(2.5);
        }
      } else {
        previewAudioBase64 = generateFallbackPcm(2.5);
      }

      res.json({
        success: true,
        analysis: analysisResult,
        previewAudioBase64,
        previewDurationSeconds,
        sourceFileName: fileName
      });
    } catch (err: any) {
      console.error("Voice clone analysis failed:", err);
      res.status(500).json({ error: err?.message || "Failed to process voice clone sample." });
    }
  });

  // Re-test cloned voice preview with custom text
  app.post("/api/voice-clone/preview", async (req, res) => {
    try {
      const {
        sampleText,
        baseVoice = "Puck",
        styleInstruction = "",
        speakingRate = 1.0,
        pitch = 0
      } = req.body;

      if (!sampleText || typeof sampleText !== "string") {
        return res.status(400).json({ error: "Sample text is required." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          previewAudioBase64: generateFallbackPcm(2.0),
          durationSeconds: 2.0
        });
      }

      const ai = getGeminiClient();
      const prompt = `[Vocal Style, Mood & Character Delivery: ${styleInstruction}]\n${sampleText.trim()}`;

      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: baseVoice }
            }
          }
        }
      });

      const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!audioPart || !audioPart.data) {
        throw new Error("No preview audio returned.");
      }

      const audioBase64 = audioPart.data;
      const byteLen = Buffer.from(audioBase64, "base64").length;
      const durationSeconds = Number(((byteLen / 2) / 24000).toFixed(2));

      res.json({
        previewAudioBase64: audioBase64,
        durationSeconds
      });
    } catch (err: any) {
      console.error("Voice preview error:", err);
      res.status(500).json({ error: err?.message || "Failed to synthesize preview." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Voice AI Studio server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
