import React, { useState } from 'react';
import {
  X,
  History,
  Play,
  Pause,
  ArrowUpRight,
  Download,
  Trash2,
  Clock,
  Mic,
  FileText
} from 'lucide-react';
import { GenerationHistoryItem } from '../types';
import {
  base64ToUint8Array,
  pcmToMp3Blob,
  triggerFileDownload,
  formatTime
} from '../utils/audioUtils';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: GenerationHistoryItem[];
  onLoadItem: (item: GenerationHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  activeAudioId?: string;
  onPlayItem: (item: GenerationHistoryItem) => void;
  isPlayingActive: boolean;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onLoadItem,
  onClearHistory,
  onDeleteItem,
  activeAudioId,
  onPlayItem,
  isPlayingActive
}) => {
  if (!isOpen) return null;

  const handleDownload = (item: GenerationHistoryItem) => {
    const rawBytes = base64ToUint8Array(item.audioBase64);
    const blob = pcmToMp3Blob(rawBytes, { bitrate: 192, sampleRate: 24000 });
    const filename = `voice_ai_studio_${item.settings.voice.toLowerCase()}_${item.id}.mp3`;
    triggerFileDownload(blob, filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#181225] border-l border-[#2E2545] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#2E2545] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#A78BFA]" />
            <h3 className="text-sm font-bold text-[#F5F3FF] tracking-wide">
              Histórico de Sínteses
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#251D3A] text-[#DDD6FE] border border-[#7C3AED]/30">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-[11px] text-[#B4A9D0] hover:text-[#F87171] flex items-center gap-1 transition-colors cursor-pointer px-2 py-1"
                title="Limpar todo o histórico de gerações"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Tudo</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#251D3A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.map((item) => {
            const isCurrentlySelected = activeAudioId === item.id;
            const isPlayingThis = isCurrentlySelected && isPlayingActive;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                  isCurrentlySelected
                    ? 'bg-[#251D3A] border-[#7C3AED] ring-1 ring-[#A78BFA]/50'
                    : 'bg-[#140E20] border-[#2E2545] hover:border-[#7C3AED]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Play & Info */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onPlayItem(item)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow ${
                        isPlayingThis
                          ? 'bg-[#7C3AED] text-white'
                          : 'bg-[#251D3A] text-[#DDD6FE] hover:bg-[#7C3AED] hover:text-white'
                      }`}
                      title={isPlayingThis ? 'Pausar' : 'Reproduzir áudio'}
                    >
                      {isPlayingThis ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#F5F3FF]">
                          {item.settings.voice}
                        </span>
                        <span className="text-[10px] font-mono text-[#B4A9D0]">
                          {item.settings.speakingRate}x
                        </span>
                        {item.settings.isMultiSpeaker && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#7C3AED]/30 text-[#DDD6FE] font-mono border border-[#7C3AED]/40">
                            Multi-Voz
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#B4A9D0] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span>{formatTime(item.durationSeconds)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="p-1.5 rounded text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#251D3A] transition-colors cursor-pointer"
                      title="Baixar MP3 novamente"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded text-[#B4A9D0] hover:text-[#F87171] hover:bg-[#251D3A] transition-colors cursor-pointer"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Text excerpt */}
                <p className="text-xs text-[#DDD6FE] line-clamp-2 italic font-serif">
                  &ldquo;{item.text}&rdquo;
                </p>

                {/* Footer Load Button */}
                <div className="flex items-center justify-between pt-1 border-t border-[#2E2545]">
                  <span className="text-[10px] font-mono text-[#B4A9D0] truncate max-w-[200px]">
                    {item.settings.styleInstruction
                      ? item.settings.styleInstruction
                      : 'Interpretação Padrão'}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadItem(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-[#A78BFA] hover:text-[#DDD6FE] transition-colors cursor-pointer"
                  >
                    <span>Carregar no Editor</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {history.length === 0 && (
            <div className="text-center py-20 text-xs text-[#B4A9D0] flex flex-col items-center gap-2">
              <History className="w-8 h-8 text-[#6B6386]" />
              <span>Nenhum áudio gerado ainda nesta sessão.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
