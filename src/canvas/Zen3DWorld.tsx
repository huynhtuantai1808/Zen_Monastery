import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { soundEngine } from '../services/audioEngine';
import type { CharacterAppearance } from '../types/game';
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
  Sparkles
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

// 14 STYLIZED ZONES IN THE ISOMETRIC FANTASY ZEN MONASTERY
export const TEMPLE_ZONES: TempleZoneInfo[] = [
  {
    id: 'gate',
    name: '1. Cổng Tam Quan',
    subtitle: 'Lối vào chùa • Cổng đá cổ kính & cờ Phật giáo',
    dimensions: '22 × 12 m',
    icon: '⛩️',
    desc: 'Cổng đá cách điệu với mái ngói đao cong, cờ ngũ sắc và đèn đá sân vườn.',
    pos: { x: 0, z: 66 },
    actionKey: 'GATE',
  },
  {
    id: 'courtyard',
    name: '2. Sân Chùa & Chính Điện',
    subtitle: 'Sân gạch nung ấm áp & Lư hương đồng tam bảo',
    dimensions: '52 × 38 m',
    icon: '🧹',
    desc: 'Khuôn viên sân gạch Bát Tràng ấm áp với lư hương đồng, chậu cây cảnh bonsai và đèn đá.',
    pos: { x: 0, z: 20 },
    actionKey: 'COURTYARD',
  },
  {
    id: 'tower',
    name: '3. Bảo Tháp Men Ngọc (3 Tầng)',
    subtitle: 'Bảo tháp ngói lưu ly xanh ngọc • Cửa vòm & Đỉnh búp sen vàng',
    dimensions: '18 × 18 m',
    icon: '🏯',
    desc: 'Bảo tháp kiến trúc truyền thống theo bản vẽ: 3 tầng mái cong ngói men ngọc, thân gỗ ấm, cửa vòm nguyệt môn, đài sen tam cấp và đỉnh búp sen hoàng kim.',
    pos: { x: 38, z: -20 },
    actionKey: 'TOWER',
  },
  {
    id: 'bell',
    name: '4. Lầu Chuông (Nội thất)',
    subtitle: 'Đại Hồng Chung bằng đồng & Trống Bát Nhã',
    dimensions: '14 × 14 m',
    icon: '🔔',
    desc: 'Lầu chuông gỗ lim cổ kính với Đại Hồng Chung treo quai rồng và chày kình gõ chuông.',
    pos: { x: -26, y: 1.2, z: -20 },
    actionKey: 'BELL',
  },
  {
    id: 'pond',
    name: '5. Hồ Sen & Vườn Thiền',
    subtitle: 'Mặt hồ lam biếc, cá Koi vàng & Thủy Đình bát giác',
    dimensions: '28 × 22 m',
    icon: '🪷',
    desc: 'Hồ sen ngát hương soi bóng Thủy Đình, cầu đá uốn cong và đàn cá Koi lượn sóng.',
    pos: { x: -26, z: 36 },
    actionKey: 'POND',
  },
  {
    id: 'corridor',
    name: '6. Hành Lang Cột Gỗ',
    subtitle: 'Dãy hành lang dài nối các khu • Đèn lồng đỏ',
    dimensions: '36 × 6 m',
    icon: '🏮',
    desc: 'Dãy hành lang cột gỗ lim song song với vì kèo chạm trổ và hàng đèn lồng đỏ ấm áp.',
    pos: { x: 18, z: 12 },
    actionKey: 'CORRIDOR',
  },
  {
    id: 'sanctuary',
    name: '7. Phòng Thờ Chính Điện',
    subtitle: 'Đại Hùng Bảo Điện • Kim Thân Phật Thích Ca dát vàng',
    dimensions: '32 × 26 m',
    icon: '🏛️',
    desc: 'Nội điện trang nghiêm rực rỡ với tượng Phật trên tòa sen tam cấp và hoành phi câu đối.',
    pos: { x: 0, z: -16 },
    actionKey: 'SANCTUARY',
  },
  {
    id: 'meditation',
    name: '8. Phòng Thiền (Tịnh tu)',
    subtitle: 'Cửa sổ tròn Nguyệt Môn & chiếu tatami bồ đoàn',
    dimensions: '16 × 14 m',
    icon: '🧘',
    desc: 'Không gian tĩnh mịch với cửa sổ tròn nan gỗ nhìn ra rừng trúc, bồ đoàn tĩnh tọa an nhiên.',
    pos: { x: -24, z: 6 },
    actionKey: 'MEDITATION',
  },
  {
    id: 'library',
    name: '9. Phòng Kinh Sách (Lưu trữ)',
    subtitle: 'Tàng Kinh Các • Kệ sách cổ & bàn trà thư pháp',
    dimensions: '18 × 15 m',
    icon: '📜',
    desc: 'Tàng Kinh Các lưu giữ kinh điển, giá sách chạm trần, nghiên mực và ấm trà gốm mộc mạc.',
    pos: { x: 24, z: 6 },
    actionKey: 'LIBRARY',
  },
  {
    id: 'back_garden',
    name: '10. Sân Sau (Phụ trợ)',
    subtitle: 'Hậu viện tĩnh mịch • Giếng ngọc, bếp củi & lu gốm',
    dimensions: '36 × 30 m',
    icon: '🎋',
    desc: 'Lối đá rêu phong dẫn vào sân sau với bếp củi, giếng nước ngọc đá ong và rặng trúc xanh.',
    pos: { x: 0, z: -50 },
    actionKey: 'BACK_GARDEN',
  },
  {
    id: 'balcony',
    name: '11. Lầu Gác (View toàn cảnh)',
    subtitle: 'Lầu cao lan can chạm chữ Vạn • Ngắm cảnh non nước',
    dimensions: '28 × 8 m',
    icon: '🪟',
    desc: 'Lầu cao lộng gió nhìn ra toàn cảnh sân chùa, tháp chuông và mây núi bảng lảng.',
    pos: { x: 0, y: 7.2, z: -16 },
    actionKey: 'BALCONY',
  },
  {
    id: 'stairs',
    name: '12. Đường Lên Tầng Trên',
    subtitle: 'Cầu thang bậc đá rồng rêu phong & cờ Phật giáo',
    dimensions: '14 × 8 m',
    icon: '🪜',
    desc: 'Bậc thang đá hoa cương rêu phong dài dốc dẫn lên lầu cao và Bảo Tháp sừng sững.',
    pos: { x: 28, z: -6 },
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
    pos: { x: 0, z: 20 },
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
  const [, setIsWalking] = useState<boolean>(false);
  const [currentBuilding, setCurrentBuilding] = useState<string | null>(null);
  const [isNightMode, setIsNightMode] = useState<boolean>(timePhase === 'EVENING');

  // Camera Mode: 'THIRD_PERSON' (Panoramic surroundings at eye level) vs 'ISOMETRIC' (Top-down)
  const [cameraMode, setCameraMode] = useState<'ISOMETRIC' | 'THIRD_PERSON'>('THIRD_PERSON');
  const cameraModeRef = useRef<'ISOMETRIC' | 'THIRD_PERSON'>('THIRD_PERSON');

  // State change trackers
  const isWalkingStateRef = useRef<boolean>(false);
  const currentBuildingStateRef = useRef<string | null>(null);
  const currentZoneIdRef = useRef<string>(TEMPLE_ZONES[0].id);

  // Third-Person Panoramic Eye-Level Camera Parameters (See full 360 surroundings and look up at pagodas)
  const cameraYawRef = useRef<number>(Math.PI); // Facing forward into monastery grounds
  const cameraPitchRef = useRef<number>(0.16); // Eye-level view seeing surroundings
  const cameraDistRef = useRef<number>(6.5); // Natural distance behind monk
  const cameraLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.6, 75));
  const isDraggingOrbitRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse Cursor Aiming & Ground Tracking Refs
  const cursorScreenPosRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const cursorGroundPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.25, 70));
  const hasGroundTargetRef = useRef<boolean>(false);
  const cursorMarkerGroupRef = useRef<THREE.Group | null>(null);

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

  const playerPosRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0.25, z: 80 });
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

  // Toggle Camera Mode: 3rd-Person Eye-Level (Surroundings) vs Isometric Top-Down
  const toggleCameraMode = () => {
    setCameraMode((prev) => {
      const next = prev === 'THIRD_PERSON' ? 'ISOMETRIC' : 'THIRD_PERSON';
      if (next === 'THIRD_PERSON') {
        cameraPitchRef.current = 0.16;
        cameraDistRef.current = 6.5;
        cameraYawRef.current = Math.PI;
      } else {
        cameraPitchRef.current = 0.86;
        cameraDistRef.current = 24.0;
        cameraYawRef.current = Math.PI * 0.78;
      }
      return next;
    });
  };

  // Navigate character to a specific zone (Silent on click)
  const navigateToZone = (zone: TempleZoneInfo) => {
    targetPosRef.current = { x: zone.pos.x, y: zone.pos.y, z: zone.pos.z };
    setIsWalking(true);
    setIsTourPlaying(false);
    isTourPlayingRef.current = false;

    if (zone.actionKey === 'NIGHT') {
      setIsNightMode(true);
    } else if (zone.actionKey === 'AERIAL') {
      cameraDistRef.current = 32.0;
      cameraPitchRef.current = 0.95;
    }

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.position.set(zone.pos.x, (zone.pos.y || 0) + 0.35, zone.pos.z);
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
      targetPosRef.current = { x: nextZone.pos.x, y: nextZone.pos.y, z: nextZone.pos.z };
    }
  };

  const restartFromGate = () => {
    playerPosRef.current = { x: 0, y: 0.25, z: 80 };
    targetPosRef.current = { x: 0, z: 66 };
    tourIndexRef.current = 0;
    tourWaitRef.current = 0;
    setIsTourPlaying(false);
    isTourPlayingRef.current = false;
    setIsWalking(true);
    if (cameraModeRef.current === 'THIRD_PERSON') {
      cameraPitchRef.current = 0.16;
      cameraDistRef.current = 6.5;
      cameraYawRef.current = Math.PI;
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
    const matWater = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85 });
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

    // [ZONE 5: HỒ SEN, CẦU ĐÁ & THỦY ĐÌNH]
    const pondGroup = new THREE.Group();
    pondGroup.position.set(-26, 0, 36);

    const pondRim = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 22), matStoneGrey);
    pondRim.position.set(0, 0.4, 0);
    pondGroup.add(pondRim);

    const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(23.5, 19.5, 16, 16), matWater);
    waterMesh.rotateX(-Math.PI / 2);
    waterMesh.position.set(0, 0.85, 0);
    pondGroup.add(waterMesh);

    // Glowing lotus blooms
    for (let l = 0; l < 12; l++) {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(0.9, 8), new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 }));
      pad.rotateX(-Math.PI / 2);
      pad.position.set((Math.random() - 0.5) * 18, 0.88, (Math.random() - 0.5) * 14);
      pondGroup.add(pad);

      const flower = new THREE.Mesh(
        new THREE.ConeGeometry(0.36, 0.58, 6),
        new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xec4899, emissiveIntensity: 0.4 })
      );
      flower.position.set(pad.position.x, 1.15, pad.position.z);
      pondGroup.add(flower);
    }

    // Koi fish
    koiFishListRef.current = [];
    for (let k = 0; k < 7; k++) {
      const koiG = new THREE.Group();
      const koiB = new THREE.Mesh(
        new THREE.ConeGeometry(0.32, 1.3, 6),
        new THREE.MeshStandardMaterial({ color: k % 2 === 0 ? 0xea580c : 0xfacc15, roughness: 0.25 })
      );
      koiB.rotateZ(Math.PI / 2);
      koiG.add(koiB);
      koiG.position.set((Math.random() - 0.5) * 14, 0.72, (Math.random() - 0.5) * 12);
      pondGroup.add(koiG);
      koiFishListRef.current.push({
        mesh: koiG,
        angle: k * (Math.PI / 3.5),
        speed: 0.02 + Math.random() * 0.012,
        radius: 3.5 + Math.random() * 4.2,
      });
    }

    // Thủy Đình Bát Giác & Cầu Đá Vòm
    const pavilionGroup = new THREE.Group();
    pavilionGroup.position.set(-7.5, 0.8, -7.5);
    for (const cpx of [-2.4, 2.4]) {
      for (const cpz of [-2.4, 2.4]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 5.5, 8), matWoodWarm);
        col.position.set(cpx, 2.75, cpz);
        pavilionGroup.add(col);
      }
    }
    const pavRoof = createStylizedCurvedRoof(7.5, 7.5, matRoofTile);
    pavRoof.position.set(0, 5.8, 0);
    pavilionGroup.add(pavRoof);
    pondGroup.add(pavilionGroup);

    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.0, 2.2, 16, 1, false, 0, Math.PI), matStoneGrey);
    bridge.rotateZ(Math.PI / 2);
    bridge.position.set(5.5, 0.4, 0);
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

    // [ZONE 7: PHÒNG THỜ CHÍNH ĐIỆN & ZONE 11: LẦU GÁC]
    const sanctuaryGroup = new THREE.Group();
    sanctuaryGroup.position.set(0, 0, -16);

    const sanctFloor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.6, 24), matTileBrick);
    sanctFloor.position.set(0, 0.3, 0);
    sanctFloor.receiveShadow = true;
    sanctuaryGroup.add(sanctFloor);

    // Pillars
    for (const cx of [-12, -6.5, 0, 6.5, 12]) {
      for (const cz of [-9, -3, 3, 9]) {
        if (Math.abs(cx) < 2 && Math.abs(cz) < 4) continue;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 11.5, 10), matWoodLim);
        col.position.set(cx, 6.0, cz);
        col.castShadow = true;
        sanctuaryGroup.add(col);
      }
    }

    // Golden Buddha Altar
    const altarGroup = new THREE.Group();
    altarGroup.position.set(0, 0.6, -7.0);

    const altarBase = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.5, 3.8), matGold);
    altarBase.position.set(0, 0.75, 0);
    altarGroup.add(altarBase);

    const throne1 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 0.55, 12), matGold);
    throne1.position.set(0, 1.8, 0);
    altarGroup.add(throne1);

    const buddhaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 2.0, 10), matGold);
    buddhaTorso.position.set(0, 3.6, 0);
    altarGroup.add(buddhaTorso);

    const buddhaHead = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), matGold);
    buddhaHead.position.set(0, 4.9, 0);
    altarGroup.add(buddhaHead);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.3, 20),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    halo.position.set(0, 4.8, -0.5);
    altarGroup.add(halo);

    const buddhaLight = new THREE.PointLight(0xfef08a, 1.8, 14);
    buddhaLight.position.set(0, 4.8, 1.5);
    altarGroup.add(buddhaLight);
    sanctuaryGroup.add(altarGroup);

    // 2nd Floor Balcony (Lầu Gác)
    const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 8.5), matWoodLim);
    balconyFloor.position.set(0, 6.8, 7.8);
    sanctuaryGroup.add(balconyFloor);

    const railing = new THREE.Mesh(new THREE.BoxGeometry(30, 1.0, 0.3), matWoodWarm);
    railing.position.set(0, 7.6, 11.8);
    sanctuaryGroup.add(railing);

    for (let rx = -12; rx <= 12; rx += 4.8) {
      const lantern = createStylizedSilkLantern(matLanternRed);
      lantern.position.set(rx, 6.5, 11.8);
      sanctuaryGroup.add(lantern);

      const pLight = new THREE.PointLight(0xf87171, 0.75, 8);
      pLight.position.set(rx, 6.0, 11.8);
      nightLightsRef.current.push(pLight);
      sanctuaryGroup.add(pLight);
    }

    const sanctRoofLower = createStylizedCurvedRoof(34, 28, matRoofTile);
    sanctRoofLower.position.set(0, 8.8, 0);
    sanctuaryRoofsRef.current.push(sanctRoofLower);
    sanctuaryGroup.add(sanctRoofLower);

    const sanctRoofUpper = createStylizedCurvedRoof(24, 20, matRoofTile);
    sanctRoofUpper.position.set(0, 13.2, 0);
    sanctuaryRoofsRef.current.push(sanctRoofUpper);
    sanctuaryGroup.add(sanctRoofUpper);
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
        // Allows player to tilt up to see the towering pagoda spire and sky, or look down at the ground
        cameraPitchRef.current = Math.max(0.02, Math.min(1.15, cameraPitchRef.current + dy * 0.005));
      }
    };

    const handlePointerUp = (e: MouseEvent) => {
      isDraggingOrbitRef.current = false;

      // Click on ground to move (Point & Click)
      const distMoved = Math.hypot(e.clientX - lastPointerDownPosRef.current.x, e.clientY - lastPointerDownPosRef.current.y);
      if (distMoved < 6 && hasGroundTargetRef.current) {
        const targetX = Math.max(-46, Math.min(46, cursorGroundPosRef.current.x));
        const targetZ = Math.max(-68, Math.min(88, cursorGroundPosRef.current.z));
        targetPosRef.current = { x: targetX, y: 0.25, z: targetZ };
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.position.set(targetX, 0.35, targetZ);
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
      cameraPitchRef.current = Math.max(0.02, Math.min(1.15, cameraPitchRef.current + dy * 0.006));
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
    // 60 FPS ISOMETRIC / TOP-DOWN ANIMATION LOOP
    // ==========================================
    let stepCount = 0;
    const walkSpeed = 0.28;

    const animate = () => {
      stepCount++;

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
          isCurrentlyWalking = true;
          isWalkingRef.current = true;
          if (!isWalkingStateRef.current) {
            isWalkingStateRef.current = true;
            setIsWalking(true);
          }
          walkPhaseRef.current += 0.16;

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
            currentP.x += (moveX / len) * walkSpeed;
            currentP.z += (moveZ / len) * walkSpeed;

            currentP.x = Math.max(-46, Math.min(46, currentP.x));
            currentP.z = Math.max(-68, Math.min(86, currentP.z));

            let targetAngle = Math.atan2(moveX, moveZ);
            playerRotationRef.current = targetAngle;
            let diff = targetAngle - monkGroupRef.current.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            monkGroupRef.current.rotation.y += diff * 0.18;
          }

          if (stepCount % 14 === 0) {
            spawnLotusFootstep(scene, currentP.x, currentP.z, lotusFootstepsRef);
          }
        } else if (targetPosRef.current) {
          const targetP = targetPosRef.current;
          const dx = targetP.x - currentP.x;
          const dz = targetP.z - currentP.z;
          const dist = Math.hypot(dx, dz);

          if (dist > 0.4) {
            isCurrentlyWalking = true;
            isWalkingRef.current = true;
            if (!isWalkingStateRef.current) {
              isWalkingStateRef.current = true;
              setIsWalking(true);
            }
            walkPhaseRef.current += 0.16;

            currentP.x += (dx / dist) * Math.min(walkSpeed, dist);
            currentP.z += (dz / dist) * Math.min(walkSpeed, dist);

            if (targetP.y !== undefined) {
              currentP.y += ((targetP.y || 0.25) - currentP.y) * 0.1;
            }

            const targetAngle = Math.atan2(dx, dz);
            playerRotationRef.current = targetAngle;
            let diff = targetAngle - monkGroupRef.current.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            monkGroupRef.current.rotation.y += diff * 0.18;

            if (stepCount % 14 === 0) {
              spawnLotusFootstep(scene, currentP.x, currentP.z, lotusFootstepsRef);
            }
          } else {
            isWalkingRef.current = false;
            if (isWalkingStateRef.current) {
              isWalkingStateRef.current = false;
              setIsWalking(false);
            }
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
          if (isWalkingStateRef.current) {
            isWalkingStateRef.current = false;
            setIsWalking(false);
          }

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
              monkGroupRef.current.rotation.y += diff * 0.16;

              if (monkHeadRef.current) {
                monkHeadRef.current.rotation.y = Math.max(-0.45, Math.min(0.45, diff * 0.65));
              }
            }
          }
        }

        // Arm & Leg Walking Kinematics
        const phase = walkPhaseRef.current;
        if (isCurrentlyWalking) {
          if (monkLeftLegRef.current && monkRightLegRef.current) {
            monkLeftLegRef.current.rotation.x = Math.sin(phase) * 0.48;
            monkRightLegRef.current.rotation.x = -Math.sin(phase) * 0.48;
          }
          if (monkLeftArmRef.current && monkRightArmRef.current) {
            monkLeftArmRef.current.rotation.x = -Math.sin(phase) * 0.38;
            monkRightArmRef.current.rotation.x = Math.sin(phase) * 0.38;
          }
          if (monkTorsoRef.current) {
            monkTorsoRef.current.position.y = 1.4 + Math.sin(phase * 2) * 0.035;
            monkTorsoRef.current.rotation.y = Math.sin(phase) * 0.04;
          }
        } else {
          if (monkLeftLegRef.current && monkRightLegRef.current) {
            monkLeftLegRef.current.rotation.x += (0 - monkLeftLegRef.current.rotation.x) * 0.18;
            monkRightLegRef.current.rotation.x += (0 - monkRightLegRef.current.rotation.x) * 0.18;
          }
          if (monkLeftArmRef.current && monkRightArmRef.current) {
            monkLeftArmRef.current.rotation.x += (0 - monkLeftArmRef.current.rotation.x) * 0.18;
            monkRightArmRef.current.rotation.x += (0 - monkRightArmRef.current.rotation.x) * 0.18;
          }
          if (monkTorsoRef.current) {
            monkTorsoRef.current.position.y += (1.4 - monkTorsoRef.current.position.y) * 0.18;
            monkTorsoRef.current.rotation.y += (0 - monkTorsoRef.current.rotation.y) * 0.18;
          }
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
              actionsList.push({ title: 'Rải Mồi Đàn Cá Koi', action: handleFeedKoiFish, icon: '🪷' });
              actionsList.push({ title: 'Hiên Trà Thủy Đình', action: p.onOpenTeaHouse, icon: '🍵' });
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
        const inSanctuary = currentP.z <= -6 && currentP.z >= -30 && Math.abs(currentP.x) <= 15 && currentP.y < 5.0;
        const inBalcony = currentP.y >= 5.0;
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

        // Smooth roof fading when inside
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

        // ==========================================
        // PANORAMIC 3RD-PERSON CAMERA INTERPOLATION (SEE SURROUNDINGS)
        // ==========================================
        const dist = cameraDistRef.current;
        const pitch = cameraPitchRef.current;
        const yaw = cameraYawRef.current;

        // Position camera behind monk at natural eye-level for full panoramic view of surroundings
        const camOffsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
        const camOffsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;
        const camOffsetY = Math.sin(pitch) * dist + 1.8;

        const targetCamX = currentP.x + camOffsetX;
        const targetCamY = Math.max(0.5, currentP.y + camOffsetY);
        const targetCamZ = currentP.z + camOffsetZ;

        camera.position.x += (targetCamX - camera.position.x) * 0.12;
        camera.position.y += (targetCamY - camera.position.y) * 0.12;
        camera.position.z += (targetCamZ - camera.position.z) * 0.12;

        // Smooth Look-at Target centered on monk eye/shoulder level
        const lookTargetX = currentP.x;
        const lookTargetY = currentP.y + 1.6;
        const lookTargetZ = currentP.z;

        cameraLookAtRef.current.x += (lookTargetX - cameraLookAtRef.current.x) * 0.15;
        cameraLookAtRef.current.y += (lookTargetY - cameraLookAtRef.current.y) * 0.15;
        cameraLookAtRef.current.z += (lookTargetZ - cameraLookAtRef.current.z) * 0.15;

        camera.lookAt(cameraLookAtRef.current);
      }

      // Handle Tour Countdown timer
      if (isTourPlayingRef.current && targetPosRef.current === null && tourWaitRef.current > 0) {
        tourWaitRef.current--;
        if (tourWaitRef.current <= 0) {
          const nextIndex = (tourIndexRef.current + 1) % TEMPLE_ZONES.length;
          tourIndexRef.current = nextIndex;
          const targetZone = TEMPLE_ZONES[nextIndex];
          targetPosRef.current = { x: targetZone.pos.x, y: targetZone.pos.y, z: targetZone.pos.z };
          setIsWalking(true);

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

      {/* INDOOR SANCTUARY / ROOM BADGE */}
      {currentBuilding && (
        <div className="absolute top-18 sm:top-20 right-4 sm:right-6 z-30 pointer-events-none animate-fadeIn">
          <div className="px-3.5 py-1.5 rounded-full bg-amber-950/90 border border-amber-400/60 text-amber-200 text-xs font-serif font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentBuilding}</span>
          </div>
        </div>
      )}

      {/* TOP BANNER: CURRENT TEMPLE ZONE NOTIFICATION */}
      {zoneBanner && (
        <div className="absolute top-18 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-fadeIn max-w-[92vw]">
          <div className="bg-stone-950/92 backdrop-blur-xl border-2 border-amber-500/60 px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="text-2xl sm:text-3xl shrink-0 p-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40">
              {zoneBanner.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-heading font-bold text-amber-200 text-sm sm:text-base">
                  {zoneBanner.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono">
                  {zoneBanner.dimensions}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-stone-300 font-serif line-clamp-1">
                {zoneBanner.subtitle}
              </div>
            </div>
            <button
              onClick={() => setZoneBanner(null)}
              className="text-stone-500 hover:text-stone-300 ml-2 text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTONS WHEN IN ZONE */}
      {nearInteractions.length > 0 && (
        <div className="absolute bottom-26 sm:bottom-22 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-wrap items-center justify-center gap-2 max-w-[90vw]">
          {nearInteractions.map((act, i) => (
            <button
              key={i}
              onClick={act.action}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-serif font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 active:scale-95 transition cursor-pointer border-2 border-amber-300 animate-pulse hover:animate-none"
            >
              <span className="text-lg sm:text-xl">{act.icon}</span>
              <span>{act.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* TOP-LEFT CONTROLLER BAR (ISOMETRIC TOGGLE & TOUR) */}
      <div className="absolute top-18 sm:top-20 left-3 sm:left-6 z-30 pointer-events-auto flex items-center gap-2">
        <button
          onClick={toggleTour}
          className={`px-3.5 py-2 rounded-2xl font-serif text-xs font-bold shadow-2xl flex items-center gap-2 transition-all cursor-pointer border ${
            isTourPlaying
              ? 'bg-amber-500 text-stone-950 border-amber-300 ring-2 ring-amber-400/50'
              : 'bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-amber-500/40 backdrop-blur-md'
          }`}
          title="Tự động dẫn nhân vật vãn cảnh qua 14 danh thắng chùa"
        >
          {isTourPlaying ? <Pause className="w-4 h-4 text-stone-950 fill-current" /> : <Play className="w-4 h-4 text-amber-400 fill-current" />}
          <span>{isTourPlaying ? 'Tạm Dừng Vãn Cảnh' : '14 Cảnh Sơn Tự'}</span>
          {isTourPlaying && (
            <span className="px-1.5 py-0.5 rounded-full bg-stone-950/20 text-stone-950 text-[10px] font-mono">
              {tourIndexRef.current + 1}/14
            </span>
          )}
        </button>

        <button
          onClick={restartFromGate}
          title="Bắt đầu lại bước chân từ Cổng Chùa Tam Quan"
          className="p-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-xl transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Panoramic 3rd-Person vs Isometric Mode Switcher */}
        <button
          onClick={toggleCameraMode}
          className="px-3 py-2 rounded-2xl font-serif text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border backdrop-blur-md bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-amber-500/30"
          title="Chuyển đổi góc nhìn: Góc người thứ 3 (Thấy toàn cảnh xung quanh) / Góc từ trên xuống"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{cameraMode === 'THIRD_PERSON' ? '🎥 Góc Toàn Cảnh (Xung Quanh)' : '📐 Góc Trên Cao (Top-Down)'}</span>
        </button>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-stone-900/90 border border-amber-500/30 backdrop-blur-md text-amber-300 text-xs font-serif shadow-xl">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Click chuột để đi • Kéo xoay góc nhìn • Lăn chuột thu phóng</span>
        </div>
      </div>

      {/* ON-SCREEN DIRECTIONAL D-PAD CONTROLLER */}
      <div className="absolute bottom-20 sm:bottom-18 left-3 sm:left-6 z-30 pointer-events-auto flex flex-col items-center">
        <button
          onPointerDown={() => handleDirectionStart('up')}
          onPointerUp={() => handleDirectionEnd('up')}
          onPointerLeave={() => handleDirectionEnd('up')}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-stone-900/90 hover:bg-stone-800 active:bg-amber-500 border border-amber-500/40 text-amber-300 active:text-stone-950 shadow-2xl flex items-center justify-center transition active:scale-95 cursor-pointer backdrop-blur-md"
          title="Tiến thẳng theo hướng nhìn (W hoặc Mũi tên lên)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5 my-1">
          <button
            onPointerDown={() => handleDirectionStart('left')}
            onPointerUp={() => handleDirectionEnd('left')}
            onPointerLeave={() => handleDirectionEnd('left')}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-stone-900/90 hover:bg-stone-800 active:bg-amber-500 border border-amber-500/40 text-amber-300 active:text-stone-950 shadow-2xl flex items-center justify-center transition active:scale-95 cursor-pointer backdrop-blur-md"
            title="Rẽ trái (A hoặc Mũi tên trái)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-950/80 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs sm:text-sm select-none shadow-inner" title="WASD / Phím Mũi Tên">
            🪷
          </div>

          <button
            onPointerDown={() => handleDirectionStart('right')}
            onPointerUp={() => handleDirectionEnd('right')}
            onPointerLeave={() => handleDirectionEnd('right')}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-stone-900/90 hover:bg-stone-800 active:bg-amber-500 border border-amber-500/40 text-amber-300 active:text-stone-950 shadow-2xl flex items-center justify-center transition active:scale-95 cursor-pointer backdrop-blur-md"
            title="Rẽ phải (D hoặc Mũi tên phải)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <button
          onPointerDown={() => handleDirectionStart('down')}
          onPointerUp={() => handleDirectionEnd('down')}
          onPointerLeave={() => handleDirectionEnd('down')}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-stone-900/90 hover:bg-stone-800 active:bg-amber-500 border border-amber-500/40 text-amber-300 active:text-stone-950 shadow-2xl flex items-center justify-center transition active:scale-95 cursor-pointer backdrop-blur-md"
          title="Lùi lại (S hoặc Mũi tên xuống)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* BOTTOM DOCK: 14 ARCHITECTURAL ZONES DOCK */}
      <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-20 pointer-events-auto">
        <div className="bg-stone-900/90 backdrop-blur-2xl border border-amber-500/40 p-2 sm:p-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-serif font-bold text-amber-300 px-2 flex items-center gap-1 shrink-0 hidden md:flex">
              <Footprints className="w-4 h-4 text-amber-400" />
              <span>14 Cảnh Chùa:</span>
            </span>

            {TEMPLE_ZONES.map((zone, idx) => {
              const isHere = currentZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => navigateToZone(zone)}
                  title={`${zone.name} (${zone.subtitle})`}
                  className={`px-2.5 py-1.5 rounded-xl font-serif text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    isHere
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-lg ring-2 ring-amber-300 scale-105'
                      : 'bg-stone-950/70 hover:bg-stone-800 border border-stone-800 text-stone-300'
                  }`}
                >
                  <span>{zone.icon}</span>
                  <span className="text-[11px] hidden sm:inline">{zone.name.split('.')[1] || zone.name}</span>
                  {idx < TEMPLE_ZONES.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-stone-500 hidden xl:inline" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Day / Night Atmosphere Toggle */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            title="Bật/Tắt chế độ Ánh Sáng Đèn Lồng Ban Đêm"
            className={`p-2 rounded-xl text-xs font-serif transition cursor-pointer border shrink-0 ${
              isNightMode ? 'bg-amber-500 text-stone-950 border-amber-300' : 'text-stone-300 hover:bg-stone-800 border-stone-800'
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

// Stylized 3D Monk Rig
function createStylized3DMonk(character: CharacterAppearance) {
  const monkGroup = new THREE.Group();
  monkGroup.position.set(0, 0.25, 80);

  const robeColors: Record<string, number> = {
    brown: 0x6d3917,
    saffron: 0xd97706,
    amber: 0xb45309,
    grey: 0x52525b,
  };
  const mainRobeColor = robeColors[character.robeColor] || 0x6d3917;

  const matRobe = new THREE.MeshStandardMaterial({ color: mainRobeColor, roughness: 0.8 });
  const matKasayaSash = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.65 });
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.7 });
  const matWoodBeads = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
  const matWhiteSock = new THREE.MeshStandardMaterial({ color: 0xf5f5f4, roughness: 0.9 });
  const matSandal = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });

  const monkTorso = new THREE.Group();
  monkTorso.position.set(0, 1.4, 0);

  const upperChest = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 1.2, 12), matRobe);
  upperChest.position.set(0, 0, 0);
  monkTorso.add(upperChest);

  const kasayaSash = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 8, 16, Math.PI * 1.2), matKasayaSash);
  kasayaSash.position.set(0, 0.1, 0);
  kasayaSash.rotation.x = Math.PI / 3;
  kasayaSash.rotation.y = -Math.PI / 6;
  monkTorso.add(kasayaSash);

  const robeSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.68, 1.15, 12), matRobe);
  robeSkirt.position.set(0, -0.65, 0);
  monkTorso.add(robeSkirt);

  const monkHead = new THREE.Group();
  monkHead.position.set(0, 0.92, 0);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 14), matSkin);
  monkHead.add(headMesh);

  if (character.accessory === 'hat') {
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.7 }));
    hat.position.set(0, 0.45, -0.05);
    hat.rotation.x = -0.12;
    monkHead.add(hat);
  } else if (character.hairStyle === 'bun') {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 }));
    bun.position.set(0, 0.44, -0.05);
    monkHead.add(bun);
  }

  const malaGroup = new THREE.Group();
  malaGroup.position.set(0, 0.72, 0.12);
  const malaTorus = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 8, 20), matWoodBeads);
  malaTorus.rotation.x = Math.PI / 4;
  malaGroup.add(malaTorus);
  monkTorso.add(malaGroup);
  monkTorso.add(monkHead);

  // Arms
  const monkLeftArm = new THREE.Group();
  monkLeftArm.position.set(-0.65, 0.6, 0);
  const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 0.9, 12), matRobe);
  leftSleeve.position.set(0, -0.45, 0);
  monkLeftArm.add(leftSleeve);
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), matSkin);
  leftHand.position.set(0, -0.92, 0);
  monkLeftArm.add(leftHand);
  monkTorso.add(monkLeftArm);

  const monkRightArm = new THREE.Group();
  monkRightArm.position.set(0.65, 0.6, 0);
  const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 0.9, 12), matRobe);
  rightSleeve.position.set(0, -0.45, 0);
  monkRightArm.add(rightSleeve);
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), matSkin);
  rightHand.position.set(0, -0.92, 0);
  monkRightArm.add(rightHand);
  monkTorso.add(monkRightArm);
  monkGroup.add(monkTorso);

  // Legs
  const monkLeftLeg = new THREE.Group();
  monkLeftLeg.position.set(-0.25, 0.8, 0);
  const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.8, 10), matWhiteSock);
  leftThigh.position.set(0, -0.4, 0);
  monkLeftLeg.add(leftThigh);
  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.45), matSandal);
  leftFoot.position.set(0, -0.82, 0.1);
  monkLeftLeg.add(leftFoot);
  monkGroup.add(monkLeftLeg);

  const monkRightLeg = new THREE.Group();
  monkRightLeg.position.set(0.25, 0.8, 0);
  const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.8, 10), matWhiteSock);
  rightThigh.position.set(0, -0.4, 0);
  monkRightLeg.add(rightThigh);
  const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.45), matSandal);
  rightFoot.position.set(0, -0.82, 0.1);
  monkRightLeg.add(rightFoot);
  monkGroup.add(monkRightLeg);

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
  footstepsRef: React.MutableRefObject<{ mesh: THREE.Mesh; life: number }[]>
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
  flower.position.set(x, 0.32, z);
  scene.add(flower);
  footstepsRef.current.push({ mesh: flower, life: 60 });
}
