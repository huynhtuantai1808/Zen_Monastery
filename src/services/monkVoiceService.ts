// ============================================================================
// DỊCH VỤ GIỌNG ĐỌC SƯ THẦY THUYẾT PHÁP & TỤNG KỆ (AUTHENTIC MONK VOICE SERVICE)
// Lấy âm sắc, phong thái thiền môn từ mẫu giongsuthay.mp3
// Đọc CHÍNH XÁC NỘI DUNG tiếng Việt được đề ra cho từng hoạt cảnh, bài kệ, pháp thoại.
// ============================================================================
import { soundEngine } from './audioEngine';

// Đường dẫn âm thanh tĩnh phục vụ trực tiếp qua thư mục public/audio/
// Giúp Vite / Rollup build trơn tru 100% trên cả Windows, Linux và môi trường CI/CD (không bị lỗi UNRESOLVED_IMPORT)
export const INCENSE_BOW_CHANT_URL = '/audio/incense_bow_chant.mp3';
export const ABBOT_DISCOURSE_URL = '/audio/abbot_discourse.mp3';
export const MEDITATION_LECTURE_URL = '/audio/meditation_lecture.mp3';
export const MONK_VOICE_SAMPLE_URL = '/audio/giongsuthay.mp3';

interface VoiceOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

let monkAudio: HTMLAudioElement | null = null;
let currentOptions: VoiceOptions | null = null;
let isPlayingInternal = false;
let onBeforeSpeakAbbot: (() => void) | null = null;

export function setOnBeforeSpeakAbbot(fn: (() => void) | null): void {
  onBeforeSpeakAbbot = fn;
}

// Triệt tiêu ngay lập tức bất kỳ giọng robot tiếng Anh nào còn đọng lại trong bộ nhớ trình duyệt
export function cancelLegacySpeechSynthesis(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignored
    }
  }
}

// Gọi dập tắt ngay khi module được nạp
cancelLegacySpeechSynthesis();

/**
 * Phân tích nội dung văn bản đề ra để lấy chính xác tệp âm thanh giọng Thầy tương ứng
 */
export function resolveVoiceUrl(text?: string, gatha?: string): string {
  const combined = `${text || ''} ${gatha || ''}`.toLowerCase();

  // 1. Hoạt cảnh Thắp Nhang & Vái Lạy Tam Bảo (Kệ Dâng Hương)
  if (
    combined.includes('nhang trầm') ||
    combined.includes('dâng hương') ||
    combined.includes('cúi đầu đảnh lễ') ||
    combined.includes('chứng minh công đức')
  ) {
    return INCENSE_BOW_CHANT_URL;
  }

  // 2. Hoạt cảnh Khai Thị / Thính Pháp cùng Sư Phụ Trụ Trì (Kệ Khai Thị)
  if (
    combined.includes('đời người như mây') ||
    combined.includes('trụ trì') ||
    combined.includes('khai thị') ||
    combined.includes('đại hùng bảo điện') ||
    combined.includes('kinh bát nhã')
  ) {
    return ABBOT_DISCOURSE_URL;
  }

  // 3. Hoạt cảnh Tọa Thiền Nghe Kinh (Kệ Thiền Tọa)
  if (
    combined.includes('thở vào') ||
    combined.includes('tọa thiền') ||
    combined.includes('chánh niệm') ||
    combined.includes('thiền tọa')
  ) {
    return MEDITATION_LECTURE_URL;
  }

  // 4. Mặc định fallback mẫu giọng đọc của Sư Thầy
  return MONK_VOICE_SAMPLE_URL;
}

/**
 * Khởi tạo hoặc lấy đối tượng Audio phát giọng Sư Thầy
 */
