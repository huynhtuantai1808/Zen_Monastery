import React from 'react';
import { Sparkles, X } from 'lucide-react';

export type PilgrimageRitualType = 'NONE' | 'LIGHT_INCENSE' | 'PROSTRATE_BOW' | 'MEDITATION_PRAY';

export interface PilgrimageHudProps {
  inShrineRange: boolean;
  activeRitual: PilgrimageRitualType;
  onLightIncense: () => void;
  onProstrateBow: () => void;
  onMeditationPray: () => void;
  activeBlessing: string | null;
  onCloseBlessing: () => void;
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
  verse: string;
  blessing: string;
}

export const GUANYIN_BLESSING_VERSES: GuanyinBlessingVerse[] = [
  {
    id: 'verse_compassion',
    title: 'Từ Bi Hỷ Xả',
    verse: 'Tâm từ chan chứa mười phương, lòng bi xoa dịu muôn vàn khổ đau.',
    blessing: 'Cầu chúc bạn tâm hồn luôn an tịnh, mở rộng lòng từ ái yêu thương muôn loài.',
  },
  {
    id: 'verse_peace',
    title: 'Bình An Thanh Thản',
    verse: 'Cành dương quét sạch trần duyên, nước cam lộ rưới tiêu tan muộn phiền.',
    blessing: 'Nguyện ánh từ quang Bồ Tát che chở cho bạn và gia quyến một đời cát tường như ý.',
  },
  {
    id: 'verse_wisdom',
    title: 'Trí Tuệ Soi Đường',
    verse: 'Bồ Đề tâm nở hoa sen, ngọn đèn chánh niệm sáng ngời màn đêm.',
    blessing: 'Chúc bạn thân tâm an lạc, trí tuệ khai mở, vững bước trên nẻo thiện lành.',
  },
  {
    id: 'verse_karma',
    title: 'Tiêu Trừ Chướng Nghiệp',
    verse: 'Nam Mô Đại Bi Quán Thế Âm Bồ Tát cứu khổ cứu nạn quảng đại linh cảm.',
    blessing: 'Nguyện mọi tai ương chướng ngại thảy đều tiêu tan, phước đức vô lượng vô biên.',
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
              Lời Chúc Phúc Từ Bi
            </h3>
            <p className="text-xs uppercase tracking-widest text-amber-400/80 mb-4 font-mono">
              Quán Thế Âm Bồ Tát
            </p>

            <div className="p-4 mb-5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-100 font-serif italic text-base leading-relaxed shadow-sm">
              "{activeBlessing}"
            </div>

            <button
              type="button"
              onClick={onCloseBlessing}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium rounded-xl shadow-lg shadow-amber-600/40 border border-amber-300/40 transition-all active:scale-98"
            >
              Hoan Hỷ Tiếp Nhận 🙏
            </button>
          </div>
        </div>
      )}
    </>
  );
};
