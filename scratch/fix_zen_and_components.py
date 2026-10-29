import re

# ==========================================
# 1. FIX App.tsx
# ==========================================
app_file = r"e:\a\game\src\App.tsx"
with open(app_file, "r", encoding="utf-8") as f:
    app_content = f.read()

# Fix duplicate Award import
app_content = app_content.replace(
    "  Globe,\n  Menu,\n  ScrollText,\n  Award\n} from 'lucide-react';",
    "  Globe,\n  Menu,\n  ScrollText\n} from 'lucide-react';"
)
app_content = app_content.replace(
    "  Globe,\r\n  Menu,\r\n  ScrollText,\r\n  Award\r\n} from 'lucide-react';",
    "  Globe,\r\n  Menu,\r\n  ScrollText\r\n} from 'lucide-react';"
)

# Fix qId unused parameter
app_content = app_content.replace(
    "onClaimQuestReward={(qId, mReward, sReward) => {",
    "onClaimQuestReward={(_qId, mReward, sReward) => {"
)

with open(app_file, "w", encoding="utf-8") as f:
    f.write(app_content)

print("Fixed App.tsx successfully.")

# ==========================================
# 2. FIX ZenOpenWorld.tsx
# ==========================================
zen_file = r"e:\a\game\src\canvas\ZenOpenWorld.tsx"
with open(zen_file, "r", encoding="utf-8") as f:
    zen_content = f.read()

# Find the mistakenly inserted block in render()
bad_start = "      // Zone 1b: Bếp Hương Tích & Bãi Chẻ Củi\n      drawKitchenWoodZone(ctx, stepCount);\n\n      \n// Zone 1b: Bếp Hương Tích & Bãi Chẻ Củi (x: 340)"
bad_end = "// Zone 2: Sân Chùa & Gác Chuông & Cây Đa\n      drawBellCourtyardZone(ctx, stepCount, bellRipples);"

idx_start = zen_content.find("      // Zone 1: Cổng Tam Quan & Rừng Trúc\n      drawBambooGateZone(ctx, stepCount);")
if idx_start == -1:
    idx_start = zen_content.find("      // Zone 1: Cổng Tam Quan & Rừng Trúc\r\n      drawBambooGateZone(ctx, stepCount);")

idx_end = zen_content.find("      // Zone 5: Chánh Điện Trang Nghiêm & Tàng Kinh Các (kèm Bàn Thờ Phật x: 2360)\n      drawSanctuaryZone(ctx, stepCount);")
if idx_end == -1:
    idx_end = zen_content.find("      // Zone 5: Chánh Điện Trang Nghiêm & Tàng Kinh Các (kèm Bàn Thờ Phật x: 2360)\r\n      drawSanctuaryZone(ctx, stepCount);")

if idx_end != -1:
    idx_end += len("      // Zone 5: Chánh Điện Trang Nghiêm & Tàng Kinh Các (kèm Bàn Thờ Phật x: 2360)\n      drawSanctuaryZone(ctx, stepCount);")

proper_render_block = """      // Zone 1: Cổng Tam Quan & Rừng Trúc
      drawBambooGateZone(ctx, stepCount);

      // Zone 1b: Bếp Hương Tích & Bãi Chẻ Củi
      drawKitchenWoodZone(ctx, stepCount);

      // Zone 2: Sân Chùa & Gác Chuông & Cây Đa
      drawBellCourtyardZone(ctx, stepCount, bellRipples);

      // Zone 2b: Giếng Tiên & Lu Nước Đại Chúng
      drawWaterWellZone(ctx, stepCount);

      // Zone 3: Hiên Trà & Ống Tre Nước Shishi-odoshi
      drawTeaGardenZone(ctx, stepCount, bambooDropAngle);

      // Zone 3b: Hiên Cơm Chay Từ Thiện
      drawCharityStandZone(ctx, stepCount);

      // Zone 4: Cầu Gỗ & Hồ Sen & Đàn Cá Koi
      drawLotusPondZone(ctx, stepCount);

      // Zone 5: Chánh Điện Trang Nghiêm & Tàng Kinh Các
      drawSanctuaryZone(ctx, stepCount);"""

