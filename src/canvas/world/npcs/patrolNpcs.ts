import * as THREE from 'three';
import { createTueTinhFaceTexture, getSharedTexture } from '../textures';

// =======================================================================
// HỆ THỐNG ĐIỂM TUẦN TRA & NGHI THỨC CHO CÁC NPC ĐỘNG (ZERO-ALLOCATION CONSTANTS)
// =======================================================================
export interface TeaServerPatrolWaypoint {
  x: number;
  z: number;
  facingAngle?: number;
  wait: number; // Số frames dừng lại thực hiện động tác (60fps: 180 = 3s)
  action: 'WAIT_TEA' | 'WALK' | 'SERVE_TABLE_1' | 'SERVE_TABLE_2' | 'GREET_ENTRANCE';
}

export const TEA_SERVER_WAYPOINTS: TeaServerPatrolWaypoint[] = [
  // WP 0: Bên bàn Sư Huynh Tuệ Trà, nhận ấm trà sen thơm ngát vừa pha
  { x: -0.9, z: -0.6, facingAngle: -Math.PI / 2, wait: 200, action: 'WAIT_TEA' },
  // WP 1: Lối đi ngắm cảnh hồ sen sang Bàn Khách 1
  { x: 0.8, z: 0.2, wait: 0, action: 'WALK' },
  // WP 2: Tại Bàn Khách 1, cúi xá chào & dâng khay trà sen thượng hạng
  { x: 2.1, z: 0.6, facingAngle: Math.PI / 4, wait: 240, action: 'SERVE_TABLE_1' },
  // WP 3: Góc hành lang phía trước
  { x: 0.8, z: 3.2, wait: 0, action: 'WALK' },
  // WP 4: Bậc tam cấp chính diện, cung kính nghinh đón Phật tử ghé Thiền Trà Quán
  { x: 0.0, z: 5.2, facingAngle: 0, wait: 220, action: 'GREET_ENTRANCE' },
  // WP 5: Tại Bàn Khách 2, rót thêm nước nóng & dọn chén trà
  { x: -1.2, z: 3.8, facingAngle: -Math.PI * 0.75, wait: 240, action: 'SERVE_TABLE_2' },
  // WP 6: Lối đi quay về bàn trà đạo
  { x: -1.0, z: 1.2, wait: 0, action: 'WALK' },
];

export const SWEEPER_WAYPOINTS = [
  { x: 4.5, z: 5.5, wait: 160 },   // Phía đông Lư Hương, quét lá đa
  { x: 6.5, z: -2.0, wait: 140 },  // Gần chậu bonsai tùng cổ thụ phía đông
  { x: 2.0, z: -6.0, wait: 180 },  // Dưới chân bậc tam cấp Chánh Điện, dừng lau trán ngắm trời mây
  { x: -4.5, z: -3.0, wait: 140 }, // Gần chậu bonsai phía tây
  { x: -5.5, z: 4.5, wait: 160 },  // Phía tây Lư Hương, quét dọn sạch sẽ
  { x: -0.5, z: 8.5, wait: 180 },  // Trước cổng tam quan sân trong, chắp tay xá chào
];

