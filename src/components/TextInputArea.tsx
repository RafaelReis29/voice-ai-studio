import React, { useRef, useMemo } from 'react';
import { Trash2, FileText, ChevronDown, Sparkles, Volume2 } from 'lucide-react';
import { AUDIO_TAGS, SAMPLE_SCRIPTS } from '../data/voices';
import { AudioTag } from '../types';
import { Tooltip } from './Tooltip';

interface TextInputAreaProps {
  text: string;
  onChange: (value: string) => void;
  onLoadScript: (script: (typeof SAMPLE_SCRIPTS)[0]) => void;
  onClear: () => void;
  styleInstruction: string;
  sceneDirection: string;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  text,
  onChange,
  onLoadScript,
  onClear,
  styleInstruction,
  sceneDirection
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Compute total byte length combined
  const byteStats = useMemo(() => {
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(text).length;
    const promptDirectives = `${styleInstruction || ''} ${sceneDirection || ''}`;
    const promptBytes = encoder.encode(promptDirectives).length;
    const totalBytes = textBytes + promptBytes;
    const maxBytes = 8000;
    const percent = Math.min(100, (totalBytes / maxBytes) * 100);
    return {
      textBytes,
      totalBytes,
      maxBytes,
      percent,
      isNearLimit: totalBytes > 7000,
      isOverLimit: totalBytes > maxBytes,
      charCount: text.length
    };
  }, [text, styleInstruction, sceneDirection]);

  // Insert tag at current cursor position
  const handleInsertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(text + ' ' + tag + ' ');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = `${before}${before.endsWith(' ') || before.length === 0 ? '' : ' '}${tag} ${after.startsWith(' ') ? after.slice(1) : after}`;
    
    onChange(newText);