if idx_start != -1 and idx_end != -1:
    zen_content = zen_content[:idx_start] + proper_render_block + zen_content[idx_end:]
    print("Replaced render block in ZenOpenWorld.tsx successfully.")

# Clean any duplicate or misplaced definitions of the 3 zone functions
func_defs = """
// Zone 1b: Bếp Hương Tích & Bãi Chẻ Củi (x: 340)
function drawKitchenWoodZone(ctx: CanvasRenderingContext2D, step: number) {
  ctx.save();
  const kx = 340;

  ctx.fillStyle = '#78350f';
  ctx.fillRect(kx - 45, 450, 90, 110);
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(kx - 55, 450);
  ctx.lineTo(kx, 415);
  ctx.lineTo(kx + 55, 450);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#44403c';
  ctx.fillRect(kx + 22, 395, 12, 30);
  for (let s = 0; s < 4; s++) {
    const sy = 390 - s * 14 - (step % 20);
    const sx = kx + 28 + Math.sin(step * 0.05 + s) * 8 + s * 4;
    ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.beginPath();
    ctx.arc(sx, sy, 6 + s * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#b45309';
  for (let row = 0; row < 3; row++) {
    for (let c = 0; c < 4 - row; c++) {
      ctx.beginPath();
      ctx.ellipse(kx - 35 + c * 9 + row * 4, 555 - row * 7, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#57534e';
  ctx.fillRect(kx + 10, 545, 20, 14);
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(kx + 20, 545, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#451a03';
  ctx.fillRect(kx - 24, 465, 48, 14);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 8px "Noto Serif", serif';
  ctx.textAlign = 'center';
  ctx.fillText('BẾP HƯƠNG TÍCH', kx, 475);

  ctx.restore();
}

// Zone 2b: Giếng Tiên & Lu Nước Đại Chúng (x: 1020)
function drawWaterWellZone(ctx: CanvasRenderingContext2D, _step: number) {
  ctx.save();
  const wx = 1020;

  ctx.fillStyle = '#57534e';
  ctx.beginPath();
  ctx.ellipse(wx - 25, 550, 24, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(wx - 49, 550, 48, 18);
  ctx.fillStyle = '#78716c';
  ctx.beginPath();
  ctx.ellipse(wx - 25, 568, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.ellipse(wx - 25, 550, 19, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#78350f';
  ctx.fillRect(wx - 45, 500, 6, 50);
  ctx.fillRect(wx - 11, 500, 6, 50);
  ctx.fillRect(wx - 48, 498, 43, 6);
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(wx - 54, 498);
  ctx.lineTo(wx - 25, 482);
  ctx.lineTo(wx + 4, 498);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.ellipse(wx + 30, 548, 16, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.ellipse(wx + 30, 532, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(wx + 10, 562);
  ctx.quadraticCurveTo(wx + 20, 556, wx + 30, 562);
  ctx.stroke();

  ctx.restore();
}

// Zone 3b: Hiên Cơm Chay Từ Thiện (x: 1420)
function drawCharityStandZone(ctx: CanvasRenderingContext2D, step: number) {
  ctx.save();
  const cx = 1420;

  ctx.fillStyle = '#451a03';
  ctx.fillRect(cx - 35, 465, 8, 95);
  ctx.fillRect(cx + 27, 465, 8, 95);
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(cx - 45, 465);
  ctx.lineTo(cx, 442);
  ctx.lineTo(cx + 45, 465);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#78350f';
  ctx.fillRect(cx - 30, 538, 60, 22);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(cx - 34, 535, 68, 6);

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(cx - 10, 526, 12, 0, Math.PI * 2);
  ctx.fill();
  const cy = 512 - (step % 18);
  ctx.fillStyle = 'rgba(254, 243, 199, 0.4)';
  ctx.beginPath();
  ctx.arc(cx - 10 + Math.sin(step * 0.08) * 4, cy, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(cx + 12, 531, 6, 0, Math.PI, true);
  ctx.fill();

  ctx.fillStyle = '#991b1b';
  ctx.fillRect(cx - 28, 475, 56, 14);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 8px "Noto Serif", serif';
  ctx.textAlign = 'center';
  ctx.fillText('CƠM CHAY TỪ TÂM', cx, 485);

  ctx.restore();
}
"""

