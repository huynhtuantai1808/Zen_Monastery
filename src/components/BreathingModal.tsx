import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { soundEngine } from '../services/audioEngine';
import { Wind, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface DistractionBubble {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  popped: boolean;
}

const DISTRACTION_WORDS = [
  'Deadline dồn dập',
  'Tiền bạc & Cơm áo',
  'Mạng xã hội & Drama',
  'Áp lực đồng trang lứa',
  'Sợ hãi tương lai',
  'Hối tiếc quá khứ',
  'Tin nhắn chưa đọc',
];

export const BreathingModal: React.FC = () => {
  const { setModal, restoreTamLuc, setDinhLuc, addCongDuc, stats } = useGameStore();

  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);
  const [bubbles, setBubbles] = useState<DistractionBubble[]>([]);
  const [clearedCount, setClearedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Sound cue on open
  useEffect(() => {
    soundEngine.playSingingBowl();

    // Spawn initial bubbles
    const initial = DISTRACTION_WORDS.slice(0, 5).map((word, idx) => ({
      id: idx,
      text: word,
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 55,
      speed: 0.2 + Math.random() * 0.3,
      popped: false,
    }));
    setBubbles(initial);
  }, []);

  // 4-4-4 Breathing Cycle
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            return 4;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 4;
          } else {
            setPhase('inhale');
            setCycleCount((c) => {
              const newC = c + 1;
              if (newC >= 3 && clearedCount >= 3) {
                setIsFinished(true);
                soundEngine.playEnlightenment();
              }
              return newC;
            });
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isFinished, clearedCount]);

  // Pop a distraction bubble by touching/clicking it with mindfulness
  const handlePopBubble = (id: number) => {
    soundEngine.playWindChime();
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );
    setClearedCount((c) => c + 1);
  };

  const handleFinish = () => {
    restoreTamLuc(35);
    setDinhLuc(Math.min(100, stats.dinhLuc + 25));
    addCongDuc(30);
    setModal(null);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Hít vào chậm rãi qua mũi... (Hấp thu năng lượng đất trời)';
      case 'hold':
        return 'Giữ nhẹ hơi thở... (Tâm trí tĩnh lặng như mặt hồ)';
      case 'exhale':
        return 'Thở ra nhẹ nhàng qua miệng... (Buông xả hết muộn phiền)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="zen-paper-panel max-w-2xl w-full rounded-3xl p-6 md:p-8 relative flex flex-col items-center border border-amber-500/40 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setModal(null)}
          className="absolute top-5 right-5 text-stone-500 hover:text-stone-800 p-2 rounded-full cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-serif font-bold uppercase tracking-wider mb-2 border border-amber-300">
            <Wind className="w-3.5 h-3.5" /> Tịnh Tâm Điều Tức (Mini-game Hơi Thở)
          </div>
          <h2 className="font-heading text-2xl md:text-3xl text-stone-900 font-bold">
            Thanh Lọc Tạp Niệm
          </h2>
          <p className="text-xs md:text-sm text-stone-600 font-serif max-w-md mt-1">
            Chạm vào các bong bóng tạp niệm để làm tan biến chúng, kết hợp giữ nhịp thở điều hòa để đưa tâm về hiện tại.
          </p>
        </div>

        {/* Interactive Breathing Canvas Area */}
        <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center my-4">
          {/* Animated Pulsing Rings */}
          <div
            className={`absolute rounded-full border-4 border-amber-400/30 transition-all duration-1000 ease-in-out ${
              phase === 'inhale'
                ? 'w-72 h-72 bg-amber-500/10'
                : phase === 'hold'
                ? 'w-72 h-72 bg-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.3)]'
                : 'w-36 h-36 bg-amber-500/5'
            }`}
          />

          <div
            className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center text-center p-4 transition-all duration-1000 ${
              phase === 'inhale'
                ? 'scale-110 bg-amber-500 text-white shadow-xl'
                : phase === 'hold'
                ? 'scale-115 bg-amber-600 text-amber-50 shadow-2xl'
                : 'scale-90 bg-amber-700 text-amber-100 shadow-md'
            }`}
          >
            <span className="font-heading text-4xl font-bold tracking-wider">{timer}</span>
            <span className="font-serif text-sm font-semibold capitalize mt-1">
              {phase === 'inhale' ? 'Hít Vào' : phase === 'hold' ? 'Giữ Hơi' : 'Thở Ra'}
            </span>
          </div>

          {/* Floating Distraction Bubbles to Pop */}
          {bubbles.map((b) => (
            !b.popped && (
              <button
                key={b.id}
                onClick={() => handlePopBubble(b.id)}
                className="absolute z-20 px-3 py-1.5 rounded-full bg-stone-800/85 text-stone-200 text-xs border border-amber-400/40 hover:bg-rose-900/80 hover:text-white hover:scale-105 transition-all shadow-lg cursor-pointer animate-float"
                style={{
                  top: `${b.y}%`,
                  left: `${b.x}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                💭 {b.text} ✕
              </button>
            )
          ))}
        </div>

        {/* Phase Instruction Text */}
        <p className="text-center font-serif text-sm font-medium text-stone-700 min-h-[32px] mt-2">
          {getPhaseText()}
        </p>

        {/* Progress Counters */}
        <div className="flex items-center gap-6 mt-4 text-xs font-serif text-stone-600">
          <span>Nhịp thở hoàn thành: <strong className="text-amber-800">{cycleCount}/3</strong></span>
          <span>Tạp niệm đã tiêu tan: <strong className="text-amber-800">{clearedCount}/{bubbles.length}</strong></span>
        </div>

        {/* Complete State */}
        {isFinished && (
          <div className="mt-6 flex flex-col items-center gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-700 font-serif font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Tâm trí đã trở nên thanh tịnh, tạp niệm lắng xuống!
            </div>
            <button
              onClick={handleFinish}
              className="zen-btn-gold px-8 py-3 rounded-full text-base font-serif flex items-center gap-2 shadow-xl"
            >
              <Sparkles className="w-5 h-5" /> Trở lại Chánh Điện
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
