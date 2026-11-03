import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { soundEngine } from '../services/audioEngine';
import { useGameStore } from '../store/gameStore';
import type { CharacterAppearance } from '../types/game';
import { loadChibiCharacter } from '../services/characterLoader';
import { speakAbbotVoice, stopAbbotVoice, preloadMonkVoiceAudio } from '../services/monkVoiceService';
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
  Music,
  Volume2,
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
  onOpenBuddhaViewer?: () => void;
  onOpenCharity: () => void;
  onOpenCalligraphy?: () => void;
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

  // 4. Tháp Chuông Cổ Tự (Zone 4 Bell Tower - Chuẩn Bản Vẽ 2 Tầng 8 Mái & Chú Tiểu)
  { type: 'circle', x: -28.6, z: -22.6, r: 0.55, name: 'Bell Col 1 NW' },
  { type: 'circle', x: -28.6, z: -17.4, r: 0.55, name: 'Bell Col 2 SW' },
  { type: 'circle', x: -23.4, z: -22.6, r: 0.55, name: 'Bell Col 3 NE' },
  { type: 'circle', x: -23.4, z: -17.4, r: 0.55, name: 'Bell Col 4 SE' },
  { type: 'circle', x: -26.0, z: -20.0, r: 1.6, name: 'Great Bronze Bell' },
  { type: 'circle', x: -23.85, z: -19.35, r: 0.45, name: 'Monk NPC Tue Tinh' },
  { type: 'circle', x: -28.8, z: -22.2, r: 1.25, name: 'Bell Drum' },
  { type: 'box', minX: -30.8, maxX: -21.2, minZ: -24.8, maxZ: -24.2, name: 'Bell Rail North' },
  { type: 'box', minX: -30.8, maxX: -30.2, minZ: -24.8, maxZ: -15.2, name: 'Bell Rail West' },
  { type: 'box', minX: -21.8, maxX: -21.2, minZ: -24.8, maxZ: -15.2, name: 'Bell Rail East' },
  { type: 'box', minX: -30.8, maxX: -28.2, minZ: -15.5, maxZ: -15.0, name: 'Bell Rail South L' },
  { type: 'box', minX: -23.8, maxX: -21.2, minZ: -15.5, maxZ: -15.0, name: 'Bell Rail South R' },

  // 5. Hiên Nước & Suối Ngọc (Zone 5 On Rainy Days) - Tatami deck & bridge fully walkable, water blocked
  { type: 'box', minX: -26.0, maxX: -13.0, minZ: 38.0, maxZ: 47.0, name: 'Stream Water North' },
  { type: 'box', minX: -26.0, maxX: -13.0, minZ: 25.0, maxZ: 34.0, name: 'Stream Water South' },
  { type: 'box', minX: -39.0, maxX: -13.0, minZ: 46.5, maxZ: 47.5, name: 'Stream North Rim' },
  { type: 'box', minX: -39.0, maxX: -13.0, minZ: 24.5, maxZ: 25.5, name: 'Stream South Rim' },
  { type: 'box', minX: -39.0, maxX: -38.0, minZ: 25.0, maxZ: 47.0, name: 'Stream West Wall' },

  // 6. Dãy Hành Lang Cột Gỗ Lim (Zone 6 Corridor) - Side wooden columns (center aisle open)
  { type: 'circle', x: 15.4, z: -1.0, r: 0.48 },
  { type: 'circle', x: 20.6, z: -1.0, r: 0.48 },
  { type: 'circle', x: 15.4, z: 4.5, r: 0.48 },
  { type: 'circle', x: 20.6, z: 4.5, r: 0.48 },
  { type: 'circle', x: 15.4, z: 10.0, r: 0.48 },
  { type: 'circle', x: 20.6, z: 10.0, r: 0.48 },
  { type: 'circle', x: 15.4, z: 15.5, r: 0.48 },
  { type: 'circle', x: 20.6, z: 15.5, r: 0.48 },
  { type: 'circle', x: 15.4, z: 21.0, r: 0.48 },
  { type: 'circle', x: 20.6, z: 21.0, r: 0.48 },
  { type: 'circle', x: 15.4, z: 26.5, r: 0.48 },
  { type: 'circle', x: 20.6, z: 26.5, r: 0.48 },

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
  { type: 'box', minX: -16.0, maxX: -6.8, minZ: -5.3, maxZ: -4.7, minY: 2.0, name: 'Sanctuary Front Wall L' },
  { type: 'box', minX: -4.8, maxX: -2.6, minZ: -5.3, maxZ: -4.7, minY: 2.0, name: 'Sanctuary Front Wall ML' },
  { type: 'box', minX: 2.6, maxX: 4.8, minZ: -5.3, maxZ: -4.7, minY: 2.0, name: 'Sanctuary Front Wall MR' },
  { type: 'box', minX: 6.8, maxX: 16.0, minZ: -5.3, maxZ: -4.7, minY: 2.0, name: 'Sanctuary Front Wall R' },
  // Tam Thế Phật Altar (Spanning wider to cover all 3 Buddhas)
  { type: 'box', minX: -6.8, maxX: 6.8, minZ: -25.5, maxZ: -19.8, minY: 2.0, name: 'Tam Thế Phật Altar' },
  // Central Bronze Cauldron Censer (Đại Đỉnh Hương Đồng 3 Chân)
  { type: 'circle', x: 0, z: -15.5, r: 0.95, minY: 2.0, name: 'Sanctuary Bronze Cauldron' },
  // Abbot Throne (Tòa Thuyết Pháp Hòa Thượng Trụ Trì - mở rộng 40%)
  { type: 'circle', x: 2.5, z: -18.8, r: 1.25, minY: 2.0, name: 'Abbot Throne' },

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

  // 9. Tàng Kinh Các (Zone 9 Library) - Outer walls, Bookshelves & Tea table
  { type: 'box', minX: 35.0, maxX: 35.6, minZ: 4.2, maxZ: 21.8, name: 'Library East Wall' },
  { type: 'box', minX: 21.5, maxX: 35.3, minZ: 4.0, maxZ: 4.6, name: 'Library North Wall' },
  { type: 'box', minX: 21.5, maxX: 35.3, minZ: 21.4, maxZ: 22.0, name: 'Library South Wall' },
  { type: 'box', minX: 21.4, maxX: 22.0, minZ: 4.0, maxZ: 8.5, name: 'Library West Wall N' },
  { type: 'box', minX: 21.4, maxX: 22.0, minZ: 17.5, maxZ: 22.0, name: 'Library West Wall S' },
  // Bookshelves inside Tàng Kinh Các (aisles open, X from 25.7 to 34.3)
  { type: 'box', minX: 25.7, maxX: 34.3, minZ: 8.0, maxZ: 9.0, name: 'Library Shelf 1' },
  { type: 'box', minX: 25.7, maxX: 34.3, minZ: 12.5, maxZ: 13.5, name: 'Library Shelf 2' },
  { type: 'box', minX: 25.7, maxX: 34.3, minZ: 17.0, maxZ: 18.0, name: 'Library Shelf 3' },

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

// =======================================================================
// THƯ PHÁP CHỮ HÁN THẾP VÀNG HOÀNH PHI & CÂU ĐỐI CHÍNH ĐIỆN (CANVAS TEXTURES)
// =======================================================================

