export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type WeatherType = 'sunny' | 'misty' | 'rainy';

export type GraphicsQuality = 'LOW' | 'HIGH';

export type ZoneId = 'sanChua' | 'vuonTra' | 'chanhDien' | 'hoLienHoa' | 'nhaBep' | 'tangKinhCac';

export type GenderType = 'male' | 'female';

export type RobeColorType = 'lam' | 'nau' | 'xam' | 'bach';

export type HairStyleType = 'short' | 'bun' | 'shaved';

export type AccessoryType = 'beads' | 'bag' | 'hat' | 'none';

export interface CharacterAppearance {
  name: string;
  gender: GenderType;
  robeColor: RobeColorType;
  hairStyle: HairStyleType;
  accessory: AccessoryType;
}

export interface ZoneInfo {
  id: ZoneId;
  name: string;
  subtitle: string;
  minLevel: number;
  description: string;
  bgGradient: string;
}

export interface PlayerStats {
  congDuc: number;       // Phước Báu (EXP)
  maxCongDucForLevel: number;
  level: number;         // Cấp độ tâm cảnh (1 - 35)
  title: string;         // Danh hiệu (Người Tập Sự, Cư Sĩ Áo Lam, Bậc Tỉnh Thức, Tâm Bất Biến)
  tamLuc: number;        // Stamina (0 - 100)
  maxTamLuc: number;
  dinhLuc: number;       // Focus Buff (0 - 100)
  tamSangBuff: boolean;  // Buff "Tâm Sáng": +50% tốc độ, +30% Công Đức, giảm tiêu hao Tâm Lực
  buffDaysLeft: number;
  dayCount: number;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  currentZone: ZoneId;
  unlockedZones: ZoneId[];
  character: CharacterAppearance;
}

export interface JournalEntry {
  id: string;
  title: string;
  quote: string;
  meaning: string;
  unlockedAt: string;
  category: 'phap_thoai' | 'tam_canh' | 'triet_ly';
  artworkId: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  zone: ZoneId;
  rewardCongDuc: number;
  costTamLuc: number;
  completed: boolean;
  type: 'sweep' | 'tea' | 'listen' | 'meditate' | 'wood' | 'incense';
}

export interface GuestStory {
  id: number;
  name: string;
  avatar: string;
  burden: string;
  mood: string;
  bestTea: string;
  quote: string;
  choices: {
    text: string;
    isMindful: boolean;
    reply: string;
    merit: number;
  }[];
}

export interface DharmaOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
  quoteCollected?: string;
}

export interface BuddhistDharmaSession {
  id: number;
  sutraName: string;      // Tên kinh gốc (Kinh Phước Đức, Kinh Bát Đại Nhân Giác...)
  sutraChapter: string;   // Phẩm kinh / Bối cảnh
  paliName: string;       // Tên Phạn / Pāli
  title: string;          // Đề tài bài giảng
  story: string;          // Lời giảng thâm sâu của Thầy dựa trên kinh
  monkTeaching: string;   // Cốt lõi giáo lý
  question: string;       // Câu hỏi ngộ đạo
  options: DharmaOption[];
}

export interface DharmaStoryOption {
  text: string;
  isEnlightened: boolean;
  explanation: string;
}

export interface DharmaQuestion {
  id: string;
  title: string;
  story: string;
  monkTeaching: string;
  question: string;
  options: DharmaStoryOption[];
}
