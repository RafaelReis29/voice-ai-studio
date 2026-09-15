import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Download,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Columns
} from 'lucide-react';
import {
  base64ToUint8Array,
  pcmToWav,
  extractWaveformPeaks,
  formatTime,
  pcmToMp3Blob,
  triggerFileDownload
} from '../utils/audioUtils';
import { GenerationHistoryItem } from '../types';
import { Tooltip } from './Tooltip';

interface WaveformPlayerProps {
  currentAudio: GenerationHistoryItem | null;
  onOpenExportModal: () => void;
  onToggleCompare: () => void;
  isCompareMode: boolean;
  onAddToBatch: (item: GenerationHistoryItem) => void;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  currentAudio,
  onOpenExportModal,
  onToggleCompare,
  isCompareMode,
  onAddToBatch
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  // Generate a valid WAV object URL whenever audio changes
  useEffect(() => {
    if (!currentAudio || !currentAudio.audioBase64) {
      setAudioBlobUrl(null);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      return;
    }

    try {
      const rawBytes = base64ToUint8Array(currentAudio.audioBase64);
      const wavBuffer = pcmToWav(rawBytes, 24000, 1, 16);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioBlobUrl(url);
      setDuration(currentAudio.durationSeconds || 1);
      setCurrentTime(0);
      setIsPlaying(false);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Failed to parse audio into playable buffer:', e);
    }
  }, [currentAudio]);

  // Extract precomputed waveform peaks (80 bars)
  const peaks = useMemo(() => {
    if (!currentAudio || !currentAudio.audioBase64) {
      // Return subtle ambient idle baseline
      return new Array(80).fill(0).map((_, i) => Math.sin(i * 0.2) * 0.15 + 0.2);
    }
    const rawBytes = base64ToUint8Array(currentAudio.audioBase64);
    return extractWaveformPeaks(rawBytes, 80);
  }, [currentAudio]);

