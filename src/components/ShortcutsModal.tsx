import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Enter / ⌘ + Enter', action: 'Gerar síntese de voz imediatamente' },
    { key: 'Espaço (Space)', action: 'Alternar Reproduzir / Pausar áudio ativo' },
    { key: 'Ctrl + S / ⌘ + S', action: 'Abrir janela de exportação de áudio' },
    { key: 'Esc', action: 'Fechar janelas, gavetas ou diálogos abertos' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181225] border border-[#2E2545] rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#2E2545] pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[#A78BFA]" />
            <h3 className="text-base font-bold text-[#F5F3FF]">Atalhos de Teclado</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#251D3A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-[#140E20] border border-[#2E2545]"
            >
              <span className="text-xs text-[#F5F3FF]">{s.action}</span>
              <kbd className="px-2 py-1 rounded bg-[#251D3A] border border-[#7C3AED]/40 text-[11px] font-mono text-[#DDD6FE] font-semibold shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[#2E2545] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md cursor-pointer transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

