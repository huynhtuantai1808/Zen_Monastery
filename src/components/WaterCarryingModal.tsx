import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Droplets } from 'lucide-react';
import { soundEngine } from '../services/audioEngine';

interface WaterCarryingModalProps {
  onComplete: (merit: number, staminaRestore: number) => void;
  onClose: () => void;
  spendStamina: (amount: number) => boolean;
}

export const WaterCarryingModal: React.FC<WaterCarryingModalProps> = ({
  onComplete,
  onClose,
  spendStamina,
}) => {
  const [step, setStep] = useState<'DRAW' | 'CARRY' | 'POUR' | 'FINISHED'>('DRAW');
  const [tripCount, setTripCount] = useState<number>(0);
  const targetTrips = 2;

  // Balance meter (-50 to +50, 0 is perfect balance)
  const [balance, setBalance] = useState<number>(0);
  const [stepsWalked, setStepsWalked] = useState<number>(0);
  const targetSteps = 5;
  const [, setWaterSpilled] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');

  // Balance sway physics during CARRY phase
  useEffect(() => {
    if (step !== 'CARRY') return;

    const interval = setInterval(() => {
      setBalance((prev) => {
        // Natural mountain wind drift
        const drift = (Math.random() - 0.48) * 4.5;
        const next = Math.max(-50, Math.min(50, prev + drift));
        if (Math.abs(next) > 42) {
          setWaterSpilled(true);
          soundEngine.playWarning();
          setFeedback('⚠️ Nước hơi sánh ra ngoài! Hãy giữ đòn gánh thăng bằng...');
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [step]);

  const handleDrawWater = () => {
    if (!spendStamina(5)) return;
    soundEngine.playWaterPour();
    setStep('CARRY');
    setBalance(0);
    setStepsWalked(0);
    setWaterSpilled(false);
    setFeedback('Đôi thùng nước suối đầy ắp trong veo. Bước từng bước chậm rãi...');
  };

  const handleWalkStep = (adjust: number) => {
    soundEngine.playBell(528, 0.4);
    const newBal = Math.max(-45, Math.min(45, balance + adjust));
    setBalance(newBal);

    const nextSteps = stepsWalked + 1;
    setStepsWalked(nextSteps);

    if (nextSteps % 2 === 1) {
      setFeedback('🌿 Chân trái chạm đất, lòng an tĩnh...');
    } else {
      setFeedback('🌿 Chân phải bước tới, tâm sáng trong...');
    }

    if (nextSteps >= targetSteps) {
      setTimeout(() => {
        setStep('POUR');
      }, 500);
    }
  };

  const handlePourWater = () => {
    soundEngine.playWaterPour();
    soundEngine.playBell(528, 1.8);
    const nextTrip = tripCount + 1;
    setTripCount(nextTrip);

    if (nextTrip >= targetTrips) {
      setTimeout(() => {
        setStep('FINISHED');
      }, 800);
    } else {
      setFeedback('Gánh nước thứ nhất đã đổ đầy nửa lu. Tiếp tục gánh chuyến thứ hai...');
      setTimeout(() => {
        setStep('DRAW');
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-600/50 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col text-stone-100 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🪣</span>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-amber-200">
                Gánh Nước Suối Lên Chùa
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-400 font-serif">
                Giếng Tiên & Lu Nước • &ldquo;Mỗi bước chân chạm đất là một đóa sen nở&rdquo;
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

        {/* BƯỚC 1: MÚC NƯỚC GIẾNG SUỐI */}
        {step === 'DRAW' && (
          <div className="my-5 text-center space-y-4">
            <div className="relative h-44 rounded-2xl bg-gradient-to-b from-sky-950/40 to-stone-900 border border-sky-500/30 flex flex-col items-center justify-center p-4">
              <span className="text-5xl animate-bounce">⛲</span>
              <div className="text-sm font-serif text-sky-200 mt-2 font-bold">
                Giếng Tiên Nước Suối Trong Veo
              </div>
              <p className="text-xs text-stone-300 font-serif max-w-xs mt-1">
                Dòng nước ngầm từ đỉnh núi Vân Sơn thanh ngọt, dùng để dâng cúng Phật và pha trà đại chúng.
              </p>
              <div className="absolute top-3 left-4 text-xs font-mono text-amber-300 bg-stone-900/80 px-2 py-0.5 rounded-lg border border-amber-500/30">
                Chuyến gánh: {tripCount}/{targetTrips}
              </div>
            </div>

            {feedback && <div className="text-xs text-stone-300 font-serif italic">{feedback}</div>}

            <button
              onClick={handleDrawWater}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-stone-950 font-serif font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Droplets className="w-5 h-5" />
              <span>Múc Nước Vào Đôi Thùng Gỗ</span>
            </button>
          </div>
        )}

        {/* BƯỚC 2: GÁNH NƯỚC & GIỮ THĂNG BẰNG */}
        {step === 'CARRY' && (
          <div className="my-4 space-y-4">
            {/* Visual Balance Pole */}
            <div className="relative h-44 rounded-2xl bg-gradient-to-b from-stone-950 to-stone-900 border border-stone-800 flex flex-col items-center justify-center p-4 overflow-hidden">
              {/* Carrying pole visual tilt */}
              <div
                className="relative w-52 h-2 rounded-full bg-amber-700 shadow-lg flex items-center justify-between transition-transform duration-150"
                style={{ transform: `rotate(${balance * 0.35}deg)` }}
              >
                {/* Left bucket */}
                <div className="absolute -left-3 top-2 flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-stone-500" />
                  <div className="w-8 h-8 rounded-b-lg bg-amber-800 border border-amber-600 flex items-center justify-center text-[10px]">
                    💧
                  </div>
                </div>

                {/* Center monk shoulder */}
                <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 text-xs flex items-center justify-center font-bold mx-auto">
                  🚶
                </div>

                {/* Right bucket */}
                <div className="absolute -right-3 top-2 flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-stone-500" />
                  <div className="w-8 h-8 rounded-b-lg bg-amber-800 border border-amber-600 flex items-center justify-center text-[10px]">
                    💧
                  </div>
                </div>
              </div>

              {/* Steps Progress */}
              <div className="mt-8 text-xs font-serif text-amber-200">
                Bước chân chánh niệm: <strong>{stepsWalked}/{targetSteps}</strong>
              </div>
            </div>

            {/* Balance Indicator Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-serif text-stone-400 px-1">
                <span>Nghiêng Trái</span>
                <span className="text-emerald-300 font-bold">⚖️ CÂN BẰNG TÂM Ý</span>
                <span>Nghiêng Phải</span>
              </div>
              <div className="relative w-full h-6 bg-stone-950 rounded-xl overflow-hidden border border-stone-700 p-0.5">
                <div className="absolute inset-y-0 left-[35%] right-[35%] bg-emerald-500/20 border-x border-emerald-400/40" />
                <div
                  className="absolute top-1 bottom-1 w-3 bg-sky-400 rounded-md shadow-md border border-sky-200 -translate-x-1/2 transition-all duration-75"
                  style={{ left: `${50 + balance}%` }}
                />
              </div>
            </div>

            {feedback && <div className="text-xs text-center font-serif text-stone-300 italic">{feedback}</div>}

            {/* Stepping & Balance Controls */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleWalkStep(-8)}
                className="py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 active:scale-95 border border-stone-600 text-xs font-serif flex items-center justify-center gap-1.5 cursor-pointer shadow transition"
              >
                <span>⬅️ Chân Trái (Chỉnh Trái)</span>
              </button>
              <button
                onClick={() => handleWalkStep(8)}
                className="py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 active:scale-95 border border-stone-600 text-xs font-serif flex items-center justify-center gap-1.5 cursor-pointer shadow transition"
              >
                <span>Chân Phải (Chỉnh Phải) ➡️</span>
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 3: ĐỔ NƯỚC VÀO LU SÀNH ĐẠI CHÚNG */}
        {step === 'POUR' && (
          <div className="my-5 text-center space-y-4">
            <div className="h-44 rounded-2xl bg-gradient-to-b from-teal-950/40 to-stone-900 border border-teal-500/30 flex flex-col items-center justify-center p-4">
              <span className="text-5xl animate-bounce">🏺</span>
              <div className="text-sm font-serif text-teal-200 mt-2 font-bold">
                Lu Sành Đại Chúng Đón Nước Mới
              </div>
              <p className="text-xs text-stone-300 font-serif max-w-xs mt-1">
                Nước được đổ vào lu, làm dịu cơn khát của khách thập phương và chúng tăng.
              </p>
            </div>

            <button
              onClick={handlePourWater}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-stone-950 font-serif font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Droplets className="w-5 h-5" />
              <span>Rót Nước Đầy Lu Sành</span>
            </button>
          </div>
        )}

        {/* BƯỚC 4: HOÀN MÃN */}
        {step === 'FINISHED' && (
          <div className="my-6 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 mx-auto rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-3xl shadow-lg">
              🪷
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-sky-200">
                Lu Nước Chùa Đã Đầy Ắp!
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-serif mt-1 max-w-sm mx-auto">
                Từng gáo nước mát lành gánh từ suối tiên đã sẵn sàng phục vụ đại chúng. Bước chân chánh niệm của bạn làm hoa sen nở rộ.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/40 text-xs text-sky-200 font-serif italic">
              &ldquo;Nước trong ngọc bích soi lòng tịnh, bước nhẹ non cao lắng bụi trần.&rdquo;
            </div>

            <div className="flex justify-center gap-4 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ✨ +40 Phước Báu
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                🍵 +20 Tâm Lực
              </span>
            </div>

            <button
              onClick={() => {
                onComplete(40, 20);
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
