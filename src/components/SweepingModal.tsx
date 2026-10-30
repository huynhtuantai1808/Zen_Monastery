import React, { useState, useRef } from 'react';
import { Feather, AlertCircle, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ZenCharacterSprite } from './ZenCharacterSprite';
import { soundEngine } from '../services/audioEngine';

interface Leaf {
  id: number;
  x: number;
  y: number;
  rot: number;
  scale: number;
}

interface SweepingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isModal?: boolean;
  onAddMerit: (amount: number, x: number, y: number, label?: string) => void;
  spendStamina: (amount: number) => boolean;
  onOpenCharModal: () => void;
}

export const SweepingModal: React.FC<SweepingModalProps> = ({
  isOpen,
  onClose,
  isModal = true,
  onAddMerit,
  spendStamina,
  onOpenCharModal,
}) => {
  const { stats } = useGameStore();
  const character = stats.character;
  const level = stats.level;

  const [leaves, setLeaves] = useState<Leaf[]>([
    { id: 1, x: 25, y: 72, rot: 15, scale: 1 },
    { id: 2, x: 42, y: 78, rot: -35, scale: 0.9 },
    { id: 3, x: 58, y: 70, rot: 45, scale: 1.1 },
    { id: 4, x: 73, y: 76, rot: -15, scale: 0.95 },
    { id: 5, x: 35, y: 83, rot: 25, scale: 1 },
    { id: 6, x: 64, y: 82, rot: -40, scale: 0.85 },
  ]);
  const [rushMeter, setRushMeter] = useState<number>(0);
  const [rushWarning, setRushWarning] = useState<boolean>(false);
  const [calmCombo, setCalmCombo] = useState<number>(0);
  const [isSweepingAnim, setIsSweepingAnim] = useState<boolean>(false);
  const lastSweepTimeRef = useRef<number>(0);

  if (!isOpen) return null;

  const handleSweepLeaf = (leaf: Leaf, e: React.MouseEvent) => {
    const now = Date.now();
    const interval = now - lastSweepTimeRef.current;
    lastSweepTimeRef.current = now;

    if (!spendStamina(5)) {
      soundEngine.playWarning();
      return;
    }

    setIsSweepingAnim(true);
    setTimeout(() => setIsSweepingAnim(false), 500);

    const clientX = e.clientX || window.innerWidth / 2;
    const clientY = e.clientY || window.innerHeight / 2;

    if (interval < 400 && lastSweepTimeRef.current !== 0) {
      soundEngine.playAntiRushStumble();
      setRushMeter((prev) => Math.min(100, prev + 35));
      setRushWarning(true);
      setCalmCombo(0);
      onAddMerit(5, clientX, clientY, '💨 Vội vã... ');

      setTimeout(() => {
        setLeaves((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: Math.max(15, Math.min(85, Math.random() * 80 + 10)),
            y: Math.max(65, Math.min(88, Math.random() * 25 + 65)),
            rot: Math.random() * 90 - 45,
            scale: 0.9,
          },
        ]);
      }, 300);

      setTimeout(() => setRushWarning(false), 2500);
      return;
    }

    soundEngine.playBroomSweep();
    setRushMeter((prev) => Math.max(0, prev - 15));
    setCalmCombo((prev) => prev + 1);

    const bonus = Math.min(15, calmCombo * 2);
    onAddMerit(15 + bonus, clientX, clientY, calmCombo > 2 ? `✨ Điềm tĩnh +${15 + bonus}` : undefined);

    setLeaves((prev) => prev.filter((l) => l.id !== leaf.id));

    setTimeout(() => {
      setLeaves((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.max(15, Math.min(85, Math.random() * 80 + 10)),
          y: Math.max(65, Math.min(88, Math.random() * 25 + 65)),
          rot: Math.random() * 90 - 45,
          scale: 0.85 + Math.random() * 0.3,
        },
      ]);
    }, 1800);
  };

  return (
    <div className={`relative z-10 w-full h-full flex flex-col justify-between ${isModal ? 'p-2' : 'pt-24 pb-6 px-6'}`}>
      {/* Header bar when shown in modal */}
      {isModal && (
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2 text-amber-200 font-serif font-bold text-sm">
            <Feather className="w-4 h-4 text-amber-400" />
            <span>Quét Lá Đa Chánh Niệm</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Thanh Anti-Rush Floating Bar */}
      <div className="max-w-md mx-auto w-full bg-stone-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/40 shadow-xl flex items-center justify-between gap-3 mt-2">
        <div>
          <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-xs sm:text-sm">
            <Feather className="w-4 h-4 text-amber-400" />
            <span>Quét Lá Đa: Điềm tĩnh từng nhịp thở</span>
          </div>
          <div className="text-[11px] text-stone-300 font-serif">
            Bấm vội vã &lt; 400ms sẽ sinh tạp niệm, gió thổi tung lá!
          </div>
        </div>

        {/* Meter */}
        <div className="w-28 sm:w-36">
          <div className="flex justify-between text-[10px] mb-1 font-serif">
            <span className="text-stone-400">Nhịp Tâm:</span>
            <span className={rushMeter > 60 ? 'text-rose-400 font-bold' : 'text-emerald-300'}>
              {rushMeter > 60 ? 'Vội vã!' : `Combo ${calmCombo}`}
            </span>
          </div>
          <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${rushMeter > 60 ? 'bg-rose-500' : 'bg-emerald-400'}`}
              style={{ width: `${rushMeter}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cảnh báo vội vã */}
      {rushWarning && (
        <div className="max-w-md mx-auto w-full p-3 bg-rose-950/90 border border-rose-400/50 rounded-2xl flex items-center gap-3 text-rose-200 text-xs animate-shake shadow-lg font-serif mt-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>TÂM ĐANG VỘI VÃ! Hãy thở một hơi thật sâu, đừng chạy theo kết quả...</span>
        </div>
      )}

      {/* Nhân vật cư sĩ đứng quét giữa sân */}
      <div className={`flex flex-col items-center z-20 pointer-events-auto ${isModal ? 'my-3' : 'absolute left-1/2 bottom-8 -translate-x-1/2'}`}>
        <ZenCharacterSprite
          character={character}
          pose="sweeping"
          isSweepingAnim={isSweepingAnim}
          subtitle={`Cấp ${level} • ${stats.title}`}
          onClick={onOpenCharModal}
        />
      </div>

      {/* Các chiếc lá trên sân */}
      <div className={`relative w-full ${isModal ? 'h-52 bg-stone-900/60 rounded-2xl border border-stone-800' : 'h-full'} pointer-events-auto overflow-hidden`}>
        {leaves.map((leaf) => (
          <button
            key={leaf.id}
            onClick={(e) => handleSweepLeaf(leaf, e)}
            style={{
              left: `${leaf.x}%`,
              top: `${leaf.y}%`,
              transform: `translate(-50%, -50%) rotate(${leaf.rot}deg) scale(${leaf.scale})`,
            }}
            className="absolute p-4 rounded-full hover:scale-135 active:scale-75 transition-all duration-300 cursor-pointer focus:outline-none"
            title="Chạm nhẹ để quét lá"
          >
            <span className="text-4xl sm:text-5xl drop-shadow-md">🍂</span>
          </button>
        ))}
      </div>
    </div>
  );
};

