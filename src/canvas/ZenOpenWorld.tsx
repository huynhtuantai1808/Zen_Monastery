import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundEngine } from '../services/audioEngine';
import type { CharacterAppearance, RobeColorType } from '../types/game';
import {
  Compass,
  Footprints,
  X
} from 'lucide-react';

interface ZenOpenWorldProps {
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
  onOpenCharModal: () => void;
  onAddMerit: (amount: number, x: number, y: number, label?: string) => void;
  spendStamina: (amount: number) => boolean;
}

interface KoiFish {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  angle: number;
  speed: number;
  color: string;
  size: number;
  wiggleOffset: number;
}

interface WorldParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  alpha: number;
  color: string;
  type: 'leaf' | 'petal' | 'firefly' | 'incense' | 'ripple';
}

interface WorldHotspot {
  id: string;
  x: number;
  y: number;
  radius: number;
  icon: string;
  title: string;
  desc: string;
  action: () => void;
}

const WORLD_WIDTH = 2600;
const WORLD_HEIGHT = 800;

const ROBE_COLORS: Record<RobeColorType, { male: string; female: string; maleShade: string; femaleShade: string; pants: string; pantsShade: string }> = {
  lam: { male: '#8ea3b7', female: '#8ea3b7', maleShade: '#72879c', femaleShade: '#72879c', pants: '#7a8f9f', pantsShade: '#627685' },
  nau: { male: '#a86a45', female: '#a86a45', maleShade: '#8b4e2b', femaleShade: '#8b4e2b', pants: '#935632', pantsShade: '#703a19' },
  xam: { male: '#94a3b8', female: '#94a3b8', maleShade: '#64748b', femaleShade: '#64748b', pants: '#788494', pantsShade: '#576271' },
  bach: { male: '#f8fafc', female: '#f8fafc', maleShade: '#e2e8f0', femaleShade: '#e2e8f0', pants: '#e2e8f0', pantsShade: '#cbd5e1' },
};