// Hoành phi đại tự "大 雄 寶 殿" (Đại Hùng Bảo Điện) chữ vàng trên nền sơn son
function createDaiHungBaoDienPlaqueTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 280;
  const ctx = c.getContext('2d')!;

  // 1. Nền sơn son thếp vàng cánh gián bóng bẩy
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 280);
  bgGrad.addColorStop(0, '#58111a');
  bgGrad.addColorStop(0.5, '#7f1d1d');
  bgGrad.addColorStop(1, '#450a0a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 280);

  // 2. Khung viền mạ vàng chạm rồng & hoa văn tứ linh
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 1004, 260);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.strokeRect(22, 22, 980, 236);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 968, 224);

  // Hoa văn góc tứ linh uốn lượn dát vàng
  const drawCornerFlourish = (x: number, y: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX, flipY);
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(34, 52);
    ctx.quadraticCurveTo(56, 56, 52, 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(44, 44, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  drawCornerFlourish(0, 0, 1, 1);
  drawCornerFlourish(1024, 0, -1, 1);
  drawCornerFlourish(0, 280, 1, -1);
  drawCornerFlourish(1024, 280, -1, -1);

  // Hoa sen nhụy vàng ở đỉnh giữa hoành phi
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(512, 22, 7, 0, Math.PI * 2);
  ctx.fill();

  // 3. Triện son hoàng gia (Red Seal Stamps) bên góc trái
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(68, 75, 48, 48);
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(68, 75, 48, 48);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 16px "Noto Serif", "Songti SC", serif';
  ctx.textAlign = 'center';
  ctx.fillText('佛寶', 92, 105);

  ctx.fillStyle = '#991b1b';
  ctx.fillRect(68, 145, 48, 48);
  ctx.strokeRect(68, 145, 48, 48);
  ctx.fillStyle = '#fef08a';
  ctx.fillText('法寶', 92, 175);

  // 4. Chữ Hán vàng óng nổi khối "大 雄 寶 殿"
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 132px "Noto Serif", "Songti SC", "SimSun", "STSong", "KaiTi", serif';

  // Bóng đổ kim quang rực rỡ
  ctx.shadowColor = 'rgba(254, 240, 138, 0.95)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  const textGrad = ctx.createLinearGradient(0, 50, 0, 220);
  textGrad.addColorStop(0, '#ffffff');
  textGrad.addColorStop(0.2, '#fef08a');
  textGrad.addColorStop(0.65, '#f59e0b');
  textGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = textGrad;

  // 4 Đại tự thếp vàng với khoảng cách chân phương uy nghiêm
  const chars = ['大', '雄', '寶', '殿'];
  const charSpacing = 175;
  chars.forEach((ch, idx) => {
    const x = 512 + (idx - 1.5) * charSpacing;
    ctx.fillText(ch, x, 140);
    // Viền kim loại nổi
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.strokeText(ch, x, 140);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}


// Hoành phi phụ gian bên: "佛 明 南 樓" & "法 輪 常 轉" & "大 敦 福 堂"
function createSideCalligraphyPlaqueTexture(text: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 220;
  const ctx = c.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 220);
  bgGrad.addColorStop(0, '#58111a');
  bgGrad.addColorStop(0.5, '#7f1d1d');
  bgGrad.addColorStop(1, '#450a0a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 768, 220);

  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 752, 204);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, 732, 184);

  // Triện son góc
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(45, 68, 38, 38);
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(45, 68, 38, 38);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 13px "Noto Serif", serif';
  ctx.textAlign = 'center';
  ctx.fillText('吉祥', 64, 92);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 102px "Noto Serif", "Songti SC", "SimSun", "STSong", "KaiTi", serif';

  ctx.shadowColor = 'rgba(254, 240, 138, 0.88)';
  ctx.shadowBlur = 14;

  const textGrad = ctx.createLinearGradient(0, 40, 0, 180);
  textGrad.addColorStop(0, '#ffffff');
  textGrad.addColorStop(0.25, '#fef08a');
  textGrad.addColorStop(0.7, '#f59e0b');
  textGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = textGrad;

  const chars = text.split('');
  const spacing = 135;
  chars.forEach((ch, idx) => {
    const x = 384 + (idx - (chars.length - 1) / 2) * spacing;
    ctx.fillText(ch, x, 110);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.strokeText(ch, x, 110);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}


// Đôi câu đối chữ Hán dọc thếp vàng trên 2 Cột Cái gỗ lim
function createCoupletTexture(text: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 1024;
  const ctx = c.getContext('2d')!;

  // 1. Nền sơn son cánh gián thắm truyền thống
  const bgGrad = ctx.createLinearGradient(0, 0, 256, 0);
  bgGrad.addColorStop(0, '#3f0c10');
  bgGrad.addColorStop(0.25, '#7f1d1d');
  bgGrad.addColorStop(0.75, '#881337');
  bgGrad.addColorStop(1, '#3f0c10');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 256, 1024);

  // 2. Viền lòng máng mạ vàng kép
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 240, 1008);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(16, 16, 224, 992);

  // Hoa sen vàng ở đỉnh câu đối
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(128, 42, 10, 0, Math.PI * 2);
  ctx.fill();

  // Dải mây như ý dát vàng ở đáy câu đối
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(128, 982, 10, 0, Math.PI * 2);
  ctx.fill();

  // 3. Chữ Hán dọc dát vàng
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 76px "Noto Serif", "Songti SC", "SimSun", "STSong", "KaiTi", serif';

  ctx.shadowColor = 'rgba(254, 240, 138, 0.9)';
  ctx.shadowBlur = 12;

  const chars = text.split('');
  const startY = 95;
  const endY = 930;
  const stepY = (endY - startY) / (chars.length - 1);

  chars.forEach((ch, idx) => {
    const y = startY + idx * stepY;
    const textGrad = ctx.createLinearGradient(0, y - 35, 0, y + 35);
    textGrad.addColorStop(0, '#ffffff');
    textGrad.addColorStop(0.3, '#fef08a');
    textGrad.addColorStop(0.75, '#f59e0b');
    textGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = textGrad;

    ctx.fillText(ch, 128, y);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeText(ch, 128, y);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}


// Biển chỉ dẫn "敬 香 區" / "KHU VỰC THẮP NHANG" trên bàn thấp
function createIncenseSignTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 220;
  const ctx = c.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 220);
  bgGrad.addColorStop(0, '#58111a');
  bgGrad.addColorStop(0.5, '#7f1d1d');
  bgGrad.addColorStop(1, '#450a0a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 220);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 492, 200);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Chữ Hán "敬 香 區" (Kính Hương Khu)
  ctx.font = 'bold 72px "Noto Serif", "Songti SC", serif';
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = 'rgba(254, 240, 138, 0.85)';
  ctx.shadowBlur = 10;
  ctx.fillText('敬 香 區', 256, 75);

  // Phụ đề tiếng Việt "KHU VỰC THẮP NHANG"
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#fde68a';
  ctx.shadowBlur = 6;
  ctx.fillText('KHU VỰC THẮP NHANG', 256, 150);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
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
  onOpenBuddhaViewer,
  onOpenCharity,
  onAddMerit,
  spendStamina,
}) => {
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
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
  const [monkPose, setMonkPose] = useState<'STAND' | 'LIE_DOWN' | 'SIT_EDGE' | 'INCENSE_BOW'>('STAND');
  const monkPoseRef = useRef<'STAND' | 'LIE_DOWN' | 'SIT_EDGE' | 'INCENSE_BOW'>('STAND');
  const [isIncenseBowing, setIsIncenseBowing] = useState<boolean>(false);
  const chibiIncenseBundleRef = useRef<THREE.Group | null>(null);
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
    onOpenBuddhaViewer,
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
    onOpenBuddhaViewer,
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

  // 3D Chibi Character Rig & Animation Refs
  const charMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const charActionsRef = useRef<{ walk?: THREE.AnimationAction; idle?: THREE.AnimationAction; sit?: THREE.AnimationAction; incenseBow?: THREE.AnimationAction }>({});
  const currentActionRef = useRef<string>('idle');
  const chibiModelLoadedRef = useRef<boolean>(false);
  const chibiModelRef = useRef<THREE.Group | null>(null);

  const playerPosRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0.42, z: 80 });
  const targetPosRef = useRef<{ x: number; y?: number; z: number } | null>({ x: 0, z: 66 });
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
  const bellAnimFrameRef = useRef<number>(0);
  const isAutoBellActiveRef = useRef<boolean>(true);
  const [isAutoBellActive, setIsAutoBellActive] = useState<boolean>(true);
  const chayGoRef = useRef<THREE.Group | null>(null);
  const impactFlashRef = useRef<THREE.Mesh | null>(null);
  const bellNpcMonkRef = useRef<{
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
  } | null>(null);
  const soundRipplesGroupRef = useRef<THREE.Group | null>(null);

  // Dialogue Modal State for Chú Tiểu Tuệ Tĩnh (Bell Tower Guardian NPC)
  const [bellNpcDialogue, setBellNpcDialogue] = useState<{
    speaker: string;
    avatar: string;
    role: string;
    text: string;
    gatha?: string;
  } | null>(null);

  // Abbot NPC (Hòa Thượng Trụ Trì Chùa Sơn Tự - Thuyết Giảng Phật Pháp)
  const abbotNpcRef = useRef<{
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
    halo: THREE.Mesh;
    beads: THREE.Group;
  } | null>(null);
  const incenseSmokeParticlesRef = useRef<THREE.Mesh[]>([]);
  const [abbotDialogue, setAbbotDialogue] = useState<{
    speaker: string;
    avatar: string;
    role: string;
    text: string;
    gatha?: string;
    dharmaTopic?: string;
  } | null>(null);
  const [isAbbotVoiceActive, setIsAbbotVoiceActive] = useState<boolean>(false);
  const [abbotVoiceProgress, setAbbotVoiceProgress] = useState<number>(0);
  const [abbotVoiceDuration, setAbbotVoiceDuration] = useState<{ current: string; total: string }>({ current: '00:00', total: '00:00' });

  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const spiritParticlesRef = useRef<THREE.Points | null>(null);
  const koiFishListRef = useRef<{ mesh: THREE.Group; angle: number; speed: number; radius: number }[]>([]);
  const bambooLeavesRef = useRef<THREE.Group[]>([]);
  const destinationMarkerRef = useRef<THREE.Group | null>(null);
  const nightLightsRef = useRef<THREE.PointLight[]>([]);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Dedicated sound trigger: Bell rings and Novice Monk strikes with mallet
  const handleRingBell = useCallback(() => {
    soundEngine.playDistantEchoBell(1, 0.85);
    bellRingingTimerRef.current = 240;
    // Fast-forward animation directly to strike anticipation
    bellAnimFrameRef.current = 480;
    setBellNpcDialogue({
      speaker: 'Chú Tiểu Tuệ Tĩnh',
      avatar: '🔔',
      role: 'Thủ Hộ Lầu Chuông',
      text: 'Tiếng Đại Hồng Chung đã ngân vang ba cõi! Chú Tiểu đang thỉnh chuông tiêu trừ phiền não, mang lại an lạc vô lượng cho thí chủ và muôn loài khắp mười phương.',
      gatha: '🔔 Kệ Thỉnh Chuông:\n"Nguyện tiếng chuông này vang pháp giới\nThiết vi u ám tất giai văn\nVăn trần thanh tịnh chứng viên thông\nNhất thiết chúng sanh thành Chánh giác."',
    });
    onAddMerit(35, 50, 40, '🔔 Đại Hồng Chung Ngân Vang Đỉnh Núi');
  }, [onAddMerit]);

  const toggleAutoBell = useCallback(() => {
    setIsAutoBellActive((prev) => {
      const next = !prev;
      isAutoBellActiveRef.current = next;
      return next;
    });
  }, []);

  const handleTalkToMonk = useCallback(() => {
    soundEngine.playWoodenFish();
    setBellNpcDialogue({
      speaker: 'Chú Tiểu Tuệ Tĩnh',
      avatar: '👦🏻',
      role: 'Thủ Hộ Lầu Chuông',
      text: 'A Di Đà Phật! Bần đạo là Chú Tiểu Tuệ Tĩnh, phụ trách giữ gìn lầu chuông và thỉnh chuông sớm tối. Thí chủ lên chốn non thiêng này xin hãy buông xả muộn phiền nơi trần thế, lắng lòng theo từng nhịp chuông thanh tịnh nhé!',
      gatha: '🔔 Kệ Thỉnh Chuông:\n"Hồng chung sơ khấu, bảo kệ cao tuyên,\nThượng triệt thiên đường, hạ thông địa phủ..."',
    });
    onAddMerit(20, 50, 40, '🙏 Đàm Đạo Thiền Môn với Chú Tiểu');
  }, [onAddMerit]);

  const handleTalkToAbbot = useCallback(() => {
    preloadMonkVoiceAudio();
    soundEngine.playWoodenFish();
    soundEngine.playSingingBowl();
    setAbbotDialogue({
      speaker: 'Hòa Thượng Thích Trí Tuệ',
      avatar: '📿',
      role: 'Sư Phụ Trụ Trì Chùa Sơn Tự',
      text: 'A Di Đà Phật! Lành thay thiện nam tín nữ đã hữu duyên cất bước lên chốn Đại Hùng Bảo Điện linh thiêng. Đời người như mây nổi gió bay, được mất hơn thua chỉ là huyễn mộng. Con hãy ngồi xuống bồ đoàn, buông xả vạn duyên trần thế, lắng lòng nghe kinh kệ để tâm sen bừng nở nhé!',
      gatha: '📜 Kệ Khai Thị:\n"Tâm tịnh ắt cõi Phật tịnh\nTùy kỳ tâm tịnh tắc Phật độ tịnh\nMột niệm giác ngộ trừ muôn nghiệp\nBát nhã quang minh chiếu vạn phương."',
      dharmaTopic: 'Kinh Bát Nhã & Thiền Đốn Ngộ',
    });
    onAddMerit(40, 50, 35, '🙏 Thính Pháp Với Sư Phụ Trụ Trì');
  }, [onAddMerit]);

  // KHÓA LỄ THÍNH PHÁP & TỌA THIỀN CHÁNH NIỆM THEO TIẾNG MỎ SƯ THẦY
  const handleStartDharmaChantSession = useCallback(() => {
    preloadMonkVoiceAudio();
    soundEngine.playSingingBowl();

    // 1. Chuyển nhân vật ngồi ngay ngắn trên bồ đoàn thiền tọa màu đỏ
    const targetCushion = getTargetMeditationCushion(playerPosRef.current.x, playerPosRef.current.z);
    playerPosRef.current.x = targetCushion.x;
    playerPosRef.current.y = targetCushion.y; // 3.38m
    playerPosRef.current.z = targetCushion.z;
    targetPosRef.current = null;
    isWalkingStateRef.current = false;

    if (monkGroupRef.current) {
      monkGroupRef.current.position.set(targetCushion.x, targetCushion.y, targetCushion.z);
      monkGroupRef.current.rotation.set(0, Math.PI, 0); // Trang nghiêm hướng mặt về bàn thờ Phật Tổ
    }

    setMonkPose('SIT_EDGE');
    monkPoseRef.current = 'SIT_EDGE';

    // 2. Bắt đầu chuỗi gõ mỏ nhịp nhàng đều đặn của Sư Thầy (Wooden Fish Rhythm)
    soundEngine.startWoodenFishRhythm(2200);

    // 3. Khởi tạo nội dung khóa lễ thính pháp & bài thiền tịnh
    const dharmaText = 'A Di Đà Phật! Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười. Khi con an trú trong giây phút hiện tại, ngọn đèn chánh niệm sẽ soi tỏ mọi ngóc ngách u tối của tâm hồn. Hãy ngồi thẳng lưng trên bồ đoàn, buông xả vạn duyên trần thế, theo từng nhịp mỏ thanh tịnh mà nhiếp tâm thiền định an lạc.';
    const dharmaGatha = '🪷 Kệ Khóa Lễ Thiền Định:\n"Tiếng mỏ nhịp nhàng xua vọng niệm\nLời kinh trầm ấm lắng trần ai\nNgồi trên bồ đoàn tâm thanh tịnh\nBát-nhã hoa khai rạng ánh mai."';

    setAbbotDialogue({
      speaker: 'Hòa Thượng Thích Trí Tuệ',
      avatar: '🧘',
      role: 'Khóa Lễ Thính Pháp & Thiền Tọa',
      text: dharmaText,
      gatha: dharmaGatha,
    });

    onAddMerit(60, 50, 40, '📜 Tham Dự Khóa Lễ Thính Pháp & Thiền Tọa');
  }, [onAddMerit]);

  const handleSitMeditationLecture = useCallback(() => {
    handleStartDharmaChantSession();
  }, [handleStartDharmaChantSession]);

  // HOẠT ẢNH DÂNG HƯƠNG & VÁI LẠY TAM BẢO (3 BÁI KÍNH CẨN)
  const handleTriggerIncenseBow = useCallback(() => {
    if (isIncenseBowing) return;
    preloadMonkVoiceAudio();
    setIsIncenseBowing(true);
    monkPoseRef.current = 'INCENSE_BOW';
    setMonkPose('INCENSE_BOW');

    // Hiện 3 nén nhang trầm với đốm lửa tàn nhang rực sáng trên tay
    if (chibiIncenseBundleRef.current) {
      chibiIncenseBundleRef.current.visible = true;
    }

    // Dừng bước chân tức thì để trang nghiêm hành lễ
    targetPosRef.current = null;
    isWalkingStateRef.current = false;

    // Hướng mặt nhân vật về phía bàn thờ Phật Tổ
    if (monkGroupRef.current) {
      const curX = monkGroupRef.current.position.x;
      const curZ = monkGroupRef.current.position.z;
      const angle = Math.atan2(0 - curX, -20 - curZ);
      monkGroupRef.current.rotation.set(0, angle, 0);
    }

    // Tiếng chuông bát khai lễ dâng hương
    soundEngine.playSingingBowl();

    // 3 nhịp chuông mõ trang nghiêm theo 3 lần vái lạy (1.7s, 2.7s, 3.7s)
    setTimeout(() => soundEngine.playWoodenFish(), 1700);
    setTimeout(() => soundEngine.playWoodenFish(), 2700);
    setTimeout(() => soundEngine.playWoodenFish(), 3700);

    // Hoàn tất nghi lễ dâng hương & hồi hướng công đức
    setTimeout(() => {
      if (chibiIncenseBundleRef.current) {
        chibiIncenseBundleRef.current.visible = false;
      }
      monkPoseRef.current = 'STAND';
      setMonkPose('STAND');
      setIsIncenseBowing(false);

      soundEngine.playSingingBowl();
      onAddMerit(50, 50, 40, '🕯️ Thắp Nhang & Vái Lạy Tam Bảo');

      setAbbotDialogue({
        speaker: 'Hòa Thượng Thích Trí Tuệ',
        avatar: '🕯️',
        role: 'Chứng Minh Công Đức',
        text: 'Thành tâm thắp ba nén nhang trầm, ba lần kính cẩn cúi đầu đảnh lễ mười phương Tam Bảo. Thầy nguyện cầu cho con và gia quyến thân tâm thường lạc, tai qua nạn khỏi, vạn sự cát tường, phước huệ trang nghiêm!',
        gatha: '🕯️ Kệ Dâng Hương:\n"Nguyện đem lòng thành kính\nGửi theo làn mây hương\nPhảng phất khắp mười phương\nCúng dường ngôi Tam Bảo."',
      });
    }, 4800);
  }, [isIncenseBowing, onAddMerit]);

  const handleLightIncenseSanctuary = useCallback(() => {
    handleTriggerIncenseBow();
  }, [handleTriggerIncenseBow]);

  // Tự động cất giọng đọc trầm ấm từ bi của Hòa Thượng khi có khai thị / kệ dâng hương (giongsuthay.mp3)
  useEffect(() => {
    const formatAudioTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (abbotDialogue) {
      setIsAbbotVoiceActive(true);
      setAbbotVoiceProgress(0);
      const cancel = speakAbbotVoice(abbotDialogue.text, abbotDialogue.gatha, {
        onStart: () => setIsAbbotVoiceActive(true),
        onEnd: () => {
          setIsAbbotVoiceActive(false);
          setAbbotVoiceProgress(0);
        },
        onTimeUpdate: (cur, dur) => {
          if (dur > 0) {
            setAbbotVoiceProgress(Math.min(100, (cur / dur) * 100));
            setAbbotVoiceDuration({
              current: formatAudioTime(cur),
              total: formatAudioTime(dur),
            });
          }
        },
      });
      return () => {
        cancel();
        setIsAbbotVoiceActive(false);
        setAbbotVoiceProgress(0);
      };
    } else {
      stopAbbotVoice();
      soundEngine.stopWoodenFishRhythm();
      setIsAbbotVoiceActive(false);
      setAbbotVoiceProgress(0);
    }
  }, [abbotDialogue]);

  const handleCloseAbbotDialogue = useCallback(() => {
    stopAbbotVoice();
    soundEngine.stopWoodenFishRhythm();
    setIsAbbotVoiceActive(false);
    setAbbotVoiceProgress(0);
    setAbbotDialogue(null);
  }, []);


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

  // Tải / Tải lại mô hình 3D Chibi khi diện mạo thay đổi
  useEffect(() => {
    if (!monkGroupRef.current) return;
    let cancelled = false;

    loadChibiCharacter(character).then((rig) => {
      if (cancelled) return;
      charMixerRef.current = rig.mixer;
      charActionsRef.current = rig.actions;
      chibiIncenseBundleRef.current = rig.incenseBundle || null;
      rig.actions.idle.play();
      currentActionRef.current = 'idle';


      // Remove previous realistic model if any & dispose resources
      if (chibiModelRef.current) {
        monkGroupRef.current?.remove(chibiModelRef.current);
        chibiModelRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry?.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => (m as THREE.Material).dispose());
            } else if (mesh.material) {
              (mesh.material as THREE.Material).dispose();
            }
          }
        });
      }
      chibiModelRef.current = rig.modelGroup;
      monkGroupRef.current?.add(rig.modelGroup);
      chibiModelLoadedRef.current = true;
    }).catch((err) => {
      console.warn('Chibi load error:', err);
    });

    return () => {
      cancelled = true;
    };
  }, [
    character.gender,
    character.robeColor,
    character.hairStyle,
    character.accessory,
    character.name,
  ]);

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

    // 3. Renderer with optimized shadow maps and pixel ratio limit (1.0 - 1.25)
    const isHighQuality = graphicsQuality === 'HIGH';
    const maxPixelRatio = isHighQuality ? 1.25 : 1.0;
    const renderer = new THREE.WebGLRenderer({ antialias: isHighQuality, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.shadowMap.enabled = isHighQuality;
    renderer.shadowMap.type = THREE.PCFShadowMap; // Bỏ chữ soft (PCFSoftShadowMap -> PCFShadowMap)
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
    sunLight.castShadow = isHighQuality;
    const shadowMapDim = isHighQuality ? 1024 : 512;
    sunLight.shadow.mapSize.width = shadowMapDim;
    sunLight.shadow.mapSize.height = shadowMapDim;
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

    // [ZONE 4: THÁP CHUÔNG CỔ TỰ 2 TẦNG 8 MÁI & CHÚ TIỂU THỈNH CHUÔNG (THEO BẢN VẼ MẪU)]
    const bellTowerData = createAuthenticBellTower(
      matStoneGrey,
      matLotusPlinth,
      matWoodLim,
      matDarkTimber,
      matAmberWood,
      matJadeRoofTile,
      matBronze,
      matGold,
      nightLightsRef
    );
    bellTowerData.group.position.set(-26, 0, -20);
    bellMeshRef.current = bellTowerData.bellMesh;
    chayGoRef.current = bellTowerData.chayGo;
    impactFlashRef.current = bellTowerData.impactFlash;
    bellNpcMonkRef.current = bellTowerData.npcMonk;
    soundRipplesGroupRef.current = bellTowerData.soundRipplesGroup;
    bellTowerData.roofs.forEach((r) => bellRoofsRef.current.push(r));
    scene.add(bellTowerData.group);

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

    // [ZONE 6: DÃY HÀNH LANG CỘT GỖ LIM CAO THOÁNG & MÁI NGÓI MEN NGỌC UỐN LƯỢN]
    const corridorGroup = new THREE.Group();
    corridorGroup.position.set(18, 0, 13);

    // 1. Solid Stone Foundation Podium (Bệ móng đá khối tôn cao)
    const corrStoneBase = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.45, 34.6),
      matStoneGrey
    );
    corrStoneBase.position.set(0, 0.225, 0);
    corrStoneBase.receiveShadow = true;
    corridorGroup.add(corrStoneBase);

    // Polished Lim Wood Flooring (Sàn gỗ lim nhẵn bóng)
    const corrFloor = new THREE.Mesh(
      new THREE.BoxGeometry(6.6, 0.15, 34.0),
      matWoodLim
    );
    corrFloor.position.set(0, 0.525, 0);
    corrFloor.receiveShadow = true;
    corridorGroup.add(corrFloor);

    // Stone Steps at South Entrance (Bậc tam cấp đá lối vào phía nam)
    for (let st = 0; st < 2; st++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.18, 1.0),
        matStoneGrey
      );
      step.position.set(0, 0.12 + st * 0.16, 17.5 + st * 0.7);
      corridorGroup.add(step);
    }

    // 2. Colonnade of Tall Lim Wood Pillars with Carved Lotus Plinths
    const corrColZ = [-14.0, -8.5, -3.0, 2.5, 8.0, 13.5];
    for (const cz of corrColZ) {
      for (const cx of [-2.6, 2.6]) {
        // Carved stone lotus plinth (Chân tảng đá chạm hoa sen)
        const plinth = new THREE.Mesh(
          new THREE.CylinderGeometry(0.52, 0.62, 0.35, 12),
          matLotusPlinth
        );
        plinth.position.set(cx, 0.725, cz);
        corridorGroup.add(plinth);

        // Tall Lim Wood Column (Cột gỗ lim cao 7.0m)
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.42, 7.0, 16),
          matWoodLim
        );
        col.position.set(cx, 4.4, cz);
        col.castShadow = true;
        corridorGroup.add(col);
      }

      // Transverse Timber Tie-Beam (Xà ngang liên kết cột đôi)
      const tieBeam = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 0.32, 0.38),
        matDarkTimber
      );
      tieBeam.position.set(0, 7.7, cz);
      corridorGroup.add(tieBeam);

      // Cantilever Bracket Consoles (Con sơn đỡ diềm mái hai bên)
      for (const sx of [-1, 1]) {
        const consoleArm = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.24, 0.32),
          matDarkTimber
        );
        consoleArm.position.set(sx * 3.3, 7.82, cz);
        corridorGroup.add(consoleArm);
      }

      // Traditional Red Silk Hanging Lanterns
      const lantern = createStylizedSilkLantern(matLanternRed);
      lantern.position.set(0, 6.4, cz);
      corridorGroup.add(lantern);

      // Warm Sacred Point Light
      const pLight = new THREE.PointLight(0xf87171, 0.85, 9);
      pLight.position.set(0, 5.8, cz);
      nightLightsRef.current.push(pLight);
      corridorGroup.add(pLight);
    }

    // Longitudinal Architrave Beams (Xà dọc chạy suốt chiều dài hành lang)
    for (const cx of [-2.6, 2.6]) {
      const architrave = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.34, 33.5),
        matDarkTimber
      );
      architrave.position.set(cx, 7.85, -0.25);
      corridorGroup.add(architrave);
    }

    // 3. Lofty Authentic Curved Roof with Jade-Green Glazed Tiles
    const corrRoof = createAuthenticLongCorridorRoof(
      9.6, // width
      34.0, // length
      2.6, // height of roof curve
      matJadeRoofTile,
      matDarkTimber,
      matGold
    );
    corrRoof.position.set(0, 7.9, -0.25);
    corridorGroup.add(corrRoof);
    scene.add(corridorGroup);

    // [ZONE 7: ĐẠI HÙNG BẢO ĐIỆN - TÒA CHÍNH KIẾN TRÚC MỚI THEO BẢN VẼ MẪU & SƯ PHỤ TRỤ TRÌ]
    const sanctuaryData = createAuthenticDaiHungBaoDien(
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
    scene.add(sanctuaryData.group);
    abbotNpcRef.current = sanctuaryData.abbotNpc;
    incenseSmokeParticlesRef.current = sanctuaryData.incenseSmoke;

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

    // [ZONE 9: PHÒNG KINH SÁCH - TÀNG KINH CÁC CAO THOÁNG PHÍA ĐÔNG]
    const libGroup = new THREE.Group();
    libGroup.position.set(28.5, 0, 13.0);

    // Stone podium & wood flooring matching corridor elevation
    const libStone = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.45, 18.4), matStoneGrey);
    libStone.position.set(0, 0.225, 0);
    libStone.receiveShadow = true;
    libGroup.add(libStone);

    const libFloor = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.15, 18.0), matWoodLim);
    libFloor.position.set(0, 0.525, 0);
    libFloor.receiveShadow = true;
    libGroup.add(libFloor);

    // Stately Lim Wood Columns
    const libColPositions = [
      [-6.0, -8.0], [6.0, -8.0],
      [-6.0, 0], [6.0, 0],
      [-6.0, 8.0], [6.0, 8.0],
    ];
    libColPositions.forEach(([cx, cz]) => {
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.58, 0.35, 12), matLotusPlinth);
      plinth.position.set(cx, 0.725, cz);
      libGroup.add(plinth);

      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.40, 7.2, 16), matWoodLim);
      col.position.set(cx, 4.5, cz);
      col.castShadow = true;
      libGroup.add(col);
    });

    // Wooden Lattice Walls on East, North, and South sides (West side open to Corridor)
    // North Wall
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(13.6, 5.2, 0.25), matWoodWarm);
    wallN.position.set(0, 3.2, -8.8);
    libGroup.add(wallN);

    // South Wall
    const wallS = new THREE.Mesh(new THREE.BoxGeometry(13.6, 5.2, 0.25), matWoodWarm);
    wallS.position.set(0, 3.2, 8.8);
    libGroup.add(wallS);

    // East Wall
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 5.2, 17.6), matWoodWarm);
    wallE.position.set(6.8, 3.2, 0);
    libGroup.add(wallE);

    // West Side (facing corridor): Arch portal openings with entrance pillars
    for (const pz of [-8.0, -4.5, 4.5, 8.0]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.5, 0.35), matDarkTimber);
      post.position.set(-6.8, 3.3, pz);
      libGroup.add(post);
    }
    const westLintel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 17.6), matDarkTimber);
    westLintel.position.set(-6.8, 6.1, 0);
    libGroup.add(westLintel);

    // 3 Ancient Scripture Bookshelves inside Tàng Kinh Các
    for (const bz of [-4.5, 0, 4.5]) {
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(1.5, 0, bz);

      const shelfMesh = new THREE.Mesh(new THREE.BoxGeometry(8.5, 5.2, 1.1), matWoodWarm);
      shelfMesh.position.set(0, 3.2, 0);
      shelfMesh.castShadow = true;
      shelfGroup.add(shelfMesh);

      // Book/scroll slots
      for (let sh = 0; sh < 4; sh++) {
        const divider = new THREE.Mesh(new THREE.BoxGeometry(8.3, 0.08, 1.05), matDarkTimber);
        divider.position.set(0, 1.4 + sh * 1.15, 0);
        shelfGroup.add(divider);
      }
      libGroup.add(shelfGroup);
    }

    // Zen Calligraphy & Tea Table in Library
    const teaTable = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.65, 1.8), matWoodWarm);
    teaTable.position.set(-3.2, 0.925, 0);
    libGroup.add(teaTable);

    const teapot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.25, 8), matBronze);
    teapot.position.set(-3.2, 1.37, 0);
    libGroup.add(teapot);

    // Red silk lanterns
    for (const lz of [-4.5, 4.5]) {
      const lantern = createStylizedSilkLantern(matLanternRed);
      lantern.position.set(-1.0, 6.4, lz);
      libGroup.add(lantern);

      const pLight = new THREE.PointLight(0xf59e0b, 0.8, 10);
      pLight.position.set(-1.0, 5.8, lz);
      nightLightsRef.current.push(pLight);
      libGroup.add(pLight);
    }

    // Sweeping Elevated Hip Roof of Tàng Kinh Các
    const libRoof = createJadeCurvedRoof(16.5, 20.5, 3.4, matJadeRoofTile, matGold);
    libRoof.position.set(0, 8.2, 0);
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

    // [3D CHARACTER RIG]
    const monkGroup = new THREE.Group();
    monkGroup.position.set(0, 0.42, 80);
    monkGroupRef.current = monkGroup;
    scene.add(monkGroup);

    // Khởi tạo mô hình 3D Chibi Rig
    loadChibiCharacter(character).then((rig) => {
      charMixerRef.current = rig.mixer;
      charActionsRef.current = rig.actions;
      rig.actions.idle.play();
      currentActionRef.current = 'idle';

      if (chibiModelRef.current) {
        monkGroupRef.current?.remove(chibiModelRef.current);
      }
      chibiModelRef.current = rig.modelGroup;
      monkGroup.add(rig.modelGroup);
      chibiModelLoadedRef.current = true;
    }).catch((err) => {
      console.warn('Character load error:', err);
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
      const currentPy = playerPosRef.current.y || 0.42;

      // Hỗ trợ bắt chuẩn mặt sàn cao Y = 3.30m của Đại Hùng Bảo Điện khi click vào Chánh Điện
      const sanctuaryPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -3.30);
      const hitSanctuary = new THREE.Vector3();
      let matchedSanctuary = false;

      if (raycaster.ray.intersectPlane(sanctuaryPlane, hitSanctuary)) {
        if (hitSanctuary.x >= -23.5 && hitSanctuary.x <= 23.5 && hitSanctuary.z <= -0.5 && hitSanctuary.z >= -34.0) {
          hit.copy(hitSanctuary);
          matchedSanctuary = true;
        }
      }

      if (!matchedSanctuary) {
        groundPlane.constant = -currentPy;
        if (raycaster.ray.intersectPlane(groundPlane, hit)) {
          hit.x = Math.max(-50, Math.min(50, hit.x));
          hit.z = Math.max(-75, Math.min(95, hit.z));
        }
      }

      cursorGroundPosRef.current.copy(hit);
      hasGroundTargetRef.current = true;
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
        if (monkPoseRef.current !== 'STAND') {
          monkPoseRef.current = 'STAND';
          setMonkPose('STAND');
          soundEngine.stopWoodenFishRhythm();
          stopAbbotVoice();
        }
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
            soundEngine.stopWoodenFishRhythm();
            stopAbbotVoice();
          }
          isCurrentlyWalking = true;
          isWalkingStateRef.current = true;

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
            isWalkingStateRef.current = true;

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

        // Hoạt ảnh 3D Chibi Rig (Idle / Walk / Sit)
        if (charMixerRef.current && chibiModelLoadedRef.current) {
          let target = 'idle';
          if (monkPoseRef.current === 'INCENSE_BOW') {
            target = 'incenseBow';
          } else if (monkPoseRef.current === 'SIT_EDGE') {
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
        }

        // Handle Relaxed Character Poses (Tự động thích ứng sàn Hiên Nước & Sảnh Chính Điện)
        if (monkPoseRef.current === 'LIE_DOWN') {
          // Nằm ngắm mây trời buông thư
          monkGroupRef.current.rotation.set(-Math.PI / 2, 0, 0);
          currentP.y = targetFloorY + 0.07;
        } else if (monkPoseRef.current === 'SIT_EDGE') {
          // Kiểm tra xem đang ngồi tại Hiên Nước hay Tọa Thiền Chánh Điện
          const isAtPondDeck = currentP.x >= -38.5 && currentP.x <= -26.0 && currentP.z >= 26.5 && currentP.z <= 45.5;
          if (isAtPondDeck) {
            // Ngồi buông chân mép sàn gỗ Hiên Nước ngắm cá Koi
            monkGroupRef.current.rotation.set(0, -Math.PI / 2, 0);
            currentP.y = 0.89;
          } else {
            // Tọa thiền kiết già tại Sảnh Chính Điện / Phòng Thiền: Hướng về phía trước bàn thờ Phật
            monkGroupRef.current.rotation.set(0, Math.PI, 0);
            // Nếu ngồi trên bồ đoàn thiền tọa: nâng độ cao lên 3.38m để ngồi chính xác trên mặt đệm nhung đỏ
            const isNearCushion = SANCTUARY_CUSHIONS.some(
              (c) => Math.hypot(c.x - currentP.x, c.z - currentP.z) < 0.95
            );
            currentP.y = isNearCushion ? 3.38 : targetFloorY;
          }
        } else {
          monkGroupRef.current.rotation.x = 0;
          monkGroupRef.current.rotation.z = 0;
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
              actionsList.push({ title: 'Đàm Đạo với Chú Tiểu', action: handleTalkToMonk, icon: '🙏' });
              actionsList.push({
                title: isAutoBellActive ? 'Tắt Gõ Chuông Tự Động' : 'Bật Gõ Chuông Tự Động',
                action: toggleAutoBell,
                icon: isAutoBellActive ? '⏸️' : '▶️'
              });
            } else if (zKey === 'CORRIDOR') {
              actionsList.push({ title: 'Kinh Hành Chánh Niệm', action: () => p.onAddMerit(15, 50, 40, 'Kinh Hành'), icon: '🏮' });
            } else if (zKey === 'SANCTUARY') {
              actionsList.push({ title: 'Bạch Sư Phụ Trụ Trì', action: handleTalkToAbbot, icon: '🙏' });
              actionsList.push({ title: 'Khóa Lễ Thính Pháp', action: handleStartDharmaChantSession, icon: '📜' });
              actionsList.push({ title: 'Tọa Thiền Nghe Pháp', action: handleSitMeditationLecture, icon: '🧘' });
              actionsList.push({ title: 'Thắp Nhang Trầm Cầu An', action: handleLightIncenseSanctuary, icon: '🕯️' });
              actionsList.push({ title: 'Lau Chùi Bàn Thờ Phật', action: p.onOpenAltarCleaning, icon: '✨' });
              if (monkPoseRef.current !== 'STAND') {
                actionsList.push({
                  title: 'Đứng Dậy Bước Đi',
                  action: () => {
                    setMonkPose('STAND');
                    monkPoseRef.current = 'STAND';
                    soundEngine.stopWoodenFishRhythm();
                    stopAbbotVoice();
                  },
                  icon: '🚶'
                });
              }
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
        // Khi bước vào Chánh Điện: giảm âm lượng nhạc nền BGM còn 20%, bước ra ngoài tự phục hồi 100%
        soundEngine.setHallDucking(inSanctuary);
        const inBalcony = currentP.y >= 6.0 && currentP.z <= -6 && currentP.z >= -30;
        const inMeditation = Math.hypot(currentP.x - (-24), currentP.z - 6) < 8;
        const inLibrary = Math.hypot(currentP.x - 28.5, currentP.z - 13) < 9.5;
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
          const targetCamZ = pivotZ - forwardDirZ * dist;
          const camFloorY = getTerrainFloorElevation(targetCamX, targetCamZ, currentP.y);
          // Clamp camera Y above ground so it never clips through floor when looking up
          const targetCamY = Math.max(camFloorY + 0.35, pivotY - forwardDirY * dist);

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
          const targetCamZ = currentP.z + camOffsetZ;
          const camFloorY = getTerrainFloorElevation(targetCamX, targetCamZ, currentP.y);
          const targetCamY = Math.max(camFloorY + 0.45, currentP.y + camOffsetY);

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

      // ══════════════════════════════════════════════════════════════════
      // HOẠT ẢNH GÕ CHUÔNG NPC CHÚ TIỂU TUỆ TĨNH & ĐẠI HỒNG CHUNG
      // Chu kỳ 720 frames (~12s) thiền định, lấy đà, vung chày gõ mạnh, chuông ngân & chắp tay xá Phật
      // ══════════════════════════════════════════════════════════════════
      if (isAutoBellActiveRef.current || bellRingingTimerRef.current > 0) {
        bellAnimFrameRef.current++;
        if (bellRingingTimerRef.current > 0) bellRingingTimerRef.current--;
      }

      const cycleFrame = bellAnimFrameRef.current % 720;
      const monk = bellNpcMonkRef.current;
      const chay = chayGoRef.current;
      const bell = bellMeshRef.current;
      const ripples = soundRipplesGroupRef.current;
      const flash = impactFlashRef.current;

      const BASE_TORSO_Y = 0.46; // Độ cao thân trên chuẩn - không bao giờ để NPC bị chìm dưới sàn!

      if (cycleFrame < 480) {
        // GIAI ĐOẠN 0: NGHỈ THIỀN ĐỊNH & LẮNG NGHE CHUÔNG NGÂN (0s - 8s)
        if (bell) bell.rotation.z = 0;
        if (chay) chay.rotation.z = Math.sin(stepCount * 0.03) * 0.018;
        if (ripples) ripples.visible = false;
        if (flash) (flash.material as THREE.MeshBasicMaterial).opacity = 0;

        if (monk) {
          // Thở nhẹ nhàng chánh niệm trên độ cao sàn chuẩn
          monk.torso.position.y = BASE_TORSO_Y + Math.sin(stepCount * 0.04) * 0.012;
          monk.head.rotation.y = Math.sin(stepCount * 0.02) * 0.08;
          monk.head.rotation.x = -0.05;
          monk.torso.rotation.x = 0;
          monk.torso.rotation.z = 0;
          // Hai tay đặt tự nhiên trên thân chày gỗ
          monk.armR.rotation.x = -0.75;
          monk.armR.rotation.y = -0.15;
          monk.armR.rotation.z = -0.12;
          monk.armL.rotation.x = -0.70;
          monk.armL.rotation.y = 0.20;
          monk.armL.rotation.z = 0.12;
        }
      } else if (cycleFrame < 560) {
        // GIAI ĐOẠN 1: LẤY ĐÀ - KÉO LÙI CHÀY GỖ (8s - 9.3s)
        const t = (cycleFrame - 480) / 80; // 0 to 1
        const easeT = Math.sin(t * Math.PI * 0.5);

        // Chú Tiểu ngả người ra sau kéo lùi chày gỗ
        if (monk) {
          monk.torso.position.y = BASE_TORSO_Y - 0.02 * easeT;
          monk.torso.rotation.x = -0.32 * easeT;
          monk.head.rotation.x = -0.18 * easeT;
          monk.armR.rotation.x = -0.75 + 0.42 * easeT;
          monk.armR.rotation.z = -0.12 - 0.18 * easeT;
          monk.armL.rotation.x = -0.70 + 0.42 * easeT;
          monk.armL.rotation.z = 0.12 + 0.18 * easeT;
        }
        if (chay) {
          chay.rotation.z = 0.24 * easeT;
        }
        if (ripples) ripples.visible = false;
        if (flash) (flash.material as THREE.MeshBasicMaterial).opacity = 0;
      } else if (cycleFrame < 595) {
        // GIAI ĐOẠN 2: DỒN LỰC VUNG CHÀY GÕ MẠNH VÀO NÚM CHUÔNG (9.3s - 9.9s)
        const t = (cycleFrame - 560) / 35; // 0 to 1
        const accelT = t * t; // Gia tốc mạnh mẽ khi vung

        // Chú Tiểu rướn toàn thân về phía trước, hai tay đẩy chày gỗ hết tầm với
        if (monk) {
          monk.torso.position.y = BASE_TORSO_Y + 0.02 * Math.sin(t * Math.PI);
          monk.torso.rotation.x = -0.32 + 0.72 * accelT; // Từ ngả sau (-0.32) vươn mạnh tới (+0.40)
          monk.head.rotation.x = -0.18 + 0.38 * accelT;
          monk.armR.rotation.x = -0.33 - 0.85 * accelT; // Đẩy thẳng tay tới -1.18
          monk.armR.rotation.z = -0.30 + 0.25 * accelT;
          monk.armL.rotation.x = -0.28 - 0.85 * accelT;
          monk.armL.rotation.z = 0.30 - 0.25 * accelT;
        }
        if (chay) {
          chay.rotation.z = 0.24 - 0.46 * accelT; // Vung từ +0.24 tới va chạm tại -0.22 rad
        }
      } else if (cycleFrame < 680) {
        // GIAI ĐOẠN 3: VA CHẠM, CHUÔNG NGÂN VANG, SÓNG ÂM KIM QUANG & CHẮP TAY XÁ PHẬT (9.9s - 11.3s)
        const t = (cycleFrame - 595) / 85; // 0 to 1

        // Khoảnh khắc va chạm tại frame 595: phát âm thanh chuông nếu người chơi ở gần
        if (cycleFrame === 595) {
          const distToBell = Math.hypot(playerPosRef.current.x - (-26), playerPosRef.current.z - (-20));
          if (distToBell < 55) {
            soundEngine.playDistantEchoBell(1, Math.max(0.3, 0.95 - distToBell / 60));
          }
        }

        // Tia lửa tóe sáng (Impact flash) trong 12 frame đầu sau va chạm
        if (flash) {
          const fT = Math.max(0, 1 - (cycleFrame - 595) / 14);
          (flash.material as THREE.MeshBasicMaterial).opacity = fT * 0.95;
          flash.scale.set(1 + (1 - fT) * 2.5, 1 + (1 - fT) * 2.5, 1 + (1 - fT) * 2.5);
        }

        // Chày gỗ nảy lại dao động điều hòa giảm dần
        if (chay) {
          chay.rotation.z = -0.22 + Math.sin(t * 18.0) * 0.10 * (1 - t);
        }

        // Đại Hồng Chung rung chấn thanh thoát
        if (bell) {
          bell.rotation.z = Math.sin(t * 32.0) * 0.07 * (1 - t);
        }

        // Sóng âm kim quang lan tỏa
        if (ripples) {
          ripples.visible = true;
          ripples.children.forEach((ring, idx) => {
            const rT = ((cycleFrame - 595 + idx * 12) % 45) / 45;
            ring.scale.set(1 + rT * 5.2, 1 + rT * 5.2, 1 + rT * 5.2);
            const mat = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = Math.max(0, (1 - rT) * 0.85);
          });
        }

        // Chú Tiểu thu tay về trước ngực, chắp hai tay lại thành ấn Hiệp Chưởng (Anjali) và cúi đầu xá Phật
        if (monk) {
          const bowProgress = Math.min(1.0, t * 2.2);
          monk.torso.position.y = BASE_TORSO_Y;
          monk.torso.rotation.x = 0.40 * (1 - bowProgress) + 0.24 * bowProgress;
          monk.head.rotation.x = 0.20 * (1 - bowProgress) + 0.32 * bowProgress;
          // Hai bàn tay chập lại chính giữa ngực
          monk.armR.rotation.x = -1.18 * (1 - bowProgress) - 0.68 * bowProgress;
          monk.armR.rotation.z = -0.05 * (1 - bowProgress) - 0.60 * bowProgress;
          monk.armR.rotation.y = -0.25 * bowProgress;
          monk.armL.rotation.x = -1.13 * (1 - bowProgress) - 0.68 * bowProgress;
          monk.armL.rotation.z = 0.05 * (1 - bowProgress) + 0.60 * bowProgress;
          monk.armL.rotation.y = 0.25 * bowProgress;
        }
      } else {
        // GIAI ĐOẠN 4: HỒI PHỤC TƯ THẾ CHUẨN BỊ CHO HỒI CHUÔNG TIẾP THEO (11.3s - 12s)
        const t = (cycleFrame - 680) / 40; // 0 to 1
        if (chay) chay.rotation.z = Math.sin(stepCount * 0.03) * 0.018;
        if (bell) bell.rotation.z = 0;
        if (ripples) ripples.visible = false;
        if (flash) (flash.material as THREE.MeshBasicMaterial).opacity = 0;

        if (monk) {
          // Trở lại tư thế giữ chày gỗ vững vàng
          monk.torso.position.y = BASE_TORSO_Y;
          monk.torso.rotation.x = 0.24 * (1 - t);
          monk.head.rotation.x = 0.32 * (1 - t) - 0.05 * t;
          monk.armR.rotation.x = -0.68 * (1 - t) - 0.75 * t;
          monk.armR.rotation.z = -0.60 * (1 - t) - 0.12 * t;
          monk.armR.rotation.y = -0.25 * (1 - t) - 0.15 * t;
          monk.armL.rotation.x = -0.68 * (1 - t) - 0.70 * t;
          monk.armL.rotation.z = 0.60 * (1 - t) + 0.12 * t;
          monk.armL.rotation.y = 0.25 * (1 - t) + 0.20 * t;
        }
      }

      // ══════════════════════════════════════════════════════════════════
      // HOẠT ẢNH SƯ PHỤ TRỤ TRÌ (ÁO CÀ SA ĐỎ, RÂU BẠC DÀI) & KHÓI TRẦM CHÁNH ĐIỆN
      // ══════════════════════════════════════════════════════════════════
      const abbot = abbotNpcRef.current;
      if (abbot) {
        // Nhịp thở chánh niệm tĩnh lặng
        abbot.torso.position.y = 0.68 + Math.sin(stepCount * 0.03) * 0.008;
        // Hào quang trí tuệ tỏa sáng nhấp nháy êm dịu
        abbot.halo.rotation.z += 0.004;
        const matH = abbot.halo.material as THREE.MeshBasicMaterial;
        if (matH) matH.opacity = 0.82 + Math.sin(stepCount * 0.04) * 0.14;
        // Bàn tay phải lần tràng hạt bồ đề 108 hạt
        abbot.armR.rotation.x = -0.65 + Math.sin(stepCount * 0.06) * 0.05;
        abbot.beads.rotation.z = Math.sin(stepCount * 0.06) * 0.10;
        // Đầu khẽ gật nhẹ từ bi
        abbot.head.rotation.x = -0.04 + Math.sin(stepCount * 0.03) * 0.02;
      }

      // Khói trầm hương bốc lên nghi ngút từ Đại Đỉnh Hương Đồng
      incenseSmokeParticlesRef.current.forEach((smoke, idx) => {
        smoke.position.y += 0.022;
        smoke.position.x += Math.sin(stepCount * 0.03 + idx * 1.2) * 0.006;
        smoke.position.z += Math.cos(stepCount * 0.025 + idx * 1.5) * 0.006;
        const progress = Math.max(0, Math.min(1, (smoke.position.y - 1.6) / 3.8));
        smoke.scale.set(1 + progress * 2.8, 1 + progress * 2.8, 1 + progress * 2.8);
        const matS = smoke.material as THREE.MeshBasicMaterial;
        if (matS) matS.opacity = Math.max(0, (1 - progress) * 0.38);
        if (smoke.position.y > 5.4) {
          smoke.position.y = 1.6;
          smoke.position.x = (Math.random() - 0.5) * 0.25;
          smoke.position.z = (Math.random() - 0.5) * 0.25;
        }
      });

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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
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

      // Giải phóng bộ nhớ RAM & VRAM: dispose toàn bộ Geometries, Materials và Textures khi unmount/chuyển cảnh
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (mesh.material) {
            const disposeMat = (mat: THREE.Material) => {
              const m = mat as THREE.MeshStandardMaterial;
              if (m.map) m.map.dispose();
              if (m.normalMap) m.normalMap.dispose();
              if (m.roughnessMap) m.roughnessMap.dispose();
              if (m.metalnessMap) m.metalnessMap.dispose();
              if (m.bumpMap) m.bumpMap.dispose();
              if (m.aoMap) m.aoMap.dispose();
              m.dispose();
            };
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(disposeMat);
            } else {
              disposeMat(mesh.material);
            }
          }
        }
      });
      scene.clear();
      renderer.dispose();
    };
  }, [handleFeedKoiFish, handleRingBell, handleTalkToMonk, toggleAutoBell, graphicsQuality]);

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

      {/* DIALOGUE MODAL: CHÚ TIỂU TUỆ TĨNH THỈNH CHUÔNG */}
      {bellNpcDialogue && (
        <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[94vw] sm:max-w-md w-full animate-fadeIn">
          <div className="anime-glass-panel border-2 border-amber-400/50 p-4 sm:p-5 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl relative">
            <button
              onClick={() => setBellNpcDialogue(null)}
              className="absolute top-3 right-3 text-amber-200 hover:text-white text-xs p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center text-2xl shadow-lg border border-amber-300/60 ring-2 ring-amber-400/30 shrink-0">
                {bellNpcDialogue.avatar}
              </div>
              <div>
                <div className="font-heading font-black text-sm sm:text-base text-amber-200 flex items-center gap-1.5">
                  <span>{bellNpcDialogue.speaker}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-normal">
                    {bellNpcDialogue.role}
                  </span>
                </div>
                <div className="text-[11px] text-amber-100/70 font-sans">
                  Tháp Chuông Chùa Sơn Tự
                </div>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-stone-100 font-serif leading-relaxed mb-3 whitespace-pre-line bg-black/30 p-3 rounded-2xl border border-amber-500/20">
              {bellNpcDialogue.text}
            </div>

            {bellNpcDialogue.gatha && (
              <div className="text-[11px] sm:text-xs text-amber-300/90 font-serif italic text-center p-2.5 rounded-xl bg-amber-950/40 border border-amber-400/30 mb-3 whitespace-pre-line leading-relaxed shadow-inner">
                {bellNpcDialogue.gatha}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleRingBell}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-heading font-black text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5 border border-amber-300/50"
              >
                <span>🔔</span>
                <span>Thỉnh Chuông Lại</span>
              </button>
              <button
                onClick={() => setBellNpcDialogue(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white font-heading text-xs transition cursor-pointer border border-amber-400/30"
              >
                Tâm An Lạc 🙏
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOGUE MODAL: HÒA THƯỢNG TRỤ TRÌ THUYẾT PHÁP (ÁO CÀ SA ĐỎ, RÂU BẠC DÀI) */}
      {abbotDialogue && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[94vw] sm:max-w-lg w-full animate-fadeIn">
          <div className="anime-glass-panel border-2 border-red-500/50 p-4 sm:p-6 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative bg-stone-950/90">
            <button
              onClick={handleCloseAbbotDialogue}
              className="absolute top-3 right-3 text-amber-200 hover:text-white text-xs p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-yellow-600 flex items-center justify-center text-3xl shadow-xl border-2 border-amber-300/80 ring-2 ring-red-500/40 shrink-0">
                {abbotDialogue.avatar}
              </div>
              <div>
                <div className="font-heading font-black text-sm sm:text-base text-amber-200 flex items-center gap-2">
                  <span>{abbotDialogue.speaker}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/30 text-amber-300 border border-amber-400/50 font-normal">
                    {abbotDialogue.role}
                  </span>
                </div>
                <div className="text-[11px] text-amber-100/70 font-serif">
                  Đại Hùng Bảo Điện • Tòa Thuyết Pháp
                </div>
              </div>
            </div>

            {/* THANH ĐIỀU KHIỂN & HIỂN THỊ SÓNG ÂM GIỌNG ĐỌC SƯ THẦY (BẢN THU ÂM GIONGSUTHAY.MP3) */}
            <div className="flex flex-col gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-stone-900/90 to-amber-950/80 border border-amber-500/40 mb-3 text-xs shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isAbbotVoiceActive ? (
                    <>
                      <div className="flex items-end gap-1 h-4">
                        <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-3" />
                        <span className="w-1 bg-yellow-300 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-4" />
                        <span className="w-1 bg-amber-300 rounded-full animate-[bounce_0.5s_ease-in-out_infinite] h-2.5" />
                        <span className="w-1 bg-yellow-400 rounded-full animate-[bounce_0.7s_ease-in-out_infinite] h-3.5" />
                      </div>
                      <span className="text-amber-200 font-bold text-[11px] tracking-wide animate-pulse">
                        Sư Thầy đang tụng kệ truyền cảm...
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-300/80 text-[11px] flex items-center gap-1.5 font-serif">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Giọng đọc thiền môn của Sư Thầy</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {abbotVoiceDuration.total !== '00:00' && (
                    <span className="text-[10px] font-mono text-amber-200/80">
                      {abbotVoiceDuration.current} / {abbotVoiceDuration.total}
                    </span>
                  )}
                  {isAbbotVoiceActive ? (
                    <button
                      onClick={() => {
                        stopAbbotVoice();
                        setIsAbbotVoiceActive(false);
                        setAbbotVoiceProgress(0);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-amber-200 hover:text-white text-[11px] font-bold border border-red-500/40 flex items-center gap-1 cursor-pointer transition shadow-sm active:scale-95"
                      title="Tạm dừng giọng đọc"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Tạm Dừng</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (abbotDialogue) {
                          const formatAudioTime = (sec: number) => {
                            const m = Math.floor(sec / 60);
                            const s = Math.floor(sec % 60);
                            return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
                          };
                          setIsAbbotVoiceActive(true);
                          speakAbbotVoice(abbotDialogue.text, abbotDialogue.gatha, {
                            onStart: () => setIsAbbotVoiceActive(true),
                            onEnd: () => {
                              setIsAbbotVoiceActive(false);
                              setAbbotVoiceProgress(0);
                            },
                            onTimeUpdate: (cur, dur) => {
                              if (dur > 0) {
                                setAbbotVoiceProgress(Math.min(100, (cur / dur) * 100));
                                setAbbotVoiceDuration({
                                  current: formatAudioTime(cur),
                                  total: formatAudioTime(dur),
                                });
                              }
                            },
                          });
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 text-[11px] font-black border border-amber-300/60 flex items-center gap-1 cursor-pointer transition shadow-sm hover:scale-105 active:scale-95"
                      title="Bấm để nghe giọng đọc truyền cảm của Sư Thầy"
                    >
                      <Volume2 className="w-3 h-3 text-stone-950" />
                      <span>Nghe Giọng Thầy</span>
                    </button>
                  )}
                </div>
              </div>

              {/* THANH TIẾN TRÌNH AUDIO ÁNH KIM SANG TRỌNG */}
              <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden border border-amber-400/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-200"
                  style={{ width: `${abbotVoiceProgress}%` }}
                />
              </div>
            </div>

            <div className="text-xs sm:text-sm text-stone-100 font-serif leading-relaxed mb-3 whitespace-pre-line bg-black/40 p-3.5 rounded-2xl border border-red-500/20">
              {abbotDialogue.text}
            </div>

            {abbotDialogue.gatha && (
              <div className="text-[11px] sm:text-xs text-amber-200/95 font-serif italic text-center p-3 rounded-xl bg-red-950/50 border border-amber-400/40 mb-4 whitespace-pre-line leading-relaxed shadow-inner">
                {abbotDialogue.gatha}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={handleStartDharmaChantSession}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-500 hover:to-amber-600 text-white font-heading font-black text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5 border border-red-400/50"
              >
                <span>📜</span>
                <span>Khóa Lễ Thính Pháp</span>
              </button>
              {monkPoseRef.current !== 'STAND' ? (
                <button
                  onClick={() => {
                    handleCloseAbbotDialogue();
                    setMonkPose('STAND');
                    monkPoseRef.current = 'STAND';
                    soundEngine.stopWoodenFishRhythm();
                    stopAbbotVoice();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 text-amber-200 font-bold text-xs transition cursor-pointer border border-amber-400/30 flex items-center gap-1.5"
                >
                  <span>🚶</span>
                  <span>Đứng Dậy Xả Thiền</span>
                </button>
              ) : (
                <button
                  onClick={handleCloseAbbotDialogue}
                  className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition cursor-pointer"
                >
                  A Di Đà Phật 🙏
                </button>
              )}
            </div>
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

        {/* Nút bấm Thắp Nhang Vái Phật trên thanh công cụ */}
        <button
          onClick={handleTriggerIncenseBow}
          disabled={isIncenseBowing}
          className={`px-3 py-2 rounded-2xl font-heading text-xs font-black shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border ${
            isIncenseBowing
              ? 'bg-amber-500 text-white border-yellow-300 ring-2 ring-yellow-400/50 shadow-[0_0_16px_rgba(245,158,11,0.6)] animate-pulse'
              : 'anime-glass-panel hover:bg-amber-500/20 text-amber-300 hover:text-white border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-105'
          }`}
          title="Thắp 3 nén nhang trầm và thành kính cúi mình vái lạy 3 bái dâng Phật"
        >
          <span>🕯️ Thắp Nhang Vái Phật</span>
        </button>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-2xl anime-glass-panel border border-pink-400/30 text-pink-200 text-xs font-sans font-bold shadow-xl">
          <Eye className="w-3.5 h-3.5 text-pink-400" />
          <span>Click chuột để đi • Kéo xoay góc nhìn • Lăn chuột thu phóng</span>
        </div>
      </div>

      {/* FLOATING ACTION: NÚT THẮP NHANG & VÁI LẠY PHẬT TỔ */}
      <div className="absolute top-20 sm:top-24 right-3 sm:right-6 z-30 pointer-events-auto">
        <button
          onClick={handleTriggerIncenseBow}
          disabled={isIncenseBowing}
          className={`px-3.5 py-2.5 rounded-2xl font-heading font-black text-xs sm:text-sm flex items-center gap-2 shadow-2xl transition-all cursor-pointer backdrop-blur-md border ${
            isIncenseBowing
              ? 'bg-amber-500/90 text-white border-yellow-200 ring-4 ring-yellow-400/50 shadow-[0_0_24px_rgba(245,158,11,0.8)] animate-pulse scale-105'
              : 'bg-gradient-to-r from-amber-600/90 via-orange-500/90 to-yellow-500/90 hover:from-amber-500 hover:to-yellow-400 text-white border-yellow-300/70 shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95'
          }`}
          title="Thắp 3 nén nhang trầm và thành kính cúi mình vái lạy 3 bái dâng Phật"
        >
          <span className="text-base sm:text-lg animate-bounce">🕯️</span>
          <span>{isIncenseBowing ? 'Đang Dâng Hương & Vái Lạy...' : 'Thắp Nhang & Vái Lạy'}</span>
        </button>
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

// Authentic Long Gallery / Corridor Roof with Horizontal Ridge, Sweeping Concave Eaves & Dragon Finials
function createAuthenticLongCorridorRoof(
  width: number,
  length: number,
  height: number,
  matJadeTile: THREE.Material,
  matDarkTimber: THREE.Material,
  matGold: THREE.Material
): THREE.Group {
  const roofGroup = new THREE.Group();

  const halfW = width / 2;
  const halfL = length / 2;
  const numZSegments = 24;
  const numXSegments = 16;

  // 1. Procedural Double-Curved Concave Roof Surface
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iz = 0; iz <= numZSegments; iz++) {
    const fracZ = iz / numZSegments;
    const z = -halfL + fracZ * length;

    for (let ix = 0; ix <= numXSegments; ix++) {
      const fracX = ix / numXSegments;
      const x = -halfW + fracX * width;

      // Normalized distance from center ridge (0 at center, 1 at eaves)
      const distFromRidge = Math.abs(x) / halfW;

      // Authentic Vietnamese temple concave curve: y = height * (1 - dist^1.35)
      let y = height * Math.pow(Math.max(0, 1.0 - distFromRidge), 1.35);

      // Graceful upward flare at the 4 corner eaves
      const cornerZ = Math.max(0, (Math.abs(z) - (halfL - 3.5)) / 3.5);
      const cornerX = Math.max(0, (Math.abs(x) - (halfW - 2.0)) / 2.0);
      if (cornerZ > 0 && cornerX > 0) {
        y += Math.pow(cornerZ * cornerX, 1.6) * 0.55;
      }

      positions.push(x, y, z);
      uvs.push(fracX * 4, fracZ * 18);
    }
  }

  for (let iz = 0; iz < numZSegments; iz++) {
    for (let ix = 0; ix < numXSegments; ix++) {
      const a = iz * (numXSegments + 1) + ix;
      const b = iz * (numXSegments + 1) + (ix + 1);
      const c = (iz + 1) * (numXSegments + 1) + ix;
      const d = (iz + 1) * (numXSegments + 1) + (ix + 1);

      // Normals pointing upwards / outwards
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  roofGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  roofGeo.setIndex(indices);
  roofGeo.computeVertexNormals();

  const roofMesh = new THREE.Mesh(roofGeo, matJadeTile);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  roofGroup.add(roofMesh);

  // Underside rafter ceiling panel (Trần rui mè gỗ lim nhìn từ dưới lên)
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.88, 0.08, length * 0.98),
    matDarkTimber
  );
  ceiling.position.set(0, -0.04, 0);
  roofGroup.add(ceiling);

  // 2. Horizontal Ridge Beam with Jade Glazed Capping & Gold Inlay
  const ridgeLen = length * 0.98;
  const ridgeCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, ridgeLen, 8),
    matJadeTile
  );
  ridgeCyl.rotation.x = Math.PI / 2;
  ridgeCyl.position.set(0, height + 0.12, 0);
  roofGroup.add(ridgeCyl);

  const ridgeGold = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.20, ridgeLen),
    matGold
  );
  ridgeGold.position.set(0, height + 0.28, 0);
  roofGroup.add(ridgeGold);

  // Dragon-Head Finials (Kìm Nóc Ngậm Bờ Nóc) at both ends of the ridge
  for (const rz of [-halfL * 0.96, halfL * 0.96]) {
    const finialGroup = new THREE.Group();
    finialGroup.position.set(0, height + 0.35, rz);

    const headArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.18, 8, 16, Math.PI * 0.75),
      matGold
    );
    headArc.rotation.y = rz > 0 ? Math.PI / 2 : -Math.PI / 2;
    finialGroup.add(headArc);

    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 6), matGold);
    horn.position.set(0, 0.55, rz > 0 ? -0.25 : 0.25);
    horn.rotation.x = rz > 0 ? -Math.PI / 5 : Math.PI / 5;
    finialGroup.add(horn);

    roofGroup.add(finialGroup);
  }

  // 3. Eave Border Trim (Diềm Mái Ngói Trích Thủy)
  for (const ex of [-halfW, halfW]) {
    const eaveTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.22, length),
      matDarkTimber
    );
    eaveTrim.position.set(ex, -0.05, 0);
    roofGroup.add(eaveTrim);
  }

  // 4. 4 Upturned Dragon Corner Eaves (Đầu Đao Cong Vút Mạ Vàng)
  for (const cx of [-halfW, halfW]) {
    for (const cz of [-halfL, halfL]) {
      const eaveArc = new THREE.Mesh(
        new THREE.TorusGeometry(1.0, 0.22, 8, 16, Math.PI * 0.75),
        matJadeTile
      );
      eaveArc.position.set(cx, 0.38, cz);
      eaveArc.rotation.z = cx < 0 ? Math.PI / 3.4 : -Math.PI / 3.4;
      eaveArc.rotation.y = cz < 0 ? -Math.PI / 4 : Math.PI / 4;
      roofGroup.add(eaveArc);

      const eaveTip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.75, 6), matGold);
      eaveTip.position.set(
        cx + (cx < 0 ? -0.5 : 0.5),
        1.0,
        cz + (cz < 0 ? -0.5 : 0.5)
      );
      eaveTip.rotation.z = cx < 0 ? -Math.PI / 4 : Math.PI / 4;
      roofGroup.add(eaveTip);
    }
  }

  // 5. Gable End Pediment Trusses (Đầu Hồi Bít Đốc & Vì Kẻ Gỗ Lim)
  for (const gz of [-halfL, halfL]) {
    const pediment = new THREE.Group();
    pediment.position.set(0, 0, gz);

    const tieBeam = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.94, 0.34, 0.4),
      matDarkTimber
    );
    tieBeam.position.set(0, -0.15, 0);
    pediment.add(tieBeam);

    const kingPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, height - 0.2, 0.38),
      matDarkTimber
    );
    kingPost.position.set(0, height / 2 - 0.1, 0);
    pediment.add(kingPost);

    for (const side of [-1, 1]) {
      const rafterLen = Math.hypot(halfW * 0.9, height);
      const rafter = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.3, rafterLen),
        matDarkTimber
      );
      rafter.position.set(side * halfW * 0.45, height * 0.45, 0);
      rafter.rotation.y = Math.PI / 2;
      rafter.rotation.x = side * Math.atan2(height, halfW * 0.9);
      pediment.add(rafter);
    }

    roofGroup.add(pediment);
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

