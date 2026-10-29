import { create } from 'zustand';
import type { PlayerStats, ZoneId, ZoneInfo, Quest, JournalEntry, CharacterAppearance } from '../types/game';
import { soundEngine } from '../services/audioEngine';

export const ZONES: Record<ZoneId, ZoneInfo> = {
  sanChua: {
    id: 'sanChua',
    name: 'Sân Chùa Vân Ẩn',
    subtitle: 'Nơi cây đa rợp bóng, chuông gió ngân nga',
    minLevel: 1,
    description: 'Sân gạch cổ rêu phong, nơi chú tiểu thường quét lá đa và thắp nén tâm hương mỗi sớm.',
    bgGradient: 'from-amber-950/40 via-stone-900/60 to-stone-950',
  },
  nhaBep: {
    id: 'nhaBep',
    name: 'Nhà Bếp Hương Tích',
    subtitle: 'Khói lam chiều & cơm chay đạm bạc',
    minLevel: 1,
    description: 'Nơi chuẩn bị những bữa cơm chay đạm bạc, ấm cúng và thơm lừng hương gạo mới.',
    bgGradient: 'from-amber-900/30 via-stone-900/50 to-stone-950',
  },
  vuonTra: {
    id: 'vuonTra',
    name: 'Vườn Trà & Thảo Dược',
    subtitle: 'Sương sớm đọng trên búp trà xanh',
    minLevel: 6,
    description: 'Vườn trà tĩnh mịch nơi sườn núi, nơi hái những búp trà tươi để pha tiếp đãi khách hiền.',
    bgGradient: 'from-emerald-950/40 via-stone-900/60 to-stone-950',
  },
  hoLienHoa: {
    id: 'hoLienHoa',
    name: 'Hồ Sen Liên Hoa',
    subtitle: 'Hoa sen tỏa ngát & cá lội thong dong',
    minLevel: 6,
    description: 'Mặt nước phẳng lặng như gương sen nở ngát hương, nơi ngồi tĩnh tọa và phóng sinh tích phước.',
    bgGradient: 'from-teal-950/40 via-stone-900/60 to-stone-950',
  },
  chanhDien: {
    id: 'chanhDien',
    name: 'Chánh Điện Trang Nghiêm',
    subtitle: 'Khói trầm quyện tỏa, chuông mõ ngân vang',
    minLevel: 1,
    description: 'Chốn thiêng thanh tịnh, nơi Sư Thầy đăng đàn thuyết pháp và đại chúng cùng ngồi tĩnh tâm.',
    bgGradient: 'from-yellow-950/40 via-stone-900/70 to-stone-950',
  },
  tangKinhCac: {
    id: 'tangKinhCac',
    name: 'Tàng Kinh Các',
    subtitle: 'Kho tàng kinh điển ngàn năm',
    minLevel: 16,
    description: 'Nơi lưu giữ ngàn cuốn kinh sách cổ, nơi các bậc tỉnh thức đàm đạo và chép kinh rèn tâm.',
    bgGradient: 'from-purple-950/40 via-stone-900/60 to-stone-950',
  },
};