  // Draw custom waveform canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const numBars = peaks.length;
    const barWidth = width / numBars - 1.5;
    const progress = duration > 0 ? currentTime / duration : 0;
    const activeBarIndex = Math.floor(progress * numBars);

    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + 1.5);
      const barHeight = Math.max(4, peaks[i] * (height - 8));
      const y = (height - barHeight) / 2;

      const isPlayed = i <= activeBarIndex;

      if (isPlayed) {
        // Purple violet gradient for played segment
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#C4B5FD');
        grad.addColorStop(0.5, '#7C3AED');
        grad.addColorStop(1, '#5B21B6');
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(124, 58, 237, 0.5)';
        ctx.shadowBlur = 6;
      } else {
        // Dark purple muted tint for unplayed
        ctx.fillStyle = '#2E2545';
        ctx.shadowBlur = 0;
      }

      // Rounded bar
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }

    // Draw active playhead line with soft purple glow
    if (progress > 0 && progress <= 1) {
      const headX = progress * width;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#A78BFA';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(headX, 4);
      ctx.lineTo(headX, height - 4);
      ctx.stroke();
    }
  }, [peaks, currentTime, duration]);

  // Handle Play/Pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioBlobUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((e) => {
        console.error('Audio playback error:', e);
      });
    }
  };

  // Seek bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = newProgress * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Direct MP3 Quick Download
  const handleDownloadMp3 = () => {
    if (!currentAudio) return;
    const rawBytes = base64ToUint8Array(currentAudio.audioBase64);
    const mp3Blob = pcmToMp3Blob(rawBytes, { sampleRate: 24000, bitrate: 192 });
    const filename = `voice_ai_studio_${currentAudio.settings.voice.toLowerCase()}_${Date.now()}.mp3`;
    triggerFileDownload(mp3Blob, filename);
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="bg-[#181225] border border-[#2E2545] rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-[#7C3AED] animate-pulse" />
          <h2 className="text-base font-semibold text-[#F5F3FF]">
            Reprodutor de Áudio
          </h2>
          <span className="text-xs text-[#B4A9D0] hidden sm:inline">
            • Monitor gráfico e controles
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Compare Mode Toggle */}
          <Tooltip content="Compare o áudio gerado com outra voz ou configuração lado a lado.">
            <button
              id="btn-compare-mode-toggle"
              type="button"
              onClick={onToggleCompare}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isCompareMode
                  ? 'bg-[#7C3AED]/25 text-[#A78BFA] border-[#7C3AED]'
                  : 'bg-[#1F1830] text-[#B4A9D0] border-[#2E2545] hover:border-[#A78BFA]/50 hover:text-[#F5F3FF]'
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>Comparar Vozes (A/B)</span>
            </button>
          </Tooltip>

          {/* Queue to Batch */}
          {currentAudio && (
            <Tooltip content="Salva este áudio na fila de processamento e exportação em lote.">
              <button
                id="btn-add-to-batch"
                type="button"
                onClick={() => onAddToBatch(currentAudio)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[#B4A9D0] hover:text-[#F5F3FF] bg-[#1F1830] hover:bg-[#2E2545] border border-[#2E2545] transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#A78BFA]" />
                <span className="hidden sm:inline">Adicionar à Fila</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Hidden native audio element */}
      {audioBlobUrl && (
        <audio
          ref={audioRef}
          src={audioBlobUrl}
          loop={isLooping}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration || currentAudio?.durationSeconds || 0);
            }
          }}
          onEnded={() => {
            if (!isLooping) setIsPlaying(false);
          }}
        />
      )}

      {/* Waveform Canvas & Interactive Scrubbing */}
      <div
        className="relative bg-[#1F1830] border border-[#2E2545] rounded-xl p-3 h-28 flex items-center justify-center cursor-pointer group overflow-hidden"
        onClick={handleSeek}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={96}
          className="w-full h-full block"
        />

        {/* Empty state overlay if no audio yet */}
        {!currentAudio && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1F1830]/80 backdrop-blur-[1px] text-[#B4A9D0] text-xs">
            <Sparkles className="w-5 h-5 text-[#7C3AED] mb-1.5" />
            <span>A forma de onda será gerada aqui após a síntese do áudio</span>
          </div>
        )}
      </div>

      {/* Time & Progress Info */}
      <div className="flex items-center justify-between text-xs font-mono text-[#B4A9D0]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#F5F3FF] font-semibold">{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {currentAudio && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#B4A9D0]">
              Voz: <span className="text-[#F5F3FF] font-medium">{currentAudio.settings.voice}</span>
            </span>
            <span className="text-[#6B6386]">•</span>
            <span className="text-[#B4A9D0]">
              Velocidade: <span className="text-[#F5F3FF] font-medium">{currentAudio.settings.speakingRate}x</span>
            </span>
          </div>
        )}
      </div>

      {/* Main Transport Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2E2545]">
        {/* Left: Play/Pause, Rewind, Loop */}
        <div className="flex items-center gap-2.5">
          <Tooltip content={isPlaying ? 'Pausar reprodução' : 'Iniciar reprodução'}>
            <button
              id="btn-transport-play-pause"
              type="button"
              onClick={togglePlay}
              disabled={!currentAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                currentAudio
                  ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[0_0_18px_rgba(124,58,237,0.45)]'
                  : 'bg-[#2E2545] text-[#6B6386] cursor-not-allowed'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </Tooltip>

          <Tooltip content="Reiniciar áudio do início">
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              disabled={!currentAudio}
              className="p-2.5 rounded-xl text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#1F1830] transition-colors disabled:opacity-30 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content={isLooping ? 'Repetição contínua ativada' : 'Ativar repetição contínua'}>
            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                isLooping
                  ? 'text-[#A78BFA] bg-[#7C3AED]/20 border border-[#7C3AED]/40'
                  : 'text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#1F1830]'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* Playback speed selector */}
          <Tooltip content="Altera a velocidade de reprodução local (não altera o arquivo original gerado).">
            <div className="flex items-center bg-[#1F1830] border border-[#2E2545] rounded-xl px-2.5 py-1 ml-1 cursor-help">
              <span className="text-xs text-[#B4A9D0] mr-1.5 font-mono">VEL:</span>
              <select
                value={playbackRate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  setPlaybackRate(rate);
                  if (audioRef.current) audioRef.current.playbackRate = rate;
                }}
                className="bg-transparent text-xs font-mono text-[#F5F3FF] focus:outline-none cursor-pointer"
              >
                {speedOptions.map((s) => (
                  <option key={s} value={s} className="bg-[#181225] text-white">
                    {s}x
                  </option>
                ))}
              </select>
            </div>
          </Tooltip>
        </div>

        {/* Center/Right: Volume & Output Downloads */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Volume Slider */}
          <Tooltip content="Ajustar volume da reprodução no navegador">
            <div className="flex items-center gap-2 bg-[#1F1830] border border-[#2E2545] rounded-xl px-3 py-2 cursor-help">
              <button
                type="button"
                onClick={() => {
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                  if (audioRef.current) audioRef.current.muted = nextMute;
                }}
                className="text-[#B4A9D0] hover:text-[#F5F3FF] cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[#F87171]" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  setIsMuted(false);
                  if (audioRef.current) {
                    audioRef.current.volume = val;
                    audioRef.current.muted = false;
                  }
                }}
                className="w-16 accent-[#7C3AED] h-1.5 bg-[#2E2545] rounded-full cursor-pointer"
              />
            </div>
          </Tooltip>

          {/* Primary Export: Prominent Download MP3 Button */}
          <Tooltip content="Baixa o arquivo em formato MP3 (192 kbps) instantaneamente.">
            <button
              id="btn-download-mp3-primary"
              type="button"
              onClick={handleDownloadMp3}
              disabled={!currentAudio}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#2E2545] disabled:text-[#6B6386] disabled:cursor-not-allowed shadow-[0_0_16px_rgba(124,58,237,0.35)] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar MP3</span>
            </button>
          </Tooltip>

          {/* Format Settings Modal Trigger */}
          <Tooltip content="Exportar áudio em WAV sem perdas, OGG, PCM bruto ou personalizar taxas de bits.">
            <button
              id="btn-export-options-modal"
              type="button"
              onClick={onOpenExportModal}
              disabled={!currentAudio}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#F5F3FF] bg-[#1F1830] hover:bg-[#2E2545] border border-[#2E2545] hover:border-[#A78BFA]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#A78BFA]" />
              <span>Outros Formatos</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

