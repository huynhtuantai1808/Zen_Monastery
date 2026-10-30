import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ChevronUp, ChevronDown, CheckCircle2, Sparkles, ScrollText } from 'lucide-react';

export const QuestBar: React.FC = () => {
  const { quests, setModal, changeZone, stats } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const completedCount = quests.filter((q) => q.completed).length;

  const handleQuestClick = (quest: (typeof quests)[0]) => {
    if (quest.completed) return;

    if (quest.zone !== stats.currentZone) {
      changeZone(quest.zone);
    }

    if (quest.type === 'sweep') {
      setModal('sweep');
    } else if (quest.type === 'tea') {
      setModal('tea');
    } else if (quest.type === 'meditate') {
      setModal('breathing');
    } else if (quest.type === 'listen') {
      setModal('guest');
    }
  };

  return (
    <div className="absolute bottom-3 left-4 right-4 md:left-6 md:right-auto md:w-96 z-30 pointer-events-auto">
      <div className="anime-glass-panel rounded-3xl overflow-hidden border border-pink-400/30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(244,114,182,0.5)]">
              <ScrollText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-black text-white text-xs md:text-sm tracking-wide block drop-shadow">
                Nhiệm Vụ Tu Tập
              </span>
              <span className="text-[10px] text-pink-300/80 font-bold">
                Tiến độ: {completedCount}/{quests.length} hoàn thành
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-purple-200/70 group-hover:text-pink-300 transition-colors">
              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
            </span>
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-purple-200">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
        </button>

        {/* Collapsible List */}
        {isExpanded && (
          <div className="p-3 pt-1 border-t border-white/10 flex flex-col gap-2 max-h-64 overflow-y-auto">
            {quests.map((q) => (
              <div
                key={q.id}
                onClick={() => handleQuestClick(q)}
                className={`p-2.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                  q.completed
                    ? 'bg-emerald-950/25 border-emerald-500/30 text-purple-200/50 opacity-60'
                    : 'bg-purple-950/40 border-pink-400/25 hover:bg-purple-900/50 hover:border-pink-300 hover:shadow-[0_0_16px_rgba(244,114,182,0.25)] text-purple-100 hover:translate-x-1'
                }`}
              >
                <div className="mt-0.5">
                  {q.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-pink-400/70 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-heading font-bold text-xs truncate text-white">
                      {q.title}
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 shadow-[0_0_8px_rgba(251,191,36,0.2)]">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" /> +{q.rewardCongDuc}
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-200/70 font-sans line-clamp-1 mt-0.5">
                    {q.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
