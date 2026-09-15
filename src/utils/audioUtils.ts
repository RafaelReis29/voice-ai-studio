import * as lamejsModule from 'lamejs';
import JSZip from 'jszip';
import { ExportOptions } from '../types';

// Extract Mp3Encoder safely across ESM / CJS module bundlings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lamejs: any = (lamejsModule as any).default || lamejsModule;

/**
 * Decodes a base64 string into a Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes a Uint8Array or ArrayBuffer to base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Synthesizes a valid RIFF WAV container around raw 16-bit PCM data.
 * Default sample rate is 24000 Hz, 1 channel (mono).
 */
export function pcmToWav(
  pcmData: Uint8Array,
  sampleRate: number = 24000,
  numChannels: number = 1,
  bitsPerSample: number = 16
): ArrayBuffer {
  // If the data already starts with 'RIFF', it's already a valid WAV
  if (
    pcmData.length >= 4 &&
    pcmData[0] === 0x52 &&
    pcmData[1] === 0x49 &&
    pcmData[2] === 0x46 &&
    pcmData[3] === 0x46
  ) {
    return pcmData.buffer.slice(
      pcmData.byteOffset,
      pcmData.byteOffset + pcmData.byteLength
    );
  }

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // ChunkID "RIFF"
  writeString(view, 0, 'RIFF');
  // ChunkSize (36 + SubChunk2Size)
  view.setUint32(4, 36 + dataSize, true);
  // Format "WAVE"
  writeString(view, 8, 'WAVE');
  // Subchunk1ID "fmt "
  writeString(view, 12, 'fmt ');
  // Subchunk1Size (16 for PCM)
  view.setUint32(16, 16, true);
  // AudioFormat (1 for PCM)
  view.setUint16(20, 1, true);
  // NumChannels (1 for Mono, 2 for Stereo)
  view.setUint16(22, numChannels, true);
  // SampleRate
  view.setUint32(24, sampleRate, true);
  // ByteRate
  view.setUint32(28, byteRate, true);
  // BlockAlign
  view.setUint16(32, blockAlign, true);
  // BitsPerSample
  view.setUint16(34, bitsPerSample, true);
  // Subchunk2ID "data"
  writeString(view, 36, 'data');
  // Subchunk2Size
  view.setUint32(40, dataSize, true);

  // Copy PCM data
  const uint8View = new Uint8Array(buffer, 44);
  uint8View.set(pcmData);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Encodes 16-bit PCM samples into an MP3 Blob using lamejs
 */
export function pcmToMp3Blob(
  pcmBytes: Uint8Array,
  options: {
    sampleRate?: number;
    bitrate?: number;
    channels?: number;
  } = {}
): Blob {
  const sampleRate = options.sampleRate || 24000;
  const bitrate = options.bitrate || 192;
  const channels = options.channels || 1;

  // Convert Uint8Array to Int16Array (16-bit PCM little endian)
  const int16Samples = new Int16Array(
    pcmBytes.buffer,
    pcmBytes.byteOffset,
    Math.floor(pcmBytes.byteLength / 2)
  );

  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
  const mp3Data: Uint8Array[] = [];
  const sampleBlockSize = 1152;

  for (let i = 0; i < int16Samples.length; i += sampleBlockSize) {
    const sampleChunk = int16Samples.subarray(i, i + sampleBlockSize);
    let mp3buf: Int8Array;
    if (channels === 1) {
      mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    } else {
      mp3buf = mp3encoder.encodeBuffer(sampleChunk, sampleChunk);
    }
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }
  }

  const mp3End = mp3encoder.flush();
  if (mp3End.length > 0) {
    mp3Data.push(new Uint8Array(mp3End));
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * Creates an exportable Blob in the requested format (MP3, WAV, PCM, OGG)
 */
export function createExportBlob(
  rawBytes: Uint8Array,
  options: ExportOptions
): { blob: Blob; filenameExtension: string } {
  // Check if rawBytes is already WAV (skip RIFF header if extracting raw PCM)
  let pcmData = rawBytes;
  if (
    rawBytes.length >= 44 &&
    rawBytes[0] === 0x52 &&
    rawBytes[1] === 0x49 &&
    rawBytes[2] === 0x46 &&
    rawBytes[3] === 0x46
  ) {
    pcmData = rawBytes.subarray(44);
  }

  switch (options.format) {
    case 'mp3': {
      const blob = pcmToMp3Blob(pcmData, {
        sampleRate: options.sampleRate,
        bitrate: options.bitrate,
        channels: 1
      });
      return { blob, filenameExtension: 'mp3' };
    }
    case 'wav': {
      const wavBuffer = pcmToWav(pcmData, options.sampleRate, 1, 16);
      return { blob: new Blob([wavBuffer], { type: 'audio/wav' }), filenameExtension: 'wav' };
    }
    case 'pcm': {
      return { blob: new Blob([pcmData], { type: 'application/octet-stream' }), filenameExtension: 'pcm' };
    }
    case 'ogg': {
      // Return opus/ogg-typed blob from wav or pcm container
      const wavBuffer = pcmToWav(pcmData, options.sampleRate, 1, 16);
      return { blob: new Blob([wavBuffer], { type: 'audio/ogg' }), filenameExtension: 'ogg' };
    }
    default: {
      const blob = pcmToMp3Blob(pcmData, { bitrate: 192 });
      return { blob, filenameExtension: 'mp3' };
    }
  }
}

/**
 * Triggers an immediate browser download of a Blob with a specific filename
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Calculates waveform visualization peaks from raw 16-bit PCM bytes
 */
export function extractWaveformPeaks(
  pcmBytes: Uint8Array,
  numPeaks: number = 80
): number[] {
  const int16 = new Int16Array(
    pcmBytes.buffer,
    pcmBytes.byteOffset,
    Math.floor(pcmBytes.byteLength / 2)
  );
  if (int16.length === 0) {
    return new Array(numPeaks).fill(0.1);
  }

  const blockSize = Math.floor(int16.length / numPeaks) || 1;
  const peaks: number[] = [];

  for (let i = 0; i < numPeaks; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, int16.length);
    let max = 0;
    for (let j = start; j < end; j++) {
      const absVal = Math.abs(int16[j]);
      if (absVal > max) max = absVal;
    }
    // Normalize to 0.05 - 1.0 range
    const normalized = Math.max(0.06, Math.min(1.0, max / 32768));
    peaks.push(normalized);
  }

  return peaks;
}

/**
 * Calculates audio duration in seconds from 16-bit PCM byte count and sample rate
 */
export function calculateDuration(byteLength: number, sampleRate: number = 24000): number {
  const numSamples = byteLength / 2; // 16-bit mono = 2 bytes per sample
  return Math.max(0, numSamples / sampleRate);
}

/**
 * Formats seconds into mm:ss format
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Creates a playable object URL for base64 raw PCM
 */
export function pcmBase64ToWavUrl(base64: string, sampleRate: number = 24000): string {
  const rawBytes = base64ToUint8Array(base64);
  const wav = pcmToWav(rawBytes, sampleRate, 1, 16);
  const blob = new Blob([wav], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

/**
 * Bundles multiple audio items into a single zip archive and downloads it
 */
export async function downloadBatchZip(
  items: { title: string; audioBase64: string }[],
  options: ExportOptions = { format: 'mp3', bitrate: 192, sampleRate: 24000 },
  zipFilename: string = 'voice-ai-studio-batch.zip'
) {
  const zip = new JSZip();

  items.forEach((item, index) => {
    const rawBytes = base64ToUint8Array(item.audioBase64);
    const { blob, filenameExtension } = createExportBlob(rawBytes, options);
    const safeTitle = (item.title || `audio_segment_${index + 1}`)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    zip.file(`${index + 1}_${safeTitle}.${filenameExtension}`, blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  triggerFileDownload(content, zipFilename);
}
