import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ChevronUp, ChevronDown, CheckCircle2, Circle, Sparkles, ScrollText } from 'lucide-react';

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
      <div className="zen-glass-panel rounded-2xl overflow-hidden border border-amber-600/30 transition-all duration-300">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-amber-400" />
            <span className="font-heading font-bold text-amber-200 text-xs md:text-sm tracking-wide">
              Công Việc Tích Phước ({completedCount}/{quests.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-serif text-stone-400">
              {isExpanded ? 'Thu gọn' : 'Chi tiết'}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            )}
          </div>
        </button>

        {/* Collapsible List */}
        {isExpanded && (
          <div className="p-3 pt-1 border-t border-white/10 flex flex-col gap-2 max-h-60 overflow-y-auto">
            {quests.map((q) => (
              <div
                key={q.id}
                onClick={() => handleQuestClick(q)}
                className={`p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  q.completed
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-stone-400 opacity-60'
                    : 'bg-stone-900/60 border-amber-700/30 hover:bg-stone-800/80 hover:border-amber-500/50 text-stone-200'
                }`}
              >
                <div className="mt-0.5">
                  {q.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-amber-500/60 flex-shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-serif font-bold text-xs truncate">
                      {q.title}
                    </span>
                    <span className="text-[10px] text-amber-400 font-sans flex items-center gap-0.5 flex-shrink-0">
                      <Sparkles className="w-2.5 h-2.5" /> +{q.rewardCongDuc}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 font-serif line-clamp-1 mt-0.5">
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
