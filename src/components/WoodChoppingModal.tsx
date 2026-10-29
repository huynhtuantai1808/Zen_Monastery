import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../services/audioEngine';

interface WoodChoppingModalProps {
  onComplete: (merit: number, staminaRestore: number) => void;
  onClose: () => void;
  spendStamina: (amount: number) => boolean;
}

export const WoodChoppingModal: React.FC<WoodChoppingModalProps> = ({
  onComplete,
  onClose,
  spendStamina,
}) => {
  const [choppedCount, setChoppedCount] = useState<number>(0);
  const targetCount = 3;
  const [isSwinging, setIsSwinging] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [meterPos, setMeterPos] = useState<number>(50); // 0 to 100
  const [, setMeterDirection] = useState<number>(1);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const animRef = useRef<number | null>(null);

  // Oscillating indicator for mindful timing
  useEffect(() => {
    if (isFinished) return;

    let pos = 50;
    let dir = 1;
    const speed = 1.6;

    const loop = () => {
      pos += dir * speed;
      if (pos >= 96) {
        pos = 96;
        dir = -1;
      } else if (pos <= 4) {
        pos = 4;
        dir = 1;
      }
      setMeterPos(pos);
      setMeterDirection(dir);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isFinished]);

  const handleChop = () => {
    if (isSwinging || isFinished) return;

    if (!spendStamina(5)) return;

    setIsSwinging(true);

    // Green zone is between 38% and 62%
    const isPerfect = meterPos >= 40 && meterPos <= 60;
    const isGood = meterPos >= 28 && meterPos <= 72;

    setTimeout(() => {
      if (isPerfect || isGood) {
        soundEngine.playWoodChop();
        const nextCount = choppedCount + 1;
        setChoppedCount(nextCount);

        if (isPerfect) {
          soundEngine.playBell(528, 1.2);
          setFeedback({
            text: '✨ LỰC ĐẠO ĐỊNH TÂM! Khúc củi nứt toác giòn tan!',
            color: 'text-amber-300 font-bold',
          });
        } else {
          setFeedback({
            text: '🌿 Nhát rìu vừa vặn, củi chẻ đều đẹp.',
            color: 'text-emerald-300',
          });
        }

        if (nextCount >= targetCount) {
          setIsFinished(true);
          soundEngine.playBell(528, 2.5);
        }
      } else {
        soundEngine.playWarning();
        setFeedback({
          text: '⚠️ Tâm còn vội vã! Lưỡi rìu trượt nhẹ, hãy hít thở sâu...',
          color: 'text-rose-400',
        });
      }

      setTimeout(() => {
        setIsSwinging(false);
      }, 350);
    }, 200);
  };

  // Keyboard shortcut: Space or Enter to chop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleChop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [meterPos, isSwinging, isFinished, choppedCount]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-600/50 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col text-stone-100 overflow-hidden">
        {/* Background Zen decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🪓</span>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-amber-200">
                Chẻ Củi Nấu Cơm Chay
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-400 font-serif">
                Bếp Hương Tích • &ldquo;Gánh nước chẻ củi, thảy đều là diệu đạo&rdquo;
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isFinished ? (
          <div className="my-4 space-y-4">
            {/* Visual Chopping Area */}
            <div className="relative h-44 sm:h-52 rounded-2xl bg-gradient-to-b from-stone-950 to-stone-900 border border-stone-800 flex flex-col items-center justify-end pb-4 overflow-hidden">
              {/* Smoke from kitchen in background */}
              <div className="absolute top-3 right-6 text-stone-600 text-xs font-serif italic animate-pulse">
                Khói bếp lam chiều...
              </div>

              {/* Axe Animation */}
              <div
                className={`absolute transition-transform duration-200 origin-bottom-right text-4xl sm:text-5xl ${
                  isSwinging ? 'top-16 translate-x-4 rotate-45 scale-110' : 'top-6 -translate-x-6 -rotate-12'
                }`}
                style={{ left: '50%' }}
              >
                🪓
              </div>

              {/* Wood Log on Chopping Block */}
              <div className="relative flex flex-col items-center">
                {/* Wood log */}
                <div
                  className={`w-16 h-20 rounded-md bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 border border-amber-700/60 shadow-lg flex items-center justify-center transition-all ${
                    isSwinging ? 'scale-x-110' : ''
                  }`}
                >
                  <div className="w-2 h-16 border-r border-amber-950/60" />
                </div>
                {/* Chopping stump */}
                <div className="w-32 h-10 rounded-lg bg-stone-800 border-2 border-stone-700 flex items-center justify-center text-[10px] text-stone-400 font-mono shadow-md">
                  Thớt Gỗ Nghiến
                </div>
              </div>

              {/* Progress Count */}
              <div className="absolute top-3 left-4 px-2.5 py-1 rounded-xl bg-stone-900/90 border border-amber-500/30 text-xs text-amber-300 font-serif flex items-center gap-1.5">
                <span>Củi đã chẻ:</span>
                <span className="font-mono font-bold text-amber-100">{choppedCount}/{targetCount}</span>
              </div>
            </div>

            {/* Mindful Timing Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-serif text-stone-300 px-1">
                <span>Tâm Vội Vã</span>
                <span className="text-amber-300 font-bold">✨ VÙNG ĐỊNH TÂM ✨</span>
                <span>Tâm Tán Loạn</span>
              </div>

              {/* Slider Track */}
              <div className="relative w-full h-8 bg-stone-950 rounded-xl overflow-hidden border border-stone-700 p-0.5 shadow-inner">
                {/* Safe Green Zone in center */}
                <div className="absolute inset-y-0 left-[35%] right-[35%] bg-emerald-500/25 border-x-2 border-emerald-400 flex items-center justify-center">
                  <span className="text-[10px] text-emerald-300 font-serif font-bold opacity-80">
                    Chánh Niệm
                  </span>
                </div>

                {/* Moving Indicator */}
                <div
                  className="absolute top-1 bottom-1 w-3.5 bg-amber-400 rounded-lg shadow-lg border border-yellow-200 -translate-x-1/2 transition-all duration-75"
                  style={{ left: `${meterPos}%` }}
                />
              </div>

              <div className="text-[11px] text-stone-400 font-serif text-center">
                Canh đúng lúc vạch vàng trượt vào vùng xanh, nhấn <strong>Hạ Nhát Rìu</strong> (hoặc Phím Cách)
              </div>
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div className={`text-xs sm:text-sm text-center font-serif ${feedback.color} animate-bounce`}>
                {feedback.text}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleChop}
              disabled={isSwinging}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-98 text-stone-950 font-serif font-bold text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <span className="text-xl">🪓</span>
              <span>Hạ Nhát Rìu (Phím Cách)</span>
            </button>
          </div>
        ) : (
          /* Completion Screen */
          <div className="my-6 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg">
              🪵
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-amber-200">
                Công Quả Chẻ Củi Hoàn Mãn!
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-serif mt-1 max-w-sm mx-auto">
                Củi đã được xếp ngay ngắn bên bếp Hương Tích, sẵn sàng nấu nồi cơm chay thơm lừng nuôi dưỡng chúng tăng và khách thập phương.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 font-serif italic">
              &ldquo;Gọt giũa tâm sân hận, chuyển hóa thành ngọn lửa ấm từ bi.&rdquo;
            </div>

            <div className="flex justify-center gap-4 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ✨ +45 Phước Báu
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                🍵 +15 Tâm Lực
              </span>
            </div>

            <button
              onClick={() => {
                onComplete(45, 15);
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-serif font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Tiếp Nhận Phước Báu & Trở Lại</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