// Authentic Main Sanctuary Complex (Đại Hùng Bảo Điện theo bản vẽ phát thảo & Sư Phụ Trụ Trì)
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
): {
  group: THREE.Group;
  abbotNpc: {
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
    halo: THREE.Mesh;
    beads: THREE.Group;
  };
  incenseSmoke: THREE.Mesh[];
} {
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

  // 4. MAIN SANCTUARY BUILDING BODY (TIỀN ĐƯỜNG & HẬU CUNG - NÂNG CAO TRẦN NHÀ THÔNG THOÁNG 10.5M)
  const hallBodyGroup = new THREE.Group();
  hallBodyGroup.position.set(0, 3.2, 0);

  const bodyW = 32;
  const bodyD = 22;
  const bodyH = 10.5; // Nâng trần cao từ 6.8m lên 10.5m để không che khuất đầu và vầng hào quang tượng Phật

  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, 0.5), matAmberWood);
  wallBack.position.set(0, bodyH / 2, -bodyD / 2);
  hallBodyGroup.add(wallBack);

  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, bodyH, bodyD), matAmberWood);
  wallLeft.position.set(-bodyW / 2, bodyH / 2, 0);
  hallBodyGroup.add(wallLeft);

  const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, bodyH, bodyD), matAmberWood);
  wallRight.position.set(bodyW / 2, bodyH / 2, 0);
  hallBodyGroup.add(wallRight);

  // 4.1. HỆ CỘT HIÊN TIỀN ĐIỆN VÀ MẶT TIỀN CỬA BỨC BÀN TRUYỀN THỐNG VIỆT NAM
  const verandaColCoords = [-12.6, -7.5, -2.6, 2.6, 7.5, 12.6];
  verandaColCoords.forEach((vx) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, bodyH + 0.5, 12), matDarkTimber);
    col.position.set(vx, (bodyH + 0.5) / 2, bodyD / 2 + 1.8);
    col.castShadow = true;
    hallBodyGroup.add(col);

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.75, 0.35, 12), matLotusPlinth);
    plinth.position.set(vx, 0.175, bodyD / 2 + 1.8);
    hallBodyGroup.add(plinth);
  });

  // Xà hiên đỡ mái tiền điện
  const verandaBeam = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 2, 0.45, 0.50), matDarkTimber);
  verandaBeam.position.set(0, bodyH + 0.1, bodyD / 2 + 1.8);
  hallBodyGroup.add(verandaBeam);

  // 4.2. KHUNG VÁCH MẶT TIỀN & XÀ NÁCH (Front Facade Frame at Z = bodyD / 2)
  const frontZ = bodyD / 2;

  // Xà hạ / Ngưỡng cửa gỗ lim hai bên
  const sillLeft = new THREE.Mesh(new THREE.BoxGeometry((bodyW - 5.2) / 2, 0.16, 0.32), matDarkTimber);
  sillLeft.position.set(-(bodyW + 5.2) / 4, 0.08, frontZ);
  hallBodyGroup.add(sillLeft);

  const sillRight = new THREE.Mesh(new THREE.BoxGeometry((bodyW - 5.2) / 2, 0.16, 0.32), matDarkTimber);
  sillRight.position.set((bodyW + 5.2) / 4, 0.08, frontZ);
  hallBodyGroup.add(sillRight);

  // Gờ chỉ đồng phẳng mịn ngưỡng cửa gian giữa đón khách
  const sillCenter = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.02, 0.32), matGold);
  sillCenter.position.set(0, 0.01, frontZ);
  hallBodyGroup.add(sillCenter);

  // Xà đai trên cao (Lintel beam trên các bộ cửa)
  const frontLintel = new THREE.Mesh(new THREE.BoxGeometry(bodyW, 0.42, 0.45), matDarkTimber);
  frontLintel.position.set(0, 5.0, frontZ);
  hallBodyGroup.add(frontLintel);

  // Cổ diêm thượng song con tiện gỗ lấy sáng cao ráo (Clerestory Transom Lattice from Y = 5.2 to bodyH)
  for (let tx = -14.0; tx <= 14.0; tx += 0.45) {
    const transomBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, bodyH - 5.3, 6), matAmberWood);
    transomBar.position.set(tx, (5.2 + bodyH) / 2, frontZ);
    hallBodyGroup.add(transomBar);
  }

  // Cột cái mặt tiền chia thành 5 gian truyền thống
  const frontPillarsX = [-13.0, -7.6, -2.6, 2.6, 7.6, 13.0];
  frontPillarsX.forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.58, bodyH, 14), matDarkTimber);
    pillar.position.set(px, bodyH / 2, frontZ);
    pillar.castShadow = true;
    hallBodyGroup.add(pillar);

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.76, 0.32, 14), matLotusPlinth);
    plinth.position.set(px, 0.16, frontZ);
    hallBodyGroup.add(plinth);
  });

  // Tường gỗ hai đầu hồi ngoài cùng
  for (const side of [-1, 1]) {
    const endWall = new THREE.Mesh(new THREE.BoxGeometry(3.0, bodyH, 0.28), matAmberWood);
    endWall.position.set(side * 14.5, bodyH / 2, frontZ);
    hallBodyGroup.add(endWall);
  }

  // Hàm tạo cánh Cửa Bức Bàn Thượng Song Hạ Bản truyền thống
  const createBucBanDoorLeaf = (width: number, height: number) => {
    const leaf = new THREE.Group();
    const frameThickness = 0.08;
    const frameBorder = 0.10;

    for (const sx of [-width / 2 + frameBorder / 2, width / 2 - frameBorder / 2]) {
      const stile = new THREE.Mesh(new THREE.BoxGeometry(frameBorder, height, frameThickness), matDarkTimber);
      stile.position.set(sx, height / 2, 0);
      leaf.add(stile);
    }
    const railTop = new THREE.Mesh(new THREE.BoxGeometry(width, frameBorder, frameThickness), matDarkTimber);
    railTop.position.set(0, height - frameBorder / 2, 0);
    leaf.add(railTop);

    const railMid = new THREE.Mesh(new THREE.BoxGeometry(width, frameBorder * 1.2, frameThickness), matDarkTimber);
    railMid.position.set(0, height * 0.42, 0);
    leaf.add(railMid);

    const railBot = new THREE.Mesh(new THREE.BoxGeometry(width, frameBorder * 1.4, frameThickness), matDarkTimber);
    railBot.position.set(0, frameBorder * 0.7, 0);
    leaf.add(railBot);

    // THƯỢNG SONG: Chấn song con tiện gỗ tròn thông thoáng đón ánh nắng sân chùa
    const upperH = height * 0.54;
    const upperY = height * 0.70;
    const numBars = Math.floor(width / 0.12);
    for (let b = 1; b < numBars; b++) {
      const bx = -width / 2 + (b / numBars) * width;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, upperH - 0.05, 8), matAmberWood);
      bar.position.set(bx, upperY, 0);
      leaf.add(bar);
    }

    // HẠ BẢN: Pa-nô gỗ lim chạm nổi hoa sen
    const lowerH = height * 0.38;
    const lowerY = height * 0.22;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(width - frameBorder * 2, lowerH, frameThickness * 0.8), matAmberWood);
    panel.position.set(0, lowerY, 0);
    leaf.add(panel);

    const lotusBoss = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), matGold);
    lotusBoss.position.set(0, lowerY, frameThickness * 0.5);
    leaf.add(lotusBoss);

    const ringKnocker = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.016, 6, 12), matGold);
    ringKnocker.position.set(width * 0.26, height * 0.44, frameThickness * 0.55);
    leaf.add(ringKnocker);

    return leaf;
  };

  // 1. CỬA GIAN CHÍNH GIỮA (Lối vào mở toang đón khách thập phương)
  const doorLeafW = 0.58;
  const doorLeafH = 4.75;

  const leftFoldGroup = new THREE.Group();
  leftFoldGroup.position.set(-2.55, 0.18, frontZ);
  leftFoldGroup.rotation.y = -Math.PI / 2 + 0.15;
  const leafL1 = createBucBanDoorLeaf(doorLeafW, doorLeafH);
  leafL1.position.set(doorLeafW / 2, 0, 0);
  leftFoldGroup.add(leafL1);
  const leafL2 = createBucBanDoorLeaf(doorLeafW, doorLeafH);
  leafL2.position.set(doorLeafW * 1.5, 0, 0.08);
  leafL2.rotation.y = 0.1;
  leftFoldGroup.add(leafL2);
  hallBodyGroup.add(leftFoldGroup);

  const rightFoldGroup = new THREE.Group();
  rightFoldGroup.position.set(2.55, 0.18, frontZ);
  rightFoldGroup.rotation.y = Math.PI / 2 - 0.15;
  const leafR1 = createBucBanDoorLeaf(doorLeafW, doorLeafH);
  leafR1.position.set(-doorLeafW / 2, 0, 0);
  rightFoldGroup.add(leafR1);
  const leafR2 = createBucBanDoorLeaf(doorLeafW, doorLeafH);
  leafR2.position.set(-doorLeafW * 1.5, 0, 0.08);
  leafR2.rotation.y = -0.1;
  rightFoldGroup.add(leafR2);
  hallBodyGroup.add(rightFoldGroup);

  // 2. CỬA GIAN TẢ VÀ GIAN HỮU
  for (const side of [-1, 1]) {
    const bayCenterX = side * 5.1;
    const sideDoorW = 0.62;

    const dLeafOut = createBucBanDoorLeaf(sideDoorW, doorLeafH);
    dLeafOut.position.set(bayCenterX - side * sideDoorW * 1.45, 0.18, frontZ);
    dLeafOut.rotation.y = side * 0.12;
    hallBodyGroup.add(dLeafOut);

    const openGroup = new THREE.Group();
    openGroup.position.set(bayCenterX - side * sideDoorW * 0.5, 0.18, frontZ);
    openGroup.rotation.y = side * 1.05;
    const dLeafOpen = createBucBanDoorLeaf(sideDoorW, doorLeafH);
    dLeafOpen.position.set((side * sideDoorW) / 2, 0, 0);
    openGroup.add(dLeafOpen);
    hallBodyGroup.add(openGroup);

    const openGroup2 = new THREE.Group();
    openGroup2.position.set(bayCenterX + side * sideDoorW * 0.5, 0.18, frontZ);
    openGroup2.rotation.y = -side * 0.95;
    const dLeafOpen2 = createBucBanDoorLeaf(sideDoorW, doorLeafH);
    dLeafOpen2.position.set((-side * sideDoorW) / 2, 0, 0);
    openGroup2.add(dLeafOpen2);
    hallBodyGroup.add(openGroup2);

    const dLeafIn = createBucBanDoorLeaf(sideDoorW, doorLeafH);
    dLeafIn.position.set(bayCenterX + side * sideDoorW * 1.45, 0.18, frontZ);
    dLeafIn.rotation.y = -side * 0.12;
    hallBodyGroup.add(dLeafIn);
  }

  // 3. GIAN CHÁI TẢ & HỮU
  for (const side of [-1, 1]) {
    const bayOuterX = side * 10.3;
    const winWidth = 4.8;

    const wPanel = new THREE.Mesh(new THREE.BoxGeometry(winWidth, 1.8, 0.16), matAmberWood);
    wPanel.position.set(bayOuterX, 0.9 + 0.18, frontZ);
    hallBodyGroup.add(wPanel);

    for (let wx = bayOuterX - winWidth / 2 + 0.2; wx <= bayOuterX + winWidth / 2 - 0.2; wx += 0.22) {
      const wBar = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 2.6, 8), matAmberWood);
      wBar.position.set(wx, 3.4, frontZ);
      hallBodyGroup.add(wBar);
    }
  }

  // Clerestory Upper Wall (Cổ diêm lấy sáng trên cao)
  const clerestory = new THREE.Mesh(new THREE.BoxGeometry(26, 3.2, 18), matAmberWood);
  clerestory.position.set(0, bodyH + 1.6, -1.0);
  hallBodyGroup.add(clerestory);

  // 5. MULTI-TIER INTERLOCKING ROOFS ("TRÙNG THIỀM ĐIỆP ỐC" NÂNG CAO)
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

  // Roof 3: Rear High Sanctuary Crown Tower (Lầu Nóc Hậu Cung)
  const crownTower = new THREE.Group();
  crownTower.position.set(0, bodyH + 4.0, -4.5);

  const crownBody = new THREE.Mesh(new THREE.BoxGeometry(16, 3.2, 14), matAmberWood);
  crownBody.position.set(0, 1.6, 0);
  crownTower.add(crownBody);

  const crownRoof = createJadeCurvedRoof(18.5, 16.5, 4.0, matJadeTile, matGold);
  crownRoof.position.set(0, 3.2, 0);
  sanctuaryRoofsRef.current.push(crownRoof);
  crownTower.add(crownRoof);

  const crownSpire = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.0, 8), matGold);
  crownSpire.position.set(0, 7.5, 0);
  crownTower.add(crownSpire);

  hallBodyGroup.add(crownTower);

  // 6. GRAND INTERIOR (NỘI THẤT ĐẠI HÙNG BẢO ĐIỆN THEO HÌNH ẢNH MẪU PHÁT THẢO)
  const matRedCarpet = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.85 });
  const matCarpetBorder = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45, metalness: 0.6 });
  const matIncenseTable = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
  const matCushionRed = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
  const matBronzeCauldron = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.35, metalness: 0.75 });

  // 6.1. THẢM NHUNG ĐỎ HOA VĂN HOÀNG GIA TRẢI DỌC LINH ĐẠO CHÍNH ĐIỆN
  const carpetBorder = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.02, 17.6), matCarpetBorder);
  carpetBorder.position.set(0, 0.01, 1.0);
  hallBodyGroup.add(carpetBorder);

  const mainCarpet = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.025, 17.2), matRedCarpet);
  mainCarpet.position.set(0, 0.02, 1.0);
  hallBodyGroup.add(mainCarpet);

  const censerRug = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.03, 3.2), matCarpetBorder);
  censerRug.position.set(0, 0.025, 0.5);
  hallBodyGroup.add(censerRug);

  // 6.2. CỘT CÁI GỖ LIM & CÂU ĐỐI LÒNG MÁNG THẾP VÀNG CHỮ HÁN
  const colCoordsSanctuary = [
    [-3.5, -1.2], [3.5, -1.2],
    [-3.5, 5.2], [3.5, 5.2],
  ];
  colCoordsSanctuary.forEach(([cx, cz], idx) => {
    // 4 Cột cái gỗ lim tròn bóng bẩy vươn cao 10.5m
    const pillarLim = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, bodyH, 16), matDarkTimber);
    pillarLim.position.set(cx, bodyH / 2, cz);
    pillarLim.castShadow = true;
    hallBodyGroup.add(pillarLim);

    // Chân tảng đá hoa sen
    const pPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.80, 0.35, 16), matLotusPlinth);
    pPlinth.position.set(cx, 0.175, cz);
    hallBodyGroup.add(pPlinth);

    // Ốp đôi câu đối thếp vàng chữ Hán trên 2 Cột Cái trước bàn thờ
    if (cz < 0) {
      const isLeftCol = idx === 0;
      const coupletText = isLeftCol ? '佛日增輝法輪常轉' : '法雲普潤慧炬長明';
      const matCouplet = new THREE.MeshStandardMaterial({
        map: createCoupletTexture(coupletText),
        roughness: 0.35,
        metalness: 0.25,
      });

      const cWidth = 0.58;
      const cHeight = 6.2;

      // Bản gỗ lót viền son phía sau
      const panelBack = new THREE.Mesh(new THREE.BoxGeometry(cWidth + 0.08, cHeight + 0.1, 0.05), matDarkTimber);
      panelBack.position.set(cx + (isLeftCol ? 0.36 : -0.36), 4.5, cz + 0.32);
      panelBack.rotation.y = isLeftCol ? -0.32 : 0.32;
      hallBodyGroup.add(panelBack);

      // Mặt câu đối chữ Hán dát vàng hướng về phía người viếng
      const coupletPlane = new THREE.Mesh(new THREE.PlaneGeometry(cWidth, cHeight), matCouplet);
      coupletPlane.position.set(cx + (isLeftCol ? 0.36 : -0.36), 4.5, cz + 0.35);
      coupletPlane.rotation.y = isLeftCol ? -0.32 : 0.32;
      hallBodyGroup.add(coupletPlane);
    }
  });

  // 6.3. BỘ HOÀNH PHI SƠN SON THẾP VÀNG "ĐẠI HÙNG BẢO ĐIỆN" NÂNG CAO TRÊN XÀ THƯỢNG (Y = 8.8M)
  const mainPlaqueGroup = new THREE.Group();
  mainPlaqueGroup.position.set(0, 8.8, -3.8);

  // Khung hoành phi gỗ son viền rồng mạ vàng
  const plaqueFrame = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.55, 0.14), matLanternRed);
  mainPlaqueGroup.add(plaqueFrame);

  const plaqueGoldRim = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.65, 0.10), matGold);
  plaqueGoldRim.position.set(0, 0, -0.02);
  mainPlaqueGroup.add(plaqueGoldRim);

  const matMainPlaque = new THREE.MeshStandardMaterial({
    map: createDaiHungBaoDienPlaqueTexture(),
    roughness: 0.3,
    metalness: 0.35,
  });
  const plaqueInner = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.45), matMainPlaque);
  plaqueInner.position.set(0, 0, 0.08);
  mainPlaqueGroup.add(plaqueInner);

  hallBodyGroup.add(mainPlaqueGroup);

  // 2 Hoành phi phụ hai bên tường và cửa chính điện nâng cao (Y = 7.8m):
  // Gian trái: "佛 明 南 樓" (Phật Minh Nam Lâu)
  const matSideLeft = new THREE.MeshStandardMaterial({
    map: createSideCalligraphyPlaqueTexture('佛明南樓'),
    roughness: 0.3,
    metalness: 0.35,
  });
  const sideLeftFrame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.15, 0.10), matLanternRed);
  sideLeftFrame.position.set(-7.5, 7.8, -2.5);
  hallBodyGroup.add(sideLeftFrame);
  const sideLeftMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.05), matSideLeft);
  sideLeftMesh.position.set(-7.5, 7.8, -2.44);
  hallBodyGroup.add(sideLeftMesh);

  // Gian phải: "法 輪 常 轉" (Pháp Luân Thường Chuyển)
  const matSideRight = new THREE.MeshStandardMaterial({
    map: createSideCalligraphyPlaqueTexture('法輪常轉'),
    roughness: 0.3,
    metalness: 0.35,
  });
  const sideRightFrame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.15, 0.10), matLanternRed);
  sideRightFrame.position.set(7.5, 7.8, -2.5);
  hallBodyGroup.add(sideRightFrame);
  const sideRightMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.05), matSideRight);
  sideRightMesh.position.set(7.5, 7.8, -2.44);
  hallBodyGroup.add(sideRightMesh);

  // Hoành phi phụ trên rèm cung cấm gian thờ trong: "大 敦 福 堂" nâng cao lên Y = 9.0m
  const matCanopy = new THREE.MeshStandardMaterial({
    map: createSideCalligraphyPlaqueTexture('大敦福堂'),
    roughness: 0.3,
    metalness: 0.35,
  });
  const canopyPlaque = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.1), matCanopy);
  canopyPlaque.position.set(0, 9.0, -5.92);
  hallBodyGroup.add(canopyPlaque);

  // 6.4. BỆ THỜ TƯỢNG PHẬT TỔ NHƯ LAI (THÍCH CA MÂU NI) & 2 HỘ VỆ HAI BÊN (ĐIÊU KHẮC CHUẨN XÁC THEO BLENDER 3D)
  const altarGroup = new THREE.Group();
  altarGroup.position.set(0, 0, -6.5);

  // BỤC BỆ THỜ TAM CẤP BẰNG GỖ LIM KHẢM VÀNG (ELEVATED ALTAR PODIUM ĐỠ 3 PHO TƯỢNG UY NGHI)
  const daisStep1 = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.28, 5.8), matDarkTimber);
  daisStep1.position.set(0, 0.14, 0);
  altarGroup.add(daisStep1);

  const daisTrim1 = new THREE.Mesh(new THREE.BoxGeometry(14.7, 0.06, 6.0), matGold);
  daisTrim1.position.set(0, 0.28, 0);
  altarGroup.add(daisTrim1);

  const daisStep2 = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.28, 5.0), matDarkTimber);
  daisStep2.position.set(0, 0.42, 0);
  altarGroup.add(daisStep2);

  const daisTrim2 = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.06, 5.2), matGold);
  daisTrim2.position.set(0, 0.56, 0);
  altarGroup.add(daisTrim2);

  const daisStep3 = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.28, 4.4), matDarkTimber);
  daisStep3.position.set(0, 0.70, 0);
  altarGroup.add(daisStep3);

  const daisTrim3 = new THREE.Mesh(new THREE.BoxGeometry(11.7, 0.06, 4.6), matGold);
  daisTrim3.position.set(0, 0.84, 0);
  altarGroup.add(daisTrim3);

  // =========================================================================
  // TÔN TƯỢNG PHẬT THÍCH CA MÂU NI (MÔ HÌNH 3D CHÍNH THỨC /models/buddha/scene.gltf)
  // Đặt trang nghiêm tại trung tâm bàn thờ Chánh Điện Đại Hùng Bảo Điện
  // =========================================================================
  try {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/buddha/scene.gltf',
      (gltf) => {
        const realModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(realModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const targetH = 5.2; // Chiều cao chuẩn 5.2m uy nghiêm trên bục tam cấp
        const s = targetH / (size.y || 1);
        realModel.scale.setScalar(s);
        realModel.position.set(-center.x * s, -box.min.y * s + 0.84, -center.z * s - 0.5);
        realModel.rotation.y = 0;

        realModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        altarGroup.add(realModel);
      },
      undefined,
      (err) => {
        console.error('Không thể tải mô hình Phật 3D:', err);
      }
    );
  } catch (err) {
    console.error('Lỗi khởi tạo GLTFLoader cho tượng Phật:', err);
  }

  // === ÁNH SÁNG TRỰC TIẾP CHIẾU LÊN BAN THỜ & TƯỢNG PHẬT (SHRINE SPOTLIGHTS) ===
  // SpotLight từ phía trên chính giữa tượng Phật Tổ Như Lai
  const shrineSpot = new THREE.SpotLight(0xfff8e1, 4.5, 22, Math.PI / 5, 0.38, 1.2);
  shrineSpot.position.set(0, 14, 3.5);
  shrineSpot.target.position.set(0, 5.0, -7.5);
  nightLightsRef.current.push(shrineSpot as unknown as THREE.PointLight);
  mainHall.add(shrineSpot);
  mainHall.add(shrineSpot.target);

  // SpotLight phụ chiếu nghiêng từ bên trái
  const shrineSpotL = new THREE.SpotLight(0xfef3c7, 2.8, 18, Math.PI / 6, 0.42, 1.4);
  shrineSpotL.position.set(-5, 11, 2);
  shrineSpotL.target.position.set(-1.0, 4.5, -7.5);
  nightLightsRef.current.push(shrineSpotL as unknown as THREE.PointLight);
  mainHall.add(shrineSpotL);
  mainHall.add(shrineSpotL.target);

  // SpotLight phụ chiếu nghiêng từ bên phải
  const shrineSpotR = new THREE.SpotLight(0xfef3c7, 2.8, 18, Math.PI / 6, 0.42, 1.4);
  shrineSpotR.position.set(5, 11, 2);
  shrineSpotR.target.position.set(1.0, 4.5, -7.5);
  nightLightsRef.current.push(shrineSpotR as unknown as THREE.PointLight);
  mainHall.add(shrineSpotR);
  mainHall.add(shrineSpotR.target);

  // Ánh hào quang vàng ấm tỏa từ sau tượng trung tâm
  const buddhaGlowBack = new THREE.PointLight(0xfbbf24, 3.5, 10);
  buddhaGlowBack.position.set(0, 5.5, -8.0);
  nightLightsRef.current.push(buddhaGlowBack);
  mainHall.add(buddhaGlowBack);

  // Vách gỗ chạm trổ & Rèm lụa gấm vàng rủ hai bên cung cấm (Cao 8.5m thông suốt trần)
  for (const rx of [-7.2, 7.2]) {
    const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 8.5, 12, 1, true, 0, Math.PI), matGold);
    drape.position.set(rx, 4.8, -0.5);
    altarGroup.add(drape);
  }

  hallBodyGroup.add(altarGroup);
  // 6.5. BÀN THỜ ÁN GIAN CHẠM RỒNG THẾP VÀNG & ĐỒ THỜ TỰ
  const altarTableGroup = new THREE.Group();
  altarTableGroup.position.set(0, 0, -4.2);

  const altarTable = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.35, 1.8), matAmberWood);
  altarTable.position.set(0, 0.675, 0);
  altarTableGroup.add(altarTable);

  const altarTrim = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.12, 1.9), matGold);
  altarTrim.position.set(0, 1.35, 0);
  altarTableGroup.add(altarTrim);

  // Chân nến đồng uy nghiêm & đèn dầu lưu ly
  for (const cx of [-3.8, 3.8]) {
    const cand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 0.9, 8), matGold);
    cand.position.set(cx, 1.8, 0);
    altarTableGroup.add(cand);

    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    flame.position.set(cx, 2.3, 0);
    altarTableGroup.add(flame);

    const cLight = new THREE.PointLight(0xf59e0b, 0.8, 6);
    cLight.position.set(cx, 2.3, 0.2);
    nightLightsRef.current.push(cLight);
    altarTableGroup.add(cLight);
  }

  // Đôi lộc bình gỗ chạm hoa sen hai bên bàn thờ
  for (const vx of [-4.5, 4.5]) {
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.16, 1.1, 12), matDarkTimber);
    vase.position.set(vx, 1.9, -0.2);
    altarTableGroup.add(vase);
  }

  // Chuông gia trì bằng đồng & Mõ gỗ hình cá hóa rồng
  const bellAltar = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.65), matGold);
  bellAltar.position.set(-2.2, 1.55, 0.35);
  altarTableGroup.add(bellAltar);

  const moAltar = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 10), matDarkTimber);
  moAltar.position.set(2.2, 1.55, 0.35);
  altarTableGroup.add(moAltar);

  hallBodyGroup.add(altarTableGroup);

  // 6.6. ĐẠI ĐỈNH HƯƠNG ĐỒNG 3 CHÂN (BRONZE CAULDRON CENSER) TỌA LẠC CHÍNH ĐIỆN & KHÓI TRẦM
  const incenseSmoke: THREE.Mesh[] = [];
  const censerGroup = new THREE.Group();
  censerGroup.position.set(0, 0, 0.5);

  // Bệ đá granite vuông
  const censerStoneBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 1.8), matLotusPlinth);
  censerStoneBase.position.set(0, 0.11, 0);
  censerGroup.add(censerStoneBase);

  // 3 Chân đỉnh đồng chạm đầu rồng
  for (let l = 0; l < 3; l++) {
    const ang = (l / 3) * Math.PI * 2;
    const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.65, 8), matBronzeCauldron);
    legMesh.position.set(Math.cos(ang) * 0.55, 0.45, Math.sin(ang) * 0.55);
    censerGroup.add(legMesh);
  }

  // Thân bầu đỉnh đồng chạm rồng nổi
  const censerBody = new THREE.Mesh(new THREE.SphereGeometry(0.78, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.72), matBronzeCauldron);
  censerBody.position.set(0, 1.1, 0);
  censerGroup.add(censerBody);

  // Vành miệng đỉnh đồng & nắp chạm lộng kỳ lân
  const censerRim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 6, 20), matGold);
  censerRim.rotation.x = Math.PI / 2;
  censerRim.position.set(0, 1.35, 0);
  censerGroup.add(censerRim);

  // 2 Quai rồng uốn lượn hai bên đỉnh đồng
  for (const hx of [-0.85, 0.85]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 6, 14), matBronzeCauldron);
    handle.position.set(hx, 1.25, 0);
    censerGroup.add(handle);
  }

  // Bát nhang cắm đầy chân nhang đỏ và nhang trầm đang cháy
  const incenseBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.28, 14), matDarkTimber);
  incenseBowl.position.set(0, 1.35, 0);
  censerGroup.add(incenseBowl);

  const matIncenseAsh = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.95 });
  const ashSurface = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.04, 14), matIncenseAsh);
  ashSurface.position.set(0, 1.48, 0);
  censerGroup.add(ashSurface);

  // Que nhang trầm đỏ cắm trên bát nhang
  for (let st = 0; st < 9; st++) {
    const sAng = (st / 9) * Math.PI * 2;
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 4), matLanternRed);
    stick.position.set(Math.cos(sAng) * 0.22, 1.62, Math.sin(sAng) * 0.22);
    censerGroup.add(stick);

    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.014, 4, 4), new THREE.MeshBasicMaterial({ color: 0xf97316 }));
    ember.position.set(Math.cos(sAng) * 0.22, 1.81, Math.sin(sAng) * 0.22);
    censerGroup.add(ember);
  }

  // Hạt khói trầm hương bốc lên nghi ngút mờ ảo
  const matSmokeParticle = new THREE.MeshBasicMaterial({
    color: 0xe2e8f0,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  for (let sk = 0; sk < 14; sk++) {
    const smokeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), matSmokeParticle);
    smokeMesh.position.set(
      (Math.random() - 0.5) * 0.28,
      1.6 + (sk / 14) * 3.6,
      (Math.random() - 0.5) * 0.28
    );
    smokeMesh.scale.set(1 + sk * 0.2, 1 + sk * 0.2, 1 + sk * 0.2);
    censerGroup.add(smokeMesh);
    incenseSmoke.push(smokeMesh);
  }

  hallBodyGroup.add(censerGroup);

  // 6.7. HAI BÀN THẤP "KHU VỰC THẮP NHANG" ĐỐI XỨNG HAI BÊN
  for (const bx of [-4.4, 4.4]) {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(bx, 0, 0.5);

    // Bàn thấp gỗ hương kiểu truyền thống
    const tTop = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 0.95), matIncenseTable);
    tTop.position.set(0, 0.65, 0);
    tableGroup.add(tTop);

    for (const lx of [-1.2, 1.2]) {
      for (const lz of [-0.35, 0.35]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.65, 8), matIncenseTable);
        leg.position.set(lx, 0.325, lz);
        tableGroup.add(leg);
      }
    }

    // Biển gỗ đứng "敬香區 / KHU VỰC THẮP NHANG" có thư pháp chữ Hán và phụ đề
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.34, 0.04), matLanternRed);
    signBoard.position.set(0, 0.85, 0);
    tableGroup.add(signBoard);

    const matIncenseSign = new THREE.MeshStandardMaterial({
      map: createIncenseSignTexture(),
      roughness: 0.35,
    });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.30), matIncenseSign);
    signMesh.position.set(0, 0.85, 0.025);
    tableGroup.add(signMesh);

    // Ống cắm thẻ hương trầm bằng tre
    const incenseCanister = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 10), matDarkTimber);
    incenseCanister.position.set(0.85, 0.85, 0);
    tableGroup.add(incenseCanister);

    // Khay gỗ cúng dường
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.42), matAmberWood);
    tray.position.set(-0.75, 0.70, 0);
    tableGroup.add(tray);

    hallBodyGroup.add(tableGroup);
  }

  // 6.8. 12 BỒ ĐOÀN THIỀN TỌA XẾP NGĂN NẮP HAI BÊN ĐỂ NHÂN VẬT TỌA THIỀN NGHE KINH
  const cushionCols = [-4.6, -2.5, 2.5, 4.6];
  const cushionRows = [2.6, 4.6, 6.6];

  cushionCols.forEach((colX) => {
    cushionRows.forEach((rowZ) => {
      const cGroup = new THREE.Group();
      cGroup.position.set(colX, 0, rowZ);

      // Đệm bồ đoàn nỉ nhung đỏ viền vàng hoàng gia
      const cushionMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.52, 0.16, 16), matCushionRed);
      cushionMesh.position.set(0, 0.08, 0);
      cGroup.add(cushionMesh);

      // Viền chỉ vàng hoàng gia quanh bồ đoàn
      const cRim = new THREE.Mesh(new THREE.TorusGeometry(0.51, 0.02, 6, 20), matGold);
      cRim.rotation.x = Math.PI / 2;
      cRim.position.set(0, 0.08, 0);
      cGroup.add(cRim);

      // Đóa sen vàng thêu trên mặt bồ đoàn
      const cLotus = new THREE.Mesh(new THREE.CircleGeometry(0.18, 8), matGold);
      cLotus.rotation.x = -Math.PI / 2;
      cLotus.position.set(0, 0.165, 0);
      cGroup.add(cLotus);

      hallBodyGroup.add(cGroup);
    });
  });

  // 6.9. NPC HÒA THƯỢNG TRỤ TRÌ THUYẾT PHÁP (ÁO CÀ SA ĐỎ, RÂU BẠC DÀI, CHÂN MÀY DÀI)
  const abbotGroup = new THREE.Group();
  abbotGroup.position.set(2.4, 0.12, -2.8);
  abbotGroup.rotation.y = -Math.PI * 0.65; // Hướng về đại chúng và hàng bồ đoàn thiền tọa

  // TÒA THUYẾT PHÁP HÒA THƯỢNG TRỤ TRÌ (MỞ RỘNG TO HƠN 40% THEO YÊU CẦU)
  // 1. Thảm gấm hoa sen đỏ hoàng gia bát giác ở đáy tòa
  const carpetBase = new THREE.Mesh(new THREE.CylinderGeometry(1.50, 1.55, 0.04, 8), matCushionRed);
  carpetBase.position.set(0, 0.02, 0);
  carpetBase.receiveShadow = true;
  abbotGroup.add(carpetBase);

  const carpetTrim = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.57, 0.02, 8), matGold);
  carpetTrim.position.set(0, 0.04, 0);
  abbotGroup.add(carpetTrim);

  // 2. Bệ gỗ lim tòa sen thuyết pháp (Rộng hơn 40%: R=1.20m -> 1.35m, Cao 0.28m)
  const abbotPlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.20, 1.35, 0.28, 16), matDarkTimber);
  abbotPlinth.position.set(0, 0.18, 0);
  abbotPlinth.receiveShadow = true;
  abbotGroup.add(abbotPlinth);

  // Gờ nẹp chỉ đồng mạ vàng viền quanh bệ gỗ lim
  const plinthTrim = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.37, 0.04, 16), matGold);
  plinthTrim.position.set(0, 0.31, 0);
  abbotGroup.add(plinthTrim);

  // 3. 16 Cánh sen mạ vàng 3D nở rộ bao quanh bệ thuyết pháp (tăng 40%)
  for (let ap = 0; ap < 16; ap++) {
    const aAng = (ap / 16) * Math.PI * 2;
    const aPetal = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.40, 6), matGold);
    aPetal.rotation.x = Math.PI / 2 + 0.24;
    aPetal.rotation.z = aAng;
    aPetal.position.set(Math.cos(aAng) * 1.25, 0.26, Math.sin(aAng) * 1.25);
    abbotGroup.add(aPetal);
  }

  // 4. Bồ đoàn thượng tọa nỉ nhung đỏ viền vàng hoàng gia (To hơn 40%: R=1.02m -> 1.08m, Dày 0.20m)
  const abbotCushion = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.08, 0.20, 20), matCushionRed);
  abbotCushion.position.set(0, 0.42, 0);
  abbotCushion.receiveShadow = true;
  abbotGroup.add(abbotCushion);

  // Viền chỉ vàng hoàng gia quanh bồ đoàn
  const cRim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.028, 6, 24), matGold);
  cRim.rotation.x = Math.PI / 2;
  cRim.position.set(0, 0.42, 0);
  abbotGroup.add(cRim);

  // Đóa sen vàng thêu tinh xảo trên mặt bồ đoàn thượng tọa
  const cLotus = new THREE.Mesh(new THREE.CircleGeometry(0.36, 12), matGold);
  cLotus.rotation.x = -Math.PI / 2;
  cLotus.position.set(0, 0.525, 0);
  abbotGroup.add(cLotus);

  // 5. Kỷ gỗ lim để kinh sách và chuông gia trì bên cạnh chỗ thiền
  const sutraDesk = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.28), matDarkTimber);
  sutraDesk.position.set(0.96, 0.38, 0.45);
  sutraDesk.rotation.y = -0.35;
  abbotGroup.add(sutraDesk);

  const sutraBook = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.16), matGold);
  sutraBook.position.set(0.96, 0.58, 0.45);
  sutraBook.rotation.y = -0.35;
  abbotGroup.add(sutraBook);

  const prayerBell = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.08, 8), matGold);
  prayerBell.position.set(0.96, 0.63, 0.35);
  abbotGroup.add(prayerBell);

  // 6. Đôi chân tọa thiền kiết già an nhiên của Hòa Thượng (Mở rộng cân xứng vững vàng trên bồ đoàn lớn)
  const matInnerRobe = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 }); // Áo tràng vàng nghệ
  const matKasayaRed = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.75 }); // Áo cà sa đỏ son phước điền
  const matKasayaTrim = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.65 }); // Chỉ vàng viền ô cà sa

  const crossedLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.80, 0.28, 14), matInnerRobe);
  crossedLegs.position.set(0, 0.58, 0.08);
  abbotGroup.add(crossedLegs);

  // Thân trên Hòa Thượng Trụ Trì (Torso)
  const abbotTorsoGroup = new THREE.Group();
  abbotTorsoGroup.position.set(0, 0.68, 0);

  // Thân áo tràng bên trong
  const aBody = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.38), matInnerRobe);
  aBody.position.set(0, 0.31, 0);
  aBody.castShadow = true;
  abbotTorsoGroup.add(aBody);

  // ÁO CÀ SA ĐỎ PHƯỚC ĐIỀN KHOÁC NGOÀI CHOÀNG QUA VAI TRÁI
  const kasayaCape = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.66, 0.40), matKasayaRed);
  kasayaCape.position.set(-0.02, 0.31, 0.01);
  abbotTorsoGroup.add(kasayaCape);

  // Các dải viền chỉ vàng chia ô ruộng phước điền trên áo cà sa đỏ
  for (let r = 0; r < 3; r++) {
    const hStripe = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.025, 0.39), matKasayaTrim);
    hStripe.position.set(-0.02, 0.16 + r * 0.16, 0.01);
    abbotTorsoGroup.add(hStripe);
  }
  for (let c = -1; c <= 1; c++) {
    const vStripe = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.63, 0.39), matKasayaTrim);
    vStripe.position.set(-0.02 + c * 0.16, 0.29, 0.01);
    abbotTorsoGroup.add(vStripe);
  }

  // Khuy móc ngọc bích cài áo cà sa trên vai trái
  const jadeHook = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.018, 6, 12), new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3 }));
  jadeHook.position.set(-0.16, 0.54, 0.18);
  abbotTorsoGroup.add(jadeHook);

  // Hai cánh tay Hòa Thượng Trụ Trì
  const armR = new THREE.Group();
  armR.position.set(0.30, 0.46, 0);

  const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.38, 10), matInnerRobe);
  rSleeve.rotation.z = -Math.PI / 3;
  rSleeve.position.set(0.14, -0.08, 0.12);
  armR.add(rSleeve);

  const matSkin = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.5 });
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), matSkin);
  rHand.position.set(0.28, -0.15, 0.24);
  armR.add(rHand);

  // Chuỗi tràng hạt bồ đề 108 hạt cầm trên tay phải
  const beadsGroup = new THREE.Group();
  beadsGroup.position.set(0.28, -0.22, 0.26);
  for (let i = 0; i < 16; i++) {
    const bAngle = (i / 16) * Math.PI * 2;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), matDarkTimber);
    bead.position.set(Math.cos(bAngle) * 0.14, Math.sin(bAngle) * 0.18, (i % 2) * 0.01);
    beadsGroup.add(bead);
  }
  armR.add(beadsGroup);
  abbotTorsoGroup.add(armR);

  // Tay trái thủ ấn Vô Úy an lành / đặt trên đùi
  const armL = new THREE.Group();
  armL.position.set(-0.30, 0.46, 0);

  const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.38, 10), matKasayaRed);
  lSleeve.rotation.z = Math.PI / 3;
  lSleeve.position.set(-0.14, -0.08, 0.12);
  armL.add(lSleeve);

  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), matSkin);
  lHand.position.set(-0.24, -0.12, 0.22);
  armL.add(lHand);
  abbotTorsoGroup.add(armL);

  // Đầu Hòa Thượng Trụ Trì (Head)
  const abbotHeadGroup = new THREE.Group();
  abbotHeadGroup.position.set(0, 0.62, 0);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 20), new THREE.MeshStandardMaterial({
    map: createAbbotFaceTexture(),
    roughness: 0.55,
  }));
  headMesh.rotation.y = -Math.PI / 2;
  headMesh.castShadow = true;
  abbotHeadGroup.add(headMesh);

  // RÂU DÀI BẠC TRẮNG 3D PHÚC HẬU RỦ TỪ CẰM XUỐNG NGỰC
  const matWhiteHair = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });

  const beardMain = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 12), matWhiteHair);
  beardMain.rotation.x = Math.PI - 0.22; // Hướng xuống ngực uốn nhẹ ra phía trước
  beardMain.position.set(0, -0.16, 0.25);
  abbotHeadGroup.add(beardMain);

  for (const bx of [-0.07, 0.07]) {
    const beardFlank = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.28, 8), matWhiteHair);
    beardFlank.rotation.x = Math.PI - 0.18;
    beardFlank.rotation.z = bx > 0 ? -0.12 : 0.12;
    beardFlank.position.set(bx, -0.12, 0.24);
    abbotHeadGroup.add(beardFlank);
  }

  // ĐÔI CHÂN MÀY DÀI BẠC TRẮNG 3D VƯƠN CONG QUA KHÓE MẮT
  for (const mx of [-0.14, 0.14]) {
    const eyebrow = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.008, 0.22, 8), matWhiteHair);
    eyebrow.rotation.z = mx > 0 ? -Math.PI / 3.5 : Math.PI / 3.5;
    eyebrow.rotation.x = 0.25;
    eyebrow.position.set(mx * 1.35, 0.04, 0.28);
    abbotHeadGroup.add(eyebrow);
  }

  // VẦNG HÀO QUANG TRÍ TUỆ (WISDOM MANDALA HALO) SAU ĐẦU SƯ PHỤ
  const abbotHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.38, 0.65, 32),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
  );
  abbotHalo.position.set(0, 0.08, -0.32);
  abbotHeadGroup.add(abbotHalo);

  const abbotHaloLight = new THREE.PointLight(0xfef08a, 1.2, 8);
  abbotHaloLight.position.set(0, 0.1, 0.5);
  nightLightsRef.current.push(abbotHaloLight);
  abbotHeadGroup.add(abbotHaloLight);

  abbotTorsoGroup.add(abbotHeadGroup);
  abbotGroup.add(abbotTorsoGroup);
  hallBodyGroup.add(abbotGroup);

  // 2nd Floor Balcony (Gác chuông lầu thượng bên trong)
  const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.45, 8.5), matDarkTimber);
  balconyFloor.position.set(0, 7.2, 6.5);
  hallBodyGroup.add(balconyFloor);

  const balconyRailing = new THREE.Mesh(new THREE.BoxGeometry(30, 1.0, 0.25), matAmberWood);
  balconyRailing.position.set(0, 8.1, 10.5);
  hallBodyGroup.add(balconyRailing);

  // Đèn lồng đỏ lụa treo hiên Chánh Điện
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

  return {
    group: mainHall,
    abbotNpc: {
      group: abbotGroup,
      torso: abbotTorsoGroup,
      head: abbotHeadGroup,
      armR,
      armL,
      halo: abbotHalo,
      beads: beadsGroup,
    },
    incenseSmoke,
  };
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

