import React from 'react';
import { useGameStore, ZONES } from '../store/gameStore';
import { soundEngine } from '../services/audioEngine';
import { Volume2, VolumeX, BookOpen, MapPin, Sparkles, Sun, CloudRain, CloudFog, Moon, Flame } from 'lucide-react';

export const HeaderHUD: React.FC = () => {
  const { stats, setModal, advanceTimeOfDay } = useGameStore();
  const [isMuted, setIsMuted] = React.useState(soundEngine.getMuted());

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.startZenAmbient();
    }
  };

  const getTimeLabel = () => {
    switch (stats.timeOfDay) {
      case 'morning':
        return { label: 'Buổi Sáng', sub: 'Lao Tác', icon: <Sun className="w-4 h-4 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" /> };
      case 'afternoon':
        return { label: 'Buổi Chiều', sub: 'Tĩnh Dưỡng', icon: <Sun className="w-4 h-4 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]" /> };
      case 'evening':
        return { label: 'Buổi Tối', sub: 'Nghe Pháp', icon: <Moon className="w-4 h-4 text-purple-300 drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]" /> };
      case 'night':
        return { label: 'Đêm Khuya', sub: 'Yên Tĩnh', icon: <Moon className="w-4 h-4 text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.8)]" /> };
    }
  };

  const getWeatherIcon = () => {
    switch (stats.weather) {
      case 'sunny':
        return <span title="Nắng ấm thanh tịnh" className="inline-flex"><Sun className="w-4 h-4 text-amber-300 animate-spin-slow" /></span>;
      case 'rainy':
        return <span title="Mưa rơi thanh lọc" className="inline-flex"><CloudRain className="w-4 h-4 text-sky-400 animate-bounce" /></span>;
      case 'misty':
        return <span title="Sương mù mờ ảo" className="inline-flex"><CloudFog className="w-4 h-4 text-purple-200" /></span>;
    }
  };

  const currentZone = ZONES[stats.currentZone];
  const timeInfo = getTimeLabel();

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-2.5 sm:p-4 flex flex-col gap-2">
      {/* Top Bar Anime Glass Panel */}
      <div className="anime-glass-panel rounded-3xl px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 pointer-events-auto border border-pink-400/30">

        {/* Left: Player Identity & Level (Anime Avatar Card) */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            {/* Anime Level Gem Frame */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 p-0.5 shadow-[0_0_20px_rgba(236,72,153,0.5)] transform transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#120b24] rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-[9px] uppercase tracking-wider text-pink-300 font-extrabold leading-none">LV</span>
                <span className="font-heading text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-100 to-purple-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {stats.level}
                </span>
                {/* Anime Shine Diagonal */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 rotate-45 pointer-events-none" />
              </div>
            </div>

            {stats.tamSangBuff && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-pink-500 to-amber-400 border border-white"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-white tracking-wide text-sm sm:text-base drop-shadow-[0_2px_8px_rgba(244,114,182,0.4)]">
                {stats.title}
              </span>
              {stats.tamSangBuff && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-pink-500/25 to-purple-500/25 text-pink-200 border border-pink-400/50 rounded-full flex items-center gap-1 shadow-[0_0_12px_rgba(244,114,182,0.3)] animate-pulse">
                  <Sparkles className="w-3 h-3 text-pink-300" /> Tâm Sáng
                </span>
              )}
            </div>
            <div className="text-xs text-purple-200/80 font-sans flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping"></span>
              <span className="font-semibold">{currentZone.name}</span>
            </div>
          </div>
        </div>

        {/* Center: The 3 Core Stats (Anime Glossy Bars) */}
        <div className="flex items-center gap-3 sm:gap-5 flex-1 max-w-xl justify-center">
          {/* 1. Công Đức (EXP) */}
          <div className="flex-1 min-w-[90px]">
            <div className="flex justify-between items-center text-[11px] mb-1 font-bold">
              <span className="text-pink-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" /> Công Đức
              </span>
              <span className="text-purple-200/90 font-mono text-[10px]">{stats.congDuc}/{stats.maxCongDucForLevel}</span>
            </div>
            <div className="w-full h-2.5 sm:h-3 rounded-full anime-stat-bar-track overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-purple-400 transition-all duration-500 shadow-[0_0_12px_rgba(244,114,182,0.7)] anime-stat-bar-shine"
                style={{ width: `${Math.min(100, (stats.congDuc / stats.maxCongDucForLevel) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2. Tâm Lực (Stamina / HP) */}
          <div className="flex-1 min-w-[90px]">
            <div className="flex justify-between items-center text-[11px] mb-1 font-bold">
              <span className="text-emerald-300 flex items-center gap-1">
                <Flame className="w-3 h-3 text-emerald-400" /> Tâm Lực
              </span>
              <span className="text-purple-200/90 font-mono text-[10px]">{stats.tamLuc}/{stats.maxTamLuc}</span>
            </div>
            <div className="w-full h-2.5 sm:h-3 rounded-full anime-stat-bar-track overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300 transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.7)] anime-stat-bar-shine"
                style={{ width: `${(stats.tamLuc / stats.maxTamLuc) * 100}%` }}
              />
            </div>
          </div>

          {/* 3. Định Lực (Focus / MP) */}
          <div className="flex-1 min-w-[90px]">
            <div className="flex justify-between items-center text-[11px] mb-1 font-bold">
              <span className="text-sky-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-400" /> Định Lực
              </span>
              <span className="text-purple-200/90 font-mono text-[10px]">{stats.dinhLuc}%</span>
            </div>
            <div className="w-full h-2.5 sm:h-3 rounded-full anime-stat-bar-track overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-400 to-purple-400 transition-all duration-500 shadow-[0_0_12px_rgba(56,189,248,0.7)] anime-stat-bar-shine"
                style={{ width: `${stats.dinhLuc}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Anime Day/Time Capsule & Icon Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Day & Time Capsule */}
          <button
            onClick={() => advanceTimeOfDay()}
            title="Nhấn để chuyển sang buổi tiếp theo"
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-900/60 to-pink-900/40 border border-pink-400/30 hover:border-pink-300 hover:shadow-[0_0_16px_rgba(244,114,182,0.4)] transition-all text-xs text-pink-100 cursor-pointer font-bold"
          >
            {timeInfo.icon}
            <span className="font-heading">Ngày {stats.dayCount} • {timeInfo.label}</span>
            {getWeatherIcon()}
          </button>

          {/* Map Nav Button */}
          <button
            onClick={() => setModal('map')}
            className="zen-btn-subtle p-2 sm:p-2.5 rounded-2xl flex items-center justify-center hover:shadow-[0_0_14px_rgba(244,114,182,0.4)]"
            title="Bản Đồ Khuôn Viên Chùa"
          >
            <MapPin className="w-4 h-4 text-pink-300" />
          </button>

          {/* Sổ Tay Tỉnh Thức (Journal) */}
          <button
            onClick={() => setModal('journal')}
            className="zen-btn-subtle p-2 sm:p-2.5 rounded-2xl flex items-center justify-center relative hover:shadow-[0_0_14px_rgba(192,132,252,0.4)]"
            title="Sổ Tay Tỉnh Thức"
          >
            <BookOpen className="w-4 h-4 text-purple-300" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="zen-btn-subtle p-2 sm:p-2.5 rounded-2xl flex items-center justify-center hover:shadow-[0_0_14px_rgba(52,211,153,0.4)]"
            title={isMuted ? 'Bật âm thanh ASMR' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-purple-300/50" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
