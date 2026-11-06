import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import * as THREE from 'three';
import { soundEngine } from '../services/audioEngine';
import { useGameStore } from '../store/gameStore';
import type { CharacterAppearance } from '../types/game';
import { loadChibiCharacter } from '../services/characterLoader';
import { preloadMonkVoiceAudio, stopAbbotVoice } from '../services/monkVoiceService';
import { preloadTueTamVoice, speakTueTamVoice, stopTueTamVoice } from '../services/tueTamVoiceService';
import { useZenBridge, zenWorldBridge } from './bridge/zenWorldBridge';
import { Zen3DOverlays } from './Zen3DOverlays';
import { BUDDHIST_FORTUNE_LOTS } from '../data/buddhistFortuneLots';
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
  onOpenCalligraphy?: () => void;
  onAddMerit: (amount: number, x: number, y: number, label?: string) => void;
  spendStamina: (amount: number) => boolean;
}

import type {
  TempleZoneInfo,
  TempleZoneCamera,
  CircleObstacle,
  BoxObstacle,
  MonasteryObstacle
} from './world/colliders';
import {
  MONK_COLLISION_RADIUS,
  MONASTERY_OBSTACLES,
  resolveMonkCollision,
  getTerrainFloorElevation,
  TEMPLE_ZONES,
  SANCTUARY_CUSHIONS,
  getTargetMeditationCushion
} from './world/colliders';

import {
  createStylizedWoodTexture,
  createStylizedBrickTexture,
  createStylizedRoofTexture,
  createStylizedStoneTexture,
  createStylizedJadeRoofTexture,
  createStylizedAmberWoodTexture,
  createStylizedLotusPlinthTexture,
  getSharedTexture,
  disposeSharedTextures
} from './world/textures';

import type { TeaServerPatrolWaypoint } from './world/npcs/patrolNpcs';
import {
  TEA_SERVER_WAYPOINTS,
  SWEEPER_WAYPOINTS,
  createSweepingMonkNpc,
  createWalkingMonkNpc
} from './world/npcs/patrolNpcs';

import {
  createStylizedPuffyTree,
  createAuthenticLongCorridorRoof,
  createJadeCurvedRoof,
  createStylizedStoneLantern,
  createStylizedSilkLantern
} from './world/buildings/environmentProps';

import { createAuthenticDaiHungBaoDien } from './world/buildings/mainHall';
import { createAuthenticJadePagoda } from './world/buildings/jadePagoda';
import { createAuthenticBellTower } from './world/buildings/bellTower';
import { createAuthenticTeaPavilion } from './world/buildings/teaPavilion';
import { createRedesignedTempleGate, createMonasteryPerimeterWalls, type PerimeterWallMaterials } from './world/buildings/perimeterWall';
import { createLotusPondEnsemble, type KoiFishData } from './world/buildings/lotusPondEnsemble';
import { createBackCourtyardEnsemble } from './world/buildings/backCourtyardEnsemble';

// CẤU HÌNH ĐỘNG HỌC DI CHUYỂN NHÂN VẬT CHÍNH (RESPONSIVE MOVEMENT CONFIG)
const BASE_SPEED = 5.8; // m/s - Vận tốc đi bộ cơ bản (+61% so với 3.6 cũ)
const SPRINT_SPEED = 8.8; // m/s - Vận tốc chạy nhanh bứt tốc (+144% so với 3.6 cũ)
const ACCEL_RATE = 26.0; // Hệ số gia tốc nhạy (đạt 90% vận tốc tối đa trong < 88ms)
const BRAKE_RATE = 32.0; // Hệ số ma sát phanh dừng dứt khoát (dừng < 75ms, trượt < 0.12m)
const STOP_THRESHOLD = 0.05; // m/s - Ngưỡng triệt tiêu vận tốc dư thừa tránh rung lắc
const TURN_RATE = 28.0; // Tốc độ xoay bám hướng tức thì
const QUICK_TURN = 36.0; // Gia tốc xoay tăng cường khi góc đổi chiều > 140 độ
const STRIDE_STEP_DIST = 0.75; // Mét / bước chân thực tế cho âm thanh & bụi chân
const CLICK_ARRIVE_DIST = 0.18; // Bán kính tới đích nhấp chuột để phanh dừng dứt khoát

export type { TempleZoneInfo, TempleZoneCamera, CircleObstacle, BoxObstacle, MonasteryObstacle, TeaServerPatrolWaypoint };
export {
  MONK_COLLISION_RADIUS,
  MONASTERY_OBSTACLES,
  resolveMonkCollision,
  getTerrainFloorElevation,
  TEMPLE_ZONES,
  SANCTUARY_CUSHIONS,
  getTargetMeditationCushion,
  TEA_SERVER_WAYPOINTS,
  SWEEPER_WAYPOINTS,
  BASE_SPEED,
  SPRINT_SPEED,
  ACCEL_RATE,
  BRAKE_RATE,
  STOP_THRESHOLD,
  TURN_RATE,
  QUICK_TURN,
  STRIDE_STEP_DIST,
  CLICK_ARRIVE_DIST
};

