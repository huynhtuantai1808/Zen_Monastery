import * as THREE from 'three';
import type { CharacterAppearance, RobeColorType } from '../types/game';

export interface RealisticCharacterRig {
  modelGroup: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: {
    walk: THREE.AnimationAction;
    idle: THREE.AnimationAction;
    sit: THREE.AnimationAction;
  };
}

// Bảng màu áo sơ mi / trang phục đồng bộ hoàn toàn với CharacterCreationModal
const SHIRT_PALETTES: Record<
  RobeColorType,
  {
    maleShirt: number;
    femaleShirt: number;
  }
> = {
  lam: {
    maleShirt: 0xdbeafe, // Xanh dương nhạt như hình mẫu Male Chibi
    femaleShirt: 0xfce7f3, // Hồng pastel như hình mẫu Female Chibi
  },
  nau: {
    maleShirt: 0xfed7aa, // Nâu be ấm
    femaleShirt: 0xfed7aa,
  },
  xam: {
    maleShirt: 0xe2e8f0, // Xám tối giản
    femaleShirt: 0xe2e8f0,
  },
  bach: {
    maleShirt: 0xffffff, // Bạch y trắng tinh khôi
    femaleShirt: 0xffffff,
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

    // Điểm sáng sao lấp lánh chính (Double glints)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 10, 208, 14, 0, Math.PI * 2);
    ctx.fill();

    // Điểm sáng phụ dưới
    ctx.beginPath();
    ctx.arc(cx + 12, 246, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Viền mi mắt trên cong tinh tế
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = isFemale ? 9 : 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, 218, 38, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Đuôi mi mắt cong vút cho Nữ Chibi
    if (isFemale) {
      const dir = cx < 256 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + dir * 32, 204);
      ctx.lineTo(cx + dir * 46, 196);
      ctx.stroke();
    }
  };

  drawAnimeEye(170);
  drawAnimeEye(342);

  // Lông mày
  ctx.strokeStyle = '#3f2e24';
  ctx.lineWidth = isFemale ? 6 : 8;
  ctx.lineCap = 'round';
  if (isFemale) {
    // Lông mày thanh tú dịu dàng
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
 * Xây dựng Mô hình Nhân vật 3D Anime Chibi hoàn toàn tương thích với Thiết Kế và CharacterCreationModal
 */
export async function loadRealisticCharacter(character: CharacterAppearance): Promise<RealisticCharacterRig> {
  const isFemale = character.gender === 'female';
  const isShaved = character.hairStyle === 'shaved';
  const isBun = character.hairStyle === 'bun';
  const isShort = character.hairStyle === 'short' || (!isShaved && !isBun && !isFemale);

  const palette = SHIRT_PALETTES[character.robeColor] || SHIRT_PALETTES.lam;
  const shirtColor = isFemale ? palette.femaleShirt : palette.maleShirt;
  const pantsColor = isFemale ? 0x475569 : 0x334155; // Quần âu xám than vs Slate denim
  const hairColor = 0x3f2e24; // Nâu trầm tự nhiên
  const hairHighlight = 0x5c4033;
  const skinColor = 0xffedd5;
  const beltColor = 0x451a03;
  const buckleColor = 0x94a3b8;

  // Root Model Group
  const model = new THREE.Group();
  model.name = 'ChibiCharacterRig';

  // Base Hips Center
  const hip = new THREE.Group();
  hip.name = 'Hip';
  hip.position.set(0, 0.58, 0);
  model.add(hip);

  // ==========================================
  // 1. TORSO & SƠ MI CASUAL
  // ==========================================
  const torso = new THREE.Group();
  torso.name = 'Torso';
  hip.add(torso);

  const matShirt = makeToonMat(shirtColor);
  const matPants = makeToonMat(pantsColor);
  const matSkin = makeToonMat(skinColor);
  const matBelt = makeToonMat(beltColor);
  const matBuckle = makeToonMat(buckleColor);
  const matHair = makeToonMat(hairColor);
  const matHairHi = makeToonMat(hairHighlight);
  const matCollar = makeToonMat(0xffffff);

  // Thân áo sơ mi (hình trụ vuốt nhẹ theo dáng Chibi)
  const shirtGeo = new THREE.CylinderGeometry(0.23, 0.21, 0.38, 16);
  const shirtMesh = new THREE.Mesh(shirtGeo, matShirt);
  shirtMesh.position.set(0, 0.19, 0);
  shirtMesh.castShadow = true;
  shirtMesh.receiveShadow = true;
  torso.add(shirtMesh);

  // Phần hở cổ chữ V lộ da
  const chestSkinGeo = new THREE.BufferGeometry();
  const chestVerts = new Float32Array([
    -0.08, 0.38, 0.215,
     0.08, 0.38, 0.215,
     0.00, 0.26, 0.225,
  ]);
  chestSkinGeo.setAttribute('position', new THREE.BufferAttribute(chestVerts, 3));
  chestSkinGeo.computeVertexNormals();
  const chestSkinMesh = new THREE.Mesh(chestSkinGeo, matSkin);
  torso.add(chestSkinMesh);

  // Cổ bẻ sơ mi trắng (White V-Collar Lapels)
  const collarLGeo = new THREE.BoxGeometry(0.045, 0.12, 0.02);
  const collarL = new THREE.Mesh(collarLGeo, matCollar);
  collarL.position.set(-0.065, 0.32, 0.22);
  collarL.rotation.set(0, 0, -0.35);
  torso.add(collarL);

  const collarR = new THREE.Mesh(collarLGeo, matCollar);
  collarR.position.set(0.065, 0.32, 0.22);
  collarR.rotation.set(0, 0, 0.35);
  torso.add(collarR);

  // Thắt lưng da nâu (Leather Belt)
  const beltGeo = new THREE.CylinderGeometry(0.215, 0.215, 0.05, 16);
  const beltMesh = new THREE.Mesh(beltGeo, matBelt);
  beltMesh.position.set(0, 0.025, 0);
  torso.add(beltMesh);

  // Khóa thắt lưng kim loại vuông
  const buckleGeo = new THREE.BoxGeometry(0.06, 0.055, 0.02);
  const buckleMesh = new THREE.Mesh(buckleGeo, matBuckle);
  buckleMesh.position.set(0, 0.025, 0.218);
  torso.add(buckleMesh);

  // Cổ (Neck)
  const neckGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.10, 12);
  const neckMesh = new THREE.Mesh(neckGeo, matSkin);
  neckMesh.position.set(0, 0.40, 0);
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
  headMesh.rotation.y = -Math.PI / 2; // Hướng mặt về phía trước z+
  headMesh.castShadow = true;
  head.add(headMesh);

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

    if (isFemale || isBun) {
      // NỮ CHIBI / TÓC ĐUÔI NGỰA CAO GỢN SÓNG (Ponytail)
      // Nơ cột tóc hồng xinh xắn
      const tieGeo = new THREE.TorusGeometry(0.045, 0.02, 8, 16);
      const matTie = makeToonMat(0xf43f5e);
      const tieMesh = new THREE.Mesh(tieGeo, matTie);
      tieMesh.position.set(0.12, 0.24, -0.16);
      tieMesh.rotation.set(0.6, 0.4, 0);
      hairGroup.add(tieMesh);

      // Đuôi ngựa bồng bềnh uốn cong sang vai
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

      // Tóc mai uốn cong hai bên gò má
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

      // Mái bay phía trước trán
      const frontBangGeo = new THREE.SphereGeometry(0.09, 10, 8);
      const frontBang = new THREE.Mesh(frontBangGeo, matHair);
      frontBang.position.set(-0.06, 0.19, 0.22);
      frontBang.scale.set(1.5, 0.5, 0.7);
      hairGroup.add(frontBang);
    } else if (isShort) {
      // NAM CHIBI / TÓC TỈA GAI XẾP LỚP (Layered Spiky Hair)
      const spikeGeo = new THREE.ConeGeometry(0.065, 0.18, 6);

      // Đỉnh gai tóc trung tâm
      const spike1 = new THREE.Mesh(spikeGeo, matHair);
      spike1.position.set(0, 0.32, 0.04);
      spike1.rotation.set(0.2, 0, 0.1);
      hairGroup.add(spike1);

      // Gai lệch trái
      const spike2 = new THREE.Mesh(spikeGeo, matHair);
      spike2.position.set(-0.11, 0.28, 0.08);
      spike2.rotation.set(0.15, 0.3, 0.4);
      hairGroup.add(spike2);

      // Gai lệch phải
      const spike3 = new THREE.Mesh(spikeGeo, matHair);
      spike3.position.set(0.11, 0.28, 0.08);
      spike3.rotation.set(0.15, -0.3, -0.4);
      hairGroup.add(spike3);

      // Gai tóc mai hai bên
      const spike4 = new THREE.Mesh(spikeGeo, matHair);
      spike4.position.set(-0.22, 0.12, 0.06);
      spike4.rotation.set(0.1, 0.2, 0.7);
      hairGroup.add(spike4);

      const spike5 = new THREE.Mesh(spikeGeo, matHair);
      spike5.position.set(0.22, 0.12, 0.06);
      spike5.rotation.set(0.1, -0.2, -0.7);
      hairGroup.add(spike5);

      // Highlight mảng sáng trên tóc
      const hiMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.06), matHairHi);
      hiMesh.position.set(0.04, 0.27, 0.18);
      hiMesh.rotation.set(0.4, -0.2, 0.1);
      hairGroup.add(hiMesh);

      // Mái trước tỉa nhọn phóng khoáng
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

  // Phụ Kiện: Nón lá / Chuỗi hạt / Túi vải
  if (character.accessory === 'beads') {
    // Chuỗi hạt bồ đề đeo cổ
    const beadsGroup = new THREE.Group();
    const beadMat = makeToonMat(0x78350f);
    const beadRadius = 0.14;
    const beadCount = 18;
    for (let b = 0; b < beadCount; b++) {
      const angle = (b / beadCount) * Math.PI * 2;
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), beadMat);
      bead.position.set(Math.cos(angle) * beadRadius, 0.24 + Math.sin(angle) * 0.05, Math.sin(angle) * beadRadius * 0.8 + 0.08);
      beadsGroup.add(bead);
    }
    torso.add(beadsGroup);
  } else if (character.accessory === 'hat') {
    // Nón lá mộc mạc đeo sau lưng hoặc đội đầu
    const hatGeo = new THREE.ConeGeometry(0.38, 0.16, 16, 1, true);
    const matHat = makeToonMat(0xfde047);
    const hatMesh = new THREE.Mesh(hatGeo, matHat);
    hatMesh.position.set(0, 0.22, -0.26);
    hatMesh.rotation.set(Math.PI * 0.55, 0, 0);
    torso.add(hatMesh);
  } else if (character.accessory === 'bag') {
    // Túi vải chàm đeo chéo
    const matBag = makeToonMat(0x1e3a8a);
    const bagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.06), matBag);
    bagMesh.position.set(0.20, 0.08, 0.10);
    bagMesh.rotation.set(0, 0.2, -0.2);
    torso.add(bagMesh);

    // Dây đeo chéo qua vai
    const strapGeo = new THREE.TorusGeometry(0.28, 0.015, 6, 16);
    const strapMesh = new THREE.Mesh(strapGeo, matBag);
    strapMesh.position.set(0, 0.20, 0);
    strapMesh.rotation.set(0.4, 0.8, 0.6);
    torso.add(strapMesh);
  }

  // ==========================================
  // 3. TAY (ARMS) VỚI TAY ÁO XẮN 3/4
  // ==========================================
  const leftArm = new THREE.Group();
  leftArm.name = 'LeftArm';
  leftArm.position.set(-0.25, 0.32, 0);
  torso.add(leftArm);

  // Tay áo sơ mi xắn 3/4 (Sleeve)
  const sleeveGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.16, 10);
  const leftSleeve = new THREE.Mesh(sleeveGeo, matShirt);
  leftSleeve.position.set(0, -0.07, 0);
  leftArm.add(leftSleeve);

  // Cổ tay áo cuộn gập (Cuff)
  const cuffGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.035, 10);
  const leftCuff = new THREE.Mesh(cuffGeo, matCollar);
  leftCuff.position.set(0, -0.15, 0);
  leftArm.add(leftCuff);

  // Cẳng tay & Bàn tay da (Forearm & Hand)
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

  // Cánh tay phải (Right Arm)
  const rightArm = new THREE.Group();
  rightArm.name = 'RightArm';
  rightArm.position.set(0.25, 0.32, 0);
  torso.add(rightArm);

  const rightSleeve = new THREE.Mesh(sleeveGeo, matShirt);
  rightSleeve.position.set(0, -0.07, 0);
  rightArm.add(rightSleeve);

  const rightCuff = new THREE.Mesh(cuffGeo, matCollar);
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

  // ==========================================
  // 4. CHÂN & GIÀY (LEGS & SHOES)
  // ==========================================
  const legRadius = 0.072;
  const thighLen = 0.24;
  const shinLen = 0.24;

  // Chân Trái (Left Leg)
  const leftLeg = new THREE.Group();
  leftLeg.name = 'LeftLeg';
  leftLeg.position.set(-0.11, 0, 0);
  hip.add(leftLeg);

  const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(legRadius, legRadius * 0.95, thighLen, 12), matPants);
  leftThighMesh.position.set(0, -thighLen / 2, 0);
  leftThighMesh.castShadow = true;
  leftLeg.add(leftThighMesh);

  const leftShin = new THREE.Group();
  leftShin.name = 'LeftShin';
  leftShin.position.set(0, -thighLen, 0);
  leftLeg.add(leftShin);

  const leftShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(legRadius * 0.95, legRadius * 0.85, shinLen, 12), matPants);
  leftShinMesh.position.set(0, -shinLen / 2, 0);
  leftShinMesh.castShadow = true;
  leftShin.add(leftShinMesh);

  // Giày Chibi Trái
  const leftFoot = new THREE.Group();
  leftFoot.name = 'LeftFoot';
  leftFoot.position.set(0, -shinLen, 0.04);
  leftShin.add(leftFoot);

  if (isFemale) {
    // Giày lười trắng/xám (White slip-on loafers)
    const matShoe = makeToonMat(0xf8fafc);
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.18), matShoe);
    shoeMesh.position.set(0, -0.035, 0.02);
    leftFoot.add(shoeMesh);
  } else {
    // Giày sneaker đen mũi bọc cao su trắng (Black Converse-style)
    const matShoe = makeToonMat(0x18181b);
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.19), matShoe);
    shoeMesh.position.set(0, -0.035, 0.02);
    leftFoot.add(shoeMesh);

    // Mũi giày cao su trắng
    const toeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.122, 0.05, 0.06), matCollar);
    toeMesh.position.set(0, -0.045, 0.085);
    leftFoot.add(toeMesh);
  }

  // Chân Phải (Right Leg)
  const rightLeg = new THREE.Group();
  rightLeg.name = 'RightLeg';
  rightLeg.position.set(0.11, 0, 0);
  hip.add(rightLeg);

  const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(legRadius, legRadius * 0.95, thighLen, 12), matPants);
  rightThighMesh.position.set(0, -thighLen / 2, 0);
  rightThighMesh.castShadow = true;
  rightLeg.add(rightThighMesh);

  const rightShin = new THREE.Group();
  rightShin.name = 'RightShin';
  rightShin.position.set(0, -thighLen, 0);
  rightLeg.add(rightShin);

  const rightShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(legRadius * 0.95, legRadius * 0.85, shinLen, 12), matPants);
  rightShinMesh.position.set(0, -shinLen / 2, 0);
  rightShinMesh.castShadow = true;
  rightShin.add(rightShinMesh);

  // Giày Chibi Phải
  const rightFoot = new THREE.Group();
  rightFoot.name = 'RightFoot';
  rightFoot.position.set(0, -shinLen, 0.04);
  rightShin.add(rightFoot);

  if (isFemale) {
    const matShoe = makeToonMat(0xf8fafc);
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.18), matShoe);
    shoeMesh.position.set(0, -0.035, 0.02);
    rightFoot.add(shoeMesh);
  } else {
    const matShoe = makeToonMat(0x18181b);
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.19), matShoe);
    shoeMesh.position.set(0, -0.035, 0.02);
    rightFoot.add(shoeMesh);

    const toeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.122, 0.05, 0.06), matCollar);
    toeMesh.position.set(0, -0.045, 0.085);
    rightFoot.add(toeMesh);
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

  // B. IDLE CLIP (Tư thế đứng chuẩn concept art: Nam chống hông / Nữ vẫy tay chào)
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
    new THREE.QuaternionKeyframeTrack('LeftLeg.quaternion', [0, 2.4], [0, 0, 0, 1, 0, 0, 0, 1]),
    new THREE.QuaternionKeyframeTrack('RightLeg.quaternion', [0, 2.4], [0, 0, 0, 1, 0, 0, 0, 1]),
    new THREE.QuaternionKeyframeTrack('LeftShin.quaternion', [0, 2.4], [0, 0, 0, 1, 0, 0, 0, 1]),
    new THREE.QuaternionKeyframeTrack('RightShin.quaternion', [0, 2.4], [0, 0, 0, 1, 0, 0, 0, 1]),
  ];

  if (isFemale) {
    // NỮ: Tay trái giơ lên vẫy chào vui vẻ (Wave), tay phải buông nhẹ
    idleTracks.push(
      new THREE.QuaternionKeyframeTrack(
        'LeftArm.quaternion',
        [0, 0.6, 1.2, 1.8, 2.4],
        [
          0.15, 0.2, 0.55, 0.8,
          0.18, 0.25, 0.62, 0.74,
          0.15, 0.2, 0.55, 0.8,
          0.18, 0.25, 0.62, 0.74,
          0.15, 0.2, 0.55, 0.8,
        ]
      ),
      new THREE.QuaternionKeyframeTrack(
        'LeftForearm.quaternion',
        [0, 0.6, 1.2, 1.8, 2.4],
        [
          0, 0, 0.35, 0.93,
          0, 0, 0.15, 0.98,
          0, 0, 0.35, 0.93,
          0, 0, 0.15, 0.98,
          0, 0, 0.35, 0.93,
        ]
      ),
      new THREE.QuaternionKeyframeTrack(
        'RightArm.quaternion',
        [0, 1.2, 2.4],
        [
          0, 0, -0.06, 0.998,
          0, 0, -0.03, 0.999,
          0, 0, -0.06, 0.998,
        ]
      )
    );
  } else {
    // NAM: Tay trái chống hông tự tin (Hand on hip), tay phải buông xuôi
    idleTracks.push(
      new THREE.QuaternionKeyframeTrack(
        'LeftArm.quaternion',
        [0, 2.4],
        [
          0.18, 0.12, 0.35, 0.91,
          0.18, 0.12, 0.35, 0.91,
        ]
      ),
      new THREE.QuaternionKeyframeTrack(
        'LeftForearm.quaternion',
        [0, 2.4],
        [
          0.1, 0, 0.52, 0.84,
          0.1, 0, 0.52, 0.84,
        ]
      ),
      new THREE.QuaternionKeyframeTrack(
        'RightArm.quaternion',
        [0, 1.2, 2.4],
        [
          0, 0, -0.06, 0.998,
          0, 0, -0.02, 0.999,
          0, 0, -0.06, 0.998,
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

  // C. SIT CLIP (Ngồi buông chân bên mép hiên nước hoặc tọa thiền tĩnh tâm)
  const sitDur = 1.0;
  const sitTracks: THREE.KeyframeTrack[] = [
    // Hạ thấp người xuống mặt sàn
    new THREE.VectorKeyframeTrack('Torso.position', [0, 1.0], [0, -0.22, 0, 0, -0.22, 0]),
    // Đùi đưa ngang ra phía trước
    new THREE.QuaternionKeyframeTrack('LeftLeg.quaternion', [0, 1.0], [-0.707, 0, 0, 0.707, -0.707, 0, 0, 0.707]),
    new THREE.QuaternionKeyframeTrack('RightLeg.quaternion', [0, 1.0], [-0.707, 0, 0, 0.707, -0.707, 0, 0, 0.707]),
    // Cẳng chân buông thõng xuống mép sàn hiên nước
    new THREE.QuaternionKeyframeTrack('LeftShin.quaternion', [0, 1.0], [0.707, 0, 0, 0.707, 0.707, 0, 0, 0.707]),
    new THREE.QuaternionKeyframeTrack('RightShin.quaternion', [0, 1.0], [0.707, 0, 0, 0.707, 0.707, 0, 0, 0.707]),
    // Hai tay đặt an tĩnh trên đùi
    new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', [0, 1.0], [0.35, 0, 0.05, 0.935, 0.35, 0, 0.05, 0.935]),
    new THREE.QuaternionKeyframeTrack('RightArm.quaternion', [0, 1.0], [0.35, 0, -0.05, 0.935, 0.35, 0, -0.05, 0.935]),
  ];
  const sitClip = new THREE.AnimationClip('sit', sitDur, sitTracks);

  // Mixer
  const mixer = new THREE.AnimationMixer(model);
  const walkAction = mixer.clipAction(walkClip);
  const idleAction = mixer.clipAction(idleClip);
  const sitAction = mixer.clipAction(sitClip);

  walkAction.loop = THREE.LoopRepeat;
  idleAction.loop = THREE.LoopRepeat;
  sitAction.loop = THREE.LoopRepeat;

  walkAction.timeScale = 1.15;
  idleAction.timeScale = 1.0;
  sitAction.timeScale = 1.0;

  // Căn chỉnh vị trí đế giày chạm đất chính xác ở y = 0 bên trong monkGroup
  model.position.set(0, 0, 0);
  model.scale.set(1.0, 1.0, 1.0);

  return {
    modelGroup: model,
    mixer,
    actions: {
      walk: walkAction,
      idle: idleAction,
      sit: sitAction,
    },
  };
}
