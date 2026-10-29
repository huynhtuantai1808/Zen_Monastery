file_path = r"e:\a\game\src\App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
old_imports = """  Globe,
  Menu
} from 'lucide-react';
import { BUDDHIST_DHARMA_SESSIONS } from './data/buddhistDharma';
import { CharacterCreationModal } from './components/CharacterCreationModal';
import { ZenCharacterSprite } from './components/ZenCharacterSprite';
import { ZenOpenWorld } from './canvas/ZenOpenWorld';
import { soundEngine } from './services/audioEngine';
import type { CharacterAppearance, BuddhistDharmaSession, DharmaOption } from './types/game';"""

new_imports = """  Globe,
  Menu,
  ScrollText,
  Award
} from 'lucide-react';
import { BUDDHIST_DHARMA_SESSIONS } from './data/buddhistDharma';
import { CharacterCreationModal } from './components/CharacterCreationModal';
import { ZenCharacterSprite } from './components/ZenCharacterSprite';
import { ZenOpenWorld } from './canvas/ZenOpenWorld';
import { WoodChoppingModal } from './components/WoodChoppingModal';
import { WaterCarryingModal } from './components/WaterCarryingModal';
import { AltarCleaningModal } from './components/AltarCleaningModal';
import { CharityModal } from './components/CharityModal';
import { ZenQuestModal } from './components/ZenQuestModal';
import { ZEN_QUESTS, type ZenQuestItem } from './data/zenQuests';
import { soundEngine } from './services/audioEngine';
import type { CharacterAppearance, BuddhistDharmaSession, DharmaOption } from './types/game';"""

if old_imports in content:
    content = content.replace(old_imports, new_imports)
    print("Updated imports successfully!")
else:
    print("Could not find old_imports!")

# 2. Add Quests State
old_state_marker = "  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);"
new_state_additions = """  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);

  // Mindful Quests & Merit Milestones State
  const [questProgress, setQuestProgress] = useState<Record<string, { current: number; completed: boolean }>>({
    chop_wood: { current: 0, completed: false },
    carry_water: { current: 0, completed: false },
    clean_altar: { current: 0, completed: false },
    charity_food: { current: 0, completed: false },
    sweep_courtyard: { current: 0, completed: false },
    guest_tea: { current: 0, completed: false },
    dharma_meditate: { current: 0, completed: false },
    feed_koi: { current: 0, completed: false },
  });
  const [showQuestModal, setShowQuestModal] = useState<boolean>(false);
  const [activeQuestModal, setActiveQuestModal] = useState<ZenQuestItem['activityKey'] | null>(null);"""

if old_state_marker in content:
    content = content.replace(old_state_marker, new_state_additions)
    print("Added quest states successfully!")
else:
    print("Could not find old_state_marker!")

# 3. Add storage load/save for questProgress
old_storage_load = """        if (Array.isArray(data.unlockedQuotes)) setUnlockedQuotes(data.unlockedQuotes);
        if (typeof data.hasEnlightenmentBuff === 'boolean') setHasEnlightenmentBuff(data.hasEnlightenmentBuff);"""

new_storage_load = """        if (Array.isArray(data.unlockedQuotes)) setUnlockedQuotes(data.unlockedQuotes);
        if (typeof data.hasEnlightenmentBuff === 'boolean') setHasEnlightenmentBuff(data.hasEnlightenmentBuff);
        if (data.questProgress) setQuestProgress(data.questProgress);"""

if old_storage_load in content:
    content = content.replace(old_storage_load, new_storage_load)
    print("Updated storage load successfully!")

old_storage_save = """        unlockedQuotes,
        hasEnlightenmentBuff
      };"""

new_storage_save = """        unlockedQuotes,
        hasEnlightenmentBuff,
        questProgress
      };"""

if old_storage_save in content:
    content = content.replace(old_storage_save, new_storage_save)
    print("Updated storage save successfully!")

old_storage_deps = "}, [character, level, merit, stamina, focusBuff, unlockedQuotes, hasEnlightenmentBuff]);"
new_storage_deps = "}, [character, level, merit, stamina, focusBuff, unlockedQuotes, hasEnlightenmentBuff, questProgress]);"

