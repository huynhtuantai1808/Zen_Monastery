import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Sliders,
  X,
  Sun,
  Sunset,
  Moon,
  Coffee,
  CloudRain,
  Volume2,
  VolumeX,
  Palette,
  ScrollText,
} from 'lucide-react';
import { useGameStore } from './store/gameStore';
import { CharacterCreationModal } from './components/CharacterCreationModal';
import { TopHeaderHUD } from './components/TopHeaderHUD';
import { GraphicsSettingsModal } from './components/GraphicsSettingsModal';
import { SweepingModal } from './components/SweepingModal';
import { TeaHouseModal } from './components/TeaHouseModal';
import { DharmaEveningModal } from './components/DharmaEveningModal';
import { ZenOpenWorld } from './canvas/ZenOpenWorld';
import { Zen3DWorld } from './canvas/Zen3DWorld';
import { WoodChoppingModal } from './components/WoodChoppingModal';
import { WaterCarryingModal } from './components/WaterCarryingModal';
import { AltarCleaningModal } from './components/AltarCleaningModal';
import { CharityModal } from './components/CharityModal';
import { ZenQuestModal } from './components/ZenQuestModal';
import { ZEN_QUESTS, type ZenQuestItem } from './data/zenQuests';
import { soundEngine } from './services/audioEngine';

interface FloatingText {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
}

