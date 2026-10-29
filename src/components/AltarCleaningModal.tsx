import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../services/audioEngine';

interface AltarCleaningModalProps {
  onComplete: (merit: number, staminaRestore: number) => void;
  onClose: () => void;
  spendStamina: (amount: number) => boolean;
}

export const AltarCleaningModal: React.FC<AltarCleaningModalProps> = ({
  onComplete,
  onClose,
  spendStamina,
}) => {
  // 4 steps of altar reverence
  const [cleanedDust, setCleanedDust] = useState<number[]>([1, 2, 3, 4]); // 4 dust spots on lotus throne
  const [censerPolished, setCenserPolished] = useState<boolean>(false);
  const [flowersArranged, setFlowersArranged] = useState<boolean>(false);
  const [lampsLit, setLampsLit] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('Dùng khăn sạch lau từng hạt bụi mờ trên toà sen Đức Phật...');

  const handleCleanDust = (id: number) => {
    if (!spendStamina(3)) return;
    soundEngine.playBroomSweep();
    const next = cleanedDust.filter((item) => item !== id);
    setCleanedDust(next);

    if (next.length === 0) {
      soundEngine.playAltarChime();
      setFeedback('Toà sen thanh tịnh không vướng bụi trần. Tiếp theo: Đánh bóng lư hương đồng...');
    } else {
      setFeedback(`Lau sạch bụi trần vi tế... còn ${next.length} hạt bụi.`);
    }
  };

  const handlePolishCenser = () => {
    if (!spendStamina(5)) return;
    soundEngine.playAltarChime();
    setCenserPolished(true);
    setFeedback('Lư hương đồng sáng bóng trang nghiêm! Tiếp theo: Cắm hoa sen tươi dâng Phật...');
  };

  const handleArrangeFlowers = () => {
    if (!spendStamina(5)) return;
    soundEngine.playBell(528, 1.5);
    setFlowersArranged(true);
    setFeedback('Hoa sen ngát hương đã an vị trong bình ngọc! Cuối cùng: Thắp ngọn đèn hoa đăng trí tuệ...');
  };

  const handleLightLamps = () => {
    if (!spendStamina(5)) return;
    soundEngine.playAltarChime();
    soundEngine.playDistantEchoBell(1, 0.8);
    setLampsLit(true);
    setIsFinished(true);
    setFeedback('Đèn trí tuệ đã thắp sáng! Hào quang Đức Phật bao trùm mười phương...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-stone-900 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col text-stone-100 overflow-hidden">
        {/* Sacred golden aura glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🪷</span>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-amber-200">
                Lau Chùi Bàn Thờ Đức Phật
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-400 font-serif">
                Chánh Điện Trang Nghiêm • &ldquo;Thời thời cần phất thức, vật sử nhạ trần ai&rdquo;
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

        {/* Altar Presentation Viewport */}
        <div className="my-4 relative h-60 sm:h-68 rounded-2xl bg-gradient-to-b from-stone-950 via-stone-900 to-amber-950/30 border-2 border-amber-600/30 p-4 flex flex-col items-center justify-between overflow-hidden shadow-inner">
          {/* Buddha Golden Halo */}
          <div
            className={`absolute top-6 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full transition-all duration-1000 ${
              isFinished
                ? 'bg-amber-300/35 border-2 border-amber-200 scale-125 shadow-amber-300/50 shadow-2xl animate-pulse'
                : 'bg-amber-500/15 border border-amber-400/30'
            }`}
          />

          {/* Buddha Statue Centerpiece */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Golden Buddha Silhouette */}
            <span className={`text-6xl transition-all duration-700 ${isFinished ? 'scale-110 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]' : ''}`}>
              🧘‍♂️
            </span>
            <div className="text-xs font-serif font-bold text-amber-300 mt-1">
              Đức Bổn Sư Thích Ca Mâu Ni Phật
            </div>
          </div>

          {/* Golden Lotus Throne with Dust spots to click */}
          <div className="relative z-10 w-full max-w-sm flex items-center justify-center">
            <div className="relative w-48 h-8 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border border-amber-300 shadow-md flex items-center justify-around px-4">
              {/* Dust specks */}
              {cleanedDust.map((id, index) => (
                <button
                  key={id}
                  onClick={() => handleCleanDust(id)}
                  title="Nhấn để lau sạch bụi mờ"
                  className="w-5 h-5 rounded-full bg-stone-700 hover:bg-amber-400 border border-stone-500 text-[10px] flex items-center justify-center cursor-pointer shadow transition hover:scale-125 animate-pulse"
                  style={{ transform: `translateY(${(index % 2 === 0 ? -3 : 3)}px)` }}
                >
                  🧹
                </button>
              ))}
              {cleanedDust.length === 0 && (
                <span className="text-[10px] text-stone-950 font-serif font-bold">
                  ✨ Toà Sen Thanh Tịnh ✨
                </span>
              )}
            </div>
          </div>

          {/* Altar Offerings (Censer, Flowers, Lamps) */}
          <div className="relative z-10 w-full flex items-center justify-around border-t border-amber-900/40 pt-2 text-2xl">
            {/* Left Lamp */}
            <div className={`transition-all ${lampsLit ? 'scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]' : 'opacity-40'}`}>
              🪔
            </div>

            {/* Lotus vase */}
            <div className={`transition-all ${flowersArranged ? 'scale-110' : 'opacity-40 grayscale'}`}>
              🪷
            </div>

            {/* Bronze Incense Censer */}
            <div className={`transition-all ${censerPolished ? 'scale-110 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]' : 'opacity-50'}`}>
              🏺
            </div>

            {/* Right Lamp */}
            <div className={`transition-all ${lampsLit ? 'scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]' : 'opacity-40'}`}>
              🪔
            </div>
          </div>
        </div>

        {/* Feedback text */}
        <div className="text-xs text-center font-serif text-amber-200 italic mb-3">
          {feedback}
        </div>

        {/* Interactive Action Steps */}
        {!isFinished ? (
          <div className="grid grid-cols-2 gap-2 text-xs font-serif">
            {/* Step 1: Clean Dust */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                cleanedDust.length === 0
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-stone-800/80 border-stone-700 text-stone-300'
              }`}
            >
              <span>1. Lau Bụi Toà Sen</span>
              {cleanedDust.length === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="font-mono">{4 - cleanedDust.length}/4</span>}
            </div>

            {/* Step 2: Polish Censer */}
            <button
              onClick={handlePolishCenser}
              disabled={cleanedDust.length > 0 || censerPolished}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                censerPolished
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : cleanedDust.length === 0
                  ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-500 text-amber-200'
                  : 'bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>2. Đánh Bóng Lư Đồng</span>
              {censerPolished ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span>🏺</span>}
            </button>

            {/* Step 3: Arrange Flowers */}
            <button
              onClick={handleArrangeFlowers}
              disabled={!censerPolished || flowersArranged}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                flowersArranged
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : censerPolished
                  ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-500 text-amber-200'
                  : 'bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>3. Cắm Hoa Sen Tươi</span>
              {flowersArranged ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span>🪷</span>}
            </button>

            {/* Step 4: Light Lamps */}
            <button
              onClick={handleLightLamps}
              disabled={!flowersArranged || lampsLit}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                lampsLit
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : flowersArranged
                  ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-500 text-amber-200'
                  : 'bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>4. Thắp Đèn Hoa Đăng</span>
              {lampsLit ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span>🪔</span>}
            </button>
          </div>
        ) : (
          /* Finished Screen */
          <div className="text-center space-y-3.5 animate-scaleUp">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-amber-200">
              Bàn Thờ Đức Phật Trang Nghiêm Thanh Tịnh!
            </h3>
            <p className="text-xs text-stone-300 font-serif">
              Mỗi hạt bụi được lau sạch là một niệm phiền não được buông bỏ. Tâm kính ngưỡng Phật pháp sinh vô lượng thiện duyên.
            </p>

            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 font-serif italic">
              &ldquo;Bồ đề bản vô thụ, minh kính diệc phi đài; Bản lai vô nhất vật, hà xứ nhạ trần ai.&rdquo;
            </div>

            <div className="flex justify-center gap-4 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ✨ +60 Phước Báu
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                🍵 +25 Tâm Lực
              </span>
            </div>

            <button
              onClick={() => {
                onComplete(60, 25);
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
