import React from 'react';
import { useGameStore, ZONES } from '../store/gameStore';
import { soundEngine } from '../services/audioEngine';
import { Volume2, VolumeX, BookOpen, MapPin, Sparkles, Sun, CloudRain, CloudFog, Moon } from 'lucide-react';

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
        return { label: 'Buổi Sáng (Lao Tác)', icon: <Sun className="w-4 h-4 text-amber-400" /> };
      case 'afternoon':
        return { label: 'Buổi Chiều (Tĩnh Dưỡng)', icon: <Sun className="w-4 h-4 text-orange-400" /> };
      case 'evening':
        return { label: 'Buổi Tối (Nghe Pháp)', icon: <Moon className="w-4 h-4 text-purple-400" /> };
      case 'night':
        return { label: 'Đêm Khuya (Yên Tĩnh)', icon: <Moon className="w-4 h-4 text-indigo-400" /> };
    }
  };

  const getWeatherIcon = () => {
    switch (stats.weather) {
      case 'sunny':
        return <span title="Nắng ấm thanh tịnh" className="inline-flex"><Sun className="w-4 h-4 text-amber-300" /></span>;
      case 'rainy':
        return <span title="Mưa rơi thanh lọc" className="inline-flex"><CloudRain className="w-4 h-4 text-sky-400" /></span>;
      case 'misty':
        return <span title="Sương mù mờ ảo" className="inline-flex"><CloudFog className="w-4 h-4 text-stone-300" /></span>;
    }
  };

  const currentZone = ZONES[stats.currentZone];
  const timeInfo = getTimeLabel();

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3 md:p-4 flex flex-col gap-2">
      {/* Top Bar Glass Panel */}
      <div className="zen-glass-panel rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 pointer-events-auto border border-amber-600/30">
        
        {/* Left: Player Identity & Level */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-xl shadow-lg border border-amber-400/40 font-heading text-amber-100 font-bold">
              {stats.level}
            </div>
            {stats.tamSangBuff && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-amber-200 tracking-wide text-sm md:text-base">
                {stats.title}
              </span>
              {stats.tamSangBuff && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Tâm Sáng
                </span>
              )}
            </div>
            <div className="text-xs text-stone-400 font-serif flex items-center gap-1.5">
              <span>{currentZone.name}</span>
            </div>
          </div>
        </div>

        {/* Center: The 3 Core Stats (Công Đức, Tâm Lực, Định Lực) */}
        <div className="flex items-center gap-4 md:gap-6 flex-1 max-w-xl justify-center">
          {/* 1. Công Đức (EXP) */}
          <div className="flex-1 min-w-[90px]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-amber-300 font-medium font-serif">Công Đức</span>
              <span className="text-stone-300 font-sans">{stats.congDuc}/{stats.maxCongDucForLevel}</span>
            </div>
            <div className="w-full bg-stone-800/80 rounded-full h-2.5 overflow-hidden border border-amber-950">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.congDuc / stats.maxCongDucForLevel) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2. Tâm Lực (Stamina) */}
          <div className="flex-1 min-w-[90px]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-emerald-300 font-medium font-serif">Tâm Lực</span>
              <span className="text-stone-300 font-sans">{stats.tamLuc}/{stats.maxTamLuc}</span>
            </div>
            <div className="w-full bg-stone-800/80 rounded-full h-2.5 overflow-hidden border border-emerald-950">
              <div
                className="bg-gradient-to-r from-emerald-600 to-green-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(stats.tamLuc / stats.maxTamLuc) * 100}%` }}
              />
            </div>
          </div>

          {/* 3. Định Lực (Focus Buff) */}
          <div className="flex-1 min-w-[90px]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-indigo-300 font-medium font-serif">Định Lực</span>
              <span className="text-stone-300 font-sans">{stats.dinhLuc}%</span>
            </div>
            <div className="w-full bg-stone-800/80 rounded-full h-2.5 overflow-hidden border border-indigo-950">
              <div
                className="bg-gradient-to-r from-indigo-600 to-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.dinhLuc}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Day/Time cycle & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Day & Time badge */}
          <button
            onClick={() => advanceTimeOfDay()}
            title="Nhấn để chuyển sang buổi tiếp theo"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/60 hover:border-amber-500/50 transition-colors text-xs text-stone-200 cursor-pointer"
          >
            {timeInfo.icon}
            <span className="font-serif font-medium">Ngày {stats.dayCount}: {timeInfo.label}</span>
            {getWeatherIcon()}
          </button>

          {/* Map Nav */}
          <button
            onClick={() => setModal('map')}
            className="zen-btn-subtle p-2 rounded-xl flex items-center justify-center"
            title="Bản Đồ Khuôn Viên Chùa"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
          </button>

          {/* Sổ Tay Tỉnh Thức (Journal) */}
          <button
            onClick={() => setModal('journal')}
            className="zen-btn-subtle p-2 rounded-xl flex items-center justify-center relative"
            title="Sổ Tay Tỉnh Thức"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="zen-btn-subtle p-2 rounded-xl flex items-center justify-center"
            title={isMuted ? 'Bật âm thanh ASMR' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
