import * as THREE from 'three';
import type { CircleObstacle } from '../colliders';
import { createTueTinhFaceTexture, getSharedTexture } from '../textures';

export interface ShrineNpcConfig {
  id: string;
  role: 'INCENSE_ATTENDANT' | 'CARETAKER_SWEEPER';
  title: string;
  name: string;
  dialogue: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  colliderRadius: number;
}

export interface ShrineNpcInstance {
  config: ShrineNpcConfig;
  group: THREE.Group;
  clothTool?: THREE.Mesh;
  broomTool?: THREE.Mesh;
  incenseBundle?: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Group;
  update: (delta: number, stepCount: number, playerDist: number) => void;
}

export interface ShrineNpcEnsembleResult {
  group: THREE.Group;
  npcs: ShrineNpcInstance[];
  obstacles: CircleObstacle[];
  update: (delta: number, stepCount: number, playerPos: { x: number; y: number; z: number }) => void;
  dispose: () => void;
}

export const SHRINE_NPC_CONFIGS: ShrineNpcConfig[] = [
  {
    id: 'shrine_attendant',
    role: 'INCENSE_ATTENDANT',
    title: 'Người Trao Nhang',
    name: 'Chú Tiểu Tuệ Duyên',
    dialogue:
      'A Di Đà Phật! Con kính gửi thí chủ bó nhang trầm thanh tịnh. Thí chủ hãy thắp 3 nén nhang trước tôn tượng Quán Thế Âm Bồ Tát với tất cả tấm lòng chí thành nhé.',
    x: 26.0,
    y: 0.58,
    z: 34.0,
    rotationY: Math.PI * 0.25, // Hướng ra lối vào phía Tây sảnh
    colliderRadius: 0.65,
  },
  {
    id: 'shrine_caretaker',
    role: 'CARETAKER_SWEEPER',
    title: 'Người Dọn Dẹp Lau Chùi',
    name: 'Chú Tiểu Tuệ Tịnh',
    dialogue:
      'A Di Đà Phật! Mỗi ngày lau chùi lư hương, quét sạch lá sen rơi, con thấy tâm mình cũng như được gột rửa bao nhiêu bụi trần phiền não, trở về sự thanh tịnh ban sơ.',
    x: 37.0,
    y: 0.58,
    z: 37.5,
    rotationY: -Math.PI * 0.45, // Hướng về phía lư hương và bàn thờ
    colliderRadius: 0.65,
  },
];

/**
 * Procedural Factory: Tôn tạo 2 NPC Thiền Môn phụng sự tại Quán Âm Đại Điện
 */
