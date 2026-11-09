import React from 'react';
import * as THREE from 'three';

export interface GuanyinShrineMaterials {
  matWhiteJade?: THREE.Material;
  matGold?: THREE.Material;
  matStoneGrey?: THREE.Material;
  matTileBrick?: THREE.Material;
  matBronze?: THREE.Material;
  matLotusPlinth?: THREE.Material;
  matWoodLim?: THREE.Material;
}

export interface GuanyinShrineReturnData {
  group: THREE.Group;
  waterStreamMesh: THREE.Mesh;
  waterParticles: THREE.Points;
  incenseSmoke: THREE.Points;
  altarPosition: THREE.Vector3;
  cushionPositions: THREE.Vector3[];
  incenseAttendantPos: THREE.Vector3;
  caretakerPos: THREE.Vector3;
  haloLight: THREE.PointLight;
  update: (delta: number, stepCount: number) => void;
  dispose: () => void;
}

/**
 * Procedural Factory: Tôn tạo Quần thể Quán Âm Đại Điện & Tôn Tượng Bạch Ngọc Chiêm Bái
 * Tọa độ trung tâm: X = 33.0, Z = 42.0 (Cánh Đông khuôn viên sơn tự)
 * Tổng chiều cao tôn tượng và đài sen: ~11.6m
 */
