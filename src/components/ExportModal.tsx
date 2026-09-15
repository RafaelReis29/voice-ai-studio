import React, { useState } from 'react';
import { X, Download, Sliders, CheckCircle2, FileAudio } from 'lucide-react';
import { ExportOptions, GenerationHistoryItem } from '../types';
import {
  base64ToUint8Array,
  createExportBlob,
  triggerFileDownload
} from '../utils/audioUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioItem: GenerationHistoryItem | null;
  onExportSuccess: (format: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  audioItem,
  onExportSuccess
}) => {
  const [format, setFormat] = useState<'mp3' | 'wav' | 'pcm' | 'ogg'>('mp3');
  const [bitrate, setBitrate] = useState<128 | 192 | 320>(192);
  const [sampleRate, setSampleRate] = useState<24000 | 44100 | 48000>(24000);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !audioItem) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const rawBytes = base64ToUint8Array(audioItem.audioBase64);
      const options: ExportOptions = {
        format,
        bitrate,
        sampleRate
      };

      const { blob, filenameExtension } = createExportBlob(rawBytes, options);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `voice_ai_studio_${audioItem.settings.voice.toLowerCase()}_${timestamp}.${filenameExtension}`;

      triggerFileDownload(blob, filename);
      onExportSuccess(filenameExtension.toUpperCase());
      setIsExporting(false);
      onClose();
    } catch (e) {
      console.error('Export failed:', e);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181225] border border-[#2E2545] rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#2E2545] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#A78BFA]" />
            <h3 className="text-base font-bold text-[#F5F3FF]">Parâmetros de Exportação de Áudio</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#B4A9D0] hover:text-[#F5F3FF] hover:bg-[#251D3A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Format Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#B4A9D0] uppercase tracking-wider">
            Formato de Saída & Codec
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'mp3', label: 'MP3 (MPEG Audio)', desc: 'Alta compatibilidade, tamanho compacto' },
              { id: 'wav', label: 'WAV (RIFF PCM)', desc: 'Sem compressão, qualidade de estúdio' },
              { id: 'ogg', label: 'OGG / OPUS', desc: 'Codec moderno otimizado para web' },
              { id: 'pcm', label: 'PCM Binário Puro', desc: 'Fluxo direto de 16-bit 24kHz' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id as any)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  format === f.id
                    ? 'bg-[#251D3A] border-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                    : 'bg-[#140E20] border-[#2E2545] text-[#B4A9D0] hover:border-[#7C3AED]/50'
                }`}
              >
                <span className="text-xs font-bold text-[#F5F3FF] flex items-center justify-between">
                  {f.label}
                  {format === f.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#A78BFA]" />}
                </span>
                <span className="text-[10px] text-[#B4A9D0] leading-tight">{f.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bitrate Selector (MP3 only) */}
        {format === 'mp3' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#B4A9D0] uppercase tracking-wider flex items-center justify-between">
              <span>Taxa de Bits (Bitrate)</span>
              <span className="text-[11px] font-mono text-[#DDD6FE]">{bitrate} kbps</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([128, 192, 320] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBitrate(b)}
                  className={`py-2 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                    bitrate === b
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                      : 'bg-[#140E20] text-[#B4A9D0] border-[#2E2545] hover:text-[#F5F3FF] hover:border-[#7C3AED]/40'
                  }`}
                >
                  {b} kbps {b === 192 ? '(Padrão)' : b === 320 ? '(Estúdio)' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sample Rate Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#B4A9D0] uppercase tracking-wider flex items-center justify-between">
            <span>Frequência de Amostragem</span>
            <span className="text-[11px] font-mono text-[#DDD6FE]">{sampleRate} Hz</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([24000, 44100, 48000] as const).map((sr) => (
              <button
                key={sr}
                type="button"
                onClick={() => setSampleRate(sr)}
                className={`py-2 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  sampleRate === sr
                    ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                    : 'bg-[#140E20] text-[#B4A9D0] border-[#2E2545] hover:text-[#F5F3FF] hover:border-[#7C3AED]/40'
                }`}
              >
                {sr === 24000 ? '24 kHz (Gemini)' : sr === 44100 ? '44.1 kHz' : '48 kHz'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2E2545]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-[#B4A9D0] hover:text-[#F5F3FF] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-export"
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#251D3A] disabled:text-[#6B6386] transition-colors shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Codificando...' : `Baixar .${format.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
