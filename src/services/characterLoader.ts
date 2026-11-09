import * as THREE from 'three';
import type { CharacterAppearance, RobeColorType } from '../types/game';

export interface ChibiCharacterRig {
  modelGroup: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: {
    walk: THREE.AnimationAction;
    idle: THREE.AnimationAction;
    sit: THREE.AnimationAction;
    incenseBow: THREE.AnimationAction;
    meditationBow: THREE.AnimationAction;
  };
  incenseBundle?: THREE.Group;
  meritHaloGroup?: THREE.Group;
  updateMeritHalo?: (merit: number, level: number) => void;
}

export type RealisticCharacterRig = ChibiCharacterRig;

// Bảng màu Pháp phục Phật tử (Đồ Lam, Nâu Sồng, Xám Khói, Bạch Y) đồng bộ hoàn toàn với CharacterCreationModal và ZenCharacterSprite
export const SHIRT_PALETTES: Record<
  RobeColorType,
  {
    maleShirt: number;
    femaleShirt: number;
    pants: number;
    button: number;
    name: string;
  }
> = {
  lam: {
    maleShirt: 0x8ea3b7, // Xanh lam Phật tử truyền thống chuẩn mẫu thiết kế
    femaleShirt: 0x8ea3b7,
    pants: 0x7a8f9f,
    button: 0x334155,
    name: 'Đồ Lam Phật Tử',
  },
  nau: {
    maleShirt: 0xa86a45, // Nâu sồng thiền môn mộc mạc
    femaleShirt: 0xa86a45,
    pants: 0x935632,
    button: 0x451a03,
    name: 'Nâu Sồng Thiền Môn',
  },
  xam: {
    maleShirt: 0x94a3b8, // Xám khói thanh đạm
    femaleShirt: 0x94a3b8,
    pants: 0x788494,
    button: 0x1e293b,
    name: 'Xám Khói Thiền Tịnh',
  },
  bach: {
    maleShirt: 0xf8fafc, // Bạch y thuần khiết
    femaleShirt: 0xf8fafc,
    pants: 0xe2e8f0,
    button: 0x475569,
    name: 'Bạch Y Thuần Khiết',
  },
};

/** Tạo Gradient Toon cho hiệu ứng đổ bóng Cel-shading hoạt họa anime */
function makeToonGradient(): THREE.DataTexture {
  const size = 128;
  const data = new Uint8Array(size * 4);
  for (let i = 0; i < size; i++) {
    const v = i < 35 ? 130 : i < 75 ? 195 : 255;
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

const toonGrad = makeToonGradient();

function makeToonMat(color: number, opts: Partial<THREE.MeshToonMaterialParameters> = {}): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: toonGrad,
    ...opts,
  });
}

