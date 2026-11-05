// ============================================================================
// DỊCH VỤ GIỌNG ĐỌC CHÚ TIỂU TUỆ TÂM (AUTHENTIC INNOCENT NOVICE VOICE SERVICE)
// Dựa trên âm sắc thiền môn tiếng Việt có sẵn (/audio/giongsuthay.mp3)
// Xử lý biến đổi âm sắc trẻ thơ (8-12 tuổi) qua Web Audio DSP:
//  - Pitch Shift (detune: +620 cents ~ 5.2 semitones)
//  - Playback Speed: 1.14x (nhanh nhẹn, hoạt bát, ngây thơ)
//  - High-Pass Filter: 240Hz (triệt tiêu dải trầm lồng ngực người lớn)
//  - Peaking EQ Filter: 3.4kHz boost +3.5dB (tôn độ sáng, trong trẻo của giọng thiếu nhi)
// ============================================================================

import { soundEngine } from './audioEngine';
import { stopAbbotVoice, cancelLegacySpeechSynthesis, setOnBeforeSpeakAbbot } from './monkVoiceService';

// Đăng ký ngắt giọng Chú Tiểu khi Sư Phụ bắt đầu thuyết pháp
setOnBeforeSpeakAbbot(() => {
  stopTueTamVoice();
});

export interface NoviceDSPConfig {
  detune: number;          // Cents (e.g. +620)
  playbackRate: number;    // Speed multiplier (e.g. 1.14)
  highPassCutoff: number;  // Cut off adult chest frequencies (Hz, e.g. 240)
  peakFreq: number;        // Formant presence boost (Hz, e.g. 3400)
  peakGain: number;        // Gain boost (dB, e.g. 3.5)
  volume: number;          // Output volume (0.0 to 1.0)
}

export const DEFAULT_NOVICE_DSP: NoviceDSPConfig = {
  detune: 620,
  playbackRate: 1.14,
  highPassCutoff: 240,
  peakFreq: 3400,
  peakGain: 3.5,
  volume: 0.95,
};

export type NoviceVoiceClipKey = 'GREETING' | 'SWEEP_START' | 'SWEEP_COMPLETE' | 'AN_LAC';

export interface NoviceVoiceClipInfo {
  id: string;
  key: NoviceVoiceClipKey;
  title: string;
  speaker: string;
  role: string;
  avatar: string;
  text: string;
}

export const TUE_TAM_QUOTES: Record<NoviceVoiceClipKey, NoviceVoiceClipInfo> = {
  GREETING: {
    id: 'tuetam-greeting',
    key: 'GREETING',
    title: 'Đàm Đạo Cùng Chú Tiểu Tuệ Tâm',
    speaker: 'Chú Tiểu Tuệ Tâm',
    role: 'Thị Giả Chánh Điện • Tuệ Tâm',
    avatar: '🧹',
    text: 'A Di Đà Phật! Đệ tử đang quét dọn lá đa rụng trước sân Chánh Điện để giữ gìn cảnh chùa thanh tịnh.\n\nSư Phụ thường dạy: "Quét sạch bụi trần, tâm tự an". Kính chúc thí chủ thân tâm an lạc!',
  },
  SWEEP_START: {
    id: 'tuetam-sweep-start',
    key: 'SWEEP_START',
    title: 'Quét Lá Đa Chánh Niệm',
    speaker: 'Chú Tiểu Tuệ Tâm',
    role: 'Thị Giả Quét Sân',
    avatar: '🧹',
    text: 'A Di Đà Phật! Thí chủ cùng đệ tử quét dọn sân chùa nhé. Mỗi nhát chổi quét đi một phiền não, tâm mình lại sáng thêm một chút!',
  },
  SWEEP_COMPLETE: {
    id: 'tuetam-sweep-complete',
    key: 'SWEEP_COMPLETE',
    title: 'Công Đức Viên Mãn',
    speaker: 'Chú Tiểu Tuệ Tâm',
    role: 'Thị Giả Quét Sân',
    avatar: '✨',
    text: 'Lành thay! Sân chùa đã phong quang sạch sẽ rồi. Đệ tử xin kính chúc thí chủ thân tâm thường an lạc, phước đức vô lượng!',
  },
  AN_LAC: {
    id: 'tuetam-an-lac',
    key: 'AN_LAC',
    title: 'Lời Chúc An Lạc',
    speaker: 'Chú Tiểu Tuệ Tâm',
    role: 'Thị Giả Chánh Điện',
    avatar: '🙏',
    text: 'A Di Đà Phật! Kính chúc thí chủ và gia quyến một ngày vãn cảnh sơn tự trọn vẹn an yên, tâm an vạn sự an!',
  },
};

