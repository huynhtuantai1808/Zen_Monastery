import React, { useState, useEffect } from 'react';
import { Sparkles, Award, ChevronRight, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ZenCharacterSprite } from './ZenCharacterSprite';
import { BUDDHIST_DHARMA_SESSIONS } from '../data/buddhistDharma';
import { soundEngine } from '../services/audioEngine';
import type { BuddhistDharmaSession, DharmaOption } from '../types/game';

const INITIAL_THOUGHT_BUBBLES = [
  { id: 't1', label: 'Deadline dồn dập!', x: 22, y: 30 },
  { id: 't2', label: 'Thông báo tin nhắn...', x: 75, y: 25 },
  { id: 't3', label: 'So sánh bản thân', x: 28, y: 68 },
  { id: 't4', label: 'Cơm áo gạo tiền', x: 72, y: 65 },
];

interface DharmaEveningModalProps {
  isOpen: boolean;
  onClose: () => void;
  isModal?: boolean;
  onAddMerit: (amount: number, x: number, y: number, label?: string) => void;
  spendStamina: (amount: number) => boolean;
  onOpenCharModal: () => void;
  onNewDay?: () => void;
}

export const DharmaEveningModal: React.FC<DharmaEveningModalProps> = ({
  isOpen,
  onClose,
  isModal = true,
  onAddMerit,
  spendStamina,
  onOpenCharModal,
  onNewDay,
}) => {
  const { stats, addUnlockedQuote, activateTamSangBuff } = useGameStore();
  const character = stats.character;

  const [eveningStep, setEveningStep] = useState<'BREATH' | 'DHARMA'>('BREATH');
  const [thoughtBubbles, setThoughtBubbles] = useState(INITIAL_THOUGHT_BUBBLES);
  const [isHoldingBreath, setIsHoldingBreath] = useState<boolean>(false);
  const [breathProgress, setBreathProgress] = useState<number>(0);
  const [dharmaIndex, setDharmaIndex] = useState<number>(0);
  const [dharmaResult, setDharmaResult] = useState<DharmaOption | null>(null);

  // Breathing effect timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isHoldingBreath) {
      interval = setInterval(() => {
        setBreathProgress((prev) => {
          if (prev >= 100) {
            soundEngine.playSingingBowl();
            setThoughtBubbles((bubbles) => {
              if (bubbles.length > 0) {
                return bubbles.slice(1);
              }
              return bubbles;
            });
            onAddMerit(20, 50, 40, '🪷 Xua tan tạp niệm ');
            return 0;
          }
          return prev + 5;
        });
      }, 100);
    } else {
      setBreathProgress(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHoldingBreath, onAddMerit]);

  if (!isOpen) return null;

  const currentDharmaSession: BuddhistDharmaSession = BUDDHIST_DHARMA_SESSIONS[dharmaIndex % BUDDHIST_DHARMA_SESSIONS.length];

  const handleAnswerDharma = (option: DharmaOption) => {
    if (!spendStamina(10)) {
      soundEngine.playWarning();
      return;
    }

    setDharmaResult(option);
    if (option.isCorrect) {
      soundEngine.playBell(639, 3.5);
      activateTamSangBuff();
      onAddMerit(60, 50, 35, '🪷 ĐỐN NGỘ! ');
      if (option.quoteCollected) {
        addUnlockedQuote(option.quoteCollected);
      }
    } else {
      soundEngine.playBell(396, 1.5);
      onAddMerit(20, 50, 35, '🙏 Tâm thành lắng nghe ');
    }
  };

  return (
    <div className={`relative z-10 w-full h-full flex items-center justify-center ${isModal ? 'p-1' : 'pt-20 pb-6 px-4'}`}>
      <div className="max-w-3xl w-full bg-slate-950/90 backdrop-blur-xl border border-indigo-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        {/* Header Khóa Lễ Tối */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-200 font-serif font-bold text-base sm:text-lg">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Khóa Lễ Tối Tại Chánh Điện: Thính Pháp & Vấn Đáp Ngộ Đạo</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEveningStep('BREATH');
                setThoughtBubbles(INITIAL_THOUGHT_BUBBLES);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-medium transition cursor-pointer ${
                eveningStep === 'BREATH' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Hơi Thở
            </button>
            <button
              onClick={() => setEveningStep('DHARMA')}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-medium transition cursor-pointer ${
                eveningStep === 'DHARMA' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Nghe Pháp
            </button>
            {isModal && (
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* BƯỚC 1: HƠI THỞ HOA SEN */}
        {eveningStep === 'BREATH' && (
          <div className="relative py-8 flex flex-col items-center justify-center">
            {/* Floating distraction bubbles */}
            {thoughtBubbles.map((b) => (
              <div
                key={b.id}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-rose-950/85 border border-rose-400/50 text-rose-200 text-xs shadow-lg animate-pulse font-serif"
              >
                💭 {b.label}
              </div>
            ))}

            {/* Nhân vật cư sĩ tọa thiền kiết già an nhiên */}
            <div className="mb-2">
              <ZenCharacterSprite
                character={character}
                pose="meditating"
                isBreathingAnim={isHoldingBreath}
                subtitle="Tọa thiền kiết già quán niệm hơi thở"
                onClick={onOpenCharModal}
              />
            </div>

            <button
              onMouseDown={() => setIsHoldingBreath(true)}
              onMouseUp={() => setIsHoldingBreath(false)}
              onMouseLeave={() => setIsHoldingBreath(false)}
              onTouchStart={() => setIsHoldingBreath(true)}
              onTouchEnd={() => setIsHoldingBreath(false)}
              className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500 cursor-pointer shadow-2xl ${
                isHoldingBreath
                  ? 'scale-110 bg-amber-500/30 border-amber-300 shadow-amber-500/40'
                  : 'scale-100 bg-indigo-950/80 border-indigo-400/60 hover:border-amber-300'
              }`}
            >
              <span className="text-4xl mb-1">🪷</span>
              <span className="text-xs font-bold text-amber-200 font-serif">
                {isHoldingBreath ? 'Đang Hít Sâu...' : 'Nhấn Giữ Để Thở'}
              </span>
              <span className="text-[11px] text-indigo-200 mt-0.5 font-mono">{breathProgress}%</span>
            </button>

            <p className="text-xs text-slate-300 mt-4 text-center max-w-md font-serif">
              Còn <strong>{thoughtBubbles.length} Tạp Niệm</strong>. Nhấn giữ vòng hoa sen để hít thở sâu, làm tan biến muộn phiền trước khi bước vào thính pháp.
            </p>
          </div>
        )}

        {/* BƯỚC 2: BÀI GIẢNG PHẬT GIÁO CHÍNH THỐNG */}
        {eveningStep === 'DHARMA' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-serif">
                  📖 {currentDharmaSession.sutraName} • {currentDharmaSession.paliName}
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100 mt-1">
                  {currentDharmaSession.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setDharmaResult(null);
                  setDharmaIndex((prev) => (prev + 1) % BUDDHIST_DHARMA_SESSIONS.length);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 font-serif cursor-pointer"
              >
                Đổi bài kinh khác
              </button>
            </div>

            {/* Nhân vật cư sĩ lắng tâm thính pháp */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-16 h-16 flex items-center justify-center shrink-0">
                <ZenCharacterSprite
                  character={character}
                  pose="meditating"
                  showNameTag={false}
                  scale={0.55}
                />
              </div>
              <div>
                <div className="text-xs text-amber-200 font-serif font-bold">{character.name} lắng tâm thính pháp</div>
                <div className="text-[10px] text-slate-400 font-serif">Nghe chuông phiền não tan mây khói, ý lặng thân an miệng mỉm cười</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 font-serif leading-relaxed italic whitespace-pre-line">
              &ldquo;{currentDharmaSession.story}&rdquo;
            </div>

            <div className="text-xs sm:text-sm font-semibold text-amber-300 font-serif">
              Câu hỏi Ngộ Đạo: {currentDharmaSession.question}
            </div>

            {!dharmaResult ? (
              <div className="space-y-2">
                {currentDharmaSession.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerDharma(opt)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/90 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400 text-xs text-slate-100 transition flex items-center justify-between cursor-pointer font-serif"
                  >
                    <span>{opt.text}</span>
                    <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  dharmaResult.isCorrect
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                    : 'bg-slate-800 border-slate-600 text-slate-200'
                }`}
              >
                <div className="font-bold text-sm flex items-center gap-1.5 font-serif">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>{dharmaResult.feedback}</span>
                </div>
                {dharmaResult.quoteCollected && (
                  <div className="italic text-amber-200 bg-slate-950/60 p-2 rounded-lg font-serif">
                    📜 Đã lưu câu kệ vào Sổ Tay Tỉnh Thức: &ldquo;{dharmaResult.quoteCollected}&rdquo;
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setDharmaResult(null);
                      if (onNewDay) onNewDay();
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-serif cursor-pointer"
                  >
                    Bắt đầu ngày mới với Buff Tâm Sáng ☀️
                  </button>
                  <button
                    onClick={() => setDharmaResult(null)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-serif cursor-pointer"
                  >
                    Thử lại câu hỏi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