export const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: 'entry-1',
    title: 'Khởi Tâm Tu Học',
    quote: 'Bước vào cửa chùa, trút bỏ bụi trần. Tâm an vạn sự an.',
    meaning: 'Bài học đầu tiên khi đặt chân đến Chùa Vân Ẩn: tâm bất biến giữa dòng đời vạn biến.',
    unlockedAt: 'Ngày 1 - Sáng',
    category: 'phap_thoai',
    artworkId: 'gate',
  },
  {
    id: 'entry-2',
    title: 'Hơi Thở Chánh Niệm',
    quote: 'Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười.',
    meaning: 'Mỗi khi tạp niệm nổi lên, chỉ cần quay về nương tựa nơi hơi thở vào và ra.',
    unlockedAt: 'Ngày 1 - Tối',
    category: 'tam_canh',
    artworkId: 'breath',
  },
];

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q-sweep',
    title: 'Quét lá đa sân chùa',
    description: 'Gió sớm làm lá rụng đầy sân. Hãy cầm chổi tre quét sạch lá với tâm không vội vã.',
    zone: 'sanChua',
    rewardCongDuc: 35,
    costTamLuc: 15,
    completed: false,
    type: 'sweep',
  },
  {
    id: 'q-incense',
    title: 'Thắp nén tâm hương',
    description: 'Đứng trước lư hương đồng, tĩnh tâm hướng thiện và dâng nén hương thơm.',
    zone: 'sanChua',
    rewardCongDuc: 20,
    costTamLuc: 5,
    completed: false,
    type: 'incense',
  },
  {
    id: 'q-tea',
    title: 'Pha trà tiếp khách phương xa',
    description: 'Có một người khách mang nỗi ưu sầu tìm đến chùa. Hãy pha một ấm trà ấm lòng.',
    zone: 'vuonTra',
    rewardCongDuc: 50,
    costTamLuc: 20,
    completed: false,
    type: 'tea',
  },
  {
    id: 'q-meditate',
    title: 'Tĩnh tọa Chánh Điện',
    description: 'Ngồi ngay ngắn, buông xả tạp niệm và lắng nghe tiếng chuông mõ ngân nga.',
    zone: 'chanhDien',
    rewardCongDuc: 40,
    costTamLuc: 10,
    completed: false,
    type: 'meditate',
  },
];

export function getTitleForLevel(level: number): string {
  if (level >= 31) return 'Tâm Bất Biến';
  if (level >= 16) return 'Bậc Tỉnh Thức';
  if (level >= 6) return 'Cư Sĩ Áo Lam';
  return 'Người Tập Sự';
}

export function getMaxCongDuc(level: number): number {
  return 50 + (level - 1) * 40;
}

export interface GameState {
  // Stats
  stats: PlayerStats;
  quests: Quest[];
  journal: JournalEntry[];
  antiRushAlert: string | null;
  lastActionTime: number;
  clickStreak: number;
  activeModal: 'dialogue' | 'dharma' | 'breathing' | 'sweep' | 'tea' | 'journal' | 'map' | 'guest' | 'character' | null;

