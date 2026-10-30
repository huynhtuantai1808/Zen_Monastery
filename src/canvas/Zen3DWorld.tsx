import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { soundEngine } from '../services/audioEngine';
import type { CharacterAppearance } from '../types/game';
import { loadRealisticCharacter } from '../services/characterLoader';
import {
  Play,
  Pause,
  Eye,
  Footprints,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  MapPin,
  RotateCcw,
  Moon,
  Sun,
  Layers,
  Sparkles,
  Music
} from 'lucide-react';

interface Zen3DWorldProps {
  character: CharacterAppearance;
  level: number;
  timePhase: 'MORNING' | 'AFTERNOON' | 'EVENING';
  isRaining: boolean;
  onOpenSweeping: () => void;
  onOpenTeaHouse: () => void;
  onOpenDharma: () => void;
  onOpenWoodChopping: () => void;
  onOpenWaterCarrying: () => void;
  onOpenAltarCleaning: () => void;
  onOpenCharity: () => void;
  onAddMerit: (amount: number, x: number, y: number, label?: string) => void;
  spendStamina: (amount: number) => boolean;
}

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
  { type: 'circle', x: -8.0, z: 34.0, r: 0.85, name: 'Courtyard Lantern 1' },
  { type: 'circle', x: 8.0, z: 34.0, r: 0.85, name: 'Courtyard Lantern 2' },
  { type: 'circle', x: -14.0, z: 18.0, r: 0.85, name: 'Courtyard Lantern 3' },
  { type: 'circle', x: 14.0, z: 18.0, r: 0.85, name: 'Courtyard Lantern 4' },

  // 3. Bảo Tháp Men Ngọc (Zone 3 Pagoda) - Central tower body & terrace outer balustrades
  { type: 'box', minX: 33.1, maxX: 42.9, minZ: -24.9, maxZ: -15.1, name: 'Pagoda Body' },
  { type: 'box', minX: 31.2, maxX: 44.8, minZ: -26.8, maxZ: -26.2, name: 'Pagoda Rail North' },
  { type: 'box', minX: 44.2, maxX: 44.8, minZ: -26.8, maxZ: -13.2, name: 'Pagoda Rail East' },
  { type: 'box', minX: 31.2, maxX: 31.8, minZ: -26.8, maxZ: -13.2, name: 'Pagoda Rail West' },
  { type: 'box', minX: 31.2, maxX: 36.0, minZ: -13.6, maxZ: -13.0, name: 'Pagoda Rail South L' },
  { type: 'box', minX: 40.0, maxX: 44.8, minZ: -13.6, maxZ: -13.0, name: 'Pagoda Rail South R' },

  // 4. Lầu Chuông (Zone 4 Bell Tower) - Columns, Great Bell & Bronze Drum
  { type: 'circle', x: -29.6, z: -23.6, r: 0.55, name: 'Bell Col 1' },
  { type: 'circle', x: -29.6, z: -16.4, r: 0.55, name: 'Bell Col 2' },
  { type: 'circle', x: -22.4, z: -23.6, r: 0.55, name: 'Bell Col 3' },
  { type: 'circle', x: -22.4, z: -16.4, r: 0.55, name: 'Bell Col 4' },
  { type: 'circle', x: -26.0, z: -20.0, r: 1.7, name: 'Great Bell' },
  { type: 'circle', x: -29.0, z: -22.4, r: 1.35, name: 'Bell Drum' },

  // 5. Hiên Nước & Suối Ngọc (Zone 5 On Rainy Days) - Tatami deck & bridge fully walkable, water blocked
  { type: 'box', minX: -26.0, maxX: -13.0, minZ: 38.0, maxZ: 47.0, name: 'Stream Water North' },
  { type: 'box', minX: -26.0, maxX: -13.0, minZ: 25.0, maxZ: 34.0, name: 'Stream Water South' },
  { type: 'box', minX: -39.0, maxX: -13.0, minZ: 46.5, maxZ: 47.5, name: 'Stream North Rim' },
  { type: 'box', minX: -39.0, maxX: -13.0, minZ: 24.5, maxZ: 25.5, name: 'Stream South Rim' },
  { type: 'box', minX: -39.0, maxX: -38.0, minZ: 25.0, maxZ: 47.0, name: 'Stream West Wall' },

  // 6. Dãy Hành Lang Cột Gỗ (Zone 6 Corridor) - Side wooden columns (center aisle open)
  { type: 'circle', x: 15.4, z: -3.0, r: 0.45 },
  { type: 'circle', x: 20.6, z: -3.0, r: 0.45 },
  { type: 'circle', x: 15.4, z: 2.5, r: 0.45 },
  { type: 'circle', x: 20.6, z: 2.5, r: 0.45 },
  { type: 'circle', x: 15.4, z: 8.0, r: 0.45 },
  { type: 'circle', x: 20.6, z: 8.0, r: 0.45 },
  { type: 'circle', x: 15.4, z: 13.5, r: 0.45 },
  { type: 'circle', x: 20.6, z: 13.5, r: 0.45 },
  { type: 'circle', x: 15.4, z: 19.0, r: 0.45 },
  { type: 'circle', x: 20.6, z: 19.0, r: 0.45 },
  { type: 'circle', x: 15.4, z: 24.5, r: 0.45 },
  { type: 'circle', x: 20.6, z: 24.5, r: 0.45 },
  { type: 'circle', x: 15.4, z: 27.0, r: 0.45 },
  { type: 'circle', x: 20.6, z: 27.0, r: 0.45 },

  // 7. Đại Hùng Bảo Điện (Zone 7 Main Sanctuary)
  // Ground Level: Front retaining walls (Staircases at [-2.6, 2.6], [-10.6, -7.0], [7.0, 10.6] open)
  { type: 'box', minX: -23.0, maxX: -10.6, minZ: -1.0, maxZ: 1.0, maxY: 2.2, name: 'Podium Front L1' },
  { type: 'box', minX: -7.0, maxX: -2.6, minZ: -1.0, maxZ: 1.0, maxY: 2.2, name: 'Podium Front L2' },
  { type: 'box', minX: 2.6, maxX: 7.0, minZ: -1.0, maxZ: 1.0, maxY: 2.2, name: 'Podium Front R1' },
  { type: 'box', minX: 10.6, maxX: 23.0, minZ: -1.0, maxZ: 1.0, maxY: 2.2, name: 'Podium Front R2' },
  { type: 'box', minX: -23.0, maxX: -21.4, minZ: -33.0, maxZ: -1.0, maxY: 2.2, name: 'Podium Side L' },
  { type: 'box', minX: 21.4, maxX: 23.0, minZ: -33.0, maxZ: -1.0, maxY: 2.2, name: 'Podium Side R' },
  { type: 'box', minX: -23.0, maxX: 23.0, minZ: -33.5, maxZ: -31.5, maxY: 2.2, name: 'Podium Rear' },

  // Upper Level: Perimeter building walls (3 entrance doors open) & Buddha Altar
  { type: 'box', minX: -16.2, maxX: 16.2, minZ: -27.3, maxZ: -26.7, minY: 2.0, name: 'Sanctuary Rear Wall' },
  { type: 'box', minX: -16.3, maxX: -15.7, minZ: -27.3, maxZ: -4.8, minY: 2.0, name: 'Sanctuary Left Wall' },
  { type: 'box', minX: 15.7, maxX: 16.3, minZ: -27.3, maxZ: -4.8, minY: 2.0, name: 'Sanctuary Right Wall' },
  { type: 'box', minX: -16.0, maxX: -6.4, minZ: -5.3, maxZ: -4.7, minY: 2.0, name: 'Sanctuary Front Wall L' },
  { type: 'box', minX: -3.0, maxX: -2.0, minZ: -5.3, maxZ: -4.7, minY: 2.0, name: 'Sanctuary Front Wall ML' },
  { type: 'box', minX: 2.0, maxX: 3.0, minZ: -5.3, maxZ: -4.7, minY: 2.0, name: 'Sanctuary Front Wall MR' },
  { type: 'box', minX: 6.4, maxX: 16.0, minZ: -5.3, maxZ: -4.7, minY: 2.0, name: 'Sanctuary Front Wall R' },
  // Buddha Altar (Cannot walk through holy statue)
  { type: 'box', minX: -4.5, maxX: 4.5, minZ: -23.5, maxZ: -19.5, minY: 2.0, name: 'Buddha Altar' },

  // Side pavilions columns
  { type: 'circle', x: -21.9, z: -5.9, r: 0.45, minY: 2.0 },
  { type: 'circle', x: -21.9, z: -1.1, r: 0.45, minY: 2.0 },
  { type: 'circle', x: -17.1, z: -5.9, r: 0.45, minY: 2.0 },
  { type: 'circle', x: -17.1, z: -1.1, r: 0.45, minY: 2.0 },
  { type: 'circle', x: 17.1, z: -5.9, r: 0.45, minY: 2.0 },
  { type: 'circle', x: 17.1, z: -1.1, r: 0.45, minY: 2.0 },
  { type: 'circle', x: 21.9, z: -5.9, r: 0.45, minY: 2.0 },
  { type: 'circle', x: 21.9, z: -1.1, r: 0.45, minY: 2.0 },

  // 8. Phòng Thiền Nguyệt Môn (Zone 8 Meditation) - Moon wall (center circular opening open)
  { type: 'box', minX: -31.5, maxX: -26.2, minZ: -0.5, maxZ: 0.1, name: 'Moon Wall L' },
  { type: 'box', minX: -21.8, maxX: -16.5, minZ: -0.5, maxZ: 0.1, name: 'Moon Wall R' },

  // 9. Tàng Kinh Các (Zone 9 Library) - 3 Bookshelves (aisles open)
  { type: 'box', minX: 17.5, maxX: 30.5, minZ: -0.6, maxZ: 0.6, name: 'Library Shelf 1' },
  { type: 'box', minX: 17.5, maxX: 30.5, minZ: 5.4, maxZ: 6.6, name: 'Library Shelf 2' },
  { type: 'box', minX: 17.5, maxX: 30.5, minZ: 11.4, maxZ: 12.6, name: 'Library Shelf 3' },

  // 10. Sân Sau (Zone 10 Back Garden) - Ancient well, kitchen & stone arch posts
  { type: 'circle', x: 11.0, z: -46.0, r: 1.7, name: 'Ancient Well' },
  { type: 'box', minX: -21.8, maxX: -10.2, minZ: -52.0, maxZ: -44.0, name: 'Kitchen House' },
  { type: 'box', minX: -3.3, maxX: -1.9, minZ: -30.8, maxZ: -29.2, name: 'Stone Arch Post L' },
  { type: 'box', minX: 1.9, maxX: 3.3, minZ: -30.8, maxZ: -29.2, name: 'Stone Arch Post R' },
];

/**
 * Resolves character position against monastery obstacle geometry.
 * Returns the adjusted (x, z) coordinates with smooth surface sliding.
 */
export function resolveMonkCollision(
  px: number,
  py: number,
  pz: number,
  bodyRadius: number = MONK_COLLISION_RADIUS
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

  return { x: curX, z: curZ };
}

/**
 * Accurately determines the true floor elevation (Y) at coordinate (x, z)
 * across all multi-tier podiums, grand staircases, indoor halls, pavilions, and bridges.
 */
