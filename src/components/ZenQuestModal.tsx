import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles, Award, ScrollText, ArrowRight, ShieldCheck } from 'lucide-react';
import { ZEN_QUESTS, ZEN_MILESTONES, type ZenQuestItem } from '../data/zenQuests';


interface ZenQuestModalProps {
  currentMerit: number;
  questProgress: Record<string, { current: number; completed: boolean }>;
  onStartActivity: (activityKey: ZenQuestItem['activityKey']) => void;
  onClaimQuestReward: (questId: string, meritReward: number, staminaReward: number) => void;
  onClose: () => void;
}

export const ZenQuestModal: React.FC<ZenQuestModalProps> = ({
  currentMerit,
  questProgress,
  onStartActivity,
  onClaimQuestReward: _onClaim,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'DAILY' | 'MILESTONES'>('DAILY');

  const totalQuests = ZEN_QUESTS.length;
  const completedQuests = ZEN_QUESTS.filter((q) => questProgress[q.id]?.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stone-900 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col text-stone-100 max-h-[90vh] overflow-hidden">
        {/* Decorative Golden Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl text-amber-300">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-amber-200">
                  Bảng Công Quả & Thiện Hạnh
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono text-[10px] sm:text-xs">
                  {completedQuests}/{totalQuests} Hoàn Mãn
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 font-serif">
                &ldquo;Gánh nước chẻ củi, thảy đều là diệu đạo. Tâm bình thế giới bình.&rdquo;
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

        {/* Tabs */}
        <div className="flex gap-2 my-3 p-1 rounded-2xl bg-stone-950 border border-stone-800 text-xs font-serif">
          <button
            onClick={() => setActiveTab('DAILY')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'DAILY' ? 'bg-amber-600 text-stone-950 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Công Quả Hàng Ngày ({completedQuests}/{totalQuests})</span>
          </button>
          <button
            onClick={() => setActiveTab('MILESTONES')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'MILESTONES' ? 'bg-amber-600 text-stone-950 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mốc Thành Tựu Công Đức</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
          {activeTab === 'DAILY' ? (
            /* TAB 1: CÔNG QUẢ HÀNG NGÀY */
            ZEN_QUESTS.map((quest) => {
              const prog = questProgress[quest.id] || { current: 0, completed: false };
              const isDone = prog.completed;
              const percent = Math.min(100, Math.round((prog.current / quest.targetCount) * 100));

              return (
                <div
                  key={quest.id}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-800/40 opacity-80'
                      : 'bg-stone-950/80 border-stone-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-3xl shrink-0 p-1.5 rounded-xl bg-stone-900 border border-stone-800">
                      {quest.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs sm:text-sm text-stone-100">
                          {quest.title}
                        </span>
                        {isDone ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Đã Hoàn Thành
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400/90 font-mono">
                            {prog.current}/{quest.targetCount}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-400 font-serif mt-0.5 line-clamp-2">
                        {quest.desc}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-2 w-full max-w-xs h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isDone ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-800">
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-amber-300 flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> +{quest.rewardMerit}
                      </span>
                      <span className="text-teal-300">+{quest.rewardStamina}🍵</span>
                    </div>

                    {!isDone ? (
                      <button
                        onClick={() => {
                          onStartActivity(quest.activityKey);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-stone-950 text-xs font-serif font-bold shadow flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <span>Làm Ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-serif flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận phước
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            /* TAB 2: MỐC THÀNH TỰU CÔNG ĐỨC */
            ZEN_MILESTONES.map((milestone) => {
              const isUnlocked = currentMerit >= milestone.requiredMerit;
              const progressPct = Math.min(100, Math.round((currentMerit / milestone.requiredMerit) * 100));

              return (
                <div
                  key={milestone.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isUnlocked
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-md'
                      : 'bg-stone-950/60 border-stone-800 opacity-70'
                  }`}
                >
                  <span className="text-3xl shrink-0 p-2 rounded-2xl bg-stone-900 border border-stone-800">
                    {milestone.icon}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-amber-200">
                          {milestone.title}
                        </span>
                        {isUnlocked && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-serif flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Đã Đạt
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-amber-400">
                        {currentMerit}/{milestone.requiredMerit} Phước Báu
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 font-serif mt-1">
                      {milestone.desc}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isUnlocked ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-stone-600'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Rewards */}
                    <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-serif">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-700 text-amber-300">
                        Danh hiệu: <strong>{milestone.rewardTitle}</strong>
                      </span>
                      {milestone.rewardRobe && (
                        <span className="px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-700 text-teal-300">
                          Pháp phục: <strong>Áo {milestone.rewardRobe === 'lam' ? 'Lam' : milestone.rewardRobe === 'nau' ? 'Nâu Sồng' : milestone.rewardRobe === 'xam' ? 'Xám' : 'Bạch Y'}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 font-serif">
          <span>Công quả tích phước giúp khai mở tuệ giác và tâm bất biến.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition cursor-pointer font-serif"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