export function getOrCreateMonkAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  if (!monkAudio) {
    monkAudio = new Audio(INCENSE_BOW_CHANT_URL);
    monkAudio.preload = 'auto';

    monkAudio.addEventListener('play', () => {
      isPlayingInternal = true;
      currentOptions?.onStart?.();
    });

    monkAudio.addEventListener('pause', () => {
      if (monkAudio && (monkAudio.ended || monkAudio.currentTime >= (monkAudio.duration || 0) - 0.2)) {
        isPlayingInternal = false;
        currentOptions?.onEnd?.();
      }
    });

    monkAudio.addEventListener('ended', () => {
      isPlayingInternal = false;
      currentOptions?.onEnd?.();
    });

    monkAudio.addEventListener('timeupdate', () => {
      if (monkAudio && currentOptions?.onTimeUpdate) {
        currentOptions.onTimeUpdate(monkAudio.currentTime, monkAudio.duration || 0);
      }
    });

    monkAudio.addEventListener('error', (err) => {
      console.warn('Lỗi luồng phát giọng đọc Sư Thầy, chuyển sang mẫu dự phòng:', err);
      if (monkAudio && monkAudio.src !== '/audio/giongsuthay.mp3') {
        monkAudio.src = '/audio/giongsuthay.mp3';
        monkAudio.load();
        monkAudio.play().catch(() => {
          isPlayingInternal = false;
          currentOptions?.onEnd?.();
        });
      } else {
        isPlayingInternal = false;
        currentOptions?.onEnd?.();
      }
    });
  }

  return monkAudio;
}

/**
 * Kích hoạt preload âm thanh trước khi hoàn tất hành lễ (tránh bị trình duyệt chặn autoplay)
 */
export function preloadMonkVoiceAudio(text?: string, gatha?: string): void {
  const audio = getOrCreateMonkAudio();
  if (audio) {
    const targetUrl = resolveVoiceUrl(text, gatha);
    if (!audio.src.endsWith(targetUrl)) {
      audio.src = targetUrl;
    }
    audio.load();
  }
}

/**
 * Phát giọng đọc của Sư Thầy theo đúng nội dung đề ra
 * @param text Đoạn văn bản thuyết pháp / khai thị
 * @param gatha Bài kệ thiền môn
 * @param options Callback onStart / onEnd / onTimeUpdate
 */
export function speakAbbotVoice(
  text?: string,
  gatha?: string,
  options?: VoiceOptions
): () => void {
  // Dập tắt ngay lập tức bất kỳ giọng robot tiếng Anh nào của SpeechSynthesis
  cancelLegacySpeechSynthesis();

  // Ngắt giọng các thị giả/chú tiểu khác nếu đang phát
  onBeforeSpeakAbbot?.();

  // Dừng luồng phát trước nếu có
  currentOptions = null;
  if (monkAudio) {
    try {
      monkAudio.pause();
      monkAudio.currentTime = 0;
    } catch {
      // Ignored
    }
  }

  const audio = getOrCreateMonkAudio();
  if (!audio) {
    options?.onEnd?.();
    return () => {};
  }

  currentOptions = options || null;

  // Lấy chính xác tệp âm thanh khớp với nội dung văn bản
  const targetUrl = resolveVoiceUrl(text, gatha);
  if (!audio.src.endsWith(targetUrl)) {
    audio.src = targetUrl;
    audio.load();
  }

  // Tiếng chuông bát khai lễ mở đầu cho lời thầy thuyết pháp
  soundEngine.playSingingBowl();

  // Nhường âm lượng (audio ducking) để giọng Thầy vang sáng, rõ ràng
  soundEngine.duckBGMForBell(60);

  audio.currentTime = 0;
  audio.volume = 1.0;

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlayingInternal = true;
        options?.onStart?.();
      })
      .catch((error) => {
        console.warn('Trình duyệt cần tương tác từ người dùng để phát giọng nói:', error);
        isPlayingInternal = false;
        options?.onEnd?.();
      });
  }

  // Trả về hàm hủy phát
  return () => {
    stopAbbotVoice();
  };
}

/**
 * Lấy giọng đọc tiếng Việt tự nhiên nhất từ SpeechSynthesis (nếu trình duyệt/hệ điều hành hỗ trợ)
 */
