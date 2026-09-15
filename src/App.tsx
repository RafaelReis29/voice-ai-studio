import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Play,
  RotateCcw,
  Sliders,
  Radio,
  Clock,
  Download,
  Info
} from 'lucide-react';
import { Header } from './components/Header';
import { TextInputArea } from './components/TextInputArea';
import { DirectorsChair } from './components/DirectorsChair';
import { VoiceSelector } from './components/VoiceSelector';
import { WaveformPlayer } from './components/WaveformPlayer';
import { ComparePlayer } from './components/ComparePlayer';
import { ExportModal } from './components/ExportModal';
import { BatchExportModal } from './components/BatchExportModal';
import { HistorySidebar } from './components/HistorySidebar';
import { ApiCodeModal } from './components/ApiCodeModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { VoiceCloneModal } from './components/VoiceCloneModal';
import { Tooltip } from './components/Tooltip';
import { GEMINI_VOICES, TONE_PRESETS, SAMPLE_SCRIPTS } from './data/voices';
import {
  GenerationSettings,
  GenerationHistoryItem,
  BatchItem,
  SpeakerConfig,
  CustomVoice
} from './types';
import {
  base64ToUint8Array,
  pcmToWav
} from './utils/audioUtils';

export default function App() {
  // Local storage keys
  const STORAGE_KEY_SETTINGS = 'voice_ai_studio_settings';
  const STORAGE_KEY_HISTORY = 'voice_ai_studio_history';
  const STORAGE_KEY_TEXT = 'voice_ai_studio_text';
  const STORAGE_KEY_CUSTOM_VOICES = 'voice_ai_studio_custom_voices';

  // State: Text Input
  const [text, setText] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEY_TEXT) ||
      localStorage.getItem('crimson_voice_text') ||
      SAMPLE_SCRIPTS[0].text
    );
  });

  // State: Generation Settings
  const [settings, setSettings] = useState<GenerationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS) || localStorage.getItem('crimson_voice_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved settings:', e);
    }
    return {
      voice: 'Puck',
      language: 'en-US',
      speakingRate: 1.0,
      pitch: 0,
      styleInstruction: 'An upbeat, engaging delivery with crisp articulation.',
      sceneDirection: '',
      isMultiSpeaker: false,
      speakers: [
        { id: '1', name: 'Host', voice: 'Puck', role: 'Host' },
        { id: '2', name: 'Guest', voice: 'Kore', role: 'Guest' }
      ]
    };
  });

  // State: Custom Cloned Voices
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_VOICES) || localStorage.getItem('crimson_voice_custom_voices');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved custom voices:', e);
    }
    return [];
  });

  // State: History & Audio Output
  const [history, setHistory] = useState<GenerationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY) || localStorage.getItem('crimson_voice_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved history:', e);
    }
    return [];
  });

  const [currentAudio, setCurrentAudio] = useState<GenerationHistoryItem | null>(null);

  // Compare A/B Mode State
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [slotA, setSlotA] = useState<GenerationHistoryItem | null>(null);
  const [slotB, setSlotB] = useState<GenerationHistoryItem | null>(null);
  const [comparePlayingSlot, setComparePlayingSlot] = useState<'A' | 'B' | null>(null);
  const compareAudioRef = useRef<HTMLAudioElement | null>(null);

  // Batch Export Queue
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);

  // Generation & Engine Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isApiCodeOpen, setIsApiCodeOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVoiceCloneOpen, setIsVoiceCloneOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Check health & API Key on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch((e) => {
        console.warn('Health check unreachable:', e);
      });
  }, []);

  // Save settings and text to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEXT, text);
  }, [text]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_VOICES, JSON.stringify(customVoices));
    } catch (e) {
      console.warn('Could not persist custom voices to localStorage:', e);
    }
  }, [customVoices]);

  useEffect(() => {
    try {
      // Store last 10 generations in storage to respect quota
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 10)));
    } catch (e) {
      console.warn('Could not persist history to localStorage:', e);
    }
  }, [history]);

  // Handlers for Custom Voice Selection and Management
  const handleSelectCustomVoice = useCallback((custom: CustomVoice) => {
    setSettings((prev) => ({
      ...prev,
      voice: custom.baseVoice,
      pitch: custom.pitch,
      speakingRate: custom.speakingRate,
      styleInstruction: custom.styleInstruction,
      sceneDirection: custom.sceneDirection || prev.sceneDirection,
      customVoiceId: custom.id,
      customVoiceName: custom.name
    }));
    showToast(`Activated custom voice "${custom.name}" (Calibrated on ${custom.baseVoice})`, 'success');
  }, []);

  const handleSelectStandardVoice = useCallback((voiceId: string) => {
    setSettings((prev) => ({
      ...prev,
      voice: voiceId,
      customVoiceId: undefined,
      customVoiceName: undefined
    }));
  }, []);

  const handleSaveCustomVoice = useCallback((voice: CustomVoice, activateImmediately: boolean) => {
    setCustomVoices((prev) => [voice, ...prev]);
    if (activateImmediately) {
      handleSelectCustomVoice(voice);
    }
    showToast(`Custom voice "${voice.name}" saved to library.`, 'success');
  }, [handleSelectCustomVoice]);

  const handleDeleteCustomVoice = useCallback((id: string) => {
    setCustomVoices((prev) => prev.filter((v) => v.id !== id));
    setSettings((prev) => {
      if (prev.customVoiceId === id) {
        return {
          ...prev,
          customVoiceId: undefined,
          customVoiceName: undefined
        };
      }
      return prev;
    });
    showToast('Custom voice removed from library.', 'info');
  }, []);

  // Handle Synthesis Generation
  const handleGenerateAudio = useCallback(async () => {
    if (!text.trim()) {
      showToast('Please enter or select some text to synthesize.', 'error');
      return;
    }

    const encoder = new TextEncoder();
    if (encoder.encode(text).length > 8000) {
      showToast('Text exceeds the maximum 8,000-byte Gemini limit.', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: settings.voice,
          language: settings.language,
          speakingRate: settings.speakingRate,
          pitch: settings.pitch,
          styleInstruction: settings.styleInstruction,
          sceneDirection: settings.sceneDirection,
          isMultiSpeaker: settings.isMultiSpeaker,
          speakers: settings.speakers
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate speech with Gemini 3.1 Flash TTS.');
      }

      const newItem: GenerationHistoryItem = {
        id: `gen-${Date.now()}`,
        timestamp: Date.now(),
        text,
        settings: { ...settings },
        durationSeconds: data.durationSeconds || 2.0,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/pcm;rate=24000',
        sizeBytes: data.audioBase64.length,
        status: 'ready'
      };

      // Set active audio
      setCurrentAudio(newItem);

      // Populate Compare slots
      if (isCompareMode) {
        if (activeSlot === 'A') {
          setSlotA(newItem);
        } else {
          setSlotB(newItem);
        }
      } else {
        setSlotA(newItem);
      }

      // Prepend to history
      setHistory((prev) => [newItem, ...prev]);

      if (data.notice) {
        showToast(data.notice, 'info');
      } else {
        const displayName = settings.customVoiceName || settings.voice;
        showToast(`Voice generated with ${displayName} (${data.durationSeconds}s)`, 'success');
      }
    } catch (err: any) {
      console.error('Audio generation failure:', err);
      showToast(err.message || 'Speech generation encountered an error.', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [text, settings, isCompareMode, activeSlot]);

  // Surprise Me / Randomize Settings
  const handleRandomize = useCallback(() => {
    const randomVoice = GEMINI_VOICES[Math.floor(Math.random() * GEMINI_VOICES.length)];
    const randomPreset = TONE_PRESETS[Math.floor(Math.random() * TONE_PRESETS.length)];
    const randomRate = parseFloat((0.85 + Math.random() * 0.4).toFixed(2));
    const randomPitch = Math.floor(Math.random() * 7) - 3; // -3 to +3

    setSettings((prev) => ({
      ...prev,
      voice: randomVoice.id,
      speakingRate: randomRate,
      pitch: randomPitch,
      styleInstruction: randomPreset.instruction,
      customVoiceId: undefined,
      customVoiceName: undefined
    }));

    showToast(`Surprise Settings: ${randomVoice.name} • ${randomPreset.label} • ${randomRate}x`, 'info');
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter: Generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerateAudio();
      }

      // Space to play/pause (only when not typing in an input/textarea)
      if (e.code === 'Space') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'textarea' && activeTag !== 'input') {
          e.preventDefault();
          const playBtn = document.getElementById('btn-transport-play-pause');
          if (playBtn) playBtn.click();
        }
      }

      // Escape: close modals
      if (e.key === 'Escape') {
        setIsHistoryOpen(false);
        setIsBatchOpen(false);
        setIsApiCodeOpen(false);
        setIsShortcutsOpen(false);
        setIsExportModalOpen(false);
        setIsVoiceCloneOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerateAudio]);

  // Load sample script
  const handleLoadScript = (script: (typeof SAMPLE_SCRIPTS)[0]) => {
    setText(script.text);
    setSettings((prev) => ({
      ...prev,
      voice: script.voice,
      styleInstruction: script.styleInstruction,
      sceneDirection: script.sceneDirection,
      isMultiSpeaker: script.isMultiSpeaker || false,
      speakers: script.speakers || prev.speakers
    }));
    showToast(`Loaded "${script.title}" script.`, 'info');
  };

  // Load history item into editor
  const handleLoadHistoryItem = (item: GenerationHistoryItem) => {
    setText(item.text);
    setSettings(item.settings);
    setCurrentAudio(item);
    showToast(`Loaded "${item.settings.voice}" generation settings into editor.`, 'info');
  };

  // Compare Mode audio playback
  const handlePlayCompareSlot = (slot: 'A' | 'B') => {
    const targetItem = slot === 'A' ? slotA : slotB;
    if (!targetItem) return;

    if (comparePlayingSlot === slot) {
      if (compareAudioRef.current) {
        compareAudioRef.current.pause();
      }
      setComparePlayingSlot(null);
      return;
    }

    try {
      const rawBytes = base64ToUint8Array(targetItem.audioBase64);
      const wav = pcmToWav(rawBytes, 24000, 1, 16);
      const url = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));

      if (compareAudioRef.current) {
        compareAudioRef.current.pause();
      }

      const audio = new Audio(url);
      compareAudioRef.current = audio;
      setComparePlayingSlot(slot);

      audio.play().catch((e) => console.error(e));
      audio.onended = () => {
        setComparePlayingSlot(null);
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Failed to play compare audio:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0B1A] text-[#F5F3FF] flex flex-col selection:bg-[#7C3AED]/40 selection:text-white">
      {/* Top App Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenBatch={() => setIsBatchOpen(true)}
        onOpenApiCode={() => setIsApiCodeOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenVoiceClone={() => setIsVoiceCloneOpen(true)}
        onRandomize={handleRandomize}
        hasApiKey={hasApiKey}
        historyCount={history.length}
        customVoiceCount={customVoices.length}
      />

      {/* Main Studio Workstation Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col gap-6">
        {/* Studio Sub-Header with Quick Info and Generate Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#181225] border border-[#2E2545] rounded-2xl p-4 lg:px-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#251D3A] border border-[#7C3AED]/40 flex items-center justify-center">
              <Radio className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F3FF] tracking-wide flex items-center gap-2">
                Estúdio de Síntese Vocal
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#251D3A] text-[#DDD6FE] border border-[#7C3AED]/30">
                  24.000 Hz PCM Studio
                </span>
              </h2>
              <p className="text-xs text-[#B4A9D0]">
                Síntese vocal de alta fidelidade com Gemini 3.1 Flash TTS. Adicione diretrizes de cena e tags de entonação.
              </p>
            </div>
          </div>

          {/* Prominent Generate Button */}
          <div className="flex items-center gap-3">
            <Tooltip content="Sintetiza o áudio da voz e configurações selecionadas (Atalho: Ctrl+Enter)">
              <button
                id="btn-main-generate"
                type="button"
                onClick={handleGenerateAudio}
                disabled={isGenerating || !text.trim()}
                className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg cursor-pointer ${
                  isGenerating
                    ? 'bg-[#6D28D9] animate-pulse ring-2 ring-[#A78BFA]'
                    : 'bg-[#7C3AED] hover:bg-[#6D28D9] hover:shadow-[0_0_24px_rgba(124,58,237,0.5)] active:scale-98'
                } disabled:bg-[#251D3A] disabled:text-[#6B6386] disabled:cursor-not-allowed`}
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sintetizando Voz...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Gerar Áudio</span>
                    <span className="hidden md:inline text-[10px] font-mono font-normal opacity-90 ml-1">
                      (Ctrl+Enter)
                    </span>
                  </>
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Responsive Two-Column Production Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Text Input Area & Director's Chair */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <TextInputArea
              text={text}
              onChange={setText}
              onLoadScript={handleLoadScript}
              onClear={() => setText('')}
              styleInstruction={settings.styleInstruction}
              sceneDirection={settings.sceneDirection}
            />

            <DirectorsChair
              speakingRate={settings.speakingRate}
              pitch={settings.pitch}
              styleInstruction={settings.styleInstruction}
              sceneDirection={settings.sceneDirection}
              isMultiSpeaker={settings.isMultiSpeaker}
              speakers={settings.speakers}
              onRateChange={(rate) => setSettings((s) => ({ ...s, speakingRate: rate }))}
              onPitchChange={(pitch) => setSettings((s) => ({ ...s, pitch }))}
              onStyleChange={(inst) => setSettings((s) => ({ ...s, styleInstruction: inst }))}
              onSceneChange={(scene) => setSettings((s) => ({ ...s, sceneDirection: scene }))}
              onToggleMultiSpeaker={(enabled) =>
                setSettings((s) => ({ ...s, isMultiSpeaker: enabled }))
              }
              onSpeakersChange={(speakers) => setSettings((s) => ({ ...s, speakers }))}
            />
          </div>

          {/* Right Column (5 cols): Waveform Monitor, A/B Compare & Voice Selector */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Waveform Player Monitor */}
            <WaveformPlayer
              currentAudio={currentAudio}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onToggleCompare={() => setIsCompareMode(!isCompareMode)}
              isCompareMode={isCompareMode}
              onAddToBatch={(item) => {
                const batchItem: BatchItem = {
                  id: `batch-${Date.now()}`,
                  title: item.text.slice(0, 30).trim() || 'Audio Item',
                  text: item.text,
                  voice: item.settings.voice,
                  speakingRate: item.settings.speakingRate,
                  styleInstruction: item.settings.styleInstruction,
                  status: 'done',
                  audioBase64: item.audioBase64,
                  durationSeconds: item.durationSeconds
                };
                setBatchQueue((prev) => [...prev, batchItem]);
                showToast('Added audio segment to Batch Queue.', 'success');
              }}
            />

            {/* A/B Comparison Suite if activated */}
            {isCompareMode && (
              <ComparePlayer
                slotA={slotA}
                slotB={slotB}
                activeSlot={activeSlot}
                onSelectSlot={setActiveSlot}
                onPlaySlot={handlePlayCompareSlot}
                playingSlot={comparePlayingSlot}
              />
            )}

            {/* Voice Engine & Language Library */}
            <VoiceSelector
              selectedVoice={settings.voice}
              selectedLanguage={settings.language}
              onSelectVoice={handleSelectStandardVoice}
              onSelectLanguage={(langCode) =>
                setSettings((s) => ({ ...s, language: langCode }))
              }
              customVoices={customVoices}
              selectedCustomVoiceId={settings.customVoiceId}
              onSelectCustomVoice={handleSelectCustomVoice}
              onDeleteCustomVoice={handleDeleteCustomVoice}
              onOpenCloneModal={() => setIsVoiceCloneOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Footer info & SynthID watermark acknowledgment */}
      <footer className="border-t border-[#2E2545] py-4 px-6 text-center text-xs text-[#B4A9D0] bg-[#0F0B1A] mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
            <span className="font-semibold text-[#F5F3FF]">VOICE AI STUDIO • ESTÚDIO DE ÁUDIO</span>
            <span className="text-[#6B6386]">•</span>
            <span className="text-[#B4A9D0]">Gemini 3.1 Flash TTS</span>
          </div>
          <p className="text-[11px] text-[#B4A9D0] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#A78BFA]" />
            Todas as vozes sintetizadas contêm marca d'água digital SynthID™ conforme padrões de segurança de IA.
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <VoiceCloneModal
        isOpen={isVoiceCloneOpen}
        onClose={() => setIsVoiceCloneOpen(false)}
        onSaveVoice={handleSaveCustomVoice}
        existingCustomCount={customVoices.length}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        audioItem={currentAudio}
        onExportSuccess={(fmt) => showToast(`Áudio exportado em ${fmt} com sucesso!`, 'success')}
      />

      <BatchExportModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        batchQueue={batchQueue}
        onUpdateQueue={setBatchQueue}
        currentSettings={settings}
        currentText={text}
      />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadItem={handleLoadHistoryItem}
        onClearHistory={() => {
          setHistory([]);
          showToast('Histórico de gerações limpo.', 'info');
        }}
        onDeleteItem={(id) => {
          setHistory((prev) => prev.filter((h) => h.id !== id));
        }}
        activeAudioId={currentAudio?.id}
        onPlayItem={(item) => setCurrentAudio(item)}
        isPlayingActive={false}
      />

      <ApiCodeModal
        isOpen={isApiCodeOpen}
        onClose={() => setIsApiCodeOpen(false)}
        settings={settings}
        text={text}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          id="toast-notification"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'bg-[#181225] border-[#F87171] text-[#F87171]'
              : toast.type === 'success'
              ? 'bg-[#181225] border-[#7C3AED] text-[#DDD6FE]'
              : 'bg-[#181225] border-[#2E2545] text-[#F5F3FF]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#A78BFA] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
