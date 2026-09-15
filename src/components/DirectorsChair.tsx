import React, { useState } from 'react';
import {
  Sliders,
  Users,
  Compass,
  MessageSquare,
  Smile,
  Briefcase,
  Zap,
  Moon,
  Flame,
  Wind,
  Minus,
  Sparkles,
  Info,
  Layers,
  Wand2,
  Plus,
  Trash2
} from 'lucide-react';
import { TONE_PRESETS, GEMINI_VOICES } from '../data/voices';
import { SpeakerConfig, TonePreset } from '../types';
import { Tooltip } from './Tooltip';

interface DirectorsChairProps {
  speakingRate: number;
  pitch: number;
  styleInstruction: string;
  sceneDirection: string;
  isMultiSpeaker: boolean;
  speakers: SpeakerConfig[];
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onStyleChange: (instruction: string) => void;
  onSceneChange: (scene: string) => void;
  onToggleMultiSpeaker: (enabled: boolean) => void;
  onSpeakersChange: (speakers: SpeakerConfig[]) => void;
}

// Qualidades de Voz (Timbre e Textura)
const VOICE_TEXTURES = [
  { id: 'aveludado', label: 'Aveludado', desc: 'Timbre macio e quente' },
  { id: 'ressonante', label: 'Ressonante', desc: 'Presença e projeção acústica' },
  { id: 'grave', label: 'Grave', desc: 'Resonância torácica profunda' },
  { id: 'sussurrado', label: 'Sussurrado', desc: 'Ar acústico rente ao microfone' },
  { id: 'articulado', label: 'Articulado', desc: 'Dissonância e dicção impecáveis' },
  { id: 'agil', label: 'Ágil', desc: 'Cadência veloz e enérgica' },
  { id: 'metalico', label: 'Metálico', desc: 'Harmônicos agudos cortantes' },
  { id: 'ofegante', label: 'Ofegante', desc: 'Respiração audível e emotiva' }
];

// Níveis de Intensidade Emocional (Restraint -> Exposure)
const EMOTION_LEVELS = [
  { level: 1, label: 'Sutil', sub: 'Veiled', prompt: 'contido, neutro e sutil, com expressão mínima' },
  { level: 2, label: 'Controlado', sub: 'Composed', prompt: 'controlado, equilibrado e profissional' },
  { level: 3, label: 'Marcado', sub: 'Pronounced', prompt: 'marcado, expressivo e com ênfase evidente' },
  { level: 4, label: 'Intenso', sub: 'Unhinged', prompt: 'muito intenso, apaixonado e dramático' },
  { level: 5, label: 'Fragmentado', sub: 'Fractured', prompt: 'extremamente emocionado, quase sem fôlego e fragmentado' }
];