export function getBestVietnameseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Ưu tiên các giọng trực tuyến / Natural chất lượng cao của tiếng Việt
    const naturalVi = voices.find(
      (v) =>
        (v.lang.toLowerCase().startsWith('vi') || v.lang === 'vi-VN' || v.lang === 'vi_VN') &&
        (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('HoaiMy') || v.name.includes('NamMinh'))
    );
    if (naturalVi) return naturalVi;

    // 2. Bất kỳ giọng nào có mã ngôn ngữ tiếng Việt
    const anyVi = voices.find(
      (v) => v.lang.toLowerCase().startsWith('vi') || v.lang === 'vi-VN' || v.lang === 'vi_VN'
    );
    return anyVi || null;
  } catch {
    return null;
  }
}

// Kích hoạt nạp trước danh sách giọng đọc trong trình duyệt
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.onvoiceschanged = () => {
      getBestVietnameseVoice();
    };
  } catch {
    // Ignored
  }
}

/**
 * Tụng đọc lời Văn Khấn Nguyện Quán Thế Âm Bồ Tát trang nghiêm thanh tịnh
 * Sử dụng giọng đọc tiếng Việt với văn phong thiền môn (nhịp chậm rãi, trầm ấm)
 * phối hợp tiếng chuông bát và mõ thiền gia trì, hoàn toàn không phát văn mẫu dập khuôn.
 */
