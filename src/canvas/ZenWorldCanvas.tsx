import React, { useEffect, useRef, useState } from 'react';
import { useGameStore, ZONES } from '../store/gameStore';
import { soundEngine } from '../services/audioEngine';
import type { ZoneId, CharacterAppearance } from '../types/game';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  alpha: number;
  type: 'leaf' | 'rain' | 'smoke' | 'petal';
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  icon: string;
  zone: ZoneId;
  action: () => void;
}

export const ZenWorldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { stats, setModal, changeZone, triggerAntiRushCheck, addCongDuc, spendTamLuc } = useGameStore();
  const [playerPos, setPlayerPos] = useState({ x: 450, y: 380 });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [nearHotspot, setNearHotspot] = useState<Hotspot | null>(null);

  // Keyboard navigation tracking
  const keysDown = useRef<Record<string, boolean>>({});
  const particles = useRef<Particle[]>([]);

  // Calculate watercolor saturation filter based on Level (Level 1 = 35% color, Level 10+ = 100% full rich bloom)
  const saturationPercent = Math.min(100, 35 + (stats.level - 1) * 7);
  const brightnessPercent = Math.min(105, 88 + (stats.level - 1) * 2);

  // Hotspots definitions across zones
  const getHotspots = (): Hotspot[] => {
    switch (stats.currentZone) {
      case 'sanChua':
        return [
          {
            id: 'broom',
            x: 280,
            y: 420,
            radius: 50,
            label: 'Quét lá đa',
            icon: '🧹',
            zone: 'sanChua',
            action: () => setModal('sweep'),
          },
          {
            id: 'censer',
            x: 500,
            y: 290,
            radius: 50,
            label: 'Thắp tâm hương',
            icon: '🪔',
            zone: 'sanChua',
            action: () => {
              if (spendTamLuc(5)) {
                soundEngine.playSingingBowl();
                addCongDuc(15);
              }
            },
          },
          {
            id: 'monk-stairs',
            x: 720,
            y: 260,
            radius: 60,
            label: 'Vào Chánh Điện thính pháp',
            icon: '🏛️',
            zone: 'sanChua',
            action: () => {
              changeZone('chanhDien');
              setModal('dharma');
            },
          },
          {
            id: 'tea-corner',
            x: 750,
            y: 460,
            radius: 50,
            label: 'Bàn trà tiếp khách',
            icon: '🍵',
            zone: 'sanChua',
            action: () => setModal('guest'),
          },
        ];
      case 'chanhDien':
        return [
          {
            id: 'buddha-altar',
            x: 500,
            y: 240,
            radius: 60,
            label: 'Lạy Phật & Nghe Pháp',
            icon: '🧘',
            zone: 'chanhDien',
            action: () => setModal('dharma'),
          },
          {
            id: 'wooden-fish',
            x: 350,
            y: 350,
            radius: 45,
            label: 'Gõ mõ tụng kinh',
            icon: '🔔',
            zone: 'chanhDien',
            action: () => {
              soundEngine.playWoodenFish();
              addCongDuc(10);
            },
          },
          {
            id: 'exit-yard',
            x: 500,
            y: 520,
            radius: 60,
            label: 'Ra lại Sân Chùa',
            icon: '🚪',
            zone: 'chanhDien',
            action: () => changeZone('sanChua'),
          },
        ];
      case 'vuonTra':
        return [
          {
            id: 'tea-table',
            x: 450,
            y: 350,
            radius: 55,
            label: 'Pha ấm trà thơm',
            icon: '🍵',
            zone: 'vuonTra',
            action: () => setModal('tea'),
          },
          {
            id: 'lake-path',
            x: 820,
            y: 380,
            radius: 50,
            label: 'Sang Hồ Liên Hoa',
            icon: '🪷',
            zone: 'vuonTra',
            action: () => changeZone('hoLienHoa'),
          },
          {
            id: 'back-yard',
            x: 180,
            y: 380,
            radius: 50,
            label: 'Trở về Sân Chùa',
            icon: '⛩️',
            zone: 'vuonTra',
            action: () => changeZone('sanChua'),
          },
        ];
      case 'hoLienHoa':
        return [
          {
            id: 'lotus-bridge',
            x: 500,
            y: 360,
            radius: 60,
            label: 'Ngồi thiền bên hồ sen',
            icon: '🪷',
            zone: 'hoLienHoa',
            action: () => setModal('breathing'),
          },
          {
            id: 'back-tea',
            x: 180,
            y: 360,
            radius: 50,
            label: 'Về Vườn Trà',
            icon: '🌿',
            zone: 'hoLienHoa',
            action: () => changeZone('vuonTra'),
          },
        ];
      default:
        return [
          {
            id: 'return-home',
            x: 500,
            y: 450,
            radius: 50,
            label: 'Quay lại Sân Chùa',
            icon: '⛩️',
            zone: stats.currentZone,
            action: () => changeZone('sanChua'),
          },
        ];
    }
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysDown.current[key] = true;
      triggerAntiRushCheck();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysDown.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerAntiRushCheck]);

  // Click / Tap to move
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (triggerAntiRushCheck()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked directly on a hotspot
    const currentHotspots = getHotspots();
    for (const spot of currentHotspots) {
      const dist = Math.hypot(clickX - spot.x, clickY - spot.y);
      if (dist < spot.radius + 15) {
        spot.action();
        return;
      }
    }

    setTargetPos({ x: clickX, y: clickY });
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let stepCount = 0;

    // Initialize particles
    if (particles.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        particles.current.push({
          x: Math.random() * 1000,
          y: Math.random() * 600,
          vx: 0.5 + Math.random() * 1.2,
          vy: 0.4 + Math.random() * 0.8,
          size: 6 + Math.random() * 8,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.05,
          alpha: 0.4 + Math.random() * 0.5,
          type: stats.weather === 'rainy' ? 'rain' : 'leaf',
        });
      }
    }

    const render = () => {
      stepCount++;
      const width = canvas.width;
      const height = canvas.height;

      // --- 1. MOVEMENT UPDATE ---
      let vx = 0;
      let vy = 0;
      const speed = stats.tamSangBuff ? 4.2 : 3.0;

      if (keysDown.current['w'] || keysDown.current['arrowup']) vy -= speed;
      if (keysDown.current['s'] || keysDown.current['arrowdown']) vy += speed;
      if (keysDown.current['a'] || keysDown.current['arrowleft']) {
        vx -= speed;
        setFacingLeft(true);
      }
      if (keysDown.current['d'] || keysDown.current['arrowright']) {
        vx += speed;
        setFacingLeft(false);
      }

      setPlayerPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        // If target exists from mouse click
        if (targetPos) {
          const dx = targetPos.x - prev.x;
          const dy = targetPos.y - prev.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 5) {
            newX += (dx / dist) * speed;
            newY += (dy / dist) * speed;
            setFacingLeft(dx < 0);
            setIsWalking(true);
          } else {
            setTargetPos(null);
            setIsWalking(false);
          }
        } else if (vx !== 0 || vy !== 0) {
          newX += vx;
          newY += vy;
          setIsWalking(true);
        } else {
          setIsWalking(false);
        }

        // Keep inside bounds
        newX = Math.max(120, Math.min(880, newX));
        newY = Math.max(180, Math.min(540, newY));

        return { x: newX, y: newY };
      });

      // --- 2. CLEAR & BACKGROUND RENDER (WATERCOLOR STYLE) ---
      ctx.clearRect(0, 0, width, height);

      // Sky & Horizon gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (stats.timeOfDay === 'morning') {
        skyGrad.addColorStop(0, '#fef3c7'); // Soft amber sunrise
        skyGrad.addColorStop(0.4, '#fed7aa');
        skyGrad.addColorStop(1, '#e2e8f0');
      } else if (stats.timeOfDay === 'afternoon') {
        skyGrad.addColorStop(0, '#bfdbfe'); // Peaceful blue sky
        skyGrad.addColorStop(0.5, '#e0f2fe');
        skyGrad.addColorStop(1, '#f1f5f9');
      } else if (stats.timeOfDay === 'evening') {
        skyGrad.addColorStop(0, '#4a044e'); // Purple twilight
        skyGrad.addColorStop(0.5, '#c2410c'); // Sunset orange
        skyGrad.addColorStop(1, '#292524');
      } else {
        skyGrad.addColorStop(0, '#0f172a'); // Deep night
        skyGrad.addColorStop(0.6, '#1e293b');
        skyGrad.addColorStop(1, '#0c0a09');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant misty mountains (Watercolor silhouette layers)
      drawMountainSilhouette(ctx, 160, '#78716c', 0.25, width);
      drawMountainSilhouette(ctx, 220, '#57534e', 0.45, width);

      // --- 3. ZONE-SPECIFIC DRAWING ---
      if (stats.currentZone === 'sanChua') {
        drawMonasteryYard(ctx, width, height, stepCount);
      } else if (stats.currentZone === 'chanhDien') {
        drawChanhDienInterior(ctx, width, height, stepCount);
      } else if (stats.currentZone === 'vuonTra') {
        drawTeaGarden(ctx, width, height, stepCount);
      } else if (stats.currentZone === 'hoLienHoa') {
        drawLotusLake(ctx, width, height, stepCount);
      } else {
        drawGenericTempleRoom(ctx, width, height, ZONES[stats.currentZone].name);
      }

      // --- 4. HOTSPOTS & INTERACTIVE GLOWS ---
      const currentHotspots = getHotspots();
      let foundNear: Hotspot | null = null;

      currentHotspots.forEach((spot) => {
        const dist = Math.hypot(playerPos.x - spot.x, playerPos.y - spot.y);
        const isNear = dist < spot.radius + 35;
        if (isNear) foundNear = spot;

        // Draw pulsing aura ring
        ctx.save();
        const pulse = Math.sin(stepCount * 0.05) * 4;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.radius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = isNear ? 'rgba(245, 158, 11, 0.28)' : 'rgba(217, 119, 6, 0.12)';
        ctx.fill();
        ctx.lineWidth = isNear ? 2 : 1;
        ctx.strokeStyle = isNear ? '#fbbf24' : 'rgba(217, 119, 6, 0.4)';
        ctx.stroke();

        // Icon & text bubble
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(spot.icon, spot.x, spot.y - 2);

        // Label tag
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        const textWidth = ctx.measureText(spot.label).width;
        ctx.fillStyle = 'rgba(24, 20, 17, 0.82)';
        ctx.beginPath();
        ctx.roundRect(spot.x - textWidth / 2 - 8, spot.y + 24, textWidth + 16, 22, 6);
        ctx.fill();
        ctx.strokeStyle = isNear ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();

        ctx.fillStyle = isNear ? '#fef08a' : '#f5f5f4';
        ctx.fillText(spot.label, spot.x, spot.y + 35);
        ctx.restore();
      });

      setNearHotspot(foundNear);

      // --- 5. DRAW PLAYER CHARACTER ---
      drawZenPractitioner(ctx, playerPos.x, playerPos.y, facingLeft, isWalking, stepCount, stats.tamSangBuff, stats.character);

      // --- 6. PARTICLES (LEAVES / RAIN / INCENSE SMOKE) ---
      updateAndDrawParticles(ctx, width, height, stats.weather, stepCount);

      // --- 7. WEATHER OVERLAYS ---
      if (stats.weather === 'rainy') {
        ctx.fillStyle = 'rgba(30, 58, 138, 0.12)';
        ctx.fillRect(0, 0, width, height);
      } else if (stats.weather === 'misty') {
        const mistGrad = ctx.createLinearGradient(0, height - 200, 0, height);
        mistGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        mistGrad.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, height - 200, width, 200);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [playerPos, targetPos, facingLeft, isWalking, stats.currentZone, stats.weather, stats.timeOfDay, stats.tamSangBuff]);

  // Particle simulation helper
  const updateAndDrawParticles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    weather: string,
    step: number
  ) => {
    particles.current.forEach((p) => {
      p.x += p.vx + Math.sin(step * 0.02 + p.y * 0.01) * 0.5;
      p.y += p.vy;
      p.rotation += p.vRot;

      if (p.x > width + 20) p.x = -20;
      if (p.y > height + 20) {
        p.y = -10;
        p.x = Math.random() * width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (weather === 'rainy') {
        // Raindrop streak
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-2, 14);
        ctx.stroke();
      } else {
        // Golden / Amber maple / banyan leaf
        ctx.fillStyle = `rgba(217, 119, 6, ${p.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(180, 83, 9, ${p.alpha})`;
        ctx.stroke();
      }
      ctx.restore();
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-stone-950"
      style={{
        filter: `saturate(${saturationPercent}%) brightness(${brightnessPercent}%)`,
        transition: 'filter 1.5s ease-in-out',
      }}
    >
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        onClick={handleCanvasClick}
        className="w-full h-full object-contain cursor-pointer max-w-full max-h-full"
        style={{ touchAction: 'none' }}
      />

      {/* Touch / Tap-to-interact Prompt Button on Mobile */}
      {nearHotspot && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <button
            onClick={() => nearHotspot.action()}
            className="zen-btn-gold px-6 py-3 rounded-full text-base font-serif flex items-center gap-3 shadow-2xl animate-bounce"
          >
            <span className="text-xl">{nearHotspot.icon}</span>
            <span>{nearHotspot.label}</span>
          </button>
        </div>
      )}

      {/* Movement hint guide */}
      <div className="absolute bottom-4 left-6 z-10 hidden md:flex items-center gap-2 text-xs text-stone-400 bg-stone-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-800 pointer-events-none">
        <span>🎮 Phím [W A S D] hoặc click chuột để bước đi</span>
        <span className="text-amber-500">•</span>
        <span>Điềm tĩnh, không vội vã</span>
      </div>
    </div>
  );
};

