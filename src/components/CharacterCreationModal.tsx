import React, { useState } from 'react';
import type { CharacterAppearance, GenderType, RobeColorType, HairStyleType, AccessoryType } from '../types/game';
import { Sparkles, Check, X, Shuffle } from 'lucide-react';
import { soundEngine } from '../services/audioEngine';

interface CharacterCreationModalProps {
  initialCharacter: CharacterAppearance;
  isFirstTime?: boolean;
  onSave: (char: CharacterAppearance) => void;
  onClose: () => void;
}

const NAME_SUGGESTIONS_MALE = ['Tuệ Minh', 'Tịnh An', 'Chân Thiện', 'Minh Triết', 'Tâm An', 'Bảo Quang'];
const NAME_SUGGESTIONS_FEMALE = ['Diệu Tâm', 'Ngọc Tâm', 'Tịnh Như', 'Diệu Âm', 'Liên Hoa', 'Thanh Tịnh'];

const ROBE_COLORS: { id: RobeColorType; name: string; hex: string; desc: string }[] = [
  { id: 'lam', name: 'Áo Lam Thanh Tịnh', hex: '#3b82f6', desc: 'Sắc lam dịu mát của người cư sĩ tại gia' },
  { id: 'nau', name: 'Nâu Sồng Đạm Bạc', hex: '#78350f', desc: 'Màu đất mộc mạc, nhẫn nại và khiêm cung' },
  { id: 'xam', name: 'Xám Khói Thiền Môn', hex: '#57534e', desc: 'Sắc xám tĩnh lặng như sương sớm đỉnh núi' },
  { id: 'bach', name: 'Bạch Y Thuần Khiết', hex: '#f8fafc', desc: 'Màu trắng thanh khiết, tâm không tì vết' },
];