export function getTerrainFloorElevation(x: number, z: number, currentY: number = 0.42): number {
  // 1. Đại Hùng Bảo Điện (Zone 7 Main Sanctuary Complex)
  // Sanctuary complex centered at (0, -16), podium spans X in [-22.5, 22.5], Z in [-34.0, 5.5]
  if (x >= -22.5 && x <= 22.5 && z >= -34.0 && z <= 5.5) {
    const isCenterStair = Math.abs(x) <= 2.8;
    const isLeftStair = x >= -10.8 && x <= -6.8;
    const isRightStair = x >= 6.8 && x <= 10.8;

    // Climbing the 3 grand parallel staircases (Z from 5.5 down to -0.5)
    if ((isCenterStair || isLeftStair || isRightStair) && z >= -0.5 && z <= 5.5) {
      const t = Math.max(0.0, Math.min(1.0, (5.5 - z) / 6.0));
      return 0.42 + t * (3.30 - 0.42);
    }

    // Upper Terrace & Indoor Sanctuary Hall
    if (z <= -0.5) {
      // 2nd Floor Balcony (Lầu Gác)
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

  // 3. Lầu Chuông (Zone 4 Bell Tower at -26, -20)
  if (x >= -31.5 && x <= -20.5 && z >= -25.5 && z <= -14.5) {
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

  // 6. Tàng Kinh Các (Zone 9 Library at 24, 6)
  if (x >= 15.5 && x <= 32.5 && z >= -1.0 && z <= 13.0) {
    return 0.49;
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
    name: '4. Lầu Chuông (Nội thất)',
    subtitle: 'Đại Hồng Chung bằng đồng & Trống Bát Nhã',
    dimensions: '14 × 14 m',
    icon: '🔔',
    desc: 'Lầu chuông gỗ lim cổ kính với Đại Hồng Chung treo quai rồng và chày kình gõ chuông.',
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
    subtitle: 'Dãy hành lang dài nối các khu • Đèn lồng đỏ',
    dimensions: '36 × 6 m',
    icon: '🏮',
    desc: 'Dãy hành lang cột gỗ lim song song với vì kèo chạm trổ và hàng đèn lồng đỏ ấm áp.',
    pos: { x: 18, y: 0.42, z: 12 },
    actionKey: 'CORRIDOR',
  },
  {
    id: 'sanctuary',
    name: '7. Đại Hùng Bảo Điện (Tòa Chính)',
    subtitle: 'Chính điện trùng thiềm điệp ốc • Hệ tam cấp & Đại Tượng Phật',
    dimensions: '46 × 36 m',
    icon: '🏛️',
    desc: 'Tòa chính điện quy mô tráng lệ theo bản vẽ phát thảo: nền tam cấp cao ráo với 3 lối cầu thang đá chạm rồng, hai lầu đình tả hữu, hệ mái trùng thiềm điệp ốc ngói men ngọc và Đại Tượng Phật Thích Ca hoàng kim.',
    pos: { x: 0, y: 3.30, z: -12 },
    actionKey: 'SANCTUARY',
  },
  {
    id: 'meditation',
    name: '8. Phòng Thiền (Tịnh tu)',
    subtitle: 'Cửa sổ tròn Nguyệt Môn & chiếu tatami bồ đoàn',
    dimensions: '16 × 14 m',
    icon: '🧘',
    desc: 'Không gian tĩnh mịch với cửa sổ tròn nan gỗ nhìn ra rừng trúc, bồ đoàn tĩnh tọa an nhiên.',
    pos: { x: -24, y: 0.49, z: 6 },
    actionKey: 'MEDITATION',
  },
  {
    id: 'library',
    name: '9. Phòng Kinh Sách (Lưu trữ)',
    subtitle: 'Tàng Kinh Các • Kệ sách cổ & bàn trà thư pháp',
    dimensions: '18 × 15 m',
    icon: '📜',
    desc: 'Tàng Kinh Các lưu giữ kinh điển, giá sách chạm trần, nghiên mực và ấm trà gốm mộc mạc.',
    pos: { x: 24, y: 0.49, z: 3.2 },
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
// STYLIZED TOON / HAND-PAINTED TEXTURE GENERATORS
// ==========================================
function createStylizedWoodTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#6d3917';
  ctx.fillRect(0, 0, 256, 256);

  // Soft stylized wood grain ribbons
  for (let y = 0; y < 256; y += 12) {
    ctx.fillStyle = y % 24 === 0 ? '#542b10' : '#85471e';
    ctx.fillRect(0, y, 256, 6);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStylizedBrickTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(0, 0, 256, 256);

  // Stylized terracotta tile grid
  const s = 64;
  for (let x = 0; x < 256; x += s) {
    for (let y = 0; y < 256; y += s) {
      ctx.fillStyle = (x + y) % (s * 2) === 0 ? '#ea580c' : '#c2410c';
      ctx.fillRect(x + 3, y + 3, s - 6, s - 6);
      // Soft stylized corner bevel
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(x + 4, y + 4, 6, 6);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStylizedRoofTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(0, 0, 256, 256);

  // Chunky stylized roof tiles
  const colW = 32;
  for (let x = 0; x < 256; x += colW) {
    const grad = ctx.createLinearGradient(x, 0, x + colW, 0);
    grad.addColorStop(0, '#591a08');
    grad.addColorStop(0.5, '#ea580c');
    grad.addColorStop(1, '#431407');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, colW, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStylizedStoneTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#78716c';
  ctx.fillRect(0, 0, 256, 256);

  // Stylized cobble pavers with moss edges
  for (let i = 0; i < 30; i++) {
    const cx = (i % 5) * 52 + 10;
    const cy = Math.floor(i / 5) * 44 + 8;
    ctx.fillStyle = '#a8a29e';
    ctx.beginPath();
    ctx.roundRect(cx, cy, 40, 34, 10);
    ctx.fill();

    // Moss patch on stone
    if (i % 3 === 0) {
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(cx + 8, cy + 8, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStylizedJadeRoofTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  // Jade emerald glazed base
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, 0, 256, 256);

  // Cylindrical glazed tile tubes (ngói ống men ngọc lưu ly)
  const colW = 28;
  for (let x = 0; x < 256; x += colW) {
    const grad = ctx.createLinearGradient(x, 0, x + colW, 0);
    grad.addColorStop(0, '#022c22');     // deep shadow groove
    grad.addColorStop(0.18, '#065f46');  // emerald tile body
    grad.addColorStop(0.45, '#10b981');  // jade green vibrant tone
    grad.addColorStop(0.65, '#6ee7b7');  // bright glazed ceramic specular highlight
    grad.addColorStop(0.85, '#059669');  // jade mid-tone
    grad.addColorStop(1, '#022c22');     // joint shadow
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, colW, 256);

    // Overlapping tile lip horizontal seams
    for (let y = 0; y < 256; y += 32) {
      ctx.fillStyle = 'rgba(2, 44, 34, 0.45)';
      ctx.fillRect(x, y, colW, 4);
      ctx.fillStyle = 'rgba(167, 243, 208, 0.35)';
      ctx.fillRect(x, y + 4, colW, 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStylizedAmberWoodTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, 256, 256);

  // Warm sandalwood grain ribbons
  for (let y = 0; y < 256; y += 10) {
    ctx.fillStyle = y % 20 === 0 ? '#92400e' : '#d97706';
    ctx.fillRect(0, y, 256, 5);
    if (y % 40 === 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, y + 2, 256, 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStylizedLotusPlinthTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 0, 256, 256);

  // Lotus petal relief carving pattern
  const pw = 42;
  const ph = 64;
  for (let y = 0; y < 256; y += ph) {
    for (let x = 0; x < 256; x += pw) {
      // Petal back
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(x + pw / 2, y + 4);
      ctx.quadraticCurveTo(x + pw - 2, y + ph / 2, x + pw / 2, y + ph - 4);
      ctx.quadraticCurveTo(x + 2, y + ph / 2, x + pw / 2, y + 4);
      ctx.fill();

      // Petal highlight
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(x + pw / 2, y + 8);
      ctx.quadraticCurveTo(x + pw - 8, y + ph / 2, x + pw / 2, y + ph - 8);
      ctx.quadraticCurveTo(x + 8, y + ph / 2, x + pw / 2, y + 8);
      ctx.fill();

      // Golden center rib
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(x + pw / 2 - 1, y + 10, 2, ph - 24);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export const Zen3DWorld: React.FC<Zen3DWorldProps> = ({
  character,
  timePhase,
  isRaining,
  onOpenSweeping,
  onOpenTeaHouse,
  onOpenDharma,
  onOpenWoodChopping,
  onOpenWaterCarrying,
  onOpenAltarCleaning,
  onOpenCharity,
  onAddMerit,
  spendStamina,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const [currentZone, setCurrentZone] = useState<TempleZoneInfo>(TEMPLE_ZONES[0]);
  const [zoneBanner, setZoneBanner] = useState<TempleZoneInfo | null>(null);
  const [nearInteractions, setNearInteractions] = useState<{ title: string; action: () => void; icon: string }[]>([]);
    const [currentBuilding, setCurrentBuilding] = useState<string | null>(null);
  const [isNightMode, setIsNightMode] = useState<boolean>(timePhase === 'EVENING');

  // Camera Mode: 'THIRD_PERSON' (Panoramic) vs 'ISOMETRIC' (Top-down) vs 'ON_RAINY_DAYS' (Aesthetic overhead deck & stream)
  const [cameraMode, setCameraMode] = useState<'ISOMETRIC' | 'THIRD_PERSON' | 'ON_RAINY_DAYS'>('THIRD_PERSON');
  const cameraModeRef = useRef<'ISOMETRIC' | 'THIRD_PERSON' | 'ON_RAINY_DAYS'>('THIRD_PERSON');

  // Character Relaxation Pose on the deck: 'STAND' | 'LIE_DOWN' | 'SIT_EDGE'
  const [monkPose, setMonkPose] = useState<'STAND' | 'LIE_DOWN' | 'SIT_EDGE'>('STAND');
  const monkPoseRef = useRef<'STAND' | 'LIE_DOWN' | 'SIT_EDGE'>('STAND');
  const fanBladesRef = useRef<THREE.Group | null>(null);

  // State change trackers
  const isWalkingStateRef = useRef<boolean>(false);
  const currentBuildingStateRef = useRef<string | null>(null);
  const currentZoneIdRef = useRef<string>(TEMPLE_ZONES[0].id);

  // Third-Person Panoramic Eye-Level Camera Parameters (Can look all the way UP at sky & pagoda)
  const cameraYawRef = useRef<number>(0); // 0 = Facing forward into monastery grounds towards north
  const cameraPitchRef = useRef<number>(-0.12); // Slightly looking up/level, showing surroundings & pagoda
  const cameraDistRef = useRef<number>(6.5); // Natural distance behind monk
  const cameraLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.6, 58));
  const isDraggingOrbitRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse Cursor Aiming & Ground Tracking Refs
  const cursorScreenPosRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const cursorGroundPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.25, 70));
  const hasGroundTargetRef = useRef<boolean>(false);
  const cursorMarkerGroupRef = useRef<THREE.Group | null>(null);
  const stuckCountRef = useRef<number>(0);

  // Callback props ref
  const propsRef = useRef({
    onOpenSweeping,
    onOpenTeaHouse,
    onOpenDharma,
    onOpenWoodChopping,
    onOpenWaterCarrying,
    onOpenAltarCleaning,
    onOpenCharity,
    onAddMerit,
    spendStamina,
    character,
    timePhase,
    isRaining,
  });
  propsRef.current = {
    onOpenSweeping,
    onOpenTeaHouse,
    onOpenDharma,
    onOpenWoodChopping,
    onOpenWaterCarrying,
    onOpenAltarCleaning,
    onOpenCharity,
    onAddMerit,
    spendStamina,
    character,
    timePhase,
    isRaining,
  };

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const tourIndexRef = useRef<number>(0);
  const tourWaitRef = useRef<number>(0);
  const isTourPlayingRef = useRef<boolean>(false);

  // Character 3D Rig Refs
  const monkGroupRef = useRef<THREE.Group | null>(null);
  const monkTorsoRef = useRef<THREE.Group | null>(null);
  const monkHeadRef = useRef<THREE.Group | null>(null);
  const monkLeftLegRef = useRef<THREE.Group | null>(null);
  const monkRightLegRef = useRef<THREE.Group | null>(null);
  const monkLeftArmRef = useRef<THREE.Group | null>(null);
  const monkRightArmRef = useRef<THREE.Group | null>(null);

  // Realistic Skinned Character & Animation Refs
  const charMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const charActionsRef = useRef<{ walk?: THREE.AnimationAction; idle?: THREE.AnimationAction; sit?: THREE.AnimationAction }>({});
  const currentActionRef = useRef<string>('idle');
  const realisticModelLoadedRef = useRef<boolean>(false);
  const realisticModelRef = useRef<THREE.Group | null>(null);

  const playerPosRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0.42, z: 80 });
  const targetPosRef = useRef<{ x: number; y?: number; z: number } | null>({ x: 0, z: 66 });
  const walkPhaseRef = useRef<number>(0);
  const isWalkingRef = useRef<boolean>(true);
  const playerRotationRef = useRef<number>(Math.PI);
  const lotusFootstepsRef = useRef<{ mesh: THREE.Mesh; life: number }[]>([]);

  // Directional Input State
  const keysPressedRef = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Roof Groups for Indoor Occlusion Fading
  const sanctuaryRoofsRef = useRef<THREE.Group[]>([]);
  const meditationRoofsRef = useRef<THREE.Group[]>([]);
  const libraryRoofsRef = useRef<THREE.Group[]>([]);
  const bellRoofsRef = useRef<THREE.Group[]>([]);

  // Environment Animated objects refs
  const bellMeshRef = useRef<THREE.Mesh | null>(null);
  const bellRingingTimerRef = useRef<number>(0);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const spiritParticlesRef = useRef<THREE.Points | null>(null);
  const koiFishListRef = useRef<{ mesh: THREE.Group; angle: number; speed: number; radius: number }[]>([]);
  const bambooLeavesRef = useRef<THREE.Group[]>([]);
  const destinationMarkerRef = useRef<THREE.Group | null>(null);
  const nightLightsRef = useRef<THREE.PointLight[]>([]);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Dedicated sound trigger: Bell ONLY rings when requested at Bell Tower
  const handleRingBell = useCallback(() => {
    soundEngine.playDistantEchoBell(1, 0.85);
    bellRingingTimerRef.current = 80;
    onAddMerit(25, 50, 40, '🔔 Hồng Chung Ngân Vang Đỉnh Núi');
  }, [onAddMerit]);

  const handleFeedKoiFish = useCallback(() => {
    if (!spendStamina(5)) return;
    soundEngine.playWoodenFish();
    onAddMerit(20, 50, 40, '🪷 Phóng Sinh Đàn Cá Koi');
  }, [spendStamina, onAddMerit]);

  useEffect(() => {
    isTourPlayingRef.current = isTourPlaying;
  }, [isTourPlaying]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  // Load / Reload Realistic Skinned 3D Character when customization changes
  useEffect(() => {
    if (!monkGroupRef.current) return;
    let cancelled = false;

    loadRealisticCharacter(character).then((rig) => {
      if (cancelled) return;
      charMixerRef.current = rig.mixer;
      charActionsRef.current = rig.actions;
      rig.actions.idle.play();
      currentActionRef.current = 'idle';

      // Hide procedural placeholder blocks
      if (monkTorsoRef.current) monkTorsoRef.current.visible = false;
      if (monkLeftLegRef.current) monkLeftLegRef.current.visible = false;
      if (monkRightLegRef.current) monkRightLegRef.current.visible = false;

      // Remove previous realistic model if any
      if (realisticModelRef.current) {
        monkGroupRef.current?.remove(realisticModelRef.current);
      }
      realisticModelRef.current = rig.modelGroup;
      monkGroupRef.current?.add(rig.modelGroup);
      realisticModelLoadedRef.current = true;
    }).catch((err) => {
      console.warn('Procedural fallback used:', err);
    });

    return () => {
      cancelled = true;
    };
  }, [character]);

  // Toggle Camera Mode: 3rd-Person Eye-Level vs On Rainy Days Top-Down vs Isometric
  const toggleCameraMode = () => {
    setCameraMode((prev) => {
      let next: 'ISOMETRIC' | 'THIRD_PERSON' | 'ON_RAINY_DAYS' = 'THIRD_PERSON';
      if (prev === 'THIRD_PERSON') {
        next = 'ON_RAINY_DAYS';
      } else if (prev === 'ON_RAINY_DAYS') {
        next = 'ISOMETRIC';
        cameraPitchRef.current = 0.86;
        cameraDistRef.current = 24.0;
        cameraYawRef.current = Math.PI * 0.78;
      } else {
        next = 'THIRD_PERSON';
        cameraPitchRef.current = -0.12;
        cameraDistRef.current = 6.5;
        cameraYawRef.current = 0;
      }
      cameraModeRef.current = next;
      return next;
    });
  };

  // Navigate character to a specific zone (Silent on click)
  const navigateToZone = (zone: TempleZoneInfo) => {
    const floorY = getTerrainFloorElevation(zone.pos.x, zone.pos.z, zone.pos.y ?? 0.42);
    targetPosRef.current = { x: zone.pos.x, y: floorY, z: zone.pos.z };
        setIsTourPlaying(false);
    isTourPlayingRef.current = false;

    if (zone.actionKey === 'NIGHT') {
      setIsNightMode(true);
    } else if (zone.actionKey === 'AERIAL') {
      cameraDistRef.current = 32.0;
      cameraPitchRef.current = 0.95;
    }

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.position.set(zone.pos.x, floorY + 0.08, zone.pos.z);
      destinationMarkerRef.current.visible = true;
    }
  };

  const toggleTour = () => {
    if (isTourPlaying) {
      setIsTourPlaying(false);
      isTourPlayingRef.current = false;
    } else {
      setIsTourPlaying(true);
      isTourPlayingRef.current = true;
      const nextIdx = (tourIndexRef.current + 1) % TEMPLE_ZONES.length;
      tourIndexRef.current = nextIdx;
      const nextZone = TEMPLE_ZONES[nextIdx];
      const floorY = getTerrainFloorElevation(nextZone.pos.x, nextZone.pos.z, nextZone.pos.y ?? 0.42);
      targetPosRef.current = { x: nextZone.pos.x, y: floorY, z: nextZone.pos.z };
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.position.set(nextZone.pos.x, floorY + 0.08, nextZone.pos.z);
        destinationMarkerRef.current.visible = true;
      }
    }
  };

  const restartFromGate = () => {
    playerPosRef.current = { x: 0, y: 0.42, z: 80 };
    targetPosRef.current = { x: 0, y: 0.42, z: 66 };
    tourIndexRef.current = 0;
    tourWaitRef.current = 0;
    setIsTourPlaying(false);
    isTourPlayingRef.current = false;
        if (cameraModeRef.current === 'THIRD_PERSON') {
      cameraPitchRef.current = -0.12;
      cameraDistRef.current = 6.5;
      cameraYawRef.current = 0;
    } else {
      cameraPitchRef.current = 0.86;
      cameraDistRef.current = 24.0;
      cameraYawRef.current = Math.PI * 0.78;
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.position.set(0, 0.35, 66);
      destinationMarkerRef.current.visible = true;
    }
  };

  const handleDirectionStart = (dir: 'up' | 'down' | 'left' | 'right') => {
    keysPressedRef.current[dir] = true;
    targetPosRef.current = null;
    if (destinationMarkerRef.current) destinationMarkerRef.current.visible = false;
  };

  const handleDirectionEnd = (dir: 'up' | 'down' | 'left' | 'right') => {
    keysPressedRef.current[dir] = false;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') handleDirectionStart('up');
      if (code === 'KeyS' || code === 'ArrowDown') handleDirectionStart('down');
      if (code === 'KeyA' || code === 'ArrowLeft') handleDirectionStart('left');
      if (code === 'KeyD' || code === 'ArrowRight') handleDirectionStart('right');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') handleDirectionEnd('up');
      if (code === 'KeyS' || code === 'ArrowDown') handleDirectionEnd('down');
      if (code === 'KeyA' || code === 'ArrowLeft') handleDirectionEnd('left');
      if (code === 'KeyD' || code === 'ArrowRight') handleDirectionEnd('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update Day / Night Atmosphere
  useEffect(() => {
    if (!sceneRef.current || !sunLightRef.current || !ambientLightRef.current || !hemiLightRef.current) return;
    const scene = sceneRef.current;
    const isNight = isNightMode;

    if (isNight) {
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.0065);
      ambientLightRef.current.intensity = 0.35;
      ambientLightRef.current.color.setHex(0x38bdf8);
      hemiLightRef.current.intensity = 0.32;
      hemiLightRef.current.color.setHex(0x60a5fa);
      hemiLightRef.current.groundColor.setHex(0x020617);

      sunLightRef.current.color.setHex(0x93c5fd);
      sunLightRef.current.intensity = 0.75;
      sunLightRef.current.position.set(40, 85, -50);

      nightLightsRef.current.forEach((light) => {
        light.intensity = 1.8;
        light.distance = 18;
      });
    } else {
      // Warm whimsical Ghibli/Zelda daytime atmosphere
      scene.background = new THREE.Color(0xbfdbfe);
      scene.fog = new THREE.FogExp2(0xdbeafe, 0.0035);
      ambientLightRef.current.intensity = 0.85;
      ambientLightRef.current.color.setHex(0xfef3c7);
      hemiLightRef.current.intensity = 0.75;
      hemiLightRef.current.color.setHex(0xfde68a);
      hemiLightRef.current.groundColor.setHex(0x22c55e);

      sunLightRef.current.color.setHex(0xffedd5);
      sunLightRef.current.intensity = 1.95;
      sunLightRef.current.position.set(55, 95, 45);

      nightLightsRef.current.forEach((light) => {
        light.intensity = 0.45;
        light.distance = 10;
      });
    }
  }, [isNightMode]);

  // Main Three.js Scene Setup (Mounts once)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Stylized Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfdbfe);
    scene.fog = new THREE.FogExp2(0xdbeafe, 0.0035);
    sceneRef.current = scene;

    // 2. Camera with Generous FOV for Panoramic Surrounding View
    const camera = new THREE.PerspectiveCamera(54, width / height, 0.5, 650);
    camera.position.set(0, 2.8, 86.5);
    cameraRef.current = camera;

    // 3. Renderer with soft shadow maps and vibrant tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Stylized Lighting Rig
    const ambLight = new THREE.AmbientLight(0xfef3c7, 0.85);
    scene.add(ambLight);
    ambientLightRef.current = ambLight;

    const hemiLight = new THREE.HemisphereLight(0xfde68a, 0x22c55e, 0.75);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.95);
    sunLight.position.set(55, 95, 45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.left = -80;
    sunLight.shadow.camera.right = 80;
    sunLight.shadow.camera.top = 80;
    sunLight.shadow.camera.bottom = -80;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Glowing Moon in Night Sky
    const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
    moonMesh.position.set(80, 110, -140);
    scene.add(moonMesh);

    // 5. Stylized Hand-Crafted Textures & Authentic Architecture Materials
    const texWood = createStylizedWoodTexture();
    texWood.repeat.set(2, 4);
    const texBrick = createStylizedBrickTexture();
    texBrick.repeat.set(8, 8);
    const texRoof = createStylizedRoofTexture();
    texRoof.repeat.set(3, 6);
    const texStone = createStylizedStoneTexture();
    texStone.repeat.set(4, 4);

    // Authentic Jade Glazed Tiles & Amber Sandalwood from Reference Drawing
    const texJadeRoof = createStylizedJadeRoofTexture();
    texJadeRoof.repeat.set(3, 4);
    const texAmberWood = createStylizedAmberWoodTexture();
    texAmberWood.repeat.set(2, 4);
    const texLotusPlinth = createStylizedLotusPlinthTexture();
    texLotusPlinth.repeat.set(4, 2);

    const matGrass = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 });
    const matWoodLim = new THREE.MeshStandardMaterial({ map: texWood, roughness: 0.65 });
    const matWoodWarm = new THREE.MeshStandardMaterial({ map: texWood, color: 0xb45309, roughness: 0.65 });
    const matDarkTimber = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    const matAmberWood = new THREE.MeshStandardMaterial({ map: texAmberWood, roughness: 0.55 });
    const matLotusPlinth = new THREE.MeshStandardMaterial({ map: texLotusPlinth, roughness: 0.65 });

    // Signature Jade Green Glazed Ceramic Tile with Specular Sheen (Ngói lưu ly men ngọc)
    const matJadeRoofTile = new THREE.MeshStandardMaterial({
      map: texJadeRoof,
      roughness: 0.32,
      metalness: 0.18,
      transparent: true,
      opacity: 1.0,
    });
    const matRoofTile = matJadeRoofTile; // Harmonize all monastery roofs with signature jade-green glazed tiles
    const matTileBrick = new THREE.MeshStandardMaterial({ map: texBrick, roughness: 0.7 });
    const matStoneGrey = new THREE.MeshStandardMaterial({ map: texStone, roughness: 0.8 });
    const matBronze = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.75 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22, metalness: 0.88 });
    const matLanternRed = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.65, roughness: 0.5 });

    // 6. STYLIZED ISOMETRIC DIORAMA TERRAIN BASE
    const baseGeo = new THREE.BoxGeometry(140, 2.5, 180);
    const baseMesh = new THREE.Mesh(baseGeo, matGrass);
    baseMesh.position.set(0, -1.25, 5);
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Stylized Round Puffy Mountain Backdrop (Ghibli / Zelda Hillocks)
    const mtnGroup = new THREE.Group();
    for (let m = 0; m < 10; m++) {
      const angle = (m / 10) * Math.PI * 2;
      const distM = 140 + Math.random() * 30;
      const mtn = new THREE.Mesh(
        new THREE.SphereGeometry(32 + Math.random() * 24, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.95 })
      );
      mtn.scale.set(1.4, 1.8, 1.4);
      mtn.position.set(Math.cos(angle) * distM, 15, Math.sin(angle) * distM);
      mtnGroup.add(mtn);
    }
    scene.add(mtnGroup);
    // Stylized Puffy White Clouds in Sky (prominent when looking up)
    const cloudGroup = new THREE.Group();
    const matCloud = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    for (let c = 0; c < 10; c++) {
      const cloud = new THREE.Group();
      for (let p = 0; p < 5; p++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(4.5 + Math.random() * 3, 8, 8),
          matCloud
        );
        puff.position.set((p - 2) * 4.8, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 4.2);
        puff.scale.set(1.4, 0.75, 1.1);
        cloud.add(puff);
      }
      const cAngle = (c / 10) * Math.PI * 2;
      const cDist = 50 + Math.random() * 45;
      cloud.position.set(Math.cos(cAngle) * cDist, 46 + Math.random() * 18, Math.sin(cAngle) * cDist);
      cloudGroup.add(cloud);
    }
    scene.add(cloudGroup);


    // [ZONE 1: CỔNG TAM QUAN]
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 66);
    for (const px of [-6.5, -2.2, 2.2, 6.5]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.62, 7.2, 12), matStoneGrey);
      col.position.set(px, 3.6, 0);
      col.castShadow = true;
      gateGroup.add(col);

      const lan = createStylizedStoneLantern(matStoneGrey);
      lan.position.set(px, 0.35, 1.6);
      gateGroup.add(lan);
    }

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 0.3), matGold);
    signBoard.position.set(0, 5.8, 0);
    gateGroup.add(signBoard);

    const gateRoof1 = createStylizedCurvedRoof(17, 7.2, matRoofTile);
    gateRoof1.position.set(0, 7.8, 0);
    gateGroup.add(gateRoof1);

    const gateRoof2 = createStylizedCurvedRoof(11, 5.2, matRoofTile);
    gateRoof2.position.set(0, 9.8, 0);
    gateGroup.add(gateRoof2);

    // Fluttering Buddhist flags
    for (const fx of [-7.2, 7.2]) {
      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 9.0, 8), matWoodWarm);
      flagPole.position.set(fx, 4.5, 1.2);
      gateGroup.add(flagPole);

      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.4, 1.8), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 }));
      flag.position.set(fx, 8.2, 2.0);
      gateGroup.add(flag);
    }
    scene.add(gateGroup);

    // [ZONE 2: SÂN CHÙA & ĐẠI LƯ HƯƠNG]
    const courtyardGroup = new THREE.Group();
    courtyardGroup.position.set(0, 0, 20);

    const courtFloor = new THREE.Mesh(new THREE.BoxGeometry(50, 0.35, 36), matTileBrick);
    courtFloor.position.set(0, 0.18, 0);
    courtFloor.receiveShadow = true;
    courtyardGroup.add(courtFloor);

    // Stylized Tripod Bronze Censer (Đại Lư Hương Tam Bảo)
    const censerGroup = new THREE.Group();
    censerGroup.position.set(0, 0.35, 2);

    const censerBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.0, 0.6, 16), matStoneGrey);
    censerBase.position.set(0, 0.3, 0);
    censerGroup.add(censerBase);

    for (let l = 0; l < 3; l++) {
      const ang = (l / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.2, 1.4, 8), matBronze);
      leg.position.set(Math.cos(ang) * 1.4, 0.9, Math.sin(ang) * 1.4);
      censerGroup.add(leg);
    }

    const censerCauldron = new THREE.Mesh(new THREE.SphereGeometry(2.1, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7), matBronze);
    censerCauldron.position.set(0, 2.1, 0);
    censerCauldron.castShadow = true;
    censerGroup.add(censerCauldron);

    for (const hx of [-2.3, 2.3]) {
      const ear = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.2, 8, 12), matBronze);
      ear.position.set(hx, 2.5, 0);
      ear.rotation.y = Math.PI / 2;
      censerGroup.add(ear);
    }
    courtyardGroup.add(censerGroup);

    // Puffy Stylized Bonsai Trees around courtyard
    const bonsaiCoords = [[-20, 13], [-20, -5], [20, 13], [20, -5], [-12, 15], [12, 15]];
    bonsaiCoords.forEach(([bx, bz]) => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.1, 1.1, 10), matStoneGrey);
      pot.position.set(bx, 0.85, bz);
      courtyardGroup.add(pot);

      const tree = createStylizedPuffyTree();
      tree.position.set(bx, 1.4, bz);
      tree.scale.set(0.65, 0.65, 0.65);
      courtyardGroup.add(tree);
    });

    // Courtyard stone lanterns
    const lanternCoords = [[-8, 14], [8, 14], [-14, -2], [14, -2]];
    lanternCoords.forEach(([lx, lz]) => {
      const lantern = createStylizedStoneLantern(matStoneGrey);
      lantern.position.set(lx, 0.35, lz);
      courtyardGroup.add(lantern);

      const pLight = new THREE.PointLight(0xfef08a, 0.85, 12);
      pLight.position.set(lx, 2.4, lz);
      nightLightsRef.current.push(pLight);
      courtyardGroup.add(pLight);
    });
    scene.add(courtyardGroup);

    // [ZONE 3: BẢO THÁP MEN NGỌC 3 TẦNG (KIẾN TRÚC MẪU MỚI THEO BẢN VẼ)]
    const pagodaTower = createAuthenticJadePagoda(matJadeRoofTile, matAmberWood, matDarkTimber, matLotusPlinth, matGold, nightLightsRef);
    pagodaTower.position.set(38, 0, -20);
    scene.add(pagodaTower);

    // [ZONE 4: LẦU CHUÔNG NỘI THẤT]
    const bellTowerGroup = new THREE.Group();
    bellTowerGroup.position.set(-26, 0, -20);

    for (const bcx of [-3.6, 3.6]) {
      for (const bcz of [-3.6, 3.6]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 8.0, 10), matWoodLim);
        col.position.set(bcx, 4.0, bcz);
        bellTowerGroup.add(col);
      }
    }
    const bellFloor = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.8, 10.5), matWoodLim);
    bellFloor.position.set(0, 0.4, 0);
    bellTowerGroup.add(bellFloor);

    // Bronze Great Bell
    const bellGroup = new THREE.Group();
    bellGroup.position.set(0, 5.0, 0);
    const bellBody = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.9, 3.2, 16, 4, true), matBronze);
    bellBody.castShadow = true;
    bellGroup.add(bellBody);
    const bellTop = new THREE.Mesh(new THREE.SphereGeometry(1.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), matBronze);
    bellTop.position.set(0, 1.6, 0);
    bellGroup.add(bellTop);
    bellMeshRef.current = bellBody;
    bellTowerGroup.add(bellGroup);

    const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 1.6, 16), matWoodLim);
    drum.rotateX(Math.PI / 2);
    drum.position.set(-3.0, 1.7, -2.4);
    bellTowerGroup.add(drum);

    const bellRoof = createStylizedCurvedRoof(12, 12, matRoofTile);
    bellRoof.position.set(0, 8.8, 0);
    bellRoofsRef.current.push(bellRoof);
    bellTowerGroup.add(bellRoof);
    scene.add(bellTowerGroup);

    // [ZONE 5: HIÊN NƯỚC & SUỐI NGỌC - ON RAINY DAYS (THEO HÌNH MẪU PHÁT THẢO)]
    const pondGroup = new THREE.Group();
    pondGroup.position.set(-26, 0, 36);

    // 1. Natural Stone Perimeter Rim
    const pondRim = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 22), matStoneGrey);
    pondRim.position.set(0, 0.4, 0);
    pondGroup.add(pondRim);

    // 2. Sandy Pebble Riverbed on the right side
    const riverbed = new THREE.Mesh(
      new THREE.PlaneGeometry(13.2, 21.0),
      new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.95 })
    );
    riverbed.rotateX(-Math.PI / 2);
    riverbed.position.set(6.2, 0.05, 0);
    pondGroup.add(riverbed);

    // 3. Submerged Mossy River Boulders & Smooth River Pebbles (Underwater Stones)
    const stoneMats = [
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 }), // Slate river stone
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }),  // Dark river pebble
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 }),  // Mossy green boulder
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.65 }),
    ];
    const riverStoneCoords = [
      [2.5, -7.0, 1.6, 0.6, 1.4, 2],
      [5.5, -4.5, 2.2, 0.7, 1.8, 0],
      [8.5, -7.5, 1.4, 0.5, 1.3, 1],
      [3.8, -1.5, 1.8, 0.6, 1.5, 2],
      [7.2, 0.5, 2.4, 0.8, 2.0, 0],
      [9.5, 3.5, 1.5, 0.5, 1.4, 3],
      [3.0, 4.0, 1.7, 0.6, 1.5, 2],
      [6.0, 7.0, 2.1, 0.7, 1.9, 0],
      [9.0, 8.0, 1.3, 0.5, 1.2, 1],
      [1.5, -4.0, 1.1, 0.4, 1.0, 3],
      [1.8, 1.5, 1.2, 0.45, 1.1, 1],
      [1.5, 7.5, 1.3, 0.5, 1.2, 2],
      [11.0, -2.0, 1.4, 0.5, 1.3, 0],
      [11.2, 5.0, 1.5, 0.55, 1.4, 2],
    ];
    riverStoneCoords.forEach(([sx, sz, rx, ry, rz, mIdx]) => {
      const stone = new THREE.Mesh(new THREE.SphereGeometry(1.0, 10, 8), stoneMats[mIdx % stoneMats.length]);
      stone.scale.set(rx, ry, rz);
      stone.position.set(sx, ry * 0.45, sz);
      stone.receiveShadow = true;
      pondGroup.add(stone);
    });

    // 4. Crystal-Clear Emerald Turquoise Water
    const matCrystalWater = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.12,
      roughness: 0.04,
      metalness: 0.15,
      transparent: true,
      opacity: 0.74,
    });
    const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(13.2, 21.0, 16, 16), matCrystalWater);
    waterMesh.rotateX(-Math.PI / 2);
    waterMesh.position.set(6.2, 0.82, 0);
    pondGroup.add(waterMesh);

    // 5. THE WOODEN ENGAWA & TATAMI WATER DECK (HIÊN GỖ THIỀN ĐỊNH THEO TRANH MẪU)
    const deckGroup = new THREE.Group();
    deckGroup.position.set(-6.2, 0, 0);

    // Cedar Timber Foundation Platform
    const deckBase = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.42, 21.0), matWoodWarm);
    deckBase.position.set(0, 0.68, 0);
    deckBase.receiveShadow = true;
    deckGroup.add(deckBase);

    // Bamboo Slat Walkway on Left Edge
    const walkway = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 20.8), matDarkTimber);
    walkway.position.set(-5.0, 0.94, 0);
    deckGroup.add(walkway);

    // Bamboo Railing Posts along left border
    for (let pz = -9.5; pz <= 9.5; pz += 3.8) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.8, 8), matWoodWarm);
      post.position.set(-6.1, 1.7, pz);
      deckGroup.add(post);
    }
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 20.0), matWoodWarm);
    topRail.position.set(-6.1, 2.5, 0);
    deckGroup.add(topRail);

    // 6 Large Square Teal-Green Tatami Mats (Chiếu Tatami theo tranh mẫu)
    const matTatami = new THREE.MeshStandardMaterial({ color: 0x115e59, roughness: 0.85 }); // Emerald/teal green
    const matTatamiBorder = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.7 });
    for (let col = 0; col < 2; col++) {
      for (let row = -1; row <= 1; row++) {
        const mx = -2.2 + col * 4.2;
        const mz = row * 6.6;
        const matMesh = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.08, 6.4), matTatami);
        matMesh.position.set(mx, 0.94, mz);
        deckGroup.add(matMesh);

        // Border seams
        const borderX = new THREE.Mesh(new THREE.BoxGeometry(4.02, 0.09, 0.16), matTatamiBorder);
        borderX.position.set(mx, 0.95, mz + 3.15);
        deckGroup.add(borderX);
      }
    }

    // 6. PROPS ON DECK: Watermelon Plate, Vintage Retro Fan & Companion Figure
    // A. Plate of Sliced Watermelon (Đĩa dưa hấu thanh mát mùa hè)
    const watermelonGroup = new THREE.Group();
    watermelonGroup.position.set(-1.0, 0.99, 1.5);
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.52, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
    );
    plate.position.set(0, 0.03, 0);
    watermelonGroup.add(plate);

    const matWRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });
    const matWGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    for (let s = -1; s <= 1; s++) {
      const slice = new THREE.Group();
      slice.position.set(s * 0.28, 0.18, 0);
      slice.rotation.z = Math.PI / 12 * s;

      const rind = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.1, 10, 1, false, 0, Math.PI * 0.42), matWGreen);
      rind.rotateZ(Math.PI / 2);
      slice.add(rind);

      const flesh = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.09, 10, 1, false, 0, Math.PI * 0.4), matWRed);
      flesh.rotateZ(Math.PI / 2);
      slice.add(flesh);

      watermelonGroup.add(slice);
    }
    deckGroup.add(watermelonGroup);

    // B. Vintage Green Retro Electric Fan (Quạt máy con cóc cổ điển mùa hè)
    const fanGroup = new THREE.Group();
    fanGroup.position.set(-3.5, 0.99, -5.5);
    const matRetroGreen = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.45 });

    const fanBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.15, 12), matRetroGreen);
    fanBase.position.set(0, 0.08, 0);
    fanGroup.add(fanBase);

    const fanStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.75, 8), matGold);
    fanStem.position.set(0, 0.48, 0);
    fanGroup.add(fanStem);

    const fanMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.38, 10), matRetroGreen);
    fanMotor.rotation.x = Math.PI / 2;
    fanMotor.position.set(0, 0.85, 0);
    fanGroup.add(fanMotor);

    const fanCage = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 8, 20), matRetroGreen);
    fanCage.position.set(0, 0.85, 0.22);
    fanGroup.add(fanCage);

    const fanBlades = new THREE.Group();
    fanBlades.position.set(0, 0.85, 0.2);
    for (let b = 0; b < 3; b++) {
      const bladeAngle = (b / 3) * Math.PI * 2;
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.48, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.3 })
      );
      blade.position.set(Math.cos(bladeAngle) * 0.28, Math.sin(bladeAngle) * 0.28, 0);
      blade.rotation.z = bladeAngle + Math.PI / 6;
      fanBlades.add(blade);
    }
    fanGroup.add(fanBlades);
    fanBladesRef.current = fanBlades;
    deckGroup.add(fanGroup);

    // C. Relaxing Companion Figure (Cô gái nằm thảnh thơi trên sàn tatami như trong tranh)
    const companionGroup = new THREE.Group();
    companionGroup.position.set(0.8, 1.05, -1.8);

    const cMatSkin = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.7 });
    const cMatTop = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.8 }); // Light blue sleeveless top
    const cMatShorts = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.75 }); // Navy blue shorts
    const cMatHair = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

    // Head resting flat
    const cHead = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), cMatSkin);
    cHead.position.set(0, 0, -2.1);
    companionGroup.add(cHead);

    const cHair = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), cMatHair);
    cHair.position.set(0, 0.05, -2.15);
    companionGroup.add(cHair);

    // Torso lying flat
    const cTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 1.35, 10), cMatTop);
    cTorso.rotation.x = Math.PI / 2;
    cTorso.position.set(0, 0, -1.1);
    companionGroup.add(cTorso);

    // Outstretched relaxed arms
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.25, 8), cMatSkin);
      arm.rotation.z = side * (Math.PI / 2.3);
      arm.position.set(side * 0.85, 0, -1.35);
      companionGroup.add(arm);
    }

    // Shorts
    const cShorts = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.48, 0.7, 10), cMatShorts);
    cShorts.rotation.x = Math.PI / 2;
    cShorts.position.set(0, 0, -0.2);
    companionGroup.add(cShorts);

    // Legs relaxed
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 1.45, 8), cMatSkin);
      leg.rotation.x = Math.PI / 2;
      leg.rotation.z = side * 0.12;
      leg.position.set(side * 0.28, 0, 0.95);
      companionGroup.add(leg);
    }
    deckGroup.add(companionGroup);

    pondGroup.add(deckGroup);

    // 7. SWIMMING KOI FISH IN CRYSTAL TURQUOISE WATER
    koiFishListRef.current = [];
    const koiColors = [
      { body: 0xea580c, fin: 0xfef08a }, // Orange Kohaku
      { body: 0xfacc15, fin: 0xffffff }, // Golden Ogon
      { body: 0xd97706, fin: 0xfde047 },
      { body: 0xef4444, fin: 0xfef08a }, // Scarlet
      { body: 0xf8fafc, fin: 0xea580c }, // White/Orange Tancho
      { body: 0x0f172a, fin: 0xef4444 }, // Black Showa
      { body: 0xf59e0b, fin: 0xffffff },
      { body: 0xd97706, fin: 0xfacc15 },
    ];
    for (let k = 0; k < 8; k++) {
      const koiG = new THREE.Group();
      const colScheme = koiColors[k % koiColors.length];
      const koiB = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 1.5, 8),
        new THREE.MeshStandardMaterial({ color: colScheme.body, roughness: 0.25 })
      );
      koiB.rotateZ(Math.PI / 2);
      koiG.add(koiB);

      // Tail fin
      const tailFin = new THREE.Mesh(
        new THREE.PlaneGeometry(0.45, 0.45),
        new THREE.MeshStandardMaterial({ color: colScheme.fin, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      tailFin.position.set(-0.9, 0, 0);
      tailFin.rotateY(Math.PI / 4);
      koiG.add(tailFin);

      // Side fins
      for (const fs of [-1, 1]) {
        const fin = new THREE.Mesh(
          new THREE.PlaneGeometry(0.35, 0.2),
          new THREE.MeshStandardMaterial({ color: colScheme.fin, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
        );
        fin.position.set(0.2, 0, fs * 0.35);
        fin.rotateX(fs * Math.PI / 6);
        koiG.add(fin);
      }

      // Initial positions in stream
      koiG.position.set(2.5 + Math.random() * 8.0, 0.65, (Math.random() - 0.5) * 16.0);
      pondGroup.add(koiG);

      koiFishListRef.current.push({
        mesh: koiG,
        angle: k * (Math.PI / 4),
        speed: 0.018 + Math.random() * 0.014,
        radius: 3.5 + Math.random() * 4.5,
      });
    }

    // 8. OVERHEAD LEAFY CANOPY BRANCHES (VÒM LÁ XANH RỢP BÓNG - KOMOREBI)
    const canopyGroup = new THREE.Group();
    canopyGroup.position.set(0, 5.8, 0);
    const matLeafGreen1 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.75, transparent: true, opacity: 0.92 });
    const matLeafGreen2 = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.7, transparent: true, opacity: 0.9 });
    const matLeafGreen3 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8, transparent: true, opacity: 0.95 });

    const canopyPuffs: [number, number, number, THREE.MeshStandardMaterial][] = [
      [-10.0, 8.5, 2.5, matLeafGreen1],
      [-7.5, 9.0, 2.8, matLeafGreen2],
      [-4.0, 8.0, 2.4, matLeafGreen3],
      [4.0, 8.5, 2.6, matLeafGreen1],
      [8.5, 9.0, 3.2, matLeafGreen2],
      [11.0, 7.5, 2.5, matLeafGreen3],
      [-11.0, -8.0, 2.7, matLeafGreen1],
      [-7.0, -9.0, 3.0, matLeafGreen2],
      [6.0, -8.5, 2.8, matLeafGreen1],
      [10.0, -8.0, 3.0, matLeafGreen3],
    ];
    canopyPuffs.forEach(([cx, cz, cr, mat]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(cr, 8, 8), mat);
      puff.position.set(cx, (Math.random() - 0.5) * 0.8, cz);
      puff.scale.set(1.4, 0.75, 1.2);
      canopyGroup.add(puff);
    });
    pondGroup.add(canopyGroup);

    // 9. Arched Stone Bridge connecting Deck to Courtyard
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.45, 2.6), matStoneGrey);
    bridge.position.set(6.2, 0.75, 0);
    pondGroup.add(bridge);

    scene.add(pondGroup);

    // [ZONE 6: DÃY HÀNH LANG CỘT GỖ]
    const corridorGroup = new THREE.Group();
    corridorGroup.position.set(18, 0, 12);
    const corrFloor = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.4, 36), matWoodLim);
    corrFloor.position.set(0, 0.2, 0);
    corridorGroup.add(corrFloor);

    for (let cz = -15; cz <= 15; cz += 5.5) {
      for (const cx of [-2.6, 2.6]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 6.2, 8), matWoodLim);
        col.position.set(cx, 3.3, cz);
        corridorGroup.add(col);
      }
      const lantern = createStylizedSilkLantern(matLanternRed);
      lantern.position.set(0, 5.0, cz);
      corridorGroup.add(lantern);

      const pLight = new THREE.PointLight(0xf87171, 0.75, 8);
      pLight.position.set(0, 4.6, cz);
      nightLightsRef.current.push(pLight);
      corridorGroup.add(pLight);
    }
    const corrRoof = createStylizedCurvedRoof(8.0, 38, matRoofTile);
    corrRoof.position.set(0, 6.8, 0);
    corridorGroup.add(corrRoof);
    scene.add(corridorGroup);

    // [ZONE 7: ĐẠI HÙNG BẢO ĐIỆN - TÒA CHÍNH KIẾN TRÚC MỚI THEO BẢN VẼ]
    const sanctuaryGroup = createAuthenticDaiHungBaoDien(
      matJadeRoofTile,
      matAmberWood,
      matDarkTimber,
      matLotusPlinth,
      matStoneGrey,
      matTileBrick,
      matGold,
      matLanternRed,
      sanctuaryRoofsRef,
      nightLightsRef
    );
    scene.add(sanctuaryGroup);

    // [ZONE 8: PHÒNG THIỀN NGUYỆT MÔN]
    const medGroup = new THREE.Group();
    medGroup.position.set(-24, 0, 6);
    const medFloor = new THREE.Mesh(new THREE.BoxGeometry(15, 0.4, 13), matWoodLim);
    medFloor.position.set(0, 0.2, 0);
    medGroup.add(medFloor);

    const moonWall = createStylizedMoonWall(matWoodWarm);
    moonWall.position.set(0, 3.2, -6.2);
    medGroup.add(moonWall);

    const medRoof = createStylizedCurvedRoof(17, 15, matRoofTile);
    medRoof.position.set(0, 6.5, 0);
    meditationRoofsRef.current.push(medRoof);
    medGroup.add(medRoof);
    scene.add(medGroup);

    // [ZONE 9: PHÒNG KINH SÁCH]
    const libGroup = new THREE.Group();
    libGroup.position.set(24, 0, 6);
    const libFloor = new THREE.Mesh(new THREE.BoxGeometry(17, 0.4, 14), matWoodLim);
    libFloor.position.set(0, 0.2, 0);
    libGroup.add(libFloor);

    for (const bz of [-6.0, 0, 6.0]) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(13, 5.0, 1.1), matWoodWarm);
      shelf.position.set(0, 2.7, bz);
      libGroup.add(shelf);
    }
    const libRoof = createStylizedCurvedRoof(19, 16, matRoofTile);
    libRoof.position.set(0, 6.5, 0);
    libraryRoofsRef.current.push(libRoof);
    libGroup.add(libRoof);
    scene.add(libGroup);

    // [ZONE 10: SÂN SAU & RỪNG TRÚC]
    const backGardenGroup = new THREE.Group();
    backGardenGroup.position.set(0, 0, -50);

    const stoneArch = createStylizedStoneArch(matStoneGrey);
    stoneArch.position.set(0, 0, 20);
    backGardenGroup.add(stoneArch);

    bambooLeavesRef.current = [];
    for (let b = 0; b < 24; b++) {
      const bG = new THREE.Group();
      const bx = (Math.random() - 0.5) * 32;
      const bz = (Math.random() - 0.5) * 22;
      if (Math.abs(bx) < 4 && Math.abs(bz) < 8) continue;

      const culm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 9.0, 6), new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.6 }));
      culm.position.set(0, 4.5, 0);
      bG.add(culm);

      const leafBall = new THREE.Mesh(new THREE.SphereGeometry(1.6, 6, 6), new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.7 }));
      leafBall.scale.set(1.3, 0.65, 1.3);
      leafBall.position.set(0, 8.2, 0);
      bG.add(leafBall);
      bG.position.set(bx, 0, bz);
      backGardenGroup.add(bG);
      bambooLeavesRef.current.push(bG);
    }

    const well = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.1, 10, 1, true), matStoneGrey);
    well.position.set(11, 0.55, 4);
    backGardenGroup.add(well);

    const kitchenWall = new THREE.Mesh(new THREE.BoxGeometry(11, 4.2, 7.5), matStoneGrey);
    kitchenWall.position.set(-16, 2.1, 2);
    backGardenGroup.add(kitchenWall);

    const kitchenRoof = createStylizedCurvedRoof(13, 9.5, matRoofTile);
    kitchenRoof.position.set(-16, 5.0, 2);
    backGardenGroup.add(kitchenRoof);
    scene.add(backGardenGroup);

    // [ZONE 12: ĐƯỜNG LÊN TẦNG TRÊN (CẦU THANG ĐÁ)]
    const stairsGroup = new THREE.Group();
    stairsGroup.position.set(28, 0, -6);
    for (let s = 0; s < 14; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.38, 1.1), matStoneGrey);
      step.position.set(s * 0.65, s * 0.38, -s * 0.85);
      stairsGroup.add(step);
    }
    scene.add(stairsGroup);

    // Destination Marker (Golden Lotus Ring)
    const destGroup = new THREE.Group();
    const destRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.12, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
    );
    destRing.rotateX(Math.PI / 2);
    destGroup.add(destRing);
    destGroup.position.set(0, 0.3, 66);
    destinationMarkerRef.current = destGroup;
    scene.add(destGroup);

    // Glowing Lotus Cursor Reticle (Rotates under cursor)
    const lotusCursor = new THREE.Group();
    const cursorRing = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 0.95, 24),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    cursorRing.rotateX(-Math.PI / 2);
    lotusCursor.add(cursorRing);
    const cursorDot = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 12),
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
    );
    cursorDot.rotateX(-Math.PI / 2);
    lotusCursor.add(cursorDot);
    lotusCursor.position.set(0, 0.28, 70);
    cursorMarkerGroupRef.current = lotusCursor;
    scene.add(lotusCursor);

    // [STYLIZED 3D MONK RIG]
    const monk = createStylized3DMonk(character);
    monkGroupRef.current = monk.monkGroup;
    monkTorsoRef.current = monk.monkTorso;
    monkHeadRef.current = monk.monkHead;
    monkLeftLegRef.current = monk.monkLeftLeg;
    monkRightLegRef.current = monk.monkRightLeg;
    monkLeftArmRef.current = monk.monkLeftArm;
    monkRightArmRef.current = monk.monkRightArm;
    scene.add(monk.monkGroup);

    // Initial load of realistic 3D character
    loadRealisticCharacter(character).then((rig) => {
      charMixerRef.current = rig.mixer;
      charActionsRef.current = rig.actions;
      rig.actions.idle.play();
      currentActionRef.current = 'idle';

      if (monkTorsoRef.current) monkTorsoRef.current.visible = false;
      if (monkLeftLegRef.current) monkLeftLegRef.current.visible = false;
      if (monkRightLegRef.current) monkRightLegRef.current.visible = false;

      if (realisticModelRef.current) {
        monkGroupRef.current?.remove(realisticModelRef.current);
      }
      realisticModelRef.current = rig.modelGroup;
      monk.monkGroup.add(rig.modelGroup);
      realisticModelLoadedRef.current = true;
    }).catch((err) => {
      console.warn('Procedural fallback used:', err);
    });

    // Puffy Cartoon Incense Smoke
    const smokeCount = 70;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let s = 0; s < smokeCount; s++) {
      smokePos[s * 3] = (Math.random() - 0.5) * 1.4;
      smokePos[s * 3 + 1] = 3.5 + Math.random() * 10;
      smokePos[s * 3 + 2] = 22 + (Math.random() - 0.5) * 1.4;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeParticles = new THREE.Points(smokeGeo, new THREE.PointsMaterial({ color: 0xfef08a, size: 1.8, transparent: true, opacity: 0.5 }));
    smokeParticlesRef.current = smokeParticles;
    scene.add(smokeParticles);

    // Floating Magical Spirit Wisps / Fireflies
    const spiritCount = 100;
    const spiritGeo = new THREE.BufferGeometry();
    const spiritPos = new Float32Array(spiritCount * 3);
    for (let sp = 0; sp < spiritCount; sp++) {
      spiritPos[sp * 3] = (Math.random() - 0.5) * 60;
      spiritPos[sp * 3 + 1] = 1.5 + Math.random() * 12;
      spiritPos[sp * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    spiritGeo.setAttribute('position', new THREE.BufferAttribute(spiritPos, 3));
    const spiritPoints = new THREE.Points(
      spiritGeo,
      new THREE.PointsMaterial({ color: 0xfde047, size: 0.85, transparent: true, opacity: 0.75 })
    );
    spiritParticlesRef.current = spiritPoints;
    scene.add(spiritPoints);

    // Raycaster for Mouse Cursor Aiming and Rotation Control
    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.25);

    const updateCursorGroundPos = (clientX: number, clientY: number) => {
      if (!renderer || !camera) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      cursorScreenPosRef.current.set(ndcX, ndcY);

      raycaster.setFromCamera(cursorScreenPosRef.current, camera);
      const hit = new THREE.Vector3();
      const currentPy = playerPosRef.current.y || 0.25;
      groundPlane.constant = -currentPy;
      if (raycaster.ray.intersectPlane(groundPlane, hit)) {
        hit.x = Math.max(-50, Math.min(50, hit.x));
        hit.z = Math.max(-75, Math.min(95, hit.z));
        cursorGroundPosRef.current.copy(hit);
        hasGroundTargetRef.current = true;
      }
    };

    // Pointer Event Listeners
    const handlePointerDown = (e: MouseEvent) => {
      isDraggingOrbitRef.current = true;
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      lastPointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      updateCursorGroundPos(e.clientX, e.clientY);

      if (isDraggingOrbitRef.current) {
        const dx = e.clientX - dragStartPosRef.current.x;
        const dy = e.clientY - dragStartPosRef.current.y;
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };

        cameraYawRef.current -= dx * 0.007;
        // Allows player to tilt UP into the sky (pitch down to -0.92 rad / ~53 degrees up)
        // or tilt DOWN towards the ground (pitch up to +0.95 rad / ~55 degrees down)
        cameraPitchRef.current = Math.max(-0.92, Math.min(0.95, cameraPitchRef.current + dy * 0.005));
      }
    };

    const handlePointerUp = (e: MouseEvent) => {
      isDraggingOrbitRef.current = false;

      // Click on ground to move (Point & Click with Obstacle & Elevation Resolution)
      const distMoved = Math.hypot(e.clientX - lastPointerDownPosRef.current.x, e.clientY - lastPointerDownPosRef.current.y);
      if (distMoved < 6 && hasGroundTargetRef.current) {
        const rawTargetX = cursorGroundPosRef.current.x;
        const rawTargetZ = cursorGroundPosRef.current.z;
        const currentPy = playerPosRef.current.y || 0.42;
        const resolved = resolveMonkCollision(rawTargetX, currentPy, rawTargetZ);
        const floorY = getTerrainFloorElevation(resolved.x, resolved.z, currentPy);

        targetPosRef.current = { x: resolved.x, y: floorY, z: resolved.z };
        stuckCountRef.current = 0;
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.position.set(resolved.x, floorY + 0.08, resolved.z);
          destinationMarkerRef.current.visible = true;
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    // Touch Support for Mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingOrbitRef.current = true;
        dragStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingOrbitRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartPosRef.current.x;
      const dy = e.touches[0].clientY - dragStartPosRef.current.y;
      dragStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      cameraYawRef.current -= dx * 0.008;
      cameraPitchRef.current = Math.max(-0.92, Math.min(0.95, cameraPitchRef.current + dy * 0.006));
    };
    const handleTouchEnd = () => {
      isDraggingOrbitRef.current = false;
    };
    renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Mouse Wheel Zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistRef.current = Math.max(3.5, Math.min(30.0, cameraDistRef.current + e.deltaY * 0.015));
    };
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // ==========================================
    // 60+ FPS SMOOTH ANIMATION & MOVEMENT LOOP
    // ==========================================
    let stepCount = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      stepCount++;
      const delta = Math.min(clock.getDelta(), 0.05);
      const moveDist = 3.6 * delta; // Grounded natural walking speed

      // Floating spirit particles hover
      if (spiritParticlesRef.current) {
        const sArr = spiritParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 100; i++) {
          sArr[i * 3 + 1] += Math.sin(stepCount * 0.03 + i) * 0.015;
          sArr[i * 3] += Math.cos(stepCount * 0.02 + i) * 0.012;
        }
        spiritParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Check Directional Keyboard / D-Pad Movement
      const kp = keysPressedRef.current;
      let forwardInput = 0;
      let strafeInput = 0;

      if (kp.up) forwardInput += 1;
      if (kp.down) forwardInput -= 1;
      if (kp.left) strafeInput -= 1;
      if (kp.right) strafeInput += 1;

      const isManualMoving = forwardInput !== 0 || strafeInput !== 0;

      if (monkGroupRef.current) {
        const currentP = playerPosRef.current;
        let isCurrentlyWalking = false;

        if (isManualMoving) {
          if (monkPoseRef.current !== 'STAND') {
            monkPoseRef.current = 'STAND';
            setMonkPose('STAND');
          }
          isCurrentlyWalking = true;
          isWalkingRef.current = true;
          isWalkingStateRef.current = true;
          walkPhaseRef.current += 10.0 * delta;

          // Camera-Relative Movement Direction
          const yaw = cameraYawRef.current;
          const forwardX = -Math.sin(yaw);
          const forwardZ = -Math.cos(yaw);
          const rightX = Math.cos(yaw);
          const rightZ = -Math.sin(yaw);

          let moveX = forwardX * forwardInput + rightX * strafeInput;
          let moveZ = forwardZ * forwardInput + rightZ * strafeInput;
          const len = Math.hypot(moveX, moveZ);

          if (len > 0.001) {
            const nextX = currentP.x + (moveX / len) * moveDist;
            const nextZ = currentP.z + (moveZ / len) * moveDist;

            const resolved = resolveMonkCollision(nextX, currentP.y, nextZ);
            currentP.x = resolved.x;
            currentP.z = resolved.z;

            let targetAngle = Math.atan2(moveX, moveZ);
            playerRotationRef.current = targetAngle;
            let diff = targetAngle - monkGroupRef.current.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            monkGroupRef.current.rotation.y += diff * Math.min(1.0, 12.0 * delta);
          }

          if (stepCount % 16 === 0) {
            spawnLotusFootstep(scene, currentP.x, currentP.z, lotusFootstepsRef, currentP.y);
          }
        } else if (targetPosRef.current) {
          const targetP = targetPosRef.current;
          const dx = targetP.x - currentP.x;
          const dz = targetP.z - currentP.z;
          const dist = Math.hypot(dx, dz);

          if (dist > 0.15) {
            isCurrentlyWalking = true;
            isWalkingRef.current = true;
            isWalkingStateRef.current = true;
            walkPhaseRef.current += 10.0 * delta;

            const stepDist = Math.min(moveDist, dist);
            const nextX = currentP.x + (dx / dist) * stepDist;
            const nextZ = currentP.z + (dz / dist) * stepDist;

            const resolved = resolveMonkCollision(nextX, currentP.y, nextZ);
            const actualMoved = Math.hypot(resolved.x - currentP.x, resolved.z - currentP.z);
            currentP.x = resolved.x;
            currentP.z = resolved.z;

            // Prevent running against obstacles indefinitely
            if (actualMoved < 0.001) {
              stuckCountRef.current = (stuckCountRef.current || 0) + 1;
              if (stuckCountRef.current > 40) {
                targetPosRef.current = null;
                stuckCountRef.current = 0;
                if (destinationMarkerRef.current) {
                  destinationMarkerRef.current.visible = false;
                }
              }
            } else {
              stuckCountRef.current = 0;
            }

            const targetAngle = Math.atan2(dx, dz);
            playerRotationRef.current = targetAngle;
            let diff = targetAngle - monkGroupRef.current.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            monkGroupRef.current.rotation.y += diff * Math.min(1.0, 12.0 * delta);

            if (stepCount % 16 === 0) {
              spawnLotusFootstep(scene, currentP.x, currentP.z, lotusFootstepsRef, currentP.y);
            }
          } else {
            isWalkingRef.current = false;
            isWalkingStateRef.current = false;
            targetPosRef.current = null;
            if (destinationMarkerRef.current) {
              destinationMarkerRef.current.visible = false;
            }

            if (isTourPlayingRef.current && tourWaitRef.current === 0) {
              tourWaitRef.current = 140;
            }
          }
        } else {
          isWalkingRef.current = false;
          isWalkingStateRef.current = false;

          // Idle: Monk smoothly turns towards cursor point on ground
          if (hasGroundTargetRef.current) {
            const dx = cursorGroundPosRef.current.x - currentP.x;
            const dz = cursorGroundPosRef.current.z - currentP.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.8) {
              const targetAngle = Math.atan2(dx, dz);
              playerRotationRef.current = targetAngle;
              let diff = targetAngle - monkGroupRef.current.rotation.y;
              while (diff < -Math.PI) diff += Math.PI * 2;
              while (diff > Math.PI) diff -= Math.PI * 2;
              monkGroupRef.current.rotation.y += diff * Math.min(1.0, 8.0 * delta);

              if (monkHeadRef.current) {
                monkHeadRef.current.rotation.y = Math.max(-0.45, Math.min(0.45, diff * 0.65));
              }
            }
          }
        }

        // Dynamic Ground Elevation & Anti-Sink Calculation
        const targetFloorY = getTerrainFloorElevation(currentP.x, currentP.z, currentP.y);
        const yDiff = targetFloorY - currentP.y;

        // Smooth elevation transition with delta time
        currentP.y += yDiff * Math.min(1.0, 14.0 * delta);

        // Anti-Sink Guarantee: Character feet never penetrate below the solid floor surface!
        if (currentP.y < targetFloorY - 0.005) {
          currentP.y = targetFloorY;
        }

        // Realistic Human Animation vs Procedural Fallback
        if (charMixerRef.current && realisticModelLoadedRef.current) {
          let target = 'idle';
          if (monkPoseRef.current === 'SIT_EDGE') {
            target = 'sit';
          } else if (isCurrentlyWalking) {
            target = 'walk';
          }

          if (target !== currentActionRef.current) {
            const prevAction = charActionsRef.current[currentActionRef.current as keyof typeof charActionsRef.current];
            const nextAction = charActionsRef.current[target as keyof typeof charActionsRef.current];
            if (prevAction && nextAction && prevAction !== nextAction) {
              nextAction.reset().enabled = true;
              nextAction.setEffectiveTimeScale(target === 'walk' ? 1.15 : 1.0);
              nextAction.setEffectiveWeight(1.0);
              prevAction.crossFadeTo(nextAction, 0.22, true);
              nextAction.play();
            } else if (nextAction) {
              nextAction.reset().play();
            }
            currentActionRef.current = target;
          }

          charMixerRef.current.update(delta);
        } else {
          // Procedural fallback animation while model loads
          const phase = walkPhaseRef.current;
          if (isCurrentlyWalking) {
            if (monkLeftLegRef.current && monkRightLegRef.current) {
              monkLeftLegRef.current.rotation.x = Math.sin(phase) * 0.44;
              monkRightLegRef.current.rotation.x = -Math.sin(phase) * 0.44;
            }
            if (monkLeftArmRef.current && monkRightArmRef.current) {
              monkLeftArmRef.current.rotation.x = -Math.sin(phase) * 0.35;
              monkRightArmRef.current.rotation.x = Math.sin(phase) * 0.35;
              monkLeftArmRef.current.rotation.z = 0.04 + Math.abs(Math.sin(phase)) * 0.03;
              monkRightArmRef.current.rotation.z = -0.04 - Math.abs(Math.sin(phase)) * 0.03;
            }
            if (monkTorsoRef.current) {
              monkTorsoRef.current.position.y = 1.4 + Math.abs(Math.sin(phase)) * 0.042;
              monkTorsoRef.current.rotation.y = Math.sin(phase) * 0.035;
              monkTorsoRef.current.rotation.z = Math.sin(phase) * 0.02;
            }
          } else {
            if (monkLeftLegRef.current && monkRightLegRef.current) {
              monkLeftLegRef.current.rotation.x += (0 - monkLeftLegRef.current.rotation.x) * 0.2;
              monkRightLegRef.current.rotation.x += (0 - monkRightLegRef.current.rotation.x) * 0.2;
            }
            if (monkLeftArmRef.current && monkRightArmRef.current) {
              monkLeftArmRef.current.rotation.x += (0 - monkLeftArmRef.current.rotation.x) * 0.2;
              monkRightArmRef.current.rotation.x += (0 - monkRightArmRef.current.rotation.x) * 0.2;
              monkLeftArmRef.current.rotation.z += (0 - monkLeftArmRef.current.rotation.z) * 0.2;
              monkRightArmRef.current.rotation.z += (0 - monkRightArmRef.current.rotation.z) * 0.2;
            }
            if (monkTorsoRef.current) {
              monkTorsoRef.current.position.y += (1.4 - monkTorsoRef.current.position.y) * 0.2;
              monkTorsoRef.current.rotation.y += (0 - monkTorsoRef.current.rotation.y) * 0.2;
              monkTorsoRef.current.rotation.z += (0 - monkTorsoRef.current.rotation.z) * 0.2;
            }
          }
        }

        // Handle Relaxed Character Poses on Deck
        if (monkPoseRef.current === 'LIE_DOWN') {
          // Monk lies flat on back on the tatami deck with arms spread out wide in peaceful bliss
          monkGroupRef.current.rotation.set(-Math.PI / 2, 0, 0);
          if (monkLeftArmRef.current && monkRightArmRef.current) {
            monkLeftArmRef.current.rotation.set(0, 0, Math.PI / 2.2);
            monkRightArmRef.current.rotation.set(0, 0, -Math.PI / 2.2);
          }
          if (monkLeftLegRef.current && monkRightLegRef.current) {
            monkLeftLegRef.current.rotation.set(0, 0, -0.15);
            monkRightLegRef.current.rotation.set(0, 0, 0.15);
          }
          if (monkTorsoRef.current) {
            monkTorsoRef.current.position.y = 1.4;
            monkTorsoRef.current.rotation.set(0, 0, 0);
          }
          currentP.y = 0.96;
        } else if (monkPoseRef.current === 'SIT_EDGE') {
          // Monk sitting at the edge of the wooden deck dipping feet into the cool water
          monkGroupRef.current.rotation.set(0, -Math.PI / 2, 0);
          if (monkLeftLegRef.current && monkRightLegRef.current) {
            monkLeftLegRef.current.rotation.set(Math.PI / 2.1, 0, -0.05);
            monkRightLegRef.current.rotation.set(Math.PI / 2.1, 0, 0.05);
          }
          if (monkLeftArmRef.current && monkRightArmRef.current) {
            monkLeftArmRef.current.rotation.set(0.3, 0, 0.1);
            monkRightArmRef.current.rotation.set(0.3, 0, -0.1);
          }
          if (monkTorsoRef.current) {
            monkTorsoRef.current.position.y = 0.95;
            monkTorsoRef.current.rotation.set(0, 0, 0);
          }
          currentP.y = 0.89;
        }

        monkGroupRef.current.position.set(currentP.x, currentP.y, currentP.z);

        // Check Zone Proximity
        let closestZone: TempleZoneInfo | null = null;
        let minDist = 24;

        for (const zone of TEMPLE_ZONES) {
          const zdist = Math.hypot(zone.pos.x - currentP.x, zone.pos.z - currentP.z);
          if (zdist < minDist) {
            minDist = zdist;
            closestZone = zone;
          }
        }

        if (closestZone) {
          const zoneObj: TempleZoneInfo = closestZone;
          if (zoneObj.id !== currentZoneIdRef.current) {
            currentZoneIdRef.current = zoneObj.id;
            setCurrentZone(zoneObj);
            setZoneBanner(zoneObj);

            const actionsList: { title: string; action: () => void; icon: string }[] = [];
            const zKey = zoneObj.actionKey;
            const p = propsRef.current;

            if (zKey === 'GATE') {
              actionsList.push({ title: 'Cứu Tế Bát Cháo Nghĩa Tình', action: p.onOpenCharity, icon: '🍲' });
            } else if (zKey === 'COURTYARD') {
              actionsList.push({ title: 'Quét Lá Đa Chánh Niệm', action: p.onOpenSweeping, icon: '🧹' });
              actionsList.push({ title: 'Thắp Nén Hương Lòng', action: () => p.onAddMerit(10, 50, 40, 'Thắp Hương Tam Bảo'), icon: '🪔' });
            } else if (zKey === 'POND') {
              actionsList.push({
                title: 'Nằm Thảnh Thơi (On Rainy Days)',
                action: () => {
                  setMonkPose('LIE_DOWN');
                  monkPoseRef.current = 'LIE_DOWN';
                  playerPosRef.current.x = -30.0;
                  playerPosRef.current.z = 36.0;
                  p.onAddMerit(30, 50, 40, 'Nằm Thảnh Thơi An Yên');
                },
                icon: '🛌'
              });
              actionsList.push({
                title: 'Ngồi Thả Chân Xuống Suối',
                action: () => {
                  setMonkPose('SIT_EDGE');
                  monkPoseRef.current = 'SIT_EDGE';
                  playerPosRef.current.x = -26.5;
                  playerPosRef.current.z = 36.0;
                  p.onAddMerit(20, 50, 40, 'Thả Chân Tắm Suối');
                },
                icon: '🌊'
              });
              actionsList.push({
                title: 'Thưởng Thức Dưa Hấu',
                action: () => {
                  p.onAddMerit(25, 50, 40, 'Dưa Hấu Mát Lạnh Mùa Hè');
                },
                icon: '🍉'
              });
              actionsList.push({ title: 'Rải Mồi Đàn Cá Koi', action: handleFeedKoiFish, icon: '🐟' });
              actionsList.push({ title: 'Hiên Trà Suối Tiên', action: p.onOpenTeaHouse, icon: '🍵' });
              actionsList.push({
                title: 'Đứng Dậy Bước Đi',
                action: () => {
                  setMonkPose('STAND');
                  monkPoseRef.current = 'STAND';
                },
                icon: '🚶'
              });
            } else if (zKey === 'TOWER') {
              actionsList.push({ title: 'Chiêm Bái Bảo Tháp', action: () => p.onAddMerit(25, 50, 40, 'Chiêm Bái Bảo Tháp'), icon: '🏯' });
            } else if (zKey === 'BELL') {
              actionsList.push({ title: 'Thỉnh Đại Hồng Chung', action: handleRingBell, icon: '🔔' });
            } else if (zKey === 'CORRIDOR') {
              actionsList.push({ title: 'Kinh Hành Chánh Niệm', action: () => p.onAddMerit(15, 50, 40, 'Kinh Hành'), icon: '🏮' });
            } else if (zKey === 'SANCTUARY') {
              actionsList.push({ title: 'Lễ Phật & Thính Pháp', action: p.onOpenDharma, icon: '🏛️' });
              actionsList.push({ title: 'Lau Chùi Bàn Thờ Phật', action: p.onOpenAltarCleaning, icon: '✨' });
            } else if (zKey === 'MEDITATION') {
              actionsList.push({ title: 'Tọa Thiền Tịnh Tọa', action: () => p.onAddMerit(30, 50, 40, 'Tọa Thiền Chánh Niệm'), icon: '🧘' });
            } else if (zKey === 'LIBRARY') {
              actionsList.push({ title: 'Đọc Kinh Bát Nhã & Pháp Cú', action: p.onOpenDharma, icon: '📜' });
            } else if (zKey === 'BACK_GARDEN') {
              actionsList.push({ title: 'Chẻ Củi Bếp Chùa', action: p.onOpenWoodChopping, icon: '🪓' });
              actionsList.push({ title: 'Gánh Nước Suối Tiên', action: p.onOpenWaterCarrying, icon: '🪵' });
            } else if (zKey === 'BALCONY') {
              actionsList.push({ title: 'Ngắm Cảnh Mây Núi Lầu Cao', action: () => p.onAddMerit(20, 50, 40, 'An Nhiên Vọng Cảnh'), icon: '🪟' });
            }
            setNearInteractions(actionsList);
          }
        } else if (currentZoneIdRef.current !== '') {
          currentZoneIdRef.current = '';
          setNearInteractions([]);
        }

        // Indoor Building Detection
        const inSanctuary = currentP.z <= -4 && currentP.z >= -32 && Math.abs(currentP.x) <= 17 && currentP.y < 6.0;
        const inBalcony = currentP.y >= 6.0 && currentP.z <= -6 && currentP.z >= -30;
        const inMeditation = Math.hypot(currentP.x - (-24), currentP.z - 6) < 8;
        const inLibrary = Math.hypot(currentP.x - 24, currentP.z - 6) < 8.5;
        const inBell = Math.hypot(currentP.x - (-26), currentP.z - (-20)) < 7;

        let buildingName: string | null = null;
        if (inSanctuary) buildingName = 'Đại Hùng Bảo Điện (Phòng Thờ)';
        else if (inBalcony) buildingName = 'Lầu Gác Tầng Cao';
        else if (inMeditation) buildingName = 'Phòng Thiền Nguyệt Môn';
        else if (inLibrary) buildingName = 'Tàng Kinh Các (Phòng Kinh Sách)';
        else if (inBell) buildingName = 'Nội Thất Lầu Chuông';

        if (buildingName !== currentBuildingStateRef.current) {
          currentBuildingStateRef.current = buildingName;
          setCurrentBuilding(buildingName);
        }

        // Smooth roof fading when inside buildings
        sanctuaryRoofsRef.current.forEach((roof) => {
          const targetOpacity = inSanctuary ? 0.08 : 1.0;
          roof.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
              mat.transparent = true;
              mat.opacity += (targetOpacity - mat.opacity) * 0.15;
            }
          });
        });
        meditationRoofsRef.current.forEach((roof) => {
          const targetOpacity = inMeditation ? 0.08 : 1.0;
          roof.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
              mat.transparent = true;
              mat.opacity += (targetOpacity - mat.opacity) * 0.15;
            }
          });
        });
        libraryRoofsRef.current.forEach((roof) => {
          const targetOpacity = inLibrary ? 0.08 : 1.0;
          roof.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
              mat.transparent = true;
              mat.opacity += (targetOpacity - mat.opacity) * 0.15;
            }
          });
        });
        bellRoofsRef.current.forEach((roof) => {
          const targetOpacity = inBell ? 0.08 : 1.0;
          roof.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
              mat.transparent = true;
              mat.opacity += (targetOpacity - mat.opacity) * 0.15;
            }
          });
        });

        // ==========================================
        // PANORAMIC 3RD-PERSON CAMERA INTERPOLATION (CAN LOOK UP & AROUND)
        // ==========================================
        const dist = cameraDistRef.current;
        const pitch = cameraPitchRef.current; // ranges from -0.92 (looking up at sky/pagoda) to 0.95 (looking down)
        const yaw = cameraYawRef.current;

        if (cameraModeRef.current === 'ON_RAINY_DAYS') {
          // Dedicated High-Angle Top-Down View matching the "On Rainy Days" anime artwork
          const targetCamX = -27.5;
          const targetCamY = 16.8;
          const targetCamZ = 36.05;

          camera.position.x += (targetCamX - camera.position.x) * 0.08;
          camera.position.y += (targetCamY - camera.position.y) * 0.08;
          camera.position.z += (targetCamZ - camera.position.z) * 0.08;

          const lookTargetX = -27.5;
          const lookTargetY = 0.85;
          const lookTargetZ = 36.0;

          cameraLookAtRef.current.x += (lookTargetX - cameraLookAtRef.current.x) * 0.1;
          cameraLookAtRef.current.y += (lookTargetY - cameraLookAtRef.current.y) * 0.1;
          cameraLookAtRef.current.z += (lookTargetZ - cameraLookAtRef.current.z) * 0.1;

          camera.lookAt(cameraLookAtRef.current);
        } else if (cameraModeRef.current === 'THIRD_PERSON') {
          // Unit vector for camera forward look direction
          const forwardDirX = -Math.sin(yaw) * Math.cos(pitch);
          const forwardDirY = -Math.sin(pitch); // When pitch < 0, forwardDirY > 0 (points UP into the sky!)
          const forwardDirZ = -Math.cos(yaw) * Math.cos(pitch);

          // Focus pivot point near character upper body
          const pivotX = currentP.x;
          const pivotY = currentP.y + 1.4;
          const pivotZ = currentP.z;

          // Camera placed behind character along reverse look vector
          const targetCamX = pivotX - forwardDirX * dist;
          // Clamp camera Y above ground so it never clips through floor when looking up
          const targetCamY = Math.max(0.45, pivotY - forwardDirY * dist);
          const targetCamZ = pivotZ - forwardDirZ * dist;

          camera.position.x += (targetCamX - camera.position.x) * 0.14;
          camera.position.y += (targetCamY - camera.position.y) * 0.14;
          camera.position.z += (targetCamZ - camera.position.z) * 0.14;

          // Look-at target placed well ahead along forward look direction
          // When looking up (pitch < 0), target elevates up to 25m into the sky!
          const lookAheadDist = 24.0;
          const targetLookX = pivotX + forwardDirX * lookAheadDist;
          const targetLookY = Math.max(0.2, pivotY + forwardDirY * lookAheadDist);
          const targetLookZ = pivotZ + forwardDirZ * lookAheadDist;

          cameraLookAtRef.current.x += (targetLookX - cameraLookAtRef.current.x) * 0.18;
          cameraLookAtRef.current.y += (targetLookY - cameraLookAtRef.current.y) * 0.18;
          cameraLookAtRef.current.z += (targetLookZ - cameraLookAtRef.current.z) * 0.18;

          camera.lookAt(cameraLookAtRef.current);
        } else {
          // ISOMETRIC 3/4 TOP-DOWN CAMERA
          const camOffsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
          const camOffsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;
          const camOffsetY = Math.sin(pitch) * dist + 2.5;

          const targetCamX = currentP.x + camOffsetX;
          const targetCamY = currentP.y + camOffsetY;
          const targetCamZ = currentP.z + camOffsetZ;

          camera.position.x += (targetCamX - camera.position.x) * 0.085;
          camera.position.y += (targetCamY - camera.position.y) * 0.085;
          camera.position.z += (targetCamZ - camera.position.z) * 0.085;

          const lookTargetX = currentP.x;
          const lookTargetY = currentP.y + 1.2;
          const lookTargetZ = currentP.z;

          cameraLookAtRef.current.x += (lookTargetX - cameraLookAtRef.current.x) * 0.12;
          cameraLookAtRef.current.y += (lookTargetY - cameraLookAtRef.current.y) * 0.12;
          cameraLookAtRef.current.z += (lookTargetZ - cameraLookAtRef.current.z) * 0.12;

          camera.lookAt(cameraLookAtRef.current);
        }
      }

      // Handle Tour Countdown timer
      if (isTourPlayingRef.current && targetPosRef.current === null && tourWaitRef.current > 0) {
        tourWaitRef.current--;
        if (tourWaitRef.current <= 0) {
          const nextIndex = (tourIndexRef.current + 1) % TEMPLE_ZONES.length;
          tourIndexRef.current = nextIndex;
          const targetZone = TEMPLE_ZONES[nextIndex];
          targetPosRef.current = { x: targetZone.pos.x, y: targetZone.pos.y, z: targetZone.pos.z };
          
          if (destinationMarkerRef.current) {
            destinationMarkerRef.current.position.set(targetZone.pos.x, (targetZone.pos.y || 0) + 0.35, targetZone.pos.z);
            destinationMarkerRef.current.visible = true;
          }
        }
      }

      // Update Lotus Cursor Reticle
      if (cursorMarkerGroupRef.current) {
        if (hasGroundTargetRef.current) {
          cursorMarkerGroupRef.current.visible = true;
          cursorMarkerGroupRef.current.position.x += (cursorGroundPosRef.current.x - cursorMarkerGroupRef.current.position.x) * 0.35;
          cursorMarkerGroupRef.current.position.z += (cursorGroundPosRef.current.z - cursorMarkerGroupRef.current.position.z) * 0.35;
          cursorMarkerGroupRef.current.rotation.z += 0.03;
        } else {
          cursorMarkerGroupRef.current.visible = false;
        }
      }

      // Lotus Footsteps Fade Out
      lotusFootstepsRef.current = lotusFootstepsRef.current.filter((foot) => {
        foot.life--;
        const mat = foot.mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = foot.life / 60;
        if (foot.life <= 0) {
          scene.remove(foot.mesh);
          return false;
        }
        return true;
      });

      // Bell Vibration when struck
      if (bellMeshRef.current && bellRingingTimerRef.current > 0) {
        bellRingingTimerRef.current--;
        bellMeshRef.current.rotation.z = Math.sin(stepCount * 0.4) * 0.12;
      } else if (bellMeshRef.current) {
        bellMeshRef.current.rotation.z = 0;
      }

      // Swimming Koi Fish
      koiFishListRef.current.forEach((koi) => {
        koi.angle += koi.speed;
        koi.mesh.position.x = Math.cos(koi.angle) * koi.radius;
        koi.mesh.position.z = Math.sin(koi.angle) * koi.radius;
        koi.mesh.rotation.y = -koi.angle + Math.PI / 2;
        koi.mesh.position.y = 0.75 + Math.sin(stepCount * 0.05 + koi.angle) * 0.08;
      });

      // Bamboo Leaves Sway
      bambooLeavesRef.current.forEach((bG, idx) => {
        bG.rotation.z = Math.sin(stepCount * 0.02 + idx) * 0.05;
      });

      // Vintage Fan Rotating Blades (On Rainy Days Deck)
      if (fanBladesRef.current) {
        fanBladesRef.current.rotation.z += 0.28;
      }

      // Incense Smoke
      if (smokeParticlesRef.current) {
        const posAttr = smokeParticlesRef.current.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let s = 0; s < 70; s++) {
          arr[s * 3 + 1] += 0.04;
          arr[s * 3] += Math.sin(stepCount * 0.04 + s) * 0.012;
          if (arr[s * 3 + 1] > 16) {
            arr[s * 3 + 1] = 3.5;
            arr[s * 3] = (Math.random() - 0.5) * 1.4;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.domElement.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, [handleFeedKoiFish, handleRingBell]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-stone-950 font-sans">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full block cursor-crosshair active:cursor-grabbing"
      />

      {/* "ON RAINY DAYS" WATERCOLOR ANIME TITLE BADGE (MATCHING REFERENCE ARTWORK) */}
      {(cameraMode === 'ON_RAINY_DAYS' || currentZone.id === 'pond') && (
        <div className="absolute top-5 left-6 z-30 pointer-events-auto select-none animate-fadeIn flex flex-col">
          <span className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] flex items-center gap-2">
            <span>On Rainy Days</span>
          </span>
          <span className="text-[11px] sm:text-xs font-serif text-emerald-200/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] tracking-wider">
            Hiên Chiếu Tatami Ven Suối Ngọc · Thanh Tịnh Mùa Hạ
          </span>
          <button
            onClick={() => soundEngine.toggleBGM()}
            className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/60 backdrop-blur-md text-[11px] text-emerald-200 shadow-xl transition cursor-pointer self-start"
            title="Bật/Tắt nhạc nền On Rainy Days"
          >
            <Music className="w-3.5 h-3.5 text-emerald-300" />
            <span>Nhạc thư giãn · On Rainy Days</span>
          </button>
        </div>
      )}

      {/* KOMOREBI FOLIAGE CANOPY OVERLAY (Lush translucent green leaves framing the scene) */}
      {(cameraMode === 'ON_RAINY_DAYS' || currentZone.id === 'pond') && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Top-left leafy branch */}
          <svg className="absolute -top-3 -left-3 w-48 sm:w-72 h-36 sm:h-56 opacity-85 transition-transform duration-1000 ease-in-out" viewBox="0 0 200 150" fill="none">
            <path d="M-10,0 Q60,30 110,80 Q130,100 160,110" stroke="#14532d" strokeWidth="3" fill="none" opacity="0.6" />
            <ellipse cx="40" cy="25" rx="22" ry="12" fill="#22c55e" opacity="0.75" transform="rotate(25 40 25)" />
            <ellipse cx="65" cy="35" rx="24" ry="13" fill="#4ade80" opacity="0.85" transform="rotate(40 65 35)" />
            <ellipse cx="90" cy="55" rx="20" ry="11" fill="#16a34a" opacity="0.8" transform="rotate(50 90 55)" />
            <ellipse cx="115" cy="75" rx="18" ry="10" fill="#86efac" opacity="0.85" transform="rotate(30 115 75)" />
            <ellipse cx="138" cy="95" rx="16" ry="9" fill="#22c55e" opacity="0.75" transform="rotate(65 138 95)" />
            <ellipse cx="30" cy="45" rx="18" ry="10" fill="#15803d" opacity="0.7" transform="rotate(10 30 45)" />
            <ellipse cx="70" cy="65" rx="22" ry="11" fill="#4ade80" opacity="0.8" transform="rotate(-15 70 65)" />
          </svg>

          {/* Top-right leafy canopy */}
          <svg className="absolute -top-3 -right-3 w-56 sm:w-80 h-40 sm:h-64 opacity-90 transition-transform duration-1000 ease-in-out" viewBox="0 0 220 160" fill="none">
            <path d="M230,-10 Q160,40 100,70 Q60,90 20,105" stroke="#14532d" strokeWidth="3.5" fill="none" opacity="0.6" />
            <ellipse cx="180" cy="30" rx="26" ry="14" fill="#22c55e" opacity="0.85" transform="rotate(-30 180 30)" />
            <ellipse cx="145" cy="48" rx="24" ry="13" fill="#4ade80" opacity="0.9" transform="rotate(-45 145 48)" />
            <ellipse cx="110" cy="68" rx="22" ry="12" fill="#86efac" opacity="0.85" transform="rotate(-20 110 68)" />
            <ellipse cx="75" cy="88" rx="19" ry="10" fill="#16a34a" opacity="0.8" transform="rotate(-55 75 88)" />
            <ellipse cx="45" cy="100" rx="16" ry="9" fill="#4ade80" opacity="0.85" transform="rotate(-10 45 100)" />
            <ellipse cx="160" cy="70" rx="20" ry="11" fill="#15803d" opacity="0.75" transform="rotate(25 160 70)" />
            <ellipse cx="120" cy="95" rx="18" ry="10" fill="#22c55e" opacity="0.8" transform="rotate(-35 120 95)" />
          </svg>

          {/* Bottom-right leafy cluster */}
          <svg className="absolute -bottom-3 -right-3 w-48 sm:w-64 h-36 sm:h-52 opacity-85" viewBox="0 0 180 140" fill="none">
            <ellipse cx="150" cy="110" rx="28" ry="15" fill="#16a34a" opacity="0.8" transform="rotate(15 150 110)" />
            <ellipse cx="120" cy="95" rx="24" ry="13" fill="#22c55e" opacity="0.85" transform="rotate(-25 120 95)" />
            <ellipse cx="95" cy="115" rx="20" ry="11" fill="#4ade80" opacity="0.9" transform="rotate(35 95 115)" />
            <ellipse cx="140" cy="75" rx="18" ry="10" fill="#86efac" opacity="0.8" transform="rotate(-10 140 75)" />
          </svg>
        </div>
      )}

      {/* ON RAINY DAYS INTERACTIVE POSE CONTROLLER */}
      {(cameraMode === 'ON_RAINY_DAYS' || currentZone.id === 'pond') && (
        <div className="absolute top-18 sm:top-20 right-3 sm:right-6 z-30 pointer-events-auto flex items-center gap-1.5 bg-stone-900/92 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-500/40 shadow-2xl">
          <span className="text-[11px] font-serif text-emerald-300 px-2 font-bold hidden md:inline">Tư thế:</span>
          <button
            onClick={() => {
              setMonkPose('LIE_DOWN');
              monkPoseRef.current = 'LIE_DOWN';
              playerPosRef.current = { x: -30.0, y: 0.94, z: 36.5 };
              targetPosRef.current = { x: -30.0, y: 0.94, z: 36.5 };
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${monkPose === 'LIE_DOWN' ? 'bg-emerald-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
              }`}
            title="Nằm thảnh thơi dang rộng tay trên chiếu tatami như nhân vật trong tranh"
          >
            <span>🛌 Nằm dang tay</span>
          </button>
          <button
            onClick={() => {
              setMonkPose('SIT_EDGE');
              monkPoseRef.current = 'SIT_EDGE';
              playerPosRef.current = { x: -27.2, y: 0.89, z: 38.5 };
              targetPosRef.current = { x: -27.2, y: 0.89, z: 38.5 };
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${monkPose === 'SIT_EDGE' ? 'bg-emerald-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
              }`}
            title="Ngồi ven hiên gỗ thả chân ngâm dòng suối trong vắt ngắm đàn cá bơi lội"
          >
            <span>🌊 Ngồi thả chân</span>
          </button>
          <button
            onClick={() => {
              setMonkPose('STAND');
              monkPoseRef.current = 'STAND';
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer ${monkPose === 'STAND' ? 'bg-emerald-500 text-stone-950 shadow-md' : 'text-stone-300 hover:bg-stone-800'
              }`}
            title="Đứng dậy bước đi dạo quanh khuôn viên chùa"
          >
            <span>🚶 Đứng</span>
          </button>
        </div>
      )}

      {/* INDOOR SANCTUARY / ROOM BADGE */}
      {currentBuilding && (
        <div className="absolute top-18 sm:top-20 right-4 sm:right-6 z-30 pointer-events-none animate-fadeIn">
          <div className="px-3.5 py-1.5 rounded-full bg-amber-950/90 border border-amber-400/60 text-amber-200 text-xs font-serif font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentBuilding}</span>
          </div>
        </div>
      )}

      {/* TOP BANNER: CURRENT TEMPLE ZONE NOTIFICATION (ANIME STYLE) */}
      {zoneBanner && (
        <div className="absolute top-18 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-fadeIn max-w-[92vw]">
          <div className="anime-glass-panel border-2 border-pink-400/60 px-4 py-2 sm:px-6 sm:py-2.5 rounded-[24px] shadow-[0_12px_36px_rgba(244,114,182,0.35)] flex items-center gap-3">
            <span className="text-2xl sm:text-3xl shrink-0 p-1.5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/40">
              {zoneBanner.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="font-heading font-black text-white text-sm sm:text-base drop-shadow">
                  {zoneBanner.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-200 border border-pink-400/30 text-[10px] font-mono font-bold">
                  {zoneBanner.dimensions}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-purple-200/90 font-sans font-medium line-clamp-1">
                {zoneBanner.subtitle}
              </div>
            </div>
            <button
              onClick={() => setZoneBanner(null)}
              className="text-purple-300 hover:text-white ml-2 text-xs p-1 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTONS WHEN IN ZONE (ANIME GLOWING PROMPTS) */}
      {nearInteractions.length > 0 && (
        <div className="absolute bottom-26 sm:bottom-22 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-wrap items-center justify-center gap-2 max-w-[90vw]">
          {nearInteractions.map((act, i) => (
            <button
              key={i}
              onClick={act.action}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-heading font-black text-xs sm:text-sm shadow-[0_8px_25px_rgba(244,114,182,0.5)] flex items-center gap-2.5 active:scale-95 transition cursor-pointer border border-white/50 animate-bounce"
            >
              <span className="text-lg sm:text-xl">{act.icon}</span>
              <span>{act.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* TOP-LEFT CONTROLLER BAR (ANIME GLASS STYLE) */}
      <div className="absolute top-18 sm:top-20 left-3 sm:left-6 z-30 pointer-events-auto flex items-center gap-2">
        <button
          onClick={toggleTour}
          className={`px-3.5 py-2 rounded-2xl font-heading text-xs font-black shadow-xl flex items-center gap-2 transition-all cursor-pointer border ${isTourPlaying
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-300 ring-2 ring-pink-400/50 shadow-[0_0_18px_rgba(244,114,182,0.5)]'
              : 'anime-glass-panel hover:bg-white/10 text-pink-200 border-pink-400/40 backdrop-blur-md'
            }`}
          title="Tự động dẫn nhân vật vãn cảnh qua 14 danh thắng chùa"
        >
          {isTourPlaying ? <Pause className="w-4 h-4 text-white fill-current" /> : <Play className="w-4 h-4 text-pink-400 fill-current" />}
          <span>{isTourPlaying ? 'Tạm Dừng Vãn Cảnh' : '14 Cảnh Sơn Tự'}</span>
          {isTourPlaying && (
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono">
              {tourIndexRef.current + 1}/14
            </span>
          )}
        </button>

        <button
          onClick={restartFromGate}
          title="Bắt đầu lại bước chân từ Cổng Chùa Tam Quan"
          className="p-2.5 rounded-2xl anime-glass-panel hover:bg-white/10 text-purple-200 hover:text-pink-300 border border-pink-400/30 backdrop-blur-md shadow-xl transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Panoramic 3rd-Person vs Isometric Mode Switcher */}
        <button
          onClick={toggleCameraMode}
          className="px-3 py-2 rounded-2xl font-heading text-xs font-black shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border anime-glass-panel hover:bg-white/10 text-purple-200 hover:text-white border-pink-400/30"
          title="Chuyển đổi góc nhìn: Toàn Cảnh / On Rainy Days / Trên Cao"
        >
          <Layers className="w-3.5 h-3.5 text-pink-400" />
          <span>{cameraMode === 'THIRD_PERSON' ? '👁️ Toàn Cảnh' : cameraMode === 'ON_RAINY_DAYS' ? '🌧️ On Rainy Days' : '📐 Trên Cao'}</span>
        </button>

        {/* Dedicated "On Rainy Days" Aesthetic View Switcher */}
        <button
          onClick={() => {
            if (cameraMode === 'ON_RAINY_DAYS') {
              setCameraMode('THIRD_PERSON');
              cameraModeRef.current = 'THIRD_PERSON';
              cameraPitchRef.current = -0.12;
              cameraDistRef.current = 6.5;
            } else {
              playerPosRef.current = { x: -27.2, y: 0.89, z: 38.5 };
              targetPosRef.current = { x: -27.2, y: 0.89, z: 38.5 };
              setCameraMode('ON_RAINY_DAYS');
              cameraModeRef.current = 'ON_RAINY_DAYS';
              setMonkPose('SIT_EDGE');
              monkPoseRef.current = 'SIT_EDGE';
              const pondZone = TEMPLE_ZONES.find((z) => z.id === 'pond') || TEMPLE_ZONES[4];
              setCurrentZone(pondZone);
              setZoneBanner(pondZone);
            }
          }}
          className={`px-3 py-2 rounded-2xl font-heading text-xs font-black shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border ${cameraMode === 'ON_RAINY_DAYS'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300 ring-2 ring-emerald-400/50 shadow-[0_0_16px_rgba(52,211,153,0.5)]'
              : 'anime-glass-panel hover:bg-white/10 text-emerald-300 border-emerald-500/40'
            }`}
          title="Bật giao diện & góc nhìn nghệ thuật 'On Rainy Days'"
        >
          <span>🌸 On Rainy Days</span>
        </button>

        {/* Quick Pitch Tilt Button */}
        <button
          onClick={() => {
            cameraPitchRef.current = cameraPitchRef.current < -0.3 ? -0.08 : -0.62;
          }}
          className="px-2.5 py-2 rounded-2xl font-heading text-xs font-black shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border anime-glass-panel hover:bg-white/10 text-purple-200 hover:text-white border-pink-400/30"
          title="Bấm để ngước nhìn lên cao hoặc nhìn ngang"
        >
          <span>✨ Ngước Lên Trời</span>
        </button>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-2xl anime-glass-panel border border-pink-400/30 text-pink-200 text-xs font-sans font-bold shadow-xl">
          <Eye className="w-3.5 h-3.5 text-pink-400" />
          <span>Click chuột để đi • Kéo xoay góc nhìn • Lăn chuột thu phóng</span>
        </div>
      </div>

      {/* ON-SCREEN DIRECTIONAL D-PAD CONTROLLER (ANIME GAMEPAD) */}
      <div className="absolute bottom-20 sm:bottom-18 left-3 sm:left-6 z-30 pointer-events-auto flex flex-col items-center">
        <button
          onPointerDown={() => handleDirectionStart('up')}
          onPointerUp={() => handleDirectionEnd('up')}
          onPointerLeave={() => handleDirectionEnd('up')}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl anime-glass-panel hover:bg-pink-500/30 active:bg-pink-500 border border-pink-400/40 text-pink-200 active:text-white shadow-xl flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Tiến thẳng theo hướng nhìn (W hoặc Mũi tên lên)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5 my-1">
          <button
            onPointerDown={() => handleDirectionStart('left')}
            onPointerUp={() => handleDirectionEnd('left')}
            onPointerLeave={() => handleDirectionEnd('left')}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl anime-glass-panel hover:bg-pink-500/30 active:bg-pink-500 border border-pink-400/40 text-pink-200 active:text-white shadow-xl flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Rẽ trái (A hoặc Mũi tên trái)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-950/60 border border-pink-400/30 flex items-center justify-center text-pink-400 text-xs sm:text-sm select-none shadow-inner font-bold" title="WASD / Phím Mũi Tên">
            ✦
          </div>

          <button
            onPointerDown={() => handleDirectionStart('right')}
            onPointerUp={() => handleDirectionEnd('right')}
            onPointerLeave={() => handleDirectionEnd('right')}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl anime-glass-panel hover:bg-pink-500/30 active:bg-pink-500 border border-pink-400/40 text-pink-200 active:text-white shadow-xl flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Rẽ phải (D hoặc Mũi tên phải)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <button
          onPointerDown={() => handleDirectionStart('down')}
          onPointerUp={() => handleDirectionEnd('down')}
          onPointerLeave={() => handleDirectionEnd('down')}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl anime-glass-panel hover:bg-pink-500/30 active:bg-pink-500 border border-pink-400/40 text-pink-200 active:text-white shadow-xl flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Lùi lại (S hoặc Mũi tên xuống)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* BOTTOM DOCK: 14 ARCHITECTURAL ZONES DOCK (ANIME HORIZONTAL SCROLL) */}
      <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-20 pointer-events-auto">
        <div className="anime-glass-panel border border-pink-400/40 p-2 sm:p-2.5 rounded-[24px] shadow-2xl flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-heading font-black text-pink-300 px-2 flex items-center gap-1.5 shrink-0 hidden md:flex">
              <Footprints className="w-4 h-4 text-pink-400" />
              <span>14 Cảnh Chùa:</span>
            </span>

            {TEMPLE_ZONES.map((zone, idx) => {
              const isHere = currentZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => navigateToZone(zone)}
                  title={`${zone.name} (${zone.subtitle})`}
                  className={`px-3 py-1.5 rounded-xl font-heading text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${isHere
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-[0_0_15px_rgba(244,114,182,0.6)] border border-white/50 scale-105'
                      : 'bg-purple-950/40 hover:bg-purple-900/50 border border-pink-400/20 text-purple-200 hover:text-white'
                    }`}
                >
                  <span>{zone.icon}</span>
                  <span className="text-[11px] font-bold hidden sm:inline">{zone.name.split('.')[1] || zone.name}</span>
                  {idx < TEMPLE_ZONES.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-purple-400/40 hidden xl:inline" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Day / Night Atmosphere Toggle */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            title="Bật/Tắt chế độ Ánh Sáng Đèn Lồng Ban Đêm"
            className={`p-2.5 rounded-xl text-xs font-heading font-bold transition cursor-pointer border shrink-0 ${isNightMode ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-purple-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]' : 'text-purple-200 hover:bg-white/10 border-pink-400/30'
              }`}
          >
            {isNightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
// ==========================================
// STYLIZED 3D ASSET BUILDERS (FANTASY ZEN MONASTERY)
// ==========================================

// Puffy Stylized Foliage Tree (Ghibli / Zelda Style)
function createStylizedPuffyTree(): THREE.Group {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.55, 3.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
  );
  trunk.position.set(0, 1.6, 0);
  trunk.castShadow = true;
  tree.add(trunk);

  // Overlapping puffy foliage spheres
  const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.75 });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.7 });
  const foliageMat3 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });

  const c1 = new THREE.Mesh(new THREE.SphereGeometry(2.1, 10, 10), foliageMat1);
  c1.position.set(0, 3.8, 0);
  tree.add(c1);

  const c2 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8), foliageMat2);
  c2.position.set(0.9, 4.4, 0.4);
  tree.add(c2);

  const c3 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), foliageMat3);
  c3.position.set(-0.8, 4.2, -0.5);
  tree.add(c3);

  const cTop = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), foliageMat2);
  cTop.position.set(0, 5.2, 0);
  tree.add(cTop);

  return tree;
}

// Stylized Curved Tile Roof with Upturned Dragon Eaves
function createStylizedCurvedRoof(width: number, depth: number, matTile: THREE.Material): THREE.Group {
  const roofGroup = new THREE.Group();
  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.7, depth * 0.4, 4), matTile);
  roof.rotateY(Math.PI / 4);
  roof.scale.set(1.0, 0.4, depth / width);
  roof.castShadow = true;
  roofGroup.add(roof);

  // 4 Upturned Corner Eaves
  const r = width * 0.46;
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
    const finial = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.18, 6, 12, Math.PI * 0.75), matTile);
    finial.position.set(Math.cos(a) * r, -depth * 0.08, Math.sin(a) * r * (depth / width));
    finial.rotation.z = Math.PI / 4;
    roofGroup.add(finial);
  }
  return roofGroup;
}

// Sweeping Jade-Green Glazed Tile Roof with Upturned Corners and Ornamental Crests
function createJadeCurvedRoof(
  width: number,
  depth: number,
  height: number,
  matJadeTile: THREE.Material,
  matGold: THREE.Material
): THREE.Group {
  const roofGroup = new THREE.Group();

  // Main flared 4-sided pyramid roof
  const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.72, height, 4), matJadeTile);
  mainRoof.rotateY(Math.PI / 4);
  mainRoof.scale.set(1.0, 1.0, depth / width);
  mainRoof.position.set(0, height / 2, 0);
  mainRoof.castShadow = true;
  roofGroup.add(mainRoof);

  // Eave border trim (mép ngói trích thủy)
  const eaveTrim = new THREE.Mesh(new THREE.BoxGeometry(width * 0.98, 0.18, depth * 0.98), matJadeTile);
  eaveTrim.position.set(0, 0.09, 0);
  roofGroup.add(eaveTrim);

  // 4 Upturned Dragon-Tail Corner Eaves (Đao cong ngói ngọc)
  const r = width * 0.52;
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
    const finial = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.22, 8, 16, Math.PI * 0.8), matJadeTile);
    finial.position.set(Math.cos(a) * r, 0.35, Math.sin(a) * r * (depth / width));
    finial.rotation.z = Math.PI / 3.5;
    finial.rotation.y = a - Math.PI / 4;
    roofGroup.add(finial);

    // Golden tip accent on the eave horn
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 6), matGold);
    tip.position.set(Math.cos(a) * (r + 0.35), 0.85, Math.sin(a) * (r + 0.35) * (depth / width));
    tip.rotation.z = -Math.PI / 4;
    roofGroup.add(tip);
  }

  // 4 Hip Ridge Cappers (Bờ giải ngói ống)
  for (let i = 0; i < 4; i++) {
    const ridgeAngle = (i * Math.PI) / 2 + Math.PI / 4;
    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, width * 0.65, 6), matJadeTile);
    ridge.position.set(
      (Math.cos(ridgeAngle) * width) / 4,
      height / 2,
      (Math.sin(ridgeAngle) * depth) / 4
    );
    ridge.rotation.z = Math.PI / 4;
    ridge.rotation.y = ridgeAngle;
    roofGroup.add(ridge);
  }

  return roofGroup;
}

// Bracket Corbel Ring (Hệ Đấu Củng Tam Cấp)
function createBracketCorbelRing(width: number, y: number, matDarkTimber: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  g.position.set(0, y, 0);

  for (let s = 0; s < 4; s++) {
    const angle = (s * Math.PI) / 2;
    for (let bx = -width * 0.35; bx <= width * 0.35; bx += width * 0.28) {
      const bracket = new THREE.Group();
      // Tier 1 corbel
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.65), matDarkTimber);
      b1.position.set(0, -0.11, 0.2);
      bracket.add(b1);
      // Tier 2 corbel
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.18, 0.45), matDarkTimber);
      b2.position.set(0, 0.08, 0.35);
      bracket.add(b2);

      const rotX = Math.cos(angle) * bx - Math.sin(angle) * (width / 2);
      const rotZ = Math.sin(angle) * bx + Math.cos(angle) * (width / 2);
      bracket.position.set(rotX, 0, rotZ);
      bracket.rotation.y = angle;
      g.add(bracket);
    }
  }

  return g;
}

// Sweeping Multi-Slope Roof with Upturned Corners and Dragon Ridge Crests
function createSweepingHallRoof(
  width: number,
  depth: number,
  height: number,
  matTile: THREE.Material,
  matGold: THREE.Material
): THREE.Group {
  const g = new THREE.Group();

  // Main 4-slope hip roof
  const roofMesh = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.72, height, 4),
    matTile
  );
  roofMesh.rotateY(Math.PI / 4);
  roofMesh.scale.set(1.0, 1.0, depth / width);
  roofMesh.position.set(0, height / 2, 0);
  roofMesh.castShadow = true;
  g.add(roofMesh);

  // Eave border trim (mép ngói trích thủy)
  const eaveTrim = new THREE.Mesh(new THREE.BoxGeometry(width * 0.98, 0.18, depth * 0.98), matTile);
  eaveTrim.position.set(0, 0.09, 0);
  g.add(eaveTrim);

  // 4 Upturned Dragon-Tail Corner Eaves (Đao cong ngói ngọc vút lên trời)
  const r = width * 0.52;
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
    const finial = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.28, 8, 16, Math.PI * 0.8),
      matTile
    );
    finial.position.set(Math.cos(a) * r, 0.45, Math.sin(a) * r * (depth / width));
    finial.rotation.z = Math.PI / 3.2;
    finial.rotation.y = a - Math.PI / 4;
    g.add(finial);

    // Golden Dragon Crest at Corner
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.75, 6), matGold);
    crest.position.set(Math.cos(a) * (r + 0.45), 1.15, Math.sin(a) * (r + 0.45) * (depth / width));
    crest.rotation.z = -Math.PI / 4;
    g.add(crest);
  }

  // Ridge Capping with Kìm Nóc (Dragon-fish ridge crests) at ends of main ridge
  const ridgeLen = (width - depth) * 0.85;
  if (ridgeLen > 2) {
    const ridgeBar = new THREE.Mesh(new THREE.BoxGeometry(ridgeLen, 0.35, 0.45), matTile);
    ridgeBar.position.set(0, height + 0.15, 0);
    g.add(ridgeBar);

    for (const rx of [-ridgeLen / 2, ridgeLen / 2]) {
      const kimNoc = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.18, 6, 12, Math.PI * 0.75), matGold);
      kimNoc.position.set(rx, height + 0.45, 0);
      kimNoc.rotation.z = rx < 0 ? Math.PI / 4 : -Math.PI / 4;
      g.add(kimNoc);
    }
  }

  return g;
}

// Authentic Main Sanctuary Complex (Đại Hùng Bảo Điện theo bản vẽ phát thảo)
function createAuthenticDaiHungBaoDien(
  matJadeTile: THREE.Material,
  matAmberWood: THREE.Material,
  matDarkTimber: THREE.Material,
  matLotusPlinth: THREE.Material,
  matStone: THREE.Material,
  matFloorBrick: THREE.Material,
  matGold: THREE.Material,
  matLanternRed: THREE.Material,
  sanctuaryRoofsRef: React.MutableRefObject<THREE.Group[]>,
  nightLightsRef: React.MutableRefObject<THREE.PointLight[]>
): THREE.Group {
  const mainHall = new THREE.Group();
  mainHall.position.set(0, 0, -16);

  // 1. MASSIVE STONE PODIUM (BỆ TAM CẤP CAO RÁO)
  // Lower Podium Base
  const podiumBase = new THREE.Mesh(new THREE.BoxGeometry(46, 1.6, 34), matLotusPlinth);
  podiumBase.position.set(0, 0.8, 0);
  podiumBase.receiveShadow = true;
  mainHall.add(podiumBase);

  // Upper Terrace Platform (at Y = 3.2m)
  const podiumTop = new THREE.Mesh(new THREE.BoxGeometry(43, 1.6, 31), matFloorBrick);
  podiumTop.position.set(0, 2.4, 0);
  podiumTop.receiveShadow = true;
  mainHall.add(podiumTop);

  // Perimeter Stone Balustrade on Terrace (Lan can đá quanh sân thượng)
  const balustradeGroup = new THREE.Group();
  const frontBalustradeSegments = [
    { x: -14.5, w: 7.5 },
    { x: -4.5, w: 3.5 },
    { x: 4.5, w: 3.5 },
    { x: 14.5, w: 7.5 },
  ];
  frontBalustradeSegments.forEach((seg) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(seg.w, 0.9, 0.28), matStone);
    rail.position.set(seg.x, 3.65, 15.2);
    balustradeGroup.add(rail);

    for (let px = -seg.w / 2; px <= seg.w / 2; px += 2.0) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.1, 0.32), matStone);
      post.position.set(seg.x + px, 3.75, 15.2);
      balustradeGroup.add(post);

      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 6), matGold);
      bud.position.set(seg.x + px, 4.4, 15.2);
      balustradeGroup.add(bud);
    }
  });

  for (const sx of [-21.4, 21.4]) {
    const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 28), matStone);
    sideRail.position.set(sx, 3.65, 0);
    balustradeGroup.add(sideRail);
  }
  mainHall.add(balustradeGroup);

  // 2. THREE PARALLEL GRAND STAIRCASES (TAM CẤP TIỀN ĐIỆN)
  const stairFlightConfigs = [
    { x: 0, width: 4.8, isCenter: true },
    { x: -8.8, width: 3.2, isCenter: false },
    { x: 8.8, width: 3.2, isCenter: false },
  ];

  stairFlightConfigs.forEach((st) => {
    const flightGroup = new THREE.Group();
    flightGroup.position.set(st.x, 0, 15.5);

    const numSteps = 10;
    const stepDepth = 0.65;
    const stepHeight = 0.32;

    for (let s = 0; s < numSteps; s++) {
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(st.width, stepHeight, stepDepth + 0.05),
        matStone
      );
      stepMesh.position.set(0, (s + 0.5) * stepHeight, (numSteps - 1 - s) * stepDepth);
      stepMesh.receiveShadow = true;
      flightGroup.add(stepMesh);
    }

    // Flanking Carved Stone Dragon / Cloud Balustrade Ramps
    for (const rx of [-st.width / 2 - 0.2, st.width / 2 + 0.2]) {
      const rampLength = Math.hypot(numSteps * stepDepth, numSteps * stepHeight);
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.65, rampLength), matStone);
      ramp.position.set(rx, (numSteps * stepHeight) / 2 + 0.35, (numSteps * stepDepth) / 2);
      ramp.rotation.x = Math.atan2(numSteps * stepHeight, numSteps * stepDepth);
      flightGroup.add(ramp);

      const dragonHead = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.7, 0.65), matStone);
      dragonHead.position.set(rx, 0.45, numSteps * stepDepth + 0.2);
      flightGroup.add(dragonHead);
    }

    mainHall.add(flightGroup);
  });

  // 3. TWO FLANKING SIDE PAVILIONS (ĐÌNH TẢ & ĐÌNH HỮU THEO BẢN VẼ)
  const pavilionConfigs = [
    { x: -19.5, z: 12.5 },
    { x: 19.5, z: 12.5 },
  ];

  pavilionConfigs.forEach((pav) => {
    const pavGroup = new THREE.Group();
    pavGroup.position.set(pav.x, 3.2, pav.z);

    const colDist = 2.4;
    for (const cx of [-colDist, colDist]) {
      for (const cz of [-colDist, colDist]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 5.0, 8), matDarkTimber);
        col.position.set(cx, 2.5, cz);
        col.castShadow = true;
        pavGroup.add(col);
      }
    }

    const pavRoof = createJadeCurvedRoof(7.2, 7.2, 2.8, matJadeTile, matGold);
    pavRoof.position.set(0, 5.0, 0);
    sanctuaryRoofsRef.current.push(pavRoof);
    pavGroup.add(pavRoof);

    // Stone Steps leading down to side courtyard
    for (let st = 0; st < 8; st++) {
      const sMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 0.6), matStone);
      const sideDir = pav.x < 0 ? -1 : 1;
      sMesh.position.set(sideDir * (colDist + 1.2 + st * 0.55), -(st + 0.5) * 0.38, 0);
      pavGroup.add(sMesh);
    }

    mainHall.add(pavGroup);
  });

  // 4. MAIN SANCTUARY BUILDING BODY (TIỀN ĐƯỜNG & HẬU CUNG)
  const hallBodyGroup = new THREE.Group();
  hallBodyGroup.position.set(0, 3.2, 0);

  const bodyW = 32;
  const bodyD = 22;
  const bodyH = 6.8;

  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, 0.5), matAmberWood);
  wallBack.position.set(0, bodyH / 2, -bodyD / 2);
  hallBodyGroup.add(wallBack);

  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, bodyH, bodyD), matAmberWood);
  wallLeft.position.set(-bodyW / 2, bodyH / 2, 0);
  hallBodyGroup.add(wallLeft);

  const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, bodyH, bodyD), matAmberWood);
  wallRight.position.set(bodyW / 2, bodyH / 2, 0);
  hallBodyGroup.add(wallRight);

  // Front Colonnade (8 Wooden Columns across front veranda)
  for (let c = -3.5; c <= 3.5; c += 1.0) {
    const colX = c * 4.2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, bodyH + 0.5, 10), matDarkTimber);
    col.position.set(colX, bodyH / 2, bodyD / 2 + 1.8);
    col.castShadow = true;
    hallBodyGroup.add(col);

    if (Math.abs(c) < 3.0) {
      const doorW = 3.6;
      const doorH = 5.2;

      const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.2, doorH, 0.2), matDarkTimber);
      frameL.position.set(colX - doorW / 2, doorH / 2, bodyD / 2);
      hallBodyGroup.add(frameL);
      const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.2, doorH, 0.2), matDarkTimber);
      frameR.position.set(colX + doorW / 2, doorH / 2, bodyD / 2);
      hallBodyGroup.add(frameR);
      const frameTop = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.25, 0.2), matDarkTimber);
      frameTop.position.set(colX, doorH, bodyD / 2);
      hallBodyGroup.add(frameTop);

      const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.2, doorH - 0.2, 0.12), matAmberWood);
      doorPanel.position.set(colX, doorH / 2, bodyD / 2);
      hallBodyGroup.add(doorPanel);

      for (const kx of [-0.6, 0.6]) {
        const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 12), matGold);
        knocker.position.set(colX + kx, doorH * 0.45, bodyD / 2 + 0.1);
        hallBodyGroup.add(knocker);
      }
    }
  }

  // Clerestory Upper Wall (Cổ diêm lấy sáng)
  const clerestory = new THREE.Mesh(new THREE.BoxGeometry(26, 2.4, 18), matAmberWood);
  clerestory.position.set(0, bodyH + 1.2, -1.0);
  hallBodyGroup.add(clerestory);

  // 5. MULTI-TIER INTERLOCKING ROOFS ("TRÙNG THIỀM ĐIỆP ỐC")
  // Roof 1: Lower Front & Side Sweeping Flared Roof
  const roof1Group = createSweepingHallRoof(38, 28, 4.2, matJadeTile, matGold);
  roof1Group.position.set(0, bodyH + 0.2, 1.0);
  sanctuaryRoofsRef.current.push(roof1Group);
  hallBodyGroup.add(roof1Group);

  // Roof 2: Upper Clerestory Stepped Roof
  const roof2Group = createSweepingHallRoof(28, 20, 3.8, matJadeTile, matGold);
  roof2Group.position.set(0, bodyH + 3.4, -1.0);
  sanctuaryRoofsRef.current.push(roof2Group);
  hallBodyGroup.add(roof2Group);

  // Roof 3: Rear High Sanctuary Crown Tower (Lầu Nóc Hậu Cung theo bản vẽ)
  const crownTower = new THREE.Group();
  crownTower.position.set(0, bodyH + 3.8, -4.5);

  const crownBody = new THREE.Mesh(new THREE.BoxGeometry(16, 2.8, 14), matAmberWood);
  crownBody.position.set(0, 1.4, 0);
  crownTower.add(crownBody);

  const crownRoof = createJadeCurvedRoof(18.5, 16.5, 4.0, matJadeTile, matGold);
  crownRoof.position.set(0, 2.8, 0);
  sanctuaryRoofsRef.current.push(crownRoof);
  crownTower.add(crownRoof);

  const crownSpire = new THREE.Mesh(
    new THREE.ConeGeometry(0.65, 2.8, 8),
    matGold
  );
  crownSpire.position.set(0, 6.8, 0);
  crownTower.add(crownSpire);

  hallBodyGroup.add(crownTower);

  // 6. GRAND INTERIOR (NỘI THẤT ĐẠI HÙNG BẢO ĐIỆN)
  const altarGroup = new THREE.Group();
  altarGroup.position.set(0, 0, -5.5);

  const altarTable = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.4, 3.5), matGold);
  altarTable.position.set(0, 0.7, 0);
  altarGroup.add(altarTable);

  const throne1 = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 0.65, 16), matGold);
  throne1.position.set(0, 1.7, 0);
  altarGroup.add(throne1);

  const throne2 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.55, 16), matGold);
  throne2.position.set(0, 2.3, 0);
  altarGroup.add(throne2);

  const buddhaTorso = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.5, 2.5, 12), matGold);
  buddhaTorso.position.set(0, 4.2, 0);
  altarGroup.add(buddhaTorso);

  const buddhaHead = new THREE.Mesh(new THREE.SphereGeometry(1.0, 14, 14), matGold);
  buddhaHead.position.set(0, 5.8, 0);
  altarGroup.add(buddhaHead);

  const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), matGold);
  ushnisha.position.set(0, 6.7, 0);
  altarGroup.add(ushnisha);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(2.0, 3.2, 24),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
  );
  halo.position.set(0, 5.8, -0.6);
  altarGroup.add(halo);

  const buddhaLight = new THREE.PointLight(0xfef08a, 2.2, 18);
  buddhaLight.position.set(0, 5.8, 2.0);
  nightLightsRef.current.push(buddhaLight);
  altarGroup.add(buddhaLight);

  const altarCenser = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.65, 10), matDarkTimber);
  altarCenser.position.set(0, 1.6, 1.2);
  altarGroup.add(altarCenser);

  hallBodyGroup.add(altarGroup);

  // Meditation cushions
  for (let row = -1; row <= 2; row++) {
    for (let col = -3; col <= 3; col++) {
      if (Math.abs(col) < 1 && row < 1) continue;
      const cushion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.18, 12),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 })
      );
      cushion.position.set(col * 2.8, 0.1, 4.0 - row * 2.4);
      hallBodyGroup.add(cushion);
    }
  }

  // 2nd Floor Balcony
  const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.45, 8.5), matDarkTimber);
  balconyFloor.position.set(0, 7.2, 6.5);
  hallBodyGroup.add(balconyFloor);

  const balconyRailing = new THREE.Mesh(new THREE.BoxGeometry(30, 1.0, 0.25), matAmberWood);
  balconyRailing.position.set(0, 8.1, 10.5);
  hallBodyGroup.add(balconyRailing);

  // Hanging Silk Lanterns
  for (let lx = -10; lx <= 10; lx += 5) {
    const lantern = createStylizedSilkLantern(matLanternRed);
    lantern.position.set(lx, 6.2, 5.5);
    hallBodyGroup.add(lantern);

    const lLight = new THREE.PointLight(0xf87171, 0.65, 8);
    lLight.position.set(lx, 5.6, 5.5);
    nightLightsRef.current.push(lLight);
    hallBodyGroup.add(lLight);
  }

  mainHall.add(hallBodyGroup);

  return mainHall;
}

// Authentic 3-Tier Jade Buddhist Pagoda Tower (Bảo Tháp Men Ngọc 3 Tầng theo bản vẽ mẫu)
function createAuthenticJadePagoda(
  matJadeTile: THREE.Material,
  matAmberWood: THREE.Material,
  matDarkTimber: THREE.Material,
  matLotusPlinth: THREE.Material,
  matGold: THREE.Material,
  nightLightsRef: React.MutableRefObject<THREE.PointLight[]>
): THREE.Group {
  const pagoda = new THREE.Group();

  // 1. MULTI-TIER LOTUS PEDESTAL BASE (ĐÀI SEN TAM CẤP)
  // Step 1: Base plinth
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 18), matLotusPlinth);
  base1.position.set(0, 0.6, 0);
  base1.receiveShadow = true;
  pagoda.add(base1);

  // Step 2: Middle plinth with chamfer
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(15.5, 1.0, 15.5), matLotusPlinth);
  base2.position.set(0, 1.7, 0);
  base2.receiveShadow = true;
  pagoda.add(base2);

  // Step 3: Upper lotus seat platform with projecting lotus petal corbels
  const base3 = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.8, 13.5), matAmberWood);
  base3.position.set(0, 2.6, 0);
  base3.receiveShadow = true;
  pagoda.add(base3);

  // Carved lotus petals (24 petals around the 4 sides of the plinth)
  for (let side = 0; side < 4; side++) {
    const angle = (side * Math.PI) / 2;
    for (let p = -5; p <= 5; p += 2) {
      const petal = new THREE.Mesh(
        new THREE.ConeGeometry(0.75, 1.2, 5),
        matLotusPlinth
      );
      petal.rotation.x = Math.PI / 2;
      petal.rotation.z = Math.PI / 4;
      const px = p * 1.15;
      const pz = 6.9;
      petal.position.set(
        Math.cos(angle) * px - Math.sin(angle) * pz,
        2.5,
        Math.sin(angle) * px + Math.cos(angle) * pz
      );
      pagoda.add(petal);
    }
  }

  // Front stone steps leading to Tier 1 terrace
  for (let st = 0; st < 6; st++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 0.8), matLotusPlinth);
    step.position.set(0, 0.22 + st * 0.45, 9.2 + (5 - st) * 0.65);
    pagoda.add(step);
  }

  // Tier 1 Terrace Balustrade Railing (Lan can chạm khắc)
  const railingGroup = new THREE.Group();
  for (const sideAngle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    for (let rx = -6.2; rx <= 6.2; rx += 1.8) {
      if (sideAngle === 0 && Math.abs(rx) < 2.2) continue; // Entrance gap
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.05, 0.22), matDarkTimber);
      const postRotX = Math.cos(sideAngle) * rx - Math.sin(sideAngle) * 6.6;
      const postRotZ = Math.sin(sideAngle) * rx + Math.cos(sideAngle) * 6.6;
      post.position.set(postRotX, 3.5, postRotZ);
      railingGroup.add(post);

      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 6), matAmberWood);
      bud.position.set(postRotX, 4.15, postRotZ);
      railingGroup.add(bud);
    }
    if (sideAngle === 0) {
      const leftRail = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 0.18), matDarkTimber);
      leftRail.position.set(-4.2, 3.9, 6.6);
      railingGroup.add(leftRail);
      const rightRail = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 0.18), matDarkTimber);
      rightRail.position.set(4.2, 3.9, 6.6);
      railingGroup.add(rightRail);
    } else {
      const railBar = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.14, 0.18), matDarkTimber);
      railBar.position.set(
        -Math.sin(sideAngle) * 6.6,
        3.9,
        Math.cos(sideAngle) * 6.6
      );
      railBar.rotation.y = sideAngle;
      railingGroup.add(railBar);
    }
  }
  pagoda.add(railingGroup);

  // Helper to create Arched Door & Flanking Circular Medallions on a facade
  const createFacadeDecor = (width: number, height: number, hasDoor: boolean) => {
    const fGroup = new THREE.Group();

    if (hasDoor) {
      const dw = width * 0.28;
      const dh = height * 0.78;
      const fL = new THREE.Mesh(new THREE.BoxGeometry(0.18, dh * 0.75, 0.22), matDarkTimber);
      fL.position.set(-dw / 2, dh * 0.38, 0);
      fGroup.add(fL);
      const fR = new THREE.Mesh(new THREE.BoxGeometry(0.18, dh * 0.75, 0.22), matDarkTimber);
      fR.position.set(dw / 2, dh * 0.38, 0);
      fGroup.add(fR);

      const archTop = new THREE.Mesh(
        new THREE.TorusGeometry(dw / 2, 0.12, 8, 16, Math.PI),
        matDarkTimber
      );
      archTop.position.set(0, dh * 0.75, 0);
      fGroup.add(archTop);

      const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.15, dh * 0.72, 0.12), matAmberWood);
      doorPanel.position.set(0, dh * 0.36, -0.05);
      fGroup.add(doorPanel);

      const doorMoon = new THREE.Mesh(new THREE.CircleGeometry(dw / 2 - 0.08, 16, 0, Math.PI), matAmberWood);
      doorMoon.position.set(0, dh * 0.75, -0.05);
      fGroup.add(doorMoon);

      const divider = new THREE.Mesh(new THREE.BoxGeometry(0.06, dh * 0.72, 0.14), matDarkTimber);
      divider.position.set(0, dh * 0.36, 0);
      fGroup.add(divider);

      for (const kx of [-dw * 0.22, dw * 0.22]) {
        const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 6, 12), matGold);
        knocker.position.set(kx, dh * 0.45, 0.08);
        fGroup.add(knocker);
      }
    }

    // Circular Medallions (Họa tiết nguyệt luân hoa sen) on left and right
    for (const mx of [-width * 0.32, width * 0.32]) {
      for (const my of [height * 0.35, height * 0.7]) {
        const medallion = new THREE.Group();
        medallion.position.set(mx, my, 0.04);

        const outerRing = new THREE.Mesh(new THREE.TorusGeometry(width * 0.09, 0.05, 8, 16), matDarkTimber);
        medallion.add(outerRing);

        const innerFlower = new THREE.Mesh(new THREE.CircleGeometry(width * 0.08, 12), matAmberWood);
        medallion.add(innerFlower);

        const centerBoss = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), matGold);
        centerBoss.position.z = 0.06;
        medallion.add(centerBoss);

        fGroup.add(medallion);
      }
    }

    return fGroup;
  };

  // 2. TIER 1 (TẦNG 1): Wide lower pavilion
  const t1Y = 3.0;
  const t1W = 9.8;
  const t1H = 4.6;

  const t1Body = new THREE.Mesh(new THREE.BoxGeometry(t1W, t1H, t1W), matAmberWood);
  t1Body.position.set(0, t1Y + t1H / 2, 0);
  t1Body.castShadow = true;
  pagoda.add(t1Body);

  for (const cx of [-t1W / 2 + 0.35, t1W / 2 - 0.35]) {
    for (const cz of [-t1W / 2 + 0.35, t1W / 2 - 0.35]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, t1H + 0.2, 10), matDarkTimber);
      col.position.set(cx, t1Y + t1H / 2, cz);
      col.castShadow = true;
      pagoda.add(col);
    }
  }

  for (let f = 0; f < 4; f++) {
    const fAngle = (f * Math.PI) / 2;
    const decor = createFacadeDecor(t1W, t1H, true);
    decor.position.set(
      -Math.sin(fAngle) * (t1W / 2 + 0.02),
      t1Y,
      Math.cos(fAngle) * (t1W / 2 + 0.02)
    );
    decor.rotation.y = fAngle;
    pagoda.add(decor);
  }

  const t1Brackets = createBracketCorbelRing(t1W * 0.95, t1Y + t1H, matDarkTimber);
  pagoda.add(t1Brackets);

  const roof1 = createJadeCurvedRoof(16.5, 16.5, 3.8, matJadeTile, matGold);
  roof1.position.set(0, t1Y + t1H + 0.4, 0);
  pagoda.add(roof1);

  // 3. TIER 2 (TẦNG 2): Middle tier
  const t2Y = t1Y + t1H + 2.2;
  const t2W = 7.8;
  const t2H = 4.0;

  const t2Body = new THREE.Mesh(new THREE.BoxGeometry(t2W, t2H, t2W), matAmberWood);
  t2Body.position.set(0, t2Y + t2H / 2, 0);
  t2Body.castShadow = true;
  pagoda.add(t2Body);

  for (const cx of [-t2W / 2 + 0.3, t2W / 2 - 0.3]) {
    for (const cz of [-t2W / 2 + 0.3, t2W / 2 - 0.3]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, t2H + 0.2, 10), matDarkTimber);
      col.position.set(cx, t2Y + t2H / 2, cz);
      col.castShadow = true;
      pagoda.add(col);
    }
  }

  for (let f = 0; f < 4; f++) {
    const fAngle = (f * Math.PI) / 2;
    const decor = createFacadeDecor(t2W, t2H, true);
    decor.position.set(
      -Math.sin(fAngle) * (t2W / 2 + 0.02),
      t2Y,
      Math.cos(fAngle) * (t2W / 2 + 0.02)
    );
    decor.rotation.y = fAngle;
    pagoda.add(decor);
  }

  const t2Brackets = createBracketCorbelRing(t2W * 0.95, t2Y + t2H, matDarkTimber);
  pagoda.add(t2Brackets);

  const roof2 = createJadeCurvedRoof(13.2, 13.2, 3.4, matJadeTile, matGold);
  roof2.position.set(0, t2Y + t2H + 0.4, 0);
  pagoda.add(roof2);

  // 4. TIER 3 (TẦNG 3): Top chamber
  const t3Y = t2Y + t2H + 2.0;
  const t3W = 6.0;
  const t3H = 3.6;

  const t3Body = new THREE.Mesh(new THREE.BoxGeometry(t3W, t3H, t3W), matAmberWood);
  t3Body.position.set(0, t3Y + t3H / 2, 0);
  t3Body.castShadow = true;
  pagoda.add(t3Body);

  for (const cx of [-t3W / 2 + 0.25, t3W / 2 - 0.25]) {
    for (const cz of [-t3W / 2 + 0.25, t3W / 2 - 0.25]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, t3H + 0.2, 10), matDarkTimber);
      col.position.set(cx, t3Y + t3H / 2, cz);
      col.castShadow = true;
      pagoda.add(col);
    }
  }

  for (let f = 0; f < 4; f++) {
    const fAngle = (f * Math.PI) / 2;
    const decor = createFacadeDecor(t3W, t3H, true);
    decor.position.set(
      -Math.sin(fAngle) * (t3W / 2 + 0.02),
      t3Y,
      Math.cos(fAngle) * (t3W / 2 + 0.02)
    );
    decor.rotation.y = fAngle;
    pagoda.add(decor);
  }

  const t3Brackets = createBracketCorbelRing(t3W * 0.95, t3Y + t3H, matDarkTimber);
  pagoda.add(t3Brackets);

  const roof3 = createJadeCurvedRoof(10.5, 10.5, 3.0, matJadeTile, matGold);
  roof3.position.set(0, t3Y + t3H + 0.4, 0);
  pagoda.add(roof3);

  // 5. SUMMIT GOLDEN LOTUS BUD SPIRE (ĐỈNH THÁP BÚP SEN HOÀNG KIM)
  const spireY = t3Y + t3H + 3.2;

  const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.1, 0.65, 12), matLotusPlinth);
  spireBase.position.set(0, spireY, 0);
  pagoda.add(spireBase);

  // Multi-tier Stupa Rings (Tương luân hoàng kim - 5 concentric golden bronze rings)
  for (let ring = 0; ring < 5; ring++) {
    const rSize = 1.45 - ring * 0.18;
    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(rSize, 0.15, 8, 20), matGold);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, spireY + 0.6 + ring * 0.48, 0);
    pagoda.add(ringMesh);
  }

  const spireCone = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.42, 3.2, 8), matGold);
  spireCone.position.set(0, spireY + 2.4, 0);
  pagoda.add(spireCone);

  const budApex = new THREE.Mesh(new THREE.SphereGeometry(0.68, 12, 12), matGold);
  budApex.scale.set(0.9, 1.6, 0.9);
  budApex.position.set(0, spireY + 4.2, 0);
  pagoda.add(budApex);

  const budTip = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.85, 8), matGold);
  budTip.position.set(0, spireY + 5.2, 0);
  pagoda.add(budTip);

  // Golden Radiance Point Light at Apex
  const spireLight = new THREE.PointLight(0xfef08a, 1.8, 24);
  spireLight.position.set(0, spireY + 4.5, 0);
  nightLightsRef.current.push(spireLight);
  pagoda.add(spireLight);

  return pagoda;
}

// Stylized Moon Window Wall
function createStylizedMoonWall(matWood: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const wallL = new THREE.Mesh(new THREE.BoxGeometry(4.5, 6.0, 0.4), matWood);
  wallL.position.set(-5.2, 0, 0);
  group.add(wallL);

  const wallR = new THREE.Mesh(new THREE.BoxGeometry(4.5, 6.0, 0.4), matWood);
  wallR.position.set(5.2, 0, 0);
  group.add(wallR);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.35, 12, 28), matWood);
  group.add(ring);

  const barH = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 0.08), matWood);
  group.add(barH);
  const barV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.2, 0.08), matWood);
  group.add(barV);

  return group;
}

// Stylized Stone Arch Gate
function createStylizedStoneArch(matStone: THREE.Material): THREE.Group {
  const gate = new THREE.Group();
  const lPost = new THREE.Mesh(new THREE.BoxGeometry(1.3, 5.8, 1.3), matStone);
  lPost.position.set(-2.6, 2.9, 0);
  gate.add(lPost);

  const rPost = new THREE.Mesh(new THREE.BoxGeometry(1.3, 5.8, 1.3), matStone);
  rPost.position.set(2.6, 2.9, 0);
  gate.add(rPost);

  const arch = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.2, 1.5), matStone);
  arch.position.set(0, 6.2, 0);
  gate.add(arch);

  return gate;
}

// Stylized Stone Lantern
function createStylizedStoneLantern(matStone: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 0.45, 6), matStone);
  base.position.set(0, 0.22, 0);
  g.add(base);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 1.3, 6), matStone);
  shaft.position.set(0, 1.05, 0);
  g.add(shaft);

  const fireBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.7, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.95 })
  );
  fireBox.position.set(0, 1.95, 0);
  g.add(fireBox);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.6, 6), matStone);
  cap.position.set(0, 2.55, 0);
  g.add(cap);

  return g;
}

// Stylized Silk Lantern
function createStylizedSilkLantern(matSilk: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), matSilk);
  body.scale.set(1.0, 1.25, 1.0);
  g.add(body);

  const tassel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.18, 0.65, 8),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
  );
  tassel.position.set(0, -0.85, 0);
  g.add(tassel);

  return g;
}

// ══════════════════════════════════════════════════════════════════════════════
// Anime Cel-Shaded Character — MeshToonMaterial + canvas face texture
// ══════════════════════════════════════════════════════════════════════════════

/** Build a tiny 4-stop gradient texture for MeshToonMaterial */
function makeToonGradient(stops: [number, string][]): THREE.DataTexture {
  const size = 256;
  const data = new Uint8Array(size * 4);
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1);
    let r = 0, g = 0, b = 0;
    for (let s = stops.length - 1; s >= 0; s--) {
      if (t >= stops[s][0]) {
        const c = new THREE.Color(stops[s][1]);
        r = Math.round(c.r * 255);
        g = Math.round(c.g * 255);
        b = Math.round(c.b * 255);
        break;
      }
    }
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, 1);
  tex.needsUpdate = true;
  return tex;
}

/** Draw an anime face onto a CanvasTexture */
function makeAnimeFaceTexture(isFemale: boolean): THREE.CanvasTexture {
  const W = 512, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Skin base
  ctx.fillStyle = '#f2c49a';
  ctx.fillRect(0, 0, W, H);

  // ── Eyebrows ──────────────────────────────────────────────────────────────
  ctx.strokeStyle = '#2a1a0a';
  ctx.lineWidth = isFemale ? 7 : 9;
  ctx.lineCap = 'round';

  // Left brow
  ctx.beginPath();
  ctx.moveTo(130, isFemale ? 188 : 192);
  ctx.quadraticCurveTo(168, isFemale ? 174 : 176, 210, isFemale ? 182 : 190);
  ctx.stroke();
  // Right brow
  ctx.beginPath();
  ctx.moveTo(302, isFemale ? 182 : 190);
  ctx.quadraticCurveTo(344, isFemale ? 174 : 176, 382, isFemale ? 188 : 192);
  ctx.stroke();

  // ── Eyes ──────────────────────────────────────────────────────────────────
  const eyeLX = 170, eyeRX = 342, eyeY = 240;
  const eyeW = isFemale ? 72 : 66, eyeH = isFemale ? 56 : 50;

  function drawEye(cx: number, cy: number) {
    // White sclera
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1a0a00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, eyeW / 2, eyeH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Iris gradient
    const grad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, eyeW * 0.38);
    grad.addColorStop(0, isFemale ? '#8b6fb5' : '#3a7fd5');
    grad.addColorStop(0.5, isFemale ? '#5b3f8a' : '#1a4a90');
    grad.addColorStop(1, '#0a0820');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, eyeW * 0.40, eyeH * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(cx, cy, eyeW * 0.20, eyeH * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main highlight (big)
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeW * 0.14, cy - eyeH * 0.18, eyeW * 0.12, eyeH * 0.14, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // Small highlight
    ctx.beginPath();
    ctx.ellipse(cx + eyeW * 0.16, cy + eyeH * 0.12, eyeW * 0.06, eyeH * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper lash line
    ctx.strokeStyle = '#0a0820';
    ctx.lineWidth = isFemale ? 5 : 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy - eyeH * 0.10, eyeW / 2 + 2, eyeH / 2, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Lower lash line (thinner)
    ctx.strokeStyle = '#2a1a10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + eyeH * 0.08, eyeW / 2, eyeH / 2 - 4, 0, 0, Math.PI);
    ctx.stroke();
  }

  drawEye(eyeLX, eyeY);
  drawEye(eyeRX, eyeY);

  // ── Nose — minimal ────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(180,120,80,0.6)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(246, 290);
  ctx.lineTo(240, 308);
  ctx.lineTo(272, 308);
  ctx.stroke();

  // ── Mouth ─────────────────────────────────────────────────────────────────
  ctx.strokeStyle = '#b06060';
  ctx.lineWidth = isFemale ? 3.5 : 4;
  ctx.lineCap = 'round';
  // Upper lip bow
  ctx.beginPath();
  ctx.moveTo(208, 346);
  ctx.quadraticCurveTo(256, 334, 304, 346);
  ctx.stroke();
  // Lower lip smile
  ctx.beginPath();
  ctx.moveTo(208, 346);
  ctx.quadraticCurveTo(256, 372, 304, 346);
  ctx.stroke();

  // ── Female blush ──────────────────────────────────────────────────────────
  if (isFemale) {
    const blushGrad = (bx: number) => {
      const g = ctx.createRadialGradient(bx, 292, 0, bx, 292, 40);
      g.addColorStop(0, 'rgba(255,140,140,0.45)');
      g.addColorStop(1, 'rgba(255,140,140,0.0)');
      return g;
    };
    ctx.fillStyle = blushGrad(122);
    ctx.fillRect(82, 252, 80, 80);
    ctx.fillStyle = blushGrad(390);
    ctx.fillRect(350, 252, 80, 80);
  }

  // ── Ear shadows (subtle) ──────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(200,150,100,0.25)';
  ctx.beginPath();
  ctx.ellipse(40, 268, 22, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(472, 268, 22, 36, 0, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createStylized3DMonk(character: CharacterAppearance) {
  const monkGroup = new THREE.Group();
  monkGroup.position.set(0, 0.42, 80);

  const isFemale = character.gender === 'female';

  // ── Toon gradient (3 shading levels) ────────────────────────────────────
  const toonGrad = makeToonGradient([
    [0.0, '#888888'],
    [0.3, '#bbbbbb'],
    [0.6, '#eeeeee'],
    [1.0, '#ffffff'],
  ]);

  const toon = (hex: number, opts?: object) =>
    new THREE.MeshToonMaterial({ color: hex, gradientMap: toonGrad, ...opts });

  // ── Materials ─────────────────────────────────────────────────────────────
  const matSkin = toon(0xf5c8a0);
  const matShirt = toon(isFemale ? 0xfadde8 : 0xe6f0ff);
  const matPants = toon(isFemale ? 0x3d454f : 0x1a2333);
  const matBelt = toon(0x5c3317);
  const matBuckle = new THREE.MeshStandardMaterial({ color: 0xcca820, roughness: 0.2, metalness: 0.8 });
  const matShoe = toon(isFemale ? 0xeeeeee : 0x111111);
  const matShoeSole = toon(isFemale ? 0xbbbbbb : 0x050505);
  const matHair = toon(0x180800);
  const matShirtInner = toon(isFemale ? 0xfce4ec : 0xf4f8ff);

  // Face texture
  const faceTexture = makeAnimeFaceTexture(isFemale);
  const matFace = new THREE.MeshToonMaterial({ map: faceTexture, gradientMap: toonGrad });
  const matHeadBack = toon(0xf5c8a0); // back of head, no texture

  // ─────────────────────────────────────────────────────────────────────────
  // LEGS — attach to monkGroup root
  // ─────────────────────────────────────────────────────────────────────────
  const monkLeftLeg = new THREE.Group();
  monkLeftLeg.position.set(-0.135, 0.74, 0);

  const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.106, 0.70, 12), matPants);
  leftThigh.position.set(0, -0.35, 0);
  monkLeftLeg.add(leftThigh);

  const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.100, 0.086, 0.62, 12), matPants);
  leftShin.position.set(0, -0.85, 0);
  monkLeftLeg.add(leftShin);

  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.092, 0.38), matShoe);
  leftShoe.position.set(0, -1.20, 0.065);
  monkLeftLeg.add(leftShoe);

  const leftSole = new THREE.Mesh(new THREE.BoxGeometry(0.170, 0.030, 0.39), matShoeSole);
  leftSole.position.set(0, -1.250, 0.065);
  monkLeftLeg.add(leftSole);

  monkGroup.add(monkLeftLeg);

  const monkRightLeg = new THREE.Group();
  monkRightLeg.position.set(0.135, 0.74, 0);

  const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.106, 0.70, 12), matPants);
  rightThigh.position.set(0, -0.35, 0);
  monkRightLeg.add(rightThigh);

  const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.100, 0.086, 0.62, 12), matPants);
  rightShin.position.set(0, -0.85, 0);
  monkRightLeg.add(rightShin);

  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.092, 0.38), matShoe);
  rightShoe.position.set(0, -1.20, 0.065);
  monkRightLeg.add(rightShoe);

  const rightSole = new THREE.Mesh(new THREE.BoxGeometry(0.170, 0.030, 0.39), matShoeSole);
  rightSole.position.set(0, -1.250, 0.065);
  monkRightLeg.add(rightSole);

  monkGroup.add(monkRightLeg);

  // ─────────────────────────────────────────────────────────────────────────
  // TORSO
  // ─────────────────────────────────────────────────────────────────────────
  const monkTorso = new THREE.Group();
  monkTorso.position.set(0, 1.30, 0);

  // Main shirt — slightly tapered
  const torsoBody = new THREE.Mesh(new THREE.CylinderGeometry(0.275, 0.235, 0.88, 14), matShirt);
  monkTorso.add(torsoBody);

  // Shirt placket strip (front buttons visual)
  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.76, 0.036), matShirtInner);
  placket.position.set(0, 0.03, 0.258);
  monkTorso.add(placket);

  // Collar left
  const colL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.20, 0.04), matShirt);
  colL.position.set(-0.055, 0.44, 0.240); colL.rotation.z = 0.30;
  monkTorso.add(colL);
  // Collar right
  const colR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.20, 0.04), matShirt);
  colR.position.set(0.055, 0.44, 0.240); colR.rotation.z = -0.30;
  monkTorso.add(colR);

  // Belt
  const beltM = new THREE.Mesh(new THREE.CylinderGeometry(0.243, 0.243, 0.065, 16), matBelt);
  beltM.position.set(0, -0.37, 0);
  monkTorso.add(beltM);

  // Buckle
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.065, 0.036), matBuckle);
  buckle.position.set(0, -0.37, 0.246);
  monkTorso.add(buckle);

  // ── LEFT ARM ─────────────────────────────────────────────────────────────
  const monkLeftArm = new THREE.Group();
  monkLeftArm.position.set(-0.305, 0.355, 0);
  monkLeftArm.rotation.z = 0.16; // slight outward splay

  const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.094, 0.086, 0.50, 10), matShirt);
  lUpperArm.position.set(0, -0.25, 0);
  monkLeftArm.add(lUpperArm);

  const lCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.048, 10), matShirtInner);
  lCuff.position.set(0, -0.524, 0);
  monkLeftArm.add(lCuff);

  const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.080, 0.068, 0.44, 10), matSkin);
  lForearm.position.set(0, -0.786, 0);
  monkLeftArm.add(lForearm);

  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.076, 10, 10), matSkin);
  lHand.scale.set(0.9, 0.76, 0.68);
  lHand.position.set(0, -1.022, 0);
  monkLeftArm.add(lHand);

  monkTorso.add(monkLeftArm);

  // ── RIGHT ARM ────────────────────────────────────────────────────────────
  const monkRightArm = new THREE.Group();
  monkRightArm.position.set(0.305, 0.355, 0);
  monkRightArm.rotation.z = -0.16;

  const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.094, 0.086, 0.50, 10), matShirt);
  rUpperArm.position.set(0, -0.25, 0);
  monkRightArm.add(rUpperArm);

  const rCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.048, 10), matShirtInner);
  rCuff.position.set(0, -0.524, 0);
  monkRightArm.add(rCuff);

  const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.080, 0.068, 0.44, 10), matSkin);
  rForearm.position.set(0, -0.786, 0);
  monkRightArm.add(rForearm);

  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.076, 10, 10), matSkin);
  rHand.scale.set(0.9, 0.76, 0.68);
  rHand.position.set(0, -1.022, 0);
  monkRightArm.add(rHand);

  monkTorso.add(monkRightArm);

  // ─────────────────────────────────────────────────────────────────────────
  // HEAD
  // ─────────────────────────────────────────────────────────────────────────
  const monkHead = new THREE.Group();
  monkHead.position.set(0, 0.565, 0);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.105, 0.16, 10), matSkin);
  neck.position.set(0, -0.08, 0);
  monkHead.add(neck);

  // Head — use hemisphere trick: front = face texture, back = skin colour
  // Front face sphere (slightly forward-offset, face UV)
  const faceGeo = new THREE.SphereGeometry(0.275, 20, 20, 0, Math.PI * 2, 0, Math.PI);
  const faceMesh = new THREE.Mesh(faceGeo, [matFace, matHeadBack]);
  faceMesh.position.set(0, 0.185, 0);
  faceMesh.scale.set(1.0, 1.12, 0.90); // oval anime head
  monkHead.add(faceMesh);

  // Chin taper
  const chinGeo = new THREE.CylinderGeometry(0.175, 0.065, 0.18, 12);
  const chinMesh = new THREE.Mesh(chinGeo, matHeadBack);
  chinMesh.position.set(0, 0.055, 0);
  monkHead.add(chinMesh);

  // Ear L
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.060, 8, 8), matSkin);
  earL.scale.set(0.55, 0.75, 0.50);
  earL.position.set(-0.275, 0.185, 0);
  monkHead.add(earL);
  // Ear R
  const earR = new THREE.Mesh(new THREE.SphereGeometry(0.060, 8, 8), matSkin);
  earR.scale.set(0.55, 0.75, 0.50);
  earR.position.set(0.275, 0.185, 0);
  monkHead.add(earR);

  // ── HAIR ─────────────────────────────────────────────────────────────────
  if (isFemale) {
    // Crown
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.292, 14, 14), matHair);
    hairCap.scale.set(1.04, 0.64, 1.02);
    hairCap.position.set(0, 0.305, -0.010);
    monkHead.add(hairCap);

    // Side strands (frame face)
    const sidGeo = new THREE.CylinderGeometry(0.062, 0.042, 0.58, 8);
    const hSL = new THREE.Mesh(sidGeo, matHair);
    hSL.position.set(-0.255, 0.05, 0.05); hSL.rotation.z = 0.14;
    monkHead.add(hSL);
    const hSR = new THREE.Mesh(sidGeo, matHair);
    hSR.position.set(0.255, 0.05, 0.05); hSR.rotation.z = -0.14;
    monkHead.add(hSR);

    // Back long flow
    const hBack = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.110, 0.88, 10), matHair);
    hBack.position.set(0, -0.28, -0.145); hBack.rotation.x = 0.14;
    monkHead.add(hBack);

    const hTail = new THREE.Mesh(new THREE.CylinderGeometry(0.110, 0.055, 0.50, 10), matHair);
    hTail.position.set(0, -0.72, -0.20); hTail.rotation.x = 0.20;
    monkHead.add(hTail);

  } else {
    // Short neat
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.288, 14, 14), matHair);
    hairCap.scale.set(1.06, 0.55, 1.06);
    hairCap.position.set(0, 0.295, -0.025);
    monkHead.add(hairCap);

    // Front sweep
    const hairFront = new THREE.Mesh(new THREE.SphereGeometry(0.165, 10, 10), matHair);
    hairFront.scale.set(1.20, 0.44, 0.82);
    hairFront.position.set(0, 0.358, 0.158);
    monkHead.add(hairFront);

    // Sides
    const hSL = new THREE.Mesh(new THREE.SphereGeometry(0.148, 8, 8), matHair);
    hSL.scale.set(0.56, 0.50, 0.92);
    hSL.position.set(-0.248, 0.205, 0.010);
    monkHead.add(hSL);
    const hSR = new THREE.Mesh(new THREE.SphereGeometry(0.148, 8, 8), matHair);
    hSR.scale.set(0.56, 0.50, 0.92);
    hSR.position.set(0.248, 0.205, 0.010);
    monkHead.add(hSR);

    // Nape
    const hNape = new THREE.Mesh(new THREE.SphereGeometry(0.148, 8, 8), matHair);
    hNape.scale.set(0.88, 0.44, 0.76);
    hNape.position.set(0, 0.185, -0.220);
    monkHead.add(hNape);
  }

  monkTorso.add(monkHead);
  monkGroup.add(monkTorso);

  return {
    monkGroup,
    monkTorso,
    monkHead,
    monkLeftArm,
    monkRightArm,
    monkLeftLeg,
    monkRightLeg,
  };
}

// Spawn Glowing Lotus Petal Underfoot
function spawnLotusFootstep(
  scene: THREE.Scene,
  x: number,
  z: number,
  footstepsRef: React.MutableRefObject<{ mesh: THREE.Mesh; life: number }[]>,
  y: number = 0.42
) {
  const flower = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 8),
    new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.9,
    })
  );
  flower.rotateX(-Math.PI / 2);
  flower.position.set(x, y + 0.04, z);
  scene.add(flower);
  footstepsRef.current.push({ mesh: flower, life: 60 });
}
