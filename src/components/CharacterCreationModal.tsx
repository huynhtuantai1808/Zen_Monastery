import React, { useState } from 'react';
import type { CharacterAppearance, GenderType, RobeColorType, HairStyleType, AccessoryType } from '../types/game';
import { Sparkles, Check, X, Shuffle } from 'lucide-react';
import { soundEngine } from '../services/audioEngine';
import { ZenCharacterSprite } from './ZenCharacterSprite';

interface CharacterCreationModalProps {
  initialCharacter: CharacterAppearance;
  isFirstTime?: boolean;
  onSave: (char: CharacterAppearance) => void;
  onClose: () => void;
}

const NAME_SUGGESTIONS_MALE = ['Tuệ Minh', 'Tịnh An', 'Chân Thiện', 'Minh Triết', 'Tâm An', 'Bảo Quang'];
const NAME_SUGGESTIONS_FEMALE = ['Diệu Tâm', 'Ngọc Tâm', 'Tịnh Như', 'Diệu Âm', 'Liên Hoa', 'Thanh Tịnh'];

const ROBE_COLORS: { id: RobeColorType; name: string; hex: string; desc: string }[] = [
  { id: 'lam', name: 'Lam Thanh Tịnh', hex: '#60a5fa', desc: 'Sắc lam anime dịu mát trẻ trung' },
  { id: 'nau', name: 'Nâu Trầm Ấm', hex: '#92400e', desc: 'Màu đất mộc mạc, nhẫn nại và khiêm cung' },
  { id: 'xam', name: 'Xám Khói Thiền Môn', hex: '#64748b', desc: 'Sắc xám tĩnh lặng như sương sớm đỉnh núi' },
  { id: 'bach', name: 'Bạch Y Thuần Khiết', hex: '#f8fafc', desc: 'Màu trắng thanh khiết, tâm không tì vết' },
];

const HAIR_STYLES: { id: HairStyleType; name: string; icon: string }[] = [
  { id: 'short', name: 'Tóc Ngắn Anime', icon: '👦' },
  { id: 'bun', name: 'Tóc Búi Duyên Dáng', icon: '👱' },
  { id: 'shaved', name: 'Quy Y Thanh Tịnh', icon: '🧑‍🦲' },
];

const ACCESSORIES: { id: AccessoryType; name: string; icon: string; desc: string }[] = [
  { id: 'beads', name: 'Chuỗi Hạt Bồ Đề', icon: '📿', desc: '108 hạt niệm Phật định tâm' },
  { id: 'bag', name: 'Túi Vải Chàm', icon: '🎒', desc: 'Túi xách đựng kinh sách thanh đạm' },
  { id: 'hat', name: 'Nón Lá Mộc Mạc', icon: '👒', desc: 'Che mưa che nắng trên đường hành hương' },
  { id: 'none', name: 'Không Mang Phụ Kiện', icon: '✨', desc: 'Thân tâm nhẹ nhàng thảnh thơi' },
];

