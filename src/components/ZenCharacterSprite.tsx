import React from 'react';
import type { CharacterAppearance, RobeColorType } from '../types/game';

export type CharacterPose =
  | 'idle'
  | 'sweeping'
  | 'sitting-tea'
  | 'meditating'
  | 'chopping'
  | 'carrying'
  | 'cleaning'
  | 'charity'
  | 'calligraphy';

interface ZenCharacterSpriteProps {
  character: CharacterAppearance;
  pose?: CharacterPose;
  isSweepingAnim?: boolean;
  isBreathingAnim?: boolean;
  scale?: number;
  className?: string;
  showNameTag?: boolean;
  subtitle?: string;
  onClick?: () => void;
}

const ROBE_PALETTES: Record<
  RobeColorType,
  { main: string; shade: string; sash: string; trim: string; light: string; name: string }
> = {
  lam: {
    main: '#3b82f6', // Xanh lam dịu mát
    shade: '#1d4ed8',
    sash: '#fbbf24', // Đai vàng hoa cúc
    trim: '#93c5fd',
    light: '#dbeafe',
    name: 'Áo Lam',
  },
  nau: {
    main: '#92400e', // Nâu sồng đạm bạc
    shade: '#713f12',
    sash: '#d97706',
    trim: '#b45309',
    light: '#fef3c7',
    name: 'Nâu Sồng',
  },
  xam: {
    main: '#64748b', // Xám khói thiền môn
    shade: '#475569',
    sash: '#cbd5e1',
    trim: '#94a3b8',
    light: '#f1f5f9',
    name: 'Xám Khói',
  },
  bach: {
    main: '#f8fafc', // Bạch y thanh khiết
    shade: '#cbd5e1',
    sash: '#fbbf24',
    trim: '#e2e8f0',
    light: '#ffffff',
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
  const hairColor = '#1e1b18';

  // Component ngũ quan khuôn mặt Chibi siêu dễ thương
  const renderChibiFace = (eyeType: 'open' | 'closed' | 'wink' | 'happy' = 'happy') => (
    <g id="chibi-face">
      {/* Má hồng ửng đào phúng phính (Blush) */}
      <circle cx={isFemale ? 65 : 66} cy="58" r="7" fill="#fb7185" opacity="0.45" />
      <circle cx={isFemale ? 95 : 94} cy="58" r="7" fill="#fb7185" opacity="0.45" />
      {/* Vạch phấn má cute */}
      <line x1="62" y1="57" x2="68" y2="59" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="92" y1="57" x2="98" y2="59" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      {/* Đôi Mắt Chibi */}
      {eyeType === 'open' ? (
        <g id="eyes-open">
          {/* Mắt Trái */}
          <ellipse cx="68" cy="51" rx="6.5" ry="8.5" fill="#1e1b18" />
          <ellipse cx="68" cy="53" rx="5.5" ry="5.5" fill="#3b2d24" />
          <circle cx="66" cy="48" r="2.8" fill="#ffffff" />
          <circle cx="70" cy="54" r="1.3" fill="#ffffff" />
          {/* Mi mắt trên cong nữ tính hoặc tinh anh */}
          <path d={isFemale ? "M60,49 Q68,43 75,48" : "M61,49 Q68,44 75,49"} fill="none" stroke="#0f0e0c" strokeWidth={isFemale ? "2.6" : "2.2"} strokeLinecap="round" />
          {isFemale && <path d="M74,47 L77,45" stroke="#0f0e0c" strokeWidth="2" strokeLinecap="round" />}

          {/* Mắt Phải */}
          <ellipse cx="92" cy="51" rx="6.5" ry="8.5" fill="#1e1b18" />
          <ellipse cx="92" cy="53" rx="5.5" ry="5.5" fill="#3b2d24" />
          <circle cx="90" cy="48" r="2.8" fill="#ffffff" />
          <circle cx="94" cy="54" r="1.3" fill="#ffffff" />
          <path d={isFemale ? "M85,48 Q92,43 100,49" : "M85,49 Q92,44 99,49"} fill="none" stroke="#0f0e0c" strokeWidth={isFemale ? "2.6" : "2.2"} strokeLinecap="round" />
          {isFemale && <path d="M99,47 L102,45" stroke="#0f0e0c" strokeWidth="2" strokeLinecap="round" />}
        </g>
      ) : eyeType === 'closed' ? (
        /* Mắt khép hờ tĩnh lặng thiền định */
        <g id="eyes-meditating">
          <path d="M62,51 Q68,48 74,52" fill="none" stroke="#261c14" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M86,52 Q92,48 98,51" fill="none" stroke="#261c14" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : (
        /* Mắt cười tít hình trăng khuyết cực kỳ an lạc */
        <g id="eyes-happy">
          <path d="M61,53 Q68,44 75,53" fill="none" stroke="#1e1b18" strokeWidth={isFemale ? "2.8" : "2.4"} strokeLinecap="round" />
          <path d="M85,53 Q92,44 99,53" fill="none" stroke="#1e1b18" strokeWidth={isFemale ? "2.8" : "2.4"} strokeLinecap="round" />
          {isFemale && (
            <>
              <path d="M75,51 L78,48" stroke="#1e1b18" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M99,51 L102,48" stroke="#1e1b18" strokeWidth="1.8" strokeLinecap="round" />
            </>
          )}
        </g>
      )}

      {/* Lông mày Chibi thanh tú */}
      <path d="M62,43 Q68,40 73,43" fill="none" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M87,43 Q92,40 98,43" fill="none" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

      {/* Miệng cười xinh xắn */}
      <path d="M76,62 Q80,67 84,62" fill="#e11d48" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );

  // Mái tóc Chibi siêu cưng cho cả Nam và Nữ
  const renderChibiHair = () => {
    if (character.hairStyle === 'shaved') {
      return (
        <g id="chibi-hair-shaved">
          {/* Đầu tròn Chú tiểu thanh tịnh */}
          {/* 3 chấm giới hương vàng nghệ trên trán */}
          <circle cx="75" cy="35" r="1.8" fill="#f59e0b" stroke="#d97706" strokeWidth="0.5" />
          <circle cx="80" cy="32" r="1.8" fill="#f59e0b" stroke="#d97706" strokeWidth="0.5" />
          <circle cx="85" cy="35" r="1.8" fill="#f59e0b" stroke="#d97706" strokeWidth="0.5" />
        </g>
      );
    }

    if (character.hairStyle === 'bun') {
      return (
        <g id="chibi-hair-bun">
          {/* Búi tóc tròn Chibi trên đỉnh đầu */}
          <circle cx="80" cy="18" r="13" fill={hairColor} />
          {/* Trâm cài hoa sen / dây lụa vàng buộc tóc */}
          <rect x="71" y="24" width="18" height="4" fill="#fbbf24" rx="2" stroke="#d97706" strokeWidth="0.8" />
          {isFemale && (
            <g transform="translate(86, 12) scale(0.65)">
              <circle cx="0" cy="0" r="6" fill="#f472b6" />
              <circle cx="0" cy="0" r="3" fill="#fde047" />
            </g>
          )}

          {/* Khối tóc bồng bềnh ôm đầu */}
          <path
            d="M52,48 C50,26 62,21 80,21 C98,21 110,26 108,48 C102,30 92,27 80,27 C68,27 58,30 52,48 Z"
            fill={hairColor}
          />
          {/* Tóc mái Chibi cưng xỉu */}
          <path d="M54,42 Q68,48 76,38 Q84,48 98,39 Q104,44 106,48 Q80,28 54,42 Z" fill={hairColor} />

          {/* Lọn tóc mai nữ mềm mại buông hai bên má */}
          {isFemale && (
            <>
              <path d="M53,46 Q50,60 55,67 Q53,60 56,48 Z" fill={hairColor} />
              <path d="M107,46 Q110,60 105,67 Q107,60 104,48 Z" fill={hairColor} />
            </>
          )}
        </g>
      );
    }

    // Default: 'short' - Mái tóc Anime lãng tử bồng bềnh
    return (
      <g id="chibi-hair-short">
        <path
          d="M51,48 C48,25 62,20 80,20 C98,20 112,25 109,48 C103,28 93,25 80,25 C67,25 57,28 51,48 Z"
          fill={hairColor}
        />
        {/* Tóc tỉa mái tầng Anime so le */}
        <path
          d="M52,44 Q62,49 70,39 Q77,50 85,38 Q93,49 104,41 Q108,45 108,48 Q80,26 52,44 Z"
          fill={hairColor}
        />
        {/* Lọn tóc mai bồng bềnh */}
        <path d="M52,44 Q50,56 55,63 Q52,55 55,46 Z" fill={hairColor} />
        <path d="M108,44 Q110,56 105,63 Q108,55 105,46 Z" fill={hairColor} />
        {/* Lọn tóc vểnh tinh nghịch trên đỉnh đầu */}
        <path d="M78,20 Q80,11 86,15 Q82,16 80,21 Z" fill={hairColor} />
      </g>
    );
  };

  // Phụ kiện Chibi
  const renderAccessory = () => (
    <g id="chibi-accessory">
      {/* Chuỗi hạt bồ đề Chibi */}
      {character.accessory === 'beads' && (
        <g>
          <ellipse cx="80" cy="85" rx="16" ry="12" fill="none" stroke="#78350f" strokeWidth="3" strokeDasharray="2.5 2" />
          <circle cx="80" cy="97" r="3.5" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />
          {/* Tua rua đỏ nhỏ */}
          <line x1="80" y1="100" x2="80" y2="105" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}

      {/* Túi vải thiền đeo chéo mini */}
      {character.accessory === 'bag' && (
        <g>
          {/* Dây đeo chéo qua vai */}
          <line x1="60" y1="78" x2="98" y2="108" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Túi vải thêu hoa sen */}
          <rect x="90" y="102" width="18" height="15" rx="4" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
          <circle cx="99" cy="109" r="2.5" fill="#fde047" />
        </g>
      )}

      {/* Nón lá mini xinh xắn */}
      {character.accessory === 'hat' && (
        <g transform="translate(80, 24) rotate(12) translate(-80, -24)">
          <path d="M48,26 L80,3 L112,26 Z" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
          <line x1="80" y1="3" x2="60" y2="26" stroke="#ca8a04" strokeWidth="0.8" opacity="0.6" />
          <line x1="80" y1="3" x2="100" y2="26" stroke="#ca8a04" strokeWidth="0.8" opacity="0.6" />
          {/* Quai nón lụa hồng / lam */}
          <path d="M54,26 Q80,38 106,26" fill="none" stroke={isFemale ? "#ec4899" : "#3b82f6"} strokeWidth="1.2" />
        </g>
      )}
    </g>
  );

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${className} ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all' : ''
        }`}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Name and Title Tag */}
      {showNameTag && (
        <div className="mb-1 flex flex-col items-center pointer-events-none">
          <div className="px-3 py-0.8 rounded-full bg-stone-950/85 border-2 border-amber-400/60 text-amber-200 text-xs font-serif font-black shadow-lg flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
            <span>{isFemale ? '🌸' : '🪷'}</span>
            <span>{character.name || (isFemale ? 'Diệu Tâm' : 'Tuệ Minh')}</span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-amber-300 font-serif font-bold mt-0.5 bg-black/75 px-2.5 py-0.5 rounded-full border border-amber-500/30 shadow">
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Main Chibi Character Graphic */}
      <div className={`relative ${isBreathingAnim ? 'animate-pulse' : ''}`}>

        {/* =========================================================
            POSE 1: MEDITATING (TỌA THIỀN KIẾT GIÀ TRÊN BỒ ĐOÀN SEN)
            ========================================================= */}
        {pose === 'meditating' && (
          <svg viewBox="0 0 160 160" className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-2xl overflow-visible">
            <defs>
              <radialGradient id="chibiAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Hào quang thiền tròn lấp lánh */}
            <circle cx="80" cy="52" r="42" fill="url(#chibiAura)" className="animate-pulse" />
            <circle cx="80" cy="52" r="36" fill="none" stroke="#fde047" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />

            {/* Bồ Đoàn tròn mộc mạc */}
            <ellipse cx="80" cy="138" rx="54" ry="16" fill="#78350f" stroke="#b45309" strokeWidth="2" />
            <ellipse cx="80" cy="134" rx="46" ry="12" fill="#92400e" opacity="0.8" />

            {/* Chân xếp bằng kiết già chibi bo tròn */}
            <ellipse cx="80" cy="122" rx="45" ry="15" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
            <path d="M42,122 Q80,136 118,122 Q105,110 80,112 Q55,110 42,122 Z" fill={robe.shade} opacity="0.85" />

            {/* Thân áo Chibi tròn trĩnh */}
            <path
              d="M56,76 Q80,72 104,76 L112,118 Q80,122 48,118 Z"
              fill={robe.main}
              stroke={robe.shade}
              strokeWidth="2.5"
            />
            {/* Đai lưng vải buộc nơ */}
            <rect x="52" y="94" width="56" height="8" rx="2" fill={robe.sash} stroke="#b45309" strokeWidth="1" />
            <circle cx="80" cy="98" r="3.5" fill="#b45309" />

            {/* Cổ áo vắt chéo thanh lịch */}
            <path d="M68,75 L80,90 L92,75" fill="none" stroke={robe.trim} strokeWidth="2.5" />

            {/* Hai bàn tay Chibi bắt ấn thiền định trên đùi */}
            <ellipse cx="80" cy="106" rx="14" ry="7" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.2" />

            {/* Cổ áo & Đầu Chibi to tròn (Đầu Chibi đường kính r = 27) */}
            <rect x="74" y="60" width="12" height="14" fill="#fed7aa" rx="4" />
            <circle cx="80" cy="50" r="28" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />

            {/* Mái tóc */}
            {renderChibiHair()}

            {/* Ngũ quan an lạc */}
            {renderChibiFace('closed')}

            {/* Phụ kiện */}
            {renderAccessory()}
          </svg>
        )}

        {/* =========================================================
            POSE 2: SITTING TEA (NGỒI HIÊN TRÀ ĐỐI ẨM)
            ========================================================= */}
        {pose === 'sitting-tea' && (
          <svg viewBox="0 0 170 170" className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-2xl overflow-visible">
            {/* Chiếu trúc ngồi */}
            <ellipse cx="85" cy="146" rx="66" ry="15" fill="#ca8a04" opacity="0.35" stroke="#a16207" strokeWidth="1.5" />

            {/* Chân xếp bằng Chibi */}
            <ellipse cx="70" cy="135" rx="38" ry="14" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />

            {/* Thân áo Chibi */}
            <path
              d="M50,78 Q70,75 90,78 L98,130 Q70,134 42,130 Z"
              fill={robe.main}
              stroke={robe.shade}
              strokeWidth="2.5"
            />
            <rect x="48" y="98" width="44" height="8" rx="2" fill={robe.sash} />

            {/* Bàn trà gỗ bên cạnh */}
            <rect x="108" y="112" width="46" height="30" fill="#78350f" rx="4" stroke="#92400e" strokeWidth="2" />
            <rect x="104" y="108" width="54" height="6" fill="#92400e" rx="2" />

            {/* Chén trà sen sứ xanh khói thơm */}
            <ellipse cx="128" cy="107" rx="7" ry="4" fill="#059669" stroke="#047857" strokeWidth="1" />
            <path
              d="M127,101 Q130,94 126,88 T130,78"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="animate-pulse"
            />

            {/* Tay Chibi nâng chén trà */}
            <path d="M78,92 Q94,98 106,98" stroke={robe.shade} strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="108" cy="98" r="5" fill="#fed7aa" stroke="#fb923c" strokeWidth="1" />

            {/* Cổ & Đầu Chibi */}
            <rect x="65" y="62" width="10" height="14" fill="#fed7aa" rx="3" />
            <circle cx="70" cy="50" r="27" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />

            {/* Mái tóc */}
            <g transform="translate(-10, 0)">{renderChibiHair()}</g>

            {/* Ngũ quan vui tươi thảnh thơi */}
            <g transform="translate(-10, 0)">{renderChibiFace('happy')}</g>

            {/* Phụ kiện */}
            <g transform="translate(-10, 0)">{renderAccessory()}</g>
          </svg>
        )}

        {/* =========================================================
            POSE 3: SWEEPING (QUÉT LÁ ĐA SÂN CHÙA)
            ========================================================= */}
        {pose === 'sweeping' && (
          <div className="relative">
            <svg
              viewBox="0 0 160 200"
              className={`w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible transition-transform duration-300 ${isSweepingAnim ? '-rotate-4 translate-x-1' : 'rotate-0'
                }`}
            >
              {/* Bóng Chibi dưới đất */}
              <ellipse cx="80" cy="188" rx="42" ry="9" fill="rgba(0,0,0,0.3)" />

              {/* Tà Áo Tràng Dáng Chibi (Chân lùn xinh xắn) */}
              <path
                d="M52,95 L108,95 L120,175 L40,175 Z"
                fill={robe.main}
                stroke={robe.shade}
                strokeWidth="2.5"
              />
              {/* Đôi giày cói Chibi lấp ló dưới tà áo */}
              <ellipse cx="62" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
              <ellipse cx="98" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />

              {/* Đai lưng vải Chibi */}
              <rect x="50" y="106" width="60" height="9" fill={robe.sash} rx="2" stroke="#b45309" strokeWidth="1" />
              {/* Nơ thắt lưng buông tà */}
              <path d="M78,115 L74,136 L82,136 Z" fill={robe.sash} opacity="0.9" />

              {/* Thân trên & Cổ áo vắt chéo */}
              <path
                d="M50,78 Q80,68 110,78 L108,102 L52,102 Z"
                fill={robe.main}
                stroke={robe.shade}
                strokeWidth="2.5"
              />
              <path d="M66,78 L80,98 L94,78" fill="none" stroke={robe.trim} strokeWidth="3" />

              {/* Cán chổi tre & Tay Chibi quét lá */}
              <g className={isSweepingAnim ? 'animate-bounce' : ''}>
                {/* Cán tre trúc vàng óng */}
                <line x1="94" y1="94" x2="132" y2="186" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
                {/* Bó chổi rơm quét */}
                <path d="M132,186 L118,172 Q136,165 152,174 L142,189 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                <line x1="124" y1="176" x2="137" y2="189" stroke="#713f12" strokeWidth="1.2" />
                <line x1="133" y1="172" x2="143" y2="187" stroke="#713f12" strokeWidth="1.2" />

                {/* Hai bàn tay Chibi tròn vo nắm cán chổi */}
                <circle cx="94" cy="98" r="5" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.2" />
                <circle cx="84" cy="106" r="4.5" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.2" />
              </g>

              {/* Cổ & Đầu Chibi to tròn (Đầu r = 27) */}
              <rect x="74" y="60" width="12" height="15" fill="#fed7aa" rx="3" />
              <circle cx="80" cy="50" r="28" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />

              {/* Mái tóc */}
              {renderChibiHair()}

              {/* Ngũ quan tươi tắn */}
              {renderChibiFace('open')}

              {/* Phụ kiện */}
              {renderAccessory()}
            </svg>
          </div>
        )}

        {/* =========================================================
            POSE 4: IDLE (CHIBI ĐỨNG CHẮP TAY BÚP SEN AN NHIÊN)
            ========================================================= */}
        {pose === 'idle' && (
          <div className="relative">
            <svg viewBox="0 0 160 200" className="w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible">
              {/* Bóng nhân vật */}
              <ellipse cx="80" cy="188" rx="42" ry="9" fill="rgba(0,0,0,0.3)" />

              {/* Tà Áo Tràng Chibi Dáng Đứng */}
              <path
                d="M52,95 L108,95 L120,175 L40,175 Z"
                fill={robe.main}
                stroke={robe.shade}
                strokeWidth="2.5"
              />
              {/* Đôi giày cói Chibi */}
              <ellipse cx="62" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
              <ellipse cx="98" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />

              {/* Đai lưng vải */}
              <rect x="50" y="106" width="60" height="9" fill={robe.sash} rx="2" stroke="#b45309" strokeWidth="1" />
              <path d="M78,115 L74,136 L82,136 Z" fill={robe.sash} opacity="0.9" />

              {/* Thân trên */}
              <path
                d="M50,78 Q80,68 110,78 L108,102 L52,102 Z"
                fill={robe.main}
                stroke={robe.shade}
                strokeWidth="2.5"
              />
              <path d="M66,78 L80,98 L94,78" fill="none" stroke={robe.trim} strokeWidth="3" />

              {/* Hai tay Chibi chắp búp sen trước ngực (Anjali Mudra) */}
              <g id="chibi-hands-prayer">
                <path d="M52,86 Q72,102 78,98" stroke={robe.shade} strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M108,86 Q88,102 82,98" stroke={robe.shade} strokeWidth="7" strokeLinecap="round" fill="none" />
                {/* Đôi bàn tay Chibi chắp sen */}
                <polygon points="76,96 84,96 80,84" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.2" />
                {/* Vầng sáng đóa sen mini nở giữa 2 tay */}
                <circle cx="80" cy="88" r="4" fill="#fde047" opacity="0.6" className="animate-pulse" />
              </g>

              {/* Cổ & Đầu Chibi */}
              <rect x="74" y="60" width="12" height="15" fill="#fed7aa" rx="3" />
              <circle cx="80" cy="50" r="28" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />

              {/* Mái tóc */}
              {renderChibiHair()}

              {/* Ngũ quan rạng rỡ */}
              {renderChibiFace('happy')}

              {/* Phụ kiện */}
              {renderAccessory()}
            </svg>
          </div>
        )}

        {/* =========================================================
            POSE 5: CHOPPING (VUNG RÌU BỔ CỦI BẾP HƯƠNG TÍCH)
            ========================================================= */}
        {pose === 'chopping' && (
          <div className="relative">
            <svg viewBox="0 0 160 200" className="w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible">
              <ellipse cx="80" cy="188" rx="42" ry="9" fill="rgba(0,0,0,0.3)" />

              {/* Dáng đứng hơi khuỵu gối tạo thế chẻ củi */}
              <path d="M48,98 L112,98 L124,175 L36,175 Z" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
              <ellipse cx="58" cy="176" rx="10" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
              <ellipse cx="102" cy="176" rx="10" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />

              <rect x="48" y="108" width="64" height="9" fill={robe.sash} rx="2" stroke="#b45309" strokeWidth="1" />

              <path d="M48,78 Q80,68 112,78 L108,104 L52,104 Z" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
              <path d="M66,78 L80,98 L94,78" fill="none" stroke={robe.trim} strokeWidth="3" />

              {/* Cán rìu và tay giơ lên cao */}
              <g id="chibi-axe">
                <line x1="86" y1="88" x2="114" y2="34" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                {/* Lưỡi búa / rìu sắc bén */}
                <path d="M114,34 L128,24 L132,42 L116,40 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
                {/* Bàn tay Chibi nắm cán */}
                <circle cx="94" cy="74" r="5" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.2" />
                <circle cx="104" cy="54" r="5" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.2" />
              </g>

              <rect x="74" y="60" width="12" height="15" fill="#fed7aa" rx="3" />
              <circle cx="80" cy="50" r="28" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />

              {renderChibiHair()}
              {/* Mắt mở to tập trung định tâm */}
              {renderChibiFace('open')}
              {renderAccessory()}
            </svg>
          </div>
        )}

        {/* =========================================================
            POSE 6: CARRYING (GÁNH NƯỚC SUỐI TIÊN)
            ========================================================= */}
        {pose === 'carrying' && (
          <div className="relative">
            <svg viewBox="0 0 170 200" className="w-44 h-50 sm:w-52 sm:h-60 drop-shadow-2xl overflow-visible">
              <ellipse cx="85" cy="188" rx="46" ry="9" fill="rgba(0,0,0,0.3)" />

              {/* Thân và chân Chibi */}
              <path d="M56,96 L114,96 L124,175 L46,175 Z" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
              <ellipse cx="66" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
              <ellipse cx="104" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />

              <rect x="54" y="106" width="62" height="9" fill={robe.sash} rx="2" stroke="#b45309" strokeWidth="1" />

              <path d="M54,78 Q85,68 116,78 L114,102 L56,102 Z" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
              <path d="M72,78 L85,98 L98,78" fill="none" stroke={robe.trim} strokeWidth="3" />

              {/* Đòn gánh tre dài uốn cong qua vai */}
              <g id="chibi-carrying-pole">
                {/* Đòn gánh tre cong */}
                <path d="M12,78 Q85,64 158,78" fill="none" stroke="#ca8a04" strokeWidth="4.5" strokeLinecap="round" />

                {/* Dây thừng & Thùng gỗ bên trái */}
                <line x1="22" y1="76" x2="22" y2="124" stroke="#a16207" strokeWidth="1.5" />
                <rect x="10" y="124" width="24" height="22" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
                <ellipse cx="22" cy="124" rx="12" ry="4" fill="#0284c7" />

                {/* Dây thừng & Thùng gỗ bên phải */}
                <line x1="148" y1="76" x2="148" y2="124" stroke="#a16207" strokeWidth="1.5" />
                <rect x="136" y="124" width="24" height="22" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
                <ellipse cx="148" cy="124" rx="12" ry="4" fill="#0284c7" />

                {/* Hai bàn tay Chibi vịn đòn gánh */}
                <circle cx="68" cy="74" r="5" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.2" />
                <circle cx="102" cy="74" r="5" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.2" />
              </g>

              <rect x="79" y="60" width="12" height="15" fill="#fed7aa" rx="3" />
              <circle cx="85" cy="50" r="28" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />

              <g transform="translate(5, 0)">{renderChibiHair()}</g>
              <g transform="translate(5, 0)">{renderChibiFace('happy')}</g>
              <g transform="translate(5, 0)">{renderAccessory()}</g>
            </svg>
          </div>
        )}

        {/* =========================================================
            POSE 7: CLEANING (LAU CHÙI BÀN THỜ PHẬT)
            ========================================================= */}
        {pose === 'cleaning' && (
          <div className="relative">
            <svg viewBox="0 0 160 200" className="w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible">
              <ellipse cx="80" cy="188" rx="42" ry="9" fill="rgba(0,0,0,0.3)" />

              <path d="M52,95 L108,95 L120,175 L40,175 Z" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
              <ellipse cx="62" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
              <ellipse cx="98" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />

              <rect x="50" y="106" width="60" height="9" fill={robe.sash} rx="2" stroke="#b45309" strokeWidth="1" />

              <path d="M50,78 Q80,68 110,78 L108,102 L52,102 Z" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
              <path d="M66,78 L80,98 L94,78" fill="none" stroke={robe.trim} strokeWidth="3" />

              {/* Tay Chibi cầm khăn lau tòa sen phát sáng */}
              <g id="chibi-cleaning-cloth">
                <path d="M106,86 Q122,80 126,68" stroke={robe.shade} strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="126" cy="68" r="5" fill="#fed7aa" stroke="#fb923c" strokeWidth="1" />
                {/* Khăn vải mềm trắng lau bụi */}
                <ellipse cx="132" cy="64" rx="8" ry="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
                {/* Ánh sao lấp lánh sau khi lau sạch */}
                <circle cx="140" cy="54" r="2.5" fill="#fde047" className="animate-ping" />
              </g>

              <rect x="74" y="60" width="12" height="15" fill="#fed7aa" rx="3" />
              <circle cx="80" cy="50" r="28" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />

              {renderChibiHair()}
              {renderChibiFace('wink')}
              {renderAccessory()}
            </svg>
          </div>
        )}

        {/* =========================================================
            POSE 8: CHARITY (NÂNG BÁT CƠM CHAY CỨU TẾ)
            ========================================================= */}
        {pose === 'charity' && (
          <div className="relative">
            <svg viewBox="0 0 160 200" className="w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible">
              <ellipse cx="80" cy="188" rx="42" ry="9" fill="rgba(0,0,0,0.3)" />

              <path d="M52,95 L108,95 L120,175 L40,175 Z" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
              <ellipse cx="62" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
              <ellipse cx="98" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />

              <rect x="50" y="106" width="60" height="9" fill={robe.sash} rx="2" stroke="#b45309" strokeWidth="1" />

              <path d="M50,78 Q80,68 110,78 L108,102 L52,102 Z" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
              <path d="M66,78 L80,98 L94,78" fill="none" stroke={robe.trim} strokeWidth="3" />

              {/* Hai tay Chibi nâng bát cháo/cơm chay nghi ngút khói */}
              <g id="chibi-charity-bowl">
                <path d="M54,88 Q72,104 76,100" stroke={robe.shade} strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M106,88 Q88,104 84,100" stroke={robe.shade} strokeWidth="7" strokeLinecap="round" fill="none" />
                {/* Bát sứ men lam ấm nóng */}
                <ellipse cx="80" cy="98" rx="14" ry="7" fill="#d97706" stroke="#92400e" strokeWidth="1.2" />
                <ellipse cx="80" cy="96" rx="12" ry="4" fill="#fef3c7" />
                {/* Làn khói cơm ấm bay lên */}
                <path d="M80,90 Q82,82 78,76 T82,68" fill="none" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" className="animate-pulse" />
              </g>

              <rect x="74" y="60" width="12" height="15" fill="#fed7aa" rx="3" />
              <circle cx="80" cy="50" r="28" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />

              {renderChibiHair()}
              {renderChibiFace('happy')}
              {renderAccessory()}
            </svg>
          </div>
        )}

        {/* =========================================================
            POSE 9: CALLIGRAPHY (CẦM CỌ LÔNG VIẾT THƯ PHÁP TÀNG KINH CÁC)
            ========================================================= */}
        {pose === 'calligraphy' && (
          <div className="relative">
            <svg viewBox="0 0 160 200" className="w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible">
              <ellipse cx="80" cy="188" rx="42" ry="9" fill="rgba(0,0,0,0.3)" />

              <path d="M52,95 L108,95 L120,175 L40,175 Z" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
              <ellipse cx="62" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
              <ellipse cx="98" cy="176" rx="9" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />

              <rect x="50" y="106" width="60" height="9" fill={robe.sash} rx="2" stroke="#b45309" strokeWidth="1" />

              <path d="M50,78 Q80,68 110,78 L108,102 L52,102 Z" fill={robe.main} stroke={robe.shade} strokeWidth="2.5" />
              <path d="M66,78 L80,98 L94,78" fill="none" stroke={robe.trim} strokeWidth="3" />

              {/* Tay Chibi cầm bút lông thư pháp đượm mực */}
              <g id="chibi-brush">
                <path d="M106,86 Q116,92 118,104" stroke={robe.shade} strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="118" cy="104" r="5" fill="#fed7aa" stroke="#fb923c" strokeWidth="1" />
                {/* Bút lông cán trúc */}
                <line x1="118" y1="90" x2="118" y2="124" stroke="#78350f" strokeWidth="3.2" strokeLinecap="round" />
                {/* Lông cọ nhọn đượm mực tàu */}
                <polygon points="116,124 120,124 118,132" fill="#1c1917" />
              </g>

              <rect x="74" y="60" width="12" height="15" fill="#fed7aa" rx="3" />
              <circle cx="80" cy="50" r="28" fill="#fed7aa" stroke="#fb923c" strokeWidth="1.5" />

              {renderChibiHair()}
              {renderChibiFace('open')}
              {renderAccessory()}
            </svg>
          </div>
        )}

      </div>
    </div>
  );
};
