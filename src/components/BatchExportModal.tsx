import React, { useState } from 'react';
import { X, Layers, Plus, Trash2, Download, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { BatchItem, GenerationSettings } from '../types';
import { GEMINI_VOICES } from '../data/voices';
import { downloadBatchZip } from '../utils/audioUtils';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchQueue: BatchItem[];
  onUpdateQueue: (queue: BatchItem[]) => void;
  currentSettings: GenerationSettings;
  currentText: string;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  batchQueue,
  onUpdateQueue,
  currentSettings,
  currentText
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  if (!isOpen) return null;

  const handleAddCurrent = () => {
    if (!currentText.trim()) return;
    const newItem: BatchItem = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: currentText.slice(0, 30).trim() || 'Segment',
      text: currentText,
      voice: currentSettings.voice,
      speakingRate: currentSettings.speakingRate,
      styleInstruction: currentSettings.styleInstruction,
      status: 'idle'
    };
    onUpdateQueue([...batchQueue, newItem]);
  };

  const handleAddNewBlank = () => {
    const newItem: BatchItem = {
      id: `batch-${Date.now()}`,
      title: `Segment ${batchQueue.length + 1}`,
      text: '',
      voice: 'Puck',
      speakingRate: 1.0,
      styleInstruction: '',
      status: 'idle'
    };
    onUpdateQueue([...batchQueue, newItem]);
  };

  const handleRemove = (id: string) => {
    onUpdateQueue(batchQueue.filter((item) => item.id !== id));
  };

  const handleGenerateAndExportZip = async () => {
    if (batchQueue.length === 0) return;
    setIsProcessing(true);

    const updatedQueue = [...batchQueue];

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (!item.text.trim()) continue;

      setProgressMsg(`Generating segment ${i + 1} of ${updatedQueue.length}: ${item.voice}...`);
      item.status = 'generating';
      onUpdateQueue([...updatedQueue]);

      try {
        const response = await fetch('/api/tts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: item.text,
            voice: item.voice,
            speakingRate: item.speakingRate,
            styleInstruction: item.styleInstruction
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Generation failed');
        }

        item.audioBase64 = data.audioBase64;
        item.durationSeconds = data.durationSeconds;
        item.status = 'done';
      } catch (err: any) {
        item.status = 'error';
        item.error = err.message || 'Failed';
      }
      onUpdateQueue([...updatedQueue]);
    }

    // Now bundle all successful items into a ZIP file of MP3s
    const validItems = updatedQueue.filter((item) => item.audioBase64);
    if (validItems.length > 0) {
      setProgressMsg('Encoding MP3 files and packaging ZIP archive...');
      await downloadBatchZip(
        validItems.map((item, idx) => ({
          title: item.title || `segment_${idx + 1}`,
          audioBase64: item.audioBase64!
        })),
        { format: 'mp3', bitrate: 192, sampleRate: 24000 },
        `voice_ai_studio_batch_${Date.now()}.zip`
      );
    }

    setIsProcessing(false);
    setProgressMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181225] border border-[#2E2545] rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-[#2E2545] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#A78BFA]" />
            <h3 className="text-base font-bold text-[#F5F3FF]">Fila de Exportação em Lote</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#251D3A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#B4A9D0]">
          Enfileire múltiplos segmentos de texto com vozes e velocidades personalizadas. Gere todos e baixe como um pacote ZIP contendo os arquivos MP3.
        </p>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddCurrent}
            disabled={!currentText.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#F5F3FF] bg-[#251D3A] hover:bg-[#342850] border border-[#2E2545] hover:border-[#7C3AED]/40 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Adicionar Texto Atual do Editor</span>
          </button>

          <button
            type="button"
            onClick={handleAddNewBlank}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#B4A9D0] hover:text-[#F5F3FF] bg-[#251D3A] hover:bg-[#342850] border border-[#2E2545] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Novo Segmento</span>
          </button>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px] pr-1">
          {batchQueue.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[#140E20] border border-[#2E2545] rounded-xl p-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#251D3A] text-[#DDD6FE] text-[10px] font-mono flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...batchQueue];
                      updated[idx].title = e.target.value;
                      onUpdateQueue(updated);
                    }}
                    placeholder="Título do segmento"
                    className="bg-transparent text-xs font-semibold text-[#F5F3FF] border-b border-transparent focus:border-[#7C3AED] focus:outline-none px-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.voice}
                    onChange={(e) => {
                      const updated = [...batchQueue];
                      updated[idx].voice = e.target.value;
                      onUpdateQueue(updated);
                    }}
                    className="bg-[#251D3A] border border-[#2E2545] rounded px-2 py-1 text-xs text-[#F5F3FF]"
                  >
                    {GEMINI_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1 rounded text-[#B4A9D0] hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                value={item.text}
                onChange={(e) => {
                  const updated = [...batchQueue];
                  updated[idx].text = e.target.value;
                  onUpdateQueue(updated);
                }}
                placeholder="Insira o texto para este segmento de fala..."
                rows={2}
                className="w-full bg-[#181225] border border-[#2E2545] rounded p-2 text-xs text-[#F5F3FF] placeholder-[#6B6386] focus:border-[#7C3AED] focus:outline-none"
              />

              <div className="flex items-center justify-between text-[11px] text-[#B4A9D0]">
                <span>Voz: {item.voice} ({item.speakingRate}x)</span>
                {item.status === 'generating' && (
                  <span className="text-amber-300 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Sintetizando...
                  </span>
                )}
                {item.status === 'done' && (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle className="w-3 h-3" />
                    Pronto ({item.durationSeconds?.toFixed(1)}s)
                  </span>
                )}
                {item.status === 'error' && (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {item.error || 'Falha'}
                  </span>
                )}
              </div>
            </div>
          ))}

          {batchQueue.length === 0 && (
            <div className="text-center py-12 text-xs text-[#B4A9D0] border border-dashed border-[#2E2545] rounded-xl">
              Nenhum segmento na fila ainda. Clique em &quot;Adicionar Texto Atual do Editor&quot; ou &quot;Adicionar Novo Segmento&quot; acima.
            </div>
          )}
        </div>

        {/* Progress Display */}
        {isProcessing && (
          <div className="p-3 rounded-lg bg-[#251D3A] border border-[#7C3AED]/40 text-xs text-[#DDD6FE] flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#A78BFA]" />
            <span>{progressMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2E2545]">
          <span className="text-xs text-[#B4A9D0] font-mono">
            {batchQueue.length} segmento(s) na fila
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#B4A9D0] hover:text-[#F5F3FF] transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              id="btn-export-batch-zip"
              type="button"
              onClick={handleGenerateAndExportZip}
              disabled={isProcessing || batchQueue.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#251D3A] disabled:text-[#6B6386] transition-colors shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Gerando Lote...' : 'Baixar Todos em ZIP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
