import React from 'react';
import { useGameStore } from '../store/gameStore';
import { soundEngine } from '../services/audioEngine';
import { X, BookOpen, Sparkles, Feather } from 'lucide-react';

export const JournalModal: React.FC = () => {
  const { setModal, journal } = useGameStore();

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'phap_thoai':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">Pháp Thoại</span>;
      case 'tam_canh':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">Tâm Cảnh</span>;
      case 'triet_ly':
        return <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-300">Triết Lý</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="zen-paper-panel max-w-3xl w-full rounded-3xl p-6 md:p-8 relative flex flex-col border border-amber-500/50 shadow-2xl max-h-[88vh] overflow-hidden">
        {/* Close */}
        <button
          onClick={() => setModal(null)}
          className="absolute top-5 right-5 text-stone-500 hover:text-stone-800 p-2 rounded-full cursor-pointer z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-amber-900/15 pb-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-200/80 flex items-center justify-center text-2xl shadow-sm text-amber-900 border border-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading text-xl md:text-2xl text-stone-900 font-bold">
              Sổ Tay Tỉnh Thức
            </h2>
            <p className="text-xs text-stone-600 font-serif">
              Bộ sưu tập những câu pháp ngữ, tranh thủy mặc và sự ngộ đạo tích lũy qua chuỗi ngày tu tập.
            </p>
          </div>
        </div>

        {/* Scrollable Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          {journal.map((entry) => (
            <div
              key={entry.id}
              onClick={() => soundEngine.playWindChime()}
              className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300/80 shadow-sm flex flex-col justify-between hover:bg-amber-100/80 transition-all hover:scale-[1.01] cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {getCategoryBadge(entry.category)}
                  <span className="text-[11px] text-stone-500 font-serif">{entry.unlockedAt}</span>
                </div>

                <h3 className="font-heading font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors flex items-center gap-2">
                  <Feather className="w-4 h-4 text-amber-600" />
                  {entry.title}
                </h3>

                <blockquote className="my-2.5 pl-3 border-l-2 border-amber-500 text-stone-800 font-serif text-sm italic leading-relaxed">
                  "{entry.quote}"
                </blockquote>

                <p className="text-xs text-stone-600 font-serif leading-normal mt-1">
                  {entry.meaning}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-800 font-serif font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Tranh Thủy Mặc Đã Mở Khóa
                </span>
                <span className="text-stone-400">#ThiềnMôn</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-amber-900/15 flex items-center justify-between text-xs text-stone-600 font-serif">
          <span>Tổng số câu pháp thoại sưu tầm: <strong className="text-amber-800">{journal.length}</strong></span>
          <span className="text-amber-700 italic">Sưu tầm đủ bộ sẽ đổi được Đèn Lồng Hoa Sen trang trí chùa!</span>
        </div>
      </div>
    </div>
  );
};
