// =======================================================================
// MONASTERY COLLIDERS, ELEVATION LOGIC & ZONE DEFINITIONS
// =======================================================================

export interface TempleZoneInfo {
  id: string;
  name: string;
  subtitle: string;
  dimensions: string;
  icon: string;
  desc: string;
  pos: { x: number; y?: number; z: number };
  actionKey:
  | 'GATE'
  | 'COURTYARD'
  | 'TOWER'
  | 'BELL'
  | 'POND'
  | 'CORRIDOR'
  | 'SANCTUARY'
  | 'MEDITATION'
  | 'LIBRARY'
  | 'BACK_GARDEN'
  | 'BALCONY'
  | 'STAIRS'
  | 'AERIAL'
  | 'NIGHT';
}

export interface CircleObstacle {
  type: 'circle';
  x: number;
  z: number;
  r: number;
  minY?: number;
  maxY?: number;
  name?: string;
}

export interface BoxObstacle {
  type: 'box';
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
  name?: string;
}

export type MonasteryObstacle = CircleObstacle | BoxObstacle;

export const MONK_COLLISION_RADIUS = 0.45;

// Comprehensive monastery collision geometry (Circles & AABB Boxes)
export const MONASTERY_OBSTACLES: MonasteryObstacle[] = [
  // 1. Cổng Tam Quan (Zone 1 Gate) - 4 stone pillars + lanterns & flagpoles (3 open gates)
  { type: 'circle', x: -6.5, z: 66.0, r: 0.85, name: 'Gate Pillar 1' },
  { type: 'circle', x: -2.2, z: 66.0, r: 0.85, name: 'Gate Pillar 2' },
  { type: 'circle', x: 2.2, z: 66.0, r: 0.85, name: 'Gate Pillar 3' },
  { type: 'circle', x: 6.5, z: 66.0, r: 0.85, name: 'Gate Pillar 4' },
  { type: 'circle', x: -6.5, z: 67.6, r: 0.7, name: 'Gate Lantern 1' },
  { type: 'circle', x: -2.2, z: 67.6, r: 0.7, name: 'Gate Lantern 2' },
  { type: 'circle', x: 2.2, z: 67.6, r: 0.7, name: 'Gate Lantern 3' },
  { type: 'circle', x: 6.5, z: 67.6, r: 0.7, name: 'Gate Lantern 4' },
  { type: 'circle', x: -7.2, z: 67.2, r: 0.4, name: 'Flagpole L' },
  { type: 'circle', x: 7.2, z: 67.2, r: 0.4, name: 'Flagpole R' },

  // 2. Sân Chùa (Zone 2 Courtyard) - Bronze Censer, Bonsai pots & Stone lanterns
  { type: 'circle', x: 0.0, z: 22.0, r: 2.2, name: 'Bronze Censer' },
  { type: 'circle', x: -20.0, z: 33.0, r: 1.45, name: 'Bonsai 1' },
  { type: 'circle', x: -20.0, z: 15.0, r: 1.45, name: 'Bonsai 2' },
  { type: 'circle', x: 20.0, z: 33.0, r: 1.45, name: 'Bonsai 3' },
  { type: 'circle', x: 20.0, z: 15.0, r: 1.45, name: 'Bonsai 4' },
  { type: 'circle', x: -12.0, z: 35.0, r: 1.45, name: 'Bonsai 5' },
  { type: 'circle', x: 12.0, z: 35.0, r: 1.45, name: 'Bonsai 6' },
  { type: 'circle', x: -8.0, z: 48.0, r: 0.8, name: 'Courtyard Lantern L' },
  { type: 'circle', x: 8.0, z: 48.0, r: 0.8, name: 'Courtyard Lantern R' },
  { type: 'circle', x: -4.5, z: 22.0, r: 0.65, name: 'Incense Table L' },
  { type: 'circle', x: 4.5, z: 22.0, r: 0.65, name: 'Incense Table R' },

  // 3. Bảo Tháp Men Ngọc (Zone 3 Jade Pagoda at 38, -20)
  // Stone Terrace Outer Bounds (X: 31 to 45, Z: -27 to -13)
  { type: 'box', minX: 31.0, maxX: 45.0, minZ: -27.0, maxZ: -13.0, maxY: 3.1, name: 'Pagoda Terrace Base' },
  // Main Jade Pagoda Core Octagon / Box
  { type: 'box', minX: 34.0, maxX: 42.0, minZ: -24.0, maxZ: -16.0, name: 'Jade Pagoda Core' },
  { type: 'circle', x: 33.5, z: -12.5, r: 0.75, name: 'Pagoda Front Lantern L' },
  { type: 'circle', x: 42.5, z: -12.5, r: 0.75, name: 'Pagoda Front Lantern R' },
  { type: 'circle', x: 38.0, z: -8.0, r: 0.6, name: 'Pagoda Incense Burner' },

  // 4. Tháp Chuông Cổ Tự (Zone 4 Bell Tower at -26, -20)
  // Raised stone platform with open archways (columns at 4 corners)
  { type: 'circle', x: -28.8, z: -22.8, r: 0.65, name: 'Bell Tower Col NW' },
  { type: 'circle', x: -23.2, z: -22.8, r: 0.65, name: 'Bell Tower Col NE' },
  { type: 'circle', x: -28.8, z: -17.2, r: 0.65, name: 'Bell Tower Col SW' },
  { type: 'circle', x: -23.2, z: -17.2, r: 0.65, name: 'Bell Tower Col SE' },
  // Giant Bell & Wooden Striker Rig in center
  { type: 'circle', x: -26.0, z: -20.0, r: 1.35, name: 'Great Bell of Wisdom' },
  { type: 'box', minX: -26.4, maxX: -25.6, minZ: -18.2, maxZ: -16.8, name: 'Bell Striking Beam' },

  // 5. Hiên Nước & Suối Ngọc (Zone 5 Tatami Deck at X: -38.5 to -26, Z: 26.5 to 45.5)
  // Outer water stream / pond perimeter
  { type: 'box', minX: -42.0, maxX: -38.5, minZ: 24.0, maxZ: 48.0, name: 'Pond Outer Edge' },
  { type: 'box', minX: -38.5, maxX: -24.0, minZ: 45.5, maxZ: 49.0, name: 'Pond North Edge' },
  { type: 'box', minX: -38.5, maxX: -24.0, minZ: 23.0, maxZ: 26.5, name: 'Pond South Edge' },
  // Low tea table, cushion & bamboo screen on tatami deck
  { type: 'box', minX: -34.5, maxX: -31.5, minZ: 33.5, maxZ: 36.5, name: 'Tatami Low Table' },
  { type: 'circle', x: -33.0, z: 38.5, r: 0.8, name: 'Watermelon Tray Table' },
  { type: 'circle', x: -28.5, z: 42.0, r: 0.65, name: 'Lotus Water Jar' },

  // 6. Dãy Hành Lang Cột Gỗ Lim (Zone 6 Corridor at X: 15 to 21, Z: -3 to 30)
  // East wall boundary behind the open corridor
  { type: 'box', minX: 20.8, maxX: 22.5, minZ: -3.5, maxZ: 30.5, name: 'East Corridor Wall' },
  // Outer row of timber pillars along the courtyard
  { type: 'circle', x: 15.2, z: -2.0, r: 0.45, name: 'Corridor Pillar 1' },
  { type: 'circle', x: 15.2, z: 4.5, r: 0.45, name: 'Corridor Pillar 2' },
  { type: 'circle', x: 15.2, z: 11.0, r: 0.45, name: 'Corridor Pillar 3' },
  { type: 'circle', x: 15.2, z: 17.5, r: 0.45, name: 'Corridor Pillar 4' },
  { type: 'circle', x: 15.2, z: 24.0, r: 0.45, name: 'Corridor Pillar 5' },
  // Inner row of timber pillars
  { type: 'circle', x: 19.8, z: -2.0, r: 0.45, name: 'Corridor In-Pillar 1' },
  { type: 'circle', x: 19.8, z: 4.5, r: 0.45, name: 'Corridor In-Pillar 2' },
  { type: 'circle', x: 19.8, z: 11.0, r: 0.45, name: 'Corridor In-Pillar 3' },
  { type: 'circle', x: 19.8, z: 17.5, r: 0.45, name: 'Corridor In-Pillar 4' },
  { type: 'circle', x: 19.8, z: 24.0, r: 0.45, name: 'Corridor In-Pillar 5' },

  // 7. Đại Hùng Bảo Điện (Zone 7 Main Sanctuary Complex: X in [-22.5, 22.5], Z in [-34.0, 5.5])
  // 7.1. Cụm Bậc Tam Cấp Sân Trước (Bệ đá trước điện: Z từ 0.5 đến 5.5)
  { type: 'box', minX: -22.5, maxX: -8.0, minZ: 0.5, maxZ: 5.5, maxY: 3.3, name: 'Sanctuary Front Terrace Left' },
  { type: 'box', minX: 8.0, maxX: 22.5, minZ: 0.5, maxZ: 5.5, maxY: 3.3, name: 'Sanctuary Front Terrace Right' },
  // Lan can rồng đá hai bên bậc thang chính (Lối lên ở giữa: X in [-7.5, 7.5])
  { type: 'box', minX: -8.2, maxX: -7.5, minZ: 0.5, maxZ: 5.5, name: 'Dragon Railing Left' },
  { type: 'box', minX: 7.5, maxX: 8.2, minZ: 0.5, maxZ: 5.5, name: 'Dragon Railing Right' },

  // 7.2. Tường Bao & Cột Tiền Điện Đại Hùng Bảo Điện
  // Tường hồi phía Tây (trái)
  { type: 'box', minX: -21.5, maxX: -19.5, minZ: -32.5, maxZ: -0.5, name: 'Sanctuary West Outer Wall' },
  // Tường hồi phía Đông (phải)
  { type: 'box', minX: 19.5, maxX: 21.5, minZ: -32.5, maxZ: -0.5, name: 'Sanctuary East Outer Wall' },
  // Tường hậu (phía Bắc)
  { type: 'box', minX: -21.5, maxX: 21.5, minZ: -33.5, maxZ: -31.5, name: 'Sanctuary North Back Wall' },
  // Mặt tiền Chính Điện (Để ngỏ 3 gian cửa: Gian chính X in [-4.5, 4.5], gian tả [-12.5, -7.5], gian hữu [7.5, 12.5])
  { type: 'box', minX: -19.5, maxX: -13.0, minZ: -1.2, maxZ: 0.0, name: 'Sanctuary Front Wall W' },
  { type: 'box', minX: -7.2, maxX: -4.8, minZ: -1.2, maxZ: 0.0, name: 'Sanctuary Front Wall ML' },
  { type: 'box', minX: 4.8, maxX: 7.2, minZ: -1.2, maxZ: 0.0, name: 'Sanctuary Front Wall MR' },
  { type: 'box', minX: 13.0, maxX: 19.5, minZ: -1.2, maxZ: 0.0, name: 'Sanctuary Front Wall E' },

  // 7.3. Hàng Cột Gỗ Lim Tiền Điện (Front Veranda Pillars)
  { type: 'circle', x: -16.0, z: -0.6, r: 0.55, name: 'Veranda Pillar W2' },
  { type: 'circle', x: -10.0, z: -0.6, r: 0.55, name: 'Veranda Pillar W1' },
  { type: 'circle', x: -4.8, z: -0.6, r: 0.55, name: 'Veranda Pillar C_L' },
  { type: 'circle', x: 4.8, z: -0.6, r: 0.55, name: 'Veranda Pillar C_R' },
  { type: 'circle', x: 10.0, z: -0.6, r: 0.55, name: 'Veranda Pillar E1' },
  { type: 'circle', x: 16.0, z: -0.6, r: 0.55, name: 'Veranda Pillar E2' },

  // 7.4. Hàng Cột Cái Nội Điện (Inner Giant Pillars)
  { type: 'circle', x: -8.0, z: -9.5, r: 0.65, name: 'Inner Main Pillar NW' },
  { type: 'circle', x: 8.0, z: -9.5, r: 0.65, name: 'Inner Main Pillar NE' },
  { type: 'circle', x: -8.0, z: -21.5, r: 0.65, name: 'Inner Main Pillar SW' },
  { type: 'circle', x: 8.0, z: -21.5, r: 0.65, name: 'Inner Main Pillar SE' },

  // 7.5. Bệ Tam Thế Phật Dát Vàng & Ban Thờ (Grand Altar)
  { type: 'box', minX: -7.5, maxX: 7.5, minZ: -29.5, maxZ: -23.0, name: 'Three Buddhas Lotus Dais' },
  // Bàn thờ hương án phía trước bệ Phật
  { type: 'box', minX: -5.0, maxX: 5.0, minZ: -22.5, maxZ: -19.5, name: 'Golden Altar Table' },
  // Đại Hồng Chung & Giá Trống Sấm trong Tiền Điện
  { type: 'circle', x: -14.5, z: -6.5, r: 1.1, name: 'Sanctuary Great Bell' },
  { type: 'circle', x: 14.5, z: -6.5, r: 1.1, name: 'Sanctuary Thunder Drum' },

  // 8. Thiền Trà Quán (Zone 8 Tea Pavilion at -24, 6)
  { type: 'box', minX: -30.0, maxX: -18.0, minZ: 0.0, maxZ: 12.0, maxY: 0.49, name: 'Tea Pavilion Base' },
  { type: 'circle', x: -24.0, z: 6.0, r: 1.5, name: 'Tea Stone Table' },
  { type: 'circle', x: -28.0, z: 1.5, r: 0.6, name: 'Tea Pillar NW' },
  { type: 'circle', x: -20.0, z: 1.5, r: 0.6, name: 'Tea Pillar NE' },
  { type: 'circle', x: -28.0, z: 10.5, r: 0.6, name: 'Tea Pillar SW' },
  { type: 'circle', x: -20.0, z: 10.5, r: 0.6, name: 'Tea Pillar SE' },

  // 9. Tàng Kinh Các (Zone 9 Library at 28.5, 13)
  { type: 'box', minX: 23.0, maxX: 35.0, minZ: 5.0, maxZ: 21.0, maxY: 0.58, name: 'Library Base' },
  { type: 'box', minX: 25.7, maxX: 34.3, minZ: 8.0, maxZ: 9.0, name: 'Library Shelf 1' },
  { type: 'box', minX: 25.7, maxX: 34.3, minZ: 12.5, maxZ: 13.5, name: 'Library Shelf 2' },
  { type: 'box', minX: 25.7, maxX: 34.3, minZ: 17.0, maxZ: 18.0, name: 'Library Shelf 3' },

  // 10. Sân Sau (Zone 10 Back Garden) - Ancient well, kitchen & stone arch posts
  { type: 'circle', x: 11.0, z: -46.0, r: 1.7, name: 'Ancient Well' },
  { type: 'box', minX: -21.8, maxX: -10.2, minZ: -52.0, maxZ: -44.0, name: 'Kitchen House' },
  { type: 'box', minX: -3.3, maxX: -1.9, minZ: -30.8, maxZ: -29.2, name: 'Stone Arch Post L' },
  { type: 'box', minX: 1.9, maxX: 3.3, minZ: -30.8, maxZ: -29.2, name: 'Stone Arch Post R' },
];