export function createGuanyinShrineEnsemble(
  materials: GuanyinShrineMaterials,
  nightLightsRef?: React.MutableRefObject<THREE.PointLight[]>
): GuanyinShrineReturnData {
  const shrineGroup = new THREE.Group();
  shrineGroup.name = 'GuanyinShrineComplex';
  shrineGroup.position.set(33.0, 0, 42.0);

  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  // =========================================================================
  // 1. VẬT LIỆU CHẾ TÁC BẠCH NGỌC, ĐỒNG TAM BẢO, VÀNG KIM & CẨM THẠCH
  // =========================================================================
  const matWhiteJade = materials.matWhiteJade ?? new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.18,
    metalness: 0.04,
  });
  disposables.push(matWhiteJade);

  const matJadePolished = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.12,
    metalness: 0.08,
  });
  disposables.push(matJadePolished);

  const matGoldHalo = materials.matGold ?? new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfde047,
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.88,
  });

  const matMarblePlaza = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.38,
    metalness: 0.06,
  });
  disposables.push(matMarblePlaza);

  const matBalustrade = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.45,
    metalness: 0.05,
  });
  disposables.push(matBalustrade);

  const matLotusPedalPink = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    roughness: 0.35,
    metalness: 0.05,
  });
  disposables.push(matLotusPedalPink);

  const matLotusPedalWhite = new THREE.MeshStandardMaterial({
    color: 0xfff1f2,
    roughness: 0.25,
    metalness: 0.02,
  });
  disposables.push(matLotusPedalWhite);

  const matWaterSurface = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.88,
  });
  disposables.push(matWaterSurface);

  const matWaterStream = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.05,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
  });
  disposables.push(matWaterStream);

  const matBronzeBurner = materials.matBronze ?? new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.35,
    metalness: 0.75,
  });

  const matRockery = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.92,
  });
  disposables.push(matRockery);

  const matWillowGreen = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.5,
  });
  disposables.push(matWillowGreen);

  const matLotusPad = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.65,
    side: THREE.DoubleSide,
  });
  disposables.push(matLotusPad);

  const matCushion = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.6,
  });
  disposables.push(matCushion);

  // =========================================================================
  // 2. ĐẠI SẢNH QUẢNG TRƯỜNG HÀNH HƯƠNG (26m x 26m) TÔN CAO Y = 0.58m
  // =========================================================================
  const plazaGeo = new THREE.BoxGeometry(26.0, 0.45, 26.0);
  disposables.push(plazaGeo);
  const plazaMesh = new THREE.Mesh(plazaGeo, matMarblePlaza);
  plazaMesh.position.set(0, 0.58 - 0.225, 0); // Đỉnh sàn ở Y = 0.58m
  plazaMesh.receiveShadow = true;
  shrineGroup.add(plazaMesh);

  // Bậc tam cấp đón khách ở phía Tây (hướng sân chính nhìn sang, X = -13.0m, Z = 0)
  for (let step = 0; step < 3; step++) {
    const stepW = 7.0;
    const stepDepth = 0.55;
    const stepHeight = 0.053;
    const stepGeo = new THREE.BoxGeometry(stepDepth, stepHeight, stepW);
    disposables.push(stepGeo);
    const stepMesh = new THREE.Mesh(stepGeo, matMarblePlaza);
    // Bậc tam cấp tiến dần từ sân X = -13.0 - (3 - step)*0.55
    stepMesh.position.set(-13.0 - (2 - step) * stepDepth - stepDepth * 0.5, 0.42 + step * stepHeight + stepHeight * 0.5, 0);
    stepMesh.receiveShadow = true;
    shrineGroup.add(stepMesh);
  }

  // Lan can đá cẩm thạch trắng chạm mây bao quanh 4 cạnh sảnh
  const balustradeHeight = 0.75;
  const postWidth = 0.28;
  const railGeoX = new THREE.BoxGeometry(26.0, 0.16, 0.22);
  const railGeoZ = new THREE.BoxGeometry(0.22, 0.16, 26.0);
  const railGeoW_Half = new THREE.BoxGeometry(0.22, 0.16, 9.5);
  disposables.push(railGeoX, railGeoZ, railGeoW_Half);

  // Lan can phía Bắc (Z = -13.0)
  const railN = new THREE.Mesh(railGeoX, matBalustrade);
  railN.position.set(0, 0.58 + balustradeHeight * 0.8, -12.9);
  shrineGroup.add(railN);

  // Lan can phía Nam (Z = +13.0)
  const railS = new THREE.Mesh(railGeoX, matBalustrade);
  railS.position.set(0, 0.58 + balustradeHeight * 0.8, 12.9);
  shrineGroup.add(railS);

  // Lan can phía Đông (X = +13.0)
  const railE = new THREE.Mesh(railGeoZ, matBalustrade);
  railE.position.set(12.9, 0.58 + balustradeHeight * 0.8, 0);
  shrineGroup.add(railE);

  // Lan can phía Tây (X = -13.0, mở cổng 7m ở giữa Z in [-3.5, 3.5])
  const railW_North = new THREE.Mesh(railGeoW_Half, matBalustrade);
  railW_North.position.set(-12.9, 0.58 + balustradeHeight * 0.8, -8.2);
  shrineGroup.add(railW_North);

  const railW_South = new THREE.Mesh(railGeoW_Half, matBalustrade);
  railW_South.position.set(-12.9, 0.58 + balustradeHeight * 0.8, 8.2);
  shrineGroup.add(railW_South);

  // Các trụ búp sen đá đầu hồi lan can
  const pillarGeo = new THREE.BoxGeometry(postWidth, balustradeHeight, postWidth);
  const lotusBudGeo = new THREE.SphereGeometry(postWidth * 0.65, 8, 8);
  disposables.push(pillarGeo, lotusBudGeo);

  const postPositions: [number, number][] = [
    [-12.9, -12.9], [12.9, -12.9], [-12.9, 12.9], [12.9, 12.9],
    [-12.9, -3.5], [-12.9, 3.5], // Trụ cổng phía Tây
    [0, -12.9], [0, 12.9], [12.9, 0],
    [-6.5, -12.9], [6.5, -12.9], [-6.5, 12.9], [6.5, 12.9],
    [12.9, -6.5], [12.9, 6.5],
  ];

  postPositions.forEach(([px, pz]) => {
    const post = new THREE.Mesh(pillarGeo, matBalustrade);
    post.position.set(px, 0.58 + balustradeHeight * 0.5, pz);
    shrineGroup.add(post);

    const bud = new THREE.Mesh(lotusBudGeo, matLotusPedalWhite);
    bud.position.set(px, 0.58 + balustradeHeight + 0.12, pz);
    bud.scale.set(1, 1.4, 1);
    shrineGroup.add(bud);
  });

  // =========================================================================
  // 3. HỒ SEN BẠCH NGỌC NON BỘ (Tâm tại X = 0, Z = 2.5 tương đối với shrineGroup)
  // (Tọa độ thế giới: X = 33.0, Z = 44.5)
  // =========================================================================
  const poolCenterZ = 2.5;
  const poolRadius = 4.4;

  // Bờ kè đá non bộ bao quanh hồ tròn
  const poolSegments = 24;
  for (let i = 0; i < poolSegments; i++) {
    const angle = (i / poolSegments) * Math.PI * 2;
    const rockW = 1.35 + (i % 3) * 0.25;
    const rockH = 0.55 + (i % 2) * 0.2;
    const rockGeo = new THREE.DodecahedronGeometry(rockW * 0.5, 1);
    disposables.push(rockGeo);
    const rock = new THREE.Mesh(rockGeo, matRockery);
    rock.position.set(
      Math.cos(angle) * (poolRadius + 0.35),
      0.58 + rockH * 0.45,
      poolCenterZ + Math.sin(angle) * (poolRadius + 0.35)
    );
    rock.scale.set(1.1, 0.7, 0.9);
    rock.rotation.set((i * 1.3) % 1, (i * 0.7) % 2, (i * 2.1) % 1);
    shrineGroup.add(rock);
  }

  // Mặt nước hồ sen trong suốt
  const poolWaterGeo = new THREE.CylinderGeometry(poolRadius, poolRadius, 0.15, 32);
  disposables.push(poolWaterGeo);
  const poolWater = new THREE.Mesh(poolWaterGeo, matWaterSurface);
  poolWater.position.set(0, 0.58 + 0.08, poolCenterZ);
  shrineGroup.add(poolWater);

  // Điểm xuyết lá sen và hoa sen hồng nở trên mặt hồ
  for (let l = 0; l < 16; l++) {
    const lAngle = (l / 16) * Math.PI * 2 + 0.2;
    const lDist = 2.7 + (l % 4) * 0.4;
    const lx = Math.cos(lAngle) * lDist;
    const lz = poolCenterZ + Math.sin(lAngle) * lDist;

    // Lá sen tròn
    const leafGeo = new THREE.CircleGeometry(0.38 + (l % 3) * 0.08, 12);
    disposables.push(leafGeo);
    const leaf = new THREE.Mesh(leafGeo, matLotusPad);
    leaf.rotation.x = -Math.PI / 2;
    leaf.position.set(lx, 0.58 + 0.17, lz);
    shrineGroup.add(leaf);

    // Một số hoa sen hồng nở
    if (l % 3 === 0) {
      const flowerGroup = new THREE.Group();
      flowerGroup.position.set(lx + 0.15, 0.58 + 0.22, lz + 0.15);
      for (let p = 0; p < 8; p++) {
        const pAng = (p / 8) * Math.PI * 2;
        const petalGeo = new THREE.ConeGeometry(0.08, 0.22, 4);
        disposables.push(petalGeo);
        const petal = new THREE.Mesh(petalGeo, matLotusPedalPink);
        petal.position.set(Math.cos(pAng) * 0.09, 0.08, Math.sin(pAng) * 0.09);
        petal.rotation.x = 0.35 * Math.sin(pAng);
        petal.rotation.z = -0.35 * Math.cos(pAng);
        flowerGroup.add(petal);
      }
      shrineGroup.add(flowerGroup);
    }
  }

  // =========================================================================
  // 4. ĐÀI SEN NGŨ CẤP (5-TIERED LOTUS PEDESTAL) TÂM TẠI (0, poolCenterZ)
  // Tổng chiều cao đài sen: 2.3m
  // =========================================================================
  const pedestalBaseY = 0.58;
  const lotusBaseRadius = 2.4;
  const lotusTiers = 5;

  for (let t = 0; t < lotusTiers; t++) {
    const tierFrac = t / (lotusTiers - 1);
    const tierR = lotusBaseRadius * (1.0 - tierFrac * 0.26);
    const tierY = pedestalBaseY + t * 0.44 + 0.22;

    // Khối bệ tròn của tầng
    const plinthGeo = new THREE.CylinderGeometry(tierR * 0.96, tierR, 0.44, 28);
    disposables.push(plinthGeo);
    const plinth = new THREE.Mesh(plinthGeo, matJadePolished);
    plinth.position.set(0, tierY, poolCenterZ);
    plinth.receiveShadow = true;
    shrineGroup.add(plinth);

    // Cánh hoa sen bao quanh mép mỗi tầng (16 cánh)
    const petalCount = 16;
    for (let p = 0; p < petalCount; p++) {
      const pAngle = (p / petalCount) * Math.PI * 2 + (t % 2 === 0 ? 0 : Math.PI / petalCount);
      const petalGeo = new THREE.ConeGeometry(tierR * 0.16, 0.52, 5);
      disposables.push(petalGeo);
      const petal = new THREE.Mesh(petalGeo, t === lotusTiers - 1 ? matLotusPedalPink : matLotusPedalWhite);
      const px = Math.cos(pAngle) * (tierR + 0.04);
      const pz = poolCenterZ + Math.sin(pAngle) * (tierR + 0.04);
      petal.position.set(px, tierY + 0.06, pz);
      petal.rotation.y = -pAngle;
      petal.rotation.x = -0.42; // Cánh sen uốn nở ra ngoài
      shrineGroup.add(petal);
    }
  }

  // Tầng sen nở trên cùng nơi tôn tượng ngự
  const topPadY = pedestalBaseY + lotusTiers * 0.44; // ~ 2.78m
  const topPadGeo = new THREE.CylinderGeometry(1.65, 1.75, 0.28, 32);
  disposables.push(topPadGeo);
  const topPad = new THREE.Mesh(topPadGeo, matLotusPedalWhite);
  topPad.position.set(0, topPadY, poolCenterZ);
  shrineGroup.add(topPad);

  // Mây cát tường bao quanh chân đài sen
  for (let c = 0; c < 8; c++) {
    const cAng = (c / 8) * Math.PI * 2;
    const cloudGeo = new THREE.SphereGeometry(0.55 + (c % 2) * 0.15, 10, 8);
    disposables.push(cloudGeo);
    const cloud = new THREE.Mesh(cloudGeo, matJadePolished);
    cloud.position.set(Math.cos(cAng) * 2.15, topPadY - 0.15, poolCenterZ + Math.sin(cAng) * 2.15);
    cloud.scale.set(1.4, 0.65, 1.1);
    shrineGroup.add(cloud);
  }

  // =========================================================================
  // 5. TÔN TƯỢNG QUÁN THẾ ÂM BỒ TÁT BẠCH NGỌC (Cao ~9.0m, ngự trên đài sen)
  // Tổng độ cao đỉnh tượng: 2.78m + 9.0m = 11.78m
  // =========================================================================
  const statueGroup = new THREE.Group();
  statueGroup.position.set(0, topPadY + 0.14, poolCenterZ);

  // 5.1. Bàn chân & Chân ngự đài sen
  const footLGeo = new THREE.BoxGeometry(0.32, 0.18, 0.55);
  const footRGeo = new THREE.BoxGeometry(0.32, 0.18, 0.55);
  disposables.push(footLGeo, footRGeo);
  const footL = new THREE.Mesh(footLGeo, matWhiteJade);
  footL.position.set(-0.28, 0.09, 0.12);
  statueGroup.add(footL);

  const footR = new THREE.Mesh(footRGeo, matWhiteJade);
  footR.position.set(0.28, 0.09, 0.12);
  statueGroup.add(footR);

  // 5.2. Thân tượng hạ phần & Tà áo cà-sa bạch ngọc xếp nếp tha thướt (Robe skirt)
  // Hình trụ thon nở đáy hình chuông
  const skirtGeo = new THREE.CylinderGeometry(1.05, 1.55, 3.8, 28);
  disposables.push(skirtGeo);
  const skirt = new THREE.Mesh(skirtGeo, matWhiteJade);
  skirt.position.set(0, 1.9, 0);
  skirt.receiveShadow = true;
  skirt.castShadow = true;
  statueGroup.add(skirt);

  // Các dải nếp gấp tà áo rủ sóng lượn
  for (let f = 0; f < 10; f++) {
    const fAngle = (f / 10) * Math.PI - Math.PI / 2; // Phía trước thân
    const foldGeo = new THREE.CylinderGeometry(0.08, 0.14, 3.6, 6);
    disposables.push(foldGeo);
    const fold = new THREE.Mesh(foldGeo, matWhiteJade);
    fold.position.set(Math.cos(fAngle) * 1.35, 1.8, Math.sin(fAngle) * 1.35 * 0.7);
    fold.scale.set(0.6, 1.0, 1.4);
    statueGroup.add(fold);
  }

  // 5.3. Thắt lưng ngọc dải lụa cát tường (Sash)
  const sashGeo = new THREE.TorusGeometry(1.08, 0.12, 12, 28);
  disposables.push(sashGeo);
  const sash = new THREE.Mesh(sashGeo, matJadePolished);
  sash.position.set(0, 3.8, 0);
  sash.rotation.x = Math.PI / 2;
  statueGroup.add(sash);

  // 5.4. Thân trên & Áo choàng phiêu bồng (Torso & Shawl)
  const torsoGeo = new THREE.CylinderGeometry(0.85, 1.02, 2.2, 24);
  disposables.push(torsoGeo);
  const torso = new THREE.Mesh(torsoGeo, matWhiteJade);
  torso.position.set(0, 4.9, 0);
  torso.castShadow = true;
  statueGroup.add(torso);

  // Chuỗi ngọc anh lạc đeo trước ngực (Necklace & Garland)
  const necklaceGeo = new THREE.TorusGeometry(0.55, 0.05, 8, 20);
  disposables.push(necklaceGeo);
  const necklace = new THREE.Mesh(necklaceGeo, matGoldHalo);
  necklace.position.set(0, 5.5, 0.48);
  necklace.rotation.x = Math.PI * 0.35;
  statueGroup.add(necklace);

  // Áo choàng rủ hai bên vai mềm mại
  const capeLGeo = new THREE.CylinderGeometry(0.35, 0.65, 4.2, 12);
  disposables.push(capeLGeo);
  const capeL = new THREE.Mesh(capeLGeo, matWhiteJade);
  capeL.position.set(-1.15, 3.8, 0);
  capeL.rotation.z = 0.12;
  statueGroup.add(capeL);

  const capeRGeo = new THREE.CylinderGeometry(0.35, 0.65, 4.2, 12);
  disposables.push(capeRGeo);
  const capeR = new THREE.Mesh(capeRGeo, matWhiteJade);
  capeR.position.set(1.15, 3.8, 0);
  capeR.rotation.z = -0.12;
  statueGroup.add(capeR);

  // 5.5. Cổ và Khuôn Mặt Quán Thế Âm Từ Bi Phúc Hậu
  const neckGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.55, 16);
  disposables.push(neckGeo);
  const neck = new THREE.Mesh(neckGeo, matWhiteJade);
  neck.position.set(0, 6.15, 0);
  statueGroup.add(neck);

  const headGeo = new THREE.SphereGeometry(0.68, 24, 20);
  disposables.push(headGeo);
  const head = new THREE.Mesh(headGeo, matWhiteJade);
  head.position.set(0, 6.9, 0);
  head.scale.set(0.92, 1.15, 0.95);
  statueGroup.add(head);

  // Tóc búi cao (Ushnisha)
  const bunGeo = new THREE.SphereGeometry(0.42, 16, 14);
  disposables.push(bunGeo);
  const bun = new THREE.Mesh(bunGeo, matWhiteJade);
  bun.position.set(0, 7.75, -0.05);
  statueGroup.add(bun);

  // Vương Miện Phật chạm hình Đức Phật A Di Đà (Amitabha Crown)
  const crownGeo = new THREE.CylinderGeometry(0.62, 0.72, 0.75, 24, 1, true);
  disposables.push(crownGeo);
  const crown = new THREE.Mesh(crownGeo, matJadePolished);
  crown.position.set(0, 7.6, 0.05);
  statueGroup.add(crown);

  // Tượng Phật A Di Đà thu nhỏ trên đỉnh vương miện
  const buddhaIconGeo = new THREE.ConeGeometry(0.22, 0.52, 6);
  disposables.push(buddhaIconGeo);
  const buddhaIcon = new THREE.Mesh(buddhaIconGeo, matGoldHalo);
  buddhaIcon.position.set(0, 7.8, 0.62);
  buddhaIcon.rotation.x = -0.15;
  statueGroup.add(buddhaIcon);

  // Khăn trùm đầu buông xõa qua vai (Veil)
  const veilGeo = new THREE.CylinderGeometry(0.72, 1.25, 3.2, 18, 1, true, Math.PI * 0.4, Math.PI * 1.2);
  disposables.push(veilGeo);
  const veil = new THREE.Mesh(veilGeo, matWhiteJade);
  veil.position.set(0, 6.8, -0.25);
  veil.rotation.y = Math.PI;
  statueGroup.add(veil);

  // 5.6. Cánh Tay Phải: Bắt ấn Cát Tường ngang ngực, cầm cành dương liễu
  const armRGeo = new THREE.CylinderGeometry(0.18, 0.24, 1.4, 12);
  disposables.push(armRGeo);
  const armR = new THREE.Mesh(armRGeo, matWhiteJade);
  armR.position.set(0.78, 5.25, 0.32);
  armR.rotation.set(-0.65, 0.3, -0.55);
  statueGroup.add(armR);

  // Cẳng tay phải hướng lên trước ngực
  const forearmRGeo = new THREE.CylinderGeometry(0.15, 0.18, 1.2, 12);
  disposables.push(forearmRGeo);
  const forearmR = new THREE.Mesh(forearmRGeo, matWhiteJade);
  forearmR.position.set(0.55, 5.75, 0.65);
  forearmR.rotation.set(-1.35, 0.2, -0.2);
  statueGroup.add(forearmR);

  // Bàn tay phải ngọc
  const handRGeo = new THREE.SphereGeometry(0.16, 10, 8);
  disposables.push(handRGeo);
  const handR = new THREE.Mesh(handRGeo, matWhiteJade);
  handR.position.set(0.48, 6.25, 0.78);
  statueGroup.add(handR);

  // Cành dương liễu xanh biếc (Willow Branch)
  const willowGroup = new THREE.Group();
  willowGroup.position.set(0.48, 6.25, 0.78);
  const willowStemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.15, 0.45, 0.12),
    new THREE.Vector3(0.35, 0.85, 0.05),
    new THREE.Vector3(0.55, 1.15, -0.15),
    new THREE.Vector3(0.75, 1.35, -0.35),
  ]);
  const willowStemGeo = new THREE.TubeGeometry(willowStemCurve, 16, 0.035, 6, false);
  disposables.push(willowStemGeo);
  const willowStem = new THREE.Mesh(willowStemGeo, matWillowGreen);
  willowGroup.add(willowStem);

  // Các lá dương liễu rủ
  for (let w = 1; w <= 6; w++) {
    const t = w / 7;
    const pt = willowStemCurve.getPoint(t);
    const wLeafGeo = new THREE.ConeGeometry(0.045, 0.28, 4);
    disposables.push(wLeafGeo);
    const wLeaf = new THREE.Mesh(wLeafGeo, matWillowGreen);
    wLeaf.position.copy(pt);
    wLeaf.rotation.x = 0.5 + (w % 2) * 0.3;
    wLeaf.rotation.z = -0.4 - (w % 2) * 0.2;
    willowGroup.add(wLeaf);
  }
  statueGroup.add(willowGroup);

  // 5.7. Cánh Tay Trái & Tịnh Bình Cam Lộ (Left arm & Cam Lộ Nectar Vase)
  // Tay trái đưa ra phía trước dưới ngực, hơi nghiêng bình rót nước
  const armLGeo = new THREE.CylinderGeometry(0.18, 0.24, 1.5, 12);
  disposables.push(armLGeo);
  const armL = new THREE.Mesh(armLGeo, matWhiteJade);
  armL.position.set(-0.75, 5.2, 0.35);
  armL.rotation.set(-0.75, -0.2, 0.45);
  statueGroup.add(armL);

  const forearmLGeo = new THREE.CylinderGeometry(0.15, 0.18, 1.3, 12);
  disposables.push(forearmLGeo);
  const forearmL = new THREE.Mesh(forearmLGeo, matWhiteJade);
  forearmL.position.set(-0.35, 4.85, 0.85);
  forearmL.rotation.set(-1.15, -0.4, 0.65);
  statueGroup.add(forearmL);

  // Bình Cam Lộ (Tịnh bình ngọc)
  const vaseGroup = new THREE.Group();
  vaseGroup.position.set(-0.08, 4.75, 1.15);
  vaseGroup.rotation.set(0.65, 0, 0.15); // Nghiêng miệng bình chúc xuống

  const vaseBodyGeo = new THREE.SphereGeometry(0.28, 16, 12);
  disposables.push(vaseBodyGeo);
  const vaseBody = new THREE.Mesh(vaseBodyGeo, matJadePolished);
  vaseBody.scale.set(0.85, 1.4, 0.85);
  vaseGroup.add(vaseBody);

  const vaseNeckGeo = new THREE.CylinderGeometry(0.09, 0.16, 0.45, 14);
  disposables.push(vaseNeckGeo);
  const vaseNeck = new THREE.Mesh(vaseNeckGeo, matJadePolished);
  vaseNeck.position.set(0, 0.42, 0);
  vaseGroup.add(vaseNeck);

  const vaseRimGeo = new THREE.TorusGeometry(0.11, 0.03, 8, 16);
  disposables.push(vaseRimGeo);
  const vaseRim = new THREE.Mesh(vaseRimGeo, matGoldHalo);
  vaseRim.position.set(0, 0.64, 0);
  vaseRim.rotation.x = Math.PI / 2;
  vaseGroup.add(vaseRim);

  statueGroup.add(vaseGroup);

  // 5.8. VẦNG HÀO QUANG KÉP (DOUBLE MANDALA HALO) PHÍA SAU LƯNG
  // Vòng ngoài lớn (đường kính ~6.2m), vòng trong (đường kính ~3.6m)
  const haloGroup = new THREE.Group();
  haloGroup.position.set(0, 5.8, -0.65);

  const haloOuterGeo = new THREE.TorusGeometry(3.1, 0.14, 16, 48);
  disposables.push(haloOuterGeo);
  const haloOuter = new THREE.Mesh(haloOuterGeo, matGoldHalo);
  haloGroup.add(haloOuter);

  const haloInnerGeo = new THREE.TorusGeometry(1.85, 0.10, 14, 36);
  disposables.push(haloInnerGeo);
  const haloInner = new THREE.Mesh(haloInnerGeo, matGoldHalo);
  haloGroup.add(haloInner);

  // Đĩa hào quang xuyên sáng mây cuộn
  const haloDiscGeo = new THREE.CircleGeometry(3.05, 36);
  disposables.push(haloDiscGeo);
  const matHaloDisc = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfde047,
    emissiveIntensity: 0.28,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  disposables.push(matHaloDisc);
  const haloDisc = new THREE.Mesh(haloDiscGeo, matHaloDisc);
  haloGroup.add(haloDisc);

  // Mây phiêu bồng hai bên vòng hào quang
  for (let mc = 0; mc < 6; mc++) {
    const side = mc % 2 === 0 ? 1 : -1;
    const cloudHGeo = new THREE.SphereGeometry(0.45 + (mc % 3) * 0.15, 8, 8);
    disposables.push(cloudHGeo);
    const cloudH = new THREE.Mesh(cloudHGeo, matJadePolished);
    cloudH.position.set(side * (2.8 + (mc % 2) * 0.4), (mc - 2.5) * 1.1, -0.1);
    cloudH.scale.set(1.4, 0.7, 1.0);
    haloGroup.add(cloudH);
  }

  // Điểm sáng ấm tỏa ra từ vòng hào quang
  const haloLight = new THREE.PointLight(0xfef08a, 1.8, 22.0, 1.5);
  haloLight.position.set(0, 6.2, 0.5);
  statueGroup.add(haloLight);
  if (nightLightsRef) {
    nightLightsRef.current.push(haloLight);
  }

  statueGroup.add(haloGroup);
  shrineGroup.add(statueGroup);

  // =========================================================================
  // 6. DÒNG NƯỚC CAM LỘ RÓT RÓC RÁCH XUỐNG HỒ SEN (CAM LỘ NECTAR CASCADE)
  // Tọa độ miệng bình trong shrineGroup: (x = -0.08, y = topPadY + 0.14 + 4.75 + 0.6 = ~8.27m, z = poolCenterZ + 1.15 = 3.65m)
  // Mặt nước hồ sen: Y = 0.58 + 0.08 = 0.66m
  // =========================================================================
  const pourStartX = -0.08;
  const pourStartY = topPadY + 0.14 + 4.75 + 0.55; // ~8.22m
  const pourStartZ = poolCenterZ + 1.15; // ~3.65m

  const pourTargetX = 0;
  const pourTargetY = 0.58 + 0.15; // Ngay trên mặt hồ sen
  const pourTargetZ = poolCenterZ + 1.35; // Rơi xuống mặt hồ

  // 6.1. Dải băng nước cam lộ uốn lượn cong tự nhiên
  const streamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(pourStartX, pourStartY, pourStartZ),
    new THREE.Vector3(pourStartX + 0.05, pourStartY - 1.8, pourStartZ + 0.12),
    new THREE.Vector3(pourStartX - 0.02, pourStartY - 4.2, pourStartZ + 0.18),
    new THREE.Vector3(pourTargetX, pourTargetY, pourTargetZ),
  ]);
  const streamGeo = new THREE.TubeGeometry(streamCurve, 32, 0.085, 8, false);
  disposables.push(streamGeo);
  const waterStreamMesh = new THREE.Mesh(streamGeo, matWaterStream);
  shrineGroup.add(waterStreamMesh);

  // 6.2. Hạt nước Cam Lộ rơi theo chu kỳ (32 hạt ZERO-ALLOCATION)
  const WATER_DROP_COUNT = 32;
  const waterDropPos = new Float32Array(WATER_DROP_COUNT * 3);
  const waterDropVel = new Float32Array(WATER_DROP_COUNT); // Vận tốc rơi riêng từng hạt
  const waterDropProg = new Float32Array(WATER_DROP_COUNT); // Tiến độ từ 0.0 đến 1.0

  for (let d = 0; d < WATER_DROP_COUNT; d++) {
    waterDropProg[d] = Math.random();
    waterDropVel[d] = 0.35 + Math.random() * 0.3;
    const pt = streamCurve.getPoint(waterDropProg[d]);
    waterDropPos[d * 3] = pt.x + (Math.random() - 0.5) * 0.08;
    waterDropPos[d * 3 + 1] = pt.y;
    waterDropPos[d * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.08;
  }

  const waterParticlesGeo = new THREE.BufferGeometry();
  waterParticlesGeo.setAttribute('position', new THREE.BufferAttribute(waterDropPos, 3));
  disposables.push(waterParticlesGeo);

  const matWaterParticle = new THREE.PointsMaterial({
    color: 0xe0f2fe,
    size: 0.16,
    transparent: true,
    opacity: 0.88,
  });
  disposables.push(matWaterParticle);

  const waterParticles = new THREE.Points(waterParticlesGeo, matWaterParticle);
  shrineGroup.add(waterParticles);

  // =========================================================================
  // 7. HƯƠNG ÁN CẨM THẠCH, ĐẠI LƯ HƯƠNG ĐỒNG TAM BẢO & BỒ ĐOÀN HOA SEN
  // Đặt tại sảnh trước tượng Quán Âm (Z = -4.5 đến -6.5 tương đối với shrineGroup)
  // Tọa độ thế giới: Altar tại (33.0, 0.58, 36.5), Lư hương tại (33.0, 0.58, 35.5)
  // =========================================================================
  const altarRelZ = -4.5;

  // Bàn hương án cẩm thạch trắng
  const altarTableGeo = new THREE.BoxGeometry(4.2, 0.95, 1.4);
  disposables.push(altarTableGeo);
  const altarTable = new THREE.Mesh(altarTableGeo, matMarblePlaza);
  altarTable.position.set(0, 0.58 + 0.95 * 0.5, altarRelZ);
  altarTable.receiveShadow = true;
  altarTable.castShadow = true;
  shrineGroup.add(altarTable);

  // Khăn trải bàn thờ gấm thêu hoa sen vàng
  const altarClothGeo = new THREE.BoxGeometry(4.24, 0.04, 1.44);
  disposables.push(altarClothGeo);
  const altarCloth = new THREE.Mesh(altarClothGeo, matCushion);
  altarCloth.position.set(0, 0.58 + 0.95 + 0.02, altarRelZ);
  shrineGroup.add(altarCloth);

  // Bình hoa sen đồng hai bên bàn thờ
  for (const sx of [-1.5, 1.5]) {
    const vaseG = new THREE.CylinderGeometry(0.18, 0.12, 0.65, 12);
    disposables.push(vaseG);
    const vaseM = new THREE.Mesh(vaseG, matBronzeBurner);
    vaseM.position.set(sx, 0.58 + 0.95 + 0.35, altarRelZ);
    shrineGroup.add(vaseM);

    // Bông sen cắm bình
    const bLotusG = new THREE.ConeGeometry(0.12, 0.3, 6);
    disposables.push(bLotusG);
    const bLotus = new THREE.Mesh(bLotusG, matLotusPedalPink);
    bLotus.position.set(sx, 0.58 + 0.95 + 0.75, altarRelZ);
    shrineGroup.add(bLotus);
  }

  // Đĩa ngũ quả thanh tịnh giữa bàn thờ
  const fruitPlateG = new THREE.CylinderGeometry(0.38, 0.28, 0.08, 16);
  disposables.push(fruitPlateG);
  const fruitPlate = new THREE.Mesh(fruitPlateG, matGoldHalo);
  fruitPlate.position.set(0, 0.58 + 0.95 + 0.06, altarRelZ);
  shrineGroup.add(fruitPlate);

  // Đại Lư Hương Đồng Tam Bảo (Tripod Bronze Incense Burner) tại Z = altarRelZ - 1.2
  const burnerRelZ = altarRelZ - 1.2;
  const burnerGroup = new THREE.Group();
  burnerGroup.position.set(0, 0.58, burnerRelZ);

  // Thân lư tròn phình bụng
  const burnerBodyGeo = new THREE.SphereGeometry(0.65, 16, 12);
  disposables.push(burnerBodyGeo);
  const burnerBody = new THREE.Mesh(burnerBodyGeo, matBronzeBurner);
  burnerBody.position.set(0, 0.85, 0);
  burnerBody.scale.set(1.15, 0.85, 1.15);
  burnerGroup.add(burnerBody);

  // Vành miệng lư hương
  const burnerRimGeo = new THREE.TorusGeometry(0.68, 0.08, 8, 20);
  disposables.push(burnerRimGeo);
  const burnerRim = new THREE.Mesh(burnerRimGeo, matBronzeBurner);
  burnerRim.position.set(0, 1.25, 0);
  burnerRim.rotation.x = Math.PI / 2;
  burnerGroup.add(burnerRim);

  // Ba chân kiềng vững chãi đỡ đáy lư
  for (let leg = 0; leg < 3; leg++) {
    const lAng = (leg / 3) * Math.PI * 2 + Math.PI / 6;
    const legGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.55, 8);
    disposables.push(legGeo);
    const legMesh = new THREE.Mesh(legGeo, matBronzeBurner);
    legMesh.position.set(Math.cos(lAng) * 0.45, 0.28, Math.sin(lAng) * 0.45);
    legMesh.rotation.z = -Math.cos(lAng) * 0.25;
    legMesh.rotation.x = Math.sin(lAng) * 0.25;
    burnerGroup.add(legMesh);
  }

  // Quai rồng hai bên thân lư
  for (const qx of [-0.78, 0.78]) {
    const handleGeo = new THREE.TorusGeometry(0.24, 0.06, 6, 12);
    disposables.push(handleGeo);
    const handle = new THREE.Mesh(handleGeo, matBronzeBurner);
    handle.position.set(qx, 0.95, 0);
    handle.rotation.y = Math.PI / 2;
    burnerGroup.add(handle);
  }

  // 3 Nén nhang trầm cắm trong lư hương
  for (let ic = 0; ic < 3; ic++) {
    const stickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.75, 4);
    disposables.push(stickGeo);
    const matIncense = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
    disposables.push(matIncense);
    const stick = new THREE.Mesh(stickGeo, matIncense);
    stick.position.set((ic - 1) * 0.14, 1.35, 0);
    burnerGroup.add(stick);

    // Đầu nhang đỏ lửa
    const tipGeo = new THREE.SphereGeometry(0.025, 4, 4);
    disposables.push(tipGeo);
    const matTip = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    disposables.push(matTip);
    const tip = new THREE.Mesh(tipGeo, matTip);
    tip.position.set((ic - 1) * 0.14, 1.72, 0);
    burnerGroup.add(tip);
  }

  shrineGroup.add(burnerGroup);

  // 7.2. Khói trầm bốc lên từ lư hương (24 hạt ZERO-ALLOCATION)
  const SMOKE_COUNT = 24;
  const smokePos = new Float32Array(SMOKE_COUNT * 3);
  const smokeProg = new Float32Array(SMOKE_COUNT);

  for (let s = 0; s < SMOKE_COUNT; s++) {
    smokeProg[s] = Math.random();
    smokePos[s * 3] = (Math.random() - 0.5) * 0.25;
    smokePos[s * 3 + 1] = 0.58 + 1.72 + smokeProg[s] * 2.8;
    smokePos[s * 3 + 2] = burnerRelZ + (Math.random() - 0.5) * 0.25;
  }

  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
  disposables.push(smokeGeo);

  const matSmoke = new THREE.PointsMaterial({
    color: 0xd1d5db,
    size: 0.28,
    transparent: true,
    opacity: 0.45,
  });
  disposables.push(matSmoke);

  const incenseSmoke = new THREE.Points(smokeGeo, matSmoke);
  shrineGroup.add(incenseSmoke);

  // 7.3. Hàng Bồ Đoàn Hoa Sen Quỳ Lạy (Lotus Cushions for prostration)
  // Xếp 3 bồ đoàn tại Z = burnerRelZ - 1.8 (Tọa độ thế giới: Z = 34.5)
  const cushionRelZ = burnerRelZ - 1.8;
  const cushionPositionsWorld: THREE.Vector3[] = [];

  [-1.6, 0, 1.6].forEach((cx) => {
    const cushionGroup = new THREE.Group();
    cushionGroup.position.set(cx, 0.58, cushionRelZ);

    const padGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.16, 20);
    disposables.push(padGeo);
    const padMesh = new THREE.Mesh(padGeo, matCushion);
    padMesh.position.y = 0.08;
    cushionGroup.add(padMesh);

    // Cánh sen vàng thêu viền bồ đoàn
    for (let cp = 0; cp < 8; cp++) {
      const cpAng = (cp / 8) * Math.PI * 2;
      const cPetalGeo = new THREE.SphereGeometry(0.12, 6, 6);
      disposables.push(cPetalGeo);
      const cPetal = new THREE.Mesh(cPetalGeo, matLotusPedalPink);
      cPetal.position.set(Math.cos(cpAng) * 0.55, 0.08, Math.sin(cpAng) * 0.55);
      cPetal.scale.set(1.0, 0.5, 1.0);
      cushionGroup.add(cPetal);
    }

    shrineGroup.add(cushionGroup);
    cushionPositionsWorld.push(new THREE.Vector3(33.0 + cx, 0.58, 42.0 + cushionRelZ));
  });

  // =========================================================================
  // 8. ĐÈN ĐÁ & BÀN PHÁT NHANG (STONE LANTERNS & INCENSE DESK)
  // =========================================================================
  // 2 Đèn đá phong cách thiền góc phía trước sảnh
  [[-9.5, -9.5], [9.5, -9.5]].forEach(([lx, lz]) => {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(lx, 0.58, lz);

    const lBaseGeo = new THREE.BoxGeometry(0.7, 0.35, 0.7);
    disposables.push(lBaseGeo);
    const lBase = new THREE.Mesh(lBaseGeo, matBalustrade);
    lanternGroup.add(lBase);

    const lPoleGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.2, 8);
    disposables.push(lPoleGeo);
    const lPole = new THREE.Mesh(lPoleGeo, matBalustrade);
    lPole.position.y = 0.75;
    lanternGroup.add(lPole);

    const lHouseGeo = new THREE.BoxGeometry(0.65, 0.55, 0.65);
    disposables.push(lHouseGeo);
    const lHouse = new THREE.Mesh(lHouseGeo, matBalustrade);
    lHouse.position.y = 1.6;
    lanternGroup.add(lHouse);

    const lRoofGeo = new THREE.ConeGeometry(0.6, 0.45, 4);
    disposables.push(lRoofGeo);
    const lRoof = new THREE.Mesh(lRoofGeo, matBalustrade);
    lRoof.position.y = 2.1;
    lRoof.rotation.y = Math.PI / 4;
    lanternGroup.add(lRoof);

    // Ánh sáng đèn đá ban đêm
    const lanternLight = new THREE.PointLight(0xfef08a, 0.85, 9.0);
    lanternLight.position.set(0, 1.6, 0);
    lanternGroup.add(lanternLight);
    if (nightLightsRef) {
      nightLightsRef.current.push(lanternLight);
    }

    shrineGroup.add(lanternGroup);
  });

  // Bàn phát nhang trầm bên Tây-Bắc sảnh (X = -7.0, Z = -8.0 tương đối => Thế giới: 26.0, 34.0)
  const deskGroup = new THREE.Group();
  deskGroup.position.set(-7.0, 0.58, -8.0);

  const deskTableGeo = new THREE.BoxGeometry(2.0, 0.85, 0.9);
  disposables.push(deskTableGeo);
  const deskTable = new THREE.Mesh(deskTableGeo, materials.matWoodLim ?? matMarblePlaza);
  deskTable.position.y = 0.85 * 0.5;
  deskTable.receiveShadow = true;
  deskGroup.add(deskTable);

  // Ống đựng nhang và đĩa lễ trên bàn
  const incenseVesselGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.42, 12);
  disposables.push(incenseVesselGeo);
  const incenseVessel = new THREE.Mesh(incenseVesselGeo, matBronzeBurner);
  incenseVessel.position.set(-0.55, 0.85 + 0.21, 0);
  deskGroup.add(incenseVessel);

  // Bó nhang thơm
  const incenseBundleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 8);
  disposables.push(incenseBundleGeo);
  const matBundle = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
  disposables.push(matBundle);
  const incenseBundle = new THREE.Mesh(incenseBundleGeo, matBundle);
  incenseBundle.position.set(-0.55, 0.85 + 0.35, 0);
  deskGroup.add(incenseBundle);

  shrineGroup.add(deskGroup);

  // =========================================================================
  // 9. VÒNG LẶP HOẠT ẢNH HOÀN TOÀN ZERO-ALLOCATION (60 FPS)
  // Cập nhật dòng nước Cam Lộ, hạt nước rơi và khói trầm in-place
  // =========================================================================
  let waterAnimTime = 0;

  const update = (delta: number, _stepCount: number) => {
    waterAnimTime += delta;

    // 1. Dòng nước uốn lượn nhẹ
    const streamScale = 1.0 + Math.sin(waterAnimTime * 3.5) * 0.04;
    waterStreamMesh.scale.set(streamScale, 1.0, streamScale);

    // 2. Hạt nước Cam Lộ rơi
    const wPositions = waterParticlesGeo.attributes.position.array as Float32Array;
    for (let d = 0; d < WATER_DROP_COUNT; d++) {
      waterDropProg[d] += delta * waterDropVel[d];
      if (waterDropProg[d] >= 1.0) {
        waterDropProg[d] -= 1.0;
      }
      const pt = streamCurve.getPoint(waterDropProg[d]);
      wPositions[d * 3] = pt.x + Math.sin(waterAnimTime * 6.0 + d) * 0.04;
      wPositions[d * 3 + 1] = pt.y;
      wPositions[d * 3 + 2] = pt.z + Math.cos(waterAnimTime * 6.0 + d) * 0.04;
    }
    waterParticlesGeo.attributes.position.needsUpdate = true;

    // 3. Khói trầm bốc lên
    const sPositions = smokeGeo.attributes.position.array as Float32Array;
    for (let s = 0; s < SMOKE_COUNT; s++) {
      smokeProg[s] += delta * 0.18;
      if (smokeProg[s] >= 1.0) {
        smokeProg[s] -= 1.0;
        sPositions[s * 3] = (Math.sin(s * 1.5) * 0.12);
        sPositions[s * 3 + 2] = burnerRelZ + (Math.cos(s * 1.5) * 0.12);
      }
      sPositions[s * 3 + 1] = 0.58 + 1.72 + smokeProg[s] * 2.6;
      // Khói lượn nhẹ theo gió
      sPositions[s * 3] += Math.sin(waterAnimTime * 2.0 + s) * 0.003;
      sPositions[s * 3 + 2] += Math.cos(waterAnimTime * 1.8 + s) * 0.003;
    }
    smokeGeo.attributes.position.needsUpdate = true;
  };

  const dispose = () => {
    disposables.forEach((item) => {
      item.dispose();
    });
  };

  return {
    group: shrineGroup,
    waterStreamMesh,
    waterParticles,
    incenseSmoke,
    altarPosition: new THREE.Vector3(33.0, 0.58, 42.0 + burnerRelZ),
    cushionPositions: cushionPositionsWorld,
    incenseAttendantPos: new THREE.Vector3(33.0 - 7.0, 0.58, 42.0 - 8.0),
    caretakerPos: new THREE.Vector3(33.0 + 4.0, 0.58, 42.0 - 4.5),
    haloLight,
    update,
    dispose,
  };
}