// ==========================================
// CANVAS ARTWORK HELPERS (WATERCOLOR STYLE)
// ==========================================

function drawMountainSilhouette(
  ctx: CanvasRenderingContext2D,
  baseY: number,
  color: string,
  alpha: number,
  width: number
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(0, baseY);

  // Soft wavy mountain peaks
  const peaks = [
    { x: 0, y: baseY },
    { x: width * 0.15, y: baseY - 60 },
    { x: width * 0.35, y: baseY - 120 },
    { x: width * 0.55, y: baseY - 80 },
    { x: width * 0.75, y: baseY - 140 },
    { x: width * 0.9, y: baseY - 70 },
    { x: width, y: baseY },
  ];

  for (let i = 1; i < peaks.length; i++) {
    const prev = peaks[i - 1];
    const curr = peaks[i];
    const cpx = (prev.x + curr.x) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
  }
  ctx.lineTo(width, baseY + 120);
  ctx.lineTo(0, baseY + 120);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMonasteryYard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: number
) {
  // Ancient Stone Courtyard Floor
  const yardGrad = ctx.createLinearGradient(0, 240, 0, height);
  yardGrad.addColorStop(0, '#e7e5e4'); // Warm stone gray
  yardGrad.addColorStop(0.6, '#d6d3d1');
  yardGrad.addColorStop(1, '#a8a29e');
  ctx.fillStyle = yardGrad;
  ctx.fillRect(0, 240, width, height - 240);

  // Stone tiles grid (soft watercolor strokes)
  ctx.strokeStyle = 'rgba(120, 113, 108, 0.2)';
  ctx.lineWidth = 1;
  for (let y = 260; y < height; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let x = 60; x < width; x += 75) {
    ctx.beginPath();
    ctx.moveTo(x, 240);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Giant Banyan Tree (Cây Đa Cổ Thụ bên góc trái)
  ctx.save();
  // Trunk
  ctx.fillStyle = '#573c26';
  ctx.beginPath();
  ctx.moveTo(120, height);
  ctx.quadraticCurveTo(150, 400, 160, 280);
  ctx.quadraticCurveTo(190, 180, 220, 140);
  ctx.lineTo(260, 150);
  ctx.quadraticCurveTo(210, 280, 220, 400);
  ctx.lineTo(240, height);
  ctx.fill();

  // Foliage clusters (Watercolor green & gold sponges)
  const clusters = [
    { x: 180, y: 120, r: 90, color: '#2d4a22' },
    { x: 260, y: 100, r: 80, color: '#3f6212' },
    { x: 120, y: 160, r: 75, color: '#4d7c0f' },
    { x: 280, y: 160, r: 70, color: '#65a30d' },
  ];
  clusters.forEach((c) => {
    ctx.fillStyle = c.color;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Ancient Temple Gate & Curved Roof (Mái Chùa Cong Ngói Âm Dương)
  ctx.save();
  // Main building facade in center background
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(450, 180, 420, 110);

  // Pillars (Cột Gỗ Lim)
  ctx.fillStyle = '#451a03';
  for (let px = 470; px <= 850; px += 75) {
    ctx.fillRect(px, 180, 16, 110);
  }

  // Curved eaves (Mái ngói cong cổ kính)
  ctx.fillStyle = '#991b1b'; // Red-orange tile roof
  ctx.beginPath();
  ctx.moveTo(420, 180);
  ctx.quadraticCurveTo(660, 140, 900, 180);
  ctx.lineTo(920, 185);
  ctx.quadraticCurveTo(660, 130, 400, 185);
  ctx.closePath();
  ctx.fill();

  // Ridge decorations & wind chime swinging
  const chimeSway = Math.sin(step * 0.04) * 4;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(410, 185);
  ctx.lineTo(410 + chimeSway, 210);
  ctx.stroke();

  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(410 + chimeSway, 212, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Bronze Censer (Lư Hương Đồng giữa sân)
  ctx.save();
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(500, 310, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(492, 325, 16, 12);
  ctx.stroke();

  // Smoke curls rising from incense
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.45)';
  ctx.lineWidth = 1.5;
  for (let s = -6; s <= 6; s += 6) {
    ctx.beginPath();
    const smokeY = 300;
    const wave = Math.sin(step * 0.05 + s) * 8;
    ctx.moveTo(500 + s, smokeY);
    ctx.quadraticCurveTo(500 + s + wave, smokeY - 30, 500 + s + wave * 1.5, smokeY - 65);
    ctx.stroke();
  }
  ctx.restore();
}

function drawChanhDienInterior(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: number
) {
  // Sacred Golden Candlelight Interior
  const hallGrad = ctx.createLinearGradient(width / 2, 0, width / 2, height);
  hallGrad.addColorStop(0, '#2e1065');
  hallGrad.addColorStop(0.4, '#451a03');
  hallGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = hallGrad;
  ctx.fillRect(0, 0, width, height);

  // Pillars & Lotus altar
  ctx.fillStyle = '#78350f';
  ctx.fillRect(160, 80, 36, height - 80);
  ctx.fillRect(width - 196, 80, 36, height - 80);

  // Golden Buddha Statue Silhouette & Halo (Hào quang Phật vàng rực)
  ctx.save();
  const haloRadius = 75 + Math.sin(step * 0.03) * 6;
  const haloGrad = ctx.createRadialGradient(width / 2, 220, 20, width / 2, 220, haloRadius);
  haloGrad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
  haloGrad.addColorStop(0.6, 'rgba(217, 119, 6, 0.4)');
  haloGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(width / 2, 220, haloRadius, 0, Math.PI * 2);
  ctx.fill();

  // Buddha in meditation
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(width / 2, 200, 28, 0, Math.PI * 2); // Head
  ctx.fill();
  // Shoulders & robe
  ctx.beginPath();
  ctx.moveTo(width / 2 - 50, 280);
  ctx.quadraticCurveTo(width / 2, 225, width / 2 + 50, 280);
  ctx.closePath();
  ctx.fill();

  // Lotus cushions for monks & practitioners
  const cushions = [320, 420, 580, 680];
  cushions.forEach((cx) => {
    ctx.fillStyle = '#831843';
    ctx.beginPath();
    ctx.ellipse(cx, 460, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fb7185';
    ctx.stroke();
  });
  ctx.restore();
}

function drawTeaGarden(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: number
) {
  // Lush Green Tea Terraces & Bamboo Grove
  const gardenGrad = ctx.createLinearGradient(0, 200, 0, height);
  gardenGrad.addColorStop(0, '#14532d');
  gardenGrad.addColorStop(0.5, '#166534');
  gardenGrad.addColorStop(1, '#15803d');
  ctx.fillStyle = gardenGrad;
  ctx.fillRect(0, 200, width, height - 200);

  // Bamboo stalks in background
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 5;
  for (let bx = 60; bx < width; bx += 35) {
    const bend = Math.sin(step * 0.03 + bx) * 4;
    ctx.beginPath();
    ctx.moveTo(bx, height);
    ctx.quadraticCurveTo(bx + bend, 250, bx + bend * 1.5, 60);
    ctx.stroke();
  }

  // Tea pavilion table
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.ellipse(450, 350, 40, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ceramic teapot and cups
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(450, 345, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawLotusLake(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: number
) {
  // Water surface with soft turquoise reflection
  const waterGrad = ctx.createLinearGradient(0, 180, 0, height);
  waterGrad.addColorStop(0, '#0f766e');
  waterGrad.addColorStop(0.6, '#115e59');
  waterGrad.addColorStop(1, '#134e4a');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, 180, width, height - 180);

  // Water ripples
  ctx.strokeStyle = 'rgba(204, 251, 241, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const rx = 200 + ((i * 120 + step) % width);
    const ry = 240 + (i * 45) % (height - 260);
    ctx.beginPath();
    ctx.ellipse(rx, ry, 35, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Lotus flowers and pads
  const pads = [
    { x: 320, y: 280, hasFlower: true },
    { x: 620, y: 320, hasFlower: true },
    { x: 420, y: 440, hasFlower: false },
    { x: 740, y: 420, hasFlower: true },
  ];

  pads.forEach((p) => {
    // Green pad
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 28, 14, 0, 0, Math.PI * 1.85);
    ctx.fill();

    if (p.hasFlower) {
      // Pink blossom
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 8, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Wooden meditation bridge
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(440, 240, 120, 180);
  ctx.strokeStyle = '#573c26';
  ctx.lineWidth = 2;
  for (let by = 250; by < 420; by += 20) {
    ctx.beginPath();
    ctx.moveTo(440, by);
    ctx.lineTo(560, by);
    ctx.stroke();
  }
}

function drawGenericTempleRoom(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string
) {
  ctx.fillStyle = '#292524';
  ctx.fillRect(0, 180, width, height - 180);
  ctx.fillStyle = '#d6d3d1';
  ctx.font = '24px "Noto Serif", serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 300);
}

// Character Avatar with walking bob, customized monk robe, hair, accessory and Tam Sang aura
function drawZenPractitioner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facingLeft: boolean,
  isWalking: boolean,
  step: number,
  hasTamSangBuff: boolean,
  character?: CharacterAppearance
) {
  ctx.save();
  ctx.translate(x, y);
  if (facingLeft) ctx.scale(-1, 1);

  // Bobbing animation
  const bob = isWalking ? Math.sin(step * 0.25) * 3 : Math.sin(step * 0.05) * 1.5;

  // Robe color selection
  let robeColor = '#3b82f6';
  if (character?.robeColor === 'nau') robeColor = '#78350f';
  else if (character?.robeColor === 'xam') robeColor = '#57534e';
  else if (character?.robeColor === 'bach') robeColor = '#f8fafc';

  // "Tâm Sáng" Aura glow
  if (hasTamSangBuff) {
    ctx.save();
    const auraPulse = 30 + Math.sin(step * 0.1) * 6;
    const auraGrad = ctx.createRadialGradient(0, -30 + bob, 10, 0, -30 + bob, auraPulse);
    auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
    auraGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -30 + bob, auraPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs / feet
  ctx.fillStyle = '#57534e';
  const legOffset = isWalking ? Math.sin(step * 0.25) * 6 : 0;
  ctx.fillRect(-6 + legOffset, -8 + bob, 4, 8);
  ctx.fillRect(2 - legOffset, -8 + bob, 4, 8);

  // Robe body
  ctx.fillStyle = robeColor;
  ctx.beginPath();
  ctx.moveTo(-10, -10 + bob);
  ctx.lineTo(10, -10 + bob);
  ctx.lineTo(8, -36 + bob);
  ctx.lineTo(-8, -36 + bob);
  ctx.closePath();
  ctx.fill();

  // Golden scarf / belt sash
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-9, -24 + bob, 18, 4);

  // Accessory: Shoulder Bag (Túi vải chàm)
  if (character?.accessory === 'bag') {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(4, -28 + bob, 6, 8);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, -34 + bob);
    ctx.lineTo(4, -28 + bob);
    ctx.stroke();
  }

  // Head & serene face
  ctx.fillStyle = '#fed7aa'; // Skin tone
  ctx.beginPath();
  ctx.arc(0, -44 + bob, 10, 0, Math.PI * 2);
  ctx.fill();

  // Hair styles
  const hairStyle = character?.hairStyle || 'short';
  if (hairStyle === 'short') {
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, -46 + bob, 9, Math.PI, Math.PI * 2);
    ctx.fill();
  } else if (hairStyle === 'bun') {
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, -46 + bob, 9, Math.PI, Math.PI * 2);
    ctx.fill();
    // Bun on top
    ctx.beginPath();
    ctx.arc(0, -56 + bob, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, -56 + bob, 4, 2);
  } else if (hairStyle === 'shaved') {
    // Dot on forehead
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(0, -47 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Accessory: Hat (Nón lá)
  if (character?.accessory === 'hat') {
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-16, -50 + bob);
    ctx.lineTo(0, -60 + bob);
    ctx.lineTo(16, -50 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Accessory: Bodhi Beads Necklace (Chuỗi hạt bồ đề)
  if (character?.accessory === 'beads') {
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -32 + bob, 7, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -27 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Peaceful smiling eyes
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(3, -44 + bob, 2, 0, Math.PI); // Gentle curved eye
  ctx.stroke();

  ctx.restore();
}