const _collisionResult: { x: number; z: number } = { x: 0, z: 0 };

/**
 * Resolves character position against monastery obstacle geometry.
 * Returns the adjusted (x, z) coordinates with smooth surface sliding.
 * Uses persistent `out` object for Zero-Allocation in 60fps Game Loop.
 */
export function resolveMonkCollision(
  px: number,
  py: number,
  pz: number,
  bodyRadius: number = MONK_COLLISION_RADIUS,
  out: { x: number; z: number } = _collisionResult
): { x: number; z: number } {
  let curX = px;
  let curZ = pz;

  // 2 relaxation iterations for corner / adjacent obstacles
  for (let iteration = 0; iteration < 2; iteration++) {
    for (let i = 0; i < MONASTERY_OBSTACLES.length; i++) {
      const obs = MONASTERY_OBSTACLES[i];
      if (obs.minY !== undefined && py < obs.minY) continue;
      if (obs.maxY !== undefined && py > obs.maxY) continue;

      if (obs.type === 'circle') {
        const dx = curX - obs.x;
        const dz = curZ - obs.z;
        const dist = Math.hypot(dx, dz);
        const minDist = obs.r + bodyRadius;
        if (dist < minDist) {
          if (dist > 0.0001) {
            const push = minDist - dist;
            curX += (dx / dist) * push;
            curZ += (dz / dist) * push;
          } else {
            curZ += minDist;
          }
        }
      } else if (obs.type === 'box') {
        const minX = obs.minX;
        const maxX = obs.maxX;
        const minZ = obs.minZ;
        const maxZ = obs.maxZ;

        const expMinX = minX - bodyRadius;
        const expMaxX = maxX + bodyRadius;
        const expMinZ = minZ - bodyRadius;
        const expMaxZ = maxZ + bodyRadius;

        if (curX > expMinX && curX < expMaxX && curZ > expMinZ && curZ < expMaxZ) {
          if (curX >= minX && curX <= maxX && curZ >= minZ && curZ <= maxZ) {
            const dLeft = curX - expMinX;
            const dRight = expMaxX - curX;
            const dBack = curZ - expMinZ;
            const dFront = expMaxZ - curZ;
            const minD = Math.min(dLeft, dRight, dBack, dFront);
            if (minD === dLeft) curX = expMinX;
            else if (minD === dRight) curX = expMaxX;
            else if (minD === dBack) curZ = expMinZ;
            else curZ = expMaxZ;
          } else {
            const closestX = Math.max(minX, Math.min(maxX, curX));
            const closestZ = Math.max(minZ, Math.min(maxZ, curZ));
            const cdx = curX - closestX;
            const cdz = curZ - closestZ;
            const cornerDist = Math.hypot(cdx, cdz);
            if (cornerDist < bodyRadius) {
              if (cornerDist > 0.0001) {
                const push = bodyRadius - cornerDist;
                curX += (cdx / cornerDist) * push;
                curZ += (cdz / cornerDist) * push;
              } else {
                curX += bodyRadius;
              }
            }
          }
        }
      }
    }
  }

  // Clamped Monastery Terrain Bounds
  curX = Math.max(-46.0, Math.min(46.0, curX));
  curZ = Math.max(-68.0, Math.min(86.0, curZ));

  out.x = curX;
  out.z = curZ;
  return out;
}

