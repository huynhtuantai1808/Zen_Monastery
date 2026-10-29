import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Volume2,
  VolumeX,
  BookOpen,
  Coffee,
  Heart,
  Award,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Feather,
  Flame,
  Sliders,
  ChevronRight,
  MessageCircleHeart,
  Palette,
  X,
  Bell,
  Globe,
  Menu,
  ScrollText
} from 'lucide-react';
import { BUDDHIST_DHARMA_SESSIONS } from './data/buddhistDharma';
import { CharacterCreationModal } from './components/CharacterCreationModal';
import { ZenCharacterSprite } from './components/ZenCharacterSprite';
import { ZenOpenWorld } from './canvas/ZenOpenWorld';
import { Zen3DWorld } from './canvas/Zen3DWorld';
import { WoodChoppingModal } from './components/WoodChoppingModal';
import { WaterCarryingModal } from './components/WaterCarryingModal';
import { AltarCleaningModal } from './components/AltarCleaningModal';
import { CharityModal } from './components/CharityModal';
import { ZenQuestModal } from './components/ZenQuestModal';
import { ZEN_QUESTS, type ZenQuestItem } from './data/zenQuests';
import { soundEngine } from './services/audioEngine';
import type { CharacterAppearance, BuddhistDharmaSession, DharmaOption } from './types/game';

// ==========================================
// 1. DỮ LIỆU KỊCH BẢN & CẤP ĐỘ
// ==========================================

const LEVEL_TITLES = [
  { min: 1, max: 5, title: 'Người Tập Sự', desc: 'Tâm còn vương vấn bụi trần, cảnh sắc nhuốm màu xám phố thị', unlock: 'Sân Chùa, Quét lá đa' },
  { min: 6, max: 15, title: 'Cư Sĩ Áo Lam', desc: 'Hơi thở dần đều, sắc màu cỏ cây bắt đầu hé mở', unlock: 'Hiên Trà, Hồ Phóng Sinh' },
  { min: 16, max: 30, title: 'Bậc Tỉnh Thức', desc: 'Tâm an vạn sự an, nắng vàng rực rỡ khắp sơn tự', unlock: 'Tàng Kinh Các, Tiếp khách' },
  { min: 31, max: 99, title: 'Tâm Bất Biến', desc: 'Giữa dòng đời vạn biến, cảnh chùa lung linh sắc màu thiền định', unlock: 'Đỉnh Vân Sơn, Vườn Thiền' },
];

const TEA_TYPES = [
  { id: 'lotus', name: 'Trà Sen An Thần', icon: '🪷', benefit: 'Xoa dịu lo âu, mất ngủ vì áp lực', color: 'from-pink-500/20 to-amber-500/20 border-pink-400/50' },
  { id: 'ginger', name: 'Trà Gừng Ấm Lòng', icon: '🫚', benefit: 'Sưởi ấm tâm hồn cô đơn, thất vọng', color: 'from-amber-500/20 to-orange-500/20 border-amber-400/50' },
  { id: 'chrysanthemum', name: 'Trà Cúc Thanh Tâm', icon: '🌼', benefit: 'Hạ hỏa cơn nóng giận, đố kỵ', color: 'from-yellow-400/20 to-emerald-500/20 border-yellow-400/50' },
];

const GUEST_STORIES = [
  {
    id: 1,
    name: 'Minh Anh (Nhân viên văn phòng, 26 tuổi)',
    avatar: '👩‍💼',
    burden: 'Kiệt sức vì Deadline & Mạng xã hội',
    mood: 'Lo âu, mất ngủ',
    bestTea: 'lotus',
    quote: '"Con cảm thấy nếu mình ngừng chạy dù chỉ một ngày, cả thế giới sẽ bỏ rơi con phía sau. Điện thoại lúc nào cũng báo tin nhắn làm tim con đập thình thịch..."',
    choices: [
      {
        text: 'Khuyên cô ấy xóa hết ứng dụng và nghỉ việc ngay lập tức.',
        isMindful: false,
        reply: 'Minh Anh thở dài: "Cơm áo gạo tiền vẫn còn đó, con chưa thể buông bỏ đột ngột như vậy..."',
        merit: 15
      },
      {
        text: 'Mời chén trà ấm: "Mây trôi không vội mà vẫn qua đồi. Hãy cho phép mình thở trọn vẹn trong 5 phút này trước đã."',
        isMindful: true,
        reply: 'Minh Anh rưng rưng nước mắt, đôi vai đang gồng cứng dần thả lỏng theo hương trà sen thanh khiết.',
        merit: 45
      },
      {
        text: 'Kể về thành tích tu tập của bạn để cô ấy noi theo.',
        isMindful: false,
        reply: 'Cô ấy mỉm cười xã giao nhưng ánh mắt vẫn hướng về chiếc điện thoại.',
        merit: 10
      }
    ]
  },
  {
    id: 2,
    name: 'Chú Hoàng (Doanh nhân, 42 tuổi)',
    avatar: '🧔',
    burden: 'Tức giận vì bị đối tác phản bội',
    mood: 'Nóng giận, uất ức',
    bestTea: 'chrysanthemum',
    quote: '"Tôi đã dốc hết lòng tin cho họ, vậy mà họ nỡ lấy hết công sức của tôi. Trong lòng tôi lúc này như có lửa đốt!"',
    choices: [
      {
        text: 'Dâng trà thanh nhiệt: "Giữ cơn giận trong lòng giống như cầm than hồng ném vào người khác, tay mình sẽ bỏng trước tiên."',
        isMindful: true,
        reply: 'Chú Hoàng lặng người nhìn khói trà bay lên, tiếng thở hổn hển dần dịu lại thành một nụ cười nhẹ nhõm.',
        merit: 50
      },
      {
        text: 'Đồng tình và khuyên chú tìm luật sư trả đũa thật nặng.',
        isMindful: false,
        reply: 'Cơn giận của chú càng bùng lên, không khí hiên trà trở nên nặng nề.',
        merit: 10
      }
    ]
  },
  {
    id: 3,
    name: 'Hải Đăng (Sinh viên mới ra trường, 22 tuổi)',
    avatar: '🧑‍🎨',
    burden: 'Hoang mang mất phương hướng tương lai',
    mood: 'Lạnh lẽo, tự ti',
    bestTea: 'ginger',
    quote: '"Bạn bè đồng trang lứa ai cũng có việc làm tốt, còn con gửi hàng chục hồ sơ đều bị từ chối. Con thấy mình thật vô dụng..."',
    choices: [
      {
        text: 'Trao chén trà gừng ấm: "Tre mất 4 năm chỉ cao thêm 3cm để bén rễ sâu, rồi năm thứ 5 mới vươn cao mỗi ngày. Đừng sợ khoảng lặng."',
        isMindful: true,
        reply: 'Đôi mắt Hải Đăng sáng lên tia hy vọng ấm áp. Cậu cúi đầu cảm ơn bạn rối rít.',
        merit: 45
      },
      {
        text: 'Bảo cậu ấy phải cố gắng gấp đôi, đừng than vãn nữa.',
        isMindful: false,
        reply: 'Cậu ấy cúi gằm mặt, lặng lẽ uống cạn chén trà rồi rời đi.',
        merit: 15
      }
    ]
  }
];

const INITIAL_THOUGHT_BUBBLES = [
  { id: 't1', label: 'Deadline dồn dập!', x: 22, y: 30 },
  { id: 't2', label: 'Thông báo tin nhắn...', x: 75, y: 25 },
  { id: 't3', label: 'So sánh bản thân', x: 28, y: 68 },
  { id: 't4', label: 'Cơm áo gạo tiền', x: 72, y: 65 },
];

interface Leaf {
  id: number;
  x: number;
  y: number;
  rot: number;
  scale: number;
}

interface FloatingText {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
}

// ==========================================
// 2. HỆ THỐNG ÂM THANH: Sử dụng ZenAudioEngine chánh tông
//    (Hồng chung ngân vang vẳng, mõ gỗ, chuông xoay 432Hz)
// ==========================================

const STORAGE_KEY = 'tinh_tam_son_tu_fullscreen_v2';

const DEFAULT_CHARACTER: CharacterAppearance = {
  name: 'Tuệ Minh',
  gender: 'male',
  robeColor: 'lam',
  hairStyle: 'short',
  accessory: 'beads',
};

