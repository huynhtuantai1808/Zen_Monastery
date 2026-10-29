import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { soundEngine } from '../services/audioEngine';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

interface LeafItem {
  id: number;
  x: number;
  y: number;
  swept: boolean;
}

export const SweepingGameModal: React.FC = () => {
  const { setModal, addCongDuc, spendTamLuc, completeQuest } = useGameStore();

  const [leaves, setLeaves] = useState<LeafItem[]>([]);
  const [sweptCount, setSweptCount] = useState(0);
  const [windEvent, setWindEvent] = useState(false);
  const [patienceBonus, setPatienceBonus] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize leaves scattered around courtyard
  useEffect(() => {
    soundEngine.playWindChime();
    const initial: LeafItem[] = [];
    for (let i = 0; i < 15; i++) {
      initial.push({
        id: i,
        x: 10 + Math.random() * 80,
        y: 15 + Math.random() * 70,
        swept: false,
      });
    }
    setLeaves(initial);

    // Wind gust event occurs when half swept
    const windTimer = setTimeout(() => {
      setWindEvent(true);
      soundEngine.playBroomSweep();
      // Drop 4 more leaves to test patience
      setLeaves((prev) => [
        ...prev,
        { id: 991, x: 25, y: 35, swept: false },
        { id: 992, x: 65, y: 55, swept: false },
        { id: 993, x: 45, y: 75, swept: false },
      ]);
    }, 4500);

    return () => clearTimeout(windTimer);
  }, []);

  const handleSweepLeaf = (id: number) => {
    soundEngine.playBroomSweep();

    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, swept: true } : l))
    );
    setSweptCount((prev) => {
      const next = prev + 1;
      if (next >= 14 && !isCompleted) {
        setIsCompleted(true);
        completeQuest('q-sweep');
        soundEngine.playEnlightenment();
      }
      return next;
    });
  };

  const handlePatienceAccept = () => {
    setPatienceBonus(true);
    setWindEvent(false);
    addCongDuc(30); // Hidden Merit bonus for patience!
    soundEngine.playSingingBowl();
  };

  const handleFinish = () => {
    if (spendTamLuc(15)) {
      addCongDuc(patienceBonus ? 65 : 35);
    }
    setModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="zen-paper-panel max-w-2xl w-full rounded-3xl p-6 md:p-8 relative flex flex-col items-center border border-amber-500/50 shadow-2xl">
        {/* Close */}
        <button
          onClick={() => setModal(null)}
          className="absolute top-5 right-5 text-stone-500 hover:text-stone-800 p-2 rounded-full cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-serif font-bold uppercase tracking-wider mb-2 border border-amber-300">
            🧹 Lao Tác Tích Phước
          </div>
          <h2 className="font-heading text-2xl md:text-3xl text-stone-900 font-bold">
            Quét Lá Đa Sân Chùa
          </h2>
          <p className="text-xs md:text-sm text-stone-600 font-serif max-w-md mt-1">
            Chạm vào từng chiếc lá khô để gom vào góc sân. Hãy quét với nhịp thở thong dong, không vội vã.
          </p>
        </div>

        {/* Sweeping Courtyard Interactive Arena */}
        <div className="relative w-full h-80 rounded-2xl bg-amber-950/15 border border-amber-900/30 overflow-hidden shadow-inner flex items-center justify-center p-4">
          {/* Stone courtyard texture lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none repeating-linear-gradient" />

          {/* Leaves */}
          {leaves.map((leaf) => (
            !leaf.swept && (
              <button
                key={leaf.id}
                onClick={() => handleSweepLeaf(leaf.id)}
                className="absolute z-10 w-10 h-10 -ml-5 -mt-5 flex items-center justify-center text-2xl hover:scale-125 transition-transform cursor-pointer drop-shadow-md animate-float"
                style={{
                  top: `${leaf.y}%`,
                  left: `${leaf.x}%`,
                }}
                title="Gom chiếc lá khô này"
              >
                🍂
              </button>
            )
          ))}

          {/* Wind Gust Event Popup (Patience Challenge) */}
          {windEvent && (
            <div className="absolute inset-x-4 top-4 z-20 p-4 rounded-2xl bg-amber-900/90 text-amber-100 backdrop-blur-md border border-amber-400 shadow-2xl flex flex-col items-center text-center gap-2 animate-bounce">
              <span className="text-2xl">💨</span>
              <div className="font-serif font-bold text-sm">
                Một cơn gió bất ngờ thổi ào qua, lá lại rụng thêm xuống sân!
              </div>
              <p className="text-xs text-amber-200/90 font-serif">
                Bạn có giữ được tâm bình thản để tiếp tục quét dọn không?
              </p>
              <div className="flex gap-3 mt-1">
                <button
                  onClick={handlePatienceAccept}
                  className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-900 text-xs font-serif font-bold shadow-md cursor-pointer"
                >
                  🍃 Mỉm cười quét tiếp (Nhận Phước Ẩn)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between w-full mt-4 text-xs font-serif text-stone-600 px-2">
          <span>Lá đã quét sạch: <strong className="text-amber-800">{sweptCount}/{leaves.length}</strong></span>
          {patienceBonus && (
            <span className="text-amber-700 font-bold flex items-center gap-1">
              ✨ Đã nhận Phước Ẩn (Nhẫn nại)
            </span>
          )}
        </div>

        {/* Completed */}
        {isCompleted && (
          <div className="mt-5 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-emerald-800 font-serif font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Sân chùa đã phong quang sạch bóng lá rụng!
            </div>
            <button
              onClick={handleFinish}
              className="zen-btn-gold px-8 py-3 rounded-full text-base font-serif flex items-center gap-2 shadow-xl cursor-pointer"
            >
              <Sparkles className="w-5 h-5" /> Hoàn Tất Tích Phước
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