const Zen3DWorldComponent: React.FC<Zen3DWorldProps> = ({
  character,
  level,
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
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isNightMode, setIsNightMode] = useState<boolean>(timePhase === 'EVENING');

  // Camera Mode: 'THIRD_PERSON' (Panoramic) vs 'ISOMETRIC' (Top-down) vs 'ON_RAINY_DAYS'
  const cameraModeRef = useRef<'ISOMETRIC' | 'THIRD_PERSON' | 'ON_RAINY_DAYS'>('THIRD_PERSON');

  // Character Relaxation Pose on the deck: 'STAND' | 'LIE_DOWN' | 'SIT_EDGE'
  const monkPoseRef = useRef<'STAND' | 'LIE_DOWN' | 'SIT_EDGE' | 'INCENSE_BOW'>('STAND');
  const isIncenseBowingRef = useRef<boolean>(false);
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
    onOpenCharity,
    onAddMerit,
    spendStamina,
    character,
    level,
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
    level,
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
  const tourNavQueueRef = useRef<Array<{ x: number; y?: number; z: number }>>([]);

  // Character 3D Rig Refs
  const monkGroupRef = useRef<THREE.Group | null>(null);

  // 3D Chibi Character Rig & Animation Refs
  const charMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const charActionsRef = useRef<{
    walk?: THREE.AnimationAction;
    idle?: THREE.AnimationAction;
    sit?: THREE.AnimationAction;
    incenseBow?: THREE.AnimationAction;
    meditationBow?: THREE.AnimationAction;
  }>({});
  const currentActionRef = useRef<string>('idle');
  const chibiModelLoadedRef = useRef<boolean>(false);
  const chibiModelRef = useRef<THREE.Group | null>(null);

  // Vầng Hào Quang Phước Báu (Buddhist Merit Halo)
  const meritHaloGroupRef = useRef<THREE.Group | null>(null);
  const updateMeritHaloRef = useRef<((merit: number, level: number) => void) | null>(null);
  const lastMeritRef = useRef<number>(-1);

  // Trạng thái vái lạy khi ngồi thiền nghe chuông
  const isMeditationBowingRef = useRef<boolean>(false);
  const meditationBowTimerRef = useRef<number>(0);

  const playerPosRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0.42, z: 80 });
  // Zero-Allocation target position with persistent active flag
  const targetPosRef = useRef<{ x: number; y: number; z: number; active: boolean }>({ x: 0, y: 0.42, z: 66, active: true });
  const playerRotationRef = useRef<number>(Math.PI);
  // Zero-Allocation Pooled Footsteps (Reuses pre-allocated meshes without runtime allocation/GC)
  const footstepPoolRef = useRef<{ mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; life: number; active: boolean }[]>([]);

  const setTargetPos = useCallback((x: number, y: number, z: number) => {
    targetPosRef.current.x = x;
    targetPosRef.current.y = y;
    targetPosRef.current.z = z;
    targetPosRef.current.active = true;
  }, []);

  const clearTargetPos = useCallback(() => {
    targetPosRef.current.active = false;
  }, []);

  // Directional Input State
  const keysPressedRef = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Player Dynamic Movement State (Zero-Allocation Buffers)
  const currentVelocityRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const isSprintingRef = useRef<boolean>(false);
  const strideAccumulatorRef = useRef<number>(0);

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

  // Tea Tasting Pavilion NPCs (Chú Tiểu Pha Trà & Thị Giả Phục Vụ Trà)
  const teaMasterNpcRef = useRef<{
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
    kettle: THREE.Group;
    teapot: THREE.Group;
    gaiwan: THREE.Group;
    ladle: THREE.Mesh;
    steamParticles: THREE.Mesh[];
  } | null>(null);
  const teaMasterRitualFrameRef = useRef(0);

  const teaServerNpcRef = useRef<{
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
    legL: THREE.Group;
    legR: THREE.Group;
    tray: THREE.Group;
  } | null>(null);
  const teaServerPatrolRef = useRef({
    currentWp: 0,
    waitTimer: 200,
    walkCycle: 0,
  });

  // Sweeping Novice Monk in Front Courtyard (Chú Tiểu Quét Sân - Tuệ Tâm)
  const sweeperNpcRef = useRef<{
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
    legL: THREE.Group;
    legR: THREE.Group;
    broom: THREE.Group;
  } | null>(null);
  const sweeperStateRef = useRef({
    currentWp: 0,
    waitTimer: 0,
    walkCycle: 0,
    sweepAngle: 0,
  });

  // Walking Meditation Novice Monk in Wooden Corridor (Chú Tiểu Kinh Hành - Tuệ Minh)
  const walkingMonkNpcRef = useRef<{
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
    legL: THREE.Group;
    legR: THREE.Group;
    beads: THREE.Group;
  } | null>(null);
  const walkingMonkStateRef = useRef({
    direction: 1,
    walkCycle: 0,
  });

  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const spiritParticlesRef = useRef<THREE.Points | null>(null);
  const koiFishListRef = useRef<KoiFishData[]>([]);
  const pondGroupRef = useRef<THREE.Group | null>(null);
  const userLanternsRef = useRef<{ mesh: THREE.Group; speed: number }[]>([]);
  const koiFeedingTimerRef = useRef<number>(0);
  const lastKoiFeedTimeRef = useRef<number>(0);
  const foodPelletsRef = useRef<{ mesh: THREE.Mesh; posX: number; posZ: number; posY: number; velY: number; targetY: number; life: number }[]>([]);
  const waterRipplesRef = useRef<{ mesh: THREE.Mesh; posX: number; posZ: number; scale: number; maxScale: number; opacity: number }[]>([]);
  const bambooLeavesRef = useRef<THREE.Group[]>([]);
  const kitchenSmokeRef = useRef<THREE.Points | null>(null);
  const destinationMarkerRef = useRef<THREE.Group | null>(null);
  const nightLightsRef = useRef<THREE.PointLight[]>([]);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Dedicated sound trigger: Bell rings and Novice Monk strikes with mallet
  const handleRingBell = useCallback(() => {
    soundEngine.playDistantEchoBell(1, 0.85);
    bellRingingTimerRef.current = 240;
    bellAnimFrameRef.current = 480;
    useZenBridge.getState().setBellNpcDialogue({
      speaker: 'Chú Tiểu Tuệ Tĩnh',
      avatar: '🔔',
      role: 'Thủ Hộ Lầu Chuông',
      text: 'Tiếng Đại Hồng Chung đã ngân vang ba cõi! Chú Tiểu đang thỉnh chuông tiêu trừ phiền não, mang lại an lạc vô lượng cho thí chủ và muôn loài khắp mười phương.',
      gatha: '🔔 Kệ Thỉnh Chuông:\n"Nguyện tiếng chuông này vang pháp giới\nThiết vi u ám tất giai văn\nVăn trần thanh tịnh chứng viên thông\nNhất thiết chúng sanh thành Chánh giác."',
    });
    propsRef.current.onAddMerit(35, 50, 40, '🔔 Đại Hồng Chung Ngân Vang Đỉnh Núi');
  }, []);

  const toggleAutoBell = useCallback(() => {
    const next = !useZenBridge.getState().isAutoBellActive;
    isAutoBellActiveRef.current = next;
    useZenBridge.getState().setIsAutoBellActive(next);
  }, []);

  const handleTalkToMonk = useCallback(() => {
    soundEngine.playWoodenFish();
    useZenBridge.getState().setBellNpcDialogue({
      speaker: 'Chú Tiểu Tuệ Tĩnh',
      avatar: '👦🏻',
      role: 'Thủ Hộ Lầu Chuông',
      text: 'A Di Đà Phật! Bần đạo là Chú Tiểu Tuệ Tĩnh, phụ trách giữ gìn lầu chuông và thỉnh chuông sớm tối. Thí chủ lên chốn non thiêng này xin hãy buông xả muộn phiền nơi trần thế, lắng lòng theo từng nhịp chuông thanh tịnh nhé!',
      gatha: '🔔 Kệ Thỉnh Chuông:\n"Hồng chung sơ khấu, bảo kệ cao tuyên,\nThượng triệt thiên đường, hạ thông địa phủ..."',
    });
    propsRef.current.onAddMerit(20, 50, 40, '🙏 Đàm Đạo Thiền Môn với Chú Tiểu');
  }, []);

  const handleTalkToAbbot = useCallback(() => {
    preloadMonkVoiceAudio();
    soundEngine.playWoodenFish();
    soundEngine.playSingingBowl();
    useZenBridge.getState().setAbbotDialogue({
      speaker: 'Hòa Thượng Thích Trí Tuệ',
      avatar: '📿',
      role: 'Sư Phụ Trụ Trì Chùa Sơn Tự',
      text: 'A Di Đà Phật! Lành thay thiện nam tín nữ đã hữu duyên cất bước lên chốn Đại Hùng Bảo Điện linh thiêng. Đời người như mây nổi gió bay, được mất hơn thua chỉ là huyễn mộng. Con hãy ngồi xuống bồ đoàn, buông xả vạn duyên trần thế, lắng lòng nghe kinh kệ để tâm sen bừng nở nhé!',
      gatha: '📜 Kệ Khai Thị:\n"Tâm tịnh ắt cõi Phật tịnh\nTùy kỳ tâm tịnh tắc Phật độ tịnh\nMột niệm giác ngộ trừ muôn nghiệp\nBát nhã quang minh chiếu vạn phương."',
      dharmaTopic: 'Kinh Bát Nhã & Thiền Đốn Ngộ',
    });
    propsRef.current.onAddMerit(40, 50, 35, '🙏 Thính Pháp Với Sư Phụ Trụ Trì');
  }, []);

  // XIN XĂM XIN LỘC & XEM VẬN MỆNH LINH THIÊNG NƠI SƯ PHỤ TRỤ TRÌ
  const handleXinXam = useCallback(() => {
    soundEngine.playWoodenFish();
    soundEngine.playSingingBowl();

    useZenBridge.getState().setFortuneModalOpen(true);
    useZenBridge.getState().setIsShakingLot(true);
    useZenBridge.getState().setCurrentFortune(null);

    // Xoay nhân vật hướng về phía tòa thuyết pháp của Sư Phụ Trụ Trì
    if (monkGroupRef.current) {
      const curX = monkGroupRef.current.position.x;
      const curZ = monkGroupRef.current.position.z;
      const angle = Math.atan2(2.4 - curX, -18.8 - curZ);
      monkGroupRef.current.rotation.set(0, angle, 0);
    }

    // Thời gian lắc ống xăm tre 1.2s tạo cảm giác chân thực và hồi hộp
    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * BUDDHIST_FORTUNE_LOTS.length);
      const fortune = BUDDHIST_FORTUNE_LOTS[randomIdx];

      useZenBridge.getState().setIsShakingLot(false);
      useZenBridge.getState().setCurrentFortune(fortune);
      soundEngine.playBell(528, 1.8);

      propsRef.current.onAddMerit(
        fortune.meritBonus,
        50,
        38,
        `🧧 Quẻ Xăm Số ${fortune.lotNumber}: ${fortune.title}`
      );
    }, 1200);
  }, []);

  // KHÓA LỄ THÍNH PHÁP & TỌA THIỀN CHÁNH NIỆM THEO TIẾNG MỎ SƯ THẦY
  const handleStartDharmaChantSession = useCallback(() => {
    preloadMonkVoiceAudio();
    soundEngine.playSingingBowl();

    const targetCushion = getTargetMeditationCushion(playerPosRef.current.x, playerPosRef.current.z);
    playerPosRef.current.x = targetCushion.x;
    playerPosRef.current.y = targetCushion.y;
    playerPosRef.current.z = targetCushion.z;
    clearTargetPos();
    isWalkingStateRef.current = false;

    if (monkGroupRef.current) {
      monkGroupRef.current.position.set(targetCushion.x, targetCushion.y, targetCushion.z);
      monkGroupRef.current.rotation.set(0, Math.PI, 0);
    }

    useZenBridge.getState().setMonkPose('SIT_EDGE');
    monkPoseRef.current = 'SIT_EDGE';

    soundEngine.startWoodenFishRhythm(2200);

    const dharmaText = 'A Di Đà Phật! Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười. Khi con an trú trong giây phút hiện tại, ngọn đèn chánh niệm sẽ soi tỏ mọi ngóc ngách u tối của tâm hồn. Hãy ngồi thẳng lưng trên bồ đoàn, buông xả vạn duyên trần thế, theo từng nhịp mỏ thanh tịnh mà nhiếp tâm thiền định an lạc.';
    const dharmaGatha = '🪷 Kệ Khóa Lễ Thiền Định:\n"Tiếng mỏ nhịp nhàng xua vọng niệm\nLời kinh trầm ấm lắng trần ai\nNgồi trên bồ đoàn tâm thanh tịnh\nBát-nhã hoa khai rạng ánh mai."';

    useZenBridge.getState().setAbbotDialogue({
      speaker: 'Hòa Thượng Thích Trí Tuệ',
      avatar: '🧘',
      role: 'Khóa Lễ Thính Pháp & Thiền Tọa',
      text: dharmaText,
      gatha: dharmaGatha,
    });

    propsRef.current.onAddMerit(60, 50, 40, '📜 Tham Dự Khóa Lễ Thính Pháp & Thiền Tọa');
  }, []);

  const handleSitMeditationLecture = useCallback(() => {
    handleStartDharmaChantSession();
  }, [handleStartDharmaChantSession]);

  // ─── TƯƠNG TÁC KHU THƯỞNG TRÀ (THIỀN TRÀ QUÁN) ─────────────────────────
  const handleThuongTraChanhNiem = useCallback(() => {
    soundEngine.playTeaPour();
    soundEngine.playWindChime();

    // Di chuyển nhẹ vào bồ đoàn thưởng trà
    if (monkGroupRef.current) {
      monkGroupRef.current.position.set(-21.5, 0.49, 6.5);
      monkGroupRef.current.rotation.set(0, -Math.PI / 2, 0);
    }
    useZenBridge.getState().setMonkPose('SIT_EDGE');
    monkPoseRef.current = 'SIT_EDGE';

    useZenBridge.getState().setTeaNpcDialogue({
      speaker: 'Chú Tiểu Tuệ Trà',
      avatar: '🍵',
      role: 'Trưởng Quán Thiền Trà',
      text: 'A Di Đà Phật! Mời thí chủ an tọa thưởng thức chén trà sen ấm nóng. Khi nhấp một ngụm trà, xin hãy cảm nhận vị thanh tao đượm hương sương sớm nơi cửa thiền, buông xả hết muộn phiền trần thế nhé!',
      gatha: '🪷 Kệ Thưởng Trà:\n"Nâng chén trà thơm khói nhẹ bay,\nLắng lòng trần tục tháng cùng ngày.\nTâm an cảnh tịnh sen bừng nở,\nMột ngụm an nhiên dứt đắm say."',
      dharmaTopic: 'Trà Thiền Nhất Vị • Chánh Niệm Từng Giây Phút',
    });

    propsRef.current.onAddMerit(30, 50, 40, '🍵 Thưởng Trà Sen Chánh Niệm');
  }, []);

  const handleTalkToTeaMaster = useCallback(() => {
    soundEngine.playSingingBowl();
    soundEngine.playTeaPour();

    useZenBridge.getState().setTeaNpcDialogue({
      speaker: 'Chú Tiểu Tuệ Trà',
      avatar: '🍵',
      role: 'Chú Tiểu Pha Trà',
      text: 'A Di Đà Phật! Bần đạo phụ trách châm lửa đun nước, ướp sen pha trà sớm tối tại hiên trà này. Trà thiền cốt ở chỗ thanh tịnh: nước sôi vừa tới, trà ngấm vừa độ, lòng người an yên thì trà mới tỏa trọn vẹn hương vị đạo lành.',
      gatha: '📜 Trà Thiền Khai Thị:\n"Nhất ẩm tiêu trừ phiền não chướng,\nNhị ẩm đắc ngộ bát nhã quang,\nTam ẩm triệt ngộ vô sanh pháp,\nTâm hoa tiếu ngạo bạch vân hương."',
      dharmaTopic: 'Nghệ Thuật Pha Trà Thiền Môn',
    });

    propsRef.current.onAddMerit(25, 50, 40, '🙏 Đàm Đạo Trà Thiền với Chú Tiểu');
  }, []);

  const handleXinChenTraSen = useCallback(() => {
    soundEngine.playTeaPour();
    soundEngine.playWindChime();

    useZenBridge.getState().setTeaNpcDialogue({
      speaker: 'Chú Tiểu Tiểu Trà',
      avatar: '🫖',
      role: 'Thị Giả Phục Vụ Trà',
      text: 'A Di Đà Phật! Kính mời thí chủ dùng chén trà sen thượng hạng vừa ướp sớm mai bên Hồ Sen Chùa Một Cột. Chúc thí chủ thân tâm an lạc, vạn sự hanh thông, luôn an trú trong ánh sáng từ bi của Tam Bảo!',
      gatha: '✨ Lời Chúc Thiền Môn:\n"Trà thơm dâng khách bốn phương,\nUống vào thanh tịnh dặm trường bình an."',
    });

    propsRef.current.onAddMerit(20, 50, 40, '🫖 Nhận Chén Trà Sen Từ Thị Giả');
  }, []);

  // HOẠT ẢNH DÂNG HƯƠNG & VÁI LẠY TAM BẢO (3 BÁI KÍNH CẨN)
  const handleTriggerIncenseBow = useCallback(() => {
    if (isIncenseBowingRef.current) return;
    preloadMonkVoiceAudio();
    isIncenseBowingRef.current = true;
    monkPoseRef.current = 'INCENSE_BOW';
    useZenBridge.getState().setMonkPose('INCENSE_BOW');
    useZenBridge.getState().setIsIncenseBowing(true);

    if (chibiIncenseBundleRef.current) {
      chibiIncenseBundleRef.current.visible = true;
    }

    clearTargetPos();
    isWalkingStateRef.current = false;

    if (monkGroupRef.current) {
      const curX = monkGroupRef.current.position.x;
      const curZ = monkGroupRef.current.position.z;
      const angle = Math.atan2(0 - curX, -20 - curZ);
      monkGroupRef.current.rotation.set(0, angle, 0);
    }

    soundEngine.playSingingBowl();

    setTimeout(() => soundEngine.playWoodenFish(), 1700);
    setTimeout(() => soundEngine.playWoodenFish(), 2700);
    setTimeout(() => soundEngine.playWoodenFish(), 3700);

    setTimeout(() => {
      if (chibiIncenseBundleRef.current) {
        chibiIncenseBundleRef.current.visible = false;
      }
      monkPoseRef.current = 'STAND';
      useZenBridge.getState().setMonkPose('STAND');
      isIncenseBowingRef.current = false;
      useZenBridge.getState().setIsIncenseBowing(false);

      soundEngine.playSingingBowl();
      propsRef.current.onAddMerit(50, 50, 40, '🕯️ Thắp Nhang & Vái Lạy Tam Bảo');

      useZenBridge.getState().setAbbotDialogue({
        speaker: 'Hòa Thượng Thích Trí Tuệ',
        avatar: '🕯️',
        role: 'Chứng Minh Công Đức',
        text: 'Thành tâm thắp ba nén nhang trầm, ba lần kính cẩn cúi đầu đảnh lễ mười phương Tam Bảo. Thầy nguyện cầu cho con và gia quyến thân tâm thường lạc, tai qua nạn khỏi, vạn sự cát tường, phước huệ trang nghiêm!',
        gatha: '🕯️ Kệ Dâng Hương:\n"Nguyện đem lòng thành kính\nGửi theo làn mây hương\nPhảng phất khắp mười phương\nCúng dường ngôi Tam Bảo."',
      });
    }, 4800);
  }, []);

  const handleLightIncenseSanctuary = useCallback(() => {
    handleTriggerIncenseBow();
  }, [handleTriggerIncenseBow]);

  // HOẠT ẢNH VÁI LẠY KHI ĐANG TỌA THIỀN / THÍNH PHÁP NGHE TIẾNG CHUÔNG NGÂN
  const handleTriggerMeditationBow = useCallback(() => {
    // Chỉ kích hoạt khi nhân vật đang ở tư thế ngồi thiền
    if (monkPoseRef.current !== 'SIT_EDGE') return;
    if (isMeditationBowingRef.current) return;

    isMeditationBowingRef.current = true;
    meditationBowTimerRef.current = 180; // ~3.0s ở 60 FPS

    if (charActionsRef.current.meditationBow) {
      const bowAction = charActionsRef.current.meditationBow;
      const sitAction = charActionsRef.current.sit;
      bowAction.reset().enabled = true;
      bowAction.setEffectiveWeight(1.0);
      if (sitAction) {
        sitAction.crossFadeTo(bowAction, 0.25, true);
      }
      bowAction.play();
    }

    propsRef.current.onAddMerit(10, 50, 42, '🙏 Lắng Nghe Chuông Ngân • Chí Thành Đảnh Lễ');
  }, []);

  // =========================================================================
  // BACKEND LOGIC: 7 CHỨC NĂNG HÀNH LỄ & TƯƠNG TÁC TẠI CHÙA MỘT CỘT & HỒ SEN
  // =========================================================================

  // 1. CHIÊM BÁI CHÙA MỘT CỘT (LIÊN HOA ĐÀI)
  const handleChiemBaiChuaMotCot = useCallback(() => {
    preloadMonkVoiceAudio();
    soundEngine.playSingingBowl();

            playerPosRef.current.x = -19.5;
    playerPosRef.current.z = 36.0;
    clearTargetPos();
    isWalkingStateRef.current = false;

    if (monkGroupRef.current) {
      monkGroupRef.current.position.set(-19.5, 0.93, 36.0);
      monkGroupRef.current.rotation.set(0, -Math.PI / 2, 0);
    }

    useZenBridge.getState().setMonkPose('INCENSE_BOW');
    monkPoseRef.current = 'INCENSE_BOW';

    setTimeout(() => soundEngine.playWoodenFish(), 1400);
    setTimeout(() => soundEngine.playWoodenFish(), 2800);

    useZenBridge.getState().setAbbotDialogue({
      speaker: 'Hòa Thượng Thích Trí Tuệ',
      avatar: '🪷',
      role: 'Khai Thị Chiêm Bái Chùa Một Cột',
      text: 'A Di Đà Phật! Thiện nam tín nữ hữu duyên cất bước đến chiêm bái Chùa Một Cột - đóa sen ngàn năm bất hoại ngự giữa cõi trần. Hãy hướng tâm về Đức Quan Thế Âm Bồ Tát ngự nơi bảo điện, buông bỏ phiền não, cầu cho gia đạo thái hòa, tâm bồ-đề kiên cố vững vàng.',
      gatha: '🪷 Kệ Tán Thán Liên Hoa Đài:\n"Một cột vươn cao ngát sắc sen\nĐài thiêng trầm mặc cõi lòng thanh\nThành tâm đảnh lễ ngời Phật tánh\nPhước lạc viên dung vạn thuở an."',
    });

    propsRef.current.onAddMerit(50, 50, 40, '🪷 Chiêm Bái Chùa Một Cột');
  }, []);

  // 2. DÂNG HƯƠNG CẦU AN TẠI HỒ SEN
  const handleDangHuongHoSen = useCallback(() => {
    if (isIncenseBowingRef.current) return;
    preloadMonkVoiceAudio();
    isIncenseBowingRef.current = true;
    useZenBridge.getState().setIsIncenseBowing(true);
    useZenBridge.getState().setMonkPose('INCENSE_BOW');
    monkPoseRef.current = 'INCENSE_BOW';

            playerPosRef.current.x = -12.0;
    playerPosRef.current.z = 36.0;
    clearTargetPos();
    isWalkingStateRef.current = false;

    if (monkGroupRef.current) {
      monkGroupRef.current.position.set(-12.0, 0.42, 36.0);
      monkGroupRef.current.rotation.set(0, -Math.PI / 2, 0);
    }

    if (chibiIncenseBundleRef.current) {
      chibiIncenseBundleRef.current.visible = true;
    }

    soundEngine.playSingingBowl();
    setTimeout(() => soundEngine.playWoodenFish(), 1600);
    setTimeout(() => soundEngine.playWoodenFish(), 2800);
    setTimeout(() => soundEngine.playWoodenFish(), 3800);

    setTimeout(() => {
      if (chibiIncenseBundleRef.current) {
        chibiIncenseBundleRef.current.visible = false;
      }
      isIncenseBowingRef.current = false;
      useZenBridge.getState().setIsIncenseBowing(false);
      useZenBridge.getState().setMonkPose('STAND');
      monkPoseRef.current = 'STAND';

      soundEngine.playSingingBowl();
      propsRef.current.onAddMerit(40, 50, 40, '🪔 Dâng Hương Cầu An Hồ Sen');

      useZenBridge.getState().setAbbotDialogue({
        speaker: 'Hòa Thượng Thích Trí Tuệ',
        avatar: '🪔',
        role: 'Chứng Minh Dâng Hương Cầu An',
        text: 'Một nén tâm hương thấu tận mười phương Chư Phật. Thầy chứng minh công đức dâng hương của con tại hồ sen Liên Hoa Đài, nguyện cầu cho cha mẹ hiện tiền tăng long phước thọ, gia quyến bình an, vạn sự hanh thông, sở cầu như ý.',
        gatha: '🪔 Kệ Dâng Hương Cầu An:\n"Khói hương quyện tỏa cõi trời mây\nLòng thành kính gửi đức Từ Bi\nCầu an phước lộc tràn muôn lối\nTâm tĩnh an nhiên dứt não phi."',
      });
    }, 4600);
  }, []);

  // 3. THẢ HOA ĐĂNG CẦU NGUYỆN (MỞ MODAL CHỌN ƯỚC NGUYỆN & THẢ ĐÈN 3D XUỐNG HỒ)
  const handleOpenFloatingLanternModal = useCallback(() => {
    useZenBridge.getState().setLanternModalOpen(true);
    soundEngine.playSingingBowl();
  }, []);

  const create3DFloatingLantern = useCallback((customWishText: string, selectedLanternType: string) => {
    if (!propsRef.current.spendStamina(5)) return;

    useZenBridge.getState().setMonkPose('INCENSE_BOW');
    monkPoseRef.current = 'INCENSE_BOW';
    setTimeout(() => {
      useZenBridge.getState().setMonkPose('STAND');
      monkPoseRef.current = 'STAND';
    }, 2500);

        if (pondGroupRef.current) {
      const lanternG = new THREE.Group();
      const localPx = playerPosRef.current.x - (-26.0);
      const localPz = playerPosRef.current.z - 36.0;
      lanternG.position.set(
        localPx + (Math.random() - 0.5) * 1.5,
        0.56,
        localPz + (Math.random() > 0.5 ? 1.9 : -1.9)
      );

      const lanternColors: Record<string, number> = {
        pink: 0xf472b6,
        gold: 0xfacc15,
        white: 0xfdf2f8,
        cyan: 0x38bdf8,
      };
      const petalCol = lanternColors[selectedLanternType] || 0xf472b6;

      const baseDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.22, 0.08, 12),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 })
      );
      lanternG.add(baseDisc);

      const matPetal = new THREE.MeshStandardMaterial({ color: petalCol, side: THREE.DoubleSide });
      for (let p = 0; p < 8; p++) {
        const pa = (p / 8) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 5), matPetal);
        petal.position.set(Math.cos(pa) * 0.18, 0.10, Math.sin(pa) * 0.18);
        petal.rotation.z = -Math.cos(pa) * 0.42;
        petal.rotation.x = Math.sin(pa) * 0.42;
        lanternG.add(petal);
      }

      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8),
        new THREE.MeshStandardMaterial({ color: 0xffedd5 })
      );
      candle.position.set(0, 0.12, 0);
      lanternG.add(candle);

      const candleGlow = new THREE.PointLight(0xfacc15, 0.65, 4.0);
      candleGlow.position.set(0, 0.26, 0);
      nightLightsRef.current.push(candleGlow);
      lanternG.add(candleGlow);

      pondGroupRef.current.add(lanternG);
      userLanternsRef.current.push({
        mesh: lanternG,
        speed: 0.006 + Math.random() * 0.004,
      });
    }

    soundEngine.playSingingBowl();
    propsRef.current.onAddMerit(45, 50, 40, '🏮 Thả Hoa Đăng Cầu Nguyện Thành Tâm');

    useZenBridge.getState().setAbbotDialogue({
      speaker: 'Hòa Thượng Thích Trí Tuệ',
      avatar: '🏮',
      role: 'Chứng Minh Hoa Đăng',
      text: `Ngọn đèn hoa đăng chở theo tâm nguyện: "${customWishText}" đã trôi bồng bềnh trên mặt hồ sen hướng về đài sen Chùa Một Cột. Chư Phật gia hộ cho ước nguyện thiện lành của con sớm ngày viên thành!`,
      gatha: '🏮 Kệ Thả Hoa Đăng:\n"Đèn trôi lấp lánh giữa hồ sen\nThắp sáng tâm từ rạng cõi thiêng\nNguyện ước bình an muôn lối rạng\nPhước đức duyên lành vạn kiếp yên."',
    });
  }, []);

  // 4. TỌA THIỀN BÊN HỒ SEN (MỞ BỘ HƯỚNG DẪN HƠI THỞ CHÁNH NIỆM)
  const handleToaThienHoSen = useCallback(() => {
    preloadMonkVoiceAudio();
    soundEngine.playSingingBowl();

    playerPosRef.current.x = -26.0;
    playerPosRef.current.z = 23.5;
    clearTargetPos();
    isWalkingStateRef.current = false;

    if (monkGroupRef.current) {
      monkGroupRef.current.position.set(-26.0, 0.89, 23.5);
      monkGroupRef.current.rotation.set(0, 0, 0);
    }

    useZenBridge.getState().setMonkPose('SIT_EDGE');
    monkPoseRef.current = 'SIT_EDGE';
    useZenBridge.getState().setLotusMeditation(true, 'IN', 0);

    soundEngine.startWoodenFishRhythm(2400);
    propsRef.current.onAddMerit(30, 50, 40, '🧘 Tọa Thiền Tĩnh Tâm Bên Đầm Sen');
  }, []);

  // 5. RẢI MỒI ĐÀN CÁ KOI (ĐÀN CÁ 16 CON BƠI TỤ VỀ ĐỚP MỒI SỐNG ĐỘNG)
  const handleFeedKoiFish = useCallback(() => {
    const now = Date.now();
    if (now - lastKoiFeedTimeRef.current < 3000) return;
    if (!propsRef.current.spendStamina(5)) return;
    lastKoiFeedTimeRef.current = now;

    soundEngine.playWoodenFish();

    // Rải hạt thức ăn vàng kim xuống mặt hồ sen tạo gợn sóng nước
    if (pondGroupRef.current) {
      const pelletMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        roughness: 0.3,
      });
            const localPx = playerPosRef.current.x - (-26.0);
      const localPz = playerPosRef.current.z - 36.0;
      for (let i = 0; i < 12; i++) {
        const pellet = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045), pelletMat);
        const px = localPx + (Math.random() - 0.5) * 2.0;
        const pz = localPz + (Math.random() > 0.5 ? 1.85 : -1.85) + (Math.random() - 0.5) * 0.8;
        const py = 1.35 + Math.random() * 0.4;
        pellet.position.set(px, py, pz);
        pondGroupRef.current.add(pellet);
        foodPelletsRef.current.push({
          mesh: pellet,
          posX: px,
          posZ: pz,
          posY: py,
          velY: -0.04 - Math.random() * 0.03,
          targetY: 0.55,
          life: 240,
        });
      }
    }

    koiFeedingTimerRef.current = 210; // ~3.5 giây bơi gom đớp mồi tại 60fps

    useZenBridge.getState().setMonkPose('INCENSE_BOW');
    monkPoseRef.current = 'INCENSE_BOW';
    setTimeout(() => {
      useZenBridge.getState().setMonkPose('STAND');
      monkPoseRef.current = 'STAND';
    }, 2000);

    propsRef.current.onAddMerit(35, 50, 40, '🐟 Rải Mồi & Nuôi Dưỡng Đàn Cá Koi');

    useZenBridge.getState().setAbbotDialogue({
      speaker: 'Hòa Thượng Thích Trí Tuệ',
      avatar: '🐟',
      role: 'Phóng Sinh & Bố Thí Thức Ăn',
      text: 'Bố thí thức ăn cho muôn loài là hạnh lành nuôi dưỡng lòng từ bi. Thấy đàn cá thảnh thơi tung tăng bơi lội dưới làn nước sen ngọc, lòng người cũng tự nhiên nhẹ nhõm, tiêu trừ phiền muộn.',
      gatha: '🐟 Kệ Phóng Sinh:\n"Thả mồi nuôi dưỡng chúng sanh\nTâm từ trải rộng đất lành nở hoa\nCá bơi thảnh thơi bến đà\nLòng người thanh thản an hòa muôn phương."',
    });
  }, []);

  // 6. HIÊN TRÀ THƯỞNG SEN
  const handleHienTraThuongSen = useCallback(() => {
    soundEngine.playSingingBowl();
    if (propsRef.current.onOpenTeaHouse) {
      propsRef.current.onOpenTeaHouse();
    }
  }, []);

  // 7. ĐỨNG DẬY BƯỚC ĐI (PHỤC HỒI TỰ DO DI CHUYỂN)
  const handleDungDayBuocDi = useCallback(() => {
    useZenBridge.getState().setMonkPose('STAND');
    monkPoseRef.current = 'STAND';
    useZenBridge.getState().setLotusMeditation(false);
    soundEngine.stopWoodenFishRhythm();
    if (chibiIncenseBundleRef.current) {
      chibiIncenseBundleRef.current.visible = false;
    }
    if (monkGroupRef.current) {
      monkGroupRef.current.rotation.set(0, 0, 0);
    }
  }, []);

  // Tải / Tải lại mô hình 3D Chibi khi diện mạo thay đổi
  useEffect(() => {
    if (!monkGroupRef.current) return;
    let cancelled = false;

    loadChibiCharacter(character).then((rig) => {
      if (cancelled) return;
      charMixerRef.current = rig.mixer;
      charActionsRef.current = rig.actions;
      chibiIncenseBundleRef.current = rig.incenseBundle || null;
      meritHaloGroupRef.current = rig.meritHaloGroup || null;
      updateMeritHaloRef.current = rig.updateMeritHalo || null;
      rig.updateMeritHalo?.(useGameStore.getState().stats.congDuc, propsRef.current.level);
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

  // Camera Mode Switcher (Syncs with bridge store)
  const toggleCameraMode = (mode?: 'ISOMETRIC' | 'THIRD_PERSON' | 'ON_RAINY_DAYS') => {
    let next: 'ISOMETRIC' | 'THIRD_PERSON' | 'ON_RAINY_DAYS' = 'THIRD_PERSON';
    if (mode) {
      next = mode;
    } else {
      const cur = cameraModeRef.current;
      if (cur === 'THIRD_PERSON') next = 'ON_RAINY_DAYS';
      else if (cur === 'ON_RAINY_DAYS') next = 'ISOMETRIC';
      else next = 'THIRD_PERSON';
    }
    cameraModeRef.current = next;
    useZenBridge.getState().setCameraMode(next);
    if (next === 'ON_RAINY_DAYS') {
      cameraDistRef.current = 14.0;
      cameraPitchRef.current = 0.55;
      cameraYawRef.current = Math.PI * 0.25;
    } else if (next === 'THIRD_PERSON') {
      cameraPitchRef.current = -0.12;
      cameraDistRef.current = 6.5;
      cameraYawRef.current = 0;
    } else {
      cameraPitchRef.current = 0.86;
      cameraDistRef.current = 24.0;
      cameraYawRef.current = Math.PI * 0.78;
    }
  };

  const handleSetMonkPose = (pose: 'STAND' | 'LIE_DOWN' | 'SIT_EDGE' | 'INCENSE_BOW') => {
    monkPoseRef.current = pose;
    useZenBridge.getState().setMonkPose(pose);
    if (pose === 'LIE_DOWN') {
      playerPosRef.current = { x: -30.0, y: 0.94, z: 36.5 };
      setTargetPos(-30.0, 0.94, 36.5);
    } else if (pose === 'SIT_EDGE') {
      playerPosRef.current = { x: -26.0, y: 0.89, z: 23.5 };
      setTargetPos(-26.0, 0.89, 23.5);
    }
  };

  const startNavigatingToZone = (targetIdx: number, isAutoTour: boolean) => {
    const targetZone = TEMPLE_ZONES[targetIdx];
    if (!targetZone) return;

    tourIndexRef.current = targetIdx;
    useZenBridge.getState().setIsTourPlaying(isAutoTour, targetIdx);
    isTourPlayingRef.current = isAutoTour;
    tourWaitRef.current = 0;

    const wps: Array<{ x: number; y?: number; z: number }> = targetZone.navWaypoints && targetZone.navWaypoints.length > 0
      ? targetZone.navWaypoints.map((pt) => ({
        x: pt.x,
        z: pt.z,
        y: getTerrainFloorElevation(pt.x, pt.z, targetZone.pos.y ?? 0.42),
      }))
      : [{
        x: targetZone.pos.x,
        z: targetZone.pos.z,
        y: getTerrainFloorElevation(targetZone.pos.x, targetZone.pos.z, targetZone.pos.y ?? 0.42),
      }];

    tourNavQueueRef.current = [...wps];
    const firstWp = tourNavQueueRef.current.shift()!;
    setTargetPos(firstWp.x, firstWp.y ?? 0.42, firstWp.z);

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.position.set(
        targetZone.pos.x,
        (targetZone.pos.y ?? 0.42) + 0.08,
        targetZone.pos.z
      );
      destinationMarkerRef.current.visible = true;
    }
  };

  // Navigate character to a specific zone (Silent on click)
  const navigateToZone = (zone: TempleZoneInfo) => {
    const idx = TEMPLE_ZONES.findIndex((z) => z.id === zone.id);
    const targetIdx = idx !== -1 ? idx : 0;
    startNavigatingToZone(targetIdx, false);
  };

  const toggleTour = () => {
    const isPlaying = useZenBridge.getState().isTourPlaying;
    if (isPlaying) {
      useZenBridge.getState().setIsTourPlaying(false);
      isTourPlayingRef.current = false;
      tourNavQueueRef.current = [];
      clearTargetPos();
    } else {
      const currentIdx = tourIndexRef.current >= 0 && tourIndexRef.current < TEMPLE_ZONES.length
        ? tourIndexRef.current
        : 0;
      startNavigatingToZone(currentIdx, true);
    }
  };

  const restartFromGate = () => {
    tourNavQueueRef.current = [];
    playerPosRef.current = { x: 0, y: 0.42, z: 80 };
    setTargetPos(0, 0.42, 66);
    tourIndexRef.current = 0;
    tourWaitRef.current = 0;
    useZenBridge.getState().setIsTourPlaying(false, 0);
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
    tourNavQueueRef.current = [];
    stopTueTamVoice();
    useZenBridge.getState().setTueTamVoice(false, 0);
    if (isTourPlayingRef.current) {
      isTourPlayingRef.current = false;
      useZenBridge.getState().setIsTourPlaying(false);
    }
    clearTargetPos();
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
      if (code === 'ShiftLeft' || code === 'ShiftRight') isSprintingRef.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') handleDirectionEnd('up');
      if (code === 'KeyS' || code === 'ArrowDown') handleDirectionEnd('down');
      if (code === 'KeyA' || code === 'ArrowLeft') handleDirectionEnd('left');
      if (code === 'KeyD' || code === 'ArrowRight') handleDirectionEnd('right');
      if (code === 'ShiftLeft' || code === 'ShiftRight') isSprintingRef.current = false;
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

    // Nạp sẵn giọng đọc Chú Tiểu Tuệ Tâm vào bộ nhớ đệm Web Audio
    preloadTueTamVoice().catch(() => { });

    // Register WebGL command bus on bridge
    const unregisterBridge = zenWorldBridge.registerCommands({
      navigateToZone,
      setCameraMode: toggleCameraMode,
      setMonkPose: handleSetMonkPose,
      toggleTour,
      restartFromGate,
      triggerIncenseBow: handleTriggerIncenseBow,
      ringBell: handleRingBell,
      talkToMonk: handleTalkToMonk,
      talkToAbbot: handleTalkToAbbot,
      startDharmaSession: handleStartDharmaChantSession,
      startSitMeditationLecture: handleSitMeditationLecture,
      feedKoiFish: handleFeedKoiFish,
      releaseLantern: create3DFloatingLantern,
      toggleAutoBell,
      setMovementDirection: (dir, pressed) => {
        if (pressed) handleDirectionStart(dir);
        else handleDirectionEnd(dir);
      },
      setSprintMode: (active: boolean) => {
        isSprintingRef.current = active;
      },
      tiltCameraUp: () => {
        cameraPitchRef.current = Math.min(Math.PI / 2.2, cameraPitchRef.current + 0.15);
      },
      setDayNight: (isNight) => setIsNightMode(isNight),
      setGraphicsQuality: (quality) => {
        if (rendererRef.current) {
          const isHigh = quality === 'HIGH';
          rendererRef.current.shadowMap.enabled = isHigh;
          rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, isHigh ? 1.25 : 1.0));
        }
      },
      drawFortune: handleXinXam,
      talkToTeaMaster: handleTalkToTeaMaster,
      serveTea: handleXinChenTraSen,
      playTueTamVoice: (clipKey = 'GREETING') => {
        speakTueTamVoice(undefined, clipKey, {
          onStart: () => useZenBridge.getState().setTueTamVoice(true, 0),
          onEnd: () => useZenBridge.getState().setTueTamVoice(false, 100),
          onTimeUpdate: (cur, dur) => {
            const pct = dur > 0 ? (cur / dur) * 100 : 0;
            useZenBridge.getState().setTueTamVoice(true, pct);
          }
        });
      },
      stopTueTamVoice: () => {
        stopTueTamVoice();
        useZenBridge.getState().setTueTamVoice(false, 0);
      },
    });

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
    sunLight.shadow.camera.far = 260;
    sunLight.shadow.camera.left = -65;
    sunLight.shadow.camera.right = 65;
    sunLight.shadow.camera.top = 65;
    sunLight.shadow.camera.bottom = -65;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Glowing Moon in Night Sky
    const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
    moonMesh.position.set(80, 110, -140);
    scene.add(moonMesh);

    // 5. Stylized Hand-Crafted Textures & Authentic Architecture Materials
    const texWood = getSharedTexture('wood_main', createStylizedWoodTexture);
    texWood.repeat.set(2, 4);
    const texBrick = getSharedTexture('brick_main', createStylizedBrickTexture);
    texBrick.repeat.set(8, 8);
    const texRoof = getSharedTexture('roof_main', createStylizedRoofTexture);
    texRoof.repeat.set(3, 6);
    const texStone = getSharedTexture('stone_main', createStylizedStoneTexture);
    texStone.repeat.set(4, 4);

    // Authentic Jade Glazed Tiles & Amber Sandalwood from Reference Drawing
    const texJadeRoof = getSharedTexture('jaderoof_main', createStylizedJadeRoofTexture);
    texJadeRoof.repeat.set(3, 4);
    const texAmberWood = getSharedTexture('amberwood_main', createStylizedAmberWoodTexture);
    texAmberWood.repeat.set(2, 4);
    const texLotusPlinth = getSharedTexture('lotusplinth_main', createStylizedLotusPlinthTexture);
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


    // [ZONE 1: CỔNG TAM QUAN 3 GIAN CỔ TRUYỀN & TƯỜNG BAO SƠN TỰ]
    const perimeterMaterials: PerimeterWallMaterials = {
      matStoneGrey,
      matRoofTile,
      matBrick: matTileBrick,
      matWoodWarm,
      matDarkTimber,
      matGold,
      matLanternRed,
    };

    const redesignedGate = createRedesignedTempleGate(perimeterMaterials);
    scene.add(redesignedGate);

    const monasteryPerimeterWalls = createMonasteryPerimeterWalls(perimeterMaterials);
    scene.add(monasteryPerimeterWalls);

    // [ZONE 2: SÂN CHÙA & ĐẠI LƯ HƯƠNG]
    const courtyardGroup = new THREE.Group();
    courtyardGroup.position.set(0, 0, 20);

            // ĐẠI SÂN CHÙA BÁT TRÀNG ĐỒNG BỘ & ĐỀU ĐẶN (QUY HOẠCH VUÔNG VẮN CÂN ĐỐI)
    // 1. Đại sân trung tâm phẳng phiu (30m x 52m) nối từ Chánh Điện (Z=2) đến trước Cổng Tam Quan (Z=54)
    // Mép Tây (X = -12) tiếp giáp chuẩn xác với bờ kè Đông Hồ Sen & lối lên Cầu Chùa Một Cột (Z = 36)
    // Mép Đông (X = 18) tiếp giáp thẳng hàng với Dãy Hành Lang Cột Gỗ Lim
    const courtFloorGrand = new THREE.Mesh(new THREE.BoxGeometry(30.0, 0.35, 52.0), matTileBrick);
    courtFloorGrand.position.set(3.0, 0.18, 8.0);
    courtFloorGrand.receiveShadow = true;
    courtyardGroup.add(courtFloorGrand);

    // 2. Trục đường lát gạch nung dẫn từ Cổng Tam Quan (Z: 54 đến 66, rộng 14m cân xứng trục trung đạo X=0)
    const courtFloorAvenue = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.35, 12.0), matTileBrick);
    courtFloorAvenue.position.set(0.0, 0.18, 40.0);
    courtFloorAvenue.receiveShadow = true;
    courtyardGroup.add(courtFloorAvenue);

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

    // Puffy Stylized Bonsai Trees around courtyard (đã di dời khỏi lòng hồ sen để thông thoáng tầm nhìn)
    const bonsaiCoords = [[-10.5, 2], [-20, -5], [20, 13], [20, -5], [-10.5, -12], [12, 15]];
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

    // [NPC CHÚ TIỂU QUÉT SÂN "TUỆ TÂM" - SÂN CHÙA CHÁNH ĐIỆN]
    const matNoviceRobe = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75 });
    const matNoviceCollar = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const matSkin = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.55 });
    const matStraw = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });

    const sweeperData = createSweepingMonkNpc(
      matNoviceRobe,
      matNoviceCollar,
      matSkin,
      matDarkTimber,
      matStraw
    );
    sweeperData.group.position.set(SWEEPER_WAYPOINTS[0].x, 0.35, SWEEPER_WAYPOINTS[0].z);
    courtyardGroup.add(sweeperData.group);
    sweeperNpcRef.current = sweeperData;

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

    // =========================================================================
    // [ZONE 5: HỒ SEN BÍCH NGỌC & CHÙA MỘT CỘT (LIÊN HOA ĐÀI) - MODULE KIẾN TRÚC]
    // Quần thể Chùa Một Cột ngự giữa hồ sen Linh Chiểu nở hoa rực rỡ, cá Koi bơi lượn
    // =========================================================================
    const pondGroup = createLotusPondEnsemble(
      matStoneGrey,
      matLotusPlinth,
      matGold,
      nightLightsRef,
      koiFishListRef
    );
    pondGroupRef.current = pondGroup;
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

    // [NPC CHÚ TIỂU KINH HÀNH "TUỆ MINH" - DÃY HÀNH LANG GỖ LIM]
    const matGreyRobe = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const walkingMonkData = createWalkingMonkNpc(
      matGreyRobe,
      matNoviceCollar,
      matSkin,
      matAmberWood
    );
    walkingMonkData.group.position.set(0, 0.60, -10.0);
    corridorGroup.add(walkingMonkData.group);
    walkingMonkNpcRef.current = walkingMonkData;

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

    // [ZONE 8: THIỀN TRÀ QUÁN (HIÊN TRÀ NGUYỆT MÔN) - NPC PHA TRÀ & PHỤC VỤ TRÀ]
    const teaPavilionData = createAuthenticTeaPavilion(
      matStoneGrey,
      matLotusPlinth,
      matWoodLim,
      matDarkTimber,
      matWoodWarm,
      matAmberWood,
      matJadeRoofTile,
      matGold,
      matBronze,
      nightLightsRef
    );
    teaPavilionData.group.position.set(-24, 0, 6);
    teaMasterNpcRef.current = teaPavilionData.teaMaster;
    teaServerNpcRef.current = teaPavilionData.teaServer;
    teaPavilionData.roofs.forEach((r) => meditationRoofsRef.current.push(r));
    scene.add(teaPavilionData.group);

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

        // =========================================================================
    // [ZONE 10: HẬU VIỆN SƠN TỰ - MODULE KIẾN TRÚC MỚI]
    // Hương Tích Trù, Kho Củi Tiêu Phòng, Giếng Ngọc Cổ & Hàng Trúc Xanh
    // =========================================================================
    const backCourtyardData = createBackCourtyardEnsemble(
      { matStoneGrey, matRoofTile, matWoodLim, matTileBrick, matLotusPlinth, matBronze },
      nightLightsRef
    );
    bambooLeavesRef.current = backCourtyardData.bambooCulms;
    kitchenSmokeRef.current = backCourtyardData.kitchenSmoke;
    scene.add(backCourtyardData.group);

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
      meritHaloGroupRef.current = rig.meritHaloGroup || null;
      updateMeritHaloRef.current = rig.updateMeritHalo || null;
      rig.updateMeritHalo?.(useGameStore.getState().stats.congDuc, propsRef.current.level);
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

    // Pre-allocated Raycaster and Vectors for Mouse/Touch (Zero-Allocation on Pointer Events)
    const raycaster = new THREE.Raycaster();
    const upVector = new THREE.Vector3(0, 1, 0);
    const groundPlane = new THREE.Plane(upVector, -0.25);
    const sanctuaryPlane = new THREE.Plane(upVector, -3.30);
    const hitVec = new THREE.Vector3();
    const hitSanctuaryVec = new THREE.Vector3();

    const updateCursorGroundPos = (clientX: number, clientY: number) => {
      if (!renderer || !camera) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      cursorScreenPosRef.current.set(ndcX, ndcY);

      raycaster.setFromCamera(cursorScreenPosRef.current, camera);
      const currentPy = playerPosRef.current.y || 0.42;
      let matchedSanctuary = false;

      if (raycaster.ray.intersectPlane(sanctuaryPlane, hitSanctuaryVec)) {
        if (hitSanctuaryVec.x >= -23.5 && hitSanctuaryVec.x <= 23.5 && hitSanctuaryVec.z <= -0.5 && hitSanctuaryVec.z >= -34.0) {
          hitVec.copy(hitSanctuaryVec);
          matchedSanctuary = true;
        }
      }

      if (!matchedSanctuary) {
        groundPlane.constant = -currentPy;
        if (raycaster.ray.intersectPlane(groundPlane, hitVec)) {
          hitVec.x = Math.max(-50, Math.min(50, hitVec.x));
          hitVec.z = Math.max(-75, Math.min(95, hitVec.z));
        }
      }

      cursorGroundPosRef.current.copy(hitVec);
      hasGroundTargetRef.current = true;
    };

    // Pointer Event Listeners (Zero-Allocation in-place coordinate updates)
    const handlePointerDown = (e: MouseEvent) => {
      isDraggingOrbitRef.current = true;
      dragStartPosRef.current.x = e.clientX;
      dragStartPosRef.current.y = e.clientY;
      lastPointerDownPosRef.current.x = e.clientX;
      lastPointerDownPosRef.current.y = e.clientY;
    };

    const handlePointerMove = (e: MouseEvent) => {
      updateCursorGroundPos(e.clientX, e.clientY);

      if (isDraggingOrbitRef.current) {
        const dx = e.clientX - dragStartPosRef.current.x;
        const dy = e.clientY - dragStartPosRef.current.y;
        dragStartPosRef.current.x = e.clientX;
        dragStartPosRef.current.y = e.clientY;

        cameraYawRef.current -= dx * 0.007;
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

        tourNavQueueRef.current = [];
        stopTueTamVoice();
        useZenBridge.getState().setTueTamVoice(false, 0);
        if (isTourPlayingRef.current) {
          isTourPlayingRef.current = false;
          useZenBridge.getState().setIsTourPlaying(false);
        }
        setTargetPos(resolved.x, floorY, resolved.z);
        stuckCountRef.current = 0;
        if (monkPoseRef.current !== 'STAND') {
          monkPoseRef.current = 'STAND';
          useZenBridge.getState().setMonkPose('STAND');
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

    // Touch Support for Mobile (Zero-Allocation in-place coordinates)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingOrbitRef.current = true;
        dragStartPosRef.current.x = e.touches[0].clientX;
        dragStartPosRef.current.y = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingOrbitRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartPosRef.current.x;
      const dy = e.touches[0].clientY - dragStartPosRef.current.y;
      dragStartPosRef.current.x = e.touches[0].clientX;
      dragStartPosRef.current.y = e.touches[0].clientY;

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

    // Lắng nghe tiếng chuông chùa để nhân vật thiền tọa vái lạy cung kính
    const unsubBell = soundEngine.addBellListener(() => {
      handleTriggerMeditationBow();
    });

    // ==========================================
    // 60+ FPS SMOOTH ANIMATION & MOVEMENT LOOP
    // ==========================================
    // Pre-cache all roof materials to eliminate per-frame recursive scene graph traversals
    const collectRoofMaterials = (roofs: THREE.Group[]) => {
      const mats: THREE.MeshStandardMaterial[] = [];
      roofs.forEach((roof) => {
        roof.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = (child as THREE.Mesh).material;
            if (Array.isArray(m)) {
              m.forEach((subM) => {
                if (subM && !mats.includes(subM as THREE.MeshStandardMaterial)) {
                  mats.push(subM as THREE.MeshStandardMaterial);
                }
              });
            } else if (m && !mats.includes(m as THREE.MeshStandardMaterial)) {
              mats.push(m as THREE.MeshStandardMaterial);
            }
          }
        });
      });
      return mats;
    };

    const sanctuaryRoofMats = collectRoofMaterials(sanctuaryRoofsRef.current);
    const meditationRoofMats = collectRoofMaterials(meditationRoofsRef.current);
    const libraryRoofMats = collectRoofMaterials(libraryRoofsRef.current);
    const bellRoofMats = collectRoofMaterials(bellRoofsRef.current);

    let sanctuaryRoofOpacity = 1.0;
    let meditationRoofOpacity = 1.0;
    let libraryRoofOpacity = 1.0;
    let bellRoofOpacity = 1.0;

    const updateRoofOpacity = (mats: THREE.MeshStandardMaterial[], cur: number, target: number) => {
      if (Math.abs(cur - target) < 0.005) {
        if (target === 1.0 && cur !== 1.0) {
          for (let i = 0; i < mats.length; i++) {
            mats[i].opacity = 1.0;
            mats[i].transparent = false;
            mats[i].depthWrite = true;
          }
          return 1.0;
        }
        return cur;
      }
      const next = cur + (target - cur) * 0.18;
      const trans = next < 0.995;
      for (let i = 0; i < mats.length; i++) {
        mats[i].transparent = trans;
        mats[i].opacity = next;
        mats[i].depthWrite = !trans;
      }
      return next;
    };

    // Pre-allocate Zero-Allocation Lotus Footstep Mesh Pool (24 reusable items)
    const footstepGeo = new THREE.CircleGeometry(0.48, 8);
    footstepGeo.rotateX(-Math.PI / 2);
    const footstepPool: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; life: number; active: boolean }[] = [];
    for (let fpi = 0; fpi < 24; fpi++) {
      const fMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const fMesh = new THREE.Mesh(footstepGeo, fMat);
      fMesh.visible = false;
      scene.add(fMesh);
      footstepPool.push({ mesh: fMesh, mat: fMat, life: 0, active: false });
    }
    footstepPoolRef.current = footstepPool;
    let nextFootstepIdx = 0;

    const spawnPooledFootstep = (x: number, y: number, z: number) => {
      const pool = footstepPoolRef.current;
      if (pool.length === 0) return;
      const item = pool[nextFootstepIdx];
      nextFootstepIdx = (nextFootstepIdx + 1) % pool.length;
      item.mesh.position.set(x, y + 0.04, z);
      item.mesh.visible = true;
      item.life = 60;
      item.mat.opacity = 0.9;
      item.active = true;
    };

    let stepCount = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      stepCount++;
      const delta = Math.min(clock.getDelta(), 0.05);

      // Floating spirit particles hover (throttled to every 2 frames for GPU efficiency)
      if (spiritParticlesRef.current && stepCount % 2 === 0) {
        const sArr = spiritParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 100; i++) {
          sArr[i * 3 + 1] += Math.sin(stepCount * 0.03 + i) * 0.030;
          sArr[i * 3] += Math.cos(stepCount * 0.02 + i) * 0.024;
        }
        spiritParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Check Directional Keyboard / D-Pad Movement Inputs
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
        const curVel = currentVelocityRef.current;
        const targetSpeed = isSprintingRef.current ? SPRINT_SPEED : BASE_SPEED;

        // Calculate Target Velocity (Camera-Relative for Manual, or Direct for Click-to-Move)
        let targetVx = 0;
        let targetVz = 0;
        let hasTargetInput = false;

        if (isManualMoving) {
          hasTargetInput = true;
          // Camera-Relative Movement Direction
          const yaw = cameraYawRef.current;
          const forwardX = -Math.sin(yaw);
          const forwardZ = -Math.cos(yaw);
          const rightX = Math.cos(yaw);
          const rightZ = -Math.sin(yaw);

          const moveX = forwardX * forwardInput + rightX * strafeInput;
          const moveZ = forwardZ * forwardInput + rightZ * strafeInput;
          const len = Math.hypot(moveX, moveZ);

          if (len > 0.001) {
            targetVx = (moveX / len) * targetSpeed;
            targetVz = (moveZ / len) * targetSpeed;
          }
        } else if (targetPosRef.current.active) {
          const dx = targetPosRef.current.x - currentP.x;
          const dz = targetPosRef.current.z - currentP.z;
          const dist = Math.hypot(dx, dz);

          if (dist > CLICK_ARRIVE_DIST) {
            hasTargetInput = true;
            // Arrival deceleration: smooth ease-out within 1.2m
            const arriveFactor = Math.min(1.0, dist / 1.2);
            const clickSpeed = targetSpeed * Math.max(0.35, arriveFactor);
            targetVx = (dx / dist) * clickSpeed;
            targetVz = (dz / dist) * clickSpeed;
          } else {
            // Arrived at current target position
            if (tourNavQueueRef.current.length > 0) {
              const nextWp = tourNavQueueRef.current.shift()!;
              const targetY = nextWp.y ?? getTerrainFloorElevation(nextWp.x, nextWp.z, currentP.y);
              setTargetPos(nextWp.x, targetY, nextWp.z);
            } else {
              // Arrived cleanly at final scenic viewpoint!
              clearTargetPos();
              if (destinationMarkerRef.current) {
                destinationMarkerRef.current.visible = false;
              }

              const currentZone = TEMPLE_ZONES[tourIndexRef.current];
              if (currentZone) {
                // 1. Cinematic Camera Framing
                if (currentZone.camera) {
                  cameraYawRef.current = currentZone.camera.yaw;
                  cameraPitchRef.current = currentZone.camera.pitch;
                  cameraDistRef.current = currentZone.camera.dist;
                  if (currentZone.camera.mode && currentZone.camera.mode !== cameraModeRef.current) {
                    cameraModeRef.current = currentZone.camera.mode;
                    useZenBridge.getState().setCameraMode(currentZone.camera.mode);
                  }
                }

                // 2. Character Pose & Orientation
                if (currentZone.tourAction) {
                  monkPoseRef.current = currentZone.tourAction;
                  useZenBridge.getState().setMonkPose(currentZone.tourAction);
                }
                if (monkGroupRef.current && currentZone.facingAngle !== undefined) {
                  monkGroupRef.current.rotation.y = currentZone.facingAngle;
                }

                // 3. Atmospheric Audio (Tắt âm ting ting / chuông khi di chuyển đến điểm chỉ định)
                if (currentZone.tourSound === 'bowl') {
                  soundEngine.playSingingBowl();
                } else if (currentZone.tourSound === 'woodfish') {
                  soundEngine.playWoodenFish();
                } else if (currentZone.tourSound === 'tea') {
                  soundEngine.playTeaPour();
                }
                // 'chime' (chuông gió ting ting) và 'bell' đã được tắt khi đến điểm chỉ định theo yêu cầu

                if (currentZone.actionKey === 'NIGHT') {
                  setIsNightMode(true);
                }

                useZenBridge.getState().setCurrentZone(currentZone);
                useZenBridge.getState().setZoneBanner(currentZone);
              }

              if (isTourPlayingRef.current && tourWaitRef.current === 0) {
                tourWaitRef.current = 240; // 4 seconds of peaceful contemplation
              }
            }
          }
        }

        // Exponential Velocity Acceleration & Rapid Braking Deceleration (Zero-Allocation)
        const accelRate = hasTargetInput ? ACCEL_RATE : BRAKE_RATE;
        const blend = 1 - Math.exp(-accelRate * delta);
        curVel.x += (targetVx - curVel.x) * blend;
        curVel.z += (targetVz - curVel.z) * blend;

        let currentSpeed = Math.hypot(curVel.x, curVel.z);
        if (!hasTargetInput && currentSpeed < STOP_THRESHOLD) {
          curVel.x = 0;
          curVel.z = 0;
          currentSpeed = 0;
        }

        const isCurrentlyWalking = currentSpeed > STOP_THRESHOLD;

        if (isCurrentlyWalking) {
          if (monkPoseRef.current !== 'STAND') {
            monkPoseRef.current = 'STAND';
            useZenBridge.getState().setMonkPose('STAND');
            soundEngine.stopWoodenFishRhythm();
            stopAbbotVoice();
          }
          isWalkingStateRef.current = true;

          // Attempt movement displacement
          const dispX = curVel.x * delta;
          const dispZ = curVel.z * delta;
          const nextX = currentP.x + dispX;
          const nextZ = currentP.z + dispZ;

          // Resolve Collision with World Colliders
          const resolved = resolveMonkCollision(nextX, currentP.y, nextZ);
          const actualMovedX = resolved.x - currentP.x;
          const actualMovedZ = resolved.z - currentP.z;
          const actualMovedDist = Math.hypot(actualMovedX, actualMovedZ);

          currentP.x = resolved.x;
          currentP.z = resolved.z;

          // Tangential Wall Sliding: project remaining velocity onto actual free movement vector
          const attemptedDist = Math.hypot(dispX, dispZ);
          if (attemptedDist > 0.0001 && actualMovedDist < attemptedDist * 0.95) {
            if (actualMovedDist > 0.0005) {
              const nx = actualMovedX / actualMovedDist;
              const nz = actualMovedZ / actualMovedDist;
              const dot = curVel.x * nx + curVel.z * nz;
              curVel.x = nx * dot;
              curVel.z = nz * dot;
            } else {
              curVel.x = 0;
              curVel.z = 0;
              currentSpeed = 0;
            }

            // Click-to-move stuck prevention
            if (targetPosRef.current.active) {
              stuckCountRef.current = (stuckCountRef.current || 0) + 1;
              if (stuckCountRef.current > 40) {
                clearTargetPos();
                stuckCountRef.current = 0;
                if (destinationMarkerRef.current) {
                  destinationMarkerRef.current.visible = false;
                }
              }
            }
          } else if (targetPosRef.current.active) {
            stuckCountRef.current = 0;
          }

          // Responsive Orientation & Quick Turn Boost (> 140 deg)
          let targetAngle = playerRotationRef.current;
          if (hasTargetInput) {
            if (isManualMoving && (targetVx !== 0 || targetVz !== 0)) {
              targetAngle = Math.atan2(targetVx, targetVz);
            } else if (targetPosRef.current.active) {
              const dx = targetPosRef.current.x - currentP.x;
              const dz = targetPosRef.current.z - currentP.z;
              if (Math.hypot(dx, dz) > 0.01) {
                targetAngle = Math.atan2(dx, dz);
              }
            }
          } else if (currentSpeed > 0.1) {
            targetAngle = Math.atan2(curVel.x, curVel.z);
          }

          playerRotationRef.current = targetAngle;
          let diff = targetAngle - monkGroupRef.current.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;

          // Apply quick turn rate (36.0) for large directional reversal (> 140° = 2.44 rad)
          const turnSpeed = Math.abs(diff) > 2.44 ? QUICK_TURN : TURN_RATE;
          monkGroupRef.current.rotation.y += diff * Math.min(1.0, turnSpeed * delta);

          // Distance-based stride accumulator (STRIDE_STEP_DIST = 0.75m)
          strideAccumulatorRef.current += actualMovedDist;
          if (strideAccumulatorRef.current >= STRIDE_STEP_DIST) {
            strideAccumulatorRef.current -= STRIDE_STEP_DIST;
            spawnPooledFootstep(currentP.x, currentP.y, currentP.z);
          }

          // Limb swing frequency dynamically scaled with actual ground velocity
          if (charActionsRef.current?.walk) {
            const speedRatio = Math.max(0.65, Math.min(2.2, currentSpeed / BASE_SPEED));
            charActionsRef.current.walk.setEffectiveTimeScale(speedRatio * 1.15);
          }
        } else {
          isWalkingStateRef.current = false;
          strideAccumulatorRef.current = 0;
          // IDLE STATE: Keep current facing direction without unwanted cursor drift
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

        // Hoạt ảnh 3D Chibi Rig (Idle / Walk / Sit / Meditation Bow / Incense Bow)
        if (charMixerRef.current && chibiModelLoadedRef.current) {
          let target = 'idle';
          if (monkPoseRef.current === 'INCENSE_BOW') {
            target = 'incenseBow';
          } else if (monkPoseRef.current === 'SIT_EDGE') {
            target = isMeditationBowingRef.current ? 'meditationBow' : 'sit';
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

        // Cập nhật bộ đếm thời gian vái lạy khi ngồi thiền nghe chuông
        if (isMeditationBowingRef.current) {
          meditationBowTimerRef.current--;
          if (meditationBowTimerRef.current <= 0) {
            isMeditationBowingRef.current = false;
          }
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
            let isNearCushion = false;
            for (let ci = 0; ci < SANCTUARY_CUSHIONS.length; ci++) {
              const c = SANCTUARY_CUSHIONS[ci];
              if (Math.hypot(c.x - currentP.x, c.z - currentP.z) < 0.95) {
                isNearCushion = true;
                break;
              }
            }
            currentP.y = isNearCushion ? 3.38 : targetFloorY;
          }
          // Dự phòng procedural bow nếu animation rig chưa tải xong
          if (isMeditationBowingRef.current && !charActionsRef.current.meditationBow) {
            const bowProgress = 1 - Math.abs((meditationBowTimerRef.current - 90) / 90);
            monkGroupRef.current.rotation.x = 0.38 * bowProgress;
          }
        } else {
          monkGroupRef.current.rotation.x = 0;
          monkGroupRef.current.rotation.z = 0;
        }

        monkGroupRef.current.position.set(currentP.x, currentP.y, currentP.z);

        // Xoay nhẹ vầng hào quang phước báu & cập nhật độ sáng theo công đức
        if (meritHaloGroupRef.current) {
          meritHaloGroupRef.current.rotation.z += 0.005;
        }
        if (stepCount % 15 === 0) {
          const curMerit = useGameStore.getState().stats.congDuc;
          if (curMerit !== lastMeritRef.current) {
            lastMeritRef.current = curMerit;
            updateMeritHaloRef.current?.(curMerit, propsRef.current.level);
          }
        }

        // Check Zone Proximity (Zero-Allocation indexed loop)
        let closestZone: TempleZoneInfo | null = null;
        let minDist = 24;

        for (let zi = 0; zi < TEMPLE_ZONES.length; zi++) {
          const zone = TEMPLE_ZONES[zi];
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
            useZenBridge.getState().setCurrentZone(zoneObj);
            useZenBridge.getState().setZoneBanner(zoneObj);

            const actionsList: { title: string; action: () => void; icon: string }[] = [];
            const zKey = zoneObj.actionKey;
            const p = propsRef.current;

            if (zKey === 'GATE') {
              actionsList.push({ title: 'Cứu Tế Bát Cháo Nghĩa Tình', action: p.onOpenCharity, icon: '🍲' });
            } else if (zKey === 'COURTYARD') {
              actionsList.push({ title: 'Quét Lá Đa Chánh Niệm', action: p.onOpenSweeping, icon: '🧹' });
              actionsList.push({
                title: 'Trò Chuyện Với Chú Tiểu Tuệ Tâm',
                action: () => {
                  p.onAddMerit(15, 50, 40, '🙏 Đàm Đạo Cùng Chú Tiểu Tuệ Tâm');
                  useZenBridge.getState().setTeaNpcDialogue({
                    speaker: 'Chú Tiểu Tuệ Tâm',
                    role: 'Thị Giả Chánh Điện • Tuệ Tâm',
                    avatar: '🧹',
                    text: 'A Di Đà Phật! Đệ tử đang quét dọn lá đa rụng trước sân Chánh Điện để giữ gìn cảnh chùa thanh tịnh.\n\nSư Phụ thường dạy: "Quét sạch bụi trần, tâm tự an". Kính chúc thí chủ thân tâm an lạc!',
                    gatha: '📜 Kệ Quét Lá:\n"Quét sân sớm mai thanh tịnh lòng,\nLá đa rơi rụng cuốn trôi dòng.\nMỗi nhát chổi đưa tâm chánh niệm,\nBụi trần dứt sạch, tánh chân không."'
                  });
                  speakTueTamVoice(undefined, 'GREETING', {
                    onStart: () => useZenBridge.getState().setTueTamVoice(true, 0),
                    onEnd: () => useZenBridge.getState().setTueTamVoice(false, 100),
                    onTimeUpdate: (cur, dur) => {
                      const pct = dur > 0 ? (cur / dur) * 100 : 0;
                      useZenBridge.getState().setTueTamVoice(true, pct);
                    }
                  });
                },
                icon: '🙏'
              });
              actionsList.push({ title: 'Thắp Nén Hương Lòng', action: () => p.onAddMerit(10, 50, 40, 'Thắp Hương Tam Bảo'), icon: '🪔' });
            } else if (zKey === 'POND') {
              actionsList.push({
                title: 'Chiêm Bái Chùa Một Cột',
                action: handleChiemBaiChuaMotCot,
                icon: '🪷'
              });
              actionsList.push({
                title: 'Dâng Hương Cầu An Hồ Sen',
                action: handleDangHuongHoSen,
                icon: '🪔'
              });
              actionsList.push({
                title: 'Thả Hoa Đăng Cầu Nguyện',
                action: handleOpenFloatingLanternModal,
                icon: '🏮'
              });
              actionsList.push({
                title: 'Tọa Thiền Bên Hồ Sen',
                action: handleToaThienHoSen,
                icon: '🧘'
              });
              actionsList.push({
                title: 'Rải Mồi Đàn Cá Koi',
                action: handleFeedKoiFish,
                icon: '🐟'
              });
              actionsList.push({
                title: 'Hiên Trà Thưởng Sen',
                action: handleHienTraThuongSen,
                icon: '🍵'
              });
              actionsList.push({
                title: 'Đứng Dậy Bước Đi',
                action: handleDungDayBuocDi,
                icon: '🚶'
              });
            } else if (zKey === 'TOWER') {
              actionsList.push({ title: 'Chiêm Bái Bảo Tháp', action: () => p.onAddMerit(25, 50, 40, 'Chiêm Bái Bảo Tháp'), icon: '🏯' });
            } else if (zKey === 'BELL') {
              actionsList.push({ title: 'Thỉnh Đại Hồng Chung', action: handleRingBell, icon: '🔔' });
              actionsList.push({ title: 'Đàm Đạo với Chú Tiểu', action: handleTalkToMonk, icon: '🙏' });
              actionsList.push({
                title: isAutoBellActiveRef.current ? 'Tắt Gõ Chuông Tự Động' : 'Bật Gõ Chuông Tự Động',
                action: toggleAutoBell,
                icon: isAutoBellActiveRef.current ? '⏸️' : '▶️'
              });
            } else if (zKey === 'CORRIDOR') {
              actionsList.push({ title: 'Kinh Hành Chánh Niệm', action: () => p.onAddMerit(15, 50, 40, 'Kinh Hành'), icon: '🏮' });
              actionsList.push({
                title: 'Đồng Hành Cùng Chú Tiểu Tuệ Minh',
                action: () => {
                  soundEngine.playWindChime();
                  p.onAddMerit(20, 50, 40, '🏮 Kinh Hành Cùng Chú Tiểu Tuệ Minh');
                  useZenBridge.getState().setTeaNpcDialogue({
                    speaker: 'Chú Tiểu Tuệ Minh',
                    role: 'Hành Giả Kinh Hành • Tuệ Minh',
                    avatar: '🏮',
                    text: 'Nam Mô Bổn Sư Thích Ca Mâu Ni Phật! Từng bước chân đi trên hành lang là từng bước an trú vào hiện tại.\n\nBước chân chạm đất, lòng thanh thản. Mời thí chủ cùng kinh hành niệm Phật, xua tan mọi âu lo muộn phiền.',
                    gatha: '📜 Kệ Kinh Hành:\n"Từng bước thong dong giữa đất trời,\nBồ đề tràng hạt niệm không ngơi.\nThân tâm lắng đọng miền an lạc,\nÁnh đạo soi đường rạng muôn nơi."'
                  });
                },
                icon: '📿'
              });
            } else if (zKey === 'SANCTUARY') {
              actionsList.push({ title: 'Bạch Sư Phụ Trụ Trì', action: handleTalkToAbbot, icon: '🙏' });
              actionsList.push({ title: 'Xin Xăm Xin Lộc', action: handleXinXam, icon: '🧧' });
              actionsList.push({ title: 'Khóa Lễ Thính Pháp', action: handleStartDharmaChantSession, icon: '📜' });
              actionsList.push({ title: 'Tọa Thiền Nghe Pháp', action: handleSitMeditationLecture, icon: '🧘' });
              actionsList.push({ title: 'Thắp Nhang Trầm Cầu An', action: handleLightIncenseSanctuary, icon: '🕯️' });
              actionsList.push({ title: 'Lau Chùi Bàn Thờ Phật', action: p.onOpenAltarCleaning, icon: '✨' });
              if (monkPoseRef.current !== 'STAND') {
                actionsList.push({
                  title: 'Đứng Dậy Bước Đi',
                  action: () => {
                    monkPoseRef.current = 'STAND';
                    useZenBridge.getState().setMonkPose('STAND');
                    soundEngine.stopWoodenFishRhythm();
                    stopAbbotVoice();
                  },
                  icon: '🚶'
                });
              }
            } else if (zKey === 'MEDITATION') {
              actionsList.push({ title: 'Thưởng Trà Chánh Niệm', action: handleThuongTraChanhNiem, icon: '🍵' });
              actionsList.push({ title: 'Đàm Đạo Trà Thiền', action: handleTalkToTeaMaster, icon: '🙏' });
              actionsList.push({ title: 'Xin Chén Trà Sen', action: handleXinChenTraSen, icon: '🫖' });
              actionsList.push({ title: 'Nghệ Thuật Trà Đạo', action: () => p.onOpenTeaHouse(), icon: '🌸' });
              actionsList.push({ title: 'Tọa Thiền Nguyệt Môn', action: () => p.onAddMerit(30, 50, 40, 'Tọa Thiền Chánh Niệm'), icon: '🧘' });
              if (monkPoseRef.current !== 'STAND') {
                actionsList.push({
                  title: 'Đứng Dậy Bước Đi',
                  action: () => {
                    monkPoseRef.current = 'STAND';
                    useZenBridge.getState().setMonkPose('STAND');
                  },
                  icon: '🚶'
                });
              }
            } else if (zKey === 'LIBRARY') {
              actionsList.push({ title: 'Đọc Kinh Bát Nhã & Pháp Cú', action: p.onOpenDharma, icon: '📜' });
            } else if (zKey === 'BACK_GARDEN') {
              actionsList.push({ title: 'Chẻ Củi Bếp Chùa', action: p.onOpenWoodChopping, icon: '🪓' });
              actionsList.push({ title: 'Gánh Nước Giếng Ngọc', action: p.onOpenWaterCarrying, icon: '🪣' });
            } else if (zKey === 'BALCONY') {
              actionsList.push({ title: 'Ngắm Cảnh Mây Núi Lầu Cao', action: () => p.onAddMerit(20, 50, 40, 'An Nhiên Vọng Cảnh'), icon: '🪟' });
            }
            useZenBridge.getState().setNearInteractions(actionsList);
          }
        } else if (currentZoneIdRef.current !== '') {
          currentZoneIdRef.current = '';
          useZenBridge.getState().setNearInteractions([]);
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
        else if (inMeditation) buildingName = 'Thiền Trà Quán (Hiên Trà Nguyệt Môn)';
        else if (inLibrary) buildingName = 'Tàng Kinh Các (Phòng Kinh Sách)';
        else if (inBell) buildingName = 'Nội Thất Lầu Chuông';

        if (buildingName !== currentBuildingStateRef.current) {
          currentBuildingStateRef.current = buildingName;
          useZenBridge.getState().setCurrentBuilding(buildingName);
        }

        // Fast optimized roof fading (0 traversal overhead)
        sanctuaryRoofOpacity = updateRoofOpacity(sanctuaryRoofMats, sanctuaryRoofOpacity, inSanctuary ? 0.08 : 1.0);
        meditationRoofOpacity = updateRoofOpacity(meditationRoofMats, meditationRoofOpacity, inMeditation ? 0.08 : 1.0);
        libraryRoofOpacity = updateRoofOpacity(libraryRoofMats, libraryRoofOpacity, inLibrary ? 0.08 : 1.0);
        bellRoofOpacity = updateRoofOpacity(bellRoofMats, bellRoofOpacity, inBell ? 0.08 : 1.0);

        // ==========================================
        // PANORAMIC 3RD-PERSON CAMERA INTERPOLATION (CAN LOOK UP & AROUND)
        // ==========================================
        const dist = cameraDistRef.current;
        const pitch = cameraPitchRef.current; // ranges from -0.92 (looking up at sky/pagoda) to 0.95 (looking down)
        const yaw = cameraYawRef.current;

        if (cameraModeRef.current === 'ON_RAINY_DAYS') {
          // Góc nhìn toàn cảnh từ trên cao chiêm bái Chùa Một Cột & Đầm Sen Linh Chiểu
          const targetCamX = -26.0;
          const targetCamY = 18.5;
          const targetCamZ = 49.5;

          camera.position.x += (targetCamX - camera.position.x) * 0.08;
          camera.position.y += (targetCamY - camera.position.y) * 0.08;
          camera.position.z += (targetCamZ - camera.position.z) * 0.08;

          const lookTargetX = -26.0;
          const lookTargetY = 3.6;
          const lookTargetZ = 34.0;

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

      // Handle Tour Countdown timer (Zero-Allocation targetPos update)
      if (isTourPlayingRef.current && !targetPosRef.current.active && tourWaitRef.current > 0) {
        tourWaitRef.current--;
        if (tourWaitRef.current <= 0) {
          const nextIndex = (tourIndexRef.current + 1) % TEMPLE_ZONES.length;
          startNavigatingToZone(nextIndex, true);
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

      // Lotus Footsteps Fade Out (Zero-Allocation pre-allocated pool update)
      const fPool = footstepPoolRef.current;
      for (let fi = 0; fi < fPool.length; fi++) {
        const foot = fPool[fi];
        if (foot.active) {
          foot.life--;
          foot.mat.opacity = (foot.life / 60) * 0.9;
          if (foot.life <= 0) {
            foot.active = false;
            foot.mesh.visible = false;
          }
        }
      }

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

        // Sóng âm kim quang lan tỏa (Zero-Allocation indexed loop)
        if (ripples) {
          ripples.visible = true;
          const rChildren = ripples.children;
          for (let rIdx = 0; rIdx < rChildren.length; rIdx++) {
            const ring = rChildren[rIdx] as THREE.Mesh;
            const rT = ((cycleFrame - 595 + rIdx * 12) % 45) / 45;
            ring.scale.set(1 + rT * 5.2, 1 + rT * 5.2, 1 + rT * 5.2);
            const mat = ring.material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = Math.max(0, (1 - rT) * 0.85);
          }
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

        // Tương tác động: Khi người chơi lại gần Chánh Điện (< 7.5m), Sư Phụ xoay mặt từ bi nhìn người chơi & chúc phúc
        const distToAbbot = Math.hypot(playerPosRef.current.x - 2.4, playerPosRef.current.z - (-18.8));
        const matH = abbot.halo.material as THREE.MeshBasicMaterial;

        if (distToAbbot < 7.5) {
          const dxA = playerPosRef.current.x - 2.4;
          const dzA = playerPosRef.current.z - (-18.8);
          const targetAngA = Math.atan2(dxA, dzA);
          let diffA = targetAngA - abbot.head.rotation.y;
          while (diffA > Math.PI) diffA -= Math.PI * 2;
          while (diffA < -Math.PI) diffA += Math.PI * 2;
          abbot.head.rotation.y += Math.max(-0.04, Math.min(0.04, diffA * 0.06));

          // Nâng tay ban ấn Vô Úy (Abhaya Mudra) chúc phúc
          abbot.armR.rotation.x = -0.95 + Math.sin(stepCount * 0.04) * 0.04;
          if (matH) matH.opacity = 0.92 + Math.sin(stepCount * 0.06) * 0.08;
        } else {
          abbot.head.rotation.y *= 0.95;
          abbot.head.rotation.x = -0.04 + Math.sin(stepCount * 0.03) * 0.02;
          // Bàn tay phải lần tràng hạt bồ đề 108 hạt
          abbot.armR.rotation.x = -0.65 + Math.sin(stepCount * 0.06) * 0.05;
          abbot.beads.rotation.z = Math.sin(stepCount * 0.06) * 0.10;
          if (matH) matH.opacity = 0.82 + Math.sin(stepCount * 0.04) * 0.14;
        }
      }

      // Khói trầm hương bốc lên nghi ngút từ Đại Đỉnh Hương Đồng (Zero-Allocation loop)
      const smokeList = incenseSmokeParticlesRef.current;
      for (let sIdx = 0; sIdx < smokeList.length; sIdx++) {
        const smoke = smokeList[sIdx];
        smoke.position.y += 0.022;
        smoke.position.x += Math.sin(stepCount * 0.03 + sIdx * 1.2) * 0.006;
        smoke.position.z += Math.cos(stepCount * 0.025 + sIdx * 1.5) * 0.006;
        const progress = Math.max(0, Math.min(1, (smoke.position.y - 1.6) / 3.8));
        smoke.scale.set(1 + progress * 2.8, 1 + progress * 2.8, 1 + progress * 2.8);
        const matS = smoke.material as THREE.MeshBasicMaterial;
        if (matS) matS.opacity = Math.max(0, (1 - progress) * 0.38);
        if (smoke.position.y > 5.4) {
          smoke.position.y = 1.6;
          smoke.position.x = (Math.random() - 0.5) * 0.25;
          smoke.position.z = (Math.random() - 0.5) * 0.25;
        }
      }

      // ══════════════════════════════════════════════════════════════════
      // HOẠT ẢNH THIỀN TRÀ QUÁN (CHÚ TIỂU PHA TRÀ & THỊ GIẢ PHỤC VỤ TRÀ)
      // ══════════════════════════════════════════════════════════════════
      const teaMaster = teaMasterNpcRef.current;
      if (teaMaster) {
        teaMasterRitualFrameRef.current = (teaMasterRitualFrameRef.current + 1) % 1080;
        const rf = teaMasterRitualFrameRef.current;

        // Nhịp thở chánh niệm tĩnh lặng
        teaMaster.torso.position.y = 0.36 + Math.sin(stepCount * 0.03) * 0.006;

        if (rf < 240) {
          // GIAI ĐOẠN 1: NÂNG ẤM ĐỒNG RÓT NƯỚC SÔI VÀO ẤM TỬ SA (0s - 4.0s)
          const p = rf / 240;
          const arc = Math.sin(p * Math.PI);
          // Tay phải với lấy ấm và nhấc lên
          teaMaster.armR.rotation.x = -0.65 + arc * 0.45;
          teaMaster.armR.rotation.z = 0.25 - arc * 0.35;
          // Ấm đồng nhấc lên khỏi bếp lò, di chuyển về phía ấm trà và nghiêng rót
          teaMaster.kettle.position.x = -1.15 + arc * 0.75;
          teaMaster.kettle.position.y = 0.94 + arc * 0.32;
          teaMaster.kettle.position.z = -0.25 + arc * 0.15;
          teaMaster.kettle.rotation.z = arc * 0.42;
          // Đầu nghiêng nhìn chăm chú ấm nước
          teaMaster.head.rotation.x = -0.04 + arc * 0.18;
          teaMaster.head.rotation.y = arc * 0.20;
        } else if (rf < 460) {
          // GIAI ĐOẠN 2: HÃM TRÀ HOA SEN, DÙNG MUỖNG KHUẤY NHẸ & THƯỞNG HƯƠNG (4.0s - 7.6s)
          const p = (rf - 240) / 220;
          teaMaster.kettle.position.set(-1.15, 0.94, -0.25);
          teaMaster.kettle.rotation.z = 0;

          // Tay phải cầm muỗng khuấy nhẹ trà
          teaMaster.armR.rotation.x = -0.55 + Math.sin(p * Math.PI * 4) * 0.12;
          teaMaster.armR.rotation.z = 0.20 + Math.cos(p * Math.PI * 4) * 0.08;
          teaMaster.ladle.rotation.z = Math.sin(p * Math.PI * 4) * 0.25;

          // Hít thở thưởng hương trà sen
          teaMaster.head.rotation.x = -0.08 + Math.sin(p * Math.PI * 2) * 0.10;
          teaMaster.head.rotation.y = Math.sin(p * Math.PI) * 0.05;
        } else if (rf < 700) {
          // GIAI ĐOẠN 3: NÂNG ẤM TỬ SA RÓT SANG CHÉN TỐNG MEN NGỌC (7.6s - 11.6s)
          const p = (rf - 460) / 240;
          const arc = Math.sin(p * Math.PI);

          teaMaster.armR.rotation.x = -0.65 + arc * 0.40;
          teaMaster.armR.rotation.z = 0.25 - arc * 0.20;

          // Ấm trà Tử Sa nâng lên và nghiêng rót vào chén tống
          teaMaster.teapot.position.x = 0.10 + arc * 0.30;
          teaMaster.teapot.position.y = 0.68 + arc * 0.26;
          teaMaster.teapot.position.z = -0.05;
          teaMaster.teapot.rotation.z = arc * 0.48;

          teaMaster.head.rotation.x = 0.02 + arc * 0.15;
          teaMaster.head.rotation.y = -arc * 0.15;
        } else if (rf < 900) {
          // GIAI ĐOẠN 4: NÂNG CHÉN TỐNG RÓT ĐỀU RA 4 CHÉN QUÂN (11.6s - 15.0s)
          const p = (rf - 700) / 200;
          const arc = Math.sin(p * Math.PI);
          teaMaster.teapot.position.set(0.10, 0.68, -0.05);
          teaMaster.teapot.rotation.z = 0;

          teaMaster.armR.rotation.x = -0.70 + arc * 0.35;
          teaMaster.armL.rotation.x = -0.60 + arc * 0.25;

          // Chén tống di chuyển nhẹ nhàng trên 4 chén
          teaMaster.gaiwan.position.x = 0.55 - arc * 0.28;
          teaMaster.gaiwan.position.y = 0.62 + arc * 0.22;
          teaMaster.gaiwan.position.z = -0.05 + Math.sin(p * Math.PI * 2) * 0.18;
          teaMaster.gaiwan.rotation.x = arc * 0.32;

          teaMaster.head.rotation.x = arc * 0.20;
          teaMaster.head.rotation.y = 0;
        } else {
          // GIAI ĐOẠN 5: CUNG KÍNH MỜI TRÀ & XÁ CHÀO KHÁCH (15.0s - 18.0s)
          const p = (rf - 900) / 180;
          const arc = Math.sin(p * Math.PI);
          teaMaster.gaiwan.position.set(0.55, 0.62, -0.05);
          teaMaster.gaiwan.rotation.x = 0;

          // Hai tay mở rộng cung kính dâng mời
          teaMaster.armR.rotation.x = -0.65 + arc * 0.30;
          teaMaster.armR.rotation.z = 0.25 + arc * 0.25;
          teaMaster.armL.rotation.x = -0.65 + arc * 0.30;
          teaMaster.armL.rotation.z = -0.25 - arc * 0.25;

          // Cúi mình xá chào
          teaMaster.torso.rotation.x = arc * 0.16;
          teaMaster.head.rotation.x = arc * 0.25;
        }

        // Khói hơi nước trà thơm bốc lên nghi ngút (Zero-Allocation indexed loop)
        const steamList = teaMaster.steamParticles;
        for (let si = 0; si < steamList.length; si++) {
          const steam = steamList[si];
          steam.position.y += 0.012;
          steam.position.x += Math.sin(stepCount * 0.035 + si * 1.5) * 0.003;
          steam.position.z += Math.cos(stepCount * 0.03 + si * 1.2) * 0.003;
          const sProg = Math.max(0, Math.min(1, (steam.position.y - 1.15) / 1.5));
          steam.scale.set(1 + sProg * 2.2, 1 + sProg * 2.2, 1 + sProg * 2.2);
          const matSt = steam.material as THREE.MeshBasicMaterial;
          if (matSt) matSt.opacity = Math.max(0, (1 - sProg) * 0.40);
          if (steam.position.y > 2.65) {
            steam.position.y = 1.15;
            steam.position.x = -1.15 + (si % 2) * 1.25 + (Math.random() - 0.5) * 0.12;
            steam.position.z = -0.2 + (si % 3) * 0.08 + (Math.random() - 0.5) * 0.12;
          }
        }
      }

      // ──────────────────────────────────────────────────────────────────
      // CHÚ TIỂU PHỤC VỤ TRÀ (TIỂU TRÀ): TUẦN TRA, ĐI LẠI BƯNG KHAY & DÂNG TRÀ
      // ──────────────────────────────────────────────────────────────────
      const teaServer = teaServerNpcRef.current;
      if (teaServer) {
        const patrol = teaServerPatrolRef.current;
        const targetWp = TEA_SERVER_WAYPOINTS[patrol.currentWp];

        const curX = teaServer.group.position.x;
        const curZ = teaServer.group.position.z;
        const dx = targetWp.x - curX;
        const dz = targetWp.z - curZ;
        const dist = Math.hypot(dx, dz);

        if (patrol.waitTimer > 0) {
          // ĐANG DỪNG THỰC HIỆN NGHI THỨC TẠI ĐIỂM DỪNG (BƯNG TRÀ / XÁ CHÀO)
          patrol.waitTimer--;
          // Chân đứng ngay ngắn trên sàn
          teaServer.legL.rotation.x *= 0.82;
          teaServer.legR.rotation.x *= 0.82;

          // Xoay mặt về hướng định sẵn của điểm dừng nếu có
          if (targetWp.facingAngle !== undefined) {
            let diff = targetWp.facingAngle - teaServer.group.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            teaServer.group.rotation.y += diff * 0.06;
          }

          const waitProgress = 1 - (patrol.waitTimer / (targetWp.wait || 1));
          const bow = Math.sin(waitProgress * Math.PI);

          if (targetWp.action === 'SERVE_TABLE_1' || targetWp.action === 'SERVE_TABLE_2') {
            // Cúi mình xá chào & dâng khay trà mời khách
            teaServer.torso.rotation.x = bow * 0.28;
            teaServer.head.rotation.x = 0.08 + bow * 0.32;
            teaServer.tray.position.z = 0.38 + bow * 0.14;
            teaServer.tray.position.y = 0.38 - bow * 0.06;
          } else if (targetWp.action === 'GREET_ENTRANCE') {
            // Đứng tại bậc tam cấp nghinh đón khách thập phương
            teaServer.torso.rotation.x = bow * 0.18;
            teaServer.head.rotation.x = 0.05 + bow * 0.22;
            teaServer.head.rotation.y = Math.sin(stepCount * 0.03) * 0.12;
            teaServer.tray.position.z = 0.38;
            teaServer.tray.position.y = 0.38;
          } else if (targetWp.action === 'WAIT_TEA') {
            // Đứng bên bàn Sư Huynh chờ lấy ấm trà mới
            teaServer.torso.rotation.x = bow * 0.14;
            teaServer.head.rotation.x = 0.12 + bow * 0.15;
            teaServer.tray.position.z = 0.38;
          }
          teaServer.torso.position.y = 0.56 + Math.sin(stepCount * 0.03) * 0.005;
        } else if (dist < 0.12) {
          // ĐÃ ĐẾN WAYPOINT: BẮT ĐẦU CHỜ NẾU CÓ THỜI GIAN CHỜ
          if (targetWp.wait > 0) {
            patrol.waitTimer = targetWp.wait;
          }
          patrol.currentWp = (patrol.currentWp + 1) % TEA_SERVER_WAYPOINTS.length;
        } else {
          // ĐANG BƯỚC ĐI TỚI WAYPOINT TIẾP THEO
          patrol.walkCycle += 0.13;
          const moveSpeed = 0.022; // ~1.32 m/s

          // Xoay hướng mặt theo hướng di chuyển
          const moveAngle = Math.atan2(dx, dz);
          let diff = moveAngle - teaServer.group.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          teaServer.group.rotation.y += diff * 0.10;

          // Di chuyển vị trí
          teaServer.group.position.x += (dx / dist) * moveSpeed;
          teaServer.group.position.z += (dz / dist) * moveSpeed;

          // Hoạt ảnh bước chân bipedal đong đưa
          teaServer.legL.rotation.x = Math.sin(patrol.walkCycle) * 0.46;
          teaServer.legR.rotation.x = -Math.sin(patrol.walkCycle) * 0.46;

          // Thân người nhấp nhô nhịp nhàng theo bước chân
          teaServer.torso.position.y = 0.56 + Math.abs(Math.sin(patrol.walkCycle * 2)) * 0.024;
          teaServer.torso.rotation.z = Math.sin(patrol.walkCycle) * 0.025;
          teaServer.torso.rotation.x = 0.04;
          teaServer.head.rotation.x = 0.04 + Math.sin(patrol.walkCycle * 2) * 0.015;

          // Khay trà giữ thăng bằng phẳng khi đi
          teaServer.tray.position.y = 0.38 + Math.abs(Math.sin(patrol.walkCycle * 2)) * 0.012;
          teaServer.tray.position.z = 0.38;
        }
      }

      // ──────────────────────────────────────────────────────────────────
      // CHÚ TIỂU QUÉT SÂN "TUỆ TÂM" - QUÉT LÁ ĐA & TUẦN TRA SÂN CHÙA
      // ──────────────────────────────────────────────────────────────────
      const sweeper = sweeperNpcRef.current;
      if (sweeper) {
        const sw = sweeperStateRef.current;
        const targetWp = SWEEPER_WAYPOINTS[sw.currentWp];
        const curX = sweeper.group.position.x;
        const curZ = sweeper.group.position.z;
        const dx = targetWp.x - curX;
        const dz = targetWp.z - curZ;
        const dist = Math.hypot(dx, dz);

        if (sw.waitTimer > 0) {
          // Nghỉ tay quét lá, lau trán hoặc ngắm cảnh sân chùa
          sw.waitTimer--;
          sweeper.legL.rotation.x *= 0.82;
          sweeper.legR.rotation.x *= 0.82;

          sweeper.torso.position.y = 0.52 + Math.sin(stepCount * 0.03) * 0.005;
          sweeper.torso.rotation.x = 0.06;
          // Tay phải chống nhẹ cán chổi, tay trái đưa lên lau trán
          const p = 1 - (sw.waitTimer / (targetWp.wait || 1));
          const wipe = Math.sin(p * Math.PI);
          sweeper.armL.rotation.x = -0.65 - wipe * 0.85;
          sweeper.armL.rotation.y = 0.45 + wipe * 0.30;
          sweeper.head.rotation.y = Math.sin(stepCount * 0.02) * 0.20;
          sweeper.head.rotation.x = -0.05 + wipe * 0.10;
        } else if (dist < 0.15) {
          if (targetWp.wait > 0) {
            sw.waitTimer = targetWp.wait;
          }
          sw.currentWp = (sw.currentWp + 1) % SWEEPER_WAYPOINTS.length;
        } else {
          // Vừa bước đi vừa quét lá
          sw.walkCycle += 0.09;
          sw.sweepAngle += 0.12;
          const moveSpeed = 0.015;

          const moveAngle = Math.atan2(dx, dz);
          let diff = moveAngle - sweeper.group.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          sweeper.group.rotation.y += diff * 0.08;

          sweeper.group.position.x += (dx / dist) * moveSpeed;
          sweeper.group.position.z += (dz / dist) * moveSpeed;

          // Bước chân
          sweeper.legL.rotation.x = Math.sin(sw.walkCycle) * 0.38;
          sweeper.legR.rotation.x = -Math.sin(sw.walkCycle) * 0.38;

          sweeper.torso.position.y = 0.52 + Math.abs(Math.sin(sw.walkCycle * 2)) * 0.018;

          // Động tác quét chổi tre qua lại uyển chuyển
          const sweepSin = Math.sin(sw.sweepAngle);
          sweeper.armR.rotation.y = -0.25 + sweepSin * 0.35;
          sweeper.armL.rotation.y = 0.45 + sweepSin * 0.35;
          sweeper.broom.rotation.y = sweepSin * 0.40;
          sweeper.torso.rotation.y = sweepSin * 0.12;
          sweeper.head.rotation.y = sweepSin * 0.10;
        }
      }

      // ──────────────────────────────────────────────────────────────────
      // CHÚ TIỂU KINH HÀNH "TUỆ MINH" - BƯỚC ĐI CHÁNH NIỆN DỌC HÀNH LANG GỖ LIM
      // ──────────────────────────────────────────────────────────────────
      const walkingMonk = walkingMonkNpcRef.current;
      if (walkingMonk) {
        const wm = walkingMonkStateRef.current;
        wm.walkCycle += 0.06; // Kinh hành bước chân rất chậm và chánh niệm
        const moveSpeed = 0.014;

        // Di chuyển qua lại dọc hành lang gỗ (Z từ -11.5 đến +11.5)
        walkingMonk.group.position.z += wm.direction * moveSpeed;

        if (walkingMonk.group.position.z > 11.5) {
          wm.direction = -1;
        } else if (walkingMonk.group.position.z < -11.5) {
          wm.direction = 1;
        }

        // Xoay hướng mặt mượt mà
        const targetRot = wm.direction > 0 ? 0 : Math.PI;
        let diff = targetRot - walkingMonk.group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        walkingMonk.group.rotation.y += diff * 0.05;

        // Bước đi khoan thai
        walkingMonk.legL.rotation.x = Math.sin(wm.walkCycle) * 0.32;
        walkingMonk.legR.rotation.x = -Math.sin(wm.walkCycle) * 0.32;

        walkingMonk.torso.position.y = 0.52 + Math.abs(Math.sin(wm.walkCycle * 2)) * 0.012;
        // Tràng hạt bồ đề khẽ lắc nhẹ theo nhịp lần hạt
        walkingMonk.beads.rotation.z = Math.sin(wm.walkCycle) * 0.08;
        // Đầu hơi cúi chánh niệm
        walkingMonk.head.rotation.x = 0.18 + Math.sin(wm.walkCycle * 2) * 0.02;
      }

      // Update User Floating Flower Lanterns (Hoa đăng người chơi thả trôi trên hồ - Zero-Allocation)
      const lanternList = userLanternsRef.current;
      for (let lIdx = 0; lIdx < lanternList.length; lIdx++) {
        const lantern = lanternList[lIdx];
        lantern.mesh.position.z += lantern.speed;
        lantern.mesh.position.y = 0.56 + Math.sin(stepCount * 0.05 + lantern.mesh.position.x * 2) * 0.015;
        lantern.mesh.rotation.y += 0.005;
      }

      // Swimming Koi Fish & Feeding Physics: distance-culled (only compute when within 85m of pond center (-26, 36))
      const distToPond = Math.hypot(playerPosRef.current.x - (-26), playerPosRef.current.z - 36);
      if (distToPond < 85) {
        const isFeeding = koiFeedingTimerRef.current > 0;
        if (isFeeding) {
          koiFeedingTimerRef.current--;
        }

        // Cập nhật hạt thức ăn rơi và gợn sóng nước
        const pellets = foodPelletsRef.current;
        for (let pIdx = pellets.length - 1; pIdx >= 0; pIdx--) {
          const pellet = pellets[pIdx];
          if (pellet.posY > pellet.targetY) {
            pellet.posY += pellet.velY;
            pellet.velY -= 0.003;
            pellet.mesh.position.y = pellet.posY;
            pellet.mesh.rotation.x += 0.08;
            pellet.mesh.rotation.y += 0.12;

            if (pellet.posY <= pellet.targetY) {
              pellet.posY = pellet.targetY;
              pellet.mesh.position.y = pellet.targetY;

              if (pondGroupRef.current) {
                const ripMesh = new THREE.Mesh(
                  new THREE.RingGeometry(0.12, 0.18, 20),
                  new THREE.MeshBasicMaterial({
                    color: 0x5eead4,
                    transparent: true,
                    opacity: 0.75,
                    side: THREE.DoubleSide,
                  })
                );
                ripMesh.rotateX(-Math.PI / 2);
                ripMesh.position.set(pellet.posX, 0.552, pellet.posZ);
                pondGroupRef.current.add(ripMesh);
                waterRipplesRef.current.push({
                  mesh: ripMesh,
                  posX: pellet.posX,
                  posZ: pellet.posZ,
                  scale: 1.0,
                  maxScale: 3.2 + Math.random() * 1.2,
                  opacity: 0.75,
                });
              }
            }
          } else {
            pellet.life--;
            pellet.mesh.position.y = 0.55 + Math.sin(stepCount * 0.08 + pIdx) * 0.008;
            if (pellet.life <= 0) {
              if (pondGroupRef.current) {
                pondGroupRef.current.remove(pellet.mesh);
              }
              pellet.mesh.geometry.dispose();
              pellets.splice(pIdx, 1);
            }
          }
        }

        // Cập nhật vòng sóng nước loang dần và mờ dần
        const ripples = waterRipplesRef.current;
        for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
          const rip = ripples[rIdx];
          rip.scale += 0.045;
          rip.opacity -= 0.016;
          rip.mesh.scale.set(rip.scale, rip.scale, 1);
          (rip.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, rip.opacity);
          if (rip.opacity <= 0 || rip.scale >= rip.maxScale) {
            if (pondGroupRef.current) {
              pondGroupRef.current.remove(rip.mesh);
            }
            rip.mesh.geometry.dispose();
            (rip.mesh.material as THREE.Material).dispose();
            ripples.splice(rIdx, 1);
          }
        }

        // Cập nhật đàn cá Koi 16 con (Roam & Feeding Frenzy AI)
        const koiList = koiFishListRef.current;
        for (let kIdx = 0; kIdx < koiList.length; kIdx++) {
          const koi = koiList[kIdx];
          koi.angle += koi.speed * (isFeeding ? 1.8 : 1.0);

          let targetRadius = koi.baseRadius || koi.radius;
          if (isFeeding) {
            targetRadius = 2.8 + (kIdx % 4) * 0.65;
          }
          koi.radius += (targetRadius - koi.radius) * 0.05;

          koi.mesh.position.x = Math.cos(koi.angle) * koi.radius;
          koi.mesh.position.z = Math.sin(koi.angle) * koi.radius;
          koi.mesh.rotation.y = -koi.angle + Math.PI / 2;

          const targetY = isFeeding ? 0.51 : 0.46;
          koi.mesh.position.y = targetY + Math.sin(stepCount * (isFeeding ? 0.16 : 0.04) + koi.angle * 2 + kIdx) * 0.025;

          const tailG = koi.mesh.userData.tailMesh as THREE.Group | undefined;
          if (tailG) {
            tailG.rotation.y = Math.sin(stepCount * (isFeeding ? 0.35 : 0.16) + kIdx * 1.4) * (isFeeding ? 0.75 : 0.42);
          }
        }
      }

            // Bamboo Leaves Sway (Zero-Allocation loop)
      const bambooList = bambooLeavesRef.current;
      for (let bIdx = 0; bIdx < bambooList.length; bIdx++) {
        bambooList[bIdx].rotation.z = Math.sin(stepCount * 0.02 + bIdx) * 0.05;
      }

      // Vintage Fan Rotating Blades (On Rainy Days Deck)
      if (fanBladesRef.current) {
        fanBladesRef.current.rotation.z += 0.28;
      }

            // Incense Smoke (throttled to every 2 frames for GPU buffer optimization)
      if (smokeParticlesRef.current && stepCount % 2 === 0) {
        const posAttr = smokeParticlesRef.current.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let s = 0; s < 70; s++) {
          arr[s * 3 + 1] += 0.08;
          arr[s * 3] += Math.sin(stepCount * 0.04 + s) * 0.024;
          if (arr[s * 3 + 1] > 16) {
            arr[s * 3 + 1] = 3.5;
            arr[s * 3] = (Math.random() - 0.5) * 1.4;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Kitchen Chimney Smoke
      if (kitchenSmokeRef.current && stepCount % 2 === 0) {
        const kPosAttr = kitchenSmokeRef.current.geometry.attributes.position;
        const kArr = kPosAttr.array as Float32Array;
        for (let s = 0; s < 45; s++) {
          kArr[s * 3 + 1] += 0.07;
          kArr[s * 3] += Math.sin(stepCount * 0.03 + s) * 0.018;
          if (kArr[s * 3 + 1] > 14.0) {
            kArr[s * 3 + 1] = 7.2;
            kArr[s * 3] = -12.7 + (Math.random() - 0.5) * 0.8;
          }
        }
        kPosAttr.needsUpdate = true;
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

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
      } else {
        clock.getDelta(); // Reset clock delta on tab wake to avoid physics time jump
        if (!animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(animate);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubBell();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disposeSharedTextures();
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
      unregisterBridge();
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-stone-950 font-sans">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full block cursor-crosshair active:cursor-grabbing"
      />

      {/* Decoupled React-WebGL Bridge Overlays (Selective re-renders, 0 canvas rebuilds) */}
      <Zen3DOverlays
        onAddMerit={propsRef.current.onAddMerit}
        onOpenDharma={propsRef.current.onOpenDharma}
        onOpenTeaHouse={propsRef.current.onOpenTeaHouse}
        templeZones={TEMPLE_ZONES}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode((prev) => !prev)}
      />
    </div>
  );
};

export const Zen3DWorld = memo(Zen3DWorldComponent);
