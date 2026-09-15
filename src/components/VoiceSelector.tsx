import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Globe,
  Mic,
  Check,
  Filter,
  Dna,
  Plus,
  Play,
  Pause,
  Trash2,
  Sparkles,
  Sliders,
  Volume2
} from 'lucide-react';
import { GEMINI_VOICES, LANGUAGES } from '../data/voices';
import { VoiceInfo, CustomVoice } from '../types';
import { pcmBase64ToWavUrl } from '../utils/audioUtils';
import { Tooltip } from './Tooltip';

interface VoiceSelectorProps {
  selectedVoice: string;
  selectedLanguage: string;
  onSelectVoice: (voiceId: string) => void;
  onSelectLanguage: (langCode: string) => void;
  customVoices?: CustomVoice[];
  selectedCustomVoiceId?: string;
  onSelectCustomVoice?: (customVoice: CustomVoice) => void;
  onDeleteCustomVoice?: (id: string) => void;
  onOpenCloneModal?: () => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  selectedLanguage,
  onSelectVoice,
  onSelectLanguage,
  customVoices = [],
  selectedCustomVoiceId,
  onSelectCustomVoice,
  onDeleteCustomVoice,
  onOpenCloneModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [styleFilter, setStyleFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'gemini'>('all');
  const [langSearch, setLangSearch] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Quick preview player state for custom voices in list
  const [playingCustomId, setPlayingCustomId] = useState<string | null>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayCustomPreview = (e: React.MouseEvent, voice: CustomVoice) => {
    e.stopPropagation();
    if (!voice.previewAudioBase64) return;

    if (playingCustomId === voice.id) {
      if (customAudioRef.current) customAudioRef.current.pause();
      setPlayingCustomId(null);
      return;
    }

    try {
      const url = pcmBase64ToWavUrl(voice.previewAudioBase64, 24000);
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }

      const audio = new Audio(url);
      customAudioRef.current = audio;
      setPlayingCustomId(voice.id);

      audio.play().catch((err) => console.error(err));
      audio.onended = () => {
        setPlayingCustomId(null);
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Failed to play custom preview:', err);
    }
  };

  // Filter custom voices
  const filteredCustomVoices = useMemo(() => {
    return customVoices.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.baseVoice.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = genderFilter === 'All' || v.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [customVoices, searchQuery, genderFilter]);

  // Filter Gemini standard voices
  const filteredVoices = useMemo(() => {
    return GEMINI_VOICES.filter((voice) => {
      const matchesSearch =
        voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.character.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.tone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGender =
        genderFilter === 'All' || voice.gender === genderFilter;

      const matchesStyle =
        styleFilter === 'All' ||
        voice.style.toLowerCase().includes(styleFilter.toLowerCase());

      return matchesSearch && matchesGender && matchesStyle;
    });
  }, [searchQuery, genderFilter, styleFilter]);

  // Filter 70+ languages
  const filteredLanguages = useMemo(() => {
    if (!langSearch.trim()) return LANGUAGES;
    const q = langSearch.toLowerCase();
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [langSearch]);

  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];
  const currentVoiceObj = GEMINI_VOICES.find((v) => v.id === selectedVoice) || GEMINI_VOICES[0];
  const currentCustomVoice = customVoices.find((v) => v.id === selectedCustomVoiceId);

  return (
    <div className="bg-[#181225] border border-[#2E2545] rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1F1830] border border-[#2E2545] flex items-center justify-center">
            <Mic className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#F5F3FF]">
                Biblioteca de Vozes
              </h2>
              <span className="text-xs text-[#B4A9D0] italic">— Vozes Prontas</span>
            </div>
            <p className="text-xs text-[#B4A9D0]">
              Selecione o estilo base ideal para o seu projeto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clone Voice Button */}
          {onOpenCloneModal && (
            <Tooltip content="Cria uma nova voz a partir de um arquivo de áudio enviado, analisando timbre e ritmo.">
              <button
                id="btn-open-voice-clone"
                type="button"
                onClick={onOpenCloneModal}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] shadow-[0_0_12px_rgba(124,58,237,0.3)] transition-all cursor-pointer"
              >
                <Dna className="w-4 h-4 text-[#F5F3FF]" />
                <span>Clonar Voz</span>
              </button>
            </Tooltip>
          )}

          {/* Language Selector Dropdown (70+ Languages) */}
          <div className="relative">
            <Tooltip content="Escolha o idioma de pronúncia. Mais de 70 idiomas e dialetos disponíveis.">
              <button
                id="btn-language-selector-toggle"
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#F5F3FF] bg-[#1F1830] hover:bg-[#2E2545] border border-[#2E2545] hover:border-[#A78BFA]/50 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#A78BFA]" />
                <span className="max-w-[120px] truncate">{currentLangObj.name}</span>
                <span className="text-xs font-mono text-[#B4A9D0]">{currentLangObj.code}</span>
              </button>
            </Tooltip>

            {isLangDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-72 bg-[#181225] border border-[#2E2545] rounded-xl shadow-2xl p-2.5 z-40">
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#B4A9D0]" />
                    <input
                      type="text"
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      placeholder="Buscar em 70+ idiomas..."
                      autoFocus
                      className="w-full bg-[#1F1830] border border-[#2E2545] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F3FF] placeholder-[#6B6386] focus:outline-none focus:border-[#A78BFA]"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {filteredLanguages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          onSelectLanguage(l.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          selectedLanguage === l.code
                            ? 'bg-[#7C3AED]/25 text-[#F5F3FF] font-medium'
                            : 'text-[#B4A9D0] hover:bg-[#1F1830] hover:text-[#F5F3FF]'
                        }`}
                      >
                        <span className="truncate">{l.name}</span>
                        <span className="text-xs font-mono text-[#6B6386] ml-2 shrink-0">
                          {l.code}
                        </span>
                      </button>
                    ))}
                    {filteredLanguages.length === 0 && (
                      <div className="text-center py-4 text-xs text-[#B4A9D0]">
                        Nenhum idioma encontrado para &quot;{langSearch}&quot;
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Voice Library Tabs (Todas / Salvas / Gemini) */}
      <div className="flex items-center justify-between border-b border-[#2E2545] pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#1F1830]'
            }`}
          >
            Todas ({GEMINI_VOICES.length + customVoices.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#1F1830]'
            }`}
          >
            <Dna className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Vozes Salvas ({customVoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'gemini'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#1F1830]'
            }`}
          >
            Principais ({GEMINI_VOICES.length})
          </button>
        </div>

        {/* Gender Filter Chips */}
        <div className="flex items-center gap-1 bg-[#1F1830] p-1 rounded-xl border border-[#2E2545]">
          <Tooltip content="Exibir vozes de qualquer gênero">
            <button
              type="button"
              onClick={() => setGenderFilter('All')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                genderFilter === 'All'
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-[#B4A9D0] hover:text-[#F5F3FF]'
              }`}
            >
              Todos
            </button>
          </Tooltip>

          <Tooltip content="Filtrar por vozes masculinas">
            <button
              type="button"
              onClick={() => setGenderFilter('Male')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                genderFilter === 'Male'
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-[#B4A9D0] hover:text-[#F5F3FF]'
              }`}
            >
              Masculino
            </button>
          </Tooltip>

          <Tooltip content="Filtrar por vozes femininas">
            <button
              type="button"
              onClick={() => setGenderFilter('Female')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                genderFilter === 'Female'
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-[#B4A9D0] hover:text-[#F5F3FF]'
              }`}
            >
              Feminino
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#B4A9D0]" />
        <input
          id="input-voice-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar vozes por timbre, personagem, estilo ou nome..."
          className="w-full bg-[#1F1830] border border-[#2E2545] focus:border-[#A78BFA] focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-base text-[#F5F3FF] placeholder-[#6B6386]"
        />
      </div>

      {/* Voices List & Grid */}
      <div className="space-y-5 max-h-[380px] overflow-y-auto pr-1">
        {/* SECTION: CUSTOM VOICES */}
        {(activeTab === 'all' || activeTab === 'custom') && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
                <Dna className="w-4 h-4 text-[#FBBF24]" />
                Vozes Salvas e Clonadas ({filteredCustomVoices.length})
              </span>
              {onOpenCloneModal && (
                <button
                  type="button"
                  onClick={onOpenCloneModal}
                  className="text-xs text-[#A78BFA] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Clonar Nova Voz</span>
                </button>
              )}
            </div>

            {filteredCustomVoices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCustomVoices.map((custom) => {
                  const isSelected = selectedCustomVoiceId === custom.id;
                  const isPlaying = playingCustomId === custom.id;

                  return (
                    <div
                      key={custom.id}
                      id={`custom-voice-card-${custom.id}`}
                      onClick={() => onSelectCustomVoice && onSelectCustomVoice(custom)}
                      className={`group relative rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-[#2A1D44] border-[#7C3AED] shadow-[0_0_18px_rgba(124,58,237,0.3)] ring-2 ring-[#7C3AED]'
                          : 'bg-[#1F1830] border-[#2E2545] hover:border-[#A78BFA]/60 hover:bg-[#251D3A]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                            <span className="text-sm font-bold text-[#F5F3FF] tracking-wide truncate">
                              {custom.name}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#7C3AED] text-white shrink-0">
                              SALVA
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Play Preview button */}
                            {custom.previewAudioBase64 && (
                              <Tooltip content="Ouvir demonstração rápida desta voz">
                                <button
                                  type="button"
                                  onClick={(e) => handlePlayCustomPreview(e, custom)}
                                  className="w-7 h-7 rounded-full bg-[#181225] hover:bg-[#7C3AED] text-[#F5F3FF] flex items-center justify-center transition-colors cursor-pointer border border-[#2E2545]"
                                >
                                  {isPlaying ? (
                                    <Pause className="w-3.5 h-3.5 fill-current" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                  )}
                                </button>
                              </Tooltip>
                            )}

                            {/* Delete custom voice */}
                            {onDeleteCustomVoice && (
                              <Tooltip content="Excluir esta voz personalizada">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Excluir voz personalizada "${custom.name}"?`)) {
                                      onDeleteCustomVoice(custom.id);
                                    }
                                  }}
                                  className="w-7 h-7 rounded-full hover:bg-[#F87171]/20 text-[#B4A9D0] hover:text-[#F87171] flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>
                            )}

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shadow ml-0.5">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-xs font-medium text-[#A78BFA] mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                          <span>Ajustada sobre {custom.baseVoice}</span>
                          <span className="text-[#6B6386]">•</span>
                          <span className="font-mono text-xs text-[#B4A9D0]">
                            {custom.pitch >= 0 ? `+${custom.pitch}` : custom.pitch}st • {custom.speakingRate}x
                          </span>
                        </div>

                        <p className="text-xs text-[#B4A9D0] line-clamp-2 leading-relaxed">
                          {custom.description}
                        </p>
                      </div>

                      {/* Acoustic attributes tags */}
                      {custom.acousticProfile && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[#2E2545]">
                          {custom.acousticProfile.timbre && (
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#181225] text-[#F5F3FF] border border-[#2E2545]">
                              {custom.acousticProfile.timbre}
                            </span>
                          )}
                          {custom.acousticProfile.cadence && (
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#181225] text-[#B4A9D0] border border-[#2E2545]">
                              {custom.acousticProfile.cadence}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                onClick={onOpenCloneModal}
                className="p-5 rounded-xl border border-dashed border-[#2E2545] hover:border-[#7C3AED]/60 bg-[#1F1830] hover:bg-[#251D3A] transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#181225] border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA]">
                    <Dna className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#F5F3FF] text-sm">Nenhuma voz personalizada criada ainda</div>
                    <div className="text-xs text-[#B4A9D0]">Envie um arquivo de áudio para clonar o timbre de quem você quiser</div>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-lg bg-[#7C3AED] text-white font-bold text-xs shrink-0 shadow-sm">
                  + Clonar Voz
                </span>
              </div>
            )}
          </div>
        )}

        {/* SECTION: STANDARD GEMINI VOICES */}
        {(activeTab === 'all' || activeTab === 'gemini') && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#B4A9D0] uppercase tracking-wider">
                Vozes Nativas Gemini 3.1 ({filteredVoices.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredVoices.map((voice: VoiceInfo) => {
                const isSelected = !selectedCustomVoiceId && selectedVoice === voice.id;
                return (
                  <div
                    key={voice.id}
                    id={`voice-card-${voice.id}`}
                    onClick={() => onSelectVoice(voice.id)}
                    className={`group relative rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#2A1D44] border-[#7C3AED] shadow-[0_0_18px_rgba(124,58,237,0.3)] ring-2 ring-[#7C3AED]'
                        : 'bg-[#1F1830] border-[#2E2545] hover:border-[#A78BFA]/50 hover:bg-[#251D3A]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#F5F3FF] tracking-wide">
                            {voice.name}
                          </span>
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded ${
                              voice.gender === 'Female'
                                ? 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40'
                                : 'bg-blue-950/40 text-blue-300 border border-blue-800/40'
                            }`}
                          >
                            {voice.gender === 'Female' ? 'Feminino' : 'Masculino'}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="text-sm font-medium text-[#A78BFA] mb-1.5">
                        {voice.character}
                      </div>

                      <p className="text-xs text-[#B4A9D0] line-clamp-2 leading-relaxed">
                        {voice.description}
                      </p>
                    </div>

                    {/* Personality Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#2E2545]">
                      {voice.personality.slice(0, 3).map((trait, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-xs font-mono bg-[#181225] text-[#B4A9D0] border border-[#2E2545]"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredVoices.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-[#B4A9D0]">
                  Nenhuma voz encontrada com os filtros atuais.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Currently Selected Voice Summary Bar (Configuração Atual) */}
      <div className="bg-[#1F1830] border border-[#2E2545] rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Tooltip content="Resumo da voz e do tom atualmente selecionados para a geração.">
            <span className="text-[#B4A9D0] font-medium cursor-help">Configuração Atual:</span>
          </Tooltip>
          {currentCustomVoice ? (
            <>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#7C3AED] text-white">
                SALVA
              </span>
              <span className="font-semibold text-[#F5F3FF]">
                {currentCustomVoice.name}
              </span>
              <span className="text-[#6B6386]">•</span>
              <span className="text-[#A78BFA]">
                Ajustada em {currentCustomVoice.baseVoice}
              </span>
            </>
          ) : (
            <>
              <span className="font-semibold text-[#F5F3FF]">
                {currentVoiceObj.name} ({currentVoiceObj.gender === 'Female' ? 'Fem' : 'Masc'})
              </span>
              <span className="text-[#6B6386]">•</span>
              <span className="text-[#A78BFA]">{currentVoiceObj.character}</span>
            </>
          )}
        </div>
        <span className="text-xs font-mono text-[#B4A9D0] hidden sm:inline">
          {currentCustomVoice ? 'Clone Acústico' : currentVoiceObj.accent}
        </span>
      </div>
    </div>
  );
};

