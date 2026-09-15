import React, { useState } from 'react';
import { X, Copy, Check, Code2, Terminal } from 'lucide-react';
import { GenerationSettings } from '../types';

interface ApiCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GenerationSettings;
  text: string;
}

export const ApiCodeModal: React.FC<ApiCodeModalProps> = ({
  isOpen,
  onClose,
  settings,
  text
}) => {
  const [activeTab, setActiveTab] = useState<'js' | 'python'>('js');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build the code snippets
  const jsSnippet = `import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "fs";

// Initialize Gemini Client with server API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { "User-Agent": "aistudio-build" }
  }
});

async function synthesizeAudio() {
  const prompt = ${JSON.stringify(
    (settings.sceneDirection ? `[Scene: ${settings.sceneDirection}]\n` : '') +
      (settings.styleInstruction ? `[Style: ${settings.styleInstruction}]\n` : '') +
      (settings.speakingRate !== 1.0 ? `[Rate: ${settings.speakingRate}x]\n` : '') +
      text
  )};

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: ${
        settings.isMultiSpeaker && settings.speakers.length >= 2
          ? JSON.stringify(
              {
                multiSpeakerVoiceConfig: {
                  speakerVoiceConfigs: [
                    {
                      speaker: settings.speakers[0].name || 'Speaker 1',
                      voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: settings.speakers[0].voice || 'Puck' }
                      }
                    },
                    {
                      speaker: settings.speakers[1].name || 'Speaker 2',
                      voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: settings.speakers[1].voice || 'Kore' }
                      }
                    }
                  ]
                }
              },
              null,
              2
            )
          : JSON.stringify(
              {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: settings.voice || 'Puck' }
                }
              },
              null,
              2
            )
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    fs.writeFileSync("output.pcm", Buffer.from(base64Audio, "base64"));
    console.log("Audio written to output.pcm (24000Hz 16-bit mono)");
  }
}

synthesizeAudio();`;

  const pythonSnippet = `import os
from google import genai
from google.genai import types

# Initialize Gemini Client
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

prompt = ${JSON.stringify(
    (settings.sceneDirection ? `[Scene: ${settings.sceneDirection}]\n` : '') +
      (settings.styleInstruction ? `[Style: ${settings.styleInstruction}]\n` : '') +
      (settings.speakingRate !== 1.0 ? `[Rate: ${settings.speakingRate}x]\n` : '') +
      text
  )}

${
  settings.isMultiSpeaker && settings.speakers.length >= 2
    ? `speech_config = types.SpeechConfig(
    multi_speaker_voice_config=types.MultiSpeakerVoiceConfig(
        speaker_voice_configs=[
            types.SpeakerVoiceConfig(
                speaker="${settings.speakers[0].name}",
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="${settings.speakers[0].voice}")
                ),
            ),
            types.SpeakerVoiceConfig(
                speaker="${settings.speakers[1].name}",
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="${settings.speakers[1].voice}")
                ),
            ),
        ]
    )
)`
    : `speech_config = types.SpeechConfig(
    voice_config=types.VoiceConfig(
        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="${settings.voice}")
    )
)`
}

response = client.models.generate_content(
    model="gemini-3.1-flash-tts-preview",
    contents=prompt,
    config=types.GenerateContentConfig(
        response_modalities=["AUDIO"],
        speech_config=speech_config,
    ),
)

for part in response.candidates[0].content.parts:
    if part.inline_data:
        with open("output.pcm", "wb") as f:
            f.write(part.inline_data.data)
        print("Synthesized audio saved to output.pcm")`;

  const codeToShow = activeTab === 'js' ? jsSnippet : pythonSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181225] border border-[#2E2545] rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-[#2E2545] pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#A78BFA]" />
            <h3 className="text-base font-bold text-[#F5F3FF]">Exportação de Código da API Gemini</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#251D3A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#B4A9D0]">
          Copie este trecho de código para reproduzir a voz, diretrizes de interpretação e configuração selecionadas em sua própria aplicação usando o SDK oficial Google Gen AI.
        </p>

        {/* Tab Selector & Copy Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#140E20] p-1 rounded-xl border border-[#2E2545]">
            <button
              type="button"
              onClick={() => setActiveTab('js')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'js'
                  ? 'bg-[#7C3AED] text-white shadow'
                  : 'text-[#B4A9D0] hover:text-[#F5F3FF]'
              }`}
            >
              TypeScript / Node.js
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'python'
                  ? 'bg-[#7C3AED] text-white shadow'
                  : 'text-[#B4A9D0] hover:text-[#F5F3FF]'
              }`}
            >
              Python SDK
            </button>
          </div>

          <button
            id="btn-copy-api-code"
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#251D3A] hover:bg-[#342850] border border-[#2E2545] hover:border-[#7C3AED]/40 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#DDD6FE]" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>

        {/* Code View */}
        <pre className="flex-1 bg-[#140E20] border border-[#2E2545] rounded-xl p-4 text-xs font-mono text-[#DDD6FE] overflow-x-auto overflow-y-auto max-h-[380px] leading-relaxed">
          {codeToShow}
        </pre>

        <div className="flex items-center justify-between pt-2 border-t border-[#2E2545] text-[11px] text-[#B4A9D0]">
          <span>SDK: @google/genai (Node) / google-genai (Python)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#251D3A] hover:bg-[#342850] text-[#F5F3FF] text-xs font-medium border border-[#2E2545] cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