export interface NoviceVoiceOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  customDsp?: Partial<NoviceDSPConfig>;
}

// ==========================================
// INTERNAL STATE & AUDIO BUFFER CACHING
// ==========================================
const BASE_VOICE_URL = '/audio/giongsuthay.mp3';

let audioContext: AudioContext | null = null;
let cachedVoiceBuffer: AudioBuffer | null = null;
let isBufferLoading = false;
let currentSourceNode: AudioBufferSourceNode | null = null;
let currentGainNode: GainNode | null = null;
let activeOptions: NoviceVoiceOptions | null = null;
let isPlayingInternal = false;
let playStartTime = 0;
let estimatedDuration = 0;
let timeUpdateTimer: number | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

/**
 * Nạp trước và giải mã tệp âm thanh mẫu sang AudioBuffer trong RAM
 */
export async function preloadTueTamVoice(sourceUrl: string = BASE_VOICE_URL): Promise<AudioBuffer | null> {
  if (cachedVoiceBuffer) return cachedVoiceBuffer;
  if (typeof window === 'undefined') return null;

  const ctx = getOrCreateAudioContext();
  if (!ctx) return null;

  if (isBufferLoading) {
    // Chờ luồng đang nạp hoàn tất
    for (let i = 0; i < 30; i++) {
      if (cachedVoiceBuffer) return cachedVoiceBuffer;
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  isBufferLoading = true;
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} when loading ${sourceUrl}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    cachedVoiceBuffer = await ctx.decodeAudioData(arrayBuffer);
    isBufferLoading = false;
    return cachedVoiceBuffer;
  } catch (err) {
    console.warn('Lỗi nạp audio buffer cho giọng Chú Tiểu Tuệ Tâm:', err);
    isBufferLoading = false;
    return null;
  }
}

/**
 * Dừng phát giọng Chú Tiểu và dọn dẹp các audio node
 */
export function stopTueTamVoice(): void {
  cancelLegacySpeechSynthesis();

  if (timeUpdateTimer !== null && typeof window !== 'undefined') {
    window.clearInterval(timeUpdateTimer);
    timeUpdateTimer = null;
  }

  if (currentSourceNode) {
    try {
      currentSourceNode.onended = null;
      currentSourceNode.stop();
      currentSourceNode.disconnect();
    } catch {
      // Ignored
    }
    currentSourceNode = null;
  }

  if (currentGainNode) {
    try {
      currentGainNode.disconnect();
    } catch {
      // Ignored
    }
    currentGainNode = null;
  }

  if (isPlayingInternal) {
    isPlayingInternal = false;
    const endCb = activeOptions?.onEnd;
    activeOptions = null;
    endCb?.();
  } else {
    activeOptions = null;
  }
}

/**
 * Kiểm tra Chú Tiểu có đang phát giọng nói không
 */
export function isTueTamSpeaking(): boolean {
  return isPlayingInternal;
}

/**
 * Phát giọng đọc Chú Tiểu Tuệ Tâm (Web Audio DSP điều biến âm sắc trẻ thơ)
 * @param _text Nội dung văn bản (dùng để hiển thị/ghi nhật ký)
 * @param clipKey Mã kịch bản ('GREETING' | 'SWEEP_START' | 'SWEEP_COMPLETE' | 'AN_LAC')
 * @param options Callback onStart / onEnd / onTimeUpdate và tùy biến DSP
 */