export default function App() {
  // 1. Quản lý State toàn cục tập trung từ gameStore
  const {
    stats,
    addCongDuc,
    spendTamLuc,
    restoreTamLuc,
    updateCharacter,
    questProgress,
    updateQuestProgress,
    unlockedQuotes,
  } = useGameStore();

  const character = stats.character;
  const level = stats.level;
  const merit = stats.congDuc;

  // 2. Local UI State
  const [showCharModal, setShowCharModal] = useState<boolean>(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(false);
  const [showGraphicsModal, setShowGraphicsModal] = useState<boolean>(false);
  const [showQuestModal, setShowQuestModal] = useState<boolean>(false);
  const [activeQuestModal, setActiveQuestModal] = useState<ZenQuestItem['activityKey'] | null>(null);
  const [showJournalModal, setShowJournalModal] = useState<boolean>(false);

  // Time Phase & Weather
  const [timePhase, setTimePhase] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showShaderControl, setShowShaderControl] = useState<boolean>(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);
  const [previewLevelOverride, setPreviewLevelOverride] = useState<number | null>(null);

  // Floating text feedback
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Chuông chùa vang vẳng & Đồ họa
  const [isBellRinging, setIsBellRinging] = useState<boolean>(false);
  const [ambientBellActive, setAmbientBellActive] = useState<boolean>(true);

  // Nhạc nền thiền On Rainy Days BGM
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(soundEngine.getIsBgmPlaying());

  // Chế độ thế giới: 3D / 2D / Tĩnh
  const [worldMode, setWorldMode] = useState<'3D' | 'OPEN_WORLD' | 'FOCUS'>('3D');
  const [openWorldActivity, setOpenWorldActivity] = useState<'NONE' | 'SWEEP' | 'TEA' | 'DHARMA'>('NONE');

  // Khởi tạo audio & BGM listeners
  useEffect(() => {
    soundEngine.registerAutoplayOnFirstGesture();
    soundEngine.playBGM();

    const unsub = soundEngine.addBgmListener((playing) => {
      setIsBgmPlaying(playing);
    });
    return () => unsub();
  }, []);

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

  // Tự động ngân chuông chùa định kỳ
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

  // Cộng công đức qua gameStore
  const addMerit = useCallback(
    (baseAmount: number, x = 50, y = 45, labelPrefix = '') => {
      const finalAmount = Math.round(baseAmount * (stats.tamSangBuff ? 1.5 : 1.0));
      addCongDuc(finalAmount);
      spawnFloatingText(
        `${labelPrefix}+${finalAmount} Công Đức ${stats.tamSangBuff ? '(x1.5 Buff Tâm Sáng)' : ''}`,
        'text-emerald-300 font-semibold',
        x,
        y
      );
    },
    [stats.tamSangBuff, addCongDuc, spawnFloatingText]
  );

  // Tiêu hao tâm lực qua gameStore
  const spendStaminaHandler = useCallback(
    (amount: number): boolean => {
      const ok = spendTamLuc(amount);
      if (!ok) {
        soundEngine.playWarning();
        spawnFloatingText('Cạn Tâm Lực! Hãy uống một chén trà ấm 🍵', 'text-rose-300 font-serif', 50, 45);
        return false;
      }
      return true;
    },
    [spendTamLuc, spawnFloatingText]
  );

  // Thưởng trà hồi phục tâm lực
  const handleDrinkTea = () => {
    soundEngine.playBell(396, 1.8);
    restoreTamLuc(35);
    spawnFloatingText('+35 Tâm Lực (An thần) 🍵', 'text-teal-300', 70, 20);
  };

  // Hoàn thành nhiệm vụ công quả & cộng thưởng
  const handleCompleteQuestActivity = (activityKey: ZenQuestItem['activityKey'], meritBonus: number, staminaRestore: number) => {
    addMerit(meritBonus, 50, 40, '✨ Công Quả Viên Mãn ');
    restoreTamLuc(staminaRestore);

    const quest = ZEN_QUESTS.find((q) => q.activityKey === activityKey);
    if (quest) {
      updateQuestProgress(quest.id, quest.targetCount, true);
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
      updateQuestProgress('feed_koi', 1, true);
      soundEngine.playWoodenFish();
    } else {
      setActiveQuestModal(key);
    }
  };

  const completedQuestsCount = Object.values(questProgress).filter((q) => q.completed).length;
  const effectiveLevel = previewLevelOverride !== null ? previewLevelOverride : level;
  const grayscalePercent = Math.max(0, Math.round(80 - (effectiveLevel - 1) * 4.2));
  const saturationPercent = Math.min(135, Math.round(70 + effectiveLevel * 3));

  const skyGradientByPhase = {
    MORNING: 'from-amber-200/80 via-emerald-100/70 to-stone-200',
    AFTERNOON: 'from-orange-300/80 via-amber-100/75 to-stone-300',
    EVENING: 'from-indigo-950 via-slate-900 to-stone-900',
  };

  return (
    <div
      onClick={() => soundEngine.initContext()}
      className="relative w-screen h-screen overflow-hidden bg-stone-950 text-stone-100 select-none font-sans flex flex-col"
    >
      {/* =========================================================
          1. FLOATING TOP HUD (COMPONENT HÓA TÁCH BIỆT)
          ========================================================= */}
      <TopHeaderHUD
        worldMode={worldMode}
        timePhase={timePhase}
        isRaining={isRaining}
        soundEnabled={soundEnabled}
        isBgmPlaying={isBgmPlaying}
        isBellRinging={isBellRinging}
        ambientBellActive={ambientBellActive}
        onToggleAmbientBell={() => setAmbientBellActive((prev) => !prev)}
        onOpenCharModal={() => setShowCharModal(true)}
        onOpenQuestModal={() => setShowQuestModal(true)}
        onOpenJournalModal={() => setShowJournalModal(true)}
        onOpenGraphicsModal={() => setShowGraphicsModal(true)}
        onToggleWorldMode={() => {
          setWorldMode((prev) => (prev === '3D' ? 'OPEN_WORLD' : prev === 'OPEN_WORLD' ? 'FOCUS' : '3D'));
          soundEngine.playWoodenFish();
        }}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          if (next) {
            if (soundEngine.getMuted()) soundEngine.toggleMute();
            soundEngine.playBell(528, 1.5);
            soundEngine.playBGM();
          } else {
            if (!soundEngine.getMuted()) soundEngine.toggleMute();
          }
        }}
        onToggleBgm={() => soundEngine.toggleBGM()}
        onToggleRain={() => setIsRaining((prev) => !prev)}
        onChangeTimePhase={(phase) => {
          setTimePhase(phase);
          soundEngine.playBell(phase === 'MORNING' ? 432 : phase === 'AFTERNOON' ? 480 : 396, 1.5);
        }}
        onRingBell={triggerTempleBell}
        onDrinkTea={handleDrinkTea}
        onToggleMobileDrawer={() => setShowMobileDrawer((prev) => !prev)}
      />

      {/* MOBILE ZEN DRAWER / SHEET */}
      {showMobileDrawer && (
        <div className="lg:hidden fixed top-16 left-3 right-3 z-40 bg-stone-950/95 backdrop-blur-2xl border-2 border-amber-500/50 p-3.5 rounded-2xl shadow-2xl space-y-3">
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
              <span>Sáng</span>
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
              <span>Chiều</span>
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
              <span>Tối</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
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

            <button
              onClick={() => triggerTempleBell()}
              className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-center gap-1 font-serif active:scale-95 transition"
            >
              <span>🔔</span>
              <span>Chuông</span>
            </button>

            <button
              onClick={() => setIsRaining(!isRaining)}
              className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1 font-serif active:scale-95 transition ${
                isRaining ? 'bg-sky-500/20 border-sky-400 text-sky-200' : 'bg-stone-900 border-stone-800 text-stone-400'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>{isRaining ? 'Mưa: Bật' : 'Mưa: Tắt'}</span>
            </button>

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

            <button
              onClick={() => {
                setShowQuestModal(true);
                setShowMobileDrawer(false);
              }}
              className="col-span-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-700/30 border border-amber-400/50 text-amber-200 text-xs flex items-center justify-center gap-2 font-serif font-bold active:scale-95 transition shadow-sm"
            >
              <ScrollText className="w-4 h-4 text-amber-300" />
              <span>Bảng Công Quả ({completedQuestsCount}/8)</span>
            </button>
          </div>
        </div>
      )}

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
            spendStamina={spendStaminaHandler}
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
            spendStamina={spendStaminaHandler}
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

              {isBellRinging && (
                <g transform="translate(190, 140)">
                  <circle cx="0" cy="0" r="30" fill="none" stroke="#fde047" strokeWidth="3" opacity="0.9" className="animate-ping" />
                  <circle cx="0" cy="0" r="70" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.75" className="animate-ping" style={{ animationDelay: '200ms' }} />
                  <circle cx="0" cy="0" r="120" fill="none" stroke="#d97706" strokeWidth="2" opacity="0.6" className="animate-ping" style={{ animationDelay: '400ms' }} />
                </g>
              )}
            </g>

            {/* Sân gạch chùa rộng rãi */}
            <path d="M0,450 L1200,450 L1200,700 L0,700 Z" fill="url(#courtyardGrad)" />
            <line x1="0" y1="520" x2="1200" y2="520" stroke="#78716c" strokeOpacity="0.25" strokeWidth="1.5" />
            <line x1="0" y1="600" x2="1200" y2="600" stroke="#78716c" strokeOpacity="0.25" strokeWidth="1.5" />
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

          {/* NỘI DUNG GAME THEO BUỔI Ở CHẾ ĐỘ FOCUS */}
          {timePhase === 'MORNING' && (
            <SweepingModal
              isOpen={true}
              isModal={false}
              onClose={() => {}}
              onAddMerit={addMerit}
              spendStamina={spendStaminaHandler}
              onOpenCharModal={() => setShowCharModal(true)}
            />
          )}
          {timePhase === 'AFTERNOON' && (
            <TeaHouseModal
              isOpen={true}
              isModal={false}
              onClose={() => {}}
              onAddMerit={addMerit}
              spendStamina={spendStaminaHandler}
              onOpenCharModal={() => setShowCharModal(true)}
            />
          )}
          {timePhase === 'EVENING' && (
            <DharmaEveningModal
              isOpen={true}
              isModal={false}
              onClose={() => {}}
              onAddMerit={addMerit}
              spendStamina={spendStaminaHandler}
              onOpenCharModal={() => setShowCharModal(true)}
              onNewDay={() => setTimePhase('MORNING')}
            />
          )}
        </div>
      )}

      {/* =========================================================
          3. CÁC MODAL HOẠT ĐỘNG MINIGAME (KHI MỞ TỪ 3D / 2D)
          ========================================================= */}
      {/* Mini-game Quét Lá */}
      <SweepingModal
        isOpen={openWorldActivity === 'SWEEP'}
        isModal={true}
        onClose={() => setOpenWorldActivity('NONE')}
        onAddMerit={addMerit}
        spendStamina={spendStaminaHandler}
        onOpenCharModal={() => setShowCharModal(true)}
      />

      {/* Mini-game Hiên Trà */}
      <TeaHouseModal
        isOpen={openWorldActivity === 'TEA'}
        isModal={true}
        onClose={() => setOpenWorldActivity('NONE')}
        onAddMerit={addMerit}
        spendStamina={spendStaminaHandler}
        onOpenCharModal={() => setShowCharModal(true)}
      />

      {/* Mini-game Khóa Lễ & Bài Giảng Phật Giáo */}
      <DharmaEveningModal
        isOpen={openWorldActivity === 'DHARMA'}
        isModal={true}
        onClose={() => setOpenWorldActivity('NONE')}
        onAddMerit={addMerit}
        spendStamina={spendStaminaHandler}
        onOpenCharModal={() => setShowCharModal(true)}
        onNewDay={() => {
          setTimePhase('MORNING');
          setOpenWorldActivity('NONE');
        }}
      />

      {/* =========================================================
          4. CÀI ĐẶT ĐỒ HỌA (THẤP / CAO) MODAL
          ========================================================= */}
      <GraphicsSettingsModal
        isOpen={showGraphicsModal}
        onClose={() => setShowGraphicsModal(false)}
      />

      {/* Floating text messages */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className={`fixed pointer-events-none z-50 text-base drop-shadow-md transition-all duration-1000 -translate-x-1/2 -translate-y-4 font-serif font-bold ${ft.color}`}
          style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
        >
          {ft.text}
        </div>
      ))}

      {/* Modal Tùy biến nhân vật */}
      {showCharModal && (
        <CharacterCreationModal
          initialCharacter={character}
          isFirstTime={isFirstLaunch}
          onSave={(updated) => {
            updateCharacter(updated);
            setShowCharModal(false);
            setIsFirstLaunch(false);
            spawnFloatingText(`Chào mừng Cư sĩ ${updated.name} 🙏`, 'text-amber-300 font-bold', 50, 40);
          }}
          onClose={() => setShowCharModal(false)}
        />
      )}

      {/* Modal Bảng Công Quả */}
      {showQuestModal && (
        <ZenQuestModal
          currentMerit={merit}
          questProgress={questProgress}
          onStartActivity={(actKey) => handleStartActivity(actKey)}
          onClaimQuestReward={(_qId, mReward, sReward) => {
            addMerit(mReward, 50, 40, '✨ Nhận Phước Báu ');
            restoreTamLuc(sReward);
          }}
          onClose={() => setShowQuestModal(false)}
        />
      )}

      {/* Modal Chẻ Củi */}
      {activeQuestModal === 'CHOP_WOOD' && (
        <WoodChoppingModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CHOP_WOOD', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStaminaHandler}
        />
      )}

      {/* Modal Gánh Nước Suối */}
      {activeQuestModal === 'CARRY_WATER' && (
        <WaterCarryingModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CARRY_WATER', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStaminaHandler}
        />
      )}

      {/* Modal Lau Chùi Bàn Thờ */}
      {activeQuestModal === 'CLEAN_ALTAR' && (
        <AltarCleaningModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CLEAN_ALTAR', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStaminaHandler}
        />
      )}

      {/* Modal Hoạt Động Thiện Tâm & Cứu Tế */}
      {activeQuestModal === 'CHARITY' && (
        <CharityModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CHARITY', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStaminaHandler}
        />
      )}

      {/* Modal Sổ Tay Tỉnh Thức */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="anime-paper-panel max-w-2xl w-full rounded-[32px] p-6 sm:p-8 relative flex flex-col border-2 border-pink-400/40 shadow-[0_20px_60px_rgba(244,114,182,0.25)] max-h-[85vh] overflow-hidden">
            <button
              onClick={() => setShowJournalModal(false)}
              className="absolute top-5 right-5 text-purple-900/50 hover:text-pink-600 p-2.5 rounded-full hover:bg-pink-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 border-b border-purple-200/60 pb-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl text-white shadow-[0_4px_16px_rgba(244,114,182,0.4)] border border-white/50">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-black text-purple-950">
                  Sổ Tay Tỉnh Thức
                </h3>
                <p className="text-xs text-purple-800/80 font-sans font-semibold">
                  Kho tàng pháp ngữ & các câu kệ ngộ đạo thu thập qua các buổi thính pháp.
                </p>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {unlockedQuotes.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/80 border-2 border-pink-200/70 text-xs text-purple-950 italic font-serif leading-relaxed shadow-sm flex items-start gap-2.5 hover:bg-pink-50/70 transition-colors"
                >
                  <span className="text-pink-500 text-sm">📜</span>
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
            className="px-3.5 py-2 rounded-2xl anime-glass-panel border border-pink-400/30 text-xs text-pink-200 hover:text-white flex items-center gap-2 cursor-pointer font-heading font-bold shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform"
          >
            <Sliders className="w-3.5 h-3.5 text-pink-400" />
            <span>Test Shader Màu Nước</span>
          </button>
        ) : (
          <div className="anime-glass-panel border border-pink-400/40 rounded-3xl p-3.5 flex items-center gap-3 text-xs shadow-2xl">
            <span className="font-heading font-bold text-pink-200">Cấp độ {effectiveLevel}:</span>
            <input
              type="range"
              min={1}
              max={32}
              value={effectiveLevel}
              onChange={(e) => setPreviewLevelOverride(Number(e.target.value))}
              className="w-28 accent-pink-500 cursor-pointer"
            />
            <span className="font-mono text-pink-300 text-[11px] font-bold">(Xám {grayscalePercent}%)</span>
            {previewLevelOverride !== null && (
              <button
                onClick={() => setPreviewLevelOverride(null)}
                className="text-[10px] px-2.5 py-1 rounded-xl bg-pink-500/20 text-pink-200 hover:bg-pink-500/40 cursor-pointer font-bold transition-colors"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => setShowShaderControl(false)}
              className="text-purple-300 hover:text-white cursor-pointer ml-1 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
