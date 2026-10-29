file_path = r"e:\a\game\src\App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import Zen3DWorld
old_import = "import { ZenOpenWorld } from './canvas/ZenOpenWorld';"
new_import = """import { ZenOpenWorld } from './canvas/ZenOpenWorld';
import { Zen3DWorld } from './canvas/Zen3DWorld';"""

if old_import in content:
    content = content.replace(old_import, new_import)
    print("Added Zen3DWorld import successfully.")

# 2. Update worldMode state
old_mode = "const [worldMode, setWorldMode] = useState<'OPEN_WORLD' | 'FOCUS'>('OPEN_WORLD');"
new_mode = "const [worldMode, setWorldMode] = useState<'3D' | 'OPEN_WORLD' | 'FOCUS'>('3D');"

if old_mode in content:
    content = content.replace(old_mode, new_mode)
    print("Updated worldMode state successfully.")

# 3. Update worldMode toggle button in Header
old_btn = """            {/* Chuyển Chế Độ: Thế Giới Mở 2D / Cảnh Thiền Tĩnh */}
            <button
              onClick={() => {
                setWorldMode((prev) => (prev === 'OPEN_WORLD' ? 'FOCUS' : 'OPEN_WORLD'));
                soundEngine.playWoodenFish();
              }}
              title="Chuyển đổi giữa Thế Giới Mở 2D và Cảnh Thiền Cố Định"
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border font-serif text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 cursor-pointer transition shadow-md ${
                worldMode === 'OPEN_WORLD'
                  ? 'bg-emerald-600/35 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/40'
                  : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold hidden sm:inline">
                {worldMode === 'OPEN_WORLD' ? 'Thế Giới Mở' : 'Góc Nhìn Tĩnh'}
              </span>
            </button>"""

new_btn = """            {/* Chuyển Chế Độ: 3D Sơn Tự / Thế Giới Mở 2D / Cảnh Thiền Tĩnh */}
            <button
              onClick={() => {
                setWorldMode((prev) => (prev === '3D' ? 'OPEN_WORLD' : prev === 'OPEN_WORLD' ? 'FOCUS' : '3D'));
                soundEngine.playWoodenFish();
              }}
              title="Chuyển đổi giữa 3D Sơn Tự ↔ 2D Thế Giới Mở ↔ Cảnh Thiền Tĩnh"
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border font-serif text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 cursor-pointer transition shadow-md ${
                worldMode === '3D'
                  ? 'bg-amber-500/30 border-amber-400 text-yellow-200 ring-1 ring-amber-400/50'
                  : worldMode === 'OPEN_WORLD'
                  ? 'bg-emerald-600/35 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/40'
                  : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">
                {worldMode === '3D' ? '🏰 3D Sơn Tự' : worldMode === 'OPEN_WORLD' ? '🗺️ 2D Cuộn Cảnh' : '🧘 Góc Nhìn Tĩnh'}
              </span>
            </button>"""

if old_btn in content:
    content = content.replace(old_btn, new_btn)
    print("Updated worldMode toggle button successfully.")

# 4. Render Zen3DWorld when worldMode === '3D'
old_main = """      {/* =========================================================
          2. NỘI DUNG CHÍNH: THẾ GIỚI MỞ 2D HOẶC GÓC NHÌN TĨNH
          ========================================================= */}
      {worldMode === 'OPEN_WORLD' ? ("""

new_main = """      {/* =========================================================
          2. NỘI DUNG CHÍNH: 3D SƠN TỰ / THẾ GIỚI MỞ 2D / GÓC NHÌN TĨNH
          ========================================================= */}
      {worldMode === '3D' ? (
        <main className="relative flex-1 w-full h-full overflow-hidden">
          <Zen3DWorld
            character={character}
            level={effectiveLevel}
            timePhase={timePhase}
            isRaining={isRaining}
            onOpenSweeping={() => {
              setTimePhase('MORNING');
              setOpenWorldActivity('SWEEP');
            }}
            onOpenTeaHouse={() => {
              setTimePhase('AFTERNOON');
              setOpenWorldActivity('TEA');
            }}
            onOpenDharma={() => {
              setTimePhase('EVENING');
              setOpenWorldActivity('DHARMA');
            }}
            onOpenWoodChopping={() => setActiveQuestModal('CHOP_WOOD')}
            onOpenWaterCarrying={() => setActiveQuestModal('CARRY_WATER')}
            onOpenAltarCleaning={() => setActiveQuestModal('CLEAN_ALTAR')}
            onOpenCharity={() => setActiveQuestModal('CHARITY')}
            onAddMerit={(amount, x, y, label) => addMerit(amount, x, y, label)}
            spendStamina={spendStamina}
          />
        </main>
      ) : worldMode === 'OPEN_WORLD' ? ("""

if old_main in content:
    content = content.replace(old_main, new_main)
    print("Updated main content rendering with 3D successfully.")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated App.tsx successfully.")