/**
 * Accurately determines the true floor elevation (Y) at coordinate (x, z)
 * across all multi-tier podiums, grand staircases, indoor halls, pavilions, and bridges.
 */
export function getTerrainFloorElevation(x: number, z: number, currentY: number = 0.42): number {
  // 0. Dãy Hành Lang Cột Gỗ Lim (Zone 6 Corridor: X in [14.6, 21.4], Z in [-3.5, 30.0])
  if (x >= 14.6 && x <= 21.4 && z >= -3.5 && z <= 30.0) {
    return 0.58;
  }

  // 1. Đại Hùng Bảo Điện (Zone 7 Main Sanctuary Complex)
  // Sanctuary complex centered at (0, -16), podium spans X in [-22.5, 22.5], Z in [-34.0, 5.5]
  if (x >= -23.5 && x <= 23.5 && z >= -34.0 && z <= 6.5) {
    // 1.1. Lên tam cấp tiền điện & bậc thang sảnh chính (Z từ 6.0 giảm dần đến -0.5)
    if (z >= -0.5 && z <= 6.0) {
      const t = Math.max(0.0, Math.min(1.0, (6.0 - z) / 6.5));
      return 0.42 + t * (3.30 - 0.42);
    }

    // 1.2. Thềm thượng & Toàn bộ Nội điện Đại Hùng Bảo Điện (Mặt sàn phẳng cố định Y = 3.30m)
    if (z <= -0.5) {
      // 2nd Floor Balcony (Lầu Gác Tầng Cao)
      if (currentY >= 5.5 && z >= -30.0 && z <= -6.0 && Math.abs(x) <= 15.0) {
        return 7.50;
      }
      return 3.30;
    }
  }

  // 2. Bảo Tháp Men Ngọc (Zone 3 Pagoda Tower at 38, -20)
  if (x >= 30.5 && x <= 45.5 && z >= -27.5 && z <= -9.0) {
    // Front stone steps leading to Tier 1 terrace (Z from -9.5 down to -14.5)
    if (x >= 35.0 && x <= 41.0 && z >= -14.5 && z <= -9.5) {
      const t = Math.max(0.0, Math.min(1.0, (-9.5 - z) / 5.0));
      return 0.42 + t * (3.10 - 0.42);
    }
    if (z <= -14.0) {
      return 3.10;
    }
  }

  // 3. Tháp Chuông Cổ Tự (Zone 4 Bell Tower at -26, -20)
  if (x >= -31.5 && x <= -20.5 && z >= -25.5 && z <= -14.5) {
    // Front stone steps leading to bell tower platform (Z from -14.5 down to -17.0, X centered around -26)
    if (Math.abs(x - (-26)) <= 2.2 && z >= -17.0 && z <= -14.5) {
      const t = Math.max(0.0, Math.min(1.0, (-14.5 - z) / 2.5));
      return 0.42 + t * (0.89 - 0.42);
    }
    return 0.89;
  }

  // 4. Hiên Nước & Suối Ngọc (Zone 5 On Rainy Days Tatami Deck & Bridge)
  // Wooden Engawa Tatami Deck (matching On Rainy Days reference)
  if (x >= -38.5 && x <= -26.0 && z >= 26.5 && z <= 45.5) {
    return 0.89;
  }
  // Stone Bridge connecting to courtyard
  if (x >= -26.0 && x <= -13.0 && z >= 34.0 && z <= 38.0) {
    const arch = Math.max(0.0, 1.0 - Math.abs(x - (-19.5)) / 6.5);
    return 0.65 + arch * 0.24;
  }

  // 5. Phòng Thiền Nguyệt Môn (Zone 8 Meditation Hall at -24, 6)
  if (x >= -31.5 && x <= -16.5 && z >= -0.5 && z <= 12.5) {
    return 0.49;
  }

  // 6. Tàng Kinh Các (Zone 9 Library at 28.5, 13)
  if (x >= 21.4 && x <= 35.8 && z >= 3.5 && z <= 22.5) {
    return 0.58;
  }

  // 7. Sân gạch nung Bát Tràng & Vườn Chùa (Default ground)
  return 0.42;
}

