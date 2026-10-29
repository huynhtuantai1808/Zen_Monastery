import React from 'react';
import type { CharacterAppearance, RobeColorType } from '../types/game';

interface ZenCharacterSpriteProps {
  character: CharacterAppearance;
  pose?: 'idle' | 'sweeping' | 'sitting-tea' | 'meditating';
  isSweepingAnim?: boolean;
  isBreathingAnim?: boolean;
  scale?: number;
  className?: string;
  showNameTag?: boolean;
  subtitle?: string;
  onClick?: () => void;
}

const ROBE_PALETTES: Record<RobeColorType, { main: string; shade: string; sash: string; trim: string; name: string }> = {
  lam: {
    main: '#2563eb',    // Xanh lam thuần khiết
    shade: '#1d4ed8',
    sash: '#f59e0b',    // Đai vàng nghệ
    trim: '#93c5fd',
    name: 'Áo Lam',
  },
  nau: {
    main: '#78350f',    // Nâu sồng đạm bạc
    shade: '#5b2609',
    sash: '#d97706',
    trim: '#b45309',
    name: 'Nâu Sồng',
  },
  xam: {
    main: '#57534e',    // Xám khói thiền môn
    shade: '#44403c',
    sash: '#a8a29e',
    trim: '#78716c',
    name: 'Xám Khói',
  },
  bach: {
    main: '#f8fafc',    // Bạch y thanh khiết
    shade: '#e2e8f0',
    sash: '#f59e0b',
    trim: '#cbd5e1',
    name: 'Bạch Y',
  },
};

