import React from 'react';
import { useGameStore, ZONES } from '../store/gameStore';
import { X, Lock, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import type { ZoneId } from '../types/game';

export const MapModal: React.FC = () => {
  const { setModal, changeZone, stats } = useGameStore();

  const handleSelectZone = (zoneId: ZoneId) => {
    changeZone(zoneId);
    setModal(null);
  };

  const zoneList: ZoneId[] = ['sanChua', 'nhaBep', 'chanhDien', 'vuonTra', 'hoLienHoa', 'tangKinhCac'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl">
      <div className="anime-paper-panel max-w-3xl w-full rounded-[32px] p-6 md:p-8 relative flex flex-col border-2 border-pink-400/40 shadow-[0_20px_60px_rgba(244,114,182,0.25)] max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setModal(null)}
          className="absolute top-5 right-5 text-purple-900/50 hover:text-pink-600 p-2.5 rounded-full hover:bg-pink-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Anime Header */}
        <div className="border-b border-purple-200/60 pb-4 mb-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 text-pink-700 text-xs font-heading font-black uppercase tracking-wider mb-2 border border-pink-400/30">
            <MapPin className="w-3.5 h-3.5 text-pink-600" /> Bản Đồ Khuôn Viên • Anime World Map
          </div>
          <h2 className="font-heading text-2xl md:text-3xl text-purple-950 font-black">
            Chùa Vân Ẩn Sơn Tự
          </h2>
          <p className="text-xs text-purple-800/80 font-sans max-w-md mx-auto mt-1 font-semibold">
            Chọn khu vực bạn muốn du hành. Các khu vực mới sẽ khai mở khi Cấp độ Công Đức của bạn tăng cao!
          </p>
        </div>

        {/* Zone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1 my-2">
          {zoneList.map((zId) => {
            const z = ZONES[zId];
            const isUnlocked = stats.unlockedZones.includes(zId);
            const isCurrent = stats.currentZone === zId;

            return (
              <div
                key={zId}
                onClick={() => isUnlocked && handleSelectZone(zId)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-br from-pink-100 to-purple-100 border-pink-500 shadow-md ring-2 ring-pink-400/40 scale-[1.01]'
                    : isUnlocked
                    ? 'bg-white/85 border-purple-200/80 hover:bg-purple-50/90 hover:border-pink-400 cursor-pointer shadow-sm hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(244,114,182,0.2)]'
                    : 'bg-purple-100/40 border-purple-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-heading font-black text-base text-purple-950 flex items-center gap-2">
                      {z.name}
                    </span>
                    {isCurrent ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-heading font-black flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" /> Đang ở đây
                      </span>
                    ) : !isUnlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-200/80 text-purple-800 text-[10px] font-heading font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Cấp {z.minLevel}
                      </span>
                    ) : (
                      <span className="text-xs text-pink-600 font-heading font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Đã mở khóa
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-pink-700 font-heading font-bold italic mb-1.5">
                    {z.subtitle}
                  </div>

                  <p className="text-xs text-purple-900/80 font-sans leading-relaxed font-medium">
                    {z.description}
                  </p>
                </div>

                {isUnlocked && !isCurrent && (
                  <button className="mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 text-pink-700 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white text-xs font-heading font-black transition-all w-full text-center cursor-pointer shadow-sm">
                    Di chuyển đến đây ➔
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer level guide */}
        <div className="pt-3 border-t border-purple-200/60 text-center text-xs text-purple-900/80 font-sans font-bold">
          Cấp độ hiện tại: <strong className="text-pink-600 font-heading font-black">Cấp {stats.level} ({stats.title})</strong>
        </div>
      </div>
    </div>
  );
};
