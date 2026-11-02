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

// Bảng màu áo sơ mi / trang phục theo phong cách Chibi Casual
const SHIRT_PALETTES: Record<
  RobeColorType,
  {
    maleShirt: string;
    maleShirtShade: string;
    femaleShirt: string;
    femaleShirtShade: string;
    collar: string;
    name: string;
  }
> = {
  lam: {
    maleShirt: '#dbeafe', // Xanh dương nhạt như mẫu thiết kế Male Chibi
    maleShirtShade: '#bfdbfe',
    femaleShirt: '#fce7f3', // Hồng pastel như mẫu thiết kế Female Chibi
    femaleShirtShade: '#fbcfe8',
    collar: '#eff6ff',
    name: 'Sơ Mi Thanh Lịch',
  },
  nau: {
    maleShirt: '#fed7aa', // Nâu ấm / be
    maleShirtShade: '#fdba74',
    femaleShirt: '#fed7aa',
    femaleShirtShade: '#fdba74',
    collar: '#ffedd5',
    name: 'Nâu Trầm Mộc',
  },
  xam: {
    maleShirt: '#e2e8f0', // Xám khói
    maleShirtShade: '#cbd5e1',
    femaleShirt: '#e2e8f0',
    femaleShirtShade: '#cbd5e1',
    collar: '#f8fafc',
    name: 'Xám Tối Giản',
  },
  bach: {
    maleShirt: '#ffffff', // Trắng tinh khôi
    maleShirtShade: '#f1f5f9',
    femaleShirt: '#ffffff',
    femaleShirtShade: '#f1f5f9',
    collar: '#ffffff',
    name: 'Bạch Y Casual',
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
  const isFemale = character.gender === 'female';
  const palette = SHIRT_PALETTES[character.robeColor] || SHIRT_PALETTES.lam;

  const shirtColor = isFemale ? palette.femaleShirt : palette.maleShirt;
  const shirtShade = isFemale ? palette.femaleShirtShade : palette.maleShirtShade;
  const pantsColor = isFemale ? '#475569' : '#334155'; // Quần jean than / xám đậm
  const pantsShade = isFemale ? '#334155' : '#1e293b';
  const beltColor = '#451a03'; // Dây lưng da nâu
  const buckleColor = '#94a3b8'; // Khóa thắt lưng kim loại

  const hairColor = '#3f2e24'; // Tóc nâu tự nhiên chuẩn concept Chibi
  const hairHighlight = '#5c4033';
  const skinTone = '#ffedd5'; // Da sáng mịn
  const skinShade = '#fed7aa';

  // ==========================================
  // 1. VẼ MÁI TÓC CHIBI THEO ĐÚNG CONCEPT ART
  // ==========================================
  const renderHair = () => {
    if (isFemale) {
      // FEMALE CHIBI: Tóc đuôi ngựa cao gợn sóng + lọn tóc mai uốn cong hai bên
      return (
        <g id="female-chibi-hair">
          {/* Đuôi ngựa bồng bềnh uốn lượn bên vai phải (như hình mẫu) */}
          <path
            d="M96,38 C115,22 135,35 125,58 C118,72 108,82 112,102 C114,110 110,118 102,116 C95,114 96,104 100,94 C104,82 108,72 98,60 Z"
            fill={hairColor}
          />
          {/* Highlight sợi tóc đuôi ngựa */}
          <path
            d="M102,40 C118,30 128,42 120,62 C114,76 106,88 108,104"
            fill="none"
            stroke={hairHighlight}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Dây thắt nơ / dây buộc tóc */}
          <ellipse cx="94" cy="38" rx="5" ry="4" fill="#1e293b" />

          {/* Khối tóc bồng bềnh trên đỉnh đầu */}
          <path
            d="M50,54 C46,26 62,18 80,18 C98,18 114,26 110,54 C104,32 94,27 80,27 C66,27 56,32 50,54 Z"
            fill={hairColor}
          />
          {/* Highlight đỉnh đầu */}
          <path
            d="M62,25 Q80,21 98,25"
            fill="none"
            stroke={hairHighlight}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Tóc mái rẽ ngôi nhẹ để lộ trán */}
          <path
            d="M52,48 C58,38 70,36 76,46 C78,42 85,38 98,44 C106,48 108,54 108,54 C100,34 88,32 78,38 C68,32 58,36 52,48 Z"
            fill={hairColor}
          />

          {/* Hai lọn tóc mai uốn lượn ôm sát hai bên má phúng phính (rất đặc trưng của mẫu nữ) */}
          <path
            d="M52,48 C46,62 48,78 54,86 C52,76 50,65 55,54 Z"
            fill={hairColor}
          />
          <path
            d="M108,48 C114,62 112,78 106,86 C108,76 110,65 105,54 Z"
            fill={hairColor}
          />
        </g>
      );
    }

    // MALE CHIBI: Tóc ngắn spiky tỉa layer, các lọn tóc vểnh năng động (như hình mẫu)
    return (
      <g id="male-chibi-hair">
        {/* Khối tóc chính ôm vòm đầu */}
        <path
          d="M51,55 C46,28 62,20 80,20 C98,20 114,28 109,55 C104,34 94,28 80,28 C66,28 56,34 51,55 Z"
          fill={hairColor}
        />
        {/* Highlight sợi tóc đỉnh đầu */}
        <path
          d="M60,26 Q80,22 100,26"
          fill="none"
          stroke={hairHighlight}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Các lọn tóc vểnh spiky đặc trưng bên trái & đỉnh */}
        <path d="M52,42 Q42,32 46,26 Q52,30 55,36 Z" fill={hairColor} />
        <path d="M58,28 Q54,16 62,14 Q64,22 66,26 Z" fill={hairColor} />
        <path d="M72,21 Q72,8 80,9 Q80,18 78,22 Z" fill={hairColor} />
        <path d="M86,22 Q92,10 98,14 Q94,20 92,25 Z" fill={hairColor} />
        <path d="M102,28 Q112,20 112,28 Q108,34 104,38 Z" fill={hairColor} />

        {/* Tóc mái so le chia ngôi nhẹ để lộ trán */}
        <path
          d="M52,48 Q64,52 70,42 Q76,53 84,40 Q92,52 104,44 Q108,48 108,54 Q92,34 78,38 Q64,32 52,48 Z"
          fill={hairColor}
        />

        {/* Tóc mai hai bên tai */}
        <path d="M52,46 Q50,58 55,64 Q53,56 56,50 Z" fill={hairColor} />
        <path d="M108,46 Q110,58 105,64 Q107,56 104,50 Z" fill={hairColor} />
      </g>
    );
  };

  // ==========================================
  // 2. VẼ NGŨ QUAN CHIBI (MẮT TO LẤP LÁNH, MÁ HỒNG)
  // ==========================================
  const renderFace = (mood: 'smile' | 'meditate' | 'wink' = 'smile') => (
    <g id="chibi-eyes-and-mouth">
      {/* Má hồng đào ửng dễ thương */}
      <circle cx={isFemale ? 65 : 66} cy="63" r="6.5" fill="#fb7185" opacity={isFemale ? '0.5' : '0.35'} />
      <circle cx={isFemale ? 95 : 94} cy="63" r="6.5" fill="#fb7185" opacity={isFemale ? '0.5' : '0.35'} />
      {/* Vạch phấn má cute */}
      <line x1="62" y1="62" x2="68" y2="64" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="92" y1="62" x2="98" y2="64" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      {/* Đôi tai xinh xắn */}
      <ellipse cx="50" cy="58" rx="4.5" ry="6.5" fill={skinTone} stroke="#fb923c" strokeWidth="0.8" />
      <ellipse cx="110" cy="58" rx="4.5" ry="6.5" fill={skinTone} stroke="#fb923c" strokeWidth="0.8" />

      {mood === 'meditate' ? (
        /* Mắt khép hờ tĩnh lặng khi thiền */
        <g id="eyes-meditate">
          <path d="M62,55 Q69,51 76,55" fill="none" stroke="#2b1810" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M84,55 Q91,51 98,55" fill="none" stroke="#2b1810" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      ) : (
        /* Đôi mắt Anime Chibi to tròn long lanh như concept art */
        <g id="eyes-open">
          {/* Mắt Trái */}
          <ellipse cx="68" cy="54" rx="7.5" ry="9.5" fill="#1e130c" />
          {/* Mống mắt nâu ấm gradient */}
          <ellipse cx="68" cy="57" rx="6.5" ry="6" fill="#78350f" />
          <ellipse cx="68" cy="58" rx="5" ry="4" fill="#b45309" />
          {/* Đốm sáng lớn góc trên trái */}
          <circle cx="65.5" cy="50.5" r="3.2" fill="#ffffff" />
          {/* Đốm sáng nhỏ góc dưới phải */}
          <circle cx="71" cy="57.5" r="1.5" fill="#ffffff" />

          {/* Mắt Phải */}
          <ellipse cx="92" cy="54" rx="7.5" ry="9.5" fill="#1e130c" />
          <ellipse cx="92" cy="57" rx="6.5" ry="6" fill="#78350f" />
          <ellipse cx="92" cy="58" rx="5" ry="4" fill="#b45309" />
          <circle cx="89.5" cy="50.5" r="3.2" fill="#ffffff" />
          <circle cx="95" cy="57.5" r="1.5" fill="#ffffff" />

          {/* Mi mắt trên cong thanh tú */}
          <path
            d={isFemale ? 'M59,51 Q68,43 77,50' : 'M60,51 Q68,44 76,51'}
            fill="none"
            stroke="#1c1917"
            strokeWidth={isFemale ? '2.8' : '2.4'}
            strokeLinecap="round"
          />
          <path
            d={isFemale ? 'M83,50 Q92,43 101,51' : 'M84,51 Q92,44 100,51'}
            fill="none"
            stroke="#1c1917"
            strokeWidth={isFemale ? '2.8' : '2.4'}
            strokeLinecap="round"
          />

          {/* Đuôi mi cong kiêu sa cho nữ */}
          {isFemale && (
            <>
              <path d="M76,49 L79,46" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
              <path d="M100,49 L103,46" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
        </g>
      )}

      {/* Lông mày: Nam đậm và tự tin, Nữ thanh mảnh cong nhẹ */}
      <path
        d={isFemale ? 'M62,44 Q68,40 74,44' : 'M61,44 Q68,40 75,44'}
        fill="none"
        stroke="#451a03"
        strokeWidth={isFemale ? '1.5' : '2.2'}
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d={isFemale ? 'M86,44 Q92,40 98,44' : 'M85,44 Q92,40 99,44'}
        fill="none"
        stroke="#451a03"
        strokeWidth={isFemale ? '1.5' : '2.2'}
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Mũi nhỏ xíu tinh tế */}
      <circle cx="80" cy="62" r="1" fill="#ea580c" opacity="0.3" />

      {/* Miệng cười xinh xắn */}
      <path d="M76,67 Q80,72 84,67" fill="#e11d48" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );

  // ==========================================
  // 3. VẼ ĐÔI GIÀY THEO THIẾT KẾ MẪU
  // ==========================================
  const renderShoes = () => {
    if (isFemale) {
      // Nữ: Giày slip-on lười màu trắng xám đế bằng thanh lịch
      return (
        <g id="female-slipon-shoes">
          {/* Giày trái */}
          <ellipse cx="66" cy="184" rx="8.5" ry="4.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
          <ellipse cx="66" cy="183" rx="6" ry="2.5" fill="#ffffff" />
          <line x1="58" y1="184" x2="74" y2="184" stroke="#cbd5e1" strokeWidth="1" />

          {/* Giày phải */}
          <ellipse cx="94" cy="184" rx="8.5" ry="4.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
          <ellipse cx="94" cy="183" rx="6" ry="2.5" fill="#ffffff" />
          <line x1="86" y1="184" x2="102" y2="184" stroke="#cbd5e1" strokeWidth="1" />
        </g>
      );
    }

    // Nam: Giày sneaker đen cổ thấp mũi trắng tròn viền cao su (như hình mẫu)
    return (
      <g id="male-sneakers">
        {/* Giày trái */}
        <ellipse cx="64" cy="184" rx="10" ry="5.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
        {/* Mũi giày cao su trắng tròn */}
        <path d="M54,184 Q58,180 62,184 Q58,187 54,184 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        {/* Dây giày trắng */}
        <line x1="62" y1="182" x2="68" y2="184" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        {/* Viền đế cao su trắng */}
        <ellipse cx="64" cy="187" rx="10.5" ry="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />

        {/* Giày phải */}
        <ellipse cx="96" cy="184" rx="10" ry="5.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
        <path d="M86,184 Q90,180 94,184 Q90,187 86,184 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        <line x1="94" y1="182" x2="100" y2="184" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        <ellipse cx="96" cy="187" rx="10.5" ry="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
      </g>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${className} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all' : ''
      }`}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Name and Title Tag */}
      {showNameTag && (
        <div className="mb-1 flex flex-col items-center pointer-events-none">
          <div className="px-3.5 py-0.8 rounded-full bg-stone-950/85 border-2 border-amber-400/70 text-amber-200 text-xs font-serif font-black shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
            <span>{isFemale ? '🌸' : '⭐'}</span>
            <span>{character.name || (isFemale ? 'Diệu Tâm' : 'Tuệ Minh')}</span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-amber-300 font-serif font-bold mt-0.5 bg-black/75 px-2.5 py-0.5 rounded-full border border-amber-500/30 shadow">
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Main SVG Chibi Container */}
      <div className={`relative ${isBreathingAnim ? 'animate-pulse' : ''}`}>
        
        {/* =========================================================
            1. POSE: IDLE (ĐỨNG TẠO DÁNG CHUẨN CONCEPT ART THIẾT KẾ)
               - Nam: Tay trái chống hông, tay phải buông nhẹ, áo sơ mi xanh nhạt, quần jean, giày sneaker đen mũi trắng.
               - Nữ: Tay trái giơ lên vẫy chào xinh xắn, áo sơ mi hồng pastel, quần ôm than, giày slip-on trắng.
            ========================================================= */}
        {pose === 'idle' && (
          <svg viewBox="0 0 160 200" className="w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible">
            {/* Bóng đổ dưới chân */}
            <ellipse cx="80" cy="189" rx="42" ry="7" fill="rgba(0,0,0,0.35)" />

            {/* Giày */}
            {renderShoes()}

            {/* Quần Jeans / Trousers */}
            <g id="chibi-pants">
              {/* Ống quần trái & phải */}
              <path
                d="M58,134 L72,134 L71,178 L59,178 Z"
                fill={pantsColor}
                stroke={pantsShade}
                strokeWidth="1.5"
              />
              <path
                d="M88,134 L102,134 L101,178 L89,178 Z"
                fill={pantsColor}
                stroke={pantsShade}
                strokeWidth="1.5"
              />
              {/* Đáy quần & Hông */}
              <path
                d="M56,124 L104,124 L102,142 L80,146 L58,142 Z"
                fill={pantsColor}
                stroke={pantsShade}
                strokeWidth="1.5"
              />
              {/* Đường chỉ may túi quần & nếp gấp */}
              <path d="M58,128 Q64,136 70,132" fill="none" stroke={pantsShade} strokeWidth="1" />
              <path d="M102,128 Q96,136 90,132" fill="none" stroke={pantsShade} strokeWidth="1" />
              <line x1="80" y1="126" x2="80" y2="140" stroke={pantsShade} strokeWidth="1.2" />
            </g>

            {/* Dây nịt thắt lưng da nâu + mặt khóa kim loại */}
            <rect x="58" y="122" width="44" height="6" fill={beltColor} rx="1" stroke="#261005" strokeWidth="0.8" />
            <rect x="76" y="121" width="8" height="8" fill={buckleColor} rx="1.5" stroke="#475569" strokeWidth="0.8" />
            <rect x="78" y="123" width="4" height="4" fill={beltColor} />

            {/* Thân Áo Sơ Mi (Cài cúc, tay áo xắn gập 3/4) */}
            <g id="chibi-shirt">
              {/* Thân áo sơ mi cắm thùng gọn gàng */}
              <path
                d="M56,86 L104,86 L102,122 L58,122 Z"
                fill={shirtColor}
                stroke={shirtShade}
                strokeWidth="1.8"
              />
              {/* Nẹp cúc áo chạy dọc giữa ngực */}
              <line x1="80" y1="88" x2="80" y2="122" stroke={shirtShade} strokeWidth="1.8" />
              <circle cx="80" cy="100" r="1.2" fill="#94a3b8" />
              <circle cx="80" cy="110" r="1.2" fill="#94a3b8" />

              {/* Cổ áo bẻ chữ V hở nhẹ tự nhiên thanh lịch */}
              <path d="M68,82 L80,98 L92,82" fill="none" stroke={palette.collar} strokeWidth="3.5" />
              <path d="M68,82 L76,96 L80,96" fill={palette.collar} stroke={shirtShade} strokeWidth="1" />
              <path d="M92,82 L84,96 L80,96" fill={palette.collar} stroke={shirtShade} strokeWidth="1" />

              {/* Vùng cổ & xương quai xanh lộ nhẹ */}
              <polygon points="76,82 84,82 80,92" fill={skinTone} />
            </g>

            {/* Tay áo & Cánh tay */}
            {isFemale ? (
              /* NỮ: Tay trái giơ lên vẫy chào (Waving cute hand), tay phải buông nhẹ */
              <g id="female-arms">
                {/* Tay phải buông xuôi, tay áo xắn 3/4 */}
                <path d="M58,88 L48,108" stroke={shirtColor} strokeWidth="7" strokeLinecap="round" />
                <rect x="44" y="104" width="7" height="4" fill={shirtShade} rx="1" transform="rotate(25 44 104)" />
                <path d="M47,108 L43,126" stroke={skinTone} strokeWidth="5" strokeLinecap="round" />
                <circle cx="43" cy="126" r="3.5" fill={skinTone} />

                {/* Tay trái giơ lên cao vẫy chào (Waving) */}
                <path d="M102,88 L114,96" stroke={shirtColor} strokeWidth="7" strokeLinecap="round" />
                <rect x="110" y="94" width="7" height="4" fill={shirtShade} rx="1" transform="rotate(-30 110 94)" />
                <path d="M115,96 L124,80" stroke={skinTone} strokeWidth="5" strokeLinecap="round" />
                {/* Bàn tay vẫy với 5 ngón nhỏ xinh xắn */}
                <g transform="translate(124, 76)">
                  <circle cx="0" cy="0" r="4.5" fill={skinTone} />
                  <line x1="-3" y1="-3" x2="-5" y2="-7" stroke={skinTone} strokeWidth="2" strokeLinecap="round" />
                  <line x1="-1" y1="-4" x2="-2" y2="-9" stroke={skinTone} strokeWidth="2" strokeLinecap="round" />
                  <line x1="2" y1="-4" x2="2" y2="-9" stroke={skinTone} strokeWidth="2" strokeLinecap="round" />
                  <line x1="4" y1="-2" x2="6" y2="-7" stroke={skinTone} strokeWidth="2" strokeLinecap="round" />
                </g>
              </g>
            ) : (
              /* NAM: Tay trái chống hông (Akibo pose), tay phải buông thả lỏng */
              <g id="male-arms">
                {/* Tay phải buông nhẹ, xắn tay áo 3/4 */}
                <path d="M58,88 L50,108" stroke={shirtColor} strokeWidth="8" strokeLinecap="round" />
                <rect x="46" y="104" width="8" height="4" fill={shirtShade} rx="1" transform="rotate(25 46 104)" />
                <path d="M49,108 L45,128" stroke={skinTone} strokeWidth="5.5" strokeLinecap="round" />
                <circle cx="45" cy="128" r="4" fill={skinTone} />

                {/* Tay trái chống hông mạnh mẽ như hình mẫu */}
                <path d="M102,88 L116,104" stroke={shirtColor} strokeWidth="8" strokeLinecap="round" />
                <rect x="112" y="101" width="8" height="4" fill={shirtShade} rx="1" transform="rotate(-40 112 101)" />
                {/* Cẳng tay gập lại hướng về eo */}
                <path d="M116,104 L102,118" stroke={skinTone} strokeWidth="5.5" strokeLinecap="round" />
                {/* Bàn tay đặt lên thắt lưng */}
                <ellipse cx="102" cy="118" rx="4.5" ry="3.5" fill={skinTone} stroke="#ea580c" strokeWidth="0.8" />
              </g>
            )}

            {/* Cổ & Đầu Chibi to tròn đáng yêu */}
            <rect x="74" y="66" width="12" height="14" fill={skinShade} rx="3" />
            <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />

            {/* Mái tóc & Ngũ quan */}
            {renderHair()}
            {renderFace('smile')}
          </svg>
        )}

        {/* =========================================================
            2. POSE: SWEEPING (QUÉT LÁ ĐA)
            ========================================================= */}
        {pose === 'sweeping' && (
          <div className="relative">
            <svg
              viewBox="0 0 160 200"
              className={`w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible transition-transform duration-300 ${
                isSweepingAnim ? '-rotate-4 translate-x-1' : 'rotate-0'
              }`}
            >
              <ellipse cx="80" cy="189" rx="42" ry="7" fill="rgba(0,0,0,0.35)" />
              {renderShoes()}

              {/* Quần jeans */}
              <path d="M58,134 L72,134 L71,178 L59,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
              <path d="M88,134 L102,134 L101,178 L89,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
              <path d="M56,124 L104,124 L102,142 L80,146 L58,142 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
              <rect x="58" y="122" width="44" height="6" fill={beltColor} rx="1" />

              {/* Thân áo sơ mi */}
              <path d="M56,86 L104,86 L102,122 L58,122 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />
              <path d="M68,82 L80,96 L92,82" fill="none" stroke={palette.collar} strokeWidth="3" />

              {/* Chổi tre & Tay cầm chổi */}
              <g className={isSweepingAnim ? 'animate-bounce' : ''}>
                <line x1="94" y1="94" x2="132" y2="186" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
                <path d="M132,186 L118,172 Q136,165 152,174 L142,189 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                <circle cx="94" cy="98" r="5" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
                <circle cx="84" cy="106" r="4.5" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
              </g>

              {/* Cổ & Đầu */}
              <rect x="74" y="66" width="12" height="14" fill={skinTone} rx="3" />
              <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
              {renderHair()}
              {renderFace('smile')}
            </svg>
          </div>
        )}

        {/* =========================================================
            3. POSE: SITTING TEA (NGỒI HIÊN TRÀ ĐỐI ẨM)
            ========================================================= */}
        {pose === 'sitting-tea' && (
          <svg viewBox="0 0 170 170" className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-2xl overflow-visible">
            <ellipse cx="85" cy="146" rx="66" ry="15" fill="#ca8a04" opacity="0.35" stroke="#a16207" strokeWidth="1.5" />

            {/* Chân xếp bằng trong quần jeans */}
            <ellipse cx="70" cy="135" rx="38" ry="14" fill={pantsColor} stroke={pantsShade} strokeWidth="2" />

            {/* Thân áo sơ mi ngồi */}
            <path d="M50,78 Q70,75 90,78 L98,128 Q70,132 42,128 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="2" />
            <rect x="52" y="108" width="40" height="6" fill={beltColor} rx="1" />

            {/* Bàn trà gỗ bên cạnh */}
            <rect x="108" y="112" width="46" height="30" fill="#78350f" rx="4" stroke="#92400e" strokeWidth="2" />
            <rect x="104" y="108" width="54" height="6" fill="#92400e" rx="2" />

            {/* Chén trà sứ xanh khói thơm */}
            <ellipse cx="128" cy="107" rx="7" ry="4" fill="#059669" stroke="#047857" strokeWidth="1" />
            <path d="M127,101 Q130,94 126,88 T130,78" fill="none" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" className="animate-pulse" />

            {/* Tay Chibi nâng chén trà */}
            <path d="M78,92 Q94,98 106,98" stroke={skinTone} strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx="108" cy="98" r="4.5" fill={skinTone} stroke="#fb923c" strokeWidth="1" />

            {/* Cổ & Đầu */}
            <rect x="65" y="62" width="10" height="14" fill={skinTone} rx="3" />
            <circle cx="70" cy="50" r="27" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />

            <g transform="translate(-10, 0)">
              {renderHair()}
              {renderFace('smile')}
            </g>
          </svg>
        )}

        {/* =========================================================
            4. POSE: MEDITATING (TỌA THIỀN KIẾT GIÀ TRÊN BỒ ĐOÀN)
            ========================================================= */}
        {pose === 'meditating' && (
          <svg viewBox="0 0 160 160" className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-2xl overflow-visible">
            <defs>
              <radialGradient id="chibiZenAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="80" cy="52" r="42" fill="url(#chibiZenAura)" className="animate-pulse" />
            <ellipse cx="80" cy="138" rx="54" ry="16" fill="#78350f" stroke="#b45309" strokeWidth="2" />

            {/* Chân xếp bằng */}
            <ellipse cx="80" cy="124" rx="45" ry="14" fill={pantsColor} stroke={pantsShade} strokeWidth="2" />

            {/* Thân áo sơ mi */}
            <path d="M56,76 Q80,72 104,76 L110,118 Q80,122 50,118 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="2" />
            <path d="M68,75 L80,90 L92,75" fill="none" stroke={palette.collar} strokeWidth="2.5" />

            {/* Bàn tay Chibi bắt ấn thiền định */}
            <ellipse cx="80" cy="106" rx="14" ry="7" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />

            {/* Cổ & Đầu */}
            <rect x="74" y="60" width="12" height="14" fill={skinTone} rx="4" />
            <circle cx="80" cy="50" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />

            {renderHair()}
            {renderFace('meditate')}
          </svg>
        )}

        {/* =========================================================
            5. POSE: CHOPPING (VUNG RÌU BỔ CỦI)
            ========================================================= */}
        {pose === 'chopping' && (
          <svg viewBox="0 0 160 200" className="w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible">
            <ellipse cx="80" cy="189" rx="42" ry="7" fill="rgba(0,0,0,0.35)" />
            {renderShoes()}

            <path d="M58,134 L72,134 L71,178 L59,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M88,134 L102,134 L101,178 L89,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M56,124 L104,124 L102,142 L80,146 L58,142 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />

            <path d="M56,86 L104,86 L102,122 L58,122 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />

            {/* Rìu bổ củi */}
            <g id="chibi-axe">
              <line x1="86" y1="88" x2="114" y2="34" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M114,34 L128,24 L132,42 L116,40 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
              <circle cx="94" cy="74" r="5" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
              <circle cx="104" cy="54" r="5" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            </g>

            <rect x="74" y="66" width="12" height="14" fill={skinTone} rx="3" />
            <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            {renderHair()}
            {renderFace('smile')}
          </svg>
        )}

        {/* =========================================================
            6. POSE: CARRYING (GÁNH NƯỚC SUỐI TIÊN)
            ========================================================= */}
        {pose === 'carrying' && (
          <svg viewBox="0 0 170 200" className="w-44 h-50 sm:w-52 sm:h-60 drop-shadow-2xl overflow-visible">
            <ellipse cx="85" cy="189" rx="46" ry="7" fill="rgba(0,0,0,0.35)" />
            <g transform="translate(5, 0)">{renderShoes()}</g>

            <g transform="translate(5, 0)">
              <path d="M58,134 L72,134 L71,178 L59,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
              <path d="M88,134 L102,134 L101,178 L89,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
              <path d="M56,124 L104,124 L102,142 L80,146 L58,142 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
              <path d="M56,86 L104,86 L102,122 L58,122 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />
            </g>

            {/* Đòn gánh tre uốn cong */}
            <path d="M12,78 Q85,64 158,78" fill="none" stroke="#ca8a04" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="22" y1="76" x2="22" y2="124" stroke="#a16207" strokeWidth="1.5" />
            <rect x="10" y="124" width="24" height="22" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
            <ellipse cx="22" cy="124" rx="12" ry="4" fill="#0284c7" />

            <line x1="148" y1="76" x2="148" y2="124" stroke="#a16207" strokeWidth="1.5" />
            <rect x="136" y="124" width="24" height="22" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
            <ellipse cx="148" cy="124" rx="12" ry="4" fill="#0284c7" />

            <circle cx="73" cy="74" r="5" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            <circle cx="107" cy="74" r="5" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />

            <rect x="79" y="66" width="12" height="14" fill={skinTone} rx="3" />
            <circle cx="85" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            <g transform="translate(5, 0)">
              {renderHair()}
              {renderFace('smile')}
            </g>
          </svg>
        )}

        {/* =========================================================
            7. POSE: CLEANING (LAU CHÙI BÀN THỜ PHẬT)
            ========================================================= */}
        {pose === 'cleaning' && (
          <svg viewBox="0 0 160 200" className="w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible">
            <ellipse cx="80" cy="189" rx="42" ry="7" fill="rgba(0,0,0,0.35)" />
            {renderShoes()}

            <path d="M58,134 L72,134 L71,178 L59,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M88,134 L102,134 L101,178 L89,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M56,124 L104,124 L102,142 L80,146 L58,142 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M56,86 L104,86 L102,122 L58,122 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />

            {/* Tay cầm khăn lau bàn thờ */}
            <path d="M104,90 Q120,84 126,72" stroke={skinTone} strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <ellipse cx="132" cy="68" rx="8" ry="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            <circle cx="140" cy="58" r="2.5" fill="#fde047" className="animate-ping" />

            <rect x="74" y="66" width="12" height="14" fill={skinTone} rx="3" />
            <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            {renderHair()}
            {renderFace('smile')}
          </svg>
        )}

        {/* =========================================================
            8. POSE: CHARITY (NÂNG BÁT CƠM CHAY TỪ THIỆN)
            ========================================================= */}
        {pose === 'charity' && (
          <svg viewBox="0 0 160 200" className="w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible">
            <ellipse cx="80" cy="189" rx="42" ry="7" fill="rgba(0,0,0,0.35)" />
            {renderShoes()}

            <path d="M58,134 L72,134 L71,178 L59,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M88,134 L102,134 L101,178 L89,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M56,124 L104,124 L102,142 L80,146 L58,142 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M56,86 L104,86 L102,122 L58,122 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />

            {/* Bát cháo thơm ấm nóng */}
            <ellipse cx="80" cy="98" rx="14" ry="7" fill="#d97706" stroke="#92400e" strokeWidth="1.2" />
            <ellipse cx="80" cy="96" rx="12" ry="4" fill="#fef3c7" />
            <path d="M80,90 Q82,82 78,76 T82,68" fill="none" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" className="animate-pulse" />

            <circle cx="68" cy="98" r="4.5" fill={skinTone} stroke="#fb923c" strokeWidth="1" />
            <circle cx="92" cy="98" r="4.5" fill={skinTone} stroke="#fb923c" strokeWidth="1" />

            <rect x="74" y="66" width="12" height="14" fill={skinTone} rx="3" />
            <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            {renderHair()}
            {renderFace('smile')}
          </svg>
        )}

        {/* =========================================================
            9. POSE: CALLIGRAPHY (CẦM BÚT LÔNG VIẾT THƯ PHÁP)
            ========================================================= */}
        {pose === 'calligraphy' && (
          <svg viewBox="0 0 160 200" className="w-40 h-50 sm:w-48 sm:h-60 drop-shadow-2xl overflow-visible">
            <ellipse cx="80" cy="189" rx="42" ry="7" fill="rgba(0,0,0,0.35)" />
            {renderShoes()}

            <path d="M58,134 L72,134 L71,178 L59,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M88,134 L102,134 L101,178 L89,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M56,124 L104,124 L102,142 L80,146 L58,142 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
            <path d="M56,86 L104,86 L102,122 L58,122 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />

            {/* Bút lông thư pháp cán trúc */}
            <line x1="114" y1="92" x2="114" y2="124" stroke="#78350f" strokeWidth="3.2" strokeLinecap="round" />
            <polygon points="112,124 116,124 114,132" fill="#1c1917" />
            <circle cx="114" cy="106" r="4.5" fill={skinTone} stroke="#fb923c" strokeWidth="1" />

            <rect x="74" y="66" width="12" height="14" fill={skinTone} rx="3" />
            <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            {renderHair()}
            {renderFace('smile')}
          </svg>
        )}

      </div>
    </div>
  );
};