export function createShrineNpcEnsemble(): ShrineNpcEnsembleResult {
  const ensembleGroup = new THREE.Group();
  ensembleGroup.name = 'ShrineNpcEnsemble';

  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  // Face texture
  const texFace = getSharedTexture('shrine_monk_face', createTueTinhFaceTexture);

  // Common Materials
  const matSkin = new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    roughness: 0.55,
  });
  disposables.push(matSkin);

  const matSaffronRobe = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Áo nâu sồng nghệ vàng thiền môn
    roughness: 0.75,
  });
  disposables.push(matSaffronRobe);

  const matSlateRobe = new THREE.MeshStandardMaterial({
    color: 0x475569, // Áo lam xám tro thiền môn
    roughness: 0.8,
  });
  disposables.push(matSlateRobe);

  const matCollar = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
  });
  disposables.push(matCollar);

  const matWood = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.65,
  });
  disposables.push(matWood);

  const matClothWhite = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.9,
  });
  disposables.push(matClothWhite);

  const matStrawBroom = new THREE.MeshStandardMaterial({
    color: 0xca8a04,
    roughness: 0.85,
  });
  disposables.push(matStrawBroom);

  const matIncenseTip = new THREE.MeshBasicMaterial({
    color: 0xef4444,
  });
  disposables.push(matIncenseTip);

  const npcs: ShrineNpcInstance[] = [];
  const obstacles: CircleObstacle[] = [];

  SHRINE_NPC_CONFIGS.forEach((cfg) => {
    const npcGroup = new THREE.Group();
    npcGroup.name = `NPC_${cfg.id}`;
    npcGroup.position.set(cfg.x, cfg.y, cfg.z);
    npcGroup.rotation.y = cfg.rotationY;

    const robeMaterial = cfg.role === 'INCENSE_ATTENDANT' ? matSaffronRobe : matSlateRobe;

    // 1. Thân áo chùng (Chibi Robe)
    const bodyGeo = new THREE.CylinderGeometry(0.24, 0.38, 0.78, 16);
    disposables.push(bodyGeo);
    const bodyMesh = new THREE.Mesh(bodyGeo, robeMaterial);
    bodyMesh.position.y = 0.44;
    bodyMesh.castShadow = true;
    npcGroup.add(bodyMesh);

    // Cổ áo
    const collarGeo = new THREE.TorusGeometry(0.18, 0.035, 8, 16);
    disposables.push(collarGeo);
    const collarMesh = new THREE.Mesh(collarGeo, matCollar);
    collarMesh.position.y = 0.82;
    collarMesh.rotation.x = Math.PI / 2;
    npcGroup.add(collarMesh);

    // 2. Đầu & Mặt Chú Tiểu
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0);

    const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
    disposables.push(headGeo);
    const matFace = new THREE.MeshStandardMaterial({
      map: texFace,
      roughness: 0.5,
    });
    disposables.push(matFace);
    const headMesh = new THREE.Mesh(headGeo, matFace);
    headMesh.rotation.y = -Math.PI / 2;
    headGroup.add(headMesh);

    // Tai
    for (const sx of [-0.26, 0.26]) {
      const earGeo = new THREE.SphereGeometry(0.065, 8, 8);
      disposables.push(earGeo);
      const ear = new THREE.Mesh(earGeo, matSkin);
      ear.position.set(sx, 0, 0);
      ear.scale.set(0.5, 1, 0.7);
      headGroup.add(ear);
    }
    npcGroup.add(headGroup);

    // 3. Hai Cánh Tay
    const armGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.42, 10);
    disposables.push(armGeo);

    // Cánh tay trái
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.28, 0.76, 0);
    const armLMesh = new THREE.Mesh(armGeo, robeMaterial);
    armLMesh.position.y = -0.18;
    leftArm.add(armLMesh);

    const handLGeo = new THREE.SphereGeometry(0.06, 8, 8);
    disposables.push(handLGeo);
    const handL = new THREE.Mesh(handLGeo, matSkin);
    handL.position.y = -0.38;
    leftArm.add(handL);
    npcGroup.add(leftArm);

    // Cánh tay phải
    const rightArm = new THREE.Group();
    rightArm.position.set(0.28, 0.76, 0);
    const armRMesh = new THREE.Mesh(armGeo, robeMaterial);
    armRMesh.position.y = -0.18;
    rightArm.add(armRMesh);

    const handRGeo = new THREE.SphereGeometry(0.06, 8, 8);
    disposables.push(handRGeo);
    const handR = new THREE.Mesh(handRGeo, matSkin);
    handR.position.y = -0.38;
    rightArm.add(handR);
    npcGroup.add(rightArm);

    let clothTool: THREE.Mesh | undefined;
    let broomTool: THREE.Mesh | undefined;
    let incenseBundle: THREE.Group | undefined;

    // 4. Đạo cụ chuyên biệt theo vai trò
    if (cfg.role === 'INCENSE_ATTENDANT') {
      // Bó nhang thơm trên tay Chú Tiểu Tuệ Duyên
      incenseBundle = new THREE.Group();
      incenseBundle.position.set(0, -0.4, 0.12);

      const stickBundleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.36, 8);
      disposables.push(stickBundleGeo);
      const bundleMesh = new THREE.Mesh(stickBundleGeo, matWood);
      bundleMesh.rotation.x = Math.PI * 0.25;
      incenseBundle.add(bundleMesh);

      // Đầu tàn nhang đỏ
      const tipGeo = new THREE.SphereGeometry(0.04, 6, 6);
      disposables.push(tipGeo);
      const tipMesh = new THREE.Mesh(tipGeo, matIncenseTip);
      tipMesh.position.set(0, 0.14, 0.12);
      incenseBundle.add(tipMesh);

      rightArm.add(incenseBundle);

      // Tư thế mời nhang: hai tay nâng nhẹ về trước
      leftArm.rotation.set(-0.65, 0.2, 0.35);
      rightArm.rotation.set(-0.75, -0.2, -0.25);
    } else {
      // Khăn lau chùi mềm & Chổi quét lá của Chú Tiểu Tuệ Tịnh
      const clothGeo = new THREE.BoxGeometry(0.18, 0.12, 0.14);
      disposables.push(clothGeo);
      clothTool = new THREE.Mesh(clothGeo, matClothWhite);
      clothTool.position.set(0, -0.38, 0.08);
      rightArm.add(clothTool);

      // Cây chổi tre dựng bên cạnh
      const broomGroup = new THREE.Group();
      broomGroup.position.set(-0.35, 0, 0.25);
      broomGroup.rotation.z = 0.12;

      const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.25, 8);
      disposables.push(handleGeo);
      const handle = new THREE.Mesh(handleGeo, matWood);
      handle.position.y = 0.62;
      broomGroup.add(handle);

      const bristleGeo = new THREE.ConeGeometry(0.14, 0.38, 8);
      disposables.push(bristleGeo);
      broomTool = new THREE.Mesh(bristleGeo, matStrawBroom);
      broomTool.position.y = 0.18;
      broomGroup.add(broomTool);

      npcGroup.add(broomGroup);

      // Tư thế lau chùi: tay phải vươn về trước
      rightArm.rotation.set(-0.85, 0.3, -0.2);
      leftArm.rotation.set(-0.35, -0.1, 0.2);
    }

    // Vòng lặp hoạt ảnh NPC (Zero-Allocation)
    let animTime = Math.random() * 10;
    const updateNpc = (delta: number, _stepCount: number, playerDist: number) => {
      animTime += delta;

      if (cfg.role === 'INCENSE_ATTENDANT') {
        // Cúi đầu chào cung kính khi người chơi đến gần (< 3.8m)
        if (playerDist < 3.8) {
          headGroup.rotation.x = Math.sin(animTime * 3.0) * 0.15 + 0.12;
          rightArm.rotation.x = -0.75 + Math.sin(animTime * 2.5) * 0.08;
          leftArm.rotation.x = -0.65 + Math.sin(animTime * 2.5) * 0.08;
        } else {
          // Thở nhẹ khoan thai
          headGroup.rotation.x = Math.sin(animTime * 1.5) * 0.04;
          bodyMesh.position.y = 0.44 + Math.sin(animTime * 1.8) * 0.005;
        }
      } else {
        // Chú Tiểu Tuệ Tịnh cần mẫn lau chùi thân lư hương
        const wipeSpeed = 4.2;
        rightArm.rotation.x = -0.85 + Math.sin(animTime * wipeSpeed) * 0.18;
        rightArm.rotation.y = 0.3 + Math.cos(animTime * wipeSpeed) * 0.15;
        headGroup.rotation.y = Math.sin(animTime * 2.0) * 0.12;
        bodyMesh.rotation.y = Math.sin(animTime * wipeSpeed * 0.5) * 0.06;
      }
    };

    npcs.push({
      config: cfg,
      group: npcGroup,
      clothTool,
      broomTool,
      incenseBundle,
      leftArm,
      rightArm,
      head: headGroup,
      update: updateNpc,
    });

    obstacles.push({
      type: 'circle',
      x: cfg.x,
      z: cfg.z,
      r: cfg.colliderRadius,
      name: `Shrine NPC ${cfg.name}`,
    });

    ensembleGroup.add(npcGroup);
  });

  const update = (delta: number, stepCount: number, playerPos: { x: number; y: number; z: number }) => {
    npcs.forEach((npc) => {
      const dx = playerPos.x - npc.config.x;
      const dz = playerPos.z - npc.config.z;
      const dist = Math.hypot(dx, dz);
      npc.update(delta, stepCount, dist);
    });
  };

  const dispose = () => {
    disposables.forEach((item) => {
      item.dispose();
    });
  };

  return {
    group: ensembleGroup,
    npcs,
    obstacles,
    update,
    dispose,
  };
}