export function speakTueTamVoice(
  _text?: string,
  clipKey: NoviceVoiceClipKey = 'GREETING',
  options?: NoviceVoiceOptions
): () => void {
  // 1. Dập tắt giọng Sư Phụ và giọng cũ (Voice Exclusivity)
  stopAbbotVoice();
  stopTueTamVoice();

  const ctx = getOrCreateAudioContext();
  if (!ctx) {
    options?.onEnd?.();
    return () => {};
  }

  activeOptions = options || null;
  const dsp: NoviceDSPConfig = { ...DEFAULT_NOVICE_DSP, ...(options?.customDsp || {}) };

  // 2. Kích hoạt âm thanh chuông gió nhẹ nhàng mở đầu cho Chú Tiểu
  soundEngine.playWindChime();

  // 3. Thực hiện Audio Ducking cho nhạc nền để giọng Chú Tiểu trong trẻo, rõ nét
  const estimatedSeconds = clipKey === 'SWEEP_START' ? 6 : clipKey === 'SWEEP_COMPLETE' ? 7 : 9;
  soundEngine.duckBGMForBell(estimatedSeconds);

  // 4. Khởi chạy luồng DSP
  const executePlay = (buffer: AudioBuffer) => {
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = dsp.playbackRate;

      // Nâng cao độ F0 thành giọng thiếu nhi ngây thơ
      if (source.detune) {
        source.detune.value = dsp.detune;
      }

      // Bộ lọc High-pass: Cắt tần số trầm ngực người lớn (< 240Hz)
      const highPass = ctx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.value = dsp.highPassCutoff;
      highPass.Q.value = 0.7;

      // Bộ lọc Peaking EQ: Kích hoạt dải tần 3.4kHz cho độ sáng, thanh thoát của trẻ nhỏ
      const peaking = ctx.createBiquadFilter();
      peaking.type = 'peaking';
      peaking.frequency.value = dsp.peakFreq;
      peaking.Q.value = 1.2;
      peaking.gain.value = dsp.peakGain;

      // Điều khiển âm lượng đầu ra
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(dsp.volume, ctx.currentTime);

      // Nối chuỗi audio graph: Source -> HighPass -> Peaking -> Gain -> Destination
      source.connect(highPass);
      highPass.connect(peaking);
      peaking.connect(gainNode);
      gainNode.connect(ctx.destination);

      currentSourceNode = source;
      currentGainNode = gainNode;
      isPlayingInternal = true;
      playStartTime = ctx.currentTime;
      estimatedDuration = (buffer.duration / dsp.playbackRate);

      source.onended = () => {
        stopTueTamVoice();
      };

      source.start(0);
      options?.onStart?.();

      // Bộ đếm thời gian cập nhật tiến trình phát
      if (options?.onTimeUpdate && typeof window !== 'undefined') {
        timeUpdateTimer = window.setInterval(() => {
          if (!isPlayingInternal || !ctx) {
            if (timeUpdateTimer !== null) {
              window.clearInterval(timeUpdateTimer);
              timeUpdateTimer = null;
            }
            return;
          }
          const elapsed = (ctx.currentTime - playStartTime);
          options.onTimeUpdate?.(Math.min(elapsed, estimatedDuration), estimatedDuration);
        }, 100);
      }
    } catch (e) {
      console.warn('Lỗi khi phát chuỗi DSP giọng Chú Tiểu:', e);
      stopTueTamVoice();
    }
  };

  if (cachedVoiceBuffer) {
    executePlay(cachedVoiceBuffer);
  } else {
    preloadTueTamVoice().then((buf) => {
      if (buf) {
        executePlay(buf);
      } else {
        options?.onEnd?.();
      }
    }).catch(() => {
      options?.onEnd?.();
    });
  }

  return () => {
    stopTueTamVoice();
  };
}
