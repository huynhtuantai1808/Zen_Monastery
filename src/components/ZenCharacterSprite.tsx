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
// Bảng màu Pháp phục Phật tử (Đồ Lam, Nâu Sồng, Xám Khói, Bạch Y) chuẩn Concept Art Chibi Buddhist Outfit
const SHIRT_PALETTES: Record<
  RobeColorType,
  {
    maleShirt: string;
    maleShirtShade: string;
    maleShirtHighlight: string;
    femaleShirt: string;
    femaleShirtShade: string;
    femaleShirtHighlight: string;
    pantsColor: string;
    pantsShade: string;
    collar: string;
    buttonColor: string;
    name: string;
  }
> = {
  lam: {
    maleShirt: '#8ea3b7', // Sắc lam tro truyền thống chuẩn thiết kế Chibi Đồ Lam Phật Tử
    maleShirtShade: '#72879c',
    maleShirtHighlight: '#a8bbcb',
    femaleShirt: '#8ea3b7', // Áo tràng lam dáng dài thêu hoa sen
    femaleShirtShade: '#72879c',
    femaleShirtHighlight: '#a8bbcb',
    pantsColor: '#7a8f9f',
    pantsShade: '#627685',
    collar: '#7e93a7',
    buttonColor: '#334155',
    name: 'Đồ Lam Phật Tử',
  },
  nau: {
    maleShirt: '#a86a45', // Nâu sồng trầm ấm mộc mạc
    maleShirtShade: '#8b4e2b',
    maleShirtHighlight: '#c48661',
    femaleShirt: '#a86a45',
    femaleShirtShade: '#8b4e2b',
    femaleShirtHighlight: '#c48661',
    pantsColor: '#935632',
    pantsShade: '#703a19',
    collar: '#965834',
    buttonColor: '#451a03',
    name: 'Nâu Sồng Thiền Môn',
  },
  xam: {
    maleShirt: '#94a3b8', // Xám khói thanh tịnh
    maleShirtShade: '#64748b',
    femaleShirt: '#94a3b8',
    femaleShirtShade: '#64748b',
    collar: '#788494',
    buttonColor: '#1e293b',
    pantsColor: '#788494',
    pantsShade: '#576271',
    maleShirtHighlight: '#cbd5e1',
    femaleShirtHighlight: '#cbd5e1',
    name: 'Xám Khói Thiền Tịnh',
  },
  bach: {
    maleShirt: '#f8fafc', // Bạch y thuần khiết
    maleShirtShade: '#e2e8f0',
    femaleShirt: '#f8fafc',
    femaleShirtShade: '#e2e8f0',
    collar: '#e2e8f0',
    buttonColor: '#475569',
    pantsColor: '#e2e8f0',
    pantsShade: '#cbd5e1',
    maleShirtHighlight: '#ffffff',
    femaleShirtHighlight: '#ffffff',
    name: 'Bạch Y Thuần Khiết',
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
  const shirtHighlight = isFemale ? palette.femaleShirtHighlight : palette.maleShirtHighlight;
  const pantsColor = palette.pantsColor;
  const pantsShade = palette.pantsShade;
  const buttonColor = palette.buttonColor;

  const hairColor = '#3f2e24'; // Tóc nâu tự nhiên chuẩn concept Chibi
  const hairHighlight = '#5c4033';
  const skinTone = '#ffedd5'; // Da sáng mịn
  const skinShade = '#fed7aa';

  // ==========================================
  // 1. VẼ MÁI TÓC CHIBI THEO ĐÚNG CONCEPT ART & TÙY BIẾN
  // ==========================================
  const renderHair = () => {
    // 1. QUY Y CẠO ĐẦU: Nhẵn bóng + 3 Chấm Giới Hương trên trán
    if (character.hairStyle === 'shaved') {
      return (
        <g id="shaved-head-hair">
          {/* 3 Chấm Giới Hương thiền môn thẳng hàng trên trán */}
          <circle cx="80" cy="36" r="1.8" fill="#d97706" />
          <circle cx="80" cy="41" r="1.8" fill="#d97706" />
          <circle cx="80" cy="46" r="1.8" fill="#d97706" />
        </g>
      );
    }

    // 2. NỮ CƯ SĨ
    if (isFemale) {
      if (character.hairStyle === 'short') {
        // NỮ: Tóc ngắn Bob ôm gò má thanh tú dễ thương
        return (
          <g id="female-chibi-short-hair">
            {/* Khối tóc bồng bềnh ôm đầu */}
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
            {/* Tóc mái rẽ ngôi nhẹ */}
            <path
              d="M52,48 C58,38 70,36 76,46 C78,42 85,38 98,44 C106,48 108,54 108,54 C100,34 88,32 78,38 C68,32 58,36 52,48 Z"
              fill={hairColor}
            />
            {/* Tóc bob ngắn cụp ôm hai bên má */}
            <path
              d="M49,52 C44,66 46,78 54,84 C50,74 48,64 54,52 Z"
              fill={hairColor}
            />
            <path
              d="M111,52 C116,66 114,78 106,84 C110,74 112,64 106,52 Z"
              fill={hairColor}
            />
          </g>
        );
      }

      // NỮ: Tóc đuôi ngựa cao gợn sóng (mặc định / bun)
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
          <ellipse cx="94" cy="38" rx="5" ry="4" fill="#f43f5e" />

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

    // 3. NAM CƯ SĨ
    if (character.hairStyle === 'bun') {
      // NAM: Búi tóc thiền môn / võ sĩ truyền thống
      return (
        <g id="male-chibi-bun-hair">
          {/* Búi tóc trên đỉnh đầu */}
          <circle cx="80" cy="14" r="8" fill={hairColor} />
          {/* Dây buộc tóc */}
          <rect x="74" y="18" width="12" height="4" fill="#1e293b" rx="1" />
          {/* Trâm cài gỗ / vàng xuyên ngang */}
          <line x1="68" y1="14" x2="92" y2="14" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />

          {/* Khối tóc ôm đầu */}
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
          {/* Tóc mái gọn gàng để lộ trán */}
          <path
            d="M52,48 Q64,50 72,44 Q80,50 88,44 Q96,50 108,48 Q106,36 80,34 Q54,36 52,48 Z"
            fill={hairColor}
          />
          {/* Tóc mai hai bên tai */}
          <path d="M52,46 Q50,58 55,64 Q53,56 56,50 Z" fill={hairColor} />
          <path d="M108,46 Q110,58 105,64 Q107,56 104,50 Z" fill={hairColor} />
        </g>
      );
    }

    // NAM: Tóc ngắn spiky tỉa layer, các lọn tóc vểnh năng động (như hình mẫu)
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
  // 1.4. VẼ HOA SEN VÀNG THÊU TRÊN NGỰC ÁO LAM NỮ
  // ==========================================
  const renderLotusEmbroidery = (cx: number, cy: number, scaleFactor = 1) => (
    <g transform={`translate(${cx}, ${cy}) scale(${scaleFactor})`} id="lotus-embroidery">
      {/* Cánh sen trung tâm vươn cao */}
      <path d="M0,-8 C-2.5,-3 -2,2 0,4 C2,2 2.5,-3 0,-8 Z" fill="#fef08a" stroke="#d97706" strokeWidth="0.7" />
      {/* Hai cánh sen nở bên */}
      <path d="M-1.5,1 C-6,-2 -7,-6 -5,-7 C-3,-4 -2,-1 -1.5,1 Z" fill="#fef9c3" stroke="#d97706" strokeWidth="0.7" />
      <path d="M1.5,1 C6,-2 7,-6 5,-7 C3,-4 2,-1 1.5,1 Z" fill="#fef9c3" stroke="#d97706" strokeWidth="0.7" />
      {/* Hai cánh sen nở dưới */}
      <path d="M-2,2 C-7,1 -9,-2 -8,-4 C-5,-2 -3,0 -2,2 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.6" />
      <path d="M2,2 C7,1 9,-2 8,-4 C5,-2 3,0 2,2 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.6" />
      {/* Nhụy sen vàng ấm */}
      <circle cx="0" cy="1" r="1.2" fill="#f59e0b" />
    </g>
  );

  // ==========================================
  // 1.5. VẼ PHÁP BẢO PHỤ KIỆN TÙY THÂN
  // ==========================================
  const renderAccessory = () => {
    if (character.accessory === 'beads') {
      return (
        <g id="chibi-accessory-beads">
          {/* Chuỗi 18 hạt bồ đề đeo quanh cổ rủ xuống ngực áo */}
          <ellipse cx="80" cy="88" rx="14" ry="10" fill="none" stroke="#78350f" strokeWidth="3" strokeDasharray="2,3" />
          <circle cx="80" cy="99" r="2.8" fill="#b45309" stroke="#451a03" strokeWidth="0.8" />
          <line x1="80" y1="101" x2="80" y2="110" stroke="#eab308" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    }
    if (character.accessory === 'bag') {
      // TÚI VẢI THIỀN CHỮ "AN" / HOA SEN (Chuẩn mẫu thiết kế Đồ Lam Phật Tử)
      if (isFemale) {
        // Nữ: Túi vải nâu thêu đóa Hoa Sen vàng rủ bên hông
        return (
          <g id="chibi-accessory-bag-female">
            <path d="M68,82 Q80,105 106,125" fill="none" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M98,122 C94,122 92,130 94,142 C96,150 114,150 116,142 C118,130 116,122 112,122 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
            {renderLotusEmbroidery(105, 136, 0.75)}
          </g>
        );
      }
      // Nam: Túi vải lam chữ "An" thanh đạm đeo chéo vai
      return (
        <g id="chibi-accessory-bag-male">
          <path d="M66,82 Q80,105 106,125" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <path d="M98,122 C94,122 92,130 94,142 C96,150 114,150 116,142 C118,130 116,122 112,122 Z" fill="#64748b" stroke="#334155" strokeWidth="1.2" />
          <text x="105" y="138" textAnchor="middle" fontSize="9" fontFamily="serif" fontStyle="italic" fontWeight="bold" fill="#ffffff" opacity="0.95">An</text>
        </g>
      );
    }
    if (character.accessory === 'hat') {
      return (
        <g id="chibi-accessory-hat">
          {/* Nón lá mộc mạc đeo sau lưng */}
          <ellipse cx="80" cy="104" rx="22" ry="15" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
          <ellipse cx="80" cy="104" rx="16" ry="11" fill="#fef9c3" stroke="#eab308" strokeWidth="0.8" />
          <circle cx="80" cy="104" r="3" fill="#ca8a04" />
          <path d="M70,86 Q80,96 90,86" fill="none" stroke="#64748b" strokeWidth="1.5" />
        </g>
      );
    }
    return null;
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
      // Nữ: Giày lười vải đen/than Phật tử thanh mảnh đế bằng (Chuẩn mẫu thiết kế Đồ Lam Nữ)
      return (
        <g id="female-buddhist-shoes">
          {/* Giày trái */}
          <ellipse cx="64" cy="184" rx="8" ry="4.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
          <ellipse cx="64" cy="183" rx="5.5" ry="2.2" fill="#334155" />
          <line x1="56" y1="185" x2="72" y2="185" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Giày phải */}
          <ellipse cx="96" cy="184" rx="8" ry="4.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
          <ellipse cx="96" cy="183" rx="5.5" ry="2.2" fill="#334155" />
          <line x1="88" y1="185" x2="104" y2="185" stroke="#94a3b8" strokeWidth="0.8" />
        </g>
      );
    }

    // Nam: Giày vải đen Phật tử đế bệt viền trắng (Kung-fu monk shoes)
    return (
      <g id="male-buddhist-shoes">
        {/* Giày trái */}
        <ellipse cx="64" cy="184" rx="9.5" ry="5.2" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
        <ellipse cx="64" cy="183" rx="7" ry="2.8" fill="#334155" />
        <line x1="55" y1="185" x2="73" y2="185" stroke="#e2e8f0" strokeWidth="1.4" strokeLinecap="round" />

        {/* Giày phải */}
        <ellipse cx="96" cy="184" rx="9.5" ry="5.2" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
        <ellipse cx="96" cy="183" rx="7" ry="2.8" fill="#334155" />
        <line x1="87" y1="185" x2="105" y2="185" stroke="#e2e8f0" strokeWidth="1.4" strokeLinecap="round" />
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

            {/* Giày Phật tử */}
            {renderShoes()}

            {/* Quần Phật tử (Pants) */}
            <g id="buddhist-pants">
              {isFemale ? (
                /* NỮ: Quần lụa lam suông rộng rãi lộ ra từ tà áo xẻ */
                <>
                  <path d="M54,142 L68,142 L66,180 L54,180 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.2" />
                  <path d="M92,142 L106,142 L106,180 L94,180 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.2" />
                </>
              ) : (
                /* NAM: Quần lam Phật tử ống suông thoải mái */
                <>
                  <path d="M58,128 L72,128 L70,178 L58,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
                  <path d="M88,128 L102,128 L102,178 L90,178 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.5" />
                  <path d="M56,120 L104,120 L102,136 L80,140 L58,136 Z" fill={pantsColor} stroke={pantsShade} strokeWidth="1.2" />
                  <line x1="80" y1="122" x2="80" y2="136" stroke={pantsShade} strokeWidth="1" />
                </>
              )}
            </g>

            {/* Thân Áo Lam Phật Tử (Buddhist Tunic) */}
            {isFemale ? (
              /* NỮ: ÁO TRÀNG LAM DÁNG DÀI THƯỚT THA XẺ TÀ HÔNG + HOA SEN THÊU */
              <g id="female-buddhist-robe">
                {/* Tà áo dài trước buông qua gối, xẻ tà hai bên eo */}
                <path
                  d="M58,84 L102,84 L100,120 L105,166 L55,166 L60,120 Z"
                  fill={shirtColor}
                  stroke={shirtShade}
                  strokeWidth="1.6"
                />
                {/* Đường xẻ tà hai bên hông mềm mại */}
                <path d="M60,120 L55,166" stroke={shirtShade} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M100,120 L105,166" stroke={shirtShade} strokeWidth="1.5" strokeLinecap="round" />

                {/* Nếp gấp vải tà áo thướt tha */}
                <path d="M72,122 L70,166" stroke={shirtShade} strokeWidth="0.8" opacity="0.6" />
                <path d="M88,122 L90,166" stroke={shirtShade} strokeWidth="0.8" opacity="0.6" />

                {/* HOA SEN VÀNG THÊU TRÊN NGỰC ÁO LAM NỮ (Lotus Embroidery) */}
                {renderLotusEmbroidery(93, 98, 1.15)}

                {/* Cổ áo tròn ôm khít (Mandarin collar) */}
                <rect x="73" y="78" width="14" height="7" rx="3.5" fill={shirtColor} stroke={shirtShade} strokeWidth="1.2" />
                <circle cx="80" cy="85" r="1.5" fill={buttonColor} />

                {/* 2 Khuy cài vải đôi chéo sang vai phải */}
                <line x1="78" y1="86" x2="88" y2="90" stroke={shirtShade} strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="88" cy="90" r="1.5" fill={buttonColor} />
                <line x1="78" y1="91" x2="86" y2="95" stroke={shirtShade} strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="86" cy="95" r="1.5" fill={buttonColor} />
              </g>
            ) : (
              /* NAM: ÁO LAM PHẬT TỬ CỔ TÀU, KHUY VẢI CHÉO, BUÔNG NGOÀI QUẦN XẺ TÀ */
              <g id="male-buddhist-robe">
                {/* Thân áo buông qua hông, xẻ tà ngắn hai bên */}
                <path
                  d="M56,84 L104,84 L104,130 L56,130 Z"
                  fill={shirtColor}
                  stroke={shirtShade}
                  strokeWidth="1.8"
                />
                {/* Xẻ tà hai bên hông */}
                <line x1="56" y1="122" x2="56" y2="130" stroke={shirtShade} strokeWidth="2" />
                <line x1="104" y1="122" x2="104" y2="130" stroke={shirtShade} strokeWidth="2" />
                <line x1="56" y1="130" x2="104" y2="130" stroke={shirtShade} strokeWidth="1.4" />

                {/* Cổ đứng tròn ôm cổ (Mandarin collar) */}
                <rect x="73" y="77" width="14" height="8" rx="4" fill={shirtColor} stroke={shirtShade} strokeWidth="1.2" />
                <circle cx="80" cy="85" r="1.8" fill={buttonColor} />

                {/* 2 Khuy cài vải chéo lệch sang vai phải đặc trưng áo Phật tử */}
                <line x1="80" y1="87" x2="94" y2="92" stroke={shirtShade} strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="94" cy="92" r="1.8" fill={buttonColor} />
                <circle cx="97" cy="92" r="1.3" fill={shirtHighlight} />

                <line x1="80" y1="94" x2="92" y2="99" stroke={shirtShade} strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="92" cy="99" r="1.8" fill={buttonColor} />
                <circle cx="95" cy="99" r="1.3" fill={shirtHighlight} />

                {/* Nẹp vạt áo chéo nhẹ */}
                <path d="M80,85 L80,130" stroke={shirtShade} strokeWidth="1.2" opacity="0.6" />
              </g>
            )}

            {/* Tay áo & Cánh tay */}
            {isFemale ? (
              /* NỮ: Tay trái nâng chuỗi 18 hạt bồ đề niệm Phật, tay phải buông nhẹ */
              <g id="female-buddhist-arms">
                {/* Tay phải buông nhẹ, xắn gập nhẹ cổ tay áo */}
                <path d="M58,86 L46,110" stroke={shirtColor} strokeWidth="7" strokeLinecap="round" />
                <rect x="42" y="106" width="7" height="4" fill={shirtHighlight} rx="1" transform="rotate(25 42 106)" />
                <path d="M45,110 L41,126" stroke={skinTone} strokeWidth="4.5" strokeLinecap="round" />
                <circle cx="41" cy="126" r="3.2" fill={skinTone} />

                {/* Tay trái đưa lên ngang ngực NÂNG CHUỖI HẠT BỒ ĐỀ NIỆM PHẬT */}
                <path d="M102,86 L116,98" stroke={shirtColor} strokeWidth="7" strokeLinecap="round" />
                <rect x="112" y="96" width="7" height="4" fill={shirtHighlight} rx="1" transform="rotate(-30 112 96)" />
                <path d="M116,98 L118,90" stroke={skinTone} strokeWidth="4.5" strokeLinecap="round" />
                <circle cx="118" cy="88" r="3.8" fill={skinTone} />

                {/* CHUỖI 18 HẠT BỒ ĐỀ TREO TỪ TAY CÓ TUA RUA (Prayer Rosary Beads) */}
                <ellipse cx="120" cy="100" rx="7" ry="11" fill="none" stroke="#78350f" strokeWidth="2.5" strokeDasharray="1.5,2.5" />
                <circle cx="120" cy="111" r="2.2" fill="#b45309" stroke="#451a03" strokeWidth="0.6" />
                <line x1="120" y1="113" x2="120" y2="124" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="120" cy="124" r="1" fill="#ea580c" />
              </g>
            ) : (
              /* NAM: Tay phải chắp nửa ấn trang nghiêm có vòng chuỗi hạt, tay trái chống hông có vòng chuỗi hạt */
              <g id="male-buddhist-arms">
                {/* Tay phải co lên ngực chắp chào chánh niệm */}
                <path d="M58,86 L50,102" stroke={shirtColor} strokeWidth="8" strokeLinecap="round" />
                <path d="M50,102 L74,96" stroke={shirtColor} strokeWidth="7.5" strokeLinecap="round" />
                <rect x="68" y="94" width="5" height="7" fill={shirtHighlight} rx="1" transform="rotate(-15 68 94)" />

                {/* Bàn tay phải chắp đứng ngón trang nghiêm */}
                <polygon points="74,96 82,96 78,82" fill={skinTone} stroke="#ea580c" strokeWidth="0.6" />
                {/* Vòng chuỗi hạt bồ đề ôm quanh cổ tay phải */}
                <circle cx="71" cy="93" r="1.7" fill="#78350f" />
                <circle cx="73" cy="95" r="1.7" fill="#92400e" />
                <circle cx="73" cy="98" r="1.7" fill="#78350f" />
                <circle cx="71" cy="100" r="1.7" fill="#92400e" />

                {/* Tay trái chống hông tự tin */}
                <path d="M102,86 L116,102" stroke={shirtColor} strokeWidth="8" strokeLinecap="round" />
                <rect x="112" y="99" width="8" height="4" fill={shirtHighlight} rx="1" transform="rotate(-40 112 99)" />
                <path d="M116,102 L104,116" stroke={skinTone} strokeWidth="5.5" strokeLinecap="round" />
                <ellipse cx="104" cy="116" rx="4.5" ry="3.5" fill={skinTone} stroke="#ea580c" strokeWidth="0.8" />
                {/* Vòng chuỗi hạt ôm cổ tay trái */}
                <circle cx="109" cy="110" r="1.7" fill="#78350f" />
                <circle cx="107" cy="112" r="1.7" fill="#92400e" />
                <circle cx="105" cy="114" r="1.7" fill="#78350f" />
              </g>
            )}

            {/* Cổ & Đầu Chibi to tròn đáng yêu */}
            <rect x="74" y="66" width="12" height="14" fill={skinShade} rx="3" />
            <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />

            {/* Pháp bảo tùy thân, Mái tóc & Ngũ quan */}
            {renderAccessory()}
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
              
              {/* Thân áo sơ mi */}
              <path d="M56,86 L104,86 L102,126 L58,126 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />
              <rect x="74" y="78" width="12" height="7" rx="3.5" fill={shirtColor} stroke={shirtShade} strokeWidth="1" />
              <circle cx="80" cy="85" r="1.5" fill={buttonColor} />
              {isFemale && renderLotusEmbroidery(92, 102, 0.9)}
              <rect x="74" y="78" width="12" height="7" rx="3.5" fill={shirtColor} stroke={shirtShade} strokeWidth="1" /><circle cx="80" cy="85" r="1.5" fill={buttonColor} />

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
              {renderAccessory()}
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
              {renderAccessory()}
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
            <rect x="74" y="73" width="12" height="6" rx="3" fill={shirtColor} stroke={shirtShade} strokeWidth="1" /><circle cx="80" cy="79" r="1.5" fill={buttonColor} />
            {isFemale && renderLotusEmbroidery(94, 96, 0.85)}

            {/* Bàn tay Chibi bắt ấn thiền định */}
            <ellipse cx="80" cy="106" rx="14" ry="7" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />

            {/* Cổ & Đầu */}
            <rect x="74" y="60" width="12" height="14" fill={skinTone} rx="4" />
            <circle cx="80" cy="50" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />

            {renderAccessory()}
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

            <path d="M56,86 L104,86 L102,126 L58,126 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />
              <rect x="74" y="78" width="12" height="7" rx="3.5" fill={shirtColor} stroke={shirtShade} strokeWidth="1" />
              <circle cx="80" cy="85" r="1.5" fill={buttonColor} />
              {isFemale && renderLotusEmbroidery(92, 102, 0.9)}

            {/* Rìu bổ củi */}
            <g id="chibi-axe">
              <line x1="86" y1="88" x2="114" y2="34" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M114,34 L128,24 L132,42 L116,40 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
              <circle cx="94" cy="74" r="5" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
              <circle cx="104" cy="54" r="5" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            </g>

            <rect x="74" y="66" width="12" height="14" fill={skinTone} rx="3" />
            <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            {renderAccessory()}
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
              <path d="M56,86 L104,86 L102,126 L58,126 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />
              <rect x="74" y="78" width="12" height="7" rx="3.5" fill={shirtColor} stroke={shirtShade} strokeWidth="1" />
              <circle cx="80" cy="85" r="1.5" fill={buttonColor} />
              {isFemale && renderLotusEmbroidery(92, 102, 0.9)}
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
              {renderAccessory()}
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
            <path d="M56,86 L104,86 L102,126 L58,126 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />
              <rect x="74" y="78" width="12" height="7" rx="3.5" fill={shirtColor} stroke={shirtShade} strokeWidth="1" />
              <circle cx="80" cy="85" r="1.5" fill={buttonColor} />
              {isFemale && renderLotusEmbroidery(92, 102, 0.9)}

            {/* Tay cầm khăn lau bàn thờ */}
            <path d="M104,90 Q120,84 126,72" stroke={skinTone} strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <ellipse cx="132" cy="68" rx="8" ry="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            <circle cx="140" cy="58" r="2.5" fill="#fde047" className="animate-ping" />

            <rect x="74" y="66" width="12" height="14" fill={skinTone} rx="3" />
            <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            {renderAccessory()}
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
            <path d="M56,86 L104,86 L102,126 L58,126 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />
              <rect x="74" y="78" width="12" height="7" rx="3.5" fill={shirtColor} stroke={shirtShade} strokeWidth="1" />
              <circle cx="80" cy="85" r="1.5" fill={buttonColor} />
              {isFemale && renderLotusEmbroidery(92, 102, 0.9)}

            {/* Bát cháo thơm ấm nóng */}
            <ellipse cx="80" cy="98" rx="14" ry="7" fill="#d97706" stroke="#92400e" strokeWidth="1.2" />
            <ellipse cx="80" cy="96" rx="12" ry="4" fill="#fef3c7" />
            <path d="M80,90 Q82,82 78,76 T82,68" fill="none" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" className="animate-pulse" />

            <circle cx="68" cy="98" r="4.5" fill={skinTone} stroke="#fb923c" strokeWidth="1" />
            <circle cx="92" cy="98" r="4.5" fill={skinTone} stroke="#fb923c" strokeWidth="1" />

            <rect x="74" y="66" width="12" height="14" fill={skinTone} rx="3" />
            <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            {renderAccessory()}
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
            <path d="M56,86 L104,86 L102,126 L58,126 Z" fill={shirtColor} stroke={shirtShade} strokeWidth="1.8" />
              <rect x="74" y="78" width="12" height="7" rx="3.5" fill={shirtColor} stroke={shirtShade} strokeWidth="1" />
              <circle cx="80" cy="85" r="1.5" fill={buttonColor} />
              {isFemale && renderLotusEmbroidery(92, 102, 0.9)}

            {/* Bút lông thư pháp cán trúc */}
            <line x1="114" y1="92" x2="114" y2="124" stroke="#78350f" strokeWidth="3.2" strokeLinecap="round" />
            <polygon points="112,124 116,124 114,132" fill="#1c1917" />
            <circle cx="114" cy="106" r="4.5" fill={skinTone} stroke="#fb923c" strokeWidth="1" />

            <rect x="74" y="66" width="12" height="14" fill={skinTone} rx="3" />
            <circle cx="80" cy="54" r="28" fill={skinTone} stroke="#fb923c" strokeWidth="1.2" />
            {renderAccessory()}
            {renderHair()}
            {renderFace('smile')}
          </svg>
        )}

      </div>
    </div>
  );
};
