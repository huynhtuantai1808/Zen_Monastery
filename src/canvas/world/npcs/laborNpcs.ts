import * as THREE from 'three';
import type { CircleObstacle } from '../colliders';
import { createTueTinhFaceTexture, getSharedTexture } from '../textures';

export type LaborNpcType =
  | 'HEAD_COOK'
  | 'KITCHEN_PREP'
  | 'WOOD_CHOPPER'
  | 'WOOD_STACKER'
  | 'WATER_DRAWER'
  | 'WATER_CARRIER';

export interface LaborNpcConfig {
  id: string;
  type: LaborNpcType;
  title: string;
  name: string;
  dialogue: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  colliderRadius: number;
}

export interface LaborNpcInstance {
  config: LaborNpcConfig;
  group: THREE.Group;
  animationCycle: number;
  update: (delta: number, stepCount: number, playerDist: number) => void;
}

export interface LaborEnsembleResult {
  group: THREE.Group;
  npcs: LaborNpcInstance[];
  obstacles: CircleObstacle[];
  update: (delta: number, stepCount: number, playerPos: { x: number; y: number; z: number }) => void;
  dispose: () => void;
}

export const LABOR_NPC_CONFIGS: LaborNpcConfig[] = [
  {
    id: 'labor_head_cook',
    type: 'HEAD_COOK',
    title: 'Đầu Bếp Thiền Môn',
    name: 'Chú Tiểu Tuệ Thiện',
    dialogue: 'A Di Đà Phật! Cơm chay thanh đạm đang sôi sùng sục, sư huynh đã dùng bữa chưa?',
    x: -20.0,
    y: 0.58, // Đứng trên sàn móng đá Nhà Bếp Chùa (Y = 0.58m)
    z: -45.5,
    rotationY: 0,
    colliderRadius: 0.8,
  },
  {
    id: 'labor_kitchen_prep',
    type: 'KITCHEN_PREP',
    title: 'Phụ Bếp Nhặt Rau',
    name: 'Phật Tử Diệu Tâm',
    dialogue: 'Rau cải và củ quả tươi non vừa thu hoạch từ vườn thiền, rửa sạch thanh tịnh chuẩn bị cho trai tăng.',
    x: -17.5,
    y: 0.35, // Sân gạch Bát Tràng hậu viện (Y = 0.35m)
    z: -42.8,
    rotationY: Math.PI / 2,
    colliderRadius: 0.75,
  },
  {
    id: 'labor_wood_chopper',
    type: 'WOOD_CHOPPER',
    title: 'Chú Tiểu Chẻ Củi',
    name: 'Chú Tiểu Tuệ Lực',
    dialogue: 'Từng nhát búa chẻ củi cũng là một phen tu dưỡng chánh niệm và rèn luyện thể lực.',
    x: -6.8,
    y: 0.35,
    z: -46.2,
    rotationY: Math.PI * 0.25,
    colliderRadius: 0.8,
  },
  {
    id: 'labor_wood_stacker',
    type: 'WOOD_STACKER',
    title: 'Sắp Củi Vào Kho',
    name: 'Phật Tử Thiện Chí',
    dialogue: 'Củi khô xếp đều ngay ngắn giúp thông gió và tiện việc nhóm lửa nấu bếp mỗi sớm mai.',
    x: -3.5,
    y: 0.35,
    z: -48.0,
    rotationY: -Math.PI * 0.5,
    colliderRadius: 0.75,
  },
  {
    id: 'labor_water_drawer',
    type: 'WATER_DRAWER',
    title: 'Múc Nước Giếng Ngọc',
    name: 'Chú Tiểu Tuệ Tuyền',
    dialogue: 'Nước Giếng Ngọc Cổ ngàn năm trong vắt ngọt lành, rửa sạch bụi trần phiền não.',
    x: 11.5,
    y: 0.35,
    z: -45.0,
    rotationY: -Math.PI * 0.5,
    colliderRadius: 0.8,
  },
  {
    id: 'labor_water_carrier',
    type: 'WATER_CARRIER',
    title: 'Gánh Nước Thiền Hành',
    name: 'Chú Tiểu Tuệ Hành',
    dialogue: 'Bước chân thong dong giữ thăng bằng đòn gánh, tâm không xao động thì nước chẳng tràn ra ngoài.',
    x: 12.0,
    y: 0.38, // Lối đá xanh trục ngang Hậu Viện (Y = 0.38m)
    z: -45.0,
    rotationY: -Math.PI / 2,
    colliderRadius: 0.75,
  },
];