// 14 STYLIZED ZONES IN THE ISOMETRIC FANTASY ZEN MONASTERY
export const TEMPLE_ZONES: TempleZoneInfo[] = [
  {
    id: 'gate',
    name: '1. Cổng Tam Quan',
    subtitle: 'Lối vào chùa • Cổng đá cổ kính & cờ Phật giáo',
    dimensions: '22 × 12 m',
    icon: '⛩️',
    desc: 'Cổng đá cách điệu với mái ngói đao cong, cờ ngũ sắc và đèn đá sân vườn.',
    pos: { x: 0, y: 0.42, z: 66 },
    actionKey: 'GATE',
  },
  {
    id: 'courtyard',
    name: '2. Sân Chùa & Chính Điện',
    subtitle: 'Sân gạch nung ấm áp & Lư hương đồng tam bảo',
    dimensions: '52 × 38 m',
    icon: '🧹',
    desc: 'Khuôn viên sân gạch Bát Tràng ấm áp với lư hương đồng, chậu cây cảnh bonsai và đèn đá.',
    pos: { x: 0, y: 0.42, z: 18 },
    actionKey: 'COURTYARD',
  },
  {
    id: 'tower',
    name: '3. Bảo Tháp Men Ngọc (3 Tầng)',
    subtitle: 'Bảo tháp ngói lưu ly xanh ngọc • Cửa vòm & Đỉnh búp sen vàng',
    dimensions: '18 × 18 m',
    icon: '🏯',
    desc: 'Bảo tháp kiến trúc truyền thống theo bản vẽ: 3 tầng mái cong ngói men ngọc, thân gỗ ấm, cửa vòm nguyệt môn, đài sen tam cấp và đỉnh búp sen hoàng kim.',
    pos: { x: 38, y: 3.10, z: -10.5 },
    actionKey: 'TOWER',
  },
  {
    id: 'bell',
    name: '4. Tháp Chuông Cổ Tự (2 Tầng 8 Mái)',
    subtitle: 'Đại Hồng Chung, Chày Kình & Chú Tiểu Tuệ Tĩnh',
    dimensions: '14 × 14 m',
    icon: '🔔',
    desc: 'Tháp chuông 2 tầng 8 mái chồng diêm theo bản vẽ kiến trúc: bệ đá tam cấp chạm mây, 4 cột cái gỗ lim, cổ bồng chấn song con tiện, Đại Hồng Chung quai rồng Bồ Lao và Chú Tiểu Tuệ Tĩnh thỉnh chuông.',
    pos: { x: -26, y: 0.89, z: -17.5 },
    actionKey: 'BELL',
  },
  {
    id: 'pond',
    name: '5. Hiên Nước & Suối Ngọc (On Rainy Days)',
    subtitle: 'Hiên gỗ tatami ven suối ngọc • Nằm thảnh thơi, ngắm cá Koi & mưa hè',
    dimensions: '28 × 22 m',
    icon: '🍉',
    desc: 'Hiên gỗ kiểu Nhật lợp chiếu tatami xanh ngọc ven dòng suối trong vắt soi bóng đàn cá Koi, đĩa dưa hấu thanh mát, quạt gió mùa hè và vòm lá xanh komorebi rợp bóng.',
    pos: { x: -30.0, y: 0.89, z: 36.0 },
    actionKey: 'POND',
  },
  {
    id: 'corridor',
    name: '6. Hành Lang Cột Gỗ',
    subtitle: 'Dãy hành lang dài cao thoáng • Đèn lồng đỏ & Mái ngói men ngọc',
    dimensions: '34 × 7 m',
    icon: '🏮',
    desc: 'Dãy hành lang cột gỗ lim cao thoáng với hệ vì kèo chạm trổ, mái ngói lưu ly men ngọc uốn lượn và hàng đèn lồng đỏ ấm áp.',
    pos: { x: 18, y: 0.58, z: 13 },
    actionKey: 'CORRIDOR',
  },
  {
    id: 'sanctuary',
    name: '7. Đại Hùng Bảo Điện (Chính Điện)',
    subtitle: 'Tam Thế Phật Mạ Vàng • Sư Phụ Trụ Trì Áo Cà Sa Đỏ Thuyết Pháp',
    dimensions: '46 × 36 m',
    icon: '🏛️',
    desc: 'Chính điện uy nghiêm theo hình mẫu: bộ tượng Tam Thế Phật dát vàng ngự đài sen, hoành phi câu đối thếp vàng, đại đỉnh hương đồng tỏa khói trầm, hàng bồ đoàn thiền tọa và Hòa Thượng Trụ Trì khoác áo cà sa đỏ râu mày dài thuyết pháp.',
    pos: { x: 0, y: 3.30, z: -12 },
    actionKey: 'SANCTUARY',
  },
  {
    id: 'meditation',
    name: '8. Thiền Trà Quán (Hiên Trà Nguyệt Môn)',
    subtitle: 'Thưởng Trà Chánh Niệm • Chú Tiểu Pha Trà & Phục Vụ Trà',
    dimensions: '16 × 14 m',
    icon: '🍵',
    desc: 'Không gian thanh tao dưới căng hiên bên trái: thưởng thức trà sen hảo hạng, đàm đạo Trà Thiền Nhất Vị cùng Chú Tiểu Pha Trà và Thị Giả Phục Vụ Trà.',
    pos: { x: -24, y: 0.49, z: 6 },
    actionKey: 'MEDITATION',
  },
  {
    id: 'library',
    name: '9. Phòng Kinh Sách (Lưu trữ)',
    subtitle: 'Tàng Kinh Các • Kệ sách cổ & bàn trà thư pháp',
    dimensions: '14 × 18 m',
    icon: '📜',
    desc: 'Tàng Kinh Các lưu giữ kinh điển, giá sách chạm trần, nghiên mực và ấm trà gốm mộc mạc.',
    pos: { x: 27.5, y: 0.58, z: 13 },
    actionKey: 'LIBRARY',
  },
  {
    id: 'back_garden',
    name: '10. Sân Sau (Phụ trợ)',
    subtitle: 'Hậu viện tĩnh mịch • Giếng ngọc, bếp củi & lu gốm',
    dimensions: '36 × 30 m',
    icon: '🎋',
    desc: 'Lối đá rêu phong dẫn vào sân sau với bếp củi, giếng nước ngọc đá ong và rặng trúc xanh.',
    pos: { x: 0, y: 0.42, z: -50 },
    actionKey: 'BACK_GARDEN',
  },
  {
    id: 'balcony',
    name: '11. Lầu Gác (View toàn cảnh)',
    subtitle: 'Lầu cao lan can chạm chữ Vạn • Ngắm cảnh non nước',
    dimensions: '28 × 8 m',
    icon: '🪟',
    desc: 'Lầu cao lộng gió nhìn ra toàn cảnh sân chùa, tháp chuông và mây núi bảng lảng.',
    pos: { x: 0, y: 7.50, z: -16 },
    actionKey: 'BALCONY',
  },
  {
    id: 'stairs',
    name: '12. Đường Lên Tầng Trên',
    subtitle: 'Cầu thang bậc đá rồng rêu phong & cờ Phật giáo',
    dimensions: '14 × 8 m',
    icon: '🪜',
    desc: 'Bậc thang đá hoa cương rêu phong dài dốc dẫn lên lầu cao và Bảo Tháp sừng sững.',
    pos: { x: 28, y: 2.80, z: -6 },
    actionKey: 'STAIRS',
  },
  {
    id: 'aerial',
    name: '13. View Từ Trên Cao',
    subtitle: 'Góc nhìn Isometric toàn cảnh diorama tuyệt đẹp',
    dimensions: 'Toàn cảnh',
    icon: '🌄',
    desc: 'Góc nhìn từ trên cao bao quát trọn vẹn toàn bộ khuôn viên sơn tự mái ngói đỏ giữa mây ngàn.',
    pos: { x: 0, y: 28, z: 46 },
    actionKey: 'AERIAL',
  },
  {
    id: 'night',
    name: '14. Ban Đêm (Ánh sáng & không khí)',
    subtitle: 'Đêm trăng huyền ảo • Muôn ngọn đèn lồng bừng sáng',
    dimensions: 'Toàn cảnh',
    icon: '🌕',
    desc: 'Khung cảnh sơn tự về đêm tĩnh mịch với ánh trăng rằm và muôn ngọn đèn hoa đăng lung linh.',
    pos: { x: 0, y: 0.42, z: 18 },
    actionKey: 'NIGHT',
  },
];