  // Actions
  addCongDuc: (amount: number, reason?: string) => void;
  spendTamLuc: (amount: number) => boolean;
  restoreTamLuc: (amount: number) => void;
  setDinhLuc: (amount: number) => void;
  updateCharacter: (char: CharacterAppearance) => void;
  triggerAntiRushCheck: () => boolean; // returns true if player was rushing
  advanceTimeOfDay: () => void;
  completeQuest: (id: string) => void;
  unlockJournalEntry: (entry: JournalEntry) => void;
  changeZone: (zone: ZoneId) => void;
  setModal: (modal: GameState['activeModal']) => void;
  activateTamSangBuff: () => void;
  resetGame: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'tinh_tam_son_tu_save_v1';

export const useGameStore = create<GameState>((set, get) => ({
  stats: {
    congDuc: 0,
    maxCongDucForLevel: 50,
    level: 1,
    title: 'Người Tập Sự',
    tamLuc: 100,
    maxTamLuc: 100,
    dinhLuc: 20,
    tamSangBuff: false,
    buffDaysLeft: 0,
    dayCount: 1,
    timeOfDay: 'morning',
    weather: 'sunny',
    currentZone: 'sanChua',
    unlockedZones: ['sanChua', 'nhaBep'],
    character: {
      name: 'Tuệ Minh',
      gender: 'male',
      robeColor: 'lam',
      hairStyle: 'short',
      accessory: 'beads',
    },
  },
  quests: INITIAL_QUESTS,
  journal: INITIAL_JOURNAL,
  antiRushAlert: null,
  lastActionTime: 0,
  clickStreak: 0,
  activeModal: null,

  updateCharacter: (character: CharacterAppearance) => {
    const { stats } = get();
    set({
      stats: {
        ...stats,
        character,
      },
    });
    get().saveToStorage();
  },

  addCongDuc: (amount: number) => {
    const { stats, unlockJournalEntry } = get();
    // Calculate buff multipliers
    let finalAmount = amount;
    if (stats.tamSangBuff) {
      finalAmount = Math.round(finalAmount * 1.3); // +30% from Tam Sang buff
    }
    if (stats.dinhLuc > 60) {
      finalAmount = Math.round(finalAmount * 1.5); // x1.5 from high Dinh Luc
    }

    let newCongDuc = stats.congDuc + finalAmount;
    let newLevel = stats.level;
    let newMax = stats.maxCongDucForLevel;
    let newTitle = stats.title;
    const newUnlocked = [...stats.unlockedZones];

    // Level up check
    while (newCongDuc >= newMax) {
      newCongDuc -= newMax;
      newLevel += 1;
      newMax = getMaxCongDuc(newLevel);
      newTitle = getTitleForLevel(newLevel);
      soundEngine.playEnlightenment();

      // Check zone unlocks
      if (newLevel >= 6 && !newUnlocked.includes('vuonTra')) {
        newUnlocked.push('vuonTra', 'hoLienHoa');
      }
      if (newLevel >= 16 && !newUnlocked.includes('tangKinhCac')) {
        newUnlocked.push('tangKinhCac');
      }

      // Add Journal entry on milestone
      if (newLevel === 6) {
        unlockJournalEntry({
          id: 'entry-milestone-6',
          title: 'Khoác Áo Lam',
          quote: 'Áo lam mộc mạc che thân, tâm từ rộng mở thương người thế gian.',
          meaning: 'Đạt danh hiệu Cư Sĩ Áo Lam, mở khóa Vườn Trà và Hồ Sen Liên Hoa.',
          unlockedAt: `Ngày ${stats.dayCount} - Cấp 6`,
          category: 'tam_canh',
          artworkId: 'robe',
        });
      }
    }

    set({
      stats: {
        ...stats,
        congDuc: newCongDuc,
        level: newLevel,
        maxCongDucForLevel: newMax,
        title: newTitle,
        unlockedZones: newUnlocked,
      },
    });

    get().saveToStorage();
  },

  spendTamLuc: (amount: number): boolean => {
    const { stats } = get();
    const effectiveAmount = stats.tamSangBuff ? Math.round(amount * 0.6) : amount;
    if (stats.tamLuc < effectiveAmount) {
      return false;
    }
    set({
      stats: {
        ...stats,
        tamLuc: Math.max(0, stats.tamLuc - effectiveAmount),
      },
    });
    get().saveToStorage();
    return true;
  },

  restoreTamLuc: (amount: number) => {
    const { stats } = get();
    set({
      stats: {
        ...stats,
        tamLuc: Math.min(stats.maxTamLuc, stats.tamLuc + amount),
      },
    });
    get().saveToStorage();
  },

  setDinhLuc: (amount: number) => {
    const { stats } = get();
    set({
      stats: {
        ...stats,
        dinhLuc: Math.min(100, Math.max(0, amount)),
      },
    });
    get().saveToStorage();
  },

  /**
   * Core Anti-Rush check:
   * Trừng phạt hành vi spam click / vội vã.
   * Yêu cầu điềm tĩnh, thao tác đúng nhịp!
   */
  triggerAntiRushCheck: (): boolean => {
    const now = Date.now();
    const { lastActionTime, clickStreak, stats } = get();
    const delta = now - lastActionTime;

    let newStreak = clickStreak;
    if (delta < 350) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    if (newStreak >= 4) {
      // Player is spamming/rushing!
      soundEngine.playAntiRushStumble();
      const penaltyDinhLuc = Math.max(0, stats.dinhLuc - 8);
      const quotes = [
        'Chậm lại một nhịp, thở sâu một hơi. Vội vã chỉ làm đục nước trong tâm.',
        'Người vội vã dễ trượt ngã trên bậc đá rêu phong. Hãy chánh niệm từng bước chân.',
        'Hoa sen nở đúng mùa, không thể giục giã. Tĩnh tâm làm việc mới trọn vẹn.',
      ];
      const alertMsg = quotes[Math.floor(Math.random() * quotes.length)];

      set({
        lastActionTime: now,
        clickStreak: 0,
        antiRushAlert: alertMsg,
        stats: {
          ...stats,
          dinhLuc: penaltyDinhLuc,
        },
      });

      // Clear alert after 4 seconds
      setTimeout(() => {
        set({ antiRushAlert: null });
      }, 4000);

      return true;
    }

    set({ lastActionTime: now, clickStreak: newStreak });
    return false;
  },

  advanceTimeOfDay: () => {
    const { stats, quests } = get();
    const sequence: PlayerStats['timeOfDay'][] = ['morning', 'afternoon', 'evening', 'night'];
    const currentIdx = sequence.indexOf(stats.timeOfDay);
    const nextIdx = (currentIdx + 1) % sequence.length;
    const nextTime = sequence[nextIdx];

    const nextDay = nextIdx === 0 ? stats.dayCount + 1 : stats.dayCount;
    const weatherChoices: PlayerStats['weather'][] = ['sunny', 'misty', 'rainy'];
    const nextWeather = nextIdx === 0 ? weatherChoices[Math.floor(Math.random() * weatherChoices.length)] : stats.weather;

    // Reset quests on new day or advance
    let updatedQuests = quests;
    if (nextIdx === 0) {
      updatedQuests = INITIAL_QUESTS.map(q => ({ ...q, completed: false }));
    }

    // Play temple bell on evening or new day
    if (nextTime === 'evening' || nextTime === 'morning') {
      soundEngine.playTempleBell();
    }

    set({
      stats: {
        ...stats,
        timeOfDay: nextTime,
        dayCount: nextDay,
        weather: nextWeather,
        tamLuc: nextIdx === 0 ? stats.maxTamLuc : Math.min(stats.maxTamLuc, stats.tamLuc + 20),
      },
      quests: updatedQuests,
    });

    get().saveToStorage();
  },

  completeQuest: (id: string) => {
    const { quests, addCongDuc, spendTamLuc } = get();
    const q = quests.find(item => item.id === id);
    if (!q || q.completed) return;

    if (!spendTamLuc(q.costTamLuc)) {
      alert('Tâm Lực đã cạn kiệt! Hãy ngồi tĩnh dưỡng, uống chén trà hoặc chờ sang buổi mới.');
      return;
    }

    addCongDuc(q.rewardCongDuc);
    soundEngine.playWoodenFish();

    set({
      quests: quests.map(item => item.id === id ? { ...item, completed: true } : item),
    });
    get().saveToStorage();
  },

  unlockJournalEntry: (entry: JournalEntry) => {
    const { journal } = get();
    if (journal.some(e => e.id === entry.id)) return;
    set({
      journal: [entry, ...journal],
    });
    soundEngine.playSingingBowl();
    get().saveToStorage();
  },

  changeZone: (zone: ZoneId) => {
    const { stats } = get();
    if (!stats.unlockedZones.includes(zone)) {
      alert(`Khu vực này yêu cầu Cấp độ Tâm Cảnh ${ZONES[zone].minLevel}! Hãy tiếp tục tu tập tích phước.`);
      return;
    }
    soundEngine.playWindChime();
    set({
      stats: {
        ...stats,
        currentZone: zone,
      },
    });
    get().saveToStorage();
  },

  setModal: (modal) => {
    set({ activeModal: modal });
  },

  activateTamSangBuff: () => {
    const { stats } = get();
    set({
      stats: {
        ...stats,
        tamSangBuff: true,
        buffDaysLeft: 2,
        dinhLuc: Math.min(100, stats.dinhLuc + 35),
      },
    });
    soundEngine.playEnlightenment();
    get().saveToStorage();
  },

  resetGame: () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  },

  saveToStorage: () => {
    try {
      const { stats, quests, journal } = get();
      const payload = { stats, quests, journal };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  },

  loadFromStorage: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.stats && parsed.quests) {
          set({
            stats: parsed.stats,
            quests: parsed.quests,
            journal: parsed.journal || INITIAL_JOURNAL,
          });
        }
      }
    } catch {
      // Ignore parse errors
    }
  },
}));