// =======================================================================
// NPC CHÚ TIỂU QUÉT SÂN "TUỆ TÂM" - SÂN CHÙA CHÁNH ĐIỆN (BIPEDAL WALKING & SWEEPING)
// =======================================================================
export function createSweepingMonkNpc(
  matRobe: THREE.Material,
  matCollar: THREE.Material,
  matSkin: THREE.Material,
  matDarkTimber: THREE.Material,
  matStraw: THREE.Material
): {
  group: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armR: THREE.Group;
  armL: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  broom: THREE.Group;
} {
  const sweeperGroup = new THREE.Group();

  // Khớp hông bipedal để bước đi tự nhiên
  const sLegL = new THREE.Group();
  sLegL.position.set(-0.12, 0.52, 0);
  const legMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.52, 8), matRobe);
  legMeshL.position.set(0, -0.26, 0);
  legMeshL.castShadow = true;
  sLegL.add(legMeshL);
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.20), matCollar);
  shoeL.position.set(0, -0.50, 0.03);
  sLegL.add(shoeL);
  sweeperGroup.add(sLegL);

  const sLegR = new THREE.Group();
  sLegR.position.set(0.12, 0.52, 0);
  const legMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.52, 8), matRobe);
  legMeshR.position.set(0, -0.26, 0);
  legMeshR.castShadow = true;
  sLegR.add(legMeshR);
  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.20), matCollar);
  shoeR.position.set(0, -0.50, 0.03);
  sLegR.add(shoeR);
  sweeperGroup.add(sLegR);

  // Thân trên
  const sTorso = new THREE.Group();
  sTorso.position.set(0, 0.52, 0);

  const sBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.56, 12), matRobe);
  sBody.position.set(0, 0.28, 0);
  sBody.castShadow = true;
  sTorso.add(sBody);

  const sCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.27, 0.14, 12), matCollar);
  sCollar.position.set(0, 0.48, 0);
  sTorso.add(sCollar);

  // Chổi tre truyền thống (Bamboo Broom)
  const broomGroup = new THREE.Group();
  broomGroup.position.set(0.20, 0.20, 0.25);

  const broomHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.35, 8), matDarkTimber);
  broomHandle.position.set(0, 0, 0);
  broomHandle.rotation.x = 0.35;
  broomHandle.rotation.z = -0.25;
  broomGroup.add(broomHandle);

  const broomHead = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 8), matStraw);
  broomHead.position.set(-0.16, -0.58, 0.22);
  broomHead.rotation.x = Math.PI - 0.35;
  broomHead.rotation.z = 0.25;
  broomGroup.add(broomHead);

  const broomTie = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 8), matCollar);
  broomTie.position.set(-0.12, -0.42, 0.17);
  broomGroup.add(broomTie);

  sTorso.add(broomGroup);

  // Đôi tay cầm chổi
  const sArmR = new THREE.Group();
  sArmR.position.set(0.26, 0.44, 0.02);
  const sSleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.34, 8), matRobe);
  sSleeveR.position.set(-0.04, -0.12, 0.14);
  sSleeveR.rotation.x = -0.80;
  sSleeveR.rotation.y = -0.25;
  sArmR.add(sSleeveR);
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), matSkin);
  rHand.position.set(-0.04, -0.26, 0.26);
  sArmR.add(rHand);
  sTorso.add(sArmR);

  const sArmL = new THREE.Group();
  sArmL.position.set(-0.26, 0.44, 0.02);
  const sSleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.34, 8), matRobe);
  sSleeveL.position.set(0.10, -0.10, 0.16);
  sSleeveL.rotation.x = -0.65;
  sSleeveL.rotation.y = 0.45;
  sArmL.add(sSleeveL);
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), matSkin);
  lHand.position.set(0.18, -0.20, 0.28);
  sArmL.add(lHand);
  sTorso.add(sArmL);

  // Đầu Chú Tiểu Chibi
  const sHead = new THREE.Group();
  sHead.position.set(0, 0.56, 0);
  const faceTex = getSharedTexture('tuetinh_face', createTueTinhFaceTexture);
  const sFaceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.5 });
  const sHeadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 20), sFaceMat);
  sHeadMesh.rotation.y = -Math.PI / 2;
  sHeadMesh.castShadow = true;
  sHead.add(sHeadMesh);

  for (const ex of [-0.27, 0.27]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), matSkin);
    ear.scale.set(0.5, 1.0, 0.7);
    ear.position.set(ex, 0, -0.02);
    sHead.add(ear);
  }
  sTorso.add(sHead);
  sweeperGroup.add(sTorso);

  return {
    group: sweeperGroup,
    torso: sTorso,
    head: sHead,
    armR: sArmR,
    armL: sArmL,
    legL: sLegL,
    legR: sLegR,
    broom: broomGroup,
  };
}