export const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({
  initialCharacter,
  isFirstTime = false,
  onSave,
  onClose,
}) => {
  const [character, setCharacter] = useState<CharacterAppearance>(initialCharacter);

  const handleGenderChange = (gender: GenderType) => {
    soundEngine.playWoodenFish();
    const names = gender === 'male' ? NAME_SUGGESTIONS_MALE : NAME_SUGGESTIONS_FEMALE;
    const randomName = names[Math.floor(Math.random() * names.length)];
    setCharacter((prev) => ({
      ...prev,
      gender,
      name: prev.name === initialCharacter.name ? randomName : prev.name,
      hairStyle: gender === 'female' && prev.hairStyle === 'short' ? 'bun' : prev.hairStyle,
    }));
  };

  const handleRandomizeName = () => {
    soundEngine.playWoodenFish();
    const list = character.gender === 'male' ? NAME_SUGGESTIONS_MALE : NAME_SUGGESTIONS_FEMALE;
    const chosen = list[Math.floor(Math.random() * list.length)];
    setCharacter((prev) => ({ ...prev, name: chosen }));
  };

  const handleConfirm = () => {
    soundEngine.playTempleBell();
    onSave(character);
  };

  // Live SVG Avatar Rendering
  const currentRobe = ROBE_COLORS.find((r) => r.id === character.robeColor) || ROBE_COLORS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="anime-paper-panel max-w-4xl w-full rounded-[32px] p-5 sm:p-8 relative flex flex-col border-2 border-pink-400/40 shadow-[0_25px_60px_rgba(244,114,182,0.25)] my-auto">
        {!isFirstTime && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-purple-900/50 hover:text-pink-600 p-2.5 rounded-full hover:bg-pink-100 transition-colors cursor-pointer z-10"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Anime Header Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 text-pink-700 text-xs font-heading font-black tracking-wider mb-2 border border-pink-400/40 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin-slow" /> {isFirstTime ? 'Khởi Tạo Nhân Vật • Anime Edition' : 'Tùy Biến Diện Mạo • Anime Edition'}
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl text-purple-950 font-black tracking-tight">
            {isFirstTime ? 'Thiết Kế Nhân Vật Anime' : 'Chỉnh Sửa Pháp Danh & Trang Phục'}
          </h2>
          <p className="text-xs sm:text-sm text-purple-800/80 font-sans max-w-md mx-auto mt-1 font-semibold">
            Chọn giới tính, pháp danh và phong cách thanh tịnh trước khi bước vào thế giới tu tập Chùa Vân Ẩn.
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Cột trái: Live Anime Avatar Preview (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-gradient-to-b from-[#1c1335] via-[#150d2b] to-[#0c071d] p-6 rounded-[28px] border-2 border-pink-400/40 shadow-[0_12px_36px_rgba(236,72,153,0.3)] relative overflow-hidden">
            {/* Anime Sparkles & Star Particles in Background */}
            <div className="absolute top-3 left-4 text-pink-300 text-xs opacity-75 animate-bounce">✦</div>
            <div className="absolute bottom-6 right-5 text-purple-300 text-xs opacity-75 animate-pulse">✦</div>
            <div className="absolute top-10 right-8 text-amber-300 text-sm opacity-60">✧</div>

            <div className="relative w-48 h-56 flex items-center justify-center">
              {/* Anime Magic Circle Glow */}
              <div className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-pink-500/30 to-purple-500/30 blur-2xl animate-pulse" />

              {/* Cute Chibi Character Sprite */}
              <div className="relative z-10">
                <ZenCharacterSprite
                  character={character}
                  pose="idle"
                  scale={1.05}
                  showNameTag={false}
                />
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-xl font-black text-white font-heading block drop-shadow-[0_2px_8px_rgba(244,114,182,0.6)]">
                {character.name || 'Cư Sĩ'}
              </span>
              <span className="text-xs text-pink-200/90 font-bold mt-0.5 inline-block px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40">
                {character.gender === 'male' ? 'Nam Cư Sĩ 👦' : 'Nữ Cư Sĩ 👧'} • {currentRobe.name}
              </span>
            </div>
          </div>

          {/* Cột phải: Form tùy chọn (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-4 max-h-[480px] overflow-y-auto pr-2">
            {/* 1. Chọn Giới Tính */}
            <div>
              <label className="text-xs font-heading font-black text-purple-950 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white inline-flex items-center justify-center text-[11px]">1</span> Giới Tính Nhân Vật:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleGenderChange('male')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-heading font-bold text-sm transition-all cursor-pointer ${
                    character.gender === 'male'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-[0_6px_20px_rgba(99,102,241,0.4)] scale-[1.02]'
                      : 'bg-white/80 text-purple-900 border-purple-200/80 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-lg">👦</span>
                  <span>Nam Cư Sĩ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderChange('female')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-heading font-bold text-sm transition-all cursor-pointer ${
                    character.gender === 'female'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-[0_6px_20px_rgba(244,114,182,0.5)] scale-[1.02]'
                      : 'bg-white/80 text-purple-900 border-purple-200/80 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-lg">👧</span>
                  <span>Nữ Cư Sĩ</span>
                </button>
              </div>
            </div>

            {/* 2. Pháp Danh / Tên */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-heading font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white inline-flex items-center justify-center text-[11px]">2</span> Pháp Danh / Tên Gọi:
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeName}
                  className="text-xs font-bold text-pink-600 hover:text-pink-800 flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded-lg bg-pink-100 hover:bg-pink-200"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Chọn Ngẫu Nhiên
                </button>
              </div>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                placeholder="Nhập pháp danh của bạn..."
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-purple-200 bg-white font-sans font-bold text-purple-950 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 text-sm shadow-inner transition-all"
              />
            </div>

            {/* 3. Màu Sắc Y Phục */}
            <div>
              <label className="text-xs font-heading font-black text-purple-950 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white inline-flex items-center justify-center text-[11px]">3</span> Màu Y Phục Anime:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROBE_COLORS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playWoodenFish();
                      setCharacter({ ...character, robeColor: r.id });
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      character.robeColor === r.id
                        ? 'bg-purple-100/90 border-purple-500 ring-2 ring-pink-400/50 shadow-md scale-[1.02]'
                        : 'bg-white/80 border-purple-100 hover:bg-purple-50'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0"
                      style={{ backgroundColor: r.hex }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-heading font-bold text-purple-950 truncate">{r.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Kiểu Tóc */}
            <div>
              <label className="text-xs font-heading font-black text-purple-950 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white inline-flex items-center justify-center text-[11px]">4</span> Kiểu Tóc & Diện Mạo:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {HAIR_STYLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playWoodenFish();
                      setCharacter({ ...character, hairStyle: h.id });
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      character.hairStyle === h.id
                        ? 'bg-pink-100/90 border-pink-500 font-black shadow-md scale-[1.02]'
                        : 'bg-white/80 border-purple-100 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-xl">{h.icon}</span>
                    <span className="text-[11px] font-heading font-bold text-purple-950">{h.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Pháp Bảo Tùy Thân */}
            <div>
              <label className="text-xs font-heading font-black text-purple-950 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white inline-flex items-center justify-center text-[11px]">5</span> Pháp Bảo Tùy Thân:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playWoodenFish();
                      setCharacter({ ...character, accessory: acc.id });
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      character.accessory === acc.id
                        ? 'bg-amber-100/90 border-amber-500 font-bold shadow-md ring-2 ring-amber-400/40 scale-[1.02]'
                        : 'bg-white/80 border-purple-100 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-xl shrink-0">{acc.icon}</span>
                    <div>
                      <div className="text-xs font-heading font-bold text-purple-950">{acc.name}</div>
                      <div className="text-[10px] text-purple-700 font-sans leading-tight mt-0.5">{acc.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Submit Button */}
        <div className="mt-6 pt-4 border-t border-purple-200/60 flex justify-end gap-3">
          {!isFirstTime && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border-2 border-purple-200 text-purple-800 hover:bg-purple-100 font-heading font-bold text-sm cursor-pointer transition-all"
            >
              Hủy Bỏ
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="zen-btn-gold px-8 py-3.5 rounded-2xl font-heading font-black text-base flex items-center gap-2.5 shadow-[0_6px_25px_rgba(244,114,182,0.5)] cursor-pointer"
          >
            <Check className="w-5 h-5" />
            <span>{isFirstTime ? 'Bắt Đầu Hành Trình Tu Tập' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
