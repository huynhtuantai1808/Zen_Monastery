file_path = r"e:\a\game\src\canvas\ZenOpenWorld.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update ZenOpenWorldProps interface
old_props = """  onOpenSweeping: () => void;
  onOpenTeaHouse: () => void;
  onOpenDharma: () => void;
  onOpenCharModal: () => void;
  onAddMerit: (amount: number, x: number, y: number, label?: string) => void;
  spendStamina: (amount: number) => boolean;
}"""

new_props = """  onOpenSweeping: () => void;
  onOpenTeaHouse: () => void;
  onOpenDharma: () => void;
  onOpenWoodChopping: () => void;
  onOpenWaterCarrying: () => void;
  onOpenAltarCleaning: () => void;
  onOpenCharity: () => void;
  onOpenCharModal: () => void;
  onAddMerit: (amount: number, x: number, y: number, label?: string) => void;
  spendStamina: (amount: number) => boolean;
}"""

if old_props in content:
    content = content.replace(old_props, new_props)
    print("Updated ZenOpenWorldProps interface successfully!")
else:
    print("Could not find old_props in content!")

# 2. Update component destructuring
old_destruct = """  onOpenSweeping,
  onOpenTeaHouse,
  onOpenDharma,
  onOpenCharModal: _onOpenCharModal,
  onAddMerit,
  spendStamina,
}) => {"""

new_destruct = """  onOpenSweeping,
  onOpenTeaHouse,
  onOpenDharma,
  onOpenWoodChopping,
  onOpenWaterCarrying,
  onOpenAltarCleaning,
  onOpenCharity,
  onOpenCharModal: _onOpenCharModal,
  onAddMerit,
  spendStamina,
}) => {"""

if old_destruct in content:
    content = content.replace(old_destruct, new_destruct)
    print("Updated ZenOpenWorld destructuring successfully!")
else:
    print("Could not find old_destruct in content!")

# 3. Add new hotspots
old_hotspots_end = """    {
      id: 'sanctuary',
      x: 2150,
      y: 600,
      radius: 80,
      icon: '🏛️',
      title: 'Chánh Điện Trang Nghiêm',
      desc: 'Lạy Phật Thích Ca, thính pháp & vấn đáp ngộ đạo',
      action: onOpenDharma,
    },
  ];"""

new_hotspots_end = """    {
      id: 'wood-chopping',
      x: 340,
      y: 620,
      radius: 65,
      icon: '🪓',
      title: 'Bếp Hương Tích & Bãi Củi',
      desc: 'Chẻ củi nấu cơm chay, gọt giũa tâm sân hận thành lửa ấm nuôi chúng tăng',
      action: onOpenWoodChopping,
    },
    {
      id: 'water-well',
      x: 1020,
      y: 615,
      radius: 65,
      icon: '🪣',
      title: 'Giếng Tiên & Lu Nước Chùa',
      desc: 'Gánh nước suối trong veo về đổ đầy lu nước đại chúng, bước chân chánh niệm',
      action: onOpenWaterCarrying,
    },
    {
      id: 'charity-stand',
      x: 1420,
      y: 620,
      radius: 65,
      icon: '🍲',
      title: 'Hiên Cơm Thiện Nguyện',
      desc: 'Phát cơm cháo chay từ thiện cứu tế người cơ nhỡ & phóng sinh muôn loài',
      action: onOpenCharity,
    },
    {
      id: 'sanctuary',
      x: 2150,
      y: 600,
      radius: 80,
      icon: '🏛️',
      title: 'Chánh Điện Trang Nghiêm',
      desc: 'Lạy Phật Thích Ca, thính pháp & vấn đáp ngộ đạo',
      action: onOpenDharma,
    },
    {
      id: 'altar-cleaning',
      x: 2360,
      y: 600,
      radius: 70,
      icon: '🪷',
      title: 'Lau Chùi Bàn Thờ Phật',
      desc: 'Lau sạch bụi trần toà sen, đánh bóng lư đồng, thắp đèn hoa đăng trang nghiêm',
      action: onOpenAltarCleaning,
    },
  ];"""

if old_hotspots_end in content:
    content = content.replace(old_hotspots_end, new_hotspots_end)
    print("Updated hotspots array successfully!")
else:
    print("Could not find old_hotspots_end in content!")

# 4. Insert zone render calls
old_zones_render = """      // Zone 1: Cổng Tam Quan & Rừng Trúc
      drawBambooGateZone(ctx, stepCount);

      // Zone 2: Sân Chùa & Gác Chuông & Cây Đa
      drawBellCourtyardZone(ctx, stepCount, bellRipples);

      // Zone 3: Hiên Trà & Ống Tre Nước Shishi-odoshi
      drawTeaGardenZone(ctx, stepCount, bambooDropAngle);

      // Zone 4: Cầu Gỗ & Hồ Sen & Đàn Cá Koi
      drawLotusPondZone(ctx, stepCount);

      // Zone 5: Chánh Điện Trang Nghiêm & Tàng Kinh Các
      drawSanctuaryZone(ctx, stepCount);"""

new_zones_render = """      // Zone 1: Cổng Tam Quan & Rừng Trúc
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

      // Zone 5: Chánh Điện Trang Nghiêm & Tàng Kinh Các (kèm Bàn Thờ Phật x: 2360)
      drawSanctuaryZone(ctx, stepCount);"""