// =======================================================================
// NPC CHÚ TIỂU KINH HÀNH "TUỆ MINH" - DÃY HÀNH LANG GỖ LIM (WALKING MEDITATION)
// =======================================================================
export function createWalkingMonkNpc(
  matRobe: THREE.Material,
  matCollar: THREE.Material,
  matSkin: THREE.Material,
  matAmberWood: THREE.Material
): {
  group: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armR: THREE.Group;
  armL: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  beads: THREE.Group;
} {
  const monkGroup = new THREE.Group();

  // Khớp hông bipedal
  const mLegL = new THREE.Group();
  mLegL.position.set(-0.12, 0.52, 0);
  const legMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.52, 8), matRobe);
  legMeshL.position.set(0, -0.26, 0);
  legMeshL.castShadow = true;
  mLegL.add(legMeshL);
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.20), matCollar);
  shoeL.position.set(0, -0.50, 0.03);
  mLegL.add(shoeL);
  monkGroup.add(mLegL);

  const mLegR = new THREE.Group();
  mLegR.position.set(0.12, 0.52, 0);
  const legMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.52, 8), matRobe);
  legMeshR.position.set(0, -0.26, 0);
  legMeshR.castShadow = true;
  mLegR.add(legMeshR);
  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.20), matCollar);
  shoeR.position.set(0, -0.50, 0.03);
  mLegR.add(shoeR);
  monkGroup.add(mLegR);

  // Thân trên
  const mTorso = new THREE.Group();
  mTorso.position.set(0, 0.52, 0);

  const mBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.56, 12), matRobe);
  mBody.position.set(0, 0.28, 0);
  mBody.castShadow = true;
  mTorso.add(mBody);

  const mCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.27, 0.14, 12), matCollar);
  mCollar.position.set(0, 0.48, 0);
  mTorso.add(mCollar);

  // Đôi tay chắp trước ngực lần tràng hạt bồ đề
  const mArmR = new THREE.Group();
  mArmR.position.set(0.24, 0.42, 0.02);
  const mSleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.32, 8), matRobe);
  mSleeveR.position.set(-0.08, -0.08, 0.16);
  mSleeveR.rotation.x = -0.95;
  mSleeveR.rotation.y = -0.45;
  mArmR.add(mSleeveR);
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), matSkin);
  rHand.position.set(-0.16, -0.16, 0.26);
  mArmR.add(rHand);
  mTorso.add(mArmR);

  const mArmL = new THREE.Group();
  mArmL.position.set(-0.24, 0.42, 0.02);
  const mSleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.32, 8), matRobe);
  mSleeveL.position.set(0.08, -0.08, 0.16);
  mSleeveL.rotation.x = -0.95;
  mSleeveL.rotation.y = 0.45;
  mArmL.add(mSleeveL);
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), matSkin);
  lHand.position.set(0.16, -0.16, 0.26);
  mArmL.add(lHand);
  mTorso.add(mArmL);

  // Chuỗi hạt bồ đề 108 hạt cầm trước ngực
  const beadsGroup = new THREE.Group();
  beadsGroup.position.set(0, 0.28, 0.28);
  for (let b = 0; b < 16; b++) {
    const bAng = (b / 16) * Math.PI * 2;
    const beadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), matAmberWood);
    beadMesh.position.set(Math.cos(bAng) * 0.10, Math.sin(bAng) * 0.12, 0);
    beadsGroup.add(beadMesh);
  }
  mTorso.add(beadsGroup);

  // Đầu khẽ cúi chánh niệm
  const mHead = new THREE.Group();
  mHead.position.set(0, 0.56, 0);
  const faceTex = getSharedTexture('tuetinh_face', createTueTinhFaceTexture);
  const mFaceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.5 });
  const mHeadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 20), mFaceMat);
  mHeadMesh.rotation.y = -Math.PI / 2;
  mHeadMesh.castShadow = true;
  mHead.add(mHeadMesh);

  for (const ex of [-0.27, 0.27]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), matSkin);
    ear.scale.set(0.5, 1.0, 0.7);
    ear.position.set(ex, 0, -0.02);
    mHead.add(ear);
  }
  mTorso.add(mHead);
  monkGroup.add(mTorso);

  return {
    group: monkGroup,
    torso: mTorso,
    head: mHead,
    armR: mArmR,
    armL: mArmL,
    legL: mLegL,
    legR: mLegR,
    beads: beadsGroup,
  };
}
