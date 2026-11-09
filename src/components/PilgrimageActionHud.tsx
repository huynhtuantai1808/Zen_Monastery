import React from 'react';
import { Sparkles, X, Volume2, VolumeX } from 'lucide-react';

export type PilgrimageRitualType = 'NONE' | 'LIGHT_INCENSE' | 'PROSTRATE_BOW' | 'MEDITATION_PRAY';

export interface PilgrimageHudProps {
  inShrineRange: boolean;
  activeRitual: PilgrimageRitualType;
  onLightIncense: () => void;
  onProstrateBow: () => void;
  onMeditationPray: () => void;
  activeBlessing: string | null;
  onCloseBlessing: () => void;
  isPrayerVoiceActive?: boolean;
  onTogglePrayerVoice?: () => void;
}

export interface PilgrimageButtonConfig {
  key: PilgrimageRitualType;
  label: string;
  icon: string;
  description: string;
  soundKey: 'bowl' | 'bell' | 'woodfish' | 'chime';
}

export const PILGRIMAGE_BUTTON_CONFIGS: PilgrimageButtonConfig[] = [
  {
    key: 'LIGHT_INCENSE',
    label: 'Thắp Hương',
    icon: '🪔',
    description: 'Dâng hương trầm thanh khiết trước tôn tượng Quán Thế Âm Bồ Tát',
    soundKey: 'bowl',
  },
  {
    key: 'PROSTRATE_BOW',
    label: 'Vái Lạy',
    icon: '🙏',
    description: 'Quỳ trên bồ đoàn hoa sen thành tâm khấu đầu đảnh lễ tam bái',
    soundKey: 'bell',
  },
  {
    key: 'MEDITATION_PRAY',
    label: 'Cầu Nguyện',
    icon: '✨',
    description: 'Chắp tay phát nguyện từ bi, nhận pháp thoại chúc phúc an lạc',
    soundKey: 'chime',
  },
];

export interface GuanyinBlessingVerse {
  id: string;
  title: string;
  invoking: string;
  verse: string;
  blessing: string;
}

export const GUANYIN_BLESSING_VERSES: GuanyinBlessingVerse[] = [
  {
    id: 'prayer_peace_protection',
    title: 'Văn Khấn Cầu An • Tiêu Tai Tường Hòa',
    invoking: 'Nam Mô Đại Từ Đại Bi Tầm Thinh Cứu Khổ Cứu Nạn Linh Cảm Quán Thế Âm Bồ Tát.',
    verse: 'Đệ tử chí tâm đảnh lễ Đức Mẹ Quán Âm. Cúi xin Bồ Tát rưới giọt nước cam lộ thanh tịnh, xoa dịu khổ đau, rửa sạch trần lao phiền não.',
    blessing: 'Nguyện xin Bồ Tát từ bi che chở cho gia đạo tường hòa, bốn mùa bình an, tai qua nạn khỏi, muôn việc hanh thông cát tường.',
  },
  {
    id: 'prayer_wisdom_compassion',
    title: 'Văn Khấn Cầu Trí Tuệ • Bồ Đề Tâm',
    invoking: 'Nam Mô Đại Bi Quán Thế Âm Bồ Tát Ma Ha Tát.',
    verse: 'Đệ tử chí tâm sám hối tội khiên, nguyện nương ánh từ quang Bồ Tát soi đường dẫn lối, dứt sạch tham sân chấp niệm nơi cõi hồng trần.',
    blessing: 'Cầu xin Bồ Tát khai mở trí tuệ sáng trong, nuôi dưỡng lòng từ bi hỷ xả yêu thương muôn loài, gieo mầm phúc thiện, thân tâm thường an lạc.',
  },
  {
    id: 'prayer_wishes_fulfilled',
    title: 'Văn Khấn Sở Cầu Như Ý • Sở Nguyện Tòng Tâm',
    invoking: 'Chí Tâm Quy Mạng Đấng Vô Lượng Từ Bi Đại Nguyện Hóa Thân.',
    verse: 'Trước tôn tượng Bạch Ngọc trang nghiêm, đệ tử chí thành dâng trọn lòng kính tín, quy y Tam Bảo, phát nguyện phụng sự việc thiện việc lành.',
    blessing: 'Cúi xin Bồ Tát từ bi chứng minh gia hộ, cho mọi ước nguyện chân chính đều được thành tựu, sở cầu xứng ý, sở nguyện tòng tâm, phước duyên tăng trưởng.',
  },
  {
    id: 'prayer_cam_lo_healing',
    title: 'Văn Khấn Cam Lộ • Hóa Giải Khổ Đau',
    invoking: 'Nam Mô Linh Cảm Quán Thế Âm Bồ Tát Chứng Minh Gia Hộ.',
    verse: 'Cành dương liễu phất sạch bụi trần gian, nước tịnh bình rưới mát mười phương cõi, xoa dịu mọi vết thương và muộn phiền nơi nhân thế.',
    blessing: 'Nguyện cho non sông an định, nhà nhà ấm no hạnh phúc, kẻ mất được siêu sinh cõi tịnh, người còn tăng phúc tăng thọ, muôn loài đều thấm nhuần Phật pháp.',
  },
];