/** Vẽ khuôn mặt Hòa Thượng Trụ Trì Chibi Anime đạo mạo: râu dài bạc trắng, chân mày dài, 3 nốt giới hương */
function createAbbotFaceTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Nền da hồng hào phúc hậu
  ctx.fillStyle = '#ffedd5';
  ctx.fillRect(0, 0, W, H);

  // 3 Chấm Giới Hương trên trán (Đạo hạnh cao thâm)
  ctx.fillStyle = '#b45309';
  [95, 115, 135].forEach((y) => {
    ctx.beginPath();
    ctx.arc(256, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Đôi chân mày dài bạc trắng phúc hậu rủ mềm mại qua thái dương
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(150, 240);
  ctx.quadraticCurveTo(185, 175, 235, 195);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(362, 240);
  ctx.quadraticCurveTo(327, 175, 277, 195);
  ctx.stroke();

  // Đôi mắt khép hờ an nhiên thiền định (nụ cười từ bi)
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(205, 255, 28, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(307, 255, 28, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  // Khóe mắt nụ cười hoan hỷ
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(165, 260);
  ctx.lineTo(150, 255);
  ctx.moveTo(165, 266);
  ctx.lineTo(152, 268);
  ctx.moveTo(347, 260);
  ctx.lineTo(362, 255);
  ctx.moveTo(347, 266);
  ctx.lineTo(360, 268);
  ctx.stroke();

  // Má hồng ấm áp
  const drawBlush = (bx: number) => {
    const blushGrad = ctx.createRadialGradient(bx, 305, 2, bx, 305, 34);
    blushGrad.addColorStop(0, 'rgba(251, 113, 133, 0.45)');
    blushGrad.addColorStop(0.65, 'rgba(251, 113, 133, 0.2)');
    blushGrad.addColorStop(1, 'rgba(251, 113, 133, 0)');
    ctx.fillStyle = blushGrad;
    ctx.beginPath();
    ctx.arc(bx, 305, 34, 0, Math.PI * 2);
    ctx.fill();
  };
  drawBlush(180);
  drawBlush(332);

  // Nụ cười từ bi của bậc cao tăng
  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(256, 320, 22, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Râu mép uốn lượn trắng muốt
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(250, 335);
  ctx.quadraticCurveTo(205, 350, 180, 385);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(262, 335);
  ctx.quadraticCurveTo(307, 350, 332, 385);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Vẽ khuôn mặt Chú Tiểu Tuệ Tĩnh Chibi Anime thanh tú với 3 nốt giới hương thiền môn */
function createTueTinhFaceTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Nền da mịn màng hồng hào Chibi
  ctx.fillStyle = '#ffedd5';
  ctx.fillRect(0, 0, W, H);

  // 3 Chấm Giới Hương (Giới Điệp Thiền Môn) trên trán
  ctx.fillStyle = '#d97706';
  [100, 118, 136].forEach((y) => {
    ctx.beginPath();
    ctx.arc(256, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Đôi mày thanh tú hiền hòa
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(170, 205);
  ctx.quadraticCurveTo(205, 192, 235, 208);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(277, 208);
  ctx.quadraticCurveTo(307, 192, 342, 205);
  ctx.stroke();

  // Đôi mắt Chibi to tròn ấm áp
  const drawEye = (cx: number) => {
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, 260, 36, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    const irisGrad = ctx.createRadialGradient(cx, 258, 4, cx, 260, 28);
    irisGrad.addColorStop(0, '#78350f');
    irisGrad.addColorStop(0.65, '#451a03');
    irisGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 262, 26, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, 262, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 9, 250, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx + 8, 272, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  drawEye(205);
  drawEye(307);

  // Má hồng Chibi e ấp
  const drawBlush = (bx: number) => {
    const blushGrad = ctx.createRadialGradient(bx, 310, 2, bx, 310, 32);
    blushGrad.addColorStop(0, 'rgba(251, 113, 133, 0.45)');
    blushGrad.addColorStop(0.6, 'rgba(251, 113, 133, 0.22)');
    blushGrad.addColorStop(1, 'rgba(251, 113, 133, 0)');
    ctx.fillStyle = blushGrad;
    ctx.beginPath();
    ctx.arc(bx, 310, 32, 0, Math.PI * 2);
    ctx.fill();
  };
  drawBlush(170);
  drawBlush(342);

  // Nụ cười mỉm an nhiên
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 318, 16, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/**
 * Tháp Chuông Chùa Cổ Tự 2 Tầng 8 Mái Chồng Diêm theo bản vẽ kiến trúc phát thảo
 */
function createAuthenticBellTower(
  matStoneGrey: THREE.Material,
  matLotusPlinth: THREE.Material,
  matWoodLim: THREE.Material,
  matDarkTimber: THREE.Material,
  matAmberWood: THREE.Material,
  matJadeRoofTile: THREE.Material,
  matBronze: THREE.Material,
  matGold: THREE.Material,
  nightLightsRef: React.MutableRefObject<THREE.PointLight[]>
): {
  group: THREE.Group;
  bellMesh: THREE.Mesh;
  chayGo: THREE.Group;
  npcMonk: {
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
  };
  soundRipplesGroup: THREE.Group;
  impactFlash: THREE.Mesh;
  roofs: THREE.Group[];
} {
  const bellTower = new THREE.Group();
  const roofs: THREE.Group[] = [];

  // 1. BỆ ĐÁ TAM CẤP (THREE-TIER CARVED STONE PEDESTAL)
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.35, 11.4), matStoneGrey);
  base1.position.set(0, 0.175, 0);
  base1.receiveShadow = true;
  bellTower.add(base1);

  const base2 = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.30, 10.6), matStoneGrey);
  base2.position.set(0, 0.48, 0);
  base2.receiveShadow = true;
  bellTower.add(base2);

  const base3 = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.28, 9.8), matStoneGrey);
  base3.position.set(0, 0.75, 0);
  base3.receiveShadow = true;
  bellTower.add(base3);

  const stoneTrim = new THREE.Mesh(new THREE.BoxGeometry(9.9, 0.04, 9.9), matLotusPlinth);
  stoneTrim.position.set(0, 0.89, 0);
  stoneTrim.receiveShadow = true;
  bellTower.add(stoneTrim);

  // Bậc tam cấp đá mặt trước
  for (let s = 0; s < 5; s++) {
    const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.16, 0.38), matStoneGrey);
    stepMesh.position.set(0, 0.16 + s * 0.15, 5.0 + (4 - s) * 0.34);
    stepMesh.receiveShadow = true;
    bellTower.add(stepMesh);
  }

  // Hai bên lan can bậc đá chạm mây
  for (const sx of [-2.05, 2.05]) {
    const rampGroup = new THREE.Group();
    rampGroup.position.set(sx, 0, 5.6);
    for (let r = 0; r < 5; r++) {
      const rBlock = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.38), matLotusPlinth);
      rBlock.position.set(0, 0.28 + r * 0.15, (2 - r) * 0.34);
      rampGroup.add(rBlock);
    }
    const cloudScroll = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.08, 6, 12, Math.PI * 1.2), matLotusPlinth);
    cloudScroll.position.set(0, 0.26, 1.2);
    cloudScroll.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    rampGroup.add(cloudScroll);
    bellTower.add(rampGroup);
  }

  // 2. LAN CAN ĐÁ TỨ DIỆN
  const railingGroup = new THREE.Group();
  const railH = 0.82;
  const railY = 0.89 + railH / 2;

  const railNorth = new THREE.Mesh(new THREE.BoxGeometry(9.4, railH, 0.22), matStoneGrey);
  railNorth.position.set(0, railY, -4.7);
  railingGroup.add(railNorth);

  const railWest = new THREE.Mesh(new THREE.BoxGeometry(0.22, railH, 9.4), matStoneGrey);
  railWest.position.set(-4.7, railY, 0);
  railingGroup.add(railWest);

  const railEast = new THREE.Mesh(new THREE.BoxGeometry(0.22, railH, 9.4), matStoneGrey);
  railEast.position.set(4.7, railY, 0);
  railingGroup.add(railEast);

  const railSouthL = new THREE.Mesh(new THREE.BoxGeometry(2.6, railH, 0.22), matStoneGrey);
  railSouthL.position.set(-3.4, railY, 4.7);
  railingGroup.add(railSouthL);

  const railSouthR = new THREE.Mesh(new THREE.BoxGeometry(2.6, railH, 0.22), matStoneGrey);
  railSouthR.position.set(3.4, railY, 4.7);
  railingGroup.add(railSouthR);

  const postCoords = [
    [-4.7, -4.7], [0, -4.7], [4.7, -4.7],
    [-4.7, 0], [4.7, 0],
    [-4.7, 4.7], [-2.1, 4.7], [2.1, 4.7], [4.7, 4.7]
  ];
  postCoords.forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, railH + 0.15, 0.32), matLotusPlinth);
    post.position.set(px, railY + 0.08, pz);
    railingGroup.add(post);

    const bud = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 6), matLotusPlinth);
    bud.position.set(px, railY + 0.65, pz);
    railingGroup.add(bud);
  });
  bellTower.add(railingGroup);

  // 3. 4 CỘT CÁI GỖ LIM & CHÂN TẢNG ĐÁ HOA SEN
  const colCoords = [
    [-2.6, -2.6],
    [-2.6, 2.6],
    [2.6, -2.6],
    [2.6, 2.6],
  ];
  const colH = 4.4;
  const colY = 1.15 + colH / 2;

  colCoords.forEach(([cx, cz]) => {
    const plinthBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.22, 16), matLotusPlinth);
    plinthBase.position.set(cx, 1.0, cz);
    plinthBase.receiveShadow = true;
    bellTower.add(plinthBase);

    for (let p = 0; p < 8; p++) {
      const angle = (p * Math.PI) / 4;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.18, 5), matLotusPlinth);
      petal.rotation.x = Math.PI / 2;
      petal.rotation.z = angle;
      petal.position.set(cx + Math.cos(angle) * 0.52, 1.05, cz + Math.sin(angle) * 0.52);
      bellTower.add(petal);
    }

    const colMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.46, colH, 16), matWoodLim);
    colMesh.position.set(cx, colY, cz);
    colMesh.castShadow = true;
    colMesh.receiveShadow = true;
    bellTower.add(colMesh);

    const corbel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.65), matDarkTimber);
    corbel.position.set(cx, colY + colH / 2 - 0.15, cz);
    bellTower.add(corbel);
  });

  // 4. HỆ XÀ GỖ KẾT NỐI (TIE-BEAMS & BRACKET CORBELS)
  const beamLowFB = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.20, 0.28), matDarkTimber);
  beamLowFB.position.set(0, 3.65, -2.6);
  bellTower.add(beamLowFB);
  const beamLowFB2 = beamLowFB.clone();
  beamLowFB2.position.set(0, 3.65, 2.6);
  bellTower.add(beamLowFB2);

  const beamLowLR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.20, 5.4), matDarkTimber);
  beamLowLR.position.set(-2.6, 3.65, 0);
  bellTower.add(beamLowLR);
  const beamLowLR2 = beamLowLR.clone();
  beamLowLR2.position.set(2.6, 3.65, 0);
  bellTower.add(beamLowLR2);

  const beamUpFB = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.28, 0.34), matDarkTimber);
  beamUpFB.position.set(0, 5.45, -2.6);
  bellTower.add(beamUpFB);
  const beamUpFB2 = beamUpFB.clone();
  beamUpFB2.position.set(0, 5.45, 2.6);
  bellTower.add(beamUpFB2);

  const beamUpLR = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 5.6), matDarkTimber);
  beamUpLR.position.set(-2.6, 5.45, 0);
  bellTower.add(beamUpLR);
  const beamUpLR2 = beamUpLR.clone();
  beamUpLR2.position.set(2.6, 5.45, 0);
  bellTower.add(beamUpLR2);

  const centerBellBeam = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.42, 0.45), matDarkTimber);
  centerBellBeam.position.set(0, 5.35, 0);
  bellTower.add(centerBellBeam);

  // 5. TẦNG MÁI HẠ (4 ĐẦU ĐAO CONG VÚT)
  const lowerRoof = createJadeCurvedRoof(11.6, 11.6, 2.3, matJadeRoofTile, matGold);
  lowerRoof.position.set(0, 5.5, 0);
  roofs.push(lowerRoof);
  bellTower.add(lowerRoof);

  // 6. CỔ BỒNG THƯỢNG (CLERESTORY WITH BALUSTERS)
  const clerestoryGroup = new THREE.Group();
  clerestoryGroup.position.set(0, 6.2, 0);

  for (const [cx, cz] of [[-2.1, -2.1], [-2.1, 2.1], [2.1, -2.1], [2.1, 2.1]]) {
    const col2 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 1.4, 12), matDarkTimber);
    col2.position.set(cx, 0.7, cz);
    clerestoryGroup.add(col2);
  }

  const clFloor = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.16, 5.4), matDarkTimber);
  clFloor.position.set(0, 0.08, 0);
  clerestoryGroup.add(clFloor);

  const clCeil = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.18, 5.4), matDarkTimber);
  clCeil.position.set(0, 1.35, 0);
  clerestoryGroup.add(clCeil);

  for (let s = -5; s <= 5; s++) {
    const pos = s * 0.36;
    if (Math.abs(s) > 4) continue;
    const bN = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), matAmberWood);
    bN.position.set(pos, 0.7, -2.1);
    clerestoryGroup.add(bN);

    const bS = bN.clone();
    bS.position.set(pos, 0.7, 2.1);
    clerestoryGroup.add(bS);

    const bW = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), matAmberWood);
    bW.position.set(-2.1, 0.7, pos);
    clerestoryGroup.add(bW);

    const bE = bW.clone();
    bE.position.set(2.1, 0.7, pos);
    clerestoryGroup.add(bE);
  }

  const bellLight = new THREE.PointLight(0xfef08a, 1.4, 16);
  bellLight.position.set(0, 0.7, 0);
  nightLightsRef.current.push(bellLight);
  clerestoryGroup.add(bellLight);
  bellTower.add(clerestoryGroup);

  // 7. TẦNG MÁI THƯỢNG & ĐỈNH THÁP BÚP SEN
  const upperRoof = createJadeCurvedRoof(8.6, 8.6, 2.2, matJadeRoofTile, matGold);
  upperRoof.position.set(0, 7.6, 0);
  roofs.push(upperRoof);
  bellTower.add(upperRoof);

  const spireGroup = new THREE.Group();
  spireGroup.position.set(0, 9.8, 0);

  const spirePlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.1, 0.32, 12), matLotusPlinth);
  spireGroup.add(spirePlinth);

  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75 - r * 0.16, 0.08, 6, 16), matGold);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.28 + r * 0.24, 0);
    spireGroup.add(ring);
  }

  const gourdBase = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), matGold);
  gourdBase.position.set(0, 1.15, 0);
  spireGroup.add(gourdBase);

  const gourdTop = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), matGold);
  gourdTop.position.set(0, 1.7, 0);
  spireGroup.add(gourdTop);

  const spireApex = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 8), matGold);
  spireApex.position.set(0, 2.15, 0);
  spireGroup.add(spireApex);
  bellTower.add(spireGroup);

  // 8. ĐẠI HỒNG CHUNG BẰNG ĐỒNG (TREO BẰNG DÂY XÍCH TỪ XÀ THƯỢNG)
  const bellGroup = new THREE.Group();
  bellGroup.position.set(0, 3.85, 0);

  const dragonArch = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.12, 8, 16, Math.PI), matBronze);
  dragonArch.position.set(0, 0.38, 0);
  bellGroup.add(dragonArch);

  // Xích sắt dài nối từ quai rồng lên xà cái trung tâm (y = 5.35)
  for (let cl = 0; cl < 4; cl++) {
    const chainLink = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 12), matDarkTimber);
    chainLink.position.set(0, 0.62 + cl * 0.24, 0);
    if (cl % 2 === 1) chainLink.rotation.y = Math.PI / 2;
    bellGroup.add(chainLink);
  }

  const bellDome = new THREE.Mesh(new THREE.SphereGeometry(0.92, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), matBronze);
  bellDome.position.set(0, 0, 0);
  bellDome.castShadow = true;
  bellGroup.add(bellDome);

  const bellUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.28, 1.25, 24), matBronze);
  bellUpper.position.set(0, -0.625, 0);
  bellUpper.castShadow = true;
  bellGroup.add(bellUpper);

  const bellLower = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.68, 1.15, 24), matBronze);
  bellLower.position.set(0, -1.825, 0);
  bellLower.castShadow = true;
  bellGroup.add(bellLower);

  const bellSkirt = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.95, 0.35, 24), matBronze);
  bellSkirt.position.set(0, -2.575, 0);
  bellSkirt.castShadow = true;
  bellGroup.add(bellSkirt);

  for (const ry of [-0.3, -1.25, -2.4]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.3 + Math.abs(ry) * 0.22, 0.04, 6, 24), matGold);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, ry, 0);
    bellGroup.add(rim);
  }

  for (let b = 0; b < 4; b++) {
    const bAngle = (b * Math.PI) / 2;
    const boss = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), matGold);
    boss.scale.set(1.4, 1.0, 1.0);
    boss.rotation.y = -bAngle;
    boss.position.set(Math.cos(bAngle) * 1.45, -1.55, Math.sin(bAngle) * 1.45);
    bellGroup.add(boss);

    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.06), matDarkTimber);
    plaque.position.set(Math.cos(bAngle + Math.PI / 4) * 1.18, -0.75, Math.sin(bAngle + Math.PI / 4) * 1.18);
    plaque.rotation.y = -(bAngle + Math.PI / 4) + Math.PI / 2;
    bellGroup.add(plaque);
  }
  bellTower.add(bellGroup);

  // 9. CHÀY GỖ TREO DÂY (SUSPENDED MALLET - VỪA TẦM VỚI CHÚ TIỂU)
  const chayPivot = new THREE.Group();
  chayPivot.position.set(2.35, 5.35, 0);

  // 2 dây treo dài 3.05m nối xuống độ cao y = 2.30m (ngang tầm ngực Chú Tiểu)
  const rope1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 3.05, 8), matDarkTimber);
  rope1.position.set(-0.65, -1.525, 0);
  chayPivot.add(rope1);

  const rope2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 3.05, 8), matDarkTimber);
  rope2.position.set(0.65, -1.525, 0);
  chayPivot.add(rope2);

  const chayLog = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.2, 16), matAmberWood);
  chayLog.rotation.z = Math.PI / 2;
  chayLog.position.set(0, -3.05, 0);
  chayLog.castShadow = true;
  chayPivot.add(chayLog);

  const chayHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), matAmberWood);
  chayHead.position.set(-1.05, -3.05, 0);
  chayPivot.add(chayHead);

  for (const dx of [-0.85, 0.85]) {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.035, 8, 16), matBronze);
    collar.rotation.y = Math.PI / 2;
    collar.position.set(dx, -3.05, 0);
    chayPivot.add(collar);
  }

  const gripRope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), matDarkTimber);
  gripRope.position.set(-0.15, -3.35, 0.25);
  chayPivot.add(gripRope);
  bellTower.add(chayPivot);

  // Điểm tóe sáng va chạm khi gõ chuông (Impact Spark Flash)
  const impactFlash = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0 })
  );
  impactFlash.position.set(1.35, 2.30, 0);
  bellTower.add(impactFlash);

  // 10. NPC CHÚ TIỂU TUỆ TĨNH THỈNH CHUÔNG (CHIBI BUDDHIST NOVICE MONK)
  // Đặt vững chãi trên sàn bệ đá thượng (y = 0.92, cao hơn mặt stoneTrim y = 0.91 để không bị chìm)
  const npcGroup = new THREE.Group();
  npcGroup.position.set(2.15, 0.92, 0.65);
  npcGroup.rotation.y = -2.45;

  const matPants = new THREE.MeshStandardMaterial({ color: 0x6d3917, roughness: 0.8 });
  const matShoe = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

  // Đôi chân Chú Tiểu đứng thẳng vững vàng trên sàn
  for (const lx of [-0.14, 0.14]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.44, 10), matPants);
    leg.position.set(lx, 0.22, 0);
    npcGroup.add(leg);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.24), matShoe);
    shoe.position.set(lx, 0.04, 0.04);
    npcGroup.add(shoe);
  }

  // Thân trên bắt đầu từ độ cao 0.46m (trên đùi và hông)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.46, 0);

  const matRobe = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
  const matRobeCollar = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });

  const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.48, 0.30), matRobe);
  bodyMesh.position.set(0, 0.24, 0);
  bodyMesh.castShadow = true;
  torsoGroup.add(bodyMesh);

  // Vạt áo tràng nâu sồng buông rủ ngang đùi, không chạm sàn
  const skirtMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.36, 12), matRobe);
  skirtMesh.position.set(0, 0.06, 0);
  torsoGroup.add(skirtMesh);

  const collarCross = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.30), matRobeCollar);
  collarCross.position.set(0.04, 0.43, 0.01);
  collarCross.rotation.z = -0.35;
  torsoGroup.add(collarCross);

  for (let i = 0; i < 16; i++) {
    const bAngle = (i / 16) * Math.PI * 2;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), matAmberWood);
    bead.position.set(Math.cos(bAngle) * 0.16, 0.38 + Math.sin(bAngle) * 0.06, Math.sin(bAngle) * 0.13 + 0.04);
    torsoGroup.add(bead);
  }

  const armR = new THREE.Group();
  armR.position.set(0.23, 0.40, 0);

  const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.30, 10), matRobe);
  rSleeve.rotation.z = -Math.PI / 3;
  rSleeve.position.set(0.13, -0.06, 0.08);
  armR.add(rSleeve);

  const matSkin = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.5 });
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), matSkin);
  rHand.position.set(0.26, -0.12, 0.18);
  armR.add(rHand);
  torsoGroup.add(armR);

  const armL = new THREE.Group();
  armL.position.set(-0.23, 0.40, 0);

  const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.28, 10), matRobe);
  lSleeve.rotation.z = Math.PI / 4;
  lSleeve.position.set(-0.11, -0.06, 0.08);
  armL.add(lSleeve);

  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), matSkin);
  lHand.position.set(-0.17, 0.04, 0.16);
  armL.add(lHand);
  torsoGroup.add(armL);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.54, 0);

  const headGeo = new THREE.SphereGeometry(0.27, 24, 20);
  const faceTex = createTueTinhFaceTexture();
  const matFace = new THREE.MeshStandardMaterial({
    map: faceTex,
    roughness: 0.5,
  });
  const headMesh = new THREE.Mesh(headGeo, matFace);
  headMesh.rotation.y = -Math.PI / 2;
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  for (const ex of [-0.27, 0.27]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), matSkin);
    ear.scale.set(0.5, 1.0, 0.7);
    ear.position.set(ex, 0, -0.02);
    headGroup.add(ear);
  }

  torsoGroup.add(headGroup);
  npcGroup.add(torsoGroup);
  bellTower.add(npcGroup);

  // 11. TRỐNG BÁT NHÃ CỔ TRUYỀN
  const drumGroup = new THREE.Group();
  drumGroup.position.set(-2.8, 1.65, -2.2);

  for (const dx of [-0.65, 0.65]) {
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 1.5, 8), matDarkTimber);
    leg1.rotation.z = dx > 0 ? 0.25 : -0.25;
    leg1.position.set(dx, -0.4, 0);
    drumGroup.add(leg1);
  }
  const drumCross = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.14), matDarkTimber);
  drumCross.position.set(0, -0.75, 0);
  drumGroup.add(drumCross);

  const drumBody = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.45, 18), matWoodLim);
  drumBody.rotateX(Math.PI / 2);
  drumBody.castShadow = true;
  drumGroup.add(drumBody);

  const matDrumHead = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.85 });
  for (const dz of [-0.73, 0.73]) {
    const dHead = new THREE.Mesh(new THREE.CircleGeometry(0.94, 18), matDrumHead);
    if (dz < 0) dHead.rotateY(Math.PI);
    dHead.position.set(0, 0, dz);
    drumGroup.add(dHead);

    const rimRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 6, 24), matBronze);
    rimRing.position.set(0, 0, dz);
    drumGroup.add(rimRing);
  }
  bellTower.add(drumGroup);

  // 12. CỤM SÓNG ÂM KIM QUANG (CONCENTRIC GOLDEN RIPPLES)
  const soundRipplesGroup = new THREE.Group();
  soundRipplesGroup.position.set(0, 2.30, 0);
  soundRipplesGroup.visible = false;

  for (let i = 0; i < 4; i++) {
    const ringGeo = new THREE.RingGeometry(1.6, 1.75, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotateX(Math.PI / 2);
    soundRipplesGroup.add(ring);
  }
  bellTower.add(soundRipplesGroup);

  return {
    group: bellTower,
    bellMesh: bellGroup as unknown as THREE.Mesh,
    chayGo: chayPivot,
    npcMonk: {
      group: npcGroup,
      torso: torsoGroup,
      head: headGroup,
      armR,
      armL,
    },
    soundRipplesGroup,
    impactFlash,
    roofs,
  };
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
