import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Eye,
  Footprints,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  MapPin,
  RotateCcw,
  Moon,
  Sun,
  Layers,
  Sparkles,
  Music,
  Volume2,
  Square,
  X,
} from 'lucide-react';
import { soundEngine } from '../services/audioEngine';
import { speakAbbotVoice, stopAbbotVoice } from '../services/monkVoiceService';
import { useZenBridge, zenWorldBridge, type TempleZoneInfo } from './bridge/zenWorldBridge';

interface Zen3DOverlaysProps {
  onAddMerit: (amount: number, x: number, y: number, label?: string) => void;
  onOpenDharma: () => void;
  onOpenTeaHouse?: () => void;
  templeZones: TempleZoneInfo[];
  isNightMode: boolean;
  onToggleNightMode: () => void;
}

export const Zen3DOverlays: React.FC<Zen3DOverlaysProps> = ({
  onAddMerit,
  onOpenDharma,
  onOpenTeaHouse,
  templeZones,
  isNightMode,
  onToggleNightMode,
}) => {
  // Bridge State Subscriptions (Selective re-renders only when relevant slice updates)
  const currentZone = useZenBridge((s) => s.currentZone);
  const zoneBanner = useZenBridge((s) => s.zoneBanner);
  const currentBuilding = useZenBridge((s) => s.currentBuilding);
  const nearInteractions = useZenBridge((s) => s.nearInteractions);
  const cameraMode = useZenBridge((s) => s.cameraMode);
  const monkPose = useZenBridge((s) => s.monkPose);
  const isTourPlaying = useZenBridge((s) => s.isTourPlaying);
  const tourIndex = useZenBridge((s) => s.tourIndex);
  const isIncenseBowing = useZenBridge((s) => s.isIncenseBowing);
  const bellNpcDialogue = useZenBridge((s) => s.bellNpcDialogue);
  const abbotDialogue = useZenBridge((s) => s.abbotDialogue);
  const teaNpcDialogue = useZenBridge((s) => s.teaNpcDialogue);
  const isTueTamVoiceActive = useZenBridge((s) => s.isTueTamVoiceActive);
  const tueTamVoiceProgress = useZenBridge((s) => s.tueTamVoiceProgress);
  const isAbbotVoiceActive = useZenBridge((s) => s.isAbbotVoiceActive);
  const abbotVoiceProgress = useZenBridge((s) => s.abbotVoiceProgress);
  const abbotVoiceDuration = useZenBridge((s) => s.abbotVoiceDuration);
  const isLanternModalOpen = useZenBridge((s) => s.isLanternModalOpen);
  const isLotusMeditationActive = useZenBridge((s) => s.isLotusMeditationActive);
  const meditationBreathPhase = useZenBridge((s) => s.meditationBreathPhase);
  const meditationBreaths = useZenBridge((s) => s.meditationBreaths);
  const isFortuneModalOpen = useZenBridge((s) => s.isFortuneModalOpen);
  const currentFortune = useZenBridge((s) => s.currentFortune);
  const isShakingLot = useZenBridge((s) => s.isShakingLot);

  // Local UI modal states
  const [selectedLanternType, setSelectedLanternType] = useState<string>('pink');
  const [customWishText, setCustomWishText] = useState<string>(
    'Cầu cho Cha Mẹ bình an, tăng long phước thọ'
  );
  const [isSprintActive, setIsSprintActive] = useState<boolean>(false);

  const toggleSprint = () => {
    setIsSprintActive((prev) => {
      const next = !prev;
      zenWorldBridge.commands.setSprintMode(next);
      return next;
    });
  };

  const handleDrawFortune = () => {
    zenWorldBridge.commands.drawFortune();
  };

  const handleCloseFortuneModal = () => {
    useZenBridge.getState().setFortuneModalOpen(false);
  };

  // Vòng lặp hơi thở chánh niệm khi tọa thiền bên hồ sen
  useEffect(() => {
    if (!isLotusMeditationActive) return;
    const interval = setInterval(() => {
      const bridge = useZenBridge.getState();
      const prevPhase = bridge.meditationBreathPhase;
      let nextPhase = prevPhase;
      let nextCount = bridge.meditationBreaths;

      if (prevPhase === 'IN') nextPhase = 'HOLD';
      else if (prevPhase === 'HOLD') nextPhase = 'OUT';
      else if (prevPhase === 'OUT') nextPhase = 'REST';
      else {
        nextPhase = 'IN';
        nextCount += 1;
        if (nextCount % 2 === 0) {
          onAddMerit(20, 50, 40, '🧘 Hơi Thở Chánh Niệm Bên Đầm Sen');
        }
      }
      bridge.setLotusMeditation(true, nextPhase, nextCount);
    }, 3200);

    return () => clearInterval(interval);
  }, [isLotusMeditationActive, onAddMerit]);

  // Tự động cất giọng đọc trầm ấm của Hòa Thượng khi có khai thị / kệ dâng hương
  useEffect(() => {
    const formatAudioTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (abbotDialogue) {
      useZenBridge.getState().setAbbotVoice(true, 0);
      const cancel = speakAbbotVoice(abbotDialogue.text, abbotDialogue.gatha, {
        onStart: () => useZenBridge.getState().setAbbotVoice(true),
        onEnd: () => {
          useZenBridge.getState().setAbbotVoice(false, 0);
        },
        onTimeUpdate: (cur, dur) => {
          if (dur > 0) {
            useZenBridge.getState().setAbbotVoice(
              true,
              Math.min(100, (cur / dur) * 100),
              {
                current: formatAudioTime(cur),
                total: formatAudioTime(dur),
              }
            );
          }
        },
      });
      return () => {
        cancel();
        useZenBridge.getState().setAbbotVoice(false, 0);
      };
    } else {
      stopAbbotVoice();
      soundEngine.stopWoodenFishRhythm();
      useZenBridge.getState().setAbbotVoice(false, 0);
    }
  }, [abbotDialogue]);

  const handleCloseAbbotDialogue = () => {
    stopAbbotVoice();
    useZenBridge.getState().setAbbotDialogue(null);
    useZenBridge.getState().setAbbotVoice(false, 0, { current: '00:00', total: '00:00' });
  };

  const handleStartDharmaChantSession = () => {
    handleCloseAbbotDialogue();
    onOpenDharma();
    onAddMerit(35, 50, 40, 'Khóa Lễ Thính Pháp & Trì Tụng');
    soundEngine.playWoodenFish();
  };

  const handleConfirmReleaseLantern = () => {
    zenWorldBridge.commands.releaseLantern(customWishText, selectedLanternType);
    useZenBridge.getState().setLanternModalOpen(false);
    onAddMerit(30, 50, 40, 'Thả Hoa Đăng Cầu Nguyện Hồ Sen');
    soundEngine.playBell(660, 2.0);
  };

  const handleDungDayBuocDi = () => {
    useZenBridge.getState().setLotusMeditation(false);
    zenWorldBridge.commands.setMonkPose('STAND');
    soundEngine.playWoodenFish();
  };

  const isAtPond = cameraMode === 'ON_RAINY_DAYS' || currentZone?.id === 'pond';

  return (
    <>
      {/* "ON RAINY DAYS" WATERCOLOR ANIME TITLE BADGE */}
      {isAtPond && (
        <div className="absolute top-5 left-6 z-30 pointer-events-auto select-none animate-fadeIn flex flex-col">
          <span className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] flex items-center gap-2">
            <span>On Rainy Days</span>
          </span>
          <span className="text-[11px] sm:text-xs font-serif text-emerald-200/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] tracking-wider">
            Hiên Chiếu Tatami Ven Suối Ngọc · Thanh Tịnh Mùa Hạ
          </span>
          <button
            onClick={() => soundEngine.toggleBGM()}
            className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/60 backdrop-blur-md text-[11px] text-emerald-200 shadow-xl transition cursor-pointer self-start"
            title="Bật/Tắt nhạc nền On Rainy Days"
          >
            <Music className="w-3.5 h-3.5 text-emerald-300" />
            <span>Nhạc thư giãn · On Rainy Days</span>
          </button>
        </div>
      )}

      {/* KOMOREBI FOLIAGE CANOPY OVERLAY */}
      {isAtPond && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Top-left leafy branch */}
          <svg className="absolute -top-3 -left-3 w-48 sm:w-72 h-36 sm:h-56 opacity-85 transition-transform duration-1000 ease-in-out" viewBox="0 0 200 150" fill="none">
            <path d="M-10,0 Q60,30 110,80 Q130,100 160,110" stroke="#14532d" strokeWidth="3" fill="none" opacity="0.6" />
            <ellipse cx="40" cy="25" rx="22" ry="12" fill="#22c55e" opacity="0.75" transform="rotate(25 40 25)" />
            <ellipse cx="65" cy="35" rx="24" ry="13" fill="#4ade80" opacity="0.85" transform="rotate(40 65 35)" />
            <ellipse cx="90" cy="55" rx="20" ry="11" fill="#16a34a" opacity="0.8" transform="rotate(50 90 55)" />
            <ellipse cx="115" cy="75" rx="18" ry="10" fill="#86efac" opacity="0.85" transform="rotate(30 115 75)" />
            <ellipse cx="138" cy="95" rx="16" ry="9" fill="#22c55e" opacity="0.75" transform="rotate(65 138 95)" />
            <ellipse cx="30" cy="45" rx="18" ry="10" fill="#15803d" opacity="0.7" transform="rotate(10 30 45)" />
            <ellipse cx="70" cy="65" rx="22" ry="11" fill="#4ade80" opacity="0.8" transform="rotate(-15 70 65)" />
          </svg>

          {/* Top-right leafy canopy */}
          <svg className="absolute -top-3 -right-3 w-56 sm:w-80 h-40 sm:h-64 opacity-90 transition-transform duration-1000 ease-in-out" viewBox="0 0 220 160" fill="none">
            <path d="M230,-10 Q160,40 100,70 Q60,90 20,105" stroke="#14532d" strokeWidth="3.5" fill="none" opacity="0.6" />
            <ellipse cx="180" cy="30" rx="26" ry="14" fill="#22c55e" opacity="0.85" transform="rotate(-30 180 30)" />
            <ellipse cx="145" cy="48" rx="24" ry="13" fill="#4ade80" opacity="0.9" transform="rotate(-45 145 48)" />
            <ellipse cx="110" cy="68" rx="22" ry="12" fill="#86efac" opacity="0.85" transform="rotate(-20 110 68)" />
            <ellipse cx="75" cy="88" rx="19" ry="10" fill="#16a34a" opacity="0.8" transform="rotate(-55 75 88)" />
            <ellipse cx="45" cy="100" rx="16" ry="9" fill="#4ade80" opacity="0.85" transform="rotate(-10 45 100)" />
            <ellipse cx="160" cy="70" rx="20" ry="11" fill="#15803d" opacity="0.75" transform="rotate(25 160 70)" />
            <ellipse cx="120" cy="95" rx="18" ry="10" fill="#22c55e" opacity="0.8" transform="rotate(-35 120 95)" />
          </svg>

          {/* Bottom-right leafy cluster */}
          <svg className="absolute -bottom-3 -right-3 w-48 sm:w-64 h-36 sm:h-52 opacity-85" viewBox="0 0 180 140" fill="none">
            <ellipse cx="150" cy="110" rx="28" ry="15" fill="#16a34a" opacity="0.8" transform="rotate(15 150 110)" />
            <ellipse cx="120" cy="95" rx="24" ry="13" fill="#22c55e" opacity="0.85" transform="rotate(-25 120 95)" />
            <ellipse cx="95" cy="115" rx="20" ry="11" fill="#4ade80" opacity="0.9" transform="rotate(35 95 115)" />
            <ellipse cx="140" cy="75" rx="18" ry="10" fill="#86efac" opacity="0.8" transform="rotate(-10 140 75)" />
          </svg>
        </div>
      )}

      {/* ON RAINY DAYS INTERACTIVE POSE CONTROLLER */}
      {isAtPond && (
        <div className="absolute top-18 sm:top-20 right-3 sm:right-6 z-30 pointer-events-auto flex items-center gap-1.5 bg-stone-900/92 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-500/40 shadow-2xl">
          <span className="text-[11px] font-serif text-emerald-300 px-2 font-bold hidden md:inline">Tư thế:</span>
          <button
            onClick={() => zenWorldBridge.commands.setMonkPose('LIE_DOWN')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${monkPose === 'LIE_DOWN' ? 'bg-emerald-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
              }`}
            title="Nằm thảnh thơi dang rộng tay trên chiếu tatami"
          >
            <span>🛌 Nằm dang tay</span>
          </button>
          <button
            onClick={() => zenWorldBridge.commands.setMonkPose('SIT_EDGE')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${monkPose === 'SIT_EDGE' ? 'bg-emerald-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
              }`}
            title="Ngồi ven hiên gỗ thả chân ngắm cá Koi"
          >
            <span>🌊 Ngồi thả chân</span>
          </button>
          <button
            onClick={() => zenWorldBridge.commands.setMonkPose('STAND')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${monkPose === 'STAND' ? 'bg-emerald-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
              }`}
            title="Đứng dậy bước đi dạo quanh khuôn viên chùa"
          >
            <span>🚶 Đứng</span>
          </button>
        </div>
      )}

      {/* INDOOR SANCTUARY / ROOM BADGE */}
      {currentBuilding && (
        <div className="absolute top-18 sm:top-20 right-4 sm:right-6 z-30 pointer-events-none animate-fadeIn">
          <div className="px-3.5 py-1.5 rounded-full bg-amber-950/90 border border-amber-400/60 text-amber-200 text-xs font-serif font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentBuilding}</span>
          </div>
        </div>
      )}

      {/* TOP BANNER: CURRENT TEMPLE ZONE NOTIFICATION */}
      {zoneBanner && (
        <div className="absolute top-18 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-fadeIn max-w-[92vw]">
          <div className="anime-glass-panel border-2 border-pink-400/60 px-4 py-2 sm:px-6 sm:py-2.5 rounded-[24px] shadow-[0_12px_36px_rgba(244,114,182,0.35)] flex items-center gap-3">
            <span className="text-2xl sm:text-3xl shrink-0 p-1.5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/40">
              {zoneBanner.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="font-heading font-black text-white text-sm sm:text-base drop-shadow">
                  {zoneBanner.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-200 border border-pink-400/30 text-[10px] font-mono font-bold">
                  {zoneBanner.dimensions}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-purple-200/90 font-sans font-medium line-clamp-1">
                {zoneBanner.subtitle}
              </div>
            </div>
            <button
              onClick={() => useZenBridge.getState().setZoneBanner(null)}
              className="text-purple-300 hover:text-white ml-2 text-xs p-1 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* DIALOGUE MODAL: CHÚ TIỂU TUỆ TĨNH THỈNH CHUÔNG */}
      {bellNpcDialogue && (
        <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[94vw] sm:max-w-md w-full animate-fadeIn">
          <div className="anime-glass-panel border-2 border-amber-400/50 p-4 sm:p-5 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl relative">
            <button
              onClick={() => useZenBridge.getState().setBellNpcDialogue(null)}
              className="absolute top-3 right-3 text-amber-200 hover:text-white text-xs p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center text-2xl shadow-lg border border-amber-300/60 ring-2 ring-amber-400/30 shrink-0">
                {bellNpcDialogue.avatar}
              </div>
              <div>
                <div className="font-heading font-black text-sm sm:text-base text-amber-200 flex items-center gap-1.5">
                  <span>{bellNpcDialogue.speaker}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-normal">
                    {bellNpcDialogue.role}
                  </span>
                </div>
                <div className="text-[11px] text-amber-100/70 font-sans">
                  Tháp Chuông Chùa Sơn Tự
                </div>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-stone-100 font-serif leading-relaxed mb-3 whitespace-pre-line bg-black/30 p-3 rounded-2xl border border-amber-500/20">
              {bellNpcDialogue.text}
            </div>

            {bellNpcDialogue.gatha && (
              <div className="text-[11px] sm:text-xs text-amber-300/90 font-serif italic text-center p-2.5 rounded-xl bg-amber-950/40 border border-amber-400/30 mb-3 whitespace-pre-line leading-relaxed shadow-inner">
                {bellNpcDialogue.gatha}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => zenWorldBridge.commands.ringBell()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-heading font-black text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5 border border-amber-300/50"
              >
                <span>🔔</span>
                <span>Thỉnh Chuông Lại</span>
              </button>
              <button
                onClick={() => useZenBridge.getState().setBellNpcDialogue(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white font-heading text-xs transition cursor-pointer border border-amber-400/30"
              >
                Tâm An Lạc 🙏
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOGUE MODAL: CHÚ TIỂU PHA TRÀ & PHỤC VỤ TRÀ (THIỀN TRÀ QUÁN / SÂN CHÙA) */}
      {teaNpcDialogue && (
        <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[94vw] sm:max-w-md w-full animate-fadeIn">
          <div className="anime-glass-panel border-2 border-emerald-400/60 p-4 sm:p-5 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl relative bg-stone-950/90">
            <button
              onClick={() => {
                zenWorldBridge.commands.stopTueTamVoice();
                useZenBridge.getState().setTeaNpcDialogue(null);
              }}
              className="absolute top-3 right-3 text-emerald-200 hover:text-white text-xs p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-2xl shadow-lg border border-emerald-300/60 ring-2 ring-emerald-400/30 shrink-0">
                {teaNpcDialogue.avatar}
              </div>
              <div>
                <div className="font-heading font-black text-sm sm:text-base text-emerald-200 flex items-center gap-1.5">
                  <span>{teaNpcDialogue.speaker}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-normal">
                    {teaNpcDialogue.role}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-100/70 font-sans">
                  {teaNpcDialogue.speaker.includes('Tuệ Tâm') ? 'Sân Chùa Đại Cảnh • Quét Sân Chánh Niệm' : 'Hiên Trà Thiền Môn • Thiền Trà Quán'}
                </div>
              </div>
            </div>

            {/* AUDIO PLAYER BAR CHO CHÚ TIỂU TUỆ TÂM */}
            {teaNpcDialogue.speaker.includes('Tuệ Tâm') && (
              <div className="mb-3 p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/60 to-emerald-950/60 border border-amber-400/40 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl ${isTueTamVoiceActive ? 'bg-amber-400 text-stone-950 animate-pulse' : 'bg-white/10 text-amber-200'}`}>
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-amber-200 flex items-center gap-1.5">
                      <span>{isTueTamVoiceActive ? 'Chú Tiểu đang cất giọng...' : 'Giọng đọc thiếu nhi ngây thơ'}</span>
                      {isTueTamVoiceActive && (
                        <span className="flex gap-0.5 items-end h-3">
                          <span className="w-0.5 h-2 bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 h-3 bg-amber-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 h-1.5 bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-amber-300/70 font-sans">
                      Âm sắc trẻ thơ trong trẻo • Web Audio DSP
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      if (isTueTamVoiceActive) {
                        zenWorldBridge.commands.stopTueTamVoice();
                      } else {
                        zenWorldBridge.commands.playTueTamVoice('GREETING');
                      }
                    }}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 hover:text-white border border-amber-400/40 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    {isTueTamVoiceActive ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Tạm dừng</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Nghe lại</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {teaNpcDialogue.speaker.includes('Tuệ Tâm') && isTueTamVoiceActive && tueTamVoiceProgress > 0 && (
              <div className="w-full h-1 bg-amber-950/60 rounded-full overflow-hidden mb-2.5 border border-amber-500/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-150"
                  style={{ width: `${Math.min(100, Math.max(5, tueTamVoiceProgress))}%` }}
                />
              </div>
            )}

            <div className="text-xs sm:text-sm text-stone-100 font-serif leading-relaxed mb-3 whitespace-pre-line bg-black/30 p-3 rounded-2xl border border-emerald-500/20">
              {teaNpcDialogue.text}
            </div>

            {teaNpcDialogue.gatha && (
              <div className="text-[11px] sm:text-xs text-emerald-300/90 font-serif italic text-center p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-400/30 mb-3 whitespace-pre-line leading-relaxed shadow-inner">
                {teaNpcDialogue.gatha}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => {
                  soundEngine.playTeaPour();
                  soundEngine.playWindChime();
                  onAddMerit(25, 50, 40, '🍵 Thưởng Trà Sen Chánh Niệm');
                  zenWorldBridge.commands.stopTueTamVoice();
                  useZenBridge.getState().setTeaNpcDialogue(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-heading font-black text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5 border border-emerald-300/50"
              >
                <span>🍵</span>
                <span>Thưởng Thức Trà Sen</span>
              </button>
              {onOpenTeaHouse && (
                <button
                  onClick={() => {
                    zenWorldBridge.commands.stopTueTamVoice();
                    useZenBridge.getState().setTeaNpcDialogue(null);
                    onOpenTeaHouse();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-heading font-black text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5 border border-amber-300/50"
                >
                  <span>🌸</span>
                  <span>Trà Đạo</span>
                </button>
              )}
              <button
                onClick={() => {
                  zenWorldBridge.commands.stopTueTamVoice();
                  useZenBridge.getState().setTeaNpcDialogue(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white font-heading text-xs transition cursor-pointer border border-emerald-400/30"
              >
                Tâm An Lạc 🙏
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOGUE MODAL: HÒA THƯỢNG TRỤ TRÌ THUYẾT PHÁP */}
      {abbotDialogue && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[94vw] sm:max-w-lg w-full animate-fadeIn">
          <div className="anime-glass-panel border-2 border-red-500/50 p-4 sm:p-6 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative bg-stone-950/90">
            <button
              onClick={handleCloseAbbotDialogue}
              className="absolute top-3 right-3 text-amber-200 hover:text-white text-xs p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-yellow-600 flex items-center justify-center text-3xl shadow-xl border-2 border-amber-300/80 ring-2 ring-red-500/40 shrink-0">
                {abbotDialogue.avatar}
              </div>
              <div>
                <div className="font-heading font-black text-sm sm:text-base text-amber-200 flex items-center gap-2">
                  <span>{abbotDialogue.speaker}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/30 text-amber-300 border border-amber-400/50 font-normal">
                    {abbotDialogue.role}
                  </span>
                </div>
                <div className="text-[11px] text-amber-100/70 font-serif">
                  Đại Hùng Bảo Điện • Tòa Thuyết Pháp
                </div>
              </div>
            </div>

            {/* THANH ĐIỀU KHIỂN & HIỂN THỊ SÓNG ÂM GIỌNG ĐỌC SƯ THẦY */}
            <div className="flex flex-col gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-stone-900/90 to-amber-950/80 border border-amber-500/40 mb-3 text-xs shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isAbbotVoiceActive ? (
                    <>
                      <div className="flex items-end gap-1 h-4">
                        <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-3" />
                        <span className="w-1 bg-yellow-300 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-4" />
                        <span className="w-1 bg-amber-300 rounded-full animate-[bounce_0.5s_ease-in-out_infinite] h-2.5" />
                        <span className="w-1 bg-yellow-400 rounded-full animate-[bounce_0.7s_ease-in-out_infinite] h-3.5" />
                      </div>
                      <span className="text-amber-200 font-bold text-[11px] tracking-wide animate-pulse">
                        Sư Thầy đang tụng kệ truyền cảm...
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-300/80 text-[11px] flex items-center gap-1.5 font-serif">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Giọng đọc thiền môn của Sư Thầy</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {abbotVoiceDuration.total !== '00:00' && (
                    <span className="text-[10px] font-mono text-amber-200/80">
                      {abbotVoiceDuration.current} / {abbotVoiceDuration.total}
                    </span>
                  )}
                  {isAbbotVoiceActive ? (
                    <button
                      onClick={() => {
                        stopAbbotVoice();
                        useZenBridge.getState().setAbbotVoice(false, 0);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-amber-200 hover:text-white text-[11px] font-bold border border-red-500/40 flex items-center gap-1 cursor-pointer transition shadow-sm active:scale-95"
                      title="Tạm dừng giọng đọc"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Tạm Dừng</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (abbotDialogue) {
                          const formatAudioTime = (sec: number) => {
                            const m = Math.floor(sec / 60);
                            const s = Math.floor(sec % 60);
                            return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
                          };
                          useZenBridge.getState().setAbbotVoice(true);
                          speakAbbotVoice(abbotDialogue.text, abbotDialogue.gatha, {
                            onStart: () => useZenBridge.getState().setAbbotVoice(true),
                            onEnd: () => useZenBridge.getState().setAbbotVoice(false, 0),
                            onTimeUpdate: (cur, dur) => {
                              if (dur > 0) {
                                useZenBridge.getState().setAbbotVoice(
                                  true,
                                  Math.min(100, (cur / dur) * 100),
                                  {
                                    current: formatAudioTime(cur),
                                    total: formatAudioTime(dur),
                                  }
                                );
                              }
                            },
                          });
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 text-[11px] font-black border border-amber-300/60 flex items-center gap-1 cursor-pointer transition shadow-sm hover:scale-105 active:scale-95"
                      title="Bấm để nghe giọng đọc truyền cảm của Sư Thầy"
                    >
                      <Volume2 className="w-3 h-3 text-stone-950" />
                      <span>Nghe Giọng Thầy</span>
                    </button>
                  )}
                </div>
              </div>

              {/* THANH TIẾN TRÌNH AUDIO */}
              <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden border border-amber-400/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-200"
                  style={{ width: `${abbotVoiceProgress}%` }}
                />
              </div>
            </div>

            <div className="text-xs sm:text-sm text-stone-100 font-serif leading-relaxed mb-3 whitespace-pre-line bg-black/40 p-3.5 rounded-2xl border border-red-500/20">
              {abbotDialogue.text}
            </div>

            {abbotDialogue.gatha && (
              <div className="text-[11px] sm:text-xs text-amber-200/95 font-serif italic text-center p-3 rounded-xl bg-red-950/50 border border-amber-400/40 mb-4 whitespace-pre-line leading-relaxed shadow-inner">
                {abbotDialogue.gatha}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => {
                  handleCloseAbbotDialogue();
                  zenWorldBridge.commands.drawFortune();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 font-heading font-black text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5 border border-amber-300"
              >
                <span>🧧</span>
                <span>Xin Xăm Xin Lộc</span>
              </button>
              <button
                onClick={handleStartDharmaChantSession}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-500 hover:to-amber-600 text-white font-heading font-black text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5 border border-red-400/50"
              >
                <span>📜</span>
                <span>Khóa Lễ Thính Pháp</span>
              </button>
              {monkPose !== 'STAND' ? (
                <button
                  onClick={() => {
                    handleCloseAbbotDialogue();
                    zenWorldBridge.commands.setMonkPose('STAND');
                    soundEngine.stopWoodenFishRhythm();
                    stopAbbotVoice();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 text-amber-200 font-bold text-xs transition cursor-pointer border border-amber-400/30 flex items-center gap-1.5"
                >
                  <span>🚶</span>
                  <span>Đứng Dậy Xả Thiền</span>
                </button>
              ) : (
                <button
                  onClick={handleCloseAbbotDialogue}
                  className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition cursor-pointer"
                >
                  A Di Đà Phật 🙏
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTONS WHEN IN ZONE */}
      {nearInteractions.length > 0 && (
        <div className="absolute bottom-26 sm:bottom-22 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-wrap items-center justify-center gap-2 max-w-[90vw]">
          {nearInteractions.map((act, i) => (
            <button
              key={i}
              onClick={act.action}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-heading font-black text-xs sm:text-sm shadow-[0_8px_25px_rgba(244,114,182,0.5)] flex items-center gap-2.5 active:scale-95 transition cursor-pointer border border-white/50 animate-bounce"
            >
              <span className="text-lg sm:text-xl">{act.icon}</span>
              <span>{act.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* TOP-LEFT CONTROLLER BAR */}
      <div className="absolute top-18 sm:top-20 left-3 sm:left-6 z-30 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => zenWorldBridge.commands.toggleTour()}
          className={`px-3.5 py-2 rounded-2xl font-heading text-xs font-black shadow-xl flex items-center gap-2 transition-all cursor-pointer border ${isTourPlaying
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-300 ring-2 ring-pink-400/50 shadow-[0_0_18px_rgba(244,114,182,0.5)]'
            : 'anime-glass-panel hover:bg-white/10 text-pink-200 border-pink-400/40 backdrop-blur-md'
            }`}
          title="Tự động dẫn nhân vật vãn cảnh qua 14 danh thắng chùa"
        >
          {isTourPlaying ? <Pause className="w-4 h-4 text-white fill-current" /> : <Play className="w-4 h-4 text-pink-400 fill-current" />}
          <span>{isTourPlaying ? 'Tạm Dừng Vãn Cảnh' : '14 Cảnh Sơn Tự'}</span>
          {isTourPlaying && (
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono">
              {tourIndex + 1}/14
            </span>
          )}
        </button>

        <button
          onClick={() => zenWorldBridge.commands.restartFromGate()}
          title="Bắt đầu lại bước chân từ Cổng Chùa Tam Quan"
          className="p-2.5 rounded-2xl anime-glass-panel hover:bg-white/10 text-purple-200 hover:text-pink-300 border border-pink-400/30 backdrop-blur-md shadow-xl transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Camera Mode Switcher */}
        <button
          onClick={() => {
            const nextMode =
              cameraMode === 'THIRD_PERSON'
                ? 'ON_RAINY_DAYS'
                : cameraMode === 'ON_RAINY_DAYS'
                  ? 'ISOMETRIC'
                  : 'THIRD_PERSON';
            zenWorldBridge.commands.setCameraMode(nextMode);
          }}
          className="px-3 py-2 rounded-2xl font-heading text-xs font-black shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border anime-glass-panel hover:bg-white/10 text-purple-200 hover:text-white border-pink-400/30"
          title="Chuyển đổi góc nhìn: Toàn Cảnh / On Rainy Days / Trên Cao"
        >
          <Layers className="w-3.5 h-3.5 text-pink-400" />
          <span>{cameraMode === 'THIRD_PERSON' ? '👁️ Toàn Cảnh' : cameraMode === 'ON_RAINY_DAYS' ? '🌧️ On Rainy Days' : '📐 Trên Cao'}</span>
        </button>

        {/* Dedicated "On Rainy Days" Switcher */}
        <button
          onClick={() => {
            zenWorldBridge.commands.setCameraMode(
              cameraMode === 'ON_RAINY_DAYS' ? 'THIRD_PERSON' : 'ON_RAINY_DAYS'
            );
          }}
          className={`px-3 py-2 rounded-2xl font-heading text-xs font-black shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border ${cameraMode === 'ON_RAINY_DAYS'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300 ring-2 ring-emerald-400/50 shadow-[0_0_16px_rgba(52,211,153,0.5)]'
            : 'anime-glass-panel hover:bg-white/10 text-emerald-300 border-emerald-500/40'
            }`}
          title="Bật giao diện & góc nhìn nghệ thuật 'On Rainy Days'"
        >
          <span>🌸 On Rainy Days</span>
        </button>

        {/* Quick Pitch Tilt Button */}
        <button
          onClick={() => zenWorldBridge.commands.tiltCameraUp()}
          className="px-2.5 py-2 rounded-2xl font-heading text-xs font-black shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border anime-glass-panel hover:bg-white/10 text-purple-200 hover:text-white border-pink-400/30"
          title="Bấm để ngước nhìn lên cao hoặc nhìn ngang"
        >
          <span>✨ Ngước Lên Trời</span>
        </button>

        {/* Nút bấm Thắp Nhang Vái Phật */}
        <button
          onClick={() => zenWorldBridge.commands.triggerIncenseBow()}
          disabled={isIncenseBowing}
          className={`px-3 py-2 rounded-2xl font-heading text-xs font-black shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border ${isIncenseBowing
            ? 'bg-amber-500 text-white border-yellow-300 ring-2 ring-yellow-400/50 shadow-[0_0_16px_rgba(245,158,11,0.6)] animate-pulse'
            : 'anime-glass-panel hover:bg-amber-500/20 text-amber-300 hover:text-white border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-105'
            }`}
          title="Thắp 3 nén nhang trầm và thành kính cúi mình vái lạy 3 bái dâng Phật"
        >
          <span>🕯️ Thắp Nhang Vái Phật</span>
        </button>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-2xl anime-glass-panel border border-pink-400/30 text-pink-200 text-xs font-sans font-bold shadow-xl">
          <Eye className="w-3.5 h-3.5 text-pink-400" />
          <span>Click chuột để đi • Kéo xoay góc nhìn • Lăn chuột thu phóng</span>
        </div>
      </div>

      {/* FLOATING ACTION: NÚT THẮP NHANG & VÁI LẠY PHẬT TỔ (GÓC PHẢI) */}
      <div className="absolute top-20 sm:top-24 right-3 sm:right-6 z-30 pointer-events-auto">
        <button
          onClick={() => zenWorldBridge.commands.triggerIncenseBow()}
          disabled={isIncenseBowing}
          className={`px-3.5 py-2.5 rounded-2xl font-heading font-black text-xs sm:text-sm flex items-center gap-2 shadow-2xl transition-all cursor-pointer backdrop-blur-md border ${isIncenseBowing
            ? 'bg-amber-500/90 text-white border-yellow-200 ring-4 ring-yellow-400/50 shadow-[0_0_24px_rgba(245,158,11,0.8)] animate-pulse scale-105'
            : 'bg-gradient-to-r from-amber-600/90 via-orange-500/90 to-yellow-500/90 hover:from-amber-500 hover:to-yellow-400 text-white border-yellow-300/70 shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95'
            }`}
          title="Thắp 3 nén nhang trầm và thành kính cúi mình vái lạy 3 bái dâng Phật"
        >
          <span className="text-base sm:text-lg animate-bounce">🕯️</span>
          <span>{isIncenseBowing ? 'Đang Dâng Hương & Vái Lạy...' : 'Thắp Nhang & Vái Lạy'}</span>
        </button>
      </div>

      {/* ON-SCREEN DIRECTIONAL D-PAD CONTROLLER & SPRINT TOGGLE (Direct WebGL Input Bridge) */}
      <div className="absolute bottom-20 sm:bottom-18 left-3 sm:left-6 z-30 pointer-events-auto flex items-end gap-2">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onPointerDown={() => zenWorldBridge.commands.setMovementDirection('up', true)}
            onPointerUp={() => zenWorldBridge.commands.setMovementDirection('up', false)}
            onPointerLeave={() => zenWorldBridge.commands.setMovementDirection('up', false)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl anime-glass-panel hover:bg-pink-500/30 active:bg-pink-500 border border-pink-400/40 text-pink-200 active:text-white shadow-xl flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Tiến thẳng theo hướng nhìn (W hoặc Mũi tên lên)"
          >
            <ChevronUp className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5 my-1">
            <button
              type="button"
              onPointerDown={() => zenWorldBridge.commands.setMovementDirection('left', true)}
              onPointerUp={() => zenWorldBridge.commands.setMovementDirection('left', false)}
              onPointerLeave={() => zenWorldBridge.commands.setMovementDirection('left', false)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl anime-glass-panel hover:bg-pink-500/30 active:bg-pink-500 border border-pink-400/40 text-pink-200 active:text-white shadow-xl flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Rẽ trái (A hoặc Mũi tên trái)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-950/60 border border-pink-400/30 flex items-center justify-center text-pink-400 text-xs sm:text-sm select-none shadow-inner font-bold" title="WASD / Phím Mũi Tên">
              ✦
            </div>

            <button
              type="button"
              onPointerDown={() => zenWorldBridge.commands.setMovementDirection('right', true)}
              onPointerUp={() => zenWorldBridge.commands.setMovementDirection('right', false)}
              onPointerLeave={() => zenWorldBridge.commands.setMovementDirection('right', false)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl anime-glass-panel hover:bg-pink-500/30 active:bg-pink-500 border border-pink-400/40 text-pink-200 active:text-white shadow-xl flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Rẽ phải (D hoặc Mũi tên phải)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <button
            type="button"
            onPointerDown={() => zenWorldBridge.commands.setMovementDirection('down', true)}
            onPointerUp={() => zenWorldBridge.commands.setMovementDirection('down', false)}
            onPointerLeave={() => zenWorldBridge.commands.setMovementDirection('down', false)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl anime-glass-panel hover:bg-pink-500/30 active:bg-pink-500 border border-pink-400/40 text-pink-200 active:text-white shadow-xl flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Lùi lại (S hoặc Mũi tên xuống)"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* SPRINT RUN TOGGLE BUTTON */}
        <button
          type="button"
          onClick={toggleSprint}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex flex-col items-center justify-center transition active:scale-95 cursor-pointer shadow-xl border ${isSprintActive
            ? 'bg-amber-500/40 border-amber-300 text-amber-200 shadow-amber-500/30 ring-2 ring-amber-400/50'
            : 'anime-glass-panel border-pink-400/40 text-pink-200 hover:bg-pink-500/30'
            }`}
          title={isSprintActive ? 'Chế độ Chạy Nhanh (8.8 m/s) ĐANG BẬT - Nhấn để đi bộ' : 'Bật chế độ Chạy Nhanh Sprint (8.8 m/s)'}
        >
          <span className="text-base sm:text-lg">🏃</span>
          <span className="text-[8px] sm:text-[9px] font-bold tracking-tighter leading-none">{isSprintActive ? 'CHẠY' : 'ĐI'}</span>
        </button>
      </div>

      {/* BOTTOM DOCK: 14 ARCHITECTURAL ZONES DOCK */}
      <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-20 pointer-events-auto">
        <div className="anime-glass-panel border border-pink-400/40 p-2 sm:p-2.5 rounded-[24px] shadow-2xl flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-heading font-black text-pink-300 px-2 flex items-center gap-1.5 shrink-0 hidden md:flex">
              <Footprints className="w-4 h-4 text-pink-400" />
              <span>14 Cảnh Chùa:</span>
            </span>

            {templeZones.map((zone, idx) => {
              const isHere = currentZone?.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => zenWorldBridge.commands.navigateToZone(zone)}
                  title={`${zone.name} (${zone.subtitle})`}
                  className={`px-3 py-1.5 rounded-xl font-heading text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${isHere
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-[0_0_15px_rgba(244,114,182,0.6)] border border-white/50 scale-105'
                    : 'bg-purple-950/40 hover:bg-purple-900/50 border border-pink-400/20 text-purple-200 hover:text-white'
                    }`}
                >
                  <span>{zone.icon}</span>
                  <span className="text-[11px] font-bold hidden sm:inline">{zone.name.split('.')[1] || zone.name}</span>
                  {idx < templeZones.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-purple-400/40 hidden xl:inline" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Day / Night Atmosphere Toggle */}
          <button
            onClick={onToggleNightMode}
            title="Bật/Tắt chế độ Ánh Sáng Đèn Lồng Ban Đêm"
            className={`p-2.5 rounded-xl text-xs font-heading font-bold transition cursor-pointer border shrink-0 ${isNightMode
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-purple-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
              : 'text-purple-200 hover:bg-white/10 border-pink-400/30'
              }`}
          >
            {isNightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MODAL THẢ HOA ĐĂNG CẦU NGUYỆN BÊN HỒ SEN CHÙA MỘT CỘT */}
      {isLanternModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-stone-900/95 via-purple-950/90 to-stone-950/95 border-2 border-pink-400/50 shadow-[0_0_50px_rgba(244,114,182,0.4)] text-white">
            <button
              onClick={() => useZenBridge.getState().setLanternModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-4xl animate-bounce inline-block mb-2">🏮</span>
              <h3 className="text-xl sm:text-2xl font-black font-heading bg-gradient-to-r from-pink-300 via-amber-200 to-rose-300 bg-clip-text text-transparent">
                Thả Hoa Đăng Cầu Nguyện
              </h3>
              <p className="text-xs sm:text-sm text-pink-200/80 mt-1">
                Gửi gắm ước nguyện thiện lành trôi theo làn nước xanh lá sen về đài sen Chùa Một Cột
              </p>
            </div>

            {/* Chọn Mẫu Hoa Đăng */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-amber-200 mb-2 uppercase tracking-wider">
                1. Chọn Sắc Hoa Đăng:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'pink', name: 'Hồng Ái Ngữ', icon: '🌸', color: 'border-pink-400 bg-pink-500/20' },
                  { id: 'gold', name: 'Hoàng Kim', icon: '💛', color: 'border-amber-400 bg-amber-500/20' },
                  { id: 'white', name: 'Bạch Ngọc', icon: '🤍', color: 'border-stone-200 bg-stone-100/20' },
                  { id: 'cyan', name: 'Lam Thanh', icon: '💙', color: 'border-cyan-400 bg-cyan-500/20' },
                ].map((lantern) => (
                  <button
                    key={lantern.id}
                    onClick={() => setSelectedLanternType(lantern.id)}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${selectedLanternType === lantern.id
                      ? `${lantern.color} border-2 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-105`
                      : 'border-white/10 hover:border-white/30 bg-black/30'
                      }`}
                  >
                    <span className="text-2xl">{lantern.icon}</span>
                    <span className="text-xs font-bold">{lantern.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn Hoặc Nhập Lời Cầu Nguyện */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-amber-200 mb-2 uppercase tracking-wider">
                2. Lời Nguyện Ước Thành Tâm:
              </label>
              <div className="space-y-1.5 mb-3">
                {[
                  'Cầu cho Cha Mẹ bình an, tăng long phước thọ',
                  'Cầu cho gia đạo hòa thuận, con cháu hiếu thảo',
                  'Cầu cho công việc hanh thông, trí tuệ sáng suốt',
                  'Cầu cho tâm hồn an tĩnh, tiêu trừ mọi ưu phiền',
                ].map((wish, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCustomWishText(wish)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition cursor-pointer border ${customWishText === wish
                      ? 'bg-pink-500/30 border-pink-400 text-white font-bold'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-stone-300'
                      }`}
                  >
                    ✨ {wish}
                  </button>
                ))}
              </div>

              <textarea
                value={customWishText}
                onChange={(e) => setCustomWishText(e.target.value)}
                placeholder="Hoặc tự nhập lời ước nguyện thành tâm của bạn..."
                className="w-full p-3 rounded-xl bg-black/40 border border-pink-400/30 text-white text-xs sm:text-sm focus:border-pink-400 focus:outline-none resize-none h-18"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => useZenBridge.getState().setLanternModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-300 font-heading font-bold text-sm transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmReleaseLantern}
                className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white font-heading font-black text-sm shadow-[0_0_20px_rgba(244,114,182,0.6)] flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 border border-white/40"
              >
                <span>🏮 Thả Đèn Xuống Hồ Sen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WIDGET THIỀN ĐỊNH HƠI THỞ CHÁNH NIỆM BÊN HỒ SEN */}
      {isLotusMeditationActive && (
        <div className="fixed top-24 right-4 sm:right-8 z-40 p-4 sm:p-5 rounded-3xl bg-black/70 backdrop-blur-xl border-2 border-emerald-400/60 shadow-[0_0_30px_rgba(16,185,129,0.4)] text-white w-72 sm:w-80 animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🧘</span>
              <div>
                <h4 className="text-sm font-black font-heading text-emerald-300">Tọa Thiền Bên Hồ Sen</h4>
                <p className="text-[10px] text-emerald-200/70">Đã an trú: {meditationBreaths} chu kỳ hơi thở</p>
              </div>
            </div>
            <button
              onClick={handleDungDayBuocDi}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 cursor-pointer"
              title="Xong Khóa Thiền / Đứng Dậy"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Vòng Tròn Hơi Thở Tỏa Sáng */}
          <div className="flex flex-col items-center justify-center py-4">
            <div
              className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${meditationBreathPhase === 'IN'
                ? 'scale-110 border-emerald-400 bg-emerald-500/20 shadow-[0_0_25px_rgba(52,211,153,0.6)]'
                : meditationBreathPhase === 'HOLD'
                  ? 'scale-105 border-teal-300 bg-teal-500/30 shadow-[0_0_30px_rgba(45,212,191,0.7)]'
                  : meditationBreathPhase === 'OUT'
                    ? 'scale-90 border-pink-400 bg-pink-500/20 shadow-[0_0_20px_rgba(244,114,182,0.5)]'
                    : 'scale-95 border-stone-400 bg-stone-500/10'
                }`}
            >
              <span className="text-xs font-black font-heading text-center px-2">
                {meditationBreathPhase === 'IN' && 'Hít Vào Thong Dong'}
                {meditationBreathPhase === 'HOLD' && 'Giữ Tâm Tĩnh Lặng'}
                {meditationBreathPhase === 'OUT' && 'Thở Ra Mỉm Cười'}
                {meditationBreathPhase === 'REST' && 'Buông Thư Tự Tại'}
              </span>
              <span className="text-[10px] text-emerald-200 font-bold mt-1">🪷</span>
            </div>
            <p className="text-center text-[11px] text-emerald-100/80 italic mt-3 px-2">
              "Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười. Thấy hoa sen nở ngát, an lạc giữa trần ai."
            </p>
          </div>

          <button
            onClick={handleDungDayBuocDi}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 font-heading font-black text-xs shadow-lg transition cursor-pointer border border-emerald-300/40"
          >
            🚶 Đứng Dậy & Hồi Hướng Công Đức
          </button>
        </div>
      )}

      {/* MODAL XIN XĂM XIN LỘC & XEM VẬN MỆNH LINH THIÊNG */}
      {isFortuneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-stone-900/98 via-stone-950/98 to-stone-900/98 border-2 border-amber-500/60 shadow-[0_0_60px_rgba(245,158,11,0.35)] text-white">
            <button
              onClick={handleCloseFortuneModal}
              className="absolute top-4 right-4 p-2 rounded-full text-amber-200/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Đóng bảng quẻ xăm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Ribbon */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-red-950/80 via-amber-900/80 to-red-950/80 border border-amber-400/50 text-amber-300 text-xs font-heading font-black shadow-inner mb-2">
                <span>🏮</span>
                <span>QUẺ XĂM LINH THIÊNG • CHÙA SƠN TỰ</span>
                <span>🏮</span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-100/70 font-serif italic">
                Thành tâm đảnh lễ Chư Phật Tam Bảo • Cầu mong bình an & khai mở trí tuệ
              </p>
            </div>

            {/* State 1: Đang lắc ống xăm tre */}
            {isShakingLot ? (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-pulse">
                {/* Ống xăm tre 3D & Thẻ xăm rung rinh */}
                <div className="relative w-28 h-40 mb-6 flex items-center justify-center">
                  {/* Aura hào quang vàng */}
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-ping" />

                  {/* Ống xăm tre */}
                  <div className="relative w-24 h-36 rounded-2xl bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 border-3 border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.5)] flex flex-col items-center justify-between p-2 overflow-hidden">
                    {/* Các thẻ tre nhô lên lắc lư */}
                    <div className="absolute -top-6 flex items-end justify-center gap-1.5 w-full">
                      <div className="w-2.5 h-14 bg-gradient-to-b from-amber-200 to-amber-400 rounded-t-sm shadow -rotate-12 animate-bounce" style={{ animationDuration: '0.4s' }} />
                      <div className="w-2.5 h-16 bg-gradient-to-b from-red-500 to-amber-300 rounded-t-sm shadow rotate-3 animate-bounce" style={{ animationDuration: '0.35s' }} />
                      <div className="w-2.5 h-12 bg-gradient-to-b from-amber-200 to-amber-400 rounded-t-sm shadow -rotate-6 animate-bounce" style={{ animationDuration: '0.45s' }} />
                      <div className="w-2.5 h-15 bg-gradient-to-b from-amber-300 to-amber-500 rounded-t-sm shadow rotate-12 animate-bounce" style={{ animationDuration: '0.38s' }} />
                    </div>

                    {/* Họa tiết hoa sen khắc trên ống tre */}
                    <div className="mt-auto mb-2 text-2xl opacity-90">🪷</div>
                    <div className="text-[10px] font-heading font-black text-amber-200 tracking-widest uppercase">
                      Chùa Sơn Tự
                    </div>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-heading font-black text-amber-300 mb-1">
                  Đang Lắc Ống Xăm Tre Linh Thiêng...
                </h3>
                <p className="text-xs text-amber-200/80 font-serif max-w-sm">
                  Lắng lòng thanh tịnh, nghe tiếng mõ ngân vang... Thẻ xăm thiện duyên đang rơi xuống...
                </p>
              </div>
            ) : currentFortune ? (
              /* State 2: Đã gieo được quẻ xăm linh thiêng */
              <div className="space-y-4 animate-fade-in">
                {/* Danh hiệu quẻ & Hạng cát tường */}
                <div className="text-center p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 via-red-950/40 to-amber-950/60 border border-amber-500/30">
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-black shadow-md bg-gradient-to-r ${currentFortune.badgeColor}`}>
                      ✨ {currentFortune.rank} ✨
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-heading font-black text-amber-200 tracking-wide">
                    Quẻ Số {currentFortune.lotNumber}: {currentFortune.title}
                  </h2>
                </div>

                {/* Thơ Kệ Quẻ Xăm Bát Nhã (Giấy Thư Pháp Trầm Ấm) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-100/10 via-amber-50/5 to-transparent border border-amber-400/40 text-center relative shadow-inner">
                  <div className="text-[11px] font-heading font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
                    <span>📜</span>
                    <span>Thơ Kệ Quẻ Xăm</span>
                    <span>📜</span>
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    {currentFortune.poem.map((line, idx) => (
                      <p key={idx} className="font-serif italic text-amber-100 text-sm sm:text-base leading-relaxed tracking-wide">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Ý Nghĩa Tổng Quan */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 text-xs sm:text-sm text-stone-200 font-serif leading-relaxed">
                  <span className="font-heading font-bold text-amber-300">Lời Luận Giải: </span>
                  {currentFortune.generalMeaning}
                </div>

                {/* Chi Tiết 5 Phương Diện Vận Mệnh */}
                <div>
                  <h4 className="text-xs font-heading font-black text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Chi Tiết Vận Trình 5 Phương Diện:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-stone-900/90 border border-amber-400/20">
                      <div className="font-heading font-black text-amber-300 flex items-center gap-1 mb-1">
                        <span>🏡</span>
                        <span>Gia Đạo & Bình An:</span>
                      </div>
                      <p className="text-stone-300 font-serif text-[11px] leading-relaxed">
                        {currentFortune.aspects.giaDao}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-900/90 border border-amber-400/20">
                      <div className="font-heading font-black text-amber-300 flex items-center gap-1 mb-1">
                        <span>📈</span>
                        <span>Công Danh & Sự Nghiệp:</span>
                      </div>
                      <p className="text-stone-300 font-serif text-[11px] leading-relaxed">
                        {currentFortune.aspects.congDanh}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-900/90 border border-amber-400/20">
                      <div className="font-heading font-black text-amber-300 flex items-center gap-1 mb-1">
                        <span>💰</span>
                        <span>Tài Lộc & Mưu Sự:</span>
                      </div>
                      <p className="text-stone-300 font-serif text-[11px] leading-relaxed">
                        {currentFortune.aspects.taiLoc}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-900/90 border border-amber-400/20">
                      <div className="font-heading font-black text-amber-300 flex items-center gap-1 mb-1">
                        <span>🌿</span>
                        <span>Sức Khỏe & Thân Tâm:</span>
                      </div>
                      <p className="text-stone-300 font-serif text-[11px] leading-relaxed">
                        {currentFortune.aspects.sucKhoe}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-900/90 border border-amber-400/20 sm:col-span-2">
                      <div className="font-heading font-black text-amber-300 flex items-center gap-1 mb-1">
                        <span>🌸</span>
                        <span>Duyên Lành & Quý Nhân:</span>
                      </div>
                      <p className="text-stone-300 font-serif text-[11px] leading-relaxed">
                        {currentFortune.aspects.duyenLanh}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lời Sư Phụ Khai Thị */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-red-950/60 to-amber-950/60 border border-red-500/40 text-xs shadow-inner">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">📿</span>
                    <span className="font-heading font-black text-amber-300 text-xs">
                      Sư Phụ Trụ Trì Khai Thị:
                    </span>
                  </div>
                  <p className="text-amber-100/90 font-serif italic text-[11px] sm:text-xs leading-relaxed">
                    {currentFortune.monkAdvice}
                  </p>
                </div>

                {/* Thông báo phước báu */}
                <div className="text-center py-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-xs font-heading font-black">
                    <span>✨</span>
                    <span>Phước Báu Nhận Được: +{currentFortune.meritBonus} Điểm Công Đức</span>
                    <span>✨</span>
                  </span>
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                  <button
                    onClick={handleDrawFortune}
                    className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 font-heading font-bold text-xs transition cursor-pointer border border-amber-400/30 flex items-center justify-center gap-2 active:scale-95 shadow-md"
                  >
                    <span>🎋</span>
                    <span>Lắc Ống Xăm Tiếp</span>
                  </button>

                  <button
                    onClick={handleCloseFortuneModal}
                    className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-heading font-black text-xs transition cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.5)] flex items-center justify-center gap-2 active:scale-95 border border-yellow-200"
                  >
                    <span>🙏</span>
                    <span>Tạ Lễ & Nhận Lộc</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};
