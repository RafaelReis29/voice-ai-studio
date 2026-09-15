import React from 'react';
import { Play, Pause, ArrowRightLeft } from 'lucide-react';
import { GenerationHistoryItem } from '../types';
import { formatTime } from '../utils/audioUtils';
import { Tooltip } from './Tooltip';

interface ComparePlayerProps {
  slotA: GenerationHistoryItem | null;
  slotB: GenerationHistoryItem | null;
  onSelectSlot: (slot: 'A' | 'B') => void;
  activeSlot: 'A' | 'B';
  onPlaySlot: (slot: 'A' | 'B') => void;
  playingSlot: 'A' | 'B' | null;
}

export const ComparePlayer: React.FC<ComparePlayerProps> = ({
  slotA,
  slotB,
  onSelectSlot,
  activeSlot,
  onPlaySlot,
  playingSlot
}) => {
  return (
    <div className="bg-[#181225] border border-[#7C3AED]/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#A78BFA]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F3FF]">
            Comparador A/B de Vozes
          </h3>
        </div>
        <span className="text-xs font-mono text-[#B4A9D0]">
          Destino Atual: <span className="text-[#A78BFA] font-bold">Espaço {activeSlot}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Slot A Card */}
        <Tooltip content="Clique para direcionar novas gerações de voz para o Espaço A.">
          <div
            onClick={() => onSelectSlot('A')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
              activeSlot === 'A'
                ? 'bg-[#251D3A] border-[#7C3AED] ring-1 ring-[#7C3AED]'
                : 'bg-[#1F1830] border-[#2E2545] hover:border-[#A78BFA]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white text-xs font-mono font-bold flex items-center justify-center">
                  A
                </span>
                <span className="text-sm font-semibold text-[#F5F3FF]">
                  {slotA ? slotA.settings.voice : 'Espaço A (Vazio)'}
                </span>
              </div>

              {slotA && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySlot('A');
                  }}
                  className="w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center shadow transition-colors cursor-pointer"
                  title={playingSlot === 'A' ? 'Pausar Espaço A' : 'Tocar Espaço A'}
                >
                  {playingSlot === 'A' ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              )}
            </div>

            {slotA ? (
              <div className="text-xs text-[#B4A9D0] space-y-0.5 font-mono">
                <div>
                  Vel: <span className="text-[#F5F3FF]">{slotA.settings.speakingRate}x</span> | Tom:{' '}
                  <span className="text-[#F5F3FF]">{slotA.settings.pitch}st</span>
                </div>
                <div className="truncate">
                  Estilo: <span className="text-[#F5F3FF]">{slotA.settings.styleInstruction || 'Padrão'}</span>
                </div>
                <div className="text-emerald-400 text-xs">
                  Pronto ({formatTime(slotA.durationSeconds)})
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#6B6386] py-2 text-center">
                Gere um áudio para preencher o Espaço A
              </div>
            )}
          </div>
        </Tooltip>

        {/* Slot B Card */}
        <Tooltip content="Clique para direcionar novas gerações de voz para o Espaço B e comparar.">
          <div
            onClick={() => onSelectSlot('B')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
              activeSlot === 'B'
                ? 'bg-[#251D3A] border-[#7C3AED] ring-1 ring-[#7C3AED]'
                : 'bg-[#1F1830] border-[#2E2545] hover:border-[#A78BFA]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2E2545] text-[#F5F3FF] text-xs font-mono font-bold flex items-center justify-center">
                  B
                </span>
                <span className="text-sm font-semibold text-[#F5F3FF]">
                  {slotB ? slotB.settings.voice : 'Espaço B (Vazio)'}
                </span>
              </div>

              {slotB && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySlot('B');
                  }}
                  className="w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center shadow transition-colors cursor-pointer"
                  title={playingSlot === 'B' ? 'Pausar Espaço B' : 'Tocar Espaço B'}
                >
                  {playingSlot === 'B' ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              )}
            </div>

            {slotB ? (
              <div className="text-xs text-[#B4A9D0] space-y-0.5 font-mono">
                <div>
                  Vel: <span className="text-[#F5F3FF]">{slotB.settings.speakingRate}x</span> | Tom:{' '}
                  <span className="text-[#F5F3FF]">{slotB.settings.pitch}st</span>
                </div>
                <div className="truncate">
                  Estilo: <span className="text-[#F5F3FF]">{slotB.settings.styleInstruction || 'Padrão'}</span>
                </div>
                <div className="text-emerald-400 text-xs">
                  Pronto ({formatTime(slotB.durationSeconds)})
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#6B6386] py-2 text-center">
                Selecione o Espaço B e gere um áudio para comparar
              </div>
            )}
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