if old_storage_deps in content:
    content = content.replace(old_storage_deps, new_storage_deps)
    print("Updated storage deps successfully!")

# 4. Quest completion helpers
quest_helpers = """
  // Hoàn thành nhiệm vụ công quả & cộng thưởng
  const handleCompleteQuestActivity = (activityKey: ZenQuestItem['activityKey'], meritBonus: number, staminaRestore: number) => {
    addMerit(meritBonus, 50, 40, '✨ Công Quả Viên Mãn ');
    setStamina((prev) => Math.min(100, prev + staminaRestore));

    const quest = ZEN_QUESTS.find((q) => q.activityKey === activityKey);
    if (quest) {
      setQuestProgress((prev) => ({
        ...prev,
        [quest.id]: { current: quest.targetCount, completed: true },
      }));
      spawnFloatingText(`📜 Hoàn Thành: ${quest.title}!`, 'text-amber-200 font-serif font-bold', 50, 35);
    }
    setActiveQuestModal(null);
  };

  const handleStartActivity = (key: ZenQuestItem['activityKey']) => {
    if (key === 'SWEEP') {
      setTimePhase('MORNING');
      setOpenWorldActivity('SWEEP');
    } else if (key === 'TEA') {
      setTimePhase('AFTERNOON');
      setOpenWorldActivity('TEA');
    } else if (key === 'DHARMA') {
      setTimePhase('EVENING');
      setOpenWorldActivity('DHARMA');
    } else if (key === 'FEED_KOI') {
      addMerit(20, 50, 40, '🪷 Phóng Sinh & Lòng Từ ');
      setQuestProgress((prev) => ({
        ...prev,
        feed_koi: { current: 1, completed: true },
      }));
      soundEngine.playWoodenFish();
    } else {
      setActiveQuestModal(key);
    }
  };
"""

marker_helpers = "  const spendStamina = useCallback((amount: number): boolean => {"
if marker_helpers in content:
    content = content.replace(marker_helpers, quest_helpers + "\n" + marker_helpers)
    print("Added quest helper functions successfully!")
else:
    print("Could not find marker_helpers!")

# 5. Top HUD Buttons (Desktop & Mobile Drawer)
completed_count_calc = "  const completedQuestsCount = Object.values(questProgress).filter((q) => q.completed).length;"
marker_render = "  const effectiveLevel = previewLevelOverride !== null ? previewLevelOverride : level;"
if marker_render in content:
    content = content.replace(marker_render, completed_count_calc + "\n" + marker_render)
    print("Added completedQuestsCount calc successfully!")

# Desktop Top HUD button next to Sổ Tay
old_journal_btn = """              {/* Sổ Tay */}
              <button
                onClick={() => setShowJournalModal(true)}"""

new_journal_btn = """              {/* Bảng Công Quả & Mốc Nhiệm Vụ */}
              <button
                onClick={() => setShowQuestModal(true)}
                title="Bảng Công Quả & Mốc Thiện Hạnh"
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 cursor-pointer transition flex items-center gap-1.5 text-xs font-serif font-bold shadow-sm"
              >
                <ScrollText className="w-4 h-4 text-amber-300" />
                <span>Công Quả</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-mono text-[9px] font-bold">
                  {completedQuestsCount}/8
                </span>
              </button>

              {/* Sổ Tay */}
              <button
                onClick={() => setShowJournalModal(true)}"""

if old_journal_btn in content:
    content = content.replace(old_journal_btn, new_journal_btn)
    print("Added Desktop Cong Qua button successfully!")
else:
    print("Could not find old_journal_btn!")

# Mobile Drawer button
old_drawer_end = """              {/* Nhân vật */}
              <button
                onClick={() => {
                  setShowCharModal(true);
                  setShowMobileDrawer(false);
                }}
                className="p-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs flex items-center justify-center gap-1 font-serif active:scale-95 transition"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Ngoại Hình</span>
              </button>
            </div>"""