// ==========================================
// 3. MAIN COMPONENT: TỊNH TÂM SƠN TỰ FULLSCREEN
// ==========================================
export default function App() {
  // Character Customization State
  const [character, setCharacter] = useState<CharacterAppearance>(DEFAULT_CHARACTER);
  const [showCharModal, setShowCharModal] = useState<boolean>(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(false);

  // Stats State
  const [level, setLevel] = useState<number>(3);
  const [previewLevelOverride, setPreviewLevelOverride] = useState<number | null>(null);
  const [merit, setMerit] = useState<number>(40);
  const [stamina, setStamina] = useState<number>(85);
  const [focusBuff, setFocusBuff] = useState<number>(1.0);
  const [hasEnlightenmentBuff, setHasEnlightenmentBuff] = useState<boolean>(false);

  // Time Phase & Weather
  const [timePhase, setTimePhase] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showShaderControl, setShowShaderControl] = useState<boolean>(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);

  // Mindful Quests & Merit Milestones State
  const [questProgress, setQuestProgress] = useState<Record<string, { current: number; completed: boolean }>>({
    chop_wood: { current: 0, completed: false },
    carry_water: { current: 0, completed: false },
    clean_altar: { current: 0, completed: false },
    charity_food: { current: 0, completed: false },
    sweep_courtyard: { current: 0, completed: false },
    guest_tea: { current: 0, completed: false },
    dharma_meditate: { current: 0, completed: false },
    feed_koi: { current: 0, completed: false },
  });
  const [showQuestModal, setShowQuestModal] = useState<boolean>(false);
  const [activeQuestModal, setActiveQuestModal] = useState<ZenQuestItem['activityKey'] | null>(null);

  // Modals
  const [showJournalModal, setShowJournalModal] = useState<boolean>(false);
  const [unlockedQuotes, setUnlockedQuotes] = useState<string[]>([
    'Bước chân chạm đất biết mình đang an, hơi thở vào ra biết lòng đang tịnh.',
    'Một nhát chổi quét sân, một nhát chổi quét bụi trần trong tâm.',
    'Tâm không dao động trước được - mất, khen - chê, đó là điềm lành lớn nhất.'
  ]);

  // Floating text feedback
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Mini-game Buổi Sáng: Quét Lá Đa (Anti-Rush)
  const [leaves, setLeaves] = useState<Leaf[]>([
    { id: 1, x: 25, y: 72, rot: 15, scale: 1 },
    { id: 2, x: 42, y: 78, rot: -35, scale: 0.9 },
    { id: 3, x: 58, y: 70, rot: 45, scale: 1.1 },
    { id: 4, x: 73, y: 76, rot: -15, scale: 0.95 },
    { id: 5, x: 35, y: 83, rot: 25, scale: 1 },
    { id: 6, x: 64, y: 82, rot: -40, scale: 0.85 },
  ]);
  const [rushMeter, setRushMeter] = useState<number>(0);
  const [rushWarning, setRushWarning] = useState<boolean>(false);
  const [calmCombo, setCalmCombo] = useState<number>(0);
  const lastSweepTimeRef = useRef<number>(0);

  // Mini-game Buổi Chiều: Hiên Trà
  const [guestIndex, setGuestIndex] = useState<number>(0);
  const [selectedTea, setSelectedTea] = useState<string>('lotus');
  const [guestFeedback, setGuestFeedback] = useState<{ reply: string; isMindful: boolean; isRightTea: boolean } | null>(null);

  // Mini-game Buổi Tối: Khóa Lễ Tối & Bài Giảng Phật Giáo
  const [eveningStep, setEveningStep] = useState<'BREATH' | 'DHARMA'>('BREATH');
  const [thoughtBubbles, setThoughtBubbles] = useState(INITIAL_THOUGHT_BUBBLES);
  const [isHoldingBreath, setIsHoldingBreath] = useState<boolean>(false);
  const [breathProgress, setBreathProgress] = useState<number>(0);
  const [dharmaIndex, setDharmaIndex] = useState<number>(0);
  const [dharmaResult, setDharmaResult] = useState<DharmaOption | null>(null);

  // Chuông chùa vang vẳng & Đồ họa nhân vật động
  const [isBellRinging, setIsBellRinging] = useState<boolean>(false);
  const [ambientBellActive, setAmbientBellActive] = useState<boolean>(true);
  const [isSweepingAnim, setIsSweepingAnim] = useState<boolean>(false);

  // Chế độ thế giới mở 2D (Open World)
  const [worldMode, setWorldMode] = useState<'3D' | 'OPEN_WORLD' | 'FOCUS'>('3D');
  const [openWorldActivity, setOpenWorldActivity] = useState<'NONE' | 'SWEEP' | 'TEA' | 'DHARMA'>('NONE');

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.character) setCharacter(data.character);
        if (typeof data.level === 'number') setLevel(data.level);
        if (typeof data.merit === 'number') setMerit(data.merit);
        if (typeof data.stamina === 'number') setStamina(data.stamina);
        if (typeof data.focusBuff === 'number') setFocusBuff(data.focusBuff);
        if (Array.isArray(data.unlockedQuotes)) setUnlockedQuotes(data.unlockedQuotes);
        if (typeof data.hasEnlightenmentBuff === 'boolean') setHasEnlightenmentBuff(data.hasEnlightenmentBuff);
        if (data.questProgress) setQuestProgress(data.questProgress);
      } else {
        // First launch: show character creation immediately!
        setIsFirstLaunch(true);
        setShowCharModal(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      const payload = {
        character,
        level,
        merit,
        stamina,
        focusBuff,
        unlockedQuotes,
        hasEnlightenmentBuff,
        questProgress
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore
    }
  }, [character, level, merit, stamina, focusBuff, unlockedQuotes, hasEnlightenmentBuff, questProgress]);

  const completedQuestsCount = Object.values(questProgress).filter((q) => q.completed).length;
  const effectiveLevel = previewLevelOverride !== null ? previewLevelOverride : level;
  const maxMeritForLevel = level * 60;

  const currentTitleObj = LEVEL_TITLES.find(
    (t) => effectiveLevel >= t.min && effectiveLevel <= t.max
  ) || LEVEL_TITLES[LEVEL_TITLES.length - 1];

  const grayscalePercent = Math.max(0, Math.round(80 - (effectiveLevel - 1) * 4.2));
  const saturationPercent = Math.min(135, Math.round(70 + effectiveLevel * 3));

  const spawnFloatingText = useCallback((text: string, color = 'text-amber-300', x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, text, color, x, y }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1400);
  }, []);

  // Tiếng chuông chùa ngân vang vẳng xa (Đại Hồng Chung)
  const triggerTempleBell = useCallback(() => {
    soundEngine.initContext();
    soundEngine.playDistantEchoBell(1, 0.7);
    setIsBellRinging(true);
    spawnFloatingText('🔔 Tiếng chuông chùa ngân vang vẳng...', 'text-amber-200 font-serif font-bold text-base', 50, 22);
    setTimeout(() => setIsBellRinging(false), 4200);
  }, [spawnFloatingText]);

  // Tự động ngân chuông chùa vang vẳng định kỳ (mỗi 22s) tạo bầu không khí thanh tịnh
  useEffect(() => {
    if (ambientBellActive && soundEnabled) {
      soundEngine.startAmbientTempleBells(22);
    } else {
      soundEngine.stopAmbientTempleBells();
    }
    return () => {
      soundEngine.stopAmbientTempleBells();
    };
  }, [ambientBellActive, soundEnabled]);

  const addMerit = useCallback(
    (baseAmount: number, x = 50, y = 45, labelPrefix = '') => {
      const finalAmount = Math.round(baseAmount * focusBuff);
      setMerit((prev) => {
        const nextMerit = prev + finalAmount;
        const needed = level * 60;
        if (nextMerit >= needed) {
          setLevel((lvl) => lvl + 1);
          soundEngine.playBell(528, 3.2);
          spawnFloatingText('✨ THĂNG CẤP TÂM CẢNH! ✨', 'text-yellow-300 font-bold text-lg', 50, 30);
          return nextMerit - needed;
        }
        return nextMerit;
      });
      spawnFloatingText(
        `${labelPrefix}+${finalAmount} Công Đức ${focusBuff > 1 ? `(x${focusBuff.toFixed(1)})` : ''}`,
        'text-emerald-300 font-semibold',
        x,
        y
      );
    },
    [focusBuff, level, spawnFloatingText]
  );


  // Hoàn thành nhiệm vụ công quả & cộng thưởng
  const handleCompleteQuestActivity = (activityKey: ZenQuestItem['activityKey'], meritBonus: number, staminaRestore: number) => {
    addMerit(meritBonus, 50, 40, '✨ Công Quả Viên Mãn ');
    setStamina((prev) => Math.min(100, prev + staminaRestore));

    const quest = ZEN_QUESTS.find((q) => q.activityKey === activityKey);
    if (quest) {
      setQuestProgress((prev) => ({
        ...prev,
        [quest.id]: { current: quest.targetCount, completed: true },
      }));
      spawnFloatingText(`📜 Hoàn Thành: ${quest.title}!`, 'text-amber-200 font-serif font-bold', 50, 35);
    }
    setActiveQuestModal(null);
  };

  const handleStartActivity = (key: ZenQuestItem['activityKey']) => {
    if (key === 'SWEEP') {
      setTimePhase('MORNING');
      setOpenWorldActivity('SWEEP');
    } else if (key === 'TEA') {
      setTimePhase('AFTERNOON');
      setOpenWorldActivity('TEA');
    } else if (key === 'DHARMA') {
      setTimePhase('EVENING');
      setOpenWorldActivity('DHARMA');
    } else if (key === 'FEED_KOI') {
      addMerit(20, 50, 40, '🪷 Phóng Sinh & Lòng Từ ');
      setQuestProgress((prev) => ({
        ...prev,
        feed_koi: { current: 1, completed: true },
      }));
      soundEngine.playWoodenFish();
    } else {
      setActiveQuestModal(key);
    }
  };

  const spendStamina = useCallback((amount: number): boolean => {
    if (stamina < amount) {
      soundEngine.playWarning();
      spawnFloatingText('Cạn Tâm Lực! Hãy uống một chén trà ấm 🍵', 'text-rose-300 font-serif', 50, 45);
      return false;
    }
    setStamina((prev) => Math.max(0, prev - amount));
    return true;
  }, [stamina, spawnFloatingText]);

  // Anti-Rush decay & Leaf falling
  useEffect(() => {
    const interval = setInterval(() => {
      setRushMeter((prev) => Math.max(0, prev - 12));
      setLeaves((prev) => {
        if (prev.length < 8 && timePhase === 'MORNING') {
          return [
            ...prev,
            {
              id: Date.now() + Math.random(),
              x: 18 + Math.random() * 64,
              y: 68 + Math.random() * 18,
              rot: Math.round(Math.random() * 90 - 45),
              scale: 0.85 + Math.random() * 0.3,
            },
          ];
        }
        return prev;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [timePhase]);

  // Breathing mini-game hold
  useEffect(() => {
    if (!isHoldingBreath || timePhase !== 'EVENING' || eveningStep !== 'BREATH') return;
    const timer = setInterval(() => {
      setBreathProgress((prev) => {
        if (prev >= 100) {
          soundEngine.playBell(480, 2.0);
          setThoughtBubbles((bubbles) => {
            const remaining = bubbles.slice(1);
            if (remaining.length === 0) {
              setTimeout(() => setEveningStep('DHARMA'), 600);
            }
            return remaining;
          });
          spawnFloatingText('Tan biến 1 Tạp Niệm 🪷', 'text-cyan-200', 50, 40);
          return 0;
        }
        return prev + 5;
      });
    }, 80);
    return () => clearInterval(timer);
  }, [isHoldingBreath, timePhase, eveningStep, spawnFloatingText]);

  const handleSweepLeaf = (leaf: Leaf, e: React.MouseEvent) => {
    e.stopPropagation();
    if (rushWarning) return;

    if (stamina < 5) {
      spawnFloatingText('Cạn Tâm Lực! Hãy thưởng trà nghỉ ngơi 🍵', 'text-rose-300', leaf.x, leaf.y);
      soundEngine.playWarning();
      return;
    }

    const now = Date.now();
    const delta = now - lastSweepTimeRef.current;
    lastSweepTimeRef.current = now;

    if (delta < 420) {
      const nextRush = rushMeter + 38;
      setRushMeter(Math.min(100, nextRush));
      if (nextRush >= 85) {
        setRushWarning(true);
        setCalmCombo(0);
        soundEngine.playWarning();
        spawnFloatingText('⚠️ TÂM VỘI VÃ! Lá bay tán loạn!', 'text-rose-400 font-bold', 50, 45);
        setLeaves((prev) => [
          ...prev,
          { id: Date.now() + 1, x: 30, y: 72, rot: 20, scale: 1 },
          { id: Date.now() + 2, x: 55, y: 78, rot: -30, scale: 1 },
        ]);
        setTimeout(() => {
          setRushWarning(false);
          setRushMeter(20);
        }, 2000);
        return;
      }
    } else {
      setRushMeter((prev) => Math.max(0, prev - 10));
    }

    setIsSweepingAnim(true);
    soundEngine.playSweep();
    setTimeout(() => setIsSweepingAnim(false), 380);
    setStamina((prev) => Math.max(0, prev - 3));
    setLeaves((prev) => prev.filter((item) => item.id !== leaf.id));

    const newCombo = calmCombo + 1;
    setCalmCombo(newCombo);

    if (newCombo % 4 === 0) {
      addMerit(20, leaf.x, leaf.y - 8, '🌿 Phước Ẩn Kiên Nhẫn ');
      soundEngine.playBell(528, 1.5);
    } else {
      addMerit(10, leaf.x, leaf.y - 5);
    }
  };

  const handleDrinkTea = () => {
    soundEngine.playBell(396, 1.8);
    setStamina((prev) => Math.min(100, prev + 35));
    spawnFloatingText('+35 Tâm Lực (An thần) 🍵', 'text-teal-300', 70, 20);
  };

  const handleCounselGuest = (choice: (typeof GUEST_STORIES)[0]['choices'][0]) => {
    const currentGuest = GUEST_STORIES[guestIndex];
    const isRightTea = selectedTea === currentGuest.bestTea;
    const teaBonus = isRightTea ? 15 : 0;

    if (choice.isMindful) {
      soundEngine.playBell(528, 2.5);
      addMerit(choice.merit + teaBonus, 50, 40, isRightTea ? '🍵 Hợp Vị Trà + Thấu Cảm ' : '💛 Thấu Cảm ');
    } else {
      soundEngine.playWarning();
      addMerit(choice.merit, 50, 40);
    }

    setGuestFeedback({
      reply: choice.reply,
      isMindful: choice.isMindful,
      isRightTea,
    });
  };

  const handleAnswerDharma = (option: DharmaOption) => {
    setDharmaResult(option);
    if (option.isCorrect) {
      soundEngine.playBell(639, 3.5);
      setFocusBuff(1.5);
      setHasEnlightenmentBuff(true);
      addMerit(60, 50, 35, '🪷 ĐỐN NGỘ! ');
      if (option.quoteCollected && !unlockedQuotes.includes(option.quoteCollected)) {
        setUnlockedQuotes((prev) => [option.quoteCollected!, ...prev]);
      }
    } else {
      soundEngine.playBell(396, 1.5);
      addMerit(20, 50, 35, '🙏 Tâm thành lắng nghe ');
    }
  };

  const currentDharmaSession: BuddhistDharmaSession = BUDDHIST_DHARMA_SESSIONS[dharmaIndex % BUDDHIST_DHARMA_SESSIONS.length];

  const skyGradientByPhase = {
    MORNING: 'from-amber-200/80 via-emerald-100/70 to-stone-200',
    AFTERNOON: 'from-orange-300/80 via-amber-100/75 to-stone-300',
    EVENING: 'from-indigo-950 via-slate-900 to-stone-900',
  };

  const renderSweepingSection = (isModal: boolean = false) => (
    <div className={`relative z-10 w-full h-full flex flex-col justify-between ${isModal ? 'p-2' : 'pt-24 pb-6 px-6'}`}>
      {/* Thanh Anti-Rush Floating Bar */}
      <div className="max-w-md mx-auto w-full bg-stone-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/40 shadow-xl flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-xs sm:text-sm">
            <Feather className="w-4 h-4 text-amber-400" />
            <span>Quét Lá Đa: Điềm tĩnh từng nhịp thở</span>
          </div>
          <div className="text-[11px] text-stone-300 font-serif">
            Bấm vội vã &lt; 400ms sẽ sinh tạp niệm, gió thổi tung lá!
          </div>
        </div>

        {/* Meter */}
        <div className="w-28 sm:w-36">
          <div className="flex justify-between text-[10px] mb-1 font-serif">
            <span className="text-stone-400">Nhịp Tâm:</span>
            <span className={rushMeter > 60 ? 'text-rose-400 font-bold' : 'text-emerald-300'}>
              {rushMeter > 60 ? 'Vội vã!' : `Combo ${calmCombo}`}
            </span>
          </div>
          <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${rushMeter > 60 ? 'bg-rose-500' : 'bg-emerald-400'}`}
              style={{ width: `${rushMeter}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cảnh báo vội vã */}
      {rushWarning && (
        <div className="max-w-md mx-auto w-full p-3 bg-rose-950/90 border border-rose-400/50 rounded-2xl flex items-center gap-3 text-rose-200 text-xs animate-shake shadow-lg font-serif">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>TÂM ĐANG VỘI VÃ! Hãy thở một hơi thật sâu, đừng chạy theo kết quả...</span>
        </div>
      )}

      {/* Nhân vật cư sĩ đứng quét giữa sân */}
      <div className={`flex flex-col items-center z-20 pointer-events-auto ${isModal ? 'my-3' : 'absolute left-1/2 bottom-8 -translate-x-1/2'}`}>
        <ZenCharacterSprite
          character={character}
          pose="sweeping"
          isSweepingAnim={isSweepingAnim}
          subtitle={`Cấp ${effectiveLevel} • ${currentTitleObj.title}`}
          onClick={() => setShowCharModal(true)}
        />
      </div>

      {/* Các chiếc lá trên sân */}
      <div className={`relative w-full ${isModal ? 'h-52 bg-stone-900/60 rounded-2xl border border-stone-800' : 'h-full'} pointer-events-auto overflow-hidden`}>
        {leaves.map((leaf) => (
          <button
            key={leaf.id}
            onClick={(e) => handleSweepLeaf(leaf, e)}
            style={{
              left: `${leaf.x}%`,
              top: `${leaf.y}%`,
              transform: `translate(-50%, -50%) rotate(${leaf.rot}deg) scale(${leaf.scale})`,
            }}
            className="absolute p-4 rounded-full hover:scale-135 active:scale-75 transition-all duration-300 cursor-pointer focus:outline-none"
            title="Chạm nhẹ để quét lá"
          >
            <span className="text-4xl sm:text-5xl drop-shadow-md">🍂</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTeaSection = (isModal: boolean = false) => (
    <div className={`relative z-10 w-full h-full flex items-center justify-center ${isModal ? 'p-1' : 'pt-20 pb-6 px-4'}`}>
      <div className="max-w-3xl w-full bg-stone-950/90 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-amber-200 font-heading font-bold text-base sm:text-lg">
            <MessageCircleHeart className="w-5 h-5 text-amber-400" />
            <span>Hiên Trà Chùa Vân Ẩn: Lắng Nghe Khách Thập Phương</span>
          </div>
          <button
            onClick={() => {
              setGuestFeedback(null);
              setGuestIndex((prev) => (prev + 1) % GUEST_STORIES.length);
            }}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-amber-200 flex items-center gap-1.5 border border-stone-700 cursor-pointer font-serif"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Đón vị khách tiếp theo
          </button>
        </div>

        {/* Cảnh đàm đạo 2D: Cư sĩ đối ẩm cùng khách thập phương */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-900/80 border border-amber-900/40 shadow-inner">
          {/* Chủ tọa: Nhân vật cư sĩ */}
          <div className="flex items-center gap-2.5">
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
              <ZenCharacterSprite
                character={character}
                pose="sitting-tea"
                showNameTag={false}
                scale={0.7}
                onClick={() => setShowCharModal(true)}
              />
            </div>
            <div>
              <div className="text-xs font-serif font-bold text-amber-200">{character.name}</div>
              <div className="text-[10px] text-stone-400 font-serif">Chủ tọa dâng trà</div>
            </div>
          </div>

          {/* Bàn Trà Nghi Ngút Khói */}
          <div className="text-center px-3 py-1 rounded-xl bg-amber-950/50 border border-amber-500/20">
            <div className="text-2xl animate-pulse">🍵</div>
            <div className="text-[10px] text-amber-300 font-serif">
              {TEA_TYPES.find((t) => t.id === selectedTea)?.name}
            </div>
          </div>

          {/* Khách Thập Phương */}
          <div className="flex items-center gap-2.5 text-right">
            <div>
              <div className="text-xs font-serif font-bold text-stone-200">
                {GUEST_STORIES[guestIndex].name.split('(')[0]}
              </div>
              <div className="text-[10px] text-rose-300 font-serif">Khách hữu duyên</div>
            </div>
            <div className="text-3xl p-1.5 rounded-2xl bg-stone-800/80 border border-stone-700 shrink-0">
              {GUEST_STORIES[guestIndex].avatar}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 1. Chọn Trà (5 cols) */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-xs font-serif font-bold text-amber-300 uppercase tracking-wider">
              1. Chọn Trà Dâng Khách:
            </div>
            {TEA_TYPES.map((tea) => (
              <button
                key={tea.id}
                onClick={() => {
                  setSelectedTea(tea.id);
                  soundEngine.playBell(480, 1.2);
                }}
                className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 cursor-pointer ${
                  selectedTea === tea.id
                    ? `bg-gradient-to-r ${tea.color} text-amber-100 shadow-md`
                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span className="text-xl">{tea.icon}</span>
                <div>
                  <div className="text-xs font-bold text-stone-100 font-serif">{tea.name}</div>
                  <div className="text-[11px] text-stone-300 font-serif">{tea.benefit}</div>
                </div>
              </button>
            ))}
          </div>

          {/* 2. Lắng nghe & Khuyên nhủ (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl bg-stone-900 p-2 rounded-2xl border border-stone-800">
                  {GUEST_STORIES[guestIndex].avatar}
                </span>
                <div>
                  <div className="font-bold text-sm text-amber-100 font-serif">
                    {GUEST_STORIES[guestIndex].name}
                  </div>
                  <div className="text-xs text-rose-300 font-serif">
                    Nút thắt: {GUEST_STORIES[guestIndex].burden}
                  </div>
                </div>
              </div>

              <blockquote className="text-xs sm:text-sm italic text-stone-200 bg-stone-900/90 p-3 rounded-xl border-l-4 border-amber-400 font-serif">
                {GUEST_STORIES[guestIndex].quote}
              </blockquote>
            </div>

            {!guestFeedback ? (
              <div className="space-y-2">
                <div className="text-xs font-serif font-bold text-amber-300">
                  2. Chọn lời chia sẻ cùng khách:
                </div>
                {GUEST_STORIES[guestIndex].choices.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCounselGuest(c)}
                    className="w-full text-left p-2.5 rounded-xl bg-stone-900 hover:bg-amber-950/50 border border-stone-700 hover:border-amber-400/50 text-xs text-stone-200 transition flex items-center justify-between gap-2 cursor-pointer font-serif"
                  >
                    <span>{c.text}</span>
                    <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs space-y-2">
                <div className="font-semibold text-emerald-300 flex items-center gap-1.5 font-serif">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {guestFeedback.isMindful ? 'Khách đã cởi bỏ được gút thắt trong lòng!' : 'Khách lắng nghe nhưng lòng còn trĩu nặng.'}
                  </span>
                </div>
                <p className="text-stone-200 font-serif">{guestFeedback.reply}</p>
                <button
                  onClick={() => {
                    setGuestFeedback(null);
                    setGuestIndex((prev) => (prev + 1) % GUEST_STORIES.length);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs font-serif cursor-pointer"
                >
                  Tiếp tục đón vị khách tiếp theo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDharmaSection = (isModal: boolean = false) => (
    <div className={`relative z-10 w-full h-full flex items-center justify-center ${isModal ? 'p-1' : 'pt-20 pb-6 px-4'}`}>
      <div className="max-w-3xl w-full bg-slate-950/90 backdrop-blur-xl border border-indigo-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        {/* Header Khóa Lễ Tối */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-200 font-heading font-bold text-base sm:text-lg">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Khóa Lễ Tối Tại Chánh Điện: Thính Pháp & Vấn Đáp Ngộ Đạo</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEveningStep('BREATH');
                setThoughtBubbles(INITIAL_THOUGHT_BUBBLES);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-medium transition cursor-pointer ${
                eveningStep === 'BREATH' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Bước 1: Hơi Thở Xua Tạp Niệm
            </button>
            <button
              onClick={() => setEveningStep('DHARMA')}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-medium transition cursor-pointer ${
                eveningStep === 'DHARMA' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Bước 2: Nghe Pháp & Vấn Đáp
            </button>
          </div>
        </div>

        {/* BƯỚC 1: HƠI THỞ HOA SEN */}
        {eveningStep === 'BREATH' && (
          <div className="relative py-8 flex flex-col items-center justify-center">
            {/* Floating distraction bubbles */}
            {thoughtBubbles.map((b) => (
              <div
                key={b.id}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-rose-950/85 border border-rose-400/50 text-rose-200 text-xs shadow-lg animate-pulse font-serif"
              >
                💭 {b.label}
              </div>
            ))}

            {/* Nhân vật cư sĩ tọa thiền kiết già an nhiên */}
            <div className="mb-2">
              <ZenCharacterSprite
                character={character}
                pose="meditating"
                isBreathingAnim={isHoldingBreath}
                subtitle="Tọa thiền kiết già quán niệm hơi thở"
                onClick={() => setShowCharModal(true)}
              />
            </div>

            <button
              onMouseDown={() => setIsHoldingBreath(true)}
              onMouseUp={() => setIsHoldingBreath(false)}
              onMouseLeave={() => setIsHoldingBreath(false)}
              onTouchStart={() => setIsHoldingBreath(true)}
              onTouchEnd={() => setIsHoldingBreath(false)}
              className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500 cursor-pointer shadow-2xl ${
                isHoldingBreath
                  ? 'scale-110 bg-amber-500/30 border-amber-300 shadow-amber-500/40'
                  : 'scale-100 bg-indigo-950/80 border-indigo-400/60 hover:border-amber-300'
              }`}
            >
              <span className="text-4xl mb-1">🪷</span>
              <span className="text-xs font-bold text-amber-200 font-serif">
                {isHoldingBreath ? 'Đang Hít Sâu...' : 'Nhấn Giữ Để Thở'}
              </span>
              <span className="text-[11px] text-indigo-200 mt-0.5 font-mono">{breathProgress}%</span>
            </button>

            <p className="text-xs text-slate-300 mt-4 text-center max-w-md font-serif">
              Còn <strong>{thoughtBubbles.length} Tạp Niệm</strong>. Nhấn giữ vòng hoa sen để hít thở sâu, làm tan biến muộn phiền trước khi bước vào thính pháp.
            </p>
          </div>
        )}

        {/* BƯỚC 2: BÀI GIẢNG PHẬT GIÁO CHÍNH THỐNG */}
        {eveningStep === 'DHARMA' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-serif">
                  📖 {currentDharmaSession.sutraName} • {currentDharmaSession.paliName}
                </span>
                <h3 className="font-heading font-bold text-base sm:text-lg text-amber-100 mt-1">
                  {currentDharmaSession.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setDharmaResult(null);
                  setDharmaIndex((prev) => (prev + 1) % BUDDHIST_DHARMA_SESSIONS.length);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 font-serif cursor-pointer"
              >
                Đổi bài kinh khác
              </button>
            </div>

            {/* Nhân vật cư sĩ lắng tâm thính pháp */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-16 h-16 flex items-center justify-center shrink-0">
                <ZenCharacterSprite
                  character={character}
                  pose="meditating"
                  showNameTag={false}
                  scale={0.55}
                />
              </div>
              <div>
                <div className="text-xs text-amber-200 font-serif font-bold">{character.name} lắng tâm thính pháp</div>
                <div className="text-[10px] text-slate-400 font-serif">Nghe chuông phiền não tan mây khói, ý lặng thân an miệng mỉm cười</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 font-serif leading-relaxed italic whitespace-pre-line">
              &ldquo;{currentDharmaSession.story}&rdquo;
            </div>

            <div className="text-xs sm:text-sm font-semibold text-amber-300 font-serif">
              Câu hỏi Ngộ Đạo: {currentDharmaSession.question}
            </div>

            {!dharmaResult ? (
              <div className="space-y-2">
                {currentDharmaSession.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerDharma(opt)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/90 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400 text-xs text-slate-100 transition flex items-center justify-between cursor-pointer font-serif"
                  >
                    <span>{opt.text}</span>
                    <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  dharmaResult.isCorrect
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                    : 'bg-slate-800 border-slate-600 text-slate-200'
                }`}
              >
                <div className="font-bold text-sm flex items-center gap-1.5 font-serif">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>{dharmaResult.feedback}</span>
                </div>
                {dharmaResult.quoteCollected && (
                  <div className="italic text-amber-200 bg-slate-950/60 p-2 rounded-lg font-serif">
                    📜 Đã lưu câu kệ vào Sổ Tay Tỉnh Thức: &ldquo;{dharmaResult.quoteCollected}&rdquo;
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setDharmaResult(null);
                      setTimePhase('MORNING');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-serif cursor-pointer"
                  >
                    Bắt đầu ngày mới với Buff Tâm Sáng ☀️
                  </button>
                  <button
                    onClick={() => setDharmaResult(null)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-serif cursor-pointer"
                  >
                    Thử lại câu hỏi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      onClick={() => soundEngine.initContext()}
      className="relative w-screen h-screen overflow-hidden bg-stone-950 text-stone-100 select-none font-sans flex flex-col"
    >
      {/* =========================================================
          1. FLOATING TOP HUD (TINH GỌN, TRANG NGHIÊM, PHỦ KÍNH MỜ)
          ========================================================= */}
      <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-2 sm:p-4">
        <div className="max-w-7xl mx-auto bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl sm:rounded-3xl shadow-2xl pointer-events-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* LEFT: Nhân vật & Cấp độ */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setShowCharModal(true)}
              title="Nhấn để tùy biến ngoại hình và pháp danh"
              className="relative group p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border-2 border-amber-400/60 hover:border-amber-300 transition-all cursor-pointer shadow-lg bg-stone-950/80 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 overflow-hidden shrink-0"
            >
              <div className="scale-60 sm:scale-75 translate-y-0.5 sm:translate-y-1">
                <ZenCharacterSprite character={character} pose="idle" showNameTag={false} scale={0.5} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.1 sm:px-1.5 sm:py-0.2 bg-amber-500 text-stone-950 font-bold text-[8px] sm:text-[9px] rounded-tl-md border-t border-l border-stone-900">
                Lv.{effectiveLevel}
              </span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-heading font-bold text-amber-100 text-xs sm:text-base truncate max-w-[90px] xs:max-w-[130px] sm:max-w-none">
                  {character.name}
                </span>
                <span className="text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 font-serif hidden xs:inline-block">
                  {currentTitleObj.title}
                </span>
              </div>
              <div className="text-[10px] text-stone-400 font-serif hidden md:block">
                Pháp phục: <span className="text-amber-300">{character.robeColor === 'lam' ? 'Áo Lam' : character.robeColor === 'nau' ? 'Áo Nâu Sồng' : character.robeColor === 'xam' ? 'Áo Xám' : 'Bạch Y'}</span>
              </div>
            </div>
          </div>

          {/* CENTER: CHỈ SỐ (Đầy đủ trên PC/Laptop, Mini-Badge trên Mobile) */}
          {/* Desktop/Tablet Stats */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {/* Công Đức */}
            <div className="w-24 lg:w-36">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-300 font-serif font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Phước Báu
                </span>
                <span className="text-stone-300 font-mono text-[11px]">{merit}/{maxMeritForLevel}</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                  style={{ width: `${Math.min(100, (merit / maxMeritForLevel) * 100)}%` }}
                />
              </div>
            </div>

            {/* Tâm Lực */}
            <div className="w-24 lg:w-36">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-300 font-serif font-medium flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> Tâm Lực
                </span>
                <span className="text-stone-300 font-mono text-[11px]">{stamina}/100</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    stamina > 30 ? 'bg-gradient-to-r from-emerald-500 to-teal-300' : 'bg-rose-500 animate-pulse'
                  }`}
                  style={{ width: `${stamina}%` }}
                />
              </div>
            </div>

            {/* Thưởng Trà */}
            <button
              onClick={handleDrinkTea}
              title="Uống chén trà ấm hồi phục 35 Tâm Lực"
              className="px-2.5 py-1.5 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 text-teal-200 text-xs flex items-center gap-1.5 transition cursor-pointer font-serif"
            >
              <Coffee className="w-3.5 h-3.5 text-teal-300" />
              <span>Thưởng Trà</span>
            </button>

            {/* Định Lực Buff */}
            <div
              className={`px-2 py-1 rounded-xl border flex items-center gap-1.5 transition ${
                hasEnlightenmentBuff
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                  : 'bg-stone-900 border-stone-800 text-stone-400'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${hasEnlightenmentBuff ? 'text-amber-300 animate-bounce' : 'text-stone-500'}`} />
              <span className="text-xs font-serif font-semibold">x{focusBuff.toFixed(1)}</span>
            </div>
          </div>

          {/* Mobile Mini Stats Pill */}
          <div className="flex md:hidden items-center gap-2 bg-stone-950/70 px-2.5 py-1 rounded-xl border border-stone-800 text-[10px] font-mono">
            <span className="text-amber-300 font-bold flex items-center gap-0.5">
              ✨{merit}
            </span>
            <span className="text-stone-600">|</span>
            <span className={`font-bold flex items-center gap-0.5 ${stamina > 30 ? 'text-emerald-300' : 'text-rose-400 animate-pulse'}`}>
              💚{stamina}%
            </span>
          </div>

          {/* RIGHT: ACTIONS & CONTROLS */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Chuyển Chế Độ: 3D Sơn Tự / Thế Giới Mở 2D / Cảnh Thiền Tĩnh */}
            <button
              onClick={() => {
                setWorldMode((prev) => (prev === '3D' ? 'OPEN_WORLD' : prev === 'OPEN_WORLD' ? 'FOCUS' : '3D'));
                soundEngine.playWoodenFish();
              }}
              title="Chuyển đổi giữa 3D Sơn Tự ↔ 2D Thế Giới Mở ↔ Cảnh Thiền Tĩnh"
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border font-serif text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 cursor-pointer transition shadow-md ${
                worldMode === '3D'
                  ? 'bg-amber-500/30 border-amber-400 text-yellow-200 ring-1 ring-amber-400/50'
                  : worldMode === 'OPEN_WORLD'
                  ? 'bg-emerald-600/35 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/40'
                  : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">
                {worldMode === '3D' ? '🏰 3D Sơn Tự' : worldMode === 'OPEN_WORLD' ? '🗺️ 2D Cuộn Cảnh' : '🧘 Góc Nhìn Tĩnh'}
              </span>
            </button>

            {/* Desktop / Tablet Extended Controls */}
            <div className="hidden lg:flex items-center gap-1.5">
              {/* Chuyển buổi */}
              <div className="flex bg-stone-950/90 p-1 rounded-xl border border-stone-800">
                <button
                  onClick={() => {
                    setTimePhase('MORNING');
                    soundEngine.playBell(432, 1.5);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-serif flex items-center gap-1 cursor-pointer transition ${
                    timePhase === 'MORNING' ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold' : 'text-stone-400'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>Sáng</span>
                </button>
                <button
                  onClick={() => {
                    setTimePhase('AFTERNOON');
                    soundEngine.playBell(480, 1.5);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-serif flex items-center gap-1 cursor-pointer transition ${
                    timePhase === 'AFTERNOON' ? 'bg-orange-500/30 text-orange-200 border border-orange-400/40 font-bold' : 'text-stone-400'
                  }`}
                >
                  <Sunset className="w-3 h-3" />
                  <span>Chiều</span>
                </button>
                <button
                  onClick={() => {
                    setTimePhase('EVENING');
                    soundEngine.playBell(396, 2.2);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-serif flex items-center gap-1 cursor-pointer transition ${
                    timePhase === 'EVENING' ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-bold' : 'text-stone-400'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>Tối</span>
                </button>
              </div>

              {/* Mưa */}
              <button
                onClick={() => setIsRaining(!isRaining)}
                title="Bật/Tắt hiệu ứng Mưa Thiền"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isRaining ? 'bg-sky-500/20 border-sky-400 text-sky-200' : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                <CloudRain className="w-4 h-4" />
              </button>

              {/* Chuông Chùa Vang Vẳng */}
              <button
                onClick={triggerTempleBell}
                title="Thỉnh Chuông Đại Hồng Chung"
                className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 font-serif text-xs ${
                  isBellRinging
                    ? 'bg-amber-500/30 border-amber-300 text-yellow-200 ring-2 ring-amber-400/50 shadow-lg animate-pulse'
                    : 'bg-stone-900/90 hover:bg-amber-950/40 border-stone-800 text-amber-200'
                }`}
              >
                <span className={`text-base ${isBellRinging ? 'animate-bounce' : ''}`}>🔔</span>
                <span>Chuông</span>
              </button>

              {/* Bật/Tắt chuông định kỳ */}
              <button
                onClick={() => {
                  const next = !ambientBellActive;
                  setAmbientBellActive(next);
                  if (next) triggerTempleBell();
                  else soundEngine.stopAmbientTempleBells();
                }}
                title={ambientBellActive ? 'Chuông định kỳ đang BẬT' : 'Chuông định kỳ đang TẮT'}
                className={`p-2 rounded-xl border transition cursor-pointer text-xs ${
                  ambientBellActive ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-stone-900 border-stone-800 text-stone-500'
                }`}
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* Âm thanh */}
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  if (next) soundEngine.playBell(528, 1.5);
                }}
                title="Bật/Tắt âm thanh"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  soundEnabled ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-stone-900 border-stone-800 text-stone-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Bảng Công Quả & Mốc Nhiệm Vụ */}
              <button
                onClick={() => setShowQuestModal(true)}
                title="Bảng Công Quả & Mốc Thiện Hạnh"
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 cursor-pointer transition flex items-center gap-1.5 text-xs font-serif font-bold shadow-sm"
              >
                <ScrollText className="w-4 h-4 text-amber-300" />
                <span>Công Quả</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-mono text-[9px] font-bold">
                  {completedQuestsCount}/8
                </span>
              </button>

              {/* Sổ Tay */}
              <button
                onClick={() => setShowJournalModal(true)}
                title="Sổ Tay Tỉnh Thức"
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 cursor-pointer transition"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              {/* Nhân vật */}
              <button
                onClick={() => setShowCharModal(true)}
                title="Tùy chỉnh diện mạo nhân vật"
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 cursor-pointer transition"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile / Compact Menu Toggle Button */}
            <button
              onClick={() => setShowMobileDrawer((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl bg-stone-900 active:bg-amber-500/30 border border-amber-500/40 text-amber-300 cursor-pointer shadow flex items-center justify-center transition"
              aria-label="Mở menu thiền"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MOBILE ZEN DRAWER / SHEET */}
        {showMobileDrawer && (
          <div className="lg:hidden mt-2 max-w-7xl mx-auto bg-stone-950/95 backdrop-blur-2xl border-2 border-amber-500/50 p-3.5 rounded-2xl shadow-2xl pointer-events-auto space-y-3">
            {/* Hàng 1: Buổi Sáng / Chiều / Tối */}
            <div className="flex items-center justify-between gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => {
                  setTimePhase('MORNING');
                  soundEngine.playBell(432, 1.5);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-serif flex items-center justify-center gap-1.5 transition ${
                  timePhase === 'MORNING' ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold' : 'text-stone-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Buổi Sáng</span>
              </button>
              <button
                onClick={() => {
                  setTimePhase('AFTERNOON');
                  soundEngine.playBell(480, 1.5);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-serif flex items-center justify-center gap-1.5 transition ${
                  timePhase === 'AFTERNOON' ? 'bg-orange-500/30 text-orange-200 border border-orange-400/40 font-bold' : 'text-stone-400'
                }`}
              >
                <Sunset className="w-3.5 h-3.5" />
                <span>Buổi Chiều</span>
              </button>
              <button
                onClick={() => {
                  setTimePhase('EVENING');
                  soundEngine.playBell(396, 2.2);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-serif flex items-center justify-center gap-1.5 transition ${
                  timePhase === 'EVENING' ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-bold' : 'text-stone-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Buổi Tối</span>
              </button>
            </div>

            {/* Hàng 2: Các nút hành động nhanh */}
            <div className="grid grid-cols-3 gap-2">
              {/* Thưởng Trà */}
              <button
                onClick={() => {
                  handleDrinkTea();
                  setShowMobileDrawer(false);
                }}
                className="p-2 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-200 text-xs flex items-center justify-center gap-1 font-serif active:scale-95 transition"
              >
                <Coffee className="w-3.5 h-3.5 text-teal-300" />
                <span>Uống Trà</span>
              </button>

              {/* Thỉnh Chuông */}
              <button
                onClick={() => triggerTempleBell()}
                className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-center gap-1 font-serif active:scale-95 transition"
              >
                <span>🔔</span>
                <span>Thỉnh Chuông</span>
              </button>

              {/* Mưa Thiền */}
              <button
                onClick={() => setIsRaining(!isRaining)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1 font-serif active:scale-95 transition ${
                  isRaining ? 'bg-sky-500/20 border-sky-400 text-sky-200' : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>{isRaining ? 'Mưa: Bật' : 'Mưa: Tắt'}</span>
              </button>

              {/* Âm thanh */}
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  if (next) soundEngine.playBell(528, 1.5);
                }}
                className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1 font-serif active:scale-95 transition ${
                  soundEnabled ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-stone-900 border-stone-800 text-stone-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{soundEnabled ? 'Âm: Bật' : 'Âm: Tắt'}</span>
              </button>

              {/* Sổ tay */}
              <button
                onClick={() => {
                  setShowJournalModal(true);
                  setShowMobileDrawer(false);
                }}
                className="p-2 rounded-xl bg-stone-900 border border-stone-700 text-amber-200 text-xs flex items-center justify-center gap-1 font-serif active:scale-95 transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sổ Tay</span>
              </button>

              {/* Nhân vật */}
              <button
                onClick={() => {
                  setShowCharModal(true);
                  setShowMobileDrawer(false);
                }}
                className="p-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs flex items-center justify-center gap-1 font-serif active:scale-95 transition"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Ngoại Hình</span>
              </button>

              {/* Bảng Công Quả & Mốc Thiện Hạnh (Mobile) */}
              <button
                onClick={() => {
                  setShowQuestModal(true);
                  setShowMobileDrawer(false);
                }}
                className="col-span-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-700/30 border border-amber-400/50 text-amber-200 text-xs flex items-center justify-center gap-2 font-serif font-bold active:scale-95 transition shadow-sm"
              >
                <ScrollText className="w-4 h-4 text-amber-300" />
                <span>Bảng Công Quả & Mốc Thiện Hạnh ({completedQuestsCount}/8)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          2. NỘI DUNG CHÍNH: 3D SƠN TỰ / THẾ GIỚI MỞ 2D / GÓC NHÌN TĨNH
          ========================================================= */}
      {worldMode === '3D' ? (
        <main className="relative flex-1 w-full h-full overflow-hidden">
          <Zen3DWorld
            character={character}
            level={effectiveLevel}
            timePhase={timePhase}
            isRaining={isRaining}
            onOpenSweeping={() => {
              setTimePhase('MORNING');
              setOpenWorldActivity('SWEEP');
            }}
            onOpenTeaHouse={() => {
              setTimePhase('AFTERNOON');
              setOpenWorldActivity('TEA');
            }}
            onOpenDharma={() => {
              setTimePhase('EVENING');
              setOpenWorldActivity('DHARMA');
            }}
            onOpenWoodChopping={() => setActiveQuestModal('CHOP_WOOD')}
            onOpenWaterCarrying={() => setActiveQuestModal('CARRY_WATER')}
            onOpenAltarCleaning={() => setActiveQuestModal('CLEAN_ALTAR')}
            onOpenCharity={() => setActiveQuestModal('CHARITY')}
            onAddMerit={(amount, x, y, label) => addMerit(amount, x, y, label)}
            spendStamina={spendStamina}
          />
        </main>
      ) : worldMode === 'OPEN_WORLD' ? (
        <main className="relative flex-1 w-full h-full overflow-hidden">
          <ZenOpenWorld
            character={character}
            level={effectiveLevel}
            timePhase={timePhase}
            isRaining={isRaining}
            onOpenSweeping={() => {
              setTimePhase('MORNING');
              setOpenWorldActivity('SWEEP');
            }}
            onOpenTeaHouse={() => {
              setTimePhase('AFTERNOON');
              setOpenWorldActivity('TEA');
            }}
            onOpenDharma={() => {
              setTimePhase('EVENING');
              setOpenWorldActivity('DHARMA');
            }}
            onOpenWoodChopping={() => setActiveQuestModal('CHOP_WOOD')}
            onOpenWaterCarrying={() => setActiveQuestModal('CARRY_WATER')}
            onOpenAltarCleaning={() => setActiveQuestModal('CLEAN_ALTAR')}
            onOpenCharity={() => setActiveQuestModal('CHARITY')}
            onOpenCharModal={() => setShowCharModal(true)}
            onAddMerit={(amount, x, y, label) => addMerit(amount, x, y, label)}
            spendStamina={spendStamina}
          />
        </main>
      ) : (
        <div
          className={`relative flex-1 w-full h-full overflow-hidden transition-all duration-700 bg-gradient-to-b ${skyGradientByPhase[timePhase]}`}
          style={{
            filter: `grayscale(${grayscalePercent}%) saturate(${saturationPercent}%)`,
          }}
        >
        {/* LỚP NỀN THỦY MẶC SƠN TỰ */}
        <svg
          viewBox="0 0 1200 700"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="30%" r="45%">
              <stop offset="0%" stopColor={timePhase === 'EVENING' ? '#fef08a' : '#fde047'} stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mountainFar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={timePhase === 'EVENING' ? '#1e293b' : '#57534e'} stopOpacity="0.6" />
              <stop offset="100%" stopColor={timePhase === 'EVENING' ? '#0f172a' : '#a8a29e'} stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="courtyardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={timePhase === 'EVENING' ? '#1e293b' : '#d6d3d1'} />
              <stop offset="100%" stopColor={timePhase === 'EVENING' ? '#0f172a' : '#a8a29e'} />
            </linearGradient>
          </defs>

          {/* Vầng Trăng / Thái Dương */}
          <circle
            cx={timePhase === 'EVENING' ? 950 : 920}
            cy={timePhase === 'AFTERNOON' ? 220 : 130}
            r={timePhase === 'EVENING' ? 55 : 95}
            fill="url(#sunGlow)"
          />
          <circle
            cx={timePhase === 'EVENING' ? 950 : 920}
            cy={timePhase === 'AFTERNOON' ? 220 : 130}
            r={timePhase === 'EVENING' ? 32 : 46}
            fill={timePhase === 'EVENING' ? '#fef9c3' : '#f59e0b'}
            opacity="0.88"
          />

          {/* Dãy núi Vân Sơn sương khói */}
          <path
            d="M0,420 Q200,220 420,350 T850,280 T1200,380 L1200,600 L0,600 Z"
            fill="url(#mountainFar)"
          />
          <path
            d="M-50,460 Q280,310 580,410 T1100,320 L1250,550 L-50,550 Z"
            fill={timePhase === 'EVENING' ? '#0f172a' : '#44403c'}
            opacity="0.45"
          />

          {/* Chánh Điện Chùa Vân Ẩn cổ kính */}
          <g transform="translate(140, 200)">
            <rect x="50" y="110" width="280" height="150" fill={timePhase === 'EVENING' ? '#334155' : '#78350f'} />
            <rect x="75" y="130" width="65" height="130" fill={timePhase === 'EVENING' ? '#fbbf24' : '#fef3c7'} opacity="0.8" />
            <rect x="155" y="130" width="65" height="130" fill={timePhase === 'EVENING' ? '#fbbf24' : '#fef3c7'} opacity="0.8" />
            <rect x="235" y="130" width="65" height="130" fill={timePhase === 'EVENING' ? '#475569' : '#92400e'} />

            {/* Mái đao cong 2 tầng */}
            <path
              d="M0,120 Q190,65 380,120 Q330,45 190,40 Q50,45 0,120 Z"
              fill={timePhase === 'EVENING' ? '#1e293b' : '#451a03'}
            />
            <path
              d="M30,70 Q190,20 350,70 Q290,10 190,5 Q90,10 30,70 Z"
              fill={timePhase === 'EVENING' ? '#0f172a' : '#292524'}
            />

            {/* Đèn lồng đỏ treo hiên chùa */}
            <circle cx="45" cy="125" r="11" fill="#ef4444" />
            <circle cx="45" cy="125" r="18" fill="#fde047" opacity={timePhase === 'EVENING' ? '0.7' : '0.25'} />
            <circle cx="335" cy="125" r="11" fill="#ef4444" />
            <circle cx="335" cy="125" r="18" fill="#fde047" opacity={timePhase === 'EVENING' ? '0.7' : '0.25'} />

            {/* Chuông Đại Hồng Chung đồng thau treo hiên chánh điện */}
            <g transform="translate(190, 115)">
              <rect x="-2" y="-10" width="4" height="10" fill="#451a03" />
              <path
                d="M-14,0 C-14,16 -20,26 -20,32 C-20,36 20,36 20,32 C20,26 14,16 14,0 Z"
                fill="#d97706"
                stroke="#78350f"
                strokeWidth="1.5"
                className={isBellRinging ? 'animate-pulse' : ''}
              />
              <ellipse cx="0" cy="32" rx="20" ry="4" fill="#b45309" stroke="#78350f" strokeWidth="1" />
              <circle cx="0" cy="16" r="4" fill="#fde047" opacity="0.8" />
            </g>

            {/* Sóng âm thanh chuông chùa ngân vang vẳng khắp non xa */}
            {isBellRinging && (
              <g transform="translate(190, 140)">
                <circle cx="0" cy="0" r="30" fill="none" stroke="#fde047" strokeWidth="3" opacity="0.9" className="animate-ping" />
                <circle cx="0" cy="0" r="70" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.75" className="animate-ping" style={{ animationDelay: '200ms' }} />
                <circle cx="0" cy="0" r="120" fill="none" stroke="#d97706" strokeWidth="2" opacity="0.6" className="animate-ping" style={{ animationDelay: '400ms' }} />
                <circle cx="0" cy="0" r="180" fill="none" stroke="#b45309" strokeWidth="1.5" opacity="0.4" className="animate-ping" style={{ animationDelay: '700ms' }} />
                <circle cx="0" cy="0" r="260" fill="none" stroke="#78350f" strokeWidth="1" opacity="0.25" className="animate-ping" style={{ animationDelay: '1000ms' }} />
              </g>
            )}
          </g>

          {/* Sân gạch chùa rộng rãi */}
          <path d="M0,450 L1200,450 L1200,700 L0,700 Z" fill="url(#courtyardGrad)" />
          <line x1="0" y1="520" x2="1200" y2="520" stroke="#78716c" strokeOpacity="0.25" strokeWidth="1.5" />
          <line x1="0" y1="600" x2="1200" y2="600" stroke="#78716c" strokeOpacity="0.25" strokeWidth="1.5" />

          {/* Cây Đa Cổ Thụ sum suê bên phải */}
          <g transform="translate(820, 100)">
            <path
              d="M170,400 Q160,260 135,190 Q85,140 40,150 Q120,110 175,160 Q225,100 295,135 Q230,180 220,270 Q220,350 250,400 Z"
              fill={timePhase === 'EVENING' ? '#1e293b' : '#57534e'}
            />
            <circle cx="120" cy="130" r="100" fill={effectiveLevel >= 6 ? '#15803d' : '#4d7c0f'} opacity="0.85" />
            <circle cx="230" cy="110" r="110" fill={effectiveLevel >= 16 ? '#0d9488' : '#166534'} opacity="0.85" />
            <circle cx="170" cy="65" r="90" fill={effectiveLevel >= 10 ? '#eab308' : '#65a30d'} opacity="0.65" />
          </g>

          {/* Hồ Liên Hoa nở hoa khi Cấp >= 6 */}
          {effectiveLevel >= 6 && (
            <g transform="translate(60, 560)">
              <ellipse cx="140" cy="45" rx="130" ry="36" fill="#0ea5e9" opacity="0.35" />
              <circle cx="90" cy="40" r="14" fill="#16a34a" opacity="0.8" />
              <circle cx="170" cy="50" r="16" fill="#15803d" opacity="0.8" />
              <path d="M90,26 L96,40 L84,40 Z" fill="#f472b6" />
              <path d="M170,34 L178,50 L162,50 Z" fill="#fb7185" />
            </g>
          )}
        </svg>

        {/* Hiệu ứng Mưa Thiền */}
        {isRaining && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
            {Array.from({ length: 30 }).map((_, idx) => (
              <div
                key={idx}
                className="absolute w-[1.5px] h-12 bg-gradient-to-b from-transparent to-sky-200 animate-pulse"
                style={{
                  left: `${(idx * 13) % 100}%`,
                  top: `${(idx * 23) % 90}%`,
                  transform: 'rotate(12deg)',
                }}
              />
            ))}
          </div>
        )}



        {/* =========================================================
            NỘI DUNG GAME THEO BUỔI (TRỰC DIỆN TRÊN FULL MÀN HÌNH)
            ========================================================= */}

        {/* NỘI DUNG GAME THEO BUỔI Ở CHẾ ĐỘ FOCUS */}
        {timePhase === 'MORNING' && renderSweepingSection(false)}
          {timePhase === 'AFTERNOON' && renderTeaSection(false)}
          {timePhase === 'EVENING' && renderDharmaSection(false)}
        </div>
      )}

      {/* =========================================================
          3. MODAL HOẠT ĐỘNG THẾ GIỚI MỞ (KHI VÀO ĐIỂM DỪNG CHÂN)
          ========================================================= */}
      {worldMode === 'OPEN_WORLD' && openWorldActivity !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-stone-950/95 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {openWorldActivity === 'SWEEP' ? '🍂' : openWorldActivity === 'TEA' ? '🍵' : '🪷'}
                </span>
                <span className="font-heading font-bold text-amber-100 text-sm sm:text-base">
                  {openWorldActivity === 'SWEEP'
                    ? 'Sân Chùa: Quét Lá Đa & Giữ Tâm Điềm Tĩnh'
                    : openWorldActivity === 'TEA'
                    ? 'Hiên Trà Chùa Vân Ẩn: Lắng Nghe Khách Thập Phương'
                    : 'Chánh Điện: Khóa Lễ & Bài Giảng Phật Giáo'}
                </span>
              </div>
              <button
                onClick={() => setOpenWorldActivity('NONE')}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 text-xs font-serif flex items-center gap-1.5 cursor-pointer shadow-md transition"
              >
                <X className="w-4 h-4 text-amber-400" />
                <span>Quay Lại Thế Giới Mở</span>
              </button>
            </div>

            {openWorldActivity === 'SWEEP' && renderSweepingSection(true)}
            {openWorldActivity === 'TEA' && renderTeaSection(true)}
            {openWorldActivity === 'DHARMA' && renderDharmaSection(true)}
          </div>
        </div>
      )}

      {/* Floating text messages (hiển thị trên mọi chế độ) */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className={`fixed pointer-events-none z-50 text-base drop-shadow-md transition-all duration-1000 -translate-x-1/2 -translate-y-4 font-serif font-bold ${ft.color}`}
          style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
        >
          {ft.text}
        </div>
      ))}
      

      {/* =========================================================
          3. FLOATING MODALS
          ========================================================= */}

      {/* Modal Tùy biến nhân vật */}
      {showCharModal && (
        <CharacterCreationModal
          initialCharacter={character}
          isFirstTime={isFirstLaunch}
          onSave={(updated) => {
            setCharacter(updated);
            setShowCharModal(false);
            setIsFirstLaunch(false);
            spawnFloatingText(`Chào mừng Cư sĩ ${updated.name} 🙏`, 'text-amber-300 font-bold', 50, 40);
          }}
          onClose={() => setShowCharModal(false)}
        />
      )}


      {/* =========================================================
          4. CÁC MODAL CÔNG QUẢ & HOẠT ĐỘNG THIỆN TÂM
          ========================================================= */}

      {/* Modal Bảng Công Quả & Mốc Thành Tựu */}
      {showQuestModal && (
        <ZenQuestModal
          currentMerit={merit}
          questProgress={questProgress}
          onStartActivity={(actKey) => handleStartActivity(actKey)}
          onClaimQuestReward={(_qId, mReward, sReward) => {
            addMerit(mReward, 50, 40, '✨ Nhận Phước Báu ');
            setStamina((prev) => Math.min(100, prev + sReward));
          }}
          onClose={() => setShowQuestModal(false)}
        />
      )}

      {/* Modal Chẻ Củi Nấu Cơm Chay */}
      {activeQuestModal === 'CHOP_WOOD' && (
        <WoodChoppingModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CHOP_WOOD', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStamina}
        />
      )}

      {/* Modal Gánh Nước Suối Lên Chùa */}
      {activeQuestModal === 'CARRY_WATER' && (
        <WaterCarryingModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CARRY_WATER', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStamina}
        />
      )}

      {/* Modal Lau Chùi Bàn Thờ Đức Phật */}
      {activeQuestModal === 'CLEAN_ALTAR' && (
        <AltarCleaningModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CLEAN_ALTAR', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStamina}
        />
      )}

      {/* Modal Hoạt Động Thiện Tâm & Cứu Tế */}
      {activeQuestModal === 'CHARITY' && (
        <CharityModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CHARITY', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStamina}
        />
      )}

      {/* Modal Sổ Tay Tỉnh Thức */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="zen-paper-panel max-w-2xl w-full rounded-3xl p-6 sm:p-8 relative flex flex-col border border-amber-500/50 shadow-2xl max-h-[85vh] overflow-hidden">
            <button
              onClick={() => setShowJournalModal(false)}
              className="absolute top-5 right-5 text-stone-500 hover:text-stone-800 p-2 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-900/15 pb-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 flex items-center justify-center text-2xl text-amber-900">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-stone-900">
                  Sổ Tay Tỉnh Thức
                </h3>
                <p className="text-xs text-stone-600 font-serif">
                  Kho tàng pháp ngữ & các câu kệ ngộ đạo thu thập qua các buổi thính pháp.
                </p>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {unlockedQuotes.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300/80 text-xs text-stone-800 italic font-serif leading-relaxed shadow-sm flex items-start gap-2.5"
                >
                  <span className="text-amber-600 text-sm">📜</span>
                  <span>&ldquo;{q}&rdquo;</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Shader slider toggle ở góc dưới bên phải */}
      <div className="absolute bottom-16 sm:bottom-4 right-3 sm:right-64 z-20">
        {!showShaderControl ? (
          <button
            onClick={() => setShowShaderControl(true)}
            className="px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 backdrop-blur-md border border-stone-700 text-xs text-stone-300 flex items-center gap-1.5 cursor-pointer font-serif shadow-lg"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Shader Màu Nước</span>
          </button>
        ) : (
          <div className="bg-stone-900/90 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3 flex items-center gap-3 text-xs shadow-2xl">
            <span className="font-serif text-stone-300">Cấp độ {effectiveLevel}:</span>
            <input
              type="range"
              min={1}
              max={32}
              value={effectiveLevel}
              onChange={(e) => setPreviewLevelOverride(Number(e.target.value))}
              className="w-28 accent-amber-400 cursor-pointer"
            />
            <span className="font-mono text-amber-300 text-[11px]">(Xám {grayscalePercent}%)</span>
            {previewLevelOverride !== null && (
              <button
                onClick={() => setPreviewLevelOverride(null)}
                className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 cursor-pointer"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => setShowShaderControl(false)}
              className="text-stone-400 hover:text-stone-200 cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