const HAIR_STYLES: { id: HairStyleType; name: string; icon: string }[] = [
  { id: 'short', name: 'Tóc Ngắn Gọn Gàng', icon: '👦' },
  { id: 'bun', name: 'Tóc Búi Thiền Môn', icon: '👱' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="zen-paper-panel max-w-4xl w-full rounded-3xl p-5 sm:p-8 relative flex flex-col border border-amber-500/50 shadow-2xl my-auto">
        {!isFirstTime && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-500 hover:text-stone-800 p-2 rounded-full cursor-pointer z-10"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-serif font-bold uppercase tracking-wider mb-1.5 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5" /> {isFirstTime ? 'Khởi Duyên Tu Tập' : 'Tùy Biến Diện Mạo'}
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl text-stone-900 font-extrabold tracking-wide">
            {isFirstTime ? 'Tạo Nhân Vật Cư Sĩ' : 'Chỉnh Sửa Pháp Danh & Trang Phục'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-serif max-w-md mx-auto mt-1">
            Chọn giới tính, pháp danh và y phục thanh tịnh trước khi bước chân lên cổng Chùa Vân Ẩn.
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Cột trái: Live Avatar Preview (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 p-6 rounded-3xl border border-amber-500/30 shadow-inner">
            <div className="relative w-48 h-56 flex items-center justify-center">
              {/* Aura Halo */}
              <div className="absolute w-36 h-36 rounded-full bg-amber-500/20 blur-xl animate-pulse" />

              {/* Dynamic 2D SVG Character */}
              <svg viewBox="0 0 160 200" className="w-full h-full drop-shadow-2xl">
                {/* Shadow */}
                <ellipse cx="80" cy="180" rx="45" ry="12" fill="rgba(0,0,0,0.4)" />

                {/* Robe Body */}
                <path
                  d="M50,110 L110,110 L125,175 L35,175 Z"
                  fill={currentRobe.hex}
                  stroke="#292524"
                  strokeWidth="2"
                />
                {/* Sash / Dây đai */}
                <rect x="46" y="125" width="68" height="10" fill="#f59e0b" rx="2" />

                {/* Shoulders */}
                <path
                  d="M45,90 Q80,75 115,90 L110,115 L50,115 Z"
                  fill={currentRobe.hex}
                />

                {/* Head / Neck */}
                <rect x="73" y="65" width="14" height="20" fill="#fed7aa" rx="4" />
                <circle cx="80" cy="55" r="24" fill="#fed7aa" />

                {/* Face details */}
                {/* Eyes - Serene smile */}
                <path d="M70,52 Q74,48 78,52" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
                <path d="M82,52 Q86,48 90,52" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
                {/* Gentle mouth smile */}
                <path d="M76,64 Q80,68 84,64" fill="none" stroke="#9a3412" strokeWidth="1.5" strokeLinecap="round" />

                {/* Hair styles */}
                {character.hairStyle === 'short' && (
                  <path
                    d="M56,50 Q80,25 104,50 Q98,35 80,32 Q62,35 56,50 Z"
                    fill="#1c1917"
                  />
                )}
                {character.hairStyle === 'bun' && (
                  <g>
                    <path
                      d="M56,52 Q80,28 104,52 Q98,36 80,34 Q62,36 56,52 Z"
                      fill="#1c1917"
                    />
                    {/* Búi tóc trên đỉnh đầu */}
                    <circle cx="80" cy="26" r="10" fill="#1c1917" />
                    <rect x="74" y="24" width="12" height="3" fill="#f59e0b" rx="1" />
                  </g>
                )}
                {character.hairStyle === 'shaved' && (
                  <circle cx="80" cy="40" r="2.5" fill="#d97706" />
                )}

                {/* Accessories */}
                {character.accessory === 'beads' && (
                  <g>
                    {/* Chuỗi hạt vòng qua cổ */}
                    <ellipse cx="80" cy="98" rx="22" ry="18" fill="none" stroke="#b45309" strokeWidth="3" strokeDasharray="3 3" />
                    <circle cx="80" cy="116" r="4" fill="#f59e0b" />
                  </g>
                )}
                {character.accessory === 'bag' && (
                  <path d="M96,115 L120,135 L115,155 L90,135 Z" fill="#1e3a8a" opacity="0.9" />
                )}
                {character.accessory === 'hat' && (
                  <path d="M40,38 L80,10 L120,38 Z" fill="#fde047" stroke="#b45309" strokeWidth="1.5" opacity="0.9" />
                )}
              </svg>
            </div>

            <div className="mt-4 text-center">
              <span className="text-lg font-bold text-amber-200 font-heading block">
                {character.name || 'Cư Sĩ'}
              </span>
              <span className="text-xs text-stone-400 font-serif">
                {character.gender === 'male' ? 'Nam Cư Sĩ' : 'Nữ Cư Sĩ'} • {currentRobe.name}
              </span>
            </div>
          </div>

          {/* Cột phải: Form tùy chọn (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-4 max-h-[460px] overflow-y-auto pr-1">
            {/* 1. Chọn Giới Tính */}
            <div>
              <label className="text-xs font-serif font-bold text-amber-900 uppercase tracking-wider block mb-1.5">
                1. Giới Tính:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleGenderChange('male')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-serif text-sm transition cursor-pointer ${
                    character.gender === 'male'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md font-bold'
                      : 'bg-white/80 text-stone-700 border-amber-900/15 hover:bg-amber-50'
                  }`}
                >
                  <span>👦</span>
                  <span>Nam Cư Sĩ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderChange('female')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-serif text-sm transition cursor-pointer ${
                    character.gender === 'female'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md font-bold'
                      : 'bg-white/80 text-stone-700 border-amber-900/15 hover:bg-amber-50'
                  }`}
                >
                  <span>👧</span>
                  <span>Nữ Cư Sĩ</span>
                </button>
              </div>
            </div>

            {/* 2. Pháp Danh / Tên */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-serif font-bold text-amber-900 uppercase tracking-wider">
                  2. Pháp Danh / Tên Gọi:
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeName}
                  className="text-xs text-amber-800 hover:text-amber-950 font-serif flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Chọn Ngẫu Nhiên
                </button>
              </div>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                placeholder="Nhập pháp danh của bạn..."
                className="w-full px-4 py-2.5 rounded-xl border border-amber-900/20 bg-white font-serif text-stone-900 focus:outline-none focus:border-amber-500 text-sm shadow-sm"
              />
            </div>

            {/* 3. Màu Sắc Pháp Phục */}
            <div>
              <label className="text-xs font-serif font-bold text-amber-900 uppercase tracking-wider block mb-1.5">
                3. Màu Y Phục Cư Sĩ:
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
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      character.robeColor === r.id
                        ? 'bg-amber-100/90 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-white/70 border-stone-200 hover:bg-amber-50/60'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-stone-400 shrink-0"
                      style={{ backgroundColor: r.hex }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-serif font-bold text-stone-900 truncate">{r.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Kiểu Tóc & Diện Mạo */}
            <div>
              <label className="text-xs font-serif font-bold text-amber-900 uppercase tracking-wider block mb-1.5">
                4. Kiểu Tóc & Diện Mạo:
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
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                      character.hairStyle === h.id
                        ? 'bg-amber-100/90 border-amber-500 font-bold'
                        : 'bg-white/70 border-stone-200 hover:bg-amber-50/60'
                    }`}
                  >
                    <span className="text-xl">{h.icon}</span>
                    <span className="text-[11px] font-serif text-stone-800">{h.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Pháp Bảo Tùy Thân (Accessory) */}
            <div>
              <label className="text-xs font-serif font-bold text-amber-900 uppercase tracking-wider block mb-1.5">
                5. Pháp Bảo Tùy Thân:
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
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition cursor-pointer ${
                      character.accessory === acc.id
                        ? 'bg-amber-100/90 border-amber-500 font-bold ring-2 ring-amber-500/20'
                        : 'bg-white/70 border-stone-200 hover:bg-amber-50/60'
                    }`}
                  >
                    <span className="text-xl shrink-0">{acc.icon}</span>
                    <div>
                      <div className="text-xs font-serif text-stone-900">{acc.name}</div>
                      <div className="text-[10px] text-stone-500 font-serif leading-tight">{acc.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Submit Button */}
        <div className="mt-6 pt-4 border-t border-amber-900/15 flex justify-end gap-3">
          {!isFirstTime && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-serif text-sm cursor-pointer"
            >
              Hủy Bỏ
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="zen-btn-gold px-8 py-3 rounded-xl font-serif font-bold text-base flex items-center gap-2 shadow-xl cursor-pointer"
          >
            <Check className="w-5 h-5" />
            <span>{isFirstTime ? 'Bắt Đầu Hành Trình Tu Tập' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
