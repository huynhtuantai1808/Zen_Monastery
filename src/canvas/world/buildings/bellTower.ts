import React from 'react';
import * as THREE from 'three';
import { createJadeCurvedRoof } from './environmentProps';
import { createTueTinhFaceTexture, getSharedTexture } from '../textures';

export function createAuthenticBellTower(
  matStoneGrey: THREE.Material,
  matLotusPlinth: THREE.Material,
  matWoodLim: THREE.Material,
  matDarkTimber: THREE.Material,
  matAmberWood: THREE.Material,
  matJadeRoofTile: THREE.Material,
  matBronze: THREE.Material,
  matGold: THREE.Material,
  nightLightsRef: React.MutableRefObject<THREE.PointLight[]>
): {
  group: THREE.Group;
  bellMesh: THREE.Mesh;
  chayGo: THREE.Group;
  npcMonk: {
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
  };
  soundRipplesGroup: THREE.Group;
  impactFlash: THREE.Mesh;
  roofs: THREE.Group[];
} {
  const bellTower = new THREE.Group();
  const roofs: THREE.Group[] = [];

  // 1. BỆ ĐÁ TAM CẤP (THREE-TIER CARVED STONE PEDESTAL)
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.35, 11.4), matStoneGrey);
  base1.position.set(0, 0.175, 0);
  base1.receiveShadow = true;
  bellTower.add(base1);

  const base2 = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.30, 10.6), matStoneGrey);
  base2.position.set(0, 0.48, 0);
  base2.receiveShadow = true;
  bellTower.add(base2);

  const base3 = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.28, 9.8), matStoneGrey);
  base3.position.set(0, 0.75, 0);
  base3.receiveShadow = true;
  bellTower.add(base3);

  const stoneTrim = new THREE.Mesh(new THREE.BoxGeometry(9.9, 0.04, 9.9), matLotusPlinth);
  stoneTrim.position.set(0, 0.89, 0);
  stoneTrim.receiveShadow = true;
  bellTower.add(stoneTrim);

  // Bậc tam cấp đá mặt trước
  for (let s = 0; s < 5; s++) {
    const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.16, 0.38), matStoneGrey);
    stepMesh.position.set(0, 0.16 + s * 0.15, 5.0 + (4 - s) * 0.34);
    stepMesh.receiveShadow = true;
    bellTower.add(stepMesh);
  }

  // Hai bên lan can bậc đá chạm mây
  for (const sx of [-2.05, 2.05]) {
    const rampGroup = new THREE.Group();
    rampGroup.position.set(sx, 0, 5.6);
    for (let r = 0; r < 5; r++) {
      const rBlock = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.38), matLotusPlinth);
      rBlock.position.set(0, 0.28 + r * 0.15, (2 - r) * 0.34);
      rampGroup.add(rBlock);
    }
    const cloudScroll = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.08, 6, 12, Math.PI * 1.2), matLotusPlinth);
    cloudScroll.position.set(0, 0.26, 1.2);
    cloudScroll.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    rampGroup.add(cloudScroll);
    bellTower.add(rampGroup);
  }

  // 2. LAN CAN ĐÁ TỨ DIỆN
  const railingGroup = new THREE.Group();
  const railH = 0.82;
  const railY = 0.89 + railH / 2;

  const railNorth = new THREE.Mesh(new THREE.BoxGeometry(9.4, railH, 0.22), matStoneGrey);
  railNorth.position.set(0, railY, -4.7);
  railingGroup.add(railNorth);

  const railWest = new THREE.Mesh(new THREE.BoxGeometry(0.22, railH, 9.4), matStoneGrey);
  railWest.position.set(-4.7, railY, 0);
  railingGroup.add(railWest);

  const railEast = new THREE.Mesh(new THREE.BoxGeometry(0.22, railH, 9.4), matStoneGrey);
  railEast.position.set(4.7, railY, 0);
  railingGroup.add(railEast);

  const railSouthL = new THREE.Mesh(new THREE.BoxGeometry(2.6, railH, 0.22), matStoneGrey);
  railSouthL.position.set(-3.4, railY, 4.7);
  railingGroup.add(railSouthL);

  const railSouthR = new THREE.Mesh(new THREE.BoxGeometry(2.6, railH, 0.22), matStoneGrey);
  railSouthR.position.set(3.4, railY, 4.7);
  railingGroup.add(railSouthR);

  const postCoords = [
    [-4.7, -4.7], [0, -4.7], [4.7, -4.7],
    [-4.7, 0], [4.7, 0],
    [-4.7, 4.7], [-2.1, 4.7], [2.1, 4.7], [4.7, 4.7]
  ];
  postCoords.forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, railH + 0.15, 0.32), matLotusPlinth);
    post.position.set(px, railY + 0.08, pz);
    railingGroup.add(post);

    const bud = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 6), matLotusPlinth);
    bud.position.set(px, railY + 0.65, pz);
    railingGroup.add(bud);
  });
  bellTower.add(railingGroup);

  // 3. 4 CỘT CÁI GỖ LIM & CHÂN TẢNG ĐÁ HOA SEN
  const colCoords = [
    [-2.6, -2.6],
    [-2.6, 2.6],
    [2.6, -2.6],
    [2.6, 2.6],
  ];
  const colH = 4.4;
  const colY = 1.15 + colH / 2;

  colCoords.forEach(([cx, cz]) => {
    const plinthBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.22, 16), matLotusPlinth);
    plinthBase.position.set(cx, 1.0, cz);
    plinthBase.receiveShadow = true;
    bellTower.add(plinthBase);

    for (let p = 0; p < 8; p++) {
      const angle = (p * Math.PI) / 4;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.18, 5), matLotusPlinth);
      petal.rotation.x = Math.PI / 2;
      petal.rotation.z = angle;
      petal.position.set(cx + Math.cos(angle) * 0.52, 1.05, cz + Math.sin(angle) * 0.52);
      bellTower.add(petal);
    }

    const colMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.46, colH, 16), matWoodLim);
    colMesh.position.set(cx, colY, cz);
    colMesh.castShadow = true;
    colMesh.receiveShadow = true;
    bellTower.add(colMesh);

    const corbel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.65), matDarkTimber);
    corbel.position.set(cx, colY + colH / 2 - 0.15, cz);
    bellTower.add(corbel);
  });

  // 4. HỆ XÀ GỖ KẾT NỐI (TIE-BEAMS & BRACKET CORBELS)
  const beamLowFB = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.20, 0.28), matDarkTimber);
  beamLowFB.position.set(0, 3.65, -2.6);
  bellTower.add(beamLowFB);
  const beamLowFB2 = beamLowFB.clone();
  beamLowFB2.position.set(0, 3.65, 2.6);
  bellTower.add(beamLowFB2);

  const beamLowLR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.20, 5.4), matDarkTimber);
  beamLowLR.position.set(-2.6, 3.65, 0);
  bellTower.add(beamLowLR);
  const beamLowLR2 = beamLowLR.clone();
  beamLowLR2.position.set(2.6, 3.65, 0);
  bellTower.add(beamLowLR2);

  const beamUpFB = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.28, 0.34), matDarkTimber);
  beamUpFB.position.set(0, 5.45, -2.6);
  bellTower.add(beamUpFB);
  const beamUpFB2 = beamUpFB.clone();
  beamUpFB2.position.set(0, 5.45, 2.6);
  bellTower.add(beamUpFB2);

  const beamUpLR = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 5.6), matDarkTimber);
  beamUpLR.position.set(-2.6, 5.45, 0);
  bellTower.add(beamUpLR);
  const beamUpLR2 = beamUpLR.clone();
  beamUpLR2.position.set(2.6, 5.45, 0);
  bellTower.add(beamUpLR2);

  const centerBellBeam = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.42, 0.45), matDarkTimber);
  centerBellBeam.position.set(0, 5.35, 0);
  bellTower.add(centerBellBeam);

  // 5. TẦNG MÁI HẠ (4 ĐẦU ĐAO CONG VÚT)
  const lowerRoof = createJadeCurvedRoof(11.6, 11.6, 2.3, matJadeRoofTile, matGold);
  lowerRoof.position.set(0, 5.5, 0);
  roofs.push(lowerRoof);
  bellTower.add(lowerRoof);

  // 6. CỔ BỒNG THƯỢNG (CLERESTORY WITH BALUSTERS)
  const clerestoryGroup = new THREE.Group();
  clerestoryGroup.position.set(0, 6.2, 0);

  for (const [cx, cz] of [[-2.1, -2.1], [-2.1, 2.1], [2.1, -2.1], [2.1, 2.1]]) {
    const col2 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 1.4, 12), matDarkTimber);
    col2.position.set(cx, 0.7, cz);
    clerestoryGroup.add(col2);
  }

  const clFloor = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.16, 5.4), matDarkTimber);
  clFloor.position.set(0, 0.08, 0);
  clerestoryGroup.add(clFloor);

  const clCeil = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.18, 5.4), matDarkTimber);
  clCeil.position.set(0, 1.35, 0);
  clerestoryGroup.add(clCeil);

  for (let s = -5; s <= 5; s++) {
    const pos = s * 0.36;
    if (Math.abs(s) > 4) continue;
    const bN = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), matAmberWood);
    bN.position.set(pos, 0.7, -2.1);
    clerestoryGroup.add(bN);

    const bS = bN.clone();
    bS.position.set(pos, 0.7, 2.1);
    clerestoryGroup.add(bS);

    const bW = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), matAmberWood);
    bW.position.set(-2.1, 0.7, pos);
    clerestoryGroup.add(bW);

    const bE = bW.clone();
    bE.position.set(2.1, 0.7, pos);
    clerestoryGroup.add(bE);
  }

  const bellLight = new THREE.PointLight(0xfef08a, 1.4, 16);
  bellLight.position.set(0, 0.7, 0);
  nightLightsRef.current.push(bellLight);
  clerestoryGroup.add(bellLight);
  bellTower.add(clerestoryGroup);

  // 7. TẦNG MÁI THƯỢNG & ĐỈNH THÁP BÚP SEN
  const upperRoof = createJadeCurvedRoof(8.6, 8.6, 2.2, matJadeRoofTile, matGold);
  upperRoof.position.set(0, 7.6, 0);
  roofs.push(upperRoof);
  bellTower.add(upperRoof);

  const spireGroup = new THREE.Group();
  spireGroup.position.set(0, 9.8, 0);

  const spirePlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.1, 0.32, 12), matLotusPlinth);
  spireGroup.add(spirePlinth);

  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75 - r * 0.16, 0.08, 6, 16), matGold);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.28 + r * 0.24, 0);
    spireGroup.add(ring);
  }

  const gourdBase = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), matGold);
  gourdBase.position.set(0, 1.15, 0);
  spireGroup.add(gourdBase);

  const gourdTop = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), matGold);
  gourdTop.position.set(0, 1.7, 0);
  spireGroup.add(gourdTop);

  const spireApex = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 8), matGold);
  spireApex.position.set(0, 2.15, 0);
  spireGroup.add(spireApex);
  bellTower.add(spireGroup);

  // 8. ĐẠI HỒNG CHUNG BẰNG ĐỒNG (TREO BẰNG DÂY XÍCH TỪ XÀ THƯỢNG)
  const bellGroup = new THREE.Group();
  bellGroup.position.set(0, 3.85, 0);

  const dragonArch = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.12, 8, 16, Math.PI), matBronze);
  dragonArch.position.set(0, 0.38, 0);
  bellGroup.add(dragonArch);

  // Xích sắt dài nối từ quai rồng lên xà cái trung tâm (y = 5.35)
  for (let cl = 0; cl < 4; cl++) {
    const chainLink = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 12), matDarkTimber);
    chainLink.position.set(0, 0.62 + cl * 0.24, 0);
    if (cl % 2 === 1) chainLink.rotation.y = Math.PI / 2;
    bellGroup.add(chainLink);
  }

  const bellDome = new THREE.Mesh(new THREE.SphereGeometry(0.92, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), matBronze);
  bellDome.position.set(0, 0, 0);
  bellDome.castShadow = true;
  bellGroup.add(bellDome);

  const bellUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.28, 1.25, 24), matBronze);
  bellUpper.position.set(0, -0.625, 0);
  bellUpper.castShadow = true;
  bellGroup.add(bellUpper);

  const bellLower = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.68, 1.15, 24), matBronze);
  bellLower.position.set(0, -1.825, 0);
  bellLower.castShadow = true;
  bellGroup.add(bellLower);

  const bellSkirt = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.95, 0.35, 24), matBronze);
  bellSkirt.position.set(0, -2.575, 0);
  bellSkirt.castShadow = true;
  bellGroup.add(bellSkirt);

  for (const ry of [-0.3, -1.25, -2.4]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.3 + Math.abs(ry) * 0.22, 0.04, 6, 24), matGold);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, ry, 0);
    bellGroup.add(rim);
  }

  for (let b = 0; b < 4; b++) {
    const bAngle = (b * Math.PI) / 2;
    const boss = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), matGold);
    boss.scale.set(1.4, 1.0, 1.0);
    boss.rotation.y = -bAngle;
    boss.position.set(Math.cos(bAngle) * 1.45, -1.55, Math.sin(bAngle) * 1.45);
    bellGroup.add(boss);

    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.06), matDarkTimber);
    plaque.position.set(Math.cos(bAngle + Math.PI / 4) * 1.18, -0.75, Math.sin(bAngle + Math.PI / 4) * 1.18);
    plaque.rotation.y = -(bAngle + Math.PI / 4) + Math.PI / 2;
    bellGroup.add(plaque);
  }
  bellTower.add(bellGroup);

  // 9. CHÀY GỖ TREO DÂY (SUSPENDED MALLET - VỪA TẦM VỚI CHÚ TIỂU)
  const chayPivot = new THREE.Group();
  chayPivot.position.set(2.35, 5.35, 0);

  // 2 dây treo dài 3.05m nối xuống độ cao y = 2.30m (ngang tầm ngực Chú Tiểu)
  const rope1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 3.05, 8), matDarkTimber);
  rope1.position.set(-0.65, -1.525, 0);
  chayPivot.add(rope1);

  const rope2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 3.05, 8), matDarkTimber);
  rope2.position.set(0.65, -1.525, 0);
  chayPivot.add(rope2);

  const chayLog = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.2, 16), matAmberWood);
  chayLog.rotation.z = Math.PI / 2;
  chayLog.position.set(0, -3.05, 0);
  chayLog.castShadow = true;
  chayPivot.add(chayLog);

  const chayHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), matAmberWood);
  chayHead.position.set(-1.05, -3.05, 0);
  chayPivot.add(chayHead);

  for (const dx of [-0.85, 0.85]) {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.035, 8, 16), matBronze);
    collar.rotation.y = Math.PI / 2;
    collar.position.set(dx, -3.05, 0);
    chayPivot.add(collar);
  }

  const gripRope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), matDarkTimber);
  gripRope.position.set(-0.15, -3.35, 0.25);
  chayPivot.add(gripRope);
  bellTower.add(chayPivot);

  // Điểm tóe sáng va chạm khi gõ chuông (Impact Spark Flash)
  const impactFlash = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0 })
  );
  impactFlash.position.set(1.35, 2.30, 0);
  bellTower.add(impactFlash);

  // 10. NPC CHÚ TIỂU TUỆ TĨNH THỈNH CHUÔNG (CHIBI BUDDHIST NOVICE MONK)
  // Đặt vững chãi trên sàn bệ đá thượng (y = 0.92, cao hơn mặt stoneTrim y = 0.91 để không bị chìm)
  const npcGroup = new THREE.Group();
  npcGroup.position.set(2.15, 0.92, 0.65);
  npcGroup.rotation.y = -2.45;

  const matPants = new THREE.MeshStandardMaterial({ color: 0x6d3917, roughness: 0.8 });
  const matShoe = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

  // Đôi chân Chú Tiểu đứng thẳng vững vàng trên sàn
  for (const lx of [-0.14, 0.14]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.44, 10), matPants);
    leg.position.set(lx, 0.22, 0);
    npcGroup.add(leg);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.24), matShoe);
    shoe.position.set(lx, 0.04, 0.04);
    npcGroup.add(shoe);
  }

  // Thân trên bắt đầu từ độ cao 0.46m (trên đùi và hông)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.46, 0);

  const matRobe = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
  const matRobeCollar = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });

  const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.48, 0.30), matRobe);
  bodyMesh.position.set(0, 0.24, 0);
  bodyMesh.castShadow = true;
  torsoGroup.add(bodyMesh);

  // Vạt áo tràng nâu sồng buông rủ ngang đùi, không chạm sàn
  const skirtMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.36, 12), matRobe);
  skirtMesh.position.set(0, 0.06, 0);
  torsoGroup.add(skirtMesh);

  const collarCross = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.30), matRobeCollar);
  collarCross.position.set(0.04, 0.43, 0.01);
  collarCross.rotation.z = -0.35;
  torsoGroup.add(collarCross);

  for (let i = 0; i < 16; i++) {
    const bAngle = (i / 16) * Math.PI * 2;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), matAmberWood);
    bead.position.set(Math.cos(bAngle) * 0.16, 0.38 + Math.sin(bAngle) * 0.06, Math.sin(bAngle) * 0.13 + 0.04);
    torsoGroup.add(bead);
  }

  const armR = new THREE.Group();
  armR.position.set(0.23, 0.40, 0);

  const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.30, 10), matRobe);
  rSleeve.rotation.z = -Math.PI / 3;
  rSleeve.position.set(0.13, -0.06, 0.08);
  armR.add(rSleeve);

  const matSkin = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.5 });
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), matSkin);
  rHand.position.set(0.26, -0.12, 0.18);
  armR.add(rHand);
  torsoGroup.add(armR);

  const armL = new THREE.Group();
  armL.position.set(-0.23, 0.40, 0);

  const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.28, 10), matRobe);
  lSleeve.rotation.z = Math.PI / 4;
  lSleeve.position.set(-0.11, -0.06, 0.08);
  armL.add(lSleeve);

  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), matSkin);
  lHand.position.set(-0.17, 0.04, 0.16);
  armL.add(lHand);
  torsoGroup.add(armL);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.54, 0);

  const headGeo = new THREE.SphereGeometry(0.27, 24, 20);
  const faceTex = getSharedTexture('tuetinh_face', createTueTinhFaceTexture);
  const matFace = new THREE.MeshStandardMaterial({
    map: faceTex,
    roughness: 0.5,
  });
  const headMesh = new THREE.Mesh(headGeo, matFace);
  headMesh.rotation.y = -Math.PI / 2;
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  for (const ex of [-0.27, 0.27]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), matSkin);
    ear.scale.set(0.5, 1.0, 0.7);
    ear.position.set(ex, 0, -0.02);
    headGroup.add(ear);
  }

  torsoGroup.add(headGroup);
  npcGroup.add(torsoGroup);
  bellTower.add(npcGroup);

  // 11. TRỐNG BÁT NHÃ CỔ TRUYỀN
  const drumGroup = new THREE.Group();
  drumGroup.position.set(-2.8, 1.65, -2.2);

  for (const dx of [-0.65, 0.65]) {
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 1.5, 8), matDarkTimber);
    leg1.rotation.z = dx > 0 ? 0.25 : -0.25;
    leg1.position.set(dx, -0.4, 0);
    drumGroup.add(leg1);
  }
  const drumCross = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.14), matDarkTimber);
  drumCross.position.set(0, -0.75, 0);
  drumGroup.add(drumCross);

  const drumBody = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.45, 18), matWoodLim);
  drumBody.rotateX(Math.PI / 2);
  drumBody.castShadow = true;
  drumGroup.add(drumBody);

  const matDrumHead = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.85 });
  for (const dz of [-0.73, 0.73]) {
    const dHead = new THREE.Mesh(new THREE.CircleGeometry(0.94, 18), matDrumHead);
    if (dz < 0) dHead.rotateY(Math.PI);
    dHead.position.set(0, 0, dz);
    drumGroup.add(dHead);

    const rimRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 6, 24), matBronze);
    rimRing.position.set(0, 0, dz);
    drumGroup.add(rimRing);
  }
  bellTower.add(drumGroup);

  // 12. CỤM SÓNG ÂM KIM QUANG (CONCENTRIC GOLDEN RIPPLES)
  const soundRipplesGroup = new THREE.Group();
  soundRipplesGroup.position.set(0, 2.30, 0);
  soundRipplesGroup.visible = false;

  for (let i = 0; i < 4; i++) {
    const ringGeo = new THREE.RingGeometry(1.6, 1.75, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotateX(Math.PI / 2);
    soundRipplesGroup.add(ring);
  }
  bellTower.add(soundRipplesGroup);

  return {
    group: bellTower,
    bellMesh: bellGroup as unknown as THREE.Mesh,
    chayGo: chayPivot,
    npcMonk: {
      group: npcGroup,
      torso: torsoGroup,
      head: headGroup,
      armR,
      armL,
    },
    soundRipplesGroup,
    impactFlash,
    roofs,
  };
}
