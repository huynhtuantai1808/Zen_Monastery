import React from 'react';
import { useGameStore, ZONES } from '../store/gameStore';
import { X, Lock, CheckCircle2 } from 'lucide-react';
import type { ZoneId } from '../types/game';

export const MapModal: React.FC = () => {
  const { setModal, changeZone, stats } = useGameStore();

  const handleSelectZone = (zoneId: ZoneId) => {
    changeZone(zoneId);
    setModal(null);
  };

  const zoneList: ZoneId[] = ['sanChua', 'nhaBep', 'chanhDien', 'vuonTra', 'hoLienHoa', 'tangKinhCac'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="zen-paper-panel max-w-3xl w-full rounded-3xl p-6 md:p-8 relative flex flex-col border border-amber-500/50 shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Close */}
        <button
          onClick={() => setModal(null)}
          className="absolute top-5 right-5 text-stone-500 hover:text-stone-800 p-2 rounded-full cursor-pointer z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="border-b border-amber-900/15 pb-4 mb-4 text-center">
          <div className="text-xs font-serif text-amber-800 font-bold uppercase tracking-wider mb-1">
            Bản Đồ Khuôn Viên
          </div>
          <h2 className="font-heading text-2xl md:text-3xl text-stone-900 font-bold">
            Chùa Vân Ẩn Sơn Tự
          </h2>
          <p className="text-xs text-stone-600 font-serif max-w-md mx-auto mt-1">
            Chọn khu vực để di chuyển tâm cảnh. Các khu vực mới sẽ khai mở khi Cấp độ Công Đức của bạn tăng cao.
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
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-amber-100/90 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                    : isUnlocked
                    ? 'bg-white/80 border-amber-200 hover:bg-amber-50 hover:border-amber-400 cursor-pointer shadow-sm hover:scale-[1.01]'
                    : 'bg-stone-200/50 border-stone-300 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
                      {z.name}
                    </span>
                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-serif font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đang ở đây
                      </span>
                    ) : !isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-stone-300 text-stone-700 text-[10px] font-serif font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Cấp {z.minLevel}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-700 font-serif font-semibold">Đã mở khóa</span>
                    )}
                  </div>

                  <div className="text-xs text-amber-800 font-serif italic mb-2">
                    {z.subtitle}
                  </div>

                  <p className="text-xs text-stone-600 font-serif leading-relaxed">
                    {z.description}
                  </p>
                </div>

                {isUnlocked && !isCurrent && (
                  <button className="mt-3 py-1.5 px-3 rounded-xl bg-amber-600/10 text-amber-800 hover:bg-amber-600 hover:text-white text-xs font-serif font-bold transition-colors w-full text-center">
                    Di chuyển đến đây ➔
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer level guide */}
        <div className="pt-3 border-t border-amber-900/15 text-center text-xs text-stone-600 font-serif">
          Cấp độ hiện tại: <strong className="text-amber-800">{stats.level} ({stats.title})</strong>
        </div>
      </div>
    </div>
  );
};
