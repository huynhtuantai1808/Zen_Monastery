import * as THREE from 'three';

// =======================================================================
// SHARED PROCEDURAL TEXTURE CACHE & LIFECYCLE MANAGEMENT
// =======================================================================

const sharedTextureMap = new Map<string, THREE.CanvasTexture>();

/**
 * Trả về texture dùng chung từ bộ đệm hoặc tạo mới và lưu đệm nếu chưa có
 */
export function getSharedTexture(key: string, generator: () => THREE.CanvasTexture): THREE.CanvasTexture {
  const existing = sharedTextureMap.get(key);
  if (existing) {
    return existing;
  }
  const created = generator();
  sharedTextureMap.set(key, created);
  return created;
}

/**
 * Giải phóng toàn bộ Canvas Textures khỏi GPU VRAM khi unmount
 */
export function disposeSharedTextures(): void {
  sharedTextureMap.forEach((tex) => {
    tex.dispose();
  });
  sharedTextureMap.clear();
}

// =======================================================================
// STYLIZED TOON / HAND-PAINTED TEXTURE GENERATORS
// =======================================================================

export function createStylizedWoodTexture(): THREE.CanvasTexture {
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

export function createStylizedBrickTexture(): THREE.CanvasTexture {
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

export function createStylizedRoofTexture(): THREE.CanvasTexture {
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

export function createStylizedStoneTexture(): THREE.CanvasTexture {
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

export function createStylizedJadeRoofTexture(): THREE.CanvasTexture {
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

export function createStylizedAmberWoodTexture(): THREE.CanvasTexture {
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

export function createStylizedLotusPlinthTexture(): THREE.CanvasTexture {
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
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(x + pw / 2, y + 4);
      ctx.quadraticCurveTo(x + pw - 2, y + ph / 2, x + pw / 2, y + ph - 4);
      ctx.quadraticCurveTo(x + 2, y + ph / 2, x + pw / 2, y + 4);
      ctx.fill();

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(x + pw / 2, y + 8);
      ctx.quadraticCurveTo(x + pw - 8, y + ph / 2, x + pw / 2, y + ph - 8);
      ctx.quadraticCurveTo(x + 8, y + ph / 2, x + pw / 2, y + 8);
      ctx.fill();

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
// THƯ PHÁP CHỮ HÁN THẾP VÀNG HOÀNH PHI & CÂU ĐỐI CHÍNH ĐIỆN
// =======================================================================

export function createDaiHungBaoDienPlaqueTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 280;
  const ctx = c.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 280);
  bgGrad.addColorStop(0, '#58111a');
  bgGrad.addColorStop(0.5, '#7f1d1d');
  bgGrad.addColorStop(1, '#450a0a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 280);

  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 1004, 260);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.strokeRect(22, 22, 980, 236);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 968, 224);

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

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(512, 22, 7, 0, Math.PI * 2);
  ctx.fill();

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

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 132px "Noto Serif", "Songti SC", "SimSun", "STSong", "KaiTi", serif';

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

  const chars = ['大', '雄', '寶', '殿'];
  const charSpacing = 175;
  chars.forEach((ch, idx) => {
    const x = 512 + (idx - 1.5) * charSpacing;
    ctx.fillText(ch, x, 140);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.strokeText(ch, x, 140);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

export function createSideCalligraphyPlaqueTexture(text: string): THREE.CanvasTexture {
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

export function createCoupletTexture(text: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 1024;
  const ctx = c.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 256, 0);
  bgGrad.addColorStop(0, '#3f0c10');
  bgGrad.addColorStop(0.25, '#7f1d1d');
  bgGrad.addColorStop(0.75, '#881337');
  bgGrad.addColorStop(1, '#3f0c10');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 256, 1024);

  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 240, 1008);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(16, 16, 224, 992);

  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(128, 42, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(128, 982, 10, 0, Math.PI * 2);
  ctx.fill();

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

export function createIncenseSignTexture(): THREE.CanvasTexture {
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
  ctx.font = 'bold 72px "Noto Serif", "Songti SC", serif';
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = 'rgba(254, 240, 138, 0.85)';
  ctx.shadowBlur = 10;
  ctx.fillText('敬 香 區', 256, 75);

  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#fde68a';
  ctx.shadowBlur = 6;
  ctx.fillText('KHU VỰC THẮP NHANG', 256, 150);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

export function createAbbotFaceTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffedd5';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#b45309';
  [95, 115, 135].forEach((y) => {
    ctx.beginPath();
    ctx.arc(256, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

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

  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(205, 255, 28, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(307, 255, 28, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

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

  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(256, 320, 22, 0.2, Math.PI - 0.2);
  ctx.stroke();

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

export function createTueTinhFaceTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffedd5';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#d97706';
  [100, 118, 136].forEach((y) => {
    ctx.beginPath();
    ctx.arc(256, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

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