export const DirectorsChair: React.FC<DirectorsChairProps> = ({
  speakingRate,
  pitch,
  styleInstruction,
  sceneDirection,
  isMultiSpeaker,
  speakers,
  onRateChange,
  onPitchChange,
  onStyleChange,
  onSceneChange,
  onToggleMultiSpeaker,
  onSpeakersChange
}) => {
  const [activePreset, setActivePreset] = useState<string | null>('neutral');
  const [showSceneHelp, setShowSceneHelp] = useState(false);
  const [emotionLevel, setEmotionLevel] = useState<number>(2);
  const [selectedTextures, setSelectedTextures] = useState<string[]>([]);

  const handleApplyPreset = (preset: TonePreset) => {
    setActivePreset(preset.id);
    onRateChange(preset.rate);
    onPitchChange(preset.pitch);
    onStyleChange(preset.instruction);
  };

  const toggleTexture = (label: string) => {
    setSelectedTextures((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  // Construtor de Voz / Gerar Combinação (Compose)
  const handleComposeCombination = () => {
    const currentEmotion = EMOTION_LEVELS.find((e) => e.level === emotionLevel) || EMOTION_LEVELS[1];
    const texturePhrase = selectedTextures.length > 0
      ? `com timbre ${selectedTextures.join(', ')}`
      : '';
    const basePhrase = styleInstruction.trim() || 'Leitura natural e clara';
    
    const combined = `${basePhrase}, com interpretação ${currentEmotion.prompt} ${texturePhrase}`.trim();
    onStyleChange(combined);
    setActivePreset(null);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smile':
        return <Smile className="w-4 h-4 text-[#A78BFA]" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 text-[#A78BFA]" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-[#FBBF24]" />;
      case 'Moon':
        return <Moon className="w-4 h-4 text-[#A78BFA]" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-[#F87171]" />;
      case 'Wind':
        return <Wind className="w-4 h-4 text-[#A78BFA]" />;
      case 'Minus':
      default:
        return <Minus className="w-4 h-4 text-[#B4A9D0]" />;
    }
  };

  const styleInspirations = [
    'Narrador de documentário sereno',
    'Locutor esportivo enérgico',
    'Guia de meditação tranquilo',
    'Apresentador corporativo confiante',
    'Contador de histórias intimista'
  ];

  const currentEmotionObj = EMOTION_LEVELS.find((e) => e.level === emotionLevel) || EMOTION_LEVELS[1];

  return (
    <div className="bg-[#181225] border border-[#2E2545] rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1F1830] border border-[#2E2545] flex items-center justify-center">
            <Sliders className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F5F3FF]">
              Ajustes da Voz
            </h2>
            <p className="text-xs text-[#B4A9D0]">
              Controle de ritmo, afinação, expressão e ambiente
            </p>
          </div>
        </div>

        {/* Multi-speaker Toggle */}
        <Tooltip content="Permite usar vozes diferentes para cada personagem em uma mesma conversa.">
          <button
            id="btn-multi-speaker-toggle"
            type="button"
            onClick={() => onToggleMultiSpeaker(!isMultiSpeaker)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
              isMultiSpeaker
                ? 'bg-[#7C3AED]/25 text-[#F5F3FF] border-[#7C3AED] shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                : 'bg-[#1F1830] text-[#B4A9D0] border-[#2E2545] hover:border-[#A78BFA]/50'
            }`}
          >
            <Users className="w-4 h-4 text-[#A78BFA]" />
            <span>Modo Diálogo (várias vozes)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isMultiSpeaker ? 'bg-[#7C3AED]' : 'bg-[#6B6386]'
              }`}
            />
          </button>
        </Tooltip>
      </div>

      {/* Atalhos de Tom (Quick-Tone Presets) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#F5F3FF] flex items-center gap-1.5">
            <span>Atalhos de Tom</span>
          </label>
          <span className="text-xs text-[#B4A9D0]">Aplicações imediatas de tom</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {TONE_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <Tooltip key={preset.id} content={preset.instruction}>
                <button
                  id={`btn-preset-${preset.id}`}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                      : 'bg-[#1F1830] text-[#F5F3FF] border-[#2E2545] hover:border-[#A78BFA]/50 hover:bg-[#251D3A]'
                  }`}
                >
                  {getPresetIcon(preset.iconName)}
                  <span>{preset.label}</span>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#2E2545] w-full" />

      {/* Sliders: Velocidade da Fala & Tom (Pitch) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Velocidade da Fala */}
        <div className="bg-[#1F1830] border border-[#2E2545] rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <Tooltip content="Ajusta a rapidez da leitura. 1.0x é o ritmo normal.">
              <span className="text-sm font-medium text-[#F5F3FF] cursor-help">
                Velocidade da Fala
              </span>
            </Tooltip>
            <span className="text-sm font-mono font-bold text-[#A78BFA]">
              {speakingRate.toFixed(2)}x
            </span>
          </div>
          <input
            id="slider-speaking-rate"
            type="range"
            min="0.25"
            max="2.0"
            step="0.05"
            value={speakingRate}
            onChange={(e) => {
              setActivePreset(null);
              onRateChange(parseFloat(e.target.value));
            }}
            className="w-full accent-[#7C3AED] bg-[#181225] h-2 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs font-mono text-[#B4A9D0]">
            <span>0.25x Lento</span>
            <span className="text-[#F5F3FF]">1.0x Normal</span>
            <span>2.0x Rápido</span>
          </div>
        </div>

        {/* Tom (Pitch) */}
        <div className="bg-[#1F1830] border border-[#2E2545] rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <Tooltip content="Deixa a voz mais grave ou mais aguda. Valores à esquerda são mais graves.">
              <span className="text-sm font-medium text-[#F5F3FF] cursor-help">
                Tom (Pitch)
              </span>
            </Tooltip>
            <span className="text-sm font-mono font-bold text-[#A78BFA]">
              {pitch > 0 ? `+${pitch}` : pitch} st
            </span>
          </div>
          <input
            id="slider-pitch-adjust"
            type="range"
            min="-12"
            max="12"
            step="1"
            value={pitch}
            onChange={(e) => {
              setActivePreset(null);
              onPitchChange(parseInt(e.target.value, 10));
            }}
            className="w-full accent-[#7C3AED] bg-[#181225] h-2 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs font-mono text-[#B4A9D0]">
            <span>-12 Grave</span>
            <span className="text-[#F5F3FF]">0 Padrão</span>
            <span>+12 Agudo</span>
          </div>
        </div>
      </div>

      {/* Perfil Emocional & Intensidade Emocional Slider (Restraint -> Exposure) */}
      <div className="bg-[#1F1830] border border-[#2E2545] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tooltip content="Resumo visual do tipo de emoção que esta voz transmite.">
              <span className="text-sm font-medium text-[#F5F3FF] flex items-center gap-1.5 cursor-help">
                <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                Perfil Emocional
              </span>
            </Tooltip>
          </div>
          <div className="text-xs font-medium text-[#A78BFA]">
            {currentEmotionObj.label}{' '}
            <span className="text-[#B4A9D0] italic">({currentEmotionObj.sub})</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-[#B4A9D0]">
            <Tooltip content="Controla o quanto a voz expressa emoção. À esquerda é contida e neutra; à direita é intensa e dramática.">
              <span className="cursor-help font-medium text-[#F5F3FF]">
                Intensidade Emocional
              </span>
            </Tooltip>
            <span className="font-mono text-xs text-[#B4A9D0]">Nível {emotionLevel} / 5</span>
          </div>
          <input
            id="slider-emotion-intensity"
            type="range"
            min="1"
            max="5"
            step="1"
            value={emotionLevel}
            onChange={(e) => setEmotionLevel(parseInt(e.target.value, 10))}
            className="w-full accent-[#7C3AED] bg-[#181225] h-2 rounded-lg appearance-none cursor-pointer"
          />
          <div className="grid grid-cols-5 text-center text-xs text-[#B4A9D0] pt-1">
            <span className={emotionLevel === 1 ? 'text-[#A78BFA] font-bold' : ''}>Sutil</span>
            <span className={emotionLevel === 2 ? 'text-[#A78BFA] font-bold' : ''}>Controlado</span>
            <span className={emotionLevel === 3 ? 'text-[#A78BFA] font-bold' : ''}>Marcado</span>
            <span className={emotionLevel === 4 ? 'text-[#A78BFA] font-bold' : ''}>Intenso</span>
            <span className={emotionLevel === 5 ? 'text-[#A78BFA] font-bold' : ''}>Fragmentado</span>
          </div>
        </div>
      </div>

      {/* Qualidades de Voz (Timbre e Textura) & Construtor de Voz (Combination Engine) */}
      <div className="bg-[#1F1830] border border-[#2E2545] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#A78BFA]" />
            <span className="text-sm font-medium text-[#F5F3FF]">Qualidades de Voz</span>
            <span className="text-xs text-[#B4A9D0] italic">— Timbre e Textura</span>
          </div>

          <Tooltip content="Junta o estilo, a intensidade e as qualidades escolhidas em uma única configuração pronta para usar.">
            <button
              id="btn-compose-combination"
              type="button"
              onClick={handleComposeCombination}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] transition-all cursor-pointer shadow-sm"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Gerar Combinação</span>
            </button>
          </Tooltip>
        </div>

        {/* Texture Chips */}
        <div className="flex flex-wrap gap-1.5">
          {VOICE_TEXTURES.map((t) => {
            const isSelected = selectedTextures.includes(t.label);
            return (
              <Tooltip key={t.id} content={t.desc}>
                <button
                  type="button"
                  onClick={() => toggleTexture(t.label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm'
                      : 'bg-[#181225] text-[#B4A9D0] border-[#2E2545] hover:border-[#A78BFA]/50 hover:text-[#F5F3FF]'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {t.label}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Direção de Estilo (Style Instruction) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Tooltip content="Descreva com suas palavras como a voz deve soar. Exemplo: 'narrador de documentário, calmo e claro'.">
            <label
              htmlFor="style-instruction-input"
              className="text-sm font-medium text-[#F5F3FF] flex items-center gap-1.5 cursor-help"
            >
              <MessageSquare className="w-4 h-4 text-[#A78BFA]" />
              Direção de Estilo
            </label>
          </Tooltip>
          <span className="text-xs text-[#B4A9D0]">Guiado pelo Gemini TTS</span>
        </div>

        <input
          id="style-instruction-input"
          type="text"
          value={styleInstruction}
          onChange={(e) => {
            setActivePreset(null);
            onStyleChange(e.target.value);
          }}
          placeholder="Ex: narrador de documentário sereno, com voz aveludada e pausas dramáticas..."
          className="w-full bg-[#1F1830] border border-[#2E2545] focus:border-[#A78BFA] focus:outline-none rounded-xl px-4 py-3 text-base text-[#F5F3FF] placeholder-[#6B6386] font-sans"
        />

        {/* Quick Style Chips */}
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {styleInspirations.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActivePreset(null);
                onStyleChange(item);
              }}
              className="px-2.5 py-1 rounded-md text-xs text-[#B4A9D0] bg-[#1F1830] hover:bg-[#2E2545] hover:text-[#F5F3FF] border border-[#2E2545] transition-colors cursor-pointer"
            >
              + {item}
            </button>
          ))}
        </div>
      </div>

      {/* Modo Diálogo / Elenco de Vozes (Multi-Speaker Dialogue Mode Config Panel) */}
      {isMultiSpeaker && (
        <div className="bg-[#1F1830] border border-[#7C3AED]/40 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#A78BFA]" />
              <span className="text-sm font-semibold text-[#F5F3FF]">
                Elenco de Vozes
              </span>
            </div>
            <span className="text-xs font-mono text-[#A78BFA]">
              Formato: &apos;Nome: Fala do diálogo&apos;
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {speakers.map((spk, idx) => (
              <div
                key={spk.id}
                className="bg-[#181225] border border-[#2E2545] rounded-xl p-3 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#B4A9D0]">
                  <span>PERSONAGEM {idx + 1}</span>
                  <span className="text-[#A78BFA] font-semibold">{spk.role}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={spk.name}
                    onChange={(e) => {
                      const updated = [...speakers];
                      updated[idx].name = e.target.value;
                      onSpeakersChange(updated);
                    }}
                    placeholder="Nome no texto (ex: Diretor)"
                    className="w-1/2 bg-[#1F1830] border border-[#2E2545] rounded-lg px-3 py-2 text-sm text-[#F5F3FF] focus:border-[#A78BFA] outline-none"
                  />
                  <select
                    value={spk.voice}
                    onChange={(e) => {
                      const updated = [...speakers];
                      updated[idx].voice = e.target.value;
                      onSpeakersChange(updated);
                    }}
                    className="w-1/2 bg-[#1F1830] border border-[#2E2545] rounded-lg px-3 py-2 text-sm text-[#F5F3FF] focus:border-[#A78BFA] outline-none"
                  >
                    {GEMINI_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.gender === 'Male' ? 'Masc' : 'Fem'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contexto da Cena (Scene Direction Panel) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Tooltip content="Explique o ambiente ou o clima geral da fala. Isso ajuda a IA a ajustar o tom da leitura inteira.">
            <label
              htmlFor="scene-direction-input"
              className="text-sm font-medium text-[#F5F3FF] flex items-center gap-1.5 cursor-help"
            >
              <Compass className="w-4 h-4 text-[#A78BFA]" />
              Contexto da Cena
            </label>
          </Tooltip>
          <button
            type="button"
            onClick={() => setShowSceneHelp(!showSceneHelp)}
            className="text-xs text-[#B4A9D0] hover:text-[#F5F3FF] flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showSceneHelp ? 'Ocultar Ajuda' : 'Como funciona?'}</span>
          </button>
        </div>

        {showSceneHelp && (
          <div className="p-3 rounded-xl bg-[#1F1830] border border-[#2E2545] text-xs text-[#B4A9D0] leading-relaxed">
            O motor Gemini TTS compreende a descrição do ambiente (ex: auditório vazio, quarto silencioso, tempestade lá fora) para modular a reverberação e a postura vocal naturalmente.
          </div>
        )}

        <textarea
          id="scene-direction-input"
          value={sceneDirection}
          onChange={(e) => onSceneChange(e.target.value)}
          placeholder="Ex: Sala de conferências silenciosa com eco suave, ambiente solene e próximo ao microfone..."
          rows={2}
          className="w-full bg-[#1F1830] border border-[#2E2545] focus:border-[#A78BFA] focus:outline-none rounded-xl px-4 py-2.5 text-base text-[#F5F3FF] placeholder-[#6B6386] font-sans resize-none"
        />
      </div>
    </div>
  );
};

