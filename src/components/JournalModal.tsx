import React from 'react';
import { useGameStore } from '../store/gameStore';
import { soundEngine } from '../services/audioEngine';
import { X, BookOpen, Sparkles, Feather } from 'lucide-react';

export const JournalModal: React.FC = () => {
  const { setModal, journal } = useGameStore();

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'phap_thoai':
        return <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-heading font-black border border-pink-300">🌸 Pháp Thoại</span>;
      case 'tam_canh':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-heading font-black border border-emerald-300">🌿 Tâm Cảnh</span>;
      case 'triet_ly':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-heading font-black border border-purple-300">💫 Triết Lý</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl">
      <div className="anime-paper-panel max-w-3xl w-full rounded-[32px] p-6 md:p-8 relative flex flex-col border-2 border-pink-400/40 shadow-[0_20px_60px_rgba(244,114,182,0.25)] max-h-[88vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setModal(null)}
          className="absolute top-5 right-5 text-purple-900/50 hover:text-pink-600 p-2.5 rounded-full hover:bg-pink-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-purple-200/60 pb-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl shadow-[0_4px_16px_rgba(244,114,182,0.4)] text-white border border-white/50">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading text-xl md:text-2xl text-purple-950 font-black">
              Sổ Tay Tỉnh Thức • Anime Journal
            </h2>
            <p className="text-xs text-purple-800/80 font-sans font-semibold">
              Bộ sưu tập những câu pháp ngữ và sự ngộ đạo tích lũy qua chuỗi ngày tu tập.
            </p>
          </div>
        </div>

        {/* Scrollable Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          {journal.map((entry) => (
            <div
              key={entry.id}
              onClick={() => soundEngine.playWindChime()}
              className="p-5 rounded-2xl bg-white/80 border-2 border-purple-100 shadow-sm flex flex-col justify-between hover:bg-pink-50/70 hover:border-pink-300 transition-all hover:scale-[1.01] hover:shadow-[0_8px_20px_rgba(244,114,182,0.2)] cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {getCategoryBadge(entry.category)}
                  <span className="text-[11px] text-purple-700/70 font-sans font-bold">{entry.unlockedAt}</span>
                </div>

                <h3 className="font-heading font-black text-base text-purple-950 group-hover:text-pink-600 transition-colors flex items-center gap-2">
                  <Feather className="w-4 h-4 text-pink-500" />
                  {entry.title}
                </h3>

                <blockquote className="my-2.5 pl-3 border-l-2 border-pink-400 text-purple-900 font-serif text-sm italic leading-relaxed">
                  "{entry.quote}"
                </blockquote>

                <p className="text-xs text-purple-800/80 font-sans font-medium leading-normal mt-1">
                  {entry.meaning}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-[11px] text-pink-600 font-heading font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  Tranh Thủy Mặc Đã Mở Khóa
                </span>
                <span className="text-purple-400">#ThiềnMôn</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-purple-200/60 flex items-center justify-between text-xs text-purple-900/80 font-sans font-bold">
          <span>Tổng số pháp thoại: <strong className="text-pink-600 font-black">{journal.length}</strong></span>
          <span className="text-pink-600 font-semibold italic">🌸 Sưu tầm đủ bộ để mở khóa Đèn Lồng Hoa Sen!</span>
        </div>
      </div>
    </div>
  );
};