// ==========================================
// BỒ ĐOÀN THIỀN TỌA TẠI ĐẠI HÙNG BẢO ĐIỆN (SANCTUARY CUSHIONS)
// 12 bồ đoàn nhung đỏ xếp ngăn nắp hai bên lối đi thảm đỏ
// ==========================================
export const SANCTUARY_CUSHIONS: Array<{ x: number; y: number; z: number }> = [
  // Hàng chính giữa sát lối đi thảm đỏ & chân cột (cushionRows: 4.6 -> Z = -11.4; cushionCols: 2.5, -2.5)
  { x: 2.5, y: 3.38, z: -11.4 },  // Bồ đoàn mẫu trong hình ảnh (bên phải thảm đỏ, cạnh chân cột)
  { x: -2.5, y: 3.38, z: -11.4 }, // Bồ đoàn đối xứng bên trái thảm đỏ
  { x: 2.5, y: 3.38, z: -13.4 },  // Hàng trên gần bục Phật Tổ
  { x: -2.5, y: 3.38, z: -13.4 },
  { x: 2.5, y: 3.38, z: -9.4 },   // Hàng dưới gần cửa ra vào
  { x: -2.5, y: 3.38, z: -9.4 },
  { x: 4.6, y: 3.38, z: -11.4 },  // Dãy ngoài bên phải
  { x: -4.6, y: 3.38, z: -11.4 }, // Dãy ngoài bên trái
  { x: 4.6, y: 3.38, z: -13.4 },
  { x: -4.6, y: 3.38, z: -13.4 },
  { x: 4.6, y: 3.38, z: -9.4 },
  { x: -4.6, y: 3.38, z: -9.4 },
];

export function getTargetMeditationCushion(playerX: number, playerZ: number): { x: number; y: number; z: number } {
  let closest = SANCTUARY_CUSHIONS[0];
  let minD = Infinity;
  for (const c of SANCTUARY_CUSHIONS) {
    const d = Math.hypot(c.x - playerX, c.z - playerZ);
    if (d < minD) {
      minD = d;
      closest = c;
    }
  }
  return closest;
}