export function getLaborNpcConfigs(): LaborNpcConfig[] {
  return LABOR_NPC_CONFIGS;
}

export function getLaborNpcColliders(): CircleObstacle[] {
  return LABOR_NPC_CONFIGS.map((cfg) => ({
    type: 'circle',
    x: cfg.x,
    z: cfg.z,
    r: cfg.colliderRadius,
    name: `Labor NPC: ${cfg.title}`,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD PROCEDURAL CHIBI MONK RIG
// ─────────────────────────────────────────────────────────────────────────────
interface ChibiRigComponents {
  root: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
}

function buildBaseLaborNpcRig(
  matRobe: THREE.Material,
  matCollar: THREE.Material,
  matSkin: THREE.Material,
  faceTex: THREE.Texture
): ChibiRigComponents {
  const root = new THREE.Group();

  // Bipedal Legs
  const legL = new THREE.Group();
  legL.position.set(-0.12, 0.48, 0);
  const legMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.48, 8), matRobe);
  legMeshL.position.set(0, -0.24, 0);
  legMeshL.castShadow = true;
  legL.add(legMeshL);
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.065, 0.18), matCollar);
  shoeL.position.set(0, -0.46, 0.02);
  legL.add(shoeL);
  root.add(legL);

  const legR = new THREE.Group();
  legR.position.set(0.12, 0.48, 0);
  const legMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.48, 8), matRobe);
  legMeshR.position.set(0, -0.24, 0);
  legMeshR.castShadow = true;
  legR.add(legMeshR);
  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.065, 0.18), matCollar);
  shoeR.position.set(0, -0.46, 0.02);
  legR.add(shoeR);
  root.add(legR);

  // Torso
  const torso = new THREE.Group();
  torso.position.set(0, 0.48, 0);
  const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.52, 10), matRobe);
  bodyMesh.position.set(0, 0.26, 0);
  bodyMesh.castShadow = true;
  torso.add(bodyMesh);

  const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.25, 0.12, 10), matCollar);
  collarMesh.position.set(0, 0.44, 0);
  torso.add(collarMesh);
  root.add(torso);

  // Arms
  const armL = new THREE.Group();
  armL.position.set(-0.25, 0.42, 0.02);
  const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 0.32, 8), matRobe);
  sleeveL.position.set(0, -0.12, 0);
  armL.add(sleeveL);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), matSkin);
  handL.position.set(0, -0.28, 0);
  armL.add(handL);
  torso.add(armL);

  const armR = new THREE.Group();
  armR.position.set(0.25, 0.42, 0.02);
  const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 0.32, 8), matRobe);
  sleeveR.position.set(0, -0.12, 0);
  armR.add(sleeveR);
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), matSkin);
  handR.position.set(0, -0.28, 0);
  armR.add(handR);
  torso.add(armR);

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.54, 0);
  const sFaceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.5 });
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), sFaceMat);
  headMesh.rotation.y = Math.PI; // Hướng mặt về phía trước z+
  headMesh.castShadow = true;
  head.add(headMesh);
  torso.add(head);

  return { root, torso, head, armL, armR, legL, legR };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENSEMBLE CREATOR & CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────
