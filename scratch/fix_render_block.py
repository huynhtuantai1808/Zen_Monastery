zen_file = r"e:\a\game\src\canvas\ZenOpenWorld.tsx"
with open(zen_file, "r", encoding="utf-8") as f:
    c = f.read()

target = """      // Ground Path (Courtyard tiles, grass, streams)
      drawMonasteryGround(ctx, stepCount);

      // Zone 1: Cổng Tam Quan & Rừng Trúc
      drawBambooGateZone(ctx, stepCount);

      );"""

replacement = """      // Ground Path (Courtyard tiles, grass, streams)
      drawMonasteryGround(ctx, stepCount);

      // Zone 1: Cổng Tam Quan & Rừng Trúc
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
      drawSanctuaryZone(ctx, stepCount);

      // Draw Hotspot Rings & Interaction Beacons
      hotspots.forEach((spot) => {
        const isNear = nearHotspot?.id === spot.id;
        const pulse = Math.sin(stepCount * 0.05 + spot.x * 0.01) * 3;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(spot.x, spot.y + 12, spot.radius + pulse, (spot.radius + pulse) * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = isNear ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.12)';
        ctx.fill();
        ctx.strokeStyle = isNear ? '#fde047' : 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = isNear ? 2.5 : 1;
        ctx.stroke();

        if (isNear) {
          const beaconGrad = ctx.createLinearGradient(0, spot.y - 120, 0, spot.y);
          beaconGrad.addColorStop(0, 'rgba(254, 240, 138, 0)');
          beaconGrad.addColorStop(1, 'rgba(254, 240, 138, 0.28)');
          ctx.fillStyle = beaconGrad;
          ctx.fillRect(spot.x - 25, spot.y - 120, 50, 120);
        }

        const iconY = spot.y - 32 + Math.sin(stepCount * 0.06) * 4;
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(spot.icon, spot.x, iconY);

        ctx.font = 'bold 11px "Noto Serif", serif';
        const txtW = ctx.measureText(spot.title).width;
        ctx.fillStyle = isNear ? 'rgba(69, 26, 3, 0.92)' : 'rgba(28, 25, 23, 0.85)';
        ctx.beginPath();
        ctx.roundRect(spot.x - txtW / 2 - 8, iconY + 8, txtW + 16, 20, 6);
        ctx.fill();
        ctx.strokeStyle = isNear ? '#f59e0b' : '#78716c';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isNear ? '#fef08a' : '#f5f5f4';
        ctx.fillText(spot.title, spot.x, iconY + 22);

        ctx.restore();
      });"""

c = c.replace(target, replacement)
c = c.replace(target.replace("\n", "\r\n"), replacement.replace("\n", "\r\n"))

with open(zen_file, "w", encoding="utf-8") as f:
    f.write(c)

print("Fixed render section successfully.")