if old_zones_render in content:
    content = content.replace(old_zones_render, new_zones_render)
    print("Updated zone render calls successfully!")
else:
    print("Could not find old_zones_render in content!")

# 5. Add zone drawing functions before drawBellCourtyardZone
zone_funcs = """
// Zone 1b: Bếp Hương Tích & Bãi Chẻ Củi (x: 340)
function drawKitchenWoodZone(ctx: CanvasRenderingContext2D, step: number) {
  ctx.save();
  const kx = 340;

  // Gian bếp ngói đất nung cổ
  ctx.fillStyle = '#78350f';
  ctx.fillRect(kx - 45, 450, 90, 110);
  // Mái ngói dốc
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(kx - 55, 450);
  ctx.lineTo(kx, 415);
  ctx.lineTo(kx + 55, 450);
  ctx.closePath();
  ctx.fill();

  // Ống khói bốc khói lam chiều
  ctx.fillStyle = '#44403c';
  ctx.fillRect(kx + 22, 395, 12, 30);
  // Làn khói bay lượn
  for (let s = 0; s < 4; s++) {
    const sy = 390 - s * 14 - (step % 20);
    const sx = kx + 28 + Math.sin(step * 0.05 + s) * 8 + s * 4;
    ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.beginPath();
    ctx.arc(sx, sy, 6 + s * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Đống củi khô xếp ngay ngắn bên hiên
  ctx.fillStyle = '#b45309';
  for (let row = 0; row < 3; row++) {
    for (let c = 0; c < 4 - row; c++) {
      ctx.beginPath();
      ctx.ellipse(kx - 35 + c * 9 + row * 4, 555 - row * 7, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Thớt gỗ nghiến và rìu chẻ củi
  ctx.fillStyle = '#57534e';
  ctx.fillRect(kx + 10, 545, 20, 14);
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(kx + 20, 545, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Biển hiệu Bếp Hương Tích
  ctx.fillStyle = '#451a03';
  ctx.fillRect(kx - 24, 465, 48, 14);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 8px "Noto Serif", serif';
  ctx.textAlign = 'center';
  ctx.fillText('BẾP HƯƠNG TÍCH', kx, 475);

  ctx.restore();
}

// Zone 2b: Giếng Tiên & Lu Nước Đại Chúng (x: 1020)
function drawWaterWellZone(ctx: CanvasRenderingContext2D, step: number) {
  ctx.save();
  const wx = 1020;

  // Thành giếng đá tròn rêu phong
  ctx.fillStyle = '#57534e';
  ctx.beginPath();
  ctx.ellipse(wx - 25, 550, 24, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(wx - 49, 550, 48, 18);
  ctx.fillStyle = '#78716c';
  ctx.beginPath();
  ctx.ellipse(wx - 25, 568, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Miệng giếng & nước xanh trong
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.ellipse(wx - 25, 550, 19, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cột gỗ ròng rọc giếng
  ctx.fillStyle = '#78350f';
  ctx.fillRect(wx - 45, 500, 6, 50);
  ctx.fillRect(wx - 11, 500, 6, 50);
  ctx.fillRect(wx - 48, 498, 43, 6);
  // Mái che nhỏ trên giếng
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(wx - 54, 498);
  ctx.lineTo(wx - 25, 482);
  ctx.lineTo(wx + 4, 498);
  ctx.closePath();
  ctx.fill();

  // Lu sành lớn đón nước đại chúng (x: 1045)
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.ellipse(wx + 30, 548, 16, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.ellipse(wx + 30, 532, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Đòn gánh & đôi thùng gỗ nhỏ
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

  // Mái hiên tranh nứa ấm cúng
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

  // Bàn gỗ bày nồi cháo & cơm chay
  ctx.fillStyle = '#78350f';
  ctx.fillRect(cx - 30, 538, 60, 22);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(cx - 34, 535, 68, 6);

  // Nồi cháo lớn bốc khói
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(cx - 10, 526, 12, 0, Math.PI * 2);
  ctx.fill();
  // Khói cháo nghi ngút
  const cy = 512 - (step % 18);
  ctx.fillStyle = 'rgba(254, 243, 199, 0.4)';
  ctx.beginPath();
  ctx.arc(cx - 10 + Math.sin(step * 0.08) * 4, cy, 5, 0, Math.PI * 2);
  ctx.fill();

  // Bát cơm chay vàng ấm
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(cx + 12, 531, 6, 0, Math.PI, true);
  ctx.fill();

  // Biển hiệu Thiện Nguyện
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(cx - 28, 475, 56, 14);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 8px "Noto Serif", serif';
  ctx.textAlign = 'center';
  ctx.fillText('CƠM CHAY TỪ TÂM', cx, 485);

  ctx.restore();
}
"""

marker = "// Zone 2: Sân Chùa & Gác Chuông & Cây Đa"
if marker in content:
    content = content.replace(marker, zone_funcs + "\n" + marker)
    print("Added zone drawing functions successfully!")
else:
    print("Could not find marker for zone drawing functions!")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated ZenOpenWorld.tsx successfully!")