export const ZenCharacterSprite: React.FC<ZenCharacterSpriteProps> = ({
  character,
  pose = 'idle',
  isSweepingAnim = false,
  isBreathingAnim = false,
  scale = 1,
  className = '',
  showNameTag = true,
  subtitle,
  onClick,
}) => {
  const robe = ROBE_PALETTES[character.robeColor] || ROBE_PALETTES.lam;
  const isFemale = character.gender === 'female';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${className} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Name and Title Tag */}
      {showNameTag && (
        <div className="mb-1 flex flex-col items-center pointer-events-none">
          <div className="px-3 py-0.5 rounded-full bg-stone-950/85 border border-amber-400/50 text-amber-200 text-xs font-serif font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap backdrop-blur-sm">
            <span>{isFemale ? '🧕' : '🧘'}</span>
            <span>{character.name || 'Cư Sĩ'}</span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-amber-300/80 font-serif font-medium mt-0.5 bg-black/60 px-2 py-0.2 rounded-full border border-stone-800">
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Main SVG Character Graphic */}
      <div className={`relative ${isBreathingAnim ? 'animate-pulse' : ''}`}>
        {/* Soft Golden Aura Halo for Meditation */}
        {pose === 'meditating' && (
          <div className="absolute inset-0 -m-6 rounded-full bg-amber-400/20 blur-xl animate-pulse pointer-events-none" />
        )}

        {/* 1. POSE: MEDITATING (NGỒI KIẾT GIÀ TRÊN BỒ ĐOÀN) */}
        {pose === 'meditating' && (
          <svg viewBox="0 0 160 160" className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-2xl overflow-visible">
            <defs>
              <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="cushionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
            </defs>

            {/* Hào quang thiền định tròn sau đầu */}
            <circle cx="80" cy="52" r="38" fill="url(#auraGlow)" />
            <circle cx="80" cy="52" r="32" fill="none" stroke="#fde047" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />

            {/* Bồ Đoàn (Meditation Cushion) */}
            <ellipse cx="80" cy="140" rx="60" ry="16" fill="url(#cushionGrad)" stroke="#b45309" strokeWidth="2" />
            <ellipse cx="80" cy="136" rx="52" ry="12" fill="#78350f" opacity="0.5" />

            {/* Hai chân xếp bằng kiết già (Folded Legs in Robe) */}
            <ellipse cx="80" cy="126" rx="55" ry="18" fill={robe.main} stroke={robe.shade} strokeWidth="2" />
            {/* Vạt áo phủ quanh chân */}
            <path
              d="M32,125 Q80,142 128,125 Q115,110 80,112 Q45,110 32,125 Z"
              fill={robe.shade}
              opacity="0.85"
            />

            {/* Thân áo tràng ngồi thẳng (Torso) */}
            <path
              d="M54,82 Q80,78 106,82 L116,122 Q80,126 44,122 Z"
              fill={robe.main}
              stroke={robe.shade}
              strokeWidth="2"
            />

            {/* Dải đai buộc eo */}
            <rect x="52" y="98" width="56" height="8" fill={robe.sash} rx="2" stroke="#b45309" strokeWidth="1" />

            {/* Hai tay bắt ấn Thiền Định (Dhyana Mudra) trên đùi */}
            <ellipse cx="80" cy="110" rx="16" ry="8" fill="#fed7aa" stroke="#c2410c" strokeWidth="1" />
            <path d="M72,110 Q80,114 88,110" stroke="#9a3412" strokeWidth="1.5" fill="none" />

            {/* Chuỗi hạt bồ đề niệm phật */}
            {character.accessory === 'beads' && (
              <g>
                <ellipse cx="80" cy="112" rx="20" ry="7" fill="none" stroke="#78350f" strokeWidth="3" strokeDasharray="2.5 2.5" />
                <circle cx="80" cy="119" r="3.5" fill="#f59e0b" />
              </g>
            )}

            {/* Cổ áo vắt chéo */}
            <path d="M66,80 L80,96 L94,80" fill="none" stroke={robe.trim} strokeWidth="2.5" />

            {/* Cổ & Khuôn mặt an nhiên */}
            <rect x="74" y="60" width="12" height="15" fill="#fed7aa" rx="3" />
            <circle cx="80" cy="52" r="22" fill="#fed7aa" stroke="#fb923c" strokeWidth="1" />

            {/* Đôi mắt khép hờ tĩnh lặng (Meditative Eyes) */}
            <path d="M71,50 Q75,47 78,50" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
            <path d="M82,50 Q85,47 89,50" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
            {/* Lông mày thanh thoát */}
            <path d="M70,45 Q75,43 78,46" fill="none" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M82,46 Q85,43 90,45" fill="none" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
            {/* Miệng mỉm cười nhẹ */}
            <path d="M77,61 Q80,64 83,61" fill="none" stroke="#9a3412" strokeWidth="1.5" strokeLinecap="round" />

            {/* Kiểu Tóc */}
            {character.hairStyle === 'short' && (
              <path
                d="M58,48 Q80,25 102,48 Q96,34 80,31 Q64,34 58,48 Z"
                fill="#1c1917"
              />
            )}
            {character.hairStyle === 'bun' && (
              <g>
                <path
                  d="M58,50 Q80,26 102,50 Q96,35 80,33 Q64,35 58,50 Z"
                  fill="#1c1917"
                />
                <circle cx="80" cy="25" r="9" fill="#1c1917" />
                <rect x="74" y="24" width="12" height="3" fill="#f59e0b" rx="1" />
              </g>
            )}
            {character.hairStyle === 'shaved' && (
              <g>
                {/* 3 chấm giới hương trên đỉnh đầu */}
                <circle cx="76" cy="38" r="1.5" fill="#d97706" />
                <circle cx="80" cy="36" r="1.5" fill="#d97706" />
                <circle cx="84" cy="38" r="1.5" fill="#d97706" />
              </g>
            )}

            {/* Nón lá đặt bên cạnh */}
            {character.accessory === 'hat' && (
              <path d="M110,140 L135,115 L155,140 Z" fill="#fde047" stroke="#b45309" strokeWidth="1.5" opacity="0.9" />
            )}
          </svg>
        )}

        {/* 2. POSE: SITTING TEA (NGỒI UỐNG TRÀ BÊN HIÊN) */}
        {pose === 'sitting-tea' && (
          <svg viewBox="0 0 170 170" className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="teaTableGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
            </defs>

            {/* Chiếu trúc ngồi */}
            <ellipse cx="85" cy="148" rx="65" ry="14" fill="#ca8a04" opacity="0.4" stroke="#a16207" strokeWidth="1" />

            {/* Chân xếp bằng */}
            <ellipse cx="70" cy="138" rx="42" ry="14" fill={robe.main} stroke={robe.shade} strokeWidth="2" />

            {/* Thân áo tràng */}
            <path
              d="M48,85 Q70,82 92,85 L100,135 Q70,138 40,135 Z"
              fill={robe.main}
              stroke={robe.shade}
              strokeWidth="2"
            />
            <rect x="46" y="105" width="48" height="8" fill={robe.sash} rx="2" />

            {/* Bàn trà gỗ bên cạnh */}
            <rect x="110" y="115" width="45" height="30" fill="url(#teaTableGrad)" rx="3" stroke="#92400e" strokeWidth="1.5" />
            <rect x="105" y="112" width="55" height="6" fill="#92400e" rx="2" />

            {/* Chén trà sứ và khói thơm nghi ngút */}
            <ellipse cx="128" cy="110" rx="7" ry="4" fill="#047857" stroke="#065f46" strokeWidth="1" />
            <path
              d="M126,104 Q128,96 125,90 T130,80"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-pulse"
              opacity="0.8"
            />

            {/* Tay nâng chén trà */}
            <path d="M78,102 Q95,108 108,108" stroke={robe.shade} strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="110" cy="108" r="5" fill="#fed7aa" />

            {/* Cổ & Đầu */}
            <rect x="65" y="65" width="10" height="15" fill="#fed7aa" rx="2" />
            <circle cx="70" cy="55" r="20" fill="#fed7aa" stroke="#fb923c" strokeWidth="1" />

            {/* Mắt mỉm cười thảnh thơi */}
            <path d="M63,53 Q66,50 69,53" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
            <path d="M73,53 Q76,50 79,53" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
            <path d="M68,63 Q71,66 74,63" fill="none" stroke="#9a3412" strokeWidth="1.5" strokeLinecap="round" />

            {/* Kiểu tóc */}
            {character.hairStyle === 'short' && (
              <path d="M50,51 Q70,29 90,51 Q85,38 70,35 Q55,38 50,51 Z" fill="#1c1917" />
            )}
            {character.hairStyle === 'bun' && (
              <g>
                <path d="M50,53 Q70,30 90,53 Q85,39 70,37 Q55,39 50,53 Z" fill="#1c1917" />
                <circle cx="70" cy="28" r="8" fill="#1c1917" />
                <rect x="65" y="27" width="10" height="3" fill="#f59e0b" rx="1" />
              </g>
            )}
            {character.hairStyle === 'shaved' && (
              <circle cx="70" cy="40" r="1.5" fill="#d97706" />
            )}

            {/* Phụ kiện túi vải bên hông */}
            {character.accessory === 'bag' && (
              <path d="M42,108 L60,122 L55,138 L36,124 Z" fill="#1e3a8a" stroke="#1e40af" strokeWidth="1" />
            )}
          </svg>
        )}

        {/* 3. POSE: SWEEPING (ĐỨNG QUÉT LÁ ĐA) & IDLE */}
        {(pose === 'sweeping' || pose === 'idle') && (
          <div className="relative">
            <svg
              viewBox="0 0 160 210"
              className={`w-40 h-52 sm:w-48 sm:h-64 drop-shadow-2xl overflow-visible transition-transform duration-300 ${
                isSweepingAnim ? '-rotate-3 translate-x-1' : 'rotate-0'
              }`}
            >
              {/* Bóng nhân vật trên nền đất */}
              <ellipse cx="80" cy="195" rx="42" ry="10" fill="rgba(0,0,0,0.35)" />

              {/* Tà Áo Tràng Dài Đến Chân */}
              <path
                d="M50,105 L110,105 L125,188 L35,188 Z"
                fill={robe.main}
                stroke={robe.shade}
                strokeWidth="2.5"
              />

              {/* Nếp gấp tà áo */}
              <path d="M80,115 L80,188" stroke={robe.shade} strokeWidth="2" strokeDasharray="6 3" opacity="0.6" />
              <path d="M60,125 L55,188" stroke={robe.shade} strokeWidth="1.5" opacity="0.5" />
              <path d="M100,125 L105,188" stroke={robe.shade} strokeWidth="1.5" opacity="0.5" />

              {/* Dây Đai Lưng */}
              <rect x="46" y="118" width="68" height="10" fill={robe.sash} rx="2" stroke="#b45309" strokeWidth="1" />

              {/* Thân trên & Vai */}
              <path
                d="M44,82 Q80,68 116,82 L110,110 L50,110 Z"
                fill={robe.main}
                stroke={robe.shade}
                strokeWidth="2"
              />

              {/* Cổ áo vắt chéo thanh lịch */}
              <path d="M64,80 L80,104 L96,80" fill="none" stroke={robe.trim} strokeWidth="3" />

              {/* Tay áo & Cây chổi tre quét lá */}
              {pose === 'sweeping' ? (
                <g className={isSweepingAnim ? 'animate-bounce' : ''}>
                  {/* Cán chổi tre chéo từ tay xuống đất */}
                  <line
                    x1="95"
                    y1="102"
                    x2="135"
                    y2="195"
                    stroke="#b45309"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Bó chổi đót / chổi rơm hình quạt */}
                  <path
                    d="M135,195 L120,180 Q138,172 155,182 L145,198 Z"
                    fill="#eab308"
                    stroke="#ca8a04"
                    strokeWidth="1.5"
                  />
                  {/* Sợi chổi rơm quét */}
                  <line x1="126" y1="184" x2="140" y2="198" stroke="#713f12" strokeWidth="1" />
                  <line x1="135" y1="180" x2="146" y2="196" stroke="#713f12" strokeWidth="1" />

                  {/* Hai cánh tay nắm cán chổi */}
                  <path d="M52,90 Q75,108 95,104" stroke={robe.shade} strokeWidth="8" strokeLinecap="round" fill="none" />
                  <circle cx="95" cy="104" r="5" fill="#fed7aa" />
                  <circle cx="85" cy="112" r="4.5" fill="#fed7aa" />
                </g>
              ) : (
                /* Pose Idle: Hai tay chắp trước ngực thanh tịnh (Anjali Mudra) */
                <g>
                  <path d="M50,92 Q68,110 77,105" stroke={robe.shade} strokeWidth="7" strokeLinecap="round" fill="none" />
                  <path d="M110,92 Q92,110 83,105" stroke={robe.shade} strokeWidth="7" strokeLinecap="round" fill="none" />
                  <polygon points="76,100 84,100 80,88" fill="#fed7aa" stroke="#c2410c" strokeWidth="1" />
                </g>
              )}

              {/* Cổ & Đầu */}
              <rect x="73" y="60" width="14" height="20" fill="#fed7aa" rx="4" />
              <circle cx="80" cy="50" r="24" fill="#fed7aa" stroke="#fb923c" strokeWidth="1" />

              {/* Ngũ Quan: Mắt cười an lạc & Miệng mỉm cười */}
              <path d="M70,47 Q74,43 78,47" fill="none" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M82,47 Q86,43 90,47" fill="none" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M76,59 Q80,63 84,59" fill="none" stroke="#9a3412" strokeWidth="1.8" strokeLinecap="round" />

              {/* Mái Tóc */}
              {character.hairStyle === 'short' && (
                <path
                  d="M56,45 Q80,18 104,45 Q98,28 80,26 Q62,28 56,45 Z"
                  fill="#1c1917"
                />
              )}
              {character.hairStyle === 'bun' && (
                <g>
                  <path
                    d="M56,47 Q80,20 104,47 Q98,30 80,28 Q62,30 56,47 Z"
                    fill="#1c1917"
                  />
                  <circle cx="80" cy="18" r="10" fill="#1c1917" />
                  <rect x="74" y="16" width="12" height="3" fill="#f59e0b" rx="1" />
                </g>
              )}
              {character.hairStyle === 'shaved' && (
                <g>
                  <circle cx="76" cy="34" r="1.5" fill="#d97706" />
                  <circle cx="80" cy="32" r="1.5" fill="#d97706" />
                  <circle cx="84" cy="34" r="1.5" fill="#d97706" />
                </g>
              )}

              {/* Phụ kiện trang sức */}
              {character.accessory === 'beads' && (
                <g>
                  <ellipse cx="80" cy="94" rx="22" ry="16" fill="none" stroke="#78350f" strokeWidth="3" strokeDasharray="3 3" />
                  <circle cx="80" cy="110" r="4" fill="#f59e0b" />
                </g>
              )}
              {character.accessory === 'bag' && (
                <path d="M96,110 L122,130 L116,152 L90,132 Z" fill="#1e3a8a" stroke="#1e40af" strokeWidth="1" opacity="0.95" />
              )}
              {character.accessory === 'hat' && (
                <path d="M38,36 L80,6 L122,36 Z" fill="#fde047" stroke="#b45309" strokeWidth="2" opacity="0.95" />
              )}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