export const ZenOpenWorld: React.FC<ZenOpenWorldProps> = ({
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
  onOpenCharModal: _onOpenCharModal,
  onAddMerit,
  spendStamina,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Player position in world coordinates (starts in Courtyard)
  const [playerX, setPlayerX] = useState<number>(680);
  const [playerY, setPlayerY] = useState<number>(620);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [nearHotspot, setNearHotspot] = useState<WorldHotspot | null>(null);

  // Camera scroll offset
  const cameraXRef = useRef<number>(680 - 450);

  // Responsive screen & viewport detection
  const [screenSize, setScreenSize] = useState<{ width: number; height: number; isMobile: boolean }>({
    width: 1200,
    height: 700,
    isMobile: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(400, Math.floor(rect.height));

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      setScreenSize({ width: w, height: h, isMobile: w < 640 });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation states
  const [bellRipples, setBellRipples] = useState<number[]>([]);
  const [bambooDropAngle, setBambooDropAngle] = useState<number>(0);
  const [showControlsHint, setShowControlsHint] = useState<boolean>(true);
  const [activeZoneName, setActiveZoneName] = useState<string>('Sân Chùa & Gác Chuông');

  // Input tracking
  const keysDown = useRef<Record<string, boolean>>({});

  // Dynamic simulation objects
  const koiFish = useRef<KoiFish[]>([
    { x: 1550, y: 640, targetX: 1600, targetY: 650, angle: 0, speed: 0.8, color: '#f97316', size: 18, wiggleOffset: 0 },
    { x: 1620, y: 680, targetX: 1520, targetY: 670, angle: 2, speed: 1.1, color: '#ef4444', size: 22, wiggleOffset: 1.5 },
    { x: 1700, y: 630, targetX: 1680, targetY: 690, angle: 4, speed: 0.9, color: '#eab308', size: 19, wiggleOffset: 3.1 },
    { x: 1780, y: 660, targetX: 1720, targetY: 640, angle: 1, speed: 1.0, color: '#f8fafc', size: 20, wiggleOffset: 4.2 },
    { x: 1820, y: 690, targetX: 1760, targetY: 680, angle: 3, speed: 0.7, color: '#ea580c', size: 24, wiggleOffset: 5.0 },
  ]);

  const particles = useRef<WorldParticle[]>([]);

  // Sound triggering helper
  const handleStrikeBell = useCallback(() => {
    soundEngine.initContext();
    soundEngine.playDistantEchoBell(1, 0.7);
    setBellRipples([1, 2, 3, 4]);
    setTimeout(() => setBellRipples([]), 4500);
    onAddMerit(15, 50, 30, '🔔 Hồng Chung Ngân Vang ');
  }, [onAddMerit]);

  const handleFeedKoi = useCallback(() => {
    if (!spendStamina(5)) return;
    soundEngine.initContext();
    soundEngine.playWoodenFish();
    onAddMerit(20, 50, 30, '🪷 Phóng Sinh & Nuôi Dưỡng Lòng Từ ');

    // Spawn bread crumbs and attract fish
    koiFish.current.forEach((fish) => {
      fish.targetX = 1680 + (Math.random() * 80 - 40);
      fish.targetY = 660 + (Math.random() * 40 - 20);
      fish.speed = 2.2;
    });

    // Add water ripple particles
    for (let i = 0; i < 5; i++) {
      particles.current.push({
        x: 1680 + Math.random() * 60 - 30,
        y: 660 + Math.random() * 30 - 15,
        vx: 0,
        vy: 0,
        rot: 0,
        vRot: 0,
        size: 5,
        alpha: 0.8,
        color: '#bae6fd',
        type: 'ripple',
      });
    }
  }, [spendStamina, onAddMerit]);

  const handleLightIncense = useCallback(() => {
    if (!spendStamina(5)) return;
    soundEngine.initContext();
    soundEngine.playSingingBowl();
    onAddMerit(25, 50, 30, '🪔 Dâng Nén Tâm Hương ');
    for (let i = 0; i < 12; i++) {
      particles.current.push({
        x: 620 + (Math.random() * 10 - 5),
        y: 570,
        vx: Math.random() * 0.4 - 0.2,
        vy: -(0.5 + Math.random() * 0.8),
        rot: 0,
        vRot: 0.05,
        size: 8 + Math.random() * 8,
        alpha: 0.65,
        color: '#e2e8f0',
        type: 'incense',
      });
    }
  }, [spendStamina, onAddMerit]);

  // World Hotspots (Interactions across the continuous monastery)
  const hotspots: WorldHotspot[] = [
    {
      id: 'gate',
      x: 180,
      y: 620,
      radius: 65,
      icon: '⛩️',
      title: 'Cổng Tam Quan',
      desc: 'Cửa chùa mở rộng đón khách thập phương rũ bỏ muộn phiền',
      action: () => {
        soundEngine.playBell(528, 1.5);
        onAddMerit(10, 50, 40, '⛩️ Bước Chân Tỉnh Thức ');
      },
    },
    {
      id: 'sweeping',
      x: 480,
      y: 630,
      radius: 65,
      icon: '🧹',
      title: 'Quét Lá Đa',
      desc: 'Quét sạch bụi trần, rèn giũa tâm kiên nhẫn không vội vã',
      action: onOpenSweeping,
    },
    {
      id: 'censer',
      x: 620,
      y: 590,
      radius: 50,
      icon: '🪔',
      title: 'Lư Hương Đồng',
      desc: 'Thắp nén tâm hương dâng lên chư Phật mười phương',
      action: handleLightIncense,
    },
    {
      id: 'bell-tower',
      x: 820,
      y: 580,
      radius: 70,
      icon: '🔔',
      title: 'Tháp Chuông & Chú Tiểu Tuệ Tĩnh',
      desc: 'Thỉnh Đại Hồng Chung 2 tầng 8 mái ngân vang thức tỉnh trần gian cùng Chú Tiểu Tuệ Tĩnh',
      action: handleStrikeBell,
    },
    {
      id: 'tea-house',
      x: 1220,
      y: 620,
      radius: 70,
      icon: '🍵',
      title: 'Hiên Trà An Nhiên',
      desc: 'Dâng trà ấm đối ẩm lắng nghe khách phương xa',
      action: onOpenTeaHouse,
    },
    {
      id: 'koi-pond',
      x: 1680,
      y: 620,
      radius: 75,
      icon: '🪷',
      title: 'Cầu Sen & Đàn Cá Koi',
      desc: 'Nuôi dưỡng tâm từ bi, rải mồi cho cá & hít thở',
      action: handleFeedKoi,
    },
    {
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
  ];

  // Handle keyboard events (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = true;
      if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        if (nearHotspot) {
          e.preventDefault();
          nearHotspot.action();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearHotspot]);

  // Handle canvas touch or click to move
  const handleCanvasPointer = (clientX: number, clientY: number) => {
    soundEngine.initContext();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickScreenX = clientX - rect.left;
    const clickScreenY = clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldClickX = clickScreenX + cameraXRef.current;
    // Bound y movement to walkable ground path (540px to 715px)
    const clampedY = Math.max(540, Math.min(715, clickScreenY * (WORLD_HEIGHT / Math.max(300, rect.height))));
    const clampedX = Math.max(80, Math.min(WORLD_WIDTH - 80, worldClickX));

    setTargetPos({ x: clampedX, y: clampedY });
  };

  // Main 60FPS Game & Animation Loop
  useEffect(() => {
    let animId: number;
    let stepCount = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      stepCount++;

      // 1. Handle Movement Physics
      let dx = 0;
      let dy = 0;
      const speed = 3.6;

      if (keysDown.current['a'] || keysDown.current['arrowleft']) dx -= speed;
      if (keysDown.current['d'] || keysDown.current['arrowright']) dx += speed;
      if (keysDown.current['w'] || keysDown.current['arrowup']) dy -= speed * 0.6;
      if (keysDown.current['s'] || keysDown.current['arrowdown']) dy += speed * 0.6;

      // Click-to-move target interpolation
      if (targetPos) {
        const tdx = targetPos.x - playerX;
        const tdy = targetPos.y - playerY;
        const dist = Math.hypot(tdx, tdy);

        if (dist > 5) {
          dx = (tdx / dist) * speed;
          dy = (tdy / dist) * (speed * 0.6);
        } else {
          setTargetPos(null);
        }
      }

      const walkingNow = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;
      setIsWalking(walkingNow);

      if (dx < -0.1) setFacingLeft(true);
      else if (dx > 0.1) setFacingLeft(false);

      if (walkingNow) {
        setPlayerX((prev) => Math.max(60, Math.min(WORLD_WIDTH - 60, prev + dx)));
        setPlayerY((prev) => Math.max(540, Math.min(715, prev + dy)));
      }

      // 2. Camera Follow Lerp with Dynamic Viewport & High-DPI support
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const screenW = canvas.width / dpr;
      const screenH = canvas.height / dpr;

      const viewportWidth = screenW;
      const targetCamX = Math.max(0, Math.min(WORLD_WIDTH - viewportWidth, playerX - viewportWidth / 2));
      cameraXRef.current += (targetCamX - cameraXRef.current) * 0.08;
      const camX = cameraXRef.current;

      // Update current zone label based on playerX
      if (playerX < 450) setActiveZoneName('⛩️ Cổng Tam Quan & Rừng Trúc');
      else if (playerX < 950) setActiveZoneName('🧹 Sân Chùa & Gác Chuông');
      else if (playerX < 1450) setActiveZoneName('🍵 Hiên Trà & Ống Tre Shishi-odoshi');
      else if (playerX < 1950) setActiveZoneName('🪷 Cầu Sen & Đàn Cá Koi');
      else setActiveZoneName('🏛️ Chánh Điện Đại Hùng Bảo Điện');

      // 3. Hotspot Proximity Check
      let closestSpot: WorldHotspot | null = null;
      hotspots.forEach((spot) => {
        const dist = Math.hypot(playerX - spot.x, playerY - spot.y);
        if (dist < spot.radius + 35) {
          closestSpot = spot;
        }
      });
      setNearHotspot(closestSpot);

      // --- SCALE CANVAS FOR HIGH-DPI RETINA SHARPNESS ---
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, screenW, screenH);

      // Sky gradient based on Time Phase
      const skyGrad = ctx.createLinearGradient(0, 0, 0, screenH);
      if (timePhase === 'MORNING') {
        skyGrad.addColorStop(0, '#fef08a');
        skyGrad.addColorStop(0.3, '#fed7aa');
        skyGrad.addColorStop(0.8, '#bae6fd');
        skyGrad.addColorStop(1, '#e2e8f0');
      } else if (timePhase === 'AFTERNOON') {
        skyGrad.addColorStop(0, '#fdba74');
        skyGrad.addColorStop(0.4, '#fb923c');
        skyGrad.addColorStop(0.8, '#7c2d12');
        skyGrad.addColorStop(1, '#292524');
      } else {
        skyGrad.addColorStop(0, '#090d16');
        skyGrad.addColorStop(0.5, '#1e1b4b');
        skyGrad.addColorStop(0.8, '#312e81');
        skyGrad.addColorStop(1, '#1e293b');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sun or Moon in Sky (Parallax)
      ctx.save();
      const celestialX = 400 - camX * 0.04;
      const celestialY = timePhase === 'AFTERNOON' ? 220 : 120;
      const celestialColor = timePhase === 'EVENING' ? '#fef08a' : '#f59e0b';
      const glow = ctx.createRadialGradient(celestialX, celestialY, 10, celestialX, celestialY, 80);
      glow.addColorStop(0, celestialColor);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(celestialX, celestialY, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = timePhase === 'EVENING' ? '#fef9c3' : '#fef08a';
      ctx.beginPath();
      ctx.arc(celestialX, celestialY, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Mountain Parallax Layers
      drawParallaxMountains(ctx, camX, canvas.width, canvas.height, timePhase);

      // Push Camera Matrix for World Content
      ctx.save();
      ctx.translate(-camX, 0);

      // --- 4. DRAW CONTINUOUS MONASTERY SCENERY ---

      // Ground Path (Courtyard tiles, grass, streams)
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
      });

      // Destination Lotus Marker (When clicked to move)
      if (targetPos) {
        ctx.save();
        const tPulse = (stepCount % 30) / 30;
        ctx.beginPath();
        ctx.ellipse(targetPos.x, targetPos.y, 16 * (1 + tPulse * 0.5), 8 * (1 + tPulse * 0.5), 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 158, 11, ${1 - tPulse})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🪷', targetPos.x, targetPos.y + 4);
        ctx.restore();
      }

      // --- 5. DRAW PLAYER CHARACTER ---
      drawWalkingCharacter(ctx, playerX, playerY, facingLeft, isWalking, stepCount, character, level);

      // --- 6. UPDATE & DRAW DYNAMIC PARTICLES ---
      particles.current = updateAndDrawParticles(ctx, particles.current, WORLD_WIDTH, WORLD_HEIGHT, isRaining, timePhase, stepCount);

      // Pop Camera Matrix
      ctx.restore();

      // Atmospheric mist overlays
      if (isRaining) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.fillRect(0, 0, screenW, screenH);
      }

      // Pop High-DPI Matrix
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [playerX, playerY, targetPos, facingLeft, isWalking, timePhase, isRaining, character.gender, character.robeColor, character.hairStyle, character.accessory, character.name, level, nearHotspot, bellRipples, bambooDropAngle]);

  // Bamboo water drop cycle simulation
  useEffect(() => {
    const bambooInterval = setInterval(() => {
      // Tilt bamboo down
      setBambooDropAngle(25);
      // Play bamboo knocking sound
      soundEngine.playWoodenFish();

      // Spawn water splash ripple
      particles.current.push({
        x: 1040,
        y: 645,
        vx: 0,
        vy: 0,
        rot: 0,
        vRot: 0,
        size: 8,
        alpha: 0.9,
        color: '#e0f2fe',
        type: 'ripple',
      });

      setTimeout(() => {
        setBambooDropAngle(0);
      }, 700);
    }, 4500);

    return () => clearInterval(bambooInterval);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      {/* 2D Canvas Viewport with Touch-to-move & High-DPI Crispness */}
      <canvas
        ref={canvasRef}
        onClick={(e) => handleCanvasPointer(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleCanvasPointer(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        className="w-full h-full cursor-crosshair block touch-none"
      />

      {/* Proximity Action Banner (Floats dynamically when player approaches a landmark) */}
      {nearHotspot && (
        <div className="absolute top-20 sm:top-24 md:top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-bounce max-w-[94vw]">
          <button
            onClick={nearHotspot.action}
            className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-amber-950/95 border-2 border-amber-400 text-amber-100 shadow-2xl flex items-center gap-2.5 sm:gap-3 cursor-pointer hover:bg-amber-900 transition-all font-serif hover:scale-105 active:scale-95"
          >
            <span className="text-xl sm:text-2xl">{nearHotspot.icon}</span>
            <div className="text-left">
              <div className="font-bold text-xs sm:text-sm text-yellow-200 flex items-center gap-1.5 sm:gap-2">
                <span>{nearHotspot.title}</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[9px] sm:text-[10px] font-sans font-extrabold uppercase">
                  {screenSize.isMobile ? 'Chạm' : 'Phím [E]'}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-stone-300 font-sans line-clamp-1">{nearHotspot.desc}</div>
            </div>
          </button>
        </div>
      )}

      {/* Top Center: Active Zone Banner & Compass */}
      <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-[90vw]">
        <div className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-stone-950/85 backdrop-blur-md border border-amber-500/40 text-amber-200 text-[10px] sm:text-xs font-serif font-bold shadow-xl flex items-center gap-1.5 sm:gap-2 truncate">
          <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '10s' }} />
          <span className="truncate">{activeZoneName}</span>
        </div>
      </div>

      {/* Bottom Right: Open World Minimap Radar (Responsive Size) */}
      <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-20 pointer-events-auto bg-stone-950/90 backdrop-blur-md border border-amber-500/40 p-2 sm:p-2.5 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-amber-300 font-serif font-bold mb-1">
          <span>Bản Đồ Chùa</span>
          <span className="text-stone-400 text-[9px] font-mono ml-1">{Math.round((playerX / WORLD_WIDTH) * 100)}%</span>
        </div>
        <div className="w-28 xs:w-36 sm:w-56 h-8 sm:h-12 bg-stone-900 rounded-xl relative overflow-hidden border border-stone-800">
          {/* Landmark Icons along path */}
          <span className="absolute left-[7%] top-0.5 sm:top-1 text-[9px] sm:text-[11px]" title="Cổng Tam Quan">⛩️</span>
          <span className="absolute left-[28%] top-0.5 sm:top-1 text-[9px] sm:text-[11px]" title="Sân Chùa & Gác Chuông">🔔</span>
          <span className="absolute left-[47%] top-0.5 sm:top-1 text-[9px] sm:text-[11px]" title="Hiên Trà">🍵</span>
          <span className="absolute left-[66%] top-0.5 sm:top-1 text-[9px] sm:text-[11px]" title="Hồ Sen Cá Koi">🪷</span>
          <span className="absolute left-[86%] top-0.5 sm:top-1 text-[9px] sm:text-[11px]" title="Chánh Điện">🏛️</span>

          {/* Player marker dot */}
          <div
            className="absolute top-1 sm:top-2 w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-amber-400 ring-2 sm:ring-4 ring-amber-400/30 transition-all duration-150 -translate-x-1/2 shadow-lg flex items-center justify-center text-[7px] text-stone-950 font-bold"
            style={{ left: `${(playerX / WORLD_WIDTH) * 100}%` }}
          >
            ●
          </div>
        </div>
      </div>

      {/* Bottom Left: Virtual On-Screen D-Pad with Touch-friendly hitboxes */}
      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-20 pointer-events-auto bg-stone-950/85 backdrop-blur-md border border-amber-500/30 p-1.5 sm:p-2 rounded-2xl shadow-2xl flex flex-col items-center gap-1 touch-manipulation">
        <button
          onMouseDown={() => (keysDown.current['w'] = true)}
          onMouseUp={() => (keysDown.current['w'] = false)}
          onTouchStart={(e) => { e.preventDefault(); keysDown.current['w'] = true; }}
          onTouchEnd={(e) => { e.preventDefault(); keysDown.current['w'] = false; }}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-stone-900 active:bg-amber-600 border border-stone-700 active:border-amber-400 text-stone-200 text-sm font-bold flex items-center justify-center cursor-pointer shadow transition active:scale-95"
          aria-label="Di chuyển lên"
        >
          ▲
        </button>
        <div className="flex gap-1">
          <button
            onMouseDown={() => (keysDown.current['a'] = true)}
            onMouseUp={() => (keysDown.current['a'] = false)}
            onTouchStart={(e) => { e.preventDefault(); keysDown.current['a'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); keysDown.current['a'] = false; }}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-stone-900 active:bg-amber-600 border border-stone-700 active:border-amber-400 text-stone-200 text-sm font-bold flex items-center justify-center cursor-pointer shadow transition active:scale-95"
            aria-label="Di chuyển sang trái"
          >
            ◀
          </button>
          <button
            onClick={() => nearHotspot?.action()}
            onTouchStart={(e) => { e.preventDefault(); nearHotspot?.action(); }}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl font-extrabold text-xs flex items-center justify-center cursor-pointer shadow-lg transition active:scale-95 ${
              nearHotspot
                ? 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}
            title="Tương tác"
            aria-label="Tương tác"
          >
            E
          </button>
          <button
            onMouseDown={() => (keysDown.current['d'] = true)}
            onMouseUp={() => (keysDown.current['d'] = false)}
            onTouchStart={(e) => { e.preventDefault(); keysDown.current['d'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); keysDown.current['d'] = false; }}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-stone-900 active:bg-amber-600 border border-stone-700 active:border-amber-400 text-stone-200 text-sm font-bold flex items-center justify-center cursor-pointer shadow transition active:scale-95"
            aria-label="Di chuyển sang phải"
          >
            ▶
          </button>
        </div>
        <button
          onMouseDown={() => (keysDown.current['s'] = true)}
          onMouseUp={() => (keysDown.current['s'] = false)}
          onTouchStart={(e) => { e.preventDefault(); keysDown.current['s'] = true; }}
          onTouchEnd={(e) => { e.preventDefault(); keysDown.current['s'] = false; }}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-stone-900 active:bg-amber-600 border border-stone-700 active:border-amber-400 text-stone-200 text-sm font-bold flex items-center justify-center cursor-pointer shadow transition active:scale-95"
          aria-label="Di chuyển xuống"
        >
          ▼
        </button>
      </div>

      {/* Controls Guide Floating Badge */}
      {showControlsHint && (
        <div className="absolute top-18 right-4 z-20 pointer-events-auto bg-stone-950/85 backdrop-blur-md border border-stone-800 px-3 py-2 rounded-xl text-stone-300 text-xs shadow-lg max-w-xs flex items-start gap-2">
          <Footprints className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="font-serif">
            <div className="font-bold text-amber-200">Điều Khiển Thế Giới Mở:</div>
            <div>• Click chuột/chạm đất để nhân vật đi tới.</div>
            <div>• Dùng phím <strong>W, A, S, D</strong> hoặc <strong>Phím Mũi Tên</strong>.</div>
            <div>• Đến gần đồ vật và bấm <strong>[E]</strong> để tương tác.</div>
          </div>
          <button
            onClick={() => setShowControlsHint(false)}
            className="text-stone-500 hover:text-stone-300 ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// HÀM VẼ CẢNH QUAN 2D THẾ GIỚI MỞ CHI TIẾT
// ==========================================

function drawParallaxMountains(
  ctx: CanvasRenderingContext2D,
  camX: number,
  viewW: number,
  viewH: number,
  phase: string
) {
  // Mountain Layer 1 (Far silhouette)
  ctx.save();
  const m1X = -camX * 0.12;
  ctx.fillStyle = phase === 'EVENING' ? '#1e1b4b' : '#64748b';
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(m1X, 420);
  for (let x = 0; x < WORLD_WIDTH + 600; x += 300) {
    ctx.quadraticCurveTo(m1X + x + 150, 180 + Math.sin(x * 0.005) * 50, m1X + x + 300, 420);
  }
  ctx.lineTo(viewW, viewH);
  ctx.lineTo(0, viewH);
  ctx.fill();

  // Mountain Layer 2 (Closer crags)
  const m2X = -camX * 0.28;
  ctx.fillStyle = phase === 'EVENING' ? '#0f172a' : '#475569';
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(m2X, 490);
  for (let x = 0; x < WORLD_WIDTH + 600; x += 220) {
    ctx.quadraticCurveTo(m2X + x + 110, 260 + Math.cos(x * 0.008) * 45, m2X + x + 220, 490);
  }
  ctx.lineTo(viewW, viewH);
  ctx.lineTo(0, viewH);
  ctx.fill();
  ctx.restore();
}

function drawMonasteryGround(ctx: CanvasRenderingContext2D, _step: number) {
  // Ground dirt and stone road base
  const groundGrad = ctx.createLinearGradient(0, 480, 0, WORLD_HEIGHT);
  groundGrad.addColorStop(0, '#57534e');
  groundGrad.addColorStop(0.3, '#78716c');
  groundGrad.addColorStop(0.7, '#a8a29e');
  groundGrad.addColorStop(1, '#57534e');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 520, WORLD_WIDTH, WORLD_HEIGHT - 520);

  // Courtyard Tile Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  for (let y = 560; y < 750; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_WIDTH, y);
    ctx.stroke();
  }
  for (let x = 0; x < WORLD_WIDTH; x += 75) {
    ctx.beginPath();
    ctx.moveTo(x, 560);
    ctx.lineTo(x, 750);
    ctx.stroke();
  }
}

// Zone 1: Cổng Tam Quan & Rừng Trúc
function drawBambooGateZone(ctx: CanvasRenderingContext2D, step: number) {
  ctx.save();

  // Rừng trúc xào xạc hai bên
  for (let i = 40; i < 380; i += 30) {
    const sway = Math.sin(step * 0.02 + i) * 6;
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(i, 560);
    ctx.quadraticCurveTo(i + sway * 0.5, 420, i + sway, 280);
    ctx.stroke();

    // Bamboo nodes
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 8;
    for (let h = 320; h < 550; h += 45) {
      ctx.beginPath();
      ctx.moveTo(i + sway * ((560 - h) / 280) - 4, h);
      ctx.lineTo(i + sway * ((560 - h) / 280) + 4, h);
      ctx.stroke();
    }
  }

  // Cổng Tam Quan đá ba gian cổ kính
  const gx = 180;
  // Cột đá
  ctx.fillStyle = '#44403c';
  ctx.fillRect(gx - 80, 420, 18, 140);
  ctx.fillRect(gx - 25, 400, 20, 160);
  ctx.fillRect(gx + 25, 400, 20, 160);
  ctx.fillRect(gx + 80, 420, 18, 140);

  // Mái đao ngói rêu phong
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(gx - 110, 420);
  ctx.quadraticCurveTo(gx, 370, gx + 110, 420);
  ctx.quadraticCurveTo(gx, 395, gx - 110, 420);
  ctx.fill();

  // Mái tầng hai
  ctx.beginPath();
  ctx.moveTo(gx - 60, 390);
  ctx.quadraticCurveTo(gx, 350, gx + 60, 390);
  ctx.quadraticCurveTo(gx, 370, gx - 60, 390);
  ctx.fill();

  // Biển đề chữ sơn tự
  ctx.fillStyle = '#b45309';
  ctx.fillRect(gx - 24, 410, 48, 18);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 9px "Noto Serif", serif';
  ctx.textAlign = 'center';
  ctx.fillText('VÂN ẨN TỰ', gx, 423);

  ctx.restore();
}









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

// Zone 2: Sân Chùa & Gác Chuông & Cây Đa
function drawBellCourtyardZone(ctx: CanvasRenderingContext2D, step: number, ripples: number[]) {
  ctx.save();

  // Cây Đa Bồ Đề ngàn năm (x: 520)
  const tx = 520;
  ctx.fillStyle = '#44403c';
  ctx.beginPath();
  ctx.moveTo(tx - 35, 560);
  ctx.quadraticCurveTo(tx - 20, 420, tx - 10, 350);
  ctx.quadraticCurveTo(tx + 20, 420, tx + 35, 560);
  ctx.fill();

  // Tán lá xanh sum suê đung đưa
  const leafSway = Math.sin(step * 0.02) * 4;
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(tx - 40 + leafSway, 320, 85, 0, Math.PI * 2);
  ctx.arc(tx + 40 - leafSway, 310, 95, 0, Math.PI * 2);
  ctx.arc(tx, 250, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(tx - 10, 290, 75, 0, Math.PI * 2);
  ctx.fill();

  // Lư hương đồng tam bảo (x: 620)
  const lx = 620;
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(lx, 570, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(lx - 12, 570, 24, 18);
  // Chân lư hương
  ctx.fillRect(lx - 16, 588, 6, 12);
  ctx.fillRect(lx + 10, 588, 6, 12);
  // Que nhang đỏ thắp sáng
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lx - 4, 552);
  ctx.lineTo(lx - 4, 540);
  ctx.moveTo(lx, 550);
  ctx.lineTo(lx, 536);
  ctx.moveTo(lx + 4, 552);
  ctx.lineTo(lx + 4, 542);
  ctx.stroke();

  // Tháp Chuông Cổ Tự 2 Tầng 8 Mái & Chú Tiểu Tuệ Tĩnh (x: 820)
  const bx = 820;

  // 1. BỆ ĐÁ TAM CẤP (THREE-TIER CARVED STONE PEDESTAL)
  ctx.fillStyle = '#64748b';
  ctx.fillRect(bx - 72, 552, 144, 16);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(bx - 64, 538, 128, 14);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(bx - 56, 526, 112, 12);

  // Bậc tam cấp đá chính giữa
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(bx - 22, 538, 44, 28);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  for (let s = 0; s < 4; s++) {
    ctx.strokeRect(bx - 22, 538 + s * 7, 44, 7);
  }

  // Lan can đá hai bên bậc tam cấp chạm mây
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(bx - 26, 532, 4, 34);
  ctx.fillRect(bx + 22, 532, 4, 34);

  // Lan can đá xung quanh sàn thượng với trụ búp sen (mở rộng thoáng hành lang gõ chuông phía bên phải)
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(bx - 54, 514, 28, 12);
  ctx.fillRect(bx + 44, 514, 12, 12); // Chừa không gian rộng thoáng từ bx + 22 tới bx + 44 cho Chú Tiểu đứng gõ chuông

  // Trụ sen các góc lan can
  [-54, -26, 44, 56].forEach((px) => {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(bx + px - 2, 508, 5, 18);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(bx + px + 0.5, 506, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. 4 CỘT CÁI GỖ LIM & CHÂN TẢNG ĐÁ
  [-40, -18, 18, 40].forEach((cx) => {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(bx + cx - 6, 520, 12, 6);
  });

  ctx.fillStyle = '#451a03';
  ctx.fillRect(bx - 44, 430, 8, 92);
  ctx.fillRect(bx - 22, 430, 8, 92);
  ctx.fillRect(bx + 14, 430, 8, 92);
  ctx.fillRect(bx + 36, 430, 8, 92);

  // Xà hạ & xà thượng gỗ lim
  ctx.fillStyle = '#291004';
  ctx.fillRect(bx - 46, 475, 92, 5);
  ctx.fillRect(bx - 48, 432, 96, 6);

  // 3. TẦNG MÁI HẠ (LOWER CURVED PAGODA ROOF - 4 ĐẦU ĐAO CONG VÚT)
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(bx - 78, 428);
  ctx.quadraticCurveTo(bx - 68, 420, bx - 42, 422);
  ctx.quadraticCurveTo(bx, 412, bx + 42, 422);
  ctx.quadraticCurveTo(bx + 68, 420, bx + 78, 428);
  ctx.quadraticCurveTo(bx + 62, 436, bx + 48, 433);
  ctx.lineTo(bx - 48, 433);
  ctx.quadraticCurveTo(bx - 62, 436, bx - 78, 428);
  ctx.closePath();
  ctx.fill();

  // Kìm nóc đầu rồng ở hai đầu đao mái hạ
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(bx - 76, 424, 3, 0, Math.PI * 2);
  ctx.arc(bx + 76, 424, 3, 0, Math.PI * 2);
  ctx.fill();

  // 4. CỔ BỒNG THƯỢNG (UPPER CLERESTORY WITH WOODEN BALUSTERS)
  ctx.fillStyle = '#291004';
  ctx.fillRect(bx - 32, 386, 64, 26);
  ctx.fillStyle = '#78350f';
  for (let bxSl = -26; bxSl <= 26; bxSl += 6) {
    ctx.fillRect(bx + bxSl - 1, 388, 2, 22);
  }

  // 5. TẦNG MÁI THƯỢNG (UPPER CURVED PAGODA ROOF & STUPA APEX)
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(bx - 56, 386);
  ctx.quadraticCurveTo(bx - 48, 376, bx - 28, 378);
  ctx.quadraticCurveTo(bx, 368, bx + 28, 378);
  ctx.quadraticCurveTo(bx + 48, 376, bx + 56, 386);
  ctx.quadraticCurveTo(bx + 44, 392, bx + 32, 388);
  ctx.lineTo(bx - 32, 388);
  ctx.quadraticCurveTo(bx - 44, 392, bx - 56, 386);
  ctx.closePath();
  ctx.fill();

  // Đỉnh tháp: Búp sen hồ lô bình cam lộ
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(bx, 366, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(bx - 1, 359, 2, 6);

  // 6. CHU KỲ HOẠT ẢNH GÕ CHUÔNG TỰ ĐỘNG & TƯƠNG TÁC CỦA CHÚ TIỂU
  const cycle = step % 600;
  const isAutoPull = cycle >= 420 && cycle < 475;
  const isAutoStrike = cycle >= 475 && cycle < 505;
  const isAutoResonate = cycle >= 505 && cycle < 575;
  const isManualStrike = ripples.length > 0;

  const isPulling = !isManualStrike && isAutoPull;
  const isStriking = isManualStrike || isAutoStrike;
  const isResonating = isManualStrike || isAutoResonate;

  // Độ dịch chuyển của chày gỗ
  let malletOffset = 0;
  let strikeLeaning = 0;
  let isPraying = false;

  if (isPulling) {
    // Kéo lùi chày gỗ lấy đà
    const t = (cycle - 420) / 55;
    malletOffset = t * 14;
    strikeLeaning = t * 5; // Ngả người ra sau
  } else if (isStriking) {
    // Vung chày gõ mạnh về phía quả chuông
    if (isManualStrike) {
      malletOffset = -12;
      strikeLeaning = -8;
    } else {
      const t = (cycle - 475) / 30;
      malletOffset = 14 - t * 26; // Lao nhanh từ +14 tới -12 (chạm núm chuông)
      strikeLeaning = 5 - t * 13; // Rướn người tới trước
    }
  } else if (isResonating) {
    // Chày gỗ nảy lại dao động nhẹ & Chú Tiểu chắp tay xá Phật
    const t = isManualStrike ? 0.3 : (cycle - 505) / 70;
    malletOffset = Math.sin(t * Math.PI * 4) * 4 * (1 - t);
    strikeLeaning = -2;
    isPraying = true;
  }

  // Độ rung của chuông khi bị đánh
  const bellVibX = isResonating ? Math.sin(step * 0.9) * 2.5 : 0;
  const bellCx = bx - 6 + bellVibX;

  // Quai rồng Bồ Lao
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(bellCx, 442, 6, Math.PI, 0);
  ctx.stroke();

  // Thân Chuông Đại Hồng Chung
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(bellCx - 14, 446);
  ctx.quadraticCurveTo(bellCx - 20, 480, bellCx - 21, 496);
  ctx.quadraticCurveTo(bellCx, 502, bellCx + 21, 496);
  ctx.quadraticCurveTo(bellCx + 20, 480, bellCx + 14, 446);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Các gờ đúc nổi trang trí & núm chuông
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bellCx - 16, 464);
  ctx.lineTo(bellCx + 16, 464);
  ctx.moveTo(bellCx - 19, 484);
  ctx.lineTo(bellCx + 19, 484);
  ctx.stroke();

  // Núm chuông hoa sen bên phải
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(bellCx + 16, 478, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 7. CHÀY GỖ TREO DÂY (SUSPENDED WOODEN MALLET)
  const malletX = bx + 16 + malletOffset;
  const malletY = 478;

  // Hai sợi dây treo chày
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(malletX + 4, 436);
  ctx.lineTo(malletX + 4, malletY - 4);
  ctx.moveTo(malletX + 22, 436);
  ctx.lineTo(malletX + 22, malletY - 4);
  ctx.stroke();

  // Thân chày gỗ
  ctx.fillStyle = '#78350f';
  ctx.fillRect(malletX, malletY - 4, 26, 8);
  ctx.beginPath();
  ctx.arc(malletX, malletY, 4, Math.PI / 2, -Math.PI / 2);
  ctx.fill();
  ctx.fillStyle = '#d97706';
  ctx.fillRect(malletX + 5, malletY - 4.5, 2.5, 9);
  ctx.fillRect(malletX + 20, malletY - 4.5, 2.5, 9);

  // Tia lửa tóe sáng khi chày gỗ chạm trúng núm chuông
  if (isStriking && Math.abs(malletOffset) > 8) {
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(bellCx + 18, 478, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. NPC CHÚ TIỂU TUỆ TĨNH THỈNH CHUÔNG (CHIBI NOVICE MONK)
  const monkX = bx + 32;
  const monkY = 524; // Sàn bệ đá thượng vững chãi, không bị chìm hay che khuất

  // Chân & Giày Chú Tiểu đứng vững vàng trên sàn
  ctx.fillStyle = '#451a03';
  ctx.fillRect(monkX - 6, monkY - 10, 5, 10);
  ctx.fillRect(monkX + 1, monkY - 10, 5, 10);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(monkX - 7, monkY - 3, 6, 4);
  ctx.fillRect(monkX, monkY - 3, 6, 4);

  // Thân áo tràng nâu sồng
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(monkX - 9 + strikeLeaning, monkY - 26);
  ctx.lineTo(monkX + 9 + strikeLeaning, monkY - 26);
  ctx.lineTo(monkX + 11, monkY - 8);
  ctx.lineTo(monkX - 11, monkY - 8);
  ctx.closePath();
  ctx.fill();

  // Cổ vạt áo chéo
  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(monkX + 3 + strikeLeaning, monkY - 22);
  ctx.lineTo(monkX - 3 + strikeLeaning, monkY - 14);
  ctx.stroke();

  if (isPraying) {
    // Khi chuông ngân: Chắp hai tay trước ngực xá Phật
    ctx.strokeStyle = '#ffedd5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(monkX - 5 + strikeLeaning, monkY - 18);
    ctx.lineTo(monkX - 1 + strikeLeaning, monkY - 14);
    ctx.moveTo(monkX + 5 + strikeLeaning, monkY - 18);
    ctx.lineTo(monkX + 1 + strikeLeaning, monkY - 14);
    ctx.stroke();
    // Chắp bàn tay lại
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(monkX + strikeLeaning, monkY - 14, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Khi chuẩn bị / vung chày: Hai tay nắm chặt chày gỗ
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(monkX + strikeLeaning, monkY - 17);
    ctx.lineTo(malletX + 18, malletY + 4);
    ctx.moveTo(monkX - 4 + strikeLeaning, monkY - 17);
    ctx.lineTo(malletX + 12, malletY + 4);
    ctx.stroke();
  }

  // Đầu Chibi tròn trĩnh
  ctx.fillStyle = '#ffedd5';
  ctx.beginPath();
  ctx.arc(monkX + strikeLeaning, monkY - 27, 8, 0, Math.PI * 2);
  ctx.fill();

  // 3 Chấm Giới Hương trên trán
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(monkX + strikeLeaning, monkY - 32, 1, 0, Math.PI * 2);
  ctx.arc(monkX + strikeLeaning - 2, monkY - 33, 0.8, 0, Math.PI * 2);
  ctx.arc(monkX + strikeLeaning + 2, monkY - 33, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Mắt Chibi
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(monkX - 3 + strikeLeaning, monkY - 27, 2, Math.PI * 1.1, Math.PI * 1.9);
  ctx.arc(monkX + 3 + strikeLeaning, monkY - 27, 2, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // Má hồng Chibi
  ctx.fillStyle = 'rgba(251, 113, 133, 0.55)';
  ctx.beginPath();
  ctx.arc(monkX - 5 + strikeLeaning, monkY - 25, 2, 0, Math.PI * 2);
  ctx.arc(monkX + 5 + strikeLeaning, monkY - 25, 2, 0, Math.PI * 2);
  ctx.fill();

  // Nụ cười mỉm
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(monkX + strikeLeaning, monkY - 24, 1.8, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Bảng tên NPC Chú Tiểu Tuệ Tĩnh (hiển thị trạng thái động)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  const bannerW = isPraying ? 82 : 68;
  ctx.fillRect(monkX - bannerW / 2, monkY - 48, bannerW, 14);
  ctx.strokeStyle = isPraying ? 'rgba(234, 179, 8, 0.85)' : 'rgba(251, 191, 36, 0.7)';
  ctx.lineWidth = 1;
  ctx.strokeRect(monkX - bannerW / 2, monkY - 48, bannerW, 14);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isPraying ? '🙏 A Di Đà Phật' : '🔔 Chú Tiểu Tuệ Tĩnh', monkX, monkY - 38);

  // 9. SÓNG ÂM THANH KIM QUANG LAN TỎA
  if (isResonating) {
    ctx.strokeStyle = '#fde047';
    const rippleCount = isManualStrike ? ripples.length : 3;
    for (let idx = 0; idx < rippleCount; idx++) {
      const r = (step * 2.5 + idx * 35) % 200;
      ctx.lineWidth = Math.max(0.5, 3.5 - r / 50);
      ctx.beginPath();
      ctx.arc(bellCx, 478, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Tia sáng hào quang (Golden light sparkles)
    ctx.fillStyle = '#fef08a';
    for (let sp = 0; sp < 6; sp++) {
      const spA = step * 0.1 + (sp * Math.PI) / 3;
      const spR = 25 + Math.sin(step * 0.2 + sp) * 12;
      ctx.beginPath();
      ctx.arc(bellCx + Math.cos(spA) * spR, 478 + Math.sin(spA) * spR, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// Zone 3: Hiên Trà & Ống Tre Shishi-odoshi
function drawTeaGardenZone(ctx: CanvasRenderingContext2D, _step: number, dropAngle: number) {
  ctx.save();
  const tx = 1220;

  // Thủy đình gỗ hiên trà
  ctx.fillStyle = '#78350f';
  ctx.fillRect(tx - 65, 450, 12, 110);
  ctx.fillRect(tx + 55, 450, 12, 110);
  // Sàn gỗ nâng cao
  ctx.fillStyle = '#92400e';
  ctx.fillRect(tx - 80, 550, 160, 14);

  // Mái đình cong
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.moveTo(tx - 100, 450);
  ctx.quadraticCurveTo(tx, 410, tx + 100, 450);
  ctx.quadraticCurveTo(tx, 430, tx - 100, 450);
  ctx.fill();

  // Bàn trà đá tròn
  ctx.fillStyle = '#a8a29e';
  ctx.beginPath();
  ctx.ellipse(tx, 545, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#78716c';
  ctx.fillRect(tx - 8, 550, 16, 12);

  // Ấm trà tử sa & khói bốc
  ctx.fillStyle = '#7c2d12';
  ctx.beginPath();
  ctx.arc(tx, 538, 6, 0, Math.PI * 2);
  ctx.fill();

  // Ống tre gõ nước Shishi-odoshi (x: 1040)
  const sx = 1040;
  // Giá đỡ tre hai bên
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(sx - 12, 590);
  ctx.lineTo(sx, 570);
  ctx.lineTo(sx + 12, 590);
  ctx.stroke();

  // Tảng đá hứng nước bên dưới
  ctx.fillStyle = '#57534e';
  ctx.beginPath();
  ctx.ellipse(sx - 10, 600, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ống tre gõ chúc đầu xuống
  ctx.save();
  ctx.translate(sx, 570);
  ctx.rotate((dropAngle * Math.PI) / 180);
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(-22, -4, 44, 8);
  ctx.restore();

  // Nước suối nhỏ giọt vào ống tre
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx + 15, 540);
  ctx.lineTo(sx + 15, 568);
  ctx.stroke();

  ctx.restore();
}

// Zone 4: Cầu Gỗ & Hồ Sen & Đàn Cá Koi
function drawLotusPondZone(ctx: CanvasRenderingContext2D, step: number) {
  ctx.save();
  const px = 1680;

  // Lòng hồ sen hình oval rộng
  const pondGrad = ctx.createRadialGradient(px, 660, 40, px, 660, 180);
  pondGrad.addColorStop(0, '#0284c7');
  pondGrad.addColorStop(0.6, '#0369a1');
  pondGrad.addColorStop(1, '#075985');
  ctx.fillStyle = pondGrad;
  ctx.beginPath();
  ctx.ellipse(px, 660, 190, 65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Hoa sen & Lá sen bập bềnh
  const lotusSpots = [
    { x: px - 110, y: 645, color: '#f472b6' },
    { x: px - 60, y: 675, color: '#fb7185' },
    { x: px + 80, y: 640, color: '#f472b6' },
    { x: px + 120, y: 670, color: '#fb7185' },
  ];
  lotusSpots.forEach((l) => {
    // Lá sen tròn xẻ rãnh
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(l.x, l.y + 4, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hoa sen búp/nở
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y - 8);
    ctx.lineTo(l.x + 6, l.y);
    ctx.lineTo(l.x - 6, l.y);
    ctx.closePath();
    ctx.fill();
  });

  // Đàn cá Koi bơi lội mềm mại (Drawing Fish Animation)
  const fishList = [
    { x: px - 40, y: 650, color: '#f97316', angle: step * 0.02 },
    { x: px + 20, y: 670, color: '#ef4444', angle: step * 0.025 + 1.2 },
    { x: px - 80, y: 665, color: '#eab308', angle: step * 0.018 + 2.5 },
  ];

  fishList.forEach((f) => {
    ctx.save();
    const fishX = px + Math.cos(f.angle) * 75;
    const fishY = 660 + Math.sin(f.angle) * 35;
    const fishDir = f.angle + Math.PI / 2;

    ctx.translate(fishX, fishY);
    ctx.rotate(fishDir);

    // Fish body
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wiggling tail fin
    const tailWiggle = Math.sin(step * 0.2 + f.angle) * 4;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-18, tailWiggle - 5);
    ctx.lineTo(-18, tailWiggle + 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });

  // Cây Cầu Gỗ Son Bán Nguyệt (Moon Bridge)
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(px, 665, 80, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Lan can cầu gỗ
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(px, 665, 88, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  ctx.restore();
}

// Zone 5: Chánh Điện Đại Hùng Bảo Điện & Tàng Kinh Các
function drawSanctuaryZone(ctx: CanvasRenderingContext2D, _step: number) {
  ctx.save();
  const sx = 2150;

  // Bậc tam cấp đá hoa cương
  ctx.fillStyle = '#78716c';
  ctx.fillRect(sx - 120, 530, 240, 12);
  ctx.fillRect(sx - 105, 518, 210, 12);
  ctx.fillRect(sx - 90, 506, 180, 12);

  // Thân Chánh Điện gỗ lim cổ kính
  ctx.fillStyle = '#78350f';
  ctx.fillRect(sx - 110, 360, 220, 146);

  // Cửa bức bàn Chánh Điện
  ctx.fillStyle = '#92400e';
  ctx.fillRect(sx - 75, 400, 45, 106);
  ctx.fillRect(sx - 20, 400, 40, 106);
  ctx.fillRect(sx + 30, 400, 45, 106);

  // Ánh sáng vàng thiêng từ Chánh Điện tỏa ra
  const goldLight = ctx.createRadialGradient(sx, 440, 10, sx, 440, 90);
  goldLight.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
  goldLight.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = goldLight;
  ctx.fillRect(sx - 70, 390, 140, 110);

  // Tượng Phật Thích Ca Mâu Ni mạ vàng uy nghi bên trong
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(sx, 430, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(sx, 455, 22, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mái đao cong 2 tầng Chánh Điện
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(sx - 150, 360);
  ctx.quadraticCurveTo(sx, 290, sx + 150, 360);
  ctx.quadraticCurveTo(sx, 320, sx - 150, 360);
  ctx.fill();

  // Mái tầng trên
  ctx.beginPath();
  ctx.moveTo(sx - 110, 305);
  ctx.quadraticCurveTo(sx, 250, sx + 110, 305);
  ctx.quadraticCurveTo(sx, 275, sx - 110, 305);
  ctx.fill();

  // Đèn lồng đỏ treo hiên Chánh Điện
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(sx - 95, 365, 8, 0, Math.PI * 2);
  ctx.arc(sx + 95, 365, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Player Character with Cute Chibi Proportions & Walking Animation (Matching Concept Art - Đồ Lam Phật Tử)
function drawWalkingCharacter(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  facingLeft: boolean,
  isWalking: boolean,
  step: number,
  character: CharacterAppearance,
  _level: number
) {
  ctx.save();
  ctx.translate(px, py);
  if (facingLeft) ctx.scale(-1, 1);

  const isFemale = character.gender === 'female';
  const legOffset = isWalking ? Math.sin(step * 0.28) * 6 : 0;
  const bounceY = isWalking ? -Math.abs(Math.sin(step * 0.28)) * 3 : 0;

  // Outfit palettes from Concept Art (Đồ Lam Phật Tử)
  const palette = ROBE_COLORS[character.robeColor] || ROBE_COLORS.lam;
  const shirtColor = isFemale ? palette.female : palette.male;
  const shirtShade = isFemale ? palette.femaleShade : palette.maleShade;
  const pantsColor = palette.pants;
  const pantsShade = palette.pantsShade;
  const hairColor = '#3f2e24';
  const hairHighlight = '#5c4033';
  const skinTone = '#ffedd5';
  const skinShade = '#fed7aa';

  // 1. Soft Oval Shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 3, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bounceY);

  // 2. Chibi Buddhist Pants (Quần lam suông rộng thoải mái)
  ctx.fillStyle = pantsColor;
  ctx.fillRect(-7 + legOffset * 0.8, -16, 5, 14);
  ctx.fillRect(2 - legOffset * 0.8, -16, 5, 14);
  ctx.fillStyle = pantsShade;
  ctx.fillRect(-7 + legOffset * 0.8, -4, 5, 2);
  ctx.fillRect(2 - legOffset * 0.8, -4, 5, 2);

  // 3. Buddhist Shoes (Giày vải đen Phật tử đế bệt)
  if (isFemale) {
    // NỮ: Hài vải đen đế bệt thanh nhã
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(-5 + legOffset * 0.8, -2, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(4 - legOffset * 0.8, -2, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.fillRect(-7 + legOffset * 0.8, -3, 3.5, 2);
    ctx.fillRect(2 - legOffset * 0.8, -3, 3.5, 2);
  } else {
    // NAM: Giày kung-fu vải đen viền đế trắng
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8 + legOffset * 0.8, -4, 7, 4);
    ctx.fillRect(1 - legOffset * 0.8, -4, 7, 4);
    ctx.fillStyle = '#ffffff'; // Viền đế trắng
    ctx.fillRect(-8 + legOffset * 0.8, -1, 7, 1.2);
    ctx.fillRect(1 - legOffset * 0.8, -1, 7, 1.2);
  }

  // 4. Buddhist Robe / Tunic (Áo Lam Phật Tử - Buông ngoài quần, KHÔNG CÓ THẮT LƯNG DA)
  if (isFemale) {
    // NỮ: Áo tràng lam dáng dài xẻ tà hai bên hông buông qua gối + Hoa sen thêu vàng
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.moveTo(-8, -32);
    ctx.lineTo(8, -32);
    ctx.lineTo(10, -6);
    ctx.lineTo(-10, -6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shirtShade;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Đường xẻ tà hai bên hông thướt tha
    ctx.strokeStyle = shirtShade;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-8, -19);
    ctx.lineTo(-10, -6);
    ctx.moveTo(8, -19);
    ctx.lineTo(10, -6);
    ctx.stroke();

    // HOA SEN VÀNG THÊU TRÊN NGỰC ÁO NỮ
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(3, -25, 2.2, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(3, -26, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Cổ tròn tàu khép kín + khuy vải
    ctx.fillStyle = shirtColor;
    ctx.fillRect(-3, -33, 6, 3);
    ctx.strokeStyle = shirtShade;
    ctx.strokeRect(-3, -33, 6, 3);
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(2, -31.5, 0.8, 0, Math.PI * 2);
    ctx.arc(3.5, -29.5, 0.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // NAM: Áo lam Phật tử cổ tàu, buông qua hông xẻ tà, khuy vải chéo vai
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.moveTo(-9, -32);
    ctx.lineTo(9, -32);
    ctx.lineTo(9.5, -12);
    ctx.lineTo(-9.5, -12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shirtShade;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Đường xẻ tà ngắn hai bên hông
    ctx.strokeStyle = shirtShade;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-9, -17);
    ctx.lineTo(-9.5, -12);
    ctx.moveTo(9, -17);
    ctx.lineTo(9.5, -12);
    ctx.stroke();

    // Cổ đứng mandarin ôm khít
    ctx.fillStyle = shirtColor;
    ctx.fillRect(-3.5, -34, 7, 3.5);
    ctx.strokeStyle = shirtShade;
    ctx.strokeRect(-3.5, -34, 7, 3.5);

    // 2 khuy cài vải chéo lệch vai phải
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(2.5, -32, 0.9, 0, Math.PI * 2);
    ctx.arc(4, -30, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arms with sleeves & Prayer beads
  const armSwing = isWalking ? Math.sin(step * 0.28) * 5 : 0;

  if (isFemale) {
    // NỮ: Tay phải buông nhẹ theo bước đi, tay trái nâng chuỗi 18 hạt bồ đề
    // Tay phải
    ctx.fillStyle = shirtColor;
    ctx.fillRect(-12, -31 + armSwing * 0.4, 4, 8);
    ctx.fillStyle = skinTone;
    ctx.fillRect(-12, -23 + armSwing * 0.4, 3.5, 4.5);

    // Tay trái nâng chuỗi hạt bồ đề niệm Phật
    ctx.fillStyle = shirtColor;
    ctx.fillRect(8, -31, 4, 7);
    ctx.fillStyle = skinTone;
    ctx.fillRect(8.5, -24, 3.5, 4);

    // Chuỗi 18 hạt bồ đề rủ xuống có tua rua
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(10.5, -18, 3, 4.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Hạt mẹ & tua rua vàng cam
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(10.5, -13.5, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10.5, -13.5);
    ctx.lineTo(10.5, -9);
    ctx.stroke();
  } else {
    // NAM: Tay áo lam xắn gập nhẹ, chuỗi hạt gỗ trên cổ tay
    ctx.fillStyle = shirtColor;
    ctx.fillRect(-12, -31 + armSwing * 0.4, 4, 8);
    ctx.fillStyle = skinTone;
    ctx.fillRect(-12, -23 + armSwing * 0.4, 3.5, 5);
    // Vòng chuỗi hạt cổ tay
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-12.5, -23.5 + armSwing * 0.4, 4.5, 1.5);

    ctx.fillStyle = shirtColor;
    ctx.fillRect(8, -31 - armSwing * 0.4, 4, 8);
    ctx.fillStyle = skinTone;
    ctx.fillRect(8.5, -23 - armSwing * 0.4, 3.5, 5);
    // Vòng chuỗi hạt cổ tay
    ctx.fillStyle = '#78350f';
    ctx.fillRect(8, -23.5 - armSwing * 0.4, 4.5, 1.5);
  }

  // 5. Neck
  ctx.fillStyle = skinShade;
  ctx.fillRect(-2.5, -36, 5, 4);

  // 6. Cute Chibi Head (Large adorable proportions)
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, -45, 13.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fb923c';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Rosy Blush Cheeks
  ctx.fillStyle = isFemale ? 'rgba(244, 63, 94, 0.4)' : 'rgba(251, 146, 60, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-7, -42, 3, 1.8, 0, 0, Math.PI * 2);
  ctx.ellipse(7, -42, 3, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Big Sparkling Anime Eyes
  const drawEye = (x: number) => {
    ctx.fillStyle = '#3f2e24';
    ctx.beginPath();
    ctx.ellipse(x, -45, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(x, -44, 2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 0.8, -46.5, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 0.8, -44, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = isFemale ? 1.4 : 1.0;
    ctx.beginPath();
    ctx.moveTo(x - 3, -48);
    ctx.quadraticCurveTo(x, -49.5, x + 3, -48);
    ctx.stroke();
  };
  drawEye(-4.5);
  drawEye(4.5);

  // Sweet Smile
  ctx.strokeStyle = '#c2410c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -40, 2.2, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // 7. Hair Styles & Accessories Matching Concept Art & Character Customization
  const isShaved = character.hairStyle === 'shaved';

  ctx.fillStyle = hairColor;

  if (isShaved) {
    // 3 Chấm Giới Hương trên trán quy y
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(0, -51, 1.2, 0, Math.PI * 2);
    ctx.arc(0, -48, 1.2, 0, Math.PI * 2);
    ctx.arc(0, -45, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (isFemale) {
    if (character.hairStyle === 'short') {
      // NỮ CHIBI: TÓC BOB NGẮN THANH TÚ
      ctx.beginPath();
      ctx.arc(0, -48, 14, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-13, -48);
      ctx.quadraticCurveTo(-15, -36, -10, -32);
      ctx.quadraticCurveTo(-8, -38, -6, -46);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(13, -48);
      ctx.quadraticCurveTo(15, -36, 10, -32);
      ctx.quadraticCurveTo(8, -38, 6, -46);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-9, -52);
      ctx.quadraticCurveTo(-3, -48, 0, -50);
      ctx.quadraticCurveTo(4, -48, 9, -52);
      ctx.lineTo(8, -58);
      ctx.lineTo(-8, -58);
      ctx.closePath();
      ctx.fill();
    } else {
      // NỮ CHIBI: TÓC ĐUÔI NGỰA CAO GỢN SÓNG (Mặc định / Bun)
      ctx.beginPath();
      ctx.moveTo(6, -55);
      ctx.quadraticCurveTo(18, -62, 16, -46);
      ctx.quadraticCurveTo(18, -32, 12, -25);
      ctx.quadraticCurveTo(14, -38, 8, -48);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(8, -55, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(0, -48, 14, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-13, -46);
      ctx.quadraticCurveTo(-10, -36, -8, -34);
      ctx.quadraticCurveTo(-7, -42, -5, -48);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(13, -46);
      ctx.quadraticCurveTo(10, -36, 8, -34);
      ctx.quadraticCurveTo(7, -42, 5, -48);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-9, -52);
      ctx.quadraticCurveTo(-3, -48, 0, -50);
      ctx.quadraticCurveTo(4, -48, 9, -52);
      ctx.lineTo(8, -58);
      ctx.lineTo(-8, -58);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    if (character.hairStyle === 'bun') {
      // NAM: BÚI TÓC THIỀN MÔN (Topknot)
      ctx.beginPath();
      ctx.arc(0, -62, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3, -59, 6, 2);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-6, -62);
      ctx.lineTo(6, -62);
      ctx.stroke();
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(0, -48, 14, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-9, -52);
      ctx.quadraticCurveTo(0, -48, 9, -52);
      ctx.lineTo(8, -56);
      ctx.lineTo(-8, -56);
      ctx.closePath();
      ctx.fill();
    } else {
      // NAM: TÓC NGẮN SPIKY TỈA GAI (Mặc định / Short)
      ctx.beginPath();
      ctx.arc(0, -47, 14, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-12, -52);
      ctx.lineTo(-17, -56);
      ctx.lineTo(-10, -58);
      ctx.lineTo(-6, -64);
      ctx.lineTo(-2, -60);
      ctx.lineTo(2, -65);
      ctx.lineTo(6, -60);
      ctx.lineTo(13, -62);
      ctx.lineTo(11, -56);
      ctx.lineTo(15, -53);
      ctx.lineTo(12, -48);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = hairHighlight;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5, -60);
      ctx.lineTo(0, -61);
      ctx.lineTo(5, -59);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-11, -50);
      ctx.lineTo(-7, -46);
      ctx.lineTo(-4, -51);
      ctx.lineTo(0, -46);
      ctx.lineTo(4, -51);
      ctx.lineTo(8, -46);
      ctx.lineTo(11, -50);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 8. Pháp Bảo Tùy Thân (Accessories from Concept Art)
  if (character.accessory === 'beads') {
    // Tràng hạt bồ đề đeo cổ
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, -26, 6.5, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (character.accessory === 'hat') {
    // Nón lá thiền
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(-16, -58);
    ctx.lineTo(0, -69);
    ctx.lineTo(16, -58);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (character.accessory === 'bag') {
    // Túi vải Phật tử: Nam chữ "An", Nữ hoa sen
    const bagColor = isFemale ? '#854d0e' : '#64748b';
    ctx.fillStyle = bagColor;
    ctx.fillRect(5, -23, 8, 10);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(5, -23, 8, 10);
    // Dây quai đeo chéo vai
    ctx.strokeStyle = bagColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -32);
    ctx.lineTo(6, -19);
    ctx.stroke();

    if (isFemale) {
      // Hoa sen nhỏ trên túi
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(9, -18, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Chữ "An" thư pháp tượng trưng
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 6px serif';
      ctx.textAlign = 'center';
      ctx.fillText('An', 9, -16);
    }
  }

  ctx.restore();
  ctx.restore();
}

// Particle Engine: Falling leaves, Petals, Fireflies, Incense
function updateAndDrawParticles(
  ctx: CanvasRenderingContext2D,
  particlesList: WorldParticle[],
  w: number,
  h: number,
  isRaining: boolean,
  timePhase: string,
  _step: number
): WorldParticle[] {
  // Spawn continuous leaves/petals
  if (particlesList.length < 50) {
    particlesList.push({
      x: Math.random() * w,
      y: 200 + Math.random() * 200,
      vx: 0.8 + Math.random() * 1.4,
      vy: 0.6 + Math.random() * 0.9,
      rot: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.04,
      size: 4 + Math.random() * 4,
      alpha: 0.75,
      color: Math.random() > 0.4 ? '#eab308' : '#fb7185',
      type: Math.random() > 0.4 ? 'leaf' : 'petal',
    });
  }

  // Spawn fireflies at night
  if (timePhase === 'EVENING' && particlesList.length < 75) {
    particlesList.push({
      x: 300 + Math.random() * 1800,
      y: 500 + Math.random() * 200,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      rot: 0,
      vRot: 0,
      size: 3,
      alpha: 0.8,
      color: '#4ade80',
      type: 'firefly',
    });
  }

  // Update & Draw
  const updated = particlesList.filter((p: WorldParticle) => {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vRot;

    if (p.type === 'incense') {
      p.alpha -= 0.008;
      p.size += 0.15;
    } else if (p.type === 'ripple') {
      p.alpha -= 0.02;
      p.size += 0.6;
    }

    if (p.y > h || p.x > w || p.alpha <= 0) return false;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.type === 'leaf' || p.type === 'petal') {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'firefly') {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#4ade80';
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'ripple') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Incense smoke cloud
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return true;
  });

  // Rain drops
  if (isRaining) {
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 40; r++) {
      const rx = (Math.random() * w + _step * 15) % w;
      const ry = (Math.random() * h + _step * 25) % h;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 6, ry + 16);
      ctx.stroke();
    }
  }

  return updated;
}
