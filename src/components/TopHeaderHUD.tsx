import React from 'react';
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
  Flame,
  Globe,
  Sliders,
  Bell,
  Play,
  Pause,
  Menu,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ZenCharacterSprite } from './ZenCharacterSprite';

interface TopHeaderHUDProps {
  worldMode: '3D' | 'OPEN_WORLD' | 'FOCUS';
  timePhase: 'MORNING' | 'AFTERNOON' | 'EVENING';
  isRaining: boolean;
  soundEnabled: boolean;
  isBgmPlaying: boolean;
  isBellRinging: boolean;
  ambientBellActive?: boolean;
  onToggleAmbientBell?: () => void;
  onOpenCharModal: () => void;
  onOpenQuestModal: () => void;
  onOpenJournalModal: () => void;
  onOpenGraphicsModal: () => void;
  onToggleWorldMode: () => void;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onToggleRain: () => void;
  onChangeTimePhase: (phase: 'MORNING' | 'AFTERNOON' | 'EVENING') => void;
  onRingBell: () => void;
  onDrinkTea: () => void;
  onToggleMobileDrawer: () => void;
}

export const TopHeaderHUD: React.FC<TopHeaderHUDProps> = ({
  worldMode,
  timePhase,
  isRaining,
  soundEnabled,
  isBgmPlaying,
  isBellRinging,
  ambientBellActive = true,
  onToggleAmbientBell,
  onOpenCharModal,
  onOpenQuestModal,
  onOpenJournalModal,
  onOpenGraphicsModal,
  onToggleWorldMode,
  onToggleSound,
  onToggleBgm,
  onToggleRain,
  onChangeTimePhase,
  onRingBell,
  onDrinkTea,
  onToggleMobileDrawer,
}) => {
  const { stats, graphicsQuality } = useGameStore();
  const character = stats.character;
  const level = stats.level;
  const merit = stats.congDuc;
  const maxMeritForLevel = stats.maxCongDucForLevel;
  const stamina = stats.tamLuc;
  const hasEnlightenmentBuff = stats.tamSangBuff;
  const focusBuff = hasEnlightenmentBuff ? 1.5 : 1.0;

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-2 sm:p-4">
      <div className="max-w-7xl mx-auto bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl sm:rounded-3xl shadow-2xl pointer-events-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LEFT: Nhân vật & Cấp độ */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenCharModal}
            title="Nhấn để tùy biến ngoại hình và pháp danh"
            className="relative group p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border-2 border-amber-400/60 hover:border-amber-300 transition-all cursor-pointer shadow-lg bg-stone-950/80 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 overflow-hidden shrink-0"
          >
            <div className="scale-60 sm:scale-75 translate-y-0.5 sm:translate-y-1">
              <ZenCharacterSprite character={character} pose="idle" showNameTag={false} scale={0.5} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.1 sm:px-1.5 sm:py-0.2 bg-amber-500 text-stone-950 font-bold text-[8px] sm:text-[9px] rounded-tl-md border-t border-l border-stone-900">
              Lv.{level}
            </span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading font-bold text-amber-100 text-xs sm:text-base truncate max-w-[90px] xs:max-w-[130px] sm:max-w-none">
                {character.name}
              </span>
              <span className="text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 font-serif hidden xs:inline-block">
                {stats.title}
              </span>
            </div>
            <div className="text-[10px] text-stone-400 font-serif hidden md:block">
              Pháp phục:{' '}
              <span className="text-amber-300">
                {character.robeColor === 'lam'
                  ? 'Áo Lam'
                  : character.robeColor === 'nau'
                  ? 'Áo Nâu Sồng'
                  : character.robeColor === 'xam'
                  ? 'Áo Xám'
                  : 'Bạch Y'}
              </span>
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
              <span className="text-stone-300 font-mono text-[11px]">
                {merit}/{maxMeritForLevel}
              </span>
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
            onClick={onDrinkTea}
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
          <span className="text-amber-300 font-bold flex items-center gap-0.5">✨{merit}</span>
          <span className="text-stone-600">|</span>
          <span className={`font-bold flex items-center gap-0.5 ${stamina > 30 ? 'text-emerald-300' : 'text-rose-400 animate-pulse'}`}>
            💚{stamina}%
          </span>
        </div>

        {/* RIGHT: ACTIONS & CONTROLS */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cài đặt Đồ Họa (Thấp / Cao) */}
          <button
            onClick={onOpenGraphicsModal}
            title="Tùy chỉnh Đồ Họa (Thấp / Cao)"
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border font-serif text-[11px] sm:text-xs flex items-center gap-1.5 cursor-pointer transition shadow-md ${
              graphicsQuality === 'HIGH'
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200 hover:bg-emerald-500/30'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="font-semibold hidden xs:inline">
              {graphicsQuality === 'HIGH' ? 'Đồ Họa: Cao' : 'Đồ Họa: Thấp ⚡'}
            </span>
          </button>

          {/* Chuyển Chế Độ: 3D Sơn Tự / Thế Giới Mở 2D / Cảnh Thiền Tĩnh */}
          <button
            onClick={onToggleWorldMode}
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

          {/* Desktop Extended Controls */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* Chuyển buổi */}
            <div className="flex bg-stone-950/90 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => onChangeTimePhase('MORNING')}
                className={`px-2 py-0.5 rounded-lg text-xs font-serif flex items-center gap-1 cursor-pointer transition ${
                  timePhase === 'MORNING' ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold' : 'text-stone-400'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Sáng</span>
              </button>
              <button
                onClick={() => onChangeTimePhase('AFTERNOON')}
                className={`px-2 py-0.5 rounded-lg text-xs font-serif flex items-center gap-1 cursor-pointer transition ${
                  timePhase === 'AFTERNOON' ? 'bg-orange-500/30 text-orange-200 border border-orange-400/40 font-bold' : 'text-stone-400'
                }`}
              >
                <Sunset className="w-3 h-3" />
                <span>Chiều</span>
              </button>
              <button
                onClick={() => onChangeTimePhase('EVENING')}
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
              onClick={onToggleRain}
              title="Bật/Tắt hiệu ứng Mưa Thiền"
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isRaining ? 'bg-sky-500/20 border-sky-400 text-sky-200' : 'bg-stone-900 border-stone-800 text-stone-400'
              }`}
            >
              <CloudRain className="w-4 h-4" />
            </button>

            {/* Chuông Chùa Vang Vẳng */}
            <button
              onClick={onRingBell}
              title="Thỉnh chuông chùa chánh niệm (Âm thanh chuông ngân sẽ làm nhỏ nhạc nền tạm thời)"
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isBellRinging
                  ? 'bg-amber-400/40 border-amber-300 text-amber-200 animate-pulse'
                  : 'bg-stone-900 border-stone-800 text-amber-400 hover:text-amber-200 hover:bg-stone-800'
              }`}
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Bật/Tắt chuông định kỳ */}
            {onToggleAmbientBell && (
              <button
                onClick={onToggleAmbientBell}
                title={ambientBellActive ? 'Chuông định kỳ: Đang BẬT' : 'Chuông định kỳ: Đang TẮT'}
                className={`p-2 rounded-xl border transition cursor-pointer text-xs ${
                  ambientBellActive ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-stone-900 border-stone-800 text-stone-500'
                }`}
              >
                <span className="text-[10px] font-bold">22s</span>
              </button>
            )}

            {/* BGM On Rainy Days Control */}
            <button
              onClick={onToggleBgm}
              title={isBgmPlaying ? 'Tạm dừng Nhạc Thiền On Rainy Days' : 'Phát Nhạc Thiền On Rainy Days (Tự động lặp lại)'}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer text-xs font-serif ${
                isBgmPlaying
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-sm'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {isBgmPlaying ? <Pause className="w-3.5 h-3.5 text-amber-300" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline">Nhạc Thiền</span>
            </button>

            {/* Âm thanh chung */}
            <button
              onClick={onToggleSound}
              title="Bật/Tắt Toàn Bộ Âm Thanh"
              className={`p-2 rounded-xl border transition cursor-pointer ${
                soundEnabled ? 'bg-stone-900 border-stone-700 text-stone-200' : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Sổ Tay Tỉnh Thức */}
          <button
            onClick={onOpenJournalModal}
            title="Sổ Tay Tỉnh Thức & Giáo Lý"
            className="p-1.5 sm:p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-200 transition cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Nút Nhiệm Vụ Tu Tập Chánh Niệm */}
          <button
            onClick={onOpenQuestModal}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition shadow-lg cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nhiệm Vụ</span>
          </button>

          {/* Nút Menu Drawer cho Mobile */}
          <button
            onClick={onToggleMobileDrawer}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