# Remove old definitions if they exist in the file
zen_content = re.sub(r'// Zone 1b: Bếp Hương Tích[\s\S]*?ctx\.restore\(\);\s*\}', '', zen_content)
zen_content = re.sub(r'// Zone 2b: Giếng Tiên[\s\S]*?ctx\.restore\(\);\s*\}', '', zen_content)
zen_content = re.sub(r'// Zone 3b: Hiên Cơm Chay[\s\S]*?ctx\.restore\(\);\s*\}', '', zen_content)

# Insert the functions right before `// Zone 2: Sân Chùa & Gác Chuông & Cây Đa`
target_marker = "// Zone 2: Sân Chùa & Gác Chuông & Cây Đa"
idx_target = zen_content.rfind(target_marker)
if idx_target != -1:
    zen_content = zen_content[:idx_target] + func_defs + "\n" + zen_content[idx_target:]
    print("Placed zone functions outside the component successfully.")

with open(zen_file, "w", encoding="utf-8") as f:
    f.write(zen_content)

# ==========================================
# 3. FIX UNUSED IMPORTS IN MODALS
# ==========================================
def fix_file(filepath, replacements):
    with open(filepath, "r", encoding="utf-8") as f:
        c = f.read()
    for old, new in replacements:
        c = c.replace(old, new)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(c)

# AltarCleaningModal
fix_file(r"e:\a\game\src\components\AltarCleaningModal.tsx", [
    ("import { X, CheckCircle2, Sparkles } from 'lucide-react';", "import { X, CheckCircle2 } from 'lucide-react';")
])

# CharityModal
fix_file(r"e:\a\game\src\components\CharityModal.tsx", [
    ("import { X, CheckCircle2, Heart, Sparkles } from 'lucide-react';", "import { X, CheckCircle2 } from 'lucide-react';")
])

# WaterCarryingModal
fix_file(r"e:\a\game\src\components\WaterCarryingModal.tsx", [
    ("import { X, CheckCircle2, Sparkles, Droplets } from 'lucide-react';", "import { X, CheckCircle2, Droplets } from 'lucide-react';"),
    ("const [waterSpilled, setWaterSpilled] = useState<boolean>(false);", "const [, setWaterSpilled] = useState<boolean>(false);")
])

# WoodChoppingModal
fix_file(r"e:\a\game\src\components\WoodChoppingModal.tsx", [
    ("import { X, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';", "import { X, CheckCircle2 } from 'lucide-react';"),
    ("const [meterDirection, setMeterDirection] = useState<number>(1);", "const [, setMeterDirection] = useState<number>(1);")
])

# ZenQuestModal
fix_file(r"e:\a\game\src\components\ZenQuestModal.tsx", [
    ("import { X, CheckCircle2, Circle, Sparkles, Award, ScrollText, ArrowRight, ShieldCheck } from 'lucide-react';", "import { X, CheckCircle2, Sparkles, Award, ScrollText, ArrowRight, ShieldCheck } from 'lucide-react';"),
    ("import { ZEN_QUESTS, ZEN_MILESTONES, type ZenQuestItem, type ZenMilestoneItem } from '../data/zenQuests';", "import { ZEN_QUESTS, ZEN_MILESTONES, type ZenQuestItem } from '../data/zenQuests';"),
    ("import { soundEngine } from '../services/audioEngine';", ""),
    ("  onClaimQuestReward,\n", "  onClaimQuestReward: _onClaim,\n"),
    ("  onClaimQuestReward,\r\n", "  onClaimQuestReward: _onClaim,\r\n")
])

print("All modals fixed successfully.")
