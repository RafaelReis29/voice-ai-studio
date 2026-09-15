import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileAudio,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Dna,
  Volume2,
  Sliders,
  Radio,
  ArrowRight,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { CustomVoice } from '../types';
import { pcmBase64ToWavUrl, formatTime } from '../utils/audioUtils';

interface VoiceCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVoice: (voice: CustomVoice, activateImmediately: boolean) => void;
  existingCustomCount: number;
}

// Built-in demonstration audio clips for quick testing
const DEMO_AUDIO_CLIPS = [
  {
    id: 'demo-1',
    name: 'Narrador_Baritono_Profundo.mp3',
    gender: 'Masculino',
    style: 'Profundo & Cinematográfico',
    description: 'Barítono ressonante com presença de microfone de estúdio e timbre solene',
    baseVoice: 'Charon',
    pitch: -2,
    rate: 0.95,
    styleInstruction: 'A deep, cinematic, authoritative baritone with rich chest resonance and measured delivery.',
    acousticProfile: {
      timbre: 'Ressonante voz de peito grave',
      cadence: 'Cadência narrativa pausada e firme',
      energy: 'Presença imponente de baixa frequência',
      resonance: 'Efeito de proximidade em estúdio'
    }
  },
  {
    id: 'demo-2',
    name: 'Apresentadora_Conversacional.mp3',
    gender: 'Feminino',
    style: 'Acolhedora & Articulada',
    description: 'Locução límpida e natural, ideal para podcast e narrações explicativas',
    baseVoice: 'Kore',
    pitch: 1,
    rate: 1.05,
    styleInstruction: 'Warm, highly conversational, friendly cadence with clean melodic inflections.',
    acousticProfile: {
      timbre: 'Soprano cristalino e luminoso',
      cadence: 'Entonação amigável e expressiva',
      energy: 'Presença comunicativa de podcast',
      resonance: 'Cabine acústica profissional'
    }
  },
  {
    id: 'demo-3',
    name: 'Palestrante_Dinamico.mp3',
    gender: 'Masculino',
    style: 'Dinâmico & Enérgico',
    description: 'Voz texturizada com dicção firme e ritmo motivacional de alta intensidade',
    baseVoice: 'Fenrir',
    pitch: 0,
    rate: 1.15,
    styleInstruction: 'Textured, energetic, razor-sharp articulation with high motivational momentum.',
    acousticProfile: {
      timbre: 'Núcleo harmônico rico e texturizado',
      cadence: 'Ritmo rápido com ênfases pontuais',
      energy: 'Alto dinamismo de apresentação',
      resonance: 'Acústica ampla de auditório'
    }
  }
];

