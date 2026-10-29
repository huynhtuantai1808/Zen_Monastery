import React from 'react';
import { useGameStore } from '../store/gameStore';
import { AlertCircle } from 'lucide-react';

export const AntiRushBanner: React.FC = () => {
  const { antiRushAlert } = useGameStore();

  if (!antiRushAlert) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[90%] pointer-events-none animate-bounce">
      <div className="px-5 py-3.5 rounded-2xl bg-amber-950/95 text-amber-100 border-2 border-amber-400 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-400/40 text-lg">
          <AlertCircle className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-serif font-bold text-amber-400 uppercase tracking-wider">
            Cơ Chế Không Vội Vã (Anti-Rush)
          </div>
          <div className="text-xs md:text-sm font-serif text-amber-50 font-medium leading-snug">
            {antiRushAlert}
          </div>
        </div>
      </div>
    </div>
  );
};