export function createLaborNpcEnsemble(): LaborEnsembleResult {
  const group = new THREE.Group();
  group.name = 'MonasteryLaborNpcEnsemble';

  // Shared Materials
  const matRobeBrown = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 }); // Nâu sồng chú tiểu
  const matRobeLam = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.75 }); // Lam phật tử
  const matRobeOchre = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 }); // Nâu vàng đất
  const matCollar = new THREE.MeshStandardMaterial({ color: 0x3f2e24, roughness: 0.85 });
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.45 });
  const matDarkTimber = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
  const matLightWood = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 });
  const matCastIron = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5, metalness: 0.4 });
  const matVegGreen = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
  const matVegOrange = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.6 });
  const matWaterBucket = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.1 });

  const faceTex = getSharedTexture('tuetinh_face', createTueTinhFaceTexture);

  const npcs: LaborNpcInstance[] = [];

  // 1. HEAD COOK (Đứng bếp xào nấu & quấy chảo/nồi)
  {
    const cfg = LABOR_NPC_CONFIGS[0];
    const rig = buildBaseLaborNpcRig(matRobeBrown, matCollar, matSkin, faceTex);
    rig.root.position.set(cfg.x, cfg.y, cfg.z);
    rig.root.rotation.y = cfg.rotationY;

    // Bếp lò và nồi canh
    const stoveGroup = new THREE.Group();
    stoveGroup.position.set(0, 0, 0.65);

    const stoveMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.55, 12), matCollar);
    stoveMesh.position.set(0, 0.275, 0);
    stoveGroup.add(stoveMesh);

    const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.25, 12), matCastIron);
    potMesh.position.set(0, 0.62, 0);
    stoveGroup.add(potMesh);

    // Muỗng gỗ quấy nồi trong tay phải
    const ladle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), matLightWood);
    ladle.position.set(0, -0.22, 0.12);
    ladle.rotation.x = 0.6;
    rig.armR.add(ladle);

    rig.root.add(stoveGroup);
    group.add(rig.root);

    npcs.push({
      config: cfg,
      group: rig.root,
      animationCycle: 0,
      update: (_delta, stepCount, _playerDist) => {
        const speed = _playerDist < 3.0 ? 1.5 : 2.5;
        const t = stepCount * 0.04 * speed;
        // Quấy thìa và lắc vai nhẹ nhàng
        rig.armR.rotation.x = -0.45 + Math.sin(t) * 0.22;
        rig.armR.rotation.y = Math.cos(t) * 0.18;
        rig.armL.rotation.x = -0.3 + Math.sin(t * 0.5) * 0.08;
        rig.head.rotation.x = 0.15 + Math.sin(t * 0.5) * 0.06;
        rig.torso.rotation.y = Math.sin(t) * 0.06;
      },
    });
  }

  // 2. KITCHEN PREP (Phụ bếp nhặt & thái rau củ trên bàn)
  {
    const cfg = LABOR_NPC_CONFIGS[1];
    const rig = buildBaseLaborNpcRig(matRobeLam, matCollar, matSkin, faceTex);
    rig.root.position.set(cfg.x, cfg.y, cfg.z);
    rig.root.rotation.y = cfg.rotationY;

    // Bàn bếp và thớt gỗ
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0, 0.55);

    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.5), matLightWood);
    tableTop.position.set(0, 0.46, 0);
    tableGroup.add(tableTop);

    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.46, 6), matDarkTimber);
    leg1.position.set(-0.38, 0.23, 0.2);
    tableGroup.add(leg1);
    const leg2 = leg1.clone();
    leg2.position.set(0.38, 0.23, 0.2);
    tableGroup.add(leg2);
    const leg3 = leg1.clone();
    leg3.position.set(-0.38, 0.23, -0.2);
    tableGroup.add(leg3);
    const leg4 = leg1.clone();
    leg4.position.set(0.38, 0.23, -0.2);
    tableGroup.add(leg4);

    // Rổ rau củ
    const vegBasket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.10, 0.09, 8), matLightWood);
    vegBasket.position.set(-0.25, 0.52, 0);
    tableGroup.add(vegBasket);

    const carrots = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 6), matVegOrange);
    carrots.position.set(-0.22, 0.56, 0);
    carrots.rotation.z = Math.PI / 3;
    tableGroup.add(carrots);

    const greens = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), matVegGreen);
    greens.position.set(0.12, 0.52, 0);
    tableGroup.add(greens);

    // Dao thái rau trong tay phải
    const knife = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.01), matCastIron);
    knife.position.set(0, -0.25, 0.06);
    knife.rotation.x = 0.5;
    rig.armR.add(knife);

    rig.root.add(tableGroup);
    group.add(rig.root);

    npcs.push({
      config: cfg,
      group: rig.root,
      animationCycle: 0,
      update: (_delta, stepCount, _playerDist) => {
        const t = stepCount * 0.08;
        // Tay phải băm/thái đều đặn
        rig.armR.rotation.x = -0.55 + Math.sin(t) * 0.18;
        rig.armL.rotation.x = -0.45 + Math.cos(t * 0.5) * 0.08;
        rig.head.rotation.x = 0.25; // Nhìn xuống mặt bàn
        rig.torso.rotation.x = 0.05 + Math.sin(t) * 0.02;
      },
    });
  }

  // 3. WOOD CHOPPER (Chẻ củi nhịp nhàng tại bãi củi)
  {
    const cfg = LABOR_NPC_CONFIGS[2];
    const rig = buildBaseLaborNpcRig(matRobeOchre, matCollar, matSkin, faceTex);
    rig.root.position.set(cfg.x, cfg.y, cfg.z);
    rig.root.rotation.y = cfg.rotationY;

    // Gốc cây kê củi (Stump block)
    const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.42, 10), matDarkTimber);
    stump.position.set(0, 0.21, 0.65);
    rig.root.add(stump);

    const splitLog = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.34, 6), matLightWood);
    splitLog.position.set(0, 0.58, 0.65);
    rig.root.add(splitLog);

    // Rìu chẻ củi trong cả hai tay
    const axeGroup = new THREE.Group();
    axeGroup.position.set(0, -0.26, 0.1);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 6), matLightWood);
    handle.rotation.x = Math.PI / 2;
    axeGroup.add(handle);

    const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.14), matCastIron);
    axeBlade.position.set(0, 0.06, 0.35);
    axeGroup.add(axeBlade);

    rig.armR.add(axeGroup);
    group.add(rig.root);

    npcs.push({
      config: cfg,
      group: rig.root,
      animationCycle: 0,
      update: (_delta, stepCount, _playerDist) => {
        // Chu kỳ vung rìu: Giương rìu lên cao rồi hạ búa dứt khoát
        const cycle = (stepCount * 0.04) % (Math.PI * 2);
        let armAngle = -0.3;
        let torsoAngle = 0;

        if (cycle < Math.PI) {
          // Nâng rìu lên cao
          const p = cycle / Math.PI;
          armAngle = -0.3 - p * 1.1;
          torsoAngle = -p * 0.15;
        } else {
          // Bổ rìu xuống nhanh chóng
          const p = (cycle - Math.PI) / Math.PI;
          const strike = Math.sin(p * Math.PI);
          armAngle = -1.4 + strike * 1.1;
          torsoAngle = -0.15 + strike * 0.3;
        }

        rig.armR.rotation.x = armAngle;
        rig.armL.rotation.x = armAngle * 0.9;
        rig.armL.rotation.z = -0.2;
        rig.torso.rotation.x = torsoAngle;
        rig.head.rotation.x = 0.15 - torsoAngle * 0.5;
      },
    });
  }

  // 4. WOOD STACKER (Sắp củi vào kệ kho củi)
  {
    const cfg = LABOR_NPC_CONFIGS[3];
    const rig = buildBaseLaborNpcRig(matRobeLam, matCollar, matSkin, faceTex);
    rig.root.position.set(cfg.x, cfg.y, cfg.z);
    rig.root.rotation.y = cfg.rotationY;

    // Kệ củi gỗ 2 tầng
    const rackGroup = new THREE.Group();
    rackGroup.position.set(0, 0, 0.65);

    const rackBack = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.1), matDarkTimber);
    rackBack.position.set(0, 0.45, 0.2);
    rackGroup.add(rackBack);

    // Các bó củi xếp trên kệ
    for (let row = 0; row < 2; row++) {
      for (let col = -3; col <= 3; col++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), matLightWood);
        log.rotation.x = Math.PI / 2;
        log.position.set(col * 0.12, 0.22 + row * 0.26, 0.05);
        rackGroup.add(log);
      }
    }

    // Khúc củi cầm trên tay để xếp vào
    const heldLog = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 6), matLightWood);
    heldLog.rotation.z = Math.PI / 2;
    heldLog.position.set(0, -0.26, 0.18);
    rig.armR.add(heldLog);

    rig.root.add(rackGroup);
    group.add(rig.root);

    npcs.push({
      config: cfg,
      group: rig.root,
      animationCycle: 0,
      update: (_delta, stepCount, _playerDist) => {
        const t = stepCount * 0.04;
        // Cúi xuống nhặt khúc củi rồi rướn người xếp lên kệ
        const bend = Math.sin(t);
        rig.torso.rotation.x = 0.15 + bend * 0.12;
        rig.armR.rotation.x = -0.45 + bend * 0.3;
        rig.armL.rotation.x = -0.45 + bend * 0.28;
        rig.head.rotation.x = 0.2 - bend * 0.1;
      },
    });
  }

  // 5. WATER DRAWER (Múc nước tại Giếng Ngọc Cổ)
  {
    const cfg = LABOR_NPC_CONFIGS[4];
    const rig = buildBaseLaborNpcRig(matRobeBrown, matCollar, matSkin, faceTex);
    rig.root.position.set(cfg.x, cfg.y, cfg.z);
    rig.root.rotation.y = cfg.rotationY;

    // Trục quay múc nước & dây thừng
    const wellCrankGroup = new THREE.Group();
    wellCrankGroup.position.set(0, 0, 0.55);

    const crankHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), matDarkTimber);
    crankHandle.position.set(0.2, 0.55, 0);
    crankHandle.rotation.z = Math.PI / 2;
    wellCrankGroup.add(crankHandle);

    const wellBucket = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.22, 8), matDarkTimber);
    wellBucket.position.set(0, 0.15, 0.15);
    wellCrankGroup.add(wellBucket);

    rig.root.add(wellCrankGroup);
    group.add(rig.root);

    npcs.push({
      config: cfg,
      group: rig.root,
      animationCycle: 0,
      update: (_delta, stepCount, _playerDist) => {
        const t = stepCount * 0.05;
        // Xoay tay kéo thùng nước từ giếng lên
        rig.armR.rotation.x = -0.5 + Math.sin(t) * 0.35;
        rig.armR.rotation.y = Math.cos(t) * 0.2;
        rig.armL.rotation.x = -0.4 + Math.sin(t + 1.5) * 0.3;
        rig.torso.rotation.x = 0.1 + Math.sin(t) * 0.06;
        rig.head.rotation.x = 0.3; // Nhìn xuống lòng giếng
      },
    });
  }

  // 6. WATER CARRIER (Gánh nước tuần tra nhịp nhàng giữa Giếng Ngọc và Nhà Bếp)
  {
    const cfg = LABOR_NPC_CONFIGS[5];
    const rig = buildBaseLaborNpcRig(matRobeBrown, matCollar, matSkin, faceTex);
    rig.root.position.set(cfg.x, cfg.y, cfg.z);
    rig.root.rotation.y = cfg.rotationY;

    // Đòn gánh tre dài đặt ngang qua vai
    const poleGroup = new THREE.Group();
    poleGroup.position.set(0, 0.44, 0);

    const bambooPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.45, 8), matLightWood);
    bambooPole.rotation.z = Math.PI / 2;
    poleGroup.add(bambooPole);

    // Thùng nước bên trái & bên phải
    const bucketL = new THREE.Group();
    bucketL.position.set(-0.65, -0.42, 0);
    const ropeL = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.42, 4), matDarkTimber);
    ropeL.position.set(0, 0.21, 0);
    bucketL.add(ropeL);
    const bMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.24, 8), matLightWood);
    bMeshL.castShadow = true;
    bucketL.add(bMeshL);
    const waterL = new THREE.Mesh(new THREE.CircleGeometry(0.11, 8), matWaterBucket);
    waterL.rotation.x = -Math.PI / 2;
    waterL.position.set(0, 0.11, 0);
    bucketL.add(waterL);
    poleGroup.add(bucketL);

    const bucketR = new THREE.Group();
    bucketR.position.set(0.65, -0.42, 0);
    const ropeR = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.42, 4), matDarkTimber);
    ropeR.position.set(0, 0.21, 0);
    bucketR.add(ropeR);
    const bMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.24, 8), matLightWood);
    bMeshR.castShadow = true;
    bucketR.add(bMeshR);
    const waterR = new THREE.Mesh(new THREE.CircleGeometry(0.11, 8), matWaterBucket);
    waterR.rotation.x = -Math.PI / 2;
    waterR.position.set(0, 0.11, 0);
    bucketR.add(waterR);
    poleGroup.add(bucketR);

    rig.torso.add(poleGroup);

    // Đôi tay giữ đòn gánh trên vai
    rig.armL.rotation.x = -0.7;
    rig.armL.rotation.z = -0.3;
    rig.armR.rotation.x = -0.7;
    rig.armR.rotation.z = 0.3;

    group.add(rig.root);

    // Patrol Route: Giếng Ngọc X = 12.0 <--> Nhà Bếp X = -16.0 dọc trục Z = -45.0
    let carrierProgress = 0; // 0..1
    let carrierDirection = -1; // -1: đi về hướng bếp, 1: đi về hướng giếng

    npcs.push({
      config: cfg,
      group: rig.root,
      animationCycle: 0,
      update: (_delta, stepCount, _playerDist) => {
        // Tốc độ đi bộ gánh nước thong dong
        const walkSpeed = 0.0022;
        carrierProgress += walkSpeed * carrierDirection;

        if (carrierProgress <= 0) {
          carrierProgress = 0;
          carrierDirection = 1;
        } else if (carrierProgress >= 1) {
          carrierProgress = 1;
          carrierDirection = -1;
        }

        // Nội suy vị trí theo X
        const startX = 12.0;
        const endX = -16.0;
        const currX = startX + (endX - startX) * carrierProgress;
        rig.root.position.x = currX;
        rig.root.position.y = 0.38; // Sàn đá xanh trục ngang
        rig.root.position.z = -45.0;

        // Xoay mặt theo hướng di chuyển
        const targetRotY = carrierDirection < 0 ? -Math.PI / 2 : Math.PI / 2;
        rig.root.rotation.y = targetRotY;

        // Bipedal walk cycle
        const walkPhase = stepCount * 0.12;
        rig.legL.rotation.x = Math.sin(walkPhase) * 0.55;
        rig.legR.rotation.x = -Math.sin(walkPhase) * 0.55;

        // Nhấp nhô đòn gánh và lắc lư thùng nước theo nhịp bước chân
        const bob = Math.abs(Math.sin(walkPhase)) * 0.035;
        rig.torso.position.y = 0.48 + bob;

        const sway = Math.sin(walkPhase) * 0.12;
        bucketL.rotation.z = sway;
        bucketR.rotation.z = sway;
      },
    });
  }

  const ensembleResult: LaborEnsembleResult = {
    group,
    npcs,
    obstacles: getLaborNpcColliders(),
    update: (delta, stepCount, playerPos) => {
      for (let i = 0; i < npcs.length; i++) {
        const npc = npcs[i];
        const dist = Math.hypot(npc.group.position.x - playerPos.x, npc.group.position.z - playerPos.z);
        npc.update(delta, stepCount, dist);
      }
    },
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      group.clear();
    },
  };

  return ensembleResult;
}