export const VoiceCloneModal: React.FC<VoiceCloneModalProps> = ({
  isOpen,
  onClose,
  onSaveVoice,
  existingCustomCount
}) => {
  // Processing stages: 'upload' | 'analyzing' | 'preview'
  const [stage, setStage] = useState<'upload' | 'analyzing' | 'preview'>('upload');

  // File state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
    base64: string;
    previewUrl?: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis result & custom voice state
  const [voiceName, setVoiceName] = useState(`Minha Voz Personalizada ${existingCustomCount + 1}`);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [previewAudioBase64, setPreviewAudioBase64] = useState<string>('');
  const [previewWavUrl, setPreviewWavUrl] = useState<string>('');
  const [previewDuration, setPreviewDuration] = useState<number>(2.5);

  // Test phrase for preview
  const [testPhrase, setTestPhrase] = useState(
    "Olá! Esta é uma demonstração da voz clonada sintetizada no Voice AI Studio. Como soa para você?"
  );
  const [isReTesting, setIsReTesting] = useState(false);

  // Audio playback controls for preview
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const referenceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Analysis progress step simulation
  const [analysisStep, setAnalysisStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setVoiceName(`My Custom Voice ${existingCustomCount + 1}`);
      setStage('upload');
      setSelectedFile(null);
      setAnalysisResult(null);
      setPreviewAudioBase64('');
      setPreviewWavUrl('');
      setErrorMessage(null);
      setIsPlayingPreview(false);
      setIsPlayingReference(false);
    } else {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if (referenceAudioRef.current) referenceAudioRef.current.pause();
    }
  }, [isOpen, existingCustomCount]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewWavUrl) URL.revokeObjectURL(previewWavUrl);
      if (selectedFile?.previewUrl) URL.revokeObjectURL(selectedFile.previewUrl);
    };
  }, [previewWavUrl, selectedFile]);

  if (!isOpen) return null;

  // Process raw file
  const handleProcessFile = (file: File) => {
    const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.webm'];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!file.type.startsWith('audio/') && !hasValidExt) {
      setErrorMessage('Please upload a valid audio file (.mp3, .wav, .m4a, .ogg, .flac).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('Audio file size exceeds 25 MB limit.');
      return;
    }

    setErrorMessage(null);
    const previewUrl = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];

      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'audio/mp3',
        base64,
        previewUrl
      });

      // Advance directly to analysis
      startCloningAnalysis(base64, file.type || 'audio/mp3', file.name);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read uploaded audio file.');
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger analysis call to backend
  const startCloningAnalysis = async (
    audioBase64: string,
    mimeType: string,
    fileName: string
  ) => {
    setStage('analyzing');
    setAnalysisStep(1);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await fetch('/api/voice-clone/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          fileName,
          sampleText: testPhrase
        })
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze vocal characteristics.');
      }

      const data = await res.json();
      const analysis = data.analysis;

      setAnalysisResult(analysis);
      if (analysis.suggestedName) {
        setVoiceName(analysis.suggestedName);
      }

      if (data.previewAudioBase64) {
        setPreviewAudioBase64(data.previewAudioBase64);
        setPreviewDuration(data.previewDurationSeconds || 2.5);
        const wavUrl = pcmBase64ToWavUrl(data.previewAudioBase64, 24000);
        setPreviewWavUrl(wavUrl);
      }

      setStage('preview');
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Cloning analysis error:', err);
      setErrorMessage(err.message || 'Analysis encountered an issue. Please try another audio clip.');
      setStage('upload');
    }
  };

  // Handle choosing a pre-built demo audio clip
  const handleSelectDemoClip = (demo: typeof DEMO_AUDIO_CLIPS[0]) => {
    setSelectedFile({
      name: demo.name,
      size: 1420000,
      type: 'audio/mp3',
      base64: ''
    });

    setVoiceName(`${demo.style} Clone`);
    setStage('analyzing');
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 500);
    setTimeout(() => setAnalysisStep(3), 1000);
    setTimeout(() => {
      const simulatedAnalysis = {
        suggestedName: `${demo.style} Clone`,
        baseVoice: demo.baseVoice,
        gender: demo.gender,
        pitch: demo.pitch,
        speakingRate: demo.rate,
        styleInstruction: demo.styleInstruction,
        sceneDirection: 'Professional studio recording environment with close condenser microphone proximity.',
        description: demo.description,
        acousticProfile: demo.acousticProfile
      };

      setAnalysisResult(simulatedAnalysis);

      // Request live preview TTS from server
      fetch('/api/voice-clone/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleText: testPhrase,
          baseVoice: demo.baseVoice,
          styleInstruction: demo.styleInstruction,
          speakingRate: demo.rate,
          pitch: demo.pitch
        })
      })
        .then((r) => r.json())
        .then((previewData) => {
          if (previewData.previewAudioBase64) {
            setPreviewAudioBase64(previewData.previewAudioBase64);
            setPreviewDuration(previewData.durationSeconds || 2.5);
            const wavUrl = pcmBase64ToWavUrl(previewData.previewAudioBase64, 24000);
            setPreviewWavUrl(wavUrl);
          }
          setStage('preview');
        })
        .catch(() => {
          setStage('preview');
        });
    }, 1500);
  };

  // Re-synthesize preview with updated test phrase
  const handleReTestPhrase = async () => {
    if (!analysisResult || !testPhrase.trim()) return;
    setIsReTesting(true);

    try {
      const res = await fetch('/api/voice-clone/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleText: testPhrase.trim(),
          baseVoice: analysisResult.baseVoice,
          styleInstruction: analysisResult.styleInstruction,
          speakingRate: analysisResult.speakingRate,
          pitch: analysisResult.pitch
        })
      });

      if (!res.ok) throw new Error('Failed to generate preview sample');

      const data = await res.json();
      if (data.previewAudioBase64) {
        if (previewWavUrl) URL.revokeObjectURL(previewWavUrl);
        setPreviewAudioBase64(data.previewAudioBase64);
        setPreviewDuration(data.durationSeconds || 2.5);
        const wavUrl = pcmBase64ToWavUrl(data.previewAudioBase64, 24000);
        setPreviewWavUrl(wavUrl);

        // Auto play the new preview
        setTimeout(() => {
          if (previewAudioRef.current) {
            previewAudioRef.current.currentTime = 0;
            previewAudioRef.current.play().catch(() => {});
            setIsPlayingPreview(true);
          }
        }, 100);
      }
    } catch (err: any) {
      console.error('Retest error:', err);
    } finally {
      setIsReTesting(false);
    }
  };

  // Play/pause preview audio
  const togglePlayPreview = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      if (referenceAudioRef.current) {
        referenceAudioRef.current.pause();
        setIsPlayingReference(false);
      }
      previewAudioRef.current.play().catch(console.error);
      setIsPlayingPreview(true);
    }
  };

  // Play/pause reference audio
  const togglePlayReference = () => {
    if (!referenceAudioRef.current) return;
    if (isPlayingReference) {
      referenceAudioRef.current.pause();
      setIsPlayingReference(false);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        setIsPlayingPreview(false);
      }
      referenceAudioRef.current.play().catch(console.error);
      setIsPlayingReference(true);
    }
  };

  // Save voice model
  const handleSave = (activateImmediately: boolean) => {
    if (!analysisResult) return;

    const newVoice: CustomVoice = {
      id: `custom-voice-${Date.now()}`,
      name: voiceName.trim() || `Custom Voice ${existingCustomCount + 1}`,
      baseVoice: analysisResult.baseVoice || 'Puck',
      gender: analysisResult.gender || 'Male',
      pitch: analysisResult.pitch ?? 0,
      speakingRate: analysisResult.speakingRate ?? 1.0,
      styleInstruction: analysisResult.styleInstruction || '',
      sceneDirection: analysisResult.sceneDirection || '',
      description: analysisResult.description || 'Custom cloned AI voice profile.',
      sourceFileName: selectedFile?.name || 'uploaded_sample.mp3',
      createdAt: Date.now(),
      previewAudioBase64,
      previewDurationSeconds: previewDuration,
      acousticProfile: analysisResult.acousticProfile
    };

    onSaveVoice(newVoice, activateImmediately);
    onClose();
  };

  return (
    <div
      id="modal-voice-cloning"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#181225] border border-[#2E2545] rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2E2545] flex items-center justify-between bg-[#1F1830]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#251D3A] border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA]">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#F5F3FF] tracking-wide">
                  Estúdio de Clonagem de Voz
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#7C3AED]/25 text-[#A78BFA] border border-[#7C3AED]/40">
                  Instantâneo
                </span>
              </div>
              <p className="text-xs text-[#B4A9D0]">
                Envie um áudio de referência para analisar o timbre, entonação e perfil acústico
              </p>
            </div>
          </div>

          <button
            id="btn-close-voice-clone"
            type="button"
            onClick={onClose}
            className="p-2 text-[#B4A9D0] hover:text-[#F5F3FF] rounded-xl hover:bg-[#2E2545] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#F87171]/15 border border-[#F87171]/40 text-[#F87171] text-xs">
              <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STAGE 1: UPLOAD */}
          {stage === 'upload' && (
            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                id="dropzone-voice-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-[#7C3AED] bg-[#7C3AED]/15 scale-[0.99]'
                    : 'border-[#2E2545] hover:border-[#7C3AED]/60 bg-[#1F1830] hover:bg-[#251D3A]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac,.webm"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-[#251D3A] border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA] group-hover:scale-105 transition-transform shadow-lg shadow-[#7C3AED]/20">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#F5F3FF]">
                    Arraste e solte o arquivo de áudio aqui, ou{' '}
                    <span className="text-[#A78BFA] underline underline-offset-2">clique para selecionar</span>
                  </p>
                  <p className="text-xs text-[#B4A9D0] mt-1">
                    Suporta MP3, WAV, M4A, OGG, FLAC (até 25 MB). Qualquer gravação de voz ou áudio de podcast.
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-[#181225] text-[#B4A9D0] border border-[#2E2545]">
                    Sem Cadastro Prévio
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-[#181225] text-[#B4A9D0] border border-[#2E2545]">
                    Processamento Direto
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-[#181225] text-[#B4A9D0] border border-[#2E2545]">
                    Extração Neural Imediata
                  </span>
                </div>
              </div>

              {/* Instant Demonstration Clips (Try with One Click) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#F5F3FF] uppercase tracking-wider">
                    Ou Experimente com Áudios de Teste:
                  </span>
                  <span className="text-xs text-[#B4A9D0]">Perfis acústicos instantâneos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DEMO_AUDIO_CLIPS.map((demo) => (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleSelectDemoClip(demo)}
                      className="p-3.5 rounded-xl bg-[#1F1830] hover:bg-[#251D3A] border border-[#2E2545] hover:border-[#7C3AED]/60 transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#F5F3FF] group-hover:text-[#A78BFA] transition-colors">
                            {demo.style}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2E2545] text-[#B4A9D0]">
                            {demo.gender}
                          </span>
                        </div>
                        <p className="text-xs text-[#B4A9D0] mt-1 line-clamp-2">
                          {demo.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#2E2545] text-[10px] font-mono text-[#B4A9D0]">
                        <span>Base: {demo.baseVoice}</span>
                        <span className="text-[#A78BFA] group-hover:translate-x-0.5 transition-transform flex items-center font-medium">
                          Clonar <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: ANALYZING */}
          {stage === 'analyzing' && (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#251D3A] border border-[#7C3AED] flex items-center justify-center text-[#A78BFA] animate-pulse shadow-[0_0_35px_rgba(124,58,237,0.4)]">
                  <Dna className="w-10 h-10 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div className="absolute -inset-2 rounded-full border border-[#7C3AED]/30 animate-ping" />
              </div>

              <div>
                <h4 className="text-base font-bold text-[#F5F3FF]">
                  Extraindo Impressão Vocal
                </h4>
                <p className="text-xs text-[#B4A9D0] max-w-md mx-auto mt-1">
                  O motor acústico do Gemini está analisando formantes, cadência de tom, respiração e ressonância de{' '}
                  <span className="text-[#F5F3FF] font-medium">{selectedFile?.name || 'amostra de áudio'}</span>...
                </p>
              </div>

              {/* Progress Steps */}
              <div className="w-full max-w-md bg-[#1F1830] border border-[#2E2545] rounded-xl p-4 space-y-3 text-left">
                {[
                  { step: 1, label: 'Carregando e decodificando amostra de áudio' },
                  { step: 2, label: 'Extraindo timbre, tom e formantes acústicos' },
                  { step: 3, label: 'Calibrando modelo vocal e diretrizes no Gemini 3.1 TTS' },
                  { step: 4, label: 'Sintetizando verificação de prévia' }
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3 text-xs">
                    {analysisStep > item.step ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : analysisStep === item.step ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#443864] shrink-0" />
                    )}
                    <span
                      className={
                        analysisStep >= item.step ? 'text-[#F5F3FF] font-medium' : 'text-[#6B6386]'
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 3: PREVIEW & CUSTOMIZE */}
          {stage === 'preview' && analysisResult && (
            <div className="space-y-6">
              {/* Voice Name & Identity */}
              <div className="bg-[#1F1830] border border-[#2E2545] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-[#B4A9D0] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-[#A78BFA]" />
                    Nome da Voz Personalizada
                  </label>
                  <input
                    id="input-cloned-voice-name"
                    type="text"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    placeholder="Ex: Narrador do Documentário"
                    className="w-full bg-[#140E20] border border-[#2E2545] focus:border-[#7C3AED] focus:outline-none rounded-lg px-3 py-2 text-sm font-semibold text-[#F5F3FF] placeholder-[#6B6386]"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#251D3A] text-[#DDD6FE] border border-[#7C3AED]/40 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                    Calibrado com base em {analysisResult.baseVoice}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#140E20] text-[#B4A9D0] border border-[#2E2545]">
                    {analysisResult.gender}
                  </span>
                </div>
              </div>

              {/* Acoustic Analysis Breakdown */}
              <div className="bg-[#140E20] border border-[#2E2545] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5F3FF] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#A78BFA]" />
                    Perfil Acústico Extraído
                  </span>
                  <span className="text-[10px] font-mono text-[#B4A9D0]">
                    Tom: {analysisResult.pitch >= 0 ? `+${analysisResult.pitch}` : analysisResult.pitch}st • Velocidade: {analysisResult.speakingRate}x
                  </span>
                </div>

                {analysisResult.acousticProfile && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 rounded-lg bg-[#1F1830] border border-[#2E2545]">
                      <div className="text-[10px] text-[#B4A9D0] uppercase font-semibold">Timbre</div>
                      <div className="text-xs font-medium text-[#F5F3FF] truncate mt-0.5">
                        {analysisResult.acousticProfile.timbre || 'Acolhedor'}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#1F1830] border border-[#2E2545]">
                      <div className="text-[10px] text-[#B4A9D0] uppercase font-semibold">Cadência</div>
                      <div className="text-xs font-medium text-[#F5F3FF] truncate mt-0.5">
                        {analysisResult.acousticProfile.cadence || 'Conversacional'}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#1F1830] border border-[#2E2545]">
                      <div className="text-[10px] text-[#B4A9D0] uppercase font-semibold">Energia</div>
                      <div className="text-xs font-medium text-[#F5F3FF] truncate mt-0.5">
                        {analysisResult.acousticProfile.energy || 'Moderada'}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#1F1830] border border-[#2E2545]">
                      <div className="text-[10px] text-[#B4A9D0] uppercase font-semibold">Ressonância</div>
                      <div className="text-xs font-medium text-[#F5F3FF] truncate mt-0.5">
                        {analysisResult.acousticProfile.resonance || 'Proximidade de Estúdio'}
                      </div>
                    </div>
                  </div>
                )}

                {analysisResult.description && (
                  <p className="text-xs text-[#B4A9D0] italic">
                    &ldquo;{analysisResult.description}&rdquo;
                  </p>
                )}
              </div>

              {/* Preview Synthesis Section */}
              <div className="bg-[#1F1830] border border-[#2E2545] rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F5F3FF] flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-[#A78BFA]" />
                    Prévia da Voz Clonada
                  </label>
                  <span className="text-xs font-mono text-[#DDD6FE]">
                    {formatTime(previewDuration)} sintetizados
                  </span>
                </div>

                {/* Audio Player Bar */}
                <div className="flex items-center gap-4 bg-[#140E20] border border-[#2E2545] rounded-xl p-3">
                  <button
                    id="btn-play-preview-clone"
                    type="button"
                    onClick={togglePlayPreview}
                    disabled={!previewWavUrl}
                    className="w-11 h-11 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isPlayingPreview ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-[#B4A9D0] mb-1">
                      <span className="font-semibold text-[#F5F3FF]">
                        {voiceName || 'Voz Personalizada'} (Prévia)
                      </span>
                      <span className="font-mono text-[11px]">
                        {isPlayingPreview
                          ? formatTime(previewCurrentTime)
                          : formatTime(previewDuration)}
                      </span>
                    </div>

                    {/* Fake animated waveform bars */}
                    <div className="flex items-center gap-1 h-6">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-150 ${
                            isPlayingPreview
                              ? 'bg-[#7C3AED]'
                              : 'bg-[#2E2545]'
                          }`}
                          style={{
                            height: isPlayingPreview
                              ? `${Math.max(15, (Math.sin(i * 0.5 + previewCurrentTime * 8) + 1) * 45)}%`
                              : `${Math.max(20, (Math.sin(i * 0.4) + 1) * 35)}%`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Play reference audio if uploaded file exists */}
                  {selectedFile?.previewUrl && (
                    <div className="pl-3 border-l border-[#2E2545]">
                      <button
                        type="button"
                        onClick={togglePlayReference}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#B4A9D0] hover:text-[#F5F3FF] bg-[#1F1830] hover:bg-[#251D3A] border border-[#2E2545] transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Ouvir áudio original gravado"
                      >
                        {isPlayingReference ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span>Áudio Original</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Hidden Audio Elements */}
                {previewWavUrl && (
                  <audio
                    ref={previewAudioRef}
                    src={previewWavUrl}
                    onTimeUpdate={() => {
                      if (previewAudioRef.current) {
                        setPreviewCurrentTime(previewAudioRef.current.currentTime);
                      }
                    }}
                    onEnded={() => {
                      setIsPlayingPreview(false);
                      setPreviewCurrentTime(0);
                    }}
                  />
                )}

                {selectedFile?.previewUrl && (
                  <audio
                    ref={referenceAudioRef}
                    src={selectedFile.previewUrl}
                    onEnded={() => setIsPlayingReference(false)}
                  />
                )}

                {/* Test Text Phrase Input */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#B4A9D0] uppercase tracking-wider">
                      Frase de Teste (edite para ouvir outro texto):
                    </label>
                    <button
                      type="button"
                      onClick={handleReTestPhrase}
                      disabled={isReTesting || !testPhrase.trim()}
                      className="text-xs font-medium text-[#A78BFA] hover:text-[#DDD6FE] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isReTesting ? 'animate-spin' : ''}`} />
                      <span>{isReTesting ? 'Sintetizando...' : 'Regerar Teste'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={testPhrase}
                      onChange={(e) => setTestPhrase(e.target.value)}
                      placeholder="Digite uma frase de teste para ouvir esta voz..."
                      className="w-full bg-[#140E20] border border-[#2E2545] focus:border-[#7C3AED] focus:outline-none rounded-lg px-3 py-2 text-xs text-[#F5F3FF] placeholder-[#6B6386]"
                    />
                  </div>

                  {/* Quick sample phrases */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Boas-vindas ao episódio de hoje do nosso podcast.',
                      'O futuro da inteligência artificial e da voz natural.',
                      'No silêncio da noite, os ecos sussurravam no vento.'
                    ].map((phrase, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTestPhrase(phrase)}
                        className="px-2.5 py-1 rounded-md text-[11px] bg-[#140E20] hover:bg-[#251D3A] text-[#B4A9D0] hover:text-[#F5F3FF] border border-[#2E2545] transition-colors cursor-pointer"
                      >
                        &ldquo;{phrase.slice(0, 26)}...&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#2E2545] bg-[#1F1830] flex items-center justify-between gap-3">
          {stage === 'preview' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setStage('upload');
                  setAnalysisResult(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#B4A9D0] hover:text-[#F5F3FF] bg-[#181225] hover:bg-[#251D3A] border border-[#2E2545] transition-colors cursor-pointer"
              >
                Enviar Outro Áudio
              </button>

              <div className="flex items-center gap-3">
                <button
                  id="btn-save-voice-clone"
                  type="button"
                  onClick={() => handleSave(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F5F3FF] bg-[#251D3A] hover:bg-[#2E2545] border border-[#7C3AED]/40 transition-colors cursor-pointer"
                >
                  Salvar em Minhas Vozes
                </button>

                <button
                  id="btn-save-and-use-voice-clone"
                  type="button"
                  onClick={() => handleSave(true)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-[#7C3AED]/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Salvar e Usar Agora</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#B4A9D0] hover:text-[#F5F3FF] bg-[#181225] hover:bg-[#251D3A] border border-[#2E2545] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <div className="text-[11px] text-[#B4A9D0] font-mono flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-[#A78BFA]" />
                Pareamento Neural Gemini 3.1 TTS
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
