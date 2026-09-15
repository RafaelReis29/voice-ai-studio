import React from 'react';
import { Sparkles, Dna, History, Layers, Code, Keyboard, Radio, AlertCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenBatch: () => void;
  onOpenApiCode: () => void;
  onOpenShortcuts: () => void;
  onOpenVoiceClone?: () => void;
  onRandomize: () => void;
  hasApiKey: boolean;
  historyCount: number;
  customVoiceCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenBatch,
  onOpenApiCode,
  onOpenShortcuts,
  onOpenVoiceClone,
  onRandomize,
  hasApiKey,
  historyCount,
  customVoiceCount = 0
}) => {
  return (
    <header className="border-b border-[#2E2545] bg-[#181225] sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-[#A78BFA]/30">
            <Radio className="w-5 h-5 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#A78BFA] animate-ping opacity-75" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#F5F3FF] flex items-center gap-1.5">
                Voice AI <span className="text-[#A78BFA]">Studio</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#1F1830] text-[#B4A9D0] border border-[#2E2545]">
                v3.1 TTS
              </span>
            </div>
            <p className="text-xs text-[#B4A9D0] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34D399] inline-block" />
              Motor Gemini 3.1 Flash
              <span className="text-[#6B6386]">•</span>
              <span className="text-[#A78BFA] font-mono text-xs">Proteção SynthID™</span>
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2">
          {!hasApiKey && (
            <Tooltip content="Adicione GEMINI_API_KEY no menu de segredos para modelos de produção. Gerando com o sintetizador acústico de pré-visualização integrado.">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F1830] border border-[#FBBF24]/50 text-[#FBBF24] text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-[#FBBF24]" />
                <span>Modo Demonstração</span>
              </div>
            </Tooltip>
          )}

          {onOpenVoiceClone && (
            <Tooltip content="Cria uma nova voz a partir de um arquivo de áudio enviado, analisando timbre e ritmo.">
              <button
                id="btn-header-clone-voice"
                type="button"
                onClick={onOpenVoiceClone}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:brightness-110 shadow-[0_0_12px_rgba(124,58,237,0.35)] border border-[#A78BFA]/40 transition-all cursor-pointer"
              >
                <Dna className="w-4 h-4 text-[#F5F3FF]" />
                <span>Clonar Voz</span>
                {customVoiceCount > 0 && (
                  <span className="ml-0.5 px-2 py-0.5 rounded-full text-xs font-mono bg-[#181225] text-[#F5F3FF]">
                    {customVoiceCount}
                  </span>
                )}
              </button>
            </Tooltip>
          )}

          <Tooltip content="Sorteia uma combinação de voz coerente para você explorar possibilidades.">
            <button
              id="btn-surprise-me"
              type="button"
              onClick={onRandomize}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-[#F5F3FF] bg-[#1F1830] hover:bg-[#2E2545] border border-[#2E2545] hover:border-[#A78BFA]/50 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FBBF24]" />
              <span className="hidden sm:inline">Aleatório</span>
            </button>
          </Tooltip>

          <Tooltip content="Gera vários áudios de uma vez e baixa todos juntos em um único arquivo.">
            <button
              id="btn-batch-export"
              type="button"
              onClick={onOpenBatch}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-[#F5F3FF] bg-[#1F1830] hover:bg-[#2E2545] border border-[#2E2545] hover:border-[#A78BFA]/50 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#B4A9D0]" />
              <span className="hidden sm:inline">Exportar em Lote</span>
            </button>
          </Tooltip>

          <Tooltip content="Gera o código JavaScript/TypeScript para integrar essa voz no seu próprio sistema.">
            <button
              id="btn-api-code"
              type="button"
              onClick={onOpenApiCode}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-[#F5F3FF] bg-[#1F1830] hover:bg-[#2E2545] border border-[#2E2545] hover:border-[#A78BFA]/50 transition-all cursor-pointer"
            >
              <Code className="w-4 h-4 text-[#B4A9D0]" />
              <span className="hidden md:inline">Código API</span>
            </button>
          </Tooltip>

          <Tooltip content="Mostra todos os áudios que você já gerou. Clique em um item para recarregar os ajustes.">
            <button
              id="btn-history-toggle"
              type="button"
              onClick={onOpenHistory}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-[#F5F3FF] bg-[#1F1830] hover:bg-[#2E2545] border border-[#2E2545] hover:border-[#A78BFA]/50 transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-[#B4A9D0]" />
              <span className="hidden sm:inline">Histórico</span>
              {historyCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#7C3AED] text-white">
                  {historyCount}
                </span>
              )}
            </button>
          </Tooltip>

          <Tooltip content="Exibe os atalhos de teclado para agilizar seu uso (ex: Ctrl+Enter para gerar).">
            <button
              id="btn-shortcuts"
              type="button"
              onClick={onOpenShortcuts}
              className="p-2 rounded-lg text-[#B4A9D0] hover:text-[#F5F3FF] bg-[#1F1830] hover:bg-[#2E2545] border border-[#2E2545] hover:border-[#A78BFA]/50 transition-all cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