export const PilgrimageActionHud: React.FC<PilgrimageHudProps> = ({
  inShrineRange,
  activeRitual,
  onLightIncense,
  onProstrateBow,
  onMeditationPray,
  activeBlessing,
  onCloseBlessing,
  isPrayerVoiceActive = false,
  onTogglePrayerVoice,
}) => {
  if (!inShrineRange) {
    return null;
  }

  return (
    <>
      {/* Floating Pilgrimage Action Bar */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto">
        <div className="mb-2 px-3 py-1 bg-amber-950/85 text-amber-200 text-xs font-serif rounded-full border border-amber-500/40 shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Quán Âm Đại Điện • Khu Vực Chiêm Bái Hành Hương</span>
        </div>

        <div className="flex items-center gap-2.5 bg-stone-900/90 p-2 rounded-2xl border border-amber-400/40 shadow-2xl backdrop-blur-md">
          {/* Nút 1: Thắp Hương */}
          <button
            type="button"
            onClick={onLightIncense}
            disabled={activeRitual !== 'NONE'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeRitual === 'LIGHT_INCENSE'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/50 scale-105'
                : 'bg-stone-800 hover:bg-amber-900/60 text-amber-100 hover:text-white border border-stone-700/60 hover:border-amber-500/50 active:scale-95'
              } ${activeRitual !== 'NONE' && activeRitual !== 'LIGHT_INCENSE' ? 'opacity-40 cursor-not-allowed' : ''}`}
            title="Dâng hương trầm thanh khiết trước đại lư đồng tam bảo"
          >
            <span className="text-lg">🪔</span>
            <span>Thắp Hương</span>
          </button>

          {/* Nút 2: Vái Lạy */}
          <button
            type="button"
            onClick={onProstrateBow}
            disabled={activeRitual !== 'NONE'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeRitual === 'PROSTRATE_BOW'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/50 scale-105'
                : 'bg-stone-800 hover:bg-amber-900/60 text-amber-100 hover:text-white border border-stone-700/60 hover:border-amber-500/50 active:scale-95'
              } ${activeRitual !== 'NONE' && activeRitual !== 'PROSTRATE_BOW' ? 'opacity-40 cursor-not-allowed' : ''}`}
            title="Quỳ trên bồ đoàn hoa sen chí thành đảnh lễ tam bái"
          >
            <span className="text-lg">🙏</span>
            <span>Vái Lạy</span>
          </button>

          {/* Nút 3: Cầu Nguyện */}
          <button
            type="button"
            onClick={onMeditationPray}
            disabled={activeRitual !== 'NONE'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeRitual === 'MEDITATION_PRAY'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/50 scale-105'
                : 'bg-stone-800 hover:bg-amber-900/60 text-amber-100 hover:text-white border border-stone-700/60 hover:border-amber-500/50 active:scale-95'
              } ${activeRitual !== 'NONE' && activeRitual !== 'MEDITATION_PRAY' ? 'opacity-40 cursor-not-allowed' : ''}`}
            title="Chắp tay hiệp chưởng cầu nguyện từ bi & nhận kệ chúc phúc"
          >
            <span className="text-lg">✨</span>
            <span>Cầu Nguyện</span>
          </button>
        </div>
      </div>

      {/* Blessing Card Modal Popup */}
      {activeBlessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in">
          <div className="relative max-w-md w-full bg-gradient-to-b from-stone-900 via-amber-950/70 to-stone-900 rounded-2xl border-2 border-amber-400/60 p-6 shadow-2xl text-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={onCloseBlessing}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-amber-300 hover:text-white hover:bg-amber-900/50 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mandala Halo Icon */}
            <div className="mx-auto w-14 h-14 mb-3 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-2xl shadow-inner">
              🪷
            </div>

            <h3 className="text-xl font-bold font-serif text-amber-300 tracking-wide mb-1">
              Văn Khấn Nguyện Quán Thế Âm Bồ Tát
            </h3>
            <p className="text-xs uppercase tracking-widest text-amber-400/80 mb-3 font-mono">
              Nam Mô Đại Bi Quán Thế Âm Bồ Tát
            </p>

            <div className="p-4 mb-3.5 rounded-xl bg-black/45 border border-amber-500/35 text-amber-100 font-serif text-sm md:text-base leading-relaxed shadow-sm whitespace-pre-line text-left">
              {activeBlessing}
            </div>

            {/* Audio Voice Recitation Status & Toggle */}
            <div className="mb-4 flex items-center justify-center">
              <button
                type="button"
                onClick={onTogglePrayerVoice}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isPrayerVoiceActive
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20'
                    : 'bg-stone-800/80 hover:bg-stone-800 border-amber-500/30 text-amber-300/80'
                }`}
                title={isPrayerVoiceActive ? 'Bấm để tắt giọng tụng khấn' : 'Bấm để nghe giọng tụng khấn Quán Âm'}
              >
                {isPrayerVoiceActive ? (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>Đang tụng đọc văn khấn Quán Âm...</span>
                    <span className="flex gap-0.5 items-end h-3 ml-1">
                      <span className="w-0.5 h-2 bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-0.5 h-3 bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-2 bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-amber-400/70" />
                    <span>Lắng nghe tụng đọc lời văn khấn 🙏</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={onCloseBlessing}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium rounded-xl shadow-lg shadow-amber-600/40 border border-amber-300/40 transition-all active:scale-98"
            >
              Chí Tâm Đảnh Lễ & Hoan Hỷ Tiếp Nhận 🙏
            </button>
          </div>
        </div>
      )}
    </>
  );
};