/** Vẽ ngũ quan khuôn mặt Chibi Anime sắc nét độ phân giải cao lên CanvasTexture */
function createChibiFaceTexture(isFemale: boolean, isShaved: boolean): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Nền da mịn màng
  ctx.fillStyle = '#ffedd5';
  ctx.fillRect(0, 0, W, H);

  // Má hồng ửng đào (Blush)
  const blushColor = isFemale ? 'rgba(244, 63, 94, 0.45)' : 'rgba(251, 146, 60, 0.4)';
  ctx.fillStyle = blushColor;
  ctx.beginPath();
  ctx.ellipse(150, 275, 42, 22, 0, 0, Math.PI * 2);
  ctx.ellipse(362, 275, 42, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Vệt má hồng anime cute
  ctx.strokeStyle = isFemale ? '#f43f5e' : '#ea580c';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  [-1, 0, 1].forEach((off) => {
    ctx.beginPath();
    ctx.moveTo(150 + off * 14 - 10, 268);
    ctx.lineTo(150 + off * 14 + 10, 282);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(362 + off * 14 - 10, 268);
    ctx.lineTo(362 + off * 14 + 10, 282);
    ctx.stroke();
  });

  // Vẽ đôi mắt Anime Chibi to tròn lấp lánh (Sparkling Anime Eyes)
  const drawAnimeEye = (cx: number) => {
    // Tròng mắt elip sâu
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(cx, 225, 34, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sắc hổ phách ấm sáng ở nửa dưới
    const irisGrad = ctx.createLinearGradient(cx, 205, cx, 273);
    irisGrad.addColorStop(0, '#2d1a0e');
    irisGrad.addColorStop(0.5, '#78350f');
    irisGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 235, 30, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    // Đồng tử đen sâu thẳm
    ctx.fillStyle = '#0f0a06';
    ctx.beginPath();
    ctx.arc(cx, 228, 16, 0, Math.PI * 2);
    ctx.fill();

    // Đốm sáng phản chiếu lớn (Chibi Sparkle Highlight)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - 10, 205, 12, 16, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Đốm sáng phụ nhỏ góc đối diện
    ctx.beginPath();
    ctx.arc(cx + 12, 245, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx - 6, 252, 4, 0, Math.PI * 2);
    ctx.fill();

    // Đường viền mi mắt trên cong dày chuẩn anime
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = isFemale ? 6.5 : 5.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, 218, 38, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Đuôi mi cong kiêu sa cho nữ
    if (isFemale) {
      ctx.beginPath();
      const wingDir = cx > 256 ? 1 : -1;
      ctx.moveTo(cx + wingDir * 32, 200);
      ctx.lineTo(cx + wingDir * 42, 192);
      ctx.stroke();
    }
  };

  drawAnimeEye(170);
  drawAnimeEye(342);

  // Lông mày thanh tú
  ctx.strokeStyle = '#3f2e24';
  ctx.lineWidth = isFemale ? 3.5 : 5.0;
  ctx.lineCap = 'round';
  if (isFemale) {
    ctx.beginPath();
    ctx.arc(170, 185, 42, Math.PI * 1.25, Math.PI * 1.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(342, 185, 42, Math.PI * 1.3, Math.PI * 1.75);
    ctx.stroke();
  } else {
    // Lông mày kiếm cương nghị tự tin
    ctx.beginPath();
    ctx.moveTo(130, 168);
    ctx.lineTo(205, 160);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(382, 168);
    ctx.lineTo(307, 160);
    ctx.stroke();
  }

  // Nụ cười mỉm Chibi tươi tắn
  ctx.strokeStyle = '#c2410c';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(256, 290, 16, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  // Mũi nhỏ xíu dễ thương
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(256, 270, 3, 0, Math.PI * 2);
  ctx.fill();

  // 3 Chấm Giới Hương thiền môn nếu quy y cạo đầu
  if (isShaved) {
    ctx.fillStyle = '#d97706';
    [110, 128, 146].forEach((y) => {
      ctx.beginPath();
      ctx.arc(256, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Xây dựng Mô hình Nhân vật 3D Anime Chibi chuẩn Mẫu Thiết Kế Đồ Lam Phật Tử
 * Hoàn toàn đồng bộ với CharacterCreationModal, ZenCharacterSprite và ZenOpenWorld
 */
export async function loadChibiCharacter(character: CharacterAppearance): Promise<ChibiCharacterRig> {
  const isFemale = character.gender === 'female';
  const isShaved = character.hairStyle === 'shaved';

  const palette = SHIRT_PALETTES[character.robeColor] || SHIRT_PALETTES.lam;
  const shirtColor = isFemale ? palette.femaleShirt : palette.maleShirt;
  const pantsColor = palette.pants;
  const buttonColor = palette.button;
  const hairColor = 0x3f2e24; // Nâu trầm tự nhiên
  const hairHighlight = 0x5c4033;
  const skinColor = 0xffedd5;

  // Root Model Group
  const model = new THREE.Group();
  model.name = 'ChibiCharacterRig';

  // Base Hips Center
  const hip = new THREE.Group();
  hip.name = 'Hip';
  hip.position.set(0, 0.58, 0);
  model.add(hip);

  // Materials
  const matShirt = makeToonMat(shirtColor);
  const matPants = makeToonMat(pantsColor);
  const matSkin = makeToonMat(skinColor);
  const matButton = makeToonMat(buttonColor);
  const matHair = makeToonMat(hairColor);
  const matHairHi = makeToonMat(hairHighlight);
  const matGold = makeToonMat(0xf59e0b); // Hoa sen & hạt mẹ vàng
  const matWood = makeToonMat(0x78350f); // Chuỗi bồ đề gỗ
  const matTassel = makeToonMat(0xd97706); // Tua rua vàng cam

  // Đáy quần Phật tử (Pelvis / Crotch) - Kết nối tự nhiên hai ống quần
  const pelvisGeo = new THREE.CylinderGeometry(0.20, 0.17, 0.16, 14);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, matPants);
  pelvisMesh.position.set(0, -0.05, 0);
  hip.add(pelvisMesh);

  // ==========================================
  // 1. TORSO & ĐỒ LAM PHẬT TỬ
  // ==========================================
  const torso = new THREE.Group();
  torso.name = 'Torso';
  hip.add(torso);

  if (isFemale) {
    // -----------------------------------------------------------------
    // NỮ: ÁO TRÀNG LAM DÁNG DÀI THƯỚT THA XẺ TÀ HÔNG + HOA SEN THÊU NGỰC
    // -----------------------------------------------------------------
    // Thân áo trên (Bodice)
    const bodiceGeo = new THREE.CylinderGeometry(0.22, 0.23, 0.28, 16);
    const bodiceMesh = new THREE.Mesh(bodiceGeo, matShirt);
    bodiceMesh.position.set(0, 0.24, 0);
    bodiceMesh.castShadow = true;
    bodiceMesh.receiveShadow = true;
    torso.add(bodiceMesh);

    // Cổ tàu ôm sát trang nhã (Mandarin collar)
    const collarGeo = new THREE.CylinderGeometry(0.088, 0.09, 0.05, 16);
    const collarMesh = new THREE.Mesh(collarGeo, matShirt);
    collarMesh.position.set(0, 0.39, 0);
    torso.add(collarMesh);

    // Khuy cài vải chéo vai phải (Frog buttons)
    const btn1 = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), matButton);
    btn1.position.set(0.04, 0.35, 0.22);
    torso.add(btn1);
    const btn2 = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), matButton);
    btn2.position.set(0.075, 0.31, 0.21);
    torso.add(btn2);

    const seamGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.11, 6);
    const seamMesh = new THREE.Mesh(seamGeo, matButton);
    seamMesh.position.set(0.055, 0.33, 0.215);
    seamMesh.rotation.set(0, 0, -Math.PI / 4);
    torso.add(seamMesh);

    // ĐÓA HOA SEN VÀNG THÊU TRÊN NGỰC ÁO LAM NỮ (Lotus Embroidery)
    const lotusGroup = new THREE.Group();
    lotusGroup.position.set(-0.065, 0.26, 0.225);
    const centerPetal = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.04, 8), matGold);
    centerPetal.rotation.x = 0.2;
    lotusGroup.add(centerPetal);
    const petalL = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.034, 8), matGold);
    petalL.position.set(-0.018, -0.004, 0);
    petalL.rotation.z = 0.45;
    lotusGroup.add(petalL);
    const petalR = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.034, 8), matGold);
    petalR.position.set(0.018, -0.004, 0);
    petalR.rotation.z = -0.45;
    lotusGroup.add(petalR);
    torso.add(lotusGroup);

    // TÀ ÁO DÀI THƯỚT THA XẺ TÀ HÔNG (Buông qua đầu gối xuống 3/4 chân)
    // Tà trước (Front Flap)
    const frontFlapGeo = new THREE.BoxGeometry(0.34, 0.46, 0.03);
    const frontFlap = new THREE.Mesh(frontFlapGeo, matShirt);
    frontFlap.position.set(0, -0.09, 0.13);
    frontFlap.rotation.x = -0.06;
    frontFlap.castShadow = true;
    torso.add(frontFlap);

    // Tà sau (Back Flap)
    const backFlapGeo = new THREE.BoxGeometry(0.34, 0.46, 0.03);
    const backFlap = new THREE.Mesh(backFlapGeo, matShirt);
    backFlap.position.set(0, -0.09, -0.13);
    backFlap.rotation.x = 0.06;
    backFlap.castShadow = true;
    torso.add(backFlap);
  } else {
    // -----------------------------------------------------------------
    // NAM: ÁO LAM PHẬT TỬ CỔ TÀU BUÔNG NGOÀI QUẦN XẺ TÀ ĐÙI
    // -----------------------------------------------------------------
    // Thân áo buông qua hông tới giữa đùi (không có thắt lưng da!)
    const tunicGeo = new THREE.CylinderGeometry(0.24, 0.255, 0.46, 16);
    const tunicMesh = new THREE.Mesh(tunicGeo, matShirt);
    tunicMesh.position.set(0, 0.15, 0);
    tunicMesh.castShadow = true;
    tunicMesh.receiveShadow = true;
    torso.add(tunicMesh);

    // Cổ tàu đứng (Mandarin collar)
    const collarGeo = new THREE.CylinderGeometry(0.092, 0.095, 0.055, 16);
    const collarMesh = new THREE.Mesh(collarGeo, matShirt);
    collarMesh.position.set(0, 0.39, 0);
    torso.add(collarMesh);

    // 2 khuy cài vải chéo vai phải
    const btn1 = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), matButton);
    btn1.position.set(0.045, 0.34, 0.23);
    torso.add(btn1);
    const btn2 = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), matButton);
    btn2.position.set(0.08, 0.29, 0.22);
    torso.add(btn2);

    const seamGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6);
    const seamMesh = new THREE.Mesh(seamGeo, matButton);
    seamMesh.position.set(0.06, 0.315, 0.225);
    seamMesh.rotation.set(0, 0, -Math.PI / 4);
    torso.add(seamMesh);
  }

  // Cổ da (Neck)
  const neckGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.08, 12);
  const neckMesh = new THREE.Mesh(neckGeo, matSkin);
  neckMesh.position.set(0, 0.42, 0);
  torso.add(neckMesh);

  // ==========================================
  // 2. ĐẦU & KHUÔN MẶT CHIBI ANIME
  // ==========================================
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.58, 0);
  torso.add(head);

  // Đầu Chibi to tròn đáng yêu
  const headGeo = new THREE.SphereGeometry(0.28, 24, 20);
  const faceTex = createChibiFaceTexture(isFemale, isShaved);
  const matFace = new THREE.MeshToonMaterial({
    map: faceTex,
    gradientMap: toonGrad,
  });
  const headMesh = new THREE.Mesh(headGeo, matFace);
  headMesh.rotation.y = Math.PI; // Hướng khuôn mặt về phía trước z+ (Chuẩn 180 độ cho SphereGeometry UV map)
  headMesh.castShadow = true;
  head.add(headMesh);

  // ==========================================
  // VẦNG HÀO QUANG PHƯỚC BÁU (BUDDHIST MERIT HALO)
  // Tỏa sáng rạng ngời phía sau đầu nhân vật, tỷ lệ thuận với điểm công đức
  // ==========================================
  const meritHaloGroup = new THREE.Group();
  meritHaloGroup.name = 'MeritHalo';
  meritHaloGroup.position.set(0, 0.08, -0.32);

  // 1. Vòng tròn hào quang ngoài cùng (Outer Wisdom Ring)
  const outerRingGeo = new THREE.RingGeometry(0.32, 0.44, 32);
  const matHaloOuter = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const outerRing = new THREE.Mesh(outerRingGeo, matHaloOuter);
  meritHaloGroup.add(outerRing);

  // 2. Vòng hoa sen / Bát Chánh Đạo bên trong (Inner 8-Spoke Mandala Ring)
  const innerRingGeo = new THREE.RingGeometry(0.18, 0.28, 24);
  const matHaloInner = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const innerRing = new THREE.Mesh(innerRingGeo, matHaloInner);
  meritHaloGroup.add(innerRing);

  // 3. 8 Tia hào quang Bát Chánh Đạo (Eightfold Path Sunburst Rays)
  const raysGroup = new THREE.Group();
  raysGroup.name = 'RaysGroup';
  const rayGeo = new THREE.BoxGeometry(0.024, 0.16, 0.005);
  for (let ri = 0; ri < 8; ri++) {
    const rayMesh = new THREE.Mesh(rayGeo, matHaloInner);
    const rAngle = (ri / 8) * Math.PI * 2;
    rayMesh.rotation.z = rAngle;
    rayMesh.position.set(Math.cos(rAngle) * 0.30, Math.sin(rAngle) * 0.30, 0);
    raysGroup.add(rayMesh);
  }
  meritHaloGroup.add(raysGroup);

  // 4. Vầng sáng tâm thức ấm áp ở tâm (Central Golden Aura Disc)
  const centerGlowGeo = new THREE.CircleGeometry(0.30, 24);
  const matHaloGlow = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const centerGlow = new THREE.Mesh(centerGlowGeo, matHaloGlow);
  meritHaloGroup.add(centerGlow);

  // 5. Nguồn sáng điểm ấm áp chiếu rạng sau gáy (Point Light)
  const haloLight = new THREE.PointLight(0xfde047, 0.6, 4.0);
  haloLight.position.set(0, 0, 0.1);
  meritHaloGroup.add(haloLight);

  head.add(meritHaloGroup);

  const updateMeritHalo = (merit: number, level: number = 1) => {
    const mFactor = Math.min(1.0, Math.max(0.12, merit / 650));
    const lvFactor = Math.min(1.0, Math.max(0.1, level / 20));
    const power = Math.min(1.0, mFactor * 0.75 + lvFactor * 0.25);

    matHaloOuter.opacity = 0.20 + power * 0.75;
    matHaloInner.opacity = 0.25 + power * 0.70;
    matHaloGlow.opacity = 0.12 + power * 0.48;
    haloLight.intensity = 0.25 + power * 1.85;
    haloLight.distance = 2.5 + power * 2.5;

    const targetScale = 0.75 + power * 0.45;
    meritHaloGroup.scale.set(targetScale, targetScale, targetScale);
  };

  // Tai hai bên (Ears)
  const earGeo = new THREE.SphereGeometry(0.045, 10, 8);
  const earL = new THREE.Mesh(earGeo, matSkin);
  earL.position.set(-0.28, 0, 0);
  earL.scale.set(0.6, 1.2, 0.8);
  head.add(earL);

  const earR = new THREE.Mesh(earGeo, matSkin);
  earR.position.set(0.28, 0, 0);
  earR.scale.set(0.6, 1.2, 0.8);
  head.add(earR);

  // Mái Tóc Chibi 3D
  const hairGroup = new THREE.Group();
  hairGroup.name = 'Hair';
  head.add(hairGroup);

  if (!isShaved) {
    // Mũ tóc ôm nửa sau đầu
    const hairCapGeo = new THREE.SphereGeometry(0.295, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const hairCap = new THREE.Mesh(hairCapGeo, matHair);
    hairCap.position.set(0, 0.01, -0.02);
    hairGroup.add(hairCap);

    if (isFemale) {
      if (character.hairStyle === 'short') {
        // NỮ CHIBI: TÓC BOB NGẮN THANH TÚ
        const bobLGeo = new THREE.CylinderGeometry(0.065, 0.045, 0.22, 10);
        const bobL = new THREE.Mesh(bobLGeo, matHair);
        bobL.position.set(-0.24, -0.04, 0.08);
        bobL.rotation.set(0.2, 0.1, 0.18);
        hairGroup.add(bobL);

        const bobR = new THREE.Mesh(bobLGeo, matHair);
        bobR.position.set(0.24, -0.04, 0.08);
        bobR.rotation.set(0.2, -0.1, -0.18);
        hairGroup.add(bobR);

        const frontBangGeo = new THREE.SphereGeometry(0.09, 10, 8);
        const frontBang = new THREE.Mesh(frontBangGeo, matHair);
        frontBang.position.set(-0.04, 0.19, 0.22);
        frontBang.scale.set(1.5, 0.5, 0.7);
        hairGroup.add(frontBang);

        const sideBangsL = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.18, 8), matHair);
        sideBangsL.position.set(-0.23, -0.03, 0.15);
        sideBangsL.rotation.set(0.25, 0.15, 0.15);
        hairGroup.add(sideBangsL);

        const sideBangsR = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.18, 8), matHair);
        sideBangsR.position.set(0.23, -0.03, 0.15);
        sideBangsR.rotation.set(0.25, -0.15, -0.15);
        hairGroup.add(sideBangsR);
      } else {
        // NỮ CHIBI: TÓC ĐUÔI NGỰA CAO GỢN SÓNG (Mặc định / Bun)
        const tieGeo = new THREE.TorusGeometry(0.045, 0.02, 8, 16);
        const matTie = makeToonMat(0xf43f5e);
        const tieMesh = new THREE.Mesh(tieGeo, matTie);
        tieMesh.position.set(0.12, 0.24, -0.16);
        tieMesh.rotation.set(0.6, 0.4, 0);
        hairGroup.add(tieMesh);

        const ponyPoints = [
          new THREE.Vector3(0.12, 0.24, -0.16),
          new THREE.Vector3(0.26, 0.16, -0.18),
          new THREE.Vector3(0.30, 0.02, -0.10),
          new THREE.Vector3(0.28, -0.15, -0.02),
          new THREE.Vector3(0.24, -0.28, 0.05),
        ];
        const curve = new THREE.CatmullRomCurve3(ponyPoints);
        const ponyGeo = new THREE.TubeGeometry(curve, 20, 0.065, 10, false);
        const ponyMesh = new THREE.Mesh(ponyGeo, matHair);
        hairGroup.add(ponyMesh);

        const sideBangsLGeo = new THREE.ConeGeometry(0.038, 0.22, 8);
        const sideBangsL = new THREE.Mesh(sideBangsLGeo, matHair);
        sideBangsL.position.set(-0.25, -0.05, 0.14);
        sideBangsL.rotation.set(0.3, 0.2, 0.15);
        hairGroup.add(sideBangsL);

        const sideBangsRGeo = new THREE.ConeGeometry(0.038, 0.22, 8);
        const sideBangsR = new THREE.Mesh(sideBangsRGeo, matHair);
        sideBangsR.position.set(0.25, -0.05, 0.14);
        sideBangsR.rotation.set(0.3, -0.2, -0.15);
        hairGroup.add(sideBangsR);

        const frontBangGeo = new THREE.SphereGeometry(0.09, 10, 8);
        const frontBang = new THREE.Mesh(frontBangGeo, matHair);
        frontBang.position.set(-0.06, 0.19, 0.22);
        frontBang.scale.set(1.5, 0.5, 0.7);
        hairGroup.add(frontBang);
      }
    } else {
      if (character.hairStyle === 'bun') {
        // NAM: BÚI TÓC THIỀN MÔN (Topknot)
        const bunGeo = new THREE.SphereGeometry(0.08, 12, 10);
        const bunMesh = new THREE.Mesh(bunGeo, matHair);
        bunMesh.position.set(0, 0.32, 0.02);
        hairGroup.add(bunMesh);

        const tieGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.035, 12);
        const matTie = makeToonMat(0x1e293b);
        const tieMesh = new THREE.Mesh(tieGeo, matTie);
        tieMesh.position.set(0, 0.27, 0.02);
        hairGroup.add(tieMesh);

        const pinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.26, 6);
        const matPin = makeToonMat(0xd97706);
        const pinMesh = new THREE.Mesh(pinGeo, matPin);
        pinMesh.position.set(0, 0.32, 0.02);
        pinMesh.rotation.z = Math.PI / 2;
        hairGroup.add(pinMesh);

        const frontBangGeo = new THREE.SphereGeometry(0.08, 10, 8);
        const frontBang = new THREE.Mesh(frontBangGeo, matHair);
        frontBang.position.set(0, 0.19, 0.22);
        frontBang.scale.set(1.4, 0.5, 0.6);
        hairGroup.add(frontBang);

        const sideL = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.16, 6), matHair);
        sideL.position.set(-0.23, 0.04, 0.1);
        sideL.rotation.set(0.1, 0.1, 0.3);
        hairGroup.add(sideL);

        const sideR = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.16, 6), matHair);
        sideR.position.set(0.23, 0.04, 0.1);
        sideR.rotation.set(0.1, -0.1, -0.3);
        hairGroup.add(sideR);
      } else {
        // NAM: TÓC NGẮN SPIKY TỈA GAI (Mặc định / Short)
        const spikeGeo = new THREE.ConeGeometry(0.065, 0.18, 6);

        const spike1 = new THREE.Mesh(spikeGeo, matHair);
        spike1.position.set(0, 0.32, 0.04);
        spike1.rotation.set(0.2, 0, 0.1);
        hairGroup.add(spike1);

        const spike2 = new THREE.Mesh(spikeGeo, matHair);
        spike2.position.set(-0.11, 0.28, 0.08);
        spike2.rotation.set(0.15, 0.3, 0.4);
        hairGroup.add(spike2);

        const spike3 = new THREE.Mesh(spikeGeo, matHair);
        spike3.position.set(0.11, 0.28, 0.08);
        spike3.rotation.set(0.15, -0.3, -0.4);
        hairGroup.add(spike3);

        const spike4 = new THREE.Mesh(spikeGeo, matHair);
        spike4.position.set(-0.22, 0.12, 0.06);
        spike4.rotation.set(0.1, 0.2, 0.7);
        hairGroup.add(spike4);

        const spike5 = new THREE.Mesh(spikeGeo, matHair);
        spike5.position.set(0.22, 0.12, 0.06);
        spike5.rotation.set(0.1, -0.2, -0.7);
        hairGroup.add(spike5);

        const hiMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.06), matHairHi);
        hiMesh.position.set(0.04, 0.27, 0.18);
        hiMesh.rotation.set(0.4, -0.2, 0.1);
        hairGroup.add(hiMesh);

        const bang1 = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 5), matHair);
        bang1.position.set(-0.08, 0.18, 0.24);
        bang1.rotation.set(-0.35, 0, -0.2);
        hairGroup.add(bang1);

        const bang2 = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.13, 5), matHair);
        bang2.position.set(0.06, 0.19, 0.24);
        bang2.rotation.set(-0.32, 0, 0.25);
        hairGroup.add(bang2);
      }
    }
  }

  // Phụ Kiện: Nón lá / Chuỗi hạt / Túi vải
  if (character.accessory === 'beads') {
    // Chuỗi hạt bồ đề đeo cổ
    const beadsGroup = new THREE.Group();
    const beadRadius = 0.14;
    const beadCount = 18;
    for (let b = 0; b < beadCount; b++) {
      const angle = (b / beadCount) * Math.PI * 2;
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), matWood);
      bead.position.set(Math.cos(angle) * beadRadius, 0.24 + Math.sin(angle) * 0.05, Math.sin(angle) * beadRadius * 0.8 + 0.08);
      beadsGroup.add(bead);
    }
    torso.add(beadsGroup);
  } else if (character.accessory === 'hat') {
    // Nón lá mộc mạc
    const hatGeo = new THREE.ConeGeometry(0.38, 0.16, 16, 1, true);
    const matHat = makeToonMat(0xfde047);
    const hatMesh = new THREE.Mesh(hatGeo, matHat);
    hatMesh.position.set(0, 0.22, -0.26);
    hatMesh.rotation.set(Math.PI * 0.55, 0, 0);
    torso.add(hatMesh);
  } else if (character.accessory === 'bag') {
    // Túi vải Phật tử: Nữ túi nâu sen, Nam túi lam chữ An
    const bagColor = isFemale ? 0x854d0e : 0x64748b;
    const matBag = makeToonMat(bagColor);
    const bagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.06), matBag);
    bagMesh.position.set(0.20, 0.08, 0.10);
    bagMesh.rotation.set(0, 0.2, -0.2);
    torso.add(bagMesh);

    const strapGeo = new THREE.TorusGeometry(0.28, 0.015, 6, 16);
    const strapMesh = new THREE.Mesh(strapGeo, matBag);
    strapMesh.position.set(0, 0.20, 0);
    strapMesh.rotation.set(0.4, 0.8, 0.6);
    torso.add(strapMesh);

    if (isFemale) {
      const bagLotus = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), matGold);
      bagLotus.position.set(0.20, 0.08, 0.14);
      torso.add(bagLotus);
    }
  }

  // ==========================================
  // 3. TAY (ARMS) VÀ PHÁP KHÍ NIỆM PHẬT
  // ==========================================
  const leftArm = new THREE.Group();
  leftArm.name = 'LeftArm';
  leftArm.position.set(-0.28, 0.33, 0.02);
  torso.add(leftArm);

  // Tay áo lam xắn 3/4
  const sleeveGeo = new THREE.CylinderGeometry(0.068, 0.074, 0.17, 10);
  const leftSleeve = new THREE.Mesh(sleeveGeo, matShirt);
  leftSleeve.position.set(0, -0.07, 0);
  leftArm.add(leftSleeve);

  const cuffGeo = new THREE.CylinderGeometry(0.076, 0.076, 0.035, 10);
  const leftCuff = new THREE.Mesh(cuffGeo, matShirt);
  leftCuff.position.set(0, -0.15, 0);
  leftArm.add(leftCuff);

  const leftForearm = new THREE.Group();
  leftForearm.name = 'LeftForearm';
  leftForearm.position.set(0, -0.16, 0);
  leftArm.add(leftForearm);

  const forearmGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.14, 8);
  const leftForearmMesh = new THREE.Mesh(forearmGeo, matSkin);
  leftForearmMesh.position.set(0, -0.06, 0);
  leftForearm.add(leftForearmMesh);

  const handGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const leftHand = new THREE.Mesh(handGeo, matSkin);
  leftHand.position.set(0, -0.14, 0);
  leftForearm.add(leftHand);

  // PHÁP BẢO CẦM TAY HOẶC ĐEO CỔ TAY
  if (isFemale) {
    // NỮ: Nâng chuỗi 18 hạt bồ đề niệm Phật có hạt mẹ và tua rua vàng cam
    const rosaryGroup = new THREE.Group();
    const rosaryRadius = 0.055;
    for (let b = 0; b < 18; b++) {
      const a = (b / 18) * Math.PI * 2;
      const beadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), matWood);
      beadMesh.position.set(Math.cos(a) * rosaryRadius, Math.sin(a) * rosaryRadius * 1.3, 0);
      rosaryGroup.add(beadMesh);
    }
    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.014, 0.08, 6), matTassel);
    tassel.position.set(0, -rosaryRadius * 1.3 - 0.04, 0);
    rosaryGroup.add(tassel);
    rosaryGroup.position.set(0, -0.04, 0.05);
    leftHand.add(rosaryGroup);
  } else {
    // NAM: Vòng chuỗi hạt ôm cổ tay trái
    const wristBeadsL = new THREE.Group();
    for (let b = 0; b < 8; b++) {
      const a = (b / 8) * Math.PI * 2;
      const bm = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), matWood);
      bm.position.set(Math.cos(a) * 0.055, 0, Math.sin(a) * 0.055);
      wristBeadsL.add(bm);
    }
    wristBeadsL.position.set(0, -0.09, 0);
    leftForearm.add(wristBeadsL);
  }

  // Cánh tay phải (Right Arm)
  const rightArm = new THREE.Group();
  rightArm.name = 'RightArm';
  rightArm.position.set(0.28, 0.33, 0.02);
  torso.add(rightArm);

  const rightSleeve = new THREE.Mesh(sleeveGeo, matShirt);
  rightSleeve.position.set(0, -0.07, 0);
  rightArm.add(rightSleeve);

  const rightCuff = new THREE.Mesh(cuffGeo, matShirt);
  rightCuff.position.set(0, -0.15, 0);
  rightArm.add(rightCuff);

  const rightForearm = new THREE.Group();
  rightForearm.name = 'RightForearm';
  rightForearm.position.set(0, -0.16, 0);
  rightArm.add(rightForearm);

  const rightForearmMesh = new THREE.Mesh(forearmGeo, matSkin);
  rightForearmMesh.position.set(0, -0.06, 0);
  rightForearm.add(rightForearmMesh);

  const rightHand = new THREE.Mesh(handGeo, matSkin);
  rightHand.position.set(0, -0.14, 0);
  rightForearm.add(rightHand);

  // BÓ 3 NÉN NHANG TRẦM CÚNG PHẬT (INCENSE STICKS BUNDLE)
  const incenseBundle = new THREE.Group();
  incenseBundle.name = 'IncenseBundle';
  incenseBundle.visible = false; // Mặc định ẩn, bật khi thắp nhang vái lạy

  const stickMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513, // Thân nhang trầm nâu vàng
    roughness: 0.7,
  });
  const footMat = new THREE.MeshStandardMaterial({
    color: 0xba1c1c, // Chân nhang đỏ son
    roughness: 0.4,
  });
  const emberMat = new THREE.MeshBasicMaterial({
    color: 0xff4500, // Đầu nhang đỏ cam rực sáng
  });

  for (let s = -1; s <= 1; s++) {
    const stickGroup = new THREE.Group();
    // Thân nhang trầm
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.20, 6), stickMat);
    body.position.y = 0.10;
    stickGroup.add(body);
    // Chân nhang đỏ
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.06, 6), footMat);
    foot.position.y = -0.03;
    stickGroup.add(foot);
    // Tàn nhang đỏ rực ở chóp
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), emberMat);
    ember.position.y = 0.202;
    stickGroup.add(ember);

    stickGroup.position.set(s * 0.012, 0, 0);
    stickGroup.rotation.z = s * 0.08;
    incenseBundle.add(stickGroup);
  }

  // Tọa độ cầm nhang hướng lên trên
  incenseBundle.position.set(-0.02, 0.04, 0.06);
  incenseBundle.rotation.x = Math.PI / 2 + 0.35;
  rightHand.add(incenseBundle);

  if (!isFemale) {
    // NAM: Vòng chuỗi hạt ôm cổ tay phải
    const wristBeadsR = new THREE.Group();
    for (let b = 0; b < 8; b++) {
      const a = (b / 8) * Math.PI * 2;
      const bm = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), matWood);
      bm.position.set(Math.cos(a) * 0.055, 0, Math.sin(a) * 0.055);
      wristBeadsR.add(bm);
    }
    wristBeadsR.position.set(0, -0.09, 0);
    rightForearm.add(wristBeadsR);
  }

  // ==========================================
  // 4. QUẦN LAM ỐNG SUÔNG & GIÀY PHẬT TỬ
  // ==========================================
  const legRadius = 0.088; // Quần lam suông rộng rãi thoải mái
  const thighLen = 0.24;
  const shinLen = 0.24;

  // Chân Trái (Left Leg)
  const leftLeg = new THREE.Group();
  leftLeg.name = 'LeftLeg';
  leftLeg.position.set(-0.11, 0, 0);
  hip.add(leftLeg);

  const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(legRadius, legRadius * 0.96, thighLen, 12), matPants);
  leftThighMesh.position.set(0, -thighLen / 2, 0);
  leftThighMesh.castShadow = true;
  leftLeg.add(leftThighMesh);

  const leftShin = new THREE.Group();
  leftShin.name = 'LeftShin';
  leftShin.position.set(0, -thighLen, 0);
  leftLeg.add(leftShin);

  const leftShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(legRadius * 0.96, legRadius * 0.88, shinLen, 12), matPants);
  leftShinMesh.position.set(0, -shinLen / 2, 0);
  leftShinMesh.castShadow = true;
  leftShin.add(leftShinMesh);

  // Giày Chibi Trái
  const leftFoot = new THREE.Group();
  leftFoot.name = 'LeftFoot';
  leftFoot.position.set(0, -shinLen, 0.04);
  leftShin.add(leftFoot);

  if (isFemale) {
    // NỮ: Hài vải đen Phật tử đế bệt thanh nhã
    const matShoe = makeToonMat(0x1e293b);
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.065, 0.18), matShoe);
    shoeMesh.position.set(0, -0.035, 0.02);
    leftFoot.add(shoeMesh);
  } else {
    // NAM: Giày kung-fu vải đen Phật tử viền đế trắng
    const matShoe = makeToonMat(0x0f172a);
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.065, 0.19), matShoe);
    shoeMesh.position.set(0, -0.035, 0.02);
    leftFoot.add(shoeMesh);

    const matSole = makeToonMat(0xffffff);
    const soleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.122, 0.015, 0.192), matSole);
    soleMesh.position.set(0, -0.06, 0.02);
    leftFoot.add(soleMesh);
  }

  // Chân Phải (Right Leg)
  const rightLeg = new THREE.Group();
  rightLeg.name = 'RightLeg';
  rightLeg.position.set(0.11, 0, 0);
  hip.add(rightLeg);

  const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(legRadius, legRadius * 0.96, thighLen, 12), matPants);
  rightThighMesh.position.set(0, -thighLen / 2, 0);
  rightThighMesh.castShadow = true;
  rightLeg.add(rightThighMesh);

  const rightShin = new THREE.Group();
  rightShin.name = 'RightShin';
  rightShin.position.set(0, -thighLen, 0);
  rightLeg.add(rightShin);

  const rightShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(legRadius * 0.96, legRadius * 0.88, shinLen, 12), matPants);
  rightShinMesh.position.set(0, -shinLen / 2, 0);
  rightShinMesh.castShadow = true;
  rightShin.add(rightShinMesh);

  // Giày Chibi Phải
  const rightFoot = new THREE.Group();
  rightFoot.name = 'RightFoot';
  rightFoot.position.set(0, -shinLen, 0.04);
  rightShin.add(rightFoot);

  if (isFemale) {
    const matShoe = makeToonMat(0x1e293b);
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.065, 0.18), matShoe);
    shoeMesh.position.set(0, -0.035, 0.02);
    rightFoot.add(shoeMesh);
  } else {
    const matShoe = makeToonMat(0x0f172a);
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.065, 0.19), matShoe);
    shoeMesh.position.set(0, -0.035, 0.02);
    rightFoot.add(shoeMesh);

    const matSole = makeToonMat(0xffffff);
    const soleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.122, 0.015, 0.192), matSole);
    soleMesh.position.set(0, -0.06, 0.02);
    rightFoot.add(soleMesh);
  }

  // ==========================================
  // 5. HOẠT ẢNH CHIBI TỰ NHIÊN (ANIMATION CLIPS)
  // ==========================================
  // A. WALK CLIP (Nhịp chân bước nhịp nhàng, tay vung nhịp điệu, người nhún nảy cute)
  const walkDur = 0.8;
  const walkTracks: THREE.KeyframeTrack[] = [
    // Chân trái bước
    new THREE.QuaternionKeyframeTrack(
      'LeftLeg.quaternion',
      [0, 0.2, 0.4, 0.6, 0.8],
      [
        0, 0, 0, 1,
        0.26, 0, 0, 0.965,
        0, 0, 0, 1,
        -0.22, 0, 0, 0.975,
        0, 0, 0, 1,
      ]
    ),
    // Đầu gối trái gập tự nhiên
    new THREE.QuaternionKeyframeTrack(
      'LeftShin.quaternion',
      [0, 0.2, 0.4, 0.6, 0.8],
      [
        0, 0, 0, 1,
        0.05, 0, 0, 0.998,
        0.32, 0, 0, 0.947,
        0.02, 0, 0, 0.999,
        0, 0, 0, 1,
      ]
    ),
    // Chân phải bước đối nghịch
    new THREE.QuaternionKeyframeTrack(
      'RightLeg.quaternion',
      [0, 0.2, 0.4, 0.6, 0.8],
      [
        0, 0, 0, 1,
        -0.22, 0, 0, 0.975,
        0, 0, 0, 1,
        0.26, 0, 0, 0.965,
        0, 0, 0, 1,
      ]
    ),
    // Đầu gối phải gập tự nhiên
    new THREE.QuaternionKeyframeTrack(
      'RightShin.quaternion',
      [0, 0.2, 0.4, 0.6, 0.8],
      [
        0.32, 0, 0, 0.947,
        0.02, 0, 0, 0.999,
        0, 0, 0, 1,
        0.05, 0, 0, 0.998,
        0.32, 0, 0, 0.947,
      ]
    ),
    // Tay trái vung đối xứng với chân
    new THREE.QuaternionKeyframeTrack(
      'LeftArm.quaternion',
      [0, 0.2, 0.4, 0.6, 0.8],
      [
        0, 0, 0, 1,
        -0.24, 0, 0, 0.97,
        0, 0, 0, 1,
        0.24, 0, 0, 0.97,
        0, 0, 0, 1,
      ]
    ),
    // Tay phải vung
    new THREE.QuaternionKeyframeTrack(
      'RightArm.quaternion',
      [0, 0.2, 0.4, 0.6, 0.8],
      [
        0, 0, 0, 1,
        0.24, 0, 0, 0.97,
        0, 0, 0, 1,
        -0.24, 0, 0, 0.97,
        0, 0, 0, 1,
      ]
    ),
    // Độ nhún thân người khi bước (Chibi Bouncing Gait)
    new THREE.VectorKeyframeTrack(
      'Torso.position',
      [0, 0.2, 0.4, 0.6, 0.8],
      [
        0, 0, 0,
        0, 0.025, 0,
        0, 0, 0,
        0, 0.025, 0,
        0, 0, 0,
      ]
    ),
    // Hông giữ vững ở độ cao đứng chuẩn (Y = 0.58)
    new THREE.VectorKeyframeTrack('Hip.position', [0, 0.8], [0, 0.58, 0, 0, 0.58, 0]),
    new THREE.QuaternionKeyframeTrack('LeftForearm.quaternion', [0, 0.8], [0, 0, 0, 1, 0, 0, 0, 1]),
    new THREE.QuaternionKeyframeTrack('RightForearm.quaternion', [0, 0.8], [0, 0, 0, 1, 0, 0, 0, 1]),
    // Đầu nhún nhẹ
    new THREE.QuaternionKeyframeTrack(
      'Head.quaternion',
      [0, 0.2, 0.4, 0.6, 0.8],
      [
        0, 0, 0, 1,
        0.04, 0, 0, 0.999,
        0, 0, 0, 1,
        0.04, 0, 0, 0.999,
        0, 0, 0, 1,
      ]
    ),
  ];
  const walkClip = new THREE.AnimationClip('walk', walkDur, walkTracks);

  // B. IDLE CLIP (Tư thế đứng chuẩn Concept Art Đồ Lam Phật Tử)
  const idleDur = 2.4;
  const idleTracks: THREE.KeyframeTrack[] = [
    // Nhịp thở nhè nhẹ của lồng ngực
    new THREE.VectorKeyframeTrack(
      'Torso.position',
      [0, 1.2, 2.4],
      [
        0, 0, 0,
        0, 0.012, 0,
        0, 0, 0,
      ]
    ),
    // Chân đứng ngay ngắn
    new THREE.VectorKeyframeTrack('Hip.position', [0, 2.4], [0, 0.58, 0, 0, 0.58, 0]),
    new THREE.QuaternionKeyframeTrack('LeftLeg.quaternion', [0, 2.4], [0, 0, 0, 1, 0, 0, 0, 1]),
    new THREE.QuaternionKeyframeTrack('RightLeg.quaternion', [0, 2.4], [0, 0, 0, 1, 0, 0, 0, 1]),
    new THREE.QuaternionKeyframeTrack('LeftShin.quaternion', [0, 2.4], [0, 0, 0, 1, 0, 0, 0, 1]),
    new THREE.QuaternionKeyframeTrack('RightShin.quaternion', [0, 2.4], [0, 0, 0, 1, 0, 0, 0, 1]),
  ];

  if (isFemale) {
    // NỮ: Nâng chuỗi hạt bồ đề niệm Phật trước ngực trang nghiêm thanh tịnh
    idleTracks.push(
      new THREE.QuaternionKeyframeTrack(
        'LeftArm.quaternion',
        [0, 1.2, 2.4],
        [
          0.30, 0.16, 0.20, 0.92,
          0.31, 0.17, 0.21, 0.91,
          0.30, 0.16, 0.20, 0.92,
        ]
      ),
      new THREE.QuaternionKeyframeTrack(
        'LeftForearm.quaternion',
        [0, 1.2, 2.4],
        [
          0.18, -0.12, 0.44, 0.86,
          0.20, -0.13, 0.45, 0.85,
          0.18, -0.12, 0.44, 0.86,
        ]
      ),
      new THREE.QuaternionKeyframeTrack(
        'RightArm.quaternion',
        [0, 1.2, 2.4],
        [
          0.12, -0.06, -0.18, 0.97,
          0.13, -0.07, -0.19, 0.96,
          0.12, -0.06, -0.18, 0.97,
        ]
      ),
      new THREE.QuaternionKeyframeTrack(
        'RightForearm.quaternion',
        [0, 2.4],
        [
          0.05, 0, -0.15, 0.98,
          0.05, 0, -0.15, 0.98,
        ]
      )
    );
  } else {
    // NAM: Tay phải chắp nửa ấn chào cung kính chánh niệm, tay trái buông tự nhiên không đâm vào thân áo
    idleTracks.push(
      // Tay phải chắp chào trước ngực
      new THREE.QuaternionKeyframeTrack(
        'RightArm.quaternion',
        [0, 1.2, 2.4],
        [
          0.26, -0.15, -0.18, 0.93,
          0.28, -0.16, -0.19, 0.92,
          0.26, -0.15, -0.18, 0.93,
        ]
      ),
      new THREE.QuaternionKeyframeTrack(
        'RightForearm.quaternion',
        [0, 1.2, 2.4],
        [
          0.12, 0.10, -0.42, 0.89,
          0.14, 0.11, -0.43, 0.88,
          0.12, 0.10, -0.42, 0.89,
        ]
      ),
      // Tay trái buông tự nhiên thoải mái bên hông
      new THREE.QuaternionKeyframeTrack(
        'LeftArm.quaternion',
        [0, 2.4],
        [
          0.12, 0.08, 0.22, 0.96,
          0.12, 0.08, 0.22, 0.96,
        ]
      ),
      new THREE.QuaternionKeyframeTrack(
        'LeftForearm.quaternion',
        [0, 2.4],
        [
          0.05, 0, 0.25, 0.97,
          0.05, 0, 0.25, 0.97,
        ]
      )
    );
  }

  // Đầu nghiêng nhẹ theo nhịp thở
  idleTracks.push(
    new THREE.QuaternionKeyframeTrack(
      'Head.quaternion',
      [0, 1.2, 2.4],
      [
        0, 0, 0, 1,
        0.02, 0.03, 0, 0.999,
        0, 0, 0, 1,
      ]
    )
  );

  const idleClip = new THREE.AnimationClip('idle', idleDur, idleTracks);

  // C. SIT CLIP (Tọa thiền kiết già an lạc trên bồ đoàn / sàn chùa)
  const sitDur = 1.0;
  const sitTracks: THREE.KeyframeTrack[] = [
    // Hạ thấp hông xuống vừa vặn mặt bồ đoàn / sàn chùa (Y = 0.22m)
    new THREE.VectorKeyframeTrack('Hip.position', [0, 1.0], [0, 0.22, 0, 0, 0.22, 0]),
    new THREE.VectorKeyframeTrack('Torso.position', [0, 1.0], [0, 0, 0, 0, 0, 0]),
    // Hai chân xếp bằng kiết già nằm phẳng trên mặt sàn (không bị chìm đâm xuống sàn)
    new THREE.QuaternionKeyframeTrack('LeftLeg.quaternion', [0, 1.0], [-0.6722, -0.115, -0.23, 0.6943, -0.6722, -0.115, -0.23, 0.6943]),
    new THREE.QuaternionKeyframeTrack('RightLeg.quaternion', [0, 1.0], [-0.6722, 0.115, 0.23, 0.6943, -0.6722, 0.115, 0.23, 0.6943]),
    new THREE.QuaternionKeyframeTrack('LeftShin.quaternion', [0, 1.0], [0.9471, -0.1634, -0.0315, 0.2745, 0.9471, -0.1634, -0.0315, 0.2745]),
    new THREE.QuaternionKeyframeTrack('RightShin.quaternion', [0, 1.0], [0.9471, 0.1634, 0.0315, 0.2745, 0.9471, 0.1634, 0.0315, 0.2745]),
    // Hai tay buông thư an tĩnh trên đùi / ấn thiền định
    new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', [0, 1.0], [0.2444, 0.1651, -0.1329, 0.9462, 0.2444, 0.1651, -0.1329, 0.9462]),
    new THREE.QuaternionKeyframeTrack('RightArm.quaternion', [0, 1.0], [0.2444, -0.1651, 0.1329, 0.9462, 0.2444, -0.1651, 0.1329, 0.9462]),
    new THREE.QuaternionKeyframeTrack('LeftForearm.quaternion', [0, 1.0], [0.167, 0.0631, 0.234, 0.9557, 0.167, 0.0631, 0.234, 0.9557]),
    new THREE.QuaternionKeyframeTrack('RightForearm.quaternion', [0, 1.0], [0.167, -0.0631, -0.234, 0.9557, 0.167, -0.0631, -0.234, 0.9557]),
  ];
  const sitClip = new THREE.AnimationClip('sit', sitDur, sitTracks);

  // D. INCENSE BOW CLIP (Thắp nhang dâng ngang mày & 3 lần cúi mình vái lạy trang nghiêm)
  const incenseDur = 4.8;
  const incenseTimes = [0, 0.6, 1.2, 1.7, 2.2, 2.7, 3.2, 3.7, 4.2, 4.8];

  const incenseTracks: THREE.KeyframeTrack[] = [
    // Thân mình cúi 3 bái thành kính
    new THREE.QuaternionKeyframeTrack('Torso.quaternion', incenseTimes, [
      0, 0, 0, 1,
      0.02, 0, 0, 0.999,
      0.04, 0, 0, 0.999,
      0.28, 0, 0, 0.960, // Vái lần 1 (~33 độ)
      0.04, 0, 0, 0.999,
      0.31, 0, 0, 0.951, // Vái lần 2 (~36 độ)
      0.04, 0, 0, 0.999,
      0.33, 0, 0, 0.944, // Vái lần 3 (~38 độ)
      0.08, 0, 0, 0.997,
      0, 0, 0, 1,
    ]),
    // Đầu cúi theo thân mình
    new THREE.QuaternionKeyframeTrack('Head.quaternion', incenseTimes, [
      0, 0, 0, 1,
      0.05, 0, 0, 0.998,
      0.08, 0, 0, 0.997,
      0.22, 0, 0, 0.975, // Cúi đầu bái 1
      0.05, 0, 0, 0.998,
      0.24, 0, 0, 0.970, // Cúi đầu bái 2
      0.05, 0, 0, 0.998,
      0.26, 0, 0, 0.966, // Cúi đầu bái 3
      0.05, 0, 0, 0.998,
      0, 0, 0, 1,
    ]),
    // Hai tay nâng nhang dâng ngang mày rồi giữ trang nghiêm trong các nhịp vái
    new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', incenseTimes, [
      0, 0, 0, 1,
      -0.28, 0.22, 0.13, 0.92,
      -0.42, 0.18, 0.18, 0.87, // Nâng hương ngang mày
      -0.40, 0.18, 0.18, 0.88,
      -0.42, 0.18, 0.18, 0.87,
      -0.40, 0.18, 0.18, 0.88,
      -0.42, 0.18, 0.18, 0.87,
      -0.40, 0.18, 0.18, 0.88,
      -0.28, 0.22, 0.13, 0.92, // Hạ về trước ngực chắp tay
      0, 0, 0, 1,
    ]),
    new THREE.QuaternionKeyframeTrack('RightArm.quaternion', incenseTimes, [
      0, 0, 0, 1,
      -0.28, -0.22, -0.13, 0.92,
      -0.42, -0.18, -0.18, 0.87, // Nâng hương ngang mày
      -0.40, -0.18, -0.18, 0.88,
      -0.42, -0.18, -0.18, 0.87,
      -0.40, -0.18, -0.18, 0.88,
      -0.42, -0.18, -0.18, 0.87,
      -0.40, -0.18, -0.18, 0.88,
      -0.28, -0.22, -0.13, 0.92, // Hạ về trước ngực chắp tay
      0, 0, 0, 1,
    ]),
    new THREE.QuaternionKeyframeTrack('LeftForearm.quaternion', incenseTimes, [
      0, 0, 0, 1,
      0.35, 0.02, 0.24, 0.90,
      0.48, 0.05, 0.28, 0.83,
      0.46, 0.05, 0.28, 0.84,
      0.48, 0.05, 0.28, 0.83,
      0.46, 0.05, 0.28, 0.84,
      0.48, 0.05, 0.28, 0.83,
      0.46, 0.05, 0.28, 0.84,
      0.35, 0.02, 0.24, 0.90,
      0, 0, 0, 1,
    ]),
    new THREE.QuaternionKeyframeTrack('RightForearm.quaternion', incenseTimes, [
      0, 0, 0, 1,
      0.35, -0.02, -0.24, 0.90,
      0.48, -0.05, -0.28, 0.83,
      0.46, -0.05, -0.28, 0.84,
      0.48, -0.05, -0.28, 0.83,
      0.46, -0.05, -0.28, 0.84,
      0.48, -0.05, -0.28, 0.83,
      0.46, -0.05, -0.28, 0.84,
      0.35, -0.02, -0.24, 0.90,
      0, 0, 0, 1,
    ]),
  ];

  const incenseBowClip = new THREE.AnimationClip('incenseBow', incenseDur, incenseTracks);

  // E. MEDITATION BOW CLIP (Tọa thiền nghe tiếng chuông cung kính chắp tay vái lạy rồi an trú)
  const medBowDur = 3.0;
  const medBowTimes = [0, 0.5, 1.3, 2.1, 3.0];
  const medBowTracks: THREE.KeyframeTrack[] = [
    new THREE.VectorKeyframeTrack('Hip.position', [0, 3.0], [0, 0.22, 0, 0, 0.22, 0]),
    new THREE.VectorKeyframeTrack('Torso.position', [0, 3.0], [0, 0, 0, 0, 0, 0]),
    // Hai chân giữ nguyên tư thế kiết già thiền tọa vững chãi
    new THREE.QuaternionKeyframeTrack('LeftLeg.quaternion', medBowTimes, [
      -0.6722, -0.115, -0.23, 0.6943,
      -0.6722, -0.115, -0.23, 0.6943,
      -0.6722, -0.115, -0.23, 0.6943,
      -0.6722, -0.115, -0.23, 0.6943,
      -0.6722, -0.115, -0.23, 0.6943,
    ]),
    new THREE.QuaternionKeyframeTrack('RightLeg.quaternion', medBowTimes, [
      -0.6722, 0.115, 0.23, 0.6943,
      -0.6722, 0.115, 0.23, 0.6943,
      -0.6722, 0.115, 0.23, 0.6943,
      -0.6722, 0.115, 0.23, 0.6943,
      -0.6722, 0.115, 0.23, 0.6943,
    ]),
    new THREE.QuaternionKeyframeTrack('LeftShin.quaternion', medBowTimes, [
      0.9471, -0.1634, -0.0315, 0.2745,
      0.9471, -0.1634, -0.0315, 0.2745,
      0.9471, -0.1634, -0.0315, 0.2745,
      0.9471, -0.1634, -0.0315, 0.2745,
      0.9471, -0.1634, -0.0315, 0.2745,
    ]),
    new THREE.QuaternionKeyframeTrack('RightShin.quaternion', medBowTimes, [
      0.9471, 0.1634, 0.0315, 0.2745,
      0.9471, 0.1634, 0.0315, 0.2745,
      0.9471, 0.1634, 0.0315, 0.2745,
      0.9471, 0.1634, 0.0315, 0.2745,
      0.9471, 0.1634, 0.0315, 0.2745,
    ]),
    // Thân trên cúi mình cung kính theo tiếng chuông ngân (~30 độ) rồi nhẹ nhàng thẳng lưng
    new THREE.QuaternionKeyframeTrack('Torso.quaternion', medBowTimes, [
      0, 0, 0, 1,
      0.06, 0, 0, 0.998,
      0.26, 0, 0, 0.965,
      0.08, 0, 0, 0.996,
      0, 0, 0, 1,
    ]),
    // Đầu cúi theo thân mình trang nghiêm
    new THREE.QuaternionKeyframeTrack('Head.quaternion', medBowTimes, [
      0, 0, 0, 1,
      0.08, 0, 0, 0.996,
      0.24, 0, 0, 0.970,
      0.08, 0, 0, 0.996,
      0, 0, 0, 1,
    ]),
    // Hai tay nâng lên thành ấn Hiệp Chưởng (Anjali / Búp sen) trước ngực rồi hạ về đùi
    new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', medBowTimes, [
      0.2444, 0.1651, -0.1329, 0.9462,
      -0.30, 0.20, 0.14, 0.92,
      -0.32, 0.20, 0.14, 0.92,
      -0.20, 0.18, 0.10, 0.96,
      0.2444, 0.1651, -0.1329, 0.9462,
    ]),
    new THREE.QuaternionKeyframeTrack('RightArm.quaternion', medBowTimes, [
      0.2444, -0.1651, 0.1329, 0.9462,
      -0.30, -0.20, -0.14, 0.92,
      -0.32, -0.20, -0.14, 0.92,
      -0.20, -0.18, -0.10, 0.96,
      0.2444, -0.1651, 0.1329, 0.9462,
    ]),
    new THREE.QuaternionKeyframeTrack('LeftForearm.quaternion', medBowTimes, [
      0.167, 0.0631, 0.234, 0.9557,
      0.45, 0.04, 0.26, 0.85,
      0.48, 0.04, 0.26, 0.83,
      0.35, 0.04, 0.24, 0.90,
      0.167, 0.0631, 0.234, 0.9557,
    ]),
    new THREE.QuaternionKeyframeTrack('RightForearm.quaternion', medBowTimes, [
      0.167, -0.0631, -0.234, 0.9557,
      0.45, -0.04, -0.26, 0.85,
      0.48, -0.04, -0.26, 0.83,
      0.35, -0.04, -0.24, 0.90,
      0.167, -0.0631, -0.234, 0.9557,
    ]),
  ];
  const meditationBowClip = new THREE.AnimationClip('meditationBow', medBowDur, medBowTracks);

  // Mixer
  const mixer = new THREE.AnimationMixer(model);
  const walkAction = mixer.clipAction(walkClip);
  const idleAction = mixer.clipAction(idleClip);
  const sitAction = mixer.clipAction(sitClip);
  const incenseBowAction = mixer.clipAction(incenseBowClip);
  const meditationBowAction = mixer.clipAction(meditationBowClip);

  incenseBowAction.loop = THREE.LoopOnce;
  incenseBowAction.clampWhenFinished = true;

  meditationBowAction.loop = THREE.LoopOnce;
  meditationBowAction.clampWhenFinished = true;

  walkAction.loop = THREE.LoopRepeat;
  idleAction.loop = THREE.LoopRepeat;
  sitAction.loop = THREE.LoopRepeat;

  walkAction.timeScale = 1.15;
  idleAction.timeScale = 1.0;
  sitAction.timeScale = 1.0;
  meditationBowAction.timeScale = 1.0;

  model.position.set(0, 0, 0);
  model.scale.set(1.0, 1.0, 1.0);

  return {
    modelGroup: model,
    mixer,
    actions: {
      walk: walkAction,
      idle: idleAction,
      sit: sitAction,
      incenseBow: incenseBowAction,
      meditationBow: meditationBowAction,
    },
    incenseBundle,
    meritHaloGroup,
    updateMeritHalo,
  };
}

// Alias tương thích ngược
export const loadRealisticCharacter = loadChibiCharacter;