new_drawer_end = """              {/* Nhân vật */}
              <button
                onClick={() => {
                  setShowCharModal(true);
                  setShowMobileDrawer(false);
                }}
                className="p-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-xs flex items-center justify-center gap-1 font-serif active:scale-95 transition"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Ngoại Hình</span>
              </button>

              {/* Bảng Công Quả & Mốc Thiện Hạnh (Mobile) */}
              <button
                onClick={() => {
                  setShowQuestModal(true);
                  setShowMobileDrawer(false);
                }}
                className="col-span-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-700/30 border border-amber-400/50 text-amber-200 text-xs flex items-center justify-center gap-2 font-serif font-bold active:scale-95 transition shadow-sm"
              >
                <ScrollText className="w-4 h-4 text-amber-300" />
                <span>Bảng Công Quả & Mốc Thiện Hạnh ({completedQuestsCount}/8)</span>
              </button>
            </div>"""

if old_drawer_end in content:
    content = content.replace(old_drawer_end, new_drawer_end)
    print("Added Mobile Drawer Cong Qua button successfully!")
else:
    print("Could not find old_drawer_end!")

# 6. Pass new props to ZenOpenWorld
old_zen_world_props = """            onOpenDharma={() => {
              setTimePhase('EVENING');
              setOpenWorldActivity('DHARMA');
            }}
            onOpenCharModal={() => setShowCharModal(true)}"""

new_zen_world_props = """            onOpenDharma={() => {
              setTimePhase('EVENING');
              setOpenWorldActivity('DHARMA');
            }}
            onOpenWoodChopping={() => setActiveQuestModal('CHOP_WOOD')}
            onOpenWaterCarrying={() => setActiveQuestModal('CARRY_WATER')}
            onOpenAltarCleaning={() => setActiveQuestModal('CLEAN_ALTAR')}
            onOpenCharity={() => setActiveQuestModal('CHARITY')}
            onOpenCharModal={() => setShowCharModal(true)}"""

if old_zen_world_props in content:
    content = content.replace(old_zen_world_props, new_zen_world_props)
    print("Updated ZenOpenWorld invocation props successfully!")
else:
    print("Could not find old_zen_world_props!")

# 7. Render new modals before closing </div>
modals_render = """
      {/* =========================================================
          4. CÁC MODAL CÔNG QUẢ & HOẠT ĐỘNG THIỆN TÂM
          ========================================================= */}

      {/* Modal Bảng Công Quả & Mốc Thành Tựu */}
      {showQuestModal && (
        <ZenQuestModal
          currentMerit={merit}
          questProgress={questProgress}
          onStartActivity={(actKey) => handleStartActivity(actKey)}
          onClaimQuestReward={(qId, mReward, sReward) => {
            addMerit(mReward, 50, 40, '✨ Nhận Phước Báu ');
            setStamina((prev) => Math.min(100, prev + sReward));
          }}
          onClose={() => setShowQuestModal(false)}
        />
      )}

      {/* Modal Chẻ Củi Nấu Cơm Chay */}
      {activeQuestModal === 'CHOP_WOOD' && (
        <WoodChoppingModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CHOP_WOOD', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStamina}
        />
      )}

      {/* Modal Gánh Nước Suối Lên Chùa */}
      {activeQuestModal === 'CARRY_WATER' && (
        <WaterCarryingModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CARRY_WATER', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStamina}
        />
      )}

      {/* Modal Lau Chùi Bàn Thờ Đức Phật */}
      {activeQuestModal === 'CLEAN_ALTAR' && (
        <AltarCleaningModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CLEAN_ALTAR', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStamina}
        />
      )}

      {/* Modal Hoạt Động Thiện Tâm & Cứu Tế */}
      {activeQuestModal === 'CHARITY' && (
        <CharityModal
          onComplete={(mBonus, sRestore) => handleCompleteQuestActivity('CHARITY', mBonus, sRestore)}
          onClose={() => setActiveQuestModal(null)}
          spendStamina={spendStamina}
        />
      )}
"""

marker_modals = "      {/* Modal Sổ Tay Tỉnh Thức */}"
if marker_modals in content:
    content = content.replace(marker_modals, modals_render + "\n" + marker_modals)
    print("Added quest modals render successfully!")
else:
    print("Could not find marker_modals!")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated App.tsx successfully!")
