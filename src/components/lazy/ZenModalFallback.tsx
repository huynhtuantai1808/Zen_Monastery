import React from 'react';

interface ZenModalFallbackProps {
  message?: string;
}

export const ZenModalFallback: React.FC<ZenModalFallbackProps> = ({
  message = 'Đang khai mở chánh niệm...',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-[28px] bg-gradient-to-b from-purple-900/40 to-slate-950/80 border border-pink-400/40 shadow-2xl max-w-xs w-full text-center">
        {/* Animated Lotus Halo Ring */}
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-pink-400/30 border-t-pink-300 animate-spin" />
          <div className="absolute inset-2 rounded-full border border-amber-300/40 border-b-amber-200 animate-spin [animation-duration:3s] [animation-direction:reverse]" />
          <span className="text-2xl animate-pulse select-none">🪷</span>
        </div>

        {/* Text */}
        <h4 className="font-heading font-bold text-sm sm:text-base text-pink-200 tracking-wide drop-shadow">
          {message}
        </h4>
        <p className="text-[11px] text-pink-300/70 mt-1 font-body">
          Vui lòng đợi giây lát trong tĩnh lặng
        </p>
      </div>
    </div>
  );
};