    // Restore and advance cursor
    setTimeout(() => {
      textarea.focus();
      const nextPos = start + tag.length + (before.endsWith(' ') || before.length === 0 ? 1 : 2);
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  return (
    <div className="bg-[#181225] border border-[#2E2545] rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
      {/* Top Header & Scripts Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1F1830] border border-[#2E2545] flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div>
            <label htmlFor="tts-text-editor" className="text-base font-semibold text-[#F5F3FF] flex items-center gap-2">
              Editor de Texto
            </label>
            <p className="text-xs text-[#B4A9D0]">
              Tags e pontuação são interpretadas com fidelidade pelo Gemini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sample Scripts Loader (Frases de Teste) */}
          <div className="relative">
            <Tooltip content="Carrega textos pré-escritos para testar diferentes estilos vocais.">
              <button
                id="btn-sample-scripts-toggle"
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[#F5F3FF] bg-[#1F1830] hover:bg-[#2E2545] border border-[#2E2545] hover:border-[#A78BFA]/50 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#A78BFA]" />
                <span>Frases de Teste</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#B4A9D0]" />
              </button>
            </Tooltip>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-72 bg-[#181225] border border-[#2E2545] rounded-xl shadow-2xl py-2 z-30 max-h-72 overflow-y-auto">
                  <div className="px-3.5 py-1.5 text-xs font-mono text-[#B4A9D0] border-b border-[#2E2545]">
                    SELECIONE UM TEXTO MODELO
                  </div>
                  {SAMPLE_SCRIPTS.map((script) => (
                    <button
                      key={script.id}
                      type="button"
                      onClick={() => {
                        onLoadScript(script);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-[#F5F3FF] hover:bg-[#7C3AED]/20 hover:text-[#A78BFA] flex flex-col gap-0.5 transition-colors cursor-pointer"
                    >
                      <span className="font-semibold">{script.title}</span>
                      <span className="text-xs text-[#B4A9D0]">
                        Voz sugerida: {script.voice} {script.isMultiSpeaker ? '+ Diálogo' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Clear All */}
          <Tooltip content="Apaga todo o texto do editor.">
            <button
              id="btn-clear-text"
              type="button"
              onClick={onClear}
              disabled={!text}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#B4A9D0] hover:text-[#F87171] hover:bg-[#F87171]/10 border border-transparent hover:border-[#F87171]/30 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Audio Tag Insertion Toolbar (Inserir Pausas e Ênfases) */}
      <div className="bg-[#1F1830] border border-[#2E2545] rounded-xl p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-[#B4A9D0]">
          <Tooltip content="Adicione instruções sonoras no meio do texto para orientar a leitura da IA.">
            <span className="font-medium text-[#F5F3FF] flex items-center gap-1.5 cursor-help">
              <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
              Inserir Pausas e Ênfases:
            </span>
          </Tooltip>
          <span className="text-xs text-[#B4A9D0] hidden sm:inline">
            Clique na tag para adicionar na posição do cursor
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {AUDIO_TAGS.map((item: AudioTag) => {
            const isPause = item.category === 'pause';
            const isEmotion = item.category === 'emotion';
            const isPacing = item.category === 'pacing';

            return (
              <Tooltip key={item.tag} content={item.tooltip}>
                <button
                  type="button"
                  id={`btn-tag-${item.tag.replace(/[\[\]\s]/g, '')}`}
                  onClick={() => handleInsertTag(item.tag)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    isPause
                      ? 'bg-[#181225] text-[#FBBF24] border-[#FBBF24]/40 hover:border-[#FBBF24] hover:bg-[#FBBF24]/10'
                      : isEmotion
                      ? 'bg-[#181225] text-[#A78BFA] border-[#7C3AED]/50 hover:border-[#A78BFA] hover:bg-[#7C3AED]/20'
                      : isPacing
                      ? 'bg-[#181225] text-[#34D399] border-[#34D399]/40 hover:border-[#34D399] hover:bg-[#34D399]/10'
                      : 'bg-[#181225] text-[#F5F3FF] border-[#2E2545] hover:border-[#A78BFA] hover:bg-[#251D3A]'
                  }`}
                >
                  {item.label}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="tts-text-editor"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite ou cole o texto para sintetizar com a voz Gemini... (Use os botões de tag acima para adicionar pausas e emoções diretamente no texto)"
          rows={11}
          className="w-full bg-[#1F1830] border border-[#2E2545] focus:border-[#A78BFA] focus:outline-none rounded-xl p-4 text-base text-[#F5F3FF] placeholder-[#6B6386] font-sans leading-relaxed resize-y min-h-[220px] transition-colors selection:bg-[#7C3AED]/40 selection:text-white"
        />

        {/* Live Audio Tag Highlighting Pill preview row if text has tags */}
        {text.includes('[') && text.includes(']') && (
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-xs text-[#B4A9D0]">
            <span className="font-mono text-xs uppercase text-[#B4A9D0]">
              Tags detectadas:
            </span>
            {(text.match(/\[[^\]]+\]/g) || []).slice(0, 8).map((t, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-xs font-mono bg-[#7C3AED]/25 text-[#A78BFA] border border-[#7C3AED]/40"
              >
                {t}
              </span>
            ))}
            {(text.match(/\[[^\]]+\]/g) || []).length > 8 && (
              <span className="text-xs text-[#6B6386]">
                +{(text.match(/\[[^\]]+\]/g) || []).length - 8} outras
              </span>
            )}
          </div>
        )}
      </div>

      {/* Byte & Character Counter Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#2E2545]">
        <div className="flex items-center gap-3 text-xs font-mono text-[#B4A9D0]">
          <span>
            Caracteres: <strong className="text-[#F5F3FF]">{byteStats.charCount}</strong>
          </span>
          <span>•</span>
          <span>
            Bytes combinados:{' '}
            <strong
              className={
                byteStats.isOverLimit
                  ? 'text-[#F87171] font-bold'
                  : byteStats.isNearLimit
                  ? 'text-[#FBBF24]'
                  : 'text-[#F5F3FF]'
              }
            >
              {byteStats.totalBytes}
            </strong>{' '}
            / {byteStats.maxBytes}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full sm:w-48 bg-[#1F1830] border border-[#2E2545] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              byteStats.isOverLimit
                ? 'bg-[#F87171]'
                : byteStats.isNearLimit
                ? 'bg-[#FBBF24]'
                : 'bg-[#7C3AED]'
            }`}
            style={{ width: `${byteStats.percent}%` }}
          />
        </div>
      </div>

      {byteStats.isOverLimit && (
        <div className="p-3 rounded-xl bg-[#F87171]/15 border border-[#F87171]/40 text-[#F87171] text-xs flex items-center gap-2">
          <span>
            O tamanho combinado do texto e instruções ({byteStats.totalBytes} bytes) ultrapassa o limite de 8.000 bytes do Gemini TTS. Por favor, reduza um pouco o texto.
          </span>
        </div>
      )}
    </div>
  );
};