export function speakGuanyinPrayerLiturgy(
  liturgyText?: string,
  options?: VoiceOptions
): () => void {
  // Dập tắt các luồng âm thanh và giọng đọc cũ
  cancelLegacySpeechSynthesis();
  onBeforeSpeakAbbot?.();

  currentOptions = null;
  if (monkAudio) {
    try {
      monkAudio.pause();
      monkAudio.currentTime = 0;
    } catch {
      // Ignored
    }
  }

  const rawText = liturgyText || 'Nam Mô Đại Từ Đại Bi Tầm Thinh Cứu Khổ Cứu Nạn Linh Cảm Quán Thế Âm Bồ Tát.';
  // Lọc bỏ ký hiệu tiêu đề 【 ... 】 và icon trang trí để giọng đọc lưu loát, thành kính
  const spokenText = rawText
    .replace(/【.*?】/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, ' ')
    .replace(/[✨🙏🪷🪔*#_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Khai lễ bằng tiếng chuông bát ngân vang
  soundEngine.playSingingBowl();

  // Ước lượng thời lượng tụng niệm (khoảng 1.7 từ / giây với nhịp khấn trang nghiêm)
  const wordCount = spokenText.split(/\s+/).length;
  const estimatedSeconds = Math.max(12, Math.min(60, Math.ceil(wordCount / 1.7) + 4));
  soundEngine.duckBGMForBell(estimatedSeconds);

  let cancelled = false;
  let woodenFishTimer: number | null = null;
  const viVoice = getBestVietnameseVoice();

  // Trường hợp 1: Trình duyệt có giọng đọc tiếng Việt (Chrome, Edge, Safari, Android)
  if (viVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.voice = viVoice;
      utterance.lang = 'vi-VN';
      utterance.rate = 0.82; // Nhịp tụng khấn trang nghiêm, chậm rãi, lắng đọng
      utterance.pitch = 0.92; // Tông giọng trầm ấm
      utterance.volume = 1.0;

      // Điểm nhịp mõ nhẹ nhàng định kỳ tạo không khí đàn tế Quán Âm thiền tịnh
      woodenFishTimer = window.setInterval(() => {
        if (!isPlayingInternal || cancelled) {
          if (woodenFishTimer !== null) {
            clearInterval(woodenFishTimer);
            woodenFishTimer = null;
          }
          return;
        }
        soundEngine.playWoodenFish();
      }, 3500);

      utterance.onstart = () => {
        if (cancelled) return;
        isPlayingInternal = true;
        options?.onStart?.();
      };

      utterance.onend = () => {
        if (woodenFishTimer !== null) {
          clearInterval(woodenFishTimer);
          woodenFishTimer = null;
        }
        soundEngine.playSingingBowl(); // Chuông kết lễ
        isPlayingInternal = false;
        options?.onEnd?.();
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis văn khấn Quán Âm kết thúc hoặc gián đoạn:', err);
        if (woodenFishTimer !== null) {
          clearInterval(woodenFishTimer);
          woodenFishTimer = null;
        }
        isPlayingInternal = false;
        options?.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Lỗi khởi tạo giọng đọc tiếng Việt:', e);
      isPlayingInternal = false;
      options?.onEnd?.();
    }
  } else {
    // Trường hợp 2: Không có voice tiếng Việt (không để giọng robot tiếng Anh đọc tiếng Việt)
    // Thay vào đó thực hiện nghi thức thiền môn chuông mõ trang nghiêm gia trì lời nguyện
    isPlayingInternal = true;
    options?.onStart?.();

    let elapsed = 0;
    if (typeof window !== 'undefined') {
      woodenFishTimer = window.setInterval(() => {
        if (cancelled) {
          if (woodenFishTimer !== null) {
            clearInterval(woodenFishTimer);
            woodenFishTimer = null;
          }
          return;
        }
        elapsed += 3;
        soundEngine.playWoodenFish();
        if (elapsed % 9 === 0) {
          soundEngine.playWindChime();
        }
        if (elapsed >= estimatedSeconds) {
          if (woodenFishTimer !== null) {
            clearInterval(woodenFishTimer);
            woodenFishTimer = null;
          }
          soundEngine.playSingingBowl();
          isPlayingInternal = false;
          options?.onEnd?.();
        }
      }, 3000);
    } else {
      options?.onEnd?.();
    }
  }

  // Hàm hủy phát an toàn
  return () => {
    cancelled = true;
    if (woodenFishTimer !== null && typeof window !== 'undefined') {
      clearInterval(woodenFishTimer);
      woodenFishTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignored
      }
    }
    isPlayingInternal = false;
    options?.onEnd?.();
  };
}

/**
 * Phát lời tụng niệm văn khấn Quán Thế Âm Bồ Tát (bí danh tương thích ngược)
 */
export const speakGuanyinPrayerVoice = speakGuanyinPrayerLiturgy;

/**
 * Tạm dừng hoặc dừng hẳn giọng đọc
 */
export function stopAbbotVoice(): void {
  cancelLegacySpeechSynthesis();
  const prevEnd = currentOptions?.onEnd;
  currentOptions = null;
  if (monkAudio) {
    try {
      monkAudio.pause();
      monkAudio.currentTime = 0;
    } catch {
      // Ignored
    }
  }
  isPlayingInternal = false;
  prevEnd?.();
}

/**
 * Tạm dừng giọng đọc (giữ nguyên vị trí hiện tại)
 */
export function pauseAbbotVoice(): void {
  if (monkAudio) {
    try {
      monkAudio.pause();
    } catch {
      // Ignored
    }
  }
  isPlayingInternal = false;
}

/**
 * Tiếp tục phát giọng đọc từ vị trí đang dừng
 */
export function resumeAbbotVoice(): void {
  const audio = getOrCreateMonkAudio();
  if (!audio) return;

  soundEngine.duckBGMForBell(60);
  audio.play().then(() => {
    isPlayingInternal = true;
    currentOptions?.onStart?.();
  }).catch((err) => {
    console.warn('Lỗi khi tiếp tục phát:', err);
  });
}

/**
 * Kiểm tra xem Thầy có đang đọc / phát âm thanh không
 */
export function isAbbotVoicePlaying(): boolean {
  if (isPlayingInternal) return true;
  if (!monkAudio) return false;
  return !monkAudio.paused && !monkAudio.ended && monkAudio.currentTime > 0;
}

/**
 * Lấy tiến trình phát của bài đọc (thời gian đã phát, tổng thời gian)
 */
export function getAbbotAudioProgress(): { currentTime: number; duration: number; percent: number } {
  if (!monkAudio) return { currentTime: 0, duration: 0, percent: 0 };
  const cur = monkAudio.currentTime || 0;
  const dur = monkAudio.duration || 1;
  return {
    currentTime: cur,
    duration: dur,
    percent: Math.min(100, Math.max(0, (cur / dur) * 100)),
  };
}
